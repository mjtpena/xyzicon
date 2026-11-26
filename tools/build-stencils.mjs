import { createHash } from "node:crypto";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import rough from "roughjs/bundled/rough.cjs.js";
import sharp from "sharp";
import { artwork, accents } from "../stencils/artwork.mjs";

const root = fileURLToPath(new URL("../", import.meta.url));
const output = path.join(root, "wwwroot", "stencils");
const reviewFile = path.join(root, "stencils", "reviews.json");
const pairReviewFile = path.join(root, "stencils", "pair-reviews.json");
const generator = rough.generator();
const hash = (value) => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const normalizedSvgRevision = (value) =>
  createHash("sha256").update(value.toString("utf8").replace(/\r\n/g, "\n")).digest("hex");
const json = (value) => JSON.stringify(value, null, 2) + "\n";
const escape = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const seed = (id) => (parseInt(hash(id).slice(0, 8), 16) & 0x7fffffff) || 1;

export function validateArtwork(entries) {
  const ids = new Set();
  for (const item of entries) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) || ids.has(item.id))
      throw new Error(`Invalid or repeated drawing ID: ${item.id}`);
    ids.add(item.id);
    if (!accents[item.provider] || !item.name || !item.rationale || !item.sourceNames.length)
      throw new Error(`Incomplete drawing: ${item.id}`);
    if (!item.shapes.length) throw new Error(`Empty drawing: ${item.id}`);
    for (const shape of item.shapes) {
      if (!["rectangle", "ellipse", "line"].includes(shape.type))
        throw new Error(`Unsupported primitive in ${item.id}`);
      const points = shape.type === "line" ? shape.points
        : [[shape.x, shape.y], [shape.x + shape.w, shape.y + shape.h]];
      if (!Array.isArray(points) || points.length < 2 ||
          points.some((p) => p.length !== 2 || p.some((n) => !Number.isFinite(n) || n < 6 || n > 122)) ||
          (shape.type !== "line" && (shape.w <= 0 || shape.h <= 0)))
        throw new Error(`Invalid or clipped geometry in ${item.id}`);
    }
  }
}

export function resolveSources(entries, catalogs) {
  const owners = new Map();
  return entries.map((item) => {
    const sources = catalogs[item.provider].Icons.filter((icon) => item.sourceNames.includes(icon.name));
    for (const name of item.sourceNames) {
      if (!sources.some((s) => s.name === name))
        throw new Error(`${item.id}: missing source ${name}; review the alias mapping after refresh.`);
    }
    for (const source of sources) {
      if (owners.has(source.path)) throw new Error(`Ambiguous alias: ${source.path}`);
      owners.set(source.path, item.id);
    }
    return sources.map((s) => s.path).sort();
  });
}

// Compare compositions without names, colours, fill, seed, translation or scale.
export function geometrySignature(item) {
  const points = item.shapes.flatMap((s) => s.type === "line" ? s.points
    : [[s.x, s.y], [s.x + s.w, s.y + s.h]]);
  const minX = Math.min(...points.map((p) => p[0]));
  const minY = Math.min(...points.map((p) => p[1]));
  const size = Math.max(
    Math.max(...points.map((p) => p[0])) - minX,
    Math.max(...points.map((p) => p[1])) - minY,
  );
  const number = (n) => Math.round(n / size * 10000);
  return hash(item.shapes.map((s) => s.type === "line"
    ? [s.type, s.points.map(([x, y]) => [number(x - minX), number(y - minY)])]
    : [s.type, number(s.x - minX), number(s.y - minY), number(s.w), number(s.h)])
    .map(JSON.stringify).sort());
}

