import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ImageBackground, Image, useWindowDimensions, Linking, Animated } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useI18n } from '../../constants/i18n';
import { toggleFavorite, isFavorite } from '../../utils/favorites';
import { tcRu } from '../../constants/contentRu';
import { tcHi } from '../../constants/contentHi';
import { tcAr } from '../../constants/contentAr';

function FavoriteHeart({ cat, id }: { cat: string; id: any }) {
  const [fav, setFav] = useState(false);
  useEffect(() => { isFavorite(cat, id).then(setFav); }, [cat, id]);
  return (
    <TouchableOpacity onPress={async (e) => { (e as any).stopPropagation?.(); const next = await toggleFavorite(cat, id); setFav(next); }} style={{ position: 'absolute', top: 6, right: 6, width: 32, height: 32, alignItems: 'center', justifyContent: 'center', zIndex: 5 }}>
      <FontAwesome5 name="heart" solid={fav} size={20} color="#E76F51" style={{ textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }} />
    </TouchableOpacity>
  );
}
import { CATALOG } from '../../data/catalog';
import GALLERY from '../../data/gallery.json';
import HOTEL_PHOTOS from '../../data/hotel-photos.json';
import ATTRACTION_PHOTOS from '../../data/attraction-photos.json';
import RESTAURANT_PHOTOS from '../../data/restaurant-places-photos.json';
import KIDS_PHOTOS from '../../data/kids-photos.json';
import NIGHTLIFE_PHOTOS from '../../data/nightlife-photos.json';
import SHOPPING_PHOTOS from '../../data/shopping-photos.json';
import TRANSPORT_PHOTOS from '../../data/transport-photos.json';
import CASINO_PHOTOS from '../../data/casino-photos.json';
import ABUDHABI_PHOTOS from '../../data/abudhabi-photos.json';
import { Confetti } from '../../components/Confetti';

const PHOTOS_BY_CAT: Record<string, any> = {
  hotels: HOTEL_PHOTOS, attractions: ATTRACTION_PHOTOS, restaurants: RESTAURANT_PHOTOS,
  kids: KIDS_PHOTOS, nightlife: NIGHTLIFE_PHOTOS, shopping: SHOPPING_PHOTOS,
  transport: TRANSPORT_PHOTOS, casino: CASINO_PHOTOS, abudhabi: ABUDHABI_PHOTOS,
};

const HERO_IMAGES = [
  'https://wellcomedubai.com/images/Yizhak/1.jpg',
  'https://wellcomedubai.com/images/Yizhak/2.jpg',
  'https://wellcomedubai.com/images/Yizhak/3.jpg',
  'https://wellcomedubai.com/images/Yizhak/4.jpg',
  'https://wellcomedubai.com/images/Yizhak/5.jpg',
];

const CAT_BIG = [
  { id: 'hotels', label: 'מלונות', labelEn: 'Hotels', color: '#E76F51' },
  { id: 'restaurants', label: 'מסעדות', labelEn: 'Restaurants', color: '#fff' },
  { id: 'attractions', label: 'אטרקציות', labelEn: 'Attractions', color: '#2A9D8F' },
];
const CAT_MED = [
  { id: 'nightlife', label: 'בילויים', labelEn: 'Nightlife', color: '#fff' },
  { id: 'kids', label: 'ילדים', labelEn: 'Kids', color: '#E76F51' },
  { id: 'casino', label: 'בידור ומשחקים', labelEn: 'Entertainment & Gaming', color: '#F4A261' },
];
const CAT_SM = [
  { id: 'shopping', label: 'קניות', labelEn: 'Shopping', color: '#F4A261' },
];

const QUICK_TOOLS = [
  { id: 'flights',  label: 'לוח טיסות',  labelEn: 'Flight Board', desc: 'TLV ↔ DXB',     descEn: 'TLV ↔ DXB',       icon: '✈️', color: '#1A6B8A', bg: '#D6E5EC', img: 'https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg' },
  { id: 'weather',  label: 'מזג אוויר',   labelEn: 'Weather',      desc: 'תחזית בדובאי',  descEn: 'Dubai Forecast',  icon: '☀️', color: '#F4A261', bg: '#FCE6D2', img: 'https://wellcomedubai.com/images/Yizhak/dubai-skyline-evening.jpg' },
  { id: 'currency', label: 'שער שקל',     labelEn: 'Shekel Rate',  desc: '₪ ↔ AED',       descEn: '₪ ↔ AED',         icon: '💰', color: '#2A9D8F', bg: '#D5EBE7', img: 'https://wellcomedubai.com/images/Yizhak/economy-uae-currency.jpg' },
];

// Crisp white FontAwesome icons for the flight/weather/currency badges (emoji were too faint).
const QT_ICON: Record<string, string> = { flights: 'plane', weather: 'sun', currency: 'coins' };

