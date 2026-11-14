/* =========================================================
   DERİNSU — oyun verisi
   Av yerleri, balık türleri, oltalar, fıçı, atölye tarifleri, günlük etkinlik ve görevler.
   Sayılar burada; kurallar app.js'te.
   ========================================================= */
'use strict';

const SAVE_KEY = 'derinsu.save.v2';     // v2: deniz suları, yeni balık kimlikleri
const MAX_OFFLINE = 8 * 3600;          // sn · sen yokken en çok bu kadar avlanılır
const START_SILVER = 250;
const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V'];
const rom = t => ROMAN[t] || '0';

/* Nadirlik (tasarım belgesi "Rarity ve kg"): türe değil her ava ayrı zarla atanır.
   p: çıkma şansı % · mult: fiyat çarpanı · kg: kg bonusu % · blue: işlemede mavi malzeme düşme şansı % (Mitik: kesin 2 adet) */
const QUAL = [
  { name: 'Sıradan', r: 'white', c: '#e8e4dc', p: 55, mult: 1, kg: 0, blue: 2 },
  { name: 'Seçkin', r: 'green', c: '#6fcf62', p: 25, mult: 1.5, kg: 10, blue: 4 },
  { name: 'Nadir', r: 'blue', c: '#4ea4f0', p: 13, mult: 2.5, kg: 20, blue: 8 },
  { name: 'Destansı', r: 'orange', c: '#e0853a', p: 5.5, mult: 5, kg: 35, blue: 15 },
  { name: 'Efsanevi', r: 'red', c: '#e8474c', p: 1.4, mult: 10, kg: 50, blue: 30 },
  { name: 'Mitik', r: 'gold', c: '#f3c64a', p: .1, mult: 25, kg: 100, blue: 100 },
];
const Q_XP = [1, 1.6, 2.6, 4.5, 9, 20];
const OFFLINE_EFF = .2, OFFLINE_QMAX = 2;      // sen yokken: manuel verimin %20'si, en çok Nadir
const ECON = 4;                                // belge "altın/kg" değerleri → oyunun gümüşü

/* Sürü: açık denizdeki her balık sürüsünün bir niteliği var (Astralis düğüm rengi gibi).
   n: sürü tükenene dek kaç av verir (iyi sürü çabuk tükenir) · p: çıkma olasılığı */
const SHOALS = [                             // luck: sürünün nadirlik zarına katkısı
  { name: 'Durgun', q: 0, p: 46, luck: -15, spd: 0, n: 40 },
  { name: 'Kıpırtılı', q: 1, p: 32, luck: 0, spd: 5, n: 30 },
  { name: 'Kaynıyor', q: 2, p: 15, luck: 35, spd: 10, n: 22 },
  { name: 'Altın Akın', q: 3, p: 7, luck: 80, spd: 18, n: 14 },
];
const SCHOOL_SLOTS = 12, SCHOOL_LIVE = 8;    // bir denizde sürü yuvası ve açılışta canlı sürü
const RESPAWN = [30, 90];                    // tükenen sürünün yerine yenisinin çıkma aralığı (sn)
const TRAVEL_MS = 5000;                      // liman ↔ deniz, deniz ↔ deniz yolculuğu

/* Su türleri (kademe) · sec: temel atış süresi · xp: av başına temel deneyim
   pal: yan sahne renkleri (kart küçük resimleri) · sea: açık deniz haritası renkleri */
const SPOTS = [
  { id: 'kiyi', t: 1, name: 'Kıyı ve Liman', kind: 'Kıyı', sub: 'Kumlu, berrak sığlıklar', sec: 7, xp: 6, v: [2, 8],
    pal: { sk0: '#2d3a40', sk1: '#7c7a62', far: '#24302a', w0: '#3f6766', w1: '#1a2c2e', lit: '#efd99a' },
    sea: { deep: [40, 108, 118], shal: [98, 176, 172], sand: [222, 206, 160], land: [92, 120, 64], rock: [124, 116, 100], fx: 'gull' } },
  { id: 'koy', t: 2, name: 'Koy ve Kayalık', kind: 'Koy', sub: 'Sakin koylar, yosunlu kayalar', sec: 9, xp: 9, v: [10, 25],
    pal: { sk0: '#2a3134', sk1: '#6d6a58', far: '#1d2522', w0: '#36524c', w1: '#14201e', lit: '#e2cf9d' },
    sea: { deep: [34, 92, 86], shal: [80, 140, 124], sand: [168, 156, 116], land: [62, 96, 54], rock: [104, 100, 90], fx: 'spark', kelp: true } },
  { id: 'burun', t: 3, name: 'Açık Deniz', kind: 'Açık deniz', sub: 'Dalgalı, rüzgârlı sular', sec: 11, xp: 13, v: [25, 60],
    pal: { sk0: '#1b1f25', sk1: '#3f4148', far: '#121417', w0: '#2a3a44', w1: '#0d1419', lit: '#c9d0d6' },
    sea: { deep: [30, 62, 84], shal: [66, 106, 128], sand: [110, 106, 96], land: [70, 72, 70], rock: [92, 94, 92], fx: 'rain', foam: true } },
  { id: 'resif', t: 4, name: 'Derin Deniz', kind: 'Derin deniz', sub: 'Kayalık, mercanlı dipler', sec: 13, xp: 18, v: [60, 150],
    pal: { sk0: '#2d3640', sk1: '#8a7a5e', far: '#232628', w0: '#33586a', w1: '#14222e', lit: '#f0d79a' },
    sea: { deep: [22, 66, 104], shal: [52, 124, 168], sand: [190, 170, 130], land: [110, 104, 92], rock: [136, 128, 116], fx: 'spark', coral: true } },
  { id: 'cukur', t: 5, name: 'Uçurum', kind: 'Uçurum', sub: 'Dipsiz, ışıksız su', sec: 16, xp: 25, v: [150, 400],
    pal: { sk0: '#121014', sk1: '#241d26', far: '#0b0a0d', w0: '#1c1a2a', w1: '#08070c', lit: '#b9a6e6' },
    sea: { deep: [14, 14, 28], shal: [36, 34, 62], sand: [50, 46, 60], land: [36, 34, 44], rock: [52, 48, 62], fx: 'mote', abyss: true } },
];
const spotById = id => SPOTS.find(s => s.id === id);

