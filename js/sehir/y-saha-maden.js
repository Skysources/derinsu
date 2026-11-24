/* Saha manzarası — MADEN OCAĞI (Madencilik). Dünya haritasında saha altıgeninin içindeki küçük resim: tek kaya değil, damar damar bir ocak.
   opt: t (1–5: Bakır, Demir, Gümüş, Altın, Yıldız Demiri) · seed (yerleşim) · q (0–3 nitelik: zenginleştikçe ışık ve ayrıntı artar).
   Kadraj y-saha-odun.js ile aynı (kadraj koordinatı u, v). Arkada damarlı kaya duvarı (ormanın sık sıraları), bir yanda kerestesi çatılmış
   ocak ağzı ve ondan çıkan ray, raydaki vagon ve cevher yığını, öbür yanda kademenin yapısı, önde kazmalı kaya ve aletler.
   V. kademede duvar yerine göktaşı çukuru: çevresi yanık, kenarı camsı kaya, ortasında kristallerle sarılı yıldız demiri. */
(function (K) {
  'use strict';
  const { M, pr, f1, tone, toneOf, kf, ks, circ, pth, ln, unit, VIEW } = K, vd = K.dot;
  const S2 = p => f1(p[0]) + ' ' + f1(p[1]), P3 = p => S2(pr(p[0], p[1], p[2] || 0)), PG = ps => 'M' + ps.map(P3).join(' ') + 'Z', yol = ps => 'M' + ps.map(S2).join(' ') + 'Z';
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], lrp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const crs = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const alan = p => { let s = 0; for (let i = 0; i < p.length; i++) { const a = p[i], c = p[(i + 1) % p.length]; s += a[0] * c[1] - c[0] * a[1]; } return s; };
  const ek = p => pr(p[0], p[1], p[2] || 0);
  // çizim tamponu: art arda gelen aynı sınıflı yollar tek <path> olur
  const Tampon = () => { const L = []; return { add(c, d, e = '') { if (!d) return this; const l = L[L.length - 1]; if (l && l[0] === c && l[2] === e) l[1] += d; else L.push([c, d, e]); return this; }, raw(s) { L.push([null, s]); return this; }, svg: () => L.map(([c, d, e]) => c === null ? d : `<path class="${c}"${e} d="${d}"/>`).join('') }; };
  // kadraj altıgeni (sahne pikseli): merkez parsel ortası, 14 px yukarıda
  const WX = 0, WY = 84 - 14, icinde = (x, y, m = 5) => { const dy = Math.abs(y - WY); return dy <= 57.2 + m && Math.abs(x - WX) <= 66 + m - dy * .5774; };
  const gorunur = ps => { let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9; for (const p of ps) { const s = ek(p); x0 = Math.min(x0, s[0]); x1 = Math.max(x1, s[0]); y0 = Math.min(y0, s[1]); y1 = Math.max(y1, s[1]); }
    return icinde(Math.max(x0, Math.min(WX, x1)), Math.max(y0, Math.min(WY, y1))); };
  // ufuk: önden arkaya işlenen kayaların ekrandaki üst ve alt sınırı (2 px'lik sütunlar); arkada kalıp örtülen yüz ve ayrıntı çizilmez
  const Ufuk = () => { const T = new Map(), B = new Map();
    return { ekle(ps) { for (let i = 0; i < ps.length; i++) { const a = ps[i], c = ps[(i + 1) % ps.length], n = Math.max(1, Math.ceil(Math.abs(c[0] - a[0]) / 2));
        for (let k = 0; k <= n; k++) { const x = a[0] + (c[0] - a[0]) * k / n, y = a[1] + (c[1] - a[1]) * k / n, j = Math.round(x / 2); if (!(T.get(j) <= y)) T.set(j, y); if (!(B.get(j) >= y)) B.set(j, y); } } },
      gizli(x, y) { const j = Math.round(x / 2), t = T.get(j); return t !== undefined && y > t + 1.5 && y < B.get(j) - 1; } }; };

  /* ---------- KAYA KÜTLESİ: taban çokgeni P (ızgara), halkalar [[k, dx, dy, z], …] (her halka P'nin ağırlık merkezine göre k ölçeklisi + kayma).
     Görünen yan yüzler tek güneşe göre tonlanır; dışbükey olduğu için yüzler birbirini örtmez, sıra gerekmez. ---------- */
  const kaya = (P, H, col, r, o = {}) => {
    if (alan(P) < 0) P = P.slice().reverse();
    const n = P.length, c = [0, 0]; for (const p of P) { c[0] += p[0] / n; c[1] += p[1] / n; }
    const R = H.map(([k, dx, dy, z]) => P.map(p => [c[0] + (p[0] - c[0]) * k + dx, c[1] + (p[1] - c[1]) * k + dy, z])), F = [];
    for (let j = 0; j < R.length - 1; j++) for (let i = 0; i < n; i++) { const A = R[j][i], B = R[j][(i + 1) % n], C = R[j + 1][(i + 1) % n], D = R[j + 1][i], nn = unit(crs(sub(B, A), sub(D, A)));
      if (vd(nn, VIEW) > .03 && (!o.cull || gorunur([A, B, C, D]))) F.push({ A, B, C, D, n: nn, t: toneOf(nn) + (o.dt || 0) + (r() - .5) * (o.jit === undefined ? .06 : o.jit) }); }
    const xs = P.map(p => p[0]), ys = P.map(p => p[1]);
    return { F, T: R[R.length - 1], col, tt: .24 + (o.dt || 0) + (o.tdt || 0), pts: [].concat(...R), bb: [Math.min(...xs), Math.min(...ys), H[0][3], Math.max(...xs), Math.max(...ys), H[H.length - 1][3]] };
  };
  const kayaCiz = (Q, tb, kenar, gz) => { for (const f of Q.F.slice().sort((a, b) => a.t - b.t)) tb.add(kf(tone(Q.col, f.t)), PG([f.A, f.B, f.C, f.D]));
    if (gorunur(Q.T) && !(gz && Q.T.every(gz))) tb.add(kf(tone(Q.col, Q.tt)), PG(Q.T));
    if (kenar) { let d = ''; for (const f of Q.F) if (f.t > -.12 && f.n[2] < .5 && !(gz && gz(lrp(f.D, f.C, .5)))) d += `M${P3(f.D)} ${P3(f.C)}`; tb.add('Ln ' + ks(tone(Q.col, .36)), d, ' stroke-width=".8"'); } };
  const yp = (f, s, t) => lrp(lrp(f.A, f.B, s), lrp(f.D, f.C, s), t);      // yüzde (s, t): s alt kenar boyunca, t aşağıdan yukarı
  const ekranBoy = f => { const a = ek(f.A), b = ek(f.B); return Math.hypot(a[0] - b[0], a[1] - b[1]); };

  /* ---------- DAMAR: kadraj u'suna bağlı eğri yüzey z = h + e·u + a·sin(f·u + p); ince akar, yer yer şişip cevher cebi olur.
     Yüzden yüze aynı yükseklikte geçtiği için bütün duvarda kesintisiz bir katman gibi uzanır. ---------- */
  const dz = (d, u) => d.h + d.e * u + d.a * Math.sin(d.f * u + d.p);
  const dw = (d, u) => { const s = Math.max(0, Math.sin(d.f2 * u + d.p2)); return d.w * (.42 + 1.1 * s * s * s) * Math.max(0, Math.min(1, Math.sin(d.f3 * u + d.p3) + (d.k || .75))); };
  const damarYuz = (f, d, wu, gz) => {
    const N = Math.max(2, Math.ceil(ekranBoy(f) / 6)), out = [];
    for (let i = 0; i <= N; i++) { const s = i / N, a = lrp(f.A, f.B, s), e = lrp(f.D, f.C, s), h = e[2] - a[2];
      if (h < .06) { out.push(null); continue; }
      const ua = wu(a), ue = wu(e); let tc = (dz(d, ua) - a[2]) / h; const uu = ua + (ue - ua) * Math.max(0, Math.min(1, tc)); tc = (dz(d, uu) - a[2]) / h;
      const w = dw(d, uu), hw = w / h, t1 = Math.min(.96, tc + hw), t0 = Math.max(.04, tc - hw);
      out.push(t1 - t0 > .025 && !(gz && gz(lrp(a, e, t1)) && gz(lrp(a, e, t0))) ? { a, e, s, w, t0, t1, tc: Math.max(t0, Math.min(t1, tc)), th: Math.max(t0, Math.min(t1, tc + hw * .4)) } : null); }
    return out;
  };
  const serit = (S, ka, kb) => { let d = '', up = [], dn = []; const fl = () => { if (up.length > 1) d += PG(up.concat(dn.reverse())); up = []; dn = []; };
    for (const x of S) { if (!x) { fl(); continue; } up.push(lrp(x.a, x.e, x[kb])); dn.push(lrp(x.a, x.e, x[ka])); } fl(); return d; };

  /* ---------- topak (cevher ya da taş parçası): koyu taban, açık sol yan, ışıklı tepe; ekran pikseli ---------- */
  const topak = (x, y, s, r) => { const j = () => .8 + r() * .4;
    return [[x - s * j(), y], [x - s * .7 * j(), y - s * .75 * j()], [x - s * .1, y - s * 1.1 * j()], [x + s * .6 * j(), y - s * .8 * j()], [x + s * j(), y - s * .05], [x + s * .5, y + s * .4], [x - s * .45, y + s * .38]]; };
  const topakCiz = (tb, ps, col, parla, dt = 0) => { // ps: [[x, y, s, r], …]
    let a = '', b = '', c = '', g = ''; for (const [x, y, s, r] of ps) { const q = topak(x, y, s, r); a += yol(q); b += yol([q[0], q[1], q[2], [q[2][0] + s * .1, q[2][1] + s * .7], q[6]]); c += yol([q[1], q[2], q[3], [q[2][0] + s * .12, q[2][1] + s * .42]]); if (parla) g += `M${f1(q[2][0] - s * .2)} ${f1(q[2][1] + s * .32)}h.01`; }
    tb.add(kf(tone(col, dt - .38)), a).add(kf(tone(col, dt)), b).add(kf(tone(col, dt + .42)), c); if (g) tb.add('Ln ' + ks(parla), g, ` stroke-width="${f1(Math.max(1, ps[0][2] * .5))}"`); };
  // yığın: (cx, cy) taban ortası, R yarı en, H yükseklik; sıra sıra topak, arkadakiler önce
  const yigin = (tb, cx, cy, R, H, n, cols, r, parla) => { for (let row = 0; row < n; row++) { const k = (row + .6) / n, y = cy - H + k * H, w = R * Math.sqrt(k), m = Math.max(1, Math.round(w / (R * .3)));
    for (let i = 0; i < m; i++) { const col = cols[Math.floor(r() * cols.length)]; topakCiz(tb, [[cx - w + (i + .5) / m * 2 * w + (r() - .5) * R * .14, y + (r() - .5) * H * .08, R * (.2 + r() * .08), r]], col, col === cols[0] && parla); } } };

  /* ---------- aletler (ekran pikseli) ---------- */
  // kazma: (x, y) sivri ucun kayaya gömüldüğü yer; çeliği yana yukarı kıvrılır, sapı gözünden öbür yana yukarı kalkar (fl: aynalı)
  const kazma = (x, y, s, fl = 1) => { const X = d => f1(x + d * s * fl), Y = d => f1(y + d * s);
    return ln('#4a301c', `M${X(5.4)} ${Y(-4)}L${X(-5.6)} ${Y(-18.6)}`, f1(3 * s)) + ln('#d6a96c', `M${X(4.6)} ${Y(-4.9)}L${X(-6.3)} ${Y(-19.1)}`, f1(1.1 * s))
      + pth('#3d434b', `M${X(-1.5)} ${Y(-1)}Q${X(3)} ${Y(-6.8)} ${X(13)} ${Y(-9.2)}Q${X(4.8)} ${Y(-3)} ${X(1.5)} ${Y(1.1)}Z`)
      + pth('#dfe5ea', `M${X(-1.5)} ${Y(-1)}Q${X(3)} ${Y(-6.8)} ${X(13)} ${Y(-9.2)}Q${X(3.8)} ${Y(-4.6)} ${X(.1)} ${Y(-.3)}Z`)
      + pth('#2a2e34', `M${X(3.6)} ${Y(-5.6)}l${f1(2.4 * s * fl)} ${f1(-1.6 * s)}l${f1(1.4 * s * fl)} ${f1(2.2 * s)}l${f1(-2.4 * s * fl)} ${f1(1.6 * s)}z`); };
  // kürek: (x, y) ağzın gömüldüğü yer, sap yana yukarı
  const kurek = (x, y, s, fl = 1) => { const X = d => f1(x + d * s * fl), Y = d => f1(y + d * s);
    return ln('#6a4628', `M${X(0)} ${Y(-4)}L${X(6.5)} ${Y(-22)}M${X(4.6)} ${Y(-23.4)}l${f1(4.2 * s * fl)} ${f1(1.2 * s)}`, f1(1.7 * s)) + ln('#c99a62', `M${X(.6)} ${Y(-5)}L${X(6.8)} ${Y(-21.4)}`, f1(.6 * s))
      + pth('#5d646d', `M${X(-3.4)} ${Y(-1)}L${X(-1.6)} ${Y(-7)}L${X(2.6)} ${Y(-5.6)}L${X(2.2)} ${Y(.2)}L${X(-.6)} ${Y(2)}Z`) + pth('#b9c1c8', `M${X(-3.4)} ${Y(-1)}L${X(-1.6)} ${Y(-7)}L${X(.2)} ${Y(-6.4)}L${X(-1)} ${Y(1.4)}Z`); };
  // asılı fener: (x, y) askı noktası; gece hâle saçar
  const fener = (x, y, R = 15) => ln('#2e2a2a', `M${f1(x)} ${f1(y)}v2.6`, .8) + pth('#2e2a2a', `M${f1(x - 2.8)} ${f1(y + 2.6)}h5.6l-1 1.6h-3.6z`) + pth('#ffd98a>#fff1c2', `M${f1(x - 2.2)} ${f1(y + 4.2)}h4.4v5h-4.4z`)
    + pth('#fff6dc>#ffffff', `M${f1(x - 1.4)} ${f1(y + 4.8)}h1.4v3.6h-1.4z`) + pth('#2e2a2a', `M${f1(x - 2.8)} ${f1(y + 9.2)}h5.6v1.3h-5.6z`) + `<circle class="Nl" cx="${f1(x)}" cy="${f1(y + 6.8)}" r="${R}" fill="url(#${K.glowId()})"/>`;
  // dört köşeli pırıltı
  const yildiz = (x, y, k) => `M${f1(x)} ${f1(y - k * 2)}l${f1(k * .45)} ${f1(k * 1.55)}l${f1(k * 1.55)} ${f1(k * .45)}l${f1(-k * 1.55)} ${f1(k * .45)}l${f1(-k * .45)} ${f1(k * 1.55)}l${f1(-k * .45)} ${f1(-k * 1.55)}l${f1(-k * 1.55)} ${f1(-k * .45)}l${f1(k * 1.55)} ${f1(-k * .45)}z`;
  // kristal: taban (x, y), boy L, açı a (0 = dik yukarı), yarı en w; dört yüz, gece kendi rengiyle ışır
  const KR = { L: '#7d5ce8>#b29aff', R: '#4a32a8>#7a5ff0', TL: '#e2d8ff>#ffffff', TR: '#9a80f0>#cbb8ff' };
  const kristal = (tb, x, y, L, a, w) => { const ux = Math.sin(a), uy = -Math.cos(a), P = (k, m) => [x + ux * L * k - uy * w * m, y + uy * L * k + ux * w * m];
    tb.add(kf(KR.L), yol([P(0, -1), P(.74, -1), P(.86, .15), P(0, .15)])).add(kf(KR.R), yol([P(0, .15), P(.86, .15), P(.74, 1), P(0, 1)]))
      .add(kf(KR.TL), yol([P(.74, -1), P(1, 0), P(.86, .15)])).add(kf(KR.TR), yol([P(.86, .15), P(1, 0), P(.74, 1)])); };
  const obek = (tb, x, y, s, r, n = 5) => { const ks_ = []; for (let i = 0; i < n; i++) ks_.push([(i - (n - 1) / 2) * .42 + (r() - .5) * .25, (.55 + r() * .45) * (1 - Math.abs(i - (n - 1) / 2) / n * .9)]);
    ks_.sort((a, c) => a[1] - c[1]); for (const [a, k] of ks_) kristal(tb, x + a * 4 * s, y + Math.abs(a) * 1.5 * s, 16 * s * k, a, 2.6 * s * (.75 + k * .3)); };
  const morIsik = () => K.DEF('mdmor', () => `<radialGradient id="mdmor"><stop offset="0" stop-color="#c8b4ff" stop-opacity=".8"/><stop offset=".45" stop-color="#8a6af0" stop-opacity=".3"/><stop offset="1" stop-color="#6a4ad8" stop-opacity="0"/></radialGradient>`);

  /* ---------- KADEMELER: renkler, kaya biçimi, damar ölçüsü ---------- */
  const KADEME = [null,
    // I · bakır: güneşli kumtaşı ocağı, basamaklı yarlar; yeşil malakit damarları, turuncu bakır topakları
    { stil: 'basamak', kaya: '#d39b5e', zemin: '#d8c094', koyu: '#c9ab7c', acik: '#e7d4a8', yol: '#ecdcb6', taban: '#c09a68', ot: '#8d8f4c',
      cev: '#2f9a68', cevA: '#9be6bc', top: '#e6743a', topA: '#ffd2a0', h1: [.62, .72], h2: [1.3, 1.5], dh: [.3, .52], dw: .08, vb: -2.4, cicek: ['#f2e8d2', '#e8c43a', '#d8603a'] },
    // II · demir: boz-kahve kaba kaya, pas kızılı damarlar ve akıntılar; izabe ocağı, cüruf
    { stil: 'kirik', kaya: '#8d7f74', zemin: '#a69684', koyu: '#8f7f6e', acik: '#b8a895', yol: '#beb09c', taban: '#7d6e61', ot: '#857a52',
      cev: '#a83b25', cevA: '#ec8a58', top: '#a8432a', topA: '#f0a070', pas: '#b8643a', h1: [.7, 1.05], h2: [1.2, 1.6], dh: [.28, .58], dw: .078, vb: -2.45, cicek: ['#f2e8d2', '#e8c43a', '#b07ad0'] },
    // III · gümüş: soğuk mavi-gri granit, ak gümüş damar ağları; ahşap kuyu kulesi
    { stil: 'blok', kaya: '#7d8a98', zemin: '#a5adb2', koyu: '#919aa1', acik: '#bcc3c7', yol: '#c6ccce', taban: '#7c858e', ot: '#7d8a6c',
      cev: '#f4f8fb', cevA: '#ffffff', kenar: '#36445a', top: '#e8eff5', topA: '#ffffff', parilti: '#ffffff', h1: [.7, 1.05], h2: [1.2, 1.6], dh: [.3, .6], dw: .07, vb: -2.5, cicek: ['#f6f6f2', '#7aa6e0', '#c8b4ec'] },
    // IV · altın: kara bazalt sütunlar, zengin altın damarları; fenerli dehliz, yıkama oluğu
    { stil: 'sutun', kaya: '#4f4b57', zemin: '#8b806f', koyu: '#776d60', acik: '#9f9381', yol: '#a89c86', taban: '#5e5850', ot: '#7f7a4a',
      cev: '#f2be34>#a08a42', cevA: '#fff3b0>#d6c68e', top: '#f6c843>#b39a4a', topA: '#fffbe6>#f2e8c4', dh: [.32, .7], dw: .085, dk: 1.4, parilti: '#fffbe0>#fff2c0', vb: -2.45, cicek: [] },
    // V · yıldız demiri: göktaşı çukuru, mavi-kara camsı kaya, mor kristal öbekleri
    { stil: 'cam', kaya: '#30374e', zemin: '#7c7884', koyu: '#69656f', acik: '#8e8a95', yol: '#94909a', taban: '#3a3844', ot: '#6f6a5c',
      cev: '#7d5ce8>#b29aff', cevA: '#d9ccff>#ffffff', top: '#7d5ce8>#b29aff', topA: '#ffffff', dh: [.22, .5], dw: .04, vb: -2.6, cicek: [] },
  ];

  CK.def('saha-maden', { w: 7, d: 7, name: 'Maden sahası' }, (b, K2, opt) => {
    const t = Math.max(1, Math.min(5, opt.t || 1)), q = opt.q || 0, Kd = KADEME[t], r = b.r, ayna = r() < .5 ? -1 : 1, fl = ayna > 0 ? 1 : -1;
    const at = (u, v) => [3.5 + (v + u * ayna) / 2, 3.5 + (v - u * ayna) / 2];      // kadraj → ızgara
    const g3 = (u, v, z = 0) => { const p = at(u, v); return [p[0], p[1], z]; };
    const wu = p => (p[0] - p[1]) * ayna;
    const tabanUV = (u, v, g, d, n) => { const ps = []; for (let i = 0; i < n; i++) { const a = (i + .3 + r() * .4) / n * 6.283, k = .84 + r() * .24; ps.push(at(u + Math.cos(a) * g / 2 * k, v + Math.sin(a) * d / 2 * k)); } return K.hull(ps); };
    // yerel eksenler: a = ekranda sağ-aşağı ızgara ekseni, c = sol-aşağı; aynada x ile y yer değiştirir
    const loc = (o, a, c, z = 0) => { const p = at(o[0] + a - c, o[1] + a + c); return [p[0], p[1], z]; };
    const lbox = (o, a0, a1, c0, c1, z0, z1, mat, op = {}) => { const p = at(o[0], o[1]), X = ayna > 0 ? [a0, a1, c0, c1] : [c0, c1, a0, a1]; return b.box(p[0] + X[0], p[1] + X[2], z0, p[0] + X[1], p[1] + X[3], z1, mat, op); };
    const ogeK = (Q, tb, h) => b.item(Q.bb.slice(0, 5).concat([h || Q.bb[5]]), tb.svg(), { pts: Q.pts });
    const krater = Kd.stil === 'cam', Kc = [(r() - .5) * .3, -1.2], Rk = 2.15;

    /* ---------- zemin: düz ton, açık-koyu lekeler, ocak tabanı, çakıl ---------- */
    b.pave(-3, -3, 10, 10, Kd.zemin);
    { const L = ['', '']; for (let i = 0; i < 12; i++) { const [cx, cy] = at(-3 + r() * 6, -5 + r() * 9), rr = .7 + r() * 1.1, pts = []; for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283, d = rr * (.7 + r() * .5); pts.push([cx + Math.cos(a) * d * 1.4, cy + Math.sin(a) * d, 0]); } L[i % 2] += PG(pts); }
      b.ground(pth(Kd.acik, L[0], 'opacity=".5"') + pth(Kd.koyu, L[1], 'opacity=".5"')); }
    if (!krater) { b.gpoly([[-2.4, -1.5], [-.6, -2], [1.4, -1.8], [2.7, -.7], [2.3, 1.5], [.6, 2.7], [-1.5, 2.5], [-2.5, 1.2]].map(p => at(p[0], p[1])), Kd.yol, { op: .55 });
      b.gpoly([[-3.6, -3.2], [3.6, -3.2], [3.4, -1.5], [1.6, -1.9], [0, -2.15], [-1.7, -1.8], [-3.4, -1.4]].map(p => at(p[0], p[1])), Kd.taban, { op: .5 }); }
    else { // yanık halka: çukurun çevresinde ışınsal kara izler
      let iz = ''; for (let i = 0; i < 18; i++) { const a = i / 18 * 6.283 + r() * .25, w = .06 + r() * .12, L = Rk + (Math.sin(a) > .3 ? .35 + r() * .45 : .5 + r() * 1.4), P = (rr, aa) => g3(Kc[0] + Math.cos(aa) * rr, Kc[1] + Math.sin(aa) * rr);
        iz += PG([P(Rk * .9, a - w * 1.6), P(L, a - w * .3), P(L + .25, a), P(L, a + w * .3), P(Rk * .9, a + w * 1.6)]); }
      b.ground(pth(Kd.taban, iz, 'opacity=".55"'));
      const hal = (rr, z = 0) => { const ps = []; for (let i = 0; i < 20; i++) { const a = i / 20 * 6.283; ps.push(g3(Kc[0] + Math.cos(a) * rr * (1 + Math.sin(a * 3 + 1) * .03), Kc[1] + Math.sin(a) * rr, z)); } return ps; };
      b.gpoly(hal(Rk + .55).map(p => [p[0], p[1]]), tone(Kd.taban, .1), { op: .55 }); }
    { const a = [], c = []; for (let i = 0; i < 56; i++) { const p = pr(...g3(-2.8 + r() * 5.6, -2.4 + r() * 6)); (r() < .55 ? a : c).push(p); } b.ground(K.dots(tone(Kd.zemin, -.22), a, 1.6) + K.dots(tone(Kd.zemin, .22), c, 1.2)); }

    /* ---------- arka: damarlı kaya duvarı — tek parça çizilir, her şeyin arkasında kalır ---------- */
    const D = []; for (let i = 0; i < 2; i++) D.push({ h: Kd.dh[i] + (r() - .5) * .08, e: (r() - .5) * .12, a: .04 + r() * .05, f: .9 + r() * .8, p: r() * 6.3, w: Kd.dw * (.9 + r() * .25), f2: 1.3 + r() * 1.2, p2: r() * 6.3, f3: .7 + r() * .6, p3: r() * 6.3, k: Kd.dk });
    // kayanın ayrıntısı: katman çizgileri (kumtaşı), benekler (granit), çatlaklar, damarlar, topaklar, pas akıntısı, camsı parıltı
    const ayrinti = (Q, tb, D, sade, gz) => {
      const kol = Q.col, gp = p => gz && gz(p);
      for (const f of Q.F) { const L = ekranBoy(f), h = f.D[2] - f.A[2]; if (L < 3 || h < .08) continue;
        if (Kd.stil === 'basamak') { let d = '', e = ''; for (let z = .17; z < h - .05; z += .2) { const tt = z / h, j = [(r() - .5) * .04, (r() - .5) * .05, (r() - .5) * .04], p1 = yp(f, .5, tt + j[1]); if (gp(p1)) continue;
            d += `M${P3(yp(f, .02, tt + j[0]))} ${P3(p1)} ${P3(yp(f, .98, tt + j[2]))}`; const k = .035 / h; e += `M${P3(yp(f, .02, tt + j[0] - k))} ${P3(yp(f, .5, tt + j[1] - k))} ${P3(yp(f, .98, tt + j[2] - k))}`; }
          tb.add('Ln ' + ks(tone(kol, f.t - .16)), d, ' stroke-width=".8"').add('Ln ' + ks(tone(kol, f.t + .12)), e, ' stroke-width=".7"'); }
        if (Kd.stil === 'blok') { const ps = [], qs = []; for (let i = 0; i < L * h * .2; i++) { const p = yp(f, .06 + r() * .88, .06 + r() * .88); if (!gp(p)) (r() < .5 ? ps : qs).push(ek(p)); } tb.add('Ln ' + ks(tone(kol, f.t + .2)), ps.map(p => `M${S2(p)}h.01`).join(''), ' stroke-width="1.3"').add('Ln ' + ks(tone(kol, f.t - .24)), qs.map(p => `M${S2(p)}h.01`).join(''), ' stroke-width="1.1"'); }
        if (Kd.stil === 'cam' && f.t > -.2 && L > 8) { const s0 = .2 + r() * .4; tb.add('Ln ' + ks('#c6d4f0'), `M${P3(yp(f, s0, .85))} ${P3(yp(f, s0 + .25, .35))}`, ' stroke-width=".9" opacity=".55"'); }
        if (!sade && r() < .45 && L > 9) { const s0 = .15 + r() * .7; if (!gp(yp(f, s0, .7))) { let d = `M${P3(yp(f, s0, .96))}`; for (let k = 1; k < 4; k++) d += ` ${P3(yp(f, Math.max(.03, Math.min(.97, s0 + (r() - .5) * .22)), .96 - k * (.17 + r() * .1)))}`; tb.add('Ln ' + ks(tone(kol, f.t - .3)), d, ' stroke-width=".8"'); } }
      }
      for (const f of Q.F) for (const d of D) { const S = damarYuz(f, d, wu, gz); if (!S.some(Boolean)) continue;
        if (Kd.kenar) tb.add(kf(tone(Kd.kenar, f.t * .4)), serit(S.map(x => x && Object.assign({}, x, { t0: Math.max(.03, x.t0 - .04), t1: Math.min(.97, x.t1 + .04) })), 't0', 't1'));
        tb.add(kf(tone(Kd.cev, f.t * .45)), serit(S, 't0', 't1'));
        if (f.t > -.36 && ekranBoy(f) > 7) tb.add(kf(tone(Kd.cevA, f.t * .25)), serit(S, 'tc', 'th'));
        if (Kd.pas) { let pd = ''; for (const x of S) if (x && r() < .3) { const w = .03 + r() * .04, l = .14 + r() * .28, s1 = Math.min(1, x.s + w); pd += PG([lrp(x.a, x.e, x.t0), lrp(lrp(f.A, f.B, s1), lrp(f.D, f.C, s1), x.t0), lrp(lrp(f.A, f.B, x.s + w * .5), lrp(f.D, f.C, x.s + w * .5), Math.max(.02, x.t0 - l))]); } tb.add(kf(tone(Kd.pas, f.t * .4)), pd, ' opacity=".6"'); }
        const nk = []; for (const x of S) if (x && x.w > d.w * .8 && r() < (Kd.stil === 'sutun' ? .32 : .5)) { const p = ek(lrp(x.a, x.e, x.tc)); nk.push([p[0] + (r() - .5) * 2, p[1] + .6, 1.5 + r() * 1.3, r]); }
        if (nk.length) topakCiz(tb, nk, Kd.top, Kd.topA, f.t * .3);
        if (Kd.parilti && f.t > -.4) { let g = ''; for (const n of nk) if (r() < .4) g += yildiz(n[0] - 1, n[1] - 3, .8 + r() * .5); tb.add(kf(Kd.parilti), g); }
      }
    };
    // önden arkaya örtme hesabıyla süzer, arkadan öne boyar
    const duvarCiz = (liste, sade) => { const uf = Ufuk(), parca = [], gz = p => { const s = ek(p); return uf.gizli(s[0], s[1]); };
      liste.sort((a, c) => c.v - a.v);
      for (const Q of liste) { Q.F = Q.F.filter(f => ![f.A, f.B, f.C, f.D, lrp(f.A, f.C, .5), lrp(f.D, f.C, .5), lrp(f.A, f.D, .5), lrp(f.B, f.C, .5)].every(gz)); if (!Q.F.length && Q.T.every(gz)) continue;
        const tb = Tampon(); kayaCiz(Q, tb, true, gz); ayrinti(Q, tb, D, sade, gz); if (Q.ek) Q.ek(tb); parca.push(tb.svg());
        for (const f of Q.F) uf.ekle([f.A, f.B, f.C, f.D].map(ek)); uf.ekle(Q.T.map(ek)); }
      return parca.reverse().join(''); };
    const vb = u => Kd.vb + .12 * u * u;
    const ua = -1.15 + (r() - .5) * .25, A0 = [ua, vb(ua) + .55], aw = .88, ah = 1.02;      // ocak ağzı
    const yapiU = 1.25 + (r() - .5) * .2, yapiV = vb(yapiU) + .35;                          // kademe yapısının yeri (öbür yanda)
    if (!krater) {
      const duvar = [];
      const yap = (u, v, g, d, h, st) => { const P = tabanUV(u, v, g, d, 6 + (r() < .5 ? 1 : 0)), sh = -.04 - r() * .05, j = () => (r() - .5) * .1;
        const H = st === 'basamak' ? [[1, 0, 0, 0], [.98, sh, sh, h * .88], [.93, sh * 1.3, sh * 1.3, h]]
          : st === 'blok' ? [[1, 0, 0, 0], [.98, sh, sh, h * .58], [.88, sh * 1.6 + j(), sh * 1.6, h * .86], [.62, sh * 2.2, sh * 2.2 + j(), h]]
          : [[1, 0, 0, 0], [.94, sh + j(), sh + j(), h * .45], [.78, sh * 2 + j(), sh * 2 + j(), h * .78], [.46, sh * 3 + j(), sh * 3, h]];
        const Q = kaya(P, H, tone(Kd.kaya, (r() - .5) * .1), r, { jit: .07, cull: true }); Q.v = v; return Q; };
      if (Kd.stil === 'sutun') {
        // IV · bazalt: sık altıgen sütunlar; önde alçak, arkada yüksek basamaklar
        const R = .42;
        for (let row = 0; row < 3; row++) for (let i = -5; i <= 5; i++) { const uu = (i + (row % 2) * .5) * R * 1.5, vv = vb(uu) - .3 - row * .78 + (r() - .5) * .12;
          if (Math.abs(uu) > 3.3) continue; const P = []; for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283 + .1; P.push(at(uu + Math.cos(a) * R, vv + Math.sin(a) * R)); }
          const h = (row === 0 ? .45 + r() * .5 : row === 1 ? .85 + r() * .45 : 1.3 + r() * .4) - (Math.abs(uu) > 2.2 ? .15 : 0);
          const Q = kaya(P, [[1, 0, 0, 0], [1, 0, 0, h], [.78, 0, 0, h + .06]], tone(Kd.kaya, (r() - .5) * .16), r, { jit: .05, cull: true }); Q.v = vv; if (Q.F.length) duvar.push(Q); }
      } else {
        // ön sıra alçak ve geniş (üstleri seki), arka sıra yüksek: kadrajın tepesini doldurur
        for (let u = -3.6 + r() * .4; u < 3.6;) { const g = 1.5 + r() * .7, uc = u + g / 2, d = .95 + r() * .35; duvar.push(yap(uc, vb(uc) - d / 2 + (r() - .5) * .25, g, d, Kd.h1[0] + r() * (Kd.h1[1] - Kd.h1[0]), Kd.stil)); u += g * .68; }
        for (let u = -3.2 + r() * .4; u < 3.4;) { const g = 1.6 + r() * .7, uc = u + g / 2, d = 1.1 + r() * .4; duvar.push(yap(uc, vb(uc) - 1.45 - d / 2, g, d, Kd.h2[0] + r() * (Kd.h2[1] - Kd.h2[0]), Kd.stil)); u += g * .7; }
      }
      // ocak ağzının kayası: önü yassı (ağız yüzü), arkası duvara gömülür
      { const P = [[0, -.95], [0, .95], [-1.1, 1.15], [-1.7, 0], [-1.1, -1.15]].map(p => { const g = loc(A0, p[0], p[1]); return [g[0], g[1]]; });
        const Q = kaya(P, Kd.stil === 'basamak' ? [[1, 0, 0, 0], [1, 0, 0, 1.12], [.94, -.06, -.06, 1.2]] : Kd.stil === 'blok' ? [[1, 0, 0, 0], [1, 0, 0, 1.1], [.88, -.1, -.1, 1.34], [.6, -.2, -.2, 1.5], [.3, -.28, -.28, 1.6]] : [[1, 0, 0, 0], [1, 0, 0, 1.15], [.82, -.12 + (r() - .5) * .16, -.1 + (r() - .5) * .16, 1.36], [.62, -.24, -.3, 1.5], [.3, -.34, -.38, 1.7]], tone(Kd.kaya, -.03), r, { jit: .08, cull: true }); Q.v = A0[1] - .5; Q.agiz = true; duvar.push(Q); }
      b.item([-60, -60, -3, -59, -59, -2], duvarCiz(duvar), { cast: false });

      /* ---------- ocak ağzı: yassı yüzde karanlık açıklık, içeride derin çatkı ve raylar; önde kereste çatkı ---------- */
      const o0 = loc(A0, 0, -aw / 2), o1 = loc(A0, 0, aw / 2), o2 = loc(A0, 0, aw / 2, ah), o3 = loc(A0, 0, -aw / 2, ah), ic = t === 4 ? '#211a17>#5a3416' : '#211a17>#2e2018';
      let s = pth(ic, PG([o0, o1, o2, o3])) + pth(tone(ic, .14), PG([o0, o1, loc(A0, 0, aw / 2, .14), loc(A0, 0, -aw / 2, .14)]));
      s += ln('#3a2a1e>#6a4422', `M${P3(loc(A0, 0, -aw / 2 + .5, .1))} ${P3(loc(A0, 0, -aw / 2 + .5, ah - .06))}M${P3(loc(A0, 0, -aw / 2 + .05, ah * .74))} ${P3(loc(A0, 0, aw / 2 - .05, ah * .74))}`, 2.2);
      s += ln('#5a5a62', `M${P3(loc(A0, 0, -.27))} ${P3(loc(A0, 0, -.27, .2))}M${P3(loc(A0, 0, .27))} ${P3(loc(A0, 0, .27, .2))}`, 1);
      const pa = at(...A0); b.item(ayna > 0 ? [pa[0] - .1, pa[1] - aw / 2, 0, pa[0], pa[1] + aw / 2, ah] : [pa[0] - aw / 2, pa[1] - .1, 0, pa[0] + aw / 2, pa[1], ah], s, { cast: false });
      const odun = '#8c6239';
      for (const c of [-aw / 2 - .15, aw / 2]) { const bx = lbox(A0, 0, .15, c, c + .15, 0, ah, odun, { edge: false, cast: false }); bx.L.planks({ dir: 'v', step: .07, dt: -.1 }); }
      lbox(A0, -.02, .18, -aw / 2 - .26, aw / 2 + .26, ah, ah + .17, tone(odun, .06), { edge: false, cast: false });
      // dikmenin önünde kollu fener; IV'te iki yanda, dehlizin içi de ışıklı
      for (const c of t === 4 ? [-aw / 2 - .075, aw / 2 + .075] : [-aw / 2 - .075]) { const p = ek(loc(A0, .3, c, ah * .8)), q0 = ek(loc(A0, .15, c, ah * .84)), g = loc(A0, .3, c); b.spill(...loc(A0, .6, c).slice(0, 2), t === 4 ? 1.5 : 1.1);
        b.item([g[0] - .05, g[1] - .05, ah * .5, g[0] + .05, g[1] + .05, ah * .85], ln(M.ahsapK, `M${f1(q0[0])} ${f1(q0[1])}L${f1(p[0])} ${f1(p[1])}`, 1.4) + fener(p[0], p[1], t === 4 ? 18 : 14), { cast: false }); }
      if (t === 4) b.spill(...loc(A0, .2, 0).slice(0, 2), 1.4);
    } else {
      /* ---------- V · göktaşı çukuru: kül dudaklı çanak, bize bakan arka iç yamaç, camsı kara taban; arka kenarda kaya dişleri ve kristaller ---------- */
      const hal = (rr, z, dv = 0) => { const ps = []; for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; ps.push(g3(Kc[0] + Math.cos(a) * rr * (1 + Math.sin(a * 3 + 1) * .025), Kc[1] + dv + Math.sin(a) * rr, z)); } return ps; };
      const zc = -.42, rf = Rk * .6, dvf = Rk + zc * 29.4 / 12 - rf, CW = '#4d5676', CF = '#22273a';      // taban, önü kenarla çakışacak kadar geride
      b.gpoly(hal(Rk + .32, 0).map(p => [p[0], p[1]]), '#aaa5b2'); b.gpoly(hal(Rk + .1, 0).map(p => [p[0], p[1]]), '#8f8a99');
      b.gpoly(hal(Rk, 0).map(p => [p[0], p[1]]), CW);
      { let d = ''; for (let i = 0; i < 13; i++) { const a = Math.PI * (1.1 + i / 12 * .8) + (r() - .5) * .06, p0 = g3(Kc[0] + Math.cos(a) * Rk * .97, Kc[1] + Math.sin(a) * Rk * .97, 0), p1 = g3(Kc[0] + Math.cos(a) * rf, Kc[1] + dvf + Math.sin(a) * rf, zc); d += `M${P3(p0)} ${P3(lrp(p0, p1, .55 + r() * .4))}`; }
        b.ground(ln(tone(CW, .3), d, 1.3) + pth(CF, PG(hal(rf, zc, dvf))) + pth(tone(CF, -.25), PG(hal(rf * .62, zc, dvf + rf * .3)))); }
      { let d = ''; for (let i = 0; i < 8; i++) { const a = r() * 6.283, rr = .3 + r() * rf * .6, p = g3(Kc[0] + Math.cos(a) * rr, Kc[1] + dvf + Math.sin(a) * rr * .8, zc); let s = `M${P3(p)}`; for (let k = 0; k < 3; k++) { p[0] += (r() - .5) * .5; p[1] += (r() - .5) * .5; s += ` ${P3(p)}`; } d += s; }
        b.ground(ln('#6a4ad8>#b39cff', d, 1.2)); }
      // dışarı saçılmış camsı kırıntı
      { const a = []; for (let i = 0; i < 22; i++) { const an = r() * 6.283, rr = Rk + .5 + r() * 1.3; a.push(ek(g3(Kc[0] + Math.cos(an) * rr, Kc[1] + Math.sin(an) * rr))); } b.ground(K.dots('#2e3346', a, 2.4) + K.dots('#6c7798', a.map(p => [p[0] - .6, p[1] - .7]), 1)); }
      // arka kenar: camsı kaya dişleri, gerisinde iri kara kayalar; aralarında kristal öbekleri
      const dis = [];
      for (let i = 0; i < 6; i++) { const a = Math.PI * (1.08 + i / 5 * .84) + (r() - .5) * .1, rr = Rk + .2 + r() * .2, u = Kc[0] + Math.cos(a) * rr, v = Kc[1] + Math.sin(a) * rr, h = .5 + r() * .5 + (Math.abs(Math.cos(a)) < .5 ? .15 : 0);
        const P = tabanUV(u, v, .9 + r() * .5, .65 + r() * .3, 5 + (r() < .5 ? 1 : 0)), ox = Math.cos(a) * .12, oy = Math.sin(a) * .12, o2 = at(ox, oy), sx = o2[0] - 3.5, sy = o2[1] - 3.5;
        const Q = kaya(P, [[1, 0, 0, 0], [.72, sx * .5, sy * .5, h * .55], [.24, sx, sy, h]], tone(Kd.kaya, (r() - .5) * .16), r, { jit: .14, cull: true }); Q.v = v; dis.push(Q); }
      // dışarı devrilmiş camsı levhalar: tepeleri çukurdan dışa yatık, alçak ve kırık
      for (let i = 0; i < 5; i++) { const a = Math.PI * (1.1 + i / 4 * .8) + (r() - .5) * .12, rr = Rk + 1.05 + r() * .45, u = Kc[0] + Math.cos(a) * rr, v = Kc[1] + Math.sin(a) * rr, h = .62 + r() * .4;
        const o2 = at(Math.cos(a) * .32, Math.sin(a) * .32), sx = o2[0] - 3.5, sy = o2[1] - 3.5, j = () => (r() - .5) * .14;
        const P = tabanUV(u, v, 1.2 + r() * .5, .85, 5 + (r() < .5 ? 1 : 0)), Q = kaya(P, [[1, 0, 0, 0], [.78, sx * .45 + j(), sy * .45 + j(), h * .55], [.36, sx + j(), sy + j(), h], [.12, sx * 1.1, sy * 1.1, h * 1.04]], tone('#474d66', (r() - .5) * .12), r, { jit: .14, cull: true }); Q.v = v; dis.push(Q); }
      for (let i = 0; i < 3; i++) { const a = Math.PI * (1.2 + i / 2 * .6) + (r() - .5) * .12, u = Kc[0] + Math.cos(a) * (Rk + .05), v = Kc[1] + Math.sin(a) * (Rk + .05), p = g3(u, v, 0), s = .85 + r() * .3;
        dis.push({ F: [], T: [p], v: v + .3, col: Kd.kaya, tt: 0, ek: tb => { const e = ek(p); tb.raw(`<circle class="Nl" cx="${f1(e[0])}" cy="${f1(e[1] - 8)}" r="${f1(17 * s)}" fill="url(#${morIsik()})"/>`); obek(tb, e[0], e[1], s, r, 4 + (r() < .6 ? 1 : 0)); } }); }
      b.item([-60, -60, -3, -59, -59, -2], duvarCiz(dis, true), { cast: false });
      // ön kenar: alçak taşlar
      for (let i = 0; i < 4; i++) { const a = Math.PI * (.2 + i / 3 * .6) + (r() - .5) * .12, u = Kc[0] + Math.cos(a) * (Rk + .12), v = Kc[1] + Math.sin(a) * (Rk + .12), P = tabanUV(u, v, .5 + r() * .3, .35, 5);
        const Q = kaya(P, [[1, 0, 0, 0], [.7, 0, 0, .12 + r() * .08], [.3, 0, 0, .19 + r() * .08]], tone(Kd.kaya, .08), r, { jit: .1 }), tv = Tampon(); kayaCiz(Q, tv); ogeK(Q, tv); }
      // yıldız demiri: tabanda yarı gömülü iri kütle; parmak izi çukurları, mor ışıyan yarıklar, yanlarında kristaller, tepesinde kazma
      { const mu = Kc[0] + (r() - .5) * .3, mv = Kc[1] + dvf - .1, h = .88, yn = r() < .5 ? .07 : -.07, tv = Tampon();
        // yanında ikinci, küçük parça (arkada kalırsa önce çizilir)
        { const su = mu + (r() < .5 ? -.75 : .75), P2 = tabanUV(su, mv - .25, .8, .6, 6), Q2 = kaya(P2, [[1, 0, 0, zc], [.8, 0, 0, zc + .3], [.4, -.03, -.03, zc + .48]], '#3a4462', r, { jit: .12, dt: .04 }); kayaCiz(Q2, tv, true); }
        const P = tabanUV(mu, mv, 1.65, 1.15, 7), Q = kaya(P, [[1, 0, 0, zc], [.9, yn * .4, -yn * .3, zc + h * .45], [.66, yn, -yn * .6 - .05, zc + h * .8], [.32, yn * 1.3, -yn * .8 - .08, zc + h]], '#3d4768', r, { jit: .12, dt: .06 });
        const c0 = ek(g3(mu, mv, zc)); tv.raw(`<circle class="Nl" cx="${f1(c0[0])}" cy="${f1(c0[1] - 10)}" r="36" fill="url(#${morIsik()})"/>`);
        kayaCiz(Q, tv, true);
        let cu = ''; for (const f of Q.F) if (ekranBoy(f) > 11 && r() < .6) { const p = ek(yp(f, .25 + r() * .5, .3 + r() * .4)); cu += `M${f1(p[0] - 1.5)} ${f1(p[1])}a1.5 .9 0 1 0 3 0a1.5 .9 0 1 0 -3 0Z`; }
        tv.add(kf('#2a3048'), cu);
        let yr = ''; for (const f of Q.F) if (ekranBoy(f) > 8 && r() < .6) { const s0 = .2 + r() * .6; yr += `M${P3(yp(f, s0, .92))} ${P3(yp(f, s0 + (r() - .5) * .3, .55))} ${P3(yp(f, s0 + (r() - .5) * .4, .15))}`; }
        tv.add('Ln ' + ks('#8f6af0>#d2c2ff'), yr, ' stroke-width="1.5"').add('Ln ' + ks('#efe8ff>#ffffff'), yr, ' stroke-width=".5"');
        for (const f of Q.F) if (f.t > -.15 && ekranBoy(f) > 9) { const s0 = .25 + r() * .3; tv.add('Ln ' + ks('#c4d2f4'), `M${P3(yp(f, s0, .85))} ${P3(yp(f, s0 + .28, .3))}`, ' stroke-width="1.1" opacity=".7"'); }
        const ct = Q.T.reduce((s, p) => [s[0] + p[0] / Q.T.length, s[1] + p[1] / Q.T.length], [0, 0]), tp = pr(ct[0], ct[1], zc + h);
        obek(tv, c0[0] - 22, c0[1] + 3, .95, r, 5); obek(tv, c0[0] + 20, c0[1] + 5, .78, r, 4);
        tv.raw(kazma(tp[0] + 1 * fl, tp[1] + 1.5, 1.1, fl));
        let pz = ''; for (let i = 0; i < 6; i++) pz += yildiz(c0[0] + (r() - .5) * 64, c0[1] - 6 - r() * 26, .55 + r() * .5); tv.add(kf('#efe8ff>#ffffff'), pz);
        ogeK(Q, tv, .9); }
    }

    /* ---------- ray: ağızdan sağ-aşağı uzanır; traversler, iki demir ray, ucunda takoz ---------- */
    const R0 = A0, Lr = 2.3, ac = 1.3 + (r() - .5) * (t === 2 ? .2 : .34);
    if (!krater) { let tr = '', ry = '', rh = ''; const a0 = -.02; for (let a = .12; a < Lr; a += .3) tr += `M${P3(loc(R0, a, -.4))} ${P3(loc(R0, a, .4))}`;
      for (const c of [-.27, .27]) { ry += `M${P3(loc(R0, a0, c))} ${P3(loc(R0, Lr, c))}`; const p0 = ek(loc(R0, a0, c)), p1 = ek(loc(R0, Lr, c)); rh += `M${f1(p0[0])} ${f1(p0[1] - .7)}L${f1(p1[0])} ${f1(p1[1] - .7)}`; }
      b.ground(ln('#6e4c30', tr, 2.6) + ln('#45434a', ry, 1.4) + ln('#b3b6bd', rh, .6));
      lbox(R0, Lr - .03, Lr + .1, -.33, .33, 0, .15, '#7a5434', { edge: false }); }

    /* ---------- vagon: daralan sac tekne, kuşaklar, görünen yanda iki tekerlek, üstü tepeleme cevher (V'te yok: çukurun kendisi odak) ---------- */
    if (!krater) { const L = .9, W = .6, z0 = .17, z1 = .63, mat = '#6a645f';
      const P = [[-L / 2, -W / 2], [L / 2, -W / 2], [L / 2, W / 2], [-L / 2, W / 2]].map(([a, c]) => { const g = loc(R0, ac + a, c); return [g[0], g[1]]; });
      const Q = kaya(P, [[.84, 0, 0, z0], [1.07, 0, 0, z1]], mat, r, { jit: 0 }), tv = Tampon();
      kayaCiz(Q, tv);
      for (const f of Q.F) { let d = ''; for (const tt of [.16, .84]) d += `M${P3(yp(f, 0, tt))} ${P3(yp(f, 1, tt))}`; for (const ss of [.12, .88]) d += `M${P3(yp(f, ss, .05))} ${P3(yp(f, ss, .95))}`; tv.add('Ln ' + ks(tone(mat, f.t - .2)), d, ' stroke-width=".9"'); }
      tv.add(kf(tone(mat, -.62)), PG(Q.T));
      const c0 = Q.T.reduce((s, p) => [s[0] + p[0] / 4, s[1] + p[1] / 4], [0, 0]), tp = pr(c0[0], c0[1], z1);
      yigin(tv, tp[0], tp[1] + 4, 14.5, 12, 3, [Kd.top, Kd.top, Kd.cev, Kd.top, tone(Kd.kaya, .1)], r, Kd.topA);
      tv.add('Ln ' + ks(tone(mat, .32)), `M${Q.T.map(P3).join(' ')}Z`, ' stroke-width=".9"');
      const e1 = sub(loc(R0, 1, 0), loc(R0, 0, 0));
      for (const a of [-L * .27, L * .27]) { const c = loc(R0, ac + a, W / 2 + .02, .17), pts = []; for (let i = 0; i < 12; i++) { const th = i / 12 * 6.283; pts.push([c[0] + Math.cos(th) * .17 * e1[0], c[1] + Math.cos(th) * .17 * e1[1], .17 + Math.sin(th) * .17]); }
        tv.add(kf('#2b292e'), PG(pts)).add(kf('#9a98a0'), circ(...ek(c), 1.7)); }
      ogeK(Q, tv, 1); }

    /* ---------- cevher yığını: rayın yanında (II'de vagonun ardında, ocağa yer açar), topak topak; tepesinde kürek ---------- */
    const yP = krater ? g3(-1.15 + (r() - .5) * .2, 1.65) : t === 2 ? g3(yapiU - .15, yapiV + .2) : loc(R0, ac + .85, -.78), oP = g3(1.6, -.5);
    if (t !== 4) { const sp = ek(yP), tv = Tampon();
      tv.add(kf(tone(Kd.zemin, -.24)), `M${f1(sp[0] - 18)} ${f1(sp[1])}Q${f1(sp[0])} ${f1(sp[1] + 7)} ${f1(sp[0] + 18)} ${f1(sp[1])}Q${f1(sp[0])} ${f1(sp[1] - 6)} ${f1(sp[0] - 18)} ${f1(sp[1])}Z`);
      if (krater) { yigin(tv, sp[0], sp[1] + 1.5, 15, 11, 3, [tone(Kd.kaya, .18), tone(Kd.kaya, .05), '#4a5272'], r); obek(tv, sp[0] - 5, sp[1] - 6, .62, r, 4); obek(tv, sp[0] + 7, sp[1] - 2, .5, r, 3); }
      else { const R = 15 + r() * 3; yigin(tv, sp[0], sp[1] + 1.5, R, R + r() * 2, 4, [Kd.top, Kd.top, tone(Kd.kaya, .08), Kd.cev, Kd.top], r, Kd.topA); }
      tv.raw(kurek(sp[0] + 8 * fl, sp[1] - 9, 1, fl));
      b.item([yP[0] - .45, yP[1] - .45, 0, yP[0] + .45, yP[1] + .45, .6], tv.svg(), { pts: [[yP[0] - .42, yP[1], 0], [yP[0] + .42, yP[1], 0], [yP[0], yP[1] - .42, 0], [yP[0], yP[1] + .42, 0], [yP[0], yP[1], .55]] }); }

    /* ---------- kademenin yapısı (ağzın öbür yanında, duvarın önünde) ---------- */
    if (t === 1) {
      // I · seki merdiveni ve çalılar
      const p = loc([yapiU, yapiV], 0, 0); b.line3([loc([yapiU, yapiV], 0, -.2, 0), loc([yapiU, yapiV], -.35, -.2, .9)], '#8a6038', 1.8).line3([loc([yapiU, yapiV], 0, .2, 0), loc([yapiU, yapiV], -.35, .2, .9)], '#8a6038', 1.8);
      let d = ''; for (let k = 1; k < 6; k++) { const z = k * .15; d += `M${P3(loc([yapiU, yapiV], -z * .39, -.2, z))} ${P3(loc([yapiU, yapiV], -z * .39, .2, z))}`; } b.item([p[0] - .4, p[1] - .4, 0, p[0] + .1, p[1] + .1, .9], ln('#a8794a', d, 1.3), { cast: false });
      for (const [u, v, s] of [[-2.55, -.6, 1.2], [2.6, -.9, 1.1], [-2.2, 2.2, .9], [2.25, 1.7, .8]]) { const [x, y] = at(u, v); b.tree('cali', x, y, { s, col: '#7f9248', cast: false }); }
    } else if (t === 2) {
      // II · izabe ocağı: taş külah, ağzı kor, tepesinden duman; yanında kara cüruf yığını
      const oc = [wu(oP), oP[0] + oP[1] - 7], c = at(...oc), P = []; for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; P.push([c[0] + Math.cos(a) * .45, c[1] + Math.sin(a) * .45]); }
      const Q = kaya(P, [[1, 0, 0, 0], [.92, 0, 0, .55], [.62, 0, 0, 1.05], [.5, 0, 0, 1.1]], '#9a8f86', r, { jit: .03 }), tv = Tampon(); kayaCiz(Q, tv);
      for (const f of Q.F) { let d = ''; const h = f.D[2] - f.A[2]; for (let z = .12; z < h; z += .14) d += `M${P3(yp(f, 0, z / h))} ${P3(yp(f, 1, z / h))}`; for (let z = 0; z < h; z += .14) for (let s = (z * 7 % 2) * .25 + .2; s < 1; s += .5) d += `M${P3(yp(f, s, z / h))} ${P3(yp(f, s, Math.min(1, (z + .14) / h)))}`; tv.add('Ln ' + ks(tone('#9a8f86', f.t - .2)), d, ' stroke-width=".7"'); }
      const fr = Q.F.reduce((m, f) => f.A[2] === 0 && (!m || f.n[0] + f.n[1] > m.n[0] + m.n[1]) ? f : m, null);      // ağız bize bakar (önü açık)
      if (fr) { const a = ek(yp(fr, .25, 0)), e = ek(yp(fr, .75, 0)), m = [(a[0] + e[0]) / 2, (a[1] + e[1]) / 2], w = Math.hypot(e[0] - a[0], e[1] - a[1]) / 2;
        tv.add(kf('#3a2420>#5a2a10'), `M${f1(a[0])} ${f1(a[1])}L${f1(a[0])} ${f1(a[1] - 7)}Q${f1(m[0])} ${f1(m[1] - 16)} ${f1(e[0])} ${f1(e[1] - 7)}L${f1(e[0])} ${f1(e[1])}Z`)
          .add(kf('#e8622a>#ff8a3a'), `M${f1(a[0] + w * .3)} ${f1(a[1] + .4)}Q${f1(m[0])} ${f1(m[1] - 9)} ${f1(e[0] - w * .3)} ${f1(e[1] + .4)}Z`).add(kf('#ffc070>#ffe0a0'), `M${f1(m[0] - w * .35)} ${f1(m[1] + .5)}Q${f1(m[0])} ${f1(m[1] - 4.5)} ${f1(m[0] + w * .35)} ${f1(m[1] + .5)}Z`); }
      const tp = ek(g3(oc[0], oc[1], 1.1)); tv.add(kf('#2a2220>#7a3410'), `M${f1(tp[0] - 7)} ${f1(tp[1])}a7 3.5 0 1 0 14 0a7 3.5 0 1 0 -14 0Z`);
      tv.add('Ln ' + ks('#e9e4dc'), `M${f1(tp[0])} ${f1(tp[1] - 2)}q${-5 * fl} -6 ${-2 * fl} -11q${4 * fl} -5 ${-4 * fl} -11q${-4 * fl} -4 ${-2 * fl} -8`, ' stroke-width="4.2" opacity=".55"').add('Ln ' + ks('#ffffff'), `M${f1(tp[0] - 1)} ${f1(tp[1] - 4)}q-4 -5 0 -9`, ' stroke-width="1.6" opacity=".5"');
      tv.raw(`<circle class="Nl" cx="${f1(tp[0])}" cy="${f1(tp[1] + 24)}" r="22" fill="url(#${K.glowId()})"/>`);
      ogeK(Q, tv, 1.2); b.spill(...loc(oc, .55, .35).slice(0, 2), 1.4);
      const cp = loc(oc, -.25, -.75), sp = ek(cp), cv = Tampon(); yigin(cv, sp[0], sp[1] + 1, 11, 9, 3, ['#3d3439', '#2c2629', '#4a3f45'], r, '#b9a6c8');
      b.item([cp[0] - .3, cp[1] - .3, 0, cp[0] + .3, cp[1] + .3, .35], cv.svg(), { cast: false });
    } else if (t === 3) {
      // III · kuyu kulesi: kuyu ağzının üstünde ahşap ayaklar, tepede makara, ip ve kova; iki yanda koyu servi
      const o = [yapiU - .05, yapiV + .1], H = 1.12, odun = '#8a6238', tv = Tampon();
      tv.add(kf('#1c1a1e>#14121a'), PG([loc(o, -.32, -.32), loc(o, .32, -.32), loc(o, .32, .32), loc(o, -.32, .32)]));
      b.item((() => { const p = at(...o); return [p[0] - .4, p[1] - .4, 0, p[0] + .4, p[1] + .4, .02]; })(), tv.svg(), { cast: false });
      for (const [a0, a1, c0, c1] of [[-.48, .48, -.48, -.34], [-.48, .48, .34, .48], [-.48, -.34, -.34, .34], [.34, .48, -.34, .34]]) lbox(o, a0, a1, c0, c1, 0, .14, odun, { edge: false, cast: false });
      for (const c of [-.42, .42]) b.line3([loc(o, -.42, c, .14), loc(o, 0, c, H)], odun, 2.4).line3([loc(o, .42, c, .14), loc(o, 0, c, H)], tone(odun, -.15), 2.4).line3([loc(o, -.26, c, .6), loc(o, .26, c, .6)], tone(odun, -.1), 1.4);
      b.line3([loc(o, 0, -.5, H), loc(o, 0, .5, H)], tone(odun, .1), 3, { pad: .1 });
      const wc = loc(o, 0, 0, H + .02), e1 = sub(loc(o, 1, 0), loc(o, 0, 0)), whl = []; for (let i = 0; i < 16; i++) { const th = i / 16 * 6.283; whl.push([wc[0] + Math.cos(th) * .24 * e1[0], wc[1] + Math.cos(th) * .24 * e1[1], wc[2] + Math.sin(th) * .24]); }
      const wp = ek(wc), rp = ek(loc(o, .24, 0, H)), kp = ek(loc(o, .24, 0, .55));
      b.item((() => { const p = at(...o); return [p[0] - .05, p[1] - .05, .1, p[0] + .05, p[1] + .05, H + .3]; })(),
        ln('#3a3434', `M${f1(rp[0])} ${f1(rp[1])}L${f1(kp[0])} ${f1(kp[1])}M${f1(rp[0])} ${f1(rp[1])}L${f1(ek(loc(o, .24, 0, .05))[0])} ${f1(ek(loc(o, .24, 0, .05))[1])}`, .8)
        + pth(tone(odun, -.25), PG(whl)) + pth(tone(odun, .2), circ(wp[0], wp[1], 3.2)) + ln(tone(odun, -.35), `M${f1(wp[0] - 3)} ${f1(wp[1])}h6M${f1(wp[0])} ${f1(wp[1] - 4)}v8`, .8) + pth('#3a3a40', circ(wp[0], wp[1], 1.2))
        + pth('#7c5634', `M${f1(kp[0] - 3)} ${f1(kp[1])}h6l-.8 5h-4.4z`) + pth(Kd.top, `M${f1(kp[0] - 2.8)} ${f1(kp[1] + .2)}q2.8 -2.6 5.6 0z`), { cast: false });
      for (const [u, v, s] of [[2.55, -.95, 1.0], [-2.6, -.5, .95]]) { const [x, y] = at(u, v); b.tree('selvi', x, y, { s, col: '#2f5546' }); }
    } else if (t === 4) {
      // IV · yıkama oluğu: duvardan inen ayaklı tahta oluk, içinde akan su; ucunda yalak, önünde altın tavası
      const o = [yapiU - .42, yapiV - .32], odun = '#7f5a36', L = 1.0, z0 = .6, z1 = .32;
      for (let k = 0; k <= 1; k++) { const a = k * L * .85 + .08, z = z0 + (z1 - z0) * a / L; for (const c of [-.16, .16]) b.line3([loc(o, a, c, 0), loc(o, a, c, z)], tone(odun, -.15), 1.8); }
      const ob = [loc(o, 0, -.2, z0), loc(o, L, -.2, z1), loc(o, L, .2, z1), loc(o, 0, .2, z0)], su = [loc(o, 0, -.13, z0 + .07), loc(o, L, -.13, z1 + .07), loc(o, L, .13, z1 + .07), loc(o, 0, .13, z0 + .07)];
      const sd = [loc(o, 0, .2, z0), loc(o, L, .2, z1), loc(o, L, .2, z1 + .13), loc(o, 0, .2, z0 + .13)], en = [loc(o, L, -.2, z1), loc(o, L, .2, z1), loc(o, L, .2, z1 + .13), loc(o, L, -.2, z1 + .13)];
      const pw = ek(loc(o, L + .05, 0, z1 + .06)), yk = loc(o, L + .3, 0), yp2 = ek(yk), p = at(...o), q2 = at(o[0] + L, o[1] + L);
      b.item([Math.min(p[0], q2[0]) - .25, Math.min(p[1], q2[1]) - .25, z1, Math.max(p[0], q2[0]) + .25, Math.max(p[1], q2[1]) + .25, z0 + .14],
        pth(tone(odun, -.2), PG(ob)) + pth('#4aa8c0', PG(su)) + ln('#d4f4f6', `M${P3(loc(o, .15, 0, z0 + .05))} ${P3(loc(o, .45, -.05, z0 - .06))}M${P3(loc(o, .6, .05, z0 - .1))} ${P3(loc(o, .85, 0, z1 + .12))}`, .8)
        + pth(tone(odun, .04), PG(sd)) + pth(tone(odun, -.3), PG(en)) + ln(tone(odun, -.4), `M${P3(lrp(sd[0], sd[1], .5))} ${P3(lrp(sd[3], sd[2], .5))}`, .8)
        + ln('#8fd4e0', `M${f1(pw[0])} ${f1(pw[1])}Q${f1(pw[0] + 2 * fl)} ${f1(pw[1] + 4)} ${f1(yp2[0])} ${f1(yp2[1] - 7)}`, 2.2), { pts: ob });
      b.cyl(yk[0], yk[1], .24, 0, .22, '#7a5634', { top: '#4aa8c0', cast: false }).band(.04, .03, M.demir, .01, false).band(.16, .03, M.demir, .01, false);
      { const g = loc(o, L + .3, -.32), e = ek(g); b.item([g[0] - .1, g[1] - .1, 0, g[0] + .1, g[1] + .1, .8], kurek(e[0], e[1], .95, -fl), { cast: false }); }
      const tg = loc(o, L + .55, .62), tp = ek(tg);
      b.item([tg[0] - .2, tg[1] - .2, 0, tg[0] + .2, tg[1] + .2, .1], pth('#4a4a50', `M${f1(tp[0] - 8)} ${f1(tp[1])}a8 4 0 1 0 16 0a8 4 0 1 0 -16 0Z`) + pth('#85858d', `M${f1(tp[0] - 6.6)} ${f1(tp[1] - .6)}a6.6 3.1 0 1 0 13.2 0a6.6 3.1 0 1 0 -13.2 0Z`)
        + K.dots(Kd.top, [[tp[0] - 2, tp[1]], [tp[0] + 1.5, tp[1] - 1], [tp[0] + .5, tp[1] + 1.2], [tp[0] - 3.5, tp[1] - .8], [tp[0] + 3.4, tp[1] + .2]], 1.8) + K.dots('#fffbe6', [[tp[0] - 1.6, tp[1] - .4], [tp[0] + 1.8, tp[1] - 1.3]], .9), { cast: false });
    }

    /* ---------- odak: önde damarlı iri kaya, tepesine saplı kazma; dibinde kırık cevher ---------- */
    const fu = -.62 + (r() - .5) * .3, fv = 1.45 + (r() - .5) * .25;
    if (!krater) { const P = tabanUV(fu, fv, 1.6 + r() * .35, 1.1 + r() * .2, 6), h = .66 + r() * .14, Q = kaya(P, [[1, 0, 0, 0], [.93, -.03, -.03, h * .55], [.72, -.06, -.06, h * .88], [.42, -.08, -.08, h]], tone(Kd.kaya, .05), r, { jit: .08 }), tv = Tampon();
      kayaCiz(Q, tv, true); ayrinti(Q, tv, [{ h: .24, e: .12, a: .05, f: 2, p: r() * 6, w: .075, f2: 2.4, p2: r() * 6, f3: 1, p3: 1.6, k: Kd.dk }, { h: .48, e: -.1, a: .04, f: 1.6, p: r() * 6, w: .06, f2: 2.8, p2: r() * 6, f3: 1.3, p3: 1.6, k: Kd.dk }], false);
      const ct = Q.T.reduce((s, p) => [s[0] + p[0] / Q.T.length, s[1] + p[1] / Q.T.length], [0, 0]), tp = pr(ct[0], ct[1], h);
      tv.raw(kazma(tp[0] - 6 * fl, tp[1] + 1.5, 1.25, fl));
      ogeK(Q, tv, 1.1);
      const kp = []; for (let i = 0; i < 4; i++) { const p = ek(g3(fu + (r() - .5) * 1.8, fv + .7 + r() * .35)); kp.push([p[0], p[1], 2 + r() * 1.2, r]); }
      const tk = Tampon(); topakCiz(tk, kp.filter((_, i) => i % 2), Kd.top, Kd.topA); topakCiz(tk, kp.filter((_, i) => !(i % 2)), tone(Kd.kaya, .1));
      const g = g3(fu, fv + .75); b.item([g[0] - .5, g[1] - .5, 0, g[0] + .5, g[1] + .5, .1], tk.svg(), { cast: false }); }

    /* ---------- aletler ve eşyalar ---------- */
    // fener direği (IV'te ağız zaten iki fenerli: yerine su fıçısı)
    if (t === 4) { const [x, y] = at(-1.72, 1.32); b.barrel(x, y, 0, { r: .2, h: .44, top: '#3f9db0' }); }
    else { const [x, y] = krater ? at(-2.05, .5) : at(-1.72, 1.32), p = pr(x, y, 0), tp = pr(x, y, 1.12), ff = fl;
      b.spill(x, y, 1.3);
      b.item([x - .06, y - .06, 0, x + .06, y + .06, 1.3], ln('#6a4428', `M${f1(p[0])} ${f1(p[1])}V${f1(tp[1])}h${7 * ff}`, 2.2) + ln('#a87a4c', `M${f1(p[0] - .6)} ${f1(p[1])}V${f1(tp[1] + 1)}`, .7) + fener(tp[0] + 6 * ff, tp[1]), { cast: false }); }
    // kova: içi cevher dolu
    { const [x, y] = krater ? at(-.8, 2.4) : at(fu + 1.0, fv + .5); b.cyl(x, y, .17, 0, .3, '#7c5634', { top: '#3a2a20', cast: false }).band(.06, .03, M.demir, .008, false).band(.22, .03, M.demir, .008, false); const p = pr(x, y, .3), tv = Tampon();
      if (krater) obek(tv, p[0], p[1] + 1, .45, r, 3); else yigin(tv, p[0], p[1] + 1.5, 5.4, 4.2, 2, [Kd.top, Kd.top, tone(Kd.kaya, .1)], r, Kd.topA);
      tv.add('Ln ' + ks('#3a3434'), `M${f1(p[0] - 5.8)} ${f1(p[1])}Q${f1(p[0])} ${f1(p[1] - 10)} ${f1(p[0] + 5.8)} ${f1(p[1])}`, ' stroke-width=".8"');
      b.item([x - .18, y - .18, .3, x + .18, y + .18, .45], tv.svg(), { cast: false }); }
    // çuvallar
    if (krater) { const [x, y] = at(1.15, 1.75); b.sack(x + .25, y - .05, 0, { s: 1.1, col: '#b9a276' }).crate(x - .2, y - .2, 0, .42, { h: .75 });
      const p = pr(x - .2, y - .2, .32), tv = Tampon(); obek(tv, p[0], p[1] + 2, .62, r, 4); b.item([x - .4, y - .4, .3, x, y, .7], tv.svg(), { cast: false }); }
    else { const [x, y] = at(fu + 1.75, fv + .38); b.sack(x + .2, y - .05, 0, { s: 1.02, col: '#b9a276' });      // tohuma göre ikinci çuval ya da cevher sandığı
      if (r() < .5) b.sack(x - .1, y - .18, 0, { s: 1.12, col: '#c8b287' }); else b.crate(x - .2, y - .32, 0, .4, { fill: Kd.top.split('>')[0] }); }
    // önde köşelerde alçak taşlar
    for (const [u, v, g, h] of [[-1.62, 2.95, .8, .26], [1.45, 3.2, .55, .18]]) { const Q = kaya(tabanUV(u, v, g, g * .7, 6), [[1, 0, 0, 0], [.8, -.02, -.02, h * .7], [.45, -.04, -.04, h]], tone(Kd.kaya, .06), r, { jit: .1 }), tv = Tampon(); kayaCiz(Q, tv, true); ogeK(Q, tv); }
    // kuru ot
    { const c0 = at(-2.6, -.8), c1 = at(2.6, 3.4); b.tufts(Math.min(c0[0], c1[0]), Math.min(c0[1], c1[1]), Math.max(c0[0], c1[0]), Math.max(c0[1], c1[1]), 12, { col: Kd.ot }); }

    /* ---------- nitelik: Bereketli çiçek ve fazladan cevher, Zengin ışık huzmesi ve pırıltı, Eşsiz altın ışık ---------- */
    if (q >= 1) {
      if (Kd.cicek.length) for (const [u, v, n] of [[-2.1, 2.2, 4], [.2, 3.05, 4], [1.95, 2.4, 3]]) { const [x, y] = at(u, v); b.flowers(x, y, { n: n + (q >> 1), r: .4, cols: Kd.cicek }); }
      const tv = Tampon(), g = g3(.9, 2.75), e = ek(g);
      if (krater) { obek(tv, e[0], e[1], .45, r, 3); obek(tv, e[0] - 62, e[1] - 22, .4, r, 3); }
      else { const ps = []; for (let i = 0; i < 3 + q; i++) ps.push([e[0] + (r() - .5) * 26, e[1] + (r() - .5) * 8, 1.6 + r(), r]); topakCiz(tv, ps, Kd.top, Kd.topA); }
      b.item([g[0] - .6, g[1] - .6, 0, g[0] + .6, g[1] + .6, .1], tv.svg(), { cast: false });
    }
    if (q >= 2) {      // Zengin ve Eşsiz: yukarıdan süzülen ışık ve cevherin pırıltısı (en önde, her şeyin üstünde)
      const gl = q >= 3 ? '#ffe9a8' : '#fff6d2', p = pr(3.5, 3.5, 0); let sh = '', st = '';
      for (const [dx, w] of [[-40, 12], [-8, 16], [22, 11]]) sh += `M${f1(p[0] + dx)} ${f1(p[1] - 96)}l${w} 0l${f1(w * .5 + 24)} 112l${f1(-w * 1.6 - 6)} 0z`;
      for (let i = 0; i < q * 2 + 1; i++) st += yildiz(p[0] - 50 + r() * 100, p[1] - 62 + r() * 62, .9 + r() * 1.1);
      b.item([9.6, 9.6, 0, 9.8, 9.8, 4], pth(gl, sh, `opacity="${q >= 3 ? .2 : .13}"`) + pth(q >= 3 ? '#fff0b8' : '#ffffff', st, 'opacity=".9"'), { cast: false });
    }
  });
})(typeof window !== 'undefined' ? window.CK : globalThis.CK);
