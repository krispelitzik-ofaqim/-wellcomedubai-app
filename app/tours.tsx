import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { useI18n } from '../constants/i18n';

const GYG_PARTNER = 'PE2GLSE3MAO4YDEIXLNOYXMC67BCZ32C';
const gyg = (q: string) => `https://www.getyourguide.com/s/?q=${encodeURIComponent(q)}&partner_id=${GYG_PARTNER}`;

const TOURS = [
  { key: 'safari',   labelKey: 'tours.safari',   icon: '🐪', color: '#B8923A', q: 'Dubai desert safari',
    img: 'https://wellcomedubai.com/images/Yizhak/dubai-skyline-evening.jpg' },
  { key: 'city',     labelKey: 'tours.city',     icon: '🏙️', color: '#1A6B8A', q: 'Dubai city tour',
    img: 'https://wellcomedubai.com/images/Yizhak/dubai-mall-dubai-uae.jpg' },
  { key: 'dhow',     labelKey: 'tours.dhow',     icon: '⛵', color: '#2A9D8F', q: 'Dubai dhow cruise dinner',
    img: 'https://wellcomedubai.com/images/Yizhak/portrait-woman-visiting-luxurious-city-dubai.jpg' },
  { key: 'hoho',     labelKey: 'tours.hoho',     icon: '🚌', color: '#E76F51', q: 'Dubai hop on hop off bus',
    img: 'https://wellcomedubai.com/images/Yizhak/tourism-family-dubai.jpg' },
  { key: 'abudhabi', labelKey: 'tours.abudhabi', icon: '🕌', color: '#B85C8E', q: 'Abu Dhabi day trip from Dubai',
    img: 'https://wellcomedubai.com/images/Yizhak/archs-shekh-zayed-grand-mosque-reflect-water-before-it.jpg' },
  { key: 'heli',     labelKey: 'tours.heli',     icon: '🚁', color: '#F4A261', q: 'Dubai helicopter tour',
    img: 'https://wellcomedubai.com/images/wellcomedubai.stamp/skyscrapers-looking-up-sky-modern-metropolis-modern-city.jpg' },
];

export default function ToursScreen() {
  const { t, isRTL } = useI18n();
  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.SECONDARY }}>
        <View style={[s.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/'); }} style={s.back}>
            <Text style={s.backTxt}>{isRTL ? '›' : '‹'}</Text>
          </TouchableOpacity>
          <Text style={[s.hTitle, { flex: 1, textAlign: isRTL ? 'right' : 'left' }]}>{t('market.tours')}</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={s.grid}>
        {TOURS.map(tour => (
          <TouchableOpacity key={tour.key} activeOpacity={0.9} style={s.tile} onPress={() => Linking.openURL(gyg(tour.q))}>
            <ImageBackground source={{ uri: tour.img }} style={{ flex: 1 }} imageStyle={{ borderRadius: 16 }}>
              <View style={[s.overlay, { backgroundColor: tour.color + 'C0' }]}>
                <Text style={s.icon}>{tour.icon}</Text>
                <Text style={s.label} numberOfLines={2}>{t(tour.labelKey)}</Text>
              </View>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: '#fff', fontSize: 30, fontWeight: '300', marginTop: -4 },
  hTitle: { color: '#fff', fontSize: 21, fontWeight: '900' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 14, gap: 14 },
  tile: { width: '47%', aspectRatio: 1, borderRadius: 16, overflow: 'hidden', marginBottom: 4, backgroundColor: '#ccc' },
  overlay: { flex: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center', padding: 10, gap: 6 },
  icon: { fontSize: 40 },
  label: { color: '#fff', fontSize: 15, fontWeight: '900', textAlign: 'center', textShadowColor: 'rgba(0,0,0,0.45)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
});
