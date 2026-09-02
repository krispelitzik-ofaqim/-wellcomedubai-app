import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { useI18n } from '../constants/i18n';

const TILES = [
  { key: 'tickets',  labelKey: 'market.tickets', icon: '🎟️', color: '#E76F51', route: '/tickets',
    img: 'https://wellcomedubai.com/images/Yizhak/dubai-mall-dubai-uae.jpg' },
  { key: 'adTickets', labelKey: 'market.adTickets', icon: '🎡', color: '#B85C8E', route: '/tickets?cat=abudhabi',
    img: 'https://wellcomedubai.com/images/Yizhak/archs-shekh-zayed-grand-mosque-reflect-water-before-it.jpg' },
  { key: 'tours',    labelKey: 'market.tours', icon: '🧭', color: '#2A9D8F', route: '/tours',
    img: 'https://wellcomedubai.com/images/Yizhak/tourism-family-dubai.jpg' },
  { key: 'events',   labelKey: 'market.events', icon: '🎤', color: '#7B4FA0', route: 'https://www.getyourguide.com/s/?q=Dubai%20events%20shows&partner_id=PE2GLSE3MAO4YDEIXLNOYXMC67BCZ32C',
    img: 'https://wellcomedubai.com/images/Yizhak/2.jpg' },
  { key: 'transfers', labelKey: 'market.transfers', icon: '🚐', color: '#5B9DC7', route: 'https://www.getyourguide.com/s/?q=Dubai%20private%20airport%20transfer%20car&partner_id=PE2GLSE3MAO4YDEIXLNOYXMC67BCZ32C',
    img: 'https://wellcomedubai.com/images/Yizhak/3.jpg' },
  { key: 'lounge',   labelKey: 'market.lounge', icon: '🛋️', color: '#9C6B3F', route: 'https://www.getyourguide.com/s/?q=Dubai%20airport%20lounge%20access&partner_id=PE2GLSE3MAO4YDEIXLNOYXMC67BCZ32C',
    img: 'https://wellcomedubai.com/images/Yizhak/dubai-skyline-evening.jpg' },
  { key: 'car',      labelKey: 'market.car', icon: '🚗', color: '#C1440E', route: 'https://klook.tpk.lv/8HSINbXI',
    img: 'https://wellcomedubai.com/images/Yizhak/4.jpg' },
  { key: 'esim',     labelKey: 'market.esim', icon: '📶', color: '#3AA0A0', route: 'https://klook.tpk.lv/8HSINbXI',
    img: 'https://wellcomedubai.com/images/Yizhak/5.jpg' },
  { key: 'insurance', labelKey: 'market.insurance', icon: '🛡️', color: '#6B8E5A', route: 'https://klook.tpk.lv/8HSINbXI',
    img: 'https://wellcomedubai.com/images/Yizhak/dubai-skyline-evening.jpg' },
  { key: 'dining',   labelKey: 'market.dining', icon: '🍽️', color: '#C77C3B', route: 'https://www.getyourguide.com/s/?q=Dubai%20dining%20experience%20brunch%20dinner%20cruise&partner_id=PE2GLSE3MAO4YDEIXLNOYXMC67BCZ32C',
    img: 'https://wellcomedubai.com/images/Yizhak/tourism-family-dubai.jpg' },
  { key: 'coupons',  labelKey: 'market.coupons', icon: '🏷️', color: '#F4A261', route: '/coupons',
    img: 'https://wellcomedubai.com/images/Yizhak/economy-uae-currency.jpg' },
  { key: 'forSale',  labelKey: 'market.forSale', icon: '🔑', color: '#1A6B8A', route: '/realestate?tab=sale',
    img: 'https://wellcomedubai.com/images/wellcomedubai.stamp/skyscrapers-looking-up-sky-modern-metropolis-modern-city.jpg' },
  { key: 'forRent',  labelKey: 'market.forRent', icon: '🏠', color: '#7FA77F', route: '/realestate?tab=rent',
    img: 'https://wellcomedubai.com/images/Yizhak/portrait-woman-visiting-luxurious-city-dubai.jpg' },
];

export default function MarketScreen() {
  const { t, isRTL } = useI18n();
  return (
    <View style={s.container}>
      <ImageBackground source={{ uri: 'https://wellcomedubai.com/images/Yizhak/market-souk-banner.jpg' }} resizeMode="cover" style={s.hero}>
        <View style={s.heroOverlay}>
          <SafeAreaView edges={['top']}>
            <View style={[s.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/'); }} style={s.back}>
                <Text style={s.backTxt}>{isRTL ? '›' : '‹'}</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={[s.hTitle, { textAlign: isRTL ? 'right' : 'left' }]}>{t('market.title')}</Text>
                <Text style={[s.hSub, { textAlign: isRTL ? 'right' : 'left' }]}>{t('market.sub')}</Text>
                <Text style={[s.hIntro, { textAlign: isRTL ? 'right' : 'left' }]}>{t('market.intro')}</Text>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>

      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {TILES.map(tile => (
          <TouchableOpacity key={tile.key} activeOpacity={0.9} style={s.row} onPress={() => (tile.route.startsWith('http') ? Linking.openURL(tile.route) : router.push(tile.route as any))}>
            <ImageBackground source={{ uri: tile.img }} resizeMode="cover" style={{ flex: 1 }} imageStyle={{ resizeMode: 'cover' }}>
              {/* dimmed color on the text side (~2/3), clear image on the other side (~1/3) */}
              <LinearGradient
                colors={[tile.color + 'F0', tile.color + 'E6', tile.color + '00']}
                locations={[0, 0.6, 1]}
                start={{ x: isRTL ? 1 : 0, y: 0.5 }}
                end={{ x: isRTL ? 0 : 1, y: 0.5 }}
                style={[s.rowOverlay, { alignItems: isRTL ? 'flex-end' : 'flex-start' }]}
              >
                <View style={[s.rowContent, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <Text style={s.icon}>{tile.icon}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[s.label, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{t(tile.labelKey)}</Text>
                    <Text style={[s.subLabel, { textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>{t(`market.${tile.key}Sub`)}</Text>
                  </View>
                </View>
              </LinearGradient>
            </ImageBackground>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  hero: { width: '100%' },
  heroOverlay: { backgroundColor: 'rgba(0,0,0,0.42)' },
  header: { alignItems: 'center', paddingHorizontal: 14, paddingBottom: 18, paddingTop: 6, gap: 10 },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: '#fff', fontSize: 30, fontWeight: '300', marginTop: -4 },
  hTitle: { color: '#fff', fontSize: 34, fontWeight: '400', letterSpacing: 0.3 },
  hSub: { color: 'rgba(255,255,255,0.95)', fontSize: 14, fontWeight: '700', marginTop: 4 },
  hIntro: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 3, lineHeight: 17 },
  row: { width: '100%', height: 120, backgroundColor: '#ccc', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.55)' },
  rowOverlay: { flex: 1, justifyContent: 'center' },
  rowContent: { alignItems: 'center', gap: 12, paddingHorizontal: 18, width: '66%' },
  icon: { fontSize: 34 },
  label: { color: '#fff', fontSize: 23, fontWeight: '500', letterSpacing: 0.2, textShadowColor: 'rgba(0,0,0,0.4)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },
  subLabel: { color: 'rgba(255,255,255,0.92)', fontSize: 12.5, fontWeight: '600', marginTop: 3, textShadowColor: 'rgba(0,0,0,0.35)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 2 },
});