/* İzin verilen avlanma alanları: 8 hex, her birinin izni AREA_MIN dakika sürer.
   Yuvalar kaydırmalı değişir (her 5 dakikada bir hex yenilenir). Alan, açılışından izin bitene dek girilebilir;
   içerideyken izin dolsa da av sürer. */
const AREA_N = 8, AREA_MIN = 40;
const AREA_TIER_W = [22, 24, 22, 18, 14];
const AREA_NAMES = {
  kiyi: ['Martı Sığlığı', 'Kumlu Kıyı', 'Tuzla Açığı', 'Mavi Sığlık', 'Deniz Kızı Kumsalı', 'Yelken Kıyısı'],
  koy: ['Yosunlu Koy', 'Gizli Koy', 'Kayıkçı Koyu', 'Zeytinli Koy', 'Ay Koyu', 'Sessiz Koy'],
  burun: ['Fırtına Burnu', 'Kara Burun', 'Rüzgârlı Açık', 'Poyraz Açığı', 'Lüfer Geçidi', 'Dalgakıran Açığı'],
  resif: ['Mercan Derinliği', 'Kızıl Resif', 'Süngerci Kayalığı', 'Orfoz Yatağı', 'İnci Kayalığı', 'Dalgıç Resifi'],
  cukur: ['Karanlık Çukur', 'Dipsiz Kuyu', 'Gölge Uçurumu', 'Abis Yarığı', 'Kemik Çukuru', 'Mor Derinlik'],
};

/* Balık türleri (tasarım belgesi "Bölgeler ve balıklar"): 5 bölge × 7 tür + 5 efsanevi tür.
   day / night: o bölgede bir avda türün gelme payı (gündüz ve gece ayrı ayrı %100; 0 = yalnız gece) ·
   v: tür değeri (belge birimiyle kg başına, bölgenin bandında; oyunda × ECON gümüş) · kg: ağırlık aralığı ·
   mat: işlemede düşen mavi malzeme · img/hue/sat: ikon. Efsanevi türler mavi havuza girmez: leg koşulu, kendi turuncu malzemesi. */
