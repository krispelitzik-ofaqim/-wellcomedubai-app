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
import { WebView } from 'react-native-webview';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
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

const TITLES: Record<string, { he: string; emoji: string; color: string }> = {
  hotels:      { he: 'מלונות',          emoji: '🏨', color: Colors.GOLD },
  attractions: { he: 'אטרקציות',      emoji: '🎡', color: Colors.SECONDARY },
  restaurants: { he: 'מסעדות',         emoji: '🍽️', color: Colors.WARM },
  shopping:    { he: 'קניות',           emoji: '🛍️', color: Colors.WARM },
  nightlife:   { he: 'בילויים',         emoji: '🍻', color: Colors.PINK },
  transport:   { he: 'תחבורה',          emoji: '🚕', color: Colors.PRIMARY },
  kids:        { he: 'ילדים ומשפחות', emoji: '👨‍👩‍👧', color: Colors.ACCENT },
  casino:      { he: 'בידור ומשחקים', emoji: '🎰', color: Colors.GOLD },
  abudhabi:    { he: 'אבו דאבי',        emoji: '🏛', color: Colors.PINK },
};

const FILTERS: Record<string, { label: string; key: string }[]> = {
  hotels:      [{label:'הכל',key:'all'},{label:'יוקרה',key:'7star'},{label:'תקציב גבוה',key:'5star'},{label:'תקציב בינוני',key:'4-5star'},{label:'סביר',key:'3-4star'},{label:'תקציב צנוע',key:'budget'}],
  attractions: [{label:'הכל',key:'all'},{label:'חובה',key:'landmark'},{label:'מוזיאון',key:'museum'},{label:'אומנות',key:'art'},{label:'אקסטרים',key:'extreme'},{label:'חוף',key:'beach'},{label:'פארק מים',key:'waterpark'},{label:'פארק שעשועים',key:'theme-park'},{label:'סיור',key:'tour'},{label:'גן חיות',key:'zoo'},{label:'ספארי',key:'desert'},{label:'יהדות',key:'judaism'},{label:'ספורט',key:'sport'},{label:'אקווריום',key:'aquarium'},{label:'מופע',key:'show'},{label:'הרפתקה',key:'adventure'}],
  restaurants: [{label:'הכל',key:'all'},{label:'⭐ מישלין',key:'michelin'},{label:'יוקרה',key:'ultra-luxury'},{label:'ישראלי',key:'israeli'},{label:'בתי קפה',key:'cafe'},{label:'אסיאתי',key:'asian'},{label:'הודי',key:'indian'},{label:'איטלקי',key:'italian'},{label:'טורקי',key:'turkish'},{label:'מקומי',key:'local'},{label:'רחוב',key:'street'},{label:'דגים',key:'seafood'},{label:'סטייקייה',key:'steakhouse'},{label:'טבעוני',key:'vegan'}],
  shopping:    [{label:'הכל',key:'all'},{label:'קניון',key:'mall'},{label:'שוק',key:'souk'},{label:'אלכוהול וסיגרים',key:'alcohol'}],
  nightlife:   [{label:'הכל',key:'all'},{label:'בר',key:'bar'},{label:'מועדון',key:'club'},{label:'אלכוהול',key:'alcohol'}],
  transport:   [{label:'הכל',key:'all'},{label:'מטרו',key:'metro'},{label:'מונית',key:'taxi'},{label:'אפליקציות',key:'app'},{label:'השכרת רכב',key:'car-rental'},{label:'אוטובוס',key:'bus'},{label:'אברה',key:'boat'}],
  kids:        [{label:'הכל',key:'all'}],
  casino:      [{label:'הכל',key:'all'},{label:'קזינו',key:'casino'},{label:'מרוצים',key:'racing'},{label:'ספורט',key:'sport'},{label:'הופעות',key:'music-show'}],
  abudhabi:    [{label:'הכל',key:'all'}],
};

