/* Derinsu — şehir planı: arazi, teraslar, liman, surlar ve yapıların yerleşimi.
   K.city(opt) → { x, y, w, h, ground, body, fx, tags, sprites, paths, ambient, moor, home }
   Dünya koordinatı ekran pikselidir: ızgaranın (0,0,0) noktası (0,0)'a düşer.

   Şehir, köşesinden bakılan basamaklı bir yamaçtır: en arkada iç kale (K), önünde yukarı mahalle (A),
   onun önünde çarşı terası (B), en önde liman (C). Her teras bir üsttekinin ön köşesini sarar; iki kolu
   ekranda sola-aşağı ve sağa-aşağı uzanır, ortada meydan kalır. Solda dere vadisi ve kumsal, sağ üstte ova. */
(function (K) {
  'use strict';
  const { M, pr, P, PL, f1, f2, tone, toneOf, kf, ks, U, ZU, rng, Face, Builder, circ, ell, DEF, pth, ln } = K;
  const Z = { K: 7.2, A: 4.8, B: 2.4, C: 0, W: -.55 };
  const WORLD = { x: -1000, y: -470, w: 2000, h: 1900 };
  const GRID = 'matrix(24 12 -24 12 0 0)';       // ızgara birimi → ekran (desenler ızgara biriminde çizilir)

  /* ---------- desenler ---------- */
  // düzensiz taş döşeme: n×n taş, size birim; kenarlarda kusursuz yinelenir
  const stonePat = (id, n, size, seed, o = {}) => DEF(id, () => {
    const r = rng(seed), c = size / n, jit = o.jit === undefined ? .26 : o.jit, base = [];
    for (let i = 0; i < n; i++) { base.push([]); for (let j = 0; j < n; j++) base[i].push([(r() - .5) * jit * 2 * c, (r() - .5) * jit * 2 * c]); }
    const pt = (i, j) => { const b = base[((i % n) + n) % n][((j % n) + n) % n]; return [i * c + b[0], j * c + b[1]]; };
    let lns = '', li = '', dk = '';
    for (let i = -1; i <= n; i++) for (let j = -1; j <= n; j++) { const q = [pt(i, j), pt(i + 1, j), pt(i + 1, j + 1), pt(i, j + 1)], d = 'M' + q.map(p => f2(p[0]) + ' ' + f2(p[1])).join(' ') + 'Z', t = rng(seed + (((i % n) + n) % n) * 31 + (((j % n) + n) % n) * 57)();
      lns += d; if (t < (o.li || .16)) li += d; else if (t > 1 - (o.dk || .13)) dk += d; }
    return `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${size}" height="${size}" patternTransform="${GRID}"><path d="${li}" fill="#fff" opacity="${o.lo || .1}"/><path d="${dk}" fill="#2a1c10" opacity="${o.do || .07}"/><path d="${lns}" fill="none" stroke="#3a2a18" stroke-opacity="${o.so || .2}" stroke-width="${o.sw || .034}"/></pattern>`;
  });
  // kesme taş sıraları (rıhtım)
  const ashlarPat = (id, rh, bw, o = {}) => DEF(id, () => `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${bw * 2}" height="${rh * 2}" patternTransform="${GRID}"><path d="M0 ${rh}H${bw * 2}M0 ${rh * 2}H${bw * 2}M${bw * .5} 0V${rh}M${bw * 1.5} 0V${rh}M0 ${rh}V${rh * 2}M${bw} ${rh}V${rh * 2}" fill="none" stroke="#3a2a18" stroke-opacity="${o.so || .17}" stroke-width=".034"/><rect x="${bw * .5}" y="0" width="${bw}" height="${rh}" fill="#fff" opacity=".06"/></pattern>`);
  // tarla sıraları: rot verilirse y boyunca
  const rowPat = (id, step, o = {}) => DEF(id, () => `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${step}" height="${step}" patternTransform="${GRID}${o.rot ? ' rotate(90)' : ''}"><rect y="${f2(step * .3)}" width="${step}" height="${f2(step * .42)}" fill="${o.col || '#3a2a18'}" opacity="${o.op || .14}"/></pattern>`);
  const wavePat = () => DEF('ckwv', () => { const r = rng(91); let d = '', e = '';
    for (let i = 0; i < 9; i++) { const x = r() * 150, y = 6 + r() * 76, w = 7 + r() * 9, s = `M${f1(x)} ${f1(y)}q${f1(w / 2)} -2.6 ${f1(w)} 0`; if (i % 3) d += s; else e += s; }
    return `<pattern id="ckwv" patternUnits="userSpaceOnUse" width="170" height="90"><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".2" stroke-width="1.1" stroke-linecap="round"/><path d="${e}" fill="none" stroke="#0c3a52" stroke-opacity="${.16}" stroke-width="1.1" stroke-linecap="round"/></pattern>`; });
  const grassPat = () => DEF('ckgr', () => { const r = rng(17); let d = '', e = '';
    for (let i = 0; i < 26; i++) { const x = r() * 96, y = r() * 60; if (i % 2) d += `M${f1(x)} ${f1(y)}l-1 -2.6M${f1(x + 1.6)} ${f1(y)}l.6 -3`; else e += circ(x, y, 1.4 + r() * 2.2); }
    return `<pattern id="ckgr" patternUnits="userSpaceOnUse" width="96" height="60"><path d="${e}" fill="#fff" opacity=".05"/><path d="${d}" fill="none" stroke="#2f4a22" stroke-opacity=".2" stroke-width=".8" stroke-linecap="round"/></pattern>`; });

  // yumuşak eğri: noktalar ızgarada (proj verilmezse) ya da ekranda
  const smooth = (pts, z = 0, closed = true, scr = false) => { const n = pts.length, at = i => closed ? pts[((i % n) + n) % n] : pts[Math.max(0, Math.min(n - 1, i))], Q = (x, y) => scr ? f1(x) + ' ' + f1(y) : P(x, y, z); let d = 'M' + Q(pts[0][0], pts[0][1]);
    for (let i = 0; i < (closed ? n : n - 1); i++) { const p0 = at(i - 1), p1 = at(i), p2 = at(i + 1), p3 = at(i + 2);
      d += `C${Q(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)} ${Q(p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)} ${Q(p2[0], p2[1])}`; }
    return d + (closed ? 'Z' : ''); };
  // orta çizgiden şerit (dere, yol): pts [[x,y,(en)],...]
  const ribbon = (pts, w) => { const L = [], Rr = []; for (let i = 0; i < pts.length; i++) { const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)], dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1, ww = (pts[i][2] || w) / 2;
    L.push([pts[i][0] - dy / l * ww, pts[i][1] + dx / l * ww]); Rr.push([pts[i][0] + dy / l * ww, pts[i][1] - dx / l * ww]); } return L.concat(Rr.reverse()); };

  // şamandıra: liman ağzını işaretleyen küçük duba (suda salınır)
  K.def('duba', { w: .7, d: .7 }, (b, K2, o) => { const c = (o.seed || 0) % 2 ? '#c0473a' : '#2f8f6a';
    b.ground(`<ellipse cx="0" cy="8.4" rx="9" ry="3.6" fill="#0c3a52" opacity=".22"/>`);
    b.art(.35, .35, 0, pth(tone(c, -.2), 'M-5 0Q-5.6 -7 0 -8Q5.6 -7 5 0Q0 2.6 -5 0Z') + pth(c, 'M-5 0Q-5.6 -7 0 -8L0 1.4Q-3 1.2 -5 0Z') + pth('#f2ead8', 'M-4.9 -2.4Q0 -.4 4.9 -2.4L5 -.2Q0 2 -5 -.2Z') + ln(M.demir, 'M0 -8V-15', 1.1) + pth('#ffe9a8>#fff2b8', circ(0, -16, 1.7)), { bb: [0, 0, 0, .7, .7, .7] }); });

  K.city = (opt = {}) => {
    const seed = opt.seed || 7, R = rng(seed);
    const G = [], SH = [], fx = [], tags = [], sprites = [], paths = [], ambient = [];
    const W = new Builder({ seed });                        // yapı katmanı: dünya ölçeğinde derinlik sıralaması
    const T = new Builder({ seed: seed + 1 });              // arazi katıları (merdiven, payanda): zemin katmanına gider
    const gp = (pts, col, extra = '') => `<path class="${kf(col)}"${extra} d="M${PL(pts)}Z"/>`;
    const rc = (x0, y0, x1, y1, z) => [[x0, y0, z], [x1, y0, z], [x1, y1, z], [x0, y1, z]];
    const pat = (pts, id, extra = '') => `<path fill="url(#${id})"${extra} d="M${PL(pts)}Z"/>`;
    const wallL = (x0, x1, y, z0, z1, mat) => new Face([x0, y, z0], [1, 0, 0], [0, 0, 1], x1 - x0, z1 - z0, [0, 1, 0]).fill(mat);
    const wallR = (x, y0, y1, z0, z1, mat) => new Face([x, y1, z0], [0, -1, 0], [0, 0, 1], y1 - y0, z1 - z0, [1, 0, 0]).fill(mat);
    const pCobble = stonePat('ckp1', 7, 4.2, 11), pFlag = stonePat('ckp2', 4, 5.2, 23, { jit: .2, so: .16 }), pSmall = stonePat('ckp3', 9, 3.6, 37, { jit: .3 }),
      pQuay = ashlarPat('ckp4', .9, 1.7), pWave = wavePat(), pGrass = grassPat(),
      pRowX = rowPat('ckr1', .5), pRowY = rowPat('ckr2', .5, { rot: 1 }), pVineX = rowPat('ckr3', .8, { col: '#2f5a2a', op: .34 }), pVineY = rowPat('ckr4', .8, { col: '#2f5a2a', op: .34, rot: 1 });
    const { x: wx, y: wy, w: ww, h: wh } = WORLD;
    const field = (x0, y0, x1, y1, z, col, pid) => { const q = rc(x0, y0, x1, y1, z); G.push(gp(q, col) + (pid ? pat(q, pid) : '') + `<path class="Ln ${ks(tone(col, -.22))}" stroke-width="1" d="M${PL(q)}Z"/>`); };

    /* ================= DENİZ ================= */
    G.push(`<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" class="${kf(M.suK)}"/>`);
    const sh = (pts, col, op) => G.push(gp(pts.map(p => [p[0], p[1], Z.W]), col, op ? ` opacity="${op}"` : ''));
    sh([[18, 54.4], [48.4, 54.4], [51.4, 54.4], [55.4, 54.4], [58, 57.2], [14, 57.2]], M.su, .75); sh([[54.4, 18], [57.2, 15], [58, 57.2], [55.4, 54.4]], M.su, .75);
    sh([[45.5, 45.5], [53, 45.5], [53, 50.4], [51.4, 50.4], [51.4, 54.4], [48.4, 54.4], [48.4, 53], [45.5, 53]], M.su); sh([[45.5, 45.5], [53, 45.5], [53, 47], [47, 47], [47, 53], [45.5, 53]], M.suA, .55);
    G.push(`<rect x="${wx}" y="${wy}" width="${ww}" height="${wh}" fill="url(#${pWave})"/>`);

    /* ================= ALÇAK ARAZİ: sol vadi ve kumsal, sağ kayalık kıyı ================= */
    const shoreL = [[20, 54.6], [17.5, 55.2], [13.5, 53.6], [9, 52.2], [4.5, 52.6], [.5, 54.4], [-3.5, 57.4], [-8, 61.5], [-14, 66], [-70, 66], [-70, -70], [0, -70], [0, 38], [20, 38]];
    G.push(`<path class="${kf(M.suA)}" opacity=".55" d="${smooth([[21, 56], [17, 57], [13, 55.4], [9, 54], [4.5, 54.4], [1, 56.2], [-3, 59.2], [-8, 63.6], [-13, 68], [-30, 68], [-30, 50], [0, 45], [21, 50]], Z.W)}"/>`);
    G.push(`<path class="${kf(M.kopuk)}" opacity=".85" d="${smooth([[20.6, 55], [17.4, 55.8], [13.4, 54.2], [9, 52.8], [4.5, 53.2], [.8, 55], [-3.2, 58], [-7.6, 62.2], [-13.4, 66.8], [-30, 67], [-30, 50], [0, 45], [20, 50]], Z.W)}"/>`);
    G.push(`<path class="${kf(M.kum)}" d="${smooth(shoreL.slice(0, 9), 0, false)}L${PL(shoreL.slice(9))}Z"/>`);
    G.push(`<path class="${kf(tone(M.kum, -.1))}" opacity=".6" d="${smooth([[19.6, 53.6], [17.4, 54.2], [13.4, 52.6], [9, 51.2], [4.5, 51.6], [.2, 53.4], [-4, 56.4], [-8.6, 60.6], [-14.6, 65.2], [-13, 66.4], [-7.4, 62], [-3, 57.8], [.8, 54.8], [4.6, 53], [9, 52.6], [13.4, 54], [17.4, 55.6], [20, 55]], 0)}"/>`);
    const grassL = [[20, 38], [20, 47.8], [15, 48.6], [10, 47], [5.5, 46.8], [2, 48.2], [-1.5, 50.8], [-5, 54.2], [-10, 59.2], [-16, 64.2], [-70, 64.2], [-70, -70], [0, -70], [0, 38]];
    G.push(`<path class="${kf(M.cim)}" d="${smooth(grassL, 0)}"/><path fill="url(#${pGrass})" d="${smooth(grassL, 0)}"/>`);
    { const r = rng(seed + 21), blob = (x, y, rr, z, col, op) => { const pts = []; for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283, q = rr * (.7 + r() * .5); pts.push([x + Math.cos(a) * q * 1.5, y + Math.sin(a) * q]); } G.push(`<path class="${kf(col)}" opacity="${op}" d="${smooth(pts, z)}"/>`); };
      for (let i = 0; i < 26; i++) { const x = -44 + r() * 42, y = -30 + r() * 78; if (y > 36 && x > -6) continue; blob(x, y, 1.6 + r() * 2.6, 0, r() < .5 ? M.cimA : M.cimK, .34); } }
    // dere: dağdan gelir, kemerin altından geçip koya dökülür
    const river = [[-36, -27, 1.2], [-29, -16.5, 1.4], [-23, -10.5, 1.5], [-21.6, -3.4, 1.4], [-18.3, 1.3, 1.6], [-16.4, 6.4, 1.5], [-15.6, 10.6, 1.7], [-13.3, 15.2, 1.6], [-12.9, 20.6, 1.8], [-10.5, 24.6, 1.7], [-9.3, 27.6, 1.7], [-9.7, 31.6, 1.9], [-7.3, 36.4, 1.8], [-5.9, 41, 2.1], [-2.7, 45.8, 2.3], [-.5, 50, 2.9], [2.3, 54, 4.2]];
    G.push(`<path class="${kf('#d9cfa4')}" d="${smooth(ribbon(river.map(p => [p[0], p[1], p[2] + 1]), 2), 0)}"/><path class="${kf(M.su)}" d="${smooth(ribbon(river, 1.6), -.05)}"/><path class="${kf(M.suA)}" opacity=".6" d="${smooth(ribbon(river.map(p => [p[0] - .12, p[1], p[2] * .4]), .6), -.05)}"/>`);
    // değirmen suyunun döküldüğü gölcük ve arkı
    G.push(`<path class="${kf(M.su)}" d="${smooth([[1.2, 38.3], [3.6, 38.3], [4.2, 40.2], [3.2, 41.6], [3.4, 45], [2.2, 49.6], [.8, 50.6], [1.6, 45], [1.4, 41.8], [.6, 40.2]], -.03)}"/><path class="${kf(M.kopuk)}" opacity=".8" d="${smooth([[1.6, 38.4], [3.2, 38.4], [3.5, 39.4], [2.4, 40], [1.3, 39.4]], -.02)}"/>`);
    fx.push({ t: 'fall', x: 2.2, y: 38.02, z: Z.B - .15, w: .62, h: 2.25 });
    // vadi tarlaları
    field(-15, 1, -10.5, 8, 0, '#d9c46a', pRowX); field(-20.5, -8, -15.6, 0, 0, '#9cba62', pRowY); field(-9.8, 9.5, -6.4, 15.5, 0, '#8fae5a', pRowX); field(-26, 2, -21.4, 10, 0, '#b79ad0', pRowX);
    field(-5.6, 2, -1.6, 9, 0, '#86a558', pVineY); field(-5.6, 10, -1.6, 20, 0, '#7f9f52', pVineY); field(-4.8, -9, -1, -1.2, 0, '#d2b860', pRowY); field(-5.4, 29.6, -1.6, 36.6, 0, '#9cba62', pRowX);
    const shoreR = [[54.6, 20], [54.8, 17], [53.4, 13.5], [51.4, 9.5], [50, 5], [48.6, .5], [47.4, -5], [46.4, -12], [46, -70], [38, -70], [38, 20]];
    G.push(`<path class="${kf(M.suA)}" opacity=".5" d="${smooth([[56.6, 20.6], [56.8, 16.6], [55.4, 12.8], [53.4, 8.8], [52, 4.4], [50.6, 0], [49.4, -5.6], [48.4, -12.6], [48, -70], [38, -70], [38, 20.6]], Z.W)}"/>`);
    G.push(`<path class="${kf('#b7ad8c')}" d="${smooth(shoreR.slice(0, 8), .1, false)}L${PL(shoreR.slice(8).map(p => [p[0], p[1], .1]))}Z"/>`);
    const grassR = [[38, 20], [50.2, 19.6], [51.6, 16], [50.4, 12], [48.6, 8], [47.2, 3.6], [45.8, -1.5], [44.8, -8], [44.4, -70], [38, -70]];
    G.push(`<path class="${kf(M.cimK)}" d="${smooth(grassR, .1)}"/><path fill="url(#${pGrass})" d="${smooth(grassR, .1)}"/>`);

    /* ================= SAĞ ÜST OVA (çarşı terasıyla aynı kot) ================= */
    const plain = [[-6, -70, Z.B], [38, -70, Z.B], [38, 0, Z.B], [-6, 0, Z.B]];
    G.push(gp(plain, M.cim) + pat(plain, pGrass));
    { const r = rng(seed + 22), blob = (x, y, rr, col, op) => { const pts = []; for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283, q = rr * (.7 + r() * .5); pts.push([x + Math.cos(a) * q * 1.5, y + Math.sin(a) * q]); } G.push(`<path class="${kf(col)}" opacity="${op}" d="${smooth(pts, Z.B)}"/>`); };
      for (let i = 0; i < 22; i++) blob(-4 + r() * 40, -44 + r() * 42, 1.6 + r() * 2.6, r() < .5 ? M.cimA : M.cimK, .34); }
    // ovanın güney kenarı: surun dibine inen yamaç
    G.push(gp([[-6, 0, Z.B], [0, 0, Z.B], [0, 1.8, 0], [-6, 1.8, 0]], tone(M.cim, .1)));
    field(24.6, -9.6, 31.4, -3.4, Z.B, '#dcc66c', pRowX); field(15.4, -8.8, 23.4, -2.6, Z.B, '#9cba62', pRowY); field(35.2, -21, 37.6, -11.2, Z.B, '#86a558', pVineY);
    field(24, -22, 30.6, -12.6, Z.B, '#b79ad0', pRowY); field(8, -12, 14, -3, Z.B, '#d9c46a', pRowX); field(34.6, -31, 37.6, -22.4, Z.B, '#c9b45e', pRowX); field(13, -24, 21, -14, Z.B, '#8fae5a', pRowY);
    // kapıdan çıkan yol
    const road = [[33.7, .4], [33.7, -5], [32.6, -11], [32.9, -17], [31.6, -24], [32.4, -32], [30, -44]];
    G.push(`<path class="${kf('#c9b184')}" d="${smooth(ribbon(road, 1.7), Z.B)}"/><path class="Ln ${ks('#b39a6c')}" stroke-width="1" stroke-dasharray="7 9" d="${smooth(road.map(p => [p[0] - .3, p[1]]), Z.B, false)}"/><path class="Ln ${ks('#b39a6c')}" stroke-width="1" stroke-dasharray="5 11" d="${smooth(road.map(p => [p[0] + .32, p[1]]), Z.B, false)}"/>`);
    // uzak tepeler ve orman (ekran uzayı): dünyanın üst kenarını kapatır
    const hill = (pts, col) => G.push(`<path class="${kf(col)}" d="${smooth(pts, 0, true, true)}"/>`);
    hill([[-1010, -480], [-1010, -250], [-860, -292], [-700, -262], [-560, -312], [-420, -290], [-300, -338], [-170, -322], [-60, -372], [80, -350], [210, -388], [360, -352], [500, -384], [650, -340], [800, -362], [1010, -318], [1010, -480]], '#7fa57c');
    hill([[-1010, -480], [-1010, -330], [-880, -372], [-720, -340], [-590, -392], [-430, -366], [-280, -412], [-120, -398], [20, -440], [180, -420], [330, -452], [480, -428], [640, -456], [820, -420], [1010, -446], [1010, -480]], '#6a9478');
    { const r = rng(seed + 5), row = (y0, n, kinds, s0) => { const a = []; for (let i = 0; i < n; i++) a.push([wx + 10 + (i + r() * .8) / n * (ww - 20), y0 + (r() - .5) * 26 - Math.sin(i * .37) * 16, kinds[Math.floor(r() * kinds.length)], s0 * (.8 + r() * .5)]); return a; };
      const trees = row(-346, 54, ['fistik', 'selvi', 'cinar', 'fistik'], .62).concat(row(-312, 46, ['fistik', 'cinar', 'selvi', 'zeytin'], .76)).sort((a, b) => a[1] - b[1]);
      G.push(trees.map(t => K.TREE[t[2]](t[0], t[1], t[3], rng(Math.round(t[0] * 13 + t[1] * 7)), {})).join('')); }
    // ovanın denize bakan yarı
    const cliff = wallR(38, -70, 0, .1, Z.B, M.kaya); cliff.courses({ rh: .5, bw: 1.5, dens: .35, dt: -.16 }).stones(70, { rh: .5 }).shadeBottom(.3, -.12); G.push(cliff.svg());

    /* ================= LİMAN (C): rıhtım, kızak, havuz, mendirekler ================= */
    const quay = [[20, 38], [20, 54.4], [22.6, 54.4], [22.6, 49.6], [26.6, 49.6], [26.6, 54.4], [48.4, 54.4], [48.4, 53], [45.5, 53], [45.5, 45.5], [53, 45.5], [53, 50.4], [51.4, 50.4], [51.4, 54.4], [55.4, 54.4], [55.4, 50.4], [54.4, 50.4], [54.4, 20], [38, 20], [38, 38]];
    const sub = (a, b) => G.push(gp([[a[0], a[1], Z.W], [b[0], b[1], Z.W], [b[0], b[1], Z.W - .9], [a[0], a[1], Z.W - .9]], '#1f6480', ' opacity=".7"'));
    sub([20, 54.4], [22.6, 54.4]); sub([26.6, 54.4], [48.4, 54.4]); sub([48.4, 54.4], [48.4, 53]); sub([45.5, 53], [45.5, 45.5]); sub([45.5, 45.5], [53, 45.5]); sub([51.4, 54.4], [55.4, 54.4]); sub([55.4, 54.4], [55.4, 50.4]); sub([54.4, 50.4], [54.4, 20]);
    // kızak: tersanenin önünde suya inen taş rampa; üstünde ahşap kızak yolu
    { const zr = y => (y - 49.6) / 4.8 * Z.W;      // rampanın y'deki kotu
      G.push(gp([[22.6, 54.4, Z.W], [26.6, 54.4, Z.W], [26.6, 57.6, Z.W - .5], [22.6, 57.6, Z.W - .5]], '#2f7890', ' opacity=".75"')
        + gp([[22.6, 49.6, 0], [26.6, 49.6, 0], [26.6, 54.4, Z.W], [22.6, 54.4, Z.W]], '#a59b83') + gp([[22.6, 52.4, zr(52.4)], [26.6, 52.4, zr(52.4)], [26.6, 54.4, Z.W], [22.6, 54.4, Z.W]], '#8b9488')
        + gp([[22.6, 49.6, 0], [22.6, 54.4, 0], [22.6, 54.4, Z.W]], tone(M.tasK, toneOf([1, 0, 0])))
        + `<path class="Ln ${ks(tone('#a59b83', -.2))}" stroke-width=".8" d="${[50.4, 51.2, 52, 52.8, 53.6].map(y => `M${P(22.6, y, zr(y))} ${P(26.6, y, zr(y))}`).join('')}"/>`
        + `<path class="Ln ${ks(M.ahsapK)}" stroke-width="2.4" d="M${P(23.7, 49.8, .04)} ${P(23.7, 55.4, zr(55.4) + .04)}M${P(25.5, 49.8, .04)} ${P(25.5, 55.4, zr(55.4) + .04)}"/><path class="Ln ${ks(M.ahsap)}" stroke-width="2" d="${[50.2, 51, 51.8, 52.6, 53.4, 54.2].map(y => `M${P(23.4, y, zr(y) + .05)} ${P(25.8, y, zr(y) + .05)}`).join('')}"/>`
        + `<path class="Ln ${ks(M.kopuk)}" stroke-width="1.6" stroke-dasharray="6 5" opacity=".8" d="M${P(22.7, 54.4, Z.W)} ${P(26.5, 54.4, Z.W)}"/>`); }
    const qf = [wallL(45.5, 53, 45.5, Z.W, 0, M.tasK), wallR(45.5, 45.5, 53, Z.W, 0, M.tasK), wallL(20, 22.6, 54.4, Z.W, 0, M.tasK), wallL(26.6, 48.4, 54.4, Z.W, 0, M.tasK), wallR(48.4, 53, 54.4, Z.W, 0, M.tasK), wallR(54.4, 20, 50.4, Z.W, 0, M.tasK), wallL(51.4, 55.4, 54.4, Z.W, 0, M.tasK), wallR(55.4, 50.4, 54.4, Z.W, 0, M.tasK)];
    for (const f of qf) { f.courses({ rh: .28, bw: .9, dens: .8 }).band(0, .15, '#5d7a52', -.05, 3).band(f.h - .1, .1, M.tas, .12, 3); G.push(f.svg()); }
    { let d = ''; for (const [a, b] of [[[20, 54.4], [22.6, 54.4]], [[26.6, 54.4], [48.4, 54.4]], [[48.4, 54.4], [48.4, 53]], [[45.5, 53], [45.5, 45.5]], [[45.5, 45.5], [53, 45.5]], [[51.4, 54.4], [55.4, 54.4]], [[55.4, 54.4], [55.4, 50.4]], [[54.4, 50.4], [54.4, 20]]]) d += `M${P(a[0], a[1], Z.W)} ${P(b[0], b[1], Z.W)}`;
      G.push(`<path class="Ln ${ks(M.kopuk)}" stroke-width="1.6" stroke-dasharray="9 7 3 6" opacity=".75" d="${d}"/>`); }
    const quay0 = quay.map(p => [p[0], p[1], 0]);
    G.push(gp(quay0, M.parkeK) + pat(quay0, pQuay));
    // rıhtım kenar taşı
    const curb = (a, b, w = .3) => { const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), nx = -dy / l * w, ny = dx / l * w; G.push(gp([[a[0], a[1], 0], [b[0], b[1], 0], [b[0] - nx, b[1] - ny, 0], [a[0] - nx, a[1] - ny, 0]], tone(M.tas, .18))); };
    curb([20, 54.4], [22.6, 54.4]); curb([26.6, 54.4], [48.4, 54.4]); curb([54.4, 50.4], [54.4, 20], -.3); curb([45.5, 45.5], [53, 45.5]); curb([45.5, 53], [45.5, 45.5], -.3); curb([51.4, 54.4], [55.4, 54.4]); curb([55.4, 54.4], [55.4, 50.4], -.3);
    // iskeleler: kazıklar üstünde tahta
    const pier = (x0, y0, x1, y1) => { const z = -.1; T.gz = Z.W; for (const [px, py] of [[x0 + .12, y0 + .3], [x1 - .12, y0 + .3], [x0 + .12, y1 - .12], [x1 - .12, y1 - .12], [x0 + .12, (y0 + y1) / 2], [x1 - .12, (y0 + y1) / 2]]) T.cyl(px, py, .1, Z.W - .3, z, M.ahsapK, { cast: false, top: null });
      const b = T.box(x0, y0, z - .1, x1, y1, z, M.ahsapA, { edge: false }); b.T.planks({ dir: x1 - x0 > y1 - y0 ? 'v' : 'h', step: .3 }); };
    pier(30.2, 54.4, 31.5, 58.8); pier(54.4, 27.6, 58.6, 28.9);

    /* ================= ÇARŞI TERASI (B) ================= */
    const bTop = [[0, 22], [0, 38], [38, 38], [38, 0], [22, 0], [22, 22]].map(p => [p[0], p[1], Z.B]);
    const bL = wallL(0, 38, 38, 0, Z.B, M.tas), bR = wallR(38, 0, 38, 0, Z.B, M.tas);
    for (const f of [bL, bR]) f.courses({ rh: .3, bw: .8, dens: .7 }).stones(46).shadeBottom(.2, -.1).band(f.h - .12, .12, M.tas, .14, 3);
    // istinat duvarlarında kör kemerler, sarmaşık ve begonvil
    bL.arcade(.4, 8.4, 4, 1.5, { pier: .5, th: .3, cap: false, dark: tone(M.tasK, -.3) }).vine({ kind: 'boug', a0: 9, a1: 13, drop: [.5, 1.6] }).vine({ kind: 'ivy', a0: 15.5, a1: 19.5, drop: [.4, 1.9], stem: 17 }).vine({ kind: 'wist', a0: 20.2, a1: 20.4, drop: [.3, .5] });
    bR.vine({ kind: 'boug', a0: 5.6, a1: 9.4, drop: [.5, 1.7] }).arcade(22.4, 30.4, 4, 1.5, { pier: .5, th: .3, cap: false, dark: tone(M.tasK, -.3) }).vine({ kind: 'ivy', a0: 31, a1: 36, drop: [.4, 1.6], stem: 33 });
    G.push(bL.svg() + bR.svg() + gp(bTop, M.parke) + pat(bTop, pCobble));
    // değirmen arkı: İşlemehane'nin çarkından çıkan su, çarşı sokağını geçip teras kenarından dökülür
    G.push(gp(rc(1.72, 29.2, 2.68, 38, Z.B), tone(M.tas, .16)) + gp(rc(1.9, 29.2, 2.5, 38, Z.B - .1), M.su) + `<path class="Ln ${ks(M.suA)}" stroke-width="1" stroke-dasharray="5 7" d="M${P(2.08, 29.4, Z.B - .1)} ${P(2.08, 37.9, Z.B - .1)}M${P(2.34, 30.2, Z.B - .1)} ${P(2.34, 37.9, Z.B - .1)}"/>`);
    // köşe burcu: meydanın limana bakan seyir terası
    T.gz = 0; const bas = T.cyl(38, 38, 1.5, 0, Z.B, M.tas, { top: tone(M.parke, -.04) }); bas.courses(.3);
    // meydan döşemesi: çınarın çevresinde halkalar
    { const c = pr(29.6, 30, Z.B), E = r => ell(c[0], c[1], r * Math.SQRT2 * U, r * Math.SQRT2 * U / 2); let rays = '';
      for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; rays += `M${P(29.6 + Math.cos(a) * 2.3, 30 + Math.sin(a) * 2.3, Z.B)} ${P(29.6 + Math.cos(a) * 5.2, 30 + Math.sin(a) * 5.2, Z.B)}`; }
      G.push(`<path class="${kf(tone(M.parke, -.1))}" d="${E(5.7)}"/><path class="${kf(tone(M.parke, .12))}" d="${E(5.3)}"/><path class="${kf(tone(M.kiremit, .3))}" opacity=".55" d="${E(2.4)}"/><path class="${kf(tone(M.parke, .1))}" d="${E(2.05)}"/><path class="Ln ${ks(tone(M.parke, -.22))}" stroke-width=".8" d="${rays}${E(3.7).replace(/Z/g, '')}"/>`); }

    /* ================= YUKARI MAHALLE (A) ve İÇ KALE (K) ================= */
    const aTop = [[0, 8], [0, 22], [22, 22], [22, 0], [8, 0], [8, 8]].map(p => [p[0], p[1], Z.A]);
    const aL = wallL(0, 22, 22, Z.B, Z.A, M.tas), aR = wallR(22, 0, 22, Z.B, Z.A, M.tas);
    for (const f of [aL, aR]) f.courses({ rh: .3, bw: .8, dens: .7 }).stones(28).shadeBottom(.2, -.1).band(f.h - .12, .12, M.tas, .14, 3);
    aL.vine({ kind: 'boug', a0: 15.9, a1: 17.1, drop: [.6, 1.9] }); aR.vine({ kind: 'wist', a0: .3, a1: 1.2, drop: [.5, 1.6] });
    G.push(aL.svg() + aR.svg() + gp(aTop, tone(M.parke, .08)) + pat(aTop, pFlag));
    const kL = wallL(0, 8, 8, Z.A, Z.K, M.kaya), kR = wallR(8, 0, 8, Z.A, Z.K, M.kaya);
    for (const f of [kL, kR]) f.courses({ rh: .34, bw: 1, dens: .6, dt: -.14 }).stones(14, { rh: .34 }).shadeBottom(.3, -.14);
    kR.vine({ kind: 'ivy', a0: 1, a1: 5, drop: [.5, 2], stem: 3 });
    G.push(kL.svg() + kR.svg() + gp(rc(0, 0, 8, 8, Z.K), '#bdb195') + pat(rc(0, 0, 8, 8, Z.K), pSmall));

    /* ================= MERDİVENLER (zemin katmanı: üstünden yürünür) ================= */
    // dir 'y': +y'ye iner; (x0..x1) en, y0 üst kenar, y1 alt uç. Uzak korkuluk zemine, yakın korkuluk yapı katmanına gider.
    const stair = (x0, y0, x1, y1, zT, zB, dir, mat = M.tas) => { T.gz = zB; T.stairs(x0, y0, x1, y1, zT, zB, dir, mat); const h = .44, w = .2, st = tone(mat, .04);
      if (dir === 'y') { for (const [bx, B2] of [[x0 - w, T], [x1, W]]) { B2.gz = zB;
        B2.poly3([[bx + w, y0, zT], [bx + w, y1, zB], [bx + w, y1, zB + h], [bx + w, y0, zT + h]], st, { n: [1, 0, 0], bb: [bx, y0, zB, bx + w, y1, zT + h] });
        B2.poly3([[bx, y0, zT + h], [bx + w, y0, zT + h], [bx + w, y1, zB + h], [bx, y1, zB + h]], st, { n: [0, .45, .9], bb: [bx, y0, zB + h, bx + w, y1, zT + h + .01] });
        B2.poly3([[bx, y1, zB], [bx + w, y1, zB], [bx + w, y1, zB + h], [bx, y1, zB + h]], st, { n: [0, 1, 0], bb: [bx, y1 - .02, zB, bx + w, y1, zB + h] }); } }
      else { for (const [by, B2] of [[y0 - w, T], [y1, W]]) { B2.gz = zB;
        B2.poly3([[x0, by + w, zT], [x1, by + w, zB], [x1, by + w, zB + h], [x0, by + w, zT + h]], st, { n: [0, 1, 0], bb: [x0, by, zB, x1, by + w, zT + h] });
        B2.poly3([[x0, by, zT + h], [x0, by + w, zT + h], [x1, by + w, zB + h], [x1, by, zB + h]], st, { n: [.45, 0, .9], bb: [x0, by, zB + h, x1, by + w, zT + h + .01] });
        B2.poly3([[x1, by + w, zB], [x1, by, zB], [x1, by, zB + h], [x1, by + w, zB + h]], st, { n: [1, 0, 0], bb: [x1 - .02, by, zB, x1, by + w, zB + h] }); } } };
    stair(17.2, 22, 21.6, 26.2, Z.A, Z.B, 'y'); stair(22, 17.2, 26.2, 21.6, Z.A, Z.B, 'x');
    stair(33.4, 38, 37.6, 42.2, Z.B, Z.C, 'y'); stair(38, 33.4, 42.2, 37.6, Z.B, Z.C, 'x');
    stair(2.6, 8, 5.2, 11.4, Z.K, Z.A, 'y', M.kaya);
    // +x'e bakan istinat duvarlarının alt terasa düşen gölgesi
    { const SX = K.SH[0], SY = K.SH[1], cast = (x, y0, y1, z, hh) => SH.push(`<path d="M${PL([[x, y0, z], [x + SX * hh, y0 + SY * hh, z], [x + SX * hh, y1 + SY * hh, z], [x, y1, z]])}Z"/>`);
      cast(22, .5, 22, Z.B, 2.4); cast(38, 20.4, 38, 0, 2.4); cast(8, 0, 8, Z.A, 2.4); }

    /* ================= YAPILAR ================= */
    const stub = (id, o) => { const b = new Builder(), w = o.w || 4, d = o.d || 4; b.w = w; b.d = d; const x = b.box(.3, .3, 0, w - .3, d - .3, Math.min(1.6, Math.max(.5, Math.min(w, d) * .4)), '#c9a0c9'); x.L.wins(Math.max(1, Math.round(w / 1.6)), .3, .4, .5); const r = b.out(); r.w = w; r.d = d; return r; };
    const place = (id, X, Y, Zl, o = {}) => {
      if (!K.DEFS.has(id) && !opt.stubs) return null;      // henüz çizilmemiş parça: yeri boş kalır (opt.stubs ile mor kutu)
      let d; try { d = K.build(id, Object.assign({ seed: Math.abs(Math.round(X * 7 + Y * 13)) + seed }, o)); } catch (e) { if (opt.strict) throw e; if (!opt.stubs) return null; d = stub(id, o); }
      const p = pr(X, Y, Zl), tr = `translate(${f1(p[0])} ${f1(p[1])})`;
      if (d.ground) G.push(`<g transform="${tr}">${d.ground}</g>`);
      if (d.shadow) SH.push(`<path transform="${tr}" d="${d.shadow}"/>`);
      W.item([X, Y, Zl, X + d.w, Y + d.d, Zl + Math.max(.5, d.h)], `<g transform="${tr}"${o.key ? ` data-b="${o.key}"` : ''}>${d.body}</g>`, { cast: false });
      for (const f of d.fx) fx.push(Object.assign({}, f, { x: f.x + X, y: f.y + Y, z: f.z + Zl, b: o.key || id }));
      if (o.key) tags.push({ id: o.key, at: d.tag ? [d.tag[0] + X, d.tag[1] + Y, d.tag[2] + Zl] : [X + d.w / 2, Y + d.d, Zl], door: d.door ? [d.door[0] + X, d.door[1] + Y, Zl] : [X + d.w / 2, Y + d.d, Zl], bb: [X, Y, Zl, X + d.w, Y + d.d, Zl + d.h] });
      return d;
    };
    // tıklanan yapılar
    place('kule', 1.3, 1.3, Z.K, { key: 'fener', w: 5.5, d: 5.5 });
    place('lonca', 9.6, 9.6, Z.A, { key: 'lonca', w: 10, d: 10 });
    place('isleme', .6, 22.4, Z.B, { key: 'isleme', w: 8, d: 7 });
    place('demirci', 9.4, 22.4, Z.B, { key: 'demirci', w: 6.5, d: 7 });
    place('zanaat', 22.4, .7, Z.B, { key: 'zanaat', w: 7, d: 7 });
    place('ticaret', 22.4, 8, Z.B, { key: 'ticaret', w: 7.2, d: 9 });
    place('pano', 24.2, 32.8, Z.B, { key: 'pano', w: 4, d: 3 });
    place('kapi', 29.7, -1.7, Z.B, { key: 'iskele', w: 8, d: 3.4 });
    place('tersane', 20.4, 38.4, Z.C, { key: 'tersane', w: 12, d: 7.5 });
    place('depo', 38.4, 23.4, Z.C, { key: 'ambar', w: 6.5, d: 9 });
    place('hal', 38.8, 38.8, Z.C, { key: 'hal', w: 6.5, d: 6.5 });
    // yukarı mahalle
    place('hamam', .9, 14.3, Z.A, { w: 6, d: 6 }); place('saat', 18.5, 4.8, Z.A, { w: 3, d: 3 });
    place('ev', 1, 8.9, Z.A, { w: 4.4, d: 4.6, kat: 2, cephe: 'L', seed: 3 }); place('ev', 12.8, 1, Z.A, { w: 4.8, d: 5, kat: 3, cephe: 'L', seed: 5 }); place('ev', 8.6, 1.1, Z.A, { w: 4, d: 4.6, kat: 2, cephe: 'L', seed: 9 });
    // çarşı terasının dış kenarı: alçak damlı evler, dükkânlar, kahve
    place('dam', 3.3, 34.4, Z.B, { w: 3.6, d: 3.4, cephe: 'L', seed: 2 }); place('dukkan', 7.5, 34.6, Z.B, { w: 3.4, d: 3.2, cephe: 'L', tur: 'firin', seed: 4 });
    place('dam', 12.5, 34.4, Z.B, { w: 3.6, d: 3.4, cephe: 'L', seed: 6 }); place('kahve', 16.5, 34.2, Z.B, { w: 5, d: 3.6, cephe: 'L', seed: 8 });
    place('kopru', .9, 30.7, Z.B, { w: 2.6, d: 1.8, dir: 'x' });
    place('dukkan', 34.6, 3.8, Z.B, { w: 3.2, d: 3.4, cephe: 'R', tur: 'baharat', seed: 3 }); place('dam', 34.4, 8.2, Z.B, { w: 3.4, d: 3.8, cephe: 'R', seed: 5 });
    place('dam', 34.4, 15, Z.B, { w: 3.4, d: 3.6, cephe: 'R', seed: 7 }); place('dukkan', 34.6, 19, Z.B, { w: 3.2, d: 2.9, cephe: 'R', tur: 'kumas', seed: 9 });
    // meydan
    place('sadirvan', 31.7, 23.8, Z.B, { w: 4.5, d: 4.5 });
    // liman
    place('tekne-sandal', 24, 50.1, -.16, { dir: 'y', seed: 5 });      // kızakta çekili sandal
    place('cesme', 38, 20.4, Z.C, { w: 1.6, d: 3, dir: 'R' }); place('vinc', 50.4, 24.2, Z.C, { w: 3, d: 3 }); place('fenerk', 51.9, 50.9, Z.C, { w: 3, d: 3 });
    place('ev', 45.6, 20.8, Z.C, { w: 4.6, d: 4.4, kat: 2, stil: 'tas', cephe: 'L', seed: 14 });      // rıhtım hanı
    // sur dışı
    place('ev', 34.9, -9.4, Z.B, { w: 4.6, d: 4.8, kat: 2, stil: 'siva', cephe: 'L', seed: 21 }); place('ev', -8.6, 19.4, 0, { w: 4.2, d: 4.4, kat: 1, stil: 'himis', cephe: 'L', seed: 17 });
    place('kemer', -16, 26.7, 0, { n: 5, dir: 'x', h: 5.3, w: 15, d: 1.4 });
    place('ciftlik', -22.4, 12.4, 0, { w: 7, d: 6 }); place('kulube', 6.6, 47, 0, { w: 4.5, d: 4, seed: 1 }); place('kulube', 12.4, 48.2, 0, { w: 4.5, d: 4, seed: 2 });
    place('degirmen', 22.6, -14.4, Z.B, { w: 4, d: 4 }); place('degirmen', 16.4, -19.6, Z.B, { w: 4, d: 4, seed: 4 });
    place('ciftlik', 8.2, -22.4, Z.B, { w: 7, d: 6, seed: 3 });

    /* ================= SURLAR, KULELER, KORKULUKLAR (yapı katmanı) ================= */
    const railX = (x0, x1, y, z, mat = M.tas) => { W.gz = z; const b = W.box(x0, y - .22, z, x1, y, z + .42, mat, { edge: false, cast: false }); b.L.planks({ dir: 'v', step: .36, dt: -.09 }).band(.33, .09, mat, .16, 3); };
    const railY = (x, y0, y1, z, mat = M.tas) => { W.gz = z; const b = W.box(x - .22, y0, z, x, y1, z + .42, mat, { edge: false, cast: false }); b.R.planks({ dir: 'v', step: .36, dt: -.09 }).band(.33, .09, mat, .16, 3); };
    const wallX = (x0, x1, yc, zb, h) => { W.gz = zb; const b = W.box(x0, yc - .5, zb, x1, yc + .5, zb + h, M.tas, { edge: false }); b.L.courses({ rh: .3, bw: .8, dens: .6 }).stones(Math.round((x1 - x0) * 1.3)).shadeBottom(.2, -.1); W.merlons(x0, yc - .5, x1, yc - .3, zb + h, M.tas); W.merlons(x0, yc + .3, x1, yc + .5, zb + h, M.tas); };
    const wallY = (xc, y0, y1, zb, h) => { W.gz = zb; const b = W.box(xc - .5, y0, zb, xc + .5, y1, zb + h, M.tas, { edge: false }); b.R.courses({ rh: .3, bw: .8, dens: .6 }).stones(Math.round((y1 - y0) * 1.3)).shadeBottom(.2, -.1); W.merlons(xc - .5, y0, xc - .3, y1, zb + h, M.tas); W.merlons(xc + .3, y0, xc + .5, y1, zb + h, M.tas); };
    const tower = (cx, cy, r, z0, z1, o = {}) => { W.gz = o.gz === undefined ? z0 : o.gz; const c = W.cyl(cx, cy, r, z0, z1, M.tas, { top: tone(M.tas, -.06) }); c.courses(.32); c.band(z1 - .12, .34, M.tasK, .16).merlons(z1 + .22, Math.round(r * 9), { e: .16 });
      for (const [t, zz] of o.slits || [[-.45, z1 - 1.5], [.4, z1 - 2.3]]) c.face(t, zz, .2, .6).rect(.04, 0, .12, .6, M.ic, 4, null);
      if (o.flag) { W.line3([[cx, cy, z1 + .2], [cx, cy, z1 + 1.9]], M.ahsapK, 1.5); fx.push({ t: 'flag', x: cx, y: cy, z: z1 + 1.9, col: o.flag, s: 1.2 }); } };
    // su kemerinden gelen oluk surun üstünden İşlemehane'ye geçer
    if (K.DEFS.has('kemer')) { W.gz = Z.B; W.box(-1.05, 27.02, 4.95, .7, 27.78, 5.3, M.tas, { edge: false, cast: false }); W.pool(-1.05, 27.14, .7, 27.66, 5.31); }
    // batı ve kuzey surları (içeriden görünür)
    wallY(0, 8.6, 21, Z.A, 2.2); wallY(0, 23, 37.2, Z.B, 2.4); wallX(8.6, 21, 0, Z.A, 2.2); wallX(23, 29.9, 0, Z.B, 2.4);
    tower(0, 22, 1.25, Z.B, Z.A + 3, { flag: M.bezK }); tower(22, 0, 1.25, Z.B, Z.A + 3, { flag: M.bezK }); tower(0, 38.3, 1.35, 0, Z.B + 3.1, { gz: 0, flag: M.bezM }); tower(38.3, 0, 1.35, .1, Z.B + 3.1, { gz: .1 });
    // iç kale mazgalları
    for (const [a, b2, c, d] of [[0, 7.72, 2.6, 8], [5.2, 7.72, 8, 8]]) { W.gz = Z.K; W.box(a, b2, Z.K, c, d, Z.K + .34, M.kaya, { edge: false, cast: false }); W.merlons(a, b2, c, d, Z.K + .34, M.kaya); }
    W.box(7.72, 0, Z.K, 8, 7.72, Z.K + .34, M.kaya, { edge: false, cast: false }); W.merlons(7.72, 0, 8, 7.72, Z.K + .34, M.kaya);
    // liman ucu: kıyı suru ve deniz kulesi
    W.gz = 0; { const b = W.box(38.6, 19.6, 0, 53.4, 20.4, 2, M.tas, { edge: false }); b.L.courses({ rh: .3, bw: .8, dens: .6 }).stones(18).arcade(5.2, 7.2, 1, 1.5, { thru: true, th: .8, pier: .2 }); W.merlons(38.6, 20.2, 53.4, 20.4, 2, M.tas); }
    tower(54.5, 20, 1.45, Z.W - .2, 3.4, { gz: Z.W, flag: M.bezM });
    // teras korkulukları (ev olmayan kenarlar)
    railX(.6, 1.7, 38, Z.B); railX(2.7, 3.3, 38, Z.B); railX(10.9, 12.5, 38, Z.B); railX(21.5, 33.4, 38, Z.B); railY(38, 12.1, 14.9, Z.B); railY(38, 22, 33.4, Z.B); railY(38, .6, 3.6, Z.B);
    railX(.6, 17.2, 22, Z.A, M.mermer); railY(22, .6, 17.2, Z.A, M.mermer);
    { W.gz = 0; const c = W.cyl(38, 38, 1.5, Z.B, Z.B + .42, M.tas, { top: null, cast: false }); c.band(Z.B + .33, .09, M.tas, .02, false); W.line3([[38.6, 38.6, Z.B], [38.6, 38.6, Z.B + 2.6]], M.ahsapK, 1.6); fx.push({ t: 'flag', x: 38.6, y: 38.6, z: Z.B + 2.6, col: M.bezS, s: 1.4 }); }

    /* ================= AĞAÇLAR, FENERLER, EŞYALAR ================= */
    const tr = (kind, x, y, z, s = 1, o = {}) => { W.gz = z; W.tree(kind, x, y, Object.assign({ z, s }, o)); };
    const lamp = (x, y, z) => { W.gz = z; W.lamp(x, y, z); };
    // meydan: ulu çınar, banklar, tezgâhlar
    W.gz = Z.B; { const c = W.cyl(29.6, 30, 1.05, Z.B, Z.B + .3, M.tas, { top: '#7a6a4a' }); c.courses(.15); } tr('cinar', 29.6, 30, Z.B + .3, 3.1);
    W.gz = Z.B; W.bench(27.6, 31.6, Z.B, 'x').bench(31.4, 28.2, Z.B, 'y').bench(31.8, 31.6, Z.B, 'x');
    W.stall(33.2, 31.2, Z.B, { cols: [M.bezS, M.bez], goods: ['#e8843a', '#c0473a', '#7fa35e'] }).stall(35, 33.4, Z.B, { cols: [M.bezM, M.bez], w: 1.5, goods: ['#9fb4c4', '#d9c79a', '#c98f63'] }).stall(23.2, 29, Z.B, { cols: [M.bezY, M.bez], goods: ['#e0c068', '#d0408c', '#f0962e'] });
    fx.push({ t: 'birds', x: 27.2, y: 28.2, z: Z.B, n: 4 }, { t: 'birds', x: 33.6, y: 29.4, z: Z.B, n: 3 }, { t: 'birds', x: 25.8, y: 36.4, z: Z.B, n: 3 });
    for (const [x, y] of [[22.6, 26.6], [26.6, 22.6], [37.2, 22.6], [22.6, 37.2], [30.2, 37.2], [37.2, 30.2]]) lamp(x, y, Z.B);
    // meydanda duranlar: sohbet edenler, alışveriş yapanlar, oynayan çocuk
    W.gz = Z.B; W.fig(27.9, 31.2, Z.B, { body: M.bezM, hat: 'sarik' }).fig(28.5, 31.5, Z.B, { body: M.bezS, hat: 'fes', flip: true }).fig(33, 32.4, Z.B, { body: M.bezMor, hat: 'ortu', robe: true, hatCol: M.bez, carry: 'sepet' })
      .fig(35.6, 34.7, Z.B, { body: M.bezY, hat: 'hasir', flip: true }).fig(23.6, 30.2, Z.B, { body: M.gul, hat: 'ortu', robe: true, hatCol: M.bezK }).fig(31.2, 33.4, Z.B, { body: M.kirmizi, hat: 'none' }).critter('kedi', 31.9, 31.2, Z.B).critter('kedi', 26.4, 35.9, Z.B, { col: '#f2ead8' });
    W.flowers(25.2, 25.2, { z: Z.B, n: 10, r: .7 }).flowers(35.4, 36, { z: Z.B, n: 9, r: .6 });
    W.hedge(24.4, 24.3, 26.2, 24.7, .3, { z: Z.B }).hedge(24.4, 24.7, 24.8, 26.2, .3, { z: Z.B });
    W.gz = Z.B; W.pot(36.6, 36.6, Z.B, { plant: true, fl: M.begonvil, s: 1.5 }).pot(23.2, 23.6, Z.B, { plant: true, fl: M.kirmizi, s: 1.4 }).pot(24.2, 22.9, Z.B, { plant: true, s: 1.3 });
    // çarşı sokakları
    for (const [x, y] of [[4.6, 30.4], [12.6, 30.2], [21.6, 33.6], [11.7, 37.3]]) lamp(x, y, Z.B);
    for (const [x, y] of [[30.6, 4.4], [30.4, 12.4], [33.6, 20.4], [37.2, 13.4]]) lamp(x, y, Z.B);
    tr('cinar', 11.7, 35.8, Z.B, .95); tr('selvi', 16.5, 23, Z.B, .8); tr('cinar', 36.2, 13.5, Z.B, 1.0); tr('selvi', 23, 16.9, Z.B, .7); tr('narenciye', 8.9, 30.6, Z.B, 1.1); tr('narenciye', 30.6, 8.6, Z.B, 1.1);
    W.gz = Z.B; W.bench(11.7, 37.2, Z.B, 'x').bench(37.1, 13.4, Z.B, 'y').cart(18.2, 31.4, Z.B, 'x', { load: M.saz }).well(31.4, 17.6, Z.B);
    // yukarı mahalle
    tr('selvi', 16.6, 21.2, Z.A, .9); tr('selvi', 21.2, 16.6, Z.A, .9); tr('selvi', 8.2, 21, Z.A, .8); tr('selvi', 21, 8.4, Z.A, .8); tr('narenciye', 7.8, 13.4, Z.A, 1.2); tr('cinar', 7.6, 9.6, Z.A, 1.1); tr('fistik', 16.9, 7.6, Z.A, .9);
    lamp(20.6, 20.6, Z.A); lamp(12.4, 21.2, Z.A); lamp(21.2, 12.4, Z.A); lamp(4, 21.2, Z.A);
    W.gz = Z.A; W.bench(10.4, 21.3, Z.A, 'x').bench(21.3, 10.4, Z.A, 'y').pot(19.9, 21.3, Z.A, { plant: true, fl: M.bez, s: 1.4 }).pot(21.3, 19.9, Z.A, { plant: true, fl: M.bez, s: 1.4 });
    // iç kale
    W.gz = Z.K; W.crate(7, 6.6, Z.K).barrel(6.9, 5.9, Z.K); tr('selvi', 7, 1.2, Z.K, .8);
    W.gz = Z.A; W.rock(8.4, 6.6, Z.A, { s: 1.3 }).rock(6.4, 8.5, Z.A, { s: 1.2 }).rock(1.2, 8.5, Z.A, { s: 1 }); tr('cali', 8.3, 7.5, Z.A, 1.2); tr('cali', 7.4, 8.5, Z.A, 1.1);
    // liman: palmiyeler, babalar, yük
    tr('palmiye', 43.2, 37, Z.C, 1.1); tr('palmiye', 36.6, 46.8, Z.C, 1.1); tr('palmiye', 47, 21.6, Z.C, 1); tr('palmiye', 21, 47.4, Z.C, 1);
    W.gz = 0; for (let x = 28; x < 48; x += 2.6) W.bollard(x, 54, 0); for (let y = 22; y < 50; y += 2.8) W.bollard(54, y, 0); for (let x = 47; x < 53; x += 2) W.bollard(x, 45.9, 0); for (let y = 47; y < 53; y += 2) W.bollard(45.9, y, 0);
    W.crate(48.6, 30.2, 0, .5).crate(49.2, 30.4, 0, .44).crate(48.9, 30.3, .4, .4).barrel(47.6, 31.4).barrel(48.1, 31.7).sack(49.6, 31.6).sack(50, 31.2).crate(52.6, 27, 0, .46, { fill: '#9fb4c4' }).barrel(52.4, 29.6);
    W.crate(33.6, 52.2, 0, .46).barrel(34.4, 52.6).crate(28.4, 51, 0, .5).sack(29, 51.4).barrel(43.6, 47.2).crate(44.4, 46.6, 0, .42, { fill: '#9fb4c4' });
    for (const [x, y] of [[32.2, 47.6], [44, 52.6], [39.6, 53.2], [52.6, 36], [46.2, 34], [52.6, 44.4], [27.4, 53.4]]) lamp(x, y, 0);
    // rıhtım yaşamı: tezgâhlar, yük yığınları, banklar, saksılı ağaçlar
    W.gz = 0; W.stall(28.6, 47.2, 0, { cols: [M.bezM, M.bez], w: 1.5, goods: ['#9fb4c4', '#c4b49f', '#e8843a'] }).stall(30.6, 47.3, 0, { cols: [M.bezK, M.bez], goods: ['#7fa35e', '#e0c068', '#c0473a'] }).stall(41.6, 47.4, 0, { cols: [M.bezS, M.bez], w: 1.4, goods: ['#9fb4c4', '#d98a6a'] });
    W.cart(26.4, 48, 0, 'x', { load: '#b99a6b' }).cart(49.6, 36.4, 0, 'y', { load: '#d9c79a' }).bench(36.6, 52.6, 0, 'x').bench(42.4, 53.4, 0, 'x').bench(53.3, 33.6, 0, 'y').bench(53.3, 38.6, 0, 'y').bench(24, 53.2, 0, 'x');
    for (const [x, y] of [[38.6, 50.6], [34.2, 49.2], [50.4, 40.6], [50.6, 31.6]]) { W.cyl(x, y, .5, 0, .26, M.tas, { top: '#7a6a4a', cast: false }); tr(x < 45 ? 'cinar' : 'narenciye', x, y, .26, x < 45 ? .9 : 1.2); }
    W.gz = 0; W.crate(22.2, 47, 0, .5).crate(22.8, 47.2, 0, .44).crate(22.5, 47.1, .4, .38).barrel(21.6, 48).barrel(21.5, 48.6).sack(23.4, 46.6).sack(23.8, 46.9).woodpile(21, 49.6, 0, { w: 1.3 }).woodpile(21, 50.2, 0, { w: 1.3 }).hay(51.6, 26.4)
      .crate(46.6, 38.6, 0, .46, { fill: '#c98f63' }).crate(47.2, 38.9, 0, .4).barrel(46.4, 39.6).barrel(47, 40).sack(47.8, 39.4).crate(50.6, 44.4, 0, .5).crate(51.2, 44.6, 0, .42, { fill: '#9fb4c4' });
    W.fig(29.3, 48.5, 0, { body: M.bezS, hat: 'ortu', robe: true, hatCol: M.bezM, carry: 'sepet' }).fig(31.2, 48.6, 0, { body: M.kirmizi, hat: 'fes', flip: true }).fig(42.2, 48.7, 0, { body: M.bezY, hat: 'hasir' }).fig(36.9, 53.2, 0, { body: M.gul, hat: 'ortu', robe: true, hatCol: M.bez })
      .fig(53, 34.2, 0, { body: M.bezM, hat: 'sarik', flip: true }).fig(48.4, 37.6, 0, { body: '#7a5038', hat: 'hasir', carry: 'kasa' }).critter('marti', 39.4, 53.9, 0).critter('marti', 30.9, 54.1, 0, { flip: true }).critter('kedi', 30.2, 47.9, 0, { col: '#f2ead8' }).critter('marti', 54, 26.4, 0);
    // ağ kurutma sehpaları
    const net = (x, y, dir = 'x', l = 2) => { W.gz = 0; const a = dir === 'x' ? [x, y] : [x, y], b = dir === 'x' ? [x + l, y] : [x, y + l]; W.line3([[a[0], a[1], 0], [a[0], a[1], .9]], M.ahsapK, 1.4).line3([[b[0], b[1], 0], [b[0], b[1], .9]], M.ahsapK, 1.4); let d = '';
      for (let i = 0; i <= 8; i++) { const t = i / 8, px = a[0] + (b[0] - a[0]) * t, py = a[1] + (b[1] - a[1]) * t; d += `M${P(px, py, .86 - Math.sin(t * Math.PI) * .12)} ${P(px, py, .16 + Math.sin(t * 9) * .06)}`; }
      for (let k = 0; k < 4; k++) d += `M${P(a[0], a[1], .86 - k * .2)}Q${P((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, .7 - k * .2)} ${P(b[0], b[1], .86 - k * .2)}`;
      W.item([Math.min(a[0], b[0]), Math.min(a[1], b[1]), 0, Math.max(a[0], b[0]) + .04, Math.max(a[1], b[1]) + .04, .9], `<path class="Ln ${ks('#4f6f6a')}" stroke-width=".7" opacity=".85" d="${d}"/>` + [0, .25, .5, .75, 1].map(t => pth('#d98a4a', circ(...pr(a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, .2), 1.2))).join(''), { cast: false }); };
    net(46.6, 43.8, 'x', 2.2); net(50.2, 44.2, 'x', 2); net(41, 50.6, 'x', 2.4); net(52, 39.6, 'y', 2.2);
    // rıhtım kenarında olta sallayanlar
    const angler = (x, y, dir, body) => { W.gz = 0; W.fig(x, y, 0, { body, hat: 'hasir', flip: dir < 0 }); const p = pr(x, y, 0); W.art(x, y, 0, ln(M.ahsapK, `M${dir * 4} -11L${dir * 17} -24`, 1) + ln('#e8f2f2', `M${dir * 17} -24L${dir * 20} 6`, .5), { bb: [x - .1, y - .1, 0, x + .12, y + .12, 1.1] }); };
    angler(43.2, 54.1, -1, M.bezM); angler(54.1, 41.4, 1, M.bezK); angler(52.6, 53.9, -1, M.bezY);
    W.gz = 0; W.crate(47.4, 44.4, 0, .44, { fill: '#9fb4c4' }).crate(48, 44.6, 0, .4, { fill: '#c4b49f' }).crate(47.7, 44.5, .35, .36, { fill: '#9fb4c4' }).barrel(49.2, 44.5).critter('marti', 48.8, 45.3, 0).critter('marti', 53.6, 47.2, 0, { flip: true }).critter('kedi', 46.4, 44.9, 0, { col: '#3a3634' });
    // kumsal ve vadi
    tr('kavak', -6.2, 24.2, 0, 1); tr('kavak', -10.6, 14.6, 0, 1.1); tr('kavak', -14.4, 4.6, 0, 1); tr('kavak', -5.2, 38.6, 0, .95); tr('kavak', -19.6, -5.2, 0, 1.05);
    for (const [x, y, s] of [[-3.2, 22.4, 1], [-1.8, 24.8, .9], [-3.6, 25.6, 1.05], [-12.8, 22.6, 1], [-14.6, 24.2, .9], [-11.2, 30.4, 1.1], [-13.6, 31.8, .95], [-2.6, 40.2, 1]]) tr('zeytin', x, y, 0, s);
    tr('fistik', 15.8, 44.6, 0, 1.1); tr('fistik', 17.6, 46.2, 0, .95); tr('fistik', 4, 44.8, 0, 1);
    W.gz = 0; W.rock(8.6, 51.4, 0, { s: 1.3 }).rock(9.5, 51.9, 0, { s: .8 }).rock(-1.6, 52.6, 0, { s: 1.5 }).rock(17.8, 52.6, 0).rock(4.4, 40.2, 0, { s: 1.2 }).rock(.6, 41, 0, { s: .9 });
    // sağ kıyı: fıstık çamları ve kayalar
    W.gz = .1; for (const [x, y, s] of [[41, 14.6, 1.1], [43.6, 11.6, 1], [41.4, 7.4, 1.15], [44.6, 5, .95], [40.8, 1.6, 1], [43, -3.4, 1.1], [40.6, -8, 1]]) tr('fistik', x, y, .1, s);
    W.gz = .1; W.rock(50.2, 14.8, .1, { s: 1.5 }).rock(51.4, 11.4, .1, { s: 1.1 }).rock(49.4, 6.6, .1, { s: 1.6 }).rock(47.8, 1.2, .1, { s: 1.2 }).rock(52.4, 17.4, .1, { s: .9 }).rock(46.6, -6, .1, { s: 1.4 });
    // ova: zeytinlik, selviler
    for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) tr('zeytin', 1.6 + i * 1.8 + (j % 2) * .5, -9.6 + j * 2.1, Z.B, .9 + R() * .2);
    for (const [x, y] of [[31.6, -3], [35, -2.6], [31.2, -11.6], [34.2, -13.4], [30.4, -25.4], [33.6, -27]]) tr('selvi', x, y, Z.B, .85);
    tr('cinar', 27.6, -1.6, Z.B, 1.2); tr('cinar', 20.2, -1.6, Z.B, 1.1); tr('fistik', 12.6, -1.8, Z.B, 1); tr('cinar', 4.6, -2.4, Z.B, 1.2);
    // denizde kayalar ve küçük ada
    W.gz = Z.W; W.rock(59.6, 40.2, Z.W, { s: 1.6 }).rock(60.8, 41.2, Z.W, { s: 1 }).rock(58.4, 12.6, Z.W, { s: 1.3 }).rock(12.6, 60.2, Z.W, { s: 1.5 }).rock(13.8, 61, Z.W, { s: .9 });
    G.push(`<path class="${kf(M.suA)}" opacity=".5" d="${smooth([[27, 63.2], [31, 62.6], [33.4, 65], [31.6, 67.6], [27.6, 67.2], [25.8, 65.2]], Z.W)}"/><path class="${kf(M.kum)}" d="${smooth([[27.6, 63.8], [30.8, 63.4], [32.6, 65], [31.2, 66.8], [27.8, 66.6], [26.6, 65.2]], -.2)}"/><path class="${kf(M.cim)}" d="${smooth([[28.4, 64.3], [30.4, 64.1], [31.4, 65.1], [30.4, 66.1], [28.6, 66], [27.8, 65.1]], -.1)}"/>`);
    tr('fistik', 29.6, 65.1, -.1, 1.1); W.gz = -.2; W.rock(31.8, 66.4, -.2, { s: 1.1 }).rock(27.2, 64.2, -.2, { s: .8 });

    // dere boyunca sazlar ve taşlar
    { const r = rng(seed + 31); let d = ''; W.gz = 0; for (let i = 1; i < river.length - 2; i++) for (const sd of [-1, 1]) { if (r() < .35) continue; const a = river[i], b = river[i + 1], t = r(), x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t, dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), ox = -dy / l * sd * (a[2] / 2 + .3), oy = dx / l * sd * (a[2] / 2 + .3), p = pr(x + ox, y + oy, 0);
        for (let k = 0; k < 5; k++) d += `M${f1(p[0] + k * 1.8 - 4)} ${f1(p[1])}l${f1((k - 2) * .8)} ${f1(-6 - r() * 4)}`; if (r() < .4) W.rock(x + ox * 1.3, y + oy * 1.3, 0, { s: .6 + r() * .4, cast: false }); }
      G.push(`<path class="Ln ${ks('#5f8a4a')}" stroke-width="1.1" d="${d}"/>`); }
    // tarlalarda çitler, saman balyaları, korkuluk
    W.gz = 0; W.fence([[-15.2, .8], [-10.3, .8], [-10.3, 8.2]], .38).fence([[-9.9, 15.7], [-6.2, 15.7], [-6.2, 9.4]], .38).hay(-12.4, 8.6).hay(-11.6, 8.9).hay(-18.6, .5).hay(-23.4, 10.6);
    W.gz = Z.B; W.fence([[24.4, -3.2], [31.6, -3.2], [31.6, -9.8]], .38, { z: Z.B }).fence([[15.2, -2.4], [23.6, -2.4]], .38, { z: Z.B }).hay(26, -2.6, Z.B).hay(26.9, -2.4, Z.B).hay(9.4, -2.4, Z.B).hay(20.4, -12.2, Z.B);
    for (const [x, y, z] of [[-12.8, 4.4, 0], [27.8, -6.6, Z.B]]) { W.gz = z; W.art(x, y, z, ln(M.ahsapK, 'M0 0V-17M-7 -12H7', 1.4) + pth('#c9a24e', 'M-4 -17h8l-1 -4h-6z') + pth(M.bezK, 'M-6 -12h12l-2 7h-8z') + pth(M.ten, circ(0, -15, 2.2)), { bb: [x - .1, y - .1, z, x + .1, y + .1, z + .8] }); }
    // liman fenerinin ışını (gece)
    if (K.DEFS.has('fenerk')) fx.push({ t: 'beam', x: 53.4, y: 52.4, z: 3.2, r: 11 });

    /* ================= TEKNELER ================= */
    const boat = (id, x, y, o = {}) => sprites.push(Object.assign({ id, x, y, z: Z.W, opt: { dir: o.dir || 'x', seed: o.seed || Math.round(x * 3 + y) } }, o));
    boat('tekne-balikci', 46.2, 45.9, { seed: 2 }); boat('tekne-balikci', 49.8, 45.9, { seed: 5 });
    boat('tekne-sandal', 45.9, 46.8, { dir: 'y', seed: 1 }); boat('tekne-sandal', 45.9, 49.2, { dir: 'y', seed: 4 }); boat('tekne-sandal', 51.6, 47.4, { seed: 3 });
    boat('tekne-mavna', 54.8, 29.4, { dir: 'y', seed: 2 }); boat('tekne-sandal', 54.8, 36.2, { dir: 'y', seed: 6 }); boat('tekne-balikci', 40.8, 54.8, { seed: 7 }); boat('tekne-sandal', 27.2, 54.9, { seed: 8 });
    boat('tekne-balikci', 20.4, 60.6, { seed: 9 }); boat('tekne-balikci', 62.4, 44.6, { dir: 'y', seed: 11 }); boat('tekne-sandal', 9.2, 56.4, { seed: 12 }); boat('tekne-sandal', 57.6, 22.6, { dir: 'y', seed: 13 });
    boat('tekne-balikci', 36.4, 62.2, { seed: 15 }); boat('tekne-sandal', 44.2, 60.4, { seed: 16 }); boat('tekne-sandal', 64.6, 31.2, { dir: 'y', seed: 18 }); boat('tekne-mavna', 14.6, 66.2, { seed: 19 }); boat('tekne-sandal', 60.6, 52.4, { seed: 20 });
    for (const [x, y, k] of [[49.2, 55.6, 0], [51.2, 56.4, 1], [47.6, 57.6, 0], [53.4, 58.4, 1], [57.2, 47.6, 0], [22.2, 58.2, 1]]) sprites.push({ id: 'duba', x, y, z: Z.W, opt: { seed: k } });
    // açık denizde yol alan yelkenliler
    // (tek yön giderler; yolun iki ucu da dünyanın dışındadır)
    boat('tekne-yelken', 0, 0, { path: [[-6, 60, Z.W], [12, 64.5, Z.W], [30, 71, Z.W], [44, 82, Z.W]], v: 8, seed: 3, at: .35 }); boat('tekne-yelken', 0, 0, { dir: 'y', path: [[62, 6, Z.W], [66, 24, Z.W], [68, 44, Z.W], [66, 66, Z.W]], v: 7, seed: 6, at: .6 });
    boat('tekne-balikci', 0, 0, { path: [[-10, 66, Z.W], [10, 70, Z.W], [28, 78, Z.W], [36, 88, Z.W]], v: 5, seed: 14, at: .1 });
    const moor = { at: [32.2, 54.8, Z.W], buoy: [35, 56, Z.W], dir: 'x' };

    /* ================= YÜRÜYENLER, KUŞLAR, ORTAM ================= */
    const B = Z.B, A = Z.A;
    paths.push({ pts: [[.9, 31.6, B], [2.2, 31.6, B + .2], [3.5, 31.6, B], [20, 31.6, B], [27, 32.2, B], [31.6, 27.4, B], [32, 20, B], [32, 6, B], [33.7, 2.6, B], [33.7, -5.5, B]], n: 5 });
    paths.push({ pts: [[30.4, 26.4, B], [27, 19.4, B], [26.2, 19.4, B], [22, 19.4, A], [20.8, 19.4, A], [20.8, 20.9, A], [14.6, 20.9, A]], n: 2 });
    paths.push({ pts: [[25, 27, B], [19.4, 27, B], [19.4, 26.2, B], [19.4, 22, A], [19.4, 20.9, A], [6, 20.9, A]], n: 2 });
    paths.push({ pts: [[33, 34, B], [35.5, 37, B], [35.5, 38, B], [35.5, 42.2, 0], [35.5, 47.4, 0], [30, 48.6, 0], [24, 47.6, 0]], n: 3 });
    paths.push({ pts: [[34, 33, B], [37, 35.5, B], [38, 35.5, B], [42.2, 35.5, 0], [47.4, 35.5, 0], [51.2, 33, 0], [51.2, 24, 0]], n: 3, look: { body: '#7a5038', hat: 'hasir', carry: 'kasa' } });
    paths.push({ pts: [[31, 49, 0], [31, 53.4, 0], [38, 53.2, 0], [44.4, 52.2, 0]], n: 2 });
    paths.push({ pts: [[47, 44.6, 0], [52.4, 44.6, 0], [52.4, 38, 0]], n: 1, look: { body: '#4a6a8a', hat: 'none', carry: 'balik' } });
    paths.push({ pts: [[33.7, -6, B], [32.6, -11, B], [32.9, -17, B], [31.6, -24, B], [32.4, -32, B]], n: 2 });
    paths.push({ pts: [[6, 49.6, 0], [10.4, 50.2, 0], [15.4, 51.6, 0]], n: 1, look: { body: '#4a6a8a', hat: 'hasir', carry: 'kova' } });
    paths.push({ pts: [[0, 23.6, B + 2.4], [0, 36.6, B + 2.4]], n: 1, layer: 'hi', look: { body: '#8a2f2a', hat: 'fes', legs: '#3a3a44' } });
    paths.push({ pts: [[23.6, 0, B + 2.4], [29.4, 0, B + 2.4]], n: 1, layer: 'hi', look: { body: '#8a2f2a', hat: 'fes', legs: '#3a3a44' } });
    // martılar
    paths.push({ kind: 'kus', layer: 'hi', loop: true, v: 34, pts: [[42, 44, 0], [58, 50, 0], [52, 62, 0], [34, 60, 0], [26, 52, 0]], n: 2 });
    paths.push({ kind: 'kus', layer: 'hi', loop: true, v: 30, pts: [[50, 20, 0], [62, 30, 0], [58, 46, 0], [46, 34, 0]], n: 2 });
    paths.push({ kind: 'kus', layer: 'hi', loop: true, v: 38, pts: [[10, 50, 0], [24, 62, 0], [6, 66, 0], [-6, 56, 0]], n: 1 });
    { const r = rng(seed + 9), sea = [[20, 56, 30, 16], [56, 20, 14, 36], [46, 46, 6.5, 6.5], [-8, 58, 26, 10]];
      for (let i = 0; i < 46; i++) { const a = sea[Math.floor(r() * sea.length)]; ambient.push({ t: 'glint', x: a[0] + r() * a[2], y: a[1] + r() * a[3], z: Z.W }); }
      for (const [x, y] of [[18.6, 55.6], [14.6, 54.4], [10.4, 53], [6, 52.8], [2, 54.2], [-2, 57], [-6, 60.6]]) ambient.push({ t: 'dalga', x, y, z: Z.W, w: 30 });
      for (const [x, y] of [[30, 55.2], [40, 55.2], [55, 30], [55, 42]]) ambient.push({ t: 'dalga', x, y, z: Z.W, w: 22 });
      for (const [x, y, z] of [[29.6, 30, B + 1], [8, 13.4, A + .6], [9.9, 35.6, B + .8], [-3, 23.6, .6], [-12, 23, .6], [3, -8, B + .6], [41, 10, .8], [16, 45, .8], [20, 20.6, A + .5], [36, 36, B + .5]]) for (let k = 0; k < 3; k++) ambient.push({ t: 'ates', x: x + r() * 2 - 1, y: y + r() * 2 - 1, z });
      for (const [x, y, z] of [[-13, 4, .2], [-8, 12, .2], [27, -6, B + .2], [19, -6, B + .2], [36.6, 36.6, B + .5], [26, -18, B + .2], [-3.6, 33, .2]]) for (let k = 0; k < 2; k++) ambient.push({ t: 'kelebek', x: x + r() * 3 - 1.5, y: y + r() * 3 - 1.5, z });
      ambient.push({ t: 'bulut', x: -30, y: 10, z: 0, w: 380 }, { t: 'bulut', x: -20, y: 40, z: 0, w: 300 }, { t: 'bulut', x: -40, y: -10, z: 0, w: 440 }); }

    /* ================= ÇIKTI ================= */
    const t = T.out(), w = W.out();
    const ground = G.join('') + t.body + w.ground + `<g class="Zs">${SH.join('')}<path d="${t.shadow}"/><path d="${w.shadow}"/></g>`;
    // dokunulan nokta deniz mi? (ızgara koordinatı, su yüzeyi kotunda)
    const isSea = (x, y) => (x > 46 && x < 52.8 && y > 46 && y < 52.8) || (x > 55.8 && y > 21 && x - y < 41) || (y > 55.2 && x > 21 && y - x < 41) || (x > 50 && y > 54.8) || (y > 50 && x > 55.8) || (y > 58.5 && x > -8 && x <= 21) || (x > 51 && y < 21 && y > -2 && x > 55.5 - (21 - y) * .28);
    return { x: wx, y: wy, w: ww, h: wh, ground, body: w.body, fx: fx.concat(w.fx), tags, sprites, paths, ambient, moor, home: [29.6, 30, Z.B], isSea, seaZ: Z.W };
  };
})(typeof window !== 'undefined' ? window.CK : globalThis.CK);
