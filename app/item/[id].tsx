import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Linking, FlatList, Dimensions, NativeSyntheticEvent, NativeScrollEvent, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../constants/colors';
import { CATALOG } from '../../data/catalog';
import { isFavorite, toggleFavorite } from '../../utils/favorites';
import BUS_ROUTES from '../../data/bus-routes.json';
import HOTEL_PHOTOS from '../../data/hotel-photos.json';
import ATTRACTION_PHOTOS from '../../data/attraction-photos.json';
import RESTAURANT_PHOTOS from '../../data/restaurant-places-photos.json';
import KIDS_PHOTOS from '../../data/kids-photos.json';
import NIGHTLIFE_PHOTOS from '../../data/nightlife-photos.json';
import SHOPPING_PHOTOS from '../../data/shopping-photos.json';
import TRANSPORT_PHOTOS from '../../data/transport-photos.json';
import CASINO_PHOTOS from '../../data/casino-photos.json';
import ABUDHABI_PHOTOS from '../../data/abudhabi-photos.json';

const PLACES_PHOTO_KEY = 'AIzaSyDVYlYuM6saMxbhi2aKNCtiv6J8mR8LLgw';
const PHOTOS_BY_CAT: Record<string, any> = {
  hotels: HOTEL_PHOTOS, attractions: ATTRACTION_PHOTOS, restaurants: RESTAURANT_PHOTOS,
  kids: KIDS_PHOTOS, nightlife: NIGHTLIFE_PHOTOS, shopping: SHOPPING_PHOTOS,
  transport: TRANSPORT_PHOTOS, casino: CASINO_PHOTOS, abudhabi: ABUDHABI_PHOTOS,
};
function placePhotoUrl(name: string) {
  return `https://places.googleapis.com/v1/${name}/media?key=${PLACES_PHOTO_KEY}&maxWidthPx=1200`;
}

const SCREEN_W = Dimensions.get('window').width;

function imgUrl(img: string) {
  if (!img) return 'https://wellcomedubai.com/images/Yizhak/dubai-skyline-evening.jpg';
  if (img.startsWith('http')) return img;
  return 'https://wellcomedubai.com/' + img;
}

