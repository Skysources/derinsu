/* =========================================================
   DERİNSU — dünya: toplama bölgeleri ve meslekler
   Şehirden çıkınca dünya haritası açılır: Maden Ocağı, Ulu Orman, Çiçekli Çayır, Av Sahası, Kadim Harabeler ve Kıyı.
   Kıyı balıkçılıktır (izinli alanlar, açık deniz, makara çarkı). Diğer beşi aynı döngüyle çalışır:
   bölgeye gir → bir düğüme dokun → kahraman gider ve toplar (kendiliğinden); büyük düğmeye her dokunuş işi hızlandırır.
   Düğümün bir niteliği (rengi) ve belli sayıda ürünü vardır; tükenince yerine yenisi çıkar.
   Her mesleğin bir aleti vardır (kademe I–V): alet, kendi kademesinin bir üstündeki sahaya kadar izin verir.
   Durum: S.tools[meslek] = { t } · S.field = { prof, t, nodes, resp, pos } · S.work = { i, walk, wait, t0, dur }
   ========================================================= */
'use strict';
const TOOL_PRE = ['', 'Kaba', 'Bakır', 'Demir', 'Çelik', 'Kadim'];
const PROFS = {
  maden: { id: 'maden', name: 'Madencilik', region: 'Maden Ocağı', sub: 'Dağ eteğindeki cevher damarları', verb: 'Kaz', doing: 'kazılıyor', tool: 'Kazma', timg: 'pickaxe', res: 'cevher', rimg: 'ore', art: 'maden', c: '#c98a66',
    names: ['Bakır Cevheri', 'Demir Cevheri', 'Gümüş Cevheri', 'Altın Cevheri', 'Yıldız Demiri Cevheri'], nodes: ['Bakır Damarı', 'Demir Damarı', 'Gümüş Damarı', 'Altın Damarı', 'Yıldız Demiri Damarı'],
    find: { id: 'mucevher', name: 'Ham Mücevher', c: '#8fd0e8', img: 'ham-mucevher', desc: 'Damarın içinden çıkan ham taş.' } },
  odun: { id: 'odun', name: 'Odunculuk', region: 'Ulu Orman', sub: 'Yaşlı ağaçlar ve kütükler', verb: 'Kes', doing: 'kesiliyor', tool: 'Balta', timg: 'axe', res: 'odun', rimg: 'wood', art: 'odun', c: '#c9a26b',
    names: ['Huş Odunu', 'Çam Odunu', 'Meşe Odunu', 'Sedir Odunu', 'Çınar Odunu'], nodes: ['Huş Ağacı', 'Çam Ağacı', 'Meşe Ağacı', 'Sedir Ağacı', 'Ulu Çınar'],
    find: { id: 'recine', name: 'Reçine', c: '#e8b04f', img: 'recine', desc: 'Ağacın gövdesinden sızan kehribar damla.' } },
  bitki: { id: 'bitki', name: 'Bitki Toplama', region: 'Çiçekli Çayır', sub: 'Şifalı otlar ve nadir çiçekler', verb: 'Topla', doing: 'toplanıyor', tool: 'Orak', timg: 'sickle', res: 'ot', rimg: 'herb', art: 'ot', c: '#8fcf7f',
    names: ['Kekik', 'Adaçayı', 'Gece Sefası', 'Altın Kök', 'Anka Çiçeği'], nodes: ['Kekik Öbeği', 'Adaçayı Öbeği', 'Gece Sefası', 'Altın Kök', 'Anka Çiçeği'],
    find: { id: 'tohum', name: 'Şifalı Tohum', c: '#b7e08a', img: 'sifali-tohum', desc: 'Otların arasından çıkan ender bir tohum.' } },
  deri: { id: 'deri', name: 'Avcılık', region: 'Av Sahası', sub: 'Av hayvanları ve postları', verb: 'Avla', doing: 'avlanıyor', tool: 'Av Bıçağı', timg: 'knife', res: 'post', rimg: 'hide', art: 'deri', c: '#b98a5e',
    names: ['Tavşan Postu', 'Geyik Postu', 'Kurt Postu', 'Ayı Postu', 'Ejder Derisi'], nodes: ['Tavşan Sürüsü', 'Geyik Sürüsü', 'Kurt Sürüsü', 'Ayı İni', 'Ejder Yuvası'],
    find: { id: 'kalinderi', name: 'Kalın Deri', c: '#d09a6a', img: 'kalin-deri', desc: 'Avdan çıkan kalın, sağlam bir deri parçası.' } },
  yaratik: { id: 'yaratik', name: 'Yaratık Avı', region: 'Kadim Harabeler', sub: 'Harabelerde dolaşan yaratıklar', verb: 'Vur', doing: 'dövüşülüyor', tool: 'Kılıç', timg: 'sword', res: 'ganimet', rimg: null, art: null, c: '#b9a6e6',
    names: ['Balçık Özü', 'Kurt Özü', 'İskelet Özü', 'Trol Özü', 'Hayalet Özü'], nodes: ['Balçık', 'Yaban Kurdu', 'İskelet', 'Trol', 'Hayalet'],
    find: { id: 'ktoz', name: 'Kadim Toz', c: '#d0b8ff', path: 'loot/toz-buyuk', desc: 'Yaratıktan geriye kalan parıltılı toz.' } },
};
const PROF_IDS = Object.keys(PROFS);
const REGIONS = [...PROF_IDS, 'balik'];
const NODE_Q = [      // düğüm niteliği: p çıkma olasılığı · n ürün sayısı · dbl çift ürün şansı · find nadir buluntu şansı (%)
  { name: 'Sıradan', q: 0, p: 50, n: 10, dbl: 0, find: 2 }, { name: 'Bereketli', q: 1, p: 30, n: 8, dbl: 12, find: 5 },
  { name: 'Zengin', q: 2, p: 14, n: 7, dbl: 28, find: 10 }, { name: 'Eşsiz', q: 3, p: 6, n: 5, dbl: 55, find: 22 },
];
const FIELD_SLOTS = 10, FIELD_LIVE = 6, FIELD_RESP = [20, 60];
const G_SEC = [0, 5, 7, 9, 11, 14], G_XP = [0, 6, 9, 13, 18, 25], G_VAL = [0, 8, 60, 500, 4000, 30000];
const TOOL_COST = [0, 0, 1800, 25000, 300000, 3000000], BOOST = .14;

