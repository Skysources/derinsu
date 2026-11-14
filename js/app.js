/* =========================================================
   DERİNSU — oyun
   Yarı idle balıkçılık: olta kendi atar ve çeker; vurgun anında "Çek!"e basan
   mükemmel çekiş yapar (şans ×2, değer +%25, seri). Geminin ambarı dolunca av durur.
   Astralis'ten gelenler: dinamik ada ve iş satırı, ada bildirimleri (Notices),
   eşya çerçevesi (ItemFrame), alet kademesi kuralı, 10 dakikalık düğüm rengi
   (burada sürü), 3'lük atölye sırası, günlük etkinlik, sen yokken özeti, alt dok.
   ========================================================= */
'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const app = $('#app');

/* ---------- Kayıt ---------- */
const fresh = () => ({
  v: 1, name: '', started: false,
  silver: START_SILVER, pearl: 0, lvl: 1, xp: 0,
  rod: { t: 1, q: 0 }, boat: false,
  ship: 'marti',      // kullanılan gemi
  ships: { marti: { hold: [] } }, fish: [],   // sahip olunan gemiler ve ambarları (gemi.js)
  box: {},            // sandık: eşya id → adet
  dex: {},            // defter: balık id → { n, best }
  fishing: null,      // { sch, t0, dur, bite, full, sail, wait, to } · sch: avlanılan sürünün yuvası
  sea: null,          // bulunulan açık deniz: { id, type, t, name, seed, until, schools, resp, pos }
  loc: null,          // 'city' | 'sea' · null: henüz limandan çıkılmadı
  combo: 0, buffs: [], ws: {}, rack: {}, fener: 1, rods: [], mk: null,
  quests: null,
  st: { catches: 0, perfect: 0, kg: 0, earned: 0, best: null, chests: 0 },
  last: Date.now(), dev: false, devSpd: 1, devShoal: null,
});
function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) { const s = JSON.parse(raw); return Object.assign(fresh(), s, { st: Object.assign(fresh().st, s.st || {}) }); }
  } catch (e) { /* bozuk kayıt: yeni başla */ }
  return fresh();
}
let noSave = false;
function save() { if (noSave) return; S.last = Date.now(); try { localStorage.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* depolama kapalı */ } }
let S = load();
if (S.rod.dur === undefined) S.rod.dur = Math.round(ROD_DUR[S.rod.t] * GEAR_Q[S.rod.q]);
if (!S.fener) S.fener = 1;
if (!S.rods) S.rods = [];
ensureWs();
ensureShips();

/* ---------- Yardımcılar ---------- */
const icon = (n, cls = '') => `<svg class="ic ${cls}"><use href="#i-${n}"/></svg>`;
const coin = '<svg class="coin"><use href="#g-coin"/></svg>';
const pearlI = '<svg class="coin"><use href="#g-pearl"/></svg>';
const fmt = n => { n = Math.floor(n); return n >= 1e7 ? (n / 1e6).toFixed(1).replace('.', ',') + ' Mn' : String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); };
const fmtAgo = ts => { const m = Math.floor((Date.now() - ts) / 60e3); return m < 1 ? 'az önce' : m < 60 ? m + ' dk önce' : m < 1440 ? Math.floor(m / 60) + ' sa önce' : Math.floor(m / 1440) + ' gün önce'; };
const fmtDec = (n, d = 1) => n.toFixed(d).replace('.', ',');
const fmtKg = kg => (kg >= 100 ? fmt(kg) : fmtDec(kg, kg >= 10 ? 0 : 1)) + ' kg';
const fmtPct = p => p >= 10 ? '%' + Math.round(p) : p >= 1 ? '%' + fmtDec(p) : p >= .1 ? '%' + fmtDec(p, 2) : '1/' + fmt(100 / p);
function fmtDur(sec) {
  sec = Math.max(0, Math.round(sec));
  if (sec < 60) return sec + ' sn';
  const m = Math.floor(sec / 60), s = sec % 60;
  if (m < 60) return m + ' dk' + (s && m < 10 ? ' ' + s + ' sn' : '');
  const h = Math.floor(m / 60); return h + ' sa ' + (m % 60) + ' dk';
}
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, k) => a + (b - a) * k;
function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
const haptic = (ms = 8) => { try { if (navigator.vibrate && (!navigator.userActivation || navigator.userActivation.hasBeenActive)) navigator.vibrate(ms); } catch (e) { /* yok */ } };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/* ---------- Görseller ---------- */
const fishImg = f => `<img src="assets/items/fish/fish-t${f.img}.png" alt="" style="filter:hue-rotate(${f.hue || 0}deg) saturate(${f.sat || 1})">`;
const itemImg = it => it.svg || `<img src="${it.img}" alt=""${it.hue ? ` style="filter:hue-rotate(${it.hue}deg)"` : ''}>`;
const rodImg = t => `<img src="assets/items/rod/rod-t${t}.png" alt="">`;
const frame = (spec, cls = '', attrs = '') => ItemFrame.itemFrame(spec, cls, attrs);
const fishFrame = (f, n, cls, attrs, q = 0) => frame({ tier: spotById(f.spot).t, rarity: QUAL[q].r, icon: fishImg(f), n }, cls, attrs);
const itemFrame = (it, n, cls, attrs) => frame({ tier: it.t, rarity: QUAL[it.q].r, icon: itemImg(it), n }, cls, attrs);
const rodFrame = (r, cls) => frame({ tier: r.t, rarity: QUAL[r.q].r, icon: rodImg(r.t) }, cls);

/* ---------- Zaman, etkinlik, sürü ---------- */
const evDay = (t = Date.now()) => Math.floor((t + EV_TZ) / 864e5);
const dailyEv = () => DAILY_EV[((evDay() % DAILY_EV.length) + DAILY_EV.length) % DAILY_EV.length];
const evFor = (spot, key) => { const e = dailyEv(); if (!e[key]) return 0; if (e.spot && !e.spot.includes(spot.id)) return 0; return e[key]; };
// avlanılan sürünün niteliği (yoksa olağan)
function curShoal() {
  if (S.devShoal !== null && S.devShoal !== undefined) return SHOALS[S.devShoal];
  const sc = S.fishing && S.sea && S.sea.schools[S.fishing.sch];
  return sc ? SHOALS[sc.q] : SHOALS[1];
}
const seaSpot = () => S.sea ? spotById(S.sea.type) : SPOTS[0];

/* İzin verilen avlanma alanları: 8 yuva; her biri AREA_MIN dakikada bir, kaydırmalı değişir */
const AREA_STEP = AREA_MIN * 60e3 / AREA_N;
function areaAt(i, now = Date.now()) {
  const shift = i * AREA_STEP, per = AREA_MIN * 60e3, p = Math.floor((now + shift) / per), r = rng(p * 7919 + i * 104729 + 3);
  r(); let t;
  if (i === 0) t = 1;
  else if (i === 1) t = r() < .5 ? 1 : 2;
  else { let x = r() * 100; t = 5; for (let k = 0; k < 5; k++) { if ((x -= AREA_TIER_W[k]) < 0) { t = k + 1; break; } } }
  const type = SPOTS[t - 1].id, names = AREA_NAMES[type];
  return { id: `${type}-${p}-${i}`, slot: i, type, t, name: names[Math.floor(r() * names.length)], seed: (p % 9973) * 31 + i * 977 + t, until: (p + 1) * per - shift };
}
function areas(now = Date.now()) {
  const list = Array.from({ length: AREA_N }, (_, i) => areaAt(i, now)), used = new Set();
  for (const a of list) {            // aynı adlı iki alan olmasın: sıradaki boş ad
    const names = AREA_NAMES[a.type]; let k = names.indexOf(a.name);
    while (used.has(a.name)) { k = (k + 1) % names.length; a.name = names[k]; }
    used.add(a.name);
  }
  return list;
}
const marketK = spot => +(0.88 + rng(evDay() * 7 + spot.t * 53)() * .3).toFixed(2);

/* ---------- Kurallar ---------- */
const rod = () => RODS[S.rod.t];
const durMax = (r = S.rod) => Math.round(ROD_DUR[r.t] * GEAR_Q[r.q]);
const repairCost = () => (durMax() - S.rod.dur) * REPAIR_COST[S.rod.t];
const rodQ = () => GEAR_Q[S.rod.q];
const canFish = spot => S.rod.t >= spot.t - 1;
const tierMult = spot => S.rod.t >= spot.t ? Math.pow(.85, S.rod.t - spot.t) : 2;
const buff = key => S.buffs.find(b => b.key === key && b.until > Date.now()) || null;
const speedPct = spot => rod().spd * rodQ() + (S.lvl - 1) * LVL_SPD + curShoal().spd + evFor(spot, 'spd') + (buff('food') ? buff('food').spd : 0);
const luckPct = spot => rod().luck * rodQ() + (S.lvl - 1) * LVL_LUCK + evFor(spot, 'luck') + (buff('food') ? buff('food').luck : 0) + (buff('yonca') ? buff('yonca').luck : 0) + (buff('yem') ? buff('yem').luck : 0);
const castSec = spot => spot.sec * tierMult(spot) / (1 + speedPct(spot) / 100) / (S.devSpd || 1);
const dexDone = spot => spotFish(spot.id).every(f => S.dex[f.id]);
const dexBonus = spot => dexDone(spot) ? 10 : 0;
const dexCount = () => FISH.filter(f => S.dex[f.id]).length;
/* ---------- Gece-gündüz, fırtına, tür ve nadirlik zarı (tasarım belgesi) ---------- */
// gündüz ve gece yarımşar saat sürer (saat başı gündüz, buçukta gece) · her üç saatin ilk yarım saati fırtına
const DN_MS = 30 * 60e3;
const isNight = (t = Date.now()) => S.devDn === 0 || S.devDn === 1 ? !!S.devDn : Math.floor(t / DN_MS) % 2 === 1;   // devDn: geliştirici zorlaması
const dnLeft = (t = Date.now()) => DN_MS - t % DN_MS;
const isStorm = (t = Date.now()) => Math.floor((t + EV_TZ) / 60e3) % 180 < 30;
const legOk = (f, t = Date.now()) => f.leg === 'day' ? !isNight(t) : f.leg === 'night' ? isNight(t) : f.leg === 'storm' ? isStorm(t)
  : f.leg === 'week' ? new Date(t + EV_TZ).getUTCDay() === 0 : f.leg === 'event' ? dailyEv().name === 'Kara Ay' && isNight(t) : false;
const speciesW = (spot, t = Date.now()) => { const n = isNight(t); return spotFish(spot.id).map(f => n ? f.night : f.day); };
// nadirlik: belge şansları; şans (olta, seviye, yem, sürü, mükemmel) üst nadirliklere pay aktarır
const rarityW = luck => QUAL.map((x, i) => x.p * (i ? Math.pow(Math.max(.25, 1 + luck / 100), .4 * i) : 1));
const totalLuck = (spot, perfect) => luckPct(spot) + curShoal().luck + (perfect ? PERFECT.luck : 0);
function rollQ(luck, cap = QUAL.length - 1) {
  const w = rarityW(luck).slice(0, cap + 1), tot = w.reduce((a, b) => a + b, 0);
  let r = Math.random() * tot; for (let i = 0; i < w.length; i++) if ((r -= w[i]) < 0) return i;
  return 0;
}
// tür ve nadirlik: önce efsanevi tür (koşulu tutarsa, yalnız manuel avda), sonra gece-gündüz payıyla tür, en son nadirlik zarı
function rollFish(spot, luck, t = Date.now(), offline = false) {
  if (!offline) for (const f of legFish(spot.id)) if (legOk(f, t) && Math.random() * 100 < f.pct * (1 + Math.max(0, luck) / 300)) return { f, q: Math.random() < .08 ? 5 : 4 };
  const fs = spotFish(spot.id), w = speciesW(spot, t), tot = w.reduce((a, b) => a + b, 0);
  let r = Math.random() * tot, f = fs[0];
  for (let i = 0; i < fs.length; i++) if ((r -= w[i]) < 0) { f = fs[i]; break; }
  return { f, q: rollQ(luck, offline ? OFFLINE_QMAX : QUAL.length - 1) };
}
// ada ayrıntısı: şu anki tür payları ve nadirlik dağılımı
function chances(spot, luck = totalLuck(spot)) {
  const w = speciesW(spot), tot = w.reduce((a, b) => a + b, 0);
  return spotFish(spot.id).map((f, i) => [f, w[i] / tot * 100]).filter(x => x[1] > 0).sort((a, b) => b[1] - a[1]);
}
const qChances = luck => { const w = rarityW(luck), tot = w.reduce((a, b) => a + b, 0); return w.map(x => x / tot * 100); };
// av değeri: tür değeri × nadirlik çarpanı × kg
const fishVal = (f, q, kg) => f.v * ECON * QUAL[q].mult * kg;
const avgCommon = spot => { const c = spotFish(spot.id); return c.reduce((s, f) => s + (f.kg[0] + f.kg[1]) / 2 * f.v * ECON, 0) / c.length; };
const filletVal = t => Math.round(avgCommon(SPOTS[t - 1]) * FILLET_N * 1.35);
const dishVal = t => Math.round(filletVal(t) * DISH_N * 1.3);
const CHEST_SILVER = [0, 150, 1500, 12000, 90000, 700000];
const RELIC_VAL = [0, 400, 4000, 30000, 250000, 2000000];
function itemVal(id) {
  const it = ITEMS[id];
  if (it.raw) return it.val;      // toplanan hammadde ve nadir buluntu
  if (id.startsWith('fileto')) return filletVal(it.t);
  if (id.startsWith('yemek')) return dishVal(it.t);
  if (id.startsWith('yag')) return Math.round(avgCommon(SPOTS[it.t - 1]) * 4 * 1.3);
  if (id.startsWith('yem')) return Math.round((filletVal(it.t) + itemVal('yag' + it.t)) / 2 * 1.25);
  if (id.startsWith('cila')) return Math.round(itemVal('yag' + it.t) * 2 * 1.35);
  if (it.mat) return MATS[id].val;
  if (id.startsWith('kalinti')) return RELIC_VAL[it.t];
  if (id.startsWith('sandik')) return Math.round(CHEST_SILVER[it.t] * .6);
  if (id === 'yonca') return 250;
  if (id === 'hazine') return 600000;
  return 0;
}
const fishSellK = spot => marketK(spot) * (1 + (dailyEv().sell || 0) / 100);

