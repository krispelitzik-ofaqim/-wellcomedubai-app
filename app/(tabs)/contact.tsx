import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, ScrollView, Modal, Pressable, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '../../constants/colors';
import { useI18n } from '../../constants/i18n';
import { tcRu } from '../../constants/contentRu';
import { tcHi } from '../../constants/contentHi';
import { tcAr } from '../../constants/contentAr';

const TOPICS = [
  { id: 'general',    key: 'ct.tGeneral',  label: 'שאלה כללית',           prefix: 'שלום, ',                                                  prefixEn: 'Hello, ' },
  { id: 'expert',     key: 'ct.tExpert',   label: 'המלצה על מומחה',       prefix: 'שלום, אני רוצה להמליץ על בעל מקצוע בדובאי. שם: ',          prefixEn: 'Hello, I would like to recommend a professional in Dubai. Name: ' },
  { id: 'business',   key: 'ct.tBusiness', label: 'שיתוף פעולה עסקי',     prefix: 'שלום, אני רוצה להציע שיתוף פעולה: ',                       prefixEn: 'Hello, I would like to propose a collaboration: ' },
  { id: 'feedback',   key: 'ct.tFeedback', label: 'משוב או הצעה',         prefix: 'שלום, יש לי משוב/הצעה: ',                                  prefixEn: 'Hello, I have feedback/a suggestion: ' },
  { id: 'bug',        key: 'ct.tBug',      label: 'דיווח על תקלה',         prefix: 'שלום, יש לי דיווח על תקלה באפליקציה: ',                    prefixEn: 'Hello, I have a bug report about the app: ' },
];

