/* Dükkân — teras kenarında alçak, dik arduvaz çatılı küçük gotik dükkân. Sokak ARKADA (v = 0, görünmez);
   görünen: uçuruma bakan dış cephedeki satış gözü (içi sıcak ışıkla dolu, önünde açılır kepenk tezgâhı),
   uç cephedeki (E) arduvaz sundurmalı yan tezgâh ve kara çatkılı alınlık, önlükte türüne göre mallar.
   IŞIK: satış gözünden taşan sıcak ışık + yere vuran ışık havuzu, en çok bir asılı fener (fırında fener yerine ocak ateşi).
   opt: { cephe: 'L' | 'R', seed, tur: 'manav' | 'firin' | 'baharat' | 'kumas' | 'balik' }.
   Tasarım (u, v) ile yazılır: u cephe boyunca, v sokaktan uçuruma; 'R' için x↔y aynalanır. */
(function () {
  // (u, v) → (x, y) aynası. Yüzler: O = dış cephe (v = v1), E = uç cephe (u = u1); ao/ae: cephe üstünde a konumu
  const yan = (b, K, R) => {
    const q = p => R ? [p[1], p[0], p[2] || 0] : p, bq = c => R ? [c[1], c[0], c[2], c[4], c[3], c[5]] : c;
    const sw = (a, i) => { if (R) { const t = a[i]; a[i] = a[i + 1]; a[i + 1] = t; } return a; };
    const s = { R, P: (u, v, z) => R ? K.P(v, u, z) : K.P(u, v, z), pr: (u, v, z) => R ? K.pr(v, u, z) : K.pr(u, v, z) };
    'crate barrel sack pot table fig cyl cone chimney spill tag doorAt bench'.split(' ').forEach(k => s[k] = (...a) => b[k](...sw(a, 0)));
    'tree critter'.split(' ').forEach(k => s[k] = (...a) => b[k](...sw(a, 1)));
    'slab pave clothes'.split(' ').forEach(k => s[k] = (...a) => b[k](...sw(sw(a, 0), 2)));
    s.fx = (t, u, v, z, o) => b.fx(t, R ? v : u, R ? u : v, z, R && o && o.axis ? Object.assign({}, o, { axis: o.axis === 'x' ? 'y' : 'x' }) : o);
    s.box = (u0, v0, z0, u1, v1, z1, c, o = {}) => {
      const x = R ? b.box(v0, u0, z0, v1, u1, z1, c, Object.assign({}, o, { L: o.E, R: o.O })) : b.box(u0, v0, z0, u1, v1, z1, c, Object.assign({}, o, { L: o.O, R: o.E }));
      return { O: R ? x.R : x.L, E: R ? x.L : x.R, T: x.T, ao: (u, w = 0) => R ? u1 - u - w : u - u0, ae: (v, w = 0) => R ? v - v0 : v1 - v - w };
    };
    // beşik çatı: ax 'u' mahya u boyunca (alınlık G uç cephede, u1'de) · 'v' mahya v boyunca (alınlık dış cephede)
    s.gable = (u0, v0, u1, v1, z, rise, c, o = {}) => { const ax = (o.ax === 'v') !== R ? 'y' : 'x'; return R ? b.gable(v0, u0, v1, u1, z, rise, c, Object.assign({}, o, { axis: ax })) : b.gable(u0, v0, u1, v1, z, rise, c, Object.assign({}, o, { axis: ax })); };
    // sundurma: d 'u' → alçak kenar u1'de, 'v' → alçak kenar v1'de
    s.shed = (u0, v0, u1, v1, zl, zh, d, c, o) => R ? b.shed(v0, u0, v1, u1, zl, zh, d === 'u' ? '+y' : '+x', c, o) : b.shed(u0, v0, u1, v1, zl, zh, d === 'u' ? '+x' : '+y', c, o);
    s.stairs = (u0, v0, u1, v1, zt, zb, c, o) => R ? b.stairs(v0, u0, v1, u1, zt, zb, 'y', c, o) : b.stairs(u0, v0, u1, v1, zt, zb, 'x', c, o);   // +u yönüne iner
    s.line3 = (pts, c, w, o) => b.line3(pts.map(q), c, w, o);
    s.poly3 = (pts, c, o = {}) => b.poly3(pts.map(q), c, Object.assign({}, o, o.n ? { n: q(o.n) } : null, o.bb ? { bb: bq(o.bb) } : null));
    s.gpoly = (pts, c, o) => b.gpoly(pts.map(q), c, o); s.fence = (pts, h, o) => b.fence(pts.map(q), h, o);
    s.item = (bb, d, o) => b.item(bq(bb), d, o || { cast: false });
    s.art = (u, v, z, svg, o = {}) => b.art(R ? v : u, R ? u : v, z, R ? `<g transform="scale(-1 1)">${svg}</g>` : svg, o.bb ? Object.assign({}, o, { bb: bq(o.bb) }) : o);
    // nokta: sıfır boylu yuvarlak uçlu çizgi (daireden çok daha kısa yazılır); dn(x, y) birikir, nk(renk, yarıçap, d) basar
    s.dn = (x, y) => `M${K.f1(x)} ${K.f1(y)}h0`; s.nk = (c, r, d) => d ? K.ln(c, d, K.f1(2 * r)) : '';
    return s;
  };
  // arduvaz dokusu: ince yatay sıralar, şaşırtmalı derzler, tek tük kırık arduvaz, saçakta yosun
  const arduvaz = (K, f, rnd, st = .18) => { const w = f.w, h = f.h; let dk = '', tk = '', pd = '', ym = [];
    for (let c = st, k = 0; c < h - .04; c += st, k++) { dk += f.seg(0, c, w, c); for (let a = (k % 2 ? .18 : .04) + rnd() * .2; a < w - .05; a += .3 + rnd() * .25) if (rnd() < .3) tk += f.seg(a, c - st + .03, a, c); }
    for (let i = 0; i < Math.round(w * h * .3) + 1; i++) { const a = rnd() * (w - .3), c = st * Math.floor(rnd() * Math.max(1, h / st - 1)) + .015; pd += `M${f.P(a, c)} ${f.P(a + .26, c)} ${f.P(a + .26, c + st - .03)} ${f.P(a, c + st - .03)}Z`; }
    for (let i = 0; i < Math.round(w * .8); i++) ym.push(f.q(.1 + rnd() * (w - .2), .04 + rnd() * Math.min(.5, h * .4), .02));
    f.put(2.2, K.kf(f.c(f.mc, -.18)), pd).put(2.5, 'Ln ' + K.ks(f.c(f.mc, -.34)), dk, 'stroke-width=".9"').put(2.6, 'Ln ' + K.ks(f.c(f.mc, -.26)), tk, 'stroke-width=".7"')
      .put(2.8, 'Ln ' + K.ks(f.c(K.M.gYosun, -.1)), ym.map(p => `M${K.f1(p[0])} ${K.f1(p[1])}h0`).join(''), 'stroke-width="3"').poly([[0, 0], [w, 0], [w, .1], [0, .1]], f.mc, 2.3, -.14); };

  CK.def('dukkan', { w: 3.4, d: 3, name: 'Dükkân' }, (b, K, opt = {}) => {
    const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, f1 = K.f1, R = opt.cephe === 'R', s = yan(b, K, R), dn = s.dn, nk = s.nk;
    const W = R ? b.d : b.w, D = R ? b.w : b.d, rnd = K.rng((opt.seed || 7) * 6151 + 11), pick = a => a[Math.floor(rnd() * a.length)];
    const L3 = (...p) => 'M' + p.map(c => s.P(c[0], c[1], c[2])).join(' ');
    const tur = opt.tur || pick(['manav', 'firin', 'baharat', 'kumas', 'balik']);
    // malzeme: kesme taş ya da kirli sıva; mallar soluk tonlarda, tek vurgu kan kırmızısı
    const tasli = rnd() < .5, DUV = tasli ? pick([M.gTasK, M.gTas, '#6a655e']) : pick(['#ab9f8a', '#a39784', '#a8987c']), CATI = pick([M.gCatiK, '#4c5058', M.gCati]);
    const MAL = { manav: ['#7a8a4a', '#9a6a3a', '#8a3a2a', '#a08a4a', '#5a6a3a'], firin: ['#b08a5a', '#9a6a3a', '#c8b48a', '#a07a4a', '#8a6a3a'], baharat: ['#9a4a2a', '#a8842a', '#6a7a3a', '#7a3a2a', '#8a6a3a'], kumas: [M.gKan, M.gMor, '#3e4a5a', '#5a6a4a', '#8a7a5a'], balik: ['#8a9aa4', '#a08a84', '#6a7a84', '#8a9aa4', '#7a8a94'] }[tur];
    const H = 1.08, u0 = .15, u1 = W - 1.02, v0 = .1, v1 = D - .86, ru = u1 - u0, rv = v1 - v0;

    /* --- mal yığınları: renk ve boy başına tek yol (nokta) --- */
    let ny = {};
    const yig = (u, v, z, col, n = 5, r = 2.2, sp = .1) => { const k = col + r, a = ny[k] || (ny[k] = ['', '', col, r]);
      for (let i = 0; i < n; i++) { const p = s.pr(u + (rnd() - .5) * 2 * sp, v + (rnd() - .5) * 2 * sp, z); a[0] += dn(p[0], p[1] - r * .7); if (i % 2 === 0) a[1] += dn(p[0] - r * .3, p[1] - r * 1.1); } };
    const yigBas = (bb, ek = '') => { s.item(bb, ek + Object.values(ny).map(a => nk(T(a[2], -.14), a[3], a[0]) + nk(T(a[2], .24), a[3] * .42, a[1])).join('')); ny = {}; };
    const kasa = (u, v, z, w, d, col, n = 5) => { s.box(u, v, z, u + w, v + d, z + .14, M.gAhsap, { T: T(col, -.3), edge: false, cast: false }); for (let i = 0; i < n; i++) yig(u + w * (.2 + .6 * rnd()), v + d * (.25 + .5 * rnd()), z + .11, col, 1, 2.1, 0); };
    // sırık + ip + asılı şeyler: tek parça. as: [[t (0..1), boy, renk, kalınlık], ...] düşey asılı çizgiler
    const aski = (ua, va, ub, vb, z0, z1, as, ek = '') => { let d = L3([ua, va, z0], [ua, va, z1 + .04]) + L3([ub, vb, z0], [ub, vb, z1 + .04]), g = {};
      for (const [t, l, c, w] of as) { const k = c + '|' + w; g[k] = (g[k] || '') + L3([ua + (ub - ua) * t, va + (vb - va) * t, z1 - .02], [ua + (ub - ua) * t, va + (vb - va) * t, z1 - .02 - l]); }
      s.item([Math.min(ua, ub) - .03, Math.min(va, vb) - .03, z0, Math.max(ua, ub) + .03, Math.max(va, vb) + .03, z1 + .04], ln(M.gAhsapK, d, 1.5) + ln('#4a4038', L3([ua, va, z1], [ub, vb, z1]), .8) + Object.keys(g).map(k => ln(k.split('|')[0], g[k], +k.split('|')[1])).join('') + ek); };

    /* --- zemin: kaldırım, satış gözünün önüne vuran sıcak ışık --- */
    const hu = u0 + .22, hw = Math.min(1.1, ru * .52);
    s.pave(0, v1, W, D, '#5a5650'); s.spill(hu + hw / 2, v1 + .55, 1.35);

    /* --- dükkân gövdesi --- */
    const g = s.box(u0, v0, 0, u1, v1, H, DUV, { T: null });
    for (const f of [g.O, g.E]) { if (tasli) f.courses({ rh: .24, bw: .58, dens: .5 }).stones(3, { rh: .24 }); else f.band(.16, .3, DUV, -.07).patches(1, { col: M.gTasK, b1: .8 }); f.band(0, .16, M.gKara, .02).shadeTop(.16, -.18); }
    // dış cephe: basık ya da sivri kemerli satış gözü — içi sıcak ışıkla dolu, raflarda mal gölgeleri
    const ha = g.ao(hu, hw), gb = .3, gh = .6, kind = tasli ? 'point' : 'seg';
    g.O.arcade(ha - .08, ha + hw + .08, 1, gh, { b: gb, pier: .08, kind, th: .14, dark: M.gKor, floor: M.gAhsapK });
    g.O.rect(ha + .02, gb + .12, hw - .04, gh * .58, M.gAtes, 3.3, null);
    { let d = '', p = ''; for (const zz of [gb + .2, gb + .42]) { d += `M${g.O.P(ha, zz)} ${g.O.P(ha + hw, zz)}`; for (let a = ha + .06; a < ha + hw - .05; a += .09 + rnd() * .07) if (rnd() < .7) { const q = g.O.q(a, zz + .01); p += dn(q[0], q[1] - 2); } }
      g.O.put(3.6, 'Ln ' + K.ks(M.gAhsapK), d, 'stroke-width="1.4"').put(3.7, 'Ln ' + K.ks('#3a2a20'), p, 'stroke-width="3.4"'); }
    if (tasli) g.O.shp(kind, ha - .14, gb - .02, hw + .28, gh + .1, M.gTasA, 2.9, .04);
    // açılır kepenk: üst kanat yukarı kaldırılmış (çatkılı sundurma), alt kanat tezgâh olarak inmiş
    b.awning(g.O, ha - .08, gb + gh + .1, hw + .16, { out: .3, drop: .12, cols: [M.gAhsap, T(M.gAhsap, -.08)], val: 0, stripe: .14 });
    s.slab(hu - .06, v1, hu + hw + .06, v1 + .24, gb, .05, M.gAhsap, { cast: false });
    s.line3([[hu, v1 + .22, gb - .05], [hu, v1 + .02, .02]], M.gAhsapK, 1.2).line3([[hu + hw, v1 + .22, gb - .05], [hu + hw, v1 + .02, .02]], M.gAhsapK, 1.2);
    // ikinci, sönük pencere: kepengi kapalı
    if (ru - hw > 1.1) { const a = g.ao(u1 - .5, .3); g.O.win(a, .42, .3, .44, { kind: 'rect', frame: M.gAhsapK, sove: tasli ? M.gTasA : undefined, lit: false, sill: !tasli }); }
    if (tur !== 'firin') g.O.lantern(g.ao(hu + hw + .3), .98, { r: 12 });                                   // tek asılı fener

    /* --- dik arduvaz çatı: mahya cepheye koşut, uç cephede kara çatkılı alınlık --- */
    const ov = .16, half = rv / 2, rise = Math.min(.82, half * .82), gc = s.gable(u0, v0, u1, v1, H, rise, CATI, { ax: 'u', ov, wall: tasli ? DUV : '#8a7e6c', tex: false });
    arduvaz(K, gc.A, rnd); if (gc.B) arduvaz(K, gc.B, rnd);
    if (tasli) gc.G.courses({ rh: .24, dens: .4 }); else gc.G.timber({ col: M.gAhsapK, posts: [half - .2, half + .2], rails: [.04], braces: [[.1, .05, half - .2, rise * .55], [half * 2 - .1, .05, half + .2, rise * .55]], wid: 2 });
    gc.G.win(half - .1, rise * .18, .2, Math.min(.36, rise * .42), { kind: 'point', frame: M.gAhsapK, lit: false, sill: false, bars: [2, 2] });
    { const zr = H + rise; s.item([u1 + ov - .04, v0 + half - .04, zr, u1 + ov + .04, v0 + half + .04, zr + .42], ln(M.gDemir, L3([u1 + ov, v0 + half, zr - .02], [u1 + ov, v0 + half, zr + .4]), 1.3)); }
    if (tur !== 'firin') { const cu = u0 + ru * (rnd() < .5 ? .28 : .7), cv = v0 + half * .55; s.chimney(cu, cv, H + rise * .5, rise * .5 + .55, { mat: M.gTasK, w: .3, s: .6, cap: T(M.gTasK, -.24) }); }

    /* --- tabela: köşedeki demir kolda asılı levha (türün simgesi kemik rengi) --- */
    const tb = { manav: nk('#8a5a3a', 3, 'M0 9h0') + ln(M.gYosun, 'M0 6l2.4 -2', 1.6), firin: `<circle cy="9" r="2.6" fill="none" class="${K.ks(M.gKemik)}" stroke-width="2"/>`,
      baharat: nk(M.gPas, 1.7, 'M-2.2 10.4h0') + nk(M.gKemik, 1.7, 'M2.2 10.4h0') + nk(M.gYosun, 1.7, 'M0 7h0'), kumas: pth(M.gKemik, 'M0 5l3.4 4l-3.4 4l-3.4 -4z'), balik: pth(M.gKemik, 'M-4 9q3.4 -3.6 6 0q-2.6 3.6 -6 0zM2 9l2.6 -2v4z') }[tur];
    s.line3([[u1 - .06, v1, H - .16], [u1 - .06, v1 + .46, H - .16], [u1 - .06, v1, H - .42]], M.gDemir, 1.4);
    s.art(u1 - .06, v1 + .27, H - .16, `<g transform="matrix(1 -.5 0 1.2247 0 0)">` + ln(M.gDemir, 'M-4 0v3M4 0v3', .8) + pth(M.gAhsapK, 'M-6.4 3h12.8v12h-12.8z') + pth(T(M.gAhsap, -.1), 'M-5.4 4h10.8v10h-10.8z') + tb + '</g>', { bb: [u1 - .09, v1 + .02, H - .7, u1 - .03, v1 + .46, H - .16] });

    /* --- yan tezgâh (uç cephe): arduvaz sundurma altında; fırında yerine taş ocak --- */
    const cv0 = v0 + .34, cv1 = v1 - .06, cu = u1 + .28;
    if (tur !== 'firin') {
      const c = s.box(cu, cv0, 0, cu + .44, cv1, .34, M.gAhsap, { edge: false }); c.E.planks({ step: .22, dt: -.2 }); c.O.planks({ step: .22, dt: -.2 });
      arduvaz(K, s.shed(u1, cv0 - .14, u1 + .78, cv1 + .16, H - .4, H - .06, 'u', CATI, { tex: false }).A, rnd, .15);
      [cv0 - .08, cv1 + .1].forEach(v => s.line3([[u1 + .72, v, 0], [u1 + .72, v, H - .37]], M.gAhsapK, 1.7));
    }
    const tez = i => [cu + .22, cv0 + (cv1 - cv0) * (i + .5) / 5, .34];           // tezgâh üstünde 5 göz
    const satici = (u, v) => s.fig(u, v, 0, { body: pick([M.gAhsapK, '#3e4048', '#4a4238', M.gMor]), legs: '#2a2624', robe: true, hat: pick(['ortu', 'ortu', 'none']), hatCol: pick(['#3a3a40', '#4a4238']), hair: '#2a2420' });

    if (tur === 'manav') {
      /* tezgâh: kök sebze, lahana, elma öbekleri; önlük: kasalar, çuval */
      MAL.forEach((c, i) => yig(...tez(i), c, 6, 2.4, .1)); yigBas([cu, cv0, .34, cu + .44, cv1, .5]);
      yig(hu + hw * .25, v1 + .12, gb, MAL[0], 4, 2, .07); yig(hu + hw * .7, v1 + .12, gb, MAL[2], 4, 2, .07); yigBas([hu, v1, gb, hu + hw, v1 + .24, gb + .12]);
      kasa(u0 + hw + .62, v1 + .3, 0, .4, .32, MAL[1]); kasa(u0 + hw + .62, v1 + .3, .14, .4, .32, MAL[3], 4); yigBas([u0 + hw + .62, v1 + .3, .14, u0 + hw + 1.02, v1 + .62, .4]);
      s.sack(u0 + .12, v1 + .5, 0, { col: '#7a6a4e' });
    } else if (tur === 'firin') {
      /* taş ocak: sivri ağzında kor ve alev, arkasında yüksek baca */
      const o0 = v0 + .3, o1 = v0 + 1.3, ou = W - .12;
      const o = s.box(u1 + .06, o0, 0, ou, o1, .62, M.gTasK, { edge: false }); o.O.courses({ rh: .17, dens: .7 }); o.E.courses({ rh: .17, dens: .7 });
      o.O.arcade(.2, ou - u1 - .26, 1, .4, { pier: .06, th: .3, kind: 'point', dark: M.gKor, floor: '#3a3430' });
      o.O.put(5.5, K.kf(M.gAtes), o.O.shapeD('round', .32, .03, ou - u1 - .7, .14, -.2));
      arduvaz(K, s.gable(u1 + .02, o0 - .04, ou + .04, o1 + .04, .62, .36, CATI, { ax: 'v', ov: .06, wall: M.gTasK, tex: false, cast: false }).A, rnd, .14);
      const bc = s.box(u1 + .3, v0 + .02, 0, u1 + .62, o0, 1.9, M.gTasK, { edge: false }); bc.O.courses({ rh: .2, dens: .8 }); bc.E.courses({ rh: .2, dens: .8 });
      s.box(u1 + .25, v0 - .03, 1.9, u1 + .67, o0 + .05, 1.98, M.gKara, { edge: false, cast: false });
      s.fx('smoke', u1 + .46, v0 + .16, 2.02, { s: 1 }); s.fx('fire', (u1 + .06 + ou) / 2, o1 + .02, .08, { s: .45 });
      // fırıncı ve küreği, ekmek tahtası, un çuvalları
      s.fig(u1 + .62, o1 + .62, 0, { body: M.gKul, legs: '#3a3430', hat: 'none', hair: '#2a2420' });
      s.line3([[u1 + .56, o1 + .5, .34], [u1 + .5, o1 + .06, .2]], M.gAhsapA, 1.6, { pad: .01 });
      s.box(u1 + .1, v1 - .1, 0, u1 + .44, v1 + .5, .3, M.gAhsap, { edge: false });
      yig(u1 + .27, v1 + .08, .3, MAL[3], 3, 2.6, .1); yig(u1 + .27, v1 + .36, .3, MAL[0], 3, 2.4, .08); yigBas([u1 + .1, v1 - .1, .3, u1 + .44, v1 + .5, .4]);
      yig(hu + hw * .25, v1 + .12, gb, MAL[0], 4, 2.3, .07); yig(hu + hw * .7, v1 + .12, gb, MAL[1], 4, 2.3, .07); yigBas([hu, v1, gb, hu + hw, v1 + .24, gb + .12]);
      s.sack(u0 + hw + .8, v1 + .32, 0, { col: '#8a8270' }).sack(u0 + hw + 1.08, v1 + .42, 0, { col: '#7a7262' });
    } else if (tur === 'baharat') {
      /* sundurma altında asılı biber ve sarımsak hevenkleri; tezgâhta ağzı açık çuvallar; önlükte fıçılar */
      aski(cu + .4, cv0 - .02, cu + .4, cv1 + .04, .34, H - .42, [[.12, .22, '#7a2a22', 2.4], [.3, .18, M.gKemik, 2.8], [.5, .24, '#7a2a22', 2.4], [.7, .16, '#6a7a3a', 2.8], [.88, .22, M.gKemik, 2.8]]);
      let sb = '', st = MAL.map(() => ''); for (let i = 0; i < 5; i++) { const p = s.pr(...tez(i)); sb += dn(p[0], p[1] - 3); st[i] += dn(p[0], p[1] - 5.4); }
      s.item([cu, cv0, .34, cu + .44, cv1, .56], nk('#7a6a4e', 5, sb) + st.map((d, i) => nk(MAL[i], 3.3, d)).join(''));
      yig(hu + hw * .2, v1 + .12, gb, MAL[1], 3, 2.2, .05); yig(hu + hw * .5, v1 + .12, gb, MAL[0], 3, 2.2, .05); yig(hu + hw * .8, v1 + .12, gb, MAL[2], 3, 2.2, .05); yigBas([hu, v1, gb, hu + hw, v1 + .24, gb + .12]);
      s.barrel(u0 + hw + .78, v1 + .36, 0, { col: M.gAhsap, top: MAL[1], r: .17, h: .36, cast: false }).barrel(u0 + hw + 1.14, v1 + .3, 0, { col: M.gAhsap, top: MAL[0], r: .15, h: .3, cast: false }).pot(u0 + .1, v1 + .5, 0, { s: 1.1, col: '#6a5a4c' });
    } else if (tur === 'kumas') {
      /* önlükte kurumaya asılmış koyu boyalı kumaşlar; tezgâhta toplar; boya fıçısı; kan kırmızısı flama */
      const tl = K.toneOf(R ? [1, 0, 0] : [0, 1, 0]), vv = D - .28; let dd = L3([u0 + .1, vv, 0], [u0 + .1, vv, .96]) + L3([u1 - .2, vv, 0], [u1 - .2, vv, .96]) + L3([u0 + .06, vv, .92], [u1 - .16, vv, .92]), gg = '';
      const n = 3; for (let i = 0; i < n; i++) { const a = u0 + .16 + (u1 - u0 - .42) * i / n, w = (u1 - u0 - .42) / n - .06, l = .38 + rnd() * .2, c = MAL[[2, 3, 1][i]];
        gg += pth(T(c, tl), L3([a, vv, .9], [a + w, vv, .9], [a + w, vv, .9 - l], [a + w * .5, vv, .9 - l * .86], [a, vv, .9 - l * .95]) + 'Z') + pth(T(c, tl - .2), L3([a + w * .62, vv, .9], [a + w, vv, .9], [a + w, vv, .9 - l], [a + w * .62, vv, .9 - l * .9]) + 'Z'); }
      s.item([u0 + .06, vv - .03, 0, u1 - .16, vv + .03, .96], ln(M.gAhsapK, dd, 1.5) + gg);
      let tp = MAL.map(() => ''); for (let i = 0; i < 9; i++) { const j = i % 5, k = i > 4 ? 1 : 0, v = cv0 + (cv1 - cv0) * (j + .5 + k * .5) / 5.4; tp[(i * 2 + 1) % 5] += L3([cu + .08, v, .37 + k * .08], [cu + .36, v, .37 + k * .08]); }
      s.item([cu, cv0, .34, cu + .44, cv1, .56], tp.map((d, i) => d ? ln(T(MAL[i], -.05), d, 4.4) : '').join(''));
      MAL.forEach((c, i) => yig(hu + hw * (i + .5) / 5, v1 + .12, gb, c, 1, 2.8, 0)); yigBas([hu, v1, gb, hu + hw, v1 + .24, gb + .12]);
      s.fx('banner', u1 + .72, cv1 + .1, H - .4, { col: M.gKan, w: .26, h: .7, axis: 'x' });
      s.cyl(u0 + hw + .9, v1 + .4, .18, 0, .3, M.gAhsap, { cast: false, top: MAL[1] });
    } else {
      /* balıkçı: önlükte kurumaya asılmış balıklar, tezgâhta tuzlu balık, fıçı, korkulukta ağ */
      const fish = (n, l) => Array.from({ length: n }, (_, i) => [(i + .5) / n, l * (.8 + rnd() * .4), MAL[i % 3], 2.4]);
      aski(u0 + .1, D - .3, u1 - .2, D - .3, 0, .9, fish(Math.round(ru * 4), .18));
      let fs = '', fp = ''; for (let i = 0; i < 9; i++) { const v = cv0 + .1 + (cv1 - cv0 - .2) * i / 8, d = L3([cu + .08 + (i % 2) * .16, v, .35], [cu + .22 + (i % 2) * .16, v, .35]); if (i % 3 === 1) fp += d; else fs += d; }
      s.item([cu, cv0, .34, cu + .44, cv1, .4], ln(MAL[0], fs, 2.6) + ln(MAL[1], fp, 2.6));
      yig(hu + hw * .3, v1 + .12, gb, MAL[0], 4, 2, .08); yig(hu + hw * .72, v1 + .12, gb, MAL[1], 3, 2, .06); yigBas([hu, v1, gb, hu + hw, v1 + .24, gb + .12]);
      s.barrel(u0 + hw + .78, v1 + .3, 0, { col: M.gAhsap, top: '#3a4048', r: .17, h: .4, cast: false }); s.crate(u0 + hw + 1.14, v1 + .32, 0, .34, { col: M.gAhsap });
      s.critter('kedi', u0 + .3, v1 + .3, 0, { col: '#2a2826' });
      g.O.put(7, 'Ln ' + K.ks(M.gDemir), `M${g.O.P(g.ao(u1 - .26), .72)}L${g.O.P(g.ao(u1 - .26), .14)}M${g.O.P(g.ao(u1 - .42), .28)}Q${g.O.P(g.ao(u1 - .26), .04)} ${g.O.P(g.ao(u1 - .1), .28)}M${g.O.P(g.ao(u1 - .34), .62)}L${g.O.P(g.ao(u1 - .18), .62)}`, 'stroke-width="1.7"');
    }
    // satıcı (fırında fırıncı ocağın önünde)
    if (tur !== 'firin') satici(u1 + .58, v1 + .42);
    // çatıda kuzgun
    if (rnd() < .5) s.critter('guvercin', u0 + ru * .4, v0 + half, H + rise + .02, { col: '#25252b', flip: rnd() < .5 });
    // uçurum kenarı: taş babalar arasında sarkan zincir
    { let zb = '', zc = ''; const nz = Math.round((W - .2) / .8), uz = i => .1 + (W - .2) * i / nz;
      for (let i = 0; i <= nz; i++) { zb += L3([uz(i), D - .05, .02], [uz(i), D - .05, .26]); if (i < nz) zc += `M${s.P(uz(i), D - .05, .22)}Q${s.P(uz(i + .5), D - .05, .05)} ${s.P(uz(i + 1), D - .05, .22)}`; }
      s.item([.1, D - .08, 0, W - .1, D - .02, .3], ln(M.gDemir, zc, 1) + ln(T(M.gTasK, -.2), zb, 3.4)); }
    s.tag(W / 2, D, 0); s.doorAt(W * .4, -.3);
  });
})();
