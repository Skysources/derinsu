/* Taş Köprü — değirmen arkının üstünde alçak kambur yaya köprüsü.
   opt.dir 'x': x boyunca geçilir, ark y boyunca ortadan akar · 'y': tersi.
   Üstünden yüründüğü için döşeme, uzak korkuluk ve kemer altı ZEMİN katmanındadır; yalnız yakın korkuluk (ve ucundaki
   babalar, fener, saksı, oltacı çocuk) yapı katmanındadır: yürüyenler onun arkasından geçer.
   Suyu şehir çizer; opt.su (yalnız önizleme) arkı da çizer. */
CK.def('kopru', { w: 2.6, d: 1.8, name: 'Taş Köprü' }, (b, K, opt) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, dx = opt.dir !== 'y', L = dx ? b.w : b.d, D = dx ? b.d : b.w;
  // (a, t, z): a geçiş yönünde (ekranda soldan sağa), t ark yönünde (büyük t = bize yakın korkuluk)
  const W = (a, t, z = 0) => dx ? [a, t, z] : [t, L - a, z], BB = (a0, t0, z0, a1, t1, z1) => dx ? [a0, t0, z0, a1, t1, z1] : [t0, L - a1, z0, t1, L - a0, z1];
  const ua = dx ? [1, 0, 0] : [0, -1, 0], ut = dx ? [0, 1, 0] : [1, 0, 0], UP = [0, 0, 1];
  const vf = (t, shape) => new K.Face(W(0, t, 0), ua, UP, L, 1, ut, shape), plan = () => new K.Face(W(0, 0, 0), ua, ut, L, D, UP);
  const c = L / 2, H = .22, hp = .3, pw = .16, tF = .2, tN = D - .2, e0 = .04, p0 = .26, p1 = L - .26, bw = -.1, rx = .3, ry = H - .1 - bw;
  const zd = a => H * Math.max(0, 1 - ((a - c) / (c - e0)) ** 2);                    // döşeme kamburu
  const smp = (a0, a1, n) => Array.from({ length: n + 1 }, (_, i) => a0 + (a1 - a0) * i / n), as = smp(p0, p1, 8), r = b.r;
  const TAS = M.tas, DOS = '#c9b791';

  /* ================= ZEMİN: döşeme, uzak korkuluk, kemer altı ================= */
  const G0 = plan(), G = new K.Builder({ seed: 3 });
  if (opt.su) G0.poly([[c - .48, 0, 0], [c + .48, 0, 0], [c + .48, D, 0], [c - .48, D, 0]], T(TAS, .16), 0, null).poly([[c - .3, 0, bw], [c + .3, 0, bw], [c + .3, D, bw], [c - .3, D, bw]], M.su, .5, null);
  // döşeme: eğime göre tonlanan dilimler
  const ds = smp(e0, L - e0, 8);
  for (let i = 0; i < 8; i++) { const a0 = ds[i], a1 = ds[i + 1], z0 = zd(a0), z1 = zd(a1), n = K.unit([-ua[0] * (z1 - z0) / (a1 - a0), -ua[1] * (z1 - z0) / (a1 - a0), 1]);
    G0.poly([[a0, tF, z0], [a1, tF, z1], [a1, tN, z1], [a0, tN, z0]], DOS, 1, (K.toneOf(n) - G0.t) * 1.6); }
  // derzler: enine sıralar + şaşırtmalı boyuna derzler; aşınmış ve koyu taşlar
  { const js = smp(e0, L - e0, 11), t0 = tF + pw, t1 = tN - pw - .3;
    for (let i = 1; i < 11; i++) G0.line([[js[i], t0, zd(js[i])], [js[i], t1 + .3, zd(js[i])]], DOS, .8, 2, -.2);
    for (let i = 0; i < 11; i++) { const a0 = js[i], a1 = js[i + 1], q = (t, w, col, dt) => G0.poly([[a0, t, zd(a0)], [a1, t, zd(a1)], [a1, t + w, zd(a1)], [a0, t + w, zd(a0)]], col, 1.5, dt);
      for (let t = t0 + .14 + (i % 2) * .16 + r() * .08; t < t1 + .1; t += .3 + r() * .1) G0.line([[a0, t, zd(a0)], [a1, t, zd(a1)]], DOS, .8, 2, -.2);
      if (i % 2 === 0) q(t0 + .2 + r() * .3, .26, DOS, .14); else if (r() < .5) q(t0 + r() * .5, .2, DOS, -.1); }
    G0.line(as.map(a => [a, t0 + .015, zd(a)]), DOS, 1.4, 2.2, -.34); }                                           // korkuluk dibi gölgesi
  // uzak korkuluk: iç yüzü (bize bakan) ve üstü
  { const F = vf(tF + pw), Tp = plan();
    F.poly(as.map(a => [a, zd(a)]).concat(as.slice().reverse().map(a => [a, zd(a) + hp])), TAS, 3);
    F.line(as.map(a => [a, zd(a) + hp * .5]), TAS, .8, 4, -.14);
    for (let i = 0; i < 9; i++) { const a = p0 + .12 + i * .25; F.line([[a, zd(a) + (i % 2 ? 0 : hp * .5)], [a, zd(a) + (i % 2 ? hp * .5 : hp)]], TAS, .8, 4, -.14); }
    Tp.poly(as.map(a => [a, tF + pw, zd(a) + hp]).concat(as.slice().reverse().map(a => [a, tF, zd(a) + hp])), TAS, 3, .12);
    G.item(BB(p0, tF, 0, p1, tF + pw, H + hp), () => F.svg() + Tp.svg(), { cast: false }); }
  // baba: taş dikme + piramit başlık (tek parça)
  const post = (B, a, t, h = .46) => { const s = .22, x = W(a, t), q = BB(a, t, 0, a + s, t + s, h), m = [(q[0] + q[3]) / 2, (q[1] + q[4]) / 2, h + .12], P = K.PL;
    B.item(q, pth(T(TAS, K.toneOf([0, 1, 0])), 'M' + P([[q[0], q[4], 0], [q[3], q[4], 0], [q[3], q[4], h], [q[0], q[4], h]]) + 'Z') + pth(T(TAS, K.toneOf([1, 0, 0])), 'M' + P([[q[3], q[4], 0], [q[3], q[1], 0], [q[3], q[1], h], [q[3], q[4], h]]) + 'Z')
      + pth(T(M.mermer, .1), 'M' + P([[q[0] - .02, q[4] + .02, h], [q[3] + .02, q[4] + .02, h], m]) + 'Z') + pth(T(M.mermer, -.24), 'M' + P([[q[3] + .02, q[4] + .02, h], [q[3] + .02, q[1] - .02, h], m]) + 'Z'), { cast: false });
    b.item(q, '', {}); };                                                                                           // gölgesi ana kurucudan
  post(G, e0, tF - .03); post(G, p1, tF - .03);
  // kemer gözü: köprü altındaki gölgeli su
  const NF = vf(tN, [[p0, 0], [p1, 0]].concat(as.slice().reverse().map(a => [a, zd(a) + hp]))), k = .5523;
  const goz = `M${NF.P(c - rx, bw)}C${NF.P(c - rx, bw + ry * k)} ${NF.P(c - rx * k, bw + ry)} ${NF.P(c, bw + ry)}C${NF.P(c + rx * k, bw + ry)} ${NF.P(c + rx, bw + ry * k)} ${NF.P(c + rx, bw)}Z`;
  b.ground(G0.svg() + G.out().body + pth(T(M.suK, -.36), goz));

  /* ================= YAPI: yakın korkuluk ve kemer ================= */
  NF.fill(TAS); NF.holes = goz;
  NF.courses({ rh: .12, bw: .3, dens: .6, a0: p0, a1: c - .44 }).courses({ rh: .12, bw: .3, dens: .6, a0: c + .44, a1: p1 }).courses({ rh: .12, bw: .3, dens: .6, a0: c - .44, a1: c + .44, b0: .24 });
  NF.line(as.map(a => [a, zd(a) + .01]), TAS, 1.3, 3, .16);                                                        // döşeme hizasında silme
  // kemer taşları: iki renk almaşık, kilit taşı uzun
  { const th0 = Math.asin(-bw / ry), n = 7, sg = dx ? -1 : 1;
    for (let i = 0; i < n; i++) { const q0 = th0 + (Math.PI - 2 * th0) * i / n, q1 = th0 + (Math.PI - 2 * th0) * (i + 1) / n, o = i === 3 ? .15 : .1, pt = (q, e) => [c + Math.cos(q) * (rx + e), bw + Math.sin(q) * (ry + e)];
      NF.poly([pt(q0, 0), pt(q1, 0), pt(q1, o), pt(q0, o)], i % 2 ? '#f0e6d0' : '#cf9a78', 4, 0); }
    NF.dot(c, bw + ry + .085, 1, M.mavi, 4.5);
    // görünen kemer içi (yan duvar) ve su çizgisi
    const j = [0, .37, .74, 1.1, 1.47].map(q => [c + sg * rx * Math.cos(q), bw + ry * Math.sin(q)]);
    NF.poly(j, TAS, 5, dx ? -.42 : -.2).line([j[0], j[4]], M.suA, .8, 5.5, null); }
  { const Tp = plan(); Tp.poly(as.map(a => [a, tN, zd(a) + hp]).concat(as.slice().reverse().map(a => [a, tN - pw, zd(a) + hp])), TAS, 3, .12);
    b.item(BB(p0, tN - pw, 0, p1, tN, H + hp), () => NF.svg() + Tp.svg(), { pts: [W(p0, tN, 0), W(p1, tN, 0), W(p0, tN, hp), W(p1, tN, hp), W(c, tN, H + hp)] }); }
  post(b, e0, tN - pw - .03); post(b, p1, tN - pw - .03);

  b.fx('glint', ...W(c + .05, tN + .34, bw));
  b.tag(...W(c, D, 0));
});
