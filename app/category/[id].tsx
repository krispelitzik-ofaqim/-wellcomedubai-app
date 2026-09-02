import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking, Modal, FlatList, I18nManager, Alert } from 'react-native';
import * as Location from 'expo-location';

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371; const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1); const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { WebView } from '../../components/WebView';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useI18n } from '../../constants/i18n';
import { tcRu } from '../../constants/contentRu';
import { tcHi } from '../../constants/contentHi';
import { tcAr } from '../../constants/contentAr';
import { openMapsChoice } from '../../utils/maps';
import { CATALOG } from '../../data/catalog';
import { getFavorites, toggleFavorite } from '../../utils/favorites';
import METRO from '../../data/metro.json';
import HOTEL_PHOTOS from '../../data/hotel-photos.json';
import ATTRACTION_PHOTOS from '../../data/attraction-photos.json';
import RESTAURANT_PHOTOS from '../../data/restaurant-places-photos.json';
import KIDS_PHOTOS from '../../data/kids-photos.json';
import NIGHTLIFE_PHOTOS from '../../data/nightlife-photos.json';
import SHOPPING_PHOTOS from '../../data/shopping-photos.json';
import TRANSPORT_PHOTOS from '../../data/transport-photos.json';
import CASINO_PHOTOS from '../../data/casino-photos.json';
import ABUDHABI_PHOTOS from '../../data/abudhabi-photos.json';

const PHOTOS_BY_CAT: Record<string, any> = {
  hotels: HOTEL_PHOTOS, attractions: ATTRACTION_PHOTOS, restaurants: RESTAURANT_PHOTOS,
  kids: KIDS_PHOTOS, nightlife: NIGHTLIFE_PHOTOS, shopping: SHOPPING_PHOTOS,
  transport: TRANSPORT_PHOTOS, casino: CASINO_PHOTOS, abudhabi: ABUDHABI_PHOTOS,
};

const PLACES_KEY = 'AIzaSyDVYlYuM6saMxbhi2aKNCtiv6J8mR8LLgw';
function placePhotoUrl(name: string) {
  return `https://places.googleapis.com/v1/${name}/media?key=${PLACES_KEY}&maxWidthPx=600`;
}

const TITLES: Record<string, { he: string; en: string; ru?: string; ar?: string; hi?: string; emoji: string; color: string }> = {
  hotels:      { he: 'מלונות',          en: 'Hotels',        ru: 'Отели',                    ar: 'فنادق',                hi: 'होटल',              emoji: '🏨', color: Colors.GOLD },
  attractions: { he: 'אטרקציות',      en: 'Attractions',   ru: 'Достопримечательности',    ar: 'معالم سياحية',        hi: 'आकर्षण',            emoji: '🎡', color: Colors.SECONDARY },
  restaurants: { he: 'מסעדות',         en: 'Restaurants',   ru: 'Рестораны',                ar: 'مطاعم',                hi: 'रेस्तराँ',           emoji: '🍽️', color: '#E24B32' },
  shopping:    { he: 'קניות',           en: 'Shopping',      ru: 'Шопинг',                   ar: 'تسوق',                 hi: 'खरीदारी',           emoji: '🛍️', color: Colors.WARM },
  nightlife:   { he: 'בילויים',         en: 'Nightlife',     ru: 'Ночная жизнь',             ar: 'الحياة الليلية',       hi: 'नाइटलाइफ़',         emoji: '🍻', color: Colors.PINK },
  transport:   { he: 'תחבורה',          en: 'Transport',     ru: 'Транспорт',                ar: 'المواصلات',            hi: 'परिवहन',            emoji: '🚕', color: Colors.PRIMARY },
  kids:        { he: 'ילדים ומשפחות', en: 'Kids & Families', ru: 'Дети и семьи',           ar: 'الأطفال والعائلات',    hi: 'बच्चे और परिवार',    emoji: '👨‍👩‍👧', color: Colors.ACCENT },
  casino:      { he: 'בידור ומשחקים', en: 'Games & Fun',   ru: 'Игры и развлечения',       ar: 'ألعاب وترفيه',         hi: 'खेल और मनोरंजन',    emoji: '🎰', color: Colors.GOLD },
  abudhabi:    { he: 'אבו דאבי',        en: 'Abu Dhabi',     ru: 'Абу-Даби',                 ar: 'أبو ظبي',              hi: 'अबू धाबी',          emoji: '🏛', color: Colors.PINK },
};

const FILTERS: Record<string, { label: string; en: string; key: string }[]> = {
  hotels:      [{label:'הכל',en:'All',key:'all'},{label:'יוקרה',en:'Luxury',key:'7star'},{label:'תקציב גבוה',en:'High-end',key:'5star'},{label:'תקציב בינוני',en:'Mid-range',key:'4-5star'},{label:'סביר',en:'Affordable',key:'3-4star'},{label:'תקציב צנוע',en:'Budget',key:'budget'}],
  attractions: [{label:'הכל',en:'All',key:'all'},{label:'חובה',en:'Must-See',key:'landmark'},{label:'מוזיאון',en:'Museum',key:'museum'},{label:'אומנות',en:'Art',key:'art'},{label:'אקסטרים',en:'Extreme',key:'extreme'},{label:'חוף',en:'Beach',key:'beach'},{label:'פארק מים',en:'Water Park',key:'waterpark'},{label:'פארק שעשועים',en:'Theme Park',key:'theme-park'},{label:'סיור',en:'Tour',key:'tour'},{label:'גן חיות',en:'Zoo',key:'zoo'},{label:'ספארי',en:'Safari',key:'desert'},{label:'יהדות',en:'Jewish',key:'judaism'},{label:'ספורט',en:'Sport',key:'sport'},{label:'אקווריום',en:'Aquarium',key:'aquarium'},{label:'מופע',en:'Show',key:'show'},{label:'הרפתקה',en:'Adventure',key:'adventure'}],
  restaurants: [{label:'הכל',en:'All',key:'all'},{label:'⭐ מישלין',en:'⭐ Michelin',key:'michelin'},{label:'יוקרה',en:'Luxury',key:'ultra-luxury'},{label:'ישראלי',en:'Israeli',key:'israeli'},{label:'בתי קפה',en:'Cafés',key:'cafe'},{label:'אסיאתי',en:'Asian',key:'asian'},{label:'הודי',en:'Indian',key:'indian'},{label:'רוסי',en:'Russian',key:'russian'},{label:'חלאל',en:'Halal',key:'halal'},{label:'איטלקי',en:'Italian',key:'italian'},{label:'טורקי',en:'Turkish',key:'turkish'},{label:'מקומי',en:'Local',key:'local'},{label:'רחוב',en:'Street Food',key:'street'},{label:'דגים',en:'Seafood',key:'seafood'},{label:'סטייקייה',en:'Steakhouse',key:'steakhouse'},{label:'טבעוני',en:'Vegan',key:'vegan'}],
  shopping:    [{label:'הכל',en:'All',key:'all'},{label:'קניון',en:'Mall',key:'mall'},{label:'שוק',en:'Souk',key:'souk'},{label:'אלכוהול וסיגרים',en:'Alcohol & Cigars',key:'alcohol'}],
  nightlife:   [{label:'הכל',en:'All',key:'all'},{label:'בר',en:'Bar',key:'bar'},{label:'מועדון',en:'Club',key:'club'},{label:'אלכוהול',en:'Alcohol',key:'alcohol'}],
  transport:   [{label:'הכל',en:'All',key:'all'},{label:'מטרו',en:'Metro',key:'metro'},{label:'מונית',en:'Taxi',key:'taxi'},{label:'אפליקציות',en:'Apps',key:'app'},{label:'השכרת רכב',en:'Car Rental',key:'car-rental'},{label:'אוטובוס',en:'Bus',key:'bus'},{label:'אברה',en:'Abra',key:'boat'}],
  kids:        [{label:'הכל',en:'All',key:'all'}],
  casino:      [{label:'הכל',en:'All',key:'all'},{label:'קזינו',en:'Casino',key:'casino'},{label:'מרוצים',en:'Racing',key:'racing'},{label:'ספורט',en:'Sport',key:'sport'},{label:'הופעות',en:'Shows',key:'music-show'}],
  abudhabi:    [{label:'הכל',en:'All',key:'all'}],
};

