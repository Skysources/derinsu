/* Saha manzarası — ÇİÇEKLİ ÇAYIR (Bitki Toplama). Dünya haritasında saha altıgeninin içindeki küçük resim: tek bitki değil, o kademenin toplama çayırı.
   opt: t (1–5: Kekik, Adaçayı, Gece Sefası, Altın Kök, Anka Çiçeği) · seed (yerleşim) · q (0–3 nitelik: zenginleştikçe çiçek, ışık ve pırıltı artar).
   Kadraj ve dil y-saha-odun.js ile aynı: kademenin bitkisi sürüklenti hâlinde öbek öbek (arkada sık, aralarda açık çayır), yanlarda çerçeve,
   ortada önde toplayıcının köşesi (sepet, yere bırakılmış kesik dallar, taşta orak, kurutma askısı). */
(function (K) {
  'use strict';
  const { pr, f1, tone, kf, ks, ell, ln, rng, dots } = K;
  const path = (cls, d, extra = '') => d ? `<path class="${cls}"${extra} d="${d}"/>` : '';
  const P = (x, y) => f1(x) + ' ' + f1(y);
  const D = (col, pts, d) => pts.length ? dots(col, pts, f1(d)) : '';      // aynı çaplı noktalar tek yolda (ucuz)
  const C = (col, pts, d) => pts.length ? `<path class="Ln ${ks(col)}" stroke-width="${f1(d)}" d="${pts.map(p => `M${P(p[0], p[1])}l${f1(p[2])} ${f1(p[3])}`).join('')}"/>` : '';      // kapsüller: [x, y, dx, dy]
  const L = (col, d, w) => d ? ln(col, d, f1(w)) : '';
  const F = (col, d) => path(kf(col), d);
  const S = q => 'M' + q.map(p => P(p[0], p[1])).join('L') + 'Z';      // kapalı çokgen
  // tümsek kümesi: koyu taban, orta ton, sol üstten ışık (y-saha-odun.js canopy() ile aynı dil, aynı çaplı noktalarla)
  const kume = (pts, R, col, o = {}) => { const xs = pts.map(p => p[0]), x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...pts.map(p => p[1]));
    const up = pts.filter(p => p[0] <= x0 + (x1 - x0) * .62 && p[1] <= y0 + R * 1.3);
    return D(o.dk || tone(col, -.34), pts, R * 2) + D(col, pts.map(p => [p[0] - R * .16, p[1] - R * .2]), R * 1.64)
      + D(o.lt || tone(col, .26), up.map(p => [p[0] - R * .34, p[1] - R * .42]), R) + (o.hi === null ? '' : D(o.hi || tone(col, .48), up.slice(0, 3).map(p => [p[0] - R * .46, p[1] - R * .56]), R * .44)); };
  // badem yaprak (x, y tabandan a açısıyla Lh boyunda) ve ışık alan yarısı
  const yaprak = (x, y, Lh, w, a) => { const c = Math.cos(a), s = Math.sin(a), mx = x + c * Lh * .5, my = y + s * Lh * .5; return `M${P(x, y)}Q${P(mx - s * w, my + c * w)} ${P(x + c * Lh, y + s * Lh)}Q${P(mx + s * w, my - c * w)} ${P(x, y)}Z`; };
  const yarim = (x, y, Lh, w, a) => { const c = Math.cos(a), s = Math.sin(a), k = s - c > 0 ? 1 : -1, mx = x + c * Lh * .5, my = y + s * Lh * .5; return `M${P(x, y)}Q${P(mx - s * w * k, my + c * w * k)} ${P(x + c * Lh, y + s * Lh)}Z`; };
  // geniş yaprak: yuvarlak omuzlu oval (adaçayı, kök otu); yari: yalnız ışık alan yarısı
  const genis = (x, y, Lh, w, a, yari) => { const c = Math.cos(a), s = Math.sin(a), k = yari ? (s - c > 0 ? 1 : -1) : 1, nx = -s * w * k, ny = c * w * k, tx = x + c * Lh, ty = y + s * Lh;
    return `M${P(x, y)}C${P(x + c * Lh * .14 + nx * 1.2, y + s * Lh * .14 + ny * 1.2)} ${P(tx - c * Lh * .3 + nx * .95, ty - s * Lh * .3 + ny * .95)} ${P(tx, ty)}`
      + (yari ? 'Z' : `C${P(tx - c * Lh * .3 - nx * .95, ty - s * Lh * .3 - ny * .95)} ${P(x + c * Lh * .14 - nx * 1.2, y + s * Lh * .14 - ny * 1.2)} ${P(x, y)}Z`); };
  // alev: (x, y) taban, H boy, w yarı en, e uç kayması
  const alev = (x, y, H, w, e = 0) => `M${P(x + e, y - H)}C${P(x + w * .9 + e * .5, y - H * .62)} ${P(x + w * 1.1, y - H * .18)} ${P(x, y)}C${P(x - w * 1.1, y - H * .18)} ${P(x - w * .9 + e * .5, y - H * .62)} ${P(x + e, y - H)}Z`;
  // kapalı yumuşak eğri (orta noktalardan geçer) ve şerit: orta çizgi (ekran) boyunca w0→w1 (ya da w0(k) işleviyle) genişlikte kapalı yol
  const egri = pts => { const n = pts.length, m = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]; let d = 'M' + P(...m(pts[n - 1], pts[0])); for (let i = 0; i < n; i++) d += 'Q' + P(...pts[i]) + ' ' + P(...m(pts[i], pts[(i + 1) % n])); return d + 'Z'; };
  const serit = (c, w0, w1, dx = 0, dy = 0) => { const wf = typeof w0 === 'function' ? w0 : k => w0 + (w1 - w0) * k, l = [], rr = []; c.forEach((p, i) => { const a = c[Math.max(0, i - 1)], b = c[Math.min(c.length - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], n = Math.hypot(tx, ty) || 1, w = wf(i / (c.length - 1)) / 2;
    l.push([p[0] - ty / n * w + dx, p[1] + tx / n * w + dy]); rr.unshift([p[0] + ty / n * w + dx, p[1] - tx / n * w + dy]); }); return egri(l.concat(rr)); };
  // gece parıltısı (yalnız gece görünür)
  const haleId = () => K.DEF('bthale', () => '<radialGradient id="bthale"><stop offset="0" stop-color="#fff2d0" stop-opacity=".62"/><stop offset=".4" stop-color="#ffb0d8" stop-opacity=".22"/><stop offset="1" stop-color="#ff8ac8" stop-opacity="0"/></radialGradient>');
  const hale = (x, y, R) => `<circle class="Nl" cx="${f1(x)}" cy="${f1(y)}" r="${f1(R)}" fill="url(#${haleId()})"/>`;
  const yildiz = (x, y, k) => `M${P(x, y - k * 2)}l${f1(k * .5)} ${f1(k * 1.5)}l${f1(k * 1.5)} ${f1(k * .5)}l${f1(-k * 1.5)} ${f1(k * .5)}l${f1(-k * .5)} ${f1(k * 1.5)}l${f1(-k * .5)} ${f1(-k * 1.5)}l${f1(-k * 1.5)} ${f1(-k * .5)}l${f1(k * 1.5)} ${f1(-k * .5)}z`;
  // kılıç yapraklar (anka): n yaprak, koyu ve ışıklı yüz
  const kilic = (x, y, s, r, n, k) => { let lf = '', ll = ''; for (let i = 0; i < n; i++) { const q = i / (n - 1) * 2 - 1, Lh = (8 + r() * 5) * s * k * (1 - Math.abs(q) * .25), dx = q * 8 * s * k;
      lf += `M${P(x - 1.3 * s, y)}Q${P(x + dx * .3, y - Lh * .7)} ${P(x + dx, y - Lh)}Q${P(x + dx * .55, y - Lh * .45)} ${P(x + 1.3 * s, y)}Z`; ll += `M${P(x - 1.3 * s, y)}Q${P(x + dx * .3 - .8 * s, y - Lh * .7)} ${P(x + dx, y - Lh)}Q${P(x + dx * .2, y - Lh * .62)} ${P(x, y)}Z`; }
    return F('#3a3420', lf) + F('#6e5a2c', ll); };

  /* ---------- beş bitki: her kademenin kendi öbeği (x, y: ekran pikseli, taban ortası; s ölçek) ---------- */
  const OT = {
    // I · kekik: alçak kubbe yastık; gri yeşil ince yapraklar, üstünde yuvarlak mor-pembe çiçek başları (sol üst açık, sağ alt koyu); çiçeklenme öbekten öbeğe değişir
    kekik(x, y, s, r) { const w = (9 + r() * 4.5) * s, H = (8.5 + r() * 3) * s, R = 3 * s, bl = .4 + r() * .6, pts = [], hd = [[], [], []], yk = [], fk = [];
      for (let k = 0; k < 3; k++) { const fy = k / 2, wk = Math.sqrt(1 - fy * fy * .8), n = Math.max(1, Math.round(wk * (w - R) / (R * .85)) + 1), yy = y - R * .9 - fy * (H - R * 1.9);
        for (let i = 0; i < n; i++) { const tt = n > 1 ? i / (n - 1) * 2 - 1 : 0; pts.push([x + tt * (w - R) * wk + (r() - .5) * R * .4, yy + Math.abs(tt) * R * .3 + (r() - .5) * R * .3]); } }
      for (let i = 0, nh = Math.round((3 + w / 1.6) * bl); i < nh; i++) { const th = Math.PI * (.1 + r() * .8), ro = .68 + r() * .32, hx = x - Math.cos(th) * (w - R * .6) * ro, hy = y - R * .5 - Math.sin(th) * (H - R * .8) * ro, l = -Math.cos(th) * .6 + Math.sin(th) * .4 + (r() - .5) * .4;
        hd[l > .42 ? 2 : l > -.05 ? 1 : 0].push([hx, hy]); }
      for (let i = 0; i < 5; i++) { yk.push([x + (r() - .5) * w * 1.6, y - R * (.3 + r() * .4)]); fk.push([x - w * (.15 + r() * .55), y - H * (.4 + r() * .45)]); }
      const ac = hd[1].concat(hd[2]);
      return kume(pts, R, '#738458', { dk: '#4b5a3e', lt: '#99a879', hi: '#b8c496' }) + D('#4f5e3c', yk, 1.2 * s) + D('#c2cb9c', fk, .9 * s)
        + D('#6a3c72', hd[0].concat(ac).map(p => [p[0] + .45 * s, p[1] + .5 * s]), 2.8 * s) + D('#935796', hd[0], 2 * s) + D('#b674b3', ac.map(p => [p[0] - .15 * s, p[1] - .25 * s]), 2.2 * s) + D('#e6badf', hd[2].map(p => [p[0] - .6 * s, p[1] - .8 * s]), 1.2 * s); },
    // II · adaçayı: gümüşi yeşil, keçemsi, geniş oval yapraklardan yuvarlak çalı; birkaç kısa başakta aralıklı halkalar hâlinde mavi-mor çiçek
    adacayi(x, y, s, r) { const W = 11 * s, H = 9.5 * s, R = 3.4 * s, pts = [], lv = ['', '', ''], lh = ['', ''], wd = [], wm = [], wl = []; let st = '';
      for (let i = 0; i < 7; i++) { const a = Math.PI * (i + .5) / 7, k = .78 + r() * .18; pts.push([x - Math.cos(a) * (W - R) * k, y - R * .85 - Math.sin(a) * (H - R * 1.4) * k]); }
      pts.push([x - W * .3, y - R * .9], [x + W * .3, y - R * .85]);
      for (let i = 0; i < 10; i++) { const a = -Math.PI * (.05 + (i + .2 + r() * .6) / 10 * .9), c = Math.cos(a), sn = Math.sin(a), bx = x + c * W * .28, by = y - H * .34 + sn * H * .26, Lh = (6.6 + r() * 2.2) * s, aa = a + (r() - .5) * .3, l = -c * .65 - sn * .35 + (r() - .5) * .3, k = l > .4 ? 2 : l > -.1 ? 1 : 0;
        lv[k] += genis(bx, by, Lh, Lh * .27, aa); if (k) lh[k - 1] += genis(bx, by, Lh, Lh * .27, aa, true); }
      const n = r() < .5 ? 2 : 3;
      for (let i = 0; i < n; i++) { const k = (i / (n - 1) * 2 - 1) * .6, bx = x + k * W * .55 + (r() - .5) * 1.4 * s, by = y - H * .6 - (1 - k * k) * H * .28, Lh = (9.5 + r() * 3.5) * s, e = k * 3.2 * s;
        st += `M${P(bx, by)}Q${P(bx + e * .15, by - Lh * .5)} ${P(bx + e, by - Lh)}`;
        for (let j = 0; j < 4; j++) { const tt = .36 + j * .19, hx = bx + e * tt * tt, hy = by - Lh * tt, hw = (2.2 - j * .32) * s; wd.push([hx + hw * .5, hy + .3 * s]); wm.push([hx - hw * .5, hy]); if (j < 3) wl.push([hx - hw * .6, hy - .5 * s]); }
        wd.push([bx + e, by - Lh]); }
      return kume(pts, R, '#7d8f79', { dk: '#4f5f52', lt: '#a1b099', hi: null }) + F('#62735f', lv[0]) + F('#8b9b85', lv[1]) + F('#a5b49d', lh[0]) + F('#b0bfa7', lv[2]) + F('#d0dac6', lh[1])
        + L('#5c6848', st, .8 * s) + D('#463f8e', wd, 1.8 * s) + D('#7266c2', wm, 1.75 * s) + D('#b0a8ee', wl, .95 * s); },
    // III · gece sefası: koyu yeşil sık çalı, oval yapraklar; uzun tüplü borazan çiçekler (yanlarda yandan görünür, tepede ağzı bize dönük), gece parlayan polen
    gece(x, y, s, r, pal) { const R = 4.5 * s, W = 11.5 * s, H = 12.5 * s, pts = [], fc = {}, ag = {}, tb = {}, yz = {}, pol = [], i0 = Math.floor(r() * pal.length), rk = [pal[i0], pal[(i0 + 1 + Math.floor(r() * (pal.length - 1))) % pal.length]]; let lv = '', ll = '';
      const ek = (o, k, d) => { o[k] = (o[k] || '') + d; };
      for (let i = 0; i < 8; i++) { const a = Math.PI * (i + .5) / 8, k = .8 + r() * .22; pts.push([x - Math.cos(a) * (W - R * .4) * k, y - R * .85 - Math.sin(a) * (H - R) * k]); }
      pts.push([x - W * .3, y - R * .95], [x + W * .3, y - R * .9]);
      for (let i = 0; i < 4; i++) { const a = Math.PI * (.12 + i * .2 + r() * .08), px = x - Math.cos(a) * W * .55, py = y - R * .8 - Math.sin(a) * (H - R) * .7, aa = Math.atan2(-Math.sin(a), -Math.cos(a)) + (r() - .5) * .4; lv += yaprak(px, py, 5.8 * s, 2.7 * s, aa); ll += yarim(px, py, 5.8 * s, 2.7 * s, aa); }
      for (let i = 0, nf = 4 + Math.round(s * 1.6 + r() * 1.4); i < nf; i++) { const th = Math.PI * (.08 + r() * .84), k = .84 + r() * .2, fx = x - Math.cos(th) * (W - R * .45) * k, fy = y - R * .8 - Math.sin(th) * (H - R * .6) * k, [c, cl, cd] = rk[r() < .62 ? 0 : 1], q0 = 1.25 * s;
        if (Math.abs(Math.cos(th)) > .45) { const a = Math.atan2(-Math.sin(th) * .8 - .25, -Math.cos(th)), ca = Math.cos(a), sa = Math.sin(a), mx = fx + ca * 4.4 * q0, my = fy + sa * 4.4 * q0, nx = -sa * 2.3 * q0, ny = ca * 2.3 * q0;
          ek(tb, cd, `M${P(fx, fy)}L${P(mx - ca * 1.6 * q0, my - sa * 1.6 * q0)}`);
          ek(fc, c, `M${P(mx - ca * 2.4 * q0, my - sa * 2.4 * q0)}L${P(mx + nx, my + ny)}Q${P(mx + ca * 1.2 * q0, my + sa * 1.2 * q0)} ${P(mx - nx, my - ny)}Z`);
          ek(ag, cl, `M${P(mx + nx, my + ny)}Q${P(mx + ca * 1.6 * q0, my + sa * 1.6 * q0)} ${P(mx - nx, my - ny)}Q${P(mx + ca * .4 * q0, my + sa * .4 * q0)} ${P(mx + nx, my + ny)}Z`);
          pol.push([mx + ca * .9 * q0, my + sa * .9 * q0]); }
        else { for (let j = 0; j < 5; j++) { const b0 = j / 5 * 6.283 - 1.571; (yz[c] = yz[c] || []).push([fx + Math.cos(b0) * q0, fy + Math.sin(b0) * q0 * .82]); } (yz[cd] = yz[cd] || []).push([fx + .15 * s, fy + .1 * s]); pol.push([fx - .45 * s, fy - .55 * s]); } }
      let o = kume(pts, R, '#3a6e45', { dk: '#22452f', lt: '#548d4e', hi: null }) + F('#467f44', lv) + F('#62994f', ll);
      for (const k in tb) o += L(k, tb[k], 1.5 * s);
      for (const k in fc) o += F(k, fc[k]);
      for (const k in ag) o += F(k, ag[k]);
      for (const [c] of rk) if (yz[c]) o += D(c, yz[c], 2.6 * s);
      for (const [, , cd] of rk) if (yz[cd]) o += D(cd, yz[cd], 1.5 * s);
      return o + D('#fff2b8>#fffbe0', pol, .95 * s) + hale(x, y - H * .6, 17 * s); },
    // IV · kök otu: geniş, yuvarlak omuzlu yapraklı rozet (orta damarlı); ortada altın saplı, sarı çiçek şemsiyesi
    kok(x, y, s, r) { let dk = '', md = '', h0 = '', h1 = '', dm = '', o = ''; const y0 = y - 1.5 * s;
      for (let i = 0; i < 6; i++) { const a = -Math.PI * (.03 + (i + .15 + r() * .7) / 6 * .94), Lh = (10 + r() * 3.5) * s, c = Math.cos(a), sn = Math.sin(a), lit = -c * .7 - sn * .45 > .2;
        if (lit) { md += genis(x, y0, Lh, Lh * .36, a); h1 += genis(x, y0, Lh, Lh * .36, a, true); } else { dk += genis(x, y0, Lh, Lh * .36, a); h0 += genis(x, y0, Lh, Lh * .36, a, true); }
        dm += `M${P(x + c * 2 * s, y0 + sn * 2 * s)}L${P(x + c * Lh * .8, y0 + sn * Lh * .8)}`; }
      o = F('#2a5530', dk) + F('#3a6f36', h0) + F('#4a8a3e', md) + F('#6aa64c', h1) + L('#a8c878', dm, .7 * s);
      if (r() < .75) { const e = (r() - .5) * 5 * s, hx = x + e, hy = y - 21 * s, um = []; for (let i = 0; i < 7; i++) { const a = i / 7 * 6.283; um.push([hx + Math.cos(a) * 3.2 * s, hy + Math.sin(a) * 1.6 * s]); }
        o += L('#b58a2a', `M${P(x, y - 3 * s)}Q${P(x + e * .2, y - 12 * s)} ${P(hx, hy)}`, 1.3 * s) + D('#c8901e>#8a6a2a', um, 2.8 * s) + D('#f6d25a>#b89a4a', um.filter(p => p[0] <= hx).map(p => [p[0] - .5 * s, p[1] - .7 * s]), 1.7 * s); }
      return o; },
    // V · anka çiçeği: bronz kılıç yapraklar, ince sap, alev biçimli taç (kızıl, turuncu, altın); gece közleşir
    anka(x, y, s, r, ana) { const H = (ana ? 26 : 14 + r() * 5) * s, e = (r() - .5) * 4 * s, hx = x + e, hy = y - H, Hh = (ana ? 24 : 14 + r() * 3) * s, W = Hh * .34, te = (r() - .5) * 4 * s;
      let o = kilic(x, y, s, r, 5, ana ? 1.25 : 1) + L('#4a4426', `M${P(x, y)}Q${P(x + e * .2, y - H * .5)} ${P(hx, hy + 2 * s)}`, 1.9 * s);
      if (ana) for (const [t0, sd] of [[.38, -1], [.55, 1]]) { const px = x + e * t0 * t0, py = y - H * t0; o += F('#3a3420', `M${P(px, py)}Q${P(px + sd * 5 * s, py - 6 * s)} ${P(px + sd * 10 * s, py - 4 * s)}Q${P(px + sd * 5 * s, py - 2 * s)} ${P(px, py + 1.5 * s)}Z`) + F('#6e5a2c', `M${P(px, py)}Q${P(px + sd * 5 * s, py - 6 * s)} ${P(px + sd * 10 * s, py - 4 * s)}Q${P(px + sd * 4 * s, py - 4 * s)} ${P(px, py)}Z`); }
      o += F('#a8281c>#ff4a24', alev(hx - W * .5, hy - Hh * .08, Hh * .55, W * .5, -W * 1.1)) + F('#a8281c>#ff4a24', alev(hx + W * .5, hy - Hh * .06, Hh * .5, W * .46, W * 1.1))
        + F('#c8361e>#ff5a28', alev(hx, hy, Hh, W, te)) + F('#ee6a1e>#ff8a30', alev(hx - W * .06, hy - Hh * .05, Hh * .78, W * .7, te * .8))
        + F('#ffc23c>#ffd450', alev(hx - W * .12, hy - Hh * .08, Hh * .52, W * .42, te * .6)) + F('#fff0a8>#fff6c8', alev(hx - W * .16, hy - Hh * .1, Hh * .26, W * .2, te * .4))
        + F('#4a4426', ell(hx, hy + .4 * s, W * .55, 1.6 * s));
      if (ana) { let st = ''; const uc = []; for (const k of [-1, -.3, .45, 1]) { const ex = hx + te * .6 + k * W * .55, ey = hy - Hh * (1.02 + (1 - Math.abs(k)) * .12); st += `M${P(hx - W * .1, hy - Hh * .5)}Q${P(hx + k * W * .1, ey + Hh * .15)} ${P(ex, ey)}`; uc.push([ex, ey]); } o += L('#e8a030>#ffd070', st, .7 * s) + D('#fff0a0>#fffbe0', uc, 1.6 * s); }
      const em = []; for (let i = 0; i < (ana ? 6 : 2); i++) em.push([hx + (r() - .5) * W * 3.2, hy - Hh * (.5 + r() * .9)]);
      return o + D('#ff9a3a>#ffb850', em, 1.6 * s) + `<circle class="Nl" cx="${f1(hx)}" cy="${f1(hy - Hh * .45)}" r="${f1(Hh * (ana ? 1.4 : 1.2))}" fill="url(#${K.glowId()})"/>`; },
  };
  const BOY = { kekik: [.42, .4, 14], adacayi: [.42, .62, 13], gece: [.46, .6, 13], kok: [.5, .5, 14], anka: [.36, 1.1, 10] };      // gölge yarıçapı, boy (birim), yarı en (px)

  // anka tomurcuğu: kılıç yapraklar, kıvrık sap, bronz çanak yapraklarına sarılı kapalı alev tomurcuğu (ucu közlü)
  const ankaGenc = (x, y, s, r) => { const e = (r() - .5) * 4 * s, H = (8 + r() * 4) * s, bx = x + e, by = y - H, bh = (7 + r() * 2) * s, bw = 2.5 * s;
    return kilic(x, y, s, r, 4, .8) + L('#4a4426', `M${P(x, y)}Q${P(x + e * .1, y - H * .6)} ${P(bx, by)}`, 1.3 * s)
      + F('#8a2016>#e8481e', alev(bx, by + .6 * s, bh, bw, e * .15)) + F('#d0441e>#ff7a30', alev(bx - .5 * s, by, bh * .8, bw * .5, e * .12)) + F('#ffc04a>#ffe080', alev(bx - .3 * s, by - bh * .55, bh * .32, bw * .26, e * .1))
      + F('#7a6432', `M${P(bx, by + 1 * s)}Q${P(bx - bw * 1.5, by - bh * .2)} ${P(bx - bw * .3, by - bh * .62)}Q${P(bx - bw * .7, by - bh * .2)} ${P(bx, by + 1 * s)}Z`)
      + F('#4e4224', `M${P(bx, by + 1 * s)}Q${P(bx + bw * 1.5, by - bh * .2)} ${P(bx + bw * .4, by - bh * .58)}Q${P(bx + bw * .6, by - bh * .2)} ${P(bx, by + 1 * s)}Z`); };
  // altın kök: çukurdan yarı çekilmiş, kalın, burgulu, boğum boğum kök: çukurda kalın, ortada şişkin, boyna doğru incelir; tepede yapraklı taç,
  // yanda çukurdan çıkan çatal bacak ve saçak kökler (x, y: çukur ağzı; a tepeye doğru yön; Lh görünen boy)
  const KK = ['#7e5212>#5e4420', '#d49a30>#a8803a', '#f8e09a>#d0ac60', '#a87828>#7a5c2c'];
  const altinKok = (x, y, a, Lh, s, r, yp = true) => { const c = Math.cos(a), sn = Math.sin(a), pts = [], bl = [], ph = r() * 6, n = 7, sd = r() < .5 ? 1 : -1, ba = a + sd * .8, bc = Math.cos(ba), bs = Math.sin(ba);
    for (let i = 0; i <= n; i++) { const k = i / n, wob = Math.sin(k * 5 + ph) * 1.9 * s * (1 - k * .5); pts.push([x + c * Lh * k - sn * wob, y + sn * Lh * k + c * wob]); }
    for (let i = 0; i <= 4; i++) { const k = i / 4, wob = Math.sin(k * 4 + ph * 1.3) * 1.1 * s; bl.push([pts[1][0] + bc * Lh * .5 * k - bs * wob, pts[1][1] + bs * Lh * .5 * k + bc * wob]); }
    const wf = k => (k < .36 ? 6.4 + k * 6 : 8.6 - (k - .36) * 8.4) * s; let kr = '', sc = '';
    for (const i of [1, 2, 3, 4, 5]) { const p = pts[i], w = wf(i / n) * .5, k = i % 2 ? .9 : .7; kr += `M${P(p[0] - sn * w * k, p[1] + c * w * k)}q${f1(c * 1.4 * s - sn * w * .2)} ${f1(sn * 1.4 * s + c * w * .2)} ${f1(sn * w * 1.6 * k)} ${f1(-c * w * 1.6 * k)}`; }
    for (const [i, d] of [[2, 1], [3, -1], [5, 1]]) { const p = pts[i], w = wf(i / n) * .5; sc += `M${P(p[0] + sn * w * d, p[1] - c * w * d)}q${f1(sn * 2.6 * s * d + c * 1.2 * s)} ${f1(-c * 2.6 * s * d + sn * 1.2 * s + 1 * s)} ${f1(sn * 3.6 * s * d + c * 3 * s)} ${f1(-c * 3.6 * s * d + sn * 3 * s + 2.4 * s)}`; }
    { const e = bl[4]; sc += `M${P(e[0], e[1])}q${f1(bc * 2 * s)} ${f1(bs * 2 * s + 1 * s)} ${f1(bc * 3.4 * s + 1 * s)} ${f1(bs * 3.4 * s + 2.4 * s)}`; }
    let o = L(KK[0], sc, .65 * s) + F(KK[0], serit(bl, 3.6 * s, .9 * s)) + F(KK[1], serit(bl, 2 * s, .5 * s, -.4 * s, -.6 * s))
      + F(KK[0], serit(pts, wf)) + F(KK[1], serit(pts, k => wf(k) * .66, 0, -.7 * s, -1 * s)) + L(KK[3], kr, .7 * s)
      + L(KK[2], `M${P(pts[1][0] - 1.4 * s, pts[1][1] - 1.6 * s)}Q${P(pts[3][0] - 2.4 * s, pts[3][1] - 1.4 * s)} ${P(pts[6][0] - 1.2 * s, pts[6][1] - .6 * s)}`, 1.1 * s);
    const tp = pts[n]; o += D(KK[0], [tp], 5.4 * s) + D(KK[1], [[tp[0] - .5 * s, tp[1] - .7 * s]], 3.4 * s);      // boyun ucunda taç
    if (yp) { let dk = '', lt = '', sp = ''; for (const g of [-.6, 0, .6]) { const gg = a + g + (r() - .5) * .3, bx = tp[0] + Math.cos(gg) * 3 * s, by = tp[1] + Math.sin(gg) * 3 * s; sp += `M${P(tp[0], tp[1])}L${P(bx, by)}`; dk += genis(bx, by, 8 * s, 2.8 * s, gg); lt += genis(bx, by, 8 * s, 2.8 * s, gg, true); }
      o += L('#7a9a3a', sp, 1 * s) + F('#4f8432', dk) + F('#86b850', lt); }
    return o; };
  // toprağın üstünde açıkta kalan ince altın kök iplikleri
  const kokIp = (x, y, w, s, r) => { let d = ''; for (let i = 0; i < 2; i++) { const y0 = y - (1 + i * 2) * s, x0 = x - w * (.8 - i * .3); d += `M${P(x0, y0)}q${f1(w * .4)} ${f1(-3 * s)} ${f1(w * .8)} ${f1(-.5 * s)}t${f1(w * .6)} ${f1((r() - .3) * 3 * s)}`; } return L(KK[0], d, 2.2 * s) + L(KK[1], d, 1.2 * s); };

  /* ---------- eşyalar (ekran pikseli; x, y taban ortası) ---------- */
  // örgü sepet; ic: içindeki kesilmiş bitkinin renkleri [yaprak, çiçek]
  const sepet = (x, y, s, ic) => { const w = 7.5 * s, h = 7 * s, ry = w * .42, top = y - h, pts = [];
    const body = `M${P(x - w, top)}L${P(x - w * .8, y - ry * .4)}Q${P(x, y + ry * 1.1)} ${P(x + w * .8, y - ry * .4)}L${P(x + w, top)}A${f1(w)} ${f1(ry)} 0 0 1 ${P(x - w, top)}Z`;
    const lit = `M${P(x - w, top)}L${P(x - w * .8, y - ry * .4)}Q${P(x - w * .35, y + ry * .85)} ${P(x - w * .05, y + ry * .5)}L${P(x - w * .1, top + ry)}A${f1(w)} ${f1(ry)} 0 0 1 ${P(x - w, top)}Z`;
    let band = ''; for (const k of [.3, .64]) { const yy = top + h * k; band += `M${P(x - w * (.96 - k * .18), yy)}Q${P(x, yy + ry * 1.9)} ${P(x + w * (.96 - k * .18), yy)}`; }
    for (let i = 0; i < 5; i++) pts.push([x - w * .6 + i * w * .3, top - .6 * s - Math.sin(i / 4 * Math.PI) * 2.4 * s]);
    return F('#5a3e22', ell(x, top, w * .94, ry * .86)) + kume(pts, 2.7 * s, ic[0], { hi: null }) + (ic[1] ? D(ic[1], pts.map(p => [p[0] - .8 * s, p[1] - 1.8 * s]), 2.4 * s) + D(tone(ic[1], .4), pts.slice(0, 3).map(p => [p[0] - 1.3 * s, p[1] - 2.4 * s]), 1.2 * s) : '')
      + F('#8a6432', body) + F('#c99c5a', lit) + L('#6f4f28', band, .8 * s) + L('#d8b070', `M${P(x - w, top)}A${f1(w)} ${f1(ry)} 0 0 0 ${P(x + w, top)}`, 1.4 * s)
      + L('#9a7038', `M${P(x - w * .8, top + ry * .3)}Q${P(x, top - w * 2.3)} ${P(x + w * .8, top + ry * .3)}`, 1.3 * s); };
  // orak: yatık sap ve hilal ağız (x, y: sapın dibi)
  const orak = (x, y, s) => { const bl = `M${P(x + 4.4 * s, y - 1.4 * s)}Q${P(x + 8.6 * s, y - 7.6 * s)} ${P(x + 14.6 * s, y - 4.6 * s)}Q${P(x + 9.4 * s, y - 5.2 * s)} ${P(x + 5.6 * s, y - .6 * s)}Z`;
    return L('#6e4a2a', `M${P(x - 1.6 * s, y)}L${P(x + 4.4 * s, y - 1.4 * s)}`, 2.3 * s) + L('#b08052', `M${P(x - 1.2 * s, y - .5 * s)}L${P(x + 3.4 * s, y - 1.6 * s)}`, .8 * s)
      + F('#8f989e', bl) + L('#eef2f4', `M${P(x + 5.6 * s, y - .8 * s)}Q${P(x + 9.4 * s, y - 5.2 * s)} ${P(x + 14.4 * s, y - 4.7 * s)}`, .8 * s) + F('#5e666c', ell(x + 4.6 * s, y - 1.3 * s, 1 * s, .7 * s)); };
  // düz taş (orağın altlığı)
  const tas = (x, y, s, tc) => { const top = `M${P(x - 9 * s, y - 3 * s)}L${P(x - 5 * s, y - 6.4 * s)}L${P(x + 5.5 * s, y - 6.6 * s)}L${P(x + 9.5 * s, y - 3.2 * s)}L${P(x + 6 * s, y - .6 * s)}L${P(x - 6 * s, y - .4 * s)}Z`;
    const yan = `M${P(x - 9 * s, y - 3 * s)}L${P(x - 6 * s, y - .4 * s)}L${P(x + 6 * s, y - .6 * s)}L${P(x + 9.5 * s, y - 3.2 * s)}L${P(x + 9.3 * s, y - .6 * s)}L${P(x + 6 * s, y + 2.2 * s)}L${P(x - 6 * s, y + 2.4 * s)}L${P(x - 9 * s, y - .4 * s)}Z`;
    return F(tone(tc, -.3), yan) + F(tone(tc, -.1), `M${P(x - 9 * s, y - 3 * s)}L${P(x - 6 * s, y - .4 * s)}L${P(x - 6 * s, y + 2.4 * s)}L${P(x - 9 * s, y - .4 * s)}Z`) + F(tone(tc, .2), top); };
  // yuvarlak çakıl: koyu gövde, açık üst
  const cakil = (x, y, w, h, c) => F(tone(c, -.3), `M${P(x - w, y - h * .2)}Q${P(x - w, y + h * .7)} ${P(x, y + h * .75)}Q${P(x + w, y + h * .7)} ${P(x + w, y - h * .2)}Q${P(x + w * .8, y - h * 1.1)} ${P(x, y - h * 1.1)}Q${P(x - w * .8, y - h * 1.1)} ${P(x - w, y - h * .2)}Z`) + F(tone(c, .14), ell(x - w * .14, y - h * .5, w * .74, h * .48));
  // kurutma askısı: iki çatallı kazık, çatallara oturan sırık; sırıktan baş aşağı asılı, iple bağlı dolgun demetler (c: [yaprak, çiçek])
  const aski = (x, y, s, c, r) => { const H = 18 * s, Wd = 13 * s; let ky = '', ip = '', dk = '', lt = '', bg = '', sp = ''; const fl = [];
    for (const ex of [x - Wd, x + Wd]) ky += `M${P(ex, y + .5 * s)}L${P(ex, y - H)}l${f1(-2.2 * s)} ${f1(-3.2 * s)}M${P(ex, y - H)}l${f1(2.2 * s)} ${f1(-3.2 * s)}`;
    const n = 5; for (let i = 0; i < n; i++) { const bx = x - Wd * .72 + i * Wd * 1.44 / (n - 1) + (r() - .5) * s, by = y - H - .6 * s + Math.sin((i + .5) / n * Math.PI) * .9 * s, Lh = (9.5 + r() * 2.5) * s, bw = 3.8 * s, ty = by + 1.6 * s;
      ip += `M${P(bx, by)}v${f1(1.6 * s)}`; sp += `M${P(bx - .7 * s, ty)}l${f1(-.5 * s)} ${f1(-2 * s)}M${P(bx + .6 * s, ty)}l${f1(.7 * s)} ${f1(-1.9 * s)}`;
      dk += `M${P(bx - 1 * s, ty)}Q${P(bx - bw, ty + Lh * .55)} ${P(bx, ty + Lh)}Q${P(bx + bw, ty + Lh * .55)} ${P(bx + 1 * s, ty)}Z`;
      lt += `M${P(bx - 1 * s, ty)}Q${P(bx - bw * .9, ty + Lh * .55)} ${P(bx, ty + Lh)}Q${P(bx - bw * .15, ty + Lh * .5)} ${P(bx, ty)}Z`; bg += `M${P(bx - 1.2 * s, ty + .7 * s)}h${f1(2.4 * s)}`;
      if (c[1]) fl.push([bx - .7 * s, ty + Lh * .84], [bx + 1 * s, ty + Lh * .66], [bx - 1.5 * s, ty + Lh * .56], [bx + .3 * s, ty + Lh * .95]); }
    return L('#5e4030', ky, 1.9 * s) + L('#7a5236', `M${P(x - Wd - 3 * s, y - H - .6 * s)}Q${P(x, y - H + 1 * s)} ${P(x + Wd + 3 * s, y - H - .8 * s)}`, 1.8 * s) + L('#cdb88a', ip, .6 * s) + L(tone(c[0], -.2), sp, .8 * s)
      + F(tone(c[0], -.32), dk) + F(c[0], lt) + D(c[1] || c[0], fl, 2 * s) + L('#e2c27a', bg, 1 * s); };
  // taş yığını (yol işareti): üst üste yassı taşlar, tepesinde bağlı bir demet
  const yigin = (x, y, s, tc, c) => { let o = ''; for (const [dx, dy, w, h] of [[0, 0, 7, 3.2], [-.7, -3.7, 5.8, 2.9], [.5, -6.9, 4.6, 2.5], [-.3, -9.4, 3.2, 2.1]]) o += cakil(x + dx * s, y + dy * s, w * s, h * s, tc);
    return o + (c ? F(tone(c[0], -.25), `M${P(x - 1 * s, y - 11 * s)}l${f1(5 * s)} ${f1(-3.4 * s)}l${f1(1 * s)} ${f1(1.4 * s)}z`) + L('#cdb88a', `M${P(x + 1.2 * s, y - 12.3 * s)}l${f1(.6 * s)} ${f1(1 * s)}`, .9 * s) + D(c[1] || c[0], [[x + 4 * s, y - 14 * s], [x + 5.4 * s, y - 13.2 * s]], 1.8 * s) : ''); };
  // yere bırakılmış kesik dallar: ince saplar, yaprak ve çiçek benekleri (c: [yaprak, çiçek])
  const dalYer = (x, y, s, c, r) => { let st = ''; const lv = [], fl = []; for (let i = 0; i < 3; i++) { const a = -.35 + i * .3 + (r() - .5) * .2, Lh = (7 + r() * 3) * s, x0 = x - Lh * .5 + i * 1.2 * s, y0 = y + i * .9 * s; st += `M${P(x0, y0)}l${f1(Math.cos(a) * Lh)} ${f1(Math.sin(a) * Lh * .5)}`;
      for (let k = 1; k <= 3; k++) lv.push([x0 + Math.cos(a) * Lh * k / 3.4, y0 + Math.sin(a) * Lh * .5 * k / 3.4 - .6 * s]); fl.push([x0 + Math.cos(a) * Lh, y0 + Math.sin(a) * Lh * .5 - .5 * s]); }
    return L(tone(c[0], -.25), st, .8 * s) + D(c[0], lv, 2.1 * s) + D(c[1] || c[0], fl, 2.2 * s); };
  // saman kovan (yuvarlak çan, sarmal halkalar, dipte giriş)
  const kovan = (x, y, s) => { const w = 7.2 * s, h = 14 * s;
    const g = `M${P(x - w, y)}C${P(x - w, y - h * .62)} ${P(x - w * .55, y - h)} ${P(x, y - h)}C${P(x + w * .55, y - h)} ${P(x + w, y - h * .62)} ${P(x + w, y)}Q${P(x, y + w * .38)} ${P(x - w, y)}Z`;
    const lt = `M${P(x - w, y)}C${P(x - w, y - h * .62)} ${P(x - w * .55, y - h)} ${P(x, y - h)}C${P(x + w * .3, y - h)} ${P(x + w * .42, y - h * .5)} ${P(x + w * .2, y + w * .33)}Q${P(x - w * .4, y + w * .3)} ${P(x - w, y)}Z`;
    let hl = ''; for (const k of [.2, .4, .58, .75, .88]) { const hw = w * Math.sqrt(1 - k * k) * (k > .7 ? .95 : 1), yy = y - h * k; hl += `M${P(x - hw, yy)}Q${P(x, yy + hw * .42)} ${P(x + hw, yy)}`; }
    return F('#9a7432', g) + F('#d2a852', lt) + L('#8a6428', hl, .9 * s) + F('#efd27e', `M${P(x - w * .78, y - h * .45)}Q${P(x - w * .7, y - h * .82)} ${P(x - w * .2, y - h * .95)}Q${P(x - w * .55, y - h * .7)} ${P(x - w * .62, y - h * .4)}Z`)
      + F('#3a2a16', `M${P(x - 2 * s, y + 1.4 * s)}Q${P(x - 2 * s, y - 2.4 * s)} ${P(x, y - 2.4 * s)}Q${P(x + 2 * s, y - 2.4 * s)} ${P(x + 2 * s, y + 1.4 * s)}Z`); };
  // mala: toprağa saplanmış ağız, eğik ahşap sap
  const mala = (x, y, s) => `${L('#6a4628', `M${P(x - 3.4 * s, y - 6.4 * s)}L${P(x - 8.6 * s, y - 13.8 * s)}`, 2.6 * s)}${L('#b08052', `M${P(x - 4 * s, y - 7.8 * s)}L${P(x - 7.8 * s, y - 13 * s)}`, .8 * s)}${L('#5e666c', `M${P(x - 1.6 * s, y - 3.6 * s)}L${P(x - 3.6 * s, y - 6.6 * s)}`, 1.1 * s)}`
    + F('#8f989e', `M${P(x + .6 * s, y + .4 * s)}Q${P(x + 1.6 * s, y - 3.4 * s)} ${P(x - 1.4 * s, y - 3.8 * s)}Q${P(x - 3.4 * s, y - 2.6 * s)} ${P(x + .6 * s, y + .4 * s)}Z`) + F('#d5dade', `M${P(x - 1.4 * s, y - 3.8 * s)}Q${P(x - 3.4 * s, y - 2.6 * s)} ${P(x - .2 * s, y - .6 * s)}Q${P(x - 1.4 * s, y - 2.4 * s)} ${P(x - 1.4 * s, y - 3.8 * s)}Z`);
  // ağaç (arka plan): gövde ve nokta taç
  const agac = (x, y, s, r, col, gv, H0) => { const H = (H0 || 14) * s, R = 7 * s, pts = [[x, y - H - R * 1.1]];
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283 + r() * .5, d = R * (1.05 + r() * .55); pts.push([x + Math.cos(a) * d * 1.2, y - H - R * .9 + Math.sin(a) * d * .78]); }
    return F(gv, `M${P(x - 2.6 * s, y)}L${P(x - 1.4 * s, y - H)}L${P(x + 1.4 * s, y - H)}L${P(x + 2.6 * s, y)}Z`) + F(tone(gv, -.35), `M${P(x + .3 * s, y)}L${P(x + .2 * s, y - H)}L${P(x + 1.4 * s, y - H)}L${P(x + 2.6 * s, y)}Z`) + kume(pts, R, col, { hi: null }); };
  // söğüt: sarkık dallı açık yeşil taç
  const sogut = (x, y, s, r) => { const H = 16 * s, R = 6.5 * s, pts = []; let dl = '';
    for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283 + r() * .4, d = R * (1 + r() * .5); pts.push([x + Math.cos(a) * d * 1.35, y - H - R + Math.sin(a) * d * .6]); }
    for (let i = 0; i < 11; i++) { const dx = (i / 10 * 2 - 1) * R * 2.2, hh = (8 + r() * 6) * s; dl += `M${P(x + dx, y - H - R * .2 + Math.abs(dx) * .2)}q${f1(dx * .08)} ${f1(hh * .6)} ${f1(dx * .12)} ${f1(hh)}`; }
    return F('#6a5236', `M${P(x - 2.4 * s, y)}Q${P(x - 1.6 * s, y - H * .5)} ${P(x - 3 * s, y - H)}L${P(x + 1.6 * s, y - H)}Q${P(x + 1.4 * s, y - H * .5)} ${P(x + 2.6 * s, y)}Z`) + kume(pts, R, '#8fb455') + L('#7aa046', dl, 1.6 * s) + L('#b4d070', dl.replace(/M([-\d.]+)/g, (m, a) => 'M' + f1(+a - 1)), .6 * s); };
  // eğrelti: kavisli yapraklar, yaprakçıklar
  const egrelti = (x, y, s, r, col) => { let d = '', yk = ''; for (let i = 0; i < 5; i++) { const a = -Math.PI * (.12 + i / 4 * .76) + (r() - .5) * .2, Lh = (9 + r() * 5) * s, c = Math.cos(a), sn = Math.sin(a), ex = x + c * Lh, ey = y + sn * Lh * .8;
      d += `M${P(x, y)}Q${P(x + c * Lh * .5, y + sn * Lh * .9)} ${P(ex, ey + 2 * s)}`; for (let k = 1; k < 4; k++) { const t = k / 4, px = x + c * Lh * t, py = y + sn * Lh * .85 * t; yk += `M${P(px - sn * 2.4 * s + c, py + c * 1.6 * s + 1)}L${P(px, py)}l${f1(sn * 2.4 * s + c)} ${f1(-c * 1.6 * s + 1)}`; } }
    return L(tone(col, -.25), d, 1 * s) + L(col, yk, 1.5 * s); };
  // saz öbeği (dere kıyısı): ince yapraklar, kahverengi püsküller
  const saz = (x, y) => { let s0 = '', hd = ''; for (let i = 0; i < 6; i++) { const dx = (i - 2.5) * 2.2, hh = 11 + (i * 7 % 5) * 2.4, lean = dx * .25; s0 += `M${P(x + dx, y)}Q${P(x + dx, y - hh * .6)} ${P(x + dx + lean, y - hh)}`; if (i % 2) hd += `M${P(x + dx + lean * .9, y - hh * .92)}v-3.6`; } return L('#4f7a3a', s0, 1.1) + L('#7a5232', hd, 2.2); };
  // kireçtaşı kaya: yassı, katmanlı, açık krem; düz üst yüz ışıkta, sol ön yüz yarı gölgede, sağ yüz gölgede; ön yüzde katman çizgileri, üstte oyuklar (x, y: taban ortası; w yarı en, h boy)
  const kirec = (x, y, w, h, c, r) => { const j = () => 1 + (r() - .5) * .18, A = [x - w * j(), y - h * .42], B = [x - w * .55 * j(), y - h * j()], Cc = [x + w * .45 * j(), y - h * j()], Dd = [x + w * j(), y - h * .45], E = [x + w * .82, y + h * .1], G = [x - w * .76, y + h * .12], fl = [x - w * .28, y - h * .3], fr = [x + w * .36, y - h * .34], fb = [x + w * .12, y + h * .18];
    let st = ''; for (const k of [.28, .55]) st += `M${P(A[0] + w * .12, A[1] + h * k * .8)}L${P(fl[0], fl[1] + h * k)}L${P(fr[0] - w * .04, fr[1] + h * k)}`;
    return F(tone(c, -.36), S([A, B, Cc, Dd, E, fb, G])) + F(tone(c, -.12), S([A, fl, fr, fb, G])) + F(tone(c, .14), S([A, B, Cc, Dd, fr, fl])) + L(tone(c, -.28), st, .7)
      + D(tone(c, -.18), [[x - w * .3 + r() * w * .3, y - h * .72], [x + w * .05 + r() * w * .3, y - h * .66]], 1.5) + L(tone(c, .3), `M${P(B[0] + w * .1, B[1] + h * .12)}L${P(Cc[0] - w * .15, Cc[1] + h * .1)}`, .8); };
  // dikili taş (anka halkası): hafif sivrilen bazalt; sol yüz ışıkta, sağ yüz gölgede, tepesi açık; gece tepesi közün ışığını alır
  const dikili = (x, y, w, h) => F('#342e32', `M${P(x - w, y)}L${P(x - w * .66, y - h)}L${P(x + w * .6, y - h * 1.04)}L${P(x + w, y)}Q${P(x, y + w * .45)} ${P(x - w, y)}Z`)
    + F('#575054', `M${P(x - w, y)}L${P(x - w * .66, y - h)}L${P(x, y - h * 1.02)}L${P(x + w * .08, y + w * .35)}Q${P(x - w * .5, y + w * .33)} ${P(x - w, y)}Z`)
    + F('#7a7276>#b0643a', `M${P(x - w * .66, y - h)}L${P(x - w * .1, y - h - w * .42)}L${P(x + w * .6, y - h * 1.04)}L${P(x, y - h + w * .28)}Z`);

  /* Kompozisyon kadraja göre kurulur (y-saha-odun.js gibi): (u, v) kadraj koordinatı; u ekranda yatay (birim; 1 birim = 24 px), v derinlik (1 birim = 12 px aşağı),
     (0, 0) parselin ortası. Görünen zemin: u −2,75…2,75 · v −5,9…3,6. Bitki sürüklentileri, yanlarda çerçeve, ortada önde toplayıcının köşesi. */
  const KADEME = [null,
    { ad: 'kekik', zemin: '#c6b77c', koyu: '#b2a265', acik: '#d7cb9b', yol: '#e8dec0', tas: '#e8e1d0', ar: .82, en: 14, yavru: 4, arka: .6, s: [.72, 1.28], demet: ['#788a5c', '#b674b3'] },
    { ad: 'adacayi', zemin: '#86ad5e', koyu: '#71964f', acik: '#9dc06f', yol: '#cdbd8a', tas: '#c4bcaa', ar: 1, en: 12, yavru: 3, arka: 0, s: [.82, 1.16], demet: ['#9fb498', '#7266c2'] },
    { ad: 'gece', zemin: '#5a7c4a', koyu: '#48683d', acik: '#71934e', yol: '#978a62', tas: '#9aa28c', ar: 1, en: 12, yavru: 3, arka: .5, s: [.82, 1.16], demet: ['#3d7446', '#c2367f'], vmin: -3.45,
      pal: [['#c2367f>#ff6ac4', '#e277b4>#ffc0e6', '#7a1a50>#ffa0d4'], ['#e0aa30>#ffe27a', '#f7da82>#fff4c0', '#a06a18>#ffd070'], ['#ece4d8>#fffaf0', '#ffffff>#ffffff', '#b09cb0>#ffe0f0'], ['#c2367f>#ff6ac4', '#e277b4>#ffc0e6', '#7a1a50>#ffa0d4']] },
    { ad: 'kok', zemin: '#8b9a58', koyu: '#76854a', acik: '#a2ae6a', yol: '#b39a6a', tas: '#b0a690', ar: 1.05, en: 9, yavru: 2, arka: 0, s: [.85, 1.12], demet: ['#d9a336>#a8803a', '#f3cf6e>#c8a458'] },
    { ad: 'anka', zemin: '#9a6448', koyu: '#7c4a34', acik: '#b27a52', yol: '#6e5044', tas: '#5a5154', ar: 1, en: 9, yavru: 0, arka: 0, s: [.85, 1.05], demet: ['#c8361e', '#ffc23c'], vmin: -4.4 },
  ];
  // altıgen kadrajın içinde mi (ekran pikseli; kadraj ortası 0, 70; W 132 × H 114)
  const icinde = (x, y, m = 0) => { const dx = Math.abs(x), dy = Math.abs(y - 70); return dy <= 57 + m && dx + dy * .577 <= 66 + m; };

  CK.def('saha-bitki', { w: 7, d: 7, name: 'Çiçekli çayır' }, (b, K2, opt) => {
    const t = Math.max(1, Math.min(5, opt.t || 1)), q = opt.q || 0, Kd = KADEME[t], r = b.r, ayna = r() < .5 ? -1 : 1;
    const at = (u, v) => [3.5 + (v + u * ayna) / 2, 3.5 + (v - u * ayna) / 2];      // kadraj → ızgara
    const ek = (u, v, z = 0) => { const g = at(u, v); return pr(g[0], g[1], z); };
    const gor = (u, v, hw, hh) => { const p = ek(u, v), cx = Math.max(p[0] - hw, Math.min(0, p[0] + hw)), cy = Math.max(p[1] - hh, Math.min(70, p[1])); return icinde(cx, cy, 2); };      // kutusu kadraja değiyor mu
    const halka = (x, y, R, z, hc) => { const p = [[x, y, z]]; for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; p.push([x + Math.cos(a) * R, y + Math.sin(a) * R, hc]); } return p; };
    // kadraj noktasına çizim: h boy (birim), g gölge yarıçapı (0: gölgesiz), e taban yarı eni (sıralama kutusu)
    const koy = (u, v, h, g, fn, o = {}) => { const [x, y] = at(u, v), z = o.z || 0, p = pr(x, y, z), e = o.e || .2;
      b.item([x - e, y - e, z, x + e, y + e, z + h], fn(p[0], p[1]), g ? { pts: halka(x, y, g, z, z + h * .5) } : { cast: false }); };
    const ot = (u, v, s, o = {}) => { const [x, y] = at(u, v), rr = rng(Math.round((x * 31.7 + y * 17.3 + s * 7) * 100) + t), bb = BOY[Kd.ad];
      koy(u, v, bb[1] * s * (o.ana ? 2.2 : 1), bb[0] * s, (px, py) => OT[Kd.ad](px, py, s, rr, Kd.ad === 'anka' ? !!o.ana : Kd.pal), { e: .16 * s }); };

    // zemin: düz ton, koyu-açık lekeler (parselin dışına taşar: altıgenin köşeleri boş kalmasın)
    b.pave(-3, -3, 10, 10, Kd.zemin);
    const leke = (n, col, op, u0, u1, v0, v1, r0, r1) => { for (let i = 0; i < n; i++) { const [cx, cy] = at(u0 + r() * (u1 - u0), v0 + r() * (v1 - v0)), rr = r0 + r() * (r1 - r0), pts = []; for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283, d = rr * (.7 + r() * .5); pts.push([cx + Math.cos(a) * d * 1.4, cy + Math.sin(a) * d]); } b.gpoly(pts, typeof col === 'string' ? col : col[i % 2], { op }); } };
    leke(t === 1 ? 9 : 12, [Kd.koyu, Kd.acik], t === 1 ? .42 : .5, -3, 3, -6.2, 4, .7, 1.7);

    // patika: önden gelir, çayırın içine kıvrılır (II: köprüye varır, V: taş halkaya)
    const yc = t === 2 ? [[.45, 4.4], [.55, 3], [.2, 1.7], [-.2, .5], [-.3, -.7], [-.2, -1.7]] : t === 5 ? [[.45, 4.4], [.5, 3], [.3, 2.1], [.2, 1.35]] : [[.45, 4.4], [.55, 3], [.2, 1.7], [-.25, .5], [-.1, -.8], [.3, -2], [.15, -3.2]];
    const yw = [1.1, 1, .88, .76, .64, .52, .4], yolU = v => { for (let i = 1; i < yc.length; i++) if (v >= yc[i][1]) { const a = yc[i], c = yc[i - 1], k = (v - a[1]) / (c[1] - a[1]); return [a[0] + (c[0] - a[0]) * k, yw[i] + (yw[i - 1] - yw[i]) * k]; } return null; };
    { const lft = yc.map((p, i) => at(p[0] - yw[i] / 2, p[1])), rgt = yc.map((p, i) => at(p[0] + yw[i] / 2, p[1])).reverse(); b.gpoly(lft.concat(rgt), Kd.yol, { op: t === 1 ? .9 : .72 }); }

    // toplayıcının köşesi (yerler): sepet, orak taşı; askı ve taş yığını tohuma göre
    const SEP = t === 5 ? [-.85, 1.75] : [-.62, 1.45], ORK = t === 5 ? [1.05, 2.15] : [.95, 2.05], ASK = [1.65, -.45], YIG = [-1.45, 2.35], odak = t === 5 ? [.12, .15] : [-1.3, .25];
    const askiVar = t !== 5 && t !== 3 && r() < .7, yigVar = t !== 4 && r() < .55;
    const bosluk = [[SEP[0], SEP[1], .62], [SEP[0] + .5, SEP[1] + .42, .35], [ORK[0], ORK[1], .6], [odak[0], odak[1], t === 5 ? 1.3 : .62]];      // [u, v, yarıçap]: bitki konmayacak yerler
    if (askiVar) bosluk.push([ASK[0], ASK[1] + .1, .8]); if (yigVar || t === 4) bosluk.push([YIG[0], YIG[1], .45]); if (t === 3) bosluk.push([ASK[0], ASK[1] + .2, .5]);

    // kademeye özgü zemin ve arka plan
    if (t === 1) {      // kuru, güneşli yamaç: kireçtaşı kayalar (arkada iri, yanlarda ve önde küçük), çakıl lekeleri, tahta sekide iki saman kovan
      leke(4, '#e4d9bc', .5, -2.4, 2.4, -5, 3, .2, .38);
      for (const [u, v, w] of [[-2.15, -3.25, 19], [2.25, -2.85, 17], [.85, -5.05, 21], [-1.1, -5.3, 16], [2.35, .75, 12], [-2.45, 1.3, 11], [1.5, -1.75, 9]]) { if (r() < .2) continue; const uu = u + (r() - .5) * .4, vv = v + (r() - .5) * .3, ww = w * (.85 + r() * .3); if (!gor(uu, vv, ww, 10)) continue;
        const rr = rng(Math.round(uu * 97 + vv * 31 + 7)); koy(uu, vv, .32, ww / 36, (x, y) => kirec(x, y, ww, ww * .52, Kd.tas, rr), { e: ww / 60 }); bosluk.push([uu, vv, ww / 30]); }
      const KV = [-1.5, -2.05], [x, y] = at(KV[0], KV[1]); bosluk.push([KV[0], KV[1] - .1, .75]);
      const bx = ayna > 0 ? [x - .42, y - .15, x + .42, y + .15] : [x - .15, y - .42, x + .15, y + .42]; b.box(bx[0], bx[1], 0, bx[2], bx[3], .16, '#8a6a46', { edge: false }).L.planks({ dir: 'h', step: .08 });
      for (const d of [-.21, .21]) { const gx = ayna > 0 ? x + d : x, gy = ayna > 0 ? y : y + d, p = pr(gx, gy, .16); b.item([gx - .14, gy - .14, .16, gx + .14, gy + .14, .7], kovan(p[0], p[1], 1), { pts: halka(gx, gy, .2, .16, .45) }); }
      { const p = pr(x + .3, y + .3, .16), ar0 = [[-14, -10], [9, -21], [17, -9], [-3, -25], [22, -16]].slice(0, 3 + Math.floor(r() * 3)).map(([dx, dy]) => [p[0] + dx + r() * 3, p[1] + dy + r() * 3]);      // arılar
        b.item([x + .5, y + .5, 0, x + .6, y + .6, 1], D('#3a2a16', ar0, 1.7) + D('#f0c040', ar0.map(q => [q[0] + .5, q[1]]), .9) + D('#ffffff', ar0.map(q => [q[0] - .3, q[1] - 1.1]), 1.1), { cast: false }); }
    } else if (t === 2) {      // dere: arkadan gelir, köprünün altından sola akar; kıyıda saz, bir söğüt
      const DC = [[1.5, -6.8], [.9, -4.6], [.2, -3.3], [-.6, -2.45], [-1.6, -1.75], [-2.6, -1.2], [-3.6, -.4]], c = DC.map(p => ek(p[0], p[1]));
      b.ground(F(tone(Kd.zemin, -.3), serit(c, 30, 40)) + F('#2f7f98', serit(c, 20, 28)) + F('#4fa6b8', serit(c, 11, 16, -1.5, -1.6))
        + L('#c6eaec', c.slice(1, -1).map((p, i) => `M${P(p[0] - 5 + i, p[1] - 1)}l${f1(6 + i % 2 * 3)} ${f1(-1.5)}`).join(''), .9) + D('#8f9a88', c.slice(2, 5).map((p, i) => [p[0] + 7 - i * 4, p[1] + 2 + i]), 3.4));
      DC.forEach(p => bosluk.push([p[0], p[1], .62]));
      for (const [u, v] of [[-2.2, -1.95], [-1.05, -1.55], [.9, -3.75], [-2.95, -.75], [.45, -4.9]]) if (gor(u, v, 8, 16)) koy(u, v, .55, 0, (x, y) => saz(x, y));
      { const u = -2.15, v = -3.35; koy(u, v, 1.3, .9, (x, y) => sogut(x, y, 1.1, rng(Math.round(r() * 1e4))), { e: .25 }); bosluk.push([u, v, .7]); }
      { const [x, y] = at(-.6, -2.45), Ln = .72, Wd = .27, ax = ayna > 0, dk = b.box(x - (ax ? Ln : Wd), y - (ax ? Wd : Ln), .08, x + (ax ? Ln : Wd), y + (ax ? Wd : Ln), .2, '#9a7048', { edge: false });
        dk.T.planks({ dir: ax ? 'v' : 'h', step: .17 }); dk.L.planks({ dir: 'v', step: .17 }); dk.R.planks({ dir: 'v', step: .17 });
        const pa = ax ? [[x - Ln + .05, y - Wd], [x + Ln - .05, y - Wd]] : [[x - Wd, y - Ln + .05], [x - Wd, y + Ln - .05]];
        for (const [px, py] of pa) b.line3([[px, py, .2], [px, py, .62]], '#6a4a30', 1.8); b.line3([[pa[0][0], pa[0][1], .56], [pa[1][0], pa[1][1], .56]], '#8a6040', 1.4, { pad: .05 }); }
    } else if (t === 3) {      // orman kıyısı: arkada koyu ağaç duvarı (taçlar kadrajın tepesinde), yanlarda gövdeler, yosun ve eğrelti
      leke(8, '#86a858', .5, -2.6, 2.6, -3.4, 3.2, .3, .55);
      for (let u = -2.7 + r() * .35; u <= 2.8; u += 1.05 + r() * .35) { const v = -3.15 - Math.abs(u) * .12 + (r() - .5) * .4; if (!gor(u, v, 24, 60)) continue; const sd = Math.round(u * 97 + v * 13 + 500); koy(u, v, 2, 1.1, (px, py) => agac(px, py, 1.2 + (sd % 7) * .03, rng(sd), '#2c5842', '#4a3a2e', 13), { e: .22 }); }
      for (const u of [-2.8, 2.8]) { const v = -1.1 + (r() - .5) * .4; koy(u, v, 2, 1.1, (px, py) => agac(px, py, 1.35, rng(Math.round(u * 77 + 5)), '#285240', '#45362a', 14), { e: .22 }); }
      for (const [u, v] of [[-2, -2.4], [1.9, -2.2], [-.4, -2.7], [2.3, -.1]]) if (gor(u, v, 12, 12)) koy(u + (r() - .5) * .3, v, .4, 0, (x, y) => egrelti(x, y, 1, rng(Math.round(u * 50 + v * 9 + 99)), '#3f7a40'));
    } else if (t === 4) {      // açıklık: arka köşelerde ağaçlar ve eğrelti, kazılmış toprak lekeleri
      leke(7, '#8a6a46', .55, -2.4, 2.4, -4.6, 3, .3, .6);
      for (const [u, v] of [[-2.35, -3.1], [2.45, -2.9], [-1.15, -4.6], [1.3, -4.5]]) if (gor(u, v, 22, 60)) { const sd = Math.round(u * 91 + v * 13 + 300); koy(u, v, 2, 1, (px, py) => agac(px, py, 1.15, rng(sd), '#5d8a3e', '#5e4632', 13), { e: .22 }); bosluk.push([u, v, .6]); }
      for (const [u, v] of [[-.3, -4.2], [-1.9, -1.6], [2, -1.2]]) koy(u + (r() - .5) * .3, v, .4, 0, (x, y) => egrelti(x, y, 1.1, rng(Math.round(u * 50 + v * 9 + 7)), '#4e8a3e'));
    } else {      // volkan kıyısı: arkada soğumuş lav sekisi (ön yüzü gölgede, üstü közlü yarıklı), bir köşede bazalt sütunlar, kül ve sıcak toprak
      leke(8, '#5e4a44', .5, -2.6, 2.6, -4, 3, .3, .6);
      { const on = [], ust = []; for (let i = 0; i <= 9; i++) { const u = -3.6 + i * .8, v = -4.7 - r() * .45 - (Math.abs(u) > 2.1 ? .25 : 0), p = ek(u, v); on.push(p); ust.push([p[0] + (r() - .5) * 3, p[1] - 7 - r() * 5]); }
        const uz0 = ust[0], uz1 = ust[ust.length - 1]; let yz = '', yr = '';
        for (let i = 1; i < 9; i++) yz += `M${P(ust[i][0], ust[i][1] + 1)}L${P(on[i][0] + (r() - .5) * 2, on[i][1])}`;
        for (const [u0, v0] of [[-1.7, -5.25], [.3, -5.55], [1.8, -5.3]]) { const p = ek(u0 + (r() - .5) * .4, v0); let d = `M${P(p[0] - 16, p[1] + 1)}`; for (let i = 0; i < 6; i++) d += `l${f1(4 + r() * 3)} ${f1((r() - .5) * 4)}`; yr += d + `M${P(p[0] - 3, p[1])}l${f1(1 + r() * 2)} 3l-2 3`; }
        const g = ek(.2, -5.3);
        b.ground(F('#4a3e42', S(ust.concat([[uz1[0], uz1[1] - 90], [uz0[0], uz0[1] - 90]]))) + F('#33292d', S(ust.concat(on.slice().reverse()))) + L('#241c20', yz, .9) + L('#6e6064', 'M' + ust.map(p => P(p[0], p[1])).join('L'), 1.3)
          + D('#3a3034', [0, 1, 2, 3, 4, 5].map(() => { const p = ek(-2 + r() * 4, -5.2 - r() * .6); return [p[0], p[1]]; }), 4) + L('#7a2a16>#ff6a24', yr, 1.5) + L('#e0782e>#ffd070', yr, .5)
          + `<ellipse class="Nl" cx="${f1(g[0])}" cy="${f1(g[1])}" rx="60" ry="14" fill="url(#${K.glowId()})" opacity=".5"/>`); }
      { const su = r() < .5 ? -1 : 1, [cx, cy] = at(1.95 * su, -3.75), cols = [[0, 0], [.42, 0], [0, .42], [-.42, 0], [0, -.42], [.42, -.42], [-.42, .42]].map(([dx, dy]) => [cx + dx, cy + dy]).sort((a, c) => (a[0] + a[1]) - (c[0] + c[1]));
        for (const [x, y] of cols) { const hx = []; for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283 + .26; hx.push([x + Math.cos(a) * .23, y + Math.sin(a) * .23]); } b.prism(hx, 0, .55 + (7 - (x + y - cx - cy) * 3) * .09 + r() * .3, '#4c4448'); }
        bosluk.push([1.95 * su, -3.75, 1.1]); }
      for (const [u, v, s] of [[-2.4, -2.6, 1.1], [2.45, -2.1, 1], [-2.25, 1.1, .9], [2.1, 1.5, .85], [-.9, -3.4, .8]]) { const uu = u + (r() - .5) * .3, vv = v + (r() - .5) * .3; if (!gor(uu, vv, 14 * s, 14 * s) || !bosluk.every(([bu, bv, br]) => Math.hypot(uu - bu, (vv - bv) * .62) >= br)) continue; const [x, y] = at(uu, vv); b.rock(x, y, 0, { s, col: Kd.tas }); bosluk.push([uu, vv, .45 * s]); }
    }

    // bitki yerleşimi: sürüklenti alanı (tohuma göre üç dalga; I ve III'te arkaya eğilim). Kadrajı kaplayan aday ızgarasından en yüksek puanlılar seçilir, aralarında en az ar aralık kalır:
    // öbekler sürüklenti hâlinde toplanır, aralarda açık çayır kalır; sürüklentinin ortasındaki öbekler daha iri, kıyısında küçük yavrular (IV: önce kazılmış tümsekler)
    const vmin = Kd.vmin || -9, hw = BOY[Kd.ad][2], hh = BOY[Kd.ad][1] * 29.4 + 6;
    const serbest = (u, v, s) => { if (v < vmin) return false; const y = yolU(v); if (y && Math.abs(u - y[0]) < y[1] / 2 + .3 * s) return false;
      for (const [bu, bv, br] of bosluk) if (Math.hypot(u - bu, (v - bv) * .62) < br + .2 * s) return false; return true; };
    if (t === 4) { let n = 0; for (const [u, v] of [[1.15, -1.75], [-.85, -2.85], [1.75, .85], [-1.85, -1.35], [.35, -3.7], [-1.95, .9]].sort(() => r() - .5)) { if (n >= 3) break; const uu = u + (r() - .5) * .3, vv = v + (r() - .5) * .3, y = yolU(vv);      // kazılmış tümsekler (2–3)
      if (gor(uu, vv, 18, 20) && !(y && Math.abs(uu - y[0]) < y[1] / 2 + .45) && bosluk.every(([bu, bv, br]) => Math.hypot(uu - bu, (vv - bv) * .62) > br + .25)) { hoyuk(uu, vv, .9 + r() * .15); bosluk.push([uu, vv, .62]); n++; } } }
    const dal = []; for (let i = 0; i < 3; i++) { const a = r() * 6.283, k = 6.283 / (2.4 + r() * 1.8); dal.push([Math.cos(a) * k, Math.sin(a) * k, r() * 6.283]); }
    const alan = (u, v) => dal.reduce((a0, [a, c, f]) => a0 + Math.sin(u * a + v * c + f), 0) / 3 + Kd.arka * Math.max(0, Math.min(1, (-1.5 - v) / 1.8));
    const aday = []; for (let v = -5.7, j = 0; v <= 3.4; v += .55, j++) for (let u = -3.05 + (j % 2) * .36 + r() * .14; u <= 3.05; u += .72) { const uu = u + (r() - .5) * .28, vv = v + (r() - .5) * .22; if (serbest(uu, vv, 1) && gor(uu, vv, hw, hh)) aday.push([uu, vv, alan(uu, vv) + r() * .3]); }
    aday.sort((a, c) => c[2] - a[2]);
    const uz = (a, c) => Math.hypot(a[0] - c[0], (a[1] - c[1]) * .8), sec = [], yv = [];
    for (const c of aday) if (sec.length < Kd.en && sec.every(o => uz(o, c) >= Kd.ar)) sec.push(c);
    for (const c of aday) { if (yv.length >= Kd.yavru) break; if (sec.includes(c)) continue; const m = Math.min(9, ...sec.map(o => uz(o, c))); if (m > Kd.ar * .52 && m < Kd.ar * 1.2 && yv.every(o => uz(o, c) >= Kd.ar * .7)) yv.push(c); }
    const p0 = sec.length ? sec[sec.length - 1][2] : 0, p1 = sec.length ? sec[0][2] : 1;
    sec.forEach(([u, v, pu], i) => { const k = (pu - p0) / Math.max(.01, p1 - p0), s = (Kd.s[0] + (Kd.s[1] - Kd.s[0]) * (.3 + k * .7)) * (.94 + r() * .12);
      if (t === 5) { if (i < 3 && v > -3.9) ot(u, v, .9 + k * .15); else koy(u, v, .4, .2, (px, py) => ankaGenc(px, py, .9 + k * .2, rng(Math.round(u * 71 + v * 37 + 500)))); }
      else ot(u, v, s); });
    for (const [u, v] of yv) ot(u, v, Kd.s[0] * (.62 + r() * .18));

    // odak: hasat edilen büyük öbek (IV: malalı ana tümsek, V: dikili taş halkalı ana çiçek)
    if (t === 5) { const [x, y] = at(odak[0], odak[1]), ec = [], ep = [], sp = []; ot(odak[0], odak[1], 1.1, { ana: true }); b.spill(x, y, 1.3);
      for (let i = 0; i < 9; i++) { const a = i / 9 * 6.283 + .2, w = 2.8 + r() * 1.2, h = 6 + r() * 4.5; koy(odak[0] + Math.cos(a) * .95, odak[1] + Math.sin(a) * .95, h / 29.4, .08, (px, py) => dikili(px, py, w, h), { e: .07 }); }
      for (let i = 0; i < 14; i++) { const p = ek(odak[0] + (r() - .5) * 3.6, odak[1] + (r() - .5) * 2.4); (r() < .5 ? ec : ep).push([p[0], p[1], 1.6 + r(), (r() - .5) * 1.4]); }
      b.ground(C('#c8361e>#ff5a28', ec, 1.5) + C('#ee8a2e>#ffa040', ep, 1.3));
      const h = ek(odak[0], odak[1]); for (const [dx, dy, kk] of [[-17, -44, 1.5], [15, -52, 1.2], [21, -34, 1], [-11, -60, .9]]) sp.push(yildiz(h[0] + dx, h[1] + dy, kk));
      b.item([x + .3, y + .3, 0, x + .4, y + .4, 2], F('#ffe08a>#fff0b0', sp.join('')), { cast: false }); }
    else if (t === 4) hoyuk(odak[0], odak[1], 1.25, true);
    else ot(odak[0], odak[1], Kd.s[1] * 1.08);

    // altın kök tümseği: kazılmış toprak, açığa çıkmış burgulu kökler (ana tümsekte saplanmış mala)
    function hoyuk(u, v, s, ana) { const [gx, gy] = at(u, v), rr = rng(Math.round((gx * 13 + gy * 29) * 100)), yon = rr() < .5 ? 1 : -1;
      koy(u, v, .4 * s, .5 * s, (x, y) => { const w = 17 * s, h = 7 * s, cx = x + w * .22 * yon, cy = y - h * .62;
        let o = F('#5a3c26', `M${P(x - w, y)}C${P(x - w * .7, y - h * 1.4)} ${P(x + w * .55, y - h * 1.5)} ${P(x + w, y)}Q${P(x, y + h * .6)} ${P(x - w, y)}Z`)
          + F('#7a5537', `M${P(x - w * .92, y - h * .1)}C${P(x - w * .62, y - h * 1.36)} ${P(x + w * .2, y - h * 1.46)} ${P(x + w * .48, y - h * .95)}Q${P(x - w * .1, y - h * .5)} ${P(x - w * .92, y - h * .1)}Z`)
          + kokIp(x - w * .35 * yon, y - h * .25, w * .45 * yon, s, rr) + F('#2e1e14', ell(cx, cy, w * .3, h * .38));
        o += altinKok(cx - w * .05 * yon, cy, yon > 0 ? -2.25 : -.9, (13 + rr() * 4) * s, s, rr);
        o += F('#6e4c32', `M${P(cx - w * .32, cy - h * .05)}Q${P(cx, cy + h * .62)} ${P(cx + w * .32, cy - h * .05)}Q${P(cx, cy + h * .3)} ${P(cx - w * .32, cy - h * .05)}Z`) + D('#94704c', [[x - w * .6 * yon, y - h * .7], [x + w * .65 * yon, y - h * .4], [x - w * .1 * yon, y - h * .2]], 2.2 * s);
        if (ana) o += mala(x - w * .55 * yon, y - h * .6, 1.15 * s);
        return o; }, { e: .3 * s }); }

    // toplayıcının köşesi: sepet ve yanına bırakılmış kesik dallar, orak taşı (IV: kütüğün üstünde), askı, taş yığını (IV: kök çuvalı)
    koy(SEP[0], SEP[1], .55, .32, (x, y) => sepet(x, y, 1.18, Kd.demet), { e: .24 });
    if (t < 4) koy(SEP[0] + .5, SEP[1] + .42, .05, 0, (x, y) => dalYer(x, y, 1, Kd.demet, rng(Math.round(r() * 1e4))), { e: .12 });
    if (t === 4) { const [x, y] = at(ORK[0], ORK[1]); b.cyl(x, y, .3, 0, .3, '#7a5a3c', { top: '#c9a274' }); koy(ORK[0], ORK[1], .45, 0, (px, py) => orak(px - 7, py + 1, .9) + L('#a88456', `M${P(px - 6, py + 2)}a6 3 0 1 0 12 0`, .6), { z: .3, e: .25 }); }
    else koy(ORK[0], ORK[1], .3, .25, (x, y) => tas(x, y, 1, Kd.tas) + orak(x - 7, y - 3.6, 1), { e: .28 });
    if (askiVar) koy(ASK[0], ASK[1], .9, .7, (x, y) => aski(x, y, 1, Kd.demet, r), { e: .45 });
    if (t === 4) { const [x, y] = at(YIG[0], YIG[1]); b.sack(x, y, 0, { col: '#cdb88a' }); koy(YIG[0], YIG[1], .5, 0, (px, py) => altinKok(px - 1.5, py - 8.5, -2.1, 7, .62, rng(7)) + altinKok(px + 1.5, py - 8.5, -1.1, 6, .55, rng(9)), { e: .1 }); }
    else if (yigVar) koy(YIG[0], YIG[1], .5, .3, (x, y) => yigin(x, y, 1, t === 5 ? '#5a5052' : Kd.tas, t === 5 ? 0 : Kd.demet), { e: .2 });
    if (t === 3) { const LU = [ASK[0] - .1, ASK[1] + .2], [x, y] = at(LU[0], LU[1]); koy(LU[0], LU[1], 1.5, 0, (px, py) => L('#5a4030', `M${P(px, py)}V${f1(py - 40)}M${P(px - 1, py - 38)}h9`, 2) + L('#2a2420', `M${P(px + 7, py - 38)}v3`, .8) + F('#2a2420', `M${P(px + 4, py - 35)}h6l-1 -2h-4z`) + F('#e9d6a0>#ffd36a', `M${P(px + 4.5, py - 35)}h5v6h-5z`) + F('#2a2420', `M${P(px + 4.2, py - 29)}h5.6v1.2h-5.6z`) + `<circle class="Nl" cx="${f1(px + 7)}" cy="${f1(py - 32)}" r="20" fill="url(#${K.glowId()})"/>`, { e: .12 }); b.spill(x, y, 1.6); }

    // küçük ayrıntı: ot öbekleri, taşlar; nitelikle çiçek
    { const c0 = at(-2.4, -2), c1 = at(2.4, 3.3); b.tufts(Math.min(c0[0], c1[0]), Math.min(c0[1], c1[1]), Math.max(c0[0], c1[0]), Math.max(c0[1], c1[1]), 12, { col: tone(Kd.koyu, -.2) }); }
    for (let i = 0; i < (t === 1 ? 6 : t === 5 ? 5 : 3); i++) { const u = -2.2 + r() * 4.4, v = -3 + r() * 6.2; if (!serbest(u, v, .5) || !gor(u, v, 8, 8)) continue; const [x, y] = at(u, v); b.rock(x, y, 0, { s: .32 + r() * .4, col: Kd.tas }); }
    if (q >= 1) for (const [u, v, n] of [[1.75, 1.15, 5], [-1.45, 3.15, 4], [.95, 3.35, 4]]) { const [x, y] = at(u, v);      // nitelik: kademeye uygun kır çiçekleri (V: közler)
      if (t === 5) { const e = []; for (let i = 0; i < n + q; i++) { const p = pr(x + (r() - .5) * .9, y + (r() - .5) * .9); e.push([p[0], p[1], 1.4, (r() - .5) * 1.2]); } b.ground(C('#e0602a>#ff8a3a', e, 1.6)); }
      else b.flowers(x, y, { n: n + q, r: .45, cols: [['#f2ecf4', '#f2d24a', '#c870b8'], ['#f4f0e8', '#f2d24a', '#9a7ad8'], ['#f6f0e4', '#e8508e', '#f2c63c'], ['#f2c63c', '#f4f0e8', '#e07a3a']][t - 1] }); }
    if (q >= 2) {      // Zengin ve Eşsiz: süzülen ışık ve pırıltılar (en önde)
      const g = q >= 3 ? '#ffe9a8' : '#fff6d2', p = pr(3.5, 3.5, 0); let sh = '', st = '';
      for (const [dx, w] of [[-40, 12], [-8, 16], [22, 11]]) sh += `M${f1(p[0] + dx)} ${f1(p[1] - 96)}l${w} 0l${f1(w * .5 + 24)} 112l${f1(-w * 1.6 - 6)} 0z`;
      for (let i = 0; i < q * 2; i++) st += yildiz(p[0] - 50 + r() * 100, p[1] - 60 + r() * 66, .9 + r() * 1.1);
      b.item([9.6, 9.6, 0, 9.8, 9.8, 4], F(g, sh).replace('<path', `<path opacity="${q >= 3 ? .2 : .13}"`) + F(q >= 3 ? '#fff0b8' : '#ffffff', st).replace('<path', '<path opacity=".9"'), { cast: false });
    }
  });
})(typeof window !== 'undefined' ? window.CK : globalThis.CK);
