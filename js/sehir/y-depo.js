/* Depo — liman ambarı: yan yana üç dik beşik çatılı göz (mahyalar x boyunca), kara ahşap kaplı alınlıkları rıhtıma (+x, gölge) bakar.
   Gotik üslup: kalın taş zemin duvarlar ve payandalar, arduvaz çatılar, sivri kemerli demir kuşaklı çift kanat kapılar;
   alınlıklarda yük kapakları ve vinç kirişleri, zincirlerde asılı yük. Aydınlık +y ucunda kara ahşap kâtip odası ve tartı avlusu.
   Işık: tartı avlusunda tek demir mangal. Parsel 6.5 × 9; arka (x=0) istinat duvarına yaslı. */
CK.def('depo', { w: 6.5, d: 9, name: 'Depo' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, f1 = K.f1, PL = K.PL, pr = K.pr, P = K.P;
  const TAS = M.gTas, TASA = M.gTasA, TASK = M.gTasK, CATI = M.gCati, HALAT = '#6a5a44';
  const X0 = .3, X1 = 4.9;
  const S = q => 'M' + q.map(p => f1(p[0]) + ' ' + f1(p[1])).join(' ');
  // zincir: kesik kalın çizgi + ince öz
  const zincir = (pts, o = {}) => { const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]), zs = pts.map(p => p[2]);
    b.item(o.bb || [Math.min(...xs) - .03, Math.min(...ys) - .03, Math.min(...zs), Math.max(...xs) + .03, Math.max(...ys) + .03, Math.max(...zs)],
      ln(T(M.gDemir, .25), 'M' + PL(pts), 2.1, 'stroke-dasharray="1.8 1.1"') + ln(T(M.gDemir, -.3), 'M' + PL(pts), .7), { cast: false }); };

  /* --- zemin: rıhtım döşemesi, derzler, eşik lekeleri; mangal ışığı --- */
  b.pave(4.9, 0, 6.5, 9, TASK); b.pave(0, 7.4, 4.9, 9, TASK);
  let dz = '';
  for (let i = 0, y = .55; y < 9; y += .7, i++) { dz += `M${P(4.95, y)} ${P(6.5, y)}`; if (i % 2) for (let x = 5.4 + (i % 4) * .2; x < 6.4; x += .9) dz += `M${P(x, y)} ${P(x, Math.min(9, y + .7))}`; }
  for (let i = 0, x = .7; x < 4.9; x += .75, i++) dz += `M${P(x, 7.45 + (i % 2) * .5)} ${P(x, 9)}`;
  b.ground(ln(T(TASK, -.16), dz + `M${P(0, 8.3)} ${P(4.9, 8.3)}`, .7));
  [[1.4, .75], [3.85, .85], [6.3, .75]].forEach(([y, h]) => b.gpoly([[4.9, y - h], [5.75, y - h * .8], [5.9, y], [5.75, y + h * .8], [4.9, y + h]], '#4a4640', { op: .6 }));
  b.gpoly([[3.55, 8.2], [4.2, 8.12], [4.42, 8.62], [3.9, 8.86], [3.45, 8.6]], '#6a604a', { op: .6 });                           // dökülmüş tahıl
  b.spill(3.0, 8.15, 1.1, { op: .7 });

  /* --- yardımcılar --- */
  // sivri kemerli ambar kapısı (kit kapısı) + o.open: dışa açılmış sağ kanat ve karanlık iç
  const kapi = (f, a, w, h, yj, o = {}) => {
    f.door(a, w, h, { kind: 'point', col: M.gAhsapK, sove: TASA, double: true, open: o.open, floor: '#3a3632' });
    f.poly([[a + w / 2 - .07, h + .02], [a + w / 2 + .07, h + .02], [a + w / 2 + .09, h + .2], [a + w / 2 - .09, h + .2]], TASA, 3.3, .1);       // kilit taşı
    if (!o.open) { for (const bb of [.26, h * .62]) f.line([[a + .06, bb], [a + w - .06, bb]], M.gDemir, 1.6, 6.3, .1); return; }
    // içeride sandık ve fıçı karaltıları
    f.put(4.6, K.kf('#3a342e'), f.shapeD('arch', a + .2, 0, .32, .46, -.32) + f.shapeD('rect', a + .56, 0, .3, .32, -.32));
    // dışa açılmış kanat (iç yüzü görünür, güneş alır): sivri tepeli
    const lw = w / 2 - .02, top = h - .02, sh = [[0, 0], [lw, 0], [lw, top - lw * .9], [lw * .2, top], [0, top - .02]];
    const L = new K.Face([X1, yj, 0], [1, 0, 0], [0, 0, 1], lw, h, [0, 1, 0], sh); L.fill(M.gAhsapK, .1); L.planks({ dir: 'v', step: .14, dt: -.12 });
    L.line([[.03, .26], [lw - .03, .26]], M.gDemir, 2, 6, 0).line([[.03, h * .62], [lw - .03, h * .62]], M.gDemir, 2, 6, 0);
    b.item([X1, yj - .03, 0, X1 + lw, yj + .03, h], () => L.svg(), {});
  };
  // numara levhası: kara demir sac üstünde kemik rengi çubuklar (I, II, III)
  const levha = (f, am, bb, n) => { f.rect(am - .28, bb, .56, .24, M.gDemir, 7, .1).rect(am - .25, bb + .03, .5, .18, T(M.gDemir, -.1), 7.1, 0);
    for (let i = 0; i < n; i++) f.rect(am - (n - 1) * .06 + i * .12 - .022, bb + .055, .044, .13, M.gKemik, 7.2, 0); };
  // vinç kirişi: alınlıktan çıkan kara kalas + demir makara; makaranın alt ucunu döner
  const vinc = (y, z, len) => {
    b.box(X1 - .05, y - .05, z - .06, X1 + len, y + .05, z + .06, M.gAhsapK, { edge: false });
    b.line3([[X1, y, z - .55], [X1 + len * .55, y, z - .06]], M.gAhsapK, 1.8);                                                       // payanda kolu
    b.art(X1 + len - .12, y, z - .06, ln(M.gDemir, 'M0 0v2.5', 1.2) + pth(T(M.gDemir, -.2), K.circ(0, 5, 2.8)) + pth(T(M.gDemir, .3), K.circ(0, 5, 1.1)), { bb: [X1 + len - .2, y - .05, z - .35, X1 + len - .04, y + .05, z - .06] });
    return [X1 + len - .12, y, z - .06 - 7.6 / K.ZU];
  };
  // payanda: eğimli şapkalı taş ayak (+x cephesinde)
  const payanda = (yc, out = .38, z1 = 1.2) => {
    const hw = .17, zt = z1 + .45, p = b.box(X1, yc - hw, 0, X1 + out, yc + hw, z1, TASK, { edge: false });
    p.L.courses({ rh: .26, bw: .5, dens: .5 }).band(0, .3, M.gKara, 0); p.R.courses({ rh: .26, bw: .5, dens: .5 }).band(0, .3, M.gKara, 0);
    b.item([X1, yc - hw, z1, X1 + out, yc + hw, zt], pth(T(TASA, K.toneOf(K.unit([.45, 0, out]))), 'M' + PL([[X1, yc - hw, zt], [X1, yc + hw, zt], [X1 + out, yc + hw, z1], [X1 + out, yc - hw, z1]]) + 'Z')
      + pth(T(TASK, K.toneOf([0, 1, 0])), 'M' + PL([[X1, yc + hw, z1], [X1 + out, yc + hw, z1], [X1, yc + hw, zt]]) + 'Z'), { cast: false });
    return p;
  };
  // bir göz: taş duvar + dik arduvaz beşik + kara ahşap alınlık (yük kapağı) + kapı + levha
  const goz = (y0, y1, zw, rise, no, o = {}) => {
    const w = y1 - y0, m = w / 2, ym = (y0 + y1) / 2, dw = o.dw || 1.2, dh = o.dh || 1.3;
    const g = b.box(X0, y0, 0, X1, y1, zw, TAS, { T: null }), R = g.R;
    R.courses({ rh: .26, bw: .6, dens: .45 }).stones(4, { rh: .26, b0: .3, dt: .06 }).band(0, .3, M.gKara, 0).band(zw - .1, .1, TASA, .08, 3).shadeTop(.16, -.18);
    const rf = b.gable(X0, y0, X1, y1, zw, rise, CATI, { axis: 'x', ov: .12, wall: M.gAhsapK, tex: 'rows', step: .17 }), G = rf.G;
    G.planks({ dir: 'v', step: .16, dt: -.16 }).band(0, .08, M.gAhsapK, -.2, 3);
    // alınlık: yük kapağı (kapalı, demir kuşaklı) ve üstte dar havalandırma yarığı
    G.rect(m - .3, .18, .6, .72, M.gAhsap, 4, -.05).rect(m - .26, .22, .52, .64, M.gAhsapK, 4.1, 0).line([[m, .22], [m, .86]], M.gAhsap, 1, 6, -.1);
    G.line([[m - .26, .34], [m + .26, .34]], M.gDemir, 1.3, 6.2).line([[m - .26, .74], [m + .26, .74]], M.gDemir, 1.3, 6.2);
    G.shp('point', m - .06, 1.0, .12, .3, '#1a1816', 4);
    (o.yama || []).forEach(([a, bb, l, dt]) => rf.A.rect(a, bb, l, .16, CATI, 2.3, dt));                                  // kırık arduvaz yamaları
    b.line3([[X1 + .12, ym, zw + rise], [X1 + .12, ym, zw + rise + .38]], M.gDemir, 1.4);                                   // mahyada demir sivri uç
    kapi(R, m - dw / 2, dw, dh, y1 - (m + dw / 2), o);
    levha(R, m, Math.min(zw - .38, dh + .22), no);
    return { g, G, rf, m, ym, zt: zw + rise };
  };

  /* --- üç göz: ortadaki daha geniş ve yüksek --- */
  const A = goz(.3, 2.5, 1.6, 1.5, 1, { yama: [[1.2, .9, .5, -.08], [3.1, 1.4, .4, .06]] });
  const Bz = goz(2.5, 5.2, 1.8, 1.85, 2, { dw: 1.4, dh: 1.45, open: true, yama: [[2.2, 1.1, .5, .06]] });
  const C = goz(5.2, 7.4, 1.6, 1.5, 3, { yama: [[.9, .6, .4, -.08], [2.8, 1.5, .5, .05]] });

  /* --- payandalar --- */
  payanda(.5, .3); payanda(2.5); payanda(5.2);
  for (const y of [2.5, 5.2]) b.line3([[X1 + .04, y, 1.78], [X1 + .36, y, 1.7]], M.gDemir, 2.4);                 // demir çörtenler

  /* --- vinç kirişleri: I. gözde sandık zincirde, ortadaki boş kanca, III. zincir duvara bağlı --- */
  const v1 = vinc(A.ym, 2.68, 1.0), v2 = vinc(Bz.ym, 3.15, .9), v3 = vinc(C.ym, 2.68, .7);
  zincir([v1, [v1[0], v1[1], 1.5]]);
  b.crate(v1[0], v1[1], .96, .38, { col: M.gAhsap });
  b.item([v1[0] - .19, v1[1] - .19, 1.26, v1[0] + .19, v1[1] + .19, 1.5], ln(T(M.gDemir, .2), `M${P(v1[0] - .19, v1[1] + .19, 1.26)} ${P(v1[0], v1[1], 1.5)} ${P(v1[0] + .19, v1[1] + .19, 1.26)}M${P(v1[0], v1[1], 1.5)} ${P(v1[0] + .19, v1[1] - .19, 1.26)}`, 1, 'stroke-dasharray="1.4 .9"'), { cast: false });
  zincir([v2, [v2[0], v2[1], 2.0]]);
  b.art(v2[0], v2[1], 2.0, ln(M.gDemir, 'M0 0v2q0 2.6 -2 2.2', 1.4), { bb: [v2[0] - .05, v2[1] - .05, 1.78, v2[0] + .05, v2[1] + .05, 2.0] });
  zincir([v3, [X1 + .05, C.ym - .78, 1.2]]);

  /* --- +y uç duvarı (aydınlık): yan kapı, dar parmaklıklı pencereler, yosun --- */
  const L = C.g.L;
  L.courses({ rh: .26, bw: .6, dens: .4, a0: 2 }).stones(6, { rh: .26, a0: 2, dt: .06 }).band(0, .3, M.gKara, 0).band(1.5, .1, TASA, .08);
  L.door(2.5, .64, 1.0, { kind: 'point', col: M.gAhsapK, b: .3, sove: TASA });
  L.win(3.36, .8, .2, .56, { kind: 'point', frame: M.gDemir, sove: TASA, bars: [1, 2], lit: false });
  L.win(4.1, .8, .2, .56, { kind: 'point', frame: M.gDemir, sove: TASA, bars: [1, 2], lit: false });
  L.poly([[2.16, 0], [2.42, 0], [2.36, .6], [2.2, .9], [2.12, .4]], M.gYosun, 2.3, -.05).poly([[4.3, 0], [4.56, 0], [4.5, .4]], M.gYosun, 2.3, -.05);
  b.stairs(2.72, 7.4, 3.52, 7.9, .3, 0, 'y', TAS, { rise: .15 });

  /* --- kâtip odası: kara ahşap kaplama, sundurma arduvaz çatı --- */
  const of = b.box(.3, 7.4, 0, 2.3, 8.5, 1.12, M.gAhsap, { T: null });
  of.L.planks({ dir: 'v', step: .16, dt: -.16 }).band(0, .26, TASK, 0).timber({ col: M.gAhsapK, posts: [.04, 1.0, 1.96], rails: [.28, 1.06], wid: 2.2 }).shadeTop(.16, -.2);
  of.L.door(.2, .5, .86, { kind: 'point', col: M.gAhsapK, sove: M.gAhsapK, b: .26 });
  of.L.win(1.3, .5, .26, .42, { kind: 'point', frame: M.gAhsapK, bars: [1, 2], lit: false });
  of.R.planks({ dir: 'v', step: .16, dt: -.16 }).band(0, .26, TASK, 0).timber({ col: M.gAhsapK, posts: [.04, 1.06], rails: [.28, 1.06], wid: 2.2 });
  b.poly3([[2.3, 8.5, 1.12], [2.3, 7.4, 1.12], [2.3, 7.4, 1.6]], M.gAhsap, { n: [1, 0, 0], bb: [2.28, 7.4, 1.12, 2.3, 8.5, 1.6] });
  b.shed(.2, 7.4, 2.46, 8.7, 1.05, 1.62, '+y', CATI, { tex: 'rows' });
  b.chimney(.8, 7.72, 1.46, 1.0, { mat: TASK, w: .3, s: .6 });

  /* --- eşya yardımcıları --- */
  // yan yatmış fıçı: ekseni y boyunca, ağzı +y'ye (aydınlığa) bakar
  const yatik = (x, y0, y1, z, col = M.gAhsap) => {
    const r = .19, C2 = (t, y, k = 1) => pr(x + Math.cos(t) * r * k, y, z + r + Math.sin(t) * r * k), c0 = pr(x, y0, z + r), c1 = pr(x, y1, z + r), ci = K.circ(0, 0, 1.9);
    const el = (c, k) => `transform="matrix(${K.f2(2.4 * k)} ${K.f2(1.2 * k)} 0 ${K.f2(-2.94 * k)} ${f1(c[0])} ${f1(c[1])})"`;
    let hp = ''; for (const f of [.2, .8]) hp += S([-.88, -.5, -.1, .3, .7, 1.1, 1.5, 1.9, 2.25].map(t => C2(t, y0 + (y1 - y0) * f, 1.03)));
    b.item([x - r, y0, z, x + r, y1, z + 2 * r], pth(T(col, -.36), ci, el(c0, 1)) + pth(T(col, -.36), S([C2(-.886, y0), C2(-.886, y1), C2(2.256, y1), C2(2.256, y0)]) + 'Z')
      + pth(T(col, .04), S([C2(.9, y0), C2(1.6, y0), C2(2.256, y0), C2(2.256, y1), C2(1.6, y1), C2(.9, y1)]) + 'Z') + ln(T(M.gDemir, -.1), hp, 1.2) + pth(T(M.gAhsapA, .06), ci, el(c1, 1)) + ln(T(col, -.24), ci, .3, el(c1, .62)), { cast: z < .01 });
  };
  const amfora = (x, y, rot, c = '#6a4a3a') => b.art(x, y, 0, `<g transform="rotate(${rot})">` + pth(T(c, -.3), 'M0 0Q-2 -1 -3.5 -6.5Q-4.5 -11 -1.5 -13L-1.9 -16.4h3.8L1.5 -13Q4.5 -11 3.5 -6.5Q2 -1 0 0Z')
    + pth(T(c, .12), 'M0 0Q-2 -1 -3.5 -6.5Q-4.5 -11 -1.5 -13L-1.9 -16.4h1.7L.1 -13Q-1.8 -9 -.6 -4Z') + ln(T(c, -.16), 'M-1.5 -15.6Q-5.2 -14.8 -3.8 -10.6M1.5 -15.6Q5.2 -14.8 3.8 -10.6', 1) + '</g>', { bb: [x - .1, y - .1, 0, x + .1, y + .1, .56] });
  // iple bağlı balya
  const balya = (x0, y0, z, w, d, h, col = '#6e6450') => { const q = b.box(x0, y0, z, x0 + w, y0 + d, z + h, col, { edge: false, cast: z < .01 }), ip = '#3a3024';
    for (const t of [.28, .72]) { q.L.line([[w * t, 0], [w * t, h]], ip, 1, 6); q.R.line([[d * t, 0], [d * t, h]], ip, 1, 6); q.T.line([[w * t, 0], [w * t, d]], ip, 1, 6).line([[0, d * t], [w, d * t]], ip, 1, 6); } };
  const SKIN = '#b89478';

  /* --- I. göz önü: balyalar, zincirdeki sandığı karşılayan hamal, baba ve halat --- */
  balya(5.45, .32, 0, .62, .44, .34); balya(5.5, .8, 0, .6, .44, .34, '#5e5646'); balya(5.5, .5, .34, .58, .44, .32, '#746a54');
  b.fig(6.12, 1.88, 0, { body: '#4e4a42', legs: '#2a2624', hat: 'none', skin: SKIN });
  b.art(6.12, 1.88, 0, ln(SKIN, 'M-4.2 -14.6L-5.4 -21.4M4.2 -14.6L5 -21.6', 1.6), { bb: [6.0, 1.76, .4, 6.24, 2.0, .9] });
  b.bollard(6.36, .9).bollard(6.36, 4.72);
  b.art(6.3, 1.25, 0, ln(T(HALAT, -.12), K.ell(0, -1, 6.4, 3.2) + K.ell(0, -2.4, 5, 2.5), 1.5) + ln(HALAT, K.ell(0, -3.6, 3.6, 1.8), 1.5) + ln(T(HALAT, -.12), 'M5 -2Q9 -4 7.4 -9', 1.3), { r: .28, h: .2 });
  b.critter('guvercin', 6.36, .9, .3, { col: '#26262a' });

  /* --- I–II arası: sandık yığını ve kedi --- */
  b.crate(5.74, 2.6, 0, .52, { col: M.gAhsap }).crate(6.16, 2.92, 0, .38, { col: M.gAhsapK });
  b.critter('kedi', 5.76, 2.62, .42, { col: '#2e2c2c' });

  /* --- II. göz: içeri çuval taşıyan hamal --- */
  b.fig(5.52, 4.02, 0, { body: '#3e4248', legs: '#2a2624', hat: 'none', step: 1, skin: SKIN });
  b.art(5.52, 4.02, 0, pth(T('#7a7058', -.22), 'M-11 -19Q-12.4 -24.6 -6.6 -25.6Q-.6 -26 -.2 -21.6Q-.4 -17.6 -5.6 -17.2Q-9.6 -17 -11 -19Z') + pth('#7a7058', 'M-11 -19Q-12.4 -24.6 -6.6 -25.6Q-3 -25.6 -2.6 -23.4Q-6 -20 -9.4 -19Z') + ln(SKIN, 'M-4.4 -14.6L-6.4 -18', 1.6), { bb: [5.4, 3.9, .5, 5.64, 4.14, .95] });

  /* --- II–III arası: yan yatmış fıçılar, küpler --- */
  yatik(5.62, 4.86, 5.42, 0); yatik(6.02, 4.92, 5.48, 0, M.gAhsapK); yatik(5.82, 4.9, 5.46, .33, M.gAhsapA);
  amfora(5.12, 5.5, -9); amfora(5.3, 5.66, 7, '#5a4234');

  /* --- III. göz önü: el arabası, çuvallar --- */
  b.cart(6.0, 6.5, 0, 'y', { load: '#6e6450', col: M.gAhsap });
  b.sack(5.14, 7.0, 0, { col: '#6a6050' }).sack(5.16, 7.36, 0, { col: '#5e5646' });

  /* --- köşe: kara branda altında yüksek yığın --- */
  const tb = b.box(4.8, 8.06, 0, 5.6, 8.8, .44, M.gAhsap, { edge: false });
  tb.L.planks({ dir: 'h', step: .15 }).line([[.4, 0], [.4, .44]], M.gAhsapK, 1.2, 6); tb.R.line([[.38, 0], [.38, .44]], M.gAhsapK, 1.2, 6);
  const BR = '#5a5a52', q3 = pts => 'M' + PL(pts) + 'Z';
  b.item([4.72, 7.98, .44, 5.68, 8.88, 1.0], pth(T(BR, K.toneOf([0, 0, 1])), q3([[4.98, 8.18, .98], [5.46, 8.18, .93], [5.46, 8.62, .9], [4.98, 8.62, .96]]))
    + pth(T(BR, K.toneOf(K.unit([0, 1, .4]))), q3([[4.98, 8.62, .96], [5.46, 8.62, .9], [5.66, 8.86, .24], [5.44, 8.86, .38], [5.2, 8.86, .2], [4.96, 8.86, .34], [4.74, 8.86, .22]]))
    + pth(T(BR, K.toneOf(K.unit([1, 0, .4]))), q3([[5.46, 8.62, .9], [5.46, 8.18, .93], [5.66, 8.0, .28], [5.66, 8.22, .16], [5.66, 8.44, .36], [5.66, 8.66, .18], [5.66, 8.86, .24]]))
    + ln(T(BR, -.3), `M${P(5.14, 8.62, .94)} ${P(5.08, 8.86, .28)}M${P(5.32, 8.62, .92)} ${P(5.38, 8.86, .36)}M${P(5.46, 8.46, .91)} ${P(5.66, 8.36, .3)}M${P(5.46, 8.3, .92)} ${P(5.66, 8.14, .22)}`, .8)
    + ln(HALAT, `M${P(4.84, 8.86, 0)} ${P(5.06, 8.62, .95)} ${P(5.06, 8.18, .97)}M${P(5.66, 8.54, 0)} ${P(5.46, 8.5, .91)} ${P(4.98, 8.5, .96)}`, 1), { pts: [[4.98, 8.18, .98], [5.46, 8.18, .93], [5.46, 8.62, .9], [4.98, 8.62, .96]] });

  /* --- tartı avlusu: kantar, kâtip, mangal (tek ışık), merdiven, küpler, sandıklar --- */
  b.art(3.9, 8.5, 0, pth(T(TASK, -.1), 'M-7 0l7 -3.5l7 3.5l-7 3.5z') + ln(M.gAhsapK, 'M0 0V-28', 2.4) + ln(M.gAhsapK, 'M-5 1L0 -8L5 1', 1.4) + ln(M.gAhsap, 'M-12 -32.6L12 -21', 2) + pth(M.gBronz, K.circ(0, -27, 1.8))
    + ln('#3a3630', 'M-12 -32.6L-16.4 -21.4M-12 -32.6L-7.6 -21.4M12 -21L7.6 -8.6M12 -21L16.4 -8.6', .7) + pth(T(M.gBronz, -.2), K.ell(-12, -21, 5.4, 2.4) + K.ell(12, -8.2, 5.4, 2.4)) + pth(T(M.gBronz, .2), K.ell(-12, -21.6, 4.4, 1.8) + K.ell(12, -8.8, 4.4, 1.8))
    + pth('#6e6450', 'M8.6 -9.4Q8 -14.6 12 -15Q16 -14.6 15.4 -9.4Z') + pth(T(M.gDemir, -.1), 'M-14.4 -22h2.2v-2.6h-2.2zM-11.4 -22.2h1.8v-1.8h-1.8z'), { bb: [3.4, 8.38, 0, 4.4, 8.62, 1.2] });
  b.fig(3.2, 8.84, 0, { body: '#2e2a2c', robe: true, hat: 'ortu', hatCol: '#22201e', legs: '#22201e', skin: SKIN });
  b.art(3.2, 8.84, 0, pth(M.gKemik, 'M2.6 -14.6l5.2 -1.2l1 6l-5.2 1.2z') + ln('#4a4238', 'M4 -13.2l3 -.7M4.3 -11.6l3 -.7M4.6 -10l3 -.7', .5), { bb: [3.08, 8.72, .3, 3.32, 8.96, .7] });
  // mangal: üç ayaklı demir tas, içinde kor
  b.art(3.0, 8.15, 0, ln(M.gDemir, 'M-4 0L-3 -6M4 0L3 -6M0 1.6L0 -5', 1.2) + pth(M.gDemir, 'M-5.4 -7h10.8q-1 3.4 -5.4 3.6q-4.4 -.2 -5.4 -3.6z') + pth(M.gKor, K.ell(0, -7.1, 4.6, 1.3)) + pth(M.gAtes, K.ell(-.6, -7.4, 2.4, .7)),
    { bb: [2.86, 8.01, 0, 3.14, 8.29, .32] });
  b.fx('fire', 3.0, 8.15, .3, { s: .3 });
  b.sack(4.56, 7.76, 0, { col: '#6a6050' });
  // merdiven: uç duvara yaslı
  { const xa = 3.94, dx = .26, ya = 7.92, yb = 7.44, zt = 1.5; let d = `M${P(xa, ya, 0)} ${P(xa, yb, zt)}M${P(xa + dx, ya, 0)} ${P(xa + dx, yb, zt)}`, rg = '';
    for (let i = 1; i < 8; i++) { const t = i / 8; rg += `M${P(xa, ya + (yb - ya) * t, zt * t)} ${P(xa + dx, ya + (yb - ya) * t, zt * t)}`; }
    b.item([xa, yb - .02, 0, xa + dx, ya, zt], ln(T(M.gAhsap, -.1), rg, 1) + ln(M.gAhsapA, d, 1.5), { cast: false }); }
  amfora(2.6, 7.56, -8);
  b.crate(2.42, 8.7, 0, .44, { col: M.gAhsapK });

  /* --- çatıda kuzgunlar --- */
  b.critter('guvercin', 2.0, Bz.ym, Bz.zt, { col: '#26262a' }).critter('guvercin', 3.4, C.ym, C.zt, { col: '#26262a', flip: true });
  b.fx('birds', 2.5, C.ym, C.zt + .3, { n: 3 });

  b.tag(6.2, 8.9, 0).doorAt(5.6, 3.85);
});
