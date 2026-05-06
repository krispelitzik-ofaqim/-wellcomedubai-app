import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../constants/colors';

const TITLES: Record<string, string> = {
  hotels: '🏨 מלונות',
  attractions: '🎡 אטרקציות',
  restaurants: '🍽️ מסעדות',
  shopping: '🛍️ קניות',
  nightlife: '🍻 בילויים',
  transport: '🚕 תחבורה',
};

export default function CategoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return (
    <SafeAreaView edges={['top']} style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={{ fontSize: 22, color: Colors.PRIMARY }}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>{TITLES[id || ''] || 'קטגוריה'}</Text>
      </View>
      <View style={s.body}>
        <Text style={{ fontSize: 48 }}>🚧</Text>
        <Text style={s.placeholder}>תוכן הקטגוריה בבנייה</Text>
        <Text style={s.sub}>בקרוב — מלונות/אטרקציות/מסעדות עם דירוגים, תמונות ומפה</Text>
      </View>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  back: { padding: 6 },
  title: { flex: 1, fontSize: 17, fontWeight: '900', color: Colors.TEXT, textAlign: 'center', writingDirection: 'rtl' },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, padding: 30 },
  placeholder: { fontSize: 18, fontWeight: '800', color: Colors.TEXT },
  sub: { fontSize: 13, color: Colors.MUTED, textAlign: 'center' },
});
