import { useState } from 'react';
import { View, Image, FlatList, LayoutChangeEvent, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

// Swipeable photo gallery with page indicators. Used in real-estate listing cards
// and the live listing preview so visitors see ALL uploaded photos, not just the first.
export function PhotoCarousel({ photos, height, resolve }: { photos: string[]; height: number; resolve?: (p: string) => string }) {
  const [idx, setIdx] = useState(0);
  const [w, setW] = useState(0);
  if (!photos || !photos.length) return null;
  const r = resolve || ((p: string) => p);
  const onLayout = (e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width);
  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => { if (w) setIdx(Math.round(e.nativeEvent.contentOffset.x / w)); };
  return (
    <View onLayout={onLayout}>
      {w > 0 && (
        <FlatList
          data={photos}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => String(i)}
          onMomentumScrollEnd={onEnd}
          renderItem={({ item }) => <Image source={{ uri: r(item) }} style={{ width: w, height }} />}
        />
      )}
      {photos.length > 1 ? (
        <View style={{ position: 'absolute', bottom: 9, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 4 }}>
          {photos.map((_, i) => (
            <View key={i} style={{ width: i === idx ? 18 : 7, height: 3, backgroundColor: i === idx ? '#fff' : 'rgba(255,255,255,0.55)' }} />
          ))}
        </View>
      ) : null}
    </View>
  );
}
