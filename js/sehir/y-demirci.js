/* Demirci — is kaplı kara taş atölye; sağında sivri kemerli açık ocak evi, önünde avluda örs.
   Gotik üslup: dik arduvaz çatı, payandalar, dar sivri pencereler (sönük). Tek güçlü ışık: ocak ateşi.
   Ana cephe +y (aydınlık). Parsel 6.5 × 7; arka (y=0) istinat duvarına yaslıdır, görünmez. */
CK.def('demirci', { w: 6.5, d: 7, name: 'Demirci' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, P = K.P, PL = K.PL;
  const CELIK = '#9aa2ab', IS = '#2e2b29';
  // zincir: kesik kalın çizgi + ince öz (asılı halka dizisi)
  const zincir = (pts, bb) => b.item(bb, ln(T(M.gDemir, .2), 'M' + PL(pts), 2.2, 'stroke-dasharray="1.8 1.1"') + ln(T(M.gDemir, -.3), 'M' + PL(pts), .7), { cast: false });
  // payanda: +y duvarına yaslı ince taş ayak, eğimli taş şapka
  const payanda = (x, y, out, z1, w = .3, mat = M.gKara) => {
    const p = b.box(x - w / 2, y, 0, x + w / 2, y + out, z1, mat, { edge: false });
    p.L.courses({ rh: .26, bw: .4, dens: .6 }).band(0, .24, T(mat, -.1), 0); p.R.courses({ rh: .26, bw: .4, dens: .5 });
    const zt = z1 + out * 1.1;
    b.poly3([[x - w / 2, y, zt], [x + w / 2, y, zt], [x + w / 2, y + out, z1], [x - w / 2, y + out, z1]], M.gTasA, { n: [0, zt - z1, out], bb: [x - w / 2, y, z1, x + w / 2, y + out, zt] });
    b.poly3([[x + w / 2, y + out, z1], [x + w / 2, y, zt], [x + w / 2, y, z1]], mat, { n: [1, 0, 0], bb: [x + w / 2 - .01, y, z1, x + w / 2, y + out, zt] });
    return p;
  };

  /* --- zemin: kara taş avlu, ocak önünde is ve kül; ocaktan vuran ışık --- */
  b.pave(0, 4.6, 6.5, 7, M.gTasK);
  b.gpoly([[4.2, 2.7], [6.4, 2.7], [6.45, 5.6], [5.2, 6.2], [3.9, 5.5], [4.2, 4.6]], '#5a544e');
  b.gpoly([[4.5, 2.75], [6.1, 2.75], [5.9, 3.9], [4.7, 3.8]], IS, { op: .6 });
  b.gpoly([[.3, 4.6], [1.4, 4.6], [1.1, 5.0], [.3, 5.1]], M.gYosun, { op: .35 });
  b.spill(5.25, 3.4, 2.4);

  /* --- ana atölye: tek yüksek kat, is tutmuş kara taş --- */
  const g = b.box(.3, .3, 0, 4.2, 4.6, 1.8, M.gKara);
  g.L.courses({ rh: .27, bw: .56, dens: .7 }).stones(12, { rh: .27, dt: .07 }).shadeTop(.26, -.2);
  g.R.courses({ rh: .27, bw: .56, dens: .6 }).stones(6, { rh: .27, dt: .07 }).shadeTop(.22, -.2);
  g.L.band(0, .34, IS, .02).band(.34, .06, M.gTasK, .1, 3); g.R.band(0, .34, IS, .02).band(.34, .06, M.gTasK, .1, 3);
  // is lekeleri: pencere ve kapı üstünden yukarı yalayan kurum
  g.L.poly([[2.38, 1.55], [2.88, 1.55], [2.8, 1.8], [2.45, 1.8]], IS, 2.4, 0).poly([[3.18, 1.5], [3.6, 1.5], [3.55, 1.8], [3.2, 1.8]], IS, 2.4, 0);
  g.L.door(.42, 1.0, 1.36, { kind: 'point', col: M.gAhsapK, sove: M.gTasA, double: true });
  g.L.win(2.46, .62, .34, .86, { kind: 'point', sove: M.gTasA, frame: M.gDemir, bars: [2, 3], lit: false });
  g.L.win(3.25, .62, .34, .86, { kind: 'point', sove: M.gTasA, frame: M.gDemir, bars: [2, 3], lit: false });
  g.L.poly([[.1, 0], [.4, 0], [.36, .5], [.12, .7]], M.gYosun, 2.3, -.05);
  // yan duvar (avluya bakan): asılı kılıçlar ve maşalar, demir kancalarda
  const R = g.R;
  R.rect(.16, 1.22, 1.66, .06, M.gAhsapK, 5);
  [.3, .52, .74, .96].forEach((a, i) => { const l = .74 + (i % 2) * .1;
    R.line([[a, 1.22], [a, 1.22 - .1]], M.gDemir, .8, 5.6).line([[a, 1.12], [a, 1.12 - l]], CELIK, 1.5, 6, .1).line([[a - .07, 1.04], [a + .07, 1.04]], M.gBronz, 1.4, 6.1).line([[a, 1.12], [a, 1.04]], M.gAhsapK, 1.6, 6.2); });
  [[1.24, .46], [1.44, .4]].forEach(([a, l]) => R.line([[a, 1.22], [a - .04, 1.22 - l]], M.gDemir, 1, 6, .2).line([[a + .08, 1.22], [a + .1, 1.22 - l]], M.gDemir, 1, 6, .2));
  R.line([[1.66, 1.22], [1.66, .78]], M.gAhsapA, 1.2, 6).rect(1.58, .68, .16, .1, M.gDemir, 6.1, .2);

  /* --- payandalar --- */
  payanda(2.08, 4.6, .36, 1.2);
  payanda(4.04, 4.6, .32, 1.1, .3);

  /* --- çatı: dik arduvaz, kara taş alınlık; mahyada demir sivri uçlar --- */
  const roof = b.gable(.3, .3, 4.2, 4.6, 1.8, 1.8, M.gCati, { axis: 'x', ov: .2, wall: M.gKara, tex: 'rows', step: .17 });
  roof.G.courses({ rh: .27, dens: .5 });
  roof.G.win(1.98, .3, .34, .72, { kind: 'point', sove: M.gTasA, frame: M.gDemir, bars: [1, 3], lit: false, sill: false });
  roof.A.rect(.6, .6, .4, .18, M.gCatiA, 2.3, -.05).rect(2.6, 1.1, .3, .14, M.gCatiK, 2.3, -.1);       // kırık arduvaz yamaları
  b.line3([[4.4, 2.45, 3.6], [4.4, 2.45, 4.05]], M.gDemir, 1.6).line3([[.1, 2.45, 3.6], [.1, 2.45, 3.95]], M.gDemir, 1.4);
  b.art(4.4, 2.45, 3.82, ln(M.gDemir, 'M-2.4 0h4.8', 1.1), { bb: [4.38, 2.43, 3.8, 4.42, 2.47, 3.85] });
  b.chimney(1.2, 1.5, 2.6, 1.3, { mat: M.gKara, w: .4, s: .6 });
  b.critter('guvercin', 2.6, 2.45, 3.6, { col: '#26262a' });                                                 // kuzgun

  /* --- ocak evi: sivri kemerli açık ocak, içinde kor; üstünde kalın baca --- */
  const o = b.box(4.2, .3, 0, 6.3, 2.7, 1.5, M.gKara);
  o.L.courses({ rh: .27, bw: .56, dens: .7 }).stones(4, { rh: .27, dt: .07 }).band(0, .34, IS, .02);
  o.R.courses({ rh: .27, bw: .56, dens: .6 }).stones(3, { rh: .27, dt: .07 }).band(0, .34, IS, .02).shadeTop(.2, -.2);
  o.L.arcade(.14, 1.96, 1, 1.24, { kind: 'point', pier: .16, th: .55, glow: true, floor: IS });
  // ocak ağzının içi: koyu duvarda sıcak hâle, taş tekne, kor
  o.L.put(5.05, '', o.L.shapeD('point', .3, 0, 1.5, 1.24, -.52), 'fill="#2a170f"').put(5.1, '', o.L.shapeD('round', .1, -.3, 1.9, 1.5, -.5), `fill="url(#${K.glowId()})"`);
  o.L.poly([[.52, 0, -.3], [1.6, 0, -.3], [1.6, .46, -.3], [.52, .46, -.3]], M.gTasK, 5.2, -.2).poly([[.52, .46, -.3], [1.6, .46, -.3], [1.6, .46, -.55], [.52, .46, -.55]], IS, 5.3, -.1);
  o.L.put(5.4, K.kf(M.gKor), o.L.shapeD('round', .62, .4, .88, .2, -.43)).put(5.5, K.kf(M.gAtes), o.L.shapeD('round', .8, .43, .52, .13, -.43)).put(5.6, K.kf(M.gMum), o.L.shapeD('round', .96, .45, .2, .08, -.43));
  o.L.shadeTop(.2, -.22);
  // kemer üstünde kurum yalağı
  o.L.poly([[.5, 1.3], [1.6, 1.3], [1.3, 1.5], [.8, 1.5]], IS, 2.4, 0);
  b.fx('fire', 5.26, 2.3, .5, { s: 1 });
  const hp = b.hip(4.05, .15, 6.45, 2.85, 1.5, 1.0, M.gCatiK, { tex: 'rows', step: .17 });
  // dev baca: kara taş, üstü is kuşaklı, taş şapka
  const st = b.box(4.85, .95, 1.6, 5.65, 1.75, 3.5, M.gKara, { edge: false });
  for (const f of [st.L, st.R]) f.courses({ rh: .24, bw: .4, dens: .8 }).band(1.5, .4, IS, 0, 3).band(.9, .06, M.gTasA, .1, 3);
  b.box(4.77, .87, 3.5, 5.73, 1.83, 3.62, M.gTasK, { edge: false, cast: false });
  b.line3([[4.88, .98, 3.62], [4.88, .98, 3.9]], M.gDemir, 1.2).line3([[5.62, 1.72, 3.62], [5.62, 1.72, 3.9]], M.gDemir, 1.2);
  b.fx('smoke', 5.25, 1.35, 3.66, { s: 1.5 });
  // saçaktan sarkan zincirler ve kancada demir halka
  zincir([[6.36, 2.78, 1.42], [6.36, 2.78, .78]], [6.33, 2.75, .78, 6.39, 2.81, 1.42]);
  zincir([[4.3, 2.8, 1.42], [4.3, 2.8, .9]], [4.27, 2.77, .9, 4.33, 2.83, 1.42]);
  b.art(4.3, 2.8, .9, ln(M.gDemir, 'M0 0q0 3 -2.2 2.6', 1.3), { bb: [4.26, 2.76, .78, 4.34, 2.84, .9] });

  /* --- ocak avlusu: körük, kömür, örs, usta, su fıçısı, demir çubuklar --- */
  const KR = M.gAhsapK;
  b.poly3([[5.72, 2.78, .3], [6.24, 2.78, .3], [6.24, 3.42, .16], [5.72, 3.42, .16]], KR, { n: [0, .2, 1], bb: [5.72, 2.78, .12, 6.24, 3.42, .32] });      // körük üstü
  b.poly3([[6.24, 3.42, .04], [6.24, 2.78, .04], [6.24, 2.78, .3], [6.24, 3.42, .16]], KR, { n: [1, 0, 0], bb: [5.72, 2.78, 0, 6.24, 3.42, .12] });
  b.poly3([[5.72, 3.42, .04], [6.24, 3.42, .04], [6.24, 3.42, .16], [5.72, 3.42, .16]], KR, { n: [0, 1, 0], bb: [5.72, 3.4, 0, 6.24, 3.44, .1] });
  b.line3([[5.98, 3.42, .1], [5.98, 3.75, .3]], M.gAhsapK, 1.5);
  b.art(4.58, 3.1, 0, pth(T(IS, -.2), 'M-9 1Q-8 -6 -2 -7Q4 -8 8 -2L10 1Q0 4 -9 1Z') + pth('#3a3634', 'M-6 -1Q-4 -6 0 -6Q3 -5 3 -1Z') + pth(M.gKor, K.circ(-2, -3, .8)), { r: .3 });   // kömür yığını
  b.cyl(5.3, 3.85, .17, 0, .3, M.gAhsapK, { top: M.gAhsap, cast: false });                                               // örs kütüğü
  b.art(5.3, 3.85, .3, pth(T(M.gDemir, -.3), 'M-7 -3H6L9 -5V-7H-3L-9 -5ZM-3 -3H3L4 1H-4Z') + pth(T(M.gDemir, .35), 'M-9 -5L-3 -7H9V-6.2H-3L-9 -4.2Z'), { r: .2, h: .3 });
  b.fx('sparks', 5.3, 3.85, .55);
  // usta: deri önlüklü, çekici kalkmış
  b.fig(4.9, 4.2, 0, { body: '#5a4a40', legs: '#2a2624', hat: 'none', hair: '#1e1a18', skin: '#b89478' });
  b.art(4.9, 4.2, 0, pth('#3e2c22', 'M-2.6 -14.6h5.2l.6 7.4h-6.4z') + ln(M.gAhsapK, 'M4.2 -14.4L7.6 -19.6', 1.1) + pth(T(M.gDemir, -.1), 'M5.6 -21.8l3.8 2.2l-1 1.7l-3.8 -2.2z'), { bb: [4.78, 4.08, 0, 5.08, 4.38, .95] });
  b.barrel(5.95, 4.05, 0, { r: .22, col: M.gAhsap, top: '#2c3036' });
  b.line3([[4.4, 4.9, .05], [5.6, 4.9, .05]], T(M.gDemir, .2), 1.4).line3([[4.45, 5.0, .05], [5.7, 5.0, .05]], M.gDemir, 1.4).line3([[4.42, 4.8, .1], [5.5, 4.8, .1]], T(M.gPas, -.1), 1.4);

  /* --- ön avlu: tabela, bileği taşı, odun, sandıklar, kılıç askısı --- */
  // tabela: payanda başından uzanan demir kolda, paslı levhada örs
  b.line3([[2.08, 4.62, 1.62], [2.08, 5.16, 1.62]], M.gDemir, 1.5, { pad: .06 });
  b.art(2.08, 5.1, 1.62, ln('#1e2024', 'M-4 0v3M4 0v3', .8) + pth('#1e2024', 'M-6.4 3h12.8v9.6l-6.4 4l-6.4 -4z') + pth(M.gPas, 'M-5.2 4.2h10.4v7.8l-5.2 3.2l-5.2 -3.2z')
    + pth('#1e2024', 'M-3.6 7.4h6.6l1.4 -1v1.6h-1.4l-1.2 1.2v1.6h1.4v1h-6v-1h1.4v-1.6l-2.2 -1.2z'), { bb: [1.96, 4.98, .9, 2.2, 5.22, 1.64] });
  // bileği taşı: ahşap ayak üstünde taş çark
  b.box(2.6, 5.7, 0, 3.4, 6.0, .3, M.gAhsapK, { edge: false });
  const gs = new K.Face([2.72, 6.02, .14], [1, 0, 0], [0, 0, 1], .56, .56, [0, 1, 0]);
  gs.shp('round', 0, 0, .56, .56, M.gTas, 3, .1).shp('round', .06, .06, .44, .44, M.gTas, 4, -.08).shp('round', .22, .22, .12, .12, M.gDemir, 5);
  b.item([2.72, 6.0, .14, 3.28, 6.04, .7], () => gs.svg(), { cast: false });
  b.woodpile(.35, 4.9, 0, { w: 1.1 });
  b.crate(1.75, 5.7, 0, .42, { col: M.gAhsap }).crate(1.3, 6.05, 0, .36, { col: M.gAhsapK }).barrel(.7, 5.9, 0, { col: M.gAhsap, top: M.gAhsapK }).sack(2.2, 6.2, 0, { col: '#5a5450' });
  // kılıç askısı: kara direkler, demir kancalarda asılı kılıçlar; yanında paslı kalkan
  b.line3([[3.9, 6.5, 0], [3.9, 6.5, .78]], M.gAhsapK, 1.6).line3([[4.9, 6.5, 0], [4.9, 6.5, .78]], M.gAhsapK, 1.6).line3([[3.82, 6.5, .72], [4.98, 6.5, .72]], M.gAhsapK, 1.8);
  b.art(3.9, 6.5, .78, pth(M.gDemir, 'M-1.6 0l1.6 -3.6l1.6 3.6z'), { bb: [3.88, 6.48, .78, 3.92, 6.52, .86] }).art(4.9, 6.5, .78, pth(M.gDemir, 'M-1.6 0l1.6 -3.6l1.6 3.6z'), { bb: [4.88, 6.48, .78, 4.92, 6.52, .86] });
  [4.08, 4.3, 4.52, 4.74].forEach((x, i) => b.art(x, 6.52, .72, ln(M.gDemir, 'M0 0v1.6', .8) + ln(M.gAhsapK, 'M0 1.6v3', 1.8) + ln(M.gBronz, 'M-2.6 4.6h5.2', 1.3) + ln(T(CELIK, i % 2 ? .05 : -.12), 'M0 4.6V' + (17 + (i % 2) * 2), 1.6) + ln(T(CELIK, .3), 'M-.4 6V' + (16 + (i % 2) * 2), .5), { bb: [x - .05, 6.5, 0, x + .05, 6.56, .74] }));
  b.art(5.05, 6.6, 0, pth(T(M.gPas, -.25), 'M-5.6 -15h11.2v6q0 6 -5.6 9q-5.6 -3 -5.6 -9z') + pth(M.gPas, 'M-4.6 -14h9.2v5q0 5 -4.6 7.6q-4.6 -2.6 -4.6 -7.6z') + pth(M.gDemir, K.circ(0, -8.6, 1.6)), { bb: [4.92, 6.56, 0, 5.18, 6.64, .62] });
  b.critter('kedi', 3.55, 5.0, 0, { col: '#2e2c2c' });

  b.tag(2.4, 6.9, 0).doorAt(.92, 5.0);
});
