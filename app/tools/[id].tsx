import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../constants/colors';

export default function ToolScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView edges={['top']} style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={{ fontSize: 22, color: '#fff' }}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>
          {id === 'flights' ? '✈️ טיסות TLV ↔ DXB' : id === 'weather' ? '☀️ מזג אוויר' : id === 'currency' ? '💱 המרת מטבע' : 'כלי'}
        </Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 14 }}>
        {id === 'currency' && <Currency />}
        {id === 'weather' && <Weather />}
        {id === 'flights' && <Flights />}
      </ScrollView>
    </SafeAreaView>
  );
}

function Currency() {
  const [rate, setRate] = useState<number | null>(null);
  const [aed, setAed] = useState('100');
  const [ils, setIls] = useState('100');
  const [last, setLast] = useState<'aed'|'ils'>('aed');

  useEffect(() => {
    fetch('https://api.exchangerate.host/latest?base=AED&symbols=ILS')
      .then(r => r.json())
      .then(j => { if (j && j.rates && j.rates.ILS) setRate(j.rates.ILS); })
      .catch(() => setRate(0.998));
  }, []);

  useEffect(() => {
    if (rate == null) return;
    if (last === 'aed') setIls((parseFloat(aed) * rate).toFixed(2));
    else setAed((parseFloat(ils) / rate).toFixed(2));
  }, [rate]);

  if (rate == null) {
    return <View style={s.center}><Text style={s.muted}>⏳ טוען שערי מטבע...</Text></View>;
  }

  return (
    <View>
      <Text style={s.bigStat}>1 AED = {rate.toFixed(3)} ₪</Text>
      <Text style={s.bigStatSub}>שער עדכני (Central Bank) · עדכון: היום</Text>

      <View style={s.row}>
        <View style={s.field}>
          <Text style={s.fieldLabel}>AED (דירהם)</Text>
          <TextInput style={s.input} value={aed} keyboardType="numeric" onChangeText={(v) => { setAed(v); setLast('aed'); setIls((parseFloat(v || '0') * rate).toFixed(2)); }} />
        </View>
        <Text style={s.equals}>=</Text>
        <View style={s.field}>
          <Text style={s.fieldLabel}>ILS (שקלים)</Text>
          <TextInput style={s.input} value={ils} keyboardType="numeric" onChangeText={(v) => { setIls(v); setLast('ils'); setAed((parseFloat(v || '0') / rate).toFixed(2)); }} />
        </View>
      </View>

      <View style={s.tipBox}>
        <Text style={s.tipTitle}>💡 טיפ</Text>
        <Text style={s.tipTxt}>המטבע המקומי הוא דירהם (AED). הדירהם קבוע מול הדולר ($1 = 3.67 AED). שלם בכרטיס אשראי שלך — לרוב 0% עמלת המרה במטבעות חוץ.</Text>
      </View>
    </View>
  );
}

function Weather() {
  const [w, setW] = useState<any>(null);

  useEffect(() => {
    fetch('https://api.open-meteo.com/v1/forecast?latitude=25.276987&longitude=55.296249&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&hourly=temperature_2m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Asia/Dubai&forecast_days=5')
      .then(r => r.json())
      .then(setW)
      .catch(() => {});
  }, []);

  if (!w) return <View style={s.center}><Text style={s.muted}>⏳ טוען מזג אוויר...</Text></View>;

  const temp = w.current?.temperature_2m;
  const wind = w.current?.wind_speed_10m;
  const humidity = w.current?.relative_humidity_2m;
  const days = w.daily?.time || [];

  return (
    <View>
      <View style={s.weatherHero}>
        <Text style={s.weatherIcon}>☀️</Text>
        <Text style={s.weatherTemp}>{Math.round(temp)}°C</Text>
        <Text style={s.weatherCity}>דובאי כעת</Text>
      </View>

      <View style={s.metricsRow}>
        <View style={s.metric}>
          <Text style={s.metricVal}>{Math.round(wind)}</Text>
          <Text style={s.metricLabel}>קמ"ש רוח</Text>
        </View>
        <View style={s.metric}>
          <Text style={s.metricVal}>{humidity}%</Text>
          <Text style={s.metricLabel}>לחות</Text>
        </View>
      </View>

      <Text style={[s.bigStat, { fontSize: 18, marginTop: 22 }]}>תחזית 5 ימים</Text>
      {days.slice(0, 5).map((d: string, i: number) => (
        <View key={d} style={s.dayRow}>
          <Text style={s.dayName}>{new Date(d).toLocaleDateString('he-IL', { weekday: 'long', day: 'numeric', month: 'short' })}</Text>
          <Text style={s.dayTemp}>{Math.round(w.daily.temperature_2m_max[i])}° / {Math.round(w.daily.temperature_2m_min[i])}°</Text>
        </View>
      ))}
    </View>
  );
}

function Flights() {
  return (
    <View style={s.center}>
      <Text style={{ fontSize: 50 }}>✈️</Text>
      <Text style={s.bigStatSub}>חיפוש טיסות TLV ↔ DXB</Text>
      <TouchableOpacity style={s.tapBtn} onPress={() => Linking.openURL('https://tp.media/click?marker=634331&promo_id=4044&shmarker=634331&campaign_id=100&trs=242552&u=https%3A%2F%2Fwww.aviasales.com%2Fsearch%2FTLV01DXB01')}>
        <Text style={s.tapBtnTxt}>🔍 חפש טיסות באוויאסיילס</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[s.tapBtn, { backgroundColor: Colors.SECONDARY, marginTop: 8 }]} onPress={() => Linking.openURL('https://wellcomedubai.com/#flights')}>
        <Text style={s.tapBtnTxt}>📋 לוח טיסות חי באתר</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: Colors.PRIMARY, gap: 10 },
  back: { padding: 4 },
  title: { color: '#fff', fontSize: 17, fontWeight: '900', writingDirection: 'rtl' },
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
});
