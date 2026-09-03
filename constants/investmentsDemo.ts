// Sample listings for the investments board. They live only in the app — there is
// no server record behind them — so the detail screen renders them from here and
// makes every action say so rather than opening a dead link.
export type Opp = {
  id: string; title: string; promoter: string; kind: string; area?: string;
  minAmount: string; currency: string; yieldPct?: string; horizon?: string;
  desc?: string; photos?: string[]; video?: string | null; brochure?: string | null;
  featured?: boolean; demo?: boolean; createdAt?: string;
  website?: string; facebook?: string; instagram?: string; whatsapp?: string;
};

export const DEMO_INVESTMENTS: Opp[] = [
  {
    id: 'd1', title: 'Marina Heights · Off-Plan', promoter: 'Emaar', kind: 'realestate', area: 'Dubai Marina',
    minAmount: '750,000', currency: 'AED', yieldPct: '8', horizon: '3-5', demo: true, featured: true,
    createdAt: '2026-08-20T09:00:00.000Z',
    desc: 'פרויקט מגורים אול-פלאן במרינה — 240 יחידות עם נוף לים ומרפסות רחבות. תוכנית תשלומים: 20% בחתימה, 40% במהלך הבנייה, 40% במסירה. מסירה צפויה Q4 2027. היזם מציע ניהול השכרה מלא, כולל איתור דיירים וגבייה, בעמלה של 5% מדמי השכירות.',
    photos: [
      'https://wellcomedubai.com/images/Yizhak/investments-hero.jpg',
      'https://wellcomedubai.com/images/wellcomedubai.stamp/skyscrapers-looking-up-sky-modern-metropolis-modern-city.jpg',
      'https://wellcomedubai.com/images/Yizhak/portrait-woman-visiting-luxurious-city-dubai.jpg',
    ],
    whatsapp: '+971500000000', facebook: 'facebook.com/example', instagram: '@example', website: 'www.example.com',
  },
  {
    id: 'd2', title: 'JVC Rental Portfolio', promoter: 'Damac', kind: 'realestate', area: 'JVC',
    minAmount: '700,000', currency: 'AED', yieldPct: '10', horizon: '2-4', demo: true,
    createdAt: '2026-08-18T09:00:00.000Z',
    desc: 'תיק דירות להשכרה באזור עם ביקוש שכירות גבוה ותשתיות חדשות.',
  },
  {
    id: 'd3', title: 'Free Zone Company Setup', promoter: 'WellCome Dubai', kind: 'business', area: 'DMCC',
    minAmount: '35,000', currency: 'AED', horizon: '1', demo: true,
    createdAt: '2026-08-15T09:00:00.000Z',
    desc: 'הקמת חברה באזור סחר חופשי, כולל רישיון, ויזה וחשבון בנק.',
  },
];
