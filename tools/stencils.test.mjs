import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";
import { artwork } from "../stencils/artwork.mjs";
import { validateArtwork, geometrySignature, mergeReviews, currentReview, comparisonRevisionFor, mergePairReviews, currentPairReview, pairKey, resolveSources, renderSvg, toElements, validateRelease, packMask, silhouetteSimilarity } from "./build-stencils.mjs";

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

test("hand-drawn UI keeps every mapped source entry and exact source name", () => {
  const razor = readFileSync(new URL("../Pages/Index.razor", import.meta.url), "utf8");
  assert.doesNotMatch(razor, /\.DistinctBy\(icon => stencilsBySource\[icon\.Path\]\.Id\)/);
  assert.match(razor, /GetDisplayName\(IconData icon\) =>\s+icon\.DisplayName;/);
  assert.match(razor, /Where\(icon => stencilsBySource\.ContainsKey\(icon\.Path\)\)/);
  assert.match(razor, /unique concept drawings cover @stencilsBySource\.Count of @totalIconsLoaded source entries/);
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
