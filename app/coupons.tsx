import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useI18n } from '../constants/i18n';
import { CATALOG } from '../data/catalog';
import RESTAURANT_PHOTOS from '../data/restaurant-places-photos.json';
import HOTEL_PHOTOS from '../data/hotel-photos.json';
import { RE_API } from '../constants/realestate';

const PLACES_KEY = 'AIzaSyDVYlYuM6saMxbhi2aKNCtiv6J8mR8LLgw'; // TODO: move Places key to env (see project_dubai_hardcoded_keys)
const GOLD = '#E9C46A', NAVY = '#16222C';
const FALLBACK_IMG = 'https://wellcomedubai.com/images/Yizhak/dubai-mall-dubai-uae.jpg';

type Cat = 'food' | 'stay';
type Demo = {
  id: number; cat: Cat; offerHe: string; offerEn: string;
  pct: string; type: 'fixed' | 'variable'; pctNum: number | null; valid: string; color: string;
  real?: boolean; bizName?: string; image?: string;
};

// Wording for coupons bought by real business owners (the demo ones carry their own text).
const OFFER: Record<string, { off: (p: number) => string; gift: string }> = {
  he: { off: p => `${p}% הנחה`, gift: 'הטבה מיוחדת מהעסק' },
  en: { off: p => `${p}% off`, gift: 'A special offer from the business' },
  ru: { off: p => `Скидка ${p}%`, gift: 'Особое предложение от заведения' },
  hi: { off: p => `${p}% छूट`, gift: 'व्यवसाय की ओर से विशेष ऑफ़र' },
  ar: { off: p => `خصم ${p}%`, gift: 'عرض خاص من المكان' },
};
const REAL_COLORS = ['#2A9D8F', '#E76F51', '#1A6B8A', '#B85C8E', '#6A7FDB'];

// DEMO coupons — sample data only (not real offers). AED / Dubai.
const FOOD: Demo[] = [
  { id: 101, cat: 'food', offerHe: '15% הנחה על כל התפריט', offerEn: '15% off the entire menu', pct: '15%', type: 'fixed', pctNum: 15, valid: '31/12/2026', color: '#E76F51' },
];
const STAY: Demo[] = [
  { id: 1, cat: 'stay', offerHe: '12% הנחה על סוויטות', offerEn: '12% off suites', pct: '12%', type: 'fixed', pctNum: 12, valid: '31/12/2026', color: '#B85C8E' },
];

// Added-UI strings (tabs / buy button / dashboard link). he+en real; ru/hi/ar fall back to en.
const CT: Record<string, { food: string; stay: string; buy: string; dash: string }> = {
  he: { food: '🍽️ מסעדות', stay: '🏨 מלונות', buy: '🎟️ רכישת קופונים · לבעלי עסקים', dash: '📊 קופונים שמומשו · סטטיסטיקה' },
  en: { food: '🍽️ Restaurants', stay: '🏨 Hotels', buy: '🎟️ Buy coupons · for business owners', dash: '📊 Redeemed coupons · statistics' },
  ru: { food: '🍽️ Рестораны', stay: '🏨 Отели', buy: '🎟️ Купить купоны · для бизнеса', dash: '📊 Использованные купоны · статистика' },
  hi: { food: '🍽️ रेस्तराँ', stay: '🏨 होटल', buy: '🎟️ कूपन खरीदें · व्यापार मालिकों के लिए', dash: '📊 भुनाए गए कूपन · आँकड़े' },
  ar: { food: '🍽️ مطاعم', stay: '🏨 فنادق', buy: '🎟️ شراء كوبونات · لأصحاب الأعمال', dash: '📊 الكوبونات المستخدمة · إحصائيات' },
};

function photoUrl(map: any, id: number) {
  const name = map?.[String(id)]?.photos?.[0]?.name;
  return name ? `https://places.googleapis.com/v1/${name}/media?key=${PLACES_KEY}&maxWidthPx=600` : FALLBACK_IMG;
}

