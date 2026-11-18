/* Demirci — kaba taş atölye; sağında önü kemerli ocak evi, önünde açık avluda örs.
   Ana cephe +y (aydınlık). Parsel 6.5 × 7; arka (y=0) istinat duvarına yaslıdır, görünmez.
   Bu dosya öteki yapılar için ÖRNEKTİR: ayrıntı yoğunluğu, katman sırası ve çizim seti kullanımı buradaki gibi olmalı. */
CK.def('demirci', { w: 6.5, d: 7, name: 'Demirci' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln;

  /* --- zemin: avlu döşemesi, ocak önünde is ve kül, gece ocaktan vuran ışık --- */
  b.pave(0, 4.6, 6.5, 7, M.parkeK);
  b.gpoly([[4.2, 2.7], [6.4, 2.7], [6.45, 5.6], [5.2, 6.2], [3.9, 5.5], [4.2, 4.6]], '#8f8474');
  b.gpoly([[4.5, 2.75], [6.1, 2.75], [5.9, 3.9], [4.7, 3.8]], '#6f665c', { op: .55 });
  b.spill(5.2, 3.5, 2.6);

  /* --- ana atölye: tek yüksek kat, kaba taş --- */
  const g = b.box(.3, .3, 0, 4.2, 4.6, 1.6, M.griK);
  g.L.courses({ rh: .27, bw: .56, dens: .7 }).stones(10, { rh: .27 }).shadeTop(.24);
  g.R.courses({ rh: .27, bw: .56, dens: .6 }).stones(6, { rh: .27 }).shadeTop(.2);
  g.L.band(0, .3, M.bazalt, .14); g.R.band(0, .3, M.bazalt, .14);                  // su basman: koyu taş
  g.L.door(.42, 1.0, 1.16, { kind: 'arch', col: M.ahsapK, sove: M.tas, double: true });
  g.L.lantern(1.64, 1.14);
  g.L.win(2.1, .58, .58, .6, { kind: 'arch', sove: M.tas, frame: M.demir, bars: [4, 1], lit: true });
  g.L.vine({ kind: 'ivy', a0: 3.2, a1: 3.9, drop: [.5, 1.3], dens: .9, stem: 3.75 });
  // duvara yaslı araba tekeri
  g.L.shp('round', 2.86, .03, .62, .62, M.ahsapK, 6).shp('round', 2.93, .1, .48, .48, M.griK, 6.1, -.1).shp('round', 3.12, .29, .1, .1, M.ahsapK, 6.3);
  g.L.line([[3.17, .06], [3.17, .62]], M.ahsapK, 1, 6.2).line([[2.89, .34], [3.45, .34]], M.ahsapK, 1, 6.2).line([[2.97, .14], [3.37, .54]], M.ahsapK, .9, 6.2).line([[2.97, .54], [3.37, .14]], M.ahsapK, .9, 6.2);
  // yan duvar (avluya bakan): alet askısı — maşalar, çekiçler, nallar
  g.R.rect(.2, 1.02, 1.62, .06, M.ahsapK, 5);
  [[.36, .5], [.6, .42]].forEach(([a, l]) => g.R.line([[a, 1.02], [a - .04, 1.02 - l]], M.demir, 1, 6, .2).line([[a + .08, 1.02], [a + .1, 1.02 - l]], M.demir, 1, 6, .2));          // maşalar
  [[.92, .46], [1.16, .52]].forEach(([a, l]) => g.R.line([[a, 1.02], [a, 1.02 - l]], M.ahsapA, 1.2, 6).rect(a - .08, 1.02 - l - .1, .16, .1, M.demir, 6.1, .2));      // çekiçler
  [1.42, 1.64].forEach(a => g.R.put(6, 'Ln ' + K.ks(g.R.c(M.demir, .3)), `M${g.R.P(a - .07, .98)}Q${g.R.P(a - .09, .8)} ${g.R.P(a, .78)}Q${g.R.P(a + .09, .8)} ${g.R.P(a + .07, .98)}`, 'stroke-width="1.4"'));   // nallar

  /* --- çatı: alaturka kiremit, aydınlık yamaç sokağa bakar --- */
  const roof = b.gable(.3, .3, 4.2, 4.6, 1.6, 1.0, M.kiremitK, { axis: 'x', ov: .2, wall: M.griK });
  roof.G.courses({ rh: .27, dens: .5 });
  roof.G.shp('round', 1.88, .2, .5, .46, M.demir, 4).shp('round', 1.94, .26, .38, .34, M.ic, 5);                    // alınlıkta havalandırma gözü
  b.chimney(1.2, 1.5, 2.2, .7, { mat: M.griK, w: .38, s: .6 });

  /* --- ocak evi: önü kemerli taş oda, içinde kor; üstünde kalın baca --- */
  const o = b.box(4.2, .3, 0, 6.3, 2.7, 1.3, M.griK);
  o.L.courses({ rh: .27, bw: .56, dens: .7 }).stones(4, { rh: .27 }); o.R.courses({ rh: .27, bw: .56, dens: .6 }).stones(3, { rh: .27 }).band(0, .3, M.bazalt, .14);
  o.L.arcade(.14, 1.96, 1, 1.04, { pier: .16, th: .55, glow: true, floor: '#6f665c' });
  // kemerin içinde ocak: taş tekne + kor
  o.L.poly([[.52, 0, -.3], [1.6, 0, -.3], [1.6, .46, -.3], [.52, .46, -.3]], M.gri, 5.2, -.2).poly([[.52, .46, -.3], [1.6, .46, -.3], [1.6, .46, -.55], [.52, .46, -.55]], M.bazalt, 5.3, -.1);
  o.L.put(5.4, K.kf('#e8622a>#ff8a3a'), o.L.shapeD('round', .62, .4, .88, .2, -.43)).put(5.5, K.kf('#ffb648>#ffd27a'), o.L.shapeD('round', .8, .43, .52, .13, -.43)).put(5.6, K.kf('#fff0b0>#fff6d0'), o.L.shapeD('round', .96, .45, .2, .08, -.43));
  b.fx('fire', 5.26, 2.3, .5, { s: 1 });
  b.hip(4.05, .15, 6.45, 2.85, 1.3, .55, M.kiremitK);
  const st = b.box(4.85, .95, 1.5, 5.65, 1.75, 2.75, M.gri, { edge: false }); st.L.courses({ rh: .24, bw: .4, dens: .8 }); st.R.courses({ rh: .24, bw: .4, dens: .8 }); st.L.band(.99, .26, '#3a3634', 0, 3); st.R.band(.99, .26, '#3a3634', 0, 3);
  b.box(4.77, .87, 2.75, 5.73, 1.83, 2.87, M.griK, { edge: false, cast: false });
  b.fx('smoke', 5.25, 1.35, 2.9, { s: 1.5 });

  /* --- ocak avlusu: körük, kömür, örs, usta, su fıçısı, demir çubuklar --- */
  b.poly3([[5.72, 2.78, .3], [6.24, 2.78, .3], [6.24, 3.42, .16], [5.72, 3.42, .16]], '#7a5038', { n: [0, .2, 1], bb: [5.72, 2.78, .12, 6.24, 3.42, .32] });      // körük üstü
  b.poly3([[6.24, 3.42, .04], [6.24, 2.78, .04], [6.24, 2.78, .3], [6.24, 3.42, .16]], '#7a5038', { n: [1, 0, 0], bb: [5.72, 2.78, 0, 6.24, 3.42, .12] });
  b.poly3([[5.72, 3.42, .04], [6.24, 3.42, .04], [6.24, 3.42, .16], [5.72, 3.42, .16]], '#7a5038', { n: [0, 1, 0], bb: [5.72, 3.4, 0, 6.24, 3.44, .1] });
  b.line3([[5.98, 3.42, .1], [5.98, 3.75, .3]], M.ahsapK, 1.5);
  b.art(4.58, 3.1, 0, pth(T('#3a3634', -.2), 'M-9 1Q-8 -6 -2 -7Q4 -8 8 -2L10 1Q0 4 -9 1Z') + pth('#4a4644', 'M-6 -1Q-4 -6 0 -6Q3 -5 3 -1Z') + pth('#ff8a3a>#ffb060', K.circ(-2, -3, .9) + K.circ(4, -1, .8)), { r: .3 });
  b.cyl(5.3, 3.85, .17, 0, .3, M.ahsap, { top: M.ahsapA, cast: false });                                               // örs kütüğü
  b.art(5.3, 3.85, .3, pth(T(M.demir, -.3), 'M-7 -3H6L9 -5V-7H-3L-9 -5ZM-3 -3H3L4 1H-4Z') + pth(T(M.demir, .3), 'M-9 -5L-3 -7H9V-6.2H-3L-9 -4.2Z'), { r: .2, h: .3 });
  b.fx('sparks', 5.3, 3.85, .55);
  // usta: deri önlüklü, çekici kalkmış
  b.fig(4.9, 4.2, 0, { body: '#8a5a3a', legs: '#3a3230', hat: 'none', hair: '#2a2420' });
  b.art(4.9, 4.2, 0, pth('#5a3c28', 'M-2.6 -14.6h5.2l.6 7.4h-6.4z') + ln(M.ahsapK, 'M4.2 -14.4L7.6 -19.6', 1.1) + pth(T(M.demir, -.1), 'M5.6 -21.8l3.8 2.2l-1 1.7l-3.8 -2.2z'), { bb: [4.78, 4.08, 0, 5.08, 4.38, .95] });
  b.barrel(5.95, 4.05, 0, { top: '#3f8fa8', r: .22 });
  b.line3([[4.4, 4.9, .05], [5.6, 4.9, .05]], T(M.demir, .2), 1.4).line3([[4.45, 5.0, .05], [5.7, 5.0, .05]], M.demir, 1.4).line3([[4.42, 4.8, .1], [5.5, 4.8, .1]], T(M.demir, -.2), 1.4);

  /* --- ön avlu: tabela, bileği taşı, odun, sandıklar, kılıç askısı --- */
  // tabela: demir kolda asılı nal levhası
  b.line3([[1.78, 4.6, 1.44], [1.78, 5.12, 1.44]], M.demir, 1.5, { pad: .06 });
  b.art(1.78, 5.06, 1.44, ln('#2a2c33', 'M0 0v3', .8) + pth('#2a2c33', 'M-6 3h12v11q-6 3 -12 0z') + ln(M.altin, 'M-2.6 12q-1.2 -5.4 2.6 -5.6q3.8 .2 2.6 5.6', 1.5), { bb: [1.66, 4.94, .8, 1.9, 5.18, 1.46] });
  // bileği taşı: ahşap ayak üstünde taş çark
  b.box(2.6, 5.7, 0, 3.4, 6.0, .3, M.ahsap, { edge: false });
  const gs = new K.Face([2.72, 6.02, .14], [1, 0, 0], [0, 0, 1], .56, .56, [0, 1, 0]);
  gs.shp('round', 0, 0, .56, .56, M.gri, 3, .1).shp('round', .06, .06, .44, .44, M.gri, 4, -.08).shp('round', .22, .22, .12, .12, M.demir, 5);
  b.item([2.72, 6.0, .14, 3.28, 6.04, .7], () => gs.svg(), { cast: false });
  b.woodpile(.35, 4.9, 0, { w: 1.1 });
  b.crate(1.75, 5.7, 0, .42, { fill: '#7a6a62' }).crate(1.3, 6.05, 0, .36).barrel(.7, 5.9).sack(2.2, 6.2, 0, { col: '#5a5450' });
  b.line3([[3.9, 6.5, 0], [3.9, 6.5, .62]], M.ahsapK, 1.5).line3([[4.9, 6.5, 0], [4.9, 6.5, .62]], M.ahsapK, 1.5).line3([[3.9, 6.5, .58], [4.9, 6.5, .58]], M.ahsap, 1.6);
  [4.05, 4.25, 4.45].forEach((x, i) => b.art(x, 6.52, .58, ln(T('#c9d2da', i ? 0 : -.1), 'M0 2V14', 1.5) + ln(M.bronz, 'M-2.4 3.4h4.8', 1.3) + ln(M.ahsapK, 'M0 0v3', 1.6), { bb: [x - .05, 6.5, 0, x + .05, 6.56, .6] }));
  b.art(4.72, 6.56, 0, pth(T(M.kirmizi, -.2), K.ell(0, -8, 5.6, 7)) + pth(M.kirmizi, K.ell(-.6, -8.4, 4.6, 6)) + pth(M.altin, K.circ(-.6, -8.4, 1.6)), { bb: [4.6, 6.52, 0, 4.84, 6.6, .6] });
  b.critter('kedi', 3.55, 5.0, 0, { col: '#5a5450' });

  b.tag(2.4, 6.9, 0).doorAt(.92, 5.0);
});
