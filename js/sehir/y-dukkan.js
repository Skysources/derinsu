/* Dükkân — teras kenarında alçak, düz damlı küçük dükkân. Sokak ARKADA (v = 0, görünmez);
   görünen: dam (mal sergisi), uçuruma bakan dış cephedeki satış gözü ve uç cephedeki tenteli yan tezgâh.
   opt: { cephe: 'L' | 'R', seed, tur: 'manav' | 'firin' | 'baharat' | 'kumas' | 'balik' }.
   Tasarım (u, v) ile yazılır: u cephe boyunca, v sokaktan uçuruma; 'R' için x↔y aynalanır. */
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

  CK.def('dukkan', { w: 3.4, d: 3, name: 'Dükkân' }, (b, K, opt = {}) => {
    const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, f1 = K.f1, R = opt.cephe === 'R', s = yan(b, K, R), dn = s.dn, nk = s.nk;
    const W = R ? b.d : b.w, D = R ? b.w : b.d, rnd = K.rng((opt.seed || 7) * 6151 + 11), pick = a => a[Math.floor(rnd() * a.length)];
    const L3 = (...p) => 'M' + p.map(c => s.P(c[0], c[1], c[2])).join(' ');
    const tur = opt.tur || pick(['manav', 'firin', 'baharat', 'kumas', 'balik']);
    // türe göre sıva ve tente renkleri
    const P = { manav: [[M.krem, M.sari], [M.bezY, M.bez]], firin: [[M.asi, M.krem], [M.bezK, M.bez]], baharat: [[M.gul, M.sari], [M.bezS, M.bezK]], kumas: [[M.buz, M.leylak], [M.bezMor, M.bez]], balik: [[M.kirec, M.buz], [M.bezM, M.bez]] }[tur];
    const sv = pick(P[0]), tn = P[1], dam = '#dccaa6', H = 1.08, lit = !R;
    const u0 = .15, u1 = W - 1.02, v0 = .1, v1 = D - .86, ru = u1 - u0, rv = v1 - v0;

    /* --- mal yığınları: renk ve boy başına tek yol (nokta) --- */
    let ny = {};
    const yig = (u, v, z, col, n = 5, r = 2.2, sp = .1) => { const k = col + r, a = ny[k] || (ny[k] = ['', '', col, r]);
      for (let i = 0; i < n; i++) { const p = s.pr(u + (rnd() - .5) * 2 * sp, v + (rnd() - .5) * 2 * sp, z); a[0] += dn(p[0], p[1] - r * .7); if (i % 2 === 0) a[1] += dn(p[0] - r * .3, p[1] - r * 1.1); } };
    const yigBas = (bb, ek = '') => { s.item(bb, ek + Object.values(ny).map(a => nk(T(a[2], -.1), a[3], a[0]) + nk(T(a[2], .36), a[3] * .42, a[1])).join('')); ny = {}; };
    const kasa = (u, v, z, w, d, col, n = 5) => { s.box(u, v, z, u + w, v + d, z + .13, M.ahsapA, { T: T(col, -.24), edge: false, cast: false }); for (let i = 0; i < n; i++) yig(u + w * (.2 + .6 * rnd()), v + d * (.25 + .5 * rnd()), z + .1, col, 1, 2.1, 0); };
    // sırık + ip + asılı şeyler: tek parça. as: [[t (0..1), boy, renk, kalınlık], ...] düşey asılı çizgiler
    const aski = (ua, va, ub, vb, z0, z1, as, ek = '') => { let d = L3([ua, va, z0], [ua, va, z1 + .04]) + L3([ub, vb, z0], [ub, vb, z1 + .04]), g = {};
      for (const [t, l, c, w] of as) { const k = c + '|' + w; g[k] = (g[k] || '') + L3([ua + (ub - ua) * t, va + (vb - va) * t, z1 - .02], [ua + (ub - ua) * t, va + (vb - va) * t, z1 - .02 - l]); }
      s.item([Math.min(ua, ub) - .03, Math.min(va, vb) - .03, z0, Math.max(ua, ub) + .03, Math.max(va, vb) + .03, z1 + .04], ln(M.ahsapK, d, 1.5) + ln('#6a5a4a', L3([ua, va, z1], [ub, vb, z1]), .8) + Object.keys(g).map(k => ln(k.split('|')[0], g[k], +k.split('|')[1])).join('') + ek); };

    /* --- zemin --- */
    s.pave(0, v1, W, D, M.parke); s.spill(u0 + .8, v1 + .5, 1.4); s.spill(u1 + .5, v1 - .3, 1.2);

    /* --- dükkân küpü --- */
    const g = s.box(u0, v0, 0, u1, v1, H, sv);
    g.O.band(0, .14, M.tas, .04); g.E.band(0, .14, M.tas, .04);
    // dış cephe: basık kemerli satış gözü, önünde raf, üstünde çizgili tente; fener
    const hu = u0 + .22, hw = Math.min(1.1, ru * .52), ha = g.ao(hu, hw);
    g.O.band(H - .07, .07, M.tas, .1); g.E.band(H - .07, .07, M.tas, .1);
    g.O.arcade(ha - .08, ha + hw + .08, 1, .54, { b: .28, pier: .08, kind: 'seg', th: .14, glow: true, floor: M.ahsapK });
    g.O.rect(ha - .34, .28, .24, .5, M.ahsap, 4).rect(ha + hw + .1, .28, .24, .5, M.ahsap, 4).rect(ha - .34, .5, .24, .04, M.demir, 4.1).rect(ha + hw + .1, .5, .24, .04, M.demir, 4.1);      // açık kepenk kanatları
    s.slab(hu - .06, v1, hu + hw + .06, v1 + .2, .28, .05, M.ahsap, { cast: false });
    b.awning(g.O, ha - .1, H - .02, hw + .2, { out: .26, drop: .08, cols: tn, val: .08 });
    for (let a = .1; a < ru - .05; a += .3) if (a < ha - .2 || a > ha + hw + .2) g.O.rect(a, H - .2, .07, .07, M.ahsapK, 4);      // hatıl uçları
    g.O.lantern(g.ao(hu + hw + .5), .86);
    if (tur === 'firin') g.E.door(g.ae(v0 + rv * .62, .44), .44, .84, { kind: 'arch', open: true, glow: true, sove: M.tas });
    s.flat(u0, v0, u1, v1, H, sv, { floor: dam });
    const dz = s.yer(0, 0, W, D, H);

    /* --- tabela: dam köşesindeki demir kolda asılı levha --- */
    const tb = { manav: nk('#f0962e', 3, 'M0 9h0') + ln('#4f8f4a', 'M0 6l2.4 -2', 1.6), firin: `<circle cy="9" r="2.6" fill="none" class="${K.ks('#c98a4a')}" stroke-width="2"/>`,
      baharat: nk('#d8402e', 1.7, 'M-2.2 10.4h0') + nk('#f2c84a', 1.7, 'M2.2 10.4h0') + nk('#6aa84f', 1.7, 'M0 7h0'), kumas: pth('#e8c878', 'M0 5l3.4 4l-3.4 4l-3.4 -4z'), balik: pth('#dfe8ee', 'M-4 9q3.4 -3.6 6 0q-2.6 3.6 -6 0zM2 9l2.6 -2v4z') }[tur];
    s.line3([[u1 - .07, v1 - .07, H + .2], [u1 - .07, v1 - .07, H + .56], [u1 - .07, v1 + .44, H + .56]], M.demir, 1.5);
    s.art(u1 - .07, v1 + .24, H + .56, `<g transform="matrix(1 -.5 0 1.2247 0 0)">` + ln(M.demir, 'M-4 0v3M4 0v3', .8) + pth(M.ahsapK, 'M-6.4 3h12.8v12h-12.8z') + pth(T(tn[0], -.3), 'M-5.4 4h10.8v10h-10.8z') + tb + '</g>', { bb: [u1 - .1, v1 + .02, H - .04, u1 - .04, v1 + .44, H + .56] });

    /* --- yan tezgâh (uç cephe): çizgili tente altında; fırında yerine kubbeli ocak --- */
    const cv0 = v0 + .34, cv1 = v1 - .06, cu = u1 + .28;
    if (tur !== 'firin') {
      const c = s.box(cu, cv0, 0, cu + .44, cv1, .34, M.ahsapA, { edge: false, T: tur === 'balik' ? '#dcecf2' : undefined }); c.E.planks({ step: .22 }); c.O.planks({ step: .22 });
      b.awning(g.E, g.ae(cv0 - .12, cv1 - cv0 + .2), H - .03, cv1 - cv0 + .2, { out: .6, drop: .2, cols: tn, val: .1 });
    }
    const tez = i => [cu + .22, cv0 + (cv1 - cv0) * (i + .5) / 5, .34];           // tezgâh üstünde 5 göz

    if (tur === 'manav') {
      /* dam: kasalar, karpuz yığını, kabaklar, şemsiye */
      const cs = ['#f0962e', '#d8402e', '#6aa84f', '#f2d14a', '#6a3f7a'], n = Math.max(3, Math.floor((ru - .3) / .46));
      for (let i = 0; i < n; i++) kasa(u0 + .2 + i * .46, v1 - .5, H, .4, .32, cs[i % 5]);
      kasa(u1 - .6, v1 - .96, H, .4, .34, cs[4]); kasa(u1 - 1.06, v1 - .96, H, .4, .34, '#c2d45a');
      yig(u0 + .55, v1 - 1.05, H, '#3f7a3a', 5, 4.8, .2); yig(u1 - .42, v0 + .5, H, '#e8843a', 3, 3.8, .12);
      { const p = s.pr(u0 + .98, v1 - .98, H); yigBas([u0, v0, H + .13, u1, v1, H + .3], pth('#3f7a3a', `M${f1(p[0] - 5)} ${f1(p[1] - 3)}a5 5 0 0 0 10 0z`) + pth('#e2453a', `M${f1(p[0] - 4)} ${f1(p[1] - 3)}a4 4 0 0 0 8 0z`)); }
      // arka köşede çizgili bez gölgelik: altında yedek kasalar
      const q0 = u0 + .22, q1 = u0 + .22 + Math.min(1.1, ru * .5), w0 = v0 + .2, w1 = v0 + .85, zq = H + .52; let gs = ['', ''];
      s.box(q0 + .1, w0 + .1, H, q1 - .1, w1 - .1, H + .2, M.ahsapA, { edge: false, cast: false }).O.planks({ dir: 'h', step: .1 });
      [[q0, w0], [q1, w0], [q0, w1], [q1, w1]].forEach(c => s.line3([[c[0], c[1], H], [c[0], c[1], zq - (c[1] > w0 ? .1 : 0)]], M.ahsapK, 1.5));
      for (let i = 0; i < 4; i++) gs[i % 2] += L3([q0 - .06 + (q1 - q0 + .12) * i / 4, w0 - .06, zq], [q0 - .06 + (q1 - q0 + .12) * (i + 1) / 4, w0 - .06, zq], [q0 - .06 + (q1 - q0 + .12) * (i + 1) / 4, w1 + .08, zq - .1], [q0 - .06 + (q1 - q0 + .12) * i / 4, w1 + .08, zq - .1]) + 'Z';
      s.item([q0 - .06, w0 - .06, zq - .1, q1 + .06, w1 + .08, zq], pth(T(tn[0], .2), gs[0]) + pth(T(tn[1], .2), gs[1]));
      /* tezgâh: meyve sebze öbekleri; raf */
      cs.forEach((c, i) => yig(...tez(i), c, 6, 2.4, .1)); yigBas([cu, cv0, .34, cu + .44, cv1, .5]);
      yig(hu + hw * .25, v1 + .1, .28, cs[0], 4, 2, .07); yig(hu + hw * .7, v1 + .1, .28, cs[2], 4, 2, .07); yigBas([hu, v1, .28, hu + hw, v1 + .2, .4]);
      /* önlük: çuvallar, elma kasası */
      s.crate(u0 + hw + .8, v1 + .4, 0, .38, { fill: '#c8382a' }).sack(u0 + hw + 1.14, v1 + .32, 0).sack(u0 + .12, v1 + .5, 0, { col: '#c9b07a' });
    } else if (tur === 'firin') {
      /* kubbeli taş ocak: ağzı uçuruma bakar, arkasında baca */
      const o0 = v0 + .3, o1 = v0 + 1.3, ou = W - .12;
      const o = s.box(u1 + .06, o0, 0, ou, o1, .5, M.tas, { edge: false }); o.O.courses({ rh: .17, dens: .7 }); o.E.courses({ rh: .17, dens: .7 });
      o.O.arcade(.18, ou - u1 - .24, 1, .36, { pier: .06, th: .3, glow: true, floor: '#6f665c' });
      o.O.put(5.5, K.kf('#e8622a>#ff8a3a'), o.O.shapeD('round', .3, .02, ou - u1 - .66, .16, -.2));
      s.dome((u1 + .06 + ou) / 2, (o0 + o1) / 2, .4, .5, '#e0c6a0', { hf: .7, alem: false, seams: false });
      const bc = s.box(u1 + .3, v0 + .02, 0, u1 + .62, o0, 1.5, M.tas, { edge: false }); bc.O.courses({ rh: .2, dens: .8 }); bc.E.courses({ rh: .2, dens: .8 });
      s.box(u1 + .25, v0 - .03, 1.5, u1 + .67, o0 + .05, 1.58, M.tasK, { edge: false, cast: false });
      s.fx('smoke', u1 + .46, v0 + .16, 1.62, { s: 1 }); s.fx('fire', (u1 + .06 + ou) / 2, o1 + .02, .08, { s: .5 });
      // fırıncı ve küreği, hamur tahtası
      s.fig(u1 + .62, o1 + .62, 0, { body: M.bez, legs: '#8a7a6a', hat: 'sarik' });
      s.line3([[u1 + .56, o1 + .5, .34], [u1 + .5, o1 + .06, .2]], M.ahsapA, 1.6, { pad: .01 });
      s.box(u1 + .1, v1 - .1, 0, u1 + .44, v1 + .5, .3, M.ahsapA, { edge: false });
      yig(u1 + .27, v1 + .08, .3, '#f1e6cc', 3, 2.6, .1); yig(u1 + .27, v1 + .36, .3, '#d9a05a', 3, 2.4, .08); yigBas([u1 + .1, v1 - .1, .3, u1 + .44, v1 + .5, .4]);
      /* dam: soğumaya dizilmiş ekmek tahtaları, un çuvalları, simit sırığı, odun */
      const nb = Math.max(4, Math.floor((ru - .6) / .26));
      for (let j = 0; j < 3; j++) { dz.rect(u0 + .3, v1 - .42 - j * .34, nb * .26 + .1, .2, M.ahsapA, 3, -.1); for (let i = 0; i < nb; i++) yig(u0 + .48 + i * .26, v1 - .32 - j * .34, H, j === 1 ? '#e8c088' : '#c98a4a', 1, 2.7, 0); }
      yig(u0 + .5, v0 + .5, H, '#efe6d2', 3, 4.6, .14);
      yigBas([u0, v0, H, u1, v1, H + .2]);
      const od = s.box(u1 - .9, v0 + .22, H, u1 - .24, v0 + .52, H + .22, M.ahsap, { edge: false, cast: false }); od.O.planks({ dir: 'h', step: .075 }); od.E.planks({ dir: 'h', step: .075 }).planks({ dir: 'v', step: .075 });
      aski(u0 + .3, v0 + .95, u0 + .95, v0 + .95, H, H + .5, [.2, .4, .6, .8].map(t => [t, .12, '#b8763a', 4]));
      yig(hu + hw * .25, v1 + .1, .28, '#c98a4a', 4, 2.3, .07); yig(hu + hw * .7, v1 + .1, .28, '#e8c088', 4, 2.3, .07); yigBas([hu, v1, .28, hu + hw, v1 + .2, .4]);
      s.sack(u0 + hw + .8, v1 + .32, 0, { col: '#efe6d2' }).sack(u0 + hw + 1.08, v1 + .42, 0, { col: '#e6dcc6' });
    } else if (tur === 'baharat') {
      /* dam: hasır üstünde tepsi tepsi baharat tepeleri; arkada biber ve sarımsak hevenkleri; havan */
      const cs = ['#c8382a', '#e8a22a', '#f2d14a', '#7a9a3a', '#8a4a2a', '#d8602a'], nx = ru > 1.9 ? 3 : 2; let tr = '', a = cs.map(() => ''), sh = '';
      dz.rect(u1 - .3 - nx * .5, v1 - 1.12, nx * .5 + .1, .98, '#d8c08a', 3).rect(u1 - .3 - nx * .5, v1 - 1.12, nx * .5 + .1, .07, M.bezK, 3.1).rect(u1 - .3 - nx * .5, v1 - .21, nx * .5 + .1, .07, M.bezK, 3.1);
      for (let j = 0; j < 2; j++) for (let i = 0; i < nx; i++) { const p = s.pr(u1 - .5 - i * .5, v1 - .4 - j * .46, H), x = p[0], y = p[1];
        tr += `M${f1(x - 4)} ${f1(y)}h8`; a[(i + j * nx) % 6] += `M${f1(x - 5.4)} ${f1(y)}Q${f1(x)} ${f1(y - 13)} ${f1(x + 5.4)} ${f1(y)}Q${f1(x)} ${f1(y + 3)} ${f1(x - 5.4)} ${f1(y)}Z`; sh += `M${f1(x + .6)} ${f1(y - 6.6)}Q${f1(x + 3)} ${f1(y - 4)} ${f1(x + 5.4)} ${f1(y)}Q${f1(x + 2.6)} ${f1(y + 1.6)} ${f1(x + .4)} ${f1(y + 1.5)}Z`; }
      s.item([u0, v0, H, u1, v1, H + .4], ln(M.bronz, tr, 7) + a.map((d, i) => d ? pth(cs[i], d) : '').join('') + pth('#3a2030', sh, 'opacity=".22"'));
      aski(u0 + .3, v0 + .4, u1 - .5, v0 + .4, H, H + .56, [[.1, .3, '#b83026', 2.6], [.22, .24, '#8f1f1c', 2.6], [.34, .32, '#b83026', 2.6], [.5, .2, '#f1ead8', 3], [.62, .26, '#f1ead8', 3], [.76, .3, '#6f8a3a', 3], [.9, .24, '#b83026', 2.6]]);
      s.cyl(u0 + .42, v1 - .46, .12, H, H + .2, M.bronz, { cast: false, top: T(M.bronz, -.3) }); s.line3([[u0 + .42, v1 - .46, H + .16], [u0 + .5, v1 - .52, H + .42]], M.ahsapK, 1.6, { pad: .01 });
      /* tezgâh: ağzı açık çuvallar; raf: kavanozlar */
      let sb = '', st = cs.map(() => ''); for (let i = 0; i < 5; i++) { const p = s.pr(...tez(i)); sb += dn(p[0], p[1] - 3); st[i] += dn(p[0], p[1] - 5.4); }
      s.item([cu, cv0, .34, cu + .44, cv1, .56], nk('#d9c79a', 5, sb) + st.map((d, i) => nk(cs[i], 3.3, d)).join(''));
      yig(hu + hw * .2, v1 + .1, .28, cs[1], 3, 2.2, .05); yig(hu + hw * .5, v1 + .1, .28, cs[0], 3, 2.2, .05); yig(hu + hw * .8, v1 + .1, .28, cs[3], 3, 2.2, .05); yigBas([hu, v1, .28, hu + hw, v1 + .2, .4]);
      s.barrel(u0 + hw + .78, v1 + .36, 0, { top: cs[1], r: .17, h: .36, cast: false }).barrel(u0 + hw + 1.14, v1 + .3, 0, { top: cs[0], r: .15, h: .3, cast: false }).pot(u0 + .1, v1 + .5, 0, { s: 1.1, col: M.kil });
    } else if (tur === 'kumas') {
      /* dam: boyanmış kumaşların kuruduğu sırıklar, boya küpü, yerde boya lekeleri */
      const cs = ['#2c4a8a', '#b8322e', '#e8a82a', '#3f8a6a', '#8a4f9a', '#f1ead8'], tl = K.toneOf(lit ? [0, 1, 0] : [1, 0, 0]);
      const ser = (v, zt, k0, n) => { let d = L3([u0 + .3, v, H], [u0 + .3, v, zt + .04]) + L3([u1 - .3, v, H], [u1 - .3, v, zt + .04]) + L3([u0 + .24, v, zt], [u1 - .24, v, zt]), g = '';
        for (let i = 0; i < n; i++) { const a = u0 + .36 + (ru - .72) * i / n, w = (ru - .72) / n - .06, l = .3 + rnd() * .22, c = cs[(k0 + i) % 6];
          g += pth(T(c, tl), L3([a, v, zt], [a + w, v, zt], [a + w, v, zt - l], [a, v, zt - l * .92]) + 'Z') + pth(T(c, tl - .2), L3([a + w * .62, v, zt], [a + w, v, zt], [a + w, v, zt - l], [a + w * .62, v, zt - l * .97]) + 'Z'); }
        s.item([u0 + .24, v - .03, H, u1 - .24, v + .03, zt + .04], ln(M.ahsapK, d, 1.5) + g); };
      dz.poly([[u1 - .9, v1 - .7], [u1 - .5, v1 - .76], [u1 - .3, v1 - .5], [u1 - .62, v1 - .3], [u1 - .96, v1 - .44]], cs[0], 3, .1).poly([[u0 + .5, v1 - .5], [u0 + .8, v1 - .56], [u0 + .9, v1 - .36], [u0 + .6, v1 - .3]], cs[1], 3, .2);
      ser(v0 + .42, H + .62, 0, 3); ser(v0 + .95, H + .5, 3, 3);
      s.cyl(u1 - .62, v1 - .52, .2, H, H + .28, M.ahsap, { cast: false, top: cs[0] }); s.line3([[u1 - .62, v1 - .52, H + .2], [u1 - .5, v1 - .62, H + .62]], M.ahsapA, 1.6, { pad: .01 });
      s.cyl(u0 + .68, v1 - .42, .16, H, H + .22, M.ahsap, { cast: false, top: cs[1] });
      /* tezgâh: top top kumaş; raf: yumaklar; önlükte sepet */
      let tp = cs.map(() => ''); for (let i = 0; i < 9; i++) { const j = i % 5, k = i > 4 ? 1 : 0, vv = cv0 + (cv1 - cv0) * (j + .5 + k * .5) / 5.4; tp[(i * 2 + 1) % 6] += L3([cu + .08, vv, .37 + k * .08], [cu + .36, vv, .37 + k * .08]); }
      s.item([cu, cv0, .34, cu + .44, cv1, .56], tp.map((d, i) => d ? ln(T(cs[i], -.05), d, 4.4) : '').join(''));
      cs.slice(0, 5).forEach((c, i) => yig(hu + hw * (i + .5) / 5, v1 + .1, .28, c, 1, 2.8, 0)); yigBas([hu, v1, .28, hu + hw, v1 + .2, .4]);
      s.fx('banner', g.R ? 0 : u0 + hw + .62, v1 + .02, H + .16, { col: cs[1], w: .3, h: .8, axis: 'x' });
      s.crate(u0 + hw + 1.0, v1 + .36, 0, .4, { fill: cs[2] }); cs.slice(0, 3).forEach((c, i) => g.O.line([[g.ao(u1 - .34 + i * .1), .02], [g.ao(u1 - .3 + i * .1), .62]], T(c, .1), 4, 7));
    } else {
      /* balıkçı — dam: kurumaya asılmış balıklar, korkulukta ağ, sepet tuzaklar, kürekler, martı ve kedi */
      const fish = (n, l) => Array.from({ length: n }, (_, i) => [(i + .5) / n, l * (.8 + rnd() * .4), i % 4 === 3 ? '#e8a8a0' : '#a8bccb', 2.4]);
      aski(u0 + .3, v0 + .42, u1 - .3, v0 + .42, H, H + .6, fish(Math.round(ru * 4), .16)); aski(u0 + .3, v0 + .95, u1 - .3, v0 + .95, H, H + .46, fish(Math.round(ru * 4), .14));
      const nw = Math.min(1, ru * .45), nu = u1 - .2 - nw; let m = '';
      s.poly3([[nu, v1 - .14, H + .205], [nu + nw, v1 - .14, H + .205], [nu + nw, v1 + .012, H + .205], [nu, v1 + .012, H + .205]], '#3a6a6a', { n: [0, 0, 1], bb: [nu, v1 - .14, H + .2, nu + nw, v1, H + .21] });
      const nt = s.duvar('O', v1 + .012, nu, H - .22, nw, .425); nt.poly([[0, .425], [nw, .425], [nw, .12], [nw * .7, 0], [nw * .35, .1], [0, .04]], '#3a6a6a', 3);
      for (let i = 1; i < 7; i++) m += nt.seg(nw * i / 7 - .2, .425, nw * i / 7 + .1, 0) + nt.seg(nw * i / 7 + .2, .425, nw * i / 7 - .1, 0);
      nt.put(4, 'Ln ' + K.ks(nt.c('#7fb0a8')), m, 'stroke-width=".6"'); for (let i = 0; i < 5; i++) nt.dot(nw * (i + .5) / 5, .425, 1.5, '#c98a4a', 5);
      s.cyl(u0 + .5, v1 - .48, .17, H, H + .22, '#b58a3c', { cast: false, top: '#6a5230' }); s.cyl(u0 + .9, v1 - .4, .15, H, H + .2, '#c9a04e', { cast: false, top: '#6a5230' });
      s.item([u1 - .3, v1 - .9, H, u1 - .14, v1 - .5, H + .7], ln(M.ahsapA, L3([u1 - .3, v1 - .6, H], [u1 - .15, v1 - .62, H + .7]) + L3([u1 - .34, v1 - .8, H], [u1 - .15, v1 - .84, H + .66]), 1.5) + ln(M.ahsap, L3([u1 - .15, v1 - .62, H + .5], [u1 - .15, v1 - .62, H + .72]) + L3([u1 - .15, v1 - .84, H + .46], [u1 - .15, v1 - .84, H + .68]), 3.4));
      s.critter('marti', u0 + .3, v0 + .07, H + .2).critter('kedi', u0 + ru * .55, v1 - .62, H, { col: '#5a5450' });
      /* tezgâh: buz üstünde balıklar; raf; önlük: balık kasası, su fıçısı, çapa */
      let fs = '', fp = ''; for (let i = 0; i < 9; i++) { const vv = cv0 + .1 + (cv1 - cv0 - .2) * i / 8, d = L3([cu + .08 + (i % 2) * .16, vv, .35], [cu + .22 + (i % 2) * .16, vv, .35]); if (i % 3 === 1) fp += d; else fs += d; }
      s.item([cu, cv0, .34, cu + .44, cv1, .4], ln('#8fa6b8', fs, 2.6) + ln('#e89a8a', fp, 2.6));
      yig(hu + hw * .3, v1 + .1, .28, '#a8bccb', 4, 2, .08); yig(hu + hw * .72, v1 + .1, .28, '#e89a8a', 3, 2, .06); yigBas([hu, v1, .28, hu + hw, v1 + .2, .4]);
      s.crate(u0 + hw + .78, v1 + .36, 0, .4, { fill: '#a8bccb' }).barrel(u0 + hw + 1.2, v1 + .3, 0, { top: '#3f8fa8', r: .17, h: .34, cast: false });
      g.O.put(7, 'Ln ' + K.ks(M.demir), `M${g.O.P(g.ao(u1 - .26), .62)}L${g.O.P(g.ao(u1 - .26), .12)}M${g.O.P(g.ao(u1 - .42), .26)}Q${g.O.P(g.ao(u1 - .26), .02)} ${g.O.P(g.ao(u1 - .1), .26)}M${g.O.P(g.ao(u1 - .34), .54)}L${g.O.P(g.ao(u1 - .18), .54)}`, 'stroke-width="1.7"');
    }
    // satıcı (fırında fırıncı ocağın önünde)
    if (tur !== 'firin') s.fig(u1 + .56, v1 + .42, 0, { body: { manav: M.bezY, baharat: '#b0562e', kumas: M.bezMor, balik: M.lacivert }[tur], legs: '#4a3a34', hat: pick(['fes', 'sarik', 'hasir']), hatCol: M.kirmizi });
    // uçurum kenarı: taş babalar arasında sarkan zincir
    { let zb = '', zc = ''; const nz = Math.round((W - .2) / .56), uz = i => .1 + (W - .2) * i / nz;
      for (let i = 0; i <= nz; i++) { zb += L3([uz(i), D - .05, .02], [uz(i), D - .05, .24]); if (i < nz) zc += `M${s.P(uz(i), D - .05, .2)}Q${s.P(uz(i + .5), D - .05, .04)} ${s.P(uz(i + 1), D - .05, .2)}`; }
      s.item([.1, D - .08, 0, W - .1, D - .02, .3], ln(M.demir, zc, 1) + ln(T(M.tas, -.06), zb, 4)); }
    s.tag(W / 2, D, 0); s.doorAt(W * .4, -.3);
  });
})();
