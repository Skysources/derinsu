/* Hamam — dik arduvaz çatılı kara taş hamam öbeği.
   Arka solda yüksek sıcaklık salonu (alınlığı +y'ye bakan dik beşik çatı, mahyada buhar fenerliği), sağında kırma çatılı camekân,
   önde dik çatılı taçkapı ve beşik çatılı ılıklık (duvar çeşmesi, payandalar). Sağ arkada külhan: tek ışık onun kızıl ağzıdır.
   Uzun taş baca, odunluk, avluda kütükler. Parsel 6 × 6. */
CK.def('hamam', { w: 6, d: 6, name: 'Hamam' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, f1 = K.f1;
  const TS = M.gTas, TK = M.gTasK, TA = M.gTasA, KR = M.gKara, CT = M.gCati, AH = M.gAhsap, AK = M.gAhsapK, AA = M.gAhsapA;
  const SV = { kind: 'point', frame: AK, sove: TA, lit: false, bars: [1, 2] };
  // son eklenen parçanın çizimine ek (aynı sıralama kutusunda kalsın diye)
  const ekle = svg => { const it = b.items[b.items.length - 1], d0 = it.draw; it.draw = () => (typeof d0 === 'function' ? d0() : d0) + svg; };
  // demir sivri uç
  const uc = (x, y, z, s = 1) => b.art(x, y, z, ln(M.gDemir, `M0 2V${f1(-12 * s)}M${f1(-2.6 * s)} ${f1(-5 * s)}H${f1(2.6 * s)}`, 1.2) + pth(M.gDemir, `M${f1(-1.4 * s)} ${f1(-11.4 * s)}L0 ${f1(-15.6 * s)}L${f1(1.4 * s)} ${f1(-11.4 * s)}Z`), { bb: [x - .06, y - .06, z, x + .06, y + .06, z + .55 * s] });
  // payanda: duvardan +y'ye taşan basamaklı taş ayak (f: L yüzü)
  const payanda = (x, y, h, d = .22) => { const p = b.box(x, y, 0, x + .18, y + d, h, TK, { edge: false, T: TA }); p.L.band(0, .12, KR, -.05); p.R.band(0, .12, KR, -.05);
    b.box(x + .02, y, h, x + .16, y + d * .55, h + .18, TK, { edge: false, cast: false, T: TA }); };

  /* --- zemin: kara taş avlu, kapıya yol, çeşme önünde ıslaklık, odun kırıntısı --- */
  b.pave(0, 0, 6, 6, T(KR, .04));
  b.gpoly([[3.42, 4.05], [4.38, 4.05], [4.6, 6], [3.2, 6]], TK);
  let dz = ''; for (let y = 4.4; y < 6; y += .32) dz += `M${K.P(3.3 - (y - 4.05) * .07, y)} ${K.P(4.42 + (y - 4.05) * .1, y)}`;
  b.ground(ln(T(TK, -.3), dz, .7));
  b.gpoly([[1.9, 4.65], [2.9, 4.65], [3.0, 5.0], [2.3, 5.2], [1.8, 4.95]], '#363e44', { op: .6 });
  b.gpoly([[4.6, 3.2], [5.9, 3.1], [6, 4.7], [4.9, 4.9], [4.5, 4.2]], '#4a3e32', { op: .55 });
  b.spill(6.25, .85, 1.2, { op: .9 });

  /* --- sıcaklık: yüksek taş salon, alınlıkta kör gül penceresi, dik beşik çatı, buhar fenerliği --- */
  const A = b.box(.3, .3, 0, 2.9, 2.9, 2.05, TS, { T: null });
  A.L.courses({ rh: .26, bw: .5, dens: .45, b0: 1.2 }).band(1.92, .13, TA, .04).win(.5, 1.36, .22, .48, SV).win(1.9, 1.36, .22, .48, SV);
  A.R.courses({ rh: .26, bw: .5, dens: .4, b0: 1.6 }).band(1.92, .13, TA, .04);
  const ra = b.gable(.3, .3, 2.9, 2.9, 2.05, 1.75, CT, { axis: 'y', ov: .16, wall: TS, tex: 'rows', step: .17 });
  ra.G.courses({ rh: .26, bw: .5, dens: .35 }).shp('round', .92, .32, .76, .76, TA, 3, .05).shp('round', .99, .39, .62, .62, M.gCam, 4, -.1);
  { const G = ra.G, cx = 1.3, cy = .7; let d = ''; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; d += `M${G.P(cx, cy)} ${G.P(cx + Math.cos(a) * .31, cy + Math.sin(a) * .31)}`; }
    G.put(5, 'Ln ' + K.ks(G.c(TA, .02)), d, 'stroke-width="1.3"').shp('round', 1.24, .64, .12, .12, TA, 5.1, .05);
    G.shp('point', 1.2, 1.22, .2, .3, KR, 3, -.3); }
  uc(1.6, 3.06, 3.8, 1.1);
  // mahyada buhar fenerliği: panjurlu taş göz, kırma külah
  const L = b.box(1.38, 1.3, 3.25, 1.82, 1.9, 3.98, TA, { edge: false, T: null });
  for (const f of [L.L, L.R]) { f.rect(.08, .12, f.w - .16, .5, KR, 3, -.3); let d = ''; for (let bb = .2; bb < .6; bb += .09) d += `M${f.P(.08, bb)} ${f.P(f.w - .08, bb - .04)}`; f.put(4, 'Ln ' + K.ks(f.c(TA, -.1)), d, 'stroke-width="1"'); }
  b.hip(1.3, 1.22, 1.9, 1.98, 3.98, .52, CT, { tex: false, cast: false });
  uc(1.6, 1.6, 4.5, .7);
  b.fx('steam', 1.6, 1.6, 4.1, { s: 1 });

  /* --- camekân: kesme taş, sivri pencereler, kırma çatı, demir buhar borusu --- */
  const B = b.box(2.9, .6, 0, 5.0, 2.9, 1.72, TS, { T: null });
  B.L.courses({ rh: .26, bw: .5, dens: .4 }).band(0, .18, KR, -.04).band(1.6, .12, TA, .04);
  B.R.courses({ rh: .26, bw: .5, dens: .35, b0: 1.0 }).band(1.6, .12, TA, .04);
  B.L.win(.12, .55, .24, .62, SV).win(1.72, .55, .24, .62, SV);
  B.R.wins(3, 1.04, .2, .44, SV, .1, 1.5);
  b.hip(2.78, .48, 5.12, 3.02, 1.72, 1.1, CT, { tex: 'rows', step: .17 });
  b.cyl(3.95, 1.75, .07, 2.5, 3.0, M.gDemir, { cast: false }).band(2.95, .05, M.gDemir, .03);
  b.fx('steam', 3.95, 1.75, 3.06, { s: .7 });
  b.critter('guvercin', 3.95, 1.95, 2.82, { col: '#26262c' });

  /* --- taçkapı: öne bakan dik beşik çatı, derin sivri kemerli kapı, kemer taşları --- */
  const Pk = b.box(3.35, 2.9, 0, 4.45, 3.8, 1.62, TA);
  for (const f of [Pk.L, Pk.R]) f.courses({ rh: .26, bw: .44, dens: .4 }).band(0, .16, KR, -.04).band(1.52, .1, TA, .08);
  Pk.L.shp('point', .08, 0, .94, 1.3, TK, 2.9, -.05);
  Pk.L.door(.2, .7, 1.12, { kind: 'point', col: AK, sove: null });
  Pk.L.put(3, 'Ln ' + K.ks(Pk.L.c(TA, .1)), Pk.L.shapeD('point', .12, 0, .86, 1.22).replace(/Z$/, ''), 'stroke-width="2.6" stroke-dasharray="4 1.4" style="stroke-linecap:butt"');
  Pk.R.win(.32, .5, .24, .58, SV);
  const rp = b.gable(3.35, 2.9, 4.45, 3.8, 1.62, 1.0, CT, { axis: 'y', ov: .12, wall: TA, tex: 'rows', step: .15 });
  rp.G.shp('point', .45, .16, .2, .4, KR, 3, -.3);
  uc(3.9, 3.92, 2.62, .9);
  b.slab(3.4, 3.8, 4.4, 4.08, .09, .09, TK);
  b.critter('kedi', 4.32, 3.98, .09, { col: '#2a2a2e' });

  /* --- ılıklık: moloz taş, payandalar, duvar çeşmesi, beşik çatı --- */
  const C = b.box(.3, 2.9, 0, 2.9, 4.3, 1.32, TK, { T: null });
  C.L.courses({ rh: .26, bw: .5, dens: .5 }).stones(4, { rh: .26 }).band(0, .2, KR, -.05).band(1.24, .08, TA, .06);
  C.R.courses({ rh: .26, bw: .5, dens: .45 }).band(0, .2, KR, -.05).band(1.24, .08, TA, .06);
  C.L.win(.2, .42, .22, .56, SV).win(1.08, .42, .22, .56, SV);
  C.R.door(.1, .4, .84, { kind: 'point', col: AK, sove: TA });
  // duvar çeşmesi: sivri niş, canavar ağızlı demir oluk, pas izi
  C.L.shp('point', 1.74, 0, .72, 1.08, TA, 3, .02).shp('point', 1.84, .3, .52, .66, KR, 4, -.25);
  C.L.poly([[2.07, .58], [2.13, .58], [2.15, .3], [2.05, .3]], M.gPas, 4.2, -.05);
  C.L.poly([[1.98, .62], [2.0, .76], [2.04, .72], [2.16, .72], [2.2, .76], [2.22, .62], [2.16, .56], [2.04, .56]], TS, 4.4, .06).dot(2.05, .67, 1, KR, 4.5, -.3).dot(2.15, .67, 1, KR, 4.5, -.3);
  C.L.line([[2.1, .58], [2.1, .5]], M.gDemir, 1.8, 6);
  payanda(.86, 4.3, 1.0); payanda(1.66, 4.3, 1.0);
  b.gable(.3, 2.9, 2.9, 4.3, 1.32, .9, CT, { axis: 'x', ov: .14, wall: TK, tex: 'rows', step: .17 }).G.shp('round', .58, .2, .24, .24, KR, 3, -.3);
  b.box(2.02, 4.3, 0, 2.76, 4.62, .26, TK, { edge: false, T: TA });
  b.pool(2.07, 4.33, 2.71, 4.57, .28, { col: '#2c3a42' });
  b.fx('fall', 2.4, 4.34, .5, { w: .05, h: .2 });
  b.art(2.7, 4.6, .27, pth(T(M.gBronz, -.3), 'M-3.4 -2.6a3.4 1.6 0 0 0 6.8 0l-1 2.4h-4.8z') + pth(T(M.gBronz, .1), K.ell(0, -2.6, 3.4, 1.4)), { r: .1, h: .2 });

  /* --- külhan: taş ocak odası, ateş ağzı +x'e bakar (tek ışık); uzun taş baca --- */
  const Ku = b.box(5.0, .2, 0, 5.9, 1.5, 1.0, KR, { T: null });
  Ku.R.courses({ rh: .22, bw: .4, dens: .5 }).poly([[.36, .62], [1.02, .62], [.92, .98], [.46, 1]], T(KR, -.3), 2.6, -.2);
  Ku.L.courses({ rh: .22, bw: .4, dens: .4 });
  Ku.R.arcade(.36, 1.02, 1, .56, { pier: .08, th: .3, kind: 'point', dark: '#2a1810', floor: '#3a2a22' });
  Ku.R.put(5.4, K.kf(M.gKor), Ku.R.shapeD('round', .52, .02, .42, .15, -.2)).put(5.5, K.kf(M.gAtes), Ku.R.shapeD('round', .62, .05, .22, .08, -.2));
  b.fx('fire', 5.74, .78, .1, { s: .7 });
  b.hip(4.94, .14, 5.96, 1.56, 1.0, .5, CT, { tex: 'rows', step: .16 });
  const c1 = b.box(5.2, .25, 1.0, 5.7, .75, 2.3, TK, { edge: false }); c1.L.courses({ rh: .2, bw: .3, dens: .4 }); c1.R.courses({ rh: .2, bw: .3, dens: .3 });
  b.box(5.17, .22, 2.3, 5.73, .78, 2.37, TA, { edge: false, cast: false });
  const c2 = b.box(5.25, .3, 2.37, 5.65, .7, 3.45, TK, { edge: false }); c2.L.courses({ rh: .2, bw: .3, dens: .4 }); for (const f of [c2.L, c2.R]) f.band(.82, .26, '#2e2a28', 0, 3).band(.3, .04, M.gDemir, 0, 3);
  b.box(5.2, .25, 3.45, 5.7, .75, 3.53, TA, { edge: false, cast: false });
  b.fx('smoke', 5.45, .5, 3.58, { s: 1.5 });

  /* --- odunluk: arduvaz sundurma altında istif; avluda kütük yığını, kesme kütüğü, balta --- */
  const W = b.box(5.08, 1.62, 0, 5.82, 2.82, .58, AH, { edge: false, L: T(AK, -.1), T: AA });
  W.R.planks({ dir: 'h', step: .145 });
  { let d = ''; for (let i = 0; i < 5; i++) for (let k = 0; k < 4; k++) d += `M${W.L.P(.08 + i * .145 + (k % 2) * .03, .075 + k * .143)}h.1`;
    W.L.put(5, 'Ln ' + K.ks(W.L.c(AA, .1)), d, 'stroke-width="3.7"').put(5.1, 'Ln ' + K.ks(W.L.c(AH, -.1)), d, 'stroke-width="1.3"'); }
  b.line3([[5.94, 1.56, 0], [5.94, 1.56, .7]], AK, 1.6).line3([[5.94, 2.84, 0], [5.94, 2.84, .7]], AK, 1.6);
  b.shed(5.0, 1.5, 6.02, 2.9, .68, 1.02, '+x', M.gCatiK, { tex: 'rows' });
  { let gv = '', hl = ''; const rows = [[0, 4], [1, 3], [2, 2], [3, 1]];
    for (const [k, n] of rows) for (let i = 0; i < n; i++) { const p = K.pr(4.95 + (i + k * .5) * .2, 4.0, .08 + k * .15), x = p[0], y = p[1];
      gv += `M${f1(x + 1)} ${f1(y - .5)}l8 -4`; hl += `M${f1(x)} ${f1(y)}h.1`; }
    b.art(0, 0, 0, ln(T(AH, -.25), gv, 4.6) + ln(AA, hl, 4.8) + ln(AH, hl, 1.6), { bb: [4.85, 3.5, 0, 5.75, 4.02, .62] }); }
  b.cyl(5.72, 4.62, .16, 0, .24, AH, { top: AA, cast: false });
  b.art(5.72, 4.62, .24, ln(AA, 'M-1 -1L6 -9', 1.4) + pth(T(M.gDemir, .2), 'M-3.4 -2.8l3 -1.2l1.4 2.6l-2.6 2z'), { r: .15, h: .4 });
  b.art(5.3, 4.85, 0, pth(AA, 'M-5 0l4 -2l5 1l-4 2zM3 3l5 -1l1 2l-5 1z') + pth(T(AK, 0), 'M-5 0l5 1v1.6l-5 -1zM3 3l4 2v1.4l-4 -2z'), { r: .2, h: .1 });

  /* --- avlu: selviler, taş seki, peştemal ipi, tellak, kukuletalı müşteri --- */
  b.tree('selvi', .42, 5.5, { s: .95 }).tree('selvi', 1.05, 5.78, { s: .68 });
  b.box(1.8, 5.4, 0, 2.7, 5.62, .24, TK, { edge: false, T: TA });
  { const F = new K.Face([.7, 4.85, .2], [1, 0, 0], [0, 0, 1], 1.2, .8, [0, 1, 0]), top = .74;
    for (const [a, w, h, c] of [[.08, .28, .5, '#6e6a62'], [.44, .26, .56, M.gKanK], [.8, .3, .46, '#5e5a54']]) F.rect(a, top - h, w, h, c, 3).rect(a, top - .03, w, .03, c, 4, -.2).rect(a, top - .14, w, .04, T(c, -.2), 4);
    b.line3([[.7, 4.85, 0], [.7, 4.85, 1.0]], AK, 1.5).line3([[1.9, 4.85, 0], [1.9, 4.85, 1.0]], AK, 1.5).line3([[.7, 4.85, .95], [1.9, 4.85, .95]], '#4a4038', .8);
    b.item([.72, 4.83, .2, 1.88, 4.87, .96], () => F.svg(), { cast: false }); }
  b.fig(4.0, 5.2, 0, { body: '#6e6a62', legs: '#2e2a28', hat: 'none', hair: '#1e1c1c', step: 1 });
  b.art(4.0, 5.2, 0, pth('#7a766c', 'M-4.6 -13.4h9.2v2.2h-9.2z') + pth(M.gKanK, 'M-4.6 -11.2h9.2v1.4h-9.2z') + pth('#5e5a54', 'M-4.2 -15h8.4v1.6h-8.4z'), { bb: [3.88, 5.08, 0, 4.16, 5.36, .9] });
  b.fig(2.95, 5.6, 0, { body: '#3e3a38', legs: '#2a2626', hat: 'ortu', hatCol: '#2e2a2a', robe: true });

  // odun arabası
  b.box(5.0, 5.35, .17, 5.8, 5.75, .32, AH, { edge: false }).L.planks({ dir: 'h', step: .075 });
  { const F = new K.Face([5.18, 5.77, 0], [1, 0, 0], [0, 0, 1], .42, .42, [0, 1, 0]); F.shp('round', 0, 0, .42, .42, AK, 3).shp('round', .07, .07, .28, .28, AH, 4, .1).dot(.21, .21, 1.4, M.gDemir, 5);
    b.item([5.18, 5.75, 0, 5.6, 5.8, .42], () => F.svg(), { cast: false }); }
  b.line3([[5.8, 5.4, .3], [6.18, 5.4, .2]], AK, 1.4).line3([[5.8, 5.7, .3], [6.18, 5.7, .2]], AK, 1.4);
  b.line3([[5.08, 5.45, .37], [5.72, 5.45, .37]], T(AH, -.25), 4.4).line3([[5.05, 5.63, .37], [5.7, 5.63, .37]], T(AH, -.1), 4.4).line3([[5.1, 5.54, .47], [5.74, 5.54, .47]], AH, 4.4);
  b.tag(3.0, 5.9, 0).doorAt(3.9, 4.35);
});
