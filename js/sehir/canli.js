/* Derinsu — şehir sahnesi (tarayıcı): katmanlar, parmakla kaydırma ve yakınlaştırma, canlandırmalar, etiketler.
   City.mount(kap, yapılar)      şehri kurar (bir kez); yapılar: [{ id, name, open, ic }]
   City.status({ id: [yazı, durum] })   etiket durumları ('' | 'on' | 'warn')
   City.ship(gemiKimliği, denizde)      oyuncunun gemisi
   City.focus(id)                       kamerayı yapıya götürür

   Katmanlar (alttan üste): zemin SVG'si · alt canlılar (yürüyenler) · yapı SVG'si · üst canlılar (duman, bayrak, tekne, kuş) · etiketler.
   Duran her şey iki büyük SVG'de kalır ve bir kez boyanır; kıpırdayan her şey ayrı, küçük ve yalnız transform/opacity ile canlanır. */
window.City = (() => {
  'use strict';
  const K = window.CK, ZMIN = .45, ZMAX = 1.15;
  let host, world, lo, hi, tagsEl, indEl, data, cam = null, vw = 0, vh = 0, B = [], cssEl, kfEl, cull = [], moved = false, mounted = false, statusMap = {}, shipId = null, shipAway = false, shipEl, moorEl, anim = 0, lastCull = 0;
  const f1 = n => (Math.round(n * 10) / 10).toString(), rnd = K.rng(4711), pick = a => a[Math.floor(rnd() * a.length)];
  const wpx = (x, y, z = 0) => { const p = K.pr(x, y, z); return [p[0] - data.x, p[1] - data.y]; };      // ızgara → dünya öğesi pikseli
  const at = (p, extra = '') => `left:${f1(p[0])}px;top:${f1(p[1])}px;${extra}`;

  /* ---------- canlandırılan öğeler ---------- */
  const svgBox = (x, y, w, h, inner, cls = '', style = '') => `<svg class="${cls}" viewBox="${f1(x)} ${f1(y)} ${f1(w)} ${f1(h)}" width="${f1(w)}" height="${f1(h)}" style="left:${f1(x)}px;top:${f1(y)}px;${style}" aria-hidden="true">${inner}</svg>`;
  function fxHtml(f) {
    const p = wpx(f.x, f.y, f.z), s = f.s || 1, A = K.fxArt, d = (rnd() * -6).toFixed(2);
    switch (f.t) {
      case 'smoke': return `<i class="cf cf-smoke" style="${at(p, `--s:${s}`)}"><b></b><b></b><b></b></i>`;
      case 'steam': return `<i class="cf cf-smoke cf-steam" style="${at(p, `--s:${s}`)}"><b></b><b></b><b></b></i>`;
      case 'fire': return `<i class="cf cf-fire" style="${at(p, `--s:${s};--d:${d}s`)}"><u></u><b></b><b></b><b></b></i>`;
      case 'sparks': return `<i class="cf cf-sparks" style="${at(p)}"><b></b><b></b><b></b><b></b></i>`;
      case 'glint': return `<i class="cf cf-glint" style="${at(p, `--d:${d}s`)}"><svg viewBox="-5 -5 10 10" width="10" height="10"><path d="M0-5l1.2 3.8L5 0 1.2 1.2 0 5-1.2 1.2-5 0l3.8-1.2z" fill="#fff6d0"/></svg></i>`;
      case 'flag': return `<i class="cf cf-flag" style="${at(p, `--d:${d}s`)}">${svgBox(-1, -4 * s, 20 * s, 15 * s, A.flag(f))}</i>`;
      case 'banner': { const w = (f.w || .5) * K.U, h = (f.h || 1.2) * K.U; return `<i class="cf cf-ban" style="${at(p, `--d:${d}s`)}"><span style="transform:${A.plane(f.axis === 'y' ? 'x' : 'y').replace(/ /g, ',')}">${svgBox(0, 0, w, h, A.banner(w, h, f))}</span></i>`; }
      case 'wheel': case 'sails': { const R = (f.r || 1) * K.U, m = R * 1.14; return `<i class="cf cf-spin" style="${at(p)}"><span style="transform:${A.plane(f.axis).replace(/ /g, ',')}">${svgBox(-m, -m, 2 * m, 2 * m, f.t === 'wheel' ? A.wheel(R, f) : A.sails(R, f), '', `--d:${f.t === 'wheel' ? (f.kind === 'tekerlek' ? 14 : 9) : 18}s`)}</span></i>`; }
      case 'fountain': { const h = (f.h || .8) * K.ZU; return `<i class="cf cf-fount" style="${at(p, `--h:${f1(h)}px`)}">${svgBox(-14, -h - 3, 28, h + 8, `<path d="M0 0V${f1(-h)}M0 ${f1(-h * .8)}q-7 ${f1(-h * .3)} -11 ${f1(h * .74)}M0 ${f1(-h * .8)}q7 ${f1(-h * .3)} 11 ${f1(h * .74)}" fill="none" stroke="#f2fbfa" stroke-width="1.5" stroke-linecap="round"/>`)}<b></b><b></b><b></b></i>`; }
      case 'fall': { const w = (f.w || .6) * K.U, h = (f.h || 1) * K.ZU; return `<i class="cf cf-fall" style="${at([p[0] - w / 2, p[1]], `width:${f1(w)}px;height:${f1(h)}px`)}"><b></b><u></u></i>`; }
      // fener ışını: yer düzleminde dönen ışık hüzmesi (yalnız gece)
      case 'beam': { const R = (f.r || 9) * K.U; return `<i class="cf cf-beam" style="${at(p)}"><span style="transform:matrix(1,.5,-1,.5,0,0)"><b style="width:${f1(R)}px;height:${f1(R * .34)}px;margin-top:${f1(-R * .17)}px"></b></span></i>`; }
      case 'bell': return `<i class="cf cf-bell" style="${at(p, `--d:${d}s`)}"><svg viewBox="-6 -1 12 13" width="${12 * s}" height="${13 * s}" style="left:${-6 * s}px;top:${-1 * s}px"><path d="M-4.4 9q.4-9.4 4.4-9.4T4.4 9z" fill="#c79a3e"/><path d="M0-.4q3.6 0 4.2 9.4H1.4z" fill="#9a7426"/><circle cy="10.2" r="1.3" fill="#6a4f1c"/></svg></i>`;
      case 'birds': { const n = f.n || 3; let h = ''; for (let i = 0; i < n; i++) h += `<b style="left:${f1((i - (n - 1) / 2) * 8 + rnd() * 3)}px;top:${f1((i % 2) * 4 - 2 + rnd() * 2)}px;--d:${(rnd() * -3).toFixed(2)}s;--fx:${f1(-50 - rnd() * 60)}px;--fy:${f1(-70 - rnd() * 40)}px">${svgBox(-7, -8, 14, 9, K.critter('guvercin'), rnd() < .5 ? 'flip' : '')}</b>`; return `<i class="cf cf-birds" style="${at(p)}">${h}</i>`; }
    }
    return '';
  }
  // küçük figür: iki karelik yürüyüş
  const LOOKS = [{ body: '#c0473a', hat: 'fes' }, { body: '#2f6f9f', hat: 'sarik' }, { body: '#3f8a6a', hat: 'hasir' }, { body: '#8a4f9a', hat: 'ortu', robe: true, hatCol: '#d9b866' }, { body: '#e0a83a', hat: 'none' }, { body: '#f2e8d2', hat: 'fes', legs: '#5a4636' },
    { body: '#7a5038', hat: 'hasir', carry: 'kasa' }, { body: '#bcd0b0', hat: 'ortu', robe: true, hatCol: '#c0473a', carry: 'sepet' }, { body: '#4a6a8a', hat: 'none', carry: 'balik' }, { body: '#a8473a', hat: 'sarik', carry: 'kova' }, { body: '#d98a6a', hat: 'ortu', robe: true, hatCol: '#2f6f9f' }, { body: '#5f6f82', hat: 'fes' }];
  const figSvg = look => `<svg class="fa" viewBox="-10 -28 20 31" width="20" height="31">${K.figure(Object.assign({ step: 1 }, look))}</svg><svg class="fb" viewBox="-10 -28 20 31" width="20" height="31">${K.figure(Object.assign({ step: 2 }, look))}</svg>`;
  let kfN = 0, kfCss = '';
  // yol boyunca gidip gelen öğe: pts ızgara noktaları [[x,y,z],...]; hız piksel/sn
  function mover(pts, inner, o = {}) {
    const q = pts.map(p => wpx(p[0], p[1], p[2] || 0)), loop = o.once ? q : o.loop ? q.concat([q[0]]) : q.concat(q.slice(0, -1).reverse()), len = [0];      // once: tek yön (uçlar görüş dışında), loop: kapalı tur, yoksa git-gel
    for (let i = 1; i < loop.length; i++) len.push(len[i - 1] + Math.hypot(loop[i][0] - loop[i - 1][0], loop[i][1] - loop[i - 1][1]));
    const L = len[len.length - 1] || 1, dur = L / (o.v || 14), name = 'cwm' + (kfN++); let k = '';
    for (let i = 0; i < loop.length; i++) { const pc = len[i] / L * 100, nx = loop[Math.min(loop.length - 1, i + 1)], pv = loop[Math.max(0, i - 1)];
      const sOut = o.flip === false ? 1 : (nx[0] - loop[i][0] < -.01 ? -1 : 1), sIn = o.flip === false ? 1 : (loop[i][0] - pv[0] < -.01 ? -1 : 1), tr = s => `transform:translate(${f1(loop[i][0])}px,${f1(loop[i][1])}px) scaleX(${s})`;
      if (i > 0 && sIn !== sOut && i < loop.length - 1) k += `${(pc - .01).toFixed(2)}%{${tr(sIn)}}`;
      k += `${pc.toFixed(2)}%{${tr(i === loop.length - 1 ? sIn : sOut)}}`; }
    kfCss += `@keyframes ${name}{${k}}`;
    return `<i class="cwm ${o.cls || ''}" style="animation:${name} ${dur.toFixed(1)}s linear ${(-(o.at === undefined ? rnd() : o.at) * dur).toFixed(1)}s infinite">${inner}</i>`;
  }
  // tekne ve benzeri: K.build çıktısını kendi SVG'sine koyar
  function spriteSvg(id, opt) {
    let o; try { o = K.build(id, opt || {}); } catch (e) { return ''; }
    const U = K.U, x0 = -o.d * U - 10, x1 = o.w * U + 10 + o.h * U * .5, y0 = -o.h * K.ZU - 12, y1 = (o.w + o.d) * U / 2 + 10;
    return svgBox(x0, y0, x1 - x0, y1 - y0, o.ground + (o.shadow ? `<path class="Zs" d="${o.shadow}"/>` : '') + o.body);
  }

  /* ---------- kurulum ---------- */
  function mount(h, list) {
    if (mounted) return; mounted = true; host = h; B = list; data = K.city({});
    const { x, y, w, h: hh } = data, vb = `viewBox="${x} ${y} ${w} ${hh}" width="${w}" height="${hh}"`;
    host.innerHTML = `<div class="cw-world" style="width:${w}px;height:${hh}px"><svg class="cw-g" ${vb} aria-hidden="true"><defs></defs>${data.ground}</svg><div class="cw-lo"></div><svg class="cw-s" ${vb}>${data.body}</svg><div class="cw-hi"></div><div class="cw-tags"></div></div><div class="cw-ind"></div><i class="cw-dusk"></i><button class="cw-home" aria-label="Meydana dön"><svg class="ic"><use href="#i-home"/></svg></button>`;
    world = host.firstChild; lo = world.querySelector('.cw-lo'); hi = world.querySelector('.cw-hi'); tagsEl = world.querySelector('.cw-tags'); indEl = host.querySelector('.cw-ind');
    // dokunulan yapılar
    world.querySelectorAll('[data-b]').forEach(g => { const b = B.find(q => q.id === g.dataset.b); if (b) { g.setAttribute('data-open', b.open); g.classList.add('cw-b'); } });
    tagsEl.innerHTML = data.tags.map(t => { const b = B.find(q => q.id === t.id); if (!b) return ''; const p = wpx(t.at[0], t.at[1], t.at[2]);
      return `<button class="cw-tag" data-open="${b.open}" data-tag="${t.id}" style="${at([p[0], p[1] + 15])}"><svg class="ic"><use href="#i-${b.ic}"/></svg><b>${b.name}</b><i class="lm-dot"></i></button>`; }).join('');
    // canlılar
    let hiH = '', loH = '';
    for (const f of data.fx) { const html = fxHtml(f); if (html) hiH += html; }
    for (const s of data.sprites || []) { const inner = spriteSvg(s.id, s.opt); if (!inner) continue; const p = wpx(s.x, s.y, s.z || 0);
      const el = s.path ? mover(s.path, `<i class="cs-bob" style="--d:${(rnd() * -5).toFixed(1)}s">${inner}</i>`, { v: s.v || 9, cls: 'cs', flip: false, once: true, at: s.at }) : `<i class="cs ${s.bob === false ? '' : 'cs-bob'}" style="${at(p, `--d:${(rnd() * -5).toFixed(1)}s;--t:${(3.4 + rnd() * 2.4).toFixed(1)}s`)}"${s.open ? ` data-open="${s.open}"` : ''}>${inner}</i>`;
      if (s.layer === 'lo') loH += el; else hiH += el; }
    for (const pa of data.paths || []) for (let i = 0; i < (pa.n || 1); i++) { const look = pa.look || pick(LOOKS), html = mover(pa.pts, pa.kind === 'kus' ? birdSvg() : figSvg(look), { v: pa.v || (11 + rnd() * 6), cls: pa.kind === 'kus' ? 'cwb' : 'cwk', loop: pa.loop, at: pa.n > 1 ? (i + rnd() * .6) / pa.n : undefined });
      if (pa.layer === 'hi') hiH += html; else loH += html; }
    for (const a of data.ambient || []) { const p = wpx(a.x, a.y, a.z || 0), d = (rnd() * -8).toFixed(1);
      if (a.t === 'glint') hiH += `<i class="cf cf-sea" style="${at(p, `--d:${d}s`)}"></i>`;
      else if (a.t === 'ates') hiH += `<i class="cf cf-fly" style="${at(p, `--d:${d}s;--x:${f1(rnd() * 30 - 15)}px;--y:${f1(-8 - rnd() * 18)}px`)}"></i>`;
      else if (a.t === 'kelebek') hiH += `<i class="cf cf-bfly" style="${at(p, `--d:${d}s;--x:${f1(rnd() * 40 - 20)}px;--y:${f1(-10 - rnd() * 20)}px;--c:${pick(['#f6e27a', '#fff', '#f0a0c0', '#9fd0f0'])}`)}"></i>`;
      else if (a.t === 'dalga') loH += `<i class="cf cf-wave" style="${at(p, `--d:${d}s;width:${f1(a.w || 26)}px`)}"></i>`;
      else if (a.t === 'bulut') hiH += `<i class="cf cf-cloud" style="${at(p, `--d:${d * 9}s;--w:${a.w || 320}px`)}"></i>`; }
    lo.innerHTML = loH; hi.innerHTML = hiH;
    if (data.moor) { hi.insertAdjacentHTML('beforeend', `<i class="cs cs-bob cw-ship" data-open="tersane" style="${at(wpx(...data.moor.at), '--d:-1s;--t:4.6s')}"></i><i class="cf cw-moor" style="${at(wpx(...data.moor.buoy || data.moor.at))}"></i>`); shipEl = hi.querySelector('.cw-ship'); moorEl = hi.querySelector('.cw-moor'); }
    cull = [...hi.children, ...lo.children].filter(e => !e.classList.contains('cwm') && !e.classList.contains('cf-cloud')).map(e => ({ e, x: parseFloat(e.style.left), y: parseFloat(e.style.top), on: true }));
    flushCss();
    bind(); new ResizeObserver(resize).observe(host); resize();
    // gece-gündüz dönüşü: renkler bir anda değişir; üstünden geçen kısa bir perde geçişi yumuşatır
    let wasNight = document.body.classList.contains('night');
    new MutationObserver(() => { const n = document.body.classList.contains('night'); if (n === wasNight) return; wasNight = n; const d = host.querySelector('.cw-dusk'); d.className = 'cw-dusk'; void d.offsetWidth; d.className = 'cw-dusk ' + (n ? 'to-night' : 'to-day'); }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    host.querySelector('.cw-home').addEventListener('click', e => { e.stopPropagation(); home(); });
  }
  function home() { const c = K.pr(...(data.home || [30, 30, 2.4])); glide(c[0], c[1] - 40, Math.max(.6, Math.min(.92, vw / 520)), 700); }
  const birdSvg = () => `<i class="cwb-sh"></i><svg class="cwb-b" viewBox="-8 -5 16 10" width="16" height="10"><path d="M-7.5 -1.5Q-4 -4.5 0 0Q4 -4.5 7.5 -1.5Q4 -2.4 0 1.6Q-4 -2.4 -7.5 -1.5Z" fill="#f6f3ec"/><path d="M-7.5 -1.5Q-4 -4.5 0 0L0 1.6Q-4 -2.4 -7.5 -1.5Z" fill="#d6d2c8"/></svg>`;
  function flushCss() {
    if (!cssEl) { cssEl = document.createElement('style'); cssEl.id = 'cwCss'; document.head.appendChild(cssEl); kfEl = document.createElement('style'); kfEl.id = 'cwKf'; document.head.appendChild(kfEl); }
    world.querySelector('.cw-g defs').innerHTML = K.defsSvg(); cssEl.textContent = K.css('.cw'); kfEl.textContent = kfCss;
  }

  /* ---------- kamera ---------- */
  const clampCam = () => { const hw = vw / 2 / cam.z, hh = vh / 2 / cam.z, x0 = data.x + hw, x1 = data.x + data.w - hw, y0 = data.y + hh, y1 = data.y + data.h - hh;
    cam.x = x0 > x1 ? data.x + data.w / 2 : Math.max(x0, Math.min(x1, cam.x)); cam.y = y0 > y1 ? data.y + data.h / 2 : Math.max(y0, Math.min(y1, cam.y)); };
  function apply() {
    cam.z = Math.max(Math.max(ZMIN, vw / data.w, vh / data.h), Math.min(ZMAX, cam.z)); clampCam();
    world.style.transform = `translate3d(${f1(vw / 2 - (cam.x - data.x) * cam.z)}px,${f1(vh / 2 - (cam.y - data.y) * cam.z)}px,0) scale(${cam.z.toFixed(4)})`;
    world.style.setProperty('--iz', (1 / cam.z).toFixed(3));
    const now = performance.now(); if (now - lastCull > 220) { lastCull = now; doCull(); placeInd(); } else if (!apply.t) apply.t = setTimeout(() => { apply.t = 0; lastCull = performance.now(); doCull(); placeInd(); }, 240);
  }
  // görüş dışındaki canlandırmaları durdur (katman ve işlemci yükü azalsın)
  function doCull() { const m = 260, x0 = cam.x - data.x - vw / 2 / cam.z - m, x1 = cam.x - data.x + vw / 2 / cam.z + m, y0 = cam.y - data.y - vh / 2 / cam.z - m, y1 = cam.y - data.y + vh / 2 / cam.z + m;
    for (const c of cull) { const on = c.x > x0 && c.x < x1 && c.y > y0 && c.y < y1; if (on !== c.on) { c.on = on; c.e.style.display = on ? '' : 'none'; } } }
  function resize() { const r = host.getBoundingClientRect(); if (!r.width || !r.height) return; const first = !vw; vw = r.width; vh = r.height;
    if (!cam) { const c = K.pr(...(data.home || [30, 30, 2.4])), z = Math.max(.6, Math.min(.92, vw / 520)); cam = { x: c[0], y: c[1] - 40, z }; if (first) { const to = Object.assign({}, cam); cam = { x: c[0], y: c[1] + 120, z: Math.max(ZMIN, z * .62) }; apply(); setTimeout(() => glide(to.x, to.y, to.z, 1500), 350); return; } }
    apply(); }
  const stop = () => { cancelAnimationFrame(anim); anim = 0; };
  function glide(x, y, z, ms = 620) { stop(); const a = Object.assign({}, cam), t0 = performance.now();
    const step = t => { const k = Math.min(1, (t - t0) / ms), e = k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; cam.x = a.x + (x - a.x) * e; cam.y = a.y + (y - a.y) * e; cam.z = a.z + ((z || a.z) - a.z) * e; apply(); if (k < 1) anim = requestAnimationFrame(step); else anim = 0; };
    anim = requestAnimationFrame(step); }
  function focus(id) { const t = data.tags.find(q => q.id === id); if (!t) return; const p = K.pr(t.at[0], t.at[1], t.at[2]); glide(p[0], p[1] - 70 / cam.z, Math.max(cam.z, .8)); }
  const zoomAt = (nz, cx, cy) => { nz = Math.max(Math.max(ZMIN, vw / data.w, vh / data.h), Math.min(ZMAX, nz)); const wxp = cam.x + (cx - vw / 2) / cam.z, wyp = cam.y + (cy - vh / 2) / cam.z; cam.z = nz; cam.x = wxp - (cx - vw / 2) / nz; cam.y = wyp - (cy - vh / 2) / nz; };

  /* ---------- dokunma: tek parmak kaydırır, iki parmak yakınlaştırır ---------- */
  function bind() {
    const pts = new Map(); let pinch = null, down = null, vel = [0, 0], lt = 0;
    const rel = e => { const r = host.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
    host.addEventListener('pointerdown', e => { if (e.pointerType === 'mouse' && e.button) return; stop(); pts.set(e.pointerId, rel(e));
      if (pts.size === 1) { moved = false; down = rel(e); vel = [0, 0]; lt = performance.now(); }
      else if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, z: cam.z, m: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2] }; moved = true; } });
    window.addEventListener('pointermove', e => { const o = pts.get(e.pointerId); if (!o) return; const p = rel(e);
      if (pts.size === 1) { if (!moved && Math.hypot(p[0] - down[0], p[1] - down[1]) > 7) { moved = true; host.classList.add('drag'); }
        if (moved) { const dx = p[0] - o[0], dy = p[1] - o[1], now = performance.now(), dt = Math.max(4, now - lt); lt = now; cam.x -= dx / cam.z; cam.y -= dy / cam.z; vel = [vel[0] * .5 + dx / dt * .5, vel[1] * .5 + dy / dt * .5]; apply(); } pts.set(e.pointerId, p); }
      else if (pinch && pts.size === 2) { pts.set(e.pointerId, p); const [a, b] = [...pts.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        cam.x -= (m[0] - pinch.m[0]) / cam.z; cam.y -= (m[1] - pinch.m[1]) / cam.z; pinch.m = m; zoomAt(pinch.z * d / pinch.d, m[0], m[1]); apply(); } });
    const up = e => { if (!pts.delete(e.pointerId)) return; host.classList.remove('drag');
      if (pts.size === 0) { pinch = null; if (moved && performance.now() - lt < 90 && Math.hypot(vel[0], vel[1]) > .08) { let v = vel.slice(), t0 = performance.now();
        const step = t => { const dt = Math.min(40, t - t0); t0 = t; cam.x -= v[0] * dt / cam.z; cam.y -= v[1] * dt / cam.z; const k = Math.pow(.95, dt / 16); v = [v[0] * k, v[1] * k]; apply(); anim = Math.hypot(v[0], v[1]) > .02 ? requestAnimationFrame(step) : 0; }; anim = requestAnimationFrame(step); } }
      else if (pts.size === 1) { pinch = null; down = [...pts.values()][0]; lt = performance.now(); vel = [0, 0]; } };
    window.addEventListener('pointerup', up); window.addEventListener('pointercancel', up);
    // sürükleme bittiğinde gelen tıklama yapıyı açmasın
    host.addEventListener('click', e => { if (moved) { e.stopPropagation(); e.preventDefault(); moved = false; return; }
      const t = e.target.closest('[data-tag],[data-b],.cw-ship'), bd = e.target.closest('.cf-birds');
      if (bd && !bd.classList.contains('fly')) { bd.classList.add('fly'); setTimeout(() => bd.classList.remove('fly'), 5200 + Math.random() * 2500); }
      if (t) ping(e);
      else if (!e.target.closest('button') && data.isSea) { // denize dokunuş: yayılan halka
        const r = host.getBoundingClientRect(), sx = cam.x + (e.clientX - r.left - vw / 2) / cam.z, sy = cam.y + (e.clientY - r.top - vh / 2) / cam.z, q = (sy + data.seaZ * K.ZU) * 2 / K.U, gx = (sx / K.U + q) / 2, gy = (q - sx / K.U) / 2;
        if (data.isSea(gx, gy)) for (const k of ['', ' b']) { const i = document.createElement('i'); i.className = 'cf cw-rip' + k; i.style.left = (sx - data.x) + 'px'; i.style.top = (sy - data.y) + 'px'; hi.appendChild(i); i.addEventListener('animationend', () => i.remove()); } } }, true);
    host.addEventListener('wheel', e => { e.preventDefault(); stop(); const p = rel(e); zoomAt(cam.z * Math.exp(-e.deltaY * (e.ctrlKey ? .012 : .0022)), p[0], p[1]); apply(); }, { passive: false });
    indEl.addEventListener('click', e => { const b = e.target.closest('[data-go]'); if (b) { e.stopPropagation(); focus(b.dataset.go); } });
  }
  // dokunuş halkası
  function ping(e) { const r = host.getBoundingClientRect(), i = document.createElement('i'); i.className = 'cw-ping'; i.style.left = (e.clientX - r.left) + 'px'; i.style.top = (e.clientY - r.top) + 'px'; host.appendChild(i); i.addEventListener('animationend', () => i.remove()); }

  /* ---------- durumlar ve kenar işaretleri ---------- */
  function status(map) { statusMap = map || {};
    for (const b of B) { const st = (statusMap[b.id] || ['', ''])[1], el = tagsEl.querySelector(`[data-tag="${b.id}"]`); if (!el) continue; el.classList.toggle('has', !!st); el.lastChild.className = 'lm-dot ' + st; }
    placeInd(); }
  // bekleyen işi olan ama ekranda görünmeyen yapılar için kenarda ok
  function placeInd() { if (!cam) return; let h = ''; const padT = 118, padB = 74, pad = 26;
    for (const t of data.tags) { const st = (statusMap[t.id] || ['', ''])[1]; if (!st) continue; const b = B.find(q => q.id === t.id); if (!b) continue;
      const p = K.pr(t.at[0], t.at[1], t.at[2]), sx = vw / 2 + (p[0] - cam.x) * cam.z, sy = vh / 2 + (p[1] - cam.y) * cam.z - 30;
      if (sx > 8 && sx < vw - 8 && sy > padT - 30 && sy < vh - padB + 20) continue;
      const cx = Math.max(pad, Math.min(vw - pad, sx)), cy = Math.max(padT, Math.min(vh - padB, sy)), ang = Math.atan2(sy - cy, sx - cx) * 180 / Math.PI;
      h += `<button class="cw-go ${st}" data-go="${t.id}" style="left:${f1(cx)}px;top:${f1(cy)}px" aria-label="${b.name}"><i style="transform:rotate(${f1(ang)}deg)"></i><svg class="ic"><use href="#i-${b.ic}"/></svg></button>`; }
    if (indEl.innerHTML !== h) indEl.innerHTML = h; }
  function ship(id, away) { if (!shipEl) return; if (id !== shipId) { shipId = id; shipEl.innerHTML = spriteSvg('gemi-' + id, { dir: data.moor.dir || 'x' }) || spriteSvg('gemi-poyraz', { dir: data.moor.dir || 'x' }) || spriteSvg('tekne-balikci', { dir: data.moor.dir || 'x' }); flushCss(); }
    shipAway = !!away; shipEl.style.visibility = away ? 'hidden' : ''; moorEl.style.visibility = away ? '' : 'hidden'; }
  // başka ekrandayken dünya çizilmez ve canlandırmalar durur
  let hideT = 0;
  function show(on) { if (!mounted) return; clearTimeout(hideT); if (on) { world.style.display = ''; } else hideT = setTimeout(() => { world.style.display = 'none'; }, 520); }
  return { mount, status, ship, focus, show, home, get ready() { return mounted; } };
})();
