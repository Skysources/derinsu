/* =========================================================
   DERİNSU — av sahnesi (canvas)
   Gökyüzü, uzak kıyı, dalgalı su, iskele, balıkçı, olta ipi ve şamandıra.
   Her av yerinin kendi havası var: dere (ateşböceği), göl (saz ve sis),
   koy (kayalar, martı), burun (yağmur, şimşek), çukur (parlayan zerreler).

   const sc = FishScene.create(canvas)  ·  sc.setSpot(spot)  ·  sc.set(phase, p)
   phase: 'idle' | 'cast' | 'wait' | 'bite'  ·  p: atışın 0–1 ilerlemesi
   sc.catchFx(fish, color)  ·  sc.splash(big)  ·  sc.start() / sc.stop()
   FishScene.thumb(canvas, spot)  ·  tek kare (ana ekran kartları)
   ========================================================= */
window.FishScene = (() => {
  'use strict';
  const TAU = Math.PI * 2;
  const imgCache = {};
  function img(src) {
    if (!imgCache[src]) { const i = new Image(); i.src = src; imgCache[src] = i; }
    return imgCache[src];
  }
  const filterOk = (() => { try { const c = document.createElement('canvas').getContext('2d'); c.filter = 'blur(1px)'; return c.filter === 'blur(1px)'; } catch (e) { return false; } })();

  function rng(seed) { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }
  const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
  const lerp = (a, b, k) => a + (b - a) * k;

  // gün saati: 0 gündüz, 1 gece (yumuşak geçiş)
  function nightK() {
    const h = new Date().getHours() + new Date().getMinutes() / 60;
    if (h >= 7 && h <= 18) return 0;
    if (h > 18 && h < 20.5) return (h - 18) / 2.5;
    if (h > 5 && h < 7) return 1 - (h - 5) / 2;
    return 1;
  }

  /* ---------- sabit (tohumlu) sahne parçaları ---------- */
  function buildStatic(spot, w, h) {
    const r = rng(spot.t * 7919 + 13);
    const H = Math.round(h * .3);
    // uzak kıyı çizgisi
    const shore = [];
    const seg = 24;
    for (let i = 0; i <= seg; i++) {
      const x = i / seg * w;
      let y;
      if (spot.id === 'koy') y = H - (i < 9 ? 18 + Math.sin(i * .9) * 10 + r() * 6 : 4 + r() * 4);
      else if (spot.id === 'burun') y = H - (i > 15 ? 26 + (i - 15) * 2.4 + r() * 5 : 3 + r() * 3);
      else if (spot.id === 'cukur') y = H - (1 + r() * 2);
      else if (spot.id === 'gol') y = H - (8 + Math.sin(i * .5) * 5 + r() * 3);
      else y = H - (12 + Math.sin(i * .7 + 1) * 7 + r() * 5);
      shore.push([x, y]);
    }
    const trees = [];
    if (spot.id === 'dere' || spot.id === 'gol') for (let i = 0; i < 16; i++) trees.push({ x: r() * w, s: 6 + r() * 12, k: r() });
    const stars = []; for (let i = 0; i < 40; i++) stars.push({ x: r() * w, y: r() * H * .85, s: r() * 1.2 + .3, p: r() * TAU });
    const reeds = []; if (spot.id === 'gol' || spot.id === 'dere') for (let i = 0; i < (spot.id === 'gol' ? 26 : 10); i++) reeds.push({ x: w * (.62 + r() * .42), y: h * (.86 + r() * .16), hgt: 26 + r() * 40, p: r() * TAU });
    const rocks = []; if (spot.id === 'koy' || spot.id === 'burun') for (let i = 0; i < 5; i++) rocks.push({ x: w * (.55 + r() * .5), y: h * (.78 + r() * .2), s: 14 + r() * 26 });
    const shadows = []; for (let i = 0; i < 5; i++) shadows.push({ x: r() * w, y: lerp(H + 30, h * .95, r()), v: (r() * .5 + .3) * (r() < .5 ? -1 : 1), s: 8 + r() * 10 + spot.t * 2, p: r() * TAU });
    return { H, shore, trees, stars, reeds, rocks, shadows };
  }

  function create(canvas) {
    const ctx = canvas.getContext('2d');
    let W = 0, Hh = 0, dpr = 1, spot = null, st = null, raf = 0, running = false, last = 0, t = 0;
    let phase = 'idle', prog = 0;
    const parts = [], flies = [], drops = [], rain = [];
    let catchAnim = null, flash = 0, flashAt = 4, bob = { x: 0, y: 0, dip: 0 }, castFrom = 0;

    function resize() {
      const r = canvas.getBoundingClientRect();
      if (!r.width || !r.height) return;
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = r.width; Hh = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(Hh * dpr);
      if (spot) st = buildStatic(spot, W, Hh);
      initAmbient();
    }
    function initAmbient() {
      flies.length = 0; rain.length = 0;
      if (!spot) return;
      const r = rng(spot.t * 31);
      const n = spot.id === 'dere' ? 14 : spot.id === 'cukur' ? 26 : spot.id === 'gol' ? 6 : 0;
      for (let i = 0; i < n; i++) flies.push({ x: r() * W, y: lerp(Hh * .25, Hh * .95, r()), p: r() * TAU, v: .3 + r() * .6 });
      if (spot.id === 'burun') for (let i = 0; i < 70; i++) rain.push({ x: r() * W, y: r() * Hh, v: 380 + r() * 220, l: 8 + r() * 10 });
    }

    /* geometri: iskele ucu, olta ucu, şamandıra */
    const geo = () => {
      const px = W * .36, py = Hh * .7;                // iskele ucu (balıkçının oturduğu yer)
      return { px, py, hand: [px + 12, py - 24], tip: [W * .6, Hh * .37], bob: [W * .72, Hh * .57] };
    };

    function drawSky(nk) {
      const p = spot.pal, H = st.H;
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, p.sk0); g.addColorStop(1, p.sk1);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H + 2);
      if (nk > 0) { ctx.fillStyle = `rgba(6,6,12,${.55 * nk})`; ctx.fillRect(0, 0, W, H + 2); }
      // yıldızlar
      if (nk > .3 || spot.id === 'cukur') {
        const a = spot.id === 'cukur' ? .6 : nk;
        for (const s of st.stars) { ctx.fillStyle = `rgba(255,244,220,${a * (.35 + .35 * Math.sin(t * 1.5 + s.p))})`; ctx.fillRect(s.x, s.y, s.s, s.s); }
      }
      // güneş / ay
      if (spot.id !== 'burun') {
        const sx = W * .78, sy = H * (nk > .5 ? .32 : .42), R = nk > .5 ? 9 : 13;
        const gl = ctx.createRadialGradient(sx, sy, 0, sx, sy, R * 5);
        gl.addColorStop(0, hexA(p.lit, .45)); gl.addColorStop(1, hexA(p.lit, 0));
        ctx.fillStyle = gl; ctx.fillRect(sx - R * 5, sy - R * 5, R * 10, R * 10);
        ctx.fillStyle = hexA(p.lit, nk > .5 ? .85 : .9); ctx.beginPath(); ctx.arc(sx, sy, R, 0, TAU); ctx.fill();
      } else {
        // fırtına bulutları
        for (let i = 0; i < 6; i++) {
          const cx = ((i * 97 + t * 6) % (W + 160)) - 80, cy = H * (.25 + (i % 3) * .18);
          ctx.fillStyle = `rgba(10,12,16,${.35 + (i % 2) * .15})`;
          ctx.beginPath(); ctx.ellipse(cx, cy, 70, 16, 0, 0, TAU); ctx.fill();
        }
      }
      // ince bulut şeritleri
      if (spot.id !== 'cukur') {
        ctx.fillStyle = 'rgba(255,240,210,.05)';
        for (let i = 0; i < 3; i++) { const cx = ((i * 140 + t * 3) % (W + 200)) - 100; ctx.beginPath(); ctx.ellipse(cx, H * (.2 + i * .2), 60, 4, 0, 0, TAU); ctx.fill(); }
      }
    }

    function drawShore(nk) {
      const p = spot.pal, H = st.H;
      ctx.fillStyle = p.far;
      ctx.beginPath(); ctx.moveTo(0, H + 1);
      for (const [x, y] of st.shore) ctx.lineTo(x, y);
      ctx.lineTo(W, H + 1); ctx.closePath(); ctx.fill();
      // ağaçlar: söğüt gövdeleri ve tepeleri
      for (const tr of st.trees) {
        const y = H - 2;
        ctx.fillStyle = p.far;
        ctx.beginPath(); ctx.ellipse(tr.x, y - tr.s, tr.s * .8, tr.s, 0, 0, TAU); ctx.fill();
        if (spot.id === 'gol') { ctx.fillRect(tr.x - .6, y - tr.s * 2.2, 1.2, tr.s * 2.2); }
      }
      // kıyı çizgisinde ışık
      ctx.strokeStyle = hexA(p.lit, .12 * (1 - nk * .6)); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(0, H + .5); ctx.lineTo(W, H + .5); ctx.stroke();
      // çukur: ufukta mor ışıltı
      if (spot.id === 'cukur') {
        const g = ctx.createLinearGradient(0, H - 30, 0, H + 20);
        g.addColorStop(0, 'rgba(120,90,180,0)'); g.addColorStop(.6, 'rgba(120,90,180,.16)'); g.addColorStop(1, 'rgba(120,90,180,0)');
        ctx.fillStyle = g; ctx.fillRect(0, H - 30, W, 50);
      }
    }

    function drawWater(nk) {
      const p = spot.pal, H = st.H;
      const g = ctx.createLinearGradient(0, H, 0, Hh);
      g.addColorStop(0, p.w0); g.addColorStop(1, p.w1);
      ctx.fillStyle = g; ctx.fillRect(0, H, W, Hh - H);
      if (nk > 0) { ctx.fillStyle = `rgba(4,5,10,${.4 * nk})`; ctx.fillRect(0, H, W, Hh - H); }
      // güneş yansıması
      if (spot.id !== 'burun') {
        const sx = W * .78;
        for (let i = 0; i < 18; i++) {
          const y = H + 4 + i * i * .9; if (y > Hh) break;
          const ww = 6 + i * 2.2 + Math.sin(t * 2 + i) * 4;
          ctx.fillStyle = hexA(p.lit, .16 * (1 - i / 18));
          ctx.fillRect(sx - ww / 2 + Math.sin(t * 1.3 + i * .7) * 3, y, ww, 1.4);
        }
      }
      // dalga çizgileri (ufka doğru sıklaşır)
      const rough = spot.id === 'burun' ? 2.2 : spot.id === 'koy' ? 1.4 : spot.id === 'cukur' ? .6 : 1;
      ctx.lineWidth = 1;
      for (let i = 0; i < 26; i++) {
        const k = i / 26, y = H + 3 + Math.pow(k, 1.8) * (Hh - H);
        const amp = (1 + k * 3) * rough, len = 10 + k * 40, gap = len * 1.8;
        ctx.strokeStyle = hexA(p.lit, .05 + k * .06);
        ctx.beginPath();
        const off = ((t * (8 + k * 20) * (i % 2 ? 1 : -1)) % gap + gap) % gap;
        for (let x = -gap + off + (i * 37) % gap; x < W; x += gap) {
          const yy = y + Math.sin(t * 1.6 + x * .02 + i) * amp;
          ctx.moveTo(x, yy); ctx.quadraticCurveTo(x + len / 2, yy - amp, x + len, yy);
        }
        ctx.stroke();
      }
      // su altında gezen balık gölgeleri
      for (const s of st.shadows) {
        s.x += s.v * 14 * dtS; if (s.x > W + 30) s.x = -30; if (s.x < -30) s.x = W + 30;
        const wig = Math.sin(t * 5 + s.p) * .25;
        ctx.save(); ctx.translate(s.x, s.y + Math.sin(t + s.p) * 3); ctx.scale(Math.sign(s.v) || 1, 1);
        ctx.fillStyle = spot.id === 'cukur' ? 'rgba(160,130,230,.10)' : 'rgba(0,0,0,.2)';
        ctx.beginPath(); ctx.ellipse(0, 0, s.s, s.s * .32, 0, 0, TAU); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-s.s * .9, 0); ctx.lineTo(-s.s * 1.5, -s.s * .3 + wig * 5); ctx.lineTo(-s.s * 1.5, s.s * .3 + wig * 5); ctx.closePath(); ctx.fill();
        ctx.restore();
      }
    }

    function drawRocksBack() {
      for (const r of st.rocks) {
        ctx.fillStyle = '#1a1c1e';
        ctx.beginPath(); ctx.moveTo(r.x - r.s, r.y + 4); ctx.quadraticCurveTo(r.x - r.s * .6, r.y - r.s * .9, r.x, r.y - r.s * .7);
        ctx.quadraticCurveTo(r.x + r.s * .7, r.y - r.s * .8, r.x + r.s, r.y + 4); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(255,240,210,.08)'; ctx.beginPath(); ctx.moveTo(r.x - r.s * .6, r.y - r.s * .5); ctx.quadraticCurveTo(r.x - r.s * .2, r.y - r.s * .85, r.x, r.y - r.s * .7); ctx.stroke();
        // köpük
        ctx.strokeStyle = `rgba(230,236,240,${.18 + .12 * Math.sin(t * 2 + r.x)})`;
        ctx.beginPath(); ctx.ellipse(r.x, r.y + 4, r.s * 1.05, 3, 0, 0, Math.PI); ctx.stroke();
      }
    }

    function drawPier(nk) {
      const { px, py } = geo();
      const deckH = 7;
      // direkler
      ctx.fillStyle = '#21180f';
      for (let i = 0; i < 4; i++) { const x = px - 8 - i * (px / 3.2); ctx.fillRect(x, py + 2 + i * 3, 5, 26 + i * 6); }
      // yansıma
      ctx.fillStyle = 'rgba(0,0,0,.22)';
      ctx.beginPath(); ctx.moveTo(0, py + 30); ctx.lineTo(px + 4, py + deckH + 4); ctx.lineTo(px + 4, py + deckH + 18); ctx.lineTo(0, py + 60); ctx.fill();
      // güverte
      const g = ctx.createLinearGradient(0, py - 4, 0, py + deckH + 14);
      g.addColorStop(0, '#6a5034'); g.addColorStop(1, '#3a2a1b');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.moveTo(-2, py + 16); ctx.lineTo(px + 4, py - 1); ctx.lineTo(px + 4, py + deckH - 1); ctx.lineTo(-2, py + 16 + deckH + 6); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(20,12,6,.6)'; ctx.lineWidth = 1;
      for (let i = 1; i < 9; i++) { const k = i / 9, x = lerp(-2, px + 4, k), y = lerp(py + 16, py - 1, k); ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + deckH + (1 - k) * 6); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(255,220,170,.18)'; ctx.beginPath(); ctx.moveTo(-2, py + 16); ctx.lineTo(px + 4, py - 1); ctx.stroke();
      // fener direği
      const lx = px - 30, ly = py + 6;
      ctx.fillStyle = '#2a1e12'; ctx.fillRect(lx, ly - 46, 3, 46);
      ctx.fillRect(lx - 4, ly - 47, 12, 2);
      const lit = nk > .2 || spot.id === 'cukur' || spot.id === 'burun';
      ctx.fillStyle = lit ? '#ffd27a' : '#6d5e3b';
      ctx.fillRect(lx + 4, ly - 44, 5, 7);
      if (lit) {
        const gl = ctx.createRadialGradient(lx + 6, ly - 40, 0, lx + 6, ly - 40, 46);
        gl.addColorStop(0, `rgba(255,200,110,${.32 + .05 * Math.sin(t * 7)})`); gl.addColorStop(1, 'rgba(255,200,110,0)');
        ctx.fillStyle = gl; ctx.fillRect(lx - 40, ly - 86, 92, 92);
      }
      // fıçı (sepet)
      const bx = px - 20, by = py + 1;
      ctx.fillStyle = '#4b3420'; ctx.beginPath(); ctx.ellipse(bx, by - 6, 8, 3, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#5a3f26'; ctx.fillRect(bx - 8, by - 6, 16, 12);
      ctx.fillStyle = '#2a1d10'; ctx.fillRect(bx - 8, by - 3, 16, 1.6); ctx.fillRect(bx - 8, by + 2, 16, 1.6);
      ctx.fillStyle = '#21170d'; ctx.beginPath(); ctx.ellipse(bx, by - 6, 6.5, 2.2, 0, 0, TAU); ctx.fill();
    }

    function rodBend() { return phase === 'bite' ? 1 : phase === 'cast' ? .2 : .25 + Math.sin(t * 1.4) * .05; }

    function drawFisher() {
      const { px, py, hand } = geo();
      const x = px - 4, y = py - 2;
      ctx.save();
      // gövde
      ctx.fillStyle = '#2b2620';
      ctx.beginPath(); ctx.moveTo(x - 9, y); ctx.quadraticCurveTo(x - 10, y - 22, x - 2, y - 26); ctx.quadraticCurveTo(x + 7, y - 24, x + 8, y - 6); ctx.lineTo(x + 8, y); ctx.closePath(); ctx.fill();
      // bacaklar sarkık
      ctx.fillStyle = '#1e1a16'; ctx.fillRect(x + 4, y - 3, 10, 5); ctx.fillRect(x + 11, y - 1, 4, 12);
      // kol
      ctx.strokeStyle = '#2b2620'; ctx.lineWidth = 4.5; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(x + 1, y - 20); ctx.lineTo(hand[0], hand[1] + 2); ctx.stroke();
      // baş ve hasır şapka
      ctx.fillStyle = '#c99a6c'; ctx.beginPath(); ctx.arc(x - 1, y - 30, 4.6, 0, TAU); ctx.fill();
      ctx.fillStyle = '#b8913e'; ctx.beginPath(); ctx.ellipse(x - 1, y - 33, 11, 2.6, -.08, 0, TAU); ctx.fill();
      ctx.fillStyle = '#d6af57'; ctx.beginPath(); ctx.ellipse(x - 1, y - 35.5, 5.4, 3.6, 0, Math.PI, TAU); ctx.fill();
      ctx.fillStyle = '#6d5e3b'; ctx.fillRect(x - 6, y - 34.4, 10, 1.2);
      ctx.restore();
    }

    function drawRodAndLine() {
      const { hand, tip, bob: b0 } = geo();
      const bend = rodBend();
      const tx = tip[0] - bend * 14, ty = tip[1] + bend * 16;
      // olta
      ctx.strokeStyle = '#7a5a34'; ctx.lineWidth = 2.4; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(hand[0] - 6, hand[1] + 6);
      ctx.quadraticCurveTo(lerp(hand[0], tx, .55), lerp(hand[1], ty, .55) - 18 + bend * 10, tx, ty); ctx.stroke();
      ctx.strokeStyle = '#c9a24e'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(hand[0] - 1, hand[1] + 2, 2.4, 0, TAU); ctx.stroke();
      // şamandıra konumu
      let bx = b0[0], by = b0[1] + Math.sin(t * 2.2) * 1.6, under = 0;
      if (phase === 'cast') {
        const k = Math.min(1, prog / .08);                  // atış: ip uçtan kavisle suya
        bx = lerp(tx, b0[0], k); by = lerp(ty, b0[1], k) - Math.sin(k * Math.PI) * 40;
        if (k >= 1 && castFrom === 0) { castFrom = 1; splashAt(b0[0], b0[1], 5, .6); }
      } else castFrom = 0;
      if (phase === 'bite') { under = (Math.sin(t * 22) * .5 + .5) * 5 + 3; by += under; if (Math.random() < .25) splashAt(bx, b0[1], 1, .3); }
      bob.x = bx; bob.y = by; bob.dip = under;
      // ip
      ctx.strokeStyle = 'rgba(240,230,210,.55)'; ctx.lineWidth = .8;
      ctx.beginPath(); ctx.moveTo(tx, ty);
      const sag = phase === 'bite' ? 2 : 14;
      ctx.quadraticCurveTo((tx + bx) / 2, Math.max(ty, by) + sag, bx, by - 3); ctx.stroke();
      if (phase === 'idle') return;
      // halkalar
      if (phase !== 'cast') {
        const rr = phase === 'bite' ? 3 : 1;
        for (let i = 0; i < rr; i++) {
          const k = ((t * (phase === 'bite' ? 1.8 : .5) + i / rr) % 1);
          ctx.strokeStyle = `rgba(240,230,210,${.35 * (1 - k)})`; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.ellipse(bx, b0[1] + 2, 4 + k * 22, 1.2 + k * 5, 0, 0, TAU); ctx.stroke();
        }
      }
      // şamandıra
      ctx.save(); ctx.translate(bx, by);
      ctx.fillStyle = '#f2ead8'; ctx.beginPath(); ctx.ellipse(0, 0, 3.4, 4.2, 0, 0, Math.PI); ctx.fill();
      ctx.fillStyle = '#d8553f'; ctx.beginPath(); ctx.ellipse(0, 0, 3.4, 4.2, 0, Math.PI, TAU); ctx.fill();
      ctx.fillStyle = '#2b2620'; ctx.fillRect(-.6, -8, 1.2, 4);
      if (phase === 'bite') {
        ctx.strokeStyle = `rgba(231,194,106,${.6 + .4 * Math.sin(t * 16)})`; ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.arc(0, -1, 9 + Math.sin(t * 16) * 1.5, 0, TAU); ctx.stroke();
      }
      ctx.restore();
    }

    function drawReeds(front) {
      for (const r of st.reeds) {
        if ((r.y > Hh * .93) !== front) continue;
        const sway = Math.sin(t * 1.2 + r.p) * 4;
        ctx.strokeStyle = front ? '#151a13' : '#1f271c'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(r.x, r.y); ctx.quadraticCurveTo(r.x + sway * .3, r.y - r.hgt * .6, r.x + sway, r.y - r.hgt); ctx.stroke();
        ctx.fillStyle = front ? '#2a1f14' : '#3a2b1b';
        ctx.beginPath(); ctx.ellipse(r.x + sway, r.y - r.hgt, 2, 6, sway * .03, 0, TAU); ctx.fill();
      }
    }

    function drawAmbient() {
      // ateşböceği / zerre
      for (const f of flies) {
        f.p += f.v * dtS; const x = f.x + Math.sin(f.p) * 16, y = f.y + Math.cos(f.p * .7) * 10;
        const a = .35 + .35 * Math.sin(f.p * 3);
        ctx.fillStyle = spot.id === 'cukur' ? `rgba(185,166,230,${a})` : spot.id === 'gol' ? `rgba(240,236,220,${a * .4})` : `rgba(240,220,120,${a})`;
        ctx.beginPath(); ctx.arc(x, y, spot.id === 'gol' ? 10 : 1.4, 0, TAU); ctx.fill();
      }
      // göl sisi
      if (spot.id === 'gol') {
        ctx.fillStyle = 'rgba(220,214,200,.05)';
        for (let i = 0; i < 4; i++) { const x = ((t * 8 + i * 160) % (W + 300)) - 150; ctx.beginPath(); ctx.ellipse(x, st.H + 14 + i * 9, 140, 9, 0, 0, TAU); ctx.fill(); }
      }
      // martılar
      if (spot.id === 'koy') {
        ctx.strokeStyle = 'rgba(240,236,228,.7)'; ctx.lineWidth = 1.2;
        for (let i = 0; i < 3; i++) {
          const x = ((t * (14 + i * 4) + i * 120) % (W + 60)) - 30, y = st.H * (.35 + i * .15) + Math.sin(t + i) * 6, f = Math.sin(t * 6 + i) * 3;
          ctx.beginPath(); ctx.moveTo(x - 6, y - f); ctx.quadraticCurveTo(x - 3, y - 3, x, y); ctx.quadraticCurveTo(x + 3, y - 3, x + 6, y - f); ctx.stroke();
        }
      }
      // yağmur
      if (rain.length) {
        ctx.strokeStyle = 'rgba(200,210,220,.22)'; ctx.lineWidth = 1; ctx.beginPath();
        for (const d of rain) { d.y += d.v * dtS; d.x -= d.v * .25 * dtS; if (d.y > Hh) { d.y = -10; d.x = Math.random() * (W + 60); } ctx.moveTo(d.x, d.y); ctx.lineTo(d.x + d.l * .25, d.y - d.l); }
        ctx.stroke();
      }
    }

    function splashAt(x, y, n, k = 1) {
      for (let i = 0; i < n; i++) drops.push({ x, y, vx: (Math.random() - .5) * 60 * k, vy: -(40 + Math.random() * 80) * k, life: .6 + Math.random() * .3, a: 0 });
    }
    function drawDrops() {
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i]; d.a += dtS; d.vy += 260 * dtS; d.x += d.vx * dtS; d.y += d.vy * dtS;
        if (d.a > d.life) { drops.splice(i, 1); continue; }
        ctx.fillStyle = `rgba(235,240,240,${.8 * (1 - d.a / d.life)})`; ctx.fillRect(d.x, d.y, 1.6, 1.6);
      }
    }

    // yakalanan balık: şamandıradan iskeleye kavisle uçar, fıçıya düşer
    function drawCatch() {
      const c = catchAnim; if (!c) return;
      c.a += dtS;
      const k = Math.min(1, c.a / .95);
      const { px, py } = geo();
      const x = lerp(c.x0, px - 20, k), y = lerp(c.y0, py - 8, k) - Math.sin(k * Math.PI) * 70;
      const im = img(c.src);
      if (im.complete && im.naturalWidth) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(-.6 + k * 1.8 + Math.sin(c.a * 18) * .15 * (1 - k));
        const s = 30 * (1 - k * .45);
        // nadirlik ışığı
        if (c.q >= 2) { const gl = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 1.2); gl.addColorStop(0, hexA(c.color, .55)); gl.addColorStop(1, hexA(c.color, 0)); ctx.fillStyle = gl; ctx.fillRect(-s * 1.2, -s * 1.2, s * 2.4, s * 2.4); }
        if (filterOk) ctx.filter = `hue-rotate(${c.hue}deg) saturate(${c.sat})`;
        ctx.drawImage(im, -s / 2, -s / 2, s, s);
        ctx.filter = 'none';
        ctx.restore();
      }
      if (c.a < .3 && Math.random() < .5) splashAt(c.x0, c.y0 + 4, 2, .7);
      if (k >= 1) { catchAnim = null; splashAt(px - 20, py - 10, 4, .4); }
    }

    let dtS = 0;
    function frame(now) {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      dtS = Math.min(.05, (now - (last || now)) / 1000); last = now; t += dtS;
      draw();
    }
    function draw() {
      if (!spot || !W) return;
      if (!st) st = buildStatic(spot, W, Hh);
      const nk = spot.id === 'cukur' ? 1 : nightK();
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      drawSky(nk); drawShore(nk); drawWater(nk);
      drawReeds(false); drawRocksBack();
      drawPier(nk); drawFisher(); drawRodAndLine(); drawCatch(); drawDrops();
      drawReeds(true); drawAmbient();
      // şimşek
      if (spot.id === 'burun') {
        flashAt -= dtS;
        if (flashAt <= 0) { flash = 1; flashAt = 6 + Math.random() * 9; }
        if (flash > 0) { ctx.fillStyle = `rgba(230,236,255,${flash * .35})`; ctx.fillRect(0, 0, W, Hh); flash -= dtS * 3.5; }
      }
      // köşe gölgesi
      const vg = ctx.createRadialGradient(W / 2, Hh * .45, Math.min(W, Hh) * .35, W / 2, Hh * .5, Math.max(W, Hh) * .75);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.45)');
      ctx.fillStyle = vg; ctx.fillRect(0, 0, W, Hh);
    }

    const ro = window.ResizeObserver ? new ResizeObserver(() => { resize(); if (!running) draw(); }) : null;
    if (ro) ro.observe(canvas);

    return {
      setSpot(s) { spot = s; st = null; resize(); for (const f of FISH.filter(f => f.spot === s.id)) img(`assets/items/fish/fish-t${f.img}.png`); },
      set(ph, p) { phase = ph; prog = p; },
      catchFx(fish, color) {
        catchAnim = { src: `assets/items/fish/fish-t${fish.img}.png`, hue: fish.hue || 0, sat: fish.sat || 1, q: fish.q, color, a: 0, x0: bob.x || W * .72, y0: bob.y || Hh * .57 };
        splashAt(catchAnim.x0, catchAnim.y0, 10 + fish.q * 3, 1);
      },
      splash(big) { const b = geo().bob; splashAt(b[0], b[1], big ? 12 : 5, big ? 1 : .6); },
      start() { if (running) return; running = true; last = 0; resize(); raf = requestAnimationFrame(frame); },
      stop() { running = false; cancelAnimationFrame(raf); },
      get running() { return running; },
    };
  }

  /* ana ekran kartı için tek kare: su, kıyı ve ışık; balıkçı yok */
  function thumb(canvas, spot) {
    const r = canvas.getBoundingClientRect();
    if (!r.width) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1), W = r.width, H = r.height;
    canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
    const ctx = canvas.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const p = spot.pal, hz = H * .42, rr = rng(spot.t * 101);
    let g = ctx.createLinearGradient(0, 0, 0, hz); g.addColorStop(0, p.sk0); g.addColorStop(1, p.sk1);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, hz + 1);
    if (spot.id !== 'burun') { const gl = ctx.createRadialGradient(W * .8, hz * .45, 0, W * .8, hz * .45, 40); gl.addColorStop(0, hexA(p.lit, .5)); gl.addColorStop(1, hexA(p.lit, 0)); ctx.fillStyle = gl; ctx.fillRect(0, 0, W, hz); ctx.fillStyle = hexA(p.lit, .9); ctx.beginPath(); ctx.arc(W * .8, hz * .45, 6, 0, TAU); ctx.fill(); }
    ctx.fillStyle = p.far; ctx.beginPath(); ctx.moveTo(0, hz + 1);
    for (let i = 0; i <= 20; i++) { const x = i / 20 * W; const y = hz - (spot.id === 'koy' ? (i < 7 ? 14 + rr() * 6 : 2) : spot.id === 'burun' ? (i > 13 ? 6 + (i - 13) * 3 : 2) : spot.id === 'cukur' ? 1 : 4 + rr() * 6); ctx.lineTo(x, y); }
    ctx.lineTo(W, hz + 1); ctx.fill();
    g = ctx.createLinearGradient(0, hz, 0, H); g.addColorStop(0, p.w0); g.addColorStop(1, p.w1);
    ctx.fillStyle = g; ctx.fillRect(0, hz, W, H - hz);
    for (let i = 0; i < 12; i++) { const k = i / 12, y = hz + 3 + k * k * (H - hz); ctx.fillStyle = hexA(p.lit, .05 + k * .05); for (let x = (i * 23) % 50; x < W; x += 50 + k * 20) ctx.fillRect(x, y, 10 + k * 20, 1); }
    if (spot.id === 'cukur') for (let i = 0; i < 16; i++) { ctx.fillStyle = `rgba(185,166,230,${.3 + rr() * .4})`; ctx.fillRect(rr() * W, hz + rr() * (H - hz), 1.5, 1.5); }
    if (spot.id === 'burun') { ctx.strokeStyle = 'rgba(200,210,220,.2)'; ctx.beginPath(); for (let i = 0; i < 40; i++) { const x = rr() * W, y = rr() * H; ctx.moveTo(x, y); ctx.lineTo(x + 3, y - 10); } ctx.stroke(); }
  }

  return { create, thumb };
})();
