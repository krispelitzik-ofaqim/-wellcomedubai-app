import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useI18n } from '../constants/i18n';

const NAVY = '#16222C', CREAM = '#F5F1EA', GOLD = '#E9C46A';
const W = { x: '800' as const, b: '700' as const, sb: '600' as const, m: '500' as const, r: '400' as const };

type CpLang = 'he' | 'en' | 'ru' | 'hi' | 'ar';
const CPL = (l: string): CpLang => (['he', 'en', 'ru', 'hi', 'ar'].includes(l) ? (l as CpLang) : 'en');
const BIZ = 'Nobu Dubai';

const TR: Record<CpLang, any> = {
  he: { title: `קופונים שמומשו · ${BIZ}`, daily: 'יומי', weekly: 'שבועי', monthly: 'חודשי', yearly: 'שנתי', redeemed: 'קופונים מומשו', avgDisc: 'הנחה ממוצעת', peak: 'שעת שיא', byHour: 'מימושים לפי שעה · היום', allCoupons: 'כל הקופונים שמומשו', colDate: 'תאריך', colPct: 'אחוז', colPhone: 'טלפון', colTime: 'שעה', promoTitle: 'רוצה יותר לקוחות בשעות השקטות?', promoSub: 'קופונים בתשלום מקפיצים את העסק שלך לראש הרשימה ומביאים תנועה ממוקדת.', promoBtn: 'רכישת חבילת קופונים ›', note: 'נתוני הדגמה. לוח בקרה אמיתי (מימושים חיים בין מכשירים) דורש חיבור שרת.' },
  en: { title: `Redeemed coupons · ${BIZ}`, daily: 'Daily', weekly: 'Weekly', monthly: 'Monthly', yearly: 'Yearly', redeemed: 'coupons redeemed', avgDisc: 'Avg. discount', peak: 'Peak hour', byHour: 'Redemptions by hour · today', allCoupons: 'All redeemed coupons', colDate: 'Date', colPct: 'Discount', colPhone: 'Phone', colTime: 'Time', promoTitle: 'Want more customers in quiet hours?', promoSub: 'Paid coupons push your business to the top of the list and bring targeted traffic.', promoBtn: 'Buy a coupon package ›', note: 'Demo data. A real dashboard (live cross-device redemptions) requires a server connection.' },
  ru: { title: `Использованные купоны · ${BIZ}`, daily: 'День', weekly: 'Неделя', monthly: 'Месяц', yearly: 'Год', redeemed: 'купонов использовано', avgDisc: 'Средняя скидка', peak: 'Час пик', byHour: 'Погашения по часам · сегодня', allCoupons: 'Все использованные купоны', colDate: 'Дата', colPct: 'Скидка', colPhone: 'Телефон', colTime: 'Время', promoTitle: 'Хотите больше клиентов в тихие часы?', promoSub: 'Платные купоны поднимают ваш бизнес в топ списка и приводят целевой трафик.', promoBtn: 'Купить пакет купонов ›', note: 'Демо-данные. Реальная панель (живые погашения между устройствами) требует сервера.' },
  hi: { title: `भुनाए गए कूपन · ${BIZ}`, daily: 'दैनिक', weekly: 'साप्ताहिक', monthly: 'मासिक', yearly: 'वार्षिक', redeemed: 'कूपन भुनाए गए', avgDisc: 'औसत छूट', peak: 'व्यस्त समय', byHour: 'घंटे के अनुसार · आज', allCoupons: 'सभी भुनाए गए कूपन', colDate: 'तारीख', colPct: 'छूट', colPhone: 'फ़ोन', colTime: 'समय', promoTitle: 'शांत घंटों में अधिक ग्राहक चाहिए?', promoSub: 'सशुल्क कूपन आपके व्यापार को सूची में शीर्ष पर लाते हैं और लक्षित ट्रैफ़िक लाते हैं।', promoBtn: 'कूपन पैकेज खरीदें ›', note: 'डेमो डेटा। वास्तविक डैशबोर्ड (लाइव क्रॉस-डिवाइस) के लिए सर्वर चाहिए।' },
  ar: { title: `القسائم المستخدمة · ${BIZ}`, daily: 'يومي', weekly: 'أسبوعي', monthly: 'شهري', yearly: 'سنوي', redeemed: 'قسيمة مستخدمة', avgDisc: 'متوسط الخصم', peak: 'ساعة الذروة', byHour: 'الاستخدامات حسب الساعة · اليوم', allCoupons: 'كل القسائم المستخدمة', colDate: 'التاريخ', colPct: 'الخصم', colPhone: 'الهاتف', colTime: 'الوقت', promoTitle: 'تريد المزيد من العملاء في الساعات الهادئة؟', promoSub: 'القسائم المدفوعة ترفع عملك إلى أعلى القائمة وتجلب زيارات مستهدفة.', promoBtn: 'شراء باقة قسائم ›', note: 'بيانات تجريبية. لوحة حقيقية (استخدامات حية بين الأجهزة) تتطلب اتصال خادم.' },
};

