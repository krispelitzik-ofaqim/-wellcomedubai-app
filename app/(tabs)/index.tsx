import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ImageBackground, Image, useWindowDimensions, Linking, Animated } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { toggleFavorite, isFavorite } from '../../utils/favorites';

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
  { id: 'hotels', label: 'מלונות', color: '#E76F51' },
  { id: 'restaurants', label: 'מסעדות', color: '#fff' },
  { id: 'attractions', label: 'אטרקציות', color: '#2A9D8F' },
];
const CAT_MED = [
  { id: 'nightlife', label: 'בילויים', color: '#fff' },
  { id: 'kids', label: 'ילדים', color: '#E76F51' },
  { id: 'casino', label: 'בידור ומשחקים', color: '#F4A261' },
];
const CAT_SM = [
  { id: 'shopping', label: 'קניות', color: '#F4A261' },
];

const QUICK_TOOLS = [
  { id: 'flights',  label: 'לוח טיסות',  desc: 'TLV ↔ DXB',     icon: '✈️', color: '#1A6B8A', bg: '#D6E5EC', img: 'https://images.pexels.com/photos/2026324/pexels-photo-2026324.jpeg' },
  { id: 'weather',  label: 'מזג אוויר',   desc: 'תחזית בדובאי',  icon: '☀️', color: '#F4A261', bg: '#FCE6D2', img: 'https://wellcomedubai.com/images/Yizhak/dubai-skyline-evening.jpg' },
  { id: 'currency', label: 'שער שקל',     desc: '₪ ↔ AED',       icon: '💰', color: '#2A9D8F', bg: '#D5EBE7', img: 'https://wellcomedubai.com/images/Yizhak/economy-uae-currency.jpg' },
];

const LEARN_TILES = [
  { id: 'about-app',  title: 'על האפליקציה',   img: 'https://wellcomedubai.com/images/icon-new.jpg', highlight: true },
  { id: 'why-us',     title: 'כרטיסים', img: require('../../assets/tickets-tile.jpg'), highlight: true },
  { id: 'welcome',    title: 'ברוכים הבאים',    img: 'https://wellcomedubai.com/images/Yizhak/portrait-woman-visiting-luxurious-city-dubai.jpg' },
  { id: 'tips',       title: 'טיפים',           img: 'https://wellcomedubai.com/images/Yizhak/dubai-mall-dubai-uae.jpg' },
  { id: 'history',    title: 'היסטוריה כללית',  img: 'https://wellcomedubai.com/images/Yizhak/archs-shekh-zayed-grand-mosque-reflect-water-before-it.jpg' },
  { id: 'israelis',   title: 'ישראלים בדובאי',  img: 'https://wellcomedubai.com/images/Yizhak/israelis-flags-il-uae.jpg' },
  { id: 'economy',    title: 'כלכלה מקומית',    img: 'https://wellcomedubai.com/images/Yizhak/economy-uae-currency.jpg' },
  { id: 'tourism',    title: 'תיירות בדובאי',   img: 'https://wellcomedubai.com/images/Yizhak/tourism-family-dubai.jpg' },
  { id: 'vocabulary', title: 'אוצר מילים בסיסי', img: 'https://wellcomedubai.com/images/Yizhak/vocabulary-translate.jpg' },
  { id: 'events',     title: 'יומן אירועים', img: require('../../assets/events-calendar.png'), isEvents: true, highlight: true },
  { id: 'emergency',  title: 'חירום', img: require('../../assets/emergency.jpg'), highlight: true },
];

function AnimatedTitle({ fontSize }: { fontSize: number }) {
  const PART1 = 'ברוכים הבאים ל';
  const PART2 = 'דובאי';
  const letters = [
    ...PART1.split('').map(c => ({ c, finalColor: '#E76F51' })),
    ...PART2.split('').map(c => ({ c, finalColor: '#B8923A' })),
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
    <Text style={[styles.heroTitle, { fontSize }]}>
      {letters.map((l, i) => {
        const color = colorMix.interpolate({ inputRange: [0, 1], outputRange: ['#FFFFFF', l.finalColor] });
        return (
          <Animated.Text key={i} style={{ color, opacity: opacities[i] }}>{l.c}</Animated.Text>
        );
      })}
    </Text>
  );
}

function AnimatedSubtitle({ fontSize }: { fontSize: number }) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration: 800, delay: 5000, useNativeDriver: true }).start();
  }, []);
  return (
    <Animated.Text style={[styles.heroSub, { fontSize, opacity }]}>המדריך המלא לתייר הישראלי</Animated.Text>
  );
}