/* ---------- eşyalar: hammaddeler ve nadir buluntular ---------- */
// resimler Astralis'in ikon paketinden: hammaddeler assets/items/<tür>, yaratık özleri kut, ender buluntular finds ve loot
const KUT = [null, 'kt3', 'kt6', 'kt9', 'kt12', 'kt15'];
for (const p of Object.values(PROFS)) {
  for (let t = 1; t <= 5; t++) ITEMS[p.res + t] = { id: p.res + t, name: p.names[t - 1], t, kind: 'Hammadde', q: 0, raw: p.id, val: G_VAL[t],
    img: p.rimg ? `assets/items/${p.rimg}/${p.rimg}-t${t}.png` : `assets/items/kut/${KUT[t]}.png` };
  ITEMS[p.find.id] = { id: p.find.id, name: p.find.name, t: 0, kind: 'Nadir buluntu', q: 2, img: `assets/items/${p.find.path || 'finds/' + p.find.img}.png`, raw: p.id, val: 400, rawFind: true };
}
const toolName = (prof, t) => `${TOOL_PRE[t]} ${PROFS[prof].tool}`;
const toolImg = (prof, t) => `<img src="assets/items/${PROFS[prof].timg}/${PROFS[prof].timg}-t${t}.png" alt="">`;

/* ---------- yaratık çizimleri (düğüm ölçüsü: taban 0,0 · viewBox -32 -50 64 64) ---------- */
const MOB_SVG = [null,
  '<g class="breath"><path d="M-17 0Q-19 -17 -6 -22Q0 -27 7 -22Q19 -17 17 0Z" fill="#5fb85a"/><path d="M-12 -3Q-13 -15 -4 -19" stroke="#a8e89a" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/><circle cx="-5" cy="-11" r="2.6" fill="#132a14"/><circle cx="6" cy="-11" r="2.6" fill="#132a14"/><path d="M-4 -5Q1 -2 6 -5" stroke="#132a14" stroke-width="1.6" fill="none"/></g>',
  '<g class="breath"><path d="M-20 0V-10Q-18 -20 -6 -20H8L14 -27L16 -19Q22 -16 22 -9L15 -6V0H9V-6H-9V0Z" fill="#6f6a66"/><path d="M-20 -10Q-27 -15 -25 -22Q-19 -18 -17 -13Z" fill="#57524f"/><path d="M8 -20L14 -27L16 -19Z" fill="#8a8480"/><circle cx="15" cy="-14" r="1.6" fill="#ffd27a"/><path d="M16 -9L22 -9L18 -6Z" fill="#f2ead8"/></g>',
  '<g class="breath"><path d="M-3 0V-12M3 0V-12" stroke="#e6dfd0" stroke-width="3" stroke-linecap="round"/><path d="M-9 -12H9L7 -25H-7Z" fill="#d8d0be"/><path d="M-6 -15H6M-6 -19H6M-5 -23H5" stroke="#8a8272" stroke-width="1.4"/><path d="M-9 -24L-16 -13M9 -24L17 -15" stroke="#e6dfd0" stroke-width="2.6" stroke-linecap="round"/><circle cx="0" cy="-32" r="7.4" fill="#ece6d6"/><circle cx="-3" cy="-33" r="2" fill="#1a1620"/><circle cx="3" cy="-33" r="2" fill="#1a1620"/><path d="M-3 -28h6" stroke="#1a1620" stroke-width="1.4"/><path d="M17 -15L24 -36" stroke="#9aa0a8" stroke-width="2.4" stroke-linecap="round"/></g>',
  '<g class="breath"><path d="M-12 0V-8Q-20 -12 -19 -26Q-17 -38 -3 -39Q11 -39 16 -29Q21 -17 12 -8V0H5V-7H-5V0Z" fill="#6f8a5a"/><path d="M-19 -24Q-27 -22 -26 -12L-21 -10Z" fill="#5a7448"/><path d="M16 -27Q25 -24 23 -13L18 -12Z" fill="#5a7448"/><path d="M-9 -26Q-3 -30 3 -26" stroke="#2a3a20" stroke-width="2" fill="none"/><circle cx="-7" cy="-29" r="2" fill="#ffd27a"/><circle cx="4" cy="-29" r="2" fill="#ffd27a"/><path d="M-6 -20L-4 -16M2 -20L0 -16" stroke="#f2ead8" stroke-width="2.4" stroke-linecap="round"/><path d="M23 -13L29 -36" stroke="#6a4a2c" stroke-width="4" stroke-linecap="round"/><circle cx="29" cy="-38" r="5.4" fill="#57524f"/></g>',
  '<g class="drift slow"><path d="M-14 0Q-10 -6 -6 0Q-2 -6 2 0Q6 -6 10 0Q14 -6 15 -4Q18 -22 12 -33Q6 -42 -2 -41Q-14 -40 -16 -26Q-18 -12 -14 0Z" fill="#b9a6e6" opacity=".88"/><path d="M-9 -14Q-12 -28 -4 -35" stroke="#e8e0ff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/><ellipse cx="-5" cy="-26" rx="2.6" ry="3.6" fill="#241a40"/><ellipse cx="5" cy="-26" rx="2.6" ry="3.6" fill="#241a40"/><ellipse cx="0" cy="-17" rx="3" ry="4" fill="#241a40"/></g>'];
