import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, GestureResponderEvent, LayoutChangeEvent, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Confetti } from '../../components/Confetti';
import { Balloons } from '../../components/Balloons';
import { Fireworks } from '../../components/Fireworks';
import { useLocalSearchParams, router } from 'expo-router';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { WebView } from '../../components/WebView';
import { Colors } from '../../constants/colors';
import { useI18n } from '../../constants/i18n';
import { tcRu } from '../../constants/contentRu';
import { tcHi } from '../../constants/contentHi';
import { tcAr } from '../../constants/contentAr';
import LEARN from '../../data/learn.json';
import { NARRATION } from '../../data/narration';

// YouTube embed — WebView on native, real <iframe> on web
function VideoEmbed({ id }: { id: string }) {
  const src = `https://www.youtube.com/embed/${id}?rel=0&playsinline=1`;
  if (Platform.OS === 'web') {
    return React.createElement('iframe', { src, style: { width: '100%', height: '100%', border: 'none' }, allowFullScreen: true });
  }
  return (
    <WebView
      originWhitelist={['*']}
      source={{ uri: src }}
      allowsFullscreenVideo
      allowsInlineMediaPlayback
      mediaPlaybackRequiresUserAction={false}
      javaScriptEnabled
      domStorageEnabled
      style={{ width: '100%', height: '100%' }}
    />
  );
}

// Rich HTML article body — WebView on native, real <div> on web
function HtmlBody({ html }: { html: string }) {
  if (Platform.OS === 'web') {
    return React.createElement('div', { style: { flex: 1, overflow: 'auto' }, dangerouslySetInnerHTML: { __html: html } });
  }
  return <WebView originWhitelist={['*']} source={{ html }} style={{ flex: 1 }} />;
}

function fmtTime(ms: number) {
  if (!isFinite(ms) || ms < 0) return '0:00';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function CustomAudioPlayer({ source, maleSource, femaleSource }: { source?: any; maleSource?: any; femaleSource?: any }) {
  const hasGender = maleSource != null && femaleSource != null;
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [speed, setSpeed] = useState<1 | 1.5 | 2>(1);
  const [trackW, setTrackW] = useState(1);
  const [gender, setGender] = useState<'m' | 'f'>('m');   // male = default
  const activeSource = hasGender ? (gender === 'm' ? maleSource : femaleSource) : source;

  useEffect(() => {
    let mounted = true;
    setIsPlaying(false); setPosition(0);
    (async () => {
      try { await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false, shouldDuckAndroid: true }); } catch {}
      const { sound } = await Audio.Sound.createAsync(typeof activeSource === 'string' ? { uri: activeSource } : activeSource, { shouldPlay: false });
      if (!mounted) { sound.unloadAsync(); return; }
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((st: any) => {
        if (!st.isLoaded) return;
        setDuration(st.durationMillis || 0);
        setPosition(st.positionMillis || 0);
        setIsPlaying(!!st.isPlaying);
        if (st.didJustFinish) {
          setIsPlaying(false);
          sound.setPositionAsync(0);
        }
      });
    })();
    return () => { mounted = false; soundRef.current?.unloadAsync(); };
  }, [activeSource]);

  const toggle = async () => {
    const s = soundRef.current; if (!s) return;
    const st: any = await s.getStatusAsync();
    if (!st.isLoaded) return;
    if (st.isPlaying) await s.pauseAsync();
    else {
      if (st.positionMillis >= (st.durationMillis || 0) - 200) await s.setPositionAsync(0);
      await s.playAsync();
    }
  };

  const onSeek = async (e: GestureResponderEvent) => {
    const s = soundRef.current; if (!s || !duration) return;
    const x = e.nativeEvent.locationX;
    const pct = Math.max(0, Math.min(1, x / trackW));
    await s.setPositionAsync(pct * duration);
  };

  const setSp = async (sp: 1 | 1.5 | 2) => {
    setSpeed(sp);
    await soundRef.current?.setRateAsync(sp, true);
  };

  const fillPct = duration ? (position / duration) * 100 : 0;
  const btnBg = isPlaying ? '#F4A261' : '#E76F51';

  return (
    <View style={p.wrap}>
      <View style={p.row}>
        <TouchableOpacity onPress={toggle} style={[p.btn, { backgroundColor: btnBg }]}>
          <Text style={p.btnTxt}>{isPlaying ? '❚❚' : '▶'}</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <View
            onLayout={(e: LayoutChangeEvent) => setTrackW(e.nativeEvent.layout.width)}
            onStartShouldSetResponder={() => true}
            onResponderRelease={onSeek}
            style={p.track}
          >
            <View style={[p.fill, { width: `${fillPct}%` }]} />
          </View>
          <View style={p.timeRow}>
            <Text style={p.timeTxt}>{fmtTime(position)}</Text>
            <Text style={p.timeTxt}>{duration ? fmtTime(duration) : '0:00'}</Text>
          </View>
        </View>
      </View>
      <View style={p.speeds}>
        {([1, 1.5, 2] as const).map(sp => (
          <TouchableOpacity key={sp} onPress={() => setSp(sp)} style={p.spBtn}>
            <Text style={[p.spTxt, { color: speed === sp ? '#F4A261' : '#1A1A1A' }]}>x{sp}</Text>
          </TouchableOpacity>
        ))}
        {hasGender ? (
          <>
            <View style={{ width: 1, height: 16, backgroundColor: 'rgba(0,0,0,0.12)', marginHorizontal: 6 }} />
            <TouchableOpacity onPress={() => setGender('m')} style={p.spBtn}><Text style={[p.spTxt, { fontSize: 20, fontWeight: '900', color: gender === 'm' ? '#1E6FD9' : '#9CA3AF' }]}>♂</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setGender('f')} style={p.spBtn}><Text style={[p.spTxt, { fontSize: 20, fontWeight: '900', color: gender === 'f' ? '#E84B8A' : '#9CA3AF' }]}>♀</Text></TouchableOpacity>
          </>
        ) : null}
      </View>
    </View>
  );
}

