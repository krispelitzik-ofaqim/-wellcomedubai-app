import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Alert, Platform, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useI18n } from '../constants/i18n';
import { CATALOG } from '../data/catalog';
import RESTAURANT_PHOTOS from '../data/restaurant-places-photos.json';
import { RE_API } from '../constants/realestate';

const NAVY = '#16222C', CREAM = '#F5F1EA', GOLD = '#E9C46A';
const W = { x: '800' as const, b: '700' as const, sb: '600' as const, m: '500' as const, r: '400' as const };

// Checkout now runs through the server (/api/coupons/pay), which creates the PayPal
// order and publishes the coupon only after the payment is confirmed.
const PRICE = '$365';        // charged in USD via PayPal (PayPal has no AED for us)
const PRICE_AED = 'AED 1,340'; // ≈ shown alongside for the business owner's reference (365 × ~3.67)
const SUPPORT_PHONE = '972502844867'; // WellCome Dubai support WhatsApp (intl, digits only)
const PLACES_KEY = 'AIzaSyDVYlYuM6saMxbhi2aKNCtiv6J8mR8LLgw';
const REST_FALLBACK = 'https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg'; // reliable dining image when Places photo is missing/expired
// Representative restaurant photo — same Google Places source as the restaurants page, with a safe fallback.
function restPhoto(id: number): string {
  const name = (RESTAURANT_PHOTOS as any)?.[String(id)]?.photos?.[0]?.name;
  return name ? `https://places.googleapis.com/v1/${name}/media?key=${PLACES_KEY}&maxWidthPx=600` : REST_FALLBACK;
}

type Lang = 'he' | 'en' | 'ru' | 'hi' | 'ar';
const HELP: Record<Lang, string> = { he: 'צריך סיוע?', en: 'Need help?', ru: 'Нужна помощь?', hi: 'मदद चाहिए?', ar: 'تحتاج مساعدة؟' };

