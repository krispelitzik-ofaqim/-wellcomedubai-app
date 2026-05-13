import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import METRO from '../data/metro.json';

type LineId = 'red' | 'green' | 'all';

export default function MetroScreen() {
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

  const mapHtml = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#m{margin:0;padding:0;height:100%;width:100%;}</style></head><body><div id="m"></div><script>function init(){const map=new google.maps.Map(document.getElementById('m'),{center:{lat:25.18,lng:55.25},zoom:11,mapTypeControl:false,streetViewControl:false,fullscreenControl:false});const stations=${JSON.stringify(mapStations)};const redPath=[];const greenPath=[];stations.forEach(s=>{const pos={lat:s.lat,lng:s.lng};const isRed=s.lines.includes('red');const isGreen=s.lines.includes('green');const isInter=isRed&&isGreen;const color=isInter?'#B8923A':(isRed?'${redLine.color}':'${greenLine.color}');new google.maps.Marker({position:pos,map,title:s.nameHe,icon:{path:google.maps.SymbolPath.CIRCLE,scale:isInter?9:6,fillColor:color,fillOpacity:1,strokeColor:'#fff',strokeWeight:2}});if(isRed)redPath.push(pos);if(isGreen)greenPath.push(pos);});if(redPath.length>1)new google.maps.Polyline({path:redPath,geodesic:true,strokeColor:'${redLine.color}',strokeOpacity:0.8,strokeWeight:3,map});if(greenPath.length>1)new google.maps.Polyline({path:greenPath,geodesic:true,strokeColor:'${greenLine.color}',strokeOpacity:0.8,strokeWeight:3,map});}</script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDw09Bg7XaH7apEWJBcFtogVfrdUwF_gEM&language=he&callback=init" async defer></script></body></html>`;

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.PRIMARY }} />
      <View style={s.header}>
        <Text style={s.title}>מטרו דובאי</Text>
        <TouchableOpacity onPress={() => router.back()} style={s.closeBtn}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={s.mapWrap}>
        <WebView originWhitelist={['*']} source={{ html: mapHtml }} style={{ flex: 1 }} scrollEnabled={false} />
      </View>

      <View style={s.filterRow}>
        {(['all', 'red', 'green'] as const).map(id => {
          const active = filter === id;
          const labelMap: Record<string, string> = { all: 'הכל', red: 'הקו האדום', green: 'הקו הירוק' };
          const colorMap: Record<string, string> = { all: Colors.TEXT, red: '#E63946', green: '#2A9D8F' };
          return (
            <TouchableOpacity key={id} onPress={() => setFilter(id)} style={[s.chip, active && { backgroundColor: colorMap[id] }]}>
              <Text style={[s.chipTxt, active && { color: '#fff' }]}>{labelMap[id]}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={s.hoursBox}>
        <Text style={s.hoursTitle}>שעות פעילות</Text>
        {METRO.hours.map((h, i) => (
          <View key={i} style={s.hoursRow}>
            <Text style={s.hoursDay}>{h.day}</Text>
            <Text style={s.hoursTime}>{h.open} – {h.close}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={s.plannerBtn} onPress={() => Linking.openURL('https://www.rta.ae/wps/portal/rta/ae/home/journey-planner')}>
        <Text style={s.plannerBtnTxt}>תכנן מסלול ב-RTA ←</Text>
      </TouchableOpacity>

      <View style={s.searchWrap}>
        <TextInput
          style={s.searchInput}
          placeholder="חיפוש תחנה / אזור..."
          placeholderTextColor="#AAB7BD"
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {filtered.length === 0 ? (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ color: Colors.MUTED }}>לא נמצאו תחנות</Text>
          </View>
        ) : filtered.map(station => {
          const isInterchange = station.lines.length > 1;
          const primaryColor = isInterchange ? '#B8923A' : (station.lines[0] === 'red' ? '#E63946' : '#2A9D8F');
          return (
            <TouchableOpacity
              key={station.id}
              style={s.stationRow}
              onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}&travelmode=transit&hl=he`)}
            >
              <View style={[s.stationDot, { backgroundColor: primaryColor }]} />
              <View style={{ flex: 1 }}>
                <Text style={s.stationName}>{station.nameHe}</Text>
                <Text style={s.stationMeta}>{station.nameEn} · {station.area}{isInterchange ? ' · החלפה' : ''}</Text>
              </View>
              <Text style={s.navArrow}>נווט ←</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: Colors.PRIMARY, paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  title: { flex: 1, color: '#fff', fontSize: 17, fontWeight: '900', writingDirection: 'rtl', textAlign: 'right' },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  mapWrap: { height: 280, backgroundColor: '#E5E7EB' },
  filterRow: { flexDirection: 'row-reverse', gap: 8, padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0E6D2' },
  chip: { flex: 1, paddingVertical: 9, alignItems: 'center', backgroundColor: '#F0E6D2' },
  chipTxt: { color: Colors.TEXT, fontWeight: '800', fontSize: 13 },
  hoursBox: { backgroundColor: '#FAF6EE', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0E6D2' },
  hoursTitle: { color: Colors.MUTED, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6, textTransform: 'uppercase', writingDirection: 'rtl', textAlign: 'right' },
  hoursRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 3 },
  hoursDay: { color: Colors.TEXT, fontSize: 13, fontWeight: '700', writingDirection: 'rtl' },
  hoursTime: { color: Colors.TEXT, fontSize: 13, fontWeight: '600' },
  plannerBtn: { backgroundColor: Colors.PRIMARY, padding: 14, alignItems: 'center' },
  plannerBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
  searchWrap: { paddingHorizontal: 14, paddingTop: 12, paddingBottom: 4, backgroundColor: '#fff' },
  searchInput: { backgroundColor: '#FAF6EE', paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: Colors.TEXT, writingDirection: 'rtl', textAlign: 'right' },
  stationRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0E6D2', backgroundColor: '#fff' },
  stationDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 2, borderColor: '#fff', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  stationName: { color: Colors.TEXT, fontSize: 15, fontWeight: '800', writingDirection: 'rtl', textAlign: 'right' },
  stationMeta: { color: Colors.MUTED, fontSize: 11.5, marginTop: 2, writingDirection: 'rtl', textAlign: 'right' },
  navArrow: { color: Colors.PRIMARY, fontSize: 12.5, fontWeight: '700' },
});
