import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Image, Share, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useI18n } from '../constants/i18n';

// TODO: replace with the WellCome Dubai App Store id once known (placeholder = Batumi id)
const IOS_LINK = 'https://apps.apple.com/app/id6762504162';
const ANDROID_LINK = 'https://play.google.com/store/apps/details?id=com.wellcomedubai.app';
const FALLBACK_IMG = 'https://wellcomedubai.com/images/Yizhak/dubai-mall-dubai-uae.jpg';

const NAVY = '#16222C', CREAM = '#F5F1EA', GOLD = '#E9C46A';
const W = { x: '800' as const, b: '700' as const, sb: '600' as const, m: '500' as const, r: '400' as const };

type CpLang = 'he' | 'en' | 'ru' | 'hi' | 'ar';
const CP_TR: Record<CpLang, any> = {
  he: {
    title: 'קופון הנחה', titleDone: 'ההנחה התקבלה', getSpecial: 'קבל הנחה מיוחדת',
    off: (n: number) => `${n}% הנחה`, upTo: 'עד 15% הנחה', shareBtn: '💬 שתף בוואטסאפ', shareRedeem: 'למימוש הורידו את אפליקציית וולקאם דובאי:',
    showWaiter: 'הצג את הקופון בעת התשלום', validUntil: (d: string) => `בתוקף עד ${d}`,
    discountToday: 'גובה ההנחה היום', phDate: 'תאריך (YYYY-MM-DD)', phPhone: 'טלפון',
    codeNote: 'הצג את הקוד בעת התשלום', send: 'שלח', ended: 'הקופון הסתיים',
    fillDatePhone: 'נא למלא תאריך וטלפון', choosePct: 'נא לבחור אחוז הנחה (5–15%)',
    finePrint: 'קופון אחד לחשבון משולם בלבד · מימוש אחד ליום מכל טלפון. הבעלים רשאים לתת הנחות גורפות ללא קשר לקופון.',
    dashLink: '📊 קופונים שמומשו · סטטיסטיקה', buyCoupons: '🎟️ רכישת קופונים · לבעלי עסקים', doneSuccess: 'ההנחה התקבלה בהצלחה',
    usedAt: (t: string) => `נוצל היום בשעה ${t}`,
    lockNote: 'מימוש נוסף אפשרי מחר (בתאריך חדש). קופון אחד לחשבון משולם בלבד.',
  },
  en: {
    title: 'Discount coupon', titleDone: 'Discount received', getSpecial: 'Get a special discount',
    off: (n: number) => `${n}% off`, upTo: 'Up to 15% off', shareBtn: '💬 Share on WhatsApp', shareRedeem: 'To redeem, download the WellCome Dubai app:',
    showWaiter: 'Show the coupon when paying', validUntil: (d: string) => `Valid until ${d}`,
    discountToday: "Today's discount", phDate: 'Date (YYYY-MM-DD)', phPhone: 'Phone',
    codeNote: 'Show this code when paying', send: 'Send', ended: 'Coupon ended',
    fillDatePhone: 'Please enter date and phone', choosePct: 'Please choose a discount (5–15%)',
    finePrint: 'One coupon per paid bill only · one redemption per day per phone. Owners may grant blanket discounts regardless of the coupon.',
    dashLink: '📊 Redeemed coupons · statistics', buyCoupons: '🎟️ Buy coupons · for business owners', doneSuccess: 'Discount received successfully',
    usedAt: (t: string) => `Used today at ${t}`,
    lockNote: 'Another redemption is possible tomorrow (a new date). One coupon per paid bill only.',
  },
  ru: {
    title: 'Купон на скидку', titleDone: 'Скидка получена', getSpecial: 'Получите специальную скидку',
    off: (n: number) => `Скидка ${n}%`, upTo: 'До 15% скидки', shareBtn: '💬 Поделиться в WhatsApp', shareRedeem: 'Для использования скачайте приложение WellCome Dubai:',
    showWaiter: 'Покажите купон при оплате', validUntil: (d: string) => `Действителен до ${d}`,
    discountToday: 'Скидка сегодня', phDate: 'Дата (YYYY-MM-DD)', phPhone: 'Телефон',
    codeNote: 'Покажите этот код при оплате', send: 'Отправить', ended: 'Купон завершён',
    fillDatePhone: 'Пожалуйста, введите дату и телефон', choosePct: 'Пожалуйста, выберите скидку (5–15%)',
    finePrint: 'Один купон на один оплаченный счёт · одно использование в день с одного телефона. Владельцы могут предоставлять общие скидки независимо от купона.',
    dashLink: '📊 Использованные купоны · статистика', buyCoupons: '🎟️ Купить купоны · для бизнеса', doneSuccess: 'Скидка успешно получена',
    usedAt: (t: string) => `Использовано сегодня в ${t}`,
    lockNote: 'Повторное использование возможно завтра (новая дата). Один купон на один оплаченный счёт.',
  },
  hi: {
    title: 'डिस्काउंट कूपन', titleDone: 'छूट प्राप्त हुई', getSpecial: 'विशेष छूट पाएं',
    off: (n: number) => `${n}% छूट`, upTo: '15% तक छूट', shareBtn: '💬 WhatsApp पर साझा करें', shareRedeem: 'भुनाने के लिए WellCome Dubai ऐप डाउनलोड करें:',
    showWaiter: 'भुगतान करते समय कूपन दिखाएं', validUntil: (d: string) => `${d} तक मान्य`,
    discountToday: 'आज की छूट', phDate: 'तारीख (YYYY-MM-DD)', phPhone: 'फ़ोन',
    codeNote: 'भुगतान करते समय यह कोड दिखाएं', send: 'भेजें', ended: 'कूपन समाप्त',
    fillDatePhone: 'कृपया तारीख और फ़ोन दर्ज करें', choosePct: 'कृपया छूट चुनें (5–15%)',
    finePrint: 'प्रति भुगतान बिल केवल एक कूपन · प्रति फ़ोन प्रति दिन एक बार। मालिक कूपन से अलग सामान्य छूट दे सकते हैं।',
    dashLink: '📊 भुनाए गए कूपन · आँकड़े', buyCoupons: '🎟️ कूपन खरीदें · व्यापार मालिकों के लिए', doneSuccess: 'छूट सफलतापूर्वक प्राप्त हुई',
    usedAt: (t: string) => `आज ${t} बजे उपयोग किया गया`,
    lockNote: 'अगली बार कल (नई तारीख) उपयोग संभव है। प्रति भुगतान बिल केवल एक कूपन।',
  },
  ar: {
    title: 'قسيمة خصم', titleDone: 'تم الحصول على الخصم', getSpecial: 'احصل على خصم خاص',
    off: (n: number) => `خصم ${n}%`, upTo: 'خصم حتى 15%', shareBtn: '💬 مشاركة عبر واتساب', shareRedeem: 'للاستخدام حمّل تطبيق ويلكوم دبي:',
    showWaiter: 'أظهر القسيمة عند الدفع', validUntil: (d: string) => `صالحة حتى ${d}`,
    discountToday: 'خصم اليوم', phDate: 'التاريخ (YYYY-MM-DD)', phPhone: 'الهاتف',
    codeNote: 'أظهر هذا الرمز عند الدفع', send: 'إرسال', ended: 'انتهت القسيمة',
    fillDatePhone: 'يرجى إدخال التاريخ والهاتف', choosePct: 'يرجى اختيار نسبة الخصم (5–15%)',
    finePrint: 'قسيمة واحدة لكل فاتورة مدفوعة · استخدام واحد يومياً لكل هاتف. يحق للمالك منح خصومات عامة بغض النظر عن القسيمة.',
    dashLink: '📊 القسائم المستخدمة · إحصائيات', buyCoupons: '🎟️ شراء قسائم · لأصحاب الأعمال', doneSuccess: 'تم الحصول على الخصم بنجاح',
    usedAt: (t: string) => `استُخدمت اليوم الساعة ${t}`,
    lockNote: 'يمكن الاستخدام مجدداً غداً (تاريخ جديد). قسيمة واحدة لكل فاتورة مدفوعة.',
  },
};
const CPL = (l: string): CpLang => (['he', 'en', 'ru', 'hi', 'ar'].includes(l) ? (l as CpLang) : 'en');

