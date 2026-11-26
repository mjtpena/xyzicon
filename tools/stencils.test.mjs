import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { createHash } from "node:crypto";
import vm from "node:vm";
import { artwork } from "../stencils/artwork.mjs";
import { validateArtwork, geometrySignature, mergeReviews, currentReview, comparisonRevisionFor, mergePairReviews, currentPairReview, pairKey, resolveSources, renderSvg, toElements, validateRelease, packMask, silhouetteSimilarity, validateAliasEvidence, validateIndependentReview, validateIndependentReviewPartial } from "./build-stencils.mjs";
import { normalizedGeometrySignature, sourceMask, packAlphaMask, rasterPreprocessingStatus, splitCandidateSupport } from "./audit-aliases.mjs";

test("pilot drawings have unique, bounded geometry and editable, deterministic exports", () => {
  validateArtwork(artwork);
  const signatures = artwork.map(geometrySignature);
  assert.equal(new Set(signatures).size, artwork.length);
  for (const item of artwork) {
    const before = JSON.stringify(item);
    const elements = toElements(item);
    assert.equal(elements.length, item.shapes.length);
    assert.ok(elements.every((e) => ["rectangle", "ellipse", "line"].includes(e.type)));
    assert.equal(new Set(elements.map((e) => e.id)).size, elements.length);
    assert.equal(renderSvg(item), renderSvg(item));
    assert.equal(JSON.stringify(item), before, "rendering must not mutate the authored geometry");
    for (const e of elements.filter((e) => e.type === "line"))
      assert.deepEqual(e.points[0], [0, 0]);
    assert.doesNotMatch(renderSvg(item), /<image|<filter|<text/);
  }
});

test("uniqueness ignores labels, colours, seed, shape order, translation and scale", () => {
  const original = artwork[0];
  const renamed = { ...original, id: "other", name: "other", provider: "fabric",
    shapes: original.shapes.toReversed().map((s) => s.type === "line"
      ? { ...s, fill: !s.fill, points: s.points.map(([x, y]) => [2 * x + 10, 2 * y + 20]) }
      : { ...s, x: 2 * s.x + 10, y: 2 * s.y + 20, w: s.w * 2, h: s.h * 2 }) };
  assert.equal(geometrySignature(original), geometrySignature(renamed));
  assert.notEqual(geometrySignature(artwork.at(-1)), geometrySignature(artwork.at(-2)));
});

test("source aliases retain every variant and fail on missing or ambiguous mapping", () => {
  const item = { ...artwork[0], sourceNames: ["VM"] };
  const catalogs = { azure: { Icons: [
    { name: "VM", path: "/icons/azure/one.svg" }, { name: "VM", path: "/icons/azure/two.svg" },
  ] } };
  assert.deepEqual(resolveSources([item], catalogs), [["/icons/azure/one.svg", "/icons/azure/two.svg"]]);
  assert.throws(() => resolveSources([item, { ...item, id: "other" }], catalogs), /Ambiguous alias/);
  assert.throws(() => resolveSources([{ ...item, sourceNames: ["missing"] }], catalogs), /missing source/);
});

