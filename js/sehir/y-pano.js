/* Görev Panosu — meydandaki ulu çınarın altında, kiremit çatılı, oymalı direkli ilan panosu.
   Pano +y'ye (aydınlığa) bakar. Parsel 4 × 3; kütle arkada (y≈1), önü açık: ilan çakan kâtip, panoyu gösteren balıkçı, köpek.
   Yükseklik: mahya 1.88, rüzgâr balığıyla ≈ 2.2. Büyük ağaç ÇİZİLMEZ (şehir sahnesi ekler).
   Sıralama notu: çatının altındaki direklerin kutusu ZA'nın altında tutulur, çıkmanınki çatının üstünde. */
CK.def('pano', { w: 4, d: 3, name: 'Görev Panosu' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, PL = K.PL, pr = K.pr, f1 = K.f1;
  const TAH = '#84542f', TAHK = '#5e3a20', MAVI = '#46708c', KIR = M.kiremit, INK = '#6b5743', MUH = '#b5302a';
  const KAG = ['#f2e5c4', '#e6d1a3', '#fbf5e2', '#efdcb4'];
  const YM = .95, ZW = 1.62, RISE = .26, HALF = .27, OV = .09, SL = RISE / HALF, ZT = ZW + RISE, ZE = ZW - OV * SL, YE = YM + HALF + OV, ZA = ZE - .08;   // ZA: çatının alt kotu
  const golge = (rx, ry) => `<ellipse cx="1.5" cy="0" rx="${rx}" ry="${ry}" fill="#1b2440" opacity=".2"/>`;
  // ekran uzayında nokta dizisi: yuvarlak uçlu sıfır boy çizgiler (daire yolundan çok daha kısa)
  const nk = (col, pts, wid) => ln(col, pts.map(p => `M${f1(p[0])} ${f1(p[1])}h.1`).join(''), wid);

  /* --- zemin: sekizgen taş döşeme, derzler, çınardan düşmüş yapraklar, yere düşmüş bir ilan --- */
  b.gpoly([[.55, .12], [3.45, .12], [3.9, .58], [3.9, 2.42], [3.42, 2.9], [.58, 2.9], [.1, 2.42], [.1, .58]], '#c6b48c');
  b.gpoly([[.62, .26], [3.38, .26], [3.76, .64], [3.76, 2.36], [3.36, 2.76], [.64, 2.76], [.24, 2.36], [.24, .64]], '#e3d7b9');
  let dz = ''; for (const [x0, y0, x1, y1] of [[.24, 1.9, 3.76, 1.9], [.5, 2.33, 3.5, 2.33], [1.2, 1.9, 1.2, 2.33], [2.1, 1.9, 2.1, 2.33], [3.0, 1.9, 3.0, 2.33], [.8, 2.33, .8, 2.76], [1.65, 2.33, 1.65, 2.76], [2.55, 2.33, 2.55, 2.76]]) dz += 'M' + PL([[x0, y0], [x1, y1]]);
  b.ground(ln('#cbbb97', dz, .8));
  const yap = (list, col) => b.ground(ln(col, list.map(([x, y, a]) => { const p = pr(x, y); return `M${f1(p[0])} ${f1(p[1])}l${f1(Math.cos(a) * 2.2)} ${f1(Math.sin(a) * 1.1)}`; }).join(''), 1.5));
  yap([[.5, 2.05, .4], [1.5, 2.66, 2.1], [2.9, 2.55, 1.2], [3.55, 2.0, .2], [2.4, 2.2, 2.8], [1.0, 1.75, 1]], '#c9a04e');
  yap([[.95, 2.62, 1.0], [3.2, 2.72, 2.4], [3.72, 1.0, .7], [2.0, 2.45, .1]], '#a3b46c');
  b.gpoly([[2.82, 2.42], [3.06, 2.36], [3.14, 2.54], [2.9, 2.6]], KAG[2]);
  b.ground(ln(INK, 'M' + PL([[2.9, 2.46], [3.04, 2.425]]) + 'M' + PL([[2.93, 2.52], [3.08, 2.48]]), .6));
  b.spill(1.0, 1.75, 1.5).spill(3.0, 1.75, 1.3, { op: .6 });
  b.tufts(3.52, .6, 3.7, 1.2, 3);

  /* --- taş kaide + mermer tabla + basamak --- */
  const kd = b.box(.5, .5, 0, 3.5, 1.42, .18, M.tas, { edge: false });
  kd.L.planks({ step: .43, dt: -.14 }); kd.R.planks({ step: .31, dt: -.12 });
  b.slab(.44, .44, 3.56, 1.48, .24, .06, M.mermer);
  const bs = b.box(1.15, 1.48, 0, 2.85, 1.8, .11, M.tas, { edge: false, cast: false, T: M.mermer }); bs.L.planks({ step: .57, dt: -.14 });

  /* --- pano levhası: soluk mavi boyalı tahta, koyu çerçeve --- */
  const bd = b.box(.98, .9, .4, 3.02, 1.0, 1.32, MAVI, { edge: false }), F = bd.L;
  F.planks({ step: .34, dt: -.12 }).rect(0, 0, 2.04, .07, TAH, 3).rect(0, .07, .05, .85, TAH, 3).rect(1.99, .07, .05, .85, TAH, 3);
  const fnk = (p, wid, col, layer = 7, dt = 0) => F.put(layer, 'Ln ' + K.ks(F.c(col, dt)), `M${F.P(p[0], p[1])}h.1`, `stroke-width="${wid}"`);
  // ilan: (a, b) sol alt köşe, w × h, rot (radyan), renk; o: n satır, muhur [u,v,çap], kurdele, kivrik, bas, isaret
  const ilan = (a, b0, w, h, rot, ci, o = {}) => {
    const ca = a + w / 2, cb = b0 + h / 2, c = Math.cos(rot), s = Math.sin(rot), q = (u, v) => [ca + u * c - v * s, cb + u * s + v * c], col = KAG[ci], k = o.kivrik ? .075 : 0, W = w / 2, H = h / 2;
    F.poly(k ? [q(-W, -H), q(W - k, -H), q(W, -H + k), q(W, H), q(-W, H)] : [q(-W, -H), q(W, -H), q(W, H), q(-W, H)], col, 5);
    F.line(k ? [q(-W + .01, -H), q(W - k, -H), q(W, -H + k), q(W, H - .01)] : [q(-W + .01, -H), q(W, -H), q(W, H - .01)], MAVI, .9, 5.5, -.42);                                      // alt ve sağ kenarda gölge
    if (k) F.poly([q(W - k, -H), q(W, -H + k), q(W - k * 1.1, -H + k * 1.1)], col, 5.6, -.26);
    if (o.bas) F.line([q(-W + .05, H - .07), q(W - .05, H - .07)], o.bas, 2.2, 6);
    const n = o.n === undefined ? 3 : o.n, top = H - (o.isaret ? .185 : o.bas ? .15 : .06), st = o.st || .052;
    for (let i = 0; i < n; i++) F.line([q(-W + .035, top - i * st), q(W - .035 - (i === n - 1 ? w * .3 : 0), top - i * st)], INK, .7, 6);
    const v0 = H - .1, I = o.isaret;
    if (I === 'balik') F.poly([q(-.075, v0), q(-.02, v0 + .036), q(.03, v0), q(.075, v0 + .036), q(.075, v0 - .036), q(.03, v0), q(-.02, v0 - .036)], '#3f7f9a', 6);
    else if (I === 'cuval') F.poly([q(-.045, v0 - .05), q(.045, v0 - .05), q(.058, v0 + .012), q(.018, v0 + .03), q(.03, v0 + .055), q(-.03, v0 + .055), q(-.018, v0 + .03), q(-.058, v0 + .012)], '#a87f4e', 6);
    else if (I === 'kilic') F.line([q(-.06, v0 - .05), q(.06, v0 + .05)], '#5f7488', 1.3, 6.1).line([q(-.06, v0 - .008), q(-.018, v0 - .052)], '#8a5a2a', 1.3, 6.2);
    else if (I === 'yuz') { fnk(q(0, v0 + .02), 3, INK, 6.3); F.poly([q(-.06, v0 - .07), q(-.035, v0 - .015), q(.035, v0 - .015), q(.06, v0 - .07)], INK, 6); }
    else if (I === 'harita') { F.line([q(-.08, v0 - .05), q(-.03, v0 + .02), q(.02, v0 - .03), q(.06, v0 + .02)], '#9a5a3a', .8, 6.1); fnk(q(.075, v0 + .035), 2.2, MUH); }
    if (o.muhur) { const m = q(o.muhur[0], o.muhur[1]);
      if (o.kurdele) F.poly([[m[0] - .014, m[1]], [m[0] - .045, m[1] - .12], [m[0] - .014, m[1] - .095], [m[0], m[1] - .13], [m[0] + .03, m[1] - .11], [m[0] + .014, m[1]]], o.kurdele, 6.5);
      fnk(m, o.muhur[2] || 3, MUH); }
  };
  ilan(.09, .1, .24, .36, .06, 1, { n: 2 });
  ilan(.08, .53, .26, .34, -.05, 0, { n: 3, muhur: [.07, -.11] });
  ilan(.39, .61, .3, .25, .04, 3, { n: 1, isaret: 'kilic' });
  ilan(.38, .2, .25, .34, .05, 2, { n: 2, isaret: 'balik' });                                   // kâtibin çaktığı taze ilan
  ilan(.68, .11, .27, .37, -.04, 0, { n: 2, isaret: 'cuval', kivrik: true });
  ilan(.71, .54, .23, .31, .07, 1, { n: 2, isaret: 'yuz' });
  ilan(1.03, .09, .34, .14, -.03, 3, { n: 2 });
  ilan(1.0, .28, .42, .58, 0, 2, { n: 5, st: .06, bas: MUH, muhur: [.1, -.2, 4.6], kurdele: M.bezM });   // ortadaki büyük ferman
  ilan(1.49, .1, .26, .34, -.04, 1, { n: 2, isaret: 'balik', kivrik: true });
  ilan(1.48, .5, .27, .36, .05, 0, { n: 1, isaret: 'harita' });
  ilan(1.8, .09, .16, .17, .03, 0, { n: 2 });
  ilan(1.79, .3, .18, .28, .08, 2, { n: 2, muhur: [.03, -.1, 2.4] });
  ilan(1.78, .63, .2, .24, -.07, 3, { n: 1, isaret: 'kilic' });

  /* --- oymalı direkler: taş pabuç, boğumlar, baklava oyma --- */
  const direk = x => {
    b.box(x - .17, .78, .24, x + .17, 1.12, .34, M.tasK, { edge: false, cast: false, T: M.tas });
    const p = b.box(x - .12, .83, .34, x + .12, 1.07, 1.46, TAH, { edge: false }); p.it.bb[5] = 1.42;      // sıralama: çatının altında kalsın
    for (const f of [p.L, p.R]) f.band(0, .08, TAH, -.2).band(.96, .16, TAH, -.2);
    p.L.band(.2, .035, TAH, .2).band(.84, .035, TAH, .2).poly([[.12, .44], [.17, .545], [.12, .65], [.07, .545]], TAH, 5, .26);
    return p;
  };
  const dL = direk(.86), dR = direk(3.14);
  // fener: demir kolda asılı, gece hâleli
  const fener = (x, z) => { b.line3([[x, 1.07, z + .4], [x, 1.28, z + .36]], M.demir, 1.2);
    b.art(x, 1.28, z, ln(M.demir, 'M0 -10.4V-7M-2.5 -6.7h5M-1.9 .3h3.8', 1.2) + pth('#ffe9b0>#fff1c2', 'M-1.9 -6.1h3.8v5.8h-3.8z') + `<circle class="Nl" cy="-3" r="17" fill="url(#${K.glowId()})"/>`, { bb: [x - .05, 1.23, z, x + .05, 1.33, z + .36] }); };
  fener(.86, 1.0); fener(3.14, 1.0);
  // sağ direkte asılı tokmak
  dR.L.line([[.12, .62], [.12, .5]], '#d9c79a', .7, 7).line([[.12, .5], [.12, .26]], M.ahsapA, 1.5, 7.1).rect(.04, .18, .16, .09, M.ahsapA, 7.2, .12).rect(.04, .18, .03, .09, TAHK, 7.3).rect(.17, .18, .03, .09, TAHK, 7.3);
  // saçak payandaları (+x'e bakan yüzleri görünür) ve lento
  for (const x of [.98, 3.26]) b.poly3([[x, 1.07, 1.1], [x, 1.07, 1.42], [x, 1.32, 1.42], [x, 1.26, 1.34], [x, 1.15, 1.27]], TAH, { n: [1, 0, 0], bb: [x - .04, 1.07, 1.1, x, 1.32, 1.42] });
  b.poly3([[3.34, 1.05, 1.46], [3.34, .85, 1.46], [3.34, .85, ZW], [3.34, 1.05, ZW]], TAHK, { n: [1, 0, 0], bb: [3.26, .85, 1.42, 3.34, 1.05, ZA] });

  /* --- yazı rafı: hokka ve kuş tüyü kalem --- */
  b.slab(2.34, 1.0, 2.8, 1.2, .47, .045, M.ahsapA, { cast: false });
  b.art(2.6, 1.1, .47, pth('#27324a', 'M-2 -3.6h4l.8 3.6h-5.6z') + ln('#fbf6ea', 'M-.4 -4l-2.8 -8', 1.6) + ln('#b9ae98', 'M-.4 -4l-2.8 -8', .5), { bb: [2.5, 1.02, .47, 2.7, 1.2, .9] });

  /* --- çatı: alaturka kiremit, ortada alınlıklı çıkma, mahyada pirinç topuzlar --- */
  const cat = b.gable(.68, YM - HALF, 3.32, YM + HALF, ZW, RISE, KIR, { axis: 'x', ov: OV, wall: TAH, tex: false });
  cat.A.tiles({ step: .28 });
  cat.G.planks({ step: .09, dt: -.16 }); cat.G.put(7, 'Ln ' + K.ks(M.altin), `M${cat.G.P(.27, .09)}h.1`, 'stroke-width="4"');
  cat.A.put(8, 'Ln ' + K.ks('#d0aa52'), [[.5, .3], [1.5, .12], [2.5, .34]].map(p => `M${cat.A.P(p[0], p[1])}l1.6 .6`).join(''), 'stroke-width="1.5"');          // çatıya düşmüş yapraklar
  // alınlıklı çıkma (çapraz beşik): yamaçları ana çatıya dere çizgisiyle oturur
  const gx = 2, hw = .32, yf = YE + .06, zt = ZE + .23, yb = YM + (ZT - zt) / SL, len = Math.hypot(hw, zt - ZE), TLt = K.toneOf([0, 1, 0]);
  const gs = new K.Face([gx + hw, yf, ZE], [0, -1, 0], K.unit([-hw, 0, zt - ZE]), yf - yb, len, K.unit([zt - ZE, 0, hw]), [[0, 0], [yf - YE, 0], [yf - yb, len], [0, len]]);
  gs.fill(KIR).put(2.5, 'Ln ' + K.ks(gs.c(KIR, -.17)), gs.seg(.1, 0, .1, len) + gs.seg(.24, 0, .24, len), 'stroke-width=".9"');
  const al = new K.Face([gx - hw + .04, yf - .02, ZE - .05], [1, 0, 0], [0, 0, 1], 2 * hw - .08, .25, [0, 1, 0], [[0, 0], [2 * hw - .08, 0], [hw - .04, .25]]);
  al.fill(M.krem).put(7, 'Ln ' + K.ks(M.altin), `M${al.P(hw - .04, .1)}h.1`, 'stroke-width="4.6"').put(7.1, 'Ln ' + K.ks(MAVI), `M${al.P(hw - .04, .1)}h.1`, 'stroke-width="2"');
  b.item([gx - hw, yb, ZT, gx + hw, yf, ZT + .1], () =>            // sıralama kutusu çatının ÜSTÜNDE: hep çatıdan sonra çizilsin
    pth(T(KIR, K.toneOf(K.unit([-(zt - ZE), 0, hw]))), 'M' + PL([[gx, yb, zt], [gx, yf, zt], [gx - hw, yf, ZE], [gx - hw, YE, ZE]]) + 'Z') + al.svg() + gs.svg()
    + pth(T(TAH, TLt - .04), 'M' + PL([[gx - hw, yf, ZE], [gx, yf, zt], [gx + hw, yf, ZE], [gx + hw, yf, ZE - .08], [gx, yf, zt - .085], [gx - hw, yf, ZE - .08]]) + 'Z')
    + pth(T(KIR, K.toneOf([1, 0, 0]) - .06), 'M' + PL([[gx + hw, yf, ZE], [gx + hw, YE, ZE], [gx + hw, YE, ZA], [gx + hw, yf, ZA]]) + 'Z')
    + ln(T(KIR, .3), 'M' + PL([[gx, yb, zt], [gx, yf, zt]]), 1.6), { pts: [[gx - hw, yf, ZE], [gx + hw, yf, ZE], [gx, yf, zt], [gx, yb, zt]] });
  // mahya topuzları ve rüzgâr balığı
  for (const x of [.59, 3.41]) b.art(x, YM, ZT, nk(T(M.altin, -.1), [[0, -2]], 4.4), { bb: [x - .08, YM - .08, ZT, x + .08, YM + .08, ZT + .2] });
  b.art(gx, YM, ZT, ln(M.demir, 'M0 0V-4.6', 1.1) + pth(T(M.altin, -.1), 'M-7 -6.6q3.4 -3.6 7.6 -.2l3.4 -2.4v5.4l-3.4 -2.4q-4.2 3.2 -7.6 -.4z') + ln(T(M.altin, .4), 'M-5 -7.2q2 -1.2 4 -.6', .9), { bb: [gx - .3, YM - .05, ZT, gx + .3, YM + .05, ZT + .3] });
  b.critter('kedi', 1.2, YM, ZT - .02, { col: '#4f4a4c' }).critter('guvercin', 2.96, YM, ZT, { flip: true });

  /* --- çan: sağ direkte dövme demir kolda pirinç çan, ipi sarkar --- */
  b.line3([[3.26, YM, 1.4], [3.68, YM, 1.4]], M.demir, 1.5).line3([[3.26, YM, 1.14], [3.4, YM, 1.22], [3.54, YM, 1.4]], M.demir, 1.2);
  b.fx('bell', 3.62, YM, 1.39, { s: 1 });
  b.line3([[3.62, YM, 1.13], [3.62, YM, .66]], '#cdb98c', .9);
  b.art(3.62, YM, .66, pth(MUH, 'M-1.2 0h2.4l.8 4.4h-4z'), { bb: [3.58, YM - .04, .5, 3.66, YM + .04, .66] });

  /* --- insanlar --- */
  // kâtip: kaidenin üstünde, sırtı bize dönük, yeni ilanı çakıyor; koltuğunun altında tomar
  b.fig(1.36, 1.25, .24, { body: M.lacivert, robe: true, hat: 'sarik', hatCol: '#f2e8d2' });
  b.art(1.36, 1.25, .24, nk('#3a2c24', [[0, -18.5]], 5.8) + ln(T(M.lacivert, .16), 'M3.4 -14.6L6.2 -20.6', 2) + nk(M.ten, [[6.4, -21.2]], 2.1) + ln(M.ahsapK, 'M6.4 -21.4l2.8 -2.8', 1) + ln(T(M.demir, -.1), 'M8.4 -25l2.2 1.4', 2)
    + ln(KAG[2], 'M-8 -11.2l4.6 -1.6', 2), { bb: [1.22, 1.11, .24, 1.5, 1.39, 1.1] });
  // balıkçı: basamakta, elinde balık, panoyu gösteriyor
  b.fig(2.25, 1.66, .11, { body: '#3f8a6a', legs: '#5a4a3c', hat: 'hasir', carry: 'balik' });
  b.art(2.25, 1.66, .11, ln(T('#3f8a6a', .14), 'M-3.6 -14.6L-6.6 -20.4', 2) + nk(M.ten, [[-6.9, -21]], 2.1), { bb: [2.11, 1.52, .11, 2.39, 1.8, .95] });
  // sokak köpeği: oturmuş, balıkçının balığına bakıyor
  b.art(2.86, 1.98, 0, golge(5.6, 2) + ln('#b08a56', 'M5.4 -1.4q3.2 -.4 3.4 -3.6', 1.4) + pth('#c9a06a', 'M-1.6 0q-1.2 -5.6 1.6 -7.8q3.4 -1 4.8 2.4q1.2 3.2 .4 5.4z' + K.circ(-.6, -9.2, 2.4) + 'M-2.4 -10.2l-3 .2l.3 1.8l3 .4z')
    + pth('#7a5430', 'M.8 -11.2l2.2 -.5l-.3 3.4zM-5.9 -10.3l1.3 -.1l.1 1.1zM-2.3 -10.4h1v1h-1z'), { bb: [2.72, 1.86, 0, 3.0, 2.12, .42] });

  /* --- çevre: bank, hasır şapka, saksılar, tomar sepeti, güvercinler --- */
  b.bench(.86, 2.34, 0, 'x', { l: 1.0 });
  b.art(1.06, 2.34, .22, pth('#d9b866', K.ell(0, -1, 4.6, 1.8)) + pth('#c08a3e', 'M-2.2 -1.2q2.2 -3.8 4.4 0z'), { bb: [.94, 2.24, .22, 1.18, 2.44, .36] });
  const saksi = (x, y, col, fl) => b.art(x, y, 0, golge(6, 2.2) + pth(T(col, -.3), 'M-3.2 0q-3.8 -5 -1.2 -9.4h8.8q2.6 4.4 -1.2 9.4z') + pth(T(col, .1), 'M-3.2 0q-3.8 -5 -1.2 -9.4h4q-1.8 4.8 -.6 9.4z')
    + nk(T(M.sarmasik, -.3), [[0, -13.4], [-4.8, -11], [5.2, -11.2]], 10.4) + nk(M.sarmasik, [[-1, -14.6], [-5.4, -12], [4.2, -12.4]], 7) + nk(T(M.sarmasik, .34), [[-2.4, -16.4], [-6.2, -13]], 3.2)
    + nk(fl, [[-6.2, -10.8], [-2.4, -13], [1.6, -16.4], [5, -12.6], [-4.6, -15.6]], 2.3), { bb: [x - .14, y - .14, 0, x + .14, y + .14, .75] });
  saksi(.38, 1.72, M.kiremitA, M.begonvil); saksi(3.72, 1.6, M.mavi, '#f2d27a');
  b.art(3.26, 1.74, 0, golge(6.4, 2.4) + ln(KAG[2], 'M-2.8 -7l-2.2 -6.4M.2 -7v-8M3 -7l2.6 -5.6', 2.4) + ln(KAG[1], 'M-1.2 -7l-.8 -5', 2.2) + ln(MUH, 'M-4.6 -10.6l2.2 -.8M-.9 -12h2.2M3.6 -10l2 1', 1)
    + pth(T(M.saz, -.24), 'M-5.6 -8h11.2l-1 7q-4.6 2 -9.2 0z') + pth(M.saz, 'M-5.6 -8h5.6v8.4q-2.4 0 -4.6 -1.4z'), { bb: [3.12, 1.6, 0, 3.4, 1.88, .6] });
  b.fx('birds', 1.85, 2.62, 0, { n: 3 });

  b.tag(2, 2.9, 0).doorAt(2.05, 2.1);
});
