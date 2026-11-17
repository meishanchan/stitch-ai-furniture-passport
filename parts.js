// Illustrative parts only; these are not manufacturer diagrams or repair instructions.
const p = (id, name, x, y, remove, install) => ({ id, name, x, y, remove, install });
const guides = {
  'poang-armchair': [
    p('cushion','座墊',52,48,'先將座墊上的物品移開，解開固定處後取下座墊。','將座墊對齊椅架，再確認固定處貼合。'),
    p('arms','彎木扶手架',24,56,'扶穩椅架，確認接合方式後再依原說明拆卸。','將扶手架對齊接合處，依原說明固定並檢查穩定。'),
    p('frame','座面支撐架',67,68,'先移除座墊並支撐椅架，再依原說明處理連接處。','對齊支撐架與椅架，固定後確認沒有晃動。')
  ],
  'micke-desk': [
    p('top','桌面',48,27,'清空桌面並支撐桌體，確認連接處後再拆卸。','將桌面對齊桌體，依原說明固定並確認平穩。'),
    p('drawer','抽屜',72,61,'清空抽屜，查看滑軌的釋放方式後小心抽出。','對齊左右滑軌推入，確認抽拉順暢。'),
    p('support','側板與支撐腳',22,65,'支撐桌體後，依原說明逐一鬆開連接處。','對齊側板與支撐腳的接合處，固定後檢查穩定。')
  ],
  'nesna-nightstand': [
    p('glass','玻璃桌面',49,25,'清空桌面，雙手托住玻璃，小心移開並平放在軟墊上。','雙手托住玻璃，對齊支撐處後輕放。'),
    p('frame','竹製框架',27,57,'先取下玻璃，支撐框架並確認接合方式。','對齊框架接合處，固定後確認平穩。'),
    p('shelf','下層層板',55,73,'清空層板，確認固定方式後小心取出。','將層板對齊支撐處並固定，確認沒有晃動。')
  ],
  'fladis-basket': [
    p('handles','提把',42,25,'提把與籃身為編織結構，請勿剪斷或強行拆開。','如提把鬆脫，建議交由編織修復者處理。'),
    p('body','編織籃身',32,55,'籃身並非一般可拆卸零件；先清空並檢查磨損。','保持乾燥並整理形狀；破損時尋求專業修復。'),
    p('base','籃底',60,78,'不要拆開籃底的編織結構；清空後檢查磨耗。','將籃子放在乾燥平整的表面，避免長時間潮濕。')
  ],
  'billy-bookcase': [
    p('shelves','活動層板',48,44,'取下書籍，托住層板並依實際固定方式取出。','確認層板支撐件位於同一高度，放回層板。'),
    p('frame','書架框體',26,59,'清空書架並支撐櫃體，依原說明處理連接處。','依原說明對齊框體及連接處，確認結構穩固。'),
    p('back','背板',72,65,'清空並平放書架，確認背板固定方式再處理。','依原說明裝回背板；立起後依原廠指示固定於牆面。')
  ],
  'frosta-stool': [
    p('seat','圓形座面',51,29,'將圓凳倒放於軟墊上，支撐座面並確認接合方式。','將座面對齊各凳腳的接合處後固定。'),
    p('legs','彎木凳腳',33,66,'托住凳腳，依原說明逐一鬆開連接處。','將凳腳逐一對齊並固定，完成後確認四腳平穩。'),
    p('fasteners','固定配件',67,45,'確認工具與固定方式後，小心收好卸下的配件。','使用適合此家具的配件，依原說明固定並檢查。')
  ],
  'hektar-pendant': [
    p('shade','金屬燈罩',48,55,'先關閉電源並待燈具冷卻；燈具拆卸請依原廠說明或交由專業人員。','燈罩安裝請依原廠說明，並確認燈具固定穩妥。'),
    p('bulb','燈泡',49,72,'先關閉電源並待燈泡冷卻，再依原廠指示取下。','使用相容規格的燈泡，依原廠說明安裝。'),
    p('cord','吊線與固定座',51,22,'吊線及電線涉及電氣安全，請勿自行拆接，交由合格人員處理。','吊線與電線安裝請交由合格人員，依原廠說明處理。')
  ],
  'raskog-trolley': [
    p('trays','收納層籃',48,42,'清空層籃，支撐推車並確認各層固定方式。','對齊層籃與側架的接合處，依原說明固定。'),
    p('frame','側邊框架',25,60,'先移開層籃物品並扶穩車架，再依原說明拆卸。','對齊框架及層籃，固定後檢查車架穩定。'),
    p('casters','腳輪',64,81,'清空推車並側放在軟墊上，確認腳輪固定方式後再取下。','將腳輪對齊固定處，依原說明裝回並檢查滾動。')
  ],
  'gladom-side-table': [
    p('tray','圓形托盤',50,29,'清空托盤，雙手平穩地從支架上取下。','將托盤平放在支架上，確認貼合且平穩。'),
    p('frame','金屬腳架',29,68,'先取下托盤，扶住腳架並確認接合方式。','對齊腳架接合處，依原說明固定並確認平穩。'),
    p('feet','腳架接地處',67,83,'將腳架側放於軟墊上，檢查接地處是否磨損。','確認各接地處完整，放回平面後檢查是否晃動。')
  ]
};
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const getParts = id => guides[id] || [];

