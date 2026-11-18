/* =========================================================
   DERİNSU — sahneler: liman, ana ekran kartları, deniz alanı kartları
   Hepsi tek dille çizilir: düz renkli, yumuşak gölgeli SVG; renkler CSS değişkeninden gelir (k-* sınıfları),
   böylece gündüz ve gece (body.night) aynı çizim iki ışıkta görünür: gece duvarlar mavileşir, camlar yanar.
   Kıpırtılar CSS sınıflarıyla (a-flag, a-sway, a-swing, a-smoke, a-fire, a-bob, a-beam, a-fly, a-flapw,
   a-cloud, a-wave, a-tw, a-walk, a-spin). Çizimler 390×620'lik sahne ölçüsünde; yapılar ayrı düğmelerdir.
   Scenes.harbor()        : liman ekranı (yapı düğmeleriyle)
   Scenes.homeCity()      : ana ekrandaki liman kartının resmi
   Scenes.homeSea(ship)   : ana ekrandaki açık deniz kartının resmi
   Scenes.area(type, seed): avlanma alanı kartının resmi (kıyı, koy, açık deniz, derin deniz, uçurum)
   ========================================================= */
'use strict';
window.Scenes = (() => {
  const R = (x, y, w, h, c, a = '') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" class="k-${c}" ${a}/>`;
  const P = (d, c, a = '') => `<path d="${d}" class="k-${c}" ${a}/>`;
  const C = (x, y, r, c, a = '') => `<circle cx="${x}" cy="${y}" r="${r}" class="k-${c}" ${a}/>`;
  const E = (x, y, rx, ry, c, a = '') => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" class="k-${c}" ${a}/>`;
  const L = (d, c = 'ln', w = 1, a = '') => `<path d="${d}" class="s-${c}" stroke-width="${w}" fill="none" ${a}/>`;
  const rep = (n, f) => Array.from({ length: n }, (_, i) => f(i)).join('');
  const rnd = seed => { let s = (seed * 9301 + 49297) % 233280; return () => (s = (s * 9301 + 49297) % 233280) / 233280; };
  // ışık: gece yanan hale (gündüz görünmez)
  const glow = (x, y, r, cls = '') => `<circle cx="${x}" cy="${y}" r="${r}" fill="url(#sc-glow)" class="glw ${cls}"/>`;
  // pencere: çerçeve, cam (gece sarı), kayıtlar; kemerli olabilir
  const win = (x, y, w = 8, h = 11, arch = false, lit = true) => (lit ? glow(x + w / 2, y + h / 2, Math.max(w, h) * 1.1) : '')
    + (arch ? P(`M${x} ${y + h}V${y + w / 2}Q${x + w / 2} ${y - w / 2 + 1} ${x + w} ${y + w / 2}V${y + h}Z`, 'win') : R(x, y, w, h, 'win', 'rx=".8"'))
    + L(`M${x + w / 2} ${y + (arch ? 1 : 0)}V${y + h}M${x} ${y + h * .5}H${x + w}`, 'fr', .9)
    + (arch ? '' : R(x - 1, y + h, w + 2, 1.6, 'stone'));
  const lamp = (x, y) => glow(x, y, 9, 'big') + L(`M${x} ${y - 5}V${y - 2}`, 'ir', 1) + R(x - 2, y - 2.5, 4, 5, 'lampg', 'rx="1"') + R(x - 2.6, y - 3.4, 5.2, 1.2, 'iron') ;
  const post = (x, y, h = 20) => R(x - .8, y - h, 1.6, h, 'iron') + lamp(x, y - h + 1) + R(x - 2, y - 1, 4, 1.4, 'iron');
  const tiles = (x0, x1, y0, y1, n, skew = 0) => rep(n, i => { const t = (i + 1) / (n + 1), xt = x0 + (x1 - x0) * t; return L(`M${(xt + skew * (t - .5)).toFixed(1)} ${y0}L${(xt + skew * (t - .5) * 2.4).toFixed(1)} ${y1}`, 'tl', .8); });
  const barrel = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${P('M-4 0Q-5.4 -5.5 -4 -11H4Q5.4 -5.5 4 0Z', 'wood')}${L('M-4.6 -3H4.6M-4.6 -8H4.6', 'ir', 1)}${E(0, -11, 4, 1.3, 'woodD')}</g>`;
  const crate = (x, y, s = 8) => R(x, y - s, s, s, 'woodL') + L(`M${x} ${y - s}L${x + s} ${y}M${x + s} ${y - s}L${x} ${y}`, 'ln', .8) + L(`M${x} ${y - s}h${s}v${s}h${-s}z`, 'ln', .8);
  const fishS = (x, y, s = 1, c = 'fish', a = 0) => `<g transform="translate(${x} ${y}) rotate(${a}) scale(${s})">${P('M-5 0Q-1 -3 4 0Q-1 3 -5 0Z', c)}${P('M4 0L7 -2.4V2.4Z', c)}<circle cx="-2.6" cy="-.4" r=".6" class="k-dark"/></g>`;
  const flag = (x, y, c = 'gold', w = 15, dir = 1) => `<g class="a-flag" style="transform-origin:${x}px ${y + 4}px">${P(`M${x} ${y}l${w * dir} 3.4l${-w * dir} 4.6z`, c)}</g>`;
  const smoke = (x, y, n = 3, c = 'smoke') => `<g class="a-smoke">${rep(n, i => `<circle cx="${x + i}" cy="${y}" r="${3.4 + i * .6}" class="k-${c}" style="animation-delay:${(-i * 1.3).toFixed(1)}s"/>`)}</g>`;
  const sp = (w, h, body, cls = '') => `<svg class="scn-sp ${cls}" viewBox="0 0 ${w} ${h}" overflow="visible" aria-hidden="true">${body}</svg>`;

  /* =========================================================
     YAPILAR (taban çizgisi y = h)
     ========================================================= */
  const B = {};
  /* Balıkçılar Loncası: sütunlu taş konak, alınlıkta altın balık, kubbeli fener, iki flama */
  B.lonca = () => sp(140, 108, `
    ${L('M16 58V16M124 58V16', 'pole', 1.6)}${flag(16, 17)}${flag(124, 17, 'awnA')}
    ${P('M6 56L24 33H116L134 56Z', 'roofR')}${P('M24 33H116L118.5 36.5H21.5Z', 'roofRl')}${tiles(10, 130, 37, 55, 13, 10)}
    ${R(61, 15, 18, 19, 'plas')}${R(61, 15, 5, 19, 'plasL')}${P('M56.5 17L70 3.5L83.5 17Z', 'roofB')}${P('M70 3.5L83.5 17H78Z', 'roofBd')}${win(66.5, 21, 7, 9, true)}${L('M70 3.5V-2', 'ir', 1)}${fishS(70.5, -3.5, .55, 'gold')}
    ${R(12, 55, 116, 46, 'plas')}${R(104, 55, 24, 46, 'plasS')}${R(12, 55, 116, 2.5, 'plasS')}
    ${R(42, 62, 56, 37, 'porch')}
    ${P('M34 58L70 35L106 58Z', 'plasL')}${L('M34 58L70 35L106 58', 'ln', 1)}${C(70, 49.5, 6.2, 'gold')}${fishS(69.5, 49.5, .78, 'dark')}
    ${R(32, 57, 76, 5, 'stoneL')}${R(32, 61, 76, 1.4, 'stoneD')}
    ${win(18, 66, 10, 19, true)}${win(112, 66, 10, 19, true)}
    ${glow(70, 86, 16)}${P('M62 99V79Q70 69 78 79V99Z', 'door')}${P('M64.2 79.5Q70 72.6 75.8 79.5Z', 'win')}${L('M70 80V99', 'ln', .8)}${C(72.4, 90, .8, 'gold')}
    ${rep(4, i => { const x = [36, 52, 82, 98][i]; return R(x, 63, 6, 34, 'plasL') + R(x + 4, 63, 2, 34, 'plasS') + R(x - 1.2, 61.6, 8.4, 2.4, 'stoneL') + R(x - 1.2, 96, 8.4, 2.6, 'stoneL'); })}
    ${R(8, 98.5, 124, 4, 'stone')}${R(46, 102.5, 48, 2.8, 'stoneL')}${R(42, 105.2, 56, 2.8, 'stone')}
    ${lamp(30, 76)}${lamp(110, 76)}`);

  /* Ambar: ahşap depo, çift kanatlı kapı, çatı vinci ve sallanan sandık, fıçılar */
  B.ambar = () => sp(100, 84, `
    ${P('M4 37L50 11L96 37Z', 'roofB')}${P('M50 11L96 37H84Z', 'roofBd')}${L('M4 37L50 11L96 37', 'hi', 1.2)}
    ${R(10, 36, 80, 46, 'wood')}${R(70, 36, 20, 46, 'woodD', 'opacity=".45"')}${rep(9, i => L(`M${18 + i * 8} 37V82`, 'ln', .7))}
    ${R(43, 19, 14, 13, 'woodD')}${L('M43 19h14v13h-14zM50 19v13', 'ln', .8)}
    ${L('M50 16H74', 'pole', 2.2)}${L('M72 16V22', 'rope', .8)}
    <g class="a-swing" style="transform-origin:72px 16px">${L('M72 22V40', 'rope', .8)}${crate(67, 50, 10)}</g>
    ${glow(50, 66, 15)}${R(33, 50, 34, 32, 'woodD')}${L('M33 50h34v32h-34zM50 50v32M33 50L50 82M67 50L50 82', 'woodL', 1.3)}${R(47.5, 64, 5, 2, 'iron')}
    ${R(8, 80, 84, 4, 'stone')}
    ${barrel(18, 84, 1.05)}${barrel(27, 84, .85)}${crate(74, 84, 9)}${crate(83, 84, 7.5)}${crate(77, 75, 7)}
    ${lamp(28, 54)}`);

  /* Gözcü Kulesi: taş kule, mazgallı tepe, yanan işaret ateşi, sancak, nöbetçi kulübesi */
  B.kule = () => sp(64, 156, `
    ${R(0, 124, 24, 30, 'wall')}${R(16, 124, 8, 30, 'wallS')}${P('M-3 126L12 112L27 126Z', 'roofB')}${P('M12 112L27 126H19Z', 'roofBd')}${win(6, 134, 7, 8)}${R(15, 142, 6, 12, 'door')}
    ${P('M20 154L24 50H40L44 154Z', 'wall')}${P('M33 50H40L44 154H35Z', 'wallS')}
    ${L('M23.2 70H40.8M22.4 90H41.6M21.6 110H42.4M20.8 130H43.2M28 50V70M36 70V90M27 90V110M37 110V130M29 130V154', 'jn', .7)}
    ${win(29.5, 76, 5, 8, true)}${win(29.5, 114, 5, 8, true)}${P('M28 154V142Q32 136 36 142V154Z', 'door')}
    ${R(17, 43, 30, 8, 'stoneD')}${rep(4, i => R(17 + i * 8.4, 36, 5, 8, 'stone'))}${R(17, 49.4, 30, 2, 'stoneL')}
    ${L('M45 44V16', 'pole', 1.3)}${flag(45, 16, 'awnA', 13)}
    ${glow(32, 26, 24, 'big on')}${L('M26.6 37L28.6 30H35.4L37.4 37', 'ir', 1.6)}<g class="a-fire">${P('M27.6 31Q32 11 36.4 31Z', 'fire')}${P('M30 31Q32 21 34 31Z', 'fireL')}</g>`);
  B.fener = B.kule;

  /* Ticaret Evi: kemerli çarşı katı, çizgili tente, yeşil kepenkler, sallanan terazili tabela */
  B.ticaret = () => sp(108, 92, `
    ${P('M2 33L15 14H93L106 33Z', 'roofR')}${P('M15 14H93L95.4 17.5H12.6Z', 'roofRl')}${tiles(6, 102, 18, 32, 11, 8)}
    ${R(80, 4, 9, 14, 'plasS')}${R(78.6, 2.6, 11.8, 2.6, 'stone')}
    ${R(8, 32, 92, 58, 'plas')}${R(82, 32, 18, 58, 'plasS')}${R(8, 32, 92, 2.4, 'plasS')}
    ${rep(4, i => { const x = 16 + i * 21; return R(x - 3.4, 38, 3, 12, 'shut') + R(x + 8.4, 38, 3, 12, 'shut') + win(x, 38, 8, 12); })}
    ${R(8, 56, 92, 2.2, 'stoneL')}
    ${rep(3, i => { const x = 14 + i * 28; return glow(x + 11, 80, 13) + P(`M${x} 90V72Q${x + 11} 58 ${x + 22} 72V90Z`, 'arch') + (i === 1 ? P(`M${x + 6} 90V78Q${x + 11} 72 ${x + 16} 78V90Z`, 'door') : R(x + 4, 82, 14, 8, 'woodL') + rep(3, j => C(x + 7 + j * 4, 81, 1.8, ['awnA', 'gold', 'green'][(i + j) % 3]))); })}
    <g class="a-sway" style="transform-origin:54px 58px">${rep(10, i => P(`M${9 + i * 9} 58H${18 + i * 9}V64.5Q${13.5 + i * 9} 68.5 ${9 + i * 9} 64.5Z`, i % 2 ? 'awnB' : 'awnA'))}</g>
    ${L('M100 46H110', 'ir', 1.4)}<g class="a-swing" style="transform-origin:107px 46px">${L('M107 46V51', 'rope', .8)}${C(107, 57, 6.2, 'woodD')}${C(107, 57, 5, 'gold')}${L('M107 53.6V60M103.6 55.4H110.4M103.6 55.4L102.6 58.6H104.8ZM110.4 55.4L109.4 58.6H111.6Z', 'dk', .8)}</g>
    ${R(4, 88.5, 100, 3.5, 'stone')}${crate(4, 92, 7)}${barrel(98, 92, .8)}`);

  /* Görev Panosu: çatılı ahşap pano, uçuşan kâğıtlar, mühür, fener */
  B.pano = () => sp(72, 72, `
    ${E(36, 71, 30, 3, 'shade')}
    ${R(12, 24, 5, 47, 'wood')}${R(55, 24, 5, 47, 'wood')}${R(15.4, 24, 1.6, 47, 'woodD')}${R(58.4, 24, 1.6, 47, 'woodD')}
    ${R(9, 27, 54, 32, 'woodD')}${R(11, 29, 50, 28, 'woodL')}${rep(3, i => L(`M11 ${36 + i * 7}H61`, 'ln', .6))}
    ${P('M3 28L36 11L69 28L66 30L36 15L6 30Z', 'roofB')}${P('M36 11L69 28L66 30L36 15Z', 'roofBd')}
    ${glow(36, 22, 10)}${L('M36 15V19', 'ir', 1)}${R(33.6, 19, 4.8, 6, 'lampg', 'rx="1"')}
    ${R(14, 32, 11, 13, 'paper', 'transform="rotate(-4 19 38)"')}${L('M16 36h7M16 39h7M16 42h5', 'ink', .7, 'transform="rotate(-4 19 38)"')}
    ${R(28, 31, 13, 16, 'paper', 'transform="rotate(3 34 39)"')}${L('M30.5 35h8M30.5 38h8M30.5 41h8M30.5 44h5', 'ink', .7, 'transform="rotate(3 34 39)"')}${C(34.5, 32.4, 1.5, 'awnA')}
    <g class="a-flap" style="transform-origin:50px 32px">${R(44, 32, 12, 14, 'paperG')}${L('M46 36h8M46 39h8M46 42h6', 'ink', .7)}${C(50, 33, 1.4, 'gold')}</g>
    ${R(16, 47.5, 9, 7, 'paperG', 'transform="rotate(5 20 51)"')}${R(44, 48.5, 11, 6.5, 'paper', 'transform="rotate(-3 49 52)"')}
    ${R(8, 68.5, 12, 3, 'stone')}${R(52, 68.5, 12, 3, 'stone')}
    ${P('M22 71L24 64H31L33 71Z', 'roofR')}${C(25, 62, 2.6, 'green')}${C(29.4, 61.4, 2.8, 'greenL')}${C(27.2, 59.6, 1.3, 'awnA')}`);

  /* Demirci: taş ocak, alevli kemer, tüten baca, örs, dönen bileği taşı */
  B.demirci = () => sp(108, 94, `
    ${smoke(63, 2, 4)}
    ${R(56, 6, 14, 36, 'stoneD')}${R(54.4, 4, 17.2, 3.4, 'stone')}${L('M56 16H70M56 26H70M63 6V16M60 16V26M66 26V36', 'ln', .7)}
    ${P('M2 42L41 17L80 42Z', 'roofB')}${P('M41 17L80 42H70Z', 'roofBd')}${L('M2 42L41 17L80 42', 'hi', 1.1)}
    ${R(8, 41, 68, 51, 'wall')}${R(62, 41, 14, 51, 'wallS')}
    ${L('M8 52H76M8 63H76M8 74H76M8 85H76M24 41V52M48 41V52M64 52V63M36 52V63M14 63V74M54 63V74M66 74V85M26 74V85', 'ln', .6)}
    ${glow(31, 76, 24, 'on fire')}${P('M14 92V68Q31 48 48 68V92Z', 'arch')}
    <g class="a-fire">${P('M22 92Q20 80 27 76Q26 83 31 81Q29 72 35 68Q36 78 40 80Q43 86 40 92Z', 'fire')}${P('M27 92Q26 85 31 83Q32 87 35 85Q37 89 35 92Z', 'fireL')}</g>
    ${R(17, 88, 28, 4, 'stoneD')}
    ${win(58, 60, 9, 11)}
    ${P('M74 56L104 62V92H74Z', 'wood')}${P('M72 54L106 61V64.5L72 57.5Z', 'roofBd')}${rep(4, i => L(`M${80 + i * 6} ${58 + i * 1.2}V92`, 'ln', .7))}
    ${C(92, 81, 7.5, 'stoneL')}<g class="a-spin" style="transform-origin:92px 81px">${L('M92 73.5V88.5M84.5 81H99.5M86.7 75.7L97.3 86.3M97.3 75.7L86.7 86.3', 'ln', .8)}</g>${C(92, 81, 1.6, 'iron')}${L('M86 92L92 81L98 92', 'pole', 1.6)}
    ${P('M48 92V88H51L50 85.4H62.5L66 83.6V86.6L61 88H57V92Z', 'iron')}
    ${L('M2 50H10', 'ir', 1.3)}<g class="a-swing" style="transform-origin:5px 50px">${L('M5 50V54', 'rope', .8)}${R(-1.5, 54, 13, 10, 'woodD', 'rx="1.5"')}${L('M2 61L8 56.5M6.4 55.4L9.6 58.2', 'gd', 1.6)}</g>
    ${R(4, 90.5, 102, 3.5, 'stone')}`);

  /* Zanaathane: ahşap çatkılı atölye, tezgâhlı kemer, asılı tabela, çatı penceresi */
  B.zanaat = () => sp(108, 94, `
    ${smoke(90, 2, 2, 'smokeL')}${R(86, 6, 9, 18, 'stoneD')}${R(84.6, 4.4, 11.8, 2.8, 'stone')}
    ${P('M2 40L24 16H84L106 40Z', 'roofB')}${P('M84 16L106 40H96L78 16Z', 'roofBd')}${L('M2 40L24 16H84L106 40', 'hi', 1.1)}${tiles(8, 100, 20, 39, 11, 8)}
    ${P('M43 27L54 15L65 27Z', 'roofBd')}${R(48, 21, 12, 8, 'plas')}${win(50.6, 22, 6.8, 6)}
    ${R(8, 38, 92, 22, 'plas')}${R(84, 38, 16, 22, 'plasS')}
    ${R(8, 38, 92, 2.6, 'woodD')}${R(8, 57.6, 92, 3, 'woodD')}${rep(5, i => R(8 + i * 22.35, 38, 2.6, 22, 'woodD'))}
    ${L('M11 57L29.6 41M33.4 41L52 57M55.6 57L74.4 41M78 41L96.6 57', 'beam', 2.2)}
    ${win(16.4, 44, 7, 9)}${win(61, 44, 7, 9)}
    ${R(8, 60, 92, 32, 'wall')}${R(84, 60, 16, 32, 'wallS')}${L('M8 70H100M8 81H100M22 60V70M50 70V81M72 60V70M32 81V92M64 81V92', 'jn', .6)}
    ${glow(30, 80, 15)}${P('M13 92V71Q30 59 47 71V92Z', 'arch')}${R(16, 81, 28, 3, 'woodL')}${L('M19 84V92M41 84V92', 'pole', 1.8)}
    ${P('M20 81L22 76H32L30 81Z', 'stoneL')}${L('M34 80.4L42 74', 'pole', 1.4)}${P('M40.6 72.6L45 73.4L44 77.4L40 76.2Z', 'iron')}
    ${P('M56 92V73Q63 66 70 73V92Z', 'door')}${L('M63 69.6V92', 'ln', .8)}${C(65.4, 82, .9, 'gold')}${win(78, 68, 9, 11)}
    ${L('M100 62H111', 'ir', 1.4)}<g class="a-swing" style="transform-origin:108px 62px">${L('M108 62V66', 'rope', .8)}${R(101, 66, 14, 11, 'woodD', 'rx="1.6"')}${L('M104 74L111 68.6M109 67.4L112.4 70.4', 'gd', 1.6)}</g>
    ${R(4, 90.5, 100, 3.5, 'stone')}${barrel(100, 94, .8)}${crate(-2, 94, 8)}${R(74, 86, 16, 2.4, 'woodL')}${R(76, 83.6, 12, 2.4, 'wood')}`);

  /* İşlemehane: su değirmeni. Taş zemin kat, ahşap üst kat, dönen çark, tüten baca, kütük ve cevher */
  B.isleme = () => sp(104, 90, `
    ${smoke(22, 4, 3, 'smokeL')}${R(17, 8, 10, 24, 'stoneD')}${R(15.6, 6.4, 12.8, 2.8, 'stone')}
    ${P('M2 38L38 14L74 38Z', 'roofR')}${P('M38 14L74 38H63Z', 'roofRd')}${L('M2 38L38 14L74 38', 'hi', 1.1)}
    ${R(8, 37, 60, 22, 'wood')}${rep(7, i => L(`M${15 + i * 8} 38V58`, 'ln', .6))}${win(15, 43, 9, 9)}${win(46, 43, 9, 9)}
    ${R(8, 58, 60, 30, 'wall')}${L('M8 68H68M8 78H68M24 58V68M48 58V68M14 68V78M36 68V78M58 68V78M26 78V88M50 78V88', 'jn', .6)}${R(54, 37, 14, 51, 'woodD', 'opacity=".3"')}
    ${glow(37, 78, 13)}${P('M29 88V71Q37 63 45 71V88Z', 'door')}${L('M37 67.4V88', 'ln', .8)}
    ${P('M62 90H106V84Q86 79 62 84Z', 'chan')}${L('M66 86q3 -1.6 6 0t6 0M88 87q3 -1.6 6 0t6 0', 'foam', 1)}
    ${L('M84 62V88', 'pole', 3.4)}
    <g class="a-spin" style="transform-origin:84px 62px;animation-duration:15s"><circle cx="84" cy="62" r="21" class="s-wheel" fill="none" stroke-width="3.4"/><circle cx="84" cy="62" r="13" class="s-wheel" fill="none" stroke-width="1.4"/>
      ${rep(8, i => `<g transform="rotate(${i * 45} 84 62)">${L('M84 62V41', 'pole', 1.6)}${R(80, 38, 8, 4.4, 'woodL', 'rx="1"')}</g>`)}</g>${C(84, 62, 3.2, 'iron')}
    ${R(4, 86.5, 60, 3.5, 'stone')}
    ${rep(3, i => C(3 + i * 7.4, 86, 3.2, 'woodL') + C(3 + i * 7.4, 86, 1.5, 'woodD'))}${rep(2, i => C(6.7 + i * 7.4, 80.6, 3.2, 'woodL') + C(6.7 + i * 7.4, 80.6, 1.5, 'woodD'))}
    ${crate(50, 90, 9)}${C(53, 80, 2.6, 'stoneL')}${C(56.6, 79.4, 2.4, 'gold')}`);

  /* Balık Hali: direkli açık çarşı, çizgili saçak, buzlu tezgâhlar, asılı fenerler */
  B.hal = () => sp(128, 90, `
    ${P('M2 35L20 14H108L126 35Z', 'roofR')}${P('M20 14H108L110.6 17.4H17.4Z', 'roofRl')}${tiles(6, 122, 18, 34, 14, 10)}
    ${C(64, 15, 8.4, 'woodD')}${C(64, 15, 7, 'gold')}${fishS(63.4, 15, .95, 'dark')}
    ${R(10, 35, 108, 53, 'porch')}
    ${rep(3, i => glow(34 + i * 30, 50, 15, 'big'))}
    ${rep(4, i => R(9 + i * 35.4, 35, 4, 53, 'wood') + R(11.6 + i * 35.4, 35, 1.4, 53, 'woodD'))}
    ${rep(3, i => { const x = 16 + i * 35.4; return R(x, 68, 27, 3, 'woodL') + R(x + 1, 71, 25, 15, 'wood') + L(`M${x + 1} 76h25M${x + 9.5} 71v15M${x + 18} 71v15`, 'ln', .6)
      + P(`M${x + 1.5} 68Q${x + 13.5} 61 ${x + 25.5} 68Z`, 'ice') + fishS(x + 8, 65.6, .8, 'fish', -12) + fishS(x + 15, 64.4, .85, 'fishD', 8) + fishS(x + 21, 66, .7, i === 1 ? 'awnA' : 'fish', -4); })}
    ${rep(3, i => L(`M${34 + i * 30} 35V46`, 'rope', .7) + R(31.6 + i * 30, 46, 4.8, 6, 'lampg', 'rx="1"') + R(31 + i * 30, 45, 6, 1.4, 'iron'))}
    <g class="a-sway" style="transform-origin:64px 35px">${rep(12, i => P(`M${4 + i * 10} 35H${14 + i * 10}V41.5Q${9 + i * 10} 46 ${4 + i * 10} 41.5Z`, i % 2 ? 'awnB' : 'awnA'))}</g>
    ${R(4, 86.5, 120, 3.5, 'stone')}
    ${P('M2 90L4 81H13L15 90Z', 'woodL')}${E(8.5, 81, 4.6, 1.4, 'fish')}${P('M113 90L115 82H124L126 90Z', 'woodL')}${E(119.5, 82, 4.6, 1.4, 'fishD')}`);

  /* Tersane: açık cepheli tekne hangarı, kızakta kaburgalı gövde, vinç ve sallanan kalas, çapa */
  B.tersane = () => sp(112, 92, `
    ${P('M2 37L40 12L78 37Z', 'roofB')}${P('M40 12L78 37H68Z', 'roofBd')}${L('M2 37L40 12L78 37', 'hi', 1.1)}
    ${R(8, 36, 64, 54, 'wood')}${R(60, 36, 12, 54, 'woodD', 'opacity=".5"')}${rep(7, i => L(`M${15 + i * 8} 37V90`, 'ln', .6))}
    ${glow(38, 72, 22)}${P('M14 90V62Q38 40 62 62V90Z', 'arch')}
    ${P('M18 80Q38 92 60 78L57 74Q38 84 21 76Z', 'woodL')}${rep(6, i => L(`M${24 + i * 6} ${77.6 + Math.sin(i * .7) * 1.6}Q${25 + i * 6} ${68 - Math.sin(i * .6) * 3} ${23 + i * 6} ${63 - Math.sin(i * .6) * 3}`, 'rib', 1.3))}
    ${L('M20 90L26 82M56 90L50 82M38 90V84', 'pole', 1.6)}
    ${C(40, 27, 4.6, 'woodD')}${L('M40 23.6V30.4M36.6 27H43.4M37.6 24.6L42.4 29.4M42.4 24.6L37.6 29.4', 'gd', .9)}
    ${R(4, 88.5, 72, 3.5, 'stone')}
    ${L('M90 92V16', 'pole', 3)}${L('M90 20L110 31', 'pole', 2.4)}${L('M90 34L100 25.6', 'pole', 1.6)}${L('M84 92L90 78L96 92', 'pole', 1.8)}
    <g class="a-swing" style="transform-origin:109px 31px">${L('M109 31V52', 'rope', .8)}${L('M109 52L101 57M109 52L117 57', 'rope', .7)}${R(98, 57, 22, 3.4, 'woodL')}</g>
    ${R(78, 86, 22, 2.6, 'woodL')}${R(80, 83.4, 18, 2.6, 'wood')}${R(82, 80.8, 14, 2.6, 'woodL')}
    ${L('M67 70V86M63.4 73.4H70.6M61 82Q67 90 73 82', 'anch', 1.7)}<circle cx="67" cy="68.6" r="1.9" class="s-anch" stroke-width="1.4" fill="none"/>`);

  /* Büyük İskele: denize uzanan ahşap iskele, fenerli direkler, takılı kayık */
  B.iskele = () => sp(96, 128, `
    ${P('M34 0H62L72 112H24Z', 'shadeW', 'transform="translate(5 5)"')}
    ${rep(5, i => R(29.4 - i * 1.96, 18 + i * 22, 3.4, 14, 'woodD') + R(63.2 + i * 1.96, 18 + i * 22, 3.4, 14, 'woodD'))}
    ${P('M34 0H62L72 112H24Z', 'woodL')}${rep(13, i => L(`M${34 - (i + 1) * .77} ${(i + 1) * 8.6}H${62 + (i + 1) * .77}`, 'ln', .7))}
    ${P('M34 0H38L29 112H24Z', 'wood', 'opacity=".5"')}
    ${L('M34 0L24 112M62 0L72 112', 'hi', 1)}
    ${R(22, 110, 52, 5, 'wood')}
    ${post(30.4, 40, 22)}${post(65.6, 40, 22)}${post(25, 104, 24)}${post(71, 104, 24)}
    ${L('M30.4 24Q28 36 28.6 52M65.6 24Q68 36 67.4 52', 'rope', .8)}
    ${E(31, 103, 5, 1.4, 'shade')}${R(27.4, 93, 7.2, 9.6, 'roofB', 'rx="2.4"')}${R(26, 100.6, 6, 3, 'woodD', 'rx="1.2"')}${C(31, 90.4, 2.8, 'skin')}${P('M26.4 89.6H35.6L33.8 86.4H28.2Z', 'gold')}
    <g class="a-rod" style="transform-origin:28px 96px">${L('M28 96L6 74', 'pole', 1.2)}${L('M6 74V104', 'rope', .5)}</g>
    <g class="a-bobber">${C(6, 106, 2, 'awnA')}${C(6, 105.2, 1.1, 'white')}${E(6, 107.6, 5, 1.2, 'foamF', 'opacity=".5"')}</g>
    <g class="a-bob" style="transform-origin:86px 92px">${P('M76 86Q86 82 96 86Q95 96 86 98Q77 96 76 86Z', 'wood')}${P('M78.4 87Q86 84.4 93.6 87Q93 93.6 86 95.4Q79 93.6 78.4 87Z', 'woodL')}${L('M79.6 90.4H92.4', 'ln', 1)}</g>${L('M72 84Q74 86 76.6 86.6', 'rope', .8)}`);

  const spr = id => B[id]();
  // yapıyı başka bir SVG'nin içine yerleştir (x: orta, y: taban)
  const nest = (id, cx, base, s = 1) => { const m = /viewBox="0 0 (\d+) (\d+)"/.exec(B[id]()), w = +m[1], h = +m[2];
    return B[id]().replace(/<svg class="scn-sp[^"]*"/, `<svg x="${(cx - w * s / 2).toFixed(1)}" y="${(base - h * s).toFixed(1)}" width="${(w * s).toFixed(1)}" height="${(h * s).toFixed(1)}"`); };

  /* ---------- ortak parçalar: gök, ağaç, kayık, martı, dalga ---------- */
  const DEFS = '';      // ortak geçişler index.html'deki genel <defs> içinde (sc-glow, sc-sun, sc-moon, sc-seaD, sc-seaN)
  const sky = (sx, sy, w, h, seed = 3, sr = 46) => { const r = rnd(seed);
    return `<g class="sk-stars">${rep(Math.round(w * h / 1900), () => `<circle cx="${(r() * w).toFixed(1)}" cy="${(r() * h).toFixed(1)}" r="${(r() * .8 + .35).toFixed(2)}" class="k-star a-tw" style="animation-delay:${(-r() * 4).toFixed(1)}s"/>`)}</g>
      <g class="sk-sun"><circle cx="${sx}" cy="${sy}" r="${sr}" fill="url(#sc-sun)" class="a-breath"/><circle cx="${sx}" cy="${sy}" r="${sr * .2}" fill="#fff4d0"/></g>
      <g class="sk-moon"><circle cx="${sx}" cy="${sy}" r="${sr * .8}" fill="url(#sc-moon)"/><path transform="translate(${sx} ${sy}) rotate(-24) scale(${(sr * .24).toFixed(2)})" d="M0 -1A1 1 0 1 0 0 1A.74 1 0 1 1 0 -1Z" fill="#eef2ff"/></g>`; };
  const cloud = (x, y, s = 1, d = 0, dur = 110) => `<g class="a-cloud" style="animation-duration:${dur}s;animation-delay:${d}s"><g transform="translate(${x} ${y}) scale(${s})" class="k-cloud">
    <ellipse cx="0" cy="0" rx="26" ry="7"/><ellipse cx="-10" cy="-5" rx="12" ry="7"/><ellipse cx="6" cy="-7" rx="14" ry="9"/><ellipse cx="18" cy="-2" rx="10" ry="5"/></g></g>`;
  const cyp = (x, y, h = 26) => P(`M${x} ${y}Q${x - h * .2} ${y - h * .45} ${x} ${y - h}Q${x + h * .2} ${y - h * .45} ${x} ${y}Z`, 'greenD') + P(`M${x} ${y}Q${x + h * .2} ${y - h * .45} ${x} ${y - h}Z`, 'cypS');
  const tree = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${R(-1.2, -9, 2.4, 9, 'woodD')}${C(-4, -12, 6.5, 'greenD')}${C(4, -13, 7, 'green')}${C(0, -18, 6.5, 'green')}${C(2.5, -17, 4, 'greenL')}</g>`;
  const bush = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${C(-4, -3, 4.5, 'greenD')}${C(2, -4.4, 5.4, 'green')}${C(6.4, -2.6, 3.6, 'greenL')}</g>`;
  const hut = (x, y, s = 1, roof = 'roofR') => `<g transform="translate(${x} ${y}) scale(${s})">${R(-7, -9, 14, 9, 'plas')}${R(2, -9, 5, 9, 'plasS')}${P('M-9 -9L0 -16L9 -9Z', roof)}${R(-2, -6, 3.4, 3.6, 'win')}</g>`;
  const boat = (x, y, s = 1, c = 'awnA', d = 0) => `<g class="a-bob" style="transform-origin:${x}px ${y}px;animation-delay:${d}s"><g transform="translate(${x} ${y}) scale(${s})">
    ${P('M-15 -5H15Q13 3 7 4H-8Q-13 3 -15 -5Z', 'wood')}${P('M-15 -5H15L14.4 -2.6H-14.2Z', c)}${L('M0 -5V-24', 'pole', 1.4)}${P('M1 -23Q9 -15 2 -8Z', 'white')}${L('M-12 5q3 -1.6 6 0t6 0t6 0t6 0', 'foam', 1)}</g></g>`;
  const gull = (x, y, s, dur, d) => `<g class="a-fly" style="animation-duration:${dur}s;animation-delay:${d}s"><g transform="translate(${x} ${y}) scale(${s})"><path d="M-7 0Q-3.5 -4.4 0 0Q3.5 -4.4 7 0" class="s-gull a-flapw" fill="none" stroke-width="1.5"/></g></g>`;
  const waves = (y, n, x0, step, cls, op, w = 1.1) => `<g class="a-wave ${cls}" opacity="${op}" style="--p:${step}px">${rep(n, i => L(`M${x0 + i * step} ${y + (i % 3) * 2.4}q${step * .18} -2.6 ${step * .36} 0`, 'foam', w))}</g>`;
  const walker = (x, y, c, dx, dur, d = 0) => `<g class="a-walk" style="--dx:${dx}px;animation-duration:${dur}s;animation-delay:${d}s"><g transform="translate(${x} ${y})">${E(0, 0, 3.4, 1, 'shade')}${R(-1.8, -8.4, 3.6, 8, c, 'rx="1.4"')}${C(0, -10.2, 2, 'skin')}${P('M-3 -11.4H3L1.8 -13.4H-1.8Z', 'gold')}</g></g>`;
  const mill = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">${P('M-6 0L-4 -20H4L6 0Z', 'plas')}${P('M0 -20H4L6 0H1Z', 'plasS')}${P('M-5.4 -20L0 -27L5.4 -20Z', 'roofB')}${R(-1.4, -8, 2.8, 8, 'door')}
    <g class="a-spin" style="transform-origin:0px -21px;animation-duration:14s">${rep(4, i => `<g transform="rotate(${i * 90} 0 -21)">${L('M0 -21V-39', 'pole', 1)}${P('M.6 -38H5.4L4.6 -25H.6Z', 'white', 'opacity=".9"')}</g>`)}</g>${C(0, -21, 1.3, 'iron')}</g>`;
  const cat = (x, y) => `<g transform="translate(${x} ${y})">${E(0, 0, 5, 1.1, 'shade')}${P('M-3.4 0Q-4.6 -5.6 -1 -6.6Q2.6 -6.4 3 0Z', 'dark')}${C(-1.6, -8, 2.4, 'dark')}${P('M-3.8 -9.2L-3.2 -11.8L-1.8 -9.8ZM-1.2 -9.9L.2 -11.8L.6 -9.2Z', 'dark')}
    <path class="s-cat a-swing" style="transform-origin:3px -1px" d="M3 -1Q7 -2 6.6 -6.4" stroke-width="1.5" fill="none" stroke-linecap="round"/></g>`;
  const perch = (x, y) => `<g transform="translate(${x} ${y})">${P('M-3.6 -1Q-1 -5.6 3 -3.4L5.4 -3.8L3.6 -1.6Q1 .6 -3.6 -1Z', 'white')}${C(-3, -3.6, 1.7, 'white')}${P('M-4.6 -3.6L-6.6 -3L-4.6 -2.8Z', 'gold')}
    <path class="k-fishD a-wing" style="transform-origin:0px -3px" d="M-1 -3Q1.6 -6.4 4.4 -3.2Q1.6 -2 -1 -3Z"/>${L('M-.6 -.6V1.4M1.2 -.4V1.4', 'gd', .7)}</g>`;
  const rower = (y, dur, d) => `<g class="a-row" style="animation-duration:${dur}s;animation-delay:${d}s"><g class="a-bob" style="transform-origin:0px ${y}px"><g transform="translate(0 ${y})">
    ${P('M-17 -4H17Q15 3 8 4H-9Q-15 3 -17 -4Z', 'wood')}${P('M-17 -4H17L16.4 -1.8H-16.2Z', 'roofB')}${R(-2.4, -11.4, 4.8, 8, 'awnA', 'rx="1.8"')}${C(0, -13.4, 2.4, 'skin')}${P('M-3.6 -14.4H3.6L2.2 -17H-2.2Z', 'gold')}
    <g class="a-oar" style="transform-origin:0px -5px">${L('M0 -5L-13 4', 'pole', 1.3)}${E(-13.6, 4.4, 2.6, 1, 'woodL')}</g>${L('M-14 6q3 -1.6 6 0t6 0t6 0t6 0t6 0', 'foam', 1)}</g></g></g>`;
  const buoy = (x, y) => `<g class="a-bob" style="transform-origin:${x}px ${y}px">${glow(x, y - 21, 10, 'big on')}${P(`M${x - 5} ${y}L${x - 2.6} ${y - 13}H${x + 2.6}L${x + 5} ${y}Z`, 'awnA')}${R(x - 3.7, y - 8.4, 7.4, 3, 'white')}${L(`M${x} ${y - 13}V${y - 19}`, 'ir', 1.2)}${C(x, y - 20.6, 2, 'lampg')}${E(x, y + 1, 9, 2.2, 'foamF', 'opacity=".5"')}</g>`;
  const blocks = (y, h, x0 = -170, x1 = 560, step = 22) => { let d = `M${x0} ${y + h / 2}H${x1}`; for (let x = x0, i = 0; x < x1; x += step / 2, i++) d += `M${x} ${i % 2 ? y + h / 2 : y}v${h / 2}`; return L(d, 'jn', .8); };
  const stairs = (x0, x1, y0, y1) => P(`M${x0} ${y0}H${x1}L${x1 + 5} ${y1}H${x0 - 5}Z`, 'path') + rep(Math.floor((y1 - y0) / 7), i => L(`M${x0 - i * .35} ${y0 + i * 7 + 4}H${x1 + i * .35}`, 'jn', 1))
    + L(`M${x0} ${y0}L${x0 - 5} ${y1}M${x1} ${y0}L${x1 + 5} ${y1}`, 'retD', 2.2);

  /* =========================================================
     LİMAN: 390×620 sahne. Üstten alta: gök, uzak dağlar, tepe, üç set (yapılar), rıhtım, liman suyu
     ========================================================= */
  const HB = [   // id, ad, açtığı pencere, orta x, taban y, ölçek, çizim
    ['ambar', 'Depo', 'inv', 60, 238, 1, 'ambar'], ['lonca', 'Lonca Sarayı', 'dex', 200, 238, 1, 'lonca'], ['fener', 'Gözcü Kulesi', 'fener', 342, 216, 1, 'kule'],
    ['demirci', 'Demirci', 'demirci', 62, 354, 1, 'demirci'], ['isleme', 'İşlemehane', 'isleme', 196, 354, .96, 'isleme'], ['zanaat', 'Zanaathane', 'zanaat', 326, 354, 1, 'zanaat'],
    ['tersane', 'Tersane', 'tersane', 62, 470, 1, 'tersane'], ['ticaret', 'Ticaret Evi', 'ticaret', 198, 470, 1, 'ticaret'], ['hal', 'Balık Hali', 'hal', 334, 470, .84, 'hal'],
    ['pano', 'Görev Panosu', 'quests', 204, 586, 1, 'pano'], ['iskele', 'Şehir Kapısı', 'sea', 308, 694, 1, 'kapi'],
  ];
  const fountain = (x, y) => `${E(x, y + 1, 24, 8, 'shade')}${E(x, y, 22, 7.4, 'stoneL')}${E(x, y - 1.2, 18, 5.4, 'chan')}${R(x - 2.6, y - 20, 5.2, 19, 'stone')}${E(x, y - 20, 9, 3, 'stoneL')}${E(x, y - 20.8, 6.6, 1.8, 'chan')}
    <path d="M${x} ${y - 22}Q${x - 9} ${y - 30} ${x - 12} ${y - 5}M${x} ${y - 22}Q${x + 9} ${y - 30} ${x + 12} ${y - 5}M${x} ${y - 23}V${y - 30}" class="s-foam a-breath" stroke-width="1.2" fill="none"/>
    <circle cx="${x - 12}" cy="${y - 3}" r="1.6" class="k-foamF a-tw"/><circle cx="${x + 12}" cy="${y - 3}" r="1.6" class="k-foamF a-tw" style="animation-delay:-1.2s"/>`;
  const stall = (x, y, c) => `${R(x - 13, y - 12, 26, 12, 'wood')}${R(x - 14, y - 14, 28, 3, 'woodL')}${L(`M${x - 13} ${y - 14}V${y - 26}M${x + 13} ${y - 14}V${y - 26}`, 'pole', 1.6)}
    <g class="a-sway" style="transform-origin:${x}px ${y - 27}px">${rep(4, i => P(`M${x - 16 + i * 8} ${y - 27}h8v5q-4 3.4 -8 0z`, i % 2 ? 'awnB' : c))}</g>${rep(3, i => C(x - 7 + i * 7, y - 15.4, 2.4, ['awnA', 'gold', 'green'][i]))}`;
  const harborBg = () => `<svg class="lm-bg scn" viewBox="0 0 390 700" overflow="visible" aria-hidden="true">${DEFS}
    ${sky(258, 74, 390, 150, 5, 46)}
    ${cloud(60, 104, .8, -20, 120)}${cloud(306, 40, .7, -70, 150)}${cloud(170, 84, .55, -110, 100)}
    ${P('M-170 156V120Q-90 98 -30 114Q24 86 82 106Q132 84 192 102Q252 80 302 100Q362 88 422 106Q482 94 560 112V156Z', 'far1')}
    ${P('M-170 170V134Q-60 114 30 130Q112 108 200 126Q282 112 342 128Q432 114 560 134V170Z', 'far2')}
    ${P('M-170 244V170Q-40 150 60 160Q150 142 240 154Q300 148 340 162Q440 152 560 172V244Z', 'hill')}
    ${P('M-170 244V196Q-60 180 40 190Q140 172 250 186Q330 178 400 192Q470 184 560 198V244Z', 'hillL')}
    ${cyp(12, 172, 24)}${cyp(24, 176, 30)}${cyp(120, 166, 26)}${cyp(132, 170, 20)}${cyp(268, 162, 28)}${cyp(386, 176, 24)}
    ${mill(296, 174, 1)}${hut(98, 180, 1)}${hut(256, 174, .9, 'roofB')}${hut(160, 172, .8)}${smoke(100, 162, 2, 'smokeL')}${bush(40, 196)}${bush(180, 186, .9)}${bush(300, 190)}${bush(232, 200, .8)}
    ${P('M292 244Q296 216 316 208Q330 196 352 202Q374 204 386 220Q398 232 404 244Z', 'rock')}${P('M316 208Q330 196 352 202L340 214Z', 'rockL')}${P('M352 202Q374 204 386 220Q398 232 404 244H372Z', 'rockD')}
    ${R(-170, 234, 730, 9, 'path')}${R(-170, 234, 730, 1.6, 'pathL')}${R(-170, 243, 730, 18, 'ret')}${blocks(243, 18)}${R(-170, 259.4, 730, 2.6, 'retD')}
    ${P('M-170 262H560V352H-170Z', 'ter')}${rep(7, i => bush(-4 + i * 62 + (i % 2) * 14, 300 + (i % 3) * 12, .9 + (i % 2) * .3))}${rep(5, i => L(`M${-20 + i * 96} ${330 + (i % 2) * 6}q22 -5 44 0`, 'jn', 1))}
    ${stairs(116, 142, 243, 352)}
    ${R(-170, 350, 730, 9, 'path')}${R(-170, 350, 730, 1.6, 'pathL')}${R(-170, 359, 730, 18, 'ret')}${blocks(359, 18)}${R(-170, 375.4, 730, 2.6, 'retD')}
    ${P('M-170 378H560V468H-170Z', 'ter2')}${rep(7, i => bush(22 + i * 58 + (i % 2) * 10, 420 + (i % 3) * 10, 1 + (i % 2) * .25))}
    ${stairs(244, 270, 359, 468)}
    ${tree(146, 352, 1)}${tree(250, 236, .9)}${tree(124, 236, .8)}${tree(278, 352, .8)}${tree(130, 468, .95)}${tree(388, 352, .9)}
    ${R(-170, 466, 730, 11, 'quay')}${R(-170, 466, 730, 1.8, 'pathL')}${rep(34, i => L(`M${-160 + i * 21.5} 468v8`, 'jn', .8))}
    ${R(-170, 477, 730, 13, 'quayD')}${blocks(477, 13, -170, 560, 26)}
    ${R(160, 488, 400, 320, 'quay')}${rep(11, i => L(`M166 ${506 + i * 17}H560`, 'jn', .7))}${rep(22, i => L(`M${176 + i * 18} 490v208`, 'jn', .5, 'opacity=".5"'))}
    <path d="M257 488Q262 560 304 650" class="s-roadL" stroke-width="30" fill="none" opacity=".55"/>
    ${R(160, 488, 400, 5, 'shadeW')}
    <defs><clipPath id="lm-inlet"><rect x="-170" y="488" width="336" height="330"/></clipPath></defs>
    <rect x="-170" y="488" width="336" height="320" fill="url(#sc-seaD)"/><rect x="-170" y="488" width="336" height="320" fill="url(#sc-seaN)" class="nt-op"/>
    ${R(-170, 488, 336, 5, 'shadeW')}
    <g clip-path="url(#lm-inlet)">
      <g class="refl">${rep(2, i => `<rect x="${[126, 30][i] - 1.5}" y="493" width="3" height="${22 + i * 8}" rx="1.5" fill="#ffd27a" class="a-breath" style="animation-delay:${-i * .8}s"/>`)}</g>
      ${waves(506, 8, -150, 44, '', .5)}${waves(540, 7, -140, 52, 'b', .4, 1.3)}${waves(584, 6, -150, 60, 'c', .34, 1.5)}${waves(630, 6, -140, 64, 'b', .3, 1.7)}${waves(676, 5, -150, 72, '', .28, 1.9)}
      <g class="sk-sun">${rep(6, i => { const x = [24, 66, 140, 108, 40, 150][i], y = 512 + (i * 53) % 176; return `<path d="M${x - 1.9} ${y}h3.8M${x} ${y - 1.9}v3.8" class="s-spark a-tw" stroke-width=".8" opacity=".75" style="animation-delay:${(-i * .37).toFixed(2)}s"/>`; })}</g>
      ${boat(128, 664, .7, 'roofB', -2.4)}<g class="a-jump">${fishS(60, 652, 1.1, 'fish', -30)}</g>
    </g>
    ${R(162, 488, 7, 220, 'quayD')}${rep(9, i => L(`M162 ${500 + i * 22}h7`, 'jn', .8))}${[520, 590, 650].map(y => R(160, y, 5, 8, 'iron', 'rx="1.6"')).join('')}
    ${E(172, 517, 5, 1.4, 'shade')}${R(168.4, 507, 7.2, 9.6, 'roofB', 'rx="2.4"')}${C(172, 504.4, 2.8, 'skin')}${P('M167.4 503.6H176.6L174.8 500.4H169.2Z', 'gold')}
    <g class="a-rod" style="transform-origin:169px 510px">${L('M169 510L147 488', 'pole', 1.2)}${L('M147 488V520', 'rope', .5)}</g><g class="a-bobber">${C(147, 522, 2, 'awnA')}${C(147, 521.2, 1.1, 'white')}</g>
    ${rep(13, i => R(385 + 1 + i * 12.2, 642, 7.4, 8, 'wall'))}${R(385, 648, 180, 60, 'wall')}${R(385, 680, 180, 28, 'wallS')}${rep(4, i => R(166 + 1 + i * 12.2, 642, 7.4, 8, 'wall'))}${R(166, 648, 50, 60, 'wall')}${R(166, 680, 50, 28, 'wallS')}
    ${L('M166 660H216M385 660H565M166 672H216M385 672H565M180 648V660M200 660V672M400 648V660M430 660V672', 'jn', .8)}
    ${fountain(318, 560)}${stall(366, 534, 'awnA')}${stall(190, 540, 'roofB')}
    ${tree(246, 530, .8)}${tree(376, 610, .9)}${barrel(352, 600, .9)}${barrel(360, 602, .8)}${crate(232, 640, 9)}${crate(241, 640, 7.5)}
    <g class="nt-only">${rep(11, i => { const x = [20, 52, 96, 150, 178, 226, 262, 302, 346, 372, 208][i], y = [300, 420, 312, 296, 428, 318, 300, 430, 306, 422, 196][i]; return `<g class="a-drift" style="animation-duration:${9 + i % 4 * 3}s;animation-delay:${-i * 1.3}s"><circle cx="${x}" cy="${y}" r="1.3" fill="#e8fa9a" class="a-tw" style="animation-delay:${(-i * .7).toFixed(1)}s"/><circle cx="${x}" cy="${y}" r="4" fill="#e8fa9a" opacity=".16" class="a-tw" style="animation-delay:${(-i * .7).toFixed(1)}s"/></g>`; })}
      <g class="a-shoot"><path d="M0 0L-26 9" stroke="#fff" stroke-width="1.3" stroke-linecap="round" opacity=".9"/><circle r="1.5" fill="#fff"/></g></g>
    <g class="sk-sun">${rep(3, i => `<g class="a-flit" style="animation-duration:${11 + i * 4}s;animation-delay:${-i * 3}s"><g transform="translate(${[84, 222, 318][i]} ${[306, 412, 300][i]})"><path d="M0 0Q-3.4 -4.6 -4.6 -1Q-3 1.6 0 0Q3 1.6 4.6 -1Q3.4 -4.6 0 0Z" class="k-${['gold', 'awnB', 'awnA'][i]} a-flapb"/></g></g>`)}</g>
    ${cat(283, 236)}${perch(128, 461)}${cat(262, 612)}
    ${[128, 276, 386].map(x => R(x - 2.4, 462, 4.8, 7, 'iron', 'rx="1.6"') + R(x - 3.4, 461, 6.8, 2, 'iron', 'rx="1"')).join('')}
    ${post(110, 236, 22)}${post(292, 236, 22)}${post(134, 352, 22)}${post(254, 352, 22)}${post(126, 468, 22)}${post(274, 468, 22)}${post(390, 468, 22)}${post(190, 628, 22)}${post(350, 636, 22)}
  </svg>`;
  const harborFg = () => `<svg class="lm-fg scn" viewBox="0 0 390 700" overflow="visible" aria-hidden="true">
    ${walker(30, 241.5, 'awnA', 300, 46)}${walker(360, 357.5, 'roofB', -310, 52, -20)}${walker(120, 474, 'green', 240, 40, -9)}${walker(190, 618, 'awnA', 170, 36, -12)}${walker(372, 578, 'shut', -150, 44, -30)}
    ${gull(-20, 96, 1, 34, 0)}${gull(-20, 140, .75, 46, -18)}
  </svg>`;
  const artOf = k => k === 'kapi' ? W.kapi() : B[k]();
  const harbor = () => `<div class="lm-stage"><i class="sky"></i>${harborBg()}<button class="lm-ship" data-open="tersane" data-lmship aria-label="Gemin"></button>
    ${HB.map(([id, name, open, cx, base, s, art], i) => { const m = /viewBox="0 0 (\d+) (\d+)"/.exec(artOf(art)), w = m[1] * s, h = m[2] * s;
      return `<button class="lmb lmb-${id}" data-open="${open}" aria-label="${name}" style="left:${((cx - w / 2) / 3.9).toFixed(2)}%;top:${((base - h) / 7).toFixed(2)}%;width:${(w / 3.9).toFixed(2)}%;--i:${i}">${artOf(art)}
        ${id === 'iskele' ? '' : `<span class="lm-tag"><b>${name}</b><small data-bs="${id}"></small><i class="lm-dot" data-bd="${id}"></i></span>`}</button>`; }).join('')}
    <i class="lm-moor"></i>
    <button class="lm-go" data-open="sea"><span class="btn primary"><span id="lmGoTx">Şehirden Çık</span><svg class="ic"><use href="#i-chev"/></svg></span><small data-bs="iskele"></small></button>
    ${harborFg()}</div>`;

  /* gemi: ShipArt.side'ın yalnız gemisi (zeminsiz), sahnelere konur */
  const bareShip = id => { const t = document.createElement('div'); t.innerHTML = ShipArt.side(id);
    const s = t.firstElementChild, d = s.querySelector('defs'), b = s.querySelector('.sh-bob');
    return `<svg class="ship-svg ship-bare" viewBox="0 0 240 150" overflow="visible" aria-hidden="true">${d ? d.outerHTML : ''}${b ? b.outerHTML : ''}</svg>`
      .replace(/(id="|url\(#)(sw|sk|sg|wd|sl)-/g, '$1b$2-'); };

  /* =========================================================
     ANA EKRAN: liman kartı (kıyıdan şehir silueti) ve açık deniz kartı
     ========================================================= */
  const homeCity = () => `<svg class="scn hc-svg" viewBox="0 0 360 230" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${DEFS}
    ${sky(62, 46, 360, 110, 9, 44)}${cloud(120, 30, .8, -30, 120)}${cloud(280, 52, .6, -80, 150)}
    ${P('M-20 122V92Q40 70 96 86Q150 62 210 80Q270 64 320 82Q352 74 380 86V122Z', 'far1')}
    ${P('M-20 150V112Q60 92 140 104Q220 88 300 104Q340 98 380 108V150Z', 'hill')}
    ${cyp(22, 112, 22)}${cyp(34, 116, 16)}${cyp(232, 100, 22)}${cyp(244, 104, 16)}${hut(60, 116, .9)}${hut(262, 110, .8, 'roofB')}${hut(128, 108, .7)}
    ${P('M286 152Q292 126 310 120Q326 112 344 118Q364 124 380 152Z', 'rock')}${P('M310 120Q326 112 344 118L332 128Z', 'rockL')}
    ${nest('fener', 330, 128, .62)}
    ${R(-20, 146, 400, 8, 'path')}${R(-20, 152, 400, 12, 'ret')}${blocks(152, 12, -20, 380, 20)}
    ${nest('ambar', 44, 149, .62)}${nest('lonca', 142, 149, .74)}${nest('ticaret', 236, 149, .6)}
    ${P('M-20 164H380V196H-20Z', 'ter2')}${tree(96, 150, .6)}${tree(196, 150, .6)}${bush(280, 190, .8)}
    ${nest('tersane', 46, 197, .58)}${nest('hal', 150, 197, .62)}${nest('isleme', 258, 197, .58)}${nest('zanaat', 332, 197, .5)}
    ${R(-20, 195, 400, 7, 'quay')}${R(-20, 201, 400, 8, 'quayD')}${blocks(201, 8, -20, 380, 24)}
    <rect x="-20" y="208" width="400" height="60" fill="url(#sc-seaD)"/><rect x="-20" y="208" width="400" height="60" fill="url(#sc-seaN)" class="nt-op"/>
    ${waves(214, 12, -20, 36, '', .5)}${waves(224, 9, -10, 48, 'b', .4, 1.3)}
    ${boat(206, 222, .7, 'awnA', -1)}${boat(318, 226, .6, 'roofB', -2)}
    ${gull(-20, 60, .8, 30, 0)}${gull(-20, 88, .6, 42, -16)}
  </svg>`;
  const homeSea = () => `<svg class="scn hs-svg" viewBox="0 0 360 200" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${DEFS}
    ${sky(250, 62, 360, 100, 13, 56)}${cloud(70, 34, .9, -10, 130)}${cloud(300, 26, .6, -60, 160)}${cloud(190, 58, .5, -100, 110)}
    ${P('M-20 104V92Q20 78 60 88Q90 76 124 90Q150 84 170 96V104Z', 'far1')}${P('M250 104V96Q290 82 330 92Q356 86 380 96V104Z', 'far2')}
    <rect x="-20" y="102" width="400" height="120" fill="url(#sc-seaD)"/><rect x="-20" y="102" width="400" height="120" fill="url(#sc-seaN)" class="nt-op"/>
    <g opacity=".55">${rep(8, i => { const w = 10 + i * 4.5; return `<rect x="${(250 - w / 2 + (i % 2 ? 3 : -3)).toFixed(1)}" y="${106 + i * 8}" width="${w}" height="1.5" rx=".75" fill="#fff4d0" class="a-breath" style="animation-delay:${-i * .5}s"/>`; })}</g>
    ${waves(112, 14, -20, 30, '', .4, .9)}${waves(126, 11, -10, 40, 'b', .42, 1.1)}
    ${boat(318, 112, .4, 'gold', -2)}${boat(150, 110, .34, 'awnA', -1)}
    ${waves(146, 9, -30, 52, 'c', .4, 1.4)}${waves(172, 8, -20, 64, 'b', .36, 1.7)}${waves(194, 7, -30, 76, '', .3, 2)}
    <g class="a-bob" style="transform-origin:84px 150px">${R(80.6, 130, 6.8, 18, 'awnA', 'rx="2"')}${R(80.6, 136, 6.8, 4, 'white')}${L('M84 130V122', 'ir', 1.2)}${glow(84, 121, 9, 'big on')}${C(84, 121, 2, 'lampg')}${E(84, 149, 9, 2.4, 'foamF', 'opacity=".6"')}</g>
    ${gull(-20, 40, .9, 28, 0)}${gull(-20, 70, .65, 38, -14)}${gull(-20, 26, .5, 50, -30)}
  </svg>`;

  /* =========================================================
     AVLANMA ALANI KARTLARI: her su türünün kendi manzarası (170×104)
     ========================================================= */
  const AR = {};
  const arWrap = (cls, body) => `<svg class="scn ar-svg ar-${cls}" viewBox="0 0 170 104" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${body}<rect width="170" height="104" class="nt-veil"/></svg>`;
  const band = (y, h, c) => `<rect x="-10" y="${y}" width="190" height="${h}" fill="${c}"/>`;
  const swell = (y, amp, c, cls = '') => `<path class="a-swell ${cls}" d="M-60 ${y}${rep(8, i => `q16 ${i % 2 ? amp : -amp} 32 0`)}V110H-60Z" fill="${c}"/>`;
  /* Kıyı: turkuaz sığlık, kumsal, kayık, martılar */
  AR.kiyi = r => arWrap('kiyi', `<rect width="170" height="104" fill="#a9cfd0"/>${band(0, 40, '#bfdcd6')}<circle cx="128" cy="24" r="22" fill="url(#sc-sun)"/>
    <path d="M-10 46Q30 36 70 42Q110 34 180 44V52H-10Z" fill="#8fb7a8" opacity=".7"/>
    ${band(48, 60, '#5fb3b0')}${swell(60, 2.4, '#4aa4a4')}${swell(74, 3, '#3f9498', 'b')}
    <path d="M-10 104V84Q30 74 70 82Q96 88 120 104Z" fill="#e3d2a4"/><path d="M-10 104V90Q26 82 60 88Q84 92 100 104Z" fill="#efe2b8"/>
    <path d="M70 82Q96 88 120 104" stroke="#f6f0e2" stroke-width="2" fill="none" opacity=".8" class="a-breath"/>
    <g transform="translate(34 92) rotate(-8)"><path d="M-12 -3H12Q10 3 6 4H-7Q-11 3 -12 -3Z" fill="#8a6240"/><path d="M-12 -3H12L11.4 -1H-11.4Z" fill="#c0503c"/></g>
    ${boat(118, 64, .55, 'awnA', -r() * 3)}${gull(-20, 22, .55, 26, -r() * 20)}${gull(-20, 36, .4, 34, -r() * 30)}`);
  /* Koy: iki yanda çamlı kayalık, durgun yeşil su, yosun */
  AR.koy = r => arWrap('koy', `<rect width="170" height="104" fill="#b9cdb6"/>${band(0, 44, '#c9d8bf')}
    <path d="M-10 52Q40 40 90 48Q130 40 180 50V58H-10Z" fill="#7f9f8a" opacity=".6"/>
    ${band(52, 56, '#4f8f82')}${swell(64, 1.8, '#448378')}${swell(80, 2.2, '#3a756c', 'b')}
    <path d="M-10 104V30Q4 22 16 30Q30 34 34 50Q44 58 40 74Q46 90 38 104Z" fill="#8f8672"/><path d="M-10 104V30Q4 22 16 30L10 60L-2 104Z" fill="#a9a08a"/>
    <path d="M180 104V24Q164 16 152 26Q140 30 138 46Q128 56 134 70Q128 88 136 104Z" fill="#7d7563"/><path d="M152 26Q140 30 138 46L150 60L160 30Z" fill="#978e79"/>
    ${[[4, 28, 1], [16, 30, .8], [158, 24, 1], [170, 26, .8], [146, 30, .7]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-1" y="-6" width="2" height="6" fill="#54391f"/><path d="M-8 -5L0 -20L8 -5Z" fill="#46633a"/><path d="M-6 -12L0 -24L6 -12Z" fill="#5f7f4d"/></g>`).join('')}
    ${rep(5, i => `<path class="a-sway" style="transform-origin:${52 + i * 14}px 104px;animation-delay:${-i * .6}s" d="M${52 + i * 14} 104q-3 -8 0 -14q3 -6 0 -${10 + (i % 2) * 5}" stroke="#2f6a4f" stroke-width="2" fill="none" opacity=".7"/>`)}
    ${boat(92, 70, .5, 'gold', -r() * 3)}`);
  /* Açık deniz: iri dalgalar, köpük, bulut, uzakta yelkenli */
  AR.burun = r => arWrap('burun', `<rect width="170" height="104" fill="#93a9b4"/>${band(0, 46, '#a9bcc2')}
    <g opacity=".7"><ellipse cx="40" cy="20" rx="34" ry="9" fill="#c9d4d6"/><ellipse cx="124" cy="14" rx="40" ry="10" fill="#bcc9cd"/><ellipse cx="90" cy="30" rx="26" ry="6" fill="#d3dcdc"/></g>
    ${band(44, 64, '#3f6f86')}${boat(128, 50, .42, 'awnB', -r() * 3)}
    ${swell(54, 4, '#356a82')}${swell(68, 5.4, '#2c5f78', 'b')}${swell(84, 6.4, '#24546c', 'c')}
    ${rep(6, i => `<path d="M${6 + i * 28 + (i % 2) * 8} ${60 + (i % 3) * 13}q6 -3.4 12 0" stroke="#eef4f4" stroke-width="1.6" fill="none" opacity=".7" class="a-breath" style="animation-delay:${-i * .5}s"/>`)}
    ${gull(-20, 26, .5, 24, -r() * 20)}`);
  /* Derin deniz: koyu mavi, su altında mercan ışıltısı, sıçrayan kılıç balığı */
  AR.resif = r => arWrap('resif', `<rect width="170" height="104" fill="#7fa6c0"/>${band(0, 40, '#9dbdd0')}<circle cx="40" cy="22" r="20" fill="url(#sc-sun)" opacity=".8"/>
    ${band(38, 70, '#1f5f8c')}${swell(48, 2.6, '#1b5682')}${swell(64, 3.4, '#164a74', 'b')}${swell(82, 4, '#113c62', 'c')}
    ${rep(9, i => `<circle cx="${14 + i * 18 + (i % 2) * 5}" cy="${88 + (i % 3) * 5}" r="${3 + (i % 3)}" fill="${['#e0806a', '#e8b45a', '#c86ab0', '#78c8be'][i % 4]}" opacity=".5" class="a-breath" style="animation-delay:${-i * .4}s"/>`)}
    <g class="a-leap" style="transform-origin:112px 62px"><path d="M96 58Q110 46 126 52L140 46L132 56Q120 62 100 62Z" fill="#c9d6da"/><path d="M110 50L116 42L120 51Z" fill="#9fb0b8"/><path d="M96 58L88 52L90 62Z" fill="#9fb0b8"/></g>
    <ellipse cx="112" cy="64" rx="16" ry="2.6" fill="#eef4f4" opacity=".5"/>`);
  /* Uçurum: lacivert karanlık, ışıyan canlılar, dipte dev gölge, sisli ay */
  AR.cukur = r => arWrap('cukur', `<rect width="170" height="104" fill="#1c1c34"/>${band(0, 42, '#26264a')}<circle cx="124" cy="22" r="24" fill="url(#sc-moon)"/><circle cx="124" cy="22" r="6" fill="#dfe4ff" opacity=".85"/>
    ${band(40, 70, '#14142a')}${swell(50, 2.4, '#111126')}${swell(66, 3, '#0d0d20', 'b')}
    <path class="a-drift" d="M30 86Q60 70 96 80Q120 74 136 84Q110 96 80 92Q52 98 30 86Z" fill="#06060f" opacity=".7"/>
    ${rep(16, i => `<circle cx="${(r() * 170).toFixed(0)}" cy="${(48 + r() * 54).toFixed(0)}" r="${(.8 + r() * 1.4).toFixed(1)}" fill="${i % 2 ? '#b9a6e6' : '#78dcd2'}" class="a-tw" style="animation-delay:${(-r() * 4).toFixed(1)}s"/>`)}
    <path d="M-10 46Q40 40 90 46Q130 40 180 46" stroke="#b9a6e6" stroke-width="1" fill="none" opacity=".35"/>`);
  const area = (type, seed = 1) => (AR[type] || AR.kiyi)(rnd(seed));

  /* =========================================================
     DÜNYA HARİTASI: şehir kapısından altı bölgeye yollar (390×700 sahne; bölgeler ayrı düğmelerdir)
     ========================================================= */
  const pine = (x, y, h, a = '') => `<g ${a}>${R(x - 1.6, y - h * .18, 3.2, h * .18, 'woodD')}${P(`M${x - h * .34} ${y - h * .14}L${x} ${y - h * .78}L${x + h * .34} ${y - h * .14}Z`, 'greenD')}${P(`M${x - h * .26} ${y - h * .46}L${x} ${y - h}L${x + h * .26} ${y - h * .46}Z`, 'green')}${P(`M${x} ${y - h}L${x + h * .26} ${y - h * .46}H${x + h * .08}Z`, 'cypS', 'opacity=".5"')}</g>`;
  const flower = (x, y, col, d = 0) => `<g class="a-sway" style="transform-origin:${x}px ${y}px;animation-delay:${d}s">${L(`M${x} ${y}V${y - 7}`, 'stem', 1.1)}<circle cx="${x}" cy="${y - 8.4}" r="2.6" fill="${col}"/><circle cx="${x}" cy="${y - 8.4}" r="1" fill="#fff6d8"/></g>`;
  const bat = (x, y, dur, d) => `<g class="a-flit" style="animation-duration:${dur}s;animation-delay:${d}s"><g transform="translate(${x} ${y})"><path d="M0 0Q-4 -5 -8 -1Q-5 -1.6 -3.4 1Q-1.6 -.6 0 1Q1.6 -.6 3.4 1Q5 -1.6 8 -1Q4 -5 0 0Z" class="k-dark a-flapb"/></g></g>`;
  const W = {};
  /* Maden Ocağı: karlı doruklar, kirişli ocak ağzı, cevher arabası */
  W.maden = () => sp(150, 124, `
    ${P('M0 124L34 46L54 74L80 14L108 68L122 50L150 124Z', 'rock')}${P('M80 14L108 68L96 124H66Z', 'rockL')}${P('M34 46L54 74L46 124H0Z', 'rockD')}${P('M122 50L150 124H112Z', 'rockD')}
    ${P('M80 14L71 32L78 28L83 36L89 31Z', 'white')}${P('M34 46L28 60L34 56L39 62L43 58Z', 'white')}${P('M122 50L117 60L122 57L127 62Z', 'white')}
    ${glow(76, 108, 18, 'big')}${P('M56 124V98Q76 78 96 98V124Z', 'arch')}${L('M56 124V96M96 124V96M52 96H100', 'pole', 3.6)}${L('M64 96L58 104M88 96L94 104', 'pole', 2)}${lamp(76, 96)}
    ${L('M66 124L62 132M86 124L90 132M60 128H92', 'ir', 1.2)}
    ${R(104, 108, 24, 11, 'woodD', 'rx="1.4"')}${C(109, 107, 3.6, 'stoneL')}${C(116, 105, 3.8, 'gold')}${C(123, 107, 3.2, 'stoneL')}${C(109, 121, 3, 'iron')}${C(123, 121, 3, 'iron')}
    ${L('M36 122L50 98', 'pole', 2.2)}${P('M43 96Q51 91 58 98L56 100.4Q51 95.6 45 99Z', 'iron')}
    ${rep(4, i => `<path d="M0 -3L2 0L0 3L-2 0Z" transform="translate(${[28, 118, 70, 100][i]} ${[86, 84, 58, 100][i]})" class="k-gold a-tw" style="animation-delay:${-i * .8}s"/>`)}`);
  /* Kadim Harabeler: yıkık kule, kemer, kuru ağaç, meşale, yarasalar, mor ışıltı */
  W.yaratik = () => sp(150, 124, `
    <ellipse cx="78" cy="104" rx="66" ry="24" fill="#b9a6e6" opacity=".2" class="a-breath"/>
    ${P('M38 124V42L46 34L53 46L61 30L70 42V124Z', 'stoneD')}${P('M38 124V42L46 34L50 40V124Z', 'stone')}${R(53, 58, 8, 12, 'dark', 'rx="3"')}${R(53, 86, 8, 12, 'dark', 'rx="3"')}
    <circle cx="57" cy="64" r="2" fill="#d0b8ff" class="a-tw"/><circle cx="57" cy="92" r="2" fill="#d0b8ff" class="a-tw" style="animation-delay:-1.4s"/>
    ${P('M82 124V84Q98 62 114 84V124H106V87Q98 76 90 87V124Z', 'stone')}${P('M82 124V84Q90 72 98 69V76Q93 79 90 87V124Z', 'stoneL')}
    ${R(118, 113, 13, 11, 'stoneD')}${R(127, 105, 10, 8, 'stone')}${R(72, 117, 9, 7, 'stoneD')}
    <path d="M134 124V90M134 104L123 91M134 97L145 84M134 90L130 78M123 91L119 84M145 84L147 76" stroke="#3a2c2a" stroke-width="2.6" fill="none" stroke-linecap="round"/>
    ${L('M18 124V98', 'pole', 2)}${C(18, 93, 5.4, 'white')}${C(16.2, 92.4, 1.3, 'dark')}${C(19.8, 92.4, 1.3, 'dark')}${R(16, 96.4, 4, 2.4, 'white')}
    ${glow(28, 100, 12, 'big on')}${L('M28 124V106', 'pole', 2.2)}<g class="a-fire">${P('M24.6 106Q28 94 31.4 106Z', 'fire')}${P('M26.6 106Q28 100 29.4 106Z', 'fireL')}</g>
    ${bat(96, 40, 9, 0)}${bat(120, 56, 12, -4)}${bat(70, 22, 14, -8)}`);
  /* Ulu Orman: çamlar, oduncu kulübesi, kütük yığını, baltalı kütük */
  W.odun = () => sp(140, 112, `
    ${pine(18, 104, 60)}${pine(40, 98, 74)}${pine(124, 104, 62)}${pine(104, 96, 54)}${pine(62, 92, 44)}
    ${smoke(88, 52, 3, 'smokeL')}${R(84, 54, 7, 12, 'stoneD')}
    ${R(58, 76, 36, 30, 'wood')}${R(84, 76, 10, 30, 'woodD', 'opacity=".5"')}${rep(4, i => L(`M${64 + i * 7} 77V106`, 'ln', .7))}${P('M54 78L76 58L98 78Z', 'roofR')}${P('M76 58L98 78H88Z', 'roofRd')}
    ${glow(74, 96, 10)}${R(70, 90, 9, 16, 'door')}${win(83, 86, 6.4, 7)}
    ${R(100, 100, 30, 6, 'wood')}${R(103, 94, 24, 6, 'woodL')}${rep(3, i => C(102 + i * 9, 103, 3.4, 'woodL') + C(102 + i * 9, 103, 1.6, 'woodD'))}${rep(2, i => C(106.5 + i * 9, 97, 3.4, 'woodL') + C(106.5 + i * 9, 97, 1.6, 'woodD'))}
    ${P('M26 112V104Q33 100.6 40 104V112Z', 'woodL')}${E(33, 104, 7, 2.2, 'paperG')}${L('M35 103L47 88', 'pole', 2)}${P('M43.6 86L51.6 83.6L52.6 92L46.4 91.6Z', 'iron')}`);
  /* Çiçekli Çayır: çiçekler, otacı kulübesi, kurutma ipi, kelebekler, mantarlar */
  W.bitki = () => sp(140, 104, `
    ${P('M0 104Q32 68 72 78Q112 64 140 104Z', 'greenL')}${P('M0 104Q40 86 80 92Q112 84 140 104Z', 'green', 'opacity=".6"')}
    ${R(84, 58, 34, 30, 'plas')}${R(108, 58, 10, 30, 'plasS')}${P('M79 60L101 40L123 60Z', 'roofB')}${P('M101 40L123 60H112Z', 'roofBd')}
    ${glow(97, 78, 10)}${P('M92 88V74Q97 68 102 74V88Z', 'door')}${win(106, 68, 6.4, 8)}
    ${rep(3, i => `<g class="a-sway" style="transform-origin:${86 + i * 5}px 61px;animation-delay:${-i * .5}s">${L(`M${86 + i * 5} 61V65`, 'rope', .6)}<path d="M${86 + i * 5} 65q-2.4 4 0 8q2.4 -4 0 -8Z" fill="#6fae4f"/></g>`)}
    ${L('M24 104V76M56 104V76', 'pole', 2)}${L('M22 79H58', 'rope', .9)}${rep(4, i => `<g class="a-sway" style="transform-origin:${28 + i * 8}px 79px;animation-delay:${-i * .6}s"><path d="M${28 + i * 8} 79q-3 6 0 12q3 -6 0 -12Z" fill="${['#7fbf5f', '#a8c86a', '#6fae4f', '#c9b45a'][i]}"/></g>`)}
    ${flower(10, 102, '#f2d36a', 0)}${flower(18, 98, '#e58aa8', -.6)}${flower(66, 100, '#b79cf0', -1.2)}${flower(74, 96, '#f29a5a', -.3)}${flower(126, 100, '#f2d36a', -.9)}${flower(134, 96, '#e58aa8', -1.5)}${flower(44, 100, '#f0f0e6', -1.1)}
    ${P('M108 104V98H112V104Z', 'paper')}${P('M103 99Q110 89 117 99Z', 'awnA')}<circle cx="107.6" cy="96" r="1" fill="#fff"/><circle cx="112.4" cy="95.4" r="1" fill="#fff"/>
    ${rep(2, i => `<g class="a-flit" style="animation-duration:${10 + i * 5}s;animation-delay:${-i * 3}s"><g transform="translate(${[40, 120][i]} ${[60, 50][i]})"><path d="M0 0Q-3.4 -4.6 -4.6 -1Q-3 1.6 0 0Q3 1.6 4.6 -1Q3.4 -4.6 0 0Z" class="k-${['gold', 'awnB'][i]} a-flapb"/></g></g>`)}`);
  /* Av Sahası: avcı çadırı, gerili post, kamp ateşi, otlayan geyik */
  W.deri = () => sp(140, 104, `
    ${rep(9, i => L(`M${6 + i * 16} 104q-2 -6 0 -10M${10 + i * 16} 104q1 -7 3 -11`, 'grass', 1.3))}
    ${L('M92 62V52', 'pole', 1.6)}${flag(92, 52, 'awnA', 10)}
    ${P('M68 104L92 60L116 104Z', 'awnB')}${P('M92 60L116 104H102Z', 'plasS')}${P('M85 104L92 84L99 104Z', 'dark')}${L('M68 104L92 60L116 104', 'ln', 1)}
    ${L('M18 104V68M48 104V68M16 71H50', 'pole', 2.4)}${P('M23 75H43L41 97Q33 100 25 97Z', 'paperG')}${L('M23 75L19 71M43 75L47 71M25 97L20 102M41 97L46 102', 'rope', .8)}
    ${glow(60, 98, 13, 'big on')}${L('M53 104L67 99M53 99L67 104', 'pole', 2.4)}<g class="a-fire">${P('M55.6 100Q60 86 64.4 100Z', 'fire')}${P('M58 100Q60 93 62 100Z', 'fireL')}</g>
    <g class="a-breath" style="transform-origin:122px 104px"><path d="M112 104V93M117 104V94M127 104V94M132 104V93" stroke="#7a5636" stroke-width="2" stroke-linecap="round"/><ellipse cx="122" cy="89" rx="12" ry="6.4" fill="#a9794e"/>
      <path d="M131 87Q136 80 136 74L139 74Q139 82 134 90Z" fill="#a9794e"/><ellipse cx="138" cy="72.6" rx="4.4" ry="3" fill="#b98a5e"/><circle cx="139.4" cy="72" r=".8" fill="#2a1a10"/>
      <path d="M136 70L133 62M136 70L138 61M133 62L130 60M138 61L141 58" stroke="#e6d6b8" stroke-width="1.3" fill="none" stroke-linecap="round"/><path d="M110 88L107 86" stroke="#e6d6b8" stroke-width="2" stroke-linecap="round"/></g>`);
  /* Kıyı: balıkçı kulübesi, iskele, yelkenli, sıçrayan balık */
  W.balik = () => sp(150, 104, `
    ${P('M0 104Q6 74 38 60Q30 84 40 104Z', 'path')}
    ${R(6, 44, 28, 24, 'wood')}${R(26, 44, 8, 24, 'woodD', 'opacity=".5"')}${P('M2 46L20 31L38 46Z', 'roofB')}${P('M20 31L38 46H29Z', 'roofBd')}${glow(16, 60, 8)}${R(12, 54, 7, 14, 'door')}${win(23, 52, 5.6, 6.4)}
    ${R(30, 68, 62, 6, 'woodL')}${rep(7, i => L(`M${36 + i * 8} 68v6`, 'ln', .7))}${R(42, 74, 3.4, 16, 'woodD')}${R(64, 74, 3.4, 18, 'woodD')}${R(86, 74, 3.4, 16, 'woodD')}${post(90, 68, 16)}
    ${boat(118, 84, .9, 'awnA', -1)}
    ${L('M52 88q3 -1.6 6 0t6 0M96 98q3 -1.6 6 0t6 0t6 0M20 96q3 -1.6 6 0t6 0', 'foam', 1)}
    <g class="a-jump" style="animation-duration:8s">${fishS(72, 94, 1, 'fish', -30)}</g>`);
  /* Derinsu Şehri: surlar, iki kule, kapı */
  W.kapi = () => sp(170, 96, `
    ${L('M47 8V-8M123 8V-8', 'pole', 1.4)}${flag(47, -8, 'gold', 12)}${flag(123, -8, 'awnA', 12)}
    ${rep(14, i => R(1 + i * 12.2, 46, 7.4, 8, 'wall'))}${R(0, 52, 170, 44, 'wall')}${R(0, 84, 170, 12, 'wallS')}${L('M0 64H170M0 76H170M14 52V64M40 64V76M66 52V64M104 52V64M130 64V76M156 52V64', 'jn', .8)}
    ${R(32, 26, 30, 70, 'wall')}${R(53, 26, 9, 70, 'wallS')}${P('M28 28L47 6L66 28Z', 'roofR')}${P('M47 6L66 28H56Z', 'roofRd')}${win(43, 40, 7, 10, true)}
    ${R(108, 26, 30, 70, 'wall')}${R(129, 26, 9, 70, 'wallS')}${P('M104 28L123 6L142 28Z', 'roofR')}${P('M123 6L142 28H132Z', 'roofRd')}${win(119, 40, 7, 10, true)}
    ${glow(85, 82, 18, 'big')}${P('M68 96V62Q85 42 102 62V96Z', 'stoneD')}${P('M71 96V64Q85 47 99 64V96Z', 'arch')}${L('M77 96V60M82.4 96V55M87.6 96V55M93 96V60M72 72H98M72 84H98', 'ir', 1)}
    ${lamp(64, 72)}${lamp(106, 72)}`);
  const WR = [   // id, ad, orta x, taban y
    ['maden', 'Maden Ocağı', 92, 262], ['yaratik', 'Kadim Harabeler', 300, 262], ['odun', 'Ulu Orman', 80, 408], ['bitki', 'Çiçekli Çayır', 312, 410],
    ['deri', 'Av Sahası', 94, 548], ['balik', 'Kıyı', 304, 566], ['city', 'Derinsu Şehri', 180, 668],
  ];
  const worldBg = () => `<svg class="lm-bg scn" viewBox="0 0 390 700" overflow="visible" aria-hidden="true">
    ${sky(292, 60, 390, 140, 17, 44)}${cloud(70, 50, .8, -20, 130)}${cloud(220, 30, .7, -70, 150)}${cloud(340, 96, .5, -40, 110)}
    ${P('M-170 170V124Q-80 100 -20 118Q40 88 100 110Q160 86 220 106Q290 82 350 104Q430 90 560 116V170Z', 'far1')}
    ${P('M-170 186V146Q-60 126 40 142Q130 120 220 138Q300 124 370 140Q450 128 560 148V186Z', 'far2')}
    ${P('M-170 800V170Q-40 152 60 162Q150 146 240 156Q320 150 400 164Q470 156 560 172V800Z', 'hill')}
    ${P('M-170 800V330Q-40 310 70 322Q170 306 260 320Q340 312 420 326Q480 320 560 332V800Z', 'hillL')}
    ${P('M-170 800V500Q-60 484 60 494Q150 482 230 494Q300 488 560 500V800Z', 'ter')}
    <path d="M560 440Q384 436 304 486Q246 526 260 604Q266 692 282 800H560Z" fill="url(#sc-seaD)"/><path d="M560 440Q384 436 304 486Q246 526 260 604Q266 692 282 800H560Z" fill="url(#sc-seaN)" class="nt-op"/>
    ${L('M560 440Q384 436 304 486Q246 526 260 604Q266 692 282 800', 'foam', 2.4, 'opacity=".5"')}
    ${waves(520, 5, 330, 44, '', .45)}${waves(600, 5, 300, 52, 'b', .4, 1.3)}${waves(672, 4, 300, 60, 'c', .36, 1.5)}
    ${[[180, 620, 195, 470], [195, 470, 120, 530], [195, 520, 262, 548], [195, 470, 112, 392], [195, 470, 286, 392], [195, 470, 195, 330], [195, 330, 110, 250], [195, 330, 288, 250]].map(([a, b, c2, d]) => `<path d="M${a} ${b}Q${(a + c2) / 2 + (d - b) * .12} ${(b + d) / 2} ${c2} ${d}" class="s-road" stroke-width="10" fill="none"/>`).join('')}
    ${[[180, 620, 195, 470], [195, 470, 120, 530], [195, 520, 262, 548], [195, 470, 112, 392], [195, 470, 286, 392], [195, 470, 195, 330], [195, 330, 110, 250], [195, 330, 288, 250]].map(([a, b, c2, d]) => `<path d="M${a} ${b}Q${(a + c2) / 2 + (d - b) * .12} ${(b + d) / 2} ${c2} ${d}" class="s-roadL" stroke-width="5" fill="none"/>`).join('')}
    ${C(195, 470, 9, 'path')}${C(195, 330, 8, 'path')}
    ${L('M195 322V300', 'pole', 2)}${P('M195 302H214L210 307L214 312H195Z', 'woodL')}${P('M195 314H176L180 319L176 324H195Z', 'woodL', 'transform="translate(0 -6)"')}
    ${cyp(170, 300, 26)}${cyp(222, 296, 20)}${tree(160, 452, .9)}${tree(232, 448, .8)}${tree(20, 300, .9)}${tree(372, 316, .85)}${tree(196, 220, .8)}${tree(150, 590, .9)}${tree(28, 620, 1)}${tree(250, 604, .8)}
    ${bush(140, 340)}${bush(250, 352, .9)}${bush(40, 470, 1)}${bush(230, 500, .9)}${bush(160, 250, .8)}${bush(60, 660, 1)}${bush(232, 680, .9)}
    ${mill(246, 470, .9)}${hut(152, 520, .9)}${hut(236, 430, .8, 'roofB')}
    ${rep(5, i => L(`M${120 + i * 9} 600l8 -30`, 'field', 3))}${rep(5, i => L(`M${226 + i * 8} 640l7 -26`, 'field', 3))}
    
  </svg>`;
  const worldFg = () => `<svg class="lm-fg scn" viewBox="0 0 390 700" overflow="visible" aria-hidden="true">
    ${walker(186, 600, 'awnA', 0, 30)}${gull(-20, 110, .9, 36, 0)}${gull(-20, 480, .7, 44, -20)}${gull(-20, 150, .6, 52, -31)}
    <g class="nt-only">${rep(8, i => { const x = [30, 150, 250, 350, 60, 210, 130, 330][i], y = [330, 290, 300, 350, 480, 440, 560, 430][i]; return `<g class="a-drift" style="animation-duration:${9 + i % 4 * 3}s;animation-delay:${-i * 1.3}s"><circle cx="${x}" cy="${y}" r="1.3" fill="#e8fa9a" class="a-tw" style="animation-delay:${(-i * .7).toFixed(1)}s"/></g>`; })}</g>
  </svg>`;
  const world = () => `<div class="lm-stage"><i class="sky"></i>${worldBg()}
    ${WR.map(([id, name, cx, base], i) => { const m = /viewBox="0 0 (\d+) (\d+)"/.exec(W[id === 'city' ? 'kapi' : id]()), w = +m[1], h = +m[2];
      return `<button class="lmb wmr wmr-${id}" data-region="${id}" aria-label="${name}" style="left:${((cx - w / 2) / 3.9).toFixed(2)}%;top:${((base - h) / 7).toFixed(2)}%;width:${(w / 3.9).toFixed(2)}%;--i:${i}">${W[id === 'city' ? 'kapi' : id]()}
        <span class="lm-tag"><b>${name}</b><small data-rs="${id}">${id === 'city' ? 'Şehre dön' : ''}</small><i class="lm-dot" data-rd="${id}"></i></span></button>`; }).join('')}
    ${worldFg()}</div>`;

  // Şehir sahnesi artık js/sehir/ altındadır (plan.js, canli.js); burada bölge afişleri ve dünya haritası kaldı.
  return { homeSea, area, world, bareShip, HB };
})();
