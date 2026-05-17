import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { openMapsChoice } from '../../utils/maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { CATALOG } from '../../data/catalog';

const FILTERS = [
  { key: 'hotels',      label: 'מלונות',   color: '#B8923A' },
  { key: 'restaurants', label: 'מסעדות',   color: '#F4A261' },
  { key: 'attractions', label: 'אטרקציות', color: '#2A9D8F' },
  { key: 'shopping',    label: 'קניות',    color: '#F4A261' },
  { key: 'nightlife',   label: 'בילויים',  color: '#B85C8E' },
  { key: 'kids',        label: 'ילדים',    color: '#E76F51' },
  { key: 'transport',   label: 'תחבורה',   color: '#1A6B8A' },
  { key: 'casino',      label: 'בידור',    color: '#E9C46A' },
  { key: 'all',         label: 'הכל',      color: '#2C5F6E' },
];

const AREAS = [
  { num: 1,  name: 'דאון טאון & ביזנס ביי', color: '#E76F51', desc: 'לב התיירות המודרנית — ברג׳ ח׳ליפה, Dubai Mall, מזרקות.', poly: [[25.2080,55.2620],[25.2070,55.2790],[25.1850,55.2880],[25.1700,55.2820],[25.1690,55.2680],[25.1830,55.2570],[25.2000,55.2570]] },
  { num: 2,  name: 'מרינה & JBR', color: '#2A9D8F', desc: 'רצועת חוף תוססת — יאכטות, JBR, חיי לילה.', poly: [[25.0980,55.1300],[25.0950,55.1480],[25.0820,55.1560],[25.0680,55.1500],[25.0660,55.1380],[25.0780,55.1280],[25.0900,55.1260]] },
  { num: 3,  name: 'פאלם ג׳ומיירה', color: '#B8923A', desc: 'אי מלאכותי בצורת דקל. Atlantis, FIVE Palm, Waldorf.', poly: [[25.1430,55.1350],[25.1430,55.1640],[25.1340,55.1720],[25.1170,55.1720],[25.1020,55.1640],[25.0980,55.1500],[25.1020,55.1360],[25.1170,55.1280],[25.1340,55.1280]] },
  { num: 4,  name: 'אל ברשה', color: '#7FA77F', desc: 'Mall of the Emirates, Ski Dubai.', poly: [[25.1180,55.1880],[25.1190,55.2080],[25.1100,55.2200],[25.0980,55.2200],[25.0890,55.2120],[25.0900,55.1960],[25.1020,55.1880]] },
  { num: 5,  name: 'ג׳ומיירה ביץ׳', color: '#A86F8E', desc: 'רצועת חוף ארוכה — מים טורקיז וחול לבן.', poly: [[25.2280,55.2280],[25.2230,55.2400],[25.2050,55.2510],[25.1830,55.2370],[25.1610,55.2200],[25.1400,55.2010],[25.1300,55.1900],[25.1380,55.1830],[25.1620,55.2010],[25.1860,55.2200],[25.2080,55.2330]] },
  { num: 6,  name: 'אל וואסל', color: '#5B9DC7', desc: 'בוטיק אורבני — Box Park, City Walk, גלריות.', poly: [[25.2030,55.2360],[25.2030,55.2510],[25.1940,55.2560],[25.1850,55.2520],[25.1850,55.2400],[25.1940,55.2340]] },
  { num: 7,  name: 'טרייד סנטר', color: '#C9A961', desc: 'דרך שייח׳ זאיד — שדרת גורדי השחקים.', poly: [[25.2300,55.2620],[25.2290,55.2800],[25.2200,55.2820],[25.2110,55.2800],[25.2100,55.2640],[25.2200,55.2600]] },
  { num: 8,  name: 'אל ג׳דאף', color: '#6B8E5A', desc: 'אזור עולה — בית האופרה, פסטיבל סיטי.', poly: [[25.2280,55.3110],[25.2270,55.3300],[25.2170,55.3340],[25.2050,55.3300],[25.2050,55.3140],[25.2160,55.3080]] },
  { num: 9,  name: 'בור דובאי', color: '#F4A261', desc: 'האזור ההיסטורי — אל-פאהידי, נחל דובאי, אברה.', poly: [[25.2620,55.2880],[25.2620,55.3080],[25.2530,55.3160],[25.2410,55.3140],[25.2360,55.3050],[25.2390,55.2920],[25.2490,55.2860]] },
  { num: 10, name: 'דיירה', color: '#B85C8E', desc: 'המסורתי — שוק הזהב, התבלינים, הטקסטיל.', poly: [[25.2820,55.3160],[25.2820,55.3360],[25.2710,55.3420],[25.2620,55.3380],[25.2590,55.3260],[25.2660,55.3170],[25.2760,55.3140]] },
];

const CATEGORY_COLORS: Record<string, string> = {
  hotels: '#B8923A', restaurants: '#F4A261', attractions: '#2A9D8F',
  shopping: '#F4A261', nightlife: '#B85C8E', kids: '#E76F51',
  transport: '#1A6B8A', casino: '#E9C46A', abudhabi: '#B85C8E',
};

