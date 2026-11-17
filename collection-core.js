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

export function filterEvents(events = [], { category = 'all', month = null, query = '' } = {}) {
  const q = query.trim().toLowerCase();
  return events.filter(event => {
    const matchCat = category === 'all' || event.type === category;
    const matchMonth = !month || event.date.startsWith(month);
    const matchQuery = !q || [event.title, event.location, event.summary, event.description, ...(event.tags || [])]
      .some(text => String(text || '').toLowerCase().includes(q));
    return matchCat && matchMonth && matchQuery;
  }).sort((a, b) => a.date.localeCompare(b.date));
}

export function getEventsForDate(events = [], dateString = '') {
  if (!dateString) return [];
  return events.filter(e => e.date === dateString);
}

export function getUpcomingEvents(events = [], fromDateString = '', limit = 6) {
  return events
    .filter(e => !fromDateString || e.date >= fromDateString)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, limit);
}

export function getMonthCalendarCells(year, monthIndex) {
  const firstDay = new Date(year, monthIndex, 1);
  const startDayOfWeek = firstDay.getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
  const prevMonthDays = new Date(year, monthIndex, 0).getDate();

  const cells = [];
  // previous month padding
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const dayNum = prevMonthDays - i;
    const m = monthIndex === 0 ? 12 : monthIndex;
    const y = monthIndex === 0 ? year - 1 : year;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    cells.push({ day: dayNum, dateStr, isCurrentMonth: false });
  }
  // current month
  for (let d = 1; d <= daysInMonth; d++) {
    const m = monthIndex + 1;
    const dateStr = `${year}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, dateStr, isCurrentMonth: true });
  }
  // next month padding (fill grid to multiple of 7)
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const m = monthIndex === 11 ? 1 : monthIndex + 2;
    const y = monthIndex === 11 ? year + 1 : year;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({ day: d, dateStr, isCurrentMonth: false });
  }
  return cells;
}

export function restoreRsvps(raw) {
  try {
    const obj = JSON.parse(raw);
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return {};
    const clean = {};
    for (const [id, val] of Object.entries(obj)) {
      if (val && typeof val === 'object' && val.code && val.name) {
        clean[id] = {
          code: String(val.code),
          name: String(val.name),
          phone: String(val.phone || ''),
          guests: Number(val.guests) || 1,
          bookedAt: String(val.bookedAt || '')
        };
      }
    }
    return clean;
  } catch {
    return {};
  }
}
