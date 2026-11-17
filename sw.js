const CACHE = 'archive-furniture-20261117-parts-v1';
const VERSIONED_MODULES = ['./app.js?v=parts-1', './styles.css?v=parts-1', './parts.js?v=parts-1', './core.js?v=life-timeline-1', './details.js?v=inspection-1', './details.css?v=inspection-1'];
const FILES = ['./app.js?v=inspection-1','./collection.js','./collection.css','./collection-core.js','./collection-data.js','./assets/collection/alex_lagkapten_study_desk_1794740327796.jpg','./assets/collection/ikea_mat_kallax_skadis_cabinet_1794739805232.jpg','./assets/collection/ikea_mat_lixhult_hyllis_cabinet_1794739805670.jpg','./assets/collection/ikea_mat_mammut_bror_bench_1794739802649.jpg','./assets/collection/ikea_mat_trofast_lixhult_cabinet_1794739805809.jpg','./assets/collection/myllra_minnen_sofa_bench_1794740329599.jpg','./assets/collection/skalboda_gladom_chair_1794740069194.jpg','./assets/collection/vittsjo_eket_table_1794740173576.jpg','./assets/collection/vitval_kallax_loft_desk_1794740327138.jpg','./','./index.html','./styles.css','./details.css','./app.js','./core.js','./icons.js','./details.js','./catalog.js','./manifest.webmanifest','./icons/apple-touch-icon.png','./icons/icon-192.png','./icons/icon-512.png','./icons/icon-maskable-512.png','./icons/archive.svg',...['poang-armchair','micke-desk','nesna-nightstand','fladis-basket','billy-bookcase','frosta-stool','hektar-pendant','raskog-trolley','gladom-side-table','micke-detail'].map(name=>`./assets/furniture/${name}.png`),'./assets/furniture/micke-original.jpg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll([...FILES,...VERSIONED_MODULES])).then(()=>self.skipWaiting()));});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('archive-furniture-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin)return;
  if(event.request.mode==='navigate'){
    event.respondWith(fetch(event.request).then(response=>{if(response.ok&&response.type==='basic'){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put('./index.html',copy));}return response;}).catch(()=>caches.match('./index.html')));
  }else if(['script','style'].includes(event.request.destination)){
    event.respondWith(fetch(event.request).then(response=>{if(response.ok&&response.type==='basic'){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;}).catch(()=>caches.match(event.request)));
  }else{
    event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok&&response.type==='basic'){const copy=response.clone();caches.open(CACHE).then(cache=>cache.put(event.request,copy));}return response;})));
  }
});