/* ---------- Ada ---------- */
const islandEl = $('#island'), islCompact = $('#islCompact'), islAct = $('#islAct'), islDet = $('#islDet');
const isl = { det: false, act: false };
const cardW = () => Math.min(330, app.clientWidth - 24);
function syncIsland() {
  const cw = islCompact.scrollWidth + 2;
  let w = cw, h = 42;
  if (isl.act) { w = Math.max(cw, Math.min(290, cardW())); h = 72; }
  if (isl.det) {
    w = cardW();
    islDet.style.setProperty('--dt', (isl.act ? 72 : 42) + 'px');
    h = (isl.act ? 72 : 42) + islDet.scrollHeight + 2;
  }
  islandEl.style.setProperty('--iw', w + 'px');
  islandEl.style.setProperty('--ih', h + 'px');
  islandEl.style.setProperty('--ir', isl.det ? '22px' : '21px');
  islandEl.classList.toggle('act', isl.act);
  islandEl.classList.toggle('det', isl.det);
}
function flashIsland() { islandEl.classList.remove('flash'); void islandEl.offsetWidth; islandEl.classList.add('flash'); }

/* ---------- Bildirimler (Astralis: Envanter Kartı) ---------- */
const TONE_C = { info: '#6fcbef', warn: '#f0a53a', bad: '#e8474c' };
// pencere ya da menü açıkken sıradan av kartları çıkmaz (kartlar pencerenin başlığını örtmesin); ada iş satırı sürer
const quiet = () => !!win || menuLayer.classList.contains('on');
function notifyFish(f, kg, val, perfect, qi) {
  const q = QUAL[qi], spot = spotById(f.spot);
  if (quiet() && qi < 3) return;
  const slot = fishFrame(f, 0, '', '', qi);
  if (qi >= 3) {
    return Notices.notify({ type: 'grand', rarity: q.r, color: q.c, slot, label: q.name + (perfect ? ' · Mükemmel' : ''), title: f.name, src: spot.name,
      facts: `<span class="nchip">${fmtKg(kg)}</span><span class="nchip">${coin}${fmt(val)}</span>`, done: 'Envantere girdi', action: 'Defter' , fish: f.id });
  }
  Notices.notify({ type: 'item', rarity: q.r, color: q.c, slot, title: f.name, label: perfect ? `${q.name} · Mükemmel` : q.name,
    source: fmtKg(kg), add: 1, bagOf: (bag()[f.id] || { n: 0 }).n, where: 'envanterde', group: 'f:' + f.id + qi, fish: f.id });
}
function notifyItem(id, n = 1, label, where = 'envanterde') {
  const it = ITEMS[id], q = QUAL[it.q];
  const slot = itemFrame(it);
  if (it.q >= 4) return Notices.notify({ type: 'grand', rarity: q.r, color: q.c, slot, label: label || q.name, title: it.name, src: 'Buluntu', done: 'Envantere eklendi', action: 'Aç', item: id });
  Notices.notify({ type: 'find', rarity: q.r, color: q.c, slot, title: it.name, label: label || 'Buluntu', source: '', add: n, bagOf: S.box[id] || 0, where, group: 'i:' + id, item: id });
}
function toast(title, o = {}) {
  const tone = o.tone || 'info';
  Notices.notify({ type: 'toast', tone, color: TONE_C[tone], label: o.label, html: `${title}${o.sub ? ` · <b>${o.sub}</b>` : ''}` });
}
Notices.init({ app, hud: $('.hud'), island: islandEl, haptic,
  onTap(n) {
    haptic(8);
    if (n.type === 'level') return n.ws ? openWs(n.ws, false) : openMenu();
    if (n.fish) return openDex(spotById(FISH_BY[n.fish].spot).t - 1);
    if (n.item) return openInv('box', n.item);
  } });

/* ---------- Seviye ---------- */
function addXp(x, live) {
  if (S.lvl >= MAX_LVL) return;
  S.xp += x;
  while (S.lvl < MAX_LVL && S.xp >= xpNeed(S.lvl)) {
    S.xp -= xpNeed(S.lvl); S.lvl++;
    if (live) {
      Notices.notify({ type: 'level', color: '#e7c26a', label: 'Balıkçılık', title: `Seviye ${S.lvl}`, art: 'assets/ui/prof_fish-256.png',
        done: `Hız +%${fmtDec(LVL_SPD)} · şans +%${fmtDec(LVL_LUCK)}`, action: 'Profil' });
      const l = $('#hudLvl'); l.classList.remove('up'); void l.offsetWidth; l.classList.add('up');
    }
  }
}

/* ---------- Açık deniz: sürüler (Astralis düğümleri gibi tükenir, yerine yenisi çıkar) ---------- */
const randR = ([a, b]) => a + Math.random() * (b - a);
// harita büyüyünce eski kayıtta yuva sayısı az kalabilir: yeni yuvalar boş başlar, sırayla dolar
const seaL = () => {
  const L = Maps.seaLayout(S.sea);
  while (S.sea.schools.length < L.slots.length) { S.sea.schools.push(null); S.sea.resp.push(Date.now() + randR(RESPAWN) * 1000); }
  return L;
};
// Deniz Feneri kademesi: Durgun sürüden Kaynıyor ve Altın Akın'a pay aktarır
const shoalP = () => { const F = FENER[S.fener || 1]; return SHOALS.map((s, i) => s.p + (i === 0 ? -(F.hot + F.gold) : i === 2 ? F.hot : i === 3 ? F.gold : 0)); };
function rollSchool() { const p = shoalP(); let x = Math.random() * 100; for (let i = 0; i < SHOALS.length; i++) { if ((x -= p[i]) < 0) return SHOALS[i]; } return SHOALS[0]; }
function newSchool() { const sh = rollSchool(); return { q: sh.q, left: sh.n, max: sh.n }; }
function enterSea(a, now = Date.now()) {
  S.work = null;      // denize açılınca toplama biter
  if (S.sea && S.sea.id === a.id) { S.loc = 'sea'; return; }      // aynı alana dönüş: sürüler yerinde
  const L = Maps.seaLayout(a), live = L.slots.map((_, i) => i).sort(() => Math.random() - .5).slice(0, SCHOOL_LIVE);
  S.sea = { id: a.id, type: a.type, t: a.t, name: a.name, seed: a.seed, until: a.until,
    schools: L.slots.map((_, i) => live.includes(i) ? newSchool() : null),
    resp: L.slots.map((_, i) => live.includes(i) ? 0 : now + randR(RESPAWN) * 1000), pos: { ...L.start } };
  S.fishing = null; S.combo = 0; S.loc = 'sea';
}
function spawnDue(now, live) {
  if (!S.sea) return;
  S.sea.schools.forEach((s, i) => { if (!s && S.sea.resp[i] && now >= S.sea.resp[i]) { S.sea.schools[i] = newSchool(); S.sea.resp[i] = 0; schoolsDirty = true; } });
  if (S.fishing && S.fishing.wait) { const j = bestSchool(); if (j >= 0) goSchool(j, now, live); }
}
// en iyi sürü: önce nitelik, sonra yakınlık
function bestSchool(from = S.sea.pos) {
  let best = -1, bs = -1e9; const L = seaL();
  S.sea.schools.forEach((s, i) => { if (!s) return; const p = L.slots[i], sc = s.q * 1000 - Math.hypot(p.x - from.x, p.y - from.y); if (sc > bs) { bs = sc; best = i; } });
  return best;
}
// teknenin sürü başında durduğu yer: sürüye 66 px, geldiği yönden
function standAt(i, from = S.sea.pos) {
  const L = seaL(), p = L.slots[i], a0 = Math.atan2(from.y - p.y, from.x - p.x);
  for (const da of [0, .6, -.6, 1.2, -1.2, 2, -2, Math.PI]) { const x = p.x + Math.cos(a0 + da) * 66, y = p.y + Math.sin(a0 + da) * 66; if (L.walkable(x, y)) return { x, y }; }
  return { x: p.x, y: p.y + 66 };
}
// sürüye git: harita açıksa tekne yelken açar, değilse anında varır (sen yokken)
function goSchool(i, now, live) {
  const to = standAt(i);
  S.fishing = { sch: i, t0: now, dur: 1, bite: .9, full: false, sail: true, wait: false, to };
  if (live && view === 'sea' && seaView) {
    seaView.moveTo(to.x, to.y, () => { if (S.fishing && S.fishing.sch === i && S.fishing.sail) arriveSchool(Date.now()); });
  } else arriveSchool(now);
}
function arriveSchool(now) {
  const f = S.fishing; if (!f) return;
  S.sea.pos = { ...f.to };
  f.sail = false; newCast(now);
  if (freeCells() <= 0 && !S.boat) f.full = true;
  if (seaView) { const p = seaL().slots[f.sch]; seaView.face(p.x, p.y); }
  schoolsDirty = true;
}
let offRun = false;   // sen yokken işlenen av: verim OFFLINE_EFF
function newCast(t0) {
  const dur = castSec(seaSpot()) * (0.88 + Math.random() * .24) * 1000 / (offRun ? OFFLINE_EFF : 1);
  Object.assign(S.fishing, { t0, dur, bite: clamp(1 - BITE_WIN * 1000 / dur, .4, .85), full: false, broken: false, sail: false, wait: false, jig: false });
}
function phaseOf(f, now = Date.now()) {
  if (fight) return ['fight', clamp(fight.p, 0, 1)];
  if (!f || f.full || f.broken || f.sail || f.wait) return ['idle', 0];
  const p = clamp((now - f.t0) / f.dur, 0, 1);
  return [p < .08 ? 'cast' : p < f.bite ? 'wait' : 'bite', p];
}
function stopFishing() { S.fishing = null; S.combo = 0; schoolsDirty = true; save(); renderAll(); }
// ambarda yer açılınca ya da olta onarılınca duran av yeniden başlar
function resumeIfRoom() { if (S.fishing && (S.fishing.full || S.fishing.broken) && freeCells() > 0 && S.rod.dur > 0) newCast(Date.now()); }

// bir av: canlıysa bildirim ve sahne; değilse rapor (sen yokken)
// pre: mini oyunla yakalanan balık { f, q }; yoksa kendiliğinden av (sen yokken gibi en çok Nadir, efsanevi tür yok)
function doCatch(spot, perfect, live, rep, at = Date.now(), pre = null) {
  if (S.rod.dur <= 0) { S.fishing.broken = true; return null; }
  const luck = totalLuck(spot, perfect), { f, q } = pre || rollFish(spot, luck, at, true);
  const kg = +(lerp(f.kg[0], f.kg[1], Math.pow(Math.random(), 1.6)) * (1 + QUAL[q].kg / 100) * (perfect ? 1 + randR(PERFECT.kg) / 100 : 1)).toFixed(2);
  // yer yoksa: kayık varsa sat, yoksa dur
  if (!canAdd(f, q)) {
    if (S.boat && holdOf().length) { const got = sellFish(null, BOAT.rate, true); if (rep) rep.boat = (rep.boat || 0) + got; else if (live) toast(`Hal Kayığı balıkları sattı`, { sub: `+${fmt(got)} gümüş` }); }
    if (!canAdd(f, q)) { S.fishing.full = true; if (live) { toast('Envanter doldu', { tone: 'warn', sub: 'av durdu' }); haptic([20, 40, 20]); } return null; }
  }
  if (perfect) S.combo = Math.min(COMBO_MAX, S.combo + 1); else S.combo = 0;
  const val = Math.round(fishVal(f, q, kg) * (1 + S.combo * COMBO_STEP / 100) * (1 + dexBonus(spot) / 100));
  addFish(f, kg, val, q);
  // olta aşınır: %10'da uyarı, 0'da kırılır ve av durur
  S.rod.dur = Math.max(0, S.rod.dur - 1);
  if (S.rod.dur === 0) { S.fishing.broken = true; if (rep) rep.broken = true; else if (live) { toast('Olta kırıldı', { tone: 'bad', label: 'Dayanıklılık', sub: 'envanterdeki Olta yuvasından onar' }); haptic([30, 60, 30]); } }
  else if (live && S.rod.dur === Math.floor(durMax() * .1)) toast('Olta yıpranıyor', { tone: 'warn', label: 'Dayanıklılık', sub: `${S.rod.dur} av kaldı` });
  // sürü bir av eksilir
  const sc = S.sea.schools[S.fishing.sch];
  if (sc && --sc.left <= 0) { S.sea.schools[S.fishing.sch] = null; S.sea.resp[S.fishing.sch] = at + randR(RESPAWN) * 1000; }
  schoolsDirty = true;
  const firstTime = !S.dex[f.id];
  const d = S.dex[f.id] || (S.dex[f.id] = { n: 0, best: 0, q: 0 });
  d.n++; const record = kg > d.best && d.n > 1; d.best = Math.max(d.best, kg); d.q = Math.max(d.q || 0, q);
  S.st.catches++; S.st.kg += kg; if (perfect) S.st.perfect++;
  if (!S.st.best || val > S.st.best.v) S.st.best = { id: f.id, kg, v: val, q };
  addXp(Math.round(spot.xp * Q_XP[q] * (perfect ? 1 + PERFECT.xp / 100 : 1) * (buff('yem') ? 1 + buff('yem').xp / 100 : 1)), live);
  questHook('catch', 1); questHook('kg', kg); if (perfect) questHook('perfect', 1); if (q >= 2) questHook('rare', 1);
  if (rep) { rep.n++; rep.kg += kg; rep.fish[f.id + ':' + q] = (rep.fish[f.id + ':' + q] || 0) + 1; }
  // buluntular
  const fk = (1 + luck / 200) * (1 + (dailyEv().find || 0) / 100);
  for (const fd of FINDS) {
    if (spot.t < fd.minT || Math.random() * 100 >= fd.pct * fk) continue;
    if (fd.id === 'inci') { const n = 1 + Math.floor(spot.t / 3); S.pearl += n; if (rep) rep.pearl += n; else if (live) { toast('İnci buldun', { label: 'Buluntu', sub: `+${n} inci` }); bumpCur('#curPearl'); } continue; }
    const id = fd.id === 'sandik' || fd.id === 'kalinti' ? fd.id + spot.t : fd.id;
    S.box[id] = (S.box[id] || 0) + 1;
    if (rep) rep.items[id] = (rep.items[id] || 0) + 1; else if (live) notifyItem(id);
  }
  if (live) {
    notifyFish(f, kg, val, perfect, q);
    if (quiet()) return { f, kg, val, q };
    if (f.leg) setTimeout(() => toast(`Efsanevi tür: <b>${f.name}</b>`, { label: spot.name, sub: LEG_LBL[f.leg] }), 600);
    else if (firstTime) setTimeout(() => toast(`Deftere yeni tür: <b>${f.name}</b>`, { label: 'Balık Defteri' }), 400);
    else if (record) setTimeout(() => toast(`${f.name} rekoru`, { label: 'Yeni rekor', sub: fmtKg(kg) }), 300);
    if (firstTime && dexDone(spot)) setTimeout(() => toast(`${spot.name} sayfası tamam`, { label: 'Balık Defteri', sub: 'değer +%10' }), 900);
  }
  return { f, kg, val, q };
}
// avdan sonra: sürü tükendiyse en iyi sürüye geç, hiç yoksa yenisini bekle
function afterCatch(at, live) {
  if (!S.fishing || S.fishing.full || S.fishing.broken) return;
  if (S.sea.schools[S.fishing.sch]) { newCast(at); return; }
  const j = bestSchool();
  if (j >= 0) { if (live) toast('Sürü tükendi', { sub: `${SHOALS[S.sea.schools[j].q].name} sürüye yelken` }); goSchool(j, at, live); }
  else { S.fishing.wait = true; if (live) toast('Sürüler tükendi', { tone: 'warn', sub: 'yenisi bekleniyor' }); }
}

