import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, FlatList, Dimensions, NativeSyntheticEvent, NativeScrollEvent, Alert, Modal, Pressable } from 'react-native';
import { openMapsChoice } from '../utils/maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from '../components/WebView';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { GUIDED_AUDIO } from '../data/guided-narration';
import { STOPS_AUDIO } from '../data/stops-narration';
import { Colors } from '../constants/colors';
import { useI18n } from '../constants/i18n';
import { tcRu } from '../constants/contentRu';
import { tcHi } from '../constants/contentHi';
import { tcAr } from '../constants/contentAr';
import { ITINERARIES } from '../data/itineraries';
import { STAR_HUBS, type StarHub } from '../data/star-hubs';
import { CATALOG } from '../data/catalog';
import { getFavorites, toggleFavorite } from '../utils/favorites';
import HOTEL_PHOTOS from '../data/hotel-photos.json';
import ATTRACTION_PHOTOS from '../data/attraction-photos.json';
import RESTAURANT_PHOTOS from '../data/restaurant-places-photos.json';
import KIDS_PHOTOS from '../data/kids-photos.json';
import NIGHTLIFE_PHOTOS from '../data/nightlife-photos.json';
import SHOPPING_PHOTOS from '../data/shopping-photos.json';
import TRANSPORT_PHOTOS from '../data/transport-photos.json';
import CASINO_PHOTOS from '../data/casino-photos.json';
import ABUDHABI_PHOTOS from '../data/abudhabi-photos.json';

const PHOTOS_BY_CAT_MT: Record<string, any> = {
  hotels: HOTEL_PHOTOS, attractions: ATTRACTION_PHOTOS, restaurants: RESTAURANT_PHOTOS,
  kids: KIDS_PHOTOS, nightlife: NIGHTLIFE_PHOTOS, shopping: SHOPPING_PHOTOS,
  transport: TRANSPORT_PHOTOS, casino: CASINO_PHOTOS, abudhabi: ABUDHABI_PHOTOS,
};

// Hebrew narration via the device's built-in Hebrew voice (Carmit) — no API key, real Hebrew.
function HebrewTTS({ text, color }: { text: string; color: string }) {
  const [playing, setPlaying] = useState(false);
  const voiceRef = useRef<string | undefined>(undefined);
  useEffect(() => {
    (async () => {
      try {
        const vs: any[] = await Speech.getAvailableVoicesAsync();
        const he = vs.find(v => (v.language || '').toLowerCase().startsWith('he'));
        voiceRef.current = he?.identifier;
      } catch {}
    })();
    return () => { Speech.stop(); };
  }, []);
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  const toggle = async () => {
    if (playing) { Speech.stop(); setPlaying(false); return; }
    if (!voiceRef.current) {
      try { const vs: any[] = await Speech.getAvailableVoicesAsync(); voiceRef.current = vs.find(v => (v.language || '').toLowerCase().startsWith('he'))?.identifier; } catch {}
    }
    setPlaying(true);
    Speech.speak(clean, { language: 'he-IL', voice: voiceRef.current, onDone: () => setPlaying(false), onStopped: () => setPlaying(false), onError: () => setPlaying(false) });
  };
  return (
    <TouchableOpacity onPress={toggle} activeOpacity={0.7} style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginTop: 10 }}>
      <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{playing ? '❚❚' : '▶'}</Text>
      </View>
      <Text style={{ color, fontSize: 13, fontWeight: '700' }}>{playing ? 'מנגן…' : 'האזן לתחנה'}</Text>
    </TouchableOpacity>
  );
}

