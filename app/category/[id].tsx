import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { CATALOG } from '../../data/catalog';

const TITLES: Record<string, { he: string; emoji: string; color: string }> = {
  hotels:      { he: 'מלונות',          emoji: '🏨', color: Colors.GOLD },
  attractions: { he: 'אטרקציות',      emoji: '🎡', color: Colors.SECONDARY },
  restaurants: { he: 'מסעדות',         emoji: '🍽️', color: Colors.WARM },
  shopping:    { he: 'קניות',           emoji: '🛍️', color: Colors.WARM },
  nightlife:   { he: 'בילויים',         emoji: '🍻', color: Colors.PINK },
  transport:   { he: 'תחבורה',          emoji: '🚕', color: Colors.PRIMARY },
  kids:        { he: 'ילדים ומשפחות', emoji: '👨‍👩‍👧', color: Colors.ACCENT },
  casino:      { he: 'בידור ומשחקים', emoji: '🎰', color: Colors.GOLD },
  abudhabi:    { he: 'אבו דאבי',        emoji: '🏛', color: Colors.PINK },
};

const FILTERS: Record<string, { label: string; key: string }[]> = {
  hotels:      [{label:'הכל',key:'all'},{label:'יוקרה',key:'7star'},{label:'תקציב גבוה',key:'5star'},{label:'תקציב בינוני',key:'4-5star'},{label:'סביר',key:'3-4star'},{label:'תקציב צנוע',key:'budget'}],
  attractions: [{label:'הכל',key:'all'},{label:'חובה',key:'landmark'},{label:'מוזיאון',key:'museum'},{label:'אומנות',key:'art'},{label:'אקסטרים',key:'extreme'},{label:'חוף',key:'beach'},{label:'פארק מים',key:'waterpark'},{label:'פארק שעשועים',key:'theme-park'},{label:'סיור',key:'tour'},{label:'גן חיות',key:'zoo'},{label:'ספארי',key:'desert'},{label:'יהדות',key:'judaism'},{label:'ספורט',key:'sport'},{label:'אקווריום',key:'aquarium'},{label:'מופע',key:'show'},{label:'הרפתקה',key:'adventure'}],
  restaurants: [{label:'הכל',key:'all'},{label:'יוקרה',key:'ultra-luxury'},{label:'ישראלי',key:'israeli'},{label:'אסיאתי',key:'asian'},{label:'הודי',key:'indian'},{label:'איטלקי',key:'italian'},{label:'טורקי',key:'turkish'},{label:'מקומי',key:'local'},{label:'רחוב',key:'street'},{label:'דגים',key:'seafood'},{label:'סטייקייה',key:'steakhouse'},{label:'טבעוני',key:'vegan'}],
  shopping:    [{label:'הכל',key:'all'},{label:'קניון',key:'mall'},{label:'שוק',key:'souk'}],
  nightlife:   [{label:'הכל',key:'all'},{label:'בר',key:'bar'},{label:'מועדון',key:'club'},{label:'אלכוהול',key:'alcohol'}],
  transport:   [{label:'הכל',key:'all'},{label:'מטרו',key:'metro'},{label:'מונית',key:'taxi'},{label:'השכרה',key:'rental'}],
  kids:        [{label:'הכל',key:'all'}],
  casino:      [{label:'הכל',key:'all'},{label:'קזינו',key:'casino'},{label:'מרוצים',key:'racing'},{label:'ספורט',key:'sport'},{label:'הופעות',key:'music-show'}],
  abudhabi:    [{label:'הכל',key:'all'}],
};

function imgUrl(item: any) {
  const img = item.image || '';
  if (!img) return '';
  if (img.startsWith('http')) return img;
  return 'https://wellcomedubai.com/' + img;
}