const TR: Record<Lang, Record<string, string>> = {
  he: { title: 'הקמת חבילת קופון', validity: 'תוקף החבילה · שנה מיום הרכישה', from: 'מ', to: 'עד', pickBiz: 'חפש את העסק שלך', search: 'הקלד שם עסק...', discType: 'אחוז ההנחה', fixed: 'קבוע', variable: 'משתנה', fixedHint: 'האחוז יוצג על תמונת הקופון', varHint: 'סליידר 5%–15% יופעל במימוש (העסק בוחר)', fixedDesc: 'הלקוח יודע את ההנחה מראש.', varDesc: 'בעל העסק מחליט את גובה ההנחה ביום הרכישה.', pay: 'המשך לתשלום', logout: 'חזרה', missing: 'בחר עסק ואחוז', dealTitle: 'פרטי עסקה', sumBiz: 'עסק', sumDisc: 'גובה ההנחה שנקבעה בקופון', sumTotal: 'סך לתשלום', varLbl: 'משתנה (5%-15%)', change: 'שנה', noRes: 'לא נמצא עסק בשם זה', listNote: 'הרשימה מכילה עסקים שהומלצו על ידי צוות וולקאם דובאי', payErr: 'התשלום אינו זמין כרגע. נסו שוב בעוד רגע.' },
  en: { title: 'Set up a coupon package', validity: 'Package validity · one year from purchase', from: 'From', to: 'To', pickBiz: 'Search your business', search: 'Type a business name...', discType: 'Discount', fixed: 'Fixed', variable: 'Variable', fixedHint: 'The % is shown on the coupon image', varHint: 'A 5%–15% slider activates at redemption (you pick)', fixedDesc: 'the customer knows the discount in advance.', varDesc: 'the owner decides the discount on the day.', pay: 'Continue to payment', logout: 'Back', missing: 'Pick a business and a %', dealTitle: 'Order summary', sumBiz: 'Business', sumDisc: 'Discount set in the coupon', sumTotal: 'Total', varLbl: 'Variable (5%-15%)', change: 'Change', noRes: 'No business found', listNote: 'The list includes businesses recommended by the WellCome Dubai team', payErr: 'Payment is unavailable right now. Please try again in a moment.' },
  ru: { title: 'Настройка пакета купонов', validity: 'Срок действия · один год с даты покупки', from: 'С', to: 'По', pickBiz: 'Найдите свой бизнес', search: 'Введите название...', discType: 'Скидка', fixed: 'Фиксированная', variable: 'Переменная', fixedHint: 'Процент показан на изображении купона', varHint: 'Ползунок 5%–15% активируется при погашении', fixedDesc: 'клиент знает скидку заранее.', varDesc: 'владелец решает в день покупки.', pay: 'Перейти к оплате', logout: 'Назад', missing: 'Выберите бизнес и процент', dealTitle: 'Детали заказа', sumBiz: 'Бизнес', sumDisc: 'Размер скидки в купоне', sumTotal: 'Итого', varLbl: 'Переменная (5%-15%)', change: 'Изменить', noRes: 'Бизнес не найден', listNote: 'В списке бизнесы, рекомендованные командой WellCome Dubai', payErr: 'Оплата сейчас недоступна. Попробуйте через минуту.' },
  hi: { title: 'कूपन पैकेज सेट करें', validity: 'पैकेज वैधता · खरीद से एक वर्ष', from: 'से', to: 'तक', pickBiz: 'अपना व्यापार खोजें', search: 'व्यापार का नाम लिखें...', discType: 'छूट', fixed: 'निश्चित', variable: 'परिवर्तनीय', fixedHint: 'प्रतिशत कूपन छवि पर दिखता है', varHint: 'भुनाते समय 5%–15% स्लाइडर सक्रिय होगा', fixedDesc: 'ग्राहक को छूट पहले से पता होती है।', varDesc: 'मालिक उसी दिन छूट तय करता है।', pay: 'भुगतान जारी रखें', logout: 'वापस', missing: 'व्यापार और प्रतिशत चुनें', dealTitle: 'ऑर्डर सारांश', sumBiz: 'व्यापार', sumDisc: 'कूपन में निर्धारित छूट', sumTotal: 'कुल', varLbl: 'परिवर्तनीय (5%-15%)', change: 'बदलें', noRes: 'कोई व्यापार नहीं मिला', listNote: 'सूची में WellCome Dubai टीम द्वारा अनुशंसित व्यापार शामिल हैं', payErr: 'भुगतान अभी उपलब्ध नहीं है। कृपया थोड़ी देर बाद प्रयास करें।' },
  ar: { title: 'إعداد باقة قسائم', validity: 'صلاحية الباقة · سنة من الشراء', from: 'من', to: 'إلى', pickBiz: 'ابحث عن عملك', search: 'اكتب اسم العمل...', discType: 'نسبة الخصم', fixed: 'ثابت', variable: 'متغير', fixedHint: 'تظهر النسبة على صورة القسيمة', varHint: 'يُفعّل شريط 5%–15% عند الاستخدام', fixedDesc: 'يعرف العميل الخصم مسبقاً.', varDesc: 'يقرر المالك الخصم في اليوم نفسه.', pay: 'متابعة الدفع', logout: 'رجوع', missing: 'اختر عملاً ونسبة', dealTitle: 'ملخص الطلب', sumBiz: 'العمل', sumDisc: 'الخصم المحدد في القسيمة', sumTotal: 'الإجمالي', varLbl: 'متغير (5%-15%)', change: 'تغيير', noRes: 'لم يُعثر على عمل', listNote: 'تشمل القائمة أعمالاً موصى بها من فريق ويلكوم دبي', payErr: 'الدفع غير متاح حالياً. حاول بعد قليل.' },
};

