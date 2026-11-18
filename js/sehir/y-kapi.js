/* Şehir Kapısı — sur içinden görünüş: iç cephe +y (aydınlık). Parsel 8 × 3.4; sur y 1.2–2.2 boyunca uzanır.
   Solda kare gözcü kulesi (kiremit külahlı köşk), ortada sivri kemerli kapı gövdesi, sağda yuvarlak burç ve sur yoluna çıkan ahşap merdiven.
   Geçit 1 birim derin: kemerin sağ üstünden sur dışı görünür (gerçek delik), geri kalanı elle çizilmiş söve, kemer karnı ve zemindir. */
CK.def('kapi', { w: 8, d: 3.4, name: 'Şehir Kapısı' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, PL = K.PL, P = K.P, tO = K.toneOf;
  const TAS = M.tas, KOY = M.tasK, AK = M.mermer, GUL = '#c98f78', YOL = '#c9b184';
  const TL = tO([0, 1, 0]), TR = tO([1, 0, 0]), TT = tO([0, 0, 1]);

  /* ---------- yardımcılar ---------- */
  // konsol dizisi (seğirdim): ax 'y' → duvar y=w düzleminde, s = x; ax 'x' → duvar x=w düzleminde, s = y
  const corb = (ax, s0, s1, w, out, z0, z1, n, col) => {
    const pt = (s, e, z) => ax === 'y' ? [s, w + e, z] : [w + e, s, z], st = (s1 - s0) / n, zm = z1 - (z1 - z0) * .5; let fr = '', sd = '';
    for (let i = 0; i < n; i++) { const a = s0 + st * (i + .22), c = a + st * .56;
      fr += 'M' + PL([pt(a, out, zm), pt(c, out, zm), pt(c, out, z1), pt(a, out, z1)]) + 'Z';
      sd += 'M' + PL([pt(c, 0, z0), pt(c, out, zm), pt(c, out, z1), pt(c, 0, z1)]) + 'Z'; }
    b.item(ax === 'y' ? [s0, w, z0, s1, w + out, z1] : [w, s0, z0, w + out, s1, z1], pth(T(col, (ax === 'y' ? TR : TL) - .06), sd) + pth(T(col, (ax === 'y' ? TL : TR) + .06), fr), { cast: false });
  };
  // mazgal deliği (ok yarığı)
  const slit = (f, a, bb, h = .56) => f.rect(a - .075, bb - .05, .15, h + .1, AK, 3, -.04).rect(a - .028, bb, .056, h, M.ic, 5).rect(a - .07, bb + h * .58, .14, .05, M.ic, 5);
  // taş duvar dokusu
  const stone = (f, n, o = {}) => f.courses(Object.assign({ rh: .32, bw: .8, dens: .46 }, o)).stones(n, o);
  // nöbetçi: kırmızı cübbe, miğfer, mızrak
  const guard = (x, y, z, o = {}) => {
    const g = K.figure({ body: '#a8473a', legs: '#5a606c', hat: 'none', step: o.step || 0 })
      + pth('#8f9ba6', 'M-3.5 -19.3Q-3.5 -23 0 -23.3Q3.5 -23 3.5 -19.3Q0 -20.7 -3.5 -19.3Z') + pth('#dfe6ea', 'M-2.7 -20.5Q-2.3 -22.4 -.5 -22.8Q-1.7 -21.6 -1.7 -20.2Z') + pth('#8f9ba6', 'M-.5 -24.6h1v1.6h-1z')
      + pth(M.altin, 'M0 -14.8l1.7 2.1l-1.7 2.1l-1.7 -2.1z')
      + (o.shield ? pth(T(M.lacivert, -.1), K.circ(-4.8, -10.6, 3.3)) + pth(M.lacivert, K.circ(-5, -10.9, 2.7)) + pth(M.altin, K.circ(-5, -10.9, 1)) : '')
      + ln(M.ahsapK, 'M5.8 .6V-30', 1.1) + pth('#dfe6ea', 'M5.8 -35l1.6 5h-3.2z');
    b.art(x, y, z, o.flip ? `<g transform="scale(-1 1)">${g}</g>` : g, { bb: [x - .14, y - .14, z, x + .14, y + .14, z + 1.2] });
  };

  /* ---------- zemin ---------- */
  b.gpoly([[.5, -.3], [6.4, -.3], [7.8, 1.2], [.5, 1.2]], M.cim);                                                             // sur dışı çayır: yalnız kemerin içinden görünen kısım (gerisi surun arkasında kalır)
  b.gpoly([[3.15, -.3], [4.85, -.3], [4.85, 2.3], [5.3, 3.7], [2.7, 3.7], [3.15, 2.3]], YOL);                                // kapıdan geçen yol
  b.gpoly([[2.62, 2.2], [5.38, 2.2], [5.5, 2.78], [2.5, 2.78]], T(M.parkeK, -.06));                                          // kapı önü taş döşeme
  b.gpoly([[3.12, 2.2], [4.88, 2.2], [4.96, 2.5], [3.04, 2.5]], T(M.gri, .26));                                              // eşik taşı
  b.ground(ln(T(YOL, -.16), `M${P(3.66, 3.7)}L${P(3.66, 2.5)}M${P(4.34, 3.7)}L${P(4.34, 2.5)}M${P(3.66, 1.2)}L${P(3.66, -.3)}M${P(4.34, 1.2)}L${P(4.34, -.3)}`, 1.1, 'stroke-dasharray="7 5"'));
  b.gpoly([[-.3, 2.2], [.8, 2.2], [.8, 2.75], [.62, 3.12], [-.3, 3.2]], M.cim).gpoly([[7.3, 2.2], [8.3, 2.2], [8.3, 3.3], [7.75, 3.36], [7.3, 2.9]], M.cim);   // sur dibinde ot
  b.tufts(-.2, 2.3, .7, 3.1, 3).tufts(7.4, 2.3, 8.2, 3.25, 4);
  b.flowers(.42, 2.92, { n: 5, r: .3 }).flowers(7.95, 3.12, { n: 5, r: .26, cols: [M.bez, M.sari, M.mor] });
  b.spill(3.0, 2.75, 1.5).spill(5.05, 2.75, 1.5);

  /* ---------- sol sur parçası ---------- */
  b.box(0, 1.2, 0, .8, 2.2, 2.4, TAS, { edge: false });

  /* ---------- sol kule: kare gövde, seğirdim, mazgallı taç, kiremit külahlı gözcü köşkü ---------- */
  const kl = b.box(.8, .95, 0, 2.6, 2.75, 4.0, TAS);
  stone(kl.L, 7); stone(kl.R, 2, { a0: 0, a1: .55, b0: 0, b1: 2.9 }); stone(kl.R, 3, { b0: 2.95, b1: 3.7 });
  for (const f of [kl.L, kl.R]) f.band(0, .36, KOY, .04).band(2.4, .08, AK, -.02, 3).band(3.72, .28, TAS, -.3).shadeTop(.5, -.08);
  kl.L.door(1.02, .56, .98, { kind: 'arch', col: M.mavi, sove: AK });
  kl.L.lantern(1.7, 1.02);
  kl.L.win(.72, 2.72, .4, .58, { kind: 'arch', sove: AK, shut: M.mavi, lit: true, bars: [2, 2] });
  slit(kl.L, 1.42, 1.62); slit(kl.L, .4, 3.0, .46);
  // sarmaşık: iki kollu gövde boyunca iri yaprak öbekleri (hazır sarmaşıktan hafif)
  { const f = kl.L, r = K.rng(31), B = ['', '', '']; f.put(7.5, 'Ln ' + K.ks(M.govde), `M${f.P(.2, 0)}Q${f.P(.34, .7)} ${f.P(.2, 1.3)}T${f.P(.26, 2.2)}M${f.P(.24, .95)}Q${f.P(.42, 1.15)} ${f.P(.5, 1.75)}`, 'stroke-width="1.4"');
    const leaf = (a, bb, k) => { const q = f.q(a + (r() - .5) * .14, bb, .04), rad = (2.9 + r() * 2.3) * k; B[0] += K.circ(q[0], q[1], rad); if (r() < .66) B[1] += K.circ(q[0] - 1.1, q[1] - 1.3, rad * .62); if (r() < .3) B[2] += K.circ(q[0] - 1.6, q[1] - 1.8, rad * .34); };
    for (let bb = .3; bb < 2.34; bb += .16) leaf(.22 + Math.sin(bb * 3) * .06, bb, bb > 2.1 ? .8 : 1); for (let bb = 1.1; bb < 1.9; bb += .17) leaf(.3 + (bb - 1) * .3, bb, .9);
    [T(M.sarmasik, -.22), M.sarmasik, T(M.sarmasik, .3)].forEach((c, i) => f.put(8 + i * .1, K.kf(c), B[i])); }
  // yan yüz: kapı gövdesinin üstündeki terasa açılan kapı, mazgal, ilan levhası
  kl.R.door(.78, .5, .78, { kind: 'arch', b: 3.2, col: M.ahsapK, sove: AK });
  slit(kl.R, .28, 1.55, .5); slit(kl.R, 1.56, 3.26, .4);
  kl.R.sign(.1, .7, .36, .46, '#efe6cf').line([[.17, 1.04], [.39, 1.04]], '#6a5a4a', .7, 7.3, null).line([[.17, .96], [.39, .96]], '#6a5a4a', .7, 7.3, null).line([[.17, .88], [.33, .88]], '#6a5a4a', .7, 7.3, null).dot(.37, .8, 1.3, M.kirmizi, 7.4, null);
  corb('y', .8, 2.6, 2.75, .15, 3.72, 4.0, 5, TAS); corb('x', .95, 2.75, 2.6, .15, 3.72, 4.0, 5, TAS);
  const kt = b.box(.65, .8, 4.0, 2.75, 2.9, 4.3, TAS, { edge: false, T: T(TAS, -.1) });
  kt.L.band(.13, .04, AK, -.04, 3); kt.R.band(.13, .04, AK, -.04, 3);
  b.merlons(.65, .8, 2.6, .95, 4.3, TAS).merlons(.65, .95, .8, 2.75, 4.3, TAS);
  const ks = b.box(.98, 1.13, 4.3, 2.42, 2.57, 5.45, M.ic, { edge: false, cast: false });                                        // köşk: karanlık iç + ahşap dikmeler
  for (const f of [ks.L, ks.R]) { f.rect(0, 0, f.w, .5, M.ahsap, 3); f.timber({ col: M.ahsap, posts: [.05, f.w / 2, f.w - .05], rails: [.52, f.h - .05], wid: 2.6 }); }
  b.merlons(2.6, .8, 2.75, 2.75, 4.3, TAS).merlons(.65, 2.75, 2.75, 2.9, 4.3, TAS);
  b.hip(.58, .73, 2.82, 2.97, 5.45, .76, M.kiremit);
  b.line3([[1.7, 1.85, 6.19], [1.7, 1.85, 6.92]], M.ahsapK, 1.5);
  b.art(1.7, 1.85, 6.92, pth(M.altin, K.circ(0, 0, 1.7)), { r: .05, h: .1 });
  b.fx('flag', 1.7, 1.85, 6.84, { col: M.bezK, s: 1.35, emblem: M.altin });
  b.fx('bell', 2.06, 2.6, 5.12, { s: 1 });

  /* ---------- kapı gövdesi ---------- */
  b.merlons(2.6, 1.05, 5.4, 1.2, 3.2, TAS);                                                                                   // dış yüz mazgalları (arkada)
  const kg = b.box(2.6, 1.2, 0, 5.4, 2.2, 2.95, TAS), L = kg.L;
  // sivri kemer: iki merkezli; a0..a1 açıklık, hs üzengi, D geçit derinliği
  const D = 1, a0 = .55, a1 = 2.25, am = 1.4, hs = .85, R = 1.15, cL = a0 + R, cR = a1 - R, kx = D, kz = D * .8165;
  const top = a => hs + Math.sqrt(Math.max(0, R * R - (a <= am ? cL - a : a - cR) ** 2));
  const arcL = (rad, n, f0 = 0) => { const fi = Math.acos((am - cL) / rad) + f0, o = []; for (let i = 0; i <= n; i++) { const th = Math.PI - (Math.PI - fi) * i / n; o.push([cL + Math.cos(th) * rad, hs + Math.sin(th) * rad]); } return o; };
  const mir = p => [2 * am - p[0], p[1]], inL = arcL(R, 9), inR = inL.map(mir);
  const xa = a0 + kx;                                                                                                          // geçidin arka söve çizgisinin ön yüzdeki izdüşümü
  const rArc = []; for (let a = a1; a > xa + .04; a -= .1) rArc.push([a, top(a)]);
  // gerçek delik: yalnız sur dışının göründüğü dilim
  L.holes += 'M' + [[xa, kz], [a1, kz], ...rArc, [xa + .025, top(xa + .025)], [xa + .008, hs + kz + .1], [xa, hs + kz]].map(p => L.P(p[0], p[1])).join(' ') + 'Z';
  // zemin (güneş içeri vurur), söve gölgesi, teker izleri
  L.poly([[a0, 0], [a1, 0], [a1, kz], [xa, kz]], YOL + '>#806a52', 4, null);
  L.poly([[a0, 0, 0], [a0 + .36, 0, -.56], [a0 + .62, 0, -D], [a0, 0, -D]], T(YOL, -.34), 4.2, null);
  L.line([[am - .34, 0, 0], [am - .34, 0, -D]], YOL, 1.1, 4.4, -.16).line([[am + .34, 0, 0], [am + .34, 0, -.5]], YOL, 1.1, 4.4, -.16);
  // söve (gölgede) ve kemer karnı
  L.poly([[a0, 0], [a0, hs], [xa, hs + kz], [xa, kz]], TAS, 5, -.44).poly([[a0, 0], [a0, .34], [xa, .34 + kz], [xa, kz]], TAS, 5.1, -.34);
  L.poly([[a0, hs], ...inL.slice(1), ...inR.slice().reverse().filter(p => p[0] > am && p[0] < xa + .02), [xa + .025, top(xa + .025)], [xa + .008, hs + kz + .1], [xa, hs + kz]], TAS, 5, -.56);
  { let d = ''; for (const bb of [.34, .62]) d += L.seg(a0, bb, xa, bb + kz); for (let i = 1; i < inL.length; i += 2) { const p = inL[i], t = Math.min(1, xa - p[0]); if (t > .08) d += `M${L.P(p[0], p[1])} ${L.P(p[0] + t * kx, p[1] + t * kz)}`; }
    L.put(5.4, 'Ln ' + K.ks(T(TAS, -.66)), d, 'stroke-width=".8"'); }
  // kalkık demir parmaklık: yalnız alt sivrileri görünür
  { const e = -.2, zt = 1.12, zs = 1.3; let bars = '', sp = ''; let aMin = 9, aMax = 0;
    for (let a = a0 + .2; a < a1 - .25; a += .2) { const bt = Math.min(top(a), top(a + .2) - .164) - .02; if (bt < zs + .06) continue; aMin = Math.min(aMin, a); aMax = Math.max(aMax, a);
      bars += `M${L.P(a, zs, e)} ${L.P(a, bt, e)}`; sp += `M${L.P(a - .05, zs, e)} ${L.P(a + .05, zs, e)} ${L.P(a, zt, e)}Z`; }
    L.put(6.5, 'Ln ' + K.ks('#3a3230'), bars + `M${L.P(aMin - .06, zs + .1, e)} ${L.P(aMax + .06, zs + .1, e)}`, 'stroke-width="2"').put(6.6, K.kf('#59616c'), sp); }
  // kemer taşları: iki renk almaşık, kilit taşı, üzengi ve söve köşe taşları
  { const o = arcL(R + .24, 6, .1), i = arcL(R, 6, .1);
    for (let k = 0; k < 6; k++) for (const s of [0, 1]) { const q = [i[k], i[k + 1], o[k + 1], o[k]].map(p => s ? mir(p) : p); L.poly(q, (k + s) % 2 ? GUL : AK, 3.2, (k + s) % 2 ? .02 : -.02); }
    L.poly([i[6], [am, top(am)], mir(i[6]), mir(o[6]), [am + .12, top(am) + .36], [am - .12, top(am) + .36], o[6]], AK, 3.3, .06);
    for (const s of [0, 1]) { const q = p => s ? mir(p) : p; for (let k = 0; k < 3; k++) { const w = k % 2 ? .16 : .26; L.poly([[a0 - w, k * .27], [a0, k * .27], [a0, k * .27 + .27], [a0 - w, k * .27 + .27]].map(q), k % 2 ? GUL : AK, 3.2, 0); }
      L.poly([[a0 - .3, hs - .06], [a0, hs - .06], [a0, hs + .05], [a0 - .3, hs + .05]].map(q), AK, 3.4, .1); }
    L.put(3.5, 'Ln ' + K.ks(T(TAS, -.3)), 'M' + [[a0, 0], ...inL, ...inR.slice(0, -1).reverse(), [a1, 0]].map(p => L.P(p[0], p[1])).join(' '), 'stroke-width=".9"'); }
  // duvar dokusu: yalnız ayaklarda ve kemer üstünde (delik üstüne taşmasın)
  stone(L, 2, { a0: 0, a1: .3, b0: 0, b1: 2.2 }); stone(L, 2, { a0: 2.5, a1: 2.8, b0: 0, b1: 2.2 }); stone(L, 5, { b0: 2.22, b1: 2.7 });
  L.band(2.68, .27, TAS, -.3);
  // arma: mermer kalkan, lacivert zemin, altın çapa; iki yanında dalga kabartmalı madalyon
  { const s = [[am - .27, 2.66], [am + .27, 2.66], [am + .27, 2.42], [am + .17, 2.24], [am, 2.12], [am - .17, 2.24], [am - .27, 2.42]], c = [am, 2.42];
    L.poly(s.map(p => [p[0], p[1] - .03]), TAS, 6.9, -.3).poly(s, AK, 7, .1).poly(s.map(p => [c[0] + (p[0] - c[0]) * .78, c[1] + (p[1] - c[1]) * .8]), M.lacivert, 7.1, 0);
    L.line([[am, 2.6], [am, 2.26]], M.altin, 1.3, 7.2, null).line([[am - .09, 2.53], [am + .09, 2.53]], M.altin, 1.2, 7.2, null).line([[am - .14, 2.4], [am - .1, 2.29], [am, 2.25], [am + .1, 2.29], [am + .14, 2.4]], M.altin, 1.2, 7.2, null).dot(am, 2.61, 1.3, M.altin, 7.3, null);
    for (const s2 of [-1, 1]) { const x = am + s2 * .62; L.shp('round', x - .15, 2.3, .3, .3, AK, 7, .08).dot(x, 2.45, 3.1, M.turkuaz, 7.1, -.05).line([[x - .09, 2.44], [x - .045, 2.48], [x, 2.44], [x + .045, 2.4], [x + .09, 2.44]], AK, 1, 7.2, .2); } }
  // meşale kolları ve sancak çubukları
  for (const a of [.28, 2.52]) { L.line([[a, .84, 0], [a, .96, .17]], M.demir, 1.4, 7).poly([[a - .07, 1.04, .17], [a + .07, 1.04, .17], [a + .04, .93, .17], [a - .04, .93, .17]], M.demir, 7.1, .1);
    L.line([[a - .22, 2.66, .05], [a + .22, 2.66, .05]], M.bronz, 1.6, 7.4, .1);
    b.fx('fire', 2.6 + a, 2.37, 1.06, { s: .62 }).fx('banner', 2.6 + a - .18, 2.25, 2.65, { col: M.bezK, w: .36, h: 1.12, axis: 'x' }); }
  // seğirdim + taşkın korkuluk + mazgallar; terasta gezinen nöbetçi
  corb('y', 2.6, 5.4, 2.2, .22, 2.68, 2.95, 8, TAS);
  const kc = b.box(2.6, 1.05, 2.95, 5.4, 2.42, 3.2, TAS, { edge: false, T: T(TAS, -.1) });
  kc.L.band(.1, .04, AK, -.04, 3); kc.T.planks({ dir: 'v', step: .56, dt: -.08, b0: .15, b1: 1.22 });
  guard(4.72, 2.08, 3.2, { step: 1, flip: true });
  b.merlons(2.6, 2.27, 5.4, 2.42, 3.2, TAS, { h: .32, w: .34, gap: .27 });

  /* ---------- sağ burç: yuvarlak, çıkıntılı taç, tepesinde gözcü ve bayrak ---------- */
  const yb = b.cyl(6.4, 1.75, .95, 0, 4.3, TAS);
  yb.courses(.4).band(0, .36, KOY, .035, false).band(2.4, .07, T(TAS, .3), .025, false).band(3.78, .1, TAS, .05, false).band(3.88, .42, TAS, .13, T(TAS, -.16));
  { const f = yb.face(-.5, 2.72, .52, .8); f.win(.07, .08, .38, .58, { kind: 'arch', sove: AK, lit: true, bars: [2, 2] });
    slit(yb.face(.42, 1.9, .3, .7), .15, .07); }
  yb.merlons(4.3, 10, { e: .13, h: .3, w: .32 });
  b.line3([[5.95, 2.0, 4.3], [5.95, 2.0, 5.78]], M.ahsapK, 1.5);
  b.art(5.95, 2.0, 5.78, pth(M.altin, K.circ(0, 0, 1.6)), { r: .05, h: .1 });
  b.fx('flag', 5.95, 2.0, 5.7, { col: M.lacivert, s: 1.25, emblem: M.altin });
  b.critter('marti', 5.37, 1.42, 4.6);
  // işaret ateşi: demir sepetli çığırtma
  b.art(6.95, 1.8, 4.3, ln(M.demir, 'M0 0V-13M-3.4 0L0 -4L3.4 0', 1.3) + pth(T(M.demir, -.2), 'M-4.4 -18h8.8l-1.6 5.4h-5.6z') + ln('#8a8f98', 'M-4.4 -18h8.8M-2 -18l.7 5.2M2 -18l-.7 5.2', .8) + pth('#ff9a3a>#ffc060', 'M-3.2 -18.4q3.2 -2.2 6.4 0z'), { bb: [6.83, 1.68, 4.3, 7.07, 1.92, 5.0] });
  b.fx('fire', 6.95, 1.8, 4.95, { s: .8 }).fx('smoke', 6.95, 1.8, 5.3, { s: .7 });

  /* ---------- sağ sur parçası ve sur yoluna çıkan ahşap merdiven ---------- */
  const sr = b.box(7.15, 1.2, 0, 8, 2.2, 2.4, TAS, { edge: false }); stone(sr.L, 2); stone(sr.R, 2); sr.L.shadeBottom(.2, -.1);
  b.merlons(7.15, 1.2, 8, 1.4, 2.4, TAS).merlons(7.15, 2.0, 7.5, 2.2, 2.4, TAS);
  b.barrel(7.76, 2.52);
  { const x0 = 5.68, x1 = 7.5, y0 = 2.76, y1 = 3.1, n = 12, run = (x1 - x0) / n, rs = 2.4 / n, W = M.ahsap; let tp = '', fr = '', saw = [[x0, y1, 0]], rl = '';
    for (let k = 1; k <= n; k++) { const xa0 = x0 + (k - 1) * run, z = k * rs; saw.push([xa0, y1, z], [xa0 + run, y1, z]);
      tp += 'M' + PL([[xa0 - .02, y0, z], [xa0 + run + .03, y0, z], [xa0 + run + .03, y1 + .04, z], [xa0 - .02, y1 + .04, z]]) + 'Z';
      fr += 'M' + PL([[xa0 - .02, y1 + .04, z - .05], [xa0 + run + .03, y1 + .04, z - .05], [xa0 + run + .03, y1 + .04, z], [xa0 - .02, y1 + .04, z]]) + 'Z';
      if (k % 3 === 1) rl += `M${P(xa0 + .05, y1, z)} ${P(xa0 + .05, y1, z + .64)}`; }
    saw.push([x1, y1, 2.02], [x0 + .32, y1, 0]);
    rl += `M${P(x0 + .05, y1, rs + .64)} ${P(x1, y1, 3.04)}M${P(x1, y1, 2.4)} ${P(x1, y1, 3.04)}`;
    const post = `M${P(6.62, y1, 0)} ${P(6.62, y1, .92)}M${P(6.62, y1, .5)} ${P(7.0, y1, 1.3)}M${P(7.46, y1, 0)} ${P(7.46, y1, 2.0)}`;
    b.item([x0 - .04, y0, 0, x1, y1 + .05, 3.05], ln(T(M.ahsapK, -.1), post, 2.2) + pth(T(W, TT + .04), tp) + pth(T(M.ahsapK, TL + .1), 'M' + PL(saw) + 'Z') + pth(T(M.ahsapA, TL + .1), fr) + ln(T(M.ahsapK, .06), rl, 1.5),
      { pts: [[x0, y0, 0], [x0, y1, 0], [x1, y0, 0], [x1, y1, 0], [x1, y0, 2.4], [x1, y1, 2.4]] });
    // sahanlık: sur yoluna bağlanır
    const sh = b.box(x1, 2.2, 2.3, 8.2, 3.14, 2.4, W, { edge: false }); sh.T.planks({ dir: 'v', step: .14, dt: -.12 });
    b.line3([[8.14, 3.08, 0], [8.14, 3.08, 2.3]], T(M.ahsapK, -.1), 2.2).line3([[8.14, 3.08, 1.5], [7.66, 3.08, 2.3]], T(M.ahsapK, -.1), 1.6).line3([[8.14, 2.3, 0], [8.14, 2.3, 2.3]], T(M.ahsapK, -.3), 2);
    b.critter('kedi', 7.86, 2.86, 2.4, { col: '#e9e2d6' });
    b.item([x1, 2.2, 2.4, 8.2, 3.14, 3.06], ln(T(M.ahsapK, .06), `M${P(x1, 3.1, 3.04)} ${P(8.18, 3.1, 3.04)} ${P(8.18, 2.22, 3.04)}M${P(x1, 3.1, 2.72)} ${P(8.18, 3.1, 2.72)} ${P(8.18, 2.22, 2.72)}M${P(7.84, 3.1, 2.4)} ${P(7.84, 3.1, 3.04)}M${P(8.18, 3.1, 2.4)} ${P(8.18, 3.1, 3.04)}M${P(8.18, 2.66, 2.4)} ${P(8.18, 2.66, 3.04)}M${P(8.18, 2.22, 2.4)} ${P(8.18, 2.22, 3.04)}`, 1.5), { cast: false }); }

  /* ---------- kapı önü: bac masası, kâtip, nöbetçiler, eşekli tüccar ---------- */
  b.tree('selvi', .3, 2.92, { s: .84 });
  b.fig(1.36, 2.9, 0, { body: M.lacivert, robe: true, hat: 'sarik', hatCol: M.bez });
  const ms = b.box(.98, 3.08, 0, 1.8, 3.38, .38, M.bezK, { edge: false, T: T(M.ahsapA, -.04) });                                // masa: kırmızı örtülü
  ms.L.band(0, .07, M.altin, 0, 3).planks({ dir: 'v', step: .2, dt: -.1, b0: .07 }); ms.R.band(0, .07, M.altin, 0, 3);
  b.poly3([[1.1, 3.13, .39], [1.26, 3.13, .39], [1.26, 3.31, .39], [1.1, 3.31, .39]], '#f4ecd8', { n: [0, 0, 1] }).poly3([[1.26, 3.13, .39], [1.42, 3.13, .39], [1.42, 3.31, .39], [1.26, 3.31, .39]], '#e6dcc2', { n: [0, 0, 1] });   // defter
  b.art(1.26, 3.22, .4, ln('#6a5a4a', 'M-6 -1.6l3.4 1.7M-5 -.2l3 1.5M1 2.2l3.4 1.7M2 .8l3 1.5', .6) + ln('#3a3230', 'M2 -3.4l4.6 -6.6', .8) + pth('#f4f1ea', 'M5.4 -8.4l2.2 -3.4l-.2 3.6z'), { bb: [1.1, 3.13, .39, 1.42, 3.31, .6] });
  b.art(1.64, 3.2, .38, pth(T(M.altin, -.24), K.ell(-3, -.6, 2.1, 1.1) + K.ell(2.4, .4, 2.1, 1.1) + K.ell(2.4, -1, 2.1, 1.1)) + pth(M.altin, K.ell(-3, -1.8, 2.1, 1.1) + K.ell(2.4, -2.4, 2.1, 1.1)) + pth('#fff0b0', K.ell(-3.4, -2, .9, .4) + K.ell(2, -2.6, .9, .4)), { bb: [1.5, 3.1, .38, 1.78, 3.3, .5] });
  b.lamp(.86, 3.34, 0, { h: 1.15 });
  const sd = b.box(1.92, 3.12, 0, 2.3, 3.38, .26, M.ahsapK, { edge: false, cast: false }); sd.L.band(.04, .05, M.demir, .2, 3).band(.17, .05, M.demir, .2, 3).dot(.19, .13, 1.3, M.altin, 6, null); sd.R.band(.04, .05, M.demir, .2, 3).band(.17, .05, M.demir, .2, 3);   // demir kuşaklı sandık
  guard(3.02, 2.92, 0, { shield: true }); guard(5.02, 2.9, 0, { flip: true });
  // tüccar ve yüklü eşeği
  b.fig(3.66, 3.16, 0, { body: M.bezS, legs: '#6a4a34', robe: true, hat: 'fes', step: 1 });
  { const x = 4.32, y = 2.94, q = K.pr(x, y, 0), m = K.pr(3.66, 3.16, 0), hx = m[0] - q[0] + 4.2, hy = m[1] - q[1] - 9.4, C = '#9c8a7a';
    b.art(x, y, 0, '<ellipse cx="0" cy="0" rx="11" ry="3.2" fill="#1b2440" opacity=".22"/>'
      + pth(T(C, -.36), 'M-5.2 -8h1.9v8h-1.9zM5.6 -8h1.9v8h-1.9z') + pth(T(C, -.1), 'M-7.6 -8h2v8h-2zM3 -8h2v8h-2z') + pth('#3a3230', 'M-7.6 -1.2h2v1.2h-2zM3 -1.2h2v1.2h-2zM-5.2 -1.2h1.9v1.2h-1.9zM5.6 -1.2h1.9v1.2h-1.9z')
      + ln(T(C, -.3), 'M8.6 -12.6q2.2 1.6 1.6 5.6', 1.3)
      + pth(C, 'M-8.6 -11.4Q-8.8 -15.2 -4.6 -15.4H5.2Q9.4 -15.2 9.2 -11Q9 -7.2 5 -7.2H-4.6Q-8.2 -7.4 -8.6 -11.4Z') + pth(T(C, .34), 'M-7 -8.6Q0 -6.4 8 -8.4Q6.6 -7.2 5 -7.2H-4.6Q-6 -7.3 -7 -8.6Z')
      + pth(C, 'M-8.4 -12.4L-11.6 -19.4L-8 -20.6L-4.6 -14.6Z') + pth(T(C, -.3), 'M-9.4 -19.8l2.4 -1l.9 2.8l-2.2 1z')
      + pth(C, 'M-13.2 -21Q-10.6 -23.2 -8.2 -21L-9 -17.6Q-11.4 -15.4 -15 -16Q-16.4 -17.6 -14.8 -18.8Z') + pth(T(C, .42), K.ell(-14.6, -17.2, 1.7, 1.25)) + pth('#2a2420', K.circ(-11.6, -19.6, .6))
      + pth(T(C, -.2), 'M-10.2 -21.6l-1.4 -4.8l2.6 3.6zM-8.6 -21.4l.6 -5l1.4 4.4z')
      + pth('#b98d4a', 'M-3.6 -15.8h7.6l-1 6.4h-5.6z') + pth(T('#b98d4a', -.24), 'M-3.4 -13.6h7.2v.9h-7zM-3 -11.4h6.6v.8h-6.4z') + pth(M.bezM, 'M-4.8 -16.6h10v1.6h-10z')
      + pth('#d9c79a', 'M-4 -17Q-4.6 -21 -1.4 -21.4Q1.6 -21.4 1.4 -17Z') + pth(T('#d9c79a', -.2), 'M-.4 -21.3Q1.6 -21.2 1.4 -17H-.2Z') + pth(M.bezK, K.ell(3.6, -18.4, 3.4, 1.9)) + pth(T(M.bezK, .3), K.ell(6.2, -18.4, 1, 1.6)) + pth('#d87a3a', K.circ(-2, -22, 1.2) + K.circ(-.2, -22.4, 1.2))
      + ln('#5a4a3a', `M-14.6 -16.4Q${K.f1((hx - 14.6) / 2)} ${K.f1(hy / 2 - 3)} ${K.f1(hx)} ${K.f1(hy)}`, .8), { bb: [x - .32, y - .16, 0, x + .32, y + .16, .95] }); }

  b.fx('glint', 1.62, 3.2, .5).fx('birds', 3.36, 2.35, 3.54, { n: 2 });
  b.tag(4, 3.3, 0).doorAt(4, 3.3);
});
