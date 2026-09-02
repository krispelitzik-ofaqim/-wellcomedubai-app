import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useI18n } from '../../constants/i18n';
import { CATALOG } from '../../data/catalog';

function imgUrl(img: string) {
  if (!img) return 'https://wellcomedubai.com/images/Yizhak/dubai-skyline-evening.jpg';
  if (img.startsWith('http')) return img;
  return 'https://wellcomedubai.com/' + img;
}

const CAT_NAME: Record<string, string> = {
  hotels: 'מלונות', restaurants: 'מסעדות', attractions: 'אטרקציות', shopping: 'קניות',
  nightlife: 'בילויים', kids: 'ילדים', transport: 'תחבורה', casino: 'בידור', abudhabi: 'אבו דאבי',
};

const CAT_NAME_EN: Record<string, string> = {
  hotels: 'Hotels', restaurants: 'Restaurants', attractions: 'Attractions', shopping: 'Shopping',
  nightlife: 'Nightlife', kids: 'Kids', transport: 'Transport', casino: 'Entertainment', abudhabi: 'Abu Dhabi',
};

// quick-access categories shown on the empty search screen
const QUICK_CATS: { key: string; emoji: string; color: string }[] = [
  { key: 'hotels', emoji: '🏨', color: '#1A6B8A' },
  { key: 'restaurants', emoji: '🍽️', color: '#E76F51' },
  { key: 'attractions', emoji: '🎡', color: '#2A9D8F' },
  { key: 'shopping', emoji: '🛍️', color: '#B8923A' },
  { key: 'transport', emoji: '🚇', color: '#5B9DC7' },
  { key: 'kids', emoji: '🧸', color: '#E9A23B' },
  { key: 'nightlife', emoji: '🌃', color: '#7B5EA7' },
  { key: 'abudhabi', emoji: '🕌', color: '#C4922F' },
];

