/* Balıkçı kulübesi — sur dışında, kumsalda. Parsel 4.5 × 4; deniz +y yönünde.
   Geride devşirme tahtadan, saz damlı kulübe ve kamış sundurma; sağ geride ağ kurutma sırığı;
   solda balık ipi; önde kütüklere çekilmiş sandal, sepetler, çapa; ortada ağ onaran balıkçı.
   opt.seed boyaları ve ufak eşyayı değiştirir (iki kulübe yan yana durur). Zemin kumdur, döşenmez. */
CK.def('kulube', { w: 4.5, d: 4, name: 'Balıkçı Kulübesi' }, (b, K, opt = {}) => {
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, f1 = K.f1, pr = K.pr, PL = K.PL;
  const sd = opt.seed || 7, rnd = K.rng(sd * 7919 + 11), cift = sd % 2 === 0;
  const boya = [M.mavi, M.turkuaz, '#b5523f', M.yesil][sd % 4], agR = ['#7c9a86', '#a8664a', '#6f8ca6'][sd % 3];
  const tk = [{ g: '#f3eee2', s: '#2f6fa3', k: '#8a3d32' }, { g: '#7fb7d6', s: '#f3eee2', k: '#2c4a78' }, { g: '#b84a3b', s: '#f0dfb8', k: '#3c3836' }, { g: '#5c9474', s: '#e8c25a', k: '#7a3a30' }][(sd + 1) % 4];
  const AH = '#a88a66', SAZ = '#c2a866', KAM = '#cdb478', HASIR = '#b98d52', MANTAR = '#d98a4a', GUMUS = '#aebfcc', IP = '#6a5a4a', KUMK = T(M.kum, -.3);
  const tn = n => K.toneOf(K.unit(n));
  // ekran pikselinde göreli yol: p noktasına (dx,dy) kaydırılmış, k ölçekli
  const rel = (p, dx, dy, d, k = 1) => 'M' + f1(p[0] + dx * k) + ' ' + f1(p[1] + dy * k) + d.replace(/-?[\d.]+/g, n => f1(n * k));
  // aynı renkteki parçaları tek yolda toplar
  const kova = () => { const m = new Map(); return { add(c, d, w) { const k = (w ? 'Ln ' + K.ks(c) : K.kf(c)) + '|' + (w || ''); m.set(k, (m.get(k) || '') + d); return this; },
    svg() { let s = ''; for (const [k, d] of m) { const [c, w] = k.split('|'); s += `<path class="${c}"${w ? ` stroke-width="${w}"` : ''} d="${d}"/>`; } return s; } }; };

  /* --- kumda izler: omurga oluğu, ayak izleri, çakıl --- */
  const iz = [], yuru = (x0, y0, x1, y1, n) => { for (let i = 0; i < n; i++) { const t = (i + .5) / n, o = i % 2 ? .05 : -.05, l = Math.hypot(x1 - x0, y1 - y0); iz.push(pr(x0 + (x1 - x0) * t - (y1 - y0) / l * o, y0 + (y1 - y0) * t + (x1 - x0) / l * o)); } };
  yuru(.9, 2.3, 1.5, 2.75, 3); yuru(1.9, 2.95, 3.3, 3.3, 6); yuru(2.5, 3.5, 2.2, 3.98, 3);
  b.ground(`<g opacity=".55">${K.dots(KUMK, iz, 2.3)}</g>`);
  b.gpoly([[3.92, 3.8], [4.04, 3.8], [4.13, 4.15], [4.0, 4.15]], KUMK, { op: .45 });

  /* --- kulübe: devşirme tahta, tek göz --- */
  const X0 = .3, Y0 = .3, X1 = 2.3, Y1 = 1.9, H = 1.05;
  const g = b.box(X0, Y0, 0, X1, Y1, H, AH, { T: null });
  g.L.planks({ step: .2 }).shadeTop(.14);
  [[0, '#8a6a4a'], [.8, K.mix(AH, boya, .45)], [1.0, M.kirec], [1.8, K.mix(AH, boya, .3)]].forEach(([a, c]) => g.L.rect(a, 0, .2, H, c, 2.2, -.04));
  g.L.door(.3, .5, .8, { open: true, glow: true, sove: null, floor: M.kum });
  g.L.rect(.25, 0, .05, .86, M.ahsapK, 4.6).rect(.8, 0, .05, .86, M.ahsapK, 4.6).rect(.25, .8, .6, .06, M.ahsapK, 4.6);
  g.L.poly([[.3, 0], [.3, .8], [.72, .8, .24], [.72, 0, .24]], boya, 7, -.04).line([[.51, 0, .12], [.51, .8, .12]], boya, .7, 7.1, -.3).dot(.67, .4, 1, M.bronz, 7.2, .2, .21);
  g.L.win(1.22, .44, .4, .34, { shut: boya, lit: true, frame: M.ahsapK, bars: [2, 2] });
  g.R.planks({ step: .2, a1: .7 });
  // mantar şamandıra dizisi
  [0, 1].forEach(k => g.R.dots([0, 1, 2, 3, 4].filter(i => i % 2 === k).map(i => [.08 + i * .12, .78 - Math.sin(i / 4 * 3.14) * .1]), 3.8, k ? M.bez : MANTAR, 7));

  /* --- saz dam: yamalı, taş ağırlıklı --- */
  const rf = b.gable(X0, Y0, X1, Y1, H, .62, SAZ, { axis: 'x', ov: .12, tex: false, wall: AH }), A = rf.A.rows();
  rf.G.planks({ step: .4 }); rf.G.win(.63, .1, .34, .32, { kind: 'round', lit: true, sill: false, frame: M.ahsapK });
  A.poly([[1.3, .3], [1.95, .26], [1.98, .78], [1.34, .84]], M.bez, 3, -.04);
  A.put(4, 'Ln ' + K.ks(A.c(M.bez, -.34)), 'M' + [[1.36, .35], [1.9, .32], [1.92, .73], [1.4, .78]].map(p => A.P(p[0], p[1])).join(' ') + 'Z', 'stroke-width=".7" stroke-dasharray="1.6 1.4"');
  A.rect(.32, .56, .5, .34, M.ahsapA, 3, -.06).line([[.32, .67], [.82, .67]], M.ahsapA, .7, 4, -.3).line([[.32, .79], [.82, .79]], M.ahsapA, .7, 4, -.3);
  A.rect(.92, .04, .36, .3, SAZ, 3, .14);
  [.2, .86, 1.52, 2.08].forEach(a => A.line([[a, 1.16], [a, -.06]], SAZ, .8, 5, -.34)); A.dots([.2, .86, 1.52, 2.08].map(a => [a, -.1]), 3.6, '#8f8a80', 6, 0);
  const ym = (Y0 + Y1) / 2;
  [X0 - .14, X1 + .14].forEach(x => b.item([x - .03, ym - .26, 1.42, x + .03, ym + .26, 1.9], ln(M.ahsapK, 'M' + PL([[x, ym - .26, 1.42], [x, ym + .2, 1.9]]) + 'M' + PL([[x, ym + .26, 1.42], [x, ym - .2, 1.9]]), 1.4), { cast: false }));
  b.art(.8, .95, 1.5, ln(M.demir, 'M0 0V-14', 3) + ln(T(M.demir, .3), 'M-.8 0V-14', .8) + pth(T(M.demir, -.2), 'M-3.8 -14.6L0 -18.2L3.8 -14.6Z'), { bb: [.75, .9, 1.5, .85, 1, 2.1] });
  if (!cift) b.fx('smoke', .8, .95, 2.12, { s: .55 });

  /* --- kamış sundurma (ambar) --- */
  const ax1 = 3.05, ay1 = 1.25, an = b.box(X1, Y0, 0, ax1, ay1, .62, KAM, { T: null, edge: false });
  for (const f of [an.L, an.R]) f.planks({ step: .1, dt: -.12, wid: .6 }).line([[0, .2], [f.w, .2]], M.ahsapK, 1, 5).line([[0, .5], [f.w, .5]], M.ahsapK, 1, 5);
  an.L.door(.18, .4, .5, { open: true, sove: null, floor: M.kum });
  b.poly3([[X1, ay1, .62], [ax1, ay1, .62], [X1, ay1, .95]], KAM, { n: [0, 1, 0], bb: [X1, ay1 - .02, .62, ax1, ay1, .95] });
  const sh = b.shed(X1, Y0 - .05, ax1 + .12, ay1 + .1, .58, .97, '+x', '#9a8468', { tex: 'plank' });
  sh.A.rect(.1, .2, .3, .5, M.ahsapA, 2.2, -.04).rect(.7, 0, .3, .42, '#7f8f98', 2.2);

  /* --- ağ kurutma sırığı: L biçiminde, iki göz --- */
  const ag = (a0, a1, zt, zb, o = {}) => {
    const q = (s, t) => { const zT = zt - .1 * 4 * s * (1 - s), zB = zb + .06 * Math.sin(s * 8 + (o.ph || 0)) - (o.sark ? zb * Math.pow(s, 4) : 0); return pr(a0[0] + (a1[0] - a0[0]) * s, a0[1] + (a1[1] - a0[1]) * s, zT + (zB - zT) * t); };
    const S = p => f1(p[0]) + ' ' + f1(p[1]), n = 5, k = .4, c = .16; let out = '', d = ''; const fl = [], kr = [];
    for (let i = 0; i <= n; i++) { out += (i ? ' ' : 'M') + S(q(i / n, 0)); fl.push(q(i / n, .02)); }
    for (let i = n; i >= 0; i--) { out += ' ' + S(q(i / n, 1)); if (i % 2) kr.push(q(i / n, 1)); }
    for (let c0 = -k + c / 2; c0 < 1; c0 += c) d += 'M' + S(q(Math.max(0, c0), Math.max(0, -c0 / k))) + ' ' + S(q(Math.min(1, c0 + k), Math.min(1, (1 - c0) / k)));
    for (let c0 = c / 2; c0 < 1 + k; c0 += c) d += 'M' + S(q(Math.min(1, c0), Math.max(0, (c0 - 1) / k))) + ' ' + S(q(Math.max(0, c0 - k), Math.min(1, c0 / k)));
    b.item([Math.min(a0[0], a1[0]) - .02, Math.min(a0[1], a1[1]) - .02, 0, Math.max(a0[0], a1[0]) + .02, Math.max(a0[1], a1[1]) + .02, zt],
      pth(agR, out + 'Z', 'opacity=".3"') + ln(T(agR, -.3), d, .55) + K.dots(MANTAR, fl, 2.5) + K.dots(M.demir, kr, 1.5), { cast: false });
  };
  const D1 = [3.3, 1.45], D2 = [4.3, 1.45], D3 = [4.3, .45];
  ag(D3, D2, 1.24, .32, { ph: 2 }); ag(D2, D1, 1.24, .3, { sark: true });
  [D1, D2, D3].forEach((p, i) => b.line3([[p[0] + (i - 1) * .04, p[1], 0], [p[0], p[1], 1.34]], M.ahsapK, 1.7, { cast: true }));
  b.line3([[D1[0] - .1, D1[1], 1.26], [D2[0], D2[1], 1.27], [D3[0], D3[1] - .1, 1.26]], M.ahsap, 1.5);

  /* --- balık ipi: kulübe köşesinden direğe; kurumaya asılı balık ve ahtapot --- */
  const bx = .42, by0 = Y1, by1 = 3.72, ipz = t => .98 + .1 * t - .1 * 4 * t * (1 - t), kv = kova(), n = 7;
  for (let i = 0; i < n; i++) { const t = (i + .6) / (n + .3), p = pr(bx, by0 + (by1 - by0) * t, ipz(t));
    if (i === 2 || (cift && i === 4)) { kv.add('#b8607a', rel(p, -2.4, 3.4, 'a2.4 2.9 0 1 1 4.8 0z')).add('#d98fa0', rel(p, -1.4, 1.6, 'a1 1.2 0 1 1 2 0z'));
      [[-2, 'q-1.6 4.6 -.2 8.4'], [-1, 'q.4 5 -.6 9.6'], [0, 'q.6 4.6 .2 8.2'], [1, 'q1.4 4.4 0 9'], [2, 'q2 3.6 1 7']].forEach(([x, d]) => kv.add('#b8607a', rel(p, x, 3.4, d), '1')); }
    else { const l = 7 + rnd() * 3; kv.add(GUMUS, rel(p, -1.5, 0, 'h3l-1.5 2.4zm1.5 1.8q2.6 4 0 8.4q-2.6 -4.4 0 -8.4z', l / 9)).add(T(GUMUS, .4), rel(p, 0, 2.6, 'q-1.8 3 0 6.4z', l / 9)); } }
  b.item([bx - .05, by0, .4, bx + .05, by1, 1.15], ln(IP, `M${K.P(bx, by0, ipz(0))}Q${K.P(bx, (by0 + by1) / 2, ipz(.5) - .1)} ${K.P(bx, by1, ipz(1))}`, .8) + kv.svg(), { cast: false });
  b.line3([[bx + .04, by1 + .04, 0], [bx, by1, 1.2]], M.ahsapK, 1.8, { cast: true });
  // direkte gemici feneri
  b.art(bx, by1, 1.16, ln(M.demir, 'M0 0h5v2', 1) + pth(M.demir, 'M2.6 2h4.8v1.2h-4.8zM3 8.2h4v1h-4z') + pth('#ffe9b0>#fff1c2', 'M3.2 3.2h3.6v5h-3.6z') + `<circle class="Nl" cx="5" cy="6" r="15" fill="url(#${K.glowId()})"/>`, { bb: [bx - .02, by1, .8, bx + .3, by1 + .1, 1.2] });
  b.spill(.8, 3.7, 1.3).spill(.95, 2.4, 1);
  b.critter('kedi', .95, 2.95, 0, { col: ['#e0903a', '#8a8580', '#3a3634', '#efe6d6'][sd % 4] });

  /* --- sandal: kütükler üstünde, kıçı denize dönük --- */
  const S0 = [3.98, 3.85], B0 = [3.52, 2.2], Lb = Math.hypot(B0[0] - S0[0], B0[1] - S0[1]), dx = (B0[0] - S0[0]) / Lb, dy = (B0[1] - S0[1]) / Lb, tx = -dy, ty = dx;
  const G = (u, w, z) => [S0[0] + dx * u * Lb + tx * w, S0[1] + dy * u * Lb + ty * w, z];
  const half = u => u < .4 ? .29 + .11 * (1 - Math.pow((.4 - u) / .4, 2)) : .4 * (1 - Math.pow((u - .4) / .6, 2.4));
  const kz = u => .12 + (u > .75 ? .3 * Math.pow((u - .75) / .25, 2) : 0), sz = u => .5 + (u > .4 ? .2 * Math.pow((u - .4) / .6, 2) : .05 * Math.pow((.4 - u) / .4, 2));
  const hp = (u, v, sg) => G(u, sg * half(u) * Math.sqrt(v), kz(u) + (sz(u) - kz(u)) * v), fl = (u, sg) => G(u, sg * half(u) * .55, kz(u) + .07);
  const US = [0, .17, .33, .5, .67, .83, 1], RU = US.slice().reverse();
  const strip = (v0, v1, sg) => 'M' + PL(US.map(u => hp(u, v1, sg))) + ' ' + PL(RU.map(u => hp(u, v0, sg))) + 'Z';
  const ic = '#dccba6', cap = M.ahsap, tR = tn([tx, ty, 0]), tL = tn([-dx, -dy, 0]);
  let sv = pth(T(ic, -.2), 'M' + PL(US.map(u => hp(u, 1, -1))) + ' ' + PL(RU.map(u => fl(u, -1))) + 'Z')
    + pth(T(ic, .04), 'M' + PL(US.map(u => fl(u, -1))) + ' ' + PL(RU.map(u => fl(u, 1))) + 'Z')
    + ln(T(ic, -.34), US.slice(1, 6).map(u => 'M' + PL([hp(u, 1, -1), fl(u, -1), fl(u, 1)])).join(''), .7);
  for (const u of [.3, .6]) { const z = sz(u) - .1, w = half(u) * .92; sv += pth(T(cap, .2), 'M' + PL([G(u, -w, z), G(u, w, z), G(u + .07, w, z), G(u + .07, -w, z)]) + 'Z'); }
  if (cift) { const p = pr(...G(.2, 0, .34)); sv += pth(T(agR, -.1), K.ell(p[0], p[1], 5.4, 3)) + pth(T(agR, .2), K.ell(p[0] - 1, p[1] - 1.2, 3.4, 1.7)) + K.dots(MANTAR, [[p[0] - 3.6, p[1] + .6], [p[0] + .4, p[1] - 2.4], [p[0] + 3.4, p[1] + .8]], 2.2); }
  const kurek = sg => [G(.7, sg * .1, .4), G(0, sg * .2, sz(0) + .02), G(-.16, sg * .22, sz(0) + .04), G(-.36, sg * .25, sz(0) + .07)];
  if (!cift) sv += ln(M.ahsapA, 'M' + PL(kurek(-1).slice(0, 2)) + 'M' + PL(kurek(1).slice(0, 2)), 1.3);
  sv += pth(T(tk.g, tR), strip(.4, 1, 1)) + pth(T(tk.k, tR - .14), strip(0, .4, 1)) + ln(T(tk.s, tR + .1), 'M' + PL(US.map(u => hp(u, .8, 1))), 1.3);
  sv += pth(T(tk.g, tL), 'M' + PL([hp(0, 1, -1), hp(0, 1, 1), hp(0, .4, 1), hp(0, .4, -1)]) + 'Z') + pth(T(tk.k, tL - .1), 'M' + PL([hp(0, .4, -1), hp(0, .4, 1), hp(0, 0, 1)]) + 'Z');
  { const zc = (sz(0) + kz(0)) / 2 + .08; sv += pth(T(tk.s, tL), 'M' + PL([G(0, -.09, zc), G(0, 0, zc + .06), G(0, .09, zc), G(0, 0, zc - .06)]) + 'Z'); }
  sv += ln(T(cap, .16), 'M' + PL(US.map(u => hp(u, 1, -1))) + 'M' + PL(US.map(u => hp(u, 1, 1))) + 'M' + PL([hp(0, 1, -1), hp(0, 1, 1)]) + 'M' + PL([hp(1, 0, 1), G(1.02, 0, sz(1) + .08)]), 1.5);
  if (!cift) sv += ln(M.ahsapA, 'M' + PL(kurek(-1).slice(1, 3)) + 'M' + PL(kurek(1).slice(1, 3)), 1.3) + ln(T(tk.s, -.04), 'M' + PL(kurek(-1).slice(2)) + 'M' + PL(kurek(1).slice(2)), 2.2);
  b.item([3.3, 2.15, .12, 4.25, 3.9, .7], sv, { pts: [hp(0, 1, -1), hp(0, 1, 1), hp(.4, 1, -1), hp(.4, 1, 1), hp(1, 1, 1), hp(0, 0, 1), hp(1, 0, 1)] });
  { let d = '', e = ''; for (const u of [.12, .5, .86]) { const a = G(u, -.56, .06), c = G(u, .56, .06), p = pr(c[0], c[1], c[2]); d += 'M' + PL([a, c]); e += K.ell(p[0], p[1], 1.5, 2.3); }
    b.item([3.2, 2.2, 0, 4.45, 3.9, .12], ln('#8a6a4a', d, 4.6) + pth('#b99870', e), { cast: false }); }
  // çift tohumda kürekler kulübeye yaslı, sandalda ağ yığını
  if (cift) [[1.7, 0], [1.5, .06]].forEach(([y, e]) => b.item([X1 + .14, y - .06, 0, X1 + .4, y + .04, 1.66], ln(M.ahsapA, 'M' + PL([[X1 + .38 + e, y, 0], [X1 + .15, y - .05, 1.34]]), 1.3) + ln(T(tk.s, -.04), 'M' + PL([[X1 + .15, y - .05, 1.34], [X1 + .1, y - .06, 1.64]]), 2.4), { cast: false }));
  b.critter('marti', ...(cift ? G(1, 0, sz(1) + .08) : [1.5, ym, H + .62]));

  /* --- ıstakoz sepetleri, balık küfeleri, fıçı --- */
  const sepet = (list, bb) => { const kv = kova(); for (const [x, y, z] of list) { const p = pr(x, y, z);
    kv.add(T(HASIR, .16), rel(p, -6, 0, 'l8 4q-.4 -7.4 2.5 -8.6l-8 -4q-2.9 1.2 -2.5 8.6z')).add(T(HASIR, -.26), rel(p, 2, 4, 'q-.4 -7.4 2.5 -8.6q2.9 .6 2.5 6.1z')).add('#3a2e28', K.circ(p[0] + 4.7, p[1] - .5, 1.4))
      .add(T(HASIR, -.3), rel(p, -3.3, 1.3, 'q-.4 -6.9 2.5 -8.5') + rel(p, -.7, 2.7, 'q-.4 -7.2 2.5 -8.6') + rel(p, -5.3, -5, 'l8 4'), '.7'); }
    b.item(bb, kv.svg(), { cast: false }); };
  sepet([[2.46, 1.8, 0], [2.86, 1.74, 0], [2.66, 1.76, .3]], [2.3, 1.5, 0, 3.1, 2, .6]);
  const kufe = (x, y, dolu) => b.art(x, y, 0, pth(T(HASIR, -.2), 'M-5 -1q-.6 -4 .6 -5.4h8.8q1.2 1.4 .6 5.4q-5 3 -10 0z') + pth(T(HASIR, .14), 'M-5 -1q-.6 -4 .6 -5.4h4q-1 2.6 -.4 6.6q-2.4 -.2 -4.2 -1.2z') + pth(dolu ? GUMUS : '#3a2e28', K.ell(0, -6.4, 4.5, 1.8)) + (dolu ? pth(T(GUMUS, .4), 'M-3 -6.8q1.6 -1.4 3.2 0q-1.6 1.2 -3.2 0zM.6 -6q1.6 -1.2 3 0q-1.4 1 -3 0z') : ''), { r: .2, h: .3 });
  kufe(2.25, 3.05, true); kufe(2.55, 3.3, false);
  b.barrel(3.26, .86, 0, { r: .16, h: .42 });

  /* --- çapa: kuma yarı gömülü, halatı kangal --- */
  b.art(1.25, 3.62, 0, '<g transform="scale(.8)">' + ln('#c9b78a', 'M-4.6 -13.4q-6 -1 -7.4 5.4' + K.ell(-12, -6, 3.6, 1.6), 1) + ln('#3f434a', 'M-3.6 -12.6L1.8 -1.6M-6.6 -9.6L.6 -12.6M-5.4 -3Q.6 4 7.6 -3.4', 1.9) + pth('#3f434a', 'M-7.4 -5.4l3.4 .8l-1.8 2.6zM9.4 -6l-3.2 1l1.9 2.3z') + ln('#3f434a', K.circ(-4.2, -13.8, 1.4), .9) + '</g>', { r: .3, h: .5 });

  /* --- balıkçı: taburede, dizinde ağ --- */
  { const giy = ['#3f6f8f', '#8a4a3a', '#5a7a5a', '#c9b48a'][sd % 4], pan = '#4a4038', ten = M.ten;
    b.art(1.62, 2.82, 0, `<ellipse cx="-1" cy=".4" rx="8" ry="2.6" fill="#1b2440" opacity=".2"/>`
      + ln(M.ahsapK, 'M-2.4 0L-1.6 -4.4M2.8 0L2 -4.4', 1) + pth(M.ahsapA, K.ell(.2, -4.6, 3.4, 1.4))
      + pth(pan, 'M0 -7.8L-5.6 -7.2L-5.4 -5L.6 -5ZM-6 -7.3L-3.8 -6.8L-4.4 -.4L-6.6 -.4Z') + pth('#2a2420', 'M-8 -.8h3.7v1.1h-3.7z')
      + pth(giy, 'M-2.2 -13Q-2.2 -15 -.2 -15H1.4Q3.4 -15 3.4 -13V-5.6H-1.8Z') + pth(T(giy, -.24), 'M1 -15H1.4Q3.4 -15 3.4 -13V-5.6H1Z')
      + pth(agR, 'M-5.6 -9.6L-6.4 -6.6L-10 -2.4L-15 .6L-10.5 2.8L-3 1.8L-3.6 -5.4Z', 'opacity=".5"') + ln(T(agR, -.3), 'M-6 -8L-4 -3L-6 2M-8 -4.6L-6.4 .2L-9.6 2.4M-6.2 -6.8L-9.6 -2.8L-12.6 1.8M-4 -5L-7.6 -.8L-9 2.6', .55) + K.dots(MANTAR, [[-14.6, .6], [-11.4, 2.6], [-7.4, 2.4]], 2.2)
      + pth(T(giy, .14), 'M-1.8 -13.6L0 -12.6L-4.6 -8.6L-5.8 -9.8Z') + pth(ten, K.circ(-5.4, -9, .95)) + ln('#f4e9c8', 'M-5.6 -9.2l-2.6 1.2', .9)
      + pth(ten, K.circ(.4, -17.6, 2.9)) + pth(T(ten, -.2), 'M.4 -20.5a2.9 2.9 0 0 1 0 5.8z') + pth('#ece6da', 'M-2.3 -17Q-2.4 -14.2 0 -14.4Q1.4 -14.6 1.6 -15.8Q-.6 -15.6 -2.3 -17Z')
      + (cift ? pth(boya, 'M-2.6 -18.4Q-2.6 -21.6 .4 -21.6Q3.4 -21.6 3.4 -18.4Z') + pth(M.bez, K.circ(.4, -21.8, .9)) : pth('#d9b866', K.ell(.4, -19.4, 5.2, 1.7)) + pth('#c9a04e', 'M-2 -19.6Q.4 -23.2 2.8 -19.6Z')), { bb: [1.3, 2.6, 0, 1.8, 3.1, .7] }); }

  b.tufts(.05, 2.2, .3, 3.3, 3, { col: '#a9a860' }).tufts(3.5, .05, 4.45, .3, 2, { col: '#a9a860' });
  b.tag(2.25, 3.95, 0).doorAt(.85, 2.25);
});
