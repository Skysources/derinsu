/* =========================================================
   DERİNSU — elle av ve yakalama mini oyunu: MAKARA ÇARKI
   Av kendiliğinden de sürer (oto); elle av çok daha hızlıdır ve oranları daha iyidir:
   · Beklerken Çek'e bas: yemi oynatırsın, balık hemen gelir (fightJig).
   · Şamandıra batınca Çek'e bas: çark açılır. İbre çarkta döner; yeşil yaydayken Çek'e basarsan balık bir güç
     yitirir, yayın altın göbeğine denk getirirsen iki. Iskalarsan misina gerilir ve balık bir güç toparlar;
     gerilim dolarsa balık kaçar. Gücü biten balık tekneye gelir.
   · Hiç ıskalamadan yakalamak "temiz"dir: seri artar (sonraki balık daha çabuk gelir, değer ve şans artar),
     kg bonusu verir. Bütün vuruşlar altınsa nadirlik bir kademe yükselebilir.
   Zorluk (fightDiff): nadirlik ve efsanevi tür artırır; oltanın kademesi bölgeden düşükse çok artar (yay daralır,
   ibre hızlanır, bir hata hakkı gider); oltanın kademesi ve nadirliği yüksekse azalır. Zorluk 1'i geçerse olta o
   balığı taşıyamaz: balık vurgunda koparıp gider.
   ========================================================= */
'use strict';
let fight = null;
const MANUAL = { luck: 30, comboLuck: 2, bite: .18, biteMin: 450, biteMax: 1300, comboSpd: .05, allGold: .25 };
const MG_LBL = [[.15, 'Kolay', '#9bd68f'], [.35, 'Orta', '#e7c26a'], [.6, 'Zor', '#e0853a'], [.85, 'Çok zor', '#e8474c'], [1, 'Neredeyse imkânsız', '#b9a6e6'], [9, 'İmkânsız', '#b9a6e6']];
function fightDiff(f, q) {
  const gap = spotById(f.spot).t - S.rod.t;
  let d = [0, .08, .18, .32, .48, .65][q] + (f.leg ? .2 : 0);
  d += gap > 0 ? .38 * gap : -.07 * Math.min(3, -gap);
  d -= (rodQ() - 1) * .25;
  return clamp(d, 0, 1.2);
}
const mgLabel = d => MG_LBL.find(x => d < x[0]);
// zorluktan çark ayarları: yay ve altın göbek (derece), ibre hızı (derece/sn), gereken güç, hata hakkı
function fightParams(d, under, leg) {
  const k = Math.min(d, 1);
  return { arc: lerp(80, 16, k) * (under ? .75 : 1), spd: lerp(210, 430, k) * (under ? 1.25 : 1), need: 2 + Math.round(k * 5) + (leg ? 1 : 0),
    miss: under ? 2 : 3, rev: .15 + .6 * k, drift: k > .3 ? (k - .3) * 80 : 0 };
}
const fightOn = () => !!fight;
const angDiff = (a, b) => ((a - b) % 360 + 540) % 360 - 180;

// beklerken Çek: yemi oynat, balık çabucak gelir (seri arttıkça daha da çabuk)
function fightJig() {
  const f = S.fishing, now = Date.now(); if (!f || f.jig) return false;
  const wait = clamp(castSec(seaSpot()) * 1000 * MANUAL.bite, MANUAL.biteMin, MANUAL.biteMax) * (1 - Math.min(S.combo, COMBO_MAX) * MANUAL.comboSpd);
  // vurgun anı öne gelir; atışın sonu (kendiliğinden çekiş) yerinde kalır: oynatıp bırakmak avı hızlandırmaz
  f.bite = Math.min(f.bite, (now + wait - f.t0) / f.dur);
  f.jig = true;
  const l = lineXY(); if (l && seaView) seaView.splash(l.x, l.y, 3, .4);
  floatTxt('Yemi oynattın', '#cfe6ea'); haptic(6);
  return true;
}

