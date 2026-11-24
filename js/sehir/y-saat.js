/* Saat Kulesi — yukarı şehrin saat kulesi (gotik): ince, kare, kesme taş; 3 × 3 parselin ortasında serbest durur.
   Aşağıdan yukarı: payandalı kaide (+y'de sivri kemerli kapı, +x'te nişli çeşme) · dar sivri pencereli gövde (tek mum ışıklı pencere) ·
   saat katı (iki yüzde soluk kemik kadran, sönük) · açık sivri kemerli çan katı · köşe fiyalleri ve dik arduvaz külah, demir sivri uç.
   Işık: yalnız gövdedeki küçük mum ışıklı pencere. */
CK.def('saat', { w: 3, d: 3, name: 'Saat Kulesi' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, C = 1.2;
  const TAS = M.gTas, TK = M.gTasK, TA = M.gTasA, KR = M.gKara, DM = M.gDemir;
  const sq = h => [C - h, C - h, C + h, C + h];                       // merkezli kare: [x0,y0,x1,y1]
  const bx = (h, z0, z1, col, o) => { const q = sq(h); return b.box(q[0], q[1], z0, q[2], q[3], z1, col, o); };

  /* --- zemin: kara taş teras, kule çevresinde halka, çeşme önünde ıslaklık --- */
  b.pave(0, 0, 3, 3, T(KR, -.06)); b.pave(.14, .14, 2.86, 2.86, TK);
  const ring = r => { const p = []; for (let i = 0; i < 28; i++) { const a = i / 28 * 6.283; p.push([Math.max(.14, Math.min(2.86, C + Math.cos(a) * r)), Math.max(.14, Math.min(2.86, C + Math.sin(a) * r))]); } return p; };
  b.gpoly(ring(1.6), T(KR, .04)); b.gpoly(ring(1.48), T(TK, .08));
  let jd = ''; for (let i = 0; i < 13; i++) { const a = (-.42 + i / 12 * 2.42), ca = Math.cos(a), sa = Math.sin(a); jd += `M${K.P(C + ca * 1.05, C + sa * 1.05)} ${K.P(C + ca * 1.48, C + sa * 1.48)}`; }
  b.ground(ln(T(KR, -.1), jd, .8));
  b.gpoly([[2.0, .8], [2.6, .75], [2.75, 1.3], [2.5, 1.75], [2.0, 1.6]], T(KR, -.3), { op: .5 });
  b.ground(K.dots(M.gYosun, [[.3, .5], [.6, .25], [2.6, 2.7], [2.75, 2.3], [.25, 2.6]].map(p => K.pr(...p)), 2.4));

  /* --- kaide: kalın kesme taş, koyu su basman, köşelerde payandalar --- */
  bx(.8, 0, .18, KR, { edge: false });
  const g = bx(.7, .18, 1.7, TAS);
  for (const f of [g.L, g.R]) { f.courses({ rh: .24, bw: .5, dens: .95 }).stones(6, { rh: .24 }).shadeTop(.14); f.band(0, .22, TK, -.02); }
  g.L.door(.42, .56, 1.04, { kind: 'point', col: M.gAhsapK, sove: TA });
  g.L.dots([[.08, .26], [.16, .3], [1.3, .24]], 2.2, M.gYosun, 7);
  // payandalar: ön köşede ve iki yan uçta, eğik taş başlıklı
  const pay = (x0, y0, x1, y1, dir) => { const p = b.box(x0, y0, .18, x1, y1, 1.36, TAS, { edge: false }); p.L.band(0, .2, TK, -.02); p.R.band(0, .2, TK, -.02);
    b.shed(x0 - .02, y0, x1 + .02, y1 + (dir === '+y' ? .03 : 0), 1.36, 1.62, dir, TK, { tex: false }); };
  pay(C - .7, C + .7, C - .52, C + .9, '+y'); pay(C + .5, C + .7, C + .68, C + .9, '+y');
  b.box(C + .7, C + .5, .18, C + .9, C + .68, 1.36, TAS, { edge: false }).R.band(0, .2, TK, -.02); b.shed(C + .7, C + .48, C + .93, C + .7, 1.36, 1.62, '+x', TK, { tex: false });
  b.box(C + .7, C - .7, .18, C + .9, C - .52, 1.36, TAS, { edge: false }).R.band(0, .2, TK, -.02); b.shed(C + .7, C - .72, C + .93, C - .52, 1.36, 1.62, '+x', TK, { tex: false });
  b.stairs(.86, 1.96, 1.54, 2.22, .18, 0, 'y', TK);

  /* --- çeşme: gölge yüzde sivri kemerli niş, demir lüle, taş tekne --- */
  g.R.shp('point', .38, .22, .64, 1.0, TA, 3, .06).shp('point', .45, .22, .5, .9, T(KR, -.3), 4);
  g.R.rect(.45, .22, .5, .36, TK, 4.5, -.06).line([[.7, .72], [.7, .72, .12]], DM, 2, 6.2, .1).dot(.7, .74, 1.6, DM, 6, .1);
  b.box(1.96, .86, 0, 2.34, 1.54, .46, TK, { edge: false });
  b.pool(2.01, .91, 2.29, 1.49, .44, { col: '#3b4852' });
  b.fx('fall', 2.03, 1.2, .74, { w: .06, h: .28 });

  /* --- silme + gövde: kesme taş, köşelerde açık taş zıvana, dar sivri pencereler --- */
  bx(.76, 1.7, 1.82, TK, { edge: false });
  const s = bx(.5, 1.82, 4.1, TAS);
  for (const f of [s.L, s.R]) { f.courses({ rh: .28, bw: .46, dens: .55 });
    for (let i = 0, z = 0; z < 2.2; z += .28, i++) { const w = i % 2 ? .14 : .24; f.rect(0, z, w, .24, TA, 2.4, -.02).rect(1 - (i % 2 ? .24 : .14), z, i % 2 ? .24 : .14, .24, TA, 2.4, -.02); }
    f.shadeTop(.2); }
  s.L.win(.4, .5, .2, .7, { kind: 'point', sove: TA, frame: DM, bars: [1, 3], lit: false });
  s.L.win(.42, 1.6, .16, .44, { kind: 'point', sove: TA, frame: DM, bars: [1, 2], lit: false });
  s.R.win(.42, 1.5, .16, .44, { kind: 'point', sove: TA, frame: DM, bars: [1, 2], lit: true });          // mum ışıklı tek pencere
  s.R.win(.4, .4, .2, .7, { kind: 'point', sove: TA, frame: DM, bars: [1, 3], lit: false });
  s.L.patches(1, { col: KR, a0: .3, a1: .8, b0: .1, b1: .4 });

  /* --- saat katı: iki yüzde soluk kemik kadran, demir akrep ve yelkovan (ışıksız) --- */
  bx(.6, 4.1, 4.2, TK, { edge: false });
  const k = bx(.62, 4.2, 5.3, TAS);
  const dial = f => { const ca = .62, cb = .55, r = .4, Q = (t, q) => f.P(ca + Math.sin(t) * r * q, cb + Math.cos(t) * r * q);
    f.courses({ rh: .26, dens: .6 }).shadeTop(.12);
    f.shp('round', ca - r - .07, cb - r - .07, 2 * r + .14, 2 * r + .14, TA, 3, .02).shp('round', ca - r, cb - r, 2 * r, 2 * r, DM, 4);
    f.shp('round', ca - r + .05, cb - r + .05, 2 * r - .1, 2 * r - .1, M.gKemik, 4.5, -.16);
    let d1 = '', d2 = ''; for (let i = 0; i < 12; i++) { const t = i * Math.PI / 6; if (i % 3) d2 += `M${Q(t, .7)} ${Q(t, .8)}`; else d1 += `M${Q(t, .6)} ${Q(t, .8)}`; }
    f.put(6, 'Ln ' + K.ks(T(KR, -.3)), d1, 'stroke-width="1.5"').put(6, 'Ln ' + K.ks(T(KR, -.2)), d2, 'stroke-width=".8"');
    f.put(6.5, 'Ln ' + K.ks(T(DM, -.2)), `M${Q(0, 0)} ${Q(2.7, .44)}`, 'stroke-width="2"').put(6.5, 'Ln ' + K.ks(T(DM, -.2)), `M${Q(4.2, .12)} ${Q(1.05, .72)}`, 'stroke-width="1.1"');
    f.dot(ca, cb, 1.3, DM, 7, .1);
  };
  dial(k.L); dial(k.R);

  /* --- çan katı: dört yanı açık sivri kemer; arka duvarların iç yüzleri önce çizilir --- */
  bx(.7, 5.3, 5.38, TK, { edge: false });
  const z0 = 5.38, z1 = 6.32, h = .56, th = .15, q = sq(h), ar = { pier: .2, th, thru: true, floor: TK, kind: 'point' };
  const iA = new K.Face([q[0] + th, q[1] + th, z0], [1, 0, 0], [0, 0, 1], 2 * h - 2 * th, z1 - z0, [0, 1, 0]); iA.fill(TAS, -.3); iA.mc = TAS; iA.arcade(0, 2 * h - 2 * th, 1, .76, Object.assign({}, ar, { pier: .05 }));
  const iB = new K.Face([q[0] + th, q[3] - th, z0], [0, -1, 0], [0, 0, 1], 2 * h - 2 * th, z1 - z0, [1, 0, 0]); iB.fill(TAS, -.24); iB.mc = TAS; iB.arcade(0, 2 * h - 2 * th, 1, .76, Object.assign({}, ar, { pier: .05 }));
  b.item([q[0], q[1], z0, q[2], q[3], z1], () => iA.svg() + iB.svg(), { cast: false });
  const c = b.box(q[0], q[1], z0, q[2], q[3], z1, TAS, { T: null });
  c.L.arcade(0, 2 * h, 1, .76, ar); c.R.arcade(0, 2 * h, 1, .76, ar);
  for (const f of [c.L, c.R]) f.rect(0, 0, .2, z1 - z0, TA, 2.4, -.04).rect(2 * h - .2, 0, .2, z1 - z0, TA, 2.4, -.08);
  b.fx('bell', C, q[3] - th / 2, z0 + .6, { s: 1 }).fx('bell', q[2] - th / 2, C, z0 + .6, { s: 1 });

  /* --- saçak silmesi, köşe fiyalleri, dik arduvaz külah, demir sivri uç --- */
  bx(.64, z1, z1 + .08, TK, { edge: false });
  const zs = z1 + .08, RS = 2.15, fiyal = (x, y) => { b.box(x - .07, y - .07, zs, x + .07, y + .07, zs + .2, TAS, { edge: false, cast: false }); b.cone(x, y, .085, zs + .2, .48, TK, { tex: false }); };
  fiyal(C - .58, C - .58);
  b.hip(C - .6, C - .6, C + .6, C + .6, zs, RS, M.gCati, { tex: 'rows', step: .17 });
  fiyal(C - .58, C + .58); fiyal(C + .58, C - .58); fiyal(C + .58, C + .58);
  // külah yüzlerinde küçük sivri çatı pencereleri (lucarne)
  for (const [x, y, ax] of [[C, C + .38, 'x'], [C + .38, C, 'y']]) {
    const o = ax === 'x' ? [x - .13, y - .02, x + .13, y + .16] : [x - .02, y - .13, x + .16, y + .13], lb = b.box(o[0], o[1], zs + .45, o[2], o[3], zs + .72, TK, { edge: false, cast: false, T: null });
    (ax === 'x' ? lb.L : lb.R).win(.06, .02, .14, .22, { kind: 'point', frame: DM, lit: false, sill: false, bars: [1, 1] });
    b.gable(o[0], o[1], o[2], o[3], zs + .72, .2, M.gCati, { axis: ax === 'x' ? 'y' : 'x', ov: .03, tex: false, wall: TK, cast: false }); }
  const zt = zs + RS;
  b.art(C, C, zt, ln(DM, 'M0 2V-22', 1.3) + pth(DM, K.circ(0, -5, 1.8) + K.circ(0, -9.5, 1.2)) + pth(DM, 'M.6 -20.5h8.4l-2.6 2.6l2.6 2.6h-8.4z') + pth(DM, 'M-1.1 -22l1.1 -4.4l1.1 4.4z'), { bb: [C - .1, C - .1, zt, C + .1, C + .1, zt + .9] });
  b.fx('glint', C, C, zt + .2);

  /* --- meydan: kara bank, fıçı, insanlar, kuzgunlar --- */
  b.bench(.6, 2.62, 0, 'x', { l: .9, col: M.gAhsap });
  b.barrel(1.76, 2.18, 0, { col: M.gAhsapK, top: M.gAhsap, r: .16, h: .4 });
  b.fig(2.3, .58, 0, { body: '#4a4440', robe: true, hat: 'ortu', hatCol: '#2e2a28', carry: 'kova' });
  b.fig(1.05, 2.72, 0, { body: '#3e3a44', legs: '#2a2624', hat: 'none', hair: '#1e1a18' });
  b.fx('birds', 1.7, 2.6, 0, { n: 4 });
  b.critter('guvercin', C + .8, C + .6, 1.66, { col: '#26262b' }).critter('guvercin', C - .2, C + .72, 5.38, { flip: true, col: '#26262b' });
  b.critter('kedi', 2.5, 2.2, 0, { col: '#2a2828' });

  b.tag(1.5, 2.95, 0).doorAt(1.2, 2.4);
});
