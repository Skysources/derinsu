/* Derinsu — saha manzaraları: dünya haritasındaki saha altıgenlerinin içindeki küçük resimler.
   Saha.ciz(tuval, { prof, t, seed, q }, { night, w }) → manzarayı (CK.def('saha-<meslek>'), js/sehir/y-saha-*.js) kurar,
   kendi başına bir SVG resmine çevirir ve tuvale boyar. Kadraj CK.SAHA'dadır (kit.js); altıgene kırpma CSS ile yapılır.
   Resimler anahtarla önbelleğe alınır; kurma ve boyama sırayla, kare kare yapılır (12 saha birden açılırken takılma olmasın). */
window.Saha = (() => {
  'use strict';
  const K = window.CK, cache = new Map(), queue = [], MAX = 96;
  let busy = false;
  const key = (a, night, pw) => `${a.prof}|${a.t}|${a.seed}|${a.q || 0}|${night ? 1 : 0}|${pw}`;
  const var_ = a => K.DEFS.has('saha-' + a.prof);
  // manzaranın kendi başına SVG'si: yalnız kadraj (viewBox) ve yalnız kullanılan renk kuralları
  function svgOf(a, night) {
    const o = K.build('saha-' + a.prof, { t: a.t, seed: a.seed, q: a.q || 0 }), S = K.SAHA, c = S.center(o), w = S.W, h = S.H;
    const inner = o.ground + `<path class="Zs" d="${o.shadow}"/>` + o.body, defs = K.defsOf(inner);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${(c[0] - w / 2).toFixed(1)} ${(c[1] - h / 2).toFixed(1)} ${w} ${h.toFixed(1)}" width="${w}" height="${h.toFixed(1)}"><style>${K.cssOf(inner + defs, night ? 'night' : 'day')}</style><defs>${defs}</defs>${inner}</svg>`;
  }
  function load(a, night, pw, ph) {
    return new Promise(res => {
      const k = key(a, night, pw); if (cache.has(k)) return res(cache.get(k));
      let svg; try { svg = svgOf(a, night); } catch (e) { return res(null); }
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })), img = new Image();
      img.onload = () => { URL.revokeObjectURL(url); const cv = document.createElement('canvas'); cv.width = pw; cv.height = ph; cv.getContext('2d').drawImage(img, 0, 0, pw, ph);
        if (cache.size >= MAX) cache.delete(cache.keys().next().value);      // en eski resim bırakılır
        cache.set(k, cv); res(cv); };
      img.onerror = () => { URL.revokeObjectURL(url); res(null); };
      img.src = url;
    });
  }
  const put = (cv, bmp, pw, ph) => { cv.width = pw; cv.height = ph; cv.getContext('2d').drawImage(bmp, 0, 0); cv.classList.add('hazir'); };
  function pump() {
    if (busy || !queue.length) return;
    busy = true; const j = queue.shift();
    if (j.cv.dataset.k !== j.k) { busy = false; pump(); return; }      // bu tuvale artık başka resim isteniyor
    requestAnimationFrame(() => load(j.a, j.night, j.pw, j.ph).then(bmp => { busy = false; if (bmp && j.cv.dataset.k === j.k) put(j.cv, bmp, j.pw, j.ph); pump(); }));
  }
  /* tuval: <canvas>; a: saha { prof, t, seed, q }; o.night: gece renkleri; o.w: altıgenin genişliği (CSS pikseli; verilmezse tuvalin genişliği) */
  function ciz(cv, a, o = {}) {
    if (!var_(a)) return false;
    const night = !!o.night, dpr = Math.min(3, window.devicePixelRatio || 1), W = o.w || cv.clientWidth || 84, pw = Math.round(W * dpr), ph = Math.round(K.SAHA.hexH(W) * dpr), k = key(a, night, pw);
    if (cv.dataset.k === k) return true;
    cv.dataset.k = k;
    const hit = cache.get(k);
    if (hit) { put(cv, hit, pw, ph); return true; }
    cv.classList.remove('hazir'); queue.push({ cv, a, night, pw, ph, k }); pump();
    return true;
  }
  return { ciz, var: var_, temizle() { cache.clear(); queue.length = 0; } };
})();
