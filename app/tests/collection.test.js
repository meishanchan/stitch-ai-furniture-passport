import test from 'node:test';
import assert from 'node:assert/strict';
const shop = await import('../dist/collection-core.js').catch(() => null);
const items = [
  {id:'desk',name:'VITVAL 書桌',category:'桌類',grade:'A 級珍藏',price:16800,carbonSavedKg:54.2,sourcePieces:['舊 KALLAX','床架'],growthStory:'成長',finishOptions:['白','黑']},
  {id:'chair',name:'座椅',category:'椅類',grade:'B 級溫潤歲月',price:8000,carbonSavedKg:20,sourcePieces:['鋼管'],finishOptions:['灰']}
];
test('collection search includes original source pieces, combines filters and sorts without mutating data',()=>{
  assert.ok(shop,'collection behavior is implemented');
  assert.deepEqual(shop.filterCollection(items,{query:'kallax',category:'桌類',grade:'A 級珍藏',growth:true}),[items[0]]);
  assert.deepEqual(shop.filterCollection(items,{sort:'price-asc'}),[items[1],items[0]]);
  assert.deepEqual(shop.filterCollection(items,{query:'不存在'}),[]);
  assert.equal(items[0].id,'desk');
});
test('bag merges only identical finishes and removing the last unit removes its line',()=>{
  assert.ok(shop,'bag behavior is implemented');
  let bag=shop.addToBag([],items[0],'白');
  bag=shop.addToBag(bag,items[0],'白');bag=shop.addToBag(bag,items[0],'黑');
  assert.deepEqual(bag.map(x=>[x.finish,x.quantity]),[['白',2],['黑',1]]);
  bag=shop.changeQuantity(bag,0,-2);
  assert.deepEqual(bag.map(x=>[x.finish,x.quantity]),[['黑',1]]);
  assert.deepEqual(shop.bagTotals(bag,items),{subtotal:16800,delivery:0,total:16800,carbon:54.2,count:1});
  assert.equal(shop.bagTotals([{id:'chair',finish:'灰',quantity:1}],items).delivery,800);
  assert.equal(shop.bagTotals([],items).total,0);
});
test('saved bag restores only valid catalog products, finishes and positive whole quantities',()=>{
  assert.ok(shop,'bag restore is implemented');
  assert.deepEqual(shop.restoreBag('broken',items),[]);
  assert.deepEqual(shop.restoreBag(JSON.stringify([{id:'desk',finish:'白',quantity:2},{id:'gone',finish:'白',quantity:2},{id:'chair',finish:'灰',quantity:-1},{id:'desk',finish:'missing',quantity:1}]),items),[{id:'desk',finish:'白',quantity:2}]);
});

test('calendar filters events by category, month, and search query', () => {
  const sampleEvents = [
    { id: 'e1', title: 'Re-KEA 週末市集', type: 'market', date: '2026-11-21', summary: '換物市集' },
    { id: 'e2', title: 'DIY 木作修繕', type: 'diy', date: '2026-11-22', summary: '椅凳改造' },
    { id: 'e3', title: '冬日回收市集', type: 'market', date: '2026-12-05', summary: '台中場' }
  ];
  assert.equal(shop.filterEvents(sampleEvents, { category: 'market' }).length, 2);
  assert.equal(shop.filterEvents(sampleEvents, { category: 'diy' }).length, 1);
  assert.equal(shop.filterEvents(sampleEvents, { month: '2026-11' }).length, 2);
  assert.deepEqual(shop.filterEvents(sampleEvents, { query: '椅凳' }).map(e => e.id), ['e2']);
  assert.deepEqual(shop.getEventsForDate(sampleEvents, '2026-11-21').map(e => e.id), ['e1']);
  assert.deepEqual(shop.getEventsForDate(sampleEvents, '2026-11-23'), []);
  assert.deepEqual(shop.getUpcomingEvents(sampleEvents, '2026-11-22', 2).map(e => e.id), ['e2', 'e3']);
});

test('calendar month grid cells maintain 7-column layout and correct dates', () => {
  const cells = shop.getMonthCalendarCells(2026, 10); // Nov 2026
  assert.equal(cells.length % 7, 0);
  assert.ok(cells.length >= 35);
  // Nov 1, 2026 is Sunday, so first cell is Nov 1
  const nov1 = cells.find(c => c.dateStr === '2026-11-01');
  assert.ok(nov1);
  assert.equal(nov1.isCurrentMonth, true);
  const nov30 = cells.find(c => c.dateStr === '2026-11-30');
  assert.ok(nov30);
  assert.equal(nov30.isCurrentMonth, true);
});

test('restoreRsvps parses valid reservations and discards invalid payloads', () => {
  assert.deepEqual(shop.restoreRsvps('broken'), {});
  assert.deepEqual(shop.restoreRsvps(null), {});
  const stored = JSON.stringify({
    'evt-1': { code: 'EVT-123', name: '王大明', phone: '0912345678', guests: 2, bookedAt: '2026/11/17 14:00' },
    'invalid': { missing: true }
  });
  const restored = shop.restoreRsvps(stored);
  assert.equal(restored['evt-1'].name, '王大明');
  assert.equal(restored['evt-1'].guests, 2);
  assert.equal(restored.invalid, undefined);
});

