/* =========================================================
   DERİNSU — dünya: toplama bölgeleri ve meslekler
   Şehirden çıkınca dünya haritası açılır: Maden Ocağı, Ulu Orman, Çiçekli Çayır, Av Sahası, Kadim Harabeler ve Kıyı.
   Kıyı balıkçılıktır (izinli alanlar, açık deniz, makara çarkı). Diğer beşi aynı döngüyle çalışır:
   bölgeye gir → bir düğüme dokun → kahraman gider ve toplar (kendiliğinden); büyük düğmeye her dokunuş işi hızlandırır.
   Düğümün bir niteliği (rengi) ve belli sayıda ürünü vardır; tükenince yerine yenisi çıkar.
   Her mesleğin bir aleti vardır (kademe I–V): alet, kendi kademesinin bir üstündeki sahaya kadar izin verir.
   Durum: S.tools[meslek] = { t } · S.field = { prof, t, nodes, resp, pos } · S.work = { i, walk, wait, t0, dur }
   ========================================================= */
'use strict';
const TOOL_PRE = ['', 'Kaba', 'Bakır', 'Demir', 'Çelik', 'Kadim'];
const PROFS = {
  maden: { id: 'maden', name: 'Madencilik', region: 'Maden Ocağı', sub: 'Dağ eteğindeki cevher damarları', verb: 'Kaz', doing: 'kazılıyor', tool: 'Kazma', timg: 'pickaxe', res: 'cevher', rimg: 'ore', art: 'maden', c: '#c98a66',
    names: ['Bakır Cevheri', 'Demir Cevheri', 'Gümüş Cevheri', 'Altın Cevheri', 'Yıldız Demiri Cevheri'], nodes: ['Bakır Damarı', 'Demir Damarı', 'Gümüş Damarı', 'Altın Damarı', 'Yıldız Demiri Damarı'],
    find: { id: 'mucevher', name: 'Ham Mücevher', c: '#8fd0e8', img: 'ham-mucevher', desc: 'Damarın içinden çıkan ham taş.' } },
  odun: { id: 'odun', name: 'Odunculuk', region: 'Ulu Orman', sub: 'Yaşlı ağaçlar ve kütükler', verb: 'Kes', doing: 'kesiliyor', tool: 'Balta', timg: 'axe', res: 'odun', rimg: 'wood', art: 'odun', c: '#c9a26b',
    names: ['Huş Odunu', 'Çam Odunu', 'Meşe Odunu', 'Sedir Odunu', 'Çınar Odunu'], nodes: ['Huş Ağacı', 'Çam Ağacı', 'Meşe Ağacı', 'Sedir Ağacı', 'Ulu Çınar'],
    find: { id: 'recine', name: 'Reçine', c: '#e8b04f', img: 'recine', desc: 'Ağacın gövdesinden sızan kehribar damla.' } },
  bitki: { id: 'bitki', name: 'Bitki Toplama', region: 'Çiçekli Çayır', sub: 'Şifalı otlar ve nadir çiçekler', verb: 'Topla', doing: 'toplanıyor', tool: 'Orak', timg: 'sickle', res: 'ot', rimg: 'herb', art: 'ot', c: '#8fcf7f',
    names: ['Kekik', 'Adaçayı', 'Gece Sefası', 'Altın Kök', 'Anka Çiçeği'], nodes: ['Kekik Öbeği', 'Adaçayı Öbeği', 'Gece Sefası', 'Altın Kök', 'Anka Çiçeği'],
    find: { id: 'tohum', name: 'Şifalı Tohum', c: '#b7e08a', img: 'sifali-tohum', desc: 'Otların arasından çıkan ender bir tohum.' } },
  deri: { id: 'deri', name: 'Avcılık', region: 'Av Sahası', sub: 'Av hayvanları ve postları', verb: 'Avla', doing: 'avlanıyor', tool: 'Av Bıçağı', timg: 'knife', res: 'post', rimg: 'hide', art: 'deri', c: '#b98a5e',
    names: ['Tavşan Postu', 'Geyik Postu', 'Kurt Postu', 'Ayı Postu', 'Ejder Derisi'], nodes: ['Tavşan Sürüsü', 'Geyik Sürüsü', 'Kurt Sürüsü', 'Ayı İni', 'Ejder Yuvası'],
    find: { id: 'kalinderi', name: 'Kalın Deri', c: '#d09a6a', img: 'kalin-deri', desc: 'Avdan çıkan kalın, sağlam bir deri parçası.' } },
  yaratik: { id: 'yaratik', name: 'Yaratık Avı', region: 'Kadim Harabeler', sub: 'Harabelerde dolaşan yaratıklar', verb: 'Vur', doing: 'dövüşülüyor', tool: 'Kılıç', timg: 'sword', res: 'ganimet', rimg: null, art: null, c: '#b9a6e6',
    names: ['Balçık Özü', 'Kurt Özü', 'İskelet Özü', 'Trol Özü', 'Hayalet Özü'], nodes: ['Balçık', 'Yaban Kurdu', 'İskelet', 'Trol', 'Hayalet'],
    find: { id: 'ktoz', name: 'Kadim Toz', c: '#d0b8ff', path: 'loot/toz-buyuk', desc: 'Yaratıktan geriye kalan parıltılı toz.' } },
};
const PROF_IDS = Object.keys(PROFS);
const REGIONS = [...PROF_IDS, 'balik'];
const NODE_Q = [      // düğüm niteliği: p çıkma olasılığı · n ürün sayısı · dbl çift ürün şansı · find nadir buluntu şansı (%)
  { name: 'Sıradan', q: 0, p: 50, n: 10, dbl: 0, find: 2 }, { name: 'Bereketli', q: 1, p: 30, n: 8, dbl: 12, find: 5 },
  { name: 'Zengin', q: 2, p: 14, n: 7, dbl: 28, find: 10 }, { name: 'Eşsiz', q: 3, p: 6, n: 5, dbl: 55, find: 22 },
];
const FIELD_N = 9, FIELD_LIVE = 6, FIELD_RESP = [20, 60];      // saha ekranında 3 × 3 düğüm kartı
const G_SEC = [0, 5, 7, 9, 11, 14], G_XP = [0, 6, 9, 13, 18, 25], G_VAL = [0, 8, 60, 500, 4000, 30000];
const TOOL_COST = [0, 0, 1800, 25000, 300000, 3000000], BOOST = .14;
/* Sahalar: her bölgede FAREA_N (12) saha vardır. Her saha rastgele bir kademe (I–V) ve rastgele bir nitelikle (renk) çıkar;
   FAREA_MIN dakikada bir, kaydırmalı yenilenir (adı, yerleşimi, kademesi ve niteliği değişir). İçerideyken süre dolsa da iş sürer.
   İlk saha hep I., ikincisi I. ya da II. kademedir: en düşük aletle de girilecek saha hep bulunur. */
