/* Saha manzarası — KADİM HARABE (Yaratık Avı). Dünya haritasında saha altıgeninin içindeki küçük resim: yıkık bir harabe ve orada dolaşan o kademenin yaratıkları.
   opt: t (1–5: Balçık, Yaban Kurdu, İskelet, Trol, Hayalet) · seed (yerleşim) · q (0–3 nitelik: zenginleştikçe ışık ve ayrıntı artar).
   Kuruluş y-saha-odun.js ile aynı: kadraj koordinatı (u, v); arkada yıkık duvar ve sütun kütlesi, yanlarda çerçeve,
   ortada yaratıklar, önde av izleri (kırık kalkan, paslı kılıç, kemik, meşale). Yaratıklar ekran pikseliyle çizilir. */
(function (K) {
  'use strict';
  const { M, pr, f1, tone, kf, ks, circ, ell, ln, rng } = K;
  const path = (cls, d, extra = '') => d ? `<path class="${cls}"${extra} d="${d}"/>` : '';
  const sd = (col, d, o) => d ? `<path class="${kf(col)}" opacity="${o}" d="${d}"/>` : '';      // yarı saydam dolgu
  const PT = (x, y, z = 0) => { const p = pr(x, y, z); return f1(p[0]) + ' ' + f1(p[1]); };
  // mutlak yol metnini (M L Q C H V Z) ölçekle, aynala, taşı: x' = ox + x·s·d, y' = oy + y·s
  const tf = (s, d, ox, oy, str) => str.replace(/([MLQCHVZ])([^MLQCHVZ]*)/g, (m, c, a) => c + (a.match(/-?\d*\.?\d+/g) || []).map((n, i) => c === 'V' || (c !== 'H' && i % 2) ? f1(oy + n * s) : f1(ox + n * s * d)).join(' '));
  const golge = (rx, ry, dx = 0, o = .3) => `<ellipse cx="${f1(dx)}" cy="0" rx="${f1(rx)}" ry="${f1(ry)}" fill="#1b2440" opacity="${o}"/>`;
  // gece ışıması (yalnız gece görünür)
  const gid = (id, a, c) => K.DEF(id, () => `<radialGradient id="${id}"><stop offset="0" stop-color="${a}" stop-opacity=".8"/><stop offset=".45" stop-color="${c}" stop-opacity=".3"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`);
  const hale = (x, y, R, id) => `<circle class="Nl" cx="${f1(x)}" cy="${f1(y)}" r="${f1(R)}" fill="url(#${id})"/>`;
  // yaprak kümesi (orman dosyasıyla aynı dil)
  const cluster = (cx, cy, R, n, r, sq = .82) => { const cs = [[cx, cy, R * .64]]; for (let i = 0; i < n; i++) { const a = i / n * 6.283 + r() * .6, d = R * (.4 + r() * .22); cs.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d * sq, R * (.34 + r() * .18)]); } return cs; };
  const canopy = (cs, R, col) => { const up = cs.filter(c => c[1] <= cs[0][1] + R * .12 && c[0] <= cs[0][0] + R * .3);
    return path(kf(tone(col, -.34)), cs.map(c => circ(c[0], c[1], c[2])).join('')) + path(kf(col), cs.map(c => circ(c[0] - R * .09, c[1] - R * .12, c[2] * .8)).join(''))
      + path(kf(tone(col, .26)), up.map(c => circ(c[0] - R * .17, c[1] - R * .22, c[2] * .5)).join('')); };

  /* ================= YARATIKLAR (ekran pikseli; ayak noktası 0,0; s ölçek; d: 1 sağa, −1 sola bakar) ================= */
  // I · balçık: yarı saydam parlak yeşil kütle, koyu çekirdek; büyüğünün içinde yuttuğu kafatası
  const BL = { a: '#78c44a>#62e690', o: '#4a9334>#34a86a', k: '#255a20>#1f7050', p: '#d6f49c>#c4f8d8', z: '#2f5a22' };
  // gövde: tabanı yayılan, akışkan kubbe (kusursuz yarım küre değil); e: 1 / −1 asimetrinin yanı
  const balcik = (s, kafa, e = 1) => { const T = str => tf(s, e, 0, 0, str), C = (x, y, rr) => circ(x * s * e, y * s, rr * s);
    return hale(0, -5 * s, 24 * s, gid('yrBl', '#c8ffb8', '#3fd07a'))
      + sd(BL.z, T('M-15.4 1.4C-15 -1.8 14.6 -2.2 16.4 .9C15.4 3.8 -13.8 4.2 -15.4 1.4Z') + C(-17.2, 2.4, 1.3) + C(18, 1.2, .9) + C(13.6, 3.8, .8), .4)
      + sd(BL.a, T('M-13.8 .6C-14 -1.2 -12.2 -2.2 -10.6 -2.8C-11.4 -8.6 -6.8 -14.4 -.6 -14.6C6 -14.8 11.2 -9.8 10.6 -3.6C12.4 -3 14.6 -1.6 14 .4Q0 3.8 -13.8 .6Z')
        + C(-15.8, .2, 1.4) + C(15.6, -.4, 1), .88)
      + sd(BL.o, T('M14 .4C14.6 -1.6 12.4 -3 10.6 -3.6C11.2 -9.8 6 -14.8 -.6 -14.6C5.2 -12.6 8.6 -8.4 8.2 -3.2Q10 -1.8 10.4 -.4Q0 1.6 -13.4 -.4L-13.8 .6Q0 3.8 14 .4Z'), .74)
      + sd(BL.k, T('M-4.8 -4.4C-5.2 -8.8 5.8 -9.8 7 -5.4C7.8 -1.6 -4.6 -.8 -4.8 -4.4Z'), .55)
      + (kafa ? sd('#f1ead0', T('M-.6 -6C-.6 -9.6 5 -9.6 5 -6C5 -4.9 4.4 -4.2 3.9 -4V-2.9H.5V-4C-.1 -4.2 -.6 -4.9 -.6 -6Z'), .62) + sd('#1c3416', T('M.4 -6.7H1.9V-5.2H.4ZM2.5 -6.7H4V-5.2H2.5Z'), .6) : '')
      + sd(BL.p, C(-3.8, -7.6, 1) + C(4.6, -10.8, .65) + C(-1.2, -2.8, .75) + C(7.4, -7.2, .55) + C(-6.6, -4.4, .5), .8)
      + sd(BL.p, T('M-10 -3C-11 -8.6 -6.6 -13.8 -.9 -14C-5.4 -12.6 -8.8 -8.6 -8.6 -3.2Z'), .9)
      + sd(BL.p, T('M10.3 -3.8C10.6 -6.8 9.6 -9.4 7.8 -11.2C10 -9.8 11 -7 10.8 -3.8Z'), .55)
      + sd('#ffffff>#eafff0', T('M-7.2 -9.2Q-6.6 -12.2 -3.2 -12.4Q-2.4 -11.6 -3 -11Q-5.6 -10.8 -7.2 -9.2Z') + C(-1.2, -13, .7), .94);
  };
  // II · yaban kurdu: kapkara, yelesi kabarık, uzun bacaklı; amber gözler, açık ağızda dişler
  const KR = { k: '#1b1817', g: '#2c2826', o: '#45403b', a: '#6e665d', m: '#58514b', e: '#ffb43a>#ffd65e' };
  const kurt = (s, d) => { const T = str => tf(s, d, 0, 0, str);
    // parçalar aynı yönde çizilir (birleşik siluet): kuyruk, arka but, gövde, ön bacak, yele, baş
    return golge(13 * s, 2.6 * s, -1 * s * d)
      + path(kf(KR.k), T('M3 -8.8L5.6 -8.4L5.2 -4.8L5.4 -1.6L6.4 -.3V0H3.4L3.6 -1.4L3.2 -4.8ZM-8.6 -11.6L-5 -11.2L-5.2 -8.6L-7.2 -5L-7 -1.2L-6 -.3V0H-8.8L-9 -1.2L-9.4 -5L-9.6 -8.6Z'))
      + path(kf(KR.g), T('M-18.4 -5.4C-18.8 -12 -15.6 -16 -11 -16.2L-11.2 -12.6C-13.2 -12 -14.6 -10.6 -15.4 -9.2L-15.9 -10.4C-16.4 -8.8 -17.2 -7.2 -18.4 -5.4Z'
        + 'M-12.6 -13.6L-6.4 -12.4C-6.4 -10.6 -6.8 -9.6 -7.2 -8.8L-9.6 -5.2L-9.4 -1.2L-8.2 -.3V0H-11.6L-11.8 -1L-12.6 -4.6C-13.4 -6.4 -14 -8.4 -13.8 -10C-13.6 -11.6 -13.2 -12.8 -12.6 -13.6Z'
        + 'M-12 -15.8C-8 -16.8 -4 -16.8 0 -16.8L3 -17.6L9.6 -15C10.8 -14 11 -12.8 10.6 -11.6L8.6 -7.8L4.6 -8.8L2.2 -9.2L1.2 -8.6L0 -9.8L-1.2 -9.4L-4 -11.2L-6.6 -11.6L-12.4 -12.6C-13.2 -13.4 -13.2 -14.6 -12 -15.8Z'
        + 'M4.6 -9.2L8.8 -8.4L8.4 -5L8.6 -1.6L10.2 -.3V0H6.8L7 -1.4L6.4 -4.8Z'
        + 'M1.6 -17.4L1.6 -19.4L3.8 -18.6L4 -21.2L6.2 -19.6L6.8 -21.6L8.6 -19.6L9.6 -20.8L10.6 -19L12.6 -18.8L14.6 -14L14.2 -11.6L13 -10.2L12.2 -11L11 -9.4L10.2 -10.4L9 -9.2L8.6 -12.4L4 -15.4Z'
        + 'M12.2 -18.2L12.8 -19.2L14.4 -23.8L15.8 -18.6L16.8 -17.4L18 -16.4C19.6 -15.8 21 -15.2 22.2 -14.6L23 -13.8L22.8 -13L21.8 -12.6L19.6 -12.2L21 -11.8L20.4 -11.2L16.6 -11L14.2 -12L12.2 -15Z'))
      + path(kf(KR.o), T('M-18.4 -5.4C-18.8 -12 -15.6 -16 -11 -16.2L-11.1 -14.6C-14.6 -14.2 -17 -11 -18.4 -5.4Z'
        + 'M-12 -15.8C-8 -16.8 -4 -16.8 0 -16.8L3 -17.6L4 -15.4L1.4 -14.4L-1.6 -15.2L-4.6 -14.2L-7.4 -15.2L-10.2 -14.4L-12.8 -14.8Z'
        + 'M1.6 -17.4L1.6 -19.4L3.8 -18.6L4 -21.2L6.2 -19.6L6.8 -21.6L8.6 -19.6L9.6 -20.8L10.6 -19L12.6 -18.8L13.4 -16.8L11.4 -16.4L9.6 -17.4L7.6 -16.2L5.6 -17.4L3.6 -16Z'
        + 'M12.2 -18.2L12.8 -19.2L14.4 -23.8L15.8 -18.6L16.8 -17.4L18 -16.4C19.6 -15.8 21 -15.2 22.2 -14.6L23 -13.8L22.4 -13.6C20.4 -14 18.6 -14.4 16.6 -14.6L14.2 -15.6L12.6 -16Z'
        + 'M-12.6 -13.6L-6.4 -12.4C-6.6 -11.4 -7 -10.6 -7.6 -10C-9.4 -11.6 -11.4 -12.4 -13.4 -12.2Z'))
      + path(kf(KR.m), T('M16.6 -11.2Q17.6 -13.6 21 -13.4L21.8 -12.6L19.6 -12.2L21 -11.8L20.4 -11.2Z'))
      + path(kf(KR.a), T('M4.1 -20.6L4.4 -18.8L5.4 -19.3ZM6.9 -21L7.2 -19.1L8.2 -19.6ZM9.6 -20.2L9.6 -18.9L10.4 -19.2ZM1.7 -18.9L2.2 -17.8L3 -18.3ZM.8 -16.6Q-4 -16.6 -9.6 -15.8Q-4 -15.6 .8 -15.9ZM14.5 -23.2L15.6 -18.8L15 -18.8ZM18.2 -16Q20.4 -15.2 22.4 -14.2Q20 -14.6 17.8 -15.4ZM-12.4 -13.4Q-9.6 -13.6 -7 -12.6Q-9.6 -12.9 -12 -12.8ZM3.6 -16.4Q7 -16.6 9.4 -14.6Q6.6 -15.4 3.8 -15.6Z'))
      + path(kf('#3a2420'), T('M14.2 -22.6L13.8 -19.6L15 -19.4Z')) + path(kf('#4a1612'), T('M17.2 -11.6L19.6 -12.2L21.4 -12.5L20.4 -11.9Z'))
      + path(kf('#efe6d2'), T('M20.8 -12.5L21 -11.7L21.3 -12.5ZM19.2 -12.2L19.4 -11.5L19.7 -12.2Z')) + path(kf('#100e0d'), circ(22.7 * s * d, -13.4 * s, .85 * s))
      + path(kf('#141110'), T('M16.6 -16.4L19.2 -15.6L16.8 -15.4Z')) + path(kf(KR.e), T('M17 -15L18.1 -15.7L19.1 -15.1L18 -14.6Z')) + hale(18 * s * d, -15.1 * s, 5 * s, gid('yrAm', '#ffd27a', '#ff9a30'));
  };
  // III · iskelet: paslı kılıç, yuvarlak kalkan, çatık göz çukurlarında köz. o.alt: kılıç önde · o.kask: paslı miğfer
  const IS = { b: '#e8e1cf', g: '#b7ac96', o: '#38312e', c: '#262123' };
  const iskelet = (s, o = {}) => { const T = str => tf(s, 1, 0, 0, str), C = (x, y, rr) => circ(x * s, y * s, rr * s), W = w => ` stroke-width="${f1(w * s)}"`;
    const kem = 'M-2.4 -13.8L-3.1 -7.4L-3.4 -1.2L-5.6 -.3M2.4 -13.8L3.3 -7.4L3.7 -1.2L5.9 -.3M0 -14V-25.8M-5.1 -24.8L-7.6 -20L-6.4 -15.8' + (o.alt ? 'M5.1 -24.8L8.6 -20.4L11.6 -17.6' : 'M5.1 -24.8L8.4 -21.2L10.4 -26');
    const kaf = C(0, -29.8, 3.1) + T('M-2.1 -28L-1.8 -25.7H1.8L2.1 -28Z'), kafes = T('M-4.7 -25.2Q-5.8 -19.6 -3.6 -16.2Q0 -15.2 3.6 -16.2Q5.8 -19.6 4.7 -25.2Q0 -26.6 -4.7 -25.2Z'), leg = T('M-3.8 -15Q-3.6 -12 -1.4 -11.8L0 -12.8L1.4 -11.8Q3.6 -12 3.8 -15Q0 -13.8 -3.8 -15Z');
    const kl = o.alt ? ['M12.2 -18.4L21.6 -13.6L21.2 -12.6L11.6 -17.2Z', 'M11.2 -19.8L12.8 -15.6', 'M11.6 -17.6L9.6 -18.6', [9.2, -18.8], 'M14 -17.2L15 -17.4L14.6 -16.4ZM17.6 -15.6L18.6 -15.6L18 -14.8Z', 'M12.6 -18.2L21.4 -13.6']
      : ['M9.7 -26.6L13.5 -39.2L14.6 -38.8L10.9 -26.2Z', 'M7.8 -25.2L12.6 -27.6', 'M10.2 -25.8L9.5 -23.4', [9.3, -22.9], 'M11.2 -31L12.2 -31.6L11.8 -30.2ZM12.4 -35L13.2 -35.8L13 -34.4Z', 'M10.4 -27L14 -38.8'];
    return golge(8 * s, 2.2 * s, 0)
      // kontur: bütün kemiklerin koyu dış çizgisi tek geçişte, sonra kemik rengi
      + path('Ln ' + ks(IS.o), T(kem), W(3.4)) + path('Ln ' + ks(IS.o), kaf + kafes + leg, W(1.8)) + path('Ln ' + ks(IS.b), T(kem), W(1.7))
      + path(kf(IS.c), kafes) + path('Ln ' + ks(IS.b), T('M-4.1 -23.4Q0 -21.8 4.1 -23.4M-4.4 -21.3Q0 -19.7 4.4 -21.3M-4.1 -19.2Q0 -17.8 4.1 -19.2M-3.4 -17.4Q0 -16.4 3.4 -17.4M0 -25.4V-18.6'), W(1.1))
      + path('Ln ' + ks(IS.b), T('M-5.4 -25.2Q0 -26.8 5.4 -25.2'), W(1.4)) + path(kf(IS.b), leg)
      + path(kf(IS.b), kaf) + path(kf(IS.g), T('M3.1 -29.8C3.1 -27.4 1.6 -26.4 0 -26.4C1.4 -27.2 2.2 -28.2 2.1 -30C2.1 -31.4 1.6 -32.3 .8 -32.8C2.2 -32.4 3.1 -31.2 3.1 -29.8Z')) + path(kf('#f8f4ea'), C(-1, -31.4, .9))
      + path(kf('#171315'), T('M-2.4 -30.6L-.5 -29.8L-.7 -28.3L-2.1 -28.6ZM2.4 -30.6L.5 -29.8L.7 -28.3L2.1 -28.6ZM-.35 -28L.35 -28L0 -27.1Z'))
      + path(kf('#7a2a1a>#ff5a2e'), C(-1.3, -29.2, .38) + C(1.3, -29.2, .38)) + path('Ln ' + ks(IS.o), T('M-1.5 -26.5H1.5M-.5 -27V-25.9M.5 -27V-25.9'), W(.4))
      + (o.kask ? path(kf('#5e544d'), T('M-3.5 -30.6Q-3.4 -34.2 0 -34.2Q3.4 -34.2 3.5 -30.6Z')) + path(kf('#3e3833'), T('M-4 -30.8H4V-29.9H-4ZM-.5 -30L.5 -30L.3 -27.6L-.3 -27.6Z')) + K.dots('#9a5a36', [[-1.6, -32.6], [1.4, -33], [2.4, -31.4]].map(p => [p[0] * s, p[1] * s]), 1 * s) + path(kf('#80766c'), T('M-2.8 -31.4Q-2.4 -33.4 -.4 -33.6Q-2 -32.6 -1.9 -31.2Z')) : '')
      // kalkan: demir çember, tahta yüz, göbek; kenarı kırık
      + path(kf('#3f3b38'), ell(-7.2 * s, -17.6 * s, 6.1 * s, 7 * s)) + path(kf('#8a6444'), ell(-7.2 * s, -17.6 * s, 5.1 * s, 6 * s))
      + path(kf('#6b4b31'), T('M-7.2 -23.6C-3.6 -23.4 -2 -20.4 -2.1 -17.6C-2 -14.4 -3.6 -11.8 -7.2 -11.6C-4.6 -13 -3.8 -15.4 -3.8 -17.6C-3.8 -20 -4.6 -22.4 -7.2 -23.6Z'))
      + path('Ln ' + ks('#5e412a'), T('M-9.6 -23V-12.2M-7.2 -23.6V-11.6M-4.8 -23V-12.2'), W(.6))
      + path(kf('#3f3b38'), T('M-3.2 -13.4L-1.4 -14.2L-2.6 -11.2Z')) + path(kf('#a9a59c'), C(-7.2, -17.6, 1.6)) + path(kf('#dedad2'), C(-7.7, -18.1, .6))
      + K.dots('#9a5a36', [[-9.8, -20.6], [-5.4, -14.4], [-9, -14]].map(p => [p[0] * s, p[1] * s]), 1.3 * s)
      // kılıç: paslı ağız, kabza, topuz
      + path(kf('#a9aca8'), T(kl[0])) + path(kf('#9c5a34'), T(kl[4])) + path('Ln ' + ks('#e8eae6'), T(kl[5]), W(.5))
      + path('Ln ' + ks('#4e4034'), T(kl[1]), W(1.5)) + path('Ln ' + ks('#3a281a'), T(kl[2]), W(1.5)) + path(kf('#6e6052'), C(kl[3][0], kl[3][1], .9));
  };
  // IV · trol: kambur, yeşilimsi gri post, iri yumruklar, çatık kaş, alt çeneden fırlayan dişler; yerde sürüklediği çivili sopa
  const TR = { g: '#6b7f5e', k: '#46563f', a: '#8b9c79', p: '#aab893', b: '#849276', e: '#e2a92c>#ffd040' };
  const trol = s => { const T = str => tf(s, 1, 0, 0, str), C = (x, y, rr) => circ(x * s, y * s, rr * s), W = w => ` stroke-width="${f1(w * s)}"`;
    return golge(28 * s, 5 * s, 5 * s, .34)
      + path(kf('#4e3420'), T('M21.6 -26L25.2 -27L38.4 -8C40.4 -4.2 38.2 -.4 34 -.4C30.4 -.6 29.4 -3.4 30.4 -6.8Z')) + path(kf('#7a5634'), T('M21.6 -26L23.4 -26.6L35.2 -9C34 -7 32 -5.6 30.4 -6.8Z'))
      + path(kf('#4a4744'), T('M29.8 -10.6L36.8 -13L38 -10.8L30.8 -8Z')) + path(kf('#a19e96'), T('M36.4 -11L41.2 -13.2L38.8 -9.4ZM39.2 -5.8L43.6 -5.4L39.4 -3.4ZM32.2 -1.6L30.8 2.4L34.4 -.2Z'))
      + path(kf(TR.k), T('M-13.4 -17C-16 -12 -15.6 -6 -15 -2.6L-18 -.8L-17.8 .8H-7.4L-7.8 -2.2C-8.4 -6 -7.6 -11 -5.2 -15ZM5.2 -15C7.6 -11 8.4 -6 8 -2.2L7.6 .8H17.8L18 -.8L15 -2.6C15.6 -6 16 -12 13.4 -17Z'))
      + path(kf(TR.g), T('M-12.8 -16.4C-15 -12 -14.6 -6 -14 -2.8L-16.2 -1.2L-9.8 -1.4C-10.6 -6 -10 -11 -7.4 -15ZM6.2 -15C8.2 -11 9.2 -6 9.2 -2.6L11 -1.2L13.4 -2.6C13 -7 12.6 -12 11 -16Z'))
      + path('Ln ' + ks('#d9d0b6'), T('M-17 .2L-17.6 -1M-14.8 .4L-15.2 -1M-12.6 .4L-12.8 -1M9 .4L9.2 -1M11.4 .4L11.8 -1M13.8 .2L14.4 -1'), W(.9))
      + path(kf(TR.g), T('M-14 -15C-19.4 -20 -21.4 -30 -20 -38.4C-18.8 -44.6 -14.2 -49.2 -8 -52C-3 -54.4 4 -54.4 9 -51.4C14.8 -48.2 19.4 -43.4 20.2 -36.8C21 -29 18.8 -20 14 -15C8 -12.4 -8 -12.4 -14 -15Z'))
      + path(kf(TR.b), T('M-9.4 -16C-12.2 -20 -12 -27 -8.4 -30.2C-3.2 -33 4 -33 8.2 -30.2C11.8 -27 12 -20 9.4 -16C4 -14.2 -4 -14.2 -9.4 -16Z'))
      + path(kf(TR.k), T('M20.2 -36.8C21 -29 18.8 -20 14 -15C8 -12.4 -2 -12.6 -6 -13.4C4 -14.4 11.8 -18 14.6 -26C16.2 -31 16.2 -40 12.8 -46.8C16.8 -44.2 19.6 -40.8 20.2 -36.8Z'))
      + path(kf(TR.a), T('M-19.6 -36.4C-19 -43 -14.2 -48.4 -8 -51.4C-3 -53.8 2 -54 6 -53C0 -51.6 -6 -48.8 -10.6 -44.2C-14.2 -40.6 -16.2 -36.2 -16.8 -31.2C-17.8 -32.6 -19.8 -33.8 -19.6 -36.4Z'))
      + path(kf(TR.p), T('M-10.4 -49.6C-6.2 -52.4 -1 -53.6 3 -53.2C-2 -52 -6.2 -50.6 -9.2 -48.4Z'))
      + path('Ln ' + ks('#a7b096'), T('M-6 -26L-2.6 -22.4M8.4 -24.6L5.6 -20.8'), W(.7))
      + path(kf('#6e4c30'), T('M-14.6 -17.6L14.6 -17.6L13.2 -10.6L9.8 -12.2L7.2 -7.4L3.6 -11.6L.2 -6.6L-3.4 -11.4L-6.8 -7.6L-9.8 -12.2L-13.4 -10.4Z')) + path(kf('#3e2c1e'), T('M-14.8 -18.8H14.8V-16.6H-14.8Z'))
      // göğüste çapraz kayış, bağlı kemikler
      + path('Ln ' + ks('#3e2c1e'), T('M-17.6 -37.6L13.6 -19.2'), W(1.8)) + path(kf('#e2dac4'), T('M-11 -34.2L-8.8 -32.6L-10.2 -31ZM-4.6 -30.4L-2.4 -28.8L-3.8 -27.2ZM1.6 -26.8L3.8 -25.2L2.2 -23.6Z'))
      + path(kf(TR.k), T('M-19.8 -44C-24.8 -40 -26.8 -32 -26.2 -24L-25.8 -14.4L-19.8 -14.4L-19.4 -24C-19.6 -30 -17.6 -35 -14 -38Z')) + path(kf(TR.a), T('M-19.8 -44C-24.8 -40 -26.8 -32 -26.2 -24L-25.8 -15L-23.8 -15L-23.6 -24C-23.8 -31 -21.8 -37 -17.6 -41Z'))
      + path(kf(TR.g), C(-23, -11.6, 4.8)) + path(kf(TR.a), C(-24.2, -12.8, 2.6))
      + path(kf(TR.k), T('M15 -46.2C21.2 -44.2 25.8 -38 26.8 -30L27.2 -20.4L21.4 -20L21 -28.4C20.6 -33.4 18.2 -37.4 14.4 -39.4Z')) + path(kf(TR.g), T('M15 -46.2C21.2 -44.2 25.8 -38 26.8 -30L27 -24L24.4 -24L24 -29C23.4 -34 20.6 -39 15.6 -41.4Z'))
      + path(kf(TR.g), C(24.4, -19.4, 4.4)) + path(kf(TR.a), C(23.2, -20.6, 2.2))
      // baş: omuzlara gömük; kalın çatık kaş, sarkık burun, alt çene önde
      + path(kf(TR.g), T('M-6 -38.6C-6.4 -44.4 -2.4 -47.2 1.6 -47.2C5.6 -47.2 9.6 -44.4 9.2 -38.6C9.8 -34 7.6 -30.4 1.6 -30.2C-4.4 -30.4 -6.6 -34 -6 -38.6Z')) + path(kf(TR.a), T('M-5.6 -40C-5.4 -44.4 -2 -46.6 1.6 -46.6C-1 -45.4 -3 -43.2 -3.4 -40Z'))
      + path(kf(TR.k), T('M-6 -41C-3.6 -41.8 -.6 -40.4 1.6 -39C3.8 -40.4 6.8 -41.8 9.2 -41L8.8 -39.4C6.6 -39.8 3.8 -38.8 1.6 -37.6C-.6 -38.8 -3.4 -39.8 -5.6 -39.4ZM-5.6 -39.8L-11.4 -43L-6.2 -36.6ZM8.8 -39.8L14.6 -43L9.4 -36.6Z'))
      + path(kf(TR.e), T('M-3.6 -38.6L-.8 -37.8L-1 -37.2L-3.4 -37.8ZM4 -37.8L6.8 -38.6L6.6 -37.8L4.2 -37.2Z')) + path(kf(TR.a), T('M1.6 -38C3.4 -36 3.6 -34 2.4 -33C1 -33.6 .2 -35.6 1.6 -38Z'))
      + path(kf(TR.k), T('M-4.6 -33.4Q1.6 -35.2 7.8 -33.4L7.2 -32.2Q1.6 -33.6 -4 -32.2Z')) + path(kf('#ece4cc'), T('M-3.4 -32.8L-2.6 -36.6L-1.8 -32.6ZM5 -32.6L5.8 -36.6L6.6 -32.8Z'))
      + K.dots(TR.k, [[-13, -27], [-11, -33], [13, -30], [11, -24], [-17, -22], [16, -38]].map(p => [p[0] * s, p[1] * s]), 1.6 * s)
      + path(kf('#56723a'), C(-14, -47, 3) + C(-10.4, -49.6, 2.6) + C(-17.2, -44.4, 2.2)) + path(kf('#7d9a4c'), C(-14.6, -48, 1.6) + C(-11, -50.6, 1.4))
      + hale(1.6 * s, -38 * s, 5.5 * s, gid('yrSr', '#ffd27a', '#ffa030'));
  };
  // V · hayalet: öne eğik sivri kukuleta, karanlık yüz boşluğunda iki ışık noktası, pençeli uzanan kol, yırtık etek
  const HY = { g: '#d6d0f8>#c6bcff', a: '#f6f4ff>#eeeaff', k: '#8a80cc>#8a7cf0', y: '#1e1640>#120a30', e: '#e8f4ff>#ffffff' };
  // gövde aşağı doğru saydamlaşır (sınıflı geçiş: gece rengi de değişir)
  const hyG = () => K.DEF('yrHyG', () => `<linearGradient id="yrHyG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="${K.kg(HY.g)}" stop-opacity=".9"/><stop offset=".5" class="${K.kg(HY.g)}" stop-opacity=".66"/><stop offset="1" class="${K.kg(HY.g)}" stop-opacity=".02"/></linearGradient>`);
  const hayalet = (s, d = 1) => { const T = str => tf(s, d, 0, 0, str), W = w => ` stroke-width="${f1(w * s)}"`;
    return hale(2 * s * d, -22 * s, 26 * s, gid('yrHy', '#d8d0ff', '#8a70ff'))
      + sd(HY.g, T('M-9.8 -17.4Q-14 -16 -17.6 -17Q-14.6 -13.4 -9.6 -13.2ZM-8.6 -11Q-12 -9 -15.2 -8.8Q-12 -6.4 -7.6 -7.6Z'), .32)
      + `<path fill="url(#${hyG()})" d="${T('M6.4 -38.4Q8.6 -34 8.2 -29.4Q9.6 -26.6 11.6 -24.6Q12 -16 8.8 -8Q6.6 -3 5.4 3L3.2 -2.6L1.8 4.2L.4 -3.2L-1.8 2.6L-2.6 -4.4L-5.6 .2L-6.2 -6.4Q-9.6 -12 -10.2 -19.4Q-10.4 -27 -6.8 -32.6Q-2.6 -37.6 6.4 -38.4Z')}"/>`
      + sd(HY.k, T('M11.6 -24.6Q12 -16 8.8 -8Q6.6 -3 5.4 3Q5.2 -2.6 6.6 -7.4Q8.8 -14.6 8.6 -22.6Z'), .42)
      + sd(HY.a, T('M-9.4 -19.6Q-9.6 -27 -6.2 -32Q-2.8 -36.6 3.6 -37.8Q-2 -35.6 -4.8 -31Q-7.6 -26 -7.2 -18.4Q-7 -13.4 -5.4 -9Q-8.8 -13.4 -9.4 -19.6Z'), .6)
      + path('Ln ' + ks(HY.k), T('M2 -23Q1.4 -14 2.4 -5M-3 -24Q-4.4 -15 -3.6 -7'), W(.7) + ' opacity=".45"')
      + sd(HY.g, T('M8.4 -26.4Q13.6 -27 17.8 -23.4L16.4 -21.6Q12.8 -24 9 -22.8Z'), .72)
      + path('Ln ' + ks(HY.a), T('M17.4 -23.2Q19.4 -24.4 20.8 -23.2M17.2 -22.4Q19.6 -22.2 20.4 -20.4M16.6 -21.8Q17.8 -21 18.2 -19.2'), W(.6))
      + sd(HY.y, T('M3 -34.2Q6.6 -33.8 7.6 -30.2Q7.8 -26.8 5.4 -25.6Q3 -25.6 2.2 -28Q1.6 -31.6 3 -34.2Z'), .92)
      + path(kf(HY.e), T('M3.5 -30.2L4.9 -30.9L4.7 -30.1ZM5.6 -30.5L6.9 -31.2L6.8 -30.3Z'));
  };

  /* ================= AV İZLERİ VE SÜSLER (ekran pikseli) ================= */
  // dayalı kırık kalkan
  const kalkanCiz = (s, c = '#7d5a3a') => { const C = (x, y, rr) => circ(x * s, y * s, rr * s), T = str => tf(s, 1, 0, 0, str);
    return golge(7 * s, 1.8 * s, 2 * s, .25) + path(kf('#3c3835'), T('M-5.6 -1C-7.4 -4.6 -6.4 -10.4 -2.2 -12.6C1.8 -14.4 5.8 -12 6.4 -7.6C6.8 -3.8 4.6 -.4 .6 .4C-2 .8 -4.2 .4 -5.6 -1Z'))
      + path(kf(c), T('M-4.6 -1.6C-6 -4.8 -5.2 -9.8 -1.8 -11.6C1.6 -13.2 4.8 -11 5.4 -7.4C5.8 -4.2 3.8 -1.2 .4 -.6C-1.8 -.2 -3.6 -.6 -4.6 -1.6Z'))
      + path(kf(tone(c, -.24)), T('M-1.8 -11.6C1.6 -13.2 4.8 -11 5.4 -7.4C5.8 -4.2 3.8 -1.2 .4 -.6C2.6 -2.6 3.4 -5 3.2 -7.4C3 -9.6 1.2 -11.4 -1.8 -11.6Z'))
      + path(kf('#3c3835'), T('M1.4 -.8L2.8 -4.6L4.6 -3.4L4.2 -1.6Z')) + path(kf('#a7a39a'), C(.2, -6.2, 1.5)) + path(kf('#e0dcd2'), C(-.2, -6.7, .5)) + K.dots('#9a5a36', [[-3 * s, -8 * s], [2.4 * s, -10 * s]], 1.2 * s);
  };
  // yere eğik saplanmış paslı kılıç (eğri, kırık balçak)
  const kilicCiz = (s, e = 1) => { const T = str => tf(s, e, 0, 0, str);
    return golge(3.4 * s, 1 * s, -1 * s * e, .25) + path(kf('#9ea19e'), T('M-.4 .4L-5.6 -10.8L-4.4 -11.4L.8 .1Z')) + path(kf('#c9ccc8'), T('M-.4 .4L-5.6 -10.8L-5 -11.1L.2 .3Z'))
      + K.dots('#9a5a34', [[-1.8 * s * e, -3.4 * s], [-3.6 * s * e, -7.4 * s]], 1.4 * s) + path('Ln ' + ks('#4a3c30'), T('M-7.6 -9.6L-4.6 -11.4Q-3 -12 -2.4 -10.6'), ` stroke-width="${f1(1.5 * s)}"`)
      + path('Ln ' + ks('#3a281a'), T('M-5.2 -11.4L-7 -14.6'), ` stroke-width="${f1(1.6 * s)}"`) + path(kf('#6e6052'), circ(-7.3 * s * e, -15.2 * s, 1 * s));
  };
  // kemik (iki uçta topuz) ve yerde kafatası
  const kemik = (x0, y0, x1, y1, w) => ln('#3e3632', `M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}`, f1(w + 1.4)) + ln('#e6dfcc', `M${f1(x0)} ${f1(y0)}L${f1(x1)} ${f1(y1)}`, f1(w)) + path(kf('#e6dfcc'), circ(x0, y0, w * .75) + circ(x1, y1, w * .75));
  const kafatasi = (s, e = 1) => { const T = str => tf(s, e, 0, 0, str);
    return golge(3.4 * s, 1 * s, 0, .25) + path(kf('#3e3632'), T('M-3.4 -2.2C-3.6 -5.6 3.4 -5.8 3.6 -2.4C3.6 -1.2 3 -.4 2.2 0H-2.2C-3 -.4 -3.4 -1.2 -3.4 -2.2Z')) + path(kf('#e6dfcc'), T('M-2.8 -2.3C-3 -5 2.9 -5.1 3 -2.4C3 -1.4 2.5 -.8 1.9 -.5H-1.9C-2.5 -.8 -2.8 -1.4 -2.8 -2.3Z'))
      + path(kf('#2a2426'), T('M-1.9 -2.9H-.5V-1.6H-1.9ZM.6 -2.9H2V-1.6H.6Z')) + path(kf('#fbf7ee'), circ(-1 * s * e, -4 * s, .7 * s));
  };
  // duvar meşalesi: demir kol, sap, alev; gece ışır
  const mesaleCiz = s => path('Ln ' + ks('#2e2a28'), tf(s, 1, 0, 0, 'M0 0L2.6 -2.4M1.4 -1.2L2.4 1.6'), ` stroke-width="${f1(1.3 * s)}"`) + path('Ln ' + ks('#5a3c24'), tf(s, 1, 0, 0, 'M1.8 2L3.4 -5'), ` stroke-width="${f1(1.6 * s)}"`)
    + path(kf('#f08a2a>#ff9a2a'), tf(s, 1, 0, 0, 'M3.4 -5C1.4 -7 2.2 -10 3.6 -12.4C4 -10.4 6 -9.4 5.4 -7C5.2 -5.8 4.4 -5 3.4 -5Z')) + path(kf('#ffd66a>#fff0a0'), tf(s, 1, 0, 0, 'M3.6 -5.6C2.6 -6.8 3 -8.6 3.8 -9.8C4.2 -8.6 5 -7.8 4.6 -6.4C4.4 -6 4.1 -5.7 3.6 -5.6Z'))
    + hale(3.6 * s, -8 * s, 18 * s, K.glowId());
  // mum öbeği: farklı boylu mumlar, akmış mum, alevler
  const mumCiz = (s, n, r) => { let g = '', fl = '', fi = '', w = ''; const hs = [];
    for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * 3 * s + (r() - .5) * s, y = (i % 2 ? 1.2 : 0) * s, h = (3 + r() * 5) * s; hs.push([x, y - h]);
      g += `M${f1(x - 1 * s)} ${f1(y)}V${f1(y - h)}H${f1(x + 1 * s)}V${f1(y)}Z`; w += circ(x - .6 * s, y - h + 1.4 * s, .7 * s);
      fl += `M${f1(x)} ${f1(y - h - 4 * s)}Q${f1(x + 1.4 * s)} ${f1(y - h - 1.4 * s)} ${f1(x)} ${f1(y - h - .3 * s)}Q${f1(x - 1.4 * s)} ${f1(y - h - 1.4 * s)} ${f1(x)} ${f1(y - h - 4 * s)}Z`; fi += circ(x, y - h - 1.2 * s, .55 * s); }
    return golge((n * 1.8 + 2) * s, 1.4 * s, 0, .22) + path(kf('#e9dfc6>#d8c49a'), g) + path(kf('#fbf5e4>#efe2bc'), w) + path(kf('#ffb840>#ffc24a'), fl) + path(kf('#fff4c8>#ffffff'), fi)
      + hs.map(p => hale(p[0], p[1] - 2 * s, 9 * s, K.glowId())).join('') + `<circle class="Dl" cx="0" cy="${f1(-6 * s)}" r="${f1(7 * s)}" fill="#ffd98a" opacity=".16"/>`;
  };
  // kuru ağaç: çarpık gövde, çıplak dallar
  const kuruCiz = (s, e, r, c = '#4b413a') => { const T = str => tf(s, e, 0, 0, str), j = () => (r() - .5) * 3;
    return path(kf(c), T('M-2.6 0C-2 -6 -2.6 -12 -1.2 -19L1 -19C1.4 -12 2 -6 3.2 0Z')) + path(kf(tone(c, .18)), T('M-2.6 0C-2 -6 -2.6 -12 -1.2 -19L-.2 -19C-.6 -12 -.8 -6 -.6 0Z'))
      + path('Ln ' + ks(c), T(`M-.4 -17L${f1(-6 + j())} -25L${f1(-10 + j())} -31M0 -15L${f1(6 + j())} -21L${f1(9 + j())} -29M-6 -25L-3.6 -30.6M6 -21L11.6 -23.4M0 -18.6L1 -28`), ` stroke-width="${f1(1.5 * s)}"`)
      + path('Ln ' + ks(c), T('M-10 -31L-12 -34M-10 -31L-8 -35M9 -29L8 -33.6M9 -29L12.4 -31.6M1 -28L-.4 -32M1 -28L3.4 -31'), ` stroke-width="${f1(.8 * s)}"`);
  };
  // pişmiş toprak amfora (ağzı kırık) ve yerde çömlek kırıkları
  const amforaCiz = s => { const T = str => tf(s, 1, 0, 0, str);
    return golge(5 * s, 1.6 * s, 1.5 * s, .26) + path('Ln ' + ks('#8a4a2c'), T('M-1.3 -12.2Q-3.6 -12 -3.1 -9.2M1.3 -12.2Q3.6 -12 3.1 -9.2'), ` stroke-width="${f1(1 * s)}"`)
      + path(kf('#b8673f'), T('M-1.3 -12.6L-1.2 -10.6Q-4.6 -9.6 -4.4 -6Q-4 -2.4 -.6 .2H.6Q4 -2.4 4.4 -6Q4.6 -9.6 1.2 -10.6L1.3 -12.6Z')) + path(kf('#8e4a2c'), T('M1.2 -10.6Q4.6 -9.6 4.4 -6Q4 -2.4 .6 .2H-.2Q2.6 -3 2.6 -6.4Q2.4 -9.4 .4 -10.4Z'))
      + path(kf('#dc9468'), T('M-3.4 -7Q-3.2 -9.2 -1.4 -9.8Q-2.4 -8.4 -2.6 -6.4Z')) + path(kf('#a85c38'), T('M-1.8 -13.4L-.6 -12.8L.4 -13.6L1.8 -13L1.8 -12.4H-1.8Z')) + path('Ln ' + ks('#8e4a2c'), T('M-3.9 -5.4Q0 -4.4 3.9 -5.4'), ` stroke-width="${f1(.6 * s)}"`); };
  const kirikCiz = s => path(kf('#b8673f'), tf(s, 1, 0, 0, 'M-5 0L-3.2 -1.4L-2.2 .2ZM2 .6L4.4 -.6L4.8 .8ZM-.6 1.4L.8 .4L1.4 1.8Z')) + path(kf('#8e4a2c'), tf(s, 1, 0, 0, 'M-3.2 -1.4L-2.2 .2L-2.6 .4ZM4.4 -.6L4.8 .8L4.4 .9Z'));
  // kuzgun: mezar taşına tünemiş
  const kuzgun = (s, e = 1) => { const T = str => tf(s, e, 0, 0, str);
    return path(kf('#1d1c22'), T('M-4.4 -2.6Q-2 -6.4 1.4 -5.8L3 -7.4Q4.8 -7.6 5 -6.2L6.8 -5.6L5 -5.2Q4.4 -3.6 2.4 -3L1 -1.4L-1.4 -1.6L-4.6 -.2Z')) + path(kf('#3a3a46'), T('M-2.6 -3.6Q-.6 -5.4 1.8 -5L-.4 -3.4Z')) + path(kf('#d8a83a>#ffd060'), circ(3.9 * s * e, -6.5 * s, .45 * s)); };

  /* ================= KADEMELER ================= */
  const KADEME = [null,
    // I · balçık: güneşli, yosunlu avlu; bal rengi taş, su birikintileri
    { zemin: '#86a052', koyu: '#718c45', acik: '#9db766', tas: '#d3c398', tasA: '#e0d3ab', tasK: '#bfae84', duvar: '#d9b77a', yosun: '#6a8f3c', ot: '#55722e', cali: '#5c8a3e', derz: '#6b8b3d' },
    // II · yaban kurdu: uzun otlar arasında yıkık duvarlar, arkada koyu orman
    { zemin: '#9a9a58', koyu: '#83854a', acik: '#b3b070', tas: '#b8a78a', tasA: '#c9ba9e', tasK: '#a18f72', duvar: '#ad987c', yosun: '#6f7d3c', ot: '#6a7034', cali: '#566e36' },
    // III · iskelet: mezarlık, serin gri
    { zemin: '#7c877d', koyu: '#69756c', acik: '#8f998f', tas: '#a6acae', tasA: '#bcc1c3', tasK: '#8e9599', duvar: '#a3a9ac', yosun: '#5f7058', ot: '#4f5c4c', cali: '#465c4a' },
    // IV · trol: yıkık büyük kapı, iri kayalar
    { zemin: '#8b8769', koyu: '#757356', acik: '#a29d7c', tas: '#a6a090', tasA: '#bab5a6', tasK: '#8c8676', duvar: '#a29a88', yosun: '#62703e', ot: '#55603a', cali: '#52703a' },
    // V · hayalet: sisli tapınak salonu, mor ışık
    { zemin: '#4c4462', koyu: '#41395a', acik: '#5d5576', tas: '#6a6186', tasA: '#776f92', tasK: '#5f577b', duvar: '#8e86a8', sut: '#a59dbc', yosun: '#4f5a5c', ot: '#3e3a52', cali: '#46585a' },
  ];

  CK.def('saha-yaratik', { w: 7, d: 7, name: 'Harabe sahası' }, (b, K2, opt) => {
    const t = Math.max(1, Math.min(5, opt.t || 1)), q = opt.q || 0, Kd = KADEME[t], r = b.r, ayna = r() < .5 ? -1 : 1;
    const at = (u, v) => [3.5 + (v + u * ayna) / 2, 3.5 + (v - u * ayna) / 2];      // kadraj → ızgara
    const uv = (x, y) => [(x - y) * ayna, x + y - 7];                                  // ızgara → kadraj
    const ek = (u, v, z = 0) => { const [x, y] = at(u, v); return pr(x, y, z); };     // kadraj → ekran
    const koy = (u, v, z, svg, R = .3, h = .8) => { const [x, y] = at(u, v), p = pr(x, y, z); b.item([x - R, y - R, z, x + R, y + R, z + h], `<g transform="translate(${f1(p[0])} ${f1(p[1])})">${svg}</g>`, { cast: false }); };
    const zem = svg => b.ground(svg);
    // yumuşak leke: kadraj merkezi (u, v), yarıçaplar (a, c) kadraj birimi → ekran noktaları
    const lekeP = (u, v, a, c, n = 8, j = .22) => { const ps = []; for (let k = 0; k < n; k++) { const t2 = k / n * 6.283, m = 1 + (r() - .5) * 2 * j; ps.push(ek(u + Math.cos(t2) * a * m, v + Math.sin(t2) * c * m)); } return ps; };
    const yumus = ps => { const n = ps.length, m = i => [(ps[i % n][0] + ps[(i + 1) % n][0]) / 2, (ps[i % n][1] + ps[(i + 1) % n][1]) / 2]; let d = `M${f1(m(0)[0])} ${f1(m(0)[1])}`; for (let i = 1; i <= n; i++) { const p = ps[i % n], e = m(i); d += `Q${f1(p[0])} ${f1(p[1])} ${f1(e[0])} ${f1(e[1])}`; } return d + 'Z'; };
    const leke = (u, v, a, c, col, o = .5) => zem(sd(col, yumus(lekeP(u, v, a, c, 7, .3)), o));

    /* --- zemin --- */
    b.pave(-3, -3, 10, 10, Kd.zemin);
    for (let i = 0; i < 12; i++) { const [cx, cy] = at(-3 + r() * 6, -6 + r() * 10), rr = .7 + r() * 1.1, pts = []; for (let k = 0; k < 7; k++) { const a = k / 7 * 6.283, d = rr * (.7 + r() * .5); pts.push([cx + Math.cos(a) * d * 1.4, cy + Math.sin(a) * d]); } b.gpoly(pts, i % 2 ? Kd.koyu : Kd.acik, { op: .5 }); }
    // döşeme: ızgaraya oturan taşlar (bazısı çift boy), derzler çizgiyle; keep(u, v) yeri seçer; eksik taşlardan toprak görünür
    const doseme = (keep, s, cols, derz, o = {}) => { const ds = cols.map(() => ''), N = Math.ceil(11 / s), used = new Set(); let cr = '';
      for (let i = 0; i < N; i++) for (let k = 0; k < N; k++) { const key = i * N + k; if (used.has(key)) continue; const x = -2 + i * s, y = -2 + k * s, [u, v] = uv(x + s / 2, y + s / 2);
        if (Math.abs(u) > 3 || v < -6.4 || v > 4.2 || !keep(u, v) || r() < (o.miss || .12)) continue;
        let w = s, h = s; const m = r(); if (m < .24 && !used.has(key + N)) { w = 2 * s; used.add(key + N); } else if (m < .48 && !used.has(key + 1)) { h = 2 * s; used.add(key + 1); }
        const j = () => (r() - .5) * s * .1, g = s * .03, qd = [[x + g + j(), y + g + j()], [x + w - g + j(), y + g + j()], [x + w - g + j(), y + h - g + j()], [x + g + j(), y + h - g + j()]];
        const c = r(); ds[c < .45 ? 0 : c < .75 ? 1 : 2] += 'M' + qd.map(p => PT(p[0], p[1])).join(' ') + 'Z';
        if (r() < (o.crack || .14)) { const a = qd[0], e = qd[2], mm = r() * .4 + .3; cr += `M${PT(a[0] + (e[0] - a[0]) * .1, a[1] + (e[1] - a[1]) * mm)} ${PT(a[0] + (e[0] - a[0]) * .5, a[1] + (e[1] - a[1]) * (mm + .12))} ${PT(e[0] - (e[0] - a[0]) * .1, a[1] + (e[1] - a[1]) * (mm - .1))}`; } }
      zem(ds.map((d, i) => d ? `<path class="${kf(cols[i])} ${ks(derz)}" stroke-width="${o.gw || 1.2}" stroke-linejoin="round" d="${d}"/>` : '').join('') + (cr ? ln(derz, cr, .7) : '')); };
    // su birikintisi: ıslak kenar, gökyüzü yansıması, parıltı
    const birikinti = (u, v, a, c) => { const ps = lekeP(u, v, a, c, 9, .18), [cx, cy] = ek(u, v), A = a * 24, sc = (k, dx = 0, dy = 0) => ps.map(p => [cx + (p[0] - cx) * k + dx, cy + (p[1] - cy) * k + dy]);
      zem(sd(tone(Kd.tas, -.45), yumus(sc(1.14, .6, .5)), .45) + path(kf('#6aa3a3>#2e4a66'), yumus(ps)) + path(kf('#9fd2cf>#4a6a8a'), yumus(sc(.6, -A * .22, -c * 3)))
        + ln('#f2fbf8>#a8c8e8', `M${f1(cx - A * .5)} ${f1(cy - c * 4)}h${f1(A * .34)}M${f1(cx + A * .1)} ${f1(cy + c * 2)}h${f1(A * .26)}`, .9)); };

    /* --- yapı parçaları --- */
    // kemer taşları: yüzde yuvarlak açıklığın çevresine iki tonlu taşlar
    const kemerTas = (f, a0, w, kh, col, n = 9) => { const rr = w / 2, ys = kh - rr, ca = a0 + w / 2; let v0 = '', v1 = '';
      for (let k = 0; k < n; k++) { const t0 = Math.PI * k / n, t1 = Math.PI * (k + 1) / n, P2 = (tt, R2) => f.P(ca - Math.cos(tt) * R2, ys + Math.sin(tt) * R2), d = `M${P2(t0, rr)} ${P2(t1, rr)} ${P2(t1, rr + .13)} ${P2(t0, rr + .13)}Z`; if (k % 2) v1 += d; else v0 += d; }
      f.put(6.3, kf(f.c(col, .1)), v0).put(6.3, kf(f.c(col, -.06)), v1); };
    // yıkık duvar: (u, v) kadraj noktasından kompozisyon yönü yon ('x' sağ-aşağı | 'y' sol-aşağı) boyunca parçalar [uzunluk, yükseklik] (0: gedik)
    // o: col · th · kemer [parça, a0, genişlik, yükseklik] · ivy [[parça, a0, a1, sarkma]]; döner: görünen uzun yüzler
    const duvar = (u, v, yon, parca, o = {}) => { const ax = (yon === 'x') === (ayna > 0) ? 'x' : 'y', th = o.th || .34, col = o.col || Kd.duvar; let [x, y] = at(u, v); const fs = [];
      const kutu = (a0, a1, z0, z1, c, e) => ax === 'x' ? b.box(x + a0, y - th + e, z0, x + a1, y - e, z1, c, { edge: false }) : b.box(x - th + e, y + a0, z0, x - e, y + a1, z1, c, { edge: false });
      parca.forEach(([L, h], i) => {
        if (h > 0) { const bx = kutu(0, L, 0, h, col, 0), f = ax === 'x' ? bx.L : bx.R, e = ax === 'x' ? bx.R : bx.L, km = o.kemer && o.kemer[0] === i ? o.kemer : null;
          if (km) { const [, a0, w, kh] = km; f.arcade(a0 - .16, a0 + w + .16, 1, kh, { kind: 'arch', pier: .16, th, thru: true, floor: false, ring: false, cap: false }); kemerTas(f, a0, w, kh, col);
            f.courses({ rh: .25, bw: .5, dens: .55, a1: a0 - .06 }).courses({ rh: .25, bw: .5, dens: .55, a0: a0 + w + .06 }).courses({ rh: .25, bw: .5, dens: .5, b0: kh + .15 }); }
          else f.courses({ rh: .25, bw: .5, dens: .6, dt: -.16 });
          f.stones(Math.round(L * 3), { rh: .25, b0: km ? km[3] + .15 : 0, dt: .1 }); f.shadeBottom(.12, -.14); e.courses({ rh: .25, bw: .3, dens: .5 });
          if (h > .35 && L > .45 && r() < .55) { const a = r() * (L - .3), w2 = .2 + r() * .2; kutu(a, a + w2, h, h + .08 + r() * .08, tone(col, .03), .04); }      // tepede kalan taş
          fs.push({ f, i, L, h }); }
        if (ax === 'x') x += L; else y += L; });
      if (o.ivy) for (const [i, a0, a1, dr] of o.ivy) { const p = fs.find(q2 => q2.i === i); if (p) p.f.vine({ kind: 'ivy', a0, a1, top: p.h, drop: [.25, dr || 1], dens: .9 }); }
      return fs; };
    // cephe: izleyiciye dönük duvar (kadrajda yatay): u0..u1, ön yüz v'de, derinlik d, yükseklik h; döner ön yüz (a ızgara birimi: 1 u = 0,707 a)
    const cephe = (u0, u1, v, d, h, col, o = {}) => { const ps = [at(u0, v - d), at(u1, v - d), at(u1, v), at(u0, v)], z0 = o.z || 0, pz = b.prism(ps, z0, z0 + h, col, { T: o.T });
      const f = pz.faces[0]; if (f && o.tex !== false) f.courses({ rh: .24, bw: .36, dens: .6, dt: -.15, b0: o.b0 || 0 }).stones(Math.round((u1 - u0) * 2), { rh: .24, dt: .1 }); return f; };
    // cephe dizisi: yan yana farklı boylu cepheler (yırtık siluetli yıkık duvar); parca [genişlik u, yükseklik] (0: gedik)
    const cepheDizi = (u0, v, d, parca, col = Kd.duvar) => { let u = u0; const fs = []; for (const [w, h] of parca) { if (h > 0) fs.push(cephe(u, u + w, v, d, h, col)); u += w; } return fs; };
    // sütun: kaide, oluklu gövde, başlık ya da kırık uç
    const sutun = (u, v, h, o = {}) => { const [x, y] = at(u, v), R = o.R || .2, col = o.col || Kd.tas;
      b.box(x - R - .08, y - R - .08, 0, x + R + .08, y + R + .08, .14, tone(col, -.06), { edge: false });
      const c = b.cyl(x, y, R, .14, h, col, { top: tone(col, .06) }); c.courses(o.st || .42, -.06);
      { let d = ''; for (const tt of [-.7, -.35, 0, .35, .7]) { const ph = (45 - 90 * tt) * Math.PI / 180, px = x + R * Math.cos(ph), py = y + R * Math.sin(ph); d += `M${PT(px, py, .2)} ${PT(px, py, h - .04)}`; }
        b.item([x - R, y - R, .14, x + R, y + R, h], ln(tone(col, -.24), d, .8, 'opacity=".55"'), { cast: false }); }
      if (o.cap) { c.band(h - .2, .08, col, .03, false); b.box(x - R - .1, y - R - .1, h, x + R + .1, y + R + .1, h + .15, tone(col, .04), { edge: false }); }
      else { const p = pr(x, y, h), rx = R * Math.SQRT2 * 24, j = [r(), r(), r(), r()], top = `L${f1(p[0] - rx)} ${f1(p[1] - 3 - j[0] * 6)}L${f1(p[0] - rx * .5)} ${f1(p[1] - 1 - j[1] * 3)}L${f1(p[0] - rx * .1)} ${f1(p[1] - 4 - j[2] * 7)}L${f1(p[0] + rx * .35)} ${f1(p[1] - 1.5 - j[3] * 2)}`;
        b.item([x - R, y - R, h, x + R, y + R, h + .3], `<path fill="url(#${K.gradCyl(col)})" d="M${f1(p[0] - rx)} ${f1(p[1])}${top}L${f1(p[0] + rx)} ${f1(p[1] - .5)}L${f1(p[0] + rx)} ${f1(p[1])}A${f1(rx)} ${f1(rx / 2)} 0 0 1 ${f1(p[0] - rx)} ${f1(p[1])}Z"/>`
          + ln(tone(col, .32), 'M' + top.slice(1), 1.1), { cast: false }); }
      if (o.ivy) { const p = pr(x, y, h * .92), cs = []; for (let i = 0; i < 9; i++) cs.push([p[0] + (r() - .5) * 12, p[1] + i * h * 29.4 * .9 / 9 * (.4 + r() * .3), 2 + r() * 1.8]);
        b.item([x - R, y - R, .14, x + R + .02, y + R + .02, h], path(kf(tone(M.sarmasik, -.2)), cs.map(c2 => circ(c2[0], c2[1], c2[2])).join('')) + path(kf(M.sarmasik), cs.map(c2 => circ(c2[0] - 1, c2[1] - 1, c2[2] * .6)).join('')), { cast: false }); }
      return c; };
    // devrik sütun: yatık tamburlar (kadraj noktası, kompozisyon yönü, uzunluk)
    const devrik = (u, v, yon, L, R = .19, col = Kd.tas) => { const ax = (yon === 'x') === (ayna > 0) ? 'x' : 'y', [x, y] = at(u, v), x1 = ax === 'x' ? x + L : x, y1 = ax === 'x' ? y : y + L, W = R * 62;
      b.line3([[x, y, R], [x1, y1, R]], tone(col, -.22), W, { pad: R });
      b.line3([[x, y, R * 1.45], [x1, y1, R * 1.45]], tone(col, .1), W * .42, { pad: R });
      let d = ''; for (let k = .45; k < L - .2; k += .45 + r() * .2) { const px = ax === 'x' ? x + k : x, py = ax === 'x' ? y : y + k; d += `M${PT(px, py, R * 2)} ${PT(px, py, 0)}`; }
      const cp = []; for (let k = 0; k < 12; k++) { const a = k / 12 * 6.283, c = Math.cos(a) * R, s = Math.sin(a) * R; cp.push(ax === 'x' ? pr(x1, y1 + c, R + s) : pr(x1 + c, y1, R + s)); }
      const cd = 'M' + cp.map(p => f1(p[0]) + ' ' + f1(p[1])).join(' ') + 'Z';
      b.item([x1 - .02, y1 - .02, 0, x1 + R + .04, y1 + R + .04, R * 2], ln(tone(col, -.36), d, .8) + path(kf(tone(col, .2)), cd) + ln(tone(col, -.1), cd, .7), { cast: false }); };
    // yıkıntı taşı: küçük kutu
    const blok = (u, v, w, d, h, col = Kd.tas, z = 0) => { const [x, y] = at(u, v), bx = b.box(x - w / 2, y - d / 2, z, x + w / 2, y + d / 2, z + h, col, { edge: false }); if (w > .4) bx.L.courses({ rh: .2, bw: .4, dens: .3 }); return bx; };
    const kaya = (u, v, s, col) => { const [x, y] = at(u, v); b.rock(x, y, 0, { s, col }); };
    const cali = (u, v, s, col = Kd.cali) => { const [x, y] = at(u, v); b.tree('cali', x, y, { s, col, cast: false }); };
    const agac = (u, v, s, col, H = 26) => { const [x, y] = at(u, v), p = pr(x, y, 0), rr = rng(Math.round((x * 31 + y * 17) * 100)), R = 20 * s;
      b.item([x - .25, y - .25, 0, x + .25, y + .25, 2.4 * s], path(kf(tone(M.govde, -.1)), `M${f1(p[0] - 2.6 * s)} ${f1(p[1])}L${f1(p[0] - 1.6 * s)} ${f1(p[1] - H * s)}H${f1(p[0] + 1.6 * s)}L${f1(p[0] + 2.6 * s)} ${f1(p[1])}Z`) + canopy(cluster(p[0], p[1] - H * s - R * .3, R, 8, rr, .78), R, col), { pts: [[x, y, 0], [x + .9 * s, y, 1.8 * s], [x, y + .9 * s, 1.8 * s], [x - .9 * s, y, 1.8 * s], [x, y - .9 * s, 1.8 * s]] }); };
    const ot = (u, v, n, col, h = 9) => { const [x, y] = at(u, v), p = pr(x, y, 0); let d = '', e = ''; for (let i = 0; i < n; i++) { const dx = (r() - .5) * 12, hh = h * (.6 + r() * .6), lean = (r() - .5) * 6, s = `M${f1(p[0] + dx - 1.2)} ${f1(p[1] + (r() - .5) * 3)}Q${f1(p[0] + dx + lean * .3)} ${f1(p[1] - hh * .6)} ${f1(p[0] + dx + lean)} ${f1(p[1] - hh)}Q${f1(p[0] + dx + .4)} ${f1(p[1] - hh * .5)} ${f1(p[0] + dx + 1.2)} ${f1(p[1])}Z`; if (i % 2) e += s; else d += s; }
      b.item([x - .2, y - .2, 0, x + .2, y + .2, h / 29], path(kf(tone(col, -.18)), d) + path(kf(tone(col, .2)), e), { cast: false }); };
    const kemikYer = (u, v, n) => { const [cx, cy] = ek(u, v); let g = ''; for (let i = 0; i < n; i++) { const a = r() * 3.14, L = 4 + r() * 3, x = cx + (r() - .5) * 16, y = cy + (r() - .5) * 6; g += kemik(x - Math.cos(a) * L, y - Math.sin(a) * L * .5, x + Math.cos(a) * L, y + Math.sin(a) * L * .5, 1.4); } zem(g); };
    const tuf = (n, col) => { const a = at(-2.6, -2.2), c = at(2.6, 3.4); b.tufts(Math.min(a[0], c[0]), Math.min(a[1], c[1]), Math.max(a[0], c[0]), Math.max(a[1], c[1]), n, { col }); };
    const sg = r() < .5 ? 1 : -1;      // kompozisyon içi ikinci aynalama (yaratık ve süslerin yanı)
    const j = (k = .3) => (r() - .5) * k;      // tohuma bağlı küçük kayma
    // demir parmaklık: sivri uçlu dikmeler, iki kuşak (üstteki kırık), bir dikme eğik
    const parmaklik = (u, v, yon, L) => { const ax = (yon === 'x') === (ayna > 0) ? 'x' : 'y', [x, y] = at(u, v), n = Math.round(L / .2), x1 = ax === 'x' ? x + L : x, y1 = ax === 'x' ? y : y + L, kr = .55 + r() * .25; let d = '', tp = '';
      for (let i = 0; i <= n; i++) { const k = i * L / n, px = ax === 'x' ? x + k : x, py = ax === 'x' ? y : y + k, lean = i === n - 1 ? .14 : 0, top = .6 - (i % 2) * .05, a = pr(px, py, 0), c = pr(px + lean, py - lean, top);
        d += `M${f1(a[0])} ${f1(a[1])}L${f1(c[0])} ${f1(c[1])}`; tp += `M${f1(c[0] - 1.2)} ${f1(c[1] + .5)}L${f1(c[0])} ${f1(c[1] - 2.6)}L${f1(c[0] + 1.2)} ${f1(c[1] + .5)}Z`; }
      d += `M${PT(x, y, .15)} ${PT(x1, y1, .15)}M${PT(x, y, .48)} ${PT(x + (x1 - x) * kr, y + (y1 - y) * kr, .48)} ${PT(x + (x1 - x) * (kr + .06), y + (y1 - y) * (kr + .06), .36)}`;
      b.item([Math.min(x, x1) - .03, Math.min(y, y1) - .03, 0, Math.max(x, x1) + .03, Math.max(y, y1) + .03, .7], ln('#2e2c30', d, 1.2) + path(kf('#2e2c30'), tp), { cast: false }); };
    // ön kenarda yere çöken sis (her şeyin önünde, alt şeritte)
    const sis = (col, o) => { const p = pr(3.5, 3.5, 0); b.item([9.4, 9.4, 0, 9.5, 9.5, .1], sd(col, `M${f1(p[0] - 80)} ${f1(p[1] + 30)}Q${f1(p[0] - 40)} ${f1(p[1] + 14)} ${f1(p[0])} ${f1(p[1] + 24)}T${f1(p[0] + 80)} ${f1(p[1] + 22)}V${f1(p[1] + 60)}H${f1(p[0] - 80)}Z`, o)
      + sd(col, `M${f1(p[0] - 80)} ${f1(p[1] - 6)}Q${f1(p[0] - 30)} ${f1(p[1] - 16)} ${f1(p[0] + 10)} ${f1(p[1] - 8)}T${f1(p[0] + 80)} ${f1(p[1] - 10)}V${f1(p[1] + 4)}Q${f1(p[0] + 30)} ${f1(p[1] - 2)} ${f1(p[0] - 10)} ${f1(p[1] + 4)}T${f1(p[0] - 80)} ${f1(p[1] + 2)}Z`, o * .64), { cast: false }); };

    /* ================= SAHNELER ================= */
    if (t === 1) {
      // I · BALÇIK: güneşli yosunlu avlu, birikintiler; köşede birleşen alçak, sarmaşıklı duvarlar
      doseme((u, v) => v > -4 + Math.abs(u) * .62 && v < 3.5 - Math.abs(u) * .25 && Math.abs(u) < 2.8, .5, [Kd.tas, Kd.tasA, Kd.tasK], Kd.derz, { miss: .14, crack: .2, gw: 1.7 });
      for (let i = 0; i < 7; i++) leke(-2.4 + r() * 4.8, -3 + r() * 6.4, .22 + r() * .4, .2 + r() * .3, Kd.yosun, .55);
      birikinti(-1.45 * sg, 1.05, .6, .48); birikinti(1.35 * sg, -.25, .46, .36); birikinti(.4 * sg, 2.6, .34, .26);
      const kL = r() < .5;
      duvar(-.12, -4.1, 'y', [[.55, 1.45], [.95, 1.05], [.5, .62], [.7, .36]], { kemer: kL ? [1, .2, .5, .74] : null, ivy: [[0, 0, .55, .9], [2, 0, .5, .45]] });
      duvar(.12, -4.1, 'x', [[.6, 1.3], [.95, .98], [.55, .5], [.6, .3]], { kemer: kL ? null : [1, .2, .5, .7], ivy: [[1, .45, .95, .6]] });
      sutun(1.5 * sg, -2.05, 1.32, { cap: true, ivy: true }); sutun(-1.25 * sg, -2.55, .8 + r() * .2); sutun(2.2 * sg, -.55, .46);
      devrik(-2.45 * sg, .7, sg > 0 ? 'x' : 'y', 1.05); blok(2.25 * sg, .45, .36, .3, .24); blok(-2.0 * sg, -.9, .3, .26, .2);
      cali(-2.55 * sg, -.35, 1.1); cali(2.55 * sg, 1.55, 1); cali(-2.1 * sg, 2.5, .8);
      const BS = [[-.45, .35, 1.3, true], [1.0, -.95, .9, false], [.55, 1.55, .6, false]].map(([u, v, s2, k2]) => [(u + j()) * sg, v + j(), s2, k2]);
      for (const [u, v, s2] of BS) { const a = ek(u, v), c = ek(u + (r() < .5 ? .55 : -.55), v - .3 - r() * .25), w = 3.6 * s2, dx = c[0] - a[0], dy = c[1] - a[1], L = Math.hypot(dx, dy) || 1, nx = -dy / L * w, ny = dx / L * w, m = [(a[0] + c[0]) / 2 + nx * .4, (a[1] + c[1]) / 2 + ny * .4];
        const iz = `M${f1(a[0] + nx)} ${f1(a[1] + ny)}Q${f1(m[0] + nx * .9)} ${f1(m[1] + ny * .9)} ${f1(c[0] + nx * .2)} ${f1(c[1] + ny * .2)}Q${f1(c[0] + dx * .08)} ${f1(c[1] + dy * .08)} ${f1(c[0] - nx * .2)} ${f1(c[1] - ny * .2)}Q${f1(m[0] - nx * .5)} ${f1(m[1] - ny * .5)} ${f1(a[0] - nx)} ${f1(a[1] - ny)}Z`;
        zem(sd(BL.o, iz, .3) + sd(BL.o, circ(c[0] + dx * .25, c[1] + dy * .25, 1.1 * s2) + circ(c[0] + dx * .45 - nx * .3, c[1] + dy * .45, .7 * s2), .4) + ln(BL.p, `M${f1(a[0] + nx * .3)} ${f1(a[1] + ny * .3 - .6)}Q${f1(m[0])} ${f1(m[1] - .6)} ${f1(c[0])} ${f1(c[1])}`, .7, 'opacity=".45"')); }
      for (const [u, v, s2, k2] of BS) koy(u, v, 0, balcik(s2, k2), .12 + .25 * s2);
      koy((-1.6 + j(.2)) * sg, -1.85, 0, amforaCiz(1.05), .15, .5); koy((-1.25 + j(.2)) * sg, -1.4, 0, kirikCiz(1), .2, .05);
      if (r() < .8) koy((-1.5 + j()) * sg, 2.2, 0, kalkanCiz(1)); if (r() < .8) koy((1.55 + j()) * sg, 1.95, 0, kilicCiz(1, -sg)); kemikYer((.1 + j(.6)) * sg, 2.95, 2 + Math.floor(r() * 3)); koy((-.6 + j()) * sg, 2.9, 0, kafatasi(1, sg), .15, .2);
      tuf(16, Kd.ot);
    } else if (t === 2) {
      // II · YABAN KURDU: arkada koyu orman, otlar arasında yıkık duvarlar ve kemerli geçit; ortada geyik iskeleti
      for (const [u, v, s] of [[-2.3, -3.7, 1.15], [-1.25, -4.3, 1.2], [-.05, -4.6, 1.25], [1.15, -4.3, 1.2], [2.3, -3.8, 1.15]]) agac(u + (r() - .5) * .3, v, s, '#435c3a', 13);
      for (let i = 0; i < 5; i++) leke(-2.2 + r() * 4.4, -2.6 + r() * 5.6, .3 + r() * .4, .2 + r() * .3, Kd.koyu, .5);
      doseme((u, v) => v > -2.6 && v < .8 && Math.abs(u + .2 * sg) < 1.5, .5, [Kd.tas, Kd.tasA, Kd.tasK], tone(Kd.tas, -.3), { miss: .45, crack: .25 });
      // arka: izleyiciye dönük, yırtık siluetli yıkık duvar; bir ucunda kemerli geçit
      { const ku = -1.55 * sg, g = cephe(ku - .62, ku + .62, -2.85, .4, 1.28, Kd.duvar);
        if (g) { g.arcade(.2, .68, 1, .8, { kind: 'arch', pier: .1, th: .4, thru: true, floor: false, ring: false, cap: false }); kemerTas(g, .3, .28, .8, Kd.duvar, 7); g.vine({ kind: 'ivy', a0: .55, a1: .86, top: 1.28, drop: [.3, .9], dens: .9 });
          if (r() < .7) { const p = g.p3(.1, .55, .06), q2 = pr(p[0], p[1], p[2]); b.item([p[0] - .06, p[1] - .06, p[2] - .3, p[0] + .06, p[1] + .06, p[2] + .5], `<g transform="translate(${f1(q2[0])} ${f1(q2[1])})">${mesaleCiz(.85)}</g>`, { cast: false }); b.spill(p[0] + .4, p[1] + .4, 1); } }
        const yan = sg > 0 ? [[.4, .7], [.35, .52], [.3, .22], [.45, 0], [.5, .62], [.4, .4], [.45, .2]] : [[.45, .2], [.4, .4], [.5, .62], [.45, 0], [.3, .22], [.35, .52], [.4, .7]];
        const fs = cepheDizi(sg > 0 ? ku + .62 : ku - .62 - yan.reduce((a, p) => a + p[0], 0), -3.0, .4, yan); fs.forEach((f, i) => { if (f && i % 3 === 1) f.vine({ kind: 'ivy', a0: 0, a1: f.w * .6, top: f.h, drop: [.2, .5], dens: .8 }); }); }
      sutun(1.95 * sg, -2.0, .75); sutun(-.4 * sg, -2.2, .42);
      devrik(1.25 * sg, 1.0, sg > 0 ? 'y' : 'x', 1.15); kaya(-2.35 * sg, 1.2, 1.1, Kd.tas); blok(2.3 * sg, .2, .3, .26, .22);
      // geyik leşi: yan yatmış kaburga kafesi, omurga ve boynuzlu kafa
      { const [cx, cy] = ek(.1 * sg, -.05); let g2 = `M${f1(cx - 9)} ${f1(cy - 5.6)}Q${f1(cx)} ${f1(cy - 8)} ${f1(cx + 9)} ${f1(cy - 6.2)}`; for (let i = 0; i < 6; i++) { const x = cx - 7 + i * 2.7, L2 = 5.6 - Math.abs(i - 2.4) * .7; g2 += `M${f1(x)} ${f1(cy - 6.8)}Q${f1(x - 2.2)} ${f1(cy - 4)} ${f1(x - .6)} ${f1(cy - 6.8 + L2)}`; }
        zem(`<ellipse cx="${f1(cx)}" cy="${f1(cy)}" rx="12" ry="2.6" fill="#1b2440" opacity=".2"/>` + sd('#6a2a22', `M${f1(cx - 8)} ${f1(cy - 1)}Q${f1(cx)} ${f1(cy + 2.4)} ${f1(cx + 8)} ${f1(cy - .4)}Q${f1(cx)} ${f1(cy - 2)} ${f1(cx - 8)} ${f1(cy - 1)}Z`, .45) + ln('#3e3632', g2, 2.2) + ln('#e6dfcc', g2, 1));
        koy(.95 * sg, .05, 0, kafatasi(1.1, sg) + ln('#3e3632', 'M-1 -4L-3 -9L-6 -11M-3 -9L-1.6 -12M1.4 -4L3.6 -9L6.6 -10.6M3.6 -9L2.6 -12.4', 2) + ln('#e6dfcc', 'M-1 -4L-3 -9L-6 -11M-3 -9L-1.6 -12M1.4 -4L3.6 -9L6.6 -10.6M3.6 -9L2.6 -12.4', .9), .2, .4); }
      koy((-1.1 + j()) * sg, .65 + j(.2), 0, kurt(1.1, sg * ayna), .4); koy((1.15 + j()) * sg, -.85 + j(.2), 0, kurt(.96, -sg * ayna), .4);
      for (const [u, v] of [[-2.1, -.5], [-1.6, 1.6], [-.25, 1.3], [1.75, .5], [2.2, -1.3], [.6, 2.35], [-2.35, 2.6], [2.25, 2.4], [-.6, -2.0], [1.0, -2.2], [-1.7, -1.6], [2.5, 1.2]]) ot((u + (r() - .5) * .3) * sg, v + (r() - .5) * .3, 7, Kd.ot, 10 + r() * 5);
      if (r() < .75) koy((-1.45 + j()) * sg, 2.6, 0, kalkanCiz(.95, '#6a4e36')); else koy((-1.4 + j()) * sg, 2.5, 0, kilicCiz(1, sg)); kemikYer((.8 + j()) * sg, 2.1, 2 + Math.floor(r() * 3));
      tuf(22, Kd.ot);
    } else if (t === 3) {
      // III · İSKELET: mezarlık; çökük türbe cephesi, mezar taşları, açık mezar, selviler
      for (const [u, v, s] of [[-.75, -4.35, 1], [.3, -3.5, .9], [1.75, -3.9, 1], [2.35, -3.2, .9]]) { const [x, y] = at(u * sg, v); b.tree('selvi', x, y, { s, col: '#34503f' }); }
      for (let i = 0; i < 6; i++) leke(-2.2 + r() * 4.4, -3 + r() * 6, .3 + r() * .4, .2 + r() * .3, i % 2 ? Kd.koyu : '#8a8a72', .5);
      // türbe: ızgaraya oturan taş oda; uzun yüzünde sivri kemerli karanlık kapı ve meşale, saçak, uydurma yazılı kuşak, sarmaşık
      { const ax = (sg > 0) === (ayna > 0) ? 'x' : 'y', [x, y] = at(-2.25 * sg, -3.2), L = 1.5, D = .95, H = 1.2;
        const bx = ax === 'x' ? b.box(x, y - D, 0, x + L, y, H, Kd.duvar, { edge: false }) : b.box(x - D, y, 0, x, y + L, H, Kd.duvar, { edge: false }), f = ax === 'x' ? bx.L : bx.R, e = ax === 'x' ? bx.R : bx.L;
        f.courses({ rh: .24, bw: .5, dens: .55, dt: -.15, b0: .9 }).courses({ rh: .24, bw: .5, dens: .5, dt: -.15, a1: L * .5 - .36, b1: .9 }).courses({ rh: .24, bw: .5, dens: .5, dt: -.15, a0: L * .5 + .36, b1: .9 }).stones(5, { rh: .24, dt: .1 }).shadeBottom(.12, -.14);
        e.courses({ rh: .24, bw: .4, dens: .6, dt: -.15 }).stones(3, { rh: .24 });
        f.shp('point', L * .5 - .34, 0, .68, .92, tone(Kd.duvar, .14), 3.6).shp('point', L * .5 - .25, 0, .5, .8, '#151317>#3a2418', 4);
        f.rect(.02, 0, .13, H, tone(Kd.duvar, .07), 3.3).rect(L - .15, 0, .13, H, tone(Kd.duvar, .07), 3.3).rect(0, .98, L, .1, tone(Kd.duvar, -.18), 3.4);
        for (let k = 0; k < 5; k++) { const a = .3 + k * .23; f.line([[a, 1.0], [a + .06, 1.06], [a + .12, 1.0]], tone(Kd.duvar, -.4), .8, 6); }
        f.vine({ kind: 'ivy', a0: 0, a1: .4, top: H, drop: [.3, .85], dens: .9 });
        const kL = L * (.55 + r() * .2); ax === 'x' ? b.box(x - .07, y - D - .07, H, x + kL, y + .07, H + .13, tone(Kd.duvar, .06), { edge: false }) : b.box(x - D - .07, y + L - kL, H, x + .07, y + L + .07, H + .13, tone(Kd.duvar, .06), { edge: false });
        { const e2 = f.p3(ax === 'x' ? L * .9 : L * .1, 0, .35); b.box(e2[0] - .2, e2[1] - .12, 0, e2[0] + .2, e2[1] + .12, .14, tone(Kd.duvar, .06), { edge: false }); b.box(e2[0] + .05, e2[1] + .2, 0, e2[0] + .27, e2[1] + .4, .12, Kd.duvar, { edge: false }); }
        const p = f.p3(L * .5 + .44, .6, .05), q2 = pr(p[0], p[1], p[2]); b.item([p[0] - .06, p[1] - .06, p[2] - .3, p[0] + .06, p[1] + .06, p[2] + .5], `<g transform="translate(${f1(q2[0])} ${f1(q2[1])})">${mesaleCiz(1)}</g>`, { cast: false });
        const d0 = f.p3(L * .5, 0, .4); b.spill(d0[0], d0[1], 1.3); }
      duvar(-2.25 * sg + (sg > 0 ? 1.6 : -1.6), -1.6, sg > 0 ? 'x' : 'y', [[.5, .55], [.45, .3]], { col: Kd.duvar });
      koy(2.35 * sg, -1.2, 0, kuruCiz(1.15, -sg, r), .2, 1.2);
      // mezar taşları: yuvarlak başlı, kalın, uydurma işaretli; kimi +y'ye kimi +x'e bakar
      const mezarTasi = (u, v, w, h, gl, yz) => { const [x, y] = at(u, v), th = .11, hb = h - w / 2, n = yz ? [0, 1, 0] : [1, 0, 0], col = Kd.tasK;
        const sh = [[0, 0], [w, 0]]; for (let k = 0; k <= 8; k++) { const a = Math.PI * k / 8; sh.push([w / 2 + Math.cos(a) * w / 2, hb + Math.sin(a) * w / 2]); }
        const F = new K.Face(yz ? [x - w / 2, y + th / 2, 0] : [x + th / 2, y + w / 2, 0], yz ? [1, 0, 0] : [0, -1, 0], [0, 0, 1], w, h, n, sh); F.fill(col);
        const dk = tone(col, -.36); if (gl === 0) { const cs = []; for (let k = 0; k <= 10; k++) cs.push([w / 2 + Math.cos(k / 10 * 6.283) * w * .16, hb + w * .06 + Math.sin(k / 10 * 6.283) * w * .16]); F.line(cs, dk, .9, 6).dot(w / 2, hb + w * .06, 1, dk, 6).line([[w * .26, hb - .14], [w * .74, hb - .14]], dk, .8, 6).line([[w * .32, hb - .26], [w * .68, hb - .26]], dk, .8, 6); }
        else if (gl === 1) F.line([[w * .24, hb + w * .1], [w * .76, hb + w * .1]], dk, .8, 6).line([[w * .24, hb - .06], [w * .76, hb - .06]], dk, .8, 6).line([[w * .24, hb - .22], [w * .6, hb - .22]], dk, .8, 6);
        else F.line([[w * .3, hb + w * .2], [w * .7, hb + w * .2], [w * .5, hb - .1], [w * .3, hb + w * .2]], dk, .9, 6).dot(w * .5, hb - .26, 1.3, dk, 6);
        F.rect(0, 0, w, .07, Kd.yosun, 7, .05);
        const P = (a, bb, e2) => { const p = F.p3(a, bb, e2); return PT(p[0], p[1], p[2]); }; let tp = 'M';
        for (let k = 0; k <= 8; k++) tp += P(sh[k + 2][0], sh[k + 2][1], 0) + ' '; for (let k = 8; k >= 0; k--) tp += P(sh[k + 2][0], sh[k + 2][1], -th) + ' ';
        const ya = yz ? w : 0, yan = `M${P(ya, 0, 0)} ${P(ya, hb, 0)} ${P(ya, hb, -th)} ${P(ya, 0, -th)}Z`;
        b.item([x - (yz ? w / 2 : th / 2), y - (yz ? th / 2 : w / 2), 0, x + (yz ? w / 2 : th / 2), y + (yz ? th / 2 : w / 2), h], path(kf(tone(col, .2)), tp + 'Z') + path(kf(tone(col, K.toneOf(yz ? [1, 0, 0] : [0, 1, 0]))), yan) + F.svg()); };
      mezarTasi(-2.05 * sg, .15, .4, .58, 0, r() < .5); mezarTasi(2.15 * sg, .45, .38, .52, 1, r() < .5); mezarTasi(1.55 * sg, -1.35, .36, .62, 2, r() < .5); mezarTasi(-.65 * sg, -2.05, .36, .5, 1, r() < .5); mezarTasi(-2.4 * sg, 2.2, .34, .44, 2, r() < .5);
      const mez = (u, v, ac) => { const [x, y] = at(u, v), bx = b.box(x - .25, y - .45, 0, x + .25, y + .45, .2, Kd.tas, { edge: false, T: ac ? '#2a2628' : undefined }); if (ac) b.box(x + .12, y - .2, .2, x + .62, y + .7, .27, Kd.tasA, { edge: false });
        else { bx.T.line([[0, .55], [.18, .48], [.3, .6], [.5, .5]], tone(Kd.tas, -.4), 1, 6); b.box(x + .2, y + .35, 0, x + .38, y + .55, .12, Kd.tasA, { edge: false }); } };
      mez(-.95 * sg, -1.0, true); mez(1.0 * sg, 1.55, false);
      parmaklik(.45 * sg, -3.75, sg > 0 ? 'x' : 'y', 1.5); if (r() < .7) koy(1.55 * sg, -1.35, .6, kuzgun(1.1, -sg), .1, .3);
      for (let i = 0; i < 3; i++) leke(-2 + r() * 4, -2.4 + r() * 4.8, .7 + r() * .5, .25 + r() * .2, '#dfe6e8>#7f8fb0', .14);
      koy((-.2 + j()) * sg, .45 + j(.2), 0, iskelet(1.05, { kask: r() < .5 }), .3, 1.1); koy((1.2 + j()) * sg, -.5 + j(.2), 0, iskelet(.95, { alt: true }), .3, 1); if (r() < .65) koy((-1.45 + j()) * sg, 1.55, 0, iskelet(.85, { alt: r() < .5, kask: true }), .3, 1);
      koy((1.6 + j()) * sg, 2.35, 0, kilicCiz(1, sg)); kemikYer((-.4 + j()) * sg, 2.65, 3 + Math.floor(r() * 2)); koy((.5 + j()) * sg, 2.85, 0, kafatasi(1, -sg), .15, .2);
      tuf(14, Kd.ot); sis('#e2e8ea>#7c8aa8', .2);
    } else if (t === 4) {
      // IV · TROL: yıkık büyük kapı (izleyiciye dönük iki iri ayak, kemerin kalıntısı), düşmüş kemer taşları, iri kayalar
      for (let i = 0; i < 6; i++) leke(-2.2 + r() * 4.4, -3 + r() * 6, .3 + r() * .5, .2 + r() * .3, i % 2 ? Kd.yosun : Kd.koyu, .5);
      doseme((u, v) => v > -4.4 && v < 2.6 && Math.abs(u) < 1.15 + (v + 3) * .08, .62, [Kd.tas, Kd.tasA, Kd.tasK], tone(Kd.tas, -.3), { miss: .28, crack: .3 });
      for (const [u, v, s] of [[-2.5, -3.6, 1.1], [-1.25, -4.2, 1.15], [.05, -4.5, 1.15], [1.3, -4.2, 1.1], [2.55, -3.5, 1.1]]) agac(u + (r() - .5) * .3, v, s, '#3f5f42', 12);
      // kapı: izleyiciye dönük iki iri ayak, başlık taşları ve tepesi çökmüş geniş kemer (trolün başının iki yanında görünür)
      const vg = -1.35, hp = .72, z0 = hp + .15, dp = .85, col = Kd.duvar;
      const L = cephe(-2.85, -1.35, vg, dp, hp, col), R = cephe(1.35, 2.85, vg, dp, hp, col);
      cephe(-2.95, -1.22, vg + .07, dp + .14, .15, tone(col, .08), { z: hp, tex: false }); cephe(1.22, 2.95, vg + .07, dp + .14, .15, tone(col, .08), { z: hp, tex: false });
      if (L) L.vine({ kind: 'ivy', a0: .1, a1: .8, top: hp, drop: [.3, .6], dens: .9 }); if (R) { R.rect(.3, .16, .5, .3, tone(col, -.25), 3.4); const p = R.p3(R.w * .2, .42, .06), q2 = pr(p[0], p[1], p[2]); b.item([p[0] - .06, p[1] - .06, p[2] - .3, p[0] + .06, p[1] + .06, p[2] + .5], `<g transform="translate(${f1(q2[0])} ${f1(q2[1])})">${mesaleCiz(.9)}</g>`, { cast: false }); b.spill(p[0] + .4, p[1] + .4, 1.1); }
      { const ri = 1.36, ro = 1.8, zs = .9, P = (a, R2, dv = 0) => { const [x, y] = at(Math.cos(a) * R2, vg - dv); return PT(x, y, z0 + Math.sin(a) * R2 * zs); }; let fa = '', fb = '', ust = '', yan = '';
        const sol = 5 + Math.floor(r() * 2), sag = 3 + Math.floor(r() * 2), st = Math.PI / 15, tas = (a0, a1, k) => { const d = `M${P(a0, ri)} ${P(a1, ri)} ${P(a1, ro)} ${P(a0, ro)}Z`; if (k % 2) fb += d; else fa += d; ust += `M${P(a0, ro)} ${P(a1, ro)} ${P(a1, ro, dp)} ${P(a0, ro, dp)}Z`; };
        for (let k = 0; k < sol; k++) tas(Math.PI - k * st, Math.PI - (k + 1) * st, k); for (let k = 0; k < sag; k++) tas(k * st, (k + 1) * st, k + 1);
        for (const a of [Math.PI - sol * st, sag * st]) yan += `M${P(a, ri)} ${P(a, ro)} ${P(a, ro, dp)} ${P(a, ri, dp)}Z`;      // kırık uçların kesiti
        const [x0, y0] = at(-2, vg - dp), [x1, y1] = at(2, vg); b.item([Math.min(x0, x1), Math.min(y0, y1), z0, Math.max(x0, x1), Math.max(y0, y1), 3], path(kf(tone(col, .22)), ust) + path(kf(tone(col, -.04)), yan) + path(kf(tone(col, -.26)), fa) + path(kf(tone(col, -.16)), fb) + ln(tone(col, -.46), fa + fb, .7), { cast: false }); }
      // yere devrilmiş kapı kanadı: kalın tahtalar, demir kuşaklar, halka (trolün sopasız yanında)
      { const [x, y] = at(-1.05 * ayna + j(.2), 1.3), w = 1.05, dd = .62, bx = b.box(x - w / 2, y - dd / 2, 0, x + w / 2, y + dd / 2, .1, '#6e4c32', { edge: false });
        bx.T.planks({ dir: 'v', step: .13, dt: -.24 }).rect(0, .1, w, .07, '#3c3836', 3).rect(0, dd - .17, w, .07, '#3c3836', 3).dot(w * .72, dd * .5, 2.4, '#3c3836', 6).dot(w * .72, dd * .5, 1.2, '#6e4c32', 6.1); }
      kaya(-2.3 * ayna, 1.75, 1.4, Kd.tasK); kaya(2.4 * ayna, 1.15, 1.3, Kd.tasK); kaya(1.6 * sg, -2.6, 1.1, Kd.tas);
      const BK = tone(Kd.tas, -.1); blok(-1.9 * ayna, .05, .5, .42, .42, BK); blok(-1.25 * sg, -2.1, .42, .38, .3, BK); if (r() < .6) blok(1.9 * ayna, -.3, .34, .3, .26, BK);
      { const bx = blok((.25 + j()) * ayna, 2.55, .5, .46, .3, Kd.tas), f = bx.L, w = f.w; f.line([[w * .2, .08], [w * .5, .24], [w * .8, .08]], tone(Kd.tas, -.4), .9, 6).dot(w * .5, .12, 1.2, tone(Kd.tas, -.4), 6); }
      { const cu = (1.25 + j(.2)) * ayna, cv = 1.95, ri = .45, ro = .88; for (let k = 0; k < 4; k++) { if (k === 2 && r() < .5) continue; const a0 = Math.PI * (1.08 + k * .21), a1 = a0 + Math.PI * .18;
          b.prism([[a0, ri], [a1, ri], [a1, ro], [a0, ro]].map(([a, R2]) => at(cu + Math.cos(a) * R2, cv + Math.sin(a) * R2)), 0, .3, k % 2 ? Kd.tas : BK); } }
      koy((-.2 + j(.2)) * ayna, .6, 0, trol(.98), .5, 2);
      koy((1.6 + j(.2)) * ayna, 2.3, 0, kalkanCiz(1, '#6a4e36')); kemikYer((.95 + j()) * ayna, 3.0, 3 + Math.floor(r() * 2)); koy((-.6 + j()) * ayna, 2.95, 0, kafatasi(1, -ayna), .15, .2);
      cali(-2.55 * ayna, -.4, 1.1); cali(2.6 * ayna, 2.4, 1);
      tuf(14, Kd.ot);
    } else {
      // V · HAYALET: sisli tapınak salonu; izleyiciye dönük arka duvar ve sivri pencere, iki yanda uzun sütunlar, sunak ve mumlar
      doseme((u, v) => v > -3.3 && v < 3.8, .72, [Kd.tas, Kd.tasA, Kd.tasK], tone(Kd.tas, -.3), { miss: .05, crack: .26, gw: 1 });
      // ortada sunağa giden koyu taş yol, kenarı açık şeritli
      { const kc = [[-.6, 3.9], [.6, 3.9], [.5, -2.9], [-.5, -2.9]].map(p => ek(p[0], p[1])); zem(sd('#2e2742', 'M' + kc.map(p => f1(p[0]) + ' ' + f1(p[1])).join(' ') + 'Z', .5)); }
      for (let i = 0; i < 5; i++) leke(-2.2 + r() * 4.4, -2.6 + r() * 6, .5 + r() * .5, .22 + r() * .2, '#bdb4e6>#6a60a0', .16);
      const W = cephe(-2.9, 2.9, -3.25, .5, 1.5, Kd.duvar);
      if (W) { const A = W.w; W.shp('point', A * .5 - .3, .3, .6, 1.2, '#dcd6f2>#9a90e0', 4).shp('point', A * .5 - .36, .26, .72, 1.3, tone(Kd.duvar, -.14), 3.6);
        W.line([[A * .5, .3], [A * .5, 1.42]], tone(Kd.duvar, -.2), 1.2, 5); W.rect(0, 1.36, A, .08, tone(Kd.duvar, .12), 5); W.vine({ kind: 'ivy', a0: A * .05, a1: A * .2, top: 1.5, drop: [.3, .8], dens: .7 }); }
      for (const [u, v, h, c] of [[-1.75, -2.35, 2.3, 1], [-2.45, -.45, 1.5, 0], [1.75, -2.35, 2.4, 1], [2.45, -.45, 1.0, 0]]) sutun(u, v, h, { cap: !!c, R: .22, col: Kd.sut });
      { const [x, y] = at(0, -2.5), bx = b.box(x - .36, y - .36, 0, x + .36, y + .36, .34, Kd.tasK, { edge: false }); bx.L.courses({ rh: .17, bw: .3, dens: .4 }); bx.L.dot(.36, .17, 1.4, '#c8b0ff>#d8c8ff', 6, null); bx.R.dot(.36, .17, 1.4, '#c8b0ff>#d8c8ff', 6, null); }
      koy(0, -2.5, .34, mumCiz(.9, 5, r), .25, .4); koy(-1.3 * sg, 1.3, 0, mumCiz(1, 4, r), .2, .3); koy(1.8 * sg, .75, 0, mumCiz(.85, 3, r), .2, .3);
      devrik(-2.05 * sg, 2.3, sg > 0 ? 'x' : 'y', .9, .2, Kd.sut); blok(1.95 * sg, 2.0, .4, .35, .3);
      for (const [u, v, z, s, d] of [[-.8 + j(), -.2, .45, 1.1, 1], [.95 + j(), .95, .28, 1.02, 1], [.5 + j(), -1.2, .4, .78, -1]].slice(0, r() < .7 ? 3 : 2)) { koy(u * sg, v, 0, golge(9 * s, 2.4 * s, 0, .22), .2, .05); koy(u * sg, v, z, hayalet(s, d * sg), .3, 1.3); }
      kemikYer(.3 * sg, 2.7, 3); koy(-.5 * sg, 3.0, 0, kafatasi(1, sg), .15, .2);
      sis('#e6e0ff>#8a80c0', .22);
    }

    // nitelik: çiçek ve ganimet, süzülen ışık, altın pırıltı (orman dosyasıyla aynı dil)
    if (q >= 1 && t <= 4) { const cols = t === 3 ? ['#e8e6dc', '#c8c4d8', '#b8b0c8'] : t === 4 ? ['#e8d070', '#f2ead8', '#c8d860'] : undefined;
      for (const [u, v, n] of [[1.9, 1.2, 4], [-1.6, 3.2, 3], [1.0, 3.3, 3]]) { const [x, y] = at(u * sg, v); b.flowers(x, y, { n: n + q * 2, r: .4, cols }); } }
    if (q >= 1 && t === 5) koy(.3 * sg, 1.9, 0, mumCiz(.8, 3, r), .2, .3);
    if (q >= 1) { const [cx, cy] = ek(-.2 * sg, 2.55); zem(K.dots('#e2b84f', [[cx - 6, cy + 1], [cx - 3, cy + 2.4], [cx + 4, cy + 1.6]], 2.2) + K.dots('#fff3c0', [[cx - 6.4, cy + .6]], .9)); }
    if (q >= 2) {
      const g = q >= 3 ? '#ffe9a8' : '#fff6d2', p = pr(3.5, 3.5, 0), id = 'yrIs' + Math.min(3, q); let sh = '', st = '';
      K.DEF(id, () => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" class="${K.kg(g)}" stop-opacity="${q >= 3 ? .34 : .24}"/><stop offset=".55" class="${K.kg(g)}" stop-opacity="${q >= 3 ? .13 : .08}"/><stop offset="1" class="${K.kg(g)}" stop-opacity="0"/></linearGradient>`);
      for (const [dx, w] of [[-40, 12], [-8, 16], [22, 11]]) sh += `M${f1(p[0] + dx)} ${f1(p[1] - 96)}l${w} 0l${f1(w * .5 + 24)} 112l${f1(-w * 1.6 - 6)} 0z`;
      for (let i = 0; i < q * 2; i++) { const x = p[0] - 50 + r() * 100, y = p[1] - 60 + r() * 66, kk = .9 + r() * 1.1; st += `M${f1(x)} ${f1(y - kk * 2)}l${f1(kk * .5)} ${f1(kk * 1.5)}l${f1(kk * 1.5)} ${f1(kk * .5)}l${f1(-kk * 1.5)} ${f1(kk * .5)}l${f1(-kk * .5)} ${f1(kk * 1.5)}l${f1(-kk * .5)} ${f1(-kk * 1.5)}l${f1(-kk * 1.5)} ${f1(-kk * .5)}l${f1(kk * 1.5)} ${f1(-kk * .5)}z`; }
      b.item([9.6, 9.6, 0, 9.8, 9.8, 4], (q >= 3 ? sd('#ffc86a>#3a3060', `M${f1(p[0] - 90)} ${f1(p[1] - 110)}h180v190h-180z`, .07) : '') + `<path fill="url(#${id})" d="${sh}"/>` + path(kf(q >= 3 ? '#fff0b8' : '#ffffff'), st, ' opacity=".9"'), { cast: false });
    }
  });
})(typeof window !== 'undefined' ? window.CK : globalThis.CK);
