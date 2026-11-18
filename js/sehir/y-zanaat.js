/* Zanaathane — hımış zanaatkâr evi: taş zemin katta iki basık kemerli atölye gözü, üstte ahşap çatkılı kat ve
   eli böğründelere oturan alınlıklı cumba, geniş saçaklı kiremit çatı. Aydınlık yanda taş merdiven, tuğla çömlek
   fırını ve çömlekçi avlusu; önde asmalı boyacı çardağı ve açık avluda aşçı kazanı, marangoz tezgâhı, kayık iskeleti.
   Ana cephe +x (gölge), alınlık duvarı +y (aydınlık). Parsel 7 × 7; arka (x=0) istinat duvarına yaslıdır. */
CK.def('zanaat', { w: 7, d: 7, name: 'Zanaathane' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, f1 = K.f1, pr = K.pr, P = K.P, PL = K.PL, kf = K.kf;
  const TUGLA = '#b9694a', BAKIR = '#b8703a', KOK = '#a8323a', CIVIT = '#2c4580', KIL = '#b59a80', YESIL = '#4c7a5c', BOYA = [KOK, M.bezS, CIVIT, '#efe3c8', '#4f8a5a', '#7d4a94'];
  // benek: yuvarlak uçlu kısa çizgi (daire yolundan çok hafif)
  const blobs = (col, pts, wid) => pts.length ? ln(col, pts.map(p => `M${f1(p[0])} ${f1(p[1])}h.1`).join(''), f1(wid)) : '';
  // yaprak öbeği: [x,y,z] noktaları → koyu taban, orta ton, ışık, çiçek
  const foliage = (list, S, col, fl, r) => { const d = [], m = [], l = [], f = [];
    for (const q of list) { const p = pr(q[0], q[1], q[2]); d.push(p); m.push([p[0] - S * .22, p[1] - S * .3]); if (r() < .45) l.push([p[0] - S * .5, p[1] - S * .62]); if (fl && r() < .55) f.push([p[0] + (r() - .4) * S, p[1] + S * .3]); }
    return blobs(T(col, -.26), d, S * 2) + blobs(col, m, S * 1.35) + blobs(T(col, .3), l, S * .6) + (fl ? blobs(fl, f, S * .8) : ''); };
  // 3B çizgi demeti: tek parça
  const wire = (col, wid, segs, bb) => { const all = segs.flat(), mn = i => Math.min(...all.map(p => p[i])), mx = i => Math.max(...all.map(p => p[i]));
    b.item(bb || [mn(0) - .02, mn(1) - .02, mn(2), mx(0) + .02, mx(1) + .02, mx(2)], ln(col, segs.map(s => 'M' + PL(s)).join(''), wid), { cast: false }); };
  // çömlek sırası: (x0,y0)→(x1,y1) boyunca n çömlek; cols gövde renkleri, band: kuşak rengi (her ikincide)
  const potRow = (x0, y0, x1, y1, z, n, s, cols, band) => { const D = cols.map(() => ''); let sh = '', bd = '';
    for (let i = 0; i < n; i++) { const t = n > 1 ? i / (n - 1) : .5, [x, y] = pr(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, z), q = (a, c) => `${f1(x + a * s)} ${f1(y - c * s)}`;
      D[i % cols.length] += `M${q(-2.2, 0)}Q${q(-3.9, 3.2)} ${q(-1.5, 5.6)}L${q(-1.9, 6.7)}H${f1(x + 1.9 * s)}L${q(1.5, 5.6)}Q${q(3.9, 3.2)} ${q(2.2, 0)}Z`;
      sh += `M${q(.3, 0)}Q${q(1.4, 3.2)} ${q(.2, 6.7)}H${f1(x + 1.9 * s)}L${q(1.5, 5.6)}Q${q(3.9, 3.2)} ${q(2.2, 0)}Z`;
      if (band && i % 2 === 0) bd += `M${q(-2.9, 2.6)}H${f1(x + 2.9 * s)}M${q(-2.6, 4.2)}H${f1(x + 2.6 * s)}`; }
    b.item([Math.min(x0, x1) - .1, Math.min(y0, y1) - .1, z, Math.max(x0, x1) + .1, Math.max(y0, y1) + .1, z + .3 * s], D.map((d, k) => pth(cols[k], d)).join('') + (bd ? ln(band, bd, f1(.9 * s)) : '') + pth('#3a2418', sh, 'opacity=".24"'), { cast: false }); };

  /* --- zemin: taş döşeli ön avlu, sıkışmış toprak çömlekçi avlusu, lekeler --- */
  b.pave(0, 0, 7, 7, M.parke);
  b.gpoly([[0, 4.25], [4.25, 4.25], [4.6, 4.8], [5.45, 5.1], [5.6, 7], [0, 7]], '#cdb489');
  let dz = ''; for (let x = 4.9; x < 7; x += .7) dz += `M${P(x, 0)} ${P(x, x < 5.5 ? 4.3 : 7)}`;
  for (let y = .5, k = 0; y < 7; y += .5, k++) for (let x = 4.2 + (k % 2) * .7; x < 6.9; x += 1.4) if (y < 4.3 || x >= 5.6) dz += `M${P(x, y)} ${P(x + .7, y)}`;
  b.ground(ln(T(M.parke, -.12), dz, .7));
  b.gpoly([[2.0, 5.7], [2.9, 5.6], [3.0, 6.3], [2.5, 6.6], [2.0, 6.5]], '#8f8474', { op: .6 });                       // fırın ağzında kül
  b.gpoly([[3.1, 5.6], [4.0, 5.5], [4.2, 6.1], [3.7, 6.4], [3.1, 6.2]], KIL, { op: .5 });                             // çark çevresinde kil çamuru
  b.gpoly([[5.75, .45], [5.95, .4], [5.95, 1.9], [6.7, 1.9], [6.75, 2.1], [5.8, 2.15]], '#b98a84', { op: .55 });      // boya sızıntısı
  b.gpoly([[6.66, 1.1], [6.86, 1.05], [6.9, 1.75], [6.66, 1.8]], '#8a93b4', { op: .6 });
  b.gpoly([[6.5, 3.6], [6.95, 3.7], [6.9, 4.7], [6.55, 4.85]], '#ead9ae', { op: .7 });                                // talaş
  b.spill(5.0, 3.0, 2.2).spill(2.6, 6.1, 1.5).spill(6.36, 2.76, 1.2);

  /* --- zemin kat: kesme taş; +x cephesinde iki basık kemerli atölye gözü --- */
  const g = b.box(.3, .3, 0, 4.2, 4.2, 1.25, M.tas);
  g.R.courses({ rh: .26, bw: .6, dens: .6 }).stones(6, { rh: .26 }).band(0, .2, M.tasK, .02);
  g.L.courses({ rh: .26, bw: .6, dens: .65 }).stones(9, { rh: .26 }).band(0, .2, M.tasK, .02);
  g.R.arcade(.5, 2.3, 1, .9, { kind: 'seg', pier: .15, th: .45, glow: true, floor: '#8f8474' });                      // ocaklı göz (cumbanın altında)
  g.R.arcade(2.5, 3.8, 1, .86, { kind: 'seg', pier: .12, th: .45, glow: true, floor: '#8f8474' });                    // raflı göz (çardağın ardında)
  // ocak: taş seki, kor, yaşmak, asılı bakırlar
  g.R.poly([[.95, 0, -.2], [1.95, 0, -.2], [1.95, .22, -.2], [.95, .22, -.2]], M.gri, 5.2, -.15).poly([[.95, .22, -.2], [1.95, .22, -.2], [1.95, .22, -.44], [.95, .22, -.44]], M.bazalt, 5.3, .1);
  g.R.poly([[1.1, .62, -.42], [1.82, .62, -.42], [1.68, .92, -.42], [1.24, .92, -.42]], M.kirec, 5.2, -.3);
  g.R.put(5.4, kf('#e8622a>#ff8a3a'), g.R.shapeD('round', 1.16, .2, .6, .2, -.33));
  [[.78, .64], [.9, .54]].forEach(([a, bb]) => g.R.dot(a, bb, 2.2, BAKIR, 5.6, .5, -.42));
  b.fx('fire', 3.88, 2.75, .26, { s: .6 });
  // raflar: sırlı kaplar
  [.3, .54].forEach(bb => g.R.line([[2.68, bb, -.42], [3.62, bb, -.42]], M.ahsapA, 1.3, 5.2, .3));
  [[2.78, .35, M.turkuaz], [3.0, .35, M.kiremitA], [3.24, .35, M.bez], [3.46, .35, M.mavi], [2.86, .59, M.bez], [3.12, .59, M.turkuaz], [3.38, .59, M.kiremitA]].forEach(([a, bb, c]) => g.R.dot(a, bb, 2.1, c, 5.6, .5, -.42));
  g.R.lantern(2.4, .84, { out: .16, r: 13 }).lantern(.28, .84, { out: .16, r: 13 });

  /* --- aydınlık yan duvar: yem tezgâhı, kavanoz rafı, asılı aletler --- */
  g.L.rect(2.74, 1.06, 1.1, .04, M.ahsapK, 5);
  g.L.line([[2.84, 1.06], [2.84, .78]], M.ahsapA, 1.2, 6).rect(2.77, .72, .14, .09, M.demir, 6.1, .2);                // çekiç
  g.L.line([[3.02, 1.06], [3.0, .76]], M.demir, 1, 6, .2).line([[3.08, 1.06], [3.11, .76]], M.demir, 1, 6, .2);       // maşa
  g.L.poly([[3.24, 1.04], [3.44, 1.04], [3.4, .8], [3.28, .8]], '#c9d2da', 6, -.1).rect(3.26, 1.02, .16, .05, M.ahsapA, 6.1);   // testere
  g.L.shp('round', 3.56, .78, .24, .24, M.ahsapA, 6).shp('round', 3.6, .82, .16, .16, M.tas, 6.1, -.12);              // elek
  g.L.rect(2.74, .54, 1.1, .045, M.ahsapK, 5);
  [[2.8, '#d98a8a'], [2.96, '#e0c068'], [3.12, '#8fb0a0'], [3.32, '#c98f63'], [3.48, '#e8e0c8'], [3.66, '#7fa9c0']].forEach(([a, c], i) => g.L.rect(a, .585, .11, .13 + (i % 2) * .03, c, 6).rect(a - .01, .715 + (i % 2) * .03, .13, .03, M.ahsapK, 6.1));
  b.box(3.1, 4.24, 0, 3.17, 4.6, .3, M.ahsap, { edge: false, cast: false }); b.box(4.03, 4.24, 0, 4.1, 4.6, .3, M.ahsap, { edge: false, cast: false });
  b.slab(3.02, 4.2, 4.18, 4.64, .36, .06, M.ahsapA).L.planks({ step: .29 });
  b.art(3.6, 4.44, .36, pth('#d98a8a', 'M-13 -2h3.4v-5h-3.4z') + pth('#e0c068', 'M-8 -1h3.4v-6h-3.4z') + pth('#9fc0b0', 'M-2.6 1h3.6v-5.4h-3.6z') + pth('#3a2418', 'M-13.3 -7h4v-1.2h-4zM-8.3 -7h4v-1.2h-4zM-2.9 -4.4h4.2v-1.2h-4.2z')
    + pth(T(M.ahsap, -.1), 'M4 3l.8 -5.6h6l.8 5.6q-3.8 1.6 -7.6 0z') + pth('#8fb4c4', K.ell(7.8, -2.6, 3, 1.1)) + ln('#4a3a34', 'M4.8 -2.6q3 -6 6 0', .7), { bb: [3.05, 4.24, .36, 4.15, 4.6, .62] });

  /* --- üst kat: ahşap çatkı, kireç dolgu, yeşil kepenkler --- */
  const u = b.box(.3, .3, 1.25, 4.2, 4.2, 2.2, M.kirec);
  u.R.shadeTop(.3, -.1).timber({ posts: [.05, .46, 2.34, 3.11, 3.86], rails: [.04, .12], braces: [[.05, .12, .46, .7]] });
  u.R.win(2.55, .16, .34, .5, { frame: M.ahsapK, shut: YESIL, lit: true }).win(3.33, .16, .34, .5, { frame: M.ahsapK, shut: YESIL, lit: false });
  u.L.shadeTop(.08).timber({ posts: [.05, 1.0, 1.28, 2.22, 2.42, 3.36, 3.85], rails: [.04, .2, .88], braces: [[1.0, .88, 1.28, .2], [2.42, .88, 2.22, .2], [3.36, .2, 3.85, .88], [3.85, .2, 3.36, .88]] });
  u.L.door(.24, .58, .8, { col: YESIL, sove: null });
  u.L.win(1.54, .27, .42, .52, { frame: M.ahsapK, shut: YESIL, lit: true }).win(2.68, .27, .42, .52, { frame: M.ahsapK, shut: YESIL, box: M.ahsap, lit: false });
  u.L.lantern(.94, .66, { out: .2 });

  /* --- cumba: eli böğründeler üstünde çıkma, kendi alınlığıyla --- */
  wire(T(M.ahsapK, -.1), 2.2, [3.64, 1.96].map(y => [[4.2, y, .84], [4.56, y, 1.23]]), [4.2, 1.9, .84, 4.6, 3.7, 1.25]);
  const c = b.box(4.2, 1.9, 1.25, 4.6, 3.7, 2.2, M.kirec);
  c.R.timber({ posts: [.04, .9, 1.76], rails: [.04, .18, .88] }).win(.28, .26, .4, .52, { frame: M.ahsapK, shut: YESIL, lit: true, box: M.ahsap }).win(1.12, .26, .4, .52, { frame: M.ahsapK, shut: YESIL, lit: true, kafes: true });
  c.L.timber({ posts: [.03, .37], rails: [.04, .18, .88] }).win(.11, .26, .18, .52, { frame: M.ahsapK, lit: true, bars: [1, 3] });
  for (let a = .15; a < 1.8; a += .3) c.R.dot(a, .04, 1, M.ahsapA, 4, .1);                                             // kiriş uçları

  /* --- çatı: mahya sokağa koşut; alınlık duvarı aydınlık yanda --- */
  const roof = b.gable(.3, .3, 4.2, 4.2, 2.2, .78, M.kiremit, { axis: 'y', ov: .2, wall: M.kirec });
  roof.G.timber({ posts: [1.2, 2.7], rails: [.04, .42], braces: [[1.2, .42, .6, .04], [2.7, .42, 3.3, .04]] });
  roof.G.win(1.73, .08, .44, .44, { kind: 'arch', frame: M.ahsapK, lit: true, sill: false, bars: [2, 2] });
  roof.G.rect(.7, .06, .44, .2, M.ahsapA, 4, -.05).shp('arch', .76, .1, .12, .13, M.ic, 5).shp('arch', .95, .1, .12, .13, M.ic, 5).rect(.66, .05, .52, .03, M.ahsapK, 5);   // güvercinlik
  // çapraz beşik: mahyası ana yamaca saplanır, yamaçlar dere çizgisinde kırpılır
  { const yc = 2.8, hw = .9, zw = 2.2, zr = 2.72, ze = 2.12, ext = hw + (zw - ze) * hw / (zr - zw), X1 = 4.76, xr = 2.25 + (2.98 - zr) / .4, xe = 4.4, W = X1 - xr, len = Math.hypot(ext, zr - ze), th = .07, tR = K.toneOf([1, 0, 0]) - .06;
    const A = new K.Face([xr, yc + ext, ze], [1, 0, 0], K.unit([0, -ext, zr - ze]), W, len, K.unit([0, zr - ze, ext]), [[xe - xr, 0], [W, 0], [W, len], [0, len]]); A.fill(M.kiremit); A.tiles();
    const Bk = new K.Face([xr, yc, zr], [1, 0, 0], K.unit([0, -ext, ze - zr]), W, len, K.unit([0, ze - zr, ext]), [[0, 0], [W, 0], [W, len], [xe - xr, len]]); Bk.fill(M.kiremit);
    const G = new K.Face([4.6, yc + hw, zw], [0, -1, 0], [0, 0, 1], 2 * hw, zr - zw, [1, 0, 0], [[0, 0], [2 * hw, 0], [hw, zr - zw]]); G.fill(M.kirec);
    G.timber({ posts: [hw], rails: [.04], braces: [[hw, .06, .4, .2], [hw, .06, 2 * hw - .4, .2]] }).shp('round', hw - .11, .1, .22, .22, M.ahsapK, 4).shp('round', hw - .07, .14, .14, .14, M.camI, 5);
    const st = (pts, t) => pth(T(M.kiremit, t), 'M' + PL(pts) + 'Z');
    b.item([xr, yc - ext, ze - th, X1, yc + ext, zr], () => Bk.svg() + G.svg() + st([[X1, yc, zr], [X1, yc - ext, ze], [X1, yc - ext, ze - th], [X1, yc, zr - th]], tR) + A.svg()
      + st([[X1, yc + ext, ze], [X1, yc, zr], [X1, yc, zr - th], [X1, yc + ext, ze - th]], tR) + st([[xe, yc + ext, ze], [X1, yc + ext, ze], [X1, yc + ext, ze - th], [xe, yc + ext, ze - th]], K.toneOf([0, 1, 0]) - .2)
      + ln(T(M.kiremit, -.34), `M${P(xr, yc, zr)} ${P(xe, yc + ext, ze)}`, 1.2) + ln(T(M.kiremit, .3), `M${P(xr, yc, zr)} ${P(X1, yc, zr)}`, 2),
      { pts: [[xr, yc, zr], [X1, yc, zr], [X1, yc + ext, ze], [X1, yc - ext, ze], [xe, yc + ext, ze], [xe, yc - ext, ze]] }); }
  b.chimney(1.15, 1.1, 2.5, .8, { mat: M.tas, w: .4, s: .8 }).L.courses({ rh: .2, bw: .3, dens: .8 });
  b.critter('guvercin', 2.25, 3.3, 3.0).critter('guvercin', 2.25, 3.62, 3.0, { flip: true }).critter('kedi', 3.3, 1.2, 2.56, { col: '#e8e0d0' });

  /* --- tabela: köşe ayağında demir kolda asılı testi levhası (aydınlık yüzü avluya bakar) --- */
  wire(M.demir, 1.4, [[[4.2, 4.0, 1.2], [4.84, 4.0, 1.2]], [[4.2, 4.0, .98], [4.5, 4.0, 1.2]], [[4.36, 4.0, 1.2], [4.36, 4.0, 1.14]], [[4.7, 4.0, 1.2], [4.7, 4.0, 1.14]]]);
  const sg = new K.Face([4.28, 4.0, .7], [1, 0, 0], [0, 0, 1], .5, .44, [0, 1, 0]); sg.fill(M.ahsapK);
  sg.rect(.035, .035, .43, .37, M.krem, 4).shp('round', .13, .07, .24, .2, M.kiremit, 5).rect(.2, .25, .1, .07, M.kiremit, 5).rect(.17, .31, .16, .03, M.kiremitK, 5).line([[.13, .19], [.37, .19]], M.mavi, 1.1, 6);
  b.item([4.28, 3.98, .7, 4.78, 4.02, 1.14], () => sg.svg(), { cast: false });

  /* --- taş merdiven: üst kat kapısına çıkar; basamaklarda saksılar --- */
  const lb = b.box(.3, 4.2, 0, 1.1, 4.85, 1.25, M.tas, { edge: false }); lb.L.courses({ rh: .26, bw: .5, dens: .7 }); lb.R.courses({ rh: .26, bw: .5, dens: .7 });
  b.stairs(1.1, 4.2, 3.0, 4.85, 1.25, 0, 'x', M.tas);
  const sf = new K.Face([1.1, 4.85, 0], [1, 0, 0], [0, 0, 1], 1.9, 1.25, [0, 1, 0], [[0, 0], [1.8, 0], [0, 1.18]]); sf.mc = M.tas; sf.courses({ rh: .26, bw: .5, dens: .7 });
  b.item([1.1, 4.85, 0, 3.0, 4.87, 1.25], () => sf.svg(), { cast: false });
  wire(M.demir, 1.1, [[[.34, 4.83, 1.63], [1.1, 4.83, 1.63], [3.0, 4.83, .59]], [[.34, 4.83, 1.25], [.34, 4.83, 1.63]], [[1.1, 4.83, 1.25], [1.1, 4.83, 1.63]], [[2.05, 4.83, .62], [2.05, 4.83, 1.11]], [[3.0, 4.83, 0], [3.0, 4.83, .59]]], [.3, 4.82, 1.25, 3.02, 4.87, 1.65]);
  b.pot(1.58, 4.4, 1.04, { plant: true, fl: M.kirmizi, s: .8 }).pot(2.2, 4.4, .62, { plant: true, fl: M.sari, s: .8, col: M.turkuaz }).critter('kedi', 2.7, 4.5, .21);

  /* --- çömlek fırını: yuvarlak tuğla gövde, kubbe, kısa baca --- */
  b.tree('selvi', .45, 6.72, { s: .8 });
  const kc = b.cyl(1.25, 6.0, .78, 0, .88, TUGLA); kc.courses(.15).band(.82, .09, T(TUGLA, -.14), .035);
  const km = kc.face(.45, 0, .6, .64); km.shp('arch', .03, 0, .54, .6, M.tasK, 3, .12).shp('arch', .12, 0, .36, .46, '#2b1c16>#a8431a', 4, null).shp('round', .16, .01, .28, .17, '#e8622a>#ff8a3a', 5, null);
  b.dome(1.25, 6.0, .75, .93, '#c98a64', { hf: .72, alem: false, seams: false });
  const kb = b.cyl(1.25, 6.0, .17, 1.3, 1.82, TUGLA, { top: '#2b1c16' }); kb.courses(.13).band(1.73, .09, T(TUGLA, -.14), .03, false);
  b.fx('smoke', 1.25, 6.0, 1.86, { s: .9 }).fx('fire', 2.1, 6.07, .03, { s: .55 });
  b.woodpile(2.2, 6.5, 0, { w: .55 });
  // pişmiş çömlek yığını
  potRow(1.95, 5.08, 2.65, 5.08, 0, 4, 1.25, [M.kiremitA, '#c98a64', M.kiremit]);
  potRow(2.1, 5.3, 2.8, 5.3, 0, 4, 1.15, ['#e9dcc0', M.kiremitA, M.turkuaz, '#e9dcc0'], M.mavi);

  /* --- çömlekçi: çark başında usta, kalasta kuruyan çömlekler --- */
  b.fig(3.3, 5.72, 0, { body: '#d9c9a8', legs: '#6a5a4a', hat: 'sarik' });
  b.cyl(3.58, 6.0, .21, 0, .2, M.ahsapK, { top: M.griK, cast: false });
  b.art(3.58, 6.0, .2, pth(T(KIL, -.2), 'M-3 0Q-5 -4 -2.2 -7.6L-2.8 -9H2.8L2.2 -7.6Q5 -4 3 0Z') + pth(T(KIL, .15), 'M-3 0Q-5 -4 -2.2 -7.6L-2.8 -9H0Q-1.6 -4 -.6 0Z') + ln(M.ten, 'M-4.4 -9.6L-2.6 -6.4M4.2 -10L2.6 -6.6', 1.5), { bb: [3.48, 5.9, .2, 3.68, 6.1, .55] });
  b.box(3.12, 6.5, 0, 3.2, 6.66, .2, M.ahsap, { edge: false, cast: false }); b.box(4.6, 6.5, 0, 4.68, 6.66, .2, M.ahsap, { edge: false, cast: false });
  b.slab(2.95, 6.45, 4.85, 6.7, .25, .05, M.ahsapA);
  potRow(3.08, 6.57, 4.72, 6.57, .25, 8, .95, [KIL, '#e9dcc0', KIL, T(KIL, .15)], M.mavi);
  b.barrel(4.3, 5.6, 0, { r: .17, h: .3, top: '#6f9fb0' });
  b.art(3.95, 5.05, 0, `<ellipse cx="1" cy="0" rx="8.4" ry="2.6" fill="#1b2440" opacity=".2"/>` + pth('#b98a52', 'M-6 -1Q-7 -6 -1 -6.4Q6 -6.6 7 -2Q7 .6 3 1H-4Q-6 1 -6 -1Z') + pth('#d4a66a', 'M-8.6 -1.6Q-8.8 -4.6 -5.6 -4.8Q-3.2 -4.6 -3.4 -2Q-3.6 .6 -6.4 .6Q-8.4 .4 -8.6 -1.6Z') + pth('#7a5632', 'M-5.4 -4.9l1.9 .3l-.6 2.6l-1.6 -.6z') + ln('#7a5632', 'M7 -2Q9.4 -1 7 .8', 1.3) + ln('#3a2a22', 'M-7.6 -2.2h1.2', .7), { r: .25 });   // uyuyan köpek
  // çırak: omzunda kalas
  b.fig(5.25, 6.2, 0, { body: M.bezM, legs: '#5a4a3a', hat: 'fes', step: 1 });
  b.art(5.25, 6.2, 0, ln(M.ahsapA, 'M-13 -12.5L13 -19.5', 2.6) + ln(T(M.ahsapA, -.3), 'M-13 -11.2L13 -18.2', .8), { bb: [5.12, 6.08, 0, 5.42, 6.36, .95] });
  // cila çarkı: ayaklı bileği taşı (döner)
  b.box(4.52, 4.74, 0, 5.0, 4.86, .12, M.ahsap, { edge: false, cast: false });
  wire(M.ahsapK, 1.6, [[[4.56, 4.8, .12], [4.76, 4.8, .46], [4.96, 4.8, .12]]]);
  b.fx('wheel', 4.76, 4.9, .44, { r: .2, axis: 'y', kind: 'tekerlek', col: M.gri });

  /* --- boyacı çardağı: asma altında kirişe asılı boyalı çileler; önünde kök boya ve çivit tekneleri --- */
  [1.8, .42].forEach(y => b.box(5.35, y - .06, 0, 5.47, y + .06, 1.1, M.ahsapK, { edge: false }));
  b.box(5.33, .25, 1.1, 5.49, 1.97, 1.18, M.ahsap, { edge: false });
  const mer = []; for (let y = .42; y < 1.9; y += .345) mer.push([[4.2, y, 1.2], [5.64, y, 1.2]]);
  wire(M.ahsapK, 1.5, mer, [4.2, .3, 1.18, 5.64, 1.95, 1.22]);
  const fr = K.rng(41), fol = [], sal = [[], [], []];
  for (let y = .26; y < 2.0; y += .11) fol.push([5.42 + (fr() - .5) * .4, y, 1.23 + fr() * .1]);
  for (let i = 0; i < 16; i++) fol.push([4.7 + fr() * .5, .3 + fr() * 1.6, 1.22 + fr() * .05]);
  fol.sort((p, q) => p[0] + p[1] - q[0] - q[1]);
  for (const y of [.3, .52, 1.72, 1.94]) { const p = pr(5.52, y, 1.12), l = 2 + Math.floor(fr() * 2); for (let k = 0; k < l; k++) sal[k].push([p[0] + (fr() - .5), p[1] + k * 3.2 + 1]); }
  b.item([4.66, .25, 1.22, 5.64, 2.0, 1.45], ln(M.govde, `M${P(5.5, 1.8, 0)}Q${P(5.56, 1.9, .5)} ${P(5.48, 1.78, 1.16)}`, 1.3)
    + foliage(fol, 3.3, M.sarmasik, null, fr) + blobs(T(M.mor, -.1), sal[0], 4.6) + blobs(M.mor, sal[1], 3.6) + blobs(T(M.mor, .3), sal[2], 2.4), { pts: [[5.2, .3, 1.2], [5.62, .3, 1.2], [5.62, 1.95, 1.2], [5.2, 1.95, 1.2]] });
  const rk = new K.Face([5.5, 1.8, 0], [0, -1, 0], [0, 0, 1], 1.4, 1.1, [1, 0, 0]);
  BOYA.forEach((cl, i) => { const a = .19 + i * .2; rk.line([[a, .5], [a, 1.02]], cl, 4.4, 5, .3).line([[a + .02, .56], [a + .02, .96]], cl, 1.2, 5.1, -.1).line([[a - .09, .8], [a + .09, .8]], '#efe3c8', 1.2, 5.2, .2); });
  rk.lantern(.02, .8, { out: .12, r: 14 });
  b.item([5.5, .4, .4, 5.56, 1.8, 1.1], () => rk.svg(), { cast: false });
  b.clothes(5.62, .22, 6.92, .22, 1.02, { cols: [KOK, CIVIT, M.bezS, M.bez, '#7d4a94'] });
  wire(M.ahsapK, 1.6, [[[5.62, .22, 0], [5.62, .22, 1.04]], [[6.92, .22, 0], [6.92, .22, 1.04]]]);
  const tk = b.box(5.95, .5, 0, 6.65, 1.8, .3, M.tas, { edge: false }); tk.L.courses({ rh: .15, bw: .4, dens: .8 }); tk.R.courses({ rh: .15, bw: .4, dens: .8 });
  b.pool(6.03, .58, 6.57, 1.1, .3, { col: KOK }).pool(6.03, 1.2, 6.57, 1.72, .3, { col: CIVIT });
  b.line3([[6.3, .9, .3], [6.52, .62, .98]], M.ahsapA, 1.5);
  b.sack(5.82, 2.3, 0, { col: '#c9a37a' });

  /* --- aşçı kazanı: üç ayakta asılı bakır kazan, altında ateş --- */
  b.fig(5.98, 2.95, 0, { body: M.nane, robe: true, hat: 'ortu', hatCol: M.kirmizi });
  wire(M.demir, 1.3, [[[6.06, 2.58, 0], [6.36, 2.76, .98]], [[6.64, 2.54, 0], [6.36, 2.76, .98]], [[6.4, 3.12, 0], [6.36, 2.76, .98]], [[6.36, 2.76, .98], [6.36, 2.76, .56]]]);
  b.art(6.36, 2.76, 0, ln(M.ahsapK, 'M-6 1L5 -1M-5 -1.6L6 1.4', 1.8) + pth(T(BAKIR, -.28), 'M-6.4 -15Q-7.4 -6.4 0 -6Q7.4 -6.4 6.4 -15Z') + pth(BAKIR, 'M-6.4 -15Q-7.4 -6.4 0 -6Q-2.6 -10 -2 -15Z') + pth(T(BAKIR, .35), K.ell(0, -15, 6.6, 2.3)) + pth('#d9b05a', K.ell(0, -15, 5, 1.5)) + ln(M.ahsapA, 'M-9.4 -19.6L-1 -15', 1.1), { bb: [6.2, 2.6, 0, 6.52, 2.92, .6] });
  b.fx('fire', 6.36, 2.78, .02, { s: .5 }).fx('steam', 6.36, 2.76, .56, { s: .7 });

  /* --- marangoz: tezgâh, rende, testere, talaş; yanında kayık iskeleti --- */
  b.fig(5.74, 4.18, 0, { body: '#7f8f6a', legs: '#4a3a34', hair: '#8a857c' });
  b.art(5.74, 4.18, 0, pth('#7a5a3c', 'M-2.6 -14.6h5.2l.6 7.4h-6.4z'), { bb: [5.62, 4.06, 0, 5.88, 4.32, .9] });
  b.box(5.94, 3.66, 0, 6.46, 3.76, .29, M.ahsap, { edge: false, cast: false }); b.box(5.94, 4.64, 0, 6.46, 4.74, .29, M.ahsap, { edge: false, cast: false });
  b.slab(5.88, 3.58, 6.52, 4.82, .36, .07, M.ahsapA).T.planks({ dir: 'v', step: .21 });
  b.slab(6.02, 3.74, 6.26, 4.62, .4, .04, '#e6cc9a');
  b.art(6.14, 4.3, .4, pth(M.ahsapK, 'M-4 -1l5 2.4l3.6 -1.8v-2.4l-5 -2.4l-3.6 1.8z') + pth(T(M.ahsapA, .1), 'M-4 -3.4l5 2.4l3.6 -1.8l-5 -2.4z') + ln(M.ahsapK, 'M1 -3.4v-2.6', 1.6), { bb: [6.04, 4.2, .4, 6.24, 4.4, .6] });   // rende
  b.art(6.4, 3.84, .36, ln(M.ahsap, 'M-5 -2.4L4 2M-5 -7.4L4 -3M-.6 -5.2V-.2', 1.3) + ln('#c9d2da', 'M-5 -2.4L4 2', .8), { bb: [6.3, 3.76, .36, 6.5, 3.96, .6] });   // çerçeve testere
  b.art(6.74, 4.2, 0, ln('#f0dcae', 'M-4 0q2 -2.4 0 -3.4q-2.2 1 -.8 2.4M2 2q2.4 -1.8 .6 -3.2q-2.2 .6 -1.2 2.2M-1 5q2 -2 .2 -3q-2 .8 -.8 2M5 -3q1.8 -1.6 .2 -2.6', 1), { r: .25, h: .1 });   // talaş kıvrımları
  // kayık iskeleti: omurga, postalar, baş ve kıç bodoslaması
  b.box(6.2, 5.48, 0, 6.72, 5.56, .26, M.ahsap, { edge: false, cast: false }); b.box(6.2, 6.26, 0, 6.72, 6.34, .26, M.ahsap, { edge: false, cast: false });
  const rib = [], shL = [], shR = [];
  [[5.42, .15], [5.62, .25], [5.85, .31], [6.1, .3], [6.33, .22], [6.5, .13]].forEach(([y, w]) => { const s = []; for (let k = -4; k <= 4; k++) { const a = k / 4 * 1.45; s.push([6.46 + w * Math.sin(a), y, .3 + .34 * (1 - Math.cos(a)) / (1 - Math.cos(1.45))]); } rib.push(s); shL.push(s[0]); shR.push(s[8]); });
  wire(M.ahsapK, 2.2, [[[6.46, 5.2, .52], [6.46, 5.3, .3], [6.46, 6.56, .3], [6.46, 6.66, .62]]], [6.44, 5.18, .26, 6.48, 6.68, .3]);
  wire(M.ahsapA, 1.4, rib.concat([[[6.46, 5.2, .56]].concat(shR, [[6.46, 6.66, .64]]), [[6.46, 5.2, .56]].concat(shL, [[6.46, 6.66, .64]])]), [6.12, 5.18, .3, 6.8, 6.68, .68]);

  b.tag(6.5, 6.9, 0).doorAt(4.75, 2.95);
});