export default function MapScreen() {
  const [filter, setFilter] = useState('hotels');
  const [areasOn, setAreasOn] = useState(false);

  const allItems = useMemo(() => {
    const items: any[] = [];
    Object.keys(CATALOG).forEach((cat: string) => {
      ((CATALOG as any)[cat] || []).forEach((it: any) => {
        if (it.lat && it.lng) items.push({ ...it, category: cat });
      });
    });
    return items;
  }, []);

  const filtered = filter === 'all' ? allItems : allItems.filter(i => i.category === filter);

  const html = useMemo(() => {
    const pts = filtered.map(it => ({
      lat: it.lat, lng: it.lng, name: it.name, address: it.address || '',
      rating: it.rating || '', color: CATEGORY_COLORS[it.category] || '#E76F51',
    }));
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#map{margin:0;padding:0;height:100%;width:100%;}.gm-style-iw{direction:rtl;font-family:-apple-system,sans-serif;}</style></head><body><div id="map"></div><script>
      const pts = ${JSON.stringify(pts)};
      function initMap(){
        const map = new google.maps.Map(document.getElementById('map'), { center: { lat: 25.20, lng: 55.27 }, zoom: 11, mapTypeControl: false, streetViewControl: false, fullscreenControl: false });
        ${areasOn ? `
        ${JSON.stringify(AREAS)}.forEach(a => {
          new google.maps.Polygon({ paths: a.poly.map(p => ({ lat: p[0], lng: p[1] })), strokeColor: a.color, strokeOpacity: 0.9, strokeWeight: 2, fillColor: a.color, fillOpacity: 0.25, map });
          const c = a.poly.reduce((acc, p) => ({ lat: acc.lat + p[0]/a.poly.length, lng: acc.lng + p[1]/a.poly.length }), { lat: 0, lng: 0 });
          new google.maps.Marker({ position: c, map, label: { text: String(a.num), color: '#fff', fontWeight: '800' }, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 14, fillColor: a.color, fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 } });
        });` : ''}
        pts.forEach(p => {
          const m = new google.maps.Marker({ position: { lat: p.lat, lng: p.lng }, map, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 7, fillColor: p.color, fillOpacity: 0.95, strokeColor: '#fff', strokeWeight: 2 } });
          const html = '<div style="direction:rtl;font-family:-apple-system,sans-serif;min-width:160px;"><b>'+p.name+'</b>'+(p.address?'<br><span style="color:#6B7F8D;font-size:11px;">'+p.address+'</span>':'')+(p.rating?'<br>⭐ '+p.rating:'')+'<br><a href="https://www.google.com/maps?q='+p.lat+','+p.lng+'" target="_blank" style="color:#E76F51;">📍 פתח במפה</a></div>';
          const iw = new google.maps.InfoWindow({ content: html });
          m.addListener('click', () => iw.open({ anchor: m, map }));
        });
      }
    </script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDw09Bg7XaH7apEWJBcFtogVfrdUwF_gEM&language=he&callback=initMap" async defer></script></body></html>`;
  }, [filtered, areasOn]);

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#000' }} />
      <View style={s.header}>
        <View style={{ width: 32 }} />
        <Text style={s.title}>מפת דובאי</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/' as any)} style={s.closeBtn}>
          <Text style={s.closeBtnTxt}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filtersRow} style={{ flexGrow: 0 }}>
        {[...FILTERS].reverse().map(f => {
          const isActive = filter === f.key;
          return (
            <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)} style={[s.filterTab, isActive && { borderBottomColor: Colors.GOLD, backgroundColor: '#F5E6CB' }]}>
              <Text style={[s.filterTxt, isActive && { color: Colors.TEXT, fontWeight: '900' }]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8 }}>
        <TouchableOpacity onPress={() => setAreasOn(o => !o)} style={[s.areasBtn, areasOn && { backgroundColor: Colors.SECONDARY, borderColor: Colors.SECONDARY }]}>
          <Text style={[s.areasBtnTxt, areasOn && { color: '#fff' }]}>{areasOn ? '✓ אזורים — מופעל' : 'הצג אזורי דובאי (10)'}</Text>
        </TouchableOpacity>
      </View>

      {areasOn ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, gap: 8, paddingBottom: 8 }} style={{ flexGrow: 0 }}>
          {AREAS.map(a => (
            <TouchableOpacity key={a.num} style={[s.areaCard, { borderColor: a.color }]} onPress={() => openMapsChoice(a.poly[0][0], a.poly[0][1], a.name || `אזור ${a.num}`, 'show')}>
              <Text style={[s.areaName, { color: a.color }]}>{a.name}</Text>
              <Text style={s.areaDesc} numberOfLines={3}>{a.desc}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}

      <View style={s.mapWrap}>
        <WebView originWhitelist={['*']} source={{ html }} style={{ flex: 1 }} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  brandBar: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  brandTxt: { flex: 1, fontSize: 22, fontWeight: '900', letterSpacing: -0.3, textAlign: 'center' },
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8DEC8' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E76F51', alignItems: 'center', justifyContent: 'center' },
  closeBtnTxt: { color: '#fff', fontSize: 18, fontWeight: '900', lineHeight: 20 },
  title: { fontSize: 16, fontWeight: '900', color: '#1A4A5E', writingDirection: 'rtl', textAlign: 'center', flex: 1 },
  filtersRow: { paddingHorizontal: 16, alignItems: 'center', backgroundColor: '#fff' },
  filterTab: { paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 3, borderBottomColor: 'transparent', height: 44, justifyContent: 'center' },
  filterTxt: { fontSize: 14, fontWeight: '600', color: '#9CA3AF', writingDirection: 'rtl' },
  areasBtn: { padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff', alignItems: 'center' },
  areasBtnTxt: { color: Colors.TEXT, fontWeight: '700', fontSize: 14 },
  areaCard: { width: 170, backgroundColor: '#fff', borderWidth: 2, borderRadius: 8, padding: 10 },
  areaName: { fontWeight: '800', fontSize: 13, marginBottom: 4, writingDirection: 'rtl', textAlign: 'right' },
  areaDesc: { fontSize: 11, color: Colors.TEXT, lineHeight: 14, writingDirection: 'rtl', textAlign: 'right' },
  mapWrap: { flex: 1, marginHorizontal: 12, marginBottom: 12, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
});