test("reviews require current drawing and neighbor comparisons", () => {
  const revisions = { icon: "new-revision" };
  const comparisons = { icon: "neighbors-v1" };
  const decision = { revision: "new-revision", comparisonRevision: "neighbors-v1",
    status: "approved", notes: "Distinct without caption" };
  assert.throws(() => mergeReviews({}, { icon: { ...decision, revision: "old" } }, revisions, comparisons), /Stale/);
  assert.throws(() => mergeReviews({}, { icon: { ...decision, comparisonRevision: "old" } }, revisions, comparisons), /Stale/);
  assert.throws(() => mergeReviews({}, { icon: { ...decision, status: "rework", notes: "" } }, revisions, comparisons), /notes/);
  assert.deepEqual(mergeReviews({}, { icon: decision }, revisions, comparisons), { icon: decision });
  assert.deepEqual(currentReview(decision, revisions.icon, comparisons.icon), { review: "approved", notes: decision.notes });
  assert.deepEqual(currentReview(decision, revisions.icon, "neighbors-v2"), { review: "pending", notes: "" });
  assert.deepEqual(currentReview({ ...decision, comparisonRevision: undefined }, revisions.icon, comparisons.icon),
    { review: "pending", notes: "" });
  assert.deepEqual(currentReview({ ...decision, status: "rework" }, revisions.icon, "neighbors-v2"),
    { review: "rework", notes: decision.notes });
  const legacy = { revision: "new-revision", status: "approved", notes: "Prior review" };
  assert.deepEqual(mergeReviews({ icon: legacy }, { icon: { ...decision, status: "pending" } }, revisions, comparisons),
    { icon: legacy });
  const pairs = [{ a: "icon", b: "neighbor" }];
  const sources = [["reference.svg", "source-v1"]];
  const comparison = comparisonRevisionFor("icon", pairs, { neighbor: "v1", other: "v1" }, sources);
  assert.notEqual(comparison, comparisonRevisionFor("icon", pairs, { neighbor: "v2" }, sources));
  assert.notEqual(comparison, comparisonRevisionFor("icon", [{ a: "icon", b: "other" }], { other: "v1" }, sources));
  assert.notEqual(comparison, comparisonRevisionFor("icon", pairs, { neighbor: "v1" }, [["reference.svg", "source-v2"]]));
  assert.equal(comparison, comparisonRevisionFor("icon", [{ a: "neighbor", b: "icon" }], { neighbor: "v1" }, sources));
});

test("similarity decisions require both current revisions and a reason", () => {
  const revisions = { left: "l1", right: "r1" };
  const pair = { a: "left", b: "right", revisionA: "l1", revisionB: "r1",
    status: "distinct", notes: "The arrows point in opposite directions." };
  const key = pairKey(pair.a, pair.b);
  const flagged = [{ a: "right", b: "left" }];
  assert.deepEqual(mergePairReviews({}, { [key]: pair }, revisions, flagged), { [key]: pair });
  assert.throws(() => mergePairReviews({}, { [key]: { ...pair, revisionB: "old" } }, revisions, flagged), /Stale/);
  assert.throws(() => mergePairReviews({}, { [key]: { ...pair, notes: " " } }, revisions, flagged), /notes/);
  assert.throws(() => mergePairReviews({}, { [key]: pair }, revisions, []), /unknown pair/);
  assert.throws(() => mergePairReviews({}, { "wrong-key": pair }, revisions, flagged), /unknown pair/);
  assert.deepEqual(currentPairReview(flagged[0], { [key]: pair }, revisions),
    { review: "distinct", notes: pair.notes });
  assert.deepEqual(currentPairReview(flagged[0], { [key]: pair }, { ...revisions, right: "r2" }),
    { review: "pending", notes: "" });
  assert.throws(() => currentPairReview(flagged[0], { [key]: { ...pair, notes: "" } }, revisions), /Invalid saved pair/);
  const qa = { needsReview: [], flaggedPairs: [{ ...flagged[0], review: "pending" }],
    coverage: { azure: { sources: 1, covered: 1 } } };
  assert.throws(() => validateRelease(qa, ["--approved"]), /unresolved similar pairs/);
  qa.flaggedPairs[0].review = "rework";
  assert.throws(() => validateRelease(qa, ["--approved"]), /unresolved similar pairs/);
  qa.flaggedPairs[0].review = "distinct";
  assert.doesNotThrow(() => validateRelease(qa, ["--approved"]));
});

test("completion and approval gates independently reject missing coverage and unreviewed drawings", () => {
  const qa = { needsReview: ["x"], flaggedPairs: [], coverage: { azure: { sources: 2, covered: 1 } } };
  assert.throws(() => validateRelease(qa, ["--approved"]), /unapproved/);
  assert.throws(() => validateRelease(qa, ["--complete"]), /1 source entries/);
  qa.needsReview = [];
  qa.coverage.azure.covered = 2;
  assert.doesNotThrow(() => validateRelease(qa, ["--approved", "--complete"]));
});

