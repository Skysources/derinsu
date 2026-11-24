/* Ev — karanlık liman şehrinin sıkışık ortaçağ evleri. Tek üretici, tohumdan (seed) türeyen onlarca çeşit:
   'siva'  kirli sıvalı ev: kara ahşap çatkılı çıkma üst katlar, kara taş su basman, köşe taşları, kepenkler
   'tas'   kara kesme taş: sivri kemerli dar pencereler, taş söveler, kat silmeleri, köşe payandaları
   'himis' taş zemin kat + kara ahşap üst katlar (çatkı arası sıva ya da tahta kaplama), payandalı çıkmalar
   Kütle: ana blok + (ön kanat | yan müştemilat | yan bahçe | ön avlu: kurumuş çardak ya da demir çitli bahçe),
   dik arduvaz çatı (beşik ya da kırma), mahyada demir sivri uçlar, çatı pencereleri, yüksek taş bacalar.
   IŞIK: evlerin çoğu karanlıktır. Tohuma bağlı ~%35'inde yalnız TEK bir mumlu yüksek pencere yanar
   (üst kat, çatı penceresi ya da alınlık penceresi). Her pencerede lit açıkça verilir; fener, ışık havuzu yok.
   Yerel eksenler: u cephe boyunca, v arkadan sokağa doğru. cephe 'L' → u=x, v=y; 'R' → u=y, v=x (ayna).
   Görünen yüzler her iki durumda da F (+v, sokak cephesi) ve S (+u, yan cephe).
   Bütçe için pencereler ve yapraklar burada göreli yol komutlarıyla (kısa) çizilir. */
