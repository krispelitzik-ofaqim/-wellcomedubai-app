import { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ImageBackground, Image, useWindowDimensions, Linking, Animated } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { CATALOG } from '../../data/catalog';
import GALLERY from '../../data/gallery.json';

const HERO_IMAGES = [
  'https://wellcomedubai.com/images/Yizhak/1.jpg',
  'https://wellcomedubai.com/images/Yizhak/2.jpg',
  'https://wellcomedubai.com/images/Yizhak/3.jpg',
  'https://wellcomedubai.com/images/Yizhak/4.jpg',
  'https://wellcomedubai.com/images/Yizhak/5.jpg',
];

const CAT_BIG = [
  { id: 'hotels', label: 'מלונות', color: '#E76F51' },
  { id: 'restaurants', label: 'מסעדות', color: '#B8923A' },
  { id: 'attractions', label: 'אטרקציות', color: '#2A9D8F' },
];
const CAT_MED = [
  { id: 'nightlife', label: 'בילויים', color: '#fff' },
  { id: 'kids', label: 'ילדים', color: '#E76F51' },
  { id: 'casino', label: 'בידור ומשחקים', color: '#F4A261' },
];
const CAT_SM = [
  { id: 'shopping', label: 'קניות', color: '#F4A261' },
  { id: 'transport', label: 'תחבורה', color: '#B8923A' },
];

const QUICK_TOOLS = [
  { id: 'flights', label: 'טיסות', icon: '✈️', color: '#1A6B8A', desc: 'TLV ↔ DXB' },
  { id: 'weather', label: 'מזג אוויר', icon: '☀️', color: '#F4A261', desc: 'דובאי כעת' },
  { id: 'currency', label: 'המרת מטבע', icon: '💱', color: '#2A9D8F', desc: 'ש״ח ⇄ AED' },
];

const LEARN_TILES = [
  { id: 'welcome',    title: 'ברוכים הבאים', img: 'https://wellcomedubai.com/images/Yizhak/portrait-woman-visiting-luxurious-city-dubai.jpg' },
  { id: 'tips',       title: 'טיפים',          img: 'https://wellcomedubai.com/images/Yizhak/dubai-mall-dubai-uae.jpg' },
  { id: 'history',    title: 'היסטוריה',       img: 'https://wellcomedubai.com/images/Yizhak/archs-shekh-zayed-grand-mosque-reflect-water-before-it.jpg' },
  { id: 'israelis',   title: 'ישראלים בדובאי', img: 'https://wellcomedubai.com/images/Yizhak/israelis-flags-il-uae.jpg' },
  { id: 'economy',    title: 'כלכלה מקומית',   img: 'https://wellcomedubai.com/images/Yizhak/economy-uae-currency.jpg' },
  { id: 'tourism',    title: 'תיירות בדובאי',  img: 'https://wellcomedubai.com/images/Yizhak/tourism-family-dubai.jpg' },
  { id: 'vocabulary', title: 'אוצר מילים',     img: 'https://wellcomedubai.com/images/Yizhak/vocabulary-translate.jpg' },
  { id: 'events',     title: 'לוח אירועים',    img: 'https://wellcomedubai.com/images/Yizhak/dubai-skyline-evening.jpg', isEvents: true },
];

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

function imgUrl(item: any) {
  const img = item.image || '';
  if (!img) return 'https://wellcomedubai.com/images/Yizhak/dubai-skyline-evening.jpg';
  if (img.startsWith('http')) return img;
  return 'https://wellcomedubai.com/' + img;
}