const SUBCAT_LABELS: Record<string, { label: string; en: string; color: string }> = {
  landmark:    { label: 'חובה',          en: 'Must-See',      color: '#E76F51' },
  museum:      { label: 'מוזיאון',       en: 'Museum',        color: '#2A9D8F' },
  art:         { label: 'אומנות',         en: 'Art',           color: '#B85C8E' },
  adventure:   { label: 'הרפתקה',         en: 'Adventure',     color: '#F4A261' },
  extreme:     { label: 'אקסטרים',        en: 'Extreme',       color: '#E63946' },
  beach:       { label: 'חוף',            en: 'Beach',         color: '#5B9DC7' },
  waterpark:   { label: 'פארק מים',       en: 'Water Park',    color: '#5B9DC7' },
  'theme-park':{ label: 'פארק שעשועים',   en: 'Theme Park',    color: '#F4A261' },
  tour:        { label: 'סיור',           en: 'Tour',          color: '#B8923A' },
  zoo:         { label: 'גן חיות',        en: 'Zoo',           color: '#7FA77F' },
  aquarium:    { label: 'אקווריום',       en: 'Aquarium',      color: '#5B9DC7' },
  snow:        { label: 'סקי',            en: 'Ski',           color: '#1A6B8A' },
  desert:      { label: 'ספארי',          en: 'Safari',        color: '#B8923A' },
  show:        { label: 'מופע',           en: 'Show',          color: '#B85C8E' },
  sport:       { label: 'ספורט',          en: 'Sport',         color: '#2A9D8F' },
  judaism:     { label: 'יהדות',          en: 'Jewish',        color: '#1A4A5E' },
  'kids-zone': { label: 'ילדים',          en: 'Kids',          color: '#E76F51' },
  'kids-city': { label: 'עיר הילדים',      en: 'Kids City',     color: '#E76F51' },
  'vr-park':   { label: 'פארק מציאות מדומה', en: 'VR Park',    color: '#B85C8E' },
  trampoline:  { label: 'מתחם טרמפולינה',  en: 'Trampoline',   color: '#F4A261' },
  arcade:      { label: 'לונה פארק',       en: 'Arcade',       color: '#E63946' },
  toddlers:    { label: 'פארק משחקים לפעוטות', en: 'Toddlers',  color: '#5B9DC7' },
  '7star':     { label: '7★',             en: '7★',            color: '#B8923A' },
  '5star':     { label: '5★',             en: '5★',            color: '#B8923A' },
  '4-5star':   { label: '4-5★',           en: '4-5★',          color: '#B8923A' },
  '3-4star':   { label: '3-4★',           en: '3-4★',          color: '#7FA77F' },
  budget:      { label: 'תקציבי',         en: 'Budget',        color: '#7FA77F' },
  mall:        { label: 'קניון',          en: 'Mall',          color: '#F4A261' },
  souk:        { label: 'שוק',            en: 'Souk',          color: '#B8923A' },
  alcohol:     { label: 'אלכוהול',        en: 'Alcohol',       color: '#E63946' },
  metro:       { label: 'מטרו',           en: 'Metro',         color: '#E63946' },
  taxi:        { label: 'מונית',          en: 'Taxi',          color: '#B8923A' },
  bus:         { label: 'אוטובוס',        en: 'Bus',           color: '#F4A261' },
  app:         { label: 'אפליקציה',       en: 'App',           color: '#1A6B8A' },
  boat:        { label: 'סירה',           en: 'Boat',          color: '#5B9DC7' },
  'car-rental':{ label: 'השכרת רכב',      en: 'Car Rental',    color: '#7FA77F' },
  bar:         { label: 'בר',             en: 'Bar',           color: '#B85C8E' },
  club:        { label: 'מועדון',          en: 'Club',          color: '#B85C8E' },
  entertainment:{ label: 'בידור',         en: 'Entertainment', color: '#E76F51' },
  casino:      { label: 'קזינו',          en: 'Casino',        color: '#B8923A' },
  racing:      { label: 'מרוצים',         en: 'Racing',        color: '#E63946' },
  'music-show':{ label: 'מופע',           en: 'Show',          color: '#B85C8E' },
  ultraluxury: { label: 'יוקרה',          en: 'Luxury',        color: '#B8923A' },
  'ultra-luxury': { label: 'יוקרה',       en: 'Luxury',        color: '#B8923A' },
  israeli:     { label: 'ישראלי',         en: 'Israeli',       color: '#1A6B8A' },
  cafe:        { label: 'בית קפה',        en: 'Café',          color: '#B8923A' },
  asian:       { label: 'אסיאתי',         en: 'Asian',         color: '#E76F51' },
  indian:      { label: 'הודי',           en: 'Indian',        color: '#F4A261' },
  russian:     { label: 'רוסי',           en: 'Russian',       color: '#5B9DC7' },
  halal:       { label: 'חלאל',           en: 'Halal',         color: '#2A9D8F' },
  italian:     { label: 'איטלקי',         en: 'Italian',       color: '#2A9D8F' },
  turkish:     { label: 'טורקי',          en: 'Turkish',       color: '#E76F51' },
  local:       { label: 'מקומי',          en: 'Local',         color: '#B8923A' },
  street:      { label: 'רחוב',           en: 'Street Food',   color: '#F4A261' },
  seafood:     { label: 'דגים',           en: 'Seafood',       color: '#5B9DC7' },
  steakhouse:  { label: 'סטייקייה',       en: 'Steakhouse',    color: '#E63946' },
  vegan:       { label: 'טבעוני',         en: 'Vegan',         color: '#7FA77F' },
};

function catalogImg(item: any): string {
  const img = item.image || '';
  if (!img) return '';
  if (img.startsWith('http')) return img;
  return 'https://wellcomedubai.com/' + img;
}

// Ordered list of image URLs to try (Google photo first, own catalog image as fallback).
function imgChain(item: any, cat?: string): string[] {
  const out: string[] = [];
  const entry = cat ? PHOTOS_BY_CAT[cat]?.[String(item.id)] : null;
  const first = entry?.photos?.[0]?.name;
  if (first) out.push(placePhotoUrl(first));
  const c = catalogImg(item);
  if (c) out.push(c);
  return out;
}

function imgUrl(item: any, cat?: string) {
  return imgChain(item, cat)[0] || '';
}

