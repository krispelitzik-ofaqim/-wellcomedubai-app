import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Modal, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import GALLERY from '../data/gallery.json';

function imgUrl(name: string) {
  return `https://wellcomedubai.com/images/wellcomedubai.stamp/${name}`;
}

const { width } = Dimensions.get('window');
const COL = 3;
const SIZE = (width - 14 * 2 - 6 * (COL - 1)) / COL;

export default function GalleryScreen() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <SafeAreaView edges={['top']} style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={{ fontSize: 22, color: '#fff' }}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>📷 הגלרייה שלנו</Text>
        <Text style={s.count}>{GALLERY.length}</Text>
      </View>
      <FlatList
        data={GALLERY as string[]}
        keyExtractor={(_, i) => String(i)}
        numColumns={COL}
        contentContainerStyle={{ padding: 14 }}
        columnWrapperStyle={{ gap: 6, marginBottom: 6 }}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => setOpen(index)}>
            <Image source={{ uri: imgUrl(item) }} style={{ width: SIZE, height: SIZE, borderRadius: 6 }} />
          </TouchableOpacity>
        )}
      />
      <Modal visible={open !== null} transparent onRequestClose={() => setOpen(null)}>
        <View style={s.modalBg}>
          <TouchableOpacity style={s.modalClose} onPress={() => setOpen(null)}>
            <Text style={{ color: '#fff', fontSize: 28 }}>×</Text>
          </TouchableOpacity>
          {open !== null && (
            <Image source={{ uri: imgUrl((GALLERY as string[])[open]) }} style={s.modalImg} resizeMode="contain" />
          )}
          <View style={s.modalNav}>
            <TouchableOpacity style={s.navBtn} onPress={() => setOpen(o => o === null ? null : (o - 1 + GALLERY.length) % GALLERY.length)}>
              <Text style={s.navTxt}>›</Text>
            </TouchableOpacity>
            <Text style={s.modalCount}>{(open ?? 0) + 1} / {GALLERY.length}</Text>
            <TouchableOpacity style={s.navBtn} onPress={() => setOpen(o => o === null ? null : (o + 1) % GALLERY.length)}>
              <Text style={s.navTxt}>‹</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: Colors.PRIMARY, gap: 10 },
  back: { padding: 4 },
  title: { flex: 1, color: '#fff', fontSize: 17, fontWeight: '900', writingDirection: 'rtl' },
  count: { color: Colors.GOLD, fontSize: 13, fontWeight: '800' },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.95)', justifyContent: 'center', alignItems: 'center' },
  modalClose: { position: 'absolute', top: 50, left: 20, width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  modalImg: { width: '100%', height: '70%' },
  modalNav: { position: 'absolute', bottom: 50, flexDirection: 'row', alignItems: 'center', gap: 24 },
  navBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  navTxt: { color: '#fff', fontSize: 32, fontWeight: '300' },
  modalCount: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
