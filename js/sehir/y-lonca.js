/* Lonca Sarayı — yukarı şehrin taç yapısı: gotik lonca katedrali (koleksiyon defteri buradan açılır). Parsel 10 × 10.
   +y (aydınlık) cephe: iki sivri kuleli batı cephesi, ortada kızıl vitraylı büyük gül pencere, önde wimpergli derin portal.
   +x (gölge) cephe: yan nef, uçan payandalar ve kuleli payanda ayakları, üst pencere dizisi. Mahyanın ortasında ince sivri kule (flèche).
   Işık (3): gül pencere (kızıl, güçlü) · aralık portaldan taşan sıcak ışık · sol kulede mum ışıklı tek küçük pencere. */
CK.def('lonca', { w: 10, d: 10, name: 'Lonca Sarayı' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, f1 = K.f1, P = K.P;
  const ST = M.gTas, SK = M.gTasK, SA = M.gTasA, KR = M.gKara, RF = M.gCati, FE = M.gDemir, YS = M.gYosun;
  const PV = T(SK, .06);
  const WO = { kind: 'point', sove: SA, frame: FE, lit: false, sill: false, bars: [1, 3] };

  /* --- yardımcılar --- */
  // bir yapı grubunu tek parça olarak çiz (sıralamada birbirini örtmesin)
  const grp = fn => { const tb = new K.Builder(); fn(tb); return tb.items.map(it => typeof it.draw === 'function' ? it.draw() : it.draw).join(''); };
  // demir şiş: küreli, baklava uçlu
  const spike = (x, y, z, s = 1) => b.art(x, y, z, ln(FE, `M0 1v${f1(-16 * s)}`, 1.3) + pth(FE, K.circ(0, -4 * s, 1.8 * s) + `M0 ${f1(-11.5 * s)}l${f1(1.3 * s)} ${f1(2.2 * s)}l${f1(-1.3 * s)} ${f1(2.2 * s)}l${f1(-1.3 * s)} ${f1(-2.2 * s)}z`), { bb: [x - .05, y - .05, z, x + .05, y + .05, z + .6 * s] });
  // payanda başlığı: duvara doğru yükselen eğik taş (dir: +y ya da +x yüzü önde)
  const slope = (x0, y0, x1, y1, z, h, dir) => dir === 'y'
    ? b.poly3([[x0, y1, z], [x1, y1, z], [x1, y0, z + h], [x0, y0, z + h]], T(SA, -.04), { n: [0, 1, 1] })
    : b.poly3([[x1, y0, z], [x1, y1, z], [x0, y1, z + h], [x0, y0, z + h]], T(SA, -.04), { n: [1, 0, 1] });
  // fiyal: ince taş külah
  const pinn = (x, y, z, r = .13, h = .75) => { b.cone(x, y, r, z, h, SA, { cast: false }); };
  // yosun: duvar dibinde düzensiz koyu yeşil yama
  const moss = (f, a0, a1, k, b1 = .5) => { const r = f.r, pts = [[a0, 0]]; for (let i = 0; i <= k; i++) pts.push([a0 + (a1 - a0) * i / k, .04 + r() * r() * b1]); pts.push([a1, 0]); f.poly(pts, YS, 2.3, .08); };
  const dark = (f, a, bb, w, h) => f.shp('point', a - .06, bb - .03, w + .12, h + .08, SA, 3, .04).shp('point', a, bb, w, h, M.ic, 4);

  /* --- zemin: koyu taş meydan, kenar şeridi, portal önüne vuran ışık --- */
  b.pave(0, 8.4, 10, 10, PV); b.pave(8.0, 0, 10, 8.4, PV);
  b.gpoly([[0, 9.8], [10, 9.8], [10, 10], [0, 10]], T(PV, -.14)); b.gpoly([[9.8, 0], [10, 0], [10, 9.8], [9.8, 9.8]], T(PV, -.14));
  b.gpoly([[3.7, 9.6], [5.3, 9.6], [5.6, 10], [3.4, 10]], T(PV, -.08));
  b.spill(4.5, 9.45, 2.1, { op: .85 });

  /* --- orta nef: yüksek taş kütle, dik arduvaz çatı (mahya y boyunca, alınlık cepheye bakar) --- */
  const nv = b.box(2.4, 1.0, 0, 6.6, 8.0, 4.6, ST, { T: null }), F = nv.L, NR = nv.R;
  F.band(0, .45, KR, -.02).courses({ rh: .34, bw: .8, dens: .3, b0: .45 }).stones(6, { rh: .34, b0: .5 });
  // cephe: gül pencere altında kör kemer dizisi, yanlarda dar sivri pencereler
  for (let i = 0; i < 7; i++) F.shp('point', .62 + i * .43, 2.2, .28, .4, SK, 3, -.2);
  F.band(2.1, .08, SA, .06, 3).band(2.68, .07, SA, .06, 3);
  F.win(.32, 1.0, .3, 1.3, WO).win(3.58, 1.0, .3, 1.3, WO);
  // GÜL PENCERE: taş çerçeve, kızıl vitray dilimleri, taş oyma (tracery), kızıl hâle
  { const ca = 2.1, cb = 3.7, R = .72, N = 12;
    F.shp('round', ca - R - .14, cb - R - .14, 2 * R + .28, 2 * R + .28, SA, 3.6, .06).shp('round', ca - R - .05, cb - R - .05, 2 * R + .1, 2 * R + .1, SK, 3.7, -.1);
    F.shp('round', ca - R, cb - R, 2 * R, 2 * R, M.gKanK, 3.8, null);
    const at = (r, t) => [ca + r * Math.cos(t), cb + r * Math.sin(t)];
    // iki halka cam: içte 12, dışta 12 dilim (yarım dilim kaydırılmış); parlak ve sönük kızıl almaşık
    for (let i = 0; i < N; i++) { const t0 = i / N * 6.2832, t1 = (i + 1) / N * 6.2832, u0 = t0 + .5 / N * 6.2832, u1 = t1 + .5 / N * 6.2832;
      F.poly([at(.2, t0), at(.44, t0), at(.44, t1), at(.2, t1)], i % 2 ? '#ff4220' : '#c42a1a', 3.9, null);
      F.poly([at(.48, u0), at(.7, u0), at(.7, (u0 + u1) / 2), at(.7, u1), at(.48, u1)], i % 3 ? '#ff3a1c' : '#9a2216', 3.9, null); }
    F.shp('round', ca - .17, cb - .17, .34, .34, '#ff8a2a', 3.95, null);
    let tr = ''; for (let i = 0; i < N; i++) { const t = i / N * 6.2832, p = at(.17, t), q = at(.46, t), u = t + .5 / N * 6.2832, p2 = at(.46, u), q2 = at(R, u); tr += `M${F.P(p[0], p[1])} ${F.P(q[0], q[1])}M${F.P(p2[0], p2[1])} ${F.P(q2[0], q2[1])}`; }
    F.put(4, 'Ln ' + K.ks(F.c(SK, -.1)), tr + F.shapeD('round', ca - .46, cb - .46, .92, .92).replace(/Z$/, '') + F.shapeD('round', ca - .17, cb - .17, .34, .34).replace(/Z$/, ''), 'stroke-width="1.4"');
    const g = F.q(ca, cb), gid = K.DEF('lnRoseGl', () => '<radialGradient id="lnRoseGl"><stop offset="0" stop-color="#ff5030" stop-opacity=".5"/><stop offset=".55" stop-color="#b8241a" stop-opacity=".2"/><stop offset="1" stop-color="#8e1c1c" stop-opacity="0"/></radialGradient>');
    F.put(9, 'Nl', `<circle cx="${f1(g[0])}" cy="${f1(g[1])}" r="48" fill="url(#${gid})"/>`, 'raw'); }
  moss(F, 0, .9, 6); moss(F, 3.3, 4.2, 6);
  // üst pencereler (gölge yüz, yan nefin üstünde)
  for (const y of [1.9, 3.35, 4.8, 6.25]) NR.win(8.0 - y - .17, 3.2, .34, 1.1, WO);
  NR.courses({ rh: .34, bw: .8, dens: .28, b0: 3.0 });
  const nr = b.gable(2.4, 1.0, 6.6, 8.0, 4.6, 2.3, RF, { axis: 'y', wall: ST, tex: 'rows', ov: .14 });
  // alınlık: üç sivri kör pencere ve kenarlarda tomurcuk süsleri
  { const G = nr.G; dark(G, 1.62, .4, .22, .62); dark(G, 1.99, .4, .22, .86); dark(G, 2.36, .4, .22, .62);
    let d = ''; for (let k = 1; k < 7; k++) { const t = k / 7; d += `M${G.P(2.1 * t, 2.3 * t)}h.01M${G.P(4.2 - 2.1 * t, 2.3 * t)}h.01`; } G.put(7, 'Ln ' + K.ks(G.c(SA, .1)), d, 'stroke-width="3.2"'); }
  spike(4.5, 8.05, 6.9, .9);
  // çatı yüzünde küçük sivri çatı pencereleri (karanlık)
  for (const y of [2.6, 4.9]) { const A = nr.A, aa = 8.14 - y; A.shp('point', aa - .2, 1.05, .4, .62, SA, 3, -.05).shp('point', aa - .12, 1.1, .24, .42, M.ic, 4); }

  /* --- ince sivri kule (flèche): mahyanın ortasında, demir külahlı --- */
  { const x = 4.5, y = 4.3, zr = 6.9, s = grp(tb => { const q = tb.box(x - .2, y - .2, zr - .3, x + .2, y + .2, zr + .55, SK, { edge: false });
      for (const f of [q.L, q.R]) dark(f, .12, .3, .16, .4);
      tb.cone(x, y, .3, zr + .55, 1.2, RF); });
    b.item([x - .3, y - .3, zr, x + .3, y + .3, zr + 1.75], s, { pts: [[x - .2, y - .2, zr], [x + .2, y + .2, zr], [x, y, zr + 1.75]] });
    spike(x, y, zr + 1.75, .6); }

  /* --- yan nef (+x): alçak duvar, sundurma çatı, sivri pencereler --- */
  const an = b.box(6.6, 1.0, 0, 7.5, 7.0, 2.45, ST, { T: null }), AR = an.R;
  AR.band(0, .45, KR, -.02).courses({ rh: .34, bw: .8, dens: .3, b0: .45 });
  for (const y of [1.9, 3.35, 4.8, 6.25]) AR.win(7.0 - y - .2, .7, .4, 1.25, WO);
  moss(AR, 0, 6, 18, .45);
  an.L.band(0, .45, KR, -.02);
  b.shed(6.6, 1.0, 7.62, 7.0, 2.38, 3.05, '+x', RF, { tex: 'rows' });

  /* --- payanda ayakları ve uçan payandalar --- */
  for (const yb of [1.15, 2.6, 4.05, 5.5]) {
    const y0 = yb - .17, y1 = yb + .17;
    const p1 = b.box(7.5, y0, 0, 8.0, y1, 1.6, ST, { edge: false }); p1.R.band(0, .45, KR, -.02).courses({ rh: .32, bw: .34, dens: .4 }); moss(p1.R, 0, .34, 3, .4);
    slope(7.85, y0, 8.0, y1, 1.6, .2, 'x');
    const p2 = b.box(7.5, y0, 1.6, 7.85, y1, 3.35, ST, { edge: false }); p2.R.courses({ rh: .32, bw: .34, dens: .4 });
    b.box(7.46, y0 - .03, 3.35, 7.89, y1 + .03, 3.45, SA, { edge: false, cast: false });
    pinn(7.675, yb, 3.45, .15, .85);
    // uçan payanda: ayaktan nef duvarına yükselen kemerli taş kol
    b.poly3([[7.5, y1, 3.0], [7.5, y1, 3.36], [6.6, y1, 4.3], [6.6, y1, 3.86], [6.8, y1, 3.78], [7.05, y1, 3.62], [7.3, y1, 3.36]], ST, { n: [0, 1, 0], bb: [6.6, y0, 3.05, 7.5, y1, 4.3] });
    b.poly3([[7.5, y1, 3.36], [7.5, y0, 3.36], [6.6, y0, 4.3], [6.6, y1, 4.3]], SA, { n: [1, 0, 1.1], bb: [6.6, y0, 3.05, 7.5, y1, 4.3] });
  }

  /* --- batı kuleleri: kare gövde, köşe payandaları, ikiz sivri pencere, çan gözleri, fiyalli korkuluk ve dik arduvaz külah --- */
  const tower = (x0, lit) => {
    const x1 = x0 + 1.4, y0 = 7.0, y1 = 8.4, H = 5.7, tw = b.box(x0, y0, 0, x1, y1, H, ST, { T: T(ST, -.25) });
    for (const f of [tw.L, tw.R]) { f.band(0, .45, KR, -.02).band(2.5, .07, SA, .06, 3).band(3.95, .07, SA, .06, 3).courses({ rh: .34, bw: .7, dens: .28, b0: .45 }).stones(3, { rh: .34, b0: .5 });
      f.win(.34, 2.72, .26, .95, WO).win(.8, 2.72, .26, .95, WO);
      dark(f, .36, 4.2, .68, 1.05); let lv = ''; for (let k = 1; k < 6; k++) lv += f.seg(.38, 4.2 + k * .16, 1.02, 4.2 + k * .16); f.put(5, 'Ln ' + K.ks(f.c(SK, -.1)), lv, 'stroke-width="1.6"');
      f.rect(0, H - .22, f.w, .22, SA, 3, -.06); }
    moss(tw.L, 0, 1.4, 8);
    if (lit) tw.L.win(.6, 1.35, .2, .44, { kind: 'point', sove: SA, frame: FE, lit: true, sill: false, bars: [1, 1] });
    else tw.L.win(.6, 1.35, .2, .44, Object.assign({}, WO, { bars: [1, 1] }));
    // köşe payandaları (ön yüz ve gölge yüz)
    for (const [a0, a1] of [[x0, x0 + .2], [x1 - .2, x1]]) { const q = b.box(a0, y1, .3, a1, y1 + .2, 3.9, ST, { edge: false }); q.L.band(3.4, .06, SA, .06, 3); slope(a0, y1, a1, y1 + .2, 3.9, .24, 'y'); }
    if (x0 > 5) for (const [c0, c1] of [[y0, y0 + .2], [y1 - .2, y1]]) { const q = b.box(x1, c0, 0, x1 + .2, c1, 3.9, ST, { edge: false }); q.R.band(0, .45, KR, -.02).band(3.4, .06, SA, .06, 3); slope(x1, c0, x1 + .2, c1, 3.9, .24, 'x'); }
    // korkuluk (ön ve sağ) + köşe fiyalleri + külah
    b.hip(x0 + .1, y0 + .1, x1 - .1, y1 - .1, H + .2, 2.3, RF, { tex: 'rows' });
    b.box(x0 - .06, y1 - .04, H, x1 + .06, y1 + .06, H + .32, SA, { edge: false, cast: false });
    b.box(x1 - .04, y0 - .06, H, x1 + .06, y1 - .04, H + .32, SA, { edge: false, cast: false });
    for (const [x, y] of [[x0, y1], [x1, y1], [x1, y0]]) pinn(x, y, H + .32, .1, .6);
    spike((x0 + x1) / 2, (y0 + y1) / 2, H + .2 + 2.3, 1.0);
    return tw;
  };
  tower(1.0, true); tower(6.6, false);
  b.fx('flag', 7.3, 7.7, 5.9 + 2.3 + .5, { col: M.gKan, s: 1.3, emblem: false });
  b.fx('banner', 1.45, 8.42, 3.9, { col: M.gKan, w: .5, h: 1.9, axis: 'x', trim: M.gKanK, emblem: false });
  b.fx('banner', 7.05, 8.42, 3.9, { col: M.gKan, w: .5, h: 1.9, axis: 'x', trim: M.gKanK, emblem: false });

  /* --- ön teras ve basamaklar --- */
  const tE = { edge: false };
  for (const [x0, y0, x1] of [[1.0, 8.4, 3.3], [5.7, 8.4, 8.0], [3.3, 8.6, 5.7]]) { const q = b.box(x0, y0, 0, x1, 9.05, .3, SK, tE); q.L.band(0, .3, SK, -.06).band(.24, .06, SA, .1, 3); }
  b.stairs(3.45, 9.05, 5.55, 9.6, .3, 0, 'y', SA);

  /* --- portal: öne taşan derin sivri kapı, kademeli kemer kuşakları, aralık kanatlardan taşan ışık, wimperg ve fiyaller --- */
  const pc = b.box(3.3, 8.0, 0, 5.7, 8.6, 2.2, ST, { T: null }), PL_ = pc.L;
  PL_.band(0, .3, SK, -.06);
  PL_.shp('point', .2, .3, 2.0, 1.86, SA, 3, .06).shp('point', .32, .3, 1.76, 1.74, ST, 3.1, -.1).shp('point', .44, .3, 1.52, 1.62, SK, 3.2, -.22);
  PL_.shp('point', .56, .3, 1.28, 1.5, '#3a2414>#ffb050', 3.5, null);
  PL_.shp('point', .74, .3, .92, 1.3, '#4a2c16>#ffd27a', 3.55, null);
  for (const [a, w] of [[.56, .22], [1.62, .22]]) { PL_.rect(a, .3, w, 1.18, M.gAhsapK, 3.6); PL_.line([[a + .03, .62], [a + w - .03, .62]], FE, 1, 3.7).line([[a + .03, 1.12], [a + w - .03, 1.12]], FE, 1, 3.7); }
  PL_.line([[1.2, .3], [1.2, 1.8]], SK, 2, 3.8, -.2);                                                                               // orta direk (trumeau)
  pc.R.band(0, .3, SK, -.06);
  b.gable(3.3, 8.0, 5.7, 8.6, 2.2, .9, RF, { axis: 'y', wall: ST, tex: 'rows', ov: .06 }).G.shp('round', 1.04, .16, .32, .32, SA, 3, .04).shp('round', 1.1, .22, .2, .2, M.ic, 4);
  for (const x of [3.38, 5.62]) { b.box(x - .1, 8.5, 2.2, x + .1, 8.7, 2.38, SA, { edge: false, cast: false }); pinn(x, 8.6, 2.38, .12, .7); }
  spike(4.5, 8.62, 3.1, .6);

  /* --- meydan: lonca ustası, kâtip, sandık taşıyan hamal, araba, selviler, kuzgunlar --- */
  b.tree('selvi', .55, 9.2, { s: 1.05 }); b.tree('selvi', 9.45, 8.75, { s: 1.0 });
  b.fig(3.05, 8.82, .3, { body: M.gMor, robe: true, hat: 'ortu', hatCol: '#2a2430' });
  b.art(3.05, 8.82, .3, ln(M.gAhsapK, 'M5.6 0V-21', 1.1) + pth(FE, K.circ(5.6, -22, 1.6)), { bb: [2.91, 8.68, .3, 3.19, 8.96, 1.15] });
  b.fig(6.05, 8.78, .3, { body: '#3a3a40', robe: true, hat: 'ortu', hatCol: '#2e2e34', flip: true });
  b.art(6.05, 8.78, .3, pth(M.gKemik, 'M-6.6 -12.6l4.6 1.2l4.6 -1.2v4l-4.6 1.2l-4.6 -1.2z') + ln('#5a5048', 'M-2 -11.4v4', .6), { bb: [5.91, 8.64, .3, 6.19, 8.92, 1.15] });
  b.cart(8.75, 9.35, 0, 'x', { col: M.gAhsap, load: M.gAhsapA });
  b.crate(8.45, 6.9, 0, .4, { col: M.gAhsap }).crate(8.5, 6.4, 0, .34, { col: M.gAhsapK }).barrel(9.0, 6.6, 0, { col: M.gAhsapK, top: M.gAhsap });
  b.fig(7.75, 9.55, 0, { body: '#4a4036', legs: '#2e2a26', carry: 'kasa', step: 1 });
  b.critter('guvercin', 5.62, 8.62, 3.08, { col: '#26272c' }); b.critter('guvercin', 2.2, 9.2, .3, { col: '#26272c', flip: true }); b.critter('kedi', 1.6, 9.0, .3, { col: '#24242a' });
  b.fx('birds', 5.2, 3.2, 7.2, { n: 3 });

  b.tag(5, 9.9, 0).doorAt(4.5, 10);
});