// What the business owner gets — explanation shown at the top of the setup screen.
const INTRO: Record<Lang, { title: string; points: string[] }> = {
  he: { title: 'מה אתם מקבלים?', points: [
    'הקופון שלכם מופיע בעמוד הקופונים ובעמוד העסק שלכם באפליקציה',
    'חשיפה לתיירים מכל העולם — ב-5 שפות (עברית, אנגלית, רוסית, הינדי, ערבית)',
    'לקוחות חדשים שמגיעים עם הקופון ומזמינים אצלכם',
    'אתם קובעים את גובה ההנחה — קבוע או משתנה',
    'תוקף לשנה שלמה · תשלום חד-פעמי $365 (רק $1 ליום)',
  ] },
  en: { title: 'What you get', points: [
    'Your coupon appears on the Coupons page and on your business page in the app',
    'Exposure to tourists from around the world — in 5 languages (Hebrew, English, Russian, Hindi, Arabic)',
    'New customers who arrive with the coupon and order at your place',
    'You set the discount — fixed or variable',
    'Valid for a full year · one-time payment of $365 (just $1 a day)',
  ] },
  ru: { title: 'Что вы получаете', points: [
    'Ваш купон появляется на странице купонов и на странице вашего бизнеса в приложении',
    'Показ туристам со всего мира — на 5 языках (иврит, английский, русский, хинди, арабский)',
    'Новые клиенты, которые приходят с купоном и заказывают у вас',
    'Вы устанавливаете скидку — фиксированную или переменную',
    'Действует целый год · единоразовая оплата $365 (всего $1 в день)',
  ] },
  hi: { title: 'आपको क्या मिलता है?', points: [
    'आपका कूपन कूपन पेज और ऐप में आपके व्यापार पेज पर दिखता है',
    'दुनिया भर के पर्यटकों तक पहुँच — 5 भाषाओं में (हिब्रू, अंग्रेज़ी, रूसी, हिंदी, अरबी)',
    'नए ग्राहक जो कूपन के साथ आते हैं और आपके यहाँ ऑर्डर करते हैं',
    'आप छूट तय करते हैं — निश्चित या परिवर्तनीय',
    'पूरे एक वर्ष के लिए वैध · एकमुश्त भुगतान $365 (सिर्फ़ $1 प्रतिदिन)',
  ] },
  ar: { title: 'ماذا تحصل عليه؟', points: [
    'تظهر قسيمتك في صفحة القسائم وفي صفحة عملك داخل التطبيق',
    'الوصول إلى سياح من كل العالم — بـ5 لغات (العبرية، الإنجليزية، الروسية، الهندية، العربية)',
    'عملاء جدد يأتون بالقسيمة ويطلبون لديك',
    'أنت تحدد الخصم — ثابت أو متغير',
    'صالحة لسنة كاملة · دفعة واحدة $365 (دولار واحد فقط في اليوم)',
  ] },
};

type Rest = { id?: number; name: string; image?: string };
const PCTS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
const AZ = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').concat('#');
const CPL = (l: string): Lang => (['he', 'en', 'ru', 'hi', 'ar'].includes(l) ? (l as Lang) : 'en');

// Restaurant thumbnail with a safe fallback (Places photos can be missing/expired/blocked).
function Thumb({ img }: { img?: string }) {
  const [src, setSrc] = useState(img && img.length > 4 ? img : REST_FALLBACK);
  return <Image source={{ uri: src }} style={s.thumb} resizeMode="cover" onError={() => setSrc(REST_FALLBACK)} />;
}

