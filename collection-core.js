// Catalog operations are independent of the existing personal furniture records.
export function filterCollection(items, {query='', category='全部', grade='全部', growth=false, sort='curated'}={}) {
  const q=query.trim().toLowerCase();
  const list=items.filter(item=>(category==='全部'||item.category===category)&&(grade==='全部'||item.grade===grade)&&(!growth||item.growthStory)&&(!q||[item.name,item.material,item.designer,item.provenanceId,...item.sourcePieces,...(item.partsRecipe||[]),item.lifeStageJourney,item.demandResponse,item.innovationConcept,item.growthStory].some(value=>String(value||'').toLowerCase().includes(q))));
  if(sort==='price-asc')list.sort((a,b)=>a.price-b.price);
  if(sort==='carbon-desc')list.sort((a,b)=>b.carbonSavedKg-a.carbonSavedKg);
  return list;
}
export function addToBag(bag,product,finish=product.finishOptions[0]) {
  const index=bag.findIndex(entry=>entry.id===product.id&&entry.finish===finish);
  return index<0?[...bag,{id:product.id,finish,quantity:1}]:bag.map((entry,i)=>i===index?{...entry,quantity:entry.quantity+1}:entry);
}
export function changeQuantity(bag,index,delta) {
  return bag.map((entry,i)=>i===index?{...entry,quantity:entry.quantity+delta}:entry).filter(entry=>entry.quantity>0);
}
export function bagTotals(bag,catalog) {
  let subtotal=0,carbon=0,count=0;
  for(const entry of bag){const item=catalog.find(item=>item.id===entry.id);if(item){subtotal+=item.price*entry.quantity;carbon+=item.carbonSavedKg*entry.quantity;count+=entry.quantity;}}
  const delivery=subtotal===0||subtotal>=15000?0:800;
  return {subtotal,delivery,total:subtotal+delivery,carbon,count};
}
export function restoreBag(raw,catalog) {
  try {
    const entries=JSON.parse(raw);if(!Array.isArray(entries))return [];
    return entries.filter(entry=>entry&&Number.isSafeInteger(entry.quantity)&&entry.quantity>0&&catalog.some(item=>item.id===entry.id&&item.finishOptions.includes(entry.finish))).reduce((bag,entry)=>{
      const existing=bag.find(x=>x.id===entry.id&&x.finish===entry.finish);
      if(existing)existing.quantity+=entry.quantity;else bag.push({id:entry.id,finish:entry.finish,quantity:entry.quantity});return bag;
    },[]);
  } catch{return [];}
}
