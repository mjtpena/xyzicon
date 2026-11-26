import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = fileURLToPath(new URL("../", import.meta.url));

export async function inspectRaster(svg) {
  const originalViewBox = 'width="128" height="128" viewBox="0 0 128 128"';
  const expanded = svg.replace(originalViewBox, 'width="144" height="144" viewBox="-8 -8 144 144"');
  if (expanded === svg) throw new Error("Unexpected stencil SVG viewBox.");

  const [small, large] = await Promise.all([
    sharp(Buffer.from(svg), { density: 192 }).resize(32, 32, { fit: "contain" })
      .ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
    sharp(Buffer.from(expanded)).ensureAlpha().raw().toBuffer({ resolveWithObject: true }),
  ]);
  if (small.info.width !== 32 || small.info.height !== 32 || small.info.channels !== 4 ||
      large.info.width !== 144 || large.info.height !== 144 || large.info.channels !== 4)
    throw new Error("Unexpected stencil raster format.");

  let visiblePixels = 0;
  for (let offset = 0; offset < small.data.length; offset += 4) {
    const minChannel = Math.min(small.data[offset], small.data[offset + 1], small.data[offset + 2]);
    if ((255 - minChannel) * small.data[offset + 3] / 255 > 16) visiblePixels++;
  }
  let overflowPixels = 0;
  for (let y = 0; y < 144; y++) for (let x = 0; x < 144; x++) {
    if (x >= 8 && x < 136 && y >= 8 && y < 136) continue;
    if (large.data[(y * 144 + x) * 4 + 3] > 16) overflowPixels++;
  }
  return { visiblePixels, overflowPixels };
}

export async function checkCatalog(rootDir) {
  const webRoot = path.resolve(rootDir, "wwwroot");
  const catalog = JSON.parse(await readFile(path.join(webRoot, "stencils", "catalog.json"), "utf8"));
  if (!Array.isArray(catalog.items) || !catalog.items.length) throw new Error("Stencil catalog is empty or invalid.");
  const failures = [];
  for (const item of catalog.items) {
    if (typeof item.id !== "string" || typeof item.path !== "string")
      throw new Error("Invalid stencil catalog item.");
    const file = path.resolve(webRoot, item.path);
    if (!file.startsWith(webRoot + path.sep)) throw new Error(`Invalid stencil path: ${item.path}`);
    const svg = await readFile(file, "utf8");
    const result = await inspectRaster(svg);
    if (!result.visiblePixels || result.overflowPixels) failures.push({ id: item.id, ...result });
  }
  return { checked: catalog.items.length, failures };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv.length !== 2) throw new Error("Usage: node tools/check-stencil-raster.mjs");
  const result = await checkCatalog(root);
  for (const failure of result.failures)
    console.error(`${failure.id}: ${failure.visiblePixels} visible 32px pixels, ${failure.overflowPixels} outside-viewBox pixels`);
  console.log(`Checked ${result.checked} stencils; ${result.failures.length} raster failures.`);
  console.log("This does not assess recognizability, distinctness, or visual review.");
  if (result.failures.length) process.exitCode = 1;
}
