import { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, FlatList, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import GALLERY from '../data/gallery.json';

function imgUrl(name: string) {
  return `https://wellcomedubai.com/images/wellcomedubai.stamp/${name}`;
}

const { width } = Dimensions.get('window');
const BANNER_H = 240;
const GAP = 4;
const COL_GAP = 4;
const TILE_W = (width - COL_GAP) / 2;

export default function GalleryScreen() {
  const [idx, setIdx] = useState(0);
  const items = GALLERY as string[];
  const total = items.length;
  const bannerRef = useRef<FlatList>(null);

  const onBannerScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / width);
    if (i !== idx) setIdx(i);
  };

  const goto = (i: number) => {
    setIdx(i);
    bannerRef.current?.scrollToOffset({ offset: i * width, animated: true });
  };

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#000' }} />
      <View style={s.brandBar}>
        <Text style={s.brandTxt}>
          <Text style={{ color: '#1A6B8A' }}>WellCome </Text>
          <Text style={{ color: '#E76F51' }}>Dubai</Text>
        </Text>
        <TouchableOpacity onPress={() => router.back()} style={s.brandClose}>
          <Text style={{ color: '#2C5F6E', fontSize: 18, fontWeight: '700' }}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={s.header}>
        <Text style={s.title}>הגלרייה שלנו</Text>
        <Text style={s.count}>{idx + 1} / {total}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        <View style={s.bannerWrap}>
          <FlatList
            ref={bannerRef}
            data={items}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onBannerScroll}
            renderItem={({ item, index }) => {
              const corner: any = (() => {
                const m = index % 4;
                if (m === 0) return { top: BANNER_H * 0.2, right: 0 };
                if (m === 1) return { bottom: BANNER_H * 0.2, right: 0 };
                if (m === 2) return { top: BANNER_H * 0.2, left: 0 };
                return { bottom: BANNER_H * 0.2, left: 0 };
              })();
              return (
                <View style={{ width, height: BANNER_H, backgroundColor: '#000' }}>
                  <Image source={{ uri: imgUrl(item) }} style={{ width, height: BANNER_H }} resizeMode="cover" />
                  <View style={[s.watermarkBox, corner]}>
                    <Text style={s.watermarkTxt}>
                      <Text style={{ color: '#F4A261' }}>WellCome</Text>
                      <Text style={{ color: '#fff' }}> Dubai.com</Text>
                    </Text>
                  </View>
                </View>
              );
            }}
          />
          <TouchableOpacity onPress={() => goto((idx - 1 + total) % total)} style={[s.arrow, { left: 10 }]}>
            <Text style={s.arrowTxt}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => goto((idx + 1) % total)} style={[s.arrow, { right: 10 }]}>
            <Text style={s.arrowTxt}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={s.grid}>
          {items.map((name, i) => {
            const m = i % 4;
            const corner: any = m === 0 ? { top: TILE_W * 0.2, right: -TILE_W * 0.2 } : m === 1 ? { bottom: TILE_W * 0.2, right: -TILE_W * 0.2 } : m === 2 ? { top: TILE_W * 0.2, left: -TILE_W * 0.2 } : { bottom: TILE_W * 0.2, left: -TILE_W * 0.2 };
            return (
              <TouchableOpacity key={i} onPress={() => goto(i)} style={s.tile}>
                <Image source={{ uri: imgUrl(name) }} style={{ width: TILE_W, height: TILE_W }} />
                <View style={[s.tileMarkBox, corner]}>
                  <Text style={s.tileMarkTxt}>
                    <Text style={{ color: '#F4A261' }}>WellCome</Text>
                    <Text style={{ color: '#fff' }}> Dubai.com</Text>
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: Colors.PRIMARY, gap: 10 },
  back: { padding: 4 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  brandBar: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  brandTxt: { flex: 1, fontSize: 22, fontWeight: '900', letterSpacing: -0.3, textAlign: 'center' },
  brandClose: { width: 32, alignItems: 'center' },
  title: { flex: 1, color: '#fff', fontSize: 17, fontWeight: '900', writingDirection: 'rtl', textAlign: 'right' },
  count: { color: Colors.GOLD, fontSize: 13, fontWeight: '800' },
  bannerWrap: { backgroundColor: '#000', marginBottom: GAP, position: 'relative' },
  arrow: { position: 'absolute', top: BANNER_H / 2 - 22, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  arrowTxt: { color: '#fff', fontSize: 36, fontWeight: '300', lineHeight: 38, textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 6 },
  watermarkBox: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.45)', borderColor: 'rgba(255,255,255,0.18)', borderWidth: 1, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 6 },
  watermarkTxt: { color: '#fff', fontWeight: '700', fontSize: 12, letterSpacing: 0.5 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: COL_GAP },
  tile: { width: TILE_W, height: TILE_W, position: 'relative' },
  tileActive: { opacity: 0.6 },
  tileMarkBox: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.45)', borderColor: 'rgba(255,255,255,0.18)', borderWidth: 1, paddingHorizontal: 6, paddingVertical: 3, borderRadius: 5 },
  tileMarkTxt: { fontWeight: '700', fontSize: 9, letterSpacing: 0.3 },
});
