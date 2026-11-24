/* Dünya haritasının bölge sahneleri: her biri 7 × 7 birimlik küçük bir izometrik tablo (şehirle aynı çizim seti).
   bolge-maden · bolge-odun · bolge-bitki · bolge-deri · bolge-yaratik  (kıyı ve şehir, harita.js içinde hazır parçalardan kurulur) */
(function () {
  'use strict';
  const K = CK, M = K.M, T = K.tone, pth = K.pth, ln = K.ln, f1 = K.f1;
  const blob = (col, rx, ry, dx = 0, dy = 0) => pth(col, K.ell(dx, dy, rx, ry));

  /* ---------- MADEN OCAĞI: kayalık dağ, kereste destekli ocak ağzı, vagon yolu, cevher yığınları ---------- */
  CK.def('bolge-maden', { w: 7, d: 7, name: 'Maden Ocağı' }, (b) => {
    b.pave(.2, .2, 6.8, 6.8, '#b9aa8c'); b.gpoly([[1.2, 4.6], [5.8, 4.6], [6.2, 6.6], [1, 6.6]], '#a39478', { op: .6 });
    // dağ: üst üste binen kaya kütleleri, tepede kar
    const rock = (pts, z0, z1, c) => { const p = b.prism(pts, z0, z1, c, { T: T(c, .1) }); p.faces.forEach(f => f.courses({ rh: .5, bw: 1.1, dens: .4, dt: -.14 }).stones(3, { rh: .5 })); return p; };
    rock([[.3, .8], [2.4, .3], [5.2, .5], [6.2, 2.2], [5.6, 4.3], [1.2, 4.5], [.3, 3]], 0, 1.7, M.kaya);
    rock([[.8, 1.2], [2.6, .7], [4.6, .9], [5.2, 2.4], [4.4, 3.6], [1.6, 3.7], [.8, 2.6]], 1.7, 3.1, T(M.kaya, .06));
    rock([[1.5, 1.5], [3, 1.1], [4, 1.5], [4.2, 2.6], [3.2, 3.1], [1.9, 2.9]], 3.1, 4.3, T(M.kaya, .1));
    rock([[1.9, 1.7], [3, 1.3], [3.8, 1.7], [3.9, 2.5], [3, 2.9], [2, 2.7]], 4.3, 4.62, '#f1eee6'); rock([[2.3, 1.9], [3, 1.7], [3.4, 2.2], [2.9, 2.5], [2.4, 2.4]], 4.62, 4.95, '#fbf9f4');
    // ocak ağzı: taş alın, kereste çatkı, içeriden vuran ışık
    const g = b.box(1.7, 4.2, 0, 3.5, 4.9, 1.4, M.kaya, { edge: false }); g.L.courses({ rh: .28, bw: .5, dens: .7 });
    g.L.arcade(.3, 1.5, 1, 1.05, { pier: .16, th: .5, glow: true, floor: '#8a7a62' }).timber({ posts: [.36, 1.44], rails: [1.14], wid: 2.4 });
    g.L.lantern(1.62, 1.0);
    // vagon yolu ve cevher vagonu
    b.ground(ln(M.ahsapK, [5, 5.5, 6, 6.5].map(y => `M${K.P(2.25, y)} ${K.P(2.95, y)}`).join(''), 1.6) + ln(M.demir, `M${K.P(2.36, 4.9)} ${K.P(2.36, 6.8)}M${K.P(2.84, 4.9)} ${K.P(2.84, 6.8)}`, 1.2));
    b.cart(2.6, 5.9, 0, 'y', { load: '#8a6f5c', l: .8 });
    // cevher yığınları: bakır, gümüş, altın
    const pile = (x, y, c) => b.art(x, y, 0, blob(T('#6f6860', -.2), 9, 4) + pth('#7f776c', 'M-8 0Q-6 -8 0 -9Q6 -8 8 0Z') + K.dots(c, [[-3, -3], [1, -6], [4, -2], [-1, -1]], 2.4) + K.dots(T(c, .4), [[0, -4], [3, -4]], 1.2), { r: .34 });
    pile(4.3, 5.4, '#c9784a'); pile(5.2, 5.9, '#cfd6dc'); pile(4.6, 6.3, '#e2b84f');
    // izabe ocağı: bacası tüter
    const h = b.box(4.9, 3.5, 0, 6.4, 4.8, .95, M.griK, { edge: false }); h.L.courses({ rh: .24, bw: .5 }).shp('arch', .5, 0, .5, .5, '#e8622a>#ff8a3a', 5, null); h.R.courses({ rh: .24, bw: .5 });
    b.shed(4.8, 3.4, 6.5, 4.9, .95, 1.4, '+y', M.kiremitK); b.chimney(5.3, 3.8, 1.3, .9, { mat: M.griK, w: .34, s: 1.1 }); b.spill(5.6, 5.3, 1.2);
    // çıkrık, sandıklar, madenciler
    b.line3([[1.1, 5.6, 0], [1.5, 5.6, 1.3]], M.ahsapK, 2).line3([[1.9, 5.6, 0], [1.5, 5.6, 1.3]], M.ahsapK, 2).line3([[1.5, 5.6, 1.3], [1.5, 5.6, .5]], '#6a5a4a', .8);
    b.crate(1.5, 5.6, 0, .34, { fill: '#7f776c' }).crate(.8, 6.2, 0, .4).barrel(1.3, 6.4).lamp(3.6, 6.3);
    b.fig(3.4, 5.5, 0, { body: '#7a5a3c', hat: 'hasir', carry: 'kasa' }).fig(1.9, 6.2, 0, { body: '#5f6f82', hat: 'none', flip: true });
    b.art(1.9, 6.2, 0, ln(M.ahsapK, 'M-4 -11L-12 -20', 1.2) + ln(M.demir, 'M-15 -17Q-12 -22 -8 -22', 1.6), { bb: [1.8, 6.1, 0, 2.05, 6.35, 1] });
    b.tree('fistik', .7, 5, { s: .8 }).tree('fistik', 6.3, 6.4, { s: .7 }).rock(6.2, 5.2, 0, { s: .9 }).rock(.5, 6.7, 0, { s: .7 });
    b.tag(3.5, 6.9, 0);
  });

  /* ---------- ULU ORMAN: sık yaşlı ağaçlar, önünde oduncu kampı ---------- */
  CK.def('bolge-odun', { w: 7, d: 7, name: 'Ulu Orman' }, (b) => {
    b.pave(.2, .2, 6.8, 6.8, '#7f9f5c'); b.gpoly([[1.4, 4.4], [6.4, 4.2], [6.6, 6.6], [1, 6.7]], '#a8a070', { op: .55 });
    b.tufts(.4, .4, 6.6, 4, 16, { col: '#4f7a3a' });
    // orman: arkada sık, öne doğru seyrek
    const tr = [['cinar', .9, .9, 1.5], ['fistik', 2.3, .7, 1.4], ['selvi', 3.5, .6, 1.1], ['cinar', 4.7, .9, 1.6], ['fistik', 6, .8, 1.3], ['selvi', .6, 2.2, 1], ['cinar', 1.9, 2.1, 1.7], ['fistik', 3.3, 1.9, 1.5], ['cinar', 4.6, 2.3, 1.4], ['selvi', 5.9, 2.1, 1.1],
      ['fistik', .8, 3.5, 1.3], ['cinar', 2.4, 3.4, 1.3], ['selvi', 6.3, 3.5, 1], ['cinar', .7, 5.2, 1.1]];
    for (const [k, x, y, s] of tr) b.tree(k, x, y, { s });
    // kütük kulübe
    const c = b.box(3.7, 3.2, 0, 5.7, 4.5, 1.0, M.ahsap, { edge: false }); c.L.planks({ dir: 'h', step: .16 }).door(.3, .5, .78, { col: M.ahsapK, sove: null }).win(1.15, .34, .46, .42, { lit: true, shut: M.yesil }); c.R.planks({ dir: 'h', step: .16 });
    b.gable(3.7, 3.2, 5.7, 4.5, 1.0, .7, M.padavra, { axis: 'x', tex: 'rows', wall: M.ahsap }); b.chimney(4.2, 3.6, 1.3, .6, { w: .28, s: .8 });
    // odun yığınları, kütükler, hızar tezgâhı, araba
    b.woodpile(1.6, 5.1, 0, { w: 1.4 }).woodpile(1.6, 5.5, 0, { w: 1.4 }).woodpile(1.9, 5.3, .4, { w: .9 });
    for (const [x, y, r] of [[3.4, 5.3, .2], [4.4, 5.9, .24], [5.6, 5.2, .18], [2.6, 6.3, .2]]) b.cyl(x, y, r, 0, .22, M.ahsap, { top: M.ahsapA, cast: false });
    b.art(4.4, 5.9, .22, ln(M.ahsapK, 'M0 0L7 -10', 1.3) + pth(M.demir, 'M5 -12l5 -1l1 4l-4 2z'), { r: .2 });
    b.line3([[5.2, 6.3, 0], [5.4, 6.3, .5]], M.ahsapK, 1.6).line3([[5.6, 6.3, 0], [5.4, 6.3, .5]], M.ahsapK, 1.6).line3([[6.2, 6.3, 0], [6.4, 6.3, .5]], M.ahsapK, 1.6).line3([[6.6, 6.3, 0], [6.4, 6.3, .5]], M.ahsapK, 1.6).line3([[5.1, 6.3, .56], [6.7, 6.3, .56]], M.ahsapA, 5, { pad: .1 });
    b.cart(3.2, 6.3, 0, 'x', { load: M.ahsap }).fig(4.9, 5.6, 0, { body: M.kirmizi, hat: 'none', hair: '#3a2a20' }).fig(5.9, 5.8, 0, { body: '#4f7d5a', hat: 'hasir', flip: true, carry: 'kasa' });
    b.critter('kedi', 3.9, 4.8, 0, { col: '#8a6a4a' }).flowers(1.1, 6.4, { n: 6, r: .4 });
    b.tag(3.5, 6.9, 0);
  });

  /* ---------- ÇİÇEKLİ ÇAYIR: renk renk çiçek tarhları, ot kurutma askısı, arı kovanları ---------- */
  CK.def('bolge-bitki', { w: 7, d: 7, name: 'Çiçekli Çayır' }, (b) => {
    b.pave(.2, .2, 6.8, 6.8, '#a9c47c');
    // çiçek şeritleri
    const strip = (x0, y0, x1, y1, c) => { b.gpoly([[x0, y0], [x1, y0], [x1, y1], [x0, y1]], c); const r = b.r, pts = []; for (let i = 0; i < (x1 - x0) * (y1 - y0) * 9; i++) pts.push(K.pr(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), 0)); b.ground(K.dots(T(c, .45), pts, 1.6)); };
    strip(.5, .6, 3.1, 1.3, '#b79ad0'); strip(.5, 1.5, 3.1, 2.2, '#e8c85a'); strip(.5, 2.4, 3.1, 3.1, '#e89ab0'); strip(.5, 3.3, 3.1, 4, '#f2ead8');
    strip(3.6, .6, 4.3, 3.2, '#d0408c'); strip(4.5, .6, 5.2, 3.2, '#8fb85a'); strip(5.4, .6, 6.1, 3.2, '#e0843a');
    b.flowers(1.2, 5, { n: 12, r: .8 }).flowers(5.6, 5.9, { n: 10, r: .6 }).flowers(3.2, 6.3, { n: 8, r: .5 }).tufts(.4, 4.3, 6.6, 6.7, 18);
    // otacının kulübesi: yuvarlak, saz külahlı
    const h = b.cyl(5.1, 4.4, .85, 0, .95, M.kirec); h.face(-.3, 0, .5, .8).door(.04, .42, .74, { kind: 'arch', col: M.yesil, sove: null }); h.face(.45, .4, .4, .4).win(.03, 0, .34, .36, { kind: 'round', lit: true });
    b.cone(5.1, 4.4, 1.1, .95, 1.0, M.saz); b.fx('smoke', 5.1, 4.4, 2.0, { s: .7 });
    // kurutma askısı: demet demet otlar
    b.line3([[1.6, 5.9, 0], [1.6, 5.9, .9]], M.ahsapK, 1.5).line3([[3.2, 5.9, 0], [3.2, 5.9, .9]], M.ahsapK, 1.5).line3([[1.6, 5.9, .86], [3.2, 5.9, .86]], M.ahsap, 1.6);
    [1.85, 2.15, 2.45, 2.75, 3.0].forEach((x, i) => b.art(x, 5.92, .84, pth(['#7fa35e', '#b79ad0', '#e8c85a', '#7fa35e', '#d0408c'][i], 'M-2 0h4l1.6 9q-3.6 2 -7.2 0z') + ln('#6a5a4a', 'M-2 1.6h4', .8), { bb: [x - .08, 5.9, .4, x + .08, 5.96, .86] }));
    // arı kovanları
    for (const [x, y] of [[.9, 4.6], [1.5, 4.4], [2.1, 4.7]]) { const k = b.box(x, y, 0, x + .42, y + .42, .5, M.sari, { edge: false, cast: false }); k.L.planks({ dir: 'h', step: .16 }).rect(.14, .04, .14, .05, M.ic, 5); b.box(x - .04, y - .04, .5, x + .46, y + .46, .58, M.ahsapK, { edge: false, cast: false }); }
    b.fig(3.9, 5.2, 0, { body: '#8a4f9a', hat: 'ortu', robe: true, hatCol: '#f2ead8', carry: 'sepet' }).fig(2.5, 4.9, 0, { body: '#4f7d5a', hat: 'hasir', flip: true });
    b.tree('narenciye', 6.2, 5, { s: 1.1 }).tree('cicek', .6, 6.3, { s: 1.1 }).pot(4.3, 5.9, 0, { plant: true, fl: M.begonvil, s: 1.2 });
    b.tag(3.5, 6.9, 0);
  });

  /* ---------- AV SAHASI: kuru bozkır, deri çadırlar, gerili postlar, ateş başı ---------- */
  CK.def('bolge-deri', { w: 7, d: 7, name: 'Av Sahası' }, (b) => {
    b.pave(.2, .2, 6.8, 6.8, '#cdbb7a'); b.gpoly([[.6, 3.6], [6.4, 3.4], [6.5, 6.6], [.8, 6.6]], '#b9a567', { op: .6 }); b.tufts(.4, .4, 6.6, 6.6, 26, { col: '#8a7a3a' });
    // uzakta otlayan geyikler
    const deer = (x, y, f) => b.art(x, y, 0, `<g transform="scale(${f ? -1 : 1} 1)">` + `<ellipse cx="1" cy="0" rx="7" ry="2.4" fill="#1b2440" opacity=".18"/>` + pth('#9a6a42', 'M-6 -9q0 -3 3 -3h6q3 0 3.4 3l.6 3h-1.4l-.4 6h-1.4l-.2 -6h-5l-.2 6h-1.4l-.4 -6q-1.6 -.8 -1.6 -3z') + pth('#9a6a42', 'M5.4 -11.6l2.6 -4.6q2.2 .2 2.4 2.2l-1.6 .6l-1.2 3.4z') + pth('#f2ead8', K.circ(-6, -8.4, 1.1))
      + ln('#6a4428', 'M7.6 -16l-1.4 -4M8.6 -16.2l1 -4.4M7 -18l-2 -.8M9.2 -18.6l1.8 -1', .8) + '</g>', { r: .3, h: .7 });
    deer(1.2, 1.3, 0); deer(2.4, .9, 1); deer(5.6, 1.5, 1);
    b.tree('zeytin', .8, 2.6, { s: 1.1 }).tree('zeytin', 6.2, 2.9, { s: 1 }).tree('fistik', 3.6, .9, { s: 1 }).rock(4.6, 1.2, 0, { s: 1.1 }).rock(6.3, 5.9, 0, { s: .8 });
    // deri çadırlar
    const tent = (x, y, r, c) => { b.cone(x, y, r, 0, r * 1.7, c, { tex: false }); const p = K.pr(x + r * .5, y + r * .5, 0);
      b.art(x + r * .55, y + r * .55, 0, pth('#3a2c22', `M-${f1(r * 5)} 0L0 -${f1(r * 17)}L${f1(r * 5)} 0Z`) + ln(T(c, -.3), `M0 -${f1(r * 17)}v${f1(r * 17)}`, .8), { bb: [x, y, 0, x + r, y + r, r] });
      b.line3([[x - .08, y, r * 1.6], [x - .2, y, r * 2]], M.ahsapK, 1.2).line3([[x + .08, y, r * 1.6], [x + .22, y, r * 2]], M.ahsapK, 1.2); };
    tent(1.9, 3.2, 1.0, '#b08a5a'); tent(4.3, 2.9, .85, '#c29a66');
    // gerili postlar
    const hide = (x, y, c) => { b.line3([[x, y, 0], [x, y, 1.05]], M.ahsapK, 1.5).line3([[x + .95, y, 0], [x + .95, y, 1.05]], M.ahsapK, 1.5).line3([[x, y, 1], [x + .95, y, 1]], M.ahsapK, 1.5).line3([[x, y, .12], [x + .95, y, .12]], M.ahsapK, 1.3);
      b.poly3([[x + .16, y, .24], [x + .5, y, .18], [x + .8, y, .26], [x + .84, y, .6], [x + .78, y, .9], [x + .48, y, .94], [x + .18, y, .88], [x + .12, y, .56]], c, { n: [0, 1, 0], bb: [x, y, .12, x + .95, y + .02, 1] }); };
    hide(.7, 4.9, '#c9a26b'); hide(5.3, 4.4, '#9a6a42');
    // ateş başı: taş halka, şişte et
    b.art(3.4, 5.2, 0, K.dots('#8a8478', [[-8, 0], [-5, 3], [0, 4], [5, 3], [8, 0], [5, -3], [0, -4], [-5, -3]], 3.4) + blob('#3a3230', 5, 2.2), { r: .3 });
    b.fx('fire', 3.4, 5.2, .05, { s: .9 }); b.spill(3.4, 5.2, 1.6);
    b.line3([[2.9, 5.2, 0], [2.9, 5.2, .55]], M.ahsapK, 1.2).line3([[3.9, 5.2, 0], [3.9, 5.2, .55]], M.ahsapK, 1.2).line3([[2.9, 5.2, .52], [3.9, 5.2, .52]], M.demir, 1);
    // avcılar, yay askısı, köpek
    b.fig(2.6, 5.9, 0, { body: '#7a5a3c', hat: 'none', hair: '#2a2420' }).fig(4.4, 5.8, 0, { body: '#8a6a4a', hat: 'hasir', flip: true });
    b.art(2.6, 5.9, 0, ln(M.ahsapK, 'M5 -18Q11 -10 5 -2', 1.2) + ln('#e8e0d0', 'M5 -18V-2', .5), { bb: [2.5, 5.8, 0, 2.8, 6.1, 1] });
    b.critter('kedi', 4.9, 6.3, 0, { col: '#6a5a4a' }).crate(1.2, 6.2, 0, .36).sack(1.7, 6.4).hay(5.6, 6.2);
    b.tag(3.5, 6.9, 0);
  });

  /* ---------- KADİM HARABELER: yıkık tapınak, kırık sütunlar, ışıyan sunak, karanlıkta parlayan gözler ---------- */
  CK.def('bolge-yaratik', { w: 7, d: 7, name: 'Kadim Harabeler' }, (b) => {
    b.pave(.2, .2, 6.8, 6.8, '#7f8a74'); b.gpoly([[.8, 1], [6.2, .8], [6.4, 5.6], [.6, 5.8]], '#6c7568', { op: .7 }); b.tufts(.4, .4, 6.6, 6.6, 14, { col: '#4a5a44' });
    const ST = '#b9b3a2';
    // taban ve basamaklar
    const p = b.box(1.2, 1.4, 0, 5.8, 4.8, .3, ST, { edge: false }); p.L.courses({ rh: .15, bw: .7 }); p.R.courses({ rh: .15, bw: .7 }); p.T.courses({ rh: .8, bw: 1.2, dens: .5, dt: -.08 });
    b.stairs(2.8, 4.8, 4.2, 5.3, .3, 0, 'y', ST);
    // arka duvar: kemerli, yarısı yıkık, sarmaşıklı
    const w = b.box(1.4, 1.5, .3, 4.4, 1.9, 2.5, ST, { edge: false }); w.L.courses({ rh: .28, bw: .6, dens: .7 }).stones(8).arcade(.3, 2.7, 2, 1.5, { kind: 'point', pier: .3, th: .4, thru: true, floor: false }).vine({ kind: 'ivy', a0: .1, a1: 1.4, drop: [.4, 1.3] });
    b.box(4.4, 1.5, .3, 5.4, 1.9, 1.2, ST, { edge: false }).L.courses({ rh: .28, bw: .6 });
    // sütunlar: kimi sağlam, kimi kırık; ikisinin üstünde lento
    const col = (x, y, h, cap) => { const c = b.cyl(x, y, .2, .3, .3 + h, T(ST, .08)); c.courses(.34, -.06); c.band(.3, .12, ST, .05, 'lip'); if (cap) c.band(.3 + h - .12, .12, ST, .06, true); };
    col(1.7, 4.3, 2.0, 1); col(2.9, 4.3, 2.0, 1); col(4.1, 4.3, 1.1, 0); col(5.3, 4.3, .6, 0); col(5.3, 3, 1.7, 1); col(1.7, 3, .9, 0);
    b.box(1.45, 4.08, 2.3, 3.15, 4.52, 2.56, ST, { edge: false }).L.courses({ rh: .13, bw: .6 });
    // devrilmiş sütun parçaları
    b.rock(4.9, 5.4, 0, { s: .9, col: ST }).rock(5.6, 5.1, 0, { s: .7, col: ST }).rock(1.2, 5.5, 0, { s: 1, col: ST }).rock(4.5, 4.9, .3, { s: .5, col: ST });
    // sunak: ışıyan kadim işaret
    const a = b.box(3.2, 2.7, .3, 4, 3.4, .85, '#8f8a80', { edge: false }); a.L.courses({ rh: .18, bw: .4 }); a.T.shp('round', .14, .12, .52, .46, '#5fd0c0>#9ff5e6', 4, null).shp('round', .28, .24, .24, .22, '#d8fff6>#ffffff', 5, null);
    b.fx('glint', 3.6, 3.05, 1.0); b.fx('steam', 3.6, 3.05, .9, { s: .7 }); b.spill(3.6, 3.6, 1.4);
    // meşaleler
    for (const [x, y] of [[2.6, 5.5], [4.4, 5.5]]) { b.line3([[x, y, 0], [x, y, .8]], M.demir, 1.6); b.fx('fire', x, y, .82, { s: .6 }); }
    // ölü ağaçlar ve karanlıktan bakan gözler
    const dead = (x, y, s) => b.art(x, y, 0, ln('#4a4038', `M0 0V${f1(-22 * s)}M0 ${f1(-12 * s)}l${f1(-8 * s)} ${f1(-8 * s)}M0 ${f1(-16 * s)}l${f1(7 * s)} ${f1(-9 * s)}M${f1(-8 * s)} ${f1(-20 * s)}l${f1(-3 * s)} ${f1(-5 * s)}M${f1(7 * s)} ${f1(-25 * s)}l${f1(4 * s)} ${f1(-3 * s)}`, 1.6 * s), { r: .2, h: 1 });
    dead(.7, 1.2, 1.2); dead(6.3, 1.6, 1); dead(6.2, 6.2, .8);
    b.art(.9, 3.4, 0, blob('#2a2a34', 9, 6.5, 0, -6) + pth('#2a2a34', 'M-6 -10l-2 -6l5 3zM6 -10l2 -6l-5 3z') + K.dots('#ff5a3a>#ff9a6a', [[-3, -7], [3, -7]], 2.2), { r: .3, h: .6 });
    b.art(6, 3.9, 0, blob('#2a2a34', 7, 5, 0, -5) + K.dots('#b8ff6a>#e0ffa0', [[-2.4, -6], [2.4, -6]], 1.8), { r: .3, h: .5 });
    b.tag(3.5, 6.9, 0);
  });
})();