export default function AgentCouponScreen() {
  const { lang, isRTL } = useI18n();
  const L = CPL(lang);
  const t = TR[L];
  const wd = (isRTL ? 'rtl' : 'ltr') as 'rtl' | 'ltr';
  const ta = (isRTL ? 'right' : 'left') as 'right' | 'left';

  const [q, setQ] = useState('');
  const [letter, setLetter] = useState<string | null>(null); // A-Z browse (restaurant names are all English)
  const [biz, setBiz] = useState<Rest | null>(null);
  const [type, setType] = useState<'fixed' | 'variable'>('fixed');
  const [pct, setPct] = useState<number | null>(null);

  // Businesses come straight from the local catalog (restaurants) — self-contained, no server.
  const restaurants: Rest[] = useMemo(() => {
    const arr: any[] = (CATALOG as any).restaurants || [];
    return arr.map(r => ({ id: r.id, name: r.nameEn || r.name, image: r.image || restPhoto(r.id) })).filter(r => r.name && r.name.length > 2);
  }, []);

  const dates = useMemo(() => {
    const d = new Date();
    const fmt = (x: Date) => `${String(x.getDate()).padStart(2, '0')}/${String(x.getMonth() + 1).padStart(2, '0')}/${x.getFullYear()}`;
    const end = new Date(d); end.setFullYear(d.getFullYear() + 1);
    return { from: fmt(d), to: fmt(end) };
  }, []);

  // List is hidden until the owner searches or picks a letter.
  const byLetter = letter
    ? restaurants
        .filter(r => (letter === '#' ? !/^[a-z]/i.test(r.name) : r.name[0].toUpperCase() === letter))
        .sort((x, y) => x.name.localeCompare(y.name))
    : [];
  const results = q.trim()
    ? restaurants.filter(r => r.name.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 8)
    : byLetter;

  // Pay-then-activate: the server saves the coupon as pending and only publishes it
  // once PayPal confirms the payment. An owner can never publish a coupon for free.
  const [paying, setPaying] = useState(false);
  const pay = async () => {
    if (!biz || (type === 'fixed' && !pct)) { const m = t.missing; Platform.OS === 'web' ? alert(m) : Alert.alert(m); return; }
    if (paying) return;
    setPaying(true);
    try {
      const r = await fetch(`${RE_API}/api/coupons/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bizId: biz.id ?? null, bizName: biz.name, bizCat: 'restaurants', image: biz.image || '',
          type, pct: type === 'fixed' ? pct : null, lang: L,
        }),
      });
      const j = await r.json();
      if (j && j.success && j.url) { Linking.openURL(j.url).catch(() => {}); }
      else { const m = t.payErr; Platform.OS === 'web' ? alert(m) : Alert.alert(m); }
    } catch {
      const m = t.payErr; Platform.OS === 'web' ? alert(m) : Alert.alert(m);
    } finally { setPaying(false); }
  };

  const intro = INTRO[L];

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={[s.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/coupons'))} style={s.backBtn}><Text style={s.backTxt}>{isRTL ? '›' : '‹'}</Text></TouchableOpacity>
        <Text style={[s.hTitle, { flex: 1, textAlign: ta, writingDirection: wd }]}>{t.title}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 130 }} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* What the business owner gets */}
        <View style={s.intro}>
          <Text style={[s.introTitle, { textAlign: ta, writingDirection: wd }]}>{intro.title}</Text>
          {intro.points.map((p, i) => (
            <View key={i} style={[s.introRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Text style={s.introBullet}>✓</Text>
              <Text style={[s.introTxt, { flex: 1, textAlign: ta, writingDirection: wd }]}>{p}</Text>
            </View>
          ))}
        </View>

        {/* Validity */}
        <Text style={[s.lbl, { textAlign: ta, writingDirection: wd }]}>{t.validity}</Text>
        <View style={s.dateLine}>
          <Text style={s.dateInline} numberOfLines={1} adjustsFontSizeToFit>{dates.from}  {t.to}  {dates.to}</Text>
        </View>

        {/* Business search (list hidden until typing) */}
        <Text style={[s.lbl, { textAlign: ta, writingDirection: wd, marginTop: 18 }]}>{t.pickBiz}</Text>
        {!biz ? (
          <>
            {/* A-Z shortcut — restaurant names are English, so this row stays LTR in every language. */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.azRow} style={{ marginBottom: 10 }}>
              {AZ.map(ch => (
                <TouchableOpacity key={ch} style={[s.azChip, letter === ch && s.azChipOn]} activeOpacity={0.8}
                  onPress={() => { setQ(''); setLetter(letter === ch ? null : ch); }}>
                  <Text style={[s.azTxt, letter === ch && s.azTxtOn]}>{ch}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TextInput value={q} onChangeText={x => { setQ(x); if (x) setLetter(null); }} placeholder={t.search} placeholderTextColor="#9aa5b1" style={[s.input, { textAlign: ta, writingDirection: wd }]} />
            <Text style={[s.listNote, { textAlign: ta, writingDirection: wd }]}>{t.listNote}</Text>
            {(q.trim().length > 0 || letter) && (
              results.length ? (
                <View style={s.list}>
                  {results.map(r => (
                    <TouchableOpacity key={r.name} style={[s.resRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]} onPress={() => { setBiz(r); setQ(''); setLetter(null); }}>
                      <Thumb img={r.image} />
                      <Text style={[s.resName, { textAlign: ta, writingDirection: wd }]} numberOfLines={1}>{r.name}</Text>
                      <View style={s.radio} />
                    </TouchableOpacity>
                  ))}
                </View>
              ) : <Text style={[s.hint, { textAlign: ta, writingDirection: wd }]}>{t.noRes}</Text>
            )}
          </>
        ) : (
          <View style={[s.selRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <Thumb img={biz.image} />
            <Text style={[s.resName, { textAlign: ta, writingDirection: wd }]} numberOfLines={1}>{biz.name}</Text>
            <View style={s.radioOn}><Text style={{ color: '#fff', fontSize: 13 }}>✓</Text></View>
            <TouchableOpacity onPress={() => { setBiz(null); setPct(null); }}><Text style={s.change}>{t.change}</Text></TouchableOpacity>
          </View>
        )}

        {/* Discount — only after a business is chosen */}
        {biz && (
          <>
            <Text style={[s.lbl, { textAlign: ta, writingDirection: wd, marginTop: 18 }]}>{t.discType}</Text>
            <Text style={[s.typeExplain, { textAlign: ta, writingDirection: wd }]}><Text style={s.typeKey}>{t.fixed}</Text> = {t.fixedDesc}{'\n'}<Text style={s.typeKey}>{t.variable}</Text> = {t.varDesc}</Text>
            <View style={[s.rowWrap, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity style={[s.seg, type === 'fixed' && s.segOn]} onPress={() => setType('fixed')}><Text style={[s.segTxt, type === 'fixed' && s.segTxtOn]}>{t.fixed}</Text></TouchableOpacity>
              <TouchableOpacity style={[s.seg, type === 'variable' && s.segOn]} onPress={() => { setType('variable'); setPct(null); }}><Text style={[s.segTxt, type === 'variable' && s.segTxtOn]}>{t.variable}</Text></TouchableOpacity>
            </View>
            {type === 'fixed' ? (
              <>
                <Text style={[s.hint, { textAlign: ta, writingDirection: wd }]}>{t.fixedHint}</Text>
                <View style={[s.rowWrap, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                  {PCTS.map(p => (<TouchableOpacity key={p} style={[s.pctChip, pct === p && s.pctChipOn]} onPress={() => setPct(p)}><Text style={[s.pctTxt, pct === p && { color: NAVY }]}>{p}%</Text></TouchableOpacity>))}
                </View>
              </>
            ) : <Text style={[s.hint, { textAlign: ta, writingDirection: wd }]}>{t.varHint}</Text>}

            {/* Order summary */}
            <View style={s.summary}>
              <Text style={[s.sumTitle, { textAlign: ta, writingDirection: wd }]}>{t.dealTitle}</Text>
              <View style={[s.sumRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}><Text style={s.sumK}>{t.sumBiz}</Text><Text style={s.sumV} numberOfLines={1}>{biz.name}</Text></View>
              <View style={[s.sumRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}><Text style={s.sumK}>{t.sumDisc}</Text><Text style={s.sumV}>{type === 'fixed' ? (pct ? pct + '%' : '—') : t.varLbl}</Text></View>
              <View style={[s.sumRow, s.sumTotalRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}><Text style={s.sumTotalK}>{t.sumTotal}</Text><View style={{ alignItems: isRTL ? 'flex-start' : 'flex-end' }}><Text style={s.sumTotalV}>{PRICE}</Text><Text style={s.sumAed}>≈ {PRICE_AED}</Text></View></View>
            </View>

            <TouchableOpacity style={[s.payBtn, paying && { opacity: 0.6 }]} activeOpacity={0.85} disabled={paying} onPress={pay}><Text style={s.payTxt}>{t.pay} · {PRICE}</Text></TouchableOpacity>
          </>
        )}

        <TouchableOpacity style={{ paddingVertical: 14, alignItems: 'center' }} onPress={() => (router.canGoBack() ? router.back() : router.replace('/coupons'))}><Text style={{ color: '#64748b', fontWeight: W.sb }}>{t.logout}</Text></TouchableOpacity>
      </ScrollView>

      {/* Floating WhatsApp help button (RTL: on the LEFT, LTR: on the RIGHT) */}
      <TouchableOpacity
        style={[s.fab, isRTL ? { left: 16 } : { right: 16 }, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
        activeOpacity={0.9}
        onPress={() => {
          const msg = encodeURIComponent(`${HELP[L]} · ${t.title}`);
          Linking.openURL(`https://wa.me/${SUPPORT_PHONE}?text=${msg}`).catch(() => {});
        }}
      >
        <Text style={s.fabIcon}>💬</Text>
        <Text style={s.fabTxt}>{HELP[L]}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CREAM },
  header: { alignItems: 'center', padding: 12, gap: 8, backgroundColor: NAVY },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: '#fff', fontSize: 24, fontWeight: W.r },
  hTitle: { fontSize: 24, fontWeight: W.m, color: '#fff' },
  intro: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#ece7dd' },
  introTitle: { fontSize: 17, fontWeight: W.m, color: '#1A6B8A', marginBottom: 12 },
  introRow: { alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  introBullet: { fontSize: 15, color: '#E9C46A', fontWeight: W.sb, marginTop: 1 },
  introTxt: { fontSize: 13.5, fontWeight: W.r, color: '#4a453c', lineHeight: 20 },
  fab: { position: 'absolute', bottom: 24, alignItems: 'center', gap: 8, backgroundColor: '#25D366', borderRadius: 28, paddingVertical: 12, paddingHorizontal: 18, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  fabIcon: { fontSize: 20 },
  fabTxt: { color: '#fff', fontSize: 14, fontWeight: W.b },
  lbl: { fontSize: 14, fontWeight: W.sb, color: '#7a7261', marginBottom: 8 },
  dateRow: { alignItems: 'center', gap: 10 },
  dateLine: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e7e0d4', borderRadius: 4, paddingVertical: 12, paddingHorizontal: 12, alignItems: 'center' },
  dateInline: { fontSize: 16, fontWeight: W.b, color: NAVY, textAlign: 'center' },
  sumAed: { fontSize: 12, fontWeight: W.r, color: '#a9a291', marginTop: 2 },
  azRow: { flexDirection: 'row', gap: 6, paddingVertical: 2 },
  azChip: { minWidth: 32, height: 32, paddingHorizontal: 6, borderRadius: 4, borderWidth: 1, borderColor: '#e7e0d4', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  azChipOn: { backgroundColor: NAVY, borderColor: NAVY },
  azTxt: { fontSize: 14, fontWeight: W.b, color: '#7a7261' },
  azTxtOn: { color: GOLD },
  input: { borderWidth: 1.5, borderColor: '#e7e0d4', borderRadius: 4, paddingVertical: 12, paddingHorizontal: 14, fontSize: 15, color: NAVY, fontWeight: W.r, backgroundColor: '#fff' },
  listNote: { marginTop: 7, fontSize: 12, color: '#8a8578', fontWeight: W.r, lineHeight: 16 },
  typeExplain: { marginTop: 4, marginBottom: 9, fontSize: 12.5, color: '#6b6558', fontWeight: W.r, lineHeight: 20 },
  typeKey: { fontWeight: W.x, color: NAVY },
  list: { marginTop: 8, backgroundColor: '#fff', borderRadius: 4, borderWidth: 1, borderColor: '#e7e0d4', overflow: 'hidden' },
  resRow: { alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12, borderBottomWidth: 1, borderBottomColor: '#f2ede3' },
  selRow: { alignItems: 'center', gap: 12, paddingVertical: 10, paddingHorizontal: 12, backgroundColor: '#fff', borderRadius: 4, borderWidth: 1.5, borderColor: GOLD, marginTop: 4 },
  thumb: { width: 46, height: 46, borderRadius: 4, backgroundColor: '#e5e7eb' },
  thumbEmpty: { alignItems: 'center', justifyContent: 'center' },
  resName: { flex: 1, fontSize: 15, fontWeight: W.sb, color: NAVY },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#cbd5e1' },
  radioOn: { width: 22, height: 22, borderRadius: 11, backgroundColor: GOLD, alignItems: 'center', justifyContent: 'center' },
  change: { color: NAVY, fontWeight: W.sb, fontSize: 13 },
  rowWrap: { flexWrap: 'wrap', gap: 8, marginTop: 4 },
  seg: { flex: 1, paddingVertical: 12, borderRadius: 4, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1.5, borderColor: '#e7e0d4' },
  segOn: { backgroundColor: NAVY, borderColor: NAVY },
  segTxt: { fontSize: 15, fontWeight: W.sb, color: NAVY },
  segTxtOn: { color: '#fff' },
  hint: { fontSize: 12.5, fontWeight: W.r, color: '#a9a291', marginTop: 8, marginBottom: 6 },
  pctChip: { width: 56, paddingVertical: 10, borderRadius: 4, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1.5, borderColor: '#e7e0d4' },
  pctChipOn: { backgroundColor: GOLD, borderColor: GOLD },
  pctTxt: { fontSize: 15, fontWeight: W.b, color: NAVY },
  summary: { backgroundColor: '#fff', borderRadius: 4, borderWidth: 1, borderColor: '#e7e0d4', padding: 16, marginTop: 20 },
  sumTitle: { fontSize: 16, fontWeight: W.b, color: NAVY, marginBottom: 10 },
  sumRow: { justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  sumK: { fontSize: 14, fontWeight: W.r, color: '#7a7261' },
  sumV: { fontSize: 15, fontWeight: W.sb, color: NAVY, flexShrink: 1, marginHorizontal: 10 },
  sumTotalRow: { borderTopWidth: 1, borderTopColor: '#efe9df', marginTop: 6, paddingTop: 10 },
  sumTotalK: { fontSize: 15, fontWeight: W.b, color: NAVY },
  sumTotalV: { fontSize: 22, fontWeight: W.x, color: '#B8912E' },
  payBtn: { backgroundColor: GOLD, borderRadius: 4, paddingVertical: 15, alignItems: 'center', marginTop: 18 },
  payTxt: { color: NAVY, fontWeight: W.b, fontSize: 16 },
});
