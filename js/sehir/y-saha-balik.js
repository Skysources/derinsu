/* Saha manzarası — SU (Balıkçılık, Kıyı bölgesi). Dünya haritasında av alanı altıgeninin içindeki küçük resim: o kademenin suyu, içindeki balığıyla.
   opt: t (1–5: Kıyı ve Liman, Koy ve Kayalık, Açık Deniz, Derin Deniz, Uçurum) · seed (yerleşim). Balık alanlarında nitelik yoktur (opt.q yok sayılır).
   Kadraj y-saha-odun.js ile aynı: (u, v) kadraj koordinatı, at() ızgaraya, S() ekrana çevirir; ayna sahneyi tohuma göre çevirir.
   Su zemin katmanıdır (z = 0): sığlık, dip, balık gölgeleri, dalga izleri zemine; iskele, tekne, kaya, şamandıra, kuş sıralanan parçalardır.
   Kural: suda ada da kum adası da yok; kara yalnız arka ya da yan kenarda kıyı (I–II) ve köşelerde kaya iğneleri (V) olarak görünür. */
(function (K) {
  'use strict';
  const { M, pr, f1, tone, toneOf, kf, ks, circ, ell, pth, ln, unit, dot, VIEW } = K;
  const TT = toneOf([0, 0, 1]), q8 = t => Math.round(t * 12.5) / 12.5, Q = p => f1(p[0]) + ' ' + f1(p[1]);
  const sub = (a, c) => [a[0] - c[0], a[1] - c[1], a[2] - c[2]], crs = (a, c) => [a[1] * c[2] - a[2] * c[1], a[2] * c[0] - a[0] * c[2], a[0] * c[1] - a[1] * c[0]];
  const pw = (x, p) => Math.pow(Math.max(0, Math.min(1, x)), p), kis = x => Math.max(0, Math.min(1, x));
  const opa = o => o === undefined ? '' : `opacity="${o}"`;
  // yumuşak eğri: ekran noktalarından Catmull-Rom
  const sm = (ps, cl = true) => { const n = ps.length, g = i => cl ? ps[(i % n + n) % n] : ps[Math.max(0, Math.min(n - 1, i))]; let d = 'M' + Q(ps[0]);
    for (let i = 0; i < (cl ? n : n - 1); i++) { const a = g(i - 1), b = g(i), c = g(i + 1), e = g(i + 2);
      d += `C${f1(b[0] + (c[0] - a[0]) / 6)} ${f1(b[1] + (c[1] - a[1]) / 6)} ${f1(c[0] - (e[0] - b[0]) / 6)} ${f1(c[1] - (e[1] - b[1]) / 6)} ${Q(c)}`; }
    return d + (cl ? 'Z' : ''); };
  // 1B Catmull-Rom: denetim noktaları [[v, u], ...] (v sıralı) arasında yumuşak geçiş (kıyı çizgileri)
  const egri = (cp, v) => { let i = 0; while (i < cp.length - 2 && v > cp[i + 1][0]) i++; const g = k => cp[Math.max(0, Math.min(cp.length - 1, k))][1], t = kis((v - cp[i][0]) / (cp[i + 1][0] - cp[i][0]));
    const p0 = g(i - 1), p1 = g(i), p2 = g(i + 1), p3 = g(i + 2); return p1 + .5 * t * (p2 - p0 + t * (2 * p0 - 5 * p1 + 4 * p2 - p3 + t * (3 * (p1 - p2) + p3 - p0))); };
  // organik leke: kadrajda (u, v) merkezli, R yarıçap (sq = 1: zeminde daire), z yükseklikte
  const leke = (c, u, v, R, sq = 1, z = 0, n = 7) => { const ps = []; for (let k = 0; k < n; k++) { const a = k / n * 6.283, d = R * (.72 + c.r() * .5); ps.push(c.S(u + Math.cos(a) * d, v + Math.sin(a) * d * sq, z)); } return sm(ps); };
  // yaprak / şerit: (x0, y0) dipten (x1, y1) uca, w en, k eğrilik (ekran pikseli)
  const yaprak = (x0, y0, x1, y1, w, k) => { const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, L = Math.hypot(x1 - x0, y1 - y0) || 1, nx = (y0 - y1) / L, ny = (x1 - x0) / L;
    return `M${f1(x0)} ${f1(y0)}Q${f1(mx + nx * (w + k))} ${f1(my + ny * (w + k))} ${f1(x1)} ${f1(y1)}Q${f1(mx - nx * (w - k))} ${f1(my - ny * (w - k))} ${f1(x0)} ${f1(y0)}Z`; };
  // ot öbekleri (ekran noktalarında, esya.js tufts ile aynı çizgi)
  const ot = (ps, col, k = 1) => ln(col, ps.map(p => `M${f1(p[0] - 1.6 * k)} ${f1(p[1])}l${f1(-.8 * k)} ${f1(-2.6 * k)}M${f1(p[0])} ${f1(p[1])}l${f1(.2 * k)} ${f1(-3.4 * k)}M${f1(p[0] + 1.6 * k)} ${f1(p[1])}l${f1(k)} ${f1(-2.4 * k)}`).join(''), .8);
  // aynı renkteki parçaları tek yolda toplar: w çizgi kalınlığı, o saydamlık; kenar: dolgu kendi renginde ince kenarlı (komşu yüzler arasında aralık kalmaz)
  const kova = () => { const m = new Map(); return { add(c, d, w = '', o = '') { if (d) { const k = c + '|' + w + '|' + o; m.set(k, (m.get(k) || '') + d); } return this; },
    svg(kenar) { let s = ''; for (const [k, d] of m) { const [c, w, o] = k.split('|'), x = o ? `opacity="${o}"` : '';
      s += w ? ln(c, d, w, x) : kenar ? `<path class="${kf(c)} ${ks(c)}" stroke-width=".4" stroke-linejoin="round"${x ? ' ' + x : ''} d="${d}"/>` : pth(c, d, x); } m.clear(); return s; } }; };
  // üst kuşak: u boyunca f(u) eğrisinin üstü (arka yanı) boyanır
  const ustKus = (c, f, col, o, st = .3) => { const ps = [c.S(-4.2, -12)]; for (let u = -4.2; u <= 4.21; u += st) ps.push(c.S(u, f(u))); ps.push(c.S(4.2, -12)); c.b.ground(pth(col, sm(ps), opa(o))); };

  /* ---------- tekne: posta kesitlerinden örülmüş eğri gövde (y-tekne.js gövdesinin sade eşi; her yöne döner) ----------
     (x, y) ızgarada orta nokta, a: pruva yönü (ızgara açısı). sp: L boy · B en · h orta, hb pruva, hs kıç borda · tw ayna kıç eni (0 sivri)
     renk: boya, ser (şerit), kar (karina), ic, cap (küpeşte). ici(T): içine konanların çizimi; T.sc tekne (s, t, z) → ekran. Döner: T (su izleri için). */
  function tekne(b, x, y, a, sp, ici) {
    const { L, B, h, hb = h * 1.5, hs = h * 1.15, um = .45, tw = .55, n = 9, zf = .07, wl = .7, rb = .1 } = sp, ca = Math.cos(a), sa = Math.sin(a), z0 = sp.z || 0;
    const G = p => [x + (p[0] - L / 2) * ca - p[1] * sa, y + (p[0] - L / 2) * sa + p[1] * ca, z0 + (p[2] || 0)];
    const plan = u => u >= um ? 1 - pw((u - um) / (1 - um), 2.2) : 1 - (1 - tw) * pw((um - u) / um, 2.2);
    const sheer = u => h + (u >= um ? (hb - h) * pw((u - um) / (1 - um), 2) : (hs - h) * pw((um - u) / um, 2));
    const pt = (u, v, sg) => [L * u + (u >= um ? rb * pw((u - um) / (1 - um), 3) * v : 0), sg * plan(u) * B / 2 * (wl + (1 - wl) * Math.pow(v, .55)), sheer(u) * v];
    const inn = (u, sg) => { const p = pt(u, 1, sg); return [p[0], sg * Math.max(0, Math.abs(p[1]) - .05), p[2]]; };
    const flo = (u, sg) => { const p = pt(u, zf / sheer(u), sg); return [p[0], sg * Math.max(0, Math.abs(p[1]) - .03), zf]; };
    const sc = p => { const g = G(p); return pr(g[0], g[1], g[2]); }, PL = ps => 'M' + ps.map(p => Q(sc(p))).join(' ') + 'Z';
    const nv = (A, B2, C, D, k) => crs(sub(G(C), G(A)), sub(G(D), G(B2))).map(v => v * k), vis = v => dot(v, VIEW) > 0, tn = (v, kz = 1) => q8(toneOf(unit([v[0], v[1], v[2] * kz])));
    const F = 'stroke-width=".5" stroke-linejoin="round"', capd = new Set(), fk = c => kf(c) + ' ' + ks(c);
    const T = { G, sc, pt, sheer, L, B, zf, hw: (u, z) => Math.max(0, Math.abs(pt(u, Math.min(1, z / sheer(u)), 1)[1]) - .05) };
    const top = [L + rb * 1.2, 0, hb + .05], bowFwd = dot([ca, sa, 0], VIEW) > 0, stem = () => ln(tone(sp.cap, -.3), 'M' + [pt(1, 0, 1), pt(1, 1, 1), top].map(p => Q(sc(p))).join(' '), 2);
    let s = bowFwd ? '' : stem(), rib = '';
    // dilimler renge göre toplanır; komşu dilimler arasında su sızmasın diye aynı renkte kıl payı çizgi
    const IN = new Map(), put = (c, d) => IN.set(c, (IN.get(c) || '') + d), dump = () => { let o = ''; for (const [c, d] of IN) o += `<path class="${fk(c)}" ${F} d="${d}"/>`; IN.clear(); return o; };
    const capI = (j, sg) => { if (capd.has(sg * 99 + j)) return; capd.add(sg * 99 + j); put(tone(sp.cap, TT + .04), PL([inn(j / n, sg), inn((j + 1) / n, sg), pt((j + 1) / n, 1, sg), pt(j / n, 1, sg)])); };
    for (const sg of [-1, 1]) for (let j = 0; j < n; j++) { const A = flo(j / n, sg), B2 = flo((j + 1) / n, sg), C = inn((j + 1) / n, sg), D = inn(j / n, sg), v = nv(A, B2, C, D, sg);
      if (!vis(v)) continue; put(tone(sp.ic, tn(v, .5) - .05), PL([A, B2, C, D])); capI(j, sg); if (j) rib += 'M' + Q(sc(A)) + ' ' + Q(sc(D)); }
    const aft = [ca, sa, 0];
    if (tw && vis(aft)) put(tone(sp.ic, tn(aft) - .08), PL([flo(0, -1), flo(0, 1), inn(0, 1), inn(0, -1)]));
    const fl = []; for (let j = 0; j <= n; j++) fl.push(flo(j / n, 1)); for (let j = n; j >= 0; j--) fl.push(flo(j / n, -1));
    put(tone(sp.dos || tone(sp.ic, -.14), TT - .1), PL(fl));
    s += dump() + ln(tone(sp.ic, -.42), rib, .8);
    // oturaklar: bordadan bordaya tahta
    for (const u of sp.otur || []) { const z = sheer(u) * .72, w = .05 * (1 / L) * 2, hw0 = T.hw(u - w, z), hw1 = T.hw(u + w, z);
      put(tone(sp.cap, TT + .1), PL([[L * (u - w), -hw0, z], [L * (u + w), -hw1, z], [L * (u + w), hw1, z], [L * (u - w), hw0, z]])); }
    s += dump();
    if (ici) s += ici(T);
    // dış: karina, boyalı sıralar, şerit, küpeşte; görünürse kıç aynasının dışı
    const VS = [0, .22, .78, 1];
    for (const sg of [-1, 1]) for (let j = 0; j < n; j++) { let any = false;
      for (let q = 0; q < 3; q++) { const A = pt(j / n, VS[q], sg), B2 = pt((j + 1) / n, VS[q], sg), C = pt((j + 1) / n, VS[q + 1], sg), D = pt(j / n, VS[q + 1], sg), v = nv(A, B2, C, D, -sg);
        if (!vis(v)) continue; any = true; put(tone(q === 0 ? sp.kar : q === 2 ? sp.ser : sp.boya, tn(v, .4) + (q === 2 ? .04 : 0)), PL([A, B2, C, D])); }
      if (any) capI(j, sg); }
    const fore = [-ca, -sa, 0];
    if (tw && vis(fore)) { put(tone(sp.boya, tn(fore)), PL([pt(0, 0, -1), pt(0, 0, 1), pt(0, .78, 1), pt(0, .78, -1)])); put(tone(sp.ser, tn(fore)), PL([pt(0, .78, -1), pt(0, .78, 1), pt(0, 1, 1), pt(0, 1, -1)])); }
    s += dump() + (bowFwd ? stem() : '');
    // gövdenin bbox'ı ve gölgesi
    const gs = []; for (let j = 0; j <= n; j += 3) gs.push(G(pt(j / n, 1, 1)), G(pt(j / n, 1, -1)));
    const xs = gs.map(p => p[0]), ys = gs.map(p => p[1]);
    b.item([Math.min(...xs), Math.min(...ys), z0, Math.max(...xs), Math.max(...ys), z0 + hb + .1], s, { pts: gs });
    T.wl = []; for (let j = 0; j <= n; j++) T.wl.push(sc(pt(j / n, 0, 1))); for (let j = n; j >= 0; j--) T.wl.push(sc(pt(j / n, 0, -1)));
    return T;
  }
  // teknenin suya düşen izleri: altında koyuluk, bordada köpük çizgisi (zemine)
  const tekneSu = (b, T, deep, k = 1) => { const c = T.wl.reduce((a, p) => [a[0] + p[0] / T.wl.length, a[1] + p[1] / T.wl.length], [0, 0]), gr = (f, dy) => T.wl.map(p => [c[0] + (p[0] - c[0]) * f, c[1] + (p[1] - c[1]) * f + dy]);
    b.ground(pth(tone(deep, -.3), sm(gr(1.12, 1.5)), opa(.45 * k)) + ln(M.kopuk, sm(gr(1.06, .6)), .9, opa(.55 * k))); };

  /* ---------- yontma kaya: halkalardan örülmüş çok yüzlü taş (ışık yüz normaline göre) ----------
     (x, y) ızgara, hs: [[yarıçap, z], ...] alttan üste halkalar (son yarıçap 0 ise sivri tepe), n köşe, j sapma, r tohum
     o.rot döndürme · o.lean [dx, dy] birim yükseklik başına eğilme · o.pal(t, normal) yüz rengi (verilmezse tone) */
  function kaya(b, x, y, hs, col, n, j, r, o = {}) {
    const ring = hs.map(([rr, z], i) => { const out = [], lx = o.lean ? o.lean[0] * z : 0, ly = o.lean ? o.lean[1] * z : 0;
      for (let k = 0; k < n; k++) { const a = (k + (i % 2) * .5) / n * 6.283 + (o.rot || 0), q = rr * (1 - j / 2 + r() * j); out.push([x + lx + Math.cos(a) * q, y + ly + Math.sin(a) * q, z + (i && i < hs.length - 1 ? (r() - .5) * j * .4 : 0)]); } return out; });
    const fs = [];
    for (let i = 0; i < ring.length - 1; i++) for (let k = 0; k < n; k++) { const A = ring[i][k], B2 = ring[i][(k + 1) % n], C = ring[i + 1][(k + 1) % n], D = ring[i + 1][k];
      const v = crs(sub(C, A), sub(D, B2));
      if (dot(v, VIEW) <= 0) continue; fs.push([A[0] + A[1] + C[0] + C[1] + (A[2] + C[2]) * .1, [A, B2, C, D], v]); }
    const tp = ring[ring.length - 1]; if (hs[hs.length - 1][0] > 0) fs.push([1e3, tp, [0, 0, 1]]);
    fs.sort((p, q) => p[0] - q[0]);
    const kv = kova(); for (const [, ps, v] of fs) { const t0 = q8(toneOf(unit(v))) + (o.dt || 0); kv.add(o.pal ? o.pal(t0, v) : tone(col, t0), 'M' + ps.map(p => Q(pr(p[0], p[1], p[2]))).join(' ') + 'Z'); }
    const all = [].concat(...ring), xs = all.map(p => p[0]), ys = all.map(p => p[1]), zt = Math.max(...hs.map(h => h[1]));
    b.item([Math.min(...xs), Math.min(...ys), 0, Math.max(...xs), Math.max(...ys), zt], kv.svg(true), { pts: ring[0].concat(ring[ring.length - 1]), cast: o.cast !== false });
    return ring;
  }

  /* ---------- balık: su düzleminde (yukarıdan) iğ gövde ve çatal kuyruk; φ ızgara açısı, l boy, w en ---------- */
  const balik = (x, y, z, phi, l, w) => { const c = Math.cos(phi), s = Math.sin(phi), P = (a, e) => Q(pr(x + c * a - s * e, y + s * a + c * e, z));
    return `M${P(l * .5, 0)}Q${P(l * .12, w)} ${P(-l * .3, w * .14)}L${P(-l * .52, w * .46)}L${P(-l * .44, 0)}L${P(-l * .52, -w * .46)}L${P(-l * .3, -w * .14)}Q${P(l * .12, -w)} ${P(l * .5, 0)}Z`; };
  // sürü: kadrajdaki yol (pts [[u, v], ...]) boyunca aynı yöne yüzen n balık; döner { d: koyu sırtlar, e: dönüp gümüş yanını gösterenler }
  const suru = (c, pts, n, l, w, jit = .2, gum = .25) => { const { r, at, ang } = c; let d = '', e = '';
    for (let i = 0; i < n; i++) { const t = Math.min(.999, (i + r() * .7) / n) * (pts.length - 1), k = Math.floor(t), f = t - k, A = pts[k], B2 = pts[k + 1], du = B2[0] - A[0], dv = B2[1] - A[1], L = Math.hypot(du, dv) || 1, o = (r() - .5) * 2 * jit;
      const [x, y] = at(A[0] + du * f - dv / L * o, A[1] + dv * f + du / L * o), fs = balik(x, y, 0, ang(du, dv) + (r() - .5) * .3, l * (.85 + r() * .3), w);
      if (r() < gum) e += fs; else d += fs; }
    return { d, e }; };
  // yandan balık (ekran düzleminde): sıçrayan, sepetteki; (x, y) piksel, l boy piksel, a eğim (radyan)
  const balikY = (x, y, l, a, k = 1) => { const c = Math.cos(a), s = Math.sin(a), P = (p, e) => f1(x + c * p * k - s * e) + ' ' + f1(y + s * p * k + c * e);
    return `M${P(l * .5, 0)}Q${P(l * .1, -l * .3)} ${P(-l * .32, -l * .05)}L${P(-l * .52, -l * .22)}L${P(-l * .44, 0)}L${P(-l * .52, l * .2)}L${P(-l * .32, l * .05)}Q${P(l * .1, l * .26)} ${P(l * .5, 0)}Z`; };

  // uçan martı (z yükseklikte) ve suya düşen gölgesi
  const martiUc = (b, x, y, z, k = 1) => { const p = pr(x, y, z), g = pr(x + K.SH[0] * z, y + K.SH[1] * z, 0), P = (dx, dy) => f1(p[0] + dx * k) + ' ' + f1(p[1] + dy * k);
    b.ground(pth('#1b2440', `M${f1(g[0] - 7 * k)} ${f1(g[1])}q${f1(7 * k)} -3 ${f1(14 * k)} 0q${f1(-7 * k)} 1.2 ${f1(-14 * k)} 0z`, opa(.18)));
    b.item([x - .1, y - .1, z - .2, x + .1, y + .1, z + .2], pth('#f4f1ea', `M${P(-9, -4)}Q${P(-3, -6)} ${P(0, 0)}Q${P(3, -7)} ${P(10, -5)}Q${P(3, -2)} ${P(0, 1.6)}Q${P(-3, -2)} ${P(-9, -4)}Z`) + pth('#c9ccd0', `M${P(0, 0)}Q${P(3, -7)} ${P(10, -5)}Q${P(3, -4)} ${P(.4, .6)}Z`) + pth('#3a4450', `M${P(-9, -4)}l${f1(2.6 * k)} ${f1(.1 * k)}l${f1(-1.2 * k)} ${f1(k)}zM${P(10, -5)}l${f1(-2.8 * k)} ${f1(.5 * k)}l${f1(1.3 * k)} ${f1(.9 * k)}z`), { cast: false }); };

  /* ---------- kademeler: su renkleri (oyunun deniz verisinden) ---------- */
  const KADEME = [null,
    { ad: 'kiyi', derin: '#2a7f9c', orta: '#3f9db0', sig: '#72c4ca', kum: '#e4d4a4', kara: '#7d9a52' },
    { ad: 'koy', derin: '#1e6e70', orta: '#2f8a80', sig: '#62b49c', kum: '#a89c74', kaya: '#68645a', kara: '#a29d6a' },
    { ad: 'acik', derin: '#245070', orta: '#2e6488', sig: '#5c8ea8' },
    { ad: 'resif', derin: '#165c96', orta: '#2378b4', sig: '#4eb0d2', kaya: '#888074' },
    { ad: 'ucurum', derin: '#16142e', orta: '#26224a', sig: '#423c74', kaya: '#34303e', isik: '#b9a6e6' },
  ];
  const RENK = [{ boya: '#f3eee2', ser: '#2f6fa3', kar: '#8a3d32' }, { boya: '#7fb7d6', ser: '#f3eee2', kar: '#2c4a78' }, { boya: '#b84a3b', ser: '#f0dfb8', kar: '#3c3836' }, { boya: '#5c9474', ser: '#e8c25a', kar: '#7a3a30' }];

  /* =================== I · KIYI VE LİMAN: kumsal, iskele, bağlı sandal, sığlıkta istavrit sürüsü =================== */
  function kiyi(c) {
    const { b, r, at, S, Kd, ang } = c, ph = r() * 6.283, eg = .08 + r() * .14;
    const shore = u => -3.25 - u * eg + Math.sin(u * 1.3 + ph) * .12 + Math.sin(u * 3.1 + ph * 2) * .05;
    // kıyıdan uzaklığa göre kuşaklar (eğrinin üstü, kıyı yanı boyanır)
    const kus = (f, col, o, st) => ustKus(c, f, col, o, st);
    const wv = (k, a, m = .22) => u => shore(u) + k + Math.sin(u * a + ph * 2) * m + Math.sin(u * a * 2.3 + ph) * m * .35;
    kus(wv(5.2, 1.1), Kd.orta); kus(wv(3.4, 1.5, .3), tone(Kd.sig, -.14)); kus(wv(2.1, 2.1), Kd.sig);
    // sığlıkta dip: açık kum lekeleri, ışık ağı
    { let d = '', e = ''; for (let i = 0; i < 8; i++) { const u = -2.6 + r() * 5.2, v = shore(u) + .6 + r() * 1.6, p = S(u, v), rx = 9 + r() * 12; d += ell(p[0], p[1], rx, rx * .38); }
      for (let i = 0; i < 18; i++) { const u = -2.6 + r() * 5.2, v = shore(u) + .35 + r() * 2.2, p = S(u, v), w = 4 + r() * 6; e += `M${f1(p[0] - w)} ${f1(p[1])}q${f1(w / 2)} ${f1(-1.6 - r())} ${f1(w)} 0q${f1(w / 2)} 1.4 ${f1(w)} -.4`; }
      b.ground(pth('#b8e6dc', d, opa(.3)) + ln('#d6f2ec', e, .7, opa(.55))); }
    kus(wv(.45, 2.9, .12), '#a8dcd2', .85);
    kus(u => shore(u) + .17 + Math.sin(u * 4 + ph) * .05, M.kopuk, .95, .2);
    // kumsal: ıslak kum, kuru kum, yosun çizgisi, otlu kumul
    kus(shore, '#cdbb88', 1, .2); kus(u => shore(u) - .3 - Math.sin(u * 3.1 + ph) * .06, Kd.kum, 1, .2);
    { let d = '', e = ''; for (let u = -3; u <= 3; u += .12 + r() * .22) { const p = S(u, shore(u) - .58 + (r() - .5) * .14), w = 1.4 + r() * 3;
        if (r() < .72) d += ell(p[0], p[1], w, .6 + r() * .5); else e += `M${f1(p[0] - w)} ${f1(p[1] + .4)}q${f1(w)} -1.6 ${f1(w * 2)} -.2`; }
      b.ground(pth('#8d8650', d, opa(.7)) + ln('#6a6438', e, .8, opa(.75))); }
    kus(u => shore(u) - 1.75 + Math.sin(u * 2.2 + ph) * .2, tone(Kd.kara, .12), 1, .3); kus(u => shore(u) - 1.98 + Math.sin(u * 2.2 + ph) * .2, Kd.kara, 1, .3);
    { let g = '', d = ''; for (let i = 0; i < 9; i++) { const u = -2.4 + r() * 4.8, s = leke(c, u, shore(u) - 2.5 - r() * 1.4, .3 + r() * .3, .7); if (i % 2) g += s; else d += s; } b.ground(pth(tone(Kd.kara, -.2), g, opa(.5)) + pth(tone(Kd.kara, .22), d, opa(.45))); }
    { const ps = []; for (let i = 0; i < 20; i++) { const u = -2 + r() * 4; ps.push(S(u, shore(u) - 1.5 - r() * 1.3)); } b.ground(ot(ps, '#5e7a3a')); }
    { const pts = []; for (let i = 0; i < 26; i++) { const u = -2.4 + r() * 4.8, v = shore(u) - .45 - r() * 1.1; pts.push(S(u, v)); } b.ground(K.dots(tone(Kd.kum, -.22), pts.slice(0, 16), 1.6) + K.dots('#f6efe0', pts.slice(16), 1.5)); }
    // suyun yüzü: kırışık dalga izleri
    { let d = '', e = ''; for (let i = 0; i < 20; i++) { const u = -2.8 + r() * 5.6, v = shore(u) + 2 + r() * 5, p = S(u, v), w = 5 + r() * 6, q = `M${f1(p[0])} ${f1(p[1])}q${f1(w / 2)} -2.2 ${f1(w)} 0`; if (i % 3) d += q; else e += q; }
      b.ground(ln('#d8f0ee', d, .9, opa(.5)) + ln(tone(Kd.derin, -.3), e, .9, opa(.35))); }
    // iskele: kumdan suya, ızgara ekseni boyunca (ayna > 0: x ekseni, değilse y)
    const yu = -1.4 + r() * .3, yv = shore(yu) - .45, len = 2.2 + r() * .3;
    const g0 = at(yu, yv), g1 = at(yu + len, yv + len), ax = c.ayna > 0 ? 0 : 1, hw = .32, zd = .36;
    const X0 = Math.min(g0[0], g1[0]) - (ax ? hw : 0), X1 = Math.max(g0[0], g1[0]) + (ax ? hw : 0), Y0 = Math.min(g0[1], g1[1]) - (ax ? 0 : hw), Y1 = Math.max(g0[1], g1[1]) + (ax ? 0 : hw);
    const E = (f, k) => ax ? [g0[0] + k * hw, Y0 + (Y1 - Y0) * f] : [X0 + (X1 - X0) * f, g0[1] + k * hw];      // iskele boyunca f, enine k (+ bize yakın yan)
    const kaz = []; for (let k = 0; k <= 4; k++) { const f = .1 + k / 4 * .86; for (const sg of [-1, 1]) kaz.push(E(f, sg * .82).concat(f)); }
    for (const [px, py, f] of kaz) { b.cyl(px, py, .06, 0, f > .9 ? zd + .26 : zd - .06, '#6f5038', { top: '#8a6a4a', cast: false }).band(0, .07, '#3f4a3a', .01, false);
      const p = pr(px, py, 0); b.ground(pth(M.kopuk, ell(p[0], p[1], 4.6, 1.9), opa(.75)) + pth(tone(Kd.derin, -.2), ell(p[0] + 2, p[1] + 2.4, 3.4, 1.4), opa(.3))); }
    const dk = b.slab(X0, Y0, X1, Y1, zd, .07, '#b08a5e', { cast: true });
    dk.T.planks({ dir: ax ? 'h' : 'v', step: .14, dt: -.2, wid: .7 });
    b.box(ax ? X1 - .05 : X0, ax ? Y0 : Y1 - .05, zd - .16, X1, Y1, zd - .07, '#6a4a32', { edge: false, cast: false });
    // iskele ucu: balık kasası, yengeç sepeti, olta, halat; uç direğinde martı
    { const [x, y] = E(.8, -.45); b.crate(x, y, zd, .3, { fill: '#c9d6de' }); }
    { const [x, y] = E(.6, .4); b.art(x, y, zd, pth('#7a5a34', 'M-5 0V-4.6Q-5 -9.6 0 -9.6Q5 -9.6 5 -4.6V0Q0 1.8 -5 0Z') + pth('#a8834e', 'M-5 -.4V-4.6Q-5 -9.6 -.6 -9.6Q-2.8 -5 -2.4 .9Q-4 .5 -5 -.4Z') + ln('#4a3420', 'M-4.8 -3Q0 -1 4.8 -3M-4.2 -6.2Q0 -4.4 4.2 -6.2M-2.4 .8V-8.8M0 1.2V-9.6M2.4 .8V-8.8', .6) + pth('#2b2420', ell(0, -8.8, 1.6, .8)), { r: .14, h: .4 }); }
    { const [x0, y0] = E(.62, .55), t = kaz.filter(k => k[2] > .9)[1], p0 = pr(x0, y0, zd + .02), p1 = pr(t[0], t[1], zd + .2), tip = [p1[0] + (p1[0] - p0[0]) * .45, p1[1] + (p1[1] - p0[1]) * .45];
      b.item([Math.min(x0, t[0]) - .05, Math.min(y0, t[1]) - .05, zd, Math.max(x0, t[0]) + .05, Math.max(y0, t[1]) + .05, zd + .3], ln('#5a4030', `M${Q(p0)}L${Q(tip)}`, 1.2) + ln('#f4f1ea', `M${Q(tip)}q2 6 -1 12`, .4, opa(.8)) + pth('#3a3a40', circ(p0[0] + (p1[0] - p0[0]) * .18, p0[1] + (p1[1] - p0[1]) * .18 + 1, 1.5)), { cast: false }); }
    { const [x, y] = E(.45, -.2); b.art(x, y, zd, pth(tone('#cdb98a', -.3), ell(0, -1, 4.2, 2.1)) + ln('#cdb98a', 'M-3.4 -1.4a3.4 1.6 0 1 0 6.8 0a3.4 1.6 0 1 0 -6.8 0M-1.8 -1.6a1.8 .9 0 1 0 3.6 0', .9), { r: .12, h: .1 }); }
    { const uc = kaz.filter(k => k[2] > .9), gi = r() < .5 ? 0 : 1, t = uc[gi], f = uc[1 - gi]; b.critter('marti', t[0], t[1], zd + .26, { flip: c.ayna < 0 });
      b.art(f[0], f[1], zd + .26, ln(M.demir, 'M0 0V-4', 1) + pth(M.demir, 'M-2.6 -4h5.2l-.9 -1.3h-3.4zM-2.2 -10.4l2.2 -2l2.2 2z') + pth('#ffe9b0>#fff3c4', 'M-1.8 -10.2h3.6l.3 5.4h-4.2z') + pth('#ffb648>#ffa030', circ(0, -7.4, .9)) + `<circle class="Nl" cx="0" cy="-7.4" r="20" fill="url(#${K.glowId()})"/>`, { r: .08, h: .5 }); }
    // bağlı sandal: iskelenin bize bakan yanında, ona koşut
    const ri = Math.floor(r() * 4), bo = E(.5 + r() * .16, 1), off = .47;
    const T1 = tekne(b, bo[0] + (ax ? off : 0), bo[1] + (ax ? 0 : off), ax ? Math.PI / 2 : 0, Object.assign({ L: 1.6, B: .7, h: .26, hb: .4, hs: .3, tw: .6, otur: [.3, .62], ic: '#dccba6', cap: '#9a6a3f' }, RENK[ri]), T => {
      const k = kova(); k.add('#d9a04e', circ(...T.sc([T.L * .47, .1, T.zf + .05]), 1.6) + circ(...T.sc([T.L * .53, -.08, T.zf + .05]), 1.6));
      return ln(M.ahsapA, 'M' + Q(T.sc([.25, -.12, .2])) + 'L' + Q(T.sc([1.4, -.2, .28])), 1.3) + ln(M.ahsapA, 'M' + Q(T.sc([.3, .1, .2])) + 'L' + Q(T.sc([1.45, .16, .28])), 1.3) + k.svg(); });
    tekneSu(b, T1, Kd.derin);
    { const bw = T1.G(T1.pt(1, 1, 1)), pst = kaz.filter(k => k[2] > .7 && k[2] < .9)[1]; b.line3([[bw[0], bw[1], .3], [(bw[0] + pst[0]) / 2, (bw[1] + pst[1]) / 2, .14], [pst[0], pst[1], zd - .1]], '#cdb98a', .7); }
    // kumsalda ters yatırılmış sandal (bazı tohumlarda; iskelenin öbür yanında, alçak: üst kenar sakin kalsın)
    if (r() < .6) { const u = .75 + r() * .7, [x, y] = at(u, shore(u) - 1.0), kz = RENK[(ri + 1 + Math.floor(r() * 3)) % 4], rot = (r() < .5 ? -1 : 1) * 24;
      b.art(x, y, 0, pth('#1b2440', ell(3, 2.4, 16, 4.4), opa(.2)) + `<g transform="rotate(${rot})">` + pth(tone(kz.boya, -.28), 'M-15 0Q-14 -6.6 0 -7.2Q13 -6.6 15 -1L14.4 1.2Q0 3 -14.6 1.6Z') + pth(kz.boya, 'M-15 0Q-14 -6.6 0 -7.2Q13 -6.6 15 -1Q0 -2.6 -15 0Z')
        + ln(tone(kz.kar, -.1), 'M-14.6 -.8Q0 -7.6 14.6 -1.6', 1.3) + pth(kz.ser, 'M-14.6 .8Q0 2.8 14.4 1.1L14.8 -.2Q0 1.4 -15 -.5Z') + '</g>', { r: .3, h: .2 }); }
    // sığlıkta istavrit sürüsü: kıvrılan bir şerit halinde aynı yöne yüzer; koyu sırtlar, dönen birkaçının gümüş yanı
    { const u0 = .45 + r() * .4, v0 = .85 + r() * .45, k = r() < .5 ? 1 : -1, pts = [[u0 - 1.35, v0 + .35 * k], [u0 - .45, v0 - .2 * k], [u0 + .45, v0 + .22 * k], [u0 + 1.25, v0 - .25 * k]];
      const { d, e } = suru(c, pts, 20, .38, .13, .3); b.ground(pth('#1d5868', d, opa(.75)) + pth('#e6f4f4', e, opa(.95))); }
    // şamandıraya bağlı ikinci sandal (sol önde) ve turuncu şamandıra
    { const bu = -2.0 + r() * .2, bv = .45 + r() * .4, [x, y] = at(bu, bv), p = pr(x, y, 0), hd = ang(-1, -.3 - r() * .4);
      b.ground(ln(M.kopuk, ell(p[0], p[1] + .5, 6, 2.4), .7, opa(.6)));
      b.art(x, y, 0, pth('#b85a26', circ(0, -2.6, 3)) + pth('#e8823a', circ(-.5, -3, 2.3)) + pth('#f6c08a', circ(-1.4, -4, .8)), { r: .1, h: .2 });
      const ca = Math.cos(hd), sa = Math.sin(hd), bx = x - ca * .85, by = y - sa * .85;
      const T3 = tekne(b, bx, by, hd, Object.assign({ L: 1.2, B: .56, h: .23, hb: .34, tw: .5, otur: [.45], ic: '#d4c39e', cap: '#8a6238' }, RENK[(ri + 2) % 4]), T => ln('#cdb98a', 'M' + Q(T.sc([T.L * .3, 0, T.zf])) + 'a3 1.5 0 1 0 .1 0', 1));
      tekneSu(b, T3, Kd.derin); const bw = T3.G(T3.pt(1, .9, 1)); b.line3([[bw[0], bw[1], .3], [x - ca * .2, y - sa * .2, .02]], '#cdb98a', .7);
      if (r() < .55) { const m0 = T3.G([T3.L * .6, 0, .08]), A = T3.sc([T3.L * .84, 0, .5]), E = T3.sc([T3.L * .24, 0, 1.0]), dx = E[0] - A[0], dy = E[1] - A[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l, P = (k, o) => f1(A[0] + dx * k + nx * o) + ' ' + f1(A[1] + dy * k + ny * o), bez = ['#efe4c8', '#d9a65a', '#c4693e'][Math.floor(r() * 3)]; let bag = '';
        for (let i = 0; i < 5; i++) bag += `M${P(.16 + i * .16, -.8)}L${P(.17 + i * .16, 2.8)}`;
        b.line3([m0, [m0[0], m0[1], .92]], tone(M.ahsapK, .1), 1.6);
        b.item([m0[0] - .3, m0[1] - .3, .4, m0[0] + .3, m0[1] + .3, 1.1], ln(tone(bez, -.3), `M${P(.08, 1.3)}L${P(.94, 1.3)}`, 3.2) + ln(bez, `M${P(.08, .7)}L${P(.94, .7)}`, 2) + ln(M.ahsapK, `M${P(0, 0)}L${P(1, 0)}`, 1.4) + ln('#5a4636', bag, .7), { cast: false }); } }
    // uçan martı: iskelenin ucunun ötesinde, açık suyun üstünde
    { const [x, y] = at(1.9 + r() * .3, -.85 + r() * .4); martiUc(b, x, y, 1.0, 1.1); }
    // kıyı kayaları (yan kenarlarda, suya taşmadan) ve kumul çalıları
    for (const [u, s] of [[-2.3, .9], [-2.0, .6], [2.15, .8]]) { const [x, y] = at(u, shore(u) + .05); b.rock(x, y, 0, { s, col: '#a59a84' }); }
    for (const [u, s] of [[-1.7, .8], [-.4, .7], [1.1, .8]]) { const [x, y] = at(u, shore(u) - 1.55); b.tree(r() < .3 ? 'cicek' : 'cali', x, y, { s, col: '#6f8f4a', fl: '#e8d870', cast: false }); }
  }

  // kenar boyunca kuşak: u = f(v) + d eğrisinin solu (kara yanı) boyanır; z(v) verilirse o yükseklikte
  const yanKus = (c, f, d, col, o, z) => { const ps = [c.S(-6, -7, 0)]; for (let v = -7; v <= 4.61; v += .58) ps.push(c.S(f(v) + (typeof d === 'function' ? d(v) : d), v, z ? z(v) : 0)); ps.push(c.S(-6, 4.6, 0)); c.b.ground(pth(col, sm(ps), opa(o))); };
  // yosun yatağı: dipte koyu leke, akıntı yönünde uzanan yapraklar (derindekiler koyu, yüzeye vuranlar altın sarısı), yüzen kesecikler
  const yosun = (c, u, v, R, a0) => { const { r, S } = c; let dk = '', lt = '', bl = '';
    for (let i = 0; i < 14; i++) { const a = r() * 6.283, q = Math.sqrt(r()) * R, p = S(u + Math.cos(a) * q, v + Math.sin(a) * q), aa = a0 + (r() - .5) * .8, L = 11 + r() * 13, x1 = p[0] + Math.cos(aa) * L, y1 = p[1] + Math.sin(aa) * L * .55;
      const f = yaprak(p[0], p[1], x1, y1, 1.7 + r() * 1.3, (r() - .5) * 6); if (i % 3 === 0) dk += f; else lt += f; if (i % 2) bl += circ(x1 - Math.cos(aa) * L * .3, y1 - Math.sin(aa) * L * .17, 1.1); }
    c.b.ground(pth('#14403a', leke(c, u, v, R * 1.15, .9), opa(.5)) + pth('#5f5c28', dk, opa(.9)) + pth('#b09840', lt, opa(.95)) + pth('#dcc466', bl)); };

  /* =================== II · KOY VE KAYALIK: yanda makili kayalık kıyı, kulübe ve iskelecik, yosun yatakları, ağ mantarları =================== */
  function koy(c) {
    const { b, r, at, S, Kd } = c, ph = r() * 6.283, ax = c.ayna > 0 ? 0 : 1, j = () => (r() - .5) * .16, hb = -1.85 + (r() - .5) * .5;
    // kıyı çizgisi u = coast(v): arkada ortaya yakın, ortada kulübenin burnu, önde köşeye kıvrılır; hz yarın yüksekliği
    const cp = [[-8, -.35], [-5.9, -.6 + j()], [-4.5, -.95 + j()], [-3.2, -1.05 + j()], [hb - .6, -.8], [hb + .1, -.5], [hb + .8, -.84], [.4, -1.28 + j()], [1.5, -1.42 + j()], [2.6, -1.08 + j()], [3.7, -.85], [6, -.6]];
    const coast = v => egri(cp, v) + Math.sin(v * 2.3 + ph) * .04, hz = v => .34 + Math.sin(v * .9 + ph) * .04 + Math.max(0, .12 - Math.abs(v - hb) * .08);
    // su: kıyıdan açığa kuşaklar; sığlıkta dipteki taşlar açık lekeler olarak görünür
    yanKus(c, coast, v => 2.6 + Math.sin(v * .7 + ph) * .35, Kd.orta); yanKus(c, coast, v => 1.35 + Math.sin(v * 1.3 + ph) * .22, tone(Kd.sig, -.12)); yanKus(c, coast, v => .6 + Math.sin(v * 2.1 + ph) * .12, Kd.sig);
    { let lt = '', dk = ''; for (let i = 0; i < 12; i++) { const v = -6 + r() * 9.8, u = coast(v) + .3 + r() * 1.0, p = S(u, v), rx = 3.5 + r() * 6;
        dk += ell(p[0] + 1, p[1] + 1.3, rx * 1.05, rx * .48); lt += ell(p[0] - .6, p[1] - .3, rx * .78, rx * .34); }
      b.ground(pth('#2a7062', dk, opa(.4)) + pth('#a6dcc2', lt, opa(.45))); }
    { let d = ''; for (let i = 0; i < 12; i++) { const v = -5.6 + r() * 9, u = coast(v) + 1 + r() * 3.5, p = S(u, v), w = 4 + r() * 6; d += `M${f1(p[0])} ${f1(p[1])}q${f1(w / 2)} -1.8 ${f1(w)} 0`; } b.ground(ln('#cfeee0', d, .8, opa(.45))); }
    // ağ mantarları: suda kavisli dizi, uçta bayraklı işaret şamandırası (tohuma göre arkada ya da yanda)
    const arka = r() < .55, A0 = arka ? [.1 + r() * .3, -4.9 + r() * .3] : [1.85, -3.9 + r() * .4], A1 = arka ? [1.9 + r() * .2, -2.5 + r() * .4] : [1.6 + r() * .25, .3 + r() * .5], bk = arka ? .35 : -.4;
    const AP = k => [A0[0] + (A1[0] - A0[0]) * k + Math.sin(k * 3.14) * bk, A0[1] + (A1[1] - A0[1]) * k];
    // yosun yatakları (ağ dizisinden uzakta) ve çevrelerinde balıklar
    const ky = [[.3 + r() * .3, arka ? -3.2 + r() * .4 : -3.9 + r() * .5, .55], [.95 + r() * .35, -.95 + r() * .5, .6], [-.25 + r() * .4, 1.55 + r() * .45, .5]];
    for (const [u, v, R] of ky) yosun(c, u, v, R, (r() < .5 ? -.35 : .35) + (r() < .5 ? 0 : 3.14));
    { const [u, v] = ky[1], k = r() < .5 ? 1 : -1, s0 = suru(c, [[u - 1.0, v + 1.05 * k * .6 + .5], [u - .1, v + .95], [u + .8, v + .45]], 7, .6, .22, .22, .3);
      const [u2, v2] = ky[2], s1 = suru(c, [[u2 + .5, v2 - .35], [u2 + 1.4, v2 + .05]], 4, .52, .18, .2, .5);
      b.ground(pth('#24403f', s0.d, opa(.85)) + pth('#c8d8d2', s0.e, opa(.95)) + pth('#b8483a', s1.d, opa(.9)) + pth('#f0a890', s1.e, opa(.95))); }
    // kıyı: köpük, ıslak taş, görünen yar yüzleri (katman çizgili), makili kaya düzlüğü
    yanKus(c, coast, .1, M.kopuk, .65); yanKus(c, coast, .02, '#3d5a52');
    { const kv = kova(); let st = ''; for (let v = -6.5; v < 4; v += .5) { const u0 = coast(v), u1 = coast(v + .5), A = at(u0, v), B2 = at(u1, v + .5), e = [B2[0] - A[0], B2[1] - A[1], 0];
        let n = [e[1], -e[0], 0]; if ((n[0] - n[1]) * c.ayna < 0) n = n.map(x => -x); if (dot(n, VIEW) <= 0) continue;
        kv.add(tone('#a0977f', q8(toneOf(unit(n))) - .04), `M${Q(S(u0, v))} ${Q(S(u1, v + .5))} ${Q(S(u1, v + .5, hz(v + .5)))} ${Q(S(u0, v, hz(v)))}Z`);
        st += `M${Q(S(u0, v, hz(v) * .45))} ${Q(S(u1, v + .5, hz(v + .5) * .5))}`; }
      b.ground(kv.svg(true) + ln('#5e584c', st, .8, opa(.45))); }
    yanKus(c, coast, 0, Kd.kara, 1, hz);
    const kv0 = hb - .05, ku = coast(kv0) - .66, [hx, hy] = at(ku, kv0), z0 = hz(kv0), w = .34;
    { let g = '', d = '', s = ''; for (let i = 0; i < 16; i++) { const v = -6.3 + r() * 10.3, u = coast(v) - .4 - r() * 2.1, p = leke(c, u, v, .25 + r() * .35, .75, hz(v)); if (i % 3 === 0) d += p; else g += p; }
      for (let i = 0; i < 9; i++) { const v = -6 + r() * 9.8, u = coast(v) - .22 - r() * .9, p = S(u, v, hz(v)), q = 4 + r() * 6; s += `M${f1(p[0] - q)} ${f1(p[1])}l${f1(q * .4)} ${f1(-q * .3)}l${f1(q * 1.1)} ${f1(-q * .06)}l${f1(q * .5)} ${f1(q * .32)}l${f1(-q * .7)} ${f1(q * .2)}z`; }
      const ps = []; for (let i = 0; i < 14; i++) { const v = -5.8 + r() * 9.6; ps.push(S(coast(v) - .3 - r() * 1.6, v, hz(v))); }
      const yol = [[ku + .1, kv0 + .4], [ku - .45, kv0 + .1], [ku - 1.0, kv0 - .5], [ku - 1.5, kv0 - 1.3], [ku - 2.1, kv0 - 1.8]].map(([u, v]) => S(u, v, hz(v)));
      b.ground(pth('#7a8c4a', g, opa(.6)) + pth('#c8bd8c', d, opa(.55)) + pth('#d6ccb2', s, opa(.85)) + ln('#cbb98a', sm(yol, false), 4.2, opa(.75)) + ot(ps, '#56683a')); }
    // kulübe: yarın üstünde, kapısı suya bakar
    { const bx = b.box(hx - w, hy - w, z0, hx + w, hy + w, z0 + .48, '#ebe3cf', { edge: false }), F1 = ax ? bx.L : bx.R, F2 = ax ? bx.R : bx.L;
      F1.stones(5).door(.26, .24, .36, { col: '#3f6f8a', sove: null }).lantern(.62, .36, { r: 12 }); F2.stones(4).win(.25, .18, .22, .17, { frame: '#3f6f8a', lit: .5 });
      b.gable(hx - w, hy - w, hx + w, hy + w, z0 + .48, .34, M.kiremit, { axis: ax ? 'x' : 'y', ov: .09 }); b.chimney(hx - w * .5, hy - w * .5, z0 + .55, .32, { smoke: false, w: .11 }); }
    // maki çalıları (bazısı çiçekli), fıstık çamları, kimi tohumda kulübenin ardında servi
    for (let i = 0; i < 10; i++) { const v = -6.2 + i * 1.05 + r() * .5; if (Math.abs(v - kv0) < .8) continue; const u = coast(v) - .3 - r() * 1.6, [x, y] = at(u, v);
      b.tree(r() < .28 ? 'cicek' : 'cali', x, y, { s: .85 + r() * .5, z: hz(v), col: r() < .5 ? '#4c673a' : '#5f7a44', fl: r() < .5 ? '#e8c84a' : '#eaa6c6', cast: false }); }
    for (const [dv, du, s0] of [[-1.7 - r() * .5, -.6, .66], [2.3 + r() * .6, -.55, .6]]) { const v = kv0 + dv, u = coast(v) + du - r() * .4, [x, y] = at(u, v); b.tree('fistik', x, y, { s: s0, z: hz(v), col: '#3f6e48' }); }
    if (r() < .6) { const v = kv0 - .8, u = coast(v) - 1.3, [x, y] = at(u, v); b.tree('selvi', x, y, { s: .5, z: hz(v), col: '#2f5d45' }); }
    // kıyı dibinde yontma kayalar (iskelecik boş kalır), köpük halkalı; yar üstünde iki iri kaya
    const iv = kv0 + .5, kpal = t => K.mix('#57534a', '#dcd2b8', kis((t + .5) / .95));
    for (let v = -6.3; v < 3.9; v += .62 + r() * .3) { if (Math.abs(v - iv - .45) < .6) continue; const u = coast(v) + .04 + r() * .12, [x, y] = at(u, v), R = .16 + r() * .15, H = .2 + r() * .3, p = pr(x, y);
      b.ground(ln(M.kopuk, ell(p[0], p[1] + 1, R * 42, R * 17), .8, opa(.6)));
      kaya(b, x, y, [[R, 0], [R * 1.08, H * .5], [R * .6, H]], Kd.kaya, 5, .32, r, { rot: r() * 3, pal: kpal }); }
    for (const v of [-5.2 + r() * .4, -3.6 + r() * .4]) { const u = coast(v) - .45, [x, y] = at(u, v), R = .3 + r() * .1, z1 = hz(v);
      kaya(b, x, y, [[R, z1], [R * 1.08, z1 + .26], [R * .58, z1 + .52 + r() * .16]], Kd.kaya, 6, .3, r, { rot: r() * 3, pal: kpal }); }
    // iskelecik: kulübenin önünden suya; arka yanında bağlı sandal
    const iu = coast(iv) - .12, [ix, iy] = at(iu, iv), L0 = 1.05, zi = z0 - .04;
    { const X0 = ix - (ax ? .24 : 0), X1 = ix + (ax ? .24 : L0), Y0 = iy - (ax ? 0 : .24), Y1 = iy + (ax ? L0 : .24);
      for (const f of [.5, .96]) for (const k of [-1, 1]) { const px = ax ? ix + k * .19 : ix + L0 * f, py = ax ? iy + L0 * f : iy + k * .19; b.cyl(px, py, .05, 0, zi - .05, '#6f5038', { cast: false }).band(0, .07, '#2f4a32', .01, false); const p = pr(px, py); b.ground(pth(M.kopuk, ell(p[0], p[1], 4, 1.6), opa(.7))); }
      const dk = b.slab(X0, Y0, X1, Y1, zi, .06, '#a8845a'); dk.T.planks({ dir: ax ? 'h' : 'v', step: .13, dt: -.2, wid: .7 });
      const bp = ax ? [ix - .24 - .42, iy + L0 * .55] : [ix + L0 * .55, iy - .24 - .42];
      const RN = [{ boya: '#e8e2d2', ser: '#c0473a', kar: '#2c4a78' }, { boya: '#3f7f8a', ser: '#f0dfb8', kar: '#3c3836' }, { boya: '#c99a2e', ser: '#2f6f9f', kar: '#5a3a26' }][Math.floor(r() * 3)];
      const T = tekne(b, bp[0], bp[1], ax ? Math.PI / 2 : 0, Object.assign({ L: 1.3, B: .58, h: .24, hb: .36, tw: .5, otur: [.48], ic: '#d4c39e', cap: '#8a6238' }, RN), T2 => {
        const k = kova(); k.add(tone('#8a5444', -.2), ell(...T2.sc([.36, 0, T2.zf + .04]), 7, 3.4)).add('#8a5444', ell(...T2.sc([.38, -.02, T2.zf + .07]), 5.6, 2.6)); return k.svg(); });
      tekneSu(b, T, Kd.derin);
      const bw = T.G(T.pt(1, .9, 1)); b.line3([[bw[0], bw[1], .3], [ax ? X0 : ix + L0 * .9, ax ? iy + L0 * .9 : Y0, zi]], '#cdb98a', .7);
      // iskelecikte barbunya sepeti
      const sx = ax ? ix + .05 : ix + L0 * .72, sy = ax ? iy + L0 * .72 : iy + .05; b.art(sx, sy, zi, pth('#8a6238', 'M-5 0L-5.6 -4.6H5.6L5 0Q0 1.6 -5 0Z') + pth('#b98a52', 'M-5 0L-5.6 -4.6H0V1.2Q-3 1 -5 0Z') + pth('#d8604a', ell(-1.6, -5, 2.6, 1.2) + ell(1.6, -5.2, 2.6, 1.2)) + pth('#f0a08a', ell(-.2, -5.8, 2.2, 1)), { r: .14, h: .3 }); }
    // ağ mantarlarının dizisi ve işaret şamandırası
    { const n = 11; let dk = '', da = '', db = '', net = ''; for (let i = 0; i <= n; i++) { const p = S(...AP(i / n)); dk += ell(p[0], p[1] + .6, 3.4, 1.3); const fc = circ(p[0], p[1] - 1.3, 2.1); if (i % 2) da += fc; else db += fc; net += `M${f1(p[0])} ${f1(p[1] + .5)}v6`; }
      const ps = []; for (let i = 0; i <= 10; i++) ps.push(S(...AP(i / 10)));
      b.ground(ln('#cfeee0', net + sm(ps.map(p => [p[0], p[1] + 6]), false), .6, opa(.35)) + ln('#e8dcc0', sm(ps, false), .7, opa(.8)) + pth(M.kopuk, dk, opa(.6)) + pth('#e0782e', da) + pth('#f4ecd8', db));
      const [ex, ey] = at(A1[0] + .1, A1[1] + .2); b.art(ex, ey, 0, ln(M.demir, 'M0 -2V-17', 1) + pth('#c0473a', 'M0 -17l7 2.2l-7 2.4z') + pth(tone('#2c2c34', -.1), 'M-3.4 0Q-3.8 -4.6 0 -5.2Q3.8 -4.6 3.4 0Q0 1.6 -3.4 0Z') + pth('#e0782e', 'M-3.4 -1.6Q0 -.4 3.4 -1.6L3.5 -3.4Q0 -2 -3.5 -3.4Z') + ln(M.kopuk, ell(0, 0, 6, 2.2), .7, opa(.7)), { r: .12, h: .7 }); }
  }

  /* =================== III · AÇIK DENİZ: uzun ölü dalgalar ve köpüklü sırtlar, latin yelkenli balıkçı kayığı, şamandıra, balık kaynaşması, dalan sümsükkuşu =================== */
  function acik(c) {
    const { b, r, at, S, Kd, ang } = c, tilt = (r() - .5) * .28;
    // dalga sıraları: sırtın ardında gölge, önünde aydınlık yüz (arkadan öne)
    const kab = []; for (let k = 0; k < 6; k++) { const v0 = -6.9 + k * 2.2 + (r() - .5) * .4, A = .18 + r() * .16, f = .55 + r() * .35, p0 = r() * 6.283; kab.push(u => v0 + tilt * u + Math.sin(u * f + p0) * A + Math.sin(u * f * 2.6 + p0 * 1.7) * A * .35); }
    const band = (C, d0, d1, col, o) => { const ps = []; for (let u = -3.6; u <= 3.61; u += .6) ps.push(S(u, C(u) + d0(u))); for (let u = 3.6; u >= -3.61; u -= .6) ps.push(S(u, C(u) + d1(u))); return pth(col, sm(ps), opa(o)); };
    { let g = ''; for (const C of kab) g += band(C, u => -.55 - Math.sin(u * 1.7) * .1, () => 0, tone(Kd.derin, -.3), .55) + band(C, () => 0, u => 1.3 + Math.sin(u * 1.3 + 1) * .25, Kd.sig, .22) + band(C, () => 0, u => .45 + Math.sin(u * 2.1) * .08, Kd.sig, .3);
      b.ground(g); }
    // dalgalar arasında kırışıklar ve rüzgâr izleri
    { let d = '', e = '', w0 = ''; for (let i = 0; i < 24; i++) { const p = S(-3 + r() * 6, -6.4 + r() * 10.5), w = 4 + r() * 5, q = `M${f1(p[0])} ${f1(p[1])}q${f1(w / 2)} -1.8 ${f1(w)} 0`; if (i % 3) d += q; else e += q; }
      for (let i = 0; i < 5; i++) { const p = S(-2.8 + r() * 5, -5.4 + r() * 8.6), L = 30 + r() * 40; w0 += `M${Q(p)}l${f1(L * c.ayna)} ${f1(L * (.12 + tilt * .5))}`; }
      b.ground(ln('#cfe2ea', d, .8, opa(.35)) + ln(tone(Kd.derin, -.35), e, .8, opa(.35)) + ln(M.kopuk, w0, .7, 'stroke-dasharray="7 5 2 6" opacity=".25"')); }
    // kırılan sırtlar: köpük başlıkları, önlerinde köpük izi, üstlerinde serpinti
    { let cp = '', st = '', sp = ''; for (const C of kab) for (let u = -3.4 + r() * .5; u < 3.4; u += .45 + r() * .6) { if (r() < .38) continue; const L = .35 + r() * .75, p0 = S(u, C(u)), p1 = S(u + L, C(u + L)), mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2, hh = 1.6 + r() * 2.2;
        cp += `M${Q(p0)}Q${f1(mx - 1)} ${f1(my - hh * 2)} ${Q(p1)}Q${f1(mx + 2)} ${f1(my + hh * .5)} ${Q(p0)}Z`;
        if (r() < .7) { const a = S(u + L * .1, C(u + L * .1) + .3 + r() * .2), e = S(u + L * .95, C(u + L * .95) + .35); st += `M${Q(a)}Q${f1((a[0] + e[0]) / 2)} ${f1((a[1] + e[1]) / 2 + 1.4)} ${Q(e)}`; }
        if (r() < .35) for (let i = 0; i < 3; i++) sp += circ(mx + (r() - .5) * 12, my - hh * 2 - 1 - r() * 3, .5 + r() * .5); }
      b.ground(pth(M.kopuk, cp, opa(.95)) + ln(M.kopuk, st, .8, opa(.5)) + pth(M.kopuk, sp, opa(.8))); }
    // yerleşim: tekne arkada (kaynaşma önde) ya da önde (kaynaşma arkada)
    const arka = r() < .55, bu = arka ? -.85 + r() * .35 : -.55 + r() * .3, bv = arka ? -1.15 + r() * .3 : .45 + r() * .25;
    const ku = .95 + r() * .35, kv = arka ? 1.25 + r() * .3 : -1.95 + r() * .3, su = arka ? [1.6 + r() * .25, -2.0 + r() * .35] : [-1.65 - r() * .2, -1.5 + r() * .3];
    // kırmızı-beyaz şamandıra
    { const [x, y] = at(...su), p = pr(x, y, 0);
      b.ground(pth(tone(Kd.derin, -.3), ell(p[0] + 3, p[1] + 1, 11, 4), opa(.5)) + ln(M.kopuk, ell(p[0], p[1] + .4, 9, 3.6) + ell(p[0], p[1] + .4, 13, 5.2), .9, opa(.75)));
      const cy = b.cyl(x, y, .16, 0, .4, '#c0392b', { top: '#d4d0c8', cast: true }); cy.band(.15, .11, '#f2eee6', 0, false);
      b.cone(x, y, .1, .4, .32, '#c0392b', { cast: false }); b.line3([[x, y, .7], [x, y, .88]], M.demir, 1.2);
      b.art(x, y, .88, pth('#2a2c33', circ(0, -2.2, 2.3)) + pth('#ffe9a8>#fff2b8', circ(0, -6, 1.3)) + `<circle class="Nl" cx="0" cy="-6" r="14" fill="url(#${K.glowId()})"/>`, { r: .1, h: .3 }); }
    // balıkçı kayığı: sivri kıç, latin yelkeni, kıçta dümenci; ağ yığını ve kasalar
    const [bx, by] = at(bu, bv), hd = ang(1, -1) + (r() - .5) * .35;
    const RN = [{ boya: '#f0e8d6', ser: '#2f6f9f', kar: '#8a3d32' }, { boya: '#2f6f9f', ser: '#f0dfb8', kar: '#2a2a2e' }, { boya: '#f0e8d6', ser: '#b84a3b', kar: '#3c3836' }][Math.floor(r() * 3)];
    c.yel = ['#c4693e', '#d9a65a', '#b8503a'][Math.floor(r() * 3)];
    const sp = Object.assign({ L: 2.1, B: .82, h: .33, hb: .54, hs: .46, tw: 0, otur: [.62], ic: '#d9c7a0', cap: '#8a6238', rb: .16 }, RN);
    const T = tekne(b, bx, by, hd, sp, T2 => {
      const k = kova(); k.add('#7a5444', ell(...T2.sc([T2.L * .78, .02, T2.zf + .04]), 8, 4)).add('#9a6a54', ell(...T2.sc([T2.L * .8, 0, T2.zf + .08]), 6, 2.8));
      const kp = T2.sc([T2.L * .45, -.18, T2.zf]), fp = T2.sc([T2.L * .28, .04, T2.zf]);
      return k.svg() + pth(M.ahsapA, `M${f1(kp[0] - 5)} ${f1(kp[1] - 1)}l5 -2.5l5 2.5l-5 2.5z`) + pth('#b9c7d2', ell(kp[0], kp[1] - 2, 3.6, 1.6)) + `<g transform="translate(${Q(fp)}) scale(.86)">${K.figure({ body: '#d9b34a', legs: '#3a4a6a', hat: 'hasir', shadow: false })}</g>`; });
    tekneSu(b, T, Kd.derin, 1.2);
    { const P = (s0, t0) => T.sc([s0, t0, 0]); let d = '';
      for (const sg of [-1, 1]) d += `M${Q(P(T.L * .96, sg * .08))}Q${Q(P(T.L * .84, sg * .42))} ${Q(P(T.L * .62, sg * .52))}M${Q(P(T.L * .2, sg * .5))}Q${Q(P(T.L * .05, sg * .58))} ${Q(P(-.2, sg * .6))}`;
      b.ground(ln(M.kopuk, d, 1.1, 'stroke-dasharray="6 3 2 3" opacity=".75"') + pth(M.kopuk, `M${Q(P(.05, .12))}Q${Q(P(-.4, 0))} ${Q(P(-.8, .08))}Q${Q(P(-.4, -.1))} ${Q(P(.05, -.12))}Z`, opa(.55))); }
    // direk ve latin yelkeni: seren pruvadan kıça yükselir, bez rüzgâraltına bel verir
    { const ms = T.L * .6, mz = 1.25, yd0 = [T.L * .92, 0, .6], yd1 = [T.L * .16, 0, 1.5], cl = [T.L * .26, .42, .5], G = T.G, sc = T.sc;
      const nn = crs(sub(G(yd1), G(yd0)), sub(G(cl), G(yd0))), side = dot(nn, VIEW) > 0 ? nn : nn.map(v => -v), tn0 = q8(toneOf(unit(side))) * .5 + .08;
      const a0 = sc(yd0), a1 = sc(yd1), cc = sc(cl), bel = sc([T.L * .42, .62, .92]), m3 = [(a0[0] + a1[0] + cc[0]) / 3, (a0[1] + a1[1] + cc[1]) / 3], bl = [(bel[0] - m3[0]) * .9, (bel[1] - m3[1]) * .9];
      const ctl = (p, q, k) => [(p[0] + q[0]) / 2 + bl[0] * k, (p[1] + q[1]) / 2 + bl[1] * k], am = [(a0[0] + a1[0]) / 2, (a0[1] + a1[1]) / 2];
      const yel = c.yel, g = `M${Q(a0)}L${Q(a1)}Q${Q(ctl(a1, cc, .7))} ${Q(cc)}Q${Q(ctl(cc, a0, .5))} ${Q(a0)}Z`, g2 = `M${Q(a0)}L${Q(am)}Q${Q(ctl(am, cc, .6))} ${Q(cc)}Q${Q(ctl(cc, a0, .5))} ${Q(a0)}Z`;
      const xs = [G(yd0), G(yd1), G(cl)].map(p => p[0]), ys = [G(yd0), G(yd1), G(cl)].map(p => p[1]);
      b.item([Math.min(...xs), Math.min(...ys), .4, Math.max(...xs), Math.max(...ys), 1.6], ln(tone(M.ahsapK, .1), `M${Q(sc([ms, 0, .2]))}L${Q(sc([ms, 0, mz]))}`, 2) + pth(tone(yel, tn0), g) + pth(tone(yel, tn0 - .14), g2)
        + ln(tone(yel, -.4), `M${Q(ctl(a0, a1, .1))}L${Q(ctl(cc, a0, .2))}M${Q(ctl(am, a1, .1))}L${Q(ctl(cc, am, .4))}`, .6, opa(.6)) + ln(M.ahsapK, `M${Q(a0)}L${Q(a1)}`, 1.5) + ln('#4a3a34', `M${Q(cc)}L${Q(sc([T.L * .1, .1, .45]))}M${Q(sc([ms, 0, mz]))}L${Q(sc([T.L * .96, 0, .56]))}`, .6), { pts: [G(yd0), G(yd1), G(cl)] }); }
    // balık kaynaşması: suyun altında koyu sürü, köpüren yüzey, sıçrayan uskumrular
    const [kx, ky] = at(ku, kv), kp = pr(kx, ky, 0);
    { let d = '', fm = '', sp0 = '', rg = ''; for (let i = 0; i < 24; i++) { const a = r() * 6.283, q = Math.sqrt(r()) * .8, x = kx + Math.cos(a) * q, y = ky + Math.sin(a) * q * .8; d += balik(x, y, 0, a + 1.57 + (r() - .5), .38, .13); }
      for (let i = 0; i < 10; i++) { const a = r() * 6.283, q = Math.sqrt(r()) * 14, x = kp[0] + Math.cos(a) * q * 1.5, y = kp[1] + Math.sin(a) * q * .55, w = 2.6 + r() * 3.6; fm += `M${f1(x - w)} ${f1(y)}q${f1(w * .5)} ${f1(-w * .6)} ${f1(w)} ${f1(-w * .1)}q${f1(w * .6)} ${f1(-w * .3)} ${f1(w)} ${f1(w * .2)}q${f1(-w)} ${f1(w * .5)} ${f1(-w * 2)} ${f1(-w * .1)}z`; }
      for (let i = 0; i < 16; i++) { const a = r() * 6.283, q = 8 + r() * 18; sp0 += circ(kp[0] + Math.cos(a) * q * 1.5, kp[1] + Math.sin(a) * q * .55, .6 + r() * 1); }
      for (const k of [1, 1.45]) rg += ell(kp[0], kp[1], 26 * k, 10 * k);
      b.ground(pth(Kd.sig, ell(kp[0], kp[1], 36, 14), opa(.42)) + pth('#13304a', d, opa(.72)) + ln(M.kopuk, rg, .8, opa(.5)) + pth(M.kopuk, fm + sp0, opa(.92))); }
    // sıçrayan uskumrular: mavi-yeşil sırt, kaplan çizgileri, gümüş karın
    { let bk = '', bl = '', st = '', ey = '', dr = '', rg = ''; for (const [dx, dy, a, l] of [[-17, -12, -.55, 19], [6, -17, .3, 17], [21, -6, .75, 15]]) { const k = c.ayna, x = kp[0] + dx * k, y = kp[1] + dy, aa = a * k, ca = Math.cos(aa), sa = Math.sin(aa), P = (p, e) => f1(x + ca * p - sa * e) + ' ' + f1(y + sa * p + ca * e);
        bk += balikY(x, y, l, aa); bl += balikY(x - sa * 1.4, y + ca * 1.4, l * .78, aa, .92); ey += circ(x + ca * l * .33 + sa * .6, y + sa * l * .33 - ca * .6, .75);
        for (const t of [.12, -.04, -.2]) st += `M${P(l * t, -l * .05)}Q${P(l * t - 1.4, -l * .14)} ${P(l * t - .4, -l * .2)}`;
        dr += circ(x - ca * l * .62, y + 6, 1.1) + circ(x - ca * l * .72, y + 10, .8); rg += ell(x - ca * l * .2 + 1, kp[1] + dy * .2 + 3, 5, 1.8); }
      b.ground(ln(M.kopuk, rg, .8, opa(.8)));
      b.item([kx - .3, ky - .3, 0, kx + .3, ky + .3, .6], pth('#2c6a7a', bk) + pth('#e2eaee', bl) + ln('#163a46', st, .8) + pth('#0e1a22', ey) + pth(M.kopuk, dr, opa(.9)), { cast: false }); }
    // dalan sümsükkuşu: kanatlar geriye açılmış, gaga suya dönük; altında suya giriş köpüğü
    { const k = c.ayna, p = pr(kx - .5, ky - .25, .95), g = pr(kx - .2, ky - .05, 0);
      b.ground(ln(M.kopuk, ell(g[0], g[1], 4.4, 1.7), .9, opa(.85)) + pth(M.kopuk, circ(g[0] - 2, g[1] - 2.4, .8) + circ(g[0] + 2.2, g[1] - 3, .7), opa(.85)));
      b.item([kx - .7, ky - .45, .8, kx - .3, ky - .05, 1.3], `<g transform="translate(${Q(p)}) scale(${k} 1) rotate(58)">` + pth('#f4f1ea', 'M1 -1.6L-4 -7.6L-14 -9.2L-9.6 -4.6L-6 -1.4ZM1 1.6L-4 7.6L-14 9.2L-9.6 4.6L-6 1.4Z') + pth('#d4d0c6', 'M-6 1.4L-9.6 4.6L-14 9.2L-4 7.6Z')
        + pth('#22242a', 'M-10.4 -8.5L-14 -9.2L-11 -6.2ZM-10.4 8.5L-14 9.2L-11 6.2ZM-11 0L-15.6 -1.6L-14.6 0L-15.6 1.6Z') + pth('#f4f1ea', 'M-11.5 0Q-6 -2.8 0 -2.2Q4 -1.8 5.6 0Q4 1.8 0 2.2Q-6 2.8 -11.5 0Z') + pth('#dcd6c8', 'M-11.5 0Q-6 2.8 0 2.2Q4 1.8 5.6 0Z')
        + pth('#ecd49a', ell(4.4, 0, 2.6, 1.9)) + pth('#5a6470', 'M6.6 -.8L12 0L6.6 .8Z') + pth('#1a1c22', circ(5, -.7, .5)) + '</g>', { cast: false }); }
    // kaynaşmanın üstünde dönen martılar ve gerideki bir martı
    { const [x, y] = at(ku + .55, kv - .7); martiUc(b, x, y, 1.15, .9); }
    { const [x, y] = at(-.6 + r() * .5, arka ? -3.3 + r() * .3 : -3.0 + r() * .3); martiUc(b, x, y, .8, .85); }
  }

  /* =================== IV · DERİN DENİZ: suyun altında kayalık resif (açık lekeler, mercan başları), uçurum kenarı, demirli dalış teknesi, dalgıç şamandırası, balıklar =================== */
  function resif(c) {
    const { b, r, at, S, Kd, ang } = c, ph = r() * 6.283, sl = .35 + r() * .3, W = '#3a98c4', su = (col, k) => K.mix(col, W, k);
    // resif düzlüğünün ön kenarı: bir yanda önde, öbür yanda geride; önü derin mavi uçurum
    const edge = u => .75 - u * sl + Math.sin(u * 1.6 + ph) * .32 + Math.sin(u * 3.7 + ph * 2) * .1;
    const kus = (f, col, o) => ustKus(c, f, col, o, .35);
    { const ps = [S(-4.2, 8)]; for (let u = -4.2; u <= 4.21; u += .5) ps.push(S(u, edge(u) + 2.4 + Math.sin(u * 1.2) * .4)); ps.push(S(4.2, 8)); b.ground(pth(tone(Kd.derin, -.22), sm(ps), opa(.8))); }
    // derine inen soluk ışık huzmeleri
    { let d = ''; for (let i = 0; i < 4; i++) { const u = -2.2 + i * 1.3 + r() * .5, p = S(u, edge(u) + .4), w = 5 + r() * 6; d += `M${f1(p[0] - w)} ${f1(p[1])}l${f1(w * 2)} 0l${f1(14 + w)} 56l${f1(-w * 2 - 4)} 0z`; } b.ground(pth('#8ad0f0', d, opa(.07))); }
    kus(u => edge(u) + .5, '#0d3f70', .55); kus(edge, '#2f88b8'); kus(u => edge(u) - .3, '#3a98c4', .8);
    // düzlükte açık kum lekeleri
    { let d = ''; for (let i = 0; i < 8; i++) { const u = -2.6 + r() * 5.2, v = Math.min(edge(u) - .9, -5.6 + r() * 5.4); d += leke(c, u, v, .45 + r() * .4, .7); } b.ground(pth('#90d2dc', d, opa(.42))); }
    // demirli tekne yeri (kumun üstünde kalsın diye resif tümsekleri ondan uzak durur)
    const bu = -.8 + r() * .5, bv = -2.6 + r() * .5;
    // resif tümsekleri: suyla örtülü kaya (açık leke), üstünde mercan başları; uzaktan yakına
    const bom = []; for (let i = 0; i < 80 && bom.length < 4; i++) { const u = -2.3 + r() * 4.6, vm = edge(u) - .9, v = -5.5 + r() * Math.max(0, vm + 5.5);
      if (Math.abs(u) + .29 * Math.abs(v + 1.17) > 2.55 || Math.hypot(u - bu, (v - bv) * .7) < 1.15 || bom.some(q => Math.hypot(q[0] - u, (q[1] - v) * .75) < 1.5)) continue; bom.push([u, v, .85 + r() * .4]); }
    bom.sort((p, q) => p[1] - q[1]);
    const RK = ['#e0705e', '#eaa04c', '#a86ccc', '#ddc254', '#4fbfa6', '#e2649a', '#f08a5a'];
    const DT = new Map(), dt = (col, x, y, rr) => { const k = col + '|' + Math.max(1, Math.round(rr * 2)); DT.set(k, (DT.get(k) || '') + `M${f1(x)} ${f1(y)}h.01`); };
    const tepe = (cx, cy, R, col, n = 5) => { const cs = [[cx, cy, R * .62]]; for (let k = 0; k < n; k++) { const a = k / n * 6.283 + r() * .6, d = R * (.42 + r() * .25); cs.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d * .55, R * (.3 + r() * .18)]); }
      for (const q of cs) dt(tone(col, -.3), q[0], q[1], q[2]); for (const q of cs) dt(col, q[0] - R * .08, q[1] - R * .1, q[2] * .78); for (const q of cs) if (q[1] <= cy + 1) dt(tone(col, .26), q[0] - R * .16, q[1] - R * .18, q[2] * .45); };
    let sh = '', rk = '', rl = '', ms = '';
    for (const [u, v, s] of bom) { sh += leke(c, u + .32, v + .42, .78 * s, .62); rk += leke(c, u, v, .72 * s, .66, 0, 9); rl += leke(c, u - .14, v - .2, .42 * s, .55);
      const n = 4 + Math.floor(r() * 3); for (let k = 0; k < n; k++) { const a = r() * 6.283, q = Math.sqrt(r()) * .5 * s, p = S(u + Math.cos(a) * q, v + Math.sin(a) * q * .66); tepe(p[0], p[1] - 2, 4.6 + r() * 3.4, su(RK[Math.floor(r() * RK.length)], .38)); }
      if (r() < .7) { const p = S(u + (r() - .5) * .6 * s, v + .1 + r() * .3); ms += MERCAN[r() < .5 ? 'yelpaze' : 'geyik'](p[0], p[1], 4 + r() * 2, su(RK[Math.floor(r() * RK.length)], .3)); } }
    // aralarda tek tük küçük mercan ve taş
    for (let i = 0; i < 9; i++) { const u = -2.5 + r() * 5, v = edge(u) - .25 - r() * 4.2; if (v < -5.9 || bom.some(q => Math.hypot(q[0] - u, (q[1] - v) * .75) < .9)) continue; const p = S(u, v);
      if (i % 3) tepe(p[0], p[1], 2.6 + r() * 2, su(RK[Math.floor(r() * RK.length)], .42), 4); else ms += MERCAN[['sunger', 'beyin', 'tabla'][i % 3 ? 0 : Math.floor(r() * 3)]](p[0], p[1], 3 + r() * 1.5, su(RK[Math.floor(r() * RK.length)], .4)); }
    { let o = ''; for (const [k, d] of DT) { const [c0, w] = k.split('|'); o += ln(c0, d, w); } b.ground(pth('#1a5c8a', sh, opa(.32)) + pth('#5e93ad', rk) + pth('#86b8cb', rl, opa(.85)) + o + ms); }
    // orfoz: tümseklerin dibinde iri, benekli; suyun altında
    { const [u, v] = bom.length ? bom[bom.length - 1] : [-1, -.5], [x, y] = at(u + .55, v + .55), phi = ang(c.ayna, .2), p = pr(x, y);
      b.ground(pth('#1a3a50', balik(x + .05, y + .07, 0, phi, 1.0, .4), opa(.3)) + pth('#6a5a48', balik(x, y, 0, phi, .95, .38)) + pth('#8a7a62', balik(x - .02, y - .02, 0, phi, .6, .16)) + K.dots('#c9b896', [[p[0] - 3, p[1] - 1], [p[0] + 2.4, p[1] + .4], [p[0] - .4, p[1] - 2], [p[0] + 5, p[1] - .8]], 1.5)); }
    // su örtüsü: resif suyun altında kalsın; dipte ışık ağı
    kus(edge, W, .2);
    { let d = ''; const G = []; for (let i = 0; i <= 7; i++) { G.push([]); for (let k = 0; k <= 8; k++) G[i].push([-3.1 + k * .78 + (r() - .5) * .34, -6.3 + i * .95 + (r() - .5) * .34]); }
      for (let i = 0; i <= 7; i++) for (let k = 0; k <= 8; k++) { const [u, v] = G[i][k]; if (v > edge(u)) continue; const p = S(u, v);
        for (const [i2, k2] of [[i, k + 1], [i + 1, k]]) { if (i2 > 7 || k2 > 8) continue; const [u2, v2] = G[i2][k2]; if (v2 > edge(u2)) continue; const q = S(u2, v2); d += `M${Q(p)}Q${f1((p[0] + q[0]) / 2 + (r() - .5) * 7)} ${f1((p[1] + q[1]) / 2 + (r() - .5) * 4)} ${Q(q)}`; } }
      b.ground(ln('#c8eef8', d, .7, opa(.3))); }
    // yüzey: hafif kırışıklar, sol üstte güneş pırıltısı
    { let d = '', g = ''; for (let i = 0; i < 16; i++) { const p = S(-2.8 + r() * 5.6, -5.6 + r() * 9), w = 5 + r() * 6; d += `M${f1(p[0])} ${f1(p[1])}q${f1(w / 2)} -2 ${f1(w)} 0`; }
      for (let i = 0; i < 7; i++) { const p = S(-2.2 + r() * 1.6, -4.4 + r() * 3), k = .8 + r() * 1.2; g += `M${f1(p[0])} ${f1(p[1] - k * 2)}l${f1(k * .5)} ${f1(k * 1.5)}l${f1(k * 1.5)} ${f1(k * .5)}l${f1(-k * 1.5)} ${f1(k * .5)}l${f1(-k * .5)} ${f1(k * 1.5)}l${f1(-k * .5)} ${f1(-k * 1.5)}l${f1(-k * 1.5)} ${f1(-k * .5)}l${f1(k * 1.5)} ${f1(-k * .5)}z`; }
      b.ground(ln('#d2eef6', d, .9, opa(.5)) + `<path class="${kf('#ffffff')} Dl" opacity=".85" d="${g}"/>`); }
    // balık sürüsü: uçurum kenarında dönen gümüş halka
    { const [gx, gy] = at(.25 + r() * .5, edge(.4) + .25 + r() * .35); let d = '', e = '';
      for (let i = 0; i < 34; i++) { const a = r() * 6.283, rr = .3 + Math.sqrt(r()) * .5, x = gx + Math.cos(a) * rr, y = gy + Math.sin(a) * rr, f = balik(x, y, 0, a + 1.57 + (r() - .5) * .3, .3, .1); if (i % 3) d += f; else e += f; }
      b.ground(pth('#e8f4f6', d, opa(.92)) + pth('#18466a', e, opa(.8))); }
    // resif balıkları: tümseklerin çevresinde küçük, renkli, aynı yöne yüzen öbekler
    { const kv = kova(), RB = ['#f0d04a', '#4ac0e8', '#f08a3a', '#f4f0e6']; bom.forEach(([u, v], i) => { const k = r() < .5 ? 1 : -1, s0 = suru(c, [[u - .6 * k, v + .5], [u + .5 * k, v + .3]], 4, .24, .1, .14, 0); kv.add(RB[i % 4], s0.d); }); b.ground(kv.svg()); }
    // demirli dalış teknesi: pruvadan suya inen demir halatı; içinde tüpler ve küpeştede oturan dalgıç
    const [bx, by] = at(bu, bv), hd = ang(1, -.15 - r() * .35);
    const T = tekne(b, bx, by, hd, { L: 1.85, B: .78, h: .3, hb: .46, hs: .36, tw: .6, otur: [.55], boya: '#f2efe8', ser: '#2c6fb0', kar: '#1f3f66', ic: '#d8d2c4', cap: '#6a7a86' }, T2 => {
      let s0 = ''; for (const [s1, t1] of [[.5, -.18], [.5, .02], [.64, -.1]]) { const p = T2.sc([s1 * T2.L, t1, T2.zf]); s0 += pth('#c99a2e', `M${f1(p[0] - 1.6)} ${f1(p[1])}v-6.4a1.6 1.6 0 0 1 3.2 0v6.4z`) + pth('#e8c25a', `M${f1(p[0] - 1.6)} ${f1(p[1] - 6.4)}a1.6 1.6 0 0 1 1.6 -1.6v8z`); }
      const p = T2.sc([T2.L * .26, .2, T2.sheer(.26) * .8]), x = p[0], y = p[1];
      return s0 + pth('#e8c040', `M${f1(x + 1.6)} ${f1(y - 10.6)}h3v7h-3z`) + pth('#1e2228', `M${f1(x - 3)} ${f1(y - 3.6)}V${f1(y - 10)}q0 -2.2 2.6 -2.2h.8q2.6 0 2.6 2.2V${f1(y - 3.6)}zM${f1(x - 3)} ${f1(y - 3.8)}h6l2.6 3.6l-2.4 .6l-2 -2.6h-4.2z`)
        + pth('#1e2228', circ(x - .1, y - 14.4, 2.5)) + pth('#9adcec', `M${f1(x - 2.6)} ${f1(y - 15.2)}h3.4v1.9h-3.4z`) + pth('#e8c040', `M${f1(x + 5.6)} ${f1(y + .6)}l3.6 .4l-.4 1.6l-3.6 -.2z`); });
    tekneSu(b, T, Kd.derin);
    // kıçta fener direği ve dalış bayrağı: gece yanan beyaz ışık
    { const k0 = T.G([.12, 0, T.sheer(.06)]); b.line3([k0, [k0[0], k0[1], 1.0]], '#6a7a86', 1.3);
      b.art(k0[0], k0[1], 1.0, pth('#3a4450', 'M-1.8 0h3.6v-1h-3.6zM-1.6 -5.6l1.6 -1.4l1.6 1.4z') + pth('#fff2c8>#fff6d8', 'M-1.3 -1h2.6v-4.6h-2.6z') + pth('#d63a2a', `M0 6h${f1(-7 * c.ayna)}v4.4h${f1(7 * c.ayna)}z`) + ln('#f6f0e6', `M0 6.3L${f1(-7 * c.ayna)} 10.1`, 1.2) + `<circle class="Nl" cx="0" cy="-3.2" r="18" fill="url(#${K.glowId()})"/>`, { r: .06, h: .2 }); }
    { const bw = T.G(T.pt(1, 1, 1)), w0 = pr(bw[0], bw[1], 0), dir = [Math.cos(hd), Math.sin(hd)], an = pr(bw[0] + dir[0] * 1.1, bw[1] + dir[1] * 1.1, 0), aq = [an[0], an[1] + 6];
      b.line3([[bw[0], bw[1], T.sheer(1)], [bw[0] + dir[0] * .1, bw[1] + dir[1] * .1, 0]], '#cdb98a', .8);
      b.ground(ln('#cdb98a', `M${Q(w0)}Q${f1((w0[0] + aq[0]) / 2)} ${f1((w0[1] + aq[1]) / 2 + 2)} ${Q(aq)}`, .8, opa(.45)) + ln('#2a3a4a', `M${f1(aq[0] - 3)} ${f1(aq[1] - 1)}l3 2.4l3 -2.4M${f1(aq[0])} ${f1(aq[1] - 3)}v5.4`, 1, opa(.4))); }
    // dalgıç şamandırası: turuncu top, kırmızı-beyaz bayrak; yanında yükselen hava kabarcıkları
    { const [x, y] = at(1.3 + r() * .4, -.75 + r() * .6), p = pr(x, y);
      b.ground(ln(M.kopuk, ell(p[0], p[1] + .5, 7, 2.8), .8, opa(.7)) + pth(M.kopuk, [[10, 4, 1.8], [13, 6, 1.2], [8, 7, 1.4], [15, 2, 1], [12, 9, .9], [6, 4, 1], [17, 6, .8]].map(([dx, dy, rr]) => circ(p[0] + dx * c.ayna, p[1] + dy, rr)).join(''), opa(.85)));
      b.art(x, y, 0, pth('#c84a1e', circ(0, -3, 3.4)) + pth('#f07a2e', circ(-.6, -3.4, 2.6)) + ln(M.demir, 'M0 -5V-17', 1) + pth('#d63a2a', `M0 -17h${f1(8 * c.ayna)}v5.6h${f1(-8 * c.ayna)}z`) + ln('#f6f0e6', `M0 -16.6L${f1(8 * c.ayna)} -11.8`, 1.4), { r: .12, h: .7 }); }
  }

  // mercan başları (ekran pikseli; suyun altında, rengi suyla karışık): beyin, geyik boynuzu, yelpaze, tabla, sünger
  const MERCAN = {
    beyin(x, y, R, c) { return pth(tone(c, -.3), ell(x + 1, y + R * .2, R * 1.05, R * .7)) + pth(c, ell(x, y - R * .1, R, R * .66)) + ln(tone(c, -.34), `M${f1(x - R * .7)} ${f1(y - R * .1)}q${f1(R * .35)} ${f1(-R * .4)} ${f1(R * .7)} 0t${f1(R * .7)} 0M${f1(x - R * .5)} ${f1(y + R * .25)}q${f1(R * .3)} ${f1(-R * .3)} ${f1(R * .6)} 0t${f1(R * .5)} 0`, .7) + pth(tone(c, .3), ell(x - R * .35, y - R * .4, R * .3, R * .16)); },
    geyik(x, y, R, c) { let d = '', t = ''; for (let i = 0; i < 6; i++) { const a = -2.6 + i * .4, l = R * (.8 + (i % 2) * .4), ex = x + Math.cos(a) * l, ey = y + Math.sin(a) * l * .8; d += `M${f1(x)} ${f1(y)}L${f1(ex)} ${f1(ey)}l${f1(Math.cos(a - .5) * R * .35)} ${f1(Math.sin(a - .5) * R * .3)}M${f1(ex)} ${f1(ey)}l${f1(Math.cos(a + .5) * R * .3)} ${f1(Math.sin(a + .5) * R * .3)}`; t += circ(ex, ey, .9); }
      return pth(tone(c, -.35), ell(x, y + 1, R * .9, R * .35)) + ln(tone(c, -.12), d, 1.8) + pth(tone(c, .3), t); },
    yelpaze(x, y, R, c) { let d = ''; for (let i = 0; i < 6; i++) { const a = -2.7 + i * .26; d += `M${f1(x)} ${f1(y)}L${f1(x + Math.cos(a) * R * 1.2)} ${f1(y + Math.sin(a) * R * 1.3)}`; }
      return pth(c, `M${f1(x)} ${f1(y)}L${f1(x + Math.cos(-2.75) * R * 1.25)} ${f1(y + Math.sin(-2.75) * R * 1.3)}Q${f1(x - R * .1)} ${f1(y - R * 1.9)} ${f1(x + Math.cos(-1.35) * R * 1.25)} ${f1(y + Math.sin(-1.35) * R * 1.35)}Z`) + ln(tone(c, -.3), d, .6); },
    tabla(x, y, R, c) { return pth(tone(c, -.36), ell(x + 1, y + R * .25, R * 1.1, R * .45)) + pth(c, ell(x, y, R * 1.15, R * .5)) + pth(tone(c, .26), ell(x - R * .3, y - R * .12, R * .55, R * .2)); },
    sunger(x, y, R, c) { let d = '', o = ''; for (const [dx, h] of [[-R * .5, R * 1.1], [0, R * 1.5], [R * .5, R * .9]]) { d += `M${f1(x + dx - R * .22)} ${f1(y)}v${f1(-h)}h${f1(R * .44)}v${f1(h)}z`; o += ell(x + dx, y - h, R * .22, R * .1); }
      return pth(c, d) + pth(tone(c, -.45), o); },
  };

  // dokunaç: (bx, by) ekranda suya girdiği nokta; h boy, w dip yarı eni (piksel), kk kıvrılma yönü (+1 / -1)
  const dokunac = (bx, by, h, w, kk) => { let a = -1.57 + kk * .22, px = bx, py = by; const L = [], R = [], vz = [], N = 18;
    for (let i = 0; i <= N; i++) { const t = i / N, ww = w * Math.pow(1 - t, .85) + .5, nx = Math.cos(a + 1.57) * kk, ny = Math.sin(a + 1.57) * kk;
      L.push([px - nx * ww, py - ny * ww]); R.push([px + nx * ww, py + ny * ww]); if (i % 2 === 0 && i > 1 && i < N - 2) vz.push([px + nx * ww * .5, py + ny * ww * .5, Math.max(.7, ww * .32)]);
      px += Math.cos(a) * h / N; py += Math.sin(a) * h / N; a += kk * (.02 + 1.1 * t * t * t); }
    const body = 'M' + L.concat(R.slice().reverse()).map(Q).join(' ') + 'Z', inner = 'M' + R.map(Q).join(' ') + ' ' + L.map((p, i) => [(p[0] + R[i][0]) / 2, (p[1] + R[i][1]) / 2]).reverse().map(Q).join(' ') + 'Z';
    return pth('#241c38', body) + pth('#4a3c6c', inner) + ln('#9a8ad8>#c8b8ff', 'M' + L.slice(0, N - 2).map(Q).join(' '), 1.1, opa(.85)) + vz.map(p => pth('#c8b8ec>#e8deff', circ(p[0], p[1], p[2]))).join(''); };

  /* =================== V · UÇURUM: dipsiz mor su, ortada dev girdap ve ışıyan halkaları, kenarlarda kara kaya iğneleri, tek fenerli şamandıra =================== */
  function ucurum(c) {
    const { b, r, at, S, Kd } = c, cx = .1 + (r() - .5) * .4, cy = -.95 + (r() - .5) * .3, yon = r() < .5 ? 1 : -1;
    const P = (rho, th, dv = 0) => S(cx + rho * Math.cos(th), cy + dv + rho * Math.sin(th));      // kadrajda daire = suyun üstünde daire
    const halka = (R, dv = 0, n = 10) => sm(Array.from({ length: n }, (_, i) => P(R, i / n * 6.283, dv)));
    // girdabın dış eteği: geniş açık halkalar
    for (const [R0, o] of [[4.3, .3], [3.7, .4], [3.1, .45]]) b.ground(pth(Kd.orta, sm(Array.from({ length: 12 }, (_, i) => P(R0 + Math.sin(i * 1.7 + R0) * .22, i / 12 * 6.283))), opa(o)));
    // sarmal kollar: açık bant, ışıyan sırt, ardında koyu oluk
    { const kv = kova(); for (let k = 0; k < 5; k++) { const a0 = k / 5 * 6.283 + r() * .3, A = [], Bq = [], E = [], D = [];
        for (let i = 0; i <= 14; i++) { const t = i / 14, rho = .7 + 3.1 * Math.pow(1 - t, 1.2), th = a0 + yon * 5 * t, w = .66 * (1 - .5 * t);
          A.push(P(rho, th)); Bq.push(P(rho * .96, th + yon * w)); E.push(P(rho * .985, th + yon * w * .14)); D.push(P(rho * .95, th + yon * w * 1.08)); }
        kv.add(Kd.sig, sm(A.concat(Bq.slice().reverse())), '', .62).add('#0a0818', sm(D, false), 1.8, .55).add('#7a6cc0>#c9b8ff', sm(E, false), 1.2, .62); }
      b.ground(kv.svg()); }
    // ışıyan halkalar (gece parlar)
    { let d = ''; for (const [rho, a0, a1] of [[1.45, 1.2, 6.9], [2.05, 2.6, 7.4], [2.75, -.6, 3.4], [2.75, 4, 5.4], [3.5, .4, 2.6]]) { const ps = []; for (let th = a0; th <= a1 + .01; th += .45) ps.push(P(rho, th * yon)); d += sm(ps, false); }
      b.ground(ln('#7a6cc0>#c9b8ff', d, 1, opa(.5))); }
    // huni: dipsiz kara göz; uzak yanda içe kıvrılan duvar ve ışıyan dudak
    { const wall = [], lip = []; for (let i = 0; i <= 12; i++) { const th = Math.PI + i / 12 * Math.PI; wall.push(P(1.05, th)); if (i > 1 && i < 11) lip.push(P(1.05, th)); } for (let i = 12; i >= 0; i--) wall.push(P(.62, Math.PI + i / 12 * Math.PI, .3));
      b.ground(pth('#0b0a18', halka(1.12), opa(.92)) + pth('#2c2658', sm(wall), opa(.95)) + pth('#05040b', halka(.64, .3)) + pth('#000000', halka(.36, .38, 8)) + ln('#8a7ad0>#d6c8ff', sm(lip, false), 1.3, opa(.85))); }
    // ışıyan zerreler: mor ve camgöbeği
    { const a = [], e = []; for (let i = 0; i < 30; i++) { const rho = 1.2 + Math.sqrt(r()) * 3, th = r() * 6.283, p = P(rho, th); if (Math.abs(p[0]) > 62) continue; (i % 3 ? a : e).push(p); }
      b.ground(K.dots('#9a8ad8>#d8ccff', a, 1.6) + K.dots('#5fb8b0>#a8fff4', e, 1.4)); }
    // derinden yükselen dev dokunaçlar: biri büyük, biri küçük; ucu kıvrık, iç yanında vantuzlar
    { const k = r() < .5 ? 1 : -1, [x, y] = at(.95 + r() * .3, .8 + r() * .3), p = pr(x, y);
      for (const [dx, dy, h, w, kk] of [[0, 0, 42, 5.8, k], [-18 * c.ayna, 9, 26, 4, -k]]) { const bx = p[0] + dx, by = p[1] + dy;
        b.ground(ln('#b8acec', ell(bx, by + 1, w * 3, w * 1.2) + ell(bx, by + 1.5, w * 4.6, w * 1.9), .8, opa(.45)) + pth('#07060e', ell(bx + 2, by + 2, w * 2.2, w * .8), opa(.55)));
        b.item([x - .2, y - .2, 0, x + .2, y + .2, 1.4], dokunac(bx, by, h, w, kk), { cast: false }); } }
    // kenarlarda kara kaya iğneleri: girdaba bakan yüzlerinde mor kenar ışığı, diplerinde köpük
    const [gx, gy] = at(cx, cy);
    const ig = [[-2.35, -1.55, 2.1], [-1.95, -.75, 1.25], [-2.55, -.35, .95], [-2.05, -2.45, 1.0], [-1.7, 1.55, .55], [2.3, -.65, 1.85], [2.0, -1.65, 1.15], [2.5, .2, .9], [1.65, 2.2, .5]];
    for (const [u0, v0, H0] of ig) { if (r() < .12 && H0 < 1.2) continue; const u = u0 + (r() - .5) * .2, v = v0 + (r() - .5) * .3, [x, y] = at(u, v), H = H0 * (.85 + r() * .3), R = .18 + H * .1, p = pr(x, y);
      const dx = gx - x, dy = gy - y, dl = Math.hypot(dx, dy) || 1, pal = (t, n) => { const hl = Math.hypot(n[0], n[1]) || 1, f = (n[0] * dx + n[1] * dy) / hl / dl, up = n[2] / (Math.hypot(n[0], n[1], n[2]) || 1);
        if (f > .25 && up < .8) { const k = kis((f - .25) / .75); return K.mix('#2a2440', '#9a8ad8', k * .85) + '>' + K.mix('#3a3070', '#d0c2ff', k); } return K.mix('#09080f', '#2c2838', kis((t + .55) / .9)); };
      b.ground(ln('#b8acec', ell(p[0], p[1] + 1, R * 40, R * 17) + ell(p[0], p[1] + 2, R * 54, R * 23), .8, opa(.35)));
      kaya(b, x, y, [[R, 0], [R * .84, H * .3], [R * .62, H * .56], [R * .34, H * .82], [0, H]], Kd.kaya, 6, .45, r, { rot: r() * 3, pal, lean: [(r() - .5) * .14, (r() - .5) * .14] }); }
    // fenerli şamandıra: bodur demir gövde, kafes ayaklı fener ve içinde tek alev; suda sıcak yansıması
    { const [x, y] = at(-.95 + r() * .3, 1.05 + r() * .35), p = pr(x, y);
      b.ground(pth('#ffb648>#ffc860', ell(p[0], p[1] + 2, 22, 9), opa(.12)) + ln('#ffcf7a>#ffe0a0', `M${f1(p[0] - 3.4)} ${f1(p[1] + 4)}h6.8M${f1(p[0] - 2.4)} ${f1(p[1] + 7.4)}h5M${f1(p[0] - 3)} ${f1(p[1] + 10.8)}h5.4M${f1(p[0] - 1.4)} ${f1(p[1] + 14)}h3`, 1.1, opa(.6)) + ln('#b8acec', ell(p[0], p[1] + .6, 10, 3.9), .8, opa(.5)));
      const cy0 = b.cyl(x, y, .2, 0, .16, '#34303e', { top: '#3e3a4a', cast: false }); cy0.band(.05, .05, '#9a4a36', .006, false);
      b.art(x, y, .16, ln('#2a2832', 'M-4.2 0L-2.4 -7M4.2 0L2.4 -7', 1.1) + pth('#2a2832', 'M-3.2 -7h6.4v-1.2h-6.4zM-3 -16.2h6l-1 -1.6h-4zM-1.6 -17.8l1.6 -1.8l1.6 1.8z') + pth('#ffcf7a>#fff0c0', 'M-2.4 -8.2h4.8v-8h-4.8z') + pth('#ff8a2a>#ff9a3a', 'M0 -9.2q-2 -1.8 -.2 -5q.4 1.4 1.4 2q.6 1.8 -1.2 3z')
        + ln('#2a2832', 'M-2.4 -8.2v-8M2.4 -8.2v-8', .8) + `<circle class="Nl" cx="0" cy="-12.4" r="26" fill="url(#${K.glowId()})"/>` + pth('#ffd890', circ(0, -12.4, 6), 'opacity=".18"'), { r: .1, h: .7 }); }
  }

  const SAHNE = [null, kiyi, koy, acik, resif, ucurum];

  CK.def('saha-balik', { w: 7, d: 7, name: 'Av alanı' }, (b, K2, opt) => {
    const t = Math.max(1, Math.min(5, opt.t || 1)), r = b.r, ayna = r() < .5 ? -1 : 1, Kd = KADEME[t];
    const at = (u, v) => [3.5 + (v + u * ayna) / 2, 3.5 + (v - u * ayna) / 2];      // kadraj → ızgara
    const S = (u, v, z = 0) => [24 * u * ayna, 84 + 12 * v - 29.4 * z];             // kadraj → ekran
    b.pave(-3, -3, 10, 10, Kd.derin);
    SAHNE[t]({ b, r, at, S, ayna, Kd, t, ang: (du, dv) => Math.atan2((dv - du * ayna) / 2, (dv + du * ayna) / 2) });      // ang: kadrajdaki yönün ızgara açısı
  });
})(typeof window !== 'undefined' ? window.CK : globalThis.CK);
