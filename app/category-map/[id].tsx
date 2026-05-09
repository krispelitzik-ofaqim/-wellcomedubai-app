import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { CATALOG } from '../../data/catalog';

const TITLES: Record<string, { he: string; color: string }> = {
  hotels: { he: 'מלונות', color: Colors.GOLD },
  attractions: { he: 'אטרקציות', color: Colors.SECONDARY },
  restaurants: { he: 'מסעדות', color: Colors.WARM },
  shopping: { he: 'קניות', color: Colors.WARM },
  nightlife: { he: 'בילויים', color: Colors.PINK },
  transport: { he: 'תחבורה', color: Colors.PRIMARY },
  kids: { he: 'ילדים', color: Colors.ACCENT },
  casino: { he: 'בידור ומשחקים', color: Colors.GOLD },
  abudhabi: { he: 'אבו דאבי', color: Colors.PINK },
};

export default function CategoryMap() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cat = id || '';
  const meta = TITLES[cat] || { he: 'מפה', color: Colors.PRIMARY };
  const items: any[] = (CATALOG as any)[cat] || [];
  const withCoords = items.filter(i => i.lat && i.lng);

  const markers = withCoords.map((it, i) => ({ lat: it.lat, lng: it.lng, name: (it.name || '').replace(/'/g, '\\\''), id: it.id }));
  const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#map{margin:0;padding:0;height:100%;width:100%;}.leaflet-popup-content{direction:rtl;font-family:-apple-system,sans-serif;font-size:14px;}</style><link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/></head><body><div id="map"></div><script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script><script>
    const map = L.map('map').setView([25.20, 55.27], 11);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap', maxZoom: 19 }).addTo(map);
    const markers = ${JSON.stringify(markers)};
    const bounds = [];
    markers.forEach(m => {
      const mk = L.marker([m.lat, m.lng]).addTo(map).bindPopup('<b>' + m.name + '</b>');
      bounds.push([m.lat, m.lng]);
    });
    if (bounds.length) map.fitBounds(bounds, { padding: [40, 40] });
  </script></body></html>`;

  return (
    <SafeAreaView edges={['top']} style={s.container}>
      <View style={[s.header, { backgroundColor: meta.color }]}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={{ fontSize: 22, color: '#fff' }}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>🗺 {meta.he} — {withCoords.length} נקודות</Text>
      </View>
      <WebView originWhitelist={['*']} source={{ html }} style={{ flex: 1 }} />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  back: { padding: 4 },
  title: { flex: 1, color: '#fff', fontSize: 16, fontWeight: '900', writingDirection: 'rtl' },
});