export default function ContactScreen() {
  const { t, lang, isRTL } = useI18n();
  const s = makeStyles(isRTL);
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
      Alert.alert(t('loc.errTitle'), t('contact.fileErr'));
    }
  };

  const buildText = () => {
    const en = lang === 'en';
    const ru = lang === 'ru';
    const hi = lang === 'hi';
    const ar = lang === 'ar';
    let txt = (ar ? tcAr(current.prefix) : hi ? tcHi(current.prefix) : ru ? tcRu(current.prefix) : en ? current.prefixEn : current.prefix) + (message || '');
    if (phone) txt += `\n\n${ar ? tcAr('טלפון לחזרה') : hi ? tcHi('טלפון לחזרה') : ru ? tcRu('טלפון לחזרה') : en ? 'Callback phone' : 'טלפון לחזרה'}: ${phone}`;
    if (file) txt += `\n\n${ar ? tcAr('מצורף קובץ') : hi ? tcHi('מצורף קובץ') : ru ? tcRu('מצורף קובץ') : en ? 'Attached file' : 'מצורף קובץ'}: ${file.name}${file.size ? ` (${Math.round(file.size / 1024)}KB)` : ''}\n(${ar ? tcAr('יש לצרף ידנית להודעה') : hi ? tcHi('יש לצרף ידנית להודעה') : ru ? tcRu('יש לצרף ידנית להודעה') : en ? 'please attach manually to the message' : 'יש לצרף ידנית להודעה'})`;
    return txt;
  };

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.PRIMARY }} />
      <View style={s.header}>
        <Text style={s.title}>{t('ct.title')}</Text>
        <Text style={s.sub}>{t('ct.sub')}</Text>
      </View>

      <ScrollView contentContainerStyle={s.body} keyboardShouldPersistTaps="handled">
        <Text style={[s.sectionLabel, { writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}>{t('ct.topicLabel')}</Text>
        <TouchableOpacity style={s.dropdown} onPress={() => setOpen(true)}>
          <Text style={s.dropdownArrow}>▾</Text>
          <Text style={s.dropdownTxt}>{t(current.key)}</Text>
        </TouchableOpacity>

        <Text style={[s.sectionLabel, { writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}>{t('ct.phone')}</Text>
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder={t('ct.phonePh')}
          placeholderTextColor="#AAB7BD"
          keyboardType="phone-pad"
          style={s.input}
        />

        <Text style={[s.sectionLabel, { writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}>{t('ct.msgLabel')}</Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder={t('ct.msgPh')}
          placeholderTextColor="#AAB7BD"
          multiline
          numberOfLines={4}
          style={[s.input, { height: 100, textAlignVertical: 'top' }]}
        />

        {showDiploma ? (
          <>
            <Text style={[s.sectionLabel, { writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}>{t('contact.diploma')}</Text>
            <TouchableOpacity style={s.uploadBtn} onPress={pickFile}>
              <Text style={s.uploadTxt}>📎 {file ? t('contact.replaceFile') : t('ct.uploadFile')}</Text>
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
          <Text style={s.btnTxt}>{t('ct.whatsapp')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btn, { backgroundColor: Colors.PRIMARY }]} onPress={() => Linking.openURL(`mailto:info@wellcomedubai.com?subject=${encodeURIComponent('WellCome Dubai — ' + t(current.key))}&body=${encodeURIComponent(buildText())}`)}>
          <Text style={s.btnTxt}>{t('ct.email')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.btn, { backgroundColor: Colors.WARM }]} onPress={() => Linking.openURL('https://wellcomedubai.com')}>
          <Text style={s.btnTxt}>{t('ct.website')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={s.modalBackdrop}>
          <Pressable onPress={() => setOpen(false)} style={StyleSheet.absoluteFill} />
          <View style={s.menu}>
            <Text style={s.menuTitle}>{t('contact.pickTopic')}</Text>
            {TOPICS.map(top => (
              <TouchableOpacity key={top.id} onPress={() => { setActive(top.id); setOpen(false); }} style={[s.menuItem, active === top.id && s.menuItemActive]}>
                <Text style={[s.menuTxt, active === top.id && s.menuTxtActive]}>{t(top.key)}</Text>
                {active === top.id && <Text style={s.menuCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}
const makeStyles = (isRTL: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { backgroundColor: Colors.PRIMARY, paddingHorizontal: 18, paddingTop: 8, paddingBottom: 18, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '400', letterSpacing: 0.3, color: '#fff', textAlign: 'center', marginTop: 8 },
  sub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 4 },
  body: { padding: 18, gap: 12 },
  sectionLabel: { color: Colors.MUTED, fontSize: 14, fontWeight: '600', letterSpacing: 0.2, marginTop: 8, marginBottom: 6, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  dropdown: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 0, backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAE0CE', marginBottom: 4 },
  dropdownTxt: { flex: 1, color: '#2C5F6E', fontSize: 18, fontWeight: '500', letterSpacing: 0.2, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  dropdownArrow: { color: Colors.MUTED, fontSize: 16, fontWeight: '500' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#EAE0CE', borderRadius: 0, paddingHorizontal: 16, paddingVertical: 14, fontSize: 16, color: '#2C5F6E', writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  btn: { borderRadius: 0, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  btnTxt: { color: '#fff', fontWeight: '600', fontSize: 16, letterSpacing: 0.2 },
  uploadBtn: { backgroundColor: '#E8F2F7', borderWidth: 1, borderColor: '#B6D2DE', borderStyle: 'dashed', borderRadius: 0, paddingVertical: 14, alignItems: 'center', marginTop: 2 },
  uploadTxt: { color: Colors.PRIMARY, fontWeight: '600', fontSize: 15 },
  fileChip: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 8, marginTop: 8, padding: 12, backgroundColor: '#FAF6EE', borderRadius: 0, borderBottomWidth: 1, borderBottomColor: '#EAE0CE' },
  fileTxt: { flex: 1, color: '#2C5F6E', fontSize: 14, fontWeight: '500', writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  fileRemove: { color: '#E24B32', fontSize: 15, fontWeight: '600', paddingHorizontal: 6 },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 22 },
  menu: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 0, overflow: 'hidden' },
  menuTitle: { color: '#fff', backgroundColor: Colors.PRIMARY, fontSize: 20, fontWeight: '600', letterSpacing: 0.2, padding: 16, textAlign: 'center' },
  menuItem: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#EAE0CE' },
  menuItemActive: { backgroundColor: '#E8F2F7' },
  menuTxt: { flex: 1, color: '#2C5F6E', fontSize: 18, fontWeight: '500', letterSpacing: 0.2, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  menuTxtActive: { color: Colors.PRIMARY, fontWeight: '600' },
  menuCheck: { color: Colors.PRIMARY, fontSize: 18, fontWeight: '600' },
});
