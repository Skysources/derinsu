/* Hamam — kurşun kubbeli taş küpler öbeği.
   Arka solda sekizgen kasnaklı büyük kubbesiyle sıcaklık, sağında fenerli kubbesiyle camekân, önde üstü peştemal
   terası olan ılıklık; alacalı taş taçkapı +y'ye bakar. Sağ arkada külhan, uzun baca ve odunluk. Parsel 6 × 6. */
CK.def('hamam', { w: 6, d: 6, name: 'Hamam' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, U = K.U, f1 = K.f1;
  const ST = '#d0c09e', STB = '#dccfb0', STC = '#bcaa8a', RED = '#b8674c', MR = M.mermer, LEAD = M.kursun, DAM = '#a3acad', GOZ = '#7fe0d2>#ffd98a';
  // son eklenen parçanın çizimine ek (aynı sıralama kutusunda kalsın diye)
  const ekle = svg => { const it = b.items[b.items.length - 1], d0 = it.draw; it.draw = () => (typeof d0 === 'function' ? d0() : d0) + svg; };
  const tepe = (z, r, hf) => z + r * hf * 1.1415;
  // kubbe + fil gözleri: rings = [yükseklik açısı, adet, kayma]
  const kubbe = (cx, cy, r, z, hf, rings, rp = .9) => {
    b.dome(cx, cy, r, z, LEAD, { hf, alem: false, seams: r > .6 });
    const c = K.pr(cx, cy, z), R = r * Math.SQRT2 * U, Rv = R * hf * .9887; let d = '';
    for (const [el, n, ph] of rings) { const ce = Math.cos(el), se = Math.sin(el);
      for (let i = 0; i < n; i++) { const a = (i + ph) / n * 6.2832, x = R * ce * Math.cos(a), y = -Rv * se + R / 2 * ce * Math.sin(a);
        if (y < 0 ? (x / R) ** 2 + (y / Rv) ** 2 > .8 : (x / R) ** 2 + (y * 2 / R) ** 2 > .8) continue; d += `M${f1(c[0] + x)} ${f1(c[1] + y)}h.1`; } }
    ekle(ln(T(LEAD, -.42), d, rp * 2 + 1.1) + ln(GOZ, d, rp * 2)
      + (r < .6 ? '' : `<circle class="Nl" cx="${f1(c[0])}" cy="${f1(c[1] - Rv * .4)}" r="${f1(R * 1.1)}" fill="url(#${K.glowId()})" opacity=".4"/>`));
  };
  // alem: üst üste iki topuz + baklava
  const alem = (cx, cy, z, s = 1) => b.art(cx, cy, z, ln(M.bronz, `M0 1V${f1(-10 * s)}`, 1.2)
    + pth(M.altin, K.circ(0, -2.4 * s, 2 * s) + K.circ(0, -6 * s, 1.3 * s) + `M0 ${f1(-13 * s)}l${f1(1.7 * s)} ${f1(3 * s)}l${f1(-1.7 * s)} ${f1(2.2 * s)}l${f1(-1.7 * s)} ${f1(-2.2 * s)}Z`), { bb: [cx - .08, cy - .08, z, cx + .08, cy + .08, z + .45] });
  // saksı: küp + yaprak öbeği + çiçek
  const saksi = (x, y, z, s, fl) => b.art(x, y, z, `<g transform="scale(${s})">` + pth(T(M.kiremitA, -.25), 'M-3 0L-4.2 -6H4.2L3 0Z') + pth(M.kiremitA, 'M-3 0L-4.2 -6H0L-.4 0Z')
    + pth(T(M.sarmasik, -.22), K.circ(0, -10.5, 5) + K.circ(-4, -8.4, 3.4) + K.circ(4.2, -8.8, 3.6)) + pth(T(M.sarmasik, .2), K.circ(-1.6, -12, 3)) + ln(fl, 'M-3.4 -11h.1M2 -13h.1M4.4 -8.4h.1M-.4 -8.6h.1M-4.6 -7.4h.1', 2.1) + '</g>', { r: .12, h: .6 });
  const oct = (cx, cy, R) => Array.from({ length: 8 }, (_, k) => { const a = (22.5 + 45 * k) * Math.PI / 180; return [cx + R * Math.cos(a), cy + R * Math.sin(a)]; });

  /* --- zemin: avlu döşemesi, kapıya mermer yol, çeşme önünde ıslaklık, odun kırıntısı --- */
  b.pave(0, 0, 6, 6, M.parkeK);
  b.gpoly([[3.42, 4.05], [4.38, 4.05], [4.6, 6], [3.2, 6]], '#e4dac2');
  b.gpoly([[1.9, 4.6], [2.9, 4.6], [3.0, 5.0], [2.3, 5.2], [1.8, 4.95]], '#8fa6a4', { op: .4 });
  b.gpoly([[4.6, 3.2], [5.9, 3.1], [6, 4.7], [4.9, 4.9], [4.5, 4.2]], '#a98f68', { op: .5 });
  b.spill(3.9, 4.4, 1.5).spill(6.3, .85, 1.1);

  /* --- sıcaklık: kesme taş küp, sekizgen kasnak, büyük kubbe --- */
  const A = b.box(.3, .3, 0, 2.9, 2.9, 1.8, ST, { T: DAM });
  A.L.band(1.2, .06, RED, 0).band(1.66, .14, MR, .06);
  for (const f of b.prism(oct(1.6, 1.6, 1.2), 1.8, 2.2, ST).faces) { f.win(f.w / 2 - .15, .07, .3, .28, { kind: 'arch', frame: M.tasK, lit: true, sill: false, bars: [1, 1] }); }
  b.prism(oct(1.6, 1.6, 1.27), 2.2, 2.26, MR);
  kubbe(1.6, 1.6, 1.1, 2.26, .78, [[.34, 20, 0], [.7, 14, .5], [1.05, 9, 0]]);
  alem(1.6, 1.6, tepe(2.26, 1.1, .78) - .03, 1.1); b.fx('glint', 1.6, 1.6, tepe(2.26, 1.1, .78) + .3);
  // dam köşelerinde buhar bacaları
  b.cyl(.64, 2.62, .08, 1.8, 2.0, LEAD, { cast: false }); b.fx('steam', .64, 2.62, 2.04, { s: .8 });

  /* --- camekân: almaşık duvar, alçak kasnak, fenerli kubbe --- */
  const B = b.box(2.9, .6, 0, 5.0, 2.9, 1.55, STB, { T: DAM });
  B.L.courses({ rh: .26, bw: .6, dens: .3 });
  for (const f of [B.L, B.R]) f.band(1.02, .07, RED, 0).band(1.43, .12, MR, .05);
  B.L.band(.5, .07, RED, 0).band(0, .2, STC, -.04);
  B.L.win(.09, .5, .26, .5, { kind: 'point', frame: MR, fw: .06, lit: true, bars: [1, 1] }).win(1.72, .5, .26, .5, { kind: 'point', frame: MR, fw: .06, lit: false, bars: [1, 1] });
  B.R.wins(3, 1.0, .25, .36, { kind: 'point', frame: MR, fw: .06, sill: false, bars: [1, 1] }, .08, 1.45);
  b.cyl(3.95, 1.75, .93, 1.55, 1.7, STB).band(1.66, .05, MR, .03);
  kubbe(3.95, 1.75, .88, 1.71, .66, [[.42, 12, .3], [.92, 7, 0]], .8);
  { const z = tepe(1.71, .88, .66); b.cyl(3.95, 1.75, .14, z - .05, z + .2, '#9fd4d6>#ffd98a', { top: LEAD, cast: false }); b.cone(3.95, 1.75, .2, z + .2, .17, LEAD, { cast: false, tex: false }); alem(3.95, 1.75, z + .36, .6); }
  b.cyl(4.74, 2.66, .07, 1.55, 1.72, LEAD, { cast: false }); b.fx('steam', 4.74, 2.66, 1.76, { s: .6 });

  /* --- taçkapı: alacalı taş, sivri kemer, küçük kubbe --- */
  const Pk = b.box(3.35, 2.9, 0, 4.45, 3.8, 1.38, '#eadfc8');
  for (const f of [Pk.L, Pk.R]) { for (let k = 0; k < 5; k++) f.band(.13 + k * .26, .13, RED, 0); f.band(1.3, .08, MR, .08); }
  Pk.L.shp('point', .07, 0, .96, 1.2, MR, 2.9, .05);
  Pk.L.arcade(.1, 1.0, 1, 1.02, { kind: 'point', pier: .1, th: .32, glow: true, cap: false, ring: false, floor: MR });
  { const q = (p0, c, p1, t) => [(1 - t) * (1 - t) * p0[0] + 2 * t * (1 - t) * c[0] + t * t * p1[0], (1 - t) * (1 - t) * p0[1] + 2 * t * (1 - t) * c[1] + t * t * p1[1]];
    const I = [[.2, .586], [.2, .855], [.55, 1.02]], O = [[.07, .586], [.07, .96], [.55, 1.2]];
    for (const i of [0, 2, 4]) for (const s of [1, -1]) { const m = p => [s > 0 ? p[0] : 1.1 - p[0], p[1]];
      Pk.L.poly([q(...I, i / 5), q(...I, (i + 1) / 5), q(...O, (i + 1) / 5), q(...O, i / 5)].map(m), RED, 6.6, 0); }
    for (const a of [.07, .9]) Pk.L.rect(a, .2, .13, .13, RED, 6.6, 0).rect(a, .46, .13, .13, RED, 6.6, 0);
  }
  Pk.L.lantern(.55, .84, { out: -.14, r: 13 });
  Pk.R.win(.3, .42, .3, .5, { kind: 'point', frame: MR, fw: .06, bars: [1, 1], lit: true });
  b.slab(3.29, 2.86, 4.51, 3.86, 1.44, .06, MR);
  kubbe(3.9, 3.36, .4, 1.44, .85, [[.5, 7, .2], [1.05, 4, 0]], .7);
  alem(3.9, 3.36, tepe(1.44, .4, .85) - .02, .65);
  b.slab(3.4, 3.8, 4.4, 4.08, .09, .09, MR);
  // nalınlar
  const nd = 'M-5 0l5 -2.5l2.2 1.1l-5 2.5zM-1 2.2l5 -2.5l2.2 1.1l-5 2.5z';
  const nalin = (x, y, z) => b.art(x, y, z, pth(T(M.ahsapK, -.2), nd) + '<g transform="translate(0 -1.7)">' + pth(M.ahsapA, nd) + ln(M.kirmizi, 'M-2.2 -1.6l2.2 1.1M1.8 .6l2.2 1.1', 1.2) + '</g>', { r: .1, h: .1 });
  nalin(3.56, 4.0, .09); nalin(3.22, 4.3, 0);
  saksi(4.68, 4.0, 0, 1.15, '#f0962e');

  /* --- ılıklık: moloz taş, üstü teras; sağ ucunda küçük kubbe --- */
  const C = b.box(.3, 2.9, 0, 2.9, 4.3, 1.15, STC, { T: '#d8c8a6' });
  C.L.courses({ rh: .28, bw: .56, dens: .35, a0: 1.2 }).band(0, .22, M.tasK, -.05).shadeTop(.08);
  C.R.courses({ rh: .28, bw: .56, dens: .4, a1: .6 }).band(0, .22, M.tasK, -.05);
  C.L.win(1.36, .46, .26, .44, { kind: 'point', frame: MR, fw: .06, bars: [1, 1], lit: true });
  C.R.door(.08, .4, .82, { kind: 'arch', col: M.turkuaz, sove: MR });
  // çeşme: mermer sivri kemer, çini ayna, pirinç lüle, yalak
  C.L.shp('point', 1.74, 0, .72, 1.02, MR, 3, .1).shp('point', 1.84, .3, .52, .6, '#3f9a98', 4, -.05).rect(1.84, .3, .52, .05, MR, 4.1, -.1);
  C.L.dot(2.1, .7, 1.6, MR, 5, .1).dot(1.98, .56, 1.1, M.sari, 5).dot(2.22, .56, 1.1, M.sari, 5).line([[2.1, .5], [2.1, .42]], M.bronz, 1.6, 6, .1).dot(2.1, .5, 1.5, M.altin, 6.1);
  C.R.lantern(.64, .92);
  b.box(2.02, 4.3, 0, 2.76, 4.62, .26, MR, { edge: false });
  b.pool(2.07, 4.33, 2.71, 4.57, .28);
  b.fx('fall', 2.4, 4.34, .5, { w: .05, h: .2 });
  b.art(2.7, 4.6, .27, pth(T('#c9783c', -.2), 'M-3.4 -2.6a3.4 1.6 0 0 0 6.8 0l-1 2.4h-4.8z') + pth(T('#c9783c', .25), K.ell(0, -2.6, 3.4, 1.4)), { r: .1, h: .2 });
  // teras: korkuluk, kubbe kaidesi
  b.box(.3, 2.9, 1.15, .4, 4.3, 1.33, STC, { edge: false, cast: false });
  b.box(.64, 4.2, 1.15, 2.0, 4.3, 1.33, STC, { edge: false, cast: false });
  b.box(2.0, 2.9, 1.15, 2.9, 4.3, 1.27, STC, { edge: false, cast: false, T: DAM });
  kubbe(2.45, 3.6, .42, 1.27, .85, [[.5, 7, .1], [1.05, 4, .5]], .7);
  alem(2.45, 3.6, tepe(1.27, .42, .85) - .02, .65);
  // peştemaller: iki ip, çizgili bezler
  const PC = { k: ['#f0e6cf', M.bezK], m: ['#f0e6cf', M.lacivert], s: [M.bezS, '#f0e6cf'], t: [M.turkuaz, '#f0e6cf'], r: [M.bezK, '#f0e6cf'] };
  const pest = (y, list) => { const F = new K.Face([.5, y, 1.28], [1, 0, 0], [0, 0, 1], 1.4, .7, [0, 1, 0]), top = .68;
    for (const [a, w, h, k] of list) { const [c, s] = PC[k], b0 = top - h; F.rect(a, b0, w, h, c, 3).rect(a, top - .03, w, .03, c, 4, -.18);
      F.rect(a, b0 + .06, w, .05, s, 4).rect(a, top - .12, w, .05, s, 4); }
    b.line3([[.5, y, 1.15], [.5, y, 2.02]], M.ahsapK, 1.5).line3([[1.9, y, 1.15], [1.9, y, 2.02]], M.ahsapK, 1.5).line3([[.5, y, 1.97], [1.9, y, 1.97]], '#6a5a4a', .8);
    b.item([.52, y - .02, 1.28, 1.88, y + .02, 1.98], () => F.svg(), { cast: false }); };
  pest(3.22, [[.1, .3, .6, 'm'], [.5, .3, .5, 's'], [.98, .32, .62, 'k']]);
  pest(3.95, [[.02, .3, .5, 'r'], [.4, .3, .64, 'k'], [.78, .26, .46, 't'], [1.1, .28, .58, 'm']]);
  // terasa çıkan taş merdiven, basamakta saksı, korkulukta kedi
  b.stairs(.3, 4.3, 1.62, 4.72, 1.15, 0, 'x', M.tas);
  { const F = new K.Face([.3, 4.72, 0], [1, 0, 0], [0, 0, 1], 1.32, 1.15, [0, 1, 0], [[0, 0], [1.32, 0], [0, 1.15]]); F.mc = M.tas;
    F.courses({ rh: .23, bw: .5, dens: .2 }).shp('arch', .1, 0, .46, .6, MR, 3, .08).shp('arch', .16, 0, .34, .52, M.ic, 4); ekle(F.svg()); }
  saksi(.42, 4.58, 1.15, .85, M.begonvil);
  b.critter('kedi', 1.5, 4.25, 1.33);

  /* --- külhan: ateş ağzı +x'e bakar; küçük kubbe, uzun tuğla baca --- */
  const Ku = b.box(5.0, .2, 0, 5.9, 1.5, 1.0, STC, { T: '#8f9494' });
  Ku.R.poly([[.42, .6], [.96, .6], [.88, .98], [.52, 1]], STC, 2.6, -.3);
  Ku.R.arcade(.36, 1.02, 1, .56, { pier: .08, th: .3, glow: true, floor: '#5a524c' });
  Ku.R.put(5.4, K.kf('#e8622a>#ff8a3a'), Ku.R.shapeD('round', .56, .02, .34, .13, -.2)).put(5.5, K.kf('#ffb648>#ffd27a'), Ku.R.shapeD('round', .64, .04, .18, .08, -.2));
  b.fx('fire', 5.74, .78, .1, { s: .7 });
  const bc = '#c08a68';
  const c1 = b.box(5.2, .25, 1.0, 5.7, .75, 2.2, bc, { edge: false }); c1.L.courses({ rh: .17, bw: .3, dens: .3 });
  b.box(5.17, .22, 2.2, 5.73, .78, 2.27, MR, { edge: false, cast: false });
  const c2 = b.box(5.25, .3, 2.27, 5.65, .7, 3.3, bc, { edge: false }); c2.L.courses({ rh: .17, bw: .3, dens: .3 }); for (const f of [c2.L, c2.R]) f.band(.78, .25, '#4a4440', 0, 3).band(.3, .04, M.demir, 0, 3);
  b.box(5.2, .25, 3.3, 5.7, .75, 3.39, STC, { edge: false, cast: false });
  b.fx('smoke', 5.45, .5, 3.44, { s: 1.5 });
  kubbe(5.45, 1.1, .36, 1.0, .8, [[.6, 6, .3]], .7);

  /* --- odunluk: kiremit sundurma altında istif; avluda kütük yığını, kesme kütüğü, balta --- */
  const W = b.box(5.08, 1.62, 0, 5.82, 2.82, .58, M.ahsap, { edge: false, L: T(M.ahsapK, -.1), T: M.ahsapA });
  W.R.planks({ dir: 'h', step: .145 });
  { let d = ''; for (let i = 0; i < 5; i++) for (let k = 0; k < 4; k++) d += `M${W.L.P(.08 + i * .145 + (k % 2) * .03, .075 + k * .143)}h.1`;
    W.L.put(5, 'Ln ' + K.ks(W.L.c(M.ahsapA, .1)), d, 'stroke-width="3.7"').put(5.1, 'Ln ' + K.ks(W.L.c(M.ahsap, -.1)), d, 'stroke-width="1.3"'); }
  b.line3([[5.94, 1.56, 0], [5.94, 1.56, .7]], M.ahsapK, 1.6).line3([[5.94, 2.84, 0], [5.94, 2.84, .7]], M.ahsapK, 1.6);
  b.shed(5.0, 1.5, 6.02, 2.9, .68, .98, '+x', M.kiremitK);
  { // kütük yığını: uçları +y'ye bakan kütükler, üçgen istif
    let gv = '', hl = ''; const rows = [[0, 4], [1, 3], [2, 2], [3, 1]];
    for (const [k, n] of rows) for (let i = 0; i < n; i++) { const p = K.pr(4.95 + (i + k * .5) * .2, 4.0, .08 + k * .15), x = p[0], y = p[1];
      gv += `M${f1(x + 1)} ${f1(y - .5)}l8 -4`; hl += `M${f1(x)} ${f1(y)}h.1`; }
    b.art(0, 0, 0, ln(T(M.ahsap, -.25), gv, 4.6) + ln(M.ahsapA, hl, 4.8) + ln(M.ahsap, hl, 1.6), { bb: [4.85, 3.5, 0, 5.75, 4.02, .62] }); }
  b.cyl(5.72, 4.62, .16, 0, .24, M.ahsap, { top: M.ahsapA, cast: false });
  b.art(5.72, 4.62, .24, ln(M.ahsapA, 'M-1 -1L6 -9', 1.4) + pth(T(M.demir, .2), 'M-3.4 -2.8l3 -1.2l1.4 2.6l-2.6 2z'), { r: .15, h: .4 });
  b.art(5.3, 4.85, 0, pth(M.ahsapA, 'M-5 0l4 -2l5 1l-4 2zM3 3l5 -1l1 2l-5 1z') + pth(T(M.ahsapK, 0), 'M-5 0l5 1v1.6l-5 -1zM3 3l4 2v1.4l-4 -2z'), { r: .2, h: .1 });

  /* --- avlu: selviler, bank, tellak, müşteri --- */
  b.tree('selvi', .42, 5.5, { s: .95 }).tree('selvi', 1.05, 5.78, { s: .68 });
  b.bench(2.25, 5.5, 0, 'x', { l: .9 });
  b.art(2.1, 5.5, .22, pth(M.bezM, 'M-4 -1l4 -2l4 2l-4 2z') + pth('#f0e6cf', 'M-4 -1l4 2v1.6l-4 -2z') + pth(T(M.bezM, -.2), 'M0 1l4 -2v1.6l-4 2z'), { r: .1, h: .15 });
  // tellak: kucağında katlı peştemal bohçası
  b.fig(4.0, 5.2, 0, { body: '#efe5d0', legs: '#8a4a3a', hat: 'none', hair: '#2a2420', step: 1 });
  b.art(4.0, 5.2, 0, pth('#f0e6cf', 'M-4.6 -13.4h9.2v2.2h-9.2z') + pth(M.bezK, 'M-4.6 -11.2h9.2v1.8h-9.2z') + pth(M.lacivert, 'M-4.6 -9.4h9.2v1.6h-9.2z') + pth(M.bezS, 'M-4.2 -15h8.4v1.6h-8.4z'), { bb: [3.88, 5.08, 0, 4.16, 5.36, .9] });
  b.fig(2.95, 5.6, 0, { body: M.yesil, legs: '#4a3a34', hat: 'fes', robe: true });

  // odun arabası: yeni gelen kütükler
  b.box(5.0, 5.35, .17, 5.8, 5.75, .32, M.ahsap, { edge: false }).L.planks({ dir: 'h', step: .075 });
  { const F = new K.Face([5.18, 5.77, 0], [1, 0, 0], [0, 0, 1], .42, .42, [0, 1, 0]); F.shp('round', 0, 0, .42, .42, M.ahsapK, 3).shp('round', .07, .07, .28, .28, M.ahsapA, 4, .1).dot(.21, .21, 1.4, M.demir, 5);
    b.item([5.18, 5.75, 0, 5.6, 5.8, .42], () => F.svg(), { cast: false }); }
  b.line3([[5.8, 5.4, .3], [6.18, 5.4, .2]], M.ahsapK, 1.4).line3([[5.8, 5.7, .3], [6.18, 5.7, .2]], M.ahsapK, 1.4);
  b.line3([[5.08, 5.45, .37], [5.72, 5.45, .37]], T(M.ahsap, -.25), 4.4).line3([[5.05, 5.63, .37], [5.7, 5.63, .37]], T(M.ahsap, -.1), 4.4).line3([[5.1, 5.54, .47], [5.74, 5.54, .47]], M.ahsap, 4.4);
  b.tag(3.0, 5.9, 0).doorAt(3.9, 4.35);
});