export default function CategoryScreen() {
  const { id, id: itemIdParam } = useLocalSearchParams<{ id: string }>();
  const cat = id || '';
  const meta = TITLES[cat] || { he: 'קטגוריה', emoji: '📂', color: Colors.PRIMARY };
  const items: any[] = (CATALOG as any)[cat] || [];
  const filters = FILTERS[cat] || [{ label: 'הכל', key: 'all' }];
  const [active, setActive] = useState('all');

  const sorted = [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const list = active === 'all' ? sorted : sorted.filter(it => it.subcategory === active);

  return (
    <SafeAreaView edges={['top']} style={s.container}>
      <View style={[s.header, { backgroundColor: meta.color }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={{ fontSize: 22, color: '#fff' }}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>{meta.emoji} {meta.he}</Text>
        <View style={s.countBadge}><Text style={[s.countTxt, { color: meta.color }]}>{items.length}</Text></View>
      </View>

      {/* Filter tabs */}
      {filters.length > 1 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterStrip} contentContainerStyle={{ paddingHorizontal: 14, gap: 18 }}>
          {filters.map(f => {
            const isActive = active === f.key;
            return (
              <TouchableOpacity key={f.key} onPress={() => setActive(f.key)} style={[s.filterTab, isActive && { borderBottomColor: Colors.GOLD }]}>
                <Text style={[s.filterText, isActive && s.filterActive]}>{f.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 60 }}>
        {list.length === 0 ? (
          <Text style={{ textAlign: 'center', color: Colors.MUTED, marginTop: 20 }}>אין פריטים בקטגוריה זו</Text>
        ) : list.map(item => (
          <TouchableOpacity key={item.id} activeOpacity={0.85} style={s.card} onPress={() => router.push(`/item/${item.id}?cat=${cat}` as any)}>
            <View style={{ position: 'relative' }}>
              {imgUrl(item) ? (
                <Image source={{ uri: imgUrl(item) }} style={s.cardImg} />
              ) : (
                <View style={[s.cardImg, { backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ fontSize: 36 }}>{meta.emoji}</Text>
                </View>
              )}
              {item.kosher ? (
                <View style={s.kosherBadge}>
                  <Text style={s.kosherText}>✡ מכבד כשרות</Text>
                </View>
              ) : null}
            </View>
            <View style={s.cardBody}>
              <View style={s.cardHead}>
                <Text style={s.cardTitle} numberOfLines={1}>{item.name}</Text>
                {item.rating ? <View style={s.ratingBadge}><Text style={s.ratingTxt}>⭐ {item.rating}</Text></View> : null}
              </View>
              {item.description ? <Text style={s.cardDesc} numberOfLines={2}>{item.description}</Text> : null}
              <View style={s.cardFooter}>
                {item.priceRange ? <Text style={s.priceTxt}>{item.priceRange}</Text> : null}
                {item.address ? <Text style={s.addrTxt} numberOfLines={1}>📍 {item.address}</Text> : null}
              </View>
              {(item.lat || item.phone) ? (
                <View style={s.actions}>
                  {item.lat ? (
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: Colors.ACCENT }]} onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}`)}>
                      <Text style={s.actionTxt}>🧭 נווט</Text>
                    </TouchableOpacity>
                  ) : null}
                  {item.lat ? (
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: Colors.WARM }]} onPress={() => Linking.openURL(`https://www.google.com/maps?q=${item.lat},${item.lng}`)}>
                      <Text style={s.actionTxt}>📍 איפה</Text>
                    </TouchableOpacity>
                  ) : null}
                  {cat === 'hotels' ? (
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: Colors.SECONDARY }]} onPress={() => Linking.openURL(`https://search.hotellook.com/hotels?destination=${encodeURIComponent((item.nameEn || item.name) + ' Dubai')}&adults=2&marker=X5SEJjUA`)}>
                      <Text style={s.actionTxt}>🛏 הזמן</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  back: { padding: 4 },
  title: { flex: 1, color: '#fff', fontSize: 17, fontWeight: '900', writingDirection: 'rtl' },
  countBadge: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  countTxt: { fontSize: 12, fontWeight: '900' },
  filterStrip: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', paddingVertical: 8, flexGrow: 0 },
  filterTab: { paddingVertical: 6, paddingHorizontal: 0, borderBottomWidth: 1.5, borderBottomColor: 'transparent' },
  filterText: { fontSize: 13, fontWeight: '500', color: '#9CA3AF' },
  filterActive: { fontWeight: '900', color: Colors.TEXT },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  cardImg: { width: '100%', height: 160 },
  cardBody: { padding: 12 },
  cardHead: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '900', color: Colors.TEXT, writingDirection: 'rtl', textAlign: 'right' },
  ratingBadge: { backgroundColor: Colors.GOLD + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  ratingTxt: { fontSize: 11, fontWeight: '800', color: '#92400e' },
  cardDesc: { fontSize: 12, color: Colors.MUTED, marginTop: 4, lineHeight: 17, writingDirection: 'rtl', textAlign: 'right' },
  cardFooter: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, gap: 8 },
  priceTxt: { fontSize: 11, color: Colors.ACCENT, fontWeight: '800' },
  addrTxt: { flex: 1, fontSize: 11, color: Colors.MUTED, writingDirection: 'rtl', textAlign: 'left' },
  kosherBadge: { position: 'absolute', bottom: 8, left: 8, backgroundColor: '#0E2A38', borderColor: Colors.GOLD, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  kosherText: { color: Colors.GOLD, fontSize: 11, fontWeight: '900' },
  actions: { flexDirection: 'row-reverse', gap: 6, marginTop: 10 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  actionTxt: { color: '#fff', fontSize: 11, fontWeight: '800' },
});
