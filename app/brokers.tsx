import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { useI18n } from '../constants/i18n';
import { tcRu } from '../constants/contentRu';
import { tcHi } from '../constants/contentHi';
import { tcAr } from '../constants/contentAr';

const CRITERIA_SECTIONS = [
  {
    title: 'סוכן נדל"ן', titleEn: 'Real Estate Agent', color: '#1A6B8A',
    items: [
      'ניסיון מוכח בנדל"ן בדובאי — מעל שנתיים',
      'רישיון RERA תקף (Real Estate Regulatory Agency)',
      'הצגת חוזה מכר/השכרה שביצע',
    ],
    itemsEn: [
      'Proven Dubai real estate experience — over two years',
      'Valid RERA license (Real Estate Regulatory Agency)',
      'Shows a sale/rental contract they closed',
    ],
  },
  {
    title: 'רואה חשבון', titleEn: 'Accountant', color: '#2A9D8F',
    items: [
      'תעודת דיפלומה ורישיון רו"ח תקף (UAE)',
      'חברות בלשכת רו"ח / ICAEW / ACCA או שווה ערך',
      'ניסיון מוכח עם חברות / יחידים זרים',
    ],
    itemsEn: [
      'Diploma and a valid accountant license (UAE)',
      'Membership in an accountants body / ICAEW / ACCA or equivalent',
      'Proven experience with foreign companies / individuals',
    ],
  },
  {
    title: 'עורך דין', titleEn: 'Lawyer', color: '#B85C8E',
    items: [
      'תעודת דיפלומה במשפטים ורישיון לשכת עורכי דין',
      'הסמכה לפעול באמירויות (Bar Admission)',
      'הצגת תיק/עסקה שטיפל',
    ],
    itemsEn: [
      'Law diploma and a bar association license',
      'Authorization to practice in the UAE (Bar Admission)',
      'Shows a case/deal they handled',
    ],
  },
  {
    title: 'משותף לכולם', titleEn: 'Common to all', color: '#1A4A5E',
    items: [
      'דובר עברית או רקע בעבודה עם ישראלים',
      'ערוץ תקשורת מוסדר (אתר/לינקדאין/וואטסאפ)',
      'שיחת אימות אישית',
      '2 ממליצים לפחות',
      'הצגת תעודת זהות וקבלות מסים',
    ],
    itemsEn: [
      'Hebrew speaker or a background working with Israelis',
      'An established communication channel (website/LinkedIn/WhatsApp)',
      'A personal verification call',
      'At least 2 references',
      'Shows ID and tax receipts',
    ],
  },
];