const mobSvg = (t, cls = '') => `<svg class="nd n-mob t${t} ${cls}" viewBox="-32 -50 64 64" aria-hidden="true"><ellipse cx="0" cy="1" rx="22" ry="7" fill="rgba(0,0,0,.28)"/><ellipse class="ring" cx="0" cy="1" rx="26" ry="10" fill="none"/>${MOB_SVG[t]}</svg>`;
const nodeSvg = (prof, t, cls) => PROFS[prof].art ? LandNode.svg(PROFS[prof].art, t, cls) : mobSvg(t, cls);

/* ---------- durum ve kurallar ---------- */
function ensureWorld() {
  if (!S.tools) S.tools = {};
  for (const id of PROF_IDS) if (!S.tools[id]) S.tools[id] = { t: 1 };
  if (S.field === undefined) S.field = null;
  if (S.work === undefined) S.work = null;
  if (S.loc === 'field' && !S.field) S.loc = 'city';
  if (S.loc !== 'field') S.work = null;
  // eski buluntu adları (resimler Astralis paketine geçince)
  for (const [o, n] of [['boynuz', 'kalinderi'], ['tilsimp', 'ktoz']]) if (S.box[o]) { S.box[n] = (S.box[n] || 0) + S.box[o]; delete S.box[o]; }
}
const toolT = prof => S.tools[prof].t;
const canField = (prof, t) => t <= toolT(prof) + 1;
const gatherSec = (prof, t) => G_SEC[t] * (toolT(prof) >= t ? Math.pow(.85, toolT(prof) - t) : 2) / (1 + (S.lvl - 1) * LVL_SPD / 100) / (S.devSpd || 1);
const fieldL = () => Maps.fieldLayout(S.field);
function rollNode() { let x = Math.random() * 100; for (const q of NODE_Q) if ((x -= q.p) < 0) return { q: q.q, left: q.n, max: q.n }; return { q: 0, left: 10, max: 10 }; }
function enterField(prof, t, now = Date.now()) {
  if (S.loc === 'sea') { S.fishing = null; S.combo = 0; }
  S.loc = 'field';
  if (S.field && S.field.prof === prof && S.field.t === t) return;
  const a = { prof, t, seed: PROF_IDS.indexOf(prof) * 100 + t * 7 + 3 }, L = Maps.fieldLayout(a);
  const live = L.slots.map((_, i) => i).sort(() => Math.random() - .5).slice(0, FIELD_LIVE);
  S.field = { ...a, nodes: L.slots.map((_, i) => live.includes(i) ? rollNode() : null), resp: L.slots.map((_, i) => live.includes(i) ? 0 : now + randR(FIELD_RESP) * 1000), pos: { ...L.start } };
  S.work = null;
}
function leaveField() { if (S.loc === 'field') { S.work = null; S.loc = 'city'; } }
// düğümün yanında durulacak nokta (kahraman düğümün üstüne çıkmaz)
function nodeStand(i) { const p = fieldL().slots[i], b = S.field.pos, d = Math.hypot(b.x - p.x, b.y - p.y) || 1, k = Math.min(1, 46 / d); return { x: p.x + (b.x - p.x) * k, y: p.y + (b.y - p.y) * k + 6 }; }
function startWork(i, now = Date.now(), live = true) {
  if (!S.field || !S.field.nodes[i]) return;
  const to = nodeStand(i);
  S.work = { i, walk: true };
  const arrive = () => { if (!S.work || S.work.i !== i || !S.work.walk) return; S.field.pos = to; S.work = { i, walk: false, t0: Date.now(), dur: gatherSec(S.field.prof, S.field.t) * 1000 * (.9 + Math.random() * .2) }; fieldDirty = true; if (fieldView) fieldView.face(fieldL().slots[i].x, fieldL().slots[i].y); };
  if (live && view === 'field' && fieldView) fieldView.moveTo(to.x, to.y, arrive);
  else { S.field.pos = to; S.work = { i, walk: false, t0: now, dur: gatherSec(S.field.prof, S.field.t) * 1000 * (.9 + Math.random() * .2) }; }
  fieldDirty = true;
}
function bestNode() {
  let best = -1, bs = -1e9; const L = fieldL(), from = S.field.pos;
  S.field.nodes.forEach((n, i) => { if (!n) return; const p = L.slots[i], sc = n.q * 260 - Math.hypot(p.x - from.x, p.y - from.y); if (sc > bs) { bs = sc; best = i; } });
  return best;
}
function spawnField(now) {
  if (!S.field) return;
  S.field.nodes.forEach((n, i) => { if (!n && S.field.resp[i] && now >= S.field.resp[i]) { S.field.nodes[i] = rollNode(); S.field.resp[i] = 0; fieldDirty = true; } });
  if (S.work && S.work.wait) { const j = bestNode(); if (j >= 0) startWork(j, now, true); }
}
// bir ürün: sandığa girer; düğüm bir eksilir, tükenirse yerine yenisi için süre başlar
function doGather(at, live, rep) {
  const F = S.field, w = S.work, n = F.nodes[w.i], P = PROFS[F.prof], Q = NODE_Q[n.q], id = P.res + F.t;
  const cnt = 1 + (Math.random() * 100 < Q.dbl ? 1 : 0);
  S.box[id] = (S.box[id] || 0) + cnt;
  let found = false;
  if (Math.random() * 100 < Q.find) { S.box[P.find.id] = (S.box[P.find.id] || 0) + 1; found = true; }
  addXp(Math.round(G_XP[F.t] * (1 + n.q * .25)), live);
  if (rep) { rep[id] = (rep[id] || 0) + cnt; if (found) rep[P.find.id] = (rep[P.find.id] || 0) + 1; }
  if (live && view === 'field') { fieldFloat(`+${cnt} ${ITEMS[id].name}`, QUAL[n.q].c, cnt > 1); if (found) setTimeout(() => fieldFloat(`${P.find.name}!`, P.find.c, true, -22), 250); haptic(found ? [8, 30, 14] : 8); }
  else if (live && found) toast(P.find.name, { label: 'Nadir buluntu', sub: P.region });
  if (--n.left <= 0) { F.nodes[w.i] = null; F.resp[w.i] = at + randR(FIELD_RESP) * 1000; }
  fieldDirty = true;
}
function advanceWork(now, live, rep) {
  let guard = 0;
  while (S.work && S.field && !S.work.walk && !S.work.wait && guard++ < 4000) {
    const w = S.work, end = w.t0 + w.dur;
    if (now < end) break;
    if (!S.field.nodes[w.i]) { S.work.wait = true; break; }
    if (usedCells() >= totalCells()) {      // tek envanter doldu: toplama durur
      S.work = null; fieldDirty = true;
      if (live) { toast('Envanter dolu', { tone: 'warn', sub: 'toplama durdu · sat ya da işle' }); haptic([20, 40, 20]); }
      break;
    }
    doGather(end, live, rep);
    if (S.field.nodes[w.i]) { w.t0 = end; w.dur = gatherSec(S.field.prof, S.field.t) * 1000 * (.9 + Math.random() * .2) / (rep ? OFFLINE_EFF : 1); }
    else { const j = bestNode(); if (j >= 0) startWork(j, end, live && !rep); else S.work = { i: w.i, wait: true }; }
  }
  spawnField(now);
}
// sen yokken: verim OFFLINE_EFF, en çok MAX_OFFLINE
function awayWork(now, sec) {
  if (!S.work || !S.field || S.work.walk) return;
  const rep = {}, from = Math.max(S.work.t0 || now, now - Math.min(sec, MAX_OFFLINE) * 1000);
  if (S.work.t0) { S.work.t0 = from; S.work.dur /= OFFLINE_EFF; }
  advanceWork(now, false, rep);
  const ks = Object.keys(rep); if (!ks.length) return;
  toast(`Sen yokken ${PROFS[S.field.prof].region}`, { label: 'Toplama sürdü', sub: ks.map(k => `+${rep[k]} ${ITEMS[k].name}`).join(' · ') });
}
// büyük düğme: her dokunuş işi biraz öne alır (elle toplama daha hızlı)
let boostAt = 0;
function fieldBoost() {
  const w = S.work, now = Date.now();
  if (!S.field) return;
  if (!w) { const j = bestNode(); if (j >= 0) startWork(j); else toast('Düğüm yok', { sub: 'yenisi birazdan çıkar' }); return; }
  if (w.walk || w.wait || now - boostAt < 110) return;
  boostAt = now; w.t0 -= w.dur * BOOST;
  const b = $('#fdPull'); b.classList.remove('hit'); void b.offsetWidth; b.classList.add('hit');
  const m = $(`#fieldMap [data-mark="n${w.i}"] .nd`); if (m) { m.classList.remove('whack'); void m.getBoundingClientRect(); m.classList.add('whack'); }
  haptic(5);
}
function stopWork() { S.work = null; fieldDirty = true; save(); renderAll(); }