test("verified exact-geometry aliases merge only with naming evidence", () => {
  const dataLake = artwork.find((item) => item.id === "azure-data-lake-gen1");
  const privateSubnet = artwork.find((item) => item.id === "aws-private-subnet");
  const publicSubnet = artwork.find((item) => item.id === "aws-public-subnet");
  assert.ok(dataLake.sourceNames.includes("10090-icon-service-Data-Lake-Storage-Gen1"));
  assert.ok(dataLake.sourceNames.includes("10150-icon-service-Data-Lake-Store-Gen1"));
  assert.ok(!artwork.some((item) => item.id === "azure-lake-store"));
  assert.ok(privateSubnet.sourceNames.includes("Private-subnet_32"));
  assert.ok(publicSubnet.sourceNames.includes("Public-subnet_32"));
  assert.notEqual(geometrySignature(privateSubnet), geometrySignature(publicSubnet));

  const pathData = (file) => {
    const svg = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    return [...svg.matchAll(/<path\b[^>]*\bd=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1]);
  };
  assert.deepEqual(
    pathData("wwwroot/icons/azure/Azure_Public_Service_Icons/Icons/storage/10090-icon-service-Data-Lake-Storage-Gen1.svg"),
    pathData("wwwroot/icons/azure/Azure_Public_Service_Icons/Icons/analytics/10150-icon-service-Data-Lake-Store-Gen1.svg"),
  );
  assert.deepEqual(
    pathData("wwwroot/icons/aws/Architecture-Group-Icons_07312026/Private-subnet_32.svg"),
    pathData("wwwroot/icons/aws/Architecture-Group-Icons_07312026/Public-subnet_32.svg"),
  );
});

test("alias audit surfaces unsupported and unreadable source evidence", async () => {
  const unsupported = normalizedGeometrySignature(
    '<svg xmlns="http://www.w3.org/2000/svg"><g transform="scale(2)"><path d="M0 0L10 10"/></g></svg>',
    "/icons/example.svg",
  );
  assert.equal(unsupported.signature, null);
  assert.match(unsupported.unsupported, /transform|use|defs|clip|mask|style/);
  assert.throws(
    () => normalizedGeometrySignature('<svg xmlns="http://www.w3.org/2000/svg"><text>no geometry</text></svg>', "/icons/text.svg"),
    /Empty or unsupported primitive geometry/,
  );
  await assert.rejects(
    () => sourceMask("/icons/missing/audit-test.svg"),
    /Source unreadable \/icons\/missing\/audit-test\.svg/,
  );
});

test("durable catalog review state records evidence and remaining scope", () => {
  const state = JSON.parse(readFileSync(new URL("../stencils/independent-review-state.json", import.meta.url), "utf8"));
  assert.equal(state.status, "in-progress");
  assert.equal(state.compositionCount, 2237);
  assert.equal(state.compositionsReviewed, state.reviews.length);
});

test("independent release check is non-writing and stale-output-safe", () => {
  const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  assert.match(packageJson.scripts["stencils:independent-check"], /--check/);
  assert.match(packageJson.scripts["stencils:independent-check"], /--independent/);
});

