import { icon } from './icons.js';

const escape = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
const number = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
const money = (value) => new Intl.NumberFormat('zh-TW').format(number(value, 0));
const range = (item) => `NT$ ${money(item.priceMin)}–${money(item.priceMax)}`;
const score = (item) => Math.min(100, Math.max(0, Math.round(number(item.condition, 84))));
const grade = (item) => item.id === 'micke-desk' ? 'B+' : score(item) >= 95 ? 'A' : score(item) >= 90 ? 'A−' : score(item) >= 80 ? 'B+' : 'B';
const safeImage = (value) => /^(?:\.\.?\/|blob:|data:image\/(?:png|jpeg|webp);)/i.test(String(value ?? '')) ? escape(value) : '';
const image = (item, className = '', source = item.image) => `<img class="${className}" src="${safeImage(source)}" alt="${escape(item.name)}" loading="eager" decoding="async">`;
const sample = '<span class="d-sample">示範資料</span>';
const heading = (title, meta = '') => `<div class="d-section-heading"><h2>${title}</h2>${meta ? `<span>${meta}</span>` : ''}</div>`;
const action = (label, name, secondary = false, glyph = 'arrow-right') => `<button class="d-button${secondary ? ' d-button-secondary' : ''}" type="button" data-action="${name}"><span>${label}</span>${glyph ? icon(glyph, 18) : ''}</button>`;

export function renderPassport(item, state = {}) {
  const isMicke = item.id === 'micke-desk';
  const entryYear = escape(item.year);
  const today = state.today || new Date();
  const days = Math.max(0, Math.floor((Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()) - Date.UTC(Number(item.year), 3, 1)) / 86400000));
  const events = [
    { date: '2026-03-01', text: '影像掃描與狀態檢視：結構評估良好，可進一步評估回購與循環整新。', note: `數位履歷 · 模擬檢測記錄 · 評定 ${grade(item)}`, sample: true },
    { date: '2025-05-01', text: '無數歡笑與深夜傾談，都在這裡留下生活的溫度。', note: '生活記憶 · 示範紀錄', sample: true },
    { date: '2024-08-01', text: '表面微瑕修護保養：清潔表面並檢視日常使用痕跡。', note: '保養方式：自行養護 · 示範紀錄', sample: true },
    { date: `${Math.max(number(item.year, 2022), 2022)}-11-01`, text: isMicke ? '零件維護記錄：檢視右側抽屜滑軌與連接螺絲。' : '零件維護記錄：檢視結構連接處與固定配件。', note: '日常維護 · 示範紀錄', sample: true },
    { date: `${item.year}-04-01`, text: `${item.name}入庫，建立家具電子身分履歷。`, note: `典藏編號：${item.code} · 示範紀錄`, sample: true },
    ...(state.memories || []).map(entry => ({ ...entry, note: '生活記憶' })),
  ].sort((a, b) => b.date.localeCompare(a.date));
  return `<div class="d-page d-passport">
    <section class="d-specimen" aria-labelledby="d-item-title">
      <div class="d-hero-object">${image(item, 'd-hero-image')}<span class="d-scale">SCALE · 1:15</span></div>
      <div class="d-specimen-caption">
        <p class="d-archive-meta"><i aria-hidden="true"></i>家具數位典藏 · ${entryYear} 入庫</p>
        <div class="d-title-row"><h1 id="d-item-title">${escape(item.name)}</h1><span class="d-companion">陪伴 ${money(days)} 天</span></div>
        <p class="d-material-caption">${escape(item.material)} <span aria-hidden="true">·</span> ${escape(item.dimensions)}</p>
      </div>
    </section>

    <section>
      <div class="d-section-heading d-timeline-heading">
        <div class="d-timeline-title"><h2>生活時間軸</h2><span>共 ${events.length} 筆</span></div>
        <button class="d-add-memory" type="button" data-action="add-memory">${icon('plus', 15)} 新增生活紀錄</button>
      </div>
      <ol class="d-timeline">
        ${events.map((entry, index) => `<li${index === 0 ? ' class="d-timeline-current"' : ''}><div class="d-log-date">${escape(entry.date.replaceAll('-', '.'))}${!entry.sample ? '<span class="d-small-tag">生活記憶</span>' : ''}</div><p>${escape(entry.text)}</p><span class="d-log-note">${escape(entry.note)}</span></li>`).join('')}
      </ol>
    </section>

    <section class="d-material-section">
      <details class="d-material-details" open>
        <summary><h2>物料與工藝標記</h2>${icon('chevron-down', 18)}</summary>
        <dl class="d-spec-grid">
          <div><dt>主要材質</dt><dd>${escape(item.material)}</dd></div>
          <div><dt>外觀與規格</dt><dd>${escape(item.description)}</dd></div>
          <div><dt>完整尺寸</dt><dd>${escape(item.dimensions)}</dd></div>
          <div><dt>典藏年期</dt><dd>${entryYear} 年</dd></div>
        </dl>
      </details>
    </section>

    <section class="d-circular-actions">
      <div class="d-route-panel">
        <div class="d-route-label"><span>循環再造計劃</span>${sample}</div>
        ${action(`申請回購（預估 ${range(item)}）`, 'go-buyback')}
        ${action('索取螺絲與維護零件', 'parts', true, 'wrench')}
      </div>
    </section>
  </div>`;
}

