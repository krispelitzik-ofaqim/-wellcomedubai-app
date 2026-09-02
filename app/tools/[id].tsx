import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Linking, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useI18n } from '../../constants/i18n';
import { tcRu } from '../../constants/contentRu';
import { tcHi } from '../../constants/contentHi';
import { tcAr } from '../../constants/contentAr';

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
        <TouchableOpacity onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/'); }} style={s.back}>
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

type CurCode = 'ILS' | 'AED' | 'USD' | 'EUR' | 'INR' | 'RUB' | 'SAR';
const CUR_FLAGS: Record<CurCode, string> = { ILS: '🇮🇱', AED: '🇦🇪', USD: '🇺🇸', EUR: '🇪🇺', INR: '🇮🇳', RUB: '🇷🇺', SAR: '🇸🇦' };
const CUR_FALLBACK: Record<CurCode, string> = { ILS: '₪ ILS', AED: 'AED', USD: '$ USD', EUR: '€ EUR', INR: '₹ INR', RUB: '₽ RUB', SAR: 'SAR' };
// Each language's own currency, shown alongside the Dirham.
const LOCAL_CUR: Record<string, CurCode> = { he: 'ILS', en: 'USD', ru: 'RUB', hi: 'INR', ar: 'SAR' };

function Currency() {
  const { t, lang } = useI18n();
  const localCur: CurCode = LOCAL_CUR[lang] || 'USD';
  const CUR_ORDER: CurCode[] = Array.from(new Set<CurCode>([localCur, 'AED', 'USD', 'EUR']));
  const curName = (c: CurCode) => { const v = t('cur.' + c); return v.startsWith('cur.') ? CUR_FALLBACK[c] : v; };
  const [rates, setRates] = useState<Record<CurCode, number> | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState('');
  const [from, setFrom] = useState<CurCode>(localCur);

  const load = () => {
    setLoading(true);
    fetch('https://open.er-api.com/v6/latest/USD')
      .then(r => r.json())
      .then(d => {
        if (d.rates) setRates({ ILS: d.rates.ILS, AED: d.rates.AED, USD: 1, EUR: d.rates.EUR, INR: d.rates.INR, RUB: d.rates.RUB, SAR: d.rates.SAR });
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
        <Text style={s.curTitle}>{t('cur.title')}</Text>
        <Text style={s.curSub}>{t('cur.sub')}</Text>
        <Text style={s.curUpdated}>{loading ? t('cur.loading') : (lastUpdate ? `${t('cur.updated')}: ${lastUpdate}` : '')}</Text>
      </View>

      <TouchableOpacity onPress={load} style={s.curRefresh}>
        <Text style={{ color: '#fff', fontSize: 14 }}>🔄</Text>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>{t('cur.refresh')}</Text>
      </TouchableOpacity>

      {!rates ? (
        <Text style={{ color: '#fff', textAlign: 'center', opacity: 0.85, marginTop: 30 }}>{t('cur.loadingRates')}</Text>
      ) : (
        <>
          <View style={s.curFromRow}>
            {CUR_ORDER.map(c => {
              const active = c === from;
              return (
                <TouchableOpacity key={c} onPress={() => setFrom(c)} style={[s.curFromBtn, active && s.curFromBtnOn]}>
                  <Text style={{ fontSize: 18 }}>{CUR_FLAGS[c]}</Text>
                  <Text style={[s.curFromTxt, active && s.curFromTxtOn]}>{curName(c)}</Text>
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
              placeholder={`${t('cur.enterAmount')}${curName(from)}`}
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
                <Text style={s.curResultName}>{curName(c)}</Text>
              </View>
              <Text style={s.curResultRate}>1 {curName(from)} = {(rates[c] / rates[from]).toFixed(4)} {curName(c)}</Text>
            </View>
          ))}

          <Text style={s.curSource}>{t('cur.source')}</Text>
        </>
      )}
    </View>
  );
}

function wmoCondition(code: number, lang: string = 'he'): string {
  const he: Record<number, string> = {
    0: 'בהיר', 1: 'כמעט בהיר', 2: 'מעונן חלקית', 3: 'מעונן',
    45: 'ערפל', 48: 'ערפל מקפיא',
    51: 'טפטוף קל', 53: 'טפטוף', 55: 'טפטוף חזק',
    61: 'גשם קל', 63: 'גשם', 65: 'גשם חזק',
    71: 'שלג קל', 73: 'שלג', 75: 'שלג חזק',
    80: 'ממטרים', 81: 'ממטרים', 82: 'ממטרים חזקים',
    95: 'סופת רעמים', 96: 'סופת ברד', 99: 'סופת ברד חזקה',
  };
  const en: Record<number, string> = {
    0: 'Clear', 1: 'Mostly clear', 2: 'Partly cloudy', 3: 'Cloudy',
    45: 'Fog', 48: 'Freezing fog',
    51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle',
    61: 'Light rain', 63: 'Rain', 65: 'Heavy rain',
    71: 'Light snow', 73: 'Snow', 75: 'Heavy snow',
    80: 'Showers', 81: 'Showers', 82: 'Heavy showers',
    95: 'Thunderstorm', 96: 'Hailstorm', 99: 'Heavy hailstorm',
  };
  const m = lang === 'en' ? en : he;
  const base = m[code] || (lang === 'en' ? 'Unknown' : 'לא ידוע');
  return lang === 'ar' ? tcAr(base) : lang === 'hi' ? tcHi(base) : lang === 'ru' ? tcRu(base) : base;
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

// Dubai monthly climate averages (°C): daytime high, night low, sea temperature.
const DXB_CLIMATE = [
  { hi: 24, lo: 14, sea: 22 }, { hi: 25, lo: 15, sea: 21 }, { hi: 28, lo: 18, sea: 23 },
  { hi: 33, lo: 21, sea: 25 }, { hi: 38, lo: 25, sea: 28 }, { hi: 39, lo: 27, sea: 30 },
  { hi: 41, lo: 30, sea: 32 }, { hi: 41, lo: 30, sea: 33 }, { hi: 39, lo: 27, sea: 32 },
  { hi: 35, lo: 24, sea: 30 }, { hi: 30, lo: 20, sea: 27 }, { hi: 26, lo: 16, sea: 24 },
];
const CLIMATE_TR: Record<string, { title: string; para: string; cMonth: string; cHi: string; cLo: string; cSea: string; months: string[] }> = {
  he: { title: 'סקירת אקלים שנתית', para: 'לדובאי אקלים מדברי חם. הקיץ (יוני–ספטמבר) חם במיוחד ולח, עם מקסימום של 40° ומעלה. החורף (נובמבר–מרץ) נעים ושטוף שמש, 24–30° — הזמן הטוב ביותר לבקר. הים חמים כל השנה (21–33°), וגשם נדיר, בעיקר בחורף.', cMonth: 'חודש', cHi: 'מקס׳', cLo: 'מינ׳', cSea: 'ים', months: ['ינואר', 'פברואר', 'מרץ', 'אפריל', 'מאי', 'יוני', 'יולי', 'אוגוסט', 'ספטמבר', 'אוקטובר', 'נובמבר', 'דצמבר'] },
  en: { title: 'Annual Climate Overview', para: 'Dubai has a hot desert climate. Summer (June–September) is extremely hot and humid, with highs around 40°+. Winter (November–March) is pleasant and sunny, 24–30° — the best time to visit. The sea stays warm year-round (21–33°), and rain is rare, mostly in winter.', cMonth: 'Month', cHi: 'High', cLo: 'Low', cSea: 'Sea', months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] },
  ru: { title: 'Годовой обзор климата', para: 'В Дубае жаркий пустынный климат. Лето (июнь–сентябрь) очень жаркое и влажное, максимум около 40°+. Зима (ноябрь–март) приятная и солнечная, 24–30° — лучшее время для поездки. Море тёплое круглый год (21–33°), дожди редки, в основном зимой.', cMonth: 'Месяц', cHi: 'Макс', cLo: 'Мин', cSea: 'Море', months: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'] },
  ar: { title: 'نظرة سنوية على المناخ', para: 'لدبي مناخ صحراوي حار. الصيف (يونيو–سبتمبر) شديد الحرارة والرطوبة، بحد أقصى نحو 40°+. الشتاء (نوفمبر–مارس) لطيف ومشمس، 24–30° — أفضل وقت للزيارة. يبقى البحر دافئًا طوال العام (21–33°)، والأمطار نادرة وغالبًا في الشتاء.', cMonth: 'الشهر', cHi: 'العليا', cLo: 'الدنيا', cSea: 'البحر', months: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'] },
  hi: { title: 'वार्षिक जलवायु अवलोकन', para: 'दुबई की जलवायु गर्म रेगिस्तानी है। गर्मी (जून–सितंबर) बेहद गर्म और आर्द्र होती है, अधिकतम लगभग 40°+। सर्दी (नवंबर–मार्च) सुहावनी और धूप भरी रहती है, 24–30° — घूमने का सबसे अच्छा समय। समुद्र साल भर गर्म रहता है (21–33°), और बारिश दुर्लभ है, मुख्यतः सर्दियों में।', cMonth: 'महीना', cHi: 'अधि', cLo: 'न्यून', cSea: 'समुद्र', months: ['जन', 'फ़र', 'मार्च', 'अप्रैल', 'मई', 'जून', 'जुल', 'अग', 'सित', 'अक्तू', 'नव', 'दिस'] },
};
const climateHiColor = (hi: number) => (hi >= 38 ? '#E24B32' : hi >= 30 ? '#F4A261' : '#2A9D8F');

function Weather() {
  const { t, lang } = useI18n();
  const [w, setW] = useState<any>(null);
  const dayNames = lang === 'ar'
    ? ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'].map(tcAr)
    : lang === 'hi'
    ? ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'].map(tcHi)
    : lang === 'ru'
    ? ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'].map(tcRu)
    : lang === 'en'
    ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
    : ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=25.2048&longitude=55.2708&current=temperature_2m,relative_humidity_2m,apparent_temperature,wind_speed_10m,weather_code,uv_index&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=auto&forecast_days=7')
      .then(r => r.json())
      .then(setW)
      .catch(() => {});
  }, []);

  if (!w) return <View style={s.center}><Text style={s.muted}>{t('wthr.loading')}</Text></View>;

  const c = w.current || {};
  const code = c.weather_code;
  const days = w.daily?.time || [];
  const isRTL = lang === 'he' || lang === 'ar';
  const clim = CLIMATE_TR[lang] || CLIMATE_TR.en;

  return (
    <View>
      <ImageBackground source={{ uri: 'https://wellcomedubai.com/images/Yizhak/dubai-skyline-evening.jpg' }} resizeMode="cover" style={s.wCurrent} imageStyle={{ borderRadius: 0 }}>
        <View style={s.wOverlay}>
          <Text style={s.wNow}>{t('wthr.now')}</Text>
          <Text style={s.wIconBig}>{wmoEmoji(code)}</Text>
          <Text style={s.wTempBig}>{Math.round(c.temperature_2m)}°</Text>
          <Text style={s.wCondBig}>{wmoCondition(code, lang)}</Text>
          <View style={s.wStatsRow}>
            <Text style={s.wStat}>🌡️ {t('wthr.feels')} {Math.round(c.apparent_temperature)}°</Text>
            <Text style={s.wStat}>💧 {t('wthr.humidity')} {Math.round(c.relative_humidity_2m)}%</Text>
            <Text style={s.wStat}>🌬️ {Math.round(c.wind_speed_10m)} {t('wthr.wind')}</Text>
            <Text style={s.wStat}>☀️ UV {Math.round((c.uv_index || 0) * 10) / 10}</Text>
          </View>
        </View>
      </ImageBackground>

      <View style={s.wForecastBox}>
        <Text style={s.wForecastTitle}>{t('wthr.forecast')}</Text>
        {days.map((d: string, i: number) => {
          const dn = new Date(d).getDay();
          const dt = new Date(d);
          const dateStr = `${dt.getDate()}/${dt.getMonth() + 1}`;
          return (
            <View key={d} style={s.wForecastRow}>
              <Text style={s.wFcDayName}>{dayNames[dn]}</Text>
              <Text style={s.wFcDate}>{dateStr}</Text>
              <Text style={s.wFcIcon}>{wmoEmoji(w.daily.weather_code[i])}</Text>
              <Text style={s.wFcCond} numberOfLines={1}>{wmoCondition(w.daily.weather_code[i], lang)}</Text>
              <Text style={s.wFcMax}>{Math.round(w.daily.temperature_2m_max[i])}°</Text>
              <Text style={s.wFcMin}>{Math.round(w.daily.temperature_2m_min[i])}°</Text>
            </View>
          );
        })}
      </View>

      {/* Annual climate overview — paragraph + monthly table */}
      <View style={s.wForecastBox}>
        <Text style={[s.wForecastTitle, { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]}>{clim.title}</Text>
        <Text style={{ color: Colors.TEXT, fontSize: 13.5, lineHeight: 20, marginTop: 4, marginBottom: 12, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }}>{clim.para}</Text>
        <View style={[s.wClimHead, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <Text style={[s.wClimHeadTxt, { flex: 1.5, textAlign: isRTL ? 'right' : 'left' }]}>{clim.cMonth}</Text>
          <Text style={s.wClimHeadTxt}>{clim.cHi}</Text>
          <Text style={s.wClimHeadTxt}>{clim.cLo}</Text>
          <Text style={s.wClimHeadTxt}>{clim.cSea}</Text>
        </View>
        {DXB_CLIMATE.map((m, i) => (
          <View key={i} style={[s.wClimRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[s.wClimMonth, { flex: 1.5, textAlign: isRTL ? 'right' : 'left' }]}>{clim.months[i]}</Text>
            <Text style={[s.wClimCell, { color: climateHiColor(m.hi), fontWeight: '800' }]}>{m.hi}°</Text>
            <Text style={s.wClimCell}>{m.lo}°</Text>
            <Text style={[s.wClimCell, { color: '#1A6B8A' }]}>{m.sea}°</Text>
          </View>
        ))}
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

function statusHe(status: string, lang: string = 'he') {
  const x = (status || '').toLowerCase();
  const en = lang === 'en';
  const pick = () => {
    if (x.includes('landed')) return en ? 'Landed' : 'נחת';
    if (x.includes('arrived')) return en ? 'Arrived' : 'הגיע';
    if (x.includes('departed')) return en ? 'Departed' : 'המריא';
    if (x.includes('en route')) return en ? 'En route' : 'בדרך';
    if (x.includes('cancelled')) return en ? 'Cancelled' : 'בוטל';
    if (x.includes('delayed')) return en ? 'Delayed' : 'מאחר';
    if (x.includes('scheduled')) return en ? 'Scheduled' : 'מתוכנן';
    if (x.includes('expected')) return en ? 'Expected' : 'צפוי';
    if (x.includes('boarding')) return en ? 'Boarding' : 'עולים';
    if (x.includes('gate')) return en ? 'Gate' : 'שער';
    return status || '';
  };
  const r = pick();
  return lang === 'ar' ? tcAr(r) : lang === 'hi' ? tcHi(r) : lang === 'ru' ? tcRu(r) : r;
}

const AIRPORTS = { DXB: { icao: 'OMDB', code: 'DXB' }, AUH: { icao: 'OMAA', code: 'AUH' } } as const;

function Flights() {
  const { t, lang } = useI18n();
  const locale = lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'he-IL';
  const [airport, setAirport] = useState<'DXB' | 'AUH'>('DXB');
  const [direction, setDirection] = useState<'Departure' | 'Arrival'>('Departure');
  const [flights, setFlights] = useState<Flight[] | null>(null);
  const [fltQ, setFltQ] = useState('');
  const [loading, setLoading] = useState(false);
  const [now, setNow] = useState(new Date());
  const apCode = AIRPORTS[airport].code;

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

    const icao = AIRPORTS[airport].icao;
    const code = AIRPORTS[airport].code;
    fetch(`https://aerodatabox.p.rapidapi.com/flights/airports/icao/${icao}/${from}/${to}?direction=${direction}&withCancelled=false&withCodeshared=false&withLocation=false`,
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
            origin: isDep ? code : (ap.name || ap.icao || ''),
            originCode: isDep ? code : (ap.iata || ''),
            destination: isDep ? (ap.name || ap.icao || '') : code,
            destinationCode: isDep ? (ap.iata || '') : code,
            scheduled: m.scheduledTime?.local || m.scheduledTimeLocal || '',
            actual: m.actualTime?.local || m.revisedTime?.local || m.predictedTime?.local || '',
            terminal: m.terminal || '',
            status: f.status || '',
            isTLV,
          };
        });
        // Hebrew edition prioritizes Tel Aviv flights; the international edition shows all flights.
        const tlv = result.filter(f => f.isTLV);
        setFlights(lang === 'he' && tlv.length > 0 ? tlv : result);
      })
      .catch(() => setFlights([]))
      .finally(() => setLoading(false));
  }, [direction, airport, lang]);

  const dubaiTime = now.toLocaleTimeString(locale, { timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit' });
  const isDep = direction === 'Departure';
  const isRTL = lang === 'he' || lang === 'ar';
  const fmtT = (str?: string) => { const m = String(str || '').match(/\d{1,2}:\d{2}/); return m ? m[0] : ''; };
  const cityShort = (nm?: string) => String(nm || '').replace(/\s*(international|intl|airport|apt)\s*/gi, '').trim() || String(nm || '');

  return (
    <View>
      <View style={s.fbHeader}>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 14 }}>{airport === 'DXB' ? t('flt.dxb') : t('flt.auh')}</Text>
        </View>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: 8 }}>
          <TouchableOpacity onPress={() => setAirport('DXB')} style={[s.fbTab, airport === 'DXB' && s.fbTabOn]}>
            <Text style={[s.fbTabTxt, airport === 'DXB' && s.fbTabTxtOn]}>✈️ {t('flt.dxbShort')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setAirport('AUH')} style={[s.fbTab, airport === 'AUH' && s.fbTabOn]}>
            <Text style={[s.fbTabTxt, airport === 'AUH' && s.fbTabTxtOn]}>✈️ {t('flt.auhShort')}</Text>
          </TouchableOpacity>
        </View>
        <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 6 }}>
          {now.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long' })}
        </Text>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: 10 }}>
          <TouchableOpacity onPress={() => setDirection('Departure')} style={[s.fbTab, isDep && s.fbTabOn]}>
            <Text style={[s.fbTabTxt, isDep && s.fbTabTxtOn]}>{t('flt.departures')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setDirection('Arrival')} style={[s.fbTab, !isDep && s.fbTabOn]}>
            <Text style={[s.fbTabTxt, !isDep && s.fbTabTxtOn]}>{t('flt.arrivals')}</Text>
          </TouchableOpacity>
          <Text style={{ color: '#B8923A', fontWeight: '700', fontSize: 13, marginLeft: 'auto' }}>{dubaiTime} 🇦🇪</Text>
        </View>
      </View>

      <View style={s.fbBody}>
        {loading && <Text style={[s.muted, { textAlign: 'center', padding: 20 }]}>{t('flt.loading')}</Text>}
        {!loading && flights && flights.length === 0 && (
          <Text style={[s.muted, { textAlign: 'center', padding: 20 }]}>{t('flt.error')}</Text>
        )}
        {!loading && flights && flights.length > 0 && (() => {
          const q = fltQ.trim().toLowerCase();
          const shown = q ? flights.filter(f => [f.airline, f.flight, f.destination, f.origin, f.destinationCode, f.originCode].filter(Boolean).join(' ').toLowerCase().includes(q)) : flights;
          return (
          <>
            <View style={[s.fltSearch, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={{ fontSize: 15 }}>🔎</Text>
              <TextInput value={fltQ} onChangeText={setFltQ} placeholder={lang === 'he' ? 'חיפוש יעד, חברה או מספר טיסה…' : 'Search destination, airline or flight…'} placeholderTextColor="#9CA3AF" style={[s.fltSearchInput, { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]} />
              {fltQ ? <TouchableOpacity onPress={() => setFltQ('')}><Text style={{ fontSize: 18, color: '#9CA3AF' }}>×</Text></TouchableOpacity> : null}
            </View>
            {shown.length === 0 ? <Text style={[s.muted, { textAlign: 'center', padding: 16 }]}>{lang === 'he' ? 'לא נמצאו טיסות' : 'No flights found'}</Text> : null}
            {shown.map((f, i) => {
              const otherCode = (isDep ? f.destinationCode : f.originCode) || '—';
              const otherCity = cityShort(isDep ? f.destination : f.origin);
              const time = fmtT(f.actual) || fmtT(f.scheduled);
              return (
              <View key={i} style={[s.flCard, lang === 'he' && f.isTLV && { backgroundColor: '#FFF8E7' }]}>
                <View style={s.flTop}>
                  <Text style={s.flAirline} numberOfLines={1}>{f.airline || '—'}</Text>
                  <Text style={s.flNum}>{f.flight}</Text>
                </View>
                <View style={[s.flRoute, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  <View style={s.flEnd}>
                    <Text style={s.flCode}>{isDep ? apCode : otherCode}</Text>
                    <Text style={s.flCity} numberOfLines={1}>{isDep ? 'Dubai' : otherCity}</Text>
                  </View>
                  <Text style={s.flPlane}>{isRTL ? '←' : '→'}</Text>
                  <View style={s.flEnd}>
                    <Text style={s.flCode}>{isDep ? otherCode : apCode}</Text>
                    <Text style={s.flCity} numberOfLines={1}>{isDep ? otherCity : 'Dubai'}</Text>
                  </View>
                  <View style={{ flex: 1 }} />
                  <View style={{ alignItems: 'center', gap: 4 }}>
                    <Text style={s.flTime}>{time || '--:--'}</Text>
                    <View style={[s.flStatus, { backgroundColor: statusBg(f.status) }]}>
                      <Text style={{ color: statusColor(f.status), fontSize: 10, fontWeight: '700' }}>{statusHe(f.status, lang)}</Text>
                    </View>
                  </View>
                </View>
              </View>
              );
            })}
            <Text style={s.timestamp}>{t('flt.updated')} {now.toLocaleTimeString(locale)} · DXB</Text>
          </>
          );
        })()}
      </View>

      <TouchableOpacity style={[s.tapBtn, { backgroundColor: Colors.SECONDARY, marginTop: 12 }]} onPress={async () => { const url = lang === 'he' ? `https://www.aviasales.com/search/TLV01${apCode}01?marker=X5SEJjUA` : `https://www.aviasales.com/?marker=X5SEJjUA`; const ok = await Linking.canOpenURL(url); if (ok) await Linking.openURL(url); }}>
        <Text style={s.tapBtnTxt}>{t('flt.search')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#fff', gap: 10, borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  back: { padding: 4 },
  title: { color: '#fff', fontSize: 24, fontWeight: '400', letterSpacing: 0.3, writingDirection: 'rtl' },
  brand: { fontSize: 16, fontWeight: '900', letterSpacing: -0.3, fontFamily: 'System', textAlign: 'right', writingDirection: 'rtl' },
  center: { alignItems: 'center', padding: 40, gap: 12 },
  muted: { color: Colors.MUTED, fontSize: 14 },
  bigStat: { fontSize: 26, fontWeight: '400', letterSpacing: 0.3, color: Colors.PRIMARY, textAlign: 'center', marginTop: 14 },
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
  weatherTemp: { fontSize: 60, fontWeight: '300', color: Colors.PRIMARY, marginTop: 8 },
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
  cardTitle: { fontSize: 20, fontWeight: '600', letterSpacing: 0.2, color: Colors.TEXT, textAlign: 'right', writingDirection: 'rtl', marginBottom: 12 },
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
  flCard: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EAE0CE' },
  fltSearch: { alignItems: 'center', gap: 8, backgroundColor: '#F3F4F6', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8, margin: 8 },
  fltSearchInput: { flex: 1, fontSize: 14.5, color: '#1A2530' },
  flTop: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  flAirline: { flex: 1, color: Colors.TEXT, fontSize: 16, fontWeight: '500', letterSpacing: 0.2, writingDirection: 'rtl', textAlign: 'right' },
  flNum: { color: Colors.MUTED, fontSize: 12, fontWeight: '600', letterSpacing: 0.5 },
  flRoute: { alignItems: 'center', gap: 8 },
  flEnd: { alignItems: 'center', minWidth: 52 },
  flCode: { color: '#1A4A5E', fontSize: 20, fontWeight: '600', letterSpacing: 0.5 },
  flCity: { color: Colors.MUTED, fontSize: 10.5, marginTop: 1, maxWidth: 72 },
  flPlane: { color: '#B8923A', fontSize: 18, fontWeight: '400' },
  flTime: { color: Colors.PRIMARY, fontSize: 22, fontWeight: '400', letterSpacing: 0.5 },
  flStatus: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 0 },
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
  wTemp: { color: '#fff', fontSize: 58, fontWeight: '300', marginTop: 2 },
  wCond: { color: '#fff', fontSize: 14, marginTop: 2 },
  wIcon: { fontSize: 56 },
  wMetrics: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  wMetric: { color: 'rgba(255,255,255,0.95)', fontSize: 12 },
  wForecast: { marginTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.2)', paddingTop: 10 },
  wDay: { alignItems: 'center', marginLeft: 10, minWidth: 52 },
  wDayName: { color: 'rgba(255,255,255,0.85)', fontSize: 11 },
  wDayIcon: { fontSize: 22, lineHeight: 26 },
  wDayTemp: { color: '#fff', fontSize: 12, fontWeight: '700' },
  curWrap: { backgroundColor: '#1A4A5E', margin: -14, paddingHorizontal: 18, paddingTop: 11, paddingBottom: 18, minHeight: 560 },
  curTitle: { color: '#fff', fontSize: 28, fontWeight: '400', letterSpacing: 0.3, writingDirection: 'rtl' },
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
  wCurrent: { marginHorizontal: -14, marginTop: -11, marginBottom: 16, minHeight: 300, backgroundColor: '#2C5F6E', overflow: 'hidden' },
  wOverlay: { flex: 1, backgroundColor: 'rgba(20,40,55,0.45)', paddingVertical: 34, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  wNow: { color: 'rgba(255,255,255,0.9)', fontSize: 14, letterSpacing: 0.5 },
  wIconBig: { fontSize: 76, lineHeight: 84, marginVertical: 4 },
  wTempBig: { color: '#fff', fontSize: 76, fontWeight: '200', letterSpacing: 1 },
  wCondBig: { color: '#fff', fontSize: 18, fontWeight: '400', marginBottom: 16 },
  wStatsRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 14, justifyContent: 'center' },
  wStat: { color: 'rgba(255,255,255,0.95)', fontSize: 12, fontWeight: '600' },
  wForecastBox: { backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 16 },
  wClimHead: { alignItems: 'center', paddingBottom: 7, borderBottomWidth: 2, borderBottomColor: '#EAE0CE' },
  wClimHeadTxt: { flex: 1, color: Colors.MUTED, fontWeight: '800', fontSize: 12, textAlign: 'center' },
  wClimRow: { alignItems: 'center', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#F5EFE6' },
  wClimMonth: { color: Colors.TEXT, fontWeight: '700', fontSize: 13 },
  wClimCell: { flex: 1, color: Colors.TEXT, fontSize: 13.5, fontWeight: '600', textAlign: 'center' },
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
