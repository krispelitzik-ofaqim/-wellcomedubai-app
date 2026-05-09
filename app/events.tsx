import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';

const EVENTS = [
  { month: 1, day: '7-8.1',    name: 'Dubai Marathon',                 cat: 'sport',   desc: 'מרתון בינלאומי 42K — אחד המהירים בעולם.' },
  { month: 1, day: '16-19.1',  name: 'Dubai Desert Classic',           cat: 'sport',   desc: 'טורניר גולף DP World Tour ב-Emirates GC.' },
  { month: 1, day: '1-31.1',   name: 'Dubai Shopping Festival',        cat: 'culture', desc: 'ענק קניות, מבצעים, מופעים ולייזר ברחבי העיר.' },
  { month: 2, day: '22-29.2',  name: 'Dubai Tennis Championships',     cat: 'sport',   desc: 'טורניר טניס בינלאומי — אורחים מובילים.' },
  { month: 3, day: '28.3',     name: 'Dubai World Cup',                cat: 'sport',   desc: 'גביע מרוצי הסוסים הגדול בעולם — Meydan.' },
  { month: 3, day: '5-9.3',    name: 'Art Dubai',                      cat: 'culture', desc: 'יריד אמנות בינלאומי — Madinat Jumeirah.' },
  { month: 5, day: '27-31.5',  name: 'Eid al-Adha Festival',           cat: 'culture', desc: 'חג מוסלמי — אירועים ומבצעים בכל העיר.' },
  { month: 7, day: '1.7-31.8', name: 'Dubai Summer Surprises',         cat: 'culture', desc: 'פסטיבל קניות קיץ — מבצעים עצומים.' },
  { month: 11, day: '28-30.11',name: 'F1 Abu Dhabi GP',                cat: 'sport',   desc: 'גרנד פרי פורמולה 1 ב-Yas Marina (~1.5 שעה מדובאי).' },
  { month: 12, day: '2.12',    name: 'UAE National Day',               cat: 'culture', desc: 'יום העצמאות — מצעדים, זיקוקים, חגיגות בכל העיר.' },
  { month: 12, day: '31.12',   name: 'NYE Dubai Fireworks',            cat: 'culture', desc: 'מופע זיקוקים בערב ראש השנה — Burj Khalifa & Atlantis.' },
];

const HEB_MONTHS = ['','ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];

export default function EventsScreen() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;
  const [activeYear, setActiveYear] = useState(currentYear);
  const years = [currentYear, currentYear + 1, currentYear + 2, currentYear + 3, currentYear + 4];
  const futureYear = activeYear > currentYear + 1;
  const yearBg: Record<number, string> = {
    [currentYear]: '#FAF6EE',
    [currentYear+1]: '#FBF3F4',
    [currentYear+2]: '#F0F7F4',
    [currentYear+3]: '#F9F2DD',
    [currentYear+4]: '#FCF1ED'
  };

  return (
    <SafeAreaView edges={['top']} style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={{ fontSize: 22, color: '#fff' }}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>📅 לוח אירועים</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 60, backgroundColor: yearBg[activeYear] || '#FAF6EE' }}>
        {/* Year tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 32, paddingBottom: 8, marginBottom: 24 }} style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(184,146,58,0.2)', flexGrow: 0 }}>
          {years.map(y => {
            const isActive = y === activeYear;
            return (
              <TouchableOpacity key={y} onPress={() => setActiveYear(y)} style={{ paddingVertical: 8, borderBottomWidth: 1.5, borderBottomColor: isActive ? Colors.GOLD : 'transparent' }}>
                <Text style={{ fontSize: 18, fontWeight: isActive ? '900' : '500', color: isActive ? Colors.TEXT : '#9CA3AF', letterSpacing: 0.5 }}>{y}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Months */}
        {HEB_MONTHS.slice(1).map((m, i) => {
          const monthNum = i + 1;
          const events = futureYear ? [] : EVENTS.filter(e => e.month === monthNum);
          const isCurrent = (activeYear === currentYear) && (monthNum === currentMonth);
          if (futureYear) return null;
          return (
            <View key={m} style={{ marginBottom: 36 }}>
              <View style={{ flexDirection: 'row-reverse', alignItems: 'baseline', gap: 12, marginBottom: 12 }}>
                <Text style={{ fontWeight: '300', fontSize: 28, color: isCurrent ? Colors.ACCENT : Colors.TEXT, letterSpacing: -1 }}>{m}</Text>
                <Text style={{ color: '#9CA3AF', fontSize: 12, fontWeight: '500' }}>
                  {events.length ? `${events.length} אירועים` : 'אין אירועים'}{isCurrent ? ' · החודש' : ''}
                </Text>
              </View>
              {events.map((ev, idx) => (
                <View key={idx} style={s.eventCard}>
                  <View style={s.eventDay}>
                    <Text style={s.eventDayTxt}>{ev.day}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.eventName}>{ev.name}</Text>
                    <Text style={s.eventDesc}>{ev.desc}</Text>
                    <View style={[s.catChip, { backgroundColor: ev.cat === 'sport' ? Colors.SECONDARY + '25' : Colors.PINK + '25' }]}>
                      <Text style={[s.catChipTxt, { color: ev.cat === 'sport' ? Colors.SECONDARY : Colors.PINK }]}>
                        {ev.cat === 'sport' ? '⚽ ספורט' : '🎉 תרבות'}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          );
        })}
        {futureYear ? (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Text style={{ fontSize: 48 }}>📆</Text>
            <Text style={{ color: Colors.MUTED, marginTop: 10, textAlign: 'center' }}>נתוני {activeYear} יפורסמו קרוב לתאריך</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: Colors.PRIMARY, gap: 10 },
  back: { padding: 4 },
  title: { color: '#fff', fontSize: 17, fontWeight: '900', writingDirection: 'rtl' },
  eventCard: { flexDirection: 'row-reverse', backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E8DEC8', gap: 12, alignItems: 'flex-start' },
  eventDay: { backgroundColor: Colors.PRIMARY, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, minWidth: 56, alignItems: 'center' },
  eventDayTxt: { color: '#fff', fontSize: 11, fontWeight: '800' },
  eventName: { fontSize: 14, fontWeight: '900', color: Colors.TEXT, writingDirection: 'rtl', textAlign: 'right' },
  eventDesc: { color: Colors.MUTED, fontSize: 12, marginTop: 4, lineHeight: 17, writingDirection: 'rtl', textAlign: 'right' },
  catChip: { alignSelf: 'flex-end', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, marginTop: 6 },
  catChipTxt: { fontSize: 10, fontWeight: '800' },
});
