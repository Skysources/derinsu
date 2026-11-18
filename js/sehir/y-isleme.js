/* İşlemehane — su çarklı balık işleme değirmeni: taş çark evi, üstü ahşap ambar kanadı, tütsühane ve açık avlu.
   Ana cephe +y (aydınlık). Parsel 8 × 7; arka (y=0) istinat duvarına yaslıdır, görünmez.
   Su: soldan gelen ahşap oluk (x=0, y≈5, z≈2.9) -> üstten vurmalı çark -> taş çukur -> kuyruk arkı (x 1.3–1.9, y=7'den çıkar).
   Sıra önemli: çatıların altında kalan her şey çatılardan ÖNCE eklenir (derinlik sıralaması dizin sırasına düşebiliyor). */
CK.def('isleme', { w: 8, d: 7, name: 'İşlemehane' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, P = K.P, PL = K.PL, F = K.Face, f1 = K.f1;
  const TL = K.toneOf([0, 1, 0]), TR = K.toneOf([1, 0, 0]), TT = K.toneOf([0, 0, 1]);
  const GUM = '#b4c2cf', TUZ = '#f8f6ef', HALAT = '#8a7450', TUGLA = '#b9775a';
  const q = (...pts) => 'M' + PL(pts) + 'Z';

  /* ================= zemin ================= */
  b.pave(0, 4.4, 8, 7, '#d6c8a6'); b.pave(5.5, 2.7, 8, 4.4, '#d6c8a6');
  b.gpoly([[0, 4.4], [.3, 4.4], [.3, 5.46], [1.18, 5.46], [1.18, 7], [0, 7]], M.cim);                         // ark kıyısı: çimen
  b.gpoly([[.3, 4.45], [3.2, 4.45], [3.35, 5.6], [2.15, 5.8], [2.05, 7], [1.9, 7], [1.9, 5.46], [.3, 5.46]], '#bdb091');   // çark çevresi: ıslak taş
  b.gpoly([[5.6, 3.1], [7.2, 3.0], [7.45, 4.5], [6.3, 4.95], [5.4, 4.5]], '#c6b797');                           // tezgâh çevresi: çiğnenmiş zemin
  b.gpoly([[6.5, 5.7], [7.8, 5.65], [7.85, 6.75], [6.6, 6.8]], '#c9b88f');                                      // mengene altı: yağ lekeli zemin
  { let d = ''; const r = K.rng(31); for (let y = 4.95; y < 7; y += .66) { let x = 2.2 + r() * .4; while (x < 7.9) { const e = Math.min(7.95, x + .7 + r() * 1.4); d += `M${P(x, y)} ${P(e, y)}`; if (r() < .5) d += `M${P(e, y)} ${P(e, y + .66)}`; x = e + .4 + r() * .9; } }
    b.ground(ln('#c2b28f', d, .8)); }                                                                          // döşeme derzleri
  b.tufts(.05, 5.5, 1.1, 6.95, 8).flowers(.45, 5.85, { n: 5, r: .3, cols: [M.bez, M.sari, M.mor] });
  b.spill(3.8, 4.6, 1.7); b.spill(6.85, 3.2, 1.5);

  /* ================= çark çukuru ve kuyruk arkı (zeminin altında) ================= */
  const H = .24, SHF = H * K.ZK, px0 = .3, px1 = 2.9, py0 = 4.66, py1 = 5.34, rx0 = 1.3, rx1 = 1.9;
  // taş bordürler (zemin katmanında: üst, aydınlık yan, gölge yan)
  { let t = '', l = '', r = ''; const kz = .07;
    for (const [x0, y0, x1, y1] of [[.18, 4.54, 3.02, 4.66], [.18, 4.66, .3, 5.34], [.18, 5.34, 1.3, 5.46], [1.9, 5.34, 3.02, 5.46], [2.9, 4.66, 3.02, 5.34], [1.18, 5.46, 1.3, 7], [1.9, 5.46, 2.02, 7]]) {
      t += q([x0, y0, kz], [x1, y0, kz], [x1, y1, kz], [x0, y1, kz]); l += q([x0, y1, 0], [x1, y1, 0], [x1, y1, kz], [x0, y1, kz]); r += q([x1, y1, 0], [x1, y0, 0], [x1, y0, kz], [x1, y1, kz]); }
    b.ground(pth(T(M.tas, TL), l) + pth(T(M.tas, TR), r) + pth(T(M.tas, TT + .06), t)); }
  const pw = (o, u, w, n, shape, bb) => { const f = new F(o, u, [0, 0, 1], w, H, n, shape); f.fill(M.tasK, -.14).courses({ rh: .12, bw: .42, dens: .8 }).band(0, .07, '#6f7f6a', -.05); b.item(bb, () => f.svg(), { cast: false }); };
  pw([px0, py0, -H], [1, 0, 0], px1 - px0, [0, 1, 0], [[0, 0], [px1 - px0 - SHF, 0], [px1 - px0, H], [0, H]], [px0, py0 - .02, -H, px1, py0, 0]);
  pw([px0, py1, -H], [0, -1, 0], py1 - py0, [1, 0, 0], [[SHF, 0], [py1 - py0, 0], [py1 - py0, H], [0, H]], [px0 - .02, py0, -H, px0, py1, 0]);
  pw([rx0, 7, -H], [0, -1, 0], 7 - py1, [1, 0, 0], [[SHF, 0], [7 - py1 + SHF, 0], [7 - py1, H], [0, H]], [rx0 - .02, py1, -H, rx0, 7, 0]);
  b.pool(px0, py0, px1 - SHF, py1 - SHF, -H); b.pool(rx0, py1 - SHF, rx1 - SHF, 7 - SHF, -H);
  b.art(1.7, 4.95, -H, pth(M.kopuk, K.ell(0, 0, 13, 4.2) + K.ell(15, 3, 6, 2.2) + K.ell(-13, -2, 5, 1.8), 'opacity=".75"') + pth('#ffffff', K.circ(-4, -1, 1.6) + K.circ(5, 1, 1.9) + K.circ(11, 3.4, 1.2)), { bb: [1, 4.7, -H, 2.4, 5.05, -H + .01] });   // çarkın altında köpük

  /* ================= çark evi: kesme taş, iki kat yüksekliğinde ================= */
  const w = b.box(.4, .3, 0, 3, 4.4, 2.05, M.tasK);
  w.L.courses({ rh: .26, bw: .6, dens: .5 }).stones(7, { rh: .26 }).shadeTop(.16);
  w.L.band(0, .42, '#8d8a70', -.02).band(1.3, .08, M.tas, .14, 3);
  // çarkın ve oluğun duvara düşen gölgesi; yosun
  { const ring = [], c = [1.6, .08], N = 9; for (let i = 0; i <= N; i++) { const t = .05 + i / N * 3.04; ring.push([Math.min(2.6, c[0] + Math.cos(t) * 1.32), Math.max(0, c[1] + Math.sin(t) * 1.32)]); }
    for (let i = N; i >= 0; i--) { const t = .05 + i / N * 3.04; ring.push([Math.min(2.6, c[0] + Math.cos(t) * .92), Math.max(0, c[1] + Math.sin(t) * .92)]); }
    w.L.poly(ring, M.tasK, 2.8, -.15).rect(0, 1.72, 1.9, .3, M.tasK, 2.8, -.13); }
  w.L.poly([[.1, 0], [.9, 0], [.8, .3], [.5, .5], [.2, .34]], '#7f8f5e', 2.3, -.04).poly([[1.5, 0], [2.6, 0], [2.6, .22], [2.2, .44], [1.8, .3]], '#7f8f5e', 2.3, -.04);
  w.L.win(2.02, 1.46, .34, .42, { kind: 'arch', sove: M.tas, lit: true });
  w.R.courses({ rh: .26, bw: .6, dens: .6, a1: .62 }).band(0, .42, '#8d8a70', -.02).band(1.3, .08, M.tas, .14, 3).lantern(.3, 1.2);
  w.R.vine({ kind: 'ivy', a0: 0, a1: .55, top: 2.0, drop: [.3, .9], dens: .9 });
  // yatak taşı ve çark mili
  const yt = b.box(1.34, 4.4, .84, 1.86, 4.64, 1.46, M.tas, { edge: false });
  yt.L.shp('round', .13, .18, .26, .26, M.ic, 4).band(.52, .1, M.tas, .16, 3); yt.R.band(.52, .1, M.tas, .16, 3);
  b.line3([[1.6, 4.64, 1.15], [1.6, 5.12, 1.15]], T(M.ahsapK, -.1), 5, { pad: .08 });

  /* ================= ambar kanadı: taş zemin kat, üstü ahşap kaplama ================= */
  const g = b.box(3, .3, 0, 5.5, 3.8, 1.2, M.tas);
  g.L.courses({ rh: .25, bw: .58, dens: .5 }).stones(4, { rh: .25 }).band(0, .26, M.tasK, -.02).shadeTop(.2);
  g.L.door(.36, .9, 1.0, { kind: 'arch', col: M.mavi, sove: M.mermer, double: true });
  g.L.lantern(1.45, 1.0);
  g.L.win(1.76, .42, .44, .54, { kind: 'arch', sove: M.mermer, shut: M.mavi, lit: true });
  g.L.vine({ kind: 'boug', a0: 2.14, a1: 2.5, top: 1.2, drop: [.3, .9], dens: .9, stem: 2.42 });
  g.R.courses({ rh: .25, bw: .58, dens: .5, a1: 1.12 }).band(0, .26, M.tasK, -.02).shadeTop(.16);
  g.R.door(.32, .52, .9, { kind: 'seg', col: M.ahsap, sove: M.tasK });
  const u = b.box(3, .3, 1.2, 5.5, 3.94, 2.0, M.ahsap, { edge: false });
  u.L.planks({ step: .19, dt: -.2 }).timber({ posts: [.04, 1.5, 2.46], rails: [.04, .76] }).shadeTop(.12, -.2);
  u.L.win(1.78, .2, .4, .42, { frame: M.bez, shut: M.mavi, box: true, lit: .7 });
  u.R.planks({ step: .19, dt: -.2, a1: 1.3 }).timber({ posts: [.04, 1.1], rails: [.04] });
  u.R.win(.42, .22, .34, .38, { frame: M.bez, lit: true });

  /* ================= tütsühane: isli sıva, panjurlu menfezler ================= */
  const s = b.box(5.5, .3, 0, 7.3, 2.7, 1.45, M.krem);
  const louv = (f, a, b0, wd, h, n = 3) => { f.rect(a - .04, b0 - .04, wd + .08, h + .08, M.ahsapK, 4).rect(a, b0, wd, h, M.ic, 5); for (let i = 0; i < n; i++) f.rect(a, b0 + h * (i + .2) / n, wd, h * .46 / n, M.ahsap, 6, .08); return f; };
  const soot = (f, a, b0, wd, h) => f.poly([[a, b0], [a + wd, b0], [a + wd * .8, b0 + h], [a + wd * .3, b0 + h * .8]], '#8a7a6a', 2.4, -.12);
  s.L.band(0, .24, M.tasK, -.02).patches(1, { col: TUGLA, a0: .9, b0: .5, b1: .9 }).shadeTop(.14);
  s.L.door(.2, .56, .94, { kind: 'seg', col: M.ahsapK, sove: M.tas });
  louv(s.L, .22, 1.1, .5, .2); louv(s.L, 1.08, 1.1, .5, .2); soot(s.L, .16, 1.3, .62, .15); soot(s.L, 1.02, 1.3, .62, .15);
  // külhan ağzı: gece kor ışığı
  s.L.shp('arch', 1.06, 0, .56, .5, M.tas, 3, .1).shp('arch', 1.13, 0, .42, .42, '#3a2620>#b8521e', 4, null).shp('round', 1.2, .03, .28, .13, '#c8562a>#ffb050', 5, null).shp('round', 1.27, .05, .14, .07, '#ffb648>#fff0b0', 5.1, null);
  soot(s.L, 1.08, .5, .52, .3);
  // duvarda tütsülenmiş balık dizisi
  s.L.line([[.94, .98], [1.72, .98]], M.ahsapK, 1.2, 7);
  for (let i = 0; i < 6; i++) { const a = 1.02 + i * .125; s.L.poly([[a, .97], [a + .045, .86], [a, .74], [a - .045, .86]], '#b97a34', 7.1, i % 2 ? .12 : -.02); }
  s.R.band(0, .24, M.tasK, -.02).shadeTop(.14);
  louv(s.R, .3, .92, .5, .3, 4); louv(s.R, 1.12, .92, .5, .3, 4); soot(s.R, .24, 1.22, .62, .2); soot(s.R, 1.06, 1.22, .62, .2);
  b.fx('fire', 6.84, 2.74, .04, { s: .45 });
  // tabela: köşeden uzanan demir kolda balıklı levha (sokağa bakar)
  b.line3([[5.5, 3.9, 1.8], [6.14, 3.9, 1.8]], M.demir, 1.5, { pad: .04 }).line3([[5.5, 3.9, 1.52], [5.84, 3.9, 1.8]], M.demir, 1);
  b.art(5.6, 3.9, 1.8, `<g transform="${K.fxArt.plane('y')}">` + ln('#2a2c33', 'M1.6 0v2.4M10.4 0v2.4', .7) + pth(M.altin, 'M0 2.2h12v8.6h-12z') + pth(M.lacivert, 'M.8 3h10.4v7h-10.4z') + pth('#f2e8d2', 'M2.2 6.5q2.6 -2.8 5.4 0q-2.8 2.8 -5.4 0zM7.2 6.5l2.4 -1.9v3.8z') + '</g>', { bb: [5.6, 3.88, 1.3, 6.12, 3.92, 1.8] });

  /* ================= avlu: fıçılar, tuz, temizleme tezgâhı ================= */
  b.barrel(4.5, 4.12, 0, { r: .2 }).barrel(4.94, 4.16, 0, { r: .2, top: '#5f9aa6' });
  b.slab(4.78, 4.42, 5.72, 5.12, .04, .04, '#9a7a52', { cast: false });                                      // tuz sergisi: tahta ızgara
  b.cone(5.3, 4.74, .33, .04, .4, TUZ, { tex: false, cast: false }); b.cone(4.98, 4.92, .2, .04, .24, TUZ, { tex: false, cast: false });
  b.art(5.6, 5.02, .04, ln(M.ahsapA, 'M0 0L-3 -15', 1.3) + pth(T(M.demir, .2), 'M-2.4 1.4L2.2 .6L1.2 -3.4L-3 -2.6Z'), { r: .06, h: .5 });   // tuz küreği
  b.sack(5.72, 4.3, 0, { col: '#e3d8bd' });
  // tezgâh: iki ayak, kalın tabla, üstünde balık yığını ve kesme tahtası; hasır şapkalı usta
  b.fig(6.32, 3.5, 0, { body: '#3f6f8a', legs: '#4a4038', hat: 'hasir' });
  b.art(6.32, 3.5, 0, pth('#efe6d0', 'M-2.7 -14.6h5.4l.8 8.4h-7z') + pth('#c9806a', K.circ(.8, -9.4, 1)) + ln('#e9eef2', 'M-4.4 -9.2l-3.4 2.2', 1.2), { bb: [6.19, 3.37, 0, 6.47, 3.66, .95] });
  b.box(5.94, 3.76, 0, 6.02, 4.1, .35, M.ahsapK, { edge: false, T: null, cast: false }); b.box(6.7, 3.76, 0, 6.78, 4.1, .35, M.ahsapK, { edge: false, T: null, cast: false });
  b.slab(5.84, 3.7, 6.88, 4.16, .41, .06, M.ahsapA);
  b.art(6.5, 3.93, .41, pth(T(GUM, -.3), 'M-10 0q2 -4.4 10 -4.6q8 .2 10 4.6q-10 3.4 -20 0z') + pth(GUM, 'M-7 -1.6q3.4 -2.4 7 0q-3.6 2.2 -7 0zM-1 -3q3.6 -2 7 .2q-3.6 2 -7 -.2zM-3 .4q3.4 -2 7 0q-3.6 2 -7 0z') + pth('#3a4450', K.circ(-5.6, -1.6, .5) + K.circ(.4, -2.8, .5) + K.circ(-1.6, .4, .5)), { bb: [6.2, 3.75, .41, 6.86, 4.14, .56] });
  b.art(6.06, 3.96, .41, pth(M.ahsapK, 'M-6 0l5 -2.6l6 3l-5 2.6z') + pth('#e9a58c', 'M-2.6 .2q2 -2 5 -.4q-2.4 1.8 -5 .4z'), { bb: [5.86, 3.75, .41, 6.2, 4.14, .5] });
  b.cyl(5.72, 4.52, .12, 0, .2, M.ahsap, { top: '#9a4f48', cast: false });                                       // artık kovası
  // balık çalan kedi ve bekleyen martılar
  b.critter('kedi', 6.6, 4.78, 0);
  b.art(6.6, 4.78, 0, pth(GUM, 'M-9.6 -5.6q2.6 -2 5.2 0q-2.6 2 -5.2 0zM-9.4 -5.6l-2.2 -1.6v3.2z'), { bb: [6.5, 4.88, 0, 6.7, 4.92, .3] });
  b.critter('marti', 7.2, 4.45, 0).critter('marti', 6.1, 4.62, 0, { flip: true });
  b.cyl(7.18, 3.72, .15, 0, .17, '#c9a04e', { top: GUM, cast: false });                                          // balık sepeti

  /* ================= kurutma sehpaları: ipe dizili yarılmış balıklar ================= */
  const rack = (x0, x1, y, h, sd) => {
    const r = K.rng(sd), cs = ['#efe3c8', '#cfd6d4', '#e9c3a8'], ds = ['', '', '']; let lines = `M${P(x0 - .1, y, h)} ${P(x1 + .1, y, h)}`, legs = '';
    for (const x of [x0, x1]) legs += `M${P(x, y - .22, 0)} ${P(x, y, h)} ${P(x, y + .22, 0)}`;
    const row = (yy, zz, n, off) => { lines += `M${P(x0, yy, zz)} ${P(x1, yy, zz)}`; for (let i = 0; i < n; i++) { const p = K.pr(x0 + (i + .5 + off) * (x1 - x0) / n, yy, zz), l = 3 + r() * 1.2;
      ds[Math.floor(r() * 3)] += `M${f1(p[0])} ${f1(p[1])}l-1.8 ${f1(l)}l1.8 ${f1(l + 1.4)}l1.8 ${f1(-l - 1.4)}z`; } };
    row(y, h - .03, Math.round((x1 - x0) / .16), 0); row(y + .12, h * .52, Math.round((x1 - x0) / .17), .3);
    b.item([x0, y - .22, 0, x1, y + .22, h], ln(T(M.ahsapK, .06), legs, 1.7) + ln(M.ahsap, lines, 1.1) + ds.map((d, k) => pth(cs[k], d)).join(''), { cast: false });
  };
  rack(3.45, 5.05, 5.5, 1.0, 5); rack(3.9, 5.5, 6.3, .86, 9);
  b.fig(5.42, 5.8, 0, { body: M.bezK, legs: '#4a3a34', hat: 'ortu', hatCol: M.bez, robe: true, carry: 'sepet' });

  /* ================= yağ mengenesi: taş tekne, hasır keseler, koca ahşap burgu ================= */
  const mx = 7.15, my = 6.15;
  b.fig(7.74, 5.72, 0, { body: '#b9603a', legs: '#3f3a36', hat: 'sarik', hatCol: M.bez });
  b.line3([[7.68, 5.78, .34], [7.5, 6.0, 1.62]], HALAT, .9);
  const dk = x => { const d = b.box(x, my - .07, 0, x + .14, my + .07, 1.3, M.ahsapA, { edge: false }); d.L.band(.2, .05, M.demir, .1, 3).band(1.02, .05, M.demir, .1, 3); };
  dk(mx - .54);
  b.cyl(mx, my, .36, 0, .22, M.tas, { top: '#b89a3e' });
  b.cyl(mx, my, .27, .22, .56, M.saz, { top: T(M.saz, -.2), cast: false }).band(.32, .025, T(M.saz, -.4), .004, false).band(.44, .025, T(M.saz, -.4), .004, false);
  b.cyl(mx, my, .3, .56, .63, M.ahsapK, { cast: false });
  const burgu = (z0, z1) => { const n = Math.round((z1 - z0) / .09); let d = ''; for (let i = 0; i < n; i++) d += `M-2.2 ${f1(-1.2 - i * 2.65)}l4.4 -1.5`;
    b.line3([[mx, my, z0], [mx, my, z1]], M.ahsapA, 4.4, { pad: .05 }); b.art(mx, my, z0, ln(T(M.ahsapK, .1), d, .9), { bb: [mx - .06, my - .06, z0, mx + .06, my + .06, z1] }); };
  burgu(.63, 1.3);
  dk(mx + .4);
  const kr = b.box(mx - .62, my - .1, 1.3, mx + .62, my + .1, 1.46, M.ahsap, { edge: false }); kr.L.planks({ dir: 'h', step: .08, dt: -.16 });
  burgu(1.46, 1.68);
  b.line3([[mx - .42, my + .18, 1.64], [mx + .42, my - .18, 1.64]], M.ahsapK, 2.2, { pad: .05 });
  // tekneden küpe akan yağ; küpler ve amforalar
  b.art(mx, my + .36, .18, pth(T(M.tas, .1), 'M-2.6 -1.2h5.2l-1 4.4h-3.2z') + ln('#d9a92e', 'M0 3v9', 1.1), { bb: [mx - .1, my + .36, 0, mx + .1, my + .5, .3] });
  const amph = (x, y, sc = 1, c = '#c58a5c') => b.art(x, y, 0, `<g transform="scale(${sc})">` + pth(T(c, -.32), 'M-.8 0Q-5.4 -5 -4.4 -9.6Q-3.6 -11.6 -1.7 -12.4V-15.4H1.7V-12.4Q3.6 -11.6 4.4 -9.6Q5.4 -5 .8 0Z') + pth(T(c, .1), 'M-.8 0Q-5.4 -5 -4.4 -9.6Q-3.6 -11.6 -1.7 -12.4V-15.4H-.2Q-1.6 -8 -.4 0Z') + ln(T(c, -.2), 'M-1.7 -14.6Q-5 -14.2 -4 -10.4M1.7 -14.6Q5 -14.2 4 -10.4', 1) + '</g>', { r: .11, h: .5 });
  b.pot(mx, my + .64, 0, { col: '#c58a5c', s: 1.1 });
  amph(6.3, 6.3, 1.05); amph(6.56, 6.56, .95, '#b97a52'); amph(6.0, 6.62, .9, '#d09a66');
  b.fx('glint', mx + .02, my + .64, .44);

  /* ================= ağ kurutma çiti (sağ kenar), odun ================= */
  { const nx = 7.9, y0 = 3.5, y1 = 5.0, h = .74; let d = `M${P(nx, y0, h - .04)} ${P(nx, y1, h - .04)}`, m = ''; for (const y of [y0, (y0 + y1) / 2, y1]) d += `M${P(nx, y, 0)} ${P(nx, y, h)}`;
    for (let i = 0; i < 6; i++) { const y = y0 + .1 + i * .25; m += `M${P(nx, y, h - .04)} ${P(nx, Math.min(y1, y + .3), .3)}M${P(nx, y + .12, h - .04)} ${P(nx, Math.max(y0, y - .2), .3)}`; }
    b.item([nx, y0, 0, nx + .03, y1, h], ln(M.ahsapK, d, 1.5) + `<path class="${K.kf(T('#6f5a44', TR))}" opacity=".45" d="${q([nx, y1, h - .04], [nx, y0, h - .04], [nx, y0 + .04, .26], [nx, y0 + .5, .14], [nx, y0 + .9, .3], [nx, y1 - .4, .12], [nx, y1 - .03, .28])}"/>` + ln('#5a4836', m, .6, 'opacity=".7"')
      + pth('#c0473a', [.3, .7, 1.1].map(k => { const p = K.pr(nx, y0 + k, .2); return K.circ(p[0], p[1], 1.4); }).join('')), { cast: false }); }
  { const o = b.box(7.36, 1.5, 0, 7.94, 2.3, .42, M.ahsap, { edge: false }); o.L.planks({ dir: 'h', step: .105 }); for (let i = 0; i < 5; i++) for (let k = 0; k < 2; k++) o.R.dot(.1 + i * .15, .12 + k * .18, 1.9, M.ahsapA, 5, .2); }

  /* ================= çark önü: yaya köprüsü, el arabası, kıyı ================= */
  const kp = b.slab(1.08, 6.0, 2.12, 6.46, .13, .05, M.ahsapA, { cast: false }); kp.T.planks({ dir: 'v', step: .13 });
  b.line3([[1.12, 6.02, .1], [1.12, 6.02, .46], [2.08, 6.02, .46], [2.08, 6.02, .1]], M.ahsapK, 1.5);
  b.cart(2.78, 6.3, 0, 'x', { load: GUM });
  b.tree('zeytin', .55, 6.35, { s: .8 }).rock(.85, 5.75, 0, { s: .7 });
  b.critter('marti', 2.3, 5.4, .07);
  // oluk sehpası (tek parça)
  { const L = (...p) => 'M' + PL(p), x = .12;
    b.item([x - .03, 4.47, 0, x + .03, 5.43, 2.7], ln(M.ahsap, L([x, 4.58, .9], [x, 5.32, .9]) + L([x, 4.66, 1.8], [x, 5.24, 1.8]) + L([x, 4.6, .92], [x, 5.22, 1.78]) + L([x, 5.3, .92], [x, 4.68, 1.78]), 1.3)
      + ln(M.ahsapK, L([x, 4.5, 0], [x, 4.74, 2.66]) + L([x, 5.4, 0], [x, 5.16, 2.66]) + L([x, 4.66, 2.66], [x, 5.24, 2.66]), 2.5), { cast: false }); }
  // su oluğu: iki yan tahta arasında akan su, ucu çarkın tepesinde açık
  const fz = x => 2.74 - .078 * x, fy0 = 4.75, fy1 = 5.15, fx0 = -.06, fx1 = 1.8;
  b.item([fx0, fy0 - .05, 2.58, fx1, fy1, 2.96], () => {
    const a = fz(fx0), e = fz(fx1); let cl = '', sk = '';
    for (let x = .2; x < fx1; x += .4) cl += `M${P(x, fy1, fz(x) - .04)} ${P(x, fy1, fz(x) + .2)}`;
    cl += `M${P(fx0, fy1, a + .09)} ${P(fx1, fy1, e + .09)}`;
    for (let x = .1; x < 1.6; x += .34) sk += `M${P(x, fy0 + .12 + (x * 7 % 1) * .14, fz(x) + .12)} ${P(x + .2, fy0 + .12 + (x * 7 % 1) * .14, fz(x + .2) + .12)}`;
    return pth(T(M.ahsap, TL - .2), q([fx0, fy0, a], [fx1, fy0, e], [fx1, fy0, e + .2], [fx0, fy0, a + .2]))
      + pth(T(M.ahsapA, .22), q([fx0, fy0 - .05, a + .2], [fx1, fy0 - .05, e + .2], [fx1, fy0, e + .2], [fx0, fy0, a + .2]))
      + pth(M.suA, q([fx0, fy0, a + .12], [fx1, fy0, e + .12], [fx1, fy1 - .05, e + .12], [fx0, fy1 - .05, a + .12])) + ln(M.kopuk, sk, .9)
      + pth(T(M.ahsapA, TL), q([fx0, fy1, a - .04], [fx1, fy1, e - .04], [fx1, fy1, e + .2], [fx0, fy1, a + .2]))
      + pth(T(M.ahsapA, .3), q([fx0, fy1 - .05, a + .2], [fx1, fy1 - .05, e + .2], [fx1, fy1, e + .2], [fx0, fy1, a + .2]))
      + ln(T(M.ahsapA, TL - .26), cl, .8)
      + pth(T(M.ahsap, TR), q([fx1, fy1, e - .04], [fx1, fy0 - .05, e - .04], [fx1, fy0 - .05, e + .2], [fx1, fy0, e + .2], [fx1, fy0, e], [fx1, fy1 - .05, e], [fx1, fy1 - .05, e + .2], [fx1, fy1, e + .2]))
      + pth(M.kopuk, q([fx1, fy1 - .05, e + .12], [fx1, fy0, e + .12], [fx1, fy0, e], [fx1, fy1 - .05, e]));
  }, { pts: [[fx0, fy0, 2.7], [fx1, fy0, 2.7], [fx1, fy1, 2.7], [fx0, fy1, 2.7]] });
  b.critter('marti', .75, 5.13, 2.89);
  // yük sahanlığı ve askıdaki balık kasası (çatıdan önce)
  b.slab(3.3, 4.2, 4.3, 4.44, 1.25, .05, M.ahsapA, { cast: false });
  b.crate(3.8, 4.84, .98, .34, { fill: GUM });
  b.line3([[3.64, 4.68, 1.25], [3.8, 4.84, 1.46], [3.96, 5.0, 1.25]], HALAT, .8).line3([[3.64, 5.0, 1.25], [3.8, 4.84, 1.46], [3.96, 4.68, 1.25]], HALAT, .8);

  /* ================= çatılar ================= */
  // kesik beşik çatı: arka ucu başka bir çatının yamacına gömülür, dere çizgisi boyunca kesilir.
  // ax: mahya yönü · lo..hi: karşı eksende duvar · sr/se: mahyanın/saçağın arka ucu · s1: ön duvar
  const roofCut = (ax, lo, hi, sr, se, s1, z, rise, mat, wall, ov) => {
    const X = ax === 'x', half = (hi - lo) / 2, mid = (lo + hi) / 2, ext = half + ov, zr = z + rise, ze = z - ov * rise / half, dz = zr - ze, len = Math.hypot(ext, dz), S1 = s1 + ov, th = .08, s0 = Math.min(sr, se), W = S1 - s0;
    const p = X ? (a, t, zz) => [a, t, zz] : (a, t, zz) => [t, a, zz]; let A, B, G;
    if (X) {
      A = new F([s0, mid + ext, ze], [1, 0, 0], K.unit([0, -ext, dz]), W, len, K.unit([0, dz, ext]), [[se - s0, 0], [W, 0], [W, len], [sr - s0, len]]);
      B = new F([s0, mid, zr], [1, 0, 0], K.unit([0, -ext, -dz]), W, len, K.unit([0, -dz, ext]), [[sr - s0, 0], [W, 0], [W, len], [se - s0, len]]);
      G = new F([s1, hi, z], [0, -1, 0], [0, 0, 1], hi - lo, rise, [1, 0, 0], [[0, 0], [hi - lo, 0], [half, rise]]);
    } else {
      A = new F([mid + ext, S1, ze], [0, -1, 0], K.unit([-ext, 0, dz]), W, len, K.unit([dz, 0, ext]), [[0, 0], [S1 - se, 0], [S1 - sr, len], [0, len]]);
      B = new F([mid, S1, zr], [0, -1, 0], K.unit([-ext, 0, -dz]), W, len, K.unit([-dz, 0, ext]), [[0, 0], [S1 - sr, 0], [S1 - se, len], [0, len]]);
      G = new F([lo, s1, z], [1, 0, 0], [0, 0, 1], hi - lo, rise, [0, 1, 0], [[0, 0], [hi - lo, 0], [half, rise]]);
    }
    const bVis = K.dot(B.n, K.VIEW) > .02, te = X ? TR - .06 : TL - .2, ts = X ? TL - .2 : TR - .06; A.fill(mat).tiles({ step: .3 }); if (bVis) B.fill(mat); G.fill(wall);
    const st = (pts, t) => pth(T(mat, t), q(...pts));
    const svg = () => (bVis ? B.svg() : '') + G.svg() + st([p(S1, mid, zr), p(S1, mid - ext, ze), p(S1, mid - ext, ze - th), p(S1, mid, zr - th)], te) + A.svg()
      + st([p(S1, mid + ext, ze), p(S1, mid, zr), p(S1, mid, zr - th), p(S1, mid + ext, ze - th)], te) + st(X ? [p(se, mid + ext, ze), p(S1, mid + ext, ze), p(S1, mid + ext, ze - th), p(se, mid + ext, ze - th)] : [p(S1, mid + ext, ze), p(se, mid + ext, ze), p(se, mid + ext, ze - th), p(S1, mid + ext, ze - th)], ts)
      + ln(T(mat, .3), 'M' + PL([p(sr, mid, zr), p(S1, mid, zr)]), 2) + ln(T(mat, -.5), 'M' + PL([p(se, mid - ext, ze), p(sr, mid, zr), p(se, mid + ext, ze)]), 1.5);
    const a0 = p(s0, mid - ext, ze - th), a1 = p(S1, mid + ext, zr);
    return { A, B, G, svg, len, bb: [a0[0], a0[1], a0[2], a1[0], a1[1], a1[2]], pts: [p(sr, mid, zr), p(S1, mid, zr), p(se, mid - ext, ze), p(se, mid + ext, ze), p(S1, mid - ext, ze), p(S1, mid + ext, ze)] };
  };
  // çark evinin çatısı: alınlığı sokağa bakar (ahşap kaplı), mahya y boyunca
  const zW = zz => 1.7 + (3.0 - zz) * 1.3 / .95, RZ = 2.0, RR = .8, ROV = .16, rze = RZ - ROV * RR / 1.75, vr = zW(RZ + RR), ve = zW(rze);
  const wr = b.gable(.4, .3, 3, 4.4, 2.05, .95, M.kiremitK, { axis: 'y', ov: .18, wall: M.ahsap, tex: false }), wit = b.items[b.items.length - 1];
  // kiremit dokusu yalnız görünen bölgelere (ambar çatısının altında kalan üçgen boş)
  { const A = wr.A, L = A.h, av = 4.58 - 2.05, af = 4.58 - 2.05 - 1.75 - ROV, ab = 4.58 - 2.05 + 1.75 + ROV, bv = (3.18 - vr) / 1.48 * L;
    A.shape = [[0, 0], [af, 0], [av, bv], [av, L], [0, L]]; A.tiles({ step: .3 }); A.shape = [[av, bv], [Math.min(A.w, ab), 0], [A.w, 0], [A.w, L], [av, L]]; A.tiles({ step: .3 }); A.shape = null; }
  wr.G.planks({ step: .2, dt: -.2 }).shp('round', 1.06, .2, .48, .48, M.ahsapK, 4).shp('round', 1.12, .26, .36, .36, M.ic, 5);
  for (let i = 0; i < 4; i++) wr.G.line([[1.14, .31 + i * .085], [1.46, .31 + i * .085]], M.ahsap, 1.2, 6, .1);
  // ambar çatısı: çark evinin yamacına saplanır (dere), aynı parçada çizilir
  const rr = roofCut('x', .3, 3.8, vr, ve, 5.5, RZ, RR, M.kiremit, M.ahsap, ROV);
  rr.G.planks({ step: .2, dt: -.2 }); louv(rr.G, 1.5, .16, .5, .3, 4);
  { const d0 = wit.draw; wit.draw = () => d0() + rr.svg(); wit.bb = [wit.bb[0], wit.bb[1], Math.min(wit.bb[2], rr.bb[2]), rr.bb[3], wit.bb[4], wit.bb[5]]; wit.pts = wit.pts.concat(rr.pts); }
  // yük kapılı çatı çıkması (lukarna)
  const zR = y => RZ + RR - (y - 2.05) * RR / 1.75, yR = zz => 2.05 + (RZ + RR - zz) * 1.75 / RR;
  const dm = b.box(3.25, 3.94, 1.2, 4.35, 4.2, 2.25, M.ahsap, { edge: false });
  dm.L.planks({ step: .19, dt: -.2 }).timber({ posts: [.04, 1.06], rails: [.04] });
  dm.L.door(.2, .7, .8, { b: .06, col: M.turkuaz, sove: M.ahsapK, double: true });
  dm.R.planks({ step: .19, dt: -.2 });
  const DZ = 2.25, DR = .42, DOV = .12, dze = DZ - DOV * DR / .55;
  const dr = roofCut('y', 3.25, 4.35, yR(DZ + DR), yR(dze), 4.2, DZ, DR, M.kiremitA, M.ahsap, DOV);
  dr.G.planks({ step: .19, dt: -.2 });
  b.item(dr.bb, () => pth(T(M.ahsap, TR), q([4.35, 3.94, zR(3.94)], [4.35, 3.94, DZ], [4.35, yR(DZ), DZ])) + dr.svg(), { pts: dr.pts });
  // makara kirişi ve halat
  b.box(3.75, 4.2, 2.3, 3.85, 4.92, 2.39, M.ahsapK, { edge: false, cast: false });
  b.line3([[3.8, 4.84, 2.3], [3.8, 4.84, 1.44]], HALAT, 1);
  b.art(3.8, 4.84, 2.3, pth(M.demir, K.circ(0, 1.6, 2)) + pth(T(M.demir, .4), K.circ(0, 1.6, .8)), { bb: [3.76, 4.8, 2.2, 3.84, 4.9, 2.3] });
  // oluğu taşıyan konsol kirişleri (alınlıktan çıkar)
  b.line3([[1.25, 4.42, 2.08], [1.25, 4.74, 2.5]], M.ahsapK, 1.6).line3([[1.73, 4.42, 2.08], [1.73, 4.74, 2.5]], M.ahsapK, 1.6);
  b.box(1.2, 4.4, 2.5, 1.3, 5.2, 2.58, M.ahsapK, { edge: false, cast: false }); b.box(1.68, 4.4, 2.48, 1.78, 5.2, 2.56, M.ahsapK, { edge: false, cast: false });
  // tütsühane çatısı: kırma kiremit, üstünde bakır külahlı panjurlu fener
  const hp = b.hip(5.5, .15, 7.45, 2.85, 1.45, .6, '#b05c3c', { tex: false }); hp.L.tiles({ step: .3 }); hp.R.tiles({ step: .3 });
  const fn = b.box(6.2, 1.12, 1.84, 6.76, 1.88, 2.3, M.ahsapK, { edge: false, cast: false });
  for (const f of [fn.L, fn.R]) for (let i = 0; i < 3; i++) f.rect(.05, .2 + i * .085, f.w - .1, .045, M.ahsapA, 4, .1);
  b.hip(6.1, 1.02, 6.86, 1.98, 2.3, .2, M.bakir, { tex: false, cast: false });
  b.fx('smoke', 6.5, 1.55, 2.5, { s: .55 });
  // ince uzun tuğla baca
  const bc0 = b.box(7.45, .45, 0, 7.87, .87, 1.7, TUGLA); bc0.L.courses({ rh: .15, bw: .26, dens: .5 }); bc0.R.courses({ rh: .15, bw: .26, dens: .5 });
  b.box(7.42, .42, 1.7, 7.9, .9, 1.78, M.tas, { edge: false, cast: false });
  const bc1 = b.box(7.5, .5, 1.78, 7.82, .82, 3.28, TUGLA, { edge: false }); for (const f of [bc1.L, bc1.R]) f.courses({ rh: .15, bw: .26, dens: .5 }).band(.7, .05, M.demir, .1, 3).band(1.24, .26, '#4a3c36', 0, 3);
  b.box(7.46, .46, 3.28, 7.86, .86, 3.37, M.tas, { edge: false, cast: false });
  b.fx('smoke', 7.66, .66, 3.42, { s: 1.35 });
  b.chimney(4.95, 1.25, 2.4, .5, { mat: M.kirec, w: .3, smoke: false });
  b.critter('marti', 4.3, 2.05, 2.8).critter('marti', 1.7, 3.3, 3.0, { flip: true }).critter('marti', 6.48, 1.5, 2.5);

  /* ================= canlandırma: çark (çift çember), dökülen su ================= */
  b.fx('wheel', 1.6, 4.82, 1.15, { r: 1.25, axis: 'y', kind: 'su', col: T(M.ahsap, -.34) });
  b.fx('wheel', 1.6, 5.08, 1.15, { r: 1.25, axis: 'y', kind: 'su' });
  b.fx('fall', 1.86, 4.95, 2.68, { w: .34, h: .34 });
  b.fx('fall', 2.36, 5.06, .22, { w: .26, h: .42 });

  b.tag(4.6, 6.9, 0).doorAt(3.81, 4.3);
});
