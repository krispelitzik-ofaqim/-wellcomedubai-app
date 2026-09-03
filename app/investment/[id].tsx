import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, TextInput, Dimensions, Linking, Alert, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Video, ResizeMode } from 'expo-av';
import { FontAwesome5 } from '@expo/vector-icons';
import { useI18n } from '../../constants/i18n';
import { RE_API } from '../../constants/realestate';
import { DEMO_INVESTMENTS, type Opp } from '../../constants/investmentsDemo';

const NAVY = '#16222C', CREAM = '#F5F1EA', GOLD = '#E9C46A', TEAL = '#1A6B8A';
const FALLBACK = 'https://wellcomedubai.com/images/Yizhak/economy-uae-currency.jpg';
const AED_PER_USD = 3.6725;

const KIND_COLOR: Record<string, string> = {
  realestate: TEAL, business: '#B8923A', fund: '#2A9D8F', other: '#6B7F8D',
};

// The promoter's own channels, shown as a row of brand-coloured buttons.
const CHANNELS: { key: keyof Opp; icon: string; brand: string; label: string; href: (v: string) => string }[] = [
  { key: 'whatsapp',  icon: 'whatsapp',  brand: '#25D366', label: 'WhatsApp',  href: v => `https://wa.me/${v.replace(/\D/g, '')}` },
  { key: 'facebook',  icon: 'facebook-f', brand: '#1877F2', label: 'Facebook',  href: v => (v.startsWith('http') ? v : `https://facebook.com/${v.replace(/^@/, '')}`) },
  { key: 'instagram', icon: 'instagram', brand: '#E1306C', label: 'Instagram', href: v => (v.startsWith('http') ? v : `https://instagram.com/${v.replace(/^@/, '')}`) },
  { key: 'website',   icon: 'globe',     brand: '#1A6B8A', label: 'Website',   href: v => (v.startsWith('http') ? v : `https://${v}`) },
];

