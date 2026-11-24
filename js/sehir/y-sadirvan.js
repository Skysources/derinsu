/* Şadırvan — ana meydanın kara taş kuyu-sunağı: iki basamaklı sekizgen seki, oluklu kara taş hazne (soğuk, koyu su), ortada
   taş ayak üstünde çanak ve fıskiye; köşelerde payandalı ince ayaklar, iki tonlu taş sivri kemerler, kalın taş saçak ve
   üstünde dik, sekizgen demir külah (perçin kuşaklı, tepesi demir sivri uç ve rüzgârgülü). Işık: yalnız sekideki birkaç mum.
   Sekizgenin kenarları +x (gölge), çapraz ön ve +y (aydınlık) yönüne bakar; arka dört ayak öndekilerin ardında kaldığı için çizilmez.
   Fıskiye canlandırması her şeyin üstüne çizilir: ön kemerin boşluğuna sığacak boyda tutuldu. Parsel 4.5 × 4.5. */
CK.def('sadirvan', { w: 4.5, d: 4.5, name: 'Şadırvan' }, (b, K) => {
  const M = K.M, T = K.tone, tO = K.toneOf, pth = K.pth, ln = K.ln, P = K.P, PL = K.PL, pr = K.pr, f1 = K.f1, kf = K.kf;
  const TS = M.gTas, TK = M.gTasK, TA = M.gTasA, KR = M.gKara, SU = '#2c3a42', DM = T(M.gCati, -.04);
  const c = 2.25, RAD = Math.PI / 180, ZP = .24, ZS = ZP + .4, ZR = ZS + .06, ZC = 1.85, AH = .62, ZW = 2.6, ZE = 2.78, ZA = 5.0, RE = 1.72;
  const ov = (R, k, z) => [c + R * Math.cos((22.5 + 45 * k) * RAD), c + R * Math.sin((22.5 + 45 * k) * RAD), z || 0];
  const oct = (R, z) => [0, 1, 2, 3, 4, 5, 6, 7].map(k => ov(R, k, z));
  const at = (x, y, z, s) => { const p = pr(x, y, z); return `<g transform="translate(${f1(p[0])} ${f1(p[1])})">${s}</g>`; };
  // k. kenarın dış yüzü (7: +x gölge, 0: çapraz ön, 1: +y aydınlık)
  const side = (k, R, z, h) => { const A = ov(R, k), B = ov(R, k + 1), an = 45 * (k + 1) * RAD, [o, e] = (A[0] - A[1]) < (B[0] - B[1]) ? [A, B] : [B, A], l = Math.hypot(e[0] - o[0], e[1] - o[1]);
    return new K.Face([o[0], o[1], z], [(e[0] - o[0]) / l, (e[1] - o[1]) / l, 0], [0, 0, 1], l, h, [Math.cos(an), Math.sin(an), 0]); };

  /* --- zemin: kara kaldırım, sekizgen çevre taşı, soğuk su birikintileri --- */
  b.pave(0, 0, 4.5, 4.5, T(KR, .04));
  b.gpoly(oct(2.26), T(KR, -.06));
  b.ground(ln(T(KR, -.3), oct(2.26).map((p, k) => 'M' + P(p[0], p[1]) + ' ' + P(...ov(2.05, k))).join(''), .8));
  b.gpoly([[1.5, 4.3], [2.5, 4.42], [3.5, 4.36], [4.3, 3.9], [4.42, 2.9], [4.2, 2.0], [3.6, 3.4], [2.4, 4.0]], '#363e44', { op: .5 });
  const pd = (x, y, rx) => { const p = pr(x, y); return pth('#2e3a40', K.ell(p[0], p[1], rx, rx * .42)) + ln('#5a6a70', `M${f1(p[0] - rx * .5)} ${f1(p[1] - 1)}h${f1(rx * .6)}`, .7); };
  b.ground(pd(3.62, 4.0, 9) + pd(4.05, 3.3, 5) + pd(2.2, 4.28, 6) + pd(.7, 3.4, 5));

  /* --- iki basamak, seki döşemesi (kara taş, hazne çevresi ıslak) --- */
  b.prism(oct(2.05), 0, .12, KR).faces.forEach(f => f.band(.08, .04, TK, .1));
  b.prism(oct(1.82), .12, ZP, TK).faces.forEach(f => f.band(.08, .04, TA, .06));
  b.item([c - 1.8, c - 1.8, ZP, c + 1.8, c + 1.8, ZP + .01], pth(T(KR, .04), 'M' + PL(oct(1.66, ZP)) + 'ZM' + PL(oct(1.56, ZP)) + 'Z', 'fill-rule="evenodd"')
    + pth('#3a4248', 'M' + PL(oct(1.1, ZP)) + 'Z'), { cast: false });

  /* --- hazne: her yüzde sivri kör niş ve demir oluk; üstte silme, içte koyu su, ortada taş ayak ve çanak --- */
  const tk = b.prism(oct(.8), ZP, ZS, TK);
  tk.faces.forEach(f => { const m = f.w / 2; f.courses({ rh: .13, bw: .3, dens: .35 }).shp('point', m - .1, .06, .2, .27, KR, 3.2, -.3);
    f.line([[m, .3, 0], [m, .3, .1], [m, .25, .1]], M.gDemir, 1.6, 7.2).line([[m - .02, .25, .1], [m - .02, .06, .1]], M.gPas, .8, 7.1, -.1); });
  b.prism(oct(.9), ZS, ZR, TA);
  const wp = [0, 1, 2, 3, 4, 5, 6, 7].map(k => ov(.77, k, k > 2 && k < 7 ? ZR - .06 : ZR)), p0 = pr(c, c, ZR - .06);
  b.item([c - .77, c - .77, ZR, c + .77, c + .77, ZR + .5], pth(T(TK, -.3), 'M' + PL(oct(.77, ZR)) + 'Z') + pth(SU, 'M' + PL(wp) + 'Z')
    + ln('#5a6c74', K.ell(p0[0], p0[1], 19, 9.5) + K.ell(p0[0], p0[1] + .5, 13, 6.2), .7, 'opacity=".6"')
    + at(c, c, ZR - .06, pth(T(SU, -.3), K.ell(2.5, 1, 10, 4.6), 'opacity=".6"')
      + pth(T(TS, -.06), 'M-2.6 .6L-1.6 -7h3.2L2.6 .6Z') + pth(T(TS, -.36), 'M.2 .6V-7h1.4L2.6 .6Z')                               // ayak
      + pth(T(TS, -.04), 'M-10 -11C-10 -5 -4 -4.4 0 -4.4C4 -4.4 10 -5 10 -11Z') + pth(T(TS, -.34), 'M1.5 -4.4C5 -4.5 10 -5 10 -11H3.5Z')   // çanak
      + pth(T(TA, .1), K.ell(0, -11, 10, 4.8)) + pth(SU, K.ell(0, -10.8, 8.2, 3.7)) + pth(M.gDemir, 'M-1 -11v-3h2v3z')
      + ln('#6a7a80', 'M-7 -7.2V-2M7 -7.2V-1.6M-2.6 -6.2V.4M3.4 -6.2V.2', .8, 'opacity=".6"')), { cast: false });
  b.fx('fountain', c, c, ZR + .44, { h: .46 });
  b.critter('guvercin', c + .86, c - .12, ZR, { col: '#26262c' });                                     // silmede su içen kuzgun

  /* --- sekide: su çeken kukuletalı figür, toprak testi, basamakta eriyik mumlar --- */
  const jar = pth(T(M.gPas, -.3), 'M-3.2 0Q-4.6 -3.4 -1.6 -5.2L-1.2 -6.6h2.4L1.6 -5.2Q4.6 -3.4 3.2 0Z') + pth(T(M.gPas, -.06), 'M-3.2 0Q-4.6 -3.4 -1.6 -5.2L-1.2 -6.6h1L-.4 -5.2Q-2 -3 -1 0Z');
  b.art(c, c + .87, ZP, jar, { bb: [c - .1, c + .78, ZP, c + .1, c + .96, ZP + .3] });
  b.fig(c - .42, c + 1.06, ZP, { robe: true, body: '#3e3a38', legs: '#2a2626', hat: 'ortu', hatCol: '#2e2a2a' });
  const mum = '#5a4a30>#ffd27a';
  b.art(c + .9, c + .9, ZP, pth(M.gKemik, 'M-4 0h2v-4h-2zM-.6 0h1.6v-6h-1.6zM2.4 0h1.6v-3h-1.6z') + pth(T(M.gKemik, -.3), 'M-4.6 .6h9.2v-1h-9.2z')
    + pth(mum, K.ell(-3, -5.2, .9, 1.4) + K.ell(.2, -7.2, .9, 1.5) + K.ell(3.2, -4.2, .8, 1.3)), { bb: [c + .8, c + .8, ZP, c + 1, c + 1, ZP + .3] });

  /* --- ön ayaklar: kalın kara taş, dışa taşan payanda --- */
  [7, 2, 0, 1].forEach(k => { const [x, y] = ov(1.42, k);
    const pb = b.box(x - .1, y - .1, ZP, x + .1, y + .1, ZC, TS, { edge: false, T: null });
    pb.L.band(0, .1, KR, -.06).band(ZC - ZP - .12, .12, TA, .06); pb.R.band(0, .1, KR, -.06).band(ZC - ZP - .12, .12, TA, .06); });

  /* --- kemerli kuşak: iki tonlu kemer taşları, kalın silme --- */
  [7, 1, 0].forEach(k => { const f = side(k, 1.52, ZC, ZW - ZC), w = f.w, sp = .9, a0 = (w - sp) / 2, m = w / 2, th = .14; f.fill(TS);
    f.holes += f.shapeD('point', a0, 0, sp, AH);
    const q = (t, s, d) => [m + s * (sp / 2 + d) * (1 - t * t), (2 * t * (1 - t) * .62 + t * t) * (AH + d)], N = 5;
    for (const s of [-1, 1]) for (let i = 0; i < N; i += 2) { const t0 = i / N, t1 = (i + 1) / N; f.poly([q(t0, s, 0), q(t1, s, 0), q(t1, s, .1), q(t0, s, .1)], KR, 3, -.02); }
    f.rect(0, AH + .1, w, .06, TA, 3, .06).courses({ rh: .2, bw: .36, dens: .3, b0: AH + .16 });
    if (k) { const s = k === 1 ? -1 : 1, e = m + s * sp / 2, Q = (a, bb, ee) => f.P(a, bb, ee);
      f.put(5, kf(T(TS, k === 1 ? tO([1, 0, 0]) : -.14)), `M${Q(e, 0)}Q${Q(e, .62 * AH)} ${Q(m, AH)}L${Q(m, AH, -th)}Q${Q(e, .62 * AH, -th)} ${Q(e, 0, -th)}Z`); }
    const A = ov(1.52, k), B = ov(1.52, k + 1);
    b.item([Math.min(A[0], B[0]) - .1, Math.min(A[1], B[1]) - .1, ZC, Math.max(A[0], B[0]), Math.max(A[1], B[1]), ZW], () => f.svg(), { cast: false }); });

  /* --- saçak: kalın taş korniş; üstünde dik sekizgen demir külah --- */
  b.prism(oct(RE), ZW, ZE, TK).faces.forEach(f => f.band(0, .05, KR, -.1).band(ZE - ZW - .04, .04, TA, .1));
  { let sk = '', rb = '', rv = '', bnd = ''; const ap = [c, c, ZA], H = ZA - ZE, apo = RE * Math.cos(22.5 * RAD);
    const lp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
    [4, 3, 5, 2, 6, 1, 7, 0].forEach(k => { const a = 45 * (k + 1) * RAD, n = K.unit([Math.cos(a) * H, Math.sin(a) * H, apo]); if (K.dot(n, K.VIEW) <= 0) return;
      const e0 = ov(RE - .06, k, ZE), e1 = ov(RE - .06, k + 1, ZE);
      sk += pth(T(DM, tO(n)), 'M' + PL([e0, e1, ap]) + 'Z'); rb += 'M' + PL([e0, ap]);
      for (const t of [.14, .3, .48, .66]) rv += 'M' + PL([lp(e0, ap, t), lp(e1, ap, t)]);
      for (const t of [.22, .56]) bnd += 'M' + PL([lp(e0, ap, t), lp(e1, ap, t)]); });
    b.item([c - RE, c - RE, ZE, c + RE, c + RE, ZA], sk + ln(T(DM, -.3), rv, .7, 'opacity=".7"') + ln(M.gDemir, bnd, 2.2) + ln(T(DM, .28), rb, 1.3), { pts: oct(RE, ZE).concat([ap]) }); }
  b.critter('guvercin', c - .5, c + 1.5, ZE, { col: '#26262c', flip: true });
  b.art(c, c, ZA, ln(M.gDemir, 'M0 2V-16M-3.4 -8H3.4', 1.3) + pth(M.gDemir, 'M0 -21L1.6 -15.6H-1.6Z' + K.circ(0, -8, 1.4)) + pth(T(M.gDemir, .2), 'M1 -12.6h7l-1.6 1.6l1.6 1.6h-7z'),
    { bb: [c - .1, c - .1, ZA, c + .1, c + .1, ZA + .6] });
  b.fx('glint', c, c, ZA + .62);

  /* --- yırtık kan kırmızısı bez: ön ayağın demir kancasında --- */
  { const [x, y] = ov(1.42, 0); b.art(x + .1, y + .1, ZC - .1, ln(M.gDemir, 'M0 0h3v2', 1) + pth(M.gKan, 'M1.4 2h4.2l-.4 10.4l-1.2 -2l-.8 3.6l-1 -2.6l-.9 1.8z') + pth(M.gKanK, 'M4 2h1.6l-.4 10.4l-1.2 -2z'),
    { bb: [x + .02, y + .02, ZC - .7, x + .2, y + .2, ZC - .05] }); }

  /* --- meydan köşeleri: devrik taş, testiler, kara kedi, kuzgunlar --- */
  b.art(1.0, 3.95, 0, jar + `<g transform="translate(10 3)">${jar}</g>` + ln(M.gAhsapK, 'M-7 -9L17 -3.4', 1.4), { bb: [.85, 3.8, 0, 1.45, 4.15, .4] });
  b.box(.3, 3.1, 0, .72, 3.4, .22, TK, { edge: false, T: TA });
  b.critter('kedi', 2.85, 4.27, 0, { col: '#2a2a2e' });
  b.fx('birds', 3.62, 3.95, 0, { n: 3 });

  b.tag(3.95, 3.95, 0).doorAt(3.72, 3.72);
});
