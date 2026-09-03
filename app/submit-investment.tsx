import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useI18n } from '../constants/i18n';
import { RE_API } from '../constants/realestate';

const NAVY = '#16222C', CREAM = '#F5F1EA', GOLD = '#E9C46A';

const KINDS = [
  { id: 'realestate', he: 'נדל"ן',            en: 'Real estate' },
  { id: 'business',   he: 'עסק / חברה',        en: 'Business' },
  { id: 'fund',       he: 'קרן / שותפות',      en: 'Fund' },
  { id: 'other',      he: 'אחר',               en: 'Other' },
];

export default function SubmitInvestmentScreen() {
  const { t, lang, isRTL } = useI18n();
  const he = lang === 'he';
  const ta = (isRTL ? 'right' : 'left') as 'right' | 'left';
  const wd = (isRTL ? 'rtl' : 'ltr') as 'rtl' | 'ltr';

  const [title, setTitle] = useState('');
  const [promoter, setPromoter] = useState('');
  const [kind, setKind] = useState('realestate');
  const [area, setArea] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [currency, setCurrency] = useState<'AED' | 'USD'>('AED');
  const [yieldPct, setYieldPct] = useState('');
  const [horizon, setHorizon] = useState('');
  const [desc, setDesc] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [video, setVideo] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);

  const pickPhotos = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.7, selectionLimit: 6 });
    if (!r.canceled) setPhotos(r.assets.map(a => a.uri));
  };
  const pickVideo = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, quality: 0.7 });
    if (!r.canceled && r.assets[0]) setVideo(r.assets[0].uri);
  };

  const say = (m: string) => (Platform.OS === 'web' ? alert(m) : Alert.alert(m));

  const submit = async () => {
    if (!title.trim() || !promoter.trim() || !minAmount.trim() || !phone.trim()) { say(t('si.missing')); return; }
    if (sending) return;
    setSending(true);
    try {
      const fd = new FormData();
      Object.entries({ title, promoter, kind, area, minAmount, currency, yieldPct, horizon, desc, contactPhone: phone, contactEmail: email })
        .forEach(([k, v]) => fd.append(k, String(v)));
      photos.forEach((uri, i) => fd.append('photos', { uri, name: `photo_${i}.jpg`, type: 'image/jpeg' } as any));
      if (video) fd.append('video', { uri: video, name: 'video.mp4', type: 'video/mp4' } as any);
      const r = await fetch(`${RE_API}/api/investments`, { method: 'POST', body: fd as any });
      const j = await r.json();
      if (j && j.success) {
        // Keep the owner token on the device so the promoter can manage this ad later.
        if (j.id && j.delToken) {
          const raw = await AsyncStorage.getItem('@myInvestments');
          const mine = raw ? JSON.parse(raw) : [];
          await AsyncStorage.setItem('@myInvestments', JSON.stringify([{ id: j.id, token: j.delToken, title }, ...mine]));
        }
        setDone(true);
      } else say(t('si.err'));
    } catch { say(t('si.err')); }
    finally { setSending(false); }
  };

  if (done) {
    return (
      <SafeAreaView style={s.safe}>
        <View style={s.doneWrap}>
          <Text style={s.doneMark}>✓</Text>
          <Text style={[s.doneTitle, { writingDirection: wd }]}>{t('si.doneTitle')}</Text>
          <Text style={[s.doneSub, { writingDirection: wd }]}>{t('si.doneSub')}</Text>
          <TouchableOpacity style={s.doneBtn} onPress={() => router.replace('/my-investments' as any)}>
            <Text style={s.doneBtnTxt}>{t('si.manage')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ paddingVertical: 14 }} onPress={() => router.replace('/investments' as any)}>
            <Text style={{ color: '#8A8578', fontSize: 14, fontWeight: '600' }}>{t('si.back')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <View style={[s.header, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <TouchableOpacity onPress={() => (router.canGoBack() ? router.back() : router.replace('/investments' as any))} style={s.back}>
          <Text style={s.backTxt}>{isRTL ? '›' : '‹'}</Text>
        </TouchableOpacity>
        <Text style={[s.hTitle, { flex: 1, textAlign: ta, writingDirection: wd }]}>{t('si.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 60 }} keyboardShouldPersistTaps="handled">
        <Text style={[s.intro, { textAlign: ta, writingDirection: wd }]}>{t('si.intro')}</Text>

        <Field label={t('si.name')} value={title} onChange={setTitle} placeholder="Marina Heights · Off-Plan" ta={ta} wd={wd} />
        <Field label={t('si.promoter')} value={promoter} onChange={setPromoter} placeholder="Emaar" ta={ta} wd={wd} />

        <Text style={[s.label, { textAlign: ta, writingDirection: wd }]}>{t('si.kind')}</Text>
        <View style={[s.chips, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          {KINDS.map(k => (
            <TouchableOpacity key={k.id} onPress={() => setKind(k.id)} style={[s.chip, kind === k.id && s.chipOn]}>
              <Text style={[s.chipTxt, kind === k.id && s.chipTxtOn]}>{he ? k.he : k.en}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Field label={t('si.area')} value={area} onChange={setArea} placeholder="Dubai Marina, JVC, DMCC..." ta={ta} wd={wd} />

        <Text style={[s.label, { textAlign: ta, writingDirection: wd }]}>{t('si.min')}</Text>
        <View style={[s.amountRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TextInput value={minAmount} onChangeText={x => setMinAmount(x.replace(/[^\d]/g, ''))} keyboardType="numeric"
            placeholder="750000" placeholderTextColor="#9CA3AF" style={[s.input, { flex: 1, textAlign: ta }]} />
          {(['AED', 'USD'] as const).map(c => (
            <TouchableOpacity key={c} onPress={() => setCurrency(c)} style={[s.curBtn, currency === c && s.curBtnOn]}>
              <Text style={[s.curTxt, currency === c && s.curTxtOn]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Field label={t('si.yield')} value={yieldPct} onChange={setYieldPct} placeholder="9" keyboard="numeric" ta={ta} wd={wd} />
        <Field label={t('si.horizon')} value={horizon} onChange={setHorizon} placeholder="3-5" ta={ta} wd={wd} />

        <Text style={[s.label, { textAlign: ta, writingDirection: wd }]}>{t('si.desc')}</Text>
        <TextInput value={desc} onChangeText={setDesc} multiline numberOfLines={5}
          placeholder={t('si.descPh')} placeholderTextColor="#9CA3AF"
          style={[s.input, { height: 110, textAlignVertical: 'top', textAlign: ta, writingDirection: wd }]} />

        <Text style={[s.sec, { textAlign: ta, writingDirection: wd }]}>{t('si.media')}</Text>
        <View style={[s.mediaRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <TouchableOpacity style={s.mediaBtn} activeOpacity={0.85} onPress={pickPhotos}>
            <Text style={s.mediaTxt}>{photos.length ? `${t('si.photos')} (${photos.length})` : t('si.photos')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.mediaBtn} activeOpacity={0.85} onPress={pickVideo}>
            <Text style={s.mediaTxt}>{video ? `${t('si.video')} ✓` : t('si.video')}</Text>
          </TouchableOpacity>
        </View>
        {photos.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 10 }}>
            {photos.map(u => <Image key={u} source={{ uri: u }} style={s.thumb} />)}
          </ScrollView>
        )}
        <Text style={[s.mediaNote, { textAlign: ta, writingDirection: wd }]}>{t('si.mediaNote')}</Text>
        <View style={s.planBox}>
          <Text style={[s.planTitle, { textAlign: ta, writingDirection: wd }]}>{t('si.planTitle')}</Text>
          <Text style={[s.planLine, { textAlign: ta, writingDirection: wd }]}>{t('si.planFree')}</Text>
          <Text style={[s.planLine, { textAlign: ta, writingDirection: wd }]}>{t('si.planPaid')}</Text>
        </View>

        <Text style={[s.sec, { textAlign: ta, writingDirection: wd }]}>{t('si.contact')}</Text>
        <Field label={t('si.phone')} value={phone} onChange={setPhone} placeholder="+971..." keyboard="phone-pad" ta={ta} wd={wd} />
        <Field label={t('si.email')} value={email} onChange={setEmail} placeholder="email@example.com" keyboard="email-address" ta={ta} wd={wd} />

        <TouchableOpacity style={[s.submit, sending && { opacity: 0.6 }]} disabled={sending} activeOpacity={0.85} onPress={submit}>
          <Text style={s.submitTxt}>{t('si.submit')}</Text>
        </TouchableOpacity>
        <Text style={[s.note, { textAlign: ta, writingDirection: wd }]}>{t('si.note')}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Field({ label, value, onChange, placeholder, keyboard, ta, wd }: any) {
  return (
    <>
      <Text style={[s.label, { textAlign: ta, writingDirection: wd }]}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#9CA3AF"
        keyboardType={keyboard || 'default'} style={[s.input, { textAlign: ta, writingDirection: wd }]} />
    </>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: CREAM },
  header: { alignItems: 'center', paddingHorizontal: 6, paddingVertical: 8, backgroundColor: NAVY },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backTxt: { color: '#fff', fontSize: 32, lineHeight: 34, fontWeight: '300' },
  hTitle: { color: '#fff', fontSize: 19, fontWeight: '400' },
  intro: { color: '#5C6B75', fontSize: 13.5, lineHeight: 20, marginBottom: 16 },
  label: { color: '#A9A291', fontSize: 12, fontWeight: '700', marginTop: 14, marginBottom: 5 },
  input: { backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E7E0D4', borderRadius: 4, paddingVertical: 11, paddingHorizontal: 12, fontSize: 15, color: NAVY },
  chips: { gap: 8, flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, height: 34, borderRadius: 4, borderWidth: 1, borderColor: '#E7E0D4', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  chipOn: { backgroundColor: NAVY, borderColor: NAVY },
  chipTxt: { color: '#7A7261', fontSize: 13.5, fontWeight: '600' },
  chipTxtOn: { color: GOLD },
  amountRow: { gap: 8, alignItems: 'center' },
  curBtn: { paddingHorizontal: 14, height: 44, borderRadius: 4, borderWidth: 1, borderColor: '#E7E0D4', backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  curBtnOn: { backgroundColor: NAVY, borderColor: NAVY },
  curTxt: { color: '#7A7261', fontSize: 13, fontWeight: '700' },
  curTxtOn: { color: GOLD },
  sec: { color: NAVY, fontSize: 17, fontWeight: '400', marginTop: 26 },
  submit: { backgroundColor: GOLD, borderRadius: 4, paddingVertical: 15, alignItems: 'center', marginTop: 26 },
  submitTxt: { color: NAVY, fontSize: 16, fontWeight: '700' },
  note: { color: '#A9A291', fontSize: 11.5, lineHeight: 17, marginTop: 14 },

  mediaRow: { gap: 10, marginTop: 8 },
  mediaBtn: { flex: 1, borderWidth: 1.5, borderColor: '#E7E0D4', borderRadius: 4, backgroundColor: '#fff', paddingVertical: 13, alignItems: 'center' },
  mediaTxt: { color: NAVY, fontSize: 14, fontWeight: '600' },
  thumb: { width: 74, height: 74, borderRadius: 4, backgroundColor: '#E7E0D4' },
  mediaNote: { color: '#A9A291', fontSize: 11.5, lineHeight: 17, marginTop: 9 },

  planBox: { backgroundColor: '#FCF7EC', borderWidth: 1, borderColor: '#E7E0D4', borderRadius: 6, padding: 14, marginTop: 14 },
  planTitle: { color: NAVY, fontSize: 14, fontWeight: '700', marginBottom: 7 },
  planLine: { color: '#5C6B75', fontSize: 13, lineHeight: 20 },

  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  doneMark: { fontSize: 64, color: '#2E9E6B' },
  doneTitle: { color: NAVY, fontSize: 22, fontWeight: '600', marginTop: 12, textAlign: 'center' },
  doneSub: { color: '#8A8578', fontSize: 14, lineHeight: 21, marginTop: 8, textAlign: 'center' },
  doneBtn: { backgroundColor: NAVY, borderRadius: 4, paddingVertical: 13, paddingHorizontal: 30, marginTop: 26 },
  doneBtnTxt: { color: GOLD, fontSize: 15, fontWeight: '700' },
});
