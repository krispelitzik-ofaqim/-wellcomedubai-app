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

  const markers = withCoords.map(it => ({
    lat: it.lat, lng: it.lng, name: it.name, address: it.address || '',
    rating: it.rating || '', price: it.price || it.priceRange || '', phone: it.phone || '',
    image: it.image ? (it.image.startsWith('http') ? it.image : 'https://wellcomedubai.com/' + it.image) : '',
    color: meta.color,
  }));
  const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#map{margin:0;padding:0;height:100%;width:100%;}.gm-style-iw{direction:rtl;font-family:-apple-system,sans-serif;}.popup-img{width:100%;height:120px;object-fit:cover;border-radius:6px;margin-bottom:6px;}.popup-name{font-weight:800;color:#2C5F6E;font-size:14px;}.popup-addr{font-size:11px;color:#6B7F8D;margin-top:4px;}.popup-meta{margin-top:5px;display:flex;gap:8px;font-size:12px;font-weight:700;}.popup-rating{color:#92400e;}.popup-price{color:#E76F51;}.popup-actions{display:flex;gap:6px;margin-top:8px;}.popup-btn{flex:1;padding:6px 8px;border-radius:5px;text-align:center;font-size:11px;font-weight:700;text-decoration:none;color:#fff;}</style></head><body><div id="map"></div><script>
    const pts = ${JSON.stringify(markers)};
    function initMap(){
      const center = pts.length ? { lat: pts[0].lat, lng: pts[0].lng } : { lat: 25.2, lng: 55.27 };
      const map = new google.maps.Map(document.getElementById('map'), { center, zoom: 11, mapTypeControl: false, streetViewControl: false, fullscreenControl: false });
      const bounds = new google.maps.LatLngBounds();
      pts.forEach(p => {
        const m = new google.maps.Marker({ position: { lat: p.lat, lng: p.lng }, map, title: p.name, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 9, fillColor: p.color, fillOpacity: 0.95, strokeColor: '#fff', strokeWeight: 2 } });
        bounds.extend({ lat: p.lat, lng: p.lng });
        const img = p.image ? '<img class="popup-img" src="'+p.image+'" onerror="this.style.display=\\'none\\'">' : '';
        const addr = p.address ? '<div class="popup-addr">📍 '+p.address+'</div>' : '';
        const rating = p.rating ? '<span class="popup-rating">⭐ '+p.rating+'</span>' : '';
        const price = p.price ? '<span class="popup-price">'+p.price+'</span>' : '';
        const meta = (rating || price) ? '<div class="popup-meta">'+rating+price+'</div>' : '';
        const navBtn = '<a class="popup-btn" style="background:#E76F51;" href="https://www.google.com/maps/dir/?api=1&destination='+p.lat+','+p.lng+'" target="_blank">נווט</a>';
        const whereBtn = '<a class="popup-btn" style="background:#C4922F;" href="https://www.google.com/maps?q='+p.lat+','+p.lng+'" target="_blank">איפה</a>';
        const html = '<div style="min-width:200px;max-width:240px;direction:rtl;">'+img+'<div class="popup-name">'+p.name+'</div>'+addr+meta+'<div class="popup-actions">'+navBtn+whereBtn+'</div></div>';
        const iw = new google.maps.InfoWindow({ content: html, maxWidth: 260 });
        m.addListener('click', () => iw.open({ anchor: m, map }));
      });
      if (pts.length > 1) map.fitBounds(bounds, 30);
    }
  </script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDw09Bg7XaH7apEWJBcFtogVfrdUwF_gEM&language=he&callback=initMap" async defer></script></body></html>`;

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#000' }} />
      <View style={s.brandBar}>
        <Text style={s.brandTxt}>
          <Text style={{ color: '#1A6B8A' }}>WellCome </Text>
          <Text style={{ color: '#E76F51' }}>Dubai</Text>
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={s.brandClose}>
          <Text style={{ color: '#2C5F6E', fontSize: 18, fontWeight: '700' }}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={[s.header, { backgroundColor: meta.color }]}>
        <Text style={[s.title, { flex: 1 }]}>{meta.he} — {withCoords.length} נקודות</Text>
      </View>
      <WebView originWhitelist={['*']} source={{ html }} style={{ flex: 1 }} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  back: { padding: 4 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  brandBar: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  brandTxt: { flex: 1, fontSize: 22, fontWeight: '900', letterSpacing: -0.3, textAlign: 'center' },
  brandClose: { width: 32, alignItems: 'center' },
  title: { color: '#fff', fontSize: 16, fontWeight: '900', writingDirection: 'rtl', textAlign: 'right' },
});
