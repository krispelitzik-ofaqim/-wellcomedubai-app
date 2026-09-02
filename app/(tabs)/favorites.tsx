import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useI18n } from '../../constants/i18n';
import { CATALOG } from '../../data/catalog';
import { getFavorites, type Favorite } from '../../utils/favorites';

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

const CAT_COLOR: Record<string, string> = {
  hotels: Colors.GOLD, restaurants: Colors.WARM, attractions: Colors.SECONDARY,
  shopping: Colors.WARM, nightlife: Colors.PINK, kids: Colors.ACCENT,
  transport: Colors.PRIMARY, casino: Colors.GOLD, abudhabi: Colors.PINK,
};

export default function FavoritesScreen() {
  const { t, lang, isRTL } = useI18n();
  const s = makeStyles(isRTL);
  const [items, setItems] = useState<{ fav: Favorite; data: any }[]>([]);

  const load = useCallback(async () => {
    const favs = await getFavorites();
    const enriched = favs.map(f => {
      const list: any[] = (CATALOG as any)[f.cat] || [];
      const data = list.find(i => String(i.id) === String(f.id));
      return data ? { fav: f, data } : null;
    }).filter(Boolean) as any[];
    setItems(enriched);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#000' }} />
      <View style={s.brandBar}>
        <Text style={s.brandTxt}>
          <Text style={{ color: '#1A6B8A' }}>WellCome </Text>
          <Text style={{ color: '#E76F51' }}>Dubai</Text>
        </Text>
      </View>
      <View style={s.header}>
        <Text style={s.title}>{t('fav.title')}</Text>
        <Text style={s.subtitle}>{items.length} {t('fav.items')}</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {items.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 56 }}>🤍</Text>
            <Text style={s.emptyTitle}>{t('fav.emptyTitle')}</Text>
            <Text style={s.emptySub}>{t('fav.emptySub')}</Text>
          </View>
        ) : items.map(({ fav, data }) => (
          <TouchableOpacity key={fav.cat + fav.id} activeOpacity={0.85} style={s.card} onPress={() => router.push(`/item/${fav.id}?cat=${fav.cat}` as any)}>
            <Image source={{ uri: imgUrl(data.image) }} style={s.cardImg} />
            <View style={s.cardBody}>
              <View style={[s.catChip, { backgroundColor: CAT_COLOR[fav.cat] || Colors.PRIMARY }]}>
                <Text style={s.catChipTxt}>{t('cat.' + fav.cat).startsWith('cat.') ? ((lang === 'he' ? CAT_NAME[fav.cat] : (CAT_NAME_EN[fav.cat] || CAT_NAME[fav.cat])) || fav.cat) : t('cat.' + fav.cat)}</Text>
              </View>
              <Text style={s.cardName} numberOfLines={2}>{data.name}</Text>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', marginTop: 4 }}>
                {data.rating ? <Text style={s.rating}>⭐ {data.rating}</Text> : <Text> </Text>}
                {data.address ? <Text style={s.address} numberOfLines={1}>📍 {data.address}</Text> : null}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const makeStyles = (isRTL: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  brandBar: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', alignItems: 'center' },
  brandTxt: { fontSize: 22, fontWeight: '900', letterSpacing: -0.3 },
  header: { paddingHorizontal: 18, paddingTop: 10, paddingBottom: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EAE0CE' },
  title: { fontSize: 24, fontWeight: '400', letterSpacing: 0.3, color: '#1A4A5E', writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  subtitle: { color: Colors.MUTED, fontSize: 13, marginTop: 3, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  empty: { alignItems: 'center', padding: 60 },
  emptyTitle: { fontSize: 20, fontWeight: '600', letterSpacing: 0.2, color: Colors.TEXT, marginTop: 14, writingDirection: isRTL ? 'rtl' : 'ltr' },
  emptySub: { color: Colors.MUTED, fontSize: 14, textAlign: 'center', marginTop: 6, lineHeight: 20, writingDirection: isRTL ? 'rtl' : 'ltr' },
  card: { flexDirection: isRTL ? 'row-reverse' : 'row', backgroundColor: '#fff', borderRadius: 0, overflow: 'hidden', borderBottomWidth: 1, borderBottomColor: '#EAE0CE' },
  cardImg: { width: 110, height: 110 },
  cardBody: { flex: 1, paddingHorizontal: 16, paddingVertical: 14, justifyContent: 'center' },
  catChip: { alignSelf: 'flex-end', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 0, marginBottom: 7 },
  catChipTxt: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.2 },
  cardName: { fontWeight: '500', fontSize: 19, letterSpacing: 0.2, color: Colors.TEXT, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  rating: { color: Colors.GOLD, fontSize: 13, fontWeight: '700' },
  address: { color: Colors.MUTED, fontSize: 12, flex: 1, textAlign: 'left', marginRight: 8 },
});
