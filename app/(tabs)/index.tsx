import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ImageBackground } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

const CATEGORIES = [
  { id: 'hotels',      title: 'מלונות',           icon: '🏨', color: Colors.PRIMARY },
  { id: 'attractions', title: 'אטרקציות',        icon: '🎡', color: Colors.WARM },
  { id: 'restaurants', title: 'מסעדות',          icon: '🍽️', color: Colors.ACCENT },
  { id: 'shopping',    title: 'קניות',           icon: '🛍️', color: Colors.PINK },
  { id: 'nightlife',   title: 'בילויים',         icon: '🍻', color: '#9333EA' },
  { id: 'transport',   title: 'תחבורה',          icon: '🚕', color: Colors.SECONDARY },
];

export default function Home() {
  return (
    <SafeAreaView edges={['top']} style={s.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={s.hero}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&q=80' }}
            style={s.heroBg}
            imageStyle={{ borderBottomLeftRadius: 18, borderBottomRightRadius: 18 }}
          >
            <View style={s.heroOverlay}>
              <Text style={s.heroKicker}>WELLCOME DUBAI</Text>
              <Text style={s.heroTitle}>המדריך לתייר הישראלי בדובאי</Text>
              <Text style={s.heroSub}>מלונות · אטרקציות · מסעדות · נדל"ן · ועוד</Text>
            </View>
          </ImageBackground>
        </View>

        <View style={s.grid}>
          {CATEGORIES.map(c => (
            <TouchableOpacity
              key={c.id}
              activeOpacity={0.85}
              style={[s.card, { backgroundColor: '#fff', borderColor: c.color + '33' }]}
              onPress={() => router.push(`/category/${c.id}` as any)}
            >
              <View style={[s.cardIcon, { backgroundColor: c.color + '15' }]}>
                <Text style={{ fontSize: 32 }}>{c.icon}</Text>
              </View>
              <Text style={[s.cardTitle, { color: c.color }]}>{c.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity activeOpacity={0.9} style={s.realestateBanner} onPress={() => router.push('/realestate' as any)}>
          <ImageBackground
            source={{ uri: 'https://images.unsplash.com/photo-1582407947092-45795aba4166?w=1200&q=80' }}
            style={{ flex: 1 }}
            imageStyle={{ borderRadius: 14 }}
          >
            <View style={s.realestateOverlay}>
              <Text style={s.realestateKicker}>DUBAI REAL ESTATE</Text>
              <Text style={s.realestateTitle}>פורטל הנדל"ן בדובאי</Text>
              <Text style={s.realestateSub}>מאמרים · מודעות · מתווכים · השקעות</Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  hero: { height: 200, marginBottom: 16 },
  heroBg: { flex: 1, justifyContent: 'flex-end' },
  heroOverlay: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 16, borderBottomLeftRadius: 18, borderBottomRightRadius: 18 },
  heroKicker: { color: '#E9C46A', fontSize: 11, letterSpacing: 1.5, fontWeight: '800' },
  heroTitle: { color: '#fff', fontSize: 19, fontWeight: '900', marginTop: 4, textAlign: 'right', writingDirection: 'rtl' },
  heroSub: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 4, textAlign: 'right', writingDirection: 'rtl' },
  grid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12, paddingHorizontal: 14 },
  card: { width: '47%', minHeight: 110, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  cardIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 15, fontWeight: '800', writingDirection: 'rtl' },
  realestateBanner: { height: 130, marginHorizontal: 14, marginTop: 18, borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
  realestateOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 16, borderRadius: 14 },
  realestateKicker: { color: '#E9C46A', fontSize: 11, letterSpacing: 1.8, fontWeight: '700' },
  realestateTitle: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 5 },
  realestateSub: { color: 'rgba(255,255,255,0.95)', fontSize: 13, marginTop: 6, fontWeight: '500' },
});
