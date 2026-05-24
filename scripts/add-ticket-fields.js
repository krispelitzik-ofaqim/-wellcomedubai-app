const fs = require('fs');
const path = require('path');

const CATALOG_PATH = path.join(__dirname, '..', 'data', 'catalog.ts');
const GYG_PARTNER = 'PE2GLSE3MAO4YDEIXLNOYXMC67BCZ32C';
const gyg = (slug) => `https://www.getyourguide.com/${slug}?partner_id=${GYG_PARTNER}`;
const gygSearch = (q) => `https://www.getyourguide.com/s/?q=${encodeURIComponent(q)}&partner_id=${GYG_PARTNER}`;

const MAP = {
  // ===== ONLINE — GYG with affiliate =====
  201: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-burj-khalifa-levels-124-125-entry-ticket-options-t49019/') },
  204: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-entry-ticket-to-the-dubai-frame-with-deck-access-t714548/') },
  206: { ticketType: 'online', ticketUrl: gyg('ain-dubai-l165284/') },
  209: { ticketType: 'online', ticketUrl: gyg('miracle-garden-l3351/dubai-miracle-garden-skip-the-line-ticket-t405844/') },
  258: { ticketType: 'online', ticketUrl: gyg('the-view-at-the-palm-l167754/') },
  259: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-sky-views-observatory-tickets-t407711/') },
  262: { ticketType: 'online', ticketUrl: gyg('dubai-opera-l148725/') },
  218: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-img-worlds-of-adventure-t121581/') },
  219: { ticketType: 'online', ticketUrl: gyg('dubai-l173/ski-dubai-tickets-full-day-super-pass-t122445/') },
  220: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-global-village-entry-ticket-t553170/') },
  268: { ticketType: 'online', ticketUrl: gyg('motiongate-dubai-l88333/motiongate-dubai-ticket-at-dubai-parks-and-resorts-t118768/') },
  269: { ticketType: 'online', ticketUrl: gyg('dubai-l173/legolandr-dubai-ticket-at-dubai-parks-and-resorts-1day-1park-t118771/') },
  270: { ticketType: 'online', ticketUrl: gyg('bollywood-parks-dubai-l88615/bollywood-parks-1-day-1-park-admission-t118762/') },
  283: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-real-madrid-world-theme-park-entry-ticket-t649072/') },
  210: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-museum-of-the-future-admission-ticket-t411488/') },
  211: { ticketType: 'online', ticketUrl: gyg('dubai-aquarium-underwater-zoo-l3333/dubai-aquarium-and-underwater-zoo-entry-ticket-t123092/') },
  212: { ticketType: 'online', ticketUrl: gyg('dubai-garden-glow-l169697/') },
  249: { ticketType: 'online', ticketUrl: gyg('etihad-museum-l192837/') },
  264: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-madame-tussauds-adult-general-entry-ticket-t501117/') },
  282: { ticketType: 'online', ticketUrl: gyg('museum-of-illusions-dubai-l135742/dubai-museum-of-illusions-entry-ticket-t302128/') },
  288: { ticketType: 'online', ticketUrl: gyg('dubai-l173/3d-world-selfie-museum-dubai-ticket-t286245/') },
  226: { ticketType: 'online', ticketUrl: gyg('al-fahidi-fort-l4882/') },
  227: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-al-shindagha-museum-entry-ticket-t428614/') },
  805: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-madame-tussauds-adult-general-entry-ticket-t501117/') },
  221: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-desert-safari-with-bbq-dinner-quad-biking-options-t31103/') },
  222: { ticketType: 'online', ticketUrl: gyg('dubai-l173/15-minute-helicopter-tour-of-dubai-t31156/') },
  223: { ticketType: 'online', ticketUrl: gyg('dubai-marina-l3415/90-minute-palm-burj-al-arab-rib-tour-t90741/') },
  224: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-guided-city-walking-tour-to-spice-and-gold-souk-t427563/') },
  254: { ticketType: 'online', ticketUrl: gyg('dubai-marina-l3415/dubai-marina-luxury-dhow-dinner-cruise-t199267/') },
  255: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-marina-1-hour-luxury-sightseeing-speedboat-tour-t559949/') },
  291: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-fountain-show-and-burj-lake-ride-by-traditional-boat-t60095/') },
  521: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-big-bus-hop-on-hop-off-tour-dhow-cruise-t5105/') },
  522: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-city-sightseeing-hoho-bus-tour-sunset-night-tour-t49021/') },
  243: { ticketType: 'online', ticketUrl: gyg('skydive-dubai-l92336/dubai-skydive-over-the-palm-or-the-desert-t298845/') },
  244: { ticketType: 'online', ticketUrl: gyg('ifly-dubai-l3322/') },
  245: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-hot-air-balloon-tour-over-the-dubai-desert-t411207/') },
  246: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-17-minute-panoramic-helicopter-tour-t56081/') },
  280: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-dinner-in-the-sky-t102806/') },
  802: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-sky-views-observatory-tickets-t407711/') },
  267: { ticketType: 'online', ticketUrl: gyg('hatta-l2455/hatta-mountain-tour-water-dam-heritage-village-bee-garden-t649583/') },
  284: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-1hr-topgolf-game-t738994/') },
  803: { ticketType: 'online', ticketUrl: gygSearch('Dreamscape Dubai') },
  804: { ticketType: 'online', ticketUrl: gyg('wadi-hub-at-hatta-resorts-l261593/') },
  231: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-premium-red-dunes-camel-bbq-safari-at-al-khayma-t387428/') },
  232: { ticketType: 'online', ticketUrl: gyg('dubai-l173/desert-safari-with-bbq-dinner-live-shows-free-quad-biking-t25698/') },
  233: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-fossil-camel-rocks-extreme-safari-w-bbq-dinner-t121428/') },
  234: { ticketType: 'online', ticketUrl: gyg('dubai-l173/red-dunes-desert-safari-with-bbq-buffet-dinner-t56413/') },
  235: { ticketType: 'online', ticketUrl: gyg('dubai-desert-conservation-reserve-l3312/sunrise-desert-dunes-wildlife-experience-t390592/') },
  263: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-aya-universe-entry-ticket-t513502/') },
  216: { ticketType: 'online', ticketUrl: gyg('dubai-l173/aquaventure-world-waterpark-ticket-at-atlantis-dubai-t570397/') },
  217: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-wild-wadi-waterpark-full-day-ticket-t124418/') },
  289: { ticketType: 'online', ticketUrl: gyg('dubai-l173/1-day-legolandr-water-park-pass-at-dubai-parks-and-resorts-t118774/') },
  225: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-1-day-entry-ticket-to-dubai-safari-park-t443463/') },
  266: { ticketType: 'online', ticketUrl: gyg('dubai-l173/the-green-planet-t105442/') },
  286: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-skip-the-line-ticket-to-butterfly-garden-t404997/') },
  295: { ticketType: 'online', ticketUrl: 'https://dubaidutyfreetennischampionships.com/tickets/' },
  296: { ticketType: 'online', ticketUrl: 'https://www.dubaimarathon.com/' },
  297: { ticketType: 'online', ticketUrl: 'https://www.dubaidesertclassic.com/' },
  265: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-the-lost-chambers-aquarium-tickets-t130209/') },
  287: { ticketType: 'online', ticketUrl: gyg('dubai-l173/dubai-dubai-dolphinarium-dolphin-seal-bird-show-tickets-t564165/') },
  281: { ticketType: 'online', ticketUrl: gyg('la-perle-by-dragone-l111552/la-perle-by-dragone-al-habtoor-city-t127463/') },
  800: { ticketType: 'online', ticketUrl: 'https://www.tiqets.com/en/theatre-of-digital-art-tickets-l187196/' },

  // ===== ONSITE =====
  207: { ticketType: 'onsite' },
  250: { ticketType: 'onsite' },
  251: { ticketType: 'onsite' },
  252: { ticketType: 'onsite' },
  241: { ticketType: 'onsite' },
  228: { ticketType: 'onsite' },
  238: { ticketType: 'onsite' },
  290: { ticketType: 'onsite' },
  278: { ticketType: 'onsite' },
  806: { ticketType: 'onsite' },

  // ===== FREE =====
  202: { ticketType: 'free' },
  203: { ticketType: 'free' },
  205: { ticketType: 'free' },
  208: { ticketType: 'free' },
  285: { ticketType: 'free' },
  298: { ticketType: 'free' },
  299: { ticketType: 'free' },
  237: { ticketType: 'free' },
  801: { ticketType: 'free' },
  247: { ticketType: 'free' },
  248: { ticketType: 'free' },
  236: { ticketType: 'free' },
  213: { ticketType: 'free' },
  214: { ticketType: 'free' },
  215: { ticketType: 'free' },
  277: { ticketType: 'free' },

  // ===== APPOINTMENT =====
  260: { ticketType: 'appointment' },
  253: { ticketType: 'appointment' },
  229: { ticketType: 'appointment' },
  230: { ticketType: 'appointment' },
  256: { ticketType: 'appointment' },
  274: { ticketType: 'appointment' },
  275: { ticketType: 'appointment' },
  276: { ticketType: 'appointment' },
  279: { ticketType: 'appointment' },
};

