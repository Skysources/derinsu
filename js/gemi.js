/* =========================================================
   DERİNSU — gemiler ve gemi ambarı
   Fıçı yok: tutulan balık kullanılan geminin ambarına girer. Ambar geminin biçiminde yatay bir ızgaradır
   (pruva sağda). Balık büyüklüğüne göre 1×1, 2×1 ya da 2×2 yer kaplar; aynı türden balıklar
   bir yığında durur (8 / 4 / 2). Yer bulunamazsa ambar doludur. Yığınlar sürüklenip taşınır,
   2×1 yığın döndürülür, "Düzenle" ambarı büyükten küçüğe yeniden dizer.
   Her geminin ambarı ayrıdır; gemi yalnız limanda değiştirilir. Tersane: gemileri gör, al, geç.
   app.js'teki yardımcıları çağrı anında kullanır.
   ========================================================= */
'use strict';

/* ---------- Durum ---------- */
function ensureShips() {
  if (!S.ships) S.ships = { marti: { hold: [] } };
  if (!S.ship || !S.ships[S.ship]) S.ship = 'marti';
  // eski kayıt: fıçı kademesine göre gemi verilir, fıçıdaki balıklar ambara taşınır (sığmayan Hal fiyatından satılır)
  if (S.fici !== undefined) {
    if (S.fici >= 3) S.ships.yakamoz = S.ships.yakamoz || { hold: [] };
    if (S.fici >= 5) S.ships.lodos = S.ships.lodos || { hold: [] };
    delete S.fici;
  }
  if (S.bag && Object.keys(S.bag).length) {
    let sold = 0;
    for (const [id, b] of Object.entries(S.bag)) {
      const f = FISH_BY[id]; if (!f) continue;
      for (let k = 0; k < b.n; k++) if (!addFish(f, b.kg / b.n, b.val / b.n)) sold += b.val / b.n;
    }
    if (sold) S.silver += Math.round(sold);
  }
  delete S.bag;
  // ambar yatay çizilmeye başladı: eski yerleşimler yeni biçimle baştan dizilir, sığmayan Hal fiyatından satılır
  if (S.fishV !== 2) {
    for (const id of Object.keys(S.ships)) S.ships[id].hold = S.ships[id].hold.filter(st => { if (!FISH_BY[st.id]) { S.silver += Math.round(st.val); return false; } st.q = st.q || 0; return true; });
    for (const k of Object.keys(S.dex)) if (!FISH_BY[k]) delete S.dex[k];
    if (S.st.best && !FISH_BY[S.st.best.id]) S.st.best = null;
    S.fishV = 2;
  }
  // ambar artık düz yığın listesi (Astralis'teki eşyalar gibi): tür + nadirlik tek yığın, hücre ve biçim yok
  if (S.holdV !== 3) {
    for (const id of Object.keys(S.ships)) {
      const G = {};
      for (const st of S.ships[id].hold) { if (!FISH_BY[st.id]) { S.silver += Math.round(st.val || 0); continue; }
        const k = st.id + ':' + (st.q || 0), o = G[k] || (G[k] = { id: st.id, q: st.q || 0, n: 0, kg: 0, val: 0 }); o.n += st.n; o.kg = +(o.kg + st.kg).toFixed(2); o.val += st.val; }
      S.ships[id].hold = Object.values(G);
    }
    S.holdV = 3;
  }
  // tek envanter: balıklar artık gemiye bağlı değil; bütün gemilerin ambarı S.fish'te birleşir
  if (S.holdV !== 4) {
    const G = {};
    for (const id of Object.keys(S.ships)) { for (const st of S.ships[id].hold || []) { if (!FISH_BY[st.id]) continue;
      const k = st.id + ':' + (st.q || 0), o = G[k] || (G[k] = { id: st.id, q: st.q || 0, n: 0, kg: 0, val: 0 }); o.n += st.n; o.kg = +(o.kg + st.kg).toFixed(2); o.val += st.val; } S.ships[id].hold = []; }
    S.fish = Object.values(G); S.holdV = 4;
  }
  if (!S.fish) S.fish = [];
}
const curShip = () => shipById(S.ship);
const holdOf = () => S.fish;      // envanterdeki balık yığınları
// tek envanter, tek kapasite: balık + eşya toplamı INV_CAP'i geçemez (ad uyumu için totalCells/usedCells adları duruyor)
const totalCells = () => INV_CAP;
const holdN = () => holdOf().reduce((n, s) => n + s.n, 0);
const boxN = () => Object.values(S.box).reduce((n, v) => n + (v > 0 ? v : 0), 0);
const usedCells = () => holdN() + boxN();
const freeCells = () => totalCells() - usedCells();
const holdKg = (id = S.ship) => holdOf(id).reduce((n, s) => n + s.kg, 0);
// tür başına toplam (satış, atölye, bildirim): { id: { n, kg, val } }
function bag(id = S.ship) {
  const o = {};
  for (const s of holdOf(id)) { const b = o[s.id] || (o[s.id] = { n: 0, kg: 0, val: 0 }); b.n += s.n; b.kg += s.kg; b.val += s.val; }
  return o;
}
const bagVal = (id = S.ship) => holdOf(id).reduce((t, s) => t + Math.round(s.val * fishSellK(spotById(FISH_BY[s.id].spot))), 0);