const FISH = [
  // T1 · Kıyı ve Liman
  { id: 'istavrit', spot: 'kiyi', name: 'İstavrit', kg: [.08, .35], v: 4, day: 20, night: 10, mat: 'gumuspul', img: 1, hue: 160 },
  { id: 'hamsi', spot: 'kiyi', name: 'Hamsi', kg: [.02, .06], v: 7, day: 20, night: 10, mat: 'gumuspul', img: 1, hue: 200, sat: .7 },
  { id: 'sardalya', spot: 'kiyi', name: 'Sardalya', kg: [.05, .15], v: 6, day: 20, night: 15, mat: 'gumuspul', img: 1, hue: 190 },
  { id: 'zargana', spot: 'kiyi', name: 'Zargana', kg: [.1, .4], v: 5, day: 15, night: 5, mat: 'gumuspul', img: 2, hue: 150, sat: 1.2 },
  { id: 'kefal', spot: 'kiyi', name: 'Kefal', kg: [.4, 2.6], v: 3, day: 10, night: 20, mat: 'balikyagi', img: 2, hue: 170, sat: .7 },
  { id: 'izmarit', spot: 'kiyi', name: 'İzmarit', kg: [.04, .2], v: 6, day: 10, night: 15, mat: 'balikyagi', img: 1, hue: 70, sat: .6 },
  { id: 'mezgit', spot: 'kiyi', name: 'Mezgit', kg: [.1, .6], v: 8, day: 5, night: 25, mat: 'balikyagi', img: 2, hue: 20, sat: .5 },
  // T2 · Koy ve Kayalık
  { id: 'cipura', spot: 'koy', name: 'Çipura', kg: [.3, 2.6], v: 20, day: 20, night: 10, mat: 'sedefpul', img: 3, hue: 200 },
  { id: 'levrek', spot: 'koy', name: 'Levrek', kg: [.5, 4], v: 22, day: 15, night: 20, mat: 'sedefpul', img: 2, hue: 190 },
  { id: 'karagoz', spot: 'koy', name: 'Karagöz', kg: [.2, 1.4], v: 14, day: 15, night: 15, mat: 'sedefpul', img: 1, hue: 70, sat: .6 },
  { id: 'sarigoz', spot: 'koy', name: 'Sarıgöz', kg: [.1, .7], v: 11, day: 20, night: 10, mat: 'sedefpul', img: 1, hue: 40, sat: 1.1 },
  { id: 'mirmir', spot: 'koy', name: 'Mırmır', kg: [.1, .6], v: 12, day: 15, night: 10, mat: 'kirmizipig', img: 2, hue: -10, sat: .8 },
  { id: 'barbunya', spot: 'koy', name: 'Barbunya', kg: [.05, .3], v: 25, day: 15, night: 5, mat: 'kirmizipig', img: 2, hue: -30, sat: 1.3 },
  { id: 'kupes', spot: 'koy', name: 'Kupes', kg: [.1, .45], v: 10, day: 0, night: 30, mat: 'kirmizipig', img: 1, hue: 100, sat: .7 },
  // T3 · Açık Deniz
  { id: 'lufer', spot: 'burun', name: 'Lüfer', kg: [.5, 6], v: 42, day: 5, night: 25, mat: 'keskindis', img: 2, hue: 175 },
  { id: 'sinarit', spot: 'burun', name: 'Sinarit', kg: [1, 9], v: 48, day: 15, night: 10, mat: 'keskindis', img: 3, hue: -20, sat: .9 },
  { id: 'fangri', spot: 'burun', name: 'Fangri', kg: [.5, 4], v: 40, day: 15, night: 10, mat: 'keskindis', img: 3, hue: -35, sat: 1.1 },
  { id: 'lahoz', spot: 'burun', name: 'Lahoz', kg: [1, 12], v: 55, day: 15, night: 15, mat: 'keskindis', img: 4, hue: 25, sat: .7 },
  { id: 'palamut', spot: 'burun', name: 'Palamut', kg: [1, 5], v: 30, day: 25, night: 10, mat: 'yuzmekesesi', img: 3, hue: 160 },
  { id: 'uskumru', spot: 'burun', name: 'Uskumru', kg: [.2, .8], v: 26, day: 25, night: 10, mat: 'yuzmekesesi', img: 1, hue: 150 },
  { id: 'kalamar', spot: 'burun', name: 'Kalamar', kg: [.2, 2], v: 36, day: 0, night: 20, mat: 'murekkep', img: 4, hue: 320 },
  // T4 · Derin Deniz
  { id: 'orfoz', spot: 'resif', name: 'Orfoz', kg: [2, 20], v: 120, day: 15, night: 15, mat: 'kayapulu', img: 3, hue: 20, sat: .7 },
  { id: 'mercan', spot: 'resif', name: 'Mercan', kg: [.3, 3], v: 85, day: 20, night: 10, mat: 'kayapulu', img: 2, hue: -40, sat: 1.3 },
  { id: 'kalkan', spot: 'resif', name: 'Kalkan', kg: [1, 8], v: 145, day: 15, night: 15, mat: 'kayapulu', img: 4, hue: 40, sat: .6 },
  { id: 'kirlangic', spot: 'resif', name: 'Kırlangıç', kg: [.3, 2], v: 65, day: 15, night: 10, mat: 'kayapulu', img: 2, hue: -12 },
  { id: 'kilic', spot: 'resif', name: 'Kılıç Balığı', kg: [12, 60], v: 95, day: 20, night: 15, mat: 'mizrakgaga', img: 4, hue: 200 },
  { id: 'akya', spot: 'resif', name: 'Akya', kg: [3, 20], v: 75, day: 15, night: 10, mat: 'mizrakgaga', img: 3, hue: 180, sat: .8 },
  { id: 'ahtapot', spot: 'resif', name: 'Ahtapot', kg: [1, 6], v: 105, day: 0, night: 25, mat: 'murekkep', img: 4, hue: -60, sat: 1.2 },
  // T5 · Uçurum
  { id: 'orkinos', spot: 'cukur', name: 'Orkinos', kg: [15, 90], v: 165, day: 25, night: 10, mat: 'yuzmekesesi', img: 4, hue: 215, sat: .7 },
  { id: 'marlin', spot: 'cukur', name: 'Marlin', kg: [20, 80], v: 230, day: 25, night: 10, mat: 'mizrakgaga', img: 4, hue: 190, sat: 1.2 },
  { id: 'mako', spot: 'cukur', name: 'Mako Köpekbalığı', kg: [20, 70], v: 260, day: 20, night: 15, mat: 'ucurumozu', img: 5, hue: 200, sat: .4 },
  { id: 'aybaligi', spot: 'cukur', name: 'Ay Balığı', kg: [30, 120], v: 155, day: 20, night: 5, mat: 'ucurumozu', img: 5, hue: 40, sat: .5 },
  { id: 'vatoz', spot: 'cukur', name: 'Vatoz', kg: [4, 30], v: 185, day: 10, night: 15, mat: 'ucurumozu', img: 4, hue: 300, sat: .6 },
  { id: 'devkalamar', spot: 'cukur', name: 'Dev Kalamar', kg: [15, 70], v: 310, day: 0, night: 20, mat: 'murekkep', img: 5, hue: 330 },
  { id: 'fener', spot: 'cukur', name: 'Fener Balığı', kg: [1, 8], v: 400, day: 0, night: 25, mat: 'ucurumozu', img: 3, hue: 255 },
  // Efsanevi türler · leg: çıkma koşulu · pct: koşul tutunca her avda olasılık · nadirlik en az Efsanevi
  { id: 'altinlufer', spot: 'burun', name: 'Altın Lüfer', kg: [4, 10], v: 60, leg: 'day', pct: .25, mat: 'altinpul', img: 3, hue: 48, sat: 1.6 },
  { id: 'kadimmersin', spot: 'resif', name: 'Kadim Mersin', kg: [30, 120], v: 150, leg: 'storm', pct: .3, mat: 'kadimkemik', img: 5, hue: 30, sat: .5 },
  { id: 'hayaletvatoz', spot: 'cukur', name: 'Hayalet Vatoz', kg: [20, 60], v: 400, leg: 'night', pct: .2, mat: 'hayaletzar', img: 5, hue: 205, sat: .3 },
  { id: 'kralorkinos', spot: 'cukur', name: 'Kral Orkinos', kg: [120, 300], v: 400, leg: 'week', pct: .3, mat: 'kraltaci', img: 5, hue: 215, sat: 1.4 },
  { id: 'derinkraken', spot: 'cukur', name: 'Derin Kraken', kg: [200, 500], v: 400, leg: 'event', pct: .15, mat: 'krakengoz', img: 5, hue: -15, sat: 1.6 },
];
const LEG_LBL = { day: 'gündüz', night: 'gece', storm: 'fırtınada', week: 'haftalık etkinlikte (pazar)', event: 'Kara Ay gecelerinde' };
const FISH_BY = Object.fromEntries(FISH.map(f => [f.id, f]));
const spotFish = sid => FISH.filter(f => f.spot === sid && !f.leg);
const legFish = sid => FISH.filter(f => f.spot === sid && f.leg);