export default function InvestmentDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, isRTL } = useI18n();
  const [item, setItem] = useState<Opp | null>(null);
  const [loading, setLoading] = useState(true);
  const [shot, setShot] = useState(0);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [note, setNote] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const W = Dimensions.get('window').width;

  const ta = (isRTL ? 'right' : 'left') as 'right' | 'left';
  const wd = (isRTL ? 'rtl' : 'ltr') as 'rtl' | 'ltr';
  const say = (m: string) => (Platform.OS === 'web' ? alert(m) : Alert.alert(m));

  useEffect(() => {
    // A sample listing has no server record — render it from the bundled copy.
    const demo = DEMO_INVESTMENTS.find(d => d.id === id);
    if (demo) { setItem(demo); setLoading(false); return; }
    let alive = true;
    fetch(`${RE_API}/api/investments/view/${id}`)
      .then(r => r.json())
      .then(j => { if (alive) { if (j?.success) setItem(j.data); setLoading(false); } })
      .catch(() => alive && setLoading(false));
    return () => { alive = false; };
  }, [id]);

  const url = (p: string) => (p.startsWith('http') ? p : `${RE_API}${p}`);

  const send = async () => {
    if (item?.demo) { say(t('inv.sampleNote')); return; }
    if (!name.trim() || !phone.trim()) { say(t('id.missing')); return; }
    if (sending) return;
    setSending(true);
    try {
      const r = await fetch(`${RE_API}/api/investments/${id}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, note }),
      });
      const j = await r.json();
      if (j?.success) setSent(true); else say(t('id.err'));
    } catch { say(t('id.err')); }
    finally { setSending(false); }
  };

  if (loading) {
    return (
      <SafeAreaView style={s.safe}><View style={s.center}><ActivityIndicator color={NAVY} /></View></SafeAreaView>
    );
  }
  if (!item) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.center}>
          <Text style={[s.gone, { writingDirection: wd }]}>{t('id.gone')}</Text>
          <TouchableOpacity style={s.backBtn} onPress={() => router.replace('/investments' as any)}>
            <Text style={s.backBtnTxt}>{t('id.back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const photos = item.photos || [];
  const usd = item.currency === 'USD'
    ? Number(String(item.minAmount).replace(/[^\d.]/g, ''))
    : Math.round(Number(String(item.minAmount).replace(/[^\d.]/g, '')) / AED_PER_USD);
  const kc = KIND_COLOR[item.kind] || KIND_COLOR.other;

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        {/* Photos — a swipeable strip when the promoter uploaded more than one. */}
        <View>
          {photos.length > 0 ? (
            <ScrollView
              horizontal pagingEnabled showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={e => setShot(Math.round(e.nativeEvent.contentOffset.x / W))}
            >
              {photos.map(p => <Image key={p} source={{ uri: url(p) }} style={{ width: W, height: 260 }} resizeMode="cover" />)}
            </ScrollView>
          ) : (
            <Image source={{ uri: FALLBACK }} style={{ width: W, height: 260 }} resizeMode="cover" />
          )}

          <SafeAreaView edges={['top']} style={s.topBar}>
            <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/investments' as any))} style={s.back}>
              <Text style={s.backTxt}>{isRTL ? '›' : '‹'}</Text>
            </TouchableOpacity>
          </SafeAreaView>

          <View style={[s.kindTag, { backgroundColor: kc }, isRTL ? { right: 14 } : { left: 14 }]}>
            <Text style={s.kindTxt}>{t('inv.k.' + item.kind)}</Text>
          </View>
          {item.demo && (
            <View style={[s.demoTag, isRTL ? { left: 14 } : { right: 14 }]}>
              <Text style={s.demoTxt}>{t('inv.sample')}</Text>
            </View>
          )}

          {photos.length > 1 && (
            <View style={s.dots}>
              {photos.map((_, i) => <View key={i} style={[s.dot, i === shot && s.dotOn]} />)}
            </View>
          )}
        </View>

        <View style={s.head}>
          <Text style={[s.title, { textAlign: ta, writingDirection: wd }]}>{item.title}</Text>
          <Text style={[s.promoter, { textAlign: ta, writingDirection: wd }]}>
            {item.promoter}{item.area ? ' · ' + item.area : ''}
          </Text>
        </View>

        {/* Everything the promoter filled in */}
        <View style={s.facts}>
          <Fact k={t('inv.min')} v={`${item.currency} ${item.minAmount}`} sub={item.currency === 'AED' ? `≈ $${usd.toLocaleString('en-US')}` : undefined} ta={ta} isRTL={isRTL} />
          {!!item.yieldPct && <Fact k={t('id.yieldFull')} v={`${item.yieldPct}%`} ta={ta} isRTL={isRTL} />}
          {!!item.horizon && <Fact k={t('inv.horizon')} v={`${item.horizon} ${t('inv.years')}`} ta={ta} isRTL={isRTL} />}
          {!!item.area && <Fact k={t('id.area')} v={item.area} ta={ta} isRTL={isRTL} />}
          <Fact k={t('id.type')} v={t('inv.k.' + item.kind)} ta={ta} isRTL={isRTL} />
          {!!item.createdAt && <Fact k={t('id.published')} v={new Date(item.createdAt).toLocaleDateString('he-IL')} ta={ta} isRTL={isRTL} last />}
        </View>

        {!!item.desc && (
          <View style={s.block}>
            <Text style={[s.blockTitle, { textAlign: ta, writingDirection: wd }]}>{t('id.about')}</Text>
            <Text style={[s.desc, { textAlign: ta, writingDirection: wd }]}>{item.desc}</Text>
          </View>
        )}

        {/* Video, or where it will sit once the promoter uploads one. */}
        {(!!item.video || item.featured) && (
          <View style={s.block}>
            <Text style={[s.blockTitle, { textAlign: ta, writingDirection: wd }]}>{t('id.video')}</Text>
            {item.video ? (
              <Video
                source={{ uri: url(item.video) }}
                style={{ width: '100%', height: 200, borderRadius: 6, backgroundColor: '#000' }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
              />
            ) : (
              <View style={s.videoEmpty}>
                <FontAwesome5 name="play" size={22} color="#fff" solid />
                <Text style={[s.videoEmptyTxt, { writingDirection: wd }]}>{t('id.videoEmpty')}</Text>
              </View>
            )}
          </View>
        )}

        {/* Promoter's channels */}
        {CHANNELS.some(c => !!(item as any)[c.key]) && (
          <View style={s.block}>
            <Text style={[s.blockTitle, { textAlign: ta, writingDirection: wd }]}>{t('id.channels')}</Text>
            <View style={[s.chRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              {CHANNELS.filter(c => !!(item as any)[c.key]).map(c => (
                <TouchableOpacity
                  key={c.key as string}
                  style={[s.chBtn, { backgroundColor: c.brand }]}
                  activeOpacity={0.85}
                  onPress={() => (item.demo
                    ? say(t('inv.sampleNote'))
                    : Linking.openURL(c.href(String((item as any)[c.key]))).catch(() => {}))}
                >
                  <FontAwesome5 name={c.icon as any} size={20} color="#fff" solid={c.icon === 'globe'} />
                  <Text style={s.chTxt}>{c.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {!!item.brochure && (
          <TouchableOpacity style={s.brochure} activeOpacity={0.85} onPress={() => Linking.openURL(url(item.brochure as string)).catch(() => {})}>
            <Text style={s.brochureTxt}>{t('id.brochure')}</Text>
          </TouchableOpacity>
        )}

        {/* Enquiry — relayed through us, the promoter's number is never shown. */}
        <View style={s.form}>
          {sent ? (
            <>
              <Text style={s.sentMark}>✓</Text>
              <Text style={[s.sentTitle, { writingDirection: wd }]}>{t('id.sentTitle')}</Text>
              <Text style={[s.sentSub, { writingDirection: wd }]}>{t('id.sentSub')}</Text>
            </>
          ) : (
            <>
              <Text style={[s.formTitle, { textAlign: ta, writingDirection: wd }]}>{t('id.formTitle')}</Text>
              <Text style={[s.formSub, { textAlign: ta, writingDirection: wd }]}>{t('id.formSub')}</Text>
              <TextInput value={name} onChangeText={setName} placeholder={t('id.name')} placeholderTextColor="#9CA3AF"
                style={[s.input, { textAlign: ta, writingDirection: wd }]} />
              <TextInput value={phone} onChangeText={setPhone} placeholder={t('id.phone')} placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad" style={[s.input, { textAlign: ta }]} />
              <TextInput value={note} onChangeText={setNote} placeholder={t('id.note')} placeholderTextColor="#9CA3AF"
                multiline style={[s.input, { height: 84, textAlignVertical: 'top', textAlign: ta, writingDirection: wd }]} />
              <TouchableOpacity style={[s.send, sending && { opacity: 0.6 }]} disabled={sending} activeOpacity={0.85} onPress={send}>
                <Text style={s.sendTxt}>{t('id.send')}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        <Text style={[s.note, { textAlign: ta, writingDirection: wd }]}>{t('id.disclaimer')}</Text>
      </ScrollView>
    </View>
  );
}

function Fact({ k, v, sub, ta, isRTL, last }: any) {
  return (
    <View style={[s.fact, last && { borderBottomWidth: 0 }, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <Text style={[s.factK, { textAlign: ta }]}>{k}</Text>
      <View style={{ alignItems: isRTL ? 'flex-start' : 'flex-end' }}>
        <Text style={s.factV}>{v}</Text>
        {!!sub && <Text style={s.factSub}>{sub}</Text>}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: CREAM },
  safe: { flex: 1, backgroundColor: CREAM },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  gone: { color: '#8A8578', fontSize: 15, textAlign: 'center' },
  backBtn: { backgroundColor: NAVY, borderRadius: 4, paddingVertical: 12, paddingHorizontal: 26, marginTop: 20 },
  backBtnTxt: { color: GOLD, fontSize: 15, fontWeight: '700' },

  topBar: { position: 'absolute', top: 0, left: 0, right: 0 },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', margin: 4, borderRadius: 22, backgroundColor: 'rgba(22,34,44,0.45)' },
  backTxt: { color: '#fff', fontSize: 30, lineHeight: 32, fontWeight: '300' },
  kindTag: { position: 'absolute', bottom: 14, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  kindTxt: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  demoTag: { position: 'absolute', bottom: 14, backgroundColor: 'rgba(22,34,44,0.78)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 4 },
  demoTxt: { color: '#fff', fontSize: 11, fontWeight: '700' },
  dots: { position: 'absolute', bottom: 14, alignSelf: 'center', flexDirection: 'row', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotOn: { backgroundColor: '#fff' },

  head: { paddingHorizontal: 18, paddingTop: 18 },
  title: { color: NAVY, fontSize: 25, fontWeight: '400', letterSpacing: 0.2, lineHeight: 33 },
  promoter: { color: '#8A8578', fontSize: 14, fontWeight: '500', marginTop: 6 },

  facts: { backgroundColor: '#fff', marginTop: 18, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#E7E0D4' },
  fact: { paddingHorizontal: 18, paddingVertical: 13, borderBottomWidth: 1, borderColor: '#F1EDE5', alignItems: 'center', justifyContent: 'space-between' },
  factK: { color: '#A9A291', fontSize: 13, fontWeight: '600' },
  factV: { color: NAVY, fontSize: 16, fontWeight: '700' },
  factSub: { color: '#A9A291', fontSize: 11.5, marginTop: 2 },

  block: { paddingHorizontal: 18, paddingTop: 24 },
  blockTitle: { color: NAVY, fontSize: 18, fontWeight: '400', marginBottom: 10 },
  desc: { color: '#5C6B75', fontSize: 14.5, lineHeight: 23 },

  chRow: { gap: 10, flexWrap: 'wrap' },
  chBtn: { flexGrow: 1, minWidth: 92, borderRadius: 6, paddingVertical: 14, alignItems: 'center', gap: 7,
           shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 2 },
  chTxt: { color: '#fff', fontSize: 12.5, fontWeight: '700', letterSpacing: 0.3 },

  videoEmpty: { height: 180, borderRadius: 6, backgroundColor: '#2A3947', alignItems: 'center', justifyContent: 'center', gap: 10,
                borderWidth: 1, borderColor: '#3C4C5B', borderStyle: 'dashed' },
  videoEmptyTxt: { color: 'rgba(255,255,255,0.72)', fontSize: 13, fontWeight: '600', textAlign: 'center', paddingHorizontal: 24 },

  brochure: { marginHorizontal: 18, marginTop: 20, borderWidth: 1.5, borderColor: '#E7E0D4', backgroundColor: '#fff', borderRadius: 4, paddingVertical: 13, alignItems: 'center' },
  brochureTxt: { color: NAVY, fontSize: 14.5, fontWeight: '700' },

  form: { backgroundColor: NAVY, marginTop: 28, padding: 22 },
  formTitle: { color: '#fff', fontSize: 20, fontWeight: '400' },
  formSub: { color: 'rgba(255,255,255,0.72)', fontSize: 13.5, lineHeight: 20, marginTop: 7, marginBottom: 14 },
  input: { backgroundColor: '#fff', borderRadius: 4, paddingVertical: 12, paddingHorizontal: 13, fontSize: 15, color: NAVY, marginBottom: 10 },
  send: { backgroundColor: GOLD, borderRadius: 4, paddingVertical: 14, alignItems: 'center', marginTop: 6 },
  sendTxt: { color: NAVY, fontSize: 16, fontWeight: '700' },
  sentMark: { color: '#7FE0B0', fontSize: 46, textAlign: 'center' },
  sentTitle: { color: '#fff', fontSize: 19, fontWeight: '600', textAlign: 'center', marginTop: 8 },
  sentSub: { color: 'rgba(255,255,255,0.72)', fontSize: 13.5, lineHeight: 20, textAlign: 'center', marginTop: 6 },

  note: { color: '#A9A291', fontSize: 11.5, lineHeight: 17, paddingHorizontal: 18, paddingTop: 20 },
});
