/* =========================================================
   DERİNSU — kuşbakışı haritalar (Astralis World.View'den uyarlandı)
   Maps.city()        : liman şehri. Ortada boş meydan, çevrede yapılar, güneyde liman ve Büyük İskele.
   Maps.sea(area)     : açık deniz. Ada yok: dipte kum, yosun, mercan ya da yarık; şamandıralar; sürü yuvaları (alan tohumundan, hep aynı).
   new Maps.View(el, map, hooks) : kamera, sürükleyerek gezinme, dokunarak yürüme ya da yelken, canlı efektler.
   hooks.tap({x, y, mark})  · hooks.haptic()
   ========================================================= */
window.Maps = (() => {
  'use strict';
  const TAU = Math.PI * 2;
  let reduced = false;

  function rng(seed) { let s = Math.abs(Math.floor(seed)) % 233280 || 7; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rgba = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const shade = (c, k) => c.map(v => clamp(Math.round(v * k), 0, 255));
  const mix = (a, b, t) => [0, 1, 2].map(i => Math.round(a[i] + (b[i] - a[i]) * t));

  /* ---------- şekiller (Astralis: bölge gölleri ve kayalıkları) ---------- */
  const mkBlob = (r, cx, cy, rx, ry, kind) => ({ cx, cy, rx, ry, kind, w: [r() * .14 + .06, r() * TAU, r() * .09 + .03, r() * TAU, r() * .05, r() * TAU] });
  const bR = (b, a) => 1 + b.w[0] * Math.sin(3 * a + b.w[1]) + b.w[2] * Math.sin(5 * a + b.w[3]) + b.w[4] * Math.sin(9 * a + b.w[5]);
  function bD(b, x, y) { const dx = (x - b.cx) / b.rx, dy = (y - b.cy) / b.ry; return Math.hypot(dx, dy) / bR(b, Math.atan2(dy, dx)); }
  function bEdge(b, a, k = 1) { const rr = bR(b, a) * k; return [b.cx + Math.cos(a) * b.rx * rr, b.cy + Math.sin(a) * b.ry * rr]; }
  function bPath(c, b, k = 1) { c.beginPath(); for (let i = 0; i <= 72; i++) { const [x, y] = bEdge(b, i / 72 * TAU, k); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.closePath(); }

  /* =========================================================
     LİMAN ŞEHRİ
     ========================================================= */
  const CW = 820, CH = 1100, PX = 410, PY = 540, QUAY = 860, PLAZA = 112;
  // yapılar: x, y = ön duvarın taban ortası · w yarı genişlik · up derinlik (yürünmez) · open: açtığı pencere
  const BLD = [
    { id: 'lonca', name: 'Balıkçılar Loncası', ic: 'book', open: 'dex', x: 410, y: 290, w: 92, up: 96, wall: [196, 178, 140], roof: [134, 70, 44], grand: true },
    { id: 'ambar', name: 'Ambar', ic: 'chest', open: 'inv', x: 170, y: 270, w: 60, up: 70, wall: [170, 150, 116], roof: [96, 70, 48] },
    { id: 'fener', name: 'Deniz Feneri', ic: 'anchor', open: 'rehber', x: 660, y: 262, w: 30, up: 40, tower: true },
    { id: 'usta', name: 'Olta Ustası', ic: 'rod', open: 'usta', x: 170, y: 500, w: 62, up: 70, wall: [182, 164, 128], roof: [70, 96, 104] },
    { id: 'pano', name: 'Görev Panosu', ic: 'scroll', open: 'quests', x: 650, y: 486, w: 46, up: 30, board: true },
    { id: 'hal', name: 'Balık Hali', ic: 'tag', open: 'hal', x: 176, y: 762, w: 72, up: 74, wall: [188, 170, 134], roof: [150, 60, 48], stall: true },
    { id: 'tutsu', name: 'Tütsühane', ic: 'flame', open: 'tutsu', x: 646, y: 762, w: 60, up: 72, wall: [150, 132, 108], roof: [74, 60, 50], chimney: true },
  ];
  const PIER = { id: 'iskele', name: 'Büyük İskele', ic: 'wave', open: 'sea', x: PX, y: QUAY + 34 };
  const standOf = b => b.id === 'iskele' ? { x: PX, y: QUAY + 40 } : { x: b.x + (b.x < PX ? 30 : b.x > PX ? -30 : 0), y: b.y + 26 };
  let cityL = null;
  function cityLayout() {
    if (cityL) return cityL;
    const r = rng(4127);
    const boxes = BLD.map(b => ({ x0: b.x - b.w, x1: b.x + b.w, y0: b.y - b.up - (b.tower ? 70 : 0), y1: b.y - 4 }));
    const roads = BLD.map(b => { const s = standOf(b); return [PX, PY, s.x, s.y]; });
    roads.push([PX, PY, PX, QUAY + 8]);
    roads.push([60, QUAY - 26, CW - 60, QUAY - 26]);                                   // rıhtım yolu
    const segD = (px, py, s) => { const [x1, y1, x2, y2] = s, dx = x2 - x1, dy = y2 - y1, l = dx * dx + dy * dy || 1, t = clamp(((px - x1) * dx + (py - y1) * dy) / l, 0, 1); return Math.hypot(px - x1 - dx * t, py - y1 - dy * t); };
    const roadD = (x, y) => Math.min(...roads.map(s => segD(x, y, s)));
    const inBox = (x, y, b, pad = 0) => x > b.x0 - pad && x < b.x1 + pad && y > b.y0 - pad && y < b.y1 + pad;
    // süs evleri: yolların, yapıların ve meydanın dışına
    const houses = [];
    for (let k = 0; k < 1200 && houses.length < 18; k++) {
      const w = 34 + r() * 26, h = 26 + r() * 16, x = 50 + r() * (CW - 100), y = 120 + r() * (QUAY - 190);
      const b = { x0: x - w / 2, x1: x + w / 2, y0: y - h, y1: y };
      if (Math.hypot(x - PX, y - h / 2 - PY) < PLAZA + 70) continue;
      if (boxes.some(o => inBox(x, y - h / 2, o, w / 2 + 30))) continue;
      if (houses.some(o => inBox(x, y - h / 2, o, w / 2 + 16))) continue;
      if ([[b.x0, b.y0], [b.x1, b.y0], [b.x0, b.y1], [b.x1, b.y1], [x, y - h / 2]].some(([cx, cy]) => roadD(cx, cy) < 26)) continue;
      houses.push(Object.assign(b, { roof: [[120, 66, 44], [96, 74, 54], [70, 92, 96], [134, 104, 60]][Math.floor(r() * 4)] }));
    }
    const lamps = [];
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU + .52; lamps.push({ x: PX + Math.cos(a) * (PLAZA + 16), y: PY + Math.sin(a) * (PLAZA + 16) * .9 }); }
    for (let x = 90; x < CW; x += 160) if (Math.abs(x - PX) > 40) lamps.push({ x, y: QUAY - 8 });
    const trees = [];
    for (let k = 0; k < 900 && trees.length < 90; k++) {
      const x = r() * CW, y = r() * (QUAY - 40), rr = 12 + r() * 16;
      const edge = y < 150 || x < 60 || x > CW - 60;
      if (!edge && r() > .2) continue;
      if (roadD(x, y) < rr + 20 || boxes.some(o => inBox(x, y, o, rr + 8)) || houses.some(o => inBox(x, y, o, rr + 4)) || Math.hypot(x - PX, y - PY) < PLAZA + 40) continue;
      trees.push({ x, y, r: rr, k: r() });
    }
    const boats = [{ x: 248, y: 970, a: .2 }, { x: 572, y: 990, a: -.25 }, { x: 120, y: 1010, a: .5 }, { x: 720, y: 960, a: -.4 }];
    const sparkles = []; for (let i = 0; i < 70; i++) sparkles.push({ x: r() * CW, y: QUAY + 30 + r() * (CH - QUAY - 30), ph: r() * TAU, sp: .6 + r() * 1.4 });
    const walkable = (x, y) => {
      if (x < 24 || x > CW - 24 || y < 60) return false;
      if (y > QUAY - 4) return Math.abs(x - PX) < 22 && y < CH - 50;       // iskele
      if (boxes.some(o => inBox(x, y, o, 2))) return false;
      if (houses.some(o => inBox(x, y, o, 1))) return false;
      return true;
    };
    return (cityL = { W: CW, H: CH, boxes, roads, houses, lamps, trees, boats, sparkles, walkable, start: { x: PX, y: PY + 4 },
      marks: [...BLD, PIER].map(b => ({ ...b, stand: standOf(b), lx: b.x, ly: b.id === 'iskele' ? QUAY + 74 : b.tower ? b.y - 60 : b.board ? b.y - 4 : b.y - b.up * .3 })),
      smoke: BLD.filter(b => b.chimney).map(b => ({ x: b.x + b.w * .5, y: b.y - b.up - 26 })), fener: BLD.find(b => b.tower) });
  }

  function paintCity(s) {
    const L = cityLayout(), cv = document.createElement('canvas');
    cv.width = Math.round(CW * s); cv.height = Math.round(CH * s);
    const c = cv.getContext('2d'); c.scale(s, s);
    const r = rng(733);
    // çimen ve toprak
    c.fillStyle = '#3d4630'; c.fillRect(0, 0, CW, CH);
    for (let i = 0; i < 2600; i++) { const x = r() * CW, y = r() * QUAY, k = r(); c.fillStyle = k < .5 ? 'rgba(90,104,60,.35)' : 'rgba(30,36,22,.35)'; c.fillRect(x, y, 2 + r() * 3, 1.5); }
    for (let i = 0; i < 14; i++) { const x = r() * CW, y = 120 + r() * (QUAY - 200), g = c.createRadialGradient(x, y, 0, x, y, 90); g.addColorStop(0, 'rgba(98,84,58,.25)'); g.addColorStop(1, 'rgba(98,84,58,0)'); c.fillStyle = g; c.fillRect(x - 90, y - 90, 180, 180); }
    // liman suyu
    let g = c.createLinearGradient(0, QUAY, 0, CH); g.addColorStop(0, '#2e5458'); g.addColorStop(1, '#14262c');
    c.fillStyle = g; c.fillRect(0, QUAY, CW, CH - QUAY);
    c.strokeStyle = 'rgba(220,236,236,.07)'; c.lineWidth = 1;
    for (let y = QUAY + 24; y < CH; y += 16) { c.beginPath(); for (let x = (y * 7) % 40; x < CW; x += 60) { c.moveTo(x, y); c.quadraticCurveTo(x + 12, y - 3, x + 24, y); } c.stroke(); }
    // rıhtım taşı
    c.fillStyle = '#6e6658'; c.fillRect(0, QUAY - 14, CW, 22);
    c.fillStyle = '#857c6b'; c.fillRect(0, QUAY - 14, CW, 4);
    c.strokeStyle = 'rgba(30,26,20,.45)';
    for (let x = 0; x < CW; x += 26) { c.beginPath(); c.moveTo(x, QUAY - 10); c.lineTo(x, QUAY + 8); c.stroke(); }
    c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(0, QUAY + 8, CW, 6);
    // iskeleler
    const pier = (x, w, y1) => {
      c.fillStyle = 'rgba(0,0,0,.28)'; c.fillRect(x - w + 5, QUAY + 6, w * 2, y1 - QUAY);
      c.fillStyle = '#6a5034'; c.fillRect(x - w, QUAY, w * 2, y1 - QUAY);
      c.strokeStyle = 'rgba(30,20,10,.55)'; for (let y = QUAY + 8; y < y1; y += 9) { c.beginPath(); c.moveTo(x - w, y); c.lineTo(x + w, y); c.stroke(); }
      c.fillStyle = '#3a2a1a'; for (let y = QUAY + 30; y < y1; y += 46) { c.fillRect(x - w - 3, y, 5, 6); c.fillRect(x + w - 2, y, 5, 6); }
    };
    pier(PX, 22, CH - 46); pier(210, 12, 960); pier(610, 12, 980);
    // kayıklar
    for (const b of L.boats) {
      c.save(); c.translate(b.x, b.y); c.rotate(b.a);
      c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(4, 5, 14, 34, 0, 0, TAU); c.fill();
      c.fillStyle = '#5a3c22'; c.beginPath(); c.moveTo(0, -36); c.quadraticCurveTo(15, -10, 11, 30); c.lineTo(-11, 30); c.quadraticCurveTo(-15, -10, 0, -36); c.fill();
      c.fillStyle = '#7a5634'; c.beginPath(); c.moveTo(0, -30); c.quadraticCurveTo(10, -8, 7, 25); c.lineTo(-7, 25); c.quadraticCurveTo(-10, -8, 0, -30); c.fill();
      c.fillStyle = '#4a3220'; c.fillRect(-7, -4, 14, 3); c.fillRect(-7, 10, 14, 3);
      c.restore();
    }
    // yollar
    const road = (w, col) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; for (const [x1, y1, x2, y2] of L.roads) { c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); } };
    road(44, '#4c4436'); road(36, '#8a7c64');
    c.fillStyle = 'rgba(60,52,40,.35)';
    for (let i = 0; i < 900; i++) { const [x1, y1, x2, y2] = L.roads[Math.floor(r() * L.roads.length)], t = r(), x = x1 + (x2 - x1) * t + (r() - .5) * 28, y = y1 + (y2 - y1) * t + (r() - .5) * 28; c.fillRect(x, y, 3, 2); }
    // meydan: taş halkalar; orta boş (balıkçıların durduğu yer)
    g = c.createRadialGradient(PX, PY, 10, PX, PY, PLAZA + 14);
    g.addColorStop(0, '#9c8e74'); g.addColorStop(1, '#7c705a');
    c.fillStyle = '#4c4436'; c.beginPath(); c.ellipse(PX, PY, PLAZA + 18, (PLAZA + 18) * .9, 0, 0, TAU); c.fill();
    c.fillStyle = g; c.beginPath(); c.ellipse(PX, PY, PLAZA + 12, (PLAZA + 12) * .9, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(50,44,34,.4)'; c.lineWidth = 1;
    for (let k = 1; k <= 4; k++) { c.beginPath(); c.ellipse(PX, PY, PLAZA * k / 4.4, PLAZA * k / 4.4 * .9, 0, 0, TAU); c.stroke(); }
    for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; c.beginPath(); c.moveTo(PX + Math.cos(a) * PLAZA * .23, PY + Math.sin(a) * PLAZA * .21); c.lineTo(PX + Math.cos(a) * PLAZA, PY + Math.sin(a) * PLAZA * .9); c.stroke(); }
    // ortada pusula gülü
    c.strokeStyle = 'rgba(231,194,106,.35)'; c.lineWidth = 2;
    c.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU - Math.PI / 2, rr = i % 2 ? 10 : 22; c.lineTo(PX + Math.cos(a) * rr, PY + Math.sin(a) * rr * .9); } c.closePath(); c.stroke();
    // ağaçlar
    for (const t of L.trees) {
      c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(t.x + 6, t.y + 6, t.r, t.r * .8, 0, 0, TAU); c.fill();
      c.fillStyle = mix([34, 58, 34], [58, 86, 46], t.k).map(String).reduce((a, v, i) => a + (i ? ',' : '') + v, 'rgb(') + ')';
      c.beginPath(); c.arc(t.x, t.y, t.r, 0, TAU); c.fill();
      c.fillStyle = 'rgba(140,170,90,.18)'; c.beginPath(); c.arc(t.x - t.r * .3, t.y - t.r * .35, t.r * .55, 0, TAU); c.fill();
    }
    // süs evleri
    for (const h of L.houses) house(c, h.x0, h.y0, h.x1 - h.x0, h.y1 - h.y0, [168, 150, 118], h.roof, false);
    // yapılar
    for (const b of BLD) building(c, b);
    // rıhtımda fıçı ve sandık
    for (const [x, y] of [[300, QUAY - 22], [318, QUAY - 18], [520, QUAY - 20], [96, QUAY - 22], [720, QUAY - 20]]) {
      c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(x + 2, y + 3, 7, 4, 0, 0, TAU); c.fill();
      c.fillStyle = '#6a4a2a'; c.beginPath(); c.arc(x, y, 6.5, 0, TAU); c.fill();
      c.strokeStyle = '#3a2814'; c.lineWidth = 1.2; c.beginPath(); c.arc(x, y, 4, 0, TAU); c.stroke();
    }
    // fener direkleri
    for (const l of L.lamps) { c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(l.x + 2, l.y + 2, 4, 2.4, 0, 0, TAU); c.fill(); c.fillStyle = '#2a2218'; c.fillRect(l.x - 1.5, l.y - 22, 3, 22); c.fillStyle = '#e8c070'; c.fillRect(l.x - 3, l.y - 27, 6, 6); }
    return cv;
  }
  function house(c, x, y, w, h, wall, roof, lit) {
    c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(x + 6, y + 6, w, h);
    const fh = Math.min(16, h * .45);
    c.fillStyle = rgba(shade(wall, .8)); c.fillRect(x, y + h - fh, w, fh);
    c.fillStyle = rgba(roof); c.beginPath(); c.moveTo(x - 3, y + h - fh + 1); c.lineTo(x + 4, y); c.lineTo(x + w - 4, y); c.lineTo(x + w + 3, y + h - fh + 1); c.closePath(); c.fill();
    c.fillStyle = rgba(shade(roof, 1.25)); c.fillRect(x + 4, y, w - 8, 3);
    c.strokeStyle = rgba(shade(roof, .7)); c.lineWidth = 1; for (let k = x + 8; k < x + w - 4; k += 7) { c.beginPath(); c.moveTo(k, y + 3); c.lineTo(k - 2, y + h - fh); c.stroke(); }
    c.fillStyle = lit ? '#f0c878' : 'rgba(40,30,20,.7)'; c.fillRect(x + w * .3 - 3, y + h - fh + 4, 6, 6); c.fillRect(x + w * .7 - 3, y + h - fh + 4, 6, 6);
  }
  function building(c, b) {
    const x0 = b.x - b.w, w = b.w * 2;
    if (b.tower) {
      // deniz feneri: kırmızı-beyaz kule, tepede fener
      c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(b.x + 10, b.y, 34, 12, 0, 0, TAU); c.fill();
      c.fillStyle = '#5a5248'; c.beginPath(); c.ellipse(b.x, b.y - 4, 30, 11, 0, 0, TAU); c.fill();
      for (let i = 0; i < 6; i++) { c.fillStyle = i % 2 ? '#e8e0d0' : '#b0443a'; c.fillRect(b.x - 16 + i * .8, b.y - 24 - i * 18, 32 - i * 1.6, 18); }
      c.fillStyle = '#2a2420'; c.fillRect(b.x - 14, b.y - 136, 28, 6);
      c.fillStyle = '#f7d888'; c.fillRect(b.x - 10, b.y - 150, 20, 14);
      c.fillStyle = '#3a2e24'; c.beginPath(); c.moveTo(b.x - 14, b.y - 150); c.lineTo(b.x, b.y - 164); c.lineTo(b.x + 14, b.y - 150); c.fill();
      return;
    }
    if (b.board) {
      c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(x0 + 6, b.y - 4, w, 8);
      c.fillStyle = '#3a2a1a'; c.fillRect(x0 + 6, b.y - 40, 5, 40); c.fillRect(x0 + w - 11, b.y - 40, 5, 40);
      c.fillStyle = '#7a5634'; c.fillRect(x0, b.y - 46, w, 30);
      c.fillStyle = '#5a3c22'; c.fillRect(x0, b.y - 48, w, 4);
      for (let i = 0; i < 6; i++) { c.fillStyle = ['#efe6cf', '#e8d8b0', '#f4ead4'][i % 3]; c.save(); c.translate(x0 + 12 + i * 13, b.y - 36 + (i % 2) * 4); c.rotate((i % 3 - 1) * .12); c.fillRect(-5, -6, 10, 12); c.fillStyle = '#b0443a'; c.fillRect(-1, -6, 2, 2); c.restore(); }
      return;
    }
    const fh = b.grand ? 46 : 36, top = b.y - b.up - fh * .2;
    c.fillStyle = 'rgba(0,0,0,.32)'; c.fillRect(x0 + 8, top + 10, w, b.y - top);
    // ön duvar
    c.fillStyle = rgba(b.wall); c.fillRect(x0, b.y - fh, w, fh);
    c.fillStyle = rgba(shade(b.wall, .82)); c.fillRect(x0, b.y - 6, w, 6);
    // çatı
    c.fillStyle = rgba(b.roof);
    c.beginPath(); c.moveTo(x0 - 6, b.y - fh + 2); c.lineTo(x0 + 8, top); c.lineTo(x0 + w - 8, top); c.lineTo(x0 + w + 6, b.y - fh + 2); c.closePath(); c.fill();
    c.fillStyle = rgba(shade(b.roof, 1.3)); c.fillRect(x0 + 8, top, w - 16, 4);
    c.strokeStyle = rgba(shade(b.roof, .7)); c.lineWidth = 1.2;
    for (let k = x0 + 14; k < x0 + w - 8; k += 9) { c.beginPath(); c.moveTo(k, top + 4); c.lineTo(k + (k - b.x) * .06, b.y - fh); c.stroke(); }
    // kapı ve pencereler
    c.fillStyle = '#3a2614'; c.fillRect(b.x - 9, b.y - 22, 18, 22);
    c.fillStyle = '#5a3c22'; c.fillRect(b.x - 9, b.y - 24, 18, 3);
    c.fillStyle = '#f0c878';
    for (const k of [-.62, -.32, .32, .62]) { if (Math.abs(k * b.w) < 16) continue; c.fillRect(b.x + k * b.w - 4, b.y - fh + 10, 8, 9); }
    if (b.grand) {
      // lonca: altın saçak, sütunlar ve balık arması
      c.fillStyle = '#c9a24e'; c.fillRect(x0 - 6, b.y - fh, w + 12, 4);
      c.fillStyle = '#d8cdb4'; for (let k = -3; k <= 3; k++) if (k) c.fillRect(b.x + k * 24 - 3, b.y - fh + 4, 6, fh - 10);
      c.fillStyle = '#e7c26a'; c.beginPath(); c.ellipse(b.x, top + (b.y - fh - top) / 2 + 4, 16, 7, 0, 0, TAU); c.fill();
      c.fillStyle = '#7a5a22'; c.beginPath(); c.moveTo(b.x + 14, top + (b.y - fh - top) / 2 + 4); c.lineTo(b.x + 22, top + (b.y - fh - top) / 2 - 2); c.lineTo(b.x + 22, top + (b.y - fh - top) / 2 + 10); c.fill();
    }
    if (b.stall) {
      // hal: çizgili tente ve balık kasaları
      for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#efe6cf' : '#b0443a'; c.fillRect(x0 + i * w / 8, b.y - fh - 6, w / 8, 10); }
      for (const k of [-.7, -.45, .45, .7]) { const cx = b.x + k * b.w; c.fillStyle = '#6a4a2a'; c.fillRect(cx - 9, b.y + 4, 18, 10); c.fillStyle = '#a8c0c4'; for (let j = 0; j < 3; j++) { c.beginPath(); c.ellipse(cx - 5 + j * 5, b.y + 8, 3, 1.6, .3, 0, TAU); c.fill(); } }
    }
    if (b.chimney) { c.fillStyle = '#4a3c30'; c.fillRect(b.x + b.w * .5 - 7, top - 18, 14, 26); c.fillStyle = '#2a2018'; c.fillRect(b.x + b.w * .5 - 8, top - 20, 16, 4); }
  }

  /* =========================================================
     AÇIK DENİZ
     ========================================================= */
  const SW = 2000, SH = 2800;
  const seaCache = {};
  function seaLayout(area) {
    const key = area.id;
    if (seaCache[key]) return seaCache[key];
    const sp = SPOTS.find(s => s.id === area.type), P = sp.sea, r = rng(area.seed * 7 + 11);
    const start = { x: SW / 2, y: SH - 200 };
    // dipteki yapılar: kum sırtı, yosun ormanı, mercan, kaya ya da yarık (su altında, üstünden geçilir)
    const patches = [];
    for (let i = 0; i < 18; i++) patches.push(mkBlob(r, 80 + r() * (SW - 160), 80 + r() * (SH - 200), 50 + r() * 110, 36 + r() * 80, 'patch'));
    // derinlik eğrileri: büyük, yumuşak çanaklar (haritada ince çizgilerle)
    const deeps = [];
    for (let i = 0; i < 7; i++) deeps.push(mkBlob(r, 200 + r() * (SW - 400), 200 + r() * (SH - 700), 220 + r() * 260, 180 + r() * 220, 'deep'));
    const sailable = (x, y) => x > 20 && y > 20 && x < SW - 20 && y < SH - 20;
    const slots = [];
    { const a = -Math.PI / 2 + (r() - .5) * 1.6, d = 230 + r() * 80; slots.push({ x: Math.round(start.x + Math.cos(a) * d), y: Math.round(start.y + Math.sin(a) * d) }); }   // ilk yuva çıkışın görüş alanında
    for (let tries = 0; slots.length < SCHOOL_SLOTS && tries < 3000; tries++) {
      const x = 120 + r() * (SW - 240), y = 120 + r() * (SH - 420);
      if (Math.hypot(x - start.x, y - start.y) < 240) continue;
      if (slots.some(s => Math.hypot(s.x - x, s.y - y) < (tries < 2000 ? 420 : 280))) continue;
      slots.push({ x: Math.round(x), y: Math.round(y) });
    }
    // batık gemiler (Koy'dan itibaren) ve dipteki kayalar
    const wrecks = [];
    for (let k = 0; wrecks.length < (sp.t >= 2 ? 2 : 1) && k < 300; k++) {
      const x = 200 + r() * (SW - 400), y = 200 + r() * (SH - 600);
      if (slots.some(s => Math.hypot(s.x - x, s.y - y) < 200) || wrecks.some(w => Math.hypot(w.x - x, w.y - y) < 700) || Math.hypot(x - start.x, y - start.y) < 300) continue;
      wrecks.push({ x, y, a: r() * TAU, s: .9 + r() * .5 });
    }
    const rocks = [];
    for (let k = 0; rocks.length < 12 && k < 800; k++) {
      const x = 60 + r() * (SW - 120), y = 60 + r() * (SH - 160);
      if (slots.some(s => Math.hypot(s.x - x, s.y - y) < 110)) continue;
      rocks.push({ x, y, r: 10 + r() * 26, n: 2 + Math.floor(r() * 4), a: r() * TAU });
    }
    // şamandıralar (yanıp söner) ve yüzen yosun, kütük
    const buoys = [{ x: start.x - 46, y: start.y - 40, c: 0 }, { x: start.x + 46, y: start.y - 40, c: 1 }];
    for (let k = 0; buoys.length < 10 && k < 800; k++) {
      const x = 70 + r() * (SW - 140), y = 70 + r() * (SH - 300);
      if (slots.some(s => Math.hypot(s.x - x, s.y - y) < 130) || buoys.some(b => Math.hypot(b.x - x, b.y - y) < 380)) continue;
      buoys.push({ x, y, c: buoys.length % 3 === 2 ? 2 : buoys.length % 2 });
    }
    const drift = [];
    for (let k = 0; drift.length < 12 && k < 1000; k++) {
      const x = 50 + r() * (SW - 100), y = 50 + r() * (SH - 220);
      if (slots.some(s => Math.hypot(s.x - x, s.y - y) < 110)) continue;
      drift.push({ x, y, a: r() * TAU, k: r() < .45 ? 'log' : 'mat', s: .7 + r() * .7 });
    }
    const sparkles = []; for (let i = 0; i < 420; i++) sparkles.push({ x: r() * SW, y: r() * SH, ph: r() * TAU, sp: .5 + r() * 1.3 });
    return (seaCache[key] = { W: SW, H: SH, sp, P, isl: [], patches, deeps, wrecks, rocks, slots, start, sparkles, buoys, drift, walkable: sailable });
  }
  function paintSea(L, s) {
    const cv = document.createElement('canvas');
    cv.width = Math.round(SW * s); cv.height = Math.round(SH * s);
    let c = cv.getContext('2d'); c.scale(s, s);
    const P = L.P, r = rng(L.slots.length * 97 + L.slots[0].x * 13 + L.P.deep[0]);
    // zemin: sade, yumuşak geçiş. Üstte derin su, altta limana yakın açık su
    let g = c.createLinearGradient(0, 0, 0, SH);
    g.addColorStop(0, rgba(shade(P.deep, .72))); g.addColorStop(.45, rgba(P.deep)); g.addColorStop(1, rgba(mix(P.deep, P.shal, .5)));
    c.fillStyle = g; c.fillRect(0, 0, SW, SH);
    // birkaç iri, yumuşak su havuzu (açık ve koyu); kalabalık benek yok
    for (let i = 0; i < 14; i++) {
      const x = r() * SW, y = r() * SH, rad = 320 + r() * 380, g2 = c.createRadialGradient(x, y, 0, x, y, rad);
      g2.addColorStop(0, i % 2 ? `rgba(0,0,0,${P.abyss ? .26 : .16})` : rgba(P.shal, P.abyss ? .1 : .16)); g2.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g2; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    // akıntı şeritleri: geniş, hafif açık, kavisli bantlar
    c.lineCap = 'round';
    for (let i = 0; i < 7; i++) {
      const y0 = 180 + i * 390 + r() * 120, a1 = (r() - .5) * 260, a2 = (r() - .5) * 260;
      c.strokeStyle = rgba(P.shal, P.abyss ? .05 : .075); c.lineWidth = 50 + r() * 70;
      c.beginPath(); c.moveTo(-120, y0); c.bezierCurveTo(SW * .3, y0 + a1, SW * .7, y0 + a2, SW + 120, y0 + (r() - .5) * 160); c.stroke();
    }
    // deniz haritası ızgarası: çok soluk enlem ve boylam çizgileri
    c.strokeStyle = P.abyss ? 'rgba(185,166,230,.045)' : 'rgba(255,255,255,.04)'; c.lineWidth = 1; c.beginPath();
    for (let x = 250; x < SW; x += 250) { c.moveTo(x, 0); c.lineTo(x, SH); } for (let y = 250; y < SH; y += 250) { c.moveTo(0, y); c.lineTo(SW, y); } c.stroke();
    // derin çanaklar: koyulaşan iç, çevresinde ince derinlik eğrileri
    for (const b of L.deeps) {
      g = c.createRadialGradient(b.cx, b.cy, 0, b.cx, b.cy, Math.max(b.rx, b.ry));
      g.addColorStop(0, `rgba(0,0,0,${P.abyss ? .4 : .24})`); g.addColorStop(.7, 'rgba(0,0,0,.07)'); g.addColorStop(1, 'rgba(0,0,0,0)');
      c.fillStyle = g; bPath(c, b, 1); c.fill();
      c.lineWidth = 1.2;
      for (const k of [.45, .75, 1.05]) { c.strokeStyle = P.abyss ? `rgba(185,166,230,${(.05 + k * .04).toFixed(3)})` : rgba(shade(P.shal, 1.4), .06 + (1.05 - k) * .07); bPath(c, b, k); c.stroke(); }
    }
    // dip yapıları: yarım çözünürlüklü ayrı tuvale çizilir, büyütülünce yumuşar (filtre yok: büyük tuvalde ağır ve kırılgan)
    const main = c, bot = document.createElement('canvas');
    bot.width = Math.round(SW * s * .5); bot.height = Math.round(SH * s * .5);
    c = bot.getContext('2d'); c.scale(s * .5, s * .5);
    // dip kayaları
    for (const k of L.rocks) for (let i = 0; i < k.n; i++) {
      const x = k.x + Math.cos(k.a + i * 2.1) * k.r * .7, y = k.y + Math.sin(k.a + i * 2.1) * k.r * .5, rr = k.r * (.45 + r() * .5);
      c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(x + 3, y + 4, rr, rr * .7, k.a, 0, TAU); c.fill();
      c.fillStyle = rgba(shade(P.rock, .55 + r() * .25), P.abyss ? .5 : .42); c.beginPath(); c.ellipse(x, y, rr, rr * .72, k.a + i, 0, TAU); c.fill();
      c.fillStyle = rgba(shade(P.rock, 1.1), .16); c.beginPath(); c.ellipse(x - rr * .25, y - rr * .25, rr * .45, rr * .3, k.a, 0, TAU); c.fill();
    }
    // batıklar: gövde, kaburgalar, devrik direk; üstü yosun tutmuş
    for (const w of L.wrecks) {
      c.save(); c.translate(w.x, w.y); c.rotate(w.a); c.scale(w.s, w.s);
      c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(6, 8, 34, 92, 0, 0, TAU); c.fill();
      c.fillStyle = P.abyss ? 'rgba(70,60,80,.6)' : 'rgba(66,48,32,.62)';
      c.beginPath(); c.moveTo(0, -90); c.quadraticCurveTo(34, -40, 28, 70); c.lineTo(-28, 70); c.quadraticCurveTo(-34, -40, 0, -90); c.fill();
      c.fillStyle = rgba(P.deep, .55); c.beginPath(); c.moveTo(0, -74); c.quadraticCurveTo(24, -34, 20, 60); c.lineTo(-20, 60); c.quadraticCurveTo(-24, -34, 0, -74); c.fill();
      c.strokeStyle = P.abyss ? 'rgba(110,96,130,.6)' : 'rgba(110,82,54,.7)'; c.lineWidth = 4;
      for (let y = -50; y < 64; y += 15) { const hw = 22 * Math.min(1, (y + 90) / 70); c.beginPath(); c.moveTo(-hw, y); c.quadraticCurveTo(0, y - 6, hw, y); c.stroke(); }
      c.lineWidth = 5; c.beginPath(); c.moveTo(-6, -10); c.lineTo(-70, 40); c.stroke(); c.lineWidth = 3; c.beginPath(); c.moveTo(-38, 14); c.lineTo(-52, -4); c.stroke();
      c.fillStyle = P.abyss ? 'rgba(120,220,210,.35)' : 'rgba(70,110,60,.4)';
      for (let i = 0; i < 26; i++) { c.beginPath(); c.arc((r() - .5) * 50, -70 + r() * 140, 2 + r() * 4, 0, TAU); c.fill(); }
      c.restore();
    }
    for (const b of L.patches) {
      if (P.abyss) {
        g = c.createRadialGradient(b.cx, b.cy, 0, b.cx, b.cy, Math.max(b.rx, b.ry)); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
        c.fillStyle = g; bPath(c, b, 1.1); c.fill();
        for (let i = 0; i < 18; i++) { const [x, y] = bEdge(b, r() * TAU, Math.sqrt(r()) * .9); c.fillStyle = ['rgba(185,166,230,.55)', 'rgba(120,220,210,.45)'][i % 2]; c.beginPath(); c.arc(x, y, 1 + r() * 1.6, 0, TAU); c.fill(); }
        continue;
      }
      if (P.foam) {     // kayalık dip
        c.fillStyle = rgba(shade(P.rock, .55), .5); bPath(c, b, .9); c.fill();
        for (let i = 0; i < 10; i++) { const [x, y] = bEdge(b, r() * TAU, Math.sqrt(r()) * .8); c.fillStyle = rgba(shade(P.rock, .5 + r() * .4), .6); c.beginPath(); c.ellipse(x, y, 8 + r() * 16, 6 + r() * 10, r(), 0, TAU); c.fill(); }
        continue;
      }
      g = c.createRadialGradient(b.cx, b.cy, 0, b.cx, b.cy, Math.max(b.rx, b.ry) * 1.1);
      const pc = P.coral ? mix(P.shal, P.sand, .4) : P.kelp ? shade(P.shal, .8) : P.sand, pa = P.kelp ? .34 : .42;
      g.addColorStop(0, rgba(pc, pa)); g.addColorStop(.75, rgba(pc, pa * .8)); g.addColorStop(1, rgba(pc, 0));
      c.fillStyle = g; bPath(c, b, 1.08); c.fill();
      if (!P.kelp && !P.coral) {      // kum sırtı: dalga izleri, deniz yıldızı, çayır
        c.strokeStyle = rgba(shade(P.sand, 1.15), .35); c.lineWidth = 1.2;
        for (let k = -.7; k < .8; k += .22) { c.beginPath(); for (let i = 0; i <= 20; i++) { const x = b.cx - b.rx * .8 + i * b.rx * .08, y = b.cy + k * b.ry + Math.sin(i * .9) * 2.5; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
        for (let i = 0; i < 4; i++) { const [x, y] = bEdge(b, r() * TAU, Math.sqrt(r()) * .7); c.fillStyle = ['#e0805a', '#e8b04f'][i % 2]; c.beginPath(); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU, rr = k % 2 ? 1.6 : 4.2; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } c.fill(); }
        c.strokeStyle = 'rgba(70,120,70,.55)'; c.lineWidth = 1.4;
        for (let i = 0; i < 26; i++) { const [x, y] = bEdge(b, r() * TAU, .85 + r() * .25); c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 3, y - 5, x + (r() - .5) * 6, y - 10); c.stroke(); }
      }
      if (P.kelp) {                   // yosun ormanı
        for (let i = 0; i < 46; i++) {
          const [x, y] = bEdge(b, r() * TAU, Math.sqrt(r()) * .9), h = 14 + r() * 22;
          c.strokeStyle = rgba(mix([30, 64, 34], [70, 110, 52], r()), .75); c.lineWidth = 2 + r() * 1.5;
          c.beginPath(); c.moveTo(x, y); c.bezierCurveTo(x + 6, y - h * .3, x - 6, y - h * .6, x + (r() - .5) * 8, y - h); c.stroke();
        }
      }
      if (P.coral) {                  // mercan resifi: renkli kümeler, beyin mercanı, şakayık
        for (let i = 0; i < 40; i++) {
          const [x, y] = bEdge(b, r() * TAU, Math.sqrt(r()) * .92), col = ['224,128,106', '232,180,90', '200,106,176', '120,200,190', '240,150,80'][i % 5], rr = 3 + r() * 7;
          c.fillStyle = `rgba(${col},.7)`; c.beginPath(); c.arc(x, y, rr, 0, TAU); c.fill();
          if (i % 4 === 0) { c.strokeStyle = `rgba(${col},.8)`; c.lineWidth = 1.2; for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + (k - 2) * .4; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * rr * 2, y + Math.sin(a) * rr * 2); c.stroke(); } }
          if (i % 7 === 0) { c.strokeStyle = 'rgba(250,230,200,.35)'; c.lineWidth = .8; c.beginPath(); c.arc(x, y, rr * .6, 0, Math.PI); c.stroke(); }
        }
      }
    }
    c = main; c.imageSmoothingQuality = 'high'; c.drawImage(bot, 0, 0, SW, SH); bot.width = bot.height = 0;
    c.fillStyle = rgba(P.deep, .28); c.fillRect(0, 0, SW, SH);     // su örtüsü
    // dalga işaretleri: düzenli, şaşırtmalı sıralar hâlinde küçük yaylar (sade doku)
    c.lineCap = 'round'; c.lineWidth = 1.5;
    for (const [al, off] of [[P.foam ? .2 : .13, 0], [P.foam ? .12 : .07, 1]]) {
      c.strokeStyle = P.abyss ? `rgba(185,166,230,${al})` : `rgba(236,246,246,${al})`; c.beginPath();
      for (let row = 0, y = 50; y < SH - 20; y += 62, row++) for (let x = (row % 2 ? 44 : 0) + off * 21; x < SW; x += 88) {
        if ((row + Math.round(x / 88)) % 2 !== off) continue;
        const xx = x + (r() - .5) * 26, yy = y + (r() - .5) * 20, w = 13 + r() * 9;
        c.moveTo(xx, yy); c.quadraticCurveTo(xx + w / 2, yy - 4, xx + w, yy);
      }
      c.stroke();
    }
    // fırtınalı suda köpük şeritleri
    if (P.foam) for (let i = 0; i < 110; i++) { const x = r() * SW, y = r() * SH, l = 24 + r() * 50; c.strokeStyle = `rgba(230,236,240,${(.07 + r() * .1).toFixed(2)})`; c.lineWidth = 1 + r() * 2; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + l / 2, y - 4, x + l, y + 1); c.stroke(); }
    // pusula gülü: çıkışın solunda, soluk
    { const cx0 = 300, cy0 = SH - 300, R0 = 120, col = P.abyss ? '185,166,230' : '246,236,210';
      c.save(); c.translate(cx0, cy0); c.strokeStyle = `rgba(${col},.13)`; c.fillStyle = `rgba(${col},.09)`; c.lineWidth = 1.4;
      for (const k of [1, .78]) { c.beginPath(); c.arc(0, 0, R0 * k, 0, TAU); c.stroke(); }
      for (let i = 0; i < 32; i++) { const a = i / 32 * TAU, k = i % 4 ? .93 : .86; c.beginPath(); c.moveTo(Math.cos(a) * R0 * k, Math.sin(a) * R0 * k); c.lineTo(Math.cos(a) * R0, Math.sin(a) * R0); c.stroke(); }
      for (let i = 0; i < 8; i++) { const a = i / 8 * TAU - Math.PI / 2, len = i % 2 ? R0 * .46 : R0 * .74, w = i % 2 ? .12 : .16;
        c.beginPath(); c.moveTo(Math.cos(a) * len, Math.sin(a) * len); c.lineTo(Math.cos(a + w * 2.4) * R0 * .16, Math.sin(a + w * 2.4) * R0 * .16); c.lineTo(0, 0); c.lineTo(Math.cos(a - w * 2.4) * R0 * .16, Math.sin(a - w * 2.4) * R0 * .16); c.closePath(); c.fill(); c.stroke(); }
      c.fillStyle = `rgba(${col},.22)`; c.font = '700 26px Georgia, serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('K', 0, -R0 - 22);
      c.restore(); }
    // kenarlara doğru kararma: haritanın sınırı yumuşakça belli olur
    for (const [x0, y0, x1, y1, rx, ry, rw, rh] of [[0, 0, 0, 170, 0, 0, SW, 170], [0, SH, 0, SH - 170, 0, SH - 170, SW, 170], [0, 0, 170, 0, 0, 0, 170, SH], [SW, 0, SW - 170, 0, SW - 170, 0, 170, SH]]) {
      g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, 'rgba(4,8,12,.42)'); g.addColorStop(1, 'rgba(4,8,12,0)'); c.fillStyle = g; c.fillRect(rx, ry, rw, rh);
    }
    // yüzen kütük ve yosun keçeleri
    for (const d of L.drift) {
      c.save(); c.translate(d.x, d.y); c.rotate(d.a); c.scale(d.s, d.s);
      c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(3, 4, d.k === 'log' ? 22 : 18, d.k === 'log' ? 6 : 12, 0, 0, TAU); c.fill();
      if (d.k === 'log') { c.fillStyle = '#5a3c22'; c.beginPath(); c.ellipse(0, 0, 20, 4.5, 0, 0, TAU); c.fill(); c.fillStyle = '#7a5634'; c.fillRect(-18, -2, 34, 1.5); c.fillStyle = '#a87a50'; c.beginPath(); c.ellipse(19, 0, 2, 4, 0, 0, TAU); c.fill(); }
      else { for (let i = 0; i < 12; i++) { c.fillStyle = rgba(mix([40, 70, 36], [90, 110, 50], r()), .8); c.beginPath(); c.ellipse((r() - .5) * 26, (r() - .5) * 14, 4 + r() * 5, 2 + r() * 3, r() * TAU, 0, TAU); c.fill(); } }
      c.restore();
    }
    return cv;
  }
  // canlı su katmanları: dalga sırtları ve dipteki ışık ağı (döşeme desenleri)
  function waveTile(P, seed) {
    const T = 240, cv = document.createElement('canvas'); cv.width = cv.height = T;
    const c = cv.getContext('2d'), r = rng(seed); c.lineCap = 'round';
    for (let i = 0; i < (P.foam ? 22 : 12); i++) {
      const x = r() * T, y = r() * T, len = 14 + r() * 18, a = (P.foam ? .16 : .12) + r() * .1;
      c.strokeStyle = `rgba(232,246,248,${a.toFixed(3)})`; c.lineWidth = P.foam ? 1.7 : 1.15;
      for (const [dx, dy] of [[0, 0], [-T, 0], [T, 0], [0, -T], [0, T]]) { c.beginPath(); c.moveTo(x + dx, y + dy); c.quadraticCurveTo(x + dx + len / 2, y + dy - 3.5, x + dx + len, y + dy); c.stroke(); }
    }
    return cv;
  }
  function causticTile(seed) {
    const T = 220, cv = document.createElement('canvas'); cv.width = cv.height = T;
    const c = cv.getContext('2d'), r = rng(seed), pts = Array.from({ length: 16 }, () => [r() * T, r() * T]);
    c.strokeStyle = 'rgba(255,250,220,1)'; c.lineCap = 'round'; if (filterOk) c.filter = 'blur(2.2px)';
    for (const [x, y] of pts) {
      const near = [];
      for (const [px, py] of pts) for (const [dx, dy] of [[0, 0], [-T, 0], [T, 0], [0, -T], [0, T], [-T, -T], [T, T], [-T, T], [T, -T]]) { const d = Math.hypot(px + dx - x, py + dy - y); if (d > 1) near.push([px + dx, py + dy, d]); }
      near.sort((a, b) => a[2] - b[2]);
      for (const [nx, ny] of near.slice(0, 3)) for (const [ox, oy] of [[0, 0], [-T, 0], [T, 0], [0, -T], [0, T]]) {
        c.lineWidth = 3 + r() * 3.5; c.beginPath(); c.moveTo(x + ox, y + oy); c.quadraticCurveTo((x + nx) / 2 + ox + (r() - .5) * 14, (y + ny) / 2 + oy + (r() - .5) * 14, nx + ox, ny + oy); c.stroke();
      }
    }
    return cv;
  }

  /* =========================================================
     GÖRÜNÜM
     ========================================================= */
  const HERO = `<svg class="mv-hero" viewBox="0 0 32 42"><ellipse cx="16" cy="40" rx="9" ry="2.6" fill="rgba(0,0,0,.35)"/>
    <g class="mv-body"><rect class="mv-leg l" x="11" y="29" width="4" height="10" rx="1.6" fill="#2a2420"/><rect class="mv-leg r" x="17" y="29" width="4" height="10" rx="1.6" fill="#2a2420"/>
    <path d="M8 31Q7 18 16 16Q25 18 24 31Z" fill="#3c5a5e"/><path d="M8 31Q8 26 10 23L12 31Z" fill="#2c4246"/>
    <circle cx="16" cy="12" r="5" fill="#d9b08c"/><ellipse cx="16" cy="9" rx="10" ry="2.6" fill="#b8913e"/><path d="M11 9Q11 3 16 3Q21 3 21 9Z" fill="#d6af57"/>
    <path d="M23 20L30 6" stroke="#7a5a34" stroke-width="1.6" stroke-linecap="round"/></g></svg>`;
  const BOAT = `<svg class="mv-boat" viewBox="0 0 40 64"><ellipse cx="22" cy="36" rx="13" ry="27" fill="rgba(0,0,0,.3)"/>
    <path d="M20 2Q34 18 31 52Q20 60 9 52Q6 18 20 2Z" fill="#5a3c22"/><path d="M20 7Q30 20 28 49Q20 55 12 49Q10 20 20 7Z" fill="#8a6038"/>
    <rect x="12" y="24" width="16" height="3" fill="#5a3c22"/><rect x="12" y="38" width="16" height="3" fill="#5a3c22"/>
    <circle cx="20" cy="45" r="5" fill="#3c5a5e"/><ellipse cx="20" cy="44" rx="7" ry="6.2" fill="#b8913e"/><circle cx="20" cy="44" r="3.4" fill="#d6af57"/>
    <path d="M20 14L20 34" stroke="#3a2614" stroke-width="1.6"/><path d="M20 15Q31 22 20 32Z" fill="#efe6cf" opacity=".92"/></svg>`;
  const imgCache = {};
  const img = src => imgCache[src] || (imgCache[src] = Object.assign(new Image(), { src }));
  const filterOk = (() => { try { const c = document.createElement('canvas').getContext('2d'); c.filter = 'blur(1px)'; return c.filter === 'blur(1px)'; } catch (e) { return false; } })();

  class View {
    constructor(el, map, hooks) {
      this.el = el; this.map = map; this.L = map.L; this.hooks = hooks; this.W = this.L.W; this.H = this.L.H;
      this.boat = map.kind === 'boat';
      this.cam = { x: 0, y: 0 }; this.vel = { x: 0, y: 0 }; this.follow = false;   // follow: kendine dön düğmesiyle bir kez ortala
      const st = hooks.start || this.L.start;
      this.me = { x: st.x, y: st.y }; this.target = null; this.head = -Math.PI / 2; this.dir = 1;
      this.parts = []; this.amb = []; this.catches = []; this.wake = []; this.t = 0; this.last = 0; this.alive = true; this.ping = null; this.line = null; this.schools = [];
      el.innerHTML = `<div class="mv-world"><div class="mv-bg"></div>${this.boat ? '<canvas class="mv-water"></canvas>' : ''}<div class="mv-marks"></div><div class="mv-me wv-me ${this.boat ? 'boat' : 'hero'}">${this.boat ? (hooks.boatSvg || BOAT) : (hooks.heroSvg || HERO)}</div></div>
        <canvas class="mv-fx"></canvas><button class="mv-center mv-ui" aria-label="Kendine dön"><svg class="ic"><use href="#i-${this.boat ? 'anchor' : 'home'}"/></svg></button>`;
      this.world = el.querySelector('.mv-world'); this.marksEl = el.querySelector('.mv-marks'); this.meEl = el.querySelector('.mv-me');
      this.fx = el.querySelector('.mv-fx'); this.fc = this.fx.getContext('2d'); this.centerBtn = el.querySelector('.mv-center');
      this.world.style.width = this.W + 'px'; this.world.style.height = this.H + 'px';
      this.bg = map.paint(Math.min(window.devicePixelRatio || 1, 1.25, Math.sqrt(7e6 / (this.W * this.H))));   // tek tuval ~7 milyon pikseli geçmez (telefon belleği)
      this.bg.style.width = this.W + 'px'; this.bg.style.height = this.H + 'px'; this.bg.className = 'mv-canvas';
      el.querySelector('.mv-bg').appendChild(this.bg);
      if (this.boat) {
        const P = this.L.P, sd = this.L.slots[0].x + this.L.slots[0].y;
        this.wc = el.querySelector('.mv-water'); this.wx = this.wc.getContext('2d');
        this.wpat = this.wx.createPattern(waveTile(P, sd), 'repeat'); this.wpat2 = this.wx.createPattern(waveTile(P, sd + 77), 'repeat');
        this.caus = P.abyss || P.foam ? null : this.wx.createPattern(causticTile(sd + 5), 'repeat');
        this.jumps = []; this.jt = 1.5; this.podT = 6 + Math.random() * 8;
        this.jelly = P.abyss ? Array.from({ length: 7 }, () => ({ x: Math.random(), y: Math.random(), ph: Math.random() * TAU, s: .7 + Math.random() * .6, c: Math.random() < .5 ? '185,166,230' : '120,220,210' })) : null;
        this.gulls = P.fx === 'spark' ? Array.from({ length: 3 }, () => this.ambientGull(true)) : null;
      }
      this.resize(); this.snap(); this.bind();
      if (window.ResizeObserver) { this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(el); }
      this.loop = this.loop.bind(this); requestAnimationFrame(this.loop);
    }
    resize() {
      const w = this.el.clientWidth, h = this.el.clientHeight; if (!w || !h) return;
      this.vw = w; this.vh = h; this.dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.fx.width = Math.round(w * this.dpr); this.fx.height = Math.round(h * this.dpr);
      if (this.wc) { this.wc.width = this.fx.width; this.wc.height = this.fx.height; this.wc.style.width = w + 'px'; this.wc.style.height = h + 'px'; }
      const n = reduced ? 6 : this.map.fx === 'gull' ? 6 : Math.round(w * h / (this.map.fx === 'rain' ? 2500 : 9000));
      this.amb = Array.from({ length: n }, () => this.ambient(true));
    }
    clampCam(x, y) { return [this.vw >= this.W ? (this.W - this.vw) / 2 : clamp(x, 0, this.W - this.vw), this.vh >= this.H ? (this.H - this.vh) / 2 : clamp(y, 0, this.H - this.vh)]; }
    camGoal() { return this.clampCam(this.me.x - this.vw / 2, this.me.y - this.vh * .56); }
    snap() { [this.cam.x, this.cam.y] = this.camGoal(); this.apply(); }
    apply() {
      this.world.style.transform = `translate3d(${(-this.cam.x).toFixed(1)}px,${(-this.cam.y).toFixed(1)}px,0)`;
      if (this.wc) this.wc.style.transform = `translate3d(${this.cam.x.toFixed(1)}px,${this.cam.y.toFixed(1)}px,0)`;
      this.meEl.style.transform = `translate3d(${this.me.x.toFixed(1)}px,${this.me.y.toFixed(1)}px,0)` + (this.boat ? ` rotate(${(this.head + Math.PI / 2).toFixed(3)}rad)` : '');
      this.meEl.style.zIndex = Math.round(this.me.y) + 2;
    }
    moveTo(x, y, cb) {
      this.target = { x: clamp(x, 24, this.W - 24), y: clamp(y, 24, this.H - 24), cb, best: 1e9, stuck: 0, wade: false };
      this.ping = { x: this.target.x, y: this.target.y, t: 0 };      // kamera yerinde kalır; tekne kenara yaklaşınca kayar
      this.meEl.classList.add('walk');
    }
    stop() { this.target = null; this.meEl.classList.remove('walk'); }
    get moving() { return !!this.target; }
    place(x, y) { this.me.x = x; this.me.y = y; this.target = null; this.meEl.classList.remove('walk'); this.snap(); }
    face(x, y) { this.head = Math.atan2(y - this.me.y, x - this.me.x); if (!this.boat) { this.dir = x >= this.me.x ? 1 : -1; this.meEl.classList.toggle('flip', this.dir < 0); } this.apply(); }
    // olta ipi: { x, y (şamandıra), phase, p }
    setLine(l) { this.line = l; }
    catchFx(f, color, q = 0) {
      if (!this.line) return;
      this.catches.push({ src: `assets/items/fish/fish-t${f.img}.png`, hue: f.hue || 0, sat: f.sat || 1, q, color, a: 0, x0: this.line.x, y0: this.line.y });
      this.splash(this.line.x, this.line.y, 10 + q * 3, 1);
    }
    splash(x, y, n = 6, k = .7) { for (let i = 0; i < n; i++) this.parts.push({ x, y, vx: (Math.random() - .5) * 70 * k, vy: -(40 + Math.random() * 70) * k, g: 220, life: .6, max: .6, c: '235,242,245', r: 1.3 }); }
    bind() {
      const el = this.el; let down = null, moved = false, lastP = null;
      this.onDown = e => {
        if (e.target.closest('.mv-ui')) return;
        down = { x: e.clientX, y: e.clientY, cx: this.cam.x, cy: this.cam.y, target: e.target }; moved = false;
        lastP = { x: e.clientX, y: e.clientY, t: performance.now() }; this.vel.x = this.vel.y = 0;
      };
      this.onMove = e => {
        if (!down) return;
        const dx = e.clientX - down.x, dy = e.clientY - down.y;
        if (!moved && Math.hypot(dx, dy) > 9) { moved = true; this.follow = false; el.classList.add('drag'); try { el.setPointerCapture(e.pointerId); } catch (er) {} }
        if (!moved) return;
        [this.cam.x, this.cam.y] = this.clampCam(down.cx - dx, down.cy - dy);
        const now = performance.now(), dt = Math.max(1, now - lastP.t);
        this.vel.x = -(e.clientX - lastP.x) / dt * 16; this.vel.y = -(e.clientY - lastP.y) / dt * 16; lastP = { x: e.clientX, y: e.clientY, t: now };
        this.apply();
      };
      this.onUp = e => {
        if (!down) return;
        if (!moved) {
          const rc = el.getBoundingClientRect(), mk = down.target.closest && down.target.closest('[data-mark]');
          this.hooks.tap({ x: e.clientX - rc.left + this.cam.x, y: e.clientY - rc.top + this.cam.y, mark: mk ? mk.dataset.mark : null });
        } else if (performance.now() - lastP.t > 80) { this.vel.x = this.vel.y = 0; }
        down = null; el.classList.remove('drag');
      };
      this.onCancel = () => { down = null; el.classList.remove('drag'); };
      el.addEventListener('pointerdown', this.onDown); el.addEventListener('pointermove', this.onMove);
      el.addEventListener('pointerup', this.onUp); el.addEventListener('pointercancel', this.onCancel);
      this.centerBtn.addEventListener('click', () => { this.follow = true; this.hooks.haptic && this.hooks.haptic(); });
    }
    ambient(any) {
      const k = this.map.fx, w = this.vw || 300, h = this.vh || 400;
      if (k === 'rain') return { x: Math.random() * (w + 80), y: any ? Math.random() * h : -10, v: 420 + Math.random() * 200, l: 8 + Math.random() * 10 };
      if (k === 'gull') return this.ambientGull(any);
      return { x: Math.random() * w, y: any ? Math.random() * h : h + 6, ph: Math.random() * TAU, v: .08 + Math.random() * .2, s: .6 + Math.random() * 1.4 };
    }
    ambientGull(any) { const w = this.vw || 300, h = this.vh || 400; return { x: any ? Math.random() * w : -20, y: Math.random() * h, v: 18 + Math.random() * 16, ph: Math.random() * TAU, s: .8 + Math.random() * .5 }; }
    drawGull(c, m, dt, w) {
      const t = this.t; m.x += m.v * dt; if (m.x > w + 30) Object.assign(m, this.ambientGull(false));
      const f = Math.sin(t * 6 + m.ph) * 3 * m.s, y = m.y + Math.sin(t * .7 + m.ph) * 8;
      c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(m.x - 7 * m.s + 14, y - f + 24); c.quadraticCurveTo(m.x + 10, y + 21, m.x + 14, y + 24); c.quadraticCurveTo(m.x + 18, y + 21, m.x + 7 * m.s + 14, y - f + 24); c.stroke();
      c.strokeStyle = 'rgba(244,240,232,.85)'; c.beginPath(); c.moveTo(m.x - 7 * m.s, y - f); c.quadraticCurveTo(m.x - 4, y - 3, m.x, y); c.quadraticCurveTo(m.x + 4, y - 3, m.x + 7 * m.s, y - f); c.stroke();
    }
    // su katmanı (dünyanın içinde, işaretlerin ve teknenin altında; kamerayla birlikte durur)
    drawWater(dt) {
      const c = this.wx, w = this.vw, h = this.vh, cx = this.cam.x, cy = this.cam.y, t = this.t, L = this.L, P = L.P, d = this.dpr;
      c.setTransform(d, 0, 0, d, 0, 0); c.clearRect(0, 0, w, h);
      const tile = (pat, T, k, ox, oy, a) => {
        const sx = ((ox % (T * k)) + T * k) % (T * k) - T * k, sy = ((oy % (T * k)) + T * k) % (T * k) - T * k;
        c.setTransform(d * k, 0, 0, d * k, d * sx, d * sy); c.globalAlpha = a; c.fillStyle = pat; c.fillRect(0, 0, (w + 2 * T * k) / k, (h + 2 * T * k) / k);
      };
      if (!reduced) {
        // dipte dalgalanan güneş ağı
        if (this.caus) {
          c.globalCompositeOperation = 'lighter';
          tile(this.caus, 220, 1, -cx + t * 7, -cy + t * 4, .035 * (.7 + .3 * Math.sin(t * .8)));
          tile(this.caus, 220, 1.6, -cx - t * 5, -cy + t * 6, .03 * (.7 + .3 * Math.sin(t * .6 + 2)));
          c.globalCompositeOperation = 'source-over';
        }
        // iki kat dalga sırtı, ayrı yönlere kayar
        tile(this.wpat, 240, 1, -cx + t * 10, -cy + t * 3, P.foam ? .95 : .75);
        tile(this.wpat2, 240, 1.5, -cx - t * 6, -cy + t * 7, P.foam ? .7 : .45);
        c.globalAlpha = 1; c.setTransform(d, 0, 0, d, 0, 0);
      }
      const vis = (x, y, m = 40) => x > -m && y > -m && x < w + m && y < h + m;
      // denizanaları (Karanlık Çukur): ekranla birlikte süzülür, ışık saçar
      if (this.jelly) for (const j of this.jelly) {
        j.y -= dt * .012 * j.s; if (j.y < -.1) { j.y = 1.1; j.x = Math.random(); }
        const x = ((j.x * (w + 80) - cx * .15) % (w + 80) + w + 80) % (w + 80) - 40, y = j.y * h + Math.sin(t * .9 + j.ph) * 6, p = .6 + .4 * Math.sin(t * 2 + j.ph), r = 7 * j.s;
        const g = c.createRadialGradient(x, y, 0, x, y, r * 3.2); g.addColorStop(0, `rgba(${j.c},${(.32 * p).toFixed(3)})`); g.addColorStop(1, `rgba(${j.c},0)`); c.fillStyle = g; c.fillRect(x - r * 3.2, y - r * 3.2, r * 6.4, r * 6.4);
        c.fillStyle = `rgba(${j.c},${(.55 * p).toFixed(3)})`; c.beginPath(); c.ellipse(x, y, r, r * (.75 + .1 * Math.sin(t * 3 + j.ph)), 0, Math.PI, TAU); c.fill();
        c.strokeStyle = `rgba(${j.c},${(.4 * p).toFixed(3)})`; c.lineWidth = 1;
        for (let k = -2; k <= 2; k++) { c.beginPath(); c.moveTo(x + k * r * .35, y); c.quadraticCurveTo(x + k * r * .35 + Math.sin(t * 3 + k + j.ph) * 3, y + r, x + k * r * .3, y + r * 1.9); c.stroke(); }
      }
      // sıçrayan balıklar ve yunus sürüsü
      if (!reduced) {
        if ((this.jt -= dt) <= 0) {
          this.jt = P.abyss ? 4 + Math.random() * 5 : 1.2 + Math.random() * 2.8;
          for (let k = 0; k < 6; k++) { const x = cx + 30 + Math.random() * (w - 60), y = cy + 40 + Math.random() * (h - 80); if (Math.hypot(x - this.me.x, y - this.me.y) > 70) { this.jumps.push({ x, y, dir: Math.random() < .5 ? -1 : 1, p: 0, dur: .8, len: 30, hgt: 18, big: false, wait: 0 }); break; } }
        }
        if (!P.abyss && !P.foam && (this.podT -= dt) <= 0) {
          this.podT = 14 + Math.random() * 16;
          const dir = Math.random() < .5 ? -1 : 1, y0 = cy + 60 + Math.random() * (h - 140), x0 = dir > 0 ? cx + 10 : cx + w - 10, n = 2 + Math.floor(Math.random() * 2);
          for (let i = 0; i < n; i++) for (let j = 0; j < 4; j++) this.jumps.push({ x: x0 + dir * (j * 70 + i * 18), y: y0 + i * 14, dir, p: 0, dur: 1.15, len: 58, hgt: 24, big: true, wait: j * 1.25 + i * .22 });
        }
        this.jumps = this.jumps.filter(j => {
          if (j.wait > 0) { j.wait -= dt; return true; }
          if (j.p === 0) this.splash(j.x, j.y, j.big ? 7 : 4, j.big ? .7 : .45);
          j.p += dt / j.dur;
          if (j.p >= 1) { this.splash(j.x + j.dir * j.len, j.y, j.big ? 9 : 5, j.big ? .8 : .5); return false; }
          const q = j.p, x = j.x + j.dir * j.len * q - cx, yb = j.y - cy, y = yb - Math.sin(q * Math.PI) * j.hgt;
          if (!vis(x, y, 60)) return true;
          c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(x, yb + 3, j.big ? 12 : 6, j.big ? 3 : 2, 0, 0, TAU); c.fill();
          const ang = Math.atan2(-Math.cos(q * Math.PI) * j.hgt * Math.PI, j.dir * j.len);
          c.save(); c.translate(x, y); c.rotate(ang); if (j.dir < 0) c.scale(1, -1);
          if (j.big) {
            c.fillStyle = '#5d6e78'; c.beginPath(); c.ellipse(0, 0, 14, 4.4, 0, 0, TAU); c.fill();
            c.fillStyle = '#8a9ca6'; c.beginPath(); c.ellipse(1, 1.4, 10, 2, 0, 0, TAU); c.fill();
            c.fillStyle = '#4c5c66'; c.beginPath(); c.moveTo(-2, -3.6); c.lineTo(-7, -9); c.lineTo(2, -4); c.fill(); c.beginPath(); c.moveTo(-13, 0); c.lineTo(-19, -4); c.lineTo(-18, 4); c.fill(); c.beginPath(); c.moveTo(13, -.5); c.lineTo(18, 0); c.lineTo(13, 1.2); c.fill();
          } else {
            c.fillStyle = P.abyss ? '#b9a6e6' : '#d6dde0'; c.beginPath(); c.ellipse(0, 0, 6, 2.2, 0, 0, TAU); c.fill();
            c.beginPath(); c.moveTo(-5, 0); c.lineTo(-9, -3); c.lineTo(-9, 3); c.fill();
          }
          c.restore(); return true;
        });
      }
      // sürüler: su altında dönen balıklar, kaynayan su (nitelik rengi, bölge kademesine göre süs) · NodeArt
      const nctx = { abyss: !!P.abyss, push: p => this.parts.push(p), cx, cy };
      for (const s of this.schools) { if (!s) continue; const x = s.x - cx, y = s.y - cy; if (vis(x, y, 70)) NodeArt.drawWater(c, s, x, y, t, reduced ? 0 : dt, nctx); }
      // şamandıralar: sallanır, ışığı yanıp söner
      for (const b of L.buoys || []) {
        const x = b.x - cx, y = b.y - cy + Math.sin(t * 1.6 + b.x) * 1.5; if (!vis(x, y, 30)) continue;
        const col = ['#d8553f', '#4fae5c', '#e7c26a'][b.c], lit = Math.sin(t * 2.2 + b.x * .01) > .55;
        const q = (t * .5 + b.y * .001) % 1; c.strokeStyle = `rgba(240,236,224,${(.35 * (1 - q)).toFixed(3)})`; c.lineWidth = 1; c.beginPath(); c.ellipse(x, y + 4, 6 + q * 14, 2.5 + q * 5, 0, 0, TAU); c.stroke();
        c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(x + 2, y + 5, 7, 3, 0, 0, TAU); c.fill();
        c.save(); c.translate(x, y); c.rotate(Math.sin(t * 1.3 + b.y) * .12);
        c.fillStyle = col; c.beginPath(); c.moveTo(-6, 4); c.lineTo(-3, -10); c.lineTo(3, -10); c.lineTo(6, 4); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(-4.6, -3, 9.2, 2.4);
        c.fillStyle = '#2a2420'; c.fillRect(-1, -15, 2, 5);
        if (lit) { const g = c.createRadialGradient(0, -16, 0, 0, -16, 16); g.addColorStop(0, col + 'cc'); g.addColorStop(1, col + '00'); c.fillStyle = g; c.fillRect(-16, -32, 32, 32); }
        c.fillStyle = lit ? '#fff4d0' : '#5a5048'; c.beginPath(); c.arc(0, -16, 2.2, 0, TAU); c.fill();
        c.restore();
      }
    }
    step(dt) {
      const tg = this.target;
      if (tg) {
        const dx = tg.x - this.me.x, dy = tg.y - this.me.y, d = Math.hypot(dx, dy), SPD = this.boat ? 170 * (this.hooks.sail || 1) : 190;
        if (d < 2) { this.me.x = tg.x; this.me.y = tg.y; this.target = null; this.meEl.classList.remove('walk'); tg.cb && tg.cb(); }
        else {
          const sp = Math.min(SPD * dt, d), a0 = Math.atan2(dy, dx); let ok = false;
          for (const da of tg.wade ? [0] : [0, .5, -.5, 1, -1, 1.5, -1.5]) {
            const a = a0 + da * (tg.side || 1), nx = this.me.x + Math.cos(a) * sp, ny = this.me.y + Math.sin(a) * sp;
            if (tg.wade || this.L.walkable(nx, ny)) {
              this.me.x = nx; this.me.y = ny; ok = true; if (da && !tg.side) tg.side = Math.sign(da);
              let dh = a - this.head; while (dh > Math.PI) dh -= TAU; while (dh < -Math.PI) dh += TAU; this.head += dh * Math.min(1, dt * 7);
              break;
            }
          }
          if (!ok) tg.wade = true;
          if (d < tg.best - 1) { tg.best = d; tg.stuck = 0; } else if ((tg.stuck += dt) > .6) tg.wade = true;
          if (!this.boat && Math.abs(dx) > 1) { const nd = dx > 0 ? 1 : -1; if (nd !== this.dir) { this.dir = nd; this.meEl.classList.toggle('flip', nd < 0); } }
          if (this.boat && Math.random() < dt * 30) this.wake.push({ x: this.me.x - Math.cos(this.head) * 22, y: this.me.y - Math.sin(this.head) * 22, a: 0 });
        }
      }
      if (this.follow) {
        const [gx, gy] = this.camGoal(), k = 1 - Math.pow(.0025, dt); this.cam.x += (gx - this.cam.x) * k; this.cam.y += (gy - this.cam.y) * k;
        if (Math.hypot(gx - this.cam.x, gy - this.cam.y) < 2) this.follow = false;
      } else if (this.target && !this.el.classList.contains('drag') && Math.abs(this.vel.x) + Math.abs(this.vel.y) <= .05) {
        // yol alırken: tekne ekran kenarına yaklaşırsa kamera yalnız gerektiği kadar kayar (ekran dışına kaydırdıysan kovalamaz)
        const mx = Math.min(90, this.vw * .22), my = Math.min(120, this.vh * .22), x = this.me.x - this.cam.x, y = this.me.y - this.cam.y;
        const mt = this.hooks.insetTop ? this.hooks.insetTop + 110 : my, mb = this.hooks.insetBottom ? this.hooks.insetBottom + 70 : my;      // üstte ada ve çubuklar var: tekne ve yanaştığı sürü onların altında kalsın
        const ox = x < mx ? x - mx : x > this.vw - mx ? x - (this.vw - mx) : 0, oy = y < mt ? y - mt : y > this.vh - mb ? y - (this.vh - mb) : 0;
        const seen = x > -10 && y > -10 && x < this.vw + 10 && y < this.vh + 10;
        if (seen && (ox || oy)) { const k = 1 - Math.pow(.02, dt); [this.cam.x, this.cam.y] = this.clampCam(this.cam.x + ox * k, this.cam.y + oy * k); }
      } else if (Math.abs(this.vel.x) + Math.abs(this.vel.y) > .05 && !this.el.classList.contains('drag')) {
        [this.cam.x, this.cam.y] = this.clampCam(this.cam.x + this.vel.x * dt * 60, this.cam.y + this.vel.y * dt * 60);
        this.vel.x *= Math.pow(.04, dt); this.vel.y *= Math.pow(.04, dt);
      }
      { const x = this.me.x - this.cam.x - this.vw / 2, y = this.me.y - this.cam.y - this.vh * .56; this.centerBtn.classList.toggle('on', !this.follow && (Math.abs(x) > this.vw * .3 || Math.abs(y) > this.vh * .3)); }
      this.apply();
    }
    loop(ts) {
      if (!this.alive) return;
      const dt = Math.min(.05, (ts - (this.last || ts)) / 1000); this.last = ts; this.t += dt;
      if (!document.hidden && this.el.offsetParent !== null) { this.step(dt); this.draw(dt); }
      requestAnimationFrame(this.loop);
    }
    draw(dt) {
      const c = this.fc, w = this.vw, h = this.vh, cx = this.cam.x, cy = this.cam.y, t = this.t, L = this.L;
      if (!w) return;
      if (this.wx) this.drawWater(dt);
      c.setTransform(this.dpr, 0, 0, this.dpr, 0, 0); c.clearRect(0, 0, w, h);
      const vis = (x, y, m = 40) => x > -m && y > -m && x < w + m && y < h + m;
      // bulut gölgeleri
      if (!reduced) for (let i = 0; i < 6; i++) {
        const span = this.W + 700, x = ((i * 690 + t * (9 + i % 3 * 3)) % span) - 350 - cx, y = 260 + i * 440 - cy, rad = 170 + i % 3 * 40;
        if (!vis(x, y, rad)) continue;
        const g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, 'rgba(8,8,10,.16)'); g.addColorStop(1, 'rgba(8,8,10,0)');
        c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
      }
      // su ışıltısı
      for (const s of L.sparkles || []) {
        const x = s.x - cx, y = s.y - cy; if (!vis(x, y, 4)) continue;
        const a = Math.pow(Math.max(0, Math.sin(t * s.sp + s.ph)), 8) * (this.map.fx === 'mote' ? .4 : .8); if (a < .03) continue;
        c.fillStyle = this.map.fx === 'mote' ? `rgba(185,166,230,${a.toFixed(3)})` : `rgba(236,246,255,${a.toFixed(3)})`;
        c.fillRect(x - 2.5, y - .5, 5, 1); c.fillRect(x - .5, y - 2.5, 1, 5);
      }
      // ekran dışındaki sürüler: kenarda nitelik renginde yön oku
      for (const s of this.schools) {
        if (!s) continue;
        const x = s.x - cx, y = s.y - cy; if (x > -10 && y > -10 && x < w + 10 && y < h + 10) continue;
        const ox = w / 2, oy = h / 2, a = Math.atan2(y - oy, x - ox), top = this.hooks.insetTop || 22;      // üstteki ada ve çubukların altında kalsın
        const k = Math.min((w / 2 - 22) / Math.abs(Math.cos(a) || 1e-6), (h / 2 - (Math.sin(a) < 0 ? top : this.hooks.insetBottom || 22)) / Math.abs(Math.sin(a) || 1e-6));
        NodeArt.drawArrow(c, ox + Math.cos(a) * k, oy + Math.sin(a) * k, a, s.q, s.tier, t);
      }
      // dümen suyu
      this.wake = this.wake.filter(k => (k.a += dt) < 1.4);
      for (const k of this.wake) { const x = k.x - cx, y = k.y - cy; c.strokeStyle = `rgba(230,240,240,${(.4 * (1 - k.a / 1.4)).toFixed(3)})`; c.lineWidth = 1; c.beginPath(); c.arc(x, y, 3 + k.a * 14, 0, TAU); c.stroke(); }
      // fenerler ve lambalar
      for (const lp of L.lamps || []) {
        const x = lp.x - cx, y = lp.y - 24 - cy; if (!vis(x, y, 60)) continue;
        const fl = .8 + .2 * Math.sin(t * 7 + lp.x);
        const g = c.createRadialGradient(x, y, 0, x, y, 46); g.addColorStop(0, `rgba(255,200,110,${(.26 * fl).toFixed(3)})`); g.addColorStop(1, 'rgba(255,200,110,0)');
        c.fillStyle = g; c.fillRect(x - 46, y - 46, 92, 92);
      }
      if (L.fener) {
        const x = L.fener.x - cx, y = L.fener.y - 143 - cy, a = t * .9;
        if (vis(x, y, 400)) {
          c.save(); c.translate(x, y); c.rotate(a);
          const g = c.createLinearGradient(0, 0, 340, 0); g.addColorStop(0, 'rgba(255,230,160,.22)'); g.addColorStop(1, 'rgba(255,230,160,0)');
          c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.lineTo(340, -40); c.lineTo(340, 40); c.closePath(); c.fill(); c.restore();
          const g2 = c.createRadialGradient(x, y, 0, x, y, 30); g2.addColorStop(0, 'rgba(255,230,160,.6)'); g2.addColorStop(1, 'rgba(255,230,160,0)'); c.fillStyle = g2; c.fillRect(x - 30, y - 30, 60, 60);
        }
      }
      // tütsühane dumanı
      for (const sm of L.smoke || []) if (Math.random() < dt * 5) this.parts.push({ x: sm.x + (Math.random() - .5) * 6, y: sm.y, vx: 6 + Math.random() * 6, vy: -16 - Math.random() * 10, life: 2.4, max: 2.4, c: '170,160,150', r: 3, grow: 5, soft: true });
      // olta ipi, şamandıra
      const ln = this.line;
      if (ln && !this.target) {
        const bx = this.me.x - cx, by = this.me.y - cy, sx = ln.x - cx, sy = ln.y - cy;
        const bite = ln.phase === 'bite', cast = ln.phase === 'cast';
        const k = cast ? Math.min(1, ln.p / .08) : 1;
        const fx = bx + (sx - bx) * k, fy = by + (sy - by) * k - Math.sin(k * Math.PI) * 26;
        const dip = bite ? (Math.sin(t * 22) * .5 + .5) * 3 + 2 : Math.sin(t * 2.2) * .8;
        c.strokeStyle = 'rgba(240,230,210,.6)'; c.lineWidth = .8;
        c.beginPath(); c.moveTo(bx + Math.cos(this.head) * 6, by + Math.sin(this.head) * 6); c.quadraticCurveTo((bx + fx) / 2, (by + fy) / 2 + 10, fx, fy + dip); c.stroke();
        if (!cast || k >= 1) {
          const rr = bite ? 3 : 1;
          for (let i = 0; i < rr; i++) { const q = (t * (bite ? 1.8 : .5) + i / rr) % 1; c.strokeStyle = `rgba(240,236,224,${(.4 * (1 - q)).toFixed(3)})`; c.lineWidth = 1; c.beginPath(); c.ellipse(fx, fy + 2, 4 + q * 18, 2 + q * 8, 0, 0, TAU); c.stroke(); }
        }
        c.fillStyle = '#f2ead8'; c.beginPath(); c.arc(fx, fy + dip, 3.2, 0, Math.PI); c.fill();
        c.fillStyle = '#d8553f'; c.beginPath(); c.arc(fx, fy + dip, 3.2, Math.PI, TAU); c.fill();
        if (bite) { c.strokeStyle = `rgba(231,194,106,${(.6 + .4 * Math.sin(t * 16)).toFixed(3)})`; c.lineWidth = 1.5; c.beginPath(); c.arc(fx, fy + dip, 9 + Math.sin(t * 16) * 1.5, 0, TAU); c.stroke(); if (Math.random() < .3) this.splash(ln.x, ln.y, 1, .3); }
      }
      // parçacıklar
      this.parts = this.parts.filter(p => (p.life -= dt) > 0);
      for (const p of this.parts) {
        p.x += p.vx * dt; p.y += p.vy * dt; if (p.g) p.vy += p.g * dt;
        const a = p.life / p.max, x = p.x - cx, y = p.y - cy; if (!vis(x, y, 20)) continue;
        if (p.ring) { c.strokeStyle = `rgba(${p.c},${(a * .5).toFixed(3)})`; c.lineWidth = 1; c.beginPath(); c.arc(x, y, (1 - a) * 6 + 1, 0, TAU); c.stroke(); continue; }
        c.fillStyle = `rgba(${p.c},${(p.soft ? a * .22 : a).toFixed(3)})`;
        c.beginPath(); c.arc(x, y, p.r + (p.grow ? (1 - a) * p.grow * 2 : 0), 0, TAU); c.fill();
      }
      // yakalanan balık: şamandıradan tekneye sıçrar
      this.catches = this.catches.filter(k => k.a < .95);
      for (const k of this.catches) {
        k.a += dt; const q = Math.min(1, k.a / .9);
        const x = k.x0 + (this.me.x - k.x0) * q - cx, y = k.y0 + (this.me.y - k.y0) * q - Math.sin(q * Math.PI) * 60 - cy;
        const im = img(k.src); if (!im.complete || !im.naturalWidth) continue;
        c.save(); c.translate(x, y); c.rotate(-.6 + q * 1.8);
        const s = 30 * (1 - q * .4);
        if (k.q >= 2) { const g = c.createRadialGradient(0, 0, 0, 0, 0, s * 1.2); g.addColorStop(0, k.color + '99'); g.addColorStop(1, k.color + '00'); c.fillStyle = g; c.fillRect(-s * 1.2, -s * 1.2, s * 2.4, s * 2.4); }
        if (filterOk) c.filter = `hue-rotate(${k.hue}deg) saturate(${k.sat})`;
        c.drawImage(im, -s / 2, -s / 2, s, s); c.filter = 'none'; c.restore();
      }
      // hedef halkası
      if (this.ping) {
        const pg = this.ping; pg.t += dt; const a = 1 - pg.t / .9;
        if (a <= 0) this.ping = null;
        else { c.strokeStyle = `rgba(231,194,106,${a.toFixed(3)})`; c.lineWidth = 1.5; c.beginPath(); c.ellipse(pg.x - cx, pg.y - cy, 6 + pg.t * 22, (6 + pg.t * 22) * .55, 0, 0, TAU); c.stroke(); }
      }
      // ortam
      const k = this.map.fx;
      for (const m of this.amb) {
        if (k === 'rain') {
          m.y += m.v * dt; m.x -= m.v * .25 * dt; if (m.y > h + 10) Object.assign(m, this.ambient(false));
          c.strokeStyle = 'rgba(200,210,220,.24)'; c.lineWidth = 1; c.beginPath(); c.moveTo(m.x, m.y); c.lineTo(m.x + m.l * .25, m.y - m.l); c.stroke();
        } else if (k === 'gull') {
          this.drawGull(c, m, dt, w);
        } else {
          m.y -= m.v * 30 * dt; m.x += Math.sin(t * .6 + m.ph) * .25; if (m.y < -8) Object.assign(m, this.ambient(false));
          const a = Math.max(0, Math.sin(t * 1.7 + m.ph)) * .8;
          const col = k === 'mote' ? '185,166,230' : k === 'firefly' ? '232,250,160' : '255,236,190';
          c.fillStyle = `rgba(${col},${(a * .2).toFixed(3)})`; c.beginPath(); c.arc(m.x, m.y, m.s * 4, 0, TAU); c.fill();
          c.fillStyle = `rgba(${col},${(a * (k === 'spark' ? .5 : 1)).toFixed(3)})`; c.beginPath(); c.arc(m.x, m.y, m.s * .8, 0, TAU); c.fill();
        }
      }
      if (this.gulls) for (const m of this.gulls) this.drawGull(c, m, dt, w);
      // şimşek
      if (k === 'rain') {
        this.flashAt = (this.flashAt ?? 5) - dt;
        if (this.flashAt <= 0) { this.flash = 1; this.flashAt = 6 + Math.random() * 9; }
        if (this.flash > 0) { c.fillStyle = `rgba(230,236,255,${(this.flash * .3).toFixed(3)})`; c.fillRect(0, 0, w, h); this.flash -= dt * 3.5; }
      }
    }
    destroy() {
      this.alive = false; if (this.ro) this.ro.disconnect();
      this.el.removeEventListener('pointerdown', this.onDown); this.el.removeEventListener('pointermove', this.onMove);
      this.el.removeEventListener('pointerup', this.onUp); this.el.removeEventListener('pointercancel', this.onCancel);
      for (const cv of [this.bg, this.wc, this.fx]) if (cv) cv.width = cv.height = 0;      // tuval belleğini hemen bırak
      this.el.innerHTML = '';
    }
  }

  /* =========================================================
     TOPLAMA BÖLGELERİ (kara): maden ocağı, orman, çayır, av sahası, harabeler
     Maps.field({ prof, t, seed }) : düğüm yuvaları ve süsler alan tohumundan, hep aynı
     ========================================================= */
  const FW = 1200, FH = 1500;
  const FIELD_PAL = {
    maden: { g0: [138, 124, 102], g1: [98, 88, 72], lite: [176, 164, 140], dark: [60, 52, 44], fx: 'spark' },
    odun: { g0: [84, 116, 68], g1: [52, 80, 48], lite: [122, 152, 90], dark: [28, 46, 30], fx: 'firefly' },
    bitki: { g0: [118, 154, 86], g1: [80, 120, 66], lite: [160, 188, 110], dark: [44, 74, 44], fx: 'firefly' },
    deri: { g0: [160, 150, 96], g1: [118, 116, 70], lite: [196, 184, 124], dark: [74, 70, 44], fx: 'gull' },
    yaratik: { g0: [72, 66, 84], g1: [44, 40, 54], lite: [108, 100, 126], dark: [20, 18, 28], fx: 'mote' },
  };
  const fieldCache = {};
  function fieldLayout(a) {
    const key = a.prof + a.t;
    if (fieldCache[key]) return fieldCache[key];
    const r = rng(a.seed * 13 + 5), P = FIELD_PAL[a.prof], start = { x: FW / 2, y: FH - 270 };
    const slots = [];
    { const an = -Math.PI / 2 + (r() - .5) * 1.4, d = 200 + r() * 60; slots.push({ x: Math.round(start.x + Math.cos(an) * d), y: Math.round(start.y + Math.sin(an) * d) }); }
    for (let k = 0; slots.length < FIELD_SLOTS && k < 3000; k++) {
      const x = 110 + r() * (FW - 220), y = 190 + r() * (FH - 520);
      if (Math.hypot(x - start.x, y - start.y) < 200 || slots.some(s => Math.hypot(s.x - x, s.y - y) < (k < 2000 ? 250 : 180))) continue;
      slots.push({ x: Math.round(x), y: Math.round(y) });
    }
    const free = (x, y, d) => !slots.some(s => Math.hypot(s.x - x, s.y - y) < d) && Math.hypot(x - start.x, y - start.y) > d;
    const blobs = []; for (let i = 0; i < 16; i++) blobs.push(mkBlob(r, 80 + r() * (FW - 160), 80 + r() * (FH - 160), 70 + r() * 120, 50 + r() * 90, 'p'));
    const deco = [];
    for (let k = 0; deco.length < 70 && k < 2500; k++) {
      const x = 30 + r() * (FW - 60), y = 30 + r() * (FH - 60), edge = x < 110 || x > FW - 110 || y < 110 || y > FH - 90;
      if (!edge && r() > .34) continue;
      if (!free(x, y, 78) || Math.abs(x - start.x) < 46 && y > start.y - 260) continue;
      deco.push({ x, y, s: .7 + r() * .8, k: r(), a: r() * TAU });
    }
    deco.sort((p, q) => p.y - q.y);
    const sparkles = []; for (let i = 0; i < 160; i++) sparkles.push({ x: r() * FW, y: r() * FH, ph: r() * TAU, sp: .5 + r() * 1.2 });
    return (fieldCache[key] = { W: FW, H: FH, P, prof: a.prof, t: a.t, slots, start, blobs, deco, sparkles, walkable: (x, y) => x > 24 && y > 24 && x < FW - 24 && y < FH - 24 });
  }
  function paintField(L, s) {
    const cv = document.createElement('canvas'); cv.width = Math.round(FW * s); cv.height = Math.round(FH * s);
    const c = cv.getContext('2d'); c.scale(s, s);
    const P = L.P, r = rng(L.slots[0].x * 7 + L.slots[1].y), pf = L.prof;
    let g = c.createLinearGradient(0, 0, 0, FH); g.addColorStop(0, rgba(P.g1)); g.addColorStop(.55, rgba(P.g0)); g.addColorStop(1, rgba(mix(P.g0, P.lite, .35)));
    c.fillStyle = g; c.fillRect(0, 0, FW, FH);
    // iri, yumuşak açık ve koyu lekeler
    for (let i = 0; i < 12; i++) {
      const x = r() * FW, y = r() * FH, rad = 220 + r() * 300, g2 = c.createRadialGradient(x, y, 0, x, y, rad);
      g2.addColorStop(0, i % 2 ? rgba(P.dark, .22) : rgba(P.lite, .2)); g2.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g2; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    // zemin lekeleri: mesleğe göre (çakıl, yosun, çiçek öbeği, kuru ot, taş döşeme)
    for (const b of L.blobs) {
      c.fillStyle = pf === 'yaratik' ? rgba(P.lite, .14) : pf === 'maden' ? rgba(P.lite, .2) : rgba(mix(P.g0, P.lite, .6), .3); bPath(c, b, 1); c.fill();
      if (pf === 'yaratik') { c.strokeStyle = rgba(P.dark, .5); c.lineWidth = 1.4; for (let i = 0; i < 9; i++) { const [x, y] = bEdge(b, r() * TAU, Math.sqrt(r()) * .85); c.strokeRect(x - 16, y - 11, 32, 22); } }
      if (pf === 'bitki') for (let i = 0; i < 26; i++) { const [x, y] = bEdge(b, r() * TAU, Math.sqrt(r()) * .9); c.fillStyle = ['#f2d36a', '#f0f0e6', '#e58aa8', '#b79cf0', '#f29a5a'][i % 5]; c.beginPath(); c.arc(x, y, 2 + r() * 1.6, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.arc(x - .6, y - .6, .8, 0, TAU); c.fill(); }
      if (pf === 'maden') for (let i = 0; i < 14; i++) { const [x, y] = bEdge(b, r() * TAU, Math.sqrt(r()) * .9); c.fillStyle = rgba(shade(P.g1, .7 + r() * .5), .7); c.beginPath(); c.ellipse(x, y, 3 + r() * 6, 2 + r() * 4, r() * 3, 0, TAU); c.fill(); }
    }
    // doku: kısa ot ya da çizik işaretleri (düzenli, sade)
    c.lineCap = 'round'; c.lineWidth = 1.4; c.strokeStyle = pf === 'maden' || pf === 'yaratik' ? rgba(P.dark, .28) : rgba(P.dark, .3); c.beginPath();
    for (let row = 0, y = 30; y < FH; y += 46, row++) for (let x = (row % 2 ? 30 : 0); x < FW; x += 64) {
      const xx = x + (r() - .5) * 30, yy = y + (r() - .5) * 22;
      if (pf === 'maden' || pf === 'yaratik') { c.moveTo(xx, yy); c.lineTo(xx + 7 + r() * 6, yy + (r() - .5) * 4); }
      else { c.moveTo(xx, yy); c.lineTo(xx - 2, yy - 6); c.moveTo(xx + 3, yy); c.lineTo(xx + 4, yy - 7); c.moveTo(xx + 6, yy); c.lineTo(xx + 8, yy - 5); }
    }
    c.stroke();
    // çıkıştan içeri uzanan toprak yol
    c.strokeStyle = rgba(mix(P.g0, [150, 124, 88], pf === 'yaratik' ? .2 : .6), .7); c.lineWidth = 46; c.beginPath(); c.moveTo(L.start.x, FH + 30); c.bezierCurveTo(L.start.x - 40, FH - 260, L.start.x + 70, FH - 420, L.start.x + 10, FH - 620); c.stroke();
    c.strokeStyle = rgba(P.dark, .14); c.lineWidth = 2; c.setLineDash([10, 14]); c.beginPath(); c.moveTo(L.start.x, FH + 30); c.bezierCurveTo(L.start.x - 40, FH - 260, L.start.x + 70, FH - 420, L.start.x + 10, FH - 620); c.stroke(); c.setLineDash([]);
    if (pf === 'bitki' || pf === 'deri') {      // kıvrılan dere
      c.strokeStyle = pf === 'bitki' ? 'rgba(96,170,186,.75)' : 'rgba(110,160,160,.55)'; c.lineWidth = 26; c.beginPath(); c.moveTo(-30, 380); c.bezierCurveTo(300, 300, 420, 620, 760, 560); c.bezierCurveTo(960, 520, 1040, 700, FW + 30, 660); c.stroke();
      c.strokeStyle = 'rgba(230,246,246,.3)'; c.lineWidth = 2; c.beginPath(); c.moveTo(-30, 376); c.bezierCurveTo(300, 296, 420, 616, 760, 556); c.bezierCurveTo(960, 516, 1040, 696, FW + 30, 656); c.stroke();
    }
    // süsler: gölgeli, düz renkli (kaya, ağaç, çalı, sütun, kemik)
    const tree = (x, y, k, dark) => { c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.ellipse(x + 8 * k, y + 6 * k, 26 * k, 12 * k, 0, 0, TAU); c.fill();
      c.fillStyle = dark ? '#2c4a30' : '#3f6a3c'; c.beginPath(); c.arc(x, y - 16 * k, 26 * k, 0, TAU); c.fill(); c.fillStyle = dark ? '#3a5e3a' : '#58874a'; c.beginPath(); c.arc(x - 7 * k, y - 22 * k, 18 * k, 0, TAU); c.fill();
      c.fillStyle = dark ? '#4a7046' : '#7aa85a'; c.beginPath(); c.arc(x - 11 * k, y - 27 * k, 9 * k, 0, TAU); c.fill(); };
    const rock = (x, y, k, col) => { c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(x + 5 * k, y + 5 * k, 24 * k, 10 * k, 0, 0, TAU); c.fill();
      c.fillStyle = rgba(shade(col, .78)); c.beginPath(); c.moveTo(x - 24 * k, y + 4 * k); c.lineTo(x - 15 * k, y - 20 * k); c.lineTo(x + 4 * k, y - 28 * k); c.lineTo(x + 22 * k, y - 10 * k); c.lineTo(x + 25 * k, y + 5 * k); c.closePath(); c.fill();
      c.fillStyle = rgba(shade(col, 1.12)); c.beginPath(); c.moveTo(x - 15 * k, y - 20 * k); c.lineTo(x + 4 * k, y - 28 * k); c.lineTo(x + 2 * k, y - 8 * k); c.lineTo(x - 12 * k, y - 4 * k); c.closePath(); c.fill(); };
    const bush = (x, y, k, col) => { c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(x + 4 * k, y + 4 * k, 18 * k, 7 * k, 0, 0, TAU); c.fill();
      c.fillStyle = rgba(shade(col, .8)); c.beginPath(); c.arc(x - 8 * k, y - 4 * k, 11 * k, 0, TAU); c.fill(); c.fillStyle = rgba(col); c.beginPath(); c.arc(x + 4 * k, y - 8 * k, 13 * k, 0, TAU); c.fill(); c.fillStyle = rgba(shade(col, 1.2)); c.beginPath(); c.arc(x + 1 * k, y - 12 * k, 6 * k, 0, TAU); c.fill(); };
    for (const d of L.deco) {
      if (pf === 'maden') d.k < .7 ? rock(d.x, d.y, d.s, [142, 134, 122]) : bush(d.x, d.y, d.s * .7, [110, 124, 78]);
      else if (pf === 'odun') d.k < .78 ? tree(d.x, d.y, d.s * 1.15, d.k < .3) : rock(d.x, d.y, d.s * .6, [120, 122, 108]);
      else if (pf === 'bitki') d.k < .4 ? tree(d.x, d.y, d.s * .9, false) : bush(d.x, d.y, d.s, [98, 150, 84]);
      else if (pf === 'deri') d.k < .25 ? tree(d.x, d.y, d.s * .8, false) : d.k < .6 ? bush(d.x, d.y, d.s, [150, 150, 84]) : rock(d.x, d.y, d.s * .55, [156, 146, 120]);
      else { if (d.k < .45) rock(d.x, d.y, d.s, [96, 90, 112]);
        else if (d.k < .75) { c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(d.x + 6, d.y + 4, 16 * d.s, 7 * d.s, 0, 0, TAU); c.fill(); c.fillStyle = '#6a6480'; c.fillRect(d.x - 9 * d.s, d.y - 34 * d.s, 18 * d.s, 36 * d.s); c.fillStyle = '#8880a0'; c.fillRect(d.x - 9 * d.s, d.y - 34 * d.s, 6 * d.s, 36 * d.s); c.fillStyle = '#4e4a60'; c.fillRect(d.x - 12 * d.s, d.y - 38 * d.s, 24 * d.s, 6 * d.s); }
        else { c.strokeStyle = 'rgba(226,220,204,.6)'; c.lineWidth = 3; c.beginPath(); c.moveTo(d.x - 9, d.y); c.lineTo(d.x + 9, d.y - 4); c.stroke(); c.fillStyle = 'rgba(226,220,204,.7)'; for (const [ox, oy] of [[-10, 0], [10, -4]]) { c.beginPath(); c.arc(d.x + ox, d.y + oy - 1.6, 2.4, 0, TAU); c.arc(d.x + ox, d.y + oy + 1.6, 2.4, 0, TAU); c.fill(); } } }
    }
    // kenarlara doğru kararma
    for (const [x0, y0, x1, y1, rx, ry, rw, rh] of [[0, 0, 0, 150, 0, 0, FW, 150], [0, FH, 0, FH - 150, 0, FH - 150, FW, 150], [0, 0, 150, 0, 0, 0, 150, FH], [FW, 0, FW - 150, 0, FW - 150, 0, 150, FH]]) {
      g = c.createLinearGradient(x0, y0, x1, y1); g.addColorStop(0, 'rgba(6,8,6,.42)'); g.addColorStop(1, 'rgba(6,8,6,0)'); c.fillStyle = g; c.fillRect(rx, ry, rw, rh);
    }
    return cv;
  }
  const field = a => { const L = fieldLayout(a); return { kind: 'hero', L, fx: L.P.fx, paint: s => paintField(L, s) }; };

  const city = () => { const L = cityLayout(); return { kind: 'hero', L, fx: 'firefly', paint: s => paintCity(s) }; };
  const sea = area => { const L = seaLayout(area); return { kind: 'boat', L, fx: L.P.fx, paint: s => paintSea(L, s) }; };
  return { View, city, sea, field, seaLayout, fieldLayout, cityLayout, paintCity, rng, setReduced(v) { reduced = !!v; } };
})();
