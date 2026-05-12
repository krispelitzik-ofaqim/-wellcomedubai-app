import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Linking, ImageBackground, Modal, Pressable, Dimensions } from 'react-native';

const SCREEN_W = Dimensions.get('window').width;
const TAB_FONT = Math.max(10, Math.round(10 * (SCREEN_W / 390)));
const TAB_LINE = TAB_FONT + 2;
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { RE_ARTICLES, RE_INVESTMENTS } from '../constants/realestate';

const TABS = [
  { id: 'sale',     line1: 'דירות', line2: 'למכירה', color: Colors.PRIMARY },
  { id: 'rent',     line1: 'דירות', line2: 'להשכרה', color: Colors.SECONDARY },
  { id: 'invest',   line1: 'פורטל', line2: 'הנדל"ן',  color: Colors.ACCENT },
  { id: 'business', line1: 'פורטל', line2: 'העסקים', color: Colors.GOLD },
  { id: 'israeli',  line1: 'השקעות', line2: 'ישראליות', color: Colors.PINK },
];

const STAT_INDICATORS = [
  { code: 'NY.GDP.PCAP.CD',    label: 'תמ"ג לנפש',     unit: '$' as const, color: '#1A6B8A', grad: ['#1A6B8A', '#2A9D8F'], icon: '💵' },
  { code: 'NY.GDP.MKTP.KD.ZG', label: 'צמיחת תמ"ג',   unit: '%' as const, color: '#2A9D8F', grad: ['#2A9D8F', '#5B9DC7'], icon: '📈' },
  { code: 'FP.CPI.TOTL.ZG',    label: 'אינפלציה',     unit: '%' as const, color: '#E76F51', grad: ['#E76F51', '#F4A261'], icon: '🔥' },
  { code: 'ST.INT.ARVL',       label: 'תיירים שנתיים', unit: 'M' as const, color: '#F4A261', grad: ['#F4A261', '#B8923A'], icon: '✈️' },
  { code: 'FR.INR.LEND',       label: 'ריבית בנקים',   unit: '%' as const, color: '#B85C8E', grad: ['#B85C8E', '#5B9DC7'], icon: '🏦' },
];

const ISRAELI_TO_UAE: Record<string, number> = { '2021': 200000, '2022': 450000, '2023': 600000, '2024': 650000, '2025': 700000 };

const NEWS_FALLBACK_IMAGES = [
  'https://wellcomedubai.com/images/Yizhak/dubai-skyline-evening.jpg',
  'https://wellcomedubai.com/images/Yizhak/futuristic-dubai-landscape.jpg',
  'https://wellcomedubai.com/images/Yizhak/dubai-city-center-skyline-united-arab-emirates.jpg',
  'https://wellcomedubai.com/images/Yizhak/economy-dubai-skyline-charts.jpg',
  'https://wellcomedubai.com/images/Yizhak/aerial-view-dubai-city-from-top-tower.jpg',
  'https://wellcomedubai.com/images/Yizhak/dubai-marina-skyline-yacht-harbor-architecture-travel-night-twilight-united-arab-emirates.jpg',
  'https://wellcomedubai.com/images/wellcomedubai.stamp/skyscrapers-looking-up-sky-modern-metropolis-modern-city.jpg',
  'https://wellcomedubai.com/images/Yizhak/economy-uae-currency.jpg',
];

function newsImageFor(i: number): string {
  if (i < 0) i = 0;
  return NEWS_FALLBACK_IMAGES[i % NEWS_FALLBACK_IMAGES.length];
}

function NewsImage({ uri, index, style }: { uri?: string; index: number; style: any }) {
  const [src, setSrc] = useState<string>(uri && uri.length > 4 ? uri : newsImageFor(index));
  return (
    <Image
      source={{ uri: src }}
      style={style}
      onError={() => setSrc(newsImageFor(index))}
    />
  );
}

const LENDING_FALLBACK = [
  { year: '2026', value: 5.5 },
  { year: '2025', value: 5.4 },
  { year: '2024', value: 5.4 },
  { year: '2023', value: 5.0 },
];

function ThinScrollBar({ progress }: { progress: number }) {
  const pct = Math.max(0, Math.min(1, progress));
  return (
    <View style={{ height: 3, backgroundColor: '#F0E6D2', borderRadius: 2, marginHorizontal: 2, marginTop: 6, overflow: 'hidden' }}>
      <View style={{ height: '100%', width: `${Math.max(15, pct * 100)}%`, backgroundColor: '#B85C8E', borderRadius: 2 }} />
    </View>
  );
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const layoutW = useRef(1);
  const contentW = useRef(1);
  const onScroll = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const range = Math.max(1, contentW.current - layoutW.current);
    setProgress(x / range);
  };
  const onLayout = (e: any) => { layoutW.current = e.nativeEvent.layout.width; };
  const onContentSizeChange = (w: number) => { contentW.current = w; };
  return { progress, onScroll, onLayout, onContentSizeChange };
}

function fmtVal(v: number | null | undefined, unit: '$' | '%' | 'M' | 'K'): string {
  if (v == null) return '—';
  if (unit === '$') return '$' + Math.round(v).toLocaleString();
  if (unit === 'M') return (v / 1000000).toFixed(1) + 'M';
  if (unit === 'K') return (v / 1000).toFixed(0) + 'K';
  return v.toFixed(1) + '%';
}

type StatRow = { year: string; value: number };
type StatSlide = { icon: string; label: string; sublabel: string; grad: [string, string]; rows: StatRow[]; unit: '$' | '%' | 'M' | 'K' };

