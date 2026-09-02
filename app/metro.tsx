import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from '../components/WebView';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { useI18n } from '../constants/i18n';
import { tcRu } from '../constants/contentRu';
import { tcHi } from '../constants/contentHi';
import { tcAr } from '../constants/contentAr';
import METRO from '../data/metro.json';
import { openMapsChoice } from '../utils/maps';

type LineId = 'red' | 'green' | 'all';

export default function MetroScreen() {
  const { t, lang, isRTL } = useI18n();
  const s = makeStyles(isRTL);
  const [filter, setFilter] = useState<LineId>('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    let list = METRO.stations;
    if (filter !== 'all') list = list.filter(s => s.lines.includes(filter));
    if (query.trim()) {
      const q = query.toLowerCase().trim();
      list = list.filter(s =>
        s.nameHe.includes(query) ||
        s.nameEn.toLowerCase().includes(q) ||
        s.area.toLowerCase().includes(q)
      );
    }
    return list;
  }, [filter, query]);

  const mapStations = filter === 'all' ? METRO.stations : METRO.stations.filter(s => s.lines.includes(filter));
  const redLine = METRO.lines.find(l => l.id === 'red')!;
  const greenLine = METRO.lines.find(l => l.id === 'green')!;

  const mapHtml = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#m{margin:0;padding:0;height:100%;width:100%;}</style></head><body><div id="m"></div><script>function init(){const map=new google.maps.Map(document.getElementById('m'),{center:{lat:25.18,lng:55.25},zoom:11,mapTypeControl:false,streetViewControl:false,fullscreenControl:false,gestureHandling:'cooperative'});const stations=${JSON.stringify(mapStations)};const redPath=[];const greenPath=[];stations.forEach(s=>{const pos={lat:s.lat,lng:s.lng};const isRed=s.lines.includes('red');const isGreen=s.lines.includes('green');const isInter=isRed&&isGreen;const color=isInter?'#B8923A':(isRed?'${redLine.color}':'${greenLine.color}');new google.maps.Marker({position:pos,map,title:s.nameHe,icon:{path:google.maps.SymbolPath.CIRCLE,scale:isInter?9:6,fillColor:color,fillOpacity:1,strokeColor:'#fff',strokeWeight:2}});if(isRed)redPath.push(pos);if(isGreen)greenPath.push(pos);});if(redPath.length>1)new google.maps.Polyline({path:redPath,geodesic:true,strokeColor:'${redLine.color}',strokeOpacity:0.8,strokeWeight:3,map});if(greenPath.length>1)new google.maps.Polyline({path:greenPath,geodesic:true,strokeColor:'${greenLine.color}',strokeOpacity:0.8,strokeWeight:3,map});}</script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDw09Bg7XaH7apEWJBcFtogVfrdUwF_gEM&language=he&callback=init" async defer></script></body></html>`;

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.PRIMARY }} />
      <View style={s.header}>
        <Text style={s.title}>{t('metro.title')}</Text>
        <TouchableOpacity onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/'); }} style={s.closeBtn}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={s.mapWrap}>
        <WebView originWhitelist={['*']} source={{ html: mapHtml }} style={{ flex: 1 }} scrollEnabled={false} />
      </View>

      <View style={s.filterRow}>
        {(['all', 'red', 'green'] as const).map(id => {
          const active = filter === id;
          const labelMap: Record<string, string> = { all: t('common.all'), red: t('metro.redLine'), green: t('metro.greenLine') };
          const colorMap: Record<string, string> = { all: Colors.TEXT, red: '#E63946', green: '#2A9D8F' };
          return (
            <TouchableOpacity key={id} onPress={() => setFilter(id)} style={[s.chip, active && { backgroundColor: colorMap[id] }]}>
              <Text style={[s.chipTxt, active && { color: '#fff' }]}>{labelMap[id]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={s.hoursBox}>
        <Text style={s.hoursTitle}>{t('metro.hoursTitle')}</Text>
        {METRO.hours.map((h, i) => (
          <View key={i} style={s.hoursRow}>
            <Text style={s.hoursDay}>{h.day}</Text>
            <Text style={s.hoursTime}>{h.open} – {h.close}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={s.plannerBtn} onPress={() => Linking.openURL('https://www.rta.ae/wps/portal/rta/ae/home/journey-planner')}>
        <Text style={s.plannerBtnTxt}>{t('metro.plannerBtn')}</Text>
      </TouchableOpacity>

      <View style={s.searchWrap}>
        <TextInput
          style={s.searchInput}
          placeholder={t('metro.searchPh')}
          placeholderTextColor="#AAB7BD"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {filtered.length === 0 ? (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: Colors.MUTED }}>{t('metro.noStations')}</Text>
          </View>
        ) : filtered.map(station => {
          const isInterchange = station.lines.length > 1;
          const primaryColor = isInterchange ? '#B8923A' : (station.lines[0] === 'red' ? '#E63946' : '#2A9D8F');
          return (
            <TouchableOpacity
              key={station.id}
              style={s.stationRow}
              onPress={() => openMapsChoice(station.lat, station.lng, station.nameHe, 'navigate')}
            >
              <View style={[s.stationDot, { backgroundColor: primaryColor }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.stationName}>{lang === 'ar' ? tcAr(station.nameHe) : lang === 'hi' ? tcHi(station.nameHe) : lang === 'ru' ? tcRu(station.nameHe) : lang === 'en' ? station.nameEn : station.nameHe}</Text>
                <Text style={s.stationMeta}>{lang === 'ar' ? tcAr(station.nameEn) : lang === 'hi' ? tcHi(station.nameEn) : lang === 'ru' ? tcRu(station.nameEn) : lang === 'en' ? station.nameHe : station.nameEn} · {station.area}{isInterchange ? ' · ' + t('metro.interchange') : ''}</Text>
              </View>
              <Text style={s.navArrow}>{t('metro.navigate')}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const makeStyles = (isRTL: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', backgroundColor: Colors.PRIMARY, paddingHorizontal: 16, paddingVertical: 14, gap: 10 },
  title: { flex: 1, color: '#fff', fontSize: 24, fontWeight: '400', letterSpacing: 0.3, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  mapWrap: { height: 280, backgroundColor: '#E5E7EB' },
  filterRow: { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8, padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EAE0CE' },
  chip: { flex: 1, paddingVertical: 12, alignItems: 'center', backgroundColor: '#F0E6D2', borderRadius: 0 },
  chipTxt: { color: Colors.TEXT, fontWeight: '600', fontSize: 14, letterSpacing: 0.2 },
  hoursBox: { backgroundColor: '#FAF6EE', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EAE0CE' },
  hoursTitle: { color: Colors.MUTED, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6, textTransform: 'uppercase', writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  hoursRow: { flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', paddingVertical: 3 },
  hoursDay: { color: Colors.TEXT, fontSize: 14, fontWeight: '600', writingDirection: isRTL ? 'rtl' : 'ltr' },
  hoursTime: { color: Colors.TEXT, fontSize: 14, fontWeight: '500' },
  plannerBtn: { backgroundColor: '#F2861B', paddingVertical: 16, paddingHorizontal: 16, alignItems: 'center', borderRadius: 0 },
  plannerBtnTxt: { color: '#fff', fontWeight: '600', fontSize: 15, letterSpacing: 0.2 },
  searchWrap: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6, backgroundColor: '#fff' },
  searchInput: { backgroundColor: '#FAF6EE', paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, color: Colors.TEXT, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left', borderRadius: 0 },
  stationRow: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#EAE0CE', backgroundColor: '#fff' },
  stationDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#fff' },
  stationName: { color: Colors.TEXT, fontSize: 18, fontWeight: '500', letterSpacing: 0.2, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  stationMeta: { color: Colors.MUTED, fontSize: 13, marginTop: 3, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  navArrow: { color: '#1A6B8A', fontSize: 13, fontWeight: '600', letterSpacing: 0.2 },
});
