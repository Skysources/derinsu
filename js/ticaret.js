/* =========================================================
   DERİNSU — Ticaret Evi
   Astralis Ticaret Evi penceresi: Pazar (arama, Kademe / Nadirlik / Tür / Sırala seçmeleri, "En ucuz satış · En iyi alış"
   tablosu ↔ eşya ayrıntısı: emir defteri, Hemen Al / Hemen Sat / Satış Emri / Alım Emri), Emirlerim, Teslimat, Geçmiş.
   Derinsu'da sunucu yok: defterin karşı tarafı limanın tüccarlarıdır. Defter her gün (eşya ve nadirlik tohumundan)
   yeniden kurulur; hemen alınan ve satılan adetler o günün defterinden düşer. Emirler zamanla dolar (fiyat ortalamaya ne
   kadar yakınsa o kadar hızlı), sen yokken de; dolanlar Teslimat'a düşer. Oltalar yalnız burada alınır.
   ========================================================= */
'use strict';
const MK_TAX = .05, MK_FEE = .015;
const MK_CATS = [['Tüm Eşyalar', 'all', null], ['Oltalar', 'olta', 'rod/rod-t3'], ['Malzemeler', 'mat', null], ['İşlenmiş', 'isl', 'fillet/fillet-t2'], ['Yemek ve Yem', 'yem', 'balikci/balikci-t2'], ['Bakım', 'bakim', 'extract/extract-t3'], ['Buluntular', 'bul', 'pirateChest/pirateChest-t2']];
const isRod = id => /^olta\d$/.test(id);
const mkCat = id => isRod(id) ? 'olta' : ITEMS[id] && ITEMS[id].mat ? 'mat' : /^(fileto|yag)\d/.test(id) ? 'isl' : /^(yemek|yem)\d/.test(id) ? 'yem' : /^cila\d/.test(id) ? 'bakim' : 'bul';
const MK_IDS = [1, 2, 3, 4, 5].map(t => 'olta' + t).concat(Object.keys(ITEMS));
const mkT = id => isRod(id) ? +id.slice(4) : ITEMS[id].t;
const mkName = id => isRod(id) ? RODS[mkT(id)].name : ITEMS[id].name;
const mkQs = id => isRod(id) ? [0, 1, 2, 3] : [ITEMS[id].q];
const mkKey = (id, q) => id + ':' + q;
const ROD_QV = [1, 1.7, 3.2, 7];
const mkHash = s => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 99991, 7);
function mkRef(id, q) {
  if (isRod(id)) { const r = RODS[mkT(id)]; return Math.round(Math.max(300, r.cost + r.pearl * 450) * ROD_QV[q]); }
  return Math.max(5, itemVal(id));
}
const mkFrame = (id, q, cls = '', n = 0) => isRod(id) ? frame({ tier: mkT(id), rarity: QUAL[q].r, icon: rodImg(mkT(id)), n }, cls) : itemFrame(ITEMS[id], n, cls);
const mkHave = (id, q) => isRod(id) ? S.rods.filter(r => r.t === mkT(id) && r.q === q).length : S.box[id] || 0;
const mkDesc = id => isRod(id) ? `Hız +%${RODS[mkT(id)].spd} · şans +%${RODS[mkT(id)].luck} · ${fmt(ROD_DUR[mkT(id)])} dayanıklılık (nadirlikle büyür).`
  : ITEMS[id].mat ? `${MATS[id].use}. Kaynak: ${MATS[id].src}.` : ITEMS[id].food ? 'Yenince hız ve şans verir.' : ITEMS[id].bait ? 'Atınca şans ve deneyim verir.' : ITEMS[id].cila ? 'Oltaya dayanıklılık verir.' : ITEMS[id].chest ? 'İçinden gümüş ve inci çıkar.' : 'Atölyelerde ya da Hal\'de değerlidir.';
