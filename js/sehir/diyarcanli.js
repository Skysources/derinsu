/* Derinsu — Diyar haritası (tarayıcı): şehir dışındaki dünya. Şehir gibi parmakla kaydırılır, iki parmakla yakınlaşır.
   Diyar.mount(kap, { pick(i), info(i) })   haritayı kurar (bir kez); pick: hücreye dokunuş · info(i): etiketin içi (oyun doldurur)
   Diyar.tags()                             etiketleri tazeler (info ile)
   Diyar.select(i, glide)                   hücreyi seçer: dışı kararır, kenarı altınlanır, kamera yaklaşır (-1: bütün harita)
   Diyar.nodes(html)                        seçili hücrenin düğümleri (dünya pikseli konumlu öğeler)
   Diyar.float(x, y, yazı, renk, büyük)     dünyadaki bir noktada yüzen yazı
   Diyar.show(açık)                         başka ekrandayken çizim durur
   Duran harita (zemin, sahaların manzaraları, sınırlar, şehir) tek tuvale bir kez boyanır. */
window.Diyar = (() => {
  'use strict';
  const K = window.CK, ZMAX = 1.7;
  let host, world, tagsEl, selEl, nodesEl, fltEl, data, cam = null, vw = 0, vh = 0, mounted = false, anim = 0, moved = false, hr = null, cb = {}, sel = -1, lastZ = 0, hideT = 0;
  const f1 = n => (Math.round(n * 10) / 10).toString(), wx = x => x - data.x, wy = y => y - data.y;
  const polyD = (poly, ox = 0, oy = 0) => 'M' + poly.map(p => f1(p[0] - ox) + ' ' + f1(p[1] - oy)).join('L') + 'Z';
  const inPoly = (x, y, P) => { let n = 0; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) n++; } return n % 2 === 1; };
  const RN = { maden: 'Maden Ocağı', yaratik: 'Kadim Harabeler', odun: 'Ulu Orman', bitki: 'Çiçekli Çayır', deri: 'Av Sahası', balik: 'Kıyı' };

  function mount(h, o = {}) {
    if (mounted) return; mounted = true; host = h; cb = o; data = K.diyar({});
    host.innerHTML = `<div class="dy-world" style="width:${data.w}px;height:${data.h}px"><canvas class="dy-c" style="width:${data.w}px;height:${data.h}px"></canvas>
      <svg class="dy-sel" width="${data.w}" height="${data.h}" viewBox="${data.x} ${data.y} ${data.w} ${data.h}" aria-hidden="true"></svg><div class="dy-nodes"></div><div class="dy-tags"></div><div class="dy-flt"></div></div>`;
    world = host.firstChild; tagsEl = world.querySelector('.dy-tags'); selEl = world.querySelector('.dy-sel'); nodesEl = world.querySelector('.dy-nodes'); fltEl = world.querySelector('.dy-flt');
    // bölge adları (büyük levha) ve saha etiketleri (oyun doldurur)
    let h2 = data.regions.map(r => { const c = data.cells.filter(q => q.prof === r.id), top = Math.min(...c.map(q => q.c[1]));
      return `<span class="dy-reg" data-reg="${r.id}" style="left:${f1(wx(r.c[0]))}px;top:${f1(wy(top - 62))}px">${RN[r.id]}</span>`; }).join('');
    h2 += data.cells.map(c => `<button class="dy-tag ${c.kind}" data-cell="${c.i}" style="left:${f1(wx(c.c[0]))}px;top:${f1(wy(c.c[1] + (c.kind === 'city' ? 64 : 40)))}px"></button>`).join('');
    tagsEl.innerHTML = h2;
    paint(); bind(); new ResizeObserver(resize).observe(host); resize(); tags();
  }
  // bütün duran harita: zemin + sahaların manzaraları (hücreye kırpılmış) + şehir + sınırlar
  function paint() {
    const cv = world.querySelector('.dy-c'); let clips = '', scenes = '';
    for (const c of data.cells) {
      if (c.kind === 'city') continue;
      let o; try { o = K.build('saha-' + c.prof, { t: c.sceneT, seed: c.seed, q: 0 }); } catch (e) { continue; }
      const ctr = K.SAHA.center(o), s = Math.max(.9, Math.min(1.45, c.bb[2] / 215));
      clips += `<clipPath id="dyc${c.i}"><path d="${polyD(c.poly)}"/></clipPath>`;
      scenes += `<g clip-path="url(#${c.kind === 'sea' ? 'dySea' : 'dyLand'})"><g clip-path="url(#dyc${c.i})"><g transform="translate(${f1(c.c[0])} ${f1(c.c[1] + 6)}) scale(${s.toFixed(3)}) translate(${f1(-ctr[0])} ${f1(-ctr[1])})"${c.kind === 'sea' ? ' opacity=".9"' : ''}>${o.ground}<path class="Zs" d="${o.shadow}"/>${o.body}</g></g></g>`;
    }
    const dpr = Math.min(3, window.devicePixelRatio || 1), rs = Math.min(dpr * .8, Math.sqrt(8e6 / (data.w * data.h))), W = Math.round(data.w * rs), H = Math.round(data.h * rs);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${data.x} ${data.y} ${data.w} ${data.h}" width="${W}" height="${H}"><style>${K.css('', 'dusk')}</style><defs>${K.defsSvg()}${clips}</defs>${data.ground}${scenes}${data.body}${data.borders}</svg>`;
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' })), img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); cv.width = W; cv.height = H; cv.getContext('2d').drawImage(img, 0, 0, W, H); host.classList.add('hazir'); };
    img.onerror = () => URL.revokeObjectURL(url); img.src = url;
  }
  const zmin = () => Math.max(vw / data.w, vh / data.h);
  function clampCam() { const z = cam.z, hw = vw / 2 / z, hh = vh / 2 / z; cam.x = Math.max(data.x + hw, Math.min(data.x + data.w - hw, cam.x)); cam.y = Math.max(data.y + hh - 40 / z, Math.min(data.y + data.h - hh + 60 / z, cam.y)); }
  function apply() {
    cam.z = Math.max(zmin(), Math.min(ZMAX, cam.z)); clampCam();
    world.style.transform = `translate3d(${f1(vw / 2 - (cam.x - data.x) * cam.z)}px,${f1(vh / 2 - (cam.y - data.y) * cam.z)}px,0) scale(${cam.z.toFixed(4)})`;
    if (cam.z !== lastZ) { lastZ = cam.z; world.style.setProperty('--iz', (1 / cam.z).toFixed(3)); host.classList.toggle('far', cam.z < .72); }
  }
  let need = false; const req = () => { if (need) return; need = true; requestAnimationFrame(() => { need = false; apply(); }); };
  function resize() { const r = host.getBoundingClientRect(); hr = null; if (!r.width || !r.height) return; vw = r.width; vh = r.height;
    if (!cam) { const c = data.city.c, z = Math.max(zmin(), .56); cam = { x: c[0] - 120, y: c[1] - vh * .42 / z, z }; } apply(); }
  const stop = () => { cancelAnimationFrame(anim); anim = 0; };
  function glide(x, y, z, ms = 650) { stop(); const a = Object.assign({}, cam), t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / ms), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; cam.x = a.x + (x - a.x) * e; cam.y = a.y + (y - a.y) * e; cam.z = a.z + (z - a.z) * e; apply(); if (k < 1) anim = requestAnimationFrame(step); };
    anim = requestAnimationFrame(step); }
  // hücreyi seç: dışı kararır, kenarı altın; kamera hücreyi üstteki bilgi ile alttaki çubuğun arasına sığdırır
  function select(i, go = true) {
    sel = i; const c = data.cells[i];
    // hücre kıyıdaysa yalnız kendi tarafı (kara ya da deniz) aydınlık kalır; çerçeve de o tarafa kırpılır
    const R = `M${data.x} ${data.y}h${data.w}v${data.h}h${-data.w}Z`, own = c && (c.kind === 'sea' ? 'dsS' : 'dsL'), other = c && (c.kind === 'sea' ? 'dsL' : 'dsS');
    selEl.innerHTML = c ? `<defs><clipPath id="dsL"><path d="${data.land}"/></clipPath><clipPath id="dsS"><path clip-rule="evenodd" d="${R}${data.land}"/></clipPath></defs>
      <path class="dy-dim" fill-rule="evenodd" d="${R}${polyD(c.poly)}"/><g clip-path="url(#${other})"><path class="dy-dim" d="${polyD(c.poly)}"/></g>
      <g clip-path="url(#${own})"><path class="dy-out0" d="${polyD(c.poly)}"/><path class="dy-out" d="${polyD(c.poly)}"/></g>` : '';
    host.classList.toggle('sel', !!c); tagsEl.querySelectorAll('.dy-tag').forEach(t => t.classList.toggle('on', +t.dataset.cell === i));
    if (!c) { nodesEl.innerHTML = ''; if (go && cam) glide(cam.x, cam.y, zmin(), 600); return; }
    if (!go || !vw) return;
    const top = 120, bot = 150, z = Math.max(zmin(), Math.min(ZMAX, (vw - 24) / c.bb[2], (vh - top - bot) / c.bb[3]));
    glide(c.c[0], c.c[1] - ((top + (vh - bot)) / 2 - vh / 2) / z, z);
  }
  function tags() { if (!mounted || !cb.info) return; tagsEl.querySelectorAll('.dy-tag').forEach(t => { const h = cb.info(+t.dataset.cell); if (t.dataset.h !== h.html) { t.dataset.h = h.html; t.innerHTML = h.html; } t.className = `dy-tag ${data.cells[+t.dataset.cell].kind} ${h.cls || ''} ${+t.dataset.cell === sel ? 'on' : ''}`; }); }
  function nodes(html) { if (nodesEl.dataset.h === html) return; nodesEl.dataset.h = html; nodesEl.innerHTML = html; }
  function float(x, y, text, color, big) { const el = document.createElement('span'); el.className = 'flt' + (big ? ' big' : ''); el.textContent = text; el.style.setProperty('--c', color);
    el.style.left = f1(wx(x)) + 'px'; el.style.top = f1(wy(y)) + 'px'; fltEl.appendChild(el); setTimeout(() => el.remove(), 1400); }

  /* ---------- dokunma: tek parmak kaydırır, iki parmak yakınlaştırır; dokunuş hücreyi seçer ---------- */
  function bind() {
    const pts = new Map(); let pinch = null, down = null, vel = [0, 0], lt = 0;
    const rel = e => { const r = hr || (hr = host.getBoundingClientRect()); return [e.clientX - r.left, e.clientY - r.top]; };
    const zoomAt = (nz, cx, cy) => { nz = Math.max(zmin(), Math.min(ZMAX, nz)); const px = cam.x + (cx - vw / 2) / cam.z, py = cam.y + (cy - vh / 2) / cam.z; cam.z = nz; cam.x = px - (cx - vw / 2) / nz; cam.y = py - (cy - vh / 2) / nz; };
    host.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.button) return; stop(); if (!pts.size) hr = null; pts.set(e.pointerId, rel(e));
      if (pts.size === 1) { moved = false; down = rel(e); vel = [0, 0]; lt = performance.now(); }
      else if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, z: cam.z, m: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] }; moved = true; } });
    window.addEventListener('pointermove', e => { const o = pts.get(e.pointerId); if (!o) return; const p = rel(e);
      if (pts.size === 1) { if (!moved && Math.hypot(p[0] - down[0], p[1] - down[1]) > 7) { moved = true; host.classList.add('drag'); }
        if (moved) { const dx = p[0] - o[0], dy = p[1] - o[1], now = performance.now(), dt = Math.max(4, now - lt); lt = now; cam.x -= dx / cam.z; cam.y -= dy / cam.z; vel = [vel[0] * .5 + dx / dt * .5, vel[1] * .5 + dy / dt * .5]; req(); } pts.set(e.pointerId, p); }
      else if (pinch && pts.size === 2) { pts.set(e.pointerId, p); const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        cam.x -= (m[0] - pinch.m[0]) / cam.z; cam.y -= (m[1] - pinch.m[1]) / cam.z; pinch.m = m; zoomAt(pinch.z * d / pinch.d, m[0], m[1]); req(); } });
    const up = e => { if (!pts.delete(e.pointerId)) return; host.classList.remove('drag');
      if (pts.size === 0) { pinch = null; if (moved && performance.now() - lt < 90 && Math.hypot(vel[0], vel[1]) > .08) { let v = vel.slice(), t0 = performance.now();
        const step = t => { const dt = Math.min(40, t - t0); t0 = t; cam.x -= v[0] * dt / cam.z; cam.y -= v[1] * dt / cam.z; const k = Math.pow(.95, dt / 16); v = [v[0] * k, v[1] * k]; apply(); anim = Math.hypot(v[0], v[1]) > .02 ? requestAnimationFrame(step) : 0; }; anim = requestAnimationFrame(step); } }
      else if (pts.size === 1) { pinch = null; down = [...pts.values()][0]; lt = performance.now(); vel = [0, 0]; } };
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    host.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; return; }
      if (e.target.closest('[data-node]')) return;      // düğümleri oyun dinler
      const t = e.target.closest('[data-cell]'); if (t) { if (cb.pick) cb.pick(+t.dataset.cell); return; }
      const r = host.getBoundingClientRect(), sx = cam.x + (e.clientX - r.left - vw / 2) / cam.z, sy = cam.y + (e.clientY - r.top - vh / 2) / cam.z;
      const c = data.cells.find(q => inPoly(sx, sy, q.poly)); if (c && cb.pick) cb.pick(c.i); });
    host.addEventListener('wheel', e => { e.preventDefault(); stop(); hr = null; const p = rel(e); zoomAt(cam.z * Math.exp(-e.deltaY * (e.ctrlKey ? .012 : .0022)), p[0], p[1]); req(); }, { passive: false });
  }
  function show(on) { if (!mounted) return; clearTimeout(hideT); if (on) world.style.display = ''; else hideT = setTimeout(() => { world.style.display = 'none'; }, 520); }
  return { mount, select, tags, nodes, float, show, get data() { return data; }, get sel() { return sel; }, get ready() { return mounted; } };
})();
