/* =========================================================
   DERİNSU — atölyeler
   Astralis İşlemehane / Zanaathane: salonda atölye kartları (ustalık, XP halkası, akış, durum);
   karta dokununca atölye: ustalık çubuğu, kademe şeridi, tezgâh (malzeme yuvaları → ürün madalyonu),
   usta işi olasılığı, bilgi, adet ve Üret; altta 3 sıralı sipariş ve Teslim Rafı. Sıradaki ilk işe
   dokununca üretim ekranı açılır (alet çalışır, darbeler dolar, biten parça açılır).
   app.js'teki yardımcıları çağrı anında kullanır.
   ========================================================= */
'use strict';

/* ---------- Durum ---------- */
function ensureWs() {
  S.ws = S.ws || {}; S.rack = S.rack || {};
  for (const w of WORKSHOPS) if (!S.ws[w.id]) S.ws[w.id] = { lvl: 1, xp: 0, jobs: [] };
  // Tütsühane'den kalan siparişler atölyelere taşınır
  if (S.orders && S.orders.length) {
    for (const o of S.orders) {
      const ws = o.kind === 'fileto' ? 'ayiklama' : 'ocak', left = o.n - o.done;
      if (left > 0 && S.ws[ws].jobs.length < WS_ORDERS) S.ws[ws].jobs.push({ rid: ws + o.t, n: left, made: 0, t0: 0, fv: 0 });
    }
  }
  delete S.orders;
}
const wsLvl = id => S.ws[id].lvl;
const wsSec = r => r.sec / (1 + (wsLvl(r.ws) - 1) * WS_SPD / 100) / (1 + (dailyEv().smoke || 0) / 100) / (S.devSpd || 1);
const ustaPct = r => clamp(USTA_ISI[0] + (wsLvl(r.ws) - WS_TIER_LVL[r.t - 1]) * 1.5, USTA_ISI[0], USTA_ISI[1]);
const tierLock = (id, t) => wsLvl(id) < WS_TIER_LVL[t - 1];
const wsBusy = () => WORKSHOPS.reduce((s, w) => s + S.ws[w.id].jobs.length, 0);
const rackN = () => Object.values(S.rack).reduce((s, v) => s + v, 0);
// malzeme: 'balik' o suyun Sıradan/Seçkin balığıdır (ambardan, ucuzdan başlayarak)
const matHave = (k, t) => k === 'balik' ? filletHave(t) : (S.box[k] || 0);
const maxOps = r => Math.min(...r.in.map(m => Math.floor(matHave(m.k, r.t) / m.n)));
const matName = (k, t) => k === 'balik' ? `${SPOTS[t - 1].kind} balığı` : ITEMS[k].name;
const matFrame = (k, t, cls = '') => {
  if (k !== 'balik') return itemFrame(ITEMS[k], 0, cls);
  const f = spotFish(SPOTS[t - 1].id)[0];      // o suyun ilk türü (nadirlik artık ava göre)
  return frame({ tier: t, rarity: 'white', icon: fishImg(f) }, cls);
};
const outFrame = (r, cls = '', n = 0) => itemFrame(ITEMS[r.out], n, cls);

function wsAddXp(id, x, live) {
  const w = S.ws[id];
  if (w.lvl >= WS_MAX_LVL) return;
  w.xp += x;
  while (w.lvl < WS_MAX_LVL && w.xp >= wsXpNeed(w.lvl)) {
    w.xp -= wsXpNeed(w.lvl); w.lvl++;
    if (live) {
      const t = WS_TIER_LVL.indexOf(w.lvl);
      const s = wsById(id);
      Notices.notify({ type: 'level', color: s.c, label: s.name, title: `Ustalık ${w.lvl}`, art: `assets/ui/${s.art}-256.png`,
        done: t > 0 ? `${rom(t + 1)}. kademe tarifleri açıldı` : `Hız +%${WS_SPD}`, action: 'Atölye', ws: id });
    }
  }
}

