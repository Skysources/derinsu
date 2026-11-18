/* Çeşme — istinat duvarına yaslı anıtsal meydan çeşmesi: sivri kemerli mermer niş, turkuaz-lacivert çini ayna,
   pirinç lüle, mermer yalak, iki yanda taş kanat ve seki, kiremit saçak.
   opt.dir 'L' (varsayılan): cephe +y'ye bakar, sırtı y=0, parsel 3 × 1.6 · 'R': cephe +x'e bakar, sırtı x=0, parsel 1.6 × 3.
   Yerel eksenler: s = duvar boyunca (cepheye bakınca soldan sağa), t = duvardan dışarı. Cephe yüzünde a = s − s0 (iki yönde de aynı). */
CK.def('cesme', { w: 3, d: 1.6, name: 'Çeşme' }, (b, K, opt) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, R = (opt || {}).dir === 'R', W = 3;
  const X = (s, t) => R ? [t, W - s] : [s, t];
  const BB = (s0, t0, z0, s1, t1, z1) => R ? [t0, W - s1, z0, t1, W - s0, z1] : [s0, t0, z0, s1, t1, z1];
  // kutu: F = cephe yüzü, S = görünen yan yüz, T = üst
  const box = (s0, t0, z0, s1, t1, z1, col, o) => { const q = BB(s0, t0, z0, s1, t1, z1), k = b.box(q[0], q[1], q[2], q[3], q[4], q[5], col, o); return { F: R ? k.R : k.L, S: R ? k.L : k.R, T: k.T }; };
  const gp = (pts, col, o) => b.gpoly(pts.map(p => X(p[0], p[1])), col, o);
  const art = (s, t, z, svg, h = .4) => b.art(...X(s, t), z, svg, { h });
  const MR = M.mermer, TQ = M.turkuaz, LC = M.lacivert, GUL = '#d6a898', BKR = '#b8693a';
  // saksı: küçük, ucuz
  const saksi = (s, t, z, fl) => art(s, t, z, pth(T(M.kiremitA, -.16), 'M-2.6 0L-3.6 -4.6H3.6L2.6 0Z') + pth(M.sarmasik, K.circ(-2.2, -6.6, 2.8) + K.circ(2.4, -7.4, 3) + K.circ(0, -10, 2.8)) + K.dots(fl, [[-2.4, -7.6], [2, -9], [.2, -11.4], [3.4, -6.4]], 2), .6);

  /* --- zemin: açık taş döşeme, yalak önünde ıslaklık --- */
  gp([[0, 0], [3, 0], [3, 1.6], [0, 1.6]], M.parke);
  gp([[.3, .64], [2.7, .64], [2.7, 1.12], [2.34, 1.46], [.66, 1.46], [.3, 1.12]], M.parkeK);
  gp([[.7, .9], [2.3, .9], [2.45, 1.2], [1.7, 1.4], [.8, 1.25]], '#a9a48f', { op: .6 });
  b.spill(...X(1.5, 1), 1.5);

  /* --- yan kanatlar: kesme taş, mermer başlık, önlerinde seki --- */
  const kan = [.15, 2.25].map(s0 => {
    const k = box(s0, 0, 0, s0 + .6, .3, 1.25, M.tas, { T: MR });
    k.F.courses({ rh: .25, bw: .44, dens: .45 }).band(1.16, .09, MR, .1).band(0, .12, M.tasK);
    k.F.poly([[.3, .62], [.44, .8], [.3, .98], [.16, .8]], TQ, 3, .1).poly([[.3, .72], [.36, .8], [.3, .88], [.24, .8]], LC, 3.1, .1);
    k.S.band(1.16, .09, MR, .1); if (R ? s0 < 1 : s0 > 1) k.S.courses({ rh: .25, bw: .4, dens: .4 });
    box(s0 - .03, .3, 0, s0 + .63, .64, .24, M.tas, { edge: false, T: MR }).F.band(.17, .07, MR, .1);
    return k;
  });

  /* --- niş dibi: çini ayna, mermer ayna taşı --- */
  const bk = box(.75, 0, 0, 2.25, .28, 2, MR, { edge: false, T: null }), f = bk.F;
  const A0 = .3, B0 = .4, Wd = .9, Ht = 1.1, c = .2;
  f.rect(A0, B0, Wd, Ht, '#2f8f8f>#3f8a86', 3, R ? .3 : .1);
  for (let k = -Wd; k < Ht; k += c) { const u0 = Math.max(0, -k), u1 = Math.min(Wd, Ht - k); f.line([[A0 + u0, B0 + u0 + k], [A0 + u1, B0 + u1 + k]], LC, 1, 3.2, .1); }
  for (let k = c; k < Ht + Wd; k += c) { const u0 = Math.max(0, k - Ht), u1 = Math.min(Wd, k); f.line([[A0 + u0, B0 + k - u0], [A0 + u1, B0 + k - u1]], LC, 1, 3.2, .1); }
  const dp = []; for (let i = 0; i < 4; i++) for (let j = 0; j < 5; j++) dp.push([A0 + .15 + i * c, B0 + .2 + j * c]);
  f.dots(dp, 1.6, MR, 3.3, .1);
  f.shp('arch', .55, .4, .4, .62, '#ece7dc>#d8c39a', 4, .06).line([[.61, .4], [.61, .82], [.75, .95], [.89, .82], [.89, .4]], MR, .8, 4.1, -.16).dot(.75, .82, 2.2, M.bronz, 4.2, .1).line([[.75, .76], [.75, .46]], '#8fb8a4', 1.6, 4.1);

  /* --- ön gövde: mermer, sivri kemerli niş, iki renkli kemer taşları, çini kuşak --- */
  const g = box(.75, .28, 0, 2.25, .42, 2, MR, { T: null }), F = g.F;
  F.arcade(.33, 1.17, 1, 1.06, { b: .4, pier: 0, kind: 'point', th: .14, thru: true, cap: false, floor: MR });
  // iki renkli kemer taşları: kilit taşından aşağı kesik kalın çizgi
  const kem = sd => { const p0 = sd < 0 ? .26 : 1.24; return `M${F.P(.75, 1.53)}Q${F.P(p0, 1.3)} ${F.P(p0, .92)}L${F.P(p0, .4)}`; };
  F.put(3.2, 'Ln ' + K.ks(F.c(GUL)), kem(-1) + kem(1), 'stroke-width="3.6" stroke-dasharray="4 4" style="stroke-linecap:butt"');
  F.band(0, .12, M.gri).band(1.63, .15, LC).rect(0, .12, .13, 1.51, MR, 3, .1).rect(1.37, .12, .13, 1.51, MR, 3, .1);
  g.S.band(1.63, .15, LC); bk.S.band(1.63, .15, LC);
  for (const a of [0, 1.37]) F.line([[a, .64], [a + .13, .64]], MR, .8, 3.5, -.14).line([[a, 1.16], [a + .13, 1.16]], MR, .8, 3.5, -.14);
  F.dot(.27, 1.46, 1.5, M.bronz, 7, .2).dot(1.23, 1.46, 1.5, M.bronz, 7, .2);
  const zz = []; for (let i = 0; i <= 12; i++) zz.push([.06 + i * .115, i % 2 ? 1.74 : 1.67]);
  F.line(zz, TQ, 1, 6, .3);
  // nişte asılı kandil, zincirli pirinç tas
  const kp = F.q(.75, 1.2);
  F.line([[.75, 1.46], [.75, 1.24]], M.bronz, .7, 8).dot(.75, 1.2, 2, '#e2b84f>#fff1c2', 8, null).put(9, 'Nl', `<circle cx="${K.f1(kp[0])}" cy="${K.f1(kp[1])}" r="13" fill="url(#${K.glowId()})"/>`, 'raw');
  F.line([[1.44, 1.04], [1.42, .74]], M.bronz, .7, 7).poly([[1.37, .74], [1.47, .74], [1.45, .62], [1.39, .62]], M.altin, 7);

  /* --- kiremit saçak: duvara yaslı, iki ucu kırma --- */
  const s0 = .6, s1 = 2.4, t1 = .6, zl = 2.03, zh = 2.3, dz = zh - zl, hi = .42, th = .07, KR = M.kiremit, len = Math.hypot(t1, dz), P3 = (s, t, z) => K.P(...X(s, t), z);
  const A = new K.Face([...X(s0, t1), zl], R ? [0, -1, 0] : [1, 0, 0], K.unit(R ? [-t1, 0, dz] : [0, -t1, dz]), s1 - s0, len, K.unit(R ? [dz, 0, t1] : [0, dz, t1]), [[0, 0], [s1 - s0, 0], [s1 - s0 - hi, len], [hi, len]]);
  A.fill(KR).tiles();
  const sn = R ? s0 : s1, sf = R ? s1 : s0, sg = R ? 1 : -1, tN = K.toneOf(R ? [0, 1, 0] : [1, 0, 0]);      // yakın uç, uzak uç
  const uc = (se, d, n) => pth(T(KR, K.toneOf(K.unit(n))), `M${P3(se, t1, zl)} ${P3(se, 0, zl)} ${P3(se + d * hi, 0, zh)}Z`);
  b.item(BB(s0, 0, zl - th, s1, t1, zh), () => uc(sf, -sg, R ? [0, -dz, hi] : [-dz, 0, hi]) + A.svg()
    + pth(T(KR, K.toneOf(R ? [1, 0, 0] : [0, 1, 0]) - .2), `M${P3(s0, t1, zl)} ${P3(s1, t1, zl)} ${P3(s1, t1, zl - th)} ${P3(s0, t1, zl - th)}Z`)
    + uc(sn, sg, R ? [0, dz, hi] : [dz, 0, hi]) + pth(T(KR, tN - .06), `M${P3(sn, t1, zl)} ${P3(sn, 0, zl)} ${P3(sn, 0, zl - th)} ${P3(sn, t1, zl - th)}Z`)
    + ln(T(KR, .3), `M${P3(sn, t1, zl)} ${P3(sn + sg * hi, 0, zh)} ${P3(sf - sg * hi, 0, zh)} ${P3(sf, t1, zl)}`, 1.6),
    { pts: [[s0, 0, zl], [s1, 0, zl], [s0, t1, zl], [s1, t1, zl], [s0 + hi, 0, zh], [s1 - hi, 0, zh]].map(v => [...X(v[0], v[1]), v[2]]) });

  /* --- yalak ve lüle --- */
  box(.72, .42, 0, 2.28, 1.02, .07, M.gri, { edge: false });
  const y = box(.85, .42, .07, 2.15, .9, .4, MR, { edge: false });
  y.F.rect(.08, .05, 1.14, .18, MR, 3, -.1).band(.27, .06, MR, .12);
  const p = BB(.91, .47, 0, 2.09, .85, 0);
  b.pool(p[0], p[1], p[3], p[4], .42);
  b.item(BB(1.45, .42, .6, 1.55, .58, .9), ln(M.bronz, 'M' + K.PL([[...X(1.5, .28), .82], [...X(1.5, .52), .82], [...X(1.5, .55), .76]]), 1.8), { cast: false });
  b.fx('fall', ...X(1.5, .55), .76, { w: .1, h: .34 }).fx('glint', ...X(1.15, .72), .44);

  /* --- yaşam: testili kadın, sekide bakır güğüm, saksılar, güvercin --- */
  b.fig(...X(2.38, 1.12), 0, { robe: true, body: '#b5533c', hat: 'ortu', hatCol: M.bez });
  art(2.38, 1.12, 0, pth(M.kiremitA, K.ell(5.4, -18, 2.4, 3) + 'M4.4 -23h2v2.4h-2z'), .9);
  art(2.6, .46, .24, pth(BKR, 'M-3 0Q-4.6 -4 -1.4 -6.4L-1.2 -9h2.4L1.4 -6.4Q4.6 -4 3 0Z') + pth(T(BKR, .4), 'M-2.6 -1Q-3.6 -4 -1.2 -6h1Q-2 -3.6 -1.2 -1Z'));
  saksi(.3, .15, 1.25, M.begonvil); saksi(.5, .84, 0, M.sari);
  b.fx('birds', ...X(2.7, .2), 1.25, { n: 2 });
  b.critter('kedi', ...X(.46, .48), .24);

  b.tag(...X(1.5, 1.55), 0).doorAt(...X(1.5, 1.25));
});