/* Oltalar · tier = av yeri kuralı: olta kademesi en az (yer − 1) olmalı; eşitse tam hız, bir altıysa ×2 yavaş */
const RODS = [
  null,
  { t: 1, name: 'Söğüt Oltası', cost: 0, pearl: 0, spd: 0, luck: 0 },
  { t: 2, name: 'Bambu Oltası', cost: 1800, pearl: 0, spd: 10, luck: 8 },
  { t: 3, name: 'Dişbudak Oltası', cost: 25000, pearl: 5, spd: 20, luck: 16 },
  { t: 4, name: 'Kemik Oltası', cost: 300000, pearl: 20, spd: 32, luck: 26 },
  { t: 5, name: 'Ejder Oltası', cost: 3000000, pearl: 60, spd: 45, luck: 40 },
];
const ROD_Q = [70, 22, 7, 1];
/* Olta dayanıklılığı: her av 1 azaltır, 0'da av durur; oltanın kartında nokta başına gümüşle onarılır.
   Nadirlik dayanıklılığı da GEAR_Q kadar büyütür. */
const ROD_DUR = [0, 300, 500, 800, 1200, 1800];
const REPAIR_COST = [0, 1, 5, 40, 300, 2500];                   // dökümde nadirlik olasılığı
const GEAR_Q = [1, 1.15, 1.3, 1.5];             // nadirliğin özellik çarpanı

/* Gemiler: her geminin kendi ambarı vardır (ızgara; dizeler pruva yukarıda yazılır, oyunda pruva sağa bakacak biçimde çevrilir).
   X: hücre · M: direk (kullanılmaz) · K: kamara (kullanılmaz) · . : gövde dışı
   sail: haritada yelken hızı çarpanı · trip: liman ↔ deniz yolculuğu çarpanı */
const SHIPS = [
  { id: 'marti', t: 1, name: 'Martı', kind: 'Sandal', cost: 0, pearl: 0, sail: 1, trip: 1, c: '#c9a26b',
    desc: 'Söğüt kürekli, tek yelkenli küçük sandal. Kıyıdan çok açılmaz ama hiç batmaz.',
    grid: ['.XX.', 'XXXX', 'XXXX', 'XMXX', 'XXXX', 'XXXX', '.XX.'] },
  { id: 'yakamoz', t: 2, name: 'Yakamoz', kind: 'Tirhandil', cost: 2500, pearl: 0, sail: 1.12, trip: .9, c: '#4ea4f0',
    desc: 'İki ucu sivri, mavi beyaz boyalı tirhandil. Gece fenerinin altında su ışıldar.',
    grid: ['..X..', '.XXX.', 'XXXXX', 'XXXXX', 'XXMXX', 'XXXXX', 'XXXXX', 'XXXXX', '.XXX.'] },
  { id: 'lodos', t: 3, name: 'Lodos', kind: 'Gulet', cost: 30000, pearl: 4, sail: 1.25, trip: .8, c: '#6fcf62',
    desc: 'Cilalı maun gövdeli, iki direkli gulet. Rüzgârı arkasına aldı mı durdurulmaz.',
    grid: ['..XX..', '.XXXX.', 'XXXXXX', 'XXMXXX', 'XXXXXX', 'XXXXXX', 'XXXXXX', 'XXXMXX', 'XXXXXX', '.XXXX.'] },
  { id: 'poyraz', t: 4, name: 'Poyraz', kind: 'Trol Teknesi', cost: 400000, pearl: 15, sail: 1.4, trip: .7, c: '#e0853a',
    desc: 'Çelik gövdeli, vinçli, ağ kızaklı trol teknesi. Fırtınada bile ambarı kuru kalır.',
    grid: ['...X...', '..XXX..', '.XXXXX.', 'XXXXXXX', 'XXKKKXX', 'XXKKKXX', 'XXXXXXX', 'XXXXXXX', 'XXXXXXX', 'XXXXXXX', 'XXXXXXX', '.XXXXX.'] },
  { id: 'ejder', t: 5, name: 'Derin Ejder', kind: 'Kalyon', cost: 4000000, pearl: 50, sail: 1.6, trip: .6, c: '#b9a6e6',
    desc: 'Üç direkli, ejder başlı kara kalyon. Ambarı bir köy kadar, yelkenleri gece kadar karadır.',
    grid: ['...X...', '..XXX..', '.XXXXX.', 'XXXXXXX', 'XXXMXXX', 'XXXXXXX', 'XXXXXXX', 'XXXMXXX', 'XXXXXXX', 'XXXXXXX', 'XXXMXXX', 'XXXXXXX', '.XXXXX.'] },
];
// ambar ızgarası yatay çizilir (pruva sağda): satır r = eski sütun, sütun c = eski satırın tersi
for (const sh of SHIPS) { const R = sh.grid.length, C = sh.grid[0].length; sh.grid = Array.from({ length: C }, (_, r) => Array.from({ length: R }, (_, c) => sh.grid[R - 1 - c][r]).join('')); }
const shipById = id => SHIPS.find(s => s.id === id);
const shipCells = sh => sh.grid.join('').split('').filter(c => c === 'X').length;
/* Balığın ambarda kapladığı yer (genişlik × yükseklik): en ağır hâli ≤2 kg 1×1, ≤10 kg 2×1 (yatık), daha ağırı 2×2.
   Aynı türden balıklar bir yığında durur; yığın sınırı büyüklüğe göre. */
