/* Ticaret Evi — zengin tüccar konağı. Arkası (x=0) istinat duvarına yaslıdır, görünmez.
   Gotik üslup: kesme taş konak, dik arduvaz çatı ve sivri çatı pencereleri; köşede sivri külahlı sayım kulesi.
   Ana cephe +x (gölge): beş sivri kemerli dükkân gözü, üstünde arduvaz sundurma ve demir korkuluklu teras.
   +y ucu (aydınlık) meydana bakar: basamaklı taçkapı, kan kırmızısı sancaklar, armasız kalkan levha.
   Işık: taçkapının asılı demir feneri (güçlü) + kulede mum ışıklı tek dar pencere (zayıf). Parsel 7.2 × 9. */
CK.def('ticaret', { w: 7.2, d: 9, name: 'Ticaret Evi' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, circ = K.circ, ell = K.ell;
  const Z1 = 1.42, Z2 = 2.45, RISE = 1.6, RZ = Z2 + RISE, SL = RISE / 2, BAK = '#7a5a40';
  const KUMAS = ['#6a3a34', '#5a5040', '#3e4450', '#4a4236'];

  /* --- zemin: çarşı önü ve meydan döşemesi, kapı yolu; fener ışığı --- */
  b.pave(5.9, .3, 7.2, 9, M.gTasK); b.pave(.3, 7.6, 5.9, 9, M.gTasK);
  b.gpoly([[1.5, 7.86], [3.1, 7.86], [3.5, 9], [1.1, 9]], M.gTas);
  b.gpoly([[5.95, 5.05], [6.6, 5.05], [6.7, 6.15], [5.95, 6.15]], '#5e5448', { op: .5 });
  b.spill(2.3, 8.35, 1.6);

  /* --- ana konak: iki katlı kesme taş --- */
  const hl = b.box(.3, .3, 0, 4.3, 7.6, Z2, M.gTas), L = hl.L, HR = hl.R;
  L.courses({ rh: .26, bw: .55, dens: .55 }).stones(10, { rh: .26, dt: .06 }).band(0, .36, M.gTasK, 0).band(Z1 - .02, .08, M.gTasA, .08, 3).shadeTop(.2, -.2);
  L.win(.42, .5, .3, .9, { kind: 'point', sove: M.gTasA, frame: M.gDemir, bars: [1, 3], lit: false });
  L.win(3.36, .5, .3, .9, { kind: 'point', sove: M.gTasA, frame: M.gDemir, bars: [1, 3], lit: false });
  L.win(.42, 1.58, .3, .7, { kind: 'point', sove: M.gTasA, frame: M.gDemir, bars: [1, 2], lit: false });
  L.win(3.36, 1.58, .3, .7, { kind: 'point', sove: M.gTasA, frame: M.gDemir, bars: [1, 2], lit: false });
  L.poly([[3.6, 0], [3.7, 0], [3.7, .7], [3.52, .4]], M.gYosun, 2.3, -.05);                                   // dipte yosun
  // köşe payandaları: +y duvarına yaslı, kademeli eğimli şapka
  for (const x of [.44, 4.16]) { const w = .28, y = 7.6, out = .34, z1 = 1.95, zt = z1 + .4, p = b.box(x - w / 2, y, 0, x + w / 2, y + out, z1, M.gTas, { edge: false });
    p.L.courses({ rh: .26, bw: .4, dens: .6 }).band(0, .36, M.gTasK, 0).band(1.0, .06, M.gTasA, .08, 3); p.R.courses({ rh: .26, bw: .4, dens: .5 }).band(0, .36, M.gTasK, 0);
    b.poly3([[x - w / 2, y, zt], [x + w / 2, y, zt], [x + w / 2, y + out, z1], [x - w / 2, y + out, z1]], M.gTasA, { n: [0, .4, out], bb: [x - w / 2, y, z1, x + w / 2, y + out, zt] });
    b.poly3([[x + w / 2, y + out, z1], [x + w / 2, y, zt], [x + w / 2, y, z1]], M.gTas, { n: [1, 0, 0], bb: [x + w / 2 - .01, y, z1, x + w / 2, y + out, zt] }); }
  // terasa bakan üst kat: dar sivri pencereler, teras kapısı
  HR.courses({ rh: .26, bw: .55, dens: .45, b0: Z1 }).band(0, .36, M.gTasK, 0).band(Z1 - .02, .08, M.gTasA, .08, 3).shadeTop(.2, -.2);
  HR.courses({ rh: .26, bw: .55, dens: .5, a1: 1.3, b1: Z1 });
  [2.0, 3.1, 5.28, 6.4].forEach(a => HR.win(a, 1.62, .28, .62, { kind: 'point', sove: M.gTasA, frame: M.gDemir, bars: [1, 2], lit: false }));
  HR.win(.5, .55, .28, .7, { kind: 'point', sove: M.gTasA, frame: M.gDemir, bars: [1, 2], lit: false });
  HR.door(4.14, .5, .82, { kind: 'point', b: Z1, col: M.gAhsapK, sove: M.gTasA });

  /* --- taçkapı: kesme taş çıkma, sivri kemerli çift kanat kapı, üstü dişli --- */
  const tk = b.box(1.4, 7.6, 0, 3.2, 7.86, 2.0, M.gTasA, { edge: false }), TL = tk.L;
  TL.courses({ rh: .22, bw: .5, dens: .4 }).stones(4, { rh: .22, dt: .06 }).shadeTop(.1, -.15);
  TL.door(.4, 1.0, 1.42, { kind: 'point', b: .3, col: M.gAhsapK, sove: M.gTas, double: true });
  TL.shp('point', .82, 1.86 - .18, .16, .3, M.gTasK, 4, -.1);                                                  // kapı üstünde kör niş
  tk.R.courses({ rh: .22, bw: .5, dens: .5 });
  b.merlons(1.4, 7.6, 3.2, 7.86, 2.0, M.gTasA, { h: .22, w: .26, gap: .2 });
  b.box(1.36, 7.86, 0, 1.6, 8.42, .4, M.gTas, { edge: false }); b.stairs(1.6, 7.86, 3.0, 8.46, .3, 0, 'y', M.gTas); b.box(3.0, 7.86, 0, 3.24, 8.42, .4, M.gTas, { edge: false });
  // asılı demir fener: kısa zincir, kafes gövde; gece hâleli (konağın asıl ışığı)
  b.art(2.3, 7.9, 1.94, ln(M.gDemir, 'M0 0v4', .9, 'stroke-dasharray="1.2 .8"') + pth(M.gDemir, 'M-3 4h6l-1 1.8h-4zM-2.2 12h4.4l-2.2 2.6z') + pth('#ffe0a0>#ffd27a', 'M-2 5.8h4v6.2h-4z')
    + ln(M.gDemir, 'M0 5.8v6.2', .6) + `<circle class="Nl" cy="9" r="17" fill="url(#${K.glowId()})"/>`, { bb: [2.25, 7.89, 1.4, 2.35, 7.95, 1.94] });
  b.fx('banner', 1.47, 7.87, 1.86, { col: M.gKan, trim: M.gKanK, w: .22, h: .9, axis: 'x' }).fx('banner', 2.91, 7.87, 1.86, { col: M.gKan, trim: M.gKanK, w: .22, h: .9, axis: 'x' });
  // armasız kalkan levha: demir kolda, kara çerçeveli kan kırmızısı kalkan
  b.line3([[3.74, 7.6, 1.5], [3.74, 8.22, 1.5]], M.gDemir, 1.6, { pad: .06 }).line3([[3.74, 7.6, 1.2], [3.74, 7.98, 1.5]], M.gDemir, 1.1, { pad: .06 });
  b.art(3.74, 8.12, 1.5, ln('#1e2024', 'M-4 0v3M4 0v3', .8) + pth('#1e2024', 'M-8.4 3h16.8v9q0 7 -8.4 10q-8.4 -3 -8.4 -10z') + pth(M.gKan, 'M-7 4.4h14v7.6q0 5.8 -7 8.4q-7 -2.6 -7 -8.4z')
    + pth(M.gKanK, 'M0 4.4h7v7.6q0 5.8 -7 8.4z'), { bb: [3.6, 7.95, .7, 3.88, 8.3, 1.52] });

  /* --- dükkân kanadı: tek kat, beş sivri kemerli göz; damı teras, önü arduvaz sundurma --- */
  const wg = b.box(4.3, .3, 0, 5.9, 6.3, Z1, M.gTasK, { T: M.gTas }), R = wg.R, TE = wg.T, SP = .888, PI = .26, oa = i => PI + i * (SP + PI);
  R.courses({ rh: .26, bw: .5, dens: .4 }).band(0, .2, M.gKara, 0).band(Z1 - .12, .12, M.gTasA, .06, 3);
  for (let i = 0; i < 5; i++) R.shp('point', oa(i) - .08, 0, SP + .16, 1.04, M.gTasA, 2.9, .04);
  R.arcade(0, 6, 5, .96, { kind: 'point', pier: PI, th: .3, floor: '#4e4840', ring: false, cap: false });
  // gözlerin içi (derinlik e < 0): kumaş topları, bakır raflar, çuvallar, küpler — sönük
  const ic = (i, da, bb, w, h, c, e = -.2, dt = .1, ly = 5.3) => R.poly([[oa(i) + da, bb, e], [oa(i) + da + w, bb, e], [oa(i) + da + w, bb + h, e], [oa(i) + da, bb + h, e]], c, ly, dt);
  ic(0, .3, .3, .56, .04, M.gAhsapK, -.28, 0); ['#6a3028', '#7a6a3a', '#4a5a34'].forEach((c, k) => ic(0, .33 + k * .17, .34, .13, .17, c, -.28, .1));
  ic(1, .3, .3, .56, .04, M.gAhsapK, -.28, 0); [0, 1, 2].forEach(k => ic(1, .34 + k * .17, .34, .13, .12 + (k % 2) * .06, BAK, -.28, .15));
  KUMAS.concat([M.gKanK]).forEach((c, k) => ic(2, .2 + k * .13, .12, .115, .56 - (k % 2) * .08, c, -.12));
  ic(3, .5, .04, .3, .3, M.gAhsap, -.2, .05);
  [[.36, .32, '#5a5448'], [.62, .26, M.gKemik]].forEach(([da, h, c]) => R.put(5.4, K.kf(R.c(c, 0)), R.shapeD('round', oa(4) + da - .08, .03, .19, h, -.22)));
  b.shed(5.9, .3, 6.42, 6.3, 1.1, 1.34, '+x', M.gCati, { tex: 'rows' });
  // teras: taş döşeme, tek koyu halı, demir korkuluk
  TE.planks({ dir: 'h', step: .5, dt: -.07 });
  TE.rect(.5, .9, .8, 1.3, M.gKanK, 3, .02).rect(.56, .98, .68, 1.14, T(M.gKanK, -.1), 3.1, .02);
  b.fence([[4.34, .36], [5.9, .36], [5.9, 6.24]], .4, { z: Z1, col: M.gDemir });
  b.fig(5.45, 2.9, Z1, { body: M.gMor, robe: true, hat: 'ortu', hatCol: '#3a3634', skin: '#b89478' });

  /* --- köşe kulesi: sayım odası, sivri arduvaz külah, demir sivri uç ve kızıl flama --- */
  const ZT = 3.3, ku = b.cyl(5.2, 7.0, .7, 0, ZT, M.gTas);
  ku.courses(.33).band(0, .3, M.gTasK, .03).band(Z1 - .04, .1, M.gTasA, .04, false).band(ZT - .2, .2, M.gTasA, .07);
  const kf1 = ku.face(-.48, 0, .62, 1.4);
  kf1.win(.18, .5, .26, .8, { kind: 'point', sove: M.gTasA, frame: M.gDemir, bars: [1, 3], lit: false });
  ku.face(-.6, 1.9, .34, .9).win(.06, 0, .2, .62, { kind: 'point', frame: M.gTasA, fw: .04, sill: false, bars: [1, 2], lit: false });
  ku.face(.05, 2.2, .34, .9).win(.08, 0, .16, .5, { kind: 'point', frame: M.gTasA, fw: .04, sill: false, bars: [1, 1], lit: true });   // mum ışıklı tek pencere
  b.cone(5.2, 7.0, .84, ZT + .07, 1.75, M.gCatiK);
  b.line3([[5.2, 7.0, ZT + 1.8], [5.2, 7.0, ZT + 2.2]], M.gDemir, 1.4);
  b.fx('flag', 5.2, 7.0, ZT + 2.18, { col: M.gKan, s: .8 });

  /* --- çarşı önü --- */
  // kumaşçı: tezgâhta toplar
  b.box(5.98, 2.95, 0, 6.3, 3.65, .26, M.gAhsap, { edge: false, cast: false });
  b.art(6.14, 3.3, .26, [[KUMAS[0], -7, 2], [KUMAS[2], -2, -.5], [M.gKanK, 3, -3], [KUMAS[1], 8, -5.5]].map(([c, x, y]) => pth(T(c, -.2), `M${x - 5} ${y - 1}l7 -3.6l3 1.6v2.6l-7 3.6l-3 -1.6z`) + pth(T(c, .15), `M${x - 5} ${y - 1}l7 -3.6l3 1.6l-7 3.6z`)).join(''), { bb: [5.98, 2.95, .26, 6.3, 3.65, .5] });
  // bakırcı: kazan, ibrik
  b.cyl(6.16, 4.62, .2, 0, .26, BAK, { top: '#2e2420', cast: false }).band(.22, .04, T(BAK, .2), .02, false);
  b.art(6.12, 4.2, 0, pth(T(BAK, -.3), ell(0, -7, 6.4, 7.4)) + pth(T(BAK, .05), ell(-.8, -7.6, 5.2, 6.2)) + pth(T(BAK, -.2), 'M9 0q-2.6 -4 -.6 -7.6h3.4q2 3.6 -.6 7.6zM9.4 -7.6l.6 -3.4h1.2l.6 3.4z') + ln(T(BAK, -.2), 'M12 -6q3 .4 2.4 3.4', .9), { bb: [5.98, 4.05, 0, 6.3, 4.4, .6] });
  // baharatçı: ağzı açık çuvallar
  { const o0 = K.pr(6.25, 5.6), f = K.f1; let sa = '', sb = '', sc = '', sm = '';
    [['#6a3028', 6.06, 5.2], ['#7a6a3a', 6.06, 5.62], ['#4a5a34', 6.06, 6.04], ['#7a4a2a', 6.44, 5.42], ['#3e2a34', 6.44, 5.86]].forEach(([c, x, y]) => { const p = K.pr(x, y), X = p[0] - o0[0], Y = p[1] - o0[1];
      sa += `M${f(X - 5)} ${f(Y)}q-1.6 -5 .2 -8h9.6q1.8 3 .2 8q-5 2 -10 0z`; sb += `M${f(X - 5)} ${f(Y)}q-1.6 -5 .2 -8h4.4q-1.6 4 -.6 9q-2.4 -.2 -4 -1z`; sc += ell(X, Y - 8, 5.2, 2.3); sm += pth(c, ell(X, Y - 8.3, 4.1, 1.7)); });
    b.art(6.25, 5.6, 0, pth(T('#8a7e68', -.24), sa) + pth('#8a7e68', sb) + pth(T('#8a7e68', .15), sc) + sm, { bb: [5.95, 5.08, 0, 6.56, 6.16, .36] }); }
  // büyük kara bronz terazi: üç ayak, kol, iki kefe
  b.art(6.6, 7.1, 0, ln(M.gAhsapK, 'M-9 1L0 -33L9 -1M0 -33L-1 5', 1.7) + ln(M.gBronz, 'M-15 -26L15 -29', 1.8) + pth(M.gBronz, circ(0, -27.5, 1.8))
    + ln('#3a3630', 'M-15 -26l-4.6 13M-15 -26l4.6 13M15 -29l-4.6 14M15 -29l4.6 14', .6)
    + pth(T(M.gBronz, -.3), 'M-21 -13h12q-1 4.4 -6 4.4q-5 0 -6 -4.4zM9 -15h12q-1 4.4 -6 4.4q-5 0 -6 -4.4z') + pth(T(M.gBronz, .2), ell(-15, -13, 6, 1.7) + ell(15, -15, 6, 1.7))
    + pth(M.gDemir, 'M12.4 -18.4h2.2v3.2h-2.2zM15.4 -17.6h1.8v2.4h-1.8z'), { bb: [6.45, 6.95, 0, 6.8, 7.3, 1.2] });
  b.fig(6.2, 7.52, 0, { body: '#3a2e2a', legs: '#2a2624', hat: 'ortu', hatCol: '#2a2624', robe: true, skin: '#b89478' });   // tüccar
  b.fig(7.02, 6.66, 0, { body: '#4a4640', hat: 'none', carry: 'sepet', flip: true, skin: '#b89478' });                    // müşteri
  // hamal, kuzgun, sandıklar
  b.fig(6.86, 4.72, 0, { body: '#5a5044', legs: '#2e2824', hat: 'none', carry: 'kasa', step: 1, skin: '#b89478' });
  b.critter('guvercin', 6.62, 3.2, 0, { col: '#26262a' }).critter('guvercin', 4.6, 2.6, Z1 + .4, { col: '#26262a', flip: true });
  b.crate(5.78, 8.42, 0, .44, { col: M.gAhsap }).sack(5.36, 8.5, 0, { col: '#6a6050' }).sack(5.6, 8.84, 0, { col: '#5a5246' });
  // tezgâhlar: uçta balıkçı, meydan yanında manav — kara bez örtülü
  b.stall(6.1, .4, 0, { w: .95, d: .7, cols: [M.gKul, M.gAhsapK], goods: ['#5a6670', '#6a5a40', '#5a3028'] });
  b.stall(.38, 8.0, 0, { w: 1.0, d: .7, cols: [M.gKanK, M.gKul], goods: ['#4a5a34', '#7a6a3a', '#5a3028'] });
  b.fig(.9, 8.86, 0, { body: '#4a4238', hat: 'ortu', hatCol: '#2a2624', robe: true, skin: '#b89478' });
  b.line3([[6.5, 1.78, 0], [6.5, 1.78, .8]], M.gAhsapK, 1.5).line3([[6.5, 2.5, 0], [6.5, 2.5, .8]], M.gAhsapK, 1.5).line3([[6.5, 1.78, .76], [6.5, 2.5, .76]], M.gAhsap, 1.6);
  [[1.9, 1.34], [2.06, 1.2], [2.22, 1.42], [2.38, 1.26]].forEach(([y, h], i) => b.line3([[6.66, y, 0], [6.5, y, .76], [6.44, y, h]], i % 2 ? M.gBronz : M.gAhsapA, 1, { pad: .02 }));

  /* --- çatı: dik arduvaz; sivri çatı pencereleri, mahyada demir uçlar, yüksek bacalar --- */
  const rf = b.gable(.3, .3, 4.3, 7.6, Z2, RISE, M.gCati, { axis: 'y', ov: .18, wall: M.gTas, tex: false });
  rf.A.rows({ step: .17 }); rf.A.rect(1.2, 2.2, .5, .2, M.gCatiA, 2.3, -.05).rect(4.6, .9, .4, .16, M.gCatiK, 2.3, -.1);
  if (rf.B) rf.B.rows({ step: .17 });
  rf.G.courses({ rh: .26, bw: .55, dens: .5 });
  rf.G.win(1.76, .25, .48, 1.0, { kind: 'point', sove: M.gTasA, frame: M.gDemir, bars: [2, 3], lit: false, sill: false });
  b.line3([[2.3, 7.78, RZ], [2.3, 7.78, RZ + .5]], M.gDemir, 1.6).line3([[2.3, .12, RZ], [2.3, .12, RZ + .4]], M.gDemir, 1.4);
  b.art(2.3, 7.78, RZ + .3, ln(M.gDemir, 'M-2.6 0h5.2', 1.1), { bb: [2.28, 7.76, RZ + .28, 2.32, 7.8, RZ + .32] });
  // ana çatıya saplanan çatı penceresi: ön duvar (xf) + iki dik yamaç; dereler ana çatıya göre kırpılır
  const zr = x => RZ - (x - 2.3) * SL;
  const capraz = (y0, y1, xf, hw, rise, win) => {
    const zt = zr(xf) + hw, ym = (y0 + y1) / 2, half = (y1 - y0) / 2, ov = .08, ext = half + ov, zt2 = zt + rise, ze = zt - ov * rise / half, len = Math.hypot(ext, zt2 - ze), X1 = xf + ov, zb = zr(xf);
    const xr = 2.3 + (RZ - zt2) / SL, xe = 2.3 + (RZ - ze) / SL, xw = 2.3 + (RZ - zt) / SL, w = X1 - xr, c = M.gCatiK;
    const A = new K.Face([xr, ym + ext, ze], [1, 0, 0], K.unit([0, -ext, zt2 - ze]), w, len, K.unit([0, zt2 - ze, ext]), [[xe - xr, 0], [w, 0], [w, len], [0, len]]);
    const B = new K.Face([xr, ym, zt2], [1, 0, 0], K.unit([0, -ext, ze - zt2]), w, len, K.unit([0, -(zt2 - ze), ext]), [[0, 0], [w, 0], [w, len], [xe - xr, len]]);
    const F = new K.Face([xf, y1, zb], [0, -1, 0], [0, 0, 1], y1 - y0, zt2 - zb, [1, 0, 0], [[0, 0], [y1 - y0, 0], [y1 - y0, zt - zb], [half, zt2 - zb], [0, zt - zb]]);
    A.fill(c).rows({ step: .15 }); B.fill(c); F.fill(M.gTas); win(F, y1 - y0, zt - zb);
    const bv = K.dot(B.n, K.VIEW) > .02;
    b.item([xr, y0 - ov, zb, X1, y1 + ov, zt2], () => (bv ? B.svg() : '') + `<path class="${K.kf(T(M.gTas, K.toneOf([0, 1, 0])))}" d="M${K.PL([[xf, y1, zb], [xf, y1, zt], [xw, y1, zt]])}Z"/>` + F.svg() + A.svg()
      + ln(T(c, -.3), `M${K.PL([[X1, y1 + ov, ze], [X1, ym, zt2], [X1, y0 - ov, ze]])}`, 2) + ln(T(c, .3), `M${K.PL([[xr, ym, zt2], [X1, ym, zt2]])}`, 1.6)
      + ln(M.gDemir, `M${K.PL([[X1, ym, zt2], [X1, ym, zt2 + .3]])}`, 1.2), { cast: false });
  };
  capraz(2.56, 3.86, 4.3, .55, .62, (F, w, h) => F.shp('point', w / 2 - .17, .06, .34, h + .3, M.gTasA, 3, .06).shp('point', w / 2 - .11, .1, .22, h + .2, M.gCam, 5).line([[w / 2, .1], [w / 2, h + .2]], M.gDemir, .8, 6).band(0, .06, M.gTasA, .06, 3));
  capraz(.9, 1.5, 3.7, .34, .4, (F, w, h) => F.shp('point', .17, .04, w - .34, h + .14, M.gDemir, 4).shp('point', .2, .06, w - .4, h + .08, M.gCam, 5));
  b.chimney(1.25, 1.2, 3.1, 1.6, { mat: M.gTasK, w: .38, s: .8 }); b.chimney(1.45, 6.6, 3.2, 1.25, { mat: M.gTasK, w: .3, smoke: false });
  b.critter('guvercin', 2.3, 4.6, RZ, { col: '#26262a' });
  b.fx('birds', 2.3, 4.9, RZ + .6, { n: 3 });

  b.tag(6.6, 8.9, 0).doorAt(2.3, 8.7);
});