function mkState() {
  const d = evDay();
  if (!S.mk) S.mk = { day: d, used: {}, orders: [], dl: [], hist: [] };
  if (S.mk.day !== d) { S.mk.day = d; S.mk.used = {}; }
  return S.mk;
}
// günün tüccar defteri: beş satış ve beş alış basamağı; o gün kullanılan adet düşülür
function mkBook(id, q) {
  const ref = mkRef(id, q), r = rng(evDay() * 7919 + mkHash(id) * 31 + q * 101), base = isRod(id) ? 1 : clamp(Math.round(1500 / ref), 1, 30);
  const u = mkState().used[mkKey(id, q)] || { s: [], b: [] }, sells = [], buys = [];
  for (let k = 0; k < 5; k++) {
    const sp = Math.max(1, Math.round(ref * (1.03 + k * .05 + r() * .03))), sq = Math.ceil(base * (.5 + r() * 1.5)), sn = 1 + Math.floor(r() * 3);
    const bp = Math.max(1, Math.round(ref * (.94 - k * .05 - r() * .03))), bq = Math.ceil(base * (.5 + r() * 1.5)), bn = 1 + Math.floor(r() * 3);
    if (sq - (u.s[k] || 0) > 0) sells.push({ k, price: sp, qty: sq - (u.s[k] || 0), n: sn });
    if (bq - (u.b[k] || 0) > 0) buys.push({ k, price: bp, qty: bq - (u.b[k] || 0), n: bn });
  }
  return { sells, buys, ref, base, vol: Math.round(base * (14 + r() * 30)) };
}
const mkUse = (id, q, sd, k, n) => { const U = mkState().used, u = U[mkKey(id, q)] || (U[mkKey(id, q)] = { s: [], b: [] }); u[sd][k] = (u[sd][k] || 0) + n; };
function mkLog(h) { const m = mkState(); m.hist.unshift({ ...h, ts: Date.now() }); m.hist.length = Math.min(m.hist.length, 40); }
function mkGive(id, q, n) {
  if (isRod(id)) for (let i = 0; i < n; i++) S.rods.push({ t: mkT(id), q, dur: Math.round(ROD_DUR[mkT(id)] * GEAR_Q[q]) });
  else S.box[id] = (S.box[id] || 0) + n;
}
function mkTake(id, q, n) {
  if (isRod(id)) { for (let i = 0; i < n; i++) { const k = S.rods.findIndex(r => r.t === mkT(id) && r.q === q); if (k >= 0) S.rods.splice(k, 1); } }
  else take(id, n);
}
// hemen al / sat: defterin en iyi basamaklarından doldurur
function mkInstant(id, q, side, qty, dry) {
  const b = mkBook(id, q), lv = side === 'buy' ? b.sells : b.buys;
  let need = qty, cost = 0, top = 0; const fills = [];
  for (const l of lv) { if (need <= 0) break; const t = Math.min(need, l.qty); need -= t; cost += t * l.price; top = l.price; fills.push([l.k, t]); }
  const fill = qty - need;
  if (dry) return { fill, cost, top };
  if (!fill) return null;
  if (side === 'buy') { if (S.silver < cost) return null; S.silver -= cost; mkGive(id, q, fill); }
  else { if (mkHave(id, q) < fill) return null; const got = cost - Math.floor(cost * MK_TAX); mkTake(id, q, fill); S.silver += got; S.st.earned += got; questHook('sell', got); }
  for (const [k, t] of fills) mkUse(id, q, side === 'buy' ? 's' : 'b', k, t);
  mkLog({ id, q, side, qty: fill, price: Math.round(cost / fill) });
  return { fill, cost };
}
function mkOrder(id, q, side, price, qty) {
  const fee = Math.ceil(price * qty * MK_FEE);
  if (side === 'sell') { if (mkHave(id, q) < qty || S.silver < fee) return false; mkTake(id, q, qty); S.silver -= fee; }
  else { if (S.silver < price * qty + fee) return false; S.silver -= price * qty + fee; }
  mkState().orders.push({ oid: Math.random().toString(36).slice(2, 8), id, q, side, price, qty, left: qty, created: Date.now(), last: Date.now(), acc: 0 });
  return true;
}
function mkCancel(oid) {
  const m = mkState(), i = m.orders.findIndex(o => o.oid === oid); if (i < 0) return;
  const o = m.orders[i];
  if (o.side === 'sell') mkGive(o.id, o.q, o.left); else S.silver += o.price * o.left;
  m.orders.splice(i, 1);
}
// emirler zamanla dolar: satışta fiyat ortalamanın altına indikçe, alışta üstüne çıktıkça hızlanır
function mkTick(now, live) {
  const m = mkState(); let n0 = m.dl.length;
  for (const o of m.orders) {
    const dt = clamp((now - o.last) / 3600e3, 0, MAX_OFFLINE / 3600); o.last = now;
    if (dt <= 0) continue;
    const ref = mkRef(o.id, o.q), base = isRod(o.id) ? 1 : clamp(Math.round(1500 / ref), 1, 30);
    const a = o.side === 'sell' ? clamp((ref * 1.35 - o.price) / (ref * .45), 0, 1.3) : clamp((o.price - ref * .65) / (ref * .45), 0, 1.3);
    o.acc += a * base * 1.2 * dt;
    const n = Math.min(o.left, Math.floor(o.acc)); if (!n) continue;
    o.acc -= n; o.left -= n;
    if (o.side === 'sell') m.dl.push({ credits: Math.floor(o.price * n * (1 - MK_TAX)), id: o.id, q: o.q, qty: n, note: 'sold', ts: now });
    else m.dl.push({ id: o.id, q: o.q, qty: n, note: 'bought', ts: now });
    mkLog({ id: o.id, q: o.q, side: o.side, qty: n, price: o.price });
  }
  m.orders = m.orders.filter(o => o.left > 0);
  if (live && m.dl.length > n0 && !quiet()) toast(`Ticaret Evi · ${m.dl.length} teslimat hazır`, { label: 'Emir doldu' });
}
function mkClaim() {
  const m = mkState(); let cr = 0, it = 0;
  for (const x of m.dl) { if (x.credits) { S.silver += x.credits; S.st.earned += x.credits; questHook('sell', x.credits); cr += x.credits; } else { mkGive(x.id, x.q, x.qty); it += x.qty; } }
  m.dl = []; return [cr, it];
}

