/* Yel değirmeni — kara ahşap, yukarı doğru daralan sekizgen gövdeli kasvetli değirmen: kara taş etek, katran kara bindirme tahta,
   dik sekizgen külah, demir sivri uç ve rüzgârgülü; kanat göbeği +y yüzünde, kanatlar kirli, sökük bezli.
   Sağ arkada kara ahşap un ambarı (sundurma çatı, tek mum ışıklı pencere — yapının tek ışığı), kapı önünde değirmen taşı basamaklar,
   yük kancası, yüklü eşek, değirmenci. Parsel 4 × 4; kır parçası olduğu için zemin kuru çayır üstüne çamur lekeleridir.
   opt.seed külah gerecini değiştirir. */
CK.def('degirmen', { w: 4, d: 4, name: 'Yel Değirmeni' }, (b, K, opt) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, pr = K.pr, P = K.P, PL = K.PL, f1 = K.f1;
  const sd = (opt && opt.seed) || 7, rs = K.rng(sd * 131 + 5);
  const AH = M.gAhsap, AK = M.gAhsapK, AA = M.gAhsapA, KR = M.gKara, TK = M.gTasK, TA = M.gTasA, capC = sd % 2 ? M.gCati : T(AK, .06), un = '#9a9286';
  const RAD = Math.PI / 180;

  /* --- zemin: kuru çayır, kapıdan yola inen çamur, un tozu --- */
  b.gpoly([[-.25, .5], [1.1, -.25], [3.3, -.2], [4.25, .9], [4.25, 3.2], [3.4, 4.25], [1.1, 4.25], [-.25, 3.3]], T(M.gYosun, -.1), { op: .55 });
  b.gpoly([[2.55, 1.55], [3.95, 1.4], [4.3, 2.3], [4.3, 3.5], [3.5, 3.75], [2.5, 3.5], [1.95, 2.9], [2.2, 2.2]], '#4e4236', { op: .9 });
  b.gpoly([[3.1, 2.6], [3.7, 2.55], [3.9, 2.95], [3.4, 3.2], [3.0, 3.0]], '#363e44', { op: .6 });
  b.gpoly([[2.9, 1.45], [3.85, 1.4], [3.9, 1.95], [3.2, 2.2], [2.85, 1.95]], un, { op: .35 });

  /* --- gövde: sekizgen, daralan; kara taş etek, kara bindirme tahta --- */
  const cx = 1.55, cy = 1.5, R0 = 1.06, R1 = .7, Z0 = .5, H = 3.0;
  const ov = (R, k, z) => [cx + R * Math.cos((22.5 + 45 * k) * RAD), cy + R * Math.sin((22.5 + 45 * k) * RAD), z];
  const oct = (R, z) => [0, 1, 2, 3, 4, 5, 6, 7].map(k => ov(R, k, z));
  // k. kenarın daralan yüzü: alt kenar (R0, Z0), üst kenar (R1, H). a soldan sağa, b eğim boyunca yukarı
  const yuz = k => { let A = ov(R0, k, Z0), B = ov(R0, k + 1, Z0), At = ov(R1, k, H), Bt = ov(R1, k + 1, H);
    if ((A[0] - A[1]) > (B[0] - B[1])) [A, B, At, Bt] = [B, A, Bt, At];
    const w = Math.hypot(B[0] - A[0], B[1] - A[1]), wt = Math.hypot(Bt[0] - At[0], Bt[1] - At[1]), u = [(B[0] - A[0]) / w, (B[1] - A[1]) / w, 0];
    const mb = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2, Z0], mt = [(At[0] + Bt[0]) / 2, (At[1] + Bt[1]) / 2, H], sv = [mt[0] - mb[0], mt[1] - mb[1], mt[2] - mb[2]], h = Math.hypot(...sv), v = sv.map(c => c / h);
    const an = 45 * (k + 1) * RAD, n = K.unit([Math.cos(an) * (H - Z0), Math.sin(an) * (H - Z0), (R0 - R1) * Math.cos(22.5 * RAD)]), d = (w - wt) / 2;
    const f = new K.Face(A, u, v, w, h, n, [[0, 0], [w, 0], [w - d, h], [d, h]]); f.fill(AH); f.d = d; return f; };
  const base = b.prism(oct(R0 + .08), 0, Z0, KR);
  base.faces.forEach(f => f.courses({ rh: .25, bw: .4, dens: .55 }).stones(2, { rh: .25 }).band(Z0 - .06, .06, TA, .06));
  const F = { 7: yuz(7), 0: yuz(0), 1: yuz(1) };
  for (const k of [7, 0, 1]) { const f = F[k]; f.planks({ dir: 'h', step: .17, dt: -.2, wid: 1 }).planks({ dir: 'h', step: .51, dt: .1, wid: .6 });
    f.line([[f.d * .02, 0], [f.d, f.h]], AK, 2.2, 6.5, -.1); }
  const subs = [F[7], F[0], F[1]];
  // yamalar, is, yosun
  F[1].poly([[.2, .3], [.5, .32], [.5, .62], [.22, .6]], AA, 2.7, -.08);
  F[0].poly([[.1, 0], [.62, 0], [.5, .26], [.16, .2]], M.gYosun, 2.7, -.08);
  // kapı (+x yüzü), yük kapağı, pencereler (sönük)
  F[7].door(.08, .44, .88, { kind: 'point', col: AK, sove: TK });
  F[7].rect(.12, 1.48, .44, .44, AK, 3, -.1).rect(.17, 1.48, .34, .38, '#1e1a18', 4, null);                                // açık yük kapağı (karanlık)
  F[0].win(.32, 1.0, .18, .4, { kind: 'point', frame: AK, sove: AA, lit: false, bars: [1, 2] });
  F[1].win(.3, 1.7, .16, .36, { kind: 'point', frame: AK, sove: AA, lit: false, bars: [1, 2] });
  F[0].win(.3, 2.0, .14, .26, { kind: 'point', frame: AK, lit: false, sill: false, bars: [1, 1] });
  b.item([cx - R0, cy - R0, Z0, cx + R0, cy + R0, H], () => subs.map(f => f.svg()).join(''), { pts: oct(R0, Z0).concat(oct(R1, H)) });
  // üst kuşak: kalın kiriş çemberi
  b.prism(oct(R1 + .08), H - .02, H + .12, AK);
  // kapı önü: değirmen taşı basamaklar
  b.cyl(2.84, 1.98, .56, 0, .15, TK, { top: TK, cast: false });
  b.art(2.84, 1.98, .15, ln(T(TK, -.3), 'M2 4L17 6M-2 6L-6 12M6 8L8 12.6M-13 3L-17 5M12 -2L18 -1', .8), { bb: [2.3, 1.44, .15, 3.4, 2.54, .16] });
  b.cyl(2.74, 1.92, .37, .15, .3, KR, { cast: false });

  /* --- külah: dik sekizgen; mil yuvası, mil, kanatlar, demir sivri uç ve rüzgârgülü --- */
  const RC = R1 + .16, ZT = H + .12, ZA = ZT + 1.25;
  { let sk = '', rb = '', rv = ''; const ap = [cx, cy, ZA], apo = RC * Math.cos(22.5 * RAD), hh = ZA - ZT;
    const lp = (p, q, t) => [p[0] + (q[0] - p[0]) * t, p[1] + (q[1] - p[1]) * t, p[2] + (q[2] - p[2]) * t];
    [4, 3, 5, 2, 6, 1, 7, 0].forEach(k => { const a = 45 * (k + 1) * RAD, n = K.unit([Math.cos(a) * hh, Math.sin(a) * hh, apo]); if (K.dot(n, K.VIEW) <= 0) return;
      const e0 = ov(RC, k, ZT), e1 = ov(RC, k + 1, ZT); sk += pth(T(capC, K.toneOf(n)), 'M' + PL([e0, e1, ap]) + 'Z'); rb += 'M' + PL([e0, ap]);
      for (const t of [.16, .34, .52, .7]) rv += 'M' + PL([lp(e0, ap, t), lp(e1, ap, t)]); });
    b.item([cx - RC, cy - RC, ZT, cx + RC, cy + RC, ZA], sk + ln(T(capC, -.34), rv, .8, 'opacity=".7"') + ln(T(capC, .26), rb, 1.2), { pts: oct(RC, ZT).concat([ap]) }); }
  const dy = cy + RC + .2, zm = ZT + .3;
  b.poly3([[cx, cy + .4, zm + .42], [cx, dy, zm + .3], [cx + .24, dy, zm], [cx + .24, cy + .7, zm + .16]], capC, { n: [1, 0, .9], dt: -.1, bb: [cx - .24, cy + .4, zm - .02, cx + .24, dy, zm + .42] });
  b.poly3([[cx - .24, dy, zm], [cx + .24, dy, zm], [cx, dy, zm + .3]], AK, { n: [0, 1, 0], bb: [cx - .24, dy - .02, zm - .01, cx + .24, dy, zm + .3] });
  b.line3([[cx, dy, zm + .08], [cx, dy + .16, zm + .06]], M.gDemir, 3.4);
  b.fx('sails', cx, dy + .17, zm + .06, { r: 1.9, axis: 'y', col: AK, cloth: '#6e665c' });
  b.art(cx, cy, ZA, ln(M.gDemir, 'M0 2V-13M-2.6 -6H2.6', 1.2) + pth(M.gDemir, 'M-1.4 -12.4L0 -16.6L1.4 -12.4Z') + pth(T(M.gDemir, .2), 'M.8 -10h6.4l-1.4 1.4l1.4 1.4h-6.4z'), { bb: [cx - .1, cy - .1, ZA, cx + .1, cy + .1, ZA + .58] });
  b.critter('guvercin', cx + RC * .7, cy - .1, ZT + .2, { col: '#26262c' });

  /* --- yük kancası: kapağın üstünde kiriş, makara, asılı çuval --- */
  const h0 = [cx + .84, cy - .02, 2.32], h1 = [h0[0] + .48, h0[1] + .14, 2.36];
  b.line3([h0, h1], AK, 2.4, { pad: .05 });
  b.art(h1[0] - .06, h1[1] - .02, 2.32, pth(M.gDemir, K.circ(0, 1.5, 1.8)) + ln('#4a4038', 'M0 3V17', .8) + pth(T(un, -.2), 'M-3.6 18q-2.6 6 -.4 11q4 2.4 8 0q2.2 -5 -.4 -11z') + pth(un, 'M-3.6 18q-2.6 6 -.4 11q1.6 1 3.2 1.2q-1 -6 .2 -12.2z') + ln('#4a4038', 'M-3.2 19h6.6', 1),
    { bb: [h1[0] - .2, h1[1] - .14, 1.2, h1[0] + .06, h1[1] + .1, 2.3] });

  /* --- un ambarı: kara ahşap, taş temel, sundurma çatı, baca; tek mum ışıklı pencere --- */
  const a = b.box(2.5, .2, 0, 3.8, 1.3, .96, AH);
  for (const f of [a.L, a.R]) f.planks({ step: .16, dt: -.2 }).band(0, .18, KR, -.04).shadeTop(.12);
  a.L.door(.34, .44, .76, { kind: 'point', col: AK, sove: AA });
  a.R.win(.44, .4, .22, .34, { kind: 'point', frame: AK, sove: AA, lit: true, bars: [1, 2] });
  b.spill(3.95, .8, .7, { op: .5 });
  b.poly3([[2.5, 1.3, .96], [3.8, 1.3, .96], [2.5, 1.3, 1.36]], AH, { n: [0, 1, 0], bb: [2.5, 1.28, .96, 3.8, 1.3, 1.34] });
  b.shed(2.52, .06, 3.96, 1.44, .92, 1.4, '+x', M.gCatiK, { tex: 'rows' });
  b.chimney(3.2, .5, 1.1, .55, { mat: TK, w: .28, s: .5 });
  b.critter('guvercin', 3.5, 1.3, 1.06, { col: '#26262c', flip: true });

  /* --- avlu: un çuvalları, değirmenci, yüklü eşek, kova --- */
  b.sack(3.44, 1.44, 0, { col: un, s: .66 }).sack(3.66, 1.46, 0, { col: un, s: .7 }).sack(3.55, 1.46, .17, { col: T(un, .1), s: .62 });
  b.fig(3.5, 2.4, 0, { body: '#5e5a52', legs: '#2e2a28', hat: 'ortu', hatCol: '#34302c', robe: true });
  b.art(3.5, 2.4, 0, pth(T(un, -.2), 'M1 -17.2q-1.4 -5 3 -6.4l6 1q3.4 1.6 2.6 5.4q-1 2.6 -4.6 2.2q-5 -.2 -7 -2.2zM12 -19.8l2.2 -1.4l.2 2.8z') + pth(un, 'M1 -17.2q-1.4 -5 3 -6.4l3.4 .6q1 3.4 -.6 7.4q-4.4 -.2 -5.8 -1.6z'), { bb: [3.38, 2.28, 0, 3.64, 2.54, .98] });
  const esek = () => { const g = '#5a554e', gd = T(g, -.34), gl = '#8a8378';
    return `<ellipse cx="1" cy="0" rx="12" ry="3.4" fill="#1b2440" opacity=".22"/>`
      + pth(gd, 'M-6.6 -7h1.9l-.3 7h-1.7zM4.4 -7h1.9l.3 7h-1.7z') + pth(g, 'M-4.4 -7.4h2l.2 7.4h-1.8zM6.6 -7.4h2l.4 7.4h-1.8z')
      + pth(g, 'M-8 -13q0 -3.6 5 -3.8h6q6 .2 6.4 4.4q.2 4.6 -3.4 5h-9.6q-4.4 -.4 -4.4 -5.6z') + pth(gl, 'M-6.6 -9q5 2.6 13.6 .6q-1 1.4 -2.6 1.4h-8.6q-1.6 -.4 -2.4 -2z')
      + ln(gd, 'M9.2 -13q2.2 2 1.6 6.4', 1.2) + pth(gd, K.circ(10.7, -5.8, 1.1))
      + pth(g, 'M-7.6 -11.4l-3.4 -5.2q-3.6 .6 -5.4 4q-.6 2 1 2.4q2.4 .2 4.4 -1.6l1.8 3.2z') + pth(gl, 'M-16.4 -12.2q-.6 2 1 2.4q1.4 0 2.2 -.8q-1 -1.6 -3.2 -1.6z')
      + pth(gd, 'M-11.4 -16.2l-.4 -5.6l2 4.6zM-9.6 -16l1.2 -5.2l.8 5z') + pth('#1e1c1c', K.circ(-12.6, -14, .6))
      + pth(AK, 'M-4.6 -16.6h9.6l.6 5.4h-10.8z') + pth(M.gKanK, 'M-5 -12.6h10.4l.1 1.2h-10.7z')
      + pth(T(un, -.2), 'M-4 -19.6q-1.4 -3.6 2 -4.2h5q3.4 .6 2 4.2z') + pth(un, 'M-5.4 -13.4q-1.4 -5 1.4 -6.2h7.6q3 1.2 1.6 6.2q-5.2 1.6 -10.6 0z') + pth(T(un, -.2), 'M2 -19.6h1.6q3 1.2 1.6 6.2q-1.6 .5 -3.2 .7q.8 -3.6 0 -6.9z')
      + ln('#4a4038', 'M-1.6 -19.6v6.6M-12.6 -11.6L-17.4 -6', .8); };
  b.art(2.9, 3.3, 0, esek(), { bb: [2.5, 3.16, 0, 3.34, 3.44, .9] });
  b.art(3.85, 2.95, 0, pth(T(AH, -.2), 'M-3 -5h6l-.8 5h-4.4z') + pth('#2e3a40', K.ell(0, -5, 3, 1.2)) + ln(M.gDemir, 'M-3 -5q3 -5 6 0', .7), { r: .12 });

  /* --- ön bahçe: kuru taş duvar, yedek değirmen taşı, çıplak ağaç, kuru ot --- */
  const w1 = b.box(.08, 1.0, 0, .34, 3.9, .33, TK, { edge: false, T: TA }); w1.R.courses({ rh: .165, bw: .34, dens: .5 }).stones(2, { rh: .165 });
  const w2 = b.box(.34, 3.64, 0, 1.5, 3.9, .33, TK, { edge: false, T: TA }); w2.L.courses({ rh: .165, bw: .34, dens: .5 }).stones(3, { rh: .165 });
  b.critter('kedi', .21, 2.5, .33, { col: '#2a2a2e' });
  { const p = pr(.78, 3.05), x = p[0], y = p[1], kol = 'M0 0Q-1 -10 1 -20M.4 -11Q-5 -15 -9 -24M.8 -15Q5 -19 8 -28M1 -20Q0 -26 -2 -31M-5 -17.6L-8 -16M5 -21L9 -21.6M-6.6 -21L-5 -26';
    b.item([.6, 2.9, 0, .96, 3.2, 1.3], `<g transform="translate(${f1(x)} ${f1(y)})">` + ln(T(AK, -.1), kol, 2) + ln(AK, 'M0 0Q-1 -10 1 -20', 3.4) + '</g>', { cast: false }); }
  const ms = new K.Face([.62, 3.93, 0], [1, 0, 0], [0, 0, 1], .62, .62, [0, 1, 0]);
  ms.shp('round', 0, 0, .62, .62, TK, 3, -.2).shp('round', .04, .04, .54, .54, TK, 4, .08).shp('round', .25, .25, .12, .12, '#1e1c1c', 5).line([[.31, .08], [.31, .22]], TK, .8, 6, -.2).line([[.31, .4], [.31, .54]], TK, .8, 6, -.2).line([[.08, .31], [.22, .31]], TK, .8, 6, -.2).line([[.4, .31], [.54, .31]], TK, .8, 6, -.2);
  b.item([.62, 3.9, 0, 1.24, 3.96, .62], () => ms.svg(), { cast: false });
  b.tufts(.5, 2.4, 2.2, 3.5, 4, { col: '#6a6448' }).tufts(1.5, 3.95, 2.6, 4.2, 3, { col: '#6a6448' });

  b.tag(3.0, 3.95, 0).doorAt(3.2, 2.3);
});
