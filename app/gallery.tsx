import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import GALLERY from '../data/gallery.json';

function imgUrl(name: string) {
  return `https://wellcomedubai.com/images/wellcomedubai.stamp/${name}`;
}

const { width } = Dimensions.get('window');
const THUMB = 70;

export default function GalleryScreen() {
  const [idx, setIdx] = useState(0);
  const total = (GALLERY as string[]).length;
  const prev = () => setIdx(i => (i - 1 + total) % total);
  const next = () => setIdx(i => (i + 1) % total);
  const stripRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (stripRef.current) stripRef.current.scrollTo({ x: idx * (THUMB + 6) - width / 2 + THUMB / 2, animated: true });
  }, [idx]);

  return (
    <SafeAreaView edges={['top']} style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={{ fontSize: 22, color: '#fff' }}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>📷 הגלרייה שלנו</Text>
        <Text style={s.count}>{idx + 1} / {total}</Text>
      </View>

      <View style={s.imageWrap}>
        <Image source={{ uri: imgUrl((GALLERY as string[])[idx]) }} style={s.image} resizeMode="contain" />
        <View style={s.watermark}>
          <Text style={s.watermarkTxt}>© WellCome Dubai</Text>
        </View>
        <TouchableOpacity onPress={prev} style={[s.navBtn, { right: 14 }]}>
          <Text style={s.navTxt}>›</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={next} style={[s.navBtn, { left: 14 }]}>
          <Text style={s.navTxt}>‹</Text>
        </TouchableOpacity>
      </View>

      <View style={s.stripWrap}>
        <Text style={s.stripTitle}>כל התמונות ({total})</Text>
        <ScrollView ref={stripRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 12, paddingBottom: 14 }}>
          {(GALLERY as string[]).map((name, i) => (
            <TouchableOpacity key={i} onPress={() => setIdx(i)} style={[s.thumb, i === idx && s.thumbActive]}>
              <Image source={{ uri: imgUrl(name) }} style={{ width: THUMB, height: THUMB }} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: Colors.PRIMARY, gap: 10 },
  back: { padding: 4 },
  title: { flex: 1, color: '#fff', fontSize: 17, fontWeight: '900', writingDirection: 'rtl' },
  count: { color: Colors.GOLD, fontSize: 13, fontWeight: '800' },
  imageWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000', position: 'relative' },
  image: { width: '100%', height: '100%' },
  watermark: { position: 'absolute', bottom: 18, right: 18, backgroundColor: 'rgba(0,0,0,0.55)', borderColor: 'rgba(233,196,106,0.5)', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
  watermarkTxt: { color: Colors.GOLD, fontWeight: '900', fontSize: 11, letterSpacing: 0.5 },
  navBtn: { position: 'absolute', top: '50%', marginTop: -28, width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center' },
  navTxt: { color: '#fff', fontSize: 32, fontWeight: '300' },
  stripWrap: { backgroundColor: '#0E2A38' },
  stripTitle: { color: '#fff', fontSize: 12, fontWeight: '700', paddingHorizontal: 14, paddingTop: 10, paddingBottom: 6, textAlign: 'right', writingDirection: 'rtl' },
  thumb: { borderRadius: 6, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  thumbActive: { borderWidth: 2, borderColor: Colors.ACCENT },
});