/* ---------- Yığınlar: aynı tür ve aynı nadirlik tek yığın ---------- */
function addFish(f, kg, val, q = 0) {
  if (usedCells() >= totalCells()) return false;
  const hold = holdOf(), st = hold.find(s => s.id === f.id && (s.q || 0) === q);
  if (st) { st.n++; st.kg = +(st.kg + kg).toFixed(2); st.val += val; return true; }
  hold.push({ id: f.id, q, n: 1, kg: +kg.toFixed(2), val: Math.round(val) });
  return true;
}
const canAdd = () => usedCells() < totalCells();
// türden k balık al (en düşük nadirlikten başlayarak): { val: alınanların değeri, qs: nadirliğe göre adet }
function removeFish(fid, k) {
  const hold = holdOf(); let val = 0; const qs = QUAL.map(() => 0);
  for (const s of hold.filter(x => x.id === fid).sort((a, b) => (a.q || 0) - (b.q || 0) || a.n - b.n)) {
    if (k <= 0) break;
    const t = Math.min(k, s.n), share = t / s.n;
    val += s.val * share; s.kg = +(s.kg * (1 - share)).toFixed(2); s.val = Math.round(s.val * (1 - share)); s.n -= t; k -= t; qs[s.q || 0] += t;
  }
  S.fish = hold.filter(s => s.n > 0);
  return { val, qs };
}
function sellStack(i) {
  const s = holdOf()[i]; if (!s) return 0;
  const got = Math.round(s.val * fishSellK(spotById(FISH_BY[s.id].spot)));
  holdOf().splice(i, 1); S.silver += got; S.st.earned += got; questHook('sell', got); resumeIfRoom(); bumpCur('#curSilver');
  return got;
}