// zamanı ilerlet: süresi dolan atışlar kendiliğinden çekilir; tükenen sürünün yerine yenisi çıkar
function advance(now, live, rep) {
  let guard = 0;
  while (S.fishing && S.sea && !fight && guard++ < 6000) {
    const f = S.fishing;
    if (f.wait) {
      const due = Math.min(...S.sea.resp.filter(Boolean));
      if (!isFinite(due) || due > now) break;
      spawnDue(due, live); if (S.fishing && S.fishing.wait) break; continue;
    }
    if (f.full || f.broken || f.sail) break;
    const end = f.t0 + f.dur;
    if (now < end) break;
    spawnDue(end, false);
    const r = doCatch(seaSpot(), false, live, rep, end);
    if (live && r) { if (seaView && view === 'sea') seaView.catchFx(r.f, QUAL[r.q].c, r.q); floatCatch(r, false); }
    afterCatch(end, live);
  }
  spawnDue(now, live);
  processWorkshops(now, live, rep);
  mkTick(now, live && !rep);
}

/* ---------- Çekiş ---------- */
function pull() {
  const f = S.fishing;
  if (view !== 'sea') return;
  if (!f) { toast('Bir balık sürüsüne dokun', { label: 'Açık deniz', sub: 'tekne oraya gider' }); return; }
  if (f.broken) { OPEN.usta(); return; }
  if (f.full) { openHal(); return; }
  const btn = $('#pullBtn');
  if (fight) { fightTap(); btn.classList.remove('hit'); void btn.offsetWidth; btn.classList.add('hit'); return; }
  const [ph] = phaseOf(f);
  if (ph === 'bite') {
    // vurgun: makara çarkı açılır (elle av)
    startFight();
    btn.classList.remove('hit'); void btn.offsetWidth; btn.classList.add('hit');
  } else if (ph === 'wait' || ph === 'cast') {
    // beklerken: yemi oynat, balık çabuk gelir
    if (fightJig()) { btn.classList.remove('hit'); void btn.offsetWidth; btn.classList.add('hit'); }
  }
  renderAll();
}
function comboPop() { const c = $('#fvCombo'); c.classList.toggle('on', S.combo > 0); c.querySelector('b').textContent = '×' + S.combo; c.classList.remove('pop'); void c.offsetWidth; c.classList.add('pop'); }
// şamandıra: sürünün tekneye bakan kenarında
function lineXY() {
  if (!S.fishing || !S.sea || S.fishing.sail || S.fishing.wait) return null;
  const p = seaL().slots[S.fishing.sch], b = S.sea.pos;
  return { x: p.x + (b.x - p.x) * .3, y: p.y + (b.y - p.y) * .3 };
}
// yüzen yazı: şamandıranın ekrandaki yerinde
function floatTxt(text, color, big, dy = 0) {
  if (view !== 'sea' || !seaView) return;
  const l = lineXY() || S.sea.pos, el = document.createElement('span');
  el.className = 'flt' + (big ? ' big' : ''); el.textContent = text; el.style.setProperty('--c', color);
  el.style.left = (l.x - seaView.cam.x) + 'px'; el.style.top = (l.y - seaView.cam.y - 30 + dy) + 'px';
  $('#fvFloat').appendChild(el); setTimeout(() => el.remove(), 1500);
}
function floatCatch(r, perfect) {
  floatTxt(`${r.q ? QUAL[r.q].name + ' ' : ''}${r.f.name} · ${fmtKg(r.kg)}`, QUAL[r.q].c);
  if (perfect) setTimeout(() => floatTxt(S.combo > 1 ? `Mükemmel ×${S.combo}` : 'Mükemmel!', '#e7c26a', true, -20), 120);
}

/* ---------- Satış ---------- */
// spotId null = hepsi · dönen: kazanılan gümüş
function sellFish(spotId, rate = 1, quiet) {
  let got = 0;
  S.fish = holdOf().filter(st => {
    const f = FISH_BY[st.id]; if (spotId && f.spot !== spotId) return true;
    got += Math.round(st.val * fishSellK(spotById(f.spot)) * rate); return false;
  });
  if (!got) return 0;
  S.silver += got; S.st.earned += got; questHook('sell', got);
  resumeIfRoom();
  if (!quiet) { bumpCur('#curSilver'); haptic(10); }
  return got;
}
function sellItem(id, n = 1) {
  n = Math.min(n, S.box[id] || 0); if (!n) return 0;
  const got = itemVal(id) * n;
  S.box[id] -= n; if (S.box[id] <= 0) delete S.box[id];
  S.silver += got; S.st.earned += got; questHook('sell', got); bumpCur('#curSilver');
  return got;
}
function bumpCur(sel) { const e = $(sel); e.classList.remove('bump'); void e.offsetWidth; e.classList.add('bump'); }

/* ---------- Sandık eşyaları ---------- */
function useItem(id) {
  const it = ITEMS[id]; if (!S.box[id]) return;
  if (it.food) {
    S.buffs = S.buffs.filter(b => b.key !== 'food' && b.until > Date.now());
    S.buffs.push({ key: 'food', until: Date.now() + FOOD_MIN * 60e3, spd: it.food.spd, luck: it.food.luck, name: it.name, img: it.img });
    take(id); toast(`${it.name} yendi`, { label: 'Yemek', sub: `${FOOD_MIN} dk hız +%${it.food.spd} · şans +%${it.food.luck}` });
  } else if (it.bait) {
    S.buffs = S.buffs.filter(b => b.key !== 'yem' && b.until > Date.now());
    S.buffs.push({ key: 'yem', until: Date.now() + YEM_MIN * 60e3, luck: it.bait.luck, xp: it.bait.xp, name: it.name, img: it.img });
    take(id); toast(`${it.name} atıldı`, { label: 'Yem', sub: `${YEM_MIN} dk şans +%${it.bait.luck} · deneyim +%${it.bait.xp}` });
  } else if (it.cila) {
    const dm = durMax(); if (S.rod.dur >= dm) { toast('Olta zaten sağlam', { tone: 'warn' }); return; }
    const add = Math.min(it.cila, dm - S.rod.dur); S.rod.dur += add; take(id); resumeIfRoom();
    toast('Olta cilalandı', { label: 'Dayanıklılık', sub: `+${fmt(add)} · ${fmt(S.rod.dur)}/${fmt(dm)}` });
  } else if (it.charm) {
    S.buffs = S.buffs.filter(b => b.key !== 'yonca' && b.until > Date.now());
    S.buffs.push({ key: 'yonca', until: Date.now() + it.charm.min * 60e3, luck: it.charm.luck, name: it.name, img: it.img });
    take(id); toast('Yonca takıldı', { label: 'Tılsım', sub: `${it.charm.min} dk şans +%${it.charm.luck}` });
  } else if (it.chest) {
    take(id); S.st.chests++;
    const big = id === 'hazine', t = it.t;
    const silver = Math.round((big ? 800000 : CHEST_SILVER[t]) * (big ? 1 : .7 + Math.random() * .7));
    const pearls = big ? 25 : 1 + Math.floor(Math.random() * (t + 1));
    S.silver += silver; S.pearl += pearls; bumpCur('#curSilver'); bumpCur('#curPearl');
    const extra = big ? 'kalinti5' : Math.random() < .15 ? 'yonca' : null;
    if (extra) S.box[extra] = (S.box[extra] || 0) + 1;
    Notices.notify({ type: 'grand', rarity: QUAL[it.q].r, color: QUAL[it.q].c, slot: itemFrame(it), label: 'Sandık açıldı', title: it.name,
      facts: `<span class="nchip">${coin}+${fmt(silver)}</span><span class="nchip">${pearlI}+${pearls}</span>${extra ? `<span class="nchip pk">${ITEMS[extra].name}</span>` : ''}`, done: 'Kesene eklendi' });
    haptic([15, 40, 15, 40, 25]);
  }
  save(); renderAll();
}
function take(id, n = 1) { S.box[id] -= n; if (S.box[id] <= 0) delete S.box[id]; }

/* ---------- Fileto kaynağı (Ayıklama Tezgâhı ve Yağhane) ---------- */
// yalnız Sıradan ve Seçkin balıklar kullanılır (ucuzdan pahalıya)
const filletSrc = (t, B = bag()) => FISH.filter(f => f.spot === SPOTS[t - 1].id && B[f.id]).sort((a, b) => B[a.id].val / B[a.id].n - B[b.id].val / B[b.id].n);
const filletHave = t => { const B = bag(); return filletSrc(t, B).reduce((s, f) => s + B[f.id].n, 0); };

/* ---------- Günlük görevler ---------- */
function ensureQuests() {
  const day = evDay();
  if (S.quests && S.quests.day === day) return;
  const r = rng(day * 4099 + 17), kinds = [...QUEST_KINDS];
  const lvl = clamp(Math.floor((S.rod.t - 1) / 2), 0, 2), list = [];
  for (let i = 0; i < 3; i++) {
    const k = kinds.splice(Math.floor(r() * kinds.length), 1)[0];
    const n = k.n[lvl] * (k.k === 'sell' ? [1, 10, 60, 400, 3000][S.rod.t - 1] : 1);
    list.push({ k: k.k, n, prog: 0, claimed: false });
  }
  S.quests = { day, list, bonus: false };
}
function questHook(k, v) { if (!S.quests) return; for (const q of S.quests.list) if (q.k === k && !q.claimed) q.prog = Math.min(q.n, q.prog + v); }
const questReward = i => ({ silver: [300, 3000, 25000, 200000, 1500000][S.rod.t - 1] * (1 + i * .5), pearl: 2 + i });
function claimQuest(i) {
  const q = S.quests.list[i]; if (!q || q.claimed || q.prog < q.n) return;
  const rw = questReward(i);
  q.claimed = true; S.silver += Math.round(rw.silver); S.pearl += rw.pearl; bumpCur('#curSilver'); bumpCur('#curPearl');
  toast('Görev tamam', { label: 'Görevler', sub: `+${fmt(rw.silver)} gümüş · +${rw.pearl} inci` });
  if (!S.quests.bonus && S.quests.list.every(x => x.claimed)) {
    S.quests.bonus = true; const id = 'sandik' + S.rod.t;
    S.box[id] = (S.box[id] || 0) + 1; notifyItem(id, 1, 'Günün ödülü');
  }
  save(); renderAll();
}
const questsReady = () => S.quests && S.quests.list.some(q => !q.claimed && q.prog >= q.n);

/* ---------- Olta onarımı (oltalar Ticaret Evi'nden alınır) ---------- */
function repairRod() {
  const c = repairCost(); if (!c || S.silver < c) return;
  S.silver -= c; S.rod.dur = durMax(); resumeIfRoom();
  toast('Olta onarıldı', { label: 'Dayanıklılık', sub: `${fmt(durMax())} av` }); bumpCur('#curSilver'); haptic(12); save(); renderAll();
}
function buyBoat() { if (S.boat || S.silver < BOAT.cost || S.pearl < BOAT.pearl) return; S.silver -= BOAT.cost; S.pearl -= BOAT.pearl; S.boat = true; toast('Hal Kayığı limanda', { sub: 'fıçı dolunca kendisi satar' }); save(); renderAll(); }

/* =========================================================
   ARAYÜZ
   ========================================================= */
let view = 'city', areasFrom = 'city', seaView = null, seaViewId = null, schoolsDirty = true;
const VIEWS = { city: '#cityView', world: '#worldView', areas: '#areasView', sea: '#seaView', field: '#fieldView' };      // ana ekran: liman
function showView(v) {
  // denizden ayrılırken yoldaki tekne anında varır (harita gizlenince yelken durur)
  if (view === 'sea' && v !== 'sea' && S.fishing && S.fishing.sail) arriveSchool(Date.now());
  if (fight && v !== 'sea') endFight(false, 'leave');
  if (v === 'areas' && view !== 'areas') areasFrom = view;
  view = v; document.body.dataset.view = v;      // ada bulunduğu yere göre renk alır
  for (const [k, sel] of Object.entries(VIEWS)) { const el = $(sel); el.classList.toggle('on', k === v); el.classList.toggle('left', k !== v && k === 'city'); el.setAttribute('aria-hidden', k !== v); }
  if (window.City) City.show(v === 'city');
  if (v === 'city') renderCity();
  if (v === 'field') showField();
  if (v === 'sea') {
    if (!seaView || seaViewId !== S.sea.id + S.ship) {
      if (seaView) seaView.destroy();
      seaView = new Maps.View($('#seaMap'), Maps.sea(S.sea), { tap: seaTap, haptic, start: S.sea.pos, boatSvg: ShipArt.top(S.ship), sail: curShip().sail, insetTop: 100, insetBottom: 114 }); seaViewId = S.sea.id + S.ship;
    } else seaView.place(S.sea.pos.x, S.sea.pos.y);
    if (S.fishing && S.fishing.sail) { const i = S.fishing.sch; seaView.moveTo(S.fishing.to.x, S.fishing.to.y, () => { if (S.fishing && S.fishing.sch === i && S.fishing.sail) arriveSchool(Date.now()); }); }
    else if (S.fishing) { const p = seaL().slots[S.fishing.sch]; seaView.face(p.x, p.y); }
    schoolsDirty = true;
  }
  if (v === 'areas') areaSig = '';
  $$('.nv[data-nav]').forEach(b => b.classList.toggle('on', b.dataset.nav === 'home' && v === 'city'));
  renderAll();
}

