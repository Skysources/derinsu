/* Çeşme — istinat duvarına yaslı kara taş duvar çeşmesi: ortada dik beşik çatılı, sivri kemerli derin niş; nişin dibinde
   canavar ağızlı oluk, altında kara taş yalak. İki yanda kuleli taş kanat (sivri külahlı fiyaller) ve seki. Işık yok: su soğuk, koyu.
   opt.dir 'L' (varsayılan): cephe +y'ye bakar, sırtı y=0, parsel 3 × 1.6 · 'R': cephe +x'e bakar, sırtı x=0, parsel 1.6 × 3.
   Yerel eksenler: s = duvar boyunca (cepheye bakınca soldan sağa), t = duvardan dışarı. Cephe yüzünde a = s − s0 (iki yönde de aynı). */
CK.def('cesme', { w: 3, d: 1.6, name: 'Çeşme' }, (b, K, opt) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, R = (opt || {}).dir === 'R', W = 3;
  const X = (s, t) => R ? [t, W - s] : [s, t];
  const BB = (s0, t0, z0, s1, t1, z1) => R ? [t0, W - s1, z0, t1, W - s0, z1] : [s0, t0, z0, s1, t1, z1];
  // kutu: F = cephe yüzü, S = görünen yan yüz, T = üst
  const box = (s0, t0, z0, s1, t1, z1, col, o) => { const q = BB(s0, t0, z0, s1, t1, z1), k = b.box(q[0], q[1], q[2], q[3], q[4], q[5], col, o); return { F: R ? k.R : k.L, S: R ? k.L : k.R, T: k.T }; };
  const gp = (pts, col, o) => b.gpoly(pts.map(p => X(p[0], p[1])), col, o);
  const art = (s, t, z, svg, h = .4) => b.art(...X(s, t), z, svg, { h });
  const TS = M.gTas, TK = M.gTasK, TA = M.gTasA, KR = M.gKara, SU = '#2f3d44', P3 = (s, t, z) => K.P(...X(s, t), z);

  /* --- zemin: kara kaldırım, yalak önünde ıslak birikinti --- */
  gp([[0, 0], [3, 0], [3, 1.6], [0, 1.6]], T(KR, .06));
  let dz = ''; for (let s = .35; s < 3; s += .42) dz += `M${P3(s, .62, 0)} ${P3(s - .06, 1.6, 0)}`; for (const t of [.95, 1.3]) dz += `M${P3(0, t, 0)} ${P3(3, t + .03, 0)}`;
  b.ground(ln(T(KR, -.28), dz, .7, 'stroke-dasharray="5 3" opacity=".6"'));
  gp([[.7, .92], [2.3, .92], [2.5, 1.22], [1.8, 1.46], [.85, 1.32]], '#3a4248', { op: .55 });
  gp([[1.95, 1.28], [2.6, 1.3], [2.48, 1.5], [2.05, 1.48]], '#3a4248', { op: .4 });

  /* --- yan kanatlar: kara taş, köşede payanda, tepede sivri külahlı fiyal, önde seki --- */
  [.12, 2.28].forEach(s0 => {
    const k = box(s0, 0, 0, s0 + .6, .34, 1.42, TK, { T: TA });
    k.F.courses({ rh: .22, bw: .4, dens: .5 }).stones(3, { rh: .22, dt: .07 }).band(0, .14, KR, -.06).band(1.33, .09, TA, .06);
    k.F.shp('point', .2, .42, .2, .64, KR, 3, -.3).line([[.3, .42], [.3, .96]], TK, .7, 4, -.1);     // kör mazgal
    k.F.poly([[.05, .3], [.12, .3], [.1, 1.2], [.06, 1.2]], M.gYosun, 2.6, -.1);                       // yosun izi
    if (R ? s0 < 1 : s0 > 1) k.S.courses({ rh: .22, bw: .4, dens: .45 }).band(1.33, .09, TA, .06);
    box(s0 + .17, .07, 1.42, s0 + .43, .29, 1.66, TS, { edge: false, T: null }).F.shp('point', .08, .04, .1, .16, KR, 3, -.3);
    b.cone(...X(s0 + .3, .18), .17, 1.66, .62, M.gCati);
    art(s0 + .3, .18, 2.28, ln(M.gDemir, 'M0 1V-7', 1.1), .3);
    box(s0 - .02, .34, 0, s0 + .62, .62, .24, KR, { edge: false, T: TK }).F.band(.17, .07, TK, .08);
  });

  /* --- niş dibi: is tutmuş kara taş, canavar başı, altında pas akıntısı --- */
  const bk = box(.75, 0, 0, 2.25, .26, 2.24, KR, { edge: false, T: null }), f = bk.F;
  f.courses({ rh: .2, bw: .36, dens: .7, a0: .3, a1: 1.2, b0: .3, b1: 1.6, dt: -.16 });
  f.poly([[.71, .84], [.79, .84], [.83, .44], [.67, .44]], M.gPas, 2.7, -.06).poly([[.73, .84], [.77, .84], [.76, .56], [.74, .56]], M.gPas, 2.8, .1);
  // canavar başı: sivri kulaklar, çökük gözler, açık çene, iki diş
  f.poly([[.58, .92], [.6, 1.1], [.63, 1.18], [.6, 1.34], [.69, 1.22], [.81, 1.22], [.9, 1.34], [.87, 1.18], [.9, 1.1], [.92, .92], [.84, .82], [.66, .82]], TA, 3.5, -.08)
    .poly([[.75, 1.22], [.81, 1.22], [.87, 1.18], [.9, 1.1], [.92, .92], [.84, .82], [.75, .82]], TS, 3.6, -.16)
    .poly([[.63, 1.06], [.72, 1.03], [.71, .99], [.64, 1.0]], KR, 3.8, -.4).poly([[.87, 1.06], [.78, 1.03], [.79, .99], [.86, 1.0]], KR, 3.8, -.4)
    .poly([[.66, .93], [.84, .93], [.8, .83], [.7, .83]], '#1e1c1c', 3.8, null)
    .poly([[.69, .93], [.72, .93], [.705, .88]], M.gKemik, 3.9, -.2).poly([[.78, .93], [.81, .93], [.795, .88]], M.gKemik, 3.9, -.2)
    .line([[.6, 1.12], [.68, 1.16], [.75, 1.13], [.82, 1.16], [.9, 1.12]], KR, .9, 3.9, -.2);

  /* --- ön gövde: kesme taş çerçeve, derin sivri kemerli niş, kemer taşları, kilit taşı --- */
  const g = box(.75, .26, 0, 2.25, .42, 2.24, TS, { T: null }), F = g.F;
  F.arcade(.33, 1.17, 1, 1.15, { b: .32, pier: 0, kind: 'point', th: .16, thru: true, cap: false, floor: KR });
  F.courses({ rh: .24, bw: .44, dens: .45, a0: 0, a1: .28 }).courses({ rh: .24, bw: .44, dens: .45, a0: 1.22, a1: 1.5 }).courses({ rh: .24, bw: .44, dens: .4, b0: 1.56, b1: 2.1 });
  F.put(3.2, 'Ln ' + K.ks(F.c(TA, .04)), F.shapeD('point', .27, .32, .96, 1.24).replace(/Z$/, ''), 'stroke-width="3.6" stroke-dasharray="5 1.4" style="stroke-linecap:butt"');
  F.poly([[.69, 1.5], [.81, 1.5], [.79, 1.62], [.71, 1.62]], TA, 3.4, .1);
  F.band(0, .12, KR, -.04).band(.12, .2, TK, -.02).band(2.1, .14, TA, .04);
  F.rect(.27, .32, .96, .06, TA, 3.3, .08);
  // nişin yanında zincirli demir tas
  F.line([[1.38, 1.18], [1.38, .82]], M.gDemir, .9, 7, -.1).line([[1.38, 1.18], [1.38, .82]], T(M.gDemir, .3), .6, 7.1, null);
  F.poly([[1.32, .82], [1.44, .82], [1.42, .72], [1.34, .72]], M.gDemir, 7.2, .1);
  g.S.band(2.1, .14, TA, .04);

  /* --- dik beşik çatı: arduvaz, alınlıkta kör gül penceresi, mahyada demir sivri uç --- */
  const q = BB(.75, 0, 0, 2.25, .42, 0);
  const rf = b.gable(q[0], q[1], q[3], q[4], 2.24, 1.12, M.gCati, { axis: R ? 'x' : 'y', ov: .12, wall: TS, tex: 'rows', step: .15 });
  rf.G.courses({ rh: .22, bw: .4, dens: .35 }).shp('round', .56, .28, .38, .38, TA, 3, .04).shp('round', .6, .32, .3, .3, KR, 4, -.3);
  rf.G.line([[.75, .32], [.75, .62]], TA, 1, 5, .02).line([[.6, .47], [.9, .47]], TA, 1, 5, .02);
  art(1.5, .54, 3.36, ln(M.gDemir, 'M0 2V-13M-3 -6H3', 1.3) + pth(M.gDemir, 'M-1.6 -12.4L0 -17L1.6 -12.4Z'), .5);
  b.critter('guvercin', ...X(2.46, .24), 1.42, { col: '#26262c', flip: true });

  /* --- yalak ve oluk --- */
  box(.72, .42, 0, 2.28, 1.02, .07, KR, { edge: false });
  const y = box(.85, .42, .07, 2.15, .9, .4, TK, { edge: false });
  y.F.courses({ rh: .11, bw: .32, dens: .3 }).band(.27, .06, TA, .08).band(0, .05, KR, -.1);
  const p = BB(.91, .47, 0, 2.09, .85, 0);
  b.pool(p[0], p[1], p[3], p[4], .38, { col: SU });
  b.item(BB(1.45, .26, .6, 1.55, .58, .92), ln(M.gDemir, 'M' + K.PL([[...X(1.5, .26), .86], [...X(1.5, .5), .86], [...X(1.5, .54), .8]]), 2), { cast: false });
  b.fx('fall', ...X(1.5, .54), .8, { w: .08, h: .38 }).fx('glint', ...X(1.15, .72), .42);

  /* --- yaşam: kukuletalı su taşıyıcı, sekide toprak testi, kara kedi, kuzgunlar --- */
  b.fig(...X(2.4, 1.14), 0, { robe: true, body: '#4a4440', legs: '#2e2a28', hat: 'ortu', hatCol: '#34302e' });
  art(2.4, 1.14, 0, pth(T(M.gTasK, -.1), K.ell(5.4, -18, 2.4, 3) + 'M4.4 -23h2v2.4h-2z'), .9);
  art(2.6, .46, .24, pth(T(M.gPas, -.2), 'M-3 0Q-4.6 -4 -1.4 -6.4L-1.2 -9h2.4L1.4 -6.4Q4.6 -4 3 0Z') + pth(T(M.gPas, .14), 'M-2.6 -1Q-3.6 -4 -1.2 -6h1Q-2 -3.6 -1.2 -1Z'));
  b.fx('birds', ...X(2.7, .2), 1.42, { n: 2 });
  b.critter('kedi', ...X(.46, .48), .24, { col: '#2a2a2e' });

  b.tag(...X(1.5, 1.55), 0).doorAt(...X(1.5, 1.25));
});
