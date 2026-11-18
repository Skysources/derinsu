/* Kahvehane — teras kenarında açık hava kahvesi. Sokak ARKADA (v = 0, görünmez); uçurum önde.
   Solda alçak ocak evi (damı tavla köşkü), önünde taş tezgâhta bakır semaver ve cezve ocağı;
   sağda asma çardağı, altında ve önünde alçak masalar, müşteriler, tepsili garson; uçurum boyunca korkuluk.
   opt: { cephe: 'L' | 'R', seed }. Tasarım (u, v) ile yazılır: u cephe boyunca, v sokaktan uçuruma; 'R' için x↔y aynalanır. */
(function () {
  // (u, v) → (x, y) aynası. Yüzler: O = dış cephe (v = v1), E = uç cephe (u = u1); ao/ae: cephe üstünde a konumu
  const yan = (b, K, R) => {
    const q = p => R ? [p[1], p[0], p[2] || 0] : p, bq = c => R ? [c[1], c[0], c[2], c[4], c[3], c[5]] : c;
    const sw = a => { if (R) { const t = a[0]; a[0] = a[1]; a[1] = t; } return a; };
    const s = { R, P: (u, v, z) => R ? K.P(v, u, z) : K.P(u, v, z), pr: (u, v, z) => R ? K.pr(v, u, z) : K.pr(u, v, z) };
    'sack pot spill tag doorAt'.split(' ').forEach(k => s[k] = (...a) => b[k](...sw(a)));
    s.critter = (k, ...a) => b.critter(k, ...sw(a));
    s.fx = (t, u, v, z, o) => b.fx(t, R ? v : u, R ? u : v, z, o);
    s.box = (u0, v0, z0, u1, v1, z1, c, o = {}) => {
      const x = R ? b.box(v0, u0, z0, v1, u1, z1, c, o) : b.box(u0, v0, z0, u1, v1, z1, c, o);
      return { O: R ? x.R : x.L, E: R ? x.L : x.R, ao: (u, w = 0) => R ? u1 - u - w : u - u0, ae: (v, w = 0) => R ? v - v0 : v1 - v - w };
    };
    s.line3 = (pts, c, w, o) => b.line3(pts.map(q), c, w, o);
    s.poly3 = (pts, c, o) => b.poly3(pts.map(q), c, { n: q(o.n), bb: bq(o.bb) });
    s.gpoly = (pts, c, o) => b.gpoly(pts.map(q), c, o);
    s.item = (bb, d) => b.item(bq(bb), d, { cast: false });
    s.art = (u, v, z, svg, o = {}) => b.art(R ? v : u, R ? u : v, z, R ? `<g transform="scale(-1 1)">${svg}</g>` : svg, o.bb ? { bb: bq(o.bb) } : o);
    // yatay yüz (döşeme üstü: kilim, minder): (a, b) = (u - u0, v - v0)
    s.yer = (u0, v0, u1, v1, z) => { const f = new K.Face(R ? [v0, u0, z] : [u0, v0, z], R ? [0, 1, 0] : [1, 0, 0], R ? [1, 0, 0] : [0, 1, 0], u1 - u0, v1 - v0, [0, 0, 1]); b.item(bq([u0, v0, z, u1, v1, z]), () => f.svg(), { cast: false }); return f; };
    // nokta: sıfır boylu yuvarlak uçlu çizgi; dn(x, y) birikir, nk(renk, yarıçap, d) basar
    s.dn = (x, y) => `M${K.f1(x)} ${K.f1(y)}h0`; s.nk = (c, r, d) => d ? K.ln(c, d, K.f1(2 * r)) : '';
    return s;
  };

  CK.def('kahve', { w: 5, d: 3.6, name: 'Kahvehane' }, (b, K, opt = {}) => {
    const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, f1 = K.f1, E = K.ell, R = opt.cephe === 'R', s = yan(b, K, R), dn = s.dn, nk = s.nk;
    const W = R ? b.d : b.w, D = R ? b.w : b.d, rnd = K.rng((opt.seed || 7) * 4513 + 5), pick = a => a[Math.floor(rnd() * a.length)];
    const L3 = (...p) => 'M' + p.map(c => s.P(c[0], c[1], c[2])).join(' '), glow = (y, r) => `<circle class="Nl" cy="${y}" r="${r}" fill="url(#${K.glowId()})"/>`;

    /* --- tohumdan gelen seçenekler --- */
    const sv = pick([M.kirec, '#f7f0e4', '#f1e4cf']), boya = pick([M.mavi, '#2f7f96', '#3b63a8', M.yesil]), tn = pick([[M.bezK, M.bez], [M.bezS, M.bez], [M.bezM, M.bez]]);
    const mor = rnd() < .3, uyku = rnd() < .35, bakir = '#c9783a', koyu = '#4a3a34';
    const gy = () => pick(['#7a5a8a', M.bezM, '#b0562e', M.bezY, '#8a7a5a', M.lacivert, '#a8473a']), hat = () => pick(['fes', 'sarik', 'sac', 'ak', 'fes']), P2 = () => [gy(), hat()];
    const H = 1, zp = 1.42, gl = R ? [-.65, .375] : [.375, -.65];
    const ku0 = .15, ku1 = 2.1, kv0 = .1, kv1 = 1.55, pu0 = ku1 + .42, pu1 = W - .36, pv0 = .32, pv1 = Math.min(2.15, D - 1.4), pm = (pu0 + pu1) / 2;

    /* --- insanlar (ekran pikseli). Bacak, baş ve başlıklar grupça tek yolda toplanır --- */
    let G, golge = '';
    const yeni = () => G = { b: '', h: '', t: {} };
    const bas = (h, x, y) => { const c = { fes: M.kirmizi, sarik: M.bez, ak: '#dedad0', sac: '#3a2c24' }[h] + (h === 'sac' || h === 'ak' ? '|2.4' : '|3.4');
      G.h += dn(x, y); G.t[c] = (G.t[c] || '') + (h === 'fes' ? `M${f1(x)} ${f1(y - 3)}v-1` : `M${f1(x - 1.5)} ${f1(y - 2.1)}h3`); };
    const cik = (orta, r = 2.9) => { const o = pth(koyu, G.b) + orta + nk(M.ten, r, G.h) + Object.keys(G.t).map(k => ln(k.split('|')[0], G.t[k], +k.split('|')[1])).join(''); yeni(); return o; };
    // oturan: f = +1 sağa, -1 sola bakar (kolu masaya uzanır); k = 4.6 ise yerde bağdaş kurmuş
    const otr = (x, y, f, c, h, k = 0) => { const m = (dx, dy) => `M${f1(x + f * dx)} ${f1(y + dy + k)}`, F = v => f1(f * v);
      G.b += k ? E(x, y - 1.7, 4.9, 2.2) : m(-2, -7.8) + `h${F(6.8)}v7.2h${F(-2.2)}v-4.6h${F(-4.6)}z`; bas(h, x + f * .3, y + k - 18.2);
      return pth(c, m(-3.2, -6.4) + `v-6.6q0 -2.4 ${F(2.4)} -2.4h${F(1.6)}q${F(2.4)} 0 ${F(2.4)} 2.4v1.2l${F(2.6)} 2l${F(-.9)} 1.3l${F(-1.7)} -1.3v3.4z`); };
    // ayakta duran (ek: önlük, kollar, tepsi…)
    const ayk = (u, v, c, h, ek) => { const p = s.pr(u, v, 0); golge += `M${f1(p[0] - 2)} ${f1(p[1])}h6`; G.b += 'M-2.6 -7h2.2v7h-2.2zM.4 -7h2.2v7h-2.2z'; bas(h, 0, -18.9);
      s.art(u, v, 0, cik(pth(c, 'M-3.7 -6.2v-7.3q0 -2.5 2.5 -2.5h2.4q2.5 0 2.5 2.5v7.3z') + ek, 3.1), { r: .14, h: .9 }); };
    const fincan = d => nk('#f6eeda', 1.15, d), masa = pth(M.ahsapA, E(0, -7.9, 5.8, 2.9)), tabure = (x, y) => { G.b += `M${x - 2.4} ${y - 4.6}h4.8l-.6 4.6h-3.6z`; return pth('#d2ac58', E(x, y - 5, 3, 1.5)); };
    // masa takımı: ax 1 → u boyunca, 0 → v boyunca oturulur; A arkadaki, B öndeki kişi ([giysi, başlık] ya da null = boş tabure)
    const takim = (u, v, ax, A, B, ek = '') => { const dx = ax ? 8.6 : -8.6, f = ax ? 1 : -1, p = s.pr(u, v, 0); golge += `M${f1(p[0] - 9)} ${f1(p[1] + 1)}h18`; G.b += 'M-.9 -7h1.8v7h-1.8z';
      s.art(u, v, 0, cik((A ? otr(-dx, -4.3, f, A[0], A[1]) : tabure(-dx, -4.3)) + masa + ek + (B ? otr(dx, 4.3, -f, B[0], B[1]) : tabure(dx, 4.3))), { bb: [u - .5, v - .5, 0, u + .5, v + .5, .7] }); };
    yeni();
    // saksılar: aynı gruptakiler tek parçada; çiçek rengi gruba göre
    const SK = {}, saksi = (u, v, z, g) => { const p = s.pr(u, v, z), x = p[0], y = p[1], S = SK[g] || (SK[g] = { z, bb: [u, v, u, v], d: ['', '', ''] });
      S.bb = [Math.min(S.bb[0], u - .08), Math.min(S.bb[1], v - .08), Math.max(S.bb[2], u + .08), Math.max(S.bb[3], v + .08)];
      S.d[0] += `M${f1(x - 2.3)} ${f1(y + .6)}l-.6 -4h5.8l-.6 4z`; S.d[1] += dn(x + .3, y - 6) + dn(x + 2.2, y - 4.6); S.d[2] += dn(x - 1.8, y - 7.6) + dn(x + 1.2, y - 8.3) + dn(x + 2.8, y - 5.6); };
    const saksiBas = () => Object.keys(SK).forEach(k => { const S = SK[k]; s.item([S.bb[0], S.bb[1], S.z, S.bb[2], S.bb[3], S.z + .36], pth(T(M.kiremitA, -.08), S.d[0]) + nk(T(M.sarmasik, -.1), 3.1, S.d[1]) + nk(k === 'd' ? '#d43a2c' : M.begonvil, 1.1, S.d[2])); });

    /* --- zemin: dama taşı döşeme, çardağın gölgesi, gece ışık havuzları --- */
    b.pave(0, 0, b.w, b.d, '#decfae');
    { let d = ''; const t = .6; for (let i = 0; (i + 1) * t < W + .01; i++) for (let j = 0; (j + 1) * t < D + .01; j++) if ((i + j) % 2 && ((i + 1) * t > ku1 || (j + 1) * t > kv1)) { const p = s.pr(i * t, j * t, 0); d += `M${f1(p[0])} ${f1(p[1])}l14.4 7.2l-14.4 7.2l-14.4 -7.2z`; }
      b.ground(pth('#cdbb96', d)); }
    { const c = (x, m) => Math.max(.05, Math.min(m - .05, x)), a0 = c(pu0 - .1 + gl[0] * zp, W), a1 = c(pu1 + .1 + gl[0] * zp, W), b0 = c(pv0 - .1 + gl[1] * zp, D), b1 = c(pv1 + .2 + gl[1] * zp, D);
      s.gpoly([[a0, b0], [a1, b0], [a1, b1], [a0, b1]], '#3a3a5e', { op: .17 }); }
    s.spill(ku0 + 1.4, kv1 + .7, 1.4); s.spill(pm, pv1 + .3, 2.1);

    /* --- ocak evi (korkuluk payıyla H + .2) --- */
    const g = s.box(ku0, kv0, 0, ku1, kv1, H + .2, sv, { T: null });
    g.O.band(0, .2, boya, .16); g.E.band(0, .2, boya, .16);
    // dış cephe: kepenkli pencere, servis gözü ve tentesi; uç cephe: çardağa açılan kapı
    { const a = g.ao(ku0 + .42, .26); g.O.rect(a - .15, .4, .13, .36, boya, 4).rect(a + .28, .4, .13, .36, boya, 4).rect(a, .4, .26, .36, boya, 4).rect(a + .04, .44, .18, .28, M.camI, 5).rect(a - .04, .34, .34, .06, M.tas, 4, .12).line([[a + .13, .44], [a + .13, .72]], boya, .9); }
    const hw = .6, hu = ku1 - .14 - hw, ha = g.ao(hu, hw);
    g.O.arcade(ha - .07, ha + hw + .07, 1, .5, { b: .36, pier: .07, kind: 'seg', th: .14, glow: true, floor: M.ahsapK, cap: false });
    b.awning(g.O, ha - .1, H - .03, hw + .2, { out: .24, drop: .08, cols: tn, val: .08 });
    g.E.door(g.ae(kv1 - .62, .46), .46, .82, { kind: 'arch', open: true, glow: true, sove: null });
    // dama el merdiveni
    { const u = ku0 + .07, at = t => [kv1 + .34 - .31 * t, (H + .34) * t];
      s.item([u, kv1, 0, u + .24, kv1 + .34, H + .34], ln(M.ahsapK, L3([u, ...at(0)], [u, ...at(1)]) + L3([u + .24, ...at(0)], [u + .24, ...at(1)]), 1.5) + ln(M.ahsap, [.14, .3, .46, .62, .78].map(t => L3([u, ...at(t)], [u + .24, ...at(t)])).join(''), 1.1)); }

    /* --- taş tezgâh: bakır semaver, kum ocağında cezveler, dizili fincanlar --- */
    const c0 = hu - .42, tz = s.box(c0, kv1, 0, ku1, kv1 + .42, .36, M.tas, { edge: false });
    tz.O.courses({ rh: .18, dens: .8 });
    s.art(c0 + .17, kv1 + .2, .36, pth(bakir, 'M-3.6 0l1 -2.6Q-5.8 -8.6 -3 -12l.8 -2.6h4.4l.8 2.6Q5.8 -8.6 2.6 -2.6l1 2.6z') + pth(T(bakir, .46), 'M-3.3 -4.4Q-4.2 -8.4 -2.4 -11h1.5Q-2.6 -8 -2 -4.4z')
      + ln(T(bakir, -.3), 'M0 -14.6v-5M-4.8 -9h-1.4M4.8 -9h1.4M4 -4.6h2.6', 1.8), { bb: [c0 + .04, kv1 + .06, .36, c0 + .3, kv1 + .34, 1.06] });
    s.fx('steam', c0 + .17, kv1 + .2, 1.08, { s: .7 });
    s.art(hu + .2, kv1 + .23, .36, pth('#4a403a', E(0, -.4, 6, 3)) + nk('#e8622a>#ffa040', 1, 'M-3 -.4h0M.6 1h0M3.4 -.8h0') + ln(bakir, 'M-1 -2.6h0M2.6 -1.2h0M-1 -3l-3.6 -1.8M2.6 -1.6l3.6 .6', 2.6)
      + fincan('M8.4 2.4h0M10.6 .2h0M12 3.4h0'), { bb: [hu, kv1, .36, ku1, kv1 + .42, .5] });

    /* --- ocak evinin damı: tavla köşkü ya da öğle uykusu --- */
    { const a0 = ku0 + .13, b0 = kv0 + .13, a1 = ku1 - .375, b1 = kv1 - .375, a2 = ku1 - .13, b2 = kv1 - .13, zt = H + .2;
      s.poly3([[a0, b0, H], [a1, b0, H], [a1, b1, H], [a0, b1, H]], '#dccaa6', { n: [0, 0, 1], bb: [ku0, kv0, H - .02, ku1, kv1, H] });
      s.poly3([[a0, b0, H], [a1, b0, H], [a2, b0, zt], [a0, b0, zt]], sv, { n: [0, 1, 0], bb: [ku0, kv0, H, ku1, b0, zt] });
      s.poly3([[a0, b0, H], [a0, b1, H], [a0, b2, zt], [a0, b0, zt]], sv, { n: [1, 0, 0], bb: [ku0, kv0, H, a0, kv1, zt] });
      s.item([ku0, kv0, zt, ku1, kv1, zt], pth(T(sv, K.toneOf([0, 0, 1])), L3([ku0, kv0, zt], [ku1, kv0, zt], [ku1, kv1, zt], [ku0, kv1, zt]) + 'Z' + L3([a0, b0, zt], [a0, b2, zt], [a2, b2, zt], [a2, b0, zt]) + 'Z', 'fill-rule="evenodd"')); }
    const dz = s.yer(ku0, kv0, ku1, kv1, H), kc = pick([M.bezK, M.lacivert, '#3f8a6a']), mu = ku0 + .96, mv = kv0 + .66;
    dz.rect(.3, .26, 1.3, .8, kc, 3, -.04).rect(.38, .34, 1.14, .64, '#e2c690', 3.1).rect(.46, .42, .98, .48, kc, 3.2, .08);
    if (!uyku) {
      // bağdaş kurmuş iki tavlacı, arada sini üstünde tavla
      s.art(mu, mv, H, cik(otr(-10, -5, 1, gy(), hat(), 4.6) + pth('#dba95c', E(0, -2.2, 6.6, 3.3)) + pth(M.ahsapK, 'M-4.4 -2.2l4.4 -2.2l4.4 2.2l-4.4 2.2z') + pth('#e8c88a', 'M-3 -2.2l3 -1.5l3 1.5l-3 1.5z')
        + ln(M.ahsapK, 'M0 -3.7v3', .7) + otr(10, 5, -1, gy(), hat(), 4.6)), { bb: [mu - .5, mv - .22, H, mu + .5, mv + .22, H + .6] });
    } else {
      // şilte üstünde uyuyan çırak: hasır şapka yüzünde, terlikler yanda
      dz.rect(.46, .42, 1, .46, M.bez, 3.6, .04).rect(.46, .42, .2, .46, M.bezK, 3.7, .1);
      s.art(mu, mv, H, ln(koyu, 'M0 -1.4L8.4 2.8', 4.2) + ln(gy(), 'M-7.4 -5.2L.6 -1.2', 5.6) + nk(M.ten, 2.7, 'M-10.4 -6.6h0') + pth('#d9b866', E(-9.6, -8, 4.4, 2.6)) + nk(M.kirmizi, 1, 'M9 8.4h0M11.6 7.6h0'), { bb: [mu - .5, mv - .22, H, mu + .5, mv + .22, H + .4] });
    }
    // baca, güvercin, korkulukta sardunyalar
    s.box(ku1 - .56, kv0 + .2, H, ku1 - .28, kv0 + .48, H + .5, sv, { edge: false, T: M.kiremit }); s.fx('smoke', ku1 - .42, kv0 + .34, H + .54, { s: .5 });
    s.art(ku0 + .5, kv0 + .07, H + .2, pth('#8f9aa6', 'M-3 -2.4q2.6 -2.4 5.6 -.2l1.6 -.6l-.9 1.5q-3.2 1.8 -6.3 -.7zM-3.9 -3.6a1.3 1.3 0 1 0 2.6 0a1.3 1.3 0 1 0 -2.6 0z'), { r: .1, h: .2 });
    saksi(ku0 + .07, kv1 - .07, H + .2, 'd'); saksi(ku1 - .07, kv1 - .07, H + .2, 'd');

    /* --- çardak: dikmeler, kirişler, mertekler, asma --- */
    s.item([pu0, pv0, 0, pu1, pv0, zp], ln(M.ahsapK, [pu0, pm, pu1].map(u => L3([u, pv0, 0], [u, pv0, zp])).join(''), 2.4));
    [pu0, pu1].forEach(u => s.line3([[u, pv1, 0], [u, pv1, zp]], M.ahsapK, 2.8));
    { const nr = Math.max(3, Math.round((pu1 - pu0) / .34)), A = ['', '', '', ''], vz = pv1 - pv0 + .3, ek = [], yk = T('#5f9a48', -.3); let rf = '';
      for (let i = 0; i <= nr; i++) { const u = pu0 + (pu1 - pu0) * i / nr; rf += L3([u, pv0 - .14, zp + .04], [u, pv1 + .2, zp + .04]);
        // asma yaprakları: arkada sık, öne doğru seyrek; aralarda salkımlar
        // asma: arkada kapalı yaprak örtüsü (tek çokgen), öne doğru seyrelen öbekler; aralarda salkımlar
        ek.push([u, pv0 - .12 + vz * (.5 + (i % 2 ? .09 : -.03) + rnd() * .05), zp + .06]);
        for (let t = 0; t < 1; t += .125) { const on = t >= .5; if (on && rnd() < (t - .5) * 1.5 + .1) continue; const p = s.pr(u + (rnd() - .5) * .26, pv0 - .1 + vz * (t + rnd() * .1), zp + .06);
          if (on) A[0] += dn(p[0], p[1]); if (rnd() < .8) A[1] += dn(p[0] - 1, p[1] - 1.3); if (rnd() < .3) A[2] += dn(p[0] - 1.9, p[1] - 2.2); if (t > .36 && rnd() < .3) A[3] += `M${f1(p[0] - 1.7)} ${f1(p[1] + 2.8)}h3.6l-1.8 ${mor ? 7 : 5}z`; } }
      s.item([pu0 - .14, pv0 - .14, zp - .03, pu1 + .14, pv1 + .2, zp + .05], ln(M.ahsapK, L3([pu0 - .14, pv0, zp], [pu1 + .14, pv0, zp]) + L3([pu0 - .14, pv1, zp], [pu1 + .14, pv1, zp]), 2.4) + ln(M.ahsap, rf, 1.6));
      s.item([pu0 - .14, pv0 - .14, zp + .05, pu1 + .14, pv1 + .2, zp + .16], pth(yk, L3([pu1 + .16, pv0 - .16, zp + .06], [pu0 - .16, pv0 - .16, zp + .06], [pu0 - .16, ek[0][1], zp + .06], ...ek, [pu1 + .16, ek[nr][1], zp + .06]) + 'Z') + pth(mor ? '#9a78cc' : '#5a3f7a', A[3]) + nk(yk, 4.8, A[0]) + nk('#62a04a', 3.3, A[1]) + nk(T('#6aa84f', .34), 1.4, A[2])); }
    s.item([pu1 - .1, pv1, 0, pu1 + .08, pv1 + .08, zp], ln(M.govde, `M${s.P(pu1 + .06, pv1 + .07, 0)}Q${s.P(pu1 - .08, pv1 + .05, .7)} ${s.P(pu1 + .02, pv1 + .02, zp)}`, 1.7));
    // kirişten sarkan renkli fenerler ve kafeste kanarya
    [[.28, '#d8503a>#ffa066'], [.72, '#e8b84a>#ffe9a0']].forEach(([t, c]) => { const u = pu0 + (pu1 - pu0) * t;
      s.art(u, pv1 + .03, zp - .03, ln(M.demir, 'M0 0v4M-2.4 4h4.8M-2.4 10.4h4.8', .9) + pth(c, 'M-2.2 4h4.4l1 3.2l-1 3.2h-4.4l-1 -3.2z') + glow(7, 13), { bb: [u - .05, pv1, zp - .5, u + .05, pv1 + .06, zp] }); });
    s.art(pu1 + .12, pv1 + .03, zp - .03, nk('#f2d14a', 1.4, 'M0 9h0') + ln(M.altin, 'M0 0v3M-3.6 12V7Q-3.6 3 0 3Q3.6 3 3.6 7V12M-1.3 12V3.3M1.3 12V3.3M-4 12.4h8', .8), { bb: [pu1 + .06, pv1, zp - .5, pu1 + .18, pv1 + .06, zp] });

    /* --- masalar ve müşteriler --- */
    const tu = t => ku1 + (W - ku1) * t, fa = 'M-2.6 -8.4h0M2.4 -7.4h0';
    // çardağın altında iki ahbap
    takim(pm - .3, pv1 - .85, 0, P2(), P2(), fincan(fa));
    // açıkta, uçurum kenarında: iki arkadaş; nargile içen ihtiyar ve kedisi
    takim(ku0 + 1.05, D - .82, 1, P2(), P2(), fincan(fa) + pth('#3f8fa8', 'M-.8 -8.2h1.6l.5 -2.6h-2.6z'));
    takim(tu(.72), D - 1, 1, [gy(), 'ak'], rnd() < .5 ? P2() : null, fincan('M-2.4 -8h0') + pth('#3f8fa8', E(3, -9.6, 1.9, 2.3)) + ln(M.bronz, 'M3 -11.6v-5', 1.2) + ln('#8a3a34', 'M2.6 -13Q-4 -15 -5.6 -9.6', .8));
    s.art(tu(.72) - .56, D - .5, 0, pth(pick(['#e0903a', '#5a5450', '#3a3432', '#d8d0c4']), 'M-3 0q-.8 -4.4 1.6 -5.2q2.8 -.4 3.4 2.2q.6 2.2 -.4 3zM-4 -6.2a2.1 2.1 0 1 0 4.2 0a2.1 2.1 0 1 0 -4.2 0zM-3.8 -7.4l.3 -2.3l1.5 1.5zM-.9 -8l1.2 -1.9l.5 2.2zM3.4 -1.2q3.6 -.6 3 -4.4q-.2 -1.2 -1 -.2q.6 2.6 -2 3z'), { r: .1, h: .3 });
    // tepsili garson; cezvenin başında kahveci
    ayk(tu(.22), pv1 + .5, M.bez, 'fes', pth('#3a3432', 'M-3.7 -12.6h7.4v3h-7.4zM-4 -15l-3.6 -4.2l1.3 -1l3.5 4.2z') + pth(M.bronz, E(-7.8, -20.6, 5, 2.2)) + fincan('M-9.8 -21.2h0M-7.4 -22h0M-5.6 -20.8h0'));
    ayk(hu + .34, kv1 + .68, pick(['#8a5a3a', M.yesil, '#7a5a8a']), 'sarik', pth(M.bez, 'M-3.2 -11h6.4l.6 6h-7.6zM-3.6 -14.6l-3 3.4l1.2 1l2.6 -3zM3.6 -14.6l3 3.4l-1.2 1l-2.6 -3z'));
    // kahve çuvalı, su küpü
    s.sack(W - .34, pv0 + .3, 0, { col: '#c9b07a' }).pot(W - .3, pv0 + .72, 0, { s: 1.15, col: M.kil });
    b.ground(ln('#1b2440', golge, 11, 'opacity=".16"'));

    /* --- uçurum kenarı: taş babalar arasında boyalı korkuluk; köşe feneri, tabela direği --- */
    const fu = W - .16, fv = D - .16;
    [.16, fu].forEach(u => s.box(u - .1, fv - .1, 0, u + .1, fv + .1, .46, sv, { edge: false }));
    { let d = ''; const n = Math.round((fu - .52) / .3); for (let i = 1; i < n; i++) d += L3([.26 + (fu - .36) * i / n, fv, .04], [.26 + (fu - .36) * i / n, fv, .34]);
      s.item([.26, fv - .02, 0, fu - .1, fv + .02, .4], ln(T(boya, .16), d + L3([.26, fv, .08], [fu - .1, fv, .08]), 1) + ln(boya, L3([.26, fv, .36], [fu - .1, fv, .36]), 2.2)); }
    saksi(W * .52, fv + .04, 0, 'k'); saksi(W * .52 + .3, fv + .04, 0, 'k');
    s.art(fu, fv, .46, pth(M.demir, 'M-2.8 0h5.6l-.8 -1.4h-4zM-3.2 -8.8l3.2 -2.8l3.2 2.8z') + pth('#fff0c4>#fff4cf', 'M-2.3 -8.6h4.6l-.5 7.2h-3.6z') + glow(-5, 17), { r: .08, h: .4 });
    // tabela direği: demir kolda fincanlı levha, altında fener
    s.line3([[.16, fv, .46], [.16, fv, 1.5]], M.ahsapK, 2).line3([[.16, fv, 1.42], [.8, fv, 1.42]], M.demir, 1.4);
    s.art(.5, fv, 1.42, `<g transform="matrix(1 .5 0 1.2247 0 0)">` + ln(M.demir, 'M-4 0v3M4 0v3', .8) + pth(M.ahsapK, 'M-6.6 3h13.2v12h-13.2z') + pth(T(boya, -.12), 'M-5.6 4h11.2v10h-11.2z')
      + pth('#f6eeda', 'M-3 8.4h5l-.7 4h-3.6z') + ln('#f6eeda', 'M2 9.2q2.4 .4 .2 2.4M-1.6 7q-.9 -1 0 -2M.6 7q-.9 -1 0 -2', .8) + '</g>', { bb: [.18, fv - .03, .8, .82, fv + .03, 1.46] });

    saksiBas();
    s.tag(W / 2, D, 0); s.doorAt(ku1 + .4, -.3);
  });
})();