/* ---------- Sipariş ---------- */
function wsStart(rid, n) {
  const r = RCP[rid], w = S.ws[r.ws];
  n = Math.min(n, maxOps(r));
  if (n <= 0 || w.jobs.length >= WS_ORDERS || tierLock(r.ws, r.t)) return false;
  let fv = 0; const drops = {};
  for (const m of r.in) {
    if (m.k === 'balik') {
      let need = n * m.n;
      const B = bag();
      for (const f of filletSrc(r.t, B)) {
        const k = Math.min(need, B[f.id].n);
        const rm = removeFish(f.id, k); need -= k;
        fv += rm.val * fishSellK(spotById(f.spot));
        // işleme: her balık nadirliğine göre kendi mavi malzemesini düşürebilir (Mitik: kesin 2)
        if (r.ws === 'ayiklama') rm.qs.forEach((c, q) => { for (let j = 0; j < c; j++) { const d = q === 5 ? 2 : Math.random() * 100 < QUAL[q].blue * (1 + (S.ws.ayiklama.lvl - 1) / 50) ? 1 : 0; if (d) drops[f.mat] = (drops[f.mat] || 0) + d; } });
        if (!need) break;
      }
      resumeIfRoom();
    } else take(m.k, n * m.n);
  }
  w.jobs.push({ rid, n, made: 0, t0: w.jobs.length ? 0 : Date.now(), fv: Math.round(fv / n), drops });
  return true;
}
// iptal: kalan işlerin eşya malzemesi Teslim Rafı'na döner; balık işlenmeye başladığı için hal değerinin yarısı ödenir
function wsCancel(id, i) {
  const w = S.ws[id], o = w.jobs[i]; if (!o) return '';
  const r = RCP[o.rid], left = o.n - o.made; let silver = 0, back = 0;
  for (const m of r.in) {
    if (m.k === 'balik') silver += Math.round(o.fv * left * .5);
    else { S.rack[m.k] = (S.rack[m.k] || 0) + left * m.n; back += left * m.n; }
  }
  S.silver += silver;
  w.jobs.splice(i, 1);
  if (i === 0 && w.jobs[0]) w.jobs[0].t0 = Date.now();
  return [back ? `${back} malzeme rafa döndü` : '', silver ? `+${fmt(silver)} gümüş` : ''].filter(Boolean).join(' · ');
}
const jobDone = {};      // atölye → son biten işlem (üretim ekranındaki açılış için)
function processWorkshops(now, live, rep) {
  for (const ws of WORKSHOPS) {
    const w = S.ws[ws.id]; let guard = 0;
    while (w.jobs.length && guard++ < 5000) {
      const o = w.jobs[0], r = RCP[o.rid];
      if (!o.t0) o.t0 = now;
      const ms = wsSec(r) * 1000;
      if (now < o.t0 + ms) break;
      o.made++; o.t0 += ms;
      const v = r.n * (Math.random() * 100 < ustaPct(r) ? 2 : 1);
      S.rack[r.out] = (S.rack[r.out] || 0) + v;
      wsAddXp(ws.id, r.xp, live);
      questHook('smoke', 1);
      if (rep) rep.items[r.out] = (rep.items[r.out] || 0) + v;
      else if (live) jobDone[ws.id] = { t: Date.now(), k: r.out, v, two: v > r.n };
      if (o.made >= o.n) {
        for (const [k, c] of Object.entries(o.drops || {})) { S.rack[k] = (S.rack[k] || 0) + c; if (rep) rep.items[k] = (rep.items[k] || 0) + c; else if (live && !quiet()) notifyItem(k, c, 'Ayıklama', 'rafta'); }
        w.jobs.shift(); if (w.jobs[0]) w.jobs[0].t0 = o.t0;
        if (live && !quiet()) toast(`${ws.name} işi bitti`, { label: ws.mode === 'p' ? 'İşlemehane' : 'Zanaathane', sub: `${o.n} × ${ITEMS[r.out].name} · Teslim Rafı'nda` });
      }
    }
  }
}
function takeRack() {
  const n = rackN(); if (!n) return 0;
  for (const [k, v] of Object.entries(S.rack)) S.box[k] = (S.box[k] || 0) + v;
  S.rack = {}; return n;
}
// süren işin kalan süresi (sıranın i'ninci işine dek)
function jobsLeft(id, i) {
  const jobs = S.ws[id].jobs; let t = 0;
  for (let k = 0; k < i; k++) { const o = jobs[k], r = RCP[o.rid]; t += (o.n - o.made) * wsSec(r) - (k === 0 && o.t0 ? (Date.now() - o.t0) / 1000 : 0); }
  return Math.max(0, t);
}