CK.def('ev', { w: 4.5, d: 5, name: 'Ev' }, (b, K, opt) => {
  opt = opt || {};
  const M = K.M, T = K.tone, pth = K.pth, ln = K.ln, f1 = K.f1, pr = K.pr, ks = K.ks, kf = K.kf;
  const r = K.rng(((opt.seed || 7) * 7919 + 17) | 0), ch = p => r() < p, rr = (a, c) => a + r() * (c - a), pick = a => a[Math.floor(r() * a.length)];
  const MUMY = '#2e3440>#ffd890', KUZ = '#25252b', ZEM = '#4e4c42', YOL = '#57534c';      // yanan camın parıltısı, kuzgun, karanlık toprak, kaldırım

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
  // kara kuzgun (ekran uzayında küçük siluet)
  const kuzgun = (u, v, z) => at('art', u, v, z, pth(KUZ, (ch(.5) ? 'M-4 -2.6q2.4 -2.6 6 -1l2.6 -1l-1.2 1.8q-2.6 2.2 -7.4 .2zM-4.6 -3.4l-2 .5l2 .5z' : 'M-3.6 -2.2q2.6 -1.6 6.4 -.2l2.2 1.4l-2.6 -.2q-3.2 .8 -6 -1zM-3.4 -2.6l-2.2 .4l2.2 .4z')
    + K.circ(-3.4, -3.4, 1.5)) + ln(KUZ, 'M-.4 -.8v.8M1 -.8v.8', .5), { r: .1, h: .3 });
  // çatının üstündeki parça: sıralamada çatıdan sonra gelsin diye kutusu mahyanın üstüne taşınır (gölgesi yerinde kalır)
  const yukari = (t, zr) => { const q = t.bb; if (!t.pts) t.pts = [[q[0], q[1], q[2]], [q[3], q[1], q[2]], [q[3], q[4], q[2]], [q[0], q[4], q[2]], [q[0], q[1], q[5]], [q[3], q[1], q[5]], [q[3], q[4], q[5]], [q[0], q[4], q[5]]]; t.bb = [q[0], q[1], Math.max(q[2], zr), q[3], q[4], Math.max(q[5], zr + .02)]; };
  const ustte = (k, zr) => { yukari(k.it, zr); return k; }, son = () => b.items[b.items.length - 1];

  /* ---------- kısa yollar: göreli dikdörtgen, nokta dizisi ---------- */
  const vec = f => f._v || (f._v = (() => { const o = f.q(0, 0), u = f.q(1, 0), v = f.q(0, 1); return [u[0] - o[0], u[1] - o[1], v[0] - o[0], v[1] - o[1]]; })());
  const rc = (f, a, c, w, h) => { const [ux, uy, vx, vy] = vec(f); return `M${f.P(a, c)}l${f1(ux * w)} ${f1(uy * w)} ${f1(vx * h)} ${f1(vy * h)} ${f1(-ux * w)} ${f1(-uy * w)}z`; };
  const fil = (f, ly, col, d, dt = 0) => f.put(ly, kf(f.c(col, dt)), d);
  const str = (f, ly, col, d, wid, dt = 0) => f.put(ly, 'Ln ' + ks(f.c(col, dt)), d, `stroke-width="${wid}"`);
  const noktalar = pts => { let s = '', cx = 0, cy = 0; for (const p of pts) { const dx = Math.round(p[0] - cx), dy = Math.round(p[1] - cy); s += (s ? 'm' : 'M') + dx + ' ' + dy + 'h.1'; cx += dx + .1; cy += dy; } return s; };
  const blobs = (col, pts, wid) => pts.length ? ln(col, noktalar(pts), f1(wid)) : '';
  // yosun / sarmaşık öbeği: koyu taban + orta ton + seyrek ışık (çiçek yok)
  const yap = (pts, S, col = M.gYosun) => { const m = [], l = [];
    for (const p of pts) { if (r() < .7) m.push([p[0] - S * .25, p[1] - S * .32]); if (r() < .22) l.push([p[0] - S * .55, p[1] - S * .65]); }
    return blobs(T(col, -.3), pts, S * 2) + blobs(col, m, S * 1.4) + blobs(T(col, .26), l, S * .6); };
  // kurumuş dal: ekran uzayında dallanan çizgiler (D[0] gövde … D[3] ince uç)
  const dal = (x, y, a, L, k, D, kmax = 3) => { const x2 = x + Math.cos(a) * L, y2 = y + Math.sin(a) * L; D[k] += `M${f1(x)} ${f1(y)}L${f1(x2)} ${f1(y2)}`;
    if (k < kmax) { const n = k ? 2 : 3; for (let i = 0; i < n; i++) dal(x2, y2, a + (i - (n - 1) / 2) * (.62 + r() * .3) + (r() - .5) * .3, L * (.5 + r() * .22), k + 1, D, kmax); } };
  const dalBas = (D, s = 1) => D.map((d, k) => d ? ln(T(M.gAhsapK, k * .05), d, f1([2.8, 1.5, .9, .6][k] * s)) : '').join('');
  // kuru ağaç (bahçede, avluda)

  /* ---------- kimlik: hepsi tohumdan ---------- */
  const kat = Math.max(1, Math.min(3, Math.round(opt.kat || 2))), az = kat === 3 || b.w * b.d > 30;      // az: büyük evde doku seyrek
  const s0 = pick(['siva', 'siva', 'siva', 'tas', 'tas', 'himis', 'himis']), stil = ['siva', 'tas', 'himis'].includes(opt.stil) ? opt.stil : s0;
  // kirli sıva ve kepenk paletleri: orta tonda, soluk, birbiriyle uyumlu (grim kipi koyulaştırır)
  const SIVA0 = opt.renk || pick(['#ab9f8a', '#a39784', '#b0a690', '#b8946a', '#a8987c', '#98a088', '#a88a78', M.gSiva]);
  const KEP = pick(['#4a4f48', '#503c34', '#3e4450', M.gAhsapK, '#56493a', '#4a3a3e', '#44463e']);
  const tahta = stil === 'himis' && ch(.4), SIVA = SIVA0;
  const TAS = stil === 'tas' ? pick([M.gTasK, M.gTasK, M.gKara, '#66625c', '#726c64']) : pick([M.gTasK, M.gKara, '#6a655e']);
  const zemTas = stil !== 'siva', ZC = zemTas ? TAS : SIVA, UST = stil === 'tas' ? TAS : tahta ? M.gAhsap : SIVA;
  const CER = stil === 'tas' ? M.gDemir : M.gAhsapK, SOVE = stil === 'tas' ? M.gTasA : null;
  const KAPI = ch(.12) ? M.gKanK : pick([M.gAhsapK, M.gAhsapK, '#4a3626', M.gAhsap]);
  const CATI = pick([M.gCatiK, M.gCatiK, '#4c5058', '#52545a', '#4a4e58', M.gCati]);
  const ov = stil === 'siva' ? .2 : stil === 'tas' ? .16 : .28;
  const g = kat === 1 ? 1.22 : stil === 'tas' ? 1.18 : 1.14, up = 1.08, zOf = i => i ? g + (i - 1) * up : 0;
  const pit = stil === 'tas' ? rr(.9, 1.1) : rr(1.1, 1.4);
  // ışık: ~%35 evde aday pencerelerden (yüksek, küçük) yalnız biri yanar
  const ri = K.rng(((opt.seed || 7) * 104729 + 34) | 0), yanan = ri() < .35 ? Math.floor(ri() * 3) : -1; let aday = 0;      // ayrı tohum: biçimden bağımsız

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
    kan = { d: Hd > 4.6 ? Math.min(2.3, Hd - rr(3.4, 4)) : rr(1.1, 1.45), u0: s < 0 ? mu0 : mu1 - ww, u1: s < 0 ? mu0 + ww : mu1, s, nk: kat === 3 && ch(.45) ? 2 : 1, cati: kat === 1 ? 'sv' : pick(['gv', 'gv', 'sv']), h0: kat === 1 ? .84 : 0 }; }
  if (!kan && Hd > 4.6) v1 = v0 + rr(4, 4.5);                                    // derin parsel: öne avlu kalır
  const mv1 = kan ? v1 - kan.d : v1, avlu = D - v1;
  // çıkmalar: kat başına öne (jf) ve yana (jsd) taşma; taş evde çıkma yok
  const j1 = stil === 'himis' ? rr(.16, .26) : stil === 'siva' ? rr(.1, .16) : 0, sj = j1 && !(ek && ek.s > 0) && ch(.6) ? j1 * .8 : 0, j2 = j1 && ch(.5) ? .1 : 0;
  const jf = [0], jsd = [0]; for (let i = 1; i < kat; i++) { jf.push(j1 + (i > 1 ? j2 : 0)); jsd.push(sj ? sj + (i > 1 ? j2 : 0) : 0); }
  // çatı biçimi: 'u' mahya cepheye koşut · 'v' cepheye dik (sokağa bakan sivri alınlık) · 'k' kırma
  const t0 = r(); let rt = stil === 'tas' ? (t0 < .18 ? 'k' : t0 < .5 ? 'u' : 'v') : (t0 < .48 ? 'v' : t0 < .88 ? 'u' : 'k'); if (rt === 'v' && Hw + (jsd[kat - 1] || 0) > 4.3) rt = 'u';
  // duvara yaslı yan baca: kalkan duvarı boyunca zeminden mahyanın üstüne
  const yb = rt === 'u' && !(ek && ek.s > 0) && !sj && ch(kat === 1 ? .6 : .42) ? { v: (v0 + mv1 + jf[kat - 1]) / 2 + rr(-.3, .3), w: rr(.62, .74) } : null;

  /* ---------- pencere ---------- */
  // o: frame · kind 'seg'|'point' · sove · shut (kepenk) · sill:false · bars (yatay kayıt) · kafes (kurşunlu baklava) · demir (parmaklık)
  //    lit: true | false | 'aday' (yalnız seçilen aday yanar). Kepengi kapalı pencere hiç yanmaz.
  const kanat = (f, a, c, w, h, col, ly) => { const [ux, uy, vx, vy] = vec(f), q = w - .06; fil(f, ly, col, rc(f, a, c, w, h));
    let s = `M${f.P(a + .03, c + h * .25)}`; for (let i = 0; i < 3; i++) s += `l${f1(ux * q)} ${f1(uy * q)}` + (i < 2 ? `m${f1(-ux * q + vx * h * .25)} ${f1(-uy * q + vy * h * .25)}` : ''); str(f, ly + 1.9, col, s, .7, -.22); };
  const pen = (f, a, c, w, h, o = {}) => { const fr = o.frame || CER, fw = .05, k = o.kind, ia = a + fw, ib = c + fw, iw = w - 2 * fw, ih = h - 2 * fw;
    const sh = (x, y, ww, hh) => k ? f.shapeD(k, x, y, ww, hh) : rc(f, x, y, ww, hh), top = k ? ib + ih - Math.min(iw * (k === 'point' ? .62 : .22), ih) * .9 : ib + ih;
    if (o.sove) fil(f, 3, o.sove, sh(a - .07, c - .02, w + .14, h + .1) + rc(f, a - .1, c - .08, w + .2, .07), .04);
    fil(f, 4, fr, sh(a, c, w, h) + (o.sill !== false && !o.sove ? rc(f, a - .05, c - .06, w + .1, .06) : ''));
    if (o.shut && !k && ch(.24)) { kanat(f, ia, ib, iw / 2 - .012, ih, o.shut, 5); kanat(f, ia + iw / 2 + .012, ib, iw / 2 - .012, ih, o.shut, 5); return; }   // kepengi kapalı
    const lit = o.lit === true || (o.lit === 'aday' && aday++ === yanan);
    fil(f, 5, lit ? M.gCamI : M.gCam, sh(ia, ib, iw, ih), lit ? 0 : -.04);
    fil(f, 5.5, lit ? MUMY : M.gCam, `M${f.P(ia, top)} ${f.P(ia + iw * .5, top)} ${f.P(ia, top - ih * .34)}Z`, lit ? 0 : .16);
    let d = `M${f.P(ia + iw / 2, ib)} ${f.P(ia + iw / 2, top)}`; const nb = o.bars || (h > .62 ? 2 : 1); for (let i = 1; i <= nb; i++) { const y = ib + (top - ib) * i / (nb + 1); d += `M${f.P(ia, y)} ${f.P(ia + iw, y)}`; }
    if (k) d += `M${f.P(ia, top)} ${f.P(ia + iw, top)}`;
    if (o.kafes) { const n = Math.max(3, Math.round(iw / .1)), hh = Math.max(.1, (top - ib) / Math.max(2, Math.round((top - ib) / .13))); for (let y = ib; y < top - .02; y += hh) { let z1 = 'M', z2 = 'M';
      for (let i = 0; i <= n; i++) { z1 += f.P(ia + iw * i / n, Math.min(top, y + (i % 2 ? hh : 0))) + ' '; z2 += f.P(ia + iw * i / n, Math.min(top, y + (i % 2 ? 0 : hh))) + ' '; } d += z1 + z2; } }
    str(f, 6, fr, d, o.kafes ? .6 : .8);
    if (o.demir) { let p = ''; for (let i = 1; i < 4; i++) p += `M${f.P(ia + iw * i / 4, ib - .02)} ${f.P(ia + iw * i / 4, top)}`; str(f, 6.3, M.gDemir, p + `M${f.P(ia, ib + (top - ib) * .5)} ${f.P(ia + iw, ib + (top - ib) * .5)}`, 1.1); }
    if (o.shut) { const q = w * .46, hh = k ? top - c + fw : h; kanat(f, a - q - .015, c, q, hh, o.shut, 4.2); kanat(f, a + w + .015, c, q, hh, o.shut, 4.2); }
    if (lit) { const p = f.q(a + w / 2, c + h * .5); f.put(9, 'Nl', `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="10" opacity=".45" fill="url(#${K.glowId()})"/>`, 'raw'); }
    else if (o.is && ch(.4)) fil(f, 2.4, f.mc, `M${f.P(a + .05, c - .07)} ${f.P(a + w - .05, c - .07)} ${f.P(a + w * .62, Math.max(o.is, c - .62))} ${f.P(a + w * .36, Math.max(o.is, c - .55))}Z`, -.1);   // yağmur ve is izi
  };
  const spec = (i, cati) => stil === 'siva' ? (i ? { w: .42, h: cati ? .6 : .72, b: cati ? .3 : .24, o: { shut: KEP } } : { w: .46, h: .62, b: .4, o: { shut: KEP } })
    : stil === 'tas' ? (i ? { w: .36, h: cati ? .7 : .84, b: .18, o: { kind: 'point', sove: SOVE, kafes: true, sill: false } } : { w: .36, h: .7, b: .4, o: { kind: 'point', sove: SOVE, demir: true, sill: false } })
      : (i ? { w: .46, h: cati ? .58 : .66, b: .24, o: { kind: ch(.3) ? 'point' : 0 } } : { w: .38, h: .52, b: .46, o: { kind: 'seg', sove: M.gTasA, shut: KEP, sill: false } });
  const eksen = (lo, hi, p) => { const n = Math.max(1, Math.min(4, Math.floor((hi - lo - .15) / p))), a = []; for (let i = 0; i < n; i++) a.push(lo + (hi - lo) * (i + .5) / n); return a; };

  /* ---------- blok: kat kat kutular ---------- */
  const blok = (c0, d0, c1, d1, nk, o = {}) => { const L = [], vb = o.vb || (() => d0), zz = i => o.h0 && i ? o.h0 : zOf(i);
    for (let i = 0; i < nk; i++) L.push({ bx: box(c0, vb(i), zz(i), c1 + (o.js ? o.js[i] : 0), d1 + (o.jf ? o.jf[i] : 0), zz(i + 1), i ? UST : ZC, { T: null }), zb: 0, h: zz(i + 1) - zz(i), i });
    return L; };

  /* ---------- cephe: doku + pencereler ---------- */
  let kanBez = ch(.22);                                                           // tek vurgu: pencereden sarkan yırtık kan kırmızısı bez
  // kara çatkı: pencere kenarlarında dikmeler, kuşaklar; uçlarda payanda, pencere aralarında çapraz
  const catki = (f, h, cs, s, P) => { const ps = [.04, f.w - .04], b0 = s.b, br = [];
    cs.forEach(c => ps.push(P(c, s.w) - .07, P(c, s.w) + s.w + .07)); ps.sort((p, q) => p - q); const n = ps.length;
    if (ps[1] - ps[0] > .3) br.push([.04, b0, Math.min(ps[1], .5), .1]); if (ps[n - 1] - ps[n - 2] > .3) br.push([f.w - .04, b0, Math.max(ps[n - 2], f.w - .5), .1]);
    for (let j = 2; j < n - 2; j += 2) if (ps[j + 1] - ps[j] > .34) br.push([ps[j], b0, ps[j + 1], b0 + s.h], [ps[j + 1], b0, ps[j], b0 + s.h]);
    f.timber({ col: M.gAhsapK, posts: ps, rails: [.04, b0 - .03, b0 + s.h + .05, h - .03], braces: br, wid: 2.2 }); };
  const cephe = (L, yz, ax, o = {}) => { const nk = L.length;
    for (const lv of L) { const bx = lv.bx, f = bx[yz], i = lv.i, top = i === nk - 1, s = o.alcak ? { w: .36, h: .34, b: .3, o: { bars: 1, shut: stil === 'siva' ? KEP : null } } : spec(i, top && nk === 3), P = (c, w) => (yz === 'F' ? bx.fa : bx.sa)(c - w / 2, w);
      const cs = (!i && o.ax0 ? o.ax0 : ax).filter(c => !(o.ban && o.ban(i, c)) && !(o.seyrek && r() < o.seyrek));
      if (!i && zemTas) f.courses({ rh: .26, bw: .6, dens: az ? .34 : .46 }).stones(yz === 'F' ? (az ? 3 : 5) : (az ? 2 : 3), { rh: .26 }).band(0, .22, T(ZC, -.18), 0);
      else if (!i) f.band(0, .24, M.gKara, .02).band(.24, .32, SIVA, -.07);       // kara taş su basman, üstünde kir
      else if (stil === 'tas') f.courses({ rh: .26, bw: .6, dens: az ? .3 : .4 }).band(0, .08, M.gTasA, .02);        // taş katlar + kat silmesi
      if (i && stil !== 'tas') f.band(0, .09, M.gAhsapK, 0, 3);                   // çıkma kirişi
      if (top) f.rect(0, lv.h - .16, f.w, .16, f.mc, 2, -.18);                    // saçak gölgesi
      else f.shadeTop(.2, -.15);
      if (i && tahta) f.planks({ dir: 'v', step: .14, dt: -.18 });
      if (stil !== 'tas' && i) catki(f, lv.h, cs, s, P);
      for (const c of cs) { const e = Object.assign({ frame: CER, lit: top || o.alcak ? 'aday' : false, is: .05 }, s.o), a = P(c, s.w), bb = s.b;
        if (o.alcak) e.lit = false;
        pen(f, a, bb, s.w, s.h, e);
        if (i && yz === 'F' && kanBez && ch(.45)) { kanBez = false; const w = s.w;      // yırtık bez: pencere altından sarkar
          f.poly([[a + .04, bb - .02], [a + w - .04, bb - .02], [a + w - .04, bb - .34], [a + w * .78, bb - .44], [a + w * .6, bb - .3], [a + w * .38, bb - .48], [a + .04, bb - .32]], M.gKan, 7)
            .rect(a + .04, bb - .1, w - .08, .04, M.gKanK, 7.1); }
      }
    } };
  // köşe taşları: dişli tek çokgen
  const kose = (f, zt, sol, sag, col = M.gTasA) => { for (const left of [true, false]) { if (!(left ? sol : sag)) continue; const e = left ? 0 : f.w, pts = [[e, .02]]; let z = .02;
    for (let k = 0; z < zt - .26; z += .22, k++) { const a = left ? (k % 2 ? .12 : .21) : f.w - (k % 2 ? .12 : .21); pts.push([a, z], [a, z + .22]); } pts.push([e, z]); f.poly(pts, col, 2.4, .02); } };

  /* ---------- çatı: arduvaz ---------- */
  // ince yatay sıralar, şaşırtmalı derzler, tek tük kırık/açık arduvaz, saçağa yakın yosun öbekleri
  const arduvaz = (f, st = .2) => { const w = f.w, h = f.h, s = f.shape, n = s ? s.length : 0, eL = c => s ? s[n - 1][0] * c / h : 0, eR = c => s ? w - (w - s[2][0]) * c / h : w; let dk = '', tk = '', pl = '', pd = '';
    for (let c = st, k = 0; c < h - .05; c += st, k++) { dk += f.seg(0, c, w, c); for (let a = (k % 2 ? .2 : .04) + r() * .2; a < w - .05; a += rr(.3, .55)) if (r() < (az ? .2 : .28)) tk += f.seg(a, c - st + .03, a, c); }
    f.put(2.5, 'Ln ' + ks(f.c(f.mc, -.34)), dk, 'stroke-width=".9"').put(2.6, 'Ln ' + ks(f.c(f.mc, -.26)), tk, 'stroke-width=".7"');
    const np = Math.round(w * h * (az ? .22 : .32)) + 1;
    for (let i = 0; i < np; i++) { const ww = rr(.16, .34), hh = st - .03, c = st * Math.floor(r() * Math.max(1, h / st - 1)) + .015, a = r() * Math.max(.1, w - ww);
      if (a < eL(c + hh) + .03 || a + ww > eR(c + hh) - .03) continue; const d = rc(f, a, c, ww, hh); if (r() < .45) pl += d; else pd += d; }
    f.put(2.2, kf(f.c(f.mc, .1)), pl).put(2.2, kf(f.c(f.mc, -.18)), pd);
    const ym = []; for (let i = 0; i < Math.round(w * 1.1); i++) { const c = rr(.04, Math.min(h * .4, .9)), a = rr(.1, w - .1); if (a < eL(c) + .12 || a > eR(c) - .12) continue; ym.push(f.q(a, c, .02)); if (r() < .5) ym.push(f.q(a + rr(.06, .14), c + rr(-.04, .04), .02)); }
    if (ym.length) f.put(2.8, 'Ln ' + ks(f.c(M.gYosun, -.12)), noktalar(ym), 'stroke-width="3.2"').put(2.85, 'Ln ' + ks(f.c(M.gYosun, .12)), noktalar(ym.filter((_, i) => i % 2).map(p => [p[0] - .8, p[1] - .9])), 'stroke-width="1.5"');
    f.poly([[0, 0], [w, 0], [eR(.1), .1], [eL(.1), .1]], f.mc, 2.3, -.14); };
  // mahyada demir sivri uç
  const sivri = (u, v, z) => { const p = sp(u, v, z + .3); it([u - .05, v - .05, z, u + .05, v + .05, z + .46], ln(M.gDemir, `M${P3(u, v, z - .03)} ${P3(u, v, z + .46)}M${f1(p[0] - 2.4)} ${f1(p[1])}h4.8`, 1.3) + pth(M.gDemir, `M${f1(p[0])} ${f1(p[1] - 5.6)}l1.3 2.4l-1.3 2.4l-1.3 -2.4z`)); };
  // alınlık: taşta sıralar, ahşapta kara çatkı; tek küçük sivri pencere (aday)
  const alinlik = (G, half, rise, pen0) => { if (stil === 'tas') G.courses({ rh: .26, dens: .4 });
    else G.timber({ col: M.gAhsapK, posts: [half - .26, half + .26], rails: [.04, rise * .62], braces: [[.12, .06, half - .26, rise * .5], [half * 2 - .12, .06, half + .26, rise * .5]], wid: 2 });
    if (pen0) pen(G, half - .14, rise * .16, .28, Math.min(.56, rise * .4), { kind: 'point', sove: SOVE, sill: false, bars: 1, lit: pen0 === 'yok' ? false : 'aday' }); };
  const catiYap = (c0, d0, c1, d1, z, tip, wall, o = ov) => {
    if (tip === 'k') { const h = Math.min(c1 - c0, d1 - d0) / 2 + o, rise = Math.max(.9, Math.min(1.45, h * .72)); const hp = sw('hip', c0 - o, d0 - o, c1 + o, d1 + o, z, rise, CATI, { tex: false }); arduvaz(hp.L); arduvaz(hp.R);
      const um = (c0 + c1) / 2, vm = (d0 + d1) / 2; if (c1 - c0 >= d1 - d0) { sivri(c0 - o + h, vm, z + rise); sivri(c1 + o - h, vm, z + rise); } else { sivri(um, d0 - o + h, z + rise); sivri(um, d1 + o - h, z + rise); }
      return { z: (u, v) => z + rise * Math.min(1, Math.min(u - c0 + o, c1 + o - u, v - d0 + o, d1 + o - v) / h), rise, tip, top: z + rise }; }
    const av = tip === 'v', half = (av ? c1 - c0 : d1 - d0) / 2, mid = av ? (c0 + c1) / 2 : (d0 + d1) / 2, rise = Math.max(.9, Math.min(kat === 3 ? 1.35 : 1.6, half * .86));
    const gb = sw('gable', c0, d0, c1, d1, z, rise, CATI, { axis: AX(av ? 'v' : 'u'), ov: o, wall, tex: false }), G = gb.G; arduvaz(gb.A); if (gb.B) arduvaz(gb.B);
    alinlik(G, half, rise, !(yb && !av) && rise > .85);
    const zr = z + rise; if (av) { sivri(mid, d1 + o, zr); sivri(mid, d0 - o, zr); } else { sivri(c0 - o, mid, zr); sivri(c1 + o, mid, zr); }
    return { z: (u, v) => z + rise * (1 - Math.abs((av ? u : v) - mid) / half), rise, tip, mid, half, top: zr }; };
  const baca = (c, d, ct, hh, o = {}) => { const w = o.w || .34, cz = ct.z, z0 = Math.min(cz(c - w / 2, d - w / 2), cz(c + w / 2, d + w / 2), cz(c - w / 2, d + w / 2), cz(c + w / 2, d - w / 2)) - .03, p = X(c, d), h = hh + cz(c, d) - z0;
    const mat = stil === 'siva' ? pick([TAS, M.gKara]) : TAS, k = b.chimney(p[0], p[1], z0, h, { mat, w, cap: T(mat, -.24), smoke: !!o.smoke, s: .75 });
    k.L.courses({ rh: .2, bw: .3, dens: .3 }); ustte(k, ct.top);
    return z0 + h + .09; };

  /* ---------- cumba ve balkon ---------- */
  const payanda = (yz, c0, c1, w, j, z) => { const n = Math.max(2, Math.round((c1 - c0) / .75)); let d = '';
    for (let k = 0; k < n; k++) { const c = c0 + .1 + (c1 - c0 - .2) * k / (n - 1); d += yz === 'F' ? `M${P3(c, w, z - .38)} ${P3(c, w + j - .02, z - .03)}` : `M${P3(w, c, z - .38)} ${P3(w + j - .02, c, z - .03)}`; }
    it(yz === 'F' ? [c0, w, z - .38, c1, w + j, z] : [w, c0, z - .38, w + j, c1, z], ln(T(M.gAhsapK, (yz === 'F') === Lm ? .06 : -.12), d, 2)); };
  const cumba = (lv, c, w, h, out, rows, catili) => { const bx = lv.bx, ahs = stil !== 'siva' || ch(.5), mat = ahs ? M.gAhsap : SIVA;
    const k = wrap(b.bay(bx.F, bx.fa(c - w / 2, w), lv.zb + .03, w, h, { out, mat })), n = w > 1.12 ? 3 : 2, ww = n === 3 ? .24 : .3, e = { frame: M.gAhsapK, kafes: true, sill: false }, gp = (k.F.w - n * ww) / (n + 1);
    for (let q = 0; q < rows; q++) { for (let i = 0; i < n; i++) pen(k.F, gp + i * (ww + gp), .2 + q * up, ww, .52, Object.assign({ lit: 'aday' }, e)); pen(k.S, (out - .2) / 2, .2 + q * up, .2, .52, Object.assign({ lit: false }, e));
      if (q) { k.F.band(up - .05, .08, M.gAhsapK, 0, 3); k.S.band(up - .05, .08, M.gAhsapK, 0, 3); } }
    for (const f of [k.F, k.S]) { if (ahs) f.planks({ step: .13, dt: -.18 }); f.band(0, .08, M.gAhsapK, 0, 3).band(h - .06, .06, M.gAhsapK, 0, 3); }
    if (catili) arduvaz(shed(k.u0 - .07, bx.v1, k.u1 + .07, k.v1 + .1, k.z1, k.z1 + .3, 'v', CATI, { tex: false }).A, .14);
    return k; };
  const balkon = (lv, c, w, o = {}) => { const bx = lv.bx, f = bx.F, zb = lv.zb + (o.b === undefined ? .07 : o.b), out = o.out || rr(.3, .38), z = bx.z0 + zb, vw = bx.v1, dm = stil === 'tas';
    pen(f, bx.fa(c - .25, .5), zb, .5, .84, { frame: M.gAhsapK, kind: dm ? 'point' : 0, sove: SOVE, shut: stil === 'himis' || dm ? null : KEP, sill: false, bars: 2, lit: false });
    b.balcony(f, bx.fa(c - w / 2, w), zb, w, { out, col: dm ? M.gDemir : M.gAhsapK, slab: dm ? TAS : M.gAhsap });
    if (!o.destek) it([c - w / 2, vw, z - .34, c + w / 2, vw + out, z - .07], ln(dm ? M.gDemir : M.gAhsapK, `M${P3(c - w / 2 + .1, vw, z - .34)} ${P3(c - w / 2 + .1, vw + out - .04, z - .07)}M${P3(c + w / 2 - .1, vw, z - .34)} ${P3(c + w / 2 - .1, vw + out - .04, z - .07)}`, 1.6));
    if (kanBez && ch(.6)) { kanBez = false; const n = Lm ? [0, 1, 0] : [1, 0, 0], q = (a, a1, z0, z1, z2) => [X(c - w * .3 + a, vw + out + .02, z + z0), X(c - w * .3 + a1, vw + out + .02, z + z0), X(c - w * .3 + a1, vw + out + .02, z + z1), X(c - w * .3 + (a + a1) / 2, vw + out + .02, z + z2), X(c - w * .3 + a, vw + out + .02, z + z1 + .06)];
      b.poly3(q(0, .42, .34, -.18, -.28), M.gKan, { n }); } };

  /* ---------- sarmaşık: yüzün önünde ayrı parça (çıkmaların üstünden de tırmanır) ---------- */
  // yz 'F'|'S' · s kök konumu · c0..c1 tepede yayıldığı aralık · pl(z): o yükseklikteki duvar düzlemi · kuru: yapraksız kurumuş dallar
  const asma = (yz, s, c0, c1, top, drop, pl, kuru) => { const pt = (c, z) => yz === 'F' ? sp(c, pl(z) + .05, z) : sp(pl(z) + .05, c, z), q = (c, z) => { const p = pt(c, z); return f1(p[0]) + ' ' + f1(p[1]); }, pts = [], n = Math.max(3, Math.round(Math.abs(c1 - c0) * 3.2));
    let st = `M${q(s, 0)}`; for (let z = .3; z < top; z += .3) st += ` ${q(s + Math.sin(z * 7) * .04, z)}`; st += ` ${q(s, top)}M${q(c0, top - .03)} ${q(c1, top - .03)}`;
    const lo = Math.min(s, c0, c1) - .12, hi = Math.max(s, c0, c1) + .12, bb = yz === 'F' ? [lo, pl(0), 0, hi, pl(top) + .1, top + .1] : [pl(0), lo, 0, pl(top) + .1, hi, top + .1];
    if (kuru) { const D = ['', '', '', '']; for (let i = 0; i <= n; i++) { const p = pt(c0 + (c1 - c0) * i / n, top - .02); dal(p[0], p[1], Math.PI / 2 + (r() - .5) * .9, 6 + r() * 7, 1, D); }
      for (let z = .4; z < top - .2; z += .36) { const p = pt(s, z); dal(p[0], p[1], (r() < .5 ? -.4 : -2.7) + (r() - .5) * .5, 4 + r() * 4, 2, D); }
      it(bb, ln(T(M.gAhsapK, .04), st, 1.4) + dalBas(D, .9)); return; }
    for (let i = 0; i <= n; i++) { const c = c0 + (c1 - c0) * i / n, len = drop * (.3 + r() * .7); for (let d = -.05; d < len; d += .14) pts.push(pt(c + (r() - .5) * .12, top - d)); }
    for (let z = .25; z < top - .2; z += .24) if (r() < .55) pts.push(pt(s + (r() - .5) * .14, z));
    it(bb, ln(T(M.gAhsapK, .04), st, 1.3) + yap(pts, 2.2)); };

  /* ---------- küçük eşyalar (ekran uzayı) ---------- */
  const kup = (u, v, s = 1, c = '#6a5a4c') => at('art', u, v, 0, `<g transform="scale(${s})">` + pth(T(c, -.28), 'M-2 0Q-6.4 -6 -3 -11.4L-2.2 -13.6H2.2L3 -11.4Q6.4 -6 2 0Z') + pth(T(c, .1), 'M-2 0Q-6.4 -6 -3 -11.4L-2.2 -13.6H-.2Q-2.6 -6 -.4 0Z') + ln(T(c, -.2), 'M-3 -11q-3.4 .6 -2.8 4.4M3 -11q3.4 .6 2.8 4.4', 1) + '</g>', { r: .12 });
  const supurge = (u, v) => at('art', u, v, 0, ln(M.gAhsapA, 'M0 -3L4.4 -19', 1.2) + pth('#7a6a4a', 'M-3.4 0L-1 -5.4L2.2 -4.6L3.6 .8Z') + ln('#5a4a34', 'M-1.2 -4.6l3 .8', 1), { r: .1 });
  const sepet = (u, v, z, fill) => at('art', u, v, z, pth('#7a6440', 'M-4.6 -4.6h9.2l-1.4 4.6h-6.4z') + pth('#62502f', 'M-4.6 -4.6h9.2l-.3 1.2h-8.6z') + (fill ? pth(fill, K.ell(0, -5, 4, 1.7)) + pth(T(fill, .25), K.circ(-1.4, -5.6, 1.2) + K.circ(1.6, -5.2, 1.1)) : ''), { r: .1 });
  const kova = (u, v) => at('art', u, v, 0, pth(M.gAhsap, 'M-3 -5.4h6l-.8 5.4h-4.4z') + pth('#3a4048', K.ell(0, -5.4, 3, 1.1)) + ln(M.gDemir, 'M-3 -5.4q3 -5.6 6 0', .7), { r: .1 });
  const kediR = () => pick(['#2a2826', '#2a2826', '#4a4642', '#5a5450']);
  // duvara dayalı el merdiveni (v: duvar düzlemi)
  const merdiven = (c, v, h) => { let d = ''; for (const e of [-.11, .11]) d += `M${P3(c + e, v + .36, 0)} ${P3(c + e, v + .02, h)}`; for (let t = .16; t < .95; t += .17) d += `M${P3(c - .11, v + .36 - .34 * t, h * t)} ${P3(c + .11, v + .36 - .34 * t, h * t)}`; it([c - .13, v, 0, c + .13, v + .38, h], ln(M.gAhsapA, d, 1.3)); };
  // odun istifi
  const odun = (c, v) => { const k = box(c, v, 0, c + .72, v + .26, .4, M.gAhsap, { edge: false, cast: false }); k.F.planks({ dir: 'h', step: .1 }); const pts = []; for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) pts.push(k.S.q(.05 + i * .08, .07 + j * .12, .01)); k.S.put(5, 'Ln ' + ks(k.S.c(M.gAhsapA, .16)), noktalar(pts), 'stroke-width="3"'); };
  const cali = (u, v, s) => { const [x, y] = sp(u, v, 0), D = ['', '', '', '']; for (let i = 0; i < 4; i++) dal(x + (r() - .5) * 4 * s, y, -Math.PI / 2 + (i - 1.5) * .45, 6 * s, 1, D); it([u - .2, v - .2, 0, u + .2, v + .2, .5], dalBas(D, .9)); };

  /* =====================================================================
     KURULUŞ
     ===================================================================== */
  /* --- yan bahçe: taş duvar, kapı, kuru ağaç ya da selvi, kuyu, çamaşır --- */
  const bahce = (c0, c1, s) => { const vg = v1 - rr(0, .22), wd = c1 - c0, DUV = pick([TAS, M.gTasK, M.gKara, TAS]), hD = rr(.7, .86), p = [X(c0, v0), X(c1, v0), X(c1, vg), X(c0, vg)];
    b.gpoly(p, ZEM, { op: .85 }); b.tufts(...X(c0 + .1, vg - 1.6).slice(0, 2), ...X(c1 - .1, vg - .3).slice(0, 2), 6, { col: M.gYosun });
    const tp = [c0 + wd * rr(.4, .6), vg - rr(.75, 1.1)];
    { const q = X(...tp); if (ch(.55)) b.tree('olu', q[0], q[1], { s: wd > 1.25 ? rr(1.1, 1.4) : rr(.9, 1.1) }); else b.tree('karaselvi', q[0], q[1], { s: rr(.62, .8) }); }
    if (wd > 1.5) { if (ch(.5)) { const q = X(s > 0 ? c1 - .55 : c0 + .55, vg - rr(1.8, 2.3)); b.well(q[0], q[1], 0, { col: M.gTasK }); } else cali(s > 0 ? c1 - .4 : c0 + .4, vg - rr(1.7, 2.3), 1.2); }
    if (s > 0 && wd > .7) { const sd = box(c1 - .13, v0 + .2, 0, c1, vg - .14, .5, DUV, { edge: false }); sd.S.courses({ rh: .23, bw: .6, dens: .45 }); }
    // çamaşır ipi: soluk paçavralar
    if (wd > .95 && ch(.45)) { const vl = vg - rr(.42, .6), ua = s > 0 ? c0 - .02 : c0 + .22, ub = s > 0 ? c1 - .3 : c1 + .02, pu = s > 0 ? ub : ua;
      hat([[pu, vl, 0], [pu, vl, 1.3]], M.gAhsapK, 1.6); sw('clothes', ua, vl, ub, vl, 1.22, { cols: [M.gKul, M.gKemik, '#5a5650', M.gAhsapA] }); }
    const gc = c0 + wd * (wd > 1.3 ? rr(.35, .65) : .5), kosk = wd > 1.15 && ch(.6), gwd = kosk ? .42 : .3;
    const seg = (a, e) => { if (e - a < .08) return; const w = box(a, vg - .14, 0, e, vg, hD, DUV, { edge: false }); w.F.courses({ rh: .24, bw: .6, dens: .45 }).band(0, .14, T(DUV, -.14), 0);
      sw('slab', a - .02, vg - .17, e + .02, vg + .03, hD + .05, .05, T(DUV, -.08), { cast: false });
      if (e - a > .6 && ch(.6)) { const pts = []; for (let c = a + .1; c < e - .1; c += .14) { pts.push(sp(c + (r() - .5) * .08, vg - .07, hD + .06 + r() * .06)); if (r() < .5) pts.push(sp(c, vg + .04, hD - r() * .3)); } it([a, vg - .14, hD - .4, e, vg + .1, hD + .2], yap(pts, 1.9)); } };   // duvar üstünde yosun
    seg(c0 + .02, gc - gwd); seg(gc + gwd, c1 - .02);
    if (kosk) { const k = box(gc - .42, vg - .24, 0, gc + .42, vg + .02, 1.1, DUV, { edge: false }); k.F.courses({ rh: .24, bw: .6, dens: .45 });
      k.F.door(k.fa(gc - .25, .5), .5, .84, { kind: 'point', col: KAPI, sove: M.gTasA, double: true }); arduvaz(sw('gable', gc - .42, vg - .24, gc + .42, vg + .02, 1.1, .48, CATI, { axis: AX('u'), ov: .1, wall: DUV, tex: false }).A, .14); }
    else { const k = box(gc - .3, vg - .1, 0, gc + .3, vg - .04, hD - .06, M.gAhsapK, { edge: false, cast: false }); k.F.planks({ step: .12 }).line([[.04, .2], [.56, .2]], M.gDemir, 1, 6).line([[.04, hD - .22], [.56, hD - .22]], M.gDemir, 1, 6);
      for (const c of [gc - .36, gc + .36]) { box(c - .08, vg - .16, 0, c + .08, vg + .02, hD + .2, DUV, { edge: false, cast: false }); } }
  };
  if (gs < 0) bahce(G0, G0 + gw, -1);

  /* --- yan müştemilat (ek): alçak kiler / ahır --- */
  const ekYap = () => { const e0 = ek.u0, e1 = e0 + ek.w, d1 = mv1 - rr(.2, .7), d0 = v0 + (ch(.5) ? 0 : rr(.3, .9)), tip = ek.s > 0 && ch(.4) ? 'su' : 'sv';
    const eh = kat > 1 ? .96 : .82, EC = pick([TAS, SIVA, TAS, M.gKara]), tasE = EC !== SIVA, ex = box(e0, d0, 0, e1, d1, eh, EC, { T: null });
    for (const f of [ex.F, ex.S]) { if (tasE) f.courses({ rh: .25, bw: .6, dens: .45 }).stones(2, { rh: .25 }); else f.band(0, .2, M.gKara, .02).band(.2, .26, SIVA, -.07); f.shadeTop(.12, -.12); }
    const kc = e0 + ek.w * (ch(.5) ? .36 : .64);
    if (ch(.6)) { ex.F.door(ex.fa(kc - .24, .48), .48, Math.min(.76, eh - .12), { col: M.gAhsap, sove: tasE ? M.gTasA : M.gAhsapK, kind: 'seg' }); if (ek.w > 1.25) pen(ex.F, ex.fa(e0 + ek.w - kc + e0 - .14, .28), .42, .28, .28, { bars: 1, demir: tasE, lit: false }); }
    else pen(ex.F, ex.fa(e0 + ek.w / 2 - .2, .4), .34, .4, .38, { shut: tasE ? null : KEP, bars: 1, lit: false });
    if (d1 - d0 > 1.6) pen(ex.S, ex.sa((d0 + d1) / 2 - .18, .36), .36, .36, .34, { bars: 1, lit: false });
    let zr;
    if (tip === 'sv') { const rs = Math.min(kat > 1 ? .7 : .45, (d1 - d0) * .22); arduvaz(shed(e0 - (ek.s < 0 ? .12 : 0), d0, e1 + (ek.s > 0 ? .14 : 0), d1 + .16, eh - .05, eh + rs, 'v', CATI, { tex: false }).A, .16); zr = d => eh + rs * (1 - (d - d0) / (d1 - d0 + .16)); }
    else { arduvaz(shed(e0, d0 - .05, e1 + .16, d1 + .12, eh - .05, eh + (kat > 1 ? .5 : .36), 'u', CATI, { tex: false }).A, .16); zr = () => eh + .3; }
    if (ch(.5)) { const c = e0 + ek.w * .5, d = d0 + .35, p = X(c, d), k = b.chimney(p[0], p[1], zr(d) - .12, .82, { mat: TAS, w: .34, s: .7, cap: T(TAS, -.24), smoke: ek.s > 0 }); ustte(k, eh + .7); }
    return ex; };
  if (ek && ek.s < 0) ekYap();

  /* --- ana blok --- */
  const ana = blok(mu0, v0, mu1, mv1, kat, { jf, js: jsd });
  const axF = eksen(mu0, mu1, pit), axS = eksen(v0, mv1, pit * (Lm ? 1.4 : 1.15));
  // kapı: kanat yoksa bir eksende; kanat varsa girintide (kanat yakın yandaysa kanadın cephesinde)
  const kapiAna = !kan || kan.s < 0 || kat === 1, n0 = kan ? (kan.s < 0 ? kan.u1 : mu0) : mu0, n1 = kan ? (kan.s < 0 ? mu1 : kan.u0) : mu1, nookW = kan && kapiAna ? n1 - n0 : 0;
  const kc = !kan ? pick(axF) : kapiAna ? (nookW >= 2.3 ? (ch(.5) ? n1 - .72 : n0 + .72) : n0 + nookW / 2 + (nookW > 1.5 ? rr(-.15, .15) : 0)) : (kan.u0 + kan.u1) / 2 + (kan.u1 - kan.u0 > 1.9 ? pick([-.42, .42]) : 0);
  const kw = stil === 'tas' ? .62 : .56, kh = stil === 'tas' ? 1.02 : .96, kb = .1, yakin = .82;
  let feat = null;
  if (kat > 1) { const t = r(), tip = stil === 'tas' ? (t < .45 ? 'cumba' : t < .58 ? 'balkon' : 0) : stil === 'siva' ? (t < .36 ? 'cumba' : t < .54 ? 'balkon' : 0) : (t < .45 ? 'cumba' : t < .62 ? 'balkon' : 0);
    const uy = axF.filter(c => !(kan && c > kan.u0 - .35 && c < kan.u1 + .35)), spc = (mu1 - mu0) / axF.length, ust = r();
    if (tip && uy.length) feat = { tip, c: pick(uy), w: Math.min(spc - .12, rr(1, 1.3)), ust: kat === 3 ? (tip === 'cumba' ? (ust < .35 ? 'iki' : ust < .7 ? 'balkon' : '') : (ust < .5 ? 'iki' : '')) : '' }; }
  const kanC = kan ? (kan.u0 + kan.u1) / 2 : 0;
  const banF = (i, c) => (kan && c > kan.u0 - .3 && c < kan.u1 + .3 && i <= kan.nk)
    || (!i && kapiAna && Math.abs(c - kc) < yakin) || (feat && i && (i === 1 || feat.ust) && Math.abs(c - feat.c) < feat.w / 2 + .32);
  const banS = (i, c) => (ek && ek.s > 0 && !i) || (yb && Math.abs(c - yb.v) < yb.w / 2 + .3);
  const ax0 = nookW ? (nookW > 1.3 ? [n0 + .62, n1 - .62] : []).filter(c => Math.abs(c - kc) >= yakin) : null;
  cephe(ana, 'F', axF, { ban: banF, ax0, seyrek: axF.length > 2 ? .1 : 0 });
  cephe(ana, 'S', axS, { ban: banS, seyrek: Lm ? (az ? .3 : .2) : .08 });
  // köşe taşları: sıvalı evin zemin katında; taş evde her katta
  if (stil === 'siva') { kose(ana[0].bx.F, ana[0].h, true, true); kose(ana[0].bx.S, ana[0].h, Lm, !Lm); }
  if (stil === 'tas') ana.forEach(lv => { kose(lv.bx.F, lv.h, true, true, T(TAS, .2)); kose(lv.bx.S, lv.h, Lm, !Lm, T(TAS, .2)); });
  // sıva dökülmesi: altından kara taş görünür
  if (stil !== 'tas' && ch(.6)) { const yz = ch(.5) ? 'F' : 'S', lv = ana[stil === 'siva' ? 0 : Math.min(1, kat - 1)], f = lv.bx[yz], ax = yz === 'F' ? axF : axS, bos = (yz === 'F' ? mu1 - ax[ax.length - 1] : mv1 - ax[ax.length - 1]) - .5;
    if (bos > .5 && !tahta && !(yz === 'F' && Math.abs(kc - mu1) < 1.2) && (stil === 'siva' || lv.i)) { const a0 = (yz === 'F') === Lm ? f.w - bos : .1; f.patches(1, { col: M.gTasK, a0, a1: a0 + bos - .1, b0: .3, b1: Math.min(lv.h - .2, .95) }); } }
  // taş evde köşe payandaları: sokak cephesinin iki ucunda, kademeli
  if (stil === 'tas') { const hp = Math.min(zOf(kat) - .4, g + .5);
    for (const [u0p, u1p] of [[mu0 + .02, mu0 + .26], [mu1 - .26, mu1 - .02]]) { if (kan && u1p > kan.u0 - .1 && u0p < kan.u1 + .1) continue; if (Math.abs((u0p + u1p) / 2 - kc) < kw / 2 + .3) continue;
      const p1 = box(u0p, mv1, 0, u1p, mv1 + .24, hp * .55, TAS, { edge: false }); p1.F.courses({ rh: .22, bw: .3, dens: .5 });
      const p2 = box(u0p + .02, mv1, hp * .55, u1p - .02, mv1 + .14, hp, TAS, { edge: false, T: T(TAS, .12) }); p2.F.courses({ rh: .22, bw: .3, dens: .4 });
      shed(u0p, mv1 + .14, u1p, mv1 + .26, hp * .55, hp * .55 + .14, 'v', M.gTasA, { tex: false, cast: false }); } }
  // çıkma payandaları
  for (let i = 1; i < kat; i++) { const d = jf[i] - jf[i - 1]; if (d > .05) { const c0 = kan && i <= kan.nk ? (kan.s < 0 ? kan.u1 : mu0) : mu0, c1 = kan && i <= kan.nk ? (kan.s < 0 ? mu1 : kan.u0) : mu1; payanda('F', c0 + .02, c1 + (c1 === mu1 ? jsd[i] : 0) - .02, mv1 + jf[i - 1], d, zOf(i)); }
    const e = jsd[i] - jsd[i - 1]; if (e > .05) payanda('S', v0 + .3, mv1 + jf[i] - .04, mu1 + jsd[i - 1], e, zOf(i)); }
  // cumba / balkon
  if (feat) { const l1 = ana[1], out = rr(.32, .42);
    if (feat.tip === 'cumba') { const bal = feat.ust === 'balkon', iki = feat.ust === 'iki';
      cumba(l1, feat.c, feat.w, bal ? up - .03 : iki ? 2 * up - .2 : up - .2, out, iki ? 2 : 1, !bal);
      if (bal) balkon(ana[2], feat.c, feat.w, { b: .07, out: out - (jf[2] - jf[1]), destek: true }); }
    else { balkon(l1, feat.c, feat.w); if (feat.ust === 'iki') balkon(ana[2], feat.c, feat.w, { out: .3 }); } }
  // çatı
  const tb = ana[kat - 1].bx, tw = tb.u1 - tb.u0, td = tb.v1 - tb.v0;
  const ct = catiYap(tb.u0, tb.v0, tb.u1, tb.v1, tb.z1, rt, kat === 1 ? ZC : UST);
  // bacalar: yüksek taş bacalar, mahyanın üstüne ya da öne bakan yamaca
  let bc = -9;
  { const n = (yb ? 0 : 1) + (kat > 1 && ch(.5) ? 1 : 0), yan = ch(.5) ? 1 : -1;
    for (let k = 0; k < n; k++) { const s = k ? -yan : yan, c = rt === 'v' ? ct.mid + (k ? rr(.35, .6) : rr(-.08, .12)) : tb.u0 + tw * (.5 + s * rr(.2, .34)), d = rt === 'v' ? tb.v0 + td * (k ? rr(.55, .7) : rr(.25, .45)) : rt === 'u' ? ct.mid + (k ? rr(.35, .6) : rr(-.1, .1)) : tb.v0 + td * .5 + (k ? rr(.3, .5) : rr(-.2, .1));
      const zt = baca(c, d, ct, k ? rr(.55, .7) : rr(.75, 1.05), { smoke: !k && ch(.6), w: k ? .3 : .36 }); if (!k || rt !== 'v') bc = c; if (!k && ch(.3)) kuzgun(c, d, zt); } }
  if (ch(.25) && rt !== 'k') { const t = rr(.2, .8); rt === 'u' ? kuzgun(tb.u0 + tw * t, ct.mid, ct.top) : kuzgun(ct.mid, tb.v0 + td * t, ct.top); }
  // çatı pencereleri: öne bakan yamaçta dik beşik çatılı çıkıntılar
  if (rt === 'u' && tw > 2.4 && ch(kat === 3 ? .45 : .7)) { const nd = tw > 3.6 && ch(.5) ? 2 : 1;
    for (let q = 0; q < nd; q++) { let c = tb.u0 + tw * (nd === 2 ? (q ? rr(.66, .76) : rr(.24, .34)) : rr(.3, .7)); if (Math.abs(c - bc) < .7) c = bc + (bc > tb.u0 + tw / 2 ? -.85 : .85); if (c < tb.u0 + .45 || c > tb.u1 - .45) continue;
      const vf = tb.v1 - rr(.14, .3), zb = ct.z(c, vf), hh = .5, zt = zb + hh, vb = vf - hh * ct.half / ct.rise - .04, w2 = .3, wc = stil === 'tas' ? TAS : stil === 'himis' ? M.gAhsap : SIVA;
      const k = ustte(box(c - w2, vf - .05, zb - .04, c + w2, vf, zt, wc, { edge: false, cast: false, T: null }), ct.top); pen(k.F, .15, .08, .3, .36, { kind: 'point', frame: M.gAhsapK, sill: false, bars: 1, lit: 'aday' });
      const qq = [X(c + w2, vf, zb - .04), X(c + w2, vf, zt), X(c + w2, vb, zt)]; b.poly3(qq, wc, { n: Lm ? [1, 0, 0] : [0, 1, 0], bb: BB([c - w2, vb, ct.top, c + w2, vf, ct.top + .02]) });
      sw('gable', c - w2, vb, c + w2, vf, zt, .38, CATI, { axis: AX('v'), ov: .07, wall: wc, tex: false, cast: false }); yukari(son(), ct.top);
      it([c - .03, vf + .05, ct.top + .02, c + .03, vf + .09, ct.top + .1], ln(M.gDemir, `M${P3(c, vf + .07, zt + .36)} ${P3(c, vf + .07, zt + .6)}`, 1.1)); } }
  // yan baca gövdesi
  if (yb) { const ust = ct.z(mu1 - .01, yb.v) + rr(.7, .9), mat = TAS, zo = Math.min(zOf(1) - .1, ust - 1.2), h2 = yb.w / 2;
    const k1 = box(mu1, yb.v - h2, 0, mu1 + .27, yb.v + h2, zo, mat, { edge: false }), k2 = box(mu1, yb.v - h2 + .12, zo, mu1 + .21, yb.v + h2 - .12, ust, mat, { edge: false });
    k1.S.courses({ rh: .22, bw: .3, dens: .45 }); k2.S.courses({ rh: .22, bw: .3, dens: .35 });
    ustte(k2, ct.top); ustte(box(mu1 - .03, yb.v - h2 + .08, ust, mu1 + .25, yb.v + h2 - .08, ust + .08, T(mat, -.2), { edge: false, cast: false }), ct.top);
    const p = X(mu1 + .1, yb.v); b.fx('smoke', p[0], p[1], ust + .12, { s: .8 }); }

  /* --- ön kanat --- */
  let kanL = null;
  if (kan) { const zw = kan.h0 || zOf(kan.nk), jb = jf[kan.nk] || 0, wd = v1 - mv1;
    kanL = blok(kan.u0, mv1, kan.u1, v1, kan.nk, { vb: i => mv1 + jf[i], h0: kan.h0 });
    const axW = eksen(kan.u0, kan.u1, pit * .92), banW = (i, c) => !i && !kapiAna && Math.abs(c - kc) < yakin;
    cephe(kanL, 'F', axW.length > 1 || kapiAna ? axW : [], { ban: banW, ax0: !kapiAna ? axW.filter(c => Math.abs(c - kc) >= yakin) : null, alcak: !!kan.h0 });
    if (wd > 1.15) cephe(kanL, 'S', [mv1 + wd / 2 + .05], { alcak: !!kan.h0 });
    else kanL.forEach(lv => { const f = lv.bx.S; if (!lv.i) zemTas ? f.courses({ rh: .26, bw: .6, dens: .45 }).band(0, .22, T(ZC, -.18), 0) : f.band(0, .24, M.gKara, .02); });
    if (stil === 'siva') kose(kanL[0].bx.F, kanL[0].h, true, true);
    const wall = kan.nk > 1 ? UST : ZC;
    if (kan.cati === 'gv') { const half = (kan.u1 - kan.u0) / 2, rise = Math.min(1.25, Math.max(.8, half * .95)), gb = sw('gable', kan.u0, mv1 + jb + .14, kan.u1, v1, zw, rise, CATI, { axis: AX('v'), ov: .14, wall, tex: false });
      arduvaz(gb.A); if (gb.B) arduvaz(gb.B); alinlik(gb.G, half, rise, 'yok'); sivri(kanC, v1 + .14, zw + rise); }
    else arduvaz(shed(kan.u0 - .1, mv1 + jb, kan.u1 + .1, v1 + .15, zw - .04, Math.min(zw + Math.min(.75, wd * .45), kan.h0 ? g - .1 : 9), 'v', CATI, { tex: false }).A); }

  if (ek && ek.s > 0) ekYap();

  /* --- kapı, eşik, saçak --- */
  const kbx = kapiAna ? ana[0].bx : kanL[0].bx, vk = kbx.v1, kf_ = kbx.F, ka = kbx.fa(kc - kw / 2, kw), cikma = kapiAna ? jf[1] || 0 : 0;
  const kkind = stil === 'tas' ? 'point' : pick(['point', 'seg', 'point', 'rect']), ls = ch(.5) ? 1 : -1;
  kf_.door(ka, kw, kh, { b: kb, kind: kkind, col: KAPI, sove: stil === 'himis' ? M.gTasA : stil === 'tas' ? M.gTasA : M.gTasK, double: stil === 'tas' || ch(.25) });
  kf_.rect(ka - .16, 0, kw + .32, kb, M.gTasK, 3.2, .1);
  sw('stairs', kc - kw / 2 - .16, vk, kc + kw / 2 + .16, vk + .3, kb, 0, AX('v'), M.gTasK);
  // kapı yanında asılı kuru ot demeti ya da demir kanca
  if (ch(.3)) { const a = kbx.fa(kc - ls * (kw / 2 + .2)), pts = []; for (let c = kb + kh * .88; c > kb + kh * .52; c -= .07) pts.push(kf_.q(a + (r() - .5) * .04, c, .03));
    kf_.line([[a, kb + kh * .98], [a, kb + kh * .5]], M.gDemir, .7, 7).put(7.2, 'Ln ' + ks(pick(['#5f6448', '#6a5e44', '#5a5a46'])), noktalar(pts), 'stroke-width="2.6"'); }
  const kapiUst = !cikma ? pick(['sacak', 'sacak', 'asma', 'kuru', '']) : pick(['asma', 'kuru', '', '']);
  if (kapiUst === 'sacak') { const zt = kb + kh + .16; arduvaz(shed(kc - kw / 2 - .24, vk, kc + kw / 2 + .24, vk + .44, zt, zt + .3, 'v', CATI, { tex: false }).A, .13);
    it([kc - kw / 2 - .2, vk, zt - .34, kc + kw / 2 + .2, vk + .4, zt - .07], ln(M.gAhsapK, `M${P3(kc - kw / 2 - .15, vk, zt - .34)} ${P3(kc - kw / 2 - .15, vk + .38, zt - .08)}M${P3(kc + kw / 2 + .15, vk, zt - .34)} ${P3(kc + kw / 2 + .15, vk + .38, zt - .08)}`, 1.8)); }
  else if (kapiUst === 'asma' || kapiUst === 'kuru') { const top = Math.min(kbx.z1 - .1, kb + kh + rr(.22, .4)), sd = -ls, s = kc + sd * (kw / 2 + .2); asma('F', s, kc - sd * (kw / 2 + rr(.1, .4)), s + sd * rr(.05, .3), top, rr(.3, .5), () => vk, kapiUst === 'kuru'); }
  // büyük sarmaşık (yosun yeşili) ya da kurumuş dallar: boş bir köşede yukarı tırmanır
  if (ch(.55)) { const yz = ch(.5) ? 'F' : 'S', pl = yz === 'F' ? z => mv1 + (z >= g ? jf[Math.min(kat - 1, 1 + Math.floor((z - g) / up))] || 0 : 0) : z => mu1 + (z >= g ? jsd[Math.min(kat - 1, 1 + Math.floor((z - g) / up))] || 0 : 0);
    const top = Math.min(zOf(kat) - .2, rr(1.3, 2.4)), uygun = yz === 'S' ? !(ek && ek.s > 0) && !(yb && yb.v > mv1 - 1) : !(kan && kan.s > 0) && Math.abs(mu1 - kc) > 1;
    if (uygun) { const s = yz === 'F' ? mu1 - .1 : mv1 - .12; asma(yz, s, s - rr(.25, .6), s + .04, top, rr(.5, .9), pl, ch(.3)); } }

  /* --- ön avlu (derin parselde): kurumuş çardak ya da demir çitli bahçe --- */
  let golge = null;                                                              // çardağın kapladığı u aralığı
  if (avlu >= 1.05) { const sol = kc - .45 - (mu0 + .1), sag = mu1 - .1 - (kc + .45), t = r(), va = v1 + .18, vq = D - .22;
    if (t < .4 && Math.max(sol, sag) >= 1.1) { const wd = Math.min(2.1, Math.max(sol, sag)), c0 = sol > sag ? kc - .45 - wd : kc + .45, c1 = c0 + wd, vb = Math.min(D - .3, va + 1.4), h = 1.02, D2 = ['', '', '', ''];
      golge = [c0, c1];
      b.gpoly([X(c0 - .05, va - .1), X(c1 + .05, va - .1), X(c1 + .05, vb + .1), X(c0 - .05, vb + .1)], ZEM, { op: .6 });
      for (const [c, v] of [[c0, va], [c1, va], [c0, vb], [c1, vb]]) hat([[c, v, 0], [c, v, h]], M.gAhsapK, 1.8);
      let d = `M${P3(c0 - .1, va, h)} ${P3(c1 + .1, va, h)}M${P3(c0 - .1, vb, h)} ${P3(c1 + .1, vb, h)}`; const n = Math.max(3, Math.round(wd / .42)); for (let i = 0; i <= n; i++) { const c = c0 + wd * i / n; if (i % 3 !== 1) d += `M${P3(c, va - .12, h + .03)} ${P3(c, vb + .12, h + .03)}`; }   // kırık mertekler
      for (let i = 0; i < 7; i++) { const p = sp(c0 + wd * r(), va + (vb - va) * r(), h + .05); dal(p[0], p[1], (r() < .5 ? 0 : Math.PI) + (r() - .5) * 1.4, 7 + r() * 8, 1, D2); }
      it([c0 - .1, va - .12, h, c1 + .1, vb + .12, h + .2], ln(M.gAhsap, d, 1.5) + dalBas(D2));
      hat([[c0 + .06, va, 0], [c0 + .1, va, h * .5], [c0 + .04, va, h]], M.gAhsapK, 1.3);       // kurumuş asmanın gövdesi
      const cm = (c0 + c1) / 2; at('bench', cm, vb - .16, 0, Lm ? 'x' : 'y', { l: Math.min(1, wd - .5), col: M.gAhsap });
      if (ch(.5)) at('fig', cm + rr(-.25, .25), vb - .16, .22, { body: pick([M.gAhsapK, '#3e4048', M.gMor]), legs: '#2a2624', hat: 'ortu', hatCol: pick(['#3a3a40', M.gAhsapK]), robe: true, shadow: false });
      else kuzgun(c1 + .1, va, h + .02); }
    else if (t < .88) { const cit = pick(['demir', 'duvar', 'demir', 'cit']);                              // çitli ön bahçe
      for (const [a, e] of [[mu0 + .04, kc - .4], [kc + .4, mu1 - .04]]) { if (e - a < .3) continue;
        b.gpoly([X(a, v1 + .5), X(e, v1 + .5), X(e, vq - .1), X(a, vq - .1)], ZEM, { op: .8 });
        if (cit === 'demir' || cit === 'cit') b.fence([X(a, vq).slice(0, 2), X(e, vq).slice(0, 2)], cit === 'demir' ? .52 : .42, { col: cit === 'demir' ? M.gDemir : M.gAhsapK });
        else { const w = box(a, vq - .13, 0, e, vq, .34, TAS, { edge: false, cast: false }); w.F.courses({ rh: .15, bw: .5, dens: .45 }); }
        if (e - a > .8) { const c = a + (e - a) * rr(.3, .7), v = v1 + .5 + (vq - v1 - .8) * rr(.3, .8); if (ch(.45)) { const p = X(c, v); b.tree('karaselvi', p[0], p[1], { s: rr(.5, .66) }); } else if (ch(.5)) { const p = X(c, v); b.tree('olu', p[0], p[1], { s: rr(.7, .9) }); } else cali(c, v, 1.3);
          b.tufts(...X(a + .1, v1 + .6).slice(0, 2), ...X(e - .1, vq - .2).slice(0, 2), 5, { col: M.gYosun }); } }
      for (const c of [kc - .4, kc + .4]) { box(c - .07, vq - .15, 0, c + .07, vq + .01, .62, cit === 'duvar' ? TAS : cit === 'demir' ? M.gTasK : M.gAhsapK, { edge: false, cast: false }); } } }

  /* --- sokak önü: eşyalar, insan, kedi --- */
  const vf = c => kan && c > kan.u0 - .1 && c < kan.u1 + .1 ? v1 : mv1 + 0, esya = ['kup', 'bank', 'supurge', 'sandik', 'fici', 'sepet', 'merdiven', 'odun', 'fici', 'kup', 'cali'];
  for (let i = esya.length - 1; i > 0; i--) { const k = Math.floor(r() * (i + 1)), t = esya[i]; esya[i] = esya[k]; esya[k] = t; }
  for (let c = mu0 + rr(.22, .45); c < mu1 - .15; c += rr(.55, .95)) { if (Math.abs(c - kc) < kw / 2 + .32 || ch(.3)) continue; if (kan && Math.abs(c - (kan.s < 0 ? kan.u1 : kan.u0)) < .2) continue; if (stil === 'tas' && (c < mu0 + .35 || c > mu1 - .35)) continue;
    const t = golge && c > golge[0] - .3 && c < golge[1] + .3 ? 'kup' : esya.pop(), v = vf(c) + .17;
    if (t === 'bank') { if (c + .7 > mu1 || Math.abs(c + .35 - kc) < kw / 2 + .7) continue; at('bench', c + .35, v + .02, 0, Lm ? 'x' : 'y', { l: .7, col: M.gAhsap }); if (ch(.5)) { const p = X(c + .2, v + .02); b.critter('kedi', p[0], p[1], .22, { col: kediR() }); } c += .5; }
    else if (t === 'kup') { kup(c, v + .03, 1.05, pick(['#6a5a4c', '#5e564e', '#70604e'])); if (ch(.5)) kup(c + .24, v + .1, .75); }
    else if (t === 'supurge') { supurge(c, v - .06); kova(c + .26, v + .08); }
    else if (t === 'sandik') { at('crate', c, v + .08, 0, .36, { col: M.gAhsap, fill: pick(['#5a5440', '#4e4a44', '#6a5a3e']), cast: false }); if (ch(.4)) sepet(c + .32, v + .1, 0, M.gKemik); }
    else if (t === 'fici') at('barrel', c, v + .08, 0, { col: M.gAhsap, top: M.gAhsapK, r: .17, h: .42, cast: false });
    else if (t === 'sepet') { sepet(c, v + .05, 0, pick(['#5e6448', '#6a5a3e', null])); if (ch(.4)) { const p = X(c + .3, v + .1); b.critter('kedi', p[0], p[1], 0, { col: kediR(), flip: ch(.5) }); } }
    else if (t === 'merdiven') { if (Math.abs(c - kc) < kw / 2 + .6) continue; merdiven(c, v - .17, rr(1.15, 1.5)); }
    else if (t === 'odun') { if (c + .75 > mu1 || Math.abs(c + .36 - kc) < kw / 2 + .7) continue; odun(c, v - .14); c += .55; }
    else cali(c + .1, v + .1, 1); }
  // insan: kukuletalı tek bir figür ya da kara kedi
  const pu = kc + (kc - mu0 > mu1 - kc ? -1 : 1) * rr(.5, .8), pv = vk + Math.min(yard - .12, rr(.42, .6)) + (avlu > 1 ? .3 : 0), kim = r();
  if (kim < .4) at('fig', pu, pv, 0, { body: pick([M.gAhsapK, '#3e4048', M.gMor, '#4a4238']), legs: '#2a2624', robe: true, hat: 'ortu', hatCol: pick(['#3a3a40', M.gAhsapK, '#4a4238']), carry: pick(['sepet', 'kova', undefined]), flip: ch(.5) });
  else if (kim > .78) { const p = X(pu, pv); b.critter('kedi', p[0], p[1], 0, { col: kediR(), flip: ch(.5) }); }
  b.gpoly([X(kc - kw / 2 - .2, vk), X(kc + kw / 2 + .2, vk), X(kc + kw / 2 + .34, D), X(kc - kw / 2 - .34, D)], YOL, { op: .6 });

  if (gs > 0) bahce(G1, G1 + gw, 1);
  b.tag(...X(W / 2, D - .1, 0)).doorAt(...X(kc, vk + .5).slice(0, 2));
});