function StatSlideCard({ slide }: { slide: StatSlide }) {
  const max = Math.max(...slide.rows.map(r => Math.abs(r.value || 0))) || 1;
  return (
    <LinearGradient colors={slide.grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={ss.slide}>
      <View style={ss.slideHead}>
        <Text style={ss.slideIcon}>{slide.icon}</Text>
        <View style={{ flex: 1 }}>
          <Text style={ss.slideSub}>{slide.sublabel}</Text>
          <Text style={ss.slideLabel}>{slide.label}</Text>
        </View>
      </View>
      {slide.rows.length === 0 ? (
        <Text style={ss.slideEmpty}>אין נתונים</Text>
      ) : slide.rows.map((r, i) => {
        const pct = Math.min(100, (Math.abs(r.value || 0) / max) * 100);
        return (
          <View key={i} style={ss.row}>
            <Text style={ss.rowYear}>{r.year}</Text>
            <View style={ss.barTrack}>
              <View style={[ss.barFill, { width: `${pct}%` }]} />
            </View>
            <Text style={ss.rowVal}>{fmtVal(r.value, slide.unit)}</Text>
          </View>
        );
      })}
    </LinearGradient>
  );
}

function UAEStatsCarousel() {
  const [stats, setStats] = useState<StatSlide[] | null>(null);
  const sp = useScrollProgress();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const fetched = await Promise.all(
        STAT_INDICATORS.map(async ind => {
          try {
            const r = await fetch(`https://api.worldbank.org/v2/country/ARE/indicator/${ind.code}?format=json&per_page=20`);
            const data = await r.json();
            const list = ((data && data[1]) || []).filter((d: any) => d.value != null).slice(0, 4);
            return { ind, rows: list.map((d: any) => ({ year: d.date, value: d.value })) as StatRow[] };
          } catch {
            return { ind, rows: [] as StatRow[] };
          }
        })
      );
      if (cancelled) return;
      const uaeSlides: StatSlide[] = fetched.map(({ ind, rows }) => ({
        icon: ind.icon,
        label: ind.label,
        sublabel: 'איחוד האמירויות',
        grad: ind.grad as [string, string],
        rows: ind.code === 'FR.INR.LEND' && rows.length === 0 ? LENDING_FALLBACK : rows,
        unit: ind.unit,
      }));
      const israeliRows = Object.entries(ISRAELI_TO_UAE).reverse().slice(0, 4).map(([y, v]) => ({ year: y, value: v }));
      const israeli: StatSlide = {
        icon: '🇮🇱',
        label: 'ישראלים בדובאי',
        sublabel: 'תיירות ישראלית',
        grad: ['#B85C8E', '#5B9DC7'],
        rows: israeliRows,
        unit: 'K',
      };
      setStats([israeli, ...uaeSlides]);
    })();
    return () => { cancelled = true; };
  }, []);

  if (!stats) {
    return (
      <View style={{ paddingVertical: 24, alignItems: 'center' }}>
        <Text style={{ color: Colors.MUTED, fontSize: 13 }}>⏳ טוען נתונים…</Text>
      </View>
    );
  }

  return (
    <View style={{ marginBottom: 16 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 12, paddingBottom: 6 }}
        onScroll={sp.onScroll}
        onLayout={sp.onLayout}
        onContentSizeChange={sp.onContentSizeChange}
        scrollEventThrottle={16}
      >
        {stats.map((sl, i) => <StatSlideCard key={i} slide={sl} />)}
      </ScrollView>
      <ThinScrollBar progress={sp.progress} />
    </View>
  );
}

const ss = StyleSheet.create({
  slide: { width: 260, borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 6 } },
  slideHead: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginBottom: 12 },
  slideIcon: { fontSize: 26, lineHeight: 28 },
  slideSub: { color: 'rgba(255,255,255,0.9)', fontSize: 10, fontWeight: '700', letterSpacing: 1.3, textAlign: 'right', writingDirection: 'rtl' },
  slideLabel: { color: '#fff', fontSize: 14, fontWeight: '800', writingDirection: 'rtl', textAlign: 'right', marginTop: 2 },
  slideEmpty: { color: 'rgba(255,255,255,0.85)', fontSize: 12, textAlign: 'center', paddingVertical: 14 },
  row: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 6 },
  rowYear: { width: 42, color: '#fff', fontSize: 12, fontWeight: '700', opacity: 0.95, textAlign: 'right' },
  barTrack: { flex: 1, height: 14, backgroundColor: 'rgba(255,255,255,0.18)', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: '#fff', borderRadius: 4 },
  rowVal: { width: 72, textAlign: 'left', color: '#fff', fontSize: 12, fontWeight: '800' },
});

const TOP_AREAS = [
  { name: 'Dubai Marina', yield: '7-9%', entry: 'AED 900K', note: 'ביקוש שוכרים גבוה' },
  { name: 'JVC', yield: '9-11%', entry: 'AED 700K', note: 'כניסה זולה — הפופולרי בישראלים' },
  { name: 'Downtown', yield: '5-7%', entry: 'AED 1.5M', note: 'יוקרה + עליית הון' },
  { name: 'Damac Hills 2', yield: '10-12%', entry: 'AED 800K', note: 'חדש וצומח' },
];

const SECTORS = [
  { icon: '🛡️', name: 'סייבר וביטחון', desc: 'Check Point, Cybereason, Sygnia — משרדים ב-DIFC.', kpi: '12+ חברות' },
  { icon: '💳', name: 'פינטק', desc: 'Pagaya, eToro, Rapyd — שער למזרח התיכון.', kpi: '8+ חברות' },
  { icon: '💧', name: 'טכנולוגיית מים', desc: 'IDE, Watergen — אמירויות שוק טבעי.', kpi: '5+ פרויקטים' },
  { icon: '🌱', name: 'חקלאות מדברית', desc: 'Netafim, Plantish — שיתופי פעולה בחממות.', kpi: '3+ JVs' },
  { icon: '🏥', name: 'רפואה', desc: 'מחקר, חיסונים, תיירות מרפא.', kpi: 'גדל 40%/שנה' },
];

const FUNDS = [
  { tag: 'VC', name: 'OurCrowd', desc: 'משרד דובאי מאז 2021' },
  { tag: 'VC', name: 'Pitango', desc: 'נציגות אמירויות לחיבור פורטפוליו' },
  { tag: 'CVC', name: 'G42 Israeli Fund', desc: 'מיליארדי דולרים בסטארטאפים ישראליים' },
  { tag: 'PE', name: 'IBI Tech Fund', desc: 'נדל"ן + פינטק' },
];

