/* Şadırvan — ana meydanın çeşme köşkü: iki basamaklı sekizgen seki, musluklu mermer hazne, ortasında oymalı çanak ve fıskiye;
   ince sütunlar üstünde iki renk taşlı sivri kemerler, çini kuşak, boyalı ahşap saçak, kurşun etek ve basık kubbe.
   Sekizgenin kenarları +x (gölge), çapraz ön ve +y (aydınlık) yönüne bakar; arka dört sütun öndekilerin tam ardında kaldığı için çizilmez.
   Fıskiye canlandırması her şeyin üstüne çizilir: ön kemerin boşluğuna sığacak boyda tutuldu. Parsel 4.5 × 4.5. */
CK.def('sadirvan', { w: 4.5, d: 4.5, name: 'Şadırvan' }, (b, K) => {
  const M = K.M, T = K.tone, tO = K.toneOf, pth = K.pth, ln = K.ln, P = K.P, PL = K.PL, pr = K.pr, f1 = K.f1, kf = K.kf;
  const c = 2.25, RAD = Math.PI / 180, ZP = .24, ZS = ZP + .4, ZR = ZS + .06, ZC = 1.85, AH = .5, ZW = 2.55, ZE = 2.6, ZD = 2.94, ZK = 3.08, RE = 1.7, RD = 1.02;
  const ov = (R, k, z) => [c + R * Math.cos((22.5 + 45 * k) * RAD), c + R * Math.sin((22.5 + 45 * k) * RAD), z || 0];
  const oct = (R, z) => [0, 1, 2, 3, 4, 5, 6, 7].map(k => ov(R, k, z));
  const at = (x, y, z, s) => { const p = pr(x, y, z); return `<g transform="translate(${f1(p[0])} ${f1(p[1])})">${s}</g>`; };
  // k. kenarın dış yüzü (7: +x gölge, 0: çapraz ön, 1: +y aydınlık)
  const side = (k, R, z, h) => { const A = ov(R, k), B = ov(R, k + 1), an = 45 * (k + 1) * RAD, [o, e] = (A[0] - A[1]) < (B[0] - B[1]) ? [A, B] : [B, A], l = Math.hypot(e[0] - o[0], e[1] - o[1]);
    return new K.Face([o[0], o[1], z], [(e[0] - o[0]) / l, (e[1] - o[1]) / l, 0], [0, 0, 1], l, h, [Math.cos(an), Math.sin(an), 0]); };

  /* --- zemin: çevre taşı, ıslaklık, su birikintileri, gece ışığı --- */
  b.pave(0, 0, 4.5, 4.5, M.parke);
  b.gpoly(oct(2.26), M.parkeK);
  b.ground(ln(T(M.parkeK, -.16), oct(2.26).map((p, k) => 'M' + P(p[0], p[1]) + ' ' + P(...ov(2.05, k))).join(''), .8));
  b.gpoly([[1.5, 4.3], [2.5, 4.42], [3.5, 4.36], [4.3, 3.9], [4.42, 2.9], [4.2, 2.0], [3.6, 3.4], [2.4, 4.0]], '#8f9f9c', { op: .42 });
  b.gpoly([[.3, 2.6], [.5, 3.6], [1.3, 4.25], [1.9, 4.1], [.9, 3.3], [.6, 2.4]], '#8f9f9c', { op: .3 });
  const pd = (x, y, rx) => { const p = pr(x, y); return pth('#9cc3c8', K.ell(p[0], p[1], rx, rx * .42)) + ln('#eaf6f4', `M${f1(p[0] - rx * .5)} ${f1(p[1] - 1)}h${f1(rx * .6)}`, .8); };
  b.ground(pd(3.62, 4.0, 9) + pd(4.05, 3.3, 5) + pd(2.2, 4.28, 6));
  b.spill(c - .1, c + 1.7, 1.3).spill(c + 1.7, c - .1, 1.3);

  /* --- iki basamak, seki döşemesi (gül rengi kakma kuşak, hazne çevresi ıslak) --- */
  b.prism(oct(2.05), 0, .12, M.tas);
  b.prism(oct(1.82), .12, ZP, M.mermer);
  b.item([c - 1.8, c - 1.8, ZP, c + 1.8, c + 1.8, ZP + .01], pth(T(M.gul, .2), 'M' + PL(oct(1.66, ZP)) + 'ZM' + PL(oct(1.56, ZP)) + 'Z', 'fill-rule="evenodd"')
    + pth('#cdd6d0', 'M' + PL(oct(1.1, ZP)) + 'Z'), { cast: false });

  /* --- hazne: her yüzde niş ve pirinç musluk; üstte silme, içte su, ortada çanak --- */
  const tk = b.prism(oct(.8), ZP, ZS, M.mermer);
  tk.faces.forEach(f => { const m = f.w / 2; f.rect(.06, .06, f.w - .12, .29, M.mermer, 3, -.1).shp('point', m - .1, .08, .2, .25, M.gri, 3.2, -.12);
    f.line([[m, .31, 0], [m, .31, .09], [m, .26, .09]], M.altin, 1.4, 7.2, null); });
  b.prism(oct(.9), ZS, ZR, M.mermer);
  const wp = [0, 1, 2, 3, 4, 5, 6, 7].map(k => ov(.77, k, k > 2 && k < 7 ? ZR - .06 : ZR)), p0 = pr(c, c, ZR - .06);
  b.item([c - .77, c - .77, ZR, c + .77, c + .77, ZR + .5], pth(T(M.mermer, -.3), 'M' + PL(oct(.77, ZR)) + 'Z') + pth(M.su, 'M' + PL(wp) + 'Z')
    + ln(M.suA, K.ell(p0[0], p0[1], 19, 9.5) + K.ell(p0[0], p0[1] + .5, 13, 6.2), .8, 'opacity=".7"')
    + at(c, c, ZR - .06, pth(M.suK, K.ell(2.5, 1, 10, 4.6), 'opacity=".5"')
      + pth(T(M.mermer, -.06), 'M-2.4 .6L-1.4 -5h2.8L2.4 .6Z') + pth(T(M.mermer, -.36), 'M.2 .6V-5h1.2L2.4 .6Z')                    // ayak
      + pth(T(M.mermer, -.04), 'M-10.5 -9.5C-10.5 -3.4 -4 -2.6 0 -2.6C4 -2.6 10.5 -3.4 10.5 -9.5Z') + pth(T(M.mermer, -.34), 'M1.5 -2.6C5 -2.7 10.5 -3.4 10.5 -9.5H3.5Z')   // çanak
      + pth(T(M.mermer, .2), K.ell(0, -9.5, 10.5, 5)) + pth(M.suA, K.ell(0, -9.3, 8.6, 3.9)) + pth(M.bronz, 'M-1 -9.5v-3h2v3z')
      + ln(M.kopuk, 'M-7.4 -5.6V-.6M7.4 -5.6V-.2M-2.6 -4.6V1.6M3.4 -4.6V1.4', .9, 'opacity=".85"')), { cast: false });
  b.fx('fountain', c, c, ZR + .37, { h: .46 });
  b.critter('guvercin', c + .86, c - .12, ZR);                                                   // silmede su içen güvercin

  /* --- musluk başı: bakır güğüm dolduran saka, tabureye çıkıp suya uzanan çocuk --- */
  const jar = pth(T('#b5673a', -.25), 'M-3.2 0Q-4.6 -3.4 -1.6 -5.2L-1.2 -6.6h2.4L1.6 -5.2Q4.6 -3.4 3.2 0Z') + pth('#cf8a52', 'M-3.2 0Q-4.6 -3.4 -1.6 -5.2L-1.2 -6.6h1L-.4 -5.2Q-2 -3 -1 0Z');
  b.art(c, c + .87, ZP, jar + ln(M.kopuk, 'M.7 -8.6V-6.2', .9), { bb: [c - .1, c + .78, ZP, c + .1, c + .96, ZP + .3] });
  b.fig(c - .42, c + 1.06, ZP, { body: '#3f6a8a', legs: '#5a4634', hat: 'sarik' });
  b.art(c - .42, c + 1.06, ZP, ln('#4a3020', 'M-3.2 -15.2L3.4 -8.4', 1) + pth('#7a4a2c', 'M3 -12.5q3.6 .4 3.4 5q-.4 2.6 -2.6 2.6q-1.6 -.6 -1.4 -3.4z') + pth(T('#7a4a2c', .3), 'M3.6 -11.6q1.6 .4 1.6 3l-1.2 .2z'),
    { bb: [c - .56, c + .92, ZP, c - .28, c + 1.2, ZP + .8] });
  [[1.08, 0], [.76, .76], [0, 1.08]].forEach(([x, y]) => b.cyl(c + x, c + y, .1, ZP, ZP + .13, M.mermer, { cast: false }));
  b.art(c + .76, c + .76, ZP + .13, `<g transform="scale(1.15)">${pth('#5a4634', 'M-2 -4.6h1.7V0h-1.7zM.3 -4.6h1.7V0h-1.7z')
    + pth(M.bezS, 'M-2.7 -10.4q0 -1.5 1.5 -1.5h2.4q1.5 0 1.5 1.5v6h-5.4z') + pth(T(M.bezS, -.24), 'M.6 -11.9h.6q1.5 0 1.5 1.5v6H.6z')
    + ln(M.bezS, 'M-2.4 -10.6L-3.8 -13.4M2.4 -10.6L4 -13', 1.5) + pth(M.ten, K.circ(-3.9, -13.8, .8) + K.circ(4.1, -13.4, .8)) + pth('#3a2c24', K.circ(0, -13.6, 2.3))}</g>`,
    { bb: [c + .64, c + .64, ZP + .13, c + .88, c + .88, ZP + .8] });

  /* --- ön sütunlar: kaide ve başlık bilezikli ince mermer --- */
  [7, 2, 0, 1].forEach(k => { const [x, y] = ov(1.42, k);
    b.cyl(x, y, .06, ZP, ZC, M.mermer, { top: null }).band(ZP, .08, M.mermer, .04).band(ZC - .08, .08, M.mermer, .075); });

  /* --- kemer boşluğunda asılı kandiller (yan kemerler) --- */
  const kandil = ln(M.demir, 'M0 -9V0', .7) + pth(M.bronz, 'M-2.2 0h4.4l-.8 -1.5h-2.8zM-1.2 5.2h2.4v1.1h-2.4z') + pth('#fff0c4>#fff4cf', 'M-2.2 0h4.4l-1 5.2h-2.4z')
    + `<circle class="Nl" cy="3" r="15" fill="url(#${K.glowId()})"/>`;
  [[0, 1.31], [1.31, 0]].forEach(([x, y]) => b.art(c + x, c + y, ZC + .17, kandil, { bb: [c + x - .05, c + y - .05, ZC + .1, c + x + .05, c + y + .05, ZC + AH] }));

  /* --- kemerli kuşak: iki renk kemer taşları, çini şerit, köşelikte pirinç kabara --- */
  [7, 1, 0].forEach(k => { const f = side(k, 1.48, ZC, ZW - ZC), w = f.w, sp = .9, a0 = (w - sp) / 2, m = w / 2, th = .12; f.fill(M.mermer);
    f.holes += f.shapeD('point', a0, 0, sp, AH);
    const q = (t, s, d) => [m + s * (sp / 2 + d) * (1 - t * t), (2 * t * (1 - t) * .62 + t * t) * (AH + d)], N = 5;
    for (const s of [-1, 1]) for (let i = 0; i < N; i += 2) { const t0 = i / N, t1 = (i + 1) / N; f.poly([q(t0, s, 0), q(t1, s, 0), q(t1, s, .1), q(t0, s, .1)], M.somon, 3, .05); }
    f.rect(0, AH + .06, w, .1, M.turkuaz, 3).dots([.14, .32, .5, .68, .86].map(t => [w * t, AH + .11]), 1.7, M.bez, 4);
    f.dot(.07, AH - .12, 1.7, M.bronz, 4, .2).dot(w - .07, AH - .12, 1.7, M.bronz, 4, .2);
    if (k) { const s = k === 1 ? -1 : 1, e = m + s * sp / 2, Q = (a, bb, ee) => f.P(a, bb, ee);
      f.put(5, kf(T(M.mermer, k === 1 ? tO([1, 0, 0]) : -.14)), `M${Q(e, 0)}Q${Q(e, .62 * AH)} ${Q(m, AH)}L${Q(m, AH, -th)}Q${Q(e, .62 * AH, -th)} ${Q(e, 0, -th)}Z`); }
    const A = ov(1.48, k), B = ov(1.48, k + 1);
    b.item([Math.min(A[0], B[0]) - .1, Math.min(A[1], B[1]) - .1, ZC, Math.max(A[0], B[0]), Math.max(A[1], B[1]), ZW], () => f.svg(), { cast: false }); });

  /* --- saçak: boyalı ahşap alın, altında boncuk dizisi; kurşun etek, çinili kasnak, kubbe, yaldızlı alem --- */
  b.prism(oct(RE), ZW, ZE, M.mavi);
  b.item([c - RE, c - RE, ZW - .06, c + RE, c + RE, ZW], ln(M.krem, 'M' + PL([7, 0, 1, 2].map(k => ov(RE, k, ZW - .035))), 2.2, 'stroke-dasharray=".1 4.2"'), { cast: false });
  let sk = '', rb = '', sm = ''; const run = (RE - RD) * Math.cos(22.5 * RAD);
  const lp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
  [4, 3, 5, 2, 6, 1, 7, 0].forEach(k => { const a = 45 * (k + 1) * RAD, n = K.unit([Math.cos(a) * (ZD - ZE), Math.sin(a) * (ZD - ZE), run]); if (K.dot(n, K.VIEW) <= 0) return;
    const e0 = ov(RE, k, ZE), e1 = ov(RE, k + 1, ZE), d0 = ov(RD, k, ZD), d1 = ov(RD, k + 1, ZD);
    sk += pth(T(M.kursun, tO(n)), 'M' + PL([e0, e1, d1, d0]) + 'Z'); rb += 'M' + PL([e0, d0]); sm += 'M' + PL([lp(e0, e1, .5), lp(d0, d1, .5)]); });
  b.item([c - RE, c - RE, ZE, c + RE, c + RE, ZD], sk + ln(T(M.kursun, -.2), sm, .7) + ln(T(M.kursun, .34), rb, 1.4), { pts: oct(RE, ZE) });
  b.critter('guvercin', c - .5, c + 1.42, ZE + .08, { flip: true });
  const dr = b.prism(oct(RD, 0), ZD, ZK, M.mermer);
  dr.faces.forEach(f => f.rect(.08, .03, f.w - .16, .08, M.turkuaz, 3));
  b.dome(c, c, .9, ZK, M.kursun, { hf: .56, alem: false });
  b.art(c, c, ZK + .52, ln(M.altin, 'M0 2V-9', 1.3) + pth(M.altin, K.circ(0, -2.4, 2.5) + K.circ(0, -6.6, 1.7) + 'M0 -14.5l1.9 3.4l-1.9 2.4l-1.9 -2.4z') + pth(T(M.altin, .5), K.circ(-.8, -3.2, .9)), { bb: [c - .1, c - .1, ZK + .5, c + .1, c + .1, ZK + 1.02] });
  b.fx('glint', c, c, ZK + .94);

  /* --- meydan köşeleri: fener, sakanın sırığı ve güğümleri, güvercinlere sinmiş kedi --- */
  b.lamp(.45, 4.05);
  b.art(1.0, 3.95, 0, jar + `<g transform="translate(10 3)">${jar}</g>` + ln(M.ahsapK, 'M-7 -9L17 -3.4', 1.4), { bb: [.85, 3.8, 0, 1.45, 4.15, .4] });
  b.critter('kedi', 2.85, 4.27, 0, { col: '#e8e0d0' });
  b.fx('birds', 3.62, 3.95, 0, { n: 3 });

  b.tag(3.95, 3.95, 0).doorAt(3.72, 3.72);
});
