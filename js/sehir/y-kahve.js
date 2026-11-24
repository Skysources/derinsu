/* Kahvehane — gotik bir meyhane olarak yorumlandı. Teras kenarında; sokak ARKADA (v = 0, görünmez), uçurum önde.
   Solda kara taştan meyhane salonu: dik arduvaz çatı, alınlığı uçuruma bakar (kara çatkı), yüksek ocak bacası;
   uç cephedeki sivri kemerli kapı ardına kadar açık, içinden sıcak ışık avluya taşar. Önünde taş tezgâh: fıçılar, kazan, kupalar.
   Sağda kurumuş asmalı kara ahşap çardak; altında ve önünde masalar, kupa kaldıran müşteriler, tepsili garson; uçurum boyunca demir korkuluk.
   IŞIK: kapı ağzından taşan ışık (güçlü) + çardaktan sarkan tek fener (zayıf); kazanın altındaki kor hâlesiz.
   opt: { cephe: 'L' | 'R', seed }. Tasarım (u, v) ile yazılır: u cephe boyunca, v sokaktan uçuruma; 'R' için x↔y aynalanır. */
(function () {
  // (u, v) → (x, y) aynası. Yüzler: O = dış cephe (v = v1), E = uç cephe (u = u1); ao/ae: cephe üstünde a konumu
  const yan = (b, K, R) => {
    const q = p => R ? [p[1], p[0], p[2] || 0] : p, bq = c => R ? [c[1], c[0], c[2], c[4], c[3], c[5]] : c;
    const sw = a => { if (R) { const t = a[0]; a[0] = a[1]; a[1] = t; } return a; };
    const s = { R, P: (u, v, z) => R ? K.P(v, u, z) : K.P(u, v, z), pr: (u, v, z) => R ? K.pr(v, u, z) : K.pr(u, v, z) };
    'sack pot barrel spill tag doorAt chimney'.split(' ').forEach(k => s[k] = (...a) => b[k](...sw(a)));
    s.critter = (k, ...a) => b.critter(k, ...sw(a));
    s.fx = (t, u, v, z, o) => b.fx(t, R ? v : u, R ? u : v, z, R && o && o.axis ? Object.assign({}, o, { axis: o.axis === 'x' ? 'y' : 'x' }) : o);
    s.box = (u0, v0, z0, u1, v1, z1, c, o = {}) => {
      const x = R ? b.box(v0, u0, z0, v1, u1, z1, c, o) : b.box(u0, v0, z0, u1, v1, z1, c, o);
      return { O: R ? x.R : x.L, E: R ? x.L : x.R, ao: (u, w = 0) => R ? u1 - u - w : u - u0, ae: (v, w = 0) => R ? v - v0 : v1 - v - w };
    };
    // beşik çatı: mahya v boyunca, alınlık G dış cephede (v1)
    s.gable = (u0, v0, u1, v1, z, rise, c, o = {}) => R ? b.gable(v0, u0, v1, u1, z, rise, c, Object.assign({}, o, { axis: 'x' })) : b.gable(u0, v0, u1, v1, z, rise, c, Object.assign({}, o, { axis: 'y' }));
    s.line3 = (pts, c, w, o) => b.line3(pts.map(q), c, w, o);
    s.poly3 = (pts, c, o) => b.poly3(pts.map(q), c, { n: q(o.n), bb: bq(o.bb) });
    s.gpoly = (pts, c, o) => b.gpoly(pts.map(q), c, o);
    s.item = (bb, d) => b.item(bq(bb), d, { cast: false });
    s.art = (u, v, z, svg, o = {}) => b.art(R ? v : u, R ? u : v, z, R ? `<g transform="scale(-1 1)">${svg}</g>` : svg, o.bb ? { bb: bq(o.bb) } : o);
    // nokta: sıfır boylu yuvarlak uçlu çizgi; dn(x, y) birikir, nk(renk, yarıçap, d) basar
    s.dn = (x, y) => `M${K.f1(x)} ${K.f1(y)}h0`; s.nk = (c, r, d) => d ? K.ln(c, d, K.f1(2 * r)) : '';
    return s;
  };

  CK.def('kahve', { w: 5, d: 3.6, name: 'Kahvehane' }, (b, K, opt = {}) => {
    const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, f1 = K.f1, E = K.ell, R = opt.cephe === 'R', s = yan(b, K, R), dn = s.dn, nk = s.nk;
    const W = R ? b.d : b.w, D = R ? b.w : b.d, rnd = K.rng((opt.seed || 7) * 4513 + 5), pick = a => a[Math.floor(rnd() * a.length)];
    const L3 = (...p) => 'M' + p.map(c => s.P(c[0], c[1], c[2])).join(' '), glow = (y, r) => `<circle class="Nl" cy="${y}" r="${r}" fill="url(#${K.glowId()})"/>`;

    /* --- tohumdan gelen seçenekler --- */
    const TAS = pick([M.gTasK, M.gTas, '#6a655e']), CATI = pick([M.gCatiK, '#4c5058', M.gCati]), SIVA = pick(['#a39784', '#ab9f8a', '#a8987c']), koyu = '#2e2a28';
    const gy = () => pick([M.gAhsapK, '#3e4048', M.gMor, '#4a4238', '#5a4a3a', '#3a4038', M.gKul]), hat = () => pick(['kuk', 'sac', 'ak', 'kuk', 'sac']), P2 = () => [gy(), hat()];
    const H = 1.08, zp = 1.42, gl = R ? [-.65, .375] : [.375, -.65];
    const ku0 = .15, ku1 = 2.1, kv0 = .1, kv1 = 1.55, pu0 = ku1 + .42, pu1 = W - .36, pv0 = .32, pv1 = Math.min(2.15, D - 1.4), pm = (pu0 + pu1) / 2;

    /* --- insanlar (ekran pikseli). Bacak, baş ve başlıklar grupça tek yolda toplanır --- */
    let G, golge = '';
    const yeni = () => G = { b: '', h: '', t: {} };
    const bas = (h, x, y) => { const c = { kuk: '#34343a|2.6', ak: '#a8a49a|2.4', sac: '#2a2420|2.4' }[h];
      G.h += dn(x, y); G.t[c] = (G.t[c] || '') + (h === 'kuk' ? `M${f1(x - 3)} ${f1(y + 1.2)}q3 -7.6 6 0` : `M${f1(x - 1.5)} ${f1(y - 2.1)}h3`); };
    const cik = (orta, r = 2.9) => { const o = pth(koyu, G.b) + orta + nk('#b89a80', r, G.h) + Object.keys(G.t).map(k => ln(k.split('|')[0], G.t[k], +k.split('|')[1])).join(''); yeni(); return o; };
    // oturan: f = +1 sağa, -1 sola bakar (kolu masaya uzanır)
    const otr = (x, y, f, c, h) => { const m = (dx, dy) => `M${f1(x + f * dx)} ${f1(y + dy)}`, F = v => f1(f * v);
      G.b += m(-2, -7.8) + `h${F(6.8)}v7.2h${F(-2.2)}v-4.6h${F(-4.6)}z`; bas(h, x + f * .3, y - 18.2);
      return pth(c, m(-3.2, -6.4) + `v-6.6q0 -2.4 ${F(2.4)} -2.4h${F(1.6)}q${F(2.4)} 0 ${F(2.4)} 2.4v1.2l${F(2.6)} 2l${F(-.9)} 1.3l${F(-1.7)} -1.3v3.4z`); };
    // kupa kaldıran oturan: kolu yukarıda, elinde kupa
    const kaldir = (x, y, f, c, h) => otr(x, y, f, c, h) + ln(c, `M${f1(x + f * 2.4)} ${f1(y - 14.6)}l${f1(f * 2.4)} -5`, 1.9) + pth(M.gBronz, `M${f1(x + f * 4.2)} ${f1(y - 22.4)}h${f1(f * 2.4)}v3h${f1(-f * 2.4)}z`);
    // ayakta duran (ek: önlük, kollar, tepsi…)
    const ayk = (u, v, c, h, ek) => { const p = s.pr(u, v, 0); golge += `M${f1(p[0] - 2)} ${f1(p[1])}h6`; G.b += 'M-2.6 -7h2.2v7h-2.2zM.4 -7h2.2v7h-2.2z'; bas(h, 0, -18.9);
      s.art(u, v, 0, cik(pth(c, 'M-3.7 -6.2v-7.3q0 -2.5 2.5 -2.5h2.4q2.5 0 2.5 2.5v7.3z') + ek, 3.1), { r: .14, h: .9 }); };
    const kupa = d => nk(T(M.gBronz, .1), 1.3, d), masa = pth(M.gAhsap, E(0, -7.9, 5.8, 2.9)) + pth(T(M.gAhsap, -.3), 'M-5.8 -7.9a5.8 2.9 0 0 0 11.6 0v.8a5.8 2.9 0 0 1 -11.6 0z');
    const tabure = (x, y) => { G.b += `M${x - 2.4} ${y - 4.6}h4.8l-.6 4.6h-3.6z`; return pth(M.gAhsapA, E(x, y - 5, 3, 1.5)); };
    // masa takımı: ax 1 → u boyunca, 0 → v boyunca oturulur; A arkadaki, B öndeki kişi ([giysi, başlık] ya da null = boş tabure)
    const takim = (u, v, ax, A, B, ek = '', kal = false) => { const dx = ax ? 8.6 : -8.6, f = ax ? 1 : -1, p = s.pr(u, v, 0); golge += `M${f1(p[0] - 9)} ${f1(p[1] + 1)}h18`; G.b += 'M-.9 -7h1.8v7h-1.8z';
      s.art(u, v, 0, cik((A ? otr(-dx, -4.3, f, A[0], A[1]) : tabure(-dx, -4.3)) + masa + ek + (B ? (kal ? kaldir : otr)(dx, 4.3, -f, B[0], B[1]) : tabure(dx, 4.3))), { bb: [u - .5, v - .5, 0, u + .5, v + .5, .7] }); };
    yeni();
    // kurumuş dal öbeği (çardakta, ekran uzayında)
    const dal = (x, y, a, L, k, D) => { const x2 = x + Math.cos(a) * L, y2 = y + Math.sin(a) * L * .6; D[k] += `M${f1(x)} ${f1(y)}L${f1(x2)} ${f1(y2)}`; if (k < 2) for (let i = 0; i < 2; i++) dal(x2, y2, a + (i ? .6 : -.6) + (rnd() - .5) * .4, L * .6, k + 1, D); };

    /* --- zemin: kaba kaldırım, çardağın gölgesi, kapıdan taşan ışık --- */
    b.pave(0, 0, b.w, b.d, '#57534c');
    { let d = ''; const t = .6; for (let i = 0; (i + 1) * t < W + .01; i++) for (let j = 0; (j + 1) * t < D + .01; j++) if ((i * 3 + j * 5) % 4 === 1 && ((i + 1) * t > ku1 || (j + 1) * t > kv1)) { const p = s.pr(i * t, j * t, 0); d += `M${f1(p[0])} ${f1(p[1])}l14.4 7.2l-14.4 7.2l-14.4 -7.2z`; }
      b.ground(pth('#4e4a44', d)); }
    { const c = (x, m) => Math.max(.05, Math.min(m - .05, x)), a0 = c(pu0 - .1 + gl[0] * zp, W), a1 = c(pu1 + .1 + gl[0] * zp, W), b0 = c(pv0 - .1 + gl[1] * zp, D), b1 = c(pv1 + .2 + gl[1] * zp, D);
      s.gpoly([[a0, b0], [a1, b0], [a1, b1], [a0, b1]], '#1b1d22', { op: .22 }); }
    const dv = kv1 - .62;
    s.spill(ku1 + .75, dv + .2, 1.7, { op: .9 });

    /* --- meyhane salonu: kara taş zemin, kirli sıvalı ve çatkılı alınlık --- */
    const g = s.box(ku0, kv0, 0, ku1, kv1, H, TAS, { T: null });
    for (const f of [g.O, g.E]) f.courses({ rh: .24, bw: .6, dens: .5 }).stones(3, { rh: .24 }).band(0, .16, M.gKara, .02).shadeTop(.14, -.18);
    // dış cephe: kepengi kapalı iki dar pencere (sönük)
    [.42, 1.46].forEach(u => g.O.win(g.ao(ku0 + u, .3), .36, .3, .5, { kind: 'point', frame: M.gAhsapK, sove: M.gTasA, shut: '#4a3a34', lit: false, sill: false, bars: [2, 2] }));
    // uç cephe: ardına kadar açık sivri kapı; içi sıcak ateş ışığı, eşikte kara gölge
    { const f = g.E, a = g.ae(dv, .5), w = .5, h = .92;
      f.shp('point', a - .09, 0, w + .18, h + .1, M.gTasA, 3, .04).shp('point', a, 0, w, h, M.gKor, 4, null).shp('point', a + .07, .02, w - .14, h - .12, M.gAtes, 4.2, null);
      f.rect(a + w * .42, .02, .12, .5, '#2a1e18', 4.4, null).dot(a + w * .48, .58, 2.2, '#2a1e18', 4.5, null);           // içerideki bir gölge
      f.rect(a + w - .06, 0, .1, h - .2, M.gAhsapK, 4.6, -.1);                                                                  // açık kanat
      f.poly([[a, 0], [a + w, 0], [a + w, 0, -.28], [a, 0, -.28]], '#3a2a20', 4.7, null); }
    // dik arduvaz çatı: alınlık uçuruma bakar
    { const half = (ku1 - ku0) / 2, rise = .92, gc = s.gable(ku0, kv0, ku1, kv1, H, rise, CATI, { ov: .18, wall: SIVA, tex: false });
      for (const f of [gc.A, gc.B]) { if (!f) continue; let d = '', t = ''; for (let c = .18, k = 0; c < f.h - .04; c += .18, k++) { d += f.seg(0, c, f.w, c); for (let a = (k % 2 ? .2 : .05) + rnd() * .2; a < f.w - .05; a += .3 + rnd() * .2) if (rnd() < .3) t += f.seg(a, c - .15, a, c); }
        f.put(2.5, 'Ln ' + K.ks(f.c(CATI, -.34)), d, 'stroke-width=".9"').put(2.6, 'Ln ' + K.ks(f.c(CATI, -.26)), t, 'stroke-width=".7"').rect(0, 0, f.w, .1, CATI, 2.3, -.14); }
      gc.G.band(0, .1, M.gAhsapK, 0, 3).timber({ col: M.gAhsapK, posts: [half - .3, half + .3], rails: [rise * .46], braces: [[.12, .06, half - .3, rise * .4], [half * 2 - .12, .06, half + .3, rise * .4], [half - .3, rise * .46, half, rise * .9], [half + .3, rise * .46, half, rise * .9]], wid: 2.2 });
      gc.G.win(half - .13, rise * .12, .26, .3, { kind: 'point', frame: M.gAhsapK, lit: false, sill: false, bars: [2, 1] });
      s.line3([[ku0 + half, kv1 + .18, H + rise - .02], [ku0 + half, kv1 + .18, H + rise + .4]], M.gDemir, 1.3);
      // ocak bacası: arka köşede, mahyanın çok üstüne
      const bc = s.box(ku0 + .22, kv0 + .18, H + .2, ku0 + .58, kv0 + .54, H + rise + .9, TAS, { edge: false }); bc.O.courses({ rh: .2, bw: .3, dens: .5 }); bc.E.courses({ rh: .2, bw: .3, dens: .5 });
      s.box(ku0 + .17, kv0 + .13, H + rise + .9, ku0 + .63, kv0 + .59, H + rise + .98, M.gKara, { edge: false, cast: false }); s.fx('smoke', ku0 + .4, kv0 + .36, H + rise + 1.02, { s: 1 });
      if (rnd() < .6) s.critter('guvercin', ku0 + half, kv0 + .4, H + rise + .02, { col: '#25252b', flip: rnd() < .5 }); }
    // tabela: köşedeki demir kolda kupa resimli levha
    s.line3([[ku1, kv1 + .02, H - .14], [ku1, kv1 + .5, H - .14], [ku1, kv1 + .02, H - .4]], M.gDemir, 1.4);
    s.art(ku1, kv1 + .3, H - .14, `<g transform="matrix(1 -.5 0 1.2247 0 0)">` + ln(M.gDemir, 'M-4 0v3M4 0v3', .8) + pth(M.gAhsapK, 'M-6.6 3h13.2v12h-13.2z') + pth(T(M.gAhsap, -.1), 'M-5.6 4h11.2v10h-11.2z')
      + pth(M.gKemik, 'M-3 6.6h4.6v5.6h-4.6z') + ln(M.gKemik, 'M1.6 7.6q2.4 .4 0 3', .9) + '</g>', { bb: [ku1 - .03, kv1 + .04, H - .7, ku1 + .03, kv1 + .5, H - .14] });

    /* --- taş tezgâh: beşikte fıçılar, korlu mangalda kazan, dizili kupalar --- */
    const c0 = ku1 - 1.2, tz = s.box(c0, kv1, 0, ku1, kv1 + .42, .38, TAS, { edge: false, T: T(TAS, .1) });
    tz.O.courses({ rh: .18, dens: .8 });
    [[c0 + .26, 0], [c0 + .58, 1]].forEach(([u, i]) => { const p = s.pr(u, kv1 + .21, .38);
      s.art(u, kv1 + .21, .38, pth(M.gAhsap, E(0, -4.6, 5.6, 4.6)) + pth(T(M.gAhsap, -.3), 'M0 -9.2a5.6 4.6 0 0 1 0 9.2z') + ln(M.gDemir, 'M-3.4 -8.4v7.6M3 -8.4v7.6', 1) + pth(T(M.gAhsap, .2), E(-4.6, -4.6, 1.4, 3.6)) + ln(M.gBronz, 'M-6 -3.4h-2', 1.4), { bb: [u - .16, kv1 + .05, .38, u + .16, kv1 + .37, .8] }); });
    s.art(c0 + .95, kv1 + .22, .38, pth('#2e2c2a', E(0, -.4, 6, 3)) + nk(M.gKor, .9, 'M-2.6 .2h0M2.8 .4h0') + pth(M.gDemir, 'M-4.4 -3.6q4.4 6 8.8 0z') + pth('#26282c', E(0, -3.6, 4.4, 1.6)) + kupa('M8.4 2.4h0M10.6 .2h0M12 3.4h0'), { bb: [c0 + .78, kv1, .38, ku1, kv1 + .42, .6] });
    s.fx('steam', c0 + .95, kv1 + .22, .58, { s: .6 });

    /* --- çardak: kara ahşap dikmeler, kirişler, mertekler, kurumuş asma --- */
    s.item([pu0, pv0, 0, pu1, pv0, zp], ln(M.gAhsapK, [pu0, pm, pu1].map(u => L3([u, pv0, 0], [u, pv0, zp])).join(''), 2.4));
    [pu0, pu1].forEach(u => s.line3([[u, pv1, 0], [u, pv1, zp]], M.gAhsapK, 2.8));
    { const nr = Math.max(3, Math.round((pu1 - pu0) / .34)), D2 = ['', '', '']; let rf = '';
      for (let i = 0; i <= nr; i++) { const u = pu0 + (pu1 - pu0) * i / nr; if (i % 4 !== 2) rf += L3([u, pv0 - .14, zp + .04], [u, pv1 + .2, zp + .04]); }
      for (let i = 0; i < 11; i++) { const p = s.pr(pu0 + (pu1 - pu0) * rnd(), pv0 + (pv1 - pv0) * rnd(), zp + .06); dal(p[0], p[1], rnd() * 6.28, 7 + rnd() * 6, 0, D2); }
      s.item([pu0 - .14, pv0 - .14, zp - .03, pu1 + .14, pv1 + .2, zp + .05], ln(M.gAhsapK, L3([pu0 - .14, pv0, zp], [pu1 + .14, pv0, zp]) + L3([pu0 - .14, pv1, zp], [pu1 + .14, pv1, zp]), 2.4) + ln(M.gAhsap, rf, 1.6));
      s.item([pu0 - .14, pv0 - .14, zp + .05, pu1 + .14, pv1 + .2, zp + .16], ln(M.gAhsapK, D2[0], 1.3) + ln(T(M.gAhsapK, .08), D2[1], .9) + ln(T(M.gAhsapK, .14), D2[2], .6)); }
    s.item([pu1 - .1, pv1, 0, pu1 + .08, pv1 + .08, zp], ln(M.gAhsapK, `M${s.P(pu1 + .06, pv1 + .07, 0)}Q${s.P(pu1 - .08, pv1 + .05, .7)} ${s.P(pu1 + .02, pv1 + .02, zp)}`, 1.7));
    // kirişten sarkan tek fener (zayıf, sıcak)
    { const u = pu0 + (pu1 - pu0) * .34;
      s.art(u, pv1 + .03, zp - .03, ln(M.gDemir, 'M0 0v4', .9) + pth(M.gDemir, 'M-2.4 4h4.8l-.6 1.4h-3.6zM-1.8 10.4h3.6v1h-3.6z') + pth('#ffe9b0>#fff1c2', 'M-1.8 5.4h3.6v5h-3.6z') + glow(8, 14), { bb: [u - .05, pv1, zp - .5, u + .05, pv1 + .06, zp] }); }
    // çardak dikmesinde yırtık kan kırmızısı flama (tek vurgu)
    s.fx('banner', pu1, pv1 + .02, zp - .06, { col: M.gKan, w: .24, h: .62, axis: 'x' });

    /* --- masalar ve müşteriler --- */
    const tu = t => ku1 + (W - ku1) * t, fa = 'M-2.6 -8.6h0M2.4 -7.6h0';
    // çardağın altında iki ahbap: biri kupasını kaldırmış
    takim(pm - .3, pv1 - .85, 0, P2(), P2(), kupa(fa), true);
    // açıkta, uçurum kenarında: iki yolcu; yalnız içen ihtiyar ve kara kedisi
    takim(ku0 + 1.05, D - .82, 1, P2(), P2(), kupa(fa) + pth(M.gAhsap, 'M-1 -8.6h2v-2.2h-2z'));
    takim(tu(.72), D - 1, 1, [gy(), 'ak'], rnd() < .5 ? P2() : null, kupa('M-2.4 -8.2h0') + pth('#3a3a34', 'M2 -8.4h2.4l-.3 -4h-1.8z'));
    s.critter('kedi', tu(.72) - .56, D - .5, 0, { col: '#2a2826' });
    // tepsili garson; tezgâhın başında meyhaneci (önlüklü)
    ayk(tu(.22), pv1 + .5, '#5a564e', 'sac', pth('#3a3432', 'M-3.7 -12.6h7.4v3h-7.4zM-4 -15l-3.6 -4.2l1.3 -1l3.5 4.2z') + pth(M.gAhsap, E(-7.8, -20.6, 5, 2.2)) + kupa('M-9.8 -21.4h0M-7.4 -22.2h0M-5.6 -21h0'));
    ayk(c0 + .6, kv1 + .7, pick(['#4a4238', M.gAhsapK, '#3e4048']), 'kuk', pth('#8a8070', 'M-3.2 -11h6.4l.6 6h-7.6z') + ln('#3a3432', 'M-3.6 -14.6l-3 3.4M3.6 -14.6l3 3.4', 1.6));
    // fıçı yığını ve çuval: çardağın arka köşesinde
    s.barrel(W - .34, pv0 + .3, 0, { col: M.gAhsap, top: M.gAhsapK, r: .18, h: .42, cast: false }).barrel(W - .34, pv0 + .68, 0, { col: M.gAhsap, top: M.gAhsapK, r: .18, h: .42, cast: false }).sack(W - .7, pv0 + .2, 0, { col: '#6a5e4c' });
    b.ground(ln('#0e1014', golge, 11, 'opacity=".22"'));

    /* --- uçurum kenarı: taş babalar arasında demir korkuluk --- */
    const fu = W - .16, fv = D - .16;
    [.16, W * .5, fu].forEach(u => s.box(u - .1, fv - .1, 0, u + .1, fv + .1, .46, TAS, { edge: false }));
    { let d = ''; const n = Math.round((fu - .52) / .22); for (let i = 1; i < n; i++) d += L3([.26 + (fu - .36) * i / n, fv, .04], [.26 + (fu - .36) * i / n, fv, .38]);
      s.item([.26, fv - .02, 0, fu - .1, fv + .02, .42], ln(M.gDemir, d + L3([.26, fv, .08], [fu - .1, fv, .08]), .9) + ln(M.gDemir, L3([.26, fv, .38], [fu - .1, fv, .38]), 1.8)); }

    s.tag(W / 2, D, 0); s.doorAt(ku1 + .4, -.3);
  });
})();