/* ---------- Salon: İşlemehane / Zanaathane ---------- */
const HALL = {
  p: { name: 'İşlemehane', sub: 'Ham balığı işle', art: 'prof_fish' },
  g: { name: 'Zanaathane', sub: 'Yemek, yem ve olta cilası üret', art: 'anvil' },
};
function openHall(mode) { openWin('hall', renderHall, { mode, tall: true }); }
function renderHall(w) {
  const h = HALL[w.mode], list = WORKSHOPS.filter(x => x.mode === w.mode);
  const card = (s, i) => {
    const st = S.ws[s.id], xp = st.lvl >= WS_MAX_LVL ? 1 : st.xp / wsXpNeed(st.lvl), jobs = st.jobs.length;
    const bt = Math.max(1, WS_TIER_LVL.filter(x => st.lvl >= x).length), r = RCP[s.id + bt];
    const flow = `${r.in.map(m => matFrame(m.k, r.t, 'wh-it')).join('<i class="wh-plus">+</i>')}<i class="wh-arr">${icon('chev')}</i>${outFrame(r, 'wh-it')}<small>${r.in.map(m => matName(m.k, r.t)).join(' + ')} → ${ITEMS[r.out].name}</small>`;
    return `<button class="wh-card" data-act="ws:open:${s.id}" style="--c:${s.c};--x:${(xp * 100).toFixed(1)}%;--i:${i}">
      <span class="wh-fx" aria-hidden="true"><i></i></span>
      <span class="wh-med"><img src="assets/ui/${s.art}-256.png" alt=""><b class="num">${st.lvl}</b></span>
      <span class="wh-tx"><small class="wh-kick">Ustalık ${st.lvl} · ${s.master}${st.lvl > 1 ? ` · <i class="wh-yt">+%${(st.lvl - 1) * WS_SPD} hız</i>` : ''}</small><b class="wh-nm">${s.name}</b><em class="wh-tag">${s.tag}</em><span class="wh-flow">${flow}</span></span>
      <span class="wh-side"><span class="wh-st ${jobs ? 'busy' : ''}">${jobs ? `<i class="dot"></i>${jobs}/${WS_ORDERS}` : 'Boşta'}</span><i class="wh-go">${icon('chev')}</i></span></button>`;
  };
  const sm = dailyEv().smoke;
  return `<header class="sh-head"><span class="ws-hd"><img src="assets/ui/${h.art}-256.png" alt=""><span><b>${h.name}</b><small><i class="ws-dot"></i>${h.sub}${sm ? ` · <em class="ws-ev">${dailyEv().name} 2× hız</em>` : ''}</small></span></span><button class="icon-btn sh-x" data-act="close" aria-label="Kapat">${icon('close')}</button></header>
    <div class="sh-body wh-win"><p class="wh-note">Hangi atölyeden devam etmek istiyorsun?</p><div class="wh-list" style="--n:${list.length}">${list.map(card).join('')}</div>
    <button class="wh-rack ${rackN() ? '' : 'off'}" data-act="ws:rack">${icon('chest')}<span><b>Teslim Rafı · ${rackN() ? fmt(rackN()) + ' ürün' : 'boş'}</b><small>${rackN() ? 'Hepsini sandığa al' : 'Biten ürünler burada toplanır'}</small></span>${rackN() ? icon('chev') : ''}</button>
    <div class="wh-rules"><span>${icon('clock')}<b>3 sıra</b><small>Her atölye kendi sırasını işler, sen yokken de</small></span><span>${icon('star')}<b>Usta işi</b><small>İşlem başına %${USTA_ISI[0]}–${USTA_ISI[1]} çifte çıkış</small></span><span>${icon('up')}<b>Ustalık</b><small>Her işlem XP · kademe açar · +%${WS_SPD} hız</small></span></div></div>`;
}

