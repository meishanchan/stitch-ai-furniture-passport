import test from 'node:test';
import assert from 'node:assert/strict';
import * as details from '../dist/details.js';
const { renderInspection, renderInspectionCapture } = details;
import { furniture } from '../dist/catalog.js';

const item = furniture.find(entry => entry.id === 'micke-desk');
const photos = ['blob:front', 'blob:side', 'blob:detail'];

test('inspection starts with one clear entry and no fabricated angle photos', () => {
  const html = renderInspection(item, {});
  assert.match(html, /開始檢測/);
  assert.doesNotMatch(html, /上傳檢測照片|執行模擬檢測|ROI_A1|DEF_02/);
  assert.match(html, /尚未加入照片/);
});

test('capture requires all three angles before analysis and allows retakes', () => {
  const partial = renderInspectionCapture(item, [photos[0], null, null]);
  assert.match(partial, /正面/);
  assert.match(partial, /側面/);
  assert.match(partial, /細節/);
  assert.match(partial, /重新拍攝/);
  assert.match(partial, /data-action="inspect-analyze"[^>]*disabled/);
  const complete = renderInspectionCapture(item, photos);
  assert.doesNotMatch(complete, /data-action="inspect-analyze"[^>]*disabled/);
});

test('finished inspection displays each selected photo with its angle', () => {
  const html = renderInspection(item, { inspectionStatus: 'done', photos });
  for (const url of photos) assert.ok(html.includes(url));
  for (const label of ['正面', '側面', '細節']) assert.ok(html.includes(label));
  assert.match(html, /照片僅在本次使用時保留/);
});
