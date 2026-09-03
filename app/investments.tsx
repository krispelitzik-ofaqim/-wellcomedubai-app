import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useI18n } from '../constants/i18n';
import { RE_API } from '../constants/realestate';

const NAVY = '#16222C', CREAM = '#F5F1EA', GOLD = '#E9C46A', TEAL = '#1A6B8A';
const HERO = 'https://wellcomedubai.com/images/Yizhak/investments-hero.jpg';
const FALLBACK = 'https://wellcomedubai.com/images/Yizhak/economy-uae-currency.jpg';

type Opp = {
  id: string; title: string; promoter: string; kind: string; area?: string;
  minAmount: string; currency: string; yieldPct?: string; horizon?: string;
  desc?: string; photos?: string[]; demo?: boolean; featured?: boolean;
};

// Placeholders only while the board is empty.
const DEMO: Opp[] = [
  { id: 'd1', title: 'Marina Heights · Off-Plan', promoter: 'Emaar', kind: 'realestate', area: 'Dubai Marina',
    minAmount: '750,000', currency: 'AED', yieldPct: '8', horizon: '3-5', demo: true, featured: true },
  { id: 'd2', title: 'JVC Rental Portfolio', promoter: 'Damac', kind: 'realestate', area: 'JVC',
    minAmount: '700,000', currency: 'AED', yieldPct: '10', horizon: '2-4', demo: true },
  { id: 'd3', title: 'Free Zone Company Setup', promoter: 'WellCome Dubai', kind: 'business', area: 'DMCC',
    minAmount: '35,000', currency: 'AED', horizon: '1', demo: true },
];

const KINDS = ['all', 'realestate', 'business', 'fund', 'other'] as const;
const KIND_COLOR: Record<string, string> = {
  realestate: TEAL, business: '#B8923A', fund: '#2A9D8F', other: '#6B7F8D',
};

