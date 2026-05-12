import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView, Modal, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '../../constants/colors';

const TOPICS = [
  { id: 'general',    label: 'שאלה כללית',           prefix: 'שלום, ' },
  { id: 'expert',     label: 'המלצה על מומחה',       prefix: 'שלום, אני רוצה להמליץ על בעל מקצוע בדובאי. שם: ' },
  { id: 'business',   label: 'שיתוף פעולה עסקי',     prefix: 'שלום, אני רוצה להציע שיתוף פעולה: ' },
  { id: 'feedback',   label: 'משוב או הצעה',         prefix: 'שלום, יש לי משוב/הצעה: ' },
  { id: 'bug',        label: 'דיווח על תקלה',         prefix: 'שלום, יש לי דיווח על תקלה באפליקציה: ' },
];

export default function ContactScreen() {
  const { topic } = useLocalSearchParams<{ topic?: string }>();
  const [active, setActive] = useState(topic || 'general');
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<{ name: string; size?: number } | null>(null);
  const current = TOPICS.find(t => t.id === active) || TOPICS[0];
  const showDiploma = active === 'expert';

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
      if (res.canceled) return;
      const a = res.assets?.[0];
      if (a) setFile({ name: a.name, size: a.size });
    } catch (e) {
      Alert.alert('שגיאה', 'לא הצלחנו לפתוח את בחירת הקובץ');
    }
  };

  const buildText = () => {
    let txt = current.prefix + (message || '');
    if (phone) txt += `\n\nטלפון לחזרה: ${phone}`;
    if (file) txt += `\n\nמצורף קובץ: ${file.name}${file.size ? ` (${Math.round(file.size / 1024)}KB)` : ''}\n(יש לצרף ידנית להודעה)`;
    return txt;
  };

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.PRIMARY }} />
      <View style={s.header}>
        <Text style={s.title}>צור קשר</Text>
        <Text style={s.sub}>כל שאלה, הצעה או חוויה</Text>
      </View>

      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        <Text style={s.sectionLabel}>נושא הפנייה</Text>
        <TouchableOpacity style={s.dropdown} onPress={() => setOpen(true)}>
          <Text style={s.dropdownArrow}>▾</Text>
          <Text style={s.dropdownTxt}>{current.label}</Text>
        </TouchableOpacity>

        <Text style={s.sectionLabel}>טלפון</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="לדוגמה: 050-1234567"
          placeholderTextColor="#AAB7BD"
          keyboardType="phone-pad"
          style={s.input}
        />

        <Text style={s.sectionLabel}>הודעה (אופציונלי)</Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="כתוב כאן את ההודעה שלך…"
          placeholderTextColor="#AAB7BD"
          multiline
          numberOfLines={4}
          style={[s.input, { height: 100, textAlignVertical: 'top' }]}
        />

        {showDiploma ? (
          <>
            <Text style={s.sectionLabel}>תעודת הסמכה / דיפלומה (PDF או תמונה)</Text>
            <TouchableOpacity style={s.uploadBtn} onPress={pickFile}>
              <Text style={s.uploadTxt}>📎 {file ? 'החלף קובץ' : 'העלה קובץ מהנייד'}</Text>
            </TouchableOpacity>
            {file ? (
              <View style={s.fileChip}>
                <TouchableOpacity onPress={() => setFile(null)}><Text style={s.fileRemove}>✕</Text></TouchableOpacity>
                <Text style={s.fileTxt} numberOfLines={1}>📄 {file.name}</Text>
              </View>
            ) : null}
          </>
        ) : null}

        <TouchableOpacity style={[s.btn, { backgroundColor: '#25D366' }]} onPress={() => Linking.openURL(`https://wa.me/972502844867?text=${encodeURIComponent(buildText())}`)}>
          <Text style={s.btnTxt}>💬 שלח ב-WhatsApp</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btn, { backgroundColor: Colors.PRIMARY }]} onPress={() => Linking.openURL(`mailto:info@wellcomedubai.com?subject=${encodeURIComponent('WellCome Dubai — ' + current.label)}&body=${encodeURIComponent(buildText())}`)}>
          <Text style={s.btnTxt}>✉️ שלח באימייל</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btn, { backgroundColor: Colors.WARM }]} onPress={() => Linking.openURL('https://wellcomedubai.com')}>
          <Text style={s.btnTxt}>🌐 לאתר</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={s.modalBackdrop}>
          <Pressable onPress={() => setOpen(false)} style={StyleSheet.absoluteFill} />
          <View style={s.menu}>
            <Text style={s.menuTitle}>בחר נושא</Text>
            {TOPICS.map(t => (
              <TouchableOpacity key={t.id} onPress={() => { setActive(t.id); setOpen(false); }} style={[s.menuItem, active === t.id && s.menuItemActive]}>
                <Text style={[s.menuTxt, active === t.id && s.menuTxtActive]}>{t.label}</Text>
                {active === t.id && <Text style={s.menuCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: Colors.PRIMARY, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 18, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '900', color: '#fff', textAlign: 'center', marginTop: 8 },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 4 },
  body: { padding: 22, gap: 12 },
  sectionLabel: { color: Colors.MUTED, fontSize: 12, fontWeight: '700', marginTop: 6, marginBottom: 6, writingDirection: 'rtl', textAlign: 'right' },
  dropdown: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#D9C9A6', marginBottom: 4 },
  dropdownTxt: { flex: 1, color: '#2C5F6E', fontSize: 14, fontWeight: '700', writingDirection: 'rtl', textAlign: 'right' },
  dropdownArrow: { color: Colors.MUTED, fontSize: 16, fontWeight: '700' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#D9C9A6', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#2C5F6E', writingDirection: 'rtl', textAlign: 'right' },
  btn: { borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  btnTxt: { color: '#fff', fontWeight: '900', fontSize: 15 },
  uploadBtn: { backgroundColor: '#E8F2F7', borderWidth: 1, borderColor: '#B6D2DE', borderStyle: 'dashed', borderRadius: 10, paddingVertical: 12, alignItems: 'center', marginTop: 2 },
  uploadTxt: { color: Colors.PRIMARY, fontWeight: '800', fontSize: 13.5 },
  fileChip: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginTop: 8, padding: 10, backgroundColor: '#FAF6EE', borderRadius: 8, borderWidth: 1, borderColor: '#E8DEC8' },
  fileTxt: { flex: 1, color: '#2C5F6E', fontSize: 12.5, fontWeight: '600', writingDirection: 'rtl', textAlign: 'right' },
  fileRemove: { color: '#E76F51', fontSize: 14, fontWeight: '800', paddingHorizontal: 6 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 22 },
  menu: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  menuTitle: { color: '#fff', backgroundColor: Colors.PRIMARY, fontSize: 14, fontWeight: '800', padding: 14, textAlign: 'center' },
  menuItem: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0E6D2' },
  menuItemActive: { backgroundColor: '#E8F2F7' },
  menuTxt: { flex: 1, color: '#2C5F6E', fontSize: 14, fontWeight: '700', writingDirection: 'rtl', textAlign: 'right' },
  menuTxtActive: { color: Colors.PRIMARY, fontWeight: '900' },
  menuCheck: { color: Colors.PRIMARY, fontSize: 16, fontWeight: '900' },
});
