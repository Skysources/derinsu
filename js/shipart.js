/* =========================================================
   DERİNSU — gemi resimleri
   ShipArt.side(id): yandan görünüş (Tersane, ambar başlığı, şehir kartı). Gemi suda salınır, yelkenler
     şişer, flamalar dalgalanır, fenerler yanar, dalgalar kayar. Sınıflar CSS'te (sh-*).
   ShipArt.top(id): kuşbakışı (açık deniz haritasındaki tekne), pruva yukarıda.
   ShipArt.TOP[id]: kuşbakışı boyutu { w, h }.
   ========================================================= */
'use strict';
window.ShipArt = (() => {
  const sea = (id, c) => `
    <defs>
      <linearGradient id="sw-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2a5a66"/><stop offset="1" stop-color="#0c1a20"/></linearGradient>
      <linearGradient id="sk-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#16120f"/><stop offset=".7" stop-color="#2a2420"/><stop offset="1" stop-color="#3a3028"/></linearGradient>
      <radialGradient id="sg-${id}" cx="50%" cy="78%" r="60%"><stop offset="0" stop-color="${c}" stop-opacity=".28"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>
      <linearGradient id="wd-${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a87a50"/><stop offset=".5" stop-color="#7a5634"/><stop offset="1" stop-color="#4a3220"/></linearGradient>
      <linearGradient id="sl-${id}" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#f4ecd8"/><stop offset=".7" stop-color="#e2d6bc"/><stop offset="1" stop-color="#c8b898"/></linearGradient>
    </defs>
    <rect width="240" height="150" fill="url(#sk-${id})"/><rect width="240" height="150" fill="url(#sg-${id})"/>
    ${stars(id.length * 7 + c.length)}
    <rect x="0" y="112" width="240" height="38" fill="url(#sw-${id})"/><path d="M0 112H240" stroke="${c}" stroke-opacity=".35"/>`;
  const stars = seed => { let s = seed * 9301 + 49297, o = ''; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 22; i++) o += `<circle cx="${(r() * 240).toFixed(1)}" cy="${(r() * 60 + 3).toFixed(1)}" r="${(r() * .7 + .3).toFixed(2)}" fill="#f2eee4" class="sh-tw" style="animation-delay:${(r() * 3).toFixed(2)}s"/>`; return o; };
  // önde kayan dalgalar ve gövdenin sudaki yansıması
  const front = (id, c, refl) => `
    <g class="sh-refl" opacity=".12" transform="translate(0 232) scale(1 -1)">${refl.replace(/<text[\s\S]*?<\/text>/g, '')}</g>
    <g class="sh-wave">${Array.from({ length: 14 }, (_, i) => `<path d="M${i * 22 - 22} ${118 + (i % 3) * 8}q6 -3 12 0" stroke="#cfe6ea" stroke-opacity=".3" fill="none"/>`).join('')}</g>
    <g class="sh-wave b">${Array.from({ length: 14 }, (_, i) => `<path d="M${i * 22 - 11} ${124 + (i % 2) * 12}q5 -2.5 10 0" stroke="#cfe6ea" stroke-opacity=".18" fill="none"/>`).join('')}</g>
    <path d="M0 113q30 -3 60 0t60 0t60 0t60 0" stroke="${c}" stroke-opacity=".22" fill="none" class="sh-wave"/>`;
  const lamp = (x, y, c = '#ffd27a', r = 3) => `<circle cx="${x}" cy="${y}" r="${r * 3.2}" fill="${c}" fill-opacity=".14" class="sh-lamp"/><circle cx="${x}" cy="${y}" r="${r * 1.8}" fill="${c}" fill-opacity=".22" class="sh-lamp"/><circle cx="${x}" cy="${y}" r="${r}" fill="${c}"/>`;
  const flag = (x, y, c, w = 14, cls = '') => `<g class="sh-flag ${cls}" style="transform-origin:${x}px ${y}px"><path d="M${x} ${y}l${w} 3l-${w} 4z" fill="${c}"/></g>`;
  const svg = (id, body) => `<svg class="ship-svg ship-${id}" viewBox="0 0 240 150" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${body}</svg>`;

  const S = {};
  /* 1 · Martı · sandal: tek lateen yelken, kürekler, direkte martı, kıçta fener */
  S.marti = () => {
    const c = '#c9a26b';
    const hull = `<path d="M54 96L190 91Q186 110 164 120L84 121Q62 117 54 96Z" fill="url(#wd-marti)"/>
      <path d="M58 101Q120 110 186 98M66 109Q120 118 180 105" stroke="#3a2614" stroke-width="1" fill="none" opacity=".7"/>
      <path d="M54 96L190 91" stroke="#d8b47a" stroke-width="2.5"/><path d="M57 99L188 94" stroke="#b0443a" stroke-width="1.6"/>`;
    return svg('marti', `${sea('marti', c)}
      <g class="sh-bob">
        <path d="M78 101L44 126" stroke="#a87a50" stroke-width="2.4" stroke-linecap="round"/><ellipse cx="44" cy="126" rx="6" ry="2.4" fill="#8a6038" transform="rotate(-36 44 126)"/>
        ${hull}
        <path d="M112 94V30" stroke="#6a4a2a" stroke-width="3"/><path d="M86 90L156 28" stroke="#5a3c22" stroke-width="2"/>
        <g class="sh-sail" style="transform-origin:112px 60px"><path d="M154 30Q150 64 156 88L114 88Q130 58 154 30Z" fill="url(#sl-marti)"/><path d="M151 42Q140 64 128 86" stroke="#b0443a" stroke-width="3" fill="none" opacity=".85"/><path d="M154 30Q150 64 156 88" stroke="#a89878" fill="none"/></g>
        <g class="sh-gull"><path d="M106 28q3 -4 6 -1q3 -3 6 1" stroke="#f2eee4" stroke-width="1.6" fill="none"/><circle cx="112" cy="27" r="1.6" fill="#f2eee4"/></g>
        <rect x="140" y="84" width="12" height="9" rx="2" fill="#6a4a2a"/><path d="M140 87h12" stroke="#3a2814"/><ellipse cx="146" cy="83" rx="5" ry="1.8" fill="#a8c0c4"/>
        <path d="M66 94v-10" stroke="#3a2a1a" stroke-width="1.5"/>${lamp(66, 82)}
        <path d="M120 99L152 124" stroke="#a87a50" stroke-width="2.4" stroke-linecap="round" opacity=".8"/>
      </g>${front('marti', c, hull)}`);
  };
  /* 2 · Yakamoz · tirhandil: iki ucu sivri, mavi-beyaz gövde, kamara, pruvada fener, ışıldayan su */
  S.yakamoz = () => {
    const c = '#4ea4f0';
    const hull = `<path d="M36 92Q44 90 58 91L186 91Q198 90 206 84Q196 110 172 120L72 121Q48 112 36 92Z" fill="#2c5a8c"/>
      <path d="M36 92Q44 90 58 91L186 91Q198 90 206 84L203 92Q196 99 186 99L58 99Q46 99 39 96Z" fill="#efe8d8"/>
      <path d="M44 107Q120 113 196 104" stroke="#b0443a" stroke-width="2" fill="none"/><path d="M58 91L186 91" stroke="#2a2018" stroke-width="1.5"/>
      ${[70, 96, 122, 148, 174].map(x => `<path d="M${x} 100v18" stroke="#1e4470" stroke-width="1" opacity=".7"/>`).join('')}`;
    return svg('yakamoz', `${sea('yakamoz', c)}
      <g class="sh-bob">
        ${hull}
        <rect x="62" y="70" width="34" height="21" rx="2" fill="#efe8d8"/><path d="M58 70h42l-4 -7h-34z" fill="#2c5a8c"/>
        ${[68, 80].map(x => `<rect x="${x}" y="75" width="8" height="7" rx="1" fill="#ffd27a" class="sh-lamp" style="animation-duration:4s"/>`).join('')}<rect x="88" y="74" width="5" height="17" fill="#3a2a1a"/>
        <path d="M140 91V26" stroke="#5a3c22" stroke-width="3"/><path d="M110 88L178 22" stroke="#4a3220" stroke-width="2"/>
        <g class="sh-sail" style="transform-origin:140px 58px"><path d="M176 24Q170 60 180 86L142 86Q154 54 176 24Z" fill="url(#sl-yakamoz)"/><path d="M176 24Q170 60 180 86" stroke="${c}" stroke-width="2" fill="none"/><path d="M172 44q-12 18 -22 40" stroke="${c}" stroke-opacity=".5" stroke-width="5" fill="none"/></g>
        ${flag(140, 26, c, 16)}
        <path d="M200 86q6 -2 8 -10" stroke="#3a2a1a" stroke-width="1.4" fill="none"/>${lamp(208, 74, '#bfe6ff', 3)}
        <path d="M100 91h20v-4h-20z" fill="#5a3c22"/><path d="M104 87q6 -6 12 0" stroke="#d8cdb4" fill="none"/>
      </g>
      ${front('yakamoz', c, hull)}
      <g>${Array.from({ length: 16 }, (_, i) => `<circle cx="${30 + i * 12 + (i % 3) * 3}" cy="${116 + (i % 4) * 6}" r="${1 + (i % 3) * .5}" fill="#7fe0ff" class="sh-tw" style="animation-delay:${(i * .27).toFixed(2)}s"/>`).join('')}</g>`);
  };
  /* 3 · Lodos · gulet: cilalı maun gövde, altın şerit, iki direk, gaf yelkenler, cıvadra flokları, flamalar */
  S.lodos = () => {
    const c = '#6fcf62';
    const hull = `<path d="M26 90L204 84Q214 84 220 78L226 78Q218 104 196 116L58 118Q34 112 26 90Z" fill="#6a2e1c"/>
      <path d="M26 90L204 84Q214 84 220 78L226 78L224 84Q212 92 204 92L30 98Z" fill="#8a4228"/>
      <path d="M30 99L206 93" stroke="#e7c26a" stroke-width="1.8"/><path d="M40 108Q120 112 202 104" stroke="#2a1410" stroke-width="1" opacity=".7"/>
      ${[56, 80, 104, 128, 152, 176].map(x => `<circle cx="${x}" cy="95.5" r="1.7" fill="#2a1410" stroke="#e7c26a" stroke-width=".6"/>`).join('')}`;
    return svg('lodos', `${sea('lodos', c)}
      <g class="sh-bob">
        <path d="M218 80L240 70" stroke="#5a3c22" stroke-width="2"/>
        ${hull}
        <path d="M24 88L22 78M22 78h10" stroke="#5a3c22" stroke-width="1.6"/>${flag(22, 72, '#b0443a', 12)}
        <rect x="58" y="74" width="60" height="12" rx="3" fill="#efe8d8"/><rect x="58" y="72" width="60" height="3" rx="1.5" fill="#8a4228"/>
        ${[66, 80, 94, 108].map(x => `<circle cx="${x}" cy="80" r="2.6" fill="#ffd27a" class="sh-lamp" style="animation-duration:4.6s"/>`).join('')}
        <path d="M90 74V14" stroke="#5a3c22" stroke-width="3"/><path d="M160 86V24" stroke="#5a3c22" stroke-width="3"/>
        <g class="sh-sail" style="transform-origin:90px 44px"><path d="M92 18L130 26Q126 50 132 70L92 70Z" fill="url(#sl-lodos)"/><path d="M92 18L130 26" stroke="#5a3c22" stroke-width="1.6"/><path d="M92 70h40" stroke="#5a3c22" stroke-width="1.6"/></g>
        <g class="sh-sail b" style="transform-origin:160px 54px"><path d="M162 28L194 34Q190 56 196 80L162 80Z" fill="url(#sl-lodos)"/><path d="M162 28L194 34M162 80h34" stroke="#5a3c22" stroke-width="1.4"/></g>
        <g class="sh-sail c" style="transform-origin:200px 60px"><path d="M162 26L236 72L198 74Z" fill="#e8dcc0"/><path d="M162 26L236 72" stroke="#a89878" fill="none"/></g>
        ${flag(90, 14, c, 18, 'b')}${flag(160, 24, '#e7c26a', 14)}
        ${lamp(36, 84, '#ffd27a', 2.6)}${lamp(214, 78, '#9bff9b', 2.2)}
      </g>${front('lodos', c, hull)}`);
  };
  /* 4 · Poyraz · trol teknesi: kırmızı çelik gövde, ışıklı kaptan köşkü, dönen radar, bacadan duman, kıçta A-çatı ve ağ makarası */
  S.poyraz = () => {
    const c = '#e0853a';
    const hull = `<path d="M28 86L196 80Q212 80 220 68L226 68Q218 104 196 118L44 118Q30 106 28 86Z" fill="#a8382c"/>
      <path d="M36 108Q120 112 206 102L196 118L44 118Z" fill="#1e1a1c"/><path d="M28 86L196 80Q212 80 220 68" stroke="#efe8d8" stroke-width="2.5" fill="none"/>
      ${[60, 92, 124].map(x => `<ellipse cx="${x}" cy="96" rx="5" ry="6" fill="#1e1a1c" stroke="#3a3436" stroke-width="2"/>`).join('')}
      <text x="150" y="99" font-family="Georgia,serif" font-size="8" font-weight="700" fill="#efe8d8" letter-spacing="1">POYRAZ</text>`;
    return svg('poyraz', `${sea('poyraz', c)}
      <g class="sh-bob">
        ${hull}
        <path d="M36 84L44 34L60 84M44 34h-6" stroke="#e0a83a" stroke-width="3" fill="none"/><path d="M44 36L80 70" stroke="#c8c0b4" stroke-width="1"/>
        <circle cx="66" cy="76" r="8" fill="#3a3436" stroke="#6a6466" stroke-width="2"/><path d="M60 74l12 4M60 78l12 -4" stroke="#7a9a6a" stroke-width="1.4"/>
        <rect x="104" y="64" width="16" height="18" fill="#3a3436"/><rect x="108" y="54" width="10" height="12" fill="#1e1a1c"/><rect x="108" y="56" width="10" height="3" fill="${c}"/>
        <g class="sh-smoke">${[0, 1, 2].map(i => `<circle cx="${113 + i * 4}" cy="${46 - i * 6}" r="${4 + i * 2}" fill="#bdb6ac" opacity=".2" style="animation-delay:${i * 1.1}s"/>`).join('')}</g>
        <rect x="130" y="52" width="50" height="30" rx="2" fill="#efe8d8"/><rect x="126" y="48" width="58" height="5" rx="1" fill="#3a3436"/>
        ${[134, 148, 162].map(x => `<rect x="${x}" y="57" width="11" height="8" rx="1" fill="#ffd27a" class="sh-lamp" style="animation-duration:5s"/>`).join('')}<rect x="168" y="68" width="8" height="14" fill="#5a5052"/>
        <path d="M160 48V16" stroke="#c8c0b4" stroke-width="2"/><g class="sh-radar" style="transform-origin:160px 20px"><rect x="148" y="18" width="24" height="3" rx="1.5" fill="#efe8d8"/></g>
        ${flag(160, 14, c, 12)}${lamp(160, 30, '#e8474c', 2)}
        <path d="M184 72L206 54M206 54v18" stroke="#e0a83a" stroke-width="2.5" fill="none"/><path d="M206 56v12" stroke="#c8c0b4" stroke-width=".8"/><circle cx="206" cy="70" r="2" fill="#e0a83a"/>
        ${[80, 98].map(x => `<circle cx="${x}" cy="86" r="3.2" fill="none" stroke="#2a2420" stroke-width="2.2"/>`).join('')}
        ${lamp(222, 66, '#9bff9b', 2)}
      </g>${front('poyraz', c, hull)}`);
  };
  /* 5 · Derin Ejder · kalyon: kara gövde, altın süsler, top kapakları, ışıklı kıç kasarası, üç direkte kara yelkenler, ejder başı */
  S.ejder = () => {
    const c = '#b9a6e6';
    const hull = `<path d="M10 74L38 62L62 70L188 70L212 62Q222 64 226 70Q220 104 196 118L50 120Q20 108 10 74Z" fill="#241c26"/>
      <path d="M12 80L62 76L190 76L222 72" stroke="#c9a24e" stroke-width="1.6" fill="none"/><path d="M20 96Q120 102 214 92" stroke="#c9a24e" stroke-width="1.2" fill="none"/>
      ${[56, 76, 96, 116, 136, 156, 176].map(x => `<rect x="${x}" y="82" width="8" height="7" fill="#120e14" stroke="#c9a24e" stroke-width=".7"/><rect x="${x + 2}" y="84" width="4" height="3" fill="#ff9a50" class="sh-lamp" style="animation-duration:3.4s;animation-delay:${(x % 7) * .2}s"/>`).join('')}`;
    const sq = (x, y, w, h, k) => `<path d="M${x - w / 2} ${y}Q${x} ${y + 3} ${x + w / 2} ${y}L${x + w / 2 - 2} ${y + h}Q${x} ${y + h + 5} ${x - w / 2 + 2} ${y + h}Z" fill="#3a2a4a" stroke="#c9a24e" stroke-width=".8"/>${k ? `<path d="M${x - 6} ${y + h / 2}q6 -8 12 0q-6 4 -12 0z" fill="#c9a24e" opacity=".9"/><circle cx="${x + 2}" cy="${y + h / 2 - 1}" r="1" fill="#e8474c" class="sh-lamp"/>` : ''}`;
    return svg('ejder', `${sea('ejder', c)}
      <g class="sh-bob">
        <path d="M214 66L240 52" stroke="#3a2a1a" stroke-width="2.2"/>
        ${hull}
        <path d="M10 74L14 50L40 52L38 62Z" fill="#2e2432" stroke="#c9a24e" stroke-width="1"/>${[18, 26].map(x => `<rect x="${x}" y="55" width="5" height="6" fill="#ffd27a" class="sh-lamp"/>`).join('')}
        ${lamp(12, 48, '#ffd27a', 2.6)}
        <path d="M216 70Q224 62 226 52Q227 46 232 43L239 41L236 46L240 48L233 50Q230 54 230 60Q228 68 222 74Z" fill="#5a3a8a" stroke="#c9a24e" stroke-width=".8"/>
        <path d="M231 43l-3 -6l5 4M234 42l1 -6l2 6" stroke="#c9a24e" stroke-width="1.1" fill="none"/><path d="M224 58q3 2 5 0M223 63q3 2 5 0" stroke="#c9a24e" stroke-width=".7" fill="none"/>
        <circle cx="233.5" cy="45" r="1.1" fill="#ff5050" class="sh-lamp"/>
        <g class="sh-sail" style="transform-origin:70px 40px">${sq(70, 18, 32, 20)}${sq(70, 42, 38, 24)}</g>
        <g class="sh-sail b" style="transform-origin:126px 36px">${sq(126, 12, 36, 22)}${sq(126, 38, 44, 28, true)}</g>
        <g class="sh-sail c" style="transform-origin:182px 44px">${sq(182, 22, 30, 18)}${sq(182, 44, 34, 22)}</g>
        <path d="M70 70V10M126 70V4M182 70V14" stroke="#4a3624" stroke-width="2.6"/>
        ${[[70, 18, 32], [70, 42, 38], [126, 12, 36], [126, 38, 44], [182, 22, 30], [182, 44, 34]].map(([x, y, w]) => `<path d="M${x - w / 2 - 3} ${y}H${x + w / 2 + 3}" stroke="#4a3624" stroke-width="2" stroke-linecap="round"/>`).join('')}
        <path d="M70 10L126 4L182 14M126 4L214 64M70 10L14 50" stroke="#a89878" stroke-width=".5" opacity=".6"/>
        ${flag(70, 10, c, 20, 'b')}${flag(126, 4, '#c9a24e', 24)}${flag(182, 14, c, 18, 'c')}
      </g>${front('ejder', c, hull)}`);
  };

  /* ---- kuşbakışı: pruva yukarıda ---- */
  const TOP = { marti: { w: 34, h: 56 }, yakamoz: { w: 38, h: 66 }, lodos: { w: 42, h: 80 }, poyraz: { w: 46, h: 84 }, ejder: { w: 54, h: 98 } };
  const T = {};
  T.marti = () => `<ellipse cx="19" cy="31" rx="12" ry="24" fill="rgba(0,0,0,.3)"/>
    <path d="M17 2Q30 16 28 44Q17 54 6 44Q4 16 17 2Z" fill="#5a3c22"/><path d="M17 6Q26 18 25 42Q17 49 9 42Q8 18 17 6Z" fill="#8a6038"/>
    <rect x="9" y="20" width="16" height="2.6" fill="#5a3c22"/><rect x="9" y="33" width="16" height="2.6" fill="#5a3c22"/>
    <path d="M2 28L-6 36M32 28L40 36" stroke="#a87a50" stroke-width="1.6" stroke-linecap="round"/>
    <circle cx="17" cy="39" r="4.4" fill="#3c5a5e"/><ellipse cx="17" cy="38.4" rx="6" ry="5.4" fill="#b8913e"/><circle cx="17" cy="38.4" r="3" fill="#d6af57"/>
    <circle cx="17" cy="15" r="1.6" fill="#3a2614"/><path d="M17 15Q27 20 18 30Z" fill="#efe6cf" opacity=".92"/><path d="M19 18Q24 21 19 26" stroke="#b0443a" stroke-width="1.4" fill="none"/>`;
  T.yakamoz = () => `<ellipse cx="21" cy="36" rx="14" ry="28" fill="rgba(0,0,0,.3)"/>
    <path d="M19 2Q34 18 32 34Q32 52 19 64Q6 52 6 34Q4 18 19 2Z" fill="#2c5a8c"/><path d="M19 6Q30 19 29 34Q29 50 19 59Q9 50 9 34Q8 19 19 6Z" fill="#efe8d8"/>
    <path d="M19 9Q27 20 26 34Q26 48 19 55Q12 48 12 34Q11 20 19 9Z" fill="#a87a50"/>
    <rect x="12" y="38" width="14" height="10" rx="1.5" fill="#efe8d8"/><rect x="12" y="38" width="14" height="3" fill="#2c5a8c"/>
    <circle cx="19" cy="22" r="1.7" fill="#3a2614"/><path d="M19 22Q31 27 20 37Z" fill="#efe6cf" opacity=".92"/><path d="M21 25Q27 28 21 33" stroke="#4ea4f0" stroke-width="1.4" fill="none"/>
    <circle cx="19" cy="5" r="2.2" fill="#bfe6ff"/><circle cx="19" cy="5" r="6" fill="#bfe6ff" opacity=".25"/>`;
  T.lodos = () => `<ellipse cx="22" cy="44" rx="16" ry="34" fill="rgba(0,0,0,.3)"/>
    <path d="M21 0V-6" stroke="#5a3c22" stroke-width="1.6"/>
    <path d="M21 2Q38 22 36 46Q36 66 30 76L12 76Q6 66 6 46Q4 22 21 2Z" fill="#6a2e1c"/><path d="M21 6Q34 24 33 46Q33 64 28 72L14 72Q9 64 9 46Q8 24 21 6Z" fill="#c9a26b"/>
    ${Array.from({ length: 8 }, (_, i) => `<path d="M${11 + i * 2.8} 14V70" stroke="#a87a50" stroke-width=".8"/>`).join('')}
    <rect x="13" y="46" width="16" height="18" rx="3" fill="#efe8d8"/><rect x="13" y="46" width="16" height="3" rx="1.5" fill="#8a4228"/>
    <circle cx="21" cy="24" r="1.8" fill="#3a2614"/><circle cx="21" cy="52" r="1.6" fill="#3a2614"/>
    <path d="M21 24Q34 30 22 40Z" fill="#efe6cf" opacity=".92"/><path d="M21 52Q31 57 22 64Z" fill="#efe6cf" opacity=".9"/><path d="M21 6L28 22" stroke="#e8dcc0" stroke-width="2"/>
    <path d="M7 50L35 49" stroke="#e7c26a" stroke-width=".8"/>`;
  T.poyraz = () => `<ellipse cx="24" cy="46" rx="18" ry="36" fill="rgba(0,0,0,.32)"/>
    <path d="M23 2Q40 20 40 44L40 80L6 80L6 44Q6 20 23 2Z" fill="#a8382c"/><path d="M23 6Q37 22 37 44L37 77L9 77L9 44Q9 22 23 6Z" fill="#5a5052"/>
    <path d="M9 60h28v17H9z" fill="#4a4244"/><circle cx="23" cy="68" r="5.5" fill="#3a3436" stroke="#7a9a6a" stroke-width="1.6"/>
    <path d="M8 76L23 60L38 76" stroke="#e0a83a" stroke-width="2.2" fill="none"/>
    <rect x="12" y="28" width="22" height="18" rx="2" fill="#efe8d8"/><rect x="14" y="30" width="18" height="4" fill="#3a3436"/>
    <rect x="18" y="48" width="10" height="7" fill="#3a3436"/><circle cx="23" cy="51" r="2.4" fill="#1e1a1c"/>
    <g class="sh-radar" style="transform-origin:23px 37px"><rect x="15" y="36" width="16" height="2" rx="1" fill="#c8c0b4"/></g>
    <circle cx="23" cy="14" r="2" fill="#e8474c"/>`;
  T.ejder = () => `<ellipse cx="28" cy="54" rx="21" ry="42" fill="rgba(0,0,0,.34)"/>
    <path d="M27 -4V4" stroke="#3a2a1a" stroke-width="2"/><path d="M27 -6q-4 2 -3 6q3 -1 6 -6z" fill="#8a6ac8"/>
    <path d="M27 2Q48 22 47 54Q47 82 40 96L14 96Q7 82 7 54Q6 22 27 2Z" fill="#241c26"/><path d="M27 6Q44 24 43 54Q43 80 37 92L17 92Q11 80 11 54Q10 24 27 6Z" fill="#7a5634"/>
    <path d="M27 6Q44 24 43 54Q43 80 37 92" stroke="#c9a24e" stroke-width="1" fill="none"/><path d="M27 6Q10 24 11 54Q11 80 17 92" stroke="#c9a24e" stroke-width="1" fill="none"/>
    <rect x="13" y="78" width="28" height="14" rx="2" fill="#2e2432" stroke="#c9a24e" stroke-width=".8"/><rect x="18" y="82" width="4" height="4" fill="#ffd27a"/><rect x="32" y="82" width="4" height="4" fill="#ffd27a"/>
    ${[22, 46, 68].map((y, i) => `<rect x="${7 - i}" y="${y - 2}" width="${40 + i * 2}" height="5" rx="2.5" fill="#3a2a4a" stroke="#c9a24e" stroke-width=".6"/><circle cx="27" cy="${y}" r="2.2" fill="#3a2a1a"/>`).join('')}
    <path d="M22 46q5 -5 10 0q-5 3 -10 0z" fill="#c9a24e"/>`;
  const top = id => { const d = TOP[id]; return `<svg class="mv-boat ship-top" viewBox="0 0 ${d.w} ${d.h}" overflow="visible" style="width:${d.w}px;height:${d.h}px;left:${-d.w / 2}px;top:${-d.h / 2}px">${T[id]()}</svg>`; };
  return { side: id => S[id](), top, TOP };
})();