const EXPERTS = [
  { id:'b1', type:'broker', name:'גלית שמש', nameEn:'Galit Shemesh', company:'Allsopp & Allsopp', langs:['עברית','אנגלית','ערבית'], phone:'+971-50-100-2233', whatsapp:'971501002233', specialty:'Marina, JBR, JLT', specialtyEn:'Marina, JBR, JLT', email:'galit@allsopp.ae', years:'8 שנים', image:'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80' },
  { id:'b2', type:'broker', name:'אבי כהן', nameEn:'Avi Cohen', company:'Better Homes', langs:['עברית','אנגלית'], phone:'+971-55-222-3344', whatsapp:'971552223344', specialty:'Downtown, Business Bay', specialtyEn:'Downtown, Business Bay', email:'avi@betterhomes.ae', years:'6 שנים', image:'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80' },
  { id:'b3', type:'broker', name:'מיכאל רובין', nameEn:'Michael Rubin', company:'Engel & Völkers', langs:['עברית','אנגלית','רוסית'], phone:'+971-52-333-4455', whatsapp:'971523334455', specialty:'Palm, Emirates Hills, יוקרה', specialtyEn:'Palm, Emirates Hills, luxury', email:'michael@ev-dubai.ae', years:'12 שנים', image:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
  { id:'b4', type:'broker', name:'שרה לוי', nameEn:'Sarah Levy', company:'Driven Properties', langs:['עברית','אנגלית'], phone:'+971-58-444-5566', whatsapp:'971584445566', specialty:'JVC, Damac Hills', specialtyEn:'JVC, Damac Hills', email:'sarah@drivenproperties.ae', years:'5 שנים', image:'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80' },
  { id:'a1', type:'accountant', name:'דניאל אברהם', nameEn:'Daniel Avraham', company:'PwC Middle East', langs:['עברית','אנגלית'], phone:'+971-50-555-6677', whatsapp:'971505556677', specialty:'מס חברות, רוא"ח לישראלים', specialtyEn:'Corporate tax, accounting for Israelis', email:'daniel@pwc.ae', years:'10 שנים', image:'https://images.unsplash.com/photo-1556157382-97eda2f9e2bf?w=200&q=80' },
  { id:'a2', type:'accountant', name:'רון מזרחי', nameEn:'Ron Mizrahi', company:'KPMG Lower Gulf', langs:['עברית','אנגלית','ערבית'], phone:'+971-55-666-7788', whatsapp:'971556667788', specialty:'תכנון מס בינלאומי, Free Zone', specialtyEn:'International tax planning, Free Zone', email:'ron@kpmg.ae', years:'7 שנים', image:'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80' },
  { id:'l1', type:'lawyer', name:'תמר ניסים', nameEn:'Tamar Nissim', company:'Al Tamimi & Co.', langs:['עברית','אנגלית','ערבית'], phone:'+971-50-888-9900', whatsapp:'971508889900', specialty:'נדל"ן, חברות, חוזים', specialtyEn:'Real estate, companies, contracts', email:'tamar@tamimi.ae', years:'9 שנים', image:'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80' },
  { id:'l2', type:'lawyer', name:'יוסי בן-דוד', nameEn:'Yossi Ben-David', company:'BSA Ahmad Bin Hezeem', langs:['עברית','אנגלית'], phone:'+971-52-777-8899', whatsapp:'971527778899', specialty:'הסכמי השקעה, ויזות, ירושה', specialtyEn:'Investment agreements, visas, inheritance', email:'yossi@bsabh.ae', years:'14 שנים', image:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
];

const GROUPS = [
  { type: 'broker', label: 'סוכני נדל"ן', labelEn: 'Real Estate Agents', color: Colors.PRIMARY },
  { type: 'accountant', label: 'רואי חשבון', labelEn: 'Accountants', color: Colors.SECONDARY },
  { type: 'lawyer', label: 'עורכי דין', labelEn: 'Lawyers', color: Colors.PINK },
];

export default function BrokersScreen() {
  const { t, lang, isRTL } = useI18n();
  const s = makeStyles(isRTL);
  const trLangs = (arr: string[]) => arr.map(l => t('lang.' + l)).map(x => x.startsWith('lang.') ? x.slice(5) : x);
  const trYears = (y: string) => lang !== 'he' ? y.replace('שנים', t('brokers.years')) : y;
  const [criteriaOpen, setCriteriaOpen] = useState(false);

  const recommend = () => {
    router.push('/info/contact?topic=expert' as any);
  };

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.PRIMARY }} />
      <View style={s.header}>
        <Text style={[s.title, { flex: 1 }]}>{t('brokers.title')}</Text>
        <TouchableOpacity onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/'); }} style={s.headerClose}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={s.actionRow}>
        <TouchableOpacity onPress={() => setCriteriaOpen(true)} style={[s.actionBtn, s.actionBtnSecondary]}>
          <Text style={s.actionTxtSec}>{t('brokers.verify')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={recommend} style={[s.actionBtn, s.actionBtnPrimary]}>
          <Text style={s.actionTxtPri}>{t('brokers.recommend')}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={criteriaOpen} transparent animationType="fade" onRequestClose={() => setCriteriaOpen(false)}>
        <View style={s.criteriaBackdrop}>
          <Pressable onPress={() => setCriteriaOpen(false)} style={StyleSheet.absoluteFill} />
          <View style={s.criteriaCard}>
            <LinearGradient colors={['#1A6B8A', '#2A9D8F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.criteriaHead}>
              <Text style={s.criteriaHeadTxt}>{t('brokers.verify')}</Text>
              <TouchableOpacity onPress={() => setCriteriaOpen(false)} style={s.criteriaClose}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            </LinearGradient>
            <ScrollView contentContainerStyle={{ padding: 22 }}>
              {CRITERIA_SECTIONS.map((sec, si) => (
                <View key={si} style={{ marginBottom: 14 }}>
                  <View style={[s.criteriaSecHead, { borderBottomColor: '#F0E6D2' }]}>
                    <Text style={[s.criteriaSecTitle, { color: sec.color, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}>{lang === 'ar' ? tcAr(sec.title) : lang === 'hi' ? tcHi(sec.title) : lang === 'ru' ? tcRu(sec.title) : lang === 'en' ? sec.titleEn : sec.title}</Text>
                  </View>
                  {(lang === 'ar' ? (sec.items).map(tcAr) : lang === 'hi' ? (sec.items).map(tcHi) : lang === 'ru' ? (sec.items).map(tcRu) : lang === 'en' ? sec.itemsEn : sec.items).map((it, i) => (
                    <Text key={i} style={[s.criteriaItem, { writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}>• {it}</Text>
                  ))}
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setCriteriaOpen(false)} style={s.criteriaCta}>
              <Text style={s.criteriaCtaTxt}>{t('brokers.gotIt')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {GROUPS.map(g => {
          const items = EXPERTS.filter(e => e.type === g.type);
          if (!items.length) return null;
          return (
            <View key={g.type}>
              <Text style={[s.groupTitle, { color: g.color, writingDirection: isRTL ? 'rtl' : 'ltr' }]}>{lang === 'ar' ? tcAr(g.label) : lang === 'hi' ? tcHi(g.label) : lang === 'ru' ? tcRu(g.label) : lang === 'en' ? g.labelEn : g.label}</Text>
              <View>
                {items.map((b, i) => (
                  <View key={b.id} style={[s.row, i === items.length - 1 && { borderBottomWidth: 0 }]}>
                    <Image source={{ uri: b.image }} style={s.avatar} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', flexWrap: 'wrap', gap: 6, alignItems: 'baseline' }}>
                        <Text style={s.name}>{lang === 'he' ? b.name : (b.nameEn || b.name)}</Text>
                        <Text style={s.company}>{b.company} · {trYears(b.years)}</Text>
                      </View>
                      <Text style={s.subtitle} numberOfLines={1}>{(lang === 'ar' ? tcAr(b.specialty) : lang === 'hi' ? tcHi(b.specialty) : lang === 'ru' ? tcRu(b.specialty) : (lang === 'he' ? b.specialty : (b.specialtyEn || b.specialty)))} · {trLangs(b.langs).slice(0,2).join('/')}</Text>
                    </View>
                    <View style={s.actions}>
                      <TouchableOpacity style={[s.iconBtn, { backgroundColor: '#25D366' }]} onPress={() => Linking.openURL(`https://wa.me/${b.whatsapp}`)}>
                        <Text style={s.iconBtnTxt}>💬</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[s.iconBtn, { backgroundColor: g.color }]} onPress={() => Linking.openURL(`tel:${b.phone}`)}>
                        <Text style={s.iconBtnTxt}>📞</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const makeStyles = (isRTL: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: Colors.PRIMARY, gap: 10 },
  headerClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: '400', letterSpacing: 0.3, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  actionRow: { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8, padding: 14, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EAE0CE' },
  actionBtn: { flex: 1, paddingVertical: 13, borderRadius: 0, alignItems: 'center', justifyContent: 'center' },
  actionBtnSecondary: { backgroundColor: '#1FA88F' },
  actionBtnPrimary: { backgroundColor: Colors.PINK },
  actionTxtSec: { color: '#fff', fontWeight: '600', fontSize: 14, textAlign: 'center' },
  actionTxtPri: { color: '#fff', fontWeight: '600', fontSize: 14, textAlign: 'center' },

  groupTitle: { fontSize: 20, fontWeight: '600', letterSpacing: 0.2, marginTop: 20, marginBottom: 8, paddingHorizontal: 16, writingDirection: isRTL ? 'rtl' : 'ltr' },
  row: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#EAE0CE' },
  avatar: { width: 48, height: 48, borderRadius: 24 },
  name: { fontWeight: '500', color: '#1A4A5E', fontSize: 18, letterSpacing: 0.2 },
  company: { color: Colors.MUTED, fontSize: 13 },
  subtitle: { color: Colors.MUTED, fontSize: 13, marginTop: 3, lineHeight: 17, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  actions: { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 6 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  iconBtnTxt: { fontSize: 16 },

  criteriaBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  criteriaCard: { width: '100%', maxWidth: 480, maxHeight: '88%', backgroundColor: '#fff', borderRadius: 0, overflow: 'hidden', flexDirection: 'column', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  criteriaHead: { flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 18 },
  criteriaHeadTxt: { color: '#fff', fontWeight: '600', fontSize: 20, letterSpacing: 0.2, writingDirection: isRTL ? 'rtl' : 'ltr' },
  criteriaClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  criteriaSecHead: { borderBottomWidth: 1, paddingBottom: 6, marginBottom: 8 },
  criteriaSecTitle: { fontWeight: '600', fontSize: 16, letterSpacing: 0.2, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  criteriaItem: { color: '#2C5F6E', fontSize: 14, lineHeight: 23, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  criteriaCta: { backgroundColor: '#1A6B8A', marginHorizontal: 22, marginBottom: 22, marginTop: 4, padding: 14, borderRadius: 0, alignItems: 'center' },
  criteriaCtaTxt: { color: '#fff', fontWeight: '600', fontSize: 15 },
});