const inspectionAngles = [
  { label: '正面', hint: '讓家具完整入鏡' },
  { label: '側面', hint: '拍下家具側邊與結構' },
  { label: '細節', hint: '靠近拍攝表面或使用痕跡' },
];

export function renderInspectionCapture(item, photos = []) {
  const count = photos.filter(Boolean).length;
  return `<p class="inspection-capture-intro">依序拍攝 ${escape(item.name)} 的三個角度，也可以選擇現有照片。</p>
    <div class="inspection-capture-list">${inspectionAngles.map((angle, index) => `<div class="inspection-capture-row">
      <div class="inspection-capture-thumb">${photos[index] ? `<img src="${safeImage(photos[index])}" alt="${angle.label}照片預覽">` : icon('camera', 20)}</div>
      <div class="inspection-capture-copy"><strong>${angle.label}</strong><span>${angle.hint}</span></div>
      <button type="button" class="inspection-capture-button" data-action="capture-angle" data-angle="${index}" aria-label="${photos[index] ? '重新拍攝' : '拍攝'}${angle.label}">${photos[index] ? '重新拍攝' : '拍攝'}</button>
    </div>`).join('')}</div>
    <p class="inspection-capture-note">${count} / 3 張照片 · 照片僅在本次使用時保留，不會上傳。</p>
    <button class="primary-button" type="button" data-action="inspect-analyze" ${count === 3 ? '' : 'disabled'}>開始示範分析 ${icon('arrow-right', 18)}</button>
    <p class="inspection-capture-disclaimer">分析結果為預設示範資料，並非實際影像辨識。</p>`;
}

