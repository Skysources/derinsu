/* Tekneler — limanı ve denizi dolduran iş tekneleri: sandal, balıkçı teknesi, mavna, yelkenli.
   Su yüzeyi z = 0; yalnız su üstü çizilir. opt.dir 'x' (pruva +x, aydınlık +y bordası görünür) | 'y' (pruva +y, +x bordası görünür).
   Tek gövde yordamı: tekne koordinatı (s boyuna: kıç 0 → pruva L · t enine: + bize bakan borda · z) ızgaraya çevrilir;
   kaplama dilimleri gerçek normalleriyle tonlanır, böylece iki yönde de ışık doğru düşer.
   Çizim sırası (ekleme sırası): iç yüzler ve döşeme → içindekiler → dış kaplama → direk, tente, dışarı sarkanlar.
   Geliştirme: opt.su = true parselin altına deniz boyar (yalnız önizleme için), opt.tur / opt.renk çeşidi elle seçer. */
(function () {
  const K = CK, M = K.M, T = K.tone, pth = K.pth, ln = K.ln, f1 = K.f1;
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const mid = (a, b, k = .5) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const pw = (x, p) => Math.pow(Math.max(0, Math.min(1, x)), p);
  // aynı sınıftaki parçaları tek <path>'te toplar
  const kova = () => { const m = new Map(); return { add(cls, d) { m.set(cls, (m.get(cls) || '') + d); return this; },
    svg() { let s = ''; for (const [k, d] of m) s += `<path class="${k}" d="${d}"/>`; return `<g stroke-width=".5" stroke-linejoin="round">${s}</g>`; } }; };
  // dolgu + aynı renkte kıl payı çizgi: komşu dilimler arasında su rengi sızmasın
  const F = c => K.kf(c) + ' ' + K.ks(c), q8 = t => Math.round(t * 12.5) / 12.5;
  const TT = K.toneOf([0, 0, 1]);

  // boya takımları: gövde, şerit, karina, iç, küpeşte
  const RENK = [
    { boya: '#f3eee2', ser: '#2f6fa3', kar: '#8a3d32', ic: '#dccba6', cap: '#9a6a3f' },      // beyaz
    { boya: '#7fb7d6', ser: '#f3eee2', kar: '#2c4a78', ic: '#ece2c8', cap: '#9a6a3f' },      // gök mavisi
    { boya: '#b84a3b', ser: '#f0dfb8', kar: '#3c3836', ic: '#dcc79c', cap: '#6a4428' },      // kırmızı
    { boya: '#5c9474', ser: '#e8c25a', kar: '#7a3a30', ic: '#e6d9b4', cap: '#9a6a3f' },      // yeşil
    { boya: '#b98552', ser: '#2f8f8f', kar: '#5a3a26', ic: '#c9a06a', cap: '#6a4428' },      // doğal ahşap
  ];
  const GUMUS = '#b9c7d2', BARBUN = '#dc9a86', MANTAR = '#d9a04e';

  /* =========================================================
     GÖVDE: posta kesitlerinden örülen eğri tekne
     sp: L boy · B en · h/hb/hs orta/pruva/kıç borda yüksekliği · um en geniş yer · tw ayna kıç eni (0 = sivri kıç)
         pb/ps pruva/kıç dolgunluğu · rb/rs bodoslama eğimi · boya/ser/kar/ic/cap renkler · m0/m1/mt parsel payları
     ========================================================= */
  function govde(b, opt, sp) {
    const dy = opt.dir === 'y', L = sp.L, B = sp.B, m0 = sp.m0 || .2, m1 = sp.m1 || .2, mt = sp.mt || .2, c = mt + B / 2;
    b.w = dy ? B + 2 * mt : L + m0 + m1; b.d = dy ? L + m0 + m1 : B + 2 * mt;
    const G = dy ? (s, t, z) => [c + t, m0 + s, z || 0] : (s, t, z) => [m0 + s, c + t, z || 0];
    const N = dy ? n => [n[1], n[0], n[2]] : n => n;
    const BB = (s0, t0, z0, s1, t1, z1) => dy ? [c + t0, m0 + s0, z0, c + t1, m0 + s1, z1] : [m0 + s0, c + t0, z0, m0 + s1, c + t1, z1];
    const P = p => K.P.apply(null, G(p[0], p[1], p[2])), PL = a => a.map(P).join(' '), sc = p => K.pr.apply(null, G(p[0], p[1], p[2]));
    const tn = (n, dz = 1) => q8(K.toneOf(K.unit(N([n[0], n[1], n[2] * dz])))), vis = n => K.dot(N(n), K.VIEW) > 0;
    if (opt.su) b.pave(-.4, -.4, b.w + .4, b.d + .4, M.su);

    const um = sp.um || .45, n = sp.n || 12, VS = [0, .2, .8, 1], wl = sp.wl || .7, gw = .05, zf = sp.zf || .1;
    const plan = u => u >= um ? 1 - pw((u - um) / (1 - um), sp.pb || 2.2) : 1 - (1 - (sp.tw || 0)) * pw((um - u) / um, sp.ps || 2.2);
    const sheer = u => sp.h + (u >= um ? (sp.hb - sp.h) * pw((u - um) / (1 - um), 2) : (sp.hs - sp.h) * pw((um - u) / um, 2));
    const rake = u => u >= um ? (sp.rb || 0) * pw((u - um) / (1 - um), 3) : -(sp.rs || 0) * pw((um - u) / um, 3);
    const pt = (u, v, sg) => [L * u + rake(u) * v, sg * plan(u) * B / 2 * (wl + (1 - wl) * Math.pow(v, .55)), sheer(u) * v];      // kaplama noktası
    const inn = (u, sg, dz) => { const p = pt(u, 1, sg); return [p[0], sg * Math.max(0, Math.abs(p[1]) - gw), p[2] - (dz || 0)]; };   // küpeşte iç kenarı
    const flo = (u, sg) => { const p = pt(u, zf / sheer(u), sg); return [p[0], sg * Math.max(0, Math.abs(p[1]) - .03), zf]; };      // döşeme kenarı
    const hbz = (s, z) => { const u = Math.max(0, Math.min(1, s / L)); return Math.max(0, Math.abs(pt(u, Math.min(1, z / sheer(u)), 1)[1]) - gw); };
    const capd = new Set(), it = (bb, svg) => b.item(BB.apply(null, bb), svg, { cast: false });
    const cap = (k, u0, u1, sg) => { const key = sg + ':' + u0; if (capd.has(key)) return; capd.add(key);
      k.add(F(T(sp.cap, TT + .04)), 'M' + PL([inn(u0, sg), inn(u1, sg), pt(u1, 1, sg), pt(u0, 1, sg)]) + 'Z'); };

    const h = { G, N, BB, P, PL, sc, tn, L, B, zf, sheer, hbz, pt, inn, sp, dy, it(bb, svg) { it(bb, svg); return h; },
      // su: gövdenin altında koyuluk, bordada hafif çırpıntı, suya düşen gölge
      su(o = {}) { const w = []; for (let j = 0; j <= n; j++) w.push(pt(j / n, 0, 1)); for (let j = n; j >= 0; j--) w.push(pt(j / n, 0, -1));
        const g = (ks, kt, d) => w.map(p => G((p[0] - L / 2) * ks + L / 2 + d, p[1] * kt + d, 0));
        b.gpoly(g(1.07, 1.55, .05), T(M.suK, -.05), { op: .4 }); b.gpoly(g(1.03, 1.22, .05), T(M.suK, -.4), { op: .55 });
        let d = ''; for (const [u0, u1, off, sg] of o.dalga || [[.05, .26, .15, 1], [.4, .7, .12, 1], [.24, .44, .27, 1], [.74, .96, .22, 1], [.9, 1.07, .17, -1], [-.08, .05, .2, 1]]) {
          const q = [0, .5, 1].map(i => { const u = u0 + (u1 - u0) * i, uc = Math.max(0, Math.min(1, u)), p = pt(uc, 0, sg); return [p[0] + (u - uc) * L, p[1] + sg * off * (i === .5 ? 1.22 : 1), 0]; });
          d += `M${P(q[0])}Q${P(q[1])} ${P(q[2])}`; }
        b.ground(ln(M.kopuk, d, .8, 'opacity=".6"'));
        const sp3 = []; for (let j = 0; j <= n; j += 2) sp3.push(G.apply(null, pt(j / n, 1, 1)), G.apply(null, pt(j / n, 1, -1)));
        b.item([0, 0, 0, 0, 0, 0], '', { pts: sp3.concat(o.pts || []) }); return h; },
      // iç: borda içleri, postalar, kuşak, döşeme tahtaları, ayna kıç
      ic() { const k = kova(); let rib = '', str = '';
        if (sp.dumen) k.add(F(T(sp.cap, tn([0, 1, 0]) - .1)), 'M' + PL([[.02, 0, 0], [-.2, 0, 0], [-.17, 0, sheer(0) * .55], [-.02, 0, sheer(0) + .1], [.02, 0, sheer(0) + .1]]) + 'Z');
        if (sp.tw) k.add(F(T(sp.ic, tn([1, 0, 0]) - .05)), 'M' + PL([flo(0, -1), flo(0, 1), inn(0, 1), inn(0, -1)]) + 'Z');
        for (const sg of [-1, 1]) for (let j = 0; j < n; j++) { const u0 = j / n, u1 = (j + 1) / n, A = flo(u0, sg), Bq = flo(u1, sg), C = inn(u1, sg), D = inn(u0, sg), nn = cross(sub(C, A), sub(D, Bq)).map(v => v * sg);
          if (!vis(nn)) continue; k.add(F(T(sp.ic, tn(nn, .5) - .05)), 'M' + PL([A, Bq, C, D]) + 'Z'); cap(k, u0, u1, sg);
          if (j) rib += 'M' + PL([A, D]); str += 'M' + PL([mid(A, D, .56), mid(Bq, C, .56)]); }
        const fl = []; for (let j = 0; j <= n; j++) fl.push(flo(j / n, 1)); for (let j = n; j >= 0; j--) fl.push(flo(j / n, -1));
        const dos = sp.dos || T(sp.ic, -.14); k.add(F(T(dos, TT - .1)), 'M' + PL(fl) + 'Z');
        let pl = ''; for (const f of [-.62, -.2, .2, .62]) { const q = []; for (let j = 0; j <= n; j++) { const p = flo(j / n, 1); q.push([p[0], p[1] * f, zf]); } pl += 'M' + PL(q); }
        it([0, -B / 2, 0, L, B / 2, zf], k.svg() + ln(T(dos, TT - .3), pl, .6) + ln(T(sp.ic, -.42), rib, 1) + ln(T(sp.ic, -.26), str, .9)); return h; },
      // dış: karina, boyalı sıralar, şerit sırası, küpeşte, pruva bodoslaması
      dis() { const k = kova(); let seam = '', rub = '';
        for (const sg of [-1, 1]) for (let j = 0; j < n; j++) { const u0 = j / n, u1 = (j + 1) / n; let any = false;
          for (let q = 0; q < 3; q++) { const A = pt(u0, VS[q], sg), Bq = pt(u1, VS[q], sg), C = pt(u1, VS[q + 1], sg), D = pt(u0, VS[q + 1], sg), nn = cross(sub(C, A), sub(D, Bq)).map(v => -v * sg);
            if (!vis(nn)) continue; any = true; k.add(F(T(q === 0 ? sp.kar : q === 2 ? sp.ser : sp.boya, tn(nn, .4) + (q === 2 ? .04 : 0))), 'M' + PL([A, Bq, C, D]) + 'Z');
            if (q === 1) seam += 'M' + PL([pt(u0, .5, sg), pt(u1, .5, sg)]); if (q === 2) rub += 'M' + PL([A, Bq]); }
          if (any) cap(k, u0, u1, sg); }
        let s = k.svg() + ln(T(sp.boya, -.3), seam, .6) + ln(T(sp.cap, -.34), rub, 1.1);
        if (!sp.kut) { const top = [L + (sp.rb || 0) * 1.22, 0, sp.hb + (sp.bas === undefined ? .13 : sp.bas)]; s += ln(T(sp.cap, -.3), 'M' + PL([pt(1, 0, 1), pt(1, 1, 1), top]), 2.2) + ln(T(sp.cap, .1), 'M' + PL([pt(1, .5, 1), top]), .8); }
        it([-1, -B / 2 - .12, 0, L + 1, B / 2 + .12, sp.top || 1], s); return h; },
      // güverte: u0..u1 arası üst kaplama (küpeştenin biraz altında); öne bakan perdesiyle
      guverte(u0, u1, col, o = {}) { const q = [], dz = o.dz || .05, st = Math.max(2, Math.round((u1 - u0) * n)); for (let i = 0; i <= st; i++) q.push(inn(u0 + (u1 - u0) * i / st, 1, dz)); for (let i = st; i >= 0; i--) q.push(inn(u0 + (u1 - u0) * i / st, -1, dz));
        let pl = ''; for (const f of [-.5, 0, .5]) pl += 'M' + PL(q.slice(0, st + 1).map(p => [p[0], p[1] * f, p[2]]));
        const z0 = Math.min(q[0][2], q[st][2]), z1 = Math.max(q[0][2], q[st][2]);
        if (o.perde) { const a = q[st], e = q[st + 1]; it([a[0] - .02, -B / 2, zf, a[0], B / 2, a[2]], pth(T(sp.ic, tn([1, 0, 0]) - .12), 'M' + PL([[a[0], a[1], zf], a, e, [e[0], e[1], zf]]) + 'Z')); }
        it([L * u0, -B / 2, zf, L * u1 + .3, B / 2, z1], pth(T(col, TT - .02), 'M' + PL(q) + 'Z') + ln(T(col, TT - .24), pl, .6)
          + (u0 > 0 ? ln(T(col, TT + .18), 'M' + PL([q[0], q[q.length - 1]]), 1) : '')); return h; },
      kutu(s0, t0, z0, s1, t1, z1, col, o) { return b.box.apply(b, BB(s0, t0, z0, s1, t1, z1).concat([col, Object.assign({ edge: false, cast: false }, o)])); },
      // oturak: bordadan bordaya tahta
      oturak(s, z, col, w = .08) { const hw = hbz(s, z); h.kutu(s - w, -hw, z - .04, s + w, hw, z, col || M.ahsapA); return h; },
      hat(pts, col, w, o) { b.line3(pts.map(p => G(p[0], p[1], p[2])), col, w, o); return h; },
      art(s, t, z, svg, bb) { const g = G(s, t, z); b.art(g[0], g[1], g[2], svg, bb ? { bb: BB.apply(null, bb) } : { r: .1, h: .3 }); return h; },
      // kürek: sap + boyalı pala
      kurek(a, e, col) { const m = mid(a, e, .74); return h.hat([a, m], M.ahsapA, 1.2).hat([m, e], col || '#efe6d2', 2.1); },
    };
    return h;
  }

  /* ---------- küçük eşyalar (ekran uzayında, yön bağımsız) ---------- */
  const top3 = (c, r = 2.4) => pth(T(c, -.3), K.circ(0, -r, r)) + pth(c, K.circ(-.3, -r - .3, r * .78)) + pth(T(c, .5), K.circ(-r * .4, -r * 1.4, r * .26));     // şamandıra topu
  const ag = (w, hh, c, fl = MANTAR) => pth(T(c, -.34), `M${-w} 0Q${f1(-w * 1.1)} ${f1(-hh * .8)} ${f1(-w * .4)} ${-hh}Q${f1(w * .1)} ${f1(-hh * 1.35)} ${f1(w * .5)} ${f1(-hh * .9)}Q${f1(w * 1.15)} ${f1(-hh * .6)} ${w} 0Q0 ${f1(hh * .45)} ${-w} 0Z`)
    + pth(c, `M${f1(-w * .88)} ${f1(-hh * .1)}Q${f1(-w * .96)} ${f1(-hh * .75)} ${f1(-w * .38)} ${f1(-hh * .9)}Q${f1(w * .05)} ${f1(-hh * 1.2)} ${f1(w * .34)} ${f1(-hh * .8)}Q${f1(-w * .05)} ${f1(-hh * .5)} ${f1(-w * .16)} ${f1(hh * .12)}Q${f1(-w * .6)} ${f1(hh * .12)} ${f1(-w * .88)} ${f1(-hh * .1)}Z`)
    + ln(T(c, .4), `M${f1(-w * .7)} ${f1(-hh * .3)}L${f1(-w * .2)} ${f1(-hh * .98)}M${f1(-w * .42)} ${f1(-hh * .02)}L${f1(w * .16)} ${f1(-hh * 1.02)}M${f1(-w * .78)} ${f1(-hh * .52)}L${f1(-w * .1)} ${f1(-hh * .12)}M${f1(-w * .5)} ${f1(-hh * .84)}L${f1(w * .1)} ${f1(-hh * .5)}M${f1(w * .2)} ${f1(-hh * .2)}L${f1(w * .62)} ${f1(-hh * .74)}`, .5)
    + pth(fl, K.circ(-w * .52, -hh * .2, 1.25) + K.circ(-w * .12, -hh * .08, 1.25) + K.circ(w * .3, -hh * .14, 1.25) + K.circ(w * .66, -hh * .34, 1.25) + K.circ(w * .1, -hh * .98, 1.15));
  const sepetI = () => pth('#8a6238', 'M-5.4 0V-3.2Q-5.4 -8.6 0 -8.6Q5.4 -8.6 5.4 -3.2V0Q0 2 -5.4 0Z') + pth('#b98a52', 'M-5.4 -.4V-3.2Q-5.4 -8.6 -.6 -8.6Q-3 -5 -2.6 .9Q-4.4 .5 -5.4 -.4Z')
    + ln('#5a3c22', 'M-5.2 -2.6Q0 -.6 5.2 -2.6M-4.4 -5.6Q0 -3.8 4.4 -5.6M-2.6 .8V-7.8M0 1.2V-8.6M2.6 .8V-7.8', .6) + pth('#2b2420', K.ell(0, -8, 1.6, .8));      // ıstakoz sepeti
  const kovaI = c => pth(T(c, -.3), 'M-2.6 -5.4h5.2l-.7 5.2q-1.9 .8 -3.8 0z') + pth(c, 'M-2.6 -5.4h2.4l.2 5.6q-1 0 -1.9 -.4z') + pth('#3f8fa8', K.ell(0, -5.4, 2.6, 1)) + ln(M.demir, 'M-2.6 -5.4Q0 -10 2.6 -5.4', .6);
  const halat = (c = '#cdb98a') => pth(T(c, -.3), K.ell(0, -1, 4.2, 2.3)) + ln(c, 'M-3.4 -1.4a3.4 1.7 0 1 0 6.8 0a3.4 1.7 0 1 0 -6.8 0M-1.8 -1.6a1.8 .9 0 1 0 3.6 0', .9);
  const fener = () => pth(M.demir, 'M-2.8 -4.4h5.6l-1 1.5h-3.6zM-2.3 2.6h4.6v1.2h-4.6z') + pth('#ffe9b0>#fff3c4', 'M-1.9 -2.9h3.8l.4 5.5h-4.6z') + pth('#ffb648>#ffa030', K.circ(0, .2, 1))
    + ln(M.demir, 'M-2 -2.9l-.3 5.5M2 -2.9l.3 5.5', .5) + `<circle class="Nl" cx="0" cy="0" r="21" fill="url(#${K.glowId()})"/>`;
  const amfora = c => pth(T(c, -.28), 'M-1.3 -12.4h2.6v2.6Q4.6 -8 3.2 -3.4L.5 1.4h-1L-3.2 -3.4Q-4.6 -8 -1.3 -9.8Z') + pth(T(c, .1), 'M-1.3 -12.4h1.2v2.8Q-1.6 -6 -.6 1.4L-3.2 -3.4Q-4.6 -8 -1.3 -9.8Z')
    + pth(T(c, -.1), 'M-2.1 -13.4h4.2v1.1h-4.2z') + ln(T(c, -.34), 'M-1.3 -11.6Q-4.4 -11 -3.2 -7.4M1.3 -11.6Q4.4 -11 3.2 -7.4', .8);
  const usturmaca = c => ln('#6a5a4a', 'M0 -4V0', .6) + pth(T(c, -.3), K.ell(0, 2.6, 1.8, 2.9)) + pth(c, K.ell(-.4, 2.3, 1.2, 2.4)) + ln(T(c, -.45), 'M-1.6 1.4h3.2M-1.6 3.6h3.2', .5);

  // uzanmış uyuyan balıkçı: baş kıçta, dizler oturağın üstünde, yüzünde hasır şapka
  function uyuyan(h, s, z, o = {}) {
    const g = o.govde || '#e8e0cc', bc = o.bacak || '#3a4a6a', t = o.t || 0, hd = h.sc([s - .2, t, z + .13]);
    h.hat([[s + .34, t, z + .04], [s + .52, t + .02, z + .2], [s + .78, t + .04, z + .08]], bc, 3.2).hat([[s + .78, t + .04, z + .1], [s + .82, t + .04, z + .18]], '#5a3c28', 2);
    h.hat([[s - .08, t, z + .08], [s + .34, t, z + .05]], T(g, -.2), 5.6).hat([[s - .08, t - .01, z + .1], [s + .3, t - .01, z + .07]], g, 3.6);
    h.hat([[s + .02, t + .06, z + .1], [s + .2, t + .03, z + .12]], T(g, -.3), 2).hat([[s + .2, t + .03, z + .12], [s + .22, t + .02, z + .12]], M.ten, 2);
    h.it([s - .3, t - .1, z, s - .1, t + .1, z + .3], `<g transform="translate(${f1(hd[0])} ${f1(hd[1])})">${pth(M.ten, K.circ(0, 0, 2.7)) + pth('#c9a04e', K.ell(.6, -1.4, 4.6, 2.3)) + pth('#d9b866', K.ell(.4, -1.9, 4.2, 1.9)) + pth('#c9a04e', K.ell(.6, -2.6, 2.1, 1.3)) + pth(M.bezK, 'M-1.4 -2.4h4v.7h-4z')}</g>`);
  }

  /* ========================= SANDAL ========================= */
  CK.def('tekne-sandal', { w: 2.4, d: 1.2, name: 'Sandal' }, (b, K, opt) => {
    const sd = opt.seed || 7, r = K.rng(sd * 733 + 11), c = RENK[opt.renk === undefined ? sd % 5 : opt.renk], tur = opt.tur === undefined ? Math.floor(r() * 5) : opt.tur;
    const h = govde(b, opt, Object.assign({ L: 2, B: .8, h: .3, hb: .46, hs: .34, um: .42, tw: .62, pb: 2, ps: 2.2, rb: .14, n: 10, zf: .09, top: .9 }, c));
    const zf = h.zf, tahta = sd % 5 === 4 ? '#d9b27a' : M.ahsapA, dis = [];      // dis: dış kaplamadan sonra çizilecekler
    h.su().ic();
    const hw = h.hbz(.15, .2); h.kutu(.02, -hw, .16, .3, hw, .2, tahta);                                   // kıç oturağı
    h.oturak(.8, .22, tahta).oturak(1.32, .22, tahta).guverte(.8, 1, tahta, { dz: .04 });
    h.art(1.74, 0, h.sheer(.87) - .04, halat());
    const pala = c.ser, ic2 = (k, far) => { const a = far ? -.3 : .13 * k; return h.kurek([.36, far ? -.2 - .06 * (k > 0) : a + .06 * k, .24], [1.76, far ? -.1 - .04 * (k > 0) : a * .6, .47], pala); };
    const iskarmoz = () => { h.kurek([1.04, -.05, .3], [1.12, -.84, .5], pala); dis.push(() => h.kurek([1.0, .05, .3], [1.08, .84, .5], pala)); };
    if (tur === 0) { ic2(-1); ic2(1); h.art(1.06, .04, zf, kovaI(M.ahsap)).art(.52, -.04, zf, pth('#5a5450', 'M-4 -1q0 -3.6 4 -3.6q4.4 0 4 3.6q-4 2 -8 0z') + pth('#7a736c', 'M-3.2 -1.6q.4 -2.6 3.2 -2.6q-1.6 1.6 -1.2 3.6q-1.2 0 -2 -1z') + ln('#cdb98a', 'M2 -4q4 -3 5 2', .8)); }      // boş: kova, taş çapa
    else if (tur === 1) { h.art(.54, 0, zf, ag(8, 6.4, '#8a5444')).art(1.06, .02, zf, ag(5.6, 4.4, '#8a5444')).art(1.46, .03, zf, top3('#e8782e', 2.2)); iskarmoz(); }
    else if (tur === 2) { ic2(-1, true); ic2(1, true); b.crate.apply(b, h.G(1.06, .04, zf).concat([.3, { fill: GUMUS, cast: false }])); b.crate.apply(b, h.G(.54, 0, zf).concat([.28, { fill: BARBUN, cast: false, h: .7 }]));
      h.art(1.47, 0, zf, pth('#a8823e', 'M-3.6 -4.6h7.2l-1 4.2q-2.6 1 -5.2 0z') + pth('#c9a04e', 'M-3.6 -4.6h3l.2 4.8q-1.2 0 -2.2 -.6z') + pth(GUMUS, K.ell(0, -4.8, 3.3, 1.3)) + ln('#a8823e', 'M-3.4 -4.8Q0 -11 3.4 -4.8', .8)); }
    else if (tur === 3) { h.art(.54, 0, zf, sepetI()).art(1.06, .02, zf, sepetI()).art(.2, -.12, .2, sepetI()).art(1.47, .02, zf, top3(M.bez, 2.3) + ln(M.ahsapK, 'M0 -4V-12', .8) + pth(M.bezK, 'M0 -12l4.4 1.4l-4.4 1.6z')); iskarmoz(); }
    else { ic2(-1, true); ic2(1, true); uyuyan(h, .4, zf, { govde: sd % 2 ? '#e8e0cc' : '#c9d6dc' });
      h.art(1.47, .02, zf, kovaI(M.ahsap));
      dis.push(() => { h.hat([[.5, .22, .2], [.16, .4, .36], [-.2, .52, .74]], '#7a5a34', 1).hat([[-.2, .52, .74], [-.22, .56, .02]], '#e8e4dc', .5).art(-.22, .56, 0, pth('#d0402c', K.circ(0, -1, 1.5)) + pth('#f4f1ea', 'M-1.5 -1a1.5 1.5 0 0 1 3 0z')); }); }
    h.hat([[1.04, -h.hbz(1.04, .3) - .02, .3], [1.04, -h.hbz(1.04, .3) - .02, .38]], M.demir, 1.5);
    h.dis(); dis.forEach(f => f());
    h.hat([[1.04, h.hbz(1.04, .3) + .03, .3], [1.04, h.hbz(1.04, .3) + .03, .38]], M.demir, 1.5);
  });

  // toplanmış yelkeniyle seren: iki uç tekne koordinatında; bez sarılı, bağlarla sıkılmış
  function seren(h, A, E, col) {
    const a = h.sc(A), e = h.sc(E), dx = e[0] - a[0], dy = e[1] - a[1], l = Math.hypot(dx, dy), nx = -dy / l, ny = dx / l, at = (k, o = 0) => f1(a[0] + dx * k + nx * o) + ' ' + f1(a[1] + dy * k + ny * o); let bag = '';
    for (let i = 0; i < 8; i++) { const k = .1 + i * .114; bag += `M${at(k, -1)}L${at(k + .012, 3.6)}`; }
    return ln(T(col, -.3), `M${at(.06, 1.6)}L${at(.95, 1.6)}`, 4.2) + ln(col, `M${at(.06, .9)}L${at(.95, .9)}`, 2.6) + ln(T(col, .3), `M${at(.1, .2)}L${at(.9, .2)}`, .8) + ln(M.ahsapK, `M${at(0)}L${at(1)}`, 1.5) + ln('#5a4636', bag, .8);
  }

  /* ========================= BALIKÇI TEKNESİ ========================= */
  CK.def('tekne-balikci', { w: 3.4, d: 1.5, name: 'Balıkçı teknesi' }, (b, K, opt) => {
    const sd = opt.seed || 7, r = K.rng(sd * 419 + 5), c = RENK[opt.renk === undefined ? (sd * 3 + 1) % 5 : opt.renk];
    const h = govde(b, opt, Object.assign({ L: 3, B: 1.1, h: .42, hb: .68, hs: .58, um: .46, tw: 0, pb: 2.1, ps: 2.3, rb: .22, rs: .14, n: 10, zf: .12, top: 1.9, dumen: true, bas: .16 }, c));
    const zf = h.zf, ah = sd % 5 === 1 ? '#d9b27a' : M.ahsapA, agC = ['#8a5444', '#3f6a66', '#7a6a3e'][Math.floor(r() * 3)], bez = r() < .5 ? '#efe4c8' : '#c07a56', G = h.G;
    h.su(); b.spill(G(.2, .66)[0], G(.2, .66)[1], 1.5);
    h.ic().guverte(0, .17, ah, { perde: true }).oturak(1.62, .3, ah).guverte(.7, 1, ah);
    // kıç güvertesi: ağ yığını, şamandıralar, işaret şamandıraları (flamalı sırıklar), yeke
    h.hat([[.16, -.3, .5], [.02, -.44, 1.5]], M.ahsapK, 1).hat([[.3, -.36, .48], [.24, -.52, 1.28]], M.ahsapK, 1);
    h.art(.02, -.44, 1.5, pth(M.bezK, 'M0 0l5.4 1.7l-5.4 1.9z')).art(.24, -.52, 1.28, pth('#2a2c33', 'M0 0l5 1.5l-5 1.7z')).art(.09, -.37, 1.0, pth(MANTAR, K.ell(0, 0, 1.7, 2.2))).art(.27, -.44, .88, pth(MANTAR, K.ell(0, 0, 1.6, 2.1)));
    h.art(.3, -.02, .46, ag(11.5, 8.6, agC), [.02, -.36, .44, .58, .36, .86]);
    h.art(.5, .2, .47, top3('#e8782e', 2.5)).art(.12, .12, .5, top3('#f4f1ea', 2.2));
    h.hat([[-.03, 0, .68], [.5, .06, .64]], M.ahsapK, 1.5);
    // ambar: balık kasaları, halat, balıkçı
    const kasa = (s, t, z, sz, fill) => b.crate(G(s, t)[0], G(s, t)[1], z, sz, { fill, cast: false });
    kasa(.86, -.2, zf, .34, GUMUS); kasa(.9, .2, zf, .3, BARBUN); kasa(1.26, -.06, zf, .32, '#9fb4c4'); kasa(.86, -.2, zf + .27, .26, '#c9d4dc');
    h.art(1.3, .3, zf, halat());
    if (r() < .7) b.fig(G(1.92, .12)[0], G(1.92, .12)[1], zf, { body: ['#c9d6dc', '#b8694a', '#e8e0cc', '#4f7d8a'][Math.floor(r() * 4)], legs: '#3a4a6a', hat: r() < .6 ? 'hasir' : 'fes', carry: 'balik' });
    else b.critter('kedi', G(1.3, .02)[0], G(1.3, .02)[1], zf + .26, { col: r() < .5 ? '#e0903a' : '#5a5450' });
    // baş güverte: çapa, halat; direk, arka çarmıh, toplanmış latin yelkeni
    const zd = h.sheer(.84) - .05;
    h.art(2.6, .04, zd, ln(M.demir, 'M-5 1.6L4 -2.6M-5 1.6q-2.6 -2.2 -.4 -4.6M-5 1.6q-.6 3 3 3.6M4 -2.6l2 .2', 1.1) + pth(M.demir, K.circ(4.6, -2.8, 1.1))).art(2.38, -.2, zd - .04, halat());
    h.hat([[2.26, 0, 1.6], [2.06, -.5, .46]], '#4a3a34', .6).hat([[2.26, 0, .42], [2.26, 0, 1.64]], T(M.ahsapK, .1), 2.3);
    const A = [3.12, 0, 1.0], E = [.98, -.1, 1.58];
    h.it([.98, -.1, 1.0, 3.12, 0, 1.6], seren(h, A, E, bez)).hat([[2.26, 0, 1.62], [2.26, -.03, 1.25]], '#4a3a34', .7);
    b.critter('marti', G(2.26, 0)[0], G(2.26, 0)[1], 1.66);
    h.dis();
    h.hat([[2.26, 0, 1.6], [2.06, .5, .47]], '#4a3a34', .6).hat([[2.26, 0, 1.6], [3.26, 0, .84]], '#4a3a34', .6);
    for (const u of [.34, .6]) { const p = h.pt(u, 1, 1); h.art(p[0], p[1] + .02, p[2] - .03, usturmaca(MANTAR)); }
    // gece avı feneri: kıç omuzlukta demir kolda asılı
    h.hat([[.24, .22, .5], [.22, .24, 1.3], [.2, .4, 1.42], [.2, .58, 1.38]], M.demir, 1.3);
    h.art(.2, .58, 1.38, ln(M.demir, 'M0 0V3', .8) + `<g transform="translate(0 7.4)">${fener()}</g>`, [.1, .5, 1.0, .3, .68, 1.4]);
  });

  // çizgili tente: s0..s1 boyunca, mahyası ortada; şeritler enine
  function tente(h, s0, s1, tw, ze, zr, cols) {
    const k = kova(), nS = Math.max(4, Math.round((s1 - s0) / .21)), tA = h.tn([0, -(zr - ze), tw]), tB = h.tn([0, zr - ze, tw]), tV = h.tn([0, 1, 0]) - .12;
    for (let i = 0; i < nS; i++) { const a = s0 + (s1 - s0) * i / nS, e = s0 + (s1 - s0) * (i + 1) / nS, col = cols[i % 2];
      k.add(F(T(col, tA)), 'M' + h.PL([[a, 0, zr], [e, 0, zr], [e, -tw, ze], [a, -tw, ze]]) + 'Z');
      k.add(F(T(col, tB)), 'M' + h.PL([[a, 0, zr], [e, 0, zr], [e, tw, ze], [a, tw, ze]]) + 'Z');
      k.add(F(T(col, tV)), 'M' + h.PL([[a, tw, ze], [e, tw, ze], [e, tw, ze - .09], [(a + e) / 2, tw, ze - .15], [a, tw, ze - .09]]) + 'Z'); }
    // pruvaya bakan uç: saçak dilimleri
    const nT = 6; for (let i = 0; i < nT; i++) { const a = -tw + 2 * tw * i / nT, e = -tw + 2 * tw * (i + 1) / nT, za = zr - (zr - ze) * Math.abs(a) / tw, zb = zr - (zr - ze) * Math.abs(e) / tw;
      k.add(F(T(cols[(i + 1) % 2], h.tn([1, 0, 0]) - .06)), 'M' + h.PL([[s1, a, za], [s1, e, zb], [s1, e, zb - .09], [s1, (a + e) / 2, (za + zb) / 2 - .15], [s1, a, za - .09]]) + 'Z'); }
    h.it([s0, -tw, ze - .15, s1, tw, zr], k.svg() + ln(T(cols[1], .3), 'M' + h.PL([[s0, 0, zr], [s1, 0, zr]]), 1.2));
  }

  /* ========================= MAVNA ========================= */
  CK.def('tekne-mavna', { w: 5.1, d: 2, name: 'Mavna' }, (b, K, opt) => {
    const sd = opt.seed || 7, r = K.rng(sd * 271 + 3), kk = opt.renk === undefined ? sd % 4 : opt.renk;
    const ser = [M.hardal, '#3f7fb0', '#b84a3b', M.turkuaz][kk], tc = [[M.bezK, M.bez], [M.bezM, M.bez], [M.bezS, M.bez], [M.bezY, M.bez]][(kk + 1 + Math.floor(r() * 3)) % 4];
    const h = govde(b, opt, { L: 4.4, B: 1.6, h: .34, hb: .52, hs: .44, um: .5, tw: .8, pb: 3.2, ps: 2, rb: .1, n: 12, zf: .12, wl: .8, m0: .5, top: 1.6, bas: .1, boya: '#6f5642', ser, kar: '#3a302a', ic: '#b9935f', cap: '#8a6238', dos: '#a8845a' });
    const zf = h.zf, at = (s, t) => h.G(s, t), sA = 1.33, sB = 2.87, ze = 1.2, zr = 1.42, dir = M.ahsapK;
    h.su({ dalga: [[.05, .26, .15, 1], [.4, .7, .12, 1], [.24, .44, .27, 1], [.74, .96, .22, 1], [.9, 1.05, .17, -1], [-.2, -.12, .1, 1]] });
    h.ic().guverte(0, .13, '#a8845a', { perde: true }).guverte(.86, 1, '#a8845a');
    // tente çatkısı (arka dikmeler, makaslar)
    for (const s of [sA, sB]) h.hat([[s, -.7, zf], [s, -.7, ze]], dir, 1.6).hat([[s, -.7, ze], [s, 0, zr], [s, .7, ze]], dir, 1.3);
    // kıç açıklığı: çuvallar, halat
    const cuval = (s, t, z, col) => b.sack(at(s, t)[0], at(s, t)[1], z, { col }), fici = (s, t, z, o) => b.barrel(at(s, t)[0], at(s, t)[1], z, Object.assign({ cast: false }, o)), kasa = (s, t, z, sz, fill, o) => b.crate(at(s, t)[0], at(s, t)[1], z, sz, Object.assign({ fill, cast: false }, o));
    cuval(.82, -.3, zf); cuval(.98, .34, zf, '#cdb98a'); cuval(.8, .1, zf, '#e0d2a8'); h.art(1.1, -.02, zf, halat());
    // tente altı: fıçılar, büyük sandıklar, çuval yığını
    kasa(1.72, -.38, zf, .5, null); kasa(1.74, -.38, zf + .4, .34, '#c9b58a'); kasa(2.3, -.42, zf, .42, null);
    fici(1.52, .46, zf); fici(1.56, .02, zf, { r: .22, h: .5 }); fici(1.94, .44, zf, { col: '#8a5a34' }); fici(1.98, .06, zf);
    cuval(2.36, .46, zf); cuval(2.62, .44, zf, '#cdb98a'); cuval(2.5, .16, zf, '#e0d2a8'); cuval(2.7, .08, zf); cuval(2.48, .34, zf + .2, '#d9c79a');
    // pruva açıklığı: amforalar, narenciye ve zeytin sandıkları
    kasa(3.16, -.36, zf, .44, '#e8943a'); kasa(3.58, -.28, zf, .36, '#7fa35e'); kasa(3.18, -.36, zf + .35, .3, '#e6cf5a');
    const kil = [M.kiremitA, '#c98a5e', '#b9744a'];
    [[3.08, .06], [3.3, .08], [3.52, .06], [3.0, .36], [3.22, .38], [3.44, .36], [3.66, .3]].forEach(([s, t], i) => h.art(s, t, zf, amfora(kil[i % 3])));
    // kıçta dümenci ve uzun dümen küreği; pruvada tayfa, babalar
    h.hat([[.05, 0, .38], [.05, 0, .62]], dir, 2.2);
    b.fig(at(.3, -.1)[0], at(.3, -.1)[1], .39, { body: [M.bezM, '#8a5a3a', '#4f7d5a', M.kirmizi][Math.floor(r() * 4)], legs: '#4a3a34', hat: r() < .5 ? 'fes' : 'sarik' });
    h.hat([[.46, .08, .92], [.05, 0, .63], [-.42, -.1, .29]], M.ahsapA, 1.6).hat([[-.42, -.1, .29], [-.8, -.18, .02]], '#d9c79a', 3);
    const zb = h.sheer(.92) - .05;
    h.hat([[4.02, -.16, zb], [4.02, -.16, zb + .16]], dir, 2.4).hat([[4.02, .16, zb], [4.02, .16, zb + .16]], dir, 2.4);
    b.fig(at(3.84, .0)[0], at(3.84, .0)[1], zf, { body: '#e8e0cc', legs: '#3a4a6a', hat: 'hasir', carry: 'kasa' });
    h.dis();
    for (const s of [sA, sB]) h.hat([[s, .7, .37], [s, .7, ze]], dir, 1.6);
    tente(h, sA - .14, sB + .14, .84, ze, zr, tc);
    for (const u of [.2, .46, .72]) { const p = h.pt(u, 1, 1); h.art(p[0], p[1] + .02, p[2] - .03, usturmaca('#b08a52')); }
  });

  // dolu yelken: tack (karula), throat (boğaz), peak (cunda), clew (ıskota) köşeleri [s, z]; rüzgâr bize bakan bordadan, bez öte yana bel verir
  function yelkenBez(h, o) {
    const { tack, throat, peak, clew, acik = .34, bel = .17, n = 5, col = '#f0e6cc', ser } = o, k = kova(), V = [0, .3, .56, .7, 1], BF = [0, .8, 1, 1, .8]; let seam = '', kenar = '', camadan = '';
    const lp = (a, e, f) => [a[0] + (e[0] - a[0]) * f, a[1] + (e[1] - a[1]) * f];
    const X = (a, v) => { const tp = lp(throat, peak, a), bt = lp(tack, clew, a), q = lp(tp, bt, v), sag = Math.sin(Math.PI * a), i = Math.min(3, Math.floor(v * 3.999)), bf = v <= 0 ? 0 : v >= 1 ? .8 : .8 + .2 * Math.sin(Math.PI * v);
      return [q[0], -acik * a * (.6 + .4 * v) - bel * sag * bf, q[1] - (v >= 1 ? .06 * sag : 0)]; };
    const tn = nn => h.tn(nn) * .45 + .04;
    for (let i = 0; i < n; i++) for (let j = 0; j < 4; j++) { const A = X(i / n, V[j]), Bq = X((i + 1) / n, V[j]), C = X((i + 1) / n, V[j + 1]), D = X(i / n, V[j + 1]), nn = cross(sub(C, A), sub(D, Bq));
      k.add(F(T(j === 2 ? ser : col, Math.max(tn(nn), tn(nn.map(v => -v))) - (j === 2 ? .04 : 0))), 'M' + h.PL([A, Bq, C, D]) + 'Z'); }
    for (let i = 1; i < n; i++) seam += 'M' + h.PL(V.map(v => X(i / n, v)));
    for (let i = 0; i < n * 2; i++) { const a = (i + .5) / (n * 2); camadan += 'M' + h.PL([X(a, .82), X(a, .875)]); }
    const kn = []; for (let i = 0; i <= n; i++) kn.push(X(1 - i / n, 1)); kenar = 'M' + h.PL(V.map(v => X(1, v)).concat(kn.slice(1)));
    if (o.arma) { const m = o.arma; k.add(F(T(ser, tn([0, 1, 0]) - .02)), 'M' + h.PL([X(m[0], m[1] - .1), X(m[0] + .1, m[1]), X(m[0], m[1] + .1), X(m[0] - .1, m[1])]) + 'Z'); }
    return { X, svg: k.svg() + ln(T(col, -.2), seam, .6) + ln(T(col, -.34), camadan, .8) + ln(T(col, -.3), kenar, .8) };
  }

  /* ========================= YELKENLİ (seyirde) ========================= */
  CK.def('tekne-yelken', { w: 3.55, d: 1.5, name: 'Yelkenli' }, (b, K, opt) => {
    const sd = opt.seed || 7, r = K.rng(sd * 613 + 7), c = RENK[opt.renk === undefined ? (sd * 2 + 3) % 5 : opt.renk], lug = opt.tur === undefined ? sd % 2 === 0 : !!opt.tur;
    const ser = [M.bezK, M.bezM, '#d08a2e', M.bezY, M.bezMor][Math.floor(r() * 5)], at = (s, t) => h.G(s, t);
    const h = govde(b, opt, Object.assign({ L: 2.8, B: 1, h: .4, hb: .62, hs: .5, um: .45, tw: .36, pb: 2.1, ps: 2.2, rb: .2, n: 10, zf: .11, m0: .45, m1: .3, mt: .25, top: 3.1, dumen: true, bas: .14 }, c));
    const zf = h.zf, ms = 1.78, mz = lug ? 2.5 : 2.08, P = h.P;
    const Y = yelkenBez(h, lug ? { tack: [2.22, .68], throat: [2.32, 1.98], peak: [.86, 2.72], clew: [.42, .86], ser, arma: r() < .6 ? [.5, .22] : null }
      : { tack: [2.86, .86], throat: [2.84, 1.0], peak: [.62, 2.92], clew: [.4, .86], ser, acik: .3, arma: r() < .6 ? [.62, .26] : null });
    // su: pruva köpüğü, bordadan açılan dalga, kıçta dümen suyu
    h.su({ dalga: [[.5, .8, .2, 1], [.1, .45, .3, 1], [-.14, .1, .34, 1], [-.16, -.02, .1, -1]], pts: [Y.X(0, 0), Y.X(1, 0), Y.X(1, 1), Y.X(0, 1)].map(p => h.G(p[0], p[1], p[2])) });
    let kp = ''; for (const sg of [1, -1]) kp += `M${P([2.98, 0, 0])}Q${P([2.6, sg * .34, 0])} ${P([1.9, sg * .66, 0])}Q${P([2.3, sg * .44, 0])} ${P([2.8, sg * .1, 0])}Z`;
    b.ground(pth(M.kopuk, kp, 'opacity=".85"') + pth(M.kopuk, `M${P([.02, .2, 0])}Q${P([-.3, .06, 0])} ${P([-.68, .16, 0])}Q${P([-.36, -.04, 0])} ${P([.02, -.2, 0])}Z`, 'opacity=".5"')
      + ln(M.kopuk, `M${P([-.1, .3, 0])}L${P([-.66, .46, 0])}M${P([-.1, -.3, 0])}L${P([-.6, -.4, 0])}M${P([-.3, 0, 0])}L${P([-.72, .02, 0])}`, .8, 'opacity=".7"'));
    h.ic().guverte(0, .13, M.ahsapA, { perde: true }).oturak(1.22, .3).guverte(.74, 1, M.ahsapA);
    // yelken, seren, direk
    h.it([.3, -.6, .6, 2.9, -.02, 3], Y.svg);
    const y0 = Y.X(-.06, 0), y1 = Y.X(1.05, 0);
    h.hat([[y0[0], y0[1], y0[2]], [y1[0], y1[1], y1[2]]], M.ahsapK, 1.8);
    h.hat([[ms, 0, zf], [ms, 0, mz]], T(M.ahsapK, .1), 2.3).hat([[ms, 0, mz], [1.5, -.48, .44]], '#4a3a34', .6);
    h.art(ms, 0, mz, `<g transform="scale(${h.dy ? -1 : 1} 1)">${pth(ser, 'M0 -1Q5 -3.6 10 -1.6Q6 -.4 0 2.4Z') + pth(T(ser, -.25), 'M4 -2.2Q7 -2.6 10 -1.6Q7 -.9 4.4 .4Z')}</g>` + pth(M.altin, K.circ(0, -.6, 1.2)));
    const cl = Y.X(1, 1); h.hat([[cl[0], cl[1], cl[2]], [.3, -.1, .56]], '#4a3a34', .6);
    // içi: sandık, sepet, halat; kıçta yekeyi tutan dümenci
    b.crate(at(1.52, -.14)[0], at(1.52, -.14)[1], zf, .3, { fill: [GUMUS, '#e8943a', BARBUN][Math.floor(r() * 3)], cast: false });
    h.art(1.0, .16, zf, halat()).art(.84, -.2, zf, kovaI(M.ahsap));
    h.hat([[-.03, 0, .62], [.36, .08, .58]], M.ahsapK, 1.5);
    b.fig(at(.46, .14)[0], at(.46, .14)[1], zf, { body: [M.bezM, '#b8694a', '#e8e0cc', '#4f7d5a'][Math.floor(r() * 4)], legs: '#4a3a34', hat: r() < .5 ? 'fes' : 'hasir' });
    h.dis();
    h.hat([[ms, 0, mz], [1.5, .48, .45]], '#4a3a34', .6).hat([[ms, 0, mz], [3.04, 0, .78]], '#4a3a34', .6);
  });
})();
