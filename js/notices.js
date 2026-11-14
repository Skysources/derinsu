/* Ada bildirimleri, seçenek B "Envanter Kartı" (IDLE SKY tasarım paketi, ada-bildirimi-b'nin betiğinden uyarlandı).
   Ada içeriğini değiştirmez, yalnız "açılır": levhası kartın genişliğine uzar ve kart adanın altından kayarak çıkar.
   En yeni bildirim adanın hemen altında tam kart olur, eskiler altında tek satıra katlanır (en çok 3).
   Destansı ve seviye atlama büyük kart olarak çıkar ve açılınca parlar. Aynı eşya kart ekrandayken gelirse orada birikir.

   Notices.init({ app, hud, island, haptic, onTap }) bir kez çağrılır.
   Notices.notify(n): n.type 'item' | 'find' | 'toast' | 'grand' | 'level'
     ortak: color, life, group (aynı gruptakiler toplanır)
     item/find: rarity, slot (çerçeve HTML'i), title, source, add, bagOf · ya da gear: true + sub (değer yerine ok)
     toast: tone 'info' | 'warn' | 'bad', html
     grand: rarity, slot, label, title, src, facts (HTML), done, action · level: art (resim yolu), label, title, done, action
   Notices.hold(true) yeni bildirimleri sıraya alır (ör. ada aşağı çekilmişken), hold(false) bırakır. */