/* ---------- görünümler ---------- */
let fieldView = null, fieldViewId = '', fieldDirty = true;
function fieldTap({ x, y, mark }) {
  if (mark && mark[0] === 'n') { const i = +mark.slice(1); if (S.work && S.work.i === i && !S.work.wait) return; haptic(8); startWork(i); save(); return; }
  S.work = null; fieldDirty = true;
  fieldView.moveTo(x, y, () => { S.field.pos = { x: fieldView.me.x, y: fieldView.me.y }; save(); });
}
function showField() {
  const id = S.field.prof + S.field.t + ':' + toolT(S.field.prof) + toolT('yaratik');
  if (!fieldView || fieldViewId !== id) {
    if (fieldView) fieldView.destroy();
    const P = S.field.prof, tk = PROF_TOOL[P];      // kahraman: Astralis çizimi, elinde o mesleğin aleti (yaratık sahasında kılıç)
    const heroSvg = window.Hero ? Hero.svg({ helm: 0, chest: 0, glove: 0, boot: 0, bag: 0, weapon: { line: 'kilic', t: toolT('yaratik') }, tool: tk ? { kind: tk, t: toolT(P) } : null, q: {} }, { lod: 'map', uid: 'fm', hand: tk ? 'tool' : 'weapon' }) : null;
    fieldView = new Maps.View($('#fieldMap'), Maps.field(S.field), { tap: fieldTap, haptic, start: S.field.pos, insetTop: 100, insetBottom: 114, heroSvg }); fieldViewId = id;
  } else fieldView.place(S.field.pos.x, S.field.pos.y);
  if (S.work && S.work.walk) startWork(S.work.i);
  fieldDirty = true;
}
function fieldFloat(text, color, big, dy = 0) {
  if (view !== 'field' || !fieldView || !S.work) return;
  const p = fieldL().slots[S.work.i], el = document.createElement('span');
  el.className = 'flt' + (big ? ' big' : ''); el.textContent = text; el.style.setProperty('--c', color);
  el.style.left = (p.x - fieldView.cam.x) + 'px'; el.style.top = (p.y - fieldView.cam.y - 54 + dy) + 'px';
  $('#fdFloat').appendChild(el); setTimeout(() => el.remove(), 1300);
}
function renderFieldMarks() {
  if (!fieldView || !S.field || !fieldDirty) return;
  fieldDirty = false;
  const L = fieldL(), P = PROFS[S.field.prof];
  fieldView.marksEl.innerHTML = S.field.nodes.map((n, i) => {
    if (!n) return '';
    const p = L.slots[i], on = S.work && S.work.i === i && !S.work.wait, act = on && !S.work.walk;
    return `<button class="fn q${n.q} ${on ? 'on' : ''}" data-mark="n${i}" style="left:${p.x}px;top:${p.y}px;--qc:${QUAL[n.q].c}">
      ${nodeSvg(S.field.prof, S.field.t, `q${n.q} ${act ? 'act' : ''} ${n.left <= 2 ? 'low' : ''}`)}<small><i></i>${NODE_Q[n.q].name} · <b class="num">${n.left}</b></small></button>`;
  }).join('');
}
function renderField() {
  if (!S.field) return;
  const F = S.field, P = PROFS[F.prof], w = S.work, night = isNight(), now = Date.now();
  $('#fdName').textContent = P.region;
  $('#fdTier').textContent = `${rom(F.t)} · ${P.nodes[F.t - 1]}`;
  $('#fdTime').innerHTML = `${icon(night ? 'star' : 'bolt')}${night ? 'Gece' : 'Gündüz'} <b class="num">${fmtDur(dnLeft() / 1000)}</b>`;
  $('#fieldStage').classList.toggle('night', night);
  const p = w && !w.walk && !w.wait ? clamp((now - w.t0) / w.dur, 0, 1) : 0;
  $('#fdRing').style.strokeDashoffset = 226.2 * (1 - p);
  $('#fdTxt').textContent = !w ? 'Başla' : w.walk ? 'Yolda' : w.wait ? 'Bekle' : P.verb;
  if (fieldView) fieldView.meEl.classList.toggle('work', !!w && !w.walk && !w.wait);
  $('#fdPull').classList.toggle('idle', !w || !!w.wait);
  const id = P.res + F.t;
  $('#fdBagN').textContent = fmt(S.box[id] || 0);
  $('#fdBagIc').innerHTML = itemImg(ITEMS[id]);
  $('#fdStop').classList.toggle('stopped', !w);
  $('#fdStop small').textContent = w ? 'Durdur' : 'En iyi düğüm';
  $('#fdStop .fb-ic').innerHTML = icon(w ? 'stop' : 'star');
  $('#fdToolIc').innerHTML = toolImg(F.prof, toolT(F.prof));
  $('#fdToolT').textContent = `${P.tool} ${rom(toolT(F.prof))}`;
  const tip = !w ? 'Bir düğüme dokun' : w.wait ? 'Düğümler tükendi, yenisi bekleniyor' : !w.walk && S.st.catches + (S.st.gather || 0) < 60 ? `${P.verb} düğmesine bastıkça iş hızlanır` : '';
  $('#fdTip').classList.toggle('on', !!tip); if (tip) $('#fdTip').textContent = tip;
  renderFieldMarks();
}

