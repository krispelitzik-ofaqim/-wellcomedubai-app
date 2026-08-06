export const RE_API = 'https://wellcomedubaicom-production.up.railway.app';

export type Article = { id: string; title: string; body: string; icon: string; titleEn?: string; bodyEn?: string };
export const RE_ARTICLES: Article[] = [
  { id: 'a1', title: 'איך קונים דירה בדובאי כישראלי?', body: 'דובאי פתוחה לזרים בכל פרויקטי Freehold. תהליך הרכישה: בחירת נכס → חוזה הזמנה (~10%) → SPA → תשלום לפי שלבים → רישום ב-DLD (~4% מס). זמן: 30-90 יום. דרושים: דרכון בתוקף 6+ חודשים, אישור הכנסה.', icon: '🔑', titleEn: 'How do you buy an apartment in Dubai as a foreigner?', bodyEn: 'Dubai is open to foreigners in all Freehold projects. The purchase process: choose a property → reservation contract (~10%) → SPA → staged payments → registration at the DLD (~4% tax). Time: 30-90 days. Required: a passport valid for 6+ months, proof of income.' },
  { id: 'a2', title: 'איזה אזורים פופולריים להשקעה?', body: 'Dubai Marina (~7-9% תשואה), Downtown (~5-7%), JVC (~9-11%), Business Bay (~6-8%), Damac Hills 2 (~10-12%), Palm Jumeirah (~5-7%). מחירים: AED 700K-מיליונים.', icon: '📍', titleEn: 'Which areas are popular for investment?', bodyEn: 'Dubai Marina (~7-9% yield), Downtown (~5-7%), JVC (~9-11%), Business Bay (~6-8%), Damac Hills 2 (~10-12%), Palm Jumeirah (~5-7%). Prices: AED 700K to millions.' },
  { id: 'a3', title: 'מסים, עלויות ותשואות', body: 'אין מס הכנסה אישי. מס רכישה: 4% (DLD) + עמלות סוכן (2%) + שכ"ט עו"ד (~1%). תשואה ברוטו: 8-10%. ויזת משקיע: AED 750K (2 שנים), Golden Visa: AED 2M (10 שנים).', icon: '📊', titleEn: 'Taxes, costs and yields', bodyEn: 'No personal income tax. Purchase tax: 4% (DLD) + agent fees (2%) + lawyer fees (~1%). Gross yield: 8-10%. Investor visa: AED 750K (2 years), Golden Visa: AED 2M (10 years).' },
  { id: 'a4', title: 'מימון: משכנתא לזרים', body: 'בנקים בדובאי מציעים משכנתא לזרים — עד 50-60% מערך הנכס. ריבית: ~4-5.5%. דרישות: דרכון, אישור הכנסה $5K+, היסטוריית אשראי. בנקים: Emirates NBD, ADCB, Mashreq, FAB.', icon: '💰', titleEn: 'Financing: mortgages for foreigners', bodyEn: 'Dubai banks offer mortgages to foreigners — up to 50-60% of the property value. Interest: ~4-5.5%. Requirements: passport, proof of income $5K+, credit history. Banks: Emirates NBD, ADCB, Mashreq, FAB.' },
  { id: 'a5', title: 'Off-Plan vs נכס מוכן', body: 'Off-Plan: מחיר נמוך, תוכנית תשלומים נוחה (10-30% במהלך הבנייה), פוטנציאל עלייה. סיכון: עיכובים. נכס מוכן: כניסה מיידית להשכרה, ללא הפתעות.', icon: '🏗️', titleEn: 'Off-Plan vs a ready property', bodyEn: 'Off-Plan: lower price, a convenient payment plan (10-30% during construction), appreciation potential. Risk: delays. Ready property: immediate rental income, no surprises.' },
];

export type Investment = { area: string; lat: number; lng: number; entry: string; yield: string; highlight: string; highlightEn?: string };
export const RE_INVESTMENTS: Investment[] = [
  { area: 'JVC (Jumeirah Village Circle)', lat: 25.0541, lng: 55.2050, entry: 'AED 700K', yield: '9-11%', highlight: 'כניסה זולה, ביקוש שכירות גבוה, תשתיות חדשות', highlightEn: 'Low entry, high rental demand, new infrastructure' },
  { area: 'Damac Hills 2',                 lat: 25.0241, lng: 55.2752, entry: 'AED 800K', yield: '10-12%', highlight: 'פרויקטים חדשים, כביש סלייק, מחירים עולים', highlightEn: 'New projects, the Sela road, rising prices' },
  { area: 'Business Bay',                  lat: 25.1830, lng: 55.2659, entry: 'AED 1.5M', yield: '6-8%', highlight: 'מודרני, צמוד Downtown, ביקוש משכירים עסקיים', highlightEn: 'Modern, adjacent to Downtown, business-tenant demand' },
  { area: 'Dubai Marina',                  lat: 25.0820, lng: 55.1410, entry: 'AED 1.2M', yield: '7-9%', highlight: 'אטרקטיבי לתיירים, נוף לים, אטמוספירה תוססת', highlightEn: 'Attractive to tourists, sea views, a lively atmosphere' },
  { area: 'Palm Jumeirah',                 lat: 25.1124, lng: 55.1390, entry: 'AED 2.5M', yield: '5-7%', highlight: 'יוקרתי, עלייה הונית, ביקוש קבוע', highlightEn: 'Luxury, capital appreciation, steady demand' },
  { area: 'Dubai Hills',                   lat: 25.1078, lng: 55.2480, entry: 'AED 1.8M', yield: '6-8%', highlight: 'משפחות, בתי ספר, קרבה לקניון Hills', highlightEn: 'Families, schools, close to Hills Mall' },
];

export type Broker = { id: string; name: string; company: string; phone: string; whatsapp: string; specialty: string; email: string; years: string; image: string; langs: string[] };
export const RE_BROKERS: Broker[] = [
  { id: 'b1', name: 'גלית שמש',    company: 'Allsopp & Allsopp',    langs: ['עברית','אנגלית','ערבית'], phone: '+971-50-100-2233', whatsapp: '971501002233', specialty: 'Marina, JBR, JLT',        email: 'galit@allsopp.ae',    years: '8 שנים',  image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80' },
  { id: 'b2', name: 'אבי כהן',     company: 'Better Homes',         langs: ['עברית','אנגלית'],         phone: '+971-55-222-3344', whatsapp: '971552223344', specialty: 'Downtown, Business Bay', email: 'avi@betterhomes.ae',  years: '6 שנים',  image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80' },
  { id: 'b3', name: 'מיכאל רובין', company: 'Engel & Völkers',     langs: ['עברית','אנגלית','רוסית'], phone: '+971-52-333-4455', whatsapp: '971523334455', specialty: 'Palm, Emirates Hills, יוקרה', email: 'michael@ev-dubai.ae', years: '12 שנים', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
  { id: 'b4', name: 'שרה לוי',     company: 'Driven Properties',    langs: ['עברית','אנגלית'],         phone: '+971-58-444-5566', whatsapp: '971584445566', specialty: 'JVC, Damac Hills',       email: 'sarah@drivenproperties.ae', years: '5 שנים',  image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80' },
];

export const ISRAELI_TO_UAE: Record<string, number> = { '2021': 200000, '2022': 450000, '2023': 600000, '2024': 650000, '2025': 700000 };
