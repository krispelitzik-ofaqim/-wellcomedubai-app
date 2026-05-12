import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Linking, Alert, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { Colors } from '../../constants/colors';

const SECTIONS: Record<string, { title: string; color: string; body: string }> = {
  about: {
    title: 'אודותינו', color: '#2A9D8F',
    body: `WellCome Dubai — המדריך הישראלי המלא לדובאי.

החזון שלנו
להיות הכתובת העברית הראשונה של תייר ישראלי שמתכנן ביקור באמירויות. אנחנו מאמינים שטיול חכם מתחיל במידע אמין, נגיש ועדכני — בעברית, עם רגישות לקודים המקומיים.

מה תמצאו כאן
• מלונות — מדורגים לפי כוכבים ויוקרה
• מסעדות — דגש על מסעדות כשרות, ישראליות וים-תיכוניות
• אטרקציות — חובה לראות, פעילויות מים, פארקי שעשועים, ספארי מדבר
• תחבורה — מטרו, מוניות, השכרת רכב, אפליקציות הסעה
• בילוי, קניות, ילדים — והכל במפה אחת
• מסלולי יום מוכנים, מזג אוויר חי, המרת מטבעות, לוחות טיסות חיים

מקורות המידע
הנתונים נאספים ממקורות פתוחים (Google Maps, אתרי הספקים, Wikipedia), מתחזקים ע"י משתמשי האתר ומעודכנים באופן שוטף. אנחנו לא מקבלים תשלום מאף ספק — הדירוגים אובייקטיביים.

ישראלים בדובאי
מאז הסכמי אברהם (2020), דובאי הפכה ליעד פופולרי לישראלים. האפליקציה נבנתה תוך הבנה של הצרכים הייחודיים של המטייל הישראלי — כשרות, שפה, מנהגים מקומיים וביטחון.`,
  },
  terms: {
    title: 'תקנון השימוש', color: '#E76F51',
    body: `עודכן לאחרונה: מאי 2026

1. כללי
השימוש באפליקציית WellCome Dubai (להלן: "האפליקציה") כפוף לתנאי שימוש אלה. הורדת האפליקציה והשימוש בה מהווים הסכמה לכל הסעיפים שלהלן.

2. מהות השירות
האפליקציה מספקת מידע תיירותי על דובאי לקהל הישראלי. השירות ניתן ללא תשלום, ללא רישום, וללא איסוף נתונים אישיים.

3. אחריות והגבלות
• כל המידע מסופק "כפי שהוא" (AS-IS), ללא אחריות מפורשת או משתמעת.
• מחירים, שעות פתיחה, אזורי שירות ופרטי קשר עלולים להשתנות — חובה לוודא ישירות מול בית העסק לפני קבלת החלטות.
• WellCome Dubai אינו אחראי לטעויות, השמטות, או נזק כלשהו שנגרם משימוש במידע.

4. צד שלישי
קישורים, מפות, מידע על מלונות/מסעדות/חברות תחבורה הם לצורכי נוחות בלבד. WellCome Dubai אינו אחראי לעסקאות, חוויות או שירותים שמספק כל גורם חיצוני.

5. שימוש מותר
שימוש באפליקציה מותר למטרות פרטיות בלבד. אסור להעתיק, להפיץ, או לעשות שימוש מסחרי בתכנים ללא אישור בכתב.

6. קניין רוחני
כל הזכויות שמורות. תמונות הספקים שייכות לבעליהן ומופיעות לצורך זיהוי בלבד.

7. שינויים בתקנון
WellCome Dubai רשאי לעדכן תנאים אלו בכל עת. המשך שימוש לאחר עדכון מהווה הסכמה לשינויים.

8. סמכות שיפוט
על תנאי שימוש אלה יחול הדין הישראלי. סמכות שיפוט בלעדית לבתי המשפט בתל אביב.`,
  },
  privacy: {
    title: 'מדיניות פרטיות', color: '#5B9DC7',
    body: `עודכן לאחרונה: מאי 2026

איזה מידע אנחנו אוספים?
WellCome Dubai פועל ללא רישום משתמשים. לא נאספים שמות, אימיילים, מספרי טלפון או כל פרט מזהה.

נתוני מיקום (Geolocation)
כאשר תלחצו על "הראה לי מה קרוב אליי", המכשיר יבקש הרשאה לגישה למיקום. הנתון משמש אך ורק לחישוב מרחק לאטרקציות, ולא נשלח לשרת או נשמר בשום מקום.

אחסון מקומי
האפליקציה שומרת נתונים טכניים על המכשיר שלכם, ללא שליחה לשרת:
• שערי מטבע ומזג אוויר (זמני, להאצה)
• נתוני המאגר של ספקים (קטגוריות, מסלולים)
• דירוגים אישיים שהוספתם למסלולים

שירותי צד שלישי
• Google Maps — מציג מפות ונווטים. כפוף למדיניות הפרטיות של Google.
• Open-Meteo — שירות מזג אוויר חינמי, ללא איסוף נתונים.
• AeroDataBox / Booking — ספקי לוחות טיסות וזמינות מלונות.

זכויות המשתמש
• זכות עיון: כל הנתונים נשמרים מקומית במכשיר שלכם.
• זכות מחיקה: ניקוי נתוני האפליקציה ימחק הכל.
• זכות התנגדות: ניתן לסרב להרשאת מיקום ללא פגיעה ביכולת השימוש.`,
  },
};

