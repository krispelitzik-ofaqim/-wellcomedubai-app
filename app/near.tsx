import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { WebView } from 'react-native-webview';
import { CATALOG } from '../data/catalog';
import { Colors } from '../constants/colors';

const NEAR_CATS = [
  { key: 'restaurants', label: 'מסעדות', color: '#F4A261', icon: '🍽️' },
  { key: 'attractions', label: 'אטרקציות', color: '#2A9D8F', icon: '🏛️' },
  { key: 'shopping',    label: 'קניות',    color: '#F4A261', icon: '🛍️' },
  { key: 'nightlife',   label: 'בילויים',  color: '#B85C8E', icon: '🥂' },
  { key: 'kids',        label: 'ילדים',    color: '#E76F51', icon: '🧸' },
  { key: 'hotels',      label: 'מלונות',   color: '#B8923A', icon: '🏨' },
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
  const [coords, setCoords] = useState<Coords | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const requestLocation = async () => {
    setLoading(true); setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('אפשר הרשאת מיקום בהגדרות ונסה שוב');
        setLoading(false);
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
    } catch (e: any) {
      setError('לא הצלחנו לאתר את המיקום');
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
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#m{margin:0;padding:0;height:100%;width:100%;}</style></head><body><div id="m"></div><script>function init(){const map=new google.maps.Map(document.getElementById('m'),{center:{lat:${coords.lat},lng:${coords.lng}},zoom:13,mapTypeControl:false,streetViewControl:false,fullscreenControl:false});new google.maps.Marker({position:{lat:${coords.lat},lng:${coords.lng}},map,title:'אני כאן',icon:{path:google.maps.SymbolPath.CIRCLE,scale:11,fillColor:'#1A6B8A',fillOpacity:1,strokeColor:'#fff',strokeWeight:3}});const pts=${JSON.stringify(markers)};pts.forEach(p=>{const m=new google.maps.Marker({position:{lat:p.lat,lng:p.lng},map,icon:{path:google.maps.SymbolPath.CIRCLE,scale:7,fillColor:p.color,fillOpacity:1,strokeColor:'#fff',strokeWeight:2}});const iw=new google.maps.InfoWindow({content:'<div style="direction:rtl;font-family:-apple-system,sans-serif;"><b>'+p.name+'</b><br><span style="color:#E76F51;">'+p.dist+' ק"מ</span></div>'});m.addListener('click',()=>iw.open({anchor:m,map}));});}</script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDw09Bg7XaH7apEWJBcFtogVfrdUwF_gEM&language=he&callback=init" async defer></script></body></html>`;
  }, [coords, sections]);

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#2C5F6E' }} />
      <LinearGradient colors={['#2C5F6E', '#2A9D8F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.header}>
        <Text style={s.headerIcon}>📍</Text>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>קרוב אליך עכשיו</Text>
          <Text style={s.headerSub}>2 הקרובים מכל קטגוריה (עוד 3 בלחיצה)</Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={s.closeBtn}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>✕</Text>
        </TouchableOpacity>
      </LinearGradient>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={Colors.ACCENT} />
          <Text style={s.centerTxt}>מבקש את המיקום שלך…</Text>
        </View>
      ) : error ? (
        <View style={s.center}>
          <Text style={s.errIcon}>📵</Text>
          <Text style={s.errTitle}>לא הצלחנו לאתר את המיקום</Text>
          <Text style={s.errSub}>{error}</Text>
          <TouchableOpacity onPress={requestLocation} style={s.retry}>
            <Text style={{ color: '#fff', fontWeight: '700' }}>נסה שוב</Text>
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
                  <Text style={[s.sectionTitle, { color: sec.color }]}>{sec.icon} {sec.label}</Text>
                </View>
                <View style={{ gap: 8, paddingHorizontal: 16, marginTop: 8 }}>
                  {visible.map((it: any) => (
                    <TouchableOpacity key={it.id} onPress={() => router.push(`/item/${it.id}?cat=${sec.key}` as any)} style={[s.row, { borderRightColor: sec.color }]}>
                      {imgUrl(it) ? <Image source={{ uri: imgUrl(it) }} style={s.thumb} /> : <View style={[s.thumb, { backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }]}><Text style={{ fontSize: 26 }}>{sec.icon}</Text></View>}
                      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 12 }}>
                        <Text style={s.rowName} numberOfLines={1}>{it.name}</Text>
                        {it.address ? <Text style={s.rowAddr} numberOfLines={1}>📍 {it.address}</Text> : null}
                        <View style={[s.distChip, { backgroundColor: sec.color }]}>
                          <Text style={s.distTxt}>{it._dist.toFixed(1)} ק"מ</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                  {hiddenCount > 0 && (
                    <TouchableOpacity onPress={() => setExpanded(prev => ({ ...prev, [sec.key]: true }))} style={[s.moreBtn, { borderColor: sec.color }]}>
                      <Text style={[s.moreTxt, { color: sec.color }]}>עוד {hiddenCount}…</Text>
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
  headerTitle: { color: '#fff', fontWeight: '900', fontSize: 16, textAlign: 'right', writingDirection: 'rtl' },
  headerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 11, marginTop: 2, textAlign: 'right', writingDirection: 'rtl' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 28 },
  centerTxt: { color: Colors.MUTED, fontSize: 13, marginTop: 12 },
  errIcon: { fontSize: 36, marginBottom: 12 },
  errTitle: { color: '#2C5F6E', fontWeight: '800', fontSize: 15, textAlign: 'center' },
  errSub: { color: Colors.MUTED, fontSize: 12.5, marginTop: 6, textAlign: 'center' },
  retry: { marginTop: 16, backgroundColor: Colors.SECONDARY, paddingHorizontal: 22, paddingVertical: 10, borderRadius: 8 },
  mapWrap: { height: 240, backgroundColor: '#E5E7EB' },
  sectionHead: { paddingHorizontal: 16, paddingVertical: 8, marginHorizontal: 16, borderRightWidth: 4, borderRadius: 8 },
  sectionTitle: { fontWeight: '900', fontSize: 14.5, writingDirection: 'rtl', textAlign: 'right' },
  row: { flexDirection: 'row-reverse', backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', borderRightWidth: 4, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  thumb: { width: 90, height: 90 },
  rowName: { fontWeight: '800', color: '#2C5F6E', fontSize: 14, writingDirection: 'rtl', textAlign: 'right' },
  rowAddr: { color: Colors.MUTED, fontSize: 11.5, marginTop: 4, writingDirection: 'rtl', textAlign: 'right' },
  distChip: { alignSelf: 'flex-end', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginTop: 6 },
  distTxt: { color: '#fff', fontSize: 10.5, fontWeight: '800' },
  moreBtn: { marginTop: 2, paddingVertical: 8, borderWidth: 1, borderStyle: 'dashed', borderRadius: 8, alignItems: 'center' },
  moreTxt: { fontSize: 12.5, fontWeight: '700' },
});
