import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';

const AREAS = [
  { num: 1,  name: 'דאון טאון & ביזנס ביי', color: '#E76F51', desc: 'לב התיירות המודרנית — ברג׳ ח׳ליפה, Dubai Mall, מזרקות, מסעדות גורמה.', lat: 25.1900, lng: 55.2730 },
  { num: 2,  name: 'מרינה & JBR', color: '#2A9D8F', desc: 'רצועת חוף תוססת — יאכטות, JBR, חיי לילה. בין 50 השכונות הכי מגניבות בעולם.', lat: 25.0820, lng: 55.1410 },
  { num: 3,  name: 'פאלם ג׳ומיירה', color: '#B8923A', desc: 'אי מלאכותי בצורת דקל. Atlantis, FIVE Palm, Waldorf Astoria. חופים פרטיים.', lat: 25.1124, lng: 55.1390 },
  { num: 4,  name: 'אל ברשה', color: '#7FA77F', desc: 'Mall of the Emirates, Ski Dubai, מלונות במחירים סבירים.', lat: 25.1100, lng: 55.2050 },
  { num: 5,  name: 'ג׳ומיירה ביץ׳', color: '#A86F8E', desc: '25 ק״מ של חוף — מים טורקיז וחול לבן. ממסגד ג׳ומיירה ועד פאלם.', lat: 25.2200, lng: 55.2400 },
  { num: 6,  name: 'אל וואסל', color: '#5B9DC7', desc: 'בוטיק אורבני — Box Park, City Walk, גלריות, מסעדות שף.', lat: 25.1950, lng: 55.2480 },
  { num: 7,  name: 'טרייד סנטר', color: '#C9A961', desc: 'דרך שייח׳ זאיד — שדרת גורדי השחקים. WTC, מטרו.', lat: 25.2200, lng: 55.2800 },
  { num: 8,  name: 'אל ג׳דאף', color: '#6B8E5A', desc: 'אזור עולה — בית האופרה, פסטיבל סיטי, מלונות חדשים.', lat: 25.2150, lng: 55.3300 },
  { num: 9,  name: 'בור דובאי', color: '#F4A261', desc: 'האזור ההיסטורי — אל-פאהידי, מוזיאון דובאי, סירות אברה. מחירים נוחים.', lat: 25.2570, lng: 55.3000 },
  { num: 10, name: 'דיירה', color: '#B85C8E', desc: 'המסורתי — שוק הזהב, התבלינים, הטקסטיל. ערך מצוין לכסף.', lat: 25.2750, lng: 55.3200 },
];

export default function MapScreen() {
  return (
    <SafeAreaView edges={['top']} style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>אזורי דובאי — 10 שכונות מובילות</Text>
        <Text style={s.subtitle}>לחץ על אזור לראות במפה</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 60 }}>
        {AREAS.map(a => (
          <TouchableOpacity
            key={a.num}
            style={[s.areaCard, { borderRightColor: a.color }]}
            onPress={() => Linking.openURL(`https://www.google.com/maps?q=${a.lat},${a.lng}`)}
          >
            <View style={[s.areaNum, { backgroundColor: a.color }]}>
              <Text style={s.areaNumTxt}>{a.num}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.areaName, { color: a.color }]}>{a.name}</Text>
              <Text style={s.areaDesc}>{a.desc}</Text>
            </View>
            <Text style={s.openIcon}>↗</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { paddingHorizontal: 18, paddingTop: 8, paddingBottom: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8DEC8' },
  title: { fontSize: 17, fontWeight: '900', color: '#1A4A5E', writingDirection: 'rtl', textAlign: 'right' },
  subtitle: { color: Colors.MUTED, fontSize: 12, marginTop: 2, writingDirection: 'rtl', textAlign: 'right' },
  areaCard: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 8, borderRightWidth: 4, borderWidth: 1, borderColor: '#E8DEC8' },
  areaNum: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  areaNumTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
  areaName: { fontSize: 14, fontWeight: '900', writingDirection: 'rtl', textAlign: 'right' },
  areaDesc: { color: Colors.MUTED, fontSize: 11, marginTop: 3, lineHeight: 15, writingDirection: 'rtl', textAlign: 'right' },
  openIcon: { color: Colors.PRIMARY, fontSize: 20, fontWeight: '700' },
});
