import { renderCollectionRoute } from './collection.js';
import { furniture } from './catalog.js';
import { detailViews, parseRoute, routeFor, restoreState, swipeDestination } from './core.js';
import { icon } from './icons.js';
import { renderPassport, renderInspection, renderBuyback } from './details.js';

const $ = selector => document.querySelector(selector);
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ids = furniture.map(item => item.id);
const STORAGE = 'archive-furniture-v1';
let raw;
try { raw = localStorage.getItem(STORAGE); } catch { /* Private mode can restrict storage. */ }
const saved = restoreState(raw, ids);
let route = parseRoute(location.hash, ids);
let category = 'furniture';
let newest = false;
let activeDeckItem = null;
let scrollTimer;
let toastTimer;
let navigationTimer;
let programmatic = false;
const photos = new Map();
const scanning = new Set();
const scanTimers = new Map();
const selected = () => furniture.find(item => item.id === (route.itemId || saved.selectedId)) || furniture[0];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function persist() {
  try { localStorage.setItem(STORAGE, JSON.stringify(saved)); }
  catch { toast('儲存空間暫時無法使用，本次仍可繼續操作。'); }
}
function toast(message) {
  clearTimeout(toastTimer);
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 2600);
}
function navigate(view = 'home', id = selected().id) {
  const target = view === 'collection' ? '#/collection' : routeFor(view, id);
  if (location.hash === target) renderRoute();
  else location.hash = target;
}
function navButton(view, symbol, label, active) {
  return `<button class="nav-button${active ? ' active' : ''}" data-view="${view}" ${active ? 'aria-current="page"' : ''}>${icon(symbol,23)}<span>${label}</span></button>`;
}
function homeNav(collectionActive = false) {
  return `<nav class="bottom-nav" aria-label="主要導覽">${navButton('collection','box','館藏',collectionActive)}<button class="nav-button nav-add" data-action="add" aria-label="新增家具履歷">${icon('plus',26)}</button><button class="nav-button" data-action="profile">${icon('person',23)}<span>輪廓</span></button></nav>`;
}
function detailNav() {
  return `<nav class="bottom-nav" aria-label="家具頁面切換">${navButton('collection','box','館藏',false)}${navButton('passport','document','履歷',route.view==='passport')}${navButton('inspection','scan','檢測',route.view==='inspection')}${navButton('buyback','refresh-cw','回購',route.view==='buyback')}</nav>`;
}
function itemButton(item) {
  const favorite = saved.favorites.includes(item.id);
  return `<button class="furniture-item" data-item="${item.id}" aria-label="開啟 ${escape(item.name)} 的數位履歷"><span class="furniture-image"><img src="${item.image}" alt="${escape(item.name)}" width="512" height="512" ${item.id==='poang-armchair'?'fetchpriority="high"':''}>${favorite?`<span class="favorite-marker">${icon('heart',12)}</span>`:''}</span><span class="furniture-name">${escape(item.name)}</span><span class="furniture-meta"><span class="status-dot${item.status==='原裝'?' muted':''}"></span>${item.year} · ${item.status}</span></button>`;
}
function homeContent() {
  let items = [...furniture];
  if (category === 'favorites') items = items.filter(item => saved.favorites.includes(item.id));
  if (newest) items.sort((a,b)=>b.year-a.year);
  const tabs = [['furniture','傢俱'],['spaces','空間'],['buybacks','回購'],['favorites','收藏']].map(([id,label])=>`<button class="category-tab${category===id?' active':''}" data-category="${id}" role="tab" aria-selected="${category===id}">${label}</button>`).join('');
  let content;
  if (category === 'spaces') {
    const rooms = [...new Set(furniture.map(item=>item.room))];
    content = `<h2 class="list-section-title">生活裡的每一隅</h2><p class="list-section-copy">依空間整理你的家具，點選查看典藏。</p><div class="space-list">${rooms.map(room=>{const list=furniture.filter(item=>item.room===room);return `<button class="space-row" data-action="room" data-room="${room}"><img src="${list[0].image}" alt=""><span><strong>${room}</strong><small>${list.length} 件家具</small></span>${icon('arrow-right',19)}</button>`;}).join('')}</div>`;
  } else if (category === 'buybacks') {
    const bookings = furniture.filter(item=>saved.bookings[item.id]);
    content = `<h2 class="list-section-title">讓故事繼續</h2><p class="list-section-copy">選一件家具，查看循環估價與交件方式。</p>${bookings.length?`<div class="space-list">${bookings.map(item=>`<button class="space-row" data-item="${item.id}" data-start-view="buyback"><img src="${item.image}" alt=""><span><strong>${escape(item.name)}</strong><small>${escape(saved.bookings[item.id].date)} · 已建立示範預約</small></span>${icon('arrow-right',18)}</button>`).join('')}</div>`:''}<div class="furniture-grid">${items.map(itemButton).join('')}</div><p class="archive-caption" style="padding-top:24px">估價與預約為互動展示，未送出真實申請。</p>`;
  } else {
    content = `<div class="collection-meta"><span>${category==='favorites'?`已收藏 ${items.length} 件藏品`:`已建檔 ${items.length} 件藏品`}<span class="dot">·</span>自然實木 / 鋼管</span><button class="sort-button" data-action="sort" aria-label="${newest?'切換為原始排序':'依年份由新至舊排序'}">${newest?'最新':'年份'}${icon('chevron-down',13)}</button></div>${items.length?`<div class="furniture-grid">${items.map(itemButton).join('')}</div>`:`<div class="empty-state">${icon('heart',34)}<h2>把喜歡的家具留在這裡</h2><p>打開一件家具，點右上角的愛心即可收藏。</p><button class="secondary-button" data-category="furniture">瀏覽家具</button></div>`}<section class="archive-ribbon">${icon('shield',19)}<span>循環回購率：94% 已符合標準</span><button data-action="terms">查看條款</button></section><p class="archive-caption">每件家具，都值得下一段故事。<br><span style="display:inline-block;margin-top:7px;font-size:9px">典藏與檢測資料為示範</span></p>`;
  }
  return `<div class="category-tabs" role="tablist" aria-label="典藏分類">${tabs}</div>${content}`;
}
function renderHome() {
  activeDeckItem = null;
  $('#app').innerHTML = `<header class="app-header"><h1 class="app-title">Archive</h1><button class="icon-button" data-action="menu" aria-label="開啟選單">${icon('menu',25)}</button></header><main class="home-view" id="home-content">${homeContent()}</main>${homeNav()}`;
  document.title = 'Archive — 傢居數位履歷';
  updateOffline();
}
function stateFor(item) {
  return { inspectionStatus:scanning.has(item.id)?'scanning':saved.reports.includes(item.id)?'done':'idle', photoUrl: photos.get(item.id) || null, booking:saved.bookings[item.id] || null };
}
function detailContent(view,item) {
  return ({passport:renderPassport,inspection:renderInspection,buyback:renderBuyback})[view](item,stateFor(item));
}
function renderDetails() {
  const item = selected();
  if (activeDeckItem === item.id && $('.detail-deck')) { syncDetail(); return; }
  activeDeckItem = item.id;
  const favorite = saved.favorites.includes(item.id);
  $('#app').innerHTML = `<header class="app-header header-detail"><button class="icon-button" data-view="home" aria-label="返回家具目錄">${icon('arrow-left',21)}</button><div class="record-heading"><small>ARCHIVE ITEM</small><strong>典藏編號 ${escape(item.code)}</strong></div><span class="page-label">示範</span><div class="header-actions"><button class="icon-button" data-action="share" aria-label="分享家具履歷">${icon('share',21)}</button><button class="icon-button" data-action="favorite" aria-label="${favorite?'取消收藏':'收藏家具'}" aria-pressed="${favorite}">${icon('heart',21)}</button></div></header><main class="detail-deck" aria-label="家具履歷、檢測與回購，可左右滑動">${detailViews.map((view,index)=>`<article class="detail-page" id="page-${view}" data-page="${view}" aria-label="${['數位履歷','AI 狀態檢測','循環回購'][index]}">${detailContent(view,item)}</article>`).join('')}</main><div class="detail-position" aria-hidden="true">${detailViews.map(view=>`<span data-position="${view}" class="${route.view===view?'active':''}"></span>`).join('')}</div>${detailNav()}`;
  const deck = $('.detail-deck');
  deck.scrollLeft = detailViews.indexOf(route.view) * deck.clientWidth;
  let mouseStart;
  deck.addEventListener('pointerdown',event=>{
    programmatic=false;clearTimeout(navigationTimer);
    if(event.pointerType==='mouse' && !event.target.closest('button,a,input,select,summary')) mouseStart={x:event.clientX,y:event.clientY,view:route.view};
  });
  deck.addEventListener('pointerup',event=>{
    if(!mouseStart)return;
    const destination=swipeDestination(mouseStart.view,event.clientX-mouseStart.x,event.clientY-mouseStart.y);
    mouseStart=null;if(destination!==route.view)navigate(destination);
  });
  deck.addEventListener('pointercancel',()=>{mouseStart=null;});
  deck.addEventListener('wheel',()=>{programmatic=false;clearTimeout(navigationTimer);},{passive:true});
  deck.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight'].includes(event.key)||event.target.closest('input,select,textarea'))return;
    const destination=swipeDestination(route.view,event.key==='ArrowLeft'?80:-80,0);
    if(destination!==route.view){event.preventDefault();navigate(destination);}
  });
  deck.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      if (programmatic) return;
      const index = Math.max(0, Math.min(2,Math.round(deck.scrollLeft / deck.clientWidth)));
      const view = detailViews[index];
      if (route.view !== view) {
        route = { view, itemId:item.id };
        history.replaceState(null,'',routeFor(view,item.id));
        updateDetailNavigation();
      }
    },100);
  },{passive:true});
  updateDetailNavigation();
  updateOffline();
}
function updateDetailNavigation() {
  const nav = $('.bottom-nav');
  if (nav && route.view !== 'home') nav.outerHTML = detailNav();
  document.querySelectorAll('[data-position]').forEach(dot=>dot.classList.toggle('active',dot.dataset.position===route.view));
  document.querySelectorAll('.detail-page').forEach(page=>page.inert=page.dataset.page!==route.view);
  document.title = `${selected().name} · ${{passport:'數位履歷',inspection:'狀態檢測',buyback:'循環回購'}[route.view]} — Archive`;
}
function syncDetail() {
  const deck = $('.detail-deck');
  const index = detailViews.indexOf(route.view);
  programmatic = true;
  clearTimeout(navigationTimer);
  deck.scrollTo({left:index*deck.clientWidth,behavior:reducedMotion.matches?'instant':'smooth'});
  updateDetailNavigation();
  navigationTimer = setTimeout(()=>{ programmatic=false; },500);
}
function refreshPage(view) {
  if (route.view==='home') return;
  const element = $(`#page-${view}`);
  if (element) { const top=element.scrollTop; element.innerHTML=detailContent(view,selected()); element.scrollTop=top; }
}
function renderRoute() {
  closeSheet();
  clearTimeout(scrollTimer);
  clearTimeout(navigationTimer);
  if (renderCollectionRoute({ nav: () => homeNav(true), showSheet, closeSheet, toast })) {
    route = { view: 'collection', itemId: null };
    activeDeckItem = null;
    updateOffline();
    return;
  }
  route = parseRoute(location.hash, ids);
  if (route.itemId) {saved.selectedId=route.itemId;persist();renderDetails();}
  else renderHome();
}
function showSheet(title,content) {
  const sheet = $('#sheet');
  sheet.innerHTML = `<div class="sheet-handle"></div><div class="sheet-header"><h2 id="sheet-title">${title}</h2><button class="icon-button" data-action="close-sheet" aria-label="關閉">${icon('close',21)}</button></div><div class="sheet-content">${content}</div>`;
  if (!sheet.open) sheet.showModal();
}
function closeSheet() { $('#sheet').close(); }
function termsSheet() {
  showSheet('循環回購說明',`<p>讓仍然完好的家具，有機會繼續被使用。</p><ul class="sheet-list"><li>${icon('check-circle',20)}結構完整，主要零件齊全</li><li>${icon('check-circle',20)}表面清潔，無嚴重破損或受潮</li><li>${icon('store',20)}最終狀態與價格須由實際服務門市確認</li></ul><div class="demo-note">此頁保留原始設計的展示數據，並非 IKEA 官方服務。估價、認證與預約皆為示範，不會向門市送出申請。</div><button class="primary-button" data-action="close-sheet">了解</button>`);
}
function bookingSheet() {
  const item=selected();
  const existing=saved.bookings[item.id];
  const method=$('input[name="handover-method"]:checked')?.value || existing?.method || 'store';
  const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);
  const minDate = new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei',year:'numeric',month:'2-digit',day:'2-digit'}).format(tomorrow);
  const date=existing?.date && existing.date>=minDate ? existing.date : minDate;
  showSheet('預約家具的新旅程',`<p><strong>${escape(item.name)}</strong><br><span class="muted">示範估價 NT$ ${item.priceMin.toLocaleString()}–${item.priceMax.toLocaleString()}</span></p><form id="booking-form"><label class="field">交件方式<select name="method"><option value="store" ${method==='store'?'selected':''}>自行送至門市</option><option value="pickup" ${method==='pickup'?'selected':''}>預約到府收件</option></select></label><label class="field">服務據點<select name="store"><option>IKEA 新店店</option><option>IKEA 新莊店</option><option>IKEA 內湖店</option><option>IKEA 台中店</option><option>IKEA 高雄店</option></select></label><div class="booking-grid"><label class="field">希望日期<input name="date" type="date" min="${date}" value="${date}" required></label><label class="field">希望時段<select name="time"><option>10:00–12:00</option><option>13:00–15:00</option><option>15:00–17:00</option></select></label></div><label class="sheet-check"><input type="checkbox" required><span>我了解這是互動展示，預約只儲存在這台裝置，不會送出真實申請。</span></label><button class="primary-button" type="submit">儲存示範預約 ${icon('arrow-right',18)}</button></form>`);
  $('#booking-form input[name="date"]').min=minDate;
  if(existing){$('#booking-form select[name="store"]').value=existing.store;$('#booking-form select[name="time"]').value=existing.time;}
}
function profileSheet() {
  showSheet('我的典藏',`<p>每件家具，都值得被好好記住。</p><ul class="sheet-list"><li>${icon('box',20)}<span>${furniture.length} 件家具已建檔</span></li><li>${icon('heart',20)}<span>${saved.favorites.length} 件收藏</span></li><li>${icon('scan',20)}<span>${saved.reports.length} 件已完成展示檢測</span></li><li>${icon('calendar',20)}<span>${Object.keys(saved.bookings).length} 筆示範預約</span></li></ul><button class="secondary-button" data-action="install">${icon('plus',18)}加入 iPhone 主畫面</button><button class="secondary-button" data-action="export-all">${icon('download',18)}匯出我的典藏記錄</button><div class="demo-note">收藏、檢測與示範預約儲存在這台裝置。清除網站資料後會一併移除。</div>`);
}
function installSheet() {
  const installed=matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  showSheet(installed?'已加入主畫面':'把 Archive 放在主畫面',installed?`<p>你正在以網頁 App 使用 Archive。</p><button class="primary-button" data-action="close-sheet">繼續瀏覽</button>`:`<ol class="install-steps"><li>用 iPhone 的 <strong>Safari</strong> 開啟這個網址。</li><li>點選<strong>分享</strong> ${icon('share',16)}。</li><li>選擇<strong>加入主畫面</strong>。</li><li>如有「打開為網頁 App」，請將它開啟，再點<strong>加入</strong>。</li></ol><p class="muted">之後點主畫面的 Archive 圖示，就能直接瀏覽與左右滑動。</p><button class="primary-button" data-action="close-sheet">了解</button>`);
}
function download(data,name) {
  const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  toast('典藏記錄已匯出。');
}
async function share() {
  const item=selected();const url=new URL(routeFor('passport',item.id),location.href).href;
  if(navigator.share){try{await navigator.share({title:`${item.name} · Archive`,text:'每件家具，都值得下一段故事。',url});return;}catch(error){if(error.name==='AbortError')return;}}
  try{await navigator.clipboard.writeText(url);toast('家具履歷連結已複製。');}
  catch{showSheet('分享家具履歷',`<p>複製以下網址：</p><input aria-label="分享連結" value="${escape(url)}" readonly style="width:100%;padding:12px;border:1px solid var(--line);border-radius:8px" onclick="this.select()">`);}
}
const actions={
  'close-sheet':closeSheet,
  'menu':()=>showSheet('Archive',`<ul class="sheet-list"><li><button data-action="install">${icon('plus',21)}加入主畫面</button></li><li><button data-action="profile">${icon('person',21)}我的典藏</button></li><li><button data-action="terms">${icon('refresh-cw',21)}循環回購說明</button></li></ul><p class="muted" style="font-size:12px">把每一段生活，好好收藏。</p>`),
  'install':installSheet,'profile':profileSheet,'terms':termsSheet,'book':bookingSheet,'share':share,
  'sort':()=>{newest=!newest;$('#home-content').innerHTML=homeContent();},
  'favorite':()=>{const id=selected().id;const index=saved.favorites.indexOf(id);if(index<0)saved.favorites.push(id);else saved.favorites.splice(index,1);persist();const button=$('[data-action="favorite"]');button.setAttribute('aria-pressed',index<0);button.setAttribute('aria-label',index<0?'取消收藏':'收藏家具');toast(index<0?'已加入收藏。':'已取消收藏。');},
  'go-buyback':()=>navigate('buyback'),'go-inspection':()=>navigate('inspection'),'go-passport':()=>navigate('passport'),
  'capture':()=>$('#photo-input').click(),
  'inspect-start':()=>{
    const item=selected();if(scanning.has(item.id))return;
    scanning.add(item.id);refreshPage('inspection');
    scanTimers.set(item.id,setTimeout(()=>{scanning.delete(item.id);scanTimers.delete(item.id);if(!saved.reports.includes(item.id))saved.reports.push(item.id);persist();if(selected().id===item.id){refreshPage('inspection');toast('展示檢測已完成，可查看狀態報告。');}},1800));
  },
  'parts':()=>showSheet('零件與養護',`<p>${escape(selected().name)} 的日常照顧，從小地方開始。</p><ul class="sheet-list"><li>${icon('wrench',20)}定期確認接合處與固定零件</li><li>${icon('check-circle',20)}以微濕軟布清潔後擦乾</li><li>${icon('box',20)}查詢零件時，備妥型號與產品照片</li></ul><div class="demo-note">此頁為養護流程展示，未連接原廠零件庫，也不會送出訂單。</div><button class="primary-button" data-action="close-sheet">完成</button>`),
  'download':()=>download({furniture:selected(),inspection:saved.reports.includes(selected().id)?'demonstration-completed':'not-started',booking:saved.bookings[selected().id]||null,demo:true},`${selected().id}-passport.json`),
  'export-all':()=>download({furniture,state:saved,demo:true},'archive-collection.json'),
  'room':button=>{const room=button.dataset.room;showSheet(room,`<div class="furniture-grid" style="padding:8px 0 20px">${furniture.filter(item=>item.room===room).map(itemButton).join('')}</div>`);},
  'add':()=>showSheet('新增家具履歷',`<p>選取照片，開始記錄一件家具。</p><button class="primary-button" data-action="capture">${icon('camera',21)}拍攝或選取家具照片</button><button class="secondary-button" data-action="sample-inspection">${icon('scan',20)}先用現有家具體驗檢測</button><div class="demo-note">這個版本先以九件家具展示完整流程。照片只在這台裝置預覽，不會上傳。</div>`),
  'sample-inspection':()=>{closeSheet();navigate('inspection');},
};
document.addEventListener('click',event=>{
  const item=event.target.closest('[data-item]');
  if(item){closeSheet();navigate(item.dataset.startView || (category==='buybacks'?'buyback':'passport'),item.dataset.item);return;}
  const tab=event.target.closest('[data-category]');
  if(tab){category=tab.dataset.category;$('#home-content').innerHTML=homeContent();return;}
  const view=event.target.closest('[data-view]');
  if(view){navigate(view.dataset.view);return;}
  const action=event.target.closest('[data-action]');
  if(action && actions[action.dataset.action]) actions[action.dataset.action](action);
});
document.addEventListener('submit',event=>{
  if(event.target.id!=='booking-form')return;
  event.preventDefault();const data=new FormData(event.target);const item=selected();
  const booking={method:data.get('method'),store:data.get('store'),date:data.get('date'),time:data.get('time'),code:`AR-${Date.now().toString(36).slice(-6).toUpperCase()}`};
  saved.bookings[item.id]=booking;persist();refreshPage('buyback');
  showSheet('已儲存示範預約',`<div class="booking-confirmation">${icon('check-circle',44)}<h3>下一段故事，準備出發。</h3><p>${escape(item.name)}<br>${escape(booking.date)} · ${escape(booking.time)}<br>${booking.method==='pickup'?'到府收件':escape(booking.store)}</p><strong>${booking.code}</strong><p class="demo-note">此為本機保存的示範預約，未向門市送出。</p><button class="primary-button" data-action="close-sheet">返回回購頁面</button></div>`);
});
$('#photo-input').addEventListener('change',event=>{
  const file=event.target.files?.[0];if(!file)return;
  if(!file.type.startsWith('image/')){toast('請選擇一張家具照片。');return;}
  if(file.size>25*1024*1024){toast('請選擇小於 25 MB 的照片。');return;}
  const item=selected();if(photos.has(item.id))URL.revokeObjectURL(photos.get(item.id));
  photos.set(item.id,URL.createObjectURL(file));saved.reports=saved.reports.filter(id=>id!==item.id);persist();
  closeSheet();if(route.view==='inspection')refreshPage('inspection');else navigate('inspection',item.id);
  toast('照片已選取，僅保留在這台裝置。');event.target.value='';
});
$('#sheet').addEventListener('click',event=>{if(event.target===$('#sheet')){const r=$('#sheet').getBoundingClientRect();if(event.clientY<r.top || event.clientX<r.left || event.clientX>r.right)closeSheet();}});
window.addEventListener('hashchange',renderRoute);
window.addEventListener('resize',()=>{if(route.view!=='home'&&$('.detail-deck')){$('.detail-deck').scrollLeft=detailViews.indexOf(route.view)*$('.detail-deck').clientWidth;}});
function updateOffline(){document.querySelectorAll('.offline-indicator').forEach(node=>node.remove());if(!navigator.onLine)$('#app').insertAdjacentHTML('beforeend','<span class="offline-indicator">離線瀏覽</span>');}
window.addEventListener('online',updateOffline);window.addEventListener('offline',updateOffline);
renderRoute();
if('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(()=>{/* Core browsing still works if caching is unavailable. */});
