import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, TextInput, Linking, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../constants/colors';
import { useI18n } from '../constants/i18n';
import { CATALOG } from '../data/catalog';
import ATTRACTION_PHOTOS from '../data/attraction-photos.json';
import ABUDHABI_PHOTOS from '../data/abudhabi-photos.json';

const PLACES_KEY = 'AIzaSyDVYlYuM6saMxbhi2aKNCtiv6J8mR8LLgw';
const GYG_PARTNER = 'PE2GLSE3MAO4YDEIXLNOYXMC67BCZ32C';
const PHOTOS: Record<string, any> = { attractions: ATTRACTION_PHOTOS, abudhabi: ABUDHABI_PHOTOS };

export default function TicketsScreen() {
  const { t, lang, isRTL } = useI18n();
  const { cat: catParam } = useLocalSearchParams<{ cat?: string }>();
  const cat = catParam === 'abudhabi' ? 'abudhabi' : 'attractions';
  const [q, setQ] = useState('');
  const items: any[] = (CATALOG as any)[cat] || [];
  const photoMap = PHOTOS[cat] || {};

  const thumbUrl = (it: any) => {
    const name = photoMap[String(it.id)]?.photos?.[0]?.name;
    if (name) return `https://places.googleapis.com/v1/${name}/media?key=${PLACES_KEY}&maxWidthPx=400`;
    const img = it.image || '';
    if (!img) return 'https://wellcomedubai.com/images/Yizhak/dubai-skyline-evening.jpg';
    return img.startsWith('http') ? img : 'https://wellcomedubai.com/' + img;
  };
  const dispName = (it: any) => (lang === 'he' ? it.name : (it.nameEn || it.name));
  const buyUrl = (it: any) => it.ticketUrl ||
    `https://www.getyourguide.com/s/?q=${encodeURIComponent((it.nameEn || it.name) + ' ' + (cat === 'abudhabi' ? 'Abu Dhabi' : 'Dubai'))}&partner_id=${GYG_PARTNER}`;

  const ranked = useMemo(() =>
    [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0)), [items]);
  const query = q.trim().toLowerCase();
  const filtered = useMemo(() => {
    if (!query) return ranked;
    return ranked.filter(it => [it.name, it.nameEn, it.nameHe].filter(Boolean).some((n: string) => n.toLowerCase().includes(query)));
  }, [query, ranked]);

  const popular = !query ? ranked.slice(0, 4) : [];
  const rest = !query ? ranked.slice(4) : filtered;

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.ACCENT }}>
        <View style={[s.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/'); }} style={s.back}>
            <Text style={s.backTxt}>{isRTL ? '›' : '‹'}</Text>
          </TouchableOpacity>
          <Text style={[s.hTitle, { flex: 1, textAlign: isRTL ? 'right' : 'left' }]}>
            {cat === 'abudhabi' ? t('market.adTickets') : t('market.tickets')}
          </Text>
        </View>
        <View style={s.searchWrap}>
          <TextInput value={q} onChangeText={setQ} placeholder={t('tickets.search')}
            placeholderTextColor="rgba(255,255,255,0.75)"
            style={[s.search, { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]} />
        </View>
      </SafeAreaView>

      <FlatList
        data={rest}
        keyExtractor={(it) => String(it.id)}
        contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
        ListHeaderComponent={popular.length ? (
          <View style={{ marginBottom: 8 }}>
            <Text style={[s.secTitle, { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]}>⭐ {t('tickets.popular')}</Text>
            <View style={s.grid}>
              {popular.map(it => (
                <TouchableOpacity key={it.id} style={s.gTile} activeOpacity={0.9}
                  onPress={() => router.push(`/item/${it.id}?cat=${cat}` as any)}>
                  <ImageBackground source={{ uri: thumbUrl(it) }} style={{ flex: 1 }} imageStyle={{ borderRadius: 14 }}>
                    <View style={s.gOverlay}>
                      <Text style={s.gName} numberOfLines={2}>{dispName(it)}</Text>
                      {it.rating ? <Text style={s.gRating}>⭐ {it.rating}</Text> : null}
                    </View>
                  </ImageBackground>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : null}
        ListEmptyComponent={<Text style={s.none}>{t('tickets.none')}</Text>}
        renderItem={({ item }) => (
          <View style={[s.card, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <TouchableOpacity style={[s.cardMain, { flexDirection: isRTL ? 'row-reverse' : 'row' }]} activeOpacity={0.85}
              onPress={() => router.push(`/item/${item.id}?cat=${cat}` as any)}>
              <Image source={{ uri: thumbUrl(item) }} style={s.thumb} />
              <View style={{ flex: 1, paddingHorizontal: 10, justifyContent: 'center' }}>
                <Text style={[s.name, { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]} numberOfLines={2}>{dispName(item)}</Text>
                {item.rating ? <Text style={[s.rating, { textAlign: isRTL ? 'right' : 'left' }]}>⭐ {item.rating}</Text> : null}
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={s.buyBtn} onPress={() => Linking.openURL(buyUrl(item))}>
              <Text style={s.buyTxt} numberOfLines={1}>{t('tickets.buy')}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { alignItems: 'center', paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6, gap: 10 },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: '#fff', fontSize: 30, fontWeight: '300', marginTop: -4 },
  hTitle: { color: '#fff', fontSize: 21, fontWeight: '900' },
  searchWrap: { paddingHorizontal: 14, paddingBottom: 12 },
  search: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: '#fff', fontSize: 15, fontWeight: '600' },
  secTitle: { color: Colors.TEXT, fontSize: 16, fontWeight: '900', marginBottom: 10, marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gTile: { width: '48.5%', aspectRatio: 1.15, borderRadius: 14, overflow: 'hidden', marginBottom: 11, backgroundColor: '#ccc' },
  gOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.32)', borderRadius: 14, justifyContent: 'flex-end', padding: 10 },
  gName: { color: '#fff', fontSize: 15, fontWeight: '900', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  gRating: { color: Colors.GOLD, fontSize: 12, fontWeight: '800', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 14, marginBottom: 10, overflow: 'hidden', alignItems: 'center', elevation: 2 },
  cardMain: { flex: 1, alignItems: 'center' },
  thumb: { width: 78, height: 78, backgroundColor: '#E5E7EB' },
  name: { color: Colors.TEXT, fontSize: 15, fontWeight: '800' },
  rating: { color: Colors.GOLD, fontSize: 13, fontWeight: '700', marginTop: 3 },
  buyBtn: { backgroundColor: '#FF5C00', paddingHorizontal: 14, paddingVertical: 22, alignItems: 'center', justifyContent: 'center' },
  buyTxt: { color: '#fff', fontSize: 14, fontWeight: '900' },
  none: { textAlign: 'center', color: Colors.MUTED, fontSize: 15, fontWeight: '700', marginTop: 40 },
});
