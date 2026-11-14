/* Derinsu — şehir çizim seti (CK)
   İzometrik katı cisimler, tek güneş, doku ipuçları, yere düşen gölge ve gece renkleri.
   Yalnız SVG metni üretir, DOM'a dokunmaz; tarayıcıda da Node'da da (tarayıcısız önizleme) çalışır.

   Eksenler: +x ekranda sağ-aşağı, +y sol-aşağı, +z yukarı. Görünen yüzler: +y (sol, AYDINLIK), +x (sağ, GÖLGE), üst.
   1 birim ≈ 2,5 m: kat 1.0–1.1, kapı 0.85, insan 0.7. */
(function (root) {
  'use strict';
  const U = 24, ZK = 1.2247, ZU = U * ZK;
  const VIEW = [0.612, 0.612, 0.5];                 // kameraya doğru
  const unit = v => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const SUN = unit([-0.30, 0.52, 0.80]);
  const SH = [SUN[0] / -SUN[2], SUN[1] / -SUN[2]];  // gölge: birim yükseklik başına ızgarada kayma
  const f1 = n => { const s = (Math.round(n * 10) / 10).toString(); return s === '-0' ? '0' : s; };
  const f2 = n => (Math.round(n * 100) / 100).toString();
  const pr = (x, y, z = 0) => [(x - y) * U, (x + y) * U / 2 - z * ZU];
  const P = (x, y, z = 0) => { const p = pr(x, y, z); return f1(p[0]) + ' ' + f1(p[1]); };
  const PL = pts => pts.map(p => P(p[0], p[1], p[2] || 0)).join(' ');
  const rng = seed => { let a = (seed | 0) || 1; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };

  /* ---------- renk ---------- */
  const rgb = h => { h = h.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); const n = parseInt(h, 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const hex = a => '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const p = rgb(a.split('>')[0]), q = rgb(b.split('>')[0]); return hex(p.map((v, i) => v + (q[i] - v) * t)); };
  const tcache = new Map();
  const qt = t => Math.max(-.84, Math.min(.72, Math.round(t * 25) / 25));
  // t > 0: sıcak aydınlık; t < 0: serin gölge. "gündüz>gece" yazımında gece rengi olduğu gibi kalır.
  const tone = (c, t) => {
    t = qt(t); if (!t) return c;
    const key = c + '|' + t; let v = tcache.get(key); if (v) return v;
    const [d, n] = c.split('>'), a = rgb(d), k = Math.abs(t);
    const o = t > 0 ? [a[0] + (255 - a[0]) * k * .62, a[1] + (255 - a[1]) * k * .55, a[2] + (255 - a[2]) * k * .36]
      : [a[0] * (1 - k * .52), a[1] * (1 - k * .47), a[2] * (1 - k * .30)];
    v = hex(o) + (n ? '>' + n : ''); tcache.set(key, v); return v;
  };
  const nightOf = d => { const a = rgb(d); return hex([a[0] * .30 + 10, a[1] * .40 + 16, a[2] * .60 + 34]); };
  const toneOf = n => { const l = Math.max(0, dot(n, SUN)); return qt(l >= .52 ? (l - .52) * .9 : (l - .52) * .82); };

  // renk sicili: her renk bir sınıf (K: dolgu, S: çizgi, G: geçiş durağı); gece karşılığı CSS'te ayrıca yazılır
  const reg = { list: [], map: new Map(), k: new Set(), s: new Set(), g: new Set() };
  const cid = c => { let i = reg.map.get(c); if (i === undefined) { i = reg.list.length; reg.list.push(c); reg.map.set(c, i); } return i; };
  const kf = c => { const i = cid(c); reg.k.add(i); return 'K' + i.toString(36); };
  const ks = c => { const i = cid(c); reg.s.add(i); return 'S' + i.toString(36); };
  const kg = c => { const i = cid(c); reg.g.add(i); return 'G' + i.toString(36); };
  // mode: 'day' | 'night' | 'both' (both: gündüz kuralları + body.night altında gece kuralları)
  const css = (scope = '', mode = 'both') => {
    const sc = scope ? scope + ' ' : '', rule = night => { let s = ''; const pre = night && mode === 'both' ? 'body.night ' + sc : sc;
      reg.list.forEach((c, i) => { const [d, n] = c.split('>'), v = night ? (n || nightOf(d)) : d, id = i.toString(36);
        if (reg.k.has(i)) s += `${pre}.K${id}{fill:${v}}`; if (reg.s.has(i)) s += `${pre}.S${id}{stroke:${v}}`; if (reg.g.has(i)) s += `${pre}.G${id}{stop-color:${v}}`; });
      return s; };
    const base = `${sc}.Ln{fill:none;stroke-linecap:round;stroke-linejoin:round}${sc}.Zs{fill:#1b2440;opacity:.24}`;
    if (mode === 'day') return base + `${sc}.Nl{display:none}` + rule(false);
    if (mode === 'night') return base + `${sc}.Dl{display:none}${sc}.Zs{opacity:.3}` + rule(true);
    return base + `${sc}.Nl{opacity:0;transition:opacity 1.2s}body.night ${sc}.Nl{opacity:1}body.night ${sc}.Dl{opacity:0}body.night ${sc}.Zs{opacity:.3}` + rule(false) + rule(true);
  };
  // ortak tanımlar (geçişler, desenler): tek <defs> içinde bir kez
  const defs = new Map();
  const DEF = (id, mk) => { if (!defs.has(id)) defs.set(id, mk()); return id; };
  const defsSvg = () => [...defs.values()].join('');
  const gradCyl = c => DEF('ckc' + cid(c), () => `<linearGradient id="ckc${cid(c)}"><stop offset="0" class="${kg(tone(c, .06))}"/><stop offset=".3" class="${kg(tone(c, -.02))}"/><stop offset=".62" class="${kg(tone(c, -.34))}"/><stop offset=".88" class="${kg(tone(c, -.44))}"/><stop offset="1" class="${kg(tone(c, -.34))}"/></linearGradient>`);
  const gradDome = c => DEF('ckd' + cid(c), () => `<radialGradient id="ckd${cid(c)}" cx=".33" cy=".3" r=".85"><stop offset="0" class="${kg(tone(c, .34))}"/><stop offset=".42" class="${kg(tone(c, .04))}"/><stop offset=".8" class="${kg(tone(c, -.34))}"/><stop offset="1" class="${kg(tone(c, -.44))}"/></radialGradient>`);
  const glowId = () => DEF('ckgl', () => `<radialGradient id="ckgl"><stop offset="0" stop-color="#ffd98a" stop-opacity=".85"/><stop offset=".45" stop-color="#ffb648" stop-opacity=".32"/><stop offset="1" stop-color="#ff9a30" stop-opacity="0"/></radialGradient>`);

  /* ---------- gereçler (gündüz rengi; "gündüz>gece" yazımı geceyi elle verir) ---------- */
  const M = {
    // sıva
    kirec: '#f3e9d6', krem: '#ecdcbb', asi: '#e3b873', gul: '#e3a98f', somon: '#d98a6a', buz: '#bccfd8', nane: '#bdd1b2', sari: '#edd08a', leylak: '#cfbfd8', kil: '#cfa07a',
    // taş
    tas: '#cfbf9f', tasK: '#b3a388', gri: '#aaa79e', griK: '#87847f', bazalt: '#6d6a6e', mermer: '#ece7dc', kaya: '#9c907b',
    // çatı
    kiremit: '#c8643c', kiremitK: '#b3522f', kiremitA: '#d67c4c', kursun: '#8b98a5', arduvaz: '#5f6f82', saz: '#c9a85a', padavra: '#8b6a47', bakir: '#5fa08c',
    // ahşap ve boya
    ahsap: '#9a6a3f', ahsapK: '#6a4428', ahsapA: '#c0945e', mavi: '#2f6fa3', yesil: '#4f7d5a', kirmizi: '#a8473a', lacivert: '#2c4a78', turkuaz: '#2f8f8f', hardal: '#c99a2e',
    // metal
    demir: '#4a4f58', bronz: '#b08a3c', altin: '#e2b84f',
    // kumaş
    bez: '#f2e8d2', bezK: '#c0473a', bezM: '#2f6f9f', bezS: '#e0a83a', bezY: '#3f8a6a', bezMor: '#8a4f9a',
    // zemin
    parke: '#d8caa9', parkeK: '#c2b08d', toprak: '#b99a6b', kum: '#e8d6a6', cim: '#93b56c', cimK: '#7fa35e', cimA: '#a9c47c',
    // su
    su: '#3f9db0', suK: '#2a7f9c', suA: '#72c4ca', kopuk: '#eaf6f4',
    // bitki
    selvi: '#2f5d45', cinar: '#6c9f52', zeytin: '#8a9f72', fistik: '#3f7a4f', narenciye: '#4f8f4a', kavak: '#8fb85a', sarmasik: '#4f8a4a', begonvil: '#d0408c', mor: '#8f6ac0', govde: '#7a5a3c',
    // cam ve ışık
    cam: '#3f5670>#182036', camI: '#3f5670>#ffc866', camP: '#8fa9c0>#2a3550', camPI: '#8fa9c0>#ffe6ae', ic: '#2b2420>#15121c', icI: '#2b2420>#8a531e', isik: '#ffd98a',
    ten: '#e8b98f', tenK: '#c98f63',
  };

  /* ---------- geometri yardımcıları ---------- */
  const circ = (cx, cy, r) => `M${f1(cx - r)} ${f1(cy)}a${f1(r)} ${f1(r)} 0 1 0 ${f1(2 * r)} 0a${f1(r)} ${f1(r)} 0 1 0 ${f1(-2 * r)} 0Z`;
  const ell = (cx, cy, rx, ry) => `M${f1(cx - rx)} ${f1(cy)}a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(2 * rx)} 0a${f1(rx)} ${f1(ry)} 0 1 0 ${f1(-2 * rx)} 0Z`;
  const area2 = p => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length]; s += a[0] * b[1] - b[0] * a[1]; } return s; };
  const hull = pts => {
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]); if (p.length < 3) return p;
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
    for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    lo.pop(); up.pop(); return lo.concat(up);
  };
  // doğru parçasını dışbükey çokgene kırp (yüz koordinatlarında)
  const clipSeg = (p, q, poly) => {
    let t0 = 0, t1 = 1; const d = [q[0] - p[0], q[1] - p[1]], sg = area2(poly) > 0 ? 1 : -1;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], nx = (b[1] - a[1]) * sg, ny = -(b[0] - a[0]) * sg;
      const num = nx * (p[0] - a[0]) + ny * (p[1] - a[1]), den = nx * d[0] + ny * d[1];
      if (Math.abs(den) < 1e-9) { if (num > 0) return null; continue; }
      const t = -num / den; if (den > 0) t1 = Math.min(t1, t); else t0 = Math.max(t0, t);
      if (t0 > t1) return null;
    }
    return [[p[0] + d[0] * t0, p[1] + d[1] * t0], [p[0] + d[0] * t1, p[1] + d[1] * t1]];
  };
  const corners = b => [[b[0], b[1], b[2]], [b[3], b[1], b[2]], [b[3], b[4], b[2]], [b[0], b[4], b[2]], [b[0], b[1], b[5]], [b[3], b[1], b[5]], [b[3], b[4], b[5]], [b[0], b[4], b[5]]];

  /* =========================================================
     YÜZ: düzlem üzerinde (a, b) koordinatlarıyla ayrıntı çizimi.
     a: ekranda soldan sağa, b: aşağıdan yukarı (çatıda saçaktan mahyaya). Birim: ızgara birimi.
     Çizimler katmanlara (layer) toplanır ve aynı renk tek <path> olur.
     ========================================================= */
  class Face {
    constructor(o, u, v, w, h, n, shape) {
      this.o = o; this.u = u; this.v = v; this.w = w; this.h = h; this.n = n; this.t = toneOf(n);
      this.shape = shape || null; this.B = new Map(); this.col = null; this.mc = M.kirec; this.holes = '';
      this.r = rng(((o[0] * 7.31 + o[1] * 13.7 + o[2] * 3.1 + w * 5.3 + h * 1.7) * 997) | 0);
    }
    p3(a, b, e = 0) { const { o, u, v, n } = this; return [o[0] + u[0] * a + v[0] * b + n[0] * e, o[1] + u[1] * a + v[1] * b + n[1] * e, o[2] + u[2] * a + v[2] * b + n[2] * e]; }
    q(a, b, e) { const p = this.p3(a, b, e); return pr(p[0], p[1], p[2]); }
    P(a, b, e) { const p = this.q(a, b, e); return f1(p[0]) + ' ' + f1(p[1]); }
    // yüzün ışığına göre tonlanmış renk; dt ile açılıp koyulaşır
    c(col, dt = 0) { return dt === null ? col : tone(col, this.t + dt); }      // dt null: renk olduğu gibi (ışık saçan şeyler)
    put(layer, cls, d, attr = '') { if (!d) return this; const k = layer + '|' + cls + '|' + attr; this.B.set(k, (this.B.get(k) || '') + d); return this; }
    fill(col, dt = 0) { this.mc = col; this.col = this.c(col, dt); return this; }
    poly(pts, col, layer = 3, dt = 0) { return this.put(layer, kf(this.c(col, dt)), 'M' + pts.map(p => this.P(p[0], p[1], p[2] || 0)).join(' ') + 'Z'); }
    rect(a, b, w, h, col, layer = 3, dt = 0) { return this.poly([[a, b], [a + w, b], [a + w, b + h], [a, b + h]], col, layer, dt); }
    // çizgi: pts = [[a,b],...]; kalınlık ekran pikseli
    line(pts, col, wid = 1, layer = 6, dt = 0) { return this.put(layer, 'Ln ' + ks(this.c(col, dt)), 'M' + pts.map(p => this.P(p[0], p[1], p[2] || 0)).join(' '), `stroke-width="${wid}"`); }
    seg(a0, b0, a1, b1) { if (this.shape) { const c = clipSeg([a0, b0], [a1, b1], this.shape); if (!c) return ''; [[a0, b0], [a1, b1]] = c; } return `M${this.P(a0, b0)} ${this.P(a1, b1)}`; }
    // ekran uzayında daire (yaprak, çiçek, topuz): merkez yüz koordinatında, yarıçap piksel
    dot(a, b, rpx, col, layer = 8, dt = 0, e = 0) { const p = this.q(a, b, e); return this.put(layer, kf(this.c(col, dt)), circ(p[0], p[1], rpx)); }
    // biçim yolu: rect | arch (yuvarlak kemer) | point (sivri kemer) | seg (basık kemer) | round (daire/oval)
    shapeD(kind, a, b, w, h, e = 0) {
      const Q = (x, y) => this.P(x, y, e);
      if (kind === 'round') { const ca = a + w / 2, cb = b + h / 2, ra = w / 2, rb = h / 2, k = .5523;
        return `M${Q(ca - ra, cb)}C${Q(ca - ra, cb + rb * k)} ${Q(ca - ra * k, cb + rb)} ${Q(ca, cb + rb)}C${Q(ca + ra * k, cb + rb)} ${Q(ca + ra, cb + rb * k)} ${Q(ca + ra, cb)}C${Q(ca + ra, cb - rb * k)} ${Q(ca + ra * k, cb - rb)} ${Q(ca, cb - rb)}C${Q(ca - ra * k, cb - rb)} ${Q(ca - ra, cb - rb * k)} ${Q(ca - ra, cb)}Z`; }
      if (kind === 'arch') { const r = Math.min(w / 2, h), ys = b + h - r, k = .5523 * r, m = a + w / 2;
        return `M${Q(a, b)} ${Q(a, ys)}C${Q(a, ys + k)} ${Q(m - k, b + h)} ${Q(m, b + h)}C${Q(m + k, b + h)} ${Q(a + w, ys + k)} ${Q(a + w, ys)}L${Q(a + w, b)}Z`; }
      if (kind === 'point') { const r = Math.min(w * .62, h), ys = b + h - r, m = a + w / 2;
        return `M${Q(a, b)} ${Q(a, ys)}Q${Q(a, ys + r * .62)} ${Q(m, b + h)}Q${Q(a + w, ys + r * .62)} ${Q(a + w, ys)}L${Q(a + w, b)}Z`; }
      if (kind === 'seg') { const r = Math.min(w * .22, h), ys = b + h - r, m = a + w / 2;
        return `M${Q(a, b)} ${Q(a, ys)}Q${Q(a + w * .12, b + h)} ${Q(m, b + h)}Q${Q(a + w * .88, b + h)} ${Q(a + w, ys)}L${Q(a + w, b)}Z`; }
      return `M${Q(a, b)} ${Q(a + w, b)} ${Q(a + w, b + h)} ${Q(a, b + h)}Z`;
    }
    shp(kind, a, b, w, h, col, layer = 3, dt = 0) { return this.put(layer, kf(this.c(col, dt)), this.shapeD(kind, a, b, w, h)); }
    // ucuz nokta kümesi: pts [[a,b],...] yüz koordinatı, çap piksel
    dots(pts, d, col, layer = 8, dt = 0) { return this.put(layer, 'Ln ' + ks(this.c(col, dt)), pts.map(p => 'M' + this.P(p[0], p[1], p[2] || 0) + 'h.01').join(''), `stroke-width="${d}"`); }
    // yatay kuşak: su basman, silme, saçak altı gölgesi
    band(b, h, col, dt = 0, layer = 2) { return this.rect(0, b, this.w, h, col === undefined ? this.mc : col, layer, dt); }
    shadeTop(h = .2, dt = -.15) { return this.band(this.h - h, h, this.mc, dt, 2); }
    shadeBottom(h = .12, dt = -.08) { return this.band(0, h, this.mc, dt, 2); }

    /* --- dokular (ipucu niteliğinde: her yer dolu değil) --- */
    // taş / tuğla derzleri
    courses(o = {}) {
      const { rh = .3, bw = .62, dens = .5, dt = -.11, wid = .8, a0 = 0, a1 = this.w, b0 = 0, b1 = this.h } = o, r = this.r; let d = '';
      for (let row = 0, b = b0 + rh; b < b1 - .04; b += rh, row++) {
        let a = a0; while (a < a1) { const len = .5 + r() * 1.7, e = Math.min(a1, a + len); if (r() < dens + .2) d += this.seg(a, b, e, b); a = e + (r() < dens ? .05 : .35 + r() * 1.1); }
        for (let a = a0 + (row % 2 ? bw / 2 : 0) + bw * (.25 + r() * .2); a < a1 - .06; a += bw) if (r() < dens) d += this.seg(a, b - rh, a, b);
      }
      return this.put(2.5, 'Ln ' + ks(this.c(this.mc, dt)), d, `stroke-width="${wid}"`);
    }
    // tek tek taşlar: açık ve koyu yamalar
    stones(n = 8, o = {}) {
      const { rh = .3, a0 = 0, a1 = this.w, b0 = 0, b1 = this.h, dt = .09 } = o, r = this.r; let dl = '', dd = '';
      for (let i = 0; i < n; i++) { const w = .34 + r() * .46, a = a0 + r() * Math.max(0, a1 - a0 - w), b = b0 + Math.floor(r() * Math.max(1, (b1 - b0) / rh - 1)) * rh + .03, h = rh - .06;
        const d = `M${this.P(a, b)} ${this.P(a + w, b)} ${this.P(a + w, b + h)} ${this.P(a, b + h)}Z`; if (r() < .5) dl += d; else dd += d; }
      return this.put(2.2, kf(this.c(this.mc, dt)), dl).put(2.2, kf(this.c(this.mc, -dt)), dd);
    }
    // tahta kaplama çizgileri: dir 'v' düşey, 'h' yatay
    planks(o = {}) {
      const { dir = 'v', step = .24, dt = -.14, wid = .8, a0 = 0, a1 = this.w, b0 = 0, b1 = this.h } = o; let d = '';
      if (dir === 'v') for (let a = a0 + step; a < a1 - .02; a += step) d += this.seg(a, b0, a, b1); else for (let b = b0 + step; b < b1 - .02; b += step) d += this.seg(a0, b, a1, b);
      return this.put(2.5, 'Ln ' + ks(this.c(this.mc, dt)), d, `stroke-width="${wid}"`);
    }
    // ahşap çatkı (hımış): dikmeler, kuşaklar, çaprazlar
    timber(o = {}) {
      const { col = M.ahsapK, posts = [], rails = [], braces = [], wid = 2 } = o; let d = '';
      for (const a of posts) d += this.seg(a, 0, a, this.h); for (const b of rails) d += this.seg(0, b, this.w, b);
      for (const [a0, b0, a1, b1] of braces) d += this.seg(a0, b0, a1, b1);
      return this.put(3.5, 'Ln ' + ks(this.c(col)), d, `stroke-width="${wid}"`);
    }
    // alaturka kiremit: yamaç boyunca oluklar, saçakta dalgalı uç, tek tük farklı kiremit
    tiles(o = {}) {
      const { step = .25, dt = -.17 } = o, r = this.r, w = this.w, h = this.h; let dk = '', lt = '', pl = '', pd = '';
      for (let a = step * .5; a < w - .02; a += step) {
        let b = 0; while (b < h) { const e = Math.min(h, b + .5 + r() * 2.2); dk += this.seg(a, b, a, e); b = e + (r() < .7 ? 0 : .12 + r() * .2); }
        if (r() < .55) { const b0 = r() * h * .6, e = Math.min(h, b0 + .4 + r() * 1.2); lt += this.seg(a + step * .5, b0, a + step * .5, e); }
      }
      const n = Math.round(w * h * .55);
      for (let i = 0; i < n; i++) { const a = Math.floor(r() * (w / step - 1)) * step + step * .5, b = r() * (h - .5), hh = .32 + r() * .3; let p = [[a, b], [a + step, b], [a + step, b + hh], [a, b + hh]];
        if (this.shape && !p.every(q => inPoly(q, this.shape))) continue; const d = 'M' + p.map(q => this.P(q[0], q[1])).join(' ') + 'Z'; if (r() < .5) pl += d; else pd += d; }
      this.put(2.2, kf(this.c(this.mc, .1)), pl).put(2.2, kf(this.c(this.mc, -.1)), pd);
      this.put(2.5, 'Ln ' + ks(this.c(this.mc, dt)), dk, 'stroke-width=".9"').put(2.6, 'Ln ' + ks(this.c(this.mc, .16)), lt, 'stroke-width=".8"');
      return this;
    }
    // kurşun kaplama / düz levha derzleri
    seams(o = {}) { const { step = .5, dt = -.13 } = o; let d = ''; for (let a = step; a < this.w - .02; a += step) d += this.seg(a, 0, a, this.h); return this.put(2.5, 'Ln ' + ks(this.c(this.mc, dt)), d, 'stroke-width=".8"'); }
    // saz / padavra: yatay sıralar
    rows(o = {}) { const { step = .3, dt = -.14 } = o, r = this.r; let d = ''; for (let b = step; b < this.h - .02; b += step) { let a = 0; while (a < this.w) { const e = Math.min(this.w, a + .6 + r() * 1.6); d += this.seg(a, b, e, b); a = e + r() * .25; } } return this.put(2.5, 'Ln ' + ks(this.c(this.mc, dt)), d, 'stroke-width=".9"'); }
    // sıva dökülmesi: altından tuğla görünen yamalar
    patches(n = 2, o = {}) {
      const { col = M.kil, a0 = .2, a1 = this.w - .2, b0 = .1, b1 = this.h - .3 } = o, r = this.r;
      for (let i = 0; i < n; i++) { const a = a0 + r() * Math.max(.01, a1 - a0 - .7), b = b0 + r() * Math.max(.01, b1 - b0 - .4), w = .45 + r() * .5, h = .28 + r() * .3;
        const pts = [[a, b + h * .2], [a + w * .3, b], [a + w * .8, b + h * .1], [a + w, b + h * .55], [a + w * .7, b + h], [a + w * .2, b + h * .85]]; this.poly(pts, col, 2.1, -.02);
        let d = ''; for (let k = 1; k < 3; k++) d += this.seg(a + w * .15, b + h * k / 3, a + w * .85, b + h * k / 3); this.put(2.3, 'Ln ' + ks(this.c(col, -.16)), d, 'stroke-width=".7"'); }
      return this;
    }

    /* --- pencere --- */
    // o: kind rect|arch|point|seg|round · frame · sove (taş çerçeve rengi) · shut (kepenk rengi) · sill:false · bars:[sütun,satır] · box (çiçeklik rengi) · kafes · lit (true/false/olasılık)
    win(a, b, w, h, o = {}) {
      const kind = o.kind || 'rect', fr = o.frame || M.ahsapK, fw = o.fw === undefined ? Math.max(.035, Math.min(.065, w * .11)) : o.fw, r = this.r;
      const lit = o.lit === undefined ? r() < .55 : (typeof o.lit === 'number' ? r() < o.lit : o.lit), gl = lit ? M.camI : M.cam;
      if (o.sove) this.shp(kind, a - .07, b - .02, w + .14, h + .09, o.sove, 3, .08);
      this.shp(kind, a, b, w, h, fr, 4).shp(kind, a + fw, b + fw, w - 2 * fw, h - 2 * fw, gl, 5, -.04);
      const ia = a + fw, ib = b + fw, iw = w - 2 * fw, ih = h - 2 * fw, rectTop = kind === 'rect' ? ib + ih : ib + ih - Math.min(iw / 2, ih) * (kind === 'round' ? 1 : .9);
      if (kind !== 'round') { this.poly([[ia, rectTop], [ia + iw * .5, rectTop], [ia, rectTop - ih * .34]], lit ? M.camPI : M.camP, 5.5, -.02);
        if (kind === 'rect') this.rect(ia, ib + ih - .05, iw, .05, gl, 5.6, -.3); }
      const [bc, br] = o.bars || (w > .75 ? [3, 2] : [2, h > .8 ? 3 : 2]); let d = '';
      for (let i = 1; i < bc; i++) d += `M${this.P(ia + iw * i / bc, ib)} ${this.P(ia + iw * i / bc, kind === 'rect' ? ib + ih : rectTop)}`;
      for (let i = 1; i < br; i++) d += `M${this.P(ia, ib + (rectTop - ib) * i / br)} ${this.P(ia + iw, ib + (rectTop - ib) * i / br)}`;
      if (kind !== 'rect' && kind !== 'round') d += `M${this.P(ia, rectTop)} ${this.P(ia + iw, rectTop)}`;
      this.put(6, 'Ln ' + ks(this.c(fr)), d, 'stroke-width=".9"');
      if (o.sill !== false) this.rect(a - .06, b - .07, w + .12, .07, o.sove || M.tas, 4, .14);
      if (o.kafes) { let k = ''; const n = Math.max(3, Math.round(iw / .12)), hh = (rectTop - ib) * (o.kafes === true ? .55 : o.kafes);
        for (let i = 0; i <= n; i++) { const x = ia + iw * i / n; k += `M${this.P(x, ib)} ${this.P(Math.min(ia + iw, x + hh * .6), ib + Math.min(hh, (ia + iw - x) / .6))}M${this.P(x, ib)} ${this.P(Math.max(ia, x - hh * .6), ib + Math.min(hh, (x - ia) / .6))}`; }
        this.put(6.2, 'Ln ' + ks(this.c(fr, .1)), k, 'stroke-width=".7"'); }
      if (o.shut) { const sw = w * .46; for (const sa of [a - sw - .015, a + w + .015]) { this.rect(sa, b, sw, kind === 'rect' ? h : rectTop - b + fw, o.shut, 4.2);
        let s = ''; for (let i = 1; i < 5; i++) s += `M${this.P(sa + .03, b + h * i / 5 * (kind === 'rect' ? 1 : .8))} ${this.P(sa + sw - .03, b + h * i / 5 * (kind === 'rect' ? 1 : .8))}`; this.put(6.1, 'Ln ' + ks(this.c(o.shut, -.2)), s, 'stroke-width=".7"'); } }
      if (o.box) { this.rect(a - .05, b - .2, w + .1, .13, o.box === true ? M.ahsap : o.box, 7);
        const fl = [M.kirmizi, M.begonvil, M.sari, M.bez][Math.floor(r() * 4)]; for (let i = 0; i < 5; i++) { const x = a + w * (i + .5) / 5; this.dot(x, b - .06 + r() * .05, 2.1 + r() * .8, M.sarmasik, 7.5, r() * .2 - .1); if (r() < .7) this.dot(x + (r() - .5) * .06, b - .02 + r() * .04, 1.1, fl, 7.8, .1); } }
      return this;
    }
    // n pencereyi a0..a1 arasına eşit aralıkla dizer
    wins(n, b, w, h, o = {}, a0 = 0, a1 = this.w) { const gap = (a1 - a0 - n * w) / (n + 1); for (let i = 0; i < n; i++) this.win(a0 + gap + i * (w + gap), b, w, h, o); return this; }

    /* --- kapı --- */
    // o: kind · col · sove (taş çerçeve; null = yok) · double · open (içi görünür) · b (taban yüksekliği) · fan (kemer camı) · lamp
    door(a, w, h, o = {}) {
      const kind = o.kind || 'rect', col = o.col || M.ahsapK, b = o.b || 0;
      if (o.sove !== null) this.shp(kind, a - .09, b, w + .18, h + .09, o.sove || M.tas, 3, .08);
      this.shp(kind, a, b, w, h, o.open ? (o.glow ? M.icI : M.ic) : M.ic, 4, -.1 * 0);
      if (!o.open) {
        const top = kind === 'rect' ? h - .03 : (o.fan ? h - Math.min(w / 2, h) : h - .03);
        this.shp(o.fan ? 'rect' : kind, a + .035, b, w - .07, top, col, 5);
        if (o.fan) { this.shp(kind, a + .05, b + top + .03, w - .1, h - top - .07, this.r() < .6 ? M.camI : M.cam, 5); }
        let d = ''; const n = Math.max(2, Math.round(w / .2)), ph = kind === 'rect' || o.fan ? top : h - Math.min(w / 2, h) * .9;
        for (let i = 1; i < n; i++) d += `M${this.P(a + .035 + (w - .07) * i / n, b)} ${this.P(a + .035 + (w - .07) * i / n, b + ph - .03)}`;
        this.put(6, 'Ln ' + ks(this.c(col, -.2)), d, 'stroke-width=".8"');
        if (o.double) this.line([[a + w / 2, b], [a + w / 2, b + ph]], col, 1.3, 6.1, -.34);
        this.line([[a + .06, b + ph * .28], [a + w - .06, b + ph * .28]], M.demir, 1, 6.2).line([[a + .06, b + ph * .74], [a + w - .06, b + ph * .74]], M.demir, 1, 6.2);
        this.dot(a + (o.double ? w / 2 - .06 : w - .12), b + ph * .5, 1.1, M.bronz, 6.5, .2);
      } else this.poly([[a, b], [a + w, b], [a + w, b, -.3], [a, b, -.3]], o.floor || M.parkeK, 4.5, -.2);
      if (o.lamp) this.lantern(a + w + .22, b + h * .86);
      return this;
    }
    // duvar feneri: gece hâleli
    lantern(a, b, o = {}) {
      const e = o.out === undefined ? .22 : o.out, p = this.q(a, b, e), w0 = this.q(a, b + .1, 0);
      this.put(8, 'Ln ' + ks(M.demir), `M${f1(w0[0])} ${f1(w0[1])} ${f1(p[0])} ${f1(p[1] - 3)}`, 'stroke-width="1"');
      this.put(8.1, kf(M.demir), `M${f1(p[0] - 2.2)} ${f1(p[1] - 3)}h4.4v1.2h-4.4zM${f1(p[0] - 1.6)} ${f1(p[1] + 3.6)}h3.2v1h-3.2z`).put(8.2, kf('#ffe9b0>#fff1c2'), `M${f1(p[0] - 1.8)} ${f1(p[1] - 1.8)}h3.6v5.4h-3.6z`);
      this.put(9, 'Nl', `<circle cx="${f1(p[0])}" cy="${f1(p[1] + 1)}" r="${o.r || 15}" fill="url(#${glowId()})"/>`, 'raw');
      return this;
    }
    // tabela: düz levha
    sign(a, b, w, h, col, o = {}) { this.rect(a, b, w, h, o.frame || M.ahsapK, 7).rect(a + .04, b + .04, w - .08, h - .08, col, 7.1); if (o.mark) this.dot(a + w / 2, b + h / 2, Math.min(w, h) * U * .22, o.mark, 7.2, .1); return this; }

    /* --- kemerli açıklıklar (revak, tezgâh gözü, kapı geçidi) --- */
    // a0..a1 arasına n göz; o: b · pier (ayak eni) · kind · th (duvar kalınlığı) · dark (iç renk) · thru (arkası görünür) · cap (başlık) · ring (kemer çizgisi) · floor
    arcade(a0, a1, n, h, o = {}) {
      const { b = 0, pier = .22, kind = 'arch', th = .32, thru = false, cap = true, ring = true } = o, dark = o.dark || (o.glow ? M.icI : M.ic);
      const span = (a1 - a0 - pier * (n + 1)) / n, left = dot(this.u, VIEW) > 0, nj = left ? this.u : this.u.map(v => -v), jt = toneOf(nj);
      const r = kind === 'arch' ? Math.min(span / 2, h) : kind === 'point' ? Math.min(span * .62, h) : kind === 'seg' ? Math.min(span * .22, h) : 0, ys = b + h - r;
      for (let i = 0; i < n; i++) {
        const oa = a0 + pier + i * (span + pier), d = this.shapeD(kind, oa, b, span, h);
        if (thru) this.holes += d; else this.put(3, kf(dark), d);
        if (o.floor !== false) this.put(4, kf(tone(o.floor || M.parkeK, thru ? .1 : -.3)), `M${this.P(oa, b)} ${this.P(oa + span, b)} ${this.P(oa + span, b, -th)} ${this.P(oa, b, -th)}Z`);      // floor:false = eşik çizme (havadaki kemer)
        // görünen iç yüz: yan ayak + kemerin o taraftaki kuşağı
        const ja = left ? oa : oa + span, fr = [[ja, b], [ja, ys]], bk = [];
        if (kind === 'arch') for (let k = 1; k <= 5; k++) { const th0 = left ? Math.PI - k * .178 : k * .178; fr.push([oa + span / 2 + Math.cos(th0) * (span / 2), ys + Math.sin(th0) * r]); }
        else if (kind !== 'rect') fr.push([ja + (left ? 1 : -1) * span * .1, ys + r * .5]);
        for (let k = fr.length - 1; k >= 0; k--) bk.push(fr[k]);
        this.put(5, kf(tone(this.mc, jt - .04)), 'M' + fr.map(p => this.P(p[0], p[1])).join(' ') + ' ' + bk.map(p => this.P(p[0], p[1], -th)).join(' ') + 'Z');
        if (ring && kind !== 'rect') this.put(6, 'Ln ' + ks(this.c(this.mc, -.16)), this.shapeD(kind, oa - .05, b, span + .1, h + .05).replace(/Z$/, ''), 'stroke-width=".8"');
      }
      if (cap && r) for (let i = 0; i <= n; i++) this.rect(a0 + i * (span + pier) - .03, ys - .05, pier + .06, .09, this.mc, 6.5, .16);
      return this;
    }

    /* --- sarmaşık, begonvil, mor salkım --- */
    // o: kind ivy|boug|wist · a0,a1 · top (başladığı yükseklik) · drop [en az, en çok] · dens · stem (gövdenin a konumu)
    vine(o = {}) {
      const { kind = 'ivy', a0 = 0, a1 = this.w, top = this.h, drop = [.35, 1.1], dens = 1 } = o, r = this.r;
      const leaf = kind === 'wist' ? M.sarmasik : M.sarmasik, flo = kind === 'boug' ? M.begonvil : kind === 'wist' ? M.mor : null;
      const B = [[], [], [], [], []];
      const n = Math.max(2, Math.round((a1 - a0) * 3.2 * dens));
      for (let i = 0; i < n; i++) { const a = a0 + (i + r()) / n * (a1 - a0), len = drop[0] + r() * (drop[1] - drop[0]);
        for (let b = top + .06; b > top - len; b -= .1 + r() * .05) { const x = a + (r() - .5) * .16, rad = 2 + r() * 2.4, p = this.q(Math.max(0, Math.min(this.w, x)), b, .04);
          const isF = flo && r() < (kind === 'boug' ? .62 : .5); B[isF ? 3 : 0].push([p[0], p[1], rad]);
          if (r() < .6) B[isF ? 4 : 1].push([p[0] - 1, p[1] - 1.1, rad * .62]); if (!isF && r() < .25) B[2].push([p[0] - 1.4, p[1] - 1.5, rad * .36]); } }
      if (o.stem !== undefined) { const s = o.stem; this.put(7.5, 'Ln ' + ks(M.govde), `M${this.P(s, 0)}Q${this.P(s + .12, top * .5)} ${this.P(s - .05, top)}`, 'stroke-width="1.4"'); }
      const cs = [tone(leaf, -.22), leaf, tone(leaf, .3), flo && tone(flo, -.12), flo && tone(flo, .22)];
      B.forEach((l, i) => { if (l.length && cs[i]) this.put(8 + i * .1, kf(cs[i]), l.map(c => circ(c[0], c[1], c[2])).join('')); });
      return this;
    }
    svg() {
      let s = '';
      if (this.col) { const out = this.shape || [[0, 0], [this.w, 0], [this.w, this.h], [0, this.h]];
        s += `<path class="${kf(this.col)}"${this.holes ? ' fill-rule="evenodd"' : ''} d="M${out.map(p => this.P(p[0], p[1])).join(' ')}Z${this.holes}"/>`; }
      const keys = [...this.B.keys()].sort((a, b) => parseFloat(a) - parseFloat(b));
      for (const k of keys) { const [, cls, attr] = k.split('|'); s += attr === 'raw' ? this.B.get(k).replace(/<(\w+) /g, `<$1 class="${cls}" `) : `<path class="${cls}"${attr ? ' ' + attr : ''} d="${this.B.get(k)}"/>`; }
      return s;
    }
  }
  const inPoly = (p, poly) => { const sg = area2(poly) > 0 ? 1 : -1; for (let i = 0; i < poly.length; i++) { const a = poly[i], b = poly[(i + 1) % poly.length]; if (((b[0] - a[0]) * (p[1] - a[1]) - (b[1] - a[1]) * (p[0] - a[0])) * sg < -1e-9) return false; } return true; };

  /* =========================================================
     YAPI KURUCU: katı cisimleri toplar, derinliğe göre sıralar, gölgelerini çıkarır.
     ========================================================= */
  class Builder {
    constructor(o = {}) { this.items = []; this.grd = []; this.fxs = []; this.gz = 0; this.r = rng(o.seed || 7); this.o = o; this.meta = {}; }
    // serbest parça: bb = [x0,y0,z0,x1,y1,z1] (sıralama için), draw = SVG metni ya da üreten işlev
    // o.cast: false = gölge yok · o.pts: gölge için 3B noktalar (verilmezse kutunun köşeleri)
    item(bb, draw, o = {}) { const it = { bb, draw, i: this.items.length, cast: o.cast !== false, pts: o.pts, gz: o.gz === undefined ? this.gz : o.gz }; this.items.push(it); return it; }
    ground(svg) { this.grd.push(svg); return this; }
    fx(t, x, y, z = 0, o = {}) { this.fxs.push(Object.assign({ t, x, y, z }, o)); return this; }
    tag(x, y, z) { this.meta.tag = [x, y, z]; return this; }
    doorAt(x, y) { this.meta.door = [x, y]; return this; }

    /* --- kutu: L (+y, aydınlık), R (+x, gölge), T (üst) yüzleri döner --- */
    // o: L/R/T ayrı renk (T:null = üst çizilmez) · edge:false · cast:false
    box(x0, y0, z0, x1, y1, z1, mat, o = {}) {
      const L = new Face([x0, y1, z0], [1, 0, 0], [0, 0, 1], x1 - x0, z1 - z0, [0, 1, 0]);
      const R = new Face([x1, y1, z0], [0, -1, 0], [0, 0, 1], y1 - y0, z1 - z0, [1, 0, 0]);
      const T = new Face([x0, y0, z1], [1, 0, 0], [0, 1, 0], x1 - x0, y1 - y0, [0, 0, 1]);
      const cm = c => c === undefined ? mat : c;
      L.fill(cm(o.L)); R.fill(cm(o.R)); if (o.T !== null) T.fill(cm(o.T));
      const edge = o.edge !== false && (z1 - z0) > .3 && (x1 - x0) > .3;
      const it = this.item(o.bb || [x0, y0, z0, x1, y1, z1], () => L.svg() + R.svg() + (o.T !== null ? T.svg() : '')
        + (edge ? `<path class="Ln ${ks(tone(cm(o.L), .3))}" stroke-width=".8" d="M${P(x1, y1, z0 + .04)} ${P(x1, y1, z1)}"/>` : ''), o);
      return { L, R, T, it, x0, y0, z0, x1, y1, z1 };
    }
    // ince levha (üstü görünür): döşeme, tabla, sundurma
    slab(x0, y0, x1, y1, z, th, mat, o = {}) { return this.box(x0, y0, z - th, x1, y1, z, mat, Object.assign({ edge: false }, o)); }

    /* --- beşik çatı --- */
    // (x0..x1, y0..y1) DUVAR ölçüsü, z duvar üstü, rise mahya yüksekliği. o: axis 'x'|'y' (mahya yönü) · ov (saçak) · tex 'tile'|'seam'|'rows'|false · wall (alınlık rengi)
    // döner: A (öne bakan yamaç), B (arka yamaç; görünmüyorsa null), G (üçgen alınlık yüzü)
    gable(x0, y0, x1, y1, z, rise, mat, o = {}) {
      const ax = o.axis || (x1 - x0 >= y1 - y0 ? 'x' : 'y'), ov = o.ov === undefined ? .16 : o.ov, th = o.th || .08, wall = o.wall || M.kirec;
      let A, B, G, strips = [], bb, pts, ridge;
      if (ax === 'x') {
        const half = (y1 - y0) / 2, ym = (y0 + y1) / 2, s = rise / half, ext = half + ov, zr = z + rise, ze = z - ov * s, X0 = x0 - ov, X1 = x1 + ov, len = Math.hypot(ext, zr - ze);
        A = new Face([X0, ym + ext, ze], [1, 0, 0], unit([0, -ext, zr - ze]), X1 - X0, len, unit([0, zr - ze, ext]));
        B = new Face([X0, ym, zr], [1, 0, 0], unit([0, -ext, ze - zr]), X1 - X0, len, unit([0, -(zr - ze), ext]));
        G = new Face([x1, y1, z], [0, -1, 0], [0, 0, 1], y1 - y0, rise, [1, 0, 0], [[0, 0], [y1 - y0, 0], [half, rise]]);
        strips = [[[X1, ym, zr], [X1, ym - ext, ze], [X1, ym - ext, ze - th], [X1, ym, zr - th], toneOf([1, 0, 0]) - .06, 0],
          [[X1, ym + ext, ze], [X1, ym, zr], [X1, ym, zr - th], [X1, ym + ext, ze - th], toneOf([1, 0, 0]) - .06, 1],
          [[X0, ym + ext, ze], [X1, ym + ext, ze], [X1, ym + ext, ze - th], [X0, ym + ext, ze - th], toneOf([0, 1, 0]) - .2, 1]];
        ridge = [[X0, ym, zr], [X1, ym, zr]]; bb = [X0, ym - ext, ze - th, X1, ym + ext, zr];
        pts = [[X0, ym - ext, ze], [X1, ym - ext, ze], [X1, ym + ext, ze], [X0, ym + ext, ze], [X0, ym, zr], [X1, ym, zr]];
      } else {
        const half = (x1 - x0) / 2, xm = (x0 + x1) / 2, s = rise / half, ext = half + ov, zr = z + rise, ze = z - ov * s, Y0 = y0 - ov, Y1 = y1 + ov, len = Math.hypot(ext, zr - ze);
        A = new Face([xm + ext, Y1, ze], [0, -1, 0], unit([-ext, 0, zr - ze]), Y1 - Y0, len, unit([zr - ze, 0, ext]));
        B = new Face([xm, Y1, zr], [0, -1, 0], unit([-ext, 0, ze - zr]), Y1 - Y0, len, unit([-(zr - ze), 0, ext]));
        G = new Face([x0, y1, z], [1, 0, 0], [0, 0, 1], x1 - x0, rise, [0, 1, 0], [[0, 0], [x1 - x0, 0], [half, rise]]);
        strips = [[[xm, Y1, zr], [xm - ext, Y1, ze], [xm - ext, Y1, ze - th], [xm, Y1, zr - th], toneOf([0, 1, 0]) - .2, 0],
          [[xm + ext, Y1, ze], [xm, Y1, zr], [xm, Y1, zr - th], [xm + ext, Y1, ze - th], toneOf([0, 1, 0]) - .2, 1],
          [[xm + ext, Y1, ze], [xm + ext, Y0, ze], [xm + ext, Y0, ze - th], [xm + ext, Y1, ze - th], toneOf([1, 0, 0]) - .06, 1]];
        ridge = [[xm, Y1, zr], [xm, Y0, zr]]; bb = [xm - ext, Y0, ze - th, xm + ext, Y1, zr];
        pts = [[xm - ext, Y0, ze], [xm + ext, Y0, ze], [xm + ext, Y1, ze], [xm - ext, Y1, ze], [xm, Y0, zr], [xm, Y1, zr]];
      }
      const bVis = dot(B.n, VIEW) > .02; A.fill(mat); B.fill(mat); G.fill(wall);
      const tex = o.tex === undefined ? 'tile' : o.tex, tx = o.step ? { step: o.step } : {}; if (tex) for (const f of bVis ? [A, B] : [A]) tex === 'tile' ? f.tiles(tx) : tex === 'seam' ? f.seams(tx) : f.rows(tx);
      const st = k => strips.filter(s => s[5] === k).map(s => `<path class="${kf(tone(mat, s[4]))}" d="M${PL(s.slice(0, 4))}Z"/>`).join('');
      this.item(bb, () => (bVis ? B.svg() : '') + G.svg() + st(0) + A.svg() + st(1)
        + `<path class="Ln ${ks(tone(mat, .3))}" stroke-width="2" d="M${PL(ridge)}"/>`, Object.assign({ pts }, o));
      return { A, B: bVis ? B : null, G };
    }
    /* --- kırma çatı (dört yana eğimli); kare tabanda piramit olur --- */
    // (x0..x1, y0..y1) saçak dahil DIŞ ölçü, z saçak yüksekliği. döner: L (+y yüzü), R (+x yüzü)
    hip(x0, y0, x1, y1, z, rise, mat, o = {}) {
      const dx = x1 - x0, dy = y1 - y0, h = Math.min(dx, dy) / 2, zr = z + rise, th = o.th || .08, alongX = dx >= dy;
      const r0 = alongX ? [x0 + h, y0 + h] : [x0 + h, y0 + h], r1 = alongX ? [x1 - h, y0 + h] : [x0 + h, y1 - h], sl = Math.hypot(h, rise);
      const L = new Face([x0, y1, z], [1, 0, 0], unit([0, -h, rise]), dx, sl, unit([0, rise, h]), alongX ? [[0, 0], [dx, 0], [dx - h, sl], [h, sl]] : [[0, 0], [dx, 0], [h, sl]]);
      const R = new Face([x1, y1, z], [0, -1, 0], unit([-h, 0, rise]), dy, sl, unit([rise, 0, h]), alongX ? [[0, 0], [dy, 0], [h, sl]] : [[0, 0], [dy, 0], [dy - h, sl], [h, sl]]);
      const Bk = new Face([x0, y0, z], [1, 0, 0], unit([0, h, rise]), dx, sl, unit([0, -rise, h]), alongX ? [[0, 0], [dx, 0], [dx - h, sl], [h, sl]] : [[0, 0], [dx, 0], [h, sl]]);
      const Lf = new Face([x0, y1, z], [0, -1, 0], unit([h, 0, rise]), dy, sl, unit([-rise, 0, h]), alongX ? [[0, 0], [dy, 0], [h, sl]] : [[0, 0], [dy, 0], [dy - h, sl], [h, sl]]);
      const bVis = dot(Bk.n, VIEW) > .02; for (const f of [L, R, Bk, Lf]) f.fill(mat);
      const tex = o.tex === undefined ? 'tile' : o.tex, tx = o.step ? { step: o.step } : {}; if (tex) for (const f of bVis ? [L, R, Bk, Lf] : [L, R]) tex === 'tile' ? f.tiles(tx) : tex === 'seam' ? f.seams(tx) : f.rows(tx);
      const hips = `M${P(x0, y1, z)} ${P(r0[0], alongX ? r0[1] : r1[1], zr)}M${P(x1, y1, z)} ${P(r1[0], r1[1], zr)} ${P(x1, y0, z)}M${P(r0[0], r0[1], zr)} ${P(r1[0], r1[1], zr)}`;
      this.item([x0, y0, z - th, x1, y1, zr], () => (bVis ? Bk.svg() + Lf.svg() : '') + L.svg() + R.svg()
        + `<path class="${kf(tone(mat, toneOf([0, 1, 0]) - .2))}" d="M${PL([[x0, y1, z], [x1, y1, z], [x1, y1, z - th], [x0, y1, z - th]])}Z"/><path class="${kf(tone(mat, toneOf([1, 0, 0]) - .06))}" d="M${PL([[x1, y1, z], [x1, y0, z], [x1, y0, z - th], [x1, y1, z - th]])}Z"/>`
        + `<path class="Ln ${ks(tone(mat, .3))}" stroke-width="1.6" d="${hips}"/>`, Object.assign({ pts: [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z], [r0[0], r0[1], zr], [r1[0], r1[1], zr]] }, o));
      return { L, R };
    }
    /* --- düz dam: korkuluklu teras; döner: T (döşeme yüzü) --- */
    flat(x0, y0, x1, y1, z, mat, o = {}) {
      const ph = o.ph === undefined ? .2 : o.ph, pt = o.pt || .13, fl = o.floor || tone(mat, -.06);
      const T = new Face([x0, y0, z], [1, 0, 0], [0, 1, 0], x1 - x0, y1 - y0, [0, 0, 1]); T.fill(fl);
      this.item([x0, y0, z - .02, x1, y1, z], () => T.svg(), { cast: false });
      const e = { edge: false, cast: false };
      this.box(x0, y0, z, x1, y0 + pt, z + ph, mat, e); this.box(x0, y0 + pt, z, x0 + pt, y1, z + ph, mat, e);
      this.box(x0 + pt, y1 - pt, z, x1, y1, z + ph, mat, e); this.box(x1 - pt, y0 + pt, z, x1, y1 - pt, z + ph, mat, e);
      return { T };
    }
    /* --- silindir: kule, sütun, fıçı gövdesi. döner: face(t, zc, w, h) ile yüzeyde ayrıntı yüzü --- */
    // t: -1 (sol kenar) … 0 (tam ön) … +1 (sağ kenar). o: top (üst renk; null = çizme) · rings [z...] (derz halkaları) · cast
    cyl(cx, cy, r, z0, z1, mat, o = {}) {
      const c0 = pr(cx, cy, z0), c1 = pr(cx, cy, z1), rx = r * Math.SQRT2 * U, ry = rx / 2, subs = [], self = this;
      const arc = (z, e = 0) => { const c = pr(cx, cy, z), R = rx + e; return `M${f1(c[0] - R)} ${f1(c[1])}A${f1(R)} ${f1(R / 2)} 0 0 0 ${f1(c[0] + R)} ${f1(c[1])}`; };
      const api = {
        cx, cy, r, z0, z1,
        // yüzeye teğet küçük düzlem: pencere, kapı, mazgal için
        face(t, zc, w, h) { const ph = (45 - 90 * t) * Math.PI / 180, n = [Math.cos(ph), Math.sin(ph), 0], u = [Math.sin(ph), -Math.cos(ph), 0];
          const f = new Face([cx + r * n[0] - u[0] * w / 2, cy + r * n[1] - u[1] * w / 2, zc], u, [0, 0, 1], w, h, n); f.mc = mat; subs.push(f); return f; },
        // çepeçevre kuşak (silme, korniş): z..z+h, e kadar dışa taşkın
        band(z, h, col, e = 0, top) { const a = pr(cx, cy, z), b = pr(cx, cy, z + h), R = rx + e * Math.SQRT2 * U, cap = top === undefined ? e > .03 : top;
          // top: true = tam üst yüz (kuşak silindirin tepesindeyse) · 'lip' = yalnız dışarı taşan dudak (üstünde gövde sürüyorsa) · false = yok · renk = o renkte tam yüz
          const ye = b[1] - (R / 2) * Math.sqrt(Math.max(0, 1 - (rx / R) * (rx / R)));
          const lip = `${ell(b[0], b[1], R, R / 2)}M${f1(b[0] - rx)} ${f1(b[1])}L${f1(b[0] - rx)} ${f1(ye)}A${f1(R)} ${f1(R / 2)} 0 0 1 ${f1(b[0] + rx)} ${f1(ye)}L${f1(b[0] + rx)} ${f1(b[1])}A${f1(rx)} ${f1(ry)} 0 0 1 ${f1(b[0] - rx)} ${f1(b[1])}Z`;
          subs.push({ svg: () => `<path fill="url(#${gradCyl(col || mat)})" d="M${f1(b[0] - R)} ${f1(b[1])}L${f1(a[0] - R)} ${f1(a[1])}A${f1(R)} ${f1(R / 2)} 0 0 0 ${f1(a[0] + R)} ${f1(a[1])}L${f1(b[0] + R)} ${f1(b[1])}A${f1(R)} ${f1(R / 2)} 0 0 1 ${f1(b[0] - R)} ${f1(b[1])}Z"/>` + (cap === 'lip' ? `<path class="${kf(tone(col || mat, .22))}" fill-rule="evenodd" d="${lip}"/>` : cap ? `<path class="${kf(tone(typeof cap === 'string' ? cap : col || mat, .22))}" d="${ell(b[0], b[1], R, R / 2)}"/>` : '') }); return api; },
        // mazgal dişleri: z yüksekliğinde çepeçevre n diş (arkadakilerin iç yüzü, öndekilerin dış yüzü görünür)
        merlons(z, n = 10, o = {}) { const mh = o.h || .3, mw = o.w || .34, e = o.e || 0, R = r + e, c = o.col || mat; let bk = '', frL = [], tp = '';
          const quad = (ph, rr, col) => { const ux = Math.sin(ph), uy = -Math.cos(ph), x = cx + rr * Math.cos(ph), y = cy + rr * Math.sin(ph); return `M${PL([[x - ux * mw / 2, y - uy * mw / 2, z], [x + ux * mw / 2, y + uy * mw / 2, z], [x + ux * mw / 2, y + uy * mw / 2, z + mh], [x - ux * mw / 2, y - uy * mw / 2, z + mh]])}Z`; };
          const list = []; for (let i = 0; i < n; i++) { const ph = (i + .5) / n * Math.PI * 2; list.push(ph); }
          list.sort((p, q) => (Math.cos(p) + Math.sin(p)) - (Math.cos(q) + Math.sin(q)));
          let s = ''; for (const ph of list) { const nn = [Math.cos(ph), Math.sin(ph), 0], front = dot(nn, VIEW) > 0, ux = Math.sin(ph), uy = -Math.cos(ph), th = .12;
            const xo = cx + R * nn[0], yo = cy + R * nn[1], xi = cx + (R - th) * nn[0], yi = cy + (R - th) * nn[1];
            const topq = `<path class="${kf(tone(c, toneOf([0, 0, 1])))}" d="M${PL([[xo - ux * mw / 2, yo - uy * mw / 2, z + mh], [xo + ux * mw / 2, yo + uy * mw / 2, z + mh], [xi + ux * mw / 2, yi + uy * mw / 2, z + mh], [xi - ux * mw / 2, yi - uy * mw / 2, z + mh]])}Z"/>`;
            s += front ? `<path class="${kf(tone(c, toneOf(nn)))}" d="${quad(ph, R, c)}"/>` + topq : `<path class="${kf(tone(c, toneOf([-nn[0], -nn[1], 0]) - .1))}" d="${quad(ph, R - th, c)}"/>` + topq; }
          subs.push({ svg: () => s }); return api; },
        // taş sıra çizgileri
        courses(step = .32, dt = -.1) { let d = ''; const rr = self.r; for (let z = z0 + step; z < z1 - .05; z += step) d += arc(z);
          for (let z = z0, k = 0; z < z1 - step; z += step, k++) for (let t = -.85 + (k % 2) * .16; t < .9; t += .32 + rr() * .06) { if (rr() < .35) continue; const ph = (45 - 90 * t) * Math.PI / 180, x = cx + r * Math.cos(ph), y = cy + r * Math.sin(ph); d += `M${P(x, y, z)} ${P(x, y, z + step)}`; }
          subs.push({ svg: () => `<path class="Ln ${ks(tone(mat, dt - .12))}" stroke-width=".8" opacity=".55" d="${d}"/>` }); return api; },
      };
      this.item([cx - r, cy - r, z0, cx + r, cy + r, z1], () =>
        `<path fill="url(#${gradCyl(mat)})" d="M${f1(c1[0] - rx)} ${f1(c1[1])}L${f1(c0[0] - rx)} ${f1(c0[1])}A${f1(rx)} ${f1(ry)} 0 0 0 ${f1(c0[0] + rx)} ${f1(c0[1])}L${f1(c1[0] + rx)} ${f1(c1[1])}A${f1(rx)} ${f1(ry)} 0 0 1 ${f1(c1[0] - rx)} ${f1(c1[1])}Z"/>`
        + (o.top === null ? '' : `<path class="${kf(tone(o.top || mat, .24))}" d="${ell(c1[0], c1[1], rx, ry)}"/>`) + subs.map(s => s.svg()).join(''), o);
      return api;
    }
    /* --- külah (koni çatı) --- */
    cone(cx, cy, r, z, rise, mat, o = {}) {
      const c = pr(cx, cy, z), ap = pr(cx, cy, z + rise), rx = r * Math.SQRT2 * U, ry = rx / 2, H = c[1] - ap[1];
      this.item([cx - r, cy - r, z, cx + r, cy + r, z + rise], () => {
        if (H <= ry) return `<path fill="url(#${gradDome(mat)})" d="${ell(c[0], c[1], rx, ry)}"/>`;
        const sn = ry / H, cs = Math.sqrt(1 - sn * sn), ty = c[1] - ry * sn, lx = c[0] - rx * cs, rxx = c[0] + rx * cs; let d = '';
        const n = Math.max(6, Math.round(r * 7)); for (let i = 1; i < n; i++) { const a = Math.PI * (1 - i / n) * 1.0, px = c[0] + rx * Math.cos(a), py = c[1] + ry * Math.sin(a); d += `M${f1(ap[0])} ${f1(ap[1])} ${f1(px)} ${f1(py)}`; }
        return `<path fill="url(#${gradCyl(mat)})" d="M${f1(ap[0])} ${f1(ap[1])}L${f1(lx)} ${f1(ty)}A${f1(rx)} ${f1(ry)} 0 1 0 ${f1(rxx)} ${f1(ty)}Z"/>`
          + (o.tex === false ? '' : `<path class="Ln ${ks(tone(mat, -.36))}" stroke-width=".8" opacity=".5" d="${d}"/>`)
          + `<path class="Ln ${ks(tone(mat, -.5))}" stroke-width="1.2" opacity=".6" d="M${f1(lx)} ${f1(ty)}A${f1(rx)} ${f1(ry)} 0 1 0 ${f1(rxx)} ${f1(ty)}"/>`;
      }, Object.assign({ pts: [[cx - r, cy, z], [cx + r, cy, z], [cx, cy - r, z], [cx, cy + r, z], [cx - r * .7, cy - r * .7, z], [cx + r * .7, cy + r * .7, z], [cx - r * .7, cy + r * .7, z], [cx + r * .7, cy - r * .7, z], [cx, cy, z + rise]] }, o));
    }
    /* --- kubbe: hf yükseklik oranı (1 = yarım küre), alem isteğe bağlı --- */
    dome(cx, cy, r, z, mat, o = {}) {
      const hf = o.hf === undefined ? 1 : o.hf, c = pr(cx, cy, z), R = r * Math.SQRT2 * U, Rv = R * hf * (ZK / Math.SQRT2 * .98 + .14), top = [c[0], c[1] - Rv];
      this.item([cx - r, cy - r, z, cx + r, cy + r, z + r * hf], () => {
        let s = `<path fill="url(#${gradDome(mat)})" d="M${f1(c[0] - R)} ${f1(c[1])}A${f1(R)} ${f1(Rv)} 0 0 1 ${f1(c[0] + R)} ${f1(c[1])}A${f1(R)} ${f1(R / 2)} 0 0 1 ${f1(c[0] - R)} ${f1(c[1])}Z"/>`;
        if (o.seams !== false) { let d = ''; for (const k of [-.72, -.36, 0, .36, .72]) d += `M${f1(top[0])} ${f1(top[1])}Q${f1(c[0] + R * k * 1.12)} ${f1(c[1] - Rv * .5)} ${f1(c[0] + R * k)} ${f1(c[1] + R / 2 * Math.sqrt(1 - k * k))}`;
          s += `<path class="Ln ${ks(tone(mat, -.3))}" stroke-width=".8" opacity=".5" d="${d}"/>`; }
        s += `<path class="${kf(tone(mat, .5))}" opacity=".5" d="M${f1(c[0] - R * .62)} ${f1(c[1] - Rv * .42)}Q${f1(c[0] - R * .5)} ${f1(c[1] - Rv * .86)} ${f1(c[0] - R * .08)} ${f1(c[1] - Rv * .93)}Q${f1(c[0] - R * .42)} ${f1(c[1] - Rv * .76)} ${f1(c[0] - R * .62)} ${f1(c[1] - Rv * .42)}Z"/>`;
        if (o.alem !== false) { const a = o.alem || M.altin; s += `<path class="Ln ${ks(a)}" stroke-width="1.4" d="M${f1(top[0])} ${f1(top[1] + 1)}v-9"/><path class="${kf(a)}" d="${circ(top[0], top[1] - 2.5, 2.1)}${circ(top[0], top[1] - 6.4, 1.4)}"/><path class="Ln ${ks(tone(a, .3))}" stroke-width="1.2" d="M${f1(top[0] - 2.4)} ${f1(top[1] - 12.5)}a2.6 2.6 0 1 0 4 2.6"/>`; }
        return s;
      }, Object.assign({ pts: [[cx - r, cy, z], [cx + r, cy, z], [cx, cy - r, z], [cx, cy + r, z], [cx - r * .7, cy - r * .7, z + r * hf * .7], [cx + r * .7, cy + r * .7, z + r * hf * .7], [cx - r * .7, cy + r * .7, z + r * hf * .7], [cx + r * .7, cy - r * .7, z + r * hf * .7], [cx, cy, z + r * hf]] }, o));
    }
    /* --- çokgen prizma (dışbükey taban; noktalar saat yönünün tersine ya da düzüne, fark etmez). döner: faces (görünen yan yüzler), T --- */
    prism(pts, z0, z1, mat, o = {}) {
      const ccw = area2(pts) > 0, p = ccw ? pts : pts.slice().reverse(), faces = [], h = z1 - z0;
      for (let i = 0; i < p.length; i++) { const a = p[i], b = p[(i + 1) % p.length], ex = b[0] - a[0], ey = b[1] - a[1], l = Math.hypot(ex, ey), n = [ey / l, -ex / l, 0];
        if (dot(n, VIEW) <= .01) continue;
        // ekranda soldan sağa: u·(1,-1) > 0 olmalı
        const fwd = (ex - ey) >= 0, f = new Face(fwd ? [a[0], a[1], z0] : [b[0], b[1], z0], fwd ? [ex / l, ey / l, 0] : [-ex / l, -ey / l, 0], [0, 0, 1], l, h, n); f.fill(mat); f.mid = (a[0] + b[0] + a[1] + b[1]) / 2; faces.push(f); }
      faces.sort((a, b) => a.mid - b.mid);
      const xs = p.map(q => q[0]), ys = p.map(q => q[1]);
      this.item([Math.min(...xs), Math.min(...ys), z0, Math.max(...xs), Math.max(...ys), z1], () => faces.map(f => f.svg()).join('')
        + (o.T === null ? '' : `<path class="${kf(tone(o.T || mat, toneOf([0, 0, 1])))}" d="M${PL(p.map(q => [q[0], q[1], z1]))}Z"/>`), Object.assign({ pts: p.map(q => [q[0], q[1], z0]).concat(p.map(q => [q[0], q[1], z1])) }, o));
      return { faces };
    }
    /* --- merdiven: dir 'y' (+y yönüne iner) | 'x' (+x yönüne iner). (x0,y0)-(x1,y1) taban dikdörtgeni, üst kot zTop başlangıç kenarında --- */
    stairs(x0, y0, x1, y1, zTop, zBot, dir, mat, o = {}) {
      const n = Math.max(2, Math.round((zTop - zBot) / (o.rise || .2))), dz = (zTop - zBot) / n; let tr = '', rs = '', hl = '';
      const lt = tone(mat, toneOf([0, 1, 0])), sd = tone(mat, toneOf([1, 0, 0])), tp = tone(mat, toneOf([0, 0, 1])); let side = [];
      if (dir === 'y') { const dy = (y1 - y0) / n;
        for (let i = 0; i < n; i++) { const y = y0 + (i + 1) * dy, zt = zTop - (i + 1) * dz + dz, zb = zt - dz;
          tr += `M${PL([[x0, y - dy, zt], [x1, y - dy, zt], [x1, y, zt], [x0, y, zt]])}Z`; rs += `M${PL([[x0, y, zb], [x1, y, zb], [x1, y, zt], [x0, y, zt]])}Z`; hl += `M${P(x0, y, zt)} ${P(x1, y, zt)}`;
          side.push([x1, y - dy, zt], [x1, y, zt]); }
        side.push([x1, y1, zBot], [x1, y0, zBot]);
        this.item([x0, y0, zBot, x1, y1, zTop], () => `<path class="${kf(tp)}" d="${tr}"/><path class="${kf(lt)}" d="${rs}"/><path class="${kf(sd)}" d="M${PL(side)}Z"/><path class="Ln ${ks(tone(mat, .42))}" stroke-width=".7" d="${hl}"/>`, Object.assign({ pts: [[x0, y0, zBot], [x1, y0, zBot], [x1, y1, zBot], [x0, y1, zBot], [x0, y0, zTop], [x1, y0, zTop]] }, o));
      } else { const dx = (x1 - x0) / n;
        for (let i = 0; i < n; i++) { const x = x0 + (i + 1) * dx, zt = zTop - i * dz, zb = zt - dz;
          tr += `M${PL([[x - dx, y0, zt], [x, y0, zt], [x, y1, zt], [x - dx, y1, zt]])}Z`; rs += `M${PL([[x, y1, zb], [x, y0, zb], [x, y0, zt], [x, y1, zt]])}Z`; hl += `M${P(x, y0, zt)} ${P(x, y1, zt)}`;
          side.push([x - dx, y1, zt], [x, y1, zt]); }
        side.push([x1, y1, zBot], [x0, y1, zBot]);
        this.item([x0, y0, zBot, x1, y1, zTop], () => `<path class="${kf(tp)}" d="${tr}"/><path class="${kf(sd)}" d="${rs}"/><path class="${kf(lt)}" d="M${PL(side)}Z"/><path class="Ln ${ks(tone(mat, .42))}" stroke-width=".7" d="${hl}"/>`, Object.assign({ pts: [[x0, y0, zBot], [x1, y0, zBot], [x1, y1, zBot], [x0, y1, zBot], [x0, y0, zTop], [x0, y1, zTop]] }, o));
      }
      return this;
    }
    /* --- baca: gövde + şapka + duman --- */
    chimney(x, y, z0, h, o = {}) {
      const w = o.w || .34, mat = o.mat || M.tas, b = this.box(x - w / 2, y - w / 2, z0, x + w / 2, y + w / 2, z0 + h, mat, { edge: false });
      this.box(x - w / 2 - .05, y - w / 2 - .05, z0 + h, x + w / 2 + .05, y + w / 2 + .05, z0 + h + .09, o.cap || tone(mat, -.12), { edge: false, cast: false });
      if (o.smoke !== false) this.fx('smoke', x, y, z0 + h + .12, { s: o.s || 1 });
      return b;
    }
    /* --- duvara bağlı parçalar: f bir kutunun L ya da R yüzü --- */
    // tente: a..a+w, b yüksekliğinden out kadar dışarı, drop kadar eğimli; cols: şerit renkleri
    awning(f, a, b, w, o = {}) {
      const out = o.out || .7, drop = o.drop === undefined ? .28 : o.drop, cols = o.cols || [M.bezK, M.bez], n = Math.max(2, Math.round(w / (o.stripe || .28))), val = o.val === undefined ? .13 : o.val;
      const p = (aa, e, bb) => f.p3(aa, bb, e), tn = toneOf(unit([f.n[0] * drop, f.n[1] * drop, out])); let ds = cols.map(() => ''), dv = cols.map(() => '');
      for (let i = 0; i < n; i++) { const a0 = a + w * i / n, a1 = a + w * (i + 1) / n, k = i % cols.length;
        ds[k] += `M${PL([p(a0, 0, b), p(a1, 0, b), p(a1, out, b - drop), p(a0, out, b - drop)])}Z`;
        if (val) dv[k] += `M${PL([p(a0, out, b - drop), p(a1, out, b - drop), p(a1, out, b - drop - val), p((a0 + a1) / 2, out, b - drop - val * 1.5), p(a0, out, b - drop - val)])}Z`; }
      f.rect(a + .04, Math.max(0, b - drop - out * .75), w - .08, Math.min(b, drop + out * .75) - .02, f.mc, 2.8, -.13);
      const c = [p(a, 0, b), p(a + w, 0, b), p(a + w, out, b - drop), p(a, out, b - drop - val)], xs = c.map(q => q[0]), ys = c.map(q => q[1]), zs = c.map(q => q[2]);
      // görünen yan üçgen (duvara dik, bize bakan uç)
      const endA = dot(f.u, VIEW) > 0 ? a + w : a, side = `<path class="${kf(tone(cols[0], toneOf(dot(f.u, VIEW) > 0 ? f.u : f.u.map(v => -v)) - .1))}" d="M${PL([p(endA, 0, b), p(endA, out, b - drop), p(endA, 0, b - drop)])}Z"/>`;
      this.item([Math.min(...xs), Math.min(...ys), Math.min(...zs), Math.max(...xs), Math.max(...ys), Math.max(...zs)], () =>
        ds.map((d, k) => `<path class="${kf(tone(cols[k], tn))}" d="${d}"/>`).join('') + (val ? dv.map((d, k) => `<path class="${kf(tone(cols[k], f.t - .12))}" d="${d}"/>`).join('') : '') + (o.side === false ? '' : side),
        { pts: [p(a, 0, b), p(a + w, 0, b), p(a + w, out, b - drop), p(a, out, b - drop)] });
      return this;
    }
    // cumba / çıkma: duvardan out kadar taşan kutu; döner: kutu (L, R, T yüzleri)
    bay(f, a, b, w, h, o = {}) {
      const out = o.out || .45, mat = o.mat || f.mc, c0 = f.p3(a, b, 0), c1 = f.p3(a + w, b + h, out);
      const bx = this.box(Math.min(c0[0], c1[0]), Math.min(c0[1], c1[1]), c0[2], Math.max(c0[0], c1[0]), Math.max(c0[1], c1[1]), c1[2], mat, { edge: false });
      // payandalar (eli böğründe)
      if (o.brace !== false) { let d = ''; for (const aa of [a + .08, a + w - .08]) { const q0 = f.p3(aa, b - .42, 0), q1 = f.p3(aa, b, out - .04); d += `M${P(q0[0], q0[1], q0[2])} ${P(q1[0], q1[1], q1[2])}`; }
        this.item([bx.x0, bx.y0, c0[2] - .42, bx.x1, bx.y1, c0[2]], `<path class="Ln ${ks(tone(M.ahsapK, f.t))}" stroke-width="1.8" d="${d}"/>`, { cast: false }); }
      f.rect(a + .05, Math.max(0, b - .5), w, .5, f.mc, 2.8, -.12);
      return bx;
    }
    // balkon: döşeme + korkuluk
    balcony(f, a, b, w, o = {}) {
      const out = o.out || .4, col = o.col || M.ahsapK, rh = o.rh || .34, c0 = f.p3(a, b - .07, 0), c1 = f.p3(a + w, b, out);
      const bx = this.box(Math.min(c0[0], c1[0]), Math.min(c0[1], c1[1]), c0[2], Math.max(c0[0], c1[0]), Math.max(c0[1], c1[1]), c1[2], o.slab || M.tas, { edge: false });
      let d = ''; const n = Math.max(3, Math.round(w / .16)); const q = (aa, bb, e) => { const v = f.p3(aa, bb, e); return P(v[0], v[1], v[2]); };
      for (let i = 0; i <= n; i++) d += `M${q(a + w * i / n, b, out)} ${q(a + w * i / n, b + rh, out)}`;
      d += `M${q(a, b + rh, out)} ${q(a + w, b + rh, out)}`; const endA = dot(f.u, VIEW) > 0 ? a + w : a; d += `M${q(endA, b + rh, 0)} ${q(endA, b + rh, out)}M${q(endA, b, out * .5)} ${q(endA, b + rh, out * .5)}`;
      this.item([bx.x0, bx.y0, c1[2], bx.x1, bx.y1, c1[2] + rh], `<path class="Ln ${ks(tone(col, f.t))}" stroke-width="1" d="${d}"/>`, { cast: false });
      f.rect(a + .05, Math.max(0, b - .4), w, .33, f.mc, 2.8, -.12);
      return bx;
    }
    // 3B çizgi: direk, ip, sırık, halat. pts: [[x,y,z],...]
    line3(pts, col, wid = 1.2, o = {}) {
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), zs = pts.map(p => p[2] || 0), pad = o.pad || .03;
      this.item([Math.min(...xs) - pad, Math.min(...ys) - pad, Math.min(...zs), Math.max(...xs) + pad, Math.max(...ys) + pad, Math.max(...zs)],
        `<path class="Ln ${ks(col)}" stroke-width="${wid}" d="M${PL(pts)}"/>`, { cast: !!o.cast, pts });
      return this;
    }
    // 3B çokgen (elle): pts [[x,y,z]...], renk zaten tonlanmış verilir ya da n (normal) ile tonlanır
    poly3(pts, col, o = {}) {
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), zs = pts.map(p => p[2] || 0), c = o.n ? tone(col, toneOf(unit(o.n)) + (o.dt || 0)) : tone(col, o.dt || 0);
      this.item(o.bb || [Math.min(...xs), Math.min(...ys), Math.min(...zs), Math.max(...xs), Math.max(...ys), Math.max(...zs)], `<path class="${kf(c)}" d="M${PL(pts)}Z"/>`, { cast: o.cast !== false && !!o.cast, pts });
      return this;
    }

    /* --- tek eğimli çatı (sundurma): dir '+y' (alçak kenar y1'de) | '+x' (alçak kenar x1'de). zLo alçak, zHi yüksek kenar --- */
    shed(x0, y0, x1, y1, zLo, zHi, dir, mat, o = {}) {
      const th = o.th || .07; let A, strips;
      if (dir === '+y') { const len = Math.hypot(y1 - y0, zHi - zLo); A = new Face([x0, y1, zLo], [1, 0, 0], unit([0, y0 - y1, zHi - zLo]), x1 - x0, len, unit([0, zHi - zLo, y1 - y0]));
        strips = [[[x0, y1, zLo], [x1, y1, zLo], [x1, y1, zLo - th], [x0, y1, zLo - th], toneOf([0, 1, 0]) - .2], [[x1, y1, zLo], [x1, y0, zHi], [x1, y0, zHi - th], [x1, y1, zLo - th], toneOf([1, 0, 0]) - .06]];
      } else { const len = Math.hypot(x1 - x0, zHi - zLo); A = new Face([x1, y1, zLo], [0, -1, 0], unit([x0 - x1, 0, zHi - zLo]), y1 - y0, len, unit([zHi - zLo, 0, x1 - x0]));
        strips = [[[x1, y1, zLo], [x1, y0, zLo], [x1, y0, zLo - th], [x1, y1, zLo - th], toneOf([1, 0, 0]) - .06], [[x1, y1, zLo], [x0, y1, zHi], [x0, y1, zHi - th], [x1, y1, zLo - th], toneOf([0, 1, 0]) - .2]]; }
      A.fill(mat); const tex = o.tex === undefined ? 'tile' : o.tex; if (tex) tex === 'tile' ? A.tiles() : tex === 'seam' ? A.seams() : tex === 'plank' ? A.planks({ dir: 'v', step: .3 }) : A.rows();
      this.item([x0, y0, zLo - th, x1, y1, zHi], () => A.svg() + strips.map(s => `<path class="${kf(tone(mat, s[4]))}" d="M${PL(s.slice(0, 4))}Z"/>`).join(''),
        Object.assign({ pts: dir === '+y' ? [[x0, y1, zLo], [x1, y1, zLo], [x0, y0, zHi], [x1, y0, zHi]] : [[x1, y0, zLo], [x1, y1, zLo], [x0, y0, zHi], [x0, y1, zHi]] }, o));
      return { A };
    }
    /* --- beşik tonoz: axis 'x' | 'y' boyunca uzanan yarım silindir çatı. (x0..x1, y0..y1) dış ölçü, z başlangıç, rise yükseklik. döner: G (görünen uçtaki alınlık yüzü) --- */
    vault(x0, y0, x1, y1, z, rise, mat, o = {}) {
      const ax = o.axis || (x1 - x0 >= y1 - y0 ? 'x' : 'y'), N = o.n || 9, wall = o.wall || mat; let s = '', G, lines = '';
      const half = ax === 'x' ? (y1 - y0) / 2 : (x1 - x0) / 2, mid = ax === 'x' ? (y0 + y1) / 2 : (x0 + x1) / 2;
      const prof = k => { const a = Math.PI * k / N; return [mid + Math.cos(a) * half, z + Math.sin(a) * rise]; };     // k=0: +taraf (öne yakın), k=N: arka
      for (let k = N - 1; k >= 0; k--) { const [c0, h0] = prof(k), [c1, h1] = prof(k + 1), am = Math.PI * (k + .5) / N, nn = unit(ax === 'x' ? [0, Math.cos(am) * rise, Math.sin(am) * half] : [Math.cos(am) * rise, 0, Math.sin(am) * half]);
        if (dot(nn, VIEW) <= 0) continue; const q = ax === 'x' ? [[x0, c0, h0], [x1, c0, h0], [x1, c1, h1], [x0, c1, h1]] : [[c0, y1, h0], [c0, y0, h0], [c1, y0, h1], [c1, y1, h1]];
        s += `<path class="${kf(tone(mat, toneOf(nn)))}" d="M${PL(q)}Z"/>`; }
      if (o.tex !== false) { const n = Math.max(2, Math.round((ax === 'x' ? x1 - x0 : y1 - y0) / (o.step || .6))); for (let i = 1; i < n; i++) { const t = i / n; let d = ''; for (let k = 0; k <= N; k++) { const [c, h] = prof(k), pt = ax === 'x' ? [x0 + (x1 - x0) * t, c, h] : [c, y1 - (y1 - y0) * t, h]; if (dot(unit(ax === 'x' ? [0, Math.cos(Math.PI * k / N), Math.sin(Math.PI * k / N)] : [Math.cos(Math.PI * k / N), 0, Math.sin(Math.PI * k / N)]), VIEW) < -.05) break; d += (d ? ' ' : 'M') + P(pt[0], pt[1], pt[2]); } lines += d; } }
      const shp = []; for (let k = 0; k <= N; k++) { const [c, h] = prof(k); shp.push([ax === 'x' ? (y1 - c) : (c - x0), h - z]); }
      if (ax === 'x') G = new Face([x1, y1, z], [0, -1, 0], [0, 0, 1], y1 - y0, rise, [1, 0, 0], shp); else G = new Face([x0, y1, z], [1, 0, 0], [0, 0, 1], x1 - x0, rise, [0, 1, 0], shp.slice().reverse());
      G.fill(wall);
      const pts = []; for (let k = 0; k <= N; k += 3) { const [c, h] = prof(k); if (ax === 'x') pts.push([x0, c, h], [x1, c, h]); else pts.push([c, y0, h], [c, y1, h]); }
      this.item([x0, y0, z, x1, y1, z + rise], () => s + (lines ? `<path class="Ln ${ks(tone(mat, -.2))}" stroke-width=".8" opacity=".55" d="${lines}"/>` : '') + G.svg(), Object.assign({ pts }, o));
      return { G };
    }
    /* --- mazgal dişleri: ince bir duvarın üstüne. (x0..x1, y0..y1) duvar üstü, z taban --- */
    merlons(x0, y0, x1, y1, z, mat, o = {}) {
      const mh = o.h || .3, mw = o.w || .36, gap = o.gap || .3, alongX = (x1 - x0) >= (y1 - y0), len = alongX ? x1 - x0 : y1 - y0, n = Math.max(1, Math.floor((len + gap) / (mw + gap))), st = (len - n * mw) / Math.max(1, n - 1);
      let dl = '', dr = '', dt = '';
      for (let i = 0; i < n; i++) { const a = (alongX ? x0 : y0) + i * (mw + st), bx = alongX ? [a, y0, a + mw, y1] : [x0, a, x1, a + mw];
        dl += `M${PL([[bx[0], bx[3], z], [bx[2], bx[3], z], [bx[2], bx[3], z + mh], [bx[0], bx[3], z + mh]])}Z`; dr += `M${PL([[bx[2], bx[3], z], [bx[2], bx[1], z], [bx[2], bx[1], z + mh], [bx[2], bx[3], z + mh]])}Z`;
        dt += `M${PL([[bx[0], bx[1], z + mh], [bx[2], bx[1], z + mh], [bx[2], bx[3], z + mh], [bx[0], bx[3], z + mh]])}Z`; }
      this.item([x0, y0, z, x1, y1, z + mh], `<path class="${kf(tone(mat, toneOf([0, 1, 0])))}" d="${dl}"/><path class="${kf(tone(mat, toneOf([1, 0, 0])))}" d="${dr}"/><path class="${kf(tone(mat, toneOf([0, 0, 1])))}" d="${dt}"/>`, { cast: false });
      return this;
    }
    /* --- serbest çizim: (x,y,z) noktasına taşınmış, ekran uzayında (piksel) çizilmiş SVG. bb verilmezse küçük bir kutu sayılır --- */
    art(x, y, z, svg, o = {}) { const p = pr(x, y, z), q = o.r || .15; this.item(o.bb || [x - q, y - q, z, x + q, y + q, z + (o.h || .4)], `<g transform="translate(${f1(p[0])} ${f1(p[1])})">${svg}</g>`, { cast: false }); return this; }
    // su yüzeyi: havuz, yalak, tekne içi
    pool(x0, y0, x1, y1, z, o = {}) { const c = o.col || M.su, T = new Face([x0, y0, z], [1, 0, 0], [0, 1, 0], x1 - x0, y1 - y0, [0, 0, 1]); T.col = c; const r = this.r; let d = '';
      for (let i = 0; i < Math.max(2, Math.round((x1 - x0) * (y1 - y0) * 2.5)); i++) { const a = r() * (x1 - x0 - .3), b = r() * (y1 - y0); d += `M${T.P(a, b)} ${T.P(a + .12 + r() * .2, b - .12 - r() * .2 * 0)}`; }
      this.item([x0, y0, z - .02, x1, y1, z], () => T.svg() + `<path class="Ln ${ks(tone(c, .5))}" stroke-width=".9" opacity=".7" d="${d}"/>`, { cast: false }); return this; }

    /* --- zemin: parselin altına (yürüyenlerin altında kalır) --- */
    // dikdörtgen döşeme; o.pat: desen kimliği (K.pattern ile) · o.z
    pave(x0, y0, x1, y1, col, o = {}) {
      const z = o.z || 0, d = `M${PL([[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]])}Z`;
      this.grd.push(`<path class="${kf(col)}" d="${d}"/>` + (o.pat ? `<path fill="url(#${o.pat})" d="${d}"/>` : '')); return this;
    }
    // zeminde serbest çokgen (ızgara koordinatı)
    gpoly(pts, col, o = {}) { this.grd.push(`<path class="${kf(col)}"${o.op ? ` opacity="${o.op}"` : ''} d="M${PL(pts.map(p => [p[0], p[1], o.z || 0]))}Z"/>`); return this; }
    // gece yere vuran ışık
    spill(x, y, r = 1.2, o = {}) { const c = pr(x, y, o.z || 0), R = r * U * 1.3; this.grd.push(`<ellipse class="Nl" cx="${f1(c[0])}" cy="${f1(c[1])}" rx="${f1(R)}" ry="${f1(R / 2)}" fill="url(#${glowId()})" opacity="${o.op || .8}"/>`); return this; }

    /* --- çıktı --- */
    out() {
      const it = this.items, n = it.length, e = 1e-6, indeg = new Array(n).fill(0), adj = it.map(() => []);
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        const a = it[i].bb, b = it[j].bb;
        const ab = a[3] <= b[0] + e || a[4] <= b[1] + e || a[5] <= b[2] + e, ba = b[3] <= a[0] + e || b[4] <= a[1] + e || b[5] <= a[2] + e;
        if (ab && !ba) { adj[i].push(j); indeg[j]++; } else if (ba && !ab) { adj[j].push(i); indeg[i]++; }
      }
      const done = new Array(n).fill(false), order = [];
      for (let k = 0; k < n; k++) { let pick = -1; for (let i = 0; i < n; i++) if (!done[i] && indeg[i] <= 0) { pick = i; break; }
        if (pick < 0) for (let i = 0; i < n; i++) if (!done[i]) { pick = i; break; }
        done[pick] = true; order.push(pick); for (const j of adj[pick]) indeg[j]--; }
      let body = '', sh = '', zmax = 0;
      for (const i of order) { const t = it[i]; body += typeof t.draw === 'function' ? t.draw() : t.draw; zmax = Math.max(zmax, t.bb[5]); }
      for (const t of it) if (t.cast) { const g = (t.pts || corners(t.bb)).map(p => pr(p[0] + SH[0] * Math.max(0, (p[2] || 0) - t.gz), p[1] + SH[1] * Math.max(0, (p[2] || 0) - t.gz), t.gz)), hh = hull(g);
        if (hh.length > 2) sh += 'M' + hh.map(p => f1(p[0]) + ' ' + f1(p[1])).join(' ') + 'Z'; }
      return Object.assign({ body, ground: this.grd.join(''), shadow: sh, fx: this.fxs, h: zmax }, this.meta);
    }
  }

  /* ---------- yapı sicili ---------- */
  const DEFS = new Map();
  const def = (id, meta, fn) => { DEFS.set(id, { id, meta, fn }); };
  // opt.w / opt.d: ölçüsü değişebilen yapılarda (ev, sur, kemer) parsel ölçüsü; verilmezse tanımdaki ölçü
  const build = (id, opt = {}) => { const d = DEFS.get(id); if (!d) throw new Error('CK: tanımsız yapı ' + id); const b = new Builder(Object.assign({ seed: opt.seed || 7 }, opt)); b.w = opt.w || d.meta.w; b.d = opt.d || d.meta.d; d.fn(b, K, opt); const o = b.out(); o.id = id; o.w = b.w; o.d = b.d; o.meta = d.meta; return o; };

  const pth = (col, d, extra = '') => `<path class="${kf(col)}"${extra ? ' ' + extra : ''} d="${d}"/>`;
  const ln = (col, d, wid = 1, extra = '') => `<path class="Ln ${ks(col)}" stroke-width="${wid}"${extra ? ' ' + extra : ''} d="${d}"/>`;
  // ucuz noktalar: pts [[x,y],...] ekran pikseli; tek yolda sıfır boylu yuvarlak uçlu çizgiler (daire başına ~12 bayt)
  const dots = (col, pts, d = 2) => `<path class="Ln ${ks(col)}" stroke-width="${d}" d="${pts.map(p => 'M' + f1(p[0]) + ' ' + f1(p[1]) + 'h.01').join('')}"/>`;
  const K = { U, ZK, ZU, pth, ln, dots, SUN, SH, VIEW, M, pr, P, PL, f1, f2, rng, rgb, hex, mix, tone, toneOf, nightOf, kf, ks, kg, css, DEF, defsSvg, gradCyl, gradDome, glowId, circ, ell, hull, unit, dot,
    Face, Builder, def, build, DEFS, reg };
  root.CK = K;
})(typeof window !== 'undefined' ? window : globalThis);