window.Notices = (() => {
  'use strict';
  const LIFE = { white: 2800, green: 3200, blue: 4000, find: 4600, toast: 3400, orange: 6000, red: 8000, level: 5600 };
  const MIN_AFTER_HOLD = 1400;   // basılı tutulup bırakılan kart en az bu kadar kalır
  const GAP = 6, MINI_H = 36;
  const FULL_H = { item: 58, find: 62, toast: 48 };
  const MAX_CARDS = 3;           // bir tam kart + iki katlanmış satır; dördüncüsü en eskiyi iter
  const RAR = { white: 'Sıradan', green: 'Seçkin', blue: 'Nadir', orange: 'Destansı', red: 'Efsanevi', gold: 'Mitik' };
  const TONE = { info: 'Bilgi', warn: 'Uyarı', bad: 'Hata' };

  let cfg = null, slit, plate, rim, shn, mouth, qtxt;
  const cards = [], queue = [];
  let zSeq = 0, held = false, pumpT = 0;

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const fmt = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const isGrand = n => n.type === 'grand' || n.type === 'level';
  const live = () => cards.filter(c => !c.leaving);
  const CHEV = '<svg class="chev" viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>';
  // ton mühürleri: üç ayrı biçim ve işaret, ton yalnız renge kalmasın
  const SEAL = {
    info: '<circle class="sh" cx="15" cy="15" r="13"/><circle class="gd" cx="15" cy="9" r="1.9"/><path class="gl" d="M15 13.5 V21.5"/>',
    warn: '<path class="sh" d="M15 2.5 Q16.4 2.5 17.2 3.9 L28.3 23.6 Q29 25 27.6 26.4 Q27 27 26 27 H4 Q3 27 2.4 26.4 Q1 25 1.7 23.6 L12.8 3.9 Q13.6 2.5 15 2.5 Z"/><path class="gl" d="M15 10.5 V17.5"/><circle class="gd" cx="15" cy="22" r="1.8"/>',
    bad: '<path class="sh" d="M10 2 H20 L28 10 V20 L20 28 H10 L2 20 V10 Z"/><path class="gl" d="M10.5 10.5 L19.5 19.5 M19.5 10.5 L10.5 19.5"/>',
  };
  const seal = tone => `<span class="seal"><svg viewBox="0 0 30 30">${SEAL[tone]}</svg></span>`;
  const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <linearGradient id="medalGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1c4"/><stop offset=".5" stop-color="#e7c26a"/><stop offset="1" stop-color="#9a7428"/></linearGradient>
  </defs></svg>`;

  /* ---- adanın yeri: yarık adanın ilk satırının ortasından başlar, kartlar adanın alt kenarından 8 px aşağıda durur ---- */
  function geom() {
    const ar = cfg.app.getBoundingClientRect(), ir = cfg.island.getBoundingClientRect();
    return { top: ir.top - ar.top, left: ir.left - ar.left, w: ir.width, h: ir.height, cx: ir.left - ar.left + ir.width / 2 };
  }
  function place() {
    const g = geom(), st = g.top + 21;
    slit.style.top = st + 'px';
    mouth.style.top = (g.top + g.h - 10) + 'px';
    mouth.style.left = g.cx + 'px';
    return g.h + 8 - 21;           // kartların yarık içindeki başlangıcı
  }

  /* ---- kart ---- */
  function build(n) {
    const el = document.createElement('div');
    el.className = 'nt no-tr';
    let cls = 'nc', html = '';
    if (n.type === 'item' || n.type === 'find') {
      const r = n.rarity;
      cls += ` r-${r}${n.type === 'find' ? ' find' : ''}`;
      const label = n.label || (n.type === 'find' ? `${RAR[r]} Buluntu` : RAR[r]);
      const fx = r === 'blue' ? '<i class="ntw a"></i><i class="ntw b"></i><i class="ntw c"></i>' : '';
      const right = n.gear ? CHEV : `<span data-v>+${fmt(n.add)}</span><b class="rep" data-rep hidden>×1</b>`;
      html = `<span class="clip">${r === 'blue' ? '<i class="sweep"></i>' : ''}
        <span class="ff"><span class="cell">${n.type === 'find' ? '<i class="nburst"></i>' : ''}${n.slot}${fx}</span>
          <span class="tx"><span class="lab">${esc(label)}</span><span class="ttl">${esc(n.title)}</span><span class="sub" data-sub>${subOf(n)}</span></span>
          <span class="val">${right}</span></span>
        <span class="fm">${n.slot}<span class="nmt">${esc(n.title)}</span><span class="mv">${n.gear ? `<i style="font:600 11.5px var(--fs);color:var(--lab);letter-spacing:.06em">${esc(label)}</i>` : `<b class="rep" data-rep hidden>×1</b><span data-v>+${fmt(n.add)}</span>`}</span></span></span>`;
    } else if (n.type === 'toast') {
      cls += ` toast t-${n.tone}`;
      html = `<span class="clip"><span class="ff">${seal(n.tone)}<span class="tx"><span class="lab">${esc(n.label || TONE[n.tone])}</span><span class="msg">${n.html}</span></span></span>
        <span class="fm">${seal(n.tone)}<span class="nmt">${n.html}</span></span></span>`;
    } else {
      const lvl = n.type === 'level', r = lvl ? 'gold' : n.rarity;
      cls += ` grand r-${r}`;
      const nEmb = lvl ? 0 : 7;
      const embers = Array.from({ length: nEmb }, (_, i) => {
        const side = i % 2 ? 1 : -1;
        const x0 = side * (22 + Math.round(Math.abs(Math.sin(i * 2.4)) * 52)), x1 = x0 + side * Math.round(4 + Math.abs(Math.cos(i * 1.7)) * 16);
        return `<i class="nemb" style="--x0:${x0}px;--x1:${x1}px;--t:${((i * 0.237) % 1.7).toFixed(2)}s;--d:${(1.6 + (i * 0.41) % 1.1).toFixed(2)}s"></i>`;
      }).join('');
      const pic = lvl
        ? `<span class="medal"><svg viewBox="0 0 100 100"><circle class="bg" cx="50" cy="50" r="46"/><circle class="fg" cx="50" cy="50" r="46"/></svg>${n.art ? `<img src="${n.art}" alt="">` : n.artHtml || ''}</span>`
        : `<span class="cell big">${n.slot}</span>`;
      const check = '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
      const go = n.action ? `<span class="go">${esc(n.action)}<svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg></span>` : '';
      html = `<i class="gglow"></i>
        <span class="gdeco"><i class="halo"></i>${lvl ? '' : '<i class="rays"></i>'}<i class="nflash"></i>${embers}</span>
        <span class="ghd"><i class="rule"></i><b>${esc(n.label)}</b><i class="rule r"></i></span>
        <span class="gst">${pic}</span>
        <span class="gtl">${esc(n.title)}</span>
        ${n.src ? `<span class="gsrc">${esc(n.src)}</span>` : ''}
        ${n.facts ? `<span class="gfx">${n.facts}</span>` : ''}
        <span class="gac"><span class="ok">${lvl ? '' : check}${esc(n.done || '')}</span>${go}</span>`;
    }
    el.innerHTML = `<div class="${cls}">${html}</div>`;
    return el;
  }
  function subOf(n) {
    if (n.gear) return n.sub || '';
    return `${esc(n.source || '')}${n.bagOf !== undefined ? `${n.source ? ' · ' : ''}${n.where || 'çantada'} <b>${fmt(n.bagOf)}</b>` : ''}`;
  }

  /* ---- liste ---- */
  function layout() {
    let y = place(), first = true;
    for (const c of cards) {
      if (c.gone) continue;
      // ayakta kalan en yeni kart tam karttır; giden kart biçimini ve yerini korur
      const full = c.grand || (c.leaving ? !c.nc.classList.contains('mini') : first);
      if (!c.leaving) first = false;
      if (!c.grand) {
        c.nc.classList.toggle('mini', !full);
        c.h = full ? FULL_H[c.kind] : MINI_H;
        c.nc.style.height = c.h + 'px';
      }
      if (!c.up) c.el.style.setProperty('--y', y + 'px');
      y += c.h + GAP;
    }
    const n = queue.length;
    if (n) qtxt.textContent = `+${n} bildirim sırada`;
    qtxt.style.setProperty('--y', (y + 2) + 'px');
    qtxt.classList.toggle('on', n > 0 && !held);
  }

  /* ---- ada: levha kartın genişliğine açılır (yalnız levha, yazı ezilmez) ---- */
  // levha .hud içindedir: yeri adanın .hud'a göre konumu
  function fitPlate() {
    const hr = cfg.hud.getBoundingClientRect(), ir = cfg.island.getBoundingClientRect();
    Object.assign(plate.style, { left: (ir.left - hr.left) + 'px', top: (ir.top - hr.top) + 'px', width: ir.width + 'px', height: ir.height + 'px', borderRadius: getComputedStyle(cfg.island).borderRadius });
    return ir.width;
  }
  // levha yalnız canlandırma sürerken görünür (ada boyu değişince arkada uyumsuz kalmasın)
  const showPlate = ms => plate.animate([{ opacity: 1 }, { opacity: 1 }], { duration: ms, composite: 'add' });
  function islOpen(color, cardW, grand) {
    plate.style.setProperty('--pc', color); mouth.style.setProperty('--pc', color);
    const k = Math.max(1, (cardW + 8) / fitPlate()), dur = grand ? 1250 : 820;
    showPlate(grand ? 2200 : 1000);
    plate.animate([
      { transform: 'scaleX(1)', easing: 'cubic-bezier(.2,.9,.3,1.15)' },
      { transform: `scaleX(${k})`, offset: 200 / dur },
      { transform: `scaleX(${k})`, offset: (grand ? 700 : 380) / dur, easing: 'cubic-bezier(.3,1.25,.45,1)' },
      { transform: 'scaleX(1)' },
    ], { duration: dur });
    rim.animate([{ opacity: 0 }, { opacity: 1, offset: 0.2 }, { opacity: 0 }], { duration: grand ? 2200 : 1000, easing: 'ease-out' });
    shn.animate([{ transform: 'translateX(-120%)' }, { transform: 'translateX(260%)' }], { duration: 850, delay: 60, easing: 'cubic-bezier(.2,.9,.25,1)' });
    mouth.animate([{ opacity: 0, transform: 'scaleX(.5)' }, { opacity: grand ? 1 : 0.8, transform: `scaleX(${k * 0.9})`, offset: 0.35 }, { opacity: 0, transform: `scaleX(${k})` }],
      { duration: grand ? 1000 : 700, easing: 'ease-out' });
  }
  // yinelenen eşya ya da adaya geri dönen kart: yalnız kısa bir kenar ışığı
  function islBlink(color) {
    fitPlate(); plate.style.setProperty('--pc', color); showPlate(600);
    rim.animate([{ opacity: 0 }, { opacity: 0.8, offset: 0.25 }, { opacity: 0 }], { duration: 600, easing: 'ease-out' });
  }
  function islGulp(color, cardW) {
    plate.style.setProperty('--pc', color);
    const k = Math.max(1, (cardW + 8) / fitPlate());
    showPlate(650);
    plate.animate([{ transform: 'scaleX(1)' }, { transform: `scaleX(${Math.min(k, 1 + (k - 1) * 0.7)})`, offset: 0.35 }, { transform: 'scaleX(1)' }], { duration: 620, easing: 'cubic-bezier(.3,1.2,.45,1)' });
    rim.animate([{ opacity: 0 }, { opacity: 0.6, offset: 0.4 }, { opacity: 0 }], { duration: 650 });
  }

  function show(n) {
    const grand = isGrand(n);
    if (grand) for (const c of live()) dismiss(c, 'fade');       // sahne bir anda boşalır
    else { const lc = live(); if (lc.length >= MAX_CARDS) dismiss(lc[lc.length - 1], 'side'); }
    const el = build(n), nc = el.firstElementChild;
    const kind = n.type === 'toast' ? 'toast' : n.type === 'find' ? 'find' : 'item';
    const card = { n, el, nc, kind, grand, h: grand ? 0 : FULL_H[kind], leaving: false, gone: false, up: false, count: 1, total: n.add || 0, adds: [n.add], timer: 0, end: 0, left: 0 };
    el.style.zIndex = String(++zSeq);
    slit.appendChild(el);
    if (grand) { nc.style.setProperty('--rv', '0.56s'); card.h = nc.offsetHeight; }
    el.style.setProperty('--y', -(card.h + 8) + 'px');          // adanın altında gizli doğar, sonra kayar
    cards.unshift(card);
    void el.offsetWidth;
    el.classList.remove('no-tr');
    if (grand) el.classList.add('slow');
    nc.classList.add('in');
    islOpen(n.color, nc.offsetWidth, grand);
    layout();
    arm(card, n.life || LIFE[n.type === 'toast' ? 'toast' : n.type === 'level' ? 'level' : n.type === 'find' ? 'find' : n.rarity] || 3000);
    bindTouch(card);
    if (cfg.haptic) cfg.haptic(grand ? [20, 50, 25, 50, 35] : n.rarity === 'blue' ? [10, 30, 10] : 5);
  }

  /* ---- ömür (durdurulabilir) ---- */
  function arm(card, ms) { clearTimeout(card.timer); card.end = performance.now() + ms; card.timer = setTimeout(() => expire(card), ms); }
  function pause(card) { if (card.paused) return; card.paused = true; clearTimeout(card.timer); card.left = Math.max(0, card.end - performance.now()); card.nc.classList.add('nhold'); }
  function resume(card) { if (!card.paused || card.leaving) return; card.paused = false; card.nc.classList.remove('nhold'); arm(card, Math.max(card.left, MIN_AFTER_HOLD)); }
  // son kart adaya geri girer; başkaları varken kenara çekilir
  function expire(card) { dismiss(card, live().length === 1 && live()[0] === card ? 'up' : 'side'); }

  function dismiss(card, mode, dx = 0) {
    if (card.leaving) return;
    card.leaving = true;
    clearTimeout(card.timer);
    const nc = card.nc;
    nc.classList.remove('nhold');
    let ms = 300;
    if (mode === 'up') {
      card.up = true;
      card.el.style.transitionDelay = '0s';
      card.el.classList.remove('slow'); card.el.classList.add('up');
      card.el.style.setProperty('--y', -(card.h + 8) + 'px');
      if (card.grand) nc.classList.add('out-up');
      setTimeout(() => islGulp(card.n.color, nc.offsetWidth), 200);
      ms = 430;
    } else if (mode === 'lift') {
      // yukarı itilen kart parmağın bıraktığı yerden yukarı uçar ve söner
      const cur = parseFloat((nc.style.translate || '0 0').split(' ')[1]) || 0;
      nc.animate([{ translate: `0 ${cur}px`, opacity: 1 }, { translate: `0 ${cur - 90}px`, opacity: 0 }], { duration: 260, easing: 'cubic-bezier(.3,.6,.6,1)', fill: 'forwards' });
      ms = 260;
    } else if (mode === 'fling') {
      const cur = parseFloat(nc.style.translate) || dx;
      nc.animate([{ translate: `${cur}px 0`, opacity: nc.style.opacity || 1 }, { translate: `${Math.sign(dx || 1) * 380}px 0`, opacity: 0 }], { duration: 240, easing: 'cubic-bezier(.3,.6,.6,1)', fill: 'forwards' });
      ms = 240;
    } else {
      nc.classList.remove('in'); void nc.offsetWidth;
      nc.classList.add(mode === 'fade' ? 'out-fade' : 'out-side');
      ms = mode === 'fade' ? 240 : 300;
    }
    pump();
    setTimeout(() => {
      card.gone = true; card.el.remove();
      cards.splice(cards.indexOf(card), 1);
      if (!cards.length) zSeq = 0;
      layout(); pump();
    }, ms + 10);
  }

  // sıradakiler (büyük kart görünürken ya da ada tutulurken bekleyenler) art arda girer
  function pump() {
    if (pumpT || !queue.length || held || live().some(c => c.grand)) { layout(); return; }
    show(queue.shift());
    if (queue.length) pumpT = setTimeout(() => { pumpT = 0; pump(); }, 260);
  }

  function notify(n) {
    if (!cfg) return;
    // aynı eşya kartı ekrandayken yine gelirse orada sayılır ve ömrü baştan başlar
    if (n.group) {
      const c = live().find(x => x.n.group === n.group);
      if (c && !held) { addUp(c, n); return; }
      const q = queue.find(x => x.group === n.group);
      if (q) { q.count = (q.count || 1) + 1; q.addsQ = (q.addsQ || [q.add]).concat(n.add); q.bagOf = n.bagOf; layout(); return; }
    }
    if (held || live().some(c => c.grand)) {
      if (queue.length > 8) queue.splice(queue.findIndex(x => !isGrand(x)) >>> 0, 1);
      queue.push(n); layout(); return;
    }
    show(n);
    if (n.count > 1) for (let i = 1; i < n.count; i++) addUp(live()[0], { ...n, add: n.addsQ[i] }, true);
  }
  function addUp(c, n, quiet) {
    c.count += 1; c.total += n.add; c.adds.push(n.add);
    const same = c.adds.every(a => a === c.adds[0]);
    // her yineleme aynı adeti getirdikçe "+4 ×3", değilse toplam "+11 ×3"
    const v = same ? c.adds[0] : c.total;
    for (const e of c.nc.querySelectorAll('[data-v]')) e.textContent = '+' + fmt(v);
    for (const e of c.nc.querySelectorAll('[data-rep]')) { e.textContent = '×' + c.count; e.hidden = false; }
    c.n.bagOf = n.bagOf;
    const sub = c.nc.querySelector('[data-sub]'); if (sub) sub.innerHTML = subOf(c.n);
    if (quiet) return;
    for (const e of [...c.nc.querySelectorAll('[data-rep], .val, .ff .cell')]) { e.classList.remove('bump'); void e.offsetWidth; e.classList.add('bump'); }
    if (!c.paused) arm(c, c.n.life || LIFE[c.n.rarity] || 3000);
    islBlink(c.n.color);
  }

  /* ---- dokunma: dokun açar, basılı tut durdurur, yana kaydır ya da yukarı it kapatır ---- */
  function bindTouch(card) {
    const nc = card.nc;
    let p = null;
    nc.addEventListener('pointerenter', e => { if (e.pointerType === 'mouse') pause(card); });
    nc.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse' && !p) resume(card); });
    nc.addEventListener('pointerdown', e => {
      if (card.leaving || p) return;
      try { nc.setPointerCapture(e.pointerId); } catch (er) {}
      p = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), dx: 0, dy: 0, axis: '' };
      nc.style.transition = 'none';
      pause(card);
    });
    nc.addEventListener('pointermove', e => {
      if (!p || e.pointerId !== p.id) return;
      p.dx = e.clientX - p.x; p.dy = e.clientY - p.y;
      if (!p.axis && Math.hypot(p.dx, p.dy) > 8) p.axis = Math.abs(p.dx) > Math.abs(p.dy) ? 'x' : 'y';
      if (p.axis === 'x') { nc.style.translate = `${p.dx}px 0`; nc.style.opacity = String(1 - Math.min(Math.abs(p.dx) / 260, 0.6)); }
      else if (p.axis === 'y') { const d = Math.min(0, p.dy) + Math.max(0, p.dy) * 0.15; nc.style.translate = `0 ${d}px`; nc.style.opacity = String(1 - Math.min(Math.max(0, -p.dy) / 160, 0.5)); }
    });
    const reset = () => {
      nc.style.transition = 'translate 0.4s cubic-bezier(.3,1.3,.45,1), opacity 0.25s, height 0.44s cubic-bezier(.25,1.12,.4,1), box-shadow .25s';
      nc.style.translate = ''; nc.style.opacity = '';
      setTimeout(() => { nc.style.transition = ''; }, 420);
    };
    const end = (e, ok) => {
      if (!p || e.pointerId !== p.id) return;
      const q = p; p = null;
      const dt = Math.max(1, performance.now() - q.t);
      if (q.axis === 'x' && (Math.abs(q.dx) > 70 || Math.abs(q.dx) / dt > 0.5)) { dismiss(card, 'fling', q.dx); return; }
      // yukarı it: hangi kart olursa olsun kapanır (en yenisi adaya geri girer, diğerleri yukarı uçar)
      if (q.axis === 'y' && (q.dy < -22 || q.dy / dt < -0.35)) {
        if (live()[0] === card && live().length === 1) { reset(); dismiss(card, 'up'); } else dismiss(card, 'lift');
        return;
      }
      reset();
      if (ok && !q.axis && dt < 450) { activate(card); return; }
      if (e.pointerType !== 'mouse' || !nc.matches(':hover')) resume(card);
    };
    nc.addEventListener('pointerup', e => end(e, true));
    nc.addEventListener('pointercancel', e => end(e, false));
  }
  function activate(card) {
    if (card.n.type !== 'toast' && cfg.onTap) cfg.onTap(card.n);
    dismiss(card, live()[0] === card && live().length === 1 ? 'up' : 'side');
  }

  function init(c) {
    cfg = c;
    document.body.insertAdjacentHTML('beforeend', DEFS);
    plate = document.createElement('span'); plate.className = 'isl-plate nb-plate';
    plate.innerHTML = '<i class="isl-rim"></i><span class="isl-shn"><i></i></span>';
    rim = plate.firstElementChild; shn = plate.lastElementChild.firstElementChild;
    c.hud.insertBefore(plate, c.hud.firstChild);
    mouth = document.createElement('i'); mouth.className = 'nb-mouth';
    slit = document.createElement('div'); slit.className = 'nb-slit';
    qtxt = document.createElement('div'); qtxt.className = 'qtxt';
    slit.appendChild(qtxt);
    c.app.appendChild(mouth); c.app.appendChild(slit);
    // ada uzayıp kısalınca (iş satırı, ayrıntı) kartlar adanın yeni alt kenarına kayar, üst üste binmez
    if (window.ResizeObserver) new ResizeObserver(() => { if (cards.length) layout(); }).observe(c.island);
  }
  function hold(on) { held = !!on; if (!held) pump(); else layout(); }
  function clear() { for (const c of live()) dismiss(c, 'fade'); queue.length = 0; layout(); }
  return { init, notify, hold, clear, LIFE, get count() { return live().length + queue.length; } };
})();
