/* Derinsu · açık deniz sürü düğümleri (balık sürüsü işaretleri).
   Renk = sürü niteliği (q 0..3: Durgun, Kıpırtılı, Kaynıyor, Altın Akın)
   Kademe = bölge kademesi (tier 1..5): çerçeve biçimi + Roma rakamı levhası + metal rengi.
     I  Kıyı      : yalın halat halka, kumsal tunç
     II Koy       : perçinli tunç halka + ince dış halka
     III Açık D.  : pusula gülü (8 uç), çelik
     IV Derin D.  : dümen çarkı (8 kol + topuz), altın
     V  Uçurum    : dikenli taç + dönen nokta halkası, mor ışıma
   API:
     NodeArt.markHtml({ i, q, tier, name, left, on, x, y })  → DOM işaretinin HTML'i
     NodeArt.drawWater(c, s, x, y, t, dt, ctx)               → işaretin altındaki su (tuval)
     NodeArt.arrowColor(q) · NodeArt.drawArrow(c, ex, ey, a, q, tier, t)
   Tuval maliyeti: sürü başına en çok ~8 çizim; tüm degrade/şekiller (q,kademe) başına ≤128px önbellek tuvallerinde. */
window.NodeArt = (() => {
  const TAU = Math.PI * 2;
  const QC = ['#e8e4dc', '#6fcf62', '#4ea4f0', '#e0853a'];
  const QRGB = ['232,228,220', '111,207,98', '78,164,240', '224,133,58'];
  const NAMES = ['Durgun', 'Kıpırtılı', 'Kaynıyor', 'Altın Akın'];
  const ROM = ['', 'I', 'II', 'III', 'IV', 'V'];
  const METAL = ['', '#a48d6a', '#a97b45', '#aeb4b6', '#d6ac52', '#3a2d58'];
  const METAL_HI = ['', '#e2cfa4', '#e0b277', '#eef2f2', '#fbe3a0', '#b9a6e6'];
  const SQ = .7;                                   // su yüzeyi perspektif basıklığı
  const reduced = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const clampQ = q => Math.max(0, Math.min(3, q | 0));
  const clampT = t => Math.max(1, Math.min(5, (t | 0) || 1));
  const esc = v => String(v).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  const f2 = n => +n.toFixed(2);
  const P = (r, deg) => { const a = (deg - 90) * Math.PI / 180; return [f2(Math.cos(a) * r), f2(Math.sin(a) * r)]; };

  /* ---------------- DOM işareti ---------------- */
  const frameCache = [];
  function frame(t) {
    if (frameCache[t]) return frameCache[t];
    const R = 15.4;
    let back = '', s = '';
    if (t === 3) {                                  // pusula gülü
      for (let k = 0; k < 8; k++) {
        const deg = k * 45, card = k % 2 === 0, tip = card ? 21.6 : 18.9, hw = card ? 13 : 9;
        const a = P(tip, deg), b = P(R, deg - hw), c = P(R, deg + hw);
        back += `<path class="sm-f-orn${k === 0 ? ' hi' : ''}" d="M${a}L${b}L${c}Z"/>`;
      }
      back += `<circle class="sm-f-out" r="18"/>`;
    } else if (t === 4) {                           // dümen çarkı
      for (let k = 0; k < 8; k++) {
        const deg = k * 45 + 22.5, a = P(R, deg), b = P(19.6, deg);
        back += `<path class="sm-f-spb" d="M${a}L${b}"/><path class="sm-f-sp" d="M${a}L${b}"/>`;
      }
      for (let k = 0; k < 8; k++) { const [x, y] = P(20.4, k * 45 + 22.5); back += `<circle class="sm-f-knob" cx="${x}" cy="${y}" r="2"/>`; }
      back += `<circle class="sm-f-out" r="17.6"/>`;
    } else if (t === 5) {                           // dikenli taç
      for (let k = 0; k < 12; k++) {
        const deg = k * 30, tip = k % 2 ? 19.6 : 22.6, a = P(tip, deg), b = P(R - .4, deg - 8.5), c = P(R - .4, deg + 8.5);
        back += `<path class="sm-f-spk" d="M${a}L${b}L${c}Z"/>`;
      }
    } else if (t === 2) back += `<circle class="sm-f-out" r="18"/>`;
    s += `<circle class="sm-f-bed" r="${R}"/><circle class="sm-f-band" r="${R}"/>`;
    if (t === 1) s += `<circle class="sm-f-rope" r="${R}"/>`;
    const h0 = P(R, 285), h1 = P(R, 355);
    s += `<path class="sm-f-hi" d="M${h0}A${R} ${R} 0 0 1 ${h1}"/>`;
    if (t === 2) for (let k = 0; k < 4; k++) { const [x, y] = P(R, k * 90 + 45); s += `<circle class="sm-f-rv" cx="${x}" cy="${y}" r="1.25"/>`; }
    if (t === 4) for (let k = 0; k < 4; k++) { const [x, y] = P(R, k * 90); s += `<circle class="sm-f-rv" cx="${x}" cy="${y}" r="1"/>`; }
    s += `<circle class="sm-f-rim" r="13.5"/>`;
    return (frameCache[t] = `<svg class="sm-frame" viewBox="-24 -24 48 48" aria-hidden="true">${back}${s}</svg>`);
  }
  const FISH = '<svg class="sm-fish" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 12c3-4.5 9-6 14-2.5l3.5-2.5v10l-3.5-2.5C12 18 6 16.5 3 12z"/><circle class="sm-eye" cx="7.5" cy="11" r="1"/></svg>';
  const GLINT = '<i class="sm-glint" aria-hidden="true"><svg viewBox="-30 -30 60 60"><path d="M0-29.5l1.1 2.9 2.9 1.1-2.9 1.1L0-21.5l-1.1-2.9-2.9-1.1 2.9-1.1z"/><g transform="rotate(130)"><path d="M0 22.5l.8 2.2 2.2.8-2.2.8L0 28.5l-.8-2.2-2.2-.8 2.2-.8z"/></g></svg></i>';

  function markHtml(o) {
    const q = clampQ(o.q), t = clampT(o.tier), name = o.name || NAMES[q], left = o.left == null ? '' : o.left;
    const low = o.left != null && o.left <= 3;
    const pos = o.x != null && o.y != null ? `left:${o.x}px;top:${o.y}px;` : '';
    const cls = `sm sm-n q${q} t${t}${o.on ? ' on' : ''}${low ? ' low' : ''}`;
    const fx = (q >= 2 ? '<i class="sm-pulse"></i>' : '') + (q === 3 ? '<i class="sm-pulse b"></i>' + GLINT : '');
    return `<button class="${cls}" data-mark="s${o.i}" style="${pos}--qc:${QC[q]}" aria-label="${esc(name)} sürü · ${ROM[t]}. kademe · ${esc(left)} av">`
      + `<i class="sm-halo"></i>${fx}${o.on ? '<i class="sm-onr"></i>' : ''}${t === 5 ? '<i class="sm-orb"></i>' : ''}`
      + `<span class="sm-medal">${frame(t)}<span class="sm-disc">${FISH}</span><b class="sm-tier">${ROM[t]}</b></span>`
      + `<small class="sm-tag"><i class="sm-dot"></i>${esc(name)} · <b class="num">${esc(left)}</b></small></button>`;
  }

  /* ---------------- tuval: önbellekli küçük tuvaller ---------------- */
  const cache = new Map();
  function sprite(key, w, h, draw) {
    let cv = cache.get(key);
    if (!cv) {
      cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const g = cv.getContext('2d'); draw(g, w, h); cache.set(key, cv);
    }
    return cv;
  }
  // tohumlu rastgele: önbellek tuvalleri her açılışta aynı görünsün
  const rng = seed => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
  const radial = (g, r, stops) => { const gr = g.createRadialGradient(0, 0, 0, 0, 0, r); for (const [o, c] of stops) gr.addColorStop(o, c); return gr; };
  const dot = (g, x, y, r, c) => { g.fillStyle = c; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); };

  // taban: sürü gölgesi + nitelik ışıması + kademenin durağan süsü (128×96, basık çizilmiş)
  function baseSprite(q, t) {
    return sprite(`b${q}${t}`, 128, 96, g => {
      g.translate(64, 48); g.scale(1, SQ);
      const R = 62, rnd = rng(17 + q * 7 + t * 31);
      if (t === 5) {
        g.fillStyle = radial(g, R, [[0, 'rgba(150,120,240,.26)'], [.45, 'rgba(110,90,220,.12)'], [.7, 'rgba(90,200,230,.08)'], [1, 'rgba(90,200,230,0)']]);
        g.fillRect(-R, -R, R * 2, R * 2);
      } else {
        g.fillStyle = radial(g, 50, [[0, 'rgba(4,12,16,.34)'], [.6, 'rgba(4,12,16,.16)'], [1, 'rgba(4,12,16,0)']]);
        g.fillRect(-R, -R, R * 2, R * 2);
      }
      if (t === 1) {                                 // berrak sığlık + kum halkası
        g.fillStyle = radial(g, R, [[0, 'rgba(170,230,215,.10)'], [.55, 'rgba(214,198,150,0)'], [.74, 'rgba(222,204,152,.22)'], [.88, 'rgba(222,204,152,.07)'], [1, 'rgba(222,204,152,0)']]);
        g.fillRect(-R, -R, R * 2, R * 2);
        for (let k = 0; k < 10; k++) { const a = rnd() * TAU, r = 42 + rnd() * 12; dot(g, Math.cos(a) * r, Math.sin(a) * r, .8 + rnd() * .9, `rgba(244,232,196,${(.18 + rnd() * .2).toFixed(2)})`); }
      } else if (t === 2) {                          // yosunlu dip gölgesi
        g.fillStyle = radial(g, R, [[.5, 'rgba(30,70,44,0)'], [.78, 'rgba(30,70,44,.2)'], [1, 'rgba(30,70,44,0)']]);
        g.fillRect(-R, -R, R * 2, R * 2);
      } else if (t === 4) {                          // mercan kümeleri
        const cc = ['217,112,106', '224,160,96', '95,179,168', '201,138,208'];
        for (let k = 0; k < 9; k++) {
          const a = k / 9 * TAU + rnd() * .5, r = 40 + rnd() * 14, x = Math.cos(a) * r, y = Math.sin(a) * r, col = cc[k % 4];
          for (let j = 0; j < 3; j++) dot(g, x + (rnd() - .5) * 7, y + (rnd() - .5) * 7, 1.6 + rnd() * 2.2, `rgba(${col},${(.22 + rnd() * .14).toFixed(2)})`);
        }
      }
      const qa = [0, .12, .2, .3][q];
      if (qa) {
        const rc = QRGB[q];
        g.fillStyle = radial(g, 56, [[0, `rgba(${rc},${qa})`], [.5, `rgba(${rc},${(qa * .45).toFixed(3)})`], [1, `rgba(${rc},0)`]]);
        g.fillRect(-R, -R, R * 2, R * 2);
      }
    });
  }

  // kademe süsü (döner/salınır; 128×128, basık çerçevede döndürülür)
  function accentSprite(t) {
    return sprite(`a${t}`, 128, 128, g => {
      g.translate(64, 64);
      const rnd = rng(101 + t * 13);
      g.lineCap = 'round';
      if (t === 1) {                                 // kumda güneş pırıltısı
        g.strokeStyle = 'rgba(255,250,230,.75)'; g.lineWidth = 1;
        for (let k = 0; k < 6; k++) {
          const a = k / 6 * TAU + rnd() * .6, r = 44 + rnd() * 12, x = Math.cos(a) * r, y = Math.sin(a) * r, s = 1.6 + rnd() * 1.6;
          g.beginPath(); g.moveTo(x - s, y); g.lineTo(x + s, y); g.moveTo(x, y - s); g.lineTo(x, y + s); g.stroke();
        }
      } else if (t === 2) {                          // yosun şeritleri
        for (let k = 0; k < 7; k++) {
          const a = k / 7 * TAU + rnd() * .4, r0 = 40, len = 12 + rnd() * 10, side = rnd() < .5 ? -1 : 1;
          const ca = Math.cos(a), sa = Math.sin(a), px = -sa * side, py = ca * side;
          const bx = ca * r0, by = sa * r0, ex = ca * (r0 + len) + px * 4, ey = sa * (r0 + len) + py * 4;
          g.strokeStyle = 'rgba(38,92,58,.6)'; g.lineWidth = 2.4;
          g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(ca * (r0 + len * .5) - px * 4, sa * (r0 + len * .5) - py * 4, ex, ey); g.stroke();
          g.strokeStyle = 'rgba(120,170,90,.35)'; g.lineWidth = 1;
          g.beginPath(); g.moveTo(bx, by); g.quadraticCurveTo(ca * (r0 + len * .5) - px * 4, sa * (r0 + len * .5) - py * 4, ex, ey); g.stroke();
        }
      } else if (t === 3) {                          // köpüklü dalga başları
        for (let k = 0; k < 5; k++) {
          const a = k / 5 * TAU + rnd() * .5, r = 48 + rnd() * 10, sw = .28 + rnd() * .2;
          g.strokeStyle = 'rgba(236,244,246,.5)'; g.lineWidth = 1.6;
          g.beginPath(); g.arc(0, 0, r, a, a + sw); g.stroke();
          g.strokeStyle = 'rgba(236,244,246,.22)'; g.lineWidth = 1;
          g.beginPath(); g.arc(0, 0, r + 3.5, a + .06, a + sw * .7); g.stroke();
        }
      } else if (t === 4) {                          // dipte ışık oyunu
        for (let k = 0; k < 5; k++) {
          const a = k / 5 * TAU + rnd() * .7, r = 30 + rnd() * 24;
          g.save(); g.translate(Math.cos(a) * r, Math.sin(a) * r); g.rotate(a);
          g.scale(1, .45); g.fillStyle = radial(g, 9, [[0, 'rgba(220,250,255,.32)'], [1, 'rgba(220,250,255,0)']]);
          g.fillRect(-9, -9, 18, 18); g.restore();
        }
      } else {                                       // biyolüminesans zerreler
        for (let k = 0; k < 9; k++) {
          const a = k / 9 * TAU + rnd() * .5, r = 34 + rnd() * 26, x = Math.cos(a) * r, y = Math.sin(a) * r, cy = k % 3 === 0;
          g.save(); g.translate(x, y);
          g.fillStyle = radial(g, 5, [[0, cy ? 'rgba(130,230,245,.7)' : 'rgba(180,150,255,.7)'], [1, 'rgba(150,140,255,0)']]);
          g.fillRect(-5, -5, 10, 10); g.restore();
          dot(g, x, y, .9, cy ? 'rgba(210,250,255,.95)' : 'rgba(225,210,255,.95)');
        }
      }
    });
  }

  // balık halkası: halka boyunca teğet yüzen gölgeler (abyss: ışıklı balık); fl: aynı yerlerde nitelik parıltısı
  function fishRing(q, inner, abyss, fl) {
    return sprite(`f${q}${inner ? 1 : 0}${abyss ? 1 : 0}${fl ? 1 : 0}`, 128, 128, g => {
      g.translate(64, 64);
      const n = inner ? 2 + q : 3 + q, rnd = rng(7 + q * 5 + (inner ? 3 : 0));
      for (let k = 0; k < n; k++) {
        const a = k / n * TAU + rnd() * .5, r = (inner ? 29 : 41) + (rnd() - .5) * 6, s = .8 + rnd() * .35;
        g.save(); g.translate(Math.cos(a) * r, Math.sin(a) * r); g.rotate(a + Math.PI); g.scale(s, s);
        if (fl) {
          g.fillStyle = radial(g, 7, [[0, `rgba(${QRGB[q]},.9)`], [.4, `rgba(${QRGB[q]},.35)`], [1, `rgba(${QRGB[q]},0)`]]);
          g.fillRect(-7, -7, 14, 14);
        } else {
          g.fillStyle = abyss ? 'rgba(150,125,235,.36)' : 'rgba(2,8,12,.34)';
          g.beginPath(); g.ellipse(0, 0, 2.5, 6.4, 0, 0, TAU); g.fill();
          g.beginPath(); g.moveTo(0, 4.5); g.lineTo(-2.8, 9.5); g.lineTo(2.8, 9.5); g.closePath(); g.fill();
          if (abyss) dot(g, 0, -5, .9, 'rgba(160,240,255,.9)');
        }
        g.restore();
      }
    });
  }

  const RIP = [1, 2, 2, 3], RIP_P = [3.4, 3, 2.4, 1.8], RIP_A = [.2, .26, .32, .4];
  const RIP_C = ['rgb(230,240,245)', 'rgb(220,240,230)', QC[2], QC[3]];
  const SPD = [.32, .45, .62, .85];

  function drawWater(c, s, x, y, t, dt, ctx) {
    if (!s) return;
    ctx = ctx || {};
    const q = clampQ(s.q), tier = clampT(s.tier), abyss = tier === 5 || !!ctx.abyss;
    const tm = reduced ? t * .25 : t, spd = SPD[q] * (s.on ? 1.35 : 1), ph = (x * .013 + y * .007) % TAU;
    c.save();
    // 1 · taban
    const b = baseSprite(q, tier);
    c.globalAlpha = tier === 5 ? .78 + .22 * Math.sin(tm * 1.3 + ph) : 1;
    c.drawImage(b, x - 64, y - 48);
    // 2 · kademe süsü
    const acc = accentSprite(tier);
    let rot = 0, aa = 1;
    if (tier === 1) { rot = tm * .04; aa = .45 + .55 * Math.pow(Math.abs(Math.sin(tm * 1.6 + ph)), 3); }
    else if (tier === 2) { rot = Math.sin(tm * .9 + ph) * .06; aa = .9; }
    else if (tier === 3) { rot = tm * .16; aa = .55 + .35 * Math.sin(tm * 2.1 + ph); }
    else if (tier === 4) { rot = -tm * .07; aa = .6 + .4 * Math.sin(tm * 1.7 + ph); }
    else { rot = -tm * .22; aa = .55 + .45 * Math.sin(tm * 1.1 + ph); }
    c.globalAlpha = aa;
    c.translate(x, y); c.scale(1, SQ);
    c.rotate(rot); c.drawImage(acc, -64, -64); c.rotate(-rot);
    // 3-4 · balık halkaları (dış yavaş, iç hızlı)
    c.globalAlpha = 1;
    const ao = tm * spd + ph, ai = tm * spd * 1.45 + ph * 2;
    c.rotate(ao); c.drawImage(fishRing(q, false, abyss, false), -64, -64);
    // 5 · nitelik parıltısı: dönen balıklar ışığı yakalar
    if (q > 0) {
      const f = Math.pow(Math.max(0, Math.sin(tm * (1.4 + q * .5) + ph)), 6) * [0, .45, .75, 1][q];
      if (f > .03) { c.globalAlpha = f; c.drawImage(fishRing(q, false, abyss, true), -64, -64); c.globalAlpha = 1; }
    }
    c.rotate(ai - ao); c.drawImage(fishRing(q, true, abyss, false), -64, -64); c.rotate(-ai);
    // 6-8 · halkalanan su; nitelikle sıklaşır, Kaynıyor/Altın Akın renkli
    c.strokeStyle = abyss && q < 2 ? 'rgb(185,166,230)' : RIP_C[q]; c.lineWidth = q === 3 ? 1.4 : 1;
    const n = RIP[q], P0 = RIP_P[q] * (s.on ? .8 : 1);
    for (let k = 0; k < n; k++) {
      const p = ((tm / P0) + k / n + ph) % 1, r = 22 + p * (30 + q * 6);
      c.globalAlpha = Math.pow(1 - p, 1.6) * RIP_A[q] * Math.min(1, p * 6);
      c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke();
    }
    c.restore();
    // parçacıklar (haritanın kendi parçacık sistemine; dünya koordinatı)
    const push = ctx.push; if (!push || reduced || !dt) return;
    const wx = x + (ctx.cx || 0), wy = y + (ctx.cy || 0), R = Math.random;
    if (R() < dt * (.7 + q * .8) * (s.on ? 1.5 : 1)) {
      const a = R() * TAU, r = 18 + R() * 22;
      push({ x: wx + Math.cos(a) * r, y: wy + Math.sin(a) * r * SQ, vx: 0, vy: -5, life: 1.1, max: 1.1, c: abyss ? '185,166,230' : '230,240,245', r: 1.2, ring: true });
    }
    if (q >= 2 && R() < dt * (q === 3 ? .45 : .18)) {    // sürüden balık sıçrar
      const a = R() * TAU, r = 26 + R() * 14, sx = wx + Math.cos(a) * r, sy = wy + Math.sin(a) * r * SQ;
      for (let k = 0; k < 4; k++) push({ x: sx, y: sy, vx: (R() - .5) * 46, vy: -(34 + R() * 40), g: 220, life: .55, max: .55, c: '235,242,245', r: 1.2 });
      if (q === 3) for (let k = 0; k < 2; k++) push({ x: sx + (R() - .5) * 8, y: sy, vx: (R() - .5) * 10, vy: -16 - R() * 10, life: 1.2, max: 1.2, c: QRGB[3], r: 1.3 });
    }
    if (abyss && R() < dt * .9) {
      const a = R() * TAU, r = 20 + R() * 34;
      push({ x: wx + Math.cos(a) * r, y: wy + Math.sin(a) * r * SQ, vx: (R() - .5) * 4, vy: -4 - R() * 4, life: 2.2, max: 2.2, c: R() < .4 ? '130,230,245' : '180,150,255', r: 1.1 });
    }
  }

  /* ---------------- ekran dışı ok ---------------- */
  const arrowColor = q => QC[clampQ(q)];
  function drawArrow(c, ex, ey, a, q, tier, t) {
    q = clampQ(q); tier = clampT(tier);
    const pulse = reduced ? 1 : .78 + .22 * Math.sin((t || 0) * 4 + ex * .05 + ey * .03);
    const bx = ex - Math.cos(a) * 5, by = ey - Math.sin(a) * 5;
    c.save(); c.globalAlpha = pulse;
    c.fillStyle = 'rgba(10,9,8,.86)'; c.beginPath(); c.arc(bx, by, 10, 0, TAU); c.fill();
    c.strokeStyle = METAL[tier] === METAL[5] ? METAL_HI[5] : METAL[tier]; c.lineWidth = 1.3;
    c.beginPath(); c.arc(bx, by, 10, 0, TAU); c.stroke();
    c.translate(ex, ey); c.rotate(a);
    c.fillStyle = QC[q]; c.beginPath(); c.moveTo(11, 0); c.lineTo(5, -4.6); c.lineTo(5, 4.6); c.closePath(); c.fill();
    c.rotate(-a); c.translate(-ex, -ey);
    c.font = '700 8px "Alegreya SC", Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(ROM[tier], bx, by + .5);
    c.restore();
  }

  return { markHtml, drawWater, arrowColor, drawArrow, QC, NAMES, ROM, rom: t => ROM[clampT(t)] };
})();
