import { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Modal } from 'react-native';
import { openMapsChoice } from '../../utils/maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from '../../components/WebView';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useI18n } from '../../constants/i18n';
import { CATALOG } from '../../data/catalog';
import { tcRu } from '../../constants/contentRu';
import { tcHi } from '../../constants/contentHi';
import { tcAr } from '../../constants/contentAr';

const FILTERS = [
  { key: 'hotels',      label: 'מלונות',   labelEn: 'Hotels',        color: '#B8923A' },
  { key: 'restaurants', label: 'מסעדות',   labelEn: 'Restaurants',   color: '#F4A261' },
  { key: 'attractions', label: 'אטרקציות', labelEn: 'Attractions',   color: '#2A9D8F' },
  { key: 'shopping',    label: 'קניות',    labelEn: 'Shopping',      color: '#F4A261' },
  { key: 'nightlife',   label: 'בילויים',  labelEn: 'Nightlife',     color: '#B85C8E' },
  { key: 'kids',        label: 'ילדים',    labelEn: 'Kids',          color: '#E76F51' },
  { key: 'transport',   label: 'תחבורה',   labelEn: 'Transport',     color: '#1A6B8A' },
  { key: 'casino',      label: 'בידור',    labelEn: 'Entertainment', color: '#E9C46A' },
  { key: 'all',         label: 'הכל',      labelEn: 'All',           color: '#2C5F6E' },
];

