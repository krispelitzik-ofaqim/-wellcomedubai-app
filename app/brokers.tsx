import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';

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
  const showCriteria = () => Alert.alert('✓ נדרש לאימות', [
    '— סוכן נדל"ן —',
    '• ניסיון מוכח 2+ שנים בנדל"ן בדובאי',
    '• רישיון RERA תקף',
    '• הצגת חוזה מכר/השכרה',
    '',
    '— רואה חשבון —',
    '• תעודת דיפלומה ורישיון רו"ח (UAE)',
    '• ICAEW / ACCA / חברות לשכת רו"ח',
    '• ניסיון עם חברות / יחידים זרים',
    '',
    '— עורך דין —',
    '• דיפלומה במשפטים + רישיון עורכי דין',
    '• הסמכה לפעול באמירויות (Bar)',
    '• הצגת תיק/עסקה שטיפל',
    '',
    '— משותף —',
    '• דובר עברית / ניסיון עם ישראלים',
    '• 2 ממליצים, שיחת אימות, ת.ז וקבלות מס',
  ].join('\n'));

  const recommend = () => {
    Linking.openURL('https://wa.me/972502844867?text=' + encodeURIComponent('שלום, אני רוצה להמליץ על איש מומחה בדובאי. שם:'));
  };

  return (
    <SafeAreaView edges={['top']} style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={{ fontSize: 22, color: '#fff' }}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>מתווכים / רוא"ח / עורכי דין</Text>
      </View>

      <View style={s.actionRow}>
        <TouchableOpacity onPress={showCriteria} style={[s.actionBtn, s.actionBtnSecondary]}>
          <Text style={s.actionTxtSec}>✓ נדרש לאימות</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={recommend} style={[s.actionBtn, s.actionBtnPrimary]}>
          <Text style={s.actionTxtPri}>+ המלץ על איש מומחה</Text>
        </TouchableOpacity>
      </View>

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
                    <Image source={{ uri: b.image }} style={[s.avatar, { borderRightColor: g.color, borderRightWidth: 2 }]} />
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
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: Colors.PRIMARY, gap: 10 },
  back: { padding: 4 },
  title: { color: '#fff', fontSize: 16, fontWeight: '900', writingDirection: 'rtl' },
  actionRow: { flexDirection: 'row-reverse', gap: 8, padding: 12, backgroundColor: Colors.BG, borderBottomWidth: 1, borderBottomColor: '#E8DEC8' },
  actionBtn: { flex: 1, paddingVertical: 11, borderRadius: 8, alignItems: 'center' },
  actionBtnSecondary: { backgroundColor: '#fff', borderWidth: 2, borderColor: Colors.PRIMARY },
  actionBtnPrimary: { backgroundColor: Colors.PINK },
  actionTxtSec: { color: Colors.PRIMARY, fontWeight: '700', fontSize: 13 },
  actionTxtPri: { color: '#fff', fontWeight: '700', fontSize: 13 },

  groupTitle: { fontSize: 15, fontWeight: '900', marginTop: 18, marginBottom: 6, writingDirection: 'rtl' },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, paddingVertical: 11, paddingHorizontal: 4, borderBottomWidth: 1, borderBottomColor: '#F0E6D2' },
  avatar: { width: 44, height: 44, borderRadius: 22 },
  name: { fontWeight: '800', color: '#1A4A5E', fontSize: 14 },
  company: { color: Colors.MUTED, fontSize: 11 },
  subtitle: { color: Colors.MUTED, fontSize: 11, marginTop: 2, lineHeight: 14, writingDirection: 'rtl', textAlign: 'right' },
  actions: { flexDirection: 'row-reverse', gap: 6 },
  iconBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  iconBtnTxt: { fontSize: 16 },
});