/* ---- HUD ---- */
function renderHud() {
  // ada (Astralis düzeni): deneyim halkası, o anki mesleğin simgesi, seviye, ad, gümüş, inci
  $('#hudLvl').textContent = S.lvl;
  const prof = S.loc === 'field' && S.field ? S.field.prof : S.loc === 'sea' ? 'balik' : (S.lastProf || 'balik');
  if (S.loc !== 'city') S.lastProf = prof;
  const emb = '#i-' + PROF_IC[prof]; if ($('#hudEmb').getAttribute('href') !== emb) $('#hudEmb').setAttribute('href', emb);
  if ($('#hudName').textContent !== (S.name || 'Gezgin')) $('#hudName').textContent = S.name || 'Gezgin';
  $('#hudXpRing').style.strokeDashoffset = (113.1 * (1 - clamp(S.xp / xpNeed(S.lvl), 0, 1))).toFixed(1);
  $('#hudSilver').textContent = fmt(S.silver);
  $('#hudPearl').textContent = fmt(S.pearl);
  $('#bookN').textContent = `${dexCount()}/${FISH.length}`;
  $('#qDot').classList.toggle('on', !!questsReady());
}

/* ---- Ana ekran: şehir kartı ve Denizlere Açıl ---- */
const nextAreaIn = (now = Date.now()) => Math.min(...areas(now).map(a => a.until)) - now;
let areaSig = '';
function renderAreas() {
  const now = Date.now(), list = areas(now), sig = list.map(a => a.id).join('|') + S.rod.t + (S.sea ? S.sea.id : '');
  const box = $('#hexes');
  if (!$('#arArt').firstChild) $('#arArt').innerHTML = '<i class="sky"></i>' + Scenes.homeSea();
  if (sig !== areaSig) {
    areaSig = sig;
    box.innerHTML = list.map((a, i) => {
      const sp = spotById(a.type), ok = canFish(sp), here = S.loc === 'sea' && S.sea && S.sea.id === a.id;
      return `<button class="ac ${ok ? '' : 'lock'} ${here ? 'here' : ''}" data-area="${i}" style="--tc:${QUAL[Math.min(4, a.t - 1)].c};--i:${i}">
        <span class="ac-art">${Scenes.area(a.type, a.seed)}</span><i class="ac-veil"></i>
        <span class="ac-tier">${rom(a.t)}</span>
        ${ok ? `<span class="ac-time num">${icon('clock')}<span data-left="${i}"></span></span>` : `<span class="ac-lock">${icon('lock')}${rom(a.t - 1)}. kademe olta</span>`}
        ${here ? '<span class="ac-here">BURADASIN</span>' : ''}
        <span class="ac-tx"><b>${esc(a.name)}</b><small><em>${sp.kind}</em> · ${spotFish(sp.id).length} tür</small></span>
        <i class="ac-bar"><i data-bar="${i}"></i></i></button>`;
    }).join('');
  }
  list.forEach((a, i) => {
    const el = box.querySelector(`[data-left="${i}"]`); if (el) el.textContent = fmtDur((a.until - now) / 1000);
    const br = box.querySelector(`[data-bar="${i}"]`); if (br) br.style.width = clamp((a.until - now) / (AREA_MIN * 60e3) * 100, 0, 100).toFixed(1) + '%';
  });
  $('#arNext').textContent = fmtDur(nextAreaIn(now) / 1000);
  // bulunulan alanın izni dolup listeden çıktıysa: tekneye dönüş şeridi (8 kart aynı kalır)
  const away = S.loc === 'sea' && S.sea && !list.some(a => a.id === S.sea.id);
  const here = $('#arHere'); here.hidden = !away;
  if (away) here.innerHTML = `<span class="tier" style="--tc:${QUAL[Math.min(4, S.sea.t - 1)].c}">${rom(S.sea.t)}</span><span><b>Şu an ${esc(S.sea.name)}</b><small>İzin doldu, avın sürüyor</small></span><span class="btn ghost sm">Denize dön${icon('chev')}</span>`;
  const r = rod();
  $('#arRod').innerHTML = `${rodFrame(S.rod)}<span><b>${r.name}</b><small>En çok <em>${rom(Math.min(5, S.rod.t + 1))}. kademe</em> sulara izin alırsın. Bir alt kademedeki olta ×2 yavaş avlar.</small></span>`;
}
$('#hexes').addEventListener('click', e => {
  const b = e.target.closest('[data-area]'); if (!b) return;
  const a = areas()[+b.dataset.area], sp = spotById(a.type); haptic(8);
  if (!canFish(sp)) { toast(`${a.name} için en az ${rom(a.t - 1)}. kademe olta gerek`, { tone: 'warn', label: 'İzin yok' }); return; }
  if (S.loc === 'sea' && S.sea && S.sea.id === a.id) { showView('sea'); return; }
  travelTo('sea', a, () => { enterSea(a); save(); showView('sea'); toast(a.name, { label: `${rom(a.t)}. kademe · ${sp.kind}`, sub: 'bir sürüye dokun' }); });
});

/* ---- Yolculuk (Astralis: haritalar arası 5 sn) ---- */
let trip = null;
const tripEl = $('#trip');
function placeMark(dest, a) {
  if (dest === 'city') return { name: 'Derinsu Limanı', sub: 'Liman', html: icon('anchor'), c: '#e7c26a' };
  return { name: a.name, sub: `${rom(a.t)}. kademe · ${spotById(a.type).kind}`, html: `<b class="tp-rom">${rom(a.t)}</b>`, c: QUAL[Math.min(4, a.t - 1)].c };
}
function travelTo(dest, a, go) {
  if (trip) return;
  const sameSea = dest === 'sea' && S.loc === 'sea' && S.sea && S.sea.id === a.id;
  if (sameSea || (dest === 'city' && S.loc !== 'sea')) { if (dest === 'city') leaveSea(); go(); return; }
  closeWin(); closeMenu(); closeNav();
  const from = S.loc === 'sea' && S.sea ? placeMark('sea', S.sea) : placeMark('city');
  const to = placeMark(dest, a);
  $('#tpFrom').innerHTML = `<i style="--c:${from.c}">${from.html}</i><b>${esc(from.name)}</b><small>${from.sub}</small>`;
  $('#tpTo').innerHTML = `<i style="--c:${to.c}">${to.html}</i><b>${esc(to.name)}</b><small>${to.sub}</small>`;
  $('#tpTitle').textContent = dest === 'city' ? 'Limana dönüş' : 'Denize açılış';
  // denizden ayrılış varışta işlenir: yolculuktan vazgeçilirse av ve konum olduğu gibi kalır
  trip = { go, leave: dest !== 'sea' || S.loc === 'sea', t0: performance.now(), left: -1 };
  tripEl.classList.add('on'); tripEl.setAttribute('aria-hidden', 'false');
  haptic(12);
  const path = $('#tpPath'), len = path.getTotalLength(), me = $('#tpMe'), fill = $('#tpFill');
  fill.style.strokeDasharray = `${len} ${len}`;
  const step = now => {
    if (!trip) return;
    const p = clamp((now - trip.t0) / (TRAVEL_MS * curShip().trip), 0, 1), pt = path.getPointAtLength(len * p), pt2 = path.getPointAtLength(Math.min(len, len * p + 1));
    me.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${(Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 57.3 + 90).toFixed(1)})`);
    fill.style.strokeDashoffset = (len * (1 - p)).toFixed(1);
    const left = Math.ceil((1 - p) * (TRAVEL_MS * curShip().trip) / 1000);
    if (left !== trip.left) { trip.left = left; $('#tpLeft').textContent = String(left); }
    if (p >= 1) { arrive(); return; }
    trip.raf = requestAnimationFrame(step);
  };
  trip.raf = requestAnimationFrame(step);
  trip.timer = setTimeout(() => trip && arrive(), (TRAVEL_MS * curShip().trip) + 120);   // arka planda rAF yavaşlasa da varış gecikmesin
}
function arrive() { const t = trip; if (!t) return; endTrip(); haptic([8, 30, 8]); if (t.leave) leaveSea(); t.go(); save(); }
function endTrip() { if (!trip) return; cancelAnimationFrame(trip.raf); clearTimeout(trip.timer); trip = null; tripEl.classList.remove('on'); tripEl.setAttribute('aria-hidden', 'true'); }
$('#tpCancel').addEventListener('click', () => { haptic(8); endTrip(); renderAll(); });
// denizden ayrılış: av durur (alanın sürüleri saklanır, aynı alana dönülürse yerinde)
function leaveSea() { if (S.loc === 'sea') { S.fishing = null; S.combo = 0; } S.work = null; S.loc = 'city'; }
function goCity() { travelTo('city', null, () => { S.loc = 'city'; save(); showView('city'); }); }

/* ---- Liman şehri: her yapı bir kart (resim, ad, canlı durum) ---- */
const CITY_B = [
  { id: 'ambar', name: 'Depo', open: 'inv' }, { id: 'lonca', name: 'Lonca Sarayı', open: 'dex' }, { id: 'fener', name: 'Gözcü Kulesi', open: 'fener' },
  { id: 'demirci', name: 'Demirci', open: 'demirci' }, { id: 'isleme', name: 'İşlemehane', open: 'isleme' }, { id: 'zanaat', name: 'Zanaathane', open: 'zanaat' },
  { id: 'tersane', name: 'Tersane', open: 'tersane' }, { id: 'ticaret', name: 'Ticaret Evi', open: 'ticaret' }, { id: 'hal', name: 'Balık Hali', open: 'hal' },
  { id: 'pano', name: 'Görev Panosu', open: 'quests' }, { id: 'iskele', name: 'Şehir Kapısı', open: 'sea' },
];
function cityStatus(id) {
  const busy = m => WORKSHOPS.filter(w => w.mode === m).reduce((s, w) => s + S.ws[w.id].jobs.length, 0);
  switch (id) {
    case 'hal': return holdOf().length ? [`<b>${holdN()}</b> balık · ${coin}${fmt(bagVal())}`, 'on'] : ['Satılacak balık yok', ''];
    case 'tersane': return [`${curShip().kind} <b>${curShip().name}</b>`, ''];
    case 'ticaret': { const m = mkState(); return m.dl.length ? [`<b>${m.dl.length}</b> teslimat hazır`, 'warn'] : m.orders.length ? [`<b>${m.orders.length}</b> açık emir`, 'on'] : ['Oltalar, ürünler, buluntular', '']; }
    case 'isleme': case 'zanaat': { const n = busy(id === 'isleme' ? 'p' : 'g'); return n ? [`<b>${n}</b> iş sürüyor`, 'on'] : rackN() ? [`Rafta <b>${rackN()}</b> ürün`, 'warn'] : ['Atölyeler boşta', '']; }
    case 'demirci': { const up = PROF_IDS.some(p => toolT(p) < 5 && S.silver >= TOOL_COST[toolT(p) + 1]); return up ? ['Alet yükseltilebilir', 'warn'] : ['Toplama aletleri', '']; }
    case 'lonca': return [`Balık Defteri · <b>${dexCount()}/${FISH.length}</b>`, ''];
    case 'pano': { ensureQuests(); const d = S.quests.list.filter(q => q.claimed).length; return questsReady() ? ['Ödül hazır', 'warn'] : [`Günlük görev <b>${d}/3</b>`, '']; }
    case 'ambar': return freeCells() <= 0 ? ['Envanter dolu', 'warn'] : [`Envanter · <b>${fmt(usedCells())}</b>/${totalCells()}`, ''];
    case 'fener': return [`Gözcü Kulesi · <b>${rom(S.fener)}</b>`, ''];
    case 'iskele': return S.loc === 'sea' && S.sea ? [`Teknen <b>${esc(S.sea.name)}</b>'da${S.fishing ? ' · avda' : ''}`, 'on']
      : S.loc === 'field' && S.field ? [`<b>${PROFS[S.field.prof].region}</b>${S.work ? ' · iş sürüyor' : ''}`, 'on'] : ['Dünya haritası · 6 bölge', ''];
  }
  return ['', ''];
}
let cityBuilt = '';
const greet = () => isNight() ? 'İyi geceler' : 'İyi günler';      // oyunun gece-gündüz döngüsüne göre
const CITY_IC = { ambar: 'chest', lonca: 'book', fener: 'flag', demirci: 'anvil', isleme: 'flame', zanaat: 'hammer', tersane: 'anchor', ticaret: 'tag', hal: 'fish', pano: 'scroll', iskele: 'castle' };
// şehir bir kez kurulur (js/sehir/canli.js); sonraki çağrılar yalnız yazıları ve durumları tazeler
function renderCity() {
  const g = $('#cityGrid');
  if (!cityBuilt) {
    cityBuilt = ' ';
    g.innerHTML = `<div class="cw" id="cw"></div><div class="lm-top"><small id="lmHi"></small><b>Derinsu Şehri</b>
      <span class="lm-chips"><span class="chip" id="lmDn"></span><span class="chip" id="lmEv"></span></span></div>
      <button class="lm-go" data-open="sea"><span class="btn primary"><span id="lmGoTx">Şehirden Çık</span><svg class="ic"><use href="#i-chev"/></svg></span></button>`;
    City.mount($('#cw'), CITY_B.map(b => ({ id: b.id, name: b.name, open: b.open, ic: CITY_IC[b.id] })));
  }
  const night = isNight(), atSea = S.loc === 'sea' && !!S.sea;
  City.ship(S.ship, atSea);      // tekne denizdeyse bağlama yerinde yalnız şamandırası kalır
  $('#lmHi').textContent = `${greet()}, ${S.name || 'Balıkçı'}`;
  const atField = S.loc === 'field' && !!S.field;
  $('#lmGoTx').textContent = atSea ? 'Denize Dön' : atField ? 'Sahaya Dön' : 'Şehirden Çık';
  $('#lmDn').innerHTML = `${icon(night ? 'star' : 'bolt')}${night ? 'Gece' : 'Gündüz'} <b class="num">${fmtDur(dnLeft() / 1000)}</b>`;
  $('#lmEv').innerHTML = `${icon('star')}${esc(dailyEv().name)}`;
  const st = {}; for (const b of CITY_B) st[b.id] = cityStatus(b.id); City.status(st);
}