const CONTACT_TOPICS = [
  { id: 'general',    label: 'כללי' },
  { id: 'error',      label: 'דיווח על שגיאה' },
  { id: 'suggestion', label: 'הצעה' },
  { id: 'business',   label: 'שיתוף פעולה' },
  { id: 'expert',     label: 'המלצה על מומחה' },
];

function ContactPage() {
  const { topic: topicParam } = useLocalSearchParams<{ topic?: string }>();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [topic, setTopic] = useState(topicParam || 'general');
  const [menuOpen, setMenuOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [file, setFile] = useState<{ name: string; size?: number } | null>(null);
  const current = CONTACT_TOPICS.find(t => t.id === topic) || CONTACT_TOPICS[0];
  const showDiploma = topic === 'expert';

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['image/*', 'application/pdf'], copyToCacheDirectory: true });
      if (res.canceled) return;
      const a = res.assets?.[0];
      if (a) setFile({ name: a.name, size: a.size });
    } catch {
      Alert.alert('שגיאה', 'לא הצלחנו לפתוח את בחירת הקובץ');
    }
  };

  const submit = () => {
    if (!name.trim() || !email.trim() || !msg.trim()) {
      Alert.alert('חסרים פרטים', 'יש למלא שם, אימייל והודעה');
      return;
    }
    let body = `שם: ${name}\nאימייל: ${email}`;
    if (phone) body += `\nטלפון: ${phone}`;
    body += `\nנושא: ${current.label}\n\n${msg}`;
    if (file) body += `\n\nמצורף קובץ: ${file.name}${file.size ? ` (${Math.round(file.size / 1024)}KB)` : ''}\n(יש לצרף ידנית להודעה)`;
    Linking.openURL(`mailto:contact@wellcomedubai.com?subject=${encodeURIComponent('פנייה מהאפליקציה — ' + current.label)}&body=${encodeURIComponent(body)}`);
  };

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#B8923A' }} />
      <View style={[s.header, { backgroundColor: '#B8923A' }]}>
        <Text style={[s.title, { flex: 1 }]}>צור קשר</Text>
        <TouchableOpacity onPress={() => router.back()} style={s.headerClose}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>✕</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 100, gap: 12 }} keyboardShouldPersistTaps="handled">
        <Text style={s.fieldLabel}>שם מלא *</Text>
        <TextInput style={s.input} value={name} onChangeText={setName} placeholder="ישראל ישראלי" placeholderTextColor="#AAB7BD" />

        <Text style={s.fieldLabel}>אימייל *</Text>
        <TextInput style={s.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="name@example.com" placeholderTextColor="#AAB7BD" />

        <Text style={s.fieldLabel}>טלפון</Text>
        <TextInput style={s.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="050-1234567" placeholderTextColor="#AAB7BD" />

        <Text style={s.fieldLabel}>נושא</Text>
        <TouchableOpacity style={s.dropdown} onPress={() => setMenuOpen(true)}>
          <Text style={s.dropdownTxt}>{current.label}</Text>
          <Text style={s.dropdownArrow}>▼</Text>
        </TouchableOpacity>

        <Text style={s.fieldLabel}>הודעה *</Text>
        <TextInput style={[s.input, { height: 140, textAlignVertical: 'top' }]} value={msg} onChangeText={setMsg} multiline placeholder="כתבו לנו..." placeholderTextColor="#AAB7BD" />

        {showDiploma ? (
          <>
            <Text style={s.fieldLabel}>תעודת הסמכה / דיפלומה (PDF או תמונה)</Text>
            <TouchableOpacity style={s.uploadBtn} onPress={pickFile}>
              <Text style={s.uploadTxt}>📎 {file ? 'החלף קובץ' : 'הוסף קובץ / דיפלומה'}</Text>
            </TouchableOpacity>
            {file ? (
              <View style={s.fileChip}>
                <TouchableOpacity onPress={() => setFile(null)}><Text style={s.fileRemove}>✕</Text></TouchableOpacity>
                <Text style={s.fileTxt} numberOfLines={1}>📄 {file.name}</Text>
              </View>
            ) : null}
          </>
        ) : null}

        <TouchableOpacity onPress={submit} style={s.submitBtn}>
          <Text style={s.submitTxt}>שלח</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
        <View style={s.menuBackdrop}>
          <Pressable onPress={() => setMenuOpen(false)} style={StyleSheet.absoluteFill} />
          <View style={s.menu}>
            <Text style={s.menuTitle}>בחר נושא</Text>
            {CONTACT_TOPICS.map(t => (
              <TouchableOpacity key={t.id} onPress={() => { setTopic(t.id); setMenuOpen(false); }} style={[s.menuItem, topic === t.id && s.menuItemActive]}>
                <Text style={[s.menuTxt, topic === t.id && s.menuTxtActive]}>{t.label}</Text>
                {topic === t.id && <Text style={s.menuCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function InfoSubPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  if (id === 'contact') return <ContactPage />;
  const sec = SECTIONS[id || ''];
  if (!sec) {
    return (
      <View style={s.container}>
        <SafeAreaView edges={['top']} style={{ backgroundColor: '#000' }} />
        <Text style={{ padding: 20, color: Colors.TEXT }}>לא נמצא</Text>
      </View>
    );
  }
  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: sec.color }} />
      <View style={[s.header, { backgroundColor: sec.color }]}>
        <Text style={[s.title, { flex: 1 }]}>{sec.title}</Text>
        <TouchableOpacity onPress={() => router.back()} style={s.headerClose}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>✕</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 80 }}>
        <View style={s.bodyCard}>
          <Text style={s.body}>{sec.body}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  brandBar: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  brandTxt: { flex: 1, fontSize: 22, fontWeight: '900', letterSpacing: -0.3, textAlign: 'center' },
  brandClose: { width: 32, alignItems: 'center' },
  title: { color: '#fff', fontSize: 17, fontWeight: '900', writingDirection: 'rtl', textAlign: 'right' },
  bodyCard: { backgroundColor: '#fff', borderRadius: 10, padding: 18, borderWidth: 1, borderColor: '#E5E7EB' },
  body: { color: Colors.TEXT, fontSize: 14, lineHeight: 26, writingDirection: 'rtl', textAlign: 'right' },
  fieldLabel: { color: Colors.TEXT, fontSize: 13, fontWeight: '700', writingDirection: 'rtl', textAlign: 'right' },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.TEXT, writingDirection: 'rtl', textAlign: 'right' },
  topicChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB' },
  topicChipOn: { backgroundColor: '#B8923A', borderColor: '#B8923A' },
  topicChipTxt: { color: Colors.TEXT, fontSize: 12, fontWeight: '700' },
  topicChipTxtOn: { color: '#fff' },
  submitBtn: { backgroundColor: Colors.PRIMARY, paddingVertical: 14, borderRadius: 10, alignItems: 'center', marginTop: 8 },
  submitTxt: { color: '#fff', fontSize: 15, fontWeight: '800' },
  headerClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  dropdown: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#D9C9A6' },
  dropdownTxt: { flex: 1, color: '#2C5F6E', fontSize: 14, fontWeight: '700', writingDirection: 'rtl', textAlign: 'right' },
  dropdownArrow: { color: '#B8923A', fontSize: 14, fontWeight: '900', marginLeft: 4 },
  uploadBtn: { backgroundColor: '#E8F2F7', borderWidth: 1, borderColor: '#B6D2DE', borderStyle: 'dashed', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  uploadTxt: { color: Colors.PRIMARY, fontWeight: '800', fontSize: 13.5 },
  fileChip: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, padding: 10, backgroundColor: '#FAF6EE', borderRadius: 8, borderWidth: 1, borderColor: '#E8DEC8' },
  fileTxt: { flex: 1, color: '#2C5F6E', fontSize: 12.5, fontWeight: '600', writingDirection: 'rtl', textAlign: 'right' },
  fileRemove: { color: '#E76F51', fontSize: 14, fontWeight: '800', paddingHorizontal: 6 },
  menuBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 22 },
  menu: { width: '100%', maxWidth: 360, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  menuTitle: { color: '#fff', backgroundColor: '#B8923A', fontSize: 14, fontWeight: '800', padding: 14, textAlign: 'center' },
  menuItem: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0E6D2' },
  menuItemActive: { backgroundColor: '#FAF3DE' },
  menuTxt: { flex: 1, color: '#2C5F6E', fontSize: 14, fontWeight: '700', writingDirection: 'rtl', textAlign: 'right' },
  menuTxtActive: { color: '#B8923A', fontWeight: '900' },
  menuCheck: { color: '#B8923A', fontSize: 16, fontWeight: '900' },
});