const AREAS = [
  { num: 1,  name: 'דאון טאון & ביזנס ביי', nameEn: 'Downtown & Business Bay', color: '#E76F51', desc: 'לב התיירות המודרנית — ברג׳ ח׳ליפה, Dubai Mall, מזרקות.', descEn: 'Heart of modern tourism — Burj Khalifa, Dubai Mall, fountains.', poly: [[25.2080,55.2620],[25.2070,55.2790],[25.1850,55.2880],[25.1700,55.2820],[25.1690,55.2680],[25.1830,55.2570],[25.2000,55.2570]] },
  { num: 2,  name: 'מרינה & JBR', nameEn: 'Marina & JBR', color: '#2A9D8F', desc: 'רצועת חוף תוססת — יאכטות, JBR, חיי לילה.', descEn: 'Vibrant waterfront — yachts, JBR, nightlife.', poly: [[25.0980,55.1300],[25.0950,55.1480],[25.0820,55.1560],[25.0680,55.1500],[25.0660,55.1380],[25.0780,55.1280],[25.0900,55.1260]] },
  { num: 3,  name: 'פאלם ג׳ומיירה', nameEn: 'Palm Jumeirah', color: '#B8923A', desc: 'אי מלאכותי בצורת דקל. Atlantis, FIVE Palm, Waldorf.', descEn: 'Palm-shaped man-made island. Atlantis, FIVE Palm, Waldorf.', poly: [[25.1430,55.1350],[25.1430,55.1640],[25.1340,55.1720],[25.1170,55.1720],[25.1020,55.1640],[25.0980,55.1500],[25.1020,55.1360],[25.1170,55.1280],[25.1340,55.1280]] },
  { num: 4,  name: 'אל ברשה', nameEn: 'Al Barsha', color: '#7FA77F', desc: 'Mall of the Emirates, Ski Dubai.', descEn: 'Mall of the Emirates, Ski Dubai.', poly: [[25.1180,55.1880],[25.1190,55.2080],[25.1100,55.2200],[25.0980,55.2200],[25.0890,55.2120],[25.0900,55.1960],[25.1020,55.1880]] },
  { num: 5,  name: 'ג׳ומיירה ביץ׳', nameEn: 'Jumeirah Beach', color: '#A86F8E', desc: 'רצועת חוף ארוכה — מים טורקיז וחול לבן.', descEn: 'Long beachfront — turquoise water and white sand.', poly: [[25.2280,55.2280],[25.2230,55.2400],[25.2050,55.2510],[25.1830,55.2370],[25.1610,55.2200],[25.1400,55.2010],[25.1300,55.1900],[25.1380,55.1830],[25.1620,55.2010],[25.1860,55.2200],[25.2080,55.2330]] },
  { num: 6,  name: 'אל וואסל', nameEn: 'Al Wasl', color: '#5B9DC7', desc: 'בוטיק אורבני — Box Park, City Walk, גלריות.', descEn: 'Urban boutique — Box Park, City Walk, galleries.', poly: [[25.2030,55.2360],[25.2030,55.2510],[25.1940,55.2560],[25.1850,55.2520],[25.1850,55.2400],[25.1940,55.2340]] },
  { num: 7,  name: 'טרייד סנטר', nameEn: 'Trade Centre', color: '#C9A961', desc: 'דרך שייח׳ זאיד — שדרת גורדי השחקים.', descEn: 'Sheikh Zayed Road — the skyscraper boulevard.', poly: [[25.2300,55.2620],[25.2290,55.2800],[25.2200,55.2820],[25.2110,55.2800],[25.2100,55.2640],[25.2200,55.2600]] },
  { num: 8,  name: 'אל ג׳דאף', nameEn: 'Al Jaddaf', color: '#6B8E5A', desc: 'אזור עולה — בית האופרה, פסטיבל סיטי.', descEn: 'Up-and-coming area — Opera House, Festival City.', poly: [[25.2280,55.3110],[25.2270,55.3300],[25.2170,55.3340],[25.2050,55.3300],[25.2050,55.3140],[25.2160,55.3080]] },
  { num: 9,  name: 'בור דובאי', nameEn: 'Bur Dubai', color: '#F4A261', desc: 'האזור ההיסטורי — אל-פאהידי, נחל דובאי, אברה.', descEn: 'The historic quarter — Al Fahidi, Dubai Creek, abra.', poly: [[25.2620,55.2880],[25.2620,55.3080],[25.2530,55.3160],[25.2410,55.3140],[25.2360,55.3050],[25.2390,55.2920],[25.2490,55.2860]] },
  { num: 10, name: 'דיירה', nameEn: 'Deira', color: '#B85C8E', desc: 'המסורתי — שוק הזהב, התבלינים, הטקסטיל.', descEn: 'The traditional side — Gold Souk, Spice Souk, textiles.', poly: [[25.2820,55.3160],[25.2820,55.3360],[25.2710,55.3420],[25.2620,55.3380],[25.2590,55.3260],[25.2660,55.3170],[25.2760,55.3140]] },
];

const CATEGORY_COLORS: Record<string, string> = {
  hotels: '#B8923A', restaurants: '#F4A261', attractions: '#2A9D8F',
  shopping: '#F4A261', nightlife: '#B85C8E', kids: '#E76F51',
  transport: '#1A6B8A', casino: '#E9C46A', abudhabi: '#B85C8E',
};

