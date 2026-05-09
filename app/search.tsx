import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { CATALOG } from '../data/catalog';

function imgUrl(img: string) {
  if (!img) return 'https://wellcomedubai.com/images/Yizhak/dubai-skyline-evening.jpg';
  if (img.startsWith('http')) return img;
  return 'https://wellcomedubai.com/' + img;
}

const CAT_NAME: Record<string, string> = {
  hotels: 'מלונות', restaurants: 'מסעדות', attractions: 'אטרקציות', shopping: 'קניות',
  nightlife: 'בילויים', kids: 'ילדים', transport: 'תחבורה', casino: 'בידור', abudhabi: 'אבו דאבי',
};

export default function SearchScreen() {
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
    <SafeAreaView edges={['top']} style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={{ fontSize: 22, color: '#fff' }}>←</Text>
        </TouchableOpacity>
        <View style={s.searchBar}>
          <Text style={{ fontSize: 16 }}>🔍</Text>
          <TextInput
            value={q}
            onChangeText={setQ}
            placeholder="חפש מלון, אטרקציה, מסעדה..."
            placeholderTextColor="#9CA3AF"
            style={s.input}
            autoFocus
          />
          {q ? (
            <TouchableOpacity onPress={() => setQ('')}>
              <Text style={{ fontSize: 18, color: Colors.MUTED }}>×</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 60 }}>
        {!q.trim() ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 56 }}>🔍</Text>
            <Text style={s.emptyTitle}>הקלד מילת חיפוש</Text>
            <Text style={s.emptySub}>חפש לפי שם, תיאור, תגית או אזור</Text>
          </View>
        ) : results.length === 0 ? (
          <View style={s.empty}>
            <Text style={{ fontSize: 40 }}>🤷</Text>
            <Text style={s.emptyTitle}>אין תוצאות עבור "{q}"</Text>
          </View>
        ) : (
          <>
            <Text style={s.resultsCount}>{results.length} תוצאות</Text>
            {results.map(item => (
              <TouchableOpacity key={item._cat + item.id} style={s.row} onPress={() => router.push(`/item/${item.id}?cat=${item._cat}` as any)}>
                <Image source={{ uri: imgUrl(item.image) }} style={s.img} />
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={s.name} numberOfLines={1}>{item.name}</Text>
                  <Text style={s.cat}>{CAT_NAME[item._cat]}{item.address ? ' · ' + item.address : ''}</Text>
                </View>
                {item.rating ? <Text style={s.rating}>⭐ {item.rating}</Text> : null}
              </TouchableOpacity>
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, backgroundColor: Colors.PRIMARY, gap: 8 },
  back: { padding: 4 },
  searchBar: { flex: 1, flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#fff', borderRadius: 22, paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
  input: { flex: 1, fontSize: 14, color: Colors.TEXT, writingDirection: 'rtl', textAlign: 'right' },
  empty: { alignItems: 'center', padding: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '900', color: Colors.TEXT, marginTop: 12, writingDirection: 'rtl' },
  emptySub: { color: Colors.MUTED, fontSize: 13, marginTop: 4, textAlign: 'center', writingDirection: 'rtl' },
  resultsCount: { color: Colors.MUTED, fontSize: 12, marginBottom: 10, paddingHorizontal: 4 },
  row: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E8DEC8' },
  img: { width: 60, height: 60, borderRadius: 8 },
  name: { fontWeight: '800', color: Colors.TEXT, fontSize: 14, writingDirection: 'rtl', textAlign: 'right' },
  cat: { color: Colors.MUTED, fontSize: 11, marginTop: 3, writingDirection: 'rtl', textAlign: 'right' },
  rating: { color: Colors.GOLD, fontWeight: '800', fontSize: 12 },
});
