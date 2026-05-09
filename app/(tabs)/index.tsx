import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ImageBackground, Image, useWindowDimensions } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { CATALOG } from '../../data/catalog';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=1600&q=80';

const CAT_LINKS_BIG = [
  { id: 'hotels', label: 'מלונות', color: '#E76F51' },
  { id: 'restaurants', label: 'מסעדות', color: '#B8923A' },
  { id: 'attractions', label: 'אטרקציות', color: '#2A9D8F' },
];
const CAT_LINKS_MED = [
  { id: 'shopping', label: 'קניות', color: '#F4A261' },
  { id: 'nightlife', label: 'בילויים', color: '#fff' },
  { id: 'kids', label: 'ילדים', color: '#E76F51' },
  { id: 'casino', label: 'בידור ומשחקים', color: '#F4A261' },
];
const CAT_LINKS_SM = [
  { id: 'transport', label: 'תחבורה', color: '#B8923A' },
];

const LEARN_TILES = [
  { id: 'welcome',    title: 'ברוכים הבאים', img: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=400&q=80' },
  { id: 'tips',       title: 'טיפים',          img: 'https://images.unsplash.com/photo-1582407947092-45795aba4166?w=400&q=80' },
  { id: 'history',    title: 'היסטוריה',       img: 'https://images.unsplash.com/photo-1538485399081-7c8970a14b18?w=400&q=80' },
  { id: 'israelis',   title: 'ישראלים בדובאי', img: 'https://images.unsplash.com/photo-1582407947092-45795aba4166?w=400&q=80' },
  { id: 'economy',    title: 'כלכלה מקומית',   img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&q=80' },
  { id: 'tourism',    title: 'תיירות בדובאי',  img: 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=400&q=80' },
  { id: 'vocabulary', title: 'אוצר מילים',     img: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&q=80' },
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
  if (!img) return 'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600&q=80';
  if (img.startsWith('http')) return img;
  return 'https://wellcomedubai.com/' + img;
}

export default function Home() {
  const { width } = useWindowDimensions();
  const cardW = 160;
  const tileW = 110;

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.PRIMARY }}>
          <ImageBackground source={{ uri: HERO_IMAGE }} style={s.hero}>
            <View style={s.heroOverlay}>
              <View style={s.heroPill}>
                <Text style={s.heroTitle}>ברוכים הבאים ל<Text style={{ color: Colors.GOLD }}>דובאי</Text></Text>
                <Text style={s.heroSub}>המדריך המלא לתייר הישראלי</Text>
              </View>
              <View style={s.linkRowBig}>
                {CAT_LINKS_BIG.map(l => (
                  <TouchableOpacity key={l.id} onPress={() => router.push(`/category/${l.id}` as any)}>
                    <Text style={[s.linkBig, { color: l.color }]}>{l.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={s.linkRowMed}>
                {CAT_LINKS_MED.map(l => (
                  <TouchableOpacity key={l.id} onPress={() => router.push(`/category/${l.id}` as any)}>
                    <Text style={[s.linkMed, { color: l.color }]}>{l.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={s.linkRowMed}>
                {CAT_LINKS_SM.map(l => (
                  <TouchableOpacity key={l.id} onPress={() => router.push(`/category/${l.id}` as any)}>
                    <Text style={[s.linkMed, { color: l.color }]}>{l.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ImageBackground>
        </SafeAreaView>

        {/* Top sections */}
        {(['hotels','attractions','restaurants'] as const).map(cat => {
          const items = topItems(cat, 6);
          if (!items.length) return null;
          const titleMap: Record<string,string> = { hotels:'מלונות מובילים', attractions:'אטרקציות חובה', restaurants:'מסעדות' };
          const colorMap: Record<string,string> = { hotels:'#B8923A', attractions:'#2A9D8F', restaurants:'#F4A261' };
          return (
            <View key={cat} style={{ marginTop: 20 }}>
              <View style={s.sectionHead}>
                <Text style={[s.sectionTitle, { color: colorMap[cat] }]}>{titleMap[cat]}</Text>
                <TouchableOpacity onPress={() => router.push(`/category/${cat}` as any)}>
                  <Text style={s.seeAll}>הכל ←</Text>
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, gap: 10 }}>
                {items.map((it: any) => (
                  <TouchableOpacity key={it.id} activeOpacity={0.85} onPress={() => router.push(`/category/${cat}?id=${it.id}` as any)} style={[s.card, { width: cardW }]}>
                    <Image source={{ uri: imgUrl(it) }} style={s.cardImg} />
                    {it.kosher ? <View style={s.kosherBadge}><Text style={s.kosherText}>✡ מכבד כשרות</Text></View> : null}
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
            <ImageBackground key={t.id} source={{ uri: t.img }} style={[s.learnTile, { width: tileW, height: tileW }]} imageStyle={{ borderRadius: 10 }}>
              <View style={s.learnOverlay}>
                <Text style={s.learnText}>{t.title}</Text>
              </View>
            </ImageBackground>
          ))}
        </ScrollView>

        {/* RE Banner */}
        <TouchableOpacity activeOpacity={0.9} style={s.reBanner} onPress={() => router.push('/realestate' as any)}>
          <ImageBackground source={{ uri: 'https://images.unsplash.com/photo-1582407947092-45795aba4166?w=1200&q=80' }} style={{ flex: 1 }} imageStyle={{ borderRadius: 16, opacity: 0.85 }}>
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
  hero: { height: 460, justifyContent: 'space-between', backgroundColor: Colors.PRIMARY },
  heroOverlay: { flex: 1, padding: 18, justifyContent: 'space-between', backgroundColor: 'rgba(0,0,0,0.35)' },
  heroPill: { alignSelf: 'center', paddingHorizontal: 20, paddingVertical: 14, backgroundColor: 'rgba(0,0,0,0.32)', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(255,255,255,0.16)', marginTop: 10 },
  heroTitle: { color: '#fff', fontSize: 26, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center', writingDirection: 'rtl' },
  heroSub: { color: 'rgba(255,255,255,0.92)', fontSize: 14, fontWeight: '600', textAlign: 'center', marginTop: 4, writingDirection: 'rtl' },
  linkRowBig: { flexDirection: 'row-reverse', justifyContent: 'center', gap: 18, marginTop: 'auto' },
  linkRowMed: { flexDirection: 'row-reverse', justifyContent: 'center', gap: 14, marginTop: 6, flexWrap: 'wrap' },
  linkBig: { fontSize: 18, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.6)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  linkMed: { fontSize: 13, fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  sectionHead: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, marginTop: 20, marginBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '900', writingDirection: 'rtl' },
  seeAll: { color: Colors.ACCENT, fontSize: 12, fontWeight: '700' },
  card: { backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  cardImg: { width: '100%', height: 110 },
  cardBody: { padding: 8 },
  cardName: { fontSize: 13, fontWeight: '800', color: Colors.TEXT, writingDirection: 'rtl' },
  cardRating: { fontSize: 11, color: Colors.GOLD, fontWeight: '700' },
  cardPrice: { fontSize: 11, color: Colors.ACCENT, fontWeight: '700' },
  kosherBadge: { position: 'absolute', bottom: 56, left: 6, backgroundColor: '#0E2A38', borderColor: Colors.GOLD, borderWidth: 1, borderRadius: 6, paddingHorizontal: 6, paddingVertical: 2 },
  kosherText: { color: Colors.GOLD, fontSize: 9, fontWeight: '900' },
  learnTile: { borderRadius: 10, overflow: 'hidden', justifyContent: 'flex-end' },
  learnOverlay: { padding: 6, backgroundColor: 'rgba(0,0,0,0.4)' },
  learnText: { color: '#fff', fontSize: 11, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3, writingDirection: 'rtl' },
  reBanner: { height: 130, marginHorizontal: 14, marginTop: 22, borderRadius: 16, overflow: 'hidden' },
  reOverlay: { flex: 1, backgroundColor: 'rgba(26,107,138,0.65)', padding: 18, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  reKicker: { color: Colors.GOLD, fontSize: 11, letterSpacing: 2, fontWeight: '800' },
  reTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 4, writingDirection: 'rtl' },
  reSub: { color: 'rgba(255,255,255,0.92)', fontSize: 12, marginTop: 4, writingDirection: 'rtl' },
});
