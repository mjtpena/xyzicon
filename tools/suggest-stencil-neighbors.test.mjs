import assert from "node:assert/strict";
import test from "node:test";
import { suggestNeighbors } from "./suggest-stencil-neighbors.mjs";

const items = [
  { id: "fabric-database-badge-pulse", name: "Database with pulse" },
  { id: "fabric-database-pulse", name: "Database pulse" },
  { id: "azure-databases", name: "Databases" },
  { id: "gcp-database-table", name: "Database table" },
  { id: "azure-virtual-machine", name: "Virtual machine" },
];

test("suggestions prioritize related concepts and normalize plurals across providers", () => {
  const [result] = suggestNeighbors(items, ["fabric-database-badge-pulse"]);
  assert.equal(result.semanticNeighbors[0], "fabric-database-pulse");
  assert.ok(result.semanticNeighbors.includes("azure-databases"));
  assert.ok(result.semanticNeighbors.includes("gcp-database-table"));
  assert.ok(!result.semanticNeighbors.includes("azure-virtual-machine"));
});

test("suggestions are deterministic, limited, and require valid selections", () => {
  const tied = [
    { id: "azure-machine", name: "Machine" },
    { id: "gcp-machine", name: "Machine" },
    { id: "fabric-machine", name: "Machine" },
  ];
  assert.deepEqual(suggestNeighbors(tied, ["azure-machine"], 1), [
    { id: "azure-machine", semanticNeighbors: ["fabric-machine"] },
  ]);
  assert.throws(() => suggestNeighbors(items, ["missing"]), /Unknown/);
  assert.throws(() => suggestNeighbors(items, [items[0].id, items[0].id]), /Repeated/);
  assert.throws(() => suggestNeighbors(items, [items[0].id], 0), /positive limit/);
});

test("suggestions include both the base concept and a sibling variant", () => {
  const cloudItems = [
    { id: "m365-cloud-upload", name: "Cloud Arrow Up" },
    { id: "m365-cloud-download", name: "Cloud Arrow Down" },
    { id: "m365-cloud", name: "Cloud" },
    { id: "fabric-calendar-up", name: "Calendar Arrow Up" },
  ];
  const [result] = suggestNeighbors(cloudItems, ["m365-cloud-upload"]);
  assert.ok(result.semanticNeighbors.includes("m365-cloud"));
  assert.ok(result.semanticNeighbors.includes("m365-cloud-download"));
});