/* ---- Deniz Feneri: Gözcü Kulesi ---- */
function upcomingAreas(n, now = Date.now()) {
  return Array.from({ length: AREA_N }, (_, i) => { const a = areaAt(i, now); return { at: a.until, a: areaAt(i, a.until + 1000) }; })
    .sort((x, y) => x.at - y.at).slice(0, n);
}
function upFener() {
  const n = FENER[S.fener + 1]; if (!n || S.silver < n.cost || S.pearl < n.pearl) return;
  S.silver -= n.cost; S.pearl -= n.pearl; S.fener++;
  Notices.notify({ type: 'level', color: '#f3d68e', label: 'Gözcü Kulesi', title: `Gözcü Kulesi ${rom(S.fener)}`, art: 'assets/ui/board-256.png',
    done: `İyi sürü şansı arttı · ufukta ${FENER[S.fener].see} alan`, action: 'Fener' });
  haptic([15, 40, 25]);
}
function openFener() { openWin('fener', renderFener, {}); }
function renderFener() {
  const F = FENER[S.fener], N = FENER[S.fener + 1], p = shoalP(), now = Date.now();
  const chips = SHOALS.map((sh, i) => `<span style="--qc:${QUAL[sh.q].c}"><i></i><small>${sh.name}</small><b class="num">%${fmtDec(p[i], p[i] % 1 ? 1 : 0)}</b></span>`).join('');
  const ufuk = upcomingAreas(F.see, now).map(({ at, a }, i) => {
    const sp = spotById(a.type), ok = canFish(sp);
    return `<div class="fn-row" style="--tc:${QUAL[Math.min(4, a.t - 1)].c};--i:${i}"><span class="tier">${rom(a.t)}</span><span class="fn-t"><b>${esc(a.name)}</b><small>${sp.kind}${ok ? '' : ` · <em>${rom(a.t - 1)}. olta gerek</em>`}</small></span><span class="fn-at"><small>açılır</small><b class="num">${fmtDur((at - now) / 1000)}</b></span></div>`;
  }).join('');
  const up = N ? `<div class="row fn-up"><span class="row-ic">${icon('up')}</span><span class="row-t"><b>Kuleyi yükselt · ${rom(S.fener + 1)}</b><small>Kaynıyor +%${N.hot - F.hot} · Altın Akın +%${fmtDec(N.gold - F.gold)} · ufukta ${N.see} alan</small></span>
      <button class="btn ${S.silver >= N.cost && S.pearl >= N.pearl ? 'primary' : 'off'}" data-act="fener"><span class="cost ${S.silver >= N.cost ? '' : 'no'}">${coin}${fmt(N.cost)}</span>${N.pearl ? `<span class="cost ${S.pearl >= N.pearl ? '' : 'no'}">${pearlI}${N.pearl}</span>` : ''}</button></div>`
    : `<div class="row done"><span class="row-ic">${icon('check')}</span><span class="row-t"><b>Kule en yüksekte</b><small>Gözcüler ufkun en uzağını görüyor</small></span></div>`;
  return head(`<svg class="fn-hic" viewBox="0 0 40 40">${CityArt.fenerIcon()}</svg>`, 'Gözcü Kulesi', `Kademe <em>${rom(S.fener)}</em> · sürüleri ve ufku gözetler`)
    + `<div class="sh-body"><div class="fn-hero">${CityArt.fener().replace('xMidYMax slice', 'xMidYMid meet')}<span class="fn-lv"><small>Kule</small><b>${rom(S.fener)}</b></span></div>
      <span class="sep">Yeni sürü nitelikleri</span><div class="fn-chips">${chips}</div>
      <span class="sep">Ufukta açılacak alanlar <em>${F.see}</em></span><div class="fn-list">${ufuk}</div>${up}</div>`;
}

/* ---- Açık deniz ---- */
function seaTap({ x, y, mark }) {
  if (mark && mark[0] === 's') {
    const i = +mark.slice(1); if (!S.sea.schools[i]) return;
    haptic(8);
    if (S.fishing && S.fishing.sch === i && !S.fishing.sail) { toggleDet(); return; }
    S.combo = 0; goSchool(i, Date.now(), true); schoolsDirty = true; save();
    return;
  }
  // boş suya: tekne oraya gider, av durur
  if (S.fishing) { S.fishing = null; S.combo = 0; schoolsDirty = true; }
  seaView.moveTo(x, y, () => { S.sea.pos = { x: seaView.me.x, y: seaView.me.y }; save(); });
}
function renderSchools() {
  if (!seaView || !S.sea) return;
  const L = seaL();
  const tier = seaSpot().t;
  seaView.schools = S.sea.schools.map((s, i) => s ? { x: L.slots[i].x, y: L.slots[i].y, q: s.q, tier, on: !!(S.fishing && S.fishing.sch === i) } : null);
  if (!schoolsDirty) return;
  schoolsDirty = false;
  seaView.marksEl.innerHTML = S.sea.schools.map((s, i) => {
    if (!s) return '';
    const p = L.slots[i], sh = SHOALS[s.q], on = !!(S.fishing && S.fishing.sch === i);
    return NodeArt.markHtml({ i, q: s.q, tier, name: sh.name, left: s.left, on, x: p.x, y: p.y });
  }).join('');
}
function renderSea() {
  if (!S.sea) return;
  const sp = seaSpot(), left = (S.sea.until - Date.now()) / 1000;
  $('#svName').textContent = S.sea.name;
  $('#svTier').textContent = `${rom(sp.t)} · ${sp.kind}`;
  $('#svTier').style.setProperty('--qc', QUAL[Math.min(4, sp.t - 1)].c);
  const night = isNight(), storm = isStorm() && (sp.id === 'burun' || sp.id === 'resif');
  $('.sea-stage').classList.toggle('night', night); $('.sea-stage').classList.toggle('storm', storm);
  $('#svTime').innerHTML = `${icon(night ? 'star' : 'bolt')}${night ? 'Gece' : 'Gündüz'} <b class="num">${fmtDur(dnLeft() / 1000)}</b>${storm ? ' · <b>Fırtına</b>' : ''}<i class="sv-sep"></i>${left > 0 ? `İzin <b class="num">${fmtDur(left)}</b>` : 'İzin doldu'}`;
  $('#svPermit').innerHTML = left > 0 ? `${icon('clock')}İzin <b class="num">${fmtDur(left)}</b>` : `${icon('clock')}İzin doldu · av sürer`;
  const sh = curShoal(), f = S.fishing;
  $('#svInfo').innerHTML = f ? (f.sail ? `${icon('anchor')}Yelken açık` : f.wait ? `${icon('clock')}Sürü bekleniyor` : `<i style="background:${QUAL[sh.q].c}"></i>${sh.name} sürü · atış ${fmtDec(castSec(sp))} sn`) : `${icon('fish')}Bir sürüye dokun`;
  const used = usedCells(), cap = totalCells();
  $('#fbBagRing').style.strokeDashoffset = 106.8 * (1 - clamp(used / cap, 0, 1));
  $('#fbBag .fb-ring').classList.toggle('full', used >= cap);
  $('#fbBagKg').textContent = `${used}/${cap}`;
  const fd = buff('food');
  $('#fbFood').classList.toggle('on', !!fd);
  $('#fbFoodT').textContent = fd ? fmtDur((fd.until - Date.now()) / 1000) : 'Yemek';
  $('#fbStop').classList.toggle('stopped', !S.fishing);
  $('#fbStop small').textContent = S.fishing ? 'Durdur' : 'En iyi sürü';
  $('#fbStop .fb-ic').innerHTML = icon(S.fishing ? 'stop' : 'fish');
  const stop = f && (f.broken ? 'broken' : f.full ? 'full' : '');
  $('#fvFull').classList.toggle('on', !!stop);
  if (stop && $('#fvFull').dataset.k !== stop) {
    $('#fvFull').dataset.k = stop;
    $('#fvFull').innerHTML = stop === 'broken' ? `<b>Olta kırık</b><small>Onar ya da yedek olta kuşan; av kaldığı yerden sürer</small><button class="btn primary" data-open="usta">Olta</button>`
      : `<b>Envanter dolu</b><small>Balıkları Hal'de sat ya da eşyaları azalt; yer açılınca av sürer</small><span class="fv-fb"><button class="btn ghost" data-open="ambar">Envanter</button><button class="btn primary" data-open="hal">Hal'e git</button></span>`;
  }
  const c = $('#fvCombo'); c.classList.toggle('on', S.combo > 0); c.querySelector('b').textContent = '×' + S.combo;
  renderSchools();
}

/* ---- Dok: etkiler ---- */
let tipT = 0;
function renderBuffs() {
  const e = dailyEv(), list = [{ id: 'ev', c: '#e7c26a', ic: icon('star'), name: e.name, desc: e.desc }];
  for (const b of S.buffs) {
    if (b.until <= Date.now()) continue;
    const m = Math.ceil((b.until - Date.now()) / 60e3);
    list.push({ id: b.key, c: b.key === 'yonca' ? '#6fcf62' : b.key === 'yem' ? '#9bd68f' : '#e0853a', ic: `<img src="${b.img}" alt="">`, name: b.name, desc: b.key === 'food' ? `Hız +%${b.spd} · şans +%${b.luck} · ${m} dk` : b.key === 'yem' ? `Şans +%${b.luck} · deneyim +%${b.xp} · ${m} dk` : `Şans +%${b.luck} · ${m} dk`, t: m + 'dk' });
  }
  if (S.boat) list.push({ id: 'boat', c: '#9bd68f', ic: icon('anchor'), name: 'Hal Kayığı', desc: `Envanter dolunca balıkları %${BOAT.rate * 100} fiyata kendisi satar` });
  const sig = list.map(x => x.id + x.t).join('|');
  const el = $('#buffs');
  if (el.dataset.sig === sig) return;
  el.dataset.sig = sig;
  el.innerHTML = list.map(x => `<button class="bf" data-bf="${x.id}" style="--c:${x.c}" aria-label="${esc(x.name)}">${x.ic}${x.t ? `<small>${x.t}</small>` : ''}</button>`).join('');
  el._list = list;
}
$('#buffs').addEventListener('click', e => {
  const b = e.target.closest('[data-bf]'); if (!b) return;
  const x = $('#buffs')._list.find(y => y.id === b.dataset.bf); if (!x) return;
  const tip = $('#bfTip'); tip.innerHTML = `<b>${esc(x.name)}</b>${esc(x.desc)}`; tip.classList.add('on'); haptic(5);
  clearTimeout(tipT); tipT = setTimeout(() => tip.classList.remove('on'), 2600);
});

/* ---- Ada: iş satırı ve ayrıntı ---- */
let actIdx = 0, actSwap = 0;
function activities() {
  const a = [];
  if (S.fishing) a.push('fish');
  if (S.work && S.field) a.push('work');
  if (wsBusy()) a.push('smoke');
  return a;
}
function renderAct(now) {
  const list = activities();
  isl.act = list.length > 0;
  if (!isl.act) { if (isl.det) renderDet(); syncIsland(); return; }
  if (now - actSwap > 4500 && list.length > 1) { actIdx++; actSwap = now; }
  const which = list[actIdx % list.length];
  let html;
  if (which === 'fish') {
    const f = S.fishing, [ph, p] = phaseOf(f, now);
    const lbl = fight ? 'mücadele!' : f.broken ? 'olta kırık' : f.full ? 'envanter dolu' : f.sail ? 'yelken açık' : f.wait ? 'sürü bekleniyor' : ph === 'cast' ? 'atılıyor' : ph === 'wait' ? 'bekleniyor' : 'vurgun!';
    html = `<span class="ia-ic spin" style="--c:${f.full || f.broken ? '#e2705f' : '#e7c26a'}">${icon('hook')}</span>
      <span class="ia-tx"><b>${esc(S.sea.name)} <em>· ${lbl}</em></b><span class="ia-bar ${ph === 'bite' ? 'bite' : ''}"><i style="width:${(f.full ? 100 : p * 100).toFixed(1)}%"></i></span></span>
      <b class="ia-v ${f.full ? 'full' : ''}">${usedCells()}/${totalCells()}</b>`;
  } else if (which === 'work') {
    const F = S.field, w = S.work, P = PROFS[F.prof], p = w.walk || w.wait ? 0 : clamp((now - w.t0) / w.dur, 0, 1), id = P.res + F.t;
    html = `<span class="ia-ic spin" style="--c:${P.c}">${icon('bolt')}</span>
      <span class="ia-tx"><b>${P.region} <em>· ${w.walk ? 'yolda' : w.wait ? 'düğüm bekleniyor' : P.doing}</em></b><span class="ia-bar"><i style="width:${(p * 100).toFixed(1)}%"></i></span></span>
      <b class="ia-v">${fmt(S.box[id] || 0)}</b>`;
  } else {
    const ws = WORKSHOPS.filter(x => S.ws[x.id].jobs.length), k = ws[Math.floor(now / 4500) % ws.length], o = S.ws[k.id].jobs[0], r = RCP[o.rid];
    const ms = wsSec(r) * 1000, p = clamp((now - (o.t0 || now)) / ms, 0, 1);
    html = `<span class="ia-ic" style="--c:${k.c}">${icon('flame')}</span>
      <span class="ia-tx"><b>${k.name} <em>· ${ITEMS[r.out].name} ${rom(r.t)} · ${o.made}/${o.n}</em></b><span class="ia-bar"><i style="width:${(p * 100).toFixed(1)}%"></i></span></span>
      <b class="ia-v">${fmtDur(jobsLeft(k.id, 1))}</b>`;
  }
  islAct.innerHTML = html;
  syncIsland();
}
function renderDet() {
  const sp = seaSpot(), luck = totalLuck(sp), ch = chances(sp, luck), qc = qChances(luck), sh = curShoal(), night = isNight(), legs = legFish(sp.id).filter(f => legOk(f));
  islDet.innerHTML = `<span class="id-h">${night ? 'Gece' : 'Gündüz'} türleri · ${S.sea ? esc(S.sea.name) : sp.name}${isStorm() ? ' · fırtına' : ''}<i></i></span>
    ${ch.map(([fi, p]) => { const known = !!S.dex[fi.id]; return `<div class="id-row ${known ? '' : 'unk'}" style="--qc:#e8e4dc">${fishFrame(fi, 0, 'mini')}<span class="id-n">${known ? fi.name : 'Bilinmeyen tür'}<small>${fmtKg(fi.kg[0])}–${fmtKg(fi.kg[1])}</small></span><b>${fmtPct(p)}</b></div>`; }).join('')}
    ${legs.length ? `<div class="id-leg">${icon('star')}<span>${legs.map(f => `<b>${S.dex[f.id] ? f.name : 'Efsanevi tür'}</b>`).join(', ')} şu an çıkabilir</span></div>` : ''}
    <span class="id-h">Nadirlik<i></i></span>
    <div class="id-q"><i class="id-qbar">${qc.map((p, q) => `<i style="flex:${p};background:${QUAL[q].c}"></i>`).join('')}</i>
      <span>${qc.map((p, q) => `<em style="color:${QUAL[q].c}">${QUAL[q].name} <b>${fmtPct(p)}</b></em>`).join('')}</span></div>
    <div class="id-kv"><span><small>Atış</small><b>${fmtDec(castSec(sp))} sn</b></span><span><small>Şans</small><b>${luck >= 0 ? '+' : '−'}%${fmt(Math.abs(luck))}</b></span><span><small>Sürü</small><b style="color:${QUAL[sh.q].c}">${sh.name}</b></span></div>`;
  $$('.id-row', islDet).forEach((row, i) => { if (!S.dex[ch[i][0].id]) { const im = row.querySelector('.ifr-ico img'); if (im) im.classList.add('unk'); } });
}
function toggleDet(on = !isl.det) {
  isl.det = on;
  if (on) renderDet();
  Notices.hold(on);
  syncIsland();
}
islandEl.addEventListener('click', e => {
  if (e.target.closest('.cur')) return;
  if (e.target.closest('#pilotBtn, #hudName')) { haptic(6); openInv('box'); return; }
  toggleDet(); haptic(5);
});
$('#curSilver').addEventListener('click', () => openHal());
$('#curPearl').addEventListener('click', () => toast('İnci: nadir buluntu, sandık ve görevlerden gelir', { label: 'İnci', sub: `${fmt(S.pearl)} tane` }));