const SUBCAT_LABELS: Record<string, { label: string; color: string }> = {
  landmark:    { label: 'חובה',          color: '#E76F51' },
  museum:      { label: 'מוזיאון',       color: '#2A9D8F' },
  art:         { label: 'אומנות',         color: '#B85C8E' },
  adventure:   { label: 'הרפתקה',         color: '#F4A261' },
  extreme:     { label: 'אקסטרים',        color: '#E63946' },
  beach:       { label: 'חוף',            color: '#5B9DC7' },
  waterpark:   { label: 'פארק מים',       color: '#5B9DC7' },
  'theme-park':{ label: 'פארק שעשועים',   color: '#F4A261' },
  tour:        { label: 'סיור',           color: '#B8923A' },
  zoo:         { label: 'גן חיות',        color: '#7FA77F' },
  aquarium:    { label: 'אקווריום',       color: '#5B9DC7' },
  snow:        { label: 'סקי',            color: '#1A6B8A' },
  desert:      { label: 'ספארי',          color: '#B8923A' },
  show:        { label: 'מופע',           color: '#B85C8E' },
  sport:       { label: 'ספורט',          color: '#2A9D8F' },
  judaism:     { label: 'יהדות',          color: '#1A4A5E' },
  'kids-zone': { label: 'ילדים',          color: '#E76F51' },
  'kids-city': { label: 'עיר הילדים',      color: '#E76F51' },
  'vr-park':   { label: 'פארק מציאות מדומה', color: '#B85C8E' },
  trampoline:  { label: 'מתחם טרמפולינה',  color: '#F4A261' },
  arcade:      { label: 'לונה פארק',       color: '#E63946' },
  toddlers:    { label: 'פארק משחקים לפעוטות', color: '#5B9DC7' },
  '7star':     { label: '7★',             color: '#B8923A' },
  '5star':     { label: '5★',             color: '#B8923A' },
  '4-5star':   { label: '4-5★',           color: '#B8923A' },
  '3-4star':   { label: '3-4★',           color: '#7FA77F' },
  budget:      { label: 'תקציבי',         color: '#7FA77F' },
  mall:        { label: 'קניון',          color: '#F4A261' },
  souk:        { label: 'שוק',            color: '#B8923A' },
  alcohol:     { label: 'אלכוהול',        color: '#E63946' },
  metro:       { label: 'מטרו',           color: '#E63946' },
  taxi:        { label: 'מונית',          color: '#B8923A' },
  bus:         { label: 'אוטובוס',        color: '#F4A261' },
  app:         { label: 'אפליקציה',       color: '#1A6B8A' },
  boat:        { label: 'סירה',           color: '#5B9DC7' },
  'car-rental':{ label: 'השכרת רכב',      color: '#7FA77F' },
  bar:         { label: 'בר',             color: '#B85C8E' },
  club:        { label: 'מועדון',          color: '#B85C8E' },
  entertainment:{ label: 'בידור',         color: '#E76F51' },
  casino:      { label: 'קזינו',          color: '#B8923A' },
  racing:      { label: 'מרוצים',         color: '#E63946' },
  'music-show':{ label: 'מופע',           color: '#B85C8E' },
  ultraluxury: { label: 'יוקרה',          color: '#B8923A' },
  'ultra-luxury': { label: 'יוקרה',       color: '#B8923A' },
  israeli:     { label: 'ישראלי',         color: '#1A6B8A' },
  cafe:        { label: 'בית קפה',        color: '#B8923A' },
  asian:       { label: 'אסיאתי',         color: '#E76F51' },
  indian:      { label: 'הודי',           color: '#F4A261' },
  italian:     { label: 'איטלקי',         color: '#2A9D8F' },
  turkish:     { label: 'טורקי',          color: '#E76F51' },
  local:       { label: 'מקומי',          color: '#B8923A' },
  street:      { label: 'רחוב',           color: '#F4A261' },
  seafood:     { label: 'דגים',           color: '#5B9DC7' },
  steakhouse:  { label: 'סטייקייה',       color: '#E63946' },
  vegan:       { label: 'טבעוני',         color: '#7FA77F' },
};

function imgUrl(item: any, cat?: string) {
  const entry = cat ? PHOTOS_BY_CAT[cat]?.[String(item.id)] : null;
  const first = entry?.photos?.[0]?.name;
  if (first) return placePhotoUrl(first);
  const img = item.image || '';
  if (!img) return '';
  if (img.startsWith('http')) return img;
  return 'https://wellcomedubai.com/' + img;
}

