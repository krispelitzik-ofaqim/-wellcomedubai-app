import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { useI18n } from '../constants/i18n';
import { tcRu } from '../constants/contentRu';
import { tcHi } from '../constants/contentHi';
import { tcAr } from '../constants/contentAr';

const GYG_PARTNER = 'PE2GLSE3MAO4YDEIXLNOYXMC67BCZ32C';
// Affiliate-tracked GetYourGuide search for a specific event (no generic landing).
const eventUrl = (name: string) => `https://www.getyourguide.com/s/?q=${encodeURIComponent(name + ' Dubai')}&partner_id=${GYG_PARTNER}`;

const EVENTS = [
  { month: 1, day: '7-8.1',    name: 'Dubai Marathon',                 cat: 'sport',   desc: 'מרתון בינלאומי 42K — אחד המהירים בעולם.', descEn: 'International 42K marathon — one of the fastest in the world.' },
  { month: 1, day: '16-19.1',  name: 'Dubai Desert Classic',           cat: 'sport',   desc: 'טורניר גולף DP World Tour ב-Emirates GC.', descEn: 'DP World Tour golf tournament at Emirates GC.' },
  { month: 1, day: '1-31.1',   name: 'Dubai Shopping Festival',        cat: 'culture', desc: 'ענק קניות, מבצעים, מופעים ולייזר ברחבי העיר.', descEn: 'Huge shopping, deals, shows and laser displays across the city.' },
  { month: 2, day: '22-29.2',  name: 'Dubai Tennis Championships',     cat: 'sport',   desc: 'טורניר טניס בינלאומי — אורחים מובילים.', descEn: 'International tennis tournament — top players.' },
  { month: 3, day: '28.3',     name: 'Dubai World Cup',                cat: 'sport',   desc: 'גביע מרוצי הסוסים הגדול בעולם — Meydan.', descEn: "The world's richest horse race — Meydan." },
  { month: 3, day: '5-9.3',    name: 'Art Dubai',                      cat: 'culture', desc: 'יריד אמנות בינלאומי — Madinat Jumeirah.', descEn: 'International art fair — Madinat Jumeirah.' },
  { month: 5, day: '27-31.5',  name: 'Eid al-Adha Festival',           cat: 'culture', desc: 'חג מוסלמי — אירועים ומבצעים בכל העיר.', descEn: 'Muslim holiday — events and deals across the city.' },
  { month: 7, day: '1.7-31.8', name: 'Dubai Summer Surprises',         cat: 'culture', desc: 'פסטיבל קניות קיץ — מבצעים עצומים.', descEn: 'Summer shopping festival — massive deals.' },
  { month: 11, day: '28-30.11',name: 'F1 Abu Dhabi GP',                cat: 'sport',   desc: 'גרנד פרי פורמולה 1 ב-Yas Marina (~1.5 שעה מדובאי).', descEn: 'Formula 1 Grand Prix at Yas Marina (~1.5h from Dubai).' },
  { month: 12, day: '2.12',    name: 'UAE National Day',               cat: 'culture', desc: 'יום העצמאות — מצעדים, זיקוקים, חגיגות בכל העיר.', descEn: 'National Day — parades, fireworks, celebrations across the city.' },
  { month: 12, day: '31.12',   name: 'NYE Dubai Fireworks',            cat: 'culture', desc: 'מופע זיקוקים בערב ראש השנה — Burj Khalifa & Atlantis.', descEn: "New Year's Eve fireworks — Burj Khalifa & Atlantis." },
];