/* ---------- Atölye ---------- */
function openWs(id, hall = true) {
  const st = S.ws[id], bt = Math.max(1, WS_TIER_LVL.filter(x => st.lvl >= x).length);
  // açılışta: malzemesi olan en üst açık kademe, yoksa en üst açık kademe
  let tier = bt; for (let t = bt; t >= 1; t--) if (maxOps(RCP[id + t]) > 0) { tier = t; break; }
  openWin('ws', renderWs, { ws: id, hall, tier, n: 1, pane: 'main', tall: true });
}
function renderWs(w) {
  const s = wsById(w.ws), st = S.ws[w.ws], r = RCP[w.ws + w.tier], lock = tierLock(w.ws, w.tier);
  sheetIn.classList.toggle('ws-bench-on', w.pane === 'forge');
  if (w.pane === 'forge') return forgeHtml(w);
  const mx = maxOps(r); w.n = clamp(w.n, 1, Math.max(1, mx));
  const xpP = st.lvl >= WS_MAX_LVL ? 100 : st.xp / wsXpNeed(st.lvl) * 100;
  const tiers = `<div class="ws-tiers" style="--i:${w.tier - 1}"><i class="ws-tslide"></i>${[1, 2, 3, 4, 5].map(t => {
    const lk = tierLock(w.ws, t), can = !lk && maxOps(RCP[w.ws + t]) > 0;
    return `<button class="${w.tier === t ? 'on' : ''} ${lk ? 'lock' : ''}" data-act="ws:tier:${t}" aria-label="${rom(t)}. kademe"><b>${rom(t)}</b>${lk ? `<small>${icon('lock')}${WS_TIER_LVL[t - 1]}</small>` : can ? '<i class="ws-can"></i>' : ''}</button>`;
  }).join('')}</div>`;
  let bench;
  if (lock) bench = `<div class="ws-strip lock"><span class="ws-lk">${icon('lock')}</span><span><b>${rom(w.tier)}. kademe kilitli</b><small>Ustalık ${WS_TIER_LVL[w.tier - 1]} gerekli · şu an ${st.lvl}. Her biten işlem ustalık kazandırır.</small></span></div>`;
  else {
    const sock = r.in.map(m => { const have = matHave(m.k, r.t), need = m.n * w.n;
      return `<span class="ws-sock on">${matFrame(m.k, r.t, 'ws-sock-ic')}<small>${matName(m.k, r.t)}</small><b class="num ${have >= need ? 'ok' : 'no'}">${fmt(have)} / ${fmt(need)}</b></span>`; }).join('');
    const up = ustaPct(r), start = jobsLeft(w.ws, st.jobs.length), sec = wsSec(r);
    const block = st.jobs.length >= WS_ORDERS ? 'Sıra dolu' : mx < 1 ? 'Malzeme yok' : '';
    bench = `<div class="ws-bt"><b>${ITEMS[r.out].name} ${rom(r.t)}</b><small>${s.mode === 'p' ? 'İşleme' : 'Üretim'} · ${r.in.map(m => `${m.n} ${matName(m.k, r.t)}`).join(' + ')} → ${r.n} · ${fmtDec(sec, sec < 10 ? 1 : 0)} sn / işlem · ${r.xp} XP${dailyEv().smoke ? ` · <em style="color:var(--gold)">${dailyEv().name} 2×</em>` : ''}</small></div>
      <div class="ws-stage"><div class="ws-socks">${sock}</div><i class="ws-flow">${icon('chev')}${icon('chev')}${icon('chev')}</i>
        <span class="ws-prod"><i class="ws-ring a"></i><i class="ws-ring b"></i>${outFrame(r, 'ws-prod-ic', r.n > 1 ? r.n : 0)}</span></div>
      <div class="ws-panel">
        <div class="ws-ph"><span><small>Ürün</small><b>${ITEMS[r.out].name}</b></span><span class="ws-val">${coin}${fmt(itemVal(r.out))}</span></div>
        <div class="ws-ph"><span><small>Usta işi</small><em>çifte çıkış</em></span><span class="ws-chips"><span style="color:var(--lab)"><i class="qd"></i>Tek <b>%${fmt(100 - up)}</b></span><span style="color:var(--gold)"><i class="qd"></i>Çifte <b>%${fmt(up)}</b></span></span></div>
        <i class="ws-dist"><i style="flex:${100 - up};background:#8f857e"></i><i style="flex:${up};background:var(--gold)"></i></i>
      </div>
      <div class="ws-info"><span><small>Çıkacak</small><b class="num">${fmt(r.n * w.n)}+</b></span><span><small>Süre</small><b class="num">${fmtDur(sec * w.n)}</b></span><span><small>XP</small><b class="num">${fmt(r.xp * w.n)}</b></span><span><small>Başlar</small><b class="num">${start > 0 ? fmtDur(start) : 'hemen'}</b></span></div>
      <div class="ws-pill"><span class="ws-step"><button data-act="ws:n:-1" ${w.n > 1 ? '' : 'disabled'}>−</button><b class="num">${w.n}</b><button data-act="ws:n:1" ${w.n < mx ? '' : 'disabled'}>+</button></span><button class="ws-maxb" data-act="ws:n:max" ${mx && w.n !== mx ? '' : 'disabled'}>En çok · <b class="num">${fmt(mx)}</b></button>
        <button class="ws-go" data-act="ws:go" ${block ? 'disabled' : ''}>${block || `${s.mode === 'p' ? 'İşle' : 'Üret'} · ${fmtDur(sec * w.n)}`}</button></div>`;
  }
  return `<header class="sh-head"><span class="ws-hd">${w.hall ? `<button class="te-back" data-act="ws:hall" aria-label="Geri">${icon('back')}</button>` : ''}<img src="assets/ui/${s.art}-256.png" alt=""><span><b>${s.name}</b><small><i class="ws-dot"></i>${HALL[s.mode].name} · ${s.master}</small></span></span><button class="icon-btn sh-x" data-act="close" aria-label="Kapat">${icon('close')}</button></header>
    <div class="sh-body ws-body" style="--c:${s.c}">
      <div class="ws-prof"><span class="ws-pr1"><b>Ustalık ${st.lvl}</b><small>${st.lvl >= WS_MAX_LVL ? 'En üst ustalık' : `${fmt(st.xp)} / ${fmt(wsXpNeed(st.lvl))} XP`} · hız +%${(st.lvl - 1) * WS_SPD}</small></span><i class="ws-xp"><i style="width:${xpP.toFixed(1)}%"></i></i></div>
      <div class="ws-ctl solo">${tiers}</div>
      <div class="ws-bench">${bench}</div>
      <div class="ws-bot">
        <div class="ws-box"><div class="ws-sec"><b>Sıra</b><small class="num">${st.jobs.length} / ${WS_ORDERS}</small></div><div class="ws-queue">${queueHtml(w.ws)}</div></div>
        <div class="ws-box"><div class="ws-sec"><b>Teslim rafı</b><button class="ws-take" data-act="ws:rack" aria-label="Raftakilerin hepsini envantere al">${icon('chest')}Al</button></div><div class="ws-rack">${rackHtml()}</div></div>
      </div></div>`;
}
function queueHtml(id) {
  const jobs = S.ws[id].jobs;
  return Array.from({ length: WS_ORDERS }, (_, i) => {
    const o = jobs[i];
    if (!o) return '<div class="ws-q empty"><i></i></div>';
    const r = RCP[o.rid], p = !i && o.t0 ? clamp((Date.now() - o.t0) / (wsSec(r) * 1000), 0, 1) : 0;
    return `<div class="ws-q ${i ? '' : 'run'}" ${i ? '' : 'data-act="ws:forge"'} style="--p:${p.toFixed(3)}">${outFrame(r, 'ws-q-ic', o.n - o.made)}<button class="ws-q-x" data-act="ws:cancel:${i}" aria-label="Siparişi iptal et">${icon('close')}</button>
      <small class="num" data-qt="${i}">${i ? fmtDur(jobsLeft(id, i)) : Math.max(0, Math.ceil(wsSec(r) * (1 - p))) + ' sn'}</small></div>`;
  }).join('');
}
function rackHtml() {
  const e = Object.entries(S.rack).filter(([, v]) => v > 0);
  if (!e.length) return '<small class="ws-empty">Biten ürünler burada</small>';
  return e.slice(0, 3).map(([k, v]) => itemFrame(ITEMS[k], v, 'ws-rk')).join('') + (e.length > 3 ? `<span class="ws-more">+${e.length - 3}</span>` : '');
}