// Read the file as text
const src = fs.readFileSync(CATALOG_PATH, 'utf8');
const startToken = 'export const CATALOG = ';
const endToken = '};\n\nexport const DB_VERSION = ';
const startIdx = src.indexOf(startToken);
const endIdx = src.indexOf(endToken);
if (startIdx === -1 || endIdx === -1) throw new Error('Could not locate CATALOG section');

const jsonText = src.substring(startIdx + startToken.length, endIdx + 1);
const catalog = JSON.parse(jsonText);

// Apply ticket fields to attractions
const att = catalog.attractions;
let updated = 0, missing = [];
const applied = new Set();
for (const item of att) {
  if (item.id && MAP[item.id]) {
    Object.assign(item, MAP[item.id]);
    applied.add(item.id);
    updated++;
  }
}
for (const id of Object.keys(MAP)) {
  if (!applied.has(+id)) missing.push(id);
}

// Bump version
const versionMatch = src.match(/export const DB_VERSION = (\d+);/);
const oldVersion = versionMatch ? parseInt(versionMatch[1]) : 188;
const newVersion = oldVersion + 1;

// Write back preserving format
const newJson = JSON.stringify(catalog, null, 2);
const newSrc = src.substring(0, startIdx) +
  startToken + newJson + ';\n\n' +
  `export const DB_VERSION = ${newVersion};\n`;

fs.writeFileSync(CATALOG_PATH, newSrc);

console.log(`עודכנו: ${updated} אטרקציות`);
console.log(`חסרים: ${missing.length}${missing.length ? ' → ' + missing.join(', ') : ''}`);
console.log(`DB_VERSION: ${oldVersion} → ${newVersion}`);