const HEB_MONTHS = ['','ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
const EN_MONTHS = ['','January','February','March','April','May','June','July','August','September','October','November','December'];
// One vibrant color per month, drawn from the marketplace palette.
const MONTH_COLORS = ['', '#E76F51','#B85C8E','#2A9D8F','#7B4FA0','#5B9DC7','#C1440E','#3AA0A0','#6B8E5A','#F4A261','#1A6B8A','#7FA77F','#B8923A'];

export default function EventsScreen() {
  const { t, lang, isRTL } = useI18n();
  const s = makeStyles(isRTL);
  const MONTHS = lang === 'ar' ? HEB_MONTHS.map(tcAr) : lang === 'hi' ? HEB_MONTHS.map(tcHi) : lang === 'ru' ? HEB_MONTHS.map(tcRu) : lang === 'en' ? EN_MONTHS : HEB_MONTHS;
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
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#000' }} />
      <View style={s.brandBar}>
        <Text style={s.brandTxt}>
          <Text style={{ color: '#1A6B8A' }}>WellCome </Text>
          <Text style={{ color: '#E76F51' }}>Dubai</Text>
        </Text>
        <TouchableOpacity onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/'); }} style={s.brandClose}>
          <Text style={{ color: '#2C5F6E', fontSize: 18, fontWeight: '700' }}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={s.header}>
        <Text style={[s.title, { flex: 1, textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]}>{t('events.title')}</Text>
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
        {MONTHS.slice(1).map((m, i) => {
          const monthNum = i + 1;
          const mc = MONTH_COLORS[monthNum] || Colors.TEXT;
          const events = futureYear ? [] : EVENTS.filter(e => e.month === monthNum);
          const isCurrent = (activeYear === currentYear) && (monthNum === currentMonth);
          if (futureYear) return null;
          return (
            <View key={m} style={{ marginBottom: 36 }}>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <View style={{ width: 6, height: 26, borderRadius: 3, backgroundColor: mc }} />
                <Text style={{ fontWeight: '400', fontSize: 28, color: mc, letterSpacing: -1 }}>{m}</Text>
                <Text style={{ color: '#9CA3AF', fontSize: 12, fontWeight: '500' }}>
                  {events.length ? `${events.length} ${t('events.count')}` : t('events.none')}{isCurrent ? t('events.thisMonth') : ''}
                </Text>
              </View>
              {events.map((ev, idx) => {
                const dayParts = String(ev.day).split('.');
                const dayNum = dayParts[0] || ev.day;
                const monShort = MONTHS[parseInt(dayParts[1]) || monthNum]?.slice(0, 3) || MONTHS[monthNum].slice(0, 3);
                return (
                  <View key={idx} style={[s.eventRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                    <View style={[s.dayCol, { borderLeftWidth: isRTL ? 1 : 0, borderRightWidth: isRTL ? 0 : 1, borderLeftColor: mc, borderRightColor: mc, paddingLeft: isRTL ? 14 : 0, paddingRight: isRTL ? 0 : 14 }]}>
                      <Text style={[s.dayNum, { color: mc }]}>{dayNum}</Text>
                      <Text style={s.dayMon}>{monShort}</Text>
                    </View>
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <Text style={[s.eventName, { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]}>{ev.name}</Text>
                      <Text style={[s.eventDesc, { writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}>{lang === 'ar' ? tcAr(ev.desc) : lang === 'hi' ? tcHi(ev.desc) : lang === 'ru' ? tcRu(ev.desc) : lang === 'en' ? ev.descEn : ev.desc}</Text>
                      <TouchableOpacity onPress={() => Linking.openURL(eventUrl(ev.name))}>
                        <Text style={[s.ticketLink, { color: mc, textAlign: isRTL ? 'right' : 'left' }]}>{t('events.buyTickets')}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          );
        })}
        {futureYear ? (
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Text style={{ fontSize: 48 }}>📆</Text>
            <Text style={{ color: Colors.MUTED, marginTop: 10, textAlign: 'center' }}>{t('events.pendingPre')}{activeYear}{t('events.pendingPost')}</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const makeStyles = (isRTL: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  brandBar: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  brandTxt: { flex: 1, fontSize: 22, fontWeight: '900', letterSpacing: -0.3, textAlign: 'center' },
  brandClose: { width: 32, alignItems: 'center' },
  header: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: Colors.PRIMARY, gap: 10 },
  back: { padding: 4 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: '400', letterSpacing: 0.3, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  eventRow: { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 18, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(184,146,58,0.15)' },
  dayCol: { flexShrink: 0, alignItems: 'center', minWidth: 60, borderLeftWidth: 1, borderLeftColor: 'rgba(184,146,58,0.4)', paddingLeft: 14 },
  dayNum: { fontWeight: '600', fontSize: 24, color: '#2C5F6E', lineHeight: 26 },
  dayMon: { fontSize: 10, color: '#B8923A', fontWeight: '600', letterSpacing: 1, marginTop: 4 },
  eventName: { fontWeight: '500', color: '#2C5F6E', fontSize: 18, letterSpacing: 0.2, lineHeight: 24, marginBottom: 5, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  eventDesc: { color: '#6B7F8D', fontSize: 13, lineHeight: 20, marginBottom: 8, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  ticketLink: { color: '#E76F51', fontSize: 13, fontWeight: '700', letterSpacing: 0.3, textAlign: isRTL ? 'right' : 'left' },
});
