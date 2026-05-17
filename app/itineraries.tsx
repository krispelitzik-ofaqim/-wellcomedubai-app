import { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Linking, FlatList, Dimensions, NativeSyntheticEvent, NativeScrollEvent, Alert, Modal, Pressable } from 'react-native';
import { openMapsChoice } from '../utils/maps';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/colors';
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
const HEB_MONTHS_SHORT = ['ינו', 'פבר', 'מרץ', 'אפר', 'מאי', 'יוני', 'יולי', 'אוג', 'ספט', 'אוק', 'נוב', 'דצמ'];

function formatDayDate(startDate: Date | null, dayNum: number) {
  if (!startDate) return `יום ${dayNum}`;
  const d = new Date(startDate);
  d.setDate(d.getDate() + (dayNum - 1));
  return `${HEB_DAYS[d.getDay()]} ${d.getDate()}/${d.getMonth() + 1}`;
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

function RateRow({ storageKey, color }: { storageKey: string; color: string }) {
  const [rate, setRate] = useState(0);
  useEffect(() => { AsyncStorage.getItem(storageKey).then(v => v && setRate(parseInt(v, 10))); }, [storageKey]);
  const pick = (n: number) => { setRate(n); AsyncStorage.setItem(storageKey, String(n)); };
  return (
    <View style={s.rateBox}>
      <Text style={s.rateLabel}>דרג את הסיור</Text>
      <View style={s.rateStars}>
        {[5, 4, 3, 2, 1].map(n => (
          <TouchableOpacity key={n} onPress={() => pick(n)}>
            <Text style={[s.rateStar, n <= rate && { color }]}>{n <= rate ? '★' : '☆'}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {rate > 0 ? <Text style={[s.rateThanks, { color }]}>תודה על הדירוג!</Text> : null}
    </View>
  );
}

function AlbumRow({ storageKey, color }: { storageKey: string; color: string }) {
  const [open, setOpen] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  useEffect(() => { AsyncStorage.getItem(storageKey).then(v => { if (v) try { setPhotos(JSON.parse(v)); } catch {} }); }, [storageKey]);
  const add = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) { Alert.alert('נדרשת הרשאה', 'אנא אפשר גישה לתמונות'); return; }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.7 });
    if (res.canceled) return;
    const uris = res.assets.map(a => a.uri);
    const next = [...photos, ...uris];
    setPhotos(next);
    AsyncStorage.setItem(storageKey, JSON.stringify(next));
  };
  return (
    <View style={s.albumBox}>
      <TouchableOpacity onPress={() => setOpen(o => !o)} style={s.albumHead}>
        <Text style={s.albumTitle}>📸 אלבום הגולשים{photos.length ? ` (${photos.length})` : ''}</Text>
        <Text style={[s.albumChev, { color }]}>{open ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {open ? (
        <View style={{ padding: 10 }}>
          <TouchableOpacity onPress={add} style={[s.albumAddBtn, { backgroundColor: color }]}>
            <Text style={s.albumAddTxt}>+ העלה תמונה</Text>
          </TouchableOpacity>
          {photos.length ? (
            <View style={s.photoGrid}>
              {photos.map((p, i) => <Image key={i} source={{ uri: p }} style={s.photoThumb} />)}
            </View>
          ) : (
            <Text style={s.albumEmpty}>עדיין אין תמונות באלבום</Text>
          )}
        </View>
      ) : null}
    </View>
  );
}

const { width: SCREEN_W } = Dimensions.get('window');

function ItineraryCard({ it, idx }: { it: any; idx: number }) {
  const [slide, setSlide] = useState(0);
  const ref = useRef<FlatList>(null);
  const stops = it.stops || [];
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
      <TouchableOpacity onPress={() => setExpanded(e => !e)} activeOpacity={0.85} style={[s.accHead, { backgroundColor: it.color + '1A', borderBottomWidth: expanded ? 1 : 0, borderBottomColor: '#F0E6D2' }]}>
        <View style={[s.accBadge, { backgroundColor: it.color }]}>
          <Text style={s.accBadgeIcon}>{it.icon}</Text>
        </View>
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <Text style={s.accTitle} numberOfLines={2}>{it.title}</Text>
          <Text style={s.accMeta}>{it.duration} · {stops.length} תחנות</Text>
        </View>
        <Text style={[s.accChev, { color: it.color }]}>{expanded ? '▲' : '▼'}</Text>
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
              <Text style={s.slideTitle}>{it.title}</Text>
              <Text style={s.slideMeta}>{it.duration} · {it.bestFor}</Text>
              <Text style={s.slideStop}>{stop.name}</Text>
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
        const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#m{margin:0;padding:0;height:100%;width:100%;}.gm-style-iw{direction:rtl;}</style></head><body><div id="m"></div><script>const pts=${JSON.stringify(pts)};function init(){const map=new google.maps.Map(document.getElementById('m'),{center:{lat:pts[0].lat,lng:pts[0].lng},zoom:12,mapTypeControl:false,streetViewControl:false,fullscreenControl:false});const bounds=new google.maps.LatLngBounds();pts.forEach(p=>{const m=new google.maps.Marker({position:{lat:p.lat,lng:p.lng},map,label:{text:String(p.num),color:'#fff',fontWeight:'800'},icon:{path:google.maps.SymbolPath.CIRCLE,scale:14,fillColor:'#E76F51',fillOpacity:1,strokeColor:'#fff',strokeWeight:2}});bounds.extend({lat:p.lat,lng:p.lng});const iw=new google.maps.InfoWindow({content:'<div style="direction:rtl;font-family:-apple-system,sans-serif;"><b>'+p.num+'. '+p.name+'</b></div>'});m.addListener('click',()=>iw.open({anchor:m,map}));});new google.maps.Polyline({path:pts.map(p=>({lat:p.lat,lng:p.lng})),strokeColor:'#E76F51',strokeWeight:3,strokeOpacity:0.9,map});if(pts.length>1)map.fitBounds(bounds,40);}</script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDw09Bg7XaH7apEWJBcFtogVfrdUwF_gEM&language=he&callback=init" async defer></script></body></html>`;
        return (
          <View style={{ position: 'relative', height: mapBig ? 440 : 220 }}>
            <WebView originWhitelist={['*']} source={{ html }} style={{ flex: 1 }} />
            <TouchableOpacity onPress={() => setMapBig(b => !b)} style={s.enlargeBtn}>
              <Text style={s.enlargeBtnTxt}>{mapBig ? '⤡ הקטן מפה' : '⤢ הגדל מפה'}</Text>
            </TouchableOpacity>
          </View>
        );
      })()}

      {navUrl ? (
        <TouchableOpacity style={[s.navBtn, { backgroundColor: it.color }]} onPress={() => lastStop && openMapsChoice(lastStop.lat, lastStop.lng, lastStop.name || it.title, 'navigate')}>
          <Text style={s.navBtnTxt}>פתח ניווט ב-Google Maps</Text>
        </TouchableOpacity>
      ) : null}

      <View style={{ paddingHorizontal: 14, paddingBottom: 12 }}>
        {stops.map((stop: any, j: number) => (
          <View key={j} style={s.stopRow}>
            <TouchableOpacity onPress={() => setOpenStop(openStop === j ? null : j)} style={s.stopMain}>
              <View style={[s.stopNum, { backgroundColor: it.color }]}>
                <Text style={s.stopNumTxt}>{j + 1}</Text>
              </View>
              <Text style={[s.stopTime, { color: it.color }]}>{stop.time}</Text>
              <View style={{ flex: 1 }}>
                <Text style={s.stopName}>{stop.name}</Text>
                <Text style={s.stopDesc} numberOfLines={openStop === j ? undefined : 2}>{stop.desc}</Text>
              </View>
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
  const [open, setOpen] = useState(false);
  const [big, setBig] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const lastSpoke = h.spokes[h.spokes.length - 1];
  const hubHtml = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#m{margin:0;padding:0;height:100%;width:100%;}</style></head><body><div id="m"></div><script>const center=${JSON.stringify(h.center)};const color=${JSON.stringify(h.color)};const spokes=${JSON.stringify(h.spokes)};function init(){const map=new google.maps.Map(document.getElementById('m'),{center,zoom:13,mapTypeControl:false,streetViewControl:false,fullscreenControl:false});const bounds=new google.maps.LatLngBounds();bounds.extend(center);new google.maps.Marker({position:center,map,label:{text:'★',color:'#fff',fontWeight:'800',fontSize:'14px'},icon:{path:google.maps.SymbolPath.CIRCLE,scale:18,fillColor:color,fillOpacity:1,strokeColor:'#fff',strokeWeight:3}});spokes.forEach((sp,i)=>{const m=new google.maps.Marker({position:{lat:sp.lat,lng:sp.lng},map,label:{text:String(i+1),color:'#fff',fontWeight:'800'},icon:{path:google.maps.SymbolPath.CIRCLE,scale:12,fillColor:color,fillOpacity:1,strokeColor:'#fff',strokeWeight:2}});bounds.extend({lat:sp.lat,lng:sp.lng});const iw=new google.maps.InfoWindow({content:'<div style="direction:rtl;font-family:-apple-system,sans-serif;"><b>'+(i+1)+'. '+sp.name+'</b></div>'});m.addListener('click',()=>iw.open({anchor:m,map}));new google.maps.Polyline({path:[center,{lat:sp.lat,lng:sp.lng}],strokeColor:color,strokeWeight:3,strokeOpacity:0.85,map});});map.fitBounds(bounds,40);}</script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDw09Bg7XaH7apEWJBcFtogVfrdUwF_gEM&language=he&callback=init" async defer></script></body></html>`;
  return (
    <View style={[s.card, { backgroundColor: '#fff', borderWidth: 2, borderColor: h.color }]}>
      <TouchableOpacity onPress={() => setExpanded(e => !e)} activeOpacity={0.85} style={[s.accHead, { borderBottomWidth: expanded ? 1 : 0, borderBottomColor: h.color + '33' }]}>
        <View style={[s.accBadge, { backgroundColor: 'transparent', borderWidth: 2, borderColor: h.color }]}>
          <Text style={[s.accBadgeIcon, { color: h.color }]}>★</Text>
        </View>
        <View style={{ flex: 1, paddingHorizontal: 12 }}>
          <Text style={s.accTitle} numberOfLines={2}>{h.name}</Text>
          <Text style={[s.accMeta, { color: h.color, fontWeight: '700' }]}>★ {h.spokes.length} חיצים</Text>
        </View>
        <Text style={[s.accChev, { color: h.color }]}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>
      {expanded ? (<>
      <View style={{ position: 'relative', height: big ? 440 : 220 }}>
        <WebView originWhitelist={['*']} source={{ html: hubHtml }} style={{ flex: 1 }} />
        <TouchableOpacity onPress={() => setBig(b => !b)} style={s.enlargeBtn}>
          <Text style={s.enlargeBtnTxt}>{big ? '⤡ הקטן מפה' : '⤢ הגדל מפה'}</Text>
        </TouchableOpacity>
      </View>
      <View style={{ padding: 14 }}>
        <Text style={s.starDesc}>{h.desc}</Text>
        <TouchableOpacity style={[s.navBtn, { backgroundColor: h.color, marginTop: 12, borderRadius: 8 }]} onPress={() => lastSpoke && openMapsChoice(lastSpoke.lat, lastSpoke.lng, lastSpoke.name || h.center?.name || 'יעד', 'navigate')}>
          <Text style={s.navBtnTxt}>פתח ניווט בין כל הזרועות</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setOpen(o => !o)} style={{ paddingVertical: 10, alignItems: 'center' }}>
          <Text style={{ color: h.color, fontWeight: '700', fontSize: 13 }}>{open ? 'סגור רשימה ▲' : 'הצג רשימה ▼'}</Text>
        </TouchableOpacity>
        {open ? h.spokes.map((sp, i) => (
          <View key={i} style={s.spokeRow}>
            <View style={[s.stopNum, { backgroundColor: h.color }]}>
              <Text style={s.stopNumTxt}>{i + 1}</Text>
            </View>
            <Text style={s.stopName}>{sp.name}</Text>
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
        <Text style={{ color: Colors.TEXT, fontWeight: '800', fontSize: 16, marginTop: 12, textAlign: 'center', writingDirection: 'rtl' }}>הטיול שלי ריק</Text>
        <Text style={{ color: Colors.MUTED, fontSize: 13, marginTop: 6, textAlign: 'center', writingDirection: 'rtl', lineHeight: 19 }}>לחצו על ה-❤️ בכל מסעדה, מלון או אטרקציה — והם יישמרו כאן לטיול שלכם.</Text>
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
  const mapHtml = mapItems.length > 0 ? `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#m{margin:0;padding:0;height:100%;width:100%;}</style></head><body><div id="m"></div><script>function init(){const pts=${JSON.stringify(mapItems.map(it => ({ lat: it.lat, lng: it.lng, name: it.name })))};const map=new google.maps.Map(document.getElementById('m'),{center:pts[0],zoom:12,mapTypeControl:false,streetViewControl:false,fullscreenControl:false});const bounds=new google.maps.LatLngBounds();const path=[];pts.forEach((p,i)=>{const pos={lat:p.lat,lng:p.lng};path.push(pos);bounds.extend(pos);const m=new google.maps.Marker({position:pos,map,label:{text:String(i+1),color:'#fff',fontWeight:'800',fontSize:'13px'},icon:{path:google.maps.SymbolPath.CIRCLE,scale:15,fillColor:'#E76F51',fillOpacity:1,strokeColor:'#fff',strokeWeight:3}});const iw=new google.maps.InfoWindow({content:'<div style="direction:rtl;font-family:-apple-system,sans-serif;"><b>'+(i+1)+'. '+p.name+'</b></div>'});m.addListener('click',()=>iw.open({anchor:m,map}));});if(pts.length>1){new google.maps.Polyline({path,geodesic:true,strokeColor:'#1A6B8A',strokeOpacity:0.8,strokeWeight:3,map});map.fitBounds(bounds,40);}}</script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDw09Bg7XaH7apEWJBcFtogVfrdUwF_gEM&language=he&callback=init" async defer></script></body></html>` : '';

  const navAllLast = mapItems.length > 1 ? mapItems[mapItems.length - 1] : null;
  const navAllUrl = navAllLast ? 'open' : null;

  const dayBg = DAY_BACKGROUNDS[(activeDay - 1) % DAY_BACKGROUNDS.length];

  return (
    <View style={{ backgroundColor: dayBg, marginHorizontal: -14, paddingHorizontal: 14, paddingTop: 4, paddingBottom: 20 }}>
      <TouchableOpacity onPress={() => setShowPicker(true)} style={[mt.startBtn, { backgroundColor: 'rgba(255,255,255,0.5)' }]} activeOpacity={0.7}>
        <Text style={mt.startLabel}>תאריך התחלת הטיול</Text>
        <Text style={mt.startVal}>
          {startDate ? `${HEB_DAYS[startDate.getDay()]} · ${startDate.getDate()} ${HEB_MONTHS_SHORT[startDate.getMonth()]} ${startDate.getFullYear()}` : 'הקש לבחירה ←'}
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
              <Text style={mt.pickerDoneTxt}>אישור</Text>
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
              <Text style={[mt.dayTabTxt, active && mt.dayTabTxtActive]}>יום {d}</Text>
            </TouchableOpacity>
          );
        })}
        <TouchableOpacity onPress={() => { setMaxDays(maxDays + 1); setActiveDay(maxDays + 1); }} style={mt.dayTab} activeOpacity={0.7}>
          <Text style={mt.dayAddTxt}>+ הוסף</Text>
        </TouchableOpacity>
      </ScrollView>

      {itemsByDay.length > 0 ? (
        (() => {
          const d = startDate ? new Date(startDate) : null;
          if (d) d!.setDate(d!.getDate() + (activeDay - 1));
          const dayName = d ? HEB_DAYS[d.getDay()] : `יום ${activeDay}`;
          const dayDate = d ? `${d.getDate()} ${['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'][d.getMonth()]}` : '';
          return (
            <View style={{ flexDirection: 'row-reverse', alignItems: 'baseline', gap: 12, marginTop: 8, marginBottom: 16 }}>
              <Text style={mt.eventMonthName}>{dayName}{dayDate ? ` · ${dayDate}` : ''}</Text>
              <Text style={mt.eventMonthSub}>{itemsByDay.length} תחנות</Text>
            </View>
          );
        })()
      ) : null}

      {itemsByDay.length === 0 ? (
        <View style={mt.empty}>
          <Text style={{ fontSize: 56 }}>🗺️</Text>
          <Text style={mt.emptyTitle}>אין תחנות ב{formatDayDate(startDate, activeDay)}</Text>
          <Text style={mt.emptySub}>סמנו ❤️ במסעדות, מלונות ואטרקציות — הם ישמרו כאן.</Text>
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
                  <Text style={mt.eventDesc}>{meta.label}{it.address ? ` · ${it.address}` : ''}</Text>
                  <View style={{ flexDirection: 'row-reverse', gap: 14, marginTop: 4 }}>
                    <TouchableOpacity onPress={() => setMoveMenu(it._key)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={mt.ticketLink}>שינוי יום ←</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeItem(it._cat, it.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                      <Text style={[mt.ticketLink, { color: '#B85C5C' }]}>הסר ←</Text>
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
            <Text style={mt.menuTitle}>העבר למיקום</Text>
            {itemsByDay.map((_, i) => {
              const pos = i + 1;
              const currentIdx = orderMenu ? itemsByDay.findIndex(x => x._key === orderMenu) : -1;
              const isCurrent = currentIdx === i;
              return (
                <TouchableOpacity key={pos} onPress={() => { if (orderMenu) moveToPosition(orderMenu, pos); setOrderMenu(null); }} style={[mt.menuItem, isCurrent && mt.menuItemActive]}>
                  <Text style={[mt.menuTxt, isCurrent && mt.menuTxtActive]}>מיקום {pos}</Text>
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
            <Text style={mt.menuTitle}>העבר ליום</Text>
            {Array.from({ length: maxDays }).map((_, i) => {
              const d = i + 1;
              const isCurrent = moveMenu && (days[moveMenu] || 1) === d;
              return (
                <TouchableOpacity key={d} onPress={() => { if (moveMenu) { setItemDay(moveMenu, d); setActiveDay(d); } setMoveMenu(null); }} style={[mt.menuItem, isCurrent && mt.menuItemActive]}>
                  <Text style={[mt.menuTxt, isCurrent && mt.menuTxtActive]}>{formatDayDate(startDate, d)}</Text>
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
              <Text style={mt.mapToggleLabel}>מפת מסלול</Text>
              <Text style={mt.mapToggleTitle}>{mapOpen ? 'סגירת המפה' : 'הצג את מסלול היום'}</Text>
            </View>
            <Text style={mt.mapToggleChevron}>{mapOpen ? '−' : '+'}</Text>
          </TouchableOpacity>
          {mapOpen ? (
            <>
              <View style={mt.mapWrap}>
                <WebView originWhitelist={['*']} source={{ html: mapHtml }} style={{ flex: 1 }} scrollEnabled={false} />
              </View>
              {navAllUrl ? (
                <TouchableOpacity onPress={() => navAllLast && openMapsChoice(navAllLast.lat, navAllLast.lng, navAllLast.name || 'יעד אחרון', 'navigate')} style={mt.navAll} activeOpacity={0.6}>
                  <Text style={mt.navAllTxt}>פתח ב-Google Maps ←</Text>
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
  const [view, setView] = useState<'day' | 'star' | 'mytrip'>('day');
  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#000' }} />
      <View style={s.header}>
        <View style={{ width: 32 }} />
        <Text style={[s.title, { flex: 1, textAlign: 'center' }]}>מסלולים מוכנים</Text>
        <TouchableOpacity onPress={() => router.back()} style={s.closeBtnX}>
          <Text style={s.closeBtnXTxt}>✕</Text>
        </TouchableOpacity>
      </View>
      <View style={s.tabsRow}>
        <TouchableOpacity onPress={() => setView('day')} style={[s.tabBtn, view === 'day' && s.tabBtnActive]}>
          <Text style={[s.tabTxt, view === 'day' && s.tabTxtActive]}>📅 מסלולי יום</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setView('star')} style={[s.tabBtn, view === 'star' && s.tabBtnActive]}>
          <Text style={[s.tabTxt, view === 'star' && s.tabTxtActive]}>⭐ טיולי כוכב</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setView('mytrip')} style={[s.tabBtn, view === 'mytrip' && s.tabBtnActive]}>
          <Text style={[s.tabTxt, view === 'mytrip' && s.tabTxtActive]}>❤️ הטיול שלי</Text>
        </TouchableOpacity>
      </View>
      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 60 }}>
        {view === 'day' ? (
          <>
            <Text style={{ color: Colors.MUTED, fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textAlign: 'center', marginBottom: 10 }}>{ITINERARIES.length} מסלולים מוכנים</Text>
            {ITINERARIES.map((it: any, i: number) => <ItineraryCard key={i} it={it} idx={i} />)}
          </>
        ) : view === 'star' ? (
          <>
            <Text style={{ color: Colors.MUTED, fontSize: 12, fontWeight: '700', letterSpacing: 0.6, textAlign: 'center', marginBottom: 10 }}>{STAR_HUBS.length} טיולי כוכב</Text>
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
  title: { color: '#fff', fontSize: 17, fontWeight: '900', writingDirection: 'rtl', textAlign: 'right' },
  tabsRow: { flexDirection: 'row-reverse', gap: 6, paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  tabBtn: { flex: 1, paddingVertical: 9, paddingHorizontal: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff', alignItems: 'center' },
  tabBtnActive: { borderWidth: 2, borderColor: '#E76F51', backgroundColor: '#FFF5F2' },
  tabTxt: { color: '#6B7F8D', fontWeight: '700', fontSize: 12, writingDirection: 'rtl', textAlign: 'center' },
  tabTxtActive: { color: '#E76F51', fontWeight: '900' },
  starHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, padding: 12, paddingHorizontal: 16 },
  starTitle: { color: '#fff', fontSize: 16, fontWeight: '800', writingDirection: 'rtl', textAlign: 'right' },
  starSub: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 2, writingDirection: 'rtl', textAlign: 'right' },
  starDesc: { color: Colors.TEXT, fontSize: 13, lineHeight: 19, writingDirection: 'rtl', textAlign: 'right' },
  spokeRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F5EFE6' },
  enlargeBtn: { position: 'absolute', bottom: 8, left: 8, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  enlargeBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  rateBox: { marginTop: 12, padding: 12, backgroundColor: '#FBF7EF', borderRadius: 8, alignItems: 'center' },
  rateLabel: { color: Colors.TEXT, fontWeight: '800', fontSize: 13, marginBottom: 6, writingDirection: 'rtl' },
  rateStars: { flexDirection: 'row-reverse', gap: 6 },
  rateStar: { fontSize: 26, color: '#D1D5DB' },
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
  card: { backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 14 },
  slideOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.35)' },
  slideTopRight: { position: 'absolute', top: 10, right: 12 },
  slideTopLeft: { position: 'absolute', top: 10, left: 12, backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  slideTopLeftTxt: { color: '#fff', fontSize: 11 },
  slideBottom: { position: 'absolute', bottom: 36, right: 14, left: 14 },
  slideTitle: { color: '#fff', fontSize: 18, fontWeight: '800', textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4, writingDirection: 'rtl', textAlign: 'right' },
  slideMeta: { color: 'rgba(255,255,255,0.95)', fontSize: 13, marginTop: 3, textShadowColor: 'rgba(0,0,0,0.7)', textShadowRadius: 4, writingDirection: 'rtl', textAlign: 'right' },
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
  chev: { fontSize: 11, color: Colors.MUTED, marginTop: 4 },
  openMap: { paddingVertical: 6, paddingHorizontal: 38, alignItems: 'flex-end' },
  openMapTxt: { fontSize: 12, fontWeight: '700' },
  accHead: { flexDirection: 'row-reverse', alignItems: 'center', padding: 14 },
  accBadge: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  accBadgeIcon: { fontSize: 24 },
  accTitle: { color: Colors.TEXT, fontWeight: '900', fontSize: 15, writingDirection: 'rtl', textAlign: 'right', lineHeight: 20 },
  accMeta: { color: Colors.MUTED, fontSize: 12, marginTop: 3, writingDirection: 'rtl', textAlign: 'right' },
  accChev: { fontSize: 14, fontWeight: '800' },
  countHead: { backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 14, marginBottom: 10, alignItems: 'center' },
  countHeadNum: { color: Colors.PRIMARY, fontSize: 36, fontWeight: '300', letterSpacing: -1 },
  countHeadLabel: { color: Colors.MUTED, fontSize: 12, fontWeight: '700', letterSpacing: 0.8, textTransform: 'uppercase', marginTop: 2 },
});
