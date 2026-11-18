/* Damlı ev — teras kenarında alçak, kireç badanalı küp ev; asıl sahne düz damıdır.
   Sokak ARKADA kalır (v = 0, görünmez); görünen: dam, uçuruma bakan dış cephe ve uç cephe.
   opt: { cephe: 'L' | 'R', seed }. Tasarım (u, v) ile yazılır: u cephe boyunca, v sokaktan uçuruma; 'R' için x↔y aynalanır.
   Parçalar: ana küp + geri çekik alçak kiler (üstü çamaşırlık), kilerin önünde taş merdiven, dama el merdiveni,
   çardak (asma ya da hasır), sini ve minderler, biber sergisi, küp, kedi; tohuma göre kubbecik / rüzgâr bacası / balkon. */
(function () {
  // (u, v) → (x, y) aynası. Yüzler: O = dış cephe (v = v1), E = uç cephe (u = u1); ao/ae: cephe üstünde a konumu
  const yan = (b, K, R) => {
    const q = p => R ? [p[1], p[0], p[2] || 0] : p, bq = c => R ? [c[1], c[0], c[2], c[4], c[3], c[5]] : c;
    const sw = (a, i) => { if (R) { const t = a[i]; a[i] = a[i + 1]; a[i + 1] = t; } return a; };
    const s = { R, P: (u, v, z) => R ? K.P(v, u, z) : K.P(u, v, z), pr: (u, v, z) => R ? K.pr(v, u, z) : K.pr(u, v, z) };
    'crate barrel sack pot lamp table fig cyl cone dome chimney spill tag doorAt bench'.split(' ').forEach(k => s[k] = (...a) => b[k](...sw(a, 0)));
    'tree critter'.split(' ').forEach(k => s[k] = (...a) => b[k](...sw(a, 1)));
    'slab flat pave clothes hedge'.split(' ').forEach(k => s[k] = (...a) => b[k](...sw(sw(a, 0), 2)));
    s.fx = (t, u, v, z, o) => b.fx(t, R ? v : u, R ? u : v, z, R && o && o.axis ? Object.assign({}, o, { axis: o.axis === 'x' ? 'y' : 'x' }) : o);
    s.box = (u0, v0, z0, u1, v1, z1, c, o = {}) => {
      const x = R ? b.box(v0, u0, z0, v1, u1, z1, c, Object.assign({}, o, { L: o.E, R: o.O })) : b.box(u0, v0, z0, u1, v1, z1, c, Object.assign({}, o, { L: o.O, R: o.E }));
      return { O: R ? x.R : x.L, E: R ? x.L : x.R, T: x.T, ao: (u, w = 0) => R ? u1 - u - w : u - u0, ae: (v, w = 0) => R ? v - v0 : v1 - v - w };
    };
    s.stairs = (u0, v0, u1, v1, zt, zb, c, o) => R ? b.stairs(v0, u0, v1, u1, zt, zb, 'y', c, o) : b.stairs(u0, v0, u1, v1, zt, zb, 'x', c, o);   // +u yönüne iner
    s.line3 = (pts, c, w, o) => b.line3(pts.map(q), c, w, o);
    s.poly3 = (pts, c, o = {}) => b.poly3(pts.map(q), c, Object.assign({}, o, o.n ? { n: q(o.n) } : null, o.bb ? { bb: bq(o.bb) } : null));
    s.gpoly = (pts, c, o) => b.gpoly(pts.map(q), c, o); s.fence = (pts, h, o) => b.fence(pts.map(q), h, o);
    s.item = (bb, d, o) => b.item(bq(bb), d, o || { cast: false });
    s.art = (u, v, z, svg, o = {}) => b.art(R ? v : u, R ? u : v, z, R ? `<g transform="scale(-1 1)">${svg}</g>` : svg, o.bb ? Object.assign({}, o, { bb: bq(o.bb) }) : o);
    // yatay yüz (döşeme üstü: kilim, sergi…): (a, b) = (u - u0, v - v0)
    s.yer = (u0, v0, u1, v1, z) => { const f = new K.Face(R ? [v0, u0, z] : [u0, v0, z], R ? [0, 1, 0] : [1, 0, 0], R ? [1, 0, 0] : [0, 1, 0], u1 - u0, v1 - v0, [0, 0, 1]); b.item(bq([u0, v0, z, u1, v1, z]), () => f.svg(), { cast: false }); return f; };
    // düşey yüz: 'O' → v = c düzlemi (t0: u başlangıcı), 'E' → u = c düzlemi (t0: v başlangıcı)
    s.duvar = (kind, c, t0, z0, w, h) => { const lit = (kind === 'O') !== R, fx = kind === 'O' ? [t0, c] : [c, t0 + w], p = R ? [fx[1], fx[0]] : fx;
      const f = lit ? new K.Face([kind === 'O' ? p[0] : t0, kind === 'O' ? p[1] : c, z0], [1, 0, 0], [0, 0, 1], w, h, [0, 1, 0]) : new K.Face(kind === 'O' ? [c, t0 + w, z0] : [c, t0 + w, z0], [0, -1, 0], [0, 0, 1], w, h, [1, 0, 0]);
      b.item(bq(kind === 'O' ? [t0, c, z0, t0 + w, c + .02, z0 + h] : [c, t0, z0, c + .02, t0 + w, z0 + h]), () => f.svg(), { cast: false }); return f; };
    // nokta: sıfır boylu yuvarlak uçlu çizgi (daireden çok daha kısa yazılır); dn(x, y) birikir, nk(renk, yarıçap, d) basar
    s.dn = (x, y) => `M${K.f1(x)} ${K.f1(y)}h0`; s.nk = (c, r, d) => d ? K.ln(c, d, K.f1(2 * r)) : '';
    return s;
  };

  CK.def('dam', { w: 3.6, d: 3.4, name: 'Damlı Ev' }, (b, K, opt = {}) => {
    const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, C = K.circ, R = opt.cephe === 'R', s = yan(b, K, R), dn = s.dn, nk = s.nk;
    const W = R ? b.d : b.w, D = R ? b.w : b.d, rnd = K.rng((opt.seed || 7) * 7919 + 3), pick = a => a[Math.floor(rnd() * a.length)];
    const L3 = (...p) => 'M' + p.map(c => s.P(c[0], c[1], c[2])).join(' '), sec = (k, v) => opt[k] === undefined ? v : opt[k];

    /* --- tohumdan gelen seçenekler (opt ile de verilebilir) --- */
    const balkon = sec('balkon', rnd() < .4), ust = sec('ust', pick(['kubbe', 'baca', 'ruzgar'])), asma = sec('asma', rnd() < .55), etek = rnd() < .5;
    const sv = pick([M.kirec, M.kirec, '#f7f0e4', '#f1e4cf']), boya = pick([M.mavi, M.mavi, '#2f7f96', '#3b63a8']), dam = pick(['#dccaa6', '#d6c19a', '#e0cdb0']);
    const H = .98, Ha = .6, zp = H + .6, gl = R ? [-.65, .375] : [.375, -.65];       // gl: birim yükseklik başına gölge kayması (u, v)
    const u0 = .15, u1 = W - 1.28, v0 = .1, v1 = D - (balkon ? .4 : 1), ua = W - .12, va0 = v0 + .3, va = v1 - (balkon ? 1 : .55);

    /* --- saksılar: sardunya (0), fesleğen (1), pembe (2); aynı kottakiler tek parçada toplanır --- */
    const SK = {}, saksi = (u, v, z, t = 0, g = 'd') => { const p = s.pr(u, v, z), x = p[0], y = p[1], G = SK[g] || (SK[g] = { z, bb: [u, v, u, v], d: ['', '', '', '', '', ''] });
      G.bb = [Math.min(G.bb[0], u - .08), Math.min(G.bb[1], v - .08), Math.max(G.bb[2], u + .08), Math.max(G.bb[3], v + .08)];
      G.d[0] += `M${K.f1(x - 2.3)} ${K.f1(y + .6)}l-.6 -4h5.8l-.6 4z`; G.d[1] += dn(x + .3, y - 6); G.d[2] += dn(x + 2.3, y - 4.8);
      if (t === 1) G.d[3] += dn(x - .5, y - 7.2); else G.d[t ? 5 : 4] += dn(x - 1.8, y - 7.6) + dn(x + 1.2, y - 8.3) + dn(x + 2.8, y - 5.6); };
    const saksiBas = () => Object.values(SK).forEach(G => s.item([G.bb[0], G.bb[1], G.z, G.bb[2], G.bb[3], G.z + .36],
      pth(T(M.kiremitA, -.08), G.d[0]) + nk(T(M.sarmasik, -.14), 3.3, G.d[1]) + nk(T(M.sarmasik, -.04), 2, G.d[2]) + nk('#8cc063', 1.9, G.d[3]) + nk('#d43a2c', 1.1, G.d[4]) + nk(M.begonvil, 1.1, G.d[5])));
    // begonvil: cephe üstünde yaprak ve çiçek öbekleri
    const begonvil = (f, a0, a1, top, dr) => { const A = ['', '', '', ''];
      for (let a = a0; a <= a1 + .01; a += .12) { const len = dr[0] + rnd() * (dr[1] - dr[0]); for (let h = top + .05; h > top - len; h -= .1) { const p = f.q(a + (rnd() - .5) * .1, h, .05), k = rnd() < .64 ? 2 : 0; A[k] += dn(p[0], p[1]); if (rnd() < .55) A[k + 1] += dn(p[0] - 1, p[1] - 1.3); } }
      [[T(M.sarmasik, -.2), 6.4], [M.sarmasik, 3.6], [T(M.begonvil, -.1), 6.8], [T(M.begonvil, .28), 3.4]].forEach((c, i) => f.put(8 + i * .1, 'Ln ' + K.ks(c[0]), A[i], `stroke-width="${c[1]}"`)); };

    /* --- zemin: kenar avlusu --- */
    s.pave(0, va, W, D, M.parke);
    s.spill(.9, v1 + .5, 1.3);

    /* --- ana küp --- */
    const g = s.box(u0, v0, 0, u1, v1, H, sv);
    if (etek) { g.O.band(0, .2, boya, .16); g.E.band(0, .2, boya, .16); } else { g.O.band(0, .13, M.tas, .04); g.E.band(0, .13, M.tas, .04); }
    if (!balkon) {
      // dış cephe: begonvilli mavi kapı, kepenkli pencere, fener, eşik taşı
      g.O.door(g.ao(.34, .46), .46, .78, { kind: 'seg', col: boya, sove: M.tas });
      g.O.lantern(g.ao(.98), .74);
      g.O.win(g.ao(1.46, .36), .3, .36, .4, { shut: boya, frame: boya, lit: true });
      begonvil(g.O, g.ao(u0 + .04, .9), g.ao(u0 + .04, .9) + .9, H, [.08, .36]);
      s.slab(.3, v1, .84, v1 + .2, .06, .06, M.tas, { cast: false });
    } else {
      // balkonlu: uçurumun üstüne taşan korkuluklu çıkma, kapısı balkona açılır
      g.O.door(g.ao(1.2, .46), .46, .8, { kind: 'arch', col: boya, sove: M.tas, b: .08, fan: true });
      g.O.win(g.ao(.42, .34), .36, .34, .4, { shut: boya, frame: boya, lit: true });
      begonvil(g.O, g.ao(1.84, .34), g.ao(1.84, .34) + .34, H, [.15, .6]);
      b.balcony(g.O, g.ao(.95, 1.02), .08, 1.02, { out: .4, col: boya, rh: .3 });
      saksi(1.05, v1 + .3, .08, 2, 'a'); saksi(1.86, v1 + .12, .08, 0, 'a');
    }
    // uç cephe: kilerin üstünde kalan şeritte kurutmalık biber dizileri
    for (let i = 0; i < 4; i++) { const a = g.ae(va - .32 - i * .2), l = .2 + rnd() * .1; g.E.line([[a, H - .03], [a, H - .03 - l]], '#b83026', 2.4, 7); }

    /* --- kiler: geri çekik alçak ek; üstü çamaşırlık --- */
    const k = s.box(u1, va0, 0, ua, va, Ha, sv, { T: T(dam, -.04) });
    k.O.band(0, .13, etek ? boya : M.tas, etek ? .16 : .04); k.E.band(0, .13, etek ? boya : M.tas, etek ? .16 : .04);
    k.E.door(k.ae(va0 + .5, .4), .4, .46, { kind: 'arch', col: M.ahsapK, sove: M.tas });
    k.O.rect(k.ao(ua - .36, .2), .3, .2, .2, boya, 4).rect(k.ao(ua - .36, .2) + .035, .335, .13, .13, M.camI, 5);
    s.box(u1, va - .09, Ha, ua, va, Ha + .1, sv, { edge: false, cast: false }); s.box(ua - .09, va0, Ha, ua, va - .09, Ha + .1, sv, { edge: false, cast: false });
    // kilerin önünde avludan kiler damına çıkan taş merdiven; damdan dama el merdiveni
    s.stairs(u1 + .02, va, ua - .08, va + .36, Ha, 0, sv, { rise: .15 });
    const vl = va - .5;
    s.item([u1 + .02, vl, Ha, u1 + .3, vl + .22, H + .34], ln(M.ahsapK, L3([u1 + .3, vl, Ha], [u1 + .03, vl, H + .34]) + L3([u1 + .3, vl + .22, Ha], [u1 + .03, vl + .22, H + .34]), 1.4)
      + ln(M.ahsap, [.2, .4, .6, .8].map(t => L3([u1 + .3 - .27 * t, vl, Ha + (H + .34 - Ha) * t], [u1 + .3 - .27 * t, vl + .22, Ha + (H + .34 - Ha) * t])).join(''), 1.1));
    // çamaşır ipi: ana damın korkuluğundan kiler köşesindeki sırığa
    const vc = va0 + .16;
    s.line3([[ua - .1, vc, Ha], [ua - .1, vc, 1.56]], M.ahsapK, 1.5).line3([[u1 - .07, vc, H + .2], [u1 - .07, vc, 1.58]], M.ahsapK, 1.5);
    s.clothes(u1 - .07, vc, ua - .1, vc, 1.54, { n: 4, cols: [M.bezM, M.bez, M.bezK, M.bezS, '#7fb0c8'] });
    // çamaşır asan kadın: bir kolu ipte
    const kc = pick([M.bezM, '#b0567a', M.bezY]);
    s.art(u1 + .62, va0 + .56, Ha, pth(kc, 'M-3.4 -14.6Q-3.4 -16.6 -1 -16.6H1Q3.4 -16.6 3.4 -14.6L4.6 -.6Q0 1.2 -4.6 -.6Z') + pth(T(kc, -.26), 'M.6 -16.6H1Q3.4 -16.6 3.4 -14.6L4.6 -.6Q2.6 .3 .6 .6Z')
      + ln(kc, 'M3 -15L5.4 -21.6', 1.9) + nk(M.ten, 3, 'M0 -19.4h0') + nk(M.ten, .95, 'M5.6 -22.4h0') + pth(M.bez, 'M-3.4 -18.4Q-3.6 -23 0 -23Q3.6 -23 3.4 -18.4L3.8 -15.6H2.3L2.5 -19.8Q0 -21.4 -2.5 -19.8L-2.3 -15.6H-3.8Z'), { r: .14, h: .8 });
    s.art(u1 + .9, va0 + .7, Ha, pth('#c9a04e', 'M-4.4 0l-1 -4h10.8l-1 4z') + pth(M.bez, 'M-4.6 -4q2 -3 4.6 -1.6q3 -1.6 4.6 1.6z'), { r: .12, h: .2 });

    /* --- ana dam: korkuluklu toprak dam --- */
    s.flat(u0, v0, u1, v1, H, sv, { floor: dam });
    const dz = s.yer(0, 0, W, D, H), pu0 = u0 + .25, pu1 = u0 + 1.3, pv0 = v0 + .24, pv1 = v1 - .86;
    // çardağın dama düşen gölgesi
    { const a0 = Math.max(u0 + .13, pu0 - .1 + gl[0] * .65), a1 = Math.min(u1 - .13, pu1 + .1 + gl[0] * .65), b0 = Math.max(v0 + .13, pv0 - .12 + gl[1] * .65), b1 = Math.min(v1 - .13, pv1 + .16 + gl[1] * .65);
      dz.rect(a0, b0, a1 - a0, b1 - b0, dam, 2, asma ? -.1 : -.17); }
    // yerde kilim, üstünde sini ve minderler (çardağın ön kenarında)
    dz.rect(pu0 + .04, pv1 - .5, .98, .78, M.bezK, 3, -.1).rect(pu0 + .1, pv1 - .44, .86, .66, '#d8b88a', 3.1).rect(pu0 + .16, pv1 - .38, .74, .54, M.bezK, 3.2, -.04)
      .poly([[pu0 + .53, pv1 - .34], [pu0 + .8, pv1 - .11], [pu0 + .53, pv1 + .12], [pu0 + .26, pv1 - .11]], M.lacivert, 3.3, .1);
    dz.rect(pu0 + .08, pv1 - .04, .34, .26, M.bezM, 3.6, -.06).rect(pu0 + .7, pv1 - .36, .28, .28, M.bezS, 3.6, -.06);
    // biber sergisi: hasır sele üstünde kırmızı biber; balkonlu evde yanında bez üstünde kayısı
    const su = u1 - .52, svv = v1 - (balkon ? 1.45 : 1); let nb = '', nc = '';
    dz.shp('round', su - .27, svv - .27, .54, .54, '#b58a3c', 3).shp('round', su - .22, svv - .22, .44, .44, '#c8382a', 3.1, -.1);
    for (let i = 0; i < 7; i++) { const p = dz.q(su + Math.cos(i * 1.1) * .11, svv + Math.sin(i * 1.1) * .11); if (i % 2) nb += dn(p[0], p[1]); else nc += dn(p[0], p[1]); }
    dz.put(4, 'Ln ' + K.ks('#e85a3a'), nb, 'stroke-width="2.8"').put(4, 'Ln ' + K.ks('#8f1f1c'), nc, 'stroke-width="2.6"');
    if (balkon) { let na = ''; dz.rect(pu0 + .2, v1 - .62, .5, .4, M.bez, 3, -.06).rect(pu0 + .25, v1 - .57, .4, .3, '#e8943a', 3.1, -.1);
      for (let i = 0; i < 6; i++) { const p = dz.q(pu0 + .31 + (i % 3) * .13, v1 - .5 + (i % 2) * .14); na += dn(p[0], p[1]); } dz.put(4, 'Ln ' + K.ks('#f6c46a'), na, 'stroke-width="2.6"'); }
    s.cyl(pu0 + .56, pv1 + .04, .19, H + .03, H + .08, '#c98a4a', { cast: false, top: '#d9a05a' });
    s.art(pu0 + .56, pv1 + .04, H + .08, pth('#b06a3a', 'M-1.6 -1.6h3.2l1 -1.6l-.8 4.4h-3.6z') + nk('#f4ead0', 1.1, 'M-4.4 .4h0M4 1.4h0') + nk('#a83a2a', .6, 'M-4.4 .4h0M4 1.4h0'), { r: .1, h: .12 });
    // su küpü
    s.pot(u1 - .34, v1 - .36, H, { s: 1.2, col: M.kil });
    // tepe yapısı: kubbecik / badanalı baca / rüzgâr bacası (arka sağ köşe)
    const cu = u1 - .5, cv = v0 + .52;
    if (ust === 'kubbe') {
      s.cyl(cu, cv, .37, H, H + .1, sv, { top: null });
      s.dome(cu, cv, .35, H + .1, sv, { hf: .66, alem: false, seams: false });
      s.art(cu, cv, H + .33, pth(boya, C(0, -1.6, 1.7)) + nk('#7f9db0>#ffc866', 1.5, 'M-6.4 6.6h0M1.4 9h0M8 6h0'), { r: .36, h: .1 });
    } else if (ust === 'baca') {
      s.chimney(cu + .1, cv - .1, H, .5, { mat: sv, w: .32, s: .55, cap: M.kiremit }).O; s.box(cu - .06, cv - .26, H + .34, cu + .26, cv + .06, H + .4, boya, { edge: false, cast: false });
    } else {
      const c = s.box(cu - .12, cv - .28, H, cu + .3, cv + .14, H + .56, sv, { edge: false });
      for (const f of [c.O, c.E]) for (let i = 0; i < 3; i++) f.rect(.07 + i * .1, .2, .06, .26, M.ic, 4);
      s.slab(cu - .17, cv - .33, cu + .35, cv + .19, H + .62, .06, sv, { cast: false });
    }
    // çardak: dört dikme, kirişler, mertekler
    [[pu0, pv0], [pu1, pv0], [pu0, pv1], [pu1, pv1]].forEach(p => s.line3([[p[0], p[1], H], [p[0], p[1], zp]], M.ahsapK, 1.9));
    let d = L3([pu0 - .1, pv0, zp], [pu1 + .1, pv0, zp]) + L3([pu0 - .1, pv1, zp], [pu1 + .1, pv1, zp]);
    for (let i = 0; i < 5; i++) { const u = pu0 + (pu1 - pu0) * i / 4; d += L3([u, pv0 - .12, zp + .03], [u, pv1 + .14, zp + .03]); }
    s.item([pu0 - .1, pv0 - .12, zp - .02, pu1 + .1, pv1 + .14, zp + .04], ln(M.ahsap, d, 1.7));
    if (asma) {
      // asma: merteklere tutunmuş yaprak öbekleri, sarkan salkımlar, dikmeye sarılı gövde
      const A = ['', '', '', ''], n = 34;
      for (let i = 0; i < n; i++) { const p = s.pr(pu0 + (pu1 - pu0) * ((i * 3 % 5) / 4 + (rnd() - .5) * .3), pv0 - .1 + (pv1 - pv0 + .24) * ((i + rnd()) / n), zp + .05);
        A[0] += dn(p[0], p[1]); if (i % 3) A[1] += dn(p[0] - .8, p[1] - 1); if (i % 4 === 1) A[2] += dn(p[0] - 1.6, p[1] - 1.8); if (i % 7 === 2) A[3] += `M${K.f1(p[0] - 1.6)} ${K.f1(p[1] + 3)}h3.6l-1.8 5z`; }
      s.item([pu0 - .12, pv0 - .14, zp + .04, pu1 + .12, pv1 + .16, zp + .14], pth('#5a3f7a', A[3]) + nk(T('#5f9a48', -.2), 3.9, A[0]) + nk('#6aa84f', 2.7, A[1]) + nk(T('#6aa84f', .3), 1.2, A[2]));
      s.item([pu0 - .06, pv1, H, pu0 + .02, pv1 + .08, zp], ln(M.govde, `M${s.P(pu0 - .05, pv1 + .05, H)}Q${s.P(pu0 + .08, pv1 + .04, H + .3)} ${s.P(pu0 - .02, pv1 + .02, zp)}`, 1.5));
    } else {
      // hasır gölgelik: saz örgü, bağ çıtaları, kıvrılmış köşe
      const h = s.yer(pu0 - .1, pv0 - .12, pu1 + .1, pv1 + .16, zp + .05); h.fill('#cfae68'); h.planks({ dir: 'v', step: .085, dt: -.12 });
      h.rect(0, .3, h.w, .05, '#8a6a3a', 4).rect(0, h.h - .4, h.w, .05, '#8a6a3a', 4); h.rect(.5, 0, .36, .3, '#cfae68', 3, -.16);
    }
    // çardaktan sarkan fener (gece ışır) ve dama vuran ışık
    s.item([pu0, pv0, H, pu1, pv1, H], `<ellipse class="Nl" cx="${s.P(pu1 - .2, pv1, H).replace(' ', '" cy="')}" rx="34" ry="17" fill="url(#${K.glowId()})" opacity=".8"/>`);
    s.art(pu1, pv1 + .14, zp, ln(M.demir, 'M0 0v4', .8) + pth(M.demir, 'M-2.4 4h4.8l-.6 1.4h-3.6zM-1.8 10.4h3.6v1h-3.6z') + pth('#ffe9b0>#fff1c2', 'M-1.8 5.4h3.6v5h-3.6z') + `<circle class="Nl" cy="8" r="13" fill="url(#${K.glowId()})"/>`, { bb: [pu1 - .04, pv1 + .1, zp - .5, pu1 + .04, pv1 + .18, zp] });
    // korkulukta havalandırılan kilim (dış yüze sarkar), saksılar, kedi, güvercin
    const ku = balkon ? u0 + .2 : u1 - .86, kw = .56;
    s.poly3([[ku, v1 - .14, H + .205], [ku + kw, v1 - .14, H + .205], [ku + kw, v1 + .012, H + .205], [ku, v1 + .012, H + .205]], '#b4483a', { n: [0, 0, 1], bb: [ku, v1 - .14, H + .2, ku + kw, v1, H + .21] });
    const kl = s.duvar('O', v1 + .012, ku, H - .12, kw, .325); kl.fill('#b4483a'); kl.rect(0, .19, kw, .05, '#e8c878', 3).rect(0, .07, kw, .07, M.lacivert, 3, .12);
    kl.line([0, 1, 2, 3, 4, 5].map(i => [[kw * (i + .5) / 6, 0], [kw * (i + .5) / 6, -.05]]).flat(), M.bez, 1, 4);
    saksi(u0 + .07, v1 - .07, H + .2, 0); saksi(u1 - .07, v1 - .8, H + .2, 1); saksi(u0 + .07, pv1 + .3, H + .2, 2); saksi(u1 - .07, v0 + 1.1, H + .2, 0);
    if (!balkon) saksi(u0 + .95, v1 - .07, H + .2, 0);
    s.critter('kedi', balkon ? u1 - .7 : u0 + .6, v1 - .06, H + .2, { col: pick(['#e0903a', '#5a5450', '#3a3432']) });

    /* --- avlu: uçurum kenarında alçak duvar, saksıda limon, küpler --- */
    const w0 = balkon ? u1 + .12 : .08;
    s.box(w0, D - .12, 0, W - .06, D, .22, sv, { edge: false }).O.band(.17, .05, boya, .1);
    saksi(ua - .1, D - .06, .22, 0, 'a'); saksi(w0 + .3, D - .06, .22, 1, 'a'); if (!balkon) saksi(1.25, D - .06, .22, 2, 'a');
    s.art(ua - .5, D - .55, 0, pth(T(M.kiremitA, -.1), 'M-4 1l-1 -6h10l-1 6z') + ln(M.govde, 'M0 -5V-13', 1.6) + nk(T(M.narenciye, -.3), 7, 'M0 -18h0M3.6 -15.6h0') + nk(M.narenciye, 5, 'M-1.6 -19.6h0')
      + nk('#f2d14a', 1.3, 'M-4 -15.4h0M2.4 -17.4h0M5.6 -13h0M-.6 -22h0'), { r: .2, h: .9 });

    saksiBas();
    s.tag(W / 2, D, 0); s.doorAt(W * .4, -.3);
  });
})();