/* ---------- Tersane ---------- */
function buyShip(id) {
  const sh = shipById(id), prev = SHIPS[sh.t - 2];
  if (S.ships[id] || (prev && !S.ships[prev.id]) || S.silver < sh.cost || S.pearl < sh.pearl) return;
  S.silver -= sh.cost; S.pearl -= sh.pearl; S.ships[id] = { hold: [] };
  Notices.notify({ type: 'grand', rarity: ['white', 'green', 'blue', 'orange', 'red'][sh.t - 1], color: sh.c, slot: `<span class="nt-ship">${ShipArt.side(id)}</span>`, label: 'Tersane', title: sh.name, src: sh.kind,
    facts: `<span class="nchip">${rom(sh.t)}. kademe</span><span class="nchip">Yelken ×${fmtDec(sh.sail, 2)}</span>`, done: 'Limana yanaştı' });
  haptic([15, 40, 25]);
  if (S.loc !== 'sea') useShip(id, true);
}
function useShip(id, quiet) {
  if (!S.ships[id] || S.ship === id) return;
  if (S.loc === 'sea') { toast('Gemi yalnız limanda değişir', { tone: 'warn', sub: 'önce limana dön' }); return; }
  S.ship = id; seaViewId = null;
  if (!quiet) toast(`${shipById(id).name} kullanılıyor`, { label: 'Tersane' });
}
function openTersane(i = SHIPS.indexOf(curShip())) { openWin('tersane', renderTersane, { sel: i }); }      // içeriği kadar: pencere ortalanır
function renderTersane(w) {
  const i = clamp(+w.sel || 0, 0, SHIPS.length - 1), sh = SHIPS[i], own = !!S.ships[sh.id], cur = S.ship === sh.id, prev = SHIPS[i - 1];
  const lock = !own && prev && !S.ships[prev.id], okS = S.silver >= sh.cost, okP = S.pearl >= sh.pearl;
  const btn = cur ? `<span class="btn off wide">${icon('check')}Kullanılıyor</span>`
    : own ? `<button class="btn primary wide" data-act="ship:use:${sh.id}">${icon('anchor')}Bu gemiye geç</button>`
    : lock ? `<span class="btn off wide">${icon('lock')}Önce ${prev.name}</span>`
    : `<button class="btn ${okS && okP ? 'primary' : 'off'} wide" data-act="ship:buy:${sh.id}">Satın al<span class="cost ${okS ? '' : 'no'}">${coin}${fmt(sh.cost)}</span>${sh.pearl ? `<span class="cost ${okP ? '' : 'no'}">${pearlI}${sh.pearl}</span>` : ''}</button>`;
  const mini = `<span class="ty-grid" style="--cols:${sh.grid[0].length}">${sh.grid.join('').split('').map(c => `<i class="${c === 'X' ? 'x' : c === '.' ? '' : 'b'}"></i>`).join('')}</span>`;
  const n = own ? holdN(sh.id) : 0;
  return head('anchor', 'Tersane', `${Object.keys(S.ships).length}/${SHIPS.length} gemi · kullanılan <em>${curShip().name}</em>`)
    + `<div class="sh-body ty" style="--c:${sh.c}">
      <div class="ty-stage" data-swipe="ty">${ShipArt.side(sh.id)}
        <button class="ty-arr l" data-act="ship:go:${i - 1}" ${i ? '' : 'disabled'} aria-label="Önceki gemi">${icon('chev')}</button><button class="ty-arr r" data-act="ship:go:${i + 1}" ${i < SHIPS.length - 1 ? '' : 'disabled'} aria-label="Sonraki gemi">${icon('chev')}</button>
        <span class="ty-tier">${rom(sh.t)}</span>${own ? `<span class="ty-own">${cur ? 'Kullanılıyor' : 'Limanda'}</span>` : ''}</div>
      <div class="ty-dots">${SHIPS.map((x, k) => `<button data-act="ship:go:${k}" class="${k === i ? 'on' : ''} ${S.ships[x.id] ? 'own' : ''}" style="--c:${x.c}" aria-label="${x.name}"></button>`).join('')}</div>
      <div class="ty-name"><small>${sh.kind}</small><b>${sh.name}</b><p>${sh.desc}</p></div>
      <div class="ty-row"><div class="ty-kv">
        <span><small>Tür</small><b>${sh.kind}</b></span>
        <span><small>Yelken</small><b>×${fmtDec(sh.sail, 2)}</b></span>
        <span><small>Yolculuk</small><b>${fmtDec(TRAVEL_MS * sh.trip / 1000, 1)} sn</b></span>
        <span><small>Kademe</small><b>${rom(sh.t)}</b></span></div></div>
      ${btn}
      ${S.boat ? `<div class="ty-boat on">${icon('anchor')}<span><b>Hal Kayığı</b><small>Limanda · envanter dolunca balıkları %${BOAT.rate * 100} fiyata kendisi satar</small></span>${icon('check')}</div>`
        : `<button class="ty-boat" data-act="boat">${icon('anchor')}<span><b>Hal Kayığı</b><small>Envanter dolunca %${BOAT.rate * 100} fiyata satar; sen yokken av durmaz</small></span><span class="cost ${S.silver >= BOAT.cost ? '' : 'no'}">${coin}${fmt(BOAT.cost)}</span><span class="cost ${S.pearl >= BOAT.pearl ? '' : 'no'}">${pearlI}${BOAT.pearl}</span></button>`}</div>`;
}
function shipAct(a, x) {
  if (a === 'go') { if (win) { win.sel = clamp(+x, 0, SHIPS.length - 1); drawWin(false); swapTy(); } return; }
  if (a === 'buy') buyShip(x);
  if (a === 'use') useShip(x);
  save(); renderAll(); drawWin(false);
}
function swapTy() { const s = sheetIn.querySelector('.ty-stage svg'); if (s) { s.classList.remove('ty-in'); void s.getBoundingClientRect(); s.classList.add('ty-in'); } }

