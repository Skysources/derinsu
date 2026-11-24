/* Damlı ev — teras kenarında alçak, kara taştan mazgallı düz damlı ev; asıl sahne mazgallı damıdır.
   Sokak ARKADA kalır (v = 0, görünmez); görünen: dam, uçuruma bakan dış cephe ve uç cephe.
   opt: { cephe: 'L' | 'R', seed }. Tasarım (u, v) ile yazılır: u cephe boyunca, v sokaktan uçuruma; 'R' için x↔y aynalanır.
   Parçalar: ana küp (mazgallı korkuluk) + geri çekik alçak kiler, kilerin önünde taş merdiven, dama el merdiveni,
   damda kurumuş çardak ya da yırtık bez gölgelik, yağmur fıçısı, kuzgun; tohuma göre külahlı merdiven kulesi / yüksek baca / ahşap çatı odası, balkon.
   IŞIK: ev gibi — çoğu karanlık; tohuma bağlı ~%35'inde tek bir mumlu pencere yanar. Fener, ışık havuzu yok. */
(function () {
  // (u, v) → (x, y) aynası. Yüzler: O = dış cephe (v = v1), E = uç cephe (u = u1); ao/ae: cephe üstünde a konumu
  const yan = (b, K, R) => {
    const q = p => R ? [p[1], p[0], p[2] || 0] : p, bq = c => R ? [c[1], c[0], c[2], c[4], c[3], c[5]] : c;
    const sw = (a, i) => { if (R) { const t = a[i]; a[i] = a[i + 1]; a[i + 1] = t; } return a; };
    const s = { R, P: (u, v, z) => R ? K.P(v, u, z) : K.P(u, v, z), pr: (u, v, z) => R ? K.pr(v, u, z) : K.pr(u, v, z) };
    'crate barrel sack pot table fig cyl cone chimney spill tag doorAt bench'.split(' ').forEach(k => s[k] = (...a) => b[k](...sw(a, 0)));
    'tree critter'.split(' ').forEach(k => s[k] = (...a) => b[k](...sw(a, 1)));
    'slab flat pave clothes merlons'.split(' ').forEach(k => s[k] = (...a) => b[k](...sw(sw(a, 0), 2)));
    s.fx = (t, u, v, z, o) => b.fx(t, R ? v : u, R ? u : v, z, R && o && o.axis ? Object.assign({}, o, { axis: o.axis === 'x' ? 'y' : 'x' }) : o);
    s.box = (u0, v0, z0, u1, v1, z1, c, o = {}) => {
      const x = R ? b.box(v0, u0, z0, v1, u1, z1, c, Object.assign({}, o, { L: o.E, R: o.O })) : b.box(u0, v0, z0, u1, v1, z1, c, Object.assign({}, o, { L: o.O, R: o.E }));
      return { O: R ? x.R : x.L, E: R ? x.L : x.R, T: x.T, ao: (u, w = 0) => R ? u1 - u - w : u - u0, ae: (v, w = 0) => R ? v - v0 : v1 - v - w };
    };
    // sundurma: d 'u' → alçak kenar u1'de, 'v' → alçak kenar v1'de
    s.shed = (u0, v0, u1, v1, zl, zh, d, c, o) => R ? b.shed(v0, u0, v1, u1, zl, zh, d === 'u' ? '+y' : '+x', c, o) : b.shed(u0, v0, u1, v1, zl, zh, d === 'u' ? '+x' : '+y', c, o);
    s.stairs = (u0, v0, u1, v1, zt, zb, c, o) => R ? b.stairs(v0, u0, v1, u1, zt, zb, 'y', c, o) : b.stairs(u0, v0, u1, v1, zt, zb, 'x', c, o);   // +u yönüne iner
    s.line3 = (pts, c, w, o) => b.line3(pts.map(q), c, w, o);
    s.poly3 = (pts, c, o = {}) => b.poly3(pts.map(q), c, Object.assign({}, o, o.n ? { n: q(o.n) } : null, o.bb ? { bb: bq(o.bb) } : null));
    s.gpoly = (pts, c, o) => b.gpoly(pts.map(q), c, o);
    s.item = (bb, d, o) => b.item(bq(bb), d, o || { cast: false });
    s.art = (u, v, z, svg, o = {}) => b.art(R ? v : u, R ? u : v, z, R ? `<g transform="scale(-1 1)">${svg}</g>` : svg, o.bb ? Object.assign({}, o, { bb: bq(o.bb) }) : o);
    // yatay yüz (döşeme üstü): (a, b) = (u - u0, v - v0)
    s.yer = (u0, v0, u1, v1, z) => { const f = new K.Face(R ? [v0, u0, z] : [u0, v0, z], R ? [0, 1, 0] : [1, 0, 0], R ? [1, 0, 0] : [0, 1, 0], u1 - u0, v1 - v0, [0, 0, 1]); b.item(bq([u0, v0, z, u1, v1, z]), () => f.svg(), { cast: false }); return f; };
    // nokta: sıfır boylu yuvarlak uçlu çizgi; dn(x, y) birikir, nk(renk, yarıçap, d) basar
    s.dn = (x, y) => `M${K.f1(x)} ${K.f1(y)}h0`; s.nk = (c, r, d) => d ? K.ln(c, d, K.f1(2 * r)) : '';
    return s;
  };

  CK.def('dam', { w: 3.6, d: 3.4, name: 'Damlı Ev' }, (b, K, opt = {}) => {
    const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, R = opt.cephe === 'R', s = yan(b, K, R), dn = s.dn, nk = s.nk;
    const W = R ? b.d : b.w, D = R ? b.w : b.d, rnd = K.rng((opt.seed || 7) * 7919 + 3), pick = a => a[Math.floor(rnd() * a.length)];
    const L3 = (...p) => 'M' + p.map(c => s.P(c[0], c[1], c[2])).join(' '), sec = (k, v) => opt[k] === undefined ? v : opt[k];

    /* --- tohumdan gelen seçenekler (opt ile de verilebilir) --- */
    const balkon = sec('balkon', rnd() < .4), ust = sec('ust', pick(['kule', 'baca', 'oda'])), cardak = sec('asma', rnd() < .55);
    const TAS = pick([M.gTasK, M.gTas, '#6a655e', M.gTasK]), TA = M.gTasA, dam = pick(['#5e5a52', '#625c52', '#58564e']), CATI = pick([M.gCatiK, '#4c5058', M.gCati]);
    const ri = K.rng(((opt.seed || 7) * 104729 + 20) | 0), yanan = ri() < .35 ? Math.floor(ri() * 3) : -1; let aday = 0; const lit = () => aday++ === yanan;      // ışık: biçimden bağımsız tohum
    const H = 1.04, Ha = .6, zp = H + .62, gl = R ? [-.65, .375] : [.375, -.65];       // gl: birim yükseklik başına gölge kayması (u, v)
    const u0 = .15, u1 = W - 1.28, v0 = .1, v1 = D - (balkon ? .4 : 1), ua = W - .12, va0 = v0 + .3, va = v1 - (balkon ? 1 : .55);
    // sarmaşık (yosun yeşili) ya da kurumuş dal: cephe üstünde
    const sarmasik = (f, a0, a1, top, dr) => { const A = ['', '', ''];
      for (let a = a0; a <= a1 + .01; a += .13) { const len = dr[0] + rnd() * (dr[1] - dr[0]); for (let h = top + .04; h > top - len; h -= .11) { const p = f.q(a + (rnd() - .5) * .1, h, .05); A[0] += dn(p[0], p[1]); if (rnd() < .55) A[1] += dn(p[0] - 1, p[1] - 1.3); if (rnd() < .15) A[2] += dn(p[0] - 1.6, p[1] - 1.8); } }
      [[T(M.gYosun, -.3), 5.6], [M.gYosun, 3.4], [T(M.gYosun, .25), 1.4]].forEach((c, i) => f.put(8 + i * .1, 'Ln ' + K.ks(c[0]), A[i], `stroke-width="${c[1]}"`)); };

    /* --- zemin: kenar avlusu --- */
    s.pave(0, va, W, D, '#57534c');

    /* --- ana küp: kara kesme taş --- */
    const g = s.box(u0, v0, 0, u1, v1, H, TAS);
    for (const f of [g.O, g.E]) f.courses({ rh: .24, bw: .6, dens: .5 }).stones(3, { rh: .24 }).band(0, .16, M.gKara, .02).band(H - .08, .08, TA, .04);
    const kapi = (f, a, w, h, o = {}) => f.door(a, w, h, Object.assign({ kind: 'point', col: M.gAhsapK, sove: TA }, o));
    const pen = (f, a, b0, w, h, o = {}) => f.win(a, b0, w, h, Object.assign({ kind: 'point', frame: M.gAhsapK, sove: TA, sill: false, bars: [2, 2], lit: lit() }, o));
    if (!balkon) {
      // dış cephe: sivri kemerli kara kapı, dar pencere, yosunlu sarmaşık, eşik taşı
      kapi(g.O, g.ao(.34, .46), .46, .82);
      pen(g.O, g.ao(1.5, .3), .34, .3, .52);
      if (rnd() < .6) sarmasik(g.O, g.ao(u0 + .04, .8), g.ao(u0 + .04, .8) + .8, H - .06, [.1, .45]);
      s.slab(.3, v1, .84, v1 + .2, .06, .06, M.gTasK, { cast: false });
    } else {
      // balkonlu: uçurumun üstüne taşan demir korkuluklu çıkma, kapısı balkona açılır
      kapi(g.O, g.ao(1.2, .46), .46, .84, { b: .08 });
      pen(g.O, g.ao(.42, .3), .34, .3, .5);
      sarmasik(g.O, g.ao(1.84, .32), g.ao(1.84, .32) + .32, H - .06, [.2, .6]);
      b.balcony(g.O, g.ao(.95, 1.02), .08, 1.02, { out: .4, col: M.gDemir, rh: .32, slab: M.gTasK });
    }
    // uç cephe: kilerin üstünde kalan şeritte küçük yüksek pencere
    pen(g.E, g.ae(va0 + .1, .22) - .3, .68, .22, .3, { bars: [2, 1] });

    /* --- kiler: geri çekik alçak ek, kara ahşap kapı --- */
    const k = s.box(u1, va0, 0, ua, va, Ha, TAS, { T: T(dam, -.04) });
    for (const f of [k.O, k.E]) f.courses({ rh: .2, bw: .5, dens: .5 }).band(0, .12, M.gKara, .02);
    k.E.door(k.ae(va0 + .5, .4), .4, .5, { kind: 'seg', col: M.gAhsap, sove: TA });
    k.O.win(k.ao(ua - .36, .2), .26, .2, .2, { frame: M.gAhsapK, lit: false, bars: [2, 1], sill: false });
    s.box(u1, va - .09, Ha, ua, va, Ha + .12, TAS, { edge: false, cast: false }); s.box(ua - .09, va0, Ha, ua, va - .09, Ha + .12, TAS, { edge: false, cast: false });
    // kilerin önünde avludan kiler damına çıkan taş merdiven; damdan dama el merdiveni
    s.stairs(u1 + .02, va, ua - .08, va + .36, Ha, 0, M.gTasK, { rise: .15 });
    const vl = va - .5;
    s.item([u1 + .02, vl, Ha, u1 + .3, vl + .22, H + .36], ln(M.gAhsapK, L3([u1 + .3, vl, Ha], [u1 + .03, vl, H + .36]) + L3([u1 + .3, vl + .22, Ha], [u1 + .03, vl + .22, H + .36]), 1.4)
      + ln(M.gAhsap, [.2, .4, .6, .8].map(t => L3([u1 + .3 - .27 * t, vl, Ha + (H + .36 - Ha) * t], [u1 + .3 - .27 * t, vl + .22, Ha + (H + .36 - Ha) * t])).join(''), 1.1));
    // ip: ana damın mazgalından kiler köşesindeki sırığa; soluk paçavralar
    const vc = va0 + .16;
    s.line3([[ua - .1, vc, Ha], [ua - .1, vc, 1.56]], M.gAhsapK, 1.5).line3([[u1 - .07, vc, H + .26], [u1 - .07, vc, 1.6]], M.gAhsapK, 1.5);
    s.clothes(u1 - .07, vc, ua - .1, vc, 1.54, { n: 3, cols: [M.gKul, '#5a5650', M.gKemik] });

    /* --- ana dam: mazgallı korkuluk --- */
    s.flat(u0, v0, u1, v1, H, TAS, { floor: dam, ph: .12 });
    s.merlons(u0, v1 - .13, u1, v1, H + .12, TAS, { h: .24, w: .3, gap: .26 }); s.merlons(u1 - .13, v0 + .1, u1, v1 - .14, H + .12, TAS, { h: .24, w: .3, gap: .26 });
    const dz = s.yer(0, 0, W, D, H), pu0 = u0 + .25, pu1 = u0 + 1.3, pv0 = v0 + .24, pv1 = v1 - .86;
    // derzli döşeme
    { let d = ''; for (let a = u0 + .4; a < u1 - .15; a += .4) d += dz.seg(a, v0 + .13, a, v1 - .13); for (let c = v0 + .4; c < v1 - .15; c += .4) d += dz.seg(u0 + .13, c, u1 - .13, c); dz.put(2.5, 'Ln ' + K.ks(T(dam, -.2)), d, 'stroke-width=".7"'); }
    // çardağın dama düşen gölgesi
    { const a0 = Math.max(u0 + .13, pu0 - .1 + gl[0] * .65), a1 = Math.min(u1 - .13, pu1 + .1 + gl[0] * .65), b0 = Math.max(v0 + .13, pv0 - .12 + gl[1] * .65), b1 = Math.min(v1 - .13, pv1 + .16 + gl[1] * .65);
      dz.rect(a0, b0, a1 - a0, b1 - b0, dam, 2.6, cardak ? -.08 : -.16); }
    // damda: alçak sandık, yağmur fıçısı, dökülmüş yosun
    s.box(pu0 + .1, pv1 - .2, H, pu0 + .66, pv1 + .06, H + .22, M.gAhsap, { edge: false, cast: false }).O.planks({ dir: 'h', step: .08, dt: -.2 });
    s.barrel(u1 - .34, v1 - .4, H, { col: M.gAhsap, top: '#2e3238', r: .17, h: .4, cast: false });
    { let y = ''; for (let i = 0; i < 9; i++) { const p = dz.q(u0 + .2 + rnd() * .5, v1 - .2 - rnd() * .5); y += dn(p[0], p[1]); } dz.put(3, 'Ln ' + K.ks(T(M.gYosun, -.2)), y, 'stroke-width="3.6"'); }
    // tepe yapısı: külahlı merdiven kulesi / yüksek taş baca / ahşap çatı odası (arka sağ köşe)
    const cu = u1 - .5, cv = v0 + .52;
    if (ust === 'kule') {
      const t = s.cyl(cu, cv, .34, H, H + .66, TAS, { top: null }); t.courses(.22); t.band(H + .62, .06, TA, .03);
      const f = t.face(R ? .4 : -.4, H + .18, .16, .3); f.win(0, 0, .16, .3, { kind: 'point', frame: M.gAhsapK, lit: lit(), sill: false, bars: [1, 2] });
      s.cone(cu, cv, .4, H + .68, .62, CATI);
      s.line3([[cu, cv, H + 1.28], [cu, cv, H + 1.6]], M.gDemir, 1.3);
    } else if (ust === 'baca') {
      const c = s.box(cu - .06, cv - .24, H, cu + .3, cv + .12, H + .96, TAS, { edge: false }); c.O.courses({ rh: .2, bw: .3, dens: .5 }); c.E.courses({ rh: .2, bw: .3, dens: .5 });
      s.box(cu - .11, cv - .29, H + .96, cu + .35, cv + .17, H + 1.04, M.gKara, { edge: false, cast: false }); s.fx('smoke', cu + .12, cv - .06, H + 1.08, { s: .7 });
    } else {
      const c = s.box(cu - .26, cv - .3, H, cu + .3, cv + .2, H + .56, M.gAhsap, { edge: false }); c.O.planks({ step: .12, dt: -.2 }); c.E.planks({ step: .12, dt: -.2 });
      c.E.door(c.ae(cv - .14, .26), .26, .44, { col: M.gAhsapK, sove: null });
      s.shed(cu - .32, cv - .36, cu + .36, cv + .28, H + .56, H + .82, 'v', CATI, { tex: 'rows' });
    }
    // çardak: dört dikme, kirişler, mertekler
    [[pu0, pv0], [pu1, pv0], [pu0, pv1], [pu1, pv1]].forEach(p => s.line3([[p[0], p[1], H], [p[0], p[1], zp]], M.gAhsapK, 1.9));
    let d = L3([pu0 - .1, pv0, zp], [pu1 + .1, pv0, zp]) + L3([pu0 - .1, pv1, zp], [pu1 + .1, pv1, zp]);
    for (let i = 0; i < 5; i++) { if (i === 3) continue; const u = pu0 + (pu1 - pu0) * i / 4; d += L3([u, pv0 - .12, zp + .03], [u, pv1 + .14, zp + .03]); }      // biri kırık
    s.item([pu0 - .1, pv0 - .12, zp - .02, pu1 + .1, pv1 + .14, zp + .04], ln(M.gAhsap, d, 1.7));
    if (cardak) {
      // kurumuş asma: merteklere dolanmış kuru dallar, dikmeye sarılı gövde
      const A = ['', ''];
      for (let i = 0; i < 9; i++) { const p = s.pr(pu0 + (pu1 - pu0) * rnd(), pv0 + (pv1 - pv0 + .1) * rnd(), zp + .05); let x = p[0], y = p[1];
        for (let j = 0; j < 3; j++) { const a = rnd() * 6.28, l = 3 + rnd() * 5, x2 = x + Math.cos(a) * l, y2 = y + Math.sin(a) * l * .6 + 1.4; A[j ? 1 : 0] += `M${K.f1(x)} ${K.f1(y)}L${K.f1(x2)} ${K.f1(y2)}`; x = x2; y = y2; } }
      s.item([pu0 - .12, pv0 - .14, zp + .04, pu1 + .12, pv1 + .16, zp + .14], ln(M.gAhsapK, A[0], 1.2) + ln(T(M.gAhsapK, .1), A[1], .7));
      s.item([pu0 - .06, pv1, H, pu0 + .02, pv1 + .08, zp], ln(M.gAhsapK, `M${s.P(pu0 - .05, pv1 + .05, H)}Q${s.P(pu0 + .08, pv1 + .04, H + .3)} ${s.P(pu0 - .02, pv1 + .02, zp)}`, 1.5));
    } else {
      // yırtık bez gölgelik: soluk keten, sarkan uçlar
      const h = s.yer(pu0 - .1, pv0 - .12, pu1 + .1, pv1 - .2, zp + .05); h.fill(M.gKul); h.planks({ dir: 'v', step: .16, dt: -.14 });
      h.poly([[0, h.h], [h.w, h.h], [h.w, h.h + .2], [h.w * .7, h.h + .1], [h.w * .45, h.h + .26], [h.w * .2, h.h + .12], [0, h.h + .18]], M.gKul, 3, -.06);
    }
    // mazgalda kuzgun
    if (rnd() < .65) s.critter('guvercin', u0 + .3 + rnd() * (u1 - u0 - .8), v1 - .07, H + .36, { col: '#25252b', flip: rnd() < .5 });

    /* --- avlu: uçurum kenarında alçak taş duvar, kuru ağaç, küpler --- */
    const w0 = balkon ? u1 + .12 : .08;
    s.box(w0, D - .12, 0, W - .06, D, .26, TAS, { edge: false }).O.courses({ rh: .13, bw: .4, dens: .5 }).band(.21, .05, TA, .06);
    s.tree('olu', ua - .5, D - .55, { s: .62 });
    s.pot(w0 + .3, D - .3, 0, { s: 1.05, col: '#5e564e' }); if (!balkon) s.pot(1.25, D - .32, 0, { s: .9, col: '#5e564e' });
    s.tag(W / 2, D, 0); s.doorAt(W * .4, -.3);
  });
})();
