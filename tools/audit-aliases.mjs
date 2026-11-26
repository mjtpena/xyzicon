import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { artwork } from "../stencils/artwork.mjs";
import { resolveSources, silhouetteSimilarity } from "./build-stencils.mjs";

export const root = fileURLToPath(new URL("../", import.meta.url));
const providers = ["azure", "aws", "gcp", "fabric", "entra", "microsoft365", "powerplatform", "dynamics365"];
const hash = (value) => createHash("sha256").update(Buffer.from(value)).digest("hex");

export function normalizedGeometrySignature(svg, source = "unknown SVG") {
  const text = svg.toString("utf8");
  if (/<(?:use|symbol|defs|clipPath|mask)\b/i.test(text) ||
      /\b(?:transform|style)\s*=/.test(text)) {
    return {
      signature: null,
      unsupported: "SVG transform, use, defs, clip, mask, or style construct",
    };
  }

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
  if (!primitives.length) {
    throw new Error(`Empty or unsupported primitive geometry in ${source}`);
  }
  return { signature: hash(JSON.stringify(primitives)), unsupported: null };
}

export function rasterPreprocessingStatus(svg, source = "unknown SVG") {
  const text = svg.toString("utf8");
  const viewBox = text.match(/\bviewBox=["']([-\d.\s]+)["']/i)?.[1].trim().split(/\s+/).map(Number);
  if (viewBox?.length === 4) {
    const [, , viewWidth, viewHeight] = viewBox;
    for (const match of text.matchAll(/<rect\b([^>]*)>/gi)) {
      const attributes = match[1];
      const get = (name) => attributes.match(new RegExp(`\\b${name}=["']([^"']+)["']`, "i"))?.[1];
      const x = Number(get("x") ?? 0);
      const y = Number(get("y") ?? 0);
      const width = Number(get("width"));
      const height = Number(get("height"));
      const fill = get("fill");
      if (Number.isFinite(width) && Number.isFinite(height) &&
          x <= 0 && y <= 0 && width >= viewWidth && height >= viewHeight &&
          fill && fill !== "none" && !fill.startsWith("url(")) {
        return { supported: false, reason: `Opaque full-canvas background in ${source}` };
      }
    }
  }
  return { supported: true, reason: "Alpha silhouette preserves transparent/light artwork without flattening it into an opaque background" };
}

export async function sourceMask(source, rootOverride = root) {
  const file = path.resolve(rootOverride, "wwwroot", source.replace(/^\/+/, ""));
  let svg;
  try {
    svg = await readFile(file);
  } catch (error) {
    throw new Error(`Source unreadable ${source}: ${error.message}`);
  }
  const preprocessing = rasterPreprocessingStatus(svg, source);
  if (!preprocessing.supported) {
    throw new Error(preprocessing.reason);
  }
  let pixels;
  try {
    pixels = await sharp(svg)
      .ensureAlpha()
      .resize(64, 64, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .raw()
      .toBuffer();
  } catch (error) {
    throw new Error(`Raster audit failed for ${source}: ${error.message}`);
  }
  let visiblePixels = 0;
  for (let i = 3; i < pixels.length; i += 4) {
    if (pixels[i] > 0) visiblePixels++;
  }
  if (!visiblePixels) {
    throw new Error(`Blank raster audit result for ${source}`);
  }
  return packAlphaMask(pixels);
}

export function packAlphaMask(rgba) {
  const pixelCount = 64 * 64;
  if (rgba.length !== pixelCount * 4) {
    throw new Error(`Expected 64x64 RGBA pixels, received ${rgba.length} bytes`);
  }
  const mask = new Uint32Array(Math.ceil(pixelCount / 32));
  for (let pixel = 0; pixel < pixelCount; pixel++) {
    if (rgba[pixel * 4 + 3] > 0) {
      mask[pixel >>> 5] |= 1 << (pixel & 31);
    }
  }
  return mask;
}

export async function runAliasAudit(rootOverride = root) {
  const catalogs = Object.fromEntries(await Promise.all(providers.map(async (provider) =>
    [provider, JSON.parse(await readFile(path.join(rootOverride, "wwwroot", "data", `${provider}.json`), "utf8"))])));
  const aliases = resolveSources(artwork, catalogs);

  const compositionMasks = [];
  const sourceMasks = new Map();
  const sourceGeometry = new Map();
  const unsupportedSources = [];
  const unsupportedRasterSources = [];
  for (let i = 0; i < artwork.length; i++) {
    const item = artwork[i];
    const masks = [];
    for (const source of aliases[i]) {
      let svg;
      try {
        svg = await readFile(path.resolve(rootOverride, "wwwroot", source.replace(/^\/+/, "")));
      } catch (error) {
        throw new Error(`Source unreadable ${source}: ${error.message}`);
      }
      let geometry = sourceGeometry.get(source);
      if (!geometry) {
        geometry = normalizedGeometrySignature(svg, source);
        sourceGeometry.set(source, geometry);
        if (geometry.unsupported) {
          unsupportedSources.push({ source, reason: geometry.unsupported });
        }
      }
      let mask = sourceMasks.get(source);
      if (!mask) {
        try {
          mask = await sourceMask(source, rootOverride);
          sourceMasks.set(source, mask);
        } catch (error) {
          if (/Opaque full-canvas background/.test(error.message) ||
              (geometry.unsupported && /Blank raster audit result/.test(error.message))) {
            unsupportedRasterSources.push({ source, reason: error.message });
          } else {
            throw error;
          }
        }
      }
      masks.push({ source, mask, geometry });
    }
    compositionMasks.push({ item, masks });
  }

  const mismatchCandidates = [];
  const rasterCandidates = [];
  for (const group of compositionMasks) {
    const supported = group.masks.filter((entry) => entry.geometry.signature && entry.mask);
    const geometryKeys = new Set(supported.map((entry) => entry.geometry.signature));
    if (geometryKeys.size > 1) {
      mismatchCandidates.push({
        id: group.item.id,
        name: group.item.name,
        provider: group.item.provider,
        sourceCount: supported.length,
        distinctNormalizedGeometry: geometryKeys.size,
        variantSources: [...geometryKeys].map((signature) =>
          supported.filter((entry) => entry.geometry.signature === signature).map((entry) => entry.source).slice(0, 12)),
      });
    }
    if (supported.length < 2) continue;
    const comparisons = [];
    for (let i = 0; i < supported.length; i++) {
      for (let j = i + 1; j < supported.length; j++) {
        const similarity = silhouetteSimilarity(supported[i].mask, supported[j].mask);
        comparisons.push({ a: supported[i].source, b: supported[j].source, similarity });
      }
    }
    const low = comparisons.filter((pair) => pair.similarity < 0.995);
    if (low.length) {
      rasterCandidates.push({
        id: group.item.id,
        name: group.item.name,
        provider: group.item.provider,
        sourceCount: supported.length,
        minimumSimilarity: Math.min(...comparisons.map((pair) => pair.similarity)),
        lowest: low.sort((a, b) => a.similarity - b.similarity).slice(0, 20),
      });
    }
  }

  const exactCrossGeometryGroups = new Map();
  for (const group of compositionMasks) {
    const keys = new Set(group.masks
      .map((entry) => entry.geometry.signature)
      .filter(Boolean));
    for (const key of keys) {
      if (!exactCrossGeometryGroups.has(key)) exactCrossGeometryGroups.set(key, []);
      exactCrossGeometryGroups.get(key).push(group.item.id);
    }
  }
  const crossCompositionGeometryMatches = [...exactCrossGeometryGroups.values()]
    .map((ids) => [...new Set(ids)])
    .filter((ids) => ids.length > 1)
    .sort((a, b) => b.length - a.length || a.join("|").localeCompare(b.join("|")))
    .map((ids) => ({
      ids,
      names: ids.map((id) => artwork.find((item) => item.id === id)?.name),
      proofStatus: "Triage-only: exact normalized primitive geometry, but semantic/name evidence still required",
    }));

  return {
    method: "Raster silhouette at 64px plus normalized primitive geometry; normalized geometry is triage only and is excluded for unsupported SVG constructs.",
    sourceEntries: compositionMasks.reduce((count, group) => count + group.masks.length, 0),
    compositions: artwork.length,
    mismatchCandidates,
    rasterMismatchCandidates: rasterCandidates,
    exactCrossCompositionGeometryGroups: crossCompositionGeometryMatches,
    unsupportedSources: [...new Map(unsupportedSources.map((item) => [item.source, item])).values()],
    unsupportedRasterSources: [...new Map(unsupportedRasterSources.map((item) => [item.source, item])).values()],
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runAliasAudit().then(async (report) => {
    await writeFile(path.join(root, "alias-audit.json"), JSON.stringify(report, null, 2) + "\n");
    console.log(JSON.stringify({
      compositions: report.compositions,
      sourceEntries: report.sourceEntries,
      mismatchCandidates: report.mismatchCandidates.length,
      rasterMismatchCandidates: report.rasterMismatchCandidates.length,
      exactCrossCompositionGeometryGroups: report.exactCrossCompositionGeometryGroups.length,
      unsupportedSources: report.unsupportedSources.length,
      unsupportedRasterSources: report.unsupportedRasterSources.length,
    }, null, 2));
  }).catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
