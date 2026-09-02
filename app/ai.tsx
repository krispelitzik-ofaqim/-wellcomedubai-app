import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Platform, ActivityIndicator, KeyboardAvoidingView, Image, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { useI18n } from '../constants/i18n';
import * as Speech from 'expo-speech';
import { CATALOG } from '../data/catalog';

// Dubai backend base (no API_BASE constant in this app).
const AI_API = 'https://wellcomedubaicom-production.up.railway.app';

// Index of real places (name → item) so an AI answer that mentions a place can show a
// tappable card that opens it inside the app (attraction/hotel/restaurant → /item page).
type Place = { id: any; cat: string; display: string; image: string };
const PLACE_INDEX: { key: string; p: Place }[] = (() => {
  const rows: { key: string; p: Place }[] = [];
  ['attractions', 'hotels', 'restaurants', 'shopping', 'kids', 'nightlife', 'abudhabi'].forEach(cat => {
    ((CATALOG as any)[cat] || []).forEach((it: any) => {
      const p: Place = { id: it.id, cat, display: it.nameEn || it.name, image: it.image || '' };
      [it.name, it.nameEn].forEach((n: string) => { if (n && n.trim().length >= 5) rows.push({ key: n.toLowerCase().trim(), p }); });
    });
  });
  return rows.sort((a, b) => b.key.length - a.key.length); // match longer/more-specific names first
})();
function findPlaces(text: string): Place[] {
  const low = (text || '').toLowerCase();
  const out: Place[] = []; const seen = new Set<string>();
  for (const { key, p } of PLACE_INDEX) {
    if (out.length >= 3) break;
    const id = p.cat + ':' + p.id;
    if (seen.has(id)) continue;
    if (low.includes(key)) { out.push(p); seen.add(id); }
  }
  return out;
}
function placeImg(img: string): string {
  if (!img) return 'https://wellcomedubai.com/images/Yizhak/dubai-skyline-evening.jpg';
  return img.startsWith('http') ? img : 'https://wellcomedubai.com/' + img;
}

