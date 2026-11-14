/* =========================================================
   DERİNSU — eşya kartı
   Astralis'in küçük eşya kartı: bir eşyaya dokununca hemen yanında açılır (altında yer varsa altında, yoksa üstünde),
   arka plan kararmaz. Resim nadirlik renkli kafes zeminde, kademe sağ üst köşe plakasında; ad, "NADİRLİK · TÜR · K-II",
   değer satırları, açıklama, bilgi şeritleri, ağırlık ve değer, en altta eylemler. Dışarı dokununca kapanır.
   openCard(spec, anchor, onAct) · spec: { art (HTML), q, tier, name, have, kind, stats: [[k, v]], desc, rows: [[k, v]],
     left (alt sol yazı), value (gümüş), acts: [[eylem, yazı, birincil]] }
   ========================================================= */
'use strict';
let cardEl = null, cardAct = null;
function closeCard() {
  const el = cardEl; if (!el) return;
  cardEl = null; cardAct = null; el.classList.add('out');
  setTimeout(() => el.remove(), 180);
}
function openCard(c, anchor, onAct) {
  if (cardEl) { cardEl.remove(); cardEl = null; }
  const Q = QUAL[c.q || 0];
  const el = document.createElement('div');
  el.className = 'itc-layer';
  el.innerHTML = `<div class="itc itc-${Q.r}" style="--rc:${Q.c}">
    <div class="itc-pic ifr ifr-${Q.r}"><span class="ifr-bg"></span><span class="ifr-pt"></span>${c.q === 3 ? '<span class="ifr-fx"><i></i></span>' : ''}
      <span class="itc-art">${c.art}</span>${c.tier ? `<b class="itc-tm"><i>${rom(c.tier)}</i></b>` : ''}</div>
    <button class="itc-x" data-a="close" aria-label="Kapat">${icon('close')}</button>
    <div class="itc-head"><b class="itc-name">${c.name}${c.have > 1 ? ` <small>×${fmt(c.have)}</small>` : ''}</b>
      <span class="itc-eye">${Q.name} · ${c.kind}${c.tier ? ` · <em>K-${rom(c.tier)}</em>` : ''}</span>
      ${c.stats && c.stats.length ? `<div class="itc-stats">${c.stats.map(([k, v]) => `<div class="itc-st"><span>${k}</span><b>${v}</b></div>`).join('')}</div>` : ''}</div>
    <div class="itc-body">${c.desc ? `<p class="itc-desc">${c.desc}</p>` : ''}
      ${c.have > 1 && c.value !== undefined ? `<span class="itc-note">Yığın ×${fmt(c.have)} · değer toplam <b>${fmt(c.value * c.have)}</b></span>` : ''}
      ${c.rows && c.rows.length ? `<div class="itc-perks">${c.rows.map(([k, v]) => `<div class="itc-perk info"><span>${k}</span><b>${v}</b></div>`).join('')}</div>` : ''}</div>
    <div class="itc-foot"><span>${c.left || ''}</span><span class="itc-pr">${c.value !== undefined ? `<span>Değer <b>${fmt(c.value)}<i class="coin"></i></b></span>` : ''}</span></div>
    <div class="itc-acts">${(c.acts || []).slice(0, 3).map(([a, l, pri]) => `<button class="${pri ? 'pri' : ''}" data-a="${a}">${l}</button>`).join('')}</div></div>`;
  document.body.appendChild(el);
  // kart dokunulan eşyanın yanında; ekrana sığmazsa küçülür
  const card = el.firstElementChild, W = card.offsetWidth, H = card.offsetHeight, vw = innerWidth, vh = innerHeight, m = 8;
  const r = anchor ? anchor.getBoundingClientRect() : { left: vw / 2, right: vw / 2, top: vh / 2, bottom: vh / 2, width: 0, height: 0 };
  const s = Math.min(1, (vh - m * 2) / H), h = H * s, w = W * s;
  const below = vh - r.bottom - m >= h, above = r.top - m >= h;
  const y = below ? r.bottom + 6 : above ? r.top - 6 - h : clamp(r.top + r.height / 2 - h / 2, m, vh - h - m);
  const x = clamp(r.left + r.width / 2 - w / 2, m, vw - w - m);
  card.style.left = x + 'px'; card.style.top = y + 'px';
  if (s < 1) card.style.setProperty('--s', s.toFixed(3));
  card.style.transformOrigin = below ? 'top center' : above ? 'bottom center' : 'center';
  cardEl = el; cardAct = onAct; haptic(8);
  el.addEventListener('click', e => {
    const a = e.target.closest('[data-a]'); if (!a) return;
    haptic(8);
    const act = a.dataset.a, fn = cardAct;
    closeCard();
    if (act !== 'close' && fn) fn(act);
  });
}
// kartın dışına dokunmak kartı kapatır (dokunulan başka bir eşyaysa onun kartı açılır)
document.addEventListener('pointerdown', e => { if (cardEl && !cardEl.firstElementChild.contains(e.target)) closeCard(); }, true);

