import { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, Linking, ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Colors } from '../constants/colors';
import { RE_ARTICLES, RE_INVESTMENTS } from '../constants/realestate';

const TABS = [
  { id: 'sale',     line1: 'דירות', line2: 'למכירה', color: Colors.PRIMARY },
  { id: 'rent',     line1: 'דירות', line2: 'להשכרה', color: Colors.SECONDARY },
  { id: 'invest',   line1: 'פורטל', line2: 'הנדל"ן',  color: Colors.ACCENT },
  { id: 'business', line1: 'פורטל', line2: 'העסקים', color: Colors.GOLD, isExternal: true },
  { id: 'israeli',  line1: 'השקעות', line2: 'ישראליות', color: Colors.PINK },
];

const STATS = [
  { val: '1,000+', label: 'חברות ישראליות עם נציגות בדובאי', color: '#1A6B8A' },
  { val: '$2.5B+', label: 'השקעות הדדיות מאז הסכמי אברהם', color: '#2A9D8F' },
  { val: '600K+', label: 'ישראלים מבקרים בדובאי בשנה', color: '#E76F51' },
  { val: '3,000', label: 'ישראלים חיים בדובאי כיום', color: '#7FA77F' },
  { val: '70+', label: 'טיסות שבועיות מישראל', color: '#B85C8E' },
  { val: '3:00', label: 'שעות טיסה — בלי ויזה', color: '#5B9DC7' },
  { val: '8-12%', label: 'תשואת נדל"ן ממוצעת בפרויקטים פופולריים', color: '#B8923A' },
];

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
  const [tab, setTab] = useState<'sale' | 'rent' | 'invest' | 'israeli'>('invest');

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }} stickyHeaderIndices={[1]}>
        {/* Dark header + KPI hero (scrolls) */}
        <SafeAreaView edges={['top']} style={{ backgroundColor: '#0E2A38' }}>
          <View style={s.header}>
            <TouchableOpacity onPress={() => router.back()} style={s.back}>
              <Text style={{ fontSize: 22, color: '#fff' }}>←</Text>
            </TouchableOpacity>
            <Text style={s.title}>פורטל הנדל"ן בדובאי</Text>
          </View>
          <View style={s.kpiHero}>
            <View style={s.kpiHeroHead}>
              <Text style={s.kpiKicker}>DUBAI REAL ESTATE INDEX</Text>
              <Text style={s.kpiLive}>LIVE • Q2 2026</Text>
            </View>
            <View style={s.kpiGrid}>
              <View style={s.kpiBox}>
                <Text style={s.kpiLabel}>מחיר ממוצע למ"ר</Text>
                <Text style={s.kpiVal}>AED 1,580</Text>
                <Text style={[s.kpiDelta, { color: '#4ADE80' }]}>▲ 19.8% YoY</Text>
              </View>
              <View style={s.kpiBox}>
                <Text style={s.kpiLabel}>תשואה ממוצעת</Text>
                <Text style={s.kpiVal}>8.2%</Text>
                <Text style={[s.kpiDelta, { color: '#4ADE80' }]}>▲ 0.6pt YoY</Text>
              </View>
              <View style={s.kpiBox}>
                <Text style={s.kpiLabel}>AED / ILS</Text>
                <Text style={s.kpiVal}>0.998</Text>
                <Text style={[s.kpiDelta, { color: '#F87171' }]}>▼ 0.4% MoM</Text>
              </View>
            </View>
          </View>
        </SafeAreaView>

        {/* Flat tabs (sticky) */}
        <View style={s.tabsStrip}>
          {TABS.map(t => {
            const isActive = tab === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                style={s.tabBtn}
                onPress={() => {
                  if (t.isExternal) {
                    Linking.openURL('https://wellcomedubai.com/#business');
                  } else {
                    setTab(t.id as any);
                  }
                }}
              >
                <Text style={[s.tabL1, { color: isActive ? t.color : Colors.MUTED, fontWeight: isActive ? '900' : '600' }]}>{t.line1}</Text>
                <Text style={[s.tabL2, { color: isActive ? t.color : Colors.MUTED, fontWeight: isActive ? '900' : '600' }]}>{t.line2}</Text>
                {isActive && <View style={[s.tabUnderline, { backgroundColor: t.color }]} />}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{ padding: 14 }}>
          {tab === 'invest' && <InvestContent />}
          {tab === 'israeli' && <IsraeliContent />}
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
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingBottom: 6 }}>
          {news.map((it, i) => {
            const img = it.enclosure?.link || it.thumbnail || 'https://wellcomedubai.com/images/wellcomedubai.stamp/skyscrapers-looking-up-sky-modern-metropolis-modern-city.jpg';
            const date = it.pubDate ? new Date(it.pubDate).toLocaleDateString('he-IL') : '';
            return (
              <TouchableOpacity key={i} style={s.newsCard} onPress={() => setPreview(it)}>
                <Image source={{ uri: img }} style={s.newsImg} />
                <View style={{ padding: 8 }}>
                  <Text style={s.newsTitle} numberOfLines={3}>{it.title}</Text>
                  <Text style={s.newsDate}>{date}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {preview && (
        <View style={s.modalBackdrop}>
          <View style={s.modalCard}>
            <View style={s.modalHead}>
              <Text style={s.modalKicker}>חדשות</Text>
              <TouchableOpacity onPress={() => setPreview(null)} style={s.modalClose}>
                <Text style={{ color: '#fff', fontSize: 18 }}>×</Text>
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={{ padding: 16 }}>
              {(preview.enclosure?.link || preview.thumbnail) && (
                <Image source={{ uri: preview.enclosure?.link || preview.thumbnail }} style={s.modalImg} />
              )}
              <Text style={s.modalTitle}>{preview.title}</Text>
              <Text style={s.modalSummary}>{(preview.description || '').replace(/<[^>]+>/g, '').slice(0, 600)}</Text>
              <TouchableOpacity onPress={() => Linking.openURL(preview.link)}>
                <Text style={s.modalLink}>לכתבה במקור ←</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      )}

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

function IsraeliContent() {
  return (
    <>
      {/* Slide 1: KPIs */}
      <View style={s.bigCard}>
        <View style={s.bigCardHead}>
          <Text style={s.bigCardTitle}>התמונה הגדולה</Text>
          <View style={s.yearChip}><Text style={s.yearChipTxt}>2026</Text></View>
        </View>
        {STATS.map((stat, i) => (
          <View key={i} style={[s.statRow, i === STATS.length - 1 && { borderBottomWidth: 0 }]}>
            <Text style={[s.statVal, { color: stat.color }]}>{stat.val}</Text>
            <Text style={s.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Slide 2: Top areas */}
      <View style={s.bigCard}>
        <Text style={s.bigCardTitle}>🏙️ אזורים שישראלים קונים בהם</Text>
        <Text style={s.bigCardSub}>דירוג לפי תשואה ופופולריות</Text>
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
      </View>

      {/* Slide 3: Sectors */}
      <View style={s.bigCard}>
        <Text style={s.bigCardTitle}>🚀 ענפים פורחים</Text>
        {SECTORS.map((sec, i) => (
          <View key={i} style={[s.sectorRow, i === SECTORS.length - 1 && { borderBottomWidth: 0 }]}>
            <Text style={{ fontSize: 22 }}>{sec.icon}</Text>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={s.sectorName}>{sec.name}</Text>
                <View style={s.kpiChip}><Text style={s.kpiChipTxt}>{sec.kpi}</Text></View>
              </View>
              <Text style={s.sectorDesc}>{sec.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Slide 4: Funds */}
      <View style={s.bigCard}>
        <Text style={s.bigCardTitle}>💼 קרנות וגופי השקעה</Text>
        {FUNDS.map((f, i) => (
          <View key={i} style={[s.fundRow, i === FUNDS.length - 1 && { borderBottomWidth: 0 }]}>
            <View style={s.fundTag}><Text style={s.fundTagTxt}>{f.tag}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={s.fundName}>{f.name}</Text>
              <Text style={s.fundDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Submit project CTA */}
      <TouchableOpacity style={s.submitProject} onPress={() => Linking.openURL('https://wellcomedubai.com/#realestate')}>
        <Text style={s.submitProjectTxt}>📤 העלה פרויקט חדש</Text>
        <Text style={s.submitProjectArrow}>‹</Text>
      </TouchableOpacity>
    </>
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
        <Text style={s.publishTxt}>📤 פרסם מודעה חדשה — {type === 'sale' ? 'למכירה' : 'להשכרה'}</Text>
        <Text style={s.publishArrow}>‹</Text>
      </TouchableOpacity>
      {listings.length === 0 ? (
        <View style={s.placeholder}>
          <Text style={{ fontSize: 40 }}>🏠</Text>
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
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 10 },
  back: { padding: 4 },
  title: { color: '#fff', fontSize: 17, fontWeight: '900', writingDirection: 'rtl' },

  kpiHero: { paddingHorizontal: 16, paddingBottom: 18, paddingTop: 6 },
  kpiHeroHead: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  kpiKicker: { color: Colors.GOLD, fontSize: 11, fontWeight: '700', letterSpacing: 1.5 },
  kpiLive: { color: 'rgba(255,255,255,0.55)', fontSize: 10 },
  kpiGrid: { flexDirection: 'row-reverse', gap: 8 },
  kpiBox: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', borderColor: 'rgba(233,196,106,0.25)', borderWidth: 1, borderRadius: 10, padding: 10 },
  kpiLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: '600', marginBottom: 4 },
  kpiVal: { color: '#fff', fontSize: 16, fontWeight: '800' },
  kpiDelta: { fontSize: 11, fontWeight: '700', marginTop: 2 },

  tabsStrip: { flexDirection: 'row-reverse', backgroundColor: '#FDF6EC', borderBottomWidth: 1, borderBottomColor: '#E8DEC8', paddingVertical: 4, paddingHorizontal: 4 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 8, position: 'relative', minWidth: 0 },
  tabL1: { fontSize: 11, lineHeight: 14 },
  tabL2: { fontSize: 11, lineHeight: 14 },
  tabUnderline: { position: 'absolute', bottom: 0, left: 14, right: 14, height: 1.5 },

  sectionTitle: { fontWeight: '900', color: '#1A4A5E', fontSize: 16, marginTop: 18, marginBottom: 12 },

  bigCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E8DEC8' },
  bigCardHead: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  bigCardTitle: { fontWeight: '800', color: '#1A4A5E', fontSize: 15, writingDirection: 'rtl' },
  bigCardSub: { color: Colors.MUTED, fontSize: 11, marginBottom: 10, writingDirection: 'rtl' },
  yearChip: { backgroundColor: '#FDF6EC', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  yearChipTxt: { color: '#B8923A', fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  statRow: { flexDirection: 'row-reverse', alignItems: 'baseline', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5EDD8' },
  statVal: { fontSize: 22, fontWeight: '900', minWidth: 78, textAlign: 'left' },
  statLabel: { color: '#1A4A5E', fontSize: 12, fontWeight: '600', flex: 1, lineHeight: 16, textAlign: 'right', writingDirection: 'rtl' },

  areaRow: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0E6D2' },
  areaNum: { width: 26, height: 26, borderRadius: 6, backgroundColor: Colors.PINK, alignItems: 'center', justifyContent: 'center' },
  areaNumTxt: { color: '#fff', fontWeight: '800', fontSize: 12 },
  areaName: { fontWeight: '800', color: '#1A4A5E', fontSize: 13, writingDirection: 'rtl', textAlign: 'right' },
  areaNote: { color: Colors.MUTED, fontSize: 10, marginTop: 2, writingDirection: 'rtl', textAlign: 'right' },
  areaYield: { color: Colors.SECONDARY, fontWeight: '800', fontSize: 13 },
  areaEntry: { color: Colors.MUTED, fontSize: 10 },

  sectorRow: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F0E6D2' },
  sectorName: { fontWeight: '800', color: '#1A4A5E', fontSize: 13, writingDirection: 'rtl' },
  sectorDesc: { color: Colors.MUTED, fontSize: 11, lineHeight: 16, marginTop: 2, writingDirection: 'rtl', textAlign: 'right' },
  kpiChip: { backgroundColor: '#FDF6EC', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 5 },
  kpiChipTxt: { color: '#B8923A', fontSize: 9, fontWeight: '800' },

  fundRow: { flexDirection: 'row-reverse', alignItems: 'flex-start', gap: 10, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F0E6D2' },
  fundTag: { width: 34, height: 34, borderRadius: 8, backgroundColor: '#1A4A5E', alignItems: 'center', justifyContent: 'center' },
  fundTagTxt: { color: Colors.GOLD, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  fundName: { fontWeight: '800', color: '#1A4A5E', fontSize: 13, writingDirection: 'rtl', textAlign: 'right' },
  fundDesc: { color: Colors.MUTED, fontSize: 11, marginTop: 2, lineHeight: 16, writingDirection: 'rtl', textAlign: 'right' },

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

  newsCard: { width: 220, backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: '#E8DEC8' },
  newsImg: { width: '100%', height: 110 },
  newsTitle: { fontSize: 12, fontWeight: '800', color: Colors.TEXT, lineHeight: 16, writingDirection: 'rtl', textAlign: 'right' },
  newsDate: { fontSize: 10, color: Colors.MUTED, marginTop: 4 },
  modalBackdrop: { position: 'absolute', top: 0, right: 0, left: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 14, zIndex: 100 },
  modalCard: { backgroundColor: '#fff', borderRadius: 14, width: '100%', maxHeight: '85%', overflow: 'hidden' },
  modalHead: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 14, backgroundColor: '#0E2A38' },
  modalKicker: { color: '#fff', backgroundColor: Colors.ACCENT, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, fontSize: 11, fontWeight: '800' },
  modalClose: { width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  modalImg: { width: '100%', height: 180, borderRadius: 8, marginBottom: 12 },
  modalTitle: { fontWeight: '900', color: '#1A4A5E', fontSize: 16, marginBottom: 8, writingDirection: 'rtl', textAlign: 'right' },
  modalSummary: { color: Colors.TEXT, fontSize: 13, lineHeight: 22, writingDirection: 'rtl', textAlign: 'right' },
  modalLink: { color: Colors.PRIMARY, fontWeight: '800', fontSize: 14, marginTop: 14, textAlign: 'left' },
  brokersBanner: { height: 110, marginTop: 16, borderRadius: 14, overflow: 'hidden' },
  brokersOverlay: { flex: 1, backgroundColor: 'rgba(184,92,142,0.65)', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 14 },
  brokersKicker: { color: '#fff', fontSize: 10, fontWeight: '700', letterSpacing: 1.5, opacity: 0.85 },
  brokersTitle: { color: '#fff', fontSize: 17, fontWeight: '900', marginTop: 4, writingDirection: 'rtl' },
  brokersSub: { color: 'rgba(255,255,255,0.95)', fontSize: 12, marginTop: 4, writingDirection: 'rtl' },
});