const slug = (str: string) => 'c' + Array.from(str || 'x').reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 0).toString(36);
function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
const lockKey = (bizId: string, phone: string) => `@coupon:${bizId}:${phone}:${todayKey()}`;

// Variable discount 5%–15% shown in a selection window (only the chosen value is visible).
const WHEEL_VALS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
function DiscountSelect({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  const { lang } = useI18n();
  const C = CP_TR[CPL(lang)];
  const [open, setOpen] = useState(false);
  return (
    <View style={s.selWrap}>
      <TouchableOpacity style={s.selBox} activeOpacity={0.8} onPress={() => setOpen(o => !o)}>
        <Text style={s.selChevron}>{open ? '▲' : '▼'}</Text>
        <Text style={[s.selVal, value == null && s.selPlaceholder]}>{value == null ? C.discountToday : `${value}%`}</Text>
      </TouchableOpacity>
      {open && (
        <View style={s.selList}>
          {WHEEL_VALS.map(v => (
            <TouchableOpacity key={v} style={[s.selOpt, value === v && s.selOptOn]} onPress={() => { onChange(v); setOpen(false); }}>
              <Text style={[s.selOptTxt, value === v && s.selOptTxtOn]}>{v}%</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

export default function CouponScreen() {
  const { lang, isRTL } = useI18n();
  const C = CP_TR[CPL(lang)];
  const dir = { textAlign: (isRTL ? 'right' : 'left') as 'right' | 'left', writingDirection: (isRTL ? 'rtl' : 'ltr') as 'rtl' | 'ltr' };
  const rowDir = { flexDirection: (isRTL ? 'row-reverse' : 'row') as 'row-reverse' | 'row' };

  const params = useLocalSearchParams<{ biz?: string; pct?: string; type?: string; pctNum?: string; offer?: string; valid?: string; img?: string }>();
  const bizName = params.biz || 'WellCome Dubai';
  const bizId = slug(bizName);
  const img = params.img || FALLBACK_IMG;
  const validTxt = params.valid || '';
  const offerTxt = params.offer || '';
  const isFixed = params.type === 'fixed' && !!params.pctNum && !isNaN(Number(params.pctNum));
  const fixedPct = isFixed ? Number(params.pctNum) : null;

  const [done, setDone] = useState(false);
  const [date, setDate] = useState(todayKey());
  const [phone, setPhone] = useState('');
  const [selPct, setSelPct] = useState<number | null>(null);
  const [pct, setPct] = useState<number | null>(null);
  const [redeemedAt, setRedeemedAt] = useState('');
  const [msg, setMsg] = useState('');

  const code = `${bizId.toUpperCase()}-${date}-${phone.slice(-4) || '0000'}`;

  const send = async () => {
    setMsg('');
    if (!date.trim() || !phone.trim()) { setMsg(C.fillDatePhone); return; }
    const chosen = isFixed ? fixedPct : selPct;
    if (isFixed) {
      if (!chosen) { setMsg(C.choosePct); return; }
    } else if (!chosen || chosen < 5 || chosen > 15) { setMsg(C.choosePct); return; }
    // one redemption per phone per day
    try {
      const raw = await AsyncStorage.getItem(lockKey(bizId, phone.trim()));
      if (raw) {
        const saved = JSON.parse(raw);
        setPct(saved.pct); setRedeemedAt(saved.time); setDone(true); setMsg('');
        return;
      }
    } catch {}
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setPct(chosen); setRedeemedAt(time); setDone(true);
    try { await AsyncStorage.setItem(lockKey(bizId, phone.trim()), JSON.stringify({ pct: chosen, time })); } catch {}
  };

  const shareCoupon = async () => {
    const discount = isFixed ? C.off(fixedPct) : C.upTo;
    const caption = `🎁 ${bizName} · ${discount}\n${C.shareRedeem}\n📱 ${IOS_LINK}\n🤖 ${ANDROID_LINK}`;
    if (Platform.OS === 'web') {
      try { (window as any).open('https://wa.me/?text=' + encodeURIComponent(caption), '_blank'); } catch {}
      return;
    }
    try {
      await Share.share({ message: caption });
    } catch {
      try { Linking.openURL('whatsapp://send?text=' + encodeURIComponent(caption)); } catch {}
    }
  };

  // QR that opens the business page in the app (like Batumi). Rendered as an image — no native QR dep.
  const bizDeep = `wellcomedubai://item/${params.bizId || ''}?cat=${params.bizCat || 'restaurants'}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=6&data=${encodeURIComponent(bizDeep)}`;
  const CodeBox = () => (
    <View style={s.qrWrap}>
      <View style={s.codeBox}><Image source={{ uri: qrUrl }} style={{ width: 180, height: 180 }} resizeMode="contain" /></View>
      <Text style={s.qrTxt}>{C.codeNote}</Text>
      <Text style={s.codeSmall}>{code}</Text>
    </View>
  );

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={[s.header, rowDir]}>
        <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/coupons'))} style={s.backBtn}>
          <Text style={s.backTxt}>{isRTL ? '›' : '‹'}</Text>
        </TouchableOpacity>
        <Text style={[s.hTitle, { flex: 1 }, dir]}>{done ? C.titleDone : C.title}</Text>
      </View>

      {!done ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 32 }}>
          <View style={s.sheet}>
            <View style={s.bizWrap}>
              <Image source={{ uri: img }} style={s.bizImg} resizeMode="cover" />
              <View style={s.ribbon}><Text style={s.ribbonTxt}>{C.getSpecial}</Text></View>
              <View style={s.bizOverlay}>
                <Text style={[s.bizName, dir]}>{bizName}</Text>
                {!!offerTxt && <Text style={[s.bizAddr, dir]}>{offerTxt}</Text>}
              </View>
            </View>

            <Text style={s.bigPct}>{isFixed ? C.off(fixedPct) : C.upTo}</Text>
            <Text style={s.sub}>{C.showWaiter}</Text>
            {!!validTxt && <Text style={s.validity}>{C.validUntil(validTxt)}</Text>}

            {!isFixed && (
              <>
                <Text style={s.wheelLabel}>{C.discountToday}</Text>
                <DiscountSelect value={selPct} onChange={setSelPct} />
              </>
            )}

            <TextInput value={date} onChangeText={setDate} placeholder={C.phDate} placeholderTextColor="#94a3b8" style={[s.input, dir]} />
            <TextInput value={phone} onChangeText={setPhone} placeholder={C.phPhone} placeholderTextColor="#94a3b8" keyboardType="phone-pad" style={[s.input, dir]} />

            <CodeBox />

            {!!msg && <Text style={s.err}>{msg}</Text>}
            <TouchableOpacity style={s.sendBtn} activeOpacity={0.85} onPress={send}>
              <Text style={s.sendTxt}>{C.send}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.waBtn} activeOpacity={0.85} onPress={shareCoupon}>
              <Text style={s.waTxt}>{C.shareBtn}</Text>
            </TouchableOpacity>

            <Text style={s.finePrint}>{C.finePrint}</Text>
          </View>

          <TouchableOpacity style={s.buyBtn} activeOpacity={0.85} onPress={() => router.push('/agent-coupon' as any)}>
            <Text style={s.buyTxt}>{C.buyCoupons}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.dashLink} onPress={() => router.push('/coupon-dashboard' as any)}>
            <Text style={[s.dashLinkTxt, dir]}>{C.dashLink}</Text>
          </TouchableOpacity>
        </ScrollView>
      ) : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 14, paddingBottom: 32 }}>
          <View style={[s.sheet, s.sheetDone]}>
            <Text style={s.doneMark}>✓</Text>
            <Text style={s.doneTitle}>{C.doneSuccess}</Text>
            <Text style={s.donePct}>{pct}%</Text>
            <Text style={s.bizName2}>{bizName}</Text>
            <Text style={s.doneTime}>{C.usedAt(redeemedAt)}</Text>
            <CodeBox />
            <Text style={s.lockNote}>{C.lockNote}</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CREAM },
  header: { alignItems: 'center', padding: 12, gap: 8, backgroundColor: NAVY },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: '#fff', fontSize: 24, fontWeight: W.r, marginTop: -2 },
  hTitle: { fontSize: 24, fontWeight: W.m, color: '#fff' },
  sheet: { backgroundColor: '#fff', borderRadius: 6, padding: 16, borderWidth: 1.5, borderColor: '#e7e0d4', alignItems: 'center' },
  sheetDone: { borderColor: '#2E9E6B', minHeight: 460, justifyContent: 'center' },
  bizWrap: { width: '100%', height: 160, borderRadius: 4, overflow: 'hidden', justifyContent: 'flex-end', backgroundColor: '#e5e7eb' },
  bizImg: { ...StyleSheet.absoluteFillObject, width: '100%', height: '100%' },
  bizOverlay: { backgroundColor: 'rgba(0,0,0,0.5)', padding: 12 },
  ribbon: { position: 'absolute', top: 22, left: -42, width: 172, transform: [{ rotate: '-45deg' }], backgroundColor: GOLD, paddingVertical: 5, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  ribbonTxt: { color: NAVY, fontSize: 11, fontWeight: W.x },
  bizName: { color: '#fff', fontSize: 22, fontWeight: W.m },
  bizAddr: { color: '#e2e8f0', fontSize: 12, fontWeight: W.r, marginTop: 2 },
  bigPct: { fontSize: 38, fontWeight: W.m, color: NAVY, marginTop: 16 },
  sub: { fontSize: 13, color: '#7a7261', fontWeight: W.r, marginBottom: 14, textAlign: 'center' },
  validity: { fontSize: 12, fontWeight: W.sb, color: '#2E9E6B', backgroundColor: '#e6f4ec', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 4, overflow: 'hidden', marginBottom: 14 },
  wheelLabel: { fontSize: 13, fontWeight: W.sb, color: NAVY, marginBottom: 6, textAlign: 'center' },
  selWrap: { alignSelf: 'stretch', marginBottom: 14, zIndex: 10 },
  selBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f7f2e9', borderRadius: 4, paddingHorizontal: 14, paddingVertical: 14, borderWidth: 1.5, borderColor: NAVY },
  selVal: { fontSize: 20, fontWeight: W.b, color: NAVY },
  selPlaceholder: { color: '#a9a291', fontWeight: W.sb, fontSize: 15 },
  selChevron: { fontSize: 14, color: '#7a7261', fontWeight: W.b },
  selList: { backgroundColor: '#fff', borderRadius: 4, borderWidth: 1, borderColor: '#e7e0d4', marginTop: 6, overflow: 'hidden' },
  selOpt: { paddingVertical: 12, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#f2ede3' },
  selOptOn: { backgroundColor: '#f2ede3' },
  selOptTxt: { fontSize: 17, fontWeight: W.sb, color: NAVY },
  selOptTxtOn: { color: NAVY },
  input: { alignSelf: 'stretch', backgroundColor: '#f7f2e9', borderRadius: 4, padding: 12, fontSize: 15, fontWeight: W.r, marginBottom: 12, borderWidth: 1, borderColor: '#e7e0d4', color: NAVY },
  qrWrap: { alignItems: 'center', marginVertical: 14 },
  codeBox: { paddingVertical: 16, paddingHorizontal: 22, backgroundColor: '#fff', borderWidth: 1.5, borderStyle: 'dashed', borderColor: NAVY, borderRadius: 6 },
  codeBig: { fontSize: 20, fontWeight: W.x, color: NAVY, letterSpacing: 2 },
  qrTxt: { fontSize: 12, color: NAVY, fontWeight: W.sb, marginTop: 8 },
  codeSmall: { fontSize: 12, color: '#9aa5b1', fontWeight: W.sb, letterSpacing: 1, marginTop: 4 },
  err: { color: '#dc2626', fontSize: 13, fontWeight: W.sb, marginBottom: 8 },
  sendBtn: { alignSelf: 'stretch', backgroundColor: GOLD, borderRadius: 4, paddingVertical: 15, alignItems: 'center' },
  sendTxt: { color: NAVY, fontSize: 17, fontWeight: W.b },
  finePrint: { fontSize: 10, color: '#a9a291', fontWeight: W.r, marginTop: 12, lineHeight: 15, textAlign: 'center' },
  doneMark: { fontSize: 64, color: '#2E9E6B', fontWeight: W.x },
  doneTitle: { fontSize: 22, fontWeight: W.m, color: '#2E9E6B', marginTop: 6, textAlign: 'center' },
  donePct: { fontSize: 56, fontWeight: W.x, color: NAVY, marginVertical: 4 },
  bizName2: { fontSize: 22, fontWeight: W.m, color: NAVY, textAlign: 'center' },
  doneTime: { fontSize: 13, color: '#7a7261', fontWeight: W.sb, marginTop: 8 },
  lockNote: { fontSize: 11, color: '#a9a291', fontWeight: W.r, marginTop: 14, textAlign: 'center', lineHeight: 16 },
  waBtn: { alignSelf: 'stretch', backgroundColor: '#25D366', borderRadius: 6, paddingVertical: 13, alignItems: 'center', marginTop: 14 },
  waTxt: { color: '#fff', fontWeight: W.b, fontSize: 15 },
  buyBtn: { marginTop: 16, backgroundColor: GOLD, borderRadius: 6, paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  buyTxt: { fontSize: 15, fontWeight: W.b, color: NAVY },
  dashLink: { marginTop: 12, alignItems: 'center', paddingVertical: 12 },
  dashLinkTxt: { fontSize: 13, fontWeight: W.sb, color: NAVY },
});
