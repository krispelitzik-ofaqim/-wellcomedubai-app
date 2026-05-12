import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';

const CRITERIA_SECTIONS = [
  {
    title: 'סוכן נדל"ן', color: '#1A6B8A',
    items: [
      'ניסיון מוכח בנדל"ן בדובאי — מעל שנתיים',
      'רישיון RERA תקף (Real Estate Regulatory Agency)',
      'הצגת חוזה מכר/השכרה שביצע',
    ],
  },
  {
    title: 'רואה חשבון', color: '#2A9D8F',
    items: [
      'תעודת דיפלומה ורישיון רו"ח תקף (UAE)',
      'חברות בלשכת רו"ח / ICAEW / ACCA או שווה ערך',
      'ניסיון מוכח עם חברות / יחידים זרים',
    ],
  },
  {
    title: 'עורך דין', color: '#B85C8E',
    items: [
      'תעודת דיפלומה במשפטים ורישיון לשכת עורכי דין',
      'הסמכה לפעול באמירויות (Bar Admission)',
      'הצגת תיק/עסקה שטיפל',
    ],
  },
  {
    title: 'משותף לכולם', color: '#1A4A5E',
    items: [
      'דובר עברית או רקע בעבודה עם ישראלים',
      'ערוץ תקשורת מוסדר (אתר/לינקדאין/וואטסאפ)',
      'שיחת אימות אישית',
      '2 ממליצים לפחות',
      'הצגת תעודת זהות וקבלות מסים',
    ],
  },
];