/* ---- dünya haritası ---- */
let worldBuilt = false;
function renderWorld() {
  const g = $('#worldMap');
  if (!worldBuilt) { worldBuilt = true; g.innerHTML = `<div class="lm-top"><small>Derinsu çevresi</small><b>Dünya Haritası</b><span class="lm-chips"><span class="chip" id="wmDn"></span></span></div>${Scenes.world()}`; }
  const night = isNight();
  $('#wmDn').innerHTML = `${icon(night ? 'star' : 'bolt')}${night ? 'Gece' : 'Gündüz'} <b class="num">${fmtDur(dnLeft() / 1000)}</b>`;
  for (const r of REGIONS) {
    const el = g.querySelector(`[data-rs="${r}"]`), here = r === 'balik' ? S.loc === 'sea' && !!S.sea : S.loc === 'field' && S.field && S.field.prof === r;
    const txt = r === 'balik' ? (here ? `Teknen ${esc(S.sea.name)}'da` : `Olta ${rom(S.rod.t)}`) : here ? `${rom(S.field.t)}. saha${S.work ? ' · iş sürüyor' : ''}` : `${PROFS[r].tool} ${rom(toolT(r))}`;
    if (el && el.textContent !== txt) el.textContent = txt;
    if (el) el.parentNode.classList.toggle('has', !!here);
    const d = g.querySelector(`[data-rd="${r}"]`); if (d) d.className = 'lm-dot ' + (here ? 'on' : '');
  }
}
function worldGo(r) {
  haptic(8);
  if (r === 'city') { showView('city'); return; }
  if (r === 'balik') { showView(S.loc === 'sea' && S.sea ? 'sea' : 'areas'); return; }
  if (S.loc === 'field' && S.field && S.field.prof === r) { showView('field'); return; }
  openTiers(r);
}
/* ---- pencere: saha (kademe) seçimi ve alet ---- */
function openTiers(prof) { openWin('tiers', renderTiers, { prof }); }
function renderTiers(w) {
  const P = PROFS[w.prof], tt = toolT(w.prof), cost = TOOL_COST[tt + 1], can = tt < 5 && S.silver >= cost;
  return head(toolImg(w.prof, tt), P.region, `${P.name} · <em>${toolName(w.prof, tt)}</em>`)
    + `<div class="sh-body"><p class="tr-sub">${P.sub}. Aletin, kendi kademesinin bir üstündeki sahaya kadar izin verir; üst sahada iş iki kat yavaş ilerler.</p>
      <div class="tr-list">${[1, 2, 3, 4, 5].map(t => { const ok = canField(w.prof, t), here = S.loc === 'field' && S.field && S.field.prof === w.prof && S.field.t === t, it = ITEMS[P.res + t];
        return `<button class="tr-row ${ok ? '' : 'lock'} ${here ? 'here' : ''}" data-act="tier:${w.prof}:${t}" style="--tc:${QUAL[Math.min(4, t - 1)].c}">
          <span class="tr-t">${rom(t)}</span>${itemFrame(it, 0, 'tr-fr')}
          <span class="tr-tx"><b>${P.nodes[t - 1]}</b><small>${it.name} · ${fmtDec(gatherSec(w.prof, t))} sn</small></span>
          ${ok ? (here ? '<span class="tr-here">BURADASIN</span>' : `<span class="btn ghost mini">Git${icon('chev')}</span>`) : `<span class="tr-lock">${icon('lock')}${rom(t - 1)}. kademe ${P.tool.toLowerCase()}</span>`}</button>`; }).join('')}</div>
      <div class="tr-tool"><span class="tr-ti">${toolImg(w.prof, tt)}</span><span class="tr-tx"><b>${toolName(w.prof, tt)}</b><small>${tt < 5 ? `Sonraki: ${toolName(w.prof, tt + 1)} · ${rom(Math.min(5, tt + 2))}. sahaya kadar izin` : 'En üst kademe'}</small></span>
        ${tt < 5 ? `<button class="btn ${can ? 'primary' : 'ghost'} mini" data-act="tool:${w.prof}" ${can ? '' : 'disabled'}>${coin}${fmt(cost)}</button>` : ''}</div></div>`;
}
function tierAct(prof, t) {
  t = +t; if (!canField(prof, t)) { toast('Aletin yetmiyor', { tone: 'warn', sub: `${rom(t - 1)}. kademe ${PROFS[prof].tool.toLowerCase()} gerek` }); return; }
  closeWin(); enterField(prof, t); save(); showView('field');
  toast(PROFS[prof].region, { label: `${rom(t)}. saha · ${PROFS[prof].nodes[t - 1]}`, sub: 'bir düğüme dokun' });
}
function toolAct(prof) {
  const tt = toolT(prof), cost = TOOL_COST[tt + 1]; if (tt >= 5 || S.silver < cost) return;
  S.silver -= cost; S.tools[prof].t++; bumpCur('#curSilver'); haptic([10, 30, 16]);
  toast(toolName(prof, tt + 1), { label: 'Yeni alet', sub: `${rom(Math.min(5, tt + 2))}. sahaya kadar izin` });
  save(); drawWin(true); renderAll();
}

