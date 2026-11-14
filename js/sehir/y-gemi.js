/* Derinsu — oyuncunun beş gemisi (limanda bağlı durur; hangisi alındıysa o çizilir).
   Sandal "Martı" → Tirhandil "Yakamoz" → Gulet "Lodos" → Trol teknesi "Poyraz" → Kalyon "Derin Ejder".

   Tekne koordinatı: s kıçtan başa, t omurgadan bordaya (+t bize bakan borda), z su hattından yukarı.
   opt.dir 'x' (baş +x'e; +y bordası aydınlık) | 'y' (baş +y'ye; +x bordası gölgede): aynı çizim R.g ile ızgaraya eşlenir,
   bütün yüzler gerçek normaliyle tonlanır. opt.deniz: önizlemede parselin altına su serer (oyunda kullanılmaz).
   opt.fx: flamalar durağan çizilmek yerine b.fx('flag') ile verilir (tekne öğelerinde fx çizen bir kabuk için). */
(function () {
  'use strict';
  const K = CK, M = K.M, T = K.tone, pth = K.pth, ln = K.ln, f1 = K.f1;
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const BEZ = '#efe4c8', HALAT = '#4a3a2c', DIREK = '#9a6a3c';

  // istasyonlar [s, yarı en, şiyer yüksekliği, su hattı kayması] arasında s'ye göre Hermite ara değer
  const spline = st => s => {
    let i = 0; while (i < st.length - 2 && s > st[i + 1][0]) i++;
    const a = st[i], c = st[i + 1], p = st[i - 1] || a, n = st[i + 2] || c, h = c[0] - a[0], u = Math.max(0, Math.min(1, (s - a[0]) / h)), u2 = u * u, u3 = u2 * u;
    return [1, 2, 3].map(k => { const ak = a[k] || 0, ck = c[k] || 0, m0 = (ck - (p[k] || 0)) / (c[0] - p[0]) * h, m1 = ((n[k] || 0) - ak) / (n[0] - a[0]) * h;
      return (2 * u3 - 3 * u2 + 1) * ak + (u3 - 2 * u2 + u) * m0 + (3 * u2 - 2 * u3) * ck + (u3 - u2) * m1; });
  };

  /* çizim yığını: katman katman boyanır, katman içinde aynı renk tek <path> olur */
  class Yigin {
    constructor(R) { this.R = R; this.ls = [new Map()]; this.k = 0; }
    nl() { this.ls.push(new Map()); return this; }
    add(k, d) { const m = this.ls[this.ls.length - 1]; m.set(k, (m.get(k) || '') + d); return this; }
    D(pts) { return 'M' + K.PL(pts.map(p => this.R.g(p[0], p[1], p[2]))); }
    fl(pts, col) { return this.add('f' + K.kf(col), this.D(pts) + 'Z'); }                       // hazır renk
    poly(pts, col, dt = 0) { return this.fl(pts, this.R.tint(pts, col, dt)); }                 // gerçek normale göre tonlanır
    line(pts, col, w = 1, op = '') { return this.add('l' + K.ks(col) + '|' + w + '|' + op, this.D(pts)); }
    raw(s) { return this.add('r' + (this.k++), s); }                                           // metin ya da metin üreten işlev
    svg() { let s = ''; for (const m of this.ls) for (const [k, d] of m) {
      if (k[0] === 'f') s += `<path class="${k.slice(1)}" d="${d}"/>`;
      else if (k[0] === 'l') { const [c, w, op] = k.slice(1).split('|'); s += `<path class="Ln ${c}" stroke-width="${w}"${op ? ` opacity="${op}"` : ''} d="${d}"/>`; }
      else s += typeof d === 'function' ? d() : d; } return s; }
    put(bb, o) { this.R.b.item(this.R.bb(...bb), () => this.svg(), Object.assign({ cast: false }, o)); return this; }
  }

  /* tekne kurucu: L boy, B en; parselde ortalanır */
  function tekne(b, opt, L, B, kay = 0) {
    const dy = opt.dir === 'y'; if (dy) { const w = b.w; b.w = b.d; b.d = w; }
    const ms = ((dy ? b.d : b.w) - L) / 2 + kay, c = (dy ? b.w : b.d) / 2;
    if (opt.deniz) b.pave(-.7, -.7, b.w + .7, b.d + .7, M.su);
    const R = { b, dy, L, B,
      g: (s, t, z = 0) => dy ? [t + c, s + ms, z] : [s + ms, t + c, z],
      v: n => dy ? [n[1], n[0], n[2]] : n,
      bb: (s0, t0, z0, s1, t1, z1) => dy ? [t0 + c, s0 + ms, z0, t1 + c, s1 + ms, z1] : [s0 + ms, t0 + c, z0, s1 + ms, t1 + c, z1],
      q: (s, t, z) => K.pr(...R.g(s, t, z)),
      Q: p => { const q = R.q(p[0], p[1], p[2]); return f1(q[0]) + ' ' + f1(q[1]); },
      yig: () => new Yigin(R),
      // dörtgenin (ya da üçgenin) kameraya bakan normaline göre renk
      tint(pts, col, dt = 0) { const g = pts.map(p => R.g(p[0], p[1], p[2])); let n = K.unit(g.length > 3 ? cross(sub(g[2], g[0]), sub(g[3], g[1])) : cross(sub(g[1], g[0]), sub(g[2], g[0])));
        if (K.dot(n, K.VIEW) < 0) n = n.map(v => -v); return T(col, K.toneOf(n) + dt); },
      // ekran uzayı çizim (y yönünde ayna)
      art(s, t, z, svg, o = {}) { const p = R.g(s, t, z); b.art(p[0], p[1], p[2], dy ? `<g transform="scale(-1 1)">${svg}</g>` : svg, Object.assign({}, o, o.bb ? { bb: R.bb(...o.bb) } : {})); return R; },
      l3(pts, col, w, o) { b.line3(pts.map(p => R.g(p[0], p[1], p[2])), col, w, o); return R; },
      fig(s, t, z, o = {}) { const p = R.g(s, t, z); b.fig(p[0], p[1], p[2], Object.assign({ flip: dy, shadow: false }, o)); return R; },
      cyl(s, t, r, z0, z1, col, o) { const p = R.g(s, t, 0); return b.cyl(p[0], p[1], r, z0, z1, col, Object.assign({ cast: false }, o)); },
      // kutu: side = bize bakan borda yüzü, end = başa bakan yüz; a(so, w) / e(to, w): yüz üzerinde kıçtan / uzak kenardan ölçü
      box(s0, t0, z0, s1, t1, z1, col, o = {}) { const oo = Object.assign({ edge: false, cast: false }, o); if (o.side) oo[dy ? 'R' : 'L'] = o.side; if (o.end) oo[dy ? 'L' : 'R'] = o.end;
        const bx = dy ? b.box(t0 + c, s0 + ms, z0, t1 + c, s1 + ms, z1, col, oo) : b.box(s0 + ms, t0 + c, z0, s1 + ms, t1 + c, z1, col, oo), len = s1 - s0, wid = t1 - t0;
        return { side: dy ? bx.R : bx.L, end: dy ? bx.L : bx.R, T: bx.T, a: (so, w = 0) => dy ? len - so - w : so, e: (to, w = 0) => dy ? to : wid - to - w }; },
      // serbest düşey yüz: (s0,t0)→(s1,t1) boyunca; a = 0 başlangıç ucunda
      face(s0, t0, s1, t1, z0, h) { const l = Math.hypot(s1 - s0, t1 - t0), u = [(s1 - s0) / l, (t1 - t0) / l, 0]; return new K.Face(R.g(s0, t0, z0), R.v(u), [0, 0, 1], l, h, R.v([-u[1], u[0], 0])); },
      // direk: koyu gövde + sol yanında ışık çizgisi
      mast(s, t, z0, z1, w, col = DIREK) { const a = R.q(s, t, z0), e = R.q(s, t, z1);
        b.item(R.bb(s - .04, t - .04, z0, s + .04, t + .04, z1), ln(T(col, -.3), `M${f1(a[0])} ${f1(a[1])}L${f1(e[0])} ${f1(e[1])}`, w) + ln(T(col, .22), `M${f1(a[0] - w * .24)} ${f1(a[1])}L${f1(e[0] - w * .24)} ${f1(e[1])}`, f1(w * .36)), { cast: false }); return R; },
      // sarılı yelken: seren boyunca krem rulo + bağlar; üstüne seren çizgisi
      furl(p0, p1, w, o = {}) { const a = R.q(...p0), e = R.q(...p1), col = o.col || BEZ, in0 = o.in === undefined ? .1 : o.in, X = k => a[0] + (e[0] - a[0]) * k, Y = k => a[1] + (e[1] - a[1]) * k, dn = o.dn === undefined ? w * .5 : o.dn;
        let s = ln(T(col, -.3), `M${f1(X(in0))} ${f1(Y(in0) + dn + w * .22)}L${f1(X(1 - in0))} ${f1(Y(1 - in0) + dn + w * .22)}`, w)
          + ln(col, `M${f1(X(in0))} ${f1(Y(in0) + dn - w * .12)}L${f1(X(1 - in0))} ${f1(Y(1 - in0) + dn - w * .12)}`, f1(w * .74))
          + ln(T(col, .3), `M${f1(X(in0 + .04))} ${f1(Y(in0 + .04) + dn - w * .34)}L${f1(X(1 - in0 - .04))} ${f1(Y(1 - in0 - .04) + dn - w * .34)}`, f1(w * .2));
        let ties = ''; const n = o.n || Math.max(3, Math.round(Math.hypot(e[0] - a[0], e[1] - a[1]) / 9)); for (let i = 0; i < n; i++) { const k = in0 + .04 + (1 - 2 * in0 - .08) * i / (n - 1); ties += `M${f1(X(k))} ${f1(Y(k) + dn - w * .6)}v${f1(w * 1.3)}`; }
        s += ln(o.tie || T(col, -.5), ties, .9) + (o.spar === false ? '' : ln(o.spar || T(DIREK, -.25), `M${f1(a[0])} ${f1(a[1])}L${f1(e[0])} ${f1(e[1])}`, o.sw || 1.6));
        const ps = [p0, p1]; b.item(o.bb ? R.bb(...o.bb) : R.bb(Math.min(p0[0], p1[0]) - .03, Math.min(p0[1], p1[1]) - .03, Math.min(p0[2], p1[2]) - .12, Math.max(p0[0], p1[0]) + .03, Math.max(p0[1], p1[1]) + .03, Math.max(p0[2], p1[2])), s, { cast: false }); return R; },
    };
    // halat takımı: çizgiler tek öğede
    R.ip = (lines, col, w, bb, op) => { const y = R.yig(); for (const l of lines) y.line(l, col, w, op); y.put(bb); return R; };
    // fener: küçük gövde + gece hâlesi (z = fenerin tabanı)
    R.fener = (s, t, z, o = {}) => { const k = o.k || 1, n = v => f1(v * k);
      return R.art(s, t, z, pth(M.demir, `M${n(-2.3)} ${n(-6.2)}h${n(4.6)}l${n(-2.3)} ${n(-2.2)}zM${n(-2)} ${n(-.9)}h${n(4)}v${n(.9)}h${n(-4)}z`) + pth('#ffe9b0>#fff1c2', `M${n(-1.6)} ${n(-6.2)}h${n(3.2)}v${n(5.3)}h${n(-3.2)}z`)
        + `<circle class="Nl" cx="0" cy="${n(-3.4)}" r="${o.r || 14}" fill="url(#${K.glowId()})"/>`, { bb: o.bb || [s - .06, t - .06, z, s + .06, t + .06, z + .28 * k] }); };
    // flama: tekne öğesi fx çizmediği için durağan çizilir; opt.fx verilirse canlı
    R.flama = (s, t, z, col, sc = 1, emblem) => { const p = R.g(s, t, z), o = { col, s: sc, emblem };
      if (opt.fx) b.fx('flag', p[0], p[1], p[2], o); else b.art(p[0], p[1], p[2], K.fxArt.flag(o), { bb: [p[0] - .03, p[1] - .03, p[2] - .34 * sc, p[0] + .03, p[1] + .03, p[2]] }); return R; };
    R.crate = (s, t, z, sz, o = {}) => { const p = R.g(s, t, z); b.crate(p[0], p[1], z, sz, Object.assign({ cast: false }, o)); return R; };
    // bodoslama / dışarı taşan direk: ön bordadan sonra çizilsin diye enine geniş kutu
    R.stem = (pts, col, w) => { const y = R.yig(), ss = pts.map(p => p[0]), zs = pts.map(p => p[2]); y.line(pts, col, w); y.put([Math.min(...ss) - .03, -B / 2, Math.min(...zs), Math.max(...ss) + .03, B / 2 + .06, Math.max(...zs)]); return R; };

    /* gövde: istasyonlardan örülür.
       sp: st istasyonlar · wf su hattı en oranı · step örnek adımı · dk [[s0,s1,z,renk]] güverteler (alabanda içi açık teknede döşek)
           up [[s0,s1,zTepe,renk]] şiyer üstü borda (kasara) · bd kuşak sınırları (≥0: sudan, <0: şiyerden aşağı) · cols kuşak renkleri · sm kuşak içi kaplama çizgisi sayısı
           rail küpeşte rengi · inn iç renk · bulk bölme rengi · tb kasara içe yatması */
    R.hull = sp => {
      const ev = spline(sp.st), wf = sp.wf || .74, rw = sp.rw || .05, dk = sp.dk, up = sp.up || [], tb = sp.tb || 0, bd = sp.bd, cols = sp.cols, sm = sp.sm || [];
      const n = Math.round(L / (sp.step || .2)), ss = []; for (let i = 0; i <= n; i++) ss.push(L * i / n);
      const snap = v => { if (v <= 1e-6 || v >= L - 1e-6) return; let k = 1; for (let i = 1; i < n; i++) if (Math.abs(ss[i] - v) < Math.abs(ss[k] - v)) k = i; ss[k] = v; };
      for (const d of dk) { snap(d[0]); snap(d[1]); } for (const u of up) { snap(u[0]); snap(u[1]); }
      const E = ss.map(s => { const e = ev(s); e[0] = Math.max(0, e[0]); return e; }), N = n, mid = j => (ss[j] + ss[j + 1]) / 2;
      const sec = (s, e, z, sg, off) => { const [hb, zs, ds] = e; if (z > zs) return [s, sg * Math.max(0, hb - (z - zs) * tb + off), z]; const k = 1 - Math.max(0, z / zs); return [s + ds * k, sg * Math.max(0, hb * (1 - (1 - wf) * k * k) + off), z]; };
      const pt = (i, z, sg = 1, off = 0) => sec(ss[i], E[i], z, sg, off), sur = (s, z, sg = 1, off = 0) => sec(s, ev(s), z, sg, off);
      const upOf = [], dkOf = []; for (let j = 0; j < N; j++) { const m = mid(j); upOf.push(up.find(u => m > u[0] && m < u[1]) || null); dkOf.push(Math.max(0, dk.findIndex(d => m > d[0] && m < d[1]))); }
      const uz = (u, s) => typeof u[2] === 'function' ? u[2](s) : u[2];
      const topAt = (j, i) => upOf[j] ? uz(upOf[j], ss[i]) : E[i][1];
      const top = s => { const u = up.find(q => s >= q[0] && s <= q[1]); return u ? uz(u, s) : ev(s)[1]; };
      const vis = (j, sg) => (-(E[j + 1][0] - E[j][0]) + sg * (ss[j + 1] - ss[j])) > 1e-4;
      const zb = (k, i) => { const zs = E[i][1]; let z = 0; for (let q = 1; q <= k; q++) z = Math.max(z, q >= bd.length ? zs : bd[q] >= 0 ? Math.min(bd[q], zs) : zs + bd[q]); return Math.min(z, zs); };
      // ardışık parçaları aynı tonda birleştirerek şerit boya
      const strip = (bat, js, lo, hi, col, dt = 0) => { let c0 = null, A = [], Z = []; const flush = () => { if (A.length) bat.fl(A.concat(Z.reverse()), c0); A = []; Z = []; }, same = (p, q) => Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]) + Math.abs(p[2] - q[2]) < 1e-6;
        for (const j of js) { const q = [lo(j, j), lo(j, j + 1), hi(j, j + 1), hi(j, j)], cl = R.tint(q, col, dt);
          if (cl !== c0 || !A.length || !same(A[A.length - 1], q[0]) || !same(Z[Z.length - 1], q[3])) { flush(); c0 = cl; A.push(q[0]); Z.push(q[3]); } A.push(q[1]); Z.push(q[2]); } flush(); };
      const runs = f => { const o = []; let cur = null; for (let j = 0; j < N; j++) { if (f(j)) { if (!cur) o.push(cur = []); cur.push(j); } else cur = null; } return o; };
      const hbMax = Math.max(...E.map(e => e[0])), zMax = Math.max(...E.map((e, i) => Math.max(e[1], i < N ? topAt(i, i) : 0, i ? topAt(i - 1, i) : 0)));

      /* --- arka: iç bordalar, güverteler, bölmeler, uzak küpeşte (güverte parçası başına bir öğe) --- */
      const D = dk.map((d, di) => { const bat = R.yig(), js = []; for (let j = 0; j < N; j++) if (dkOf[j] === di) js.push(j); const ja = js[0], jb = js[js.length - 1], z = d[2];
        for (const sg of [-1, 1]) for (const run of runs(j => dkOf[j] === di && !vis(j, sg) && topAt(j, j) - z > .02))
          strip(bat, run, (j, i) => pt(i, z, sg, -.03), (j, i) => pt(i, topAt(j, i), sg, -rw), sp.inn, -.05);
        bat.nl();
        const zH = di ? dk[di - 1][2] : (E[0][0] > .04 ? topAt(0, 0) : 0);
        if (zH > z + .02) bat.poly([pt(ja, z, -1, -.03), pt(ja, z, 1, -.03), pt(ja, zH, 1, -.03), pt(ja, zH, -1, -.03)], di ? (sp.bulk || sp.inn) : sp.inn, di ? 0 : -.03);
        const fa = [], ne = []; for (let i = ja; i <= jb + 1; i++) { fa.push(pt(i, z, -1, -.03)); ne.push(pt(i, z, 1, -.03)); }
        bat.poly(fa.concat(ne.reverse()), d[3]); bat.nl();
        const st = sp.plank || .13, cl = T(d[3], K.toneOf([0, 0, 1]) - .15); for (let k = -Math.floor(hbMax / st); k * st < hbMax; k++) { const t = (k + .5) * st; let a = -1; for (let i = ja; i <= jb + 2; i++) { const inn = i <= jb + 1 && Math.abs(pt(i, z, 1, -.03)[1]) > Math.abs(t) + .01;
          if (inn && a < 0) a = i; if (!inn && a >= 0) { if (i - 1 > a) bat.line([[pt(a, z)[0], t, z], [pt(i - 1, z)[0], t, z]], cl, .6); a = -1; } } }
        bat.nl(); strip(bat, js, (j, i) => pt(i, topAt(j, i), -1, -rw), (j, i) => pt(i, topAt(j, i), -1), upOf[ja] && upOf[ja][4] || sp.rail);
        bat.nl(); bat.put([ss[ja], -hbMax - .1, 0, ss[jb + 1], hbMax - .02, z]); return bat; });

      /* --- ön: görünen dış borda (kuşaklar, kaplama çizgileri, kasara), yakın küpeşte --- */
      const F = R.yig(), F1 = [], F2 = [];
      for (const sg of [-1, 1]) for (const run of runs(j => vis(j, sg))) {
        const a = run[0], e = run[run.length - 1], lo = [], hi = []; for (const j of run) { if (j === a) lo.push(pt(j, 0, sg)); lo.push(pt(j + 1, 0, sg)); hi.push(pt(j, topAt(j, j), sg), pt(j + 1, topAt(j, j + 1), sg)); }
        F.fl(lo.concat(hi.reverse()), R.tint([pt(a, 0, sg), pt(e + 1, 0, sg), pt(e + 1, E[e + 1][1], sg), pt(a, E[a][1], sg)], cols[1], -.06));
        F1.push(() => { for (let k = 0; k < cols.length; k++) strip(F, run, (j, i) => pt(i, zb(k, i), sg), (j, i) => pt(i, zb(k + 1, i), sg), cols[k]);
          const ur = run.filter(j => upOf[j]); for (const u of up) strip(F, ur.filter(j => upOf[j] === u), (j, i) => pt(i, E[i][1], sg), (j, i) => pt(i, topAt(j, i), sg), u[3]); });
        F2.push(() => { for (let k = 1; k <= cols.length; k++) { if (k < cols.length) F.line(run.map(j => pt(j, zb(k, j), sg)).concat([pt(e + 1, zb(k, e + 1), sg)]), T(cols[k - 1], -.5), .7, .5);
          for (let q = 1; q <= (sm[k - 1] || 0); q++) { const f = q / (sm[k - 1] + 1), zz = i => zb(k - 1, i) + (zb(k, i) - zb(k - 1, i)) * f; F.line(run.map(j => pt(j, zz(j), sg)).concat([pt(e + 1, zz(e + 1), sg)]), T(cols[k - 1], -.34), .6, .55); } } });
      }
      F.nl(); F1.forEach(f => f()); F.nl(); F2.forEach(f => f()); F.nl();
      const all = []; for (let j = 0; j < N; j++) all.push(j);
      for (const u of [null].concat(up)) strip(F, all.filter(j => upOf[j] === u), (j, i) => pt(i, topAt(j, i), 1, -rw), (j, i) => pt(i, topAt(j, i), 1), u && u[4] || sp.rail);
      F.nl();

      /* --- su: gövdenin oturduğu koyuluk, borda yansıması, köpük çizgisi, hareler --- */
      const GP = p => K.P(...R.g(p[0], p[1], p[2])), near = E.map((e, i) => pt(i, 0, 1)), far = E.map((e, i) => pt(i, 0, -1)).reverse(), r = b.r;
      const shd = p => { const g = R.g(p[0] + (p[0] - L / 2) * .05, p[1] * 1.22 + Math.sign(p[1]) * .05, 0); return K.P(g[0] + K.SH[0] * .16, g[1] + K.SH[1] * .16, 0); };
      let gs = pth('#1c5672', 'M' + near.concat(far).map(shd).join(' ') + 'Z', 'opacity=".4"');
      const vr = runs(j => vis(j, 1))[0] || [], rf = vr.map(j => pt(j, 0, 1)).concat(vr.slice().reverse().map((j, q) => { const p = pt(j, topAt(j, j), 1); return [p[0], p[1], -p[2] * (.5 + (q % 2) * .06)]; }));
      if (rf.length > 2) gs += pth(T(cols[1], -.45), 'M' + rf.map(GP).join(' ') + 'Z', 'opacity=".2"');
      gs += ln(M.kopuk, 'M' + near.map(p => GP([p[0], p[1] + .015, 0])).join(' '), 1, 'opacity=".6"');
      let rp = ''; for (let i = 0, nr = Math.round(L * 2.4); i < nr; i++) { const s = -.25 + r() * (L + .5), sg = r() < .74 ? 1 : -1, w = .14 + r() * .2, t = sg * (ev(Math.max(0, Math.min(L, s)))[0] * wf + .13 + r() * .3);
        rp += `M${GP([s - w, t - sg * .025, 0])}Q${GP([s, t + sg * .03, 0])} ${GP([s + w, t - sg * .025, 0])}`; }
      b.ground(gs + ln(M.suA, rp, 1, 'opacity=".75"'));

      const H = { F, D, pt, sur, ev, top, ss, E, N, hbMax, zMax, vis,
        // dış bordaya oturan dörtgen (lombar, ağ, levha): s..s+w, z..z+h
        patch: (s, z, w, h, sg = 1, off = .012) => [sur(s, z, sg, off), sur(s + w, z, sg, off), sur(s + w, z + h, sg, off), sur(s, z + h, sg, off)],
        // ön öğeyi sıraya koy: güverte üstü her şeyden sonra çağrılır
        front() { const pts = []; for (let i = 0; i <= N; i += 2) for (const sg of [-1, 1]) pts.push(R.g(...pt(i, 0, sg)), R.g(...pt(i, Math.max(E[i][1], i < N ? topAt(i, i) : 0), sg)));
          F.put([0, hbMax - .02, 0, L, hbMax + .04, zMax], { cast: true, pts }); return H; } };
      return H;
    };
    return R;
  }

  /* =========================================================
     1 — SANDAL "MARTI": açık kürekli kayık. Kürekler ıskarmozda, kıçta olta, kovada yem, bordada kuruyan ağ; başta bir martı.
     ========================================================= */
  CK.def('gemi-marti', { w: 2.9, d: 1.5, name: 'Sandal “Martı”' }, (b, K, opt) => {
    const R = tekne(b, opt, 2.3, .9), AK = '#c9a26b', IC = '#c2925a';
    const H = R.hull({ st: [[0, .3, .36, .09], [.3, .39, .32, .05], [.9, .45, .28], [1.5, .43, .29], [1.95, .3, .34, -.03], [2.2, .12, .4, -.08], [2.3, 0, .44, -.14]],
      wf: .68, step: .115, dk: [[0, 2.3, .07, '#b08656']], bd: [0, .1, -.085], cols: ['#3d7f8c', '#f4ecd9', AK], sm: [0, 1, 0], rail: '#9a6c3c', inn: IC, plank: .1, rw: .04 });
    const B0 = H.D[0];
    // posta (kaburga) çizgileri
    for (let i = 2; i < H.N - 2; i += 2) B0.line([H.pt(i, .07, -1, -.035), H.pt(i, H.E[i][1], -1, -.045)], T(IC, -.3), .8, .7);
    B0.nl();
    // kıç oturağı, iki kürekçi oturağı, baş üçgeni
    const seat = (s0, s1, z) => { const e0 = H.sur(s0, z, 1, -.04)[1], e1 = H.sur(s1, z, 1, -.04)[1];
      B0.poly([[s1, -e1, z - .035], [s1, e1, z - .035], [s1, e1, z], [s1, -e1, z]], '#a87a48').poly([[s0, -e0, z], [s1, -e1, z], [s1, e1, z], [s0, e0, z]], '#d2a56c'); };
    seat(.02, .3, .22); seat(.72, .9, .2); seat(1.3, 1.47, .2);
    B0.poly([[1.98, -H.sur(1.98, .3, 1, -.04)[1], .3], [1.98, H.sur(1.98, .3, 1, -.04)[1], .3], [2.26, 0, .38]], '#d2a56c');
    // kıç oturağında ağ yığını, döşekte kova
    R.art(.17, -.1, .22, pth('#5f6a4a', 'M-6 0q0 -5 5 -5.6q5 .2 6 5.6z') + pth('#8a9468', 'M-4 -1.4q1 -3 4 -3.2q2 0 3 1.6q-3 -1 -7 1.6z') + pth('#d9a04a', K.circ(-3, -1, 1) + K.circ(1.6, -3.6, .9) + K.circ(4, -.6, 1)), { bb: [.05, -.25, .22, .3, .05, .4] });
    R.cyl(1.08, -.17, .075, .07, .22, '#4f7fa8', { top: '#2f4f6a' });
    // kürekler: ıskarmozdan dışarı, pala arkaya
    const oar = (sg) => { const a = [1.3, sg * .1, .3], m = [1.12, sg * .44, .315], e = [.52, sg * 1.02, sg > 0 ? .2 : .44], d = sub(e, m), u = K.unit(d), q = k => [m[0] + d[0] * k, m[1] + d[1] * k, m[2] + d[2] * k];
      const y = R.yig(); y.line([a, q(.7)], '#b98a52', 1.5).line([a, q(.1)], '#7a5430', 1.6).poly([q(.66), [q(.7)[0] + u[1] * .05, q(.7)[1] - u[0] * .05, q(.7)[2] + .03], [e[0] + u[1] * .05, e[1] - u[0] * .05, e[2] + .03], [e[0] - u[1] * .05, e[1] + u[0] * .05, e[2] - .03], [q(.7)[0] - u[1] * .05, q(.7)[1] + u[0] * .05, q(.7)[2] - .03]], AK, .12);
      y.line([[m[0], m[1], m[2] - .03], [m[0], m[1], m[2] + .05]], M.demir, 1.6);
      y.put(sg > 0 ? [.5, .5, .3, 1.3, 1.05, .5] : [.5, -1.05, .32, 1.3, -.5, .5]); };
    oar(-1);
    // olta: kıçtan dışarı uzanmış kamış, misinası suda, ucunda mantar
    R.l3([[.2, -.05, .2], [-.34, .2, 1.12]], '#c9a04e', 1.1);
    R.art(-.34, .2, 1.12, ln('#f4f1ea', 'M0 0Q-1 16 -2.2 32.5', .5, 'opacity=".8"') + pth(M.kirmizi, K.circ(-2.2, 33, 1.3)) + pth('#f4f1ea', 'M-3.5 33a1.3 1.3 0 0 1 2.6 0z') + ln(M.kopuk, 'M-5.4 33.6a3.2 1.3 0 0 0 6.4 0', .6, 'opacity=".7"'), { bb: [-.4, .15, 0, -.3, .25, 1.12] });
    H.front();
    // bordada kurumaya asılmış ağ
    const net = R.yig(), np = [];
    for (let k = 0; k <= 8; k++) { const s = 1.38 + k * .06, zt = H.top(s); np.push(H.sur(s, zt - (.1 + (k % 2) * .05 + (k === 0 || k === 8 ? -.06 : 0)), 1, .015)); }
    net.fl([H.sur(1.38, H.top(1.38) + .01, 1, .015), H.sur(1.86, H.top(1.86) + .01, 1, .015)].concat(np.reverse()), '#6f7450');
    for (let k = 0; k < 5; k++) net.line([H.sur(1.42 + k * .1, H.top(1.42 + k * .1), 1, .02), H.sur(1.45 + k * .1, H.top(1.45 + k * .1) - .1, 1, .02)], '#3f4630', .5, .7);
    net.raw(pth('#d9a04a', [1.42, 1.56, 1.7, 1.83].map(s => { const q = R.q(...H.sur(s, H.top(s) + .005, 1, .02)); return K.circ(q[0], q[1], 1.1); }).join('')));
    net.put([1.36, .3, .15, 1.9, .5, .36]);
    oar(1);
    // baş bodoslaması, halkası ve suya inen bağ halatı; tepede martı
    R.l3([[2.3, 0, .4], [2.33, 0, .52]], '#7a5430', 2.2);
    R.art(2.3, 0, .36, ln(HALAT, 'M1 0Q10 10 17 14.5', .8) + ln(M.kopuk, 'M14 15a3.4 1.3 0 0 0 6.6 0', .6, 'opacity=".7"'), { bb: [2.3, -.05, 0, 2.7, .1, .36] });
    b.critter('marti', ...R.g(2.33, 0, .52), { flip: !R.dy });
    b.tag(...R.g(1.15, .7, 0));
  });

  /* =========================================================
     2 — TİRHANDİL "YAKAMOZ": iki ucu sivri Ege balıkçısı. Kısa direkte sarılı latin yelken, kıçta yeke, başta gece feneri.
     ========================================================= */
  CK.def('gemi-yakamoz', { w: 4.1, d: 1.8, name: 'Tirhandil “Yakamoz”' }, (b, K, opt) => {
    const R = tekne(b, opt, 3.4, 1.2, -.08), AK = '#4ea4f0', BY = '#f6efdf', LC = '#27507a', DZ = .3;
    const H = R.hull({ st: [[0, 0, .66, .2], [.22, .25, .54, .1], [.8, .5, .44], [1.7, .6, .41], [2.5, .52, .45], [3.05, .27, .55, -.06], [3.4, 0, .72, -.24]],
      wf: .7, step: .14, dk: [[0, 3.4, DZ, '#cfae7c']], bd: [0, .09, -.15, -.06], cols: [LC, BY, AK, LC], sm: [0, 2, 0, 0], rail: '#a8763f', inn: '#e9dcc0', plank: .12 });
    // ambar kapağı, balık kasaları
    const hk = R.box(1.02, -.25, DZ, 1.6, .25, DZ + .1, '#b08656'); hk.T.planks({ dir: 'v', step: .12 });
    R.crate(2.5, .12, DZ, .26, { fill: '#b9c7d2' }).crate(2.62, -.2, DZ, .24, { fill: '#dc9a86' });
    R.fig(.62, -.1, DZ, { body: BY, legs: LC, hat: 'hasir' });
    // direk, latin sereni ve sarılı yelken
    R.mast(2.05, 0, DZ, 2.25, 2.6);
    R.ip([[[2.05, -.02, 2.2], [1.8, -.57, .44]], [[2.05, -.02, 2.2], [2.3, -.55, .45]]], HALAT, .7, [1.8, -.6, .44, 2.3, -.05, 2.2]);
    R.furl([3.02, .06, .98], [.86, .06, 2.62], 3.6, { n: 9 });
    R.l3([[-.02, 0, .8], [.6, .1, .68]], '#7a5430', 2);
    H.front();
    R.stem([[.2, 0, .1], [.03, 0, .62], [-.03, 0, .86]], '#8a5a30', 2.6);
    R.stem([[3.17, 0, .1], [3.4, 0, .72], [3.47, 0, 1]], '#8a5a30', 3).stem([[3.45, 0, .9], [3.47, 0, 1.02]], AK, 3.2);
    R.ip([[[2.05, .02, 2.2], [3.44, 0, .98]], [[2.05, .02, 2.2], [1.8, .57, .44]], [[2.05, .02, 2.2], [2.3, .55, .45]], [[.86, .06, 2.62], [.1, 0, .72]], [[3.02, .06, .98], [3.3, 0, .68]]], HALAT, .7, [.1, 0, .44, 3.44, .6, 2.62]);
    // baş feneri: demir kol ucunda, su üstüne sarkar
    R.stem([[3.44, 0, .94], [3.62, 0, 1.2], [3.8, 0, 1.16]], M.demir, 1.2);
    R.fener(3.8, 0, .9, { r: 17, bb: [3.7, -.06, .9, 3.9, .06, 1.2] });
    b.spill(...R.g(3.85, .15, 0), 1);
    b.tag(...R.g(1.7, .9, 0));
  });


  /* =========================================================
     3 — GULET "LODOS": yuvarlak kıçlı, iki direkli Ege guleti. Bumbalarda sarılı yelkenler, cıvadra, vernikli kamara,
     kıçta çizgili güneşlik, baş güvertede narenciye sepetleri.
     ========================================================= */
  CK.def('gemi-lodos', { w: 5.8, d: 2, name: 'Gulet “Lodos”' }, (b, K, opt) => {
    const R = tekne(b, opt, 4.6, 1.4, -.3), AK = '#6fcf62', BY = '#f7f1e2', VR = '#a9683a', YS = '#2f6b4a', TK = '#d3b383', DZ = .38, KZ = .56;
    const H = R.hull({ st: [[0, .36, .82, .26], [.3, .52, .74, .12], [1, .67, .64], [2.1, .7, .55], [3.2, .62, .58], [3.95, .4, .69, -.05], [4.4, .16, .81, -.14], [4.6, 0, .9, -.3]],
      wf: .7, step: .19, dk: [[0, 1, KZ, TK], [1, 4.6, DZ, TK]], bd: [0, .09, -.2, -.07], cols: [YS, BY, AK, VR], sm: [0, 3, 0, 0], rail: '#8f5630', inn: '#e3cba4', bulk: VR, plank: .1 });
    const rl = (s, sg, o = -.02) => H.sur(s, H.top(s), sg, o), MZ = 1.1, AN = 2.66;
    // uzak borda çarmıhları
    R.ip([.92, 1.26].map(s => [[MZ, 0, 3.2], rl(s, -1)]).concat([2.46, 2.68, 2.9].map(s => [[AN, 0, 3.3], rl(s, -1)])), HALAT, .6, [.9, -.7, .5, 2.9, -.05, 3.3]);
    // kıç güvertesi: minderli sıra; üstünde çizgili güneşlik (tente)
    R.box(.1, -.32, KZ, .3, .32, KZ + .1, '#d9654a', { T: '#e9836a' });
    const tn = R.yig(), zr = KZ + .6, ze = KZ + .47, s0 = -.04, s1 = .62, tw = .52, ns = 6;
    tn.line([[s0, -tw, KZ + .2], [s0, -tw, ze]], '#7a5430', 1.1).line([[s1, -tw, KZ], [s1, -tw, ze]], '#7a5430', 1.1).nl();
    for (let i = 0; i < ns; i++) { const a = s0 + (s1 - s0) * i / ns, e = s0 + (s1 - s0) * (i + 1) / ns, c = i % 2 ? BY : AK;
      tn.poly([[a, 0, zr], [e, 0, zr], [e, -tw, ze], [a, -tw, ze]], c, -.08).poly([[a, 0, zr], [e, 0, zr], [e, tw, ze], [a, tw, ze]], c)
        .poly([[a, tw, ze], [e, tw, ze], [e, tw, ze - .06], [(a + e) / 2, tw, ze - .1], [a, tw, ze - .06]], c, -.12); }
    tn.poly([[s1, -tw, ze], [s1, 0, zr], [s1, tw, ze], [s1, tw, ze - .06], [s1, 0, zr - .06], [s1, -tw, ze - .06]], BY, -.06).nl();
    tn.line([[s0, tw, KZ + .2], [s0, tw, ze - .05]], '#7a5430', 1.1).line([[s1, tw, KZ], [s1, tw, ze - .05]], '#7a5430', 1.1);
    tn.put([s0, -tw, KZ + .4, s1, tw, zr]);
    // dümenci ve dümen dolabı
    R.fig(.78, .26, KZ, { body: '#4f9a55', legs: BY, hat: 'hasir' });
    R.art(.93, .2, KZ, ln('#6a4428', 'M0 0v-7', 1.6) + `<circle class="Ln ${K.ks('#8a5a30')}" cx="0" cy="-9" r="3.6" stroke-width="1.1"/>` + ln('#8a5a30', 'M-4.6 -9h9.2M0 -13.6v9.2M-3.2 -12.2l6.4 6.4M3.2 -12.2l-6.4 6.4', .6), { bb: [.92, .14, KZ, .98, .26, KZ + .5] });
    // mizana direği ve bumbası
    R.mast(MZ, 0, DZ, 3.38, 2.3);
    R.furl([MZ - .05, 0, 1.3], [-.36, 0, 1.38], 4.6, { dn: -2.5, in: .05, sw: 1.8 });
    // kamara: vernikli yanlar, pirinç lombozlar, krem dam, ışıklık, damda kedi
    const km = R.box(1.36, -.36, DZ, 2.32, .36, DZ + .34, VR, { T: BY });
    km.side.planks({ dir: 'v', step: .12 }); [.1, .4, .7].forEach(a => km.side.win(km.a(a, .17), .1, .17, .17, { kind: 'round', frame: M.bronz, lit: true, sill: false, bars: [1, 1] }));
    km.end.win(km.e(.12, .2), .09, .2, .19, { frame: '#6a4428', lit: true, sill: false, bars: [2, 1] }).rect(km.e(.42, .2), 0, .2, .3, '#7a4a28', 4).dot(km.e(.42, .2) + .04, .15, .9, M.bronz, 6);
    R.box(1.3, -.41, DZ + .34, 2.38, .41, DZ + .385, BY, { side: T(BY, -.2), end: T(BY, -.2) });
    R.box(1.66, -.14, DZ + .385, 2, .14, DZ + .45, VR, { T: '#8fa9c0>#ffe6ae' });
    b.critter('kedi', ...R.g(2.18, -.22, DZ + .385), { flip: R.dy });
    // ana direk, gurcata, bumbada sarılı ana yelken
    R.mast(AN, 0, DZ, 4.34, 2.9);
    R.l3([[AN, -.2, 3.3], [AN, .2, 3.3]], T(DIREK, -.2), 1.4);
    R.furl([AN - .06, 0, 1.08], [1.26, 0, 1.16], 5.2, { dn: -2.8, in: .04, sw: 1.9 });
    // baş güverte: ambar kapağı, narenciye sepetleri, küp, halat kangalı, ırgat
    const ak = R.box(3.02, -.24, DZ, 3.48, .24, DZ + .07, '#b98a56'); ak.T.planks({ dir: 'v', step: .115 });
    R.crate(3.16, .12, DZ + .07, .22, { fill: '#f0962e' }).crate(3.36, -.1, DZ + .07, .2, { fill: '#e9d05a' });
    b.pot(...R.g(3.84, -.2, DZ), { s: .8 });
    R.art(2.9, .34, DZ, ln('#b9a27a', K.ell(0, -1.2, 3.6, 1.8) + K.ell(0, -1.6, 2, 1), 1.1), { bb: [2.8, .24, DZ, 3, .44, DZ + .08] });
    R.fig(3.62, -.02, DZ, { body: BY, legs: '#3f6a8a', hat: 'fes', carry: 'sepet' });
    R.box(4, -.2, DZ, 4.1, .2, DZ + .15, '#7a4a28');
    // bordada lombozlar
    const lz = [1.5, 1.86, 2.22].map(s => R.q(...H.sur(s, .3, 1, .012)));
    H.F.raw(K.dots(M.bronz, lz, 3.2) + K.dots('#3f5670>#ffc866', lz, 1.8));
    H.front();
    // baş bodoslaması, cıvadra
    R.stem([[4.3, 0, .1], [4.6, 0, .9], [4.63, 0, .98]], '#8f5630', 2.4).stem([[4.62, 0, .95], [4.65, 0, 1.05]], AK, 2.8);
    R.stem([[4.2, 0, .86], [5.46, 0, 1.24]], '#8a5a30', 2.1);
    // çapa: baş omuzlukta asılı
    R.art(...H.sur(4.02, .4, 1, .03), ln(M.demir, 'M0 -9.5v9M-3.6 -3.4q.3 3.8 3.6 3.8q3.3 0 3.6 -3.8M-2.2 -7.6h4.4', 1.2) + ln(M.demir, K.circ(0, -10.6, 1.1), .8), { bb: [3.96, .3, .1, 4.08, .5, .42] });
    // donanım: ıstralyalar, yakın çarmıhlar ve ıskalaları, bumba mantilyaları
    const nr = [2.46, 2.68, 2.9].map(s => [[AN, 0, 3.3], rl(s, 1)]), rat = [];
    for (let k = 1; k < 6; k++) { const f = .3 + k * .11, q = l => [l[0][0] + (l[1][0] - l[0][0]) * f, l[0][1] + (l[1][1] - l[0][1]) * f, l[0][2] + (l[1][2] - l[0][2]) * f]; rat.push([q(nr[0]), q(nr[1]), q(nr[2])]); }
    R.ip(nr.concat([.92, 1.26].map(s => [[MZ, 0, 3.2], rl(s, 1)]), [[[AN, 0, 4.2], [5.44, 0, 1.24]], [[AN, 0, 3.5], [4.62, 0, .98]], [[5.44, 0, 1.22], [4.36, 0, .14]], [[AN, 0, 4.24], [MZ, 0, 3.3]], [[MZ, 0, 3.3], [-.35, 0, 1.4]], [[AN, 0, 3.3], [1.28, 0, 1.18]]]),
      HALAT, .6, [-.35, 0, .14, 5.44, .72, 4.24]);
    R.ip(rat, HALAT, .5, [2.4, .3, 1.2, 2.9, .72, 2.6], .8);
    // flok: iç ıstralyada sarılı
    R.furl([4.5, 0, 1.12], [3.52, 0, 2.36], 3.2, { spar: false, in: 0, dn: 0, n: 6 });
    R.flama(AN, 0, 4.33, AK, .9, BY).flama(MZ, 0, 3.37, BY, .6);
    // baş feneri; gece suya vuran ışık
    R.fener(4.56, .04, 1.02, { r: 15, k: .8, bb: [4.5, 0, 1, 4.62, .1, 1.3] });
    b.spill(...R.g(4.5, .5, 0), 1);
    b.tag(...R.g(2.3, 1, 0));
  });

  /* =========================================================
     4 — TROL TEKNESİ "POYRAZ": koyu gövdeli, yüksek başlı sağlam trolcü. Kıçta kaptan köşkü, başta direk ve bumba vinci
     (torba ambarın üstünde asılı), iki yana açılan ağ sırıkları, bordada trol kapısı ve usturmaça lastikleri.
     ========================================================= */
  CK.def('gemi-poyraz', { w: 6.3, d: 2.4, name: 'Trol Teknesi “Poyraz”' }, (b, K, opt) => {
    const R = tekne(b, opt, 5.2, 1.6, .05), AK = '#e0853a', BY = '#f4ecd9', GV = '#2f4a62', TK = '#c9aa7c', DM = '#4a4f58', DZ = .36, BZ = .74;
    const H = R.hull({ st: [[0, .44, .76, .24], [.35, .64, .68, .1], [1.2, .78, .59], [2.6, .8, .57], [3.7, .73, .66], [4.4, .52, .86, -.05], [4.9, .25, 1.02, -.12], [5.2, 0, 1.12, -.28]],
      wf: .78, step: .2, dk: [[0, 4.05, DZ, TK], [4.05, 5.2, BZ, TK]], bd: [0, .11, -.22, -.08], cols: ['#8a3a2e', GV, AK, BY], sm: [0, 3, 0, 0], rail: '#7a4a2a', inn: '#dccdae', plank: .12 });
    const rl = (s, sg, o = -.03) => H.sur(s, H.top(s), sg, o), FM = 3.6, MM = .36;
    // uzak yandaki ağ sırığı ve çarmıhlar
    R.ip([[[FM, -.06, .7], [FM - .2, -1.2, 2.5]], [[FM - .2, -1.2, 2.5], [FM, 0, 3.05]]], '#8a5a30', 1.6, [3.3, -1.25, .7, 3.7, -.08, 3.05]);
    R.ip([3.3, 3.9].map(s => [[FM, 0, 2.9], rl(s, -1)]).concat([[[MM, 0, 2.3], rl(.15, -1)]]), HALAT, .6, [.1, -.8, .6, 3.9, -.05, 2.9]);
    // kıç: mizana direği, bumbada sarılı denge yelkeni, ağ yığını ve şamandıralar
    R.mast(MM, 0, DZ, 2.5, 2.2);
    R.furl([MM - .04, 0, 1.52], [-.52, 0, 1.6], 4, { dn: -2.2, in: .06, sw: 1.7 });
    R.art(.2, .2, DZ, pth('#5f6a4a', 'M-9 0q-1 -7 7 -8q8 0 9 8z') + pth('#8a9468', 'M-6 -2q2 -4 6 -4.4q4 .4 5 2.4q-5 -1 -11 2z') + pth(AK, K.circ(-5, -1.4, 1.5) + K.circ(2, -5.6, 1.4) + K.circ(6, -1, 1.5)), { bb: [.02, 0, DZ, .4, .4, DZ + .3] });
    // kaptan köşkü: beyaz, turuncu kuşak, kapı ve pencereler; damda baca, projektör, can simidi
    const kz = DZ + .8, wh = R.box(.62, -.4, DZ, 1.72, .4, kz, BY);
    wh.side.band(0, .14, AK).planks({ dir: 'v', step: .14, b0: .14 }).door(wh.a(.08, .26), .26, .62, { col: GV, sove: null })
      .win(wh.a(.46, .24), .36, .24, .27, { frame: '#6a4428', lit: true, sill: false, bars: [2, 1] }).win(wh.a(.78, .24), .36, .24, .27, { frame: '#6a4428', lit: true, sill: false, bars: [2, 1] });
    wh.end.band(0, .14, AK); [.06, .31, .56].forEach(e => wh.end.win(wh.e(e, .18), .36, .18, .27, { frame: '#6a4428', lit: true, sill: false, bars: [1, 1] }));
    R.box(.54, -.47, kz, 1.88, .47, kz + .06, '#dfe3df', { side: AK, end: AK });
    R.cyl(.8, -.22, .05, kz + .06, kz + .48, '#3a3f46', { top: '#1f2226' });
    R.art(1.5, .47, DZ + .5, `<g transform="${K.fxArt.plane('y')}"><circle r="3.6" fill="none" class="${K.ks(BY)}" stroke-width="2"/><path class="Ln ${K.ks(AK)}" stroke-width="2.1" stroke-dasharray="1.5 4.15" d="${K.circ(0, 0, 3.6)}"/></g>`, { bb: [1.4, .4, DZ + .3, 1.6, .5, DZ + .7] });
    b.critter('marti', ...R.g(1.6, -.2, kz + .06), { flip: !R.dy });
    // ırgat (vinç tamburu)
    R.box(1.98, -.3, DZ, 2.16, .3, DZ + .1, DM); R.box(2, -.26, DZ + .1, 2.14, -.2, DZ + .32, DM); R.box(2, .2, DZ + .1, 2.14, .26, DZ + .32, DM);
    R.box(2.01, -.2, DZ + .13, 2.13, .2, DZ + .29, '#b9a27a', { T: '#cdb891' });
    // balık ambarı: açık ağız, içinde gümüş balık; kapak yana yaslı; kasalar
    const am = R.yig(), a0 = 2.42, a1 = 3.08, at = .3, az = DZ + .09;
    am.poly([[a0, -at, DZ], [a0, at, DZ], [a0, at, az], [a0, -at, az]], '#8a6a48'); am.poly([[a0, at, DZ], [a1, at, DZ], [a1, at, az], [a0, at, az]], '#8a6a48').poly([[a1, -at, DZ], [a1, at, DZ], [a1, at, az], [a1, -at, az]], '#8a6a48');
    am.poly([[a0, -at, az], [a1, -at, az], [a1, at, az], [a0, at, az]], '#a8845a').fl([[a0 + .05, -at + .05, az], [a1 - .05, -at + .05, az], [a1 - .05, at - .05, az], [a0 + .05, at - .05, az]], '#27323c').nl();
    const fr = K.rng(5), fp = []; for (let i = 0; i < 16; i++) fp.push(R.q(a0 + .12 + fr() * (a1 - a0 - .24), -at + .12 + fr() * (2 * at - .24), az));
    am.raw(K.dots('#9fb4c4', fp.slice(0, 9), 2.6) + K.dots('#dfe9ee', fp.slice(9), 1.8)); am.put([a0, -at, DZ, a1, at, az + .02]);
    R.crate(3.3, -.36, DZ, .26, { fill: '#b9c7d2' }).crate(3.34, -.08, DZ, .24, { fill: '#dc9a86' }).crate(2.3, .5, DZ, .24, { fill: '#b9c7d2' });
    R.fig(3.16, .42, DZ, { body: AK, legs: GV, hat: 'hasir', carry: 'balik' });
    // baş direği, bumba vinci ve ucunda asılı dolu torba
    R.mast(FM, 0, DZ, 3.2, 2.8);
    R.l3([[FM - .04, 0, .78], [2.66, 0, 2.2]], '#8a5a30', 2);
    R.art(2.66, 0, 2.2, ln(HALAT, 'M0 0V15', .8) + pth('#5f6a4a', 'M0 14q-6.5 6 -5.6 15q.6 6.4 5.6 6.6q5 -.2 5.6 -6.6q.9 -9 -5.6 -15z') + pth('#9fb4c4', 'M-3.6 26q3.6 -3 7.2 0q.4 5.4 -3.6 7.6q-4 -2.2 -3.6 -7.6z')
      + ln('#3f4630', 'M-3.6 19.5q3.6 2 7.2 0M-5.2 24.5q5.2 2.6 10.4 0M-5.4 30q5.4 2.6 10.8 0M-2.6 16.5l-1.6 17M2.6 16.5l1.6 17M0 14v21.6', .5, 'opacity=".8"') + ln(M.kopuk, 'M-1.5 38v2.4M1.8 37.4v1.8', .7, 'opacity=".8"'), { bb: [2.56, -.1, .9, 2.76, .1, 2.2] });
    // baş güverte: demir ırgatı, halat kangalı, babalar
    R.box(4.36, -.16, BZ, 4.5, .16, BZ + .14, DM);
    R.art(4.2, .3, BZ, ln('#b9a27a', K.ell(0, -1.2, 3.6, 1.8) + K.ell(0, -1.6, 2, 1), 1.1), { bb: [4.1, .2, BZ, 4.3, .4, BZ + .08] });
    R.cyl(4.72, .12, .04, BZ, BZ + .14, DM).cyl; R.cyl(4.72, -.12, .04, BZ, BZ + .14, DM);
    H.front();
    // baş bodoslaması
    R.stem([[4.9, 0, .1], [5.2, 0, 1.12], [5.23, 0, 1.2]], '#7a4a2a', 2.6);
    // yakın yan: trol darağacı, asılı trol kapısı, ağ sırığı
    const gs = 2.02, ge = 2.44, gt = s => H.sur(s, H.top(s), 1, -.03), dg = R.yig();
    dg.line([gt(gs), [gs + .04, gt(gs)[1], 1.28], [ge - .04, gt(ge)[1], 1.28], gt(ge)], DM, 2.2).line([[gs + .04, gt(gs)[1], 1.28], [ge - .04, gt(ge)[1], 1.28]], T(DM, .3), .8).nl();
    dg.line([[2.23, gt(2.2)[1], 1.28], H.sur(2.23, .98, 1, .05)], HALAT, .7);
    dg.fl(H.patch(2.08, .5, .3, .48, 1, .05), T('#9a6a3f', .1)).line([H.sur(2.08, .62, 1, .055), H.sur(2.38, .62, 1, .055)], DM, 1.4).line([H.sur(2.08, .86, 1, .055), H.sur(2.38, .86, 1, .055)], DM, 1.4);
    dg.put([gs, .76, .5, ge, .9, 1.3]);
    R.ip([[[FM, .06, .7], [FM - .2, 1.2, 2.5]]], '#8a5a30', 1.6, [3.3, .08, .7, 3.7, 1.25, 2.5]);
    // usturmaça lastikleri
    const tyre = s => { const p = H.sur(s, .34, 1, .03), tp = H.sur(s, H.top(s), 1, .01), q0 = R.q(...p), q1 = R.q(...tp);
      R.art(p[0], p[1], p[2], ln(HALAT, `M0 -3L${f1((q1[0] - q0[0]) * (R.dy ? -1 : 1))} ${f1(q1[1] - q0[1])}`, .7) + `<g transform="${K.fxArt.plane('y')}"><circle r="2.7" fill="none" class="${K.ks('#26282c')}" stroke-width="2.2"/></g>`, { bb: [s - .1, p[1], .2, s + .1, p[1] + .08, .6] }); };
    [1.1, 1.7, 3.2, 3.9].forEach(tyre);
    // çapa: baş omuzlukta
    R.art(...H.sur(4.52, .52, 1, .03), ln(DM, 'M0 -9.5v9M-3.6 -3.4q.3 3.8 3.6 3.8q3.3 0 3.6 -3.8M-2.2 -7.6h4.4', 1.2) + ln(DM, K.circ(0, -10.6, 1.1), .8), { bb: [4.46, .3, .2, 4.58, .6, .56] });
    // donanım
    R.ip([3.3, 3.9].map(s => [[FM, 0, 2.9], rl(s, 1)]).concat([[[MM, 0, 2.3], rl(.15, 1)], [[FM, 0, 3.1], [5.2, 0, 1.16]], [[FM, 0, 3.05], [2.66, 0, 2.2]], [[FM, 0, 3.05], [FM - .2, 1.2, 2.5]], [[FM, 0, 3.1], [MM, 0, 2.4]], [[MM, 0, 2.4], [-.5, 0, 1.62]]]),
      HALAT, .6, [-.5, 0, .6, 5.2, 1.25, 3.1]);
    // direk feneri ve flama
    R.fener(FM, .04, 3.2, { r: 18, k: .9, bb: [FM - .06, 0, 3.2, FM + .06, .1, 3.5] });
    R.flama(MM, 0, 2.5, AK, .8, BY);
    b.spill(...R.g(3.9, .6, 0), 1.2);
    b.tag(...R.g(2.6, 1.15, 0));
  });
})();
