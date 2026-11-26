export const rect = (x, y, w, h, fill = false) => ({ type: "rectangle", x, y, w, h, fill });
export const oval = (x, y, w, h, fill = false) => ({ type: "ellipse", x, y, w, h, fill });
export const line = (...points) => ({ type: "line", points });
export const polygon = (...points) => ({ type: "line", points: [...points, points[0]], fill: true });
export const entry = (id, provider, name, sourceNames, rationale, shapes) =>
  ({ id, provider, name, sourceNames, rationale, shapes });