export function renderInspection(item, state = {}) {
  const isMicke = item.id === 'micke-desk';
  const scanning = state.inspectionStatus === 'scanning';
  const completed = state.inspectionStatus === 'done';
  const photos = Array.isArray(state.photos) ? state.photos : [];
  const currentScore = isMicke ? 84 : score(item);
  return `<div class="d-page d-inspection">
    <section class="d-inspection-identity">
      <div><span class="d-reference">ITEM REF. ${escape(item.code)}</span><h1>${escape(item.name)}</h1></div>
      <div class="d-identity-spec"><span>${escape(item.dimensions)}</span><span>${sample}</span></div>
    </section>

    <section class="d-report-summary" aria-live="polite">
      <div class="d-score-row"><div class="d-score"><strong>${scanning ? '—' : currentScore}</strong><span>/ 100</span></div><span class="d-grade">${scanning ? '示範分析中' : `等級 ${grade(item)}（良好微痕跡）`}</span></div>
      <div class="d-condition-note">${icon(scanning ? 'scan' : 'check-circle', 20)}<p>${scanning ? '正在產生示範結果，請稍候。' : `結構完整穩固，${isMicke ? '桌面邊緣有 2 處細微擦傷' : '表面可見輕微日常使用痕跡'}，建議進一步檢視並評估循環整新。`}</p></div>
      <div class="d-report-state"><span>${completed ? '模擬檢測已完成' : scanning ? '模擬檢測進行中' : '以下為家具狀態示範報告'}</span>${sample}</div>
    </section>

    <section class="d-visual-inspection">
      <div class="d-gallery-heading"><h2>多角度影像檢測</h2><p>拍攝正面、側面與細節，留下家具的完整紀錄。</p></div>
      <button class="d-button d-inspection-start" type="button" data-action="inspect-start" ${scanning ? 'disabled' : ''}>${icon('camera', 19)}<span>${scanning ? '示範分析中…' : photos.length ? '重新檢測' : '開始檢測'}</span></button>
      ${photos.length ? `<div class="d-gallery-meta"><strong>檢測照片</strong><span>${photos.length} 張</span></div><div class="d-inspection-gallery">${photos.map((url, index) => `<figure class="d-inspection-figure"><div class="d-inspection-image"><img src="${safeImage(url)}" alt="${escape(item.name)}的${inspectionAngles[index]?.label || '檢測'}照片" class="d-uploaded-image"></div><figcaption>${inspectionAngles[index]?.label || '檢測照片'}</figcaption></figure>`).join('')}</div><p class="d-photo-note">照片僅在本次使用時保留，不會上傳。</p>` : `<div class="d-inspection-empty"><span>${icon('camera', 22)}</span><div><strong>尚未加入照片</strong><p>開始檢測後，依照指引拍攝或選取照片。</p></div></div>${completed ? '<p class="d-photo-note">照片僅在本次使用時保留；重新整理後可再次拍攝。</p>' : ''}`}
    </section>

    <section>
      ${heading('結構與零配件檢測', '4 項示範指標')}
      <div class="d-check-list">
        ${inspectionRow('搖晃測試', '雙手平壓穩固', '正常')}
        ${inspectionRow(isMicke ? '抽屜啟閉' : '接合部位', isMicke ? '軌道滑動順暢' : '固定連接處無明顯鬆動', '正常')}
        ${inspectionRow('材質形變', '無明顯受潮與形變', '良好')}
        ${inspectionRow('固定配件', '組裝五金完整度', '100%')}
      </div>
    </section>

    <section class="d-route-panel d-inspection-route">
      <div class="d-route-label"><span>循環再造建議</span>${icon('leaf', 19)}</div>
      <h2>建議流向：回購或清潔整新</h2><p>預估回購回饋金 <strong>${range(item)}</strong></p>
      <div class="d-alternative"><span>替代方案</span><button class="d-text-link" type="button" data-action="parts">查看自行修復與零件資訊</button></div>
    </section>

    <div class="d-bottom-action">${action('下一步：前往回購申請', 'go-buyback')}<p>估價與檢測結果為示範資料，實際服務以門市公告為準。</p></div>
  </div>`;
}

function inspectionRow(title, description, result) {
  return `<div class="d-check-row"><span class="d-check-dot" aria-hidden="true"></span><div><h3>${title}</h3><p>${description}</p></div><span>${result}</span></div>`;
}

