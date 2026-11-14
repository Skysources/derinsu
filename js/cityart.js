/* =========================================================
   DERİNSU — şehir kartlarının resimleri
   Her yapı kendi kartında: yan görünüş SVG, gece limanı. Kıpırdayan parçalar CSS sınıflarıyla
   (b-sway, b-pulse, b-smoke, b-fire, b-bob, b-wave, b-beam, b-flap, b-swing, b-fly, b-tw, b-bub).
   Zemin rengi ve yapının ışığı kartın --c rengiyle CSS'te verilir.
   ========================================================= */
'use strict';
window.CityArt = (() => {
  const svg = (body, vb = '0 0 200 110') => `<svg viewBox="${vb}" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${body}</svg>`;
  const stars = (n, w = 200, h = 40, seed = 1) => {
    let s = seed * 9301 + 49297, out = '';
    const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < n; i++) out += `<circle cx="${(r() * w).toFixed(1)}" cy="${(r() * h + 3).toFixed(1)}" r="${(r() * .7 + .3).toFixed(2)}" fill="#f2eee4" class="b-tw" style="animation-delay:${(r() * 3).toFixed(2)}s;opacity:${(r() * .5 + .2).toFixed(2)}"/>`;
    return out;
  };
  const ground = (y = 86, w = 200) => `<rect x="0" y="${y}" width="${w}" height="40" fill="#15110e"/><path d="M0 ${y}H${w}" stroke="#2c241c" stroke-width="1.5"/>
    ${Array.from({ length: Math.ceil(w / 14) }, (_, i) => `<path d="M${i * 14 + (i % 2) * 7} ${y + 4}h9" stroke="#221c16" stroke-width="2" stroke-linecap="round"/>`).join('')}`;
  const water = (y, w = 200, h = 40) => `<rect x="0" y="${y}" width="${w}" height="${h}" fill="url(#bc-sea)"/>
    <g class="b-wave">${Array.from({ length: Math.ceil(w / 22) + 2 }, (_, i) => `<path d="M${i * 22 - 22} ${y + 5 + (i % 3) * 5}q5 -2.5 10 0" stroke="#bfe0e6" stroke-opacity=".22" fill="none"/>`).join('')}</g>`;
  const glow = (x, y, r, c = '#ffb060', o = .32) => `<circle cx="${x}" cy="${y}" r="${r * 1.5}" fill="url(#bc-glow${c === '#ffe6a0' || c === '#f3d68e' ? 'W' : ''})" fill-opacity="${Math.min(1, o * 2.4)}" class="b-pulse"/>`;
  const win = (x, y, w = 10, h = 11) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="1" fill="#f0c878" class="b-pulse" style="animation-duration:4.5s"/><path d="M${x + w / 2} ${y}v${h}M${x} ${y + h / 2}h${w}" stroke="#4a3626" stroke-width="1.2"/>`;
  const roofLines = (x0, x1, yTop, yBot, step = 8, c = 'rgba(0,0,0,.22)') => Array.from({ length: Math.floor((x1 - x0) / step) }, (_, i) => `<path d="M${x0 + 4 + i * step} ${yTop + 2}L${x0 + 2 + i * step - (i - (x1 - x0) / step / 2) * .8} ${yBot}" stroke="${c}"/>`).join('');

  const A = {};
  /* Balık Hali: çizgili tente, tezgâhta balıklar, asılı lamba, kasalar */
  A.hal = () => svg(`${stars(14)}${water(92)}<rect x="0" y="84" width="200" height="8" fill="#5e5648"/><path d="M0 84H200" stroke="#7d7464" stroke-width="2"/>
    <rect x="42" y="40" width="116" height="44" fill="#3a2e24"/><rect x="42" y="40" width="116" height="44" fill="url(#bc-wall)"/>
    <path d="M34 42L100 16L166 42Z" fill="#7a3a2a"/><path d="M34 42L100 16L166 42" stroke="#b0604a" stroke-width="2" fill="none"/>${roofLines(50, 150, 22, 41, 9)}
    <circle cx="100" cy="31" r="5" fill="#e7c26a" opacity=".85"/><path d="M96 31q4 -3 8 0q-4 3 -8 0zM104 31l3 -2v4z" fill="#7a5a22"/>
    <g class="b-sway" style="transform-origin:100px 46px">${Array.from({ length: 8 }, (_, i) => `<rect x="${38 + i * 15.5}" y="46" width="15.5" height="9" fill="${i % 2 ? '#efe3c8' : '#c0503c'}"/><path d="M${38 + i * 15.5} 55q7.75 6 15.5 0z" fill="${i % 2 ? '#efe3c8' : '#c0503c'}"/>`).join('')}</g>
    <path d="M100 56v6" stroke="#2a2018"/>${glow(100, 65, 10)}<circle cx="100" cy="65" r="3" fill="#ffd27a"/>
    <rect x="48" y="70" width="104" height="14" fill="#5a3c22"/><rect x="48" y="68" width="104" height="4" fill="#8a6038"/>
    ${[58, 74, 90, 112, 128, 142].map((x, i) => `<ellipse cx="${x}" cy="66" rx="6" ry="2.4" fill="${['#a8c0c4', '#c9a26b', '#8fb0b8', '#d08a6a', '#a8c0c4', '#9ab8a0'][i]}"/><path d="M${x + 6} 66l3 -2v4z" fill="${['#a8c0c4', '#c9a26b', '#8fb0b8', '#d08a6a', '#a8c0c4', '#9ab8a0'][i]}"/>`).join('')}
    ${[[10, 72], [24, 76], [166, 74], [182, 72]].map(([x, y]) => `<rect x="${x}" y="${y}" width="14" height="${84 - y}" fill="#6a4a2a"/><path d="M${x} ${y + 3}h14" stroke="#4a3220"/><ellipse cx="${x + 5}" cy="${y - 1}" rx="4" ry="1.6" fill="#a8c0c4"/><ellipse cx="${x + 10}" cy="${y}" rx="4" ry="1.6" fill="#8fb0b8"/>`).join('')}`);

  /* Olta Ustası: dükkân, duvara dayalı oltalar, sallanan kanca tabelası, makara */
  A.usta = () => svg(`${stars(16, 200, 40, 2)}${ground()}
    <rect x="58" y="38" width="96" height="48" fill="#4a3c30"/><rect x="58" y="38" width="96" height="48" fill="url(#bc-wall)"/>
    <path d="M50 40L106 15L162 40Z" fill="#3c5a6a"/><path d="M50 40L106 15L162 40" stroke="#5e8494" stroke-width="2" fill="none"/>${roofLines(62, 150, 21, 39, 8)}
    ${win(68, 50, 16, 12)}<rect x="98" y="60" width="17" height="26" fill="#2a1d14"/><rect x="98" y="58" width="17" height="3" fill="#5a3c22"/>${glow(106, 72, 9, '#ffb060', .18)}
    ${win(126, 50, 16, 12)}
    <path d="M154 34h24M174 34v-4" stroke="#3a2a1a" stroke-width="2.5"/>
    <g class="b-sway" style="transform-origin:170px 34px"><path d="M164 34v5M176 34v5" stroke="#2a2018"/><rect x="160" y="39" width="20" height="16" rx="2" fill="#6a4a2a" stroke="#c9a24e" stroke-width="1"/><path d="M170 42v6q0 4 -4 4q-3 0 -3 -3" stroke="#e7c26a" stroke-width="1.6" fill="none" stroke-linecap="round"/></g>
    ${[0, 1, 2, 3].map(i => `<path d="M${16 + i * 8} 86L${30 + i * 9} ${26 + i * 3}" stroke="${['#a87a50', '#8a6038', '#c9a26b', '#7a5634'][i]}" stroke-width="2" stroke-linecap="round"/><path d="M${30 + i * 9} ${26 + i * 3}q4 18 -2 34" stroke="#e6dfd7" stroke-opacity=".25" fill="none"/>`).join('')}
    <circle cx="44" cy="80" r="6" fill="#2c2926" stroke="#c9a24e"/><circle cx="44" cy="80" r="2" fill="#c9a24e"/>
    <rect x="166" y="72" width="16" height="14" rx="2" fill="#5a3c22"/><path d="M166 76h16" stroke="#3a2614"/>`);

  /* Ticaret Evi: kemerli çarşı, sallanan terazi tabelası, flamalar, kasalar ve çuvallar, altın ışığı */
  A.ticaret = () => svg(`${stars(16, 200, 36, 10)}${ground()}
    <rect x="34" y="36" width="132" height="50" fill="#4a3e30"/><rect x="34" y="36" width="132" height="50" fill="url(#bc-wall)"/>
    <path d="M28 38L100 12L172 38Z" fill="#3e6a4a"/><path d="M28 38L100 12L172 38" stroke="#6fa07a" stroke-width="2" fill="none"/>${roofLines(40, 160, 18, 37, 9)}
    <rect x="28" y="36" width="144" height="4" fill="#c9a24e"/>
    ${[52, 88, 124].map(x => `<path d="M${x} 86V60Q${x + 12} 46 ${x + 24} 60V86Z" fill="#1a1410"/><path d="M${x + 3} 86V61Q${x + 12} 51 ${x + 21} 61V86Z" fill="#f0c878" opacity=".28" class="b-pulse" style="animation-delay:${(x % 5) * .3}s"/>`).join('')}
    ${[[60, 74], [96, 72], [132, 75]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="9" height="${86 - y}" fill="${['#8a6038', '#6a4a2a', '#7a5634'][i]}"/><circle cx="${x + 4.5}" cy="${y - 2}" r="3" fill="#e7c26a" opacity=".9"/>`).join('')}
    <path d="M100 18v-8" stroke="#3a2a1a" stroke-width="1.5"/>
    <g class="b-sway" style="transform-origin:100px 10px"><path d="M88 16h24M100 10v6M90 16l-4 9h8zM110 16l-4 9h8z" stroke="#e7c26a" stroke-width="1.4" fill="none"/><path d="M86 25h8M106 25h8" stroke="#e7c26a" stroke-width="2"/></g>
    ${[[38, '#b0443a'], [158, '#2f6f6a']].map(([x, c], i) => `<path d="M${x} 40v-10" stroke="#3a2a1a" stroke-width="1.5"/><g class="b-sway" style="transform-origin:${x}px 31px;animation-delay:${i * .8}s"><path d="M${x} 31h12l-3 4l3 4h-12z" fill="${c}"/></g>`).join('')}
    ${[[10, 74, '#a87a50'], [176, 72, '#c9a26b']].map(([x, y, c]) => `<path d="M${x} 86q0 -${86 - y} 7 -${86 - y}q7 0 7 ${86 - y}z" fill="${c}"/><path d="M${x + 4} ${y + 2}q3 -3 6 0" stroke="#5a3c22" fill="none"/>`).join('')}
    ${glow(100, 70, 16, '#ffd27a', .22)}`);
  /* İşlemehane: uzun yapı, bacadan buhar, kapıda kızıl ışık, dışarıda ayıklama masası */
  A.isleme = () => svg(`${stars(14, 200, 36, 3)}${ground()}
    <rect x="30" y="44" width="120" height="42" fill="#4e3e30"/><rect x="30" y="44" width="120" height="42" fill="url(#bc-wall)"/>
    <rect x="126" y="12" width="11" height="24" fill="#3a2e24"/><rect x="124" y="10" width="15" height="4" fill="#2a2018"/>
    <g class="b-smoke">${[0, 1, 2].map(i => `<circle cx="${131 + i * 3}" cy="${4 - i * 3}" r="${5 + i * 2}" fill="#d8d0c4" opacity=".16" style="animation-delay:${i * 1.2}s"/>`).join('')}</g>
    <path d="M24 46L62 22H118L156 46Z" fill="#6d4a2e"/><path d="M24 46L62 22H118L156 46" stroke="#9a6c44" stroke-width="2" fill="none"/>${roofLines(40, 140, 24, 45, 9)}
    <path d="M70 86V62Q84 50 98 62V86Z" fill="#2a1d14"/><path d="M73 86V63Q84 54 95 63V86Z" fill="#e0a83a" opacity=".22" class="b-pulse"/>
    ${win(40, 56, 14, 12)}${win(112, 56, 14, 12)}
    <rect x="150" y="68" width="44" height="4" fill="#8a6038"/><path d="M154 72v14M190 72v14" stroke="#5a3c22" stroke-width="3"/>
    <ellipse cx="166" cy="65" rx="9" ry="3" fill="#a8c0c4"/><path d="M175 65l4 -3v6z" fill="#a8c0c4"/><path d="M182 66l8 -6" stroke="#e6e2da" stroke-width="2" stroke-linecap="round"/><path d="M180 67.5l3 -2" stroke="#5a3c22" stroke-width="3" stroke-linecap="round"/>
    ${[[8, 72], [20, 74]].map(([x, y]) => `<rect x="${x}" y="${y}" width="11" height="${86 - y}" rx="3" fill="#6a4a2a"/><path d="M${x} ${y + 4}h11M${x} ${y + 9}h11" stroke="#3a2814"/>`).join('')}`);

  /* Zanaathane: açık pencerede raflar ve şişeler, dışarıda ateşte kaynayan kazan */
  A.zanaat = () => svg(`${stars(15, 200, 36, 4)}${ground()}
    <rect x="58" y="36" width="116" height="50" fill="#463a30"/><rect x="58" y="36" width="116" height="50" fill="url(#bc-wall)"/>
    <path d="M52 38L116 13L180 38Z" fill="#6a3a2a"/><path d="M52 38L116 13L180 38" stroke="#9a5a3e" stroke-width="2" fill="none"/>${roofLines(62, 172, 19, 37, 9)}
    <rect x="70" y="48" width="44" height="26" fill="#1a1410" stroke="#5a3c22" stroke-width="2"/>${glow(92, 61, 14, '#ffb060', .14)}
    <path d="M72 58h40M72 67h40" stroke="#5a3c22" stroke-width="1.5"/>
    ${[[75, 51, '#6fcf62'], [82, 52, '#4ea4f0'], [89, 50, '#e7c26a'], [100, 51, '#b9a6e6'], [107, 52, '#6fcf62'], [77, 61, '#e0853a'], [86, 60, '#4ea4f0'], [96, 61, '#6fcf62'], [104, 60, '#e7c26a']].map(([x, y, c]) => `<rect x="${x}" y="${y}" width="4" height="${57 - y + (y > 55 ? 9 : 0)}" rx="1" fill="${c}" opacity=".85"/>`).join('')}
    <rect x="128" y="58" width="18" height="28" fill="#2a1d14"/><rect x="128" y="56" width="18" height="3" fill="#5a3c22"/>${win(152, 50, 12, 11)}
    <path d="M14 86L28 60L42 86" stroke="#3a2a1a" stroke-width="2.5" fill="none"/><path d="M28 60v6" stroke="#2a2018" stroke-width="1.5"/>
    <path d="M16 68h24l-3 12q-1 4 -5 4h-8q-4 0 -5 -4z" fill="#2c2926"/><ellipse cx="28" cy="68" rx="12" ry="3" fill="#6a8a4a"/>
    <g>${[0, 1, 2].map(i => `<circle cx="${23 + i * 5}" cy="66" r="1.6" fill="#a8d080" class="b-bub" style="animation-delay:${i * .5}s"/>`).join('')}</g>
    <g class="b-fire"><path d="M20 86q4 -10 8 -3q4 -9 8 3z" fill="#ff9a3a"/><path d="M24 86q4 -6 8 0z" fill="#ffd27a"/></g>${glow(28, 82, 12, '#ff9a3a', .25)}`);

  /* Balıkçılar Loncası: sütunlu salon, altın balık arması, sallanan sancaklar */
  A.lonca = () => svg(`${stars(18, 200, 30, 5)}${ground()}
    <rect x="36" y="82" width="128" height="4" fill="#5e5648"/><rect x="42" y="78" width="116" height="4" fill="#6e6658"/>
    <rect x="46" y="46" width="108" height="32" fill="#5a5244"/><rect x="46" y="46" width="108" height="32" fill="url(#bc-wall)"/>
    <path d="M38 47L100 16L162 47Z" fill="#4a4236"/><path d="M38 47L100 16L162 47Z" stroke="#c9a24e" stroke-width="2" fill="none"/><rect x="38" y="46" width="124" height="4" fill="#c9a24e"/>
    <ellipse cx="100" cy="36" rx="12" ry="5.5" fill="#e7c26a"/><path d="M110 36l7 -5v10z" fill="#e7c26a"/><circle cx="94" cy="35" r="1.3" fill="#3a2e24"/>${glow(100, 36, 14, '#f3d68e', .2)}
    ${[54, 70, 124, 140].map(x => `<rect x="${x}" y="50" width="7" height="28" fill="#9a8f7c"/><rect x="${x - 1.5}" y="50" width="10" height="3" fill="#b0a48c"/>`).join('')}
    <path d="M90 78V62Q100 52 110 62V78Z" fill="#2a1d14"/><path d="M93 78V63Q100 56 107 63V78Z" fill="#f0c878" opacity=".3" class="b-pulse"/>
    ${[[80, '#2f6f6a'], [114, '#8a3a2a']].map(([x, c], i) => `<g class="b-sway" style="transform-origin:${x + 3}px 50px;animation-delay:${i * .7}s"><rect x="${x}" y="50" width="7" height="18" fill="${c}"/><path d="M${x} 68l3.5 4l3.5 -4z" fill="${c}"/><circle cx="${x + 3.5}" cy="57" r="1.6" fill="#e7c26a"/></g>`).join('')}
    ${[22, 178].map(x => `<path d="M${x} 86V58" stroke="#2a2218" stroke-width="2.5"/><rect x="${x - 3.5}" y="52" width="7" height="7" fill="#e8c070"/>${glow(x, 55, 9)}`).join('')}`);

  /* Görev Panosu: çatılı tahta pano, uçuşan kâğıtlar, direkte fener */
  A.pano = () => svg(`${stars(16, 200, 36, 6)}${ground()}
    <path d="M56 86V28M144 86V28" stroke="#3a2a1a" stroke-width="6"/>
    <path d="M46 30L100 14L154 30Z" fill="#5a3c22"/><path d="M46 30L100 14L154 30" stroke="#7a5634" stroke-width="2" fill="none"/>
    <rect x="60" y="32" width="80" height="42" fill="#7a5634" stroke="#4a3220" stroke-width="2"/>
    ${[[66, 36, -.1], [84, 38, .08], [104, 35, -.05], [122, 37, .1], [72, 54, .06], [94, 55, -.08], [116, 54, .05]].map(([x, y, a], i) => `<g ${i % 3 === 1 ? 'class="b-flap" ' : ''}style="animation-delay:${i * .4}s"><rect x="${x}" y="${y}" width="14" height="16" fill="${['#efe6cf', '#e8d8b0', '#f4ead4'][i % 3]}" transform="rotate(${(a * 57).toFixed(1)} ${x + 7} ${y})"/><path d="M${x + 3} ${y + 6}h8M${x + 3} ${y + 9}h6M${x + 3} ${y + 12}h7" stroke="#8a7a5a" stroke-width=".8" transform="rotate(${(a * 57).toFixed(1)} ${x + 7} ${y})"/><circle cx="${x + 7}" cy="${y + 1.5}" r="1.4" fill="#c0503c"/></g>`).join('')}
    <path d="M144 40h12v4" stroke="#2a2018" stroke-width="1.5" fill="none"/><rect x="152" y="44" width="8" height="10" rx="1.5" fill="#e8c070" stroke="#3a2a1a"/>${glow(156, 49, 11)}
    <path d="M100 4l5 5l-5 5l-5 -5z" fill="#e7c26a" class="b-pulse"/>`);

  /* Ambar: büyük çift kapı, fıçı yığını, vinçte sallanan sandık */
  A.ambar = () => svg(`${stars(14, 200, 34, 7)}${water(94)}<rect x="0" y="84" width="200" height="10" fill="#5e5648"/><path d="M0 84H200" stroke="#7d7464" stroke-width="2"/>
    <rect x="34" y="34" width="104" height="50" fill="#3e342a"/><rect x="34" y="34" width="104" height="50" fill="url(#bc-wall)"/>
    ${Array.from({ length: 12 }, (_, i) => `<path d="M${38 + i * 8.5} 36v48" stroke="#2e261e"/>`).join('')}
    <path d="M28 36L86 12L144 36Z" fill="#5a4a3a"/><path d="M28 36L86 12L144 36" stroke="#7a6a54" stroke-width="2" fill="none"/>
    <rect x="80" y="20" width="12" height="10" fill="#1a1410"/>${glow(86, 25, 7, '#ffb060', .2)}
    <rect x="62" y="50" width="48" height="34" fill="#5a3c22"/><path d="M62 50l24 34M110 50l-24 34M86 50v34" stroke="#3a2614" stroke-width="2"/><rect x="60" y="48" width="52" height="3" fill="#7a5634"/>
    <path d="M150 84V24H184" stroke="#3a2a1a" stroke-width="4" fill="none"/><path d="M150 40l14 -16" stroke="#3a2a1a" stroke-width="2.5"/>
    <g class="b-swing" style="transform-origin:178px 24px"><path d="M178 24v30" stroke="#a89878"/><rect x="169" y="54" width="18" height="14" fill="#8a6038"/><path d="M169 58h18M178 54v14" stroke="#5a3c22"/></g>
    ${[[8, 76], [20, 76], [14, 68]].map(([x, y]) => `<rect x="${x}" y="${y}" width="11" height="8" rx="2.5" fill="#6a4a2a"/><path d="M${x} ${y + 2.5}h11M${x} ${y + 5.5}h11" stroke="#3a2814"/>`).join('')}`);

  /* Deniz Feneri: kayalıkta kırmızı-beyaz kule, dönen ışık, dalgalar */
  A.fener = () => svg(`${stars(22, 200, 50, 8)}
    <g class="b-beam"><path d="M100 24L200 8V40Z" fill="url(#bc-beam)"/><path d="M100 24L0 8V40Z" fill="url(#bc-beamL)"/></g>
    ${water(78)}<path d="M62 84q10 -12 22 -10q8 -8 18 -4q12 -6 22 2q10 0 16 12z" fill="#2c2a28"/><path d="M70 82q8 -6 16 -6" stroke="#4a4642" fill="none"/>
    ${Array.from({ length: 6 }, (_, i) => `<path d="M${88 + i * .9} ${76 - i * 9}h${24 - i * 1.8}v9h-${24 - i * 1.8}z" fill="${i % 2 ? '#e8e0d0' : '#b0443a'}"/>`).join('')}
    <rect x="88" y="21" width="24" height="3" fill="#2a2420"/><rect x="92" y="13" width="16" height="8" fill="#f7d888"/><path d="M90 13L100 5L110 13Z" fill="#3a2e24"/>${glow(100, 17, 14, '#ffe6a0', .4)}
    <rect x="96" y="58" width="5" height="7" fill="#f0c878" class="b-pulse"/>`);
  A.fenerIcon = () => `<rect x="15" y="12" width="10" height="22" fill="#b0443a"/><rect x="15" y="17" width="10" height="4" fill="#e8e0d0"/><rect x="15" y="25" width="10" height="4" fill="#e8e0d0"/><rect x="16" y="6" width="8" height="6" fill="#f7d888"/><path d="M14 6L20 2L26 6Z" fill="#3a2e24"/><path d="M24 9L38 4V14Z" fill="#f7d888" opacity=".5"/><path d="M10 34h20" stroke="#5a5248" stroke-width="3"/>`;

  /* Büyük İskele: geniş kart · ufuk, ay, iskele, sallanan tekneler, martılar */
  A.iskele = () => svg(`${stars(40, 400, 46, 9)}
    <circle cx="318" cy="30" r="11" fill="#f4e6c4" opacity=".9"/><circle cx="318" cy="30" r="24" fill="#f4e6c4" opacity=".08"/>
    <rect x="0" y="52" width="400" height="80" fill="url(#bc-sea)"/><path d="M0 52H400" stroke="#6fcbef" stroke-opacity=".35"/>
    <path d="M308 56h20M302 62h32M296 70h44M290 80h56M300 92h36" stroke="#f4e6c4" stroke-opacity=".22" stroke-width="2" class="b-pulse"/>
    <g class="b-wave">${Array.from({ length: 22 }, (_, i) => `<path d="M${i * 22 - 22} ${60 + (i % 4) * 9}q6 -3 12 0" stroke="#bfe0e6" stroke-opacity=".2" fill="none"/>`).join('')}</g>
    ${[[110, 56], [210, 58], [372, 60]].map(([x, y], i) => `<g class="b-bob" style="animation-delay:${i * .8}s"><path d="M${x} ${y}v-5" stroke="#3a2a1a"/><circle cx="${x}" cy="${y - 6}" r="1.6" fill="${['#e8474c', '#6fcf62', '#e7c26a'][i]}" class="b-pulse"/><path d="M${x - 3} ${y}h6l-1 3h-4z" fill="#c0503c"/></g>`).join('')}
    <path d="M0 96L150 84H180L40 120H0Z" fill="#5a4030"/><path d="M0 96L150 84H180" stroke="#7a5634" stroke-width="2" fill="none"/>
    ${Array.from({ length: 9 }, (_, i) => `<path d="M${10 + i * 18} ${95 - i * 1.2}L${4 + i * 16} ${118}" stroke="#3a2614" stroke-width="1.2"/>`).join('')}
    ${[[30, 94], [92, 88], [150, 85]].map(([x, y]) => `<rect x="${x}" y="${y - 2}" width="4" height="16" fill="#2a1d12"/>`).join('')}
    <g class="b-bob"><path d="M196 92h40l-6 9h-28z" fill="#6a4a2a"/><path d="M198 92h36" stroke="#8a6038" stroke-width="2"/><path d="M216 92V66" stroke="#3a2614" stroke-width="2"/><path d="M217 67q14 10 0 22z" fill="#efe6cf"/></g>
    <g class="b-bob" style="animation-delay:1.3s"><path d="M262 82h26l-4 6h-18z" fill="#5a3c22"/><path d="M274 82V64" stroke="#3a2614" stroke-width="1.5"/><path d="M275 65q9 7 0 15z" fill="#e8d8b0"/></g>
    <g class="b-fly"><path d="M140 26q4 -3 8 0q4 -3 8 0" stroke="#e6e2da" stroke-width="1.4" fill="none"/><path d="M168 18q3 -2 6 0q3 -2 6 0" stroke="#e6e2da" stroke-width="1.2" fill="none"/></g>
    <g class="b-fly" style="animation-delay:-7s"><path d="M60 34q4 -3 8 0q4 -3 8 0" stroke="#e6e2da" stroke-width="1.3" fill="none"/></g>
    <path d="M150 84V70" stroke="#2a2018" stroke-width="2"/><rect x="146" y="64" width="8" height="7" fill="#e8c070"/>${glow(150, 67, 11)}`, '0 0 400 120');
  return A;
})();