const LEARN_TILES = [
  { id: 'welcome',    title: 'ברוכים הבאים',    titleEn: 'Welcome',          img: 'https://wellcomedubai.com/images/Yizhak/portrait-woman-visiting-luxurious-city-dubai.jpg' },
  { id: 'about-app',  title: 'על האפליקציה',   titleEn: 'About the App',    img: 'https://wellcomedubai.com/images/icon-new.jpg', highlight: true },
  { id: 'itineraries', title: 'מסלולים מוכנים', titleEn: 'Ready Itineraries', img: 'https://wellcomedubai.com/images/Yizhak/dubai-skyline-evening.jpg', highlight: true, route: '/itineraries' },
  { id: 'coupons', title: 'עד 15% הנחה במסעדות', titleEn: 'Up to 15% off dining', img: 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg', highlight: true, route: '/coupons' },
  { id: 'investments', title: 'השקעות בדובאי', titleEn: 'Investing in Dubai', img: 'https://wellcomedubai.com/images/Yizhak/investments-hero.jpg', highlight: true, route: '/investments' },
  { id: 'why-us',     title: 'כרטיסים', titleEn: 'Tickets', img: require('../../assets/tickets-tile.jpg'), highlight: true },
  { id: 'tips',       title: 'טיפים',           titleEn: 'Tips',             img: 'https://wellcomedubai.com/images/Yizhak/dubai-mall-dubai-uae.jpg' },
  { id: 'history',    title: 'היסטוריה כללית',  titleEn: 'General History',  img: 'https://wellcomedubai.com/images/Yizhak/archs-shekh-zayed-grand-mosque-reflect-water-before-it.jpg' },
  { id: 'israelis',   title: 'ישראלים בדובאי',  titleEn: 'Israelis in Dubai', img: 'https://wellcomedubai.com/images/Yizhak/israelis-flags-il-uae.jpg' },
  { id: 'economy',    title: 'כלכלה מקומית',    titleEn: 'Local Economy',    img: 'https://wellcomedubai.com/images/Yizhak/economy-uae-currency.jpg' },
  { id: 'tourism',    title: 'תיירות בדובאי',   titleEn: 'Tourism in Dubai', img: 'https://wellcomedubai.com/images/Yizhak/tourism-family-dubai.jpg' },
  { id: 'vocabulary', title: 'אוצר מילים בסיסי', titleEn: 'Basic Vocabulary', img: 'https://wellcomedubai.com/images/Yizhak/vocabulary-translate.jpg' },
  { id: 'events',     title: 'יומן אירועים', titleEn: 'Events Calendar', img: require('../../assets/events-calendar.png'), isEvents: true, highlight: true },
  { id: 'emergency',  title: 'חירום', titleEn: 'Emergency', img: require('../../assets/emergency.jpg'), highlight: true },
];

// Marketplace services — each becomes a full swipeable banner in the home slider (mirrors app/market.tsx).
const MARKET_SERVICES = [
  { key: 'cover', color: '#E9C46A', route: '/market', img: 'https://wellcomedubai.com/images/Yizhak/market-souk-banner.jpg', cover: true },
  { key: 'tickets', color: '#E76F51', route: '/tickets', img: 'https://wellcomedubai.com/images/Yizhak/dubai-mall-dubai-uae.jpg' },
  { key: 'adTickets', color: '#B85C8E', route: '/tickets?cat=abudhabi', img: 'https://wellcomedubai.com/images/Yizhak/archs-shekh-zayed-grand-mosque-reflect-water-before-it.jpg' },
  { key: 'tours', color: '#2A9D8F', route: '/tours', img: 'https://wellcomedubai.com/images/Yizhak/tourism-family-dubai.jpg' },
  { key: 'events', color: '#7B4FA0', route: 'https://www.getyourguide.com/s/?q=Dubai%20events%20shows&partner_id=PE2GLSE3MAO4YDEIXLNOYXMC67BCZ32C', img: 'https://wellcomedubai.com/images/Yizhak/2.jpg' },
  { key: 'transfers', color: '#5B9DC7', route: 'https://www.getyourguide.com/s/?q=Dubai%20private%20airport%20transfer%20car&partner_id=PE2GLSE3MAO4YDEIXLNOYXMC67BCZ32C', img: 'https://wellcomedubai.com/images/Yizhak/3.jpg' },
  { key: 'lounge', color: '#9C6B3F', route: 'https://www.getyourguide.com/s/?q=Dubai%20airport%20lounge%20access&partner_id=PE2GLSE3MAO4YDEIXLNOYXMC67BCZ32C', img: 'https://wellcomedubai.com/images/Yizhak/dubai-skyline-evening.jpg' },
  { key: 'car', color: '#C1440E', route: 'https://klook.tpk.lv/8HSINbXI', img: 'https://wellcomedubai.com/images/Yizhak/4.jpg' },
  { key: 'esim', color: '#3AA0A0', route: 'https://klook.tpk.lv/8HSINbXI', img: 'https://wellcomedubai.com/images/Yizhak/5.jpg' },
  { key: 'insurance', color: '#6B8E5A', route: 'https://klook.tpk.lv/8HSINbXI', img: 'https://wellcomedubai.com/images/Yizhak/dubai-skyline-evening.jpg' },
  { key: 'dining', color: '#C77C3B', route: 'https://www.getyourguide.com/s/?q=Dubai%20dining%20experience%20brunch%20dinner%20cruise&partner_id=PE2GLSE3MAO4YDEIXLNOYXMC67BCZ32C', img: 'https://wellcomedubai.com/images/Yizhak/tourism-family-dubai.jpg' },
  { key: 'coupons', color: '#F4A261', route: '/coupons', img: 'https://wellcomedubai.com/images/Yizhak/economy-uae-currency.jpg' },
];

function MarketBannerSlider() {
  const { t, isRTL } = useI18n();
  const [w, setW] = useState(0);
  const cover = MARKET_SERVICES[0];
  return (
    <View onLayout={e => setW(e.nativeEvent.layout.width)}>
      <TouchableOpacity activeOpacity={0.92} onPress={() => router.push('/market')} style={[s.mktBanner, { width: w || 380 }]}>
        <ImageBackground source={{ uri: cover.img }} resizeMode="cover" style={{ flex: 1 }}>
          <View style={[s.bannerAccent, { backgroundColor: '#E9C46A' }]} />
          <View style={s.mktOverlay}>
            <Text style={s.mktKicker}>MARKETPLACE · DUBAI</Text>
            <Text style={[s.reTitle, { textAlign: 'center', writingDirection: isRTL ? 'rtl' : 'ltr' }]}>{t('market.bannerTitle')}</Text>
            <Text style={[s.reSub, { textAlign: 'center', writingDirection: isRTL ? 'rtl' : 'ltr' }]}>{t('market.bannerSub')}</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
}
const msl = StyleSheet.create({
  arrow: { position: 'absolute', top: 44, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  arrowTxt: { fontSize: 40, color: '#fff', fontWeight: '300', marginTop: -6, textShadowColor: 'rgba(0,0,0,0.55)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 5 },
  dots: { position: 'absolute', bottom: 7, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 4 },
  dot: { height: 6, borderRadius: 3, backgroundColor: '#fff' },
});

// Real-estate portal — 4 swipeable banners (mirrors app/realestate.tsx tabs).
const RE_SCREENS = [
  { key: 'cover', color: '#3FB8A5', route: '/realestate', cover: true, img: 'https://wellcomedubai.com/images/wellcomedubai.stamp/skyscrapers-looking-up-sky-modern-metropolis-modern-city.jpg', title: { he: 'פורטל הנדל״ן והעסקים של דובאי', en: 'Dubai Real Estate & Business Portal', ru: 'Портал недвижимости и бизнеса Дубая', ar: 'بوابة العقارات والأعمال في دبي', hi: 'दुबई रियल एस्टेट और व्यापार पोर्टल' } },
  { key: 'sale', color: '#1A6B8A', route: '/realestate?tab=sale', img: 'https://wellcomedubai.com/images/wellcomedubai.stamp/skyscrapers-looking-up-sky-modern-metropolis-modern-city.jpg', title: { he: 'דירות למכירה', en: 'Apartments For Sale', ru: 'Квартиры на продажу', ar: 'شقق للبيع', hi: 'बिक्री के लिए अपार्टमेंट' } },
  { key: 'rent', color: '#2C5F6E', route: '/realestate?tab=rent', img: 'https://wellcomedubai.com/images/Yizhak/portrait-woman-visiting-luxurious-city-dubai.jpg', title: { he: 'דירות להשכרה', en: 'Apartments For Rent', ru: 'Квартиры в аренду', ar: 'شقق للإيجار', hi: 'किराये के लिए अपार्टमेंट' } },
  { key: 'invest', color: '#3FB8A5', route: '/realestate?tab=invest', img: 'https://wellcomedubai.com/images/Yizhak/economy-uae-currency.jpg', title: { he: 'פורטל הנדל"ן', en: 'Real Estate Portal', ru: 'Портал недвижимости', ar: 'بوابة العقارات', hi: 'रियल एस्टेट पोर्टल' } },
  { key: 'business', color: '#E9C46A', route: '/realestate?tab=business', img: 'https://wellcomedubai.com/images/Yizhak/dubai-skyline-evening.jpg', title: { he: 'פורטל העסקים', en: 'Business Portal', ru: 'Бизнес-портал', ar: 'بوابة الأعمال', hi: 'व्यापार पोर्टल' } },
];

function RealEstateBannerSlider() {
  const { t, lang, isRTL } = useI18n();
  const [w, setW] = useState(0);
  const cover = RE_SCREENS[0];
  return (
    <View style={{ marginTop: 22 }} onLayout={e => setW(e.nativeEvent.layout.width)}>
      <TouchableOpacity activeOpacity={0.92} onPress={() => router.push('/realestate')} style={[s.reBanner, { width: w || 380, marginTop: 0 }]}>
        <ImageBackground source={{ uri: cover.img }} resizeMode="cover" style={{ flex: 1 }}>
          <View style={[s.bannerAccent, { backgroundColor: cover.color }]} />
          <View style={s.reOverlay}>
            <Text style={[s.reKicker, { color: '#7FE0D0' }]}>DUBAI REAL ESTATE</Text>
            <Text style={[s.reTitle, { textAlign: 'center', writingDirection: isRTL ? 'rtl' : 'ltr' }]}>{(cover.title as any)[lang] || cover.title.en}</Text>
            <Text style={[s.reSub, { textAlign: 'center', writingDirection: isRTL ? 'rtl' : 'ltr' }]}>{t('home.reSub')}</Text>
          </View>
        </ImageBackground>
      </TouchableOpacity>
    </View>
  );
}

function AnimatedTitle({ fontSize, part1, part2, isRTL }: { fontSize: number; part1: string; part2: string; isRTL: boolean }) {
  const letters = [
    ...part1.split('').map(c => ({ c, finalColor: '#FF7A5C' })),
    ...part2.split('').map(c => ({ c, finalColor: '#F4B740' })),
  ];
  const opacities = useRef(letters.map(() => new Animated.Value(0))).current;
  const colorMix = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const fadeIns = opacities.map((op, i) =>
      Animated.timing(op, { toValue: 1, duration: 300, delay: 1600 + i * 100, useNativeDriver: true })
    );
    Animated.parallel(fadeIns).start();
    Animated.timing(colorMix, { toValue: 1, duration: 800, delay: 5000, useNativeDriver: false }).start();
  }, []);
  return (
    <Text style={[styles.heroTitle, { fontSize, writingDirection: isRTL ? 'rtl' : 'ltr' }]}>
      {letters.map((l, i) => {
        const color = colorMix.interpolate({ inputRange: [0, 1], outputRange: ['#FFFFFF', l.finalColor] });
        return (
          <Animated.Text key={i} style={{ color, opacity: opacities[i] }}>{l.c}</Animated.Text>
        );
      })}
    </Text>
  );
}

function AnimatedSubtitle({ fontSize, text, isRTL }: { fontSize: number; text: string; isRTL: boolean }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 800, delay: 5000, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.Text style={[styles.heroSub, { fontSize, opacity, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}>{text}</Animated.Text>
  );
}

const styles = StyleSheet.create({
  heroTitle: { fontWeight: '700', letterSpacing: 0, textAlign: 'center', writingDirection: 'rtl', textShadowColor: 'rgba(0,0,0,0.9)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 8 },
  heroSub: { color: 'rgba(255,255,255,0.95)', fontWeight: '400', textAlign: 'center', marginTop: 6, writingDirection: 'rtl', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
});

function pickDiverse(items: any[], n: number) {
  const seen = new Set<string>();
  const picked: any[] = [];
  for (const it of items) {
    const sub = it.subcategory || '__';
    if (seen.has(sub)) continue;
    seen.add(sub);
    picked.push(it);
    if (picked.length >= n) break;
  }
  if (picked.length < n) {
    for (const it of items) {
      if (picked.includes(it)) continue;
      picked.push(it);
      if (picked.length >= n) break;
    }
  }
  return picked;
}

function topItems(category: string, n = 6) {
  const arr = (CATALOG as any)[category] || [];
  const sorted = [...arr].sort((a: any, b: any) => (b.rating || 0) - (a.rating || 0));
  return pickDiverse(sorted, n);
}

function imgUrl(item: any, cat?: string) {
  const entry = cat ? PHOTOS_BY_CAT[cat]?.[String(item.id)] : null;
  const first = entry?.photos?.[0]?.name;
  if (first) return `https://places.googleapis.com/v1/${first}/media?key=AIzaSyDVYlYuM6saMxbhi2aKNCtiv6J8mR8LLgw&maxWidthPx=600`;
  const img = item.image || '';
  if (!img) return 'https://wellcomedubai.com/images/Yizhak/dubai-skyline-evening.jpg';
  if (img.startsWith('http')) return img;
  return 'https://wellcomedubai.com/' + img;
}

// Build a fallback chain: Google Places photo → catalog image → default. Places photos expire, so we fall through on error.
function imgChain(item: any, cat?: string): string[] {
  const out: string[] = [];
  const entry = cat ? PHOTOS_BY_CAT[cat]?.[String(item.id)] : null;
  const first = entry?.photos?.[0]?.name;
  if (first) out.push(`https://places.googleapis.com/v1/${first}/media?key=AIzaSyDVYlYuM6saMxbhi2aKNCtiv6J8mR8LLgw&maxWidthPx=600`);
  const img = item.image || '';
  if (img) out.push(img.startsWith('http') ? img : 'https://wellcomedubai.com/' + img);
  out.push('https://wellcomedubai.com/images/Yizhak/dubai-skyline-evening.jpg');
  return out;
}

function HomeImage({ item, cat, style }: { item: any; cat?: string; style: any }) {
  const chain = imgChain(item, cat);
  const [idx, setIdx] = useState(0);
  return <Image source={{ uri: chain[Math.min(idx, chain.length - 1)] }} style={style} onError={() => setIdx(i => (i < chain.length - 1 ? i + 1 : i))} />;
}

const LANGS: { code: string; label: string; short: string }[] = [
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'he', label: 'עברית', short: 'עב' },
  { code: 'ru', label: 'Русский', short: 'RU' },
  { code: 'hi', label: 'हिंदी', short: 'हिं' },
  { code: 'ar', label: 'العربية', short: 'ع' },
];

// Currency block shows the local currency of each language against the AED.
const CURRENCY_BY_LANG: Record<string, { label: string; desc: string }> = {
  he: { label: 'שער שקל',    desc: '₪ ↔ AED' },
  en: { label: 'Currency',   desc: '$ ↔ AED' },
  ru: { label: 'Курс валют', desc: '₽ ↔ AED' },
  hi: { label: 'मुद्रा दर',   desc: '₹ ↔ AED' },
  ar: { label: 'سعر الصرف',  desc: '﷼ ↔ AED' },
};

export default function Home() {
  const { t, lang, setLang, isRTL } = useI18n();
  const catT = (l: any) => { const v = t('cat.' + l.id); return v.startsWith('cat.') ? (lang === 'ar' ? tcAr(l.label) : lang === 'hi' ? tcHi(l.label) : lang === 'ru' ? tcRu(l.label) : lang === 'he' ? l.label : (l.labelEn || l.label)) : v; };
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [viewH, setViewH] = useState(0);
  // Stretch the hero to the real scroll-area height (measured), so it fills the
  // screen on every device instead of leaving a white gap at the bottom.
  const heroHeight = viewH > 0 ? viewH : height - insets.top - insets.bottom - 28;
  const [moreOpen, setMoreOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const scrollRef = useRef<ScrollView | null>(null);
  const [heroIdx, setHeroIdx] = useState(0);
  // Scale fonts based on width — 390px (iPhone 12) is baseline 1.0; tablets get larger
  const scale = Math.min(1.5, Math.max(0.85, width / 390));
  const f = (n: number) => Math.round(n * scale);
  const cardW = Math.round(260 * scale);
  const tileW = Math.round(120 * scale);
  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#000' }} />
      <ScrollView ref={scrollRef} style={{ flex: 1 }} onLayout={(e) => { const h = e.nativeEvent.layout.height; if (h > 0 && Math.abs(h - viewH) > 1) setViewH(h); }} contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false} onScroll={(e) => setShowTop(e.nativeEvent.contentOffset.y > height)} scrollEventThrottle={200}>
        {/* Hero */}
        <SafeAreaView edges={[]} style={{ backgroundColor: Colors.PRIMARY }}>
          <ImageBackground source={{ uri: HERO_IMAGES[heroIdx] }} style={[s.hero, { height: heroHeight }]}>
            <LinearGradient colors={['transparent', 'rgba(0,0,0,0.78)']} locations={[0.32, 1]} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, top: 0 }} pointerEvents="none" />
            <View style={s.heroOverlay}>
              {/* Language toggle (collapsed to one + arrow) */}
              <View style={[s.langWrap, { top: insets.top + 6 }]}>
                <TouchableOpacity style={s.langBtn} activeOpacity={0.8} onPress={() => setLangOpen((o) => !o)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Text style={[s.langTxt, s.langOn]}>{(LANGS.find((l) => l.code === lang) || LANGS[0]).short}</Text>
                  <Text style={s.langArrow}>{langOpen ? '▴' : '▾'}</Text>
                </TouchableOpacity>
                {langOpen && (
                  <View style={s.langMenu}>
                    {LANGS.map((l) => (
                      <TouchableOpacity key={l.code} style={s.langItem} activeOpacity={0.7} onPress={() => { setLang(l.code as any); setLangOpen(false); }}>
                        <Text style={[s.langItemTxt, lang === l.code && s.langOn]}>{l.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
              {/* Center: title (no block) */}
              <View style={[s.heroTop, { marginTop: insets.top + 46 }]}>
                <AnimatedTitle key={'t-' + lang} fontSize={f(lang === 'ru' ? 21 : 26)} part1={t('home.welcomeTo')} part2={t('home.dubai')} isRTL={isRTL} />

                <AnimatedSubtitle key={'s-' + lang} fontSize={f(15)} text={t('home.subtitle')} isRTL={isRTL} />

              </View>
              {/* Bottom: category links + near me */}
              <View style={s.heroBottom}>
                <View style={s.linkRowBig}>
                  {CAT_BIG.map(l => (
                    <TouchableOpacity key={l.id} onPress={() => router.push(`/category/${l.id}` as any)}>
                      <Text numberOfLines={1} style={[s.linkBig, { color: l.color, fontSize: f(lang === 'ru' ? 15 : 21) }]}>{catT(l)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={[s.linkRowMed, { gap: 9 }]}>
                  {CAT_MED.map(l => (
                    <TouchableOpacity key={l.id} onPress={() => router.push(`/category/${l.id}` as any)}>
                      <Text numberOfLines={1} style={[s.linkMed, { color: l.color, fontSize: f(lang === 'ru' ? 14 : 19) }]}>{catT(l)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={[s.linkRowMed, { gap: 11 }]}>
                  {CAT_SM.map(l => (
                    <TouchableOpacity key={l.id} onPress={() => router.push(`/category/${l.id}` as any)}>
                      <Text numberOfLines={1} style={[s.linkMed, { color: l.color, fontSize: f(lang === 'ru' ? 13 : 18) }]}>{catT(l)}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity onPress={() => router.push('/itineraries' as any)}>
                    <Text numberOfLines={1} style={[s.linkMed, { color: Colors.SECONDARY, fontSize: f(lang === 'ru' ? 13 : 18) }]}>{t('home.itineraries')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => router.push('/category/transport' as any)}>
                    <Text numberOfLines={1} style={[s.linkMed, { color: '#fff', fontSize: f(lang === 'ru' ? 13 : 18) }]}>{t('home.transport')}</Text>
                  </TouchableOpacity>
                </View>
                <View style={s.nearMeRow}>
                  <TouchableOpacity onPress={() => router.push('/near' as any)}>
                    <Text style={[s.nearMe, { fontSize: f(13) }]}>{t('home.nearMe')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ImageBackground>
        </SafeAreaView>

        {/* Top sections — main 3 */}
        {(['hotels','attractions','restaurants'] as const).map(cat => {
          const items = topItems(cat, 6);
          if (!items.length) return null;
          const titleMap: Record<string,string> = { hotels:t('home.topHotels'), attractions:t('home.mustAttractions'), restaurants:t('home.restaurants') };
          const colorMap: Record<string,string> = { hotels:'#B8923A', attractions:'#2A9D8F', restaurants:'#F4A261' };
          return (
            <View key={cat} style={{ marginTop: 18 }}>
              <View style={[s.sectionHead, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[s.sectionTitle, { color: colorMap[cat], writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}>{titleMap[cat]}</Text>
                <TouchableOpacity onPress={() => router.push(`/category/${cat}` as any)}>
                  <Text style={s.seeAll}>{t('home.seeAll')}</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, gap: 10 }}>
                {items.map((it: any) => (
                  <TouchableOpacity key={it.id} activeOpacity={0.85} onPress={() => router.push(`/item/${it.id}?cat=${cat}` as any)} style={[s.card, { width: cardW }]}>
                    <View style={{ position: 'relative' }}>
                      <HomeImage item={it} cat={cat} style={s.cardImg} />
                      {it.kosher ? <View style={s.kosherBadge}><Text style={s.kosherText}>{t('home.kosher')}</Text></View> : null}
                      {(() => {
                        const isHe = /[֐-׿]/.test(it.name || '');
                        const heName = it.nameHe || (isHe ? it.name : '');
                        const enName = it.nameEn || (!isHe ? it.name : '');
                        const dispName = lang === 'he' ? heName : (enName || heName);
                        const dispRTL = /[֐-׿؀-ۿ]/.test(dispName || '');
                        return dispName ? (
                          <Text numberOfLines={1} style={{ position: 'absolute', bottom: 10, right: 12, color: '#fff', fontWeight: '500', fontSize: 17, letterSpacing: 0.2, maxWidth: '90%', writingDirection: dispRTL ? 'rtl' : 'ltr', textAlign: 'right', textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 5 }}>{dispName}</Text>
                        ) : null;
                      })()}
                      <FavoriteHeart cat={cat} id={it.id} />
                    </View>
                    <View style={s.cardBody}>
                      <Text numberOfLines={2} style={s.cardName}>{it.name}</Text>
                      <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 4 }}>
                        {it.rating ? <Text style={s.cardRating}>⭐ {it.rating}</Text> : <Text style={s.cardRating}> </Text>}
                        {it.price ? <Text style={s.cardPrice}>{it.price}</Text> : null}
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          );
        })}

        {/* Learn tiles */}
        <View style={[s.sectionHead, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={[s.sectionTitle, { color: Colors.SECONDARY, fontSize: 20, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}>{t('home.learnDubai')}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}>
          {/* AI assistant cube — first item, Dubai colors */}
          <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/ai' as any)} key="ai-tile">
            <View style={[s.aiTile, { width: tileW, height: tileW }]}>
              <LinearGradient colors={['#0C5A6B', '#1AA0B0', '#E9C46A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[StyleSheet.absoluteFill, { borderRadius: 10 }]} />
              <View style={s.aiTileTop}><Image source={require('../../assets/ai-logo.png')} style={s.aiTileLogo} resizeMode="contain" /></View>
              <View style={s.learnOverlay}>
                <Text style={[s.learnText, { writingDirection: isRTL ? 'rtl' : 'ltr' }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{({ he: 'מסייע AI', en: 'Dubai AI', ru: 'AI-помощник', hi: 'AI सहायक', ar: 'مساعد AI' } as any)[lang] || 'Dubai AI'}</Text>
              </View>
            </View>
          </TouchableOpacity>
          {LEARN_TILES.filter(tile => tile.id !== 'israelis' || lang === 'he').map(tile => {
            const label = tile.id === 'itineraries' ? t('home.itineraries')
              : tile.id === 'coupons' ? (({ he: 'עד 15% הנחה במסעדות', en: 'Up to 15% off dining', ru: 'До 15% скидки в ресторанах', ar: 'خصم حتى 15% في المطاعم', hi: 'रेस्तराँ में 15% तक छूट' } as any)[lang] || 'Up to 15% off dining')
              : tile.id === 'investments' ? t('inv.title')
              : t('learn.' + tile.id);
            return (
            <TouchableOpacity key={tile.id} activeOpacity={0.85} onPress={() => (tile as any).route ? router.push((tile as any).route) : tile.isEvents ? router.push('/events' as any) : tile.id === 'why-us' ? router.push('/tickets' as any) : router.push(`/learn/${tile.id}` as any)}>
              <ImageBackground source={typeof tile.img === 'string' ? { uri: tile.img } : tile.img} style={[s.learnTile, { width: tileW, height: tileW }, tile.id === 'about-app' ? { overflow: 'hidden', borderTopLeftRadius: 10, borderTopRightRadius: 10 } : null]} imageStyle={tile.id === 'about-app' ? { borderTopLeftRadius: 10, borderTopRightRadius: 10 } : { borderRadius: 10 }}>
                <View style={s.learnOverlay}>
                  <Text style={[s.learnText, { writingDirection: isRTL ? 'rtl' : 'ltr' }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{label.startsWith('learn.') ? (lang === 'ar' ? tcAr(tile.title) : lang === 'hi' ? tcHi(tile.title) : lang === 'ru' ? tcRu(tile.title) : lang === 'he' ? tile.title : ((tile as any).titleEn || tile.title)) : label}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* More categories — collapsible */}
        <TouchableOpacity onPress={() => setMoreOpen(o => !o)} style={s.moreToggle}>
          <Text style={s.moreToggleText}>{t('home.moreCategories')}</Text>
          <Text style={s.moreToggleArrow}>{moreOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {moreOpen && (
          <View>
            {(['shopping','nightlife','kids'] as const).map(cat => {
              const items = topItems(cat, 6);
              if (!items.length) return null;
              const titleMap: Record<string,string> = { shopping:t('cat.shopping'), nightlife:t('cat.nightlife'), kids:t('home.kidsFamilies') };
              const colorMap: Record<string,string> = { shopping:'#F4A261', nightlife:'#B85C8E', kids:'#E76F51' };
              return (
                <View key={cat} style={{ marginTop: 14 }}>
                  <View style={[s.sectionHead, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <Text style={[s.sectionTitle, { color: colorMap[cat], fontSize: 20, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}>{titleMap[cat]}</Text>
                    <TouchableOpacity onPress={() => router.push(`/category/${cat}` as any)}>
                      <Text style={s.seeAll}>{t('home.seeAll')}</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, gap: 10 }}>
                    {items.map((it: any) => (
                      <TouchableOpacity key={it.id} activeOpacity={0.85} onPress={() => router.push(`/item/${it.id}?cat=${cat}` as any)} style={[s.card, { width: 140 }]}>
                        <View style={{ position: 'relative' }}>
                          <HomeImage item={it} cat={cat} style={[s.cardImg, { height: 90 }]} />
                          {(() => {
                            const isHe = /[֐-׿]/.test(it.name || '');
                            const heName = it.nameHe || (isHe ? it.name : '');
                            const enName = it.nameEn || (!isHe ? it.name : '');
                            const dispName = lang === 'he' ? heName : (enName || heName);
                            const dispRTL = /[֐-׿؀-ۿ]/.test(dispName || '');
                            return dispName ? (
                              <Text numberOfLines={1} style={{ position: 'absolute', bottom: 6, right: 8, color: '#fff', fontWeight: '900', fontSize: 13, maxWidth: '90%', writingDirection: dispRTL ? 'rtl' : 'ltr', textAlign: 'right', textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 5 }}>{dispName}</Text>
                            ) : null;
                          })()}
                          <FavoriteHeart cat={cat} id={it.id} />
                        </View>
                        <View style={s.cardBody}>
                          <Text numberOfLines={2} style={[s.cardName, { fontSize: 12 }]}>{it.name}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              );
            })}
          </View>
        )}

        {/* RE Banner — swipeable slider: branded cover first, then portal tabs */}
        <RealEstateBannerSlider />

        {/* Marketplace — swipeable banner slider, one per service */}
        <MarketBannerSlider />

        {/* Quick Tools — image header + colored stripe + label/desc */}
        <View style={s.qtRow}>
          {QUICK_TOOLS.map(tool => {
            const lbl = t('cat.' + tool.id);
            const dsc = t('tool.' + tool.id + '.desc');
            return (
            <TouchableOpacity key={tool.id} activeOpacity={0.85} style={s.qtCard} onPress={() => router.push(`/tools/${tool.id}` as any)}>
              <View style={s.qtImgWrap}>
                <Image source={{ uri: tool.img }} style={s.qtImg} />
                <View style={s.qtIconBadge}><FontAwesome5 name={QT_ICON[tool.id] || 'star'} size={13} color="#fff" solid /></View>
              </View>
              <View style={[s.qtBody, { borderTopColor: tool.color, backgroundColor: (tool as any).bg ?? '#fff' }]}>
                <Text style={s.qtLabel}>{tool.id === 'currency' ? (CURRENCY_BY_LANG[lang] || CURRENCY_BY_LANG.en).label : (lbl.startsWith('cat.') ? (lang === 'ar' ? tcAr(tool.label) : lang === 'hi' ? tcHi(tool.label) : lang === 'ru' ? tcRu(tool.label) : lang === 'he' ? tool.label : ((tool as any).labelEn || tool.label)) : lbl)}</Text>
                <Text style={s.qtDesc}>{tool.id === 'currency' ? (CURRENCY_BY_LANG[lang] || CURRENCY_BY_LANG.en).desc : (dsc.startsWith('tool.') ? (lang === 'ar' ? tcAr(tool.desc) : lang === 'hi' ? tcHi(tool.desc) : lang === 'ru' ? tcRu(tool.desc) : lang === 'he' ? tool.desc : ((tool as any).descEn || tool.desc)) : dsc)}</Text>
              </View>
            </TouchableOpacity>
            );
          })}
        </View>

        {/* Gallery preview — collapsed by default, at bottom */}
        <TouchableOpacity onPress={() => setGalleryOpen(o => !o)} style={s.galleryToggle}>
          <Text style={s.galleryToggleText}>{t('home.gallery')} {galleryOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {galleryOpen && (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}>
              {(GALLERY as string[]).slice(0, 12).map((name, i) => (
                <TouchableOpacity key={i} onPress={() => router.push('/gallery' as any)}>
                  <Image source={{ uri: `https://wellcomedubai.com/images/wellcomedubai.stamp/${name}` }} style={{ width: 150, height: 150, borderRadius: 0 }} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => router.push('/gallery' as any)} style={{ alignItems: 'center', paddingVertical: 8 }}>
              <Text style={{ color: Colors.ACCENT, fontWeight: '700', fontSize: 12 }}>{t('home.fullView')}</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const topBtn = StyleSheet.create({
  btn: { position: 'absolute', bottom: 24, left: 16, width: 48, height: 48, borderRadius: 24, backgroundColor: '#E76F51', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 6 },
  txt: { color: '#fff', fontSize: 24, fontWeight: '900', lineHeight: 28 },
});

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  brandBar: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', alignItems: 'center' },
  brandTxt: { fontSize: 22, fontWeight: '900', letterSpacing: -0.3 },
  hero: { backgroundColor: Colors.PRIMARY },
  heroOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.15)', justifyContent: 'space-between', padding: 18 },
  langWrap: { position: 'absolute', top: 12, alignSelf: 'center', zIndex: 10, alignItems: 'center' },
  langBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(0,0,0,0.45)', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(255,255,255,0.35)' },
  langTxt: { color: 'rgba(255,255,255,0.65)', fontWeight: '800', fontSize: 13 },
  langArrow: { color: 'rgba(255,255,255,0.8)', fontSize: 10, marginTop: 1 },
  langOn: { color: '#F4A261' },
  langMenu: { marginTop: 6, backgroundColor: 'rgba(0,0,0,0.85)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)', paddingVertical: 4, minWidth: 120, overflow: 'hidden' },
  langItem: { paddingVertical: 9, paddingHorizontal: 16 },
  langItemTxt: { color: '#fff', fontWeight: '700', fontSize: 14, textAlign: 'center' },
  langSep: { color: 'rgba(255,255,255,0.4)', marginHorizontal: 6, fontSize: 12 },
  heroTop: { alignItems: 'center', marginTop: 24 },
  appIcon: { width: 72, height: 72, borderRadius: 18, borderWidth: 2, borderColor: Colors.GOLD, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  searchCorner: { position: 'absolute', top: 8, left: 8, zIndex: 5 },
  searchIconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' },
  heroPill: { paddingHorizontal: 20, paddingVertical: 14, backgroundColor: 'rgba(0,0,0,0.32)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  heroTitle: { color: '#fff', fontWeight: '900', letterSpacing: -0.5, textAlign: 'center', writingDirection: 'rtl', textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5 },
  heroSub: { color: 'rgba(255,255,255,0.95)', fontWeight: '600', textAlign: 'center', marginTop: 4, writingDirection: 'rtl', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  heroBottom: { paddingBottom: 30 },
  linkRowBig: { flexDirection: 'row-reverse', justifyContent: 'center', gap: 11, marginBottom: 6, flexWrap: 'wrap' },
  linkRowMed: { flexDirection: 'row-reverse', justifyContent: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' },
  linkBig: { fontSize: 18, fontWeight: '500', letterSpacing: 0.3, textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  linkMed: { fontSize: 13, fontWeight: '500', letterSpacing: 0.2, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  nearMeRow: { alignItems: 'center', marginTop: 6 },
  nearMe: { color: '#fff', fontSize: 14, fontWeight: '500', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  qtRow: { flexDirection: 'row-reverse', gap: 8, paddingHorizontal: 14, marginTop: 14 },
  qtCard: { flex: 1, borderRadius: 0, overflow: 'hidden', backgroundColor: '#fff' },
  qtImgWrap: { height: 100, position: 'relative' },
  qtImg: { width: '100%', height: '100%' },
  qtIconBadge: { position: 'absolute', top: 6, right: 6, width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(12,32,44,0.62)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.55)' },
  qtBody: { flex: 1, backgroundColor: '#fff', padding: 8, borderTopWidth: 3, alignItems: 'center', justifyContent: 'center' },
  qtLabel: { color: Colors.TEXT, fontSize: 14, fontWeight: '600', letterSpacing: 0.2, textAlign: 'center' },
  qtDesc: { color: Colors.MUTED, fontSize: 11, marginTop: 2, textAlign: 'center' },
  sectionHead: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, marginTop: 18, marginBottom: 8 },
  sectionTitle: { fontSize: 22, fontWeight: '600', letterSpacing: 0.2, writingDirection: 'rtl' },
  seeAll: { color: Colors.ACCENT, fontSize: 14, fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 0, overflow: 'hidden', borderBottomWidth: 1, borderBottomColor: '#EAE0CE' },
  cardImg: { width: '100%', height: 170 },
  cardBody: { padding: 14 },
  cardName: { fontSize: 18, fontWeight: '500', letterSpacing: 0.2, color: Colors.TEXT, writingDirection: 'rtl' },
  cardRating: { fontSize: 14, color: Colors.GOLD, fontWeight: '600' },
  cardPrice: { fontSize: 14, color: Colors.GOLD, fontWeight: '500' },
  kosherBadge: { position: 'absolute', bottom: 6, left: 6, backgroundColor: '#0E2A38', borderColor: Colors.GOLD, borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  plusBadge: { position: 'absolute', top: 6, right: 6, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  plusBadgeTxt: { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 30, textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  kosherText: { color: Colors.GOLD, fontSize: 9, fontWeight: '900' },
  learnTile: { borderRadius: 0, overflow: 'hidden', justifyContent: 'flex-end' },
  aiTile: { borderRadius: 0, overflow: 'hidden', justifyContent: 'flex-end' },
  aiTileTop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  aiTileEmoji: { fontSize: 68 },
  aiTileLogo: { width: 66, height: 86 },
  aiTileBar: { padding: 6, backgroundColor: 'rgba(0,0,0,0.55)' },
  aiTileBarLabel: { color: '#fff', fontSize: 12, fontWeight: '600', letterSpacing: 0.2, textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  learnOverlay: { padding: 6, backgroundColor: 'rgba(0,0,0,0.4)' },
  learnText: { color: '#fff', fontSize: 12, fontWeight: '600', letterSpacing: 0.2, textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3, writingDirection: 'rtl', textAlign: 'center' },
  galleryToggle: { alignItems: 'center', marginTop: 22, marginBottom: 6, paddingVertical: 6 },
  galleryToggleText: { color: Colors.TEXT, fontWeight: '600', fontSize: 20, letterSpacing: 0.2 },
  moreToggle: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, marginTop: 18 },
  moreToggleText: { color: Colors.ACCENT, fontWeight: '600', fontSize: 20, letterSpacing: 0.2 },
  moreToggleArrow: { color: Colors.ACCENT, fontSize: 13 },
  aiBanner: { marginTop: 8, marginBottom: 10, marginHorizontal: 14, borderRadius: 16, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8, shadowOffset: { width: 0, height: 3 }, elevation: 4 },
  aiBannerInner: { alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 16 },
  aiBannerIcon: { fontSize: 34 },
  aiBannerTitle: { color: '#fff', fontSize: 18, fontWeight: '800' },
  aiBannerSub: { color: 'rgba(255,255,255,0.9)', fontSize: 13, marginTop: 2 },
  aiBannerChevron: { color: '#fff', fontSize: 26, fontWeight: '300' },
  reBanner: { minHeight: 130, marginTop: 22, borderRadius: 0, overflow: 'hidden', backgroundColor: Colors.PRIMARY },
  reOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 18, paddingVertical: 16, justifyContent: 'center', alignItems: 'center' },
  reKicker: { color: Colors.GOLD, fontSize: 10, lineHeight: 14, letterSpacing: 2, fontWeight: '700' },
  mktBanner: { minHeight: 130, marginTop: 1, borderRadius: 0, overflow: 'hidden' },
  mktOverlay: { flex: 1, backgroundColor: 'rgba(60,26,8,0.5)', paddingHorizontal: 18, paddingVertical: 16, justifyContent: 'center', alignItems: 'center' },
  bannerAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 3, zIndex: 10 },
  mktKicker: { color: '#F4D48A', fontSize: 10, lineHeight: 14, letterSpacing: 2.5, fontWeight: '700' },
  mktArrow: { color: 'rgba(255,255,255,0.85)', fontSize: 34, fontWeight: '200', marginHorizontal: 4 },
  reTitle: { color: '#fff', fontSize: 23, lineHeight: 32, fontWeight: '500', letterSpacing: 0.3, marginTop: 6, writingDirection: 'rtl' },
  reSub: { color: 'rgba(255,255,255,0.92)', fontSize: 13, lineHeight: 19, marginTop: 4, writingDirection: 'rtl' },
});
