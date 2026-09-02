import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '../constants/colors';
import { useI18n } from '../constants/i18n';

export default function SoonScreen() {
  const { t, isRTL } = useI18n();
  const { k, icon } = useLocalSearchParams<{ k?: string; icon?: string }>();
  const title = k ? t(k) : '';
  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: Colors.PRIMARY }}>
        <View style={[s.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/'); }} style={s.back}>
            <Text style={s.backTxt}>{isRTL ? '›' : '‹'}</Text>
          </TouchableOpacity>
          <Text style={[s.hTitle, { flex: 1, textAlign: isRTL ? 'right' : 'left' }]}>{title}</Text>
        </View>
      </SafeAreaView>
      <View style={s.empty}>
        <Text style={s.emoji}>{icon || '🛍️'}</Text>
        <Text style={s.soon}>{t('soon.msg')}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  back: { width: 38, height: 38, borderRadius: 19, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: '#fff', fontSize: 30, fontWeight: '300', marginTop: -4 },
  hTitle: { color: '#fff', fontSize: 22, fontWeight: '900' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 16 },
  emoji: { fontSize: 64 },
  soon: { color: Colors.MUTED, fontSize: 16, fontWeight: '700', textAlign: 'center', lineHeight: 24 },
});