/* =========================================================
   PENCERELER
   ========================================================= */
const layer = $('#sheetLayer'), sheetIn = $('#sheetIn');
bindHold();
let win = null;   // { id, render }
function openWin(id, render, o = {}) {
  closeNav(); closeMenu(false);
  if (isl.det) toggleDet(false);
  win = { ...o, id, render };
  sheetIn.className = 'sheet-in fr' + (o.tall ? ' tall' : '');
  drawWin(true);
  layer.classList.add('on'); layer.setAttribute('aria-hidden', 'false');
}
function drawWin(anim) {
  if (!win) return;
  const st = sheetIn.querySelector('.sh-body') ? sheetIn.querySelector('.sh-body').scrollTop : 0;
  sheetIn.classList.toggle('still', !anim);
  sheetIn.innerHTML = win.render(win);
  if (win.after) win.after(sheetIn);
  const b = sheetIn.querySelector('.sh-body');
  if (!anim && b) { b.scrollTop = st; $$('.sh-body > *', sheetIn).forEach(x => (x.style.animation = 'none')); }
}
function closeWin() { win = null; layer.classList.remove('on'); layer.setAttribute('aria-hidden', 'true'); }
// pencere ekranda %80 ölçekte çizilir: ekran pikselini pencerenin kendi ölçüsüne çevirmek için
const winScale = () => { const el = $('#sheet'); return el.offsetWidth ? el.getBoundingClientRect().width / el.offsetWidth : 1; };
// başlıktan aşağı çekince pencere kapanır (Astralis)
(() => {
  const el = $('#sheet'); let y0 = null, dy = 0;
  el.addEventListener('pointerdown', e => {
    if (!e.target.closest('.sh-head') || e.target.closest('button')) return;
    y0 = e.clientY; dy = 0; el.classList.add('dragging'); try { el.setPointerCapture(e.pointerId); } catch (er) {}
  });
  el.addEventListener('pointermove', e => { if (y0 === null) return; dy = Math.max(0, e.clientY - y0); el.style.setProperty('--drag', dy + 'px'); });
  const end = () => {
    if (y0 === null) return;
    y0 = null; el.classList.remove('dragging');
    if (dy > 90) { haptic(6); closeWin(); setTimeout(() => el.style.removeProperty('--drag'), 50); } else el.style.removeProperty('--drag');
  };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
})();
$('#sheetBg').addEventListener('click', closeWin);
const head = (ic, title, sub) => `<header class="sh-head"><span class="sh-ic">${ic.startsWith('<') ? ic : icon(ic)}</span><span class="sh-t"><b>${title}</b><small>${sub}</small></span><button class="icon-btn sh-x" data-act="close" aria-label="Kapat">${icon('close')}</button></header>`;
const tabs = (list, cur) => `<nav class="sh-tabs">${list.map(([k, l]) => `<button data-tab="${k}" class="${k === cur ? 'on' : ''}">${l}</button>`).join('')}</nav>`;

sheetIn.addEventListener('click', e => {
  const t = e.target.closest('[data-act],[data-tab],[data-sel],[data-card]');
  if (!t || !win) return;
  if (t.dataset.card) return t.dataset.card.startsWith('rod:') ? spareRodCard(+t.dataset.card.slice(4), t) : t.dataset.card.startsWith('fish:') ? stackCard(+t.dataset.card.slice(5), t) : boxCard(t.dataset.card, t);
  haptic(5);
  if (t.dataset.tab) { win.tab = t.dataset.tab; win.sel = null; drawWin(true); return; }
  if (t.dataset.sel !== undefined) { win.sel = t.dataset.sel; drawWin(false); return; }
  const [a, x, y] = t.dataset.act.split(':');
  if (a === 'te') { const P = t.dataset.act.split(':'); return teAct(P[1], P[2], P[3], P[4]); }
  switch (a) {
    case 'close': return closeWin();
    case 'tier': return tierAct(x, y);
    case 'tool': return toolAct(x);
    case 'smithrod': { closeWin(); return OPEN.usta(); }
    case 'sellall': { const got = sellFish(x || null); if (got) toast('Balıklar satıldı', { label: 'Balık Hali', sub: `+${fmt(got)} gümüş` }); break; }
    case 'sellitem': { const got = sellItem(x, +y || 1); if (got) toast(`${ITEMS[x].name} satıldı`, { sub: `+${fmt(got)} gümüş` }); if (!S.box[x]) win.sel = null; break; }
    case 'use': useItem(x); if (!S.box[x]) win.sel = null; break;
    case 'repair': repairRod(); break;
    case 'ship': return shipAct(x, y);
    case 'hold': return holdAct(x, y);
    case 'inv': return invAct(x, y, t);
    case 'boat': buyBoat(); break;
    case 'ws': return wsAct(x, y);
    case 'fener': upFener(); break;
    case 'gd': return guideAct(x, y);
    case 'claim': claimQuest(+x); break;
    case 'dex': win.tab = x; break;
    case 'go': { closeWin(); showView('areas'); return; }
    case 'open': return OPEN[x] && OPEN[x]();
    case 'dev': devAct(x); break;
    case 'reset': if (t.dataset.sure) { noSave = true; localStorage.removeItem(SAVE_KEY); location.reload(); } else { t.dataset.sure = '1'; t.textContent = 'Emin misin? Bir daha dokun'; } return;
    case 'rename': { const v = ($('#renameIn') || {}).value; if (v && v.trim()) { S.name = v.trim().slice(0, 14); toast('Ad değişti', { sub: S.name }); } break; }
  }
  save(); renderAll(); drawWin(false);
});

/* ---- Gemi ambarı ve sandık ---- */
// Envanter (Astralis düzeni, tek): view 1 Giyilenler, 0 Toplama
function openInv(tab = 'bag', sel = null) { openWin('inv', renderInv, { view: tab === 'bag' ? 0 : 1, sort: 0, sel, tall: true }); }
function renderInv(w) {
  const used = usedCells(), cap = totalCells();
  return `<header class="sh-head"><span class="sh-t"><b>Envanter</b></span><button class="icon-btn sh-x" data-act="close" aria-label="Kapat">${icon('close')}</button></header>
    <div class="sh-body iv">
      <div class="inv-top">
        <button class="inv-tab ${w.view ? 'on' : ''}" data-act="inv:view:1">Giyilenler <span class="num">${1 + (buff('yonca') ? 1 : 0)}/6</span></button>
        <button class="inv-tab ${w.view ? '' : 'on'}" data-act="inv:view:0">Toplama <span class="num">5/6</span></button>
      </div>
      ${invTop(w)}
      <div class="inv-filters">
        <span class="fchip on">Envanter <span class="num">${fmt(used)}</span></span>
        <button class="fchip ico" data-act="inv:sort" aria-label="Sırala">${icon('sliders')}</button>
        <button class="fchip ico two" data-act="sellall" aria-label="Balıkları sat" ${holdOf().length ? '' : 'disabled'}>${icon('tag')}</button>
      </div>
      ${invGrid(w)}
      <div class="inv-cur">
        <div class="cur-card">${coin}<span><small>Gümüş</small><b class="num">${fmt(S.silver)}</b></span></div>
        <div class="cur-card"><svg class="hc-coin" aria-hidden="true"><use href="#g-pearl"/></svg><span><small>İnci</small><b class="num">${fmt(S.pearl)}</b></span></div>
      </div>
      <div class="inv-load">
        <span class="ld-ic">${icon('bag')}</span>
        <span class="ld-tx"><b>Yük</b><span class="num">${fmt(used)}</span><small>/ ${cap} eşya</small></span>
        <span class="ld-ext">${holdOf().length ? `Balıklar <em>${coin}${fmt(bagVal())}</em>` : 'Balık yok'}</span>
        <span class="ld-bar ${used >= cap ? 'over' : ''}"><i style="width:${Math.min(100, used / cap * 100).toFixed(1)}%"></i></span>
      </div>
    </div>`;
}

/* ---- Balık Hali ---- */
function openHal() { openWin('hal', renderHal, {}); }
function renderHal() {
  const ev = dailyEv().sell || 0;
  const rows = SPOTS.map(sp => {
    const B = bag(), ids = Object.keys(B).filter(id => FISH_BY[id].spot === sp.id);
    const n = ids.reduce((s, i) => s + B[i].n, 0), kg = ids.reduce((s, i) => s + B[i].kg, 0);
    const val = ids.reduce((s, i) => s + Math.round(B[i].val * fishSellK(sp)), 0), k = marketK(sp);
    const arrow = k >= 1.05 ? '<b class="buy">▲</b>' : k <= .95 ? '<b class="sell">▼</b>' : '';
    return `<div class="row"><span class="row-ic"><span class="tier" style="width:36px;height:36px;--tc:${QUAL[Math.min(4, sp.t - 1)].c}">${rom(sp.t)}</span></span>
      <span class="row-t"><b>${sp.name}</b><small>Fiyat ×${fmtDec(k * (1 + ev / 100), 2)} ${arrow} · ${n ? `${n} balık · ${fmtKg(kg)}` : 'envanterde yok'}</small></span>
      <button class="btn ${n ? 'sell-b' : 'off'}" data-act="sellall:${sp.id}">${coin}${fmt(val)}</button></div>`;
  }).join('');
  const tot = bagVal();
  return head('<img src="assets/items/fish/fish-t2.png" alt="">', 'Balık Hali', `Fiyatlar her gün değişir${ev ? ` · <em>${dailyEv().name} +%${ev}</em>` : ''}`)
    + `<div class="sh-body">${rows}
      <div class="kvs"><span><small>Envanterdeki balık</small><b>${holdN()} · ${fmtKg(holdKg())}</b></span><span><small>Toplam değer</small><b class="sell">${coin}${fmt(tot)}</b></span><span><small>Bugüne dek</small><b>${coin}${fmt(S.st.earned)}</b></span></div>
      <button class="btn sell-b wide ${tot ? '' : 'off'}" data-act="sellall">${icon('tag')}Hepsini sat · ${fmt(tot)} gümüş</button>
      <button class="btn ghost wide" data-act="open:inv">Envanteri aç${icon('chev')}</button></div>`;
}

