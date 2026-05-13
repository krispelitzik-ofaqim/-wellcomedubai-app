import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, GestureResponderEvent, LayoutChangeEvent, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Audio } from 'expo-av';
import { WebView } from 'react-native-webview';
import { Colors } from '../../constants/colors';
import LEARN from '../../data/learn.json';

function fmtTime(ms: number) {
  if (!isFinite(ms) || ms < 0) return '0:00';
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function CustomAudioPlayer({ url }: { url: string }) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [speed, setSpeed] = useState<1 | 1.5 | 2>(1);
  const [trackW, setTrackW] = useState(1);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try { await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, staysActiveInBackground: false, shouldDuckAndroid: true }); } catch {}
      const { sound } = await Audio.Sound.createAsync({ uri: url }, { shouldPlay: false });
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
  }, [url]);

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
      </View>
    </View>
  );
}

const p = StyleSheet.create({
  wrap: { paddingHorizontal: 18, paddingTop: 14 },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10 },
  btn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '900' },
  track: { height: 5, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 3, position: 'relative' },
  fill: { position: 'absolute', top: 0, left: 0, height: '100%', backgroundColor: '#E76F51', borderRadius: 3 },
  timeRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', marginTop: 4 },
  timeTxt: { color: '#6B7F8D', fontSize: 11, fontWeight: '600' },
  speeds: { flexDirection: 'row-reverse', justifyContent: 'center', gap: 6, marginTop: 8 },
  spBtn: { paddingHorizontal: 12, paddingVertical: 4 },
  spTxt: { fontSize: 13, fontWeight: '800' },
});

function imgUrl(img: string) {
  if (!img) return '';
  if (img.startsWith('http')) return img;
  return 'https://wellcomedubai.com/' + img;
}

export default function LearnScreen() {
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
          <TouchableOpacity onPress={() => router.back()} style={s.back}>
            <Text style={{ color: '#fff', fontSize: 22 }}>←</Text>
          </TouchableOpacity>
          <Text style={s.title}>לא נמצא</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isHtml = (item.text || '').includes('<table');

  return (
    <View style={s.backdrop}>
      <TouchableOpacity activeOpacity={1} onPress={() => router.back()} style={s.backdropTouch} />
      <View style={s.modal}>
        <View style={[s.modalHeader, { backgroundColor: item.color || Colors.PRIMARY }]}>
          <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10, flex: 1 }}>
            <Text style={{ fontSize: 22 }}>{item.icon}</Text>
            <Text style={s.modalTitle}>{item.title}</Text>
          </View>
          <TouchableOpacity onPress={() => router.back()} style={s.modalClose}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>✕</Text>
          </TouchableOpacity>
        </View>
        {isHtml ? (
          <View style={{ flex: 1 }}>
            {item.video ? (
              <View style={s.videoWrap}>
                <WebView
                  originWhitelist={['*']}
                  source={{ uri: `https://www.youtube.com/embed/${item.video}?rel=0&playsinline=1` }}
                  allowsFullscreenVideo
                  allowsInlineMediaPlayback
                  mediaPlaybackRequiresUserAction={false}
                  javaScriptEnabled
                  domStorageEnabled
                  style={{ width: '100%', height: '100%' }}
                />
              </View>
            ) : item.image ? (
              <Image source={{ uri: imgUrl(item.image) }} style={s.cover} />
            ) : null}
            {audioUrl ? <CustomAudioPlayer url={audioUrl} /> : null}
            <WebView
              originWhitelist={['*']}
              source={{ html: `<!DOCTYPE html><html dir="rtl"><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font-family:-apple-system,sans-serif;color:#2C5F6E;padding:18px;line-height:1.7;font-size:15px;margin:0;}table{width:100%;border-collapse:collapse;margin:8px 0;direction:rtl;}td,th{padding:10px 8px;text-align:right;border-bottom:1px solid #F0E6D2;}thead tr{background:#F0E6D2;}thead th{font-weight:800;color:#2C5F6E;}tbody tr:nth-child(even){background:#FAF6EE;}</style></head><body>${item.text}</body></html>` }}
              style={{ flex: 1 }}
            />
          </View>
        ) : (
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 30 }}>
            {item.video ? (
              <View style={s.videoWrap}>
                <WebView
                  originWhitelist={['*']}
                  source={{ uri: `https://www.youtube.com/embed/${item.video}?rel=0&playsinline=1` }}
                  allowsFullscreenVideo
                  allowsInlineMediaPlayback
                  mediaPlaybackRequiresUserAction={false}
                  javaScriptEnabled
                  domStorageEnabled
                  style={{ width: '100%', height: '100%' }}
                />
              </View>
            ) : item.image ? (
              <Image source={{ uri: imgUrl(item.image) }} style={s.cover} />
            ) : null}
            {audioUrl ? <CustomAudioPlayer url={audioUrl} /> : null}
            <View style={{ padding: 20 }}>
              {(item.text || '').split('\n\n').map((para: string, i: number) => {
                const isHeader = !para.includes('\n') && para.length < 60 && /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(para);
                if (isHeader) {
                  return (
                    <Text key={i} style={[s.text, { color: item.color || Colors.PRIMARY, fontWeight: '900', fontSize: 17, marginTop: 18, marginBottom: 8, lineHeight: 24 }]}>{para}</Text>
                  );
                }
                return <Text key={i} style={s.text}>{para}</Text>;
              })}
              {item.cta ? (
                <TouchableOpacity
                  onPress={() => { router.back(); if (item.cta?.page) router.push(`/category/${item.cta.page}` as any); }}
                  style={[s.ctaBtn, { backgroundColor: item.color || Colors.PRIMARY }]}
                >
                  <Text style={s.ctaTxt}>{item.cta.label} ←</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </ScrollView>
        )}
    </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  back: { padding: 4 },
  title: { color: '#fff', fontSize: 17, fontWeight: '900', writingDirection: 'rtl' },
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', padding: 16 },
  backdropTouch: { ...StyleSheet.absoluteFillObject },
  modal: { width: Dimensions.get('window').width * 0.92, maxWidth: 520, height: Dimensions.get('window').height * 0.88, backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } },
  modalHeader: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  modalTitle: { color: '#fff', fontWeight: '800', fontSize: 17, writingDirection: 'rtl' },
  modalClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  videoWrap: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#000', position: 'relative' },
  videoThumb: { width: '100%', height: '100%' },
  playOverlay: { position: 'absolute', top: 0, right: 0, left: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  cover: { width: '100%', height: 180 },
  text: { color: '#2C5F6E', fontSize: 15, lineHeight: 27, marginBottom: 14, writingDirection: 'rtl', textAlign: 'right' },
  ctaBtn: { padding: 14, borderRadius: 10, alignItems: 'center', marginTop: 18, paddingTop: 14, borderTopWidth: 1, borderTopColor: '#F0E6D2' },
  ctaTxt: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
