/* Balık Hali — rıhtım meydanında dört yanı kemerli açık çarşı: iki basamaklı taş kaide, ince sütunlu revak,
   kırma kiremit çatı, üstünde panjurlu havalandırma feneri ve yaldızlı balık yelkovanı. Arka sağ köşede kurşun tonozlu buzhane.
   +y (aydınlık) ve +x (gölge) yüzleri açıktır; hayat tentelerin ucunda ve rıhtımdadır. Parsel 6.5 × 6.5. */
CK.def('hal', { w: 6.5, d: 6.5, name: 'Balık Hali' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, P = K.P, pr = K.pr, f1 = K.f1;
  const X0 = .4, X1 = 4.8, Y0 = .7, Y1 = 4.1, TH = .22, ZF = .3, WH = 1.6, ZT = ZF + WH, EAVE = 1.98, AH = 1.34, PIER = .22;
  const GUM = '#c6d1d9', PEM = '#e58f84', LAC = '#2f5c88', BUZ = '#e6f2f5';

  /* --- zemin: rıhtım taşı, ıslak ve parlayan döşeme, gider oluğu --- */
  b.gpoly([[0, 4.5], [5.2, 4.5], [5.2, 0], [6.5, 0], [6.5, 6.5], [0, 6.5]], M.parkeK);
  { let d = ''; const r = K.rng(31);
    for (let y = 4.95; y < 6.5; y += .5) d += `M${P(0, y)} ${P(6.5, y)}`;
    for (let x = 5.65; x < 6.5; x += .45) d += `M${P(x, 0)} ${P(x, 4.5)}`;
    for (let i = 0; i < 15; i++) { const x = r() * 6.2, y = 4.5 + Math.floor(r() * 4) * .5; d += `M${P(x, y)} ${P(x, Math.min(6.5, y + .5))}`; }
    for (let i = 0; i < 7; i++) { const y = r() * 4.2, x = 5.2 + Math.floor(r() * 3) * .45; d += `M${P(x, y)} ${P(Math.min(6.5, x + .45), y)}`; }
    b.ground(ln(T(M.parkeK, -.13), d, .7)); }
  const blob = (cx, cy, rx, ry, sd, col, op) => { const r = K.rng(sd), n = 7, q = []; for (let i = 0; i < n; i++) { const a = i / n * 6.283, k = .78 + r() * .4; q.push(pr(cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k)); }
    let d = `M${f1((q[n - 1][0] + q[0][0]) / 2)} ${f1((q[n - 1][1] + q[0][1]) / 2)}`; for (let i = 0; i < n; i++) { const p = q[i], nx = q[(i + 1) % n]; d += `Q${f1(p[0])} ${f1(p[1])} ${f1((p[0] + nx[0]) / 2)} ${f1((p[1] + nx[1]) / 2)}`; }
    b.ground(pth(col, d + 'Z', `opacity="${op}"`)); };
  blob(2.6, 5.45, 1.9, .75, 3, '#7d9fb0', .5); blob(5.75, 4.3, .75, 1.5, 5, '#7d9fb0', .5); blob(5.85, 2.2, .55, 1.3, 9, '#7d9fb0', .42); blob(.9, 5.3, .7, .5, 12, '#7d9fb0', .36);
  [[1.7, 5.82, 1.3], [2.5, 5.95, .7], [3.5, 5.78, .8], [.5, 5.5, .6], [4.4, 6.0, .5]].forEach(([x, y, l]) => b.gpoly([[x, y], [x + l, y + .03], [x + l + .1, y + .1], [x + .12, y + .08]], '#dcecef', { op: .4 }));
  [[5.75, 5.5, .5], [6.28, 2.3, .9], [5.3, 3.9, .5]].forEach(([x, y, l]) => b.gpoly([[x, y], [x + .08, y - l], [x + .16, y - l + .1], [x + .1, y + .1]], '#dcecef', { op: .36 }));
  b.spill(.95, 5.25, 1.4).spill(2.7, 6.0, 1.8).spill(5.6, 3.7, 1.4);

  /* --- kaide: iki basamak --- */
  const jo = (f, st) => { let d = ''; for (let a = st * .6; a < f.w - .05; a += st) d += f.seg(a, 0, a, f.h); f.put(2.5, 'Ln ' + K.ks(f.c(f.mc, -.12)), d, 'stroke-width=".7"'); };
  const s1 = b.box(X0 - .2, Y0 - .2, 0, X1 + .4, Y1 + .4, .15, M.tas, { edge: false }); jo(s1.L, .62); jo(s1.R, .62);
  const s2 = b.box(X0 - .2, Y0 - .2, .15, X1 + .2, Y1 + .2, ZF, M.tas, { edge: false }); jo(s2.L, .62); jo(s2.R, .62);
  // iç döşeme: çatı altı gölgede; gece içeriden aydınlık
  const FL = '#c9b998>#b5803f', fl = s2.T;
  fl.rect(.2, .2, 4.4, 3.4, FL, 3, -.44);
  { let d = ''; for (let k = 1; k < 3; k++) d += fl.seg(.2, 3.38 - k * .55, 4.38, 3.38 - k * .55) + fl.seg(4.38 - k * .55, .2, 4.38 - k * .55, 3.38);
    for (let a = .5; a < 4.4; a += .55) d += fl.seg(a, 2.28, a, 3.38); for (let c = .5; c < 2.2; c += .55) d += fl.seg(3.28, c, 4.38, c);
    fl.put(3.2, 'Ln ' + K.ks(fl.c(FL, -.56)), d, 'stroke-width=".7"'); }
  // kemerlerden içeri düşen güneş
  [[.62, 1.445], [3.755, 4.58]].forEach(([xa, xb]) => { const a = xa - .2, e = xb - .2, m = (a + e) / 2; fl.poly([[a + .05, 3.38], [e, 3.38], [e + .34, 2.9], [m + .44, 2.62], [a + .42, 2.9]], '#efe2bf>#b5803f', 3.4, -.1); });

  /* --- revak: sütun gövdesi, kaide, başlık, iki renkli kemer taşları, çini göbekler --- */
  const dress = (f, a0, a1, n, o = {}) => {
    const span = (a1 - a0 - PIER * (n + 1)) / n, r = span / 2, ys = AH - r;
    f.arcade(a0, a1, n, AH, { pier: PIER, th: TH, thru: true, floor: M.tas, ring: false });
    for (let i = 0; i <= n; i++) { const pa = a0 + i * (span + PIER); if (pa < -.01) continue;
      f.rect(pa + .025, .07, PIER - .05, ys - .1, M.mermer, 2.4, .04).rect(pa + PIER - .08, .07, .055, ys - .1, M.mermer, 2.45, -.16).rect(pa - .02, 0, PIER + .04, .08, M.tas, 2.5, -.05);
      f.dot(pa + PIER / 2, AH - .1, 2.3, M.turkuaz, 6.4).dot(pa + PIER / 2, AH - .1, .9, M.bez, 6.5, .2); }
    let v = ''; for (let i = 0; i < n; i++) { const ca = a0 + PIER + i * (span + PIER) + r, q = (t, rr) => f.P(ca - Math.cos(t) * rr, ys + Math.sin(t) * rr);
      for (let k = 0; k < 9; k += 2) { const t0 = Math.PI * k / 9, t1 = Math.PI * (k + 1) / 9; v += `M${q(t0, r)} ${q(t1, r)} ${q(t1, r + .09)} ${q(t0, r + .09)}Z`; } }
    f.put(6.3, K.kf(f.c('#d4906f')), v); f.shadeTop(.2);
  };

  /* --- içerisi: köşe kemerinden görünen mermer tartı masası, üstünde iri bir balık --- */
  b.table(4.22, 2.95, ZF, { s: .5, col: M.mermer });
  b.art(4.22, 2.95, ZF + .35, pth(GUM, 'M-6 -1q3 -3 8 -1l3 -1.6l-.6 2.6l.6 2l-3 -1.2q-5 2 -8 -.8z') + pth(LAC, 'M-6 -1q3 -3 8 -1q-4 -.8 -8 1z'), { r: .2, h: .1 });

  /* --- ön revaklar --- */
  const wx = b.box(X1 - TH, Y0, ZF, X1, Y1 - TH, ZT, M.kirec, { T: null, edge: false }); dress(wx.R, -PIER, Y1 - TH - Y0, 3);
  const wy = b.box(X0, Y1 - TH, ZF, X1, Y1, ZT, M.kirec, { T: null }); dress(wy.L, 0, X1 - X0, 4);
  const L = wy.L, R = wx.R, C = wy.R, ysR = AH - .42;
  C.rect(.025, .07, PIER - .05, ysR - .1, M.mermer, 2.4, .04).rect(.14, .07, .055, ysR - .1, M.mermer, 2.45, -.16).rect(-.02, 0, PIER + .04, .08, M.tas, 2.5, -.05).rect(-.03, ysR - .05, PIER + .06, .09, M.kirec, 6.5, .16).shadeTop(.2);
  C.dot(PIER / 2, AH - .1, 2.3, M.turkuaz, 6.4);
  L.lantern(4.29, 1.02).lantern(.11, 1.02); R.lantern(3.07, 1.02);
  // 1. göz: kemere asılı büyük pirinç terazi
  { const c = .22 + .4125, e = -.11, br = M.bronz;
    L.line([[c, AH, e], [c, 1.08, e]], M.demir, 1, 7).line([[c - .26, 1.04, e], [c + .26, 1.08, e]], br, 2, 7.2, .1).dot(c, 1.06, 1.6, M.altin, 7.3, .2, e);
    L.line([[c - .37, .66, e], [c - .26, 1.04, e], [c - .15, .66, e]], M.demir, .7, 7.1).line([[c + .15, .7, e], [c + .26, 1.08, e], [c + .37, .7, e]], M.demir, .7, 7.1);
    L.poly([[c - .39, .66, e], [c - .13, .66, e], [c - .18, .58, e], [c - .34, .58, e]], br, 7.4, .12).poly([[c + .13, .7, e], [c + .39, .7, e], [c + .34, .62, e], [c + .18, .62, e]], br, 7.4, .12);
    L.poly([[c - .36, .66, e], [c - .27, .73, e], [c - .17, .68, e], [c - .13, .73, e], [c - .14, .66, e]], GUM, 7.5, .1).rect(c + .2, .7, .07, .08, M.demir, 7.5).rect(c + .28, .7, .05, .05, M.demir, 7.5); }
  // 4. göz: sütunlar arasına gerili ipte kurutulmuş balıklar ve ahtapot
  { const c = 3.355 + .4125, e = -.08; L.line([[c - .39, 1.06, e], [c, 1.0, e], [c + .39, 1.06, e]], '#6a5a4a', .8, 7);
    [-.29, -.16, .16, .29].forEach((o, i) => { const a = c + o, t = 1.04 - Math.abs(o) * .06; L.poly([[a, t, e], [a + .045, t - .11, e], [a + .012, t - .22, e], [a + .045, t - .29, e], [a - .045, t - .29, e], [a - .012, t - .22, e], [a - .045, t - .11, e]], i % 2 ? '#c99a58' : '#b9814a', 7.4, .1); });
    L.dot(c, .93, 2.6, '#b0627f', 7.4, .1, e).line([[c - .05, .9, e], [c - .09, .7, e], [c - .06, .6, e]], '#b0627f', 1.1, 7.3, .1).line([[c, .9, e], [c, .64, e]], '#b0627f', 1.1, 7.3, .1).line([[c + .05, .9, e], [c + .09, .72, e], [c + .07, .62, e]], '#b0627f', 1.1, 7.3, .1); }

  /* --- tenteler: sütun başlığı hizasından, lacivert-beyaz, uçları direkli; kemerler üstte açık kalır --- */
  const AW = { out: .7, drop: .26, cols: [M.bezM, M.bez], stripe: .275 };
  [[1.52, 4.78], [3.68, 4.78]].forEach(([x, y]) => b.line3([[x, y, 0], [x, y, .98]], M.ahsapK, 1.5));
  [[5.48, 2.91], [5.48, 1.0]].forEach(([x, y]) => b.line3([[x, y, 0], [x, y, .98]], M.ahsapK, 1.5));
  b.awning(L, 1.1, .94, 2.2, AW); b.awning(R, .95, .94, 1.95, AW);

  /* --- buzhane: taş oda, kurşun tonoz --- */
  const bz = b.box(5.25, .05, 0, 6.4, .95, 1.1, M.tas);
  bz.L.courses({ rh: .27, bw: .5, dens: .45 }).stones(3, { rh: .27 }).band(0, .24, M.tasK, 0);
  bz.R.courses({ rh: .27, bw: .5, dens: .35 }).band(0, .24, M.tasK, 0);
  bz.L.door(.42, .5, .86, { kind: 'arch', col: M.mavi, sove: M.mermer }).lantern(.2, .8);
  bz.R.win(.3, .44, .3, .4, { shut: M.mavi, sove: M.mermer, lit: true });
  const tv = b.vault(5.2, 0, 6.45, 1.0, 1.1, .42, M.kursun, { axis: 'x', wall: M.tas, step: .42 });
  tv.G.shp('round', .38, .1, .24, .2, M.demir, 4).shp('round', .42, .13, .16, .14, M.ic, 5);
  // kapı önünde saman örtülü buz kalıpları
  b.box(5.3, 1.02, 0, 5.62, 1.3, .24, '#cfe6ee', { edge: false, T: '#f2fafc' }); b.box(5.36, 1.04, .24, 5.6, 1.26, .42, '#cfe6ee', { edge: false, T: M.saz });

  /* --- tezgâh: sehpa ayaklı, müşteriye eğik mermer tabla --- */
  const fish = (f, a, c, l, w, ax) => 'M' + [[0, 0], [w / 2, .4 * l], [.36 * w, l], [0, .78 * l], [-.36 * w, l], [-w / 2, .4 * l]].map(q => ax ? f.P(a + q[1], c + q[0]) : f.P(a + q[0], c + q[1])).join(' ') + 'Z';
  const counter = (x0, y0, x1, y1, dir) => { const zl = .4, zh = .6, th = .06; let f, lip, end, legs, nl, ne;
    if (dir === 'y') { const d = y1 - y0; f = new K.Face([x0, y1, zl], [1, 0, 0], K.unit([0, -d, zh - zl]), x1 - x0, Math.hypot(d, zh - zl), K.unit([0, zh - zl, d]));
      lip = [[x0, y1, zl], [x1, y1, zl], [x1, y1, zl - th], [x0, y1, zl - th]]; end = [[x1, y1, zl], [x1, y0, zh], [x1, y0, zh - th], [x1, y1, zl - th]]; nl = [0, 1, 0]; ne = [1, 0, 0];
      legs = [[x0 + .08, y0 + .07, zh], [x1 - .08, y0 + .07, zh], [x0 + .08, y1 - .07, zl], [x1 - .08, y1 - .07, zl]]; }
    else { const d = x1 - x0; f = new K.Face([x1, y1, zl], [0, -1, 0], K.unit([-d, 0, zh - zl]), y1 - y0, Math.hypot(d, zh - zl), K.unit([zh - zl, 0, d]));
      lip = [[x1, y1, zl], [x1, y0, zl], [x1, y0, zl - th], [x1, y1, zl - th]]; end = [[x0, y1, zh], [x1, y1, zl], [x1, y1, zl - th], [x0, y1, zh - th]]; nl = [1, 0, 0]; ne = [0, 1, 0];
      legs = [[x0 + .07, y0 + .08, zh], [x0 + .07, y1 - .08, zh], [x1 - .07, y0 + .08, zl], [x1 - .07, y1 - .08, zl]]; }
    f.fill(M.ahsap); f.rect(.04, .04, f.w - .08, f.h - .07, '#e3e6e2', 3);
    b.gpoly([[x0, y0], [x1, y0], [x1 + .25, y1 - .2], [x1, y1], [x0, y1]], '#3a4658', { op: .28 });
    b.item([x0, y0, 0, x1, y1, zh], () => ln(M.ahsapK, legs.map(q => `M${P(q[0], q[1], 0)} ${P(q[0], q[1], q[2] - th)}`).join('') + `M${P(legs[2][0], legs[2][1], .14)} ${P(legs[3][0], legs[3][1], .14)}`, 1.7)
      + pth(T(M.ahsap, K.toneOf(nl) - .06), `M${K.PL(lip)}Z`) + pth(T(M.ahsap, K.toneOf(ne) - .06), `M${K.PL(end)}Z`) + f.svg(), { pts: [[x0, y0, zh], [x1, y0, zh], [x1, y1, zl], [x0, y1, zl]] });
    return f; };

  /* --- +y önü: tezgâh, balıkçı, müşteri, hamal, kedi --- */
  b.fig(2.3, 4.86, 0, { body: '#ece4d2', legs: '#3a4658', hat: 'fes' });
  b.art(2.3, 4.86, 0, pth(M.lacivert, 'M-2.7 -14.4h5.4l.7 7.6h-6.8z'), { bb: [2.2, 4.76, 0, 2.4, 4.96, .8] });
  b.critter('kedi', 3.2, 5.48, 0);
  const fy = counter(1.55, 5.07, 3.5, 5.62, 'y');
  { let sv = '', pk = '', bl = '', st = '', sb = '';
    fy.poly([[.05, .04], [.64, .04], [.64, .53], [.4, .5], [.22, .54], [.05, .5]], BUZ, 4, .1).poly([[1.3, .04], [1.9, .04], [1.9, .5], [1.74, .55], [1.5, .51], [1.29, .54]], BUZ, 4, .1);
    for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) { const a = .12 + i * .135 + r * .05, c = .04 + r * .25; sv += fish(fy, a, c, .27, .115); sb += `M${fy.P(a + .025, c + .05)} ${fy.P(a + .03, c + .19)}`; }
    for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) pk += fish(fy, .75 + i * .1 + (r % 2) * .04, .05 + r * .17, .16, .07);
    for (let i = 0; i < 3; i++) { const c = .13 + i * .16; bl += fish(fy, 1.34 + (i % 2) * .05, c, .48, .1, 1); st += `M${fy.P(1.4 + (i % 2) * .05, c + .025)} ${fy.P(1.7 + (i % 2) * .05, c + .03)}`; }
    fy.put(6, K.kf(fy.c('#aebdca')), sv + bl).put(6, K.kf(fy.c(PEM)), pk).put(6.2, 'Ln ' + K.ks(fy.c(LAC)), st, 'stroke-width="1.3"').put(6.2, 'Ln ' + K.ks(fy.c('#5f7890')), sb, 'stroke-width="1"');
    fy.rect(.655, .04, .035, .5, M.ahsap, 5, -.1).rect(1.245, .04, .035, .5, M.ahsap, 5, -.1);
    [[.62, .5], [.7, .52], [1.22, .5]].forEach(([a, c]) => fy.dot(a, c, 1.5, '#f2d24a', 7, null)); [[1.28, .5], [.66, .46]].forEach(([a, c]) => fy.dot(a, c, 1.7, M.sarmasik, 6.8, .1)); }
  b.fig(2.85, 6.08, 0, { body: '#a8473a', robe: true, hat: 'ortu', hatCol: '#e8d9b0', carry: 'sepet', flip: true });
  b.fig(4.3, 5.55, 0, { body: '#4f7d8a', legs: '#5a4a3a', hat: 'hasir', step: 1, carry: 'kasa' });
  // 4. gözün önü: buzlu sandıklar, kuyruklar
  b.crate(3.95, 4.75, 0, .42, { fill: BUZ }).crate(4.4, 4.72, 0, .36, { fill: BUZ });
  const tails = 'M-4 -2l-1.6 -4.4l2.4 1.4l1.6 -2l.4 4.6zM2 -1.4l.4 -4.6l1.8 1.8l2.2 -1l-1.6 4.2z';
  b.art(3.95, 4.75, .34, pth('#8fa5b6', tails), { r: .2, h: .2 }).art(4.4, 4.72, .29, pth('#9aaec0', tails), { r: .18, h: .2 });
  // giriş yanı: midye sepetleri, saksılar
  const basket = (x, y, heap) => { b.cyl(x, y, .17, 0, .18, '#c9a04e', { top: heap, cast: false }).band(.07, .03, '#a8803a'); const p = pr(x, y, .18);
    b.item([x - .1, y - .1, .18, x + .1, y + .1, .3], pth(heap, K.ell(p[0], p[1] - 1.2, 4.6, 2.6)) + pth(T(heap, .4), K.circ(p[0] - 2, p[1] - 2.2, .9) + K.circ(p[0] + 1.4, p[1] - 1.4, .8) + K.circ(p[0] + .2, p[1] - 3, .8)), { cast: false }); };
  basket(.3, 4.78, '#2c3244'); basket(.62, 5.02, '#2c3244'); basket(.2, 5.2, '#b9603a');
  b.barrel(.14, 4.44, .15, { r: .13, h: .22, col: M.mavi, top: M.toprak, cast: false });
  b.art(.14, 4.44, .37, pth(T(M.sarmasik, -.2), K.circ(0, -5, 5.4) + K.circ(-4.6, -9, 4) + K.circ(3.4, -11, 4.2)) + pth(T(M.sarmasik, .2), K.circ(-1.6, -7, 3.6) + K.circ(2, -13, 2.8)) + pth(M.begonvil, K.circ(-5, -11, 2.2) + K.circ(.4, -15.4, 2.4) + K.circ(4.6, -9, 2) + K.circ(-1, -4, 1.7)) + pth(T(M.begonvil, .3), K.circ(-5.6, -11.8, 1.1) + K.circ(0, -16.2, 1.2)), { r: .14, h: .6 });
  // ağ askısı: iki sırık, sarkan ağ, mantarlar
  b.line3([[.25, 6.05, 0], [.25, 6.05, .78]], M.ahsapK, 1.5).line3([[1.45, 6.05, 0], [1.45, 6.05, .78]], M.ahsapK, 1.5);
  { const q = (x, z) => P(x, 6.05, z); let m = '', fl = ''; for (let i = 0; i < 5; i++) { const x = .3 + i * .22; m += `M${q(x, .68)} ${q(x + .22, .2)}M${q(x + .22, .68)} ${q(x, .2)}`; if (i % 2 === 0) { const p = pr(x + .08, 6.05, .7 - Math.sin(i / 4 * 3.14) * .07); fl += K.circ(p[0], p[1], 1.3); } }
    b.item([.25, 6.03, .1, 1.45, 6.07, .76], pth('#b79a6a', `M${q(.25, .74)}Q${q(.85, .58)} ${q(1.45, .74)}L${q(1.42, .2)}Q${q(1.1, .1)} ${q(.85, .2)}Q${q(.55, .08)} ${q(.28, .2)}Z`, 'opacity=".34"') + ln('#8a7350', m, .5, 'opacity=".7"') + ln('#6a5a4a', `M${q(.25, .74)}Q${q(.85, .58)} ${q(1.45, .74)}`, .9) + pth(M.bezK, fl), { cast: false }); }

  { const pot = pth('#b98f55', 'M-6.4 0Q-6.6 -9.6 0 -9.6Q6.6 -9.6 6.4 0Z') + pth(T('#b98f55', -.3), 'M1.4 -9.4Q6.6 -8.6 6.4 0H2.4Z') + ln('#7a5a34', 'M-6.2 -3h12.4M-5.4 -6.2h10.8M-2.6 -9.2v9.2M2 -9.3v9.3', .6) + pth('#3a2c24', K.ell(0, -9.4, 1.8, .8));
    b.art(1.72, 6.12, 0, pot, { r: .2, h: .4 }).art(2.06, 6.3, 0, pot, { r: .2, h: .4 }).art(1.88, 6.2, .32, pot, { r: .18, h: .4 }); }

  /* --- köşe: canlı balık teknesi, tulumba, baba ve halat --- */
  const tk = b.box(5.35, 4.55, 0, 6.15, 5.25, .32, M.mermer, { edge: false }); jo(tk.L, .4); tk.L.band(0, .07, M.tasK, 0); tk.R.band(0, .07, M.tasK, 0);
  b.pool(5.43, 4.63, 6.07, 5.17, .32);
  { const f = new K.Face([5.43, 4.63, .32], [1, 0, 0], [0, 1, 0], .64, .54, [0, 0, 1]); let d = fish(f, .1, .14, .26, .08, 1) + fish(f, .5, .3, -.24, .08, 1) + fish(f, .2, .42, .22, .07, 1);
    b.item([5.43, 4.63, .32, 6.07, 5.17, .36], pth('#1f5870', d) + pth('#e8843a', fish(f, .34, .2, .16, .06, 1)), { cast: false }); }
  b.art(5.43, 4.6, .32, ln(M.demir, 'M0 0V-13M0 -10h5v2.4', 2) + ln(M.demir, 'M0 -13l-6 -4', 1.3) + pth(M.bronz, K.circ(0, -13.4, 1.5)), { bb: [5.36, 4.55, .32, 5.5, 4.66, .9] });
  b.fx('fall', 5.64, 4.6, .58, { w: .05, h: .24 });
  b.bollard(6.22, 5.82, 0, { r: .11, h: .32 }); b.cyl(6.22, 5.82, .14, .32, .37, M.demir, { cast: false });
  { const p = pr(5.9, 6.02, 0), c = '#c9b07a'; b.item([5.7, 5.85, 0, 6.1, 6.2, .1], pth(T(c, -.3), K.ell(p[0], p[1], 9, 4.6)) + ln(c, K.ell(p[0], p[1] - 1, 8, 4) + K.ell(p[0], p[1] - 2.2, 5.6, 2.8) + K.ell(p[0], p[1] - 3.2, 3, 1.5), 1.5) + ln(c, `M${f1(p[0] + 8)} ${f1(p[1] - 1)}Q${f1(p[0] + 12)} ${f1(p[1] - 4)} ${P(6.2, 5.9, .12)}`, 1.4), { cast: false }); }

  /* --- +x önü: gölgedeki tezgâh, balıkçı, müşteri, sandıkta martı, sokak feneri --- */
  const fx = counter(5.62, 1.45, 6.17, 3.0, 'x');
  { let bl = '', st = '', sv = '', sb = '';
    for (let i = 0; i < 6; i++) { const a = .1 + i * .085; bl += fish(fx, a, .06 + (i % 2) * .05, .34, .075); st += `M${fx.P(a + .02, .12 + (i % 2) * .05)} ${fx.P(a + .02, .32 + (i % 2) * .05)}`; }
    fx.poly([[1.07, .04], [1.5, .04], [1.5, .5], [1.3, .54], [1.07, .5]], BUZ, 4, .2);
    for (let r = 0; r < 2; r++) for (let i = 0; i < 3; i++) { const a = 1.14 + i * .125 + r * .05, c = .04 + r * .25; sv += fish(fx, a, c, .26, .11); sb += `M${fx.P(a + .025, c + .05)} ${fx.P(a + .03, c + .18)}`; }
    fx.put(6, K.kf(fx.c('#aebfcd', .1)), bl + sv).put(6.2, 'Ln ' + K.ks(fx.c(LAC, .1)), st, 'stroke-width="1.2"').put(6.2, 'Ln ' + K.ks(fx.c('#5f7890', .1)), sb, 'stroke-width="1"');
    // karides öbeği
    [[.7, .12], [.8, .1], [.9, .14], [.74, .22], [.86, .24], [.95, .26], [.78, .33], [.9, .36], [.83, .44]].forEach(([a, c], i) => fx.dot(a, c, 1.7, i % 2 ? '#e79a86' : '#d9776a', 6.5, .1));
    fx.rect(.6, .04, .035, .5, M.ahsap, 5, -.1).rect(1.03, .04, .035, .5, M.ahsap, 5, -.1); }
  b.fig(5.42, 3.42, 0, { body: '#ece4d2', legs: '#4a3a34', hat: 'sarik', carry: 'balik' });
  b.art(5.42, 3.42, 0, pth('#5a7f8f', 'M-2.7 -14.4h5.4l.7 7.6h-6.8z'), { bb: [5.32, 3.32, 0, 5.52, 3.52, .8] });
  b.fig(6.33, 2.3, 0, { body: M.hardal, legs: '#4a3a34', hat: 'fes', flip: true, carry: 'kova' });
  b.crate(6.15, 3.55, 0, .42).crate(6.2, 3.98, 0, .36, { fill: GUM }).critter('marti', 6.15, 3.55, .34);
  b.lamp(6.32, 4.8);
  { const A = [4.9, 4.2, 1.74], Z = [6.32, 4.8, 1.5], cs = [M.bezM, M.bez, M.bezS], d = ['', '', ''], at = t => [A[0] + (Z[0] - A[0]) * t, A[1] + (Z[1] - A[1]) * t, A[2] + (Z[2] - A[2]) * t - .5 * t * (1 - t)];
    for (let i = 0; i < 8; i++) { const p = at((i + .12) / 8), q = at((i + .88) / 8), m = at((i + .5) / 8); d[i % 3] += `M${P(...p)} ${P(...q)} ${P(m[0], m[1], m[2] - .24)}Z`; }
    b.item([4.9, 4.2, 1.2, 6.32, 4.8, 1.74], ln('#6a5a4a', `M${P(...A)}Q${P(...at(.5).map((v, i) => i === 2 ? v - .12 : v))} ${P(...Z)}`, .7) + d.map((v, i) => pth(T(cs[i], -.1), v)).join(''), { cast: false }); }

  /* --- çatı, havalandırma feneri, yelkovan (en sonda: altındaki her şeyden sonra çizilsin) --- */
  b.poly3([[X0 - .2, Y1 + .2, 1.9], [X1 + .2, Y1 + .2, 1.9], [X1 + .2, Y1 + .2, 1.8], [X0 - .2, Y1 + .2, 1.8]], M.mavi, { n: [0, 1, 0], bb: [X0 - .2, Y1 + .18, 1.8, X1 + .2, Y1 + .2, 1.9] });
  b.poly3([[X1 + .2, Y1 + .2, 1.9], [X1 + .2, Y0 - .2, 1.9], [X1 + .2, Y0 - .2, 1.8], [X1 + .2, Y1 + .2, 1.8]], M.mavi, { n: [1, 0, 0], bb: [X1 + .18, Y0 - .2, 1.8, X1 + .2, Y1 + .2, 1.9] });
  const rf = b.hip(X0 - .2, Y0 - .2, X1 + .2, Y1 + .2, EAVE, .54, M.kiremit, { tex: false }); rf.L.tiles({ step: .27 }); rf.R.tiles({ step: .33 });
  const fn = b.box(1.6, 1.9, 2.38, 3.6, 2.9, 2.86, '#463c34>#e09a3c', { edge: false });
  [[fn.L, 4], [fn.R, 2]].forEach(([f, n]) => { const w = f.w / n; f.band(0, .06, M.ahsap, 0, 4).band(f.h - .06, .06, M.ahsap, -.1, 4);
    for (let i = 0; i <= n; i++) f.rect(Math.max(0, Math.min(f.w - .08, i * w - .04)), 0, .08, f.h, M.kirec, 4.2, -.04);
    f.rect(0, .06, f.w, .25, M.mavi, 3.5).line([[.04, .14], [f.w - .04, .14]], M.mavi, .8, 3.6, -.24).line([[.04, .22], [f.w - .04, .22]], M.mavi, .8, 3.6, -.24); });
  const rl = b.hip(1.44, 1.74, 3.76, 3.06, 2.94, .2, M.kiremit, { tex: false }); rl.L.tiles({ step: .33 }); rl.R.tiles({ step: .33 });
  b.art(2.6, 2.4, 3.14, ln(M.demir, 'M0 0V-12', 1.2) + pth(M.altin, K.circ(0, -3.4, 1.6)) + ln(M.altin, 'M-5.5 -7.4H5.5', 1) + pth(M.altin, 'M-8 -13q4.4 -4.6 10 -1.6l3.6 -2.6l-.7 3.6l1 3.2l-3.9 -1.8q-5.4 3.2 -10 -.8z') + pth(T(M.altin, .5), 'M-6.6 -13.4q3.8 -3 8 -1q-4.4 -.4 -8 1z') + pth('#5a4420', K.circ(-5, -13.2, .7)), { bb: [2.5, 2.3, 3.14, 2.7, 2.5, 3.56] });
  b.fx('glint', 2.6, 2.4, 3.56);
  b.critter('marti', 3.0, 2.4, 3.14, { flip: true });
  // damda martıya sokulan kedi
  b.critter('kedi', 1.75, 3.62, 2.17, { col: '#4a4644', flip: true }).critter('marti', 2.65, 3.72, 2.14);


  b.tag(5.6, 6.4, 0).doorAt(1.03, 4.8);
});