/* ---------- Pencere ---------- */
function openTrade(open = null) {
  mkState();
  openWin('te', renderTe, { tall: true, tab: 0, view: open ? 'det' : 'list', cat: open ? mkCat(open.id) : 'all', tier: 0, rq: -1, sort: 0, search: '', dd: null,
    item: open ? open.id : null, iq: open ? open.q : 0, mode: 0, qty: 1, price: 0, after: bindTe });
}
const TE_SORTS = ['Varsayılan', 'En ucuz satış', 'En iyi alış', 'Ada göre'];
const tePx = (v, cls) => v ? `<span class="te-px ${cls}"><b class="num">${fmt(v)}</b>${coin}</span>` : `<span class="te-px none">—</span>`;
function teRows(w) {
  const out = [];
  for (const id of MK_IDS) {
    if (w.cat !== 'all' && mkCat(id) !== w.cat) continue;
    if (w.search) { if (!mkName(id).toLocaleLowerCase('tr').includes(w.search)) continue; }
    else if (w.tier && mkT(id) && mkT(id) !== w.tier) continue;
    for (const q of mkQs(id)) { if (w.rq >= 0 && q !== w.rq) continue; out.push([id, q]); }
  }
  const pr = (r, k) => { const b = mkBook(r[0], r[1]); return k === 's' ? (b.sells[0] || {}).price : (b.buys[0] || {}).price; };
  if (w.sort === 1) out.sort((a, b) => (pr(a, 's') || 1e15) - (pr(b, 's') || 1e15));
  if (w.sort === 2) out.sort((a, b) => (pr(b, 'b') || 0) - (pr(a, 'b') || 0));
  if (w.sort === 3) out.sort((a, b) => mkName(a[0]).localeCompare(mkName(b[0]), 'tr') || a[1] - b[1]);
  return out;
}
function teRow([id, q]) {
  const b = mkBook(id, q), c = MK_CATS.find(m => m[1] === mkCat(id))[0];
  return `<button class="te-row" data-act="te:item:${id}:${q}">${mkFrame(id, q, 'te-ic')}
    <span class="te-nm"><b style="${q ? `color:${QUAL[q].c}` : ''}">${mkName(id)}</b><small>${isRod(id) ? `<i style="color:${QUAL[q].c}">${QUAL[q].name}</i> · ` : ''}${c}${mkT(id) ? ` · K-${rom(mkT(id))}` : ''}</small></span>
    ${tePx((b.sells[0] || {}).price, 'sell')}${tePx((b.buys[0] || {}).price, 'buy')}</button>`;
}
function teDds(w) {
  const L = [
    { k: 'tier', n: 'Kademe', v: w.tier ? `${rom(w.tier)}. kademe` : 'Hepsi', cur: w.tier, opts: [[0, 'Hepsi'], ...[1, 2, 3, 4, 5].map(t => [t, `${rom(t)}. kademe`])] },
    { k: 'rq', n: 'Nadirlik', v: w.rq < 0 ? 'Hepsi' : QUAL[w.rq].name, c: w.rq < 0 ? null : QUAL[w.rq].c, cur: w.rq, opts: [[-1, 'Hepsi'], ...QUAL.map((x, i) => [i, x.name, x.c])] },
    { k: 'cat', n: 'Tür', v: MK_CATS.find(m => m[1] === w.cat)[0], cur: w.cat, opts: MK_CATS.map(([n, c, a]) => [c, n, null, a]) },
  ];
  return `<div class="te-dds">${L.map(d => `<div class="te-dd ${w.dd === d.k ? 'open' : ''}">
      <button class="te-ddb" data-act="te:dd:${d.k}"><small>${d.n}</small><b ${d.c ? `style="color:${d.c}"` : ''}>${d.v}</b>${icon('chev')}</button>
      ${w.dd === d.k ? `<div class="te-ddm">${d.opts.map(([v, n, c, a]) => `<button class="${String(v) === String(d.cur) ? 'on' : ''}" data-act="te:set:${d.k}:${v}">${a ? `<img src="assets/items/${a}.png" alt="">` : ''}${c ? `<i style="--c:${c}"></i>` : ''}<span>${n}</span></button>`).join('')}</div>` : ''}
    </div>`).join('')}</div>`;
}
const TE_MODES = [['Hemen Al', 'buy', 0], ['Hemen Sat', 'sell', 0], ['Satış Emri', 'sell', 1], ['Alım Emri', 'buy', 1]];
function teDet(w) {
  const id = w.item, q = w.iq, b = mkBook(id, q), [mn, sd, ord] = TE_MODES[w.mode];
  if (!w.price) w.price = sd === 'buy' ? (b.buys[0] ? b.buys[0].price + 1 : Math.round(b.ref * .95)) : (b.sells[0] ? Math.max(1, b.sells[0].price - 1) : Math.round(b.ref * 1.05));
  const mine = (s, p) => mkState().orders.some(o => o.id === id && o.q === q && o.side === s && o.price === p);
  const col = (rows, s) => rows.length ? rows.slice(0, 5).map(r => `<button class="te-bk" data-act="te:px:${s}:${r.price}"><b class="num">${fmt(r.price)}</b>${coin}<span class="num">× ${fmt(r.qty)}</span><em>${r.n > 1 ? r.n + ' emir' : 'Tacir'}</em></button>`).join('') : '<p class="note">Emir yok</p>';
  const myRows = s => mkState().orders.filter(o => o.id === id && o.q === q && o.side === s).map(o => `<div class="te-bk"><b class="num">${fmt(o.price)}</b>${coin}<span class="num">× ${fmt(o.left)}</span><em class="me">Senin</em></div>`).join('');
  const qtabs = isRod(id) ? `<div class="te-qt">${QUAL.slice(0, 4).map((x, k) => { const y = mkBook(id, k); return `<button class="${k === q ? 'on' : ''}" data-act="te:q:${k}" style="--c:${x.c}"><b>${x.name}</b><span class="num">~${fmt((y.sells[0] || {}).price || y.ref)}${coin}</span>${mkHave(id, k) ? `<small class="num">${mkHave(id, k)}</small>` : ''}</button>`; }).join('')}</div>` : '';
  const ins = mkInstant(id, q, sd, w.qty, true);
  const v = ord ? { total: w.price * w.qty, fee: Math.ceil(w.price * w.qty * MK_FEE) } : { total: ins.cost, fill: ins.fill };
  const tax = sd === 'sell' ? Math.floor(v.total * MK_TAX) : 0, last = mkState().hist.find(h => h.id === id && h.q === q);
  const sum = ord
    ? `<div><span>Emir değeri</span><b class="num">${fmt(v.total)}</b></div><div><span>Kurulum ücreti %${fmtDec(MK_FEE * 100, 1)}</span><b class="num">−${fmt(v.fee)}</b></div>
       ${sd === 'sell' ? `<div><span>Satış vergisi %${MK_TAX * 100}</span><b class="num">−${fmt(tax)}</b></div>` : ''}
       <div class="tot"><span>${sd === 'sell' ? 'Hepsi satılınca eline' : 'Emanete konacak'}</span><b class="num">${fmt(sd === 'sell' ? v.total - tax - v.fee : v.total + v.fee)}${coin}</b></div>`
    : `<div><span>${sd === 'buy' ? 'Alınacak' : 'Satılacak'}</span><b class="num">${fmt(v.fill)}${v.fill < w.qty ? ` <em>(defterde ${fmt(v.fill)})</em>` : ''}</b></div>
       <div><span>Ortalama birim</span><b class="num">${v.fill ? fmt(Math.round(v.total / v.fill)) : '—'}</b></div>
       ${sd === 'sell' ? `<div><span>Satış vergisi %${MK_TAX * 100}</span><b class="num">−${fmt(tax)}</b></div>` : ''}
       <div class="tot"><span>Toplam</span><b class="num">${fmt(sd === 'buy' ? v.total : v.total - tax)}${coin}</b></div>`;
  const label = mn === 'Hemen Al' ? 'Satın al' : mn === 'Hemen Sat' ? 'Sat' : mn;
  return `<div class="te-card"><div class="te-ihd">${mkFrame(id, q, 'te-big')}<span><b style="${q ? `color:${QUAL[q].c}` : ''}">${mkName(id)}</b>
        <small>${MK_CATS.find(m => m[1] === mkCat(id))[0]} · <i style="color:${QUAL[q].c}">${QUAL[q].name}</i>${mkT(id) ? ` · K-${rom(mkT(id))}` : ''}</small><p>${mkDesc(id)}</p></span></div>
      ${qtabs}
      <div class="te-kv"><span><small>Liman ort.</small><b class="num">~${fmt(b.ref)}${coin}</b></span><span><small>Son işlem</small><b class="num">${last ? fmt(last.price) + coin : '—'}</b></span>
        <span><small>24s hacim</small><b class="num">${fmt(b.vol)}</b></span><span><small>${isRod(id) ? 'Yedekte' : 'Envanterde'}</small><b class="num">${fmt(mkHave(id, q))}</b></span></div>
      <div class="te-bh"><b>Emir defteri</b><small>dokun: o fiyattan işlem</small></div>
      <div class="te-book"><div><div class="te-bt sell">Satış emirleri<small>${b.sells.reduce((a, r) => a + r.n, 0)} emir</small></div>${myRows('sell')}${col(b.sells, 'sell')}</div>
        <div><div class="te-bt buy">Alım emirleri<small>${b.buys.reduce((a, r) => a + r.n, 0)} emir</small></div>${myRows('buy')}${col(b.buys, 'buy')}</div></div>
    </div>
    <div class="te-form">
      <div class="te-modes">${TE_MODES.map(([n, s], i) => `<button class="${i === w.mode ? 'on ' + s : ''}" data-act="te:mode:${i}">${n}</button>`).join('')}</div>
      <div class="te-ins"><div class="te-in"><small>Adet</small><span class="te-stp"><button data-act="te:step:q:-1">−</button><input id="teQty" inputmode="numeric" value="${w.qty}"><button data-act="te:step:q:1">+</button><button class="te-mx" data-act="te:max">Maks</button></span></div>
        ${ord ? `<div class="te-in"><small>Birim fiyat</small><span class="te-stp"><button data-act="te:step:p:-1">−</button><input id="tePrice" inputmode="numeric" value="${w.price}"><button data-act="te:step:p:1">+</button></span></div>` : ''}</div>
      ${ord ? `<div class="te-hints">${b.sells[0] ? `<button data-act="te:setp:${b.sells[0].price}">En ucuz satış <b class="num">${fmt(b.sells[0].price)}</b></button>` : ''}<button data-act="te:setp:${b.ref}">Ortalama <b class="num">${fmt(b.ref)}</b></button>${b.buys[0] ? `<button data-act="te:setp:${b.buys[0].price}">En iyi alış <b class="num">${fmt(b.buys[0].price)}</b></button>` : ''}</div>` : ''}
      <div class="te-sum">${sum}</div>
      <div class="te-go"><small>Kesende <b class="num">${fmt(S.silver)}</b>${coin}</small><button class="te-act ${sd}" data-act="te:submit">${label}</button></div>
    </div>`;
}
function teOrders() {
  const L = mkState().orders;
  return `<div class="te-table"><div class="te-th o"><span>Eşya</span><span>Tür</span><span>Fiyat</span></div>
    <div class="te-list">${L.length ? L.map(o => `<div class="te-row o">${mkFrame(o.id, o.q, 'te-ic')}
      <span class="te-nm"><b>${mkName(o.id)}</b><small>${fmtAgo(o.created)} · ${fmt(o.qty - o.left)}/${fmt(o.qty)}</small></span>
      <span class="te-side ${o.side}">${o.side === 'buy' ? 'Alım' : 'Satış'}</span><span class="te-px"><b class="num">${fmt(o.price)}</b>${coin}</span>
      <button class="te-x" data-act="te:cancel:${o.oid}" aria-label="İptal">${icon('close')}</button></div>`).join('') : '<p class="note te-note">Açık emrin yok.</p>'}</div></div>
    <p class="note">Emirler sen yokken de dolar. Satılanların gümüşü ve alınan eşyalar Teslimat'a düşer. İptal edersen kalanı geri gelir, kurulum ücreti dönmez.</p>`;
}
function teDeliv() {
  const dl = mkState().dl, cr = dl.reduce((a, x) => a + (x.credits || 0), 0);
  return `<div class="te-dl"><span><small>Bekleyen</small><b class="num">${dl.length}</b></span><span><small>Gümüş</small><b class="num">${fmt(cr)}</b>${coin}</span><button class="te-act buy" data-act="te:claim" ${dl.length ? '' : 'disabled'}>Tümünü al</button></div>
    <div class="te-table"><div class="te-list">${dl.length ? dl.map(x => `<div class="te-row d">${x.credits ? `<span class="te-ic te-coin">${coin}</span>` : mkFrame(x.id, x.q, 'te-ic', x.qty > 1 ? x.qty : 0)}<span class="te-nm"><b>${x.credits ? `+${fmt(x.credits)} gümüş` : `${fmt(x.qty)} × ${mkName(x.id)}`}</b><small>${x.note === 'sold' ? `Satış emrin doldu · ${fmt(x.qty)} × ${mkName(x.id)}` : 'Alım emrin doldu'} · ${fmtAgo(x.ts)}</small></span></div>`).join('') : '<p class="note te-note">Teslimat yok.</p>'}</div></div>`;
}
function teHist() {
  const H = mkState().hist;
  return `<div class="te-table"><div class="te-th h"><span>Zaman</span><span>Tür</span><span>Eşya</span><span>Tutar</span></div>
    <div class="te-list">${H.length ? H.map(h => `<div class="te-row h"><small>${fmtAgo(h.ts)}</small><small class="te-side ${h.side}">${h.side === 'buy' ? 'Alım' : 'Satış'}</small><b>${mkName(h.id)}${isRod(h.id) ? ` <i style="color:${QUAL[h.q].c}">${QUAL[h.q].name}</i>` : ''}</b><span class="num">${fmt(h.qty)} × ${fmt(h.price)}</span></div>`).join('') : '<p class="note te-note">Henüz işlem yapmadın.</p>'}</div></div>`;
}
function renderTe(w) {
  const m = mkState(), det = w.tab === 0 && w.view === 'det';
  const body = w.tab === 0 ? (det ? teDet(w) : `<label class="te-search">${icon('tag')}<input id="teSearch" placeholder="Eşya ara… (ör. olta, fileto)" value="${esc(w.search)}" autocomplete="off" spellcheck="false"></label>
      ${teDds(w)}<div class="te-table"><div class="te-th"><span>Eşya</span><span>En ucuz satış</span><span>En iyi alış</span></div><div class="te-list" id="teList">${teRows(w).map(teRow).join('') || '<p class="note te-note">Aramana uyan eşya yok.</p>'}</div></div>`)
    : w.tab === 1 ? teOrders() : w.tab === 2 ? teDeliv() : teHist();
  return `<header class="sh-head"><span class="te-hd">${det ? `<button class="te-back" data-act="te:list" aria-label="Geri">${icon('back')}</button>` : '<img src="assets/ui/market-256.png" alt="">'}
      <span><b>Ticaret Evi</b><small>Derinsu Limanı pazarı · ${m.orders.length} açık emir</small></span></span><button class="icon-btn sh-x" data-act="close" aria-label="Kapat">${icon('close')}</button></header>
    <div class="sh-body te-win">${body}</div>
    <nav class="sh-tabs">${['Pazar', `Emirlerim${m.orders.length ? `<i class="te-badge">${m.orders.length}</i>` : ''}`, `Teslimat${m.dl.length ? `<i class="te-badge">${m.dl.length}</i>` : ''}`, 'Geçmiş'].map((l, i) => `<button data-act="te:tab:${i}" class="${i === w.tab ? 'on' : ''}">${l}</button>`).join('')}</nav>`;
}
// arama ve sayı kutuları: yazdıkça liste süzülür, sayı değişince form yenilenir
function bindTe(root) {
  const w = win; if (!w || w.id !== 'te') return;
  const si = root.querySelector('#teSearch');
  if (si) si.addEventListener('input', () => { w.search = si.value.trim().toLocaleLowerCase('tr'); const l = root.querySelector('#teList'); if (l) l.innerHTML = teRows(w).map(teRow).join('') || '<p class="note te-note">Aramana uyan eşya yok.</p>'; });
  const qi = root.querySelector('#teQty'); if (qi) qi.addEventListener('change', () => { w.qty = Math.max(1, parseInt(qi.value, 10) || 1); drawWin(false); });
  const pi = root.querySelector('#tePrice'); if (pi) pi.addEventListener('change', () => { w.price = Math.max(1, parseInt(pi.value, 10) || 1); drawWin(false); });
}
function teAct(a, x, y, z) {
  const w = win; if (!w || w.id !== 'te') return;
  if (a === 'tab') { w.tab = +x; w.dd = null; drawWin(true); return; }
  if (a === 'list') { w.view = 'list'; drawWin(true); return; }
  if (a === 'dd') { w.dd = w.dd === x ? null : x; drawWin(false); return; }
  if (a === 'set') { w[x] = x === 'cat' ? y : +y; w.dd = null; if (x !== 'cat' || y === 'all') {} drawWin(false); return; }
  if (a === 'item') { w.item = x; w.iq = +y; w.view = 'det'; w.mode = 0; w.qty = 1; w.price = 0; drawWin(true); return; }
  if (a === 'q') { w.iq = +x; w.price = 0; drawWin(false); return; }
  if (a === 'mode') { w.mode = +x; w.price = 0; drawWin(false); return; }
  if (a === 'step') { if (x === 'q') w.qty = Math.max(1, w.qty + +y); else w.price = Math.max(1, w.price + +y * Math.max(1, Math.round(w.price * .01))); drawWin(false); return; }
  if (a === 'setp') { w.price = +x; drawWin(false); return; }
  if (a === 'px') { w.mode = x === 'sell' ? 0 : 1; drawWin(false); return; }
  if (a === 'max') {
    const sd = TE_MODES[w.mode][1], b = mkBook(w.item, w.iq);
    if (sd === 'sell') w.qty = Math.max(1, mkHave(w.item, w.iq));
    else if (TE_MODES[w.mode][2]) w.qty = Math.max(1, Math.floor(S.silver / (w.price * (1 + MK_FEE))));
    else { let s = S.silver, n = 0; for (const l of b.sells) { const t = Math.min(l.qty, Math.floor(s / l.price)); n += t; s -= t * l.price; if (t < l.qty) break; } w.qty = Math.max(1, n); }
    drawWin(false); return;
  }
  if (a === 'submit') {
    const [, sd, ord] = TE_MODES[w.mode], nm = mkName(w.item);
    if (ord) {
      if (mkOrder(w.item, w.iq, sd, w.price, w.qty)) { toast(`${sd === 'sell' ? 'Satış' : 'Alım'} emri verildi`, { label: 'Ticaret Evi', sub: `${fmt(w.qty)} × ${nm} · ${fmt(w.price)} gümüş` }); w.qty = 1; }
      else toast(sd === 'sell' ? `Elinde yeterli ${nm} yok` : 'Kesende yeterli gümüş yok', { tone: 'warn' });
    } else {
      const r = mkInstant(w.item, w.iq, sd, w.qty);
      if (r) { toast(sd === 'buy' ? `${fmt(r.fill)} × ${nm} alındı` : `${fmt(r.fill)} × ${nm} satıldı`, { label: 'Ticaret Evi', sub: `${sd === 'buy' ? '−' : '+'}${fmt(sd === 'buy' ? r.cost : r.cost - Math.floor(r.cost * MK_TAX))} gümüş${isRod(w.item) && sd === 'buy' ? ' · sandıkta, kuşanabilirsin' : ''}` }); bumpCur('#curSilver'); w.qty = 1; }
      else toast(sd === 'buy' ? 'Kesende yeterli gümüş yok ya da defter boş' : `Elinde yeterli ${nm} yok ya da alıcı yok`, { tone: 'warn' });
    }
    haptic(12); save(); renderAll(); drawWin(false); return;
  }
  if (a === 'cancel') { mkCancel(x); toast('Emir iptal edildi', { sub: 'kalanı geri geldi' }); save(); renderAll(); drawWin(false); return; }
  if (a === 'claim') { const [cr, it] = mkClaim(); toast('Teslimat alındı', { label: 'Ticaret Evi', sub: [cr ? `+${fmt(cr)} gümüş` : '', it ? `${fmt(it)} eşya sandığa` : ''].filter(Boolean).join(' · ') }); bumpCur('#curSilver'); save(); renderAll(); drawWin(false); }
}

/* ---------- Oltalar: yedekler sandıkta, kuşanılan değişir ---------- */
function equipRod(i) {
  const r = S.rods[i]; if (!r) return;
  S.rods.splice(i, 1);
  S.rods.push({ t: S.rod.t, q: S.rod.q, dur: S.rod.dur });
  S.rod = { t: r.t, q: r.q, dur: r.dur };
  resumeIfRoom();
  toast(`${RODS[r.t].name} kuşanıldı`, { label: QUAL[r.q].name, sub: `${fmt(r.dur)}/${fmt(durMax())} dayanıklılık` });
}
