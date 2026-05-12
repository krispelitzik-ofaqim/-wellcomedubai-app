export type StarSpoke = { name: string; lat: number; lng: number };
export type StarHub = {
  name: string;
  icon: string;
  color: string;
  center: { lat: number; lng: number };
  desc: string;
  spokes: StarSpoke[];
};

export const STAR_HUBS: StarHub[] = [
  { name: 'דובאי מרינה', icon: '⛵', color: '#5B9DC7', center: { lat: 25.0820, lng: 55.1410 },
    desc: 'נמל מודרני עם פרומנדה, יאכטות, מועדוני חוף וגורדי שחקים.',
    spokes: [
      { name: 'פרומנדה Marina Walk', lat: 25.0820, lng: 55.1410 },
      { name: 'JBR + The Beach', lat: 25.0795, lng: 55.1340 },
      { name: 'Ain Dubai (Bluewaters)', lat: 25.0786, lng: 55.1255 },
      { name: 'Skydive Dubai', lat: 25.0890, lng: 55.1370 },
      { name: 'יאכטה / סירת מנוע', lat: 25.0820, lng: 55.1410 },
      { name: 'Zero Gravity Beach Club', lat: 25.0930, lng: 55.1397 },
    ],
  },
  { name: 'Downtown Dubai', icon: '🏙️', color: '#E76F51', center: { lat: 25.1972, lng: 55.2744 },
    desc: 'לב העיר — מגדל בורג׳ ח׳ליפה, דובאי מול ומופע המזרקות.',
    spokes: [
      { name: 'Burj Khalifa', lat: 25.1972, lng: 55.2744 },
      { name: 'Dubai Mall', lat: 25.1972, lng: 55.2796 },
      { name: 'Dubai Fountain', lat: 25.1955, lng: 55.2745 },
      { name: 'Souk Al Bahar', lat: 25.1956, lng: 55.2773 },
      { name: 'Dubai Aquarium', lat: 25.1972, lng: 55.2796 },
      { name: 'Dubai Opera', lat: 25.1936, lng: 55.2728 },
    ],
  },
  { name: 'Palm Jumeirah', icon: '🌴', color: '#F4A261', center: { lat: 25.1124, lng: 55.1390 },
    desc: 'אי דקל עם מלונות יוקרה, פארקי מים, מסעדות מישלן וביץ׳ קלאבים.',
    spokes: [
      { name: 'Atlantis The Palm', lat: 25.1305, lng: 55.1175 },
      { name: 'Aquaventure Waterpark', lat: 25.1295, lng: 55.1183 },
      { name: 'The Pointe', lat: 25.1342, lng: 55.1212 },
      { name: 'View at the Palm', lat: 25.1124, lng: 55.1390 },
      { name: 'Nobu Dubai', lat: 25.1305, lng: 55.1175 },
      { name: 'Monorail Palm', lat: 25.0917, lng: 55.1502 },
    ],
  },
  { name: 'Old Dubai (Deira)', icon: '🕌', color: '#2A9D8F', center: { lat: 25.2655, lng: 55.2962 },
    desc: 'דובאי הישנה — שוקי הזהב והתבלינים, סירות ה-Abra והמחוז ההיסטורי.',
    spokes: [
      { name: 'Gold Souk', lat: 25.2697, lng: 55.2967 },
      { name: 'Spice Souk', lat: 25.2680, lng: 55.2960 },
      { name: 'Abra Boats (Creek)', lat: 25.2638, lng: 55.2972 },
      { name: 'Al Fahidi Historic', lat: 25.2630, lng: 55.2980 },
      { name: 'Dubai Museum', lat: 25.2632, lng: 55.2972 },
      { name: 'Textile Souk', lat: 25.2620, lng: 55.2980 },
    ],
  },
  { name: 'Al Barsha (Mall of Emirates)', icon: '❄️', color: '#B85C8E', center: { lat: 25.1183, lng: 55.2002 },
    desc: 'אזור Al Barsha סביב Mall of Emirates — קניון ענק עם Ski Dubai, מלונות, מסעדות ותחנת מטרו.',
    spokes: [
      { name: 'Mall of Emirates', lat: 25.1183, lng: 55.2002 },
      { name: 'Ski Dubai (בקניון)', lat: 25.1175, lng: 55.1986 },
      { name: 'Mall of Emirates Metro', lat: 25.1184, lng: 55.2050 },
      { name: 'Sheraton Mall of Emirates', lat: 25.1160, lng: 55.2030 },
      { name: 'Holiday Inn Al Barsha', lat: 25.1102, lng: 55.1980 },
      { name: 'Pullman Dubai Mall of Emirates', lat: 25.1196, lng: 55.2010 },
    ],
  },
];
