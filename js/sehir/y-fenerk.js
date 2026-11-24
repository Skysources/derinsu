/* Liman feneri — mendireğin ucundaki ince kara taş kule. Sekizgen kaide, demir kuşaklı gövde, konsollu seyir balkonu,
   demir kafesli fener odası ve sivri demir külah. Tek ışık: tepedeki fener (dönen ışını şehir planı ekler, z ≈ 3.2). */
CK.def('fenerk', { w: 3, d: 3, name: 'Liman Feneri' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, f1 = K.f1, cx = 1.5, cy = 1.5;
  const ST = M.gTasK, KR = M.gKara, TA = M.gTasA, FE = M.gDemir;
  b.gpoly([[.2, .2], [2.8, .2], [2.8, 2.8], [.2, 2.8]], T(KR, .06));
  b.gpoly([[.2, 2.3], [.9, 2.8], [.2, 2.8]], M.gYosun, { op: .5 }).gpoly([[2.3, .2], [2.8, .2], [2.8, .8]], M.gYosun, { op: .45 });
  // sekizgen kaide
  const oct = (rr, k = rr * .4142) => [[cx + rr, cy - k], [cx + rr, cy + k], [cx + k, cy + rr], [cx - k, cy + rr], [cx - rr, cy + k], [cx - rr, cy - k], [cx - k, cy - rr], [cx + k, cy - rr]];
  for (const f of b.prism(oct(1.0), 0, .5, KR).faces) f.courses({ rh: .17, bw: .4, dens: .6 }).stones(2, { rh: .17 }).band(0, .08, KR, -.1);
  b.prism(oct(.86), .5, .58, T(KR, .08), { cast: false });
  // gövde: kara taş, demir kuşaklar, dar sivri pencereler (sönük)
  const g = b.cyl(cx, cy, .54, .58, 2.42, ST); g.courses(.27, -.08);
  g.band(.58, .18, KR, .03, 'lip').band(1.28, .05, FE, .006, false).band(1.92, .05, FE, .006, false);
  g.face(-.42, .58, .5, .86).door(.05, .4, .78, { kind: 'point', col: M.gAhsapK, sove: TA });
  g.face(.36, 1.42, .3, .5).win(.04, .02, .2, .44, { kind: 'point', lit: false, sove: TA, frame: FE, bars: [1, 2], sill: false });
  g.face(-.36, 2.0, .3, .34).win(.06, 0, .16, .3, { kind: 'point', lit: false, frame: FE, bars: [1, 1], sill: false });
  // seyir balkonu: konsollar, döşeme, demir korkuluk (sivri uçlu dikmeler)
  g.band(2.26, .16, KR, .16, 'lip').band(2.42, .1, ST, .36, true);
  { let d = '', sp = ''; const R = .9; for (let i = 0; i <= 14; i++) { const a = (45 - 90 * (-1.15 + 2.3 * i / 14)) * Math.PI / 180, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a); d += `M${K.P(x, y, 2.52)} ${K.P(x, y, 2.86)}`; sp += `M${K.P(x, y, 2.86)} ${K.P(x, y, 2.95)}`; }
    let top = ''; for (let i = 0; i <= 14; i++) { const a = (45 - 90 * (-1.15 + 2.3 * i / 14)) * Math.PI / 180; top += (i ? ' ' : 'M') + K.P(cx + R * Math.cos(a), cy + R * Math.sin(a), 2.82); }
    b.item([cx - .9, cy - .9, 2.52, cx + .9, cy + .9, 2.95], ln(FE, d + top, 1) + ln(FE, sp, .7), { cast: false }); }
  // fener odası: demir kafes ardında yanan fener (tek güçlü ışık)
  const zL0 = 2.6, zL1 = 3.3;
  b.cyl(cx, cy, .5, zL0 - .08, zL0, FE, { cast: false });
  b.cyl(cx, cy, .42, zL0, zL1, '#3a3630>#ffd27a', { top: null, cast: false });
  { let d = ''; for (const t of [-.72, -.36, 0, .36, .72]) { const a = (45 - 90 * t) * Math.PI / 180, x = cx + .42 * Math.cos(a), y = cy + .42 * Math.sin(a); d += `M${K.P(x, y, zL0)} ${K.P(x, y, zL1)}`; }
    const c = K.pr(cx, cy, 2.95);
    b.item([cx - .42, cy - .42, zL0, cx + .42, cy + .42, zL1], ln(FE, d, 1.3) + `<circle class="Nl" cx="${f1(c[0])}" cy="${f1(c[1])}" r="34" fill="url(#${K.glowId()})"/>`, { cast: false }); }
  b.cyl(cx, cy, .5, zL1, zL1 + .08, FE, { cast: false });
  // sivri demir külah, tepede paslı küre ve şiş
  b.cone(cx, cy, .5, zL1 + .08, 1.0, FE);
  { const p = K.pr(cx, cy, zL1 + 1.08); b.art(cx, cy, zL1 + 1.08, ln(FE, 'M0 1v-12', 1.2) + pth(M.gPas, K.circ(0, -2.4, 1.9)), { bb: [cx - .05, cy - .05, zL1 + 1.08, cx + .05, cy + .05, zL1 + 1.5] }); }
  // işaret direği ve kan kırmızısı flama
  b.line3([[2.6, .45, 0], [2.6, .45, 1.9]], M.gAhsapK, 1.5).line3([[2.6, .45, 1.45], [2.6, .8, 1.45]], M.gAhsapK, 1); b.fx('flag', 2.6, .45, 1.9, { col: M.gKan, s: 1.1 });
  // halat kangalı, sandık, fıçı, olta sallayan balıkçı, martı
  const RP = '#6e6352';
  b.art(2.2, 1.0, 0, pth(T(RP, -.2), K.ell(0, -1, 6, 3)) + pth(RP, K.ell(0, -2.4, 5, 2.4)) + pth(T(RP, -.3), K.ell(0, -2.6, 2, 1)), { r: .2 });
  b.crate(.6, 2.3, 0, .36, { col: M.gAhsap }).barrel(1, 2.55, 0, { col: M.gAhsapK, top: M.gAhsap });
  b.fig(2.55, 2.5, 0, { body: '#3a3a40', legs: '#2c2a28', hat: 'ortu', hatCol: '#34343a' }); b.art(2.55, 2.5, 0, ln(M.gAhsapK, 'M4 -11L17 -22', 1) + ln('#9a9a96', 'M17 -22L21 8', .5), { bb: [2.45, 2.4, 0, 2.7, 2.65, 1] });
  b.critter('marti', 1.9, 2.7, 0, { flip: true });
  b.critter('guvercin', cx + .62, cy + .3, 2.52, { col: '#26272c' });
});