/* ---------- Envanter penceresi ----------
   Üstte balıkçı kuklası ve çevresinde altı yuva (Astralis envanteri gibi), yanında değerler.
   Altta kullanılan geminin ambarı: geminin biçiminde, yatay (pruva sağda) hücre ızgarası. */
const WEAR_IC = {
  sapka: c => `<svg viewBox="0 0 32 32"><ellipse cx="16" cy="20" rx="14" ry="4.5" fill="${c}"/><path d="M8 19Q8 9 16 9Q24 9 24 19Z" fill="${c}"/><path d="M8.5 16.5Q16 19 23.5 16.5" stroke="#b0443a" stroke-width="2.2" fill="none"/><path d="M10 12h12M9 15h14" stroke="rgba(0,0,0,.18)"/></svg>`,
  ceket: c => `<svg viewBox="0 0 32 32"><path d="M9 6L13 4Q16 7 19 4L23 6L27 12L24 15L23 12V28H9V12L8 15L5 12Z" fill="${c}"/><path d="M16 8V28" stroke="rgba(0,0,0,.3)"/><path d="M13 4Q16 9 19 4" fill="#efe6cf"/><rect x="10.5" y="16" width="4" height="4" rx="1" fill="rgba(0,0,0,.2)"/><rect x="17.5" y="16" width="4" height="4" rx="1" fill="rgba(0,0,0,.2)"/></svg>`,
  eldiven: c => `<svg viewBox="0 0 32 32"><path d="M10 28V16L8 9Q8 7 10 7.5L12 13V6Q12 4 14 4.5V13V4Q16 2.5 17 4.5V13V5.5Q19 4.5 20 6V15L22.5 11.5Q24.5 10.5 25 12.5L21 21V28Z" fill="${c}"/><rect x="9.5" y="24" width="12" height="4" fill="rgba(0,0,0,.25)"/></svg>`,
  cizme: c => `<svg viewBox="0 0 32 32"><path d="M9 3H18V19L27 23Q29 24 28 27H9Z" fill="${c}"/><path d="M9 3H18V6H9Z" fill="rgba(255,255,255,.18)"/><path d="M9 25H28" stroke="rgba(0,0,0,.35)" stroke-width="2"/></svg>`,
};
function fisherSvg() {
  const o = id => OUTFIT[id].c, charm = buff('yonca');
  return `<svg class="fisher" viewBox="0 0 120 160" aria-hidden="true">
    <ellipse cx="60" cy="152" rx="30" ry="5" fill="rgba(0,0,0,.45)"/>
    <g class="fs-line"><path d="M104 14Q112 70 106 96" stroke="#e6dfd7" stroke-opacity=".45" fill="none" stroke-width=".8"/><path d="M103 94q3 6 0 9q-3 -3 0 -9z" fill="#d8553f"/><path d="M103 99h6" stroke="#f2ead8" stroke-width="2"/></g>
    <g class="fs-body">
      <path d="M44 120h13v26h-15q-4 0 -3 -4z" fill="${o('cizme')}"/><path d="M63 120h13l1 22q1 4 -3 4h-11z" fill="${o('cizme')}"/>
      <path d="M41 142h16M63 142h14" stroke="rgba(0,0,0,.35)" stroke-width="2"/><path d="M44 124h13M63 124h13" stroke="rgba(255,255,255,.12)" stroke-width="2"/>
      <path d="M44 96h32l1 28H62l-2 -18l-2 18H43z" fill="#3a3632"/>
      <path d="M40 62Q60 54 80 62L82 100H38Z" fill="#e8dcc0"/>
      <path d="M40 62Q48 58 54 58L56 100H38ZM80 62Q72 58 66 58L64 100H82Z" fill="${o('ceket')}"/>
      <rect x="42" y="78" width="9" height="8" rx="1.5" fill="rgba(0,0,0,.22)"/><rect x="69" y="78" width="9" height="8" rx="1.5" fill="rgba(0,0,0,.22)"/>
      <path d="M38 96h44v5H38z" fill="#5a3c22"/><rect x="57" y="96" width="6" height="5" rx="1" fill="#c9a24e"/>
      ${charm ? `<g class="fs-charm"><circle cx="60" cy="71" r="4.5" fill="#6fcf62"/><path d="M60 66.5v9M55.5 71h9" stroke="#2f6a2a"/></g>` : ''}
      <path d="M40 63Q30 72 30 90" stroke="${o('ceket')}" stroke-width="9" stroke-linecap="round" fill="none"/><circle cx="30" cy="93" r="5.5" fill="${o('eldiven')}"/>
      <path d="M80 63Q92 70 94 84" stroke="${o('ceket')}" stroke-width="9" stroke-linecap="round" fill="none"/><circle cx="94" cy="87" r="5.5" fill="${o('eldiven')}"/>
      <path d="M86 112L106 12" stroke="#7a5634" stroke-width="2.6" stroke-linecap="round"/><path d="M98 52L106 12" stroke="#a87a50" stroke-width="1.6" stroke-linecap="round"/>
      <circle cx="90" cy="96" r="4" fill="#2c2926" stroke="#c9a24e" stroke-width="1.2"/>
      <rect x="55" y="48" width="10" height="9" fill="#c99a76"/>
      <circle cx="60" cy="40" r="13" fill="#d9b08c"/>
      <path d="M48 42Q50 56 60 56Q70 56 72 42Q66 47 60 46Q54 47 48 42Z" fill="#6a4a30"/><path d="M54 47Q60 45 66 47" stroke="#4a3220" stroke-width="2" fill="none"/>
      <circle cx="55" cy="38" r="1.4" fill="#2a2018"/><circle cx="65" cy="38" r="1.4" fill="#2a2018"/><path d="M52 34.5l5 -1M63 33.5l5 1" stroke="#4a3220" stroke-width="1.2"/>
      <g class="fs-hat"><ellipse cx="60" cy="30" rx="25" ry="6" fill="${o('sapka')}"/><path d="M46 29Q46 14 60 14Q74 14 74 29Z" fill="${o('sapka')}"/>
        <path d="M46.5 26Q60 30 73.5 26" stroke="#b0443a" stroke-width="3" fill="none"/><path d="M50 20h20M48 24h24" stroke="rgba(0,0,0,.15)"/><ellipse cx="60" cy="30" rx="25" ry="6" fill="none" stroke="rgba(0,0,0,.2)"/></g>
    </g></svg>`;
}
function slotHtml(sl, w) {
  const on = false, pos = `left:${sl.x}%;top:${sl.y}%`;
  if (sl.id === 'olta') {
    const p = S.rod.dur / durMax();
    return `<button class="dslot on ${on ? 'sel' : ''}" data-act="inv:slot:olta" style="${pos};--qc:${QUAL[S.rod.q].c}">${rodFrame(S.rod, 'ds-box')}<small>${rod().name.split(' ')[0]} · %${Math.round(p * 100)}</small></button>`;
  }
  if (sl.id === 'tilsim') {
    const b = buff('yonca');
    return b ? `<button class="dslot on ${on ? 'sel' : ''}" data-act="inv:slot:tilsim" style="${pos};--qc:${QUAL[2].c}">${itemFrame(ITEMS.yonca, 0, 'ds-box')}<small>Yonca · ${Math.ceil((b.until - Date.now()) / 60e3)} dk</small></button>`
      : `<button class="dslot empty ${on ? 'sel' : ''}" data-act="inv:slot:tilsim" style="${pos}"><span class="ds-box">${icon('clover')}</span><small>Tılsım</small></button>`;
  }
  const o = OUTFIT[sl.id];
  return `<button class="dslot on ${on ? 'sel' : ''}" data-act="inv:slot:${sl.id}" style="${pos};--qc:#c9b48a"><span class="ds-box ds-wear">${WEAR_IC[sl.id](o.c)}</span><small>${sl.name}</small></button>`;
}
// kahraman kuklası (Astralis Hero): giyilenler görünümünde silah, toplama görünümünde o anki mesleğin aleti elde
const PROF_IC = { maden: 'pick', odun: 'axe', bitki: 'sickle', deri: 'knife', yaratik: 'swords', balik: 'rod' };
const PROF_TOOL = { maden: 'kazma', odun: 'balta', bitki: 'orak', deri: 'bicak', balik: 'olta' };
function heroLook(view) {
  const prof = S.loc === 'field' && S.field ? S.field.prof : S.loc === 'sea' ? 'balik' : (S.lastProf || 'balik'), tk = PROF_TOOL[prof] || 'olta';
  return { helm: 0, chest: 0, glove: 0, boot: 0, bag: 0, weapon: { line: 'kilic', t: S.tools.yaratik.t },      // zırh yok: sade giysili gezgin (zırhlar üretimle gelecek)
    tool: view ? null : { kind: tk, t: tk === 'olta' ? S.rod.t : S.tools[prof].t }, q: {} };
}
const heroDoll = view => window.Hero ? Hero.svg(heroLook(view), { lod: 'doll', uid: 'inv', hand: view ? 'weapon' : 'tool' }) : fisherSvg();
const INV_POS = [[15, 20], [15, 50], [15, 80], [85, 20], [85, 50], [85, 80]];
function toolSlot(prof, x, y) {
  const P = PROFS[prof], t = S.tools[prof].t;
  return `<button class="dslot on" data-act="inv:tool:${prof}" style="left:${x}%;top:${y}%;--qc:${QUAL[0].c}">${frame({ tier: t, rarity: 'white', icon: toolImg(prof, t) }, 'ds-box')}<small>${P.tool}</small></button>`;
}
function invTop(w) {
  const sp = seaSpot(), W1 = id => WEAR.find(s => s.id === id);
  let slots;
  // zırh yuvaları Astralis'teki gibi boş durur (simgesiyle); zırh üretilince dolacak
  const empty = (i, ic, label) => `<button class="dslot" data-act="inv:armor" style="left:${INV_POS[i][0]}%;top:${INV_POS[i][1]}%"><span class="ds-box">${icon(ic)}</span><small>${label}</small></button>`;
  if (w.view) slots = empty(0, 'helm', 'Miğfer') + empty(1, 'armor', 'Göğüs') + empty(2, 'glove', 'Eldiven')
    + toolSlot('yaratik', ...INV_POS[3]) + slotHtml({ ...W1('tilsim'), x: INV_POS[4][0], y: INV_POS[4][1] }, w) + empty(5, 'boot', 'Çizme');
  else slots = ['maden', 'odun', 'bitki'].map((p, i) => toolSlot(p, ...INV_POS[i])).join('') + toolSlot('deri', ...INV_POS[3]) + slotHtml({ ...W1('olta'), x: INV_POS[4][0], y: INV_POS[4][1] }, w)
    + empty(5, 'bag', 'Çanta');
  return `<div class="inv-mid">
      <div class="doll" id="invDoll"><svg class="dlines" viewBox="0 0 100 100" preserveAspectRatio="none">${INV_POS.map(([x, y]) => `<path d="M${x} ${y} L50 50"/>`).join('')}</svg>
        <span class="dship dhero">${heroDoll(w.view)}</span>${slots}</div>
      <div class="inv-side">
        <div class="pw-card"><small>Seviye</small><b>${S.lvl}</b><span class="pw-tier">${icon('user')}${esc(S.name || 'Gezgin')}</span></div>
        <div class="st-rows">
          <div class="st-r"><span class="st-ic atk">${icon('clock')}</span><span class="st-n">Hız</span><b class="num">+${fmt(speedPct(sp))}</b><em>%</em></div>
          <div class="st-r"><span class="st-ic def">${icon('spark')}</span><span class="st-n">Şans</span><b class="num">+${fmt(luckPct(sp))}</b><em class="d">%</em></div>
          <div class="st-r"><span class="st-ic hp">${icon('hook')}</span><span class="st-n">Atış</span><b class="num">${fmtDec(castSec(sp))}</b><em class="d">sn</em></div>
        </div>
        <button class="inv-link" data-act="inv:smith"><span class="qi">${icon('flame')}</span><span>Demirci</span>${icon('chev')}</button>
      </div></div>`;
}
function openHold(sel = null) { openInv('bag', sel); }
// Envanter ızgarası (tek): yedek oltalar, balık yığınları (tür + nadirlik) ve diğer eşyalar; dokununca kartı açılır
function invGrid(w) {
  const fishI = holdOf().map((st, i) => [st, i]);
  const ids = Object.keys(S.box).filter(id => S.box[id] > 0 && ITEMS[id]);
  if (w.sort) { fishI.sort(([a], [b]) => (b.q || 0) - (a.q || 0) || spotById(FISH_BY[b.id].spot).t - spotById(FISH_BY[a.id].spot).t); ids.sort((a, b) => (ITEMS[b].q || 0) - (ITEMS[a].q || 0) || (ITEMS[b].t || 0) - (ITEMS[a].t || 0)); }
  else { fishI.sort(([a], [b]) => spotById(FISH_BY[a.id].spot).t - spotById(FISH_BY[b.id].spot).t || FISH.indexOf(FISH_BY[a.id]) - FISH.indexOf(FISH_BY[b.id]) || (a.q || 0) - (b.q || 0));
    ids.sort((a, b) => (ITEMS[a].kind || '').localeCompare(ITEMS[b].kind || '') || (ITEMS[a].t || 0) - (ITEMS[b].t || 0)); }
  const cells = S.rods.map((r, i) => frame({ tier: r.t, rarity: QUAL[r.q].r, icon: rodImg(r.t) }, 'ic-cell full', `data-card="rod:${i}" role="button"`))
    .concat(fishI.map(([st, i]) => fishFrame(FISH_BY[st.id], st.n, 'ic-cell full', `data-card="fish:${i}" role="button"`, st.q || 0)))
    .concat(ids.map(id => itemFrame(ITEMS[id], S.box[id], 'ic-cell full', `data-card="${id}" role="button"`)));
  const capN = Math.max(48, Math.ceil(cells.length / 8) * 8);
  while (cells.length < capN) cells.push(ItemFrame.itemFrame(null, 'ic-cell'));
  return `<div class="inv-grid8" id="invGrid">${cells.join('')}</div>`;
}
function fitHold() { /* eski gemi biçimli ambardan: artık gerekmiyor */ }
function invAct(a, x, el) {
  if (a === 'slot') return slotCard(x, el);
  if (a === 'view') { win.view = +x; return drawWin(true); }
  if (a === 'src') { win.src = +x; return drawWin(true); }
  if (a === 'sort') { win.sort = win.sort ? 0 : 1; toast(win.sort ? 'Nadirliğe göre sıralandı' : 'Türe göre sıralandı'); return drawWin(true); }
  if (a === 'tool' || a === 'smith') { closeWin(); return openSmith(); }
  if (a === 'ship') { closeWin(); return openTersane(); }
  if (a === 'armor') return toast('Zırh yuvası boş', { sub: 'zırhlar üretimle gelecek' });
}
function holdAct(a, x) {
  if (a === 'sell') { const st = holdOf()[+x], got = sellStack(+x); if (got) toast(`${FISH_BY[st.id].name} satıldı`, { sub: `+${fmt(got)} gümüş` }); }
  save(); renderAll(); drawWin(false);
}
let holdDrag = null;      // (eski sürükleme durumu; pencere yenileme denetimi hâlâ bakıyor)
function bindHold() {}
const holdSig = () => S.ship + ':' + holdOf().map(s => s.id + (s.q || 0) + ':' + s.n).join(',');