export default function RealEstateScreen() {
  const [tab, setTab] = useState<'sale' | 'rent' | 'invest' | 'israeli' | 'business'>('invest');

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {/* Dark header + KPI hero (scrolls) */}
        <SafeAreaView edges={['top']} style={{ backgroundColor: '#0E2A38' }} />
        <LinearGradient colors={['#0E2A38', '#1A4A5E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={s.header}>
            <Text style={[s.title, { flex: 1 }]}>פורטל הנדל"ן בדובאי</Text>
            <TouchableOpacity onPress={() => router.back()} style={s.closeBtn}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          </View>
          <View style={s.kpiHero}>
            <View style={s.kpiHeroHead}>
              <Text style={s.kpiKicker}>DUBAI REAL ESTATE INDEX</Text>
              <Text style={s.kpiLive}>LIVE • Q2 2026</Text>
            </View>
            <View style={s.kpiGrid}>
              <View style={s.kpiBox}>
                <Text style={s.kpiLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>מחיר ממוצע למ"ר</Text>
                <Text style={s.kpiVal} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>AED 1,580</Text>
                <Text style={[s.kpiDelta, { color: '#4ADE80' }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>▲ 19.8% YoY</Text>
              </View>
              <View style={s.kpiBox}>
                <Text style={s.kpiLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>תשואה ממוצעת</Text>
                <Text style={s.kpiVal} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>8.2%</Text>
                <Text style={[s.kpiDelta, { color: '#4ADE80' }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>▲ 0.6pt YoY</Text>
              </View>
              <View style={s.kpiBox}>
                <Text style={s.kpiLabel} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>AED / ILS</Text>
                <Text style={s.kpiVal} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>0.998</Text>
                <Text style={[s.kpiDelta, { color: '#F87171' }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>▼ 0.4% MoM</Text>
              </View>
            </View>
          </View>
        </LinearGradient>

        {/* Flat tabs (sticky) — single row, 5 buttons */}
        <View style={s.tabsStrip}>
          {TABS.map(t => {
            const isActive = tab === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={s.tabBtn}
                onPress={() => setTab(t.id as any)}
              >
                <Text style={[s.tabL1, { color: isActive ? t.color : Colors.MUTED, fontWeight: isActive ? '900' : '600' }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{t.line1}</Text>
                <Text style={[s.tabL2, { color: isActive ? t.color : Colors.MUTED, fontWeight: isActive ? '900' : '600' }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>{t.line2}</Text>
                {isActive && <View style={[s.tabUnderline, { backgroundColor: t.color }]} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ padding: 14 }}>
          {tab === 'invest' && <InvestContent />}
          {tab === 'israeli' && <IsraeliContent />}
          {tab === 'business' && <BusinessContent />}
          {(tab === 'sale' || tab === 'rent') && <ListingsPlaceholder type={tab} />}
          <BrokersBanner />
        </View>
      </ScrollView>
    </View>
  );
}

function InvestContent() {
  const [news, setNews] = useState<any[]>([]);
  const [preview, setPreview] = useState<any | null>(null);
  const newsSp = useScrollProgress();

  useEffect(() => {
    const rss = 'https://news.google.com/rss/search?q=' + encodeURIComponent('דובאי נדלן') + '&hl=he&gl=IL&ceid=IL:he';
    fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rss))
      .then(r => r.json())
      .then(j => setNews((j.items || []).slice(0, 8)))
      .catch(() => {});
  }, []);

  return (
    <>
      <Text style={s.sectionTitle}>חדשות נדל״ן בדובאי</Text>
      {news.length === 0 ? (
        <View style={s.placeholder}><Text style={s.placeholderSub}>⏳ טוען חדשות...</Text></View>
      ) : (
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingBottom: 6 }}
            onScroll={newsSp.onScroll}
            onLayout={newsSp.onLayout}
            onContentSizeChange={newsSp.onContentSizeChange}
            scrollEventThrottle={16}
          >
            {news.map((it, i) => {
              const img = it.enclosure?.link || it.thumbnail;
              const date = it.pubDate ? new Date(it.pubDate).toLocaleDateString('he-IL') : '';
              return (
                <TouchableOpacity key={i} style={s.newsCard} onPress={() => setPreview(it)}>
                  <NewsImage uri={img} index={i} style={s.newsImg} />
                  <View style={{ padding: 8 }}>
                    <Text style={s.newsTitle} numberOfLines={3}>{it.title}</Text>
                    <Text style={s.newsDate}>{date}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <ThinScrollBar progress={newsSp.progress} />
        </View>
      )}

      <Modal visible={!!preview} transparent animationType="fade" onRequestClose={() => setPreview(null)}>
        <View style={s.modalBackdrop}>
          <Pressable onPress={() => setPreview(null)} style={StyleSheet.absoluteFill} />
          <View style={s.modalCard}>
            <LinearGradient colors={['#0E2A38', '#1A4A5E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.modalHead}>
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
                <Text style={s.modalKicker}>חדשות</Text>
                {preview?.pubDate ? <Text style={s.modalDate}>{new Date(preview.pubDate).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => setPreview(null)} style={s.modalClose}>
                <Text style={{ color: '#fff', fontSize: 18 }}>×</Text>
              </TouchableOpacity>
            </LinearGradient>
            {preview ? (
              <NewsImage uri={preview.enclosure?.link || preview.thumbnail} index={news.indexOf(preview)} style={s.modalImg} />
            ) : null}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, paddingBottom: 26 }}>
              <Text style={s.modalTitle}>{preview?.title}</Text>
              {(() => {
                const src = preview?.author || ((preview?.link || '').match(/\/\/(?:www\.)?([^\/]+)/)?.[1] || '');
                return src ? <Text style={s.modalSource}>📰 {src}</Text> : null;
              })()}
              <Text style={s.modalSummary}>{((preview?.description || preview?.content || '') as string).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim() || 'אין תקציר זמין.'}</Text>
              {preview?.categories?.length ? (
                <View style={s.modalChips}>
                  {(preview.categories as string[]).slice(0, 4).map((c, i) => (
                    <View key={i} style={s.modalChip}><Text style={s.modalChipTxt}>{c}</Text></View>
                  ))}
                </View>
              ) : null}
              <View style={s.modalDivider} />
              <TouchableOpacity onPress={() => preview && Linking.openURL(preview.link)} style={s.modalLinkBtn}>
                <Text style={s.modalLinkBtnTxt}>לכתבה המלאה במקור ←</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Text style={s.sectionTitle}>מדדים כלכליים — UAE</Text>
      <UAEStatsCarousel />

      <Text style={s.sectionTitle}>מאמרים ומדריכים</Text>
      {RE_ARTICLES.map(a => (
        <View key={a.id} style={s.articleCard}>
          <View style={s.articleHeader}>
            <Text style={{ fontSize: 22 }}>{a.icon}</Text>
            <Text style={s.articleTitle}>{a.title}</Text>
          </View>
          <Text style={s.articleBody}>{a.body}</Text>
        </View>
      ))}

      <View style={s.whyBanner}>
        <Text style={s.whyKicker}>למה דובאי?</Text>
        <Text style={s.whyTitle}>היעד החם בעולם להשקעות נדל"ן</Text>
        <View style={s.whyGrid}>
          <Text style={s.whyItem}>✓ 0% מס הכנסה אישי</Text>
          <Text style={s.whyItem}>✓ 4% מס רכישה חד-פעמי</Text>
          <Text style={s.whyItem}>✓ תשואות 6-12%</Text>
          <Text style={s.whyItem}>✓ ויזת משקיע מ-AED 750K</Text>
        </View>
      </View>

      <Text style={s.sectionTitle}>אזורים מובילים — מפה חיה</Text>
      <View style={s.investMapWrap}>
        <WebView
          originWhitelist={['*']}
          source={{ html: `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><style>html,body,#m{margin:0;padding:0;height:100%;width:100%;}</style></head><body><div id="m"></div><script>function init(){const map=new google.maps.Map(document.getElementById('m'),{center:{lat:25.18,lng:55.25},zoom:11,mapTypeControl:false,streetViewControl:false,fullscreenControl:false});const pts=${JSON.stringify(RE_INVESTMENTS.filter((i: any) => i.lat && i.lng).map((i: any, idx: number) => ({ lat: i.lat, lng: i.lng, name: i.area, num: idx + 1, yield: i.yield })))};const bounds=new google.maps.LatLngBounds();pts.forEach(p=>{const m=new google.maps.Marker({position:{lat:p.lat,lng:p.lng},map,label:{text:String(p.num),color:'#fff',fontWeight:'800',fontSize:'12px'},icon:{path:google.maps.SymbolPath.CIRCLE,scale:14,fillColor:'#E76F51',fillOpacity:1,strokeColor:'#fff',strokeWeight:2}});bounds.extend({lat:p.lat,lng:p.lng});const iw=new google.maps.InfoWindow({content:'<div style="direction:rtl;font-family:-apple-system,sans-serif;"><b>'+p.num+'. '+p.name+'</b><br><span style="color:#E76F51;">תשואה '+p.yield+'</span></div>'});m.addListener('click',()=>iw.open({anchor:m,map}));});if(pts.length>1)map.fitBounds(bounds,30);}</script><script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyDw09Bg7XaH7apEWJBcFtogVfrdUwF_gEM&language=he&callback=init" async defer></script></body></html>` }}
          style={{ flex: 1 }}
          scrollEnabled={false}
        />
      </View>

      <Text style={s.sectionTitle}>אזורי השקעה — לחץ על סמן במפה לפרטים</Text>
      {RE_INVESTMENTS.map((inv, i) => (
        <View key={inv.area} style={s.investCard}>
          <View style={s.investHeader}>
            <View style={s.investNum}><Text style={s.investNumTxt}>{i + 1}</Text></View>
            <Text style={s.investArea}>{inv.area}</Text>
            <View style={s.yieldBadge}><Text style={s.yieldTxt}>⚡ {inv.yield}</Text></View>
          </View>
          <Text style={s.investEntry}>כניסה מ-<Text style={{ fontWeight: '900', color: Colors.PRIMARY }}>{inv.entry}</Text></Text>
          <Text style={s.investHl}>{inv.highlight}</Text>
        </View>
      ))}
    </>
  );
}

function TradingChart({ title, symbol }: { title: string; symbol: string }) {
  const cfg = encodeURIComponent(JSON.stringify({
    symbols: [[symbol + '|1Y']],
    chartOnly: false,
    width: '100%',
    height: 300,
    locale: 'en',
    colorTheme: 'light',
    autosize: false,
    showVolume: false,
    hideDateRanges: false,
    scalePosition: 'right',
    scaleMode: 'Normal',
    fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
    fontSize: '10',
    valuesTracking: '1',
    changeMode: 'price-and-percent',
    chartType: 'area',
    lineColor: '#1A6B8A',
    bottomColor: 'rgba(26,107,138,0.08)',
    topColor: 'rgba(26,107,138,0.35)',
  }));
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={s.sectionTitle}>{title}</Text>
      <View style={{ backgroundColor: '#fff', borderRadius: 12, padding: 10, height: 320, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } }}>
        <WebView
          originWhitelist={['*']}
          source={{ uri: `https://www.tradingview-widget.com/embed-widget/symbol-overview/?locale=en#${cfg}` }}
          style={{ flex: 1, backgroundColor: 'transparent' }}
          javaScriptEnabled
          domStorageEnabled
        />
      </View>
    </View>
  );
}

function CurrencyTicker() {
  const cfg = encodeURIComponent(JSON.stringify({
    symbols: [
      { description: 'USD/AED', proName: 'FX_IDC:USDAED' },
      { description: 'EUR/AED', proName: 'FX_IDC:EURAED' },
      { description: 'USD/ILS', proName: 'FX_IDC:USDILS' },
      { description: 'EUR/ILS', proName: 'FX_IDC:EURILS' },
      { description: 'AED/ILS', proName: 'FX_IDC:AEDILS' },
    ],
    isTransparent: false,
    showSymbolLogo: true,
    colorTheme: 'light',
    displayMode: 'regular',
    locale: 'en',
  }));
  return (
    <View style={{ marginBottom: 14, marginHorizontal: -14, height: 48, overflow: 'hidden', backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E8DEC8' }}>
      <WebView
        originWhitelist={['*']}
        source={{ uri: `https://s.tradingview.com/embed-widget/ticker-tape/?locale=en#${cfg}` }}
        style={{ flex: 1, backgroundColor: 'transparent' }}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

function BusinessContent() {
  const [news, setNews] = useState<any[]>([]);
  const [preview, setPreview] = useState<any | null>(null);
  const newsSp = useScrollProgress();

  useEffect(() => {
    const rss = 'https://news.google.com/rss/search?q=' + encodeURIComponent('דובאי עסקים כלכלה') + '&hl=he&gl=IL&ceid=IL:he';
    fetch('https://api.rss2json.com/v1/api.json?rss_url=' + encodeURIComponent(rss))
      .then(r => r.json())
      .then(j => setNews((j.items || []).slice(0, 10)))
      .catch(() => {});
  }, []);

  return (
    <>
      <CurrencyTicker />
      <Text style={s.sectionTitle}>חדשות עסקים מדובאי</Text>
      {news.length === 0 ? (
        <View style={s.placeholder}><Text style={s.placeholderSub}>⏳ טוען חדשות...</Text></View>
      ) : (
        <View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 10, paddingBottom: 6 }}
            onScroll={newsSp.onScroll}
            onLayout={newsSp.onLayout}
            onContentSizeChange={newsSp.onContentSizeChange}
            scrollEventThrottle={16}
          >
            {news.map((it, i) => {
              const img = it.enclosure?.link || it.thumbnail;
              const date = it.pubDate ? new Date(it.pubDate).toLocaleDateString('he-IL') : '';
              return (
                <TouchableOpacity key={i} style={s.newsCard} onPress={() => setPreview(it)}>
                  <NewsImage uri={img} index={i} style={s.newsImg} />
                  <View style={{ padding: 8 }}>
                    <Text style={s.newsTitle} numberOfLines={3}>{it.title}</Text>
                    <Text style={s.newsDate}>{date}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <ThinScrollBar progress={newsSp.progress} />
        </View>
      )}

      <Modal visible={!!preview} transparent animationType="fade" onRequestClose={() => setPreview(null)}>
        <View style={s.modalBackdrop}>
          <Pressable onPress={() => setPreview(null)} style={StyleSheet.absoluteFill} />
          <View style={s.modalCard}>
            <LinearGradient colors={['#0E2A38', '#1A4A5E']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={s.modalHead}>
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 8 }}>
                <Text style={s.modalKicker}>עסקים</Text>
                {preview?.pubDate ? <Text style={s.modalDate}>{new Date(preview.pubDate).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' })}</Text> : null}
              </View>
              <TouchableOpacity onPress={() => setPreview(null)} style={s.modalClose}>
                <Text style={{ color: '#fff', fontSize: 18 }}>×</Text>
              </TouchableOpacity>
            </LinearGradient>
            {preview ? (
              <NewsImage uri={preview.enclosure?.link || preview.thumbnail} index={news.indexOf(preview)} style={s.modalImg} />
            ) : null}
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18, paddingBottom: 26 }}>
              <Text style={s.modalTitle}>{preview?.title}</Text>
              {(() => {
                const src = preview?.author || ((preview?.link || '').match(/\/\/(?:www\.)?([^\/]+)/)?.[1] || '');
                return src ? <Text style={s.modalSource}>📰 {src}</Text> : null;
              })()}
              <Text style={s.modalSummary}>{((preview?.description || preview?.content || '') as string).replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim() || 'אין תקציר זמין.'}</Text>
              <View style={s.modalDivider} />
              <TouchableOpacity onPress={() => preview && Linking.openURL(preview.link)} style={s.modalLinkBtn}>
                <Text style={s.modalLinkBtnTxt}>לכתבה המלאה במקור ←</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <TradingChart title="זהב (XAU/USD)" symbol="OANDA:XAUUSD" />
      <TradingChart title="כסף (XAG/USD)" symbol="OANDA:XAGUSD" />
      <TradingChart title="נפט (US Oil)" symbol="TVC:USOIL" />

      <View style={s.disclaimer}>
        <Text style={s.disclaimerTxt}>⚠️ הנתונים מסופקים על ידי TradingView לצרכי מידע בלבד. אינם המלצה להשקעה.</Text>
      </View>
    </>
  );
}

const BIG_PICTURE_STATS = [
  { val: '1,000+', label: 'חברות ישראליות עם נציגות בדובאי', color: '#1A6B8A' },
  { val: '$2.5B+', label: 'השקעות הדדיות מאז הסכמי אברהם', color: '#2A9D8F' },
  { val: '600K+', label: 'ישראלים מבקרים בדובאי בשנה', color: '#E76F51' },
  { val: '3,000', label: 'ישראלים חיים בדובאי כיום', color: '#7FA77F' },
  { val: '70+', label: 'טיסות שבועיות מישראל', color: '#B85C8E' },
  { val: '3:00', label: 'שעות טיסה — בלי ויזה', color: '#5B9DC7' },
  { val: '8-12%', label: 'תשואת נדל"ן ממוצעת בפרויקטים פופולריים', color: '#B8923A' },
];

function IsraeliContent() {
  const slideW = SCREEN_W - 36;
  const [activeSlide, setActiveSlide] = useState(0);
  const onSlideScroll = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / (slideW + 10));
    if (idx !== activeSlide) setActiveSlide(idx);
  };

  const slides = [
    <View key="big" style={[s.bigCard, { width: slideW }]}>
      <View style={{ flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <Text style={s.bigCardTitle}>התמונה הגדולה</Text>
        <View style={s.yearChip}><Text style={s.yearChipTxt}>2026</Text></View>
      </View>
      <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
        {BIG_PICTURE_STATS.map((st, i) => (
          <View key={i} style={[s.statRow, i === BIG_PICTURE_STATS.length - 1 && { borderBottomWidth: 0 }]}>
            <Text style={[s.statVal, { color: st.color }]}>{st.val}</Text>
            <Text style={s.statLabel}>{st.label}</Text>
          </View>
        ))}
      </ScrollView>
    </View>,
    <View key="areas" style={[s.bigCard, { width: slideW }]}>
      <Text style={s.bigCardTitle}>🏙️ אזורים שישראלים קונים בהם</Text>
      <Text style={s.bigCardSub}>דירוג לפי תשואה ופופולריות</Text>
      <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
        {TOP_AREAS.map((a, i) => (
          <View key={i} style={[s.areaRow, i === TOP_AREAS.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={s.areaNum}><Text style={s.areaNumTxt}>{i + 1}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.areaName}>{a.name}</Text>
              <Text style={s.areaNote}>{a.note}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={s.areaYield}>{a.yield}</Text>
              <Text style={s.areaEntry}>{a.entry}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>,
    <View key="sectors" style={[s.bigCard, { width: slideW }]}>
      <Text style={s.bigCardTitle}>🚀 ענפים פורחים</Text>
      <Text style={s.bigCardSub}>5 הסקטורים המובילים</Text>
      <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
        {SECTORS.map((sec, i) => (
          <View key={i} style={[s.sectorRow, i === SECTORS.length - 1 && { borderBottomWidth: 0 }]}>
            <Text style={{ fontSize: 20 }}>{sec.icon}</Text>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={s.sectorName}>{sec.name}</Text>
                <View style={s.kpiChip}><Text style={s.kpiChipTxt}>{sec.kpi}</Text></View>
              </View>
              <Text style={s.sectorDesc}>{sec.desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>,
    <View key="funds" style={[s.bigCard, { width: slideW }]}>
      <Text style={s.bigCardTitle}>💼 קרנות וגופי השקעה</Text>
      <Text style={s.bigCardSub}>משרדים פעילים בדובאי / DIFC</Text>
      <ScrollView showsVerticalScrollIndicator={false} nestedScrollEnabled>
        {FUNDS.map((f, i) => (
          <View key={i} style={[s.fundRow, i === FUNDS.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={s.fundTag}><Text style={s.fundTagTxt}>{f.tag}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.fundName}>{f.name}</Text>
              <Text style={s.fundDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>,
  ];

  return (
    <>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={slideW + 10}
        decelerationRate="fast"
        contentContainerStyle={{ gap: 10, paddingHorizontal: 4 }}
        onScroll={onSlideScroll}
        scrollEventThrottle={16}
      >
        {slides}
      </ScrollView>

      <View style={s.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[s.dot, activeSlide === i && s.dotActive]} />
        ))}
      </View>

      <TouchableOpacity style={s.submitProject} onPress={() => router.push('/submit-project' as any)}>
        <Text style={s.submitProjectTxt}>📤 העלה פרויקט חדש</Text>
        <Text style={s.submitProjectArrow}>‹</Text>
      </TouchableOpacity>

      <UserProjectsList />
    </>
  );
}

function UserProjectsList() {
  const [projects, setProjects] = useState<any[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('https://wellcomedubaicom-production.up.railway.app/api/listings?_t=' + Date.now())
      .then(r => r.json())
      .then(j => { if (!cancelled) setProjects((j.listings || []).filter((l: any) => l.type === 'project')); })
      .catch(() => { if (!cancelled) setProjects([]); });
    return () => { cancelled = true; };
  }, []);

  if (!projects || projects.length === 0) return null;

  return (
    <View style={{ marginTop: 24 }}>
      <Text style={[s.sectionTitle, { marginTop: 0, marginBottom: 12, fontSize: 17 }]}>פרויקטים מיזמים</Text>
      <View style={{ gap: 14 }}>
        {projects.map(p => <ProjectCard key={p.id} project={p} />)}
      </View>
    </View>
  );
}

function ProjectCard({ project: p }: { project: any }) {
  const photo = p.photos?.[0] ? (p.photos[0].startsWith('http') ? p.photos[0] : 'https://wellcomedubaicom-production.up.railway.app' + p.photos[0]) : '';
  return (
    <TouchableOpacity activeOpacity={0.9} style={s.projectCard} onPress={() => Linking.openURL('https://wellcomedubai.com/#realestate')}>
      {photo ? <Image source={{ uri: photo }} style={s.projectImg} /> : <View style={[s.projectImg, { backgroundColor: '#0E2A38', alignItems: 'center', justifyContent: 'center' }]}><Text style={{ color: '#fff', opacity: 0.5 }}>אין מדיה</Text></View>}
      <View style={s.projectBody}>
        <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <Text style={s.projectTitle} numberOfLines={1}>{p.title}</Text>
          {p.yieldPct ? <View style={s.projectYield}><Text style={s.projectYieldTxt}>{p.yieldPct}%</Text></View> : null}
        </View>
        {p.developer ? <Text style={s.projectMeta}>🏢 {p.developer}</Text> : null}
        <Text style={s.projectMeta}>📍 {p.area}{p.delivery ? ` · 📅 מסירה ${p.delivery}` : ''}</Text>
        <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <Text style={s.projectPrice}>החל מ-AED {p.price}</Text>
          <Text style={s.projectCta}>פרטים מלאים ←</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ListingsPlaceholder({ type }: { type: 'sale' | 'rent' }) {
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('https://wellcomedubaicom-production.up.railway.app/api/listings?_t=' + Date.now())
      .then(r => r.json())
      .then(j => { if (!cancelled) { setListings((j.listings || []).filter((l: any) => l.type === type)); setLoading(false); } })
      .catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [type]);

  if (loading) {
    return <View style={s.placeholder}><Text style={s.placeholderSub}>⏳ טוען מודעות...</Text></View>;
  }

  return (
    <View>
      <TouchableOpacity style={s.publishBtn} onPress={() => Linking.openURL('https://wellcomedubai.com/#realestate')}>
        <Text style={s.publishTxt}>פרסם מודעה חדשה — {type === 'sale' ? 'למכירה' : 'להשכרה'}</Text>
        <Text style={s.publishArrow}>‹</Text>
      </TouchableOpacity>
      {listings.length === 0 ? (
        <View style={s.placeholder}>
          <Text style={s.placeholderSub}>אין מודעות {type === 'sale' ? 'למכירה' : 'להשכרה'} כרגע. תהיה הראשון!</Text>
        </View>
      ) : listings.map(l => {
        const photo = l.photos?.[0] ? (l.photos[0].startsWith('http') ? l.photos[0] : 'https://wellcomedubaicom-production.up.railway.app' + l.photos[0]) : '';
        return (
          <View key={l.id} style={s.listingCard}>
            {photo ? <Image source={{ uri: photo }} style={s.listingImg} /> : null}
            <View style={s.listingBody}>
              <Text style={s.listingTitle}>{l.title}</Text>
              <Text style={s.listingArea}>📍 {l.area}</Text>
              <Text style={s.listingPrice}>AED {l.price}</Text>
              {l.desc ? <Text style={s.listingDesc} numberOfLines={3}>{l.desc}</Text> : null}
              <View style={{ flexDirection: 'row-reverse', gap: 6, marginTop: 8 }}>
                <TouchableOpacity style={[s.actionBtn, { backgroundColor: '#25D366' }]} onPress={() => Linking.openURL(`https://wa.me/${(l.phone || '').replace(/\D/g, '')}`)}>
                  <Text style={s.actionTxt}>💬 WhatsApp</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.actionBtn, { backgroundColor: Colors.PRIMARY }]} onPress={() => Linking.openURL(`tel:${l.phone}`)}>
                  <Text style={s.actionTxt}>📞 חייג</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function BrokersBanner() {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => router.push('/brokers' as any)} style={s.brokersBanner}>
      <ImageBackground
        source={{ uri: 'https://wellcomedubai.com/images/wellcomedubai.stamp/lifestyle-business-woman-feel-happy-jumping-air-celebrating-success.jpg' }}
        style={{ flex: 1 }}
        imageStyle={{ borderRadius: 14 }}
      >
        <View style={s.brokersOverlay}>
          <Text style={s.brokersKicker}>PREMIUM SERVICE</Text>
          <Text style={s.brokersTitle}>מתווכים / רוא"ח / עורכי דין</Text>
          <Text style={s.brokersSub}>דוברי עברית · ניסיון עם ישראלים</Text>
        </View>
      </ImageBackground>
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDF6EC' },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  back: { padding: 4 },
  closeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  title: { color: '#fff', fontSize: 17, fontWeight: '900', writingDirection: 'rtl' },

  kpiHero: { paddingHorizontal: 16, paddingBottom: 18, paddingTop: 6 },
  kpiHeroHead: { alignItems: 'center', marginBottom: 12 },
  kpiKicker: { color: Colors.GOLD, fontSize: 14, fontWeight: '800', letterSpacing: 1.6, textAlign: 'center' },
  kpiLive: { color: 'rgba(255,255,255,0.7)', fontSize: 11.5, marginTop: 3, textAlign: 'center', letterSpacing: 0.8 },
  kpiGrid: { flexDirection: 'row-reverse', gap: 8, alignItems: 'stretch' },
  kpiBox: { flex: 1, flexBasis: 0, backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(233,196,106,0.25)', borderWidth: 1, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 12, justifyContent: 'space-between', minHeight: 86 },
  kpiLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 10, fontWeight: '600', marginBottom: 6, textAlign: 'right', writingDirection: 'rtl' },
  kpiVal: { color: '#fff', fontSize: 15, fontWeight: '800', textAlign: 'right' },
  kpiDelta: { fontSize: 10.5, fontWeight: '700', marginTop: 4, textAlign: 'right' },

  tabsStrip: { flexDirection: 'row-reverse', backgroundColor: '#FDF6EC', borderBottomWidth: 1, borderBottomColor: '#E8DEC8', paddingVertical: 4 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 6, paddingHorizontal: 1, position: 'relative', minWidth: 0 },
  tabL1: { fontSize: TAB_FONT, lineHeight: TAB_LINE, textAlign: 'center' },
  tabL2: { fontSize: TAB_FONT, lineHeight: TAB_LINE, textAlign: 'center' },
  tabUnderline: { position: 'absolute', bottom: 0, left: 14, right: 14, height: 1.5 },

  sectionTitle: { fontWeight: '900', color: '#1A4A5E', fontSize: 16, marginTop: 18, marginBottom: 12, textAlign: 'right', writingDirection: 'rtl', alignSelf: 'stretch' },
  whyBanner: { backgroundColor: '#E76F51', borderRadius: 14, padding: 18, marginVertical: 12, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 8 },
  whyKicker: { color: 'rgba(255,255,255,0.9)', fontSize: 11, letterSpacing: 1.3, fontWeight: '700', writingDirection: 'rtl', textAlign: 'right' },
  whyTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginTop: 6, marginBottom: 12, writingDirection: 'rtl', textAlign: 'right' },
  whyGrid: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 8 },
  whyItem: { color: '#fff', fontSize: 12, fontWeight: '600', width: '48%', writingDirection: 'rtl', textAlign: 'right' },
  investMapWrap: { height: 260, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 },

  bigCard: { backgroundColor: '#fff', borderRadius: 16, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14, marginBottom: 4, height: 400, overflow: 'hidden', borderWidth: 1, borderColor: '#E8DEC8', shadowColor: '#0E2A38', shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 6 } },
  bigCardHead: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F0E6D2' },
  bigCardTitle: { fontWeight: '900', color: '#1A4A5E', fontSize: 16, writingDirection: 'rtl', letterSpacing: -0.3 },
  bigCardSub: { color: Colors.MUTED, fontSize: 11.5, marginTop: 2, marginBottom: 14, writingDirection: 'rtl', lineHeight: 16 },
  yearChip: { backgroundColor: '#FDF6EC', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: '#E8DEC8' },
  yearChipTxt: { color: '#B8923A', fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },

  statRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F5EDD8' },
  statVal: { fontSize: 17, fontWeight: '900', minWidth: 70, textAlign: 'right', letterSpacing: -0.4 },
  statLabel: { color: '#1A4A5E', fontSize: 12, fontWeight: '600', flex: 1, lineHeight: 16, textAlign: 'right', writingDirection: 'rtl' },

  areaRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 13, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0E6D2' },
  areaNum: { width: 32, height: 32, borderRadius: 9, backgroundColor: Colors.PINK, alignItems: 'center', justifyContent: 'center', shadowColor: Colors.PINK, shadowOpacity: 0.3, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  areaNumTxt: { color: '#fff', fontWeight: '900', fontSize: 14 },
  areaName: { fontWeight: '800', color: '#1A4A5E', fontSize: 15, writingDirection: 'rtl', textAlign: 'right' },
  areaNote: { color: Colors.MUTED, fontSize: 12, marginTop: 3, writingDirection: 'rtl', textAlign: 'right' },
  areaYield: { color: Colors.SECONDARY, fontWeight: '900', fontSize: 16, letterSpacing: -0.3 },
  areaEntry: { color: Colors.MUTED, fontSize: 11.5, marginTop: 2 },

  sectorRow: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 13, paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: '#F0E6D2' },
  sectorName: { fontWeight: '800', color: '#1A4A5E', fontSize: 15, writingDirection: 'rtl' },
  sectorDesc: { color: Colors.MUTED, fontSize: 13, lineHeight: 19, marginTop: 4, writingDirection: 'rtl', textAlign: 'right' },
  kpiChip: { backgroundColor: '#FDF6EC', paddingHorizontal: 9, paddingVertical: 4, borderRadius: 6, borderWidth: 1, borderColor: '#E8DEC8' },
  kpiChipTxt: { color: '#B8923A', fontSize: 11, fontWeight: '800' },

  fundRow: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 13, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#F0E6D2' },
  fundTag: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#1A4A5E', alignItems: 'center', justifyContent: 'center', shadowColor: '#1A4A5E', shadowOpacity: 0.25, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  fundTagTxt: { color: Colors.GOLD, fontSize: 11.5, fontWeight: '900', letterSpacing: 0.8 },
  fundName: { fontWeight: '800', color: '#1A4A5E', fontSize: 15, writingDirection: 'rtl', textAlign: 'right' },
  fundDesc: { color: Colors.MUTED, fontSize: 13, marginTop: 4, lineHeight: 19, writingDirection: 'rtl', textAlign: 'right' },

  submitProject: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.PRIMARY, padding: 12, borderRadius: 8, marginTop: 14 },
  submitProjectTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  submitProjectArrow: { color: '#fff', fontSize: 16 },

  articleCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: '#E5E7EB' },
  articleHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, marginBottom: 8 },
  articleTitle: { flex: 1, fontWeight: '800', color: Colors.TEXT, fontSize: 14, writingDirection: 'rtl', textAlign: 'right' },
  articleBody: { fontSize: 12.5, color: Colors.TEXT, lineHeight: 19, writingDirection: 'rtl', textAlign: 'right' },

  investCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  investHeader: { flexDirection: 'row-reverse', alignItems: 'center', gap: 8, marginBottom: 6 },
  investNum: { width: 28, height: 28, borderRadius: 14, backgroundColor: Colors.WARM, alignItems: 'center', justifyContent: 'center' },
  investNumTxt: { color: '#fff', fontWeight: '900', fontSize: 13 },
  investArea: { flex: 1, fontWeight: '800', color: Colors.TEXT, fontSize: 14, writingDirection: 'rtl' },
  yieldBadge: { backgroundColor: Colors.WARM + '20', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  yieldTxt: { color: Colors.ACCENT, fontWeight: '800', fontSize: 11 },
  investEntry: { fontSize: 12, color: Colors.MUTED, marginBottom: 4, writingDirection: 'rtl', textAlign: 'right' },
  investHl: { fontSize: 12, color: Colors.MUTED, lineHeight: 17, writingDirection: 'rtl', textAlign: 'right' },

  placeholder: { alignItems: 'center', padding: 30, gap: 10 },
  placeholderTitle: { fontSize: 18, fontWeight: '800', color: Colors.TEXT },
  placeholderSub: { fontSize: 13, color: Colors.MUTED, textAlign: 'center' },
  openWebBtn: { backgroundColor: Colors.PRIMARY, paddingHorizontal: 18, paddingVertical: 10, borderRadius: 8, marginTop: 8 },
  openWebBtnTxt: { color: '#fff', fontWeight: '700' },
  publishBtn: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.PRIMARY, padding: 12, borderRadius: 8, marginBottom: 14 },
  publishTxt: { color: '#fff', fontWeight: '700', fontSize: 14 },
  publishArrow: { color: '#fff', fontSize: 16 },
  listingCard: { backgroundColor: '#fff', borderRadius: 12, marginBottom: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#E8DEC8' },
  listingImg: { width: '100%', height: 180 },
  listingBody: { padding: 12 },
  listingTitle: { fontWeight: '900', color: Colors.TEXT, fontSize: 15, writingDirection: 'rtl', textAlign: 'right' },
  listingArea: { color: Colors.MUTED, fontSize: 12, marginTop: 4, writingDirection: 'rtl', textAlign: 'right' },
  listingPrice: { color: Colors.ACCENT, fontWeight: '900', fontSize: 16, marginTop: 6 },
  listingDesc: { color: Colors.TEXT, fontSize: 12, marginTop: 6, lineHeight: 17, writingDirection: 'rtl', textAlign: 'right' },
  actionBtn: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  actionTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },

  newsCard: { width: 240, backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  newsImg: { width: '100%', height: 110 },
  newsTitle: { fontSize: 12, fontWeight: '800', color: Colors.TEXT, lineHeight: 16, writingDirection: 'rtl', textAlign: 'right' },
  newsDate: { fontSize: 10, color: Colors.MUTED, marginTop: 4 },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 14 },
  modalCard: { backgroundColor: '#fff', borderRadius: 14, width: '100%', maxWidth: 520, height: '85%', overflow: 'hidden', flexDirection: 'column', shadowColor: '#000', shadowOpacity: 0.35, shadowRadius: 20, shadowOffset: { width: 0, height: 12 } },
  modalHead: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 14 },
  modalKicker: { color: '#fff', backgroundColor: Colors.ACCENT, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, fontSize: 11, fontWeight: '800' },
  modalDate: { color: 'rgba(255,255,255,0.75)', fontSize: 11 },
  modalClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  modalImg: { width: '100%', height: 200 },
  modalTitle: { fontWeight: '900', color: '#1A4A5E', fontSize: 16, marginBottom: 10, lineHeight: 22, writingDirection: 'rtl', textAlign: 'right' },
  modalSummary: { color: Colors.TEXT, fontSize: 14, lineHeight: 24, writingDirection: 'rtl', textAlign: 'right' },
  modalLink: { color: Colors.PRIMARY, fontWeight: '800', fontSize: 14, marginTop: 14, textAlign: 'left', textDecorationLine: 'underline' },
  modalSource: { color: Colors.MUTED, fontSize: 12, fontWeight: '600', marginBottom: 12, writingDirection: 'rtl', textAlign: 'right' },
  modalChips: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  modalChip: { backgroundColor: '#FDF6EC', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 14, borderWidth: 1, borderColor: '#E8DEC8' },
  modalChipTxt: { color: '#B8923A', fontSize: 11, fontWeight: '800' },
  modalDivider: { height: 1, backgroundColor: '#F0E6D2', marginTop: 18, marginBottom: 4 },
  modalLinkBtn: { backgroundColor: Colors.PRIMARY, paddingVertical: 12, paddingHorizontal: 18, borderRadius: 10, marginTop: 14, alignItems: 'center' },
  modalLinkBtnTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
  disclaimer: { backgroundColor: '#FAF3DE', borderColor: '#B8923A', borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 10 },
  disclaimerTxt: { color: '#7B5E1F', fontSize: 12, lineHeight: 20, writingDirection: 'rtl', textAlign: 'right' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 5, marginTop: 10, marginBottom: 4 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#D4C9B0' },
  dotActive: { width: 18, backgroundColor: '#1A4A5E' },

  projectCard: { backgroundColor: '#fff', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#E8DEC8', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  projectImg: { width: '100%', height: 200 },
  projectBody: { padding: 14 },
  projectTitle: { flex: 1, fontWeight: '900', color: '#1A4A5E', fontSize: 16, writingDirection: 'rtl', textAlign: 'right' },
  projectYield: { backgroundColor: Colors.SECONDARY, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginLeft: 8 },
  projectYieldTxt: { color: '#fff', fontWeight: '800', fontSize: 12 },
  projectMeta: { color: Colors.MUTED, fontSize: 12.5, marginTop: 2, writingDirection: 'rtl', textAlign: 'right' },
  projectPrice: { color: Colors.ACCENT, fontWeight: '900', fontSize: 16 },
  projectCta: { color: Colors.PRIMARY, fontWeight: '700', fontSize: 12.5 },
  brokersBanner: { height: 110, marginTop: 16, borderRadius: 14, overflow: 'hidden' },
  brokersOverlay: { flex: 1, backgroundColor: 'rgba(184,92,142,0.65)', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 14 },
  brokersKicker: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, opacity: 0.85 },
  brokersTitle: { color: '#fff', fontSize: 17, fontWeight: '900', marginTop: 4, writingDirection: 'rtl' },
  brokersSub: { color: 'rgba(255,255,255,0.95)', fontSize: 12, marginTop: 4, writingDirection: 'rtl' },
});
