/* Liman feneri — mendireğin ucundaki kısa taş kule. Üç yanı su; fener odası gece ışır (dönen ışını şehir planı ekler). */
CK.def('fenerk', { w: 3, d: 3, name: 'Liman Feneri' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, cx = 1.5, cy = 1.5;
  b.gpoly([[.2, .2], [2.8, .2], [2.8, 2.8], [.2, 2.8]], T(M.tas, .1));
  b.spill(cx, cy + .9, 1.6);
  // taban, gövde, kırmızı kuşak
  const base = b.cyl(cx, cy, 1.02, 0, .34, M.tasK, { top: T(M.tas, .1) }); base.courses(.17);
  const g = b.cyl(cx, cy, .74, .34, 2.34, M.kirec); g.courses(.3, -.06);
  g.band(1.5, .42, M.kirmizi, .004, false).band(.34, .16, M.tasK, .03, 'lip');
  g.face(-.42, .34, .5, .86).door(.03, .44, .8, { kind: 'arch', col: M.mavi, sove: M.tas });
  g.face(.34, 1.02, .34, .44).win(.02, .02, .3, .4, { kind: 'arch', lit: true, sove: M.tas });
  g.face(-.5, 1.98, .3, .3).win(.02, 0, .26, .28, { kind: 'round', lit: true });
  // seyir balkonu ve korkuluğu
  g.band(2.34, .12, M.tasK, .3, true);
  { let d = ''; const R = 1.0; for (let i = 0; i <= 14; i++) { const a = (45 - 90 * (-1.15 + 2.3 * i / 14)) * Math.PI / 180, x = cx + R * Math.cos(a), y = cy + R * Math.sin(a); d += `M${K.P(x, y, 2.46)} ${K.P(x, y, 2.78)}`; }
    let top = ''; for (let i = 0; i <= 14; i++) { const a = (45 - 90 * (-1.15 + 2.3 * i / 14)) * Math.PI / 180; top += (i ? ' ' : 'M') + K.P(cx + 1.0 * Math.cos(a), cy + 1.0 * Math.sin(a), 2.78); }
    b.item([cx - 1, cy - 1, 2.46, cx + 1, cy + 1, 2.8], ln(M.demir, d + top, 1), { cast: false }); }
  // fener odası: camı gece ışır; bakır kubbe
  const l = b.cyl(cx, cy, .46, 2.46, 3.12, '#cfe6ea>#ffe9a8', { top: null, cast: false });
  { let d = ''; for (const t of [-.7, -.35, 0, .35, .7]) { const a = (45 - 90 * t) * Math.PI / 180, x = cx + .46 * Math.cos(a), y = cy + .46 * Math.sin(a); d += `M${K.P(x, y, 2.46)} ${K.P(x, y, 3.12)}`; }
    b.item([cx - .46, cy - .46, 2.46, cx + .46, cy + .46, 3.12], ln(M.demir, d, 1.1) + `<circle class="Nl" cx="${K.f1(K.pr(cx, cy, 2.8)[0])}" cy="${K.f1(K.pr(cx, cy, 2.8)[1])}" r="26" fill="url(#${K.glowId()})"/>`, { cast: false }); }
  b.cyl(cx, cy, .56, 3.12, 3.2, M.bakir, { cast: false });
  b.dome(cx, cy, .52, 3.2, M.bakir, { hf: .8, seams: false });
  b.fx('glint', cx, cy, 3.95);
  // işaret direği ve flama
  b.line3([[.5, .55, 0], [.5, .55, 2.2]], M.ahsapK, 1.5).line3([[.5, .55, 1.7], [.9, .55, 1.7]], M.ahsapK, 1); b.fx('flag', .5, .55, 2.2, { col: M.bezS, s: 1.1 });
  // halat kangalı, sandık, olta sallayan balıkçı, martı
  b.art(2.3, .7, 0, pth(T('#c9a86a', -.2), K.ell(0, -1, 6, 3)) + pth('#c9a86a', K.ell(0, -2.4, 5, 2.4)) + pth(T('#c9a86a', -.3), K.ell(0, -2.6, 2, 1)), { r: .2 });
  b.crate(.6, 2.3, 0, .36, { fill: '#9fb4c4' }).barrel(1, 2.55);
  b.fig(2.55, 2.5, 0, { body: M.bezM, hat: 'hasir' }); b.art(2.55, 2.5, 0, ln(M.ahsapK, 'M4 -11L17 -22', 1) + ln('#e8f2f2', 'M17 -22L21 8', .5), { bb: [2.45, 2.4, 0, 2.7, 2.65, 1] });
  b.critter('marti', 1.9, 2.7, 0, { flip: true });
});
