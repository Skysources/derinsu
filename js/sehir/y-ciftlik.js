/* Çiftlik — solda yüksek ahşap samanlık (kapısı açık, içi saman dolu), sağda alçak taş çiftlik evi (asmalı çardak),
   aralarında selvi. Önde: merdivenli ot yığını, çıkrıklı kuyu, taş fırın, koyun ağılı, renk renk sebze sıraları,
   ayçiçekleri, arı kovanları, korkuluk. Parsel 7 × 6; ana cepheler +y (aydınlık). opt.seed boya rengini değiştirir. */
CK.def('ciftlik', { w: 7, d: 6, name: 'Çiftlik' }, (b, K, opt) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, pr = K.pr, P = K.P, PL = K.PL, f1 = K.f1;
  const sd = (opt && opt.seed) || 7, rs = K.rng(sd * 97 + 3);
  const acc = [M.yesil, M.mavi, M.turkuaz][sd % 3], saman = '#d8b55c', toprak = '#8f6d4c';
  // nokta dizisi: sıfır boylu çizgi + yuvarlak uç = ucuz daire (yaprak, çiçek, tavuk)
  const dots = (col, pts, w, ex) => ln(col, pts.map(p => `M${f1(p[0])} ${f1(p[1])}h.01`).join(''), w, ex);
  const golge = (rx, ry) => `<ellipse cx="1" cy="0" rx="${rx}" ry="${ry}" fill="#1b2440" opacity=".2"/>`;

  /* --- zemin: çayır, avlu toprağı, ağıl, saman döküntüsü, ışıklar --- */
  b.gpoly([[-.3, .6], [1.5, -.3], [5.6, -.3], [7.3, .8], [7.3, 5.2], [6.2, 6.3], [1.2, 6.3], [-.3, 5.3]], M.cimA, { op: .5 });
  b.gpoly([[.9, 2.5], [2.9, 2.4], [3.5, 2.95], [6.6, 3.0], [7.05, 3.6], [6.9, 4.2], [3.8, 4.25], [3.75, 6.15], [2.75, 6.15], [2.75, 4.3], [.3, 4.3], [.15, 3.2]], M.toprak, { op: .8 });
  b.gpoly([[.3, 4.4], [2.6, 4.4], [2.6, 5.75], [.3, 5.75]], T(M.toprak, -.14), { op: .9 });
  b.gpoly([[1.0, 2.55], [2.2, 2.5], [2.55, 3.0], [1.8, 3.35], [1.2, 3.1]], saman, { op: .6 });
  b.spill(1.55, 3.0, 1.6).spill(5.25, 3.3, 1.5).spill(3.85, 3.3, 1.0);

  /* --- sebze bostanı: toprak, karıklar, sıra sıra bitkiler (zemin katmanında, kesik çizgiyle) --- */
  const vx0 = 3.95, vx1 = 6.75, vy0 = 4.5, vr = .225, yr = i => vy0 + i * vr;
  b.gpoly([[vx0 - .1, vy0 - .14], [vx1 + .1, vy0 - .14], [vx1 + .1, yr(5) + .14], [vx0 - .1, yr(5) + .14]], toprak);
  let fur = ''; for (let i = 0; i < 5; i++) fur += `M${P(vx0 - .06, yr(i) + vr / 2)} ${P(vx1 + .06, yr(i) + vr / 2)}`;
  const sira = (i, col, w, gap, o = {}) => { const x0 = o.x0 || vx0, x1 = o.x1 || vx1, y = yr(i) + (o.dy || 0), z = o.z || .03;
    return ln(col, `M${P(x0, y, z)} ${P(x1, y, z)}`, w, `stroke-dasharray="0 ${gap}"`); };
  let st = ''; for (let x = vx0 + .05; x < vx1; x += .242) st += `M${P(x, yr(0))} ${P(x, yr(0), .34)}`;
  b.ground(ln(T(toprak, -.26), fur, 1.3)
    + ln(M.ahsapA, st, .8) + sira(0, '#4f8a4a', 4.4, 6.5) + sira(0, '#d8453a', 1.9, 6.5, { z: .14, dy: .03 }) + sira(0, '#e86a4a', 1.5, 13, { z: .22, x0: vx0 + .12 })      // domates
    + sira(1, '#7fb84f', 4.2, 5.4, { x1: 6.1 }) + sira(1, '#b9dc7a', 2, 5.4, { x1: 6.1, z: .08, dy: -.03 })                                                             // marul
    + sira(2, '#5f9a86', 5.2, 6.8) + sira(2, '#a4cdbd', 2.3, 6.8, { z: .09, dy: -.03 })                                                                               // lahana
    + sira(3, '#5f9a4a', 2.6, 3.5) + sira(3, '#f08a2e', 1.4, 3.5, { z: 0, dy: .05 })                                                                                  // havuç
    + sira(4, '#a9c47c', 1.8, 2.7, { x0: 4.4 })                                                                                                                       // soğan
    + ln('#4f8a4a', `M${P(4.2, yr(5))} ${P(6.6, yr(5))}`, 1) + sira(5, '#e8842e', 5.6, 10.5, { x0: 4.3, x1: 6.6 }) + sira(5, '#f6b866', 2.2, 10.5, { x0: 4.3, x1: 6.6, z: .09, dy: -.03 }));   // kabak

  /* ================= SAMANLIK ================= */
  const br = b.box(.3, .3, 0, 2.8, 2.5, 1.3, M.ahsap);
  br.L.planks({ step: .21 }).shadeTop(.18).band(0, .2, M.tasK, 0, 2.8); br.R.planks({ step: .21 }).shadeTop(.16).band(0, .2, M.tasK, 0, 2.8);
  br.L.rect(.62, 0, 1.26, 1.2, M.ahsapK, 3).door(.7, 1.1, 1.12, { open: true, glow: true, sove: null, floor: '#c9a85a' });
  br.L.poly([[.72, 0], [1.78, 0], [1.78, .36], [1.6, .62], [1.3, .74], [1.0, .6], [.84, .34], [.72, .28]], saman, 5, -.16).poly([[.86, .34], [1.0, .6], [1.3, .74], [1.6, .62], [1.3, .5], [1.05, .4]], saman, 5.1, .06)
    .line([[.9, .12], [1.2, .26]], saman, 1, 5.2, .2).line([[1.3, .1], [1.62, .3]], saman, 1, 5.2, .2).line([[1.1, .3], [1.5, .46]], saman, 1, 5.2, -.3);
  for (const [a0, a1] of [[.1, .66], [1.84, 2.4]]) br.L.rect(a0, .02, a1 - a0, 1.1, M.ahsapA, 5).line([[a0 + .03, .12], [a1 - .03, .12]], M.ahsapK, 1.4, 6).line([[a0 + .03, 1.0], [a1 - .03, 1.0]], M.ahsapK, 1.4, 6)
    .line([[a0 + .03, a0 < 1 ? .12 : 1.0], [a1 - .03, a0 < 1 ? 1.0 : .12]], M.ahsapK, 1.2, 6).line([[(a0 + a1) / 2, .04], [(a0 + a1) / 2, 1.1]], M.ahsapA, .7, 5.5, -.2);
  br.L.lantern(1.25, 1.22);
  br.R.win(.86, .5, .36, .36, { frame: M.ahsapK, bars: [2, 2], lit: false });
  br.R.shp('round', .14, .02, .6, .6, M.ahsapK, 6).shp('round', .2, .08, .48, .48, M.ahsap, 6.1, -.06).line([[.44, .05], [.44, .59]], M.ahsapK, 1, 6.2).line([[.17, .32], [.71, .32]], M.ahsapK, 1, 6.2).line([[.25, .13], [.63, .51]], M.ahsapK, .9, 6.2).line([[.25, .51], [.63, .13]], M.ahsapK, .9, 6.2);
  const rr = b.gable(.3, .3, 2.8, 2.5, 1.3, 1.05, M.padavra, { axis: 'y', ov: .2, wall: M.ahsap, tex: 'rows' });
  rr.G.planks({ step: .21 }).rect(.98, .08, .54, .5, M.ahsapK, 3).rect(1.03, .08, .44, .45, M.ic, 4).poly([[1.03, .08], [1.47, .08], [1.47, .2], [1.32, .3], [1.12, .26], [1.03, .16]], saman, 5);
  rr.A.rect(.5, .34, .36, .56, M.ahsapA, 3, -.1).rect(1.5, .9, .3, .44, M.padavra, 3, -.16);                 // yamalar
  b.line3([[1.55, 2.5, 2.08], [1.55, 2.98, 2.08]], M.ahsapK, 2.2, { pad: .05 });
  b.art(1.55, 2.94, 2.08, ln('#7a6a52', 'M0 1V12', .8) + ln(M.demir, 'M0 12q-2.4 1 -1.4 3', 1), { bb: [1.5, 2.9, 1.5, 1.6, 2.98, 2.06] });
  b.critter('guvercin', 1.55, 1.5, 2.36).critter('guvercin', 1.55, 1.15, 2.36, { flip: true });
  b.tree('selvi', 3.14, .62, { s: .92 });
  // dirgen (duvara yaslı) ve saman balyaları
  b.art(2.62, 2.56, 0, ln(M.ahsapA, 'M2 0L-1 -25', 1.2) + ln(M.demir, 'M-3 -25.4h4M-3 -25.4l-.5 -4M-1 -25.6l-.5 -4.4M1 -25.4l-.5 -4', .9), { r: .1, h: 1 });
  b.hay(2.05, 2.72, 0).hay(2.35, 3.1, 0);

  /* --- ot yığını: direkli tınaz, merdiven --- */
  b.cyl(.82, 3.5, .6, 0, .5, saman, { top: null });
  b.dome(.82, 3.5, .6, .5, saman, { hf: 1.2, alem: false, seams: false });
  b.art(.82, 3.5, .5, ln(T(saman, -.3), 'M-14 2l-2 9M-6 6l-1 10M4 7l1 9M13 3l2 8M-10 -8l-3 6M2 -4l1 7M9 -10l3 6M-3 -16l-1 5', .9, 'opacity=".7"') + ln(T(saman, .4), 'M-17 -2l-1 6M-9 -14l-2 5M-1 -22l-1 4', .9) + ln(M.ahsapK, 'M0 -24V-33', 1.6),
    { bb: [.22, 2.9, .5, 1.42, 4.1, 1.5] });
  let mer = `M${P(1.6, 3.98, 0)} ${P(1.12, 3.6, 1.08)}M${P(1.38, 4.24, 0)} ${P(.9, 3.86, 1.08)}`;
  for (let k = 1; k < 6; k++) { const t = k / 6; mer += `M${P(1.6 - .48 * t, 3.98 - .38 * t, 1.08 * t)} ${P(1.38 - .48 * t, 4.24 - .38 * t, 1.08 * t)}`; }
  b.item([.9, 3.6, 0, 1.6, 4.24, 1.08], ln(M.ahsapK, mer, 1.3), { cast: false });

  /* ================= ÇİFTLİK EVİ ================= */
  const h = b.box(3.5, .5, 0, 6.7, 2.2, 1.05, M.tas);
  h.L.courses({ rh: .26, bw: .55, dens: .5 }).stones(5, { rh: .26 }).shadeTop(.34, -.12).band(0, .2, M.tasK, -.04);
  h.R.courses({ rh: .26, bw: .55, dens: .45 }).stones(3, { rh: .26 }).band(0, .2, M.tasK, -.04);
  h.L.win(.8, .4, .36, .44, { sove: M.kirec, shut: acc, frame: M.ahsapK, lit: true }).door(1.5, .5, .84, { kind: 'seg', col: acc, sove: M.kirec })
    .win(2.48, .4, .36, .44, { sove: M.kirec, shut: acc, frame: M.ahsapK, lit: .5 });
  h.R.win(.66, .4, .38, .44, { sove: M.kirec, shut: acc, frame: M.ahsapK, lit: true });
  const hr = b.gable(3.5, .5, 6.7, 2.2, 1.05, .72, M.kiremit, { axis: 'x', ov: .2, wall: M.tas });
  hr.G.courses({ rh: .26, dens: .4 }).shp('round', .72, .12, .26, .26, M.kirec, 3, .08).shp('round', .76, .16, .18, .18, M.ic, 4);
  b.chimney(6.05, 1.08, 1.5, .72, { mat: M.tas, w: .34, s: .8 });
  // çardak: direkler, kiriş, mertekler, asma yaprakları ve salkımlar
  const py = 2.98, pz = .98, px0 = 4.25, px1 = 6.55;
  for (const x of [px0, 5.4, px1]) b.line3([[x, py, 0], [x, py, pz]], M.ahsapK, 2);
  let ck = `M${P(px0 - .1, py, pz)} ${P(px1 + .1, py, pz)}`; for (let x = px0; x < px1 + .01; x += .3286) ck += `M${P(x, 2.2, pz + .06)} ${P(x, py + .12, pz)}`;
  const lf = [[], [], []], uz = [];
  for (let i = 0; i < 46; i++) { const x = px0 - .1 + rs() * (px1 - px0 + .2), y = 2.3 + Math.pow(rs(), .6) * .82, q = pr(x, y, pz + .05); if (x > 4.95 && x < 5.45 && y < 2.8) continue; lf[i % 3 === 2 ? 1 : 0].push(q); if (i % 3 === 0) lf[2].push([q[0] - 1.6, q[1] - 1.6]); }
  for (let i = 0; i < 6; i++) { const q = pr(px0 + .15 + i * .42 + rs() * .1, py + .04, pz - .1 - rs() * .1); uz.push(q, [q[0] + .4, q[1] + 2.2]); }
  b.item([px0 - .1, 2.2, pz - .3, px1 + .1, py + .12, pz + .1], ln(M.ahsapK, ck, 1.5) + dots(T(M.sarmasik, -.2), lf[0], 7) + dots(M.sarmasik, lf[1], 6) + dots(T(M.sarmasik, .34), lf[2], 3) + dots('#6a4a8a', uz, 2.6), { cast: false });
  // çardak altı: sedir, saksılar, kedi
  b.bench(5.95, 2.42, 0, 'x', { l: .9 }).pot(4.62, 2.5, 0, { plant: true, fl: M.kirmizi }).pot(6.5, 2.75, 0, { s: .9 });
  b.critter('kedi', 6.05, 2.44, .22, { col: '#3a3634' });

  /* --- taş fırın: kireçli kubbe, kor ağız, kürek; ekmek çıkaran kadın --- */
  b.box(3.52, 2.3, 0, 4.14, 2.92, .3, M.tas, { edge: false });
  b.dome(3.83, 2.61, .3, .3, M.kirec, { hf: .95, alem: false, seams: false });
  b.art(3.83, 2.61, .3, pth('#4a3a30', 'M-9 4q-.6 -8 3.4 -8.6q4.4 .2 4.4 8.6z') + pth('#3a2a22>#ff9a3a', 'M-7.6 4q-.4 -6.4 2.2 -7q3 .2 3.2 7z') + pth('#e8622a>#ffd27a', 'M-6.4 4q0 -2.6 1.4 -3q1.4 .4 1.6 3z') + pth(M.tasK, 'M3 -10.4h3.4v3.6h-3.4z'),
    { bb: [3.53, 2.31, .3, 4.13, 2.91, .62] });
  b.fx('smoke', 3.9, 2.5, .68, { s: .5 });
  b.art(3.74, 3.02, .0, pth(M.ahsapA, 'M-7 -2.4l7 -3.4l6 3l-7 3.4z') + pth('#c9853a', K.ell(-2.6, -2.6, 2, 1.2) + K.ell(1.4, -2.6, 2, 1.2)) + pth('#e3a85a', K.ell(-3, -3, 1.2, .6) + K.ell(1, -3, 1.2, .6)), { r: .2, h: .1 });
  b.fig(4.2, 3.28, 0, { body: M.bezK, hat: 'ortu', hatCol: M.bez, robe: true, flip: true });
  b.art(4.2, 3.28, 0, ln(M.ahsapA, 'M-4 -10L-13 -6', 1.2) + pth(M.ahsapA, 'M-12 -7.6l-4.6 .6l1.4 2.8l4.2 -1.4z'), { bb: [3.85, 3.2, 0, 4.3, 3.4, .8] });

  /* --- çıkrıklı kuyu --- */
  b.cyl(3.15, 3.75, .36, 0, .38, M.tas, { top: '#2f5564' }).courses(.19);
  b.line3([[2.83, 4.07, .3], [2.83, 4.07, 1.12]], M.ahsapK, 2).line3([[3.47, 3.43, .3], [3.47, 3.43, 1.12]], M.ahsapK, 2);
  b.line3([[2.83, 4.07, 1.0], [3.47, 3.43, 1.0]], M.ahsap, 3.4, { pad: .2 });
  b.art(3.15, 3.75, 1.0, ln('#7a6a52', 'M0 0V15', .8) + ln(M.demir, 'M16 -8h3.4v5', 1.2) + pth(T(M.ahsap, -.1), 'M-3 15h6l-.8 5h-4.4z') + ln(M.demir, 'M-3 16.4h6', .8), { bb: [2.9, 3.5, .38, 3.5, 4.0, 1.0] });

  /* --- ağıl: çit, koyunlar, keçi, yalak; kapıda çoban köpeği --- */
  const koyun = (c, hc, boy) => golge(6.2, 2.2) + pth(hc, 'M-3.6 -3.4h1.3v3.4h-1.3zM2.2 -3.4h1.3v3.4h-1.3z') + pth(T(c, -.2), K.ell(.4, -6, 5.8, 3.9)) + pth(c, K.ell(-.4, -6.8, 4.8, 3))
    + pth(hc, K.ell(-5.8, -7.6, 2, 1.7) + 'M-5 -9l1.6 -1.2l-.2 1.8z') + (boy ? ln('#e6dccb', 'M-5.8 -9.2q.4 -2.8 2.8 -2.4', 1) : '');
  const hayvan = (x, y, svg, flip) => b.art(x, y, 0, flip ? `<g transform="scale(-1 1)">${svg}</g>` : svg, { r: .2, h: .45 });
  b.fence([[.3, 4.4], [2.6, 4.4], [2.6, 5.75]], .4).fence([[.3, 4.4], [.3, 5.75], [2.6, 5.75]], .4);
  hayvan(.85, 4.75, koyun('#f1ebdf', '#4a3f3a')); hayvan(1.75, 4.72, koyun('#e9e2d2', '#4a3f3a'), true); hayvan(1.3, 5.2, koyun('#f1ebdf', '#3a3230'));
  hayvan(2.15, 5.3, koyun('#b98a5a', '#6a4a30', true), true);
  b.box(.5, 5.42, 0, 1.15, 5.62, .15, M.ahsap, { edge: false, cast: false, T: '#4f9ab0' });
  hayvan(3.05, 4.85, golge(5, 1.8) + pth('#b9763a', 'M-1.6 0q-3 -1.2 -2.6 -5q.6 -3.4 3.2 -4q3.2 0 4 3.8q.4 3.6 -.8 5.2z') + pth('#f1e6d2', K.ell(-2.4, -3.4, 1.2, 2.2) + 'M-4.6 -10.4l-2.6 1l2.6 1z')
    + pth('#b9763a', K.circ(-2.6, -10.2, 2.3)) + pth('#6a4028', 'M-1.8 -12.2l1.8 -.4l-.4 3.2zM-3.2 -4h1.2v4h-1.2z' + K.circ(-7, -9.4, .5)) + ln('#b9763a', 'M3.4 -1q3 -.6 3.2 -3.4', 1.4));

  /* --- tavuklar: tek parça sürü --- */
  const tv = [[4.75, 3.45, 0, -1], [5.1, 3.7, 1, 1], [4.55, 3.85, 0, 1], [5.45, 3.4, 2, -1], [2.2, 3.55, 1, -1], [1.75, 3.75, 0, 1]], tc = ['#f4efe4', '#b9763a', '#3a3634'], tb = [[], [], []], th = [[], [], []], ib = [], gg = [];
  let kuy = ['', '', ''];
  for (const [x, y, c, d] of tv) { const q = pr(x, y, 0); tb[c].push([q[0], q[1] - 2.8]); th[c].push([q[0] + d * 2.1, q[1] - 5.2]); ib.push([q[0] + d * 2.3, q[1] - 6.6]); gg.push([q[0] + d * 3.5, q[1] - 5]); kuy[c] += `M${f1(q[0] - d * 1.4)} ${f1(q[1] - 3.6)}l${f1(-d * 1.8)} -2.2`; }
  b.item([1.6, 3.3, 0, 5.6, 3.95, .01], tc.map((c, i) => dots(c, tb[i], 4.6) + dots(c, th[i], 2.5) + ln(c, kuy[i], 1.7)).join('') + dots('#d8453a', ib, 1.4) + dots('#e8a23a', gg, 1), { cast: false });

  /* --- bostan çevresi: ayçiçekleri, çapalayan çiftçi, korkuluk, sepet --- */
  let sap = ''; const bas = [], yap = [];
  for (let i = 0; i < 5; i++) { const x = 4.05 + i * .34, z = .62 + rs() * .22, q = pr(x, 4.3, z); sap += `M${P(x, 4.3, 0)} ${f1(q[0])} ${f1(q[1])}`; bas.push([q[0] - 1, q[1] - .5]); yap.push(pr(x + .04, 4.3, z * .45), pr(x - .05, 4.3, z * .7)); }
  b.item([4.0, 4.26, 0, 5.5, 4.34, .9], ln('#4f8a4a', sap, 1.2) + dots('#5f9a4a', yap, 3) + dots('#f2c230', bas, 6.4) + dots('#7a4a22', bas, 2.8), { cast: false });
  b.fig(5.2, 5.08, 0, { body: '#5f7fa0', legs: '#6a5648', hat: 'hasir' });
  b.art(5.2, 5.08, 0, ln(M.ahsapA, 'M-9 -1L4.4 -11', 1.2) + ln(M.demir, 'M-9 -1l-2.4 -2.6', 2), { bb: [4.85, 4.98, 0, 5.3, 5.18, .8] });
  b.art(6.45, 5.2, 0, ln(M.ahsapK, 'M0 0V-25M-8 -17H8', 1.5) + pth(M.bezS, 'M-7.6 -18.4h15.2l.6 3.4l-4 -.4l.4 8.4l-2.4 -1.4l-2 1.6l-2.4 -1.6l-2 1.4l.4 -8l-4 .4z') + pth('#e8d6a6', K.circ(0, -21.6, 2.6)) + pth('#c9a04e', K.ell(0, -23.4, 5, 1.6) + 'M-2.4 -23.6q2.4 -4 4.8 0z'), { r: .15, h: 1 });
  b.critter('guvercin', 6.72, 5.2, .6, { col: '#3a3a44' });
  b.art(6.32, 4.74, 0, pth('#b98f4e', 'M-4 -3.6h8l-1 3.6h-6z') + pth('#7fb84f', K.ell(0, -3.8, 3.6, 1.6)) + dots('#b9dc7a', [[-1.4, -4.4], [1.2, -4]], 2), { r: .12, h: .2 });

  /* --- arı kovanları, portakal ağacı, kır çiçekleri --- */
  const kovan = (x, y, c) => { const s = .15, z0 = .09, z1 = .4, e = s + .03;
    b.item([x - e, y - e, 0, x + e, y + e, z1 + .05], ln(M.ahsapK, `M${P(x - s + .03, y + s, 0)} ${P(x - s + .03, y + s, z0)}M${P(x + s, y + s - .03, 0)} ${P(x + s, y + s - .03, z0)}M${P(x + s - .03, y - s, 0)} ${P(x + s - .03, y - s, z0)}`, 1.2)
      + pth(c, `M${PL([[x - s, y + s, z0], [x + s, y + s, z0], [x + s, y + s, z1], [x - s, y + s, z1]])}Z`) + pth(T(c, -.42), `M${PL([[x + s, y + s, z0], [x + s, y - s, z0], [x + s, y - s, z1], [x + s, y + s, z1]])}Z`)
      + pth(T('#b9a27a', .2), `M${PL([[x - e, y - e, z1 + .04], [x + e, y - e, z1 + .04], [x + e, y + e, z1 + .04], [x - e, y + e, z1 + .04]])}Z`) + pth(T('#b9a27a', -.3), `M${PL([[x - e, y + e, z1 + .04], [x + e, y + e, z1 + .04], [x + e, y - e, z1 + .04], [x + e, y - e, z1], [x + e, y + e, z1], [x - e, y + e, z1]])}Z`)
      + ln('#2a2420', `M${P(x - .06, y + s, z0 + .05)} ${P(x + .06, y + s, z0 + .05)}`, 1.3), { cast: false }); };
  kovan(5.7, 3.92, M.mavi); kovan(6.1, 3.98, '#e3c15a'); kovan(6.5, 3.9, M.kirec);
  b.item([5.6, 3.8, .5, 6.6, 4.1, .9], dots('#3a2e10', [pr(5.8, 4.1, .55), pr(6.0, 3.9, .75), pr(6.3, 4.1, .6), pr(6.45, 4.0, .8), pr(5.6, 4.0, .7)], 1.2), { cast: false });
  b.tree('narenciye', 6.78, 3.3, { s: 1.05 });
  const cic = (pts, col) => dots(col, pts.map(p => { const q = pr(p[0], p[1], 0); return [q[0], q[1] - 2]; }), 2.4);
  b.ground(cic([[5.5, 4.2], [5.9, 4.25], [6.75, 4.2], [.25, 2.9], [.1, 3.9], [3.6, 5.3], [2.7, 6.0], [6.9, 5.9]], M.sari) + cic([[5.7, 4.28], [6.3, 4.22], [.15, 3.3], [3.75, 4.8], [2.72, 5.5], [3.3, .2], [6.95, 2.6]], M.bez)
    + cic([[6.55, 4.3], [.2, 4.15], [3.7, 5.75], [2.85, 5.05], [7.0, 4.3]], M.kirmizi));
  b.tufts(.1, 2.8, .5, 4.3, 4).tufts(2.75, 4.5, 3.8, 6.1, 4);

  b.tag(3.3, 5.95, 0).doorAt(5.25, 3.25);
});