function ItemCarousel({ images }: { images: string[] }) {
  const [idx, setIdx] = useState(0);
  const ref = useRef<FlatList>(null);
  if (!images.length) images = [''];
  return (
    <View>
      <FlatList
        ref={ref}
        data={images}
        keyExtractor={(_, i) => String(i)}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e: NativeSyntheticEvent<NativeScrollEvent>) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
          if (i !== idx) setIdx(i);
        }}
        renderItem={({ item }) => (
          <Image source={{ uri: imgUrl(item) }} style={{ width: SCREEN_W, height: 280, backgroundColor: '#E5E7EB' }} />
        )}
      />
      {images.length > 1 ? (
        <>
          <TouchableOpacity onPress={() => { const n = (idx - 1 + images.length) % images.length; setIdx(n); ref.current?.scrollToOffset({ offset: n * SCREEN_W, animated: true }); }} style={{ position: 'absolute', top: 280 / 2 - 22, left: 10, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 36, fontWeight: '300', textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 6 }}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { const n = (idx + 1) % images.length; setIdx(n); ref.current?.scrollToOffset({ offset: n * SCREEN_W, animated: true }); }} style={{ position: 'absolute', top: 280 / 2 - 22, right: 10, width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: 36, fontWeight: '300', textShadowColor: 'rgba(0,0,0,0.85)', textShadowOffset: { width: 0, height: 3 }, textShadowRadius: 6 }}>›</Text>
          </TouchableOpacity>
          <View style={{ position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
            {images.map((_, i) => (
              <View key={i} style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: i === idx ? '#fff' : 'rgba(255,255,255,0.45)' }} />
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

const CAT_NAME: Record<string, string> = {
  hotels: 'מלונות', restaurants: 'מסעדות', attractions: 'אטרקציות', shopping: 'קניות',
  nightlife: 'בילויים', kids: 'ילדים ומשפחות', transport: 'תחבורה', casino: 'בידור ומשחקים', abudhabi: 'אבו דאבי',
};

export default function ItemDetail() {
  const { id, cat } = useLocalSearchParams<{ id: string; cat: string }>();
  const list: any[] = (CATALOG as any)[cat || ''] || [];
  const item = list.find(i => String(i.id) === String(id));
  const [fav, setFav] = useState(false);
  useEffect(() => { if (item) isFavorite(cat || '', id).then(setFav); }, [id, cat, item]);
  const onToggleFav = async () => { const next = await toggleFavorite(cat || '', id); setFav(next); };

  if (!item) {
    return (
      <SafeAreaView edges={['top']} style={s.container}>
        <View style={s.header}><Text style={s.title}>הפריט לא נמצא</Text></View>
      </SafeAreaView>
    );
  }

  const itemScrollRef = useRef<ScrollView | null>(null);
  const [showTop, setShowTop] = useState(false);
  const [hoursOpen, setHoursOpen] = useState(false);
  const [iframeUrl, setIframeUrl] = useState<string | null>(null);

  const navUrl = item.lat ? `https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}` : null;
  const mapUrl = item.lat ? `https://www.google.com/maps?q=${item.lat},${item.lng}` : null;
  const bookUrl = cat === 'hotels' ? `https://search.hotellook.com/hotels?destination=${encodeURIComponent((item.nameEn || item.name) + ' Dubai')}&adults=2&marker=X5SEJjUA` : null;
  const isTourBus = cat === 'transport' && (item.subcategory === 'bus') && /sightseeing|big bus|hop on|hop-on/i.test((item.nameEn || item.name || ''));
  const ticketsUrl = (['attractions','kids','nightlife','casino','abudhabi'].includes(cat || '') || isTourBus) ? 'https://klook.tpk.lv/8HSINbXI' : null;

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#000' }} />

      <ScrollView ref={itemScrollRef} contentContainerStyle={{ paddingBottom: 40 }} onScroll={(e) => setShowTop(e.nativeEvent.contentOffset.y > 600)} scrollEventThrottle={200}>
        <View style={{ position: 'relative' }}>
          {(() => {
            const photoMap = PHOTOS_BY_CAT[cat || ''] || {};
            const photoEntry = photoMap[String(id)];
            const placePhotos: string[] = photoEntry?.photos?.slice(0, 10).map((p: any) => placePhotoUrl(p.name)) || [];
            const all = placePhotos.length > 0
              ? [...placePhotos, ...(item.images || [])].filter(Boolean)
              : [item.image, ...(item.images || [])].filter(Boolean);
            return <ItemCarousel images={all} />;
          })()}
          <TouchableOpacity onPress={() => router.back()} style={s.imgClose}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>✕</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onToggleFav} style={s.imgPlus}>
            <FontAwesome5 name="heart" solid={fav} size={26} color="#E76F51" style={{ textShadowColor: 'rgba(0,0,0,0.7)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }} />
          </TouchableOpacity>
        </View>
        {item.kosher ? (
          <View style={s.kosherBadge}>
            <Text style={s.kosherText}>✡ מכבד כשרות</Text>
          </View>
        ) : null}

        <View style={s.body}>
          <Text style={s.name}>{item.name}</Text>
          {item.address ? <Text style={s.subtitle}>{item.address}</Text> : null}

          {item.rating ? (
            <View style={s.ratingRow}>
              <Text style={s.ratingNum}>{item.rating}</Text>
              {[0,1,2,3,4].map(i => (
                <Text key={i} style={[s.starTxt, { color: i < Math.round(item.rating) ? '#B8923A' : '#ddd' }]}>★</Text>
              ))}
            </View>
          ) : null}

          <View style={s.priceRow}>
            {item.phone ? (
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phone}`)} style={s.phoneBtn}>
                <FontAwesome5 name="phone-alt" size={16} color="#fff" />
              </TouchableOpacity>
            ) : null}
            {item.price ? <Text style={s.priceBig}>{item.price}</Text> : null}
          </View>
          {item.phone ? (
            <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phone}`)} style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'flex-start', gap: 6, marginTop: 4 }}>
              <FontAwesome5 name="phone-alt" size={11} color="#E76F51" />
              <Text style={s.phoneNum}>{item.phone}</Text>
            </TouchableOpacity>
          ) : null}
          {item.priceRange ? <Text style={s.priceRange}>{item.priceRange}</Text> : null}

          {item.description ? <Text style={s.desc}>{item.description}</Text> : null}

          <View style={s.contactRow}>
            {item.phone ? (
              <TouchableOpacity onPress={() => Linking.openURL(`tel:${item.phone}`)} style={s.contactItem}>
                <FontAwesome5 name="phone-alt" size={12} color={Colors.PRIMARY} />
                <Text style={s.contactTxt}>{item.phone}</Text>
              </TouchableOpacity>
            ) : null}
            {item.website && (cat === 'hotels' || cat === 'restaurants') ? (
              <TouchableOpacity onPress={() => setIframeUrl(item.website)} style={s.contactItem}>
                <FontAwesome5 name="globe" size={12} color={Colors.PRIMARY} />
                <Text style={s.contactTxt}>{cat === 'hotels' ? 'לאתר המלון' : 'לאתר המסעדה'}</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {item.tags && item.tags.length ? (
            <View style={s.tagsRow}>
              {item.tags.map((t: string, i: number) => (
                <View key={i} style={s.tag}><Text style={s.tagTxt}>{t}</Text></View>
              ))}
            </View>
          ) : null}

          {item.hours && item.hours.length ? (
            <TouchableOpacity onPress={() => setHoursOpen(o => !o)} style={s.hoursToggle}>
              <Text style={s.hoursToggleTxt}>🕐 שעות פתיחה {hoursOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>
          ) : null}
          {hoursOpen && item.hours ? (
            <View style={s.hoursList}>
              {item.hours.map((h: string, i: number) => (
                <Text key={i} style={s.hoursItem}>{h}</Text>
              ))}
            </View>
          ) : null}

          {(BUS_ROUTES as any)[String(id)] ? (() => {
            const data = (BUS_ROUTES as any)[String(id)];
            const allStops = data.routes.flatMap((r: any) => r.stops.map((s: any) => ({ ...s, color: r.color, routeName: r.nameHe })));
            const routesJs = data.routes.map((r: any) => `new google.maps.Polyline({path:${JSON.stringify(r.stops.map((s: any) => ({ lat: s.lat, lng: s.lng })))},geodesic:true,strokeColor:'${r.color}',strokeOpacity:0.85,strokeWeight:3.5,map});`).join('');
            const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#m{margin:0;padding:0;height:100%;width:100%;}</style></head><body><div id="m"></div><script>function init(){const map=new google.maps.Map(document.getElementById('m'),{center:{lat:25.18,lng:55.25},zoom:11,mapTypeControl:false,streetViewControl:false,fullscreenControl:false});const bounds=new google.maps.LatLngBounds();const stops=${JSON.stringify(allStops)};stops.forEach((s,i)=>{const pos={lat:s.lat,lng:s.lng};bounds.extend(pos);const m=new google.maps.Marker({position:pos,map,title:s.nameHe,icon:{path:google.maps.SymbolPath.CIRCLE,scale:7,fillColor:s.color,fillOpacity:1,strokeColor:'#fff',strokeWeight:2}});const iw=new google.maps.InfoWindow({content:'<div style="direction:rtl;font-family:-apple-system,sans-serif;"><b>'+s.nameHe+'</b><br><span style="color:#6B7F8D;font-size:11px;">'+s.routeName+'</span></div>'});m.addListener('click',()=>iw.open({anchor:m,map}));});${routesJs}map.fitBounds(bounds,30);}</script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDw09Bg7XaH7apEWJBcFtogVfrdUwF_gEM&language=he&callback=init" async defer></script></body></html>`;
            return (
              <View>
                <Text style={{ color: '#1A4A5E', fontWeight: '900', fontSize: 16, marginTop: 12, marginBottom: 8, writingDirection: 'rtl', textAlign: 'right' }}>🚌 מסלולי האוטובוס</Text>
                <View style={{ height: 280, marginBottom: 12, backgroundColor: '#E5E7EB' }}>
                  <WebView originWhitelist={['*']} source={{ html }} style={{ flex: 1 }} scrollEnabled={false} />
                </View>
                {data.routes.map((r: any, ri: number) => (
                  <View key={ri} style={{ marginBottom: 14 }}>
                    <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: r.color }} />
                      <Text style={{ color: '#1A4A5E', fontWeight: '800', fontSize: 14, flex: 1, writingDirection: 'rtl' }}>{r.nameHe}</Text>
                      <TouchableOpacity onPress={() => Linking.openURL(r.officialUrl)}>
                        <Text style={{ color: r.color, fontSize: 11.5, fontWeight: '700' }}>מסלול רשמי ←</Text>
                      </TouchableOpacity>
                    </View>
                    {r.stops.map((st: any, si: number) => (
                      <TouchableOpacity key={si} onPress={() => Linking.openURL(`https://www.google.com/maps?q=${st.lat},${st.lng}&hl=he`)} style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 10, paddingVertical: 7, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#F0E6D2' }}>
                        <View style={{ width: 22, height: 22, borderRadius: 11, backgroundColor: r.color, alignItems: 'center', justifyContent: 'center' }}>
                          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>{si + 1}</Text>
                        </View>
                        <Text style={{ flex: 1, color: '#2C5F6E', fontSize: 13, fontWeight: '700', writingDirection: 'rtl', textAlign: 'right' }}>{st.nameHe}</Text>
                        <Text style={{ color: Colors.MUTED, fontSize: 11 }}>📍</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ))}
              </View>
            );
          })() : null}

          {item.lat ? (
            <View style={s.inlineMapWrap}>
              <WebView
                originWhitelist={['*']}
                source={{ html: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#m{margin:0;padding:0;height:100%;width:100%;}</style></head><body><div id="m"></div><script>function init(){const m=new google.maps.Map(document.getElementById('m'),{center:{lat:${item.lat},lng:${item.lng}},zoom:16,mapTypeControl:false,streetViewControl:false,fullscreenControl:false});new google.maps.Marker({position:{lat:${item.lat},lng:${item.lng}},map:m,title:${JSON.stringify(item.name)},icon:{path:google.maps.SymbolPath.CIRCLE,scale:12,fillColor:'#E76F51',fillOpacity:1,strokeColor:'#fff',strokeWeight:3}});}</script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDw09Bg7XaH7apEWJBcFtogVfrdUwF_gEM&language=he&callback=init" async defer></script></body></html>` }}
                style={{ flex: 1 }}
                scrollEnabled={false}
              />
            </View>
          ) : null}

          <View style={s.actions}>
            {item.lat ? (
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: Colors.PRIMARY }]} onPress={() => Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${item.lat},${item.lng}&travelmode=driving&hl=he`)}>
                <Text style={s.actionTxt}>נווט אליי</Text>
              </TouchableOpacity>
            ) : null}
            {item.lat ? (
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: Colors.WARM }]} onPress={() => Linking.openURL(`https://www.google.com/maps?q=${item.lat},${item.lng}&hl=he`)}>
                <Text style={s.actionTxt}>איפה זה?</Text>
              </TouchableOpacity>
            ) : null}
            {bookUrl ? (
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: Colors.SECONDARY }]} onPress={() => setIframeUrl(bookUrl)}>
                <Text style={s.actionTxt}>הזמן מלון</Text>
              </TouchableOpacity>
            ) : null}
            {ticketsUrl ? (
              <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#FF5C00' }]} onPress={() => Linking.openURL('https://klook.tpk.lv/8HSINbXI')}>
                <Text style={s.actionTxt}>רכוש כרטיסים</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          {ticketsUrl ? (
            <TouchableOpacity onPress={() => Linking.openURL('https://tiqets.tpk.lv/53YEgT8s')} style={{ marginTop: 8, alignSelf: 'flex-end' }}>
              <Text style={{ color: '#1A6B8A', fontSize: 12.5, fontWeight: '600', textDecorationLine: 'underline' }}>לא מצאת כרטיס? נסה כאן ←</Text>
            </TouchableOpacity>
          ) : null}

          {item.website && (cat === 'hotels' || cat === 'restaurants') ? (
            <TouchableOpacity style={s.websiteBtn} onPress={() => setIframeUrl(item.website)}>
              <Text style={s.websiteTxt}>{cat === 'hotels' ? 'לאתר המלון' : 'לאתר המסעדה'}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
      {showTop ? (
        <TouchableOpacity onPress={() => itemScrollRef.current?.scrollTo({ y: 0, animated: true })} style={s.topBtn}>
          <Text style={s.topBtnTxt}>↑</Text>
        </TouchableOpacity>
      ) : null}
      <Modal visible={!!iframeUrl} animationType="fade" transparent={false} onRequestClose={() => setIframeUrl(null)} statusBarTranslucent>
        <View style={{ flex: 1, backgroundColor: '#000' }}>
          <View style={{ paddingTop: 50, height: 100, backgroundColor: '#000', flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14 }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{item.name}</Text>
            <TouchableOpacity onPress={() => setIframeUrl(null)} hitSlop={{ top: 16, bottom: 16, left: 16, right: 16 }} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18, backgroundColor: '#E76F51' }}>
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
  container: { flex: 1, backgroundColor: '#fff' },
  header: { padding: 14 },
  title: { color: Colors.TEXT, fontWeight: '900' },
  imgClose: { position: 'absolute', top: 14, left: 14, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  imgPlus: { position: 'absolute', top: 14, right: 14, width: 40, height: 40, alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  cover: { width: '100%', height: 280, backgroundColor: '#E5E7EB' },
  kosherBadge: { position: 'absolute', top: 240, left: 14, backgroundColor: '#0E2A38', borderColor: Colors.GOLD, borderWidth: 1, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 5 },
  kosherText: { color: Colors.GOLD, fontSize: 12, fontWeight: '900' },
  body: { padding: 18 },
  name: { fontSize: 22, fontWeight: '700', color: '#2C5F6E', textAlign: 'right', writingDirection: 'rtl' },
  subtitle: { color: Colors.MUTED, fontSize: 14, marginTop: 2, textAlign: 'right', writingDirection: 'rtl' },
  ratingRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 4, justifyContent: 'flex-start', marginTop: 14 },
  starTxt: { fontSize: 16 },
  ratingNum: { color: Colors.TEXT, fontWeight: '700', fontSize: 14, marginLeft: 6 },
  priceRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'flex-start', gap: 14, marginTop: 14 },
  phoneBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#E76F51', alignItems: 'center', justifyContent: 'center' },
  phoneIcon: { fontSize: 18 },
  priceBig: { color: '#E76F51', fontSize: 16, fontWeight: '500', letterSpacing: 0.5 },
  phoneNum: { color: Colors.MUTED, fontSize: 12, textAlign: 'right', marginTop: 4 },
  priceRange: { color: '#E76F51', fontSize: 13, fontWeight: '700', textAlign: 'right', marginTop: 2, writingDirection: 'rtl' },
  desc: { color: Colors.TEXT, fontSize: 14, lineHeight: 24, marginTop: 16, writingDirection: 'rtl', textAlign: 'right' },
  contactRow: { flexDirection: 'row-reverse', gap: 16, marginTop: 12, flexWrap: 'wrap' },
  contactItem: { flexDirection: 'row-reverse', alignItems: 'center', gap: 6 },
  contactTxt: { color: Colors.PRIMARY, fontSize: 13, fontWeight: '700', textDecorationLine: 'underline' },
  tagsRow: { flexDirection: 'row-reverse', gap: 6, marginTop: 14, flexWrap: 'wrap' },
  tag: { backgroundColor: '#FDF6EC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, borderWidth: 1, borderColor: '#E8DEC8' },
  tagTxt: { color: Colors.TEXT, fontSize: 11, fontWeight: '600' },
  actions: { flexDirection: 'row-reverse', gap: 8, marginTop: 18 },
  actionBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionTxt: { color: '#fff', fontWeight: '800', fontSize: 13, textAlign: 'center' },
  websiteBtn: { marginTop: 12, padding: 12, borderWidth: 2, borderColor: Colors.PRIMARY, borderRadius: 10, alignItems: 'center' },
  websiteTxt: { color: Colors.PRIMARY, fontWeight: '800', fontSize: 14 },
  topBtn: { position: 'absolute', bottom: 24, left: 16, width: 48, height: 48, borderRadius: 24, backgroundColor: '#E76F51', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 6 },
  topBtnTxt: { color: '#fff', fontSize: 24, fontWeight: '900', lineHeight: 28 },
  hoursToggle: { paddingVertical: 10, marginTop: 14, borderTopWidth: 1, borderTopColor: '#F0E6D2' },
  hoursToggleTxt: { color: '#2A9D8F', fontWeight: '700', fontSize: 13, textAlign: 'right', writingDirection: 'rtl' },
  hoursList: { paddingVertical: 6 },
  hoursItem: { color: Colors.MUTED, fontSize: 12, lineHeight: 22, textAlign: 'right', writingDirection: 'rtl' },
  inlineMapWrap: { height: 220, borderRadius: 10, overflow: 'hidden', marginTop: 14, backgroundColor: '#E5E7EB' },
});
