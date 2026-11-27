import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { checkCatalog, inspectRaster } from "./check-stencil-raster.mjs";

const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">${body}</svg>`;

test("detects blank small previews without treating visibility as approval", async () => {
  assert.deepEqual(await inspectRaster(svg("")), { visiblePixels: 0, overflowPixels: 0 });
  const result = await inspectRaster(svg('<path d="M20 20 L108 108" stroke="#111" stroke-width="3"/>'));
  assert.ok(result.visiblePixels > 0);
  assert.equal(result.overflowPixels, 0);
  assert.deepEqual(Object.keys(result), ["visiblePixels", "overflowPixels"]);
});

test("detects marks clipped by the original viewBox", async () => {
  const result = await inspectRaster(svg('<rect x="-4" y="24" width="16" height="20" fill="#111"/>'));
  assert.ok(result.visiblePixels > 0);
  assert.ok(result.overflowPixels > 0);
  await assert.rejects(inspectRaster('<svg xmlns="http://www.w3.org/2000/svg"/>'), /viewBox/);
});

test("catalog scan identifies both blank and clipped drawings", async (t) => {
  const root = await mkdtemp(path.join(os.tmpdir(), "stencil-raster-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  const stencils = path.join(root, "wwwroot", "stencils");
  await mkdir(stencils, { recursive: true });
  await writeFile(path.join(stencils, "catalog.json"), JSON.stringify({ items: [
    { id: "blank", path: "stencils/blank.svg" },
    { id: "clipped", path: "stencils/clipped.svg" },
  ] }));
  await writeFile(path.join(stencils, "blank.svg"), svg(""));
  await writeFile(path.join(stencils, "clipped.svg"), svg('<rect x="-4" y="24" width="16" height="20" fill="#111"/>'));
  const result = await checkCatalog(root);
  assert.equal(result.checked, 2);
  assert.deepEqual(result.failures.map((item) => item.id), ["blank", "clipped"]);
  assert.equal(result.failures[0].visiblePixels, 0);
  assert.ok(result.failures[1].overflowPixels > 0);
});