export default function InvestmentsScreen() {
  const { t, isRTL } = useI18n();
  const [all, setAll] = useState<Opp[]>(DEMO);
  const [filter, setFilter] = useState<string>('all');
  const ta = (isRTL ? 'right' : 'left') as 'right' | 'left';
  const wd = (isRTL ? 'rtl' : 'ltr') as 'rtl' | 'ltr';

  useEffect(() => {
    let alive = true;
    fetch(`${RE_API}/api/investments`)
      .then(r => r.json())
      .then(j => { if (alive && j?.success && Array.isArray(j.data) && j.data.length) setAll(j.data); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  const list = useMemo(() => (filter === 'all' ? all : all.filter(o => o.kind === filter)), [all, filter]);
  // Paid projects get a full tile with a photo; free ones get a one-line strip below them.
  const paid = list.filter(o => o.featured);
  const free = list.filter(o => !o.featured);
  const imgOf = (o: Opp) => {
    const p = o.photos && o.photos[0];
    return p ? (p.startsWith('http') ? p : `${RE_API}${p}`) : FALLBACK;
  };

  return (
    <View style={s.container}>
      <ImageBackground source={{ uri: HERO }} resizeMode="cover" style={s.hero}>
        <View style={s.heroOverlay}>
          <SafeAreaView edges={['top']}>
            <View style={[s.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/realestate'))} style={s.back}>
                <Text style={s.backTxt}>{isRTL ? '›' : '‹'}</Text>
              </TouchableOpacity>
              <View style={{ flex: 1 }} />
            </View>
            <View style={s.heroText}>
              <Text style={s.kicker}>WELLCOME DUBAI · INVESTMENTS</Text>
              <Text style={[s.hTitle, { textAlign: 'center', writingDirection: wd }]}>{t('inv.title')}</Text>
            </View>
          </SafeAreaView>
        </View>
      </ImageBackground>

      {/* Filters */}
      <View style={s.filterWrap}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.filterRow}>
          {KINDS.map(k => (
            <TouchableOpacity key={k} onPress={() => setFilter(k)} style={[s.fChip, filter === k && s.fChipOn]}>
              <Text style={[s.fTxt, filter === k && s.fTxtOn]}>{t('inv.k.' + k)}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 96 }} showsVerticalScrollIndicator={false}>
        {list.length === 0 && <Text style={[s.empty, { textAlign: ta, writingDirection: wd }]}>{t('inv.none')}</Text>}

        {paid.map(o => (
          <View key={o.id} style={[s.card, s.cardPaid]}>
            <Image source={{ uri: imgOf(o) }} style={s.cardImg} resizeMode="cover" />
            <View style={[s.kindTag, { backgroundColor: KIND_COLOR[o.kind] || KIND_COLOR.other }, isRTL ? { right: 14 } : { left: 14 }]}>
              <Text style={s.kindTxt}>{t('inv.k.' + o.kind)}</Text>
            </View>
            {o.demo && (
              <View style={[s.demoTag, isRTL ? { left: 14 } : { right: 14 }]}>
                <Text style={s.demoTxt}>{t('inv.sample')}</Text>
              </View>
            )}
            <View style={s.body}>
              <Text style={[s.name, { textAlign: ta, writingDirection: wd }]} numberOfLines={2}>{o.title}</Text>
              <Text style={[s.promoter, { textAlign: ta, writingDirection: wd }]} numberOfLines={1}>
                {o.promoter}{o.area ? ' · ' + o.area : ''}
              </Text>
              <View style={[s.stats, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <Stat k={t('inv.min')} v={`${o.currency} ${o.minAmount}`} />
                {!!o.yieldPct && <Stat k={t('inv.yield')} v={`${o.yieldPct}%`} />}
                {!!o.horizon && <Stat k={t('inv.horizon')} v={`${o.horizon} ${t('inv.years')}`} />}
              </View>
            </View>
          </View>
        ))}

        {free.length > 0 && <Text style={[s.stripHead, { textAlign: ta, writingDirection: wd }]}>{t('inv.more')}</Text>}
        {free.map(o => (
          <View key={o.id} style={[s.strip, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
            <View style={[s.stripBar, { backgroundColor: KIND_COLOR[o.kind] || KIND_COLOR.other }]} />
            <View style={{ flex: 1 }}>
              <Text style={[s.stripName, { textAlign: ta, writingDirection: wd }]} numberOfLines={1}>{o.title}</Text>
              <Text style={[s.stripSub, { textAlign: ta, writingDirection: wd }]} numberOfLines={1}>
                {o.promoter}{o.area ? ' · ' + o.area : ''}
              </Text>
            </View>
            <Text style={s.stripAmount}>{o.currency} {o.minAmount}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Post a project — the board's whole point, so it stays on screen. */}
      <SafeAreaView edges={['bottom']} style={s.fabWrap}>
        <View style={[s.fabRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity style={[s.fab, { flex: 1 }]} activeOpacity={0.85} onPress={() => router.push('/submit-investment' as any)}>
            <Text style={s.fabTxt}>{t('inv.promoBtn')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.mineBtn} activeOpacity={0.85} onPress={() => router.push('/my-investments' as any)}>
            <Text style={s.mineTxt}>{t('mi.title')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </View>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <View>
      <Text style={s.statK}>{k}</Text>
      <Text style={s.statV}>{v}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },
  hero: { height: 180 },
  heroOverlay: { flex: 1, backgroundColor: 'rgba(22,34,44,0.6)' },
  header: { alignItems: 'center', paddingHorizontal: 6, height: 44 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: '#fff', fontSize: 34, lineHeight: 36, fontWeight: '300' },
  heroText: { paddingHorizontal: 24, paddingTop: 4 },
  kicker: { color: GOLD, fontSize: 11, fontWeight: '800', letterSpacing: 2.5, textAlign: 'center' },
  hTitle: { color: '#fff', fontSize: 28, fontWeight: '400', marginTop: 8, letterSpacing: 0.2 },

  filterWrap: { backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#E7E0D4' },
  filterRow: { gap: 8, paddingHorizontal: 14, paddingVertical: 11 },
  fChip: { paddingHorizontal: 14, height: 32, borderRadius: 4, borderWidth: 1, borderColor: '#E7E0D4', alignItems: 'center', justifyContent: 'center' },
  fChipOn: { backgroundColor: NAVY, borderColor: NAVY },
  fTxt: { color: '#7A7261', fontSize: 13.5, fontWeight: '600' },
  fTxtOn: { color: GOLD },

  empty: { color: '#A9A291', fontSize: 14, padding: 24 },

  card: { backgroundColor: '#fff', marginTop: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E7E0D4' },
  // The highlighted frame a paid listing is promised.
  cardPaid: { marginHorizontal: 10, borderWidth: 2, borderColor: GOLD, borderRadius: 8, overflow: 'hidden' },
  cardImg: { width: '100%', height: 170 },
  kindTag: { position: 'absolute', top: 14, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  kindTxt: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  demoTag: { position: 'absolute', top: 14, backgroundColor: 'rgba(22,34,44,0.75)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  demoTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },
  body: { padding: 16 },
  name: { color: NAVY, fontSize: 21, fontWeight: '400', letterSpacing: 0.2 },
  promoter: { color: '#8A8578', fontSize: 13, fontWeight: '500', marginTop: 4 },
  stats: { marginTop: 14, gap: 22 },
  statK: { color: '#A9A291', fontSize: 11, fontWeight: '600', letterSpacing: 0.4 },
  statV: { color: NAVY, fontSize: 17, fontWeight: '700', marginTop: 2 },

  stripHead: { color: '#A9A291', fontSize: 12, fontWeight: '700', letterSpacing: 0.4, paddingHorizontal: 16, paddingTop: 26, paddingBottom: 8 },
  strip: { backgroundColor: '#fff', alignItems: 'center', gap: 12, paddingHorizontal: 14, paddingVertical: 13, borderTopWidth: 1, borderColor: '#E7E0D4' },
  stripBar: { width: 3, alignSelf: 'stretch', borderRadius: 2 },
  stripName: { color: NAVY, fontSize: 15, fontWeight: '600' },
  stripSub: { color: '#8A8578', fontSize: 12.5, marginTop: 2 },
  stripAmount: { color: NAVY, fontSize: 13.5, fontWeight: '700' },

  fabWrap: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(245,241,234,0.96)', borderTopWidth: 1, borderColor: '#E7E0D4' },
  fabRow: { gap: 10, marginHorizontal: 16, marginVertical: 12 },
  fab: { backgroundColor: NAVY, borderRadius: 4, paddingVertical: 15, alignItems: 'center' },
  mineBtn: { borderWidth: 1.5, borderColor: NAVY, borderRadius: 4, paddingVertical: 15, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' },
  mineTxt: { color: NAVY, fontSize: 14, fontWeight: '700' },
  fabTxt: { color: GOLD, fontSize: 16, fontWeight: '700' },
});