/* ---------- Üretim ekranı ---------- */
const HITS = 10;
function forgeTool(kind) {
  if (kind === 'knife') return `<svg class="fg-tool" viewBox="0 0 200 150" aria-hidden="true">
    <rect x="30" y="104" width="140" height="18" rx="5" fill="#6a4a2a"/><rect x="30" y="104" width="140" height="5" rx="2.5" fill="#8a6038"/><path d="M40 122h120l-6 10H46z" fill="#3a2614"/>
    <g class="fg-ham fg-chop"><path d="M150 30 L104 98 L96 92 Z" fill="#d8d4cc"/><path d="M150 30 L104 98 L101 96 Z" fill="#f2efe8"/><rect x="146" y="14" width="10" height="28" rx="3" transform="rotate(34 151 28)" fill="#5a3c22"/></g>
    <g class="fg-spk"><circle cx="100" cy="100" r="2"/><circle cx="90" cy="98" r="1.5"/><circle cx="110" cy="97" r="1.6"/></g></svg>`;
  if (kind === 'pot') return `<svg class="fg-tool" viewBox="0 0 200 150" aria-hidden="true">
    <g class="fg-steam"><circle cx="86" cy="40" r="9"/><circle cx="104" cy="30" r="11"/><circle cx="118" cy="44" r="8"/></g>
    <path d="M46 70h108l-10 44c-3 12-14 18-26 18H82c-12 0-23-6-26-18z" fill="#2c2926"/><rect x="40" y="62" width="120" height="12" rx="6" fill="#3a3632"/>
    <path d="M70 140l10-12M130 140l-10-12" stroke="#5a3c22" stroke-width="5" stroke-linecap="round"/><g class="fg-fire"><path d="M84 146q8-22 16-6q8-18 16 6z" fill="#ff9a3a"/><path d="M92 146q8-14 16 0z" fill="#ffd27a"/></g></svg>`;
  if (kind === 'bowl') return `<svg class="fg-tool" viewBox="0 0 200 150" aria-hidden="true">
    <g class="fg-stir"><rect x="112" y="20" width="7" height="78" rx="3" transform="rotate(22 115 60)" fill="#8a6038"/><ellipse cx="100" cy="96" rx="9" ry="5" fill="#a87a50"/></g>
    <path d="M38 90h124c-4 30-30 46-62 46S42 120 38 90z" fill="#2c3a34"/><ellipse cx="100" cy="90" rx="62" ry="10" fill="#3e5a4a"/><ellipse cx="100" cy="90" rx="52" ry="7" fill="#6a8a4a" class="fg-mix"/>
    <g class="fg-spk"><circle cx="86" cy="86" r="2"/><circle cx="104" cy="84" r="1.5"/><circle cx="116" cy="88" r="1.6"/></g></svg>`;
  return `<svg class="fg-tool" viewBox="0 0 200 150" aria-hidden="true">
    <path d="M24 120 L176 70" stroke="#6a4a2a" stroke-width="6" stroke-linecap="round"/><path d="M24 120 L176 70" stroke="#a87a50" stroke-width="2" stroke-linecap="round"/><circle cx="52" cy="111" r="9" fill="#3a3632"/><circle cx="52" cy="111" r="4" fill="#e7c26a"/>
    <g class="fg-polish"><rect x="-16" y="-9" width="32" height="18" rx="6" fill="#d8cdb4"/><rect x="-16" y="-9" width="32" height="5" rx="2.5" fill="#f2ead8"/></g>
    <g class="fg-spk"><circle cx="110" cy="88" r="2"/><circle cx="124" cy="82" r="1.5"/><circle cx="138" cy="80" r="1.6"/></g></svg>`;
}
function forgeHtml(w) {
  const s = wsById(w.ws), o = S.ws[w.ws].jobs[0];
  if (!o) return `<div class="sh-body ws-body"><div class="ws-btop"><span class="ws-fk">${s.name} · ${s.verb}</span><button class="ws-x" data-act="close" aria-label="Kapat">${icon('close')}</button></div>
    <div class="fg-empty"><b>Sıra boşaldı</b><small>Biten ürünler Teslim Rafı'nda.</small></div>
    <div class="fg-foot"><button class="btn ghost" data-act="ws:main">Atölyeye dön</button></div></div>`;
  const r = RCP[o.rid];
  w.forgeRid = o.rid; w.forgeSeen = w.forgeSeen || Date.now();
  return `<div class="sh-body ws-body"><div class="ws-btop"><span class="ws-fk">${s.name} · ${s.verb}</span><span class="num ws-fn" id="fgN">${o.made + 1} / ${o.n}</span><button class="ws-x" data-act="close" aria-label="Kapat">${icon('close')}</button></div>
    <div class="fg-stage fg-${s.tool}" style="--c:${s.c}">${forgeTool(s.tool)}<span class="fg-item">${outFrame(r, 'fg-ic')}</span><div class="fg-reveal" id="fgRv"></div></div>
    <div class="fg-dots" id="fgDots">${Array.from({ length: HITS }, () => '<i></i>').join('')}</div>
    <h2 class="ws-title">${ITEMS[r.out].name} ${rom(r.t)}</h2>
    <div class="ws-sub" id="fgSub"></div>
    <div class="fg-foot"><button class="btn ghost" data-act="ws:main">Atölyeye dön</button><small>Atölyeye dönsen de iş sürer.</small></div></div>`;
}
let revealT = 0;
function forgeReveal(jd) {
  const el = sheetIn.querySelector('#fgRv'); if (!el) return;
  const it = ITEMS[jd.k];
  el.innerHTML = `${itemFrame(it, jd.v > 1 ? jd.v : 0, 'fg-rv-ic')}<b style="color:${jd.two ? 'var(--gold)' : QUAL[it.q].c}">${jd.two ? 'Usta işi! ' : ''}${it.name}</b><small>Rafa · ${fmt(jd.v)} adet</small>`;
  el.classList.remove('on'); void el.offsetWidth; el.classList.add('on');
  clearTimeout(revealT); revealT = setTimeout(() => el.classList.remove('on'), 1700);
  haptic(jd.two ? [10, 30, 10] : 8);
}
// her 250 ms: sıra halkaları, süreler, üretim ekranının darbeleri
function wsTick() {
  if (!win || win.id !== 'ws') return;
  const w = win, jobs = S.ws[w.ws].jobs, now = Date.now();
  if (w.pane === 'forge') {
    const jd = jobDone[w.ws];
    if (jd && jd.t > (w.forgeSeen || 0)) {
      w.forgeSeen = jd.t;
      if (!jobs[0] || jobs[0].rid !== w.forgeRid) { drawWin(false); w.forgeSeen = jd.t; }
      forgeReveal(jd);
    }
    const o = jobs[0]; if (!o) return;
    const r = RCP[o.rid], p = clamp((now - o.t0) / (wsSec(r) * 1000), 0, 1), hit = Math.min(HITS, Math.floor(p * HITS));
    $$('#fgDots i', sheetIn).forEach((d, i) => d.classList.toggle('on', i < hit));
    const n = sheetIn.querySelector('#fgN'); if (n) n.textContent = `${o.made + 1} / ${o.n}`;
    const sub = sheetIn.querySelector('#fgSub'); if (sub) sub.textContent = `Darbe ${hit} / ${HITS} · kalan ${fmtDur(wsSec(r) * (1 - p) + (o.n - o.made - 1) * wsSec(r))}`;
    return;
  }
  jobs.forEach((o, i) => {
    const el = sheetIn.querySelector(`[data-qt="${i}"]`); if (!el) return;
    const r = RCP[o.rid];
    if (i === 0 && o.t0) { const p = clamp((now - o.t0) / (wsSec(r) * 1000), 0, 1); el.parentElement.style.setProperty('--p', p.toFixed(3)); el.textContent = Math.max(0, Math.ceil(wsSec(r) * (1 - p))) + ' sn'; }
    else el.textContent = fmtDur(jobsLeft(w.ws, i));
  });
}
// pencere düğmeleri (app.js sheetIn tıklamasından: data-act="ws:…")
function wsAct(a, x) {
  const w = win;
  if (a === 'open') { openWs(x, true); return; }
  if (a === 'hall') { openHall(wsById(w.ws).mode); return; }
  if (a === 'rack') {
    const n = takeRack();
    if (n) { toast(`${fmt(n)} ürün envantere alındı`, { label: 'Teslim Rafı' }); haptic(12); } else toast('Raf boş', { tone: 'warn' });
    save(); renderAll(); drawWin(false); return;
  }
  if (!w || w.id !== 'ws') return;
  const r = RCP[w.ws + w.tier];
  if (a === 'tier') { w.tier = +x; w.n = 1; drawWin(false); swapBench(); return; }
  if (a === 'n') { const mx = Math.max(1, maxOps(r)); w.n = x === 'max' ? mx : clamp(w.n + +x, 1, mx); drawWin(false); return; }
  if (a === 'go') {
    const n = w.n;
    if (wsStart(r.id, n)) { haptic(14); toast(`${n} × ${ITEMS[r.out].name} sıraya alındı`, { label: wsById(w.ws).name }); w.n = 1; save(); renderAll(); }
    drawWin(false); return;
  }
  if (a === 'cancel') { const msg = wsCancel(w.ws, +x); haptic(12); toast('Sipariş iptal edildi', { sub: msg }); save(); renderAll(); drawWin(false); return; }
  if (a === 'forge') { w.pane = 'forge'; w.forgeSeen = Date.now(); drawWin(true); return; }
  if (a === 'main') { w.pane = 'main'; drawWin(true); return; }
}
function swapBench() { const b = sheetIn.querySelector('.ws-bench'); if (!b) return; b.classList.remove('swap'); void b.offsetWidth; b.classList.add('swap'); }
const wsSig = () => WORKSHOPS.map(w => S.ws[w.id].lvl + ':' + S.ws[w.id].jobs.map(o => o.rid + o.n + '/' + o.made).join(',')).join('|') + '|' + JSON.stringify(S.rack);