type Row = { date: string; last4: string; pct: number; time: string };
const DEMO_ROWS: Row[] = [
  { date: '2026-08-23', last4: '4821', pct: 12, time: '20:14' },
  { date: '2026-08-23', last4: '7093', pct: 8, time: '19:02' },
  { date: '2026-08-23', last4: '3355', pct: 5, time: '13:41' },
  { date: '2026-08-22', last4: '1180', pct: 15, time: '21:07' },
  { date: '2026-08-22', last4: '9642', pct: 7, time: '12:55' },
];

const HOURLY = [
  { h: '10', n: 1 }, { h: '11', n: 3 }, { h: '12', n: 6 }, { h: '13', n: 9 },
  { h: '14', n: 7 }, { h: '15', n: 4 }, { h: '16', n: 3 }, { h: '17', n: 5 },
  { h: '18', n: 8 }, { h: '19', n: 12 }, { h: '20', n: 14 }, { h: '21', n: 10 },
  { h: '22', n: 5 },
];
const MAX = Math.max(...HOURLY.map(x => x.n));
const PERIOD_TOTALS: Record<string, number> = { daily: 87, weekly: 540, monthly: 2150, yearly: 24800 };

export default function CouponDashboard() {
  const { lang, isRTL } = useI18n();
  const C = TR[CPL(lang)];
  const wd = (isRTL ? 'rtl' : 'ltr') as 'rtl' | 'ltr';
  const ta = (isRTL ? 'right' : 'left') as 'right' | 'left';
  const [period, setPeriod] = useState('daily');
  const [rows, setRows] = useState<Row[]>(DEMO_ROWS);
  const PERIODS = [
    { key: 'daily', label: C.daily }, { key: 'weekly', label: C.weekly },
    { key: 'monthly', label: C.monthly }, { key: 'yearly', label: C.yearly },
  ];

  useEffect(() => {
    AsyncStorage.getAllKeys()
      .then(async keys => {
        const mine = keys.filter(k => k.startsWith('@coupon:'));
        const real: Row[] = [];
        for (const k of mine) {
          const parts = k.split(':'); // @coupon : <bizId> : <phone> : <date>
          const phone = parts[2] || '';
          const date = parts[3] || '';
          try {
            const v = JSON.parse((await AsyncStorage.getItem(k)) || '{}');
            real.push({ date, last4: phone.slice(-4), pct: v.pct || 0, time: v.time || '' });
          } catch {}
        }
        const all = [...real, ...DEMO_ROWS].sort((a, b) => (a.date === b.date ? b.time.localeCompare(a.time) : b.date.localeCompare(a.date)));
        setRows(all);
      })
      .catch(() => {});
  }, []);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={[s.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/coupons'))} style={s.backBtn}>
          <Text style={s.backTxt}>{isRTL ? '›' : '‹'}</Text>
        </TouchableOpacity>
        <Text style={[s.hTitle, { flex: 1, textAlign: ta, writingDirection: wd }]}>{C.title}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {/* period summary */}
        <View style={[s.periodRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {PERIODS.map(p => (
            <TouchableOpacity key={p.key} style={[s.periodBtn, period === p.key && s.periodBtnOn]} onPress={() => setPeriod(p.key)}>
              <Text style={[s.periodTxt, period === p.key && s.periodTxtOn]}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={s.summaryCard}>
          <Text style={s.summaryVal}>{PERIOD_TOTALS[period].toLocaleString()}</Text>
          <Text style={[s.summaryLbl, { writingDirection: wd }]}>{C.redeemed}</Text>
          <View style={[s.summaryMetaRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={s.metaBox}><Text style={s.metaVal}>9%</Text><Text style={[s.metaLbl, { writingDirection: wd }]}>{C.avgDisc}</Text></View>
            <View style={s.metaBox}><Text style={s.metaVal}>20:00</Text><Text style={[s.metaLbl, { writingDirection: wd }]}>{C.peak}</Text></View>
          </View>
        </View>

        {/* hourly chart */}
        <View style={s.card}>
          <Text style={[s.cardTitle, { textAlign: ta, writingDirection: wd }]}>{C.byHour}</Text>
          <View style={s.chart}>
            {HOURLY.map(x => (
              <View key={x.h} style={s.barCol}>
                <Text style={s.barVal}>{x.n}</Text>
                <View style={[s.bar, { height: 12 + (x.n / MAX) * 120, backgroundColor: x.n === MAX ? GOLD : '#A7C0B4' }]} />
                <Text style={s.barLbl}>{x.h}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* redemptions list */}
        <View style={s.card}>
          <Text style={[s.cardTitle, { textAlign: ta, writingDirection: wd }]}>{C.allCoupons}</Text>
          <View style={[s.trHead, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Text style={[s.th, { flex: 1.2 }]}>{C.colDate}</Text>
            <Text style={[s.th, { width: 70 }]}>{C.colPct}</Text>
            <Text style={[s.th, { width: 80 }]}>{C.colPhone}</Text>
            <Text style={[s.th, { width: 52 }]}>{C.colTime}</Text>
          </View>
          {rows.map((r, i) => (
            <View key={i} style={[s.tr, { flexDirection: isRTL ? 'row-reverse' : 'row' }, i % 2 === 0 && { backgroundColor: '#f8fafc' }]}>
              <Text style={[s.td, { flex: 1.2 }]}>{r.date}</Text>
              <Text style={[s.td, { width: 70, fontWeight: W.b, color: NAVY }]}>{r.pct}%</Text>
              <Text style={[s.td, { width: 80 }]}>····{r.last4}</Text>
              <Text style={[s.td, { width: 52 }]}>{r.time}</Text>
            </View>
          ))}
        </View>

        {/* promo */}
        <View style={s.promo}>
          <Text style={[s.promoTitle, { textAlign: ta, writingDirection: wd }]}>{C.promoTitle}</Text>
          <Text style={[s.promoSub, { textAlign: ta, writingDirection: wd }]}>{C.promoSub}</Text>
          <TouchableOpacity style={s.promoBtn} activeOpacity={0.85} onPress={() => router.push('/agent-coupon' as any)}>
            <Text style={s.promoBtnTxt}>{C.promoBtn}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[s.note, { writingDirection: wd }]}>{C.note}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CREAM },
  header: { alignItems: 'center', padding: 12, gap: 8, backgroundColor: NAVY },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: '#fff', fontSize: 24, fontWeight: W.r },
  hTitle: { fontSize: 20, fontWeight: W.m, color: '#fff' },
  periodRow: { gap: 6, marginBottom: 14 },
  periodBtn: { flex: 1, paddingVertical: 10, borderRadius: 4, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e7e0d4', alignItems: 'center' },
  periodBtnOn: { backgroundColor: NAVY, borderColor: NAVY },
  periodTxt: { fontSize: 13, fontWeight: W.sb, color: NAVY },
  periodTxtOn: { color: '#fff' },
  summaryCard: { backgroundColor: '#fff', borderRadius: 4, padding: 20, alignItems: 'center', marginBottom: 14, shadowColor: '#1a2b35', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 14, elevation: 3 },
  summaryVal: { fontSize: 48, fontWeight: W.x, color: NAVY },
  summaryLbl: { fontSize: 13, color: '#7a7261', fontWeight: W.sb, marginTop: 2 },
  summaryMetaRow: { gap: 12, marginTop: 16 },
  metaBox: { alignItems: 'center', paddingHorizontal: 18, paddingVertical: 8, backgroundColor: '#f2ede3', borderRadius: 4 },
  metaVal: { fontSize: 18, fontWeight: W.b, color: NAVY },
  metaLbl: { fontSize: 10, color: '#7a7261', fontWeight: W.r, marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 4, padding: 16, marginBottom: 14, shadowColor: '#1a2b35', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  cardTitle: { fontSize: 17, fontWeight: W.m, color: NAVY, marginBottom: 14 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 170 },
  barCol: { flex: 1, alignItems: 'center' },
  bar: { width: '62%', borderRadius: 3, marginTop: 4 },
  barVal: { fontSize: 9, color: '#a9a291', fontWeight: W.sb },
  barLbl: { fontSize: 9, color: '#7a7261', fontWeight: W.r, marginTop: 4 },
  trHead: { paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: '#efe9df' },
  th: { fontSize: 12, fontWeight: W.b, color: '#7a7261', textAlign: 'center' },
  tr: { paddingVertical: 9, alignItems: 'center' },
  td: { fontSize: 12, color: NAVY, textAlign: 'center', fontWeight: W.sb },
  promo: { backgroundColor: NAVY, borderRadius: 4, padding: 20, marginBottom: 14 },
  promoTitle: { fontSize: 18, fontWeight: W.m, color: '#fff' },
  promoSub: { fontSize: 12.5, color: '#cbd5e1', fontWeight: W.r, marginTop: 6, lineHeight: 19 },
  promoBtn: { backgroundColor: GOLD, borderRadius: 4, paddingVertical: 13, alignItems: 'center', marginTop: 16 },
  promoBtnTxt: { color: NAVY, fontSize: 15, fontWeight: W.b },
  note: { fontSize: 10, color: '#a9a291', fontWeight: W.r, textAlign: 'center', marginTop: 6 },
});