function startFight() {
  const sp = seaSpot(), now = Date.now(), luck = totalLuck(sp) + MANUAL.luck + Math.min(S.combo, COMBO_MAX) * MANUAL.comboLuck;
  const { f, q } = rollFish(sp, luck, now, false), d = fightDiff(f, q), under = spotById(f.spot).t > S.rod.t, Q = QUAL[q], known = !!S.dex[f.id];
  // olta bu balığı taşıyamaz: vurgunda koparıp gider
  if (d >= 1) {
    S.combo = 0; S.rod.dur = Math.max(0, S.rod.dur - 2);
    floatTxt('Koparıp gitti!', Q.c, true);
    toast(`${Q.name}${f.leg ? ' efsanevi' : ''} balık oltana fazla geldi`, { tone: 'warn', label: 'Olta yetmedi', sub: under ? 'bu su için daha üst kademe olta gerek' : 'daha güçlü ya da daha nadir bir olta gerek' });
    haptic([30, 40, 60]);
    if (S.rod.dur === 0) S.fishing.broken = true; else newCast(now);
    comboPop(); save(); renderAll(); return;
  }
  const P = fightParams(d, under, f.leg), C = 2 * Math.PI * 46;
  fight = { f, q, d, under, ...P, hp: P.need, miss0: 0, ang: Math.random() * 360, dir: Math.random() < .5 ? -1 : 1, dd: Math.random() < .5 ? -1 : 1,
    core: P.arc * .3, c: 0, gold: true, clean: true, idle: 0, lock: 0, t: 0, C };
  fight.c = fight.ang + fight.dir * (110 + Math.random() * 100);
  const [, lbl, lc] = mgLabel(d), el = $('#fight');
  el.innerHTML = `<div class="mg2" style="--qc:${Q.c}">
      <div class="mg2-dial"><svg viewBox="0 0 120 120" aria-hidden="true">
        <circle class="mg2-track" cx="60" cy="60" r="46"/>
        <circle class="mg2-arc" id="mgArc" cx="60" cy="60" r="46" stroke-dasharray="${(P.arc / 360 * C).toFixed(2)} ${C.toFixed(2)}"/>
        <circle class="mg2-core" id="mgCore" cx="60" cy="60" r="46" stroke-dasharray="${(fight.core / 360 * C).toFixed(2)} ${C.toFixed(2)}"/>
        <g id="mgNeedle"><path d="M60 22L60 12" class="mg2-nl"/><circle cx="60" cy="14" r="6.2" class="mg2-nd"/><circle cx="60" cy="14" r="2.4" class="mg2-nc"/></g>
      </svg><span class="mg2-fish"><img src="assets/items/fish/fish-t${f.img}.png" alt="" style="filter:hue-rotate(${f.hue || 0}deg) saturate(${f.sat || 1})${known ? '' : ' brightness(0)'}"></span></div>
      <div class="mg2-side">
        <small style="color:${Q.c}">${Q.name}${f.leg ? ' · efsanevi tür' : ''}</small>
        <b>${known ? f.name : '???'}</b>
        <em style="color:${lc}">${lbl}${under ? ' · oltan zayıf' : ''}</em>
        <span class="mg2-row"><i>Güç</i><span class="mg2-pips hp" id="mgHp">${'<u></u>'.repeat(P.need)}</span></span>
        <span class="mg2-row"><i>Gerilim</i><span class="mg2-pips st" id="mgSt">${'<u></u>'.repeat(P.miss)}</span></span>
        <span class="mg2-hint">İbre yeşildeyken <b>Çek</b> · altın göbek iki güç</span>
      </div></div>`;
  el.hidden = false; el.classList.remove('out'); void el.offsetWidth; el.classList.add('on');
  fightDraw(); fightPips();
  haptic([10, 30, 10]);
  if (q >= 3) floatTxt(`${Q.name}!`, Q.c, true, -10);
  fight.last = performance.now();
  requestAnimationFrame(fightStep);
}
function fightPips() {
  const F = fight; if (!F) return;
  $$('#mgHp u').forEach((u, i) => u.classList.toggle('on', i < F.hp));
  $$('#mgSt u').forEach((u, i) => u.classList.toggle('on', i < F.miss0));
}
function fightDraw() {
  const F = fight, a = $('#mgArc'), c = $('#mgCore'), n = $('#mgNeedle'); if (!F || !a) return;
  a.setAttribute('transform', `rotate(${(F.c - F.arc / 2 - 90).toFixed(2)} 60 60)`);
  c.setAttribute('transform', `rotate(${(F.c - F.core / 2 - 90).toFixed(2)} 60 60)`);
  n.setAttribute('transform', `rotate(${F.ang.toFixed(2)} 60 60)`);
  const dd = Math.abs(angDiff(F.ang, F.c));
  a.classList.toggle('in', dd <= F.arc / 2); c.classList.toggle('in', dd <= F.core / 2);
}
function fightStep(ts) {
  const F = fight; if (!F) return;
  const dt = Math.min(.05, (ts - F.last) / 1000); F.last = ts; F.t += dt; F.idle += dt; F.lock = Math.max(0, F.lock - dt);
  F.ang += F.dir * F.spd * dt; F.c += F.dd * F.drift * dt;
  fightDraw();
  if (seaView && Math.random() < dt * 4) { const l = lineXY(); if (l) seaView.splash(l.x, l.y, 1, .35); }
  if (F.idle > 4.5) { F.idle = 0; fightMiss('Balık silkindi'); if (!fight) return; }
  requestAnimationFrame(fightStep);
}
// yayı ibrenin önünde yeni bir yere koy; balık zorlandıkça ibre yön değiştirir ve hızlanır
function fightNext(hit) {
  const F = fight;
  if (hit && Math.random() < F.rev) F.dir = -F.dir;
  if (hit) F.spd *= 1.035;
  F.dd = Math.random() < .5 ? -1 : 1;
  F.c = F.ang + F.dir * (105 + Math.random() * 110);
  const a = $('#mgArc'); if (a) { a.classList.remove('pop'); void a.getBoundingClientRect(); a.classList.add('pop'); }
}
function fightFlash(k) { const el = $('#fight'); el.classList.remove('hit', 'gold', 'bad'); void el.offsetWidth; el.classList.add(k); }
function fightMiss(txt) {
  const F = fight; if (!F) return;
  F.miss0++; F.clean = false; F.gold = false; F.hp = Math.min(F.need, F.hp + 1); F.lock = .28;
  fightFlash('bad'); floatTxt(txt || 'Iska', '#ee9a86'); haptic(28); fightPips();
  if (F.miss0 >= F.miss) return endFight(false, F.under ? 'snap' : 'escape');
}
// Çek: ibre yaydaysa vuruş, altın göbekteyse çifte vuruş
function fightTap() {
  const F = fight; if (!F || F.lock > 0) return;
  F.idle = 0;
  const dd = Math.abs(angDiff(F.ang, F.c));
  if (dd > F.arc / 2) return fightMiss();
  const gold = dd <= F.core / 2;
  F.hp -= gold ? 2 : 1; if (!gold) F.gold = false; F.lock = .12;
  fightFlash(gold ? 'gold' : 'hit'); floatTxt(gold ? 'Mükemmel!' : 'İyi', gold ? '#f3c64a' : '#9bd68f', gold);
  haptic(gold ? [8, 20, 14] : 10);
  const l = lineXY(); if (l && seaView) seaView.splash(l.x, l.y, gold ? 7 : 4, gold ? .8 : .55);
  fightPips();
  if (F.hp <= 0) return endFight(true);
  fightNext(true);
}
function fightHold() { /* eski gerilim oyunundan: artık kullanılmıyor */ }
// sonuç: yakalanırsa av (temizse seri ve kg bonusu, hepsi altınsa nadirlik şansı), kaçarsa yeni atış
function endFight(win, why) {
  const F = fight; if (!F) return;
  fight = null;
  const el = $('#fight'); el.classList.remove('on'); el.classList.add('out'); setTimeout(() => { if (!fight) el.hidden = true; }, 260);
  const now = Date.now();
  if (!S.fishing) return;
  if (why === 'leave') { S.combo = 0; newCast(now); return; }
  if (win) {
    let q = F.q;
    if (F.gold && q < QUAL.length - 1 && Math.random() < MANUAL.allGold) { q++; setTimeout(() => floatTxt('Nadirlik yükseldi!', QUAL[q].c, true, -40), 300); }
    const r = doCatch(seaSpot(), F.clean, true, null, now, { f: F.f, q });
    if (r && seaView) { seaView.catchFx(r.f, QUAL[r.q].c, r.q); floatCatch(r, F.clean); }
    afterCatch(now, true);
    haptic(F.clean ? [8, 30, 12, 30, 16] : [8, 30, 12]);
  } else {
    S.combo = 0;
    S.rod.dur = Math.max(0, S.rod.dur - (why === 'snap' ? 4 : 1));
    if (S.rod.dur === 0) { S.fishing.broken = true; toast('Olta kırıldı', { tone: 'bad', label: 'Dayanıklılık', sub: 'envanterdeki Olta yuvasından onar' }); }
    else newCast(now);
    floatTxt(why === 'snap' ? 'Misina koptu!' : 'Balık kaçtı', '#ee9a86', true);
    if (why === 'snap') toast('Misina koptu', { tone: 'warn', label: F.q >= 2 ? `${QUAL[F.q].name} balık kaçtı` : 'Oltan bu suya zayıf', sub: 'olta −4 dayanıklılık' });
    haptic(40);
  }
  comboPop(); save(); renderAll();
}