// <Image> that falls back to the next URL if one fails to load (e.g. expired Google photo).
function SmartImage({ item, cat, style, emoji }: { item: any; cat?: string; style: any; emoji?: string }) {
  const chain = imgChain(item, cat);
  const [idx, setIdx] = useState(0);
  if (chain.length === 0 || idx >= chain.length) {
    return (
      <View style={[style, { backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ fontSize: 36 }}>{emoji || '📷'}</Text>
      </View>
    );
  }
  return <Image source={{ uri: chain[idx] }} style={style} onError={() => setIdx(idx + 1)} />;
}

export default function CategoryScreen() {
  const { t, lang, isRTL } = useI18n();
  const s = makeStyles(isRTL);
  const L = (o: any): string => !o ? '' : (lang === 'ar' ? (o.ar ?? tcAr(o.he ?? o.label ?? '')) : lang === 'hi' ? (o.hi ?? tcHi(o.he ?? o.label ?? '')) : lang === 'ru' ? (o.ru ?? tcRu(o.he ?? o.label ?? '')) : lang === 'en' ? (o.en ?? o.he ?? o.label ?? '') : (o.he ?? o.label ?? ''));
  const { id, id: itemIdParam } = useLocalSearchParams<{ id: string }>();
  const cat = id || '';
  const meta = TITLES[cat] || { he: 'קטגוריה', en: 'Category', emoji: '📂', color: Colors.PRIMARY };
  const items: any[] = (CATALOG as any)[cat] || [];
  // Only show a subcategory tab if it actually has items (hides empty tabs like an empty "ספארי").
  const hasItems = (key: string) => key === 'all' ? true
    : key === 'michelin' ? items.some(it => (it.michelinStars || 0) > 0)
    : key === 'ultra-luxury' ? items.some(it => it.subcategory === 'ultra-luxury' && !(it.michelinStars > 0))
    : items.some(it => it.subcategory === key);
  const filters = (FILTERS[cat] || [{ label: 'הכל', en: 'All', key: 'all' }]).filter(f => hasItems(f.key));
  const firstFilter = filters.find(f => f.key !== 'all')?.key || 'all';
  const [active, setActive] = useState(firstFilter);

  // Live currency rates → show the AED price also in the viewer's language currency (same as the item page).
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  useEffect(() => { fetch('https://open.er-api.com/v6/latest/USD').then(r => r.json()).then(d => { if (d && d.rates) setRates(d.rates); }).catch(() => {}); }, []);
  const LANG_CUR: Record<string, { code: string; sym: string }> = { he: { code: 'ILS', sym: '₪' }, en: { code: 'USD', sym: '$' }, ru: { code: 'RUB', sym: '₽' }, ar: { code: 'USD', sym: '$' }, hi: { code: 'INR', sym: '₹' } };
  const convPrice = (text: string): string | null => {
    const cur = LANG_CUR[lang] || LANG_CUR.en;
    if (!rates || !rates.AED || !rates[cur.code]) return null;
    const nums = (text.match(/[\d,]+/g) || []).map(n => parseInt(n.replace(/,/g, ''), 10)).filter(n => !isNaN(n) && n >= 10);
    if (!nums.length) return null;
    return '≈ ' + nums.map(n => Math.round(n * (rates[cur.code] / rates.AED)).toLocaleString()).join('–') + ' ' + cur.sym;
  };

  const sorted = [...items].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  const list = active === 'all' ? sorted : active === 'michelin' ? sorted.filter(it => (it.michelinStars || 0) > 0) : active === 'ultra-luxury' ? sorted.filter(it => it.subcategory === 'ultra-luxury' && !(it.michelinStars > 0)) : sorted.filter(it => it.subcategory === active);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());
  useFocusEffect(useCallback(() => {
    getFavorites().then(favs => setFavIds(new Set(favs.filter(f => f.cat === cat).map(f => String(f.id)))));
  }, [cat]));
  const onToggle = async (e: any, itemId: any) => {
    e.stopPropagation?.();
    const next = await toggleFavorite(cat, itemId);
    setFavIds(prev => {
      const n = new Set(prev);
      if (next) n.add(String(itemId)); else n.delete(String(itemId));
      return n;
    });
  };

  const itemsWithCoords = list.filter(i => i.lat && i.lng);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [areasOn, setAreasOn] = useState(false);
  const filterScrollRef = useRef<ScrollView | null>(null);
  const mainScrollRef = useRef<ScrollView | null>(null);
  const [showTop, setShowTop] = useState(false);
  const [mapBig, setMapBig] = useState(false);
  const [focusItem, setFocusItem] = useState<{ lat: number; lng: number; name: string } | null>(null);
  const [mapModalItem, setMapModalItem] = useState<{ lat: number; lng: number; name: string } | null>(null);   // in-app "where is it?" window
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestStation, setNearestStation] = useState<any | null>(null);

  const askLocation = async (findNearest: boolean) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('loc.permTitle'), t('loc.permMsg'));
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const u = { lat: pos.coords.latitude, lng: pos.coords.longitude };
      setUserCoords(u);
      if (findNearest) {
        let nearest = null; let best = Infinity;
        for (const st of METRO.stations) {
          const d = haversineKm(u.lat, u.lng, st.lat, st.lng);
          if (d < best) { best = d; nearest = { ...st, _dist: d }; }
        }
        setNearestStation(nearest);
      }
    } catch {
      Alert.alert(t('loc.errTitle'), t('loc.errMsg'));
    }
  };
  const metroMapHtml = useMemo(() => {
    const userJs = userCoords ? `const u={lat:${userCoords.lat},lng:${userCoords.lng}};new google.maps.Marker({position:u,map,title:'${t('map.youAreHere')}',icon:{path:google.maps.SymbolPath.CIRCLE,scale:11,fillColor:'#1A6B8A',fillOpacity:1,strokeColor:'#fff',strokeWeight:3}});bounds.extend(u);` : '';
    const nearestJs = nearestStation ? `new google.maps.Marker({position:{lat:${nearestStation.lat},lng:${nearestStation.lng}},map,icon:{path:google.maps.SymbolPath.CIRCLE,scale:16,fillColor:'transparent',fillOpacity:0,strokeColor:'#1A6B8A',strokeWeight:3}});` : '';
    const fitJs = (userCoords || nearestStation) ? `if(bounds.isEmpty()===false)map.fitBounds(bounds,60);` : '';
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#m{margin:0;padding:0;height:100%;width:100%;}</style></head><body><div id="m"></div><script>function init(){const map=new google.maps.Map(document.getElementById('m'),{center:{lat:25.18,lng:55.25},zoom:11,mapTypeControl:false,streetViewControl:false,fullscreenControl:false,gestureHandling:'cooperative'});const bounds=new google.maps.LatLngBounds();const stations=${JSON.stringify(METRO.stations)};const redPath=[];const greenPath=[];stations.forEach(s=>{const pos={lat:s.lat,lng:s.lng};const isRed=s.lines.includes('red');const isGreen=s.lines.includes('green');const isInter=s.lines.length>1;const color=isInter?'#B8923A':(isRed?'#E63946':'#2A9D8F');const m=new google.maps.Marker({position:pos,map,title:s.nameHe,icon:{path:google.maps.SymbolPath.CIRCLE,scale:isInter?9:6,fillColor:color,fillOpacity:1,strokeColor:'#fff',strokeWeight:2}});if(isRed)redPath.push(pos);if(isGreen)greenPath.push(pos);const iw=new google.maps.InfoWindow({content:'<div style="direction:rtl;font-family:-apple-system,sans-serif;"><b>'+s.nameHe+'</b><br><span style="color:#6B7F8D;font-size:11px;">'+s.nameEn+' · '+s.area+'</span></div>'});m.addListener('click',()=>iw.open({anchor:m,map}));});if(redPath.length>1)new google.maps.Polyline({path:redPath,geodesic:true,strokeColor:'#E63946',strokeOpacity:0.85,strokeWeight:3.5,map});if(greenPath.length>1)new google.maps.Polyline({path:greenPath,geodesic:true,strokeColor:'#2A9D8F',strokeOpacity:0.85,strokeWeight:3.5,map});${userJs}${nearestJs}${fitJs}}</script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDw09Bg7XaH7apEWJBcFtogVfrdUwF_gEM&language=${lang}&callback=init" async defer></script></body></html>`;
  }, [userCoords, nearestStation]);

  const mapHtml = useMemo(() => {
    const pts = itemsWithCoords.map(it => ({
      lat: it.lat, lng: it.lng, name: it.name, nameEn: it.nameEn || '', address: it.address || '',
      rating: it.rating || '', price: it.price || it.priceRange || '', phone: it.phone || '',
      image: it.image ? (it.image.startsWith('http') ? it.image : 'https://wellcomedubai.com/' + it.image) : '',
      color: meta.color,
    }));
    const areas = [
      { num:1, name: lang === 'ar' ? tcAr('דאון טאון & ביזנס ביי') : lang === 'hi' ? tcHi('דאון טאון & ביזנס ביי') : lang === 'ru' ? tcRu('דאון טאון & ביזנס ביי') : lang === 'en' ? 'Downtown & Business Bay' : 'דאון טאון & ביזנס ביי', color:'#E76F51', poly:[[25.2080,55.2620],[25.2070,55.2790],[25.1850,55.2880],[25.1700,55.2820],[25.1690,55.2680],[25.1830,55.2570],[25.2000,55.2570]] },
      { num:2, name: lang === 'ar' ? tcAr('מרינה & JBR') : lang === 'hi' ? tcHi('מרינה & JBR') : lang === 'ru' ? tcRu('מרינה & JBR') : lang === 'en' ? 'Marina & JBR' : 'מרינה & JBR', color:'#2A9D8F', poly:[[25.0980,55.1300],[25.0950,55.1480],[25.0820,55.1560],[25.0680,55.1500],[25.0660,55.1380],[25.0780,55.1280],[25.0900,55.1260]] },
      { num:3, name: lang === 'ar' ? tcAr('פאלם ג׳ומיירה') : lang === 'hi' ? tcHi('פאלם ג׳ומיירה') : lang === 'ru' ? tcRu('פאלם ג׳ומיירה') : lang === 'en' ? 'Palm Jumeirah' : 'פאלם ג׳ומיירה', color:'#B8923A', poly:[[25.1430,55.1350],[25.1430,55.1640],[25.1340,55.1720],[25.1170,55.1720],[25.1020,55.1640],[25.0980,55.1500],[25.1020,55.1360],[25.1170,55.1280],[25.1340,55.1280]] },
      { num:4, name: lang === 'ar' ? tcAr('אל ברשה') : lang === 'hi' ? tcHi('אל ברשה') : lang === 'ru' ? tcRu('אל ברשה') : lang === 'en' ? 'Al Barsha' : 'אל ברשה', color:'#7FA77F', poly:[[25.1180,55.1880],[25.1190,55.2080],[25.1100,55.2200],[25.0980,55.2200],[25.0890,55.2120],[25.0900,55.1960],[25.1020,55.1880]] },
      { num:5, name: lang === 'ar' ? tcAr('ג׳ומיירה ביץ׳') : lang === 'hi' ? tcHi('ג׳ומיירה ביץ׳') : lang === 'ru' ? tcRu('ג׳ומיירה ביץ׳') : lang === 'en' ? 'Jumeirah Beach' : 'ג׳ומיירה ביץ׳', color:'#A86F8E', poly:[[25.2280,55.2280],[25.2230,55.2400],[25.2050,55.2510],[25.1830,55.2370],[25.1610,55.2200],[25.1400,55.2010],[25.1300,55.1900],[25.1380,55.1830],[25.1620,55.2010],[25.1860,55.2200],[25.2080,55.2330]] },
      { num:6, name: lang === 'ar' ? tcAr('אל וואסל') : lang === 'hi' ? tcHi('אל וואסל') : lang === 'ru' ? tcRu('אל וואסל') : lang === 'en' ? 'Al Wasl' : 'אל וואסל', color:'#5B9DC7', poly:[[25.2030,55.2360],[25.2030,55.2510],[25.1940,55.2560],[25.1850,55.2520],[25.1850,55.2400],[25.1940,55.2340]] },
      { num:7, name: lang === 'ar' ? tcAr('טרייד סנטר') : lang === 'hi' ? tcHi('טרייד סנטר') : lang === 'ru' ? tcRu('טרייד סנטר') : lang === 'en' ? 'Trade Centre' : 'טרייד סנטר', color:'#C9A961', poly:[[25.2300,55.2620],[25.2290,55.2800],[25.2200,55.2820],[25.2110,55.2800],[25.2100,55.2640],[25.2200,55.2600]] },
      { num:8, name: lang === 'ar' ? tcAr('אל ג׳דאף') : lang === 'hi' ? tcHi('אל ג׳דאף') : lang === 'ru' ? tcRu('אל ג׳דאף') : lang === 'en' ? 'Al Jaddaf' : 'אל ג׳דאף', color:'#6B8E5A', poly:[[25.2280,55.3110],[25.2270,55.3300],[25.2170,55.3340],[25.2050,55.3300],[25.2050,55.3140],[25.2160,55.3080]] },
      { num:9, name: lang === 'ar' ? tcAr('בור דובאי') : lang === 'hi' ? tcHi('בור דובאי') : lang === 'ru' ? tcRu('בור דובאי') : lang === 'en' ? 'Bur Dubai' : 'בור דובאי', color:'#F4A261', poly:[[25.2620,55.2880],[25.2620,55.3080],[25.2530,55.3160],[25.2410,55.3140],[25.2360,55.3050],[25.2390,55.2920],[25.2490,55.2860]] },
      { num:10, name: lang === 'ar' ? tcAr('דיירה') : lang === 'hi' ? tcHi('דיירה') : lang === 'ru' ? tcRu('דיירה') : lang === 'en' ? 'Deira' : 'דיירה', color:'#B85C8E', poly:[[25.2820,55.3160],[25.2820,55.3360],[25.2710,55.3420],[25.2620,55.3380],[25.2590,55.3260],[25.2660,55.3170],[25.2760,55.3140]] },
    ];
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#map{margin:0;padding:0;height:100%;width:100%;}.gm-style-iw{direction:rtl;font-family:-apple-system,sans-serif;}.popup-img{width:100%;height:120px;object-fit:cover;border-radius:6px;margin-bottom:6px;}.popup-name{font-weight:800;color:#2C5F6E;font-size:14px;}.popup-en{color:#6B7F8D;font-size:11px;margin-top:2px;}.popup-addr{font-size:11px;color:#6B7F8D;margin-top:4px;}.popup-meta{margin-top:5px;display:flex;gap:8px;font-size:12px;font-weight:700;}.popup-rating{color:#92400e;}.popup-price{color:#E76F51;}.popup-actions{display:flex;gap:6px;margin-top:8px;}.popup-btn{flex:1;padding:6px 8px;border-radius:5px;text-align:center;font-size:11px;font-weight:700;text-decoration:none;color:#fff;}</style></head><body><div id="map"></div><script>
      const pts = ${JSON.stringify(pts)};
      const focus = ${JSON.stringify(focusItem)};
      const areas = ${JSON.stringify(areas)};
      const showAreas = ${areasOn ? 'true' : 'false'};
      function initMap(){
        const center = focus ? { lat: focus.lat, lng: focus.lng } : (pts.length ? { lat: pts[0].lat, lng: pts[0].lng } : { lat: 25.18, lng: 55.25 });
        const map = new google.maps.Map(document.getElementById('map'), { center, zoom: focus ? 16 : 11, mapTypeControl: false, streetViewControl: false, fullscreenControl: false, gestureHandling: 'cooperative' });
        const bounds = new google.maps.LatLngBounds();
        if (showAreas) {
          areas.forEach(a => {
            const polygon = new google.maps.Polygon({ paths: a.poly.map(p => ({ lat: p[0], lng: p[1] })), strokeColor: a.color, strokeOpacity: 0.9, strokeWeight: 2, fillColor: a.color, fillOpacity: 0.3, map });
            const center = a.poly.reduce((acc, p) => ({ lat: acc.lat + p[0]/a.poly.length, lng: acc.lng + p[1]/a.poly.length }), { lat: 0, lng: 0 });
            new google.maps.Marker({ position: center, map, label: { text: String(a.num), color: '#fff', fontWeight: '800', fontSize: '12px' }, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 14, fillColor: a.color, fillOpacity: 1, strokeColor: '#fff', strokeWeight: 2 } });
            const iw = new google.maps.InfoWindow({ content: '<div style="direction:rtl;font-family:-apple-system,sans-serif;"><b style="color:'+a.color+';">'+a.num+'. '+a.name+'</b></div>' });
            polygon.addListener('click', () => iw.setPosition(center) || iw.open(map));
          });
        }
        const ptIw = new google.maps.InfoWindow();
        pts.forEach(p => {
          const m = new google.maps.Marker({ position: { lat: p.lat, lng: p.lng }, map, title: p.name, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 9, fillColor: p.color, fillOpacity: 0.95, strokeColor: '#fff', strokeWeight: 2 } });
          bounds.extend({ lat: p.lat, lng: p.lng });
          const img = p.image ? '<img class="popup-img" src="'+p.image+'" onerror="this.style.display=\\'none\\'">' : '';
          const en = p.nameEn ? '<div class="popup-en">'+p.nameEn+'</div>' : '';
          const addr = p.address ? '<div class="popup-addr">📍 '+p.address+'</div>' : '';
          const rating = p.rating ? '<span class="popup-rating">⭐ '+p.rating+'</span>' : '';
          const price = p.price ? '<span class="popup-price">'+p.price+'</span>' : '';
          const meta = (rating || price) ? '<div class="popup-meta">'+rating+price+'</div>' : '';
          const navBtn = '<a class="popup-btn" style="background:#E76F51;" href="https://www.google.com/maps/dir/?api=1&destination='+p.lat+','+p.lng+'" target="_blank">🧭 ${lang === 'ar' ? tcAr('נווט') : lang === 'hi' ? tcHi('נווט') : lang === 'ru' ? tcRu('נווט') : lang === 'en' ? 'Navigate' : 'נווט'}</a>';
          const whereBtn = '<a class="popup-btn" style="background:#C4922F;" href="https://www.google.com/maps?q='+p.lat+','+p.lng+'" target="_blank">📍 ${lang === 'ar' ? tcAr('איפה') : lang === 'hi' ? tcHi('איפה') : lang === 'ru' ? tcRu('איפה') : lang === 'en' ? 'Where' : 'איפה'}</a>';
          const phoneBtn = p.phone ? '<a class="popup-btn" style="background:#2A9D8F;" href="tel:'+p.phone+'">📞 ${lang === 'ar' ? tcAr('חייג') : lang === 'hi' ? tcHi('חייג') : lang === 'ru' ? tcRu('חייג') : lang === 'en' ? 'Call' : 'חייג'}</a>' : '';
          const html = '<div style="min-width:200px;max-width:240px;direction:rtl;">'+img+'<div class="popup-name">'+p.name+'</div>'+en+addr+meta+'<div class="popup-actions">'+navBtn+whereBtn+phoneBtn+'</div></div>';
          const openHere = () => { ptIw.setContent(html); ptIw.open({ anchor: m, map }); };
          m.addListener('mouseover', openHere);
          m.addListener('click', openHere);
        });
        if (pts.length > 1) map.fitBounds(bounds, 30);
      }
    </script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDw09Bg7XaH7apEWJBcFtogVfrdUwF_gEM&language=${lang}&callback=initMap" async defer></script></body></html>`;
  }, [itemsWithCoords, meta.color, focusItem, areasOn]);

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: meta.color }} />
      <View style={[s.header, { backgroundColor: meta.color }]}>
        <View style={{ flex: 1, flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 10 }}>
          <Text style={[s.title, { flexShrink: 1 }]} numberOfLines={1}>{L(meta)}</Text>
          <View style={s.countBadge}><Text style={[s.countTxt, { color: meta.color }]}>{list.length}</Text></View>
        </View>
        <TouchableOpacity onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/'); }} style={s.headerClose}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      {filters.length > 1 && (
        <View style={s.filterStrip}>
          <ScrollView ref={filterScrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center' }} onContentSizeChange={(w) => { if (!isRTL) filterScrollRef.current?.scrollToEnd({ animated: false }); }}>
            {cat !== 'abudhabi' && !isRTL && (
              <TouchableOpacity onPress={() => router.push('/category/abudhabi' as any)} style={s.filterTab}>
                <Text style={[s.filterText, { color: '#B85C8E', fontWeight: '700' }]} numberOfLines={1}>{'🏛 ' + t('cat.abudhabi')}</Text>
              </TouchableOpacity>
            )}
            {(() => {
              const nonAll = filters.filter(f => f.key !== 'all');
              const all = filters.filter(f => f.key === 'all');
              const ordered = isRTL ? [...nonAll, ...all] : [...all, ...nonAll.slice().reverse()];
              return ordered;
            })().map(f => {
              const isActive = active === f.key;
              return (
                <TouchableOpacity key={f.key} onPress={() => setActive(f.key)} style={[s.filterTab, isActive && { borderBottomColor: Colors.GOLD, backgroundColor: '#F5E6CB' }]}>
                  <Text style={[s.filterText, isActive && s.filterActive]} numberOfLines={1}>{L(f)}</Text>
                </TouchableOpacity>
              );
            })}
            {cat !== 'abudhabi' && isRTL && (
              <TouchableOpacity onPress={() => router.push('/category/abudhabi' as any)} style={s.filterTab}>
                <Text style={[s.filterText, { color: '#B85C8E', fontWeight: '700' }]} numberOfLines={1}>{'🏛 ' + t('cat.abudhabi')}</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}

      <ScrollView ref={mainScrollRef} contentContainerStyle={{ paddingBottom: 60 }} onScroll={(e) => setShowTop(e.nativeEvent.contentOffset.y > 800)} scrollEventThrottle={200}>
        {itemsWithCoords.length > 0 ? (
          <>
            <View style={s.mapWrap}>
              <WebView
                originWhitelist={['*']}
                source={{ html: (cat === 'transport' && (active === 'all' || active === 'metro')) ? metroMapHtml : mapHtml }}
                style={{ flex: 1 }}
                scrollEnabled={false}
              />
              <TouchableOpacity style={s.expandBtn} onPress={() => setMapBig(true)}>
                <Text style={s.expandBtnTxt}>{t('map.enlarge')}</Text>
              </TouchableOpacity>
            </View>
            <Modal visible={mapBig} animationType="fade" transparent={false} onRequestClose={() => setMapBig(false)} statusBarTranslucent>
              <View style={{ flex: 1, backgroundColor: '#000' }}>
                <View style={{ paddingTop: 50, height: 100, backgroundColor: '#000', flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14 }}>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{L(meta)}{active && active !== 'all' ? '-' + L(filters.find(f => f.key === active)) : ''}</Text>
                  <TouchableOpacity onPress={() => setMapBig(false)} style={s.mapModalCloseInline} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>{t('act.close')}</Text>
                  </TouchableOpacity>
                </View>
                <WebView originWhitelist={['*']} source={{ html: (cat === 'transport' && (active === 'all' || active === 'metro')) ? metroMapHtml : mapHtml }} style={{ flex: 1 }} />
              </View>
            </Modal>
            {cat === 'transport' && (active === 'all' || active === 'metro') ? (
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8, marginVertical: 8 }}>
                <TouchableOpacity onPress={() => askLocation(false)} style={{ flex: 1, paddingVertical: 12, backgroundColor: '#1A6B8A', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13, textAlign: 'center' }}>{t('map.whereAmI')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => askLocation(true)} style={{ flex: 1, paddingVertical: 12, backgroundColor: '#E76F51', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13, textAlign: 'center' }}>{t('map.nearest')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={s.mapToolsRow}>
                <TouchableOpacity style={s.jumpBtn} onPress={() => setJumpOpen(true)}>
                  <Text style={s.jumpBtnTxt} numberOfLines={1}>{t('map.jumpTo')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.areasBtn, areasOn && s.areasBtnOn]} onPress={() => setAreasOn(o => !o)}>
                  <Text style={[s.areasBtnTxt, areasOn && s.areasBtnTxtOn]}>{areasOn ? t('map.areasOn') : t('map.areas')}</Text>
                </TouchableOpacity>
              </View>
            )}
            {cat === 'transport' && nearestStation ? (
              <View style={{ backgroundColor: '#E8F2F7', borderRightWidth: 4, borderRightColor: '#1A6B8A', padding: 12, marginBottom: 8 }}>
                <Text style={{ color: Colors.TEXT, fontWeight: '900', fontSize: 14, writingDirection: isRTL ? 'rtl' : 'ltr' }}>🚉 {lang === 'ar' ? tcAr(nearestStation.nameHe) : lang === 'hi' ? tcHi(nearestStation.nameHe) : lang === 'ru' ? tcRu(nearestStation.nameHe) : lang === 'en' ? nearestStation.nameEn : nearestStation.nameHe}</Text>
                <Text style={{ color: Colors.MUTED, fontSize: 12, marginTop: 3, writingDirection: isRTL ? 'rtl' : 'ltr' }}>{lang === 'ar' ? tcAr(nearestStation.nameEn) : lang === 'hi' ? tcHi(nearestStation.nameEn) : lang === 'ru' ? tcRu(nearestStation.nameEn) : lang === 'en' ? nearestStation.nameHe : nearestStation.nameEn} · {nearestStation.area} · {nearestStation._dist.toFixed(2)} {t('map.kmAway')}</Text>
                <TouchableOpacity onPress={() => openMapsChoice(nearestStation.lat, nearestStation.lng, nearestStation.nameHe, 'navigate')} style={{ marginTop: 8 }}>
                  <Text style={{ color: '#1A6B8A', fontSize: 12.5, fontWeight: '700' }}>{t('act.navigateTo')}</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            <Modal visible={jumpOpen} transparent animationType="fade" onRequestClose={() => setJumpOpen(false)}>
              <TouchableOpacity activeOpacity={1} style={s.jumpBackdrop} onPress={() => setJumpOpen(false)}>
                <View style={s.jumpSheet}>
                  <Text style={s.jumpHead}>{t('map.pickLocation')}</Text>
                  <FlatList
                    data={itemsWithCoords}
                    keyExtractor={(it) => String(it.id)}
                    renderItem={({ item: it }) => (
                      <TouchableOpacity style={s.jumpRow} onPress={() => { setJumpOpen(false); setFocusItem({ lat: it.lat, lng: it.lng, name: it.name }); setMapBig(true); }}>
                        <Text style={s.jumpRowTxt} numberOfLines={1}>{it.name}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
          </>
        ) : null}
        {cat === 'transport' && (active === 'all' || active === 'metro') ? (
          <View style={{ marginBottom: 10 }}>
            <View style={{ backgroundColor: '#FAF6EE', paddingHorizontal: 16, paddingVertical: 12 }}>
              <Text style={{ color: Colors.MUTED, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6, textTransform: 'uppercase', writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }}>{t('metro.hours')}</Text>
              {METRO.hours.map((h: any, i: number) => (
                <View key={i} style={{ flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', paddingVertical: 3 }}>
                  <Text style={{ color: Colors.TEXT, fontSize: 13, fontWeight: '700', writingDirection: isRTL ? 'rtl' : 'ltr' }}>{h.day}</Text>
                  <Text style={{ color: Colors.TEXT, fontSize: 13, fontWeight: '600' }}>{h.open} – {h.close}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8, marginTop: 8 }}>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#E63946' }} />
                <Text style={{ fontSize: 12, color: Colors.TEXT, fontWeight: '700' }}>{t('metro.redLine')}</Text>
              </View>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#2A9D8F' }} />
                <Text style={{ fontSize: 12, color: Colors.TEXT, fontWeight: '700' }}>{t('metro.greenLine')}</Text>
              </View>
              <View style={{ flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#B8923A' }} />
                <Text style={{ fontSize: 12, color: Colors.TEXT, fontWeight: '700' }}>{t('metro.interchange')}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => openMapsChoice(25.2048, 55.2708, 'Dubai Public Transit', 'navigate')} style={{ backgroundColor: Colors.PRIMARY, padding: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14, textAlign: 'center' }}>{t('metro.plan')}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {list.length === 0 ? (
          <Text style={{ textAlign: 'center', color: Colors.MUTED, marginTop: 20 }}>{t('cat.empty')}</Text>
        ) : list.map(item => (
          <TouchableOpacity key={item.id} activeOpacity={0.85} style={s.card} onPress={() => router.push(`/item/${item.id}?cat=${cat}` as any)}>
            <View style={{ position: 'relative' }}>
              <SmartImage item={item} cat={cat} style={s.cardImg} emoji={meta.emoji} />
              {item.kosher ? (
                <View style={s.kosherBadge}>
                  <Text style={s.kosherText}>{t('act.kosher')}</Text>
                </View>
              ) : null}
              {item.michelinStars > 0 ? (
                <View style={s.michelinStamp}>
                  <Text style={s.michelinStampStars}>{'★'.repeat(item.michelinStars)}</Text>
                  <Text style={s.michelinStampTxt}>MICHELIN</Text>
                </View>
              ) : null}
              {item.subcategory && SUBCAT_LABELS[item.subcategory] ? (
                <View style={[s.subcatBadge, { backgroundColor: SUBCAT_LABELS[item.subcategory].color }]}>
                  <Text style={s.subcatBadgeTxt}>{L(SUBCAT_LABELS[item.subcategory])}</Text>
                </View>
              ) : null}
              {(() => {
                const isHe = /[֐-׿]/.test(item.name || '');
                const heName = item.nameHe || (isHe ? item.name : '');
                const enName = item.nameEn || (!isHe ? item.name : '');
                const dispName = lang === 'he' ? heName : (enName || heName);
                return dispName ? <Text style={[s.imgNameTxt, { writingDirection: isRTL ? 'rtl' : 'ltr' }]} numberOfLines={1}>{dispName}</Text> : null;
              })()}
              <TouchableOpacity style={s.addBtn} onPress={(e) => onToggle(e, item.id)}>
                <FontAwesome5 name="heart" solid={favIds.has(String(item.id))} size={20} color="#E76F51" style={{ textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }} />
              </TouchableOpacity>
            </View>
            <View style={s.cardBody}>
              <View style={s.cardHead}>
                <Text style={s.cardTitle} numberOfLines={1}>{lang !== 'he' ? (item.nameEn || item.name) : ((cat === 'abudhabi' || cat === 'shopping' || cat === 'casino' || cat === 'nightlife') ? (item.nameEn || item.name) : item.name)}</Text>
                {item.rating ? <View style={s.ratingBadge}><Text style={s.ratingTxt}>⭐ {item.rating}</Text></View> : null}
              </View>
              {item.description ? <Text style={[s.cardDesc, { writingDirection: isRTL ? 'rtl' : 'ltr' }]} numberOfLines={2}>{lang === 'ar' ? tcAr(item.description) : lang === 'hi' ? tcHi(item.description) : lang === 'ru' ? tcRu(item.description) : (lang === 'en' && item.descriptionEn ? item.descriptionEn : item.description)}</Text> : null}
              <View style={s.cardFooter}>
                {item.priceRange ? (
                  <View>
                    <Text style={s.priceTxt}>{lang === 'ar' ? tcAr(item.priceRange) : lang === 'hi' ? tcHi(item.priceRange) : lang === 'ru' ? tcRu(item.priceRange) : (lang === 'en' && item.priceRangeEn ? item.priceRangeEn : item.priceRange)}</Text>
                    {convPrice(String(item.priceRange)) ? <Text style={s.convTxt}>{convPrice(String(item.priceRange))}</Text> : null}
                  </View>
                ) : null}
                {item.address ? <Text style={s.addrTxt} numberOfLines={1}>📍 {item.address}</Text> : null}
              </View>
              {(item.lat || item.phone) ? (
                <View style={s.actions}>
                  {item.lat ? (
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: meta.color }]} onPress={() => openMapsChoice(item.lat, item.lng, item.name, 'navigate')}>
                      <Text style={s.actionTxt}>{t('act.navigate')}</Text>
                    </TouchableOpacity>
                  ) : null}
                  {item.lat ? (
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#F2861B' }]} onPress={() => setMapModalItem({ lat: item.lat, lng: item.lng, name: item.name })}>
                      <Text style={s.actionTxt}>{t('act.where')}</Text>
                    </TouchableOpacity>
                  ) : null}
                  {cat === 'hotels' ? (
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#1FA88F' }]} onPress={() => router.push(`/item/${item.id}?cat=${cat}` as any)}>
                      <Text style={s.actionTxt}>{t('act.info')}</Text>
                    </TouchableOpacity>
                  ) : null}
                  {cat === 'attractions' && item.ticketType && item.ticketType !== 'skip' ? (() => {
                    const cfg: Record<string, { color: string; label: string; clickable: boolean }> = {
                      online: { color: '#f97316', label: t('ticket.online'), clickable: true },
                      onsite: { color: '#64748b', label: t('ticket.onsite'), clickable: false },
                      free: { color: '#10b981', label: t('ticket.free'), clickable: false },
                      appointment: { color: '#3DA5C4', label: t('ticket.appointment'), clickable: false },
                    };
                    const c = cfg[item.ticketType];
                    if (!c) return null;
                    return c.clickable && item.ticketUrl ? (
                      <TouchableOpacity style={[s.actionBtn, { backgroundColor: c.color }]} onPress={() => Linking.openURL(item.ticketUrl)}>
                        <Text style={s.actionTxt}>{c.label}</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={[s.actionBtn, { backgroundColor: c.color, justifyContent: 'center' }]}>
                        <Text style={s.actionTxt}>{c.label}</Text>
                      </View>
                    );
                  })() : (['kids','nightlife','casino','abudhabi'].includes(cat) || (cat === 'transport' && item.subcategory === 'bus' && /sightseeing|big bus|hop on|hop-on/i.test((item.nameEn || item.name || '')))) ? (
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#FF5C00' }]} onPress={() => Linking.openURL(`https://www.getyourguide.com/s/?q=${encodeURIComponent((item.nameEn || item.name || '') + ' ' + (cat === 'abudhabi' ? 'Abu Dhabi' : 'Dubai'))}&partner_id=PE2GLSE3MAO4YDEIXLNOYXMC67BCZ32C`)}>
                      <Text style={s.actionTxt}>{t('act.buyTickets')}</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : null}
              {cat !== 'attractions' && (['kids','nightlife','casino','abudhabi'].includes(cat) || (cat === 'transport' && item.subcategory === 'bus' && /sightseeing|big bus|hop on|hop-on/i.test((item.nameEn || item.name || '')))) ? (
                <TouchableOpacity onPress={() => Linking.openURL('https://tiqets.tpk.lv/53YEgT8s')} style={{ alignSelf: 'flex-end', marginTop: 4, marginBottom: 4, marginRight: 6 }}>
                  <Text style={{ color: '#1A6B8A', fontSize: 11.5, fontWeight: '600', textDecorationLine: 'underline' }}>{t('ticket.notFound')}</Text>
                </TouchableOpacity>
              ) : null}
              {cat === 'attractions' && item.ticketUrlAlt ? (
                <TouchableOpacity onPress={() => Linking.openURL(item.ticketUrlAlt)} style={{ alignSelf: 'flex-end', marginTop: 4, marginBottom: 4, marginRight: 6 }}>
                  <Text style={{ color: '#1A6B8A', fontSize: 11.5, fontWeight: '600', textDecorationLine: 'underline' }}>{t('ticket.seeAlso')}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {showTop ? (
        <TouchableOpacity onPress={() => mainScrollRef.current?.scrollTo({ y: 0, animated: true })} style={s.topBtn}>
          <Text style={s.topBtnTxt}>↑</Text>
        </TouchableOpacity>
      ) : null}
      <Modal visible={!!iframeUrl} animationType="fade" transparent={false} onRequestClose={() => setIframeUrl(null)} statusBarTranslucent>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <View style={{ paddingTop: 50, height: 100, backgroundColor: '#000', flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{t('map.title')}</Text>
            <TouchableOpacity onPress={() => setIframeUrl(null)} style={s.mapModalCloseInline} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>{t('act.close')}</Text>
            </TouchableOpacity>
          </View>
          {iframeUrl ? <WebView originWhitelist={['*']} source={{ uri: iframeUrl }} style={{ flex: 1 }} /> : null}
        </View>
      </Modal>

      {/* In-app "where is it?" map window — no leaving the app; external maps only for directions */}
      <Modal visible={!!mapModalItem} animationType="slide" onRequestClose={() => setMapModalItem(null)}>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <View style={{ paddingTop: 50, height: 100, backgroundColor: '#000', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }} numberOfLines={1}>{mapModalItem?.name}</Text>
            <TouchableOpacity onPress={() => setMapModalItem(null)} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: '#E76F51' }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>{t('act.close')}</Text>
            </TouchableOpacity>
          </View>
          {mapModalItem ? (
            <WebView
              originWhitelist={['*']}
              source={{ html: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#m{margin:0;padding:0;height:100%;width:100%;}</style></head><body><div id="m"></div><script>function init(){const m=new google.maps.Map(document.getElementById('m'),{center:{lat:${mapModalItem.lat},lng:${mapModalItem.lng}},zoom:16,mapTypeControl:false,streetViewControl:false,fullscreenControl:false,gestureHandling:'greedy'});new google.maps.Marker({position:{lat:${mapModalItem.lat},lng:${mapModalItem.lng}},map:m,title:${JSON.stringify(mapModalItem.name)},icon:{path:google.maps.SymbolPath.CIRCLE,scale:13,fillColor:'#E76F51',fillOpacity:1,strokeColor:'#fff',strokeWeight:3}});}</script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDw09Bg7XaH7apEWJBcFtogVfrdUwF_gEM&language=${lang}&callback=init" async defer></script></body></html>` }}
              style={{ flex: 1 }}
            />
          ) : null}
          <TouchableOpacity onPress={() => mapModalItem && openMapsChoice(mapModalItem.lat, mapModalItem.lng, mapModalItem.name, 'navigate')} style={{ backgroundColor: Colors.PRIMARY, paddingVertical: 15, alignItems: 'center' }}>
            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 15 }}>{t('act.navigate')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const makeStyles = (isRTL: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  headerClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  back: { padding: 4 },
  title: { color: '#fff', fontSize: 26, fontWeight: '400', letterSpacing: 0.3, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  searchBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  countBadge: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  countTxt: { fontSize: 12, fontWeight: '900' },
  filterStrip: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', height: 44 },
  filterTab: { paddingVertical: 8, paddingHorizontal: 14, borderBottomWidth: 3, borderBottomColor: 'transparent', height: 44, justifyContent: 'center' },
  filterText: { fontSize: 15, fontWeight: '500', color: '#9CA3AF', writingDirection: isRTL ? 'rtl' : 'ltr' },
  filterActive: { fontWeight: '700', color: Colors.TEXT },
  card: { backgroundColor: '#fff', borderRadius: 0, marginBottom: 0, overflow: 'hidden', borderBottomWidth: 1, borderBottomColor: '#EAE0CE' },
  cardImg: { width: '100%', height: 200 },
  cardBody: { paddingHorizontal: 18, paddingVertical: 16 },
  cardHead: { flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  cardTitle: { flex: 1, fontSize: 22, fontWeight: '500', letterSpacing: 0.2, color: Colors.TEXT, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  ratingBadge: { backgroundColor: Colors.GOLD + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  ratingTxt: { fontSize: 13, fontWeight: '700', color: '#92400e' },
  cardDesc: { fontSize: 14, color: Colors.MUTED, marginTop: 8, lineHeight: 21, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  cardFooter: { flexDirection: isRTL ? 'row-reverse' : 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, gap: 8 },
  priceTxt: { fontSize: 15, color: Colors.ACCENT, fontWeight: '700' },
  convTxt: { fontSize: 12, color: '#2A9D8F', fontWeight: '700', marginTop: 1 },
  addrTxt: { flex: 1, fontSize: 12, color: Colors.MUTED, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: 'left' },
  kosherBadge: { position: 'absolute', bottom: 8, left: 8, backgroundColor: '#0E2A38', borderColor: Colors.GOLD, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  kosherText: { color: Colors.GOLD, fontSize: 11, fontWeight: '900' },
  imgNameTxt: { position: 'absolute', bottom: 14, right: 16, color: '#fff', fontWeight: '600', fontSize: 24, letterSpacing: 0.2, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left', maxWidth: '88%', textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 },
  actions: { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8, marginTop: 14 },
  actionBtn: { flex: 1, paddingVertical: 11, borderRadius: 0, alignItems: 'center', justifyContent: 'center' },
  actionTxt: { color: '#fff', fontSize: 12.5, fontWeight: '700', textAlign: 'center' },
  mapAllBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, marginBottom: 12, alignItems: 'center' },
  mapAllTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
  mapWrap: { height: 360, borderRadius: 10, overflow: 'hidden', marginBottom: 8, backgroundColor: '#E5E7EB', position: 'relative' },
  mapModalCloseInline: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: '#E76F51', alignItems: 'center', justifyContent: 'center' },
  expandBtn: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  expandBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  mapToolsRow: { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8, marginBottom: 12 },
  jumpBtn: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'flex-end' },
  jumpBtnTxt: { color: Colors.TEXT, fontSize: 13, writingDirection: isRTL ? 'rtl' : 'ltr' },
  areasBtn: { paddingHorizontal: 14, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  areasBtnOn: { backgroundColor: Colors.SECONDARY, borderColor: Colors.SECONDARY },
  areasBtnTxt: { color: Colors.TEXT, fontSize: 13, fontWeight: '700' },
  areasBtnTxtOn: { color: '#fff' },
  jumpBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  jumpSheet: { backgroundColor: '#fff', borderTopLeftRadius: 14, borderTopRightRadius: 14, padding: 14, maxHeight: '70%' },
  jumpHead: { fontSize: 14, fontWeight: '900', color: Colors.TEXT, marginBottom: 10, textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' },
  jumpRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0E6D2' },
  jumpRowTxt: { fontSize: 13, color: Colors.TEXT, textAlign: isRTL ? 'right' : 'left', writingDirection: isRTL ? 'rtl' : 'ltr' },
  topBtn: { position: 'absolute', bottom: 24, left: 16, width: 48, height: 48, borderRadius: 24, backgroundColor: '#E76F51', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 6 },
  topBtnTxt: { color: '#fff', fontSize: 24, fontWeight: '900', lineHeight: 28 },
  michelinStamp: { position: 'absolute', top: 8, right: 50, backgroundColor: '#C8102E', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  michelinStampStars: { color: '#FFD700', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  michelinStampTxt: { color: '#fff', fontSize: 8, fontWeight: '900', letterSpacing: 0.5, marginTop: 1 },
  subcatBadge: { position: 'absolute', top: 8, left: 8, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 3, shadowOffset: { width: 0, height: 1 } },
  subcatBadgeTxt: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.2 },
  addBtn: { position: 'absolute', top: 8, right: 8, width: 36, height: 36, alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  addBtnTxt: { color: '#fff', fontSize: 22, fontWeight: '300', lineHeight: 24 },
});
