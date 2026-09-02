import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from '../components/WebView';
import { CATALOG } from '../data/catalog';
import { Colors } from '../constants/colors';
import { useI18n } from '../constants/i18n';
import { tcRu } from '../constants/contentRu';
import { tcHi } from '../constants/contentHi';
import { tcAr } from '../constants/contentAr';

const NEAR_CATS = [
  { key: 'restaurants', label: 'מסעדות', labelEn: 'Restaurants', color: '#F4A261', icon: '🍽️' },
  { key: 'attractions', label: 'אטרקציות', labelEn: 'Attractions', color: '#2A9D8F', icon: '🏛️' },
  { key: 'shopping',    label: 'קניות',    labelEn: 'Shopping',    color: '#F4A261', icon: '🛍️' },
  { key: 'nightlife',   label: 'בילויים',  labelEn: 'Nightlife',  color: '#B85C8E', icon: '🥂' },
  { key: 'kids',        label: 'ילדים',    labelEn: 'Kids',    color: '#E76F51', icon: '🧸' },
  { key: 'hotels',      label: 'מלונות',   labelEn: 'Hotels',   color: '#B8923A', icon: '🏨' },
];

function imgUrl(item: any) {
  const img = item.image || '';
  if (!img) return '';
  if (img.startsWith('http')) return img;
  return 'https://wellcomedubai.com/' + img;
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

type Coords = { lat: number; lng: number };

export default function NearMeScreen() {
  const { t, lang } = useI18n();
  const isRTL = lang === 'he' || lang === 'ar';
  const dir = { textAlign: (isRTL ? 'right' : 'left') as 'right' | 'left', writingDirection: (isRTL ? 'rtl' : 'ltr') as 'rtl' | 'ltr' };
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const requestLocation = async () => {
    setLoading(true); setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError(t('near.permMsg'));
        setLoading(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    } catch (e: any) {
      setError(t('near.errTitle'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { requestLocation(); }, []);

  const sections = useMemo(() => {
    if (!coords) return [];
    return NEAR_CATS.map(cat => {
      const items = ((CATALOG as any)[cat.key] || [])
        .filter((it: any) => it.lat && it.lng)
        .map((it: any) => ({ ...it, _dist: haversineKm(coords.lat, coords.lng, it.lat, it.lng) }))
        .sort((a: any, b: any) => a._dist - b._dist)
        .slice(0, 5);
      return { ...cat, items };
    }).filter(s => s.items.length > 0);
  }, [coords]);

  const mapHtml = useMemo(() => {
    if (!coords) return '';
    const markers: any[] = [];
    sections.forEach(sec => {
      sec.items.forEach((it: any) => {
        markers.push({ lat: it.lat, lng: it.lng, name: it.name, color: sec.color, dist: it._dist.toFixed(2) });
      });
    });
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#m{margin:0;padding:0;height:100%;width:100%;}</style></head><body><div id="m"></div><script>function init(){const map=new google.maps.Map(document.getElementById('m'),{center:{lat:${coords.lat},lng:${coords.lng}},zoom:13,mapTypeControl:false,streetViewControl:false,fullscreenControl:false,gestureHandling:'cooperative'});new google.maps.Marker({position:{lat:${coords.lat},lng:${coords.lng}},map,title:'${lang === 'ar' ? tcAr('אני כאן') : lang === 'hi' ? tcHi('אני כאן') : lang === 'ru' ? tcRu('אני כאן') : lang === 'en' ? 'You are here' : 'אני כאן'}',icon:{path:google.maps.SymbolPath.CIRCLE,scale:11,fillColor:'#1A6B8A',fillOpacity:1,strokeColor:'#fff',strokeWeight:3}});const pts=${JSON.stringify(markers)};pts.forEach(p=>{const m=new google.maps.Marker({position:{lat:p.lat,lng:p.lng},map,icon:{path:google.maps.SymbolPath.CIRCLE,scale:7,fillColor:p.color,fillOpacity:1,strokeColor:'#fff',strokeWeight:2}});const iw=new google.maps.InfoWindow({content:'<div style="direction:rtl;font-family:-apple-system,sans-serif;"><b>'+p.name+'</b><br><span style="color:#E76F51;">'+p.dist+' ${lang === 'ar' ? tcAr('ק"מ') : lang === 'hi' ? tcHi('ק"מ') : lang === 'ru' ? tcRu('ק"מ') : lang === 'en' ? 'km' : 'ק"מ'}</span></div>'});m.addListener('click',()=>iw.open({anchor:m,map}));});}</script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDw09Bg7XaH7apEWJBcFtogVfrdUwF_gEM&language=${lang}&callback=init" async defer></script></body></html>`;
  }, [coords, sections]);

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#2C5F6E' }} />
      <LinearGradient colors={['#2C5F6E', '#2A9D8F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[s.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Text style={s.headerIcon}>📍</Text>
        <View style={{ flex: 1 }}>
          <Text style={[s.headerTitle, dir]}>{t('near.title')}</Text>
          <Text style={[s.headerSub, dir]}>{t('near.sub')}</Text>
        </View>
        <TouchableOpacity onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/'); }} style={s.closeBtn}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>✕</Text>
        </TouchableOpacity>
      </LinearGradient>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={Colors.ACCENT} />
          <Text style={s.centerTxt}>{t('near.locating')}</Text>
        </View>
      ) : error ? (
        <View style={s.center}>
          <Text style={s.errIcon}>📵</Text>
          <Text style={s.errTitle}>{t('near.errTitle')}</Text>
          <Text style={s.errSub}>{error}</Text>
          <TouchableOpacity onPress={requestLocation} style={s.retry}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : coords ? (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          <View style={s.mapWrap}>
            <WebView originWhitelist={['*']} source={{ html: mapHtml }} style={{ flex: 1 }} scrollEnabled={false} />
          </View>

          {sections.map(sec => {
            const visible = expanded[sec.key] ? sec.items : sec.items.slice(0, 2);
            const hiddenCount = sec.items.length - visible.length;
            return (
              <View key={sec.key} style={{ marginTop: 18 }}>
                <View style={[s.sectionHead, { backgroundColor: sec.color + '12', borderRightColor: sec.color }]}>
                  <Text style={[s.sectionTitle, dir, { color: sec.color }]}>{sec.icon} {t('cat.' + sec.key).startsWith('cat.') ? (lang === 'ar' ? tcAr(sec.label) : lang === 'hi' ? tcHi(sec.label) : lang === 'ru' ? tcRu(sec.label) : lang === 'he' ? sec.label : (sec.labelEn || sec.label)) : t('cat.' + sec.key)}</Text>
                </View>
                <View style={{ marginTop: 8 }}>
                  {visible.map((it: any) => (
                    <TouchableOpacity key={it.id} onPress={() => router.push(`/item/${it.id}?cat=${sec.key}` as any)} style={[s.row, { flexDirection: isRTL ? 'row-reverse' : 'row', borderRightWidth: isRTL ? 4 : 0, borderLeftWidth: isRTL ? 0 : 4, borderRightColor: sec.color, borderLeftColor: sec.color }]}>
                      {imgUrl(it) ? <Image source={{ uri: imgUrl(it) }} style={s.thumb} /> : <View style={[s.thumb, { backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }]}><Text style={{ fontSize: 26 }}>{sec.icon}</Text></View>}
                      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 12 }}>
                        <Text style={[s.rowName, dir]} numberOfLines={1}>{lang !== 'he' ? (it.nameEn || it.name) : it.name}</Text>
                        {it.address ? <Text style={[s.rowAddr, dir]} numberOfLines={1}>📍 {it.address}</Text> : null}
                        <View style={[s.distChip, { backgroundColor: sec.color }]}>
                          <Text style={s.distTxt}>{it._dist.toFixed(1)} {t('common.km')}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                  {hiddenCount > 0 && (
                    <TouchableOpacity onPress={() => setExpanded(prev => ({ ...prev, [sec.key]: true }))} style={[s.moreBtn, { borderColor: sec.color }]}>
                      <Text style={[s.moreTxt, { color: sec.color }]}>{lang === 'ar' ? tcAr(`עוד ${hiddenCount}…`) : lang === 'hi' ? tcHi(`עוד ${hiddenCount}…`) : lang === 'ru' ? tcRu(`עוד ${hiddenCount}…`) : lang === 'en' ? `${hiddenCount} more…` : `עוד ${hiddenCount}…`}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
        </ScrollView>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF6EC' },
  header: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 12 },
  headerIcon: { fontSize: 22 },
  headerTitle: { color: '#fff', fontWeight: '400', fontSize: 24, letterSpacing: 0.3, textAlign: 'right', writingDirection: 'rtl' },
  headerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 3, textAlign: 'right', writingDirection: 'rtl' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  centerTxt: { color: Colors.MUTED, fontSize: 13, marginTop: 12 },
  errIcon: { fontSize: 36, marginBottom: 12 },
  errTitle: { color: '#2C5F6E', fontWeight: '800', fontSize: 15, textAlign: 'center' },
  errSub: { color: Colors.MUTED, fontSize: 12.5, marginTop: 6, textAlign: 'center' },
  retry: { marginTop: 16, backgroundColor: Colors.SECONDARY, paddingHorizontal: 22, paddingVertical: 10, borderRadius: 8 },
  mapWrap: { height: 240, backgroundColor: '#E5E7EB' },
  sectionHead: { paddingHorizontal: 16, paddingVertical: 10, borderRightWidth: 4, borderRadius: 0 },
  sectionTitle: { fontWeight: '600', fontSize: 18, letterSpacing: 0.2, writingDirection: 'rtl', textAlign: 'right' },
  row: { flexDirection: 'row-reverse', backgroundColor: '#fff', borderRadius: 0, overflow: 'hidden', borderRightWidth: 4, borderBottomWidth: 1, borderBottomColor: '#EAE0CE' },
  thumb: { width: 96, height: 96 },
  rowName: { fontWeight: '500', color: '#2C5F6E', fontSize: 18, letterSpacing: 0.2, writingDirection: 'rtl', textAlign: 'right' },
  rowAddr: { color: Colors.MUTED, fontSize: 13, marginTop: 4, writingDirection: 'rtl', textAlign: 'right' },
  distChip: { alignSelf: 'flex-end', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 6 },
  distTxt: { color: '#fff', fontSize: 10.5, fontWeight: '800' },
  moreBtn: { marginTop: 2, paddingVertical: 11, borderWidth: 1, borderStyle: 'dashed', borderRadius: 0, alignItems: 'center' },
  moreTxt: { fontSize: 12.5, fontWeight: '700' },
});
