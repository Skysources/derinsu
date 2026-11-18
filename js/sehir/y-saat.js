/* Saat Kulesi — yukarı şehrin saat kulesi. İnce, kare, kesme taş; 3 × 3 parselin ortasında serbest durur.
   Aşağıdan yukarı: bosajlı kaide (+y'de mavi kapı, +x'te çeşme) · sıvalı gövde (mazgal pencere, güneş saati) ·
   saat katı (iki yüzde kadran) · açık kemerli çan katı · kurşun kubbe ve balıklı yelkovan. */
CK.def('saat', { w: 3, d: 3, name: 'Saat Kulesi' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, C = 1.2;
  const sq = h => [C - h, C - h, C + h, C + h];                       // merkezli kare: [x0,y0,x1,y1]
  const bx = (h, z0, z1, col, o) => { const q = sq(h); return b.box(q[0], q[1], z0, q[2], q[3], z1, col, o); };

  /* --- zemin: teras döşemesi, kule çevresinde halka kakma, çeşme önünde ıslaklık --- */
  b.pave(0, 0, 3, 3, M.parkeK); b.pave(.14, .14, 2.86, 2.86, M.parke);
  const ring = r => { const p = []; for (let i = 0; i < 28; i++) { const a = i / 28 * 6.283; p.push([Math.max(.14, Math.min(2.86, C + Math.cos(a) * r)), Math.max(.14, Math.min(2.86, C + Math.sin(a) * r))]); } return p; };
  b.gpoly(ring(1.6), '#bfae8a'); b.gpoly(ring(1.48), '#e4d9bd');
  let jd = ''; for (let i = 0; i < 13; i++) { const a = (-.42 + i / 12 * 2.42), ca = Math.cos(a), sa = Math.sin(a); jd += `M${K.P(C + ca * 1.05, C + sa * 1.05)} ${K.P(C + ca * 1.48, C + sa * 1.48)}`; }
  b.ground(ln('#cdbf9c', jd, .8));
  b.gpoly([[2.0, .8], [2.6, .75], [2.75, 1.3], [2.5, 1.75], [2.0, 1.6]], '#9c8f78', { op: .4 });
  b.spill(1.2, 2.3, 1.3);

  /* --- kaide: bosajlı kesme taş, koyu su basman --- */
  bx(.76, 0, .16, M.tasK, { edge: false });
  const g = bx(.7, .16, 1.6, M.tas);
  for (const f of [g.L, g.R]) { f.courses({ rh: .24, bw: .5, dens: .95 }).stones(7, { rh: .24 }).shadeTop(.14); f.band(0, .2, M.tasK, .04); }
  g.L.door(.42, .56, .94, { kind: 'arch', col: M.mavi, sove: M.mermer, fan: true });
  g.L.lantern(1.14, 1.0);
  g.L.vine({ kind: 'boug', a0: 0, a1: .34, drop: [.5, 1.3], stem: .06 });
  b.stairs(.86, 1.96, 1.54, 2.22, .16, 0, 'y', M.mermer);

  /* --- çeşme: gölge yüzde kemerli niş, pirinç lüle, mermer tekne --- */
  g.R.shp('arch', .36, .2, .68, .96, M.mermer, 3, .1).shp('arch', .43, .2, .54, .86, '#5f7f8a', 4, -.1);
  g.R.rect(.43, .2, .54, .4, M.mermer, 4.5, 0).dot(.7, .82, 1.6, M.altin, 6, .3).line([[.7, .66], [.7, .66, .1]], M.bronz, 1.6, 6.2, .2);
  const tk = b.box(1.96, .86, 0, 2.34, 1.54, .46, M.mermer, { edge: false });
  b.pool(2.01, .91, 2.29, 1.49, .44);
  b.fx('fall', 2.03, 1.2, .74, { w: .06, h: .28 });

  /* --- silme + gövde: kireç sıva, köşelerde taş zıvana --- */
  bx(.78, 1.6, 1.72, M.mermer, { edge: false });
  const s = bx(.56, 1.72, 3.58, M.kirec);
  for (const f of [s.L, s.R]) { for (let i = 0, z = 0; z < 1.8; z += .235, i++) { const w = i % 2 ? .2 : .32; f.rect(0, z, w, .2, M.tas, 2.4, .02).rect(1.12 - (i % 2 ? .32 : .2), z, i % 2 ? .32 : .2, .2, M.tas, 2.4, .02); } f.shadeTop(.2); }
  s.L.patches(1, { a0: .35, a1: .9, b0: .1, b1: .5 });
  s.L.win(.46, .56, .2, .62, { kind: 'arch', sove: M.tas, frame: M.demir, bars: [1, 3], lit: true });
  s.R.win(.44, 1.0, .2, .56, { kind: 'arch', sove: M.tas, frame: M.demir, bars: [1, 3], lit: false });

  /* --- saat katı: taş, iki yüzde kadran --- */
  bx(.62, 3.58, 3.7, M.tasK, { edge: false });
  const k = bx(.68, 3.7, 4.72, M.tas);
  const dial = f => { const ca = .68, cb = .52, r = .43, Q = (t, q) => f.P(ca + Math.sin(t) * r * q, cb + Math.cos(t) * r * q);
    f.courses({ rh: .26, dens: .7 }).shadeTop(.1);
    f.shp('round', ca - r - .06, cb - r - .06, 2 * r + .12, 2 * r + .12, M.mermer, 3, .06).shp('round', ca - r, cb - r, 2 * r, 2 * r, M.bronz, 4);
    f.shp('round', ca - r + .06, cb - r + .06, 2 * r - .12, 2 * r - .12, '#5a4424', 4.5, -.2).shp('round', ca - r + .075, cb - r + .05, 2 * r - .13, 2 * r - .13, '#f6edd6>#ffe9b8', 5, .1);
    let d1 = '', d2 = ''; for (let i = 0; i < 12; i++) { const t = i * Math.PI / 6; if (i % 3) d2 += `M${Q(t, .7)} ${Q(t, .8)}`; else d1 += `M${Q(t, .62)} ${Q(t, .8)}`; }
    f.put(6, 'Ln ' + K.ks('#3a3230>#4a3a2a'), d1, 'stroke-width="1.5"').put(6, 'Ln ' + K.ks('#3a3230>#4a3a2a'), d2, 'stroke-width=".9"');
    f.put(6.5, 'Ln ' + K.ks('#2a2624>#3a2c20'), `M${Q(0, 0)} ${Q(2.7, .42)}`, 'stroke-width="2"').put(6.5, 'Ln ' + K.ks('#2a2624>#3a2c20'), `M${Q(4.2, .12)} ${Q(1.05, .7)}`, 'stroke-width="1.2"');
    f.dot(ca, cb, 1.5, M.altin, 7, .2); };
  dial(k.L); dial(k.R);

  /* --- çan katı: dört yanı açık kemer; arka duvarların iç yüzleri önce çizilir --- */
  bx(.8, 4.72, 4.84, M.mermer, { edge: false });
  const z0 = 4.84, z1 = 5.62, h = .56, th = .15, q = sq(h), ar = { pier: .2, th, thru: true, floor: M.tasK };
  const iA = new K.Face([q[0] + th, q[1] + th, z0], [1, 0, 0], [0, 0, 1], 2 * h - 2 * th, z1 - z0, [0, 1, 0]); iA.fill(M.tas, -.26); iA.mc = M.tas; iA.arcade(-.0, 2 * h - 2 * th, 1, .62, Object.assign({}, ar, { pier: .05 }));
  const iB = new K.Face([q[0] + th, q[3] - th, z0], [0, -1, 0], [0, 0, 1], 2 * h - 2 * th, z1 - z0, [1, 0, 0]); iB.fill(M.tas, -.2); iB.mc = M.tas; iB.arcade(-.0, 2 * h - 2 * th, 1, .62, Object.assign({}, ar, { pier: .05 }));
  b.item([q[0], q[1], z0, q[2], q[3], z1], () => iA.svg() + iB.svg(), { cast: false });
  const c = b.box(q[0], q[1], z0, q[2], q[3], z1, M.tas, { T: null });
  c.L.arcade(0, 2 * h, 1, .62, ar); c.R.arcade(0, 2 * h, 1, .62, ar);
  b.fx('bell', C, q[3] - th / 2, z0 + .56, { s: 1 }).fx('bell', q[2] - th / 2, C, z0 + .56, { s: 1 });

  /* --- saçak silmesi, köşe topuzları, kurşun kubbe, balıklı yelkovan --- */
  bx(.66, z1, z1 + .09, M.mermer, { edge: false });
  const top = pth(T(M.tas, -.2), 'M-2 0h4v-2.6h-4z') + pth(T(M.tas, -.1), K.circ(0, -4.6, 2.5)) + pth(T(M.tas, .3), K.circ(-.7, -5.3, 1.2));
  for (const [x, y] of [[C - .6, C - .6], [C - .6, C + .6], [C + .6, C - .6], [C + .6, C + .6]]) b.art(x, y, z1 + .09, top, { bb: [x - .06, y - .06, z1 + .09, x + .06, y + .06, z1 + .4] });
  b.cyl(C, C, .56, z1 + .09, z1 + .18, M.tasK, { top: null });
  b.dome(C, C, .54, z1 + .18, M.kursun, { hf: .95, alem: false });
  const zt = z1 + .18 + .54 * .95 * 1.14;
  b.art(C, C, zt, ln(M.demir, 'M0 2V-19', 1.2) + pth(M.altin, K.circ(0, -3, 2.4) + K.circ(0, -7.4, 1.5)) + pth(M.bronz, 'M-8 -14q4.4 -3.6 9 0l3 -2.6v5.2l-3 -2.6q-4.6 3.6 -9 0z') + pth(M.altin, 'M-1 -19l1 -3l1 3z'), { bb: [C - .1, C - .1, zt, C + .1, C + .1, zt + .8] });
  b.fx('glint', C, C, zt + .1);

  /* --- meydan: bank, saksılar, fener, güvercinler, çeşmede su dolduran --- */
  b.bench(.6, 2.62, 0, 'x', { l: .9 });
  b.pot(.62, 2.12, 0, { plant: true, fl: M.begonvil, s: 1.2 }).pot(1.76, 2.12, 0, { plant: M.narenciye, s: 1 });
  b.lamp(.3, 2.3);
  b.fig(2.3, .58, 0, { body: M.bezY, robe: true, hat: 'ortu', hatCol: M.bez, carry: 'kova' });
  b.fig(1.05, 2.72, 0, { body: '#7a6a8a', legs: '#4a3a34', hat: 'fes' });
  b.fx('birds', 1.7, 2.6, 0, { n: 4 });
  b.critter('guvercin', C + .7, C + .3, 1.72).critter('guvercin', C - .2, C + .74, 4.84, { flip: true });
  b.critter('kedi', 2.5, 2.2, 0);

  b.tag(1.5, 2.95, 0).doorAt(1.2, 2.4);
});