const FAREA_N = 6, FAREA_MIN = 30, FAREA_STEP = FAREA_MIN * 60e3 / FAREA_N;
const FIELD_Q = [      // sahanın niteliği (rengi, düğüm nitelikleriyle aynı adlar): p çıkma olasılığı · dbl çift ürün şansına eklenir · rich nitelikli düğüm çarpanı · find buluntu çarpanı
  { name: 'Sıradan', p: 50, dbl: 0, rich: 1, find: 1 }, { name: 'Bereketli', p: 30, dbl: 10, rich: 1.3, find: 1 },
  { name: 'Zengin', p: 14, dbl: 20, rich: 1.7, find: 1.5 }, { name: 'Eşsiz', p: 6, dbl: 35, rich: 2.3, find: 2 },
];
const fieldQText = q => q ? `nitelikli düğüm ×${fmtDec(FIELD_Q[q].rich)} · çift ürün +%${FIELD_Q[q].dbl}${FIELD_Q[q].find > 1 ? ` · buluntu ×${fmtDec(FIELD_Q[q].find)}` : ''}` : '';
const FIELD_NAMES = {
  maden: ['Kızıl Yar', 'Çatlak Kaya', 'Derin Ocak', 'Karga Geçidi', 'Eski Galeri', 'Tuzlu Mağara', 'Yankı Kuyusu', 'Demirci Yarığı', 'Kör Kuyu', 'Paslı Tünel', 'Göçük Ağzı', 'Kartal Yarı', 'Sarp Bayır', 'Taş Ocağı'],
  odun: ['Yaşlı Koru', 'Sisli Açıklık', 'Kurt Patikası', 'Mantarlı Vadi', 'Gölge Koru', 'Oduncu Yolu', 'Yosunlu Dere', 'Rüzgârlı Sırt', 'Baykuş Koru', 'Devrik Kütük', 'Karanlık Orman', 'Ardıç Tepesi', 'Sincap Yolu', 'Kozalaklı Düz'],
  bitki: ['Arı Yamacı', 'Çiğli Düzlük', 'Kelebek Çayırı', 'Güneşli Bayır', 'Pınar Başı', 'Lavanta Sırtı', 'Yonca Tarlası', 'Sessiz Vadi', 'Papatya Düzü', 'Nane Deresi', 'Gelincik Tarlası', 'Sarı Yamaç', 'Çoban Çayırı', 'Kekikli Tepe'],
  deri: ['Tavşan Tepesi', 'Geyik Geçidi', 'Sazlık Kenarı', 'Kurak Bozkır', 'İz Süren Vadi', 'Çalılık Sırt', 'Kaya Dibi', 'Dikenli Düzlük', 'Tilki İni', 'Su Başı', 'Kuru Dere', 'Çakal Yolu', 'Yaban Düzü', 'Pusu Tepesi'],
  yaratik: ['Yıkık Tapınak', 'Sütunlu Avlu', 'Karanlık Mahzen', 'Kırık Kemer', 'Lanetli Çarşı', 'Unutulmuş Sunak', 'Çökük Kule', 'Sisli Mezarlık', 'Gölgeli Geçit', 'Paslı Kapı', 'Sessiz Hamam', 'Kemik Çukuru', 'Yarım Kubbe', 'Soğuk Dehliz'],
};
function fieldAreaAt(prof, i, now = Date.now()) {
  const pi = PROF_IDS.indexOf(prof), per = FAREA_MIN * 60e3, shift = i * FAREA_STEP + pi * 97e3, p = Math.floor((now + shift) / per), r = rng(p * 6151 + pi * 7919 + i * 104729 + 11);
  r(); let t, q = 0, x = r() * 100;
  if (i === 0) t = 1; else if (i === 1) t = x < 50 ? 1 : 2; else { t = 5; for (let k = 0; k < 5; k++) if ((x -= AREA_TIER_W[k]) < 0) { t = k + 1; break; } }
  x = r() * 100; for (let k = 0; k < FIELD_Q.length; k++) if ((x -= FIELD_Q[k].p) < 0) { q = k; break; }
  const names = FIELD_NAMES[prof];
  return { id: `${prof}-${i}-${p}`, slot: i, prof, t, q, name: names[Math.floor(r() * names.length)], seed: (p % 9973) * 37 + pi * 613 + i * 71 + t * 7 + 3, until: (p + 1) * per - shift };
}
function fieldAreas(prof, now = Date.now()) {
  const list = Array.from({ length: FAREA_N }, (_, i) => fieldAreaAt(prof, i, now)), used = new Set(), names = FIELD_NAMES[prof];
  for (const a of list) { let k = names.indexOf(a.name), n = 0; while (used.has(a.name) && n++ < names.length) { k = (k + 1) % names.length; a.name = names[k]; } used.add(a.name); }      // aynı adlı iki saha olmasın
  return list;
}
const fieldQ = () => FIELD_Q[(S.field && S.field.q) || 0];

