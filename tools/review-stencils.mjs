import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));
const normalize = (value) => value.toString("utf8").replace(/\r\n/g, "\n");
const hashSource = (value) => createHash("sha256").update(JSON.stringify(normalize(value))).digest("hex");
const hashSvg = (value) => createHash("sha256").update(normalize(value)).digest("hex");
const hashSvgLegacy = (value) => createHash("sha256").update(JSON.stringify(normalize(value))).digest("hex");
const escape = (value) => String(value).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

function assetPath(rootDir, asset) {
  const webRoot = path.resolve(rootDir, "wwwroot");
  const file = path.resolve(webRoot, asset.replace(/^[/\\]+/, ""));
  if (!file.startsWith(webRoot + path.sep))
    throw new Error(`Invalid asset path: ${asset}`);
  return file;
}

function label(text, x, y) {
  const parts = String(text).match(/.{1,24}/g) || [""];
  return parts.slice(0, 3).map((part, i) =>
    `<text x="${x}" y="${y + i * 14}">${escape(part)}</text>`).join("");
}

export function normalizeSvgForRaster(svg) {
  const text = svg.toString("utf8").replace(/\r\n/g, "\n");
  return text
    .replace(/fill\s*=\s*["']currentColor["']/gi, 'fill="#111111"')
    .replace(/stroke\s*=\s*["']currentColor["']/gi, 'stroke="#111111"')
    .replace(/\bcolor\s*=\s*["']currentColor["']/gi, 'color="#111111"');
}

async function raster(svg, size) {
  const normalized = normalizeSvgForRaster(svg);
  return sharp(Buffer.from(normalized), { density: 192 })
    .resize(size, size, { fit: "contain" }).png().toBuffer();
}

export async function inspectSourceRender(svg) {
  const normalized = Buffer.from(normalizeSvgForRaster(svg));
  const result = await sharp(normalized, { density: 192 })
    .resize(64, 64, { fit: "contain" }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let visiblePixels = 0;
  let maxAlpha = 0;
  for (let offset = 0; offset < result.data.length; offset += 4) {
    maxAlpha = Math.max(maxAlpha, result.data[offset + 3]);
    if (result.data[offset + 3] > 32) visiblePixels++;
  }
  return {
    visiblePixels,
    maxAlpha,
    warning: visiblePixels < 64 || maxAlpha <= 32
      ? "Source thumbnail is effectively invisible or luminance-mask/unresolved in this renderer."
      : null,
  };
}

export async function makeReviewSheets(rootDir, selections, outputDir) {
  const [catalog, qa] = await Promise.all([
    readFile(path.join(rootDir, "wwwroot", "stencils", "catalog.json"), "utf8").then(JSON.parse),
    readFile(path.join(rootDir, "wwwroot", "stencils", "qa.json"), "utf8").then(JSON.parse),
  ]);
  if (!Array.isArray(selections) || !selections.length)
    throw new Error("Select at least one drawing.");
  const items = new Map(catalog.items.map((item) => [item.id, item]));
  const seen = new Set();
  for (const selection of selections) {
    if (!selection || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(selection.id) ||
        !items.has(selection.id) || seen.has(selection.id))
      throw new Error(`Unknown or repeated drawing: ${selection?.id}`);
    seen.add(selection.id);
    if (!Array.isArray(selection.semanticNeighbors) ||
        new Set(selection.semanticNeighbors).size !== selection.semanticNeighbors.length ||
        selection.semanticNeighbors.some((id) => !items.has(id) || id === selection.id))
      throw new Error(`Invalid semantic neighbors for ${selection.id}.`);
    if (!Array.isArray(qa.nearest[selection.id]))
      throw new Error(`Missing nearest-neighbor data for ${selection.id}.`);
  }

  const records = [];
  const sheets = [];
  for (const { id, semanticNeighbors } of selections) {
    const item = items.get(id);
    if (!item.sources.length) throw new Error(`Missing sources for ${id}.`);
    const automatic = qa.nearest[id].map((pair) => {
      if (pair.a !== id && pair.b !== id) throw new Error(`Invalid nearest-neighbor data for ${id}.`);
      const neighbor = pair.a === id ? pair.b : pair.a;
      if (!items.has(neighbor) || neighbor === id) throw new Error(`Unknown neighbor ${neighbor}.`);
      return neighbor;
    });
    const neighbors = [...new Set([...automatic, ...semanticNeighbors])];
    const sourceRevisions = [];
    const sourceImages = [];
    const sourceRenderDiagnostics = [];
    for (const source of item.sources) {
      const file = assetPath(rootDir, source);
      const svg = await readFile(file);
      sourceRevisions.push([source, hashSource(svg)]);
      sourceImages.push(await raster(svg, 64));
      const diagnostic = await inspectSourceRender(svg);
      sourceRenderDiagnostics.push({ path: source, ...diagnostic });
    }
    const drawing = await readFile(assetPath(rootDir, item.path));
    const neighborImages = await Promise.all(neighbors.map(async (neighborId) =>
      readFile(assetPath(rootDir, items.get(neighborId).path))));

    const width = 1050;
    const columns = 6;
    const sourceRows = Math.ceil(sourceImages.length / columns);
    const neighborRows = Math.ceil(neighbors.length / columns);
    const stencilY = 44 + sourceRows * 125;
    const neighborY = stencilY + 190;
    const height = neighborY + neighborRows * 130 + 25;
    const layers = [];
    const text = [
      `<text x="12" y="23" font-size="16" font-weight="bold">${escape(id)}: all mapped sources</text>`,
      `<text x="12" y="${stencilY + 20}" font-size="16" font-weight="bold">Drawing at 128, 64 and 32 pixels</text>`,
      `<text x="12" y="${neighborY + 20}" font-size="16" font-weight="bold">Nearest and semantic neighbors at 64 and 32 pixels</text>`,
    ];
    for (const [index, source] of item.sources.entries()) {
      const x = 12 + index % columns * 172;
      const y = 44 + Math.floor(index / columns) * 125;
      layers.push({ input: sourceImages[index], left: x, top: y });
      text.push(label(path.posix.basename(source.replaceAll("\\", "/")), x, y + 80));
    }
    for (const [x, size] of [[12, 128], [160, 64], [240, 32]])
      layers.push({ input: await raster(drawing, size), left: x, top: stencilY + 30 });
    for (const [index, neighborId] of neighbors.entries()) {
      const x = 12 + index % columns * 172;
      const y = neighborY + 30 + Math.floor(index / columns) * 130;
      layers.push({ input: await raster(neighborImages[index], 64), left: x, top: y });
      layers.push({ input: await raster(neighborImages[index], 32), left: x + 72, top: y });
      text.push(label(neighborId, x, y + 78));
      text.push(`<text x="${x}" y="${y + 120}">${automatic.includes(neighborId) ? "nearest" : ""}${automatic.includes(neighborId) && semanticNeighbors.includes(neighborId) ? " + " : ""}${semanticNeighbors.includes(neighborId) ? "semantic" : ""}</text>`);
    }
    layers.push({
      input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}"><g fill="#222" font-family="Arial" font-size="11">${text.join("")}</g></svg>`),
      left: 0, top: 0,
    });
    const sheet = await sharp({ create: { width, height, channels: 4, background: "#fff" } })
      .composite(layers).png().toBuffer();
    sheets.push({ id, sheet });
    records.push({
      id, drawingRevision: item.revision, comparisonRevision: item.comparisonRevision,
      svgRevision: hashSvg(drawing),
      svgRevisionLegacy: hashSvgLegacy(drawing),
      sourceRevisions, renderedSizes: [128, 64, 32],
      sourceRenderDiagnostics,
      neighbors: neighbors.map((neighborId, index) => ({
        id: neighborId, revision: items.get(neighborId).revision,
        svgRevision: hashSvg(neighborImages[index]),
        svgRevisionLegacy: hashSvgLegacy(neighborImages[index]),
        automatic: automatic.includes(neighborId), semantic: semanticNeighbors.includes(neighborId),
      })),
    });
  }
  await mkdir(outputDir);
  for (const { id, sheet } of sheets)
    await writeFile(path.join(outputDir, `${id}.png`), sheet, { flag: "wx" });
  await writeFile(path.join(outputDir, "manifest.json"), JSON.stringify(records, null, 2) + "\n", { flag: "wx" });
  return records;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [, , selectionFile, outputDir] = process.argv;
  if (!selectionFile || !outputDir || process.argv.length !== 4)
    throw new Error("Usage: node tools/review-stencils.mjs <selection.json> <new-output-directory>");
  const selections = JSON.parse(await readFile(selectionFile, "utf8"));
  const records = await makeReviewSheets(root, selections, outputDir);
  console.log(`Created ${records.length} comparison sheets; no review decisions were recorded.`);
}