const fishSize = f => f.kg[1] <= 2 ? [1, 1] : f.kg[1] <= 10 ? [2, 1] : [2, 2];
const INV_CAP = 300;                             // tek envanter: balık ve eşya toplamı en çok bu kadar (gemiden bağımsız)
/* Balıkçının üstündekiler: envanterdeki kuklanın çevresinde altı yuva. Olta ve tılsım oyunun kendisinden gelir,
   giysiler başlangıç takımıdır (özelliği yok). */
const WEAR = [
  { id: 'sapka', name: 'Şapka', x: 15, y: 20 }, { id: 'ceket', name: 'Yelek', x: 15, y: 50 }, { id: 'eldiven', name: 'Eldiven', x: 15, y: 80 },
  { id: 'olta', name: 'Olta', x: 85, y: 20 }, { id: 'tilsim', name: 'Tılsım', x: 85, y: 50 }, { id: 'cizme', name: 'Çizme', x: 85, y: 80 },
];
const OUTFIT = {
  sapka: { name: 'Hasır Şapka', c: '#d8b47a', desc: 'Güneşte balıkçının gözünü korur.' },
  ceket: { name: 'Keten Yelek', c: '#4f6f78', desc: 'Cepleri yem ve misina dolu.' },
  eldiven: { name: 'Yün Eldiven', c: '#9a6a44', desc: 'Islak misinada el kaymaz.' },
  cizme: { name: 'Lastik Çizme', c: '#3e4a3a', desc: 'Kaygan güvertede sağlam basar.' },
};
const BOAT = { cost: 12000, pearl: 8, rate: .85 };   // Hal Kayığı: fıçı dolunca kendiliğinden %85 fiyata satar

/* Sandık eşyaları (ağırlıksız) */
const ITEMS = {};
const FILLET_N = 1;                               // belge: her işlemede fileto kesin düşer (1 balık → 1 fileto)
const DISH_N = 2;                                 // bir yemek için fileto
const DISH_NAMES = ['', 'Kıyı Buğulaması', 'Koy Çorbası', 'Resif Izgarası', 'Burun Güveci', 'Çukur Ziyafeti'];
const FOOD_MIN = 30;                              // yemek etkisi: 30 dk, hız +%4×T, şans +%5×T
for (let t = 1; t <= 5; t++) {
  ITEMS['fileto' + t] = { id: 'fileto' + t, name: 'Fileto', t, img: `assets/items/fillet/fillet-t${t}.png`, kind: 'İşlenmiş', q: 0 };
  ITEMS['yemek' + t] = { id: 'yemek' + t, name: DISH_NAMES[t], t, img: `assets/items/balikci/balikci-t${t}.png`, kind: 'Yemek', q: 1, food: { spd: 4 * t, luck: 5 * t } };
  ITEMS['sandik' + t] = { id: 'sandik' + t, name: 'Batık Sandık', t, img: `assets/items/pirateChest/pirateChest-t${t}.png`, kind: 'Buluntu', q: 2, chest: true };
  ITEMS['kalinti' + t] = { id: 'kalinti' + t, name: 'Eski Kalıntı', t, img: `assets/items/relic/relic-t${t}.png`, kind: 'Buluntu', q: 3 };
}
/* Atölye ürünleri */
const YEM_MIN = 30;                               // yem etkisi: 30 dk şans +%6×T, deneyim +%10×T
for (let t = 1; t <= 5; t++) {
  ITEMS['yag' + t] = { id: 'yag' + t, name: 'Rafine Yağ', t, img: `assets/items/extract/extract-t${t}.png`, kind: 'İşlenmiş', q: 0 };
  ITEMS['yem' + t] = { id: 'yem' + t, name: 'Yem Karışımı', t, img: `assets/items/otaci/otaci-t${t}.png`, kind: 'Yem', q: 1, bait: { luck: 6 * t, xp: 10 * t } };
  ITEMS['cila' + t] = { id: 'cila' + t, name: 'Olta Cilası', t, img: `assets/items/extract/extract-t${t}.png`, hue: 175, kind: 'Bakım', q: 2, cila: 100 * t };
}
/* Mavi malzemeler (belge "İşleme ve mavi malzemeler"): işlemede balığın nadirliğine bağlı şansla düşer, her biri bir
   ekipman parçasına gider. Turuncu malzemeler efsanevi türlerden düşer. svg: ikon · src: kaynak · use: kullanım */
