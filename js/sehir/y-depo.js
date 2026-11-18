/* Depo — liman antreposu: yan yana üç beşik tonoz (mahyalar x boyunca), kemerli alınlıklar rıhtıma (+x, gölge) bakar.
   Her gözde solmuş boyalı çift kanat kapı (lacivert, şişe yeşili, kan kırmızısı), üstünde numara levhası, pencere ve vinç kirişi.
   Aydınlık +y ucunda kâtip odası (sundurma çatılı), yan kapı ve tartı avlusu. Parsel 6.5 × 9; arka (x=0) istinat duvarına yaslı. */
CK.def('depo', { w: 6.5, d: 9, name: 'Depo' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, f1 = K.f1, PL = K.PL, pr = K.pr, P = K.P;
  const TAS = '#e8d8b2', TASA = '#f4e9cb', TASK = '#b7a685', CATI = M.kursun, HALAT = '#b89c68';
  const X0 = .3, X1 = 4.9;
  const S = q => 'M' + q.map(p => f1(p[0]) + ' ' + f1(p[1])).join(' ');

  /* --- zemin: rıhtım döşemesi, derzler, eşik lekeleri, araba izi, gece ışıkları --- */
  b.pave(4.9, 0, 6.5, 9, '#d2c3a1'); b.pave(0, 7.4, 4.9, 9, '#d9cba8');
  let dz = '';
  for (let i = 0, y = .55; y < 9; y += .7, i++) { dz += `M${P(4.95, y)} ${P(6.5, y)}`; if (i % 2) for (let x = 5.4 + (i % 4) * .2; x < 6.4; x += .9) dz += `M${P(x, y)} ${P(x, Math.min(9, y + .7))}`; }
  for (let i = 0, x = .7; x < 4.9; x += .75, i++) dz += `M${P(x, 7.45 + (i % 2) * .5)} ${P(x, 9)}`;
  b.ground(ln(T('#d2c3a1', -.14), dz + `M${P(0, 8.3)} ${P(4.9, 8.3)}`, .7));
  [[1.4, .75], [3.85, .85], [6.3, .75]].forEach(([y, h]) => b.gpoly([[4.9, y - h], [5.75, y - h * .8], [5.9, y], [5.75, y + h * .8], [4.9, y + h]], '#b9a987', { op: .6 }));
  b.gpoly([[3.55, 8.2], [4.2, 8.12], [4.42, 8.62], [3.9, 8.86], [3.45, 8.6]], '#e6d08e', { op: .7 });                           // dökülmüş tahıl
  b.spill(5.45, 3.85, 1.9).spill(3.2, 8.2, 1.4);

  /* --- yardımcılar --- */
  // kemerli ambar kapısı: taş söve, kilit taşı, demir kuşaklı çift kanat. o.open: sağ kanat dışarı açık
  const kapi = (f, a, w, h, col, yj, o = {}) => {
    const r = w / 2, ys = h - r, mx = a + r, top = d => ys + Math.sqrt(Math.max(0, r * r - d * d)), lw = r - .04;
    f.shp('arch', a - .13, 0, w + .26, h + .13, TASA, 3, .1);
    f.poly([[mx - .08, h - .03], [mx + .08, h - .03], [mx + .11, h + .2], [mx - .11, h + .2]], TASA, 3.3, .22);
    f.shp('arch', a, 0, w, h, o.open ? M.icI : M.ic, 4);
    const leaf = (s0, s1) => { const p = [[mx + s0, 0]]; for (let i = 0; i <= 5; i++) { const d = s0 + (s1 - s0) * i / 5; p.push([mx + d, top(d) - .04]); } p.push([mx + s1, 0]); return p; };
    for (const sg of o.open ? [-1] : [-1, 1]) {
      f.poly(leaf(sg * lw, sg * .012), col, 5, .1);
      for (let d = .15; d < lw - .03; d += .15) f.line([[mx + sg * d, .02], [mx + sg * d, top(d) - .07]], col, .7, 6, -.12);
      const d0 = .15 * (1 + Math.floor(f.r() * 2)); f.rect(mx + sg * d0 - (sg < 0 ? .15 : 0), .1, .15, ys - .2 + f.r() * .2, col, 5.1, .24);      // solmuş tahta
      for (const bb of [.24, ys * .98]) f.line([[mx + sg * lw, bb], [mx + sg * (lw - r * .62), bb]], M.demir, 1.5, 6.2, .16);
      f.dot(mx + sg * .09, h * .44, 1.3, M.bronz, 6.5, .34);
    }
    if (!o.open) return;
    // içerisi: yerde ışık, fıçı ve sandık karaltıları
    f.poly([[mx, 0], [a + w, 0], [a + w, 0, -.34], [mx, 0, -.34]], '#8a7458>#c98a3a', 4.5, 0);
    f.put(4.6, K.kf('#55402e>#7a4a22'), f.shapeD('arch', mx + .1, 0, .3, .46, -.3) + f.shapeD('rect', mx + .38, 0, .28, .3, -.3)).put(4.7, K.kf('#6c5038>#96602c'), f.shapeD('round', mx + .12, .35, .26, .1, -.3));
    // dışarı açılmış kanat (iç yüzü görünür, güneş alır)
    const sh = [[0, 0], [lw, 0]]; for (let i = 0; i <= 5; i++) { const e = lw * (1 - i / 5); sh.push([e, top(lw - e) - .04]); }
    const L = new K.Face([X1, yj, 0], [1, 0, 0], [0, 0, 1], lw, h, [0, 1, 0], sh); L.fill(col, .04); L.planks({ dir: 'v', step: .15, dt: -.12 });
    L.line([[.03, .22], [lw - .03, .22]], col, 2, 6, -.2).line([[.03, ys * .98], [lw - .03, ys * .98]], col, 2, 6, -.2).line([[.05, .24], [lw - .05, ys * .96]], col, 1.8, 6, -.2);
    b.item([X1, yj - .03, 0, X1 + lw, yj + .03, h], () => L.svg(), {});
  };
  // numara levhası: lacivert sac üstünde açık renk çubuklar (I, II, III)
  const levha = (f, am, bb, n) => { f.rect(am - .31, bb, .62, .26, TASA, 7, .32).rect(am - .28, bb + .03, .56, .2, '#3a5a80', 7.1, .3);
    for (let i = 0; i < n; i++) f.rect(am - (n - 1) * .06 + i * .12 - .024, bb + .065, .048, .13, TASA, 7.2, .44); };
  // vinç kirişi: kilit taşından çıkan kalas + makara; makaranın alt ucunu döner
  const vinc = (y, z, len) => {
    b.box(X1, y - .045, z - .05, X1 + len, y + .045, z + .05, M.ahsap, { edge: false });
    b.art(X1 + len - .12, y, z - .05, ln(M.demir, 'M0 0v2.5', 1.2) + pth(T(M.demir, -.2), K.circ(0, 5, 2.8)) + pth(M.bronz, K.circ(0, 5, 1.1)), { bb: [X1 + len - .2, y - .045, z - .34, X1 + len - .04, y + .045, z - .05] });
    return [X1 + len - .12, y, z - .05 - 7.6 / K.ZU];
  };
  // payanda: eğimli şapkalı taş ayak (+x cephesinde); döner: kutu
  const payanda = (yc, out = .38, z1 = 1.12) => {
    const hw = .2, zt = z1 + .4, p = b.box(X1, yc - hw, 0, X1 + out, yc + hw, z1, TAS, { edge: false });
    p.L.courses({ rh: .26, bw: .5, dens: .4 }).band(0, .26, TASK, .04);
    b.item([X1, yc - hw, z1, X1 + out, yc + hw, zt], pth(T(TASA, K.toneOf(K.unit([.4, 0, out]))), 'M' + PL([[X1, yc - hw, zt], [X1, yc + hw, zt], [X1 + out, yc + hw, z1], [X1 + out, yc - hw, z1]]) + 'Z')
      + pth(TAS, 'M' + PL([[X1, yc + hw, z1], [X1 + out, yc + hw, z1], [X1, yc + hw, zt]]) + 'Z'), { cast: false });
    return p;
  };
  // bir tonoz gözü: duvar + kurşun tonoz (yamalı) + taş alınlık kemeri + kapı + levha
  const goz = (y0, y1, zw, rise, no, col, o = {}) => {
    const w = y1 - y0, m = w / 2, ym = (y0 + y1) / 2, dw = o.dw || 1.3, dh = o.dh || 1.25, N = 8;
    const g = b.box(X0, y0, 0, X1, y1, zw, TAS, { T: null }), R = g.R;
    R.courses({ rh: .26, bw: .6, dens: .35 }).stones(3, { rh: .26, b0: .26 }).band(0, .26, TASK, .04).band(zw - .1, .1, TASA, .14);
    const G = b.vault(X0, y0, X1, y1, zw, rise, CATI, { axis: 'x', step: .77, n: N, wall: TAS }).G, out = [], inn = [];
    // tonoz üstü: kurşun levha yamaları, mahya, alınlığın taş kemer sırtı
    const sp = (x, k) => [x, ym + Math.cos(Math.PI * k / N) * m, zw + Math.sin(Math.PI * k / N) * rise], tn = k => K.toneOf(K.unit([0, Math.cos(Math.PI * k / N) * rise, Math.sin(Math.PI * k / N) * m]));
    let ya = ln(T(CATI, .34), `M${P(X0, ym, zw + rise)} ${P(X1 - .2, ym, zw + rise)}`, 1.6) + ln(T(CATI, -.2), [1, 3, 5].map(k => 'M' + PL([sp(X0, k), sp(X1 - .22, k)])).join(''), .8, 'opacity=".55"');
    (o.yama || []).forEach(([x, k, l, dt]) => { ya += pth(T(CATI, tn(k + .5) + dt), 'M' + PL([sp(x, k), sp(x + l, k), sp(x + l, k + 1), sp(x, k + 1)]) + 'Z'); });
    for (const [k0, k1] of [[0, 3], [3, 6]]) { const a = [], c = []; for (let k = k0; k <= k1; k++) { a.push(sp(X1 - .22, k)); c.unshift(sp(X1, k)); } ya += pth(T(TASA, tn((k0 + k1) / 2)), 'M' + PL(a.concat(c)) + 'Z'); }
    b.item([X0, y0, zw + rise, X1, y1, zw + rise + .01], ya, { cast: false });
    for (let k = 0; k <= N; k++) { const t = Math.PI * k / N; out.push([m - Math.cos(t) * m, Math.sin(t) * rise]); inn.push([m - Math.cos(t) * (m - .17), Math.sin(t) * (rise - .17)]); }
    G.poly(out.concat(inn.slice().reverse()), TASA, 2.6, .12);
    for (let k = 1; k < N; k++) G.line([out[k], inn[k]], TAS, .7, 2.8, -.14);
    kapi(R, m - dw / 2, dw, dh, col, y1 - (m + dw / 2), o);
    levha(R, m, (dh + .2 + zw - .1) / 2 - .13, no);
    return { g, G, m, ym, zt: zw + rise };
  };

  /* --- üç göz: ortadaki daha geniş ve yüksek --- */
  const A = goz(.3, 2.5, 1.6, 1.0, 1, '#5f86c0', { yama: [[1.07, 1, .77, -.07], [2.61, 2, .77, .08], [3.38, 0, .77, -.06]] });
  const Bz = goz(2.5, 5.2, 1.76, 1.22, 2, '#5fa07a', { dw: 1.5, dh: 1.38, open: true, yama: [[1.84, 2, .77, .08], [3.38, 1, .77, -.07], [1.07, 3, .77, -.06]] });
  const C = goz(5.2, 7.4, 1.6, 1.0, 3, '#c0604e', { yama: [[2.61, 1, .77, .08], [1.84, 2, .77, -.07], [3.38, 3, .77, -.05], [1.07, 0, .77, .06]] });
  // alınlık pencereleri: yanlarda yuvarlak göz, ortada yarım ay
  for (const [g, lit] of [[A, false], [C, true]]) { g.G.win(g.m - .25, .1, .5, .5, { kind: 'round', sove: TASA, frame: M.demir, bars: [1, 1], sill: false, lit });
    for (const d of [-.065, .065]) g.G.line([[g.m + d, .17], [g.m + d, .53]], M.demir, .9, 6).line([[g.m - .18, .35 + d], [g.m + .18, .35 + d]], M.demir, .9, 6); }
  Bz.G.win(Bz.m - .5, .16, 1.0, .5, { kind: 'arch', sove: TASA, frame: M.demir, bars: [5, 1], lit: true });

  /* --- payandalar ve fenerler --- */
  payanda(.5, .34);
  const p1 = payanda(2.5), p2 = payanda(5.2);
  p1.R.lantern(.2, .96, { out: .16 }); p2.R.lantern(.2, .96, { out: .16 });
  for (const y of [2.5, 5.2]) b.line3([[X1 + .04, y, 1.64], [X1 + .36, y, 1.56]], M.bakir, 2.6);                 // bakır çörtenler

  /* --- çatı: havalandırma bacaları, ortada camlı fener ve balıklı rüzgâr gülü --- */
  const baca = (x, ym, z, s = .17, h = .2, rise = .16, cam) => { const e = s + .07, zt = z + h, q = pts => 'M' + PL(pts) + 'Z', yl = ym + s, xr = x + s;
    b.item([x - e, ym - e, z, x + e, ym + e, zt + rise], pth(TAS, q([[x - s, yl, z], [xr, yl, z], [xr, yl, zt], [x - s, yl, zt]])) + pth(T(TAS, -.44), q([[xr, yl, z], [xr, ym - s, z], [xr, ym - s, zt], [xr, yl, zt]]))
      + pth(cam || M.ic, q([[x - s + .06, yl, z + .05], [xr - .06, yl, z + .05], [xr - .06, yl, zt - .05], [x - s + .06, yl, zt - .05]]) + q([[xr, yl - .06, z + .05], [xr, ym - s + .06, z + .05], [xr, ym - s + .06, zt - .05], [xr, yl - .06, zt - .05]]))
      + pth(T(M.kiremitK, K.toneOf(K.unit([0, rise, e]))), q([[x - e, ym + e, zt], [x + e, ym + e, zt], [x, ym, zt + rise]])) + pth(T(M.kiremitK, K.toneOf(K.unit([rise, 0, e]))), q([[x + e, ym + e, zt], [x + e, ym - e, zt], [x, ym, zt + rise]])), { cast: false }); };
  baca(1.5, A.ym, A.zt); baca(3.5, C.ym, C.zt); baca(1.2, C.ym, C.zt);
  baca(2.46, Bz.ym, Bz.zt, .26, .34, .26, M.camI);
  b.art(2.46, Bz.ym, Bz.zt + .6, ln(M.demir, 'M0 0V-11M-5 -5.5h3', 1) + pth(M.bronz, 'M-1 -11.2Q3 -14 6.4 -11.2L8.6 -13V-8.6L6.4 -10.4Q3 -8 -1 -11.2Z' + K.circ(0, -2, 1.2)), { bb: [2.4, Bz.ym - .06, Bz.zt + .6, 2.52, Bz.ym + .06, Bz.zt + 1] });
  b.fx('birds', 2.5, C.ym, C.zt + .02, { n: 3 });

  /* --- vinç kirişleri: I. gözde sandık kaldırılıyor, ortadaki boşta, III. iskeleye bağlı --- */
  const v1 = vinc(A.ym, 2.5, 1.0), v2 = vinc(Bz.ym, 2.88, .9), v3 = vinc(C.ym, 2.5, .7);
  b.line3([v1, [v1[0], v1[1], 1.5]], HALAT, 1);
  b.crate(v1[0], v1[1], .96, .38);
  b.item([v1[0] - .19, v1[1] - .19, 1.26, v1[0] + .19, v1[1] + .19, 1.5], ln(HALAT, `M${P(v1[0] - .19, v1[1] + .19, 1.26)} ${P(v1[0], v1[1], 1.5)} ${P(v1[0] + .19, v1[1] + .19, 1.26)}M${P(v1[0], v1[1], 1.5)} ${P(v1[0] + .19, v1[1] - .19, 1.26)}`, .9), { cast: false });
  b.line3([v2, [v2[0], v2[1], 1.86]], HALAT, 1);
  b.art(v2[0], v2[1], 1.86, ln(M.demir, 'M0 0v2q0 2.6 -2 2.2', 1.3), { bb: [v2[0] - .05, v2[1] - .05, 1.64, v2[0] + .05, v2[1] + .05, 1.86] });
  b.line3([v3, [X1 + .05, C.ym - .78, 1.2]], HALAT, 1);

  /* --- +y uç duvarı (aydınlık): yan kapı, parmaklıklı pencereler, sarmaşık --- */
  const L = C.g.L;
  L.courses({ rh: .26, bw: .6, dens: .35, a0: 2 }).stones(6, { rh: .26, a0: 2 }).band(0, .26, TASK, .04).band(1.5, .1, TASA, .1);
  L.door(2.5, .64, .94, { kind: 'arch', col: '#3f8f8f', b: .3, sove: TASA });
  L.lantern(2.82, 1.4, { out: .2 });
  L.win(3.3, .9, .28, .36, { frame: M.demir, bars: [3, 1], lit: false });
  L.win(4.08, .9, .28, .36, { frame: M.demir, bars: [3, 1], lit: true });
  L.line([[2.34, 0], [2.26, .7], [2.2, 1.3]], M.govde, 1.4, 7.5);
  [[2.3, .42, 3.4], [2.2, .62, 4], [2.3, .82, 3.6], [2.16, 1.0, 4.4], [2.28, 1.2, 4], [2.12, 1.36, 4.6], [2.3, 1.48, 3.8], [1.98, 1.5, 3.6], [2.44, 1.56, 3]].forEach(([a, bb, r], i) => {
    L.dot(a, bb, r, M.sarmasik, 8, -.2); if (i % 2 < 1) L.dot(a - .03, bb + .04, r * .62, M.sarmasik, 8.1, .04); if (i % 3 < 1) L.dot(a - .05, bb + .06, r * .3, M.sarmasik, 8.2, .3); });
  b.stairs(2.72, 7.4, 3.52, 7.9, .3, 0, 'y', TAS, { rise: .15 });

  /* --- kâtip odası: sıvalı, sundurma çatılı, mavi kepenkli --- */
  const of = b.box(.3, 7.4, 0, 2.3, 8.5, 1.12, M.krem, { T: null });
  of.L.band(0, .24, TASK, .06).shadeTop(.16);
  of.L.door(.16, .5, .88, { kind: 'seg', col: M.mavi, sove: TASA });
  of.L.win(1.12, .42, .46, .5, { shut: M.mavi, box: true, sove: TASA, lit: true });
  of.R.band(0, .24, TASK, .06).win(.36, .5, .36, .42, { lit: true, bars: [2, 2] });
  b.poly3([[2.3, 8.5, 1.12], [2.3, 7.4, 1.12], [2.3, 7.4, 1.6]], M.krem, { n: [1, 0, 0], bb: [2.28, 7.4, 1.12, 2.3, 8.5, 1.6] });
  b.shed(.2, 7.4, 2.46, 8.7, 1.05, 1.62, '+y', M.kiremit);
  b.chimney(.8, 7.72, 1.46, .72, { mat: TAS, w: .3, s: .6 });

  /* --- eşya yardımcıları --- */
  // yan yatmış fıçı: ekseni y boyunca, ağzı +y'ye (aydınlığa) bakar
  const yatik = (x, y0, y1, z, col = M.ahsap) => {
    const r = .19, C2 = (t, y, k = 1) => pr(x + Math.cos(t) * r * k, y, z + r + Math.sin(t) * r * k), c0 = pr(x, y0, z + r), c1 = pr(x, y1, z + r), ci = K.circ(0, 0, 1.9);
    const el = (c, k) => `transform="matrix(${K.f2(2.4 * k)} ${K.f2(1.2 * k)} 0 ${K.f2(-2.94 * k)} ${f1(c[0])} ${f1(c[1])})"`;
    let hp = ''; for (const f of [.2, .8]) hp += S([-.88, -.5, -.1, .3, .7, 1.1, 1.5, 1.9, 2.25].map(t => C2(t, y0 + (y1 - y0) * f, 1.03)));
    b.item([x - r, y0, z, x + r, y1, z + 2 * r], pth(T(col, -.36), ci, el(c0, 1)) + pth(T(col, -.36), S([C2(-.886, y0), C2(-.886, y1), C2(2.256, y1), C2(2.256, y0)]) + 'Z')
      + pth(T(col, .04), S([C2(.9, y0), C2(1.6, y0), C2(2.256, y0), C2(2.256, y1), C2(1.6, y1), C2(.9, y1)]) + 'Z') + ln(T(M.demir, -.1), hp, 1.2) + pth(T(M.ahsapA, .06), ci, el(c1, 1)) + ln(T(col, -.24), ci, .3, el(c1, .62)), { cast: z < .01 });
  };
  const amfora = (x, y, rot, c = '#c9794c') => b.art(x, y, 0, `<g transform="rotate(${rot})">` + pth(T(c, -.3), 'M0 0Q-2 -1 -3.5 -6.5Q-4.5 -11 -1.5 -13L-1.9 -16.4h3.8L1.5 -13Q4.5 -11 3.5 -6.5Q2 -1 0 0Z')
    + pth(T(c, .12), 'M0 0Q-2 -1 -3.5 -6.5Q-4.5 -11 -1.5 -13L-1.9 -16.4h1.7L.1 -13Q-1.8 -9 -.6 -4Z') + ln(T(c, -.16), 'M-1.5 -15.6Q-5.2 -14.8 -3.8 -10.6M1.5 -15.6Q5.2 -14.8 3.8 -10.6', 1) + '</g>', { bb: [x - .1, y - .1, 0, x + .1, y + .1, .56] });
  // iple bağlı balya
  const balya = (x0, y0, z, w, d, h, col = '#dcc693') => { const q = b.box(x0, y0, z, x0 + w, y0 + d, z + h, col, { edge: false, cast: z < .01 }), ip = '#8a6a44';
    for (const t of [.28, .72]) { q.L.line([[w * t, 0], [w * t, h]], ip, 1, 6); q.R.line([[d * t, 0], [d * t, h]], ip, 1, 6); q.T.line([[w * t, 0], [w * t, d]], ip, 1, 6).line([[0, d * t], [w, d * t]], ip, 1, 6); } };

  /* --- I. göz önü: balyalar, kaldırılan sandığı karşılayan hamal, baba ve halat --- */
  balya(5.45, .32, 0, .62, .44, .34); balya(5.5, .8, 0, .6, .44, .34, '#cdb47c'); balya(5.5, .5, .34, .58, .44, .32, '#e2cfa0');
  b.fig(6.12, 1.88, 0, { body: '#c9b48a', legs: '#5a4a3c', hat: 'sarik', hatCol: M.bezK });
  b.art(6.12, 1.88, 0, ln(M.tenK, 'M-4.2 -14.6L-5.4 -21.4M4.2 -14.6L5 -21.6', 1.6), { bb: [6.0, 1.76, .4, 6.24, 2.0, .9] });
  b.bollard(6.36, .9).bollard(6.36, 4.72);
  b.art(6.3, 1.25, 0, ln(T(HALAT, -.12), K.ell(0, -1, 6.4, 3.2) + K.ell(0, -2.4, 5, 2.5), 1.5) + ln(HALAT, K.ell(0, -3.6, 3.6, 1.8), 1.5) + ln(T(HALAT, -.12), 'M5 -2Q9 -4 7.4 -9', 1.3), { r: .28, h: .2 });
  b.critter('marti', 6.36, .9, .3);

  /* --- I–II arası: sandık yığını ve kedi --- */
  b.crate(5.74, 2.6, 0, .52).crate(6.16, 2.92, 0, .38);
  b.critter('kedi', 5.76, 2.62, .42, { col: '#f0efe8' });

  /* --- II. göz: içeri çuval taşıyan hamal --- */
  b.fig(5.52, 4.02, 0, { body: '#6f8fa8', legs: '#4a3a34', hat: 'none', step: 1 });
  b.art(5.52, 4.02, 0, pth(T('#d9c79a', -.22), 'M-11 -19Q-12.4 -24.6 -6.6 -25.6Q-.6 -26 -.2 -21.6Q-.4 -17.6 -5.6 -17.2Q-9.6 -17 -11 -19Z') + pth('#eadbb0', 'M-11 -19Q-12.4 -24.6 -6.6 -25.6Q-3 -25.6 -2.6 -23.4Q-6 -20 -9.4 -19Z') + ln(M.tenK, 'M-4.4 -14.6L-6.4 -18', 1.6), { bb: [5.4, 3.9, .5, 5.64, 4.14, .95] });

  /* --- II–III arası: yan yatmış fıçılar, küpler --- */
  yatik(5.62, 4.86, 5.42, 0); yatik(6.02, 4.92, 5.48, 0, '#8a5c38'); yatik(5.82, 4.9, 5.46, .33, '#a87446');
  amfora(5.12, 5.5, -9); amfora(5.3, 5.66, 7, '#b96a44');

  /* --- III. göz önü: el arabası, çuvallar --- */
  b.cart(6.0, 6.5, 0, 'y', { load: '#d9c79a' });
  b.sack(5.14, 7.0).sack(5.16, 7.36, 0, { col: '#cdb98a' });

  /* --- köşe: branda altında yüksek yığın --- */
  const tb = b.box(4.8, 8.06, 0, 5.6, 8.8, .44, M.ahsapA, { edge: false });
  tb.L.planks({ dir: 'h', step: .15 }).line([[.4, 0], [.4, .44]], M.ahsapK, 1.2, 6); tb.R.line([[.38, 0], [.38, .44]], M.ahsapK, 1.2, 6);
  const BR = '#8fa08a', q3 = pts => 'M' + PL(pts) + 'Z';
  b.item([4.72, 7.98, .44, 5.68, 8.88, 1.0], pth(T(BR, K.toneOf([0, 0, 1])), q3([[4.98, 8.18, .98], [5.46, 8.18, .93], [5.46, 8.62, .9], [4.98, 8.62, .96]]))
    + pth(T(BR, K.toneOf(K.unit([0, 1, .4]))), q3([[4.98, 8.62, .96], [5.46, 8.62, .9], [5.66, 8.86, .24], [5.44, 8.86, .38], [5.2, 8.86, .2], [4.96, 8.86, .34], [4.74, 8.86, .22]]))
    + pth(T(BR, K.toneOf(K.unit([1, 0, .4]))), q3([[5.46, 8.62, .9], [5.46, 8.18, .93], [5.66, 8.0, .28], [5.66, 8.22, .16], [5.66, 8.44, .36], [5.66, 8.66, .18], [5.66, 8.86, .24]]))
    + ln(T(BR, -.3), `M${P(5.14, 8.62, .94)} ${P(5.08, 8.86, .28)}M${P(5.32, 8.62, .92)} ${P(5.38, 8.86, .36)}M${P(5.46, 8.46, .91)} ${P(5.66, 8.36, .3)}M${P(5.46, 8.3, .92)} ${P(5.66, 8.14, .22)}`, .8)
    + ln(HALAT, `M${P(4.84, 8.86, 0)} ${P(5.06, 8.62, .95)} ${P(5.06, 8.18, .97)}M${P(5.66, 8.54, 0)} ${P(5.46, 8.5, .91)} ${P(4.98, 8.5, .96)}`, 1), { pts: [[4.98, 8.18, .98], [5.46, 8.18, .93], [5.46, 8.62, .9], [4.98, 8.62, .96]] });

  /* --- tartı avlusu: kantar, kâtip, merdiven, küpler, açık sandıklar --- */
  b.art(3.9, 8.5, 0, pth(T(TASK, -.1), 'M-7 0l7 -3.5l7 3.5l-7 3.5z') + ln(M.ahsapK, 'M0 0V-28', 2.4) + ln(M.ahsapK, 'M-5 1L0 -8L5 1', 1.4) + ln(M.ahsap, 'M-12 -32.6L12 -21', 2) + pth(M.bronz, K.circ(0, -27, 1.8))
    + ln('#6a5a48', 'M-12 -32.6L-16.4 -21.4M-12 -32.6L-7.6 -21.4M12 -21L7.6 -8.6M12 -21L16.4 -8.6', .7) + pth(T(M.bronz, -.2), K.ell(-12, -21, 5.4, 2.4) + K.ell(12, -8.2, 5.4, 2.4)) + pth(T(M.bronz, .2), K.ell(-12, -21.6, 4.4, 1.8) + K.ell(12, -8.8, 4.4, 1.8))
    + pth('#d9c79a', 'M8.6 -9.4Q8 -14.6 12 -15Q16 -14.6 15.4 -9.4Z') + pth(T(M.demir, -.1), 'M-14.4 -22h2.2v-2.6h-2.2zM-11.4 -22.2h1.8v-1.8h-1.8z'), { bb: [3.4, 8.38, 0, 4.4, 8.62, 1.2] });
  b.fig(3.2, 8.84, 0, { body: '#34506e', robe: true, hat: 'fes', hatCol: '#a8473a', legs: '#3a2c24' });
  b.art(3.2, 8.84, 0, pth('#efe2bd', 'M2.6 -14.6l5.2 -1.2l1 6l-5.2 1.2z') + ln('#7a6a55', 'M4 -13.2l3 -.7M4.3 -11.6l3 -.7M4.6 -10l3 -.7', .5), { bb: [3.08, 8.72, .3, 3.32, 8.96, .7] });
  b.sack(4.56, 7.76);
  // merdiven: uç duvara yaslı
  { const xa = 3.94, dx = .26, ya = 7.92, yb = 7.44, zt = 1.5; let d = `M${P(xa, ya, 0)} ${P(xa, yb, zt)}M${P(xa + dx, ya, 0)} ${P(xa + dx, yb, zt)}`, rg = '';
    for (let i = 1; i < 8; i++) { const t = i / 8; rg += `M${P(xa, ya + (yb - ya) * t, zt * t)} ${P(xa + dx, ya + (yb - ya) * t, zt * t)}`; }
    b.item([xa, yb - .02, 0, xa + dx, ya, zt], ln(T(M.ahsap, -.1), rg, 1) + ln(M.ahsapA, d, 1.5), { cast: false }); }
  amfora(2.6, 7.56, -8);
  b.crate(2.42, 8.7, 0, .44, { fill: '#e8843a' });
  b.pot(1.06, 8.72, 0, { col: '#3f8f8f' });

  b.tag(6.2, 8.9, 0).doorAt(5.6, 3.85);
});