export default function SearchScreen() {
  const { t, lang } = useI18n();
  const [q, setQ] = useState('');

  const results = useMemo(() => {
    if (!q.trim()) return [];
    const needle = q.trim().toLowerCase();
    const out: any[] = [];
    for (const cat of Object.keys(CATALOG)) {
      const list: any[] = (CATALOG as any)[cat];
      if (!Array.isArray(list)) continue;
      for (const item of list) {
        const haystack = [item.name, item.nameEn, item.description, item.address, ...(item.tags || [])].join(' ').toLowerCase();
        if (haystack.includes(needle)) out.push({ ...item, _cat: cat });
        if (out.length > 30) break;
      }
      if (out.length > 30) break;
    }
    return out;
  }, [q]);

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#000' }} />
      <View style={s.brandBar}>
        <Text style={s.brandTxt}>
          <Text style={{ color: '#1A6B8A' }}>WellCome </Text>
          <Text style={{ color: '#E76F51' }}>Dubai</Text>
        </Text>
      </View>
      <LinearGradient colors={['#0E5A6B', '#17A2B8', '#E9C46A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/' as any)} style={s.closeBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={s.closeTxt}>✕</Text>
        </TouchableOpacity>
        <View style={s.searchBar}>
          <FontAwesome5 name="search" size={15} color="#17A2B8" />
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder={t('search.placeholder')}
            placeholderTextColor="#9CA3AF"
            style={s.input}
          />
          {q ? (
            <TouchableOpacity onPress={() => setQ('')}>
              <Text style={{ fontSize: 18, color: Colors.MUTED }}>×</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {!q.trim() ? (
          <View style={s.quickWrap}>
            <Text style={s.quickTitle}>{t('search.emptyTitle')}</Text>
            <Text style={s.quickSub}>{t('search.emptySub')}</Text>
            <View style={{ marginTop: 4 }}>
              {QUICK_CATS.map(c => {
                const count = ((CATALOG as any)[c.key] || []).length;
                return (
                <TouchableOpacity key={c.key} activeOpacity={0.85} onPress={() => router.push(`/category/${c.key}` as any)} style={s.row}>
                  <View style={[s.catRowIcon, { backgroundColor: c.color }]}><Text style={{ fontSize: 30 }}>{c.emoji}</Text></View>
                  <View style={{ flex: 1, marginRight: 10 }}>
                    <Text style={s.name} numberOfLines={1}>{lang === 'he' ? CAT_NAME[c.key] : (CAT_NAME_EN[c.key] || CAT_NAME[c.key])}</Text>
                    <Text style={s.cat}>{count} {lang === 'he' ? 'מקומות' : 'places'}</Text>
                  </View>
                  <Text style={{ color: c.color, fontSize: 24, fontWeight: '800' }}>‹</Text>
                </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity activeOpacity={0.9} onPress={() => router.push('/ai' as any)} style={[s.aiBanner, { marginTop: 18 }]}>
              <LinearGradient colors={['#0C5A6B', '#1AA0B0', '#E9C46A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.aiBannerInner}>
                <View style={s.aiBannerIcon}><FontAwesome5 name="robot" size={20} color="#fff" /></View>
                <View style={{ flex: 1, marginHorizontal: 12 }}>
                  <Text style={s.aiBannerTitle}>{({ he: 'מסייע AI', en: 'Dubai AI', ru: 'AI-помощник', hi: 'AI सहायक', ar: 'مساعد AI' } as any)[lang] || 'Dubai AI'}</Text>
                  <Text style={s.aiBannerSub}>{({ he: 'שאל אותי כל דבר על דובאי', en: 'Ask me anything about Dubai', ru: 'Спросите меня о Дубае', hi: 'दुबई के बारे में कुछ भी पूछें', ar: 'اسألني أي شيء عن دبي' } as any)[lang] || 'Ask me anything about Dubai'}</Text>
                </View>
                <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800' }}>‹</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : results.length === 0 ? (
          <View style={s.empty}>
            <Text style={s.emptyTitle}>{t('search.noResults')} "{q}"</Text>
          </View>
        ) : (
          <>
            <Text style={s.resultsCount}>{results.length} {t('search.results')}</Text>
            {results.map(item => (
              <TouchableOpacity key={item._cat + item.id} style={s.row} onPress={() => router.push(`/item/${item.id}?cat=${item._cat}` as any)}>
                <Image source={{ uri: imgUrl(item.image) }} style={s.img} />
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={s.name} numberOfLines={1}>{lang === 'he' ? item.name : (item.nameEn || item.name)}</Text>
                  <Text style={s.cat}>{(t('cat.' + item._cat).startsWith('cat.') ? (lang === 'he' ? CAT_NAME[item._cat] : (CAT_NAME_EN[item._cat] || CAT_NAME[item._cat])) : t('cat.' + item._cat))}{item.address ? ' · ' + item.address : ''}</Text>
                </View>
                {item.rating ? <Text style={s.rating}>⭐ {item.rating}</Text> : null}
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: Colors.PRIMARY, gap: 8 },
  brandBar: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  brandTxt: { flex: 1, fontSize: 22, fontWeight: '900', letterSpacing: -0.3, textAlign: 'center' },
  searchBar: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#fff', borderRadius: 0, paddingHorizontal: 14, paddingVertical: 13, gap: 10 },
  input: { flex: 1, fontSize: 17, color: Colors.TEXT, writingDirection: 'rtl', textAlign: 'right' },
  empty: { alignItems: 'center', padding: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '500', color: Colors.TEXT, marginTop: 12, writingDirection: 'rtl' },
  emptySub: { color: Colors.MUTED, fontSize: 13, marginTop: 4, textAlign: 'center', writingDirection: 'rtl' },
  closeBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  closeTxt: { color: '#fff', fontSize: 16, fontWeight: '700', lineHeight: 18 },
  quickWrap: { paddingTop: 20 },
  quickTitle: { fontSize: 20, fontWeight: '800', color: Colors.TEXT, textAlign: 'center', writingDirection: 'rtl', paddingHorizontal: 16 },
  quickSub: { color: Colors.MUTED, fontSize: 13.5, marginTop: 4, marginBottom: 16, textAlign: 'center', writingDirection: 'rtl', paddingHorizontal: 16 },
  catRowIcon: { width: 74, height: 74, alignItems: 'center', justifyContent: 'center' },
  aiBanner: { marginHorizontal: 0, marginBottom: 10, borderRadius: 0, overflow: 'hidden' },
  aiBannerInner: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14 },
  aiBannerIcon: { width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  aiBannerTitle: { color: '#fff', fontSize: 17, fontWeight: '800', writingDirection: 'rtl', textAlign: 'right' },
  aiBannerSub: { color: 'rgba(255,255,255,0.92)', fontSize: 12.5, marginTop: 2, writingDirection: 'rtl', textAlign: 'right' },
  resultsCount: { color: Colors.MUTED, fontSize: 13, marginTop: 12, marginBottom: 6, paddingHorizontal: 16 },
  row: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#fff', borderRadius: 0, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 0, borderBottomWidth: 1, borderBottomColor: '#EAE0CE' },
  img: { width: 74, height: 74, borderRadius: 0 },
  name: { fontWeight: '500', color: Colors.TEXT, fontSize: 18, letterSpacing: 0.2, writingDirection: 'rtl', textAlign: 'right' },
  cat: { color: Colors.MUTED, fontSize: 13, marginTop: 4, writingDirection: 'rtl', textAlign: 'right' },
  rating: { color: Colors.GOLD, fontWeight: '800', fontSize: 12 },
});
