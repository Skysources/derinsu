/* Gözcü Kulesi — hisar kayasının tepesinde, şehrin en yüksek yapısı.
   Şevli (aşağı doğru genişleyen) yuvarlak taş gövde, konsollu seyir şerefesi, içinde işaret ateşi yanan
   kireç badanalı fener katı, arduvaz külah ve uzun flama. Kapı +y (aydınlık) yüze bakar; taş merdiven
   kaidenin önünden kıvrılarak kapı sahanlığına çıkar. Parsel 5.5 × 5.5.
   Gövde kesik koni olduğundan yerel yardımcılarla çizilir: yüzeyde nokta = (a° açı, z yükseklik, r yarıçap);
   a = 135 sol kenar (aydınlık), 45 tam ön, -45 sağ kenar (gölge). */
CK.def('kule', { w: 5.5, d: 5.5, name: 'Gözcü Kulesi' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, f1 = K.f1, U = K.U, ZU = K.ZU, r = b.r;
  const cx = 2.35, cy = 2.4, Q = Math.SQRT2 * U, rad = a => a * Math.PI / 180, TT = K.toneOf([0, 0, 1]);
  const ST = M.tas, SB = M.tasK, TR = '#e9dfc8', BR = '#c98660', ROOF = M.arduvaz, IP = '#7a6a52';
  const Rb = z => 2.3 - z * .182, Rs = z => 1.85 - (z - 1.1) * .042;                // kaide ve gövde yarıçapı

  /* ---------- yerel yardımcılar ---------- */
  const xy = (a, rr) => [cx + rr * Math.cos(rad(a)), cy + rr * Math.sin(rad(a))];
  const sp = (a, z, rr) => { const p = xy(a, rr); return K.pr(p[0], p[1], z); };
  const sP = (a, z, rr) => { const p = sp(a, z, rr); return f1(p[0]) + ' ' + f1(p[1]); };
  const arc = (a, z, rr, sw) => `A${f1(rr * Q)} ${f1(rr * Q / 2)} 0 0 ${sw} ${sP(a, z, rr)}`;
  // yüzeyde eğri dörtgen (alt ve üst kenar çember yayı) · düz dörtgen (dar parçalar için)
  const cq = (a0, a1, z0, z1, r0, r1 = r0) => `M${sP(a0, z0, r0)}${arc(a1, z0, r0, a1 > a0 ? 1 : 0)}L${sP(a1, z1, r1)}${arc(a0, z1, r1, a1 > a0 ? 0 : 1)}Z`;
  const fq = (a0, a1, z0, z1, r0, r1 = r0) => `M${sP(a0, z0, r0)} ${sP(a1, z0, r0)} ${sP(a1, z1, r1)} ${sP(a0, z1, r1)}Z`;
  const front = (z, rr) => `M${sP(135, z, rr)}${arc(-45, z, rr, 0)}`, back = (z, rr) => `M${sP(135, z, rr)}${arc(-45, z, rr, 1)}`;
  // kesik koni gövde (silindir geçişiyle boyanır) · üst kapak
  const body = (z0, z1, r0, r1, mat) => `<path fill="url(#${K.gradCyl(mat)})" d="M${sP(135, z1, r1)}L${sP(135, z0, r0)}${arc(-45, z0, r0, 0)}L${sP(-45, z1, r1)}${arc(135, z1, r1, 1)}Z"/>`;
  const cap = (z, rr, col) => { const c = K.pr(cx, cy, z); return pth(col, K.ell(c[0], c[1], rr * Q, rr * Q / 2)); };
  // silindir geçişinin a açısındaki tonu (düz renkli parçalar gövdeyle uyuşsun)
  const GS = [[0, .06], [.3, -.02], [.62, -.34], [.88, -.44], [1, -.34]];
  const ct = a => { const f = (1 - Math.sin(rad(a - 45))) / 2; for (let i = 1; i < GS.length; i++) if (f <= GS[i][0]) return GS[i - 1][1] + (GS[i][1] - GS[i - 1][1]) * (f - GS[i - 1][0]) / (GS[i][0] - GS[i - 1][0]); return -.34; };
  const ring = (rr, z) => [0, 45, 90, 135, 180, 225, 270, 315].map(a => [...xy(a, rr), z]);
  const bbC = (rr, z0, z1) => [cx - rr, cy - rr, z0, cx + rr, cy + rr, z1];
  const key = a => Math.cos(rad(a)) + Math.sin(rad(a));                              // derinlik: büyük = öne yakın
  const dots = (col, pts, w) => pts.length ? ln(col, pts.map(p => `M${f1(p[0])} ${f1(p[1])}h.1`).join(''), w) : '';
  // taş sıraları: yatay derz yayları + şaşırtmalı düşey derzler
  const courses = (z0, z1, st, Rf, mat, dens = .5) => { let d = '', k = 0;
    for (let z = z0 + st; z < z1 - .04; z += st) d += front(z, Rf(z));
    for (let z = z0; z < z1 - st * .6; z += st, k++) for (let a = 131 - (k % 2) * 6; a > -42; a -= 11 + r() * 4) if (r() < dens) d += `M${sP(a, z, Rf(z))}v${f1(-st * ZU)}`;
    return ln(T(mat, -.3), d, .8, 'opacity=".5"'); };
  // tek tek açık / koyu taşlar
  const stones = (n, z0, z1, st, Rf) => { let l = '', d = '';
    for (let i = 0; i < n; i++) { const a = -36 + r() * 158, w = 9 + r() * 7, z = z0 + Math.floor(r() * ((z1 - z0) / st - 1)) * st + .02, s = fq(a, a + w, z, z + st - .04, Rf(z)); if (r() < .5) l += s; else d += s; }
    return pth('#fff0d0', l, 'opacity=".2"') + pth('#5a4630', d, 'opacity=".13"'); };
  // yüzeye teğet küçük düzlem: kapı ve pencere için
  const face = (a, zc, w, h, rr, mat) => { const n = [Math.cos(rad(a)), Math.sin(rad(a)), 0], u = [n[1], -n[0], 0], f = new K.Face([cx + rr * n[0] - u[0] * w / 2, cy + rr * n[1] - u[1] * w / 2, zc], u, [0, 0, 1], w, h, n); f.mc = mat; return f; };
  // yüzeyde kemerli açıklık: ac merkez açı, hw yarı genişlik (derece), z0 taban, zs üzengi, zt tepe
  const archD = (ac, hw, z0, zs, zt, rr, n = 6) => { const R = typeof rr === 'function' ? rr : () => rr; let d = `M${sP(ac + hw, z0, R(z0))}L${sP(ac + hw, zs, R(zs))}`;
    for (let k = 1; k <= n; k++) { const th = Math.PI * k / n, z = zs + (zt - zs) * Math.sin(th); d += ' ' + sP(ac + hw * Math.cos(th), z, R(z)); }
    return d + `L${sP(ac - hw, z0, R(z0))}${arc(ac + hw, z0, R(z0), 1)}Z`; };
  // ucuz saksı: gövde + nokta yapraklar + çiçekler
  const saksi = (a, rr, z, fl) => { const p = xy(a, rr); b.art(p[0], p[1], z, pth(T(M.kiremitA, -.25), 'M-3.2 0L-4.2 -6H4.2L3.2 0Z') + pth(T(M.kiremitA, .12), 'M-3.2 0L-4.2 -6H-.8L-.6 0Z')
    + ln(T(M.sarmasik, -.22), 'M-3 -8.6h.1M3.2 -9.6h.1M.2 -8h.1', 7) + ln(T(M.sarmasik, .1), 'M-2 -11.6h.1M2.4 -13h.1M-.2 -14.6h.1', 6) + ln(fl, 'M-3.6 -12.4h.1M1 -15.4h.1M3.8 -11.4h.1M-.4 -10.2h.1M-2 -15h.1', 2.2), { r: .12, h: .6 }); };

  /* ---------- zemin: taş döşeli avlu, yıpranmış yol, ot ve çiçek ---------- */
  const cl = p => [Math.max(.06, Math.min(5.44, p[0])), Math.max(.06, Math.min(5.44, p[1]))];
  const apron = []; for (let a = 0; a < 360; a += 15) apron.push(cl(xy(a, 3.3 + (a % 30 ? .1 : -.08))));
  b.gpoly(apron, '#e1d5b5');
  b.gpoly([[5.44, 5.44], [4.5, 5.44], [4.75, 4.5], [5.12, 3.2], [4.8, 2.1], [5.2, 1.95], [5.44, 3.0]], '#cdbd9a', { op: .7 });
  { let d = ''; for (let a = -30; a <= 130; a += 13) { const p = cl(xy(a + 4, 2.95)), q = cl(xy(a, 3.36)); d += `M${K.P(p[0], p[1], 0)} ${K.P(q[0], q[1], 0)}`; } b.ground(ln('#bfae8a', d, .8)); }
  b.tufts(.1, 4.2, 1.2, 5.45, 6).tufts(1.2, 5.3, 4.2, 5.48, 4).tufts(5.25, 2.2, 5.48, 4.0, 3);
  b.flowers(1.75, 5.4, { n: 6, r: .32 }).flowers(.3, 4.15, { n: 4, r: .25, cols: [M.sari, M.bez, M.mor] });
  b.spill(5.05, 2.2, 1.2).spill(2.35, 5.3, 1.3, { op: .5 });

  /* ---------- kaide: şevli kaba taş halka ---------- */
  b.item(bbC(2.3, 0, 1.1), body(0, 1.1, 2.3, 2.1, SB) + body(0, .3, 2.3, Rb(.3), T(SB, -.16)) + stones(7, .3, 1.1, .27, Rb) + courses(.03, 1.1, .27, Rb, SB, .6)
    + cap(1.1, 2.1, T(SB, TT)), { pts: ring(2.3, 0).concat(ring(2.1, 1.1)) });

  /* ---------- gövde ---------- */
  let sh = body(1.1, 6.25, 1.85, Rs(6.25), ST) + stones(24, 1.3, 5.6, .3, Rs) + courses(1.1, 5.7, .3, Rs, ST, .34);
  // almaşık tuğla kuşakları ve taş silmeler
  for (const z of [2.84, 4.96]) sh += body(z, z + .09, Rs(z), Rs(z), BR) + body(z + .12, z + .2, Rs(z), Rs(z), BR);
  sh += body(1.1, 1.27, 1.91, 1.89, TR) + body(3.9, 4.02, Rs(3.9) + .05, Rs(3.9) + .05, TR) + ln(T(ST, -.36), front(3.9, Rs(3.9) + .02), 1, 'opacity=".5"') + ln(T(ST, -.36), front(1.1, 1.93), 1.2, 'opacity=".45"');
  // şerefe altının gölgesi
  sh += pth('#2a2438', cq(135, -45, 5.2, 5.8, Rs(5.2), Rs(5.8)), 'opacity=".17"') + pth('#2a2438', cq(135, -45, 5.48, 5.8, Rs(5.48), Rs(5.8)), 'opacity=".15"');
  // mazgal delikleri
  { let lt = '', dk = ''; for (const [a, z] of [[8, 2.05], [57, 4.3], [24, 4.95], [-22, 3.2], [118, 4.5]]) { lt += fq(a - 2.8, a + 2.8, z - .07, z + .64, Rs(z)); dk += fq(a - 1.1, a + 1.1, z, z + .56, Rs(z)) + fq(a - 2, a + 2, z + .2, z + .28, Rs(z)); }
    sh += pth('#fff0d0', lt, 'opacity=".3"') + pth(M.ic, dk); }
  // kemerli pencereler: sarmal merdiveni izleyerek sağa doğru yükselir
  const win = (a, z, w, h, o) => { const f = face(a, z - .3, w + 1.2, h + .7, Rs(z), ST); f.win(.6, .3, w, h, Object.assign({ kind: 'arch', sove: TR, frame: M.ahsapK }, o)); return f.svg(); };
  sh += win(63, 2.0, .44, .62, { shut: M.mavi, box: true, lit: true }) + win(31, 3.08, .42, .62, { lit: true }) + win(0, 4.2, .42, .6, { lit: false });
  // kapı: mavi kanat, mermer söve, fener, üstünde balık kabartmalı taş
  const fd = face(90, 1.1, 1.6, 2.0, 1.86, ST);
  fd.door(.45, .7, 1.0, { kind: 'arch', col: M.mavi, sove: TR }).lantern(1.36, 1.0).rect(.3, 0, 1.0, .05, TR, 3, .12);
  fd.rect(.54, 1.26, .52, .36, TR, 3, .1).rect(.57, 1.29, .46, .3, TR, 3.1, -.08).shp('round', .63, 1.37, .25, .15, M.lacivert, 4).poly([[.86, 1.445], [.96, 1.37], [.96, 1.52]], M.lacivert, 4);
  sh += fd.svg();
  // sancak çubuğu
  const yb = cy + Rs(5.66) + .09;
  sh += ln(M.ahsapK, `M${K.P(cx - .44, yb, 5.66)} ${K.P(cx + .44, yb, 5.66)}`, 1.8) + ln(M.demir, `M${K.P(cx - .36, yb - .12, 5.78)} ${K.P(cx - .36, yb, 5.66)}M${K.P(cx + .36, yb - .12, 5.78)} ${K.P(cx + .36, yb, 5.66)}`, 1)
    + dots(M.altin, [K.pr(cx - .46, yb, 5.66), K.pr(cx + .46, yb, 5.66)], 3);
  b.item(bbC(1.85, 1.1, 6.2), sh, { pts: ring(1.85, 1.1).concat(ring(1.64, 6.2)) });
  b.fx('banner', cx - .3, yb, 5.63, { col: '#a92c2e', w: .6, h: 2.3, axis: 'x' });

  /* ---------- bekçi kulübesi: sağ arkada, kireç badanalı, kiremit çatılı ---------- */
  const lg = b.box(4.75, .45, 0, 5.5, 1.75, .92, M.kirec);
  lg.L.band(0, .18, M.tas, .05).shadeTop(.14); lg.R.band(0, .18, M.tas, .05).shadeTop(.14).patches(1, { a0: .7, a1: 1.25, b0: .2, b1: .6 });
  lg.L.door(.15, .42, .7, { col: M.mavi, sove: M.tas }).lantern(.68, .72, { out: .16, r: 12 });
  lg.R.win(.34, .36, .44, .4, { shut: M.mavi, box: true, lit: true, sove: M.tas });
  lg.R.vine({ kind: 'boug', a0: .95, a1: 1.3, drop: [.2, .6], dens: 1.1 });
  b.hip(4.6, .3, 5.65, 1.9, .92, .52, M.kiremit);
  b.chimney(5.12, .85, 1.12, .46, { mat: M.tas, w: .26, s: .55 });

  /* ---------- taş merdiven: kaidenin önünden sola doğru kıvrılarak sahanlığa çıkar ---------- */
  const RI = 2.06, RO = 2.85, SA = 7.2, NS = 10, zAt = a => a >= NS * SA - .01 ? 1.1 : (Math.floor(a / SA + 1e-6) + 1) * .1;
  { const steps = []; let nose = '', jn = '';
    for (let i = 0; i <= NS; i++) { const a0 = i * SA, a1 = i < NS ? a0 + SA : 108, z = zAt(a0 + .1), am = (a0 + a1) / 2; let s = '';
      if (a0 > 45) s += pth(T(SB, -.2), `M${sP(a0, z - .1, RI)} ${sP(a0, z - .1, RO)} ${sP(a0, z, RO)} ${sP(a0, z, RI)}Z`);   // rıht
      if (i < NS) s += pth(T(SB, ct(am) + (i % 2 ? .05 : 0)), fq(a0, a1, 0, z, RO));
      else for (let k = 0; k < 3; k++) s += pth(T(SB, ct(78 + k * 12) + .02), cq(72 + k * 12, 84 + k * 12, 0, z, RO));
      s += pth(T(SB, TT + (i % 2 ? -.05 : .03)), i < NS ? fq(a0, a1, z, z, RO, RI) : `M${sP(a0, z, RI)}L${sP(a0, z, RO)}${arc(a1, z, RO, 1)}L${sP(a1, z, RI)}Z`);   // basamak
      nose += i < NS ? `M${sP(a0, z, RO)} ${sP(a1, z, RO)}` : `M${sP(a0, z, RO)}${arc(a1, z, RO, 1)}`; steps.push([key(am), s]); }
    steps.sort((p, q) => p[0] - q[0]);
    for (const z of [.28, .56, .84]) jn += `M${sP(108, z, RO)}${arc(Math.ceil(z * 10 - .8) * SA, z, RO, 0)}`;
    for (const [a, z] of [[30, 0], [44, .28], [52, 0], [60, .28], [66, .56], [74, 0], [104, .28], [76, .56], [104, .84], [72, .84]]) jn += `M${sP(a, z, RO)}v${f1(-.28 * ZU)}`;
    // sahanlığın altında kemerli odunluk
    let nk = pth(T(TR, ct(90) - .04), archD(90, 12.4, 0, .44, .86, RO)) + pth(M.ic, archD(90, 10, 0, .42, .78, RO))
      + pth(T(SB, -.34), `M${sP(100, 0, RO)} ${sP(100, .44, RO)} ${sP(100, .44, RO - .2)} ${sP(100, 0, RO - .2)}Z`);
    const lg0 = [], lg1 = []; for (let k = 0; k < 4; k++) for (let a = 82.6 + (k % 2) * 1.9; a < 98; a += 3.8) { const z = .09 + k * .15; if (Math.abs(a - 90) < 9.2 * Math.sqrt(Math.max(0, 1 - Math.max(0, z - .34) / .42))) { const p = sp(a, z, RO - .03); lg0.push(p); lg1.push([p[0] - .4, p[1] - .2]); } }
    nk += dots(T(M.ahsapA, -.12), lg0, 5.4) + dots(T(M.ahsapA, .22), lg1, 3.4) + dots(M.ahsapK, lg1, 1.1);
    b.item([cx + RO * Math.cos(rad(108)), cy - .05, 0, cx + RO, cy + RO, 1.1], steps.map(s => s[1]).join('') + ln(T(SB, -.34), jn, .8, 'opacity=".5"') + ln(T(SB, .5), nose, .8) + nk, { cast: false }); }

  // merdivendekiler: sepetle odun çıkaran çırak, saksılar, kedi
  { const p = xy(39, 2.42); b.fig(p[0], p[1], zAt(39), { body: M.bez, legs: '#5a4636', carry: 'sepet', step: 1, flip: true }); }
  saksi(103, 2.62, 1.1, M.kirmizi); saksi(76, 1.97, 1.1, M.begonvil); saksi(20, 2.62, zAt(20), M.sari);
  { const s = xy(105, 1.98); b.pot(s[0], s[1], 1.1, { s: .8, col: M.kil }); }
  // tırabzan: ahşap dikmeler, iki sıra halat
  { let po = '', r1 = '', r2 = ''; const A = [1, 15, 29.4, 43.8, 58.2, 72.6, 90, 107];
    A.forEach((a, i) => { const z = zAt(a); po += `M${sP(a, z, RO - .05)}v${f1(-.46 * ZU)}`; r1 += (i ? ' ' : 'M') + sP(a, z + .44, RO - .05); r2 += (i ? ' ' : 'M') + sP(a, z + .24, RO - .05); });
    b.item([cx + RO * Math.cos(rad(108)), cy, .1, cx + RO, cy + RO, 1.56], ln(IP, r2, .8) + ln(M.ahsapK, po, 1.5) + ln(T(M.ahsap, .1), r1, 1.5), { cast: false }); }

  /* ---------- avlu: silah askısı, fıçı, sandıklar, odun, fener ---------- */
  b.line3([[4.0, 5.3, 0], [4.0, 5.3, .66]], M.ahsapK, 1.6).line3([[4.9, 5.3, 0], [4.9, 5.3, .66]], M.ahsapK, 1.6).line3([[4.0, 5.3, .6], [4.9, 5.3, .6]], M.ahsap, 1.7).line3([[4.0, 5.3, .26], [4.9, 5.3, .26]], M.ahsap, 1.3);
  [4.16, 4.36, 4.56].forEach((x, i) => b.art(x, 5.32, 0, ln(M.ahsapA, 'M0 0L-1.6 -31', 1.2) + pth(T('#c9d2da', i === 1 ? -.1 : .1), i === 2 ? 'M-3.6 -30q2 -4.6 3.6 -.4l-1 3.6z' : 'M-1.6 -37.6l1.9 4.6l-1.6 2.2l-1.4 -2.4z') + (i === 1 ? pth('#a92c2e', 'M-1.5 -30l4.6 1.2l-4.4 2.4z') : ''), { bb: [x - .05, 5.3, 0, x + .05, 5.36, 1.2] }));
  b.art(4.76, 5.36, 0, pth(T(M.lacivert, -.2), K.ell(0, -8, 5.4, 6.8)) + pth(M.lacivert, K.ell(-.6, -8.4, 4.4, 5.8)) + pth(M.altin, 'M-.6 -11.6l2.4 3.2l-2.4 3.2l-2.4 -3.2z'), { bb: [4.64, 5.32, 0, 4.88, 5.4, .6] });
  b.barrel(5.2, 4.15, 0, { r: .21 }).crate(4.78, 4.62, 0, .42, { fill: '#8a9a5a' }).crate(5.18, 4.68, 0, .34).sack(4.5, 4.95, 0).lamp(5.28, 5.26, 0, { h: 1.3 });
  b.critter('kedi', 4.42, 4.6, 0, { flip: true });
  // sol köşe: vinç altı odun yığını
  b.woodpile(.18, 4.82, 0, { w: .95 }).crate(.62, 4.4, 0, .36, { fill: M.ahsapA }).rock(.28, 5.3, 0, { s: .6 }).rock(5.3, 2.05, 0, { s: .5 });
  b.critter('kedi', .7, 4.99, .4, { col: '#4a4644' });
  // nöbetçi: kulübenin önünde mızraklı
  b.fig(5.36, 2.78, 0, { body: M.lacivert, legs: '#3a3230', hat: 'fes' });
  b.art(5.36, 2.78, 0, ln(M.ahsapA, 'M5.6 0V-27', 1.1) + pth('#c9d2da', 'M5.6 -32l1.7 4.4l-1.7 1.6l-1.7 -1.6z'), { bb: [5.3, 2.8, 0, 5.5, 2.94, 1.1] });

  /* ---------- sarmaşık: kapının solundan gövdeye tırmanır ---------- */
  { const L = [[], [], []], Rz = z => (z < 1.1 ? Rb(z) : Rs(z)) + .03; let stem = '';
    for (const [a0, a1, z0, z1, w0, w1] of [[117, 106, 0, 4.9, 13, 5], [116, 130, 1.3, 3.9, 9, 4], [126, 133, 0, 2.3, 8, 4]]) for (let z = z0 + .05, i = 0; z < z1; z += .13, i++) { const t = (z - z0) / (z1 - z0), a = a0 + (a1 - a0) * t + Math.sin(z * 2.6 + a0) * 2.2, sw = w0 + (w1 - w0) * t;
      stem += (i ? ' ' : 'M') + sP(Math.min(136, a), z, Rz(z));
      for (let k = 0; k < (t < .8 ? 2 : 1); k++) { const q = r(), p = sp(Math.min(137, a + (r() - .5) * 2 * sw), z + (r() - .5) * .22, Rz(z)); L[q < .36 ? 0 : q < .72 ? 1 : 2].push([Math.round(p[0]), Math.round(p[1])]); } }
    b.item([cx - 2.3, cy, 0, cx, cy + 2.3, 5], ln(M.govde, stem, 1.1) + dots(T(M.sarmasik, -.24), L[0], 6.4) + dots(M.sarmasik, L[1], 5) + dots(T(M.sarmasik, .32), L[2], 2.8), { cast: false }); }

  /* ---------- şerefe: kemerli konsol kuşağı, döşeme, arka korkuluk ---------- */
  const RG = 2.05, Ri = 1.92, zF = 6.6, zP = 7.0, MH = .32;
  // mazgal dişleri: yan yüzler (aydınlık / gölge), bize bakan yüz, üst
  const teeth = (list, rf) => { let f = '', sl = '', sd = '', t = '';
    for (const a of list) { const m = ((a % 360) + 360) % 360, as = m > 45 && m < 225 ? a - 5 : a + 5, s = `M${sP(as, zP, RG)} ${sP(as, zP, Ri)} ${sP(as, zP + MH, Ri)} ${sP(as, zP + MH, RG)}Z`;
      if (m > 45 && m < 170 || m > 225) sd += s; else sl += s;
      f += fq(a + 5, a - 5, zP, zP + MH, rf); t += `M${sP(a + 5, zP + MH, RG)} ${sP(a - 5, zP + MH, RG)} ${sP(a - 5, zP + MH, Ri)} ${sP(a + 5, zP + MH, Ri)}Z`; }
    return [pth(T(ST, -.36), sd) + pth(T(ST, .02), sl), f, pth(T(ST, TT), t)]; };
  { const Rc = z => 1.66 + (z - 5.72) * .708; let ar = '';
    for (let a = 127.5; a > -45; a -= 15) ar += archD(a, 5.2, 5.72, 5.95, 6.1, Rc, 4);
    let g = body(5.72, 6.2, 1.66, 2.0, T(ST, -.08)) + pth(T(ST, -.56), ar) + body(5.63, 5.74, 1.7, 1.7, TR);
    g += body(6.2, zF, RG, RG, ST) + body(6.2, 6.28, RG + .03, RG + .03, TR) + cap(zF, RG, T('#a99878', TT));
    // fener katının döşemeye düşen gölgesi
    { const c = K.pr(cx + .42, cy - .72, zF); g += pth('#2a2438', K.ell(c[0], c[1], 1.15 * Q, 1.15 * Q / 2), 'opacity=".22"'); }
    // arka korkuluğun iç yüzü ve dişleri
    g += pth(T(ST, -.24), `M${sP(135, zP, Ri)}${arc(-45, zP, Ri, 1)}L${sP(-45, zF, Ri)}${arc(135, zF, Ri, 0)}Z`) + ln(T(ST, TT), back(zP, (RG + Ri) / 2), 2.2);
    const m = teeth([150, 170, 190, 210, 230, 250, 270, 290, 310], Ri); g += pth(T(ST, -.3), m[1]) + m[0] + m[2];
    b.item(bbC(RG, 6.25, zF), g, { pts: ring(RG, 6.2).concat(ring(RG, 7.2)) }); }

  /* ---------- fener katı: kireç badanalı, kemerli açıklıklardan işaret ateşi görünür ---------- */
  const RL = 1.15, zR = 8.3;
  { let L = body(zF, zR, RL, RL, M.kirec) + body(zF, 6.86, RL + .06, RL + .06, TR) + ln(T(M.kirec, -.3), front(6.87, RL + .01), .8, 'opacity=".5"');
    for (const ac of [105, -15, 45]) { const side = ac !== 45, far = ac > 45 ? ac + 18 : ac - 18;
      L += pth(T(TR, ct(ac) + .04), archD(ac, 22, 6.86, 7.55, 8.1, RL)) + pth(side ? '#5a3424>#d8741e' : '#4a2a20>#c8641e', archD(ac, 18, 6.95, 7.55, 8.0, RL));
      if (side) L += pth('#a8562a>#ffb648', archD(ac, 10, 6.95, 7.25, 7.6, RL)) + pth(ac > 45 ? '#8a5a40>#f09a48' : '#c08a5c>#ffc878', `M${sP(far, 6.95, RL)} ${sP(far, 7.58, RL)} ${sP(far, 7.58, RL - .2)} ${sP(far, 6.95, RL - .2)}Z`); }
    // ön açıklığın içi: eşik, döşeme, kor ışığı, demir mangal
    L += pth('#8a5a3c>#f0a050', `M${sP(28, 6.95, .96)} ${sP(62, 6.95, .96)} ${sP(82, 6.95, .5)} ${sP(8, 6.95, .5)}Z`) + pth('#d8b890>#ffd89a', `M${sP(27, 6.95, RL)} ${sP(63, 6.95, RL)} ${sP(62, 6.95, RL - .17)} ${sP(28, 6.95, RL - .17)}Z`);
    { const p = sp(45, 6.95, .74), X = p[0], Y = p[1];
      L += pth('#b8521e>#ff9a30', K.ell(X, Y - 10, 8, 9.5)) + pth('#f08a2a>#ffd070', K.ell(X, Y - 8, 5, 5.6))
        + ln('#2a2c33', `M${f1(X - 4)} ${f1(Y)}l1.6 -4.4M${f1(X + 4)} ${f1(Y)}l-1.6 -4.4M${f1(X)} ${f1(Y + 1.2)}v-5`, 1) + pth('#2a2c33', `M${f1(X - 5.2)} ${f1(Y - 7.4)}h10.4l-1.4 3.4h-7.6z`)
        + pth('#ffd27a>#fff0b0', K.ell(X, Y - 7.6, 4.2, 1.3)); }
    // ayaklarda turkuaz çini baklavalar, saçak altı silmesi, saçak alnı
    for (const a of [75, 15]) L += pth(T(M.turkuaz, ct(a) + .15), `M${sP(a, 7.3, RL)} ${sP(a + 5, 7.5, RL)} ${sP(a, 7.7, RL)} ${sP(a - 5, 7.5, RL)}Z`) + dots(M.altin, [sp(a, 7.5, RL)], 2);
    L += body(8.12, zR, RL + .07, RL + .07, TR) + ln(T(M.kirec, -.34), front(8.12, RL + .02), 1, 'opacity=".5"') + body(8.22, zR, 1.52, 1.52, T(M.ahsapK, -.1));
    b.item(bbC(RL, zF, zR), L, { pts: ring(RL, zR) }); }
  { const p = xy(45, .74); b.fx('fire', p[0], p[1], 7.15, { s: 1.05 }); }

  /* ---------- külah: çan eğrili arduvaz çatı, bakır tepelik, yaldızlı alem, flama ---------- */
  b.cone(cx, cy, 1.52, zR, .9, ROOF, { cast: false });
  b.cone(cx, cy, 1.22, 8.47, 1.42, ROOF);
  b.cone(cx, cy, .42, 9.42, .5, M.bakir, { cast: false });
  { const zA = 9.92, rc = z => 1.22 * (1 - (z - 8.47) / 1.42), p = K.pr(cx, cy, zA), q = sp(84, 8.74, rc(8.74)); let d = '';
    for (const z of [8.7, 8.94, 9.18]) d += front(z, rc(z));
    b.item(bbC(.4, 8.5, 10.5), ln(T(ROOF, -.44), d + front(8.5, 1.2), .9, 'opacity=".6"') + ln(T(M.bakir, .3), front(9.43, .41), 1.1) + pth('#ffffff', `M${f1(p[0])} ${f1(p[1] + 12)}L${sP(128, 8.47, 1.22)} ${sP(112, 8.47, 1.22)}Z`, 'opacity=".12"')
      // çatı penceresi
      + `<g transform="translate(${f1(q[0])} ${f1(q[1])})">` + pth(T(ROOF, -.3), 'M-1 -9.6L5.4 -12L9 -7L5 -4Z') + pth(T(M.kirec, -.06), 'M-4.2 1V-5.2L0 -9.4L4.2 -5.2V1Z') + pth(M.ic, 'M-1.8 1V-3.6Q0 -6.4 1.8 -3.6V1Z') + ln(T(ROOF, .16), 'M-5.6 -4.4L0 -10L5.6 -4.4', 1.7) + '</g>'
      // alem ve gönder
      + ln('#4a3a30', `M${f1(p[0])} ${f1(p[1] - 2)}v-15`, 1.3) + pth(T(M.altin, -.2), K.circ(p[0], p[1] - 1.6, 3.2) + `M${f1(p[0] - 2.4)} ${f1(p[1] + 1.6)}h4.8l1.2 2.2h-7.2z`) + pth(T(M.altin, .3), K.circ(p[0] - 1, p[1] - 2.5, 1.7))
      + pth(M.altin, `M${f1(p[0])} ${f1(p[1] - 20.4)}l1.5 3l-1.5 1.6l-1.5 -1.6z`), { cast: false });
    b.fx('flag', cx, cy, zA + 16.4 / ZU, { col: '#b0322e', s: 1.6 }); }

  /* ---------- şerefedekiler ---------- */
  // çan: iki dikme arasında asılı
  { const p0 = xy(-1, 1.66), p1 = xy(14, 1.66), pm = xy(6.5, 1.66);
    b.line3([[p0[0], p0[1], zF], [p0[0], p0[1], 7.72]], M.ahsapK, 1.6).line3([[p1[0], p1[1], zF], [p1[0], p1[1], 7.72]], M.ahsapK, 1.6).line3([[p0[0], p0[1], 7.68], [p1[0], p1[1], 7.68]], M.ahsap, 2);
    b.fx('bell', pm[0], pm[1], 7.63, { s: 1.1 }); }
  // gözcü, üçayak, vinççi, vinç direği
  { const g = xy(71, 1.5), t = xy(87, 1.74), v = xy(120, 1.56), d = xy(132, 1.76);
    b.fig(g[0], g[1], zF, { body: M.lacivert, legs: '#3a3230', hat: 'fes' });
    b.art(t[0], t[1], zF, ln('#3a3230', 'M0 -16L-4 0M0 -16L4 0M0 -16L.6 -3', 1), { r: .12, h: .6 });
    b.fig(v[0], v[1], zF, { body: '#b0703e', legs: '#4a3a34', hat: 'sarik', flip: true });
    b.line3([[d[0], d[1], zF], [d[0], d[1], 7.8]], M.ahsapK, 2); }

  /* ---------- şerefe: ön korkuluk ve mazgal dişleri (şerefedekilerin önünde) ---------- */
  { let g = body(6.55, zP, RG, RG, ST) + body(6.55, 6.62, RG + .03, RG + .03, TR), jn = '';
    for (let a = 128; a > -42; a -= 17) jn += `M${sP(a, 6.64, RG)}v-10`;
    g += ln(T(ST, -.3), jn, .8, 'opacity=".45"');
    // korkuluğa serilmiş çizgili kilim
    g += pth(T(M.bez, ct(104)), cq(97, 111, 6.46, zP + .02, RG + .015)) + pth(T(M.bezM, ct(104)), cq(97, 111, 6.56, 6.63, RG + .015) + cq(97, 111, 6.72, 6.8, RG + .015) + cq(97, 111, 6.89, 6.94, RG + .015))
      + pth(T(M.bezK, ct(104)), cq(97, 111, 6.46, 6.5, RG + .015));
    // asılı kalkanlar
    { const S = [[], [], [], []], G = []; [80, 62, 44, 26, 8, -10].forEach((a, i) => { const p = sp(a, 6.82, RG + .02); S[(i % 2) * 2 + (a < 50 ? 1 : 0)].push(p); G.push(p); });
      g += dots('#a92c2e', S[0], 7.6) + dots(T('#a92c2e', -.3), S[1], 7.6) + dots(M.lacivert, S[2], 7.6) + dots(T(M.lacivert, -.3), S[3], 7.6) + dots(M.altin, G, 2.6); }
    g += ln(T(ST, TT), front(zP, (RG + Ri) / 2), 2.2);
    const m = teeth([130, 110, 90, 70, 50, 30, 10, -10, -30], RG); g += m[0] + `<path fill="url(#${K.gradCyl(ST)})" d="${m[1]}"/>` + m[2];
    b.item(bbC(RG, zF, zP + MH), g, { cast: false }); }
  // dürbün borusu korkuluğun üstünden uzanır
  { const t = xy(87, 1.74), gl = xy(97, 1.98); b.art(t[0], t[1], zF, ln(T(M.altin, .15), 'M6 -19.4L-7.5 -14.6', 2.4) + ln(M.bronz, 'M-6.6 -14.9l-2.6 .9', 3.6) + ln(M.bronz, 'M1.6 -18v1.6', 2.6), { bb: bbC(RG, zF, zP + MH + .1) });
    b.fx('glint', gl[0], gl[1], 7.08); }
  // vinç kolu, makara, halat ve yukarı çekilen odun sepeti
  { const a = 132, i0 = xy(a, 1.5), d = xy(a, 1.76), t = xy(a, 2.92), v = xy(120, 1.56), zt = 7.42;
    b.line3([[i0[0], i0[1], 7.2], [t[0], t[1], zt]], M.ahsapK, 2.4).line3([[d[0], d[1], 7.8], [t[0], t[1], zt + .02]], IP, .8).line3([[v[0], v[1], zF + .42], [d[0], d[1], 7.36], [t[0], t[1], zt - .03]], IP, .8);
    b.line3([[t[0], t[1], zt - .05], [t[0], t[1], 3.52]], IP, .9);
    b.art(t[0], t[1], zt, pth(M.demir, K.circ(0, 2.6, 2.4)) + pth(M.bronz, K.circ(0, 2.6, .9)), { bb: [t[0] - .06, t[1] - .06, zt - .2, t[0] + .06, t[1] + .06, zt] });
    b.art(t[0], t[1], 3.0, ln(IP, 'M-5.6 -9L0 -15.6L5.6 -9', .8) + ln(M.ahsapK, 'M-3 -9.4l-1.6 -4M.4 -9.6l.8 -4.6M3.2 -9.4l2 -3.2', 2.2) + pth('#b8904e', 'M-6.4 -9.4h12.8l-1.8 9h-9.2z') + pth(T('#b8904e', -.26), 'M1.2 -9.4h5.2l-1.8 9h-3.4z') + ln(T('#b8904e', -.4), 'M-6 -6.4h11.8M-5.4 -3.4h10.6', .7), { bb: [t[0] - .2, t[1] - .2, 3, t[0] + .2, t[1] + .2, 3.55] });
    const m = xy(a, 2.4); b.critter('marti', m[0], m[1], 7.34); }
  { const p = xy(27, 2.0); b.fx('birds', p[0], p[1], zP + MH, { n: 3 }); }

  // gece: fener katının hâlesi
  { const p = sp(45, 7.45, RL); b.item(bbC(.3, 9.9, 10.5), `<circle class="Nl" cx="${f1(p[0])}" cy="${f1(p[1])}" r="62" fill="url(#${K.glowId()})" opacity=".9"/>`, { cast: false }); }

  b.tag(2.75, 5.4, 0).doorAt(4.86, 2.12);
});
