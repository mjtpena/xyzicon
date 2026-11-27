import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const ignored = new Set([
  "a", "an", "and", "as", "at", "aws", "azure", "badge", "by", "dynamics",
  "entra", "fabric", "for", "gcp", "google", "in", "m365", "microsoft",
  "of", "on", "or", "the", "to", "with",
]);

function tokens(item) {
  const words = `${item.name} ${item.id}`
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .toLowerCase().match(/[a-z0-9]+/g) ?? [];
  return new Set(words.map((word) => {
    if (word.length > 4 && word.endsWith("ies")) return `${word.slice(0, -3)}y`;
    if (word.length > 4 && word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
    return word;
  }).filter((word) => word.length > 1 && !ignored.has(word)));
}

export function suggestNeighbors(items, ids, limit = 12) {
  if (!Array.isArray(items) || !Array.isArray(ids) || !ids.length ||
      !Number.isInteger(limit) || limit < 1)
    throw new Error("Provide catalog items, at least one drawing ID, and a positive limit.");
  const index = new Map();
  const frequencies = new Map();
  for (const item of items) {
    if (!item || typeof item.id !== "string" || typeof item.name !== "string" || index.has(item.id))
      throw new Error("Catalog contains an invalid or repeated drawing.");
    const terms = tokens(item);
    index.set(item.id, terms);
    for (const term of terms) frequencies.set(term, (frequencies.get(term) ?? 0) + 1);
  }
  if (new Set(ids).size !== ids.length) throw new Error("Repeated drawing ID.");
  for (const id of ids) if (!index.has(id)) throw new Error(`Unknown drawing ID: ${id}`);

  const weights = new Map([...frequencies].map(([term, count]) =>
    [term, 1 + Math.log((items.length + 1) / (count + 1))]));
  const totals = new Map([...index].map(([id, terms]) =>
    [id, [...terms].reduce((sum, term) => sum + weights.get(term), 0)]));
  return ids.map((id) => {
    const terms = index.get(id);
    const candidates = [];
    for (const [otherId, otherTerms] of index) {
      if (otherId === id) continue;
      let overlap = 0;
      for (const term of terms) if (otherTerms.has(term)) overlap += weights.get(term);
      if (overlap === 0) continue;
      const family = id.startsWith(`${otherId}-`) || otherId.startsWith(`${id}-`);
      candidates.push({ id: otherId, score: 2 * overlap / (totals.get(id) + totals.get(otherId)) * (family ? 1.5 : 1) });
    }
    candidates.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id, "en"));
    return { id, semanticNeighbors: candidates.slice(0, limit).map((candidate) => candidate.id) };
  });
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const ids = process.argv.slice(2);
  if (!ids.length) throw new Error("Usage: node tools/suggest-stencil-neighbors.mjs <drawing-id>...");
  const catalog = JSON.parse(await readFile(path.join(root, "wwwroot", "stencils", "catalog.json"), "utf8"));
  const suggestions = suggestNeighbors(catalog.items, ids);
  console.error("Lexical suggestions are incomplete triage only; select and review semantic neighbors manually.");
  console.log(JSON.stringify(suggestions, null, 2));
}