export function toElements(item) {
  return item.shapes.map((s, i) => {
    const xs = s.points?.map((p) => p[0]);
    const ys = s.points?.map((p) => p[1]);
    const x = xs ? xs[0] : s.x;
    const y = ys ? ys[0] : s.y;
    return {
      id: `${item.id}-${i}`, type: s.type, x, y,
      width: xs ? Math.max(...xs) - Math.min(...xs) : s.w,
      height: ys ? Math.max(...ys) - Math.min(...ys) : s.h,
      angle: 0, strokeColor: "#1e1e1e",
      backgroundColor: s.fill ? accents[item.provider] : "transparent",
      fillStyle: "hachure", strokeWidth: 1.7, strokeStyle: "solid",
      roughness: 2, opacity: 100, groupIds: [item.id],
      frameId: null, roundness: null, seed: seed(`${item.id}-${i}`),
      version: 1, versionNonce: seed(`${item.id}-${i}-version`),
      isDeleted: false, boundElements: null, updated: 1, link: null, locked: false,
      ...(s.type === "line" ? {
        points: s.points.map(([px, py]) => [px - x, py - y]),
        startBinding: null, endBinding: null, startArrowhead: null, endArrowhead: null,
        lastCommittedPoint: null,
      } : {}),
    };
  });
}