const matSvg = (body, c) => `<svg viewBox="0 0 40 40" class="mat-svg" style="--mc:${c}">${body}</svg>`;
const MATS = {
  gumuspul: { name: 'Gümüş Pul', c: '#c8d4dc', val: 18, src: 'İstavrit, Hamsi, Sardalya, Zargana', use: 'Cazibe ve yem: nadirlik şansı',
    svg: [[12, 22], [20, 16], [27, 23], [19, 27]].map(([x, y], i) => `<path d="M${x} ${y - 7}q7 4 0 14q-7 -10 0 -14z" fill="${['#dfe8ee', '#b8c6d0', '#eef4f8', '#a8b8c4'][i]}" stroke="#6a7a86" stroke-width=".8" transform="rotate(${i * 35 - 30} ${x} ${y})"/>`).join('') },
  balikyagi: { name: 'Balık Yağı', c: '#e0a83a', val: 18, src: 'Kefal, İzmarit, Mezgit', use: 'Motor yağı ve tamir kiti: yakıt verimi',
    svg: '<path d="M20 5Q31 19 31 25A11 11 0 0 1 9 25Q9 19 20 5Z" fill="#e0a83a" stroke="#7a5216" stroke-width="1"/><path d="M15 23q0 6 5 7" stroke="#fff3c8" stroke-width="2" fill="none" opacity=".7"/>' },
  sedefpul: { name: 'Sedef Pul', c: '#b9e0e6', val: 70, src: 'Çipura, Levrek, Karagöz, Sarıgöz', use: 'Makara: mükemmel yakalama penceresi',
    svg: '<defs><linearGradient id="msd" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4e8ff"/><stop offset=".5" stop-color="#b9e0e6"/><stop offset="1" stop-color="#e6c8f0"/></linearGradient></defs><path d="M20 6C30 8 34 18 31 28Q20 34 9 28C6 18 10 8 20 6Z" fill="url(#msd)" stroke="#6a8a9a" stroke-width="1"/>' + [0, 1, 2, 3].map(i => `<path d="M20 30L${12 + i * 5.5} 10" stroke="#8aa6b4" stroke-width=".7"/>`).join('') },
  kirmizipig: { name: 'Kırmızı Pigment', c: '#e8474c', val: 70, src: 'Mırmır, Barbunya, Kupes', use: 'Tekne boyası (kozmetik) ve işaret fişeği',
    svg: '<path d="M10 18h20l-2 14q-1 3 -4 3h-8q-3 0 -4 -3z" fill="#5a3c22" stroke="#2a1d12"/><ellipse cx="20" cy="18" rx="10" ry="3.5" fill="#c0303a"/><path d="M14 17q6 -8 12 0" fill="#e8474c"/><circle cx="17" cy="13" r="1.2" fill="#ff8a8a"/>' },
  keskindis: { name: 'Keskin Diş', c: '#efe6cf', val: 220, src: 'Lüfer, Sinarit, Fangri, Lahoz', use: 'Kanca: kaçma şansı azalır',
    svg: [[12, 0], [20, 1], [28, 0]].map(([x, b]) => `<path d="M${x - 4} 10Q${x} ${b ? 36 : 30} ${x + 4} 10Z" fill="#efe6cf" stroke="#8a7a5a" stroke-width="1"/>`).join('') + '<path d="M6 10h28" stroke="#b0443a" stroke-width="3" stroke-linecap="round"/>' },
  yuzmekesesi: { name: 'Yüzme Kesesi', c: '#f0d6c0', val: 260, src: 'Palamut, Uskumru, Orkinos', use: 'Ambar ve ağ şamandırası: kapasite',
    svg: '<ellipse cx="20" cy="20" rx="12" ry="9" fill="#f0d6c0" stroke="#a87a60" stroke-width="1"/><ellipse cx="16" cy="17" rx="4" ry="2.5" fill="#fff6ee" opacity=".7"/><path d="M8 20q-3 4 -1 8" stroke="#a87a60" fill="none"/>' },
  murekkep: { name: 'Mürekkep Kesesi', c: '#6a4a9a', val: 300, src: 'Kalamar, Ahtapot, Dev Kalamar', use: 'Fener: gece avı bonusu',
    svg: '<path d="M20 6Q32 12 30 24Q28 32 20 32Q12 32 10 24Q8 12 20 6Z" fill="#3a2a5a" stroke="#1a1028" stroke-width="1"/><path d="M14 16q4 -5 9 -3" stroke="#9a7ac8" stroke-width="2" fill="none"/><path d="M20 32q1 4 -1 6" stroke="#3a2a5a" stroke-width="2.5" stroke-linecap="round"/>' },
  kayapulu: { name: 'Kaya Pulu', c: '#9a9488', val: 650, src: 'Orfoz, Mercan, Kalkan, Kırlangıç', use: 'Gövde zırhı: fırtına direnci',
    svg: [[14, 14], [26, 14], [20, 24], [8, 24], [32, 24]].map(([x, y], i) => `<path d="M${x} ${y - 6}l6 3.5v7l-6 3.5l-6 -3.5v-7z" fill="${['#8a8478', '#a8a294', '#7a7468', '#9a9488', '#b8b2a4'][i]}" stroke="#4a463e" stroke-width="1"/>`).join('') },
  mizrakgaga: { name: 'Mızrak Gaga', c: '#c8d0dc', val: 750, src: 'Kılıç Balığı, Marlin, Akya', use: 'Pruva: tekne hızı',
    svg: '<path d="M4 34L30 8L34 6L32 10L6 36Z" fill="#c8d0dc" stroke="#5a6470" stroke-width="1"/><path d="M8 32L30 10" stroke="#fff" stroke-width=".8" opacity=".6"/><path d="M4 34l-1 3l3 -1z" fill="#5a6470"/>' },
  ucurumozu: { name: 'Uçurum Özü', c: '#b9a6e6', val: 2200, src: 'Fener Balığı, Mako, Ay Balığı, Vatoz', use: 'Sonar, derin ağ, son seviye tekne: efsanevi tespiti',
    svg: '<circle cx="20" cy="20" r="15" fill="#b9a6e6" opacity=".18" class="mat-glow"/><circle cx="20" cy="20" r="9" fill="#2a1d3a" stroke="#b9a6e6" stroke-width="1.5"/><circle cx="20" cy="20" r="4.5" fill="#d8c8ff"/><circle cx="18" cy="18" r="1.5" fill="#fff"/>' },
  altinpul: { name: 'Altın Pul', c: '#f3c64a', val: 6000, orange: true, src: 'Altın Lüfer', use: 'Efsanevi parça (ileride)',
    svg: '<path d="M20 5q13 7 0 30q-13 -23 0 -30z" fill="#f3c64a" stroke="#8a6a1a" stroke-width="1.2"/><path d="M20 9v22" stroke="#fff3c8" stroke-width="1.2" opacity=".7"/>' },
  kadimkemik: { name: 'Kadim Kemik', c: '#e8dcc0', val: 9000, orange: true, src: 'Kadim Mersin', use: 'Efsanevi parça (ileride)',
    svg: '<path d="M10 28L28 10" stroke="#e8dcc0" stroke-width="5" stroke-linecap="round"/><circle cx="9" cy="27" r="3.5" fill="#e8dcc0"/><circle cx="12" cy="31" r="3.5" fill="#e8dcc0"/><circle cx="28" cy="9" r="3.5" fill="#e8dcc0"/><circle cx="31" cy="13" r="3.5" fill="#e8dcc0"/>' },
  hayaletzar: { name: 'Hayalet Zar', c: '#bfe6ff', val: 14000, orange: true, src: 'Hayalet Vatoz', use: 'Efsanevi parça (ileride)',
    svg: '<path d="M6 22Q20 2 34 22Q27 18 20 26Q13 18 6 22Z" fill="#bfe6ff" opacity=".75" stroke="#6a9ab4" stroke-width="1"/><path d="M14 22q6 8 12 0" stroke="#e6f6ff" fill="none" opacity=".8"/>' },
  kraltaci: { name: 'Kral Tacı', c: '#f3c64a', val: 20000, orange: true, src: 'Kral Orkinos', use: 'Efsanevi parça (ileride)',
    svg: '<path d="M7 28L9 13L15 20L20 9L25 20L31 13L33 28Z" fill="#f3c64a" stroke="#8a6a1a" stroke-width="1.2"/><circle cx="20" cy="23" r="2.2" fill="#4ea4f0"/><path d="M7 28h26" stroke="#8a6a1a" stroke-width="2"/>' },
  krakengoz: { name: 'Kraken Gözü', c: '#e8474c', val: 30000, orange: true, src: 'Derin Kraken', use: 'Efsanevi parça (ileride)',
    svg: '<ellipse cx="20" cy="20" rx="15" ry="10" fill="#f0e0c0" stroke="#5a2a1a" stroke-width="1.2"/><circle cx="20" cy="20" r="7" fill="#e8474c"/><ellipse cx="20" cy="20" rx="2" ry="6" fill="#1a0808"/><circle cx="17" cy="17" r="1.5" fill="#fff"/>' },
};
for (const [id, m] of Object.entries(MATS)) ITEMS[id] = { id, name: m.name, t: 0, svg: matSvg(m.svg, m.c), kind: m.orange ? 'Turuncu malzeme' : 'Mavi malzeme', q: m.orange ? 3 : 2, mat: true };
ITEMS.yonca = { id: 'yonca', name: 'Dört Yapraklı Yonca', t: 0, img: 'assets/items/clover/clover-t3.png', kind: 'Tılsım', q: 2, charm: { luck: 30, min: 20 } };
ITEMS.hazine = { id: 'hazine', name: 'Kaptan Hazinesi', t: 5, img: 'assets/items/bigPirateChest/bigPirateChest-t5.png', kind: 'Buluntu', q: 4, chest: true };