// Auto text-to-speech player for the article body — reads in the CONTENT language.
// No recording needed — the device reads the displayed text aloud.
const BCP47: Record<string, string> = { he: 'he-IL', en: 'en-US', ru: 'ru-RU', ar: 'ar-SA', hi: 'hi-IN' };
const PLAY_LBL: Record<string, { listen: string; playing: string }> = {
  en: { listen: 'Listen to this article', playing: 'Playing…' },
  ru: { listen: 'Прослушать статью', playing: 'Воспроизведение…' },
  ar: { listen: 'استمع إلى المقال', playing: 'جارٍ التشغيل…' },
  hi: { listen: 'लेख सुनें', playing: 'चल रहा है…' },
  he: { listen: 'האזן לכתבה', playing: 'מנגן…' },
};
function SpeechPlayer({ text, lang }: { text: string; lang: string }) {
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState<1 | 1.25 | 1.5>(1);
  const [gender, setGender] = useState<'f' | 'm'>('f');
  type V = { id: string; lang: string } | null;
  const voicesRef = useRef<{ f: V; m: V; loaded: boolean }>({ f: null, m: null, loaded: false });
  const bcp = BCP47[lang] || 'en-US';

  const loadVoices = async () => {
    try {
      const vs: any[] = await Speech.getAvailableVoicesAsync();
      // ONLY voices whose language matches the content language — never fall back to
      // an unrelated voice (that's how it "escaped" to the device's default = Hebrew).
      const pool = vs.filter(v => (v.language || '').toLowerCase().startsWith(lang));
      const pick = (re: RegExp) => pool.find(v => re.test(v.name || v.identifier || ''));
      const fV = pick(/samantha|karen|moira|tessa|fiona|victoria|serena|susan|female|ava|allison|kate|zira|catherine|milena|yelena|alena|lekha|women|hala|amira|laila/i) || pool[0];
      const mV = pick(/daniel|alex|fred|thomas|david|oliver|arthur|aaron|gordon|rishi|male|mark|george|yuri|pavel|hemant|majed|maged|tarik|men/i);
      const toV = (v: any): V => v ? { id: v.identifier, lang: v.language || bcp } : null;
      voicesRef.current = { f: toV(fV), m: toV(mV), loaded: true };
    } catch { voicesRef.current.loaded = true; }
  };

  useEffect(() => { voicesRef.current.loaded = false; loadVoices(); return () => { Speech.stop(); }; }, [lang]);

  const clean = (text || '').replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim();

  const toggle = async () => {
    if (playing) { Speech.stop(); setPlaying(false); return; }
    // Web loads the voice list asynchronously — make sure it's ready before we speak.
    if (!voicesRef.current.loaded) await loadVoices();
    const male = gender === 'm';
    // Real male voice if the device has one; otherwise the (female) voice at a lower
    // pitch so ♂ still differs. Pass the voice's OWN language so region (ar_001 vs
    // ar-SA) always matches, and never pass a voice we didn't actually find.
    const picked: V = male ? (voicesRef.current.m || voicesRef.current.f) : voicesRef.current.f;
    const pitch = male && !voicesRef.current.m ? 0.7 : 1.0;
    setPlaying(true);
    Speech.speak(clean, {
      language: picked?.lang || bcp,
      voice: picked?.id,
      rate, pitch,
      onDone: () => setPlaying(false),
      onStopped: () => setPlaying(false),
      onError: () => setPlaying(false),
    });
  };

  const setG = (g: 'f' | 'm') => { setGender(g); if (playing) { Speech.stop(); setPlaying(false); } };

  return (
    <View style={p.wrap}>
      <View style={[p.row, { flexDirection: lang === 'ar' || lang === 'he' ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity onPress={toggle} style={[p.btn, { backgroundColor: playing ? '#F4A261' : '#E76F51' }]}>
          <Text style={p.btnTxt}>{playing ? '❚❚' : '▶'}</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, color: '#2C5F6E', fontSize: 14, fontWeight: '600' }}>{playing ? PLAY_LBL[lang]?.playing || PLAY_LBL.en.playing : PLAY_LBL[lang]?.listen || PLAY_LBL.en.listen}</Text>
        <TouchableOpacity onPress={() => setG('f')} style={p.spBtn}><Text style={[p.spTxt, { fontSize: 20, fontWeight: '900', color: gender === 'f' ? '#E84B8A' : '#9CA3AF' }]}>♀</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => setG('m')} style={p.spBtn}><Text style={[p.spTxt, { fontSize: 20, fontWeight: '900', color: gender === 'm' ? '#1E6FD9' : '#9CA3AF' }]}>♂</Text></TouchableOpacity>
      </View>
      <View style={[p.speeds, { justifyContent: 'flex-start' }]}>
        {([1, 1.25, 1.5] as const).map(sp => (
          <TouchableOpacity key={sp} onPress={() => setRate(sp)} style={p.spBtn}>
            <Text style={[p.spTxt, { color: rate === sp ? '#F4A261' : '#1A1A1A' }]}>x{sp}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const p = StyleSheet.create({
  wrap: { paddingHorizontal: 18, paddingTop: 14 },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  btn: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '600' },
  track: { height: 5, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 0, position: 'relative' },
  fill: { position: 'absolute', top: 0, left: 0, height: '100%', backgroundColor: '#E24B32', borderRadius: 0 },
  timeRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 4 },
  timeTxt: { color: '#6B7F8D', fontSize: 12, fontWeight: '500' },
  speeds: { flexDirection: 'row-reverse', justifyContent: 'center', gap: 6, marginTop: 8 },
  spBtn: { paddingHorizontal: 12, paddingVertical: 4 },
  spTxt: { fontSize: 14, fontWeight: '600' },
});

function imgUrl(img: string) {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  return 'https://wellcomedubai.com/' + img;
}

export default function LearnScreen() {
  const { t, lang, isRTL } = useI18n();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = (LEARN as any)[id || ''];
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    fetch('https://wellcomedubaicom-production.up.railway.app/api/audio?_t=' + Date.now())
      .then(r => r.json())
      .then(j => {
        const file = (j.files || []).find((f: any) => f.dest === id);
        if (file && file.url) setAudioUrl('https://wellcomedubaicom-production.up.railway.app' + file.url);
      })
      .catch(() => {});
    return () => { if (sound) sound.unloadAsync(); };
  }, [id]);

  const togglePlay = async () => {
    if (!audioUrl) return;
    if (sound) {
      if (playing) { await sound.pauseAsync(); setPlaying(false); }
      else { await sound.playAsync(); setPlaying(true); }
      return;
    }
    const { sound: snd } = await Audio.Sound.createAsync({ uri: audioUrl }, { shouldPlay: true });
    snd.setOnPlaybackStatusUpdate((st: any) => { if (st.didJustFinish) setPlaying(false); });
    setSound(snd);
    setPlaying(true);
  };

  if (!item) {
    return (
      <SafeAreaView edges={['top']} style={s.container}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/'); }} style={s.back}>
            <Text style={{ color: '#fff', fontSize: 22 }}>←</Text>
          </TouchableOpacity>
          <Text style={s.title}>{t('common.notFound')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const en = lang === 'en';
  // Per-language long body if it exists (item.textRu/textAr/textHi), else English fallback.
  const bodyByLang: Record<string, string | undefined> = { he: item.text, en: item.textEn, ru: item.textRu, ar: item.textAr, hi: item.textHi };
  const titleByLang: Record<string, string | undefined> = { he: item.title, en: item.titleEn, ru: item.titleRu, ar: item.titleAr, hi: item.titleHi };
  const artText = bodyByLang[lang] || item.textEn || item.text;
  // Which language is the body ACTUALLY in (for direction + read-aloud voice)?
  const contentLang = bodyByLang[lang] ? lang : (item.textEn ? 'en' : 'he');
  const artTitle = titleByLang[lang]
    || (lang === 'ar' ? tcAr(item.title) : lang === 'hi' ? tcHi(item.title) : lang === 'ru' ? tcRu(item.title) : en ? (item.titleEn || item.title) : item.title);
  // Body direction follows the CONTENT language (he + ar = RTL; en/ru/hi = LTR).
  const artRTL = contentLang === 'he' || contentLang === 'ar';
  const isHtml = (artText || '').includes('<table');
  // Pre-rendered natural narration (ElevenLabs) for en/ru/ar/hi; Hebrew uses the studio mp3.
  // `-m` = male variant (Arabic: male default + female option, per cultural preference).
  const narrSrc = NARRATION[`${id}-${contentLang}`];
  const narrMale = NARRATION[`${id}-${contentLang}-m`];

  return (
    <View style={s.backdrop}>
      <TouchableOpacity activeOpacity={1} onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/'); }} style={s.backdropTouch} />
      <View style={s.modal}>
        <View style={[s.modalHeader, { backgroundColor: item.color || Colors.PRIMARY }]}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10, flex: 1 }}>
            <Text style={{ fontSize: 22 }}>{item.icon}</Text>
            <Text style={s.modalTitle}>{artTitle}</Text>
          </View>
          <TouchableOpacity onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/'); }} style={s.modalClose}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>✕</Text>
          </TouchableOpacity>
        </View>
        {isHtml ? (
          <View style={{ flex: 1 }}>
            {item.video ? (
              <View style={s.videoWrap}>
                <VideoEmbed id={item.video} />
              </View>
            ) : item.image ? (
              <Image source={{ uri: imgUrl(item.image) }} style={s.cover} />
            ) : null}
            {lang === 'he' ? (audioUrl ? <CustomAudioPlayer source={audioUrl} /> : null) : (narrMale && narrSrc ? <CustomAudioPlayer maleSource={narrMale} femaleSource={narrSrc} /> : (narrSrc ? <CustomAudioPlayer source={narrSrc} /> : (artText ? <SpeechPlayer text={artText} lang={contentLang} /> : null)))}
            <HtmlBody html={`<!DOCTYPE html><html dir="${artRTL ? 'rtl' : 'ltr'}"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:-apple-system,sans-serif;color:#2C5F6E;padding:18px;line-height:1.7;font-size:15px;margin:0;}table{width:100%;border-collapse:collapse;margin:8px 0;direction:${artRTL ? 'rtl' : 'ltr'};}td,th{padding:10px 8px;text-align:${artRTL ? 'right' : 'left'};border-bottom:1px solid #F0E6D2;}thead tr{background:#F0E6D2;}thead th{font-weight:600;color:#2C5F6E;}tbody tr:nth-child(even){background:#FAF6EE;}</style></head><body>${artText}</body></html>`} />
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 30 }}>
            {item.video ? (
              <View style={s.videoWrap}>
                <VideoEmbed id={item.video} />
              </View>
            ) : item.image ? (
              <Image source={{ uri: imgUrl(item.image) }} style={s.cover} />
            ) : null}
            {lang === 'he' ? (audioUrl ? <CustomAudioPlayer source={audioUrl} /> : null) : (narrMale && narrSrc ? <CustomAudioPlayer maleSource={narrMale} femaleSource={narrSrc} /> : (narrSrc ? <CustomAudioPlayer source={narrSrc} /> : (artText ? <SpeechPlayer text={artText} lang={contentLang} /> : null)))}
            <View style={{ padding: 20 }}>
              {(artText || '').split('\n\n').map((para: string, i: number) => {
                const isHeader = !para.includes('\n') && para.length < 60 && /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(para);
                const dir = { writingDirection: artRTL ? 'rtl' as const : 'ltr' as const, textAlign: artRTL ? 'right' as const : 'left' as const };
                if (isHeader) {
                  return (
                    <Text key={i} style={[s.text, dir, { color: item.color || Colors.PRIMARY, fontWeight: '600', fontSize: 20, letterSpacing: 0.2, marginTop: 20, marginBottom: 8, lineHeight: 28 }]}>{para}</Text>
                  );
                }
                return <Text key={i} style={[s.text, dir]}>{para}</Text>;
              })}
              {item.cta ? (
                <TouchableOpacity
                  onPress={() => { router.back(); if (item.cta?.page) router.push(`/category/${item.cta.page}` as any); }}
                  style={[s.ctaBtn, { backgroundColor: item.color || Colors.PRIMARY }]}
                >
                  <Text style={s.ctaTxt}>{(lang === 'ar' ? tcAr(item.cta.label) : lang === 'hi' ? tcHi(item.cta.label) : lang === 'ru' ? tcRu(item.cta.label) : (en && item.cta.labelEn ? item.cta.labelEn : item.cta.label))} {isRTL ? '←' : '→'}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </ScrollView>
        )}
    </View>
      {id === 'welcome' ? <><Fireworks duration={30000} count={6} /><Confetti duration={30000} count={230} /><Balloons duration={30000} count={16} /></> : id === 'about-app' ? <Confetti duration={30000} count={110} emojis={['❤️', '💕', '💖', '💗', '💝', '🧡', '💛']} /> : null}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  back: { padding: 4 },
  title: { color: '#fff', fontSize: 24, fontWeight: '400', letterSpacing: 0.3, writingDirection: 'rtl' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  backdropTouch: { ...StyleSheet.absoluteFillObject },
  modal: { width: Dimensions.get('window').width * 0.92, maxWidth: 520, height: Dimensions.get('window').height * 0.88, backgroundColor: '#fff', borderRadius: 0, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
  modalHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18, paddingVertical: 16 },
  modalTitle: { color: '#fff', fontWeight: '500', fontSize: 20, letterSpacing: 0.2, writingDirection: 'rtl' },
  modalClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  videoWrap: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000', position: 'relative' },
  videoThumb: { width: '100%', height: '100%' },
  playOverlay: { position: 'absolute', top: 0, right: 0, left: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  cover: { width: '100%', height: 180 },
  text: { color: '#2C5F6E', fontSize: 15, lineHeight: 27, marginBottom: 14, writingDirection: 'rtl', textAlign: 'right' },
  ctaBtn: { paddingVertical: 16, paddingHorizontal: 18, borderRadius: 0, alignItems: 'center', marginTop: 20 },
  ctaTxt: { color: '#fff', fontWeight: '600', fontSize: 16, letterSpacing: 0.2 },
});