const styles = StyleSheet.create({
  heroTitle: { fontWeight: '900', letterSpacing: -0.5, textAlign: 'center', writingDirection: 'rtl', textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5 },
  heroSub: { color: 'rgba(255,255,255,0.95)', fontWeight: '600', textAlign: 'center', marginTop: 4, writingDirection: 'rtl', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
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

export default function Home() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const heroHeight = height - insets.top - insets.bottom - 28;
  const [moreOpen, setMoreOpen] = useState(false);
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
      <ScrollView ref={scrollRef} contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false} onScroll={(e) => setShowTop(e.nativeEvent.contentOffset.y > height)} scrollEventThrottle={200}>
        {/* Hero */}
        <SafeAreaView edges={[]} style={{ backgroundColor: Colors.PRIMARY }}>
          <ImageBackground source={{ uri: HERO_IMAGES[heroIdx] }} style={[s.hero, { height: heroHeight }]}>
            <View style={s.heroOverlay}>
              {/* Center: title (no block) */}
              <View style={s.heroTop}>
                <AnimatedTitle fontSize={f(26)} />

                <AnimatedSubtitle fontSize={f(15)} />

              </View>
              {/* Bottom: category links + near me */}
              <View style={s.heroBottom}>
                <View style={s.linkRowBig}>
                  {CAT_BIG.map(l => (
                    <TouchableOpacity key={l.id} onPress={() => router.push(`/category/${l.id}` as any)}>
                      <Text style={[s.linkBig, { color: l.color, fontSize: f(21) }]}>{l.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={[s.linkRowMed, { gap: 9 }]}>
                  {CAT_MED.map(l => (
                    <TouchableOpacity key={l.id} onPress={() => router.push(`/category/${l.id}` as any)}>
                      <Text style={[s.linkMed, { color: l.color, fontSize: f(19) }]}>{l.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={[s.linkRowMed, { gap: 11 }]}>
                  {CAT_SM.map(l => (
                    <TouchableOpacity key={l.id} onPress={() => router.push(`/category/${l.id}` as any)}>
                      <Text style={[s.linkMed, { color: l.color, fontSize: f(18) }]}>{l.label}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity onPress={() => router.push('/itineraries' as any)}>
                    <Text style={[s.linkMed, { color: Colors.SECONDARY, fontSize: f(18) }]}>מסלולים מוכנים</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => router.push('/category/transport' as any)}>
                    <Text style={[s.linkMed, { color: '#fff', fontSize: f(18) }]}>תחבורה</Text>
                  </TouchableOpacity>
                </View>
                <View style={s.nearMeRow}>
                  <TouchableOpacity onPress={() => router.push('/near' as any)}>
                    <Text style={[s.nearMe, { fontSize: f(15) }]}>📍 הראה לי מה קרוב אליי עכשיו</Text>
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
          const titleMap: Record<string,string> = { hotels:'מלונות מובילים', attractions:'אטרקציות חובה', restaurants:'מסעדות' };
          const colorMap: Record<string,string> = { hotels:'#B8923A', attractions:'#2A9D8F', restaurants:'#F4A261' };
          return (
            <View key={cat} style={{ marginTop: 18 }}>
              <View style={s.sectionHead}>
                <Text style={[s.sectionTitle, { color: colorMap[cat] }]}>{titleMap[cat]}</Text>
                <TouchableOpacity onPress={() => router.push(`/category/${cat}` as any)}>
                  <Text style={s.seeAll}>הכל ←</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, gap: 10 }}>
                {items.map((it: any) => (
                  <TouchableOpacity key={it.id} activeOpacity={0.85} onPress={() => router.push(`/item/${it.id}?cat=${cat}` as any)} style={[s.card, { width: cardW }]}>
                    <View style={{ position: 'relative' }}>
                      <Image source={{ uri: imgUrl(it, cat) }} style={s.cardImg} />
                      {it.kosher ? <View style={s.kosherBadge}><Text style={s.kosherText}>✡ מכבד כשרות</Text></View> : null}
                      {(() => {
                        const isHe = /[֐-׿]/.test(it.name || '');
                        const heName = it.nameHe || (isHe ? it.name : '');
                        return heName ? (
                          <Text numberOfLines={1} style={{ position: 'absolute', bottom: 8, right: 10, color: '#fff', fontWeight: '900', fontSize: 14, maxWidth: '90%', writingDirection: 'rtl', textAlign: 'right', textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 5 }}>{heName}</Text>
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
        <View style={s.sectionHead}>
          <Text style={[s.sectionTitle, { color: Colors.SECONDARY, fontSize: 16 }]}>להכיר את דובאי</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}>
          {LEARN_TILES.map(t => (
            <TouchableOpacity key={t.id} activeOpacity={0.85} onPress={() => t.isEvents ? router.push('/events' as any) : router.push(`/learn/${t.id}` as any)}>
              <ImageBackground source={typeof t.img === 'string' ? { uri: t.img } : t.img} style={[s.learnTile, { width: tileW, height: tileW }]} imageStyle={{ borderRadius: 10 }}>
                <View style={s.learnOverlay}>
                  <Text style={s.learnText} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{t.title}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* More categories — collapsible */}
        <TouchableOpacity onPress={() => setMoreOpen(o => !o)} style={s.moreToggle}>
          <Text style={s.moreToggleText}>קטגוריות נוספות</Text>
          <Text style={s.moreToggleArrow}>{moreOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {moreOpen && (
          <View>
            {(['shopping','nightlife','kids'] as const).map(cat => {
              const items = topItems(cat, 6);
              if (!items.length) return null;
              const titleMap: Record<string,string> = { shopping:'קניות', nightlife:'בילויים', kids:'ילדים ומשפחות' };
              const colorMap: Record<string,string> = { shopping:'#F4A261', nightlife:'#B85C8E', kids:'#E76F51' };
              return (
                <View key={cat} style={{ marginTop: 14 }}>
                  <View style={s.sectionHead}>
                    <Text style={[s.sectionTitle, { color: colorMap[cat], fontSize: 16 }]}>{titleMap[cat]}</Text>
                    <TouchableOpacity onPress={() => router.push(`/category/${cat}` as any)}>
                      <Text style={s.seeAll}>הכל ←</Text>
                    </TouchableOpacity>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, gap: 10 }}>
                    {items.map((it: any) => (
                      <TouchableOpacity key={it.id} activeOpacity={0.85} onPress={() => router.push(`/item/${it.id}?cat=${cat}` as any)} style={[s.card, { width: 140 }]}>
                        <View style={{ position: 'relative' }}>
                          <Image source={{ uri: imgUrl(it, cat) }} style={[s.cardImg, { height: 90 }]} />
                          {(() => {
                            const isHe = /[֐-׿]/.test(it.name || '');
                            const heName = it.nameHe || (isHe ? it.name : '');
                            return heName ? (
                              <Text numberOfLines={1} style={{ position: 'absolute', bottom: 6, right: 8, color: '#fff', fontWeight: '900', fontSize: 13, maxWidth: '90%', writingDirection: 'rtl', textAlign: 'right', textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 5 }}>{heName}</Text>
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

        {/* RE Banner */}
        <TouchableOpacity activeOpacity={0.9} style={s.reBanner} onPress={() => router.push('/realestate' as any)} key="re-banner">
          <ImageBackground source={{ uri: 'https://wellcomedubai.com/images/wellcomedubai.stamp/skyscrapers-looking-up-sky-modern-metropolis-modern-city.jpg' }} style={{ flex: 1 }} imageStyle={{ borderRadius: 16 }}>
            <View style={s.reOverlay}>
              <Text style={s.reKicker}>DUBAI REAL ESTATE</Text>
              <Text style={s.reTitle}>פורטל הנדל"ן והעסקים של דובאי</Text>
              <Text style={s.reSub}>מאמרים · מודעות · מתווכים · השקעות</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* Quick Tools — image header + colored stripe + label/desc */}
        <View style={s.qtRow}>
          {QUICK_TOOLS.map(t => (
            <TouchableOpacity key={t.id} activeOpacity={0.85} style={s.qtCard} onPress={() => router.push(`/tools/${t.id}` as any)}>
              <View style={s.qtImgWrap}>
                <Image source={{ uri: t.img }} style={s.qtImg} />
                <View style={[s.qtIconBadge, { backgroundColor: t.color + 'cc' }]}><Text style={{ fontSize: 12 }}>{t.icon}</Text></View>
              </View>
              <View style={[s.qtBody, { borderTopColor: t.color, backgroundColor: (t as any).bg ?? '#fff' }]}>
                <Text style={s.qtLabel}>{t.label}</Text>
                <Text style={s.qtDesc}>{t.desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Gallery preview — collapsed by default, at bottom */}
        <TouchableOpacity onPress={() => setGalleryOpen(o => !o)} style={s.galleryToggle}>
          <Text style={s.galleryToggleText}>הגלרייה שלנו {galleryOpen ? '▲' : '▼'}</Text>
        </TouchableOpacity>
        {galleryOpen && (
          <>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}>
              {(GALLERY as string[]).slice(0, 12).map((name, i) => (
                <TouchableOpacity key={i} onPress={() => router.push('/gallery' as any)}>
                  <Image source={{ uri: `https://wellcomedubai.com/images/wellcomedubai.stamp/${name}` }} style={{ width: 130, height: 130, borderRadius: 8 }} />
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => router.push('/gallery' as any)} style={{ alignItems: 'center', paddingVertical: 8 }}>
              <Text style={{ color: Colors.ACCENT, fontWeight: '700', fontSize: 12 }}>לתצוגה מלאה ←</Text>
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
  heroTop: { alignItems: 'center', marginTop: 24 },
  appIcon: { width: 72, height: 72, borderRadius: 18, borderWidth: 2, borderColor: Colors.GOLD, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  searchCorner: { position: 'absolute', top: 8, left: 8, zIndex: 5 },
  searchIconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' },
  heroPill: { paddingHorizontal: 20, paddingVertical: 14, backgroundColor: 'rgba(0,0,0,0.32)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  heroTitle: { color: '#fff', fontWeight: '900', letterSpacing: -0.5, textAlign: 'center', writingDirection: 'rtl', textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5 },
  heroSub: { color: 'rgba(255,255,255,0.95)', fontWeight: '600', textAlign: 'center', marginTop: 4, writingDirection: 'rtl', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  heroBottom: { paddingBottom: 30 },
  linkRowBig: { flexDirection: 'row-reverse', justifyContent: 'center', gap: 11, marginBottom: 6 },
  linkRowMed: { flexDirection: 'row-reverse', justifyContent: 'center', gap: 12, marginBottom: 4, flexWrap: 'wrap' },
  linkBig: { fontSize: 18, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  linkMed: { fontSize: 13, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  nearMeRow: { alignItems: 'center', marginTop: 6 },
  nearMe: { color: '#fff', fontSize: 14, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  qtRow: { flexDirection: 'row-reverse', gap: 8, paddingHorizontal: 14, marginTop: 14 },
  qtCard: { flex: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  qtImgWrap: { height: 100, position: 'relative' },
  qtImg: { width: '100%', height: '100%' },
  qtIconBadge: { position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  qtBody: { backgroundColor: '#fff', padding: 8, borderTopWidth: 3, alignItems: 'center' },
  qtLabel: { color: Colors.TEXT, fontSize: 12, fontWeight: '900' },
  qtDesc: { color: Colors.MUTED, fontSize: 9, marginTop: 2 },
  sectionHead: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, marginTop: 18, marginBottom: 8 },
  sectionTitle: { fontSize: 20, fontWeight: '800', writingDirection: 'rtl' },
  seeAll: { color: Colors.ACCENT, fontSize: 14, fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  cardImg: { width: '100%', height: 160 },
  cardBody: { padding: 14 },
  cardName: { fontSize: 16, fontWeight: '600', color: Colors.TEXT, writingDirection: 'rtl' },
  cardRating: { fontSize: 14, color: Colors.GOLD, fontWeight: '600' },
  cardPrice: { fontSize: 14, color: Colors.GOLD, fontWeight: '500' },
  kosherBadge: { position: 'absolute', bottom: 6, left: 6, backgroundColor: '#0E2A38', borderColor: Colors.GOLD, borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  plusBadge: { position: 'absolute', top: 6, right: 6, width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  plusBadgeTxt: { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 30, textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  kosherText: { color: Colors.GOLD, fontSize: 9, fontWeight: '900' },
  learnTile: { borderRadius: 10, overflow: 'hidden', justifyContent: 'flex-end' },
  learnOverlay: { padding: 6, backgroundColor: 'rgba(0,0,0,0.4)' },
  learnText: { color: '#fff', fontSize: 10, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3, writingDirection: 'rtl', textAlign: 'center' },
  galleryToggle: { alignItems: 'center', marginTop: 22, marginBottom: 6, paddingVertical: 6 },
  galleryToggleText: { color: Colors.TEXT, fontWeight: '700', fontSize: 14 },
  moreToggle: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, marginTop: 18 },
  moreToggleText: { color: Colors.ACCENT, fontWeight: '900', fontSize: 16 },
  moreToggleArrow: { color: Colors.ACCENT, fontSize: 13 },
  reBanner: { height: 130, marginHorizontal: 14, marginTop: 22, borderRadius: 16, overflow: 'hidden', backgroundColor: Colors.PRIMARY },
  reOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', padding: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  reKicker: { color: Colors.GOLD, fontSize: 10, letterSpacing: 2, fontWeight: '800' },
  reTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 4, writingDirection: 'rtl' },
  reSub: { color: 'rgba(255,255,255,0.92)', fontSize: 11, marginTop: 4, writingDirection: 'rtl' },
});