/* Atölyeler (Astralis İşlemehane / Zanaathane): her atölyenin kendi ustalığı, 3 sıralı siparişi ve ortak Teslim Rafı.
   mode p: işleme (ham → işlenmiş) · g: üretim · tool: üretim ekranındaki alet */
const WS_ORDERS = 3;
const WS_TIER_LVL = [1, 3, 6, 10, 15];                 // kademe kilidi: atölye ustalığı
const wsXpNeed = l => Math.round(30 * Math.pow(l, 1.55));
const WS_MAX_LVL = 30;
const WS_SPD = 2;                                      // ustalık seviyesi başına hız %
const WORKSHOPS = [
  { id: 'ayiklama', mode: 'p', name: 'Ayıklama Tezgâhı', tag: 'Balık temizlenir, filetolanır', art: 'tools', tool: 'knife', verb: 'Ayıklanıyor', c: '#c9a26b', master: 'Usta Kadir' },
  { id: 'yaghane', mode: 'p', name: 'Yağhane', tag: 'Balık kaynar, yağı süzülür', art: 'sack', tool: 'pot', verb: 'Kaynıyor', c: '#e0a83a', master: 'Ayşe Kadın' },
  { id: 'ocak', mode: 'g', name: 'Ocakbaşı', tag: 'Fileto pişer, sofraya çıkar', art: 'wheat', tool: 'pot', verb: 'Pişiyor', c: '#e0703a', master: 'Aşçı Hüsnü' },
  { id: 'yemci', mode: 'g', name: 'Yem Tezgâhı', tag: 'Fileto ve yağ yeme karılır', art: 'bag', tool: 'bowl', verb: 'Karılıyor', c: '#6fcf62', master: 'Yemci Nuri' },
  { id: 'cilaci', mode: 'g', name: 'Cila Tezgâhı', tag: 'Yağ kaynatılır, olta cilası olur', art: 'anvil', tool: 'rod', verb: 'Cilalanıyor', c: '#4ea4f0', master: 'Usta Şevket' },
];
const wsById = id => WORKSHOPS.find(w => w.id === id);
/* Tarifler: in: [{ k: 'balik' (o suyun Sıradan/Seçkin balığı) | eşya kimliği, n }] · out: eşya, adet · sec: işlem süresi · xp */
const RCP = {};
for (let t = 1; t <= 5; t++) {
  RCP['ayiklama' + t] = { id: 'ayiklama' + t, ws: 'ayiklama', t, in: [{ k: 'balik', n: FILLET_N }], out: 'fileto' + t, n: 1, sec: 4 + 2 * t, xp: 3 + 2 * t };
  RCP['yaghane' + t] = { id: 'yaghane' + t, ws: 'yaghane', t, in: [{ k: 'balik', n: 2 }], out: 'yag' + t, n: 1, sec: 5 + 3 * t, xp: 4 + 2 * t };
  RCP['ocak' + t] = { id: 'ocak' + t, ws: 'ocak', t, in: [{ k: 'fileto' + t, n: DISH_N }], out: 'yemek' + t, n: 1, sec: 8 + 4 * t, xp: 6 + 3 * t };
  RCP['yemci' + t] = { id: 'yemci' + t, ws: 'yemci', t, in: [{ k: 'fileto' + t, n: 1 }, { k: 'yag' + t, n: 1 }], out: 'yem' + t, n: 2, sec: 7 + 3 * t, xp: 6 + 3 * t };
  RCP['cilaci' + t] = { id: 'cilaci' + t, ws: 'cilaci', t, in: [{ k: 'yag' + t, n: 2 }], out: 'cila' + t, n: 1, sec: 10 + 5 * t, xp: 8 + 4 * t };
}
const USTA_ISI = [5, 25];                              // usta işi (çifte çıkış) şansı: taban, tavan %

