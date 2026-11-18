/* Yel değirmeni — kireç badanalı, yukarı doğru daralan yuvarlak Ege kulesi; saz külah, kanat göbeği +y yüzünde.
   Sağ arkada taş un ambarı (sundurma çatı), kapı önünde yuvarlak basamaklar, yük kancası, yüklü eşek, değirmenci.
   Parsel 4 × 4; kır parçası olduğu için zemin çayır üstüne düzensiz toprak lekeleridir. opt.seed boya ve külah rengini değiştirir. */
CK.def('degirmen', { w: 4, d: 4, name: 'Yel Değirmeni' }, (b, K, opt) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, pr = K.pr, P = K.P, f1 = K.f1, U = K.U, ZU = K.ZU;
  const sd = (opt && opt.seed) || 7, rs = K.rng(sd * 131 + 5);
  const acc = [M.mavi, M.turkuaz, M.yesil, M.lacivert][(sd + 1) % 4], capC = sd % 2 ? M.saz : M.padavra, wall = M.kirec, un = '#ece3cd';

  /* --- zemin: çayır, kapıdan yola inen toprak, un tozu --- */
  b.gpoly([[-.25, .5], [1.1, -.25], [3.3, -.2], [4.25, .9], [4.25, 3.2], [3.4, 4.25], [1.1, 4.25], [-.25, 3.3]], M.cimA, { op: .6 });
  b.gpoly([[2.55, 1.55], [3.95, 1.4], [4.3, 2.3], [4.3, 3.5], [3.5, 3.75], [2.5, 3.5], [1.95, 2.9], [2.2, 2.2]], M.toprak, { op: .85 });
  b.gpoly([[2.9, 1.45], [3.85, 1.4], [3.9, 1.95], [3.2, 2.2], [2.85, 1.95]], '#f6f0e2', { op: .55 });
  b.spill(3.0, 2.2, 1.5);

  /* --- kule: kesik koni; taş etek, badana gövde, yüzeye teğet yüzlerde kapı ve pencereler --- */
  const cx = 1.55, cy = 1.5, r0 = 1.1, r1 = .84, H = 2.8, sl = (r0 - r1) / H;
  const rad = z => r0 - sl * z, RX = r => r * Math.SQRT2 * U;
  const sp = (t, z, e = 0) => { const ph = (45 - 90 * t) * Math.PI / 180, r = rad(z) + e; return [cx + r * Math.cos(ph), cy + r * Math.sin(ph), z]; };
  const frust = (z0, z1, col, e = 0) => { const a = pr(cx, cy, z0), c = pr(cx, cy, z1), A = RX(rad(z0) + e), C = RX(rad(z1) + e);
    return `<path fill="url(#${K.gradCyl(col)})" d="M${f1(c[0] - C)} ${f1(c[1])}L${f1(a[0] - A)} ${f1(a[1])}A${f1(A)} ${f1(A / 2)} 0 0 0 ${f1(a[0] + A)} ${f1(a[1])}L${f1(c[0] + C)} ${f1(c[1])}A${f1(C)} ${f1(C / 2)} 0 0 1 ${f1(c[0] - C)} ${f1(c[1])}Z"/>`; };
  const arc = (z, ta, tb, e = 0) => { let d = ''; for (let t = ta; t <= tb + 1e-6; t += .1) d += (d ? ' ' : 'M') + P(...sp(Math.min(t, tb), z, e)); return d; };
  const subs = [];
  const tface = (t, z, w, h) => { const ph = (45 - 90 * t) * Math.PI / 180, n = [Math.cos(ph), Math.sin(ph), 0], u = [Math.sin(ph), -Math.cos(ph), 0], r = rad(z);
    const f = new K.Face([cx + r * n[0] - u[0] * w / 2, cy + r * n[1] - u[1] * w / 2, z], u, K.unit([-n[0] * sl, -n[1] * sl, 1]), w, h, n); f.mc = wall; subs.push(f); return f; };
  // badana derz izleri ve taş etek derzleri
  let cl = '', pl = arc(.22, -1, 1);
  for (let z = .8; z < H - .3; z += .4) { const ta = -.92 + rs() * 1.4; cl += arc(z, ta, Math.min(.94, ta + .3 + rs() * .5)); }
  for (let k = 0; k < 2; k++) for (let t = -.9 + k * .12; t < .95; t += .24) pl += `M${P(...sp(t, k * .22))} ${P(...sp(t, k * .22 + .22))}`;
  const pt = pr(cx, cy, .44);
  b.item([cx - r0, cy - r0, 0, cx + r0, cy + r0, H], () => frust(0, .44, M.tas, .04) + pth(T(M.tas, .26), K.ell(pt[0], pt[1], RX(rad(.44) + .04), RX(rad(.44) + .04) / 2))
    + frust(.44, H, wall) + frust(.44, .53, acc) + frust(H - .26, H, T(wall, -.1))
    + ln(T(M.tas, -.3), pl, .8, 'opacity=".55"') + ln(T(wall, -.3), cl, .8, 'opacity=".5"') + subs.map(f => f.svg()).join(''),
    { pts: [-1, -.5, 0, .5, 1, 1.5, 2, 2.5].flatMap(t => [sp(t, 0), sp(t, H)]) });
  tface(-.62, 1.75, .9, .6).patches(1, { col: M.tas, a0: 0, a1: .9, b0: 0, b1: .6 });
  const df = tface(.3, .3, .72, 1.05); df.door(.09, .54, .92, { kind: 'arch', col: acc, sove: M.tas }); df.lantern(-.1, .84);
  tface(.3, 1.62, .5, .52).door(.07, .36, .44, { kind: 'rect', sove: M.tas, open: true, glow: true, floor: M.ahsapA });       // yük kapağı
  tface(-.3, 1.42, .5, .66).win(.07, .08, .36, .5, { kind: 'arch', sove: M.tas, frame: acc, box: true, lit: true });
  tface(-.02, 2.18, .34, .34).win(.04, .04, .26, .26, { kind: 'round', frame: acc, sill: false, lit: true });
  // kapı önü: yuvarlak taş basamaklar
  b.cyl(2.84, 1.98, .56, 0, .15, M.gri, { top: M.gri, cast: false });                                   // alt basamak: eski değirmen taşı
  b.art(2.84, 1.98, .15, ln(T(M.gri, -.24), 'M2 4L17 6M-2 6L-6 12M6 8L8 12.6M-13 3L-17 5M12 -2L18 -1', .8), { bb: [2.3, 1.44, .15, 3.4, 2.54, .16] });
  b.cyl(2.74, 1.92, .37, .15, .3, M.tas, { cast: false });

  /* --- külah: saz / padavra; mil yuvası, mil, rüzgâr gülü --- */
  const cr = 1.03, ch = 1.04; b.cone(cx, cy, cr, H, ch, capC);
  let rg = ''; for (const k of [.24, .48, .7]) { const rr = RX(cr * (1 - k)), y = -k * ch * ZU; rg += `M${f1(-rr)} ${f1(y)}A${f1(rr)} ${f1(rr / 2)} 0 0 0 ${f1(rr)} ${f1(y)}`; }
  b.art(cx, cy, H, ln(T(capC, -.42), rg, 1, 'opacity=".55"') + ln(T(capC, .4), `M-3 ${f1(-ch * ZU + 9)}L0 ${f1(-ch * ZU + 1)}`, 1.2, 'opacity=".7"'), { bb: [cx - cr, cy - cr, H + .02, cx + cr, cy + cr, H + ch] });
  const dy = cy + 1.06;
  b.poly3([[cx, cy + .5, H + .54], [cx, dy, H + .42], [cx + .27, dy, H + .12], [cx + .27, cy + .74, H + .28]], capC, { n: [1, 0, .9], dt: -.1, bb: [cx - .27, cy + .5, H + .1, cx + .27, dy, H + .54] });
  b.poly3([[cx - .27, dy, H + .12], [cx + .27, dy, H + .12], [cx, dy, H + .42]], M.ahsapK, { n: [0, 1, 0], bb: [cx - .27, dy - .02, H + .11, cx + .27, dy, H + .42] });
  b.line3([[cx - .29, dy, H + .1], [cx, dy, H + .44], [cx + .29, dy, H + .1]], T(capC, .3), 1.6);
  b.line3([[cx, dy, H + .2], [cx, dy + .16, H + .18]], M.ahsapK, 3.4);
  b.fx('sails', cx, dy + .17, H + .18, { r: 1.9, axis: 'y' });
  b.art(cx, cy, H + ch, ln(M.demir, 'M0 1V-11', 1.1) + pth(M.bronz, 'M-6 -9q3 -3 6 -1l3 -2v5l-3 -2q-3 2 -6 0z') + pth(M.altin, K.circ(0, -12, 1.4)), { bb: [cx - .1, cy - .1, H + ch, cx + .1, cy + .1, H + ch + .5] });

  /* --- yük kancası: kapağın üstünde kiriş, makara, asılı çuval --- */
  const h0 = sp(.3, 2.3), h1 = [h0[0] + .5, h0[1] + .16, 2.34];
  b.line3([h0, h1], M.ahsapK, 2.4, { pad: .05 });
  b.art(h1[0] - .06, h1[1] - .02, 2.3, pth(M.demir, K.circ(0, 1.5, 1.8)) + ln('#7a6a52', 'M0 3V17', .8) + pth(T(un, -.2), 'M-3.6 18q-2.6 6 -.4 11q4 2.4 8 0q2.2 -5 -.4 -11z') + pth(un, 'M-3.6 18q-2.6 6 -.4 11q1.6 1 3.2 1.2q-1 -6 .2 -12.2z') + ln('#7a6a52', 'M-3.2 19h6.6', 1),
    { bb: [h1[0] - .2, h1[1] - .14, 1.2, h1[0] + .06, h1[1] + .1, 2.3] });

  /* --- un ambarı: alçak taş oda, sundurma kiremit çatı, baca --- */
  const a = b.box(2.5, .2, 0, 3.8, 1.3, .92, M.tas);
  a.L.courses({ rh: .23, bw: .5, dens: .55, a0: .15 }).stones(2, { rh: .23, a0: .15 }).shadeTop(.14); a.R.courses({ rh: .23, bw: .5, dens: .5 }).stones(2, { rh: .23 }).shadeTop(.1);
  a.L.band(0, .16, M.tasK, -.06); a.R.band(0, .16, M.tasK, -.06);
  a.L.door(.34, .44, .74, { col: M.ahsap, sove: M.kirec });
  a.R.win(.42, .36, .28, .36, { frame: acc, sove: M.kirec, shut: acc, lit: true });
  b.poly3([[2.5, 1.3, .92], [3.8, 1.3, .92], [2.5, 1.3, 1.31]], M.tas, { n: [0, 1, 0], bb: [2.5, 1.28, .92, 3.8, 1.3, 1.3] });
  b.shed(2.52, .06, 3.96, 1.44, .9, 1.34, '+x', M.kiremit);
  b.chimney(3.2, .5, 1.05, .5, { mat: M.tas, w: .3, s: .5 });
  b.critter('guvercin', 3.5, 1.3, 1.02);

  /* --- avlu: çuvallar, değirmenci, yüklü eşek, kova --- */
  b.sack(3.44, 1.44, 0, { col: un, s: .66 }).sack(3.66, 1.46, 0, { col: un, s: .7 }).sack(3.55, 1.46, .17, { col: T(un, .1), s: .62 });
  b.fig(3.5, 2.4, 0, { body: '#efe6d6', legs: '#6a5648', hat: 'hasir' });
  b.art(3.5, 2.4, 0, pth('#d9cdb2', 'M-2.6 -14.4h5.2l.5 7h-6.2z') + pth(T(un, -.2), 'M1 -17.2q-1.4 -5 3 -6.4l6 1q3.4 1.6 2.6 5.4q-1 2.6 -4.6 2.2q-5 -.2 -7 -2.2zM12 -19.8l2.2 -1.4l.2 2.8z') + pth(un, 'M1 -17.2q-1.4 -5 3 -6.4l3.4 .6q1 3.4 -.6 7.4q-4.4 -.2 -5.8 -1.6z'), { bb: [3.38, 2.28, 0, 3.64, 2.54, .98] });
  const esek = () => { const g = '#9a8f86', gd = T(g, -.34), gl = '#e6dccb';
    return `<ellipse cx="1" cy="0" rx="12" ry="3.4" fill="#1b2440" opacity=".22"/>`
      + pth(gd, 'M-6.6 -7h1.9l-.3 7h-1.7zM4.4 -7h1.9l.3 7h-1.7z') + pth(g, 'M-4.4 -7.4h2l.2 7.4h-1.8zM6.6 -7.4h2l.4 7.4h-1.8z')
      + pth(g, 'M-8 -13q0 -3.6 5 -3.8h6q6 .2 6.4 4.4q.2 4.6 -3.4 5h-9.6q-4.4 -.4 -4.4 -5.6z') + pth(gl, 'M-6.6 -9q5 2.6 13.6 .6q-1 1.4 -2.6 1.4h-8.6q-1.6 -.4 -2.4 -2z')
      + ln(gd, 'M9.2 -13q2.2 2 1.6 6.4', 1.2) + pth(gd, K.circ(10.7, -5.8, 1.1))
      + pth(g, 'M-7.6 -11.4l-3.4 -5.2q-3.6 .6 -5.4 4q-.6 2 1 2.4q2.4 .2 4.4 -1.6l1.8 3.2z') + pth(gl, 'M-16.4 -12.2q-.6 2 1 2.4q1.4 0 2.2 -.8q-1 -1.6 -3.2 -1.6z')
      + pth(gd, 'M-11.4 -16.2l-.4 -5.6l2 4.6zM-9.6 -16l1.2 -5.2l.8 5z') + pth('#2a2420', K.circ(-12.6, -14, .6))
      + pth(M.bezK, 'M-4.6 -16.6h9.6l.6 5.4h-10.8z') + pth(M.bezS, 'M-5 -12.6h10.4l.1 1.2h-10.7z')
      + pth(T(un, -.2), 'M-4 -19.6q-1.4 -3.6 2 -4.2h5q3.4 .6 2 4.2z') + pth(un, 'M-5.4 -13.4q-1.4 -5 1.4 -6.2h7.6q3 1.2 1.6 6.2q-5.2 1.6 -10.6 0z') + pth(T(un, -.2), 'M2 -19.6h1.6q3 1.2 1.6 6.2q-1.6 .5 -3.2 .7q.8 -3.6 0 -6.9z')
      + ln('#7a6a52', 'M-1.6 -19.6v6.6M-12.6 -11.6L-17.4 -6', .8); };
  b.art(2.9, 3.3, 0, esek(), { bb: [2.5, 3.16, 0, 3.34, 3.44, .9] });
  b.art(3.85, 2.95, 0, pth(T(M.ahsap, -.2), 'M-3 -5h6l-.8 5h-4.4z') + pth('#4f9ab0', K.ell(0, -5, 3, 1.2)) + ln(M.demir, 'M-3 -5q3 -5 6 0', .7), { r: .12 });

  /* --- ön bahçe: kuru taş duvar, yedek değirmen taşı, el arabası, zeytin, kır çiçekleri --- */
  const w1 = b.box(.08, 1.0, 0, .34, 3.9, .33, M.tasK, { edge: false, T: M.tas }); w1.R.courses({ rh: .165, bw: .34, dens: .5 }).stones(2, { rh: .165 });
  const w2 = b.box(.34, 3.64, 0, 1.5, 3.9, .33, M.tasK, { edge: false, T: M.tas }); w2.L.courses({ rh: .165, bw: .34, dens: .5 }).stones(3, { rh: .165 });
  b.critter('kedi', .21, 2.5, .33, { col: '#e8e2d6' });
  b.tree('zeytin', .78, 3.05, { s: .8 });
  // yedek değirmen taşı: bahçe duvarına yaslı
  const ms = new K.Face([.62, 3.93, 0], [1, 0, 0], [0, 0, 1], .62, .62, [0, 1, 0]);
  ms.shp('round', 0, 0, .62, .62, M.gri, 3, -.2).shp('round', .04, .04, .54, .54, M.gri, 4, .1).shp('round', .25, .25, .12, .12, '#3a3634', 5).line([[.31, .08], [.31, .22]], M.gri, .8, 6, -.2).line([[.31, .4], [.31, .54]], M.gri, .8, 6, -.2).line([[.08, .31], [.22, .31]], M.gri, .8, 6, -.2).line([[.4, .31], [.54, .31]], M.gri, .8, 6, -.2);
  b.item([.62, 3.9, 0, 1.24, 3.96, .62], () => ms.svg(), { cast: false });
  b.flowers(1.5, 3.1, { n: 6, r: .34, cols: [M.kirmizi, M.kirmizi, M.bez, M.sari] }).flowers(1.7, 4.08, { n: 5, r: .32, cols: [M.bez, M.sari, M.mor, M.kirmizi] })
    .flowers(3.7, 3.85, { n: 4, r: .3, cols: [M.kirmizi, M.bez, M.mor] });
  b.tufts(.5, 2.4, 2.2, 3.5, 3);

  b.tag(3.0, 3.95, 0).doorAt(3.2, 2.3);
});