/* ---------- eşyalar: hammaddeler ve nadir buluntular ---------- */
// resimler Astralis'in ikon paketinden: hammaddeler assets/items/<tür>, yaratık özleri kut, ender buluntular finds ve loot
const KUT = [null, 'kt3', 'kt6', 'kt9', 'kt12', 'kt15'];
for (const p of Object.values(PROFS)) {
  for (let t = 1; t <= 5; t++) ITEMS[p.res + t] = { id: p.res + t, name: p.names[t - 1], t, kind: 'Hammadde', q: 0, raw: p.id, val: G_VAL[t],
    img: p.rimg ? `assets/items/${p.rimg}/${p.rimg}-t${t}.png` : `assets/items/kut/${KUT[t]}.png` };
  ITEMS[p.find.id] = { id: p.find.id, name: p.find.name, t: 0, kind: 'Nadir buluntu', q: 2, img: `assets/items/${p.find.path || 'finds/' + p.find.img}.png`, raw: p.id, val: 400, rawFind: true };
}
const toolName = (prof, t) => `${TOOL_PRE[t]} ${PROFS[prof].tool}`;
const toolImg = (prof, t) => `<img src="assets/items/${PROFS[prof].timg}/${PROFS[prof].timg}-t${t}.png" alt="">`;

/* ---------- yaratık çizimleri (düğüm ölçüsü: taban 0,0 · viewBox -32 -50 64 64) ---------- */
const MOB_SVG = [null,
  '<g class="breath"><path d="M-17 0Q-19 -17 -6 -22Q0 -27 7 -22Q19 -17 17 0Z" fill="#5fb85a"/><path d="M-12 -3Q-13 -15 -4 -19" stroke="#a8e89a" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/><circle cx="-5" cy="-11" r="2.6" fill="#132a14"/><circle cx="6" cy="-11" r="2.6" fill="#132a14"/><path d="M-4 -5Q1 -2 6 -5" stroke="#132a14" stroke-width="1.6" fill="none"/></g>',
  '<g class="breath"><path d="M-20 0V-10Q-18 -20 -6 -20H8L14 -27L16 -19Q22 -16 22 -9L15 -6V0H9V-6H-9V0Z" fill="#6f6a66"/><path d="M-20 -10Q-27 -15 -25 -22Q-19 -18 -17 -13Z" fill="#57524f"/><path d="M8 -20L14 -27L16 -19Z" fill="#8a8480"/><circle cx="15" cy="-14" r="1.6" fill="#ffd27a"/><path d="M16 -9L22 -9L18 -6Z" fill="#f2ead8"/></g>',
  '<g class="breath"><path d="M-3 0V-12M3 0V-12" stroke="#e6dfd0" stroke-width="3" stroke-linecap="round"/><path d="M-9 -12H9L7 -25H-7Z" fill="#d8d0be"/><path d="M-6 -15H6M-6 -19H6M-5 -23H5" stroke="#8a8272" stroke-width="1.4"/><path d="M-9 -24L-16 -13M9 -24L17 -15" stroke="#e6dfd0" stroke-width="2.6" stroke-linecap="round"/><circle cx="0" cy="-32" r="7.4" fill="#ece6d6"/><circle cx="-3" cy="-33" r="2" fill="#1a1620"/><circle cx="3" cy="-33" r="2" fill="#1a1620"/><path d="M-3 -28h6" stroke="#1a1620" stroke-width="1.4"/><path d="M17 -15L24 -36" stroke="#9aa0a8" stroke-width="2.4" stroke-linecap="round"/></g>',
  '<g class="breath"><path d="M-12 0V-8Q-20 -12 -19 -26Q-17 -38 -3 -39Q11 -39 16 -29Q21 -17 12 -8V0H5V-7H-5V0Z" fill="#6f8a5a"/><path d="M-19 -24Q-27 -22 -26 -12L-21 -10Z" fill="#5a7448"/><path d="M16 -27Q25 -24 23 -13L18 -12Z" fill="#5a7448"/><path d="M-9 -26Q-3 -30 3 -26" stroke="#2a3a20" stroke-width="2" fill="none"/><circle cx="-7" cy="-29" r="2" fill="#ffd27a"/><circle cx="4" cy="-29" r="2" fill="#ffd27a"/><path d="M-6 -20L-4 -16M2 -20L0 -16" stroke="#f2ead8" stroke-width="2.4" stroke-linecap="round"/><path d="M23 -13L29 -36" stroke="#6a4a2c" stroke-width="4" stroke-linecap="round"/><circle cx="29" cy="-38" r="5.4" fill="#57524f"/></g>',
  '<g class="drift slow"><path d="M-14 0Q-10 -6 -6 0Q-2 -6 2 0Q6 -6 10 0Q14 -6 15 -4Q18 -22 12 -33Q6 -42 -2 -41Q-14 -40 -16 -26Q-18 -12 -14 0Z" fill="#b9a6e6" opacity=".88"/><path d="M-9 -14Q-12 -28 -4 -35" stroke="#e8e0ff" stroke-width="3" fill="none" stroke-linecap="round" opacity=".6"/><ellipse cx="-5" cy="-26" rx="2.6" ry="3.6" fill="#241a40"/><ellipse cx="5" cy="-26" rx="2.6" ry="3.6" fill="#241a40"/><ellipse cx="0" cy="-17" rx="3" ry="4" fill="#241a40"/></g>'];