export default function CategoryScreen() {
  const { id, id: itemIdParam } = useLocalSearchParams<{ id: string }>();
  const cat = id || '';
  const meta = TITLES[cat] || { he: 'קטגוריה', emoji: '📂', color: Colors.PRIMARY };
  const items: any[] = (CATALOG as any)[cat] || [];
  const filters = FILTERS[cat] || [{ label: 'הכל', key: 'all' }];
  const firstFilter = filters.find(f => f.key !== 'all')?.key || 'all';
  const [active, setActive] = useState(firstFilter);

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
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [nearestStation, setNearestStation] = useState<any | null>(null);

  const askLocation = async (findNearest: boolean) => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('הרשאת מיקום', 'יש לאשר הרשאת מיקום בהגדרות.');
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
      Alert.alert('שגיאה', 'לא הצלחנו לאתר את המיקום.');
    }
  };
  const metroMapHtml = useMemo(() => {
    const userJs = userCoords ? `const u={lat:${userCoords.lat},lng:${userCoords.lng}};new google.maps.Marker({position:u,map,title:'אני כאן',icon:{path:google.maps.SymbolPath.CIRCLE,scale:11,fillColor:'#1A6B8A',fillOpacity:1,strokeColor:'#fff',strokeWeight:3}});bounds.extend(u);` : '';
    const nearestJs = nearestStation ? `new google.maps.Marker({position:{lat:${nearestStation.lat},lng:${nearestStation.lng}},map,icon:{path:google.maps.SymbolPath.CIRCLE,scale:16,fillColor:'transparent',fillOpacity:0,strokeColor:'#1A6B8A',strokeWeight:3}});` : '';
    const fitJs = (userCoords || nearestStation) ? `if(bounds.isEmpty()===false)map.fitBounds(bounds,60);` : '';
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#m{margin:0;padding:0;height:100%;width:100%;}</style></head><body><div id="m"></div><script>function init(){const map=new google.maps.Map(document.getElementById('m'),{center:{lat:25.18,lng:55.25},zoom:11,mapTypeControl:false,streetViewControl:false,fullscreenControl:false});const bounds=new google.maps.LatLngBounds();const stations=${JSON.stringify(METRO.stations)};const redPath=[];const greenPath=[];stations.forEach(s=>{const pos={lat:s.lat,lng:s.lng};const isRed=s.lines.includes('red');const isGreen=s.lines.includes('green');const isInter=s.lines.length>1;const color=isInter?'#B8923A':(isRed?'#E63946':'#2A9D8F');const m=new google.maps.Marker({position:pos,map,title:s.nameHe,icon:{path:google.maps.SymbolPath.CIRCLE,scale:isInter?9:6,fillColor:color,fillOpacity:1,strokeColor:'#fff',strokeWeight:2}});if(isRed)redPath.push(pos);if(isGreen)greenPath.push(pos);const iw=new google.maps.InfoWindow({content:'<div style="direction:rtl;font-family:-apple-system,sans-serif;"><b>'+s.nameHe+'</b><br><span style="color:#6B7F8D;font-size:11px;">'+s.nameEn+' · '+s.area+'</span></div>'});m.addListener('click',()=>iw.open({anchor:m,map}));});if(redPath.length>1)new google.maps.Polyline({path:redPath,geodesic:true,strokeColor:'#E63946',strokeOpacity:0.85,strokeWeight:3.5,map});if(greenPath.length>1)new google.maps.Polyline({path:greenPath,geodesic:true,strokeColor:'#2A9D8F',strokeOpacity:0.85,strokeWeight:3.5,map});${userJs}${nearestJs}${fitJs}}</script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDw09Bg7XaH7apEWJBcFtogVfrdUwF_gEM&language=he&callback=init" async defer></script></body></html>`;
  }, [userCoords, nearestStation]);

  const mapHtml = useMemo(() => {
    const pts = itemsWithCoords.map(it => ({
      lat: it.lat, lng: it.lng, name: it.name, nameEn: it.nameEn || '', address: it.address || '',
      rating: it.rating || '', price: it.price || it.priceRange || '', phone: it.phone || '',
      image: it.image ? (it.image.startsWith('http') ? it.image : 'https://wellcomedubai.com/' + it.image) : '',
      color: meta.color,
    }));
    const areas = [
      { num:1, name:'דאון טאון & ביזנס ביי', color:'#E76F51', poly:[[25.2080,55.2620],[25.2070,55.2790],[25.1850,55.2880],[25.1700,55.2820],[25.1690,55.2680],[25.1830,55.2570],[25.2000,55.2570]] },
      { num:2, name:'מרינה & JBR', color:'#2A9D8F', poly:[[25.0980,55.1300],[25.0950,55.1480],[25.0820,55.1560],[25.0680,55.1500],[25.0660,55.1380],[25.0780,55.1280],[25.0900,55.1260]] },
      { num:3, name:'פאלם ג׳ומיירה', color:'#B8923A', poly:[[25.1430,55.1350],[25.1430,55.1640],[25.1340,55.1720],[25.1170,55.1720],[25.1020,55.1640],[25.0980,55.1500],[25.1020,55.1360],[25.1170,55.1280],[25.1340,55.1280]] },
      { num:4, name:'אל ברשה', color:'#7FA77F', poly:[[25.1180,55.1880],[25.1190,55.2080],[25.1100,55.2200],[25.0980,55.2200],[25.0890,55.2120],[25.0900,55.1960],[25.1020,55.1880]] },
      { num:5, name:'ג׳ומיירה ביץ׳', color:'#A86F8E', poly:[[25.2280,55.2280],[25.2230,55.2400],[25.2050,55.2510],[25.1830,55.2370],[25.1610,55.2200],[25.1400,55.2010],[25.1300,55.1900],[25.1380,55.1830],[25.1620,55.2010],[25.1860,55.2200],[25.2080,55.2330]] },
      { num:6, name:'אל וואסל', color:'#5B9DC7', poly:[[25.2030,55.2360],[25.2030,55.2510],[25.1940,55.2560],[25.1850,55.2520],[25.1850,55.2400],[25.1940,55.2340]] },
      { num:7, name:'טרייד סנטר', color:'#C9A961', poly:[[25.2300,55.2620],[25.2290,55.2800],[25.2200,55.2820],[25.2110,55.2800],[25.2100,55.2640],[25.2200,55.2600]] },
      { num:8, name:'אל ג׳דאף', color:'#6B8E5A', poly:[[25.2280,55.3110],[25.2270,55.3300],[25.2170,55.3340],[25.2050,55.3300],[25.2050,55.3140],[25.2160,55.3080]] },
      { num:9, name:'בור דובאי', color:'#F4A261', poly:[[25.2620,55.2880],[25.2620,55.3080],[25.2530,55.3160],[25.2410,55.3140],[25.2360,55.3050],[25.2390,55.2920],[25.2490,55.2860]] },
      { num:10, name:'דיירה', color:'#B85C8E', poly:[[25.2820,55.3160],[25.2820,55.3360],[25.2710,55.3420],[25.2620,55.3380],[25.2590,55.3260],[25.2660,55.3170],[25.2760,55.3140]] },
    ];
    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#map{margin:0;padding:0;height:100%;width:100%;}.gm-style-iw{direction:rtl;font-family:-apple-system,sans-serif;}.popup-img{width:100%;height:120px;object-fit:cover;border-radius:6px;margin-bottom:6px;}.popup-name{font-weight:800;color:#2C5F6E;font-size:14px;}.popup-en{color:#6B7F8D;font-size:11px;margin-top:2px;}.popup-addr{font-size:11px;color:#6B7F8D;margin-top:4px;}.popup-meta{margin-top:5px;display:flex;gap:8px;font-size:12px;font-weight:700;}.popup-rating{color:#92400e;}.popup-price{color:#E76F51;}.popup-actions{display:flex;gap:6px;margin-top:8px;}.popup-btn{flex:1;padding:6px 8px;border-radius:5px;text-align:center;font-size:11px;font-weight:700;text-decoration:none;color:#fff;}</style></head><body><div id="map"></div><script>
      const pts = ${JSON.stringify(pts)};
      const focus = ${JSON.stringify(focusItem)};
      const areas = ${JSON.stringify(areas)};
      const showAreas = ${areasOn ? 'true' : 'false'};
      function initMap(){
        const center = focus ? { lat: focus.lat, lng: focus.lng } : (pts.length ? { lat: pts[0].lat, lng: pts[0].lng } : { lat: 25.18, lng: 55.25 });
        const map = new google.maps.Map(document.getElementById('map'), { center, zoom: focus ? 16 : 11, mapTypeControl: false, streetViewControl: false, fullscreenControl: false });
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
        pts.forEach(p => {
          const m = new google.maps.Marker({ position: { lat: p.lat, lng: p.lng }, map, title: p.name, icon: { path: google.maps.SymbolPath.CIRCLE, scale: 9, fillColor: p.color, fillOpacity: 0.95, strokeColor: '#fff', strokeWeight: 2 } });
          bounds.extend({ lat: p.lat, lng: p.lng });
          const img = p.image ? '<img class="popup-img" src="'+p.image+'" onerror="this.style.display=\\'none\\'">' : '';
          const en = p.nameEn ? '<div class="popup-en">'+p.nameEn+'</div>' : '';
          const addr = p.address ? '<div class="popup-addr">📍 '+p.address+'</div>' : '';
          const rating = p.rating ? '<span class="popup-rating">⭐ '+p.rating+'</span>' : '';
          const price = p.price ? '<span class="popup-price">'+p.price+'</span>' : '';
          const meta = (rating || price) ? '<div class="popup-meta">'+rating+price+'</div>' : '';
          const navBtn = '<a class="popup-btn" style="background:#E76F51;" href="https://www.google.com/maps/dir/?api=1&destination='+p.lat+','+p.lng+'" target="_blank">🧭 נווט</a>';
          const whereBtn = '<a class="popup-btn" style="background:#C4922F;" href="https://www.google.com/maps?q='+p.lat+','+p.lng+'" target="_blank">📍 איפה</a>';
          const phoneBtn = p.phone ? '<a class="popup-btn" style="background:#2A9D8F;" href="tel:'+p.phone+'">📞 חייג</a>' : '';
          const html = '<div style="min-width:200px;max-width:240px;direction:rtl;">'+img+'<div class="popup-name">'+p.name+'</div>'+en+addr+meta+'<div class="popup-actions">'+navBtn+whereBtn+phoneBtn+'</div></div>';
          const iw = new google.maps.InfoWindow({ content: html });
          m.addListener('click', () => iw.open({ anchor: m, map }));
        });
        if (pts.length > 1) map.fitBounds(bounds, 30);
      }
    </script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDw09Bg7XaH7apEWJBcFtogVfrdUwF_gEM&language=he&callback=initMap" async defer></script></body></html>`;
  }, [itemsWithCoords, meta.color, focusItem, areasOn]);

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: meta.color }} />
      <View style={[s.header, { backgroundColor: meta.color }]}>
        <Text style={[s.title, { flex: 1 }]}>{meta.he}</Text>
        <View style={s.countBadge}><Text style={[s.countTxt, { color: meta.color }]}>{list.length}</Text></View>
        <TouchableOpacity onPress={() => router.back()} style={s.headerClose}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Filter tabs */}
      {filters.length > 1 && (
        <View style={s.filterStrip}>
          <ScrollView ref={filterScrollRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center' }} onContentSizeChange={(w) => { if (!I18nManager.isRTL) filterScrollRef.current?.scrollToEnd({ animated: false }); }}>
            {cat !== 'abudhabi' && !I18nManager.isRTL && (
              <TouchableOpacity onPress={() => router.push('/category/abudhabi' as any)} style={s.filterTab}>
                <Text style={[s.filterText, { color: '#B85C8E', fontWeight: '700' }]} numberOfLines={1}>🏛 אבו דאבי</Text>
              </TouchableOpacity>
            )}
            {(() => {
              const nonAll = filters.filter(f => f.key !== 'all');
              const all = filters.filter(f => f.key === 'all');
              const ordered = I18nManager.isRTL ? [...nonAll, ...all] : [...all, ...nonAll.slice().reverse()];
              return ordered;
            })().map(f => {
              const isActive = active === f.key;
              return (
                <TouchableOpacity key={f.key} onPress={() => setActive(f.key)} style={[s.filterTab, isActive && { borderBottomColor: Colors.GOLD, backgroundColor: '#F5E6CB' }]}>
                  <Text style={[s.filterText, isActive && s.filterActive]} numberOfLines={1}>{f.label}</Text>
                </TouchableOpacity>
              );
            })}
            {cat !== 'abudhabi' && I18nManager.isRTL && (
              <TouchableOpacity onPress={() => router.push('/category/abudhabi' as any)} style={s.filterTab}>
                <Text style={[s.filterText, { color: '#B85C8E', fontWeight: '700' }]} numberOfLines={1}>🏛 אבו דאבי</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
      )}

      <ScrollView ref={mainScrollRef} contentContainerStyle={{ padding: 12, paddingBottom: 60 }} onScroll={(e) => setShowTop(e.nativeEvent.contentOffset.y > 800)} scrollEventThrottle={200}>
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
                <Text style={s.expandBtnTxt}>⛶ הגדל מפה</Text>
              </TouchableOpacity>
            </View>
            <Modal visible={mapBig} animationType="fade" transparent={false} onRequestClose={() => setMapBig(false)} statusBarTranslucent>
              <View style={{ flex: 1, backgroundColor: '#000' }}>
                <View style={{ paddingTop: 50, height: 100, backgroundColor: '#000', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14 }}>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{meta.he}{active && active !== 'all' ? '-' + (filters.find(f => f.key === active)?.label || '') : ''}</Text>
                  <TouchableOpacity onPress={() => setMapBig(false)} style={s.mapModalCloseInline} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
                    <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>סגור ✕</Text>
                  </TouchableOpacity>
                </View>
                <WebView originWhitelist={['*']} source={{ html: (cat === 'transport' && (active === 'all' || active === 'metro')) ? metroMapHtml : mapHtml }} style={{ flex: 1 }} />
              </View>
            </Modal>
            {cat === 'transport' && (active === 'all' || active === 'metro') ? (
              <View style={{ flexDirection: 'row-reverse', gap: 8, marginVertical: 8 }}>
                <TouchableOpacity onPress={() => askLocation(false)} style={{ flex: 1, paddingVertical: 12, backgroundColor: '#1A6B8A', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13, textAlign: 'center' }}>איפה אני?</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => askLocation(true)} style={{ flex: 1, paddingVertical: 12, backgroundColor: '#E76F51', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#fff', fontWeight: '800', fontSize: 13, textAlign: 'center' }}>התחנה הקרובה</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={s.mapToolsRow}>
                <TouchableOpacity style={s.jumpBtn} onPress={() => setJumpOpen(true)}>
                  <Text style={s.jumpBtnTxt} numberOfLines={1}>📍 קפוץ למיקום על המפה...</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.areasBtn, areasOn && s.areasBtnOn]} onPress={() => setAreasOn(o => !o)}>
                  <Text style={[s.areasBtnTxt, areasOn && s.areasBtnTxtOn]}>{areasOn ? '✓ אזורים' : 'אזורים'}</Text>
                </TouchableOpacity>
              </View>
            )}
            {cat === 'transport' && nearestStation ? (
              <View style={{ backgroundColor: '#E8F2F7', borderRightWidth: 4, borderRightColor: '#1A6B8A', padding: 12, marginBottom: 8 }}>
                <Text style={{ color: Colors.TEXT, fontWeight: '900', fontSize: 14, writingDirection: 'rtl' }}>🚉 {nearestStation.nameHe}</Text>
                <Text style={{ color: Colors.MUTED, fontSize: 12, marginTop: 3, writingDirection: 'rtl' }}>{nearestStation.nameEn} · {nearestStation.area} · {nearestStation._dist.toFixed(2)} ק"מ ממך</Text>
                <TouchableOpacity onPress={() => openMapsChoice(nearestStation.lat, nearestStation.lng, nearestStation.nameHe, 'navigate')} style={{ marginTop: 8 }}>
                  <Text style={{ color: '#1A6B8A', fontSize: 12.5, fontWeight: '700' }}>נווט אליה ←</Text>
                </TouchableOpacity>
              </View>
            ) : null}
            <Modal visible={jumpOpen} transparent animationType="fade" onRequestClose={() => setJumpOpen(false)}>
              <TouchableOpacity activeOpacity={1} style={s.jumpBackdrop} onPress={() => setJumpOpen(false)}>
                <View style={s.jumpSheet}>
                  <Text style={s.jumpHead}>בחר מיקום על המפה</Text>
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
              <Text style={{ color: Colors.MUTED, fontSize: 11, fontWeight: '700', letterSpacing: 0.8, marginBottom: 6, textTransform: 'uppercase', writingDirection: 'rtl', textAlign: 'right' }}>שעות פעילות מטרו</Text>
              {METRO.hours.map((h: any, i: number) => (
                <View key={i} style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', paddingVertical: 3 }}>
                  <Text style={{ color: Colors.TEXT, fontSize: 13, fontWeight: '700', writingDirection: 'rtl' }}>{h.day}</Text>
                  <Text style={{ color: Colors.TEXT, fontSize: 13, fontWeight: '600' }}>{h.open} – {h.close}</Text>
                </View>
              ))}
            </View>
            <View style={{ flexDirection: 'row-reverse', gap: 8, marginTop: 8 }}>
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#E63946' }} />
                <Text style={{ fontSize: 12, color: Colors.TEXT, fontWeight: '700' }}>הקו האדום</Text>
              </View>
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#2A9D8F' }} />
                <Text style={{ fontSize: 12, color: Colors.TEXT, fontWeight: '700' }}>הקו הירוק</Text>
              </View>
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: '#B8923A' }} />
                <Text style={{ fontSize: 12, color: Colors.TEXT, fontWeight: '700' }}>החלפה</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => openMapsChoice(25.2048, 55.2708, 'Dubai Public Transit', 'navigate')} style={{ backgroundColor: Colors.PRIMARY, padding: 14, alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14, textAlign: 'center' }}>תכנן מסלול בתחבורה ציבורית</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {list.length === 0 ? (
          <Text style={{ textAlign: 'center', color: Colors.MUTED, marginTop: 20 }}>אין פריטים בקטגוריה זו</Text>
        ) : list.map(item => (
          <TouchableOpacity key={item.id} activeOpacity={0.85} style={s.card} onPress={() => router.push(`/item/${item.id}?cat=${cat}` as any)}>
            <View style={{ position: 'relative' }}>
              {imgUrl(item, cat) ? (
                <Image source={{ uri: imgUrl(item, cat) }} style={s.cardImg} />
              ) : (
                <View style={[s.cardImg, { backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center' }]}>
                  <Text style={{ fontSize: 36 }}>{meta.emoji}</Text>
                </View>
              )}
              {item.kosher ? (
                <View style={s.kosherBadge}>
                  <Text style={s.kosherText}>✡ מכבד כשרות</Text>
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
                  <Text style={s.subcatBadgeTxt}>{SUBCAT_LABELS[item.subcategory].label}</Text>
                </View>
              ) : null}
              {(() => {
                const isHe = /[֐-׿]/.test(item.name || '');
                const heName = item.nameHe || (isHe ? item.name : '');
                return heName ? <Text style={s.imgNameTxt} numberOfLines={1}>{heName}</Text> : null;
              })()}
              <TouchableOpacity style={s.addBtn} onPress={(e) => onToggle(e, item.id)}>
                <FontAwesome5 name="heart" solid={favIds.has(String(item.id))} size={20} color="#E76F51" style={{ textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4 }} />
              </TouchableOpacity>
            </View>
            <View style={s.cardBody}>
              <View style={s.cardHead}>
                <Text style={s.cardTitle} numberOfLines={1}>{(cat === 'abudhabi' || cat === 'shopping' || cat === 'casino' || cat === 'nightlife') ? (item.nameEn || item.name) : item.name}</Text>
                {item.rating ? <View style={s.ratingBadge}><Text style={s.ratingTxt}>⭐ {item.rating}</Text></View> : null}
              </View>
              {item.description ? <Text style={s.cardDesc} numberOfLines={2}>{item.description}</Text> : null}
              <View style={s.cardFooter}>
                {item.priceRange ? <Text style={s.priceTxt}>{item.priceRange}</Text> : null}
                {item.address ? <Text style={s.addrTxt} numberOfLines={1}>📍 {item.address}</Text> : null}
              </View>
              {(item.lat || item.phone) ? (
                <View style={s.actions}>
                  {item.lat ? (
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: Colors.PRIMARY }]} onPress={() => openMapsChoice(item.lat, item.lng, item.name, 'navigate')}>
                      <Text style={s.actionTxt}>נווט</Text>
                    </TouchableOpacity>
                  ) : null}
                  {item.lat ? (
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: Colors.WARM }]} onPress={() => openMapsChoice(item.lat, item.lng, item.name, 'show')}>
                      <Text style={s.actionTxt}>איפה זה?</Text>
                    </TouchableOpacity>
                  ) : null}
                  {cat === 'hotels' ? (
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: Colors.SECONDARY }]} onPress={() => router.push(`/item/${item.id}?cat=${cat}` as any)}>
                      <Text style={s.actionTxt}>מידע</Text>
                    </TouchableOpacity>
                  ) : null}
                  {(['attractions','kids','nightlife','casino','abudhabi'].includes(cat) || (cat === 'transport' && item.subcategory === 'bus' && /sightseeing|big bus|hop on|hop-on/i.test((item.nameEn || item.name || '')))) ? (
                    <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#FF5C00' }]} onPress={() => Linking.openURL('https://klook.tpk.lv/8HSINbXI')}>
                      <Text style={s.actionTxt}>רכוש כרטיסים</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : null}
              {(['attractions','kids','nightlife','casino','abudhabi'].includes(cat) || (cat === 'transport' && item.subcategory === 'bus' && /sightseeing|big bus|hop on|hop-on/i.test((item.nameEn || item.name || '')))) ? (
                <TouchableOpacity onPress={() => Linking.openURL('https://tiqets.tpk.lv/53YEgT8s')} style={{ alignSelf: 'flex-end', marginTop: 4, marginBottom: 4, marginRight: 6 }}>
                  <Text style={{ color: '#1A6B8A', fontSize: 11.5, fontWeight: '600', textDecorationLine: 'underline' }}>לא מצאת כרטיס? נסה כאן ←</Text>
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
          <View style={{ paddingTop: 50, height: 100, backgroundColor: '#000', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>מפה</Text>
            <TouchableOpacity onPress={() => setIframeUrl(null)} style={s.mapModalCloseInline} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }}>
              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '800' }}>סגור ✕</Text>
            </TouchableOpacity>
          </View>
          {iframeUrl ? <WebView originWhitelist={['*']} source={{ uri: iframeUrl }} style={{ flex: 1 }} /> : null}
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  headerClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.25)', alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  back: { padding: 4 },
  title: { flex: 1, color: '#fff', fontSize: 17, fontWeight: '900', writingDirection: 'rtl', textAlign: 'right' },
  searchBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  countBadge: { backgroundColor: '#fff', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  countTxt: { fontSize: 12, fontWeight: '900' },
  filterStrip: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', height: 44 },
  filterTab: { paddingVertical: 8, paddingHorizontal: 14, borderBottomWidth: 3, borderBottomColor: 'transparent', height: 44, justifyContent: 'center' },
  filterText: { fontSize: 14, fontWeight: '600', color: '#9CA3AF', writingDirection: 'rtl' },
  filterActive: { fontWeight: '900', color: Colors.TEXT },
  card: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  cardImg: { width: '100%', height: 160 },
  cardBody: { padding: 12 },
  cardHead: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: '900', color: Colors.TEXT, writingDirection: 'rtl', textAlign: 'right' },
  ratingBadge: { backgroundColor: Colors.GOLD + '20', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  ratingTxt: { fontSize: 11, fontWeight: '800', color: '#92400e' },
  cardDesc: { fontSize: 12, color: Colors.MUTED, marginTop: 4, lineHeight: 17, writingDirection: 'rtl', textAlign: 'right' },
  cardFooter: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginTop: 6, gap: 8 },
  priceTxt: { fontSize: 11, color: Colors.ACCENT, fontWeight: '800' },
  addrTxt: { flex: 1, fontSize: 11, color: Colors.MUTED, writingDirection: 'rtl', textAlign: 'left' },
  kosherBadge: { position: 'absolute', bottom: 8, left: 8, backgroundColor: '#0E2A38', borderColor: Colors.GOLD, borderWidth: 1, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  kosherText: { color: Colors.GOLD, fontSize: 11, fontWeight: '900' },
  imgNameTxt: { position: 'absolute', bottom: 12, right: 14, color: '#fff', fontWeight: '900', fontSize: 18, letterSpacing: -0.3, writingDirection: 'rtl', textAlign: 'right', maxWidth: '85%', textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 6 },
  actions: { flexDirection: 'row-reverse', gap: 6, marginTop: 10 },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center', justifyContent: 'center' },
  actionTxt: { color: '#fff', fontSize: 11, fontWeight: '800', textAlign: 'center' },
  mapAllBtn: { paddingVertical: 12, paddingHorizontal: 16, borderRadius: 10, marginBottom: 12, alignItems: 'center' },
  mapAllTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
  mapWrap: { height: 360, borderRadius: 10, overflow: 'hidden', marginBottom: 8, backgroundColor: '#E5E7EB', position: 'relative' },
  mapModalCloseInline: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: '#E76F51', alignItems: 'center', justifyContent: 'center' },
  expandBtn: { position: 'absolute', bottom: 10, left: 10, backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8 },
  expandBtnTxt: { color: '#fff', fontSize: 12, fontWeight: '700' },
  mapToolsRow: { flexDirection: 'row-reverse', gap: 8, marginBottom: 12 },
  jumpBtn: { flex: 1, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 12, alignItems: 'flex-end' },
  jumpBtnTxt: { color: Colors.TEXT, fontSize: 13, writingDirection: 'rtl' },
  areasBtn: { paddingHorizontal: 14, borderWidth: 1, borderColor: '#E5E7EB', backgroundColor: '#fff', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  areasBtnOn: { backgroundColor: Colors.SECONDARY, borderColor: Colors.SECONDARY },
  areasBtnTxt: { color: Colors.TEXT, fontSize: 13, fontWeight: '700' },
  areasBtnTxtOn: { color: '#fff' },
  jumpBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)', justifyContent: 'flex-end' },
  jumpSheet: { backgroundColor: '#fff', borderTopLeftRadius: 14, borderTopRightRadius: 14, padding: 14, maxHeight: '70%' },
  jumpHead: { fontSize: 14, fontWeight: '900', color: Colors.TEXT, marginBottom: 10, textAlign: 'right', writingDirection: 'rtl' },
  jumpRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0E6D2' },
  jumpRowTxt: { fontSize: 13, color: Colors.TEXT, textAlign: 'right', writingDirection: 'rtl' },
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