/* ---- Balık Defteri ---- */
function openDex(i = 0) { openWin('dex', renderDex, { tab: String(i) }); }
function renderDex(w) {
  const i = +(w.tab || 0), leg = i === SPOTS.length, sp = SPOTS[i], night = isNight();
  const tabsH = SPOTS.map((s, k) => `<button data-act="dex:${k}" class="${k === i ? 'on' : ''} ${dexDone(s) ? 'full' : ''}">${rom(s.t)}</button>`).join('')
    + `<button data-act="dex:${SPOTS.length}" class="leg ${leg ? 'on' : ''}">${icon('star')}</button>`;
  const card = f => {
    const d = S.dex[f.id], s2 = spotById(f.spot), when = f.leg ? `${s2.name} · ${LEG_LBL[f.leg]}` : !f.day ? 'yalnız gece' : f.night > f.day ? 'gece daha çok' : f.day > f.night ? 'gündüz daha çok' : 'gece ve gündüz';
    if (!d) return `<div class="dx unk">${frame({ tier: s2.t, rarity: f.leg ? 'red' : 'white', icon: fishImg(f).replace('style="', 'class="unk" style="') })}<span><b>???</b><small>${when}</small></span></div>`;
    const q = d.q || 0;
    return `<div class="dx">${fishFrame(f, 0, '', '', q)}<span><b>${f.name}</b><small>${d.n} tane · rekor ${fmtKg(d.best)}</small><small><i style="color:${QUAL[q].c}">en iyi ${QUAL[q].name}</i> · ${when}</small></span></div>`;
  };
  const list = leg ? FISH.filter(f => f.leg) : spotFish(sp.id), n = list.filter(f => S.dex[f.id]).length;
  const done = !leg && dexDone(sp);
  return head('book', 'Balık Defteri', `<em>${dexCount()}</em> / ${FISH.length} tür · ${fmt(S.st.catches)} av · ${night ? 'gece' : 'gündüz'}`)
    + `<div class="sh-body"><div class="dex-tabs">${tabsH}</div><span class="sep">${leg ? 'Efsanevi türler' : `${sp.name} · ${ECON * sp.v[0]}–${ECON * sp.v[1]} gümüş/kg`} <em>${n}/${list.length}</em></span><div class="dex">${list.map(card).join('')}</div>
      ${leg ? `<div class="dex-bonus">${icon('star')}<span>Efsanevi türler koşulu tutunca, yalnız mini oyunla tutulur (kendiliğinden avda ve sen yokken çıkmaz); nadirlikleri en az Efsanevi'dir ve kendi turuncu malzemelerini düşürür.</span></div>`
        : `<div class="dex-bonus ${done ? 'ok' : ''}">${icon(done ? 'check' : 'star')}<span>${done ? `Sayfa tamam: ${sp.name} balıkları <b>+%10</b> değerli` : `Yedi türü de tut: ${sp.name} balıkları +%10 değerli olur`}</span></div>`}
      <button class="btn ghost wide" data-act="go:areas">${icon('wave')}Denizlere açıl</button></div>`;
}

/* ---- Görevler ---- */
function openQuests() { ensureQuests(); openWin('quests', renderQuests, {}); }
function renderQuests() {
  ensureQuests();
  const rows = S.quests.list.map((q, i) => {
    const k = QUEST_KINDS.find(x => x.k === q.k), rw = questReward(i), ok = q.prog >= q.n;
    return `<div class="row ${q.claimed ? 'done' : ''}"><span class="row-ic"><img src="assets/ui/${['quests', 'scroll', 'board'][i]}-256.png" alt=""></span>
      <span class="row-t"><b>${k.txt(fmt(q.n))}</b><small>${coin}${fmt(rw.silver)} · ${pearlI}${rw.pearl}</small><span class="pbar ${ok ? 'ok' : ''}"><i style="width:${q.prog / q.n * 100}%"></i></span></span>
      ${q.claimed ? `<span class="btn off sm">${icon('check')}</span>` : `<button class="btn ${ok ? 'primary' : 'off'}" data-act="claim:${i}">${ok ? 'Al' : `${fmt(q.prog)}/${fmt(q.n)}`}</button>`}</div>`;
  }).join('');
  const left = (evDay() + 1) * 864e5 - EV_TZ - Date.now();
  return head('<img src="assets/ui/quests-256.png" alt="">', 'Günlük Görevler', `Yenilenmesine <em>${fmtDur(left / 1000)}</em>`)
    + `<div class="sh-body">${rows}<div class="row ${S.quests.bonus ? 'done' : ''}">${itemFrame(ITEMS['sandik' + S.rod.t])}<span class="row-t"><b>Günün ödülü</b><small>Üç görevi de bitir: ${ITEMS['sandik' + S.rod.t].name} ${rom(S.rod.t)}</small></span>${S.quests.bonus ? `<span class="btn off sm">${icon('check')}</span>` : `<span class="btn off sm">${S.quests.list.filter(q => q.claimed).length}/3</span>`}</div>
      <div class="box" style="font:500 10px/1.4 var(--fb);color:var(--muted)">Bugünün etkinliği: <b style="color:var(--gold)">${dailyEv().name}</b> · ${dailyEv().desc}</div></div>`;
}

/* ---- Sen yokken ---- */
function openAway(rep, sec) {
  const fish = Object.entries(rep.fish).map(([k, n]) => [k.split(':')[0], +(k.split(':')[1] || 0), n]).sort((a, b) => b[1] - a[1] || b[2] - a[2]);
  const items = Object.entries(rep.items);
  openWin('away', () => head('clock', 'Sen yokken', `${fmtDur(sec)} geçti · verim %${OFFLINE_EFF * 100}, en çok ${QUAL[OFFLINE_QMAX].name}${sec >= MAX_OFFLINE ? ' · en çok 8 saat' : ''}`)
    + `<div class="sh-body away"><div class="away-top"><span><small>Av</small><b>${icon('fish')}${fmt(rep.n)}</b></span><span><small>Ağırlık</small><b>${fmtKg(rep.kg)}</b></span>${rep.pearl ? `<span><small>İnci</small><b>${pearlI}${rep.pearl}</b></span>` : ''}${rep.boat ? `<span><small>Kayık sattı</small><b class="sell">${coin}${fmt(rep.boat)}</b></span>` : ''}</div>
      ${fish.length ? `<span class="sep">Tutulanlar</span><div class="grid" style="--cols:6">${fish.slice(0, 12).map(([id, q, n]) => fishFrame(FISH_BY[id], n, 'slot', '', q)).join('')}</div>` : '<div class="empty-note">Av yoktu.</div>'}
      ${items.length ? `<span class="sep">Sandık ve raf</span><div class="grid" style="--cols:6">${items.slice(0, 12).map(([id, n]) => itemFrame(ITEMS[id], n, 'slot')).join('')}</div>` : ''}
      ${S.fishing && S.fishing.broken ? '<div class="box" style="color:var(--danger);font:500 11px var(--fb)">Olta kırıldı, av durdu. Envanterde oltaya dokunup onar.</div>' : S.fishing && S.fishing.full ? '<div class="box" style="color:var(--danger);font:500 11px var(--fb)">Ambar doldu, av durdu. Hal\'de sat ya da daha büyük gemi al.</div>' : ''}
      <div style="display:flex;gap:6px">${holdOf().length ? `<button class="btn sell-b" style="flex:1" data-act="open:hal">${icon('tag')}Hal'e git</button>` : ''}<button class="btn primary" style="flex:1" data-act="close">Devam</button></div></div>`, {});
}

/* ---- Rehber ---- */
let guideHtml = null;
function md(src) {
  const inl = s => esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/_(.+?)_/g, '<em>$1</em>');
  const out = []; let list = false, table = null;
  const flush = () => { if (list) { out.push('</ul>'); list = false; } if (table) { out.push('<table>' + table.map((r, i) => `<tr>${r.map(c => i ? `<td>${inl(c)}</td>` : `<th>${inl(c)}</th>`).join('')}</tr>`).join('') + '</table>'); table = null; } };
  for (const raw of src.split('\n')) {
    const l = raw.trimEnd();
    if (/^\|/.test(l)) { if (/^\|[\s-:|]+\|$/.test(l)) continue; (table || (flush(), table = [])).push(l.slice(1, -1).split('|').map(c => c.trim())); continue; }
    if (table) flush();
    if (/^- /.test(l)) { if (!list) { out.push('<ul>'); list = true; } out.push(`<li>${inl(l.slice(2))}</li>`); continue; }
    flush();
    if (/^### /.test(l)) out.push(`<h3>${inl(l.slice(4))}</h3>`);
    else if (/^## /.test(l)) out.push(`<h2>${inl(l.slice(3))}</h2>`);
    else if (/^# /.test(l)) continue;
    else if (/^> /.test(l)) out.push(`<blockquote>${inl(l.slice(2))}</blockquote>`);
    else if (l) out.push(`<p>${inl(l)}</p>`);
  }
  flush(); return out.join('');
}
let guideSecs = null;
function parseGuide(src) {
  const secs = []; let cur = null;
  for (const l of src.split('\n')) { if (/^## /.test(l)) { cur = { title: l.slice(3).trim(), body: [] }; secs.push(cur); } else if (cur) cur.body.push(l); }
  return secs.map(x => { const txt = x.body.find(l => l.trim() && !/^[|#>-]/.test(l)) || ''; return { title: x.title, html: md(x.body.join('\n')), lead: txt.replace(/\*\*|_/g, '').slice(0, 70) }; });
}
const GD_C = ['#e7c26a', '#6fcbef', '#9bd68f', '#e0853a', '#b9a6e6', '#4ea4f0', '#e8474c'];
function openGuide(sec = null) {
  openWin('guide', renderGuide, { tall: true, sel: sec });
  if (!guideSecs) fetch('guide/rehber.md', { cache: 'no-cache' }).then(x => x.text()).then(t => { guideSecs = parseGuide(t); if (win && win.id === 'guide') drawWin(true); })
    .catch(() => { guideSecs = []; if (win && win.id === 'guide') drawWin(true); });
}
function renderGuide(w) {
  const h = head('book', 'Rehber', guideSecs ? `${guideSecs.length} bölüm · sistemler ve sayılar` : 'Derinsu\'nun sistemleri ve sayıları');
  if (!guideSecs) return h + '<div class="sh-body"><div class="gd-load"><i></i><span>Rehber açılıyor</span></div></div>';
  if (!guideSecs.length) return h + '<div class="sh-body"><p class="gd-load">Rehber yüklenemedi. Bağlantını kontrol edip yeniden aç.</p></div>';
  const i = w.sel === null || w.sel === undefined ? null : +w.sel;
  if (i === null) return h + `<div class="sh-body"><div class="gd-grid">${guideSecs.map((x, k) => `<button class="gd-card" data-act="gd:sec:${k}" style="--sc:${GD_C[k % GD_C.length]};--i:${k}"><small class="num">${String(k + 1).padStart(2, '0')}</small><b>${esc(x.title)}</b><span>${esc(x.lead)}</span></button>`).join('')}</div></div>`;
  const x = guideSecs[i], n = guideSecs.length;
  return h + `<div class="sh-body"><div class="gd-top"><button class="gd-back" data-act="gd:list">${icon('chev')}<span>Bölümler</span></button><span class="gd-pn num">${i + 1} / ${n}</span></div>
      <h3 class="gd-title" style="--sc:${GD_C[i % GD_C.length]}">${esc(x.title)}</h3><div class="guide gd-md">${x.html}</div></div>
    <footer class="gd-foot"><button class="btn ghost" data-act="gd:step:-1" ${i ? '' : 'disabled'}>${icon('chev')}Önceki</button><button class="btn primary" data-act="gd:step:1" ${i < n - 1 ? '' : 'disabled'}>Sonraki${icon('chev')}</button></footer>`;
}
function guideAct(a, x) {
  if (!win || win.id !== 'guide') return;
  if (a === 'sec') win.sel = +x; else if (a === 'list') win.sel = null; else if (a === 'step') win.sel = clamp(+win.sel + +x, 0, guideSecs.length - 1);
  drawWin(true); const b = sheetIn.querySelector('.sh-body'); if (b) b.scrollTop = 0;
}

/* ---- Ayarlar ve geliştirici ---- */
function openSettings() {
  openWin('ayar', () => head('wrench', 'Ayarlar', 'Kayıt bu cihazda durur')
    + `<div class="sh-body"><label class="in-name"><small>Balıkçı adı</small><input id="renameIn" maxlength="14" value="${esc(S.name)}"></label>
      <button class="btn wide" data-act="rename">Adı kaydet</button>
      <button class="btn ghost wide" data-act="dev:toggle">${S.dev ? 'Geliştirici düğmesini gizle' : 'Geliştirici düğmesini göster'}</button>
      <button class="btn danger wide" data-act="reset">${icon('reset')}Kaydı sıfırla</button></div>`, {});
}
function openDev() {
  openWin('dev', () => head('wrench', 'Geliştirici', 'Deneme araçları')
    + `<div class="sh-body"><div class="kvs"><span><small>Hız çarpanı</small><b>×${S.devSpd}</b></span><span><small>Sürü</small><b>${S.devShoal === null || S.devShoal === undefined ? 'doğal' : SHOALS[S.devShoal].name}</b></span><span><small>Seviye</small><b>${S.lvl}</b></span></div>
      <button class="btn wide" data-act="dev:silver">+50.000 gümüş</button><button class="btn wide" data-act="dev:pearl">+50 inci</button>
      <button class="btn wide" data-act="dev:spd">Hız ×1 / ×5 / ×20</button><button class="btn wide" data-act="dev:shoal">Sürüyü değiştir</button><button class="btn wide" data-act="dev:dn">Gündüz / Gece / Doğal</button>
      <button class="btn wide" data-act="dev:chest">Sandık ver</button><button class="btn wide" data-act="dev:away">Sen yokken: 1 saat</button></div>`, {});
}
function devAct(x) {
  if (x === 'toggle') { S.dev = !S.dev; $('#devBtn').classList.toggle('on', S.dev); return; }
  if (x === 'silver') S.silver += 50000;
  if (x === 'pearl') S.pearl += 50;
  if (x === 'dn') S.devDn = S.devDn === 0 ? 1 : S.devDn === 1 ? null : 0;
  if (x === 'spd') S.devSpd = S.devSpd === 1 ? 5 : S.devSpd === 5 ? 20 : 1;
  if (x === 'shoal') S.devShoal = S.devShoal === null || S.devShoal === undefined ? 3 : S.devShoal === 3 ? 0 : S.devShoal + 1 > 3 ? null : S.devShoal + 1;
  if (x === 'chest') S.box['sandik' + S.rod.t] = (S.box['sandik' + S.rod.t] || 0) + 1;
  if (x === 'away') { if (S.fishing) S.fishing.t0 -= 3600e3; for (const w of WORKSHOPS) for (const o of S.ws[w.id].jobs) if (o.t0) o.t0 -= 3600e3; catchUp(Date.now(), 3600); }
}
$('#devBtn').addEventListener('click', openDev);

const OPEN = { tersane: () => openTersane(), ambar: () => openHold(), hal: openHal, usta: () => rodCardAt(null), ticaret: () => openTrade(), isleme: () => openHall('p'), zanaat: () => openHall('g'), inv: () => openInv('box'), dex: () => openDex(), quests: openQuests, fener: openFener, demirci: () => openSmith(), rehber: () => openGuide(), ayar: openSettings, sea: () => { closeWin(); closeMenu(); showView(S.loc === 'sea' && S.sea ? 'sea' : S.loc === 'field' && S.field ? 'field' : 'world'); } };
document.addEventListener('click', e => {
  const t = e.target.closest('[data-open]'); if (!t || sheetIn.contains(t)) return;
  haptic(6); OPEN[t.dataset.open] && OPEN[t.dataset.open]();
});

/* ---- Ana menü ---- */
const menuLayer = $('#menuLayer');
function openMenu() {
  closeNav(); if (win) closeWin();
  const need = xpNeed(S.lvl), best = S.st.best;
  $('#mwMain').innerHTML = `<header class="mw-title"><h2>Menü</h2><i></i></header>
    <section class="mw-prof"><span class="mp-av"><img src="assets/ui/prof_fish-256.png" alt=""><span class="lvl num">${S.lvl}</span></span>
      <span class="mp-t"><b>${esc(S.name || 'Balıkçı')}</b><small>Balıkçılık · Sv ${S.lvl} · ${fmt(S.xp)} / ${fmt(need)}</small><span class="mp-xp"><i style="width:${S.xp / need * 100}%"></i></span></span></section>
    <div class="mw-quick">
      <button class="mq" data-open="hal"><img src="assets/items/fish/fish-t2.png" alt="">Balık Hali</button>
      <button class="mq" data-open="ticaret"><img src="assets/ui/market-256.png" alt="">Ticaret Evi</button>
      <button class="mq" data-open="isleme"><img src="assets/ui/prof_fish-256.png" alt="">İşlemehane</button>
      <button class="mq" data-open="zanaat"><img src="assets/ui/anvil-256.png" alt="">Zanaathane</button>
      <button class="mq" data-open="inv"><img src="assets/ui/bag-256.png" alt="">Envanter</button>
      <button class="mq" data-open="dex"><img src="assets/ui/scroll-256.png" alt="">Defter</button>
      <button class="mq" data-open="quests"><img src="assets/ui/quests-256.png" alt="">Görevler</button>
      <button class="mq" data-open="fener"><svg class="mq-svg" viewBox="0 0 40 40">${CityArt.fenerIcon()}</svg>Gözcü Kulesi</button>
      <button class="mq" data-open="rehber"><img src="assets/ui/board-256.png" alt="">Rehber</button>
    </div>
    <div class="mw-sep"><i></i><b></b><i></i></div>
    <div class="mw-stats">
      <span><small>Toplam av</small><b>${fmt(S.st.catches)}</b></span><span><small>Mükemmel çekiş</small><b>${fmt(S.st.perfect)}</b></span>
      <span><small>Tutulan ağırlık</small><b>${fmtKg(S.st.kg)}</b></span><span><small>Hal kazancı</small><b>${fmt(S.st.earned)}</b></span>
      <span><small>En değerli av</small><b>${best ? `${FISH_BY[best.id].name} · ${fmtKg(best.kg)}` : '—'}</b></span><span><small>Açılan sandık</small><b>${fmt(S.st.chests)}</b></span>
    </div>`;
  menuLayer.classList.add('on'); menuLayer.setAttribute('aria-hidden', 'false');
}
function closeMenu() { menuLayer.classList.remove('on'); menuLayer.setAttribute('aria-hidden', 'true'); }
$('#mwClose').addEventListener('click', closeMenu);
$('#menuBg').addEventListener('click', closeMenu);

/* ---- Dok gezintisi ---- */
const nav = $('#nav'), menuBtn = $('#menuBtn');
function closeNav() { nav.classList.remove('open'); menuBtn.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); }
menuBtn.addEventListener('click', e => { e.stopPropagation(); const on = !nav.classList.contains('open'); nav.classList.toggle('open', on); menuBtn.classList.toggle('open', on); menuBtn.setAttribute('aria-expanded', on); haptic(6); });
document.addEventListener('click', e => { if (nav.classList.contains('open') && !nav.contains(e.target)) closeNav(); });
nav.addEventListener('click', e => {
  const b = e.target.closest('[data-nav]'); if (!b) return;
  haptic(6); const k = b.dataset.nav; closeNav();
  if (k === 'home') { closeWin(); closeMenu(); showView('city'); }
  else if (k === 'inv') openHold();
  else if (k === 'quests') openQuests();
  else if (k === 'menu') openMenu();
});
$('#bookBtn').addEventListener('click', () => { haptic(6); openDex(seaSpot().t - 1); });

/* ---- Görünüm düğmeleri ---- */
$('#arBack').addEventListener('click', () => { haptic(6); showView(areasFrom === 'sea' && S.loc === 'sea' && S.sea ? 'sea' : 'world'); });
$('#svBack').addEventListener('click', () => { haptic(6); showView('city'); });      // limana bakmak avı durdurmaz
// dünya haritası ve toplama sahası
$('#worldMap').addEventListener('click', e => { const b = e.target.closest('[data-region]'); if (b) worldGo(b.dataset.region); });
$('#fdMap').addEventListener('click', () => { haptic(6); showView('world'); });
$('#fdTiers').addEventListener('click', () => { haptic(6); openTiers(S.field.prof); });
$('#fdTool').addEventListener('click', () => { haptic(6); openTiers(S.field.prof); });
$('#fdCity').addEventListener('click', () => { haptic(8); leaveField(); save(); showView('city'); });
$('#fdPull').addEventListener('pointerdown', e => { e.preventDefault(); fieldBoost(); });
$('#fdStop').addEventListener('click', () => { haptic(8); if (S.work) stopWork(); else { const j = bestNode(); if (j >= 0) startWork(j); } });
$('#fdBag').addEventListener('click', () => { haptic(6); openInv('box'); });
$('#fdInfo').addEventListener('click', () => { haptic(6); openInv('box'); });
$('#svPort').addEventListener('click', () => { haptic(8); goCity(); });
$('#svAreas').addEventListener('click', () => { haptic(6); showView('areas'); });
$('#arHere').addEventListener('click', () => { haptic(8); showView('sea'); });

/* ---- Av çubuğu ---- */
$('#pullBtn').addEventListener('pointerdown', e => { e.preventDefault(); pull(); });
$('#fbBag').addEventListener('click', () => openHold());
$('#fbStop').addEventListener('click', () => {
  haptic(8);
  if (S.fishing) { stopFishing(); toast('Olta toplandı', { sub: 'av durdu' }); return; }
  const j = S.sea ? bestSchool() : -1;
  if (j >= 0) { goSchool(j, Date.now(), true); renderAll(); } else toast('Yakında sürü yok', { tone: 'warn', sub: 'yenisi bekleniyor' });
});
$('#fbFood').addEventListener('click', () => {
  const fd = buff('food');
  if (fd) { toast(`${fd.name}`, { label: 'Yemek', sub: `${fmtDur((fd.until - Date.now()) / 1000)} kaldı` }); return; }
  const best = [5, 4, 3, 2, 1].map(t => 'yemek' + t).find(id => S.box[id]);
  if (best) useItem(best); else openWs('ocak', false);
});
$('#fbInfo').addEventListener('click', () => { haptic(5); toggleDet(); });
$('#fight').addEventListener('pointerdown', e => { e.preventDefault(); fightTap(); });      // çarkın kendisine dokunmak da vuruştur
document.addEventListener('keydown', e => { if (e.code === 'Space' && view === 'sea') { e.preventDefault(); if (!e.repeat) pull(); } if (e.key === 'Escape') { closeWin(); closeMenu(); closeNav(); if (isl.det) toggleDet(false); } });

/* =========================================================
   DÖNGÜ
   ========================================================= */
function renderAll() {
  document.body.classList.toggle('night', isNight());
  renderHud(); renderBuffs();
  if (view === 'city') renderCity(); else if (view === 'world') renderWorld(); else if (view === 'field') renderField(); else if (view === 'areas') renderAreas(); else if (view === 'sea') renderSea();
  if (isl.det) { renderDet(); syncIsland(); }
}
let lastSlow = 0, lastAll = 0, lastSave = Date.now();
// açık pencere yalnız ilgili durum değişince yeniden çizilir (dokunuş ortasında düğme kaybolmasın)
const WIN_SIG = () => [S.silver, S.pearl, PROF_IDS.map(p => S.tools[p].t).join(''), holdSig(), Object.keys(S.ships).join(), S.boat, S.rod.t, S.rod.dur, S.rods.length, JSON.stringify(S.box), wsSig(), S.quests ? S.quests.list.map(q => q.prog).join(',') : '', S.dev, S.devSpd, S.devShoal].join('|');
let winSig = '';
function refreshWin() {
  if (!win || ['away', 'guide', 'ayar', 'te'].includes(win.id) || (win.id === 'ws' && win.pane === 'forge') || holdDrag) return;
  const sig = WIN_SIG(); if (sig === winSig) return;
  winSig = sig; drawWin(false);
}
function loop() {
  requestAnimationFrame(loop);
  const t = Date.now();
  // kısa boşluklar canlı geçer; uzun boşluk (sekme arkada kaldı) özetle gelir
  if (S.fishing && !S.fishing.full && !S.fishing.broken && !S.fishing.sail && !S.fishing.wait && t - S.fishing.t0 - S.fishing.dur > 20000) { catchUp(t, (t - S.fishing.t0) / 1000); }
  else advance(t, true);
  advanceWork(t, true);
  if (view === 'field') renderFieldMarks();
  // av ekranı: sahne ve Çek düğmesi
  const [ph, p] = phaseOf(S.fishing, t);
  if (seaView && view === 'sea') { const l = lineXY(); seaView.setLine(l && ph !== 'idle' ? { ...l, phase: ph === 'fight' ? 'bite' : ph, p } : l ? { ...l, phase: 'wait', p: 1 } : null); }
  const pb = $('#pullBtn');
  pb.classList.toggle('bite', ph === 'bite'); pb.classList.toggle('mg-on', ph === 'fight'); pb.classList.toggle('idle', !S.fishing || !!S.fishing.full || !!S.fishing.broken);
  $('#pullRing').style.strokeDashoffset = 226.2 * (1 - (ph === 'idle' ? 0 : p));
  $('#pullTxt').textContent = fight ? 'Vur!' : !S.fishing ? 'Sürü' : S.fishing.broken ? 'Kırık' : S.fishing.full ? 'Dolu' : S.fishing.sail ? 'Yelken' : S.fishing.wait ? 'Bekle' : ph === 'bite' ? 'Çek!' : S.fishing.jig ? 'Geliyor' : 'Oynat';
  const tip = fight ? '' : !S.fishing ? 'Bir balık sürüsüne dokun' : ph === 'bite' && S.st.catches < 40 ? 'Çek\'e bas: çarkla kendin yakala' : (ph === 'wait' || ph === 'cast') && !S.fishing.jig && S.st.catches < 40 ? 'Çek\'e bas: yemi oynat, balık çabuk gelir' : '';
  $('#fvTip').classList.toggle('on', !!tip && view === 'sea'); if (tip) $('#fvTip').textContent = tip;
  if (view === 'sea') renderSchools();
  if (t - lastSlow > 250) { lastSlow = t; renderAct(t); wsTick(); }
  if (t - lastAll > 1000) { lastAll = t; ensureQuests(); dnCheck(t); renderAll(); refreshWin(); }
  if (t - lastSave > 5000) { lastSave = t; save(); }
}
// gece-gündüz dönünce: denizdeysen hangi türlerin çıktığını haber ver
let lastNight = isNight();
function dnCheck(t) {
  const n = isNight(t); if (n === lastNight) return;
  lastNight = n; if (!S.sea) return;
  const sp = seaSpot(), only = spotFish(sp.id).filter(f => (n ? f.night : f.day) > 0 && !(n ? f.day : f.night)), legs = legFish(sp.id).filter(f => legOk(f, t));
  const more = spotFish(sp.id).filter(f => (n ? f.night - f.day : f.day - f.night) >= 10);
  const list = [...only, ...more.filter(f => !only.includes(f))].slice(0, 3).map(f => S.dex[f.id] ? f.name : '???');
  toast(n ? 'Gece çöktü' : 'Gün doğdu', { label: n ? 'Gece türleri' : 'Gündüz türleri', sub: (list.length ? list.join(', ') + ' artık daha sık' : 'türlerin payı değişti') + (legs.length ? ' · efsanevi iz var!' : '') });
}
function catchUp(now, sec) {
  if (S.fishing && now - S.fishing.t0 > MAX_OFFLINE * 1000) S.fishing.t0 = now - MAX_OFFLINE * 1000;
  for (const w of WORKSHOPS) for (const o of S.ws[w.id].jobs) if (o.t0 && now - o.t0 > MAX_OFFLINE * 1000) o.t0 = now - MAX_OFFLINE * 1000;
  const rep = { n: 0, kg: 0, fish: {}, items: {}, pearl: 0, boat: 0 };
  const silver0 = S.silver;
  offRun = true;
  if (S.fishing && !S.fishing.sail && !S.fishing.wait && !S.fishing.full && !S.fishing.broken) S.fishing.dur /= OFFLINE_EFF;
  try { advance(now, false, rep); } finally { offRun = false; }
  if (rep.n || Object.keys(rep.items).length) { openAway(rep, Math.min(sec, MAX_OFFLINE)); }
  if (S.silver !== silver0) bumpCur('#curSilver');
  save(); renderAll();
}
document.addEventListener('visibilitychange', () => { if (document.hidden) save(); });
window.addEventListener('pagehide', save);

/* ---------- Başlangıç ---------- */
function boot() {
  ensureQuests(); ensureWorld();
  S.buffs = S.buffs.filter(b => b.until > Date.now());
  // kayıt açılırken yoldaki tekne varmış sayılır; denizde değilse av yok
  if (S.fishing && (!S.sea || S.loc !== 'sea')) S.fishing = null;
  if (S.fishing && S.fishing.sail) arriveSchool(S.fishing.t0);
  $('#devBtn').classList.toggle('on', !!S.dev);
  showView(S.started && S.loc === 'sea' && S.sea ? 'sea' : S.started && S.loc === 'field' && S.field ? 'field' : 'city');      // neredeysen orası: deniz, toplama sahası ya da şehir
  renderAll();
  // sen yokken
  const away = (Date.now() - (S.last || Date.now())) / 1000;
  if (S.started && S.work && away > 30) awayWork(Date.now(), away);
  if (S.started && (S.fishing || wsBusy()) && away > 30) catchUp(Date.now(), away);
  else advance(Date.now(), false, { n: 0, kg: 0, fish: {}, items: {}, pearl: 0 });
  if (!S.started) {
    const intro = $('#intro'); intro.classList.add('on'); intro.setAttribute('aria-hidden', 'false');
    requestAnimationFrame(() => FishScene.thumb($('#introCv'), SPOTS[0]));
    $('#introGo').addEventListener('click', () => {
      S.name = ($('#introName').value || '').trim().slice(0, 14) || 'Balıkçı';
      S.started = true; intro.classList.remove('on'); intro.setAttribute('aria-hidden', 'true');
      S.loc = 'city'; showView('city'); save(); renderAll();
      setTimeout(() => toast(`Hoş geldin, ${esc(S.name)}`, { label: 'Derinsu Limanı', sub: 'Büyük İskele\'den denizlere açıl' }), 500);
    }, { once: true });
  }
  requestAnimationFrame(loop);
}
boot();