export default function CouponsScreen() {
  const { t, lang, isRTL } = useI18n();
  const [cat, setCat] = useState<Cat>('food');
  const [paid, setPaid] = useState<Demo[]>([]); // coupons bought by business owners (server, paid only)
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const ct = CT[lang] || CT.en;

  // Only coupons the server confirms as paid are returned here.
  useEffect(() => {
    let alive = true;
    fetch(`${RE_API}/api/coupons`)
      .then(r => r.json())
      .then(j => {
        if (!alive || !j || !j.success || !Array.isArray(j.data)) return;
        const o = OFFER[lang] || OFFER.en;
        setPaid(j.data.map((c: any, i: number) => {
          const text = c.type === 'fixed' && c.pct ? o.off(c.pct) : o.gift;
          const to = c.to ? new Date(c.to) : null;
          return {
            id: c.bizId ?? -(i + 1), cat: (c.bizCat === 'hotels' ? 'stay' : 'food') as Cat,
            offerHe: text, offerEn: text,
            pct: c.type === 'fixed' && c.pct ? `${c.pct}%` : '🎁',
            type: c.type, pctNum: c.type === 'fixed' ? c.pct : null,
            valid: to ? `${String(to.getDate()).padStart(2, '0')}/${String(to.getMonth() + 1).padStart(2, '0')}/${to.getFullYear()}` : '',
            color: REAL_COLORS[i % REAL_COLORS.length],
            real: true, bizName: c.bizName, image: c.image || '',
          };
        }));
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [lang]);

  const restaurants: any[] = (CATALOG as any).restaurants || [];
  const hotels: any[] = (CATALOG as any).hotels || [];
  const nameOf = (c: Demo) => {
    const arr = c.cat === 'food' ? restaurants : hotels;
    const r = arr.find(x => x.id === c.id);
    if (!r) return c.bizName || '';
    return lang === 'he' ? (r.nameHe || r.name) : (r.nameEn || r.name);
  };
  const imgOf = (c: Demo) =>
    c.real && c.image ? c.image : photoUrl(c.cat === 'food' ? RESTAURANT_PHOTOS : HOTEL_PHOTOS, c.id);
  const toggle = (id: number) => setRevealed(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const list = [...paid.filter(c => c.cat === cat), ...(cat === 'food' ? FOOD : STAY)];

  const openCoupon = (c: Demo) => {
    const name = nameOf(c);
    const offer = lang === 'he' ? c.offerHe : c.offerEn;
    router.push(
      `/coupon?cat=${c.cat}&biz=${encodeURIComponent(name)}&pct=${encodeURIComponent(c.pct)}` +
      `&type=${c.type}&pctNum=${c.pctNum ?? ''}&offer=${encodeURIComponent(offer)}` +
      `&valid=${encodeURIComponent(c.valid)}&img=${encodeURIComponent(imgOf(c))}` +
      `&bizId=${c.id}&bizCat=${c.cat === 'food' ? 'restaurants' : 'hotels'}` as any
    );
  };

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: NAVY }}>
        <View style={[s.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))} style={s.back}>
            <Text style={s.backTxt}>{isRTL ? '›' : '‹'}</Text>
          </TouchableOpacity>
          <Text style={[s.hTitle, { flex: 1, textAlign: isRTL ? 'right' : 'left' }]}>{t('coupons.title')}</Text>
        </View>
      </SafeAreaView>

      <View style={[s.tabs, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity style={[s.tab, cat === 'food' && s.tabActive]} onPress={() => setCat('food')}>
          <Text style={[s.tabTxt, cat === 'food' && s.tabTxtActive]}>{ct.food}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, cat === 'stay' && s.tabActive]} onPress={() => setCat('stay')}>
          <Text style={[s.tabTxt, cat === 'stay' && s.tabTxtActive]}>{ct.stay}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
        <Text style={[s.note, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>⚠️ {t('coupons.demoNote')}</Text>

        {list.map(c => {
          const open = revealed.has(c.id);
          const code = `${nameOf(c).slice(0, 6).toUpperCase().replace(/\s/g, '')}-${c.pctNum ?? 'GIFT'}`;
          return (
            <TouchableOpacity key={c.cat + c.id} activeOpacity={0.85} style={s.card} onPress={() => openCoupon(c)}>
              <View>
                <Image source={{ uri: imgOf(c) }} style={s.cardImg} resizeMode="cover" />
                <View style={[s.offBadge, isRTL ? { right: 12 } : { left: 12 }]}><Text style={s.offTxt}>{c.pct}</Text></View>
                {!c.real && <View style={[s.demoTag, isRTL ? { left: 12 } : { right: 12 }]}><Text style={s.demoTagTxt}>{t('coupon.demo')}</Text></View>}
              </View>

              <View style={s.cardBody}>
                <Text style={[s.cardName, { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]} numberOfLines={1}>{nameOf(c)}</Text>
                <Text style={[s.offer, { textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' }]} numberOfLines={2}>
                  {lang === 'he' ? c.offerHe : c.offerEn}
                </Text>
                <Text style={[s.valid, { textAlign: isRTL ? 'right' : 'left' }]}>{t('coupon.valid')}: {c.valid}</Text>

                {open ? (
                  <View style={[s.codeBox, { borderColor: c.color }]}>
                    <Text style={[s.code, { color: c.color }]}>{code}</Text>
                    <Text style={s.showNote}>{t('coupon.show')}</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={[s.revealBtn, { backgroundColor: c.color }]} onPress={() => toggle(c.id)}>
                    <Text style={s.revealTxt}>🎟️ {t('coupon.reveal')}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          );
        })}

        <TouchableOpacity style={s.buyBtn} activeOpacity={0.85} onPress={() => router.push('/agent-coupon' as any)}>
          <Text style={s.buyBtnTxt}>{ct.buy}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.dashLink} activeOpacity={0.7} onPress={() => router.push('/coupon-dashboard' as any)}>
          <Text style={[s.dashLinkTxt, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>{ct.dash}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F1EA' },
  header: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, gap: 8 },
  back: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.16)', alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: '#fff', fontSize: 24, fontWeight: '300', marginTop: -2 },
  hTitle: { color: '#fff', fontSize: 24, fontWeight: '500' },
  tabs: { gap: 10, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 2 },
  tab: { flex: 1, paddingVertical: 12, borderRadius: 6, backgroundColor: '#fff', alignItems: 'center', borderWidth: 1, borderColor: '#e7e0d4' },
  tabActive: { backgroundColor: NAVY, borderColor: NAVY },
  tabTxt: { fontSize: 15, fontWeight: '600', color: NAVY },
  tabTxtActive: { color: '#fff' },
  note: { color: '#a9a291', fontSize: 12, fontWeight: '500', textAlign: 'center', marginBottom: 14, marginTop: 6 },
  card: { backgroundColor: '#fff', borderRadius: 6, marginBottom: 14, overflow: 'hidden', elevation: 3, shadowColor: '#1a2b35', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
  cardImg: { width: '100%', height: 160 },
  offBadge: { position: 'absolute', top: 12, backgroundColor: GOLD, borderRadius: 6, minWidth: 54, height: 54, paddingHorizontal: 6, alignItems: 'center', justifyContent: 'center' },
  offTxt: { color: NAVY, fontSize: 17, fontWeight: '800' },
  demoTag: { position: 'absolute', bottom: 12, backgroundColor: 'rgba(0,0,0,0.55)', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 3 },
  demoTagTxt: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  cardBody: { padding: 14 },
  cardName: { fontSize: 21, fontWeight: '500', color: NAVY, marginBottom: 4 },
  offer: { fontSize: 14, fontWeight: '500', color: '#6b7178', marginBottom: 8 },
  valid: { color: '#94a0ab', fontSize: 12, fontWeight: '500', marginBottom: 12 },
  revealBtn: { paddingVertical: 13, borderRadius: 6, alignItems: 'center' },
  revealTxt: { color: '#fff', fontSize: 15, fontWeight: '700' },
  codeBox: { borderWidth: 1.5, borderStyle: 'dashed', borderRadius: 6, paddingVertical: 14, alignItems: 'center', gap: 4 },
  code: { fontSize: 24, fontWeight: '800', letterSpacing: 2 },
  showNote: { color: '#94a0ab', fontSize: 12, fontWeight: '500' },
  buyBtn: { marginTop: 8, alignSelf: 'center', backgroundColor: GOLD, borderRadius: 6, paddingVertical: 14, paddingHorizontal: 26, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  buyBtnTxt: { color: NAVY, fontWeight: '700', fontSize: 15 },
  dashLink: { marginTop: 14, alignItems: 'center', paddingVertical: 10 },
  dashLinkTxt: { fontSize: 13, fontWeight: '600', color: NAVY },
});
