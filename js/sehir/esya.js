/* Derinsu — şehir çizim seti: ağaçlar, eşyalar, insanlar (CK.Builder'a eklenir). */
(function (K) {
  'use strict';
  const { M, pr, P, PL, f1, tone, toneOf, kf, ks, circ, ell, U, ZU, rng, Face } = K, B = K.Builder.prototype;
  const path = (cls, d, extra = '') => d ? `<path class="${cls}"${extra} d="${d}"/>` : '';
  const TL = toneOf([0, 1, 0]), TR = toneOf([1, 0, 0]), TT = toneOf([0, 0, 1]);

  /* ---------- ağaçlar ---------- */
  // yaprak kümesi: [cx, cy, r] daireleri
  const cluster = (cx, cy, R, n, r, sq = .82) => { const cs = [[cx, cy, R * .64]]; for (let i = 0; i < n; i++) { const a = i / n * 6.283 + r() * .6, d = R * (.4 + r() * .22); cs.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d * sq, R * (.34 + r() * .18)]); } return cs; };
  const canopy = (cs, R, col) => {
    const dk = cs.map(c => circ(c[0], c[1], c[2])).join(''), md = cs.map(c => circ(c[0] - R * .09, c[1] - R * .12, c[2] * .8)).join('');
    const up = cs.filter(c => c[1] <= cs[0][1] + R * .12 && c[0] <= cs[0][0] + R * .3);
    const lt = up.map(c => circ(c[0] - R * .17, c[1] - R * .22, c[2] * .5)).join(''), hi = up.slice(0, 3).map(c => circ(c[0] - R * .24, c[1] - R * .3, c[2] * .22)).join('');
    return path(kf(tone(col, -.34)), dk) + path(kf(col), md) + path(kf(tone(col, .26)), lt) + path(kf(tone(col, .48)), hi);
  };
  const trunk = (x, y, H, w, lean = 0) => path(kf(tone(M.govde, .05)), `M${f1(x - w)} ${f1(y)}Q${f1(x - w * .5 + lean * .5)} ${f1(y - H * .5)} ${f1(x - w * .5 + lean)} ${f1(y - H)}L${f1(x + w * .5 + lean)} ${f1(y - H)}Q${f1(x + w * .6 + lean * .5)} ${f1(y - H * .5)} ${f1(x + w)} ${f1(y)}Z`)
    + path(kf(tone(M.govde, -.32)), `M${f1(x + w * .1)} ${f1(y)}Q${f1(x + w * .2 + lean * .5)} ${f1(y - H * .5)} ${f1(x + w * .1 + lean)} ${f1(y - H)}L${f1(x + w * .5 + lean)} ${f1(y - H)}Q${f1(x + w * .6 + lean * .5)} ${f1(y - H * .5)} ${f1(x + w)} ${f1(y)}Z`);
  const flame = (x, y, H, w) => `M${f1(x)} ${f1(y - H)}C${f1(x + w)} ${f1(y - H * .62)} ${f1(x + w * 1.05)} ${f1(y - H * .16)} ${f1(x)} ${f1(y - H * .04)}C${f1(x - w * 1.05)} ${f1(y - H * .16)} ${f1(x - w)} ${f1(y - H * .62)} ${f1(x)} ${f1(y - H)}Z`;
  const TREE = {
    // çınar: geniş taçlı ulu ağaç
    cinar(x, y, s, r, o) { const R = 23 * s, H = 30 * s; return trunk(x, y, H, 3.2 * s, (r() - .5) * 3) + path('Ln ' + ks(tone(M.govde, -.2)), `M${f1(x)} ${f1(y - H * .7)}l${f1(-7 * s)} ${f1(-9 * s)}M${f1(x)} ${f1(y - H * .78)}l${f1(7 * s)} ${f1(-8 * s)}`, ` stroke-width="${f1(1.6 * s)}"`) + canopy(cluster(x, y - H - R * .34, R, 8, r), R, o.col || M.cinar); },
    // selvi: ince uzun, koyu
    selvi(x, y, s, r, o) { const H = 76 * s * (.9 + r() * .2), w = 8.4 * s, c = o.col || M.selvi; return trunk(x, y, 7 * s, 1.5 * s) + path(kf(tone(c, -.3)), flame(x, y - 3 * s, H, w)) + path(kf(c), flame(x - w * .16, y - 5 * s, H * .95, w * .74)) + path(kf(tone(c, .26)), flame(x - w * .36, y - 9 * s, H * .8, w * .36)); },
    // kavak: selvi biçimli, açık yeşil
    kavak(x, y, s, r, o) { return TREE.selvi(x, y, s * .92, r, { col: o.col || M.kavak }).replace(/^/, ''); },
    // fıstık çamı: uzun gövde, yassı şemsiye taç
    fistik(x, y, s, r, o) { const R = 20 * s, H = 44 * s, lean = (r() - .5) * 8 * s; return trunk(x, y, H, 2.4 * s, lean) + canopy(cluster(x + lean, y - H - R * .12, R, 7, r, .46), R, o.col || M.fistik); },
    // zeytin: bodur, gümüşi yeşil
    zeytin(x, y, s, r, o) { const R = 13 * s, H = 13 * s, lean = (r() - .5) * 5 * s; return trunk(x, y, H, 2.6 * s, lean) + canopy(cluster(x + lean, y - H - R * .3, R, 6, r, .7), R, o.col || M.zeytin); },
    // narenciye: yuvarlak taç, meyveli
    narenciye(x, y, s, r, o) { const R = 11 * s, H = 11 * s, cs = cluster(x, y - H - R * .4, R, 6, r); let f = ''; for (let i = 0; i < 7; i++) { const a = r() * 6.283, d = R * r() * .8; f += circ(x + Math.cos(a) * d, y - H - R * .4 + Math.sin(a) * d * .8, 1.5 * s); }
      return trunk(x, y, H, 1.9 * s) + canopy(cs, R, o.col || M.narenciye) + path(kf(o.fruit || '#f0962e'), f); },
    // palmiye
    palmiye(x, y, s, r, o) { const H = 50 * s, lean = (r() - .3) * 9 * s, tx = x + lean, ty = y - H, c = o.col || '#5f9a4f'; let fr = '', fl = '';
      for (let i = 0; i < 9; i++) { const a = -Math.PI * (.08 + i / 8 * .84), L = (19 + r() * 6) * s, ex = tx + Math.cos(a) * L, ey = ty + Math.sin(a) * L * .55 + Math.abs(Math.cos(a)) * 9 * s, mx = tx + Math.cos(a) * L * .55, my = ty + Math.sin(a) * L * .8 - 5 * s;
        const d = `M${f1(tx)} ${f1(ty)}Q${f1(mx)} ${f1(my - 3 * s)} ${f1(ex)} ${f1(ey)}Q${f1(mx)} ${f1(my + 2.5 * s)} ${f1(tx)} ${f1(ty)}Z`; if (i % 2) fl += d; else fr += d; }
      return trunk(x, y, H, 2.2 * s, lean) + path(kf(tone(c, -.26)), fr) + path(kf(tone(c, .12)), fl) + path(kf('#8a5a34'), circ(tx - 1.5 * s, ty + 1.5 * s, 1.6 * s) + circ(tx + 1.8 * s, ty + 2 * s, 1.5 * s)); },
    // çalı
    cali(x, y, s, r, o) { const R = 8 * s; return canopy(cluster(x, y - R * .55, R, 5, r, .62), R, o.col || M.cimK); },
    // çiçekli çalı
    cicek(x, y, s, r, o) { const R = 7.5 * s, c = o.fl || [M.begonvil, M.kirmizi, M.sari, M.mor, M.bez][Math.floor(r() * 5)]; let f = ''; for (let i = 0; i < 9; i++) { const a = r() * 6.283, d = R * r() * .85; f += circ(x + Math.cos(a) * d, y - R * .6 + Math.sin(a) * d * .6, (1.1 + r() * .6) * s); }
      return canopy(cluster(x, y - R * .55, R, 5, r, .62), R, o.col || M.sarmasik) + path(kf(c), f); },
  };
  // ağaç: kind cinar|selvi|kavak|fistik|zeytin|narenciye|palmiye|cali|cicek; o: s (ölçek), z, col, seed
  B.tree = function (kind, x, y, o = {}) {
    const s = o.s || 1, z = o.z || 0, p = pr(x, y, z), r = rng(Math.round((x * 31.7 + y * 17.3 + s * 7) * 100) + (o.seed || 0)), fn = TREE[kind] || TREE.cinar;
    const dim = { cinar: [1.0, 2.6], selvi: [.36, 3.3], kavak: [.38, 3.0], fistik: [.9, 2.6], zeytin: [.6, 1.3], narenciye: [.5, 1.1], palmiye: [.8, 2.4], cali: [.36, .45], cicek: [.34, .42] }[kind] || [1, 2];
    const R = dim[0] * s, H = dim[1] * s, hc = kind === 'selvi' || kind === 'kavak' ? H * .5 : H * .78, rc = R, pts = [[x, y, z]];
    for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; pts.push([x + Math.cos(a) * rc, y + Math.sin(a) * rc, z + hc]); } if (kind === 'selvi' || kind === 'kavak') pts.push([x, y, z + H]);
    const q = .22; this.item([x - q, y - q, z, x + q, y + q, z + H], fn(p[0], p[1], s, r, o), { pts, cast: o.cast !== false });
    return this;
  };
  // yeşil çit / budanmış şimşir
  B.hedge = function (x0, y0, x1, y1, h = .4, o = {}) { const c = o.col || M.cimK; this.box(x0, y0, o.z || 0, x1, y1, (o.z || 0) + h, c, { edge: false, T: tone(c, .1) }); return this; };

  /* ---------- eşyalar ---------- */
  // sandık
  B.crate = function (x, y, z = 0, s = .4, o = {}) { const c = o.col || M.ahsapA, b = this.box(x - s / 2, y - s / 2, z, x + s / 2, y + s / 2, z + s * (o.h || .8), c, { edge: false, cast: o.cast });
    for (const f of [b.L, b.R]) { f.planks({ dir: 'h', step: s * .27 }); f.line([[.03, .03], [f.w - .03, f.h - .03]], c, .8, 6, -.24); }
    if (o.fill) { const p = pr(x, y, z + s * (o.h || .8)); this.item([x - s / 2, y - s / 2, z + s * .8, x + s / 2, y + s / 2, z + s], path(kf(o.fill), ell(p[0], p[1] - 1, s * U * .5, s * U * .25)) + path(kf(tone(o.fill, .3)), circ(p[0] - 2, p[1] - 2, 1.4) + circ(p[0] + 2.5, p[1] - .6, 1.2)), { cast: false }); }
    return this; };
  // fıçı
  B.barrel = function (x, y, z = 0, o = {}) { const r = o.r || .2, h = o.h || .46, c = this.cyl(x, y, r, z, z + h, o.col || M.ahsap, { top: o.top || M.ahsapA, cast: o.cast }); c.band(z + h * .2, .035, M.demir, .008, false).band(z + h * .72, .035, M.demir, .008, false); return this; };
  // çuval
  B.sack = function (x, y, z = 0, o = {}) { const p = pr(x, y, z), s = (o.s || 1) * U * .3, c = o.col || '#d9c79a';
    this.item([x - .15, y - .15, z, x + .15, y + .15, z + .35], path(kf(tone(c, -.26)), `M${f1(p[0] - s)} ${f1(p[1])}Q${f1(p[0] - s * 1.2)} ${f1(p[1] - s * 1.5)} ${f1(p[0] - s * .3)} ${f1(p[1] - s * 1.9)}L${f1(p[0] + s * .4)} ${f1(p[1] - s * 1.9)}Q${f1(p[0] + s * 1.3)} ${f1(p[1] - s * 1.4)} ${f1(p[0] + s)} ${f1(p[1])}Z`)
      + path(kf(c), `M${f1(p[0] - s)} ${f1(p[1])}Q${f1(p[0] - s * 1.2)} ${f1(p[1] - s * 1.5)} ${f1(p[0] - s * .3)} ${f1(p[1] - s * 1.9)}L${f1(p[0] + s * .1)} ${f1(p[1] - s * 1.9)}Q${f1(p[0] + s * .3)} ${f1(p[1] - s)} ${f1(p[0] + s * .1)} ${f1(p[1])}Z`)
      + path(kf(tone(c, -.4)), `M${f1(p[0] - s * .4)} ${f1(p[1] - s * 1.9)}l${f1(s * .9)} 0l${f1(-s * .2)} ${f1(-s * .5)}l${f1(-s * .5)} 0Z`), { cast: false }); return this; };
  // küp / testi; o.plant: içinden bitki
  B.pot = function (x, y, z = 0, o = {}) { const p = pr(x, y, z), s = (o.s || 1) * U * .2, c = o.col || M.kiremitA; let g = '';
    if (o.plant) { const r = rng(Math.round(x * 91 + y * 37)), cs = cluster(p[0], p[1] - s * 3.1, s * 1.9, 4, r, .8); g = canopy(cs, s * 1.9, o.plant === true ? M.sarmasik : o.plant) + (o.fl ? path(kf(o.fl), cs.slice(0, 4).map(c0 => circ(c0[0] - 1, c0[1] - 1, 1.2)).join('')) : ''); }
    this.item([x - .12, y - .12, z, x + .12, y + .12, z + (o.plant ? .7 : .35)], path(kf(tone(c, -.3)), `M${f1(p[0] - s * .6)} ${f1(p[1])}Q${f1(p[0] - s * 1.35)} ${f1(p[1] - s * 1.2)} ${f1(p[0] - s * .7)} ${f1(p[1] - s * 2.1)}L${f1(p[0] + s * .7)} ${f1(p[1] - s * 2.1)}Q${f1(p[0] + s * 1.35)} ${f1(p[1] - s * 1.2)} ${f1(p[0] + s * .6)} ${f1(p[1])}Z`)
      + path(kf(tone(c, .1)), `M${f1(p[0] - s * .6)} ${f1(p[1])}Q${f1(p[0] - s * 1.35)} ${f1(p[1] - s * 1.2)} ${f1(p[0] - s * .7)} ${f1(p[1] - s * 2.1)}L${f1(p[0])} ${f1(p[1] - s * 2.1)}Q${f1(p[0] - s * .3)} ${f1(p[1] - s * 1.1)} ${f1(p[0] - s * .1)} ${f1(p[1])}Z`)
      + path(kf(tone(c, -.12)), ell(p[0], p[1] - s * 2.1, s * .8, s * .32)) + g, { cast: false }); return this; };
  // sokak feneri: direk + fener; gece hâle ve yere vuran ışık
  B.lamp = function (x, y, z = 0, o = {}) { const h = o.h || 1.45, p = pr(x, y, z), t = pr(x, y, z + h);
    this.spill(x, y, 1.5, { z });
    this.item([x - .06, y - .06, z, x + .06, y + .06, z + h + .3], path('Ln ' + ks(M.demir), `M${f1(p[0])} ${f1(p[1])}V${f1(t[1])}M${f1(p[0] - 2.2)} ${f1(p[1])}h4.4`, ' stroke-width="1.5"')
      + path(kf(M.demir), `M${f1(t[0] - 3)} ${f1(t[1] - 8.6)}l3 -2.6l3 2.6zM${f1(t[0] - 2.6)} ${f1(t[1])}h5.2v1.3h-5.2z`) + path(kf('#fff0c4>#fff4cf'), `M${f1(t[0] - 2.2)} ${f1(t[1] - 8.4)}h4.4l-.5 8.2h-3.4z`)
      + `<circle class="Nl" cx="${f1(t[0])}" cy="${f1(t[1] - 4)}" r="${o.r || 19}" fill="url(#${K.glowId()})"/>`, { cast: false }); return this; };
  // bank: dir 'x' (x boyunca uzanır) | 'y'
  B.bench = function (x, y, z = 0, dir = 'x', o = {}) { const l = o.l || .8, w = .22, c = o.col || M.ahsap, x0 = dir === 'x' ? x - l / 2 : x - w / 2, x1 = dir === 'x' ? x + l / 2 : x + w / 2, y0 = dir === 'x' ? y - w / 2 : y - l / 2, y1 = dir === 'x' ? y + w / 2 : y + l / 2;
    this.box(x0 + .03, y0 + .03, z, x1 - .03, y1 - .03, z + .16, tone(c, -.3), { edge: false, cast: false, T: null }); this.box(x0, y0, z + .16, x1, y1, z + .22, c, { edge: false, cast: false }); return this; };
  // masa
  B.table = function (x, y, z = 0, o = {}) { const s = o.s || .46, c = o.col || M.ahsapA; this.box(x - .04, y - .04, z, x + .04, y + .04, z + .3, tone(c, -.3), { edge: false, cast: false, T: null });
    if (o.round) this.cyl(x, y, s / 2, z + .3, z + .35, c, { cast: false }); else this.box(x - s / 2, y - s / 2, z + .3, x + s / 2, y + s / 2, z + .35, c, { edge: false, cast: false }); return this; };
  // babalar / taş dikme
  B.bollard = function (x, y, z = 0, o = {}) { this.cyl(x, y, o.r || .09, z, z + (o.h || .3), o.col || M.demir, { cast: false }); return this; };
  // çit: noktalar [[x,y],...]
  B.fence = function (pts, h = .4, o = {}) { const z = o.z || 0, c = o.col || M.ahsap; let d = '';
    for (let i = 0; i < pts.length - 1; i++) { const a = pts[i], b = pts[i + 1], n = Math.max(1, Math.round(Math.hypot(b[0] - a[0], b[1] - a[1]) / .45));
      let s = `M${P(a[0], a[1], z + h * .85)} ${P(b[0], b[1], z + h * .85)}M${P(a[0], a[1], z + h * .45)} ${P(b[0], b[1], z + h * .45)}`;
      for (let k = 0; k <= n; k++) { const x = a[0] + (b[0] - a[0]) * k / n, y = a[1] + (b[1] - a[1]) * k / n; s += `M${P(x, y, z)} ${P(x, y, z + h)}`; }
      this.item([Math.min(a[0], b[0]) - .03, Math.min(a[1], b[1]) - .03, z, Math.max(a[0], b[0]) + .03, Math.max(a[1], b[1]) + .03, z + h], path('Ln ' + ks(tone(c, -.1)), s, ' stroke-width="1.2"'), { cast: false }); }
    return this; };
  // çamaşır ipi: iki nokta arası ip + asılı bezler
  B.clothes = function (x0, y0, x1, y1, z, o = {}) { const r = rng(Math.round((x0 + y0 * 3 + x1 * 7) * 100)), n = o.n || Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / .42)), cols = o.cols || [M.bez, M.bezM, M.bezK, M.bezS, M.bez, M.nane]; let s = path('Ln ' + ks('#6a5a4a'), `M${P(x0, y0, z)}Q${P((x0 + x1) / 2, (y0 + y1) / 2, z - .16)} ${P(x1, y1, z)}`, ' stroke-width=".7"');
    for (let i = 0; i < n; i++) { const t0 = (i + .15) / n, t1 = (i + .85) / n, sag = t => z - .16 * 4 * t * (1 - t) * .5, h = .28 + r() * .22, c = cols[Math.floor(r() * cols.length)];
      const a = [x0 + (x1 - x0) * t0, y0 + (y1 - y0) * t0], b = [x0 + (x1 - x0) * t1, y0 + (y1 - y0) * t1];
      s += path(kf(tone(c, Math.abs(x1 - x0) > Math.abs(y1 - y0) ? TL - .04 : TR + .12)), `M${P(a[0], a[1], sag(t0))} ${P(b[0], b[1], sag(t1))} ${P(b[0], b[1], sag(t1) - h)} ${P(a[0], a[1], sag(t0) - h * (.85 + r() * .3))}Z`); }
    this.item([Math.min(x0, x1), Math.min(y0, y1), z - .6, Math.max(x0, x1) + .02, Math.max(y0, y1) + .02, z], s, { cast: false }); return this; };
  // tezgâh: direkler + çizgili tente + mallar. o: w, d, cols, goods [renkler], lean (tek eğim)
  B.stall = function (x, y, z = 0, o = {}) { const w = o.w || 1.3, d = o.d || .8, h = o.h || .95, cols = o.cols || [M.bezK, M.bez], goods = o.goods || ['#e8843a', '#c0473a', '#7fa35e', '#e0c068'], r = rng(Math.round((x * 13 + y * 29) * 100));
    const t = this.box(x, y, z, x + w, y + d, z + .36, o.col || M.ahsapA, { edge: false }); t.L.planks({ step: .22 }); t.R.planks({ step: .22 });
    let g = ''; const ng = Math.round(w / .3); for (let i = 0; i < ng; i++) { const c = goods[i % goods.length], gx = x + (i + .5) * w / ng, p = pr(gx, y + d * .5, z + .36);
      g += path(kf(tone(c, -.2)), ell(p[0], p[1] - 1.4, 4.4, 2.6)) + path(kf(tone(c, .12)), circ(p[0] - 1.5, p[1] - 2.6, 1.5) + circ(p[0] + 1.3, p[1] - 2.2, 1.4) + circ(p[0], p[1] - 3.6, 1.3)); }
    this.item([x, y, z + .36, x + w, y + d, z + .5], g, { cast: false });
    for (const [px, py] of [[x + .04, y + .04], [x + w - .04, y + .04], [x + .04, y + d - .04], [x + w - .04, y + d - .04]]) this.line3([[px, py, z], [px, py, z + h + (py < y + d / 2 ? .22 : 0)]], tone(M.ahsapK, 0), 1.3);
    const n = Math.max(3, Math.round(w / .26)), zb = z + h + .22, zf = z + h, ov = .14; let ds = cols.map(() => ''), dv = cols.map(() => '');
    for (let i = 0; i < n; i++) { const a0 = x - ov + (w + 2 * ov) * i / n, a1 = x - ov + (w + 2 * ov) * (i + 1) / n, k = i % cols.length;
      ds[k] += `M${PL([[a0, y - ov, zb], [a1, y - ov, zb], [a1, y + d + ov, zf], [a0, y + d + ov, zf]])}Z`; dv[k] += `M${PL([[a0, y + d + ov, zf], [a1, y + d + ov, zf], [a1, y + d + ov, zf - .1], [(a0 + a1) / 2, y + d + ov, zf - .16], [a0, y + d + ov, zf - .1]])}Z`; }
    const tn = toneOf(K.unit([0, .22, d + 2 * ov]));
    this.item([x - ov, y - ov, zf - .16, x + w + ov, y + d + ov, zb + .02], ds.map((s, k) => path(kf(tone(cols[k], tn)), s)).join('') + dv.map((s, k) => path(kf(tone(cols[k], TL - .12)), s)).join('')
      + path(kf(tone(cols[0], TR - .08)), `M${PL([[x + w + ov, y - ov, zb], [x + w + ov, y + d + ov, zf], [x + w + ov, y + d + ov, zf - .1], [x + w + ov, y - ov, zb - .1]])}Z`), { pts: [[x - ov, y - ov, zb], [x + w + ov, y - ov, zb], [x + w + ov, y + d + ov, zf], [x - ov, y + d + ov, zf]] });
    return this; };
  // el arabası: dir 'x' | 'y'
  B.cart = function (x, y, z = 0, dir = 'x', o = {}) { const l = o.l || .9, w = .5, c = o.col || M.ahsap, bx = dir === 'x' ? [x - l / 2, y - w / 2, x + l / 2, y + w / 2] : [x - w / 2, y - l / 2, x + w / 2, y + l / 2];
    const b = this.box(bx[0], bx[1], z + .2, bx[2], bx[3], z + .42, c, { edge: false }); b.L.planks({ dir: 'h', step: .11 }); b.R.planks({ dir: 'h', step: .11 });
    const wr = .2, wf = dir === 'x' ? new Face([x - wr, bx[3] + .03, z], [1, 0, 0], [0, 0, 1], 2 * wr, 2 * wr, [0, 1, 0]) : new Face([bx[2] + .03, y + wr, z], [0, -1, 0], [0, 0, 1], 2 * wr, 2 * wr, [1, 0, 0]);
    wf.shp('round', 0, 0, 2 * wr, 2 * wr, M.ahsapK, 3).shp('round', .05, .05, 2 * wr - .1, 2 * wr - .1, c, 4, .1).line([[wr, .03], [wr, 2 * wr - .03]], M.ahsapK, 1, 5).line([[.03, wr], [2 * wr - .03, wr]], M.ahsapK, 1, 5).dot(wr, wr, 1.4, M.demir, 6);
    this.item(dir === 'x' ? [x - wr, bx[3], z, x + wr, bx[3] + .06, z + 2 * wr] : [bx[2], y - wr, z, bx[2] + .06, y + wr, z + 2 * wr], () => wf.svg(), { cast: false });
    if (o.load) { const p = pr(x, y, z + .42); this.item([bx[0], bx[1], z + .42, bx[2], bx[3], z + .62], path(kf(tone(o.load, -.2)), ell(p[0], p[1] - 2, l * U * .5, l * U * .26)) + path(kf(tone(o.load, .16)), ell(p[0] - 3, p[1] - 4, l * U * .3, l * U * .15)), { cast: false }); }
    if (dir === 'x') this.line3([[bx[2], y - .18, z + .36], [bx[2] + .5, y - .18, z + .3]], M.ahsapK, 1.3).line3([[bx[2], y + .18, z + .36], [bx[2] + .5, y + .18, z + .3]], M.ahsapK, 1.3);
    else this.line3([[x - .18, bx[3], z + .36], [x - .18, bx[3] + .5, z + .3]], M.ahsapK, 1.3).line3([[x + .18, bx[3], z + .36], [x + .18, bx[3] + .5, z + .3]], M.ahsapK, 1.3);
    return this; };
  // kuyu
  B.well = function (x, y, z = 0, o = {}) { const c = this.cyl(x, y, .42, z, z + .42, o.col || M.tas, { top: '#2a4a5a' }); c.courses(.21);
    this.line3([[x - .36, y + .36, z + .42], [x - .36, y + .36, z + 1.25]], M.ahsapK, 1.8).line3([[x + .36, y - .36, z + .42], [x + .36, y - .36, z + 1.25]], M.ahsapK, 1.8).line3([[x - .36, y + .36, z + 1.1], [x + .36, y - .36, z + 1.1]], M.ahsap, 2.2, { pad: .2 });
    this.hip(x - .62, y - .62, x + .62, y + .62, z + 1.25, .34, M.kiremit, { cast: false }); return this; };
  // kaya
  B.rock = function (x, y, z = 0, o = {}) { const s = (o.s || 1) * U * .5, p = pr(x, y, z), c = o.col || M.kaya, r = rng(Math.round((x * 53 + y * 71) * 100)), j = () => .8 + r() * .4;
    const a = [[-s * j(), 0], [-s * .8 * j(), -s * .7 * j()], [-s * .15, -s * 1.15 * j()], [s * .55 * j(), -s * .85 * j()], [s * j(), -s * .1], [s * .5, s * .22], [-s * .5, s * .2]].map(q => [p[0] + q[0], p[1] + q[1]]);
    const S = q => q.map(v => f1(v[0]) + ' ' + f1(v[1])).join(' ');
    this.item([x - .3 * (o.s || 1), y - .3 * (o.s || 1), z, x + .3 * (o.s || 1), y + .3 * (o.s || 1), z + .5 * (o.s || 1)], path(kf(tone(c, -.34)), `M${S(a)}Z`) + path(kf(c), `M${S([a[0], a[1], a[2], [a[2][0] + s * .1, a[2][1] + s * .7], a[6]])}Z`) + path(kf(tone(c, .28)), `M${S([a[1], a[2], a[3], [a[2][0] + s * .12, a[2][1] + s * .42]])}Z`), { cast: o.cast !== false, pts: [[x - .3, y, z], [x + .3, y, z], [x, y - .3, z], [x, y + .3, z], [x, y, z + .4 * (o.s || 1)]] }); return this; };
  // odun yığını
  B.woodpile = function (x, y, z = 0, o = {}) { const w = o.w || .8, b = this.box(x, y, z, x + w, y + .34, z + .4, M.ahsap, { edge: false }); b.L.planks({ dir: 'h', step: .1 });
    for (let i = 0; i < 4; i++) for (let k = 0; k < 3; k++) b.R.dot(.06 + i * .075, .07 + k * .12, 1.7, M.ahsapA, 5, .2); return this; };
  // saman balyası
  B.hay = function (x, y, z = 0, o = {}) { const b = this.box(x, y, z, x + .6, y + .4, z + .36, M.saz, { edge: false }); b.L.planks({ dir: 'h', step: .09, dt: -.1 }); b.R.planks({ dir: 'h', step: .09, dt: -.1 }); b.T.planks({ dir: 'v', step: .2, dt: -.1 }); return this; };
  // yerde çiçek öbeği / ot (zemin katmanına)
  B.flowers = function (x, y, o = {}) { const n = o.n || 7, r = rng(Math.round((x * 17 + y * 43) * 100)), sp = o.r || .5, z = o.z || 0, cols = o.cols || [M.bez, M.sari, M.begonvil, M.kirmizi, M.mor]; let g = '', d = cols.map(() => '');
    for (let i = 0; i < n; i++) { const p = pr(x + (r() - .5) * sp * 2, y + (r() - .5) * sp * 2, z); g += `M${f1(p[0])} ${f1(p[1])}l-1.2 -3M${f1(p[0])} ${f1(p[1])}l1.3 -2.6`; d[Math.floor(r() * cols.length)] += circ(p[0] + (r() - .5) * 2, p[1] - 3.2, 1 + r() * .5); }
    this.grd.push(path('Ln ' + ks(tone(M.cimK, -.16)), g, ' stroke-width=".9"') + d.map((s, k) => path(kf(cols[k]), s)).join('')); return this; };
  B.tufts = function (x0, y0, x1, y1, n = 10, o = {}) { const r = rng(Math.round((x0 * 7 + y0 * 19 + x1) * 100)), z = o.z || 0; let g = '';
    for (let i = 0; i < n; i++) { const p = pr(x0 + r() * (x1 - x0), y0 + r() * (y1 - y0), z); g += `M${f1(p[0] - 1.6)} ${f1(p[1])}l-.8 -2.6M${f1(p[0])} ${f1(p[1])}l.2 -3.4M${f1(p[0] + 1.6)} ${f1(p[1])}l1 -2.4`; }
    this.grd.push(path('Ln ' + ks(tone(o.col || M.cimK, -.2)), g, ' stroke-width=".8"')); return this; };

  /* ---------- insan ---------- */
  // ayak noktası (0,0) olan küçük figür. o: body (giysi), legs, skin, hat fes|sarik|hasir|ortu|none, hatCol, robe (uzun etek), step 0 duruş | 1 adım | 2 adım arası, carry kasa|sepet|balik|kova
  const figure = (o = {}) => {
    const body = o.body || M.bezK, legs = o.legs || '#4a3a34', skin = o.skin || M.ten, st = o.step || 0, up = st === 2 ? -1 : 0, hat = o.hat || 'none', hc = o.hatCol || M.kirmizi; let s = '';
    if (o.shadow !== false) s += `<ellipse cx="1.5" cy="0" rx="5.4" ry="2.1" fill="#1b2440" opacity=".22"/>`;
    if (o.robe) s += path(kf(tone(body, -.1)), `M-3.6 ${-9 + up}L-4.4 ${-1 + up}Q0 ${1 + up} 4.4 ${-1 + up}L3.6 ${-9 + up}Z`) + path(kf(legs), st === 1 ? 'M-3.6 -1.4h2.6v1.6h-2.6zM1.4 -1h2.6v1.4h-2.6z' : 'M-2.8 -1.4h2.2v1.5h-2.2zM.6 -1.4h2.2v1.5h-2.2z');
    else s += path(kf(legs), st === 1 ? `M-2.6 -7.2h2.2l-2.2 7.2h-2.3zM.4 -7.2h2.2l2.1 7.2h-2.3z` : `M-2.7 ${-7.2 + up}h2.3v${7.2}h-2.3zM.4 ${-7.2 + up}h2.3v${7.2}h-2.3z`);
    s += path(kf(body), `M-3.7 ${-13.5 + up}Q-3.7 ${-16 + up} -1.2 ${-16 + up}H1.2Q3.7 ${-16 + up} 3.7 ${-13.5 + up}V${-6.2 + up}H-3.7Z`) + path(kf(tone(body, -.24)), `M.5 ${-16 + up}H1.2Q3.7 ${-16 + up} 3.7 ${-13.5 + up}V${-6.2 + up}H.5Z`);
    s += path(kf(tone(body, -.34)), `M-3.7 ${-9.6 + up}h7.4v1.1h-7.4z`);
    s += path(kf(tone(body, .12)), `M-5 ${-15 + up}h1.7v${st === 1 ? 5 : 5.6}h-1.7z`) + path(kf(tone(body, -.3)), `M3.3 ${-15 + up}h1.7v${st === 1 ? 5.6 : 5}h-1.7z`) + path(kf(skin), circ(-4.2, -9.2 + up + (st === 1 ? -.5 : 0), .95) + circ(4.2, -9.6 + up + (st === 1 ? .5 : 0), .95));
    s += path(kf(skin), circ(0, -18.9 + up, 3.1)) + path(kf(tone(skin, -.2)), `M0 ${-22 + up}a3.1 3.1 0 0 1 0 6.2z`);
    if (hat === 'fes') s += path(kf(hc), `M-2.4 ${-20.6 + up}L-1.9 ${-23.6 + up}H1.9L2.4 ${-20.6 + up}Z`) + path('Ln ' + ks('#2a2420'), `M1 ${-23.6 + up}l2.2 1.6`, ' stroke-width=".7"');
    else if (hat === 'sarik') s += path(kf(o.hatCol || M.bez), ell(0, -21.3 + up, 3.9, 2.3)) + path(kf(tone(o.hatCol || M.bez, -.2)), `M0 ${-23.6 + up}a3.9 2.3 0 0 1 0 4.6z`);
    else if (hat === 'hasir') s += path(kf('#d9b866'), ell(0, -20.8 + up, 5.6, 1.9)) + path(kf('#c9a04e'), `M-2.5 ${-21 + up}Q0 ${-25 + up} 2.5 ${-21 + up}Z`);
    else if (hat === 'ortu') s += path(kf(hc), `M-3.5 ${-18 + up}Q-3.8 ${-22.6 + up} 0 ${-22.6 + up}Q3.8 ${-22.6 + up} 3.5 ${-18 + up}L3.9 ${-15.4 + up}H2.4L2.6 ${-19.4 + up}Q0 ${-21 + up} -2.6 ${-19.4 + up}L-2.4 ${-15.4 + up}H-3.9Z`);
    else s += path(kf(o.hair || '#3a2c24'), `M-3.1 ${-19.4 + up}a3.1 3.1 0 0 1 6.2 0q-3.1 -1.4 -6.2 0z`);
    if (o.carry === 'kasa') s += path(kf(M.ahsapA), `M2.6 ${-13.6 + up}h5.6v4.4h-5.6z`) + path(kf(tone(M.ahsapA, -.26)), `M2.6 ${-11.6 + up}h5.6v.7h-5.6z`);
    else if (o.carry === 'sepet') s += path(kf('#c9a04e'), `M-4 ${-25 + up}h8l-1.2 3.4h-5.6z`) + path(kf('#7fa35e'), ell(0, -25.2 + up, 3.6, 1.3));
    else if (o.carry === 'balik') s += path(kf('#9fb4c4'), `M4.4 ${-8.4 + up}q1.8 2.6 0 5.4q-1.8 -2.8 0 -5.4z`) + path('Ln ' + ks('#4a3a34'), `M4.4 ${-9.6 + up}v1.4`, ' stroke-width=".6"');
    else if (o.carry === 'kova') s += path(kf(M.ahsap), `M3 ${-8 + up}h3.4l-.5 3.4h-2.4z`) + path('Ln ' + ks('#4a3a34'), `M3 ${-8 + up}q1.7 -2.4 3.4 0`, ' stroke-width=".6"');
    return s;
  };
  K.figure = figure;
  // duran insan (yapı içinde): o figure seçenekleri + flip
  B.fig = function (x, y, z = 0, o = {}) { const p = pr(x, y, z); this.item([x - .14, y - .14, z, x + .14, y + .14, z + .8], `<g transform="translate(${f1(p[0])} ${f1(p[1])})${o.flip ? ' scale(-1 1)' : ''}">${figure(o)}</g>`, { cast: false }); return this; };

  /* ---------- hayvanlar (küçük, durağan) ---------- */
  const critter = (kind, o = {}) => {
    const c = o.col || (kind === 'kedi' ? '#e0903a' : kind === 'marti' ? '#f4f1ea' : '#8f9aa6');
    if (kind === 'kedi') return `<ellipse cx="1" cy="0" rx="4.4" ry="1.6" fill="#1b2440" opacity=".2"/>` + path(kf(tone(c, -.2)), 'M3.4 -1.2q3.6 -.6 3 -4.4q-.2 -1.2 -1 -.2q.6 2.6 -2 3z') + path(kf(c), 'M-3 0q-.8 -4.6 1.6 -5.4q2.8 -.6 3.4 2.2q.6 2.4 -.4 3.2z') + path(kf(c), circ(-1.9, -6.2, 2.1) + 'M-3.8 -7.4l.3 -2.3l1.5 1.5zM-.9 -8l1.2 -1.9l.5 2.2z') + path(kf(tone(c, .4)), circ(-2.2, -5.4, .9));
    if (kind === 'marti') return path(kf(tone(c, -.14)), 'M-3.6 -3.4q3.4 -2.6 7 .2q-3 1.8 -7 -.2z') + path(kf(c), circ(-3.2, -5, 1.5) + 'M-3 -4.6q3 -1.6 6 1.2q-3.6 1.4 -6 -1.2z') + path(kf('#e8a23a'), 'M-4.6 -5l-1.9 .5l1.9 .4z') + path('Ln ' + ks('#e8a23a'), 'M-.6 -2.4v2.4M.9 -2.4v2.4', ' stroke-width=".6"');
    return path(kf(tone(c, -.1)), 'M-3 -2.4q2.6 -2.4 5.6 -.2l1.6 -.6l-.9 1.5q-3.2 1.8 -6.3 -.7z') + path(kf(c), circ(-2.6, -3.6, 1.3)) + path('Ln ' + ks('#b9603a'), 'M-.6 -1.2v1.2M.6 -1.2v1.2', ' stroke-width=".5"');
  };
  K.critter = critter;
  B.critter = function (kind, x, y, z = 0, o = {}) { const p = pr(x, y, z); this.item([x - .1, y - .1, z, x + .1, y + .1, z + .3], `<g transform="translate(${f1(p[0])} ${f1(p[1])})${o.flip ? ' scale(-1 1)' : ''}">${critter(kind, o)}</g>`, { cast: false }); return this; };
  K.TREE = TREE;

  /* ---------- canlandırılan öğelerin çizimi (önizleme ve oyun aynı çizimi kullanır) ----------
     Düz (2B) çizilir, sonra plane() matrisiyle izometrik düzleme yatırılır; oyunda içteki çizim döndürülür. */
  K.fxArt = {
    // axis 'y': +y'ye bakan düzlem (x–z) · 'x': +x'e bakan düzlem (y–z)
    plane: axis => axis === 'x' ? 'matrix(1 -.5 0 1.2247 0 0)' : 'matrix(1 .5 0 1.2247 0 0)',
    // su çarkı / tekerlek: merkez (0,0), yarıçap R piksel
    wheel(R, o = {}) { const c = o.col || M.ahsap, n = o.n || 12; let pad = '', sp = '';
      if (o.kind !== 'tekerlek') for (let i = 0; i < n; i++) { const a = i / n * 6.283, ca = Math.cos(a), sa = Math.sin(a), w0 = R * .07, w1 = R * .1; pad += `M${f1(ca * R * .8 - sa * w0)} ${f1(sa * R * .8 + ca * w0)}L${f1(ca * R * 1.08 - sa * w1)} ${f1(sa * R * 1.08 + ca * w1)}L${f1(ca * R * 1.08 + sa * w1)} ${f1(sa * R * 1.08 - ca * w1)}L${f1(ca * R * .8 + sa * w0)} ${f1(sa * R * .8 - ca * w0)}Z`; }
      for (let i = 0; i < 8; i++) { const a = i / 8 * 6.283; sp += `M0 0L${f1(Math.cos(a) * R * .86)} ${f1(Math.sin(a) * R * .86)}`; }
      return path(kf(tone(c, -.3)), pad) + `<circle r="${f1(R * .9)}" fill="none" class="${ks(c)}" stroke-width="${f1(R * .13)}"/><circle r="${f1(R * .6)}" fill="none" class="${ks(tone(c, -.22))}" stroke-width="${f1(R * .07)}"/>` + path('Ln ' + ks(tone(c, -.12)), sp, ` stroke-width="${f1(Math.max(1.2, R * .075))}"`) + `<circle r="${f1(R * .15)}" class="${kf(M.demir)}"/>`; },
    // yel değirmeni kanatları: dört kol, kafesli yelken bezi
    sails(R, o = {}) { const c = o.col || M.ahsapK, bz = o.cloth || M.bez; let sp = '', cl = '', lt = '';
      for (let i = 0; i < 4; i++) { const a = i / 4 * 6.283 + .3, ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca, w = R * .2, q = (t, k) => `${f1(ca * R * t + nx * w * k)} ${f1(sa * R * t + ny * w * k)}`;
        sp += `M0 0L${q(1, 0)}`; cl += `M${q(.24, 0)}L${q(1, 0)}L${q(1, 1)}L${q(.24, 1)}Z`; for (let k = 1; k < 5; k++) lt += `M${q(.24 + .76 * k / 5, 0)}L${q(.24 + .76 * k / 5, 1)}`; lt += `M${q(.24, .5)}L${q(1, .5)}M${q(.24, 1)}L${q(1, 1)}`; }
      return path(kf(bz), cl) + path('Ln ' + ks(tone(c, .1)), lt, ' stroke-width=".8"') + path('Ln ' + ks(c), sp, ` stroke-width="${f1(Math.max(1.6, R * .06))}"`) + `<circle r="${f1(R * .09)}" class="${kf(M.demir)}"/>`; },
    // flama: direk tepesinden sağa dalgalanır (0,0 bağlantı noktası)
    flag(o = {}) { const c = o.col || M.bezK, s = o.s || 1, L = 17 * s, H = 9 * s; return path(kf(c), `M0 0Q${f1(L * .3)} ${f1(-H * .18)} ${f1(L * .55)} ${f1(H * .06)}T${f1(L)} ${f1(H * .1)}L${f1(L * .82)} ${f1(H * .5)}L${f1(L)} ${f1(H * .95)}Q${f1(L * .7)} ${f1(H * .8)} ${f1(L * .5)} ${f1(H * .98)}T0 ${f1(H)}Z`) + path(kf(tone(c, -.26)), `M${f1(L * .5)} ${f1(H * .04)}Q${f1(L * .62)} ${f1(H * .5)} ${f1(L * .5)} ${f1(H * .98)}Q${f1(L * .36)} ${f1(H * .9)} ${f1(L * .3)} ${f1(H * .96)}Q${f1(L * .42)} ${f1(H * .5)} ${f1(L * .32)} ${f1(-H * .06)}Z`) + (o.emblem ? path(kf(o.emblem), circ(L * .24, H * .48, H * .2)) : ''); },
    // sancak: duvardan sarkan uzun bez (düz çizim: 0,0 sol üst; W×H piksel), ucu kırlangıç kuyruğu
    banner(W, H, o = {}) { const c = o.col || M.bezK; return path(kf(c), `M0 0H${f1(W)}V${f1(H)}L${f1(W / 2)} ${f1(H - W * .45)}L0 ${f1(H)}Z`) + path(kf(tone(c, -.22)), `M${f1(W * .68)} 0H${f1(W)}V${f1(H)}L${f1(W * .68)} ${f1(H - W * .29)}Z`) + path(kf(o.trim || M.altin), `M0 0H${f1(W)}V${f1(Math.max(1.4, H * .06))}H0Z`) + (o.emblem === false ? '' : path(kf(o.emblem || M.altin), `M${f1(W / 2)} ${f1(H * .36 - W * .3)}L${f1(W * .78)} ${f1(H * .36)}L${f1(W / 2)} ${f1(H * .36 + W * .3)}L${f1(W * .22)} ${f1(H * .36)}Z`) + path(kf(c), circ(W / 2, H * .36, W * .1))); },
  };
})(typeof window !== 'undefined' ? window.CK : globalThis.CK);
