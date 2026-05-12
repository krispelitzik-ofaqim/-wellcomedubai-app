import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';

const ITEMS = [
  { key: 'about',    title: 'אודותינו',         color: '#2A9D8F', icon: 'i' },
  { key: 'terms',    title: 'תקנון השימוש',     color: '#E76F51', icon: '§' },
  { key: 'privacy',  title: 'מדיניות פרטיות',    color: '#5B9DC7', icon: '🛡' },
  { key: 'contact',  title: 'צור קשר',           color: '#B8923A', icon: '✉' },
];

export default function InfoScreen() {
  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#000' }} />
      <View style={s.header}>
        <View style={{ width: 32 }} />
        <Text style={s.title}>מידע</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/' as any)} style={s.closeBtn}>
          <Text style={s.closeBtnTxt}>✕</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 80, gap: 10 }}>
        {ITEMS.map(it => (
          <TouchableOpacity key={it.key} onPress={() => router.push(`/info/${it.key}` as any)} style={[s.row, { borderRightColor: it.color }]}>
            <View style={[s.icon, { backgroundColor: it.color }]}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{it.icon}</Text>
            </View>
            <Text style={s.rowTitle}>{it.title}</Text>
            <Text style={[s.chev, { color: it.color }]}>‹</Text>
          </TouchableOpacity>
        ))}
        <Text style={s.footer}>© 2026 WellCome Dubai · גרסה 1.0</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  brandBar: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', alignItems: 'center' },
  brandTxt: { fontSize: 22, fontWeight: '900', letterSpacing: -0.3 },
  header: { paddingHorizontal: 14, paddingVertical: 12, backgroundColor: Colors.PRIMARY, flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#fff', fontSize: 17, fontWeight: '900', writingDirection: 'rtl', textAlign: 'center', flex: 1 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E76F51', alignItems: 'center', justifyContent: 'center' },
  closeBtnTxt: { color: '#fff', fontSize: 18, fontWeight: '900', lineHeight: 20 },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#E5E7EB', borderRightWidth: 5 },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { flex: 1, color: Colors.TEXT, fontWeight: '700', fontSize: 15, writingDirection: 'rtl', textAlign: 'right' },
  chev: { fontSize: 22, fontWeight: '300' },
  footer: { textAlign: 'center', color: Colors.MUTED, fontSize: 11, marginTop: 20 },
});
