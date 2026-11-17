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
