/* Derinsu — DİYAR: şehir dışındaki dünya haritası (kullanıcı kararı 2026-11-18: "şehir gibi harita sistemi; sahaları haritadan seçelim,
   sınır çizgileri olsun, sahaya tıklayınca yakınlaşarak düğümler çıksın").
   CK.diyar() → { x, y, w, h, ground, body, borders, land, cells, regions }
   · Ekran düzleminde (z = 0) çalışır: u = (x − y)·U, v = (x + y)·U/2. Ada uzun (dikey) bir kara parçasıdır; çevresi denizdir.
   · Altı bölge: üstte Maden Ocağı (sol) ve Kadim Harabeler (sağ), ortada Ulu Orman ve Çiçekli Çayır, altta Av Sahası (sol),
     Derinsu Şehri (orta-alt kıyı) ve denizde Kıyı'nın avlanma alanları (sağ alt). Her bölge 6 SAHA'ya bölünür.
   · Sahalar ağırlıksız Voronoi hücreleridir; kenarlar iki komşuda aynı biçimde kıvrılır (sınır çizgisi ile resim kırpması örtüşür).
   · cells[i]: { i, kind: 'field'|'sea'|'city', prof, slot, poly (ekran), c (ağırlık merkezi), r (yarıçap), spots (9 düğüm yeri), sceneT, seed } */
