export const detailViews = ['passport', 'inspection', 'buyback'];
export function routeFor(view, itemId) {
  return detailViews.includes(view) && itemId ? `#/item/${encodeURIComponent(itemId)}/${view}` : '#/';
}
export function parseRoute(hash, ids) {
  try {
    const match = /^#\/item\/([^/]+)\/(passport|inspection|buyback)$/.exec(hash);
    const itemId = match && decodeURIComponent(match[1]);
    if (match && ids.includes(itemId)) return { view: match[2], itemId };
  } catch { /* A damaged shared link falls back to the catalog. */ }
  return { view: 'home', itemId: null };
}
export function swipeDestination(view, dx, dy) {
  const index = detailViews.indexOf(view);
  if (index < 0 || Math.abs(dx) < 44 || Math.abs(dx) < Math.abs(dy) * 1.25) return view;
  return detailViews[Math.max(0, Math.min(2, index + (dx < 0 ? 1 : -1)))];
}
export function restoreState(raw, ids) {
  let source = {};
  try { source = JSON.parse(raw) || {}; } catch { /* First visit or corrupt storage. */ }
  const valid = values => Array.isArray(values) ? [...new Set(values.filter(value => ids.includes(value)))] : [];
  const bookings = {};
  if (source.bookings && typeof source.bookings === 'object') for (const id of ids) {
    const booking = source.bookings[id];
    if (booking && typeof booking === 'object' && typeof booking.code === 'string') bookings[id] = booking;
  }
  return { favorites: valid(source.favorites), reports: valid(source.reports), selectedId: ids.includes(source.selectedId) ? source.selectedId : ids[0], bookings };
}