export function renderAssemblyStep(item, index = 0) {
  const parts = getParts(item.id);
  if (!parts.length) return '';
  const step = Math.max(0, Math.min(parts.length - 1, Number(index) || 0));
  const part = parts[step];
  return `<div class="parts-film-visual"><div class="parts-image-stage"><img src="${esc(item.image)}" alt=""><span class="parts-film-marker" style="left:${part.x}%;top:${part.y}%">${step + 1}</span></div><span class="parts-film-count">${step + 1} / ${parts.length}</span></div><div class="parts-film-copy"><strong>${esc(part.name)}</strong><p>${esc(part.install)}</p></div>`;
}

export function renderPartsOverview(item) {
  const parts = getParts(item.id);
  if (!parts.length) return '<p>目前沒有這件家具的示意零件資料。</p>';
  return `<p class="parts-intro">選擇圖上的編號或下方零件，查看拆卸與安裝說明。</p><div class="parts-diagram"><div class="parts-image-stage"><img src="${esc(item.image)}" alt="${esc(item.name)} 零件位置示意圖">${parts.map((part,i)=>`<button class="parts-marker" style="left:${part.x}%;top:${part.y}%" data-action="part-detail" data-part="${esc(part.id)}" aria-label="查看 ${esc(part.name)} 拆裝說明">${i+1}</button>`).join('')}</div></div><div class="parts-index">${parts.map((part,i)=>`<button data-action="part-detail" data-part="${esc(part.id)}"><span class="parts-index-number">${i+1}</span><span>${esc(part.name)}</span><span aria-hidden="true">→</span></button>`).join('')}</div><p class="parts-disclaimer">零件位置及拆裝流程為示意，實際結構與配件請以產品原廠說明為準。</p><section class="parts-film"><div class="parts-film-heading"><div><h3>組裝示意影片</h3><p>以步驟動畫展示組裝順序</p></div><span>示意</span></div><div id="parts-film-frame">${renderAssemblyStep(item,0)}</div><div class="parts-film-controls"><button type="button" data-action="assembly-prev" aria-label="上一個組裝步驟">上一段</button><button type="button" class="parts-play" data-action="assembly-play">播放示意</button><button type="button" data-action="assembly-next" aria-label="下一個組裝步驟">下一段</button></div></section><button class="secondary-button" data-action="parts">返回零件與養護</button>`;
}

export function renderPartDetail(item, id) {
  const part = getParts(item.id).find(entry => entry.id === id);
  if (!part) return '';
  return `<p class="part-detail-name">${esc(part.name)}</p><div class="part-detail-figure"><div class="parts-image-stage"><img src="${esc(item.image)}" alt="${esc(item.name)}"><span style="left:${part.x}%;top:${part.y}%">${getParts(item.id).indexOf(part)+1}</span></div></div><p class="parts-disclaimer">以下為操作概念示意，實際結構與配件請以產品原廠說明為準。</p><section class="part-instructions"><h3>拆卸說明</h3><ol><li>先確認這件家具的實際結構，準備安全的操作空間。</li><li>${esc(part.remove)}</li><li>將取下的部件與配件妥善收好；若無法確認拆卸方式，停止操作。</li></ol><h3>安裝說明</h3><ol><li>先檢查部件是否完整，並參考該產品的組裝說明。</li><li>${esc(part.install)}</li><li>使用前確認結構及周邊部件已妥善固定。</li></ol></section><button class="primary-button" data-action="parts-overview">返回零件圖</button>`;
}
