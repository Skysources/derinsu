/* Ticaret Evi — bedesten düzeninde çarşı hanı. Arkası (x=0) istinat duvarına yaslıdır, görünmez.
   Ana cephe +x (gölge): beş kemerli dükkân gözü, çizgili tenteler; üstü kilim asılı ahşap korkuluklu teras.
   +y ucu (aydınlık) meydana bakar: basamaklı taş taçkapı, terazi tabelası, sancaklar. Köşede kurşun kubbeli sarraf kulesi.
   Parsel 7.2 × 9. */
CK.def('ticaret', { w: 7.2, d: 9, name: 'Ticaret Evi' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, circ = K.circ, ell = K.ell;
  const Z1 = 1.42, Z2 = 2.45, PIR = '#d9a441', BAK = '#c9703a', SAF = '#e2a032';

  /* --- zemin: çarşı önü ve meydan döşemesi, kapı yolu, gece gözlerden vuran ışık --- */
  b.pave(5.9, .3, 7.2, 9, M.parkeK); b.pave(.3, 7.6, 5.9, 9, M.parkeK);
  b.gpoly([[1.5, 7.86], [3.1, 7.86], [3.5, 9], [1.1, 9]], '#dccfae');
  b.gpoly([[5.95, 5.05], [6.6, 5.05], [6.7, 6.15], [5.95, 6.15]], '#b8a27c', { op: .6 });          // baharat tozu
  [5.6, 4.45, 3.3, 2.15, 1.0].forEach(y => b.spill(6.35, y, .95));
  b.spill(2.3, 8.5, 1.7); b.spill(6.1, 7.6, 1.1);

  /* --- kilim / halı: yüz üstünde düz renk + kuşaklar + baklava dizisi --- */
  const kilim = (f, a, bb, w, h, c, dt = 0, ly = 7) => {
    f.rect(a, bb, w, h, c[0], ly, dt).rect(a, bb + h * .1, w, h * .13, c[1], ly + .1, dt).rect(a, bb + h * .77, w, h * .13, c[1], ly + .1, dt);
    const n = Math.max(1, Math.round(w / .3));
    for (let i = 0; i < n; i++) { const m = a + w * (i + .5) / n, q = w / n * .34, cb = bb + h * .5; f.poly([[m - q, cb], [m, cb + h * .19], [m + q, cb], [m, cb - h * .19]], c[2], ly + .2, dt); }
  };

  // saksı: gövde + birkaç yaprak öbeği (set saksısından hafif)
  const saksi = (x, y, z, o = {}) => { const c = o.col || M.kiremitA, g = o.leaf || M.sarmasik;
    b.art(x, y, z, `<g transform="scale(${o.s || 1})">` + pth(T(c, -.1), 'M-3.4 0Q-5.6 -4 -3.6 -8H3.6Q5.6 -4 3.4 0Z')
      + pth(T(g, -.28), circ(0, -12, 5.4) + circ(-4, -10, 3.4) + circ(4, -10.4, 3.6)) + pth(T(g, .1), circ(-1.2, -13.6, 3.8) + circ(-4.6, -11, 2.2))
      + (o.fl ? pth(o.fl, circ(-3, -11, 1.1) + circ(1.6, -14.6, 1.1) + circ(3.6, -10.6, 1)) : '') + '</g>', { r: .12, h: .7 }); };

  // asılı pirinç fener: zincir + gövde; gece hâleli
  const fener = (x, y, z) => b.art(x, y, z, ln(M.demir, 'M0 0v4', .8) + pth(PIR, 'M-2.8 4h5.6l-.9 1.6h-3.8zM-2.1 11.4h4.2l-.7 1.5h-2.8z') + pth('#ffe9b0>#fff1c2', 'M-2 5.6h4v5.8h-4z')
    + `<circle class="Nl" cy="8" r="15" fill="url(#${K.glowId()})"/>`, { bb: [x - .05, y - .01, z - .5, x + .05, y + .05, z] });

  /* --- ana hol: iki katlı, kireç badanalı --- */
  const hl = b.box(.3, .3, 0, 4.3, 7.6, Z2, M.kirec), L = hl.L, HR = hl.R;
  L.band(0, .36, M.tas, .04).courses({ rh: .18, bw: .5, dens: .7, b1: .36 }).shadeTop(.18);
  L.win(.32, 1.6, .46, .62, { sove: M.tas, shut: M.mavi, lit: true }).win(3.24, .62, .5, .74, { kind: 'arch', sove: M.tas, frame: M.demir, bars: [3, 3], lit: true });
  L.rect(.27, 1.4, .56, .12, M.ahsap, 7); [.36, .5, .63, .75].forEach((a, i) => L.dot(a, 1.56, 2.3, i % 2 ? M.begonvil : M.sarmasik, 7.5, .1));       // çiçeklik
  // köşeden sarkan begonvil (elle: birkaç öbek)
  L.line([[3.93, 0], [3.86, 1.2], [3.9, 2.1]], M.govde, 1.5, 7.4);
  for (let i = 0; i < 34; i++) { const u = b.r(), a = 3.0 + u * .96, bb = 2.33 - b.r() * (.2 + u * u * 1.0);
    L.dot(a, bb, 1.7 + b.r() * 2, i % 5 === 0 ? M.sarmasik : M.begonvil, 8 + (i % 3) * .1, i % 5 === 0 ? -.1 : i % 3 === 1 ? .24 : -.1, .04); }
  // ad levhası: lacivert tahta, altın baklava ve dalgalar
  L.sign(1.15, 2.0, 1.7, .3, M.lacivert, { frame: M.ahsapK });
  L.poly([[1.86, 2.15], [2, 2.24], [2.14, 2.15], [2, 2.06]], M.altin, 7.3, .1).dot(1.62, 2.15, 1.5, M.altin, 7.3, .1).dot(2.38, 2.15, 1.5, M.altin, 7.3, .1);
  L.line([[1.26, 2.15], [1.34, 2.19], [1.42, 2.15], [1.5, 2.19]], M.altin, 1, 7.3, .1).line([[2.5, 2.15], [2.58, 2.19], [2.66, 2.15], [2.74, 2.19]], M.altin, 1, 7.3, .1);
  // terasa bakan üst kat: kepenkli pencereler, teras kapısı, fenerler
  HR.shadeTop(.16).band(Z1, .09, M.tas, .06);
  [[2.0, true], [3.1, false], [5.28, true], [6.4, .5]].forEach(([a, lit]) => HR.win(a, 1.63, .44, .5, { sove: M.tas, lit }).rect(a - .22, 1.63, .2, .5, M.mavi, 4.2).rect(a + .46, 1.63, .2, .5, M.mavi, 4.2));
  HR.door(4.14, .5, .76, { b: Z1, col: M.turkuaz, sove: M.tas }).lantern(3.9, 2.0).lantern(6.05, 2.0);

  /* --- taçkapı: kesme taş çıkma, açık kemerli kapı, mermer silme --- */
  const tk = b.box(1.4, 7.6, 0, 3.2, 7.86, 1.86, M.tas, { edge: false }), TL = tk.L;
  TL.courses({ rh: .22, bw: .5, dens: .32 }).stones(4, { rh: .22 });
  TL.door(.35, 1.1, 1.42, { kind: 'arch', b: .3, open: true, glow: true, sove: M.mermer, floor: '#b89a6e' });
  TL.poly([[.35, .3, 0], [.35, .3, -.5], [.35, 1.12, -.5], [.35, 1.12, 0]], M.ahsap, 5, .12).line([[.35, .58, -.02], [.35, .58, -.48]], M.demir, 1, 6).line([[.35, .95, -.02], [.35, .95, -.48]], M.demir, 1, 6);   // içe açılmış kanat
  fener(2.3, 7.87, 1.7);
  tk.R.courses({ rh: .22, bw: .5, dens: .5 });
  b.slab(1.33, 7.6, 3.27, 7.93, 1.96, .1, M.mermer);
  b.box(1.36, 7.86, 0, 1.6, 8.42, .4, M.tas, { edge: false }); b.stairs(1.6, 7.86, 3.0, 8.46, .3, 0, 'y', M.tas); b.box(3.0, 7.86, 0, 3.24, 8.42, .4, M.tas, { edge: false });
  saksi(1.48, 8.24, .4, { leaf: M.narenciye, fl: '#f0962e', s: 1.15 }); saksi(3.12, 8.24, .4, { leaf: M.narenciye, fl: '#f0962e', s: 1.15 });
  b.fx('banner', 1.47, 7.87, 1.76, { col: M.bezK, w: .22, h: .82, axis: 'x' }).fx('banner', 2.91, 7.87, 1.76, { col: M.bezK, w: .22, h: .82, axis: 'x' });
  // terazi tabelası: demir kolda asılı kalkan levha
  b.line3([[3.74, 7.6, 1.5], [3.74, 8.22, 1.5]], M.demir, 1.6, { pad: .06 }).line3([[3.74, 7.6, 1.2], [3.74, 7.98, 1.5]], M.demir, 1.1, { pad: .06 });
  b.art(3.74, 8.12, 1.5, ln('#2a2c33', 'M-4 0v3M4 0v3', .8) + pth(M.ahsapK, 'M-9 3h18v10q0 7 -9 9q-9 -2 -9 -9z') + pth('#22406a', 'M-7.6 4.4h15.2v8.4q0 5.8 -7.6 7.6q-7.6 -1.8 -7.6 -7.6z')
    + ln(M.altin, 'M0 6.4v9M-5 8h10M-2.4 16.4h4.8', 1.1) + ln(M.altin, 'M-5 8l-1.8 4.6M-5 8l1.8 4.6M5 8l-1.8 4.6M5 8l1.8 4.6', .5) + pth(M.altin, 'M-7.2 12.6h4.4q-2.2 2.4 -4.4 0zM2.8 12.6h4.4q-2.2 2.4 -4.4 0z' + circ(0, 6.2, 1.1)), { bb: [3.6, 7.95, .7, 3.88, 8.3, 1.52] });

  /* --- dükkân kanadı: tek kat, beş kemerli göz; damı teras --- */
  const wg = b.box(4.3, .3, 0, 5.9, 6.3, Z1, M.krem, { T: '#cfa983' }), R = wg.R, TE = wg.T, SP = .888, PI = .26, oa = i => PI + i * (SP + PI);
  R.band(0, .2, M.tas, .08).band(Z1 - .12, .12, M.tas, .12, 3);
  for (let i = 0; i < 5; i++) R.shp('arch', oa(i) - .08, 0, SP + .16, 1.04, M.tas, 2.9, .1);
  R.arcade(0, 6, 5, .96, { pier: PI, th: .3, glow: true, floor: '#a8946e', ring: false, cap: false });
  // gözlerin içi (derinlik e < 0): kumaş topları, bakır raflar, biber dizileri, ağ, küpler
  const ic = (i, da, bb, w, h, c, e = -.2, dt = .2, ly = 5.3) => R.poly([[oa(i) + da, bb, e], [oa(i) + da + w, bb, e], [oa(i) + da + w, bb + h, e], [oa(i) + da, bb + h, e]], c, ly, dt);
  ic(0, .3, .3, .56, .04, M.ahsapK, -.28, 0); ['#b8342a', '#e0b030', '#6a8a3a'].forEach((c, k) => ic(0, .33 + k * .17, .34, .13, .17, c, -.28, .25)); // baharat kavanozları
  ic(1, .3, .3, .56, .04, M.ahsapK, -.28, 0); [0, 1, 2].forEach(k => ic(1, .34 + k * .17, .34, .13, .12 + (k % 2) * .06, BAK, -.28, .3));           // bakır rafı
  [M.bezK, SAF, M.bezM, M.bezMor, M.bezY].forEach((c, k) => ic(2, .2 + k * .13, .12, .115, .62 - (k % 2) * .08, c, -.12));                         // asılı kumaşlar
  [0, 1, 2].forEach(k => R.line([[oa(3) + .36 + k * .13, .04, -.24], [oa(3) + .2 + k * .16, .8, -.06]], '#c9a04e', 1, 5.4, .2));                    // olta kamışları
  ic(3, .5, .04, .3, .3, '#c9a04e', -.2, .1);
  [[.36, .32, M.turkuaz], [.62, .26, '#e8dcc0']].forEach(([da, h, c]) => R.put(5.4, K.kf(R.c(c, .2)), R.shapeD('round', oa(4) + da - .08, .03, .19, h, -.22)));   // küpler

  // tenteler: kızıl / safran / turkuaz, her biri biraz farklı
  [[.5, .2, [M.bezK, M.bez]], [.42, .17, [SAF, M.bez]], [.54, .22, [M.turkuaz, M.bez]], [.4, .16, [M.bezK, M.bez]], [.48, .2, [SAF, M.bez]]].forEach(([out, drop, cols], i) =>
    b.awning(R, oa(i) - .05, Z1 - .09, SP + .1, { out, drop, cols, stripe: .25 }));

  // teras: karo döşeme, serili halılar, saksılar, korkuluk ve üstüne atılmış kilimler
  TE.planks({ dir: 'h', step: .5, dt: -.07 });
  kilim(TE, .5, .7, .8, 1.3, [M.kirmizi, '#e8dcc0', M.lacivert], .04, 3);
  kilim(TE, .42, 3.5, .9, 1.1, ['#2f5f8f', '#e8c890', M.bezK], .04, 3);
  b.fence([[4.34, .36], [5.9, .36], [5.9, 6.24]], .36, { z: Z1, col: M.ahsapK });
  const kz = new K.Face([5.94, 6.3, 0], [0, -1, 0], [0, 0, 1], 6, 2, [1, 0, 0]);
  [[.3, .7, [M.bezK, M.bez, M.lacivert]], [1.72, .6, [SAF, '#7a3a2a', M.bez]], [3.1, .8, ['#2f6a8f', M.bez, M.bezK]], [4.8, .66, [M.bezY, M.bez, SAF]]].forEach(([a, w, c], i) =>
    kilim(kz, a, Z1 - .06 + (i % 2) * .05, w, .43 - (i % 2) * .05, c, .32));
  b.item([5.93, .3, Z1 - .06, 5.97, 6.3, 1.9], () => kz.svg(), { cast: false });
  saksi(4.52, 1.1, Z1, { leaf: M.zeytin, col: M.turkuaz, s: 1.3 });
  b.fig(5.45, 2.9, Z1, { body: M.bezMor, robe: true, hat: 'ortu', hatCol: M.bez });

  /* --- köşe kulesi: sarraf odası, kurşun kubbe, balık yelkovan --- */
  const ku = b.cyl(5.2, 7.0, .7, 0, 2.75, M.tas);
  ku.courses(.36).band(0, .26, M.tasK, .03).band(Z1 - .04, .1, M.mermer, .04, false).band(2.42, .13, M.turkuaz, 0, false).band(2.6, .15, M.mermer, .07);
  const kf1 = ku.face(-.48, 0, .62, 1.4);
  kf1.win(.08, .52, .46, .62, { kind: 'arch', sove: M.mermer, frame: M.ahsapK, bars: [2, 2], lit: true }).rect(.02, .4, .58, .07, M.ahsap, 7, .2);
  [-.6, -.02].forEach(t => ku.face(t, 1.78, .34, .7).win(.04, 0, .26, .52, { kind: 'arch', frame: M.mermer, fw: .04, sill: false, bars: [2, 1], lit: t < .3 }));
  ku.face(.16, .86, .3, .5).lantern(.15, .3);
  b.dome(5.2, 7.0, .74, 2.75, M.kursun, { hf: .85, alem: false });
  b.art(5.2, 7.0, 3.46, ln(M.demir, 'M0 2V-17', 1.2) + pth(M.altin, circ(0, -1.5, 2.4) + circ(0, -6, 1.5)) + ln(M.demir, 'M-9 -14H9', .9)
    + pth(PIR, 'M-10 -14q5 -4.4 11 -.4l4 -2.6v6l-4 -2.6q-6 4 -11 -.4z') + pth(M.demir, circ(-7, -14.4, .7)), { bb: [5.1, 6.9, 3.38, 5.3, 7.1, 4.1] });
  b.fx('glint', 5.2, 7.0, 3.5);

  /* --- çarşı önü --- */
  // kumaşçı: tezgâhta toplar
  b.box(5.98, 2.95, 0, 6.3, 3.65, .26, M.ahsapA, { edge: false, cast: false });
  b.art(6.14, 3.3, .26, [[M.bezK, -7, 2], [M.bezM, -2, -.5], [SAF, 3, -3], [M.bezY, 8, -5.5]].map(([c, x, y]) => pth(T(c, -.2), `M${x - 5} ${y - 1}l7 -3.6l3 1.6v2.6l-7 3.6l-3 -1.6z`) + pth(T(c, .15), `M${x - 5} ${y - 1}l7 -3.6l3 1.6l-7 3.6z`)).join(''), { bb: [5.98, 2.95, .26, 6.3, 3.65, .5] });
  // bakırcı: kazan, sini, ibrik
  b.cyl(6.16, 4.62, .2, 0, .26, BAK, { top: '#6a3a22', cast: false }).band(.22, .04, T(BAK, .3), .02, false);
  b.art(6.12, 4.2, 0, pth(T(BAK, -.3), ell(0, -7, 6.4, 7.4)) + pth(T(BAK, .1), ell(-.8, -7.6, 5.2, 6.2)) + pth(T(BAK, .5), ell(-2, -9.4, 2, 2.6))
    + pth(T(BAK, -.2), 'M9 0q-2.6 -4 -.6 -7.6h3.4q2 3.6 -.6 7.6zM9.4 -7.6l.6 -3.4h1.2l.6 3.4z') + ln(T(BAK, -.2), 'M12 -6q3 .4 2.4 3.4M8.4 -6.6l-2.6 -1.6', .9) + pth(T(BAK, .4), 'M8.8 -1.4q-1.2 -2.6 -.2 -5h1q-.8 2.6 .2 5z'), { bb: [5.98, 4.05, 0, 6.3, 4.4, .6] });
  // baharatçı: ağzı açık çuvallar
  { const o0 = K.pr(6.25, 5.6), f = K.f1; let sa = '', sb = '', sc = '', sm = '';
    [['#b8342a', 6.06, 5.2], ['#e0b030', 6.06, 5.62], ['#7a8a3a', 6.06, 6.04], ['#d9702a', 6.44, 5.42], ['#6a3a5a', 6.44, 5.86]].forEach(([c, x, y]) => { const p = K.pr(x, y), X = p[0] - o0[0], Y = p[1] - o0[1];
      sa += `M${f(X - 5)} ${f(Y)}q-1.6 -5 .2 -8h9.6q1.8 3 .2 8q-5 2 -10 0z`; sb += `M${f(X - 5)} ${f(Y)}q-1.6 -5 .2 -8h4.4q-1.6 4 -.6 9q-2.4 -.2 -4 -1z`; sc += ell(X, Y - 8, 5.2, 2.3); sm += pth(c, ell(X, Y - 8.3, 4.1, 1.7)); });
    b.art(6.25, 5.6, 0, pth(T('#d9c79a', -.24), sa) + pth('#e6d8b2', sb) + pth(T('#d9c79a', .2), sc) + sm, { bb: [5.95, 5.08, 0, 6.56, 6.16, .36] }); }
  // büyük pirinç terazi: üç ayak, kol, iki kefe
  b.art(6.6, 7.1, 0, ln(M.ahsapK, 'M-9 1L0 -33L9 -1M0 -33L-1 5', 1.7) + ln(PIR, 'M-15 -26L15 -29', 1.8) + pth(PIR, circ(0, -27.5, 1.8))
    + ln('#7a6230', 'M-15 -26l-4.6 13M-15 -26l4.6 13M15 -29l-4.6 14M15 -29l4.6 14', .6)
    + pth(T(PIR, -.3), 'M-21 -13h12q-1 4.4 -6 4.4q-5 0 -6 -4.4zM9 -15h12q-1 4.4 -6 4.4q-5 0 -6 -4.4z') + pth(T(PIR, .3), ell(-15, -13, 6, 1.7) + ell(15, -15, 6, 1.7))
    + pth('#e0b030', ell(-15, -13.6, 4, 1.6)) + pth(M.demir, 'M12.4 -18.4h2.2v3.2h-2.2zM15.4 -17.6h1.8v2.4h-1.8z'), { bb: [6.45, 6.95, 0, 6.8, 7.3, 1.2] });
  b.fig(6.2, 7.52, 0, { body: '#3f6f5a', legs: '#4a3a34', hat: 'fes', robe: true });                         // tartan tüccar
  b.fig(7.02, 6.66, 0, { body: M.bezM, hat: 'hasir', carry: 'sepet', flip: true });                         // müşteri
  // oltacı: kamış askısı, ağ, sepetler
  b.line3([[6.5, 1.78, 0], [6.5, 1.78, .8]], M.ahsapK, 1.5).line3([[6.5, 2.5, 0], [6.5, 2.5, .8]], M.ahsapK, 1.5).line3([[6.5, 1.78, .76], [6.5, 2.5, .76]], M.ahsap, 1.6);
  [[1.9, 1.34], [2.06, 1.2], [2.22, 1.42], [2.38, 1.26]].forEach(([y, h], i) => b.line3([[6.66, y, 0], [6.5, y, .76], [6.44, y, h]], i % 2 ? '#c9a04e' : M.ahsapA, 1, { pad: .02 }));
  b.art(6.52, 2.3, .76, pth('#7f9aa8', 'M-5 0h10l-1.6 12q-3.4 2.6 -6.8 0z', 'opacity=".75"') + ln('#4f6a78', 'M-4.6 4h9.2M-4 8h8M-2 0l-.6 12M2 0l.6 12', .5) + pth(M.bezK, circ(-3, 13, 1.2) + circ(3, 13, 1.2)), { bb: [6.5, 2.2, .3, 6.56, 2.44, .76] });
  b.art(6.2, 1.95, 0, pth(T('#c9a04e', -.25), 'M-6 0q-1 -5 0 -8h12q1 3 0 8q-6 2 -12 0z') + pth('#c9a04e', ell(0, -8, 6, 2.4)) + pth('#9fb4c4', 'M-3.6 -8.6q3.6 -2.2 7.2 0q-3.6 2 -7.2 0z') + ln('#8a6a2e', 'M-6.4 -4q6.4 2 12.8 0', .6), { r: .16, h: .36 });
  // hamal, kedi, sandıklar, fener
  b.fig(6.86, 4.72, 0, { body: '#d9c79a', legs: '#5a4a3a', hat: 'sarik', carry: 'kasa', step: 1 });
  b.critter('kedi', 6.6, 3.2, 0, { col: '#e8e0d0' });
  b.crate(5.78, 8.42, 0, .44, { fill: '#e8843a' }).sack(5.36, 8.5, 0).sack(5.6, 8.84, 0, { col: '#c9b48a' });
  b.lamp(7.06, 4.05, 0);
  // tezgâhlar: uçta balıkçı-yemişçi, meydan yanında manav
  b.stall(6.1, .4, 0, { w: .95, d: .7, cols: [M.turkuaz, M.bez], goods: ['#9fb4c4', '#e8843a', '#c0473a'] });
  b.stall(.38, 8.0, 0, { w: 1.0, d: .7, cols: [M.bezK, M.bez], goods: ['#7fa35e', '#e8c040', '#b8342a'] });
  b.fig(.9, 8.86, 0, { body: M.bezS, hat: 'ortu', hatCol: M.bezK, robe: true });

  /* --- çatı: alaturka kiremit; cihannüma alınlığı, çatı penceresi, bacalar (en son: öndekilerin üstüne çizilsin) --- */
  const rf = b.gable(.3, .3, 4.3, 7.6, Z2, .55, M.kiremit, { axis: 'y', ov: .16, wall: M.kirec, tex: false }), SL = .275, zr = x => 3 - (x - 2.3) * SL;
  rf.A.tiles(); if (rf.B) rf.B.planks({ dir: 'v', step: .25, dt: -.17, wid: .9 });
  // ana çatıya saplanan çapraz beşik: ön duvar (xf) + iki yamaç, dereler ana çatıyla kesişime göre kırpılır
  const capraz = (y0, y1, xf, zt, rise, win) => {
    const ym = (y0 + y1) / 2, half = (y1 - y0) / 2, ov = .1, ext = half + ov, zt2 = zt + rise, ze = zt - ov * rise / half, len = Math.hypot(ext, zt2 - ze), X1 = xf + ov, zb = zr(xf);
    const xr = 2.3 + (3 - zt2) / SL, xe = 2.3 + (3 - ze) / SL, xw = 2.3 + (3 - zt) / SL, w = X1 - xr, c = M.kiremitK;
    const A = new K.Face([xr, ym + ext, ze], [1, 0, 0], K.unit([0, -ext, zt2 - ze]), w, len, K.unit([0, zt2 - ze, ext]), [[xe - xr, 0], [w, 0], [w, len], [0, len]]);
    const B = new K.Face([xr, ym, zt2], [1, 0, 0], K.unit([0, -ext, ze - zt2]), w, len, K.unit([0, -(zt2 - ze), ext]), [[0, 0], [w, 0], [w, len], [xe - xr, len]]);
    const F = new K.Face([xf, y1, zb], [0, -1, 0], [0, 0, 1], y1 - y0, zt2 - zb, [1, 0, 0], [[0, 0], [y1 - y0, 0], [y1 - y0, zt - zb], [half, zt2 - zb], [0, zt - zb]]);
    A.fill(c).tiles(); B.fill(c); F.fill(M.kirec); win(F, y1 - y0, zt - zb);
    b.item([xr, y0 - ov, zb, X1, y1 + ov, zt2], () => B.svg() + `<path class="${K.kf(T(M.kirec, K.toneOf([0, 1, 0])))}" d="M${K.PL([[xf, y1, zb], [xf, y1, zt], [xw, y1, zt]])}Z"/>` + F.svg() + A.svg()
      + ln(T(c, -.3), `M${K.PL([[X1, y1 + ov, ze], [X1, ym, zt2], [X1, y0 - ov, ze]])}`, 2) + ln(T(c, .3), `M${K.PL([[xr, ym, zt2], [X1, ym, zt2]])}`, 1.6), { cast: false });
  };
  capraz(2.46, 3.96, 4.3, 2.74, .26, (F, w, h) => F.shp('arch', w / 2 - .2, .04, .4, h + .1, M.tas, 3, .1).shp('arch', w / 2 - .14, .08, .28, h, M.camI, 5).band(0, .05, M.tas, .1, 3));
  capraz(.86, 1.52, 3.95, 2.78, .12, (F, w, h) => F.rect(.14, .04, w - .28, h - .06, M.mavi, 4).rect(.18, .07, w - .36, h - .12, M.camI, 5));
  b.chimney(1.25, 1.2, 2.66, .7, { mat: M.tas, w: .38, s: .8 }); b.chimney(1.45, 6.6, 2.72, .5, { mat: M.tas, w: .28, smoke: false });
  b.fx('birds', 2.3, 4.9, 3.0, { n: 3 });

  b.tag(6.6, 8.9, 0).doorAt(2.3, 8.7);
});
