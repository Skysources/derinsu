/* Balık Hali — rıhtım meydanında taş kemerli kapalı çarşı (gotik): iki basamaklı kara taş kaide, kalın ayaklı sivri kemerli revak,
   dik arduvaz kırma çatı, üstünde panjurlu küçük fiyal ve demir balık yelkovanı. Arka sağ köşede tonozlu taş buzhane.
   +y (aydınlık) ve +x (gölge) yüzleri kemerlidir; kemerlerde demir kancalar, ağlar, koyu kan kırmızısı bezler.
   Işık: içerideki mangal (kemerin altından taşar) ve köşe kemerinde asılı tek fener. Parsel 6.5 × 6.5. */
CK.def('hal', { w: 6.5, d: 6.5, name: 'Balık Hali' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, P = K.P, pr = K.pr, f1 = K.f1;
  const X0 = .4, X1 = 4.8, Y0 = .7, Y1 = 4.1, TH = .26, ZF = .3, WH = 1.86, ZT = ZF + WH, EAVE = 2.24, AH = 1.46, PIER = .32;
  const TAS = M.gTas, TK = M.gTasK, TA = M.gTasA, KR = M.gKara, DM = M.gDemir, AH_ = M.gAhsap, AK = M.gAhsapK;
  const GUM = '#8b98a2', PEM = '#9a5a50', LAC = '#3a4450', BUZ = '#a9b4b8', IP = '#5a4e40';

  /* --- zemin: ıslak kara rıhtım taşı, gider oluğu --- */
  b.gpoly([[0, 4.5], [5.2, 4.5], [5.2, 0], [6.5, 0], [6.5, 6.5], [0, 6.5]], TK);
  { let d = ''; const r = K.rng(31);
    for (let y = 4.95; y < 6.5; y += .5) d += `M${P(0, y)} ${P(6.5, y)}`;
    for (let x = 5.65; x < 6.5; x += .45) d += `M${P(x, 0)} ${P(x, 4.5)}`;
    for (let i = 0; i < 15; i++) { const x = r() * 6.2, y = 4.5 + Math.floor(r() * 4) * .5; d += `M${P(x, y)} ${P(x, Math.min(6.5, y + .5))}`; }
    for (let i = 0; i < 7; i++) { const y = r() * 4.2, x = 5.2 + Math.floor(r() * 3) * .45; d += `M${P(x, y)} ${P(Math.min(6.5, x + .45), y)}`; }
    b.ground(ln(T(TK, -.2), d, .7)); }
  const blob = (cx, cy, rx, ry, sd, col, op) => { const r = K.rng(sd), n = 7, q = []; for (let i = 0; i < n; i++) { const a = i / n * 6.283, k = .78 + r() * .4; q.push(pr(cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k)); }
    let d = `M${f1((q[n - 1][0] + q[0][0]) / 2)} ${f1((q[n - 1][1] + q[0][1]) / 2)}`; for (let i = 0; i < n; i++) { const p = q[i], nx = q[(i + 1) % n]; d += `Q${f1(p[0])} ${f1(p[1])} ${f1((p[0] + nx[0]) / 2)} ${f1((p[1] + nx[1]) / 2)}`; }
    b.ground(pth(col, d + 'Z', `opacity="${op}"`)); };
  blob(2.6, 5.45, 1.9, .75, 3, '#3a454e', .5); blob(5.75, 4.3, .75, 1.5, 5, '#3a454e', .5); blob(5.85, 2.2, .55, 1.3, 9, '#3a454e', .42); blob(.9, 5.3, .7, .5, 12, '#3a454e', .36);
  [[1.7, 5.82, 1.3], [2.5, 5.95, .7], [3.5, 5.78, .8], [.5, 5.5, .6]].forEach(([x, y, l]) => b.gpoly([[x, y], [x + l, y + .03], [x + l + .1, y + .1], [x + .12, y + .08]], '#8a979c', { op: .22 }));
  b.ground(K.dots(M.gYosun, [[.2, 4.6], [5.3, .3], [6.3, 1.4], [6.4, 6.3], [3.9, 6.4]].map(p => pr(...p)), 2.4));
  b.spill(1.15, 4.6, 1.35, { op: .75 });                                                                         // mangalın ışığı kemerden taşar

  /* --- kaide: iki basamak kara taş --- */
  const jo = (f, st) => { let d = ''; for (let a = st * .6; a < f.w - .05; a += st) d += f.seg(a, 0, a, f.h); f.put(2.5, 'Ln ' + K.ks(f.c(f.mc, -.12)), d, 'stroke-width=".7"'); };
  const s1 = b.box(X0 - .2, Y0 - .2, 0, X1 + .4, Y1 + .4, .15, KR, { edge: false }); jo(s1.L, .62); jo(s1.R, .62);
  const s2 = b.box(X0 - .2, Y0 - .2, .15, X1 + .2, Y1 + .2, ZF, TK, { edge: false }); jo(s2.L, .62); jo(s2.R, .62);
  // iç döşeme: çatı altı karanlık; mangalın önünde sıcak bir leke
  const FL = T(TK, -.1), fl = s2.T;
  fl.rect(.2, .2, 4.4, 3.4, FL, 3, -.44);
  { let d = ''; for (let k = 1; k < 3; k++) d += fl.seg(.2, 3.38 - k * .55, 4.38, 3.38 - k * .55) + fl.seg(4.38 - k * .55, .2, 4.38 - k * .55, 3.38);
    for (let a = .5; a < 4.4; a += .55) d += fl.seg(a, 2.28, a, 3.38); for (let c = .5; c < 2.2; c += .55) d += fl.seg(3.28, c, 4.38, c);
    fl.put(3.2, 'Ln ' + K.ks(fl.c(FL, -.56)), d, 'stroke-width=".7"'); }
  { const c = fl.q(.7, 3.05), d = K.ell(c[0], c[1], 17, 8.5); fl.put(3.5, K.kf(M.gKor), d, 'opacity=".2"').put(3.55, K.kf(M.gAtes), K.ell(c[0], c[1], 9, 4.5), 'opacity=".22"'); }
  // arka duvarların iç yüzleri (kemerlerden görünür): karanlık taş
  { const iA = new K.Face([X0, Y0 + TH, ZF], [1, 0, 0], [0, 0, 1], X1 - X0, WH, [0, 1, 0]), iB = new K.Face([X0 + TH, Y1, ZF], [0, -1, 0], [0, 0, 1], Y1 - Y0, WH, [1, 0, 0]);
    iA.fill(TAS, -.42); iB.fill(TAS, -.36); iB.mc = iA.mc = TAS; iB.courses({ rh: .31, dens: .4, dt: -.5 }).band(0, .14, KR, -.4);
    b.item([X0, Y0, ZF, X1, Y0 + TH, ZT], () => iA.svg(), { cast: false }); b.item([X0, Y0, ZF, X0 + TH, Y1, ZT], () => iB.svg(), { cast: false }); }

  /* --- içeride mangal: üç ayaklı demir tas, kor, alev (giriş kemerinin altında görünür) --- */
  { const x = .62, y = 3.6, z = ZF, p = pr(x, y, z + .34);
    b.item([x - .2, y - .2, z, x + .2, y + .2, z + .4], ln(DM, `M${P(x - .16, y + .1, z)} ${P(x, y, z + .3)}M${P(x + .16, y + .1, z)} ${P(x, y, z + .3)}M${P(x, y - .16, z)} ${P(x, y, z + .3)}`, 1.3)
      + pth(DM, `M${f1(p[0] - 7)} ${f1(p[1])}Q${f1(p[0])} ${f1(p[1] + 7)} ${f1(p[0] + 7)} ${f1(p[1])}Z`) + pth(M.gKor, K.ell(p[0], p[1], 6, 2.2)) + K.dots(M.gMum, [[p[0] - 2, p[1] - .4], [p[0] + 2.4, p[1] + .3]], 1.4), { cast: false });
    b.fx('fire', x, y, z + .36, { s: .55 }); }

  /* --- revak: kalın taş ayaklar, sivri kemerler, kemer halkası, kilit taşı --- */
  const dress = (f, a0, a1, n) => {
    const span = (a1 - a0 - PIER * (n + 1)) / n;
    f.courses({ rh: .2, bw: .5, dens: .6, b0: AH + .04 }).stones(4, { rh: .2, b0: AH + .06 });
    f.arcade(a0, a1, n, AH, { pier: PIER, kind: 'point', th: TH, thru: true, floor: TK, ring: true, cap: false });
    for (let i = 0; i < n; i++) { const oa = a0 + PIER + i * (span + PIER);
      f.put(2.6, K.kf(f.c(TA, -.02)), f.shapeD('point', oa - .08, 0, span + .16, AH + .1) + f.shapeD('point', oa, 0, span, AH), 'fill-rule="evenodd"');       // açık taş söve (halka)
      f.rect(oa + span / 2 - .05, AH - .02, .1, .14, TA, 6.4, .04); }
    for (let i = 0; i <= n; i++) { const pa = a0 + i * (span + PIER); if (pa < -.01) continue; f.rect(pa - .02, 0, PIER + .04, .14, KR, 2.5, 0); }
    f.band(WH - .16, .08, TK, .06, 2.7).shadeTop(.2);
  };
  // kemer tepesinden sarkan demir kanca (+ asılı balık)
  const hook = (f, a, e, len, fish) => { const z = AH - .02; f.line([[a, z, e], [a, z - len, e]], DM, .8, 7).line([[a, z - len, e], [a, z - len - .06, e], [a + .05, z - len - .03, e]], DM, 1.1, 7.1);
    if (fish) f.poly([[a, z - len - .04, e], [a + .045, z - len - .15, e], [a + .012, z - len - .26, e], [a + .045, z - len - .33, e], [a - .045, z - len - .33, e], [a - .012, z - len - .26, e], [a - .045, z - len - .15, e]], fish, 7.4, .06); };

  /* --- içerisi: köşe kemerinden görünen taş tartı masası --- */
  b.table(4.22, 2.95, ZF, { s: .5, col: TA });
  b.art(4.22, 2.95, ZF + .35, pth(GUM, 'M-6 -1q3 -3 8 -1l3 -1.6l-.6 2.6l.6 2l-3 -1.2q-5 2 -8 -.8z') + pth(LAC, 'M-6 -1q3 -3 8 -1q-4 -.8 -8 1z'), { r: .2, h: .1 });

  /* --- ön revaklar --- */
  const wx = b.box(X1 - TH, Y0, ZF, X1, Y1 - TH, ZT, TAS, { T: null, edge: false }); dress(wx.R, -PIER, Y1 - TH - Y0, 3);
  const wy = b.box(X0, Y1 - TH, ZF, X1, Y1, ZT, TAS, { T: null }); dress(wy.L, 0, X1 - X0, 4);
  const L = wy.L, R = wx.R, C = wy.R;
  C.courses({ rh: .31, dens: .5 }).rect(0, 0, TH, .14, KR, 2.5, 0).shadeTop(.2);
  // 2. göz: kemere asılı demir terazi
  { const c = 1.69, e = -.11, br = M.gBronz;
    L.line([[c, AH - .1, e], [c, 1.1, e]], DM, 1, 7).line([[c - .26, 1.06, e], [c + .26, 1.1, e]], br, 2, 7.2, .04).dot(c, 1.08, 1.6, br, 7.3, .1, e);
    L.line([[c - .37, .68, e], [c - .26, 1.06, e], [c - .15, .68, e]], DM, .7, 7.1).line([[c + .15, .72, e], [c + .26, 1.1, e], [c + .37, .72, e]], DM, .7, 7.1);
    L.poly([[c - .39, .68, e], [c - .13, .68, e], [c - .18, .6, e], [c - .34, .6, e]], br, 7.4, .06).poly([[c + .13, .72, e], [c + .39, .72, e], [c + .34, .64, e], [c + .18, .64, e]], br, 7.4, .06);
    L.poly([[c - .36, .68, e], [c - .27, .75, e], [c - .17, .7, e], [c - .13, .75, e], [c - .14, .68, e]], GUM, 7.5, .06).rect(c + .2, .72, .07, .08, DM, 7.5).rect(c + .28, .72, .05, .05, DM, 7.5); }
  // 3. göz ve köşe kemerleri: demir kancalar, asılı balıklar; sütunlar arasında kurumaya serilmiş ağ
  hook(L, 2.55, -.1, .32, '#6e6656'); hook(L, 2.72, -.1, .2, false); hook(L, 2.9, -.1, .4, '#7a705e');
  hook(R, 2.3, -.1, .24, '#6e6656'); hook(R, 2.62, -.1, .38, '#7a705e'); hook(R, 1.3, -.1, .34, false); hook(R, 1.52, -.1, .22, '#6e6656');
  { const a0 = 3.4, a1 = 4.18, e = -.06, q = []; for (let i = 0; i <= 6; i++) { const t = i / 6; q.push([a0 + (a1 - a0) * t, 1.28 - Math.sin(t * Math.PI) * .2, e]); }
    L.poly(q.concat([[a1, .5, e], [a0 + (a1 - a0) * .7, .62, e], [a0 + (a1 - a0) * .35, .54, e], [a0, .6, e]]), IP, 7.2, -.06);
    let m = ''; for (let i = 0; i < 7; i++) { const a = a0 + i * .12; m += `M${L.P(a, 1.24, e)} ${L.P(a + .14, .56, e)}M${L.P(a + .12, 1.24, e)} ${L.P(a - .02, .56, e)}`; }
    L.put(7.3, 'Ln ' + K.ks(T(IP, -.3)), m, 'stroke-width=".5"').dots([[a0 + .1, 1.2, e], [a0 + .4, 1.1, e], [a0 + .7, 1.18, e]], 2.4, M.gKanK, 7.4); }
  // köşe kemerinde asılı tek fener (zayıf ışık)
  R.line([[.36, AH - .02, -.1], [.36, 1.12, -.1]], DM, .8, 7.9).lantern(.36, 1.02, { out: -.1, r: 12 });

  /* --- tenteler: koyu kan kırmızısı bez, uçları direkli --- */
  const AW = { out: .7, drop: .3, cols: [M.gKanK, T(M.gKanK, -.14)], stripe: .55, val: .1 };
  [[1.52, 4.78], [3.68, 4.78]].forEach(([x, y]) => b.line3([[x, y, 0], [x, y, .98]], AK, 1.6));
  [[5.48, 2.91], [5.48, 1.0]].forEach(([x, y]) => b.line3([[x, y, 0], [x, y, .98]], AK, 1.6));
  b.awning(L, 1.1, .94, 2.2, AW); b.awning(R, .95, .94, 1.95, AW);

  /* --- buzhane: kara taş oda, arduvaz tonoz, sivri demir kapı --- */
  const bz = b.box(5.25, .05, 0, 6.4, .95, 1.2, TAS);
  bz.L.courses({ rh: .27, bw: .5, dens: .45 }).stones(3, { rh: .27 }).band(0, .24, KR, 0);
  bz.R.courses({ rh: .27, bw: .5, dens: .35 }).band(0, .24, KR, 0);
  bz.L.door(.42, .46, .9, { kind: 'point', col: AK, sove: TA });
  bz.R.win(.36, .5, .16, .4, { kind: 'point', sove: TA, frame: DM, bars: [1, 2], lit: false });
  const tv = b.vault(5.2, 0, 6.45, 1.0, 1.2, .5, M.gCati, { axis: 'x', wall: TAS, step: .42 });
  tv.G.shp('point', .4, .08, .2, .28, DM, 4).shp('point', .44, .1, .12, .22, T(KR, -.3), 5);
  // kapı önünde saman örtülü buz kalıpları
  b.box(5.3, 1.02, 0, 5.62, 1.3, .24, BUZ, { edge: false, T: T(BUZ, .1) }); b.box(5.36, 1.04, .24, 5.6, 1.26, .42, BUZ, { edge: false, T: '#5e5440' });

  /* --- tezgâh: sehpa ayaklı, müşteriye eğik taş tabla --- */
  const fish = (f, a, c, l, w, ax) => 'M' + [[0, 0], [w / 2, .4 * l], [.36 * w, l], [0, .78 * l], [-.36 * w, l], [-w / 2, .4 * l]].map(q => ax ? f.P(a + q[1], c + q[0]) : f.P(a + q[0], c + q[1])).join(' ') + 'Z';
  const counter = (x0, y0, x1, y1, dir) => { const zl = .4, zh = .6, th = .06; let f, lip, end, legs, nl, ne;
    if (dir === 'y') { const d = y1 - y0; f = new K.Face([x0, y1, zl], [1, 0, 0], K.unit([0, -d, zh - zl]), x1 - x0, Math.hypot(d, zh - zl), K.unit([0, zh - zl, d]));
      lip = [[x0, y1, zl], [x1, y1, zl], [x1, y1, zl - th], [x0, y1, zl - th]]; end = [[x1, y1, zl], [x1, y0, zh], [x1, y0, zh - th], [x1, y1, zl - th]]; nl = [0, 1, 0]; ne = [1, 0, 0];
      legs = [[x0 + .08, y0 + .07, zh], [x1 - .08, y0 + .07, zh], [x0 + .08, y1 - .07, zl], [x1 - .08, y1 - .07, zl]]; }
    else { const d = x1 - x0; f = new K.Face([x1, y1, zl], [0, -1, 0], K.unit([-d, 0, zh - zl]), y1 - y0, Math.hypot(d, zh - zl), K.unit([zh - zl, 0, d]));
      lip = [[x1, y1, zl], [x1, y0, zl], [x1, y0, zl - th], [x1, y1, zl - th]]; end = [[x0, y1, zh], [x1, y1, zl], [x1, y1, zl - th], [x0, y1, zh - th]]; nl = [1, 0, 0]; ne = [0, 1, 0];
      legs = [[x0 + .07, y0 + .08, zh], [x0 + .07, y1 - .08, zh], [x1 - .07, y0 + .08, zl], [x1 - .07, y1 - .08, zl]]; }
    f.fill(AH_); f.rect(.04, .04, f.w - .08, f.h - .07, T(TA, .04), 3);
    b.gpoly([[x0, y0], [x1, y0], [x1 + .25, y1 - .2], [x1, y1], [x0, y1]], '#14181e', { op: .3 });
    b.item([x0, y0, 0, x1, y1, zh], () => ln(AK, legs.map(q => `M${P(q[0], q[1], 0)} ${P(q[0], q[1], q[2] - th)}`).join('') + `M${P(legs[2][0], legs[2][1], .14)} ${P(legs[3][0], legs[3][1], .14)}`, 1.7)
      + pth(T(AH_, K.toneOf(nl) - .06), `M${K.PL(lip)}Z`) + pth(T(AH_, K.toneOf(ne) - .06), `M${K.PL(end)}Z`) + f.svg(), { pts: [[x0, y0, zh], [x1, y0, zh], [x1, y1, zl], [x0, y1, zl]] });
    return f; };

  /* --- +y önü: tezgâh, balıkçı, müşteri, hamal, kedi --- */
  b.fig(2.3, 4.86, 0, { body: '#4e4a44', legs: '#2a2826', hat: 'none', hair: '#1e1a18' });
  b.art(2.3, 4.86, 0, pth('#2e2a28', 'M-2.7 -14.4h5.4l.7 7.6h-6.8z'), { bb: [2.2, 4.76, 0, 2.4, 4.96, .8] });
  b.critter('kedi', 3.2, 5.48, 0, { col: '#2a2828' });
  const fy = counter(1.55, 5.07, 3.5, 5.62, 'y');
  { let sv = '', pk = '', bl = '', st = '', sb = '';
    fy.poly([[.05, .04], [.64, .04], [.64, .53], [.4, .5], [.22, .54], [.05, .5]], BUZ, 4, .04).poly([[1.3, .04], [1.9, .04], [1.9, .5], [1.74, .55], [1.5, .51], [1.29, .54]], BUZ, 4, .04);
    for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) { const a = .12 + i * .135 + r * .05, c = .04 + r * .25; sv += fish(fy, a, c, .27, .115); sb += `M${fy.P(a + .025, c + .05)} ${fy.P(a + .03, c + .19)}`; }
    for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) pk += fish(fy, .75 + i * .1 + (r % 2) * .04, .05 + r * .17, .16, .07);
    for (let i = 0; i < 3; i++) { const c = .13 + i * .16; bl += fish(fy, 1.34 + (i % 2) * .05, c, .48, .1, 1); st += `M${fy.P(1.4 + (i % 2) * .05, c + .025)} ${fy.P(1.7 + (i % 2) * .05, c + .03)}`; }
    fy.put(6, K.kf(fy.c(GUM)), sv + bl).put(6, K.kf(fy.c(PEM)), pk).put(6.2, 'Ln ' + K.ks(fy.c(LAC)), st, 'stroke-width="1.3"').put(6.2, 'Ln ' + K.ks(fy.c('#4a5560')), sb, 'stroke-width="1"');
    fy.rect(.655, .04, .035, .5, AH_, 5, -.1).rect(1.245, .04, .035, .5, AH_, 5, -.1); }
  b.fig(2.85, 6.08, 0, { body: '#4a2a2a', robe: true, hat: 'ortu', hatCol: '#2a2628', carry: 'sepet', flip: true });
  b.fig(4.3, 5.55, 0, { body: '#3e4448', legs: '#2a2624', hat: 'none', hair: '#241e1a', step: 1, carry: 'kasa' });
  // 4. gözün önü: buzlu sandıklar, kuyruklar
  b.crate(3.95, 4.75, 0, .42, { col: AH_, fill: BUZ }).crate(4.4, 4.72, 0, .36, { col: T(AH_, .1), fill: BUZ });
  const tails = 'M-4 -2l-1.6 -4.4l2.4 1.4l1.6 -2l.4 4.6zM2 -1.4l.4 -4.6l1.8 1.8l2.2 -1l-1.6 4.2z';
  b.art(3.95, 4.75, .34, pth('#6e7880', tails), { r: .2, h: .2 }).art(4.4, 4.72, .29, pth('#76808a', tails), { r: .18, h: .2 });
  // giriş yanı: midye sepetleri, fıçı
  const basket = (x, y, heap) => { b.cyl(x, y, .17, 0, .18, '#5e5240', { top: heap, cast: false }).band(.07, .03, '#4a402e'); const p = pr(x, y, .18);
    b.item([x - .1, y - .1, .18, x + .1, y + .1, .3], pth(heap, K.ell(p[0], p[1] - 1.2, 4.6, 2.6)) + pth(T(heap, .3), K.circ(p[0] - 2, p[1] - 2.2, .9) + K.circ(p[0] + 1.4, p[1] - 1.4, .8) + K.circ(p[0] + .2, p[1] - 3, .8)), { cast: false }); };
  basket(.3, 4.78, '#22262e'); basket(.62, 5.02, '#22262e'); basket(.2, 5.2, '#5a3428');
  b.barrel(.14, 4.44, .15, { r: .13, h: .3, col: AK, top: AH_, cast: false });
  // ağ askısı: iki sırık, sarkan ağ, mantarlar
  b.line3([[.25, 6.05, 0], [.25, 6.05, .82]], AK, 1.6).line3([[1.45, 6.05, 0], [1.45, 6.05, .82]], AK, 1.6);
  { const q = (x, z) => P(x, 6.05, z); let m = '', fl = ''; for (let i = 0; i < 5; i++) { const x = .3 + i * .22; m += `M${q(x, .72)} ${q(x + .22, .16)}M${q(x + .22, .72)} ${q(x, .16)}`; if (i % 2 === 0) { const p = pr(x + .08, 6.05, .74 - Math.sin(i / 4 * 3.14) * .07); fl += K.circ(p[0], p[1], 1.3); } }
    b.item([.25, 6.03, .1, 1.45, 6.07, .8], pth(IP, `M${q(.25, .78)}Q${q(.85, .62)} ${q(1.45, .78)}L${q(1.42, .16)}Q${q(1.1, .06)} ${q(.85, .16)}Q${q(.55, .04)} ${q(.28, .16)}Z`, 'opacity=".4"') + ln(T(IP, -.2), m, .5, 'opacity=".8"') + ln(T(IP, -.3), `M${q(.25, .78)}Q${q(.85, .62)} ${q(1.45, .78)}`, .9) + pth(M.gKanK, fl), { cast: false }); }
  { const pot = pth('#5e5040', 'M-6.4 0Q-6.6 -9.6 0 -9.6Q6.6 -9.6 6.4 0Z') + pth(T('#5e5040', -.3), 'M1.4 -9.4Q6.6 -8.6 6.4 0H2.4Z') + ln('#3e3428', 'M-6.2 -3h12.4M-5.4 -6.2h10.8M-2.6 -9.2v9.2M2 -9.3v9.3', .6) + pth('#1e1a18', K.ell(0, -9.4, 1.8, .8));
    b.art(1.72, 6.12, 0, pot, { r: .2, h: .4 }).art(2.06, 6.3, 0, pot, { r: .2, h: .4 }).art(1.88, 6.2, .32, pot, { r: .18, h: .4 }); }

  /* --- köşe: canlı balık teknesi, demir tulumba, baba ve halat --- */
  const tk = b.box(5.35, 4.55, 0, 6.15, 5.25, .32, TK, { edge: false }); jo(tk.L, .4); tk.L.band(0, .07, KR, 0); tk.R.band(0, .07, KR, 0);
  b.pool(5.43, 4.63, 6.07, 5.17, .32, { col: '#34424c' });
  { const f = new K.Face([5.43, 4.63, .32], [1, 0, 0], [0, 1, 0], .64, .54, [0, 0, 1]); const d = fish(f, .1, .14, .26, .08, 1) + fish(f, .5, .3, -.24, .08, 1) + fish(f, .2, .42, .22, .07, 1);
    b.item([5.43, 4.63, .32, 6.07, 5.17, .36], pth('#1a2a32', d) + pth('#5a3a2a', fish(f, .34, .2, .16, .06, 1)), { cast: false }); }
  b.art(5.43, 4.6, .32, ln(DM, 'M0 0V-13M0 -10h5v2.4', 2) + ln(DM, 'M0 -13l-6 -4', 1.3) + pth(T(DM, .2), K.circ(0, -13.4, 1.5)), { bb: [5.36, 4.55, .32, 5.5, 4.66, .9] });
  b.fx('fall', 5.64, 4.6, .58, { w: .05, h: .24 }).fx('glint', 5.86, 4.96, .34);
  b.bollard(6.22, 5.82, 0, { r: .11, h: .32, col: DM }); b.cyl(6.22, 5.82, .14, .32, .37, DM, { cast: false });
  { const p = pr(5.9, 6.02, 0), c = '#6e6048'; b.item([5.7, 5.85, 0, 6.1, 6.2, .1], pth(T(c, -.3), K.ell(p[0], p[1], 9, 4.6)) + ln(c, K.ell(p[0], p[1] - 1, 8, 4) + K.ell(p[0], p[1] - 2.2, 5.6, 2.8) + K.ell(p[0], p[1] - 3.2, 3, 1.5), 1.5) + ln(c, `M${f1(p[0] + 8)} ${f1(p[1] - 1)}Q${f1(p[0] + 12)} ${f1(p[1] - 4)} ${P(6.2, 5.9, .12)}`, 1.4), { cast: false }); }

  /* --- +x önü: gölgedeki tezgâh, balıkçı, müşteri, sandıkta kuzgun --- */
  const fx = counter(5.62, 1.45, 6.17, 3.0, 'x');
  { let bl = '', st = '', sv = '', sb = '';
    for (let i = 0; i < 6; i++) { const a = .1 + i * .085; bl += fish(fx, a, .06 + (i % 2) * .05, .34, .075); st += `M${fx.P(a + .02, .12 + (i % 2) * .05)} ${fx.P(a + .02, .32 + (i % 2) * .05)}`; }
    fx.poly([[1.07, .04], [1.5, .04], [1.5, .5], [1.3, .54], [1.07, .5]], BUZ, 4, .1);
    for (let r = 0; r < 2; r++) for (let i = 0; i < 3; i++) { const a = 1.14 + i * .125 + r * .05, c = .04 + r * .25; sv += fish(fx, a, c, .26, .11); sb += `M${fx.P(a + .025, c + .05)} ${fx.P(a + .03, c + .18)}`; }
    fx.put(6, K.kf(fx.c(GUM, .1)), bl + sv).put(6.2, 'Ln ' + K.ks(fx.c(LAC, .1)), st, 'stroke-width="1.2"').put(6.2, 'Ln ' + K.ks(fx.c('#4a5560', .1)), sb, 'stroke-width="1"');
    [[.7, .12], [.8, .1], [.9, .14], [.74, .22], [.86, .24], [.95, .26], [.78, .33], [.9, .36], [.83, .44]].forEach(([a, c], i) => fx.dot(a, c, 1.7, i % 2 ? PEM : T(PEM, -.12), 6.5, .1));
    fx.rect(.6, .04, .035, .5, AH_, 5, -.1).rect(1.03, .04, .035, .5, AH_, 5, -.1); }
  b.fig(5.42, 3.42, 0, { body: '#4a4640', legs: '#2a2624', hat: 'none', hair: '#1e1a18', carry: 'balik' });
  b.art(5.42, 3.42, 0, pth('#2e3236', 'M-2.7 -14.4h5.4l.7 7.6h-6.8z'), { bb: [5.32, 3.32, 0, 5.52, 3.52, .8] });
  b.fig(6.33, 2.3, 0, { body: '#4a3e2e', legs: '#2a2624', hat: 'ortu', hatCol: '#2a2628', flip: true, carry: 'kova' });
  b.crate(6.15, 3.55, 0, .42, { col: AH_ }).crate(6.2, 3.98, 0, .36, { col: T(AH_, .1), fill: GUM }).critter('guvercin', 6.15, 3.55, .34, { col: '#26262b' });

  /* --- çatı: dik arduvaz kırma, ortada panjurlu fiyal, demir sivri uç ve balık yelkovanı (en sonda) --- */
  b.poly3([[X0 - .2, Y1 + .2, 2.2], [X1 + .2, Y1 + .2, 2.2], [X1 + .2, Y1 + .2, 2.1], [X0 - .2, Y1 + .2, 2.1]], AK, { n: [0, 1, 0], bb: [X0 - .2, Y1 + .18, 2.1, X1 + .2, Y1 + .2, 2.2] });
  b.poly3([[X1 + .2, Y1 + .2, 2.2], [X1 + .2, Y0 - .2, 2.2], [X1 + .2, Y0 - .2, 2.1], [X1 + .2, Y1 + .2, 2.1]], AK, { n: [1, 0, 0], bb: [X1 + .18, Y0 - .2, 2.1, X1 + .2, Y1 + .2, 2.2] });
  const RR = 1.3, zr = EAVE + RR;
  b.hip(X0 - .2, Y0 - .2, X1 + .2, Y1 + .2, EAVE, RR, M.gCati, { tex: 'rows', step: .19 });
  // damda tek çatı penceresi (sönük) ve yosun
  { const x = 2.3, y = Y1 - .3, z0 = EAVE + .42, lb = b.box(x - .2, y - .1, z0, x + .2, y + .16, z0 + .34, TK, { edge: false, cast: false, T: null });
    lb.L.win(.11, .03, .18, .26, { kind: 'point', frame: DM, lit: false, sill: false, bars: [1, 1] });
    b.gable(x - .2, y - .1, x + .2, y + .16, z0 + .34, .26, M.gCati, { axis: 'y', ov: .04, tex: false, wall: TK, cast: false }); }
  // fiyal: panjurlu taş kasnak, sivri arduvaz külah
  const fn = b.box(2.36, 2.16, zr - .22, 2.84, 2.64, zr + .42, TK, { edge: false });
  for (const f of [fn.L, fn.R]) { f.shp('point', .1, .1, .28, .48, T(KR, -.3), 4); let d = ''; for (let z = .18; z < .52; z += .08) d += `M${f.P(.1, z)} ${f.P(.38, z - .04)}`; f.put(5, 'Ln ' + K.ks(f.c(AK, .1)), d, 'stroke-width="1.2"'); }
  b.hip(2.3, 2.1, 2.9, 2.7, zr + .42, .78, M.gCati, { tex: false });
  const zv = zr + 1.2;
  b.art(2.6, 2.4, zv, ln(DM, 'M0 0V-14', 1.2) + pth(DM, K.circ(0, -3.4, 1.4)) + pth(DM, 'M-8 -11q4.4 -4.6 10 -1.6l3.6 -2.6l-.7 3.6l1 3.2l-3.9 -1.8q-5.4 3.2 -10 -.8z') + pth(DM, 'M-1 -14l1 -3.4l1 3.4z'), { bb: [2.5, 2.3, zv, 2.7, 2.5, zv + .5] });
  b.critter('guvercin', 3.3, 2.4, zr, { flip: true, col: '#26262b' });
  b.critter('kedi', 1.75, 3.62, EAVE + .25, { col: '#2a2828', flip: true });

  b.tag(5.6, 6.4, 0).doorAt(1.03, 4.8);
});