const mobSvg = (t, cls = '') => `<svg class="nd n-mob t${t} ${cls}" viewBox="-32 -50 64 64" aria-hidden="true"><ellipse cx="0" cy="1" rx="22" ry="7" fill="rgba(0,0,0,.28)"/><ellipse class="ring" cx="0" cy="1" rx="26" ry="10" fill="none"/>${MOB_SVG[t]}</svg>`;
const nodeSvg = (prof, t, cls) => PROFS[prof].art ? LandNode.svg(PROFS[prof].art, t, cls) : mobSvg(t, cls);

/* ---------- durum ve kurallar ---------- */
function ensureWorld() {
  if (!S.tools) S.tools = {};
  for (const id of PROF_IDS) if (!S.tools[id]) S.tools[id] = { t: 1 };
  if (S.field === undefined) S.field = null;
  if (S.work === undefined) S.work = null;
  if (S.loc === 'field' && !S.field) S.loc = 'city';
  if (S.loc !== 'field') S.work = null;
  if (S.field && !S.field.id) { S.field.id = 'eski'; S.field.name = ''; }
  if (S.field && S.field.q === undefined) S.field.q = 0;
  if (S.work && S.work.man) S.work = null;      // elle toplama yalnız oyun açıkken sürer      // dönen sahalardan önceki kayıt
  // eski buluntu adları (resimler Astralis paketine geçince)
  for (const [o, n] of [['boynuz', 'kalinderi'], ['tilsimp', 'ktoz']]) if (S.box[o]) { S.box[n] = (S.box[n] || 0) + S.box[o]; delete S.box[o]; }
}
const toolT = prof => S.tools[prof].t;
const canField = (prof, t) => t <= toolT(prof) + 1;
const gatherSec = (prof, t) => G_SEC[t] * (toolT(prof) >= t ? Math.pow(.85, toolT(prof) - t) : 2) / (1 + (S.lvl - 1) * LVL_SPD / 100) / (S.devSpd || 1);
// rich: nitelikli (Bereketli ve üstü) düğümlerin payı bu kat artar, Sıradan'ın payı o kadar azalır
function rollNode(rich = 1) { let x = Math.random() * 100; for (const q of [...NODE_Q].reverse()) if (q.q > 0 && (x -= q.p * rich) < 0) return { q: q.q, left: q.n, max: q.n }; return { q: 0, left: 10, max: 10 }; }
/* İki toplama yolu: OTO (kahraman kendi toplar) ve ELLE (mini oyun). Oto, elle toplamanın üç katı sürer:
   elle bir ürün ≈ gatherSec × MAN_K saniyelik bir mini oyun turudur (isabet başına ~HIT_SEC sn), oto bir ürün gatherSec × AUTO_K. */
