import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { CATALOG } from '../../data/catalog';

function imgUrl(img: string) {
  if (!img) return 'https://wellcomedubai.com/images/Yizhak/dubai-skyline-evening.jpg';
  if (img.startsWith('http')) return img;
  return 'https://wellcomedubai.com/' + img;
}

const CAT_NAME: Record<string, string> = {
  hotels: 'מלונות', restaurants: 'מסעדות', attractions: 'אטרקציות', shopping: 'קניות',
  nightlife: 'בילויים', kids: 'ילדים ומשפחות', transport: 'תחבורה', casino: 'בידור ומשחקים', abudhabi: 'אבו דאבי',
};

export default function ItemDetail() {
  const { id, cat } = useLocalSearchParams<{ id: string; cat: string }>();
  const list: any[] = (CATALOG as any)[cat || ''] || [];
  const item = list.find(i => String(i.id) === String(id));

  if (!item) {
    return (
      <SafeAreaView edges={['top']} style={s.container}>
        <View style={s.header}><Text style={s.title}>הפריט לא נמצא</Text></View>
      </SafeAreaView>
    );
  }

  const navUrl = item.lat ? `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}` : null;
  const mapUrl = item.lat ? `https://www.google.com/maps?q=${item.lat},${item.lng}` : null;
  const bookUrl = cat === 'hotels' ? `https://search.hotellook.com/hotels?destination=${encodeURIComponent((item.nameEn || item.name) + ' Dubai')}&adults=2&marker=X5SEJjUA` : null;
  const ticketsUrl = ['attractions','kids','nightlife','casino','abudhabi'].includes(cat || '') ? 'https://klook.tpk.lv/8HSINbXI' : null;

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#000' }}>
        <View style={s.headerOver}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Text style={{ color: '#fff', fontSize: 20 }}>←</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <Image source={{ uri: imgUrl(item.image) }} style={s.cover} />
        {item.kosher ? (
          <View style={s.kosherBadge}>
            <Text style={s.kosherText}>✡ מכבד כשרות</Text>
          </View>
        ) : null}

        <View style={s.body}>
          <Text style={s.catChip}>{CAT_NAME[cat || ''] || cat}</Text>
          <Text style={s.name}>{item.name}</Text>
          {item.nameEn ? <Text style={s.nameEn}>{item.nameEn}</Text> : null}

          <View style={s.metaRow}>
            {item.rating ? <View style={s.metaChip}><Text style={s.metaTxt}>⭐ {item.rating}</Text></View> : null}
            {item.price ? <View style={[s.metaChip, { backgroundColor: Colors.ACCENT + '20' }]}><Text style={[s.metaTxt, { color: Colors.ACCENT }]}>{item.price}</Text></View> : null}
            {item.stars ? <View style={[s.metaChip, { backgroundColor: Colors.GOLD + '20' }]}><Text style={[s.metaTxt, { color: '#92400e' }]}>{'⭐'.repeat(item.stars)}</Text></View> : null}
          </View>

          {item.description ? <Text style={s.desc}>{item.description}</Text> : null}

          {item.address ? (
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>📍 כתובת</Text>
              <Text style={s.infoVal}>{item.address}</Text>
            </View>
          ) : null}

          {item.priceRange ? (
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>💰 טווח מחירים</Text>
              <Text style={s.infoVal}>{item.priceRange}</Text>
            </View>
          ) : null}

          {item.phone ? (
            <View style={s.infoRow}>
              <Text style={s.infoLabel}>📞 טלפון</Text>
              <Text style={[s.infoVal, { color: Colors.PRIMARY }]} onPress={() => Linking.openURL(`tel:${item.phone}`)}>{item.phone}</Text>
            </View>
          ) : null}

          {item.tags && item.tags.length ? (
            <View style={s.tagsRow}>
              {item.tags.map((t: string, i: number) => (
                <View key={i} style={s.tag}><Text style={s.tagTxt}>{t}</Text></View>
              ))}
            </View>
          ) : null}

          <View style={s.actions}>
            {navUrl ? (
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: Colors.ACCENT }]} onPress={() => Linking.openURL(navUrl)}>
                <Text style={s.actionTxt}>🧭 נווט אליי</Text>
              </TouchableOpacity>
            ) : null}
            {mapUrl ? (
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: Colors.WARM }]} onPress={() => Linking.openURL(mapUrl)}>
                <Text style={s.actionTxt}>📍 איפה זה</Text>
              </TouchableOpacity>
            ) : null}
            {bookUrl ? (
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: Colors.SECONDARY }]} onPress={() => Linking.openURL(bookUrl)}>
                <Text style={s.actionTxt}>🛏 הזמן מלון</Text>
              </TouchableOpacity>
            ) : null}
            {ticketsUrl ? (
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: Colors.SECONDARY }]} onPress={() => Linking.openURL(ticketsUrl)}>
                <Text style={s.actionTxt}>🎫 רכוש כרטיסים</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {item.website ? (
            <TouchableOpacity style={s.websiteBtn} onPress={() => Linking.openURL(item.website)}>
              <Text style={s.websiteTxt}>🌐 לאתר הרשמי</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { padding: 14 },
  title: { color: Colors.TEXT, fontWeight: '900' },
  headerOver: { position: 'absolute', top: 0, right: 0, left: 0, padding: 12, zIndex: 10, flexDirection: 'row-reverse' },
  backBtn: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  cover: { width: '100%', height: 280, backgroundColor: '#E5E7EB' },
  kosherBadge: { position: 'absolute', top: 240, left: 14, backgroundColor: '#0E2A38', borderColor: Colors.GOLD, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  kosherText: { color: Colors.GOLD, fontSize: 12, fontWeight: '900' },
  body: { padding: 18 },
  catChip: { alignSelf: 'flex-end', backgroundColor: Colors.PRIMARY, color: '#fff', fontSize: 11, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, fontWeight: '800', writingDirection: 'rtl' },
  name: { fontSize: 22, fontWeight: '900', color: Colors.TEXT, marginTop: 10, writingDirection: 'rtl', textAlign: 'right' },
  nameEn: { color: Colors.MUTED, fontSize: 13, marginTop: 2, textAlign: 'right' },
  metaRow: { flexDirection: 'row-reverse', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  metaChip: { backgroundColor: Colors.GOLD + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  metaTxt: { color: '#92400e', fontWeight: '800', fontSize: 12 },
  desc: { color: Colors.TEXT, fontSize: 14, lineHeight: 22, marginTop: 14, writingDirection: 'rtl', textAlign: 'right' },
  infoRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F0E6D2' },
  infoLabel: { color: Colors.MUTED, fontSize: 12, fontWeight: '700' },
  infoVal: { color: Colors.TEXT, fontSize: 13, fontWeight: '700', flex: 1, textAlign: 'left', marginLeft: 12 },
  tagsRow: { flexDirection: 'row-reverse', gap: 6, marginTop: 14, flexWrap: 'wrap' },
  tag: { backgroundColor: '#FDF6EC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, borderWidth: 1, borderColor: '#E8DEC8' },
  tagTxt: { color: Colors.TEXT, fontSize: 11, fontWeight: '600' },
  actions: { flexDirection: 'row-reverse', gap: 8, marginTop: 18, flexWrap: 'wrap' },
  actionBtn: { flexGrow: 1, minWidth: '30%', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  actionTxt: { color: '#fff', fontWeight: '800', fontSize: 13 },
  websiteBtn: { marginTop: 12, padding: 12, borderWidth: 2, borderColor: Colors.PRIMARY, borderRadius: 10, alignItems: 'center' },
  websiteTxt: { color: Colors.PRIMARY, fontWeight: '800', fontSize: 14 },
});
