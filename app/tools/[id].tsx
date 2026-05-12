import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function ToolScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#000' }} />
      <View style={s.header}>
        <View style={{ width: 32 }} />
        <View style={{ flex: 1, alignItems: 'flex-end' }}>
          <Text style={s.brand}>
            <Text style={{ color: '#9AA5AD', fontWeight: '300' }}>WellCome </Text>
            <Text style={{ color: '#E76F51', fontWeight: '900' }}>Dubai</Text>
          </Text>
        </View>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={{ fontSize: 22, color: '#2C5F6E', fontWeight: '700' }}>✕</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 14 }}>
        {id === 'currency' && <Currency />}
        {id === 'weather' && <Weather />}
        {id === 'flights' && <Flights />}
      </ScrollView>
    </View>
  );
}

type CurCode = 'ILS' | 'AED' | 'USD' | 'EUR';
const CUR_FLAGS: Record<CurCode, string> = { ILS: '🇮🇱', AED: '🇦🇪', USD: '🇺🇸', EUR: '🇪🇺' };
const CUR_NAMES: Record<CurCode, string> = { ILS: 'שקל', AED: 'דירהם', USD: 'דולר', EUR: 'יורו' };
const CUR_ORDER: CurCode[] = ['EUR', 'USD', 'AED', 'ILS'];