test("independent review gate fails closed on missing, bogus, duplicate and stale records", async () => {
  const root = mkdtempSync(path.join(tmpdir(), "xyzicon-independent-"));
  mkdirSync(path.join(root, "stencils"));
  mkdirSync(path.join(root, "wwwroot", "stencils"), { recursive: true });
  const targetSvg = "<svg><rect width=\"10\" height=\"10\"/></svg>";
  const neighborSvg = "<svg><circle cx=\"5\" cy=\"5\" r=\"5\"/></svg>";
  writeFileSync(path.join(root, "wwwroot", "stencils", "a.svg"), targetSvg);
  writeFileSync(path.join(root, "wwwroot", "stencils", "b.svg"), neighborSvg);
  const svgHash = (value) => createHash("sha256").update(value).digest("hex");
  const targetRevision = svgHash(targetSvg);
  const neighborRevision = svgHash(neighborSvg);
  const stateFile = path.join(root, "stencils", "independent-review-state.json");
  const items = [{ id: "a", revision: "r1", comparisonRevision: "c1", sources: ["/icons/a.svg"] }];
  const sourceRevisions = { a: [["/icons/a.svg", "source-v1"]] };
  const nearest = { a: [{ a: "a", b: "b" }] };
  const revisions = { b: "rb1" };
  const qa = { count: 1 };
  const valid = {
    status: "complete", compositionCount: 1, compositionsReviewed: 1,
    reviews: [{
      id: "a", status: "approved", drawingRevision: "r1", comparisonRevision: "c1",
      sourceRevisions: [["/icons/a.svg", "source-v1"]],
      svgRevision: targetRevision,
      reviewedSizes: [128, 64, 32],
      semanticNeighborCoverage: "automated-and-manual",
      neighborDecisions: [{ id: "b", revision: "rb1", svgRevision: neighborRevision, status: "approved", reason: "Distinct semantic neighbor." }],
    }],
  };
  writeFileSync(stateFile, JSON.stringify(valid));
  await validateIndependentReview(qa, items, sourceRevisions, nearest, revisions, root);

  const missing = { ...valid, status: "in-progress" };
  writeFileSync(stateFile, JSON.stringify(missing));
  await assert.rejects(() => validateIndependentReview(qa, items, sourceRevisions, nearest, revisions, root), /Independent audit incomplete/);

  const bogus = { ...valid, reviews: [{ ...valid.reviews[0], id: "bogus" }] };
  writeFileSync(stateFile, JSON.stringify(bogus));
  await assert.rejects(() => validateIndependentReview(qa, items, sourceRevisions, nearest, revisions, root), /bogus|missing|unknown/);

  const stale = { ...valid, reviews: [{ ...valid.reviews[0], drawingRevision: "old" }] };
  writeFileSync(stateFile, JSON.stringify(stale));
  await assert.rejects(() => validateIndependentReview(qa, items, sourceRevisions, nearest, revisions, root), /stale drawing revision/i);

  const duplicate = { ...valid, compositionsReviewed: 2, reviews: [valid.reviews[0], valid.reviews[0]] };
  writeFileSync(stateFile, JSON.stringify(duplicate));
  await assert.rejects(() => validateIndependentReview(qa, items, sourceRevisions, nearest, revisions, root), /count mismatch|duplicate/i);

  const staleSource = { ...valid, reviews: [{ ...valid.reviews[0], sourceRevisions: [["/icons/a.svg", "source-v0"]] }] };
  writeFileSync(stateFile, JSON.stringify(staleSource));
  await assert.rejects(() => validateIndependentReview(qa, items, sourceRevisions, nearest, revisions, root), /stale source revisions/i);

  const staleNeighbor = { ...valid, reviews: [{ ...valid.reviews[0], neighborDecisions: [{ id: "b", revision: "old", status: "approved", reason: "Distinct." }] }] };
  writeFileSync(stateFile, JSON.stringify(staleNeighbor));
  await assert.rejects(() => validateIndependentReview(qa, items, sourceRevisions, nearest, revisions, root), /stale neighbor revision/i);

  const missingSizes = { ...valid, reviews: [{ ...valid.reviews[0], reviewedSizes: [128, 64] }] };
  writeFileSync(stateFile, JSON.stringify(missingSizes));
  await assert.rejects(() => validateIndependentReview(qa, items, sourceRevisions, nearest, revisions, root), /128\/64\/32/i);

  const noNeighbor = { ...valid, reviews: [{ ...valid.reviews[0],
    semanticNeighborCoverage: "none", neighborDecisions: [],
    semanticNeighborReason: "No meaningful semantic neighbors." }] };
  writeFileSync(stateFile, JSON.stringify(noNeighbor));
  await assert.rejects(() => validateIndependentReview(qa, items, sourceRevisions, nearest, revisions, root), /no-neighbor coverage conflicts/);

  const partial = { ...valid, status: "in-progress", compositionCount: 1, compositionsReviewed: 1 };
  writeFileSync(stateFile, JSON.stringify(partial));
  await validateIndependentReviewPartial(qa, items, sourceRevisions, nearest, revisions, root);

  const stalePartial = { ...valid, status: "in-progress", compositionCount: 1, compositionsReviewed: 1,
    reviews: [{ ...valid.reviews[0], drawingRevision: "stale" }] };
  writeFileSync(stateFile, JSON.stringify(stalePartial));
  await assert.rejects(() => validateIndependentReviewPartial(qa, items, sourceRevisions, nearest, revisions, root), /stale drawing revision/i);
});

