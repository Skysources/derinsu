/* Ev — kasabanın sıradan evleri. Tek üretici, tohumdan (seed) türeyen onlarca çeşit:
   'siva'  kireç sıvalı Ege evi: renkli kepenk, çiçeklik, taş su basman, köşe taşları, demir balkon
   'tas'   kesme taş zemin kat + payandalara oturan sıvalı çıkma, kafesli uzun pencereler, cumba
   'himis' ahşap çatkılı üst kat (sıva ya da tuğla dolgu), geniş saçak
   Kütle: ana blok + (ön kanat | yan müştemilat | yan bahçe | ön avlu: çardak ya da çitli bahçe),
   beşik/kırma çatı, çatı penceresi, duvara yaslı yan baca.
   Yerel eksenler: u cephe boyunca, v arkadan sokağa doğru. cephe 'L' → u=x, v=y; 'R' → u=y, v=x (ayna).
   Görünen yüzler her iki durumda da F (+v, sokak cephesi) ve S (+u, yan cephe).
   Bütçe için pencereler ve yapraklar burada göreli yol komutlarıyla (kısa) çizilir. */
CK.def('ev', { w: 4.5, d: 5, name: 'Ev' }, (b, K, opt) => {
  opt = opt || {};
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, f1 = K.f1, pr = K.pr, ks = K.ks, kf = K.kf;
  const r = K.rng(((opt.seed || 7) * 7919 + 17) | 0), ch = p => r() < p, rr = (a, c) => a + r() * (c - a), pick = a => a[Math.floor(r() * a.length)];
  const TUGLA = '#b9694a', BEYAZ = '#f6f0e2', TER = '#c9744a';

  /* ---------- yerel eksen sarmalayıcıları ---------- */
  const Lm = opt.cephe !== 'R', W = Lm ? b.w : b.d, D = Lm ? b.d : b.w;
  const X = (u, v, z = 0) => Lm ? [u, v, z] : [v, u, z], sp = (u, v, z) => pr(...X(u, v, z));
  const P3 = (u, v, z) => { const p = sp(u, v, z); return f1(p[0]) + ' ' + f1(p[1]); };
  const AX = a => (a === 'v') === Lm ? 'y' : 'x';
  const sw = (fn, u0, v0, u1, v1, ...rest) => Lm ? b[fn](u0, v0, u1, v1, ...rest) : b[fn](v0, u0, v1, u1, ...rest);
  const wrap = k => { const u0 = Lm ? k.x0 : k.y0, u1 = Lm ? k.x1 : k.y1, v0 = Lm ? k.y0 : k.x0, v1 = Lm ? k.y1 : k.x1;
    return { F: Lm ? k.L : k.R, S: Lm ? k.R : k.L, T: k.T, it: k.it, u0, v0, u1, v1, z0: k.z0, z1: k.z1, fa: (u, w = 0) => Lm ? u - u0 : u1 - u - w, sa: (v, w = 0) => Lm ? v1 - v - w : v - v0 }; };
  const box = (u0, v0, z0, u1, v1, z1, col, o) => wrap(Lm ? b.box(u0, v0, z0, u1, v1, z1, col, o) : b.box(v0, u0, z0, v1, u1, z1, col, o));
  const BB = bb => Lm ? bb : [bb[1], bb[0], bb[2], bb[4], bb[3], bb[5]];
  const it = (bb, svg) => b.item(BB(bb), svg, { cast: false });
  const hat = (pts, col, wid, o) => b.line3(pts.map(p => X(p[0], p[1], p[2])), col, wid, o);
  const at = (fn, u, v, ...rest) => { const p = X(u, v); return b[fn](p[0], p[1], ...rest); };
  const shed = (u0, v0, u1, v1, zl, zh, a, col, o) => sw('shed', u0, v0, u1, v1, zl, zh, '+' + AX(a), col, o);
  const kedi = (u, v, z, o) => { const p = X(u, v); b.critter('kedi', p[0], p[1], z, o); };
  const kus = (u, v, z) => { const p = X(u, v); b.critter(ch(.5) ? 'marti' : 'guvercin', p[0], p[1], z, { flip: ch(.5) }); };
  // çatının üstündeki parça: sıralamada çatıdan sonra gelsin diye kutusu mahyanın üstüne taşınır (gölgesi yerinde kalır)
  const yukari = (t, zr) => { const q = t.bb; if (!t.pts) t.pts = [[q[0], q[1], q[2]], [q[3], q[1], q[2]], [q[3], q[4], q[2]], [q[0], q[4], q[2]], [q[0], q[1], q[5]], [q[3], q[1], q[5]], [q[3], q[4], q[5]], [q[0], q[4], q[5]]]; t.bb = [q[0], q[1], Math.max(q[2], zr), q[3], q[4], Math.max(q[5], zr + .02)]; };
  const ustte = (k, zr) => { yukari(k.it, zr); return k; }, son = () => b.items[b.items.length - 1];

  /* ---------- kısa yollar: göreli dikdörtgen, kemer, nokta dizisi ---------- */
  const vec = f => f._v || (f._v = (() => { const o = f.q(0, 0), u = f.q(1, 0), v = f.q(0, 1); return [u[0] - o[0], u[1] - o[1], v[0] - o[0], v[1] - o[1]]; })());
  const rc = (f, a, c, w, h) => { const [ux, uy, vx, vy] = vec(f); return `M${f.P(a, c)}l${f1(ux * w)} ${f1(uy * w)} ${f1(vx * h)} ${f1(vy * h)} ${f1(-ux * w)} ${f1(-uy * w)}z`; };
  const fil = (f, ly, col, d, dt = 0) => f.put(ly, kf(f.c(col, dt)), d);
  const str = (f, ly, col, d, wid, dt = 0) => f.put(ly, 'Ln ' + ks(f.c(col, dt)), d, `stroke-width="${wid}"`);
  const kem = (f, a, c, w, h, k) => { const m = a + w / 2, q = k === 'seg' ? Math.min(w * .22, h) : Math.min(w / 2, h), ys = c + h - q, pts = [[a, c], [a, ys]];
    if (k === 'seg') pts.push([a + w * .2, c + h - q * .3], [m, c + h], [a + w * .8, c + h - q * .3]);
    else for (const t of [2.62, 2.09, 1.57, 1.05, .52]) pts.push([m + Math.cos(t) * w / 2, ys + Math.sin(t) * q]);
    pts.push([a + w, ys], [a + w, c]); return 'M' + pts.map(p => f.P(p[0], p[1])).join(' ') + 'Z'; };
  const noktalar = pts => { let s = '', cx = 0, cy = 0; for (const p of pts) { const dx = Math.round(p[0] - cx), dy = Math.round(p[1] - cy); s += (s ? 'm' : 'M') + dx + ' ' + dy + 'h.1'; cx += dx + .1; cy += dy; } return s; };
  const blobs = (col, pts, wid) => pts.length ? ln(col, noktalar(pts), f1(wid)) : '';
  // yaprak kümesi: koyu taban + orta ton + ışık + çiçek
  const yap = (pts, S, col, fl) => { const m = [], l = [], f = [];
    for (const p of pts) { if (r() < .72) m.push([p[0] - S * .25, p[1] - S * .32]); if (r() < .3) l.push([p[0] - S * .55, p[1] - S * .65]); if (fl && r() < .5) f.push([p[0] + (r() - .5) * S * 1.5, p[1] + (r() - .35) * S]); }
    return blobs(T(col, -.3), pts, S * 2) + blobs(col, m, S * 1.4) + blobs(T(col, .3), l, S * .65) + (fl ? blobs(fl, f, S * .95) + blobs(T(fl, .34), f.filter((_, i) => i % 3 === 0).map(p => [p[0] - .7, p[1] - .8]), S * .5) : ''); };
  const CICEK = () => pick([M.begonvil, M.kirmizi, '#f0e6d0', M.sari, M.mor, '#e86a5a']);

  /* ---------- kimlik: hepsi tohumdan ---------- */
  const kat = Math.max(1, Math.min(3, Math.round(opt.kat || 2))), az = kat === 3 || b.w * b.d > 30;      // az: büyük evde doku seyrek
  const s0 = pick(['siva', 'siva', 'siva', 'tas', 'tas', 'himis', 'himis']), stil = ['siva', 'tas', 'himis'].includes(opt.stil) ? opt.stil : s0;
  const sivaAd = pick(['kirec', 'kirec', 'krem', 'asi', 'gul', 'somon', 'buz', 'nane', 'sari', 'leylak', 'krem']);
  const kepAd = pick(['mavi', 'yesil', 'kirmizi', 'lacivert', 'turkuaz', 'hardal'].filter(k => !({ nane: 'yesil turkuaz', sari: 'hardal', asi: 'hardal', somon: 'kirmizi', gul: 'kirmizi', buz: 'turkuaz' }[sivaAd] || '').includes(k)));
  const KEP = M[kepAd], SIVA0 = opt.renk || M[sivaAd], tugla = stil === 'himis' && kat < 3 && ch(.16), SIVA = tugla ? TUGLA : SIVA0;
  const TAS = pick([M.tas, M.tas, M.tasK, '#d6cbb2', '#c4b9a6']);
  const zemTas = stil === 'tas' || (stil === 'himis' && kat > 1 && (tugla || ch(.6))), ZC = zemTas ? TAS : SIVA;
  const CER = stil === 'siva' ? BEYAZ : pick([M.ahsapA, BEYAZ, M.ahsapA, '#d9c8a4']);
  const KAPI = ch(.5) ? KEP : pick([M.ahsapK, '#7a4a2a', M.ahsap]);
  const CATI = pick([M.kiremit, M.kiremit, M.kiremitK, M.kiremitA, '#c2704a', '#b8604a', '#cf8455', '#a9553a']);
  const ov = stil === 'siva' ? .17 : stil === 'tas' ? .24 : .3;
  const g = kat === 1 ? 1.22 : stil === 'tas' ? 1.18 : 1.14, up = 1.08, zOf = i => i ? g + (i - 1) * up : 0;
  const BITKI = pick([['boug', M.sarmasik, M.begonvil], ['boug', M.sarmasik, M.begonvil], ['ivy', M.sarmasik, null], ['wist', '#5f9458', M.mor], ['gul', M.sarmasik, '#e8d9c8']]);
  const pit = stil === 'siva' ? rr(1.2, 1.45) : rr(1.0, 1.3);

  /* ---------- yerleşim ---------- */
  const yard = .4 + (D - 4) * .08 + r() * .3, v0 = .08; let v1 = D - yard;
  const full = W - .24; let Hw = full;
  if (full > 4.5) Hw = rr(Math.max(3.3, Math.min(3.8, full - 1.6)), Math.min(4.3, full - .9)); else if (full > 4.1 && ch(.25)) Hw -= rr(.95, 1.15);
  let gw = full - Hw, ek = null; const gs = gw > .5 ? (ch(.55) ? 1 : -1) : 0, mt = r(), Hd = v1 - v0;
  if (gw > 1.7) { ek = { w: rr(1.15, 1.45), s: gs }; gw -= ek.w; }
  else if (Hw > 3.7 && Hd <= 4.6 && mt < .4) { ek = { w: rr(1.05, 1.4), s: ch(.5) ? 1 : -1 }; Hw -= ek.w; }
  let cu = .12; const G0 = cu; if (gs < 0) cu += gw; if (ek && ek.s < 0) { ek.u0 = cu; cu += ek.w; }
  const mu0 = cu, mu1 = cu + Hw; cu = mu1; if (ek && ek.s > 0) { ek.u0 = cu; cu += ek.w; } const G1 = cu;
  let kan = null;
  if (!ek && Hd >= 3.4 && Hw >= 3.1 && (Hd > 4.6 || (mt >= .4 && mt < .8))) { const ww = Math.max(1.5, Math.min(2.4, Hw * rr(.42, .56))), s = ch(.68) ? -1 : 1;
    kan = { d: Hd > 4.6 ? Math.min(2.3, Hd - rr(3.4, 4)) : rr(1.1, 1.45), u0: s < 0 ? mu0 : mu1 - ww, u1: s < 0 ? mu0 + ww : mu1, s, nk: kat === 3 && ch(.45) ? 2 : 1, cati: kat === 1 ? 'sv' : pick(['gv', 'gv', 'teras', 'sv']), h0: kat === 1 ? .84 : 0 }; }
  if (!kan && Hd > 4.6) v1 = v0 + rr(4, 4.5);                                    // derin parsel: öne avlu kalır
  const mv1 = kan ? v1 - kan.d : v1, avlu = D - v1;
  // çıkmalar: kat başına öne (jf) ve yana (jsd) taşma
  const j1 = stil === 'tas' ? rr(.18, .26) : stil === 'himis' ? rr(.12, .2) : 0, sj = j1 && !(ek && ek.s > 0) && ch(.6) ? j1 * .8 : 0, j2 = j1 && ch(.5) ? .12 : 0;
  const jf = [0], jsd = [0]; for (let i = 1; i < kat; i++) { jf.push(j1 + (i > 1 ? j2 : 0)); jsd.push(sj ? sj + (i > 1 ? j2 : 0) : 0); }
  // çatı biçimi: 'u' mahya cepheye koşut · 'v' cepheye dik · 'k' kırma
  const t0 = r(); let rt = stil === 'siva' ? (t0 < .45 ? 'u' : t0 < .66 ? 'v' : 'k') : stil === 'tas' ? (t0 < .45 ? 'k' : t0 < .8 ? 'u' : 'v') : (t0 < .5 ? 'u' : t0 < .78 ? 'v' : 'k'); if (rt === 'v' && Hw + (jsd[kat - 1] || 0) > 4.3) rt = 'u';
  // duvara yaslı yan baca: kalkan duvarı boyunca zeminden mahyanın üstüne
  const yb = rt === 'u' && !(ek && ek.s > 0) && !sj && ch(kat === 1 ? .6 : .42) ? { v: (v0 + mv1 + jf[kat - 1]) / 2 + rr(-.3, .3), w: rr(.62, .74) } : null;

  /* ---------- pencere ---------- */
  // o: frame · kind 'arch'|'seg' · sove · shut (kepenk) · sill:false · bars (yatay kayıt sayısı) · kafes (oran) · box (çiçeklik)
  const kanat = (f, a, c, w, h, col, ly) => { const [ux, uy, vx, vy] = vec(f), q = w - .06; fil(f, ly, col, rc(f, a, c, w, h));
    let s = `M${f.P(a + .03, c + h * .25)}`; for (let i = 0; i < 3; i++) s += `l${f1(ux * q)} ${f1(uy * q)}` + (i < 2 ? `m${f1(-ux * q + vx * h * .25)} ${f1(-uy * q + vy * h * .25)}` : ''); str(f, ly + 1.9, col, s, .7, -.2); };
  const pen = (f, a, c, w, h, o = {}) => { const fr = o.frame || M.ahsapK, fw = .05, k = o.kind, ia = a + fw, ib = c + fw, iw = w - 2 * fw, ih = h - 2 * fw;
    const sh = (x, y, ww, hh) => k ? kem(f, x, y, ww, hh, k) : rc(f, x, y, ww, hh), top = k ? ib + ih - (k === 'seg' ? Math.min(iw * .22, ih) : Math.min(iw / 2, ih)) * .9 : ib + ih;
    if (o.sove) fil(f, 3, o.sove, sh(a - .07, c - .02, w + .14, h + .09) + rc(f, a - .1, c - .08, w + .2, .07), .08);
    fil(f, 4, fr, sh(a, c, w, h) + (o.sill !== false && !o.sove ? rc(f, a - .06, c - .07, w + .12, .07) : ''));
    if (o.shut && !k && ch(.13)) { kanat(f, ia, ib, iw / 2 - .012, ih, o.shut, 5); kanat(f, ia + iw / 2 + .012, ib, iw / 2 - .012, ih, o.shut, 5); return; }   // kepengi kapalı pencere
    const lit = stil === 'siva' ? r() < .52 : f._lit === undefined ? (f._lit = r() < .55) : f._lit; fil(f, 5, lit ? M.camI : M.cam, sh(ia, ib, iw, ih), -.04);
    fil(f, 5.5, lit ? M.camPI : M.camP, `M${f.P(ia, top)} ${f.P(ia + iw * .5, top)} ${f.P(ia, top - ih * .34)}Z`, -.02);
    let d = `M${f.P(ia + iw / 2, ib)} ${f.P(ia + iw / 2, top)}`; const nb = o.bars || (h > .62 ? 2 : 1); for (let i = 1; i <= nb; i++) { const y = ib + (top - ib) * i / (nb + 1); d += `M${f.P(ia, y)} ${f.P(ia + iw, y)}`; }
    if (k) d += `M${f.P(ia, top)} ${f.P(ia + iw, top)}`;
    if (o.kafes) { const n = Math.max(4, Math.round(iw / .085)), hh = (top - ib) * o.kafes; let z1 = 'M', z2 = 'M'; for (let i = 0; i <= n; i++) { z1 += f.P(ia + iw * i / n, ib + (i % 2 ? hh : 0)) + ' '; z2 += f.P(ia + iw * i / n, ib + (i % 2 ? 0 : hh)) + ' '; }
      d += z1 + z2 + `M${f.P(ia, ib + hh)} ${f.P(ia + iw, ib + hh)}`; }
    str(f, 6, fr, d, .8);
    if (o.shut) { const q = w * .46, hh = k ? top - c + fw : h; kanat(f, a - q - .015, c, q, hh, o.shut, 4.2); kanat(f, a + w + .015, c, q, hh, o.shut, 4.2); }
    if (o.box) { fil(f, 7, o.box === true ? M.ahsap : o.box, rc(f, a - .05, c - .2, w + .1, .13)); const pts = [], pf = [];
      for (let i = 0; i < 5; i++) { const p = f.q(a + w * (i + .5) / 5, c - .05 + r() * .05, .04); pts.push(p); if (r() < .7) pf.push([p[0] + r() * 2 - 1, p[1] - 1.5 + r()]); }
      f.put(7.5, 'Ln ' + ks(f.c(M.sarmasik, -.05)), noktalar(pts), 'stroke-width="4.8"').put(7.8, 'Ln ' + ks(CICEK()), noktalar(pf), 'stroke-width="2.3"'); } };
  const spec = (i, cati) => stil === 'siva' ? (i ? { w: .5, h: cati ? .58 : .7, b: cati ? .3 : .24, o: { shut: KEP, frame: CER } } : { w: .5, h: .6, b: .4, o: { shut: KEP, frame: CER } })
    : stil === 'tas' ? (i ? { w: .44, h: cati ? .66 : .78, b: .2, o: { kind: cati ? 'seg' : 0, kafes: .5, frame: CER } } : { w: .44, h: .5, b: .5, o: { kind: 'arch', sove: M.mermer, frame: M.demir, bars: 1 } })
      : (i || !zemTas ? { w: .5, h: .66, b: i ? .26 : .38, o: { frame: CER } } : { w: .46, h: .56, b: .44, o: { shut: KEP, frame: CER } });
  const eksen = (lo, hi, p) => { const n = Math.max(1, Math.min(4, Math.floor((hi - lo - .15) / p))), a = []; for (let i = 0; i < n; i++) a.push(lo + (hi - lo) * (i + .5) / n); return a; };

  /* ---------- blok: kat kat kutular ---------- */
  const blok = (c0, d0, c1, d1, nk, o = {}) => { const L = [], vb = o.vb || (() => d0), zz = i => o.h0 && i ? o.h0 : zOf(i);
    if (stil === 'siva') { const bx = box(c0, d0, 0, c1, d1, zz(nk), SIVA, { T: null }); for (let i = 0; i < nk; i++) L.push({ bx, zb: zz(i), h: zz(i + 1) - zz(i), i }); }
    else for (let i = 0; i < nk; i++) L.push({ bx: box(c0, vb(i), zz(i), c1 + (o.js ? o.js[i] : 0), d1 + (o.jf ? o.jf[i] : 0), zz(i + 1), i ? SIVA : ZC, { T: null }), zb: 0, h: zz(i + 1) - zz(i), i });
    return L; };

  /* ---------- cephe: doku + pencereler ---------- */
  let nKutu = 0, kilim = ch(.5);
  const tuglaDoku = (f, z0, h) => { let d = ''; const n = Math.round(f.w * h * 1.1); for (let i = 0; i < n; i++) { const a = rr(.1, f.w - .5), y = z0 + .14 + Math.floor(r() * ((h - .3) / .12)) * .12; d += `M${f.P(a, y)} ${f.P(a + rr(.2, .42), y)}`; } str(f, 2.5, f.mc, d, .8, -.1); };
  const cephe = (L, yz, ax, o = {}) => { const nk = L.length, ayri = stil !== 'siva';
    for (const lv of L) { const bx = lv.bx, f = bx[yz], i = lv.i, zb = lv.zb, top = i === nk - 1, s = o.alcak ? { w: .42, h: .34, b: .3, o: { frame: CER, bars: 1, shut: stil === 'siva' ? KEP : null } } : spec(i, top && nk === 3), P = (c, w) => (yz === 'F' ? bx.fa : bx.sa)(c - w / 2, w);
      const cs = (!i && o.ax0 ? o.ax0 : ax).filter(c => !(o.ban && o.ban(i, c)) && !(o.seyrek && r() < o.seyrek));
      if (!i && zemTas) f.courses({ rh: .27, bw: .62, dens: az ? .32 : .42 }).stones(yz === 'F' ? (az ? 3 : 5) : (az ? 2 : 3), { rh: .27 }).band(0, .2, T(ZC, -.16), 0);
      else if (!i) f.band(0, .2, M.tas, .02);                                    // su basman
      if (!ayri && i) f.band(zb - .03, .06, SIVA, .2);                           // kat silmesi
      if (ayri && i) f.band(0, .08, M.ahsapK, 0, 3);                             // çıkma kirişi
      if (top) f.rect(0, zb + lv.h - .15, f.w, .15, f.mc, 2, -.14);              // saçak gölgesi
      else if (ayri) f.shadeTop(.2, -.15);
      if (tugla && (i || !zemTas)) tuglaDoku(f, zb, lv.h);
      if (stil === 'himis' && (i || !zemTas)) { const ps = [.04, f.w - .04], b0 = zb + s.b, br = []; cs.forEach(c => ps.push(P(c, s.w) - .06, P(c, s.w) + s.w + .06)); ps.sort((p, q) => p - q); const n = ps.length;
        if (ps[1] - ps[0] > .3) br.push([.04, b0, Math.min(ps[1], .46), zb + .1]); if (ps[n - 1] - ps[n - 2] > .3) br.push([f.w - .04, b0, Math.max(ps[n - 2], f.w - .46), zb + .1]);
        f.timber({ posts: ps, rails: [zb + (i ? .04 : .23), b0 - .02, b0 + s.h + .05, zb + lv.h - .03], braces: br }); }
      if (stil === 'tas' && i) f.rect(0, 0, .06, f.h, M.ahsapK, 3).rect(f.w - .06, 0, .06, f.h, M.ahsapK, 3);   // köşe dikmeleri
      for (const c of cs) { const e = Object.assign({}, s.o), a = P(c, s.w), bb = zb + s.b;
        if (i && stil !== 'tas' && nKutu < 2 && ch(.3)) { e.box = pick([true, TER]); nKutu++; }
        pen(f, a, bb, s.w, s.h, e);
        if (i && yz === 'F' && kilim && !e.box && ch(.4)) { kilim = false; const kc = pick([M.bezK, M.bezM, M.bezMor, M.bezY]);   // pencereden sarkan kilim
          f.rect(a + .05, bb - .4, s.w - .1, .46, kc, 7).rect(a + .05, bb - .3, s.w - .1, .05, M.bez, 7.1).rect(a + .05, bb - .16, s.w - .1, .05, M.bezS, 7.1).rect(a + .05, bb - .4, s.w - .1, .03, M.bez, 7.1); }
      }
    } };
  // köşe taşları (sıvalı evde): dişli tek çokgen
  const kose = (f, zt, sol, sag) => { for (const left of [true, false]) { if (!(left ? sol : sag)) continue; const e = left ? 0 : f.w, pts = [[e, .2]]; let z = .2;
    for (let k = 0; z < zt - .3; z += .22, k++) { const a = left ? (k % 2 ? .12 : .21) : f.w - (k % 2 ? .12 : .21); pts.push([a, z], [a, z + .22]); } pts.push([e, z]); f.poly(pts, M.tas, 2.4, .06); } };

  /* ---------- çatı ---------- */
  // alaturka kiremit: oluk çizgileri, tek tük açık/koyu kiremit, saçak sırası
  const kiremitle = (f, st = .3) => { const w = f.w, h = f.h, s = f.shape, n = s ? s.length : 0, eL = c => s ? s[n - 1][0] * c / h : 0, eR = c => s ? w - (w - s[2][0]) * c / h : w; let dk = '', lt = '', pl = '', pd = '';
    for (let a = st * .5; a < w - .02; a += st) { const t = r(); dk += f.seg(a, t < .2 ? h * rr(.15, .45) : 0, a, t > .8 ? h * rr(.5, .85) : h); if (r() < .3) { const c = r() * h * .6; lt += f.seg(a + st * .5, c, a + st * .5, Math.min(h, c + rr(.4, 1.1))); } }
    f.put(2.5, 'Ln ' + ks(f.c(f.mc, -.17)), dk, 'stroke-width=".9"').put(2.6, 'Ln ' + ks(f.c(f.mc, .16)), lt, 'stroke-width=".8"');
    const np = Math.round(w * h * (az ? .2 : .3)) + 1;
    for (let i = 0; i < np; i++) { const big = !i && w > 2.5, hh = big ? rr(.6, .9) : rr(.3, .6), ww = big ? st * 3 : st, c = .14 + r() * Math.max(.1, h - hh - .3), a = Math.floor(r() * Math.max(1, (w - ww) / st - 1)) * st + st * .5;
      if (a < eL(c + hh) + .04 || a + ww > eR(c + hh) - .04) continue; const d = rc(f, a, c, ww, hh); if (big || r() < .5) pl += d; else pd += d; }
    f.put(2.2, kf(f.c(f.mc, .09)), pl).put(2.2, kf(f.c(f.mc, -.1)), pd);
    f.poly([[0, 0], [w, 0], [eR(.11), .11], [eL(.11), .11]], f.mc, 2.3, -.1); };
  const catiYap = (c0, d0, c1, d1, z, tip, wall, o = ov) => {
    if (tip === 'k') { const h = Math.min(c1 - c0, d1 - d0) / 2 + o, rise = Math.max(.58, Math.min(.9, h * .38)); const hp = sw('hip', c0 - o, d0 - o, c1 + o, d1 + o, z, rise, CATI, { tex: false }); kiremitle(hp.L); kiremitle(hp.R);
      return { z: (u, v) => z + rise * Math.min(1, Math.min(u - c0 + o, c1 + o - u, v - d0 + o, d1 + o - v) / h), rise, tip, top: z + rise }; }
    const av = tip === 'v', half = (av ? c1 - c0 : d1 - d0) / 2, mid = av ? (c0 + c1) / 2 : (d0 + d1) / 2, rise = Math.max(.6, Math.min(.94, half * .41));
    const gb = sw('gable', c0, d0, c1, d1, z, rise, CATI, { axis: AX(av ? 'v' : 'u'), ov: o, wall, tex: false }), G = gb.G; kiremitle(gb.A); if (gb.B) kiremitle(gb.B, .5);
    if (wall === ZC && zemTas) G.courses({ rh: .27, dens: .4 });
    if (stil === 'himis') G.timber({ posts: [half], rails: [.03], braces: [[half * .42, .03, half, rise * .58], [half * 1.58, .03, half, rise * .58]] });
    else if (rise > .7 && !(yb && wall !== 0 && o === ov)) G.shp('round', half - .17, rise * .2, .34, .32, stil === 'siva' ? CER : M.ahsapK, 4).shp('round', half - .12, rise * .2 + .05, .24, .22, ch(.4) ? M.camI : M.cam, 5);
    // mahya kiremitlerinin derzleri
    const zr = z + rise; it(av ? [mid - .04, d0 - o, zr, mid + .04, d1 + o, zr + .03] : [c0 - o, mid - .04, zr, c1 + o, mid + .04, zr + .03], ln(T(CATI, -.34), av ? `M${P3(mid, d0 - o, zr)} ${P3(mid, d1 + o, zr)}` : `M${P3(c0 - o, mid, zr)} ${P3(c1 + o, mid, zr)}`, 1.2, 'stroke-dasharray=".1 3.9"'));
    return { z: (u, v) => z + rise * (1 - Math.abs((av ? u : v) - mid) / half), rise, tip, mid, half, top: zr }; };
  const baca = (c, d, ct, hh, o = {}) => { const w = o.w || .32, cz = ct.z, z0 = Math.min(cz(c - w / 2, d - w / 2), cz(c + w / 2, d + w / 2), cz(c - w / 2, d + w / 2), cz(c + w / 2, d - w / 2)) - .03, p = X(c, d), h = hh + cz(c, d) - z0;
    const mat = stil === 'siva' ? M.kirec : stil === 'tas' ? TAS : TUGLA, k = b.chimney(p[0], p[1], z0, h, { mat, w, cap: stil === 'siva' ? M.kiremitK : T(mat, -.2), smoke: !!o.smoke, s: .7 });
    ustte(k, ct.top);
    return z0 + h + .09; };

  /* ---------- cumba ve balkon ---------- */
  const payanda = (yz, c0, c1, w, j, z) => { const n = Math.max(2, Math.round((c1 - c0) / .8)); let d = '';
    for (let k = 0; k < n; k++) { const c = c0 + .1 + (c1 - c0 - .2) * k / (n - 1); d += yz === 'F' ? `M${P3(c, w, z - .36)} ${P3(c, w + j - .02, z - .03)}` : `M${P3(w, c, z - .36)} ${P3(w + j - .02, c, z - .03)}`; }
    it(yz === 'F' ? [c0, w, z - .36, c1, w + j, z] : [w, c0, z - .36, w + j, c1, z], ln(T(M.ahsapK, (yz === 'F') === Lm ? .08 : -.12), d, 1.9)); };
  const cumba = (lv, c, w, h, out, rows, catili) => { const bx = lv.bx, ahs = stil !== 'siva' && ch(.4), mat = ahs ? M.ahsap : SIVA;
    const k = wrap(b.bay(bx.F, bx.fa(c - w / 2, w), lv.zb + .03, w, h, { out, mat })), n = w > 1.12 ? 3 : 2, ww = n === 3 ? .24 : .3, e = { frame: M.ahsapK, kafes: stil === 'tas' ? .5 : 0, sill: false }, gp = (k.F.w - n * ww) / (n + 1);
    for (let q = 0; q < rows; q++) { for (let i = 0; i < n; i++) pen(k.F, gp + i * (ww + gp), .2 + q * up, ww, .52, e); pen(k.S, (out - .2) / 2, .2 + q * up, .2, .52, e); if (q) { k.F.band(up - .05, .08, M.ahsapK, 0, 3); k.S.band(up - .05, .08, M.ahsapK, 0, 3); } }
    for (const f of [k.F, k.S]) { if (ahs) f.planks({ step: .13 }); f.band(0, .07, M.ahsapK, 0, 3).band(h - .06, .06, M.ahsapK, 0, 3); }
    if (catili) shed(k.u0 - .07, bx.v1, k.u1 + .07, k.v1 + .09, k.z1, k.z1 + .18, 'v', CATI, { tex: false });
    return k; };
  const saksi = list => { let body = '', sh = '', fol = '', bb = [9, 9, 9, -9, -9, -9];
    for (const [u, v, z, s, t, fl] of list) { const [x, y] = sp(u, v, z), q = (a, c) => `${f1(x + a * s)} ${f1(y - c * s)}`, pts = [];
      body += `M${q(-2.1, 0)}L${q(-3.1, 4.8)}H${f1(x + 3.1 * s)}L${q(2.1, 0)}Z`; sh += `M${q(.5, 0)}L${q(.8, 4.8)}H${f1(x + 3.1 * s)}L${q(2.1, 0)}Z`;
      if (t === 2) for (let k = 0; k < 5; k++) pts.push([x + (r() - .5) * 2.2 * s, y - (6.5 + k * 2.7) * s]); else for (let k = 0; k < 5; k++) pts.push([x + (k - 2) * 1.7 * s + (r() - .5) * s, y - (6.6 + (k % 2) * 2.2 + r()) * s]);
      fol += yap(pts, 1.9 * s, t === 2 ? M.selvi : M.sarmasik, t === 1 ? fl : null);
      bb = [Math.min(bb[0], u - .1), Math.min(bb[1], v - .1), Math.min(bb[2], z), Math.max(bb[3], u + .1), Math.max(bb[4], v + .1), Math.max(bb[5], z + .5)]; }
    it(bb, pth(TER, body) + pth('#3a2418', sh, 'opacity=".28"') + fol); };
  const balkon = (lv, c, w, o = {}) => { const bx = lv.bx, f = bx.F, zb = lv.zb + (o.b === undefined ? .07 : o.b), out = o.out || rr(.3, .38), z = bx.z0 + zb, vw = bx.v1;
    pen(f, bx.fa(c - .25, .5), zb, .5, .84, { frame: stil === 'siva' ? CER : M.ahsapK, shut: stil === 'himis' ? null : KEP, sill: false, bars: 2 });
    if (o.kisi) { at('fig', c + w * .22, vw + out * .5, z, { body: pick([M.bezM, M.bezMor, M.bezY, '#b8574a']), robe: true, hat: 'ortu', hatCol: pick([M.bez, M.bezS, M.kirmizi]), shadow: false });
      const n = Lm ? [0, 1, 0] : [1, 0, 0], kc = pick([M.bezK, M.bezM, M.bezMor]), q = (a, c0, z0, z1) => [X(c - w * .34 + a, vw + out + .02, z + z0), X(c - w * .34 + c0, vw + out + .02, z + z0), X(c - w * .34 + c0, vw + out + .02, z + z1), X(c - w * .34 + a, vw + out + .02, z + z1)];
      b.poly3(q(0, .4, .36, -.14), kc, { n }); b.poly3(q(0, .4, .2, .14), M.bez, { n }); b.poly3(q(0, .4, 0, -.05), M.bezS, { n }); }
    b.balcony(f, bx.fa(c - w / 2, w), zb, w, { out, col: stil === 'siva' ? M.demir : M.ahsapK, slab: stil === 'siva' ? M.tas : M.ahsap });
    if (!o.destek) it([c - w / 2, vw, z - .32, c + w / 2, vw + out, z - .07], ln(stil === 'siva' ? M.demir : M.ahsapK, `M${P3(c - w / 2 + .1, vw, z - .32)} ${P3(c - w / 2 + .1, vw + out - .04, z - .07)}M${P3(c + w / 2 - .1, vw, z - .32)} ${P3(c + w / 2 - .1, vw + out - .04, z - .07)}`, 1.5));
    if (!o.kisi || ch(.5)) saksi([[c - w / 2 + .13, vw + out - .1, z, .8, 1, CICEK()]].concat(ch(.5) ? [[c + w / 2 - .13, vw + out - .1, z, .75, ch(.5) ? 1 : 0, CICEK()]] : []));
    if (o.tente) b.awning(f, bx.fa(c - w / 2 - .05, w + .1), zb + .93, w + .1, { out: out + .1, drop: .2, cols: [T(KEP, .25), M.bez] }); };

  /* ---------- sarmaşık: yüzün önünde ayrı parça (çıkmaların üstünden de tırmanır) ---------- */
  // yz 'F'|'S' · s kök konumu · c0..c1 tepede yayıldığı aralık · pl(z): o yükseklikteki duvar düzlemi
  const asma = (yz, s, c0, c1, top, drop, pl, kind = BITKI) => { const pt = (c, z) => yz === 'F' ? sp(c, pl(z) + .05, z) : sp(pl(z) + .05, c, z), q = (c, z) => { const p = pt(c, z); return f1(p[0]) + ' ' + f1(p[1]); }, pts = [], n = Math.max(3, Math.round(Math.abs(c1 - c0) * 3.6));
    for (let i = 0; i <= n; i++) { const c = c0 + (c1 - c0) * i / n, len = drop * (.3 + r() * .7) * (kind[0] === 'wist' ? 1.3 : 1); for (let d = -.05; d < len; d += .135) pts.push(pt(c + (r() - .5) * .12, top - d)); }
    let st = `M${q(s, 0)}`; for (let z = .3; z < top; z += .3) st += ` ${q(s + Math.sin(z * 7) * .04, z)}`; st += ` ${q(s, top)}M${q(c0, top - .03)} ${q(c1, top - .03)}`;
    for (let z = .25; z < top - .2; z += .24) if (r() < .55) pts.push(pt(s + (r() - .5) * .14, z));
    const lo = Math.min(s, c0, c1) - .12, hi = Math.max(s, c0, c1) + .12;
    it(yz === 'F' ? [lo, pl(0), 0, hi, pl(top) + .1, top + .1] : [pl(0), lo, 0, pl(top) + .1, hi, top + .1], ln(M.govde, st, 1.3) + yap(pts, 2.3, kind[1], kind[2])); };

  /* ---------- küçük eşyalar (ekran uzayı) ---------- */
  const kup = (u, v, s = 1, c = TER) => at('art', u, v, 0, `<g transform="scale(${s})">` + pth(T(c, -.28), 'M-2 0Q-6.4 -6 -3 -11.4L-2.2 -13.6H2.2L3 -11.4Q6.4 -6 2 0Z') + pth(T(c, .12), 'M-2 0Q-6.4 -6 -3 -11.4L-2.2 -13.6H-.2Q-2.6 -6 -.4 0Z') + ln(T(c, -.2), 'M-3 -11q-3.4 .6 -2.8 4.4M3 -11q3.4 .6 2.8 4.4', 1) + '</g>', { r: .12 });
  const supurge = (u, v) => at('art', u, v, 0, ln(M.ahsapA, 'M0 -3L4.4 -19', 1.2) + pth('#c9a85a', 'M-3.4 0L-1 -5.4L2.2 -4.6L3.6 .8Z') + ln('#8a6a3a', 'M-1.2 -4.6l3 .8', 1), { r: .1 });
  const sepet = (u, v, z, fill) => at('art', u, v, z, pth('#c9a04e', 'M-4.6 -4.6h9.2l-1.4 4.6h-6.4z') + pth('#a8823a', 'M-4.6 -4.6h9.2l-.3 1.2h-8.6z') + (fill ? pth(fill, K.ell(0, -5, 4, 1.7)) + pth(T(fill, .3), K.circ(-1.4, -5.6, 1.2) + K.circ(1.6, -5.2, 1.1)) : ''), { r: .1 });
  const kova = (u, v) => at('art', u, v, 0, pth(M.ahsap, 'M-3 -5.4h6l-.8 5.4h-4.4z') + pth('#8fb4c4', K.ell(0, -5.4, 3, 1.1)) + ln(M.demir, 'M-3 -5.4q3 -5.6 6 0', .7), { r: .1 });
  const cocuk = (u, v, o) => { const p = sp(u, v, 0); it([u - .12, v - .12, 0, u + .12, v + .12, .55], `<g transform="translate(${f1(p[0])} ${f1(p[1])}) scale(.72)">${K.figure(o)}</g>`); };
  const funda = (u, v, s, fl, col = M.sarmasik) => { const [x, y] = sp(u, v, 0), pts = []; for (let i = 0; i < 6; i++) pts.push([x + (r() - .5) * 9 * s, y - 3 * s - r() * 6 * s]); it([u - .2, v - .2, 0, u + .2, v + .2, .5], yap(pts, 3.1 * s, col, fl)); };
  // duvara dayalı el merdiveni (v: duvar düzlemi)
  const merdiven = (c, v, h) => { let d = ''; for (const e of [-.11, .11]) d += `M${P3(c + e, v + .36, 0)} ${P3(c + e, v + .02, h)}`; for (let t = .16; t < .95; t += .17) d += `M${P3(c - .11, v + .36 - .34 * t, h * t)} ${P3(c + .11, v + .36 - .34 * t, h * t)}`; it([c - .13, v, 0, c + .13, v + .38, h], ln(M.ahsapA, d, 1.3)); };
  // odun istifi
  const odun = (c, v) => { const k = box(c, v, 0, c + .72, v + .26, .4, M.ahsap, { edge: false, cast: false }); k.F.planks({ dir: 'h', step: .1 }); const pts = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) pts.push(k.S.q(.05 + i * .08, .07 + j * .12, .01)); k.S.put(5, 'Ln ' + ks(k.S.c(M.ahsapA, .2)), noktalar(pts), 'stroke-width="3"'); };

  /* =====================================================================
     KURULUŞ
     ===================================================================== */
  /* --- yan bahçe: duvar, kapı, ağaç, çamaşır --- */
  const bahce = (c0, c1, s) => { const vg = v1 - rr(0, .22), wd = c1 - c0, DUV = pick([M.kirec, TAS, M.tasK, SIVA0]), tasD = DUV !== M.kirec && DUV !== SIVA0, hD = rr(.66, .8), p = [X(c0, v0), X(c1, v0), X(c1, vg), X(c0, vg)];
    b.gpoly(p, M.cimA, { op: .8 }); b.tufts(...X(c0 + .1, vg - 1.6).slice(0, 2), ...X(c1 - .1, vg - .3).slice(0, 2), 6);
    const tk = pick(wd > 1.25 ? ['zeytin', 'narenciye', 'cinar', 'fistik', 'narenciye'] : ['selvi', 'narenciye', 'zeytin', 'selvi']), ts = { zeytin: .95, narenciye: 1.05, cinar: .62, fistik: .72, selvi: .78 }[tk] * rr(.9, 1.1), tp = X(c0 + wd * rr(.4, .6), vg - rr(.75, 1.1));
    b.tree(tk, tp[0], tp[1], { s: ts });
    if (wd > 1.5) funda(s > 0 ? c1 - .4 : c0 + .4, vg - rr(1.7, 2.3), 1.3, ch(.6) ? CICEK() : null);
    if (s > 0 && wd > .7) { const sd = box(c1 - .13, v0 + .2, 0, c1, vg - .14, .46, TAS, { edge: false }); sd.S.courses({ rh: .23, bw: .6, dens: .4 }); }
    // çamaşır ipi: ev duvarından direğe
    if (wd > .95 && ch(.75)) { const vl = vg - rr(.42, .6), ua = s > 0 ? c0 - .02 : c0 + .22, ub = s > 0 ? c1 - .3 : c1 + .02, pu = s > 0 ? ub : ua;
      hat([[pu, vl, 0], [pu, vl, 1.3]], M.ahsapK, 1.6); sw('clothes', ua, vl, ub, vl, 1.22); }
    const gc = c0 + wd * (wd > 1.3 ? rr(.35, .65) : .5), kosk = wd > 1.15 && ch(.6), gwd = kosk ? .42 : .3;
    const seg = (a, e) => { if (e - a < .08) return; const w = box(a, vg - .14, 0, e, vg, hD, DUV, { edge: false }); if (tasD) w.F.courses({ rh: .24, bw: .6, dens: .42 }); else w.F.band(0, .16, M.tas, .02).patches(e - a > .9 && ch(.5) ? 1 : 0, { b1: hD });
      sw('slab', a - .02, vg - .17, e + .02, vg + .03, hD + .05, .05, tasD ? T(DUV, -.1) : CATI, { cast: false }); };
    seg(c0 + .02, gc - gwd); seg(gc + gwd, c1 - .02);
    if (kosk) { const k = box(gc - .42, vg - .24, 0, gc + .42, vg + .02, 1.04, DUV, { edge: false }); if (tasD) k.F.courses({ rh: .24, bw: .6, dens: .42 });
      k.F.door(k.fa(gc - .25, .5), .5, .82, { kind: 'arch', col: KAPI, sove: tasD ? M.mermer : M.tas, double: true }); sw('hip', gc - .56, vg - .38, gc + .56, vg + .16, 1.04, .3, CATI, { tex: false }); }
    else { const k = box(gc - .3, vg - .1, 0, gc + .3, vg - .04, hD - .06, KAPI, { edge: false, cast: false }); k.F.planks({ step: .12 }).line([[.04, .2], [.56, .2]], M.demir, 1, 6).line([[.04, hD - .22], [.56, hD - .22]], M.demir, 1, 6);
      for (const c of [gc - .36, gc + .36]) { box(c - .08, vg - .16, 0, c + .08, vg + .02, hD + .16, tasD ? DUV : M.tas, { edge: false, cast: false }); } }
    // duvardan taşan begonvil / sarmaşık
    if (ch(.7)) { const a0 = s > 0 ? gc + gwd + .1 : c0 + .1, a1 = s > 0 ? c1 - .1 : gc - gwd - .1, pts = [];
      if (a1 - a0 > .3) { for (let c = a0; c < a1; c += .12) { pts.push(sp(c + (r() - .5) * .08, vg - .08, hD + .08 + r() * .14)); const len = r() * .42; for (let d = 0; d < len; d += .14) pts.push(sp(c, vg + .05, hD + .02 - d)); }
        it([a0, vg - .14, hD - .4, a1, vg + .1, hD + .3], yap(pts, 2.3, BITKI[1], BITKI[2] || (ch(.5) ? M.begonvil : null))); } }
  };
  if (gs < 0) bahce(G0, G0 + gw, -1);

  /* --- yan müştemilat (ek): alçak kiler / mutfak --- */
  let ekS = null;
  const ekYap = () => { const e0 = ek.u0, e1 = e0 + ek.w, d1 = mv1 - rr(.2, .7), d0 = v0 + (ch(.5) ? 0 : rr(.3, .9)), tip = kat > 1 ? pick(['sv', 'teras', ek.s > 0 ? 'su' : 'sv']) : pick(['sv', ek.s > 0 ? 'su' : 'sv']);
    const eh = tip === 'teras' ? g : kat > 1 ? .94 : .8, EC = pick([M.kirec, TAS, SIVA0, TAS]), tasE = EC === TAS, ex = box(e0, d0, 0, e1, d1, eh, EC, { T: null });
    ekS = { d0, d1, tip };
    for (const f of [ex.F, ex.S]) { if (tasE) f.courses({ rh: .25, bw: .6, dens: .42 }).stones(2, { rh: .25 }); else f.band(0, .18, M.tas, .02); f.shadeTop(.12, -.12); }
    const kc = e0 + ek.w * (ch(.5) ? .36 : .64);
    if (ch(.6)) { ex.F.door(ex.fa(kc - .24, .48), .48, Math.min(.74, eh - .12), { col: M.ahsap, sove: tasE ? M.mermer : M.tas, kind: tasE ? 'seg' : 'rect' }); if (ek.w > 1.25) pen(ex.F, ex.fa(e0 + ek.w - kc + e0 - .16, .32), .42, .32, .3, { frame: M.ahsapK, bars: 1 }); }
    else pen(ex.F, ex.fa(e0 + ek.w / 2 - .22, .44), .34, .44, .4, { frame: M.ahsapK, shut: tasE ? KEP : null, bars: 1 });
    if (d1 - d0 > 1.6) pen(ex.S, ex.sa((d0 + d1) / 2 - .2, .4), .36, .4, .36, { frame: M.ahsapK, bars: 1 });
    if (tip === 'sv') kiremitle(shed(e0 - (ek.s < 0 ? .12 : 0), d0, e1 + (ek.s > 0 ? .14 : 0), d1 + .16, eh - .05, eh + Math.min(kat > 1 ? .55 : .3, (d1 - d0) * .16), 'v', CATI, { tex: false }).A);
    else if (tip === 'su') kiremitle(shed(e0, d0 - .05, e1 + .16, d1 + .12, eh - .05, eh + (kat > 1 ? .36 : .26), 'u', CATI, { tex: false }).A);
    else { sw('flat', e0, d0, e1, d1, eh, EC === TAS ? TAS : M.kirec); const zt = eh + .2;
      saksi([[e0 + .2, d1 - .07, zt, .9, 1, CICEK()], [e0 + ek.w * .5, d1 - .07, zt, .8, 2], [e1 - .2, d1 - .07, zt, .85, ch(.5) ? 1 : 0, CICEK()]]);
      const vl = d0 + (d1 - d0) * rr(.35, .55); hat([[e0 + .16, vl, eh], [e0 + .16, vl, eh + 1]], M.ahsapK, 1.5); hat([[e1 - .16, vl, eh], [e1 - .16, vl, eh + 1]], M.ahsapK, 1.5); sw('clothes', e0 + .16, vl, e1 - .16, vl, eh + .96); }
    if (tip !== 'teras' && ch(.55)) { const c = e0 + ek.w * .5, d = d0 + .35, zr = tip === 'sv' ? eh + Math.min(kat > 1 ? .55 : .3, (d1 - d0) * .16) * (1 - (d - d0) / (d1 - d0 + .16)) : eh + .2;
      const p = X(c, d), k = b.chimney(p[0], p[1], zr - .12, .62, { mat: TAS, w: .36, s: .8 }); ustte(k, eh + .6); }
    return ex; };
  if (ek && ek.s < 0) ekYap();

  /* --- ana blok --- */
  const ana = blok(mu0, v0, mu1, mv1, kat, { jf, js: jsd });
  const axF = eksen(mu0, mu1, pit), axS = eksen(v0, mv1, pit * (Lm ? 1.4 : 1.15));
  // kapı: kanat yoksa bir eksende; kanat varsa girintide (kanat yakın yandaysa kanadın cephesinde)
  const kapiAna = !kan || kan.s < 0 || kat === 1, n0 = kan ? (kan.s < 0 ? kan.u1 : mu0) : mu0, n1 = kan ? (kan.s < 0 ? mu1 : kan.u0) : mu1, nookW = kan && kapiAna ? n1 - n0 : 0;
  const kc = !kan ? pick(axF) : kapiAna ? (nookW >= 2.3 ? (ch(.5) ? n1 - .72 : n0 + .72) : n0 + nookW / 2 + (nookW > 1.5 ? rr(-.15, .15) : 0)) : (kan.u0 + kan.u1) / 2 + (kan.u1 - kan.u0 > 1.9 ? pick([-.42, .42]) : 0);
  const kw = stil === 'tas' ? .68 : .56, kh = stil === 'tas' ? 1.0 : .92, kb = .1, yakin = stil === 'siva' ? 1.0 : .82;
  let feat = null;
  if (kat > 1) { const t = r(), tip = stil === 'tas' ? (t < .6 ? 'cumba' : t < .76 ? 'balkon' : 0) : stil === 'siva' ? (t < .44 ? 'balkon' : t < .6 ? 'cumba' : 0) : (t < .45 ? 'cumba' : t < .66 ? 'balkon' : 0);
    const uy = axF.filter(c => !(kan && c > kan.u0 - .35 && c < kan.u1 + .35)), spc = (mu1 - mu0) / axF.length, ust = r();
    if (tip && uy.length) feat = { tip, c: pick(uy), w: Math.min(spc - .12, rr(1, 1.3)), ust: kat === 3 ? (tip === 'cumba' ? (ust < .35 ? 'iki' : ust < .7 ? 'balkon' : '') : (ust < .5 ? 'iki' : '')) : '' }; }
  const kanC = kan ? (kan.u0 + kan.u1) / 2 : 0;
  const banF = (i, c) => (kan && c > kan.u0 - .3 && c < kan.u1 + .3 && (i < kan.nk || (i === kan.nk && (kan.cati !== 'teras' || Math.abs(c - kanC) < .8))))
    || (!i && kapiAna && Math.abs(c - kc) < yakin) || (feat && i && (i === 1 || feat.ust) && Math.abs(c - feat.c) < feat.w / 2 + (stil === 'siva' ? .52 : .32));
  const banS = (i, c) => (ek && ek.s > 0 && !i) || (yb && Math.abs(c - yb.v) < yb.w / 2 + (stil === 'siva' ? .52 : .3));
  const ax0 = nookW ? (nookW > 1.3 ? [n0 + .62, n1 - .62] : []).filter(c => Math.abs(c - kc) >= yakin) : null;
  cephe(ana, 'F', axF, { ban: banF, ax0, seyrek: axF.length > 2 ? .1 : 0 });
  cephe(ana, 'S', axS, { ban: banS, seyrek: Lm ? (az ? .3 : .2) : .08 });
  if (stil === 'siva' && ch(.45)) { kose(ana[0].bx.F, zOf(kat), true, true); kose(ana[0].bx.S, zOf(kat), Lm, !Lm); }
  // sıva dökülmesi: köşeye yakın, pencerelerden uzak
  if (stil !== 'himis' && !tugla && ch(.55)) { const yz = ch(.5) ? 'F' : 'S', lv = ana[kat > 1 && stil === 'tas' ? 1 : 0], f = lv.bx[yz], ax = yz === 'F' ? axF : axS, bos = (yz === 'F' ? mu1 - ax[ax.length - 1] : mv1 - ax[ax.length - 1]) - .5;
    if (bos > .5 && !(yz === 'F' && Math.abs(kc - mu1) < 1.2)) { const a0 = (yz === 'F') === Lm ? f.w - bos : .1; f.patches(1, { a0, a1: a0 + bos - .1, b0: lv.zb + .25, b1: lv.zb + .95 }); } }
  // kuş evi: yan duvarda, iki pencere arasında saçağın altında
  if (axS.length > 1 && ch(.3) && !yb) { const lv = ana[kat - 1], f = lv.bx.S, a = lv.bx.sa((axS[0] + axS[1]) / 2 - .1, .2), c = lv.zb + lv.h - .46;
    f.rect(a, c, .2, .15, M.mermer, 7).poly([[a - .05, c + .15], [a + .25, c + .15], [a + .1, c + .27]], CATI, 7.1).rect(a - .03, c - .03, .26, .03, M.tasK, 7).dot(a + .1, c + .07, 1.3, M.ic, 7.2, null); }
  // çıkma payandaları
  for (let i = 1; i < kat; i++) { const d = jf[i] - jf[i - 1]; if (d > .05) { const c0 = kan && i <= kan.nk ? (kan.s < 0 ? kan.u1 : mu0) : mu0, c1 = kan && i <= kan.nk ? (kan.s < 0 ? mu1 : kan.u0) : mu1; payanda('F', c0 + .02, c1 + (c1 === mu1 ? jsd[i] : 0) - .02, mv1 + jf[i - 1], d, zOf(i)); }
    const e = jsd[i] - jsd[i - 1]; if (e > .05) payanda('S', v0 + .3, mv1 + jf[i] - .04, mu1 + jsd[i - 1], e, zOf(i)); }
  // cumba / balkon
  let balkonlu = false;
  if (feat) { const l1 = ana[1], out = rr(.32, .42), kisi = ch(.4);
    if (feat.tip === 'cumba') { const bal = feat.ust === 'balkon', iki = feat.ust === 'iki';
      cumba(l1, feat.c, feat.w, bal ? up - .03 : iki ? 2 * up - .2 : up - .2, out, iki ? 2 : 1, !bal);
      if (bal) { balkon(ana[2], feat.c, feat.w, { b: .07, out: out - (jf[2] - jf[1]), destek: true, kisi }); balkonlu = kisi; } }
    else { balkon(l1, feat.c, feat.w, { kisi, tente: stil === 'siva' && ch(.4) }); balkonlu = kisi; if (feat.ust === 'iki') balkon(ana[2], feat.c, feat.w, { out: .3 }); } }
  // çatı
  const tb = ana[kat - 1].bx, tw = tb.u1 - tb.u0, td = tb.v1 - tb.v0;
  const ct = catiYap(tb.u0, tb.v0, tb.u1, tb.v1, tb.z1, rt, kat === 1 ? ZC : SIVA);
  // bacalar: görünür yere — mahyanın üstüne ya da öne bakan yamaca
  let bc = -9;
  { const n = (yb ? 0 : 1) + (kat > 1 && ch(.4) ? 1 : 0), yan = ch(.5) ? 1 : -1;
    for (let k = 0; k < n; k++) { const s = k ? -yan : yan, c = rt === 'v' ? ct.mid + (k ? rr(.35, .6) : rr(-.08, .12)) : tb.u0 + tw * (.5 + s * rr(.18, .32)), d = rt === 'v' ? tb.v0 + td * (k ? rr(.55, .7) : rr(.25, .45)) : rt === 'u' ? ct.mid + (k ? rr(.35, .6) : rr(-.1, .1)) : tb.v0 + td * .5 + (k ? rr(.3, .5) : rr(-.2, .1));
      const zt = baca(c, d, ct, k ? .42 : rr(.5, .68), { smoke: !k && ch(.7), w: k ? .26 : .32 }); if (!k || rt !== 'v') bc = c; if (!k && ch(.3)) kus(c, d, zt); } }
  if (ch(.3) && rt !== 'k') { const t = rr(.2, .8); rt === 'u' ? kus(tb.u0 + tw * t, ct.mid, ct.top) : kus(ct.mid, tb.v0 + td * t, ct.top); }
  // çatı penceresi (öne bakan yamaçta küçük beşik çatılı çıkıntı)
  if (rt === 'u' && kat < 3 && tw > 2.6 && ch(kat === 1 ? .45 : .28)) { let c = tb.u0 + tw * rr(.3, .7); if (Math.abs(c - bc) < .7) c = bc + (bc > tb.u0 + tw / 2 ? -.85 : .85);
    const vf = tb.v1 - rr(.12, .3), zb = ct.z(c, vf), hh = .4, zt = zb + hh, vb = vf - hh * ct.half / ct.rise - .04, w2 = .34, wc = stil === 'siva' ? SIVA : stil === 'tas' ? SIVA : M.ahsap;
    const k = ustte(box(c - w2, vf - .05, zb - .04, c + w2, vf, zt, wc, { edge: false, cast: false, T: null }), ct.top); pen(k.F, .14, .1, .4, .25, { frame: stil === 'siva' ? CER : M.ahsapK, sill: false, bars: 1 });
    const q = [X(c + w2, vf, zb - .04), X(c + w2, vf, zt), X(c + w2, vb, zt)]; b.poly3(q, wc, { n: Lm ? [1, 0, 0] : [0, 1, 0], bb: BB([c - w2, vb, ct.top, c + w2, vf, ct.top + .02]) });
    sw('gable', c - w2, vb, c + w2, vf, zt, .2, CATI, { axis: AX('v'), ov: .07, wall: wc, tex: false, cast: false }); yukari(son(), ct.top); }
  // yan baca gövdesi
  if (yb) { const ust = ct.z(mu1 - .01, yb.v) + rr(.42, .55), mat = stil === 'siva' ? pick([TAS, M.kirec, TUGLA]) : TAS, zo = Math.min(zOf(1) - .1, ust - .9), h2 = yb.w / 2;
    const k1 = box(mu1, yb.v - h2, 0, mu1 + .27, yb.v + h2, zo, mat, { edge: false }), k2 = box(mu1, yb.v - h2 + .12, zo, mu1 + .21, yb.v + h2 - .12, ust, mat, { edge: false });
    if (mat !== M.kirec) { k1.S.courses({ rh: .22, bw: .3, dens: .4 }); k2.S.courses({ rh: .22, bw: .3, dens: .3 }); } else k1.S.band(0, .2, M.tas, .02);
    ustte(k2, ct.top); ustte(box(mu1 - .03, yb.v - h2 + .08, ust, mu1 + .25, yb.v + h2 - .08, ust + .08, T(mat, -.16), { edge: false, cast: false }), ct.top);
    const p = X(mu1 + .1, yb.v); b.fx('smoke', p[0], p[1], ust + .12, { s: .8 }); }

  /* --- ön kanat --- */
  let kanL = null;
  if (kan) { const zw = kan.h0 || zOf(kan.nk), jb = jf[kan.nk] || 0, wd = v1 - mv1;
    kanL = blok(kan.u0, mv1, kan.u1, v1, kan.nk, { vb: i => mv1 + jf[i], h0: kan.h0 });
    const axW = eksen(kan.u0, kan.u1, pit * .92), banW = (i, c) => !i && !kapiAna && Math.abs(c - kc) < yakin;
    cephe(kanL, 'F', axW.length > 1 || kapiAna ? axW : [], { ban: banW, ax0: !kapiAna ? axW.filter(c => Math.abs(c - kc) >= yakin) : null, alcak: !!kan.h0 });
    if (wd > 1.15) cephe(kanL, 'S', [mv1 + wd / 2 + .05], { alcak: !!kan.h0 });
    else kanL.forEach(lv => { const f = lv.bx.S; if (!lv.i) zemTas ? f.courses({ rh: .27, bw: .62, dens: .42 }).band(0, .2, T(ZC, -.16), 0) : f.band(0, .2, M.tas, .02); });
    if (stil === 'siva' && ch(.4)) kose(kanL[0].bx.F, zw, true, true);
    const wall = kan.nk > 1 || !zemTas ? SIVA : ZC;
    if (kan.cati === 'gv') { const half = (kan.u1 - kan.u0) / 2, rise = Math.min(.66, Math.max(.5, half * .5)), gb = sw('gable', kan.u0, mv1 + jb + .14, kan.u1, v1, zw, rise, CATI, { axis: AX('v'), ov: .14, wall, tex: false }), G = gb.G; kiremitle(gb.A); if (gb.B) kiremitle(gb.B, .5);
      if (wall === ZC && zemTas) G.courses({ rh: .27, dens: .4 });
      G.shp('round', half - .15, rise * .22, .3, .28, stil === 'siva' ? CER : M.ahsapK, 4).shp('round', half - .105, rise * .22 + .045, .21, .19, M.cam, 5); }
    else if (kan.cati === 'sv') kiremitle(shed(kan.u0 - .1, mv1 + jb, kan.u1 + .1, v1 + .15, zw - .04, Math.min(zw + Math.min(.5, wd * .34), kan.h0 ? g - .1 : 9), 'v', CATI, { tex: false }).A);
    else { sw('flat', kan.u0, mv1 + jb, kan.u1, v1, zw, zemTas && kan.nk === 1 ? ZC : stil === 'siva' ? SIVA : M.kirec); const zt = zw + .2, lv = ana[kan.nk], f = lv.bx.F;   // taraça
      pen(f, lv.bx.fa(kanC - .25, .5), lv.zb + .03, .5, .84, { frame: stil === 'siva' ? CER : M.ahsapK, sill: false, bars: 2 });
      saksi([[kan.u0 + .2, v1 - .07, zt, .95, 1, CICEK()], [kan.u0 + .5, v1 - .07, zt, .75, 0], [kan.u1 - .22, v1 - .07, zt, .9, 2]]);
      const vl = mv1 + jb + wd * .5; hat([[kan.u0 + .15, vl, zw], [kan.u0 + .15, vl, zw + 1]], M.ahsapK, 1.5); hat([[kan.u1 - .15, vl, zw], [kan.u1 - .15, vl, zw + 1]], M.ahsapK, 1.5); sw('clothes', kan.u0 + .15, vl, kan.u1 - .15, vl, zw + .96);
      if (ch(.5)) at('fig', kanC + .3, vl + .28, zw, { body: pick([M.bezM, M.bezMor, '#b8574a']), robe: true, hat: 'ortu', hatCol: pick([M.bez, M.bezS]), shadow: false }); } }

  if (ek && ek.s > 0) ekYap();

  /* --- kapı, eşik, saçak --- */
  const kbx = kapiAna ? ana[0].bx : kanL[0].bx, vk = kbx.v1, kf_ = kbx.F, ka = kbx.fa(kc - kw / 2, kw), cikma = kapiAna ? jf[1] || 0 : 0;
  const kkind = stil === 'tas' ? 'arch' : pick(['rect', 'seg', 'arch', 'rect']), ls = ch(.5) ? 1 : -1;
  kf_.door(ka, kw, kh, { b: kb, kind: kkind, col: KAPI, sove: stil === 'tas' ? M.mermer : stil === 'siva' ? BEYAZ : M.ahsapK, double: stil === 'tas' || ch(.3), fan: kkind !== 'rect' && stil !== 'tas' && ch(.6) });
  kf_.rect(ka - .16, 0, kw + .32, kb, M.tas, 3.2, .12);
  sw('stairs', kc - kw / 2 - .16, vk, kc + kw / 2 + .16, vk + .3, kb, 0, AX('v'), M.tas);
  const fener = ch(.8); if (fener) { kf_.lantern(kbx.fa(kc + ls * (kw / 2 + .2)), kb + kh * .84); b.spill(...X(kc, vk + .55).slice(0, 2), 1.3); }
  // kapı yanında kurutmalık: ipe dizili biber / mısır / sarımsak
  if (ch(.3)) { const a = kbx.fa(kc - ls * (kw / 2 + .2)), pts = []; for (let c = kb + kh * .9; c > kb + kh * .48; c -= .075) pts.push(kf_.q(a + (r() - .5) * .03, c, .03));
    kf_.line([[a, kb + kh * .98], [a, kb + kh * .5]], '#6a5a4a', .7, 7).put(7.2, 'Ln ' + ks(pick(['#c0392b', '#c0392b', '#e0b040', '#efe6d0'])), noktalar(pts), 'stroke-width="2.7"'); }
  const kapiUst = !cikma ? pick(['sacak', 'asma', 'asma', 'tente', '', '']) : pick(['asma', '', '']);
  if (kapiUst === 'sacak') { const zt = kb + kh + .14; shed(kc - kw / 2 - .22, vk, kc + kw / 2 + .22, vk + .42, zt, zt + .2, 'v', CATI, { tex: 'plank' });
    it([kc - kw / 2 - .2, vk, zt - .3, kc + kw / 2 + .2, vk + .4, zt - .07], ln(M.ahsapK, `M${P3(kc - kw / 2 - .14, vk, zt - .3)} ${P3(kc - kw / 2 - .14, vk + .36, zt - .08)}M${P3(kc + kw / 2 + .14, vk, zt - .3)} ${P3(kc + kw / 2 + .14, vk + .36, zt - .08)}`, 1.6)); }
  else if (kapiUst === 'tente') b.awning(kf_, kbx.fa(kc - kw / 2 - .16, kw + .32), kb + kh + .34, kw + .32, { out: .46, drop: .24, cols: [T(KEP, .2), M.bez] });
  else if (kapiUst === 'asma') { const top = Math.min(kbx.z1 - .1, kb + kh + rr(.22, .4)), sd = -ls, s = kc + sd * (kw / 2 + .2); asma('F', s, kc - sd * (kw / 2 + rr(.1, .4)), s + sd * rr(.05, .3), top, rr(.3, .5), () => vk); }
  // büyük sarmaşık: boş bir köşede yukarı tırmanır
  if (ch(.55)) { const yz = ch(.5) ? 'F' : 'S', pl = yz === 'F' ? z => mv1 + (z >= g ? jf[Math.min(kat - 1, 1 + Math.floor((z - g) / up))] || 0 : 0) : z => mu1 + (z >= g ? jsd[Math.min(kat - 1, 1 + Math.floor((z - g) / up))] || 0 : 0);
    const top = Math.min(zOf(kat) - .2, rr(1.3, 2.3)), uygun = yz === 'S' ? !(ek && ek.s > 0) && !(yb && yb.v > mv1 - 1) : !(kan && kan.s > 0) && Math.abs(mu1 - kc) > 1;
    if (uygun) { const s = yz === 'F' ? mu1 - .1 : mv1 - .12; asma(yz, s, s - rr(.25, .6), s + .04, top, rr(.4, .8), pl); } }

  /* --- ön avlu (derin parselde): asma çardağı ya da çitli bahçe --- */
  let golge = null;                                                              // çardağın kapladığı u aralığı
  if (avlu >= 1.05) { const sol = kc - .45 - (mu0 + .1), sag = mu1 - .1 - (kc + .45), t = r(), va = v1 + .18, vq = D - .22;
    if (t < .45 && Math.max(sol, sag) >= 1.1) { const wd = Math.min(2.1, Math.max(sol, sag)), c0 = sol > sag ? kc - .45 - wd : kc + .45, c1 = c0 + wd, vb = Math.min(D - .3, va + 1.4), h = .98, pts = [], uz = [];
      golge = [c0, c1];
      for (const [c, v] of [[c0, va], [c1, va], [c0, vb], [c1, vb]]) hat([[c, v, 0], [c, v, h]], M.ahsapK, 1.7);
      let d = `M${P3(c0 - .1, va, h)} ${P3(c1 + .1, va, h)}M${P3(c0 - .1, vb, h)} ${P3(c1 + .1, vb, h)}`; const n = Math.max(3, Math.round(wd / .4)); for (let i = 0; i <= n; i++) { const c = c0 + wd * i / n; d += `M${P3(c, va - .12, h + .03)} ${P3(c, vb + .12, h + .03)}`; }
      for (let c = c0 - .04; c <= c1 + .05; c += .25) for (let v = va - .08; v <= vb + .1; v += .27) if (r() < .7) pts.push(sp(c + (r() - .5) * .12, v + (r() - .5) * .12, h + .07));
      for (let c = c0 + .15; c < c1; c += rr(.3, .5)) uz.push(sp(c, vb + .1, h - .1 - r() * .08));
      it([c0 - .1, va - .12, h, c1 + .1, vb + .12, h + .2], ln(M.ahsap, d, 1.5) + yap(pts, 3.1, '#5f9458', null) + blobs('#6a4a8a', uz, 2.8) + blobs('#9a78c8', uz.map(p => [p[0] - .5, p[1] - .6]), 1.2));
      hat([[c0 + .06, va, 0], [c0 + .1, va, h * .5], [c0 + .04, va, h]], M.govde, 1.2);       // asmanın gövdesi
      const cm = (c0 + c1) / 2; at('bench', cm, vb - .16, 0, Lm ? 'x' : 'y', { l: Math.min(1, wd - .5) }); at('table', cm, vb - .62, 0, { s: .42 });
      if (ch(.6)) at('fig', cm + rr(-.25, .25), vb - .16, .22, { body: pick(['#6a5a8a', '#5a6a4a', '#8a5a3a']), legs: '#4a3a34', hat: pick(['fes', 'hasir', 'sarik']), shadow: false }); else kedi(cm + .2, vb - .16, .22, { col: pick(['#e0903a', '#5a5450', '#e8e0d0']) }); }
    else if (t < .88) { const cit = pick(['cit', 'duvar', 'cali', 'cit']);                              // çitli ön bahçe
      for (const [a, e] of [[mu0 + .04, kc - .4], [kc + .4, mu1 - .04]]) { if (e - a < .3) continue;
        b.gpoly([X(a, v1 + .5), X(e, v1 + .5), X(e, vq - .1), X(a, vq - .1)], M.cimA, { op: .75 });
        if (cit === 'cit') b.fence([X(a, vq).slice(0, 2), X(e, vq).slice(0, 2)], .42, { col: M.ahsapA });
        else if (cit === 'cali') sw('hedge', a, vq - .2, e, vq, .28);
        else { const w = box(a, vq - .13, 0, e, vq, .3, TAS, { edge: false, cast: false }); w.F.courses({ rh: .15, bw: .5, dens: .4 }); }
        if (e - a > .8) { const c = a + (e - a) * rr(.3, .7), v = v1 + .5 + (vq - v1 - .8) * rr(.3, .8); if (ch(.45)) { const p = X(c, v); b.tree('selvi', p[0], p[1], { s: rr(.5, .68) }); } else funda(c, v, 1.4, ch(.7) ? CICEK() : null); b.flowers(...X(a + (e - a) * rr(.2, .8), vq - .45).slice(0, 2), { n: 6, r: .3 }); } }
      for (const c of [kc - .4, kc + .4]) box(c - .07, vq - .15, 0, c + .07, vq + .01, .56, cit === 'duvar' ? TAS : M.ahsapK, { edge: false, cast: false }); } }

  /* --- sokak önü: eşyalar, saksılar, insanlar --- */
  const vf = c => kan && c > kan.u0 - .1 && c < kan.u1 + .1 ? v1 : mv1 + 0, esya = ['saksi', 'bank', 'kup', 'supurge', 'sandik', 'fici', 'saksi', 'sepet', 'tarh', 'saksi', 'merdiven', 'odun'];
  for (let i = esya.length - 1; i > 0; i--) { const k = Math.floor(r() * (i + 1)), t = esya[i]; esya[i] = esya[k]; esya[k] = t; }
  const derin = Math.min(yard, avlu) > .55;
  for (let c = mu0 + rr(.22, .45); c < mu1 - .15; c += rr(.5, .85)) { if (Math.abs(c - kc) < kw / 2 + .32 || ch(.22)) continue; if (kan && Math.abs(c - (kan.s < 0 ? kan.u1 : kan.u0)) < .2) continue;
    const t = golge && c > golge[0] - .3 && c < golge[1] + .3 ? 'saksi' : esya.pop(), v = vf(c) + .17;
    if (t === 'saksi') saksi([[c, v, 0, rr(.95, 1.2), pick([0, 1, 1, 2]), CICEK()], [c + .25, v + .06, 0, rr(.7, .9), pick([0, 1, 1]), CICEK()]].concat(ch(.4) ? [[c + .1, v + .2, 0, .7, 1, CICEK()]] : []));
    else if (t === 'bank') { if (c + .7 > mu1 || Math.abs(c + .35 - kc) < kw / 2 + .7) continue; at('bench', c + .35, v + .02, 0, Lm ? 'x' : 'y', { l: .7 }); if (ch(.5)) kedi(c + .2, v + .02, .22, { col: pick(['#e0903a', '#5a5450', '#e8e0d0', '#3a3230']) }); else sepet(c + .5, v + .02, .22, pick(['#e8843a', '#7fa35e', M.bez])); c += .5; }
    else if (t === 'kup') { kup(c, v + .03, 1.05, pick([TER, '#b98a5a', T(KEP, .1)])); if (ch(.5)) kup(c + .24, v + .1, .75); }
    else if (t === 'supurge') { supurge(c, v - .06); kova(c + .26, v + .08); }
    else if (t === 'sandik') { at('crate', c, v + .08, 0, .36, { fill: pick(['#e8843a', '#7fa35e', '#c0473a', '#e0c068']), cast: false }); if (ch(.4)) sepet(c + .32, v + .1, 0, M.bez); }
    else if (t === 'fici') at('barrel', c, v + .08, 0, { top: '#4f93a8', r: .17, h: .4, cast: false });
    else if (t === 'sepet') { sepet(c, v + .05, 0, pick(['#e8843a', '#c0473a', '#7fa35e'])); if (ch(.5)) kedi(c + .3, v + .1, 0, { col: pick(['#e0903a', '#5a5450', '#e8e0d0']), flip: ch(.5) }); }
    else if (t === 'merdiven') { if (Math.abs(c - kc) < kw / 2 + .6) continue; merdiven(c, v - .17, rr(1.15, 1.5)); }
    else if (t === 'odun') { if (c + .75 > mu1 || Math.abs(c + .36 - kc) < kw / 2 + .7) continue; odun(c, v - .14); c += .55; }
    else if (derin) b.flowers(...X(c + .1, v + .12).slice(0, 2), { n: 6, r: .22 }); }
  // insan
  const pu = kc + (kc - mu0 > mu1 - kc ? -1 : 1) * rr(.5, .8), pv = vk + Math.min(yard - .12, rr(.42, .6)) + (avlu > 1 ? .3 : 0), kim = r();
  if (!balkonlu && kim < .62) {
    if (kim < .2) { cocuk(pu, pv, { body: pick([M.bezS, M.bezM, M.bezK, M.bezY]), legs: '#5a4a3a', hat: 'none', step: 1 }); at('art', pu + .3, pv + .1, 0, pth(pick([M.kirmizi, M.bezS, M.mavi]), K.circ(0, -2.4, 2.4)) + pth('#fff', K.circ(-.8, -3.2, .8), 'opacity=".5"'), { r: .08 }); }
    else if (kim < .4) at('fig', pu, pv, 0, { body: pick([M.bezM, M.bezMor, M.bezY, '#b8574a']), robe: true, hat: 'ortu', hatCol: pick([M.bez, M.bezS, M.kirmizi]), carry: pick(['sepet', 'kova']), flip: ch(.5) });
    else if (kim < .52) { at('fig', pu, pv, 0, { body: pick([M.bezM, '#b8574a', M.bezY]), robe: true, hat: 'ortu', hatCol: M.bez }); supurge(pu + .16, pv + .05); }
    else at('fig', pu, pv, 0, { body: pick(['#6a5a8a', '#5a6a4a', '#8a5a3a', M.bez]), legs: '#4a3a34', hat: pick(['fes', 'sarik', 'hasir']), carry: pick(['kasa', 'balik', undefined]), flip: ch(.5) }); }
  else if (kim > .8) kedi(pu, pv, 0, { col: pick(['#e0903a', '#5a5450', '#e8e0d0']), flip: ch(.5) });
  b.gpoly([X(kc - kw / 2 - .2, vk), X(kc + kw / 2 + .2, vk), X(kc + kw / 2 + .34, D), X(kc - kw / 2 - .34, D)], M.parkeK, { op: .55 });

  if (gs > 0) bahce(G1, G1 + gw, 1);
  b.tag(...X(W / 2, D - .1, 0)).doorAt(...X(kc, vk + .5).slice(0, 2));
});
