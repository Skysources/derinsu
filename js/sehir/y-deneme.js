/* Çizim setini sınayan deneme sahnesi (yayına girmeyecek). */
CK.def('deneme', { w: 8, d: 5 }, (b, K) => {
  const M = K.M;
  const t = b.cyl(2, 2.5, 1.2, 0, 3, M.tas); t.courses(); t.band(0, .5, M.tasK, .25, 'lip').band(1.6, .2, M.mermer, .12, 'lip').band(3, .28, M.tasK, .14).merlons(3.28, 12, { e: .14 });
  const g = b.box(4.6, 1, 0, 7.4, 4, 1.2, M.krem); g.L.dots([[.4, .4], [.8, .4], [1.2, .6], [1.6, .8]], 4, M.kirmizi);
  b.gable(4.6, 1, 7.4, 4, 1.2, .9, M.kiremit, { axis: 'x', step: .4 });
  b.art(4, 4.4, 0, K.dots(M.mavi, [[0, 0], [4, -2], [8, -4], [12, -2]], 3));
});