const AUTO_K = 1.5, MAN_K = .5, HIT_SEC = .95;
const workSec = () => gatherSec(S.field.prof, S.field.t) * AUTO_K;
const manHits = () => clamp(Math.round(gatherSec(S.field.prof, S.field.t) * MAN_K / HIT_SEC), 2, 9);
function enterField(a, now = Date.now()) {
  if (S.loc === 'sea') { S.fishing = null; S.combo = 0; }
  S.loc = 'field';
  if (S.field && S.field.id === a.id) return;
  const rich = FIELD_Q[a.q || 0].rich, idx = Array.from({ length: FIELD_N }, (_, i) => i), live = idx.slice().sort(() => Math.random() - .5).slice(0, FIELD_LIVE);
  S.field = { id: a.id, slot: a.slot, prof: a.prof, t: a.t, seed: a.seed, name: a.name, q: a.q || 0, until: a.until, nodes: idx.map(i => live.includes(i) ? rollNode(rich) : null), resp: idx.map(i => live.includes(i) ? 0 : now + randR(FIELD_RESP) * 1000) };
  S.work = null;
}
function leaveField() { if (S.loc === 'field') { S.work = null; S.loc = 'city'; } }
// düğüm kartına dokununca iş başlar (yürüme yok): Oto'da ürün süresi işler, Elle'de mini oyun hemen açılır
function startWork(i, now = Date.now(), live = true, man = S.fmode === 'man') {
  if (!S.field || !S.field.nodes[i]) return;
  man = man && live && view === 'field';      // elle toplama yalnız saha ekranında
  Mini.close();
  if (man) { S.work = { i, walk: false, man: true }; openMini(); }
  else S.work = { i, walk: false, t0: now, dur: workSec() * 1000 * (.9 + Math.random() * .2) };
  fieldDirty = true;
}
// elle toplama: düğümün başında mini oyun açılır; her tur bir ürün verir (kusursuz tur +1)
function openMini() {
  Mini.open($('#fdMini'), S.field.prof, { need: manHits, win: manualWin, quit: () => stopWork(), haptic, color: PROFS[S.field.prof].c });
}
function manualWin(clean) {
  const w = S.work; if (!w || !w.man || !S.field || !S.field.nodes[w.i]) return false;
  if (usedCells() >= totalCells()) { toast('Envanter dolu', { tone: 'warn', sub: 'toplama durdu · sat ya da işle' }); haptic([20, 40, 20]); S.work = null; fieldDirty = true; save(); renderAll(); return false; }
  const i = w.i; doGather(Date.now(), true, null, clean ? 1 : 0);
  if (!S.field.nodes[i]) {      // düğüm tükendi: en iyi düğüme geçilir, oyun orada yeniden açılır
    const j = bestNode(); if (j >= 0) startWork(j, Date.now(), true, true); else { Mini.close(); S.work = { i, wait: true, man: true }; }
    save(); renderAll(); return false;
  }
  save(); renderAll(); return true;
}
// alt çubuktaki Oto ve Elle düğmeleri: aynı düğmeye yeniden basmak işi durdurur, ötekine basmak yolu değiştirir
function fieldMode(m) {
  if (!S.field) return;
  const w = S.work;
  if (w && (m === 'man') === !!w.man) { stopWork(); return; }
  S.fmode = m;
  const j = w && S.field.nodes[w.i] ? w.i : bestNode();
  if (j < 0) { toast('Düğüm yok', { sub: 'yenisi birazdan çıkar' }); return; }
  startWork(j, Date.now(), true, m === 'man'); save(); renderAll();
}
// saha ekranından çıkınca elle toplama biter (oto sürer)
function fieldLeave() { Mini.close(); if (S.work && S.work.man) { S.work = null; fieldDirty = true; } }
function bestNode() {
  let best = -1, bs = -1e9;
  S.field.nodes.forEach((n, i) => { if (!n) return; const sc = n.q * 100 + n.left; if (sc > bs) { bs = sc; best = i; } });
  return best;
}
function spawnField(now) {
  if (!S.field) return;
  S.field.nodes.forEach((n, i) => { if (!n && S.field.resp[i] && now >= S.field.resp[i]) { S.field.nodes[i] = rollNode(fieldQ().rich); S.field.resp[i] = 0; fieldDirty = true; } });
  if (S.work && S.work.wait) { const j = bestNode(); if (j >= 0) startWork(j, now, true); }
}
// bir ürün: sandığa girer; düğüm bir eksilir, tükenirse yerine yenisi için süre başlar
function doGather(at, live, rep, bonus = 0) {
  const F = S.field, w = S.work, n = F.nodes[w.i], P = PROFS[F.prof], Q = NODE_Q[n.q], id = P.res + F.t;
  const FM = fieldQ(), cnt = 1 + bonus + (Math.random() * 100 < Q.dbl + FM.dbl ? 1 : 0);
  S.box[id] = (S.box[id] || 0) + cnt;
  F.got = (F.got || 0) + cnt; S.pgot = S.pgot || {}; S.pgot[F.prof] = (S.pgot[F.prof] || 0) + cnt;      // ada ayrıntısındaki sayaçlar
  let found = false;
  if (Math.random() * 100 < Q.find * FM.find) { S.box[P.find.id] = (S.box[P.find.id] || 0) + 1; found = true; }
  addXp(Math.round(G_XP[F.t] * (1 + n.q * .25)), live);
  if (rep) { rep[id] = (rep[id] || 0) + cnt; if (found) rep[P.find.id] = (rep[P.find.id] || 0) + 1; }
  if (live && view === 'field') { fieldFloat(`+${cnt} ${ITEMS[id].name}`, QUAL[n.q].c, cnt > 1); if (found) setTimeout(() => fieldFloat(`${P.find.name}!`, P.find.c, true, -22), 250); haptic(found ? [8, 30, 14] : 8); }
  else if (live && found) toast(P.find.name, { label: 'Nadir buluntu', sub: P.region });
  if (--n.left <= 0) { F.nodes[w.i] = null; F.resp[w.i] = at + randR(FIELD_RESP) * 1000; }
  fieldDirty = true;
}
function advanceWork(now, live, rep) {
  let guard = 0;
  while (S.work && S.field && !S.work.walk && !S.work.wait && guard++ < 4000) {
    const w = S.work, end = w.t0 + w.dur;
    if (w.man || now < end) break;      // elle toplamada ürünü mini oyun verir
    if (!S.field.nodes[w.i]) { S.work.wait = true; break; }
    if (usedCells() >= totalCells()) {      // tek envanter doldu: toplama durur
      S.work = null; fieldDirty = true;
      if (live) { toast('Envanter dolu', { tone: 'warn', sub: 'toplama durdu · sat ya da işle' }); haptic([20, 40, 20]); }
      break;
    }
    doGather(end, live, rep);
    if (S.field.nodes[w.i]) { w.t0 = end; w.dur = workSec() * 1000 * (.9 + Math.random() * .2) / (rep ? OFFLINE_EFF : 1); }
    else { const j = bestNode(); if (j >= 0) startWork(j, end, live && !rep); else S.work = { i: w.i, wait: true }; }
  }
  spawnField(now);
}
// sen yokken: verim OFFLINE_EFF, en çok MAX_OFFLINE
function awayWork(now, sec) {
  if (!S.work || !S.field || S.work.walk || S.work.man) return;
  const rep = {}, from = Math.max(S.work.t0 || now, now - Math.min(sec, MAX_OFFLINE) * 1000);
  if (S.work.t0) { S.work.t0 = from; S.work.dur /= OFFLINE_EFF; }
  advanceWork(now, false, rep);
  const ks = Object.keys(rep); if (!ks.length) return;
  toast(`Sen yokken ${PROFS[S.field.prof].region}`, { label: 'Toplama sürdü', sub: ks.map(k => `+${rep[k]} ${ITEMS[k].name}`).join(' · ') });
}
function stopWork() { Mini.close(); S.work = null; fieldDirty = true; save(); renderAll(); }