/* Deniz Feneri · Gözcü Kulesi: kademesi iyi sürü şansını büyütür ve ufukta açılacak alanları önceden gösterir */
const FENER = [
  null,
  { cost: 0, pearl: 0, hot: 0, gold: 0, see: 2 },
  { cost: 4000, pearl: 0, hot: 3, gold: 1.5, see: 3 },
  { cost: 40000, pearl: 6, hot: 6, gold: 3, see: 4 },
  { cost: 400000, pearl: 18, hot: 9, gold: 4.5, see: 5 },
  { cost: 2500000, pearl: 45, hot: 12, gold: 6, see: 6 },
];

/* Buluntular: her avda küçük bir olasılık (şansla büyür) · % */
const FINDS = [
  { id: 'inci', pct: 1.2, minT: 1 },               // doğrudan inci kesesine
  { id: 'sandik', pct: .45, minT: 1 },
  { id: 'yonca', pct: .25, minT: 1 },
  { id: 'kalinti', pct: .18, minT: 2 },
  { id: 'hazine', pct: .015, minT: 4 },
];

/* Çekiş: vurgun penceresi (sn) ve ödüller */
const BITE_WIN = 1.5;
const PERFECT = { luck: 40, kg: [10, 20], xp: 50 };   // mükemmel yakalama: kg +%10–20, nadirlik zarına küçük artış, xp +%50
const COMBO_MAX = 10, COMBO_STEP = 5;            // her ardışık mükemmel +%5 değer, en çok +%50

/* Seviye */
const MAX_LVL = 60;
const xpNeed = l => Math.round(60 * Math.pow(l, 1.7));
const LVL_SPD = .8, LVL_LUCK = .5;               // seviye başına hız ve şans %

/* Günlük etkinlik: her gün biri (Türkiye saati) */
const EV_TZ = 3 * 3600e3;
const DAILY_EV = [
  { name: 'Sakin Deniz', desc: 'Kıyı ve Koy\'da hız +%20', spot: ['kiyi', 'koy'], spd: 20 },
  { name: 'İnci Günü', desc: 'Buluntu olasılığı +%60', find: 60 },
  { name: 'Hal Bayramı', desc: 'Balık Hali fiyatları +%15', sell: 15 },
  { name: 'Sisli Sabah', desc: 'Nadir balık şansı +%25', luck: 25 },
  { name: 'Lodos', desc: 'Açık Deniz ve Derin Deniz\'de hız +%20', spot: ['resif', 'burun'], spd: 20 },
  { name: 'Atölye Günü', desc: 'Atölye işleri 2 kat hızlı', smoke: 100 },
  { name: 'Kara Ay', desc: 'Uçurum\'da şans +%40 · gece Derin Kraken çıkabilir', spot: ['cukur'], luck: 40 },
];

/* Günlük görevler: her gün üç tane, gün tohumundan */
const QUEST_KINDS = [
  { k: 'catch', txt: n => `${n} balık tut`, n: [60, 90, 140] },
  { k: 'perfect', txt: n => `${n} mükemmel çekiş yap`, n: [15, 25, 40] },
  { k: 'rare', txt: n => `${n} Nadir ya da üstü balık tut`, n: [2, 4, 6] },
  { k: 'sell', txt: n => `Hal'de ${n} gümüşlük satış yap`, n: [1500, 4000, 9000] },
  { k: 'smoke', txt: n => `Atölyelerde ${n} iş bitir`, n: [6, 12, 20] },
  { k: 'kg', txt: n => `Toplam ${n} kg balık tut`, n: [60, 150, 400] },
];