export default function Home() {
  const { width } = useWindowDimensions();
  const [moreOpen, setMoreOpen] = useState(false);
  const [heroIdx, setHeroIdx] = useState(0);
  // Scale fonts based on width — 390px (iPhone 12) is baseline 1.0; tablets get larger
  const scale = Math.min(1.5, Math.max(0.85, width / 390));
  const f = (n: number) => Math.round(n * scale);
  const cardW = Math.round(160 * scale);
  const tileW = Math.round(110 * scale);
  useEffect(() => {
    const t = setInterval(() => setHeroIdx(i => (i + 1) % HERO_IMAGES.length), 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.PRIMARY }}>
          <ImageBackground source={{ uri: HERO_IMAGES[heroIdx] }} style={s.hero}>
            <View style={s.heroOverlay}>
              {/* Center: title (no block) */}
              <View style={s.heroTop}>
                <Text style={[s.heroTitle, { fontSize: f(24) }]}>ברוכים הבאים ל<Text style={{ color: Colors.GOLD }}>דובאי</Text></Text>
                <Text style={[s.heroSub, { fontSize: f(14) }]}>המדריך המלא לתייר הישראלי</Text>
              </View>
              {/* Bottom: category links + near me */}
              <View style={s.heroBottom}>
                <View style={s.linkRowBig}>
                  {CAT_BIG.map(l => (
                    <TouchableOpacity key={l.id} onPress={() => router.push(`/category/${l.id}` as any)}>
                      <Text style={[s.linkBig, { color: l.color, fontSize: f(17) }]}>{l.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={s.linkRowMed}>
                  {CAT_MED.map(l => (
                    <TouchableOpacity key={l.id} onPress={() => router.push(`/category/${l.id}` as any)}>
                      <Text style={[s.linkMed, { color: l.color, fontSize: f(15) }]}>{l.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={s.linkRowMed}>
                  {CAT_SM.map(l => (
                    <TouchableOpacity key={l.id} onPress={() => router.push(`/category/${l.id}` as any)}>
                      <Text style={[s.linkMed, { color: l.color, fontSize: f(15) }]}>{l.label}</Text>
                    </TouchableOpacity>
                  ))}
                  <TouchableOpacity onPress={() => router.push('/itineraries' as any)}>
                    <Text style={[s.linkMed, { color: Colors.SECONDARY, fontSize: f(14) }]}>מסלולים מוכנים</Text>
                  </TouchableOpacity>
                </View>
                <View style={s.nearMeRow}>
                  <TouchableOpacity onPress={() => router.push('/(tabs)/map' as any)}>
                    <Text style={[s.nearMe, { fontSize: f(12) }]}>📍 הראה לי מה קרוב אליי עכשיו</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ImageBackground>
        </SafeAreaView>

        {/* Quick Tools */}
        <View style={s.qtRow}>
          {QUICK_TOOLS.map(t => (
            <TouchableOpacity key={t.id} activeOpacity={0.85} style={[s.qtCard, { backgroundColor: t.color }]} onPress={() => router.push(`/tools/${t.id}` as any)}>
              <Text style={s.qtIcon}>{t.icon}</Text>
              <Text style={s.qtLabel}>{t.label}</Text>
              <Text style={s.qtDesc}>{t.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

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
                      <Image source={{ uri: imgUrl(it) }} style={s.cardImg} />
                      {it.kosher ? <View style={s.kosherBadge}><Text style={s.kosherText}>✡ מכבד כשרות</Text></View> : null}
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
          <Text style={[s.sectionTitle, { color: Colors.SECONDARY }]}>📖 להכיר את דובאי</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}>
          {LEARN_TILES.map(t => (
            <TouchableOpacity key={t.id} activeOpacity={0.85} onPress={() => t.isEvents ? router.push('/events' as any) : router.push(`/learn/${t.id}` as any)}>
              <ImageBackground source={{ uri: t.img }} style={[s.learnTile, { width: tileW, height: tileW }]} imageStyle={{ borderRadius: 10 }}>
                <View style={s.learnOverlay}>
                  <Text style={s.learnText}>{t.title}</Text>
                </View>
              </ImageBackground>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* More categories — collapsible */}
        <TouchableOpacity onPress={() => setMoreOpen(o => !o)} style={s.moreToggle}>
          <Text style={s.moreToggleText}>📚 קטגוריות נוספות</Text>
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
                        <Image source={{ uri: imgUrl(it) }} style={[s.cardImg, { height: 90 }]} />
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

        {/* Gallery preview */}
        <View style={s.sectionHead}>
          <Text style={[s.sectionTitle, { color: Colors.ACCENT }]}>📷 הגלרייה שלנו</Text>
          <TouchableOpacity onPress={() => router.push('/gallery' as any)}>
            <Text style={s.seeAll}>הכל ←</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}>
          {(GALLERY as string[]).slice(0, 12).map((name, i) => (
            <TouchableOpacity key={i} onPress={() => router.push('/gallery' as any)}>
              <Image source={{ uri: `https://wellcomedubai.com/images/wellcomedubai.stamp/${name}` }} style={{ width: 130, height: 130, borderRadius: 8 }} />
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* RE Banner */}
        <TouchableOpacity activeOpacity={0.9} style={s.reBanner} onPress={() => router.push('/realestate' as any)}>
          <ImageBackground source={{ uri: 'https://wellcomedubai.com/images/wellcomedubai.stamp/skyscrapers-looking-up-sky-modern-metropolis-modern-city.jpg' }} style={{ flex: 1 }} imageStyle={{ borderRadius: 16 }}>
            <View style={s.reOverlay}>
              <Text style={s.reKicker}>DUBAI REAL ESTATE</Text>
              <Text style={s.reTitle}>פורטל הנדל"ן והעסקים</Text>
              <Text style={s.reSub}>מאמרים · מודעות · מתווכים · השקעות</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  hero: { minHeight: 620, backgroundColor: Colors.PRIMARY },
  heroOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'space-between', padding: 18 },
  heroTop: { alignItems: 'center', marginTop: 24 },
  appIcon: { width: 72, height: 72, borderRadius: 18, borderWidth: 2, borderColor: Colors.GOLD, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  searchCorner: { position: 'absolute', top: 8, left: 8, zIndex: 5 },
  searchIconBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' },
  heroPill: { paddingHorizontal: 20, paddingVertical: 14, backgroundColor: 'rgba(0,0,0,0.32)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)' },
  heroTitle: { color: '#fff', fontWeight: '900', letterSpacing: -0.5, textAlign: 'center', writingDirection: 'rtl', textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 5 },
  heroSub: { color: 'rgba(255,255,255,0.95)', fontWeight: '600', textAlign: 'center', marginTop: 4, writingDirection: 'rtl', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  heroBottom: { paddingBottom: 60 },
  linkRowBig: { flexDirection: 'row-reverse', justifyContent: 'center', gap: 16, marginBottom: 4 },
  linkRowMed: { flexDirection: 'row-reverse', justifyContent: 'center', gap: 12, marginBottom: 2, flexWrap: 'wrap' },
  linkBig: { fontSize: 18, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  linkMed: { fontSize: 13, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  nearMeRow: { alignItems: 'center', marginTop: 4 },
  nearMe: { color: '#fff', fontSize: 14, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  qtRow: { flexDirection: 'row-reverse', gap: 8, paddingHorizontal: 14, marginTop: 14 },
  qtCard: { flex: 1, padding: 12, borderRadius: 12, alignItems: 'center' },
  qtIcon: { fontSize: 22 },
  qtLabel: { color: '#fff', fontSize: 12, fontWeight: '900', marginTop: 4 },
  qtDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 9, marginTop: 2 },
  sectionHead: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, marginTop: 18, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '900', writingDirection: 'rtl' },
  seeAll: { color: Colors.ACCENT, fontSize: 11, fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  cardImg: { width: '100%', height: 110 },
  cardBody: { padding: 8 },
  cardName: { fontSize: 12, fontWeight: '800', color: Colors.TEXT, writingDirection: 'rtl' },
  cardRating: { fontSize: 10, color: Colors.GOLD, fontWeight: '700' },
  cardPrice: { fontSize: 10, color: Colors.ACCENT, fontWeight: '700' },
  kosherBadge: { position: 'absolute', bottom: 6, left: 6, backgroundColor: '#0E2A38', borderColor: Colors.GOLD, borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  kosherText: { color: Colors.GOLD, fontSize: 9, fontWeight: '900' },
  learnTile: { borderRadius: 10, overflow: 'hidden', justifyContent: 'flex-end' },
  learnOverlay: { padding: 6, backgroundColor: 'rgba(0,0,0,0.4)' },
  learnText: { color: '#fff', fontSize: 10, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3, writingDirection: 'rtl' },
  moreToggle: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, marginTop: 18 },
  moreToggleText: { color: Colors.ACCENT, fontWeight: '900', fontSize: 14 },
  moreToggleArrow: { color: Colors.ACCENT, fontSize: 13 },
  reBanner: { height: 130, marginHorizontal: 14, marginTop: 22, borderRadius: 16, overflow: 'hidden', backgroundColor: Colors.PRIMARY },
  reOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', padding: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  reKicker: { color: Colors.GOLD, fontSize: 10, letterSpacing: 2, fontWeight: '800' },
  reTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 4, writingDirection: 'rtl' },
  reSub: { color: 'rgba(255,255,255,0.92)', fontSize: 11, marginTop: 4, writingDirection: 'rtl' },
});
