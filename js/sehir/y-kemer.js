/* Su kemeri — dere vadisini aşıp şehre su getiren kara taş kemer (gotik: sivri kemerler, payandalı ayaklar, yosun). Parça parça uzatılabilir.
   opt: n (göz sayısı, 4) · dir 'x' (x boyunca uzanır, +y yüzü görünür) | 'y' · h (su yolunun yerden yüksekliği, 5).
   Parsel: dir 'x' için w = n × 3, d = 1.4. Ayaklar ayrı kutulardır; sivri gözlerin içinden arkadaki arazi görünür. Işık yok. */
CK.def('kemer', { w: 12, d: 1.4, name: 'Su Kemeri' }, (b, K, opt) => {
  const M = K.M, T = K.tone, n = opt.n || 4, dir = opt.dir || 'x', h = opt.h || 5, r = b.r;
  const ST = M.gTas, SK = M.gTasK, KR = M.gKara, YS = M.gYosun;
  const pier = .72, len = n * 3, span = (len - pier * (n + 1)) / n, rp = Math.min(span * .62, h * .4), top = h - .46, hs = top - .42 - rp;      // hs: kemerlerin başladığı kot
  // dir 'y' için eksenleri değiştiren kutu; "uzun yüz" kameraya bakan yan yüzdür
  const bx = (a0, c0, z0, a1, c1, z1, mat, o) => dir === 'x' ? b.box(a0, c0, z0, a1, c1, z1, mat, o) : b.box(c0, a0, z0, c1, a1, z1, mat, o);
  const long = q => dir === 'x' ? q.L : q.R, end = q => dir === 'x' ? q.R : q.L;
  const pt = (a, c, z) => dir === 'x' ? [a, c, z] : [c, a, z];
  // yosun: yüzün dibinde ve derzlerde koyu yeşil benek öbekleri
  const moss = (f, a0, a1, b0, b1, k) => { const pts = [[a0, b0]]; for (let i = 0; i <= k; i++) pts.push([a0 + (a1 - a0) * i / k, b0 + .05 + r() * r() * (b1 - b0)]); pts.push([a1, b0]);
    f.poly(pts, YS, 2.3, .06); };

  // ayaklar: is tutmuş taban, kesme taş gövde, önde kademeli payanda, üstte başlık taşı
  const piers = [];
  for (let i = 0; i <= n; i++) {
    const a = i * (span + pier), p = bx(a, .2, 0, a + pier, 1.2, hs, ST, { edge: false });
    for (const f of [long(p), end(p)]) f.courses({ rh: .3, bw: .5, dens: .7 }).stones(4).band(0, .42, KR, -.04).shadeBottom(.12, -.12);
    long(p).rect(.08 + r() * .3, .6 + r() * 1.4, .22, .9 + r() * .8, KR, 2.4, -.04);                                          // ıslak iz
    moss(long(p), .02, pier - .02, 0, 1.1, 9);
    // payanda: iki kademe, eğik başlıklı
    const pa = a + .16, pb = a + pier - .16, h1 = hs * .52, h2 = hs * .86;
    const q1 = bx(pa, 1.2, 0, pb, 1.4, h1, ST, { edge: false }); long(q1).courses({ rh: .3, bw: .4, dens: .6 }).band(0, .42, KR, -.04); moss(long(q1), 0, pb - pa, 0, .8, 5);
    const q2 = bx(pa + .04, 1.2, h1, pb - .04, 1.3, h2, ST, { edge: false }); long(q2).courses({ rh: .3, bw: .4, dens: .5 });
    for (const [c0, c1, z0] of [[1.3, 1.4, h1], [1.2, 1.3, h2]]) b.poly3([pt(pa, c1, z0), pt(pb, c1, z0), pt(pb, c0, z0 + .2), pt(pa, c0, z0 + .2)], T(ST, .1), { n: dir === 'x' ? [0, 1, 1] : [1, 0, 1] });
    bx(a - .06, .14, hs - .16, a + pier + .06, 1.26, hs, T(ST, .08), { edge: false, cast: false }); piers.push(p);
  }
  // kemer kuşağı: sivri gözler, içinden arkası görünür
  const u = bx(0, .2, hs, len, 1.2, top, ST, { edge: false }), L = long(u);
  L.arcade(0, len, n, rp, { kind: 'point', pier, th: .26, thru: true, cap: false, floor: false });
  // kemer taşları: gözün çevresinde koyu ikinci halka
  for (let i = 0; i < n; i++) { const oa = pier + i * (span + pier); L.put(6.1, 'Ln ' + K.ks(L.c(M.gTasA, .04)), L.shapeD('point', oa - .14, 0, span + .28, rp + .16).replace(/Z$/, ''), 'stroke-width="2.4"'); }
  L.courses({ rh: .28, bw: .55, dens: .45, b0: rp + .04 }).stones(n * 2, { b0: rp + .1 });
  // konsol dizisi (seğirdim) ve su yolunun altında silme
  L.band(L.h - .14, .14, SK, -.06, 3).put(6.3, 'Ln ' + K.ks(L.c(SK, -.26)), `M${L.P(0, L.h - .2)} ${L.P(len, L.h - .2)}`, 'stroke-width="3" stroke-dasharray="2.4 4.2"');
  end(u).courses({ rh: .28, bw: .5, dens: .6 });
  // su yolu: iki yanda alçak kenar taşı, arada koyu su
  bx(-.02, .1, top, len + .02, 1.3, top + .2, T(ST, .06), { edge: false, cast: false });
  bx(-.02, .1, top + .2, len + .02, .34, top + .46, SK, { edge: false, cast: false });
  const ed = bx(-.02, 1.06, top + .2, len + .02, 1.3, top + .46, SK, { edge: false, cast: false }); long(ed).stones(n * 2, { rh: .26 });
  const WC = '#3d5658';
  if (dir === 'x') b.pool(-.02, .34, len + .02, 1.06, top + .36, { col: WC }); else b.pool(.34, -.02, 1.06, len + .02, top + .36, { col: WC });
  // kenardan sarkan yosun perdeleri
  { const f = long(u), p0 = [], p1 = []; for (let i = 0; i < n * 5; i++) { const a = r() * len, ln = .15 + r() * (r() < .25 ? 1.1 : .45); for (let bb = f.h - .02; bb > f.h - ln; bb -= .09) { p0.push([a + (r() - .5) * .06, bb]); if (r() < .4) p1.push([a + .03, bb + .03]); } }
    f.dots(p0, 3.6, YS, 7.6, .1).dots(p1, 2.2, YS, 7.7, .3); }
  // kurumuş çalı öbekleri
  for (const a of [len * .22, len * .62, len * .9]) { const q = pt(a, 1.2, top + .46); b.tree('cali', q[0], q[1], { z: q[2], s: .55, col: YS, cast: false }); }
  // sızdıran derz: damlayan su
  { const q = pt(pier + span * 1.5 + pier, 1.24, hs + rp * .5); b.fx('fall', q[0], q[1], q[2], { w: .1, h: hs * .7 }); }
  // kenar taşında tüneyen kuzgunlar
  for (const a of [len * .36, len * .4]) { const q = pt(a, 1.18, top + .46); b.critter('guvercin', q[0], q[1], q[2], { col: '#26272c', flip: a > len * .38 }); }
  { const q = pt(len * .7, .7, top + .5); b.fx('birds', q[0], q[1], q[2], { n: 3 }); }
});
