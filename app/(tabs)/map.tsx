import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { Colors } from '../../constants/colors';

const AREAS = [
  { num: 1,  name: 'דאון טאון & ביזנס ביי', color: '#E76F51', desc: 'לב התיירות המודרנית — ברג׳ ח׳ליפה, Dubai Mall, מזרקות, מסעדות גורמה.', poly: [[25.2080,55.2620],[25.2070,55.2790],[25.1850,55.2880],[25.1700,55.2820],[25.1690,55.2680],[25.1830,55.2570],[25.2000,55.2570]], lat: 25.1900, lng: 55.2730 },
  { num: 2,  name: 'מרינה & JBR', color: '#2A9D8F', desc: 'רצועת חוף תוססת — יאכטות, JBR, חיי לילה.', poly: [[25.0980,55.1300],[25.0950,55.1480],[25.0820,55.1560],[25.0680,55.1500],[25.0660,55.1380],[25.0780,55.1280],[25.0900,55.1260]], lat: 25.0820, lng: 55.1410 },
  { num: 3,  name: 'פאלם ג׳ומיירה', color: '#B8923A', desc: 'אי מלאכותי בצורת דקל. Atlantis, FIVE Palm, Waldorf Astoria.', poly: [[25.1430,55.1350],[25.1430,55.1640],[25.1340,55.1720],[25.1170,55.1720],[25.1020,55.1640],[25.0980,55.1500],[25.1020,55.1360],[25.1170,55.1280],[25.1340,55.1280]], lat: 25.1124, lng: 55.1390 },
  { num: 4,  name: 'אל ברשה', color: '#7FA77F', desc: 'Mall of the Emirates, Ski Dubai.', poly: [[25.1180,55.1880],[25.1190,55.2080],[25.1100,55.2200],[25.0980,55.2200],[25.0890,55.2120],[25.0900,55.1960],[25.1020,55.1880]], lat: 25.1100, lng: 55.2050 },
  { num: 5,  name: 'ג׳ומיירה ביץ׳', color: '#A86F8E', desc: 'רצועת חוף ארוכה — מים טורקיז וחול לבן.', poly: [[25.2280,55.2280],[25.2230,55.2400],[25.2050,55.2510],[25.1830,55.2370],[25.1610,55.2200],[25.1400,55.2010],[25.1300,55.1900],[25.1380,55.1830],[25.1620,55.2010],[25.1860,55.2200],[25.2080,55.2330]], lat: 25.2200, lng: 55.2400 },
  { num: 6,  name: 'אל וואסל', color: '#5B9DC7', desc: 'בוטיק אורבני — Box Park, City Walk, גלריות.', poly: [[25.2030,55.2360],[25.2030,55.2510],[25.1940,55.2560],[25.1850,55.2520],[25.1850,55.2400],[25.1940,55.2340]], lat: 25.1950, lng: 55.2480 },
  { num: 7,  name: 'טרייד סנטר', color: '#C9A961', desc: 'דרך שייח׳ זאיד — שדרת גורדי השחקים.', poly: [[25.2300,55.2620],[25.2290,55.2800],[25.2200,55.2820],[25.2110,55.2800],[25.2100,55.2640],[25.2200,55.2600]], lat: 25.2200, lng: 55.2800 },
  { num: 8,  name: 'אל ג׳דאף', color: '#6B8E5A', desc: 'אזור עולה — בית האופרה, פסטיבל סיטי.', poly: [[25.2280,55.3110],[25.2270,55.3300],[25.2170,55.3340],[25.2050,55.3300],[25.2050,55.3140],[25.2160,55.3080]], lat: 25.2150, lng: 55.3300 },
  { num: 9,  name: 'בור דובאי', color: '#F4A261', desc: 'האזור ההיסטורי — אל-פאהידי, נחל דובאי, סירות אברה.', poly: [[25.2620,55.2880],[25.2620,55.3080],[25.2530,55.3160],[25.2410,55.3140],[25.2360,55.3050],[25.2390,55.2920],[25.2490,55.2860]], lat: 25.2570, lng: 55.3000 },
  { num: 10, name: 'דיירה', color: '#B85C8E', desc: 'המסורתי — שוק הזהב, התבלינים, הטקסטיל.', poly: [[25.2820,55.3160],[25.2820,55.3360],[25.2710,55.3420],[25.2620,55.3380],[25.2590,55.3260],[25.2660,55.3170],[25.2760,55.3140]], lat: 25.2750, lng: 55.3200 },
];

const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#map{margin:0;padding:0;height:100%;width:100%;}.leaflet-popup-content{direction:rtl;font-family:-apple-system,sans-serif;}.area-label{background:transparent;border:none;box-shadow:none;}.area-label::before{display:none;}</style><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/></head><body><div id="map"></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>
  const map = L.map('map').setView([25.18, 55.25], 10);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(map);
  const areas = ${JSON.stringify(AREAS)};
  areas.forEach(a => {
    L.polygon(a.poly, { color: a.color, fillColor: a.color, fillOpacity: 0.38, weight: 3 }).addTo(map)
      .bindPopup('<b style="color:'+a.color+'">'+a.num+'. '+a.name+'</b><br>'+a.desc);
    L.marker([a.lat, a.lng], { icon: L.divIcon({ className: 'area-label', html: '<div style="background:'+a.color+';color:#fff;font-weight:800;padding:2px 8px;border-radius:10px;font-size:12px;border:2px solid #fff;">'+a.num+'</div>' }) }).addTo(map);
  });
</script></body></html>`;

export default function MapScreen() {
  return (
    <SafeAreaView edges={['top']} style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>🗺 אזורי דובאי — 10 שכונות</Text>
      </View>
      <View style={{ flex: 1 }}>
        <WebView originWhitelist={['*']} source={{ html }} style={{ flex: 1 }} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.legend} contentContainerStyle={{ padding: 10, gap: 6 }}>
        {AREAS.map(a => (
          <TouchableOpacity key={a.num} style={[s.legendChip, { backgroundColor: a.color }]} onPress={() => Linking.openURL(`https://www.google.com/maps?q=${a.lat},${a.lng}`)}>
            <Text style={s.legendTxt}>{a.num}. {a.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { paddingHorizontal: 18, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8DEC8' },
  title: { fontSize: 16, fontWeight: '900', color: '#1A4A5E', writingDirection: 'rtl', textAlign: 'right' },
  legend: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E8DEC8', flexGrow: 0, maxHeight: 50 },
  legendChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  legendTxt: { color: '#fff', fontSize: 11, fontWeight: '800' },
});
