/* Saha manzarası — ORMAN (Odunculuk). Dünya haritasında saha altıgeninin içindeki küçük resim: tek ağaç değil, o kademenin korusu.
   opt: t (1–5: Huş, Çam, Meşe, Sedir, Ulu Çınar) · seed (yerleşim) · q (0–3 nitelik: zenginleştikçe ışık ve ayrıntı artar).
   Kadraj: parselin ortasından CK.SAHA.W × H sahne pikseli (≈ 5,5 × 4,7 birim) altıgene sığar; parsel 7 × 7, zemin dışarı taşar.
   ÖRNEK DOSYA: öteki mesleklerin manzaraları bunu ölçü alır (yoğunluk, okunurluk, kademeler arası fark). */
(function (K) {
  'use strict';
  const { M, pr, f1, tone, kf, ks, circ, pth, ln, rng } = K;
  const path = (cls, d, extra = '') => d ? `<path class="${cls}"${extra} d="${d}"/>` : '';
  // yaprak kümesi (esya.js ile aynı dil): koyu taban, orta ton, sol üstten ışık
  const cluster = (cx, cy, R, n, r, sq = .82) => { const cs = [[cx, cy, R * .64]]; for (let i = 0; i < n; i++) { const a = i / n * 6.283 + r() * .6, d = R * (.4 + r() * .22); cs.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d * sq, R * (.34 + r() * .18)]); } return cs; };
  const canopy = (cs, R, col, gold) => {
    const dk = cs.map(c => circ(c[0], c[1], c[2])).join(''), md = cs.map(c => circ(c[0] - R * .09, c[1] - R * .12, c[2] * .8)).join('');
    const up = cs.filter(c => c[1] <= cs[0][1] + R * .12 && c[0] <= cs[0][0] + R * .3);
    const lt = up.map(c => circ(c[0] - R * .17, c[1] - R * .22, c[2] * .5)).join(''), hi = up.slice(0, 3).map(c => circ(c[0] - R * .24, c[1] - R * .3, c[2] * .22)).join('');
    return path(kf(tone(col, -.34)), dk) + path(kf(col), md) + path(kf(tone(col, .26)), lt) + path(kf(gold || tone(col, .48)), hi);
  };
  const trunk = (x, y, H, w, lean, col) => path(kf(tone(col, .05)), `M${f1(x - w)} ${f1(y)}Q${f1(x - w * .5 + lean * .5)} ${f1(y - H * .5)} ${f1(x - w * .5 + lean)} ${f1(y - H)}L${f1(x + w * .5 + lean)} ${f1(y - H)}Q${f1(x + w * .6 + lean * .5)} ${f1(y - H * .5)} ${f1(x + w)} ${f1(y)}Z`)
    + path(kf(tone(col, -.32)), `M${f1(x + w * .1)} ${f1(y)}Q${f1(x + w * .2 + lean * .5)} ${f1(y - H * .5)} ${f1(x + w * .1 + lean)} ${f1(y - H)}L${f1(x + w * .5 + lean)} ${f1(y - H)}Q${f1(x + w * .6 + lean * .5)} ${f1(y - H * .5)} ${f1(x + w)} ${f1(y)}Z`);

  /* ---------- beş ağaç: her kademenin kendi silueti (x, y: ekran pikseli, taban noktası) ---------- */
  const AGAC = {
    // I · huş: ince beyaz gövde, siyah çentikler, havadar açık yeşil taç
    hus(x, y, s, r) { const H = 44 * s, lean = (r() - .5) * 8 * s, w = 1.9 * s, R = 12.5 * s; let nt = '';
      for (let i = 1; i < 6; i++) { const t = i / 6.4, yy = y - H * t, xx = x + lean * t * t; nt += `M${f1(xx - w * .7)} ${f1(yy)}h${f1(w * (.7 + r() * .7))}`; }
      return trunk(x, y, H, w, lean, '#efe9dc') + path('Ln ' + ks('#3d3833'), nt, ` stroke-width="${f1(1.1 * s)}"`)
        + canopy(cluster(x + lean - 5 * s, y - H + 4 * s, R * .7, 5, r, .9), R * .7, '#9cc763') + canopy(cluster(x + lean + 2 * s, y - H - R * .3, R, 6, r, .9), R, '#b1d672'); },
    // II · çam: üst üste binen koyu yeşil külahlar
    cam(x, y, s, r) { const H = 60 * s, W = 15.5 * s, c = '#2f6b4a', n = 4; let dk = '', md = '', lt = '';
      for (let i = 0; i < n; i++) { const k = 1 - i * .2, y0 = y - 9 * s - i * H * .19, hw = W * k, top = y0 - H * .34;
        dk += `M${f1(x - hw)} ${f1(y0)}Q${f1(x)} ${f1(y0 + 3.4 * s * k)} ${f1(x + hw)} ${f1(y0)}L${f1(x)} ${f1(top)}Z`;
        md += `M${f1(x - hw)} ${f1(y0)}Q${f1(x - hw * .4)} ${f1(y0 + 2.6 * s * k)} ${f1(x + hw * .16)} ${f1(y0 + 1.6 * s * k)}L${f1(x)} ${f1(top)}Z`;
        lt += `M${f1(x - hw * .86)} ${f1(y0 - 1.5 * s)}L${f1(x - hw * .3)} ${f1(y0 - 1 * s)}L${f1(x - 1.2 * s)} ${f1(top + 3 * s)}Z`; }
      return trunk(x, y, 11 * s, 2.1 * s, 0, M.govde) + path(kf(tone(c, -.32)), dk) + path(kf(c), md) + path(kf(tone(c, .3)), lt); },
    // III · meşe: kalın gövde, çatallı dallar, geniş ve koyu taç
    mese(x, y, s, r) { const R = 25 * s, H = 27 * s, lean = (r() - .5) * 3 * s, g = '#6d4c30';
      return trunk(x, y, H, 4.6 * s, lean, g) + path('Ln ' + ks(tone(g, -.2)), `M${f1(x + lean)} ${f1(y - H * .66)}l${f1(-9 * s)} ${f1(-10 * s)}M${f1(x + lean)} ${f1(y - H * .74)}l${f1(9 * s)} ${f1(-9 * s)}`, ` stroke-width="${f1(2.2 * s)}"`)
        + canopy(cluster(x + lean, y - H - R * .3, R, 9, r, .74), R, '#4c8a47'); },
    // IV · sedir: uzun gövde, kat kat yatay dallar, mavimsi yeşil
    sedir(x, y, s, r) { const H = 68 * s, c = '#3a7568', n = 5; let dk = '', md = '', lt = '';
      for (let i = 0; i < n; i++) { const k = 1 - i * .17, yy = y - 16 * s - i * H * .155, hw = 21 * s * k * (.92 + r() * .16), th = 6.2 * s * (.7 + k * .5);
        dk += `M${f1(x - hw)} ${f1(yy + th * .5)}Q${f1(x - hw * .5)} ${f1(yy - th * 1.5)} ${f1(x)} ${f1(yy - th * 1.3)}Q${f1(x + hw * .5)} ${f1(yy - th * 1.5)} ${f1(x + hw)} ${f1(yy + th * .5)}Q${f1(x)} ${f1(yy + th * .9)} ${f1(x - hw)} ${f1(yy + th * .5)}Z`;
        md += `M${f1(x - hw)} ${f1(yy + th * .5)}Q${f1(x - hw * .5)} ${f1(yy - th * 1.5)} ${f1(x)} ${f1(yy - th * 1.3)}Q${f1(x + hw * .22)} ${f1(yy - th * .5)} ${f1(x + hw * .1)} ${f1(yy + th * .5)}Q${f1(x - hw * .4)} ${f1(yy + th * .7)} ${f1(x - hw)} ${f1(yy + th * .5)}Z`;
        lt += `M${f1(x - hw * .8)} ${f1(yy)}Q${f1(x - hw * .44)} ${f1(yy - th * 1.2)} ${f1(x - hw * .06)} ${f1(yy - th * 1.05)}Q${f1(x - hw * .4)} ${f1(yy - th * .5)} ${f1(x - hw * .8)} ${f1(yy)}Z`; }
      return trunk(x, y, H * .9, 2.5 * s, 0, '#6a4a36') + path(kf(tone(c, -.34)), dk) + path(kf(c), md) + path(kf(tone(c, .3)), lt)
        + path(kf(tone(c, -.2)), `M${f1(x)} ${f1(y - H * 1.04)}l${f1(-4 * s)} ${f1(12 * s)}h${f1(8 * s)}Z`); },
    // V · ulu çınar: dev gövde, kök payandaları, altın ışıklı koca taç
    ulu(x, y, s, r) { const R = 37 * s, H = 33 * s, w = 8.6 * s, g = '#7b5a3a';
      const kok = `M${f1(x - w * 1.7)} ${f1(y + 2 * s)}Q${f1(x - w)} ${f1(y - 5 * s)} ${f1(x - w * .6)} ${f1(y - 12 * s)}L${f1(x + w * .6)} ${f1(y - 12 * s)}Q${f1(x + w)} ${f1(y - 5 * s)} ${f1(x + w * 1.8)} ${f1(y + 2.6 * s)}Q${f1(x)} ${f1(y + 5 * s)} ${f1(x - w * 1.7)} ${f1(y + 2 * s)}Z`;
      const oyuk = `M${f1(x - 2.4 * s)} ${f1(y - 1 * s)}Q${f1(x - 2.8 * s)} ${f1(y - 11 * s)} ${f1(x + .2 * s)} ${f1(y - 12 * s)}Q${f1(x + 2.6 * s)} ${f1(y - 10 * s)} ${f1(x + 2 * s)} ${f1(y - 1 * s)}Z`;
      return path(kf(tone(g, -.1)), kok) + trunk(x, y, H, w, 0, g) + path(kf('#2c1f17'), oyuk)
        + path('Ln ' + ks(tone(g, -.24)), `M${f1(x - 1 * s)} ${f1(y - H * .7)}l${f1(-15 * s)} ${f1(-12 * s)}M${f1(x + 1 * s)} ${f1(y - H * .76)}l${f1(15 * s)} ${f1(-10 * s)}M${f1(x)} ${f1(y - H * .8)}l${f1(2 * s)} ${f1(-14 * s)}`, ` stroke-width="${f1(3.2 * s)}"`)
        + canopy(cluster(x - R * .34, y - H - R * .1, R * .62, 7, r, .8), R * .62, '#7fa84a') + canopy(cluster(x + R * .4, y - H - R * .16, R * .6, 7, r, .8), R * .6, '#6f9a45')
        + canopy(cluster(x, y - H - R * .5, R, 11, r, .72), R, '#8db551', '#e6d27a'); },
  };
  const BOY = { hus: [.5, 2.3], cam: [.62, 2.6], mese: [1.05, 2.5], sedir: [.86, 3.0], ulu: [1.5, 3.2] };      // gölge için taç yarıçapı ve boy (birim)
  const agac = (b, kind, x, y, s) => { const p = pr(x, y, 0), r = rng(Math.round((x * 31.7 + y * 17.3 + s * 7) * 100) + 5), R = BOY[kind][0] * s, H = BOY[kind][1] * s, hc = H * (kind === 'cam' || kind === 'sedir' ? .45 : .76), pts = [[x, y, 0]];
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; pts.push([x + Math.cos(a) * R, y + Math.sin(a) * R, hc]); } if (kind === 'cam' || kind === 'sedir') pts.push([x, y, H]);
    b.item([x - .22, y - .22, 0, x + .22, y + .22, H], AGAC[kind](p[0], p[1], s, r), { pts }); };

  /* Kompozisyon kadraja göre kurulur. Kadraj koordinatı (u, v): u ekranda yatay (birim; 1 birim = 24 px), v derinlik (1 birim = 12 px aşağı),
     (0, 0) parselin ortası. Görünen zemin: u −2,75…2,75 · v −5,9…3,6. Arkada iki sık sıra (koru duvarı), yanlarda çerçeveleyen ağaçlar,
     ortada önde oduncunun açıklığı (odak). Yuvalar sabittir; tohum yerlerini oynatır, birkaçını atlar, sahneyi aynalar. */
  const KADEME = [null,
    { ad: 'hus', zemin: '#9dbd6a', koyu: '#86a85a', acik: '#b4cf7e', yol: '#cdbd8c', s: [1.08, 1.3], ar: 1.08 },
    { ad: 'cam', zemin: '#7f9a62', koyu: '#6b8552', acik: '#93aa70', yol: '#b7a178', s: [.92, 1.16], ar: 1.12 },
    { ad: 'mese', zemin: '#7c9c58', koyu: '#64844a', acik: '#92b068', yol: '#b8a676', s: [.84, 1.04], ar: 1.6 },
    { ad: 'sedir', zemin: '#739a70', koyu: '#5c8260', acik: '#8cb088', yol: '#aea580', s: [.86, 1.08], ar: 1.45 },
    { ad: 'mese', zemin: '#93ac5e', koyu: '#7a944c', acik: '#aec272', yol: '#c9b780', s: [.6, .76], ar: 1.3 },
  ];

  CK.def('saha-odun', { w: 7, d: 7, name: 'Orman sahası' }, (b, K2, opt) => {
    const t = Math.max(1, Math.min(5, opt.t || 1)), q = opt.q || 0, Kd = KADEME[t], r = b.r, ayna = r() < .5 ? -1 : 1;
    const at = (u, v) => [3.5 + (v + u * ayna) / 2, 3.5 + (v - u * ayna) / 2];      // kadraj → ızgara
    // orman zemini: düz ton, koyu-açık lekeler (zemin parselin dışına taşar: altıgenin köşeleri boş kalmasın)
    b.pave(-3, -3, 10, 10, Kd.zemin);
    for (let i = 0; i < 14; i++) { const [cx, cy] = at(-3 + r() * 6, -6 + r() * 10), rr = .7 + r() * 1.1, pts = []; for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283, d = rr * (.7 + r() * .5); pts.push([cx + Math.cos(a) * d * 1.4, cy + Math.sin(a) * d]); } b.gpoly(pts, i % 2 ? Kd.koyu : Kd.acik, { op: .5 }); }
    // açıklık ve patika: açık toprak, önden gelip korunun içine kıvrılır
    const yol = [[-.6, 4.8], [.65, 4.8], [.9, 3], [1.45, 1.6], [1.2, .2], [.45, -1.2], [-.15, -1.1], [.3, .4], [.05, 1.7], [-.8, 3]].map(p => at(p[0], p[1]));
    b.gpoly(yol, Kd.yol, { op: .7 });
    b.gpoly([[-1.7, 1.9], [-.4, .8], [1.2, .9], [1.9, 2], [1.2, 3.2], [-.9, 3.3]].map(p => at(p[0], p[1])), Kd.yol, { op: .45 });
    // ağaç yuvaları: [u, v] — arka sıra A, arka sıra B, yanlar, ön köşeler
    const k = Kd.ar, yuva = [];
    for (let u = -2.9; u <= 3; u += k) yuva.push([u, -3.3]);
    for (let u = -2.9 + k / 2; u <= 3; u += k) yuva.push([u, -1.9]);
    for (const u of [-2.8, -2.8 + k * .9, 2.8 - k * .9, 2.8]) yuva.push([u, -.5]);
    for (const u of [-2.95, 2.9]) yuva.push([u, 1.5]);
    if (k < 1.2) for (const u of [-2.3, 2.4]) yuva.push([u, 3.3]);
    let ulu = null;
    if (t === 5) ulu = [-.45 + r() * .5, -.9];      // V: ortada tek ulu çınar; çevresi ona yer açar
    const dik = [];
    for (const [u, v] of yuva) { if (r() < .1) continue; const uu = u + (r() - .5) * .34, vv = v + (r() - .5) * .5;
      if (ulu && Math.hypot(uu - ulu[0], (vv - ulu[1]) * .6) < 1.75) continue;
      if (Math.abs(uu) < 1.15 && vv > -1.2) continue;      // açıklık ve patika boş kalır
      dik.push([uu, vv, Kd.s[0] + r() * (Kd.s[1] - Kd.s[0]), Kd.ad]); }
    if (ulu) dik.push([ulu[0], ulu[1], .84, 'ulu']);
    for (const [u, v, s, kind] of dik) { const [x, y] = at(u, v); agac(b, kind, x, y, s); }
    // odak: kütük ve saplı balta, odun istifi, devrik gövde
    { const [x, y] = at(.1, 1.55); b.cyl(x, y, .27, 0, .2, '#8a6238', { top: '#d8b074', cast: false });
      b.art(x, y, .2, ln('#b9925a', 'M-3.2 -.2a3.2 1.6 0 1 0 6.4 0a3.2 1.6 0 1 0 -6.4 0', .8) + ln(M.ahsapK, 'M-1 -1L8 -13', 1.7) + pth('#9aa1a6', 'M5.6 -15.4l6.2 -1.4l1.2 5l-5 2.4z') + pth('#d5dade', 'M5.6 -15.4l6.2 -1.4l.3 1.3l-6 1.5z'), { r: .32, h: .7 }); }
    { const [x, y] = at(1.35, 2.35); b.woodpile(x - .4, y - .17, 0, { w: .8 }).woodpile(x - .28, y - .17, .4, { w: .56 }); }
    { const a = at(-1.8, 1.75), c = at(-.7, 2.5), g = Kd.ad === 'hus' ? '#ece5d6' : '#7a5a3c';
      b.line3([[a[0], a[1], .15], [c[0], c[1], .15]], g, 6.6, { pad: .12 }); b.art(c[0], c[1], .15, pth(tone(g, Kd.ad === 'hus' ? -.12 : .3), circ(0, 0, 3.2)) + ln(tone(g, -.34), circ(0, 0, 1.5), .7), { r: .16, h: .3 }); }
    { const [x, y] = at(-2.0, 3.3); b.rock(x, y, 0, { s: .9 }); }
    // alt bitki örtüsü: ot öbekleri, çalılar, mantar; nitelik arttıkça çiçek
    { const c0 = at(-2.6, -.2), c1 = at(2.6, 3.4); b.tufts(Math.min(c0[0], c1[0]), Math.min(c0[1], c1[1]), Math.max(c0[0], c1[0]), Math.max(c0[1], c1[1]), 14, { col: tone(Kd.koyu, -.24) }); }
    for (const [u, v, s] of [[2.3, 2.7, 1.1], [-2.55, .7, .9], [1.95, .3, .8]]) { const [x, y] = at(u, v); b.tree('cali', x, y, { s, col: tone(Kd.koyu, -.08), cast: false }); }
    { const [x, y] = at(-1.0, 1.0); b.art(x, y, 0, pth('#e3dccb', 'M-1.6 0v-3.4h3.2v3.4z') + pth('#c0473a', 'M-4.6 -3q4.6 -6.6 9.2 0q-4.6 1.8 -9.2 0z') + K.dots('#f6efe0', [[-1.8, -4.6], [1.5, -5.2], [.1, -3.6]], 1.3), { r: .12, h: .25 }); }
    if (q >= 1) { for (const [u, v, n] of [[1.8, 1.2, 5], [-1.4, 3.3, 4], [.95, 3.4, 4]]) { const [x, y] = at(u, v); b.flowers(x, y, { n: n + q * 2, r: .45 }); } }
    if (q >= 2) {      // Zengin ve Eşsiz: yaprakların arasından süzülen ışık ve pırıltılar (en önde, her şeyin üstünde)
      const g = q >= 3 ? '#ffe9a8' : '#fff6d2', p = pr(3.5, 3.5, 0); let sh = '', st = '';
      for (const [dx, w] of [[-40, 12], [-8, 16], [22, 11]]) sh += `M${f1(p[0] + dx)} ${f1(p[1] - 96)}l${w} 0l${f1(w * .5 + 24)} 112l${f1(-w * 1.6 - 6)} 0z`;
      for (let i = 0; i < q * 2; i++) { const x = p[0] - 50 + r() * 100, y = p[1] - 60 + r() * 66, kk = .9 + r() * 1.1; st += `M${f1(x)} ${f1(y - kk * 2)}l${f1(kk * .5)} ${f1(kk * 1.5)}l${f1(kk * 1.5)} ${f1(kk * .5)}l${f1(-kk * 1.5)} ${f1(kk * .5)}l${f1(-kk * .5)} ${f1(kk * 1.5)}l${f1(-kk * .5)} ${f1(-kk * 1.5)}l${f1(-kk * 1.5)} ${f1(-kk * .5)}l${f1(kk * 1.5)} ${f1(-kk * .5)}z`; }
      b.item([9.6, 9.6, 0, 9.8, 9.8, 4], pth(g, sh, `opacity="${q >= 3 ? .2 : .13}"`) + pth(q >= 3 ? '#fff0b8' : '#ffffff', st, 'opacity=".9"'), { cast: false });
    }
  });
})(typeof window !== 'undefined' ? window.CK : globalThis.CK);