// Minimal audio player for guided-tour stops (pre-rendered ElevenLabs narration per language).
function StopAudio({ source, color }: { source: any; color: string }) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [playing, setPlaying] = useState(false);
  const [pos, setPos] = useState(0);
  const [dur, setDur] = useState(0);
  useEffect(() => {
    let mounted = true;
    (async () => {
      try { await Audio.setAudioModeAsync({ playsInSilentModeIOS: true, shouldDuckAndroid: true }); } catch {}
      const { sound } = await Audio.Sound.createAsync(source, { shouldPlay: false });
      if (!mounted) { sound.unloadAsync(); return; }
      soundRef.current = sound;
      sound.setOnPlaybackStatusUpdate((st: any) => {
        if (!st.isLoaded) return;
        setDur(st.durationMillis || 0); setPos(st.positionMillis || 0); setPlaying(!!st.isPlaying);
        if (st.didJustFinish) { setPlaying(false); sound.setPositionAsync(0); }
      });
    })();
    return () => { mounted = false; soundRef.current?.unloadAsync(); };
  }, [source]);
  const [speed, setSpeed] = useState<1 | 1.5 | 2>(1);
  const toggle = async () => {
    const s = soundRef.current; if (!s) return;
    const st: any = await s.getStatusAsync(); if (!st.isLoaded) return;
    if (st.isPlaying) await s.pauseAsync();
    else { if (st.positionMillis >= (st.durationMillis || 0) - 200) await s.setPositionAsync(0); await s.playAsync(); }
  };
  const setSp = async (sp: 1 | 1.5 | 2) => { setSpeed(sp); try { await soundRef.current?.setRateAsync(sp, true); } catch {} };
  const pct = dur ? (pos / dur) * 100 : 0;
  return (
    <View style={{ marginTop: 10 }}>
      <TouchableOpacity onPress={toggle} activeOpacity={0.7} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: color, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>{playing ? '❚❚' : '▶'}</Text>
        </View>
        <View style={{ flex: 1, height: 4, backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 2 }}>
          <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 2 }} />
        </View>
      </TouchableOpacity>
      <View style={{ flexDirection: 'row', gap: 6, marginTop: 6 }}>
        {([1, 1.5, 2] as const).map(sp => (
          <TouchableOpacity key={sp} onPress={() => setSp(sp)} style={{ paddingHorizontal: 9, paddingVertical: 3, borderRadius: 6, backgroundColor: speed === sp ? color : 'rgba(0,0,0,0.06)' }}>
            <Text style={{ fontSize: 12, fontWeight: '800', color: speed === sp ? '#fff' : '#666' }}>x{sp}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

function thumbUrl(cat: string, id: any, fallback: string): string {
  const entry = PHOTOS_BY_CAT_MT[cat]?.[String(id)];
  const first = entry?.photos?.[0]?.name;
  if (first) return `https://places.googleapis.com/v1/${first}/media?key=AIzaSyDVYlYuM6saMxbhi2aKNCtiv6J8mR8LLgw&maxWidthPx=400`;
  if (fallback?.startsWith('http')) return fallback;
  if (fallback) return 'https://wellcomedubai.com/' + fallback;
  return '';
}

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

const SUGGESTED_TIMES = ['09:00', '11:30', '14:00', '16:30', '19:00', '21:00', '22:30'];

const DAY_BACKGROUNDS = ['#FAF6EE', '#FBF3F4', '#F0F7F4', '#F9F2DD', '#FCF1ED', '#F0F0F8', '#F4F8F0'];
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';

const MYTRIP_DAYS_KEY = 'mytrip_days_v1';
const MYTRIP_START_KEY = 'mytrip_start_v1';
const MYTRIP_ORDER_KEY = 'mytrip_order_v1';

const HEB_DAYS = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
const EN_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const HEB_MONTHS_SHORT = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יוני', 'יולי', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];
const EN_MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const dayName = (dow: number, lang: string) => lang === 'ar' ? tcAr(HEB_DAYS[dow]) : lang === 'hi' ? tcHi(HEB_DAYS[dow]) : lang === 'ru' ? tcRu(HEB_DAYS[dow]) : (lang === 'en' ? EN_DAYS : HEB_DAYS)[dow];
const monthShort = (m: number, lang: string) => lang === 'ar' ? tcAr(HEB_MONTHS_SHORT[m]) : lang === 'hi' ? tcHi(HEB_MONTHS_SHORT[m]) : lang === 'ru' ? tcRu(HEB_MONTHS_SHORT[m]) : (lang === 'en' ? EN_MONTHS_SHORT : HEB_MONTHS_SHORT)[m];

function formatDayDate(startDate: Date | null, dayNum: number, lang: string = 'he') {
  if (!startDate) return `${lang === 'ar' ? tcAr('יום') : lang === 'hi' ? tcHi('יום') : lang === 'ru' ? tcRu('יום') : lang === 'en' ? 'Day' : 'יום'} ${dayNum}`;
  const d = new Date(startDate);
  d.setDate(d.getDate() + (dayNum - 1));
  return `${dayName(d.getDay(), lang)} ${d.getDate()}/${d.getMonth() + 1}`;
}
const CAT_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  hotels:      { label: 'מלון',      icon: '🏨', color: Colors.GOLD },
  restaurants: { label: 'מסעדה',     icon: '🍽️', color: Colors.WARM },
  attractions: { label: 'אטרקציה',   icon: '🎡', color: Colors.SECONDARY },
  shopping:    { label: 'קניות',     icon: '🛍️', color: Colors.WARM },
  nightlife:   { label: 'בילוי',     icon: '🍻', color: Colors.PINK },
  kids:        { label: 'ילדים',     icon: '👨‍👩‍👧', color: Colors.ACCENT },
  transport:   { label: 'תחבורה',    icon: '🚕', color: Colors.PRIMARY },
  casino:      { label: 'בידור',     icon: '🎰', color: Colors.GOLD },
  abudhabi:    { label: 'אבו דאבי',  icon: '🏛', color: Colors.PINK },
};

// A stable id for this install, so a device counts once per tour however many
// times it changes its mind.
async function deviceId(): Promise<string> {
  let id = await AsyncStorage.getItem('@deviceId');
  if (!id) {
    id = Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
    await AsyncStorage.setItem('@deviceId', id);
  }
  return id;
}

function RateRow({ storageKey, color }: { storageKey: string; color: string }) {
  const { t } = useI18n();
  const [rate, setRate] = useState(0);
  const [avg, setAvg] = useState<{ avg: number; count: number } | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(storageKey).then(v => v && setRate(parseInt(v, 10)));
    fetch(`${ALBUM_API}/api/ratings?key=${encodeURIComponent(storageKey)}`)
      .then(r => r.json())
      .then(j => { if (j?.success) setAvg({ avg: j.avg, count: j.count }); })
      .catch(() => {});
  }, [storageKey]);

  const pick = async (n: number) => {
    setRate(n);
    AsyncStorage.setItem(storageKey, String(n));
    try {
      const device = await deviceId();
      const r = await fetch(`${ALBUM_API}/api/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: storageKey, device, value: n }),
      });
      const j = await r.json();
      if (j?.success) setAvg({ avg: j.avg, count: j.count });
    } catch {}
  };

  return (
    <View style={s.rateBox}>
      <Text style={s.rateLabel}>{t('itin.rate')}</Text>
      <View style={s.rateStars}>
        {[5, 4, 3, 2, 1].map(n => (
          <TouchableOpacity key={n} onPress={() => pick(n)}>
            <Text style={[s.rateStar, n <= rate && { color }]}>{n <= rate ? '★' : '☆'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {avg && avg.count > 0 ? (
        <Text style={[s.rateAvg, { color }]}>★ {avg.avg} · {avg.count} {t('itin.raters')}</Text>
      ) : null}
      {rate > 0 ? <Text style={[s.rateThanks, { color }]}>{t('itin.rateThanks')}</Text> : null}
    </View>
  );
}

const ALBUM_API = 'https://wellcomedubaicom-production.up.railway.app';
const albumImg = (p: string) => (p.startsWith('http') ? p : ALBUM_API + p);

// Shared visitors' album — photos are uploaded to the server and shown to ALL users
// (keyed per tour/itinerary), not just saved on the uploader's device.
function AlbumRow({ storageKey, color }: { storageKey: string; color: string }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const load = () => {
    fetch(`${ALBUM_API}/api/album?key=${encodeURIComponent(storageKey)}`)
      .then(r => r.json()).then(j => { if (Array.isArray(j.photos)) setPhotos(j.photos); }).catch(() => {});
  };
  useEffect(() => { load(); }, [storageKey]);
  const add = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert(t('itin.permTitle'), t('itin.permMsg')); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.7 });
    if (res.canceled) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('key', storageKey);
      for (let i = 0; i < res.assets.length; i++) {
        const uri = res.assets[i].uri;
        if (Platform.OS === 'web') { const blob = await (await fetch(uri)).blob(); fd.append('photos', blob, `photo_${i}.jpg`); }
        else { fd.append('photos', { uri, name: `photo_${i}.jpg`, type: 'image/jpeg' } as any); }
      }
      const r = await fetch(`${ALBUM_API}/api/album`, { method: 'POST', body: fd as any });
      const j = await r.json();
      if (Array.isArray(j.photos)) setPhotos(j.photos); else throw new Error('bad');
      // Uploads are reviewed before they show, so say so rather than let the
      // photo look like it vanished.
      if (j.pending) {
        const m = t('itin.photoPending');
        Platform.OS === 'web' ? alert(m) : Alert.alert(m);
      }
    } catch { Alert.alert(t('itin.permTitle'), t('sp.errMsg') || 'ההעלאה נכשלה, נסה שוב.'); }
    finally { setBusy(false); }
  };
  return (
    <View style={s.albumBox}>
      <TouchableOpacity onPress={() => setOpen(o => !o)} style={s.albumHead}>
        <Text style={s.albumTitle}>{t('itin.album')}{photos.length ? ` (${photos.length})` : ''}</Text>
        <Text style={[s.albumChev, { color }]}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open ? (
        <View style={{ padding: 10 }}>
          <TouchableOpacity onPress={add} disabled={busy} style={[s.albumAddBtn, { backgroundColor: color, opacity: busy ? 0.6 : 1 }]}>
            <Text style={s.albumAddTxt}>{busy ? '…' : t('itin.uploadPhoto')}</Text>
          </TouchableOpacity>
          {photos.length ? (
            <View style={s.photoGrid}>
              {photos.map((p, i) => <Image key={i} source={{ uri: albumImg(p) }} style={s.photoThumb} />)}
            </View>
          ) : (
            <Text style={s.albumEmpty}>{t('itin.albumEmpty')}</Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

const { width: SCREEN_W } = Dimensions.get('window');

function ItineraryCard({ it, idx }: { it: any; idx: number }) {
  const { t, lang, isRTL } = useI18n();
  const [slide, setSlide] = useState(0);
  const ref = useRef<FlatList>(null);
  const stops = it.stops || [];
  const en = lang === 'en';
  const itTitle = lang === 'ar' ? tcAr(it.title) : lang === 'hi' ? tcHi(it.title) : lang === 'ru' ? tcRu(it.title) : en ? (it.titleEn || it.title) : it.title;
  const itDuration = lang === 'ar' ? tcAr(it.duration) : lang === 'hi' ? tcHi(it.duration) : lang === 'ru' ? tcRu(it.duration) : en ? (it.durationEn || it.duration) : it.duration;
  const itBestFor = lang === 'ar' ? tcAr(it.bestFor) : lang === 'hi' ? tcHi(it.bestFor) : lang === 'ru' ? tcRu(it.bestFor) : en ? (it.bestForEn || it.bestFor) : it.bestFor;
  const stopName = (st: any) => lang === 'ar' ? tcAr(st.name) : lang === 'hi' ? tcHi(st.name) : lang === 'ru' ? tcRu(st.name) : en ? (st.nameEn || st.name) : st.name;
  const stopDesc = (st: any) => lang === 'ar' ? tcAr(st.desc) : lang === 'hi' ? tcHi(st.desc) : lang === 'ru' ? tcRu(st.desc) : en ? (st.descEn || st.desc) : st.desc;
  // Full explanatory paragraph per site (shown when the stop is expanded). Per-language; only rendered if it exists.
  const stopInfo = (st: any) => ({ he: st.info, en: st.infoEn, ar: st.infoAr, hi: st.infoHi, ru: st.infoRu } as any)[lang];
  // GetYourGuide affiliate ticket link for ticketed sites (marked ticket:true in the data).
  const ticketUrl = (name: string) => `https://www.getyourguide.com/s/?q=${encodeURIComponent(name + ' Dubai')}&partner_id=PE2GLSE3MAO4YDEIXLNOYXMC67BCZ32C`;
  const buyLabel = ({ he: 'רכוש כרטיס', en: 'Buy ticket', ru: 'Купить билет', ar: 'شراء تذكرة', hi: 'टिकट खरीदें' } as any)[lang] || 'Buy ticket';
  const [openStop, setOpenStop] = useState<number | null>(null);
  const [mapBig, setMapBig] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const lastStop = (() => {
    const withCoords = stops.filter((s: any) => s.lat && s.lng);
    return withCoords.length ? withCoords[withCoords.length - 1] : null;
  })();
  const navUrl = lastStop ? 'open' : '';

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / (SCREEN_W - 28));
    if (i !== slide) setSlide(i);
  };

  return (
    <View style={s.card}>
      <TouchableOpacity onPress={() => setExpanded(e => !e)} activeOpacity={0.9} style={[s.accHead, { borderBottomWidth: expanded ? 1 : 0, borderBottomColor: '#F0E6D2' }]}>
        {(stops[0]?.image || it.image) ? (
          <Image source={{ uri: stops[0]?.image || it.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: it.color }]} />
        )}
        <LinearGradient
          colors={[it.color + 'F2', it.color + '99', it.color + '11']}
          locations={[0, 0.55, 1]}
          start={{ x: isRTL ? 1 : 0, y: 0.5 }}
          end={{ x: isRTL ? 0 : 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={[s.accBadge, { backgroundColor: 'rgba(255,255,255,0.22)' }]}>
          <Text style={s.accBadgeIcon}>{it.icon}</Text>
        </View>
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <Text style={[s.accTitle, { writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>{itTitle}</Text>
          <Text style={[s.accMeta, { writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}>{itDuration} · {stops.length} {t('itin.stops')}</Text>
        </View>
        <Text style={[s.accChev, { color: '#fff' }]}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {expanded ? (<>
      <FlatList
        ref={ref}
        data={stops}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={onScroll}
        renderItem={({ item: stop, index: j }) => (
          <View style={{ width: SCREEN_W - 28, height: 220, position: 'relative' }}>
            {stop.image ? <Image source={{ uri: stop.image }} style={{ width: '100%', height: '100%' }} resizeMode="cover" /> : <View style={{ flex: 1, backgroundColor: it.color }} />}
            <View style={s.slideOverlay} />
            <View style={s.slideTopRight}>
              <Text style={{ fontSize: 26 }}>{it.icon}</Text>
            </View>
            <View style={s.slideTopLeft}>
              <Text style={s.slideTopLeftTxt}>{j + 1}/{stops.length} · {stop.time}</Text>
            </View>
            <View style={s.slideBottom}>
              <Text style={s.slideTitle}>{itTitle}</Text>
              <Text style={s.slideMeta}>{itDuration} · {itBestFor}</Text>
              <Text style={s.slideStop}>{stopName(stop)}</Text>
            </View>
          </View>
        )}
      />
      {stops.length > 1 ? (
        <>
          <TouchableOpacity onPress={() => { const n = (slide - 1 + stops.length) % stops.length; setSlide(n); ref.current?.scrollToOffset({ offset: n * (SCREEN_W - 28), animated: true }); }} style={[s.arrowBtn, { right: 6 }]}>
            <Text style={s.arrowTxt}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { const n = (slide + 1) % stops.length; setSlide(n); ref.current?.scrollToOffset({ offset: n * (SCREEN_W - 28), animated: true }); }} style={[s.arrowBtn, { left: 6 }]}>
            <Text style={s.arrowTxt}>‹</Text>
          </TouchableOpacity>
        </>
      ) : null}
      {stops.length > 1 ? (
        <View style={s.dots}>
          {stops.map((_: any, j: number) => (
            <View key={j} style={[s.dot, j === slide && s.dotActive]} />
          ))}
        </View>
      ) : null}

      {(() => {
        const points = stops.filter((s: any) => s.lat && s.lng);
        if (points.length < 2) return null;
        const pts = points.map((p: any, i: number) => ({ lat: p.lat, lng: p.lng, name: p.name, num: i + 1 }));
        const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#m{margin:0;padding:0;height:100%;width:100%;}.gm-style-iw{direction:rtl;}</style></head><body><div id="m"></div><script>const pts=${JSON.stringify(pts)};function init(){const map=new google.maps.Map(document.getElementById('m'),{center:{lat:pts[0].lat,lng:pts[0].lng},zoom:12,mapTypeControl:false,streetViewControl:false,fullscreenControl:false,gestureHandling:'cooperative'});const bounds=new google.maps.LatLngBounds();pts.forEach(p=>{const m=new google.maps.Marker({position:{lat:p.lat,lng:p.lng},map,label:{text:String(p.num),color:'#fff',fontWeight:'800'},icon:{path:google.maps.SymbolPath.CIRCLE,scale:14,fillColor:'#E76F51',fillOpacity:1,strokeColor:'#fff',strokeWeight:2}});bounds.extend({lat:p.lat,lng:p.lng});const iw=new google.maps.InfoWindow({content:'<div style="direction:rtl;font-family:-apple-system,sans-serif;"><b>'+p.num+'. '+p.name+'</b></div>'});m.addListener('click',()=>iw.open({anchor:m,map}));});new google.maps.Polyline({path:pts.map(p=>({lat:p.lat,lng:p.lng})),strokeColor:'#E76F51',strokeWeight:3,strokeOpacity:0.9,map});if(pts.length>1)map.fitBounds(bounds,40);}</script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDw09Bg7XaH7apEWJBcFtogVfrdUwF_gEM&language=${lang}&callback=init" async defer></script></body></html>`;
        return (
          <View style={{ position: 'relative', height: mapBig ? 440 : 220 }}>
            <WebView originWhitelist={['*']} source={{ html }} style={{ flex: 1 }} />
            <TouchableOpacity onPress={() => setMapBig(b => !b)} style={s.enlargeBtn} activeOpacity={0.85}>
              <Text style={s.enlargeBtnTxt}>{mapBig ? '⤡' : '⤢'}</Text>
              <Text style={s.enlargeBtnTxt}>{mapBig ? t('itin.shrinkMap') : t('itin.enlargeMap')}</Text>
            </TouchableOpacity>
          </View>
        );
      })()}

      {navUrl ? (
        <TouchableOpacity style={[s.navBtn, { backgroundColor: it.color }]} onPress={() => lastStop && openMapsChoice(lastStop.lat, lastStop.lng, lastStop.name || it.title, 'navigate')}>
          <Text style={s.navBtnTxt}>{t('itin.openNav')}</Text>
        </TouchableOpacity>
      ) : null}

      <View style={{ paddingHorizontal: 14, paddingBottom: 12 }}>
        {stops.map((stop: any, j: number) => (
          <View key={j} style={s.stopRow}>
            <TouchableOpacity onPress={() => setOpenStop(openStop === j ? null : j)} style={s.stopMain}>
              <View style={[s.stopHead, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
                <View style={[s.stopNum, { backgroundColor: it.color }]}>
                  <Text style={s.stopNumTxt}>{j + 1}</Text>
                </View>
                <Text style={[s.stopTime, { color: it.color }]}>{stop.time}</Text>
                <Text style={[s.stopName, { flex: 1, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={2}>{stopName(stop)}</Text>
              </View>
              <Text style={[s.stopDesc, { writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]} numberOfLines={openStop === j ? undefined : 2}>{stopDesc(stop)}</Text>
              {openStop === j && stopInfo(stop) ? (
                <Text style={[s.stopInfo, { writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}>{stopInfo(stop)}</Text>
              ) : null}
              {openStop === j ? (
                lang === 'he' && STOPS_AUDIO[`it-${idx}-${j}-he`] ? (
                  <StopAudio source={STOPS_AUDIO[`it-${idx}-${j}-he`]} color={it.color} />
                ) : stop.audioKey && GUIDED_AUDIO[`${stop.audioKey}-${lang}`] ? (
                  <StopAudio source={GUIDED_AUDIO[`${stop.audioKey}-${lang}`]} color={it.color} />
                ) : !stop.audioKey && STOPS_AUDIO[`it-${idx}-${j}-${lang}`] ? (
                  <StopAudio source={STOPS_AUDIO[`it-${idx}-${j}-${lang}`]} color={it.color} />
                ) : lang === 'he' && stopInfo(stop) ? (
                  <HebrewTTS text={stopInfo(stop)} color={it.color} />
                ) : null
              ) : null}
              {openStop === j && stop.ticket ? (
                <TouchableOpacity onPress={() => Linking.openURL(ticketUrl(stop.nameEn || stop.name))} style={{ alignSelf: isRTL ? 'flex-end' : 'flex-start', marginTop: 6 }}>
                  <Text style={s.buyTicketLink}>{buyLabel} {isRTL ? '‹' : '›'}</Text>
                </TouchableOpacity>
              ) : null}
              <Text style={[s.chev, { color: it.color, transform: [{ rotate: openStop === j ? '180deg' : '0deg' }] }]}>▼</Text>
            </TouchableOpacity>
          </View>
        ))}
        <RateRow storageKey={`rate-itin-${idx}`} color={it.color} />
        <AlbumRow storageKey={`album-itin-${idx}`} color={it.color} />
      </View>
      </>) : null}
    </View>
  );
}

function StarHubCard({ h, idx }: { h: StarHub; idx: number }) {
  const { t, lang, isRTL } = useI18n();
  const [open, setOpen] = useState(true);
  const [openSpoke, setOpenSpoke] = useState<number | null>(null);
  const [big, setBig] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const ticketUrl = (name: string) => `https://www.getyourguide.com/s/?q=${encodeURIComponent(name + ' Dubai')}&partner_id=PE2GLSE3MAO4YDEIXLNOYXMC67BCZ32C`;
  const buyLabel = ({ he: 'רכוש כרטיס', en: 'Buy ticket', ru: 'Купить билет', ar: 'شراء تذكرة', hi: 'टिकट खरीदें' } as any)[lang] || 'Buy ticket';
  const spokeInfo = (sp: any) => ({ he: sp.info, en: sp.infoEn, ar: sp.infoAr, hi: sp.infoHi, ru: sp.infoRu } as any)[lang];
  const lastSpoke = h.spokes[h.spokes.length - 1];
  const hubHtml = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#m{margin:0;padding:0;height:100%;width:100%;}</style></head><body><div id="m"></div><script>const center=${JSON.stringify(h.center)};const color=${JSON.stringify(h.color)};const spokes=${JSON.stringify(h.spokes)};function init(){const map=new google.maps.Map(document.getElementById('m'),{center,zoom:13,mapTypeControl:false,streetViewControl:false,fullscreenControl:false,gestureHandling:'cooperative'});const bounds=new google.maps.LatLngBounds();bounds.extend(center);new google.maps.Marker({position:center,map,label:{text:'★',color:'#fff',fontWeight:'800',fontSize:'14px'},icon:{path:google.maps.SymbolPath.CIRCLE,scale:18,fillColor:color,fillOpacity:1,strokeColor:'#fff',strokeWeight:3}});spokes.forEach((sp,i)=>{const m=new google.maps.Marker({position:{lat:sp.lat,lng:sp.lng},map,label:{text:String(i+1),color:'#fff',fontWeight:'800'},icon:{path:google.maps.SymbolPath.CIRCLE,scale:12,fillColor:color,fillOpacity:1,strokeColor:'#fff',strokeWeight:2}});bounds.extend({lat:sp.lat,lng:sp.lng});const iw=new google.maps.InfoWindow({content:'<div style="direction:rtl;font-family:-apple-system,sans-serif;"><b>'+(i+1)+'. '+sp.name+'</b></div>'});m.addListener('click',()=>iw.open({anchor:m,map}));new google.maps.Polyline({path:[center,{lat:sp.lat,lng:sp.lng}],strokeColor:color,strokeWeight:3,strokeOpacity:0.85,map});});map.fitBounds(bounds,40);}</script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDw09Bg7XaH7apEWJBcFtogVfrdUwF_gEM&language=${lang}&callback=init" async defer></script></body></html>`;
  return (
    <View style={s.card}>
      <TouchableOpacity onPress={() => setExpanded(e => !e)} activeOpacity={0.9} style={[s.accHead, { borderBottomWidth: expanded ? 1 : 0, borderBottomColor: h.color + '33' }]}>
        {((h as any).image || (h.spokes[0] as any)?.image) ? (
          <Image source={{ uri: (h as any).image || (h.spokes[0] as any)?.image }} style={StyleSheet.absoluteFill} resizeMode="cover" />
        ) : (
          <View style={[StyleSheet.absoluteFill, { backgroundColor: h.color }]} />
        )}
        <LinearGradient
          colors={[h.color + 'F2', h.color + '99', h.color + '11']}
          locations={[0, 0.55, 1]}
          start={{ x: isRTL ? 1 : 0, y: 0.5 }}
          end={{ x: isRTL ? 0 : 1, y: 0.5 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={[s.accBadge, { backgroundColor: 'rgba(255,255,255,0.22)' }]}>
          <Text style={[s.accBadgeIcon, { color: '#fff' }]}>★</Text>
        </View>
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <Text style={s.accTitle} numberOfLines={2}>{lang === 'ar' ? tcAr(h.name) : lang === 'hi' ? tcHi(h.name) : lang === 'ru' ? tcRu(h.name) : lang === 'en' ? (h.nameEn || h.name) : h.name}</Text>
          <Text style={[s.accMeta, { color: 'rgba(255,255,255,0.95)', fontWeight: '700' }]}>★ {h.spokes.length} {t('itin.spokes')}</Text>
        </View>
        <Text style={[s.accChev, { color: '#fff' }]}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {expanded ? (<>
      <View style={{ position: 'relative', height: big ? 440 : 220 }}>
        <WebView originWhitelist={['*']} source={{ html: hubHtml }} style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => setBig(b => !b)} style={s.enlargeBtn} activeOpacity={0.85}>
          <Text style={s.enlargeBtnTxt}>{big ? '⤡' : '⤢'}</Text>
          <Text style={s.enlargeBtnTxt}>{big ? t('itin.shrinkMap') : t('itin.enlargeMap')}</Text>
        </TouchableOpacity>
      </View>
      <View style={{ padding: 14 }}>
        <Text style={[s.starDesc, { writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}>{lang === 'ar' ? tcAr(h.desc) : lang === 'hi' ? tcHi(h.desc) : lang === 'ru' ? tcRu(h.desc) : lang === 'en' ? (h.descEn || h.desc) : h.desc}</Text>
        <TouchableOpacity style={[s.navBtn, { backgroundColor: h.color, marginTop: 12, borderRadius: 8 }]} onPress={() => lastSpoke && openMapsChoice(lastSpoke.lat, lastSpoke.lng, lastSpoke.name || h.center?.name || (lang === 'ar' ? tcAr('יעד') : lang === 'hi' ? tcHi('יעד') : lang === 'ru' ? tcRu('יעד') : lang === 'he' ? 'יעד' : 'Destination'), 'navigate')}>
          <Text style={s.navBtnTxt}>{t('itin.navAllSpokes')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setOpen(o => !o)} style={{ paddingVertical: 10, alignItems: 'center' }}>
          <Text style={{ color: h.color, fontWeight: '700', fontSize: 13 }}>{open ? t('itin.hideList') : t('itin.showList')}</Text>
        </TouchableOpacity>
        {open ? h.spokes.map((sp: any, i: number) => (
          <View key={i} style={s.stopRow}>
            <TouchableOpacity onPress={() => setOpenSpoke(openSpoke === i ? null : i)} style={s.stopMain} activeOpacity={0.7}>
              <View style={[s.stopNum, { backgroundColor: h.color }]}>
                <Text style={s.stopNumTxt}>{i + 1}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[s.stopName, { writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}>{lang === 'ar' ? tcAr(sp.name) : lang === 'hi' ? tcHi(sp.name) : lang === 'ru' ? tcRu(sp.name) : lang === 'en' ? (sp.nameEn || sp.name) : sp.name}</Text>
                {openSpoke === i && spokeInfo(sp) ? (
                  <Text style={[s.stopInfo, { writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }]}>{spokeInfo(sp)}</Text>
                ) : null}
                {openSpoke === i ? (
                  lang === 'he' && STOPS_AUDIO[`star-${idx}-${i}-he`] ? (
                    <StopAudio source={STOPS_AUDIO[`star-${idx}-${i}-he`]} color={h.color} />
                  ) : lang !== 'he' && STOPS_AUDIO[`star-${idx}-${i}-${lang}`] ? (
                    <StopAudio source={STOPS_AUDIO[`star-${idx}-${i}-${lang}`]} color={h.color} />
                  ) : lang === 'he' && spokeInfo(sp) ? (
                    <HebrewTTS text={spokeInfo(sp)} color={h.color} />
                  ) : null
                ) : null}
                {openSpoke === i && sp.ticket ? (
                  <TouchableOpacity onPress={() => Linking.openURL(ticketUrl(sp.nameEn || sp.name))} style={{ alignSelf: isRTL ? 'flex-end' : 'flex-start', marginTop: 6 }}>
                    <Text style={s.buyTicketLink}>{buyLabel} {isRTL ? '‹' : '›'}</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              {spokeInfo(sp) ? <Text style={[s.chev, { color: h.color, transform: [{ rotate: openSpoke === i ? '180deg' : '0deg' }] }]}>▼</Text> : null}
            </TouchableOpacity>
          </View>
        )) : null}
        <RateRow storageKey={`rate-star-${idx}`} color={h.color} />
        <AlbumRow storageKey={`album-star-${idx}`} color={h.color} />
      </View>
      </>) : null}
    </View>
  );
}

function MyTripView() {
  const { t, lang, isRTL } = useI18n();
  const catLabel = (c: string) => t('itcat.' + c);
  const [items, setItems] = useState<any[]>([]);
  const [days, setDays] = useState<Record<string, number>>({});
  const [maxDays, setMaxDays] = useState(3);
  const [activeDay, setActiveDay] = useState(1);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [moveMenu, setMoveMenu] = useState<string | null>(null);
  const [orderMenu, setOrderMenu] = useState<string | null>(null);
  const [order, setOrder] = useState<Record<number, string[]>>({});

  const load = async () => {
    const favs = await getFavorites();
    const daysRaw = await AsyncStorage.getItem(MYTRIP_DAYS_KEY);
    const startRaw = await AsyncStorage.getItem(MYTRIP_START_KEY);
    const orderRaw = await AsyncStorage.getItem(MYTRIP_ORDER_KEY);
    const daysMap: Record<string, number> = daysRaw ? JSON.parse(daysRaw) : {};
    setOrder(orderRaw ? JSON.parse(orderRaw) : {});
    const enriched = favs.map(f => {
      const list = (CATALOG as any)[f.cat] || [];
      const item = list.find((x: any) => String(x.id) === String(f.id));
      return item ? { ...item, _cat: f.cat, _key: `${f.cat}-${f.id}` } : null;
    }).filter(Boolean) as any[];
    setItems(enriched);
    setDays(daysMap);
    if (startRaw) setStartDate(new Date(startRaw));
    const usedDays = Object.values(daysMap);
    if (usedDays.length) setMaxDays(Math.max(3, ...usedDays));
  };

  useEffect(() => { load(); }, []);

  const onDateChange = async (event: any, selected?: Date) => {
    if (Platform.OS !== 'ios') setShowPicker(false);
    if (selected) {
      setStartDate(selected);
      await AsyncStorage.setItem(MYTRIP_START_KEY, selected.toISOString());
    }
  };

  const setItemDay = async (key: string, day: number) => {
    const next = { ...days, [key]: day };
    setDays(next);
    await AsyncStorage.setItem(MYTRIP_DAYS_KEY, JSON.stringify(next));
  };

  const removeItem = async (cat: string, id: any) => {
    await toggleFavorite(cat, id);
    const next = { ...days };
    delete next[`${cat}-${id}`];
    await AsyncStorage.setItem(MYTRIP_DAYS_KEY, JSON.stringify(next));
    load();
  };

  if (!items.length) {
    return (
      <View style={{ padding: 24, alignItems: 'center' }}>
        <Text style={{ fontSize: 40 }}>❤️</Text>
        <Text style={{ color: Colors.TEXT, fontWeight: '800', fontSize: 16, marginTop: 12, textAlign: 'center', writingDirection: isRTL ? 'rtl' : 'ltr' }}>{t('itin.emptyMineTitle')}</Text>
        <Text style={{ color: Colors.MUTED, fontSize: 13, marginTop: 6, textAlign: 'center', writingDirection: isRTL ? 'rtl' : 'ltr', lineHeight: 19 }}>{t('itin.emptyMineSub')}</Text>
      </View>
    );
  }

  const rawDay = items.filter(it => (days[it._key] || 1) === activeDay);
  const savedOrder = order[activeDay] || [];
  const sorted: any[] = [];
  for (const k of savedOrder) {
    const f = rawDay.find(it => it._key === k);
    if (f) sorted.push(f);
  }
  for (const it of rawDay) {
    if (!sorted.find(x => x._key === it._key)) sorted.push(it);
  }
  const itemsByDay = sorted;
  const dayCounts: Record<number, number> = {};
  items.forEach(it => { const d = days[it._key] || 1; dayCounts[d] = (dayCounts[d] || 0) + 1; });

  const moveToPosition = async (key: string, newPos: number) => {
    const current = itemsByDay.map(x => x._key);
    const fromIdx = current.indexOf(key);
    if (fromIdx < 0) return;
    current.splice(fromIdx, 1);
    current.splice(newPos - 1, 0, key);
    const next = { ...order, [activeDay]: current };
    setOrder(next);
    await AsyncStorage.setItem(MYTRIP_ORDER_KEY, JSON.stringify(next));
  };

  const mapItems = itemsByDay.filter(it => it.lat && it.lng);
  const mapHtml = mapItems.length > 0 ? `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#m{margin:0;padding:0;height:100%;width:100%;}</style></head><body><div id="m"></div><script>function init(){const pts=${JSON.stringify(mapItems.map(it => ({ lat: it.lat, lng: it.lng, name: it.name })))};const map=new google.maps.Map(document.getElementById('m'),{center:pts[0],zoom:12,mapTypeControl:false,streetViewControl:false,fullscreenControl:false,gestureHandling:'cooperative'});const bounds=new google.maps.LatLngBounds();const path=[];pts.forEach((p,i)=>{const pos={lat:p.lat,lng:p.lng};path.push(pos);bounds.extend(pos);const m=new google.maps.Marker({position:pos,map,label:{text:String(i+1),color:'#fff',fontWeight:'800',fontSize:'13px'},icon:{path:google.maps.SymbolPath.CIRCLE,scale:15,fillColor:'#E76F51',fillOpacity:1,strokeColor:'#fff',strokeWeight:3}});const iw=new google.maps.InfoWindow({content:'<div style="direction:rtl;font-family:-apple-system,sans-serif;"><b>'+(i+1)+'. '+p.name+'</b></div>'});m.addListener('click',()=>iw.open({anchor:m,map}));});if(pts.length>1){new google.maps.Polyline({path,geodesic:true,strokeColor:'#1A6B8A',strokeOpacity:0.8,strokeWeight:3,map});map.fitBounds(bounds,40);}}</script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDw09Bg7XaH7apEWJBcFtogVfrdUwF_gEM&language=${lang}&callback=init" async defer></script></body></html>` : '';

  const navAllLast = mapItems.length > 1 ? mapItems[mapItems.length - 1] : null;
  const navAllUrl = navAllLast ? 'open' : null;

  const dayBg = DAY_BACKGROUNDS[(activeDay - 1) % DAY_BACKGROUNDS.length];

  return (
    <View style={{ backgroundColor: dayBg, marginHorizontal: -14, paddingHorizontal: 14, paddingTop: 4, paddingBottom: 20 }}>
      <TouchableOpacity onPress={() => setShowPicker(true)} style={[mt.startBtn, { backgroundColor: 'rgba(255,255,255,0.5)' }]} activeOpacity={0.7}>
        <Text style={mt.startLabel}>{t('itin.startDate')}</Text>
        <Text style={mt.startVal}>
          {startDate ? `${dayName(startDate.getDay(), lang)} · ${startDate.getDate()} ${monthShort(startDate.getMonth(), lang)} ${startDate.getFullYear()}` : t('itin.tapChoose')}
        </Text>
      </TouchableOpacity>
      {showPicker ? (
        <View>
          <DateTimePicker
            value={startDate || new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={onDateChange}
            minimumDate={new Date()}
          />
          {Platform.OS === 'ios' ? (
            <TouchableOpacity onPress={() => setShowPicker(false)} style={mt.pickerDone}>
              <Text style={mt.pickerDoneTxt}>{t('itin.confirm')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 32, paddingBottom: 8, paddingHorizontal: 2 }} style={mt.daysRow}>
        {Array.from({ length: maxDays }).map((_, i) => {
          const d = i + 1;
          const active = activeDay === d;
          return (
            <TouchableOpacity key={d} onPress={() => setActiveDay(d)} style={[mt.dayTab, active && mt.dayTabActive]} activeOpacity={0.7}>
              <Text style={[mt.dayTabTxt, active && mt.dayTabTxtActive]}>{t('itin.day')} {d}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity onPress={() => { setMaxDays(maxDays + 1); setActiveDay(maxDays + 1); }} style={mt.dayTab} activeOpacity={0.7}>
          <Text style={mt.dayAddTxt}>{t('itin.add')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {itemsByDay.length > 0 ? (
        (() => {
          const d = startDate ? new Date(startDate) : null;
          if (d) d!.setDate(d!.getDate() + (activeDay - 1));
          const dayLbl = d ? d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'he-IL', { weekday: 'long' }) : `${t('itin.day')} ${activeDay}`;
          const dayDate = d ? d.toLocaleDateString(lang === 'ru' ? 'ru-RU' : lang === 'en' ? 'en-US' : 'he-IL', { day: 'numeric', month: 'long' }) : '';
          return (
            <View style={{ flexDirection: 'row-reverse', alignItems: 'baseline', gap: 12, marginTop: 8, marginBottom: 16 }}>
              <Text style={mt.eventMonthName}>{dayLbl}{dayDate ? ` · ${dayDate}` : ''}</Text>
              <Text style={mt.eventMonthSub}>{itemsByDay.length} {t('itin.stops')}</Text>
            </View>
          );
        })()
      ) : null}

      {itemsByDay.length === 0 ? (
        <View style={mt.empty}>
          <Text style={{ fontSize: 56 }}>🗺️</Text>
          <Text style={mt.emptyTitle}>{t('itin.noStops')}{formatDayDate(startDate, activeDay, lang)}</Text>
          <Text style={mt.emptySub}>{t('itin.emptyDaySub')}</Text>
        </View>
      ) : (
        <View>
          {itemsByDay.map((it: any, idx: number) => {
            const meta = CAT_LABELS[it._cat] || { label: '', icon: '📌', color: Colors.PRIMARY };
            const time = SUGGESTED_TIMES[idx] || '';
            return (
              <View key={it._key} style={mt.eventRow}>
                <View style={mt.dayCol}>
                  <TouchableOpacity onPress={() => setOrderMenu(it._key)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Text style={mt.dayNum}>{idx + 1}</Text>
                  </TouchableOpacity>
                  <Text style={mt.dayMon}>{time}</Text>
                </View>
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={mt.eventName}>{it.name}</Text>
                  <Text style={mt.eventDesc}>{catLabel(it._cat)}{it.address ? ` · ${it.address}` : ''}</Text>
                  <View style={{ flexDirection: 'row-reverse', gap: 14, marginTop: 4 }}>
                    <TouchableOpacity onPress={() => setMoveMenu(it._key)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={mt.ticketLink}>{t('itin.changeDay')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeItem(it._cat, it.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={[mt.ticketLink, { color: '#B85C5C' }]}>{t('itin.remove')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Modal visible={!!orderMenu} transparent animationType="fade" onRequestClose={() => setOrderMenu(null)}>
        <View style={mt.menuBackdrop}>
          <Pressable onPress={() => setOrderMenu(null)} style={StyleSheet.absoluteFill} />
          <View style={mt.menu}>
            <Text style={mt.menuTitle}>{t('itin.moveToPos')}</Text>
            {itemsByDay.map((_, i) => {
              const pos = i + 1;
              const currentIdx = orderMenu ? itemsByDay.findIndex(x => x._key === orderMenu) : -1;
              const isCurrent = currentIdx === i;
              return (
                <TouchableOpacity key={pos} onPress={() => { if (orderMenu) moveToPosition(orderMenu, pos); setOrderMenu(null); }} style={[mt.menuItem, isCurrent && mt.menuItemActive]}>
                  <Text style={[mt.menuTxt, isCurrent && mt.menuTxtActive]}>{t('itin.position')} {pos}</Text>
                  {isCurrent ? <Text style={mt.menuCheck}>✓</Text> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      <Modal visible={!!moveMenu} transparent animationType="fade" onRequestClose={() => setMoveMenu(null)}>
        <View style={mt.menuBackdrop}>
          <Pressable onPress={() => setMoveMenu(null)} style={StyleSheet.absoluteFill} />
          <View style={mt.menu}>
            <Text style={mt.menuTitle}>{t('itin.moveToDay')}</Text>
            {Array.from({ length: maxDays }).map((_, i) => {
              const d = i + 1;
              const isCurrent = moveMenu && (days[moveMenu] || 1) === d;
              return (
                <TouchableOpacity key={d} onPress={() => { if (moveMenu) { setItemDay(moveMenu, d); setActiveDay(d); } setMoveMenu(null); }} style={[mt.menuItem, isCurrent && mt.menuItemActive]}>
                  <Text style={[mt.menuTxt, isCurrent && mt.menuTxtActive]}>{formatDayDate(startDate, d, lang)}</Text>
                  {isCurrent ? <Text style={mt.menuCheck}>✓</Text> : null}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      {mapItems.length > 0 ? (
        <View style={{ marginTop: 24 }}>
          <View style={mt.mapDivider} />
          <TouchableOpacity onPress={() => setMapOpen(o => !o)} style={mt.mapToggle} activeOpacity={0.6}>
            <View style={{ flex: 1 }}>
              <Text style={mt.mapToggleLabel}>{t('itin.routeMap')}</Text>
              <Text style={mt.mapToggleTitle}>{mapOpen ? t('itin.closeMap') : t('itin.showDayRoute')}</Text>
            </View>
            <Text style={mt.mapToggleChevron}>{mapOpen ? '−' : '+'}</Text>
          </TouchableOpacity>
          {mapOpen ? (
            <>
              <View style={mt.mapWrap}>
                <WebView originWhitelist={['*']} source={{ html: mapHtml }} style={{ flex: 1 }} scrollEnabled={false} />
              </View>
              {navAllUrl ? (
                <TouchableOpacity onPress={() => navAllLast && openMapsChoice(navAllLast.lat, navAllLast.lng, navAllLast.name || t('itin.lastDest'), 'navigate')} style={mt.navAll} activeOpacity={0.6}>
                  <Text style={mt.navAllTxt}>{t('itin.openGmaps')}</Text>
                </TouchableOpacity>
              ) : null}
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const mt = StyleSheet.create({
  startBtn: { backgroundColor: '#FAF6EE', paddingHorizontal: 18, paddingVertical: 14, marginBottom: 4 },
  startLabel: { color: Colors.MUTED, fontWeight: '600', fontSize: 11, writingDirection: 'rtl', textTransform: 'uppercase', letterSpacing: 0.6, textAlign: 'right' },
  startVal: { color: Colors.TEXT, fontWeight: '700', fontSize: 15, writingDirection: 'rtl', marginTop: 4, textAlign: 'right' },
  startIcon: { fontSize: 22 },
  daysRow: { paddingVertical: 4, marginBottom: 14 },
  dayChip: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', minHeight: 42 },
  dayChipActive: { backgroundColor: Colors.PRIMARY },
  dayChipTxt: { color: Colors.TEXT, fontWeight: '700', fontSize: 13 },
  dayChipTxtActive: { color: '#fff', fontWeight: '900' },
  dayBadge: { backgroundColor: '#F0E6D2', minWidth: 20, height: 20, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5 },
  dayBadgeActive: { backgroundColor: 'rgba(255,255,255,0.3)' },
  dayBadgeTxt: { color: Colors.TEXT, fontSize: 11, fontWeight: '900' },
  dayBadgeTxtActive: { color: '#fff' },
  dayAdd: { paddingHorizontal: 16, paddingVertical: 10, backgroundColor: 'transparent', minHeight: 42, alignItems: 'center', justifyContent: 'center' },
  dayAddTxt: { color: Colors.MUTED, fontSize: 12.5, fontWeight: '700' },
  dayTitleBox: { flexDirection: 'row-reverse', alignItems: 'center', backgroundColor: '#fff', padding: 18, marginBottom: 4 },
  dayTitleSub: { color: Colors.MUTED, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', writingDirection: 'rtl' },
  dayTitleBig: { color: Colors.TEXT, fontSize: 19, fontWeight: '900', marginTop: 3, writingDirection: 'rtl' },
  dayTitleCount: { alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.PRIMARY, paddingHorizontal: 14, paddingVertical: 10, minWidth: 70 },
  dayTitleCountNum: { color: '#fff', fontSize: 22, fontWeight: '900', lineHeight: 24 },
  dayTitleCountLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 10, fontWeight: '700', marginTop: 2 },
  empty: { backgroundColor: '#fff', padding: 32, alignItems: 'center' },
  emptyTitle: { color: Colors.TEXT, fontWeight: '900', fontSize: 15, marginTop: 14, textAlign: 'center', writingDirection: 'rtl' },
  emptySub: { color: Colors.MUTED, fontSize: 12.5, marginTop: 6, textAlign: 'center', lineHeight: 18, writingDirection: 'rtl' },
  thumb: { width: 96, height: 96, backgroundColor: '#E5E7EB' },
  tripBody: { flex: 1, padding: 12 },
  timeChip: { backgroundColor: '#FAF3DE', paddingHorizontal: 8, paddingVertical: 3 },
  timeChipTxt: { color: '#7B5E1F', fontSize: 11, fontWeight: '800' },
  catBadgeRow: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3, marginTop: 8 },
  iconBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0E6D2' },
  iconBtnTxt: { fontSize: 14 },
  iconBtnRemove: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FDECE8' },
  connector: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginVertical: -2, paddingHorizontal: 14 },
  connectorLine: { flex: 1, height: 1, backgroundColor: '#E8DEC8' },
  connectorTxt: { color: Colors.MUTED, fontSize: 11, fontWeight: '700' },
  tripCard: { backgroundColor: '#fff', paddingHorizontal: 18, paddingVertical: 18, marginBottom: 4 },
  topMeta: { flexDirection: 'row-reverse', alignItems: 'center', gap: 14 },
  bigNum: { fontSize: 34, fontWeight: '300', lineHeight: 36, letterSpacing: -1, minWidth: 30, textAlign: 'center' },
  timeBig: { color: Colors.TEXT, fontWeight: '800', fontSize: 14, writingDirection: 'rtl' },
  catLine: { fontSize: 11, fontWeight: '700', marginTop: 2, letterSpacing: 0.3, writingDirection: 'rtl' },
  flatIcon: { width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  flatIconTxt: { fontSize: 16 },
  flatIconTxtX: { color: '#C7CDD3', fontSize: 18, fontWeight: '500', lineHeight: 20 },
  connectorDot: { width: 4, height: 4, backgroundColor: '#D4C9B0' },
  dayHero: { paddingVertical: 24, paddingHorizontal: 4, marginBottom: 8 },
  dayHeroDay: { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif', fontSize: 36, color: Colors.TEXT, fontWeight: '400', writingDirection: 'rtl', letterSpacing: -0.5 },
  dayHeroDate: { color: Colors.TEXT, fontSize: 17, fontWeight: '300', marginTop: 4, writingDirection: 'rtl' },
  dayHeroMeta: { color: Colors.MUTED, fontSize: 12, fontWeight: '600', marginTop: 10, letterSpacing: 0.6, textTransform: 'uppercase', writingDirection: 'rtl' },
  timelineWrap: { paddingHorizontal: 4 },
  timelineRow: { flexDirection: 'row-reverse', alignItems: 'flex-start', minHeight: 70 },
  timelineLeft: { width: 50, paddingTop: 2, alignItems: 'flex-end' },
  timelineTime: { color: Colors.TEXT, fontSize: 14, fontWeight: '700', fontVariant: ['tabular-nums'] },
  timelineCenter: { width: 30, alignItems: 'center', paddingTop: 2 },
  timelineDot: { width: 22, height: 22, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.TEXT },
  timelineDotTxt: { color: '#fff', fontSize: 11, fontWeight: '900' },
  timelineLine: { flex: 1, width: 1, backgroundColor: '#E0D6C0', marginTop: 4 },
  timelineRight: { flex: 1, paddingTop: 0, paddingBottom: 24, paddingHorizontal: 4 },
  itemName: { color: Colors.TEXT, fontSize: 17, fontWeight: '700', writingDirection: 'rtl', textAlign: 'right', lineHeight: 22 },
  itemMeta: { color: Colors.MUTED, fontSize: 13, fontWeight: '400', marginTop: 4, writingDirection: 'rtl', textAlign: 'right', lineHeight: 18 },
  itemActions: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginTop: 10 },
  itemActionTxt: { color: Colors.PRIMARY, fontSize: 12.5, fontWeight: '600' },
  itemActionSep: { color: Colors.MUTED, fontSize: 12.5 },
  walkRow: { flexDirection: 'row-reverse', alignItems: 'center', marginTop: -16, marginBottom: 10 },
  walkSpacerLeft: { width: 50 },
  walkCenter: { width: 30, alignItems: 'center' },
  walkTxt: { color: Colors.MUTED, fontSize: 11.5, fontWeight: '500', fontStyle: 'italic', paddingHorizontal: 4 },
  dayTab: { paddingVertical: 8, borderBottomWidth: 1.5, borderBottomColor: 'transparent' },
  dayTabActive: { borderBottomColor: Colors.GOLD },
  dayTabTxt: { fontSize: 18, fontWeight: '500', color: '#9CA3AF', letterSpacing: 0.5 },
  dayTabTxtActive: { color: Colors.TEXT, fontWeight: '900' },
  eventMonthName: { fontWeight: '300', fontSize: 28, color: Colors.TEXT, letterSpacing: -1, writingDirection: 'rtl' },
  eventMonthSub: { color: '#9CA3AF', fontSize: 12, fontWeight: '500' },
  eventRow: { flexDirection: 'row-reverse', gap: 18, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(184,146,58,0.15)' },
  dayCol: { flexShrink: 0, alignItems: 'center', minWidth: 60, borderLeftWidth: 1, borderLeftColor: 'rgba(184,146,58,0.4)', paddingLeft: 14 },
  dayNum: { fontWeight: '800', fontSize: 22, color: '#2C5F6E', lineHeight: 24 },
  dayMon: { fontSize: 10, color: '#B8923A', fontWeight: '600', letterSpacing: 1, marginTop: 4 },
  eventName: { fontWeight: '600', color: '#2C5F6E', fontSize: 16, lineHeight: 22, marginBottom: 5, writingDirection: 'rtl', textAlign: 'right' },
  eventDesc: { color: '#6B7F8D', fontSize: 13, lineHeight: 20, marginBottom: 8, writingDirection: 'rtl', textAlign: 'right' },
  ticketLink: { color: '#E76F51', fontSize: 13, fontWeight: '700', letterSpacing: 0.3, textAlign: 'right' },
  catBadge: { paddingHorizontal: 8, paddingVertical: 3 },
  catBadgeTxt: { color: '#fff', fontSize: 10.5, fontWeight: '800' },
  tripName: { color: Colors.TEXT, fontWeight: '900', fontSize: 18, marginTop: 12, writingDirection: 'rtl', textAlign: 'right', lineHeight: 24, letterSpacing: -0.3 },
  tripAddr: { color: Colors.MUTED, fontSize: 12.5, marginTop: 6, writingDirection: 'rtl', textAlign: 'right' },
  removeBtn: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FDECE8' },
  moveRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6, marginTop: 10, flexWrap: 'wrap' },
  moveLabel: { color: Colors.MUTED, fontSize: 11.5, fontWeight: '700' },
  movePill: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0E6D2' },
  movePillActive: { backgroundColor: Colors.SECONDARY },
  movePillTxt: { color: Colors.TEXT, fontSize: 12, fontWeight: '800' },
  movePillTxtActive: { color: '#fff' },
  mapWrap: { height: 260, overflow: 'hidden', marginBottom: 4 },
  navAll: { paddingVertical: 14, alignItems: 'flex-end', marginTop: 8 },
  navAllTxt: { color: '#E76F51', fontSize: 13, fontWeight: '700', letterSpacing: 0.3 },
  pickerDone: { backgroundColor: Colors.PRIMARY, paddingVertical: 13, alignItems: 'center', marginBottom: 4 },
  pickerDoneTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },
  mapToggle: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, paddingVertical: 16 },
  mapToggleLabel: { color: '#B8923A', fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', writingDirection: 'rtl' },
  mapToggleTitle: { color: Colors.TEXT, fontSize: 18, fontWeight: '600', marginTop: 4, writingDirection: 'rtl' },
  mapToggleChevron: { color: Colors.TEXT, fontSize: 26, fontWeight: '300', marginLeft: 8 },
  mapDivider: { height: 1, backgroundColor: 'rgba(184,146,58,0.3)' },
  orderNum: { width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  orderNumTxt: { color: '#fff', fontSize: 13, fontWeight: '900' },
  dayMoveBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F0E6D2' },
  dayMoveBtnTxt: { fontSize: 14 },
  menuBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center', padding: 22 },
  menu: { width: '100%', maxWidth: 320, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 14, shadowOffset: { width: 0, height: 8 } },
  menuTitle: { color: '#fff', backgroundColor: Colors.PRIMARY, fontSize: 14, fontWeight: '800', padding: 14, textAlign: 'center' },
  menuItem: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0E6D2' },
  menuItemActive: { backgroundColor: '#E8F2F7' },
  menuTxt: { flex: 1, color: '#2C5F6E', fontSize: 14, fontWeight: '700', writingDirection: 'rtl', textAlign: 'right' },
  menuTxtActive: { color: Colors.PRIMARY, fontWeight: '900' },
  menuCheck: { color: Colors.PRIMARY, fontSize: 16, fontWeight: '900' },
});

export default function ItinerariesScreen() {
  const { t } = useI18n();
  const [view, setView] = useState<'day' | 'star' | 'mytrip'>('day');
  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#000' }} />
      <View style={s.header}>
        <View style={{ width: 32 }} />
        <Text style={[s.title, { flex: 1, textAlign: 'center' }]}>{t('itin.title')}</Text>
        <TouchableOpacity onPress={() => router.push('/(tabs)/' as any)} style={s.closeBtnX} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={s.closeBtnXTxt}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={s.tabsRow}>
        <TouchableOpacity onPress={() => setView('day')} style={[s.tabBtn, view === 'day' && s.tabBtnActive]}>
          <Text style={[s.tabTxt, view === 'day' && s.tabTxtActive]}>{t('itin.tabDay')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setView('star')} style={[s.tabBtn, view === 'star' && s.tabBtnActive]}>
          <Text style={[s.tabTxt, view === 'star' && s.tabTxtActive]}>{t('itin.tabStar')}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setView('mytrip')} style={[s.tabBtn, view === 'mytrip' && s.tabBtnActive]}>
          <Text style={[s.tabTxt, view === 'mytrip' && s.tabTxtActive]}>{t('itin.tabMyTrip')}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 60 }}>
        {view === 'day' ? (
          <>
            <Text style={{ color: Colors.MUTED, fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textAlign: 'center', marginBottom: 10 }}>{ITINERARIES.length} {t('itin.countReady')}</Text>
            {ITINERARIES.map((it: any, i: number) => ({ it, i })).sort((a, b) => (b.it.sourceUrl ? 1 : 0) - (a.it.sourceUrl ? 1 : 0)).map(({ it, i }) => <ItineraryCard key={i} it={it} idx={i} />)}
          </>
        ) : view === 'star' ? (
          <>
            <Text style={{ color: Colors.MUTED, fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textAlign: 'center', marginBottom: 10 }}>{STAR_HUBS.length} {t('itin.countStar')}</Text>
            {STAR_HUBS.map((h, i) => <StarHubCard key={i} h={h} idx={i} />)}
          </>
        ) : (
          <MyTripView />
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: Colors.PRIMARY },
  closeBtnX: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#E76F51', alignItems: 'center', justifyContent: 'center' },
  closeBtnXTxt: { color: '#fff', fontSize: 18, fontWeight: '900', lineHeight: 20 },
  title: { color: '#fff', fontSize: 24, fontWeight: '400', letterSpacing: 0.3, writingDirection: 'rtl', textAlign: 'right' },
  tabsRow: { flexDirection: 'row-reverse', gap: 0, paddingHorizontal: 0, paddingVertical: 0, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tabBtn: { flex: 1, paddingVertical: 13, paddingHorizontal: 4, borderRadius: 0, backgroundColor: '#F1EADD', alignItems: 'center' },
  tabBtnActive: { backgroundColor: '#E76F51' },
  tabTxt: { color: '#6B7F8D', fontWeight: '500', fontSize: 14, writingDirection: 'rtl', textAlign: 'center' },
  tabTxtActive: { color: '#fff', fontWeight: '700' },
  starHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, padding: 12, paddingHorizontal: 16 },
  starTitle: { color: '#fff', fontSize: 16, fontWeight: '800', writingDirection: 'rtl', textAlign: 'right' },
  starSub: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 2, writingDirection: 'rtl', textAlign: 'right' },
  starDesc: { color: Colors.TEXT, fontSize: 13, lineHeight: 19, writingDirection: 'rtl', textAlign: 'right' },
  spokeRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F5EFE6' },
  enlargeBtn: { position: 'absolute', bottom: 10, left: 10, backgroundColor: '#E76F51', paddingHorizontal: 12, paddingVertical: 9, borderRadius: 0, flexDirection: 'row', alignItems: 'center', gap: 6, shadowColor: '#000', shadowOpacity: 0.28, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  enlargeBtnTxt: { color: '#fff', fontSize: 13, fontWeight: '800' },
  rateBox: { marginTop: 12, padding: 12, backgroundColor: '#FBF7EF', borderRadius: 8, alignItems: 'center' },
  rateLabel: { color: Colors.TEXT, fontWeight: '800', fontSize: 13, marginBottom: 6, writingDirection: 'rtl' },
  rateStars: { flexDirection: 'row-reverse', gap: 6 },
  rateStar: { fontSize: 26, color: '#D1D5DB' },
  rateAvg: { fontSize: 13, fontWeight: '800', marginTop: 8 },
  rateThanks: { fontSize: 11, fontWeight: '700', marginTop: 6 },
  albumBox: { marginTop: 10, borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, backgroundColor: '#fff', overflow: 'hidden' },
  albumHead: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', padding: 12 },
  albumTitle: { color: Colors.TEXT, fontWeight: '700', fontSize: 14, writingDirection: 'rtl' },
  albumChev: { fontSize: 12, fontWeight: '700' },
  albumAddBtn: { padding: 10, alignItems: 'center', borderRadius: 6, marginBottom: 10 },
  albumAddTxt: { color: '#fff', fontWeight: '800', fontSize: 13 },
  albumEmpty: { color: Colors.MUTED, fontSize: 12, textAlign: 'center', paddingVertical: 10, writingDirection: 'rtl' },
  photoGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 4 },
  photoThumb: { width: '32%', aspectRatio: 1, borderRadius: 6, backgroundColor: '#E5E7EB' },
  tip: { backgroundColor: '#F5E6CB', borderRightWidth: 3, borderRightColor: '#B8923A', padding: 10, borderRadius: 6, marginBottom: 14 },
  tipTxt: { color: Colors.TEXT, fontSize: 13, writingDirection: 'rtl', textAlign: 'right' },
  card: { backgroundColor: '#fff', borderRadius: 0, overflow: 'hidden', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#EAE0CE' },
  slideOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  slideTopRight: { position: 'absolute', top: 10, right: 12 },
  slideTopLeft: { position: 'absolute', top: 10, left: 12, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  slideTopLeftTxt: { color: '#fff', fontSize: 11 },
  slideBottom: { position: 'absolute', bottom: 36, right: 14, left: 14 },
  slideTitle: { color: '#fff', fontSize: 26, fontWeight: '600', letterSpacing: 0.3, textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 5, writingDirection: 'rtl', textAlign: 'right' },
  slideMeta: { color: 'rgba(255,255,255,0.95)', fontSize: 14, marginTop: 4, textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 4, writingDirection: 'rtl', textAlign: 'right' },
  slideStop: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2, writingDirection: 'rtl', textAlign: 'right' },
  arrowBtn: { position: 'absolute', top: 92, width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.55)', alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  arrowTxt: { color: '#fff', fontSize: 22, fontWeight: '300', lineHeight: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 4, paddingVertical: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D1D5DB' },
  dotActive: { backgroundColor: '#2C5F6E' },
  navBtn: { padding: 12, alignItems: 'center' },
  navBtnTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  stopRow: { borderBottomWidth: 1, borderBottomColor: '#F5EFE6' },
  stopMain: { flexDirection: 'row-reverse', gap: 10, paddingVertical: 10, alignItems: 'flex-start' },
  stopNum: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  stopNumTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  stopTime: { width: 50, fontSize: 13, fontWeight: '700', textAlign: 'center', paddingTop: 2 },
  stopName: { color: Colors.TEXT, fontSize: 14, fontWeight: '600', writingDirection: 'rtl', textAlign: 'right' },
  stopDesc: { color: Colors.MUTED, fontSize: 12, marginTop: 2, lineHeight: 17, writingDirection: 'rtl', textAlign: 'right' },
  stopInfo: { color: '#3D5A66', fontSize: 13, marginTop: 8, lineHeight: 20, writingDirection: 'rtl', textAlign: 'right' },
  buyTicketLink: { color: '#E76F51', fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },
  chev: { fontSize: 11, color: Colors.MUTED, marginTop: 4 },
  openMap: { paddingVertical: 6, paddingHorizontal: 38, alignItems: 'flex-end' },
  openMapTxt: { fontSize: 12, fontWeight: '700' },
  accHead: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 18, minHeight: 104, overflow: 'hidden' },
  accBadge: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  accBadgeIcon: { fontSize: 24 },
  accTitle: { color: '#fff', fontWeight: '600', fontSize: 21, letterSpacing: 0.2, writingDirection: 'rtl', textAlign: 'right', lineHeight: 26, textShadowColor: 'rgba(0,0,0,0.5)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 },
  accMeta: { color: 'rgba(255,255,255,0.95)', fontSize: 13, marginTop: 4, writingDirection: 'rtl', textAlign: 'right', textShadowColor: 'rgba(0,0,0,0.5)', textShadowRadius: 3 },
  accChev: { fontSize: 14, fontWeight: '800' },
  countHead: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, marginBottom: 10, alignItems: 'center' },
  countHeadNum: { color: Colors.PRIMARY, fontSize: 36, fontWeight: '300', letterSpacing: -1 },
  countHeadLabel: { color: Colors.MUTED, fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 2 },
});
