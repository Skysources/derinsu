/* Lonca Sarayı — yukarı şehrin meydana bakan köşesinde kubbeli lonca konağı (koleksiyon defteri buradan açılır).
   Parsel 10 × 10. İki cephe de önemlidir: +y (aydınlık) taç kapılı giriş cephesi, +x (gölge) revaklı kanat ve teras.
   Kütleler: ana blok (iki kat) · öne taşan taç kapı · sekizgen kasnakta kurşun kubbe · köşe kulesi · arka köşede seyir kulesi · alçak kanat + çardaklı teras. */
CK.def('lonca', { w: 10, d: 10, name: 'Lonca Sarayı' }, (b, K) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, pr = K.pr, f1 = K.f1, P = K.P, PL = K.PL;
  const ST = '#e7d9bd', PLN = '#cdbd9d', HON = '#dcbc8c', GUL = '#d9a68c', MR = M.mermer, LEAD = M.kursun, CR = '#a3272d', TQ = M.turkuaz, NV = M.lacivert, GD = M.altin, PV = '#e2d6ba', WF = '#4a5560', DAM = '#c79c7c';
  const tU = K.toneOf([0, 0, 1]), tL = K.toneOf([0, 1, 0]), tR = K.toneOf([1, 0, 0]);

  /* --- yardımcılar --- */
  // kesik çizgi: diş sırası, korkuluk çubukları, çini kuşağı, kabara
  const dash = (f, pts, col, wid, da, layer = 6, dt = 0, cap = 'butt', off = 0) => f.put(layer, 'Ln ' + K.ks(f.c(col, dt)), 'M' + pts.map(p => f.P(p[0], p[1], p[2] || 0)).join(' '),
    `stroke-width="${wid}" stroke-dasharray="${da}"${off ? ` stroke-dashoffset="${off}"` : ''} style="stroke-linecap:${cap}"`);
  // yaldızlı alem: küre + baklava uç
  const fin = (x, y, z, s = 1) => b.art(x, y, z, ln(GD, `M0 1v${f1(-9 * s)}`, 1.2) + pth(GD, K.circ(0, -3 * s, 2.3 * s) + `M0 ${f1(-14.5 * s)}l${f1(1.9 * s)} ${f1(4.6 * s)}l${f1(-1.9 * s)} ${f1(3.4 * s)}l${f1(-1.9 * s)} ${f1(-3.4 * s)}z`),
    { bb: [x - .06, y - .06, z, x + .06, y + .06, z + .5 * s] });
  const topuz = (x, y, z, r = 1.4) => b.art(x, y, z, pth(GD, K.circ(0, -r * .8, r)), { r: .04, h: .08 });
  const domeTop = (z, r, hf) => z + r * hf * 1.1415;
  // benek: yuvarlak uçlu kısacık çizgi (daire yolundan çok daha kısa yazılır)
  const dp = (x, y, z, o = 0) => { const p = pr(x, y, z); return `M${f1(p[0] + o)} ${f1(p[1] + o)}h.1`; };
  const LF = [T(M.sarmasik, -.26), M.sarmasik, T(M.sarmasik, .3)];
  // benek öbeği: pts [x,y,z,sınıf]; cls [[renk, kalınlık, kayma]...]
  const blobs = (bb, pts, cls) => { const d = cls.map(() => ''); for (const [x, y, z, k] of pts) d[k] += dp(x, y, z, cls[k][2] || 0); b.item(bb, d.map((s, k) => s ? ln(cls[k][0], s, cls[k][1]) : '').join(''), { cast: false }); };
  // saksı: toprak küp + yaprak ve çiçek benekleri · turunç: saksıda küçük ağaç
  const POT = pth(T(M.kiremitA, -.25), 'M-3 0Q-6 -5 -3.4 -9H3.4Q6 -5 3 0Z') + pth(M.kiremitA, 'M-3 0Q-6 -5 -3.4 -9H-.5Q-2 -5 -.6 0Z');
  const saksi = (x, y, z, fl) => b.art(x, y, z, POT + ln(LF[0], 'M0 -13h.1M-4 -11h.1M4 -11.5h.1', 8) + ln(LF[1], 'M-1.5 -14.5h.1M3 -13h.1', 5) + ln(fl, 'M-3.4 -13h.1M1 -16.4h.1M3.8 -11.6h.1M-.4 -11.4h.1M-5 -10h.1', 2.2), { bb: [x - .12, y - .12, z, x + .12, y + .12, z + .6] });
  const turunc = (x, y) => b.art(x, y, 0, POT + ln(M.govde, 'M0 -9V-18', 1.5) + ln(T(M.narenciye, -.3), 'M0 -23h.1M-4.5 -20.5h.1M4.5 -21h.1', 10) + ln(M.narenciye, 'M-1.5 -24.5h.1M-5 -21.5h.1M3 -22.5h.1', 6.5) + ln(T(M.narenciye, .35), 'M-3 -26h.1', 3.4)
    + ln('#f0962e', 'M-5 -19h.1M2 -25h.1M5.4 -20.4h.1M0 -20h.1M-2 -23h.1', 2.3), { bb: [x - .15, y - .15, 0, x + .15, y + .15, 1] });
  // revak: sivri kemerler, bal rengi söve, gözlerde mermer korkuluk
  const revak = (f, a0, a1, n, h) => {
    const sp = (a1 - a0 - .2 * (n + 1)) / n;
    for (let i = 0; i < n; i++) { const oa = a0 + .2 + i * (sp + .2); f.shp('point', oa - .07, .5, sp + .14, h + .08, HON, 2.9, .02); }
    f.arcade(a0, a1, n, h, { b: .5, pier: .2, kind: 'point', th: .4, glow: true, floor: MR, ring: false });
    for (let i = 0; i < n; i++) { const oa = a0 + .2 + i * (sp + .2); f.rect(oa, .5, sp, .28, MR, 6.6, .02); dash(f, [[oa + .05, .615], [oa + sp - .03, .615]], '#6a5a48', 3.4, '1.2 2.4', 6.8); }
    return sp;
  };
  // saçak altı: mermer silme + diş sırası
  const korni = (f, a0, a1, b0 = 2.8) => { f.rect(a0, b0, a1 - a0, .2, MR, 2.9, .05).rect(a0, b0 - .05, a1 - a0, .05, ST, 2.9, -.18); dash(f, [[a0, b0 + .045], [a1, b0 + .045]], ST, 2.4, '2.2 2.6', 3, -.3); };
  const taban = (f, a0 = 0, a1 = f.w) => f.rect(a0, 0, a1 - a0, .5, PLN, 2).rect(a0, .46, a1 - a0, .06, MR, 2.9, .1).courses({ rh: .25, bw: .6, dens: .35, a0, a1, b1: .5 });
  const WO = { kind: 'arch', sove: HON, frame: WF, bars: [2, 2] };

  /* --- zemin: mermer ön meydan, kenar şeridi, güvercinlerin toplandığı madalyon, gece ışıkları --- */
  b.pave(0, 8.2, 10, 10, PV); b.pave(8.25, 0, 10, 8.2, PV);
  b.gpoly([[0, 9.8], [10, 9.8], [10, 10], [0, 10]], T(PV, -.14)); b.gpoly([[9.8, 0], [10, 0], [10, 9.8], [9.8, 9.8]], T(PV, -.14));
  { const c = [8.45, 9.15], ring = (r, n = 18, r2 = r) => Array.from({ length: n }, (_, i) => { const a = i / n * 6.283, q = i % 2 ? r2 : r; return [c[0] + Math.cos(a) * q, c[1] + Math.sin(a) * q]; });
    b.gpoly(ring(.7, 14), T(PV, -.2)); b.gpoly(ring(.58, 16, .25), '#8fb5ac'); b.gpoly(ring(.17, 6), '#c9a86a'); }
  b.spill(4.5, 9.4, 2.4); b.spill(9.9, 4.8, 2.2); b.spill(1.4, 8.7, 1.6);

  /* --- ana blok: iki kat açık kireçtaşı; altta sivri kemerli revak, üstte kemerli pencereler --- */
  const g = b.box(.3, 1.2, 0, 8, 8.2, 3, ST, { T: null }), gl = g.L, gr = g.R;
  taban(gl, 0, 2.6); taban(gl, 5.8, 7.7);
  gl.courses({ rh: .32, bw: .8, dens: .2, a1: 2.6, b0: 1.7, b1: 2.75 });
  gl.band(1.78, .1, MR, .1, 2.9).band(1.73, .05, ST, -.16, 2.9);
  const spL = revak(gl, 0, 2.6, 3, 1.08); revak(gl, 5.8, 7.7, 2, 1.08);
  for (let i = 0; i < 3; i++) gl.win(.2 + spL / 2 + i * (spL + .2) - .2, 2.08, .4, .64, Object.assign({ lit: i !== 1 }, WO));
  korni(gl, 0, 7.7);
  // gölge cephe (üst kat, terasa bakar): korniş + pencereler
  korni(gr, 1.3, 5.45);
  [2.2, 3.05].forEach((a, i) => gr.win(a - .2, 2.1, .4, .62, Object.assign({ lit: !i }, WO)));

  // oymalı saçak silmesi + kiremit rengi dam döşemesi + korkuluk duvarları
  b.slab(.22, 1.12, 8.08, 8.28, 3.1, .1, MR);
  const rf = new K.Face([.3, 1.2, 3.1], [1, 0, 0], [0, 1, 0], 7.7, 7, [0, 0, 1]); rf.fill(DAM); rf.planks({ dir: 'v', step: .77, dt: -.1 }).planks({ dir: 'h', step: .78, dt: -.1 });
  b.item([.3, 1.2, 3.1, 8, 8.2, 3.1], () => rf.svg(), { cast: false });
  const E0 = { edge: false, cast: false };
  b.box(.43, 1.2, 3.1, 6.6, 1.33, 3.3, ST, E0); b.box(.3, 1.2, 3.1, .43, 8.07, 3.3, ST, E0); b.box(7.87, 2.85, 3.1, 8, 8.07, 3.3, ST, E0); b.box(.3, 8.07, 3.1, 8, 8.2, 3.3, ST, E0);
  // damdan sarkan begonvil (sol köşe)
  { const r = b.r, pts = [];
    for (let i = 0; i < 4; i++) { const x = .42 + i * .26 + r() * .1, len = .35 + r() * .95; for (let z = 3.36; z > 3.3 - len; z -= .1 + r() * .04) { const k = r() < .62 ? 2 : 0; pts.push([x + (r() - .5) * .18, 8.24, z, k]); if (r() < .6) pts.push([x + (r() - .5) * .18, 8.24, z + .02, k + 1]); } }
    blobs([.3, 8.2, 2, 1.5, 8.3, 3.45], pts, [[LF[0], 6.4], [LF[1], 4, -1], [T(M.begonvil, -.12), 6], [T(M.begonvil, .25), 3.4, -1]]); }

  /* --- seyir kulesi (arka sağ köşe): cepheden hafif taşar, tepesinde açık köşk ve kiremit külah, sancak direği --- */
  const tb = b.box(8, 1.2, 0, 8.25, 2.85, 3.1, ST, { T: null });
  tb.R.win(.62, 2.1, .34, .6, Object.assign({ lit: true }, WO));
  const tw = b.box(6.6, 1.2, 3.1, 8.25, 2.85, 4.8, ST, { T: null });
  for (const f of [tw.L, tw.R]) f.band(1.02, .08, GUL, 0, 2.9).shadeTop(.14);
  tw.L.courses({ rh: .3, bw: .7, dens: .25 });
  // lonca kadranı: yaldız çemberli lacivert güneş saati
  tw.L.shp('round', .5, .32, .65, .62, GD, 4, .1).shp('round', .56, .37, .53, .52, NV, 5).dot(.825, .63, 1.5, GD, 6.2, .2).line([[.825, .63], [.99, .8]], GD, 1.1, 6.1, .2);
  dash(tw.L, [[.62, .63], [1.03, .63]], GD, 1.4, '0 4.9', 6, .1, 'round');
  tw.L.wins(2, 1.2, .24, .44, { kind: 'arch', frame: WF, lit: .7, bars: [1, 2] }, .35, 1.3);
  b.fx('banner', 8.27, 2.25, 4.62, { col: CR, w: .42, h: 1.25, axis: 'y' });
  b.slab(6.5, 1.1, 8.35, 2.95, 4.9, .1, MR);
  const kv = b.box(6.66, 1.26, 4.9, 8.19, 2.79, 5.52, ST, { T: null, edge: false }), KO = { b: .04, pier: .15, kind: 'point', th: .2, dark: '#8f8470>#e0a04a', floor: MR, ring: false, cap: false };
  kv.L.arcade(0, 1.53, 2, .46, KO).shadeTop(.07); kv.R.arcade(0, 1.53, 2, .46, KO).shadeTop(.07);
  b.hip(6.46, 1.06, 8.39, 2.99, 5.52, .62, M.kiremit, { tex: 'seam' });
  b.line3([[7.425, 2.025, 6.1], [7.425, 2.025, 6.66]], M.ahsapK, 1.3); topuz(7.425, 2.025, 6.66);
  b.fx('flag', 7.425, 2.025, 6.6, { col: CR, s: 1.15, emblem: GD });

  /* --- büyük kubbe: kare kaide → sekizgen kasnak (pencereli) → kurşun kubbe; köşelerde ağırlık kulecikleri --- */
  const cx = 4.25, cy = 4.7;
  const kb = b.box(cx - 2.1, cy - 2.1, 3.1, cx + 2.1, cy + 2.1, 3.38, ST, { edge: false }); kb.L.shadeTop(.06); kb.R.shadeTop(.06);
  const oct = h => { const k = h * .4142; return [[cx + h, cy - k], [cx + h, cy + k], [cx + k, cy + h], [cx - k, cy + h], [cx - h, cy + k], [cx - h, cy - k], [cx - k, cy - h], [cx + k, cy - h]]; };
  for (const f of b.prism(oct(1.85), 3.38, 4.1, ST).faces) { const m = f.w / 2;
    f.band(.63, .09, MR, .08).win(m - .17, .13, .34, .44, { kind: 'arch', sove: HON, frame: WF, lit: true, sill: false, bars: [2, 2] });
    for (const a of [m - .5, m + .5]) f.poly([[a, .24], [a + .09, .36], [a, .48], [a - .09, .36]], TQ, 4).dot(a, .36, .9, GD, 5, .2); }
  b.prism(oct(1.93), 4.1, 4.18, MR);
  for (const [x, y] of [[cx - 1.84, cy + 1.84], [cx + 1.84, cy - 1.84], [cx + 1.84, cy + 1.84]]) { b.cyl(x, y, .2, 3.38, 3.72, ST, { cast: false }); b.dome(x, y, .23, 3.72, LEAD, { hf: 1.15, alem: false, seams: false, cast: false }); topuz(x, y, 3.72 + .23 * 1.15 * 1.14, 1.2); }
  b.dome(cx, cy, 1.78, 4.18, LEAD, { hf: .86, alem: false });
  { const z = domeTop(4.18, 1.78, .86); fin(cx, cy, z - .03, 1.25); b.fx('glint', cx, cy, z + .3); }
  // ön sol dam köşesinde küçük kubbe
  b.cyl(1.3, 7.2, .62, 3.1, 3.42, ST).band(3.36, .06, MR, .04);
  b.dome(1.3, 7.2, .6, 3.42, LEAD, { hf: .9, alem: false }); fin(1.3, 7.2, domeTop(3.42, .6, .9) - .02, .75);

  /* --- taç kapı: öne taşan yüksek blok; büyük sivri kemerli niş, çini çerçeve, bronz kabaralı kapı --- */
  const tk = b.box(2.9, 8.2, 0, 6.1, 8.6, 3.88, ST, { T: null }), tl = tk.L, E = -.35;
  for (let k = 0; k < 4; k++) { tl.rect(0, .9 + k * .72, .38, .13, GUL, 2.6).rect(2.82, .9 + k * .72, .38, .13, GUL, 2.6); }
  tk.R.band(0, .5, PLN);
  // çini çerçeve (turkuaz şerit, lacivert kareler, yaldız benekler)
  tl.rect(.42, .5, .15, 2.86, TQ, 3.1).rect(2.63, .5, .15, 2.86, TQ, 3.1).rect(.42, 3.21, 2.36, .15, TQ, 3.1).rect(.38, .5, .04, 2.9, MR, 3.1, .1).rect(2.78, .5, .04, 2.9, MR, 3.1, .1).rect(.38, 3.36, 2.44, .04, MR, 3.1, .1);
  for (const pts of [[[.495, .56], [.495, 3.2]], [[2.705, .56], [2.705, 3.2]], [[.6, 3.285], [2.62, 3.285]]]) { dash(tl, pts, NV, 2.3, '2.3 4.1', 3.3); dash(tl, pts, GD, 1.2, '0 6.4', 3.4, .1, 'round', -4.35); }
  tl.arcade(.55, 2.65, 1, 2.5, { b: .5, pier: .1, kind: 'point', th: -E, dark: T(ST, -.3), floor: MR });
  // nişin dip duvarı: söve, çini alınlık, bronz kabaralı çift kanat
  const sh = (lay, col, kind, a, bb, w, h, dt = 0) => tl.put(lay, K.kf(tl.c(col, dt)), tl.shapeD(kind, a, bb, w, h, E));
  sh(5.1, HON, 'point', 1.06, .5, 1.08, 1.6, -.1); sh(5.2, TQ, 'point', 1.14, .5, .92, 1.5, -.12); sh(5.3, '#6b4a2e', 'rect', 1.14, .5, .92, 1.0, -.08); sh(5.35, HON, 'rect', 1.1, 1.5, 1.0, .06, .05);
  tl.poly([[1.6, 1.62, E], [1.71, 1.75, E], [1.6, 1.88, E], [1.49, 1.75, E]], NV, 5.4).dot(1.6, 1.75, 1.2, GD, 5.5, .2, E);
  tl.line([[1.6, .5, E], [1.6, 1.5, E]], '#3a2616', 1.2, 5.5);
  for (const bb of [.68, .98, 1.28]) dash(tl, [[1.22, bb, E], [1.99, bb, E]], M.bronz, 1.7, '0 3.9', 5.6, .3, 'round');
  tl.dot(1.52, 1.1, 1.5, GD, 5.7, .1, E).dot(1.68, 1.1, 1.5, GD, 5.7, .1, E);
  tl.lantern(1.62, 2.34, { out: E / 2, r: 22 });
  // köşeliklerde çini kabara, üstte çini kuşak, yanlarda fenerler
  for (const a of [.78, 2.42]) tl.shp('round', a - .1, 2.82, .2, .19, TQ, 3.2).dot(a, 2.915, 1.5, GD, 3.4, .2);
  tl.rect(.1, 3.5, 3.0, .16, NV, 3.1); dash(tl, [[.14, 3.58], [3.06, 3.58]], TQ, 2.6, '2.6 2.6', 3.3); dash(tl, [[.14, 3.58], [3.06, 3.58]], GD, 1, '0 5.2', 3.4, .1, 'round', -1.3);
  korni(tl, 0, 3.2, 3.7);
  tl.lantern(.21, 1.52).lantern(2.99, 1.52);
  b.fx('banner', 2.97, 8.62, 3.4, { col: CR, w: .28, h: 1.5, axis: 'x' }); b.fx('banner', 5.75, 8.62, 3.4, { col: CR, w: .28, h: 1.5, axis: 'x' });
  b.slab(2.82, 8.2, 6.18, 8.68, 3.98, .1, MR);
  // tepelik: lonca arması (yaldız kurs + al baklava) ve köşe topuzları
  const tp = b.box(3.95, 8.36, 3.98, 5.05, 8.6, 4.4, ST, E0); tp.L.band(.36, .06, MR, .1, 3).shp('round', .37, .03, .36, .31, GD, 4, .1).poly([[.55, .09], [.63, .185], [.55, .28], [.47, .185]], CR, 5);
  fin(4.5, 8.48, 4.4, .8); b.fx('glint', 4.5, 8.48, 4.72);
  for (const x of [2.98, 6.02]) topuz(x, 8.52, 3.98, 2.2);

  /* --- kafesli ahşap cumba (lonca kâtibinin odası) + kiremit saçağı --- */
  const cu = b.bay(gl, 6.15, 1.98, 1.25, .78, { out: .42, mat: M.ahsap });
  for (const f of [cu.L, cu.R]) f.band(0, .1, M.ahsapK, 0, 3).band(.7, .08, M.ahsapK, 0, 3);
  cu.L.wins(3, .2, .27, .44, { frame: M.ahsapK, kafes: .7, lit: .8, sill: false, bars: [1, 1] }, .03, 1.22);
  cu.R.win(.09, .2, .24, .44, { frame: M.ahsapK, lit: true, sill: false, bars: [2, 2] });
  b.shed(6.36, 8.2, 7.79, 8.74, 2.74, 2.97, '+y', M.kiremit);

  /* --- alçak kanat (+x cephesi): revaklı tek kat, üstü teras --- */
  const kn = b.box(8, 2.85, 0, 9.5, 6.7, 1.85, ST, { T: null }), kr = kn.R;
  taban(kr); korni(kr, 0, 3.85, 1.66); revak(kr, 0, 3.85, 4, 1.04);
  kn.L.band(0, .5, PLN);
  b.fx('banner', 9.52, 5.85, 1.82, { col: CR, w: .22, h: .62, axis: 'y' }); b.fx('banner', 9.52, 3.93, 1.82, { col: CR, w: .22, h: .62, axis: 'y' });
  // teras: karo döşeme, korkuluk
  const te = b.flat(8, 2.85, 9.5, 6.7, 1.85, ST, { floor: '#cda888' }); te.T.planks({ dir: 'v', step: .5, dt: -.1 }).planks({ dir: 'h', step: .5, dt: -.1 });
  // çardak: direkler, kirişler, mertekler, üstünde mor salkım
  const pz = 2.82;
  for (const [x, y] of [[8.2, 3.0], [9.32, 3.0], [8.2, 4.7], [9.32, 4.7]]) b.line3([[x, y, 1.85], [x, y, pz]], M.ahsapK, 2);
  { let d = `M${P(8.12, 3, pz)} ${P(8.12, 4.78, pz)}M${P(9.4, 2.92, pz)} ${P(9.4, 4.78, pz)}`; for (let y = 3.0; y < 4.75; y += .283) d += `M${P(8.1, y, pz + .03)} ${P(9.44, y, pz + .03)}`;
    b.item([8.1, 2.92, pz - .02, 9.44, 4.8, pz + .05], ln(M.ahsap, d, 1.5), { cast: false }); }
  { const r = b.r, lf = [], ws = [];
    for (let i = 0; i < 17; i++) { const k = i % 3; lf.push([8.15 + r() * 1.25, 2.95 + r() * 1.8, pz + .08 + k * .05, k]); }
    for (let i = 0; i < 6; i++) { const y = 3.02 + i * .31 + r() * .08, n = 2 + Math.floor(r() * 3); for (let k = 0; k < n; k++) ws.push([9.44, y, pz - .06 - k * .12, k ? 1 : 0]); }
    for (let i = 0; i < 4; i++) { const x = 8.25 + i * .3 + r() * .08, n = 2 + Math.floor(r() * 3); for (let k = 0; k < n; k++) ws.push([x, 4.8, pz - .06 - k * .12, k ? 1 : 0]); }
    blobs([8.1, 2.9, pz + .05, 9.46, 4.82, pz + .3], lf, [[LF[0], 11], [LF[1], 8.5, -1], [LF[2], 5, -2]]);
    blobs([9.4, 2.9, pz - .6, 9.48, 4.84, pz + .04], ws, [[M.mor, 4.6], [T(M.mor, .3), 3.3]]); }
  saksi(8.3, 4.95, 1.85, M.begonvil); saksi(9.2, 6.35, 1.85, M.sari);
  // terasta gözlemci: pirinç dürbün üç ayakta, yanında lonca üyesi; korkulukta kedi
  b.fig(8.85, 5.55, 1.85, { body: '#2f6a8a', robe: true, hat: 'fes', hatCol: '#8a2a2a' });
  b.art(9.12, 5.95, 1.85, ln(M.ahsapK, 'M0 -11L-4 0M0 -11L4 -1M0 -11L.4 1.4', 1) + ln(M.bronz, 'M-5.5 -9.4L6 -14.6', 2.6) + ln(T(M.bronz, .45), 'M4.4 -13.9L6.6 -14.9', 3.4), { bb: [9.0, 5.83, 1.85, 9.24, 6.07, 2.5] });

  /* --- köşe kulesi: yuvarlak gövde, kuşaklar, dar pencereler, kurşun kubbe --- */
  const ku = b.cyl(8.75, 7.45, .75, 0, 3.3, ST);
  ku.band(0, .5, PLN).courses(.66).band(1.78, .1, MR, .03).band(3.16, .14, MR, .07);
  for (const [t, z, lit] of [[-.5, 2.1, true], [.32, 2.1, true], [-.1, .9, false]]) ku.face(t, z, .3, .62).win(0, 0, .3, .58, { kind: 'arch', sove: HON, frame: WF, lit, bars: [1, 2], sill: false });
  b.dome(8.75, 7.45, .77, 3.3, LEAD, { hf: .9, alem: false }); fin(8.75, 7.45, domeTop(3.3, .77, .9) - .02, .85); b.fx('glint', 8.75, 7.45, domeTop(3.3, .77, .9) + .22);

  /* --- merdiven: geniş mermer basamaklar (her basamak ayrı parça, üstünde serili halı), yan kaideler (selvi saksısı + fener) --- */
  for (const [x0, x1] of [[2.2, 2.9], [6.1, 6.8]]) { const xm = (x0 + x1) / 2;
    b.box(x0, 8.2, 0, x1, 9.3, .5, MR);
    b.box(xm - .22, 8.5, .5, xm + .22, 8.94, .72, M.kiremitA, { edge: false, T: '#6a4a34' }); b.tree('selvi', xm, 8.72, { s: .56, z: .72 });
    b.lamp(xm, 9.62, 0, { h: 1.1 }); }
  { const X0 = 2.9, X1 = 6.1, C0 = 4.15, C1 = 4.85, dy = .28, dz = .1;
    for (let i = 0; i < 5; i++) { const y0 = 8.6 + i * dy, y1 = y0 + dy, z = .5 - i * dz, q = (a, c) => `M${PL([[a, y0, z], [c, y0, z], [c, y1, z], [a, y1, z]])}Z`, rq = (a, c) => `M${PL([[a, y1, z - dz], [c, y1, z - dz], [c, y1, z], [a, y1, z]])}Z`;
      b.item([X0, y0, 0, X1, y1, z], pth(T(MR, tU), q(X0, X1)) + pth(T(MR, tL - .08), rq(X0, X1))
        + pth(T(CR, .2), q(C0, C1)) + pth(T(CR, -.1), rq(C0, C1)) + ln(GD, [C0 + .08, C1 - .08].map(x => `M${P(x, y0, z)} ${P(x, y1, z)} ${P(x, y1, z - dz)}`).join(''), .9)); }
    b.item([C0, 10, 0, C1, 10.2, .02], pth(T(CR, .2), `M${PL([[C0, 10, 0], [C1, 10, 0], [C1, 10.2, 0], [C0, 10.2, 0]])}Z`) + ln(GD, `M${P(C0, 10.2, 0)} ${P(C1, 10.2, 0)}`, 1.6, 'stroke-dasharray="1 1.6" style="stroke-linecap:butt"'), { cast: false }); }
  // lonca ustası (sarıklı, asalı) ve defter tutan kâtip
  b.fig(3.6, 9.02, .4, { body: '#4f2f6a', robe: true, hat: 'sarik', hatCol: '#f4ecd8' });
  b.art(3.6, 9.02, .4, pth(GD, 'M-3.7 -10.4h7.4v1.2h-7.4z') + ln(M.ahsapK, 'M5.6 0V-21', 1.1) + pth(GD, K.circ(5.6, -22, 1.6)), { bb: [3.46, 8.88, .4, 3.74, 9.16, 1.25] });
  b.fig(5.35, 9.58, .2, { body: '#3f7a6a', robe: true, hat: 'fes', hatCol: '#7a2a2a' });
  b.art(5.35, 9.58, .2, pth('#f4ecd8', 'M-6.6 -12.6l4.6 1.2l4.6 -1.2v4l-4.6 1.2l-4.6 -1.2z') + ln('#8a6a4a', 'M-2 -11.4v4', .6) + ln('#ffffff', 'M2.4 -12l3.4 -5.4', .9), { bb: [5.21, 9.44, .2, 5.49, 9.72, 1.05] });

  /* --- sol ön: selvili taş çiçeklik, bank, kedi --- */
  b.box(.35, 8.72, 0, 2.0, 9.4, .3, MR, { edge: false, T: '#7a5a40' });
  b.tree('selvi', .78, 9.06, { s: .95, z: .3 });
  { const r = b.r, pts = []; for (let i = 0; i < 7; i++) { const x = 1.1 + r() * .8, y = 8.85 + r() * .42; pts.push([x, y, .36, 0], [x, y, .4, 1], [x, y, .44, 2 + i % 2]); }
    blobs([1.05, 8.8, .3, 1.95, 9.32, .5], pts, [[LF[0], 6], [LF[1], 4, -1], [M.begonvil, 2.4, -1.5], [M.sari, 2.4, 1]]); }
  b.critter('kedi', 1.75, 9.33, .3);
  saksi(2.05, 9.75, 0, M.kirmizi);

  /* --- sağ ön: koleksiyona gelen sandıklar, hamal, el arabası, güvercinler --- */
  b.cart(7.85, 9.5, 0, 'x', { load: '#c9a04e' });
  b.fig(6.95, 9.72, 0, { body: M.bezM, hat: 'hasir', carry: 'kasa', step: 1 });
  b.fx('birds', 8.6, 9.25, 0, { n: 3 });

  /* --- kanat önü: saksıda turunç ağaçları --- */
  turunc(9.75, 3.75); turunc(9.75, 5.67); saksi(9.72, 6.55, 0, M.begonvil);

  b.tag(5, 9.9, 0).doorAt(4.5, 10);
});