/* ---------- görünümler ---------- */
let fieldDirty = true;
// saha artık haritanın bir hücresidir (Diyar): sahaya girince harita o hücreye yaklaşır, düğümler hücrenin içinde çıkar
function showField() { if (S.work && S.work.walk) startWork(S.work.i); fieldDirty = true; }
function fieldTap(i) { if (!S.field || !S.field.nodes[i]) return; if (S.work && S.work.i === i && !S.work.wait) return; haptic(8); startWork(i); save(); renderAll(); }
// yüzen yazı: çalışılan düğümün üstünde (dünya haritasında)
function fieldFloat(text, color, big, dy = 0) {
  if (view !== 'field' || !S.work || !window.Diyar || !Diyar.ready) return;
  const c = Diyar.data.cells[dyCur()], p = c && c.spots[S.work.i]; if (!p) return;
  Diyar.float(p[0], p[1] - 46 + dy, text, color, big);
}
// düğümler: hücrenin 9 yerinde; tükenen yerde yenisine kalan süre
function renderFieldMarks(now = Date.now()) {
  const ci = dyCur(), c = ci >= 0 && Diyar.data.cells[ci]; if (!c || Diyar.sel !== ci) return;
  const F = S.field, w = S.work;
  const sig = F.id + '|' + F.nodes.map((n, i) => n ? `${n.q}.${n.left}` : 'x' + i).join(',') + '|' + (w ? w.i + (w.wait ? 'w' : '') + (w.man ? 'm' : '') : '');
  if (sig !== fieldDirty) { fieldDirty = sig;
    Diyar.nodes(c.spots.map((p, i) => { const n = F.nodes[i], st = `left:${p[0] - Diyar.data.x}px;top:${p[1] - Diyar.data.y}px`;
      if (!n) return `<span class="dn empty" style="${st}"><i></i><b class="num" data-nr="${i}"></b></span>`;
      const on = w && w.i === i && !w.wait;
      return `<button class="dn q${n.q} ${on ? 'on' : ''} ${n.left <= 2 ? 'low' : ''}" data-node="${i}" style="${st};--qc:${QUAL[n.q].c}" aria-label="${NODE_Q[n.q].name} düğüm">
        <svg class="dn-ring" viewBox="0 0 60 60"><circle cx="30" cy="30" r="26" class="r0"/><circle cx="30" cy="30" r="26" class="r1"/></svg>
        <span class="dn-art">${nodeSvg(F.prof, F.t, `q${n.q} ${on ? 'act' : ''}`)}</span>
        <span class="dn-tx">${n.q ? Hex.gemRow(n.q) : ''}<b class="num">${n.left}</b></span></button>`; }).join(''));
  }
  // çalışılan düğümün halkası: ürünün ilerlemesi (elle toplamada mini oyunun ilerlemesi)
  { const on = w && !w.wait && !w.walk ? document.querySelector(`.dy-nodes [data-node="${w.i}"] .r1`) : null; if (on) on.style.strokeDashoffset = (163.4 * (1 - (w.man ? Mini.progress() : clamp((now - w.t0) / w.dur, 0, 1)))).toFixed(1); }
  F.nodes.forEach((n, i) => { if (n) return; const el = document.querySelector(`.dy-nodes [data-nr="${i}"]`); if (el) { const s = Math.max(0, Math.ceil(((F.resp[i] || now) - now) / 1000)), tx = `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; if (el.textContent !== tx) el.textContent = tx; } });
}
function renderField() {
  if (!S.field) return;
  renderWorld();
  const F = S.field, P = PROFS[F.prof], w = S.work, now = Date.now();
  const auto = !!w && !w.man, man = !!w && !!w.man, p = auto && !w.walk && !w.wait ? clamp((now - w.t0) / w.dur, 0, 1) : 0;
  $('#fdRing').style.width = (p * 100).toFixed(1) + '%';
  $('#fdAuto').classList.toggle('on', auto); $('#fdAutoT').textContent = auto ? (w.wait ? 'Bekliyor' : 'Durdur') : 'Oto';
  $('#fdAutoS').textContent = auto && !w.wait ? `${fmtDec(workSec())} sn / ürün` : 'kendi toplar';
  $('#fdMan').classList.toggle('on', man); $('#fdManT').textContent = man ? (w.wait ? 'Bekliyor' : 'Bırak') : P.verb;
  { const ic = '#i-' + PROF_IC[F.prof]; if ($('#fdManIc').getAttribute('href') !== ic) $('#fdManIc').setAttribute('href', ic); }
  renderFieldMarks(now);
}

/* =========================================================
   DİYAR — dünya haritası (kullanıcı kararı 2026-11-18). Şehir gibi kaydırılır ve yakınlaşır; altı bölge sınır çizgileriyle
   6'şar sahaya bölünmüştür, denizde Kıyı'nın 6 alanı vardır (js/sehir/diyar.js, diyarcanli.js). Sahaya dokununca harita yaklaşır:
   açıksa sahaya girersin ve düğümler hücrenin içinde çıkar (Oto | Topla alttadır); kilitliyse gereken alet yazar.
   Denizdeki alana dokununca denize açılırsın, sürüler alanın içinde çıkar (Çek alttadır).
   ========================================================= */
let worldBuilt = false, dySel = -1, dyInfoSig = '', dyLockSig = '';
const regC = r => r === 'balik' ? '#7ec4c8' : PROFS[r].c;
const regName = r => r === 'balik' ? 'Kıyı' : PROFS[r].region;
const regJob = r => r === 'balik' ? 'Balıkçılık' : PROFS[r].name;
const TOOL_SHORT = { maden: 'kazma', odun: 'balta', bitki: 'orak', deri: 'bıçak', yaratik: 'kılıç', balik: 'olta' };
const minLeft = (a, now) => Math.max(1, Math.ceil((a.until - now) / 60e3));
const fieldSlot = () => !S.field ? -1 : S.field.slot != null ? S.field.slot : (+String(S.field.id).split('-')[1] || 0) % FAREA_N;
const seaSlot = () => !S.sea ? -1 : S.sea.slot != null ? S.sea.slot : (+String(S.sea.id).split('-').pop() || 0) % AREA_N;
const cellArea = (c, now = Date.now()) => c.kind === 'sea' ? areas(now)[c.slot] : c.kind === 'field' ? fieldAreas(c.prof, now)[c.slot] : null;      // listeden: bölgede aynı adlı iki saha olmasın
const cellOk = (c, a) => c.kind === 'sea' ? canFish(spotById(a.type)) : canField(c.prof, a.t);
// bulunduğun hücre (sahadaysan o saha, denizdeysen o alan)
function dyCur() {
  if (!window.Diyar || !Diyar.ready) return -1;
  const cs = Diyar.data.cells;
  if (S.loc === 'field' && S.field) return cs.findIndex(c => c.kind === 'field' && c.prof === S.field.prof && c.slot === fieldSlot());
  if (S.loc === 'sea' && S.sea) return cs.findIndex(c => c.kind === 'sea' && c.slot === seaSlot());
  return -1;
}
// etiket: sahanın adı, kademesi, nitelik taşları, kalan süre; kilitliyse kilit; bulunduğun yerse altın
function dyInfo(i) {
  const c = Diyar.data.cells[i], now = Date.now();
  if (c.kind === 'city') return { html: `${icon('castle')}<b>Derinsu Şehri</b>`, cls: 'city' };
  const a = cellArea(c, now), ok = cellOk(c, a), here = i === dyCur(), q = c.kind === 'sea' ? 0 : a.q;
  const sub = c.kind === 'sea' ? `${rom(a.t)} · ${spotById(a.type).kind}` : `${rom(a.t)}${q ? ' ' + Hex.gemRow(q) : ''}`;
  return { html: `<i class="dt-q" style="--qc:${c.kind === 'sea' ? '#9fd3d6' : QUAL[q].c}"></i><b>${esc(here && c.kind === 'field' ? S.field.name : here && c.kind === 'sea' ? S.sea.name : a.name)}</b><small>${ok ? '' : icon('lock')}${sub}<em class="num">${minLeft(a, now)} dk</em></small>`,
    cls: `${ok ? '' : 'lock'} ${here ? 'here' : ''} q${q}` };
}
function renderWorld() {
  if (!worldBuilt) { worldBuilt = true; Hex.sprite(); Diyar.mount($('#dyHost'), { pick: dyPick, info: dyInfo }); }
  const now = Date.now(), sel = view === 'world' ? dySel : dyCur(), wv = $('#worldView');
  if (Diyar.sel !== sel) Diyar.select(sel, true);
  wv.classList.toggle('m-field', view === 'field'); wv.classList.toggle('m-sea', view === 'sea'); wv.classList.toggle('m-lock', view === 'world' && dySel >= 0);
  // etiketler dakikada bir değişir
  const tsig = Math.floor(now / 15e3) + '|' + S.loc + (S.field ? S.field.id : '') + (S.sea ? S.sea.id : '') + PROF_IDS.map(p => toolT(p)).join('') + S.rod.t;
  if (tsig !== renderWorld.t) { renderWorld.t = tsig; Diyar.tags(); }
  if (view === 'world' && dySel < 0) Diyar.nodes('');
  // üstte seçili sahanın bilgisi
  let info = '';
  const c = sel >= 0 ? Diyar.data.cells[sel] : null;
  if (c) { const a = view === 'field' ? S.field : view === 'sea' ? S.sea : cellArea(c, now), sea = c.kind === 'sea', q = sea ? 0 : a.q || 0;
    const lft = view === 'world' ? minLeft(a, now) + ' dk' : (a.until > now ? Math.ceil((a.until - now) / 60e3) + ' dk' : 'süre doldu');
    const res = sea ? '' : (() => { const it = ITEMS[PROFS[c.prof].res + a.t]; return `<span class="di-res">${itemImg(it)}<b class="num">${fmt(S.box[it.id] || 0)}</b></span>`; })();
    info = `<span class="di-q" style="--qc:${sea ? '#9fd3d6' : QUAL[q].c}">${icon(PROF_IC[c.prof])}</span><span class="di-tx"><small>${regName(c.prof)} · ${sea ? spotById(a.type).kind : (q ? Hex.gemRow(q) + FIELD_Q[q].name : 'Sıradan')} · ${rom(a.t)}. kademe</small><b>${esc(a.name)}</b></span>
      <span class="di-t num">${icon(view === 'sea' && isStorm() ? 'bolt' : 'clock')}${lft}</span>${res}`; }
  if (info !== dyInfoSig) { dyInfoSig = info; $('#dyInfo').innerHTML = info; $('#dyInfo').classList.toggle('on', !!info); }
  // kilitli saha paneli
  let lock = '';
  if (view === 'world' && c) { const a = cellArea(c, now), sea = c.kind === 'sea';
    lock = cellOk(c, a) ? '' : `<span class="dl-ic">${icon('lock')}</span><span class="dl-tx"><b>${rom(Math.max(1, a.t - 1))}. kademe ${sea ? 'olta' : PROFS[c.prof].tool.toLowerCase()} gerek</b><small>Bu saha ${minLeft(a, now)} dakika sonra yenilenir; kademesi ve niteliği değişir.</small></span>`; }
  if (lock !== dyLockSig) { dyLockSig = lock; $('#dyLock').innerHTML = lock; $('#dyLock').classList.toggle('on', !!lock); }
}
// hücreye dokunuş: şehir · açık saha (gir) · açık deniz alanı (açıl) · kilitli (yaklaş, gereken alet)
function dyPick(i) {
  const c = Diyar.data.cells[i], now = Date.now(); haptic(8);
  if (c.kind === 'city') { dySel = -1; showView('city'); return; }
  const a = cellArea(c, now);
  if (!cellOk(c, a)) { dySel = i; if (view !== 'world') showView('world'); else renderWorld(); return; }
  if (c.kind === 'field') {
    if (!(S.loc === 'field' && S.field && S.field.prof === c.prof && fieldSlot() === c.slot)) { enterField(a); toast(a.name, { label: `${rom(a.t)}. kademe · ${FIELD_Q[a.q].name} saha`, sub: fieldQText(a.q) || 'bir düğüme dokun' }); }
    else S.loc = 'field';
    dySel = -1; save(); showView('field'); return;
  }
  if (!(S.loc === 'sea' && S.sea && seaSlot() === c.slot)) { enterSea(a); toast(a.name, { label: `${rom(a.t)}. kademe · ${spotById(a.type).kind}`, sub: 'bir sürüye dokun' }); }
  else S.loc = 'sea';
  dySel = -1; save(); showView('sea');
}
// geri: seçiliyse bütün haritaya; değilse şehre
function dyBack() {
  haptic(6);
  if (view === 'field' || view === 'sea' || dySel >= 0) { dySel = -1; showView('world'); return; }
  showView('city');
}
function wmClose() { dySel = -1; }
// başka ekrandan saha seçimine: harita açılır (bulunduğun meslekteysen oraya yaklaşır)
function openRegion(r) { dySel = -1; showView(r === 'balik' && S.loc === 'sea' && S.sea ? 'sea' : S.loc === 'field' && S.field && S.field.prof === r ? 'field' : 'world'); }
function worldGo(r) { if (r === 'city') showView('city'); else openRegion(r); }
// Gümüşle alet yükseltme kaldırıldı (kullanıcı kararı, 2026-11-17): aletler başka bir yolla geliştirilecek. TOOL_COST yalnız eski kayıtlar için duruyor.

/* ---- pencere: Demirci (bütün meslek aletleri tek yerde; gümüşle yükseltme yok) ---- */
function openSmith() { openWin('smith', renderSmith, {}); }
function renderSmith() {
  const row = prof => { const P = PROFS[prof], tt = toolT(prof);
    return `<div class="sm-row"><span class="tr-ti">${toolImg(prof, tt)}</span><span class="tr-tx"><b>${toolName(prof, tt)}</b><small>${P.name} · ${tt < 5 ? `${rom(Math.min(5, tt + 1))}. sahaya kadar izin` : 'bütün sahalara izin'}</small></span>
      <span class="sm-max">${rom(tt)}. KADEME</span></div>`; };
  return head('flame', 'Demirci', 'Meslek aletlerin')
    + `<div class="sh-body"><p class="tr-sub">Her meslek kendi aletiyle çalışır. Alet, kendi kademesinin bir üstündeki sahaya kadar izin verir; aletin sahadan üstünse iş hızlanır. Aletlerin geliştirilmesi yeni bir yolla gelecek.</p>
      <div class="sm-list">${PROF_IDS.map(row).join('')}
        <div class="sm-row"><span class="tr-ti">${rodImg(S.rod.t)}</span><span class="tr-tx"><b>${rod().name}</b><small>Balıkçılık · dayanıklılık ${S.rod.dur}/${durMax()}</small></span><button class="btn ghost mini" data-act="smithrod">Olta${icon('chev')}</button></div></div></div>`;
}