(function (K) {
  'use strict';
  const { M, f1, kf, ks, tone, rng } = K, U = K.U;
  const inv = (u, v) => [(u / U + 2 * v / U) / 2, (2 * v / U - u / U) / 2];      // ekran (z = 0) → ızgara
  const X0 = -650, X1 = 650, Y0 = -70, Y1 = 2230;
  // bölgeler: tohumların serpildiği dikdörtgen (ekran); sea: denizde
  const REG = [
    { id: 'maden', u: [-560, -40], v: [150, 740], col: '#b4a183' },
    { id: 'yaratik', u: [40, 560], v: [150, 740], col: '#7c8a72' },
    { id: 'odun', u: [-560, -40], v: [800, 1400], col: '#5c8a45' },
    { id: 'bitki', u: [40, 560], v: [800, 1400], col: '#a3c672' },
    { id: 'deri', u: [-560, -120], v: [1450, 2010], col: '#cdb676' },
    { id: 'balik', sea: true, pts: [[430, 1560], [575, 1480], [330, 1770], [520, 1730], [300, 2010], [480, 1990]] },
  ];
  const CITY = [75, 1840];
  // kıyı çizgisi (ekran): uzun, kuzeyi geniş, güneydoğusu Kıyı'ya açılan bir koy
  const LAND = [[0, 30], [250, 50], [470, 130], [590, 330], [610, 640], [595, 960], [585, 1240], [470, 1390], [310, 1500], [230, 1640], [215, 1830], [150, 1990],
    [10, 2080], [-170, 2110], [-380, 2070], [-545, 1930], [-600, 1700], [-590, 1400], [-605, 1080], [-600, 760], [-610, 450], [-560, 230], [-410, 90], [-210, 40]];
  const inPoly = (x, y, P) => { let n = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) n++; } return n % 2 === 1; };
  // kıyı çizgisinin yumuşatılmış hâli (Catmull-Rom); içinde mi sınaması için sık örneklenmiş çokgen
  const dense = (P, k = 8) => { const out = [], n = P.length; for (let i = 0; i < n; i++) { const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    for (let s = 0; s < k; s++) { const t = s / k, t2 = t * t, t3 = t2 * t; out.push([0, 1].map(j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); } } return out; };

  /* ---------- Voronoi: her tohum için dikdörtgenden başlayan yarı düzlem kırpması; kenar etiketi = komşu hücre ---------- */
  function cellOf(i, S) {
    let poly = [[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]].map(p => ({ p, e: -1 }));
    const a = S[i];
    for (let j = 0; j < S.length; j++) { if (j === i) continue; const b = S[j], m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], n = [b[0] - a[0], b[1] - a[1]], f = p => (p[0] - m[0]) * n[0] + (p[1] - m[1]) * n[1];
      const out = []; for (let k = 0; k < poly.length; k++) { const P = poly[k], Q = poly[(k + 1) % poly.length], fp = f(P.p), fq = f(Q.p);
        if (fp <= 0) out.push(P);
        if ((fp <= 0) !== (fq <= 0)) { const t = fp / (fp - fq), X = [P.p[0] + (Q.p[0] - P.p[0]) * t, P.p[1] + (Q.p[1] - P.p[1]) * t]; out.push({ p: X, e: fp <= 0 ? j : P.e }); } }
      poly = out; if (!poly.length) break; }
    return poly;
  }
  // kenar kıvrımı: iki hücrede aynı (çift anahtarına bağlı), kenarın yönünden bağımsız
  function wiggle(a, b, key, amp) {
    const fw = a[0] < b[0] || (a[0] === b[0] && a[1] < b[1]), A = fw ? a : b, B = fw ? b : a, dx = B[0] - A[0], dy = B[1] - A[1], L = Math.hypot(dx, dy);
    if (L < 30) return [];
    const r = rng(key * 7919 + 13), nx = -dy / L, ny = dx / L, n = Math.max(2, Math.round(L / 34)), ph = r() * 6.28, ph2 = r() * 6.28, out = [];
    for (let k = 1; k < n; k++) { const t = k / n, w = Math.sin(t * Math.PI) * amp * (Math.sin(t * 6.3 + ph) * .7 + Math.sin(t * 13 + ph2) * .3); out.push([A[0] + dx * t + nx * w, A[1] + dy * t + ny * w]); }
    return fw ? out : out.reverse();
  }

  K.diyar = (opt = {}) => {
    const seed = opt.seed || 11, R = rng(seed);
    // tohumlar
    const cells = [];
    for (const g of REG) {
      const pts = g.pts || (() => { const o = []; for (let row = 0; row < 3; row++) for (let col = 0; col < 2; col++) {
        const cu = g.u[0] + (g.u[1] - g.u[0]) * (col + .5) / 2, cv = g.v[0] + (g.v[1] - g.v[0]) * (row + .5) / 3;
        o.push([cu + (R() - .5) * (g.u[1] - g.u[0]) * .22, cv + (R() - .5) * (g.v[1] - g.v[0]) * .14]); } return o; })();
      pts.forEach((s, k) => cells.push({ kind: g.sea ? 'sea' : 'field', prof: g.id, slot: k, s }));
    }
    cells.push({ kind: 'city', prof: 'city', slot: 0, s: CITY });
    const S = cells.map(c => c.s);
    const coast = dense(LAND), isLand = (x, y) => inPoly(x, y, coast);
    cells.forEach((c, i) => { c.i = i; c.raw = cellOf(i, S); });
    // kenarları kıvır: hücrenin çokgeni ham köşeler + her iç kenarın kıvrım noktaları
    for (const c of cells) { const P = []; c.raw.forEach((v, k) => { const nx = c.raw[(k + 1) % c.raw.length]; P.push(v.p);
      if (v.e >= 0) { const lo = Math.min(c.i, v.e), hi = Math.max(c.i, v.e), same = cells[v.e].prof === c.prof; P.push(...wiggle(v.p, nx.p, lo * 97 + hi, same ? 9 : 14)); } });
      c.poly = P; }
    // ağırlık merkezi ve düğüm yerleri: hücre ∩ (kara ya da deniz) içinde, kenardan uzak noktalar
    for (const c of cells) {
      const sea = c.kind === 'sea', xs = c.poly.map(p => p[0]), ys = c.poly.map(p => p[1]), bx = [Math.min(...xs), Math.max(...xs)], by = [Math.min(...ys), Math.max(...ys)];
      const dEdge = (x, y) => { let d = 1e9; for (let k = 0; k < c.poly.length; k++) { const a = c.poly[k], b = c.poly[(k + 1) % c.poly.length], vx = b[0] - a[0], vy = b[1] - a[1], t = Math.max(0, Math.min(1, ((x - a[0]) * vx + (y - a[1]) * vy) / (vx * vx + vy * vy || 1)));
        d = Math.min(d, Math.hypot(x - a[0] - vx * t, y - a[1] - vy * t)); } return d; };
      const cand = []; let sx = 0, sy = 0, n = 0;
      for (let y = by[0]; y <= by[1]; y += 10) for (let x = bx[0]; x <= bx[1]; x += 10) { if (!inPoly(x, y, c.poly) || isLand(x, y) === sea) continue; sx += x; sy += y; n++;
        const de = Math.min(dEdge(x, y), sea ? 1e9 : (() => { let d = 1e9; for (let k = 0; k < coast.length; k += 2) d = Math.min(d, Math.hypot(x - coast[k][0], y - coast[k][1])); return d; })()); if (de > 30) cand.push([x, y, de]); }
      c.c = n ? [sx / n, sy / n] : c.s.slice(); c.area = n * 100; c.bb = [bx[0], by[0], bx[1] - bx[0], by[1] - by[0]];
      // en uzak nokta örneklemesi: önce merkeze yakın, sonra birbirinden uzak 9 yer
      const spots = []; if (cand.length) { cand.sort((a, b) => Math.hypot(a[0] - c.c[0], a[1] - c.c[1]) - Math.hypot(b[0] - c.c[0], b[1] - c.c[1])); spots.push(cand[0]);
        while (spots.length < 9) { let best = null, bd = -1; for (const p of cand) { let d = 1e9; for (const q of spots) d = Math.min(d, Math.hypot((p[0] - q[0]) * .8, p[1] - q[1])); if (d > bd) { bd = d; best = p; } } if (!best || bd < 18) break; spots.push(best); } }
      c.spots = spots.map(p => [Math.round(p[0]), Math.round(p[1])]).sort((a, b) => a[1] - b[1]);
      c.r = Math.sqrt(c.area / Math.PI);
      c.sceneT = (c.prof === 'bitki' ? [1, 2, 3, 4, 2, 3] : [1, 2, 3, 4, 5, 3])[c.slot] || 3; c.seed = 37 + c.i * 53;      // Anka Çiçeği'nin arka uçurumu haritada kullanılmaz
    }

    /* ---------- zemin: deniz, sığlık kuşakları, kara, bölge renkleri, şehir ---------- */
    const P = K.planKit, G = [], wave = P.wavePat(), grass = P.grassPat();
    const coastD = P.smooth(LAND, 0, true, true), polyD = poly => 'M' + poly.map(p => f1(p[0]) + ' ' + f1(p[1])).join('L') + 'Z';
    G.push(`<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" class="${kf(M.suK)}"/>`);
    // Kıyı alanları: derinliğe göre koyulaşan su (alanın kademesi değiştikçe değişmez: yalnız ışık)
    for (const c of cells) if (c.kind === 'sea') G.push(`<path class="${kf(tone(M.suK, -.08 - (c.c[1] - 1450) / 4000))}" opacity=".7" d="${polyD(c.poly)}"/>`);
    G.push(`<path class="Ln ${ks(M.su)}" stroke-width="84" opacity=".75" d="${coastD}"/><path class="Ln ${ks(M.suA)}" stroke-width="48" opacity=".7" d="${coastD}"/><path class="Ln ${ks(M.kopuk)}" stroke-width="18" opacity=".85" d="${coastD}"/>`);
    G.push(`<rect x="${X0}" y="${Y0}" width="${X1 - X0}" height="${Y1 - Y0}" fill="url(#${wave})"/>`);
    G.push(`<path class="${kf(M.kum)}" d="${coastD}"/><path class="Ln ${ks(M.kum)}" stroke-width="10" d="${coastD}"/><path class="${kf(M.cim)}" d="${coastD}"/>`);
    G.push(`<clipPath id="dyLand"><path d="${coastD}"/></clipPath><clipPath id="dySea"><path clip-rule="evenodd" d="M${X0} ${Y0}H${X1}V${Y1}H${X0}Z${coastD}"/></clipPath>`);
    // bölge renkleri (karada): her saha kendi bölgesinin renginde, komşu sahalar hafifçe ayrışır
    let tint = '';
    for (const c of cells) { if (c.kind === 'sea') continue; const g = REG.find(q => q.id === c.prof), col = c.kind === 'city' ? '#cdbb96' : tone(g.col, (c.slot % 3 - 1) * .05);
      tint += `<path class="${kf(col)}" opacity="${c.kind === 'city' ? .55 : .62}" d="${polyD(c.poly)}"/>`; }
    G.push(`<g clip-path="url(#dyLand)">${tint}<path fill="url(#${grass})" d="${coastD}"/></g>`);

    // şehir: kapı, surlar, iki kule, gözcü kulesi, evler (dünya haritasındaki şehrin aynısı, kıyıda)
    const W = new K.Builder({ seed }), SH = [], fx = [], CG = [];
    const cg = inv(CITY[0], CITY[1] - 20), ox = cg[0] - 48.6, oy = cg[1] - 52, CS = .6, cc = K.pr(cg[0], cg[1]), cT = `translate(${f1(cc[0])} ${f1(cc[1])}) scale(${CS}) translate(${f1(-cc[0])} ${f1(-cc[1])})`;
    const place = (id, X, Y, o = {}) => { if (!K.DEFS.has(id)) return null; let d; try { d = K.build(id, Object.assign({ seed: Math.abs(Math.round(X * 7 + Y * 13)) + seed }, o)); } catch (e) { return null; }
      const p = K.pr(X + ox, Y + oy, o.z || 0), tr = `translate(${f1(p[0])} ${f1(p[1])})`; if (d.ground && !o.noGround) CG.push(`<g transform="${tr}">${d.ground}</g>`); if (d.shadow) SH.push(`<path transform="${tr}" d="${d.shadow}"/>`);
      W.item([X + ox, Y + oy, o.z || 0, X + ox + d.w, Y + oy + d.d, (o.z || 0) + Math.max(.5, d.h)], `<g transform="${tr}">${d.body}</g>`, { cast: false });
      for (const f of d.fx) fx.push(Object.assign({}, f, { x: f.x + X + ox, y: f.y + Y + oy, z: f.z + (o.z || 0) })); return d; };
    { W.gz = 0; place('kapi', 45, 47.3);
      const wall = (x0, x1) => { const b = W.box(x0 + ox, 48.5 + oy, 0, x1 + ox, 49.5 + oy, 2.4, M.tas, { edge: false }); b.L.courses({ rh: .3, bw: .8, dens: .6 }).stones(Math.round((x1 - x0) * 1.3)); W.merlons(x0 + ox, 48.5 + oy, x1 + ox, 48.7 + oy, 2.4, M.tas); W.merlons(x0 + ox, 49.3 + oy, x1 + ox, 49.5 + oy, 2.4, M.tas); };
      wall(39.4, 45.1); wall(52.9, 58.6);
      const tw = (cx, cy, col) => { const t = W.cyl(cx + ox, cy + oy, 1.1, 0, 3.6, M.tas, { top: tone(M.tas, -.06) }); t.courses(.32); t.band(3.5, .3, M.tasK, .14).merlons(3.8, 9, { e: .14 }); W.line3([[cx + ox, cy + oy, 3.8], [cx + ox, cy + oy, 5.2]], M.ahsapK, 1.5); fx.push({ t: 'flag', x: cx + ox, y: cy + oy, z: 5.2, col, s: 1.2 }); };
      tw(39.2, 49, M.bezK); tw(58.8, 49, M.bezM);
      place('kule', 53.4, 51.4); place('ev', 40.6, 51.4, { w: 4.4, d: 4.6, kat: 2, seed: 3 }); place('ev', 45.6, 53.6, { w: 4.2, d: 4.4, kat: 1, stil: 'siva', seed: 8 }); place('hamam', 47.2, 57.6);
      W.tree('selvi', 50.4 + ox, 52.4 + oy, { s: .9 }).tree('selvi', 44.8 + ox, 51 + oy, { s: .8 }).tree('cinar', 51.6 + ox, 56.4 + oy, { s: 1.3 }); }
    const w = W.out();
    // sınırlar: saha (aynı bölge) ince kesik krem çizgi; bölgeler arası altın; denizde açık kesik çizgi. Kara sınırları karaya, deniz sınırları denize kırpılır.
    const fieldB = [], regB = [], seaB = [];
    for (const c of cells) c.raw.forEach((v, k) => { const j = v.e; if (j < 0 || j < c.i) return; const o = cells[j], a = v.p, b = c.raw[(k + 1) % c.raw.length].p;
      const d = 'M' + [a, ...wiggle(a, b, c.i * 97 + j, o.prof === c.prof ? 9 : 14), b].map(p => f1(p[0]) + ' ' + f1(p[1])).join('L');
      if (c.kind === 'sea' && o.kind === 'sea') seaB.push(d); else if (c.kind === 'sea' || o.kind === 'sea') return; else if (o.prof === c.prof) fieldB.push(d); else regB.push(d); });
    const borders = `<g clip-path="url(#dyLand)" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="${fieldB.join('')}" stroke="#1b140c" stroke-opacity=".38" stroke-width="5"/><path d="${fieldB.join('')}" stroke="#fff4d6" stroke-opacity=".8" stroke-width="1.8" stroke-dasharray="8 6"/>
        <path d="${regB.join('')}" stroke="#140e08" stroke-opacity=".55" stroke-width="9"/><path d="${regB.join('')}" stroke="#d9b45e" stroke-width="3.6"/><path d="${regB.join('')}" stroke="#fff3cc" stroke-opacity=".55" stroke-width="1"/></g>
      <g clip-path="url(#dySea)" fill="none" stroke-linecap="round"><path d="${seaB.join('')}" stroke="#e6fbfb" stroke-opacity=".55" stroke-width="2" stroke-dasharray="3 7"/></g>`;
    const regions = REG.map(g => { const cs = cells.filter(c => c.prof === g.id); return { id: g.id, c: [cs.reduce((a, c) => a + c.c[0], 0) / cs.length, cs.reduce((a, c) => a + c.c[1], 0) / cs.length] }; });
    return { x: X0, y: Y0, w: X1 - X0, h: Y1 - Y0, ground: G.join('') + `<g transform="${cT}">${CG.join('')}${w.ground}<g class="Zs">${SH.join('')}<path d="${w.shadow}"/></g></g>`, body: `<g transform="${cT}">${w.body}</g>`, cityT: { cx: cc[0], cy: cc[1], s: CS }, fx: fx.concat(w.fx), borders, land: coastD, cells, regions, city: cells.find(c => c.kind === 'city') };
  };
})(window.CK);
