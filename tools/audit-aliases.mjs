import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { artwork } from "../stencils/artwork.mjs";
import { resolveSources, silhouetteSimilarity, packMask } from "./build-stencils.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const providers = ["azure", "aws", "gcp", "fabric", "entra", "microsoft365", "powerplatform", "dynamics365"];
const catalogs = Object.fromEntries(await Promise.all(providers.map(async (provider) =>
  [provider, JSON.parse(await readFile(path.join(root, "wwwroot", "data", `${provider}.json`), "utf8"))])));
const aliases = resolveSources(artwork, catalogs);

const hash = (value) => createHash("sha256").update(Buffer.from(value)).digest("hex");

function normalizedGeometrySignature(svg) {
  const text = svg.toString("utf8");
  const viewBox = text.match(/\bviewBox=["']([-\d.\s]+)["']/i)?.[1].trim().split(/\s+/).map(Number);
  const scale = viewBox?.length === 4 ? Math.max(Math.abs(viewBox[2]), Math.abs(viewBox[3])) : 1;
  const primitives = [];
  for (const match of text.matchAll(/<(path|rect|circle|ellipse|line|polygon|polyline)\b([^>]*)>/gi)) {
    const [, tag, attributes] = match;
    const geometry = {};
    for (const name of ["d", "points", "x", "y", "x1", "y1", "x2", "y2", "cx", "cy", "r", "rx", "ry", "width", "height"]) {
      const value = attributes.match(new RegExp(`\\b${name}=["']([^"']+)["']`, "i"))?.[1];
      if (value !== undefined) geometry[name] = value.replace(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi,
        (number) => String(Math.round(Number(number) / scale * 10000) / 10000));
    }
    if (Object.keys(geometry).length) primitives.push([tag.toLowerCase(), geometry]);
  }
  return hash(JSON.stringify(primitives));
}

async function sourceMask(source) {
  const file = path.resolve(root, "wwwroot", source.replace(/^\/+/, ""));
  const svg = await readFile(file);
  try {
    const pixels = await sharp(svg)
      .flatten({ background: "#fff" })
      .trim({ background: "#fff", threshold: 10 })
      .resize(64, 64, { fit: "contain", background: "#fff" })
      .greyscale()
      .raw()
      .toBuffer();
    return packMask(pixels);
  } catch {
    return null;
  }
}

const compositionMasks = [];
const sourceMasks = new Map();
const sourceGeometry = new Map();
for (let i = 0; i < artwork.length; i++) {
  const item = artwork[i];
  const masks = [];
  for (const source of aliases[i]) {
    let mask = sourceMasks.get(source);
    if (!mask) {
      mask = await sourceMask(source);
      sourceMasks.set(source, mask);
    }
    let geometry = sourceGeometry.get(source);
    if (!geometry) {
      geometry = normalizedGeometrySignature(await readFile(path.resolve(root, "wwwroot", source.replace(/^\/+/, ""))));
      sourceGeometry.set(source, geometry);
    }
    masks.push({ source, mask, geometry });
  }
  compositionMasks.push({ item, masks });
}

const mismatches = [];
const rasterCandidates = [];
for (const group of compositionMasks) {
  const geometryKeys = new Set(group.masks.map((entry) => entry.geometry));
  if (geometryKeys.size > 1) {
    const variants = [...geometryKeys].length;
    mismatches.push({
      id: group.item.id,
      name: group.item.name,
      provider: group.item.provider,
      sourceCount: group.masks.length,
      distinctNormalizedGeometry: variants,
      variantSources: [...geometryKeys].map((geometry) =>
        group.masks.filter((entry) => entry.geometry === geometry).map((entry) => entry.source).slice(0, 12)),
    });
  }
  const valid = group.masks.filter((entry) => entry.mask);
  if (valid.length < 2) continue;
  const comparisons = [];
  for (let i = 0; i < valid.length; i++) {
    for (let j = i + 1; j < valid.length; j++) {
      if (valid[i].mask.length !== valid[j].mask.length) continue;
      const similarity = silhouetteSimilarity(valid[i].mask, valid[j].mask);
      comparisons.push({ a: valid[i].source, b: valid[j].source, similarity });
    }
  }
  const low = comparisons.filter((pair) => pair.similarity < 0.995);
  if (low.length) {
    rasterCandidates.push({
      id: group.item.id,
      name: group.item.name,
      provider: group.item.provider,
      sourceCount: valid.length,
      minimumSimilarity: Math.min(...comparisons.map((pair) => pair.similarity)),
      lowest: low.sort((a, b) => a.similarity - b.similarity).slice(0, 20),
    });
  }
}

const exactGroups = new Map();
for (const group of compositionMasks) {
  const maskKeys = new Set();
  for (const entry of group.masks) {
    if (!entry.mask) continue;
    const key = hash(Uint32Array.from(entry.mask).buffer);
    maskKeys.add(key);
  }
  for (const key of maskKeys) {
    if (!exactGroups.has(key)) exactGroups.set(key, []);
    exactGroups.get(key).push(group.item.id);
  }
}
const crossCompositionMatches = [...exactGroups.values()]
  .map((ids) => [...new Set(ids)])
  .filter((ids) => ids.length > 1)
  .sort((a, b) => b.length - a.length || a.join("|").localeCompare(b.join("|")))
  .map((ids) => ({
    ids,
    names: ids.map((id) => artwork.find((item) => item.id === id)?.name),
  }));

const exactGeometryGroups = new Map();
for (const group of compositionMasks) {
  const keys = new Set(group.masks.map((entry) => entry.geometry));
  for (const key of keys) {
    if (!exactGeometryGroups.has(key)) exactGeometryGroups.set(key, []);
    exactGeometryGroups.get(key).push(group.item.id);
  }
}
const crossCompositionGeometryMatches = [...exactGeometryGroups.values()]
  .map((ids) => [...new Set(ids)])
  .filter((ids) => ids.length > 1)
  .sort((a, b) => b.length - a.length || a.join("|").localeCompare(b.join("|")))
  .map((ids) => ({
    ids,
    names: ids.map((id) => artwork.find((item) => item.id === id)?.name),
  }));

const report = {
  method: "Normalized monochrome source SVG silhouette at 64px; <0.995 within-composition raster similarity is a mismatch candidate.",
  sourceEntries: compositionMasks.reduce((count, group) => count + group.masks.length, 0),
  compositions: artwork.length,
  mismatchCandidates: mismatches,
  rasterMismatchCandidates: rasterCandidates,
  exactCrossCompositionMaskGroups: crossCompositionMatches,
  exactCrossCompositionGeometryGroups: crossCompositionGeometryMatches,
};

await writeFile(path.join(root, "alias-audit.json"), JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify({
  compositions: report.compositions,
  sourceEntries: report.sourceEntries,
  mismatchCandidates: mismatches.length,
  rasterMismatchCandidates: rasterCandidates.length,
  exactCrossCompositionMaskGroups: crossCompositionMatches.length,
  exactCrossCompositionGeometryGroups: crossCompositionGeometryMatches.length,
}, null, 2));