export function renderBuyback(item, state = {}) {
  const estimated = item.id === 'micke-desk' ? 950 : Math.round((number(item.priceMin, 0) + number(item.priceMax, 0)) / 2 / 50) * 50;
  const booking = state.booking;
  const pickup = booking?.method === 'pickup';
  return `<div class="d-page d-buyback">
    <section class="d-buyback-item">
      <div class="d-buyback-item-main"><div class="d-buyback-thumbnail">${image(item)}</div><div class="d-buyback-item-copy"><div class="d-buyback-title"><h1>${escape(item.name)}</h1><span class="d-small-tag">評級 ${grade(item)}</span></div><p>典藏碼 #${escape(item.code)} · ${escape(item.description)}</p><div class="d-estimate"><span>預估回購金</span><strong>NT$ ${money(estimated)}</strong></div></div></div>
      <div class="d-buyback-item-note"><p>以交件當日的最終核驗品況為準</p>${sample}</div>
    </section>

    <ol class="d-progress" aria-label="回購進度">
      <li class="d-progress-complete"><span>01 申請</span><i></i><small>資料就緒</small></li><li class="d-progress-complete"><span>02 預審</span><i></i><small>示範評估</small></li><li class="${booking ? 'd-progress-complete' : ''}"><span>03 交件</span><i></i><small>${booking ? '已建示範預約' : '即將進行'}</small></li><li><span>04 儲值</span><i></i><small>驗收後辦理</small></li>
    </ol>

    <section class="d-handover-section">
      <h2>交付方式選擇</h2>
      <div class="d-handover-option d-store-option"><input id="d-handover-store" type="radio" name="handover-method" value="store" ${pickup ? '' : 'checked'}><label class="d-handover-heading" for="d-handover-store">${icon('store', 20)}<strong>預約門市親送</strong><span class="d-free-tag">免運費</span></label><div class="d-store-details"><span class="d-store-name">${escape(booking?.store || 'IKEA 新店店 · 顧客服務部')}</span><button class="d-date-select" type="button" data-action="book">${icon('calendar', 17)}<span>${booking ? `${escape(booking.date)} ${escape(booking.time || '')}` : '選擇交件日期與時段'}</span>${icon('chevron-down', 16)}</button><span class="d-handover-perk">${icon('check-circle', 15)}<span>到店後出示數位報到憑證</span></span></div></div>
      <div class="d-handover-option d-pickup-option"><input id="d-handover-pickup" type="radio" name="handover-method" value="pickup" ${pickup ? 'checked' : ''}><label class="d-handover-heading" for="d-handover-pickup">${icon('truck', 20)}<strong>預約大型家具到府收件</strong><span class="d-pickup-cost">+NT$ 200</span></label><span class="d-pickup-info">於預約步驟填寫收件資訊，費用為示範估算。</span></div>
    </section>

    <section>
      ${heading('交件前準備', '3 項須知')}
      <div class="d-preparation">
        ${preparation(item.id === 'micke-desk' ? '抽屜與滑軌維持安裝完整' : '家具結構與組裝配件維持完整', '鬆脫的螺絲請一併放入夾鏈袋交付')}
        ${preparation('擦拭表面髒污並清除個人貼紙', '殘膠可能影響最終品況判定')}
        ${preparation('攜帶手機出示數位報到憑證', '至服務台出示預約資訊，進行現場覆驗')}
      </div>
    </section>

    <section>
      <h2>回饋發放方式</h2>
      <div class="d-payout"><div><span>${icon('wallet', 20)}<strong>電子儲值金／禮券</strong></span><span>現場驗收後辦理</span></div><div><span>${icon('leaf', 18)}<span>綠色永續點數</span></span><strong>+${Math.round(estimated / 10)} 點 <small>示範</small></strong></div></div>
    </section>

    ${booking ? `<section class="d-booking-summary" aria-live="polite"><div>${icon('check-circle', 20)}<h2>已建立示範預約</h2></div><p>${escape(booking.code || '')}${booking.date ? ` · ${escape(booking.date)}` : ''}</p><span>預約資料僅儲存在此裝置，未送出至門市。</span></section>` : ''}
    <div class="d-bottom-action">${action(booking ? '查看或變更預約' : '確認預約並產生報到碼', 'book')}<button class="d-text-link d-terms-link" type="button" data-action="terms">查看回購條款與示範說明</button></div>
  </div>`;
}

function preparation(title, description) {
  return `<div>${icon('check-circle', 18)}<div><h3>${title}</h3><p>${description}</p></div></div>`;
}