function Currency() {
  const [rates, setRates] = useState<Record<CurCode, number> | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [from, setFrom] = useState<CurCode>('ILS');

  const load = () => {
    setLoading(true);
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(d => {
        if (d.rates) setRates({ ILS: d.rates.ILS, AED: d.rates.AED, USD: 1, EUR: d.rates.EUR });
        const src = d.time_last_update_utc;
        if (src) {
          const dt = new Date(src);
          const pad = (n: number) => String(n).padStart(2, '0');
          setLastUpdate(`${pad(dt.getDate())}/${pad(dt.getMonth() + 1)} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const convert = (to: CurCode) => {
    if (!rates || !amount) return '—';
    const num = parseFloat(amount);
    if (isNaN(num)) return '—';
    const inUsd = num / rates[from];
    return (inUsd * rates[to]).toFixed(2);
  };

  const others = CUR_ORDER.filter(c => c !== from);

  return (
    <View style={s.curWrap}>
      <View style={{ alignItems: 'center', marginTop: 4 }}>
        <Text style={s.curTitle}>המרת מטבעות</Text>
        <Text style={s.curSub}>שערים מתעדכנים בזמן אמת</Text>
        <Text style={s.curUpdated}>{loading ? 'טוען...' : (lastUpdate ? `עודכן: ${lastUpdate}` : '')}</Text>
      </View>

      <TouchableOpacity onPress={load} style={s.curRefresh}>
        <Text style={{ color: '#fff', fontSize: 14 }}>🔄</Text>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>רענן נתונים</Text>
      </TouchableOpacity>

      {!rates ? (
        <Text style={{ color: '#fff', textAlign: 'center', opacity: 0.85, marginTop: 30 }}>⏳ טוען שערי מטבע...</Text>
      ) : (
        <>
          <View style={s.curFromRow}>
            {CUR_ORDER.map(c => {
              const active = c === from;
              return (
                <TouchableOpacity key={c} onPress={() => setFrom(c)} style={[s.curFromBtn, active && s.curFromBtnOn]}>
                  <Text style={{ fontSize: 18 }}>{CUR_FLAGS[c]}</Text>
                  <Text style={[s.curFromTxt, active && s.curFromTxtOn]}>{CUR_NAMES[c]}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={s.curAmountBox}>
            <TextInput
              style={s.curAmountInput}
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder={`הקלד סכום ב${CUR_NAMES[from]}`}
              placeholderTextColor="rgba(255,255,255,0.7)"
            />
            {!!amount && (
              <TouchableOpacity onPress={() => setAmount('')} style={s.curClear}>
                <Text style={{ color: '#fff', fontSize: 13 }}>×</Text>
              </TouchableOpacity>
            )}
          </View>

          {others.map(c => (
            <View key={c} style={s.curResult}>
              <View style={{ flexDirection: 'row-reverse', alignItems: 'baseline', justifyContent: 'center', gap: 8 }}>
                <Text style={{ fontSize: 24 }}>{CUR_FLAGS[c]}</Text>
                <Text style={s.curResultVal}>{convert(c)}</Text>
                <Text style={s.curResultName}>{CUR_NAMES[c]}</Text>
              </View>
              <Text style={s.curResultRate}>1 {CUR_NAMES[from]} = {(rates[c] / rates[from]).toFixed(4)} {CUR_NAMES[c]}</Text>
            </View>
          ))}

          <Text style={s.curSource}>מקור: open.er-api.com (שערים גלובליים, מתעדכנים יומית)</Text>
        </>
      )}
    </View>
  );
}

function wmoCondition(code: number): string {
  const m: Record<number, string> = {
    0: 'בהיר', 1: 'כמעט בהיר', 2: 'מעונן חלקית', 3: 'מעונן',
    45: 'ערפל', 48: 'ערפל מקפיא',
    51: 'טפטוף קל', 53: 'טפטוף', 55: 'טפטוף חזק',
    61: 'גשם קל', 63: 'גשם', 65: 'גשם חזק',
    71: 'שלג קל', 73: 'שלג', 75: 'שלג חזק',
    80: 'ממטרים', 81: 'ממטרים', 82: 'ממטרים חזקים',
    95: 'סופת רעמים', 96: 'סופת ברד', 99: 'סופת ברד חזקה',
  };
  return m[code] || 'לא ידוע';
}
function wmoEmoji(code: number): string {
  if (code === 0 || code === 1) return '☀️';
  if (code === 2) return '🌤️';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if (code >= 51 && code <= 65) return '🌧️';
  if (code >= 71 && code <= 75) return '❄️';
  if (code >= 80 && code <= 82) return '🌦️';
  if (code >= 95) return '⛈️';
  return '🌡️';
}

function Weather() {
  const [w, setW] = useState<any>(null);
  const dayNames = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=25.2048&longitude=55.2708&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,uv_index&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=7')
      .then(r => r.json())
      .then(setW)
      .catch(() => {});
  }, []);

  if (!w) return <View style={s.center}><Text style={s.muted}>⏳ טוען מזג אוויר...</Text></View>;

  const c = w.current || {};
  const code = c.weather_code;
  const days = w.daily?.time || [];

  return (
    <View>
      <View style={s.wCurrent}>
        <Text style={s.wNow}>דובאי עכשיו</Text>
        <Text style={s.wIconBig}>{wmoEmoji(code)}</Text>
        <Text style={s.wTempBig}>{Math.round(c.temperature_2m)}°C</Text>
        <Text style={s.wCondBig}>{wmoCondition(code)}</Text>
        <View style={s.wStatsRow}>
          <Text style={s.wStat}>🌡️ מרגיש {Math.round(c.apparent_temperature)}°</Text>
          <Text style={s.wStat}>💧 לחות {Math.round(c.relative_humidity_2m)}%</Text>
          <Text style={s.wStat}>🌬️ {Math.round(c.wind_speed_10m)} קמ"ש</Text>
          <Text style={s.wStat}>☀️ UV {Math.round((c.uv_index || 0) * 10) / 10}</Text>
        </View>
      </View>

      <View style={s.wForecastBox}>
        <Text style={s.wForecastTitle}>תחזית שבועית</Text>
        {days.map((d: string, i: number) => {
          const dn = new Date(d).getDay();
          const dt = new Date(d);
          const dateStr = `${dt.getDate()}/${dt.getMonth() + 1}`;
          return (
            <View key={d} style={s.wForecastRow}>
              <Text style={s.wFcDayName}>{dayNames[dn]}</Text>
              <Text style={s.wFcDate}>{dateStr}</Text>
              <Text style={s.wFcIcon}>{wmoEmoji(w.daily.weather_code[i])}</Text>
              <Text style={s.wFcCond} numberOfLines={1}>{wmoCondition(w.daily.weather_code[i])}</Text>
              <Text style={s.wFcMax}>{Math.round(w.daily.temperature_2m_max[i])}°</Text>
              <Text style={s.wFcMin}>{Math.round(w.daily.temperature_2m_min[i])}°</Text>
            </View>
          );
        })}
      </View>

    </View>
  );
}

const RAPID_KEY = '425b399aaamsh5f1513665b08931p1f07b6jsne67eed469583';
const AERO_HOST = 'aerodatabox.p.rapidapi.com';

type Flight = {
  flight: string; airline: string; origin: string; originCode: string;
  destination: string; destinationCode: string; scheduled: string; actual: string;
  terminal: string; status: string; isTLV: boolean;
};

function fmtTime(iso: string) {
  if (!iso) return '';
  const parts = iso.split('T');
  return parts[1] ? parts[1].substring(0, 5) : '';
}

function statusBg(status: string) {
  const x = (status || '').toLowerCase();
  if (x.includes('landed') || x.includes('arrived') || x.includes('departed') || x.includes('en route')) return '#E6F7F5';
  if (x.includes('cancelled')) return '#FEE2E2';
  if (x.includes('delayed')) return '#FFF3E0';
  if (x.includes('boarding') || x.includes('gate')) return '#E8F5E9';
  return '#EEF2F7';
}

function statusColor(status: string) {
  const x = (status || '').toLowerCase();
  if (x.includes('landed') || x.includes('arrived') || x.includes('departed') || x.includes('en route')) return '#0D9488';
  if (x.includes('cancelled')) return '#DC2626';
  if (x.includes('delayed')) return '#D97706';
  return '#2C5F6E';
}

function statusHe(status: string) {
  const x = (status || '').toLowerCase();
  if (x.includes('landed')) return 'נחת';
  if (x.includes('arrived')) return 'הגיע';
  if (x.includes('departed')) return 'המריא';
  if (x.includes('en route')) return 'בדרך';
  if (x.includes('cancelled')) return 'בוטל';
  if (x.includes('delayed')) return 'מאחר';
  if (x.includes('scheduled')) return 'מתוכנן';
  if (x.includes('expected')) return 'צפוי';
  if (x.includes('boarding')) return 'עולים';
  if (x.includes('gate')) return 'שער';
  return status || '';
}

function Flights() {
  const [direction, setDirection] = useState<'Departure' | 'Arrival'>('Departure');
  const [flights, setFlights] = useState<Flight[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    setLoading(true);
    setFlights(null);
    const dt = new Date();
    const from = dt.toISOString().split('.')[0];
    const to = new Date(dt.getTime() + 12 * 60 * 60 * 1000).toISOString().split('.')[0];

    fetch(`https://aerodatabox.p.rapidapi.com/flights/airports/icao/OMDB/${from}/${to}?direction=${direction}&withCancelled=false&withCodeshared=false&withLocation=false`,
      { headers: { 'x-rapidapi-key': RAPID_KEY, 'x-rapidapi-host': AERO_HOST } })
      .then(r => r.json())
      .then(data => {
        const isDep = direction === 'Departure';
        const arr = (isDep ? data.departures : data.arrivals) || [];
        const result: Flight[] = arr.slice(0, 100).map((f: any) => {
          const m = f.movement || {};
          const ap = m.airport || {};
          const codes = [ap.iata, ap.icao].filter(Boolean).map((c: string) => String(c).toUpperCase());
          const name = String(ap.name || '').toLowerCase();
          const airline = String(f.airline?.name || '').toLowerCase();
          const isTLV = codes.includes('TLV') || codes.includes('LLBG') || name.includes('tel aviv') || name.includes('ben gurion') || airline.includes('el al') || airline.includes('israir') || airline.includes('arkia');
          return {
            flight: f.number || '',
            airline: f.airline?.name || '',
            origin: isDep ? 'DXB' : (ap.name || ap.icao || ''),
            originCode: isDep ? 'DXB' : (ap.iata || ''),
            destination: isDep ? (ap.name || ap.icao || '') : 'DXB',
            destinationCode: isDep ? (ap.iata || '') : 'DXB',
            scheduled: m.scheduledTime?.local || m.scheduledTimeLocal || '',
            actual: m.actualTime?.local || m.revisedTime?.local || m.predictedTime?.local || '',
            terminal: m.terminal || '',
            status: f.status || '',
            isTLV,
          };
        });
        const tlv = result.filter(f => f.isTLV);
        setFlights(tlv.length > 0 ? tlv : result);
      })
      .catch(() => setFlights([]))
      .finally(() => setLoading(false));
  }, [direction]);

  const dubaiTime = now.toLocaleTimeString('he-IL', { timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit' });
  const isDep = direction === 'Departure';

  return (
    <View>
      <View style={s.fbHeader}>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>נמל התעופה דובאי (DXB)</Text>
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 4 }}>
          {now.toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: 10 }}>
          <TouchableOpacity onPress={() => setDirection('Departure')} style={[s.fbTab, isDep && s.fbTabOn]}>
            <Text style={[s.fbTabTxt, isDep && s.fbTabTxtOn]}>↑ המראות</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDirection('Arrival')} style={[s.fbTab, !isDep && s.fbTabOn]}>
            <Text style={[s.fbTabTxt, !isDep && s.fbTabTxtOn]}>↓ נחיתות</Text>
          </TouchableOpacity>
          <Text style={{ color: '#B8923A', fontWeight: '700', fontSize: 13, marginLeft: 'auto' }}>{dubaiTime} 🇦🇪</Text>
        </View>
      </View>

      <View style={s.fbBody}>
        {loading && <Text style={[s.muted, { textAlign: 'center', padding: 20 }]}>⏳ טוען לוח טיסות...</Text>}
        {!loading && flights && flights.length === 0 && (
          <Text style={[s.muted, { textAlign: 'center', padding: 20 }]}>לא ניתן לטעון נתוני טיסות כרגע.</Text>
        )}
        {!loading && flights && flights.length > 0 && (
          <>
            <View style={s.fbRowHead}>
              <Text style={s.fbColFlight}>טיסה</Text>
              <Text style={s.fbColCode}>{isDep ? 'יעד' : 'מוצא'}</Text>
              <Text style={s.fbColAirline}>חברה</Text>
              <Text style={s.fbColStatus}>סטטוס</Text>
            </View>
            {flights.map((f, i) => (
              <View key={i} style={[s.fbRow, f.isTLV && { backgroundColor: '#FFF8E7' }]}>
                <Text style={[s.fbColFlight, { color: '#E76F51', fontWeight: '700' }]}>{f.flight}</Text>
                <Text style={[s.fbColCode, { color: '#2A9D8F', fontWeight: '800' }]}>{(isDep ? f.destinationCode : f.originCode) || '—'}</Text>
                <Text style={[s.fbColAirline, { color: Colors.TEXT }]} numberOfLines={1}>{f.airline}</Text>
                <View style={[s.fbColStatusBox, { backgroundColor: statusBg(f.status) }]}>
                  <Text style={{ color: statusColor(f.status), fontSize: 10, fontWeight: '700' }}>{statusHe(f.status)}</Text>
                </View>
              </View>
            ))}
            <Text style={s.timestamp}>עודכן: {now.toLocaleTimeString('he-IL')} · DXB</Text>
          </>
        )}
      </View>

      <TouchableOpacity style={[s.tapBtn, { backgroundColor: Colors.SECONDARY, marginTop: 12 }]} onPress={async () => { const url = 'https://www.aviasales.com/search/TLV01DXB01?marker=X5SEJjUA'; const ok = await Linking.canOpenURL(url); if (ok) await Linking.openURL(url); }}>
        <Text style={s.tapBtnTxt}>חפש טיסות באוויאסיילס</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#fff', gap: 10, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  back: { padding: 4 },
  title: { color: '#fff', fontSize: 17, fontWeight: '900', writingDirection: 'rtl' },
  brand: { fontSize: 16, fontWeight: '900', letterSpacing: -0.3, fontFamily: 'System', textAlign: 'right', writingDirection: 'rtl' },
  center: { alignItems: 'center', padding: 40, gap: 12 },
  muted: { color: Colors.MUTED, fontSize: 14 },
  bigStat: { fontSize: 24, fontWeight: '900', color: Colors.PRIMARY, textAlign: 'center', marginTop: 14 },
  bigStatSub: { color: Colors.MUTED, fontSize: 12, textAlign: 'center', marginTop: 4 },
  row: { flexDirection: 'row-reverse', alignItems: 'flex-end', gap: 10, marginTop: 22 },
  field: { flex: 1 },
  fieldLabel: { color: Colors.TEXT, fontSize: 12, fontWeight: '700', marginBottom: 6, writingDirection: 'rtl' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E8DEC8', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 14, fontSize: 22, fontWeight: '800', color: Colors.TEXT, textAlign: 'center' },
  equals: { fontSize: 22, fontWeight: '900', color: Colors.MUTED, paddingBottom: 16 },
  tipBox: { backgroundColor: '#FDF6EC', borderColor: Colors.GOLD, borderWidth: 1, borderRadius: 10, padding: 12, marginTop: 22 },
  tipTitle: { color: Colors.GOLD, fontWeight: '900', fontSize: 13, marginBottom: 4, writingDirection: 'rtl', textAlign: 'right' },
  tipTxt: { color: Colors.TEXT, fontSize: 12, lineHeight: 18, writingDirection: 'rtl', textAlign: 'right' },
  weatherHero: { alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 20, marginTop: 10 },
  weatherIcon: { fontSize: 60 },
  weatherTemp: { fontSize: 48, fontWeight: '900', color: Colors.PRIMARY, marginTop: 8 },
  weatherCity: { color: Colors.MUTED, fontSize: 14, marginTop: 4 },
  metricsRow: { flexDirection: 'row-reverse', gap: 10, marginTop: 12 },
  metric: { flex: 1, backgroundColor: '#fff', borderRadius: 10, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: '#E8DEC8' },
  metricVal: { fontSize: 22, fontWeight: '900', color: Colors.PRIMARY },
  metricLabel: { color: Colors.MUTED, fontSize: 11, marginTop: 4 },
  dayRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', backgroundColor: '#fff', padding: 12, borderRadius: 8, marginBottom: 6, borderWidth: 1, borderColor: '#E8DEC8' },
  dayName: { color: Colors.TEXT, fontWeight: '700', fontSize: 13 },
  dayTemp: { color: Colors.PRIMARY, fontWeight: '900', fontSize: 14 },
  tapBtn: { backgroundColor: Colors.PRIMARY, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 10, alignSelf: 'stretch', alignItems: 'center', marginTop: 14 },
  tapBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
  cardTitle: { fontSize: 16, fontWeight: '900', color: Colors.TEXT, textAlign: 'right', writingDirection: 'rtl', marginBottom: 12 },
  rateGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  rateCard: { flexBasis: '48%', backgroundColor: '#F5E6CB', borderRadius: 8, padding: 10, flexDirection: 'row-reverse', justifyContent: 'center', alignItems: 'center' },
  rateLead: { fontWeight: '900', fontSize: 13 },
  rateBody: { color: Colors.TEXT, fontSize: 12, fontWeight: '700' },
  pillRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6 },
  pill: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff' },
  pillOn: { backgroundColor: Colors.PRIMARY, borderColor: Colors.PRIMARY },
  pillTxt: { color: Colors.TEXT, fontSize: 12, fontWeight: '700' },
  pillTxtOn: { color: '#fff' },
  resultBox: { backgroundColor: Colors.TEXT, borderRadius: 10, padding: 16, marginTop: 14, alignItems: 'center' },
  resultTxt: { color: '#fff', fontSize: 22, fontWeight: '900' },
  timestamp: { color: '#aaa', fontSize: 11, textAlign: 'center', padding: 8 },
  fbHeader: { backgroundColor: '#2C5F6E', padding: 14, borderTopLeftRadius: 8, borderTopRightRadius: 8 },
  fbTab: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.15)' },
  fbTabOn: { backgroundColor: '#B8923A' },
  fbTabTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  fbTabTxtOn: { color: '#2C5F6E' },
  fbBody: { backgroundColor: '#fff', padding: 8, borderBottomLeftRadius: 8, borderBottomRightRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', borderTopWidth: 0 },
  fbRowHead: { flexDirection: 'row-reverse', paddingVertical: 8, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#F5EFE6' },
  fbRow: { flexDirection: 'row-reverse', paddingVertical: 8, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#faf5ed', alignItems: 'center' },
  fbColFlight: { width: 60, fontSize: 12, color: '#6B7F8D', fontWeight: '600' },
  fbColCode: { width: 50, textAlign: 'center', fontSize: 12, color: '#6B7F8D', fontWeight: '600' },
  fbColAirline: { flex: 1, fontSize: 11, color: '#6B7F8D', fontWeight: '600', paddingHorizontal: 4 },
  fbColStatus: { width: 60, textAlign: 'center', fontSize: 11, color: '#6B7F8D', fontWeight: '600' },
  fbColStatusBox: { width: 60, paddingVertical: 3, paddingHorizontal: 6, borderRadius: 4, alignItems: 'center' },
  wHero: { backgroundColor: '#2A9D8F', borderRadius: 10, padding: 16, marginTop: 4 },
  wLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  wTemp: { color: '#fff', fontSize: 36, fontWeight: '900', marginTop: 2 },
  wCond: { color: '#fff', fontSize: 14, marginTop: 2 },
  wIcon: { fontSize: 56 },
  wMetrics: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  wMetric: { color: 'rgba(255,255,255,0.95)', fontSize: 12 },
  wForecast: { marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 10 },
  wDay: { alignItems: 'center', marginLeft: 10, minWidth: 52 },
  wDayName: { color: 'rgba(255,255,255,0.85)', fontSize: 11 },
  wDayIcon: { fontSize: 22, lineHeight: 26 },
  wDayTemp: { color: '#fff', fontSize: 12, fontWeight: '700' },
  curWrap: { backgroundColor: '#E76F51', margin: -14, paddingHorizontal: 18, paddingTop: 11, paddingBottom: 18, minHeight: 720 },
  curTitle: { color: '#fff', fontSize: 26, fontWeight: '900', writingDirection: 'rtl' },
  curSub: { color: 'rgba(255,255,255,0.85)', fontSize: 13, marginTop: 2 },
  curUpdated: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 4 },
  curRefresh: { flexDirection: 'row-reverse', alignSelf: 'center', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 18, paddingVertical: 7, borderRadius: 20, marginTop: 14, marginBottom: 18 },
  curFromRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginBottom: 18 },
  curFromBtn: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 9, minWidth: 100, justifyContent: 'center' },
  curFromBtnOn: { backgroundColor: '#fff' },
  curFromTxt: { color: '#fff', fontSize: 13, fontWeight: '700' },
  curFromTxtOn: { color: '#2C5F6E' },
  curAmountBox: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', padding: 14, marginBottom: 18, position: 'relative' },
  curAmountInput: { color: '#fff', fontSize: 16, fontWeight: '900', textAlign: 'center', padding: 0 },
  curClear: { position: 'absolute', top: '50%', left: 10, marginTop: -13, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.25)', alignItems: 'center', justifyContent: 'center' },
  curResult: { backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 5 },
  curResultVal: { color: '#fff', fontSize: 18, fontWeight: '900' },
  curResultName: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '700' },
  curResultRate: { color: 'rgba(255,255,255,0.65)', fontSize: 10, textAlign: 'center', marginTop: 2 },
  curSource: { color: 'rgba(255,255,255,0.6)', fontSize: 11, textAlign: 'center', marginTop: 0 },
  wCurrent: { backgroundColor: '#2C5F6E', padding: 24, alignItems: 'center', marginBottom: 16, borderRadius: 10 },
  wNow: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  wIconBig: { fontSize: 64, lineHeight: 70, marginVertical: 6 },
  wTempBig: { color: '#fff', fontSize: 48, fontWeight: '900' },
  wCondBig: { color: '#fff', fontSize: 16, marginBottom: 12 },
  wStatsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 14, justifyContent: 'center' },
  wStat: { color: 'rgba(255,255,255,0.95)', fontSize: 12, fontWeight: '600' },
  wForecastBox: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 16 },
  wForecastTitle: { color: Colors.TEXT, fontWeight: '800', fontSize: 14, marginBottom: 10, textAlign: 'right', writingDirection: 'rtl' },
  wForecastRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F5EFE6' },
  wFcDayName: { width: 56, color: Colors.TEXT, fontWeight: '700', fontSize: 13, textAlign: 'right' },
  wFcDate: { color: Colors.MUTED, fontSize: 11 },
  wFcIcon: { fontSize: 22, lineHeight: 26 },
  wFcCond: { width: 80, color: Colors.MUTED, fontSize: 11, textAlign: 'center' },
  wFcMax: { color: '#E76F51', fontWeight: '700', fontSize: 14 },
  wFcMin: { color: Colors.MUTED, fontSize: 13 },
  wCamsBox: { backgroundColor: '#fff', borderRadius: 10, padding: 14 },
  wCamsTitle: { color: Colors.TEXT, fontWeight: '800', fontSize: 14 },
  wLiveBadge: { backgroundColor: 'rgba(220,38,38,0.85)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  wLiveTxt: { color: '#fff', fontSize: 9, fontWeight: '800' },
  wCamCard: { flex: 1, alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, backgroundColor: '#F5E6CB', borderRadius: 6 },
  wCamIcon: { fontSize: 22, marginBottom: 4 },
  wCamName: { color: Colors.TEXT, fontSize: 11, fontWeight: '700' },
});
