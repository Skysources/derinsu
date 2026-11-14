/* Kahraman çizimi: kuşanılan donanıma göre katmanlı SVG.
   Hero.svg(look, { lod: 'map'|'doll', uid, hand: 'tool'|'weapon' }) → '<svg …>…</svg>'
   look: { helm, chest, glove, boot, bag: 0..5, weapon: {line,t}|null, tool: {kind,t}|null, q: {…: 0..3} }
   map  : viewBox -20 -46 40 52, ayak (0,0), sağa bakar; .wv-body / .wv-leg l,r / .wv-arm / .wv-cape kancaları.
   doll : viewBox 0 0 100 140, önden; ayak y≈132, gölge y≈134.
   Işık sol üstten. Pelerin rengi var(--acc) / var(--acc2). Her id opts.uid ile öneklenir. */
window.Hero = (() => {
  'use strict';

  const OL = '#15100c';
  const SK = ['#f6d8b4', '#e8bf98', '#d6a67e', '#a9785a', '#7a4f37'];
  const HR = ['#9a6a40', '#5e3c22', '#2e1c10'];
  const BASE = {
    shirt: ['#f4ead2', '#e0d0ab', '#b2a07c', '#7e6f52'],
    vest: ['#a87a52', '#7c5337', '#51341f', '#33200f'],
    pants: ['#82765f', '#625746', '#3e362b', '#27211a'],
    shoe: ['#94694a', '#6a4832', '#42291a', '#2a190f'],
    belt: ['#76543a', '#4c3322', '#2c1d12'],
    brass: ['#fbe6a6', '#dcb65c', '#94712c']
  };
  // Kademe paleti: m zırh metali, w silah metali, tr süs/kenar, cl kumaş, h sap/kabza
  const TI = [null,
    { m: ['#d8d3ca', '#b8b3ab', '#8e8982', '#66625c', '#3f3c38'], tr: ['#9c7552', '#6e4f34', '#47321f'], cl: ['#bba585', '#a08a6a', '#73624a'], h: ['#a8895f', '#7d603e', '#4e3a24'], rust: '#7a4a2a' },
    { m: ['#e3dfd8', '#c2beb7', '#a19d97', '#77736e', '#4a4744'], w: ['#f6cc98', '#e2a86c', '#c98a4e', '#9a6234', '#5c391c'], tr: ['#efbc84', '#c98a4e', '#8a5528'], cl: ['#ab7450', '#8b5a3c', '#5e3b26'], h: ['#8c6646', '#684a30', '#43301e'] },
    { m: ['#f8fafc', '#d4dbe1', '#a7b0b8', '#79828b', '#4b525a'], tr: ['#848e98', '#5a636c', '#3a4148'], cl: ['#6b788a', '#4e5a6a', '#343c48'], h: ['#5e4836', '#45342a', '#2a201a'] },
    { m: ['#ffffff', '#eff3f6', '#d3dbe2', '#a1acb7', '#6b7581'], tr: ['#fff0bc', '#e7c26a', '#a8822e'], cl: ['#8058b4', '#5e3a8a', '#3c245c'], h: ['#6c4c9c', '#4a3074', '#2e1c4c'], gem: '#b47cf6' },
    { m: ['#c0c8e4', '#98a1c0', '#717a99', '#4e5571', '#2c3046'], tr: ['#fff0bc', '#e7c26a', '#a8822e'], cl: ['#4c4768', '#33304a', '#201e30'], h: ['#3e4256', '#2a2d3c', '#181a24'], gem: '#4fe8dc', rune: 1 }];
  TI.forEach(t => t && (t.w = t.w || t.m));
  const RUNE = '#4fe8dc';
  const cl5 = n => Math.max(0, Math.min(5, n | 0));

  /* ---------- küçük yardımcılar ---------- */
  const at = a => a ? ' ' + a : '';
  const P = (d, f, a) => `<path d="${d}" fill="${f}"${at(a)}/>`;                 // dış hatlı
  const N = (d, f, a) => `<path d="${d}" fill="${f}" stroke="none"${at(a)}/>`;    // hatsız (gölge/ışık)
  const S = (d, c, w, a) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}"${at(a)}/>`;
  const C = (x, y, r, f, a) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"${at(a)}/>`;
  const CN = (x, y, r, f, a) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="none"${at(a)}/>`;
  const EN = (x, y, rx, ry, f, a) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" stroke="none"${at(a)}/>`;
  const G = (tr, body, a) => `<g transform="${tr}"${at(a)}>${body}</g>`;
  const op = v => `opacity="${v}"`;
  const mix = (a, b, p) => `color-mix(in srgb,${a} ${p}%,${b})`;

  // perçin: gölgeli küçük top
  const rivet = (x, y, r, c, hi) => CN(x, y, r, c) + CN(x - r * .3, y - r * .35, r * .4, hi || '#fff', op(.7));
  // dört kollu pırıltı (turuncu kalite)
  const spark = (x, y, s) => G(`translate(${x} ${y}) scale(${s})`, `<path class="hr-spark" d="M0-3.2L.7-.7 3.2 0 .7.7 0 3.2-.7.7-3.2 0-.7-.7Z" fill="#ffe7a8" stroke="none"/>`);
  // rün dizisi: küçük açılı işaretler
  const GLYPH = ['M0 0l.7-1.8.7 1.8M.7-1.8v2.2', 'M0-1.8v1.8l1.2-1M0-.9l1.2-.9', 'M0 0l.6-1.8h.8l-.6 1.8', 'M.7-1.9v2M0-1.3l1.4 1M0-.3l1.4-1', 'M0 0v-1.8l1.3.9-1.3.9'];
  const runeRow = (x, y, n, sc, w) => {
    let d = '';
    for (let i = 0; i < n; i++) d += G(`translate(${(x + i * 2.1 * sc).toFixed(2)} ${y}) scale(${sc})`, `<path d="${GLYPH[i % 5]}"/>`);
    return `<g class="hr-rune" fill="none" stroke="${RUNE}" stroke-width="${w || .45}" stroke-linecap="round">${d}</g>`;
  };

  /* ---------- tanımlar (degrade, desen, filtre) ---------- */
  function Defs(uid) {
    const out = [], seen = {};
    const sc = (c, o) => (/^(var|color-mix)/.test(c) ? `style="stop-color:${c}"` : `stop-color="${c}"`) + (o != null ? ` stop-opacity="${o}"` : '');
    const lin = (k, st, v) => {
      if (!seen[k]) { seen[k] = 1; out.push(`<linearGradient id="${uid}-${k}" x1="${v[0]}" y1="${v[1]}" x2="${v[2]}" y2="${v[3]}">${st.map(s => `<stop offset="${s[0]}" ${sc(s[1], s[2])}/>`).join('')}</linearGradient>`); }
      return `url(#${uid}-${k})`;
    };
    const rad = (k, st, cx, cy, r) => {
      if (!seen[k]) { seen[k] = 1; out.push(`<radialGradient id="${uid}-${k}" cx="${cx}" cy="${cy}" r="${r}">${st.map(s => `<stop offset="${s[0]}" ${sc(s[1], s[2])}/>`).join('')}</radialGradient>`); }
      return `url(#${uid}-${k})`;
    };
    const H = [0, 0, 1, 0], D = [.1, 0, .9, 1], V = [0, 0, 0, 1];
    return {
      out, lin, rad,
      cyl: (k, p) => lin(k + 'c', [[0, p[2]], [.2, p[1]], [.36, p[0]], [.56, p[2]], [.84, p[3]], [1, p[4] || p[3]]], H),     // silindir (kol, bacak, bıçak)
      dia: (k, p) => lin(k + 'd', [[0, p[0]], [.38, p[1]], [.7, p[2]], [1, p[3]]], D),                                   // plaka
      soft: (k, p) => lin(k + 's', [[0, p[0]], [.5, p[1]], [1, p[2]]], D),                                                // kumaş/deri
      vgr: (k, p) => lin(k + 'v', [[0, p[0]], [.55, p[1]], [1, p[2]]], V),
      mail: (k, ring, bg) => {
        if (!seen['ml' + k]) { seen['ml' + k] = 1; out.push(`<pattern id="${uid}-ml${k}" width="1.5" height="1.3" patternUnits="userSpaceOnUse"><rect width="1.5" height="1.3" fill="${bg}"/><path d="M0 .65a.75.6 0 0 0 1.5 0M-.75 0a.75.6 0 0 0 1.5 0M.75 0a.75.6 0 0 0 1.5 0" fill="none" stroke="${ring}" stroke-width=".32"/></pattern>`); }
        return `url(#${uid}-ml${k})`;
      },
      glow: () => {
        if (!seen.gl) { seen.gl = 1; out.push(`<filter id="${uid}-gl" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation=".7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`); }
        return `url(#${uid}-gl)`;
      },
      H, V, D
    };
  }

  // harita için düz tonlar: eşyalarda degrade yerine orta-açık ton (küçük boyda fark edilmez, işaretleme hafifler)
  function flat(D) {
    const mid = st => st[Math.floor(st.length / 2)][1];
    return Object.assign({}, D, { cyl: (k, p) => p[1], dia: (k, p) => p[1], soft: (k, p) => p[1], vgr: (k, p) => p[1], rad: (k, st) => mid(st), lin: (k, st) => mid(st) });
  }

  /* =====================================================================
     SİLAH ve ALETLER — yerel koordinat: kabza (0,0), uç yukarı (−y).
     lo: harita sürümü (ince ayrıntı yok)
     ===================================================================== */
  const ITEM = {};

  function bladeRust(lo) { return lo ? '' : N('M-1.2-14c.8-.4 1.4.2 1 .9-.5.6-1.4.2-1-.9ZM.6-24c.6-.2 1 .4.6.8-.4.4-1 .1-.6-.8ZM-1.4-33c.5 0 .7.5.3.8-.4.2-.8-.2-.3-.8Z', '#7a4a2a', op(.75)); }

  function hilt(t, T, D, lo, kind) {
    // kabza + kabza topu + siper
    const g = T.h, tr = T.tr;
    let s = '';
    const pom = t >= 4 ? D.dia('tr' + t, [tr[0], tr[1], tr[1], tr[2]]) : t === 2 ? D.dia('w2', TI[2].w) : D.dia('m' + t, T.m);
    s += C(0, 7, 2, pom);
    if (t === 5 && !lo) s += CN(0, 7, .85, T.gem, `class="hr-rune"`);
    s += P('M-1.25-2.4H1.25V5.6H-1.25Z', D.cyl('h' + t, [g[0], g[0], g[0], g[1], g[2]]));
    if (!lo) s += S('M-1.2-1.4l2.4 1.2M-1.2.6l2.4 1.2M-1.2 2.6l2.4 1.2', g[2], .45);
    if (t === 1 && !lo) s += S('M-1.3 3.4l2.6 1M-1.3 4.4l2.6 1', '#c9a96a', .5);
    // siper
    const gcol = t >= 4 ? D.dia('tr' + t, [tr[0], tr[1], tr[1], tr[2]]) : t === 2 ? D.dia('w2', TI[2].w) : D.dia('m' + t, T.m);
    if (t <= 2) {
      s += P('M-7-3.8H7L7.3-2.2H-7.3Z', gcol);
      if (t === 2) s += C(-7.6, -3, 1.3, gcol) + C(7.6, -3, 1.3, gcol);
      else s += C(-7.6, -3, .9, gcol) + C(7.6, -3, .9, gcol);
    } else if (t === 3) {
      s += P('M-7.6-6.4C-6-3.6-3.4-3 0-3s6-.6 7.6-3.4C7.4-1.6 4.6-1.6 0-1.6S-7.4-1.6-7.6-6.4Z', gcol);
    } else {
      const w = t === 5 ? 9.4 : 8;
      s += P(`M-${w}-${w}C-${w - 2}-4-4-3.2 0-3.2S${w - 2}-4 ${w}-${w}C${w - 1}-2.6 5-1.4 0-1.4S-${w - 1}-2.6-${w}-${w}Z`, gcol);
      if (!lo) s += S(`M-${w - 1.6}-${w - 2.2}C-${w - 3}-4.6-3.6-4 0-4`, tr[0], .4, op(.8));
      s += C(0, -2.4, t === 5 ? 1.5 : 1.25, T.gem, t === 5 ? `class="hr-rune"` : '');
      if (!lo) s += CN(-.4, -2.8, .45, '#fff', op(.8));
    }
    return s;
  }

  ITEM.kilic = (t, D, lo, short) => {
    const T = TI[t], w = T.w, L = short ? 36 : 44;
    let s = '';
    const bd = `M-2.3-3.6H2.3L2.1-${L - 5}L0-${L}L-2.1-${L - 5}Z`;
    s += P(bd, D.cyl('w' + t + 'b', [w[0], w[1], w[1], w[2], w[3]]));
    if (!lo) {
      s += S(`M0-6V-${L - 7}`, w[3], .7, op(.8)) + S(`M-.5-6V-${L - 7}`, w[0], .35, op(.8));
      s += N(`M-2.1-4.2L-1.6-4.2-1.5-${L - 6}-0.4-${L - 1.4}-2-${L - 5}Z`, '#fff', op(.35));
      if (t === 1) s += bladeRust(lo) + N(`M2.2-18l-.8.4.7.5ZM2.1-27l-.7.3.6.5Z`, '#2a2622');
      if (t >= 4) s += S(`M-1-6.5C0-8 .9-8.8 0-10.4`, T.tr[1], .4);
      if (T.rune) s += `<g filter="${D.glow()}">${runeRow(-.9, -9, 1, .55, .5)}${S(`M0-11V-${L - 8}`, RUNE, .6, 'class="hr-rune" stroke-dasharray="2.4 1.2"')}</g>`;
    } else if (T.rune) s += S(`M0-6V-${L - 6}`, RUNE, 1.4, 'class="hr-rune"');
    return s + hilt(t, T, D, lo);
  };

  ITEM.kkalkan = (t, D, lo) => ITEM.kilic(t, D, lo, true);

  ITEM.pala = (t, D, lo) => {
    const T = TI[t], w = T.w;
    let s = '';
    const bd = 'M-2.1-3.6C-2-17 .8-30 6.4-39.8L7.6-39.2 10-44.8C10.4-37 8.6-29.4 6.6-23.4 4.8-17 3-10.6 2.3-3.6Z';
    s += P(bd, D.cyl('w' + t + 'b', [w[0], w[1], w[1], w[2], w[3]]));
    if (!lo) {
      s += S('M-.2-6C-.2-17 2.4-28 6.6-36.6', w[3], .6, op(.75));
      s += N('M-1.9-4.4L-1.3-4.4C-1-16 1.6-28 6.2-38.6L6.1-38.9C1.2-29-1.8-17-1.9-4.4Z', '#fff', op(.4));
      if (t === 1) s += N('M.8-15c.7-.3 1.2.3.8.8-.5.4-1.1 0-.8-.8ZM3.6-27c.5-.2.9.4.5.7-.4.3-.9-.1-.5-.7Z', '#7a4a2a', op(.8));
      if (T.rune) s += `<g filter="${D.glow()}">${S('M.6-9C.8-19 3-28 7-36', RUNE, .6, 'class="hr-rune" stroke-dasharray="2.2 1.1"')}</g>`;
    } else if (T.rune) s += S('M.4-6C.6-18 3-28 7-36', RUNE, 1.4, 'class="hr-rune"');
    return s + hilt(Math.min(t, 2) === t ? t : t, T, D, lo);
  };

  ITEM.katana = (t, D, lo, hiltOnly) => {
    const T = TI[t], w = T.w, g = T.h;
    let s = '';
    const bd = 'M-2-3C-1.8-20-.2-35 3.4-48.6 4.6-46.4 4.6-44.4 4-42.2 2.2-30 2-16 2.1-3Z';
    if (!hiltOnly) s += P(bd, D.cyl('w' + t + 'k', [w[0], w[1], w[1], w[2], w[3]]));
    if (hiltOnly) { /* kın içinde: yalnız kabza */ } else if (!lo) {
      s += S('M.6-5C.6-12 .2-16 1-21S1.2-30 2.2-35 2.6-42 3.2-45', w[0], .5, op(.9));
      if (t === 1) s += N('M-.6-17c.6-.2 1 .3.7.7-.4.3-1 0-.7-.7ZM.8-31c.5-.2.9.3.5.6-.4.3-.8 0-.5-.6Z', '#7a4a2a', op(.8));
      if (T.rune) s += `<g filter="${D.glow()}">${S('M.2-8C.2-20 1-32 3-42', RUNE, .55, 'class="hr-rune" stroke-dasharray="1.6 1"')}</g>`;
    } else if (T.rune) s += S('M.1-6C.2-20 1-32 3-42', RUNE, 1.3, 'class="hr-rune"');
    // habaki + tsuba
    const gold = t >= 4 ? D.dia('tr' + t, [T.tr[0], T.tr[1], T.tr[1], T.tr[2]]) : t === 2 ? D.dia('w2', TI[2].w) : D.dia('m' + t, T.m);
    s += P('M-1.9-4.6H2V-2.6H-1.9Z', gold);
    s += `<ellipse cx="0" cy="-2" rx="${t >= 4 ? 4.2 : 3.6}" ry="1.4" fill="${t >= 3 ? gold : '#3a2e26'}"/>`;
    // uzun kabza (iki el)
    s += P('M-1.4-1H1.4L1.5 11H-1.5Z', D.cyl('h' + t, [g[0], g[0], g[0], g[1], g[2]]));
    if (!lo) {
      const wrap = t === 1 ? '#c0a578' : t === 2 ? '#d8b27e' : t === 3 ? '#20242a' : t === 4 ? '#e7c26a' : '#e7c26a';
      s += S('M-1.4 0l2.8 2-2.8 2 2.8 2-2.8 2 2.8 2M1.4 0l-2.8 2 2.8 2-2.8 2 2.8 2-2.8 2', wrap, .42);
    }
    s += P('M-1.6 10.6H1.6L1.4 12.6H-1.4Z', gold);
    return s;
  };

  ITEM.gurz = (t, D, lo) => {
    const T = TI[t], w = T.w, g = T.h;
    let s = '';
    s += P('M-1.3 6.4H1.3L1.1-31H-1.1Z', D.cyl('h' + t + 'f', [g[0], g[0], g[1], g[1], g[2]]));
    if (!lo) s += S('M-1.2-1l2.4 1.4M-1.2 1l2.4 1.4M-1.2 3l2.4 1.4', t === 1 ? '#c9a96a' : g[2], .5);
    s += C(0, 7, 1.7, D.dia('m' + t, T.m));
    const hd = D.rad('w' + t + 'r', [[0, w[0]], [.45, w[1]], [.8, w[2]], [1, w[3]]], .35, .3, .75);
    const cy = -36.4;
    if (t === 1) {
      let k = '';
      for (let i = 0; i < 7; i++) { const a = i / 7 * Math.PI * 2; k += C((Math.cos(a) * 5).toFixed(2), (cy + Math.sin(a) * 5).toFixed(2), 1.5, hd); }
      s += k + C(0, cy, 5.2, hd);
      if (!lo) s += N(`M-1.8${cy + 1}c.8-.4 1.6.3 1 1-.6.6-1.6.1-1-1ZM1.8${cy - 2}c.6-.2 1 .4.6.7-.4.3-1 0-.6-.7Z`, '#7a4a2a', op(.85));
    } else if (t === 2 || t === 5) {
      const n = t === 5 ? 10 : 9, R = t === 5 ? 9.4 : 8.2, r = 4.4;
      let d = '';
      for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r : R; d += (i ? 'L' : 'M') + (Math.cos(a) * rr).toFixed(2) + ' ' + (cy + Math.sin(a) * rr).toFixed(2); }
      s += P(d + 'Z', hd) + C(0, cy, 4.8, hd);
      if (t === 5) s += C(0, cy, 2.6, '#1c2030') + `<g filter="${D.glow()}">${C(0, cy, 1.7, RUNE, 'class="hr-rune" stroke="none"')}${S(`M-3.6 ${cy}a3.6 3.6 0 1 0 7.2 0a3.6 3.6 0 1 0-7.2 0`, RUNE, .45, 'class="hr-rune" stroke-dasharray="1 .8"')}</g>`;
      else if (!lo) s += S(`M-2.6 ${cy - 1.8}a3.2 3.2 0 0 1 4-1.2`, w[0], .6);
    } else {
      // flanşlı topuz
      let f = '';
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4, c = Math.cos(a), sn = Math.sin(a), R = (x, y) => `${(x * c - y * sn).toFixed(1)} ${(cy + x * sn + y * c).toFixed(1)}`;
        f += `M${R(-1.2, -3)}L${R(-1.6, -8.4)}Q${R(0, -9.4)} ${R(1.6, -8.4)}L${R(1.2, -3)}Z`;
      }
      s += P(f, hd) + C(0, cy, 4.4, hd);
      if (t === 4) s += C(0, cy, 3, D.dia('tr4', [T.tr[0], T.tr[1], T.tr[1], T.tr[2]])) + C(0, cy, 1.5, T.gem) + CN(-.5, cy - .5, .5, '#fff', op(.8));
      else s += C(0, cy, 2, w[2]) + CN(-.6, cy - .6, .7, '#fff', op(.6));
    }
    const col = t >= 4 ? D.dia('tr' + t, [T.tr[0], T.tr[1], T.tr[1], T.tr[2]]) : t === 2 ? D.dia('w2', w) : D.dia('m' + t, T.m);
    s += P('M-1.9-31.8H1.9L1.6-29.6H-1.6Z', col);
    return s;
  };

  ITEM.kazma = (t, D, lo) => {
    const T = TI[t], w = T.w, g = t === 1 ? ['#c4a678', '#9c7e54', '#6a5236'] : T.h;
    let s = '';
    s += P('M-1.3 6.4H1.3L1.1-33.2H-1.1Z', D.cyl('h' + t + 'w', [g[0], g[0], g[1], g[1], g[2]]));
    if (!lo) s += S('M-1.2 0l2.4 1.4M-1.2 2l2.4 1.4M-1.2 4l2.4 1.4', t === 1 ? '#5a4a34' : t >= 4 ? T.cl[1] : '#2a1e14', .7);
    const hd = D.dia('w' + t + 'p', [w[0], w[1], w[2], w[3]]);
    s += P('M-1.8-37.6C-6-37.6-10.8-35.4-14.2-31.2-10.4-33.2-6-34.2-1.8-33.8ZM1.8-37.8C7-38 12.8-35.4 16.6-28 11.4-32.4 6.4-34 1.8-33.8Z', hd);
    if (!lo) s += S('M2.4-37.2C7-37.2 12-35 15.2-30.2M-2.4-37C-6-36.8-9.6-35.4-12.4-32.8', w[0], .45, op(.9));
    if (t >= 4 && !lo) s += S('M3-34.6C8-34.6 12.4-32.6 15.6-29', T.tr[1], .5);
    if (T.rune) s += `<g filter="${D.glow()}">${S('M3-35C8-35 12.4-33 15.6-29.4', RUNE, lo ? 1.2 : .6, 'class="hr-rune"')}</g>`;
    const sock = t >= 4 ? D.dia('tr' + t, [T.tr[0], T.tr[1], T.tr[1], T.tr[2]]) : t === 1 ? '#b59a6a' : D.dia('m3', TI[3].tr.concat(['#22272c']));
    s += P('M-2.5-39H2.5V-32.4H-2.5Z', sock);
    if (t === 1 && !lo) s += S('M-2.5-37.6h5M-2.5-36h5M-2.5-34.4h5', '#7a6040', .5);
    if (t >= 4) s += C(0, -35.7, 1.2, T.gem, t === 5 ? 'class="hr-rune"' : '');
    return s;
  };

  ITEM.balta = (t, D, lo) => {
    const T = TI[t], w = T.w, g = t === 1 ? ['#c4a678', '#9c7e54', '#6a5236'] : T.h;
    let s = '';
    s += P('M-1.3 6.4H1.3L1.1-32H-1.1Z', D.cyl('h' + t + 'w', [g[0], g[0], g[1], g[1], g[2]]));
    if (!lo) s += S('M-1.2 0l2.4 1.4M-1.2 2l2.4 1.4M-1.2 4l2.4 1.4', t === 1 ? '#5a4a34' : t >= 4 ? T.cl[1] : '#2a1e14', .7);
    const hd = D.dia('w' + t + 'p', [w[0], w[1], w[2], w[3]]);
    const big = t === 5 ? 1.25 : t >= 3 ? 1.1 : 1;
    s += G(`translate(0 -29) scale(${big}) translate(0 29)`,
      P('M1.6-34.2L4.6-33.4C7.6-35.8 10.4-37.8 12.6-38.2 13.8-33.8 13.8-27.6 12.6-23.2 10.4-23.6 7.6-25.4 4.6-27.6L1.6-26.8Z', hd) +
      (t === 5 ? P('M-1.6-33.8L-3.6-33.2C-5.6-35-7.4-36-8.6-36.2-9.6-33-9.6-28.6-8.6-25.8-7.4-26-5.6-27-3.6-28.4L-1.6-27.6Z', hd) : P('M-1.6-33.8H-4V-28H-1.6Z', hd)) +
      (lo ? '' : S('M12.4-37.4C13.4-33.6 13.4-28 12.4-24', w[0], .6) + N('M5-32.6C7.4-34 9.6-35.6 11.4-36.4 11.8-33 11.6-30 11.2-28 9-28.6 7-29.8 5-31Z', '#fff', op(.18))) +
      (t >= 4 && !lo ? S('M11.4-36C12.2-32.6 12.2-28.6 11.4-25.4', T.tr[1], .5) : '') +
      (T.rune ? `<g filter="${D.glow()}">${S('M10.8-35.4C11.8-32 11.8-28.6 10.8-25.6', RUNE, lo ? 1.1 : .6, 'class="hr-rune"')}</g>` : ''));
    const sock = t >= 4 ? D.dia('tr' + t, [T.tr[0], T.tr[1], T.tr[1], T.tr[2]]) : t === 1 ? '#b59a6a' : D.dia('m3', TI[3].tr.concat(['#22272c']));
    s += P('M-2.3-34.6H2.3V-27H-2.3Z', sock);
    if (t === 1 && !lo) s += S('M-2.3-33h4.6M-2.3-31.2h4.6M-2.3-29.4h4.6', '#7a6040', .5);
    if (t >= 4) s += C(0, -30.8, 1.15, T.gem, t === 5 ? 'class="hr-rune"' : '');
    return s;
  };

  ITEM.orak = (t, D, lo) => {
    const T = TI[t], w = T.w, g = t === 1 ? ['#c4a678', '#9c7e54', '#6a5236'] : T.h;
    let s = '';
    const hd = D.dia('w' + t + 'p', [w[0], w[1], w[2], w[3]]);
    s += P('M-1.2-7.4C-.6-15-3-22.4-9.4-24.4-14.4-25.8-18.4-22.2-17.8-16.4-16.6-20.6-13.4-22.6-9.8-21.6-4.6-20.2-2.2-14.6 1.6-7.4Z', hd);
    if (!lo) s += S('M1-8.6C-1.8-14.6-4.4-19.6-9.6-20.8-13-21.6-16-20-17.4-17', w[0], .5, op(.9));
    if (t === 1 && !lo) s += N('M-6.6-22.6c.7-.2 1.1.4.7.8-.4.3-1 0-.7-.8ZM-13.4-23c.5 0 .7.5.3.7-.4.2-.7-.2-.3-.7Z', '#7a4a2a', op(.85));
    if (T.rune) s += `<g filter="${D.glow()}">${S('M-.4-10C-2.6-16-5.4-20.6-10-21.8', RUNE, lo ? 1.1 : .55, 'class="hr-rune" stroke-dasharray="1.6 1"')}</g>`;
    s += P('M-1.6 7C-1.9 3-1.7-2-1.3-6H1.5C1.9-2 2.1 3 1.7 7Z', D.cyl('h' + t + 'w', [g[0], g[0], g[1], g[1], g[2]]));
    if (!lo) s += S('M-1.6 1.4l3.2 1M-1.7 3.2l3.3 1', t === 1 ? '#5a4a34' : '#2a1e14', .5);
    const fer = t >= 4 ? D.dia('tr' + t, [T.tr[0], T.tr[1], T.tr[1], T.tr[2]]) : t === 1 ? '#b59a6a' : D.dia('m' + t, T.m);
    s += P('M-1.8-8.4H1.8V-5.4H-1.8Z', fer);
    if (t >= 4) s += C(0, 7.6, 1, T.gem, t === 5 ? 'class="hr-rune"' : '');
    return s;
  };

  ITEM.bicak = (t, D, lo) => {
    const T = TI[t], w = T.w;
    const g = t === 3 ? ['#efe6d0', '#d6caa8', '#9e9272'] : t === 5 ? ['#f4ecd6', '#e0d4b4', '#a89a76'] : t === 1 ? ['#a68858', '#7d6040', '#4e3a24'] : T.h;
    let s = '';
    s += P('M-2.2-3.8C-3.6-9.4-3-16 .4-22.6 3.2-17 4-10 2.2-3.8Z', D.cyl('w' + t + 'n', [w[0], w[1], w[1], w[2], w[3]]));
    if (!lo) s += N('M-1.8-4.4C-2.8-9.6-2.2-15.6.2-21-1.2-15.2-1.4-9.6-1-4.4Z', '#fff', op(.4)) + S('M.2-5.6C.4-11 .6-15 .4-19', w[3], .45, op(.7));
    if (t === 1 && !lo) s += N('M-.8-12c.6-.3 1.1.2.8.7-.4.4-1 .1-.8-.7ZM.8-17c.4-.1.8.3.4.6-.3.2-.7 0-.4-.6Z', '#7a4a2a', op(.85));
    if (T.rune) s += `<g filter="${D.glow()}">${runeRow(-.6, -9, 3, .45, .5)}</g>`;
    const gd = t >= 4 ? D.dia('tr' + t, [T.tr[0], T.tr[1], T.tr[1], T.tr[2]]) : t === 1 ? '#c9a96a' : D.dia('m' + t, T.m);
    s += P('M-2.9-4.4H2.9V-2.8H-2.9Z', gd);
    s += P('M-1.5-2.8H1.5L1.7 5.6H-1.7Z', D.cyl('h' + t + 'n', [g[0], g[0], g[1], g[1], g[2]]));
    if (!lo) {
      if (t === 1) s += S('M-1.6-1.4l3.2 1.2M-1.6.4l3.2 1.2M-1.6 2.2l3.2 1.2', '#c9a96a', .5);
      else if (t === 3) s += S('M-1.5-1.2h3M-1.5.6h3M-1.6 2.4h3.2', '#9e9272', .35);
      else s += CN(0, -.6, .45, '#e7c26a') + CN(0, 2.6, .45, '#e7c26a');
      if (t === 4) s += S('M-.8-2C.6 0-.8 2 .6 4.6', T.tr[1], .4);
    }
    s += P('M-1.9 5.4H1.9L1.5 7.2H-1.5Z', gd);
    if (t >= 4) s += C(0, 7.6, .9, T.gem, t === 5 ? 'class="hr-rune"' : '');
    return s;
  };

  // olta: misina dünyada aşağı sarkar, burada yalnız kamış
  ITEM.olta = (t, D, lo) => {
    const T = TI[t], g = t === 1 ? ['#b49a6a', '#8c7448', '#5a4a30'] : T.h;
    let s = '';
    const rod = t === 1 ? D.cyl('rd1', ['#b49a6a', '#a08458', '#8a7048', '#6a5436', '#4a3a24']) : t === 2 ? D.cyl('rd2', ['#9a7250', '#7c583a', '#6a4a30', '#4a321e', '#2e1e12']) :
      t === 3 ? D.cyl('rd3', ['#8a6e50', '#6e5238', '#5a4430', '#3e2e1e', '#241a10']) : D.cyl('rd' + t, [T.h[0], T.h[0], T.h[1], T.h[2], '#10111a']);
    if (t === 1) s += P('M-1.3 6.4C-1.4 0-.6-12-.9-24-.7-36-.2-50 .2-63H.9C.9-50 .7-36 .7-24 .9-12 1.4 0 1.3 6.4Z', rod) + (lo ? '' : S('M-.9-20l-1.6-2.4M.6-38l1.4-2', '#8a7048', .55) + S('M-1.3 0l2.6 1.4M-1.3 2l2.6 1.4M-1.3 4l2.6 1.4', '#d6be8a', .55));
    else s += P(lo ? 'M-1.7 6.4L-.75-63H.75L1.7 6.4Z' : 'M-1.3 6.4L-.32-63H.32L1.3 6.4Z', rod);
    if (t >= 2) {
      const rc = t === 2 ? '#c98a4e' : t === 3 ? '#cfd6dc' : '#e7c26a';
      if (!lo) for (const y of [-14, -28, -41, -53]) s += `<circle cx="${(.9 + (y + 63) * .006).toFixed(2)}" cy="${y}" r=".95" fill="none" stroke="${rc}" stroke-width=".45"/>`;
      s += P('M-1.6-3H1.6V6.4H-1.6Z', t === 3 ? D.cyl('ck', ['#e6cfa0', '#e6cfa0', '#c9ad7a', '#a88c5c', '#7a6440']) : D.cyl('h' + t + 'r', [g[0], g[0], g[1], g[1], g[2]]));
      // makara
      const rl = t === 2 ? D.dia('w2', TI[2].w) : t >= 4 ? D.dia('tr' + t, [T.tr[0], T.tr[1], T.tr[1], T.tr[2]]) : D.dia('m3', TI[3].m);
      s += P('M1.4 1.2H3.2V2.6H1.4Z', '#2a2420') + C(4.4, 1.9, 2.1, rl) + C(4.4, 1.9, .8, t >= 4 ? T.gem : '#2a2420', t === 5 ? 'class="hr-rune"' : '');
    }
    if (T.rune) s += `<g filter="${D.glow()}">${S('M0-6V-60', RUNE, lo ? 1 : .4, 'class="hr-rune" stroke-dasharray="3 2"')}</g>`;
    return s;
  };
  const ROD_TIP = 63;

  /* ---------- kalkan (kılıç & kalkan) — merkez (0,0), yarıçap 12 ---------- */
  function shield(t, D, lo) {
    const T = TI[t];
    let s = '';
    const rim = t >= 4 ? D.dia('tr' + t, [T.tr[0], T.tr[1], T.tr[1], T.tr[2]]) : t === 2 ? D.dia('w2', TI[2].w) : D.dia('m' + t, T.m);
    s += C(0, 0, 12, rim);
    const face = t === 1 ? D.soft('sh1', ['#c9a46c', '#a8834e', '#6e5430']) : t === 2 ? D.soft('sh2', ['#b06a44', '#8e4a2c', '#5a2c18']) :
      t === 3 ? D.soft('sh3', ['#7a8696', '#56606e', '#353c46']) : t === 4 ? D.soft('sh4', ['#8a60c0', '#5e3a8a', '#3a2258']) : D.soft('sh5', ['#3e4560', '#2a2f45', '#171a28']);
    s += C(0, 0, 10.2, face);
    if (t === 1) {
      if (!lo) s += S('M-5-9.2V9.2M0-10.2V10.2M5-9.2V9.2', '#5e4628', .55) + N('M-3.6-6c1-.4 1.6.4 1 1-.6.5-1.6 0-1-1ZM6-3c.6-.2.9.5.4.8-.5.2-.9-.3-.4-.8Z', '#4a3420', op(.6));
    } else if (t === 2) {
      s += N('M-1.6-10.2H1.6V10.2H-1.6ZM-10.2-1.6H10.2V1.6H-10.2Z', '#eadcbc');
    } else if (t === 3) {
      s += N('M-8.4-6.4L-6.4-8.4 8.4 6.4 6.4 8.4ZM8.4-6.4L6.4-8.4-8.4 6.4-6.4 8.4Z', D.dia('m3', T.m));
      if (!lo) for (const [x, y] of [[-6, -6], [6, -6], [-6, 6], [6, 6]]) s += rivet(x, y, .7, '#4b525a', '#fff');
    } else if (t === 4) {
      let r = '';
      for (let i = 0; i < 12; i++) r += G(`rotate(${i * 30})`, '<path d="M-.9-4.4L0-9 .9-4.4Z"/>');
      s += `<g fill="${T.tr[1]}" stroke="none">${r}</g>` + S('M-8.6 0a8.6 8.6 0 1 0 17.2 0a8.6 8.6 0 1 0-17.2 0', T.tr[1], .5, op(.8));
    } else {
      s += `<g filter="${D.glow()}">${S('M-7.4 0a7.4 7.4 0 1 0 14.8 0a7.4 7.4 0 1 0-14.8 0', RUNE, lo ? 1.2 : .7, 'class="hr-rune" stroke-dasharray="1.4 1.1"')}${lo ? '' : S('M-9.2 0a9.2 9.2 0 1 0 18.4 0a9.2 9.2 0 1 0-18.4 0', T.tr[1], .5)}</g>`;
    }
    // umbo
    const boss = t >= 4 ? D.dia('tr' + t, [T.tr[0], T.tr[1], T.tr[1], T.tr[2]]) : t === 2 ? D.dia('w2', TI[2].w) : D.dia('m' + Math.max(t, 1), T.m);
    s += C(0, 0, t >= 4 ? 4 : 3.4, boss);
    if (t >= 4) s += C(0, 0, 2, t === 5 ? '#0e2a2c' : T.gem) + (t === 5 ? `<g filter="${D.glow()}">${CN(0, 0, 1.5, RUNE, 'class="hr-rune"')}</g>` : CN(-.6, -.6, .6, '#fff', op(.8)));
    else s += CN(-1, -1.1, 1.1, '#fff', op(.55));
    if (!lo) s += N('M-11-3.4A11.4 11.4 0 0 1 3.4-11 11 11 0 0 0-9-1.6Z', '#fff', op(.22)) + N('M11 3A11.4 11.4 0 0 1-3 11 11 11 0 0 0 9.4 1Z', '#000', op(.25));
    if (t <= 3 && !lo) for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + .39; s += rivet(+(Math.cos(a) * 11.1).toFixed(2), +(Math.sin(a) * 11.1).toFixed(2), .55, t === 2 ? '#8a5528' : '#55514c', '#fff'); }
    return s;
  }

  // kın: kılıç/pala/katana bıçağını örter (yerel, uç yukarı)
  function sheath(line, t, D, lo) {
    const T = TI[t];
    const body = line === 'katana' ? (t === 1 ? '#3a2c22' : t === 2 ? '#5a2e1c' : t === 3 ? '#1c1f24' : t === 4 ? '#3c245c' : '#1a1c28') :
      t === 1 ? '#5e4430' : t === 2 ? '#6e4024' : t === 3 ? '#2e2a26' : t === 4 ? '#3c245c' : '#20222e';
    const fit = t >= 4 ? D.dia('tr' + t, [T.tr[0], T.tr[1], T.tr[1], T.tr[2]]) : t === 2 ? D.dia('w2', TI[2].w) : D.dia('m' + t, T.m);
    const Lb = line === 'kkalkan' ? 36 : line === 'katana' ? 47 : 44;
    let d;
    if (line === 'katana') d = 'M-2.2-3C-2-20-.4-35 3-48.4 4.6-47 5-45 4.4-43 2.6-30 2.4-16 2.6-3Z';
    else if (line === 'pala') d = 'M-2.8-3C-2.6-17 .2-30 6-40.4L10.4-44.6C10.8-36 9-29 7-23 5.2-16.6 3.6-10 3-3Z';
    else d = `M-3-3H3L2.8-${Lb - 4}L0-${Lb + 1}L-2.8-${Lb - 4}Z`;
    let s = P(d, D.cyl('sb' + t + line[0], [mix(body, '#fff', 70), mix(body, '#fff', 75), mix(body, '#fff', 88), body, mix(body, '#000', 60)]));
    if (!lo) s += S(line === 'katana' ? 'M-.4-6C-.2-20 1-32 3-42' : line === 'pala' ? 'M0-6C0-17 2.4-28 6.4-37' : `M0-6V-${Lb - 6}`, '#000', .4, op(.3));
    s += P('M-3.2-3.4H3.2V-.4H-3.2Z', fit);
    if (line === 'katana') s += P('M-1.2-16.6H3.2V-15H-1.2Z', fit);
    else if (line === 'pala') s += P('M6.2-41.2L10.6-45 10.4-41.6 7.2-38.6Z', fit);
    else s += P(`M-2.9-${Lb - 6}H2.9L2.8-${Lb - 4}L0-${Lb + 1}L-2.8-${Lb - 4}Z`, fit);
    if (t >= 4 && !lo && line !== 'katana') s += C(0, -12, .9, T.gem, t === 5 ? 'class="hr-rune"' : '');
    return s;
  }

  function itemOf(o) {
    if (!o) return null;
    if (o.line) return ITEM[o.line] ? { k: o.line, t: cl5(o.t) || 1, w: 1 } : null;
    return ITEM[o.kind] ? { k: o.kind, t: cl5(o.t) || 1, w: 0 } : null;
  }

  /* =====================================================================
     DOLL — 0 0 100 140, önden
     ===================================================================== */
  function doll(L, o, D) {
    const q = L.q || {};
    const helm = cl5(L.helm), chest = cl5(L.chest), glove = cl5(L.glove), boot = cl5(L.boot), bag = cl5(L.bag);
    const wpn = itemOf(L.weapon), tool = itemOf(L.tool);
    const held = o.hand === 'weapon' ? wpn : tool, stow = o.hand === 'weapon' ? tool : wpn;
    const out = [];
    const skin = D.rad('sk', [[0, SK[0]], [.45, SK[1]], [.85, SK[2]], [1, SK[3]]], .38, .32, .8);
    const skinC = D.cyl('skc', [SK[1], SK[0], SK[0], SK[2], SK[3]]);
    const mt = t => D.dia('m' + t, TI[t].m), mc = t => D.cyl('m' + t, TI[t].m);
    const trg = t => t >= 4 ? D.dia('tr' + t, [TI[t].tr[0], TI[t].tr[1], TI[t].tr[1], TI[t].tr[2]]) : t === 2 ? D.dia('w2', TI[2].w) : D.dia('t' + t, [TI[t].tr[0], TI[t].tr[0], TI[t].tr[1], TI[t].tr[2]]);
    const clg = t => D.soft('cl' + t, TI[t].cl), clc = t => D.cyl('cl' + t, [TI[t].cl[1], TI[t].cl[0], TI[t].cl[0], TI[t].cl[1], TI[t].cl[2]]);
    const rust = (d, a) => N(d, '#7a4a2a', op(a || .7));
    const glow = () => D.glow();

    /* ---- gölge ---- */
    out.push(EN(50, 133.6, 26, 3.6, '#000', op(.5)) + EN(50, 133.4, 15, 2.2, '#000', op(.4)));

    /* ---- pelerin (arkada) ---- */
    {
      const hem = 'M23.4 116.6Q29.6 113.4 36 117.6T50 118.4 64 117.6 76.6 116.6';
      const body = 'M37.4 31C31 38 27.6 62 23.4 116.6Q29.6 113.4 36 117.6T50 118.4 64 117.6 76.6 116.6C72.4 62 69 38 62.6 31Z';
      const cf = D.lin('cape', [[0, mix('var(--acc2)', 'var(--acc)', 78)], [.45, 'var(--acc2)'], [1, mix('var(--acc2)', '#000', 62)]], D.V);
      const csh = D.lin('capeh', [[0, '#fff', .1], [.35, '#000', 0], [.75, '#000', .22], [1, '#000', .5]], D.H);
      let c = P(body, cf) + N(body, csh);
      // kıvrımlar
      c += S('M41 34C36 52 33 80 30.6 114', '#000', 1.8, op(.22)) + S('M46 35C44 60 42.6 90 42.4 118', '#000', 1.6, op(.2)) + S('M55 35C56.6 60 57.6 90 58 118.6', '#000', 1.6, op(.24)) + S('M60 34C64.6 52 67.6 80 70 114.6', '#000', 1.8, op(.28));
      c += S('M38.6 36C34.4 56 31.6 84 27.8 114', '#fff', .9, op(.1)) + S('M43.6 36C40.6 60 37.6 90 36.6 116', '#fff', .7, op(.08)) + S('M50.6 36C50.6 62 50.2 92 50 117', '#fff', .7, op(.07));
      // kenar şeridi
      c += S('M37.4 31C31 38 27.6 62 23.4 116.6', 'var(--acc)', 1.5) + S('M62.6 31C69 38 72.4 62 76.6 116.6', mix('var(--acc)', '#000', 70), 1.5);
      c += S(hem, 'var(--acc)', 2.6) + S('M24.4 114.4Q30.2 111.4 36.2 115.4T50 116.2 63.8 115.4 75.6 114.4', mix('var(--acc)', '#000', 45), .45);
      c += S(hem, mix('var(--acc)', '#000', 55), .7, 'stroke-dasharray=".8 2.2" transform="translate(0 .2)"');
      out.push(`<g class="hr-cape">${c}</g>`);
    }

    /* ---- çanta (sırtta, sağ omuz arkası) ---- */
    let strapsFront = '';
    if (bag) {
      let b = '';
      if (bag <= 2) {
        const pc = bag === 1 ? ['#e6d4ac', '#c8b38a', '#8e7a56'] : ['#cf8a5a', '#a8643c', '#6a3a20'];
        const sk = D.soft('bg' + bag, pc);
        const sz = bag === 1 ? 1 : 1.08;
        b += G(`translate(73 52) scale(${sz}) translate(-73 -52)`,
          P('M66 33.4L68.6 27.6 70.6 31 73 26.8 75.4 31 77.4 27.6 80 33.4Z', sk) +
          P('M64.6 40C60.4 46 60 62 63.8 70.4 67.6 77.2 78.6 77.4 82.6 70.4 86.4 62.4 85.8 47 80.6 40 77.4 36.6 67.8 36.6 64.6 40Z', sk) +
          N('M80.6 40C85.8 47 86.4 62.4 82.6 70.4 80.4 74.4 76.4 76 72.4 76 78 72 80.4 60 78.6 44Z', '#000', op(.2)) +
          N('M66.4 42C64 48 63.6 56 64.6 62 65.6 54 67 47 69.6 42.4Z', '#fff', op(.22)) +
          P('M65.6 35.4C68 34 78 34 80.4 35.4L80.6 38.8C78 40 68 40 65.4 38.8Z', bag === 1 ? '#a89064' : '#8a4a28') +
          S('M66 37.4Q73 39.6 80 37.4', bag === 1 ? '#6e5a3a' : '#f0e2c0', .9) +
          (bag === 1 ? P('M69.6 52.6H76.2V58.6H69.6Z', '#b39c74') + S('M70.2 53.2H75.6V58H70.2Z', '#7e6a48', .3, 'stroke-dasharray=".6 .5"') + S('M68 64C71 65.4 76 65.6 80 64', '#8e7a56', .4, op(.8))
            : S('M62.6 60.6Q73 64.6 84.4 60.6', '#e2be72', 1.3) + S('M74 39.2C73.4 42 72.6 44 71.4 45.6M74 39.2C74.6 42 75.6 44 76.6 45.4', '#f0e2c0', .6) + C(71.3, 46.2, .9, '#2e2a26') + C(76.7, 46, .9, '#2e2a26')));
        // çapraz kayış (sağ omuzdan sol kalçaya)
        strapsFront = S('M38.6 32.4C46 42 54 52 63.4 62', bag === 1 ? '#7e6a48' : '#4e2c18', bag === 1 ? 2.4 : 2.8) +
          S('M38.6 32.4C46 42 54 52 63.4 62', bag === 1 ? '#c8b38a' : '#e8d8b4', bag === 1 ? 1.4 : 1.6) +
          (bag === 1 ? S('M38.6 32.4C46 42 54 52 63.4 62', '#8e7a56', 1.4, 'stroke-dasharray=".5 1"') : S('M38.6 32.4C46 42 54 52 63.4 62', '#b8a07a', .4, 'stroke-dasharray="1 1"'));
      } else {
        const lc = bag === 5 ? ['#fbf4e4', '#ece0c6', '#b8a684'] : ['#b07a4c', '#8a5a36', '#583620'];
        const lg = D.soft('bg' + bag, lc);
        const top = bag === 3 ? 28 : bag === 4 ? 27 : 25, bot = bag === 3 ? 70 : bag === 4 ? 72 : 74, rx = bag === 3 ? 84 : bag === 4 ? 85.4 : 87;
        const body = `M61 ${top + 3}Q61 ${top} 64.4 ${top}H${rx - 3.4}Q${rx} ${top} ${rx} ${top + 3.4}V${bot - 4}Q${rx} ${bot} ${rx - 4} ${bot}H65Q61 ${bot} 61 ${bot - 4}Z`;
        // kulp
        b += S(`M66.4 ${top + .4}C66.6 ${top - 5} 77 ${top - 5} 77.4 ${top + .4}`, bag === 5 ? '#2a2f45' : '#4a2e1a', 1.6);
        b += P(body, lg) + N(`M${rx - 4} ${top + 2}Q${rx - 1} ${top + 2} ${rx - 1} ${top + 6}V${bot - 4}Q${rx - 1} ${bot - 1} ${rx - 5} ${bot - 1}H70C${rx - 6} ${bot - 6} ${rx - 6} ${top + 10} ${rx - 4} ${top + 2}Z`, '#000', op(.22));
        // yan cep
        b += P(`M${rx - 1.2} ${bot - 18}H${rx + 1.6}Q${rx + 2.4} ${bot - 18} ${rx + 2.4} ${bot - 16}V${bot - 6}Q${rx + 2.4} ${bot - 4} ${rx + .6} ${bot - 4}H${rx - 1.2}Z`, lg);
        // kapak
        const fl = bag === 3 ? D.soft('bf3', ['#9a6a40', '#704828', '#482c16']) : bag === 4 ? clg(4) : D.soft('bf5', ['#3e4560', '#2a2f45', '#171a28']);
        const fb = top + (bag === 3 ? 17 : 19);
        b += P(`M61 ${top + 3}Q61 ${top} 64.4 ${top}H${rx - 3.4}Q${rx} ${top} ${rx} ${top + 3.4}V${fb - 3}Q${(61 + rx) / 2} ${fb + 3} 61 ${fb - 3}Z`, fl);
        b += S(`M62.4 ${fb - 3.6}Q${(61 + rx) / 2} ${fb + 1.6} ${rx - 1.4} ${fb - 3.6}`, bag === 3 ? '#c9a070' : '#e7c26a', .45, bag === 3 ? 'stroke-dasharray=".7 .6"' : '');
        // amblem
        if (bag === 3) b += S(`M69.6 ${top + 8}c1-2 3-2 3.4 0 .4-2 2.4-2 3.4 0`, '#d8b27e', .7);
        if (bag === 4) b += S(`M68.4 ${top + 9}c1.6-3 4.4-3 4.8 0 .4-3 3.2-3 4.8 0M73.2 ${top + 9}v3`, '#e7c26a', .8) + S(`M61.6 ${top + 3}H${rx - .6}`, '#e7c26a', .6);
        if (bag === 5) b += `<g filter="${glow()}">${runeRow(64.4, top + 5.6, 8, .55, .45)}</g>` + S(`M61.8 ${top + 8}H${rx - .8}`, '#e7c26a', .5);
        // tokalı kayışlar
        const sx = [66.4, rx - 6.4];
        const sc = bag === 5 ? '#2a2f45' : '#4a2e1a', bk = bag >= 4 ? '#e7c26a' : '#c9ccd0';
        for (const x of sx) b += P(`M${x - 1.1} ${fb - 4}H${x + 1.1}V${bot - 5}H${x - 1.1}Z`, sc) + P(`M${x - 1.6} ${fb - .6}H${x + 1.6}V${fb + 2.4}H${x - 1.6}Z`, 'none', `stroke="${bk}" stroke-width=".7"`);
        if (bag === 5) {
          // elmas desenli yan paneller
          let dm = '';
          for (let r = 0; r < 3; r++) for (let c2 = 0; c2 < 3; c2++) { const x = 64.6 + c2 * 7.4 + (r % 2) * 3.7, y = fb + 4 + r * 5; if (x < rx - 2) dm += `M${x} ${y}l1.8 2.2-1.8 2.2-1.8-2.2Z`; }
          b += N(dm, '#b4553a', op(.9)) + `<g filter="${glow()}">${CN(73.8, fb - 1, 1.4, RUNE, 'class="hr-rune"')}</g>` + C(73.8, fb - 1, 1.9, 'none', `stroke="#e7c26a" stroke-width=".6"`);
        }
        if (bag === 4) {
          // üstte rulo battaniye
          b += P(`M59.6 ${top - 5.4}H${rx + 1.4}Q${rx + 3} ${top - 2.8} ${rx + 1.4} ${top - .2}H59.6Q58 ${top - 2.8} 59.6 ${top - 5.4}Z`, D.vgr('roll', ['#e4d2a8', '#c4ac80', '#8a744e']));
          b += S(`M65 ${top - 5.4}V${top - .2}M${rx - 4} ${top - 5.4}V${top - .2}`, '#5a3a20', 1.1) + EN(59.8, top - 2.8, 1.1, 2.4, '#a89064');
          b += C(73.6, fb - .8, 1.3, TI[4].gem) + CN(73.2, fb - 1.2, .4, '#fff', op(.8));
        }
        out.push(`<g>${b}</g>`);
        // ön omuz kayışları
        const st = bag === 5 ? '#2a2f45' : bag === 4 ? '#5a3a22' : '#5e3c22';
        strapsFront = P('M38.4 31.6C40.4 32 41.8 33 42.4 34.6L41 53.4 37.6 53.8Z', st) + P('M61.6 31.6C59.6 32 58.2 33 57.6 34.6L59 53.4 62.4 53.8Z', st) +
          S('M39.8 34.8L39 52.4M60.2 34.8L61 52.4', bag === 5 ? '#e7c26a' : '#b88a5a', .35, 'stroke-dasharray=".7 .6"');
        if (bag >= 4) strapsFront += P('M40.4 44.6H59.6V46.6H40.4Z', st) + P('M48 43.8H52V47.4H48Z', 'none', `stroke="#e7c26a" stroke-width=".8"`);
        b = '';
      }
      if (b) out.push(`<g>${b}</g>`);
    }

    /* ---- sırttaki eşyalar (kalkan) ---- */
    const backShield = stow && stow.k === 'kkalkan';
    if (backShield) out.push(G('translate(30.6 50) scale(1.05)', shield(stow.t, D, 0)));
    if (stow && !stow.w && stow.k === 'olta') out.push(G('translate(55 78) rotate(24)', ITEM.olta(stow.t, D, 0)));

    /* ---- bacaklar ---- */
    {
      const pg = D.cyl('pt', [BASE.pants[1], BASE.pants[0], BASE.pants[0], BASE.pants[1], BASE.pants[2]]);
      let lg = P('M37.4 60H62.6L62.4 70.4 50 75 37.6 70.4Z', D.soft('pts', BASE.pants.slice(0, 3)));
      const legL = 'M38.4 64L50 66.4 49.6 76C48.6 86 47.2 94 46.8 100 46.2 108 46 115 45.8 123H37.4C37 115 36.6 108 36.2 100 35.6 92 35.6 80 38.4 64Z';
      const legR = 'M61.6 64L50 66.4 50.4 76C51.4 86 52.8 94 53.2 100 53.8 108 54 115 54.2 123H62.6C63 115 63.4 108 63.8 100 64.4 92 64.4 80 61.6 64Z';
      let lL = P(legL, pg), lR = P(legR, pg);
      lL += N('M50 66.4L49.6 76C48.6 86 47.2 94 46.8 100 46.2 108 46 115 45.8 123H44C44.4 112 45 100 46 92 47 84 48 74 50 66.4Z', '#000', op(.24));
      lR += N('M50 66.4L50.4 76C51.4 86 52.8 94 53.2 100 53.8 108 54 115 54.2 123H56C55.6 112 55 100 53.6 90 52.6 82 51.8 74 50 66.4Z', '#000', op(.28)) + N('M61.6 64C64.4 80 64.4 92 63.8 100 63.4 108 63 115 62.6 123H61C61.6 112 62.2 100 62.4 90 62.6 80 61.8 70 60.4 64.2Z', '#000', op(.2));
      lL += S('M38.6 88Q41 90 43.4 88.6M39 96.4Q41.6 98.4 44.6 96.6M40.6 76.4Q43 77.6 45.6 76.2', '#000', .45, op(.35)) + S('M39 72C38.4 80 38.6 88 39.4 96', '#fff', .7, op(.14));
      lR += S('M56.6 88.6Q59 90 61.4 88M55.4 96.6Q58.4 98.4 61 96.4M54.4 76.2Q57 77.6 59.4 76.4', '#000', .45, op(.35)) + S('M52.2 72C53 80 54 88 55 96', '#fff', .5, op(.1));
      out.push(lg);
      // çizmeler / ayakkabılar
      const foot = (m) => {
        const x = v => m ? 100 - v : v;
        const pt = arr => arr.map(([a, b]) => `${x(a).toFixed(1)} ${b}`).join(' ');
        if (!boot) {
          const sh = D.soft('shoe', BASE.shoe.slice(0, 3));
          let s = P(`M${pt([[37, 118.6]])}H${x(46.2)}C${pt([[46.6, 123], [47.4, 126.6], [47.8, 129]])}C${pt([[48.1, 131], [47, 132.6], [44.2, 132.6]])}H${x(34.4)}C${pt([[32.4, 132.6], [32.2, 130.6], [33.6, 129.2]])}C${pt([[35.6, 127.6], [37, 124], [37, 118.6]])}Z`, sh);
          s += P(`M${pt([[36.8, 118.4]])}H${x(46.4)}L${pt([[46.6, 121.4]])}H${x(36.6)}Z`, BASE.shoe[2]);
          s += S(`M${pt([[33, 131.2]])}H${x(47.6)}`, BASE.shoe[3], .8) + S(`M${pt([[38.6, 124.4], [40.6, 125.4], [43.6, 124.8]])}`, BASE.shoe[3], .45, op(.7));
          s += N(`M${pt([[38, 122]])}C${pt([[37.8, 125], [36.6, 127.4], [35, 129.2]])}L${pt([[37, 129.4]])}C${pt([[38.6, 127], [39.2, 124.6], [39.4, 122]])}Z`, '#fff', op(.15));
          return s;
        }
        const T = TI[boot];
        let s = '';
        // baldırlık
        s += P(`M${pt([[36.4, 92.6]])}C${pt([[36, 104], [36.6, 112], [36.8, 119]])}H${x(46.2)}C${pt([[46.4, 112], [46.8, 104], [46.8, 92.6]])}Z`, mc(boot));
        s += N(`M${pt([[44, 94]])}C${pt([[44.4, 104], [44, 112], [43.8, 119]])}H${x(46.2)}C${pt([[46.4, 112], [46.8, 104], [46.8, 94]])}Z`, '#000', op(.15));
        // ayaklık (sabaton) — üst üste plakalar
        const sab = mt(boot);
        s += P(`M${pt([[36.4, 117.6]])}H${x(46.6)}C${pt([[47.2, 122.6], [48.4, 126.4], [49, 128.8]])}C${pt([[49.3, 131.2], [48, 132.8], [44.8, 132.8]])}H${x(33.2)}C${pt([[31, 132.8], [30.8, 130.4], [32.4, 128.8]])}C${pt([[34.8, 126.8], [36.4, 123], [36.4, 117.6]])}Z`, sab);
        s += S(`M${pt([[36, 121.6], [41.6, 122.6], [47.2, 121.6]])}`.replace(/^M([^ ]+ [^ ]+) /, 'M$1Q'), T.m[4], .5) + S(`M${pt([[34.6, 126], [41.6, 127.4], [48.4, 126]])}`.replace(/^M([^ ]+ [^ ]+) /, 'M$1Q'), T.m[4], .5);
        s += S(`M${pt([[32.4, 131.6]])}H${x(48.6)}`, T.m[4], .8);
        s += N(`M${pt([[37.6, 119]])}C${pt([[37.6, 124], [36.4, 127], [34.4, 129.2]])}L${pt([[36.4, 129.4]])}C${pt([[38.4, 127], [39.2, 124], [39.2, 119]])}Z`, '#fff', op(.35));
        // diz kapağı (poleyn): üst lam, kubbe, alt lam; kanat T3+
        if (boot >= 3) s += P(`M${pt([[36.4, 93.6]])}L${pt([[31.6, 90.8], [32.8, 95.6], [31.8, 99.6], [36.4, 98.4]])}Z`, boot >= 4 ? trg(boot) : mt(boot)) + S(`M${pt([[35.6, 94.4]])}L${pt([[33.2, 93]])}M${pt([[35.6, 96.6]])}L${pt([[33.4, 97.4]])}`, boot >= 4 ? T.tr[2] : T.m[3], .4);
        s += P(`M${pt([[36.8, 92.8]])}Q${pt([[41.6, 89.6], [46.4, 92.8]])}L${pt([[46.6, 94.4]])}Q${pt([[41.6, 91.6], [36.6, 94.4]])}Z`, mt(boot));
        const cop = `M${pt([[36.1, 94]])}C${pt([[37.8, 91.8], [45.4, 91.8], [47.1, 94]])}C${pt([[47.6, 97], [45.8, 99.8], [41.6, 101.2]])}C${pt([[37.4, 99.8], [35.6, 97], [36.1, 94]])}Z`;
        s += P(`M${pt([[36.8, 99.4]])}Q${pt([[41.6, 103.4], [46.4, 99.4]])}L${pt([[46, 101.8]])}Q${pt([[41.6, 105.4], [37.2, 101.8]])}Z`, mt(boot));
        s += P(cop, D.rad('kn' + boot, [[0, T.m[0]], [.4, T.m[1]], [.8, T.m[2]], [1, T.m[3]]], .35, .3, .8));
        s += N(`M${pt([[41.6, 92.4]])}C${pt([[44, 92.4], [46.2, 92.8], [47.1, 94]])}C${pt([[47.6, 97], [45.8, 99.8], [41.6, 101.2]])}Z`, '#000', op(.18));
        s += S(`M${pt([[41.6, 92.6]])}V100.6`, T.m[0], .55, op(.8)) + S(`M${pt([[42.2, 92.8]])}V100.4`, T.m[4], .35, op(.5));
        if (boot >= 4) s += S(cop, T.tr[1], .5);
        const rv = boot === 2 ? TI[2].tr[1] : boot === 3 ? '#5a636c' : boot >= 4 ? T.tr[1] : '#5e5a55';
        s += rivet(x(38), 94.8, .5, rv) + rivet(x(45.2), 94.8, .5, rv);
        if (boot >= 4) s += C(x(41.6), 95.4, .75, T.gem, boot === 5 ? 'class="hr-rune"' : '');
        s += S(`M${pt([[36.6, 117.4]])}Q${pt([[41.6, 118.8], [46.4, 117.4]])}`, T.m[4], .5);
        // seviye süsleri
        if (boot === 1) {
          s += P(`M${pt([[36.2, 105]])}H${x(46.6)}V107.4H${x(36.2)}Z`, D.soft('str', ['#8a6646', '#6a4a30', '#46301e'])) + P(`M${pt([[36.4, 112]])}H${x(46.4)}V114.4H${x(36.4)}Z`, D.soft('str', ['#8a6646', '#6a4a30', '#46301e']));
          s += P(`M${pt([[43.2, 104.6]])}H${x(45.2)}V107.8H${x(43.2)}Z`, '#8e8982');
          s += rust(`M${pt([[39, 100]])}c.9-.4 1.6.3 1.1 1-.6.6-1.6.2-1.1-1ZM${pt([[44, 110]])}c.7-.3 1.2.3.8.8-.4.4-1.1 0-.8-.8ZM${pt([[40, 124]])}c.8-.3 1.4.3 1 .9-.5.5-1.3.1-1-.9Z`);
        }
        if (boot === 2) s += S(`M${pt([[36.3, 108]])}H${x(46.6)}`, TI[2].tr[1], 1.1) + rivet(x(38.4), 108, .5, TI[2].tr[2]) + rivet(x(44.6), 108, .5, TI[2].tr[2]) + rivet(x(41.6), 124.6, .9, TI[2].tr[1]);
        if (boot === 3) s += S(`M${pt([[39.6, 102]])}V117M${pt([[43.4, 102]])}V117`, T.m[3], .45) + rivet(x(41.6), 124.4, .8, '#5a636c');
        if (boot >= 4) {
          s += S(`M${pt([[37, 104], [41.6, 110], [46.2, 104]])}`.replace(/^M([^ ]+ [^ ]+) /, 'M$1Q'), T.tr[1], .55) + S(`M${pt([[41.6, 106], [41.6, 117]])}`, T.tr[1], .45);
          // mahmuz
          s += S(`M${pt([[36.8, 128], [32.4, 127]])}`, T.tr[1], .8) + G(`translate(${x(31.6)} 127)`, `<path d="M0-1.6L.4-.4 1.6 0 .4.4 0 1.6-.4.4-1.6 0-.4-.4Z" fill="${T.tr[1]}"/>`);
        }
        if (boot === 5) s += `<g filter="${glow()}">${runeRow(x(39.6) - (m ? 2.4 : 0), 112.6, 2, .55, .45)}</g>`;
        return s;
      };
      out.push(G('rotate(3.2 44 66)', lL + foot(0)) + G('rotate(-3.2 56 66)', lR + foot(1)));
    }

    /* ---- kalçadaki kın / asılı alet ---- */
    let hipStow = '';
    if (stow && stow.w) {
      if (stow.k === 'gurz') hipStow = G('translate(61.2 64.6) rotate(172)', ITEM.gurz(stow.t, D, 0));
      else {
        // kabza kının dışında, yukarıda
        const h = stow.k === 'katana' ? hiltKatana(stow.t) : hiltOnly(stow.k, stow.t);
        hipStow = G('translate(58.4 62.4) rotate(150)', sheath(stow.k, stow.t, D, 0)) + G('translate(58.4 62.4) rotate(150)', h);
      }
    } else if (stow && !stow.w && stow.k !== 'olta') {
      const tr = { kazma: 'translate(64.6 101) rotate(10) scale(.84)', balta: 'translate(64.4 98) rotate(8) scale(.88)', orak: 'translate(63.6 86) rotate(8) scale(-.88 .88)', bicak: 'translate(62.6 72) rotate(180) scale(.95)' }[stow.k];
      hipStow = (stow.k === 'bicak' ? G('translate(62.6 72) rotate(180) scale(.95)', P('M-2.8-3.6C-4.2-9.4-3.6-16.4.4-23.6 3.8-17 4.6-10 2.8-3.6Z', '#5e4430') + S('M-2.4-6.6H2.6M-3-13H3', '#3a2a1c', .5)) : '') +
        G(tr, stow.k === 'bicak' ? ITEM.bicak(stow.t, D, 0).replace(/<path d="M-2\.2-3\.8[^>]*>/, '') : ITEM[stow.k](stow.t, D, 0));
      if (stow.k !== 'bicak') hipStow += P('M60.4 63.6H65.4V67.8H60.4Z', BASE.belt[1]);
    }
    function hiltOnly(k, t) { const T = TI[t]; return k === 'kkalkan' || k === 'kilic' || k === 'pala' ? hilt(t, T, D, 0) : ''; }
    function hiltKatana(t) { return ITEM.katana(t, D, 0, true); }

    /* ---- gövde ---- */
    {
      let g = '';
      // gömlek
      const torso = 'M44 29.6H56C60.6 30.6 64.6 32 66.2 34.6 67.6 37.5 67 43 65.8 47L62.8 62H37.2L34.2 47C33 43 32.4 37.5 33.8 34.6 35.4 32 39.4 30.6 44 29.6Z';
      g += P(torso, D.soft('sht', BASE.shirt.slice(0, 3)));
      if (!chest) {
        // açık yaka + göğüs
        g += N('M46.4 29.8L50 37.6 53.6 29.8Z', skin) + N('M47.6 31.4Q50 33.4 52.4 31.4L50 36.4Z', '#a9785a', op(.35));
        g += S('M47.4 31.6L52.4 33.4M47.8 34L52 32', '#6e5a3a', .4);
        // yelek
        const vest = 'M39 31L45 30 50 42.4 55 30 61 31C64 32.6 65.6 34.6 65.6 37.2V47L63 66.6 52 68 50 66.8 48 68 37 66.6 34.4 47V37.2C34.4 34.6 36 32.6 39 31Z';
        g += P(vest, D.soft('vst', BASE.vest.slice(0, 3)));
        g += N('M55 30L61 31C64 32.6 65.6 34.6 65.6 37.2V47L63 66.6 52 68 50 66.8V42.4Z', '#000', op(.18));
        g += N('M39.6 32.4L44.4 31.4 47.6 38.6 42 37.6C40 37 38.6 35.4 39.6 32.4Z', '#fff', op(.12));
        g += S('M45.6 31.4L50.2 41.8 54.4 31.4M39.6 32.4C37.2 33.6 35.8 35.4 35.6 37.6V47L38.2 65.2M60.4 32.4C62.8 33.6 64.2 35.4 64.4 37.6V47L61.8 65.2', '#d6b088', .32, 'stroke-dasharray=".7 .55" opacity=".75"');
        g += S('M50 42.4V66.8', BASE.vest[3], .6);
        for (const y of [46, 51, 56]) g += C(50.9, y, .65, BASE.brass[1]) + S(`M49.2 ${y}H50.4`, '#2a1c12', .5);
        g += S('M35 47.6Q38 48.4 40.6 46.6M65 47.6Q62 48.4 59.4 46.6', '#000', .4, op(.35));
        // yaka kenarı gömlek
        g += P('M44.6 29.6L47 30.2 49.8 36.6 46.6 33.4Z', BASE.shirt[1]) + P('M55.4 29.6L53 30.2 50.2 36.6 53.4 33.4Z', BASE.shirt[2]);
      } else {
        const T = TI[chest];
        // boyunluk (gorget)
        g += P('M42.6 29.4Q50 32.6 57.4 29.4L58.6 33Q50 36.6 41.4 33Z', mt(chest));
        // göğüs plakası
        const bp = 'M37.6 33.4C42 31.8 46 33.6 50 33.8 54 33.6 58 31.8 62.4 33.4 65 36 65.8 41 65.2 46L62.8 60.4Q50 63.4 37.2 60.4L34.8 46C34.2 41 35 36 37.6 33.4Z';
        g += P(bp, mt(chest));
        g += N('M50 33.8C54 33.6 58 31.8 62.4 33.4 65 36 65.8 41 65.2 46L62.8 60.4Q56 62 50 62.2Z', '#000', op(.2));
        g += N('M38.6 35C41 34 44.6 34.8 47.4 35.4 45 40 42 50 41.4 58.6L38.6 58.2 36.4 46C36 41 36.8 37 38.6 35Z', '#fff', op(.28));
        g += S('M50 34.6V61.6', T.m[4], .55, op(.7)) + S('M49.4 35V61.4', T.m[0], .4, op(.6));
        // karın plakaları (lames)
        const lames = chest >= 3 ? 3 : 2;
        for (let i = 0; i < lames; i++) {
          const y = 63.2 + i * 3.8, w2 = 13 + i * .5;
          g += P(`M${50 - w2} ${y}Q50 ${y + 3} ${50 + w2} ${y}L${50 + w2 + .3} ${y + 3.8}Q50 ${y + 6.9} ${50 - w2 - .3} ${y + 3.8}Z`, mt(chest));
          g += N(`M50 ${y + 1.5}Q${50 + w2 * .6} ${y + 1.2} ${50 + w2} ${y}L${50 + w2 + .3} ${y + 3.8}Q${50 + w2 * .6} ${y + 5.4} 50 ${y + 5.4}Z`, '#000', op(.2));
          g += S(`M${50 - w2 + 1} ${y + .9}Q${50 - w2 / 2} ${y + 2.2} 49 ${y + 2.4}`, T.m[0], .45, op(.6));
          if (chest <= 2) g += rivet(50 - w2 + 1.4, y + 2, .5, chest === 2 ? TI[2].tr[1] : T.m[3]) + rivet(50 + w2 - 1.4, y + 2, .5, chest === 2 ? TI[2].tr[1] : T.m[3]);
          if (chest === 2) g += S(`M${50 - w2 - .2} ${y + 3.7}Q50 ${y + 6.8} ${50 + w2 + .2} ${y + 3.7}`, TI[2].tr[1], .7);
          if (chest >= 4) g += S(`M${50 - w2} ${y + .3}Q50 ${y + 3.3} ${50 + w2} ${y + .3}`, T.tr[1], .5);
        }
        // uyluk plakaları (T3+)
        if (chest >= 3) for (const m of [0, 1]) {
          const x = v => (m ? 100 - v : v).toFixed(2);
          const tp = `M${x(37)} 73.2L${x(46.4)} 74.6 ${x(46)} 84.6Q${x(41.4)} 86.4 ${x(37.4)} 84.4Z`;
          g += P(tp, mt(chest)) + N(`M${x(43.4)} 74.2L${x(46.4)} 74.6 ${x(46)} 84.6Q${x(44.6)} 85.4 ${x(43)} 85.6Z`, '#000', op(m ? .28 : .18));
          g += S(`M${x(37.2)} 78.8Q${x(41.6)} 80 ${x(46.2)} 79.6`, T.m[4], .45) + S(`M${x(38)} 74.4V83.6`, T.m[0], .5, op(.7));
          if (chest >= 4) g += S(`M${x(37.5)} 84Q${x(41.4)} 85.8 ${x(45.8)} 84.2`, T.tr[1], .55);
          g += rivet(+x(41.6), 76.4, .5, chest >= 4 ? T.tr[1] : T.m[3]);
        }
        // ön kumaş dil
        const ty = 63.4 + lames * 3.8;
        g += P(`M45.4 ${ty - 1}H54.6L54 ${ty + 9}L50 ${ty + 11}L46 ${ty + 9}Z`, clg(chest));
        if (chest === 3) g += S(`M46.6 ${ty + 3}L50 ${ty + 5.4}L53.4 ${ty + 3}M46.8 ${ty + 6}L50 ${ty + 8.4}L53.2 ${ty + 6}`, '#a7b0b8', .7);
        if (chest >= 4) g += S(`M45.8 ${ty}L46.4 ${ty + 8.8}L50 ${ty + 10.6}L53.6 ${ty + 8.8}L54.2 ${ty}`, T.tr[1], .5);
        if (chest === 5) g += P(`M47.4 ${ty}H52.6L52.2 ${ty + 6}L50 ${ty + 7.4}L47.8 ${ty + 6}Z`, '#efe3c6') + `<g filter="${glow()}">${runeRow(48.6, ty + 4.4, 2, .45, .4)}</g>`;
        // kademe süsleri
        if (chest === 1) {
          g += rust('M40 41c1.3-.6 2.4.5 1.6 1.4-.8.8-2.2.2-1.6-1.4ZM57.6 50c1-.5 1.9.4 1.3 1.1-.7.6-1.8.2-1.3-1.1ZM44 54c.8-.4 1.5.3 1 .9-.5.5-1.4.1-1-.9ZM60 38c.7-.3 1.3.3.9.8-.5.4-1.2 0-.9-.8Z');
          g += S('M43.6 44.6l3 1.4M55 41.6l2.4-1', '#3f3c38', .4, op(.7)) + N('M53.4 46.4c1.6-.4 2.6.8 1.6 1.8-1 .6-2.4-.2-1.6-1.8Z', '#000', op(.15));
          for (const [x, y] of [[38.4, 35.6], [61.6, 35.6], [36.4, 45], [63.6, 45]]) g += rivet(x, y, .6, '#5e5a55');
        }
        if (chest === 2) {
          g += S('M38 33.6C42 32.4 46 34.2 50 34.4 54 34.2 58 32.4 62 33.6', TI[2].tr[1], 1.2) + S('M42.4 30Q50 33.2 57.6 30', TI[2].tr[1], .9);
          for (const [x, y] of [[38.6, 36.4], [61.4, 36.4], [36.6, 45], [63.4, 45], [38.2, 55], [61.8, 55]]) g += rivet(x, y, .65, TI[2].tr[1], '#ffe0b8');
          g += C(50, 40, 1.2, TI[2].tr[1]) + CN(49.6, 39.6, .4, '#fff', op(.7));
        }
        if (chest === 3) {
          g += S('M44.6 36.4C43.2 42 42.8 50 43.6 58.6M47 35.4C46.4 42 46.2 50 46.8 59.8M55.4 36.4C56.8 42 57.2 50 56.4 58.6M53 35.4C53.6 42 53.8 50 53.2 59.8', T.m[3], .5, op(.8));
          g += S('M44.2 36.4C42.8 42 42.4 50 43.2 58.6M46.6 35.4C46 42 45.8 50 46.4 59.8', T.m[0], .35, op(.8));
          g += C(50, 40.6, 1.7, T.tr[1]) + CN(49.5, 40.1, .6, '#fff', op(.7));
        }
        if (chest === 4) {
          g += S('M38 33.6C42 32.4 46 34.2 50 34.4 54 34.2 58 32.4 62 33.6', T.tr[1], 1) + S('M37.4 60.2Q50 63.2 62.6 60.2', T.tr[1], .8);
          g += S('M50 43.6C46 43 42.6 45 41.4 48.6 40.6 51.6 42.4 54.4 45 54.2M50 43.6C54 43 57.4 45 58.6 48.6 59.4 51.6 57.6 54.4 55 54.2M44.4 38.6C46 40 47.6 40.6 50 40.6S54 40 55.6 38.6', T.tr[1], .55);
          let rays = '';
          for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; rays += `M${(50 + Math.cos(a) * 3.2).toFixed(2)} ${(46.4 + Math.sin(a) * 3.2).toFixed(2)}L${(50 + Math.cos(a) * 5).toFixed(2)} ${(46.4 + Math.sin(a) * 5).toFixed(2)}`; }
          g += S(rays, T.tr[1], .5) + C(50, 46.4, 2.6, trg(4)) + C(50, 46.4, 1.6, T.gem) + CN(49.4, 45.8, .55, '#fff', op(.85));
        }
        if (chest === 5) {
          g += S('M38 33.6C42 32.4 46 34.2 50 34.4 54 34.2 58 32.4 62 33.6', T.tr[1], 1) + S('M37.4 60.2Q50 63.2 62.6 60.2', T.tr[1], .8);
          g += S('M41 37.6C42 44 42 52 41.2 58.4M59 37.6C58 44 58 52 58.8 58.4', T.tr[1], .5, op(.8));
          g += `<g filter="${glow()}">${runeRow(42.6, 52.6, 2, .6, .5)}${runeRow(53.8, 52.6, 2, .6, .5)}</g>`;
          g += C(50, 45, 3, trg(5)) + C(50, 45, 1.9, '#0e2a2c') + `<g filter="${glow()}">${CN(50, 45, 1.5, RUNE, 'class="hr-rune"')}</g>` + CN(49.4, 44.4, .5, '#fff', op(.9));
        }
        g += S('M42.4 30.6Q50 33.8 57.6 30.6', T.m[0], .4, op(.6)) + EN(50, 35.4, 7, 1.8, '#000', op(.22));
      }
      out.push(g);
    }

    /* ---- kemer ---- */
    {
      const bt = chest >= 4 ? TI[chest].tr : BASE.brass;
      let b = P('M37.1 60.6Q50 63.6 62.9 60.6L63.2 65.2Q50 68.2 36.8 65.2Z', D.soft('blt', BASE.belt));
      b += S('M37.6 61.6Q50 64.6 62.4 61.6M37.4 64.2Q50 67.2 62.6 64.2', '#a07a52', .28, 'stroke-dasharray=".6 .5" opacity=".8"');
      b += P('M47.6 61.8H52.4V67H47.6Z', 'none', `stroke="${bt[1]}" stroke-width="1"`) + S('M50 62.6V66.2', bt[2], .6);
      // kese
      if (!(stow && !stow.w && stow.k === 'bicak')) b += P('M38.6 64.6H44.6L44.2 71.4Q41.6 73.2 39 71.4Z', D.soft('pch', ['#94694a', '#6a4832', '#42291a'])) + P('M38.4 64.4H44.8L44.6 67.6Q41.6 69 38.6 67.6Z', BASE.vest[2]) + C(41.6, 67.4, .6, bt[1]);
      out.push(b);
    }
    out.push(hipStow);
    out.push(strapsFront);

    /* ---- boyun + kafa ---- */
    {
      let h = '';
      h += P('M46.2 24.6H53.8L54.4 31Q50 33.4 45.6 31Z', skinC);
      h += N('M46.2 25.6Q50 30 53.8 25.6L54 28.4Q50 31.6 46 28.4Z', '#7a4a32', op(.38));
      if (!chest) h += P('M44.6 29.6Q50 33 55.4 29.6L56 30.6Q50 34.4 44 30.6Z', BASE.shirt[1]);
      // kulaklar
      h += P('M43.6 17.6C42 16.8 41.4 18.4 41.8 20 42.1 21.4 42.9 22.2 43.9 22Z', skin) + P('M56.4 17.6C58 16.8 58.6 18.4 58.2 20 57.9 21.4 57.1 22.2 56.1 22Z', skin);
      h += S('M42.8 18.6Q42.4 19.8 43.2 20.8M57.2 18.6Q57.6 19.8 56.8 20.8', '#a9785a', .35);
      // yüz
      const face = 'M43.4 17.4C43.2 11.6 46.4 9.2 50 9.2S56.8 11.6 56.6 17.4C56.6 19.6 56.4 21.6 55.8 23.2 54.8 25.9 52.6 27.9 50 28.1 47.4 27.9 45.2 25.9 44.2 23.2 43.6 21.6 43.4 19.6 43.4 17.4Z';
      h += P(face, skin);
      h += N('M53.6 10C56 11 56.8 13.6 56.6 17.4 56.6 21.5 55.6 25.5 50.8 28 53.6 25 54.6 21 54.4 17 54.3 14 54.4 11.8 53.6 10Z', '#8a5a3c', op(.32));
      h += EN(46.6, 21.4, 1.8, 1.1, '#fff', op(.16)) + EN(53.6, 21.6, 1.6, 1, '#c0705a', op(.12));
      h += EN(46.8, 18.2, 2.6, 1.5, '#8a5a3c', op(.2)) + EN(53.2, 18.2, 2.6, 1.5, '#8a5a3c', op(.24));
      // gözler
      h += N('M45.3 18.4Q46.8 17.3 48.4 18.3 46.8 19.3 45.3 18.4Z', '#f2ebe0') + N('M51.6 18.3Q53.2 17.3 54.7 18.4 53.2 19.3 51.6 18.3Z', '#f2ebe0');
      h += CN(47, 18.3, .62, '#4a3222') + CN(53.1, 18.3, .62, '#4a3222') + CN(47, 18.3, .3, '#140c08') + CN(53.1, 18.3, .3, '#140c08');
      h += CN(47.2, 18.05, .18, '#fff') + CN(53.3, 18.05, .18, '#fff');
      h += S('M45.1 18.4Q46.8 17.1 48.6 18.2M51.4 18.2Q53.2 17.1 54.9 18.4', '#2a1a10', .38);
      // kaşlar
      h += N('M44.8 16.6Q46.6 15.2 48.9 16.1L48.7 16.8Q46.7 16.1 45 17.1Z', HR[1]) + N('M51.1 16.1Q53.4 15.2 55.2 16.6L55 17.1Q53.3 16.1 51.3 16.8Z', HR[1]);
      // burun
      h += S('M49.6 18.6Q49.3 20.4 49.4 21.6', '#fff', .45, op(.25));
      h += N('M50.6 18.8C51 20.2 51.6 21.6 51.8 22.6 51.2 23.2 50.4 23.3 49.6 23.1 50.6 22.8 51 22.4 51 21.8 50.9 20.8 50.6 19.8 50.6 18.8Z', '#8a5a3c', op(.5));
      h += S('M48.6 22.9Q49.2 23.5 50 23.4T51.5 22.9', '#7a4a32', .35, op(.8));
      // sakal + bıyık
      h += N('M43.6 20.4C44 24 45.6 27.6 50 28.8 54.4 27.6 56 24 56.4 20.4 55.6 22.6 55 23.8 54.2 24.6 53.2 25.8 52 26.6 50 26.6S46.8 25.8 45.8 24.6C45 23.8 44.4 22.6 43.6 20.4Z', HR[1], op(.92));
      h += N('M44.6 20.6C45.4 22.6 46.4 24 48 24.4L47.6 25.4C46.2 24.8 45 23 44.6 20.6ZM55.4 20.6C54.6 22.6 53.6 24 52 24.4L52.4 25.4C53.8 24.8 55 23 55.4 20.6Z', HR[1], op(.35));
      h += N('M47.2 24.6Q48.8 23.4 50 24.1 51.2 23.4 52.8 24.6 51.6 25 50 24.7 48.4 25 47.2 24.6Z', HR[2]);
      h += N('M48.4 25.4Q50 26 51.6 25.4 50.8 26.2 50 26.2T48.4 25.4Z', '#b0604a', op(.9));
      h += S('M46 26.4Q50 29 54 26.4', HR[0], .35, op(.5)) + S('M48 27.6l.2 1M50 27.8v1.2M52 27.6l-.2 1', HR[2], .3, op(.5));
      // saç (miğfer yoksa)
      if (!helm) {
        h += P('M42.8 18.8C42 12 44 7.4 49 6.8 53.2 6.2 57.6 8.2 57.8 13 58 15 57.6 17.2 57.2 18.8 56.8 16 56.4 14 55.2 12.4 53 13.4 49 13 46.4 11.6 45 13 44.2 15.2 43.8 18.8Z', D.soft('hair', HR));
        h += S('M45 10.4C47 8.4 51 8 54 9.2M44 13.6C45.4 10.4 48 9.4 50.6 9.6M52.6 10.4C55 10.6 56.6 12 57 14', HR[0], .45, op(.8));
        h += S('M46.4 11.6C48 12.6 51 13 55.2 12.4', HR[2], .4, op(.6));
      }
      out.push(h);
    }

    /* ---- miğfer ---- */
    if (helm) {
      const T = TI[helm];
      let m = '';
      const pointed = helm >= 2;
      const dome = pointed ? 'M41.3 16.6C41 10 44.4 5.6 50 1.4 55.6 5.6 59 10 58.7 16.6Z' : 'M41.3 16.6C41 9.6 45 4.8 50 4.8S59 9.6 58.7 16.6Z';
      // zincir perde / yanaklık (arkada)
      if (helm <= 2) {
        m += P('M41.4 15.4C40.4 22 40.6 28 42 31.6 46 34 54 34 58 31.6 59.4 28 59.6 22 58.6 15.4L56.4 16.4C56.8 22 55.4 26.8 50 28.6 44.6 26.8 43.2 22 43.6 16.4Z', D.mail(helm, T.m[1], T.m[4]));
        m += N('M56.4 16.4C56.8 22 55.4 26.8 50 28.6L50 33.4C54 33.4 57 32.6 58 31.6 59.4 28 59.6 22 58.6 15.4Z', '#000', op(.3));
      } else {
        m += P('M41.4 15.4C40.6 21 41 27 42.2 30.6 46 33 54 33 57.8 30.6 59 27 59.4 21 58.6 15.4L56.2 16.4C56.6 22 55.2 26.8 50 28.6 44.8 26.8 43.4 22 43.8 16.4Z', D.mail(helm, T.m[1], T.m[4]));
        m += N('M56.2 16.4C56.6 22 55.2 26.8 50 28.6L50 32.8C54 32.8 56.8 31.6 57.8 30.6 59 27 59.4 21 58.6 15.4Z', '#000', op(.3));
        m += P('M41.6 15.8L45.4 16.6 45.6 24.4 43.4 26.6 41.8 24Z', mt(helm)) + P('M58.4 15.8L54.6 16.6 54.4 24.4 56.6 26.6 58.2 24Z', mt(helm));
        m += N('M58.4 15.8L56.4 16.2 56.2 25.4 56.6 26.6 58.2 24Z', '#000', op(.25));
        if (helm >= 4) m += S('M41.8 16.4L45 17 45.2 24.2 43.4 26M58.2 16.4L55 17 54.8 24.2 56.6 26', T.tr[1], .5);
        else m += rivet(43.4, 18.6, .5, T.m[3]) + rivet(56.6, 18.6, .5, T.m[3]);
      }
      // kubbe
      m += P(dome, D.rad('hm' + helm, [[0, T.m[0]], [.35, T.m[1]], [.7, T.m[2]], [1, T.m[3]]], .34, .28, .85));
      m += N(pointed ? 'M50 1.4C55.6 5.6 59 10 58.7 16.6H53.6C54.4 11 53 6 50 1.4Z' : 'M50 4.8C55 4.8 59 9.6 58.7 16.6H53.8C54.6 11 53.6 7 50 4.8Z', '#000', op(.22));
      m += N(pointed ? 'M44 14C44 9.6 46 6 48.6 3.4 46.8 7 46 10.4 46.2 14Z' : 'M43.6 14C43.8 9.6 45.6 7 48 6 46.4 8.2 45.8 11 46 14Z', '#fff', op(.55));
      if (helm === 2) m += S('M50 1.6V14M45 5.6Q44.6 9.6 45.2 14M55 5.6Q55.4 9.6 54.8 14', TI[2].tr[1], .8) + rivet(50, 4.4, .55, TI[2].tr[2]);
      if (helm === 3) m += S('M48 3.2Q46.6 8 47 14M45.6 5.4Q43.8 9.6 44.2 14M52 3.2Q53.4 8 53 14M54.4 5.4Q56.2 9.6 55.8 14', T.m[3], .5) + S('M47.6 3.4Q46.2 8 46.6 14M45.2 5.6Q43.4 9.6 43.8 14', T.m[0], .4, op(.8));
      if (helm >= 4) m += S('M50 2V14M46.6 6Q45.8 10 46.4 14M53.4 6Q54.2 10 53.6 14', T.tr[1], .5) + S('M50 6.2C48 7.6 47.6 10 49 11.4M50 6.2C52 7.6 52.4 10 51 11.4', T.tr[1], .45);
      if (helm === 1) {
        for (let i = 0; i < 5; i++) m += rivet(43.6 + i * 3.2, 7.4 + Math.abs(i - 2) * 1.1 - 2 * (i === 2 ? .4 : 0), .5, '#5e5a55');
        m += rust('M45 9.6c1-.5 2 .4 1.4 1.2-.7.7-1.9.2-1.4-1.2ZM53.6 7.6c.8-.4 1.6.3 1.1 1-.6.5-1.5.1-1.1-1ZM55.4 12c.7-.3 1.3.3.9.8-.5.4-1.2 0-.9-.8Z') + N('M51 9.4c1.4-.4 2.4.7 1.5 1.6-.9.6-2.2-.2-1.5-1.6Z', '#000', op(.15));
      }
      // alın bandı (altında yüze düşen gölge)
      m += N('M43.4 15.4Q50 13.8 56.6 15.4L56.6 18.2Q50 16.4 43.4 18.2Z', '#3a2418', op(.35));
      const band = 'M41.2 13.4Q50 11.4 58.8 13.4L58.8 16.8Q50 14.8 41.2 16.8Z';
      const bandF = helm === 1 ? mt(1) : helm === 2 ? D.dia('w2', TI[2].w) : helm === 3 ? D.dia('t3', [TI[3].tr[0], TI[3].tr[0], TI[3].tr[1], TI[3].tr[2]]) : trg(helm);
      m += P(band, bandF);
      if (helm === 1) for (let i = 0; i < 6; i++) m += rivet(42.6 + i * 2.95, 14.9 - (i > 0 && i < 5 ? .5 : 0), .45, '#5e5a55');
      if (helm === 2 || helm === 3) for (let i = 0; i < 5; i++) m += rivet(43 + i * 3.5, 14.6 - (i > 0 && i < 4 ? .45 : 0), .45, helm === 2 ? '#7a4a22' : '#2e3338', '#fff');
      if (helm === 5) m += `<g filter="${glow()}">${runeRow(42.8, 15.6, 7, .5, .42)}</g>`;
      // burun siperi
      const nasal = helm >= 4 ? trg(helm) : helm === 2 ? D.dia('w2', TI[2].w) : mt(helm);
      m += P('M48.9 14.4H51.1L51 22.4 50 23.4 49 22.4Z', nasal);
      if (helm >= 4) m += C(50, 13.4, 1.4, trg(helm)) + C(50, 13.4, .95, T.gem, helm === 5 ? 'class="hr-rune"' : '') + CN(49.7, 13.1, .3, '#fff', op(.9));
      else if (helm === 2) m += C(50, 14, 1, TI[2].tr[1]) + CN(49.7, 13.7, .35, '#fff', op(.7));
      // tepelik / sorguç
      if (helm === 2 || helm === 3) m += P('M49.4 1.8L50 -1 50.6 1.8Z', helm === 2 ? TI[2].tr[1] : T.m[2]);
      if (helm === 4) {
        m += P('M49.2 2.2H50.8L50.6 .2H49.4Z', trg(4));
        m += P('M50 .6C51.8-2.8 55-4.8 59.6-5.4 57-4 55.6-2.6 54.8-.8 53.2 0 51.6.4 50 .6Z', D.soft('plm4', ['#ffffff', '#e8dcf6', '#a88cc8']));
        m += S('M50.6.2C52.6-2.2 55.4-4 58.6-5', '#9a7cc0', .35) + S('M52.2-1l.9-1.4M53.8-2l1-1.2M55.4-2.8l1-1', '#9a7cc0', .3, op(.8));
      }
      if (helm === 5) {
        // altın boynuzlar
        const hg = trg(5);
        m += P('M42 12.6C38.4 11.4 36 8 36.2 2.6 37 -1 38.6-3.4 40.4-4.6 39.2-1 39.4 3 41 6 42 7.8 43.4 8.8 44.6 9.4Z', hg) + P('M58 12.6C61.6 11.4 64 8 63.8 2.6 63 -1 61.4-3.4 59.6-4.6 60.8-1 60.6 3 59 6 58 7.8 56.6 8.8 55.4 9.4Z', hg);
        m += S('M41.6 10.4C39 8.6 38 5 38.4 1.4M58.4 10.4C61 8.6 62 5 61.6 1.4', T.tr[0], .5, op(.9));
        m += S('M37.4 4.4l1.6.2M37.8 1.4l1.6.4M62.6 4.4l-1.6.2M62.2 1.4l-1.6.4', T.tr[2], .4);
        // tepe kanatları + tüy
        m += P('M48.6 1.8L50-1.6 51.4 1.8Z', hg);
        m += P('M50-1.2C48.6-3.8 46-5.4 43-5.8 44.4-4.6 45.2-3.4 45.6-1.8 47-1 48.4-.8 50-1.2ZM50-1.2C51.4-3.8 54-5.4 57-5.8 55.6-4.6 54.8-3.4 54.4-1.8 53-1 51.6-.8 50-1.2Z', D.soft('plm5', ['#ffffff', '#ece4d4', '#b8ac94']));
        m += C(50, -1.6, 1.1, hg) + `<g filter="${glow()}">${CN(50, -1.6, .6, RUNE, 'class="hr-rune"')}</g>`;
      }
      out.push(m);
    }

    /* ---- pelerin yakası + toka ---- */
    {
      let c = '';
      c += P('M37.4 31.2C40 29.6 43 29.2 44.6 29.6L43 33.4C40.6 33.2 38.6 33.6 36.4 34.8Z', 'var(--acc2)') + P('M62.6 31.2C60 29.6 57 29.2 55.4 29.6L57 33.4C59.4 33.2 61.4 33.6 63.6 34.8Z', mix('var(--acc2)', '#000', 75));
      c += S('M36.8 34.4C39 33.2 41 32.8 43.2 33M63.2 34.4C61 33.2 59 32.8 56.8 33', 'var(--acc)', .9);
      // toka
      c += C(42.6, 32.2, 2.2, D.rad('clasp', [[0, '#fff3c8'], [.4, 'var(--acc)'], [1, mix('var(--acc)', '#000', 55)]], .35, .3, .8));
      c += C(42.6, 32.2, 1, mix('var(--acc)', '#000', 50)) + CN(42.1, 31.6, .5, '#fff', op(.8));
      c += S('M44.8 32.2C47 33.6 53 33.6 55.2 32.6', mix('var(--acc)', '#000', 70), .5);
      out.push(c);
    }

    /* ---- omuzluklar ---- */
    let pauldrons = '';
    if (chest) {
      const T = TI[chest];
      const pauld = (m) => {
        const x = v => (m ? 100 - v : v).toFixed(2);
        const pt = (...a) => a.map(([u, v]) => `${x(u)} ${v}`).join(' ');
        let p = '';
        const n = chest >= 3 ? 2 : 0;
        for (let i = n; i >= 1; i--) {
          const y = 39.6 + i * 3;
          p += P(`M${pt([30.6, y - 3])}C${pt([31.4, y + 1.6], [36, y + 3.6], [40.6, y + 1])}L${pt([40.4, y - 2.6])}Z`, mt(chest)) + (chest >= 4 ? S(`M${pt([30.8, y - .8])}C${pt([32.4, y + 2.6], [36.6, y + 3], [40.4, y + .6])}`, T.tr[1], .5) : '');
        }
        p += P(`M${pt([32.6, 32.6])}C${pt([36.2, 29.6], [42.4, 30], [44.4, 33.4])}C${pt([45, 37.4], [43, 41.6], [38.4, 43.2])}C${pt([34.6, 43.8], [31, 42.4], [29.8, 39.4])}C${pt([29.4, 36.6], [30.6, 34.4], [32.6, 32.6])}Z`, mt(chest));
        p += N(`M${pt([44.4, 33.4])}C${pt([45, 37.4], [43, 41.6], [38.4, 43.2])}C${pt([35.6, 43.6], [33, 43], [31.4, 41.4])}C${pt([36, 41.6], [41, 39], [44.4, 33.4])}Z`, '#000', op(m ? .32 : .2));
        p += N(`M${pt([33.6, 34])}C${pt([36, 32], [40, 32], [41.8, 33.4])}C${pt([38.6, 33.4], [35.4, 34.6], [33, 37.6])}C${pt([32.4, 36.4], [32.8, 35], [33.6, 34])}Z`, '#fff', op(.5));
        if (chest === 1) p += rust(`M${pt([36.6, 39])}c1-.4 1.8.4 1.2 1.1-.7.6-1.8.1-1.2-1.1Z`) + rivet(+x(34), 37.4, .55, '#5e5a55') + rivet(+x(39.6), 40.6, .55, '#5e5a55');
        if (chest === 2) p += S(`M${pt([30.4, 39.2])}C${pt([31.8, 42.4], [35, 43.6], [38.4, 43.1])}C${pt([41.6, 42.2], [44, 39.6], [44.6, 35.6])}`, TI[2].tr[1], 1) + rivet(+x(37.4), 36.2, .6, TI[2].tr[1], '#ffe0b8');
        if (chest === 3) p += rivet(+x(37.4), 36.4, .7, '#5a636c') + S(`M${pt([31.4, 39.2])}C${pt([33.4, 41.6], [37, 42.4], [40.6, 41])}`, T.m[3], .45);
        if (chest >= 4) p += S(`M${pt([30.4, 39.2])}C${pt([31.8, 42.4], [35, 43.6], [38.4, 43.1])}C${pt([41.6, 42.2], [44, 39.6], [44.6, 35.6])}`, T.tr[1], .9) + P(`M${x(38.2)} 37.4l1.5 1.9-1.5 1.9-1.5-1.9Z`, trg(chest), 'stroke-width=".4"') + N(`M${x(38.2)} 38.3l.75 1-.75 1-.75-1Z`, T.gem, chest === 5 ? 'class="hr-rune"' : '') + S(`M${pt([33.4, 35.6])}C${pt([35.6, 33.8], [39.6, 33.4], [42, 34.6])}`, T.tr[1], .4, op(.8));
        if (chest === 5) {
          p += P(`M${pt([34, 33.4])}C${pt([32.6, 29.4], [30, 27], [26.4, 26.2])}C${pt([28.4, 28.6], [29.4, 31.6], [30.8, 35.4])}Z`, trg(5));
          p += `<g filter="${glow()}">${runeRow(+x(m ? 40.6 : 35.4), 41, 2, .5, .42)}</g>`;
        }
        return p;
      };
      // omuzluk altı gölge (kola düşen)
      pauldrons = EN(35.6, 44.4, 5, 1.6, '#000', op(.3)) + EN(64.4, 44.4, 5, 1.6, '#000', op(.34)) + pauld(0) + pauld(1);
    }

    /* ---- kollar ---- */
    const sleeveUp = chest ? (chest === 2 ? D.mail('a2', TI[2].m[1], TI[2].m[4]) : clc(chest)) : D.cyl('slv', [BASE.shirt[1], BASE.shirt[0], BASE.shirt[0], BASE.shirt[2], BASE.shirt[3]]);
    const sleeveLo = chest ? clc(chest) : skinC;
    const arm = (m, holding) => {
      const x = v => (m ? 100 - v : v).toFixed(2);
      const pt = (...a) => a.map(([u, v]) => `${x(u)} ${v}`).join(' ');
      let a = '';
      const up = `M${pt([34, 33])}C${pt([31.2, 35.6], [30.4, 43], [30, 50])}C${pt([29.9, 52], [29.8, 54], [29.8, 56])}L${pt([35.6, 56])}C${pt([35.8, 53], [36.6, 49], [37.8, 45])}C${pt([39, 41.5], [40.4, 38.5], [40.6, 36.8])}C${pt([39.6, 34.4], [37, 33], [34, 33])}Z`;
      const lo = `M${pt([29.8, 55.2])}C${pt([29.2, 61], [27.8, 67], [27.6, 73.8])}L${pt([32.8, 74.2])}C${pt([33.2, 68], [35.2, 61.5], [35.6, 55.2])}Z`;
      a += P(lo, sleeveLo);
      a += N(`M${pt([33.6, 56])}C${pt([33.2, 62], [31.6, 68], [31.2, 74])}L${pt([32.8, 74.2])}C${pt([33.2, 68], [35.2, 61.5], [35.6, 55.2])}Z`, '#000', op(.22));
      if (!chest) a += S(`M${pt([30.6, 64])}C${pt([31.4, 64.6], [32.4, 64.4], [33.6, 63.6])}`, '#a9785a', .35, op(.6));
      a += P(up, sleeveUp);
      a += N(`M${pt([37.8, 45])}C${pt([36.6, 49], [35.8, 53], [35.6, 56])}L${pt([33.6, 56])}C${pt([34, 50], [35.4, 44], [38.6, 38.6])}Z`, '#000', op(.2));
      if (!chest) {
        // kıvrılmış kol ağzı
        a += P(`M${pt([29.4, 52.8])}C${pt([31.4, 54], [34, 54], [36, 53])}L${pt([35.8, 57.4])}C${pt([33.6, 58.4], [31.4, 58.4], [29.4, 57.4])}Z`, D.cyl('cuf', [BASE.shirt[1], BASE.shirt[0], BASE.shirt[0], BASE.shirt[2], BASE.shirt[3]]));
        a += S(`M${pt([29.8, 55.4])}C${pt([31.6, 56], [33.6, 56], [35.6, 55.2])}`, BASE.shirt[3], .35);
        a += S(`M${pt([32, 38.6])}C${pt([33, 42], [33.4, 45], [33, 48])}M${pt([35.4, 40.4])}Q${pt([35.6, 44], [34.6, 47.4])}`, BASE.shirt[3], .35, op(.7));
      }
      // eldiven / el
      if (glove) {
        const T = TI[glove];
        a += P(`M${pt([26.4, 61.6])}C${pt([29.6, 60.6], [33.2, 60.4], [36, 60.8])}L${pt([33.8, 74.4])}H${x(27.4)}Z`, mc(glove));
        a += N(`M${pt([33, 61])}L${pt([36, 60.8], [33.8, 74.4], [32, 74.4])}Z`, '#000', op(.22));
        a += S(`M${pt([27, 65.2])}Q${pt([31, 64.4], [35.4, 64.6])}M${pt([27.2, 69])}Q${pt([31, 68.4], [34.8, 68.6])}`, T.m[4], .4, op(.8));
        a += S(`M${pt([26.6, 61.8])}C${pt([29.6, 60.8], [33.2, 60.6], [35.8, 61])}`, glove >= 4 ? T.tr[1] : glove === 2 ? TI[2].tr[1] : T.m[0], glove >= 2 ? .9 : .4);
        if (glove === 1) a += P(`M${pt([27, 66.6])}H${x(35.2)}L${pt([35, 68.6])}H${x(27.1)}Z`, '#6a4a30') + rust(`M${pt([28.6, 63])}c.8-.3 1.4.3 1 .8-.5.5-1.3.1-1-.8ZM${pt([31.6, 71])}c.6-.2 1.1.3.7.7-.4.3-1 0-.7-.7Z`);
        if (glove === 2) a += P(`M${pt([27, 66.6])}H${x(35.2)}L${pt([35, 68.4])}H${x(27.1)}Z`, TI[2].tr[1]) + rivet(+x(31), 67.5, .45, TI[2].tr[2], '#ffe0b8');
        if (glove >= 4) a += S(`M${pt([27.2, 72])}H${x(33.8)}`, T.tr[1], .6);
        if (glove === 5) {
          a += P(`M${pt([26.6, 62])}L${pt([23.4, 58.8], [27.8, 61])}Z`, trg(5)) + P(`M${pt([35.6, 61.6])}L${pt([38.6, 58.4], [33.6, 61])}Z`, trg(5));
          a += `<g filter="${glow()}">${runeRow(+x(m ? 31.2 : 29), 71.6, 2, .5, .4)}</g>`;
        }
      }
      // el
      if (holding) {
        a += ''; // yumruk sonra (sapın üstüne) çizilir
      } else {
        const hd = `M${pt([27.4, 73.4])}L${pt([32.8, 73.2])}C${pt([33.8, 75.6], [34, 78], [33.4, 80.4])}C${pt([32.8, 82.4], [30.8, 83.2], [29.4, 82.6])}C${pt([28, 81.8], [27.2, 79.8], [27, 77.8])}C${pt([26.8, 76.2], [27, 74.6], [27.4, 73.4])}Z`;
        if (glove) {
          const T = TI[glove];
          a += P(hd, glove <= 2 ? D.soft('glf', ['#8a6646', '#6a4a30', '#46301e']) : mt(glove));
          a += P(`M${pt([27.2, 73.2])}H${x(33)}L${pt([33.4, 77])}C${pt([31.6, 77.8], [29, 77.8], [27, 77])}Z`, mt(glove));
          a += S(`M${pt([28.4, 78.6])}V${pt([0, 82])}`.replace(/V[^ ]+ /, 'V'), T.m[4], .35);
          a += S(`M${pt([29.4, 78.2])}L${pt([29.4, 82.2])}M${pt([31, 78.2])}L${pt([31, 82.6])}M${pt([32.4, 78])}L${pt([32.6, 81.6])}`, glove <= 2 ? '#2e1e12' : T.m[4], .35);
          if (glove >= 4) a += C(+x(30.2), 75.2, .9, T.gem, glove === 5 ? 'class="hr-rune"' : '') ;
        } else {
          a += P(hd, skin);
          a += S(`M${pt([29.4, 78.2])}L${pt([29.4, 82.2])}M${pt([31, 78.2])}L${pt([31, 82.6])}M${pt([32.4, 78])}L${pt([32.6, 81.6])}`, '#a9785a', .35);
        }
        // başparmak (iç yan)
        a += P(`M${pt([33, 75])}C${pt([34.4, 75.8], [34.8, 77.4], [34.2, 78.6])}C${pt([33.6, 78.2], [33.2, 77.4], [33, 76.4])}Z`, glove ? (glove <= 2 ? '#6a4a30' : mt(glove)) : skin);
      }
      return a;
    };

    // sol kol (izleyicinin sağı) + kalkan
    out.push(arm(1, false));

    // sağ kol (izleyicinin solu) + tutulan eşya + yumruk
    {
      out.push(arm(0, !!held));
      out.push(pauldrons);
      if (held && held.k === 'kkalkan') out.push(G('translate(71.6 70) scale(1.12)', shield(held.t, D, 0)));
      const HX = 30.2, HY = 77.6;
      const ang = held ? ({ olta: -17, kazma: -16, balta: -14, orak: -8, bicak: -20, gurz: -18, katana: -22 }[held.k] ?? -24) : 0;
      if (held) {
        const body = ITEM[held.k](held.t, D, 0);
        const hs = { bicak: 1.25, orak: 1.1 }[held.k] || 1;
        out.push(G(`translate(${HX} ${HY}) rotate(${ang})${hs !== 1 ? ` scale(${hs})` : ''}`, body));
        if (held.k === 'olta') {
          // misina + şamandıra + kanca (dikey sarkar)
          const a = ang * Math.PI / 180, tx = HX + Math.sin(a) * ROD_TIP, ty = HY - Math.cos(a) * ROD_TIP;
          const T = TI[held.t];
          const lc = T.rune ? RUNE : '#e8e2d4';
          const ly = ty + 34;
          let l = S(`M${tx.toFixed(2)} ${ty.toFixed(2)}V${ly + 6}`, lc, T.rune ? .45 : .3, (T.rune ? 'class="hr-rune" ' : '') + op(.9));
          l += EN(tx, ly - 1, 1.3, 1.5, '#e8e2d4') + EN(tx, ly + 1, 1.3, 1.5, held.t >= 4 ? (held.t === 5 ? '#2a2f45' : '#5e3a8a') : '#c84a32') + S(`M${tx - 1.3} ${ly}H${tx + 1.3}`, '#1a1410', .35) + S(`M${tx} ${ly - 2.6}V${ly - 3.6}`, '#1a1410', .4);
          l += S(`M${tx.toFixed(2)} ${ly + 6}V${ly + 8.6}a1.3 1.3 0 0 1-2.6 0`, '#cfd6dc', .45);
          out.push(l);
        }
      }
      // yumruk
      const T = glove ? TI[glove] : null;
      const fF = glove ? (glove <= 2 ? D.soft('glf', ['#8a6646', '#6a4a30', '#46301e']) : mt(glove)) : skin;
      const lnC = glove ? (glove <= 2 ? '#2e1e12' : T.m[4]) : '#a9785a';
      let f = '';
      if (held) {
        f += P('M-3.3-3.2C-1.5-4.2 1.6-4.2 3.2-3.2 3.9-1 3.9 1.4 3.2 3.4 1.4 4.3-1.4 4.3-3.2 3.4-3.9 1.4-3.9-1-3.3-3.2Z', fF);
        f += S('M-3.4-1.2H1.8M-3.5.8H2M-3.2 2.6H1.8', lnC, .4);
        f += N('M1.8-3.6C3.6-3 3.9-1 3.8 1 3.4 2.4 3.2 3 2.6 3.6 2.8 1 2.6-1.6 1.8-3.6Z', '#000', op(.2));
        // başparmak
        f += P('M-3.4-3C-1.8-4.6 1.6-4.8 3-3.4 2.4-2.2.4-1.8-1.4-1.9-2.4-2-3-2.4-3.4-3Z', glove ? (glove <= 2 ? '#6a4a30' : mt(glove)) : skin);
        if (glove >= 4) f += C(-.6, .4, .8, T.gem, glove === 5 ? 'class="hr-rune"' : '');
        if (glove >= 3) f += S('M-3.2-.2H2', T.m[0], .3, op(.7));
        out.push(G(`translate(${HX} ${HY}) rotate(${ang})`, f));
      }
    }

    /* ---- turuncu kalite pırıltıları ---- */
    let sp = '';
    if (q.helm === 3 && helm) sp += spark(60.4, 4.6, .8);
    if (q.chest === 3 && chest) sp += spark(64.6, 40.6, .75);
    if (q.glove === 3 && glove) sp += spark(22.6, 66, .7);
    if (q.boot === 3 && boot) sp += spark(67.4, 112, .7);
    if (q.bag === 3 && bag) sp += spark(88.6, 30, .75);
    if (held && q[held.w ? 'weapon' : 'tool'] === 3) sp += spark(12.6, 34, .85);
    if (sp) out.push(`<g class="hr-q3">${sp}</g>`);

    return out.join('');
  }

  /* =====================================================================
     MAP — -20 -46 40 52; ayak (0,0); sağa bakar
     ===================================================================== */
  function map(L, o, D) {
    const helm = cl5(L.helm), chest = cl5(L.chest), glove = cl5(L.glove), boot = cl5(L.boot), bag = cl5(L.bag);
    const wpn = itemOf(L.weapon), tool = itemOf(L.tool);
    const held = o.hand === 'weapon' ? wpn : tool, stow = o.hand === 'weapon' ? tool : wpn;
    const mt = t => D.dia('m' + t, TI[t].m);
    const skin = SK[1];
    const out = [];
    const IS = .37, ISW = 1.7; // eşya ölçeği ve hat kalınlığı
    const F = flat(D);
    const itm = (it, tr) => `<g transform="${tr} scale(${IS})" stroke-width="${ISW}">${ITEM[it.k](it.t, F, 1)}</g>`;

    out.push(EN(.4, .4, 8.6, 2.5, '#000', op(.45)));
    out.push('<g class="wv-body">');

    // sırttaki silah (pelerinin arkasında, kabza omuz üstünde)
    if (stow && stow.w) {
      out.push(itm(stow, `translate(-6.4 -25.6) rotate(208)`));
    }
    // pelerin
    {
      const body = 'M-4.8-26.4C-8.6-21-11.8-12.6-13.4-3.4Q-9.8-1.6-6.6-3.2-3.4-1.8-.2-4.2L2.8-25.2Z';
      let c = P(body, D.lin('capem', [[0, mix('var(--acc2)', 'var(--acc)', 75)], [.6, 'var(--acc2)'], [1, mix('var(--acc2)', '#000', 60)]], D.V));
      c += N('M-3.4-24.4C-6-18-8-11-9.2-2.6L-6.6-3.2C-5.8-11-4.4-18-2-24.8Z', '#000', op(.25)) + N('M-5.6-24C-8.4-19-10.6-12-11.8-4.2L-10.6-4C-9.4-12-7.4-19-4.6-24.6Z', '#fff', op(.12));
      c += S('M-13.2-3.6Q-9.8-1.8-6.6-3.4-3.4-2-.2-4.4', 'var(--acc)', 1.5) + S('M-4.8-26.4C-8.6-21-11.8-12.6-13.4-3.4', 'var(--acc)', .9);
      out.push(`<g class="wv-cape">${c}</g>`);
    }
    if (stow && stow.k === 'kkalkan') out.push(G('translate(-7.6 -17.6) scale(.3 .46)', shield(stow.t, F, 1), 'stroke-width="1.6"'));
    // sırt çantası
    if (bag) {
      const pc = bag === 1 ? ['#e6d4ac', '#c8b38a', '#8e7a56'] : bag === 2 ? ['#cf8a5a', '#a8643c', '#6a3a20'] : bag === 5 ? ['#fbf4e4', '#ece0c6', '#b8a684'] : ['#b07a4c', '#8a5a36', '#583620'];
      const g = D.soft('mb' + bag, pc);
      let b = '';
      if (bag <= 2) {
        b += P('M-4.4-24.6C-8.2-24.4-10.2-21-10-17.4-9.8-14-7.6-12.6-4.4-13Z', g) + P('M-6.8-25.2L-6-27.4-5.2-26-4.4-27.6-3.8-25.4Z', g);
        b += S('M-7.6-24.2Q-5.6-23.4-4.2-24', bag === 1 ? '#6e5a3a' : '#f0e2c0', .7);
        if (bag === 2) b += S('M-9.8-17.8Q-7-17.2-4.4-17.6', '#e2be72', .8);
      } else {
        const t0 = bag === 3 ? -26.4 : -27.4;
        b += P(`M-4.2 ${t0}H-8.6Q-10.6 ${t0} -10.6 ${t0 + 2}V-13.8Q-10.6-12.6-9.2-12.6H-4.2Z`, g);
        const fl = bag === 3 ? '#6e4626' : bag === 4 ? TI[4].cl[1] : '#2a2f45';
        b += P(`M-4.2 ${t0}H-8.6Q-10.6 ${t0} -10.6 ${t0 + 2}V-20.4Q-7.4-19.4-4.2-20.4Z`, fl);
        b += S('M-8.4-20.4V-13.2', bag === 5 ? '#2a2f45' : '#3e2414', .8);
        if (bag === 4) b += P(`M-11.2 ${t0 - 2.6}H-3.6V${t0}H-11.2Z`, '#c4ac80') + S(`M-9.4 ${t0 - 2.6}V${t0}M-5.4 ${t0 - 2.6}V${t0}`, '#5a3a20', .6) + C(-7.4, -21.2, .7, '#e7c26a');
        if (bag === 5) b += N('M-9.6-17.4l1 1.2-1 1.2-1-1.2ZM-6.6-17.4l1 1.2-1 1.2-1-1.2Z', '#b4553a') + `<g filter="${D.glow()}">${S(`M-10 ${t0 + 1.6}H-4.6`, RUNE, .7, 'class="hr-rune" stroke-dasharray="1 .5"')}</g>`;
      }
      out.push(b);
    }
    // sırttaki alet
    if (stow && !stow.w) out.push(itm(stow, stow.k === 'olta' ? 'translate(-4 -9) rotate(-28)' : 'translate(-7.4 -11.6) rotate(-26)'));

    // bacaklar (uzak l, yakın r)
    const leg = (cls, dx, far) => {
      const pf = far ? BASE.pants[2] : BASE.pants[1];
      let s = P(`M${dx - 2.3}-12.6H${dx + 2.3}L${dx + 2}-3.6H${dx - 2}Z`, pf);
      if (!far) s += N(`M${dx + .6}-12.6H${dx + 2.3}L${dx + 2}-3.6H${dx + .5}Z`, '#000', op(.25));
      if (!boot) {
        s += P(`M${dx - 2.2}-4.4H${dx + 2.1}L${dx + 2.2}-1.8Q${dx + 5}-1.8 ${dx + 5.2} .3H${dx - 2.3}Z`, far ? BASE.shoe[2] : BASE.shoe[1]);
        s += S(`M${dx - 2.3} .1H${dx + 5.1}`, BASE.shoe[3], .6);
      } else {
        const T = TI[boot];
        s += P(`M${dx - 2.4}-8.4H${dx + 2.3}L${dx + 2.3}-2Q${dx + 5.4}-2 ${dx + 5.6} .3H${dx - 2.5}Z`, far ? T.m[3] : mt(boot));
        if (!far) s += N(`M${dx - 1.4}-7.6H${dx - .4}V-1.4H${dx - 1.4}Z`, '#fff', op(.4)) + S(`M${dx + .4}-2.2Q${dx + 2.6}-1.4 ${dx + 4.4}-.8`, T.m[4], .4);
        s += `<ellipse cx="${dx}" cy="-8.6" rx="2.6" ry="1.8" fill="${far ? T.m[3] : T.m[1]}"/>`;
        if (boot === 1) s += P(`M${dx - 2.4}-5.6H${dx + 2.3}V-4.6H${dx - 2.4}Z`, '#6a4a30', 'stroke="none"');
        if (boot === 2) s += CN(dx, -8.6, .6, TI[2].tr[1]);
        if (boot >= 4) s += CN(dx, -8.6, .7, T.tr[1]) + S(`M${dx - 2.4}-3.4H${dx + 2.3}`, T.tr[1], .5) + (far ? '' : CN(dx - 2.8, -1.2, .8, T.tr[1]));
        if (boot === 5 && !far) s += `<g filter="${D.glow()}">${S(`M${dx}-6.6V-3.8`, RUNE, .6, 'class="hr-rune"')}</g>`;
      }
      return `<g class="wv-leg ${cls}">${s}</g>`;
    };
    out.push(leg('l', -1.2, 1), leg('r', 1.6, 0));

    // gövde
    {
      const torso = 'M-5.2-25C-6.6-21-6.4-16-5.4-11.8H5.4C6.2-15.5 6.8-20.5 5.4-24.5 2.5-26.4-2.4-26.4-5.2-25Z';
      let g = '';
      if (!chest) {
        g += P(torso, D.soft('mvst', BASE.vest.slice(0, 3)));
        g += N('M2-25.6L5.4-24.5C6.6-21 6.2-15.5 5.4-11.8H3.2Z', BASE.shirt[1]);
        g += S('M3.4-24.6L3.4-12', BASE.vest[3], .5) + N('M-4.4-24C-5.4-21-5.4-16-4.6-12.6L-3.6-12.6C-4.2-16-4.2-21-3.2-24.8Z', '#fff', op(.12));
      } else {
        const T = TI[chest];
        g += P(torso, mt(chest));
        g += N('M-4.4-24C-5.4-21-5.4-16-4.6-12.6L-2.6-12.6C-3.2-16-3.2-21-2-24.8Z', '#fff', op(.4));
        g += N('M3.2-25.4C5-25 5.6-24.4 5.4-24.5 6.8-20.5 6.2-15.5 5.4-11.8H3C4-16 4.2-21 3.2-25.4Z', '#000', op(.2));
        if (chest === 1) g += N('M-1-21c1-.4 1.8.4 1.2 1.1-.7.6-1.8.1-1.2-1.1ZM2.4-16.4c.7-.3 1.2.3.8.8-.5.4-1.2 0-.8-.8Z', '#7a4a2a', op(.8));
        if (chest === 2) g += S('M-5-24.6C-2-25.8 2-25.8 5.2-24.4', TI[2].tr[1], 1) + CN(2.4, -21, .6, TI[2].tr[1]);
        if (chest === 3) g += S('M1-24.6Q.4-18.6 1.2-13M-1.6-24.8Q-2.4-18.6-1.6-12.8', T.m[3], .5) + CN(2.6, -21, .7, T.tr[1]);
        if (chest >= 4) g += S('M-5-24.6C-2-25.8 2-25.8 5.2-24.4', T.tr[1], .9) + C(2.8, -20.4, 1.2, T.tr[1], 'stroke-width=".4"') + CN(2.8, -20.4, .65, T.gem, chest === 5 ? 'class="hr-rune"' : '');
        if (chest === 5) g += `<g filter="${D.glow()}">${S('M-2.6-17.4h1.4M-.4-17.4h1.4', RUNE, .55, 'class="hr-rune"')}</g>`;
        // etek plakaları
        g += P('M-5.6-12.2H5.8L6-9.6H-5.8Z', mt(chest)) + (chest >= 3 ? P('M-5.8-9.8H6L6.2-7.6H-6Z', T.m[2]) : '');
        if (chest >= 4) g += S('M-5.7-9.8H5.9', T.tr[1], .5);
        g += N(`M1.6-12H4.4L4.2-${chest >= 3 ? 5.6 : 7.4}L3-${chest >= 3 ? 4.6 : 6.6}L1.8-${chest >= 3 ? 5.6 : 7.4}Z`, TI[chest].cl[1]);
      }
      // kemer
      const bt = chest >= 4 ? TI[chest].tr[1] : BASE.brass[1];
      g += P('M-5.7-14.2H5.7L5.6-11.8H-5.6Z', BASE.belt[1]) + P('M2.2-14.4H4.4V-11.6H2.2Z', 'none', `stroke="${bt}" stroke-width=".55"`);
      if (!(stow && stow.w)) g += P('M-5.2-12.4H-2.6L-2.8-9.6Q-4-8.8-5-9.6Z', BASE.shoe[1]);
      // yaka/pelerin tokası
      g += P('M-5.4-25.4C-6.8-23-7.2-20.6-6.8-18.6-4.6-19.4-2.4-21.2-.8-23.8 1-23.4 2.6-23.6 4.4-25.2 1-26.8-2.4-26.8-5.4-25.4Z', mix('var(--acc2)', 'var(--acc)', 80), 'stroke-width=".45"');
      g += S('M-6.8-18.8C-4.6-19.6-2.4-21.4-.8-24', 'var(--acc)', .8) + C(3, -24.4, 1, 'var(--acc)', 'stroke-width=".4"');
      out.push(g);
    }
    // kalkan (uzak kolda, gövdenin önünde)
    if (held && held.k === 'kkalkan') out.push(G('translate(6.6 -17.4) scale(.3 .52)', shield(held.t, F, 1), 'stroke-width="1.3"'));

    // kafa
    {
      let h = '';
      h += P('M-1.4-26.6H2.6L2.8-24.2H-1.6Z', SK[2]);
      h += C(.9, -31.4, 6.1, D.rad('msk', [[0, SK[0]], [.5, SK[1]], [1, SK[3]]], .65, .35, .8));
      h += N('M1.6-28.4C2.8-26.4 5.4-25.4 7.1-26.9 7.5-27.7 7.3-28.3 7-28.7 5.2-28.1 3.2-28.1 1.6-28.4Z', HR[1]);
      h += N('M4-29.4Q5.4-29.9 6.6-29.3 5.4-28.8 4-29.4Z', HR[2]);
      h += `<ellipse cx="4.5" cy="-31.5" rx=".6" ry=".85" fill="#1c120b" stroke="none"/>` + CN(4.7, -31.8, .22, '#fff');
      h += N('M3.3-33.3Q4.6-34 6-33.4L5.9-32.9Q4.6-33.4 3.4-32.8Z', HR[2]);
      h += P('M6.6-31.6L8.1-29.6 6.6-29.2Z', SK[1], 'stroke-width=".4"');
      if (!helm) {
        h += P('M-5.3-29.6C-6-35.6-2.4-38 1.2-37.8 4.6-37.6 7.2-35.6 7-33.2 5-34.6 2.4-34.4 1.2-33.2.4-31.4-.6-29.2-1.8-27.4-3.6-27.4-4.9-28.2-5.3-29.6Z', D.soft('mhr', HR));
        h += S('M-3.4-35.2C-1.6-36.6 1.6-36.8 4-35.8', HR[0], .5, op(.8));
      }
      h += `<ellipse cx="-.2" cy="-30.6" rx="1.1" ry="1.5" fill="${skin}"/>`;
      out.push(h);
    }
    // miğfer
    if (helm) {
      const T = TI[helm];
      let m = '';
      const pt = helm >= 2;
      if (helm <= 2) m += P('M-5.8-30.4L-5.6-24.8 1-24.4C.6-26-.2-27.6-.8-28.8Z', T.m[3]) + N('M-5.2-28.6h4.6M-5.2-27h5.4M-5.2-25.4h6', T.m[1], 'stroke="' + T.m[1] + '" stroke-width=".35" stroke-dasharray=".5 .5"');
      else m += P('M1.8-33L5-32.6 4.6-27.4 1.4-27.2Z', mt(helm)) + P('M-5.8-30.4L-5.6-25.6 0-25.4-.6-29Z', T.m[3]);
      m += P(pt ? 'M-5.9-29.8C-6.6-34.6-4.2-38.8.6-42.4 4.4-39.6 7.8-36.8 7.6-32.4L1.6-32.8C1-31 .2-29.6-.8-28.8Z' : 'M-5.9-29.8C-6.6-36.4-3-39.8.9-39.8 5-39.8 7.8-36.6 7.6-32.4L1.6-32.8C1-31 .2-29.6-.8-28.8Z',
        D.rad('mhm' + helm, [[0, T.m[0]], [.4, T.m[1]], [.75, T.m[2]], [1, T.m[3]]], .4, .3, .8));
      m += N(pt ? 'M-3.8-33.4C-3.8-36.2-2.2-38.6 0-40.4-1.4-38-2-36-2-33.4Z' : 'M-3.8-33.4C-3.6-36.2-2.2-38-0-38.6-1.4-37.2-2-35.6-2-33.4Z', '#fff', op(.55));
      if (helm === 1) m += N('M2-37.6c.9-.4 1.7.4 1.1 1.1-.6.6-1.7.1-1.1-1.1ZM-3.6-31.6c.7-.3 1.2.3.8.8-.5.4-1.2 0-.8-.8Z', '#7a4a2a', op(.85));
      if (helm === 3) m += S('M.6-41.6Q-1.6-37.6-2-33.2M2.4-40.4Q2-36.6 2.6-33', T.m[3], .45);
      // bant
      const bc = helm === 2 ? TI[2].tr[1] : helm === 3 ? TI[3].tr[1] : helm >= 4 ? T.tr[1] : T.m[3];
      m += P('M-6-31.2Q.8-34.6 7.7-33.6L7.7-32.1Q.8-33.1-5.9-29.6Z', bc, 'stroke-width=".45"');
      if (helm === 5) m += `<g filter="${D.glow()}">${S('M-4.6-31Q.6-33.6 6.6-33', RUNE, .55, 'class="hr-rune" stroke-dasharray=".9 .6"')}</g>`;
      // burun siperi
      m += P('M6.4-33.2H7.8L7.6-28.6H6.6Z', helm >= 4 ? T.tr[1] : helm === 2 ? TI[2].tr[1] : T.m[2], 'stroke-width=".45"');
      if (helm >= 4) m += CN(5.8, -33.6, .7, T.gem, helm === 5 ? 'class="hr-rune"' : '');
      if (helm === 2 || helm === 3) m += P('M.1-42.2L.6-44 1.1-42.2Z', helm === 2 ? TI[2].tr[1] : T.m[2], 'stroke-width=".4"');
      if (helm === 4) m += P('M.6-42.2C-1.8-45.4-6-46-9.6-43.4-6.6-43.4-4-42.4-2-40.6Z', '#f4eefc', 'stroke-width=".45"') + S('M.2-42.4C-2.4-44-5.4-44.2-8-43.4', '#9a7cc0', .35);
      if (helm === 5) {
        m += P('M-2.8-37.6C-6-38-8.2-41-7.8-45.2-6.8-42.4-5-40.8-2.2-40.2Z', T.tr[1], 'stroke-width=".45"') + P('M4-38.8C6.4-40.4 7.2-43 6.4-45.8 8.8-43.6 9.4-40.4 7.2-37.6Z', T.tr[1], 'stroke-width=".45"');
        m += P('M.6-42.2C-.6-44.6-2.6-45.6-4.6-45.6-3.4-44.4-2.6-43.4-2-42Z', '#f4eee0', 'stroke-width=".4"');
      }
      out.push(m);
    }
    // ön kol (sallanan)
    {
      let a = '<g class="wv-arm">';
      if (held) {
        a += itm(held, `translate(4.2 -13.8) rotate(${held.k === 'olta' ? 38 : held.k === 'orak' || held.k === 'bicak' ? 40 : 28})`);
        if (held.k === 'olta') {
          const r = 38 * Math.PI / 180, tx = 4.2 + Math.sin(r) * ROD_TIP * IS, ty = -13.8 - Math.cos(r) * ROD_TIP * IS;
          a += S(`M${tx.toFixed(1)} ${ty.toFixed(1)}V${(ty + 12).toFixed(1)}`, TI[held.t].rune ? RUNE : '#efe8da', .35, 'stroke="none"'.slice(0, 0)) + `<ellipse cx="${tx.toFixed(1)}" cy="${(ty + 12.6).toFixed(1)}" rx=".9" ry="1.1" fill="#d8402c" stroke-width=".4"/>`;
        }
      }
      const sl = chest ? (chest === 2 ? TI[2].m[2] : TI[chest].cl[1]) : BASE.shirt[1];
      a += P('M-1-17.8C.2-16.2 1.6-14.6 2.6-13.2L5.4-15.2C4.4-16.4 3.4-17.8 2.8-19Z', chest ? TI[chest].cl[1] : SK[1]);
      a += P('M-2.3-24C-2.7-21.6-2.3-19-1-16.8L3-18.4C2.6-20.2 3-22.4 3.2-24.6 1.6-26-.8-25.8-2.3-24Z', sl);
      if (!chest) a += P('M-2.1-19.6L2.8-21 3-18.4-1-16.8Z', BASE.shirt[0], 'stroke-width=".4"');
      if (glove) a += P('M1.4-16.8L3.8-18.2 5.4-15.2 2.8-13.8Z', mt(glove), 'stroke-width=".5"') + (glove >= 4 ? S('M1.6-16.6L3.9-18', TI[glove].tr[1], .5) : glove === 2 ? S('M1.6-16.6L3.9-18', TI[2].tr[1], .5) : '');
      a += C(4.3, -13.8, 1.75, glove ? (glove <= 2 ? '#6a4a30' : TI[glove].m[1]) : SK[1]);
      if (glove >= 4) a += CN(4.3, -13.8, .55, TI[glove].gem, glove === 5 ? 'class="hr-rune"' : '');
      // omuzluk
      if (chest) {
        const T = TI[chest];
        if (chest >= 3) a += P('M-2.4-22.8C-1.2-21.2 1.8-21 3.4-22.4L3.2-20.8C1.6-19.6-1.2-19.8-2.2-21.2Z', T.m[2], 'stroke-width=".45"');
        a += P('M-2.6-24.6C-1.6-26.8 2.4-26.8 3.6-24.6 3.8-23 3-22 1.2-21.8-.8-21.6-2.4-22.4-2.6-24.6Z', mt(chest));
        a += N('M-1.6-24.6C-.8-25.8 1-26 2.2-25.4-.2-25.2-1-24.6-1.6-23.4Z', '#fff', op(.55));
        if (chest === 2) a += S('M-2.5-23.2C-1.4-21.8 1.6-21.6 3.5-22.8', TI[2].tr[1], .7);
        if (chest >= 4) a += S('M-2.5-23.2C-1.4-21.8 1.6-21.6 3.5-22.8', T.tr[1], .6) + CN(.6, -24, .5, T.gem, chest === 5 ? 'class="hr-rune"' : '');
        if (chest === 5) a += P('M-1.4-25.6C-2-27.8-3.6-29.2-5.8-29.8-4.6-28.4-4-27-3.8-25.2Z', T.tr[1], 'stroke-width=".4"');
      }
      a += '</g>';
      out.push(a);
    }
    out.push('</g>');
    return out.join('');
  }

  /* ---------- giriş ---------- */
  // kayan nokta tortusunu at, baştaki sıfırı kısalt
  const tidy = m => m.replace(/-?\d*\.\d{3,}/g, v => String(+(+v).toFixed(2))).replace(/([^\w.#-])(-?)0\.(\d)/g, '$1$2.$3');
  function svg(look, opts) {
    const L = look || {}, o = Object.assign({ lod: 'map', uid: 'hero', hand: 'tool' }, opts || {});
    const uid = String(o.uid).replace(/[^\w-]/g, '_');
    const D = Defs(uid);
    if (o.lod === 'doll') {
      const body = doll(L, o, D);
      return tidy(`<svg class="hero-svg" viewBox="0 0 100 140" aria-hidden="true"><defs>${D.out.join('')}</defs><g stroke="${OL}" stroke-width=".55" stroke-linejoin="round" stroke-linecap="round" transform="translate(50 133.6) scale(.95) translate(-50 -133.6)">${body}</g></svg>`);
    }
    const held = o.hand === 'weapon' ? L.weapon : L.tool;
    const olta = held && held.kind === 'olta';
    const body = map(L, o, D);
    return tidy(`<svg class="wv-hero hero-map${olta ? ' hold-olta' : ''}" viewBox="-20 -46 40 52" aria-hidden="true"><defs>${D.out.join('')}</defs><g stroke="${OL}" stroke-width=".6" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`);
  }

  return { svg };
})();
