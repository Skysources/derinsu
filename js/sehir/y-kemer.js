/* Su kemeri — dere vadisini aşıp şehre su getiren taş kemer. Parça parça uzatılabilir.
   opt: n (göz sayısı, 4) · dir 'x' (x boyunca uzanır, +y yüzü görünür) | 'y' · h (su yolunun yerden yüksekliği, 5).
   Parsel: dir 'x' için w = n × 3, d = 1.4. Ayaklar ayrı kutulardır; gözlerin içinden arkadaki arazi görünür. */
CK.def('kemer', { w: 12, d: 1.4, name: 'Su Kemeri' }, (b, K, opt) => {
  const M = K.M, T = K.tone, n = opt.n || 4, dir = opt.dir || 'x', h = opt.h || 5, r = b.r;
  const pier = .72, len = n * 3, span = (len - pier * (n + 1)) / n, rad = span / 2, top = h - .46, hs = top - .34 - rad;      // hs: kemerlerin başladığı kot
  // dir 'y' için eksenleri değiştiren kutu; "uzun yüz" kameraya bakan yan yüzdür
  const bx = (a0, c0, z0, a1, c1, z1, mat, o) => dir === 'x' ? b.box(a0, c0, z0, a1, c1, z1, mat, o) : b.box(c0, a0, z0, c1, a1, z1, mat, o);
  const long = q => dir === 'x' ? q.L : q.R, end = q => dir === 'x' ? q.R : q.L;
  const pt = (a, c, z) => dir === 'x' ? [a, c, z] : [c, a, z];

  // ayaklar: altta geniş taban, üstte başlık taşı
  const piers = [];
  for (let i = 0; i <= n; i++) {
    const a = i * (span + pier), p = bx(a, .2, 0, a + pier, 1.2, hs, M.tas, { edge: false });
    for (const f of [long(p), end(p)]) f.courses({ rh: .3, bw: .5, dens: .75 }).stones(5).band(0, .3, M.tasK, -.06).shadeBottom(.12, -.1);
    if (i % 2 === 1) long(p).rect(.12, .9 + r() * 1.2, .5, .5 + r() * .5, M.tasK, 2.4, -.1);      // nem lekesi
    bx(a - .06, .14, hs - .16, a + pier + .06, 1.26, hs, T(M.tas, .12), { edge: false, cast: false }); piers.push(p);
  }
  // kemer kuşağı: gözlerin üstü yarım daire, içinden arkası görünür
  const u = bx(0, .2, hs, len, 1.2, top, M.tas, { edge: false }), L = long(u);
  L.arcade(0, len, n, rad, { kind: 'arch', pier, th: .26, thru: true, cap: false, floor: false });
  L.courses({ rh: .28, bw: .55, dens: .5, b0: rad * .55 }).stones(n * 2, { b0: rad + .05 }).band(L.h - .1, .1, M.tasK, -.04, 3);
  end(u).courses({ rh: .28, bw: .5, dens: .6 });
  // su yolu: iki yanda alçak kenar taşı, arada akan su
  bx(-.02, .1, top, len + .02, 1.3, top + .2, T(M.tas, .08), { edge: false, cast: false });
  bx(-.02, .1, top + .2, len + .02, .34, top + .46, M.tas, { edge: false, cast: false }); bx(-.02, 1.06, top + .2, len + .02, 1.3, top + .46, M.tas, { edge: false, cast: false });
  if (dir === 'x') b.pool(-.02, .34, len + .02, 1.06, top + .36); else b.pool(.34, -.02, 1.06, len + .02, top + .36);
  // sarmaşık, ot öbekleri, incir fidanı
  long(piers[Math.min(1, n)]).vine({ kind: 'ivy', a0: 0, a1: pier, top: hs - .2, drop: [1, hs * .8], dens: .8, stem: pier * .7 });
  for (const [a, k] of [[len * .22, 0], [len * .58, 1], [len * .86, 0]]) { const q = pt(a, 1.2, top + .46); b.tree(k ? 'cicek' : 'cali', q[0], q[1], { z: q[2], s: k ? .7 : .6, cast: false }); }
  // sızdıran derz: damlayan su
  { const q = pt(pier + span * 1.5 + pier, 1.24, hs + rad * .5); b.fx('fall', q[0], q[1], q[2], { w: .1, h: hs * .7 }); }
  { const q = pt(len * .44, .7, top + .5); b.fx('birds', q[0], q[1], q[2], { n: 3 }); }
});
