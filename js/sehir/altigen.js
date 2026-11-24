/* Derinsu — dünya haritası altıgenleri (tasarım D: oyunun eşya çerçevesi dili düz tepeli altıgende).
   Kademe = çerçevenin işçiliği (I ince çizgi · II köşelik · III elmas çivi · IV köşe plakası · V akantus + taş),
   nitelik = metalin, ince kenarın ve elmas kafes kuşağının rengi; taş sayısı niteliğin basamağıdır (renk körlüğü için).
   Hex.saha(o) saha altıgeninin ÖN yüzünü (resmin üstündeki her şey) SVG olarak verir; resim altındaki tuvaldedir ve
   Hex.clip(W) ile aynı altıgene kırpılır. Hex.bolge(o) bölge mührüdür. Ortak renkler ve desenler Hex.sprite() ile bir kez eklenir.
   Yerel koordinat: merkez (0, 0), genişlik 100, yükseklik 86,6 (viewBox -50 -43.3 100 86.6). */
window.Hex = (() => {
  'use strict';
  const S3 = Math.sqrt(3), HH = 25 * S3, INK = '#0b0a0a', ROM = ['', 'I', 'II', 'III', 'IV', 'V'];
  const n = v => +(+v).toFixed(2), P = p => n(p[0]) + ' ' + n(p[1]);
  const mix = (a, b, t) => { const h = s => [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16)); const A = h(a), B = h(b); return '#' + A.map((x, i) => Math.round(x * t + B[i] * (1 - t)).toString(16).padStart(2, '0')).join(''); };
  // nitelik metalleri (itemFrame.css karışımı): 0 Sıradan · 1 Bereketli · 2 Zengin · 3 Eşsiz · 4 Kıyı (deniz gümüşü)
  const QQ = [
    { rc: '#e8e4dc', rl: '#fffaf0' }, { rc: '#6fcf62', rl: '#b6f0a8' }, { rc: '#4ea4f0', rl: '#a8d4ff' }, { rc: '#e0853a', rl: '#ffc28c' },
  ].map((q, i) => i === 0 ? { ...q, mL: '#fffaf0', mM: '#b9b2a6', mD: '#2b2723' } : { ...q, mL: mix(q.rc, '#fff6e2', .5), mM: mix(q.rc, '#a39b8e', .72), mD: mix(q.rc, '#120c08', .3) });
  QQ[4] = { rc: '#7ec4c8', rl: '#c9f0f1', mL: '#f4fbfa', mM: '#b4bcba', mD: '#24302f' };
  const GOLD = { mL: '#f6dc94', mM: '#c9a24e', mD: '#3b2f16' };

  /* ---------- geometri ---------- */
  const hexV = R => [0, 1, 2, 3, 4, 5].map(i => [R * Math.cos(i * Math.PI / 3), R * Math.sin(i * Math.PI / 3)]);
  // d: kenardan içeri dik uzaklık · r: köşe yuvarlaklığı · k, ox, oy: ölçek ve kaydırma (CSS kırpması için piksel)
  function hp(d = 0, r = 3.5, k = 1, ox = 0, oy = 0) {
    const R = 50 - 2 * d / S3, rr = Math.max(0, r - d), V = hexV(R), Q = p => n(p[0] * k + ox) + ' ' + n(p[1] * k + oy);
    if (rr < .05) return 'M' + V.map(Q).join('L') + 'Z';
    const c = rr * Math.tan(Math.PI / 6); let s = '';
    for (let i = 0; i < 6; i++) {
      const p = V[i], a = V[(i + 5) % 6], b = V[(i + 1) % 6], la = Math.hypot(a[0] - p[0], a[1] - p[1]);
      const p1 = [p[0] + (a[0] - p[0]) / la * c, p[1] + (a[1] - p[1]) / la * c], p2 = [p[0] + (b[0] - p[0]) / la * c, p[1] + (b[1] - p[1]) / la * c];
      s += (i ? 'L' : 'M') + Q(p1) + 'Q' + Q(p) + ' ' + Q(p2);
    }
    return s + 'Z';
  }
  const ring = (d1, d2, r) => hp(d1, r) + hp(d2, r);
  const edgeMid = (deg, d) => { const a = deg * Math.PI / 180, r = HH - d; return [r * Math.cos(a), r * Math.sin(a)]; };
  const atV = (i, body) => `<g transform="rotate(${i * 60}) translate(50 0) scale(-1 1)">${body}</g>`;
  const atE = (deg, d, body) => { const m = edgeMid(deg, d); return `<g transform="translate(${P(m)}) rotate(${deg - 90})">${body}</g>`; };
  const GB0 = 2.7, GB1 = 6.3, PIC = 5.9;
  const cache = new Map(), memo = (k, f) => { if (!cache.has(k)) cache.set(k, f()); return cache.get(k); };
  // CSS kırpması: W px genişliğindeki kutuda resmin altıgeni
  const clip = W => memo('c' + W, () => `path('${hp(PIC, 3.5, W / 100, W / 2, W * HH / 100)}')`);

  /* ---------- ortak desenler (bir kez) ---------- */
  function sprite() {
    if (document.getElementById('hx-defs')) return;
    const lat = (id, c, op, s, w) => `<pattern id="${id}" width="${s}" height="${s}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 0H${s}M0 0V${s}" stroke="${c}" stroke-opacity="${op}" stroke-width="${w}" fill="none"/></pattern>`;
    const d = `<svg id="hx-defs" width="0" height="0" aria-hidden="true" style="position:absolute;width:0;height:0;overflow:hidden"><defs>
      ${QQ.map((q, i) => lat('hxLat' + i, i ? q.rc : '#efe8dc', i ? .55 : .22, 3.6, .38)).join('')}${lat('hxLatG', '#e7c26a', .1, 6, .5)}
      ${QQ.map((q, i) => `<linearGradient id="hxEn${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${i ? mix(q.rc, '#1b1815', .34) : '#2c2824'}"/><stop offset=".45" stop-color="${i ? mix(q.rc, '#141110', .2) : '#1a1715'}"/><stop offset="1" stop-color="${i ? mix(q.rc, '#0b0a09', .12) : '#0d0c0b'}"/></linearGradient>`).join('')}
      <linearGradient id="hxIsik" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff6e0" stop-opacity=".22"/><stop offset=".42" stop-color="#fff6e0" stop-opacity="0"/><stop offset=".58" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".34"/></linearGradient>
      <linearGradient id="hxResim" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a0908" stop-opacity=".3"/><stop offset=".3" stop-color="#0a0908" stop-opacity="0"/><stop offset=".64" stop-color="#0a0908" stop-opacity="0"/><stop offset="1" stop-color="#0a0908" stop-opacity=".55"/></linearGradient>
      <radialGradient id="hxResimV" cx=".5" cy=".5" r=".62"><stop offset=".62" stop-color="#0a0908" stop-opacity="0"/><stop offset="1" stop-color="#0a0908" stop-opacity=".42"/></radialGradient>
      <linearGradient id="hxLevha" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2e2a27"/><stop offset=".8" stop-color="#0e0c0b"/></linearGradient>
      <linearGradient id="hxGumus" x1="0" y1="0" x2="0" y2="1"><stop offset=".15" stop-color="#fffaf0"/><stop offset=".55" stop-color="#cfc8bc"/><stop offset="1" stop-color="#8f887e"/></linearGradient>
      <linearGradient id="hxPlak" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#25211e"/><stop offset="1" stop-color="#0c0b0a"/></linearGradient>
      <linearGradient id="hxAltin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f7e2a4"/><stop offset=".5" stop-color="#e7c26a"/><stop offset="1" stop-color="#b48c3e"/></linearGradient>
      <radialGradient id="hxZemin" cx=".5" cy=".42" r=".6"><stop offset="0" stop-color="#2f2924"/><stop offset=".7" stop-color="#171412"/><stop offset="1" stop-color="#0e0c0b"/></radialGradient>
      <radialGradient id="hxMuhur" cx=".42" cy=".36" r=".7"><stop offset="0" stop-color="#2b2622"/><stop offset="1" stop-color="#0c0b0a"/></radialGradient>
      ${QQ.map((q, i) => `<linearGradient id="hxTas${i}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${q.rl}"/><stop offset=".55" stop-color="${q.rc}"/><stop offset="1" stop-color="${mix(q.rc, '#120c08', .42)}"/></linearGradient>`).join('')}
      <radialGradient id="hxGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fff" stop-opacity="1"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
      <clipPath id="hxKResim"><path d="${hp(PIC)}"/></clipPath>
    </defs></svg>`;
    document.body.insertAdjacentHTML('afterbegin', d);
  }

  /* ---------- simgeler (oyunun 24'lük çizgi simgeleri; kapalı biçimler altınla dolu) ---------- */
  const EMB = {
    odun: '<path d="M6.4 21.3C8.7 16.6 11.7 10.3 14.5 3.4"/>',
    maden: '<path d="M3.5 8.8Q12 2.2 20.5 8.8"/><path d="M12.4 5.4L6.2 20.6"/>',
    bitki: '<path d="M5.5 20.5l4.5-4.5"/><path d="M10 16C4.6 10.6 8.6 3.2 16.4 3.6c-4.8 2-6.9 6.6-3.8 10.8"/>',
    deri: '<path d="M4 20l4.6-4.6"/><path d="M8.6 15.4L19.6 4.4c.8 4.7-1.7 9-7.8 11.6z"/>',
    yaratik: '<path d="M14.5 17.5L3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2"/><path d="M9.5 6.5L18 3h3v3l-3.5 8.5"/>',
    balik: '<path d="M4 20L18 4"/><path d="M18 4v11"/><circle cx="18" cy="16.5" r="1.5"/><circle cx="7" cy="17" r="1.8"/>',
    kilit: '<rect x="5.5" y="10.5" width="13" height="10" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>',
  };
  const FILL = { odun: 'M13.9 4.6Q17 5.9 20.6 5.9Q21.6 9.6 16.9 12.8Q16 8.9 12.7 7.4L10.9 6.6L12.1 3.8Z', deri: 'M8.6 15.4L19.6 4.4c.8 4.7-1.7 9-7.8 11.6z' };
  function emblem(k, cx, cy, size, sw = 1.6) {
    const s = size / 24, t = `translate(${n(cx - 12 * s)} ${n(cy - 12 * s)}) scale(${n(s)})`, fl = FILL[k];
    const body = (stroke, w, extra = '') => `<g fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}>${EMB[k] || ''}</g>`;
    return `<g transform="translate(${n(.7 * s)} ${n(1.1 * s)}) ${t}">${fl ? `<path d="${fl}" fill="${INK}" fill-opacity=".85"/>` : ''}${body(INK, sw + 1.2, 'stroke-opacity=".85"')}</g>
      <g transform="${t}">${fl ? `<path d="${fl}" fill="#b98f3f"/>` : ''}${body('url(#hxAltin)', sw)}${fl ? `<path d="${fl}" fill="none" stroke="#fff3cc" stroke-width=".45" stroke-opacity=".55"/>` : ''}</g>`;
  }

  /* ---------- kademe işçiliği ---------- */
  function bezel(t, m, q) {
    let s = `<path d="${ring(0, GB0)}" fill-rule="evenodd" fill="${t <= 1 ? '#0e0c0b' : m.mD}"/>`;
    s += `<path d="${ring(GB0, GB1)}" fill-rule="evenodd" fill="url(#hxEn${q})"/><path d="${ring(GB0, GB1)}" fill-rule="evenodd" fill="url(#hxLat${q})"/>`;
    s += `<path d="${hp(GB1 + .3)}" fill="none" stroke="${INK}" stroke-opacity=".9" stroke-width=".8"/>`;
    if (t === 3 || t === 4) s += `<path d="${hp(GB1 - .1)}" fill="none" stroke="${m.rc}" stroke-opacity=".8" stroke-width=".75"/>`;
    else if (t === 5) s += `<path d="${hp(GB1 - .15)}" fill="none" stroke="${m.mL}" stroke-width="1.1" stroke-linecap="round" stroke-dasharray="0 2.6" opacity=".9"/>`;
    else s += `<path d="${hp(GB1 - .1)}" fill="none" stroke="${m.mM}" stroke-opacity=".4" stroke-width=".45"/>`;
    const W = [0, 1.55, 1.6, 1.8, 2.4, 2.4][t], D = [0, 0, 3, 3.2, 3.8, 3.8][t], pos = t >= 4 ? 1.75 : 1.5;
    if (D) s += `<path d="${hp(pos)}" fill="none" stroke="${m.mD}" stroke-width="${D}"/>`;
    s += `<path d="${hp(pos)}" fill="none" stroke="${m.mM}" stroke-width="${W}" opacity="${t === 1 ? .92 : 1}"/>`;
    if (t >= 4) s += `<path d="${hp(pos)}" fill="none" stroke="${m.mL}" stroke-width=".6" opacity=".7"/>`;
    if (t >= 2) { const a = hexV(50 - 2 * .95 / S3); s += `<path d="M${P([a[3][0] + 1.6, a[3][1] - 2.8])}L${P([a[4][0] + .9, a[4][1] + .3])}H${t >= 3 ? 9 : -2}" fill="none" stroke="${m.mL}" stroke-width=".7" stroke-linecap="round" opacity=".75"/>`; }
    return s;
  }
  const VX = [0, 1, 2, 3, 4];      // V5 (sağ üst) kademe levhasının yeri
  function ornaments(t, m) {
    let s = '';
    if (t === 2) { const a = 1.1547 * 8.4, L = 6.6, d = `M${P([a + .5 * L, -.866 * L])}L${P([a + .8, -1.39])}Q${P([a, 0])} ${P([a + .8, 1.39])}L${P([a + .5 * L, .866 * L])}`;
      s += VX.map(i => atV(i, `<path d="${d}" fill="none" stroke="${INK}" stroke-opacity=".7" stroke-width="2.4" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${m.mM}" stroke-width="1.2" stroke-linecap="round"/>`)).join(''); }
    if (t === 3) { const d = `<path d="M.7 0L3.7 -2.35L6.7 0L3.7 2.35Z" fill="${m.mL}" stroke="${m.mD}" stroke-width=".7"/><path d="M1.9 0L3.7 -1.3" stroke="#fff" stroke-opacity=".55" stroke-width=".45" stroke-linecap="round"/>`;
      s += VX.map(i => atV(i, d)).join(''); }
    if (t === 4) { const L = 14.5, E = [.5 * L, .866 * L];
      const plate = `<path d="M${P([E[0], -E[1]])}L.8 -1.3Q.35 0 .8 1.3L${P(E)}Q${P([5.6, 5.4])} ${P([7.8, 0])}Q${P([5.6, -5.4])} ${P([E[0], -E[1]])}Z" fill="${m.mM}" stroke="${m.mD}" stroke-width=".9"/>`
        + `<path d="M${P([5.6, -7.2])}Q${P([4.6, 0])} ${P([5.6, 7.2])}" fill="none" stroke="${m.mD}" stroke-width=".75"/><path d="M${P([4.6, -5.4])}Q${P([3.9, 0])} ${P([4.6, 5.4])}" fill="none" stroke="${m.mL}" stroke-width=".45" opacity=".75"/>`
        + `<circle cx="2.5" cy="0" r="1.25" fill="${m.mL}" stroke="${m.mD}" stroke-width=".5"/>`;
      s += VX.map(i => atV(i, plate)).join('') + [30, 150, 210, 330].map(dg => atE(dg, 1.75, `<circle r="1.7" fill="${m.mL}" stroke="${m.mD}" stroke-width=".6"/>`)).join(''); }
    if (t === 5) { const L = 18, E = [.5 * L, .866 * L];
      const leaf = `<path d="M${P([E[0], -E[1]])}L.8 -1.3Q.35 0 .8 1.3L${P(E)}C${P([7.7, 11.6])} ${P([6.1, 7.8])} ${P([6.5, 4.7])}C${P([6.9, 2.6])} ${P([9.4, 2.7])} ${P([11.3, 1.7])}C${P([12.7, 1])} ${P([12.7, -1])} ${P([11.3, -1.7])}C${P([9.4, -2.7])} ${P([6.9, -2.6])} ${P([6.5, -4.7])}C${P([6.1, -7.8])} ${P([7.7, -11.6])} ${P([E[0], -E[1]])}Z" fill="${m.mM}" stroke="${m.mD}" stroke-width=".8"/>`
        + `<path d="M${P([7.4, 1.25])}C${P([9.2, 1.4])} ${P([10.6, .9])} ${P([11.3, 0])}" fill="none" stroke="${m.mD}" stroke-width=".6" stroke-linecap="round"/>`
        + `<path d="M${P([7.4, -1.25])}C${P([9.2, -1.4])} ${P([10.6, -.9])} ${P([11.3, 0])}" fill="none" stroke="${m.mL}" stroke-width=".5" stroke-linecap="round" opacity=".8"/>`
        + `<circle cx="3.9" cy="0" r="2.55" fill="${m.mD}"/><circle cx="3.9" cy="0" r="1.95" fill="${m.rc}" stroke="${m.mL}" stroke-width=".7"/><circle cx="3.35" cy="-.6" r=".6" fill="#fff" opacity=".9"/>`;
      s += VX.map(i => atV(i, leaf)).join('') + [30, 150, 210, 330].map(dg => atE(dg, 1.75, `<path d="M0 -2.7L2.5 0L0 2.7L-2.5 0Z" fill="${m.mL}" stroke="${m.mD}" stroke-width=".6"/>`)).join(''); }
    return s;
  }
  function gems(q, y = -HH + 4.9, sp = 6.55, big = 1) {
    if (!q || q > 3) return '';
    const m = QQ[q]; let s = '';
    for (let k = 0; k < q; k++) {
      const x = (k - (q - 1) / 2) * sp, w = 2.95 * big, h = 4.15 * big;
      s += `<path d="M${n(x)} ${n(y - h - .95)}L${n(x + w + .8)} ${n(y)}L${n(x)} ${n(y + h + .95)}L${n(x - w - .8)} ${n(y)}Z" fill="${INK}"/>`
        + `<path d="M${n(x)} ${n(y - h)}L${n(x + w)} ${n(y)}L${n(x)} ${n(y + h)}L${n(x - w)} ${n(y)}Z" fill="url(#hxTas${q})"/>`
        + `<path d="M${n(x)} ${n(y - h)}L${n(x + w)} ${n(y)}L${n(x)} ${n(y + h)}" fill="${mix(m.rc, '#120c08', .55)}" opacity=".45"/>`
        + `<path d="M${n(x - w * .5)} ${n(y - h * .05)}L${n(x - .1)} ${n(y - h * .7)}" stroke="#fff" stroke-opacity=".9" stroke-width=".55" stroke-linecap="round"/>`;
    }
    return s;
  }
  // kademe levhası (eşya çerçevesindeki gibi): sağ üst köşede siyah levha, gümüş Romen rakamı
  function tierPlate(t, dim) {
    const V5 = [25, -HH + .15], A = [11.2, -HH + .15], L = 15.2, dv = [.5, .866], B = [V5[0] + dv[0] * L, V5[1] + dv[1] * L], Cc = [A[0] + dv[0] * L, A[1] + dv[1] * L];
    const d = `M${P(A)}L${P([V5[0] - 2.1, V5[1]])}Q${P(V5)} ${P([V5[0] + 1.05, V5[1] + 1.82])}L${P(B)}L${P([Cc[0] + 4.6, Cc[1]])}Q${P(Cc)} ${P([Cc[0] - 2.3, Cc[1] - 3.98])}Z`;
    const inner = `M${P([B[0] - .4, B[1] - .3])}L${P([Cc[0] + 4.6, Cc[1] - .3])}Q${P([Cc[0] - .35, Cc[1] - .3])} ${P([Cc[0] - 2.5, Cc[1] - 4.2])}L${P([A[0] + .2, A[1] + .4])}`;
    const cx = (A[0] + V5[0] + B[0] + Cc[0]) / 4 + .2, cy = (A[1] + V5[1] + B[1] + Cc[1]) / 4 + 3.9, tx = (x, y, f) => `<text x="${n(x)}" y="${n(y)}" text-anchor="middle" font-family="Cinzel, serif" font-weight="900" font-size="${t >= 4 ? 9.6 : 10.6}" letter-spacing="-.4" fill="${f}">${ROM[t]}</text>`;
    return `<g opacity="${dim ? .8 : 1}"><path d="${d}" transform="translate(-1 1.4)" fill="#000" opacity=".5"/><path d="${d}" fill="url(#hxLevha)"/><path d="${inner}" fill="none" stroke="#d6d0c6" stroke-opacity=".36" stroke-width=".7"/>${tx(cx + .35, cy + .9, '#000')}${tx(cx, cy, 'url(#hxGumus)')}</g>`;
  }
  // süre levhası: alt kenarda, uçları altıgen açısıyla kırık; kenarı çerçevenin metali. data-zt: süre canlı yazılır
  function plaque(m, txt, o = {}) {
    const w = o.w || 16.2, fz = o.fz || 8.8, y0 = HH - 12.6, y1 = HH - 1.9, ym = (y0 + y1) / 2, c = (y1 - y0) / 2 / S3;
    const d = `M${n(-w)} ${n(ym)}L${n(-w + c)} ${n(y0)}H${n(w - c)}L${n(w)} ${n(ym)}L${n(w - c)} ${n(y1)}H${n(-w + c)}Z`;
    return `<path d="${d}" fill="url(#hxPlak)" stroke="${INK}" stroke-width="2.1"/><path d="${d}" fill="none" stroke="${o.gold ? '#d9b45e' : m.mM}" stroke-width=".75"/>`
      + `<text class="hx-pt" x="0" y="${n(ym + 3.15)}" text-anchor="middle" font-family="Inter, sans-serif" font-weight="600" font-size="${fz}" fill="${o.gold ? '#f3d68e' : o.col || '#f2ead8'}"><tspan ${o.zt != null ? `data-zt="${o.zt}"` : ''}>${txt}</tspan>${o.sub ? `<tspan font-weight="500" fill="#a89e90" dx="1.2">${o.sub}</tspan>` : ''}</text>`;
  }
  const lockSeal = m => `<g transform="translate(0 -3.5)"><circle r="10" fill="${INK}" opacity=".45" transform="translate(.8 1.6)"/><circle r="9" fill="url(#hxMuhur)" stroke="${INK}" stroke-width="1.2"/><circle r="7.7" fill="none" stroke="${m.mM}" stroke-opacity=".6" stroke-width=".6"/>`
    + `<g transform="translate(-5.7 -6) scale(.475)" fill="none" stroke="#d9d0c2" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round">${EMB.kilit}</g></g>`;
  const needTag = t => { const w = Math.max(14, t.length * 2.55 + 5); return `<g transform="translate(0 15.5)"><rect x="${n(-w)}" y="-5.4" width="${n(2 * w)}" height="10.8" rx="5.4" fill="${INK}" fill-opacity=".82" stroke="#e2705f" stroke-opacity=".55" stroke-width=".7"/>`
    + `<text x="0" y="2.7" text-anchor="middle" font-family="Inter, sans-serif" font-weight="600" font-size="7.4" fill="#eaa293">${t}</text></g>`; };
  // "buradasın": adadaki pilot halkasının küçüğü — koyu disk, altın halka, meslek amblemi
  const hereSeal = prof => `<g transform="translate(0 -3.5)"><circle r="17" fill="url(#hxGlow)" opacity=".2"/><circle r="12.4" fill="url(#hxMuhur)" stroke="${INK}" stroke-width="1.3"/>`
    + `<circle r="10.6" fill="none" stroke="#e7c26a" stroke-width="1.8"/>${emblem(prof, 0, .2, 13.5, 1.9)}</g>`;

  /* ---------- saha altıgeninin ön yüzü ----------
     o: { t, q (0–3; Kıyı 4), lock, here, prof, time, zt, need } — seçim halesi ve karartma CSS ile açılır (.zh.sel, .wm-bloom.pick) */
  function saha(o) {
    const m = QQ[o.q] || QQ[0], q = Math.min(o.q, 4), lock = !!o.lock;
    let s = `<path d="${ring(-1.1, PIC, 4.6)}" fill-rule="evenodd" fill="${INK}"/>`;
    s += `<g clip-path="url(#hxKResim)"><rect x="-50" y="${n(-HH)}" width="100" height="${n(2 * HH)}" fill="url(#hxResim)"/><rect x="-50" y="${n(-HH)}" width="100" height="${n(2 * HH)}" fill="url(#hxResimV)"/><rect class="hx-dim" x="-50" y="${n(-HH)}" width="100" height="${n(2 * HH)}" fill="#0b0a0a"/></g>`;
    s += `<g opacity="${lock ? .62 : 1}">${bezel(o.t, m, q)}<path d="${ring(0, GB1 + .2)}" fill-rule="evenodd" fill="url(#hxIsik)"/>${ornaments(o.t, m)}${q < 4 ? gems(o.q) : ''}</g>`;
    s += tierPlate(o.t, lock);
    // kilitli sahada da alttaki levhada kalan süre yazar (ne zaman yenileneceği belli olsun); gereken alet kilit mührünün altındaki şeritte
    if (lock) s += lockSeal(m) + needTag(o.need || '');
    s += plaque(m, String(o.time != null ? o.time : ''), { sub: 'dk', gold: !!o.here, zt: o.zt, col: lock ? '#cdbfae' : null });
    if (o.here) s += hereSeal(o.prof || 'odun');
    s += `<g class="hx-sel"><path d="${hp(-3.4, 6)}" fill="none" stroke="${INK}" stroke-width="2.6"/><path d="${hp(-3.4, 6)}" fill="none" stroke="#f3d68e" stroke-width="1.35"/><path d="${hp(-4.2)}" fill="none" stroke="#f3d68e" stroke-width="4" opacity=".22"/></g>`;
    return `<svg class="hx-fr" viewBox="-50 ${n(-HH)} 100 ${n(2 * HH)}" overflow="visible" aria-hidden="true">${s}</svg>`;
  }

  /* ---------- bölge mührü ----------
     o: { prof, rc (bölge rengi), crestQ (girilebilen en iyi nitelik 2–3), work (çalışıyorsun), k (ekrandaki ölçek: W/100, ince çizgiler için) } */
  function crest(q, k) {
    const m = QQ[q], gw = 2.5 / k, gh = 3.5 / k, sp = 5.6 / k, w = (q - 1) * sp + 2 * gw + 7 / k, h = 2 * gh + 3.4 / k, y = -HH - .6 / k, c = h / 2 / S3;
    const d = `M${n(-w / 2)} ${n(y)}L${n(-w / 2 + c)} ${n(y - h / 2)}H${n(w / 2 - c)}L${n(w / 2)} ${n(y)}L${n(w / 2 - c)} ${n(y + h / 2)}H${n(-w / 2 + c)}Z`;
    let s = `<path d="${d}" fill="url(#hxPlak)" stroke="${INK}" stroke-width="${n(2 / k)}"/><path d="${d}" fill="none" stroke="#c9a24e" stroke-width="${n(.7 / k)}"/>`;
    for (let i = 0; i < q; i++) { const x = (i - (q - 1) / 2) * sp;
      s += `<path d="M${n(x)} ${n(y - gh)}L${n(x + gw)} ${n(y)}L${n(x)} ${n(y + gh)}L${n(x - gw)} ${n(y)}Z" fill="url(#hxTas${q})" stroke="${INK}" stroke-width="${n(.6 / k)}"/>`
        + `<path d="M${n(x)} ${n(y - gh)}L${n(x + gw)} ${n(y)}L${n(x)} ${n(y + gh)}" fill="${mix(m.rc, '#120c08', .5)}" opacity=".4"/>`; }
    return s;
  }
  function bolge(o) {
    const k = o.k || .54, g = GOLD, work = !!o.work;
    let s = '';
    if (work) { const r = 50 + 6 / k;
      s += `<circle r="${n(r)}" fill="none" stroke="${INK}" stroke-width="${n(3.6 / k)}" opacity=".8"/><circle r="${n(r)}" fill="none" stroke="#f0cf78" stroke-width="${n(2 / k)}"/><circle r="${n(r + 2.6 / k)}" fill="none" stroke="#e7c26a" stroke-width="${n(3 / k)}" opacity=".18"/>`; }
    s += `<path d="${hp(-1.2, 4.7)}" fill="${INK}"/><path d="${hp(3)}" fill="url(#hxZemin)"/><path d="${hp(3)}" fill="${o.rc}" opacity="${work ? .2 : .1}"/><path d="${hp(3)}" fill="url(#hxLatG)"/>`;
    s += `<circle cy="-2" r="34" fill="url(#hxGlow)" opacity="${work ? .14 : .08}"/>`;
    s += `<path d="${ring(0, 3.6)}" fill-rule="evenodd" fill="${g.mD}"/><path d="${hp(1.8)}" fill="none" stroke="${INK}" stroke-opacity=".5" stroke-width="3.6"/><path d="${hp(1.8)}" fill="none" stroke="url(#hxAltin)" stroke-width="2.4"/><path d="${hp(1.8)}" fill="none" stroke="#fff3cc" stroke-width=".55" opacity=".6"/>`;
    s += `<path d="${hp(4.6)}" fill="none" stroke="${INK}" stroke-width=".9"/><path d="${hp(5.3)}" fill="none" stroke="${o.rc}" stroke-opacity=".9" stroke-width="1.05"/><path d="${hp(7.7)}" fill="none" stroke="#f6dc94" stroke-width="1" stroke-linecap="round" stroke-dasharray="0 3.1" opacity=".5"/>`;
    s += `<path d="${ring(0, 5.6)}" fill-rule="evenodd" fill="url(#hxIsik)"/>`;
    s += [0, 3].map(i => atV(i, `<path d="M-.4 0L3.4 -2.7L7.2 0L3.4 2.7Z" fill="${g.mL}" stroke="${g.mD}" stroke-width=".8"/>`)).join('') + [1, 2, 4, 5].map(i => atV(i, `<circle cx="3.1" r="1.5" fill="${g.mL}" stroke="${g.mD}" stroke-width=".55"/>`)).join('');
    s += emblem(o.prof, 0, -.5, 50, 1.6);
    if (o.crestQ) s += crest(o.crestQ, k);
    s += `<g class="hx-sel"><path d="${hp(-3.6, 6.2)}" fill="none" stroke="${INK}" stroke-width="2.6"/><path d="${hp(-3.6, 6.2)}" fill="none" stroke="#f3d68e" stroke-width="1.35"/></g>`;
    return `<svg class="hx-fr" viewBox="-50 ${n(-HH)} 100 ${n(2 * HH)}" overflow="visible" aria-hidden="true">${s}</svg>`;
  }
  // kartta ve başlıkta küçük nitelik taşları (HTML içinde satır içi)
  const gemRow = q => q > 0 && q < 4 ? `<svg class="hx-gems" viewBox="${n(-q * 3.6)} -6 ${n(q * 7.2)} 12" aria-hidden="true">${gems(q, 0, 6.55, .95)}</svg>` : '';
  return { sprite, saha, bolge, clip, gemRow, QQ };
})();
