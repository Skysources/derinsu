/* Çiftlik — kasvetli bir kır avlusu: solda dik çatılı kara ahşap ahır-samanlık (kapısı açık, içi kuru saman dolu), sağda alçak
   kara taş çiftlik evi (dik arduvaz çatı, kuru asmalı çardak), aralarında selvi. Önde: çamurlu avlu, kuru ot yığını, çıkrıklı kuyu,
   tek ışık olan taş fırının kızıl kor ağzı, koyun ağılı, solgun bostan, çıplak ağaç, yırtık kan kırmızısı paçavralı korkuluk.
   Parsel 7 × 6; ana cepheler +y (aydınlık). opt.seed kapı boyasını ve küçük ayrıntıyı değiştirir. */
CK.def('ciftlik', { w: 7, d: 6, name: 'Çiftlik' }, (b, K, opt) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, pr = K.pr, P = K.P, PL = K.PL, f1 = K.f1;
  const sd = (opt && opt.seed) || 7, rs = K.rng(sd * 97 + 3);
  const AH = M.gAhsap, AK = M.gAhsapK, AA = M.gAhsapA, TS = M.gTas, TK = M.gTasK, TA = M.gTasA, KR = M.gKara;
  const acc = [AK, T(M.gKanK, -.1), M.gDemir][sd % 3], saman = '#b8963e', camur = '#4a3e32', yap = '#55603e';
  // nokta dizisi: sıfır boylu çizgi + yuvarlak uç = ucuz daire (yaprak, tavuk)
  const dots = (col, pts, w, ex) => ln(col, pts.map(p => `M${f1(p[0])} ${f1(p[1])}h.01`).join(''), w, ex);
  const golge = (rx, ry) => `<ellipse cx="1" cy="0" rx="${rx}" ry="${ry}" fill="#1b2440" opacity=".2"/>`;
  const uc = (x, y, z) => b.art(x, y, z, ln(M.gDemir, 'M0 2V-11M-2.4 -5H2.4', 1.1) + pth(M.gDemir, 'M-1.3 -10.6L0 -14.4L1.3 -10.6Z'), { bb: [x - .05, y - .05, z, x + .05, y + .05, z + .5] });

  /* --- zemin: kuru çayır, çamurlu avlu, ağıl, saman döküntüsü, su birikintileri --- */
  b.gpoly([[-.3, .6], [1.5, -.3], [5.6, -.3], [7.3, .8], [7.3, 5.2], [6.2, 6.3], [1.2, 6.3], [-.3, 5.3]], T(M.gYosun, -.1), { op: .55 });
  b.gpoly([[.9, 2.5], [2.9, 2.4], [3.5, 2.95], [6.6, 3.0], [7.05, 3.6], [6.9, 4.2], [3.8, 4.25], [3.75, 6.15], [2.75, 6.15], [2.75, 4.3], [.3, 4.3], [.15, 3.2]], camur, { op: .92 });
  b.gpoly([[.3, 4.4], [2.6, 4.4], [2.6, 5.75], [.3, 5.75]], T(camur, -.16), { op: .95 });
  b.gpoly([[1.0, 2.55], [2.2, 2.5], [2.55, 3.0], [1.8, 3.35], [1.2, 3.1]], saman, { op: .5 });
  b.gpoly([[2.9, 3.0], [3.5, 3.1], [3.4, 3.45], [2.95, 3.4]], '#323a40', { op: .7 });
  b.gpoly([[5.6, 3.5], [6.4, 3.45], [6.5, 3.75], [5.8, 3.8]], '#323a40', { op: .6 });
  b.gpoly([[1.4, 5.0], [2.1, 4.95], [2.2, 5.3], [1.5, 5.35]], '#323a40', { op: .5 });
  let iz = ''; for (const [x0, y0, x1, y1] of [[2.0, 3.0, 5.2, 3.35], [2.2, 3.15, 5.25, 3.55], [3.2, 3.6, 3.3, 6.0]]) iz += `M${P(x0, y0)} ${P(x1, y1)}`;
  b.ground(ln(T(camur, -.3), iz, 1.4, 'stroke-dasharray="6 3"'));

  /* --- solgun bostan: karıklar, seyrek kararmış bitkiler --- */
  const vx0 = 3.95, vx1 = 6.75, vy0 = 4.5, vr = .225, yr = i => vy0 + i * vr;
  b.gpoly([[vx0 - .1, vy0 - .14], [vx1 + .1, vy0 - .14], [vx1 + .1, yr(5) + .14], [vx0 - .1, yr(5) + .14]], T(camur, -.06));
  let fur = ''; for (let i = 0; i < 5; i++) fur += `M${P(vx0 - .06, yr(i) + vr / 2)} ${P(vx1 + .06, yr(i) + vr / 2)}`;
  const sira = (i, col, w, gap, o = {}) => { const x0 = o.x0 || vx0, x1 = o.x1 || vx1, y = yr(i) + (o.dy || 0), z = o.z || .03;
    return ln(col, `M${P(x0, y, z)} ${P(x1, y, z)}`, w, `stroke-dasharray="0 ${gap}"`); };
  b.ground(ln(T(camur, -.3), fur, 1.3)
    + sira(0, yap, 4, 8) + sira(1, T(yap, -.1), 3.6, 6, { x1: 6.1 }) + sira(2, '#4e5a52', 5, 7.5) + sira(2, '#6a7268', 2, 7.5, { z: .09, dy: -.03 })
    + sira(3, T(yap, .06), 2.4, 4.2, { x0: 4.4 }) + sira(5, '#6a4a2c', 5, 11, { x0: 4.3, x1: 6.6 }));

  /* ================= AHIR — SAMANLIK ================= */
  const br = b.box(.3, .3, 0, 2.8, 2.5, 1.4, AH);
  br.L.planks({ step: .19, dt: -.2 }).shadeTop(.18).band(0, .22, KR, 0, 2.8); br.R.planks({ step: .19, dt: -.2 }).shadeTop(.16).band(0, .22, KR, 0, 2.8);
  br.L.rect(.62, 0, 1.26, 1.28, AK, 3).door(.7, 1.1, 1.18, { open: true, sove: null, floor: saman });
  br.L.poly([[.72, 0], [1.78, 0], [1.78, .36], [1.6, .62], [1.3, .74], [1.0, .6], [.84, .34], [.72, .28]], saman, 5, -.22).poly([[.86, .34], [1.0, .6], [1.3, .74], [1.6, .62], [1.3, .5], [1.05, .4]], saman, 5.1, .02)
    .line([[.9, .12], [1.2, .26]], saman, 1, 5.2, .14).line([[1.3, .1], [1.62, .3]], saman, 1, 5.2, .14).line([[1.1, .3], [1.5, .46]], saman, 1, 5.2, -.3);
  for (const [a0, a1] of [[.1, .66], [1.84, 2.4]]) br.L.rect(a0, .02, a1 - a0, 1.16, AK, 5, .04).line([[a0 + .03, .12], [a1 - .03, .12]], AA, 1.3, 6, -.2).line([[a0 + .03, 1.06], [a1 - .03, 1.06]], AA, 1.3, 6, -.2)
    .line([[a0 + .03, a0 < 1 ? .12 : 1.06], [a1 - .03, a0 < 1 ? 1.06 : .12]], AA, 1.1, 6, -.2);
  br.R.win(.86, .52, .26, .4, { kind: 'point', frame: AK, sove: AA, bars: [1, 2], lit: false });
  br.R.shp('round', .14, .02, .58, .58, AK, 6).shp('round', .2, .08, .46, .46, AH, 6.1, -.1).line([[.43, .05], [.43, .57]], AK, 1, 6.2).line([[.17, .31], [.69, .31]], AK, 1, 6.2);
  const rr = b.gable(.3, .3, 2.8, 2.5, 1.4, 1.5, M.gCati, { axis: 'y', ov: .2, wall: AH, tex: 'rows', step: .16 });
  rr.G.planks({ step: .19, dt: -.2 }).rect(1.0, .1, .5, .56, AK, 3).rect(1.05, .1, .4, .5, '#1e1a18', 4, null).poly([[1.05, .1], [1.45, .1], [1.45, .22], [1.3, .32], [1.12, .28], [1.05, .18]], saman, 5, -.1);
  rr.A.rect(.5, .34, .36, .56, AK, 3, -.06).rect(1.5, .9, .3, .44, M.gCatiK, 3, -.1).rect(2.1, .2, .4, .3, AA, 3, -.16);                 // yamalar, kırık arduvaz
  b.line3([[1.55, 2.5, 2.4], [1.55, 2.98, 2.4]], AK, 2.2, { pad: .05 });
  b.art(1.55, 2.94, 2.4, ln('#3e3630', 'M0 1V12', .8) + ln(M.gDemir, 'M0 12q-2.4 1 -1.4 3', 1), { bb: [1.5, 2.9, 1.82, 1.6, 2.98, 2.38] });
  uc(1.55, 2.7, 2.9);
  b.critter('guvercin', 1.55, 1.5, 2.9, { col: '#26262c' }).critter('guvercin', 1.55, 1.0, 2.9, { col: '#26262c', flip: true });
  b.tree('selvi', 3.14, .62, { s: .92 });
  // dirgen ve saman balyaları
  b.art(2.62, 2.56, 0, ln(AA, 'M2 0L-1 -25', 1.2) + ln(M.gDemir, 'M-3 -25.4h4M-3 -25.4l-.5 -4M-1 -25.6l-.5 -4.4M1 -25.4l-.5 -4', .9), { r: .1, h: 1 });
  b.hay(2.05, 2.72, 0).hay(2.35, 3.1, 0);

  /* --- kuru ot yığını: direkli tınaz, merdiven --- */
  b.cyl(.82, 3.5, .6, 0, .5, saman, { top: null });
  b.dome(.82, 3.5, .6, .5, saman, { hf: 1.2, alem: false, seams: false });
  b.art(.82, 3.5, .5, ln(T(saman, -.34), 'M-14 2l-2 9M-6 6l-1 10M4 7l1 9M13 3l2 8M-10 -8l-3 6M2 -4l1 7M9 -10l3 6M-3 -16l-1 5', .9, 'opacity=".7"') + ln(T(saman, .3), 'M-17 -2l-1 6M-9 -14l-2 5M-1 -22l-1 4', .9) + ln(AK, 'M0 -24V-33', 1.6),
    { bb: [.22, 2.9, .5, 1.42, 4.1, 1.5] });
  let mer = `M${P(1.6, 3.98, 0)} ${P(1.12, 3.6, 1.08)}M${P(1.38, 4.24, 0)} ${P(.9, 3.86, 1.08)}`;
  for (let k = 1; k < 6; k++) { const t = k / 6; mer += `M${P(1.6 - .48 * t, 3.98 - .38 * t, 1.08 * t)} ${P(1.38 - .48 * t, 4.24 - .38 * t, 1.08 * t)}`; }
  b.item([.9, 3.6, 0, 1.6, 4.24, 1.08], ln(AK, mer, 1.3), { cast: false });

  /* ================= ÇİFTLİK EVİ ================= */
  const h = b.box(3.5, .5, 0, 6.7, 2.2, 1.1, TK);
  h.L.courses({ rh: .26, bw: .55, dens: .55 }).stones(5, { rh: .26 }).shadeTop(.34, -.12).band(0, .2, KR, -.04);
  h.R.courses({ rh: .26, bw: .55, dens: .5 }).stones(3, { rh: .26 }).band(0, .2, KR, -.04);
  const pw = { kind: 'point', sove: TA, frame: AK, lit: false, bars: [1, 2] };
  h.L.win(.84, .4, .26, .5, pw).door(1.5, .5, .88, { kind: 'point', col: acc, sove: TA }).win(2.5, .4, .26, .5, pw);
  h.R.win(.7, .4, .26, .5, pw);
  const hr = b.gable(3.5, .5, 6.7, 2.2, 1.1, 1.15, M.gCati, { axis: 'x', ov: .2, wall: TK, tex: 'rows', step: .16 });
  hr.G.courses({ rh: .26, dens: .4 }).shp('point', .74, .14, .22, .4, KR, 3, -.3);
  hr.A.rect(1.6, .5, .4, .3, M.gCatiK, 3, -.1);
  uc(6.86, 1.35, 2.25);
  b.chimney(6.05, 1.0, 1.7, .78, { mat: TK, w: .34, s: .8 });
  // çardak: direkler, kiriş, mertekler, kuru asma
  const py = 2.98, pz = .98, px0 = 4.25, px1 = 6.55;
  for (const x of [px0, 5.4, px1]) b.line3([[x, py, 0], [x, py, pz]], AK, 2);
  let ck = `M${P(px0 - .1, py, pz)} ${P(px1 + .1, py, pz)}`; for (let x = px0; x < px1 + .01; x += .3286) ck += `M${P(x, 2.2, pz + .06)} ${P(x, py + .12, pz)}`;
  const lf = [[], []]; let dal = '';
  for (let i = 0; i < 22; i++) { const x = px0 - .1 + rs() * (px1 - px0 + .2), y = 2.3 + Math.pow(rs(), .6) * .82, q = pr(x, y, pz + .05); if (x > 4.95 && x < 5.45 && y < 2.8) continue; lf[i % 3 === 2 ? 1 : 0].push(q); }
  for (let i = 0; i < 5; i++) { const q = pr(px0 + .2 + i * .48, py, pz); dal += `M${f1(q[0])} ${f1(q[1])}q${f1(4 - rs() * 8)} 6 ${f1(2 - rs() * 4)} ${f1(9 + rs() * 5)}`; }
  b.item([px0 - .1, 2.2, pz - .3, px1 + .1, py + .12, pz + .1], ln(AK, ck, 1.5) + ln(T(AK, .1), dal, .8) + dots(T(yap, -.2), lf[0], 5) + dots('#6a5a3a', lf[1], 4), { cast: false });
  b.box(5.5, 2.32, 0, 6.4, 2.52, .24, TK, { edge: false, T: TA });
  b.critter('kedi', 6.05, 2.44, .24, { col: '#2a2a2e' });

  /* --- taş fırın: tek ışık, kızıl kor ağız; kürek; ekmek çıkaran kadın --- */
  b.box(3.52, 2.3, 0, 4.14, 2.92, .3, KR, { edge: false });
  b.dome(3.83, 2.61, .3, .3, TK, { hf: .95, alem: false, seams: false });
  b.art(3.83, 2.61, .3, pth('#2a2420', 'M-9 4q-.6 -8 3.4 -8.6q4.4 .2 4.4 8.6z') + pth(M.gKor, 'M-7.6 4q-.4 -6.4 2.2 -7q3 .2 3.2 7z') + pth(M.gAtes, 'M-6.4 4q0 -2.6 1.4 -3q1.4 .4 1.6 3z') + pth(TK, 'M3 -10.4h3.4v3.6h-3.4z'),
    { bb: [3.53, 2.31, .3, 4.13, 2.91, .62] });
  b.spill(3.55, 3.05, 1.0, { op: .7 });
  b.fx('smoke', 3.9, 2.5, .68, { s: .5 });
  b.art(3.74, 3.02, .0, pth(AA, 'M-7 -2.4l7 -3.4l6 3l-7 3.4z') + pth('#6a4a2c', K.ell(-2.6, -2.6, 2, 1.2) + K.ell(1.4, -2.6, 2, 1.2)), { r: .2, h: .1 });
  b.fig(4.55, 3.02, 0, { body: '#4a3e36', hat: 'ortu', hatCol: '#2e2a28', robe: true, flip: true });
  b.art(4.55, 3.02, 0, ln(AA, 'M-4 -10L-13 -6', 1.2) + pth(AA, 'M-12 -7.6l-4.6 .6l1.4 2.8l4.2 -1.4z'), { bb: [4.2, 2.94, 0, 4.65, 3.14, .8] });

  /* --- çıkrıklı kuyu --- */
  b.cyl(3.15, 3.75, .36, 0, .38, TK, { top: '#1e2428' }).courses(.19);
  b.line3([[2.83, 4.07, .3], [2.83, 4.07, 1.12]], AK, 2).line3([[3.47, 3.43, .3], [3.47, 3.43, 1.12]], AK, 2);
  b.line3([[2.83, 4.07, 1.0], [3.47, 3.43, 1.0]], AH, 3.4, { pad: .2 });
  b.art(3.15, 3.75, 1.0, ln('#3e3630', 'M0 0V15', .8) + ln(M.gDemir, 'M16 -8h3.4v5', 1.2) + pth(T(AH, -.1), 'M-3 15h6l-.8 5h-4.4z') + ln(M.gDemir, 'M-3 16.4h6', .8), { bb: [2.9, 3.5, .38, 3.5, 4.0, 1.0] });

  /* --- ağıl: çit, kirli koyunlar, kara koç, yalak; kapıda çoban köpeği --- */
  const koyun = (c, hc, boy) => golge(6.2, 2.2) + pth(hc, 'M-3.6 -3.4h1.3v3.4h-1.3zM2.2 -3.4h1.3v3.4h-1.3z') + pth(T(c, -.2), K.ell(.4, -6, 5.8, 3.9)) + pth(c, K.ell(-.4, -6.8, 4.8, 3))
    + pth(hc, K.ell(-5.8, -7.6, 2, 1.7) + 'M-5 -9l1.6 -1.2l-.2 1.8z') + (boy ? ln('#8a8070', 'M-5.8 -9.2q.4 -2.8 2.8 -2.4', 1) : '');
  const hayvan = (x, y, svg, flip) => b.art(x, y, 0, flip ? `<g transform="scale(-1 1)">${svg}</g>` : svg, { r: .2, h: .45 });
  b.fence([[.3, 4.4], [2.6, 4.4], [2.6, 5.75]], .4, { col: AH }).fence([[.3, 4.4], [.3, 5.75], [2.6, 5.75]], .4, { col: AH });
  hayvan(.85, 4.75, koyun('#a29a8c', '#2a2624')); hayvan(1.75, 4.72, koyun('#968e80', '#2a2624'), true); hayvan(1.3, 5.2, koyun('#a29a8c', '#1e1c1c'));
  hayvan(2.15, 5.3, koyun('#3a3634', '#1e1c1c', true), true);
  b.box(.5, 5.42, 0, 1.15, 5.62, .15, AH, { edge: false, cast: false, T: '#2e3a40' });
  hayvan(3.05, 4.85, golge(5, 1.8) + pth('#4a3a2e', 'M-1.6 0q-3 -1.2 -2.6 -5q.6 -3.4 3.2 -4q3.2 0 4 3.8q.4 3.6 -.8 5.2z') + pth('#7a7064', K.ell(-2.4, -3.4, 1.2, 2.2) + 'M-4.6 -10.4l-2.6 1l2.6 1z')
    + pth('#4a3a2e', K.circ(-2.6, -10.2, 2.3)) + pth('#2a2220', 'M-1.8 -12.2l1.8 -.4l-.4 3.2zM-3.2 -4h1.2v4h-1.2z' + K.circ(-7, -9.4, .5)) + ln('#4a3a2e', 'M3.4 -1q3 -.6 3.2 -3.4', 1.4));

  /* --- tavuklar: tek parça sürü --- */
  const tv = [[4.75, 3.45, 0, -1], [5.1, 3.7, 1, 1], [4.55, 3.85, 0, 1], [5.45, 3.4, 2, -1], [2.2, 3.55, 1, -1], [1.75, 3.75, 0, 1]], tc = ['#8a8478', '#5e4a3a', '#2a2828'], tb = [[], [], []], th = [[], [], []], ib = [], gg = [];
  let kuy = ['', '', ''];
  for (const [x, y, c, d] of tv) { const q = pr(x, y, 0); tb[c].push([q[0], q[1] - 2.8]); th[c].push([q[0] + d * 2.1, q[1] - 5.2]); ib.push([q[0] + d * 2.3, q[1] - 6.6]); gg.push([q[0] + d * 3.5, q[1] - 5]); kuy[c] += `M${f1(q[0] - d * 1.4)} ${f1(q[1] - 3.6)}l${f1(-d * 1.8)} -2.2`; }
  b.item([1.6, 3.3, 0, 5.6, 3.95, .01], tc.map((c, i) => dots(c, tb[i], 4.6) + dots(c, th[i], 2.5) + ln(c, kuy[i], 1.7)).join('') + dots(M.gKanK, ib, 1.4) + dots('#6a5a3a', gg, 1), { cast: false });

  /* --- bostan çevresi: kurumuş ayçiçekleri, çapalayan çiftçi, korkuluk, sepet --- */
  let sap = ''; const bas = [], ypr = [];
  for (let i = 0; i < 5; i++) { const x = 4.05 + i * .34, z = .62 + rs() * .22, q = pr(x, 4.3, z); sap += `M${P(x, 4.3, 0)} ${f1(q[0])} ${f1(q[1])}q${f1(2 + rs() * 2)} 1 ${f1(3 + rs() * 2)} 4`; bas.push([q[0] + 4, q[1] + 4.6]); ypr.push(pr(x + .04, 4.3, z * .45), pr(x - .05, 4.3, z * .7)); }
  b.item([4.0, 4.26, 0, 5.5, 4.34, .9], ln('#4a4a34', sap, 1.2) + dots('#5a5038', ypr, 3) + dots('#5e4a2c', bas, 5.6) + dots('#2a2220', bas, 2.6), { cast: false });
  b.fig(5.2, 5.08, 0, { body: '#4a4640', legs: '#2e2a28', hat: 'hasir' });
  b.art(5.2, 5.08, 0, ln(AA, 'M-9 -1L4.4 -11', 1.2) + ln(M.gDemir, 'M-9 -1l-2.4 -2.6', 2), { bb: [4.85, 4.98, 0, 5.3, 5.18, .8] });
  b.art(6.45, 5.2, 0, ln(AK, 'M0 0V-25M-8 -17H8', 1.5) + pth('#4a443c', 'M-7.6 -18.4h15.2l.6 3.4l-4 -.4l.4 8.4l-2.4 -1.4l-2 1.6l-2.4 -1.6l-2 1.4l.4 -8l-4 .4z')
    + pth(M.gKan, 'M-8 -17.6l-2.6 7.4l1.6 -1.4l.4 3l1.4 -4z') + pth(M.gKanK, 'M5 -16l2 6.6l-1.6 -1z') + pth(T(saman, -.1), K.circ(0, -21.6, 2.6)) + pth(T(saman, -.2), K.ell(0, -23.4, 5, 1.6) + 'M-2.4 -23.6q2.4 -4 4.8 0z')
    + pth('#1e1c1c', K.circ(-1, -21.8, .5) + K.circ(1, -21.8, .5)), { r: .15, h: 1 });
  b.critter('guvercin', 6.72, 5.2, .6, { col: '#26262c' });
  b.art(6.32, 4.74, 0, pth('#5e4e38', 'M-4 -3.6h8l-1 3.6h-6z') + pth('#4e5236', K.ell(0, -3.8, 3.6, 1.6)), { r: .12, h: .2 });

  /* --- arı kovanları (kara tahta), çıplak ağaç, kuru ot --- */
  const kovan = (x, y, c) => { const s = .15, z0 = .09, z1 = .4, e = s + .03;
    b.item([x - e, y - e, 0, x + e, y + e, z1 + .05], ln(AK, `M${P(x - s + .03, y + s, 0)} ${P(x - s + .03, y + s, z0)}M${P(x + s, y + s - .03, 0)} ${P(x + s, y + s - .03, z0)}M${P(x + s - .03, y - s, 0)} ${P(x + s - .03, y - s, z0)}`, 1.2)
      + pth(c, `M${PL([[x - s, y + s, z0], [x + s, y + s, z0], [x + s, y + s, z1], [x - s, y + s, z1]])}Z`) + pth(T(c, -.42), `M${PL([[x + s, y + s, z0], [x + s, y - s, z0], [x + s, y - s, z1], [x + s, y + s, z1]])}Z`)
      + pth(T(M.gCati, .2), `M${PL([[x - e, y - e, z1 + .04], [x + e, y - e, z1 + .04], [x + e, y + e, z1 + .04], [x - e, y + e, z1 + .04]])}Z`) + pth(T(M.gCati, -.3), `M${PL([[x - e, y + e, z1 + .04], [x + e, y + e, z1 + .04], [x + e, y - e, z1 + .04], [x + e, y - e, z1], [x + e, y + e, z1], [x - e, y + e, z1]])}Z`)
      + ln('#1e1c1c', `M${P(x - .06, y + s, z0 + .05)} ${P(x + .06, y + s, z0 + .05)}`, 1.3), { cast: false }); };
  kovan(5.7, 3.92, AH); kovan(6.1, 3.98, T(AH, .1)); kovan(6.5, 3.9, AK);
  { const p = pr(6.78, 3.3), kol = 'M0 0Q1 -12 -1 -24M-.4 -12Q-6 -16 -10 -27M-.8 -17Q5 -21 9 -32M-1 -24Q1 -30 3 -36M-6 -19.6L-10 -18M5 -23L10 -23.6M-7.6 -23L-6 -29M6.6 -27L4 -33';
    b.item([6.6, 3.15, 0, 6.96, 3.45, 1.5], `<g transform="translate(${f1(p[0])} ${f1(p[1])})">` + ln(T(AK, -.1), kol, 2) + ln(AK, 'M0 0Q1 -12 -1 -24', 3.6) + '</g>', { cast: false }); }
  b.critter('guvercin', 6.62, 3.28, 1.2, { col: '#26262c', flip: true });
  b.tufts(.1, 2.8, .5, 4.3, 5, { col: '#6a6448' }).tufts(2.75, 4.5, 3.8, 6.1, 5, { col: '#6a6448' }).tufts(5.5, 4.2, 7, 4.4, 4, { col: '#6a6448' });

  b.tag(3.3, 5.95, 0).doorAt(5.25, 3.25);
});