/* ---- pencere: Demirci (bütün meslek aletleri tek yerde) ---- */
function openSmith() { openWin('smith', renderSmith, {}); }
function renderSmith() {
  const row = prof => { const P = PROFS[prof], tt = toolT(prof), cost = TOOL_COST[tt + 1], can = tt < 5 && S.silver >= cost;
    return `<div class="sm-row"><span class="tr-ti">${toolImg(prof, tt)}</span><span class="tr-tx"><b>${toolName(prof, tt)}</b><small>${P.name} · ${tt < 5 ? `${rom(Math.min(5, tt + 1))}. sahaya kadar izin` : 'bütün sahalara izin'}</small></span>
      ${tt < 5 ? `<button class="btn ${can ? 'primary' : 'ghost'} mini" data-act="tool:${prof}" ${can ? '' : 'disabled'}>${coin}${fmt(cost)}</button>` : '<span class="sm-max">EN ÜST</span>'}</div>`; };
  return head('flame', 'Demirci', 'Meslek aletlerini bir üst kademeye döver')
    + `<div class="sh-body"><p class="tr-sub">Her meslek kendi aletiyle çalışır. Alet, kendi kademesinin bir üstündeki sahaya kadar izin verir; aletin sahadan üstünse iş hızlanır.</p>
      <div class="sm-list">${PROF_IDS.map(row).join('')}
        <div class="sm-row"><span class="tr-ti">${rodImg(S.rod.t)}</span><span class="tr-tx"><b>${rod().name}</b><small>Balıkçılık · dayanıklılık ${S.rod.dur}/${durMax()}</small></span><button class="btn ghost mini" data-act="smithrod">Olta${icon('chev')}</button></div></div></div>`;
}