/* ---------- Kart içerikleri ---------- */
const fishArt = (f, tall) => `<img class="itc-img" src="assets/items/fish/fish-t${f.img}.png" alt="" draggable="false" style="filter:hue-rotate(${f.hue || 0}deg) saturate(${f.sat || 1}) drop-shadow(0 3px 4px rgba(0,0,0,.6))${tall ? ';rotate:-90deg' : ''}">`;
function stackCard(i, anchor) {
  const st = holdOf()[i]; if (!st) return;
  const f = FISH_BY[st.id], sp = spotById(f.spot), price = Math.round(st.val * fishSellK(sp)), d = S.dex[st.id];
  openCard({ art: fishArt(f), q: st.q || 0, tier: sp.t, name: f.name, have: st.n, kind: `${sp.kind} balığı`,
    stats: [['Yığın', `${fmt(st.n)} balık`], ['Ağırlık', fmtKg(st.kg)]],
    desc: `${sp.name} sularında yaşar. Envanterde türüne ve nadirliğine göre tek yığın olarak durur.`,
    rows: [['Rekor', d ? fmtKg(d.best) : '—'], ['Tutulan', d ? `${fmt(d.n)} tane` : '—']],
    left: `Envanterde ${fmt(st.n)}`, value: Math.round(price / st.n), acts: [['sell', st.n > 1 ? 'Yığını sat' : 'Sat', 1]] }, anchor, a => {
    if (a === 'sell') holdAct('sell', i);
  });
}
function slotCard(id, anchor) {
  if (id === 'olta') {
    const r = rod(), dm = durMax();
    openCard({ art: `<img class="itc-img" src="assets/items/rod/rod-t${r.t}.png" alt="" draggable="false">`, q: S.rod.q, tier: r.t, name: r.name, kind: 'Olta',
      stats: [['Hız', `+%${fmtDec(r.spd * rodQ(), 0)}`], ['Şans', `+%${fmtDec(r.luck * rodQ(), 0)}`]],
      desc: 'Oltanın kademesi suyun kademesinden en çok bir aşağıda olabilir; bir aşağıdaysa av iki kat yavaştır.',
      rows: [['Dayanıklılık', `${fmt(S.rod.dur)} / ${fmt(dm)}`], ['Onarım', repairCost() ? `${fmt(repairCost())} gümüş` : 'gerekmez'], ['Yedek', S.rods.length ? `${S.rods.length} olta sandıkta` : 'yok']],
      left: 'Kuşanıldı', acts: [...(repairCost() ? [['fix', `Onar · ${fmt(repairCost())}`, S.silver >= repairCost()]] : []), ['te', 'Ticaret Evi', !repairCost()], ...(S.rods.length ? [['spare', 'Yedekler']] : [])] }, anchor, a => {
      if (a === 'fix') { if (S.silver < repairCost()) toast('Kesende yeterli gümüş yok', { tone: 'warn' }); else repairRod(); if (win) drawWin(false); }
      if (a === 'te') openTrade({ id: 'olta' + Math.min(5, S.rod.t + 1), q: 0 });
      if (a === 'spare') openInv('box');
    });
    return;
  }
  if (id === 'tilsim') {
    const b = buff('yonca'), it = ITEMS.yonca;
    openCard({ art: `<img class="itc-img" src="${it.img}" alt="" draggable="false">`, q: it.q, name: b ? it.name : 'Boş tılsım', kind: 'Tılsım',
      stats: [['Şans', `+%${it.charm.luck}`], ['Süre', `${it.charm.min} dk`]],
      desc: b ? `Takılı · ${Math.ceil((b.until - Date.now()) / 60e3)} dakika kaldı.` : 'Envanterdeki Dört Yapraklı Yonca takılınca burada durur.',
      left: b ? 'Kuşanıldı' : `Envanterde ${S.box.yonca || 0}`, acts: !b && S.box.yonca ? [['use', 'Yonca tak', 1]] : [] }, anchor, a => { if (a === 'use') { useItem('yonca'); drawWin(false); } });
    return;
  }
  const o = OUTFIT[id], sl = WEAR.find(s => s.id === id);
  openCard({ art: `<span class="itc-img itc-wear">${WEAR_IC[id](o.c)}</span>`, q: 0, name: o.name, kind: sl.name, desc: o.desc,
    rows: [['Takım', 'başlangıç'], ['Özellik', 'yok']], left: 'Kuşanıldı' }, anchor);
}
const rodCardAt = anchor => slotCard('olta', anchor);
function spareRodCard(i, anchor) {
  const r = S.rods[i]; if (!r) return;
  const R = RODS[r.t], dm = Math.round(ROD_DUR[r.t] * GEAR_Q[r.q]), b = mkBook('olta' + r.t, r.q), bid = b.buys[0];
  const acts = [['eq', 'Kuşan', S.loc !== 'sea' || !S.fishing || S.fishing.broken]];
  if (bid) acts.push(['sell', `Sat · ${fmt(Math.floor(bid.price * (1 - MK_TAX)))}`]);
  acts.push(['te', 'Pazarda aç']);
  openCard({ art: `<img class="itc-img" src="assets/items/rod/rod-t${r.t}.png" alt="" draggable="false">`, q: r.q, tier: r.t, name: R.name, kind: 'Yedek olta',
    stats: [['Hız', `+%${fmtDec(R.spd * GEAR_Q[r.q], 0)}`], ['Şans', `+%${fmtDec(R.luck * GEAR_Q[r.q], 0)}`]],
    desc: S.rod.t > r.t ? 'Elindeki oltadan zayıf.' : S.rod.t < r.t ? 'Elindeki oltadan güçlü.' : 'Elindekiyle aynı kademe.',
    rows: [['Dayanıklılık', `${fmt(r.dur)} / ${fmt(dm)}`]], left: 'Envanterde', value: mkRef('olta' + r.t, r.q), acts }, anchor, a => {
    if (a === 'eq') equipRod(i);
    if (a === 'sell') { S.rods.unshift(S.rods.splice(i, 1)[0]); const res = mkInstant('olta' + r.t, r.q, 'sell', 1); if (res) toast(`${R.name} satıldı`, { sub: `+${fmt(res.cost - Math.floor(res.cost * MK_TAX))} gümüş` }); }
    if (a === 'te') { openTrade({ id: 'olta' + r.t, q: r.q }); return; }
    save(); renderAll(); if (win) drawWin(false);
  });
}
function boxCard(id, anchor) {
  const it = ITEMS[id], n = S.box[id]; if (!it || !n) return;
  const use = it.food ? 'Ye' : it.bait ? 'Yemi at' : it.cila ? 'Oltaya sür' : it.charm ? 'Tak' : it.chest ? 'Aç' : '';
  const stats = it.food ? [['Hız', `+%${it.food.spd}`], ['Şans', `+%${it.food.luck}`], ['Süre', `${FOOD_MIN} dk`]]
    : it.bait ? [['Şans', `+%${it.bait.luck}`], ['XP', `+%${it.bait.xp}`], ['Süre', `${YEM_MIN} dk`]]
    : it.cila ? [['Dayanık', `+${fmt(it.cila)}`]] : it.charm ? [['Şans', `+%${it.charm.luck}`], ['Süre', `${it.charm.min} dk`]] : [];
  const rows = it.mat ? [['Kaynak', MATS[id].src], ['Kullanım', MATS[id].use]] : it.raw ? [['Meslek', PROFS[it.raw].name], ['Bölge', PROFS[it.raw].region]] : [];
  const desc = it.raw ? (it.rawFind ? PROFS[it.raw].find.desc + ' Toplarken ender olarak çıkar; üretimde kullanılacak.' : `${PROFS[it.raw].region}'nda toplanan hammadde. Atölyelerde işlenecek.`) : it.mat ? (MATS[id].orange ? 'Efsanevi bir türden düştü. Turuncu malzeme.' : 'Ayıklama Tezgâhı\'nda balık işlenirken nadirliğine bağlı şansla düşer. Pazarda talebi vardır.') : it.chest ? 'İçinden gümüş, inci, bazen yonca çıkar.' : id.startsWith('fileto') ? 'Ayıklama Tezgâhı\'nda balıktan çıkar. Yemek ve yem yapımında kullanılır.'
    : id.startsWith('yag') ? 'Yağhane\'de kaynatılan balıktan süzülür. Yem ve olta cilası yapımında kullanılır.' : it.food ? 'Ocakbaşı\'nda pişer. Yenince hız ve şans verir.'
    : it.bait ? 'Yem Tezgâhı\'nda karılır. Atınca nadir balık ve deneyim artar; yemekle birlikte işler.' : it.cila ? 'Cila Tezgâhı\'nda yapılır. Oltaya dayanıklılık verir, kırık oltayı da çalıştırır.'
    : it.charm ? 'Dört yapraklı yonca: takılınca şans getirir.' : 'Hal\'de iyi para eder.';
  const acts = []; if (use) acts.push(['use', use, 1]); acts.push(['sell', 'Sat']); if (n > 1) acts.push(['sellall', 'Tümünü sat']);
  openCard({ art: it.svg ? `<span class="itc-img itc-svg">${it.svg}</span>` : `<img class="itc-img" src="${it.img}" alt="" draggable="false"${it.hue ? ` style="filter:hue-rotate(${it.hue}deg) drop-shadow(0 3px 4px rgba(0,0,0,.6))"` : ''}>`, q: it.q, tier: it.t, name: it.name, have: n, kind: it.kind,
    stats, desc, rows, left: `Envanterde ${fmt(n)}`, value: itemVal(id), acts }, anchor, a => {
    if (a === 'use') useItem(id);
    if (a === 'sell' || a === 'sellall') { const got = sellItem(id, a === 'sell' ? 1 : n); if (got) toast(`${it.name} satıldı`, { sub: `+${fmt(got)} gümüş` }); }
    save(); renderAll(); drawWin(false);
  });
}
