/* Tersane — üç tonozlu "tersane gözü" (kurşun kaplı beşik tonozlar, almaşık taş kemerler), sağ uçta yazıhane ve çan kulesi.
   Ana cephe +y (aydınlık) rıhtıma bakar; arka (y=0) istinat duvarına yaslıdır. Parsel 12 × 7.5.
   Asıl gösteri öndeki avlu: kızakta kaburgaları çıkılmış tekne, maçuna, iskele, hızar sehpası, zift kazanı, direk ve seren. */
CK.def('tersane', { w: 12, d: 7.5, name: 'Tersane' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, PL = K.PL, P = K.P, pr = K.pr, f1 = K.f1;
  const TAS = '#d6c199', KIZIL = '#c98f6b', ZIFT = '#4a3a31', CAM = '#d9b278', AK = M.ahsapK, HALAT = '#c9ad72', DEMIR = '#3d424b';
  const poly = pts => 'M' + PL(pts) + 'Z', lin = pts => 'M' + PL(pts);

  /* --- yardımcılar --- */
  // toplu çizim: aynı renkteki parçalar tek <path>; cut() boyama sırasını korumak için yeni öbek açar
  const bat = () => { const m = new Map(); let g = 0; const add = (k, d) => m.set(g + k, (m.get(g + k) || '') + d);
    const o = { p: (c, pts) => (add('|K|' + c, poly(pts)), o), d: (c, d) => (add('|K|' + c, d), o), l: (c, pts, w = 1) => (add('|S' + w + '|' + c, lin(pts)), o), cut: () => (g++, o),
      box: (x0, y0, z0, x1, y1, z1, c) => o.p(c, [[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]]).p(T(c, -.42), [[x1, y1, z0], [x1, y0, z0], [x1, y0, z1], [x1, y1, z1]]).p(T(c, .24), [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]]),
      svg() { let s = ''; for (const [k, d] of m) { const [, t, c] = k.split('|'); s += t === 'K' ? pth(c, d) : ln(c, d, +t.slice(1)); } return s; } };
    return o; };
  // x boyunca yatan tomruk / rulo: gölge gövde, aydınlık sırt, +x ucunda kesit
  const logX = (B, x0, x1, y, z, r, c, end) => { const m = a => [y + r * Math.cos(a), z + r * Math.sin(a)], u = m(2.255), d = m(-.887), h = m(.35), e = [];
    for (let i = 0; i < 8; i++) e.push([x1, ...m(i * .7854)]);
    return B.p(T(c, -.34), [[x0, ...u], [x1, ...u], [x1, ...d], [x0, ...d]]).p(c, [[x0, ...u], [x1, ...u], [x1, ...h], [x0, ...h]]).cut().p(end || T(c, -.12), e).cut(); };
  // dışbükey çokgene kırpma (ekran uzayı): kemer gözünün içini çizmek için
  const clipPoly = (sub, cl) => { let s = 0; for (let i = 0; i < cl.length; i++) { const a = cl[i], c = cl[(i + 1) % cl.length]; s += a[0] * c[1] - c[0] * a[1]; } const sg = s > 0 ? 1 : -1; let out = sub;
    for (let i = 0; i < cl.length && out.length; i++) { const A = cl[i], B = cl[(i + 1) % cl.length], inp = out, sd = p => ((B[0] - A[0]) * (p[1] - A[1]) - (B[1] - A[1]) * (p[0] - A[0])) * sg; out = [];
      for (let j = 0; j < inp.length; j++) { const p = inp[j], q = inp[(j + 1) % inp.length], sp = sd(p), sq = sd(q); if (sp >= 0) out.push(p); if ((sp >= 0) !== (sq >= 0)) { const t = sp / (sp - sq); out.push([p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t]); } } }
    return out; };
  const rnd = b.r;

  /* --- zemin: rıhtım döşemesi, kızak yatakları, yonga, talaş, zift isi --- */
  b.pave(0, 4.9, 12, 7.5, '#d0bf99');
  b.gpoly([[.95, 4.9], [2.65, 4.9], [2.65, 7.5], [.95, 7.5]], '#bda77f');                       // 1. gözün kızağı
  b.gpoly([[3.7, 5.38], [8.8, 5.38], [8.8, 7.0], [3.7, 7.0]], '#b9a279');                        // inşa kızağı
  { let sl = '', ry = '', ch = '';
    for (let y = 5.0; y < 7.45; y += .42) sl += poly([[1.02, y], [2.58, y], [2.58, y + .12], [1.02, y + .12]]);
    for (let x = 3.95; x < 8.6; x += .56) sl += poly([[x, 5.46], [x + .13, 5.46], [x + .13, 6.92], [x, 6.92]]);
    for (const x of [1.27, 2.21]) ry += poly([[x, 4.9], [x + .12, 4.9], [x + .12, 7.5], [x, 7.5]]);
    for (let i = 0; i < 14; i++) { const x = 4 + rnd() * 5, y = 7.02 + rnd() * .42, w = .06 + rnd() * .08; ch += poly([[x, y], [x + w, y + .03], [x + w - .02, y + .07]]); }
    b.ground(pth('#9a7a54', sl) + pth('#7b5b3c', ry) + pth('#ecd9a8', ch)); }
  b.gpoly([[.15, 5.9], [.7, 5.75], [1.15, 6.0], [1.2, 6.55], [.7, 6.8], [.2, 6.6]], '#8d7c66', { op: .7 });      // zift ocağının isi
  b.gpoly([[9.6, 5.8], [11.3, 5.75], [11.6, 6.3], [10.6, 6.55], [9.5, 6.4]], '#e6d4a2', { op: .8 });          // hızar talaşı
  b.spill(.62, 6.25, 1.5); [1.8, 4.8, 7.8].forEach(x => b.spill(x, 5.5, 1.9, { op: .6 })); b.spill(10, 5.4, 1.3);

  /* --- tersane gözleri: üç beşik tonoz, önde almaşık taşlı kemer alınlıkları --- */
  const BW = 3, X0 = .3, YF = 4.9, ZS = 1.3, RO = 1.5, PW = .25, RI = BW / 2 - PW, NV = 11;
  b.box(X0, .3, 0, X0 + 3 * BW, YF - .34, ZS, TAS, { edge: false, T: M.kursun });
  [0, 1, 2].forEach(i => {
    const x0 = X0 + i * BW, x1 = x0 + BW, xc = x0 + BW / 2, xl = x0 + PW, xr = x1 - PW;
    b.vault(x0 + .04, .3, x1 - .04, YF - .34, ZS, 1.4, M.kursun, { axis: 'y', step: 1.05, n: 7 });
    b.vault(x0, YF - .34, x1, YF, ZS, RO, T(TAS, .05), { axis: 'y', tex: false, n: 7 });
    const sh = [[0, 0], [BW, 0]], cp = (r, a) => [BW / 2 + Math.cos(a) * r, ZS + Math.sin(a) * r];
    for (let k = 0; k <= NV; k++) sh.push(cp(RO, Math.PI * k / NV));
    const f = new K.Face([x0, YF, 0], [1, 0, 0], [0, 0, 1], BW, ZS + RO, [0, 1, 0], sh); f.fill(TAS);
    for (let k = 1; k < NV; k += 2) { const a0 = Math.PI * k / NV, a1 = Math.PI * (k + 1) / NV; f.poly([cp(RI, a0), cp(RO, a0), cp(RO, a1), cp(RI, a1)], KIZIL, 2.4); }      // almaşık kemer taşları
    f.arcade(0, BW, 1, ZS + RI, { pier: PW, th: .42, glow: true, floor: '#8f7f68', ring: false, cap: false });
    f.dot(BW / 2, ZS + RI + .13, 2.3, M.bronz, 7, .2);                                                          // kilit taşında pirinç göbek
    // kemerin içi: kemer gözüne kırpılmış 3B çokgenler
    const clip = [f.q(PW, 0), f.q(BW - PW, 0)]; for (let k = 0; k <= 8; k++) clip.push(f.q(...cp(RI, Math.PI * k / 8)));
    let lay = 4.1; const inn = (col, pts) => { const q = clipPoly(pts.map(p => pr(p[0], p[1], p[2] || 0)), clip); if (q.length > 2) f.put(lay += .01, K.kf(col), 'M' + q.map(p => f1(p[0]) + ' ' + f1(p[1])).join(' ') + 'Z'); };
    const ibox = (a0, y0, z0, a1, y1, z1, c) => { inn(T(c, -.12), [[a0, y1, z0], [a1, y1, z0], [a1, y1, z1], [a0, y1, z1]]); inn(T(c, -.5), [[a1, y1, z0], [a1, y0, z0], [a1, y0, z1], [a1, y1, z1]]); inn(T(c, .08), [[a0, y0, z1], [a1, y0, z1], [a1, y1, z1], [a0, y1, z1]]); };
    inn('#5c5044>#8f5f2e', [[xl, YF, 0], [xr, YF, 0], [xr, 1, 0], [xl, 1, 0]]);                                  // iç zemin
    const sun = [[xl, YF, 0], [xr, YF, 0]]; for (let k = 0; k <= 6; k++) { const a = Math.PI * k / 6, z = ZS + Math.sin(a) * RI; sun.push([xc + Math.cos(a) * RI + .375 * z, YF - .65 * z, 0]); }
    inn('#b5a182>#a36c34', sun);                                                                               // kemerden giren güneş
    inn('#453c35>#7a4d24', [[xl, YF, 0], [xl, 1, 0], [xl, 1, ZS + .5], [xl, YF, ZS + .5]]);                      // sol iç duvar
    if (i === 0) {          // kızaktaki teknenin içeride kalan gövdesi + mizana direği
      inn('#8f7654', [[xc - .62, YF, 1.22], [xc + .62, YF, 1.22], [xc + .66, 2.2, 1.2], [xc - .66, 2.2, 1.2]]);
      inn(T(ZIFT, -.3), [[xc + .67, YF, .5], [xc + .67, YF, 1.2], [xc + .7, 2.2, 1.2], [xc + .7, 2.2, .5]]);
      inn(T(M.turkuaz, -.36), [[xc + .67, YF, 1.2], [xc + .67, YF, 1.34], [xc + .7, 2.2, 1.32], [xc + .7, 2.2, 1.2]]);
      inn(T(CAM, -.14), [[xc - .05, 4.3, 1.2], [xc + .05, 4.3, 1.2], [xc + .04, 4.3, 3], [xc - .04, 4.3, 3]]);
    } else if (i === 1) {   // kereste istifi + beyaz sandal
      ibox(xl + .04, 2.8, 0, xl + .56, 4.62, .5, T(CAM, -.14));
      const xs = xl + 1.4, wt = '#eae3d0';
      inn('#6a5a48', [[xs - .36, 4.2, .95], [xs + .36, 4.2, .95], [xs + .38, 2.9, .95], [xs - .38, 2.9, .95]]);
      inn(T(wt, -.5), [[xs + .36, 4.2, .95], [xs + .3, 4.2, .6], [xs, 4.2, .42], [xs, 2.9, .42], [xs + .38, 2.9, .95]]);
      inn(T(wt, -.08), [[xs - .36, 4.2, .95], [xs - .3, 4.2, .6], [xs, 4.2, .42], [xs + .3, 4.2, .6], [xs + .36, 4.2, .95]]);
      inn(M.mavi, [[xs - .36, 4.2, .95], [xs - .345, 4.2, .85], [xs + .345, 4.2, .85], [xs + .36, 4.2, .95]]);
    } else {                // yelken ambarı: asılı yelken bezi, sandıklar
      const bz = '#e9dfc4>#d3a862';
      inn(bz, [[xl + .12, 4.3, 2.4], [xl + 1.3, 4.3, 2.4], [xl + 1.18, 4.3, .95], [xl + .24, 4.3, 1.08]]);
      inn(T(bz, -.16), [[xl + .5, 4.3, 2.4], [xl + .66, 4.3, 2.4], [xl + .62, 4.3, 1.03], [xl + .5, 4.3, 1.05]]);
      inn(T(bz, -.16), [[xl + .96, 4.3, 2.4], [xl + 1.1, 4.3, 2.4], [xl + 1.02, 4.3, .98], [xl + .92, 4.3, .99]]);
      ibox(xl + .08, 4.25, 0, xl + .5, 4.68, .44, '#8a6a48');
    }
    f.line([[BW / 2, ZS + RI], [BW / 2, 2.12]], M.demir, .8, 7.9).lantern(BW / 2, 2.0, { out: 0, r: 24 });           // kemerden sarkan fener
    b.item([x0, YF, 0, x1, YF + .03, ZS + RO], () => f.svg(), { cast: false });
  });
  // payandalar: gözlerin arasında eğik başlıklı taş ayaklar
  [0, 1, 2, 3].forEach(i => { const x = X0 + i * BW, p = b.box(x - .2, YF + .03, 0, x + .2, YF + .36, 1.52, TAS, { edge: false });
    p.L.courses({ rh: .3, bw: .3, dens: .5 }).band(0, .24, M.tasK, -.04);
    b.shed(x - .24, YF, x + .24, YF + .42, 1.52, 1.86, '+y', T(TAS, .04), { tex: false });
    if (i === 1 || i === 2) p.L.lantern(.2, 1.18, { out: .12 }); });
  // tonoz sırtında ışıklıklar
  [[1.8, 2.3], [4.8, 1.5]].forEach(([x, y]) => { const s = b.box(x - .24, y - .3, 2.58, x + .24, y + .3, 2.94, M.kursun, { edge: false, cast: false });
    s.L.rect(.08, .1, .32, .2, M.camI, 5); s.R.rect(.1, .1, .4, .2, M.camI, 5);
    b.hip(x - .32, y - .38, x + .32, y + .38, 2.94, .18, M.kursun, { tex: false, cast: false }); });

  /* --- çan kulesi (arkada) ve sundurma --- */
  const kule = b.box(9.45, .7, 0, 11.05, 2.3, 2.85, TAS);
  kule.L.courses({ rh: .28, b0: 1.5, dens: .35 }).band(1.82, .08, TAS, .14).shadeTop(.14); kule.R.courses({ rh: .28, b0: 1.1, dens: .3 }).band(1.82, .08, TAS, .14).shadeTop(.14);
  kule.L.arcade(.34, 1.26, 1, .68, { b: 1.98, pier: .1, th: .16, floor: M.ic }); kule.R.arcade(.34, 1.26, 1, .68, { b: 1.98, pier: .1, th: .16, floor: M.ic });
  b.fx('bell', 10.25, 2.32, 2.55, { s: 1 });
  const kc = b.hip(9.27, .52, 11.23, 2.48, 2.85, .62, M.kiremit, { tex: false }); kc.L.tiles({ step: .32 }); kc.R.tiles({ step: .32 });
  b.line3([[10.25, 1.5, 3.44], [10.25, 1.5, 3.92]], AK, 1.3); b.art(10.25, 1.5, 3.47, pth(M.altin, K.circ(0, -1, 1.8)), { bb: [10.2, 1.45, 3.44, 10.3, 1.55, 3.6] });
  b.fx('flag', 10.25, 1.5, 3.9, { col: M.bezM, s: .8 });
  b.box(11.05, .9, 0, 11.6, 2.3, 1.12, M.ahsap, { edge: false }).R.planks({ step: .28 }).rect(.5, 0, .46, .86, AK, 4).rect(.54, 0, .38, .82, T(AK, -.3), 5);
  b.shed(11.0, .84, 11.74, 2.3, 1.12, 1.52, '+x', M.padavra, { tex: 'plank' });

  /* --- yazıhane: taş zemin kat, kireç badanalı üst kat, cumba, alaturka kiremit --- */
  const yz = b.box(9.45, 2.3, 0, 11.6, 4.9, 2.05, M.kirec);
  yz.L.band(0, 1.05, TAS).rect(0, 1.02, 2.15, .08, AK, 3).rect(0, 1.1, .07, .95, AK, 3).rect(2.08, 1.1, .07, .95, AK, 3).shadeTop(.16);
  yz.R.band(0, 1.05, TAS).stones(4, { b1: 1.05 }).rect(0, 1.02, 2.6, .08, AK, 3).rect(0, 1.1, .07, .95, AK, 3).shadeTop(.16);
  yz.L.door(.3, .52, .9, { kind: 'arch', col: M.mavi, sove: TAS, lamp: true });
  yz.L.win(1.38, .4, .44, .46, { kind: 'arch', frame: DEMIR, bars: [3, 1], sove: TAS, lit: true });
  yz.L.win(.36, 1.34, .34, .48, { shut: M.mavi, lit: true });
  b.awning(yz.L, .12, 1.14, .9, { out: .42, drop: .2, cols: [M.bezM, M.bez] });
  const cb = b.bay(yz.L, 1.0, 1.08, .96, .68, { out: .38, mat: '#b98b5a' });
  cb.L.band(0, .12, AK).wins(2, .18, .3, .42, { frame: M.mavi, lit: true, sill: false }); cb.R.band(0, .12, AK).win(.06, .18, .26, .42, { frame: M.mavi, lit: true, sill: false });
  b.shed(10.39, 4.9, 11.47, 5.36, 1.76, 1.88, '+y', M.kiremitK);
  yz.R.door(.45, .84, .92, { kind: 'seg', col: M.ahsap, sove: TAS, double: true });
  yz.R.win(.5, 1.34, .34, .48, { shut: M.mavi, lit: false }).win(1.55, 1.34, .34, .48, { shut: M.mavi, lit: true });
  yz.R.vine({ kind: 'boug', a0: 1.8, a1: 2.6, drop: [.4, 1.3], dens: .55, stem: 2.5 });
  const cat = b.gable(9.45, 2.3, 11.6, 4.9, 2.05, .62, M.kiremit, { axis: 'x', ov: .18, wall: M.kirec, tex: false }); cat.A.tiles({ step: .3 });
  cat.G.shp('round', 1.1, .14, .4, .34, AK, 4).shp('round', 1.16, .2, .28, .22, M.ic, 5);
  b.chimney(10.2, 3.25, 2.35, .6, { mat: TAS, w: .3, s: .8 });
  b.barrel(11.84, 4.5, 0, { r: .17 });
  // demir kolda asılı çapa tabelası (yazıhanenin köşesinde)
  b.line3([[11.6, 4.9, 1.5], [11.6, 5.42, 1.5]], DEMIR, 1.5, { pad: .06 });
  b.art(11.6, 5.34, 1.5, ln(DEMIR, 'M0 0v3', .8) + pth(M.lacivert, 'M-7 3h14v12q-7 3.4 -14 0z') + ln(M.altin, 'M0 6.4v8M-2.4 8.2h4.8M-3.8 11.2q.4 3.6 3.8 3.6q3.4 0 3.8 -3.6', 1.2) + pth(M.altin, K.circ(0, 5.6, 1.1)), { bb: [11.48, 5.22, .86, 11.72, 5.46, 1.52] });

  /* --- 1. gözden kıçı taşan tekne: aynalık, dümen, kıç feneri, beşik kızak --- */
  { const xc = 1.8, yT = 5.82, yF = 4.94, B = bat(), E = [[0, .42], [.26, .56], [.46, .86], [.56, 1.18], [.56, 1.44]], W = 1.2, tq = M.turkuaz;
    B.box(xc - .78, 5.12, 0, xc + .78, 5.27, .3, M.ahsap).box(xc - .72, 5.56, 0, xc + .72, 5.71, .34, M.ahsap).l(AK, [[xc - .92, 5.74, 0], [xc - .5, 5.74, .95]], 1.6).cut();
    B.p(T('#c7a474', .2), [[xc - .5, yT, 1.3], [xc + .5, yT, 1.3], [xc + .62, yF, 1.22], [xc - .62, yF, 1.22]]).p(T(tq, -.4), [[xc - .56, yT, 1.3], [xc - .56, yT, 1.44], [xc - .67, yF, 1.34], [xc - .67, yF, 1.2]])
      .p('#3a2c24', [[xc - .22, 5.52, 1.28], [xc + .22, 5.52, 1.28], [xc + .24, 5.14, 1.25], [xc - .24, 5.14, 1.25]]).cut();
    for (let k = 0; k < 4; k++) B.p(k === 3 ? T(tq, -.34) : T(ZIFT, [-.55, -.42, -.3][k]), [[xc + E[k][0], yT, E[k][1]], [xc + E[k + 1][0], yT, E[k + 1][1]], [xc + E[k + 1][0] * W, yF, E[k + 1][1] - (k === 3 ? .1 : 0)], [xc + E[k][0] * W, yF, E[k][1]]]);
    B.l(T(M.bez, -.3), [[xc + .56, yT, 1.44], [xc + .67, yF, 1.34]], 1.2).l(T(M.bez, -.4), [[xc + .56, yT, 1.18], [xc + .67, yF, 1.18]], .9).cut();
    const tr = [], up = [[-.56, 1.44], [-.56, 1.02], [.56, 1.02], [.56, 1.44], [.3, 1.52], [0, 1.55], [-.3, 1.52]], wn = x => [[x - .11, yT, 1.14], [x + .11, yT, 1.14], [x + .11, yT, 1.36], [x - .11, yT, 1.36]];
    for (let k = 4; k > 0; k--) tr.push([xc - E[k][0], yT, E[k][1]]); for (let k = 0; k < 5; k++) tr.push([xc + E[k][0], yT, E[k][1]]);
    B.p(ZIFT, tr).cut().p(tq, up.map(q => [xc + q[0], yT, q[1]])).l(T(ZIFT, .3), [[xc - .44, yT, .82], [xc + .44, yT, .82]], .7).l(T(ZIFT, .3), [[xc - .3, yT, .62], [xc + .3, yT, .62]], .7)
      .l(M.bez, [[xc - .56, yT, 1.44], [xc - .3, yT, 1.52], [xc, yT, 1.55], [xc + .3, yT, 1.52], [xc + .56, yT, 1.44]], 1.4).l(M.bez, [[xc - .56, yT, 1.02], [xc + .56, yT, 1.02]], 1).cut();
    B.p(M.bez, wn(xc - .32).concat([wn(xc - .32)[0]], wn(xc + .32))).cut().p(M.camI, [[xc - .4, yT, 1.17], [xc - .24, yT, 1.17], [xc - .24, yT, 1.33], [xc - .4, yT, 1.33], [xc - .4, yT, 1.17], [xc + .24, yT, 1.17], [xc + .4, yT, 1.17], [xc + .4, yT, 1.33], [xc + .24, yT, 1.33], [xc + .24, yT, 1.17]])
      .p(M.altin, [[xc, yT, 1.14], [xc + .08, yT, 1.25], [xc, yT, 1.36], [xc - .08, yT, 1.25]]);
    // dümen ve yekesi
    B.p(T('#7a5638', -.36), [[xc, yT, .32], [xc, yT + .3, .32], [xc, yT + .34, .92], [xc, yT + .1, 1.62], [xc, yT, 1.62]]).l(T('#7a5638', .2), [[xc, yT + .3, .32], [xc, yT + .34, .92], [xc, yT + .1, 1.62]], 1.1)
      .l(DEMIR, [[xc, yT, .7], [xc, yT + .12, .7]], 1.6).l(DEMIR, [[xc, yT, 1.2], [xc, yT + .12, 1.2]], 1.6).l(CAM, [[xc, yT + .06, 1.62], [xc, yT - .5, 1.74]], 1.6);
    B.l(AK, [[xc + .95, 5.74, 0], [xc + .52, 5.74, 1.0]], 1.6).l(AK, [[xc + .98, 5.3, 0], [xc + .6, 5.3, .95]], 1.6).l(DEMIR, [[xc - .46, yT, 1.46], [xc - .46, yT, 1.84]], 1);
    const lp = pr(xc - .46, yT, 1.84);
    b.item([xc - .8, yF, 0, xc + .8, 6.18, 1.9], B.svg() + `<g transform="translate(${f1(lp[0])} ${f1(lp[1])})">` + pth(DEMIR, 'M-2.6 -6.4h5.2v1.2h-5.2zM-2 0h4v1h-4z') + pth('#ffe9b0>#fff1c2', 'M-2 -5.2h4v5.2h-4z') + `<circle class="Nl" cy="-2.5" r="13" fill="url(#${K.glowId()})"/></g>`,
      { pts: [[xc - .6, yF, 0], [xc + .6, yF, 0], [xc - .6, yF, 1.3], [xc + .6, yF, 1.3], [xc - .5, yT, 1.5], [xc + .5, yT, 1.5], [xc, 6.16, .3]] }); }

  /* --- zift ocağı: sacayağında kazan, zift fıçısı, karıştıran usta --- */
  b.barrel(.4, 5.46, 0, { col: ZIFT, top: '#1d1a1c', r: .19 });
  b.cyl(.62, 6.25, .25, 0, .1, M.griK, { top: '#3a3230', cast: false });
  b.fx('fire', .62, 6.25, .08, { s: .7 });
  { const B = bat(); B.l(DEMIR, [[.3, 6.2, 0], [.62, 6.25, 1.15]], 1.3).l(DEMIR, [[.86, 5.98, 0], [.62, 6.25, 1.15]], 1.3).cut().l(DEMIR, [[.62, 6.25, 1.15], [.62, 6.25, .7]], .9);
    const p = pr(.62, 6.25, .42);
    b.item([.3, 5.98, 0, .92, 6.52, 1.16], B.svg() + `<g transform="translate(${f1(p[0])} ${f1(p[1])})">` + pth('#2a2c33', 'M-7.5 -8Q-9 1 0 2Q9 1 7.5 -8Z') + pth('#454852', 'M-7.5 -8Q-8.6 -1 -4 1Q-6 -3 -5.4 -8Z') + pth('#2a2c33', K.ell(0, -8, 8, 3.2)) + pth('#15130f', K.ell(0, -8, 6.4, 2.3)) + '</g>'
      + ln(DEMIR, lin([[.9, 6.52, 0], [.62, 6.25, 1.15]]), 1.3), { cast: false }); }
  b.fx('steam', .62, 6.25, .72, { s: .8 });
  b.fig(1.08, 6.0, 0, { body: '#6a5a4a', legs: '#3a3230', hat: 'fes', flip: true });
  b.art(1.08, 6.0, 0, ln(AK, 'M-4.4 -9.6L-10.5 -5.4', 1.1) + pth('#5a3c28', 'M-2.6 -14.4h5.2l.5 7h-6.2z'), { bb: [.96, 5.88, 0, 1.2, 6.14, .9] });
  b.art(.3, 6.75, 0, pth(T(M.ahsap, -.3), 'M-3.4 -5h6.8l-.8 5h-5.2z') + pth('#1d1a1c', K.ell(0, -5, 3.4, 1.3)) + ln(DEMIR, 'M-3.4 -5q3.4 -6 6.8 0', .7), { r: .12 });

  /* --- kereste istifi, eğri dirsekler, çapa, halat --- */
  { const s = b.box(2.74, 5.42, 0, 3.3, 6.98, .5, CAM, { edge: false }); s.L.planks({ dir: 'h', step: .125 }).planks({ dir: 'v', step: .19, dt: -.08 }); s.R.planks({ dir: 'h', step: .125 }).rect(.3, 0, .06, .5, AK, 3).rect(1.1, 0, .06, .5, AK, 3); s.T.planks({ dir: 'v', step: .14 }); }
  b.critter('kedi', 2.98, 6.2, .5, { col: '#3a3634' });
  b.art(3.42, 5.58, 0, ln(T(M.ahsap, -.2), 'M-9 -1Q-8 -11 4 -12', 3.2) + ln(M.ahsap, 'M-5 2Q-3 -8 9 -8', 3.2) + ln(T(M.ahsap, .2), 'M-1 5Q2 -4 13 -3', 3), { bb: [3.32, 5.4, 0, 3.58, 5.9, .4] });
  // çapa: istifin ucuna yaslı
  b.art(3.02, 7.06, 0, ln(DEMIR, 'M0 -2V-24M-8.5 -10Q-8 1 0 -1Q8 -3 8.5 -12', 2.2) + pth(DEMIR, 'M-11 -8l3.4 -4.6l2 4.4zM11 -10.4l-2.2 -4.8l-2.6 4.2z') + ln(DEMIR, 'M-2.2 -25.6a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0', 1.2)
    + ln(M.ahsap, 'M-7.5 -21.6L7.5 -18.4', 2.6), { bb: [2.8, 7.0, 0, 3.26, 7.12, .95] });
  const coil = (x, y, s = 1) => b.art(x, y, 0, pth(T(HALAT, -.34), K.ell(0, -1, 6.4 * s, 3.2 * s)) + pth(HALAT, K.ell(0, -2.6 * s, 6.4 * s, 3.2 * s)) + pth(T(HALAT, -.5), K.ell(0, -2.6 * s, 2.6 * s, 1.3 * s)), { r: .2, h: .2 });
  coil(.42, 7.2); b.bollard(.9, 7.36); b.critter('marti', .9, 7.36, .3);

  /* --- kızaktaki tekne: omurga, bodoslamalar, kaburgalar, alt sıra kaplama, payandalar --- */
  const HX0 = 3.85, HX1 = 8.45, HY = 6.2, HL = HX1 - HX0;
  const hb = t => t > .45 ? .72 * Math.pow(1 - ((t - .45) / .55) ** 2, .6) : .72 * (1 - .5 * ((.45 - t) / .45) ** 2);
  const zs = t => t > .42 ? 1.22 + .5 * ((t - .42) / .58) ** 2 : 1.22 + .36 * ((.42 - t) / .42) ** 2;
  const zk = t => .36 + (t > .78 ? .62 * ((t - .78) / .22) ** 2 : 0);
  const hp = (t, f, s, dz = 0) => { const th = Math.min(f, 1) * Math.PI / 2; return [HX0 + HL * t, HY + s * hb(t) * Math.pow(Math.sin(th), .7), dz + zk(t) + (zs(t) - zk(t)) * (1 - Math.pow(Math.cos(th), 1.25)) + Math.max(0, f - 1) * .6]; };
  const FS = [0, .22, .45, .7, 1, 1.2], cN = T(CAM, .22), cF = T(M.ahsap, -.2);
  { const B = bat(), ts = [];
    for (let i = 0; i < 11; i++) ts.push(.17 + i * .076);
    const strake = (s, f0, f1, t0, t1) => { const a = [], c = [], n = Math.max(2, Math.round((t1 - t0) / .09)); for (let i = 0; i <= n; i++) { const t = t0 + (t1 - t0) * i / n; a.push(hp(t, f0, s)); c.unshift(hp(t, f1, s)); } return a.concat(c); };
    const SK = [[0, .34, .14, .97, -.3], [.34, .56, .17, .9, -.14], [.56, .76, .2, .62, -.02], [.76, .92, .24, .42, .06]], fp = t => { let m = 0; for (const k of SK) if (t >= k[2] && t <= k[3]) m = k[1]; return m; };
    [.3, .55, .8].forEach(t => B.l(AK, [[HX0 + HL * t, 5.44, 0], hp(t, .8, -1)], 1.4));
    for (let x = HX0 + .2; x < HX1 - .5; x += .72) B.box(x - .12, HY - .17, 0, x + .12, HY + .17, .32, '#8a6a48');
    B.cut().p(T(CAM, -.44), strake(-1, 0, .34, .14, .97)).p(T(CAM, -.34), strake(-1, .34, .56, .17, .9)).cut();
    ts.forEach(t => B.l(cF, FS.map(f => hp(t, f, -1)), 2)); B.l(T(CAM, -.16), ts.map(t => hp(t, 1, -1)), 1.4).cut();
    B.l(T(M.ahsap, -.1), [[HX0 + .1, HY, .36], [HX1 - .5, HY, .38]], 3.4).l(AK, [[HX0 - .32, HY, 0], [HX0 + .02, HY, 1.2]], 1.5);
    B.l(M.ahsap, [[HX0 + .14, HY, .34], [HX0 + .02, HY, 1.1], [HX0 - .04, HY, 1.95]], 3.4).l(M.ahsap, [[HX1 - .55, HY, .38], [HX1 - .22, HY, .52], [HX1 - .02, HY, .92], [HX1 + .1, HY, 1.45], [HX1 + .14, HY, 2.05]], 3.4);
    B.l(T(M.ahsap, .4), [[HX1 - .22, HY, .56], [HX1 - .02, HY, .96], [HX1 + .1, HY, 1.49], [HX1 + .14, HY, 2.05]], .8).cut();
    [.32, .55, .78].forEach(t => B.l(T(CAM, -.2), [hp(t, 1.04, -1), hp(t, 1.04, 1)], 1.6)); B.cut();
    SK.forEach(k => B.p(T(CAM, k[4]), strake(1, k[0], k[1], k[2], k[3]))); B.cut();
    ts.forEach(t => B.l(cN, FS.filter(f => f >= fp(t) - .01).map(f => hp(t, f, 1)), 2.6)); B.cut();
    B.l(T(CAM, .1), ts.map(t => hp(t, 1, 1)), 1.5).l(T(CAM, .1), ts.filter(t => t > .56).map(t => hp(t, .76, 1)), 1.3);
    [.3, .52, .7].forEach(t => B.l(AK, [[HX0 + HL * t, 6.98, 0], hp(t, .7, 1)], 1.6));
    b.item([HX0 - .1, 5.42, 0, HX1 + .2, 6.95, 2.06], B.svg(), { pts: [[HX0, HY, .3], [HX1, HY, .3], ...[.17, .4, .6, .8, .95].flatMap(t => [hp(t, 1, 1), hp(t, 1, -1)])] }); }

  /* --- maçuna (iki bacaklı vinç): sıradaki kaburgayı kıça indiriyor --- */
  const AP = [4.38, 6.25, 3.05];
  b.item([3.6, 5.2, 0, 4.4, 5.42, 3.05], ln(AK, lin([[3.62, 5.44, 0], AP]), 2.6), { cast: false });
  { const B = bat(), hk = [4.38, 6.25, 2.74], hd = pr(4.86, 7.36, 0), rib = s => FS.slice(0, 5).map(f => hp(.115, f, s, 1.12));
    B.l(HALAT, [AP, [2.62, 7.25, 0]], .9).cut().l(AK, [[3.62, 7.06, 0], AP], 2.8).l(T(AK, .4), [[3.6, 7.06, 0], [4.36, 6.25, 3.05]], .8);
    B.l(HALAT, [[4.2, 6.25, 2.92], [4.56, 6.25, 2.92]], 2.4).cut().l(HALAT, [AP, hk], 1).l(HALAT, [hk, rib(-1)[4]], .8).l(HALAT, [hk, rib(1)[4]], .8).cut();
    B.l(cF, rib(-1), 2.4).l(cN, rib(1), 2.6);
    b.item([3.6, 6.95, 0, 4.4, 7.1, 3.06], B.svg() + pth(DEMIR, K.circ(...pr(...hk), 1.7))
      + ln(HALAT, `M${P(4.4, 6.25, 2.9)} ${f1(hd[0] - 4.4)} ${f1(hd[1] - 10)}`, .9), { cast: false }); }
  b.fig(4.86, 7.36, 0, { body: M.bezM, legs: '#4a3a34', hat: 'sarik', step: 1, flip: true });
  b.art(2.62, 7.25, 0, ln(AK, 'M0 1V-5', 2), { r: .06 });

  /* --- baş tarafta sehpa iskele ve merdiven; üstünde tokmaklı usta --- */
  { const B = bat(), L = bat();
    [7.3, 8.36].forEach(x => B.l(AK, [[x, 7.02, 0], [x, 7.02, .68]], 1.5).l(AK, [[x, 7.28, 0], [x, 7.28, .68]], 1.7).l(M.ahsap, [[x, 7.0, .66], [x, 7.3, .66]], 1.6));
    B.l(M.ahsap, [[7.3, 7.28, .06], [8.36, 7.28, .6]], 1.2);
    b.item([7.2, 7.0, 0, 8.46, 7.3, .67], B.svg(), { cast: false });
    b.slab(7.18, 7.0, 8.48, 7.3, .72, .05, CAM).T.planks({ dir: 'h', step: .1 });
    L.l(AK, [[6.62, 7.06, 0], [7.16, 7.06, .8]], 1.4).l(AK, [[6.62, 7.26, 0], [7.16, 7.26, .8]], 1.4); for (let k = 1; k < 6; k++) L.l(M.ahsap, [[6.62 + .54 * k / 6, 7.06, .8 * k / 6], [6.62 + .54 * k / 6, 7.26, .8 * k / 6]], 1.1);
    b.item([6.6, 7.04, 0, 7.17, 7.28, .82], L.svg(), { cast: false }); }
  b.fig(7.82, 7.12, .72, { body: '#b5553c', legs: '#4a3a34', hat: 'none', hair: '#2a2420' });
  b.art(7.82, 7.12, .72, pth('#6a4a30', 'M-2.6 -14.4h5.2l.5 7h-6.2z') + ln(AK, 'M4.2 -14.4L8 -20', 1.1) + pth(M.ahsapA, 'M6.4 -22.8l4.2 2.4l-1.3 2.3l-4.2 -2.4z'), { bb: [7.7, 7.0, .72, 7.94, 7.26, 1.66] });

  /* --- hızar sehpası: yarısı biçilmiş tomruk, üstte ve altta iki hızarcı --- */
  { const B = bat(), ly = 6.1;
    [9.75, 11.25].forEach(x => { B.l(AK, [[x, ly - .42, 0], [x, ly - .12, .74]], 1.6).l(AK, [[x, ly + .42, 0], [x, ly + .12, .74]], 1.8).l(M.ahsap, [[x, ly - .3, .72], [x, ly + .3, .72]], 2.6).l(AK, [[x, ly - .3, .3], [x, ly + .3, .3]], 1.2); });
    b.item([9.7, 5.66, 0, 11.3, 6.54, .7], B.svg(), { cast: false });
    b.item([10.5, ly - .03, .28, 10.6, ly + .03, 1.6], ln('#c9d2da', lin([[10.55, ly, .3], [10.55, ly, 1.56]]), 1.8) + ln(AK, lin([[10.47, ly, 1.56], [10.63, ly, 1.56]]) + lin([[10.47, ly, .3], [10.63, ly, .3]]), 1.6), { cast: false });
    b.fig(10.74, ly + .03, 0, { body: '#7a8a5a', legs: '#3a3230', hat: 'hasir', flip: true });
    const G = logX(bat(), 9.45, 11.62, ly, .86, .15, '#b98a58', '#e0bf85');
    G.l('#3a2c22', [[10.55, ly - .095, .98], [11.62, ly - .095, .98]], 1).l('#3a2c22', [[11.62, ly, 1.01], [11.62, ly, .71]], .9);
    b.item([9.45, ly - .15, .71, 11.62, ly + .15, .99], G.svg(), { pts: [[9.45, ly, .86], [11.62, ly, .86]] }); }
  b.fig(10.3, 6.1, .99, { body: M.bez, legs: '#5a4a3a', hat: 'fes' });
  b.art(10.3, 6.1, .99, ln(M.tenK, 'M3.6 -14.2L6 -13', 1.6), { bb: [10.2, 6.0, .99, 10.4, 6.2, 1.8] });

  /* --- eğri kütük yontan keserci --- */
  { const B = bat(); B.box(8.9, 6.66, 0, 9.02, 6.9, .14, AK).cut(); logX(B, 8.72, 9.6, 6.78, .25, .11, CAM, '#ecd29a');
    b.item([8.72, 6.64, 0, 9.6, 6.92, .37], B.svg(), { cast: false }); }
  b.fig(9.2, 7.05, 0, { body: '#c9a04e', legs: '#4a3a34', hat: 'sarik', hatCol: '#d9d2c2' });
  b.art(9.2, 7.05, 0, pth('#6a4a30', 'M-2.6 -14.4h5.2l.5 7h-6.2z') + ln(AK, 'M4.2 -9.6L7.4 -15.4', 1.1) + pth('#c9d2da', 'M5.6 -16.6l3.4 1.4l-1.6 2.2z'), { bb: [9.08, 6.93, 0, 9.32, 7.17, .9] });

  /* --- sehpalarda yedek direk ve seren, yelken bezi ruloları --- */
  { const B = bat(), my = 7.18;
    [9.8, 10.8, 11.8].forEach(x => B.l(AK, [[x, my - .22, 0], [x, my + .16, .34]], 1.5).l(AK, [[x, my + .22, 0], [x, my - .16, .34]], 1.5));
    B.cut().l(T(CAM, -.2), [[9.7, my - .14, .3], [11.95, my - .14, .3]], 2).cut();
    B.p('#c9a36a', [[9.5, my, .3], [12.1, my, .33], [12.1, my, .43], [9.5, my, .46]]).l(T('#c9a36a', .4), [[9.5, my, .45], [12.1, my, .42]], .9).l(DEMIR, [[9.66, my, .29], [9.66, my, .46]], 1.6).l(DEMIR, [[11.66, my, .32], [11.66, my, .44]], 1.4);
    b.item([9.5, my - .24, 0, 12.1, my + .24, .47], B.svg(), { pts: [[9.5, my, .38], [12.1, my, .38]] });
    const R = bat(); logX(R, 10.55, 11.5, 6.68, .1, .1, M.bez, '#cfc3a4'); logX(R, 10.62, 11.58, 6.86, .1, .1, '#e6dcc2', '#cfc3a4'); logX(R, 10.5, 11.46, 6.77, .27, .1, M.bez, '#cfc3a4');
    b.item([10.5, 6.58, 0, 11.58, 6.96, .38], R.svg(), { cast: false }); }
  // gözün ayağına yaslı kalaslar
  [[6.56, -.1], [6.8, .04]].forEach(([x, dt]) => b.poly3([[x, 5.6, 0], [x + .2, 5.6, 0], [x + .2, 5.28, 1.3], [x, 5.28, 1.3]], T(CAM, dt), { n: [0, .97, .25], bb: [x, 5.28, 0, x + .2, 5.6, 1.3] }));
  b.lamp(11.86, 7.4);

  b.tag(6, 7.4, 0).doorAt(4.8, 5.3);
});
