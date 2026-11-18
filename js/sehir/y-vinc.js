/* Liman vinci — ayak çarkıyla çalışan ahşap rıhtım vinci. Kolu +x'e (suya) uzanır; çarkı şehir döndürür (b.fx 'wheel'). */
CK.def('vinc', { w: 3, d: 3, name: 'Liman Vinci' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln;
  b.gpoly([[.3, .5], [2.6, .5], [2.6, 2.6], [.3, 2.6]], T(M.parkeK, -.06), { op: .5 });
  // taş kaide ve dönen ahşap gövde
  const base = b.box(.5, .8, 0, 1.9, 2.2, .22, M.tasK, { edge: false }); base.L.courses({ rh: .11, bw: .4, dens: .8 });
  const h = b.box(.62, .92, .22, 1.78, 2.08, 1.55, M.ahsap, { edge: false });
  h.L.planks({ dir: 'v', step: .2 }).timber({ posts: [.04, 1.12], rails: [.04, 1.28], braces: [[.04, .04, 1.12, 1.28]], wid: 1.8 }).door(.34, .46, .8, { col: M.ahsapK, sove: null });
  h.R.planks({ dir: 'v', step: .2 }).timber({ posts: [.04, 1.12], rails: [.04, 1.28], wid: 1.8 });
  b.hip(.46, .76, 1.94, 2.24, 1.55, .62, M.padavra, { tex: 'rows' });
  // ayak çarkı: gövdenin +x yüzünde
  b.fx('wheel', 1.84, 1.5, .98, { r: .72, axis: 'x', kind: 'tekerlek' });
  // vinç kolu, destek, halat ve asılı sandık
  b.line3([[1.2, 1.5, 1.7], [3.25, 1.5, 3.0]], M.ahsapK, 3.2, { pad: .1 });
  b.line3([[1.2, 1.5, 2.15], [1.2, 1.5, 1.7]], M.ahsapK, 2.6).line3([[1.2, 1.5, 2.9], [3.25, 1.5, 3.0]], '#6a5a4a', .9).line3([[1.2, 1.5, 2.9], [1.2, 1.5, 2.1]], M.ahsapK, 2.2).line3([[1.2, 1.5, 2.9], [.9, 1.5, 1.9]], '#6a5a4a', .9);
  b.line3([[3.25, 1.5, 3.0], [3.25, 1.5, 1.25]], '#6a5a4a', .9);
  b.art(3.25, 1.5, 3.0, pth(M.demir, K.circ(0, 0, 2.4)) + pth(T(M.demir, .3), K.circ(0, 0, 1)), { bb: [3.2, 1.45, 2.9, 3.3, 1.55, 3.1] });
  const c = b.box(3.03, 1.28, .8, 3.47, 1.72, 1.2, M.ahsapA, { edge: false, cast: false }); c.L.planks({ dir: 'h', step: .13 }); c.R.planks({ dir: 'h', step: .13 });
  b.line3([[3.05, 1.3, 1.2], [3.25, 1.5, 1.4]], '#6a5a4a', .7).line3([[3.45, 1.7, 1.2], [3.25, 1.5, 1.4]], '#6a5a4a', .7).line3([[3.45, 1.3, 1.2], [3.25, 1.5, 1.4]], '#6a5a4a', .7);
  // yük ve işçi
  b.crate(2.35, 2.45, 0, .46).crate(2.85, 2.6, 0, .4, { fill: '#c98f63' }).crate(2.55, 2.5, .37, .36).barrel(.75, 2.6).barrel(1.2, 2.7).sack(1.75, 2.65);
  b.fig(2.7, 1.95, 0, { body: '#7a5038', hat: 'fes', legs: '#3a3230' }); b.art(2.7, 1.95, 0, ln('#6a5a4a', 'M4 -12L13 -22', .7), { bb: [2.6, 1.85, 0, 2.85, 2.1, 1] });
  b.critter('marti', 1.1, 1.3, 2.18);
});
