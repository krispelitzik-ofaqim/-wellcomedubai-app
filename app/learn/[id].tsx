import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Audio } from 'expo-av';
import { Colors } from '../../constants/colors';
import LEARN from '../../data/learn.json';

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
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: item.color || Colors.PRIMARY }}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.back}>
            <Text style={{ color: '#fff', fontSize: 22 }}>←</Text>
          </TouchableOpacity>
          <Text style={s.title}>{item.icon} {item.title}</Text>
        </View>
      </SafeAreaView>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        {item.video ? (
          <TouchableOpacity onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${item.video}`)}>
            <View style={s.videoWrap}>
              <Image source={{ uri: `https://img.youtube.com/vi/${item.video}/maxresdefault.jpg` }} style={s.videoThumb} />
              <View style={s.playOverlay}>
                <Text style={{ fontSize: 50 }}>▶️</Text>
                <Text style={{ color: '#fff', fontWeight: '700', marginTop: 4 }}>פתח ב-YouTube</Text>
              </View>
            </View>
          </TouchableOpacity>
        ) : item.image ? (
          <Image source={{ uri: imgUrl(item.image) }} style={s.cover} />
        ) : null}

        {audioUrl ? (
          <TouchableOpacity onPress={togglePlay} style={s.audioBar}>
            <Text style={{ fontSize: 22 }}>{playing ? '⏸' : '▶️'}</Text>
            <Text style={s.audioTxt}>{playing ? 'מנגן את הסיפור...' : 'הקשב לסיפור'}</Text>
          </TouchableOpacity>
        ) : null}
        <View style={s.body}>
          {isHtml ? (
            <Text style={s.text}>{(item.text || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()}</Text>
          ) : (
            (item.text || '').split('\n\n').map((para: string, i: number) => (
              <Text key={i} style={s.text}>{para}</Text>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  back: { padding: 4 },
  title: { color: '#fff', fontSize: 17, fontWeight: '900', writingDirection: 'rtl' },
  videoWrap: { width: '100%', height: 220, backgroundColor: '#000', position: 'relative' },
  videoThumb: { width: '100%', height: '100%' },
  playOverlay: { position: 'absolute', top: 0, right: 0, left: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  cover: { width: '100%', height: 220 },
  audioBar: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, padding: 14, backgroundColor: Colors.PRIMARY, marginHorizontal: 14, marginTop: 12, borderRadius: 12 },
  audioTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
  body: { padding: 18 },
  text: { color: Colors.TEXT, fontSize: 14, lineHeight: 24, marginBottom: 14, writingDirection: 'rtl', textAlign: 'right' },
});
