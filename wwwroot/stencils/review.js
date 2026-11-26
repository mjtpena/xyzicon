const $ = (id) => document.getElementById(id);
const storageKey = "xyzicon-stencil-reviews-v1";
const pairStorageKey = "xyzicon-stencil-pair-reviews-v1";
let decisions = {};
let pairDecisions = {};
let items = [];
let itemsById = new Map();
let qa;
let page = 0;
const pageSize = 20;
const error = (message) => { $("error").textContent = message; $("error").hidden = false; };
const el = (tag, text, className) => {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (className) node.className = className;
  return node;
};
// Resolve against the app directory, including GitHub Pages deployments under a subpath.
const assetUrl = (path) => new URL("../" + path.replace(/^\/+/, "").split("/").map(encodeURIComponent).join("/"), location.href).href;
const image = (path, size, alt) => {
  const img = el("img");
  img.src = assetUrl(path);
  img.width = img.height = size;
  img.alt = alt;
  img.addEventListener("error", () => error(`Image failed to load: ${path}`));
  return img;
};
function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(decisions));
    localStorage.setItem(pairStorageKey, JSON.stringify(pairDecisions));
  }
  catch (e) { error(`Browser storage unavailable: ${e.message}. Export decisions before leaving.`); }
  updateStatus();
}
function updateStatus() {
  const approved = items.filter((i) => decisions[i.id].status === "approved").length;
  const rework = items.filter((i) => decisions[i.id].status === "rework").length;
  $("status").textContent = `${items.length} concepts · ${approved} approved · ${rework} need rework · ${items.length - approved - rework} pending. These are review decisions, not an automated quality claim.`;
  const unresolved = Object.values(pairDecisions).filter((decision) => decision.status !== "distinct").length;
  $("pair-summary").textContent = `${qa.flaggedPairs.length} similar pairs · ${unresolved} unresolved`;
}
const pairKey = (a, b) => [a, b].sort().join("|");
async function load() {
  const get = async (name) => {
    const response = await fetch(name);
    if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
    return response.json();
  };
  const [catalog, report] = await Promise.all([get("catalog.json"), get("qa.json")]);
  qa = report;
  items = catalog.items;
  itemsById = new Map(items.map((item) => [item.id, item]));
  const coverage = el("p", Object.entries(qa.coverage)
    .map(([provider, value]) => `${provider}: ${value.covered}/${value.sources} source entries (${value.concepts} concepts)`)
    .join(" · "), "meta");
  $("status").after(coverage);
  let saved = {}, savedPairs = {};
  try {
    saved = JSON.parse(localStorage.getItem(storageKey) || "{}");
    savedPairs = JSON.parse(localStorage.getItem(pairStorageKey) || "{}");
  }
  catch (e) { error(`Could not restore browser decisions: ${e.message}. Repository decisions are shown instead.`); }
  for (const item of items) {
    const previous = saved[item.id];
    const valid = previous?.revision === item.revision &&
      (previous.status !== "approved" || previous.comparisonRevision === item.comparisonRevision);
    decisions[item.id] = valid
      ? { ...previous, comparisonRevision: item.comparisonRevision }
      : { revision: item.revision, comparisonRevision: item.comparisonRevision, status: item.review, notes: item.notes };
  }
  for (const pair of qa.flaggedPairs) {
    const key = pairKey(pair.a, pair.b);
    const a = itemsById.get(pair.a), b = itemsById.get(pair.b);
    const savedPair = savedPairs[key];
    pairDecisions[key] = savedPair?.a === a.id && savedPair?.b === b.id &&
      savedPair.revisionA === a.revision && savedPair.revisionB === b.revision ? savedPair
      : { a: a.id, b: b.id, revisionA: a.revision, revisionB: b.revision,
          status: pair.review, notes: pair.notes };
  }
  for (const provider of [...new Set(items.map((item) => item.provider))].sort()) {
    const option = el("option", provider); option.value = provider;
    $("provider-filter").append(option);
  }
  updateStatus();
  renderPairs();
  $("export").disabled = false;
  if (location.hash) showDrawing(decodeURIComponent(location.hash.slice(1)));
  else render();
}
function renderPairs() {
  $("pair-reviews").replaceChildren();
  for (const pair of qa.flaggedPairs) {
    const key = pairKey(pair.a, pair.b);
    const a = itemsById.get(pair.a), b = itemsById.get(pair.b);
    const article = el("article");
    const comparison = el("section");
    comparison.append(el("h2", `Similarity ${Math.round(pair.similarity * 100)}%`));
    const figures = el("div", "", "pair-comparison");
    for (const item of [a, b]) {
      const figure = el("figure");
      figure.append(image(item.path, 128, `Stencil for ${item.name}`),
        image(item.path, 32, `${item.name} at 32px`), el("figcaption", item.name));
      figures.append(figure);
    }
    comparison.append(figures);
    const controls = el("section", "", "pair-controls");
    const label = el("label", "Pair decision");
    const select = el("select");
    select.id = `pair-decision-${key}`;
    label.htmlFor = select.id;
    for (const [value, text] of [["pending", "Pending comparison"], ["distinct", "Distinct after review"], ["rework", "Needs rework"]]) {
      const option = el("option", text); option.value = value; select.append(option);
    }
    select.value = pairDecisions[key].status;
    const notesLabel = el("label", "Why distinct, or what needs rework");
    const notes = el("textarea");
    notes.id = `pair-notes-${key}`;
    notesLabel.htmlFor = notes.id;
    notes.value = pairDecisions[key].notes;
    notes.required = select.value !== "pending";
    const change = () => {
      pairDecisions[key] = { a: a.id, b: b.id, revisionA: a.revision,
        revisionB: b.revision, status: select.value, notes: notes.value };
      notes.required = select.value !== "pending";
      save();
    };
    select.addEventListener("change", change);
    notes.addEventListener("input", change);
    controls.append(label, select, notesLabel, notes);
    article.append(comparison, controls);
    $("pair-reviews").append(article);
  }
}
function render() {
  const provider = $("provider-filter").value;
  const decision = $("decision-filter").value;
  const query = $("review-search").value.trim().toLowerCase();
  const visible = items.filter((item) =>
    (!provider || item.provider === provider) &&
    (!decision || decisions[item.id].status === decision) &&
    (!query || `${item.name} ${item.provider}`.toLowerCase().includes(query)));
  page = Math.min(page, Math.max(0, Math.ceil(visible.length / pageSize) - 1));
  $("drawings").replaceChildren();
  $("page-status").textContent = visible.length
    ? `Showing ${page * pageSize + 1}–${Math.min((page + 1) * pageSize, visible.length)} of ${visible.length} drawings`
    : "No drawings match these filters.";
  $("previous").disabled = page === 0;
  $("next").disabled = (page + 1) * pageSize >= visible.length;
  for (const item of visible.slice(page * pageSize, (page + 1) * pageSize)) {
    const article = el("article");
    article.id = item.id;
    const drawing = el("section");
    drawing.append(el("h2", item.name, "identity"), el("p", item.rationale, "rationale"));
    const samples = el("div", "", "samples");
    const original = el("figure", "", "original");
    original.append(image(item.sources[0], 64, `Official ${item.name}`), el("figcaption", "Original reference"));
    samples.append(original);
    for (const size of [128, 64, 32]) {
      const sample = el("figure");
      sample.append(image(item.path, size, `${item.name} stencil at ${size}px`), el("figcaption", `${size}px`));
      samples.append(sample);
    }
    const aliases = el("details", "", "alias-list");
    aliases.append(el("summary", `${item.sources.length} original source variant(s)`));
    const list = el("ul");
    for (const source of item.sources) {
      const li = el("li"), link = el("a");
      link.href = assetUrl(source);
      const thumbnail = image(source, 48, `Official variant of ${item.name}`);
      thumbnail.loading = "lazy";
      link.append(thumbnail, el("span", source.replace(/^\/icons\//, "")));
      li.append(link); list.append(li);
    }
    aliases.append(list);
    drawing.append(samples, aliases);
    const controls = el("section", "", "controls");
    controls.append(el("p", "Closest outlines (colour and labels removed)", "meta"));
    const neighbors = el("div", "", "neighbors");
    for (const pair of qa.nearest[item.id]) {
      const other = itemsById.get(pair.a === item.id ? pair.b : pair.a);
      const link = el("a");
      link.href = `#${other.id}`;
      link.addEventListener("click", (event) => {
        event.preventDefault();
        history.replaceState(null, "", `#${other.id}`);
        showDrawing(other.id);
      });
      link.append(image(other.path, 56, "Nearest composition"),
        image(other.path, 32, "Nearest composition at 32px"),
        el("span", `${other.name} (${Math.round(pair.similarity * 100)}%)`));
      neighbors.append(link);
    }
    const label = el("label", "Review decision");
    const select = el("select");
    select.id = `decision-${item.id}`;
    label.htmlFor = select.id;
    for (const [value, text] of [["pending", "Pending review"], ["approved", "Approve composition"], ["rework", "Needs rework"]]) {
      const option = el("option", text); option.value = value; select.append(option);
    }
    select.value = decisions[item.id].status;
    const notesLabel = el("label", "Notes (required for rework)");
    const notes = el("textarea");
    notes.id = `notes-${item.id}`;
    notesLabel.htmlFor = notes.id;
    notes.value = decisions[item.id].notes;
    notes.required = select.value === "rework";
    const change = () => {
      decisions[item.id] = { revision: item.revision, comparisonRevision: item.comparisonRevision,
        status: select.value, notes: notes.value };
      notes.required = select.value === "rework";
      save();
    };
    select.addEventListener("change", change);
    notes.addEventListener("input", change);
    controls.append(neighbors, label, select, notesLabel, notes);
    const library = el("a", `Download ${item.provider} editable library`);
    library.href = `${item.provider}.excalidrawlib`; library.download = "";
    controls.append(library);
    article.append(drawing, controls);
    $("drawings").append(article);
  }
}
function showDrawing(id) {
  const index = items.findIndex((item) => item.id === id);
  if (index < 0) { render(); return; }
  $("provider-filter").value = "";
  $("decision-filter").value = "";
  $("review-search").value = "";
  page = Math.floor(index / pageSize);
  render();
  document.getElementById(id)?.scrollIntoView();
}
for (const id of ["provider-filter", "decision-filter", "review-search"]) {
  $(id).addEventListener(id === "review-search" ? "input" : "change", () => { page = 0; render(); });
}
$("previous").addEventListener("click", () => { page--; render(); $("page-status").scrollIntoView(); });
$("next").addEventListener("click", () => { page++; render(); $("page-status").scrollIntoView(); });
window.addEventListener("hashchange", () => showDrawing(decodeURIComponent(location.hash.slice(1))));
$("blind").addEventListener("click", () => {
  const hidden = document.body.classList.toggle("blind");
  $("blind").setAttribute("aria-pressed", String(hidden));
  $("blind").textContent = hidden ? "Show names and explanations" : "Hide names and explanations";
});
$("export").addEventListener("click", () => {
  if (Object.values(decisions).some((d) => d.status === "rework" && !d.notes.trim())) {
    error("Add actionable notes to every drawing marked for rework before exporting.");
    return;
  }
  if (Object.values(pairDecisions).some((d) => d.status !== "pending" && !d.notes.trim())) {
    error("Explain each distinct pair or describe its required rework before exporting.");
    return;
  }
  const exportData = { version: 2, drawings: decisions, pairs: pairDecisions };
  const url = URL.createObjectURL(new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" }));
  const link = el("a");
  link.href = url; link.download = "stencil-reviews.json"; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
load().catch((e) => error(`Review sheet could not load: ${e.message}. Reload after running npm run stencils.`));
