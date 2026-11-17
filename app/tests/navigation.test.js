import test from 'node:test';
import assert from 'node:assert/strict';

const core = await import('../dist/core.js').catch(() => null);
const ids = ['poang-armchair', 'micke-desk'];

test('opens any selected furniture and keeps its identity across three pages', () => {
  assert.ok(core, 'navigation core is implemented');
  for (const id of ids) for (const view of ['passport', 'inspection', 'buyback']) {
    assert.deepEqual(core.parseRoute(core.routeFor(view, id), ids), { view, itemId: id });
  }
});

test('a broken or unknown shared furniture URL returns safely to the catalog', () => {
  assert.ok(core, 'navigation core is implemented');
  for (const hash of ['#/item/missing/passport', '#/item/%E0%A4%A/passport', '#/item/micke-desk/unknown', '']) {
    assert.deepEqual(core.parseRoute(hash, ids), { view: 'home', itemId: null });
  }
});

test('horizontal swipes change one page while vertical scrolling and small taps do not', () => {
  assert.ok(core, 'navigation core is implemented');
  assert.equal(core.swipeDestination('passport', -90, 10), 'inspection');
  assert.equal(core.swipeDestination('inspection', -90, 10), 'buyback');
  assert.equal(core.swipeDestination('buyback', 90, 10), 'inspection');
  assert.equal(core.swipeDestination('passport', 90, 10), 'passport');
  assert.equal(core.swipeDestination('inspection', 12, 90), 'inspection');
  assert.equal(core.swipeDestination('inspection', 18, 2), 'inspection');
});

test('saved preferences survive reload and stale furniture identifiers are discarded', () => {
  assert.ok(core, 'navigation core is implemented');
  const saved = core.restoreState(JSON.stringify({ favorites: ['micke-desk', 'gone', 'micke-desk'], selectedId:'micke-desk', bookings: { 'micke-desk': {date:'2026-11-20',method:'store',code:'AR-123'} }, reports:['micke-desk','gone'] }), ids);
  assert.deepEqual(saved.favorites, ['micke-desk']);
  assert.equal(saved.selectedId, 'micke-desk');
  assert.deepEqual(saved.reports, ['micke-desk']);
  assert.equal(saved.bookings['micke-desk'].code, 'AR-123');
  assert.deepEqual(core.restoreState('{invalid',ids).favorites, []);
  assert.deepEqual(core.restoreState('null',ids).favorites, []);
});
