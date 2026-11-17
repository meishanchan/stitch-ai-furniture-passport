import test from 'node:test';
import assert from 'node:assert/strict';
import { furniture } from '../dist/catalog.js';
import { getParts, renderPartsOverview, renderPartDetail, renderAssemblyStep } from '../dist/parts.js';

test('each furniture has its own selectable parts and both instruction directions', () => {
  for (const item of furniture) {
    const parts = getParts(item.id);
    assert.ok(parts.length >= 3, item.name);
    for (const part of parts) {
      assert.ok(part.remove && part.install, `${item.name} ${part.name}`);
      const detail = renderPartDetail(item, part.id);
      assert.match(detail, /拆卸/);
      assert.match(detail, /安裝/);
      assert.ok(detail.includes(part.name));
    }
    const overview = renderPartsOverview(item);
    assert.ok(overview.includes(item.name));
    assert.match(overview, /組裝示意/);
    assert.ok(parts.every(part => overview.includes(part.name)));
  }
  assert.match(renderPartsOverview(furniture.find(item => item.id === 'micke-desk')), /抽屜/);
  assert.doesNotMatch(renderPartsOverview(furniture.find(item => item.id === 'fladis-basket')), /抽屜/);
});

test('assembly demonstration shows a specific step and safely handles invalid selections', () => {
  const item = furniture.find(item => item.id === 'micke-desk');
  assert.match(renderAssemblyStep(item, 0), /1\s*\/\s*3/);
  assert.match(renderAssemblyStep(item, 2), /3\s*\/\s*3/);
  assert.equal(renderPartDetail(item, 'unknown'), '');
  assert.equal(getParts('unknown').length, 0);
});
