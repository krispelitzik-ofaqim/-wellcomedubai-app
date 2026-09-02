import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Platform, Linking, Image } from 'react-native';
import Constants from 'expo-constants';
import { useI18n, Lang } from '../constants/i18n';
import { Colors } from '../constants/colors';

// WellCome Dubai version endpoint — returns { latestVersion: string, minVersion: string }.
const VERSION_API = 'https://wellcomedubaicom-production.up.railway.app/api/version';

// Store links.
const STORE = {
  ios: 'https://apps.apple.com/app/id6769145087',
  android: 'https://play.google.com/store/apps/details?id=com.wellcomedubai.app',
};

const TR: Record<Lang, { title: string; msg: string; update: string; later: string }> = {
  he: { title: 'גרסה חדשה זמינה', msg: 'עדכנו לגרסה האחרונה כדי לקבל את כל השיפורים והתכונות החדשות.', update: 'עדכן לגרסה חדשה', later: 'השאר עם גרסה ישנה' },
  en: { title: 'A new version is available', msg: 'Update to the latest version to get all the latest improvements and features.', update: 'Update to new version', later: 'Stay on old version' },
  ru: { title: 'Доступна новая версия', msg: 'Обновитесь до последней версии, чтобы получить все улучшения и новые функции.', update: 'Обновить до новой версии', later: 'Остаться на старой версии' },
  hi: { title: 'नया संस्करण उपलब्ध है', msg: 'सभी नवीनतम सुधार और सुविधाएँ पाने के लिए नवीनतम संस्करण में अपडेट करें।', update: 'नए संस्करण में अपडेट करें', later: 'पुराने संस्करण पर रहें' },
  ar: { title: 'يتوفر إصدار جديد', msg: 'حدّث إلى أحدث إصدار للحصول على جميع التحسينات والميزات الجديدة.', update: 'التحديث إلى الإصدار الجديد', later: 'البقاء على الإصدار القديم' },
};

// Numeric semver-ish compare: returns 1 if a>b, -1 if a<b, 0 if equal.
function cmpVer(a: string, b: string): number {
  const pa = String(a).split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b).split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d !== 0) return d > 0 ? 1 : -1;
  }
  return 0;
}

// Soft (or forced) "update available" prompt on launch, driven by the version API:
//   latestVersion — newest store version (string). Prompt shows if installed < latest.
//   minVersion    — if installed < min, the prompt is FORCED (cannot be dismissed).
// Completely safe: any fetch error / junk response renders nothing and never blocks the app.
export default function UpdatePrompt() {
  const { lang } = useI18n();
  const [show, setShow] = useState(false);
  const [force, setForce] = useState(false);
  const [dispLang, setDispLang] = useState<Lang>(lang);

  useEffect(() => {
    if (Platform.OS === 'web' || __DEV__) return;
    const cur = Constants.expoConfig?.version || (Constants as any).manifest?.version || '0';
    (async () => {
      try {
        const res = await fetch(`${VERSION_API}?platform=${Platform.OS}`);
        const d: any = await res.json();
        const latest = d?.latestVersion;
        const min = d?.minVersion;
        if (latest && cmpVer(String(latest), String(cur)) > 0) {
          setForce(!!(min && cmpVer(String(min), String(cur)) > 0));
          setShow(true);
        }
      } catch {
        // never crash, never block the app
      }
    })();
  }, []);

  if (!show) return null;
  const T = TR[dispLang] || TR[lang] || TR.en;
  const wd = (dispLang === 'he' || dispLang === 'ar') ? 'rtl' : 'ltr';
  const store = Platform.OS === 'ios' ? STORE.ios : STORE.android;
  const LANGS: { code: Lang; label: string }[] = [
    { code: 'he', label: 'עברית' },
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Русский' },
    { code: 'hi', label: 'हिन्दी' },
    { code: 'ar', label: 'العربية' },
  ];

  return (
    <Modal transparent visible animationType="fade" onRequestClose={() => { if (!force) setShow(false); }}>
      <View style={s.bg}>
        <View style={s.card}>
          <Image source={require('../assets/icon.png')} style={s.logo} resizeMode="cover" />
          <View style={s.langRow}>
            {LANGS.map((l) => (
              <TouchableOpacity key={l.code} onPress={() => setDispLang(l.code)} activeOpacity={0.8} style={[s.langChip, dispLang === l.code && s.langChipOn]}>
                <Text style={[s.langTxt, dispLang === l.code && s.langTxtOn]}>{l.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[s.title, { writingDirection: wd }]}>{T.title}</Text>
          <Text style={[s.msg, { writingDirection: wd }]}>{T.msg}</Text>
          <TouchableOpacity style={s.btn} activeOpacity={0.85} onPress={() => Linking.openURL(store)}>
            <Text style={s.btnTxt}>{T.update}</Text>
          </TouchableOpacity>
          {!force && (
            <TouchableOpacity onPress={() => setShow(false)} style={{ paddingVertical: 8 }}>
              <Text style={s.later}>{T.later}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  bg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 28 },
  card: { width: '100%', maxWidth: 360, backgroundColor: Colors.WHITE, borderRadius: 20, padding: 24, alignItems: 'center', gap: 8 },
  logo: { width: 72, height: 72, borderRadius: 18, marginBottom: 2 },
  title: { fontSize: 20, fontWeight: '900', color: Colors.TEXT, textAlign: 'center' },
  msg: { fontSize: 14, color: Colors.MUTED, textAlign: 'center', lineHeight: 21, marginTop: 2 },
  btn: { backgroundColor: Colors.PRIMARY, paddingVertical: 13, paddingHorizontal: 28, borderRadius: 14, marginTop: 14, alignSelf: 'stretch', alignItems: 'center' },
  btnTxt: { color: Colors.WHITE, fontSize: 16, fontWeight: '900' },
  later: { color: '#94a0ab', fontSize: 14, fontWeight: '700', marginTop: 4 },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 6, marginTop: 2, marginBottom: 2 },
  langChip: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 16, backgroundColor: '#F0F2F4' },
  langChipOn: { backgroundColor: Colors.PRIMARY },
  langTxt: { fontSize: 12.5, fontWeight: '700', color: '#7A868F' },
  langTxtOn: { color: Colors.WHITE },
});
