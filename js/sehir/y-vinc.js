/* Liman vinci — ayak çarkıyla çalışan kara ahşap rıhtım vinci (gotik): is tutmuş taş kaide, çatkılı çark evi, dik arduvaz külah,
   demir kuşaklı kol, zincirde asılı yük. Kolu +x'e (suya) uzanır; çarkı şehir döndürür (b.fx 'wheel'). Işık yok. */
CK.def('vinc', { w: 3, d: 3, name: 'Liman Vinci' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, P = K.P, PL = K.PL;
  const AH = M.gAhsap, AK = M.gAhsapK, DM = M.gDemir, ZN = T(M.gDemir, .2);
  // zincir: 3B noktalar arasında halka halka (kesik kalın çizgi)
  const chain = (p, q, w = 1.6) => ln(ZN, `M${P(...p)} ${P(...q)}`, w, 'stroke-dasharray="1.6 1.2"');
  b.gpoly([[.3, .5], [2.6, .5], [2.6, 2.6], [.3, 2.6]], T(M.gKara, -.1), { op: .55 });
  b.gpoly([[2.2, 1.0], [2.9, 1.1], [2.95, 1.9], [2.3, 2.0]], T(M.gKara, -.3), { op: .45 });                     // yük altındaki ıslak leke

  /* --- kaide: is tutmuş kalın taş --- */
  const base = b.box(.48, .78, 0, 1.92, 2.22, .3, M.gKara, { edge: false });
  base.L.courses({ rh: .15, bw: .42, dens: .8 }).stones(3, { rh: .15 }); base.R.courses({ rh: .15, bw: .42, dens: .7 });
  base.L.dots([[.3, .03], [.5, .05], [1.2, .02], [1.3, .04]], 2.6, M.gYosun, 4);

  /* --- çark evi: kara ahşap, çatkı, demir kuşaklı sivri kapı --- */
  const h = b.box(.62, .92, .3, 1.78, 2.08, 1.62, M.gAhsapA, { edge: false });
  h.L.planks({ dir: 'v', step: .16 }).timber({ col: AK, posts: [.05, 1.11], rails: [.06, 1.24], braces: [[.05, .06, .3, 1.24], [1.11, .06, .86, 1.24]], wid: 2.2 })
    .door(.36, .44, .86, { kind: 'point', col: AK, sove: null });
  h.L.line([[.34, .32], [.84, .32]], DM, 1.4, 6.4).line([[.34, .62], [.84, .62]], DM, 1.4, 6.4).win(.88, .9, .14, .24, { kind: 'point', frame: AK, lit: false, sill: false });
  h.R.planks({ dir: 'v', step: .16 }).timber({ col: AK, posts: [.05, 1.11], rails: [.06, 1.24], wid: 2.2 }).shadeTop(.16);

  /* --- dik arduvaz külah, mahyada demir sivri uç --- */
  b.hip(.44, .74, 1.96, 2.26, 1.62, 1.05, M.gCati, { tex: 'rows', step: .2 });
  b.line3([[1.2, 1.5, 2.6], [1.2, 1.5, 3.05]], DM, 1.6);
  b.art(1.2, 1.5, 3.05, pth(DM, 'M-1.4 0L0 -5L1.4 0Z'), { bb: [1.15, 1.45, 3.05, 1.25, 1.55, 3.2] });

  /* --- ayak çarkı: gövdenin +x yüzünde --- */
  b.fx('wheel', 1.84, 1.5, .98, { r: .72, axis: 'x', kind: 'tekerlek' });

  /* --- kol: çatıdan çıkan kara kiriş, demir kuşaklar, gergi zinciri; uçta makara (sıralama kutusu çatının üstünde) --- */
  { const A = [1.66, 1.5, 1.99], E = [3.25, 1.5, 3.0], m = t => A.map((v, i) => v + (E[i] - v) * t);
    let s = ln(T(AK, -.2), `M${P(...A)} ${P(...E)}`, 4.2) + ln(T(AH, .12), `M${P(A[0], A[1], A[2] + .03)} ${P(E[0], E[1], E[2] + .03)}`, 1);
    for (const t of [.22, .5, .78]) { const p = m(t); s += ln(DM, `M${P(p[0] - .02, p[1], p[2] - .05)} ${P(p[0] + .02, p[1], p[2] + .05)}`, 3); }
    s += chain([1.2, 1.5, 3.0], E, 1.2) + ln(DM, `M${P(1.2, 1.5, 2.6)} ${P(1.2, 1.5, 3.0)}`, 2);
    s += pth(DM, K.circ(...K.pr(...E), 2.8)) + pth(T(DM, .35), K.circ(...K.pr(...E), 1));
    b.item([1.6, 1.45, 2.62, 3.35, 1.55, 3.1], s, { cast: false }); }

  /* --- zincirde asılı yük: demir kuşaklı sandık, kanca --- */
  b.item([3.2, 1.45, 1.4, 3.3, 1.55, 3.0], chain([3.25, 1.5, 2.96], [3.25, 1.5, 1.44]) + pth(DM, K.circ(...K.pr(3.25, 1.5, 1.42), 1.8)), { cast: false });
  const c = b.box(3.03, 1.28, .8, 3.47, 1.72, 1.2, M.gAhsapA, { edge: false, cast: false });
  for (const f of [c.L, c.R]) f.planks({ dir: 'h', step: .13 }).line([[.06, 0], [.06, .4]], DM, 1.6, 6.3).line([[.38, 0], [.38, .4]], DM, 1.6, 6.3);
  b.item([3.03, 1.28, 1.2, 3.47, 1.72, 1.42], ln(ZN, `M${P(3.05, 1.3, 1.2)} ${P(3.25, 1.5, 1.4)}M${P(3.45, 1.7, 1.2)} ${P(3.25, 1.5, 1.4)}M${P(3.45, 1.3, 1.2)} ${P(3.25, 1.5, 1.4)}`, .9), { cast: false });

  /* --- yük ve işçi; damda kuzgun --- */
  b.crate(2.35, 2.45, 0, .46, { col: M.gAhsapA }).crate(2.85, 2.6, 0, .4, { col: AH }).crate(2.55, 2.5, .37, .36, { col: T(M.gAhsapA, .1) })
    .barrel(.75, 2.6, 0, { col: AK, top: AH }).barrel(1.2, 2.7, 0, { col: AK, top: AH }).sack(1.75, 2.65, 0, { col: '#6e6452' });
  // kaideye dayalı demir zincir yığını
  { const p = K.pr(.62, 2.32, 0); b.item([.5, 2.24, 0, .76, 2.42, .12], ln(ZN, K.ell(p[0], p[1] - 1.4, 6, 2.6) + K.ell(p[0] + 1, p[1] - 2.6, 4, 1.8), 1.8, 'stroke-dasharray="1.6 1.1"'), { cast: false }); }
  b.fig(2.7, 1.95, 0, { body: '#4a3e34', hat: 'none', hair: '#1e1a18', legs: '#2a2624' });
  b.art(2.7, 1.95, 0, ln(T(AK, .1), 'M4 -12L13 -22', .8), { bb: [2.6, 1.85, 0, 2.85, 2.1, 1] });
  b.critter('guvercin', 2.62, 1.5, 2.6, { col: '#26262b' });
});
