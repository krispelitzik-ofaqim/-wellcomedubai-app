import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Platform, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useI18n } from '../constants/i18n';
import { RE_API } from '../constants/realestate';

const NAVY = '#16222C', CREAM = '#F5F1EA', GOLD = '#E9C46A';

type Mine = { id: string; token: string; title: string };
type Row = Mine & { status?: string; kind?: string; minAmount?: string; currency?: string; missing?: boolean; featuredUntil?: string | null };

export default function MyInvestmentsScreen() {
  const { t, lang, isRTL } = useI18n();
  const [rows, setRows] = useState<Row[]>([]);
  const [paying, setPaying] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const ta = (isRTL ? 'right' : 'left') as 'right' | 'left';
  const wd = (isRTL ? 'rtl' : 'ltr') as 'rtl' | 'ltr';

  const load = useCallback(async () => {
    setLoading(true);
    const raw = await AsyncStorage.getItem('@myInvestments');
    const mine: Mine[] = raw ? JSON.parse(raw) : [];
    const out: Row[] = [];
    for (const m of mine) {
      try {
        const r = await fetch(`${RE_API}/api/investments/${m.id}?token=${encodeURIComponent(m.token)}`);
        const j = await r.json();
        // A 404 means it was removed on our side — show it as gone rather than dropping it silently.
        out.push(j?.success ? { ...m, ...j.data } : { ...m, missing: true });
      } catch { out.push({ ...m }); }
    }
    setRows(out);
    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const say = (m: string) => (Platform.OS === 'web' ? alert(m) : Alert.alert(m));

  const remove = async (row: Row) => {
    const go = async () => {
      try { await fetch(`${RE_API}/api/investments/${row.id}?token=${encodeURIComponent(row.token)}`, { method: 'DELETE' }); } catch {}
      const raw = await AsyncStorage.getItem('@myInvestments');
      const mine: Mine[] = raw ? JSON.parse(raw) : [];
      await AsyncStorage.setItem('@myInvestments', JSON.stringify(mine.filter(x => x.id !== row.id)));
      load();
    };
    if (Platform.OS === 'web') { if (confirm(t('mi.delConfirm'))) go(); return; }
    Alert.alert(t('mi.delConfirm'), '', [{ text: t('mi.cancel'), style: 'cancel' }, { text: t('mi.delete'), style: 'destructive', onPress: go }]);
  };

  // $20 buys 90 days as a full ad with photos and video; without it the listing
  // stays a free one-line strip.
  const upgrade = async (r: Row) => {
    if (paying) return;
    setPaying(r.id);
    try {
      const res = await fetch(`${RE_API}/api/investments/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: r.id, token: r.token, lang }),
      });
      const j = await res.json();
      if (j?.success && j.url) Linking.openURL(j.url).catch(() => {});
      else say(t('mi.payErr'));
    } catch { say(t('mi.payErr')); }
    finally { setPaying(null); }
  };

  const isPaid = (r: Row) => !!(r.featuredUntil && new Date(r.featuredUntil) > new Date());

  const statusOf = (r: Row) => {
    if (r.missing) return { txt: t('mi.gone'), bg: '#F1EDE5', fg: '#8A8578' };
    if (r.status === 'approved') return { txt: t('mi.live'), bg: '#E3F3EB', fg: '#2E9E6B' };
    if (r.status === 'rejected') return { txt: t('mi.rejected'), bg: '#FBEEE9', fg: '#E76F51' };
    return { txt: t('mi.pending'), bg: '#FCF3E2', fg: '#B8923A' };
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={[s.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/investments' as any))} style={s.back}>
          <Text style={s.backTxt}>{isRTL ? '›' : '‹'}</Text>
        </TouchableOpacity>
        <Text style={[s.hTitle, { flex: 1, textAlign: ta, writingDirection: wd }]}>{t('mi.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {loading && <Text style={[s.empty, { textAlign: ta, writingDirection: wd }]}>{t('mi.loading')}</Text>}
        {!loading && rows.length === 0 && <Text style={[s.empty, { textAlign: ta, writingDirection: wd }]}>{t('mi.none')}</Text>}

        {rows.map(r => {
          const st = statusOf(r);
          return (
            <View key={r.id} style={s.card}>
              <View style={[s.top, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Text style={[s.name, { flex: 1, textAlign: ta, writingDirection: wd }]} numberOfLines={2}>{r.title}</Text>
                <View style={[s.pill, { backgroundColor: st.bg }]}><Text style={[s.pillTxt, { color: st.fg }]}>{st.txt}</Text></View>
              </View>
              {!!r.minAmount && <Text style={[s.sub, { textAlign: ta, writingDirection: wd }]}>{r.currency} {r.minAmount}</Text>}
              <Text style={[s.plan, { textAlign: ta, writingDirection: wd }]}>
                {isPaid(r)
                  ? `${t('mi.planFull')} · ${t('mi.until')} ${new Date(r.featuredUntil as string).toLocaleDateString('he-IL')}`
                  : t('mi.planFree')}
              </Text>
              {!r.missing && !isPaid(r) && (
                <TouchableOpacity style={[s.upBtn, paying === r.id && { opacity: 0.6 }]} disabled={paying === r.id}
                  activeOpacity={0.85} onPress={() => upgrade(r)}>
                  <Text style={s.upTxt}>{t('mi.upgrade')}</Text>
                </TouchableOpacity>
              )}
              {!r.missing && !isPaid(r) && (
                <Text style={[s.upSub, { textAlign: ta, writingDirection: wd }]}>{t('mi.upgradeSub')}</Text>
              )}
              <View style={[s.actions, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                {!r.missing && (
                  <TouchableOpacity style={s.actBtn} onPress={() => router.push(`/submit-investment?id=${r.id}&token=${encodeURIComponent(r.token)}` as any)}>
                    <Text style={s.actTxt}>{t('mi.edit')}</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[s.actBtn, s.delBtn]} onPress={() => remove(r)}>
                  <Text style={[s.actTxt, { color: '#E76F51' }]}>{t('mi.delete')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CREAM },
  header: { alignItems: 'center', paddingHorizontal: 6, paddingVertical: 8, backgroundColor: NAVY },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: '#fff', fontSize: 32, lineHeight: 34, fontWeight: '300' },
  hTitle: { color: '#fff', fontSize: 19, fontWeight: '400' },
  empty: { color: '#A9A291', fontSize: 14, paddingVertical: 20 },
  card: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E7E0D4', borderRadius: 6, padding: 16, marginBottom: 12 },
  top: { alignItems: 'flex-start', gap: 10 },
  name: { color: NAVY, fontSize: 17, fontWeight: '600' },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  pillTxt: { fontSize: 11.5, fontWeight: '700' },
  sub: { color: '#8A8578', fontSize: 13, marginTop: 6 },
  plan: { color: '#8A8578', fontSize: 12.5, marginTop: 10 },
  upBtn: { backgroundColor: GOLD, borderRadius: 4, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  upTxt: { color: NAVY, fontSize: 14.5, fontWeight: '700' },
  upSub: { color: '#8A8578', fontSize: 12, lineHeight: 18, marginTop: 8 },
  actions: { gap: 10, marginTop: 16 },
  actBtn: { flex: 1, borderWidth: 1.5, borderColor: '#E7E0D4', borderRadius: 4, paddingVertical: 11, alignItems: 'center' },
  delBtn: { borderColor: '#F3D9D1' },
  actTxt: { color: NAVY, fontSize: 14, fontWeight: '700' },
});
