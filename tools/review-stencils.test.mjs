import assert from "node:assert/strict";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { makeReviewSheets } from "./review-stencils.mjs";

const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><circle cx="64" cy="64" r="30"/></svg>';

async function fixture(t) {
  const root = await mkdtemp(path.join(os.tmpdir(), "xyzicon-review-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(path.join(root, "wwwroot", "stencils"), { recursive: true });
  await mkdir(path.join(root, "wwwroot", "icons"));
  const items = ["target", "nearest", "semantic"].map((id) => ({
    id, revision: `${id}-revision`, comparisonRevision: `${id}-comparison`,
    path: `stencils/${id}.svg`, sources: [`/icons/${id}.svg`],
  }));
  items[0].sources.push("/icons/target-variant.svg");
  await Promise.all(items.map((item) => writeFile(path.join(root, "wwwroot", item.path), svg)));
  await Promise.all(items.flatMap((item) => item.sources)
    .map((source) => writeFile(path.join(root, "wwwroot", source.slice(1)), svg)));
  await writeFile(path.join(root, "wwwroot", "stencils", "catalog.json"), JSON.stringify({ items }));
  await writeFile(path.join(root, "wwwroot", "stencils", "qa.json"), JSON.stringify({
    nearest: { target: [{ a: "nearest", b: "target" }] },
  }));
  return root;
}

test("comparison sheets preserve all source and neighbor revisions without approving them", async (t) => {
  const root = await fixture(t);
  const out = path.join(root, "evidence");
  const records = await makeReviewSheets(root, [{ id: "target", semanticNeighbors: ["semantic"] }], out);
  assert.equal(records[0].sourceRevisions.length, 2);
  assert.equal(records[0].sourceRevisions[0][0], "/icons/target.svg");
  assert.match(records[0].sourceRevisions[0][1], /^[a-f0-9]{64}$/);
  assert.match(records[0].svgRevision, /^[a-f0-9]{64}$/);
  assert.deepEqual(records[0].renderedSizes, [128, 64, 32]);
  assert.deepEqual(records[0].neighbors, [
    { id: "nearest", revision: "nearest-revision", svgRevision: records[0].svgRevision,
      svgRevisionLegacy: records[0].svgRevisionLegacy, automatic: true, semantic: false },
    { id: "semantic", revision: "semantic-revision", svgRevision: records[0].svgRevision,
      svgRevisionLegacy: records[0].svgRevisionLegacy, automatic: false, semantic: true },
  ]);
  assert.equal(records[0].status, undefined);
  assert.deepEqual(JSON.parse(await readFile(path.join(out, "manifest.json"), "utf8")), records);
  assert.deepEqual([...((await readFile(path.join(out, "target.png"))).subarray(0, 8))],
    [137, 80, 78, 71, 13, 10, 26, 10]);
  await assert.rejects(makeReviewSheets(root, [{ id: "target", semanticNeighbors: [] }], out), /EEXIST/);
});

test("invalid or duplicate review selections fail before writing evidence", async (t) => {
  const root = await fixture(t);
  const out = path.join(root, "evidence");
  await assert.rejects(makeReviewSheets(root, [{ id: "target", semanticNeighbors: ["missing"] }], out), /Invalid semantic neighbors/);
  await assert.rejects(makeReviewSheets(root, [
    { id: "target", semanticNeighbors: [] }, { id: "target", semanticNeighbors: [] },
  ], out), /repeated drawing/);
  await assert.rejects(readFile(path.join(out, "manifest.json")), /ENOENT/);
});