export default function MapScreen() {
  const { t, lang, isRTL } = useI18n();
  const s = makeStyles(isRTL);
  const [filter, setFilter] = useState('hotels');
  const [areasOn, setAreasOn] = useState(false);
  const [areaModal, setAreaModal] = useState<any>(null);   // in-app closable area map window

  const areaLabel = (a: any) => (lang === 'ar' ? tcAr(a.name) : lang === 'hi' ? tcHi(a.name) : lang === 'ru' ? tcRu(a.name) : lang === 'en' ? a.nameEn : a.name) || `Area ${a.num}`;

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
        const map = new google.maps.Map(document.getElementById('map'), { center: { lat: 25.20, lng: 55.27 }, zoom: 11, mapTypeControl: false, streetViewControl: false, fullscreenControl: false, gestureHandling: 'cooperative' });
        ${areasOn ? `
        ${JSON.stringify(AREAS)}.forEach(a => {
          new google.maps.Polygon({ paths: a.poly.map(p => ({ lat: p[0], lng: p[1] })), strokeColor: a.color, strokeOpacity: 0.9, strokeWeight: 2, fillColor: a.color, fillOpacity: 0.25, map });
          const c = a.poly.reduce((acc, p) => ({ lat: acc.lat + p[0]/a.poly.length, lng: acc.lng + p[1]/a.poly.length }), { lat: 0, lng: 0 });
          new google.maps.Marker({ position: c, map, label: { text: String(a.num), color: '#fff', fontWeight: '800' }, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 14, fillColor: a.color, fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 } });
        });` : ''}
        pts.forEach(p => {
          const m = new google.maps.Marker({ position: { lat: p.lat, lng: p.lng }, map, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 7, fillColor: p.color, fillOpacity: 0.95, strokeColor: '#fff', strokeWeight: 2 } });
          const html = '<div style="direction:rtl;font-family:-apple-system,sans-serif;min-width:160px;"><b>'+p.name+'</b>'+(p.address?'<br><span style="color:#6B7F8D;font-size:11px;">'+p.address+'</span>':'')+(p.rating?'<br>⭐ '+p.rating:'')+'<br><a href="https://www.google.com/maps?q='+p.lat+','+p.lng+'" target="_blank" style="color:#E76F51;">📍 ${t('map.openInMaps')}</a></div>';
          const iw = new google.maps.InfoWindow({ content: html });
          m.addListener('click', () => iw.open({ anchor: m, map }));
        });
      }
    </script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDw09Bg7XaH7apEWJBcFtogVfrdUwF_gEM&language=${lang}&callback=initMap" async defer></script></body></html>`;
  }, [filtered, areasOn, lang]);

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#000' }} />
      <View style={s.header}>
        <View style={{ width: 32 }} />
        <Text style={s.title}>{t('map.dubaiMap')}</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/' as any)} style={s.closeBtn}>
          <Text style={s.closeBtnTxt}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filtersRow} style={{ flexGrow: 0 }}>
        {[...FILTERS].reverse().map(f => {
          const isActive = filter === f.key;
          return (
            <TouchableOpacity key={f.key} onPress={() => setFilter(f.key)} style={[s.filterTab, isActive && { borderBottomColor: Colors.GOLD, backgroundColor: '#F5E6CB' }]}>
              <Text style={[s.filterTxt, isActive && { color: Colors.TEXT, fontWeight: '700' }]}>{f.key === 'all' ? t('common.all') : (t('cat.' + f.key).startsWith('cat.') ? (lang === 'he' ? f.label : (f.labelEn || f.label)) : t('cat.' + f.key))}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={{ paddingHorizontal: 14, paddingTop: 12, paddingBottom: 8 }}>
        <TouchableOpacity onPress={() => setAreasOn(o => !o)} style={[s.areasBtn, areasOn && { backgroundColor: Colors.SECONDARY, borderColor: Colors.SECONDARY }]}>
          <Text style={[s.areasBtnTxt, areasOn && { color: '#fff' }]}>{areasOn ? t('map.areasShown') : t('map.showAreasN')}</Text>
        </TouchableOpacity>
      </View>

      {areasOn ? (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 14, gap: 8, paddingBottom: 8 }} style={{ flexGrow: 0 }}>
          {AREAS.map(a => (
            <TouchableOpacity key={a.num} style={[s.areaCard, { borderRightColor: a.color }]} onPress={() => setAreaModal(a)}>
              <Text style={[s.areaName, { color: a.color, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}>{lang === 'ar' ? tcAr(a.name) : lang === 'hi' ? tcHi(a.name) : lang === 'ru' ? tcRu(a.name) : lang === 'en' ? a.nameEn : a.name}</Text>
              <Text style={[s.areaDesc, { writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={3}>{lang === 'ar' ? tcAr(a.desc) : lang === 'hi' ? tcHi(a.desc) : lang === 'ru' ? tcRu(a.desc) : lang === 'en' ? a.descEn : a.desc}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}

      <View style={s.mapWrap}>
        <WebView originWhitelist={['*']} source={{ html }} style={{ flex: 1 }} />
      </View>

      <Modal visible={!!areaModal} animationType="slide" onRequestClose={() => setAreaModal(null)}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <SafeAreaView edges={['top']} style={{ backgroundColor: '#1A4A5E' }} />
          <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#1A4A5E', paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800', flex: 1, textAlign: isRTL ? 'right' : 'left' }} numberOfLines={1}>{areaModal ? areaLabel(areaModal) : ''}</Text>
            <TouchableOpacity onPress={() => setAreaModal(null)} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: '#E76F51' }}>
              <Text style={{ color: '#fff', fontWeight: '900', fontSize: 15 }}>✕</Text>
            </TouchableOpacity>
          </View>
          {areaModal ? (
            <WebView
              originWhitelist={['*']}
              source={{ html: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#m{margin:0;padding:0;height:100%;width:100%;}</style></head><body><div id="m"></div><script>function init(){const poly=${JSON.stringify(areaModal.poly)}.map(p=>({lat:p[0],lng:p[1]}));const map=new google.maps.Map(document.getElementById('m'),{mapTypeControl:false,streetViewControl:false,fullscreenControl:false,gestureHandling:'greedy'});new google.maps.Polygon({paths:poly,strokeColor:'${areaModal.color}',strokeOpacity:0.95,strokeWeight:2,fillColor:'${areaModal.color}',fillOpacity:0.22,map});const b=new google.maps.LatLngBounds();poly.forEach(p=>b.extend(p));map.fitBounds(b,30);}</script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDw09Bg7XaH7apEWJBcFtogVfrdUwF_gEM&language=${lang}&callback=init" async defer></script></body></html>` }}
              style={{ flex: 1 }}
            />
          ) : null}
          <TouchableOpacity onPress={() => areaModal && openMapsChoice(areaModal.poly[0][0], areaModal.poly[0][1], areaLabel(areaModal), 'navigate')} style={{ backgroundColor: Colors.PRIMARY, paddingVertical: 15, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>{t('act.navigateMe')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (isRTL: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  brandBar: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  brandTxt: { flex: 1, fontSize: 22, fontWeight: '900', letterSpacing: -0.3, textAlign: 'center' },
  header: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8DEC8' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E76F51', alignItems: 'center', justifyContent: 'center' },
  closeBtnTxt: { color: '#fff', fontSize: 18, fontWeight: '900', lineHeight: 20 },
  title: { fontSize: 24, fontWeight: '400', color: '#1A4A5E', letterSpacing: 0.3, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: 'center', flex: 1 },
  filtersRow: { paddingHorizontal: 16, alignItems: 'center', backgroundColor: '#fff' },
  filterTab: { paddingVertical: 10, paddingHorizontal: 14, borderBottomWidth: 3, borderBottomColor: 'transparent', height: 44, justifyContent: 'center' },
  filterTxt: { fontSize: 15, fontWeight: '500', color: '#9CA3AF', writingDirection: isRTL ? 'rtl' : 'ltr' },
  areasBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 0, borderWidth: 0, backgroundColor: Colors.GOLD, alignItems: 'center' },
  areasBtnTxt: { color: '#fff', fontWeight: '600', fontSize: 15, letterSpacing: 0.2 },
  areaCard: { width: 180, backgroundColor: '#fff', borderRadius: 0, borderRightWidth: 4, borderRightColor: '#E76F51', borderBottomWidth: 1, borderBottomColor: '#EAE0CE', padding: 14 },
  areaName: { fontWeight: '600', fontSize: 16, letterSpacing: 0.2, marginBottom: 5, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  areaDesc: { fontSize: 12, color: Colors.MUTED, lineHeight: 16, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  mapWrap: { flex: 1, borderRadius: 0, overflow: 'hidden' },
});
