import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, router } from 'expo-router';
import { Colors } from '../../constants/colors';
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

const CAT_COLOR: Record<string, string> = {
  hotels: Colors.GOLD, restaurants: Colors.WARM, attractions: Colors.SECONDARY,
  shopping: Colors.WARM, nightlife: Colors.PINK, kids: Colors.ACCENT,
  transport: Colors.PRIMARY, casino: Colors.GOLD, abudhabi: Colors.PINK,
};

export default function FavoritesScreen() {
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
    <SafeAreaView edges={['top']} style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>❤️ המועדפים שלי</Text>
        <Text style={s.subtitle}>{items.length} פריטים</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 60 }}>
        {items.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 56 }}>🤍</Text>
            <Text style={s.emptyTitle}>עדיין לא שמרת מועדפים</Text>
            <Text style={s.emptySub}>לחץ על הלב בכל פריט כדי לשמור אותו כאן</Text>
          </View>
        ) : items.map(({ fav, data }) => (
          <TouchableOpacity key={fav.cat + fav.id} activeOpacity={0.85} style={s.card} onPress={() => router.push(`/item/${fav.id}?cat=${fav.cat}` as any)}>
            <Image source={{ uri: imgUrl(data.image) }} style={s.cardImg} />
            <View style={s.cardBody}>
              <View style={[s.catChip, { backgroundColor: CAT_COLOR[fav.cat] || Colors.PRIMARY }]}>
                <Text style={s.catChipTxt}>{CAT_NAME[fav.cat] || fav.cat}</Text>
              </View>
              <Text style={s.cardName} numberOfLines={2}>{data.name}</Text>
              <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 4 }}>
                {data.rating ? <Text style={s.rating}>⭐ {data.rating}</Text> : <Text> </Text>}
                {data.address ? <Text style={s.address} numberOfLines={1}>📍 {data.address}</Text> : null}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8DEC8' },
  title: { fontSize: 18, fontWeight: '900', color: '#1A4A5E', writingDirection: 'rtl', textAlign: 'right' },
  subtitle: { color: Colors.MUTED, fontSize: 12, marginTop: 2, writingDirection: 'rtl', textAlign: 'right' },
  empty: { alignItems: 'center', padding: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: Colors.TEXT, marginTop: 14, writingDirection: 'rtl' },
  emptySub: { color: Colors.MUTED, fontSize: 13, textAlign: 'center', marginTop: 6, writingDirection: 'rtl' },
  card: { flexDirection: 'row-reverse', backgroundColor: '#fff', borderRadius: 10, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#E8DEC8' },
  cardImg: { width: 110, height: 110 },
  cardBody: { flex: 1, padding: 12 },
  catChip: { alignSelf: 'flex-end', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginBottom: 6 },
  catChipTxt: { color: '#fff', fontSize: 10, fontWeight: '800' },
  cardName: { fontWeight: '900', color: Colors.TEXT, fontSize: 14, writingDirection: 'rtl', textAlign: 'right' },
  rating: { color: Colors.GOLD, fontSize: 12, fontWeight: '800' },
  address: { color: Colors.MUTED, fontSize: 11, flex: 1, textAlign: 'left', marginRight: 8 },
});