// Speak the answer aloud. Web uses the browser's speechSynthesis; native (iOS/Android)
// uses expo-speech (device voices). Works on all platforms.
function speak(text: string, langCode: string) {
  try {
    let clean = (text || '').replace(/\s+/g, ' ').trim();
    // Hebrew device voice mispronounces geresh/gershayim words (בורג׳, ח׳ליפה) — strip them.
    if (langCode.startsWith('he')) clean = clean.replace(/[׳＇'’‘״"“”]/g, '');
    if (Platform.OS === 'web') {
      const w: any = typeof window !== 'undefined' ? window : null;
      if (w?.speechSynthesis) {
        w.speechSynthesis.cancel();
        const u = new w.SpeechSynthesisUtterance(clean);
        u.lang = langCode;
        w.speechSynthesis.speak(u);
      }
    } else {
      Speech.stop();
      Speech.speak(clean, { language: langCode });
    }
  } catch {}
}
function stopSpeak() {
  try {
    if (Platform.OS === 'web') {
      const w: any = typeof window !== 'undefined' ? window : null;
      if (w?.speechSynthesis) w.speechSynthesis.cancel();
    } else {
      Speech.stop();
    }
  } catch {}
}

// Clean the AI answer for display AND speech: strip markdown asterisks/backticks/headings/bullets
// and emojis (TTS otherwise reads emoji names aloud, e.g. "smiling face").
function cleanMd(t: string): string {
  return (t || '')
    .replace(/[\u{1F000}-\u{1FAFF}]/gu, '')                     // emoji & pictographs
    .replace(/[\u{2600}-\u{27BF}]/gu, '')                       // misc symbols & dingbats
    .replace(/[\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}]/gu, '')       // arrows & shapes
    .replace(/[\uFE0F\u200D\u20E3]/g, '')                       // variation selectors / ZWJ / keycap
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/`+/g, '')
    .replace(/^\s*#{1,6}\s*/gm, '')
    .replace(/^\s*[-–—•]\s+/gm, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

type Msg = { role: 'user' | 'ai'; text: string };

const TR: Record<string, {
  title: string; sub: string; placeholder: string; send: string; thinking: string;
  err: string; empty: string; noMic: string; speechLang: string; listening: string; voiceSoon: string;
}> = {
  he: { title: 'מסייע AI', sub: 'שאל אותי כל דבר על דובאי', placeholder: 'כתוב שאלה על דובאי…', send: 'שלח',
    thinking: 'חושב…', err: 'שגיאה, נסה שוב.', empty: 'שאל אותי כל דבר על דובאי — מלונות, אטרקציות, מסעדות ועוד.', noMic: 'המיקרופון לא זמין בדפדפן זה.', speechLang: 'he-IL', listening: 'מקשיב…', voiceSoon: 'הדיבור פעיל באפליקציה המלאה מהחנות. בבדיקה כרגע — הקלד את שאלתך.' },
  en: { title: 'Dubai AI Assistant', sub: 'Ask me anything about Dubai', placeholder: 'Ask a question about Dubai…', send: 'Send',
    thinking: 'Thinking…', err: 'Something went wrong, try again.', empty: 'Ask me anything about Dubai — hotels, attractions, restaurants and more.', noMic: 'Microphone is not available in this browser.', speechLang: 'en-US', listening: 'Listening…', voiceSoon: 'Voice works in the full app from the store. In preview — type your question.' },
  ru: { title: 'AI-помощник', sub: 'Спросите меня о Дубае', placeholder: 'Задайте вопрос о Дубае…', send: 'Отправить',
    thinking: 'Думаю…', err: 'Что-то пошло не так, попробуйте ещё раз.', empty: 'Спросите меня о Дубае — отели, достопримечательности, рестораны и не только.', noMic: 'Микрофон недоступен в этом браузере.', speechLang: 'ru-RU', listening: 'Слушаю…', voiceSoon: 'Голос работает в полном приложении из магазина. В превью — введите вопрос.' },
  hi: { title: 'AI सहायक', sub: 'दुबई के बारे में कुछ भी पूछें', placeholder: 'दुबई के बारे में प्रश्न पूछें…', send: 'भेजें',
    thinking: 'सोच रहा हूँ…', err: 'कुछ गड़बड़ हो गई, फिर से प्रयास करें।', empty: 'दुबई के बारे में कुछ भी पूछें — होटल, आकर्षण, रेस्तरां और भी बहुत कुछ।', noMic: 'इस ब्राउज़र में माइक्रोफ़ोन उपलब्ध नहीं है।', speechLang: 'hi-IN', listening: 'सुन रहा हूँ…', voiceSoon: 'आवाज़ स्टोर वाले पूरे ऐप में काम करती है। प्रीव्यू में — अपना प्रश्न टाइप करें।' },
  ar: { title: 'مساعد AI', sub: 'اسألني أي شيء عن دبي', placeholder: 'اكتب سؤالاً عن دبي…', send: 'إرسال',
    thinking: 'أفكر…', err: 'حدث خطأ، حاول مرة أخرى.', empty: 'اسألني أي شيء عن دبي — الفنادق والمعالم والمطاعم والمزيد.', noMic: 'الميكروفون غير متاح في هذا المتصفح.', speechLang: 'ar-AE', listening: 'أستمع…', voiceSoon: 'الصوت يعمل في التطبيق الكامل من المتجر. في المعاينة — اكتب سؤالك.' },
};

export default function AIScreen() {
  const { lang, isRTL } = useI18n();
  const T = TR[lang] || TR.en;
  const ta: 'right' | 'left' = isRTL ? 'right' : 'left';
  const wd: 'rtl' | 'ltr' = isRTL ? 'rtl' : 'ltr';

  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [interim, setInterim] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const recRef = useRef<any>(null);
  const nativeSubsRef = useRef<any[]>([]);
  const pulse = useRef(new Animated.Value(0)).current;

  // Pulsing halo around the mic while listening — the clear "I'm active" signal.
  useEffect(() => {
    if (!listening) { pulse.setValue(0); return; }
    const loop = Animated.loop(Animated.timing(pulse, { toValue: 1, duration: 1100, easing: Easing.out(Easing.ease), useNativeDriver: Platform.OS !== 'web' }));
    loop.start();
    return () => loop.stop();
  }, [listening]);

  const stopListening = () => {
    setListening(false);
    setInterim('');
    try { recRef.current?.stop?.(); } catch {}
    try { const { ExpoSpeechRecognitionModule } = require('expo-speech-recognition'); ExpoSpeechRecognitionModule.stop(); } catch {}
    nativeSubsRef.current.forEach(s => { try { s?.remove?.(); } catch {} });
    nativeSubsRef.current = [];
  };

  useEffect(() => () => { stopListening(); stopSpeak(); }, []);

  const scrollToEnd = () => setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 80);

  const ask = async (q: string) => {
    const question = q.trim();
    if (!question || loading) return;
    stopSpeak();
    setInput('');
    setMsgs(prev => [...prev, { role: 'user', text: question }]);
    setLoading(true);
    scrollToEnd();
    try {
      const r = await fetch(`${AI_API}/api/ai/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, lang }),
      });
      const j = await r.json().catch(() => null);
      const answer = cleanMd((j && (j.answer || j.error)) || T.err);
      setMsgs(prev => [...prev, { role: 'ai', text: answer }]);
      speak(answer, T.speechLang);
    } catch {
      setMsgs(prev => [...prev, { role: 'ai', text: T.err }]);
    } finally {
      setLoading(false);
      scrollToEnd();
    }
  };

  // Voice input. Web uses the browser's SpeechRecognition; native (iOS/Android) uses
  // expo-speech-recognition (Apple/Google on-device engine — same one Gemini/Siri use).
  // In Expo Go the native module is absent, so it falls back to a "type instead" hint.
  const startVoice = async () => {
    if (loading) return;
    if (listening) { stopListening(); return; }
    if (Platform.OS === 'web') {
      const w: any = typeof window !== 'undefined' ? window : null;
      const SR = w && (w.SpeechRecognition || w.webkitSpeechRecognition);
      if (!SR) { setMsgs(prev => [...prev, { role: 'ai', text: T.noMic }]); return; }
      try {
        const rec = new SR();
        rec.lang = T.speechLang;
        rec.interimResults = true;
        rec.maxAlternatives = 1;
        rec.onresult = (e: any) => {
          let finalTxt = '', interimTxt = '';
          for (let i = 0; i < e.results.length; i++) {
            const t = e.results[i][0]?.transcript || '';
            if (e.results[i].isFinal) finalTxt += t; else interimTxt += t;
          }
          setInterim(interimTxt || finalTxt);
          if (finalTxt.trim()) { stopListening(); ask(finalTxt); }
        };
        rec.onend = () => setListening(false);
        rec.onerror = () => setListening(false);
        recRef.current = rec;
        setInterim('');
        setListening(true);
        rec.start();
      } catch { setListening(false); }
      return;
    }
    // Native
    try {
      const { ExpoSpeechRecognitionModule } = require('expo-speech-recognition');
      const perm = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
      if (!perm?.granted) { setMsgs(prev => [...prev, { role: 'ai', text: T.noMic }]); return; }
      const subs: any[] = [];
      subs.push(ExpoSpeechRecognitionModule.addListener('result', (e: any) => {
        const q = e?.results?.[0]?.transcript || '';
        if (q) setInterim(q);
        if (e?.isFinal && q) { stopListening(); ask(q); }
      }));
      subs.push(ExpoSpeechRecognitionModule.addListener('error', () => setListening(false)));
      subs.push(ExpoSpeechRecognitionModule.addListener('end', () => setListening(false)));
      nativeSubsRef.current = subs;
      setInterim('');
      setListening(true);
      ExpoSpeechRecognitionModule.start({ lang: T.speechLang, interimResults: true, continuous: false });
    } catch {
      // Expo Go / module not linked yet
      setMsgs(prev => [...prev, { role: 'ai', text: T.voiceSoon }]);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      {/* Header */}
      <View style={[s.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/'); }} style={s.backBtn} activeOpacity={0.8}>
          <Text style={s.backTxt}>{isRTL ? '›' : '‹'}</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Image source={require('../assets/dubai-ai-logo.png')} style={[s.hLogo, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]} resizeMode="contain" />
          <Text style={[s.hSub, { textAlign: ta, writingDirection: wd }]}>{T.sub}</Text>
        </View>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        <ScrollView
          ref={scrollRef}
          style={{ flex: 1 }}
          contentContainerStyle={[s.body, msgs.length === 0 && { flexGrow: 1, justifyContent: 'center' }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {msgs.length === 0 ? (
            <View style={s.emptyWrap}>
              <Text style={s.emptyIcon}>✨</Text>
              <Text style={[s.emptyTxt, { writingDirection: wd }]}>{T.empty}</Text>
            </View>
          ) : (
            msgs.map((m, i) => {
              const places = m.role === 'ai' ? findPlaces(m.text) : [];
              return (
                <View key={i} style={{ alignSelf: 'stretch' }}>
                  <View
                    style={[
                      m.role === 'user' ? s.bubbleUser : s.bubbleAI,
                      { alignSelf: m.role === 'user' ? (isRTL ? 'flex-end' : 'flex-start') : (isRTL ? 'flex-start' : 'flex-end') },
                    ]}
                  >
                    <Text style={[m.role === 'user' ? s.bubbleUserTxt : s.bubbleAITxt, { textAlign: ta, writingDirection: wd }]}>{m.text}</Text>
                  </View>
                  {places.length > 0 && (
                    <View style={[s.cardsRow, { alignSelf: isRTL ? 'flex-start' : 'flex-end', flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                      {places.map((p, k) => (
                        <TouchableOpacity key={k} activeOpacity={0.85} onPress={() => router.push(`/item/${p.id}?cat=${p.cat}` as any)} style={s.placeCard}>
                          <Image source={{ uri: placeImg(p.image) }} style={s.placeImg} />
                          <View style={s.placeInfo}>
                            <Text style={s.placeName} numberOfLines={1}>{p.display}</Text>
                            <Text style={s.placeGo}>{({ he: 'פתח בכרטיס ›', en: 'Open ›', ru: 'Открыть ›', hi: 'खोलें ›', ar: '‹ فتح' } as any)[lang] || 'Open ›'}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
          {loading && (
            <View style={[s.bubbleAI, { alignSelf: isRTL ? 'flex-start' : 'flex-end', flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 8 }]}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={[s.bubbleAITxt, { writingDirection: wd }]}>{T.thinking}</Text>
            </View>
          )}
        </ScrollView>

        {/* Prominent mic — tap to speak; pulsing halo + live words show it's active */}
        <View style={s.micZone}>
          <View style={s.micStack}>
            {listening && (
              <Animated.View pointerEvents="none" style={[s.pulseRing, {
                transform: [{ scale: pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 2.1] }) }],
                opacity: pulse.interpolate({ inputRange: [0, 1], outputRange: [0.55, 0] }),
              }]} />
            )}
            <TouchableOpacity onPress={startVoice} activeOpacity={0.85} style={[s.micBig, listening && s.micBigOn]}>
              <Text style={s.micBigIcon}>{listening ? '⏹' : '🎙️'}</Text>
            </TouchableOpacity>
          </View>
          <Text style={[s.micHint, listening && s.micHintOn, { textAlign: 'center' }]} numberOfLines={2}>{listening ? (interim || T.listening) : T.sub}</Text>
        </View>

        {/* Input bar — type a message, send button on the side */}
        <View style={[s.inputBar, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TextInput
            style={[s.input, { textAlign: ta, writingDirection: wd }]}
            value={input}
            onChangeText={setInput}
            placeholder={T.placeholder}
            placeholderTextColor={Colors.MUTED}
            returnKeyType="send"
            onSubmitEditing={() => ask(input)}
            editable={!loading}
            multiline
          />
          <TouchableOpacity
            onPress={() => ask(input)}
            disabled={loading || !input.trim()}
            style={[s.sendBtn, (loading || !input.trim()) && { opacity: 0.5 }]}
            activeOpacity={0.85}
          >
            <Text style={s.sendTxt}>{T.send}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#EAF4F4' },
  header: { alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 13, backgroundColor: '#0F2547' },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: '#fff', fontSize: 26, fontWeight: '300', lineHeight: 28 },
  hTitle: { color: Colors.TEXT, fontSize: 20, fontWeight: '800' },
  hLogo: { width: 132, height: 34 },
  hSub: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 1 },
  body: { padding: 16, gap: 12 },
  emptyWrap: { alignItems: 'center', gap: 14, paddingHorizontal: 24 },
  emptyIcon: { fontSize: 44 },
  emptyTxt: { fontSize: 16, color: Colors.MUTED, textAlign: 'center', lineHeight: 24 },
  bubbleUser: { maxWidth: '85%', backgroundColor: '#FCE6D2', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleUserTxt: { fontSize: 15, color: Colors.TEXT, fontWeight: '600' },
  bubbleAI: { maxWidth: '90%', backgroundColor: '#D5EBE7', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 },
  bubbleAITxt: { fontSize: 15, color: Colors.TEXT, lineHeight: 23, fontWeight: '500' },
  micZone: { alignItems: 'center', paddingTop: 14, paddingBottom: 6, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#EEF1F2' },
  micStack: { width: 68, height: 68, alignItems: 'center', justifyContent: 'center' },
  pulseRing: { position: 'absolute', width: 68, height: 68, borderRadius: 34, backgroundColor: '#E63946' },
  micBig: { width: 68, height: 68, borderRadius: 34, backgroundColor: Colors.ACCENT, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.ACCENT, shadowOpacity: 0.4, shadowRadius: 10, shadowOffset: { width: 0, height: 3 }, elevation: 5 },
  micBigOn: { backgroundColor: '#E63946', shadowColor: '#E63946' },
  micBigIcon: { fontSize: 30, color: '#fff' },
  micHint: { marginTop: 9, fontSize: 12.5, color: Colors.MUTED, fontWeight: '600', paddingHorizontal: 24 },
  micHintOn: { color: '#E63946', fontWeight: '700' },
  inputBar: { alignItems: 'flex-end', gap: 10, paddingHorizontal: 12, paddingTop: 8, paddingBottom: 12, backgroundColor: '#FFFFFF' },
  input: { flex: 1, minHeight: 54, maxHeight: 130, backgroundColor: '#F2F5F6', borderRadius: 14, paddingHorizontal: 18, paddingTop: 15, paddingBottom: 15, fontSize: 17, color: Colors.TEXT },
  sendBtn: { height: 54, paddingHorizontal: 22, borderRadius: 14, backgroundColor: Colors.ACCENT, alignItems: 'center', justifyContent: 'center' },
  sendTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  cardsRow: { flexWrap: 'wrap', gap: 8, marginTop: 6, maxWidth: '92%' },
  placeCard: { width: 150, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E6ECEE', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  placeImg: { width: '100%', height: 84 },
  placeInfo: { padding: 8 },
  placeName: { fontSize: 13.5, fontWeight: '800', color: Colors.TEXT },
  placeGo: { marginTop: 2, fontSize: 12, fontWeight: '700', color: Colors.ACCENT },
});
