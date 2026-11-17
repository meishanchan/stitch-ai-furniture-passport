import test from 'node:test';
import assert from 'node:assert/strict';
import { restoreState } from '../dist/core.js';
import { renderPassport } from '../dist/details.js';
import { furniture } from '../dist/catalog.js';
import { readFileSync } from 'node:fs';

test('life memories survive reload and remain attached to their furniture', () => {
  const raw = JSON.stringify({ memories: { 'micke-desk': [{ date: '2025-05-04', text: '第一次在這裡寫信' }], unknown: [{ date: '2025-01-01', text: '無效' }] } });
  const state = restoreState(raw, furniture.map(item => item.id));
  assert.deepEqual(state.memories['micke-desk'], [{ date: '2025-05-04', text: '第一次在這裡寫信' }]);
  assert.equal(state.memories.unknown, undefined);
  assert.deepEqual(restoreState(null, furniture.map(item => item.id)).memories, {});
});

test('passport displays elapsed days and escaped memories in date order', () => {
  const item = furniture.find(item => item.id === 'micke-desk');
  const html = renderPassport(item, { memories: [{ date: '2026-04-01', text: '<週末>的早餐' }], today: new Date(2026, 3, 1) });
  assert.match(html, /陪伴 1,461 天/);
  assert.doesNotMatch(html, /入庫年份的 4 月 1 日/);
  assert.match(html, /生活時間軸/);
  assert.match(html, /新增生活紀錄/);
  assert.doesNotMatch(html, /健康度檢測指標/);
  assert.ok(html.indexOf('&lt;週末&gt;的早餐') < html.indexOf('影像掃描與狀態檢視'));
});

test('updated data modules are versioned and available in the offline cache', () => {
  const app = readFileSync(new URL('../dist/app.js', import.meta.url), 'utf8');
  const worker = readFileSync(new URL('../dist/sw.js', import.meta.url), 'utf8');
  for (const [module, version] of [['core', 'life-timeline-1'], ['details', 'inspection-1']]) {
    assert.ok(app.includes(`./${module}.js?v=${version}`));
    assert.ok(worker.includes(`./${module}.js?v=${version}`));
  }
});
