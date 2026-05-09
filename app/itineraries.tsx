import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { ITINERARIES } from '../data/itineraries';

export default function ItinerariesScreen() {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <SafeAreaView edges={['top']} style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={{ fontSize: 22, color: '#fff' }}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>📅 מסלולי יום מוכנים</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 60 }}>
        {ITINERARIES.map((it: any, i: number) => {
          const open = openIdx === i;
          return (
            <View key={i} style={[s.card, { borderRightColor: it.color }]}>
              <TouchableOpacity onPress={() => setOpenIdx(open ? null : i)} style={s.cardHead}>
                <Text style={s.cardIcon}>{it.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[s.cardTitle, { color: it.color }]}>{it.title}</Text>
                  <Text style={s.cardMeta}>⏱ {it.duration} · 👥 {it.bestFor}</Text>
                </View>
                <Text style={s.chevron}>{open ? '▲' : '▼'}</Text>
              </TouchableOpacity>
              {open && (
                <View style={{ marginTop: 10 }}>
                  {it.stops.map((stop: any, j: number) => (
                    <View key={j} style={s.stopRow}>
                      <View style={[s.stopTime, { backgroundColor: it.color }]}>
                        <Text style={s.stopTimeTxt}>{stop.time}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={s.stopName}>{stop.name}</Text>
                        <Text style={s.stopDesc}>{stop.desc}</Text>
                        {stop.lat ? (
                          <TouchableOpacity onPress={() => Linking.openURL(`https://www.google.com/maps?q=${stop.lat},${stop.lng}`)}>
                            <Text style={[s.stopMap, { color: it.color }]}>📍 פתח במפה</Text>
                          </TouchableOpacity>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: Colors.PRIMARY, gap: 10 },
  back: { padding: 4 },
  title: { color: '#fff', fontSize: 17, fontWeight: '900', writingDirection: 'rtl' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E8DEC8', borderRightWidth: 4 },
  cardHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12 },
  cardIcon: { fontSize: 28 },
  cardTitle: { fontSize: 15, fontWeight: '900', writingDirection: 'rtl', textAlign: 'right' },
  cardMeta: { color: Colors.MUTED, fontSize: 11, marginTop: 3, writingDirection: 'rtl', textAlign: 'right' },
  chevron: { color: Colors.MUTED, fontSize: 12 },
  stopRow: { flexDirection: 'row-reverse', gap: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#F0E6D2' },
  stopTime: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', minWidth: 50, alignItems: 'center' },
  stopTimeTxt: { color: '#fff', fontSize: 11, fontWeight: '800' },
  stopName: { fontWeight: '800', color: Colors.TEXT, fontSize: 13, writingDirection: 'rtl', textAlign: 'right' },
  stopDesc: { color: Colors.MUTED, fontSize: 11, marginTop: 2, lineHeight: 15, writingDirection: 'rtl', textAlign: 'right' },
  stopMap: { fontSize: 11, fontWeight: '800', marginTop: 4, textAlign: 'right' },
});
