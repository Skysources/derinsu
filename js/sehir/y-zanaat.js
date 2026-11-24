/* Zanaathane — ağır taş zanaatkâr atölyesi: kesme taş iki kat, zemin katta iki sivri kemerli atölye gözü (biri açık ocaklı kapı),
   üstte kara ahşap çatkılı çıkma (cumba) ve kendi dik alınlığı; dik arduvaz çatı, yüksek taş baca. Aydınlık yanda taş merdiven,
   taş çömlek fırını ve çömlekçi avlusu; önde boyacı çardağı ve açık avluda aşçı kazanı, marangoz tezgâhı, kayık iskeleti.
   Tek ışık: ocaklı atölye kapısının ağzı (içeride ateş, dışarı taşan sıcak ışık).
   Ana cephe +x (gölge), alınlık duvarı +y (aydınlık). Parsel 7 × 7; arka (x=0) istinat duvarına yaslıdır. */
CK.def('zanaat', { w: 7, d: 7, name: 'Zanaathane' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, f1 = K.f1, pr = K.pr, P = K.P, PL = K.PL, kf = K.kf;
  const BAK = '#6a5040', KOK = M.gKanK, CIVIT = '#2a3048', KIL = '#6e5e50', BOYA = [M.gKan, M.gMor, CIVIT, M.gKemik, M.gYosun, M.gPas], SKIN = '#b89478';
  const RISE = 1.5, ZW = 2.2, ZTOP = ZW + RISE, SLP = RISE / 1.95, zRoof = x => ZTOP - Math.abs(x - 2.25) * SLP;
  // benek: yuvarlak uçlu kısa çizgi (daire yolundan çok hafif)
  const blobs = (col, pts, wid) => pts.length ? ln(col, pts.map(p => `M${f1(p[0])} ${f1(p[1])}h.1`).join(''), f1(wid)) : '';
  // yaprak öbeği: [x,y,z] noktaları → koyu taban, orta ton, ışık
  const foliage = (list, S, col, r) => { const d = [], m = [], l = [];
    for (const q of list) { const p = pr(q[0], q[1], q[2]); d.push(p); m.push([p[0] - S * .22, p[1] - S * .3]); if (r() < .3) l.push([p[0] - S * .5, p[1] - S * .62]); }
    return blobs(T(col, -.3), d, S * 2) + blobs(col, m, S * 1.3) + blobs(T(col, .2), l, S * .6); };
  // 3B çizgi demeti: tek parça
  const wire = (col, wid, segs, bb) => { const all = segs.flat(), mn = i => Math.min(...all.map(p => p[i])), mx = i => Math.max(...all.map(p => p[i]));
    b.item(bb || [mn(0) - .02, mn(1) - .02, mn(2), mx(0) + .02, mx(1) + .02, mx(2)], ln(col, segs.map(s => 'M' + PL(s)).join(''), wid), { cast: false }); };
  // çömlek sırası: (x0,y0)→(x1,y1) boyunca n çömlek; cols gövde renkleri, band: kuşak rengi (her ikincide)
  const potRow = (x0, y0, x1, y1, z, n, s, cols, band) => { const D = cols.map(() => ''); let sh = '', bd = '';
    for (let i = 0; i < n; i++) { const t = n > 1 ? i / (n - 1) : .5, [x, y] = pr(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, z), q = (a, c) => `${f1(x + a * s)} ${f1(y - c * s)}`;
      D[i % cols.length] += `M${q(-2.2, 0)}Q${q(-3.9, 3.2)} ${q(-1.5, 5.6)}L${q(-1.9, 6.7)}H${f1(x + 1.9 * s)}L${q(1.5, 5.6)}Q${q(3.9, 3.2)} ${q(2.2, 0)}Z`;
      sh += `M${q(.3, 0)}Q${q(1.4, 3.2)} ${q(.2, 6.7)}H${f1(x + 1.9 * s)}L${q(1.5, 5.6)}Q${q(3.9, 3.2)} ${q(2.2, 0)}Z`;
      if (band && i % 2 === 0) bd += `M${q(-2.9, 2.6)}H${f1(x + 2.9 * s)}M${q(-2.6, 4.2)}H${f1(x + 2.6 * s)}`; }
    b.item([Math.min(x0, x1) - .1, Math.min(y0, y1) - .1, z, Math.max(x0, x1) + .1, Math.max(y0, y1) + .1, z + .3 * s], D.map((d, k) => pth(cols[k], d)).join('') + (bd ? ln(band, bd, f1(.9 * s)) : '') + pth('#1a1210', sh, 'opacity=".3"'), { cast: false }); };

  /* --- zemin: kara taş döşeli ön avlu, sıkışmış toprak çömlekçi avlusu, lekeler; kapıdan taşan ışık --- */
  b.pave(0, 0, 7, 7, M.gTasK);
  b.gpoly([[0, 4.25], [4.25, 4.25], [4.6, 4.8], [5.45, 5.1], [5.6, 7], [0, 7]], '#5e554a');
  let dz = ''; for (let x = 4.9; x < 7; x += .7) dz += `M${P(x, 0)} ${P(x, x < 5.5 ? 4.3 : 7)}`;
  for (let y = .5, k = 0; y < 7; y += .5, k++) for (let x = 4.2 + (k % 2) * .7; x < 6.9; x += 1.4) if (y < 4.3 || x >= 5.6) dz += `M${P(x, y)} ${P(x + .7, y)}`;
  b.ground(ln(T(M.gTasK, -.16), dz, .7));
  b.gpoly([[2.0, 5.7], [2.9, 5.6], [3.0, 6.3], [2.5, 6.6], [2.0, 6.5]], '#3a3632', { op: .6 });                       // fırın ağzında kül
  b.gpoly([[3.1, 5.6], [4.0, 5.5], [4.2, 6.1], [3.7, 6.4], [3.1, 6.2]], KIL, { op: .5 });                             // çark çevresinde kil çamuru
  b.gpoly([[5.75, .45], [5.95, .4], [5.95, 1.9], [6.7, 1.9], [6.75, 2.1], [5.8, 2.15]], M.gKanK, { op: .45 });        // boya sızıntısı
  b.gpoly([[6.66, 1.1], [6.86, 1.05], [6.9, 1.75], [6.66, 1.8]], CIVIT, { op: .5 });
  b.gpoly([[6.5, 3.6], [6.95, 3.7], [6.9, 4.7], [6.55, 4.85]], '#8a7e66', { op: .5 });                                // talaş
  b.spill(4.95, 2.8, 2.0);

  /* --- zemin kat: kesme taş; +x cephesinde iki sivri kemerli atölye gözü --- */
  const g = b.box(.3, .3, 0, 4.2, 4.2, 1.25, M.gTas);
  g.R.courses({ rh: .26, bw: .6, dens: .6 }).stones(6, { rh: .26, dt: .06 }).band(0, .26, M.gKara, 0);
  g.L.courses({ rh: .26, bw: .6, dens: .65 }).stones(9, { rh: .26, dt: .06 }).band(0, .26, M.gKara, 0);
  // ocaklı göz = atölyenin kapısı (cumbanın altında): içi koyu, derinde ateş, ağzından sıcak ışık taşar
  g.R.arcade(.5, 2.3, 1, 1.08, { kind: 'point', pier: .15, th: .45, glow: true, floor: '#3a3430' });
  g.R.put(5.05, '', g.R.shapeD('point', .65, 0, 1.5, 1.08, -.43), 'fill="#2a170f"').put(5.1, '', g.R.shapeD('round', .55, -.2, 1.7, 1.2, -.42), `fill="url(#${K.glowId()})"`);
  g.R.arcade(2.5, 3.8, 1, .98, { kind: 'point', pier: .12, th: .45, floor: '#3a3430' });                               // raflı göz (çardağın ardında, sönük)
  // ocak: taş seki, kor, yaşmak, asılı bakırlar
  g.R.poly([[.95, 0, -.2], [1.95, 0, -.2], [1.95, .22, -.2], [.95, .22, -.2]], M.gTasK, 5.2, -.15).poly([[.95, .22, -.2], [1.95, .22, -.2], [1.95, .22, -.44], [.95, .22, -.44]], M.gKara, 5.3, .1);
  g.R.poly([[1.1, .62, -.42], [1.82, .62, -.42], [1.68, .92, -.42], [1.24, .92, -.42]], M.gSiva, 5.2, -.3);
  g.R.put(5.4, kf(M.gKor), g.R.shapeD('round', 1.16, .2, .6, .2, -.33));
  [[.78, .64], [.9, .54]].forEach(([a, bb]) => g.R.dot(a, bb, 2.2, BAK, 5.6, .2, -.42));
  b.fx('fire', 3.88, 2.75, .26, { s: .6 });
  // raflar: sönük sırlı kaplar
  [.3, .54].forEach(bb => g.R.line([[2.68, bb, -.42], [3.62, bb, -.42]], M.gAhsap, 1.3, 5.2, .1));
  [[2.78, .35, M.gYosun], [3.0, .35, M.gPas], [3.24, .35, M.gKemik], [3.46, .35, '#3e4450'], [2.86, .59, M.gKemik], [3.12, .59, M.gYosun], [3.38, .59, M.gPas]].forEach(([a, bb, c]) => g.R.dot(a, bb, 2.1, c, 5.6, 0, -.42));

  /* --- aydınlık yan duvar: alet askısı, kavanoz rafı --- */
  g.L.rect(2.74, 1.06, 1.1, .04, M.gAhsapK, 5);
  g.L.line([[2.84, 1.06], [2.84, .78]], M.gAhsapA, 1.2, 6).rect(2.77, .72, .14, .09, M.gDemir, 6.1, .2);                // çekiç
  g.L.line([[3.02, 1.06], [3.0, .76]], M.gDemir, 1, 6, .2).line([[3.08, 1.06], [3.11, .76]], M.gDemir, 1, 6, .2);     // maşa
  g.L.poly([[3.24, 1.04], [3.44, 1.04], [3.4, .8], [3.28, .8]], '#8a9098', 6, -.1).rect(3.26, 1.02, .16, .05, M.gAhsap, 6.1);   // testere
  g.L.shp('round', 3.56, .78, .24, .24, M.gAhsap, 6).shp('round', 3.6, .82, .16, .16, M.gTas, 6.1, -.12);            // elek
  g.L.rect(2.74, .54, 1.1, .045, M.gAhsapK, 5);
  [[2.8, M.gKanK], [2.96, '#6a5a3a'], [3.12, '#4a5a4a'], [3.32, M.gPas], [3.48, M.gKemik], [3.66, '#3e4450']].forEach(([a, c], i) => g.L.rect(a, .585, .11, .13 + (i % 2) * .03, c, 6).rect(a - .01, .715 + (i % 2) * .03, .13, .03, M.gAhsapK, 6.1));
  b.box(3.1, 4.24, 0, 3.17, 4.6, .3, M.gAhsap, { edge: false, cast: false }); b.box(4.03, 4.24, 0, 4.1, 4.6, .3, M.gAhsap, { edge: false, cast: false });
  b.slab(3.02, 4.2, 4.18, 4.64, .36, .06, M.gAhsapA).L.planks({ step: .29 });
  b.art(3.6, 4.44, .36, pth(M.gKanK, 'M-13 -2h3.4v-5h-3.4z') + pth('#6a5a3a', 'M-8 -1h3.4v-6h-3.4z') + pth('#4a5a4a', 'M-2.6 1h3.6v-5.4h-3.6z') + pth('#1a1210', 'M-13.3 -7h4v-1.2h-4zM-8.3 -7h4v-1.2h-4zM-2.9 -4.4h4.2v-1.2h-4.2z')
    + pth(T(M.gAhsap, -.1), 'M4 3l.8 -5.6h6l.8 5.6q-3.8 1.6 -7.6 0z') + pth('#3e4450', K.ell(7.8, -2.6, 3, 1.1)) + ln('#2a2420', 'M4.8 -2.6q3 -6 6 0', .7), { bb: [3.05, 4.24, .36, 4.15, 4.6, .62] });

  /* --- üst kat: kesme taş, silme, dar sivri pencereler (sönük) --- */
  const u = b.box(.3, .3, 1.25, 4.2, 4.2, ZW, M.gTas);
  u.R.courses({ rh: .26, bw: .6, dens: .5 }).band(0, .08, M.gTasA, .08, 3).shadeTop(.24, -.2);
  u.R.win(2.62, .14, .26, .62, { kind: 'point', sove: M.gTasA, frame: M.gDemir, bars: [1, 2], lit: false }).win(3.4, .14, .26, .62, { kind: 'point', sove: M.gTasA, frame: M.gDemir, bars: [1, 2], lit: false });
  u.L.courses({ rh: .26, bw: .6, dens: .5 }).band(0, .08, M.gTasA, .08, 3).shadeTop(.12, -.2);
  u.L.door(.24, .58, .82, { kind: 'point', col: M.gAhsapK, sove: M.gTasA });
  u.L.win(1.6, .2, .28, .62, { kind: 'point', sove: M.gTasA, frame: M.gDemir, bars: [1, 2], lit: false }).win(2.74, .2, .28, .62, { kind: 'point', sove: M.gTasA, frame: M.gDemir, bars: [1, 2], lit: false });
  // aydınlık köşede payanda
  { const x = 4.02, y = 4.2, w = .3, out = .32, z1 = 1.7, zt = z1 + .38, p = b.box(x - w / 2, y, 0, x + w / 2, y + out, z1, M.gTas, { edge: false });
    p.L.courses({ rh: .26, bw: .4, dens: .6 }).band(0, .26, M.gKara, 0); p.R.courses({ rh: .26, bw: .4, dens: .5 }).band(0, .26, M.gKara, 0);
    b.poly3([[x - w / 2, y, zt], [x + w / 2, y, zt], [x + w / 2, y + out, z1], [x - w / 2, y + out, z1]], M.gTasA, { n: [0, .38, out], bb: [x - w / 2, y, z1, x + w / 2, y + out, zt] });
    b.poly3([[x + w / 2, y + out, z1], [x + w / 2, y, zt], [x + w / 2, y, z1]], M.gTas, { n: [1, 0, 0], bb: [x + w / 2 - .01, y, z1, x + w / 2, y + out, zt] }); }

  /* --- cumba: kara ahşap payandalar üstünde çıkma, kendi dik alınlığıyla --- */
  wire(T(M.gAhsapK, -.1), 2.2, [3.64, 1.96].map(y => [[4.2, y, .84], [4.56, y, 1.23]]), [4.2, 1.9, .84, 4.6, 3.7, 1.25]);
  const c = b.box(4.2, 1.9, 1.25, 4.6, 3.7, ZW, M.gSiva);
  c.R.timber({ col: M.gAhsapK, posts: [.04, .9, 1.76], rails: [.04, .88], braces: [[.04, .04, .4, .5], [1.76, .04, 1.4, .5]], wid: 2.4 }).shadeTop(.1, -.2);
  c.R.win(.36, .26, .26, .56, { kind: 'point', frame: M.gAhsapK, bars: [1, 2], lit: false }).win(1.18, .26, .26, .56, { kind: 'point', frame: M.gAhsapK, bars: [1, 2], lit: false, kafes: true });
  c.L.timber({ col: M.gAhsapK, posts: [.03, .37], rails: [.04, .88], wid: 2.2 }).win(.12, .3, .16, .48, { kind: 'point', frame: M.gAhsapK, lit: false, bars: [1, 2] });
  for (let a = .15; a < 1.8; a += .3) c.R.dot(a, .04, 1, M.gAhsap, 4, .1);                                             // kiriş uçları

  /* --- çatı: dik arduvaz, mahya sokağa koşut; alınlık duvarı aydınlık yanda --- */
  const roof = b.gable(.3, .3, 4.2, 4.2, ZW, RISE, M.gCati, { axis: 'y', ov: .2, wall: M.gTas, tex: 'rows', step: .17 });
  roof.G.courses({ rh: .26, bw: .6, dens: .5 });
  roof.G.win(1.8, .2, .3, .78, { kind: 'point', sove: M.gTasA, frame: M.gDemir, lit: false, sill: false, bars: [1, 3] });
  roof.A.rect(1.4, 1.0, .44, .16, M.gCatiA, 2.3, -.06).rect(.5, .5, .3, .14, M.gCatiK, 2.3, -.1);
  b.line3([[2.25, 4.4, ZTOP], [2.25, 4.4, ZTOP + .42]], M.gDemir, 1.5).line3([[2.25, .1, ZTOP], [2.25, .1, ZTOP + .34]], M.gDemir, 1.3);
  // cumbanın çapraz beşiği: mahyası ana yamaca saplanır, yamaçlar dere çizgisinde kırpılır
  { const yc = 2.8, hw = .9, zw = ZW, zr = ZW + .95, ze = 2.12, ext = hw + (zw - ze) * hw / (zr - zw), X1 = 4.76, xr = 2.25 + (ZTOP - zr) / SLP, xe = Math.min(4.4, 2.25 + (ZTOP - ze) / SLP), W = X1 - xr, len = Math.hypot(ext, zr - ze), th = .07, tR = K.toneOf([1, 0, 0]) - .06;
    const A = new K.Face([xr, yc + ext, ze], [1, 0, 0], K.unit([0, -ext, zr - ze]), W, len, K.unit([0, zr - ze, ext]), [[xe - xr, 0], [W, 0], [W, len], [0, len]]); A.fill(M.gCatiK); A.rows({ step: .15 });
    const Bk = new K.Face([xr, yc, zr], [1, 0, 0], K.unit([0, -ext, ze - zr]), W, len, K.unit([0, ze - zr, ext]), [[0, 0], [W, 0], [W, len], [xe - xr, len]]); Bk.fill(M.gCatiK);
    const bVis = K.dot(Bk.n, K.VIEW) > .02;
    const G = new K.Face([4.6, yc + hw, zw], [0, -1, 0], [0, 0, 1], 2 * hw, zr - zw, [1, 0, 0], [[0, 0], [2 * hw, 0], [hw, zr - zw]]); G.fill(M.gSiva);
    G.timber({ col: M.gAhsapK, posts: [hw], rails: [.04], braces: [[hw, .06, .4, .2], [hw, .06, 2 * hw - .4, .2]], wid: 2.2 }).shp('point', hw - .1, .14, .2, .42, M.gAhsapK, 4).shp('point', hw - .06, .18, .12, .34, M.gCam, 5);
    const st = (pts, t) => pth(T(M.gCatiK, t), 'M' + PL(pts) + 'Z');
    b.item([xr, yc - ext, ze - th, X1, yc + ext, zr], () => (bVis ? Bk.svg() : '') + G.svg() + st([[X1, yc, zr], [X1, yc - ext, ze], [X1, yc - ext, ze - th], [X1, yc, zr - th]], tR) + A.svg()
      + st([[X1, yc + ext, ze], [X1, yc, zr], [X1, yc, zr - th], [X1, yc + ext, ze - th]], tR) + st([[xe, yc + ext, ze], [X1, yc + ext, ze], [X1, yc + ext, ze - th], [xe, yc + ext, ze - th]], K.toneOf([0, 1, 0]) - .2)
      + ln(T(M.gCatiK, -.34), `M${P(xr, yc, zr)} ${P(xe, yc + ext, ze)}`, 1.2) + ln(T(M.gCatiK, .3), `M${P(xr, yc, zr)} ${P(X1, yc, zr)}`, 2)
      + ln(M.gDemir, `M${P(X1, yc, zr)} ${P(X1, yc, zr + .34)}`, 1.3),
      { pts: [[xr, yc, zr], [X1, yc, zr], [X1, yc + ext, ze], [X1, yc - ext, ze], [xe, yc + ext, ze], [xe, yc - ext, ze]] }); }
  // yüksek taş baca
  { const zb = zRoof(1.15) - .1; b.chimney(1.15, 1.1, zb, ZTOP + .7 - zb, { mat: M.gTasK, w: .42, s: .8 }).L.courses({ rh: .2, bw: .3, dens: .8 }); }
  b.critter('guvercin', 2.25, 3.3, ZTOP, { col: '#26262a' }).critter('guvercin', 2.25, 2.0, ZTOP, { col: '#26262a', flip: true }).critter('kedi', 3.3, 1.2, zRoof(3.3) - .1, { col: '#2e2c2c' });

  /* --- tabela: köşe ayağında demir kolda asılı kara levha, üstünde kemik rengi testi --- */
  wire(M.gDemir, 1.4, [[[4.2, 4.0, 1.2], [4.84, 4.0, 1.2]], [[4.2, 4.0, .98], [4.5, 4.0, 1.2]], [[4.36, 4.0, 1.2], [4.36, 4.0, 1.14]], [[4.7, 4.0, 1.2], [4.7, 4.0, 1.14]]]);
  const sg = new K.Face([4.28, 4.0, .7], [1, 0, 0], [0, 0, 1], .5, .44, [0, 1, 0]); sg.fill(M.gDemir);
  sg.rect(.035, .035, .43, .37, M.gAhsapK, 4).shp('round', .15, .08, .2, .18, M.gKemik, 5).rect(.21, .25, .08, .06, M.gKemik, 5).rect(.19, .3, .12, .03, M.gKemik, 5);
  b.item([4.28, 3.98, .7, 4.78, 4.02, 1.14], () => sg.svg(), { cast: false });

  /* --- taş merdiven: üst kat kapısına çıkar --- */
  const lb = b.box(.3, 4.2, 0, 1.1, 4.85, 1.25, M.gTas, { edge: false }); lb.L.courses({ rh: .26, bw: .5, dens: .7 }); lb.R.courses({ rh: .26, bw: .5, dens: .7 });
  b.stairs(1.1, 4.2, 3.0, 4.85, 1.25, 0, 'x', M.gTas);
  const sf = new K.Face([1.1, 4.85, 0], [1, 0, 0], [0, 0, 1], 1.9, 1.25, [0, 1, 0], [[0, 0], [1.8, 0], [0, 1.18]]); sf.mc = M.gTas; sf.courses({ rh: .26, bw: .5, dens: .7 });
  b.item([1.1, 4.85, 0, 3.0, 4.87, 1.25], () => sf.svg(), { cast: false });
  wire(M.gDemir, 1.1, [[[.34, 4.83, 1.63], [1.1, 4.83, 1.63], [3.0, 4.83, .59]], [[.34, 4.83, 1.25], [.34, 4.83, 1.63]], [[1.1, 4.83, 1.25], [1.1, 4.83, 1.63]], [[2.05, 4.83, .62], [2.05, 4.83, 1.11]], [[3.0, 4.83, 0], [3.0, 4.83, .59]]], [.3, 4.82, 1.25, 3.02, 4.87, 1.65]);
  b.critter('kedi', 2.7, 4.5, .21, { col: '#2e2c2c' });

  /* --- çömlek fırını: yuvarlak taş gövde, basık kubbe, yüksek baca (soğuk: ağzı kararmış) --- */
  b.tree('selvi', .45, 6.72, { s: .8 });
  const kc = b.cyl(1.25, 6.0, .78, 0, .88, M.gTasK); kc.courses(.15).band(.82, .09, M.gKara, .035);
  const km = kc.face(.45, 0, .6, .7); km.shp('point', .03, 0, .54, .66, M.gTasA, 3, .06).shp('point', .12, 0, .36, .52, '#1a1210', 4, null).shp('round', .16, .01, .28, .12, '#3a2418', 5, null);
  b.dome(1.25, 6.0, .75, .93, M.gTasK, { hf: .62, alem: false, seams: false });
  const kb = b.cyl(1.25, 6.0, .17, 1.3, 2.7, M.gTasK, { top: '#1a1614' }); kb.courses(.13).band(2.6, .1, M.gKara, .03, false);
  b.fx('smoke', 1.25, 6.0, 2.74, { s: .9 });
  b.woodpile(2.2, 6.5, 0, { w: .55 });
  // pişmiş çömlek yığını
  potRow(1.95, 5.08, 2.65, 5.08, 0, 4, 1.25, [KIL, '#5a4a3e', T(KIL, -.1)]);
  potRow(2.1, 5.3, 2.8, 5.3, 0, 4, 1.15, [M.gKemik, KIL, '#4a4a44', M.gKemik], M.gDemir);

  /* --- çömlekçi: çark başında usta, kalasta kuruyan çömlekler --- */
  b.fig(3.3, 5.72, 0, { body: '#5a5246', legs: '#2e2824', hat: 'none', skin: SKIN });
  b.cyl(3.58, 6.0, .21, 0, .2, M.gAhsapK, { top: M.gTasK, cast: false });
  b.art(3.58, 6.0, .2, pth(T(KIL, -.2), 'M-3 0Q-5 -4 -2.2 -7.6L-2.8 -9H2.8L2.2 -7.6Q5 -4 3 0Z') + pth(T(KIL, .15), 'M-3 0Q-5 -4 -2.2 -7.6L-2.8 -9H0Q-1.6 -4 -.6 0Z') + ln(SKIN, 'M-4.4 -9.6L-2.6 -6.4M4.2 -10L2.6 -6.6', 1.5), { bb: [3.48, 5.9, .2, 3.68, 6.1, .55] });
  b.box(3.12, 6.5, 0, 3.2, 6.66, .2, M.gAhsap, { edge: false, cast: false }); b.box(4.6, 6.5, 0, 4.68, 6.66, .2, M.gAhsap, { edge: false, cast: false });
  b.slab(2.95, 6.45, 4.85, 6.7, .25, .05, M.gAhsapA);
  potRow(3.08, 6.57, 4.72, 6.57, .25, 8, .95, [KIL, M.gKemik, KIL, T(KIL, .15)]);
  b.barrel(4.3, 5.6, 0, { r: .17, h: .3, col: M.gAhsap, top: '#22262a' });
  b.art(3.95, 5.05, 0, `<ellipse cx="1" cy="0" rx="8.4" ry="2.6" fill="#04060a" opacity=".3"/>` + pth('#4a4036', 'M-6 -1Q-7 -6 -1 -6.4Q6 -6.6 7 -2Q7 .6 3 1H-4Q-6 1 -6 -1Z') + pth('#5a4e42', 'M-8.6 -1.6Q-8.8 -4.6 -5.6 -4.8Q-3.2 -4.6 -3.4 -2Q-3.6 .6 -6.4 .6Q-8.4 .4 -8.6 -1.6Z') + pth('#2e2620', 'M-5.4 -4.9l1.9 .3l-.6 2.6l-1.6 -.6z') + ln('#2e2620', 'M7 -2Q9.4 -1 7 .8', 1.3), { r: .25 });   // uyuyan kara köpek
  // çırak: omzunda kalas
  b.fig(5.25, 6.2, 0, { body: '#3e4248', legs: '#2a2624', hat: 'none', step: 1, skin: SKIN });
  b.art(5.25, 6.2, 0, ln(M.gAhsapA, 'M-13 -12.5L13 -19.5', 2.6) + ln(T(M.gAhsapA, -.3), 'M-13 -11.2L13 -18.2', .8), { bb: [5.12, 6.08, 0, 5.42, 6.36, .95] });
  // cila çarkı: ayaklı bileği taşı (döner)
  b.box(4.52, 4.74, 0, 5.0, 4.86, .12, M.gAhsap, { edge: false, cast: false });
  wire(M.gAhsapK, 1.6, [[[4.56, 4.8, .12], [4.76, 4.8, .46], [4.96, 4.8, .12]]]);
  b.fx('wheel', 4.76, 4.9, .44, { r: .2, axis: 'y', kind: 'tekerlek', col: M.gTas });

  /* --- boyacı çardağı: kuru sarmaşık altında kirişe asılı boyalı çileler; önünde kök boya ve çivit tekneleri --- */
  [1.8, .42].forEach(y => b.box(5.35, y - .06, 0, 5.47, y + .06, 1.1, M.gAhsapK, { edge: false }));
  b.box(5.33, .25, 1.1, 5.49, 1.97, 1.18, M.gAhsapK, { edge: false });
  const mer = []; for (let y = .42; y < 1.9; y += .345) mer.push([[4.2, y, 1.2], [5.64, y, 1.2]]);
  wire(M.gAhsapK, 1.5, mer, [4.2, .3, 1.18, 5.64, 1.95, 1.22]);
  const fr = K.rng(41), fol = [];
  for (let y = .26; y < 2.0; y += .16) fol.push([5.42 + (fr() - .5) * .4, y, 1.23 + fr() * .1]);
  for (let i = 0; i < 8; i++) fol.push([4.7 + fr() * .5, .3 + fr() * 1.6, 1.22 + fr() * .05]);
  fol.sort((p, q) => p[0] + p[1] - q[0] - q[1]);
  b.item([4.66, .25, 1.22, 5.64, 2.0, 1.45], ln('#3a2e24', `M${P(5.5, 1.8, 0)}Q${P(5.56, 1.9, .5)} ${P(5.48, 1.78, 1.16)}`, 1.3) + foliage(fol, 2.8, M.gYosun, fr), { pts: [[5.2, .3, 1.2], [5.62, .3, 1.2], [5.62, 1.95, 1.2], [5.2, 1.95, 1.2]] });
  const rk = new K.Face([5.5, 1.8, 0], [0, -1, 0], [0, 0, 1], 1.4, 1.1, [1, 0, 0]);
  BOYA.forEach((cl, i) => { const a = .19 + i * .2; rk.line([[a, .5], [a, 1.02]], cl, 4.4, 5, .1).line([[a + .02, .56], [a + .02, .96]], cl, 1.2, 5.1, -.1).line([[a - .09, .8], [a + .09, .8]], M.gKemik, 1.2, 5.2, 0); });
  b.item([5.5, .4, .4, 5.56, 1.8, 1.1], () => rk.svg(), { cast: false });
  b.clothes(5.62, .22, 6.92, .22, 1.02, { cols: [M.gKan, CIVIT, M.gMor, M.gKul, M.gKanK] });
  wire(M.gAhsapK, 1.6, [[[5.62, .22, 0], [5.62, .22, 1.04]], [[6.92, .22, 0], [6.92, .22, 1.04]]]);
  const tk = b.box(5.95, .5, 0, 6.65, 1.8, .3, M.gTasK, { edge: false }); tk.L.courses({ rh: .15, bw: .4, dens: .8 }); tk.R.courses({ rh: .15, bw: .4, dens: .8 });
  b.pool(6.03, .58, 6.57, 1.1, .3, { col: KOK }).pool(6.03, 1.2, 6.57, 1.72, .3, { col: CIVIT });
  b.line3([[6.3, .9, .3], [6.52, .62, .98]], M.gAhsapA, 1.5);
  b.sack(5.82, 2.3, 0, { col: '#5e5446' });

  /* --- aşçı kazanı: üç ayakta asılı kazan, altında sönmüş kül (buharı tüter) --- */
  b.fig(5.98, 2.95, 0, { body: '#4a4640', robe: true, hat: 'ortu', hatCol: '#2a2624', skin: SKIN });
  wire(M.gDemir, 1.3, [[[6.06, 2.58, 0], [6.36, 2.76, .98]], [[6.64, 2.54, 0], [6.36, 2.76, .98]], [[6.4, 3.12, 0], [6.36, 2.76, .98]], [[6.36, 2.76, .98], [6.36, 2.76, .56]]]);
  b.art(6.36, 2.76, 0, pth('#2a2420', K.ell(0, 0, 5.4, 1.8)) + ln(M.gAhsapK, 'M-6 1L5 -1M-5 -1.6L6 1.4', 1.8) + pth(T(BAK, -.28), 'M-6.4 -15Q-7.4 -6.4 0 -6Q7.4 -6.4 6.4 -15Z') + pth(BAK, 'M-6.4 -15Q-7.4 -6.4 0 -6Q-2.6 -10 -2 -15Z') + pth(T(BAK, .25), K.ell(0, -15, 6.6, 2.3)) + pth('#4a4234', K.ell(0, -15, 5, 1.5)) + ln(M.gAhsapA, 'M-9.4 -19.6L-1 -15', 1.1), { bb: [6.2, 2.6, 0, 6.52, 2.92, .6] });
  b.fx('steam', 6.36, 2.76, .56, { s: .7 });

  /* --- marangoz: tezgâh, rende, testere, talaş; yanında kayık iskeleti --- */
  b.fig(5.74, 4.18, 0, { body: '#4e5048', legs: '#2a2624', hair: '#4a4640', skin: SKIN });
  b.art(5.74, 4.18, 0, pth('#3e2c22', 'M-2.6 -14.6h5.2l.6 7.4h-6.4z'), { bb: [5.62, 4.06, 0, 5.88, 4.32, .9] });
  b.box(5.94, 3.66, 0, 6.46, 3.76, .29, M.gAhsap, { edge: false, cast: false }); b.box(5.94, 4.64, 0, 6.46, 4.74, .29, M.gAhsap, { edge: false, cast: false });
  b.slab(5.88, 3.58, 6.52, 4.82, .36, .07, M.gAhsapA).T.planks({ dir: 'v', step: .21 });
  b.slab(6.02, 3.74, 6.26, 4.62, .4, .04, '#7a6a52');
  b.art(6.14, 4.3, .4, pth(M.gAhsapK, 'M-4 -1l5 2.4l3.6 -1.8v-2.4l-5 -2.4l-3.6 1.8z') + pth(T(M.gAhsapA, .1), 'M-4 -3.4l5 2.4l3.6 -1.8l-5 -2.4z') + ln(M.gAhsapK, 'M1 -3.4v-2.6', 1.6), { bb: [6.04, 4.2, .4, 6.24, 4.4, .6] });   // rende
  b.art(6.4, 3.84, .36, ln(M.gAhsap, 'M-5 -2.4L4 2M-5 -7.4L4 -3M-.6 -5.2V-.2', 1.3) + ln('#8a9098', 'M-5 -2.4L4 2', .8), { bb: [6.3, 3.76, .36, 6.5, 3.96, .6] });   // çerçeve testere
  b.art(6.74, 4.2, 0, ln('#8a7e66', 'M-4 0q2 -2.4 0 -3.4q-2.2 1 -.8 2.4M2 2q2.4 -1.8 .6 -3.2q-2.2 .6 -1.2 2.2M-1 5q2 -2 .2 -3q-2 .8 -.8 2M5 -3q1.8 -1.6 .2 -2.6', 1), { r: .25, h: .1 });   // talaş kıvrımları
  // kayık iskeleti: omurga, postalar, baş ve kıç bodoslaması
  b.box(6.2, 5.48, 0, 6.72, 5.56, .26, M.gAhsap, { edge: false, cast: false }); b.box(6.2, 6.26, 0, 6.72, 6.34, .26, M.gAhsap, { edge: false, cast: false });
  const rib = [], shL = [], shR = [];
  [[5.42, .15], [5.62, .25], [5.85, .31], [6.1, .3], [6.33, .22], [6.5, .13]].forEach(([y, w]) => { const s = []; for (let k = -4; k <= 4; k++) { const a = k / 4 * 1.45; s.push([6.46 + w * Math.sin(a), y, .3 + .34 * (1 - Math.cos(a)) / (1 - Math.cos(1.45))]); } rib.push(s); shL.push(s[0]); shR.push(s[8]); });
  wire(M.gAhsapK, 2.2, [[[6.46, 5.2, .52], [6.46, 5.3, .3], [6.46, 6.56, .3], [6.46, 6.66, .62]]], [6.44, 5.18, .26, 6.48, 6.68, .3]);
  wire(M.gAhsapA, 1.4, rib.concat([[[6.46, 5.2, .56]].concat(shR, [[6.46, 6.66, .64]]), [[6.46, 5.2, .56]].concat(shL, [[6.46, 6.66, .64]])]), [6.12, 5.18, .3, 6.8, 6.68, .68]);

  b.tag(6.5, 6.9, 0).doorAt(4.75, 2.95);
});