test("geometry and raster candidate support is evaluated independently", () => {
  const entries = [
    { source: "geometry-only", geometry: { signature: "g" }, mask: null },
    { source: "raster-only", geometry: { signature: null }, mask: new Uint32Array(128) },
    { source: "both", geometry: { signature: "g2" }, mask: new Uint32Array(128) },
  ];
  const split = splitCandidateSupport(entries);
  assert.deepEqual(split.geometrySupported.map((entry) => entry.source), ["geometry-only", "both"]);
  assert.deepEqual(split.rasterSupported.map((entry) => entry.source), ["raster-only", "both"]);
});

test("alpha masks have fixed raster dimensions and opaque backgrounds are triage-only", () => {
  const sparse = new Uint8Array(64 * 64 * 4);
  sparse[(4095 * 4) + 3] = 255;
  const mask = packAlphaMask(sparse);
  assert.equal(mask.length, 128);
  assert.equal(mask[127] & (1 << 31), 1 << 31);

  const opaque = rasterPreprocessingStatus(
    '<svg viewBox="0 0 48 48"><rect x="0" y="0" width="48" height="48" fill="#fff"/></svg>',
    "/icons/opaque.svg",
  );
  assert.equal(opaque.supported, false);
  assert.match(opaque.reason, /Opaque full-canvas background/);

  const transparent = rasterPreprocessingStatus(
    '<svg viewBox="0 0 48 48"><path d="M1 1h46v46H1z" fill="#fff"/></svg>',
    "/icons/light.svg",
  );
  assert.equal(transparent.supported, true);
});

test("packed monochrome silhouettes preserve exact intersection-over-union scores", () => {
  const a = Uint8Array.from({ length: 4096 }, (_, i) => i % 3 ? 255 : 0);
  const b = Uint8Array.from({ length: 4096 }, (_, i) => i % 7 ? 255 : 0);
  let intersection = 0, union = 0;
  for (let i = 0; i < a.length; i++) {
    if (a[i] < 180 && b[i] < 180) intersection++;
    if (a[i] < 180 || b[i] < 180) union++;
  }
  assert.equal(silhouetteSimilarity(packMask(a), packMask(b)), +(intersection / union).toFixed(4));
  assert.equal(silhouetteSimilarity(packMask(a), packMask(a)), 1);
  assert.throws(() => silhouetteSimilarity(packMask(new Uint8Array(32).fill(255)), packMask(new Uint8Array(32).fill(255))), /blank/);
});

test("same-named source entries stay distinct in search and usage tracking", () => {
  const context = { window: {}, console };
  vm.runInNewContext(readFileSync(new URL("../wwwroot/js/site.js", import.meta.url), "utf8"), context);
  const engine = context.window.xyzicon.searchEngine;
  engine.initIndex([
    { name: "Window Edit", displayName: "Window Edit", provider: "fabric", path: "/icons/fabric/20.svg", searchText: "window edit" },
    { name: "Window Edit", displayName: "Window Edit", provider: "fabric", path: "/icons/fabric/24.svg", searchText: "window edit" },
  ]);
  let result = engine.search("window", { fabric: true });
  assert.notEqual(result[0].id, result[1].id);
  engine.recordIconUse(result[1].id);
  engine.clearCache();
  result = engine.search("window", { fabric: true });
  assert.equal(result[0].path, "/icons/fabric/24.svg");
});