export function renderSvg(item, monochrome = false) {
  const paths = item.shapes.flatMap((s, i) => {
    const options = {
      seed: monochrome ? 1 : seed(`${item.id}-${i}`),
      roughness: monochrome ? 0 : 2, stroke: "#1e1e1e", strokeWidth: 1.7,
      fill: !monochrome && s.fill ? accents[item.provider] : undefined,
      fillStyle: "hachure", hachureGap: 5, fillWeight: 0.8,
      disableMultiStroke: monochrome, fixedDecimalPlaceDigits: 3,
    };
    let drawing;
    if (s.type === "rectangle") drawing = generator.rectangle(s.x, s.y, s.w, s.h, options);
    else if (s.type === "ellipse") drawing = generator.ellipse(s.x + s.w / 2, s.y + s.h / 2, s.w, s.h, options);
    // Rough.js rotates polygon points in place during hatching. Never give it authored coordinates.
    else if (s.fill) drawing = generator.polygon(s.points.slice(0, -1).map((p) => [...p]), options);
    else drawing = generator.linearPath(s.points.map((p) => [...p]), options);
    return generator.toPaths(drawing).map((p) =>
      `<path d="${p.d}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" fill="${p.fill}" stroke-linecap="round" stroke-linejoin="round"/>`);
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" role="img"><title>${escape(item.name)} - independent sketch</title>${paths.join("")}</svg>\n`;
}

export async function validateAliasEvidence(evidence, artwork, aliases, rootOverride = root) {
  if (!evidence || evidence.scope !== "Microsoft 365 source aliases only; all group members visually compared for concept/theme, not artwork review" &&
      evidence.scope !== "Google Cloud multi-source aliases only; all group members visually compared for concept/theme, not artwork review" &&
      evidence.scope !== "Entra multi-source aliases only; all group members visually compared for concept/theme, not artwork review" &&
      evidence.scope !== "Azure source aliases only for same-filename entries in multiple directories; all group members visually compared for concept/theme, not artwork review" &&
      evidence.scope !== "Azure source aliases only for verified synonymous names; all group members visually compared for concept/theme, not artwork review" &&
      evidence.scope !== "Fabric source alias groups only; visually compared group members at 42px; artwork review not included")
    throw new Error("Invalid source-alias evidence scope.");
  if (!Array.isArray(evidence.groups) || !evidence.groups.length)
    throw new Error("Source-alias evidence has no groups.");

  const byId = new Map(artwork.map((item, index) => [item.id, { item, sources: aliases[index] }]));
  for (const group of evidence.groups) {
    if (!group.id || !Array.isArray(group.sources) || !group.sources.length)
      throw new Error("Invalid source-alias evidence group.");
    const current = byId.get(group.id);
    if (!current) throw new Error(`Stale source-alias evidence: unknown composition ${group.id}.`);
    const expected = [...group.sources.map((source) => source.path)].sort();
    const actual = [...current.sources].sort();
    if (JSON.stringify(expected) !== JSON.stringify(actual))
      throw new Error(`Stale source-alias evidence: mapped sources changed for ${group.id}.`);
    for (const source of group.sources) {
      if (!source.path || !/^[a-f0-9]{64}$/.test(source.revision))
        throw new Error(`Invalid source-alias evidence revision for ${group.id}.`);
      const file = path.resolve(rootOverride, "wwwroot", source.path.replace(/^\/+/, ""));
      if (!file.startsWith(path.join(rootOverride, "wwwroot", "icons") + path.sep))
        throw new Error(`Unsafe source-alias evidence path: ${source.path}`);
      const content = (await readFile(file, "utf8")).replace(/\r\n/g, "\n");
      if (hash(content) !== source.revision)
        throw new Error(`Stale source-alias evidence: SVG source changed for ${group.id}: ${source.path}`);
    }
  }
}

export function mergeReviews(current, incoming, revisions, comparisons) {
  const merged = { ...current };
  for (const [id, review] of Object.entries(incoming)) {
    if (!review || typeof review !== "object" || !revisions[id] || review.revision !== revisions[id] ||
        !comparisons[id] || review.comparisonRevision !== comparisons[id])
      throw new Error(`Stale or unknown review: ${id}. Reload the review sheet.`);
    if (!["approved", "rework", "pending"].includes(review.status) ||
        typeof review.notes !== "string" ||
        (review.status === "rework" && !review.notes.trim()))
      throw new Error(`Invalid review: ${id}; rework needs actionable notes.`);
    if (review.status === "pending" && current[id]?.status !== "pending" && current[id] &&
        currentReview(current[id], revisions[id], comparisons[id]).review === "pending")
      continue;
    merged[id] = { revision: review.revision, comparisonRevision: review.comparisonRevision,
      status: review.status, notes: review.notes };
  }
  return merged;
}

export function currentReview(review, revision, comparisonRevision) {
  if (!review || review.revision !== revision ||
      (review.status === "approved" && review.comparisonRevision !== comparisonRevision))
    return { review: "pending", notes: "" };
  if (!["approved", "rework", "pending"].includes(review.status) ||
      typeof review.notes !== "string" ||
      (review.status === "rework" && !review.notes.trim()))
    throw new Error("Invalid saved drawing review.");
  return { review: review.status, notes: review.notes };
}

export function comparisonRevisionFor(id, pairs, revisions, sources) {
  const neighbors = pairs.map((pair) => {
    const other = pair.a === id ? pair.b : pair.a;
    return [other, revisions[other]];
  });
  return hash({ neighbors, sources });
}

export const pairKey = (a, b) => [a, b].sort().join("|");

export function mergePairReviews(current, incoming, revisions, flaggedPairs) {
  const flagged = new Set(flaggedPairs.map(({ a, b }) => pairKey(a, b)));
  const merged = { ...current };
  for (const [key, review] of Object.entries(incoming)) {
    if (!review || typeof review !== "object" || typeof review.a !== "string" ||
        typeof review.b !== "string" || review.a === review.b ||
        key !== pairKey(review.a, review.b) || !flagged.has(key) ||
        !revisions[review.a] || !revisions[review.b] ||
        review.revisionA !== revisions[review.a] || review.revisionB !== revisions[review.b])
      throw new Error(`Stale or unknown pair review: ${key}. Reload the review sheet.`);
    if (!["distinct", "rework", "pending"].includes(review.status) ||
        typeof review.notes !== "string" ||
        (review.status !== "pending" && !review.notes.trim()))
      throw new Error(`Invalid pair review: ${key}; distinct and rework decisions need notes.`);
    merged[key] = { a: review.a, b: review.b, revisionA: review.revisionA,
      revisionB: review.revisionB, status: review.status, notes: review.notes };
  }
  return merged;
}

export function currentPairReview(pair, reviews, revisions) {
  const key = pairKey(pair.a, pair.b);
  const review = reviews[key];
  const current = review && review.revisionA === revisions[review.a] &&
    review.revisionB === revisions[review.b] && pairKey(review.a, review.b) === key;
  if (!current) return { review: "pending", notes: "" };
  if (!["distinct", "rework", "pending"].includes(review.status) ||
      typeof review.notes !== "string" || (review.status !== "pending" && !review.notes.trim()))
    throw new Error(`Invalid saved pair review: ${key}.`);
  return { review: review.status, notes: review.notes };
}

export async function validateIndependentReview(qa, items, sourceRevisions, nearest, revisions, rootOverride = root) {
  const file = path.join(rootOverride, "stencils", "independent-review-state.json");
  let state;
  try { state = JSON.parse(await readFile(file, "utf8")); }
  catch (error) { if (error.code === "ENOENT") throw new Error("Independent review state is missing."); throw error; }
  await validateIndependentReviewRecords(state, qa, items, sourceRevisions, nearest, revisions, rootOverride);
  if (state.status !== "complete")
    throw new Error(`Independent audit incomplete: ${state.status}; ${state.compositionsReviewed || 0}/${qa.count} compositions independently reviewed.`);
  if (state.compositionsReviewed !== qa.count)
    throw new Error(`Independent audit count mismatch: ${state.compositionsReviewed}/${qa.count}.`);
  if (!Array.isArray(state.reviews) || state.reviews.length !== qa.count)
    throw new Error("Independent audit records are incomplete.");
}

export async function validateIndependentReviewPartial(qa, items, sourceRevisions, nearest, revisions, rootOverride = root) {
  const file = path.join(rootOverride, "stencils", "independent-review-state.json");
  let state;
  try { state = JSON.parse(await readFile(file, "utf8")); }
  catch (error) { if (error.code === "ENOENT") throw new Error("Independent review state is missing."); throw error; }
  await validateIndependentReviewRecords(state, qa, items, sourceRevisions, nearest, revisions, rootOverride);
  return state;
}

async function validateIndependentReviewRecords(state, qa, items, sourceRevisions, nearest, revisions, rootOverride = root) {
  if (!state || !["in-progress", "complete"].includes(state.status))
    throw new Error("Independent audit state status is invalid.");
  if (state.compositionCount !== qa.count)
    throw new Error(`Independent audit composition count mismatch: ${state.compositionCount}/${qa.count}.`);
  if (!Array.isArray(state.reviews))
    throw new Error("Independent audit records are incomplete.");
  if (!Number.isInteger(state.compositionsReviewed) ||
      state.compositionsReviewed !== state.reviews.length ||
      state.compositionsReviewed > qa.count)
    throw new Error("Independent audit partial count mismatch.");
  if (state.status === "complete" && state.compositionsReviewed !== qa.count)
    throw new Error(`Independent audit count mismatch: ${state.compositionsReviewed}/${qa.count}.`);
  const catalogIds = new Set(items.map((item) => item.id));
  const reviewIds = new Set(state.reviews.map((review) => review.id));
  if (reviewIds.size !== state.reviews.length)
    throw new Error("Independent audit contains duplicate composition records.");
  if ([...reviewIds].some((id) => !catalogIds.has(id)))
    throw new Error("Independent audit contains unknown composition records.");
  for (const review of state.reviews) {
    if (!review.id || review.status !== "approved")
      throw new Error("Independent audit has unapproved or malformed composition records.");
    const item = items.find((candidate) => candidate.id === review.id);
    if (!item) throw new Error(`Independent audit unknown composition: ${review.id}`);
    if (review.drawingRevision !== item.revision)
      throw new Error(`Independent audit stale drawing revision: ${review.id}`);
    if (review.comparisonRevision !== item.comparisonRevision)
      throw new Error(`Independent audit stale comparison revision: ${review.id}`);
    if (!Array.isArray(review.sourceRevisions))
      throw new Error(`Independent audit missing source revisions: ${review.id}`);
    if (JSON.stringify(review.sourceRevisions) !== JSON.stringify(sourceRevisions[review.id]))
      throw new Error(`Independent audit stale source revisions: ${review.id}`);
    if (typeof review.svgRevision !== "string")
      throw new Error(`Independent audit missing target SVG revision: ${review.id}`);
    const targetSvg = await readFile(path.join(rootOverride, "wwwroot", "stencils", `${review.id}.svg`));
    if (review.svgRevision !== normalizedSvgRevision(targetSvg))
      throw new Error(`Independent audit stale target SVG: ${review.id}`);
    if (!Array.isArray(review.reviewedSizes) ||
        JSON.stringify([...review.reviewedSizes].sort((a, b) => a - b)) !== JSON.stringify([32, 64, 128]))
      throw new Error(`Independent audit missing 128/64/32 evidence: ${review.id}`);
    if (!Array.isArray(review.neighborDecisions))
      throw new Error(`Independent audit missing semantic-neighbor decisions: ${review.id}`);
    if (!["automated-and-manual", "manual", "none"].includes(review.semanticNeighborCoverage))
      throw new Error(`Independent audit missing semantic-neighbor coverage mode: ${review.id}`);
    const expectedAutomatedNeighbors = (nearest[review.id] || [])
      .map((pair) => pair.a === review.id ? pair.b : pair.a);
    const actualNeighbors = new Set(review.neighborDecisions.map((decision) => decision.id));
    if (review.semanticNeighborCoverage === "none") {
      if (expectedAutomatedNeighbors.length !== 0)
        throw new Error(`Independent audit no-neighbor coverage conflicts with automated neighbors: ${review.id}`);
      if (review.neighborDecisions.length !== 0 ||
          typeof review.semanticNeighborReason !== "string" ||
          !review.semanticNeighborReason.trim())
        throw new Error(`Independent audit invalid no-neighbor justification: ${review.id}`);
    } else {
      for (const neighborId of expectedAutomatedNeighbors) {
        if (!actualNeighbors.has(neighborId))
          throw new Error(`Independent audit missing automated semantic-neighbor decision: ${review.id} -> ${neighborId}`);
      }
      if (review.neighborDecisions.length === 0)
        throw new Error(`Independent audit missing semantic-neighbor decisions: ${review.id}`);
    }
    for (const decision of review.neighborDecisions) {
      if (decision.status !== "approved" || typeof decision.reason !== "string" || !decision.reason.trim())
        throw new Error(`Independent audit unapproved or reasonless neighbor decision: ${review.id}`);
      if (decision.revision !== revisions[decision.id])
        throw new Error(`Independent audit stale neighbor revision: ${review.id} -> ${decision.id}`);
      if (typeof decision.svgRevision !== "string")
        throw new Error(`Independent audit missing neighbor SVG revision: ${review.id} -> ${decision.id}`);
      const neighborSvg = await readFile(path.join(rootOverride, "wwwroot", "stencils", `${decision.id}.svg`));
      if (decision.svgRevision !== normalizedSvgRevision(neighborSvg))
        throw new Error(`Independent audit stale neighbor SVG: ${review.id} -> ${decision.id}`);
    }
  }
}

export function validateRelease(qa, args) {
  const unresolvedPairs = qa.flaggedPairs.filter((pair) => pair.review !== "distinct");
  if (args.includes("--approved") && (qa.needsReview.length || unresolvedPairs.length))
    throw new Error(`Release blocked: ${qa.needsReview.length} unapproved drawings, ${unresolvedPairs.length} unresolved similar pairs.`);
  const missing = Object.values(qa.coverage).reduce((sum, item) => sum + item.sources - item.covered, 0);
  if (args.includes("--complete") && missing)
    throw new Error(`Complete catalog blocked: ${missing} source entries have no drawing.`);
}

export async function writeOrCheckOutputs(outputs, outputDir, check) {
  for (const [name, content] of outputs) {
    const file = path.join(outputDir, name);
    if (check) {
      if (await readFile(file, "utf8") !== content) throw new Error(`Stale output: ${name}; run npm run stencils.`);
    } else {
      await mkdir(outputDir, { recursive: true });
      await writeFile(file, content);
    }
  }
}

export function packMask(pixels) {
  const mask = new Uint32Array(Math.ceil(pixels.length / 32));
  for (let i = 0; i < pixels.length; i++) {
    if (pixels[i] < 180) mask[i >>> 5] |= 1 << (i & 31);
  }
  return mask;
}

function popcount(value) {
  value -= (value >>> 1) & 0x55555555;
  value = (value & 0x33333333) + ((value >>> 2) & 0x33333333);
  return (((value + (value >>> 4)) & 0x0f0f0f0f) * 0x01010101) >>> 24;
}

export function silhouetteSimilarity(a, b) {
  if (a.length !== b.length) throw new Error("Cannot compare masks with different dimensions.");
  let intersection = 0, union = 0;
  for (let i = 0; i < a.length; i++) {
    intersection += popcount(a[i] & b[i]);
    union += popcount(a[i] | b[i]);
  }
  if (!union) throw new Error("Cannot compare blank silhouettes.");
  return +(intersection / union).toFixed(4);
}

async function optionalJson(file) {
  try { return JSON.parse(await readFile(file, "utf8")); }
  catch (error) { if (error.code === "ENOENT") return {}; throw error; }
}

export async function build(args = []) {
  validateArtwork(artwork);
  const catalogs = {};
  for (const provider of Object.keys(accents)) {
    catalogs[provider] = JSON.parse(await readFile(path.join(root, "wwwroot", "data", `${provider}.json`), "utf8"));
  }
  const aliases = resolveSources(artwork, catalogs);
  for (const evidenceName of [
    "m365-alias-evidence.json",
    "gcp-alias-evidence.json",
    "entra-alias-evidence.json",
    "azure-same-name-evidence.json",
    "azure-named-alias-evidence.json",
    "fabric-alias-evidence.json",
  ]) {
    const evidence = JSON.parse(await readFile(path.join(root, "stencils", evidenceName), "utf8"));
    await validateAliasEvidence(evidence, artwork, aliases, root);
  }
  const revisions = Object.fromEntries(artwork.map((a) =>
    [a.id, hash({ artwork: a, svg: renderSvg(a), elements: toElements(a) })]));
  let reviews = await optionalJson(reviewFile);
  let pairReviews = await optionalJson(pairReviewFile);
  let incomingReviews = null;
  let incomingPairs = null;
  if (args.includes("--reviews")) {
    const file = args[args.indexOf("--reviews") + 1];
    if (!file || file.startsWith("--")) throw new Error("Usage: npm run stencils:review -- <downloaded-reviews.json>");
    const incoming = JSON.parse(await readFile(file, "utf8"));
    if (incoming.version !== undefined) {
      if (incoming.version !== 2 || !incoming.drawings || Array.isArray(incoming.drawings) ||
          typeof incoming.drawings !== "object" || !incoming.pairs || Array.isArray(incoming.pairs) ||
          typeof incoming.pairs !== "object")
        throw new Error("Invalid review export: expected version 2 drawings and pairs.");
      incomingReviews = incoming.drawings;
      incomingPairs = incoming.pairs;
    } else {
      incomingReviews = incoming;
    }
  }
  const outputs = new Map();
  const masks = [];
  const signatures = new Map();
  const sourceRevisions = {};
  const items = [];
  for (const [index, item] of artwork.entries()) {
    const signature = geometrySignature(item);
    if (signatures.has(signature)) throw new Error(`Duplicate composition: ${item.id} and ${signatures.get(signature)}`);
    signatures.set(signature, item.id);
    sourceRevisions[item.id] = [];
    for (const source of aliases[index]) {
      const sourceFile = path.resolve(root, "wwwroot", source.replace(/^\/+/, ""));
      if (!sourceFile.startsWith(path.join(root, "wwwroot", "icons") + path.sep))
        throw new Error(`Unsafe source path: ${source}`);
      const sourceContent = await readFile(sourceFile, "utf8");
      sourceRevisions[item.id].push([source, hash(sourceContent.replace(/\r\n/g, "\n"))]);
    }
    const svg = renderSvg(item);
    outputs.set(`${item.id}.svg`, svg);
    // Rasterize monochrome, unjittered outlines so colour and roughness cannot hide duplicates.
    const mask = await sharp(Buffer.from(renderSvg(item, true)))
      .flatten({ background: "#fff" }).trim({ background: "#fff", threshold: 10 })
      .resize(64, 64, { fit: "contain", background: "#fff" })
      .greyscale().raw().toBuffer();
    if (!mask.some((v) => v < 180)) throw new Error(`Blank render: ${item.id}`);
    masks.push(packMask(mask));
    items.push({
      id: item.id, provider: item.provider, name: item.name, rationale: item.rationale,
      path: `stencils/${item.id}.svg`, sources: aliases[index],
      revision: revisions[item.id], geometrySignature: signature,
    });
  }
  const flaggedPairs = [];
  const nearest = Object.fromEntries(items.map((item) => [item.id, []]));
  const comparePairs = (a, b) => b.similarity - a.similarity ||
    a.a.localeCompare(b.a) || a.b.localeCompare(b.b);
  for (let a = 0; a < items.length; a++) {
    for (let b = a + 1; b < items.length; b++) {
      const pair = { a: items[a].id, b: items[b].id,
        similarity: silhouetteSimilarity(masks[a], masks[b]) };
      if (pair.similarity >= 0.65) flaggedPairs.push(pair);
      for (const id of [pair.a, pair.b]) {
        const closest = nearest[id];
        if (closest.length < 3 || comparePairs(pair, closest[closest.length - 1]) < 0) {
          closest.push(pair);
          closest.sort(comparePairs);
          if (closest.length > 3) closest.pop();
        }
      }
    }
  }
  flaggedPairs.sort(comparePairs);
  const comparisons = Object.fromEntries(items.map((item) =>
    [item.id, comparisonRevisionFor(item.id, nearest[item.id], revisions, sourceRevisions[item.id])]));
  if (incomingReviews) reviews = mergeReviews(reviews, incomingReviews, revisions, comparisons);
  for (const item of items) {
    item.comparisonRevision = comparisons[item.id];
    Object.assign(item, currentReview(reviews[item.id], item.revision, item.comparisonRevision));
  }
  if (incomingPairs) pairReviews = mergePairReviews(pairReviews, incomingPairs, revisions, flaggedPairs);
  for (const pair of flaggedPairs) {
    Object.assign(pair, currentPairReview(pair, pairReviews, revisions));
  }
  const qa = {
    method: "64px normalized monochrome outline intersection-over-union; not proof of semantic uniqueness",
    threshold: 0.65, count: items.length, aliases: aliases.flat().length,
    approved: items.filter((i) => i.review === "approved").length,
    needsReview: items.filter((i) => i.review !== "approved").map((i) => i.id),
    flaggedPairs,
    coverage: Object.fromEntries(Object.keys(accents).map((provider) => {
      const covered = items.filter((item) => item.provider === provider)
        .reduce((count, item) => count + item.sources.length, 0);
      return [provider, { sources: catalogs[provider].Icons.length, covered,
        concepts: items.filter((item) => item.provider === provider).length }];
    })),
    nearest,
  };
  const library = (entries) => ({
    type: "excalidrawlib", version: 2, source: "https://excalidraw.com",
    libraryItems: entries.map((a) => ({
      id: a.id, name: a.name, status: "unpublished", created: 1, elements: toElements(a),
    })),
  });
  outputs.set("catalog.json", json({ version: 1, items }));
  outputs.set("qa.json", json(qa));
  outputs.set("all.excalidrawlib", json(library(artwork)));
  outputs.set("microsoft-pilot.excalidrawlib", json(library(artwork.filter((a) => !["aws", "gcp"].includes(a.provider)))));
  for (const provider of Object.keys(accents))
    outputs.set(`${provider}.excalidrawlib`, json(library(artwork.filter((a) => a.provider === provider))));

  if (args.includes("--independent"))
    await validateIndependentReview(qa, items, sourceRevisions, qa.nearest, revisions, root);
  if (args.includes("--independent-partial"))
    await validateIndependentReviewPartial(qa, items, sourceRevisions, qa.nearest, revisions, root);
  validateRelease(qa, args);
  await writeOrCheckOutputs(outputs, output, args.includes("--check"));
  if (args.includes("--reviews")) {
    await writeFile(reviewFile, json(reviews));
    if (incomingPairs) await writeFile(pairReviewFile, json(pairReviews));
  }
  console.log(`${items.length} distinct compositions, ${qa.aliases} source aliases; ${qa.approved} approved. ${args.includes("--check") ? "Outputs match." : "Review at stencils/review.html."}`);
  return { items, qa };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  build(process.argv.slice(2)).catch((error) => { console.error(error.message); process.exitCode = 1; });
}
