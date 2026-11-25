import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

test("review filters and pages retain decisions and open nearest matches", async () => {
  class Element {
    constructor(tag) {
      this.tag = tag;
      this.children = [];
      this.events = {};
      this.value = "";
      this.textContent = "";
      this.classList = { toggle: () => false };
    }
    append(...children) { this.children.push(...children); }
    replaceChildren(...children) { this.children = children; }
    after() {}
    addEventListener(type, handler) { this.events[type] = handler; }
    dispatch(type) { this.events[type]?.({ preventDefault() {} }); }
    setAttribute() {}
    scrollIntoView() {}
  }
  const roots = {};
  for (const id of ["status", "error", "export", "provider-filter", "decision-filter", "review-search", "drawings", "page-status", "previous", "next", "blind", "pair-summary", "pair-reviews"]) {
    roots[id] = new Element("div");
    roots[id].id = id;
  }
  const find = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) return node;
      const child = find(node.children, id);
      if (child) return child;
    }
  };
  const items = Array.from({ length: 25 }, (_, i) => ({
    id: `item-${i}`, name: `Concept ${i}`, provider: i < 10 ? "azure" : "aws",
    revision: `revision-${i}`, review: "pending", notes: "", rationale: "Description",
    path: `stencils/item-${i}.svg`, sources: [`/icons/item-${i}.svg`],
  }));
  const nearest = Object.fromEntries(items.map((item) => [item.id, []]));
  nearest["item-24"] = [{ a: "item-24", b: "item-1", similarity: 0.2 }];
  const saved = new Map();
  const location = { href: "http://localhost/stencils/review.html", hash: "" };
  const document = {
    getElementById: (id) => roots[id] || find(Object.values(roots), id),
    createElement: (tag) => new Element(tag),
    body: new Element("body"),
  };
  const context = {
    document, location, URL,
    window: { addEventListener() {} },
    history: { replaceState(_state, _title, hash) { location.hash = hash; } },
    localStorage: { getItem: (key) => saved.get(key), setItem: (key, value) => saved.set(key, value) },
    fetch: async (name) => ({ ok: true, json: async () => name === "catalog.json" ? { items } : { nearest, coverage: {},
      flaggedPairs: [{ a: "item-1", b: "item-24", similarity: 0.8, review: "pending", notes: "" }] } }),
    setTimeout,
  };
  vm.runInNewContext(readFileSync(new URL("../wwwroot/stencils/review.js", import.meta.url), "utf8"), context);
  await new Promise((resolve) => setImmediate(resolve));

  assert.equal(roots.drawings.children.length, 20);
  assert.match(roots["pair-summary"].textContent, /1 similar pairs · 1 unresolved/);
  const pairSelect = document.getElementById("pair-decision-item-1|item-24");
  const pairNotes = document.getElementById("pair-notes-item-1|item-24");
  pairSelect.value = "distinct"; pairSelect.dispatch("change");
  pairNotes.value = "Different directions"; pairNotes.dispatch("input");
  assert.equal(pairNotes.required, true);
  assert.match(roots["pair-summary"].textContent, /0 unresolved/);
  assert.equal(JSON.parse(saved.get("xyzicon-stencil-pair-reviews-v1"))["item-1|item-24"].notes, "Different directions");
  assert.match(roots["page-status"].textContent, /1–20 of 25/);
  roots.next.dispatch("click");
  assert.equal(roots.drawings.children.length, 5);
  assert.match(roots["page-status"].textContent, /21–25 of 25/);

  roots["review-search"].value = "Concept 24";
  roots["review-search"].dispatch("input");
  assert.equal(roots.drawings.children.length, 1);
  const article = roots.drawings.children[0];
  const controls = article.children[1];
  const select = controls.children.find((child) => child.id === "decision-item-24");
  const notes = controls.children.find((child) => child.id === "notes-item-24");
  select.value = "rework"; select.dispatch("change");
  notes.value = "Improve legibility"; notes.dispatch("input");
  roots["review-search"].value = "";
  roots["review-search"].dispatch("input");
  roots["review-search"].value = "Concept 24";
  roots["review-search"].dispatch("input");
  assert.equal(document.getElementById("notes-item-24").value, "Improve legibility");
  assert.equal(document.getElementById("notes-item-24").required, true);

  const link = roots.drawings.children[0].children[1].children[1].children[0];
  link.dispatch("click");
  assert.equal(location.hash, "#item-1");
  assert.ok(document.getElementById("item-1"));
  assert.equal(roots["review-search"].value, "");

  roots["provider-filter"].value = "azure";
  roots["provider-filter"].dispatch("change");
  assert.equal(roots.drawings.children.length, 10);
  roots["decision-filter"].value = "approved";
  roots["decision-filter"].dispatch("change");
  assert.equal(roots.drawings.children.length, 0);
  assert.equal(roots["page-status"].textContent, "No drawings match these filters.");
});
