import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { useI18n } from '../../constants/i18n';

const ITEMS = [
  { key: 'about',    title: 'אודותינו',         color: '#2A9D8F', icon: 'i' },
  { key: 'terms',    title: 'תקנון השימוש',     color: '#E76F51', icon: '§' },
  { key: 'privacy',  title: 'מדיניות פרטיות',    color: '#5B9DC7', icon: '🛡' },
  { key: 'contact',  title: 'צור קשר',           color: '#B8923A', icon: '✉' },
];

export default function InfoScreen() {
  const { t, lang, isRTL } = useI18n();
  const s = makeStyles(isRTL);
  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#000' }} />
      <View style={s.header}>
        <View style={{ width: 32 }} />
        <Text style={s.title}>{t('info.title')}</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/' as any)} style={s.closeBtn}>
          <Text style={s.closeBtnTxt}>✕</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
        {ITEMS.map(it => (
          <TouchableOpacity key={it.key} onPress={() => router.push(`/info/${it.key}` as any)} style={[s.row, { borderRightColor: it.color }]}>
            <View style={[s.icon, { backgroundColor: it.color }]}>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>{it.icon}</Text>
            </View>
            <Text style={[s.rowTitle, { writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}>{t('info.' + it.key)}</Text>
            <Text style={[s.chev, { color: it.color }]}>‹</Text>
          </TouchableOpacity>
        ))}
        <Text style={s.footer}>© 2026 WellCome Dubai · {t('info.version')} 1.0</Text>
      </ScrollView>
    </View>
  );
}

const makeStyles = (isRTL: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  brandBar: { paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', alignItems: 'center' },
  brandTxt: { fontSize: 22, fontWeight: '900', letterSpacing: -0.3 },
  header: { paddingHorizontal: 16, paddingVertical: 14, backgroundColor: Colors.PRIMARY, flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { color: '#fff', fontSize: 24, fontWeight: '400', letterSpacing: 0.3, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: 'center', flex: 1 },
  closeBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E76F51', alignItems: 'center', justifyContent: 'center' },
  closeBtnTxt: { color: '#fff', fontSize: 18, fontWeight: '600', lineHeight: 20 },
  row: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff', borderRadius: 0, paddingHorizontal: 16, paddingVertical: 16, borderRightWidth: 4, borderBottomWidth: 1, borderBottomColor: '#EAE0CE' },
  icon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { flex: 1, color: Colors.TEXT, fontWeight: '500', fontSize: 19, letterSpacing: 0.2, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  chev: { fontSize: 22, fontWeight: '300' },
  footer: { textAlign: 'center', color: Colors.MUTED, fontSize: 12, marginTop: 24 },
});
