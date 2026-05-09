import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
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
  body: { padding: 18 },
  text: { color: Colors.TEXT, fontSize: 14, lineHeight: 24, marginBottom: 14, writingDirection: 'rtl', textAlign: 'right' },
});
