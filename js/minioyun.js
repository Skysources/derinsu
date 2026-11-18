/* =========================================================
   DERİNSU — toplama mini oyunları (elle toplama)
   Her mesleğin kendi oyunu vardır; hepsi tek parmakla, kısa turlar hâlinde oynanır. Bir tur "need" isabet ister;
   tur bitince bir ürün gelir (hiç ıskalamadan ve hep tam isabetle biten tur kusursuzdur: +1 ürün).
     Madencilik  · Damar Vuruşu : ibre çubukta gidip gelir, damarın üstündeyken dokun (ortası tam isabet)
     Odunculuk   · Balta Ritmi  : çentik gövdenin hangi yanında çıktıysa o yana dokun (çabuk dokunuş tam isabet)
     Bitki       · Biçme        : parmağını otların üstünden geçir; kırmızı dikene değme
     Avcılık     · Nişan        : daralan halka hedefe oturduğu anda dokun
     Yaratık Avı · Düello       : okun gösterdiği yöne kaydır (çabuk kaydırış tam isabet)
   Mini.open(kap, meslek, { need(), win(kusursuz) → sürsün mü, quit(), haptic, color })
   Mini.close() · Mini.progress() (0..1: adadaki halka) · Mini.active
   ========================================================= */
window.Mini = (() => {
  'use strict';
  let box = null, st = null, raf = 0, game = null;
  const $q = (s, r) => r.querySelector(s), rnd = (a, b) => a + Math.random() * (b - a);
  const hap = p => { try { if (st && st.o.haptic) st.o.haptic(p); } catch (e) {} };
  const INFO = {
    maden: ['Damar Vuruşu', 'İbre damarın üstündeyken dokun', 'pick'], odun: ['Balta Ritmi', 'Çentiğin çıktığı yana dokun', 'axe'],
    bitki: ['Biçme', 'Parmağını otlardan geçir, dikene değme', 'sickle'], deri: ['Nişan', 'Halka hedefe oturunca dokun', 'knife'],
    yaratik: ['Düello', 'Okun gösterdiği yöne kaydır', 'swords'],
  };

  function pips() { $q('.mg-pips', box).innerHTML = Array.from({ length: st.need }, (_, i) => `<i class="${i < st.hits ? 'on' : ''}"></i>`).join(''); }
  function flash(cls) { const a = $q('.mg-a', box); a.classList.remove('ok', 'bad', 'gold'); void a.offsetWidth; a.classList.add(cls); }
  function note(t, gold) { const n = $q('.mg-note', box); n.textContent = t; n.classList.toggle('gold', !!gold); n.classList.remove('on'); void n.offsetWidth; n.classList.add('on'); }
  // isabet: tam isabet (perfect) değilse tur kusursuz sayılmaz. Tur dolunca oyun bir ürün verir.
  function hit(perfect) {
    if (!st) return;
    st.hits++; if (!perfect) st.clean = false; pips(); flash(perfect ? 'gold' : 'ok'); hap(perfect ? [6, 20, 6] : 8);
    if (st.hits < st.need) return;
    const clean = st.clean, o = st.o; st.hits = 0; st.clean = true;
    const more = o.win(clean);
    if (!st) return;
    if (!more) { close(); return; }
    st.need = o.need(); note(clean ? 'Kusursuz! +1' : 'Güzel', clean);
    setTimeout(() => { if (st) pips(); }, 240);
  }
  function miss() { if (!st) return; st.clean = false; st.hits = Math.max(0, st.hits - 1); pips(); flash('bad'); hap([18, 30, 18]); }

  const GAMES = {
    /* Damar Vuruşu: ibre gidip gelir; yeşil damarın içinde dokunuş isabet, altın çekirdeği tam isabet */
    maden(a, api) {
      a.innerHTML = `<div class="g-rock"><i></i><svg class="ic"><use href="#i-pick"/></svg></div><div class="g-bar"><i class="g-zone"><i></i></i><i class="g-mark"></i></div>`;
      const zone = $q('.g-zone', a), mark = $q('.g-mark', a), rock = $q('.g-rock', a), zw = .26; let x = 0, dir = 1, zx = .4;
      const place = () => { let n; do n = rnd(.04, .96 - zw); while (Math.abs(n - zx) < .16); zx = n; zone.style.left = (zx * 100) + '%'; zone.style.width = (zw * 100) + '%'; }; place();
      return { tick(dt) { x += dir * dt * 1.25; if (x > 1) { x = 1; dir = -1; } if (x < 0) { x = 0; dir = 1; } mark.style.left = (x * 100) + '%'; },
        tap() { const k = (x - zx) / zw; rock.classList.remove('hit'); void rock.offsetWidth; rock.classList.add('hit'); if (k >= 0 && k <= 1) { api.hit(Math.abs(k - .5) < .17); place(); } else api.miss(); } };
    },
    /* Balta Ritmi: çentik solda ya da sağda çıkar; aynı yana dokun. Yarım saniyeden çabuk dokunuş tam isabet */
    odun(a, api) {
      a.innerHTML = `<i class="g-side l">SOL</i><i class="g-side r">SAĞ</i><div class="g-trunk"><i class="g-notch"></i><svg class="ic g-axe"><use href="#i-axe"/></svg></div>`;
      const trunk = $q('.g-trunk', a); let side = '', t = 0, wait = 0;
      const next = () => { side = Math.random() < .5 ? 'l' : 'r'; t = 0; trunk.classList.remove('chop'); trunk.dataset.s = side; a.dataset.s = side; }; next();
      return { tick(dt) { if (wait > 0) { wait -= dt; if (wait <= 0) next(); return; } t += dt; if (t > 1.7) { api.miss(); wait = .2; trunk.dataset.s = ''; a.dataset.s = ''; } },
        tap(e) { if (wait > 0) return; const r = a.getBoundingClientRect(), s = e.clientX < r.left + r.width / 2 ? 'l' : 'r';
          if (s === side) { trunk.classList.add('chop'); api.hit(t < .5); wait = .2; } else { api.miss(); wait = .26; trunk.dataset.s = ''; a.dataset.s = ''; } } };
    },
    /* Biçme: parmağını sürükleyerek otları kes; kırmızı diken ıskadır ve otlar yeniden çıkar */
    bitki(a, api) {
      let stems = [], down = false, lx = 0, alive = true;
      const wave = () => { if (!alive) return; const n = Math.min(5, Math.max(2, api.left())), thorn = Math.random() < .7 ? Math.floor(Math.random() * (n + 1)) : -1, tot = n + (thorn >= 0 ? 1 : 0); stems = []; let h = '';
        for (let i = 0; i < tot; i++) { const th = i === thorn, x = (i + .5) / tot + rnd(-.035, .035), hh = rnd(.5, .86); stems.push({ x, th, cut: false, hh }); h += `<i class="g-stem ${th ? 'thorn' : ''}" style="left:${(x * 100).toFixed(1)}%;height:${(hh * 100).toFixed(0)}%"><b></b><em></em></i>`; }
        a.innerHTML = h + '<i class="g-sod"></i>'; };
      wave();
      const sweep = (x0, x1, y) => { const r = a.getBoundingClientRect(), a0 = (Math.min(x0, x1) - r.left) / r.width, a1 = (Math.max(x0, x1) - r.left) / r.width, yy = 1 - (y - r.top) / r.height; let bad = false;
        stems.forEach((s, i) => { if (s.cut || s.x < a0 - .03 || s.x > a1 + .03 || yy > s.hh + .1) return; s.cut = true; a.children[i].classList.add('cut'); if (s.th) bad = true; else api.hit(true); });
        if (bad) { api.miss(); setTimeout(wave, 280); } else if (stems.length && stems.every(s => s.cut || s.th)) { stems = []; setTimeout(wave, 220); } };
      return { tick() {}, down(e) { down = true; lx = e.clientX; sweep(lx, lx, e.clientY); }, move(e) { if (!down) return; sweep(lx, e.clientX, e.clientY); lx = e.clientX; }, up() { down = false; }, end() { alive = false; } };
    },
    /* Nişan: halka dışarıdan daralır; hedefin çemberine oturduğu anda dokun */
    deri(a, api) {
      a.innerHTML = `<i class="g-tgt"><svg class="ic"><use href="#i-knife"/></svg></i><i class="g-ring"></i>`;
      const tg = $q('.g-tgt', a), ring = $q('.g-ring', a); let s = 3, cool = 0;
      const place = () => { const x = rnd(15, 85), y = rnd(34, 66); tg.style.left = ring.style.left = x + '%'; tg.style.top = ring.style.top = y + '%'; reset(); }, reset = () => { s = 3; ring.style.transform = 'translate(-50%,-50%) scale(3)'; ring.classList.remove('near'); }; place();
      return { tick(dt) { if (cool > 0) { cool -= dt; return; } s -= dt * 1.9; if (s < .45) s = 3; ring.style.transform = `translate(-50%,-50%) scale(${s.toFixed(3)})`; ring.classList.toggle('near', Math.abs(s - 1) < .17); },
        tap() { if (cool > 0) return; const d = Math.abs(s - 1); if (d < .17) { api.hit(d < .07); place(); cool = .12; } else { api.miss(); reset(); cool = .22; } } };
    },
    /* Düello: yaratık bir yönden saldırır; okun yönüne kaydırarak karşıla. Süre dolarsa ıska */
    yaratik(a, api) {
      a.innerHTML = `<i class="g-foe"><svg class="ic"><use href="#i-swords"/></svg></i><i class="g-rune"><b></b></i><i class="g-time"><i></i></i>`;
      const rune = $q('.g-rune', a), bar = $q('.g-time i', a), D = ['u', 'r', 'd', 'l'], LIM = 1.9; let d = '', t = 0, wait = 0, p0 = null;
      const next = () => { let n; do n = D[Math.floor(Math.random() * 4)]; while (n === d); d = n; t = 0; rune.dataset.d = d; rune.classList.remove('ok', 'bad'); }; next();
      return { tick(dt) { if (wait > 0) { wait -= dt; if (wait <= 0) next(); return; } t += dt; bar.style.width = Math.max(0, 100 - t / LIM * 100) + '%'; if (t > LIM) { rune.classList.add('bad'); api.miss(); wait = .26; } },
        down(e) { p0 = [e.clientX, e.clientY]; },
        up(e) { if (!p0 || wait > 0) { p0 = null; return; } const dx = e.clientX - p0[0], dy = e.clientY - p0[1]; p0 = null; if (Math.hypot(dx, dy) < 16) return;
          const g = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u');
          if (g === d) { rune.classList.add('ok'); api.hit(t < .6); wait = .18; } else { rune.classList.add('bad'); api.miss(); wait = .26; } } };
    },
  };

  function open(el, prof, o) {
    close(); box = el; const I = INFO[prof];
    st = { prof, need: o.need(), hits: 0, clean: true, o };
    el.innerHTML = `<div class="mg-h"><span class="mg-ic"><svg class="ic"><use href="#i-${I[2]}"/></svg></span><span class="mg-t"><b>${I[0]}</b><small>${I[1]}</small></span><span class="mg-pips"></span><button class="mg-x" data-mx>Bırak</button></div>
      <div class="mg-a g-${prof}"></div><span class="mg-note"></span>`;
    el.className = 'mg on'; el.style.setProperty('--gc', o.color || '#e7c26a'); el.setAttribute('aria-hidden', 'false');
    const a = $q('.mg-a', el);
    game = GAMES[prof](a, { hit, miss, left: () => st ? st.need - st.hits : 0 });
    a.onpointerdown = e => { e.preventDefault(); try { a.setPointerCapture(e.pointerId); } catch (er) {} const g = game; if (!g) return; if (g.down) g.down(e); if (game === g && g.tap) g.tap(e); };      // bir isabet turu bitirip oyunu kapatabilir: sonraki adım aynı oyun içinse çalışır
    a.onpointermove = e => { if (game && game.move) game.move(e); };
    a.onpointerup = a.onpointercancel = e => { if (game && game.up) game.up(e); };
    $q('[data-mx]', el).onclick = () => { const q = st && st.o.quit; close(); if (q) q(); };
    pips();
    let last = performance.now();
    const loop = t => { if (!st || !game) return; const dt = Math.min(.05, (t - last) / 1000); last = t; game.tick(dt); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
  }
  function close() {
    cancelAnimationFrame(raf);
    if (game && game.end) game.end();
    if (box) { box.classList.remove('on'); box.setAttribute('aria-hidden', 'true'); }
    st = null; game = null;
  }
  return { open, close, progress: () => st ? st.hits / st.need : 0, get active() { return !!st; }, step: dt => { if (game) game.tick(dt); } };      // step: denemelerde oyunu elle ilerletmek için
})();