const EXPERTS = [
  { id:'b1', type:'broker', name:'גלית שמש', company:'Allsopp & Allsopp', langs:['עברית','אנגלית','ערבית'], phone:'+971-50-100-2233', whatsapp:'971501002233', specialty:'Marina, JBR, JLT', email:'galit@allsopp.ae', years:'8 שנים', image:'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&q=80' },
  { id:'b2', type:'broker', name:'אבי כהן', company:'Better Homes', langs:['עברית','אנגלית'], phone:'+971-55-222-3344', whatsapp:'971552223344', specialty:'Downtown, Business Bay', email:'avi@betterhomes.ae', years:'6 שנים', image:'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80' },
  { id:'b3', type:'broker', name:'מיכאל רובין', company:'Engel & Völkers', langs:['עברית','אנגלית','רוסית'], phone:'+971-52-333-4455', whatsapp:'971523334455', specialty:'Palm, Emirates Hills, יוקרה', email:'michael@ev-dubai.ae', years:'12 שנים', image:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
  { id:'b4', type:'broker', name:'שרה לוי', company:'Driven Properties', langs:['עברית','אנגלית'], phone:'+971-58-444-5566', whatsapp:'971584445566', specialty:'JVC, Damac Hills', email:'sarah@drivenproperties.ae', years:'5 שנים', image:'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80' },
  { id:'a1', type:'accountant', name:'דניאל אברהם', company:'PwC Middle East', langs:['עברית','אנגלית'], phone:'+971-50-555-6677', whatsapp:'971505556677', specialty:'מס חברות, רוא"ח לישראלים', email:'daniel@pwc.ae', years:'10 שנים', image:'https://images.unsplash.com/photo-1556157382-97eda2f9e2bf?w=200&q=80' },
  { id:'a2', type:'accountant', name:'רון מזרחי', company:'KPMG Lower Gulf', langs:['עברית','אנגלית','ערבית'], phone:'+971-55-666-7788', whatsapp:'971556667788', specialty:'תכנון מס בינלאומי, Free Zone', email:'ron@kpmg.ae', years:'7 שנים', image:'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&q=80' },
  { id:'l1', type:'lawyer', name:'תמר ניסים', company:'Al Tamimi & Co.', langs:['עברית','אנגלית','ערבית'], phone:'+971-50-888-9900', whatsapp:'971508889900', specialty:'נדל"ן, חברות, חוזים', email:'tamar@tamimi.ae', years:'9 שנים', image:'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&q=80' },
  { id:'l2', type:'lawyer', name:'יוסי בן-דוד', company:'BSA Ahmad Bin Hezeem', langs:['עברית','אנגלית'], phone:'+971-52-777-8899', whatsapp:'971527778899', specialty:'הסכמי השקעה, ויזות, ירושה', email:'yossi@bsabh.ae', years:'14 שנים', image:'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80' },
];

const GROUPS = [
  { type: 'broker', label: 'סוכני נדל"ן', color: Colors.PRIMARY },
  { type: 'accountant', label: 'רואי חשבון', color: Colors.SECONDARY },
  { type: 'lawyer', label: 'עורכי דין', color: Colors.PINK },
];

export default function BrokersScreen() {
  const [criteriaOpen, setCriteriaOpen] = useState(false);

  const recommend = () => {
    router.push('/info/contact?topic=expert' as any);
  };

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.PRIMARY }} />
      <View style={s.header}>
        <Text style={[s.title, { flex: 1 }]}>מתווכים / רוא"ח / עורכי דין</Text>
        <TouchableOpacity onPress={() => router.back()} style={s.headerClose}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={s.actionRow}>
        <TouchableOpacity onPress={() => setCriteriaOpen(true)} style={[s.actionBtn, s.actionBtnSecondary]}>
          <Text style={s.actionTxtSec}>✓ נדרש לאימות</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={recommend} style={[s.actionBtn, s.actionBtnPrimary]}>
          <Text style={s.actionTxtPri}>+ המלץ על איש מומחה</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={criteriaOpen} transparent animationType="fade" onRequestClose={() => setCriteriaOpen(false)}>
        <View style={s.criteriaBackdrop}>
          <Pressable onPress={() => setCriteriaOpen(false)} style={StyleSheet.absoluteFill} />
          <View style={s.criteriaCard}>
            <LinearGradient colors={['#1A6B8A', '#2A9D8F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.criteriaHead}>
              <Text style={s.criteriaHeadTxt}>✓ נדרש לאימות</Text>
              <TouchableOpacity onPress={() => setCriteriaOpen(false)} style={s.criteriaClose}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>✕</Text>
              </TouchableOpacity>
            </LinearGradient>
            <ScrollView contentContainerStyle={{ padding: 22 }}>
              {CRITERIA_SECTIONS.map((sec, si) => (
                <View key={si} style={{ marginBottom: 14 }}>
                  <View style={[s.criteriaSecHead, { borderBottomColor: '#F0E6D2' }]}>
                    <Text style={[s.criteriaSecTitle, { color: sec.color }]}>{sec.title}</Text>
                  </View>
                  {sec.items.map((it, i) => (
                    <Text key={i} style={s.criteriaItem}>• {it}</Text>
                  ))}
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setCriteriaOpen(false)} style={s.criteriaCta}>
              <Text style={s.criteriaCtaTxt}>הבנתי</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 60 }}>
        {GROUPS.map(g => {
          const items = EXPERTS.filter(e => e.type === g.type);
          if (!items.length) return null;
          return (
            <View key={g.type}>
              <Text style={[s.groupTitle, { color: g.color }]}>{g.label}</Text>
              <View>
                {items.map((b, i) => (
                  <View key={b.id} style={[s.row, i === items.length - 1 && { borderBottomWidth: 0 }]}>
                    <Image source={{ uri: b.image }} style={s.avatar} />
                    <View style={{ flex: 1, minWidth: 0 }}>
                      <View style={{ flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6, alignItems: 'baseline' }}>
                        <Text style={s.name}>{b.name}</Text>
                        <Text style={s.company}>{b.company} · {b.years}</Text>
                      </View>
                      <Text style={s.subtitle} numberOfLines={1}>{b.specialty} · {b.langs.slice(0,2).join('/')}</Text>
                    </View>
                    <View style={s.actions}>
                      <TouchableOpacity style={[s.iconBtn, { backgroundColor: '#25D366' }]} onPress={() => Linking.openURL(`https://wa.me/${b.whatsapp}`)}>
                        <Text style={s.iconBtnTxt}>💬</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={[s.iconBtn, { backgroundColor: g.color + '22', borderWidth: 1, borderColor: g.color + '55' }]} onPress={() => Linking.openURL(`tel:${b.phone}`)}>
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

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: Colors.PRIMARY, gap: 10 },
  headerClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 16, fontWeight: '900', writingDirection: 'rtl', textAlign: 'right' },
  actionRow: { flexDirection: 'row-reverse', gap: 8, padding: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0E6D2' },
  actionBtn: { flex: 1, paddingVertical: 11, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  actionBtnSecondary: { backgroundColor: '#E8F2F7', borderWidth: 1, borderColor: '#B6D2DE' },
  actionBtnPrimary: { backgroundColor: Colors.PINK },
  actionTxtSec: { color: Colors.PRIMARY, fontWeight: '800', fontSize: 13, textAlign: 'center' },
  actionTxtPri: { color: '#fff', fontWeight: '800', fontSize: 13, textAlign: 'center' },

  groupTitle: { fontSize: 15, fontWeight: '900', marginTop: 18, marginBottom: 6, writingDirection: 'rtl' },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, paddingVertical: 12, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#D9C9A6', borderStyle: 'dashed' },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  name: { fontWeight: '800', color: '#1A4A5E', fontSize: 14 },
  company: { color: Colors.MUTED, fontSize: 11 },
  subtitle: { color: Colors.MUTED, fontSize: 11, marginTop: 2, lineHeight: 14, writingDirection: 'rtl', textAlign: 'right' },
  actions: { flexDirection: 'row-reverse', gap: 6 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  iconBtnTxt: { fontSize: 16 },

  criteriaBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  criteriaCard: { width: '100%', maxWidth: 480, maxHeight: '88%', backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', flexDirection: 'column', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 16, shadowOffset: { width: 0, height: 8 } },
  criteriaHead: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 18 },
  criteriaHeadTxt: { color: '#fff', fontWeight: '800', fontSize: 16, writingDirection: 'rtl' },
  criteriaClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  criteriaSecHead: { borderBottomWidth: 1, paddingBottom: 5, marginBottom: 8 },
  criteriaSecTitle: { fontWeight: '800', fontSize: 13.5, writingDirection: 'rtl', textAlign: 'right' },
  criteriaItem: { color: '#2C5F6E', fontSize: 13, lineHeight: 22, writingDirection: 'rtl', textAlign: 'right' },
  criteriaCta: { backgroundColor: '#1A6B8A', marginHorizontal: 22, marginBottom: 22, marginTop: 4, padding: 12, borderRadius: 8, alignItems: 'center' },
  criteriaCtaTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
});
