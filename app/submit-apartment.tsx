import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PhotoCarousel } from '../components/PhotoCarousel';
import { Colors } from '../constants/colors';
import { useI18n } from '../constants/i18n';

const RE_API = 'https://wellcomedubaicom-production.up.railway.app';

// Compact per-language labels (individual apartment sale/rent listing form).
const L: Record<string, any> = {
  he: { sale: 'מכירה', rent: 'השכרה', title: 'כותרת המודעה', titlePh: 'דירת 3 חדרים במרינה', area: 'אזור', areaPh: 'מרינה, דאונטאון, JVC…', price: 'מחיר (AED)', rooms: 'חדרים', desc: 'תיאור', descPh: 'פרטים על הדירה, מצב, קומה, נוף…', phone: 'טלפון', photos: 'תמונות', video: 'סרטון (לא חובה)', pick: 'בחר תמונות', pickVid: 'בחר סרטון', submit: 'פרסם מודעה', sending: 'שולח…', miss: 'נא למלא: כותרת, אזור, מחיר וטלפון.', okT: 'נשלח!', okM: 'המודעה נשלחה ותופיע לאחר אישור.', errT: 'שגיאה', errM: 'השליחה נכשלה, נסה שוב.', hType: 'סוג המודעה', preview: 'כך המודעה תיראה לגולשים' },
  en: { sale: 'For Sale', rent: 'For Rent', title: 'Listing title', titlePh: '3-room apartment in Marina', area: 'Area', areaPh: 'Marina, Downtown, JVC…', price: 'Price (AED)', rooms: 'Rooms', desc: 'Description', descPh: 'Details about the apartment, condition, floor, view…', phone: 'Phone', photos: 'Photos', video: 'Video (optional)', pick: 'Pick photos', pickVid: 'Pick a video', submit: 'Publish listing', sending: 'Sending…', miss: 'Please fill: title, area, price and phone.', okT: 'Sent!', okM: 'Your listing was sent and will appear after approval.', errT: 'Error', errM: 'Submission failed, try again.', hType: 'Listing type', preview: 'How your listing will look' },
  ru: { sale: 'Продажа', rent: 'Аренда', title: 'Заголовок', titlePh: '3-комнатная в Марине', area: 'Район', areaPh: 'Марина, Даунтаун, JVC…', price: 'Цена (AED)', rooms: 'Комнаты', desc: 'Описание', descPh: 'Детали о квартире, состояние, этаж, вид…', phone: 'Телефон', photos: 'Фото', video: 'Видео (не обязательно)', pick: 'Выбрать фото', pickVid: 'Выбрать видео', submit: 'Опубликовать', sending: 'Отправка…', miss: 'Заполните: заголовок, район, цену и телефон.', okT: 'Отправлено!', okM: 'Объявление отправлено и появится после проверки.', errT: 'Ошибка', errM: 'Не удалось отправить, попробуйте снова.', hType: 'Тип объявления', preview: 'Как будет выглядеть объявление' },
  ar: { sale: 'للبيع', rent: 'للإيجار', title: 'عنوان الإعلان', titlePh: 'شقة 3 غرف في المارينا', area: 'المنطقة', areaPh: 'المارينا، وسط المدينة، JVC…', price: 'السعر (درهم)', rooms: 'الغرف', desc: 'الوصف', descPh: 'تفاصيل الشقة، الحالة، الطابق، الإطلالة…', phone: 'الهاتف', photos: 'الصور', video: 'فيديو (اختياري)', pick: 'اختر الصور', pickVid: 'اختر فيديو', submit: 'نشر الإعلان', sending: 'جارٍ الإرسال…', miss: 'يرجى تعبئة: العنوان، المنطقة، السعر والهاتف.', okT: 'تم الإرسال!', okM: 'تم إرسال إعلانك وسيظهر بعد الموافقة.', errT: 'خطأ', errM: 'فشل الإرسال، حاول مجدداً.', hType: 'نوع الإعلان', preview: 'كيف سيظهر إعلانك' },
  hi: { sale: 'बिक्री', rent: 'किराया', title: 'लिस्टिंग शीर्षक', titlePh: 'मरीना में 3-कमरे का अपार्टमेंट', area: 'क्षेत्र', areaPh: 'मरीना, डाउनटाउन, JVC…', price: 'मूल्य (AED)', rooms: 'कमरे', desc: 'विवरण', descPh: 'अपार्टमेंट, स्थिति, मंज़िल, दृश्य के बारे में…', phone: 'फ़ोन', photos: 'तस्वीरें', video: 'वीडियो (वैकल्पिक)', pick: 'तस्वीरें चुनें', pickVid: 'वीडियो चुनें', submit: 'लिस्टिंग प्रकाशित करें', sending: 'भेज रहे हैं…', miss: 'भरें: शीर्षक, क्षेत्र, मूल्य और फ़ोन।', okT: 'भेज दिया!', okM: 'आपकी लिस्टिंग भेज दी गई और स्वीकृति के बाद दिखेगी।', errT: 'त्रुटि', errM: 'सबमिशन विफल, पुनः प्रयास करें।', hType: 'लिस्टिंग प्रकार', preview: 'आपकी लिस्टिंग कैसी दिखेगी' },
};

export default function SubmitApartment() {
  const { lang, isRTL } = useI18n();
  const tr = L[lang] || L.en;
  const s = makeStyles(isRTL);
  const params = useLocalSearchParams<{ type?: string }>();
  const [type, setType] = useState<'sale' | 'rent'>(params.type === 'rent' ? 'rent' : 'sale');
  const [title, setTitle] = useState('');
  const [area, setArea] = useState('');
  const [price, setPrice] = useState('');
  const [rooms, setRooms] = useState('');
  const [desc, setDesc] = useState('');
  const [phone, setPhone] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [video, setVideo] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const pickPhotos = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.7, selectionLimit: 8 });
    if (!res.canceled) setPhotos(res.assets.map(a => a.uri));
  };
  const pickVideo = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Videos, quality: 0.7 });
    if (!res.canceled && res.assets[0]) setVideo(res.assets[0].uri);
  };

  const appendFile = async (fd: FormData, field: string, uri: string, name: string, mime: string) => {
    if (Platform.OS === 'web') { const blob = await (await fetch(uri)).blob(); fd.append(field, blob, name); }
    else { fd.append(field, { uri, name, type: mime } as any); }
  };

  const submit = async () => {
    if (!title || !area || !price || !phone) { Alert.alert(tr.errT, tr.miss); return; }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('type', type);
      fd.append('title', title);
      fd.append('area', area);
      fd.append('price', price);
      fd.append('phone', phone);
      fd.append('desc', (rooms ? (tr.rooms + ': ' + rooms + '\n') : '') + desc);
      fd.append('size', 'small');
      for (let i = 0; i < photos.length; i++) await appendFile(fd, 'photos', photos[i], `photo_${i}.jpg`, 'image/jpeg');
      if (video) await appendFile(fd, 'video', video, 'video.mp4', 'video/mp4');
      const r = await fetch(`${RE_API}/api/listings`, { method: 'POST', body: fd as any });
      if (!r.ok) throw new Error('failed');
      // remember this listing on THIS device so the owner can delete it later
      try {
        const j = await r.json();
        if (j?.listing?.id && j?.listing?.delToken) {
          const raw = await AsyncStorage.getItem('myListings');
          const arr = raw ? JSON.parse(raw) : [];
          arr.push({ id: j.listing.id, token: j.listing.delToken });
          await AsyncStorage.setItem('myListings', JSON.stringify(arr));
        }
      } catch {}
      Alert.alert(tr.okT, tr.okM, [{ text: 'OK', onPress: () => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/'); } }]);
    } catch { Alert.alert(tr.errT, tr.errM); }
    finally { setSubmitting(false); }
  };

  return (
    <View style={s.container}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#000' }} />
      <View style={s.brandBar}>
        <Text style={s.brandTxt}><Text style={{ color: '#1A6B8A' }}>WellCome </Text><Text style={{ color: '#E76F51' }}>Dubai</Text></Text>
        <TouchableOpacity onPress={() => { if (router.canGoBack()) router.back(); else router.replace('/(tabs)/'); }} style={s.brandClose}>
          <Text style={{ color: '#2C5F6E', fontSize: 18, fontWeight: '700' }}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 44 }} keyboardShouldPersistTaps="handled">
        {/* Live preview — exactly how the listing card looks to visitors, updates as you type */}
        <Text style={s.pvLabel}>{tr.preview}</Text>
        <View style={s.pvCard}>
          {photos.length ? <PhotoCarousel photos={photos} height={170} /> : <View style={[s.pvImg, s.pvImgEmpty]}><Text style={s.pvImgEmptyTxt}>{tr.photos}</Text></View>}
          <View style={[s.pvBadge, isRTL ? { right: 10 } : { left: 10 }]}><Text style={s.pvBadgeTxt}>{tr[type]}</Text></View>
          <View style={s.pvBody}>
            <Text style={s.pvTitle} numberOfLines={1}>{title || tr.titlePh}</Text>
            <Text style={s.pvArea}>📍 {area || tr.areaPh}</Text>
            <Text style={s.pvPrice}>AED {price || '—'}</Text>
            {(rooms || desc) ? <Text style={s.pvDesc} numberOfLines={2}>{(rooms ? tr.rooms + ': ' + rooms + (desc ? ' · ' : '') : '') + desc}</Text> : null}
          </View>
        </View>

        <Text style={s.lbl}>{tr.hType}</Text>
        <View style={s.typeRow}>
          {(['sale', 'rent'] as const).map(ty => (
            <TouchableOpacity key={ty} style={[s.typeChip, type === ty && { backgroundColor: Colors.PRIMARY, borderColor: Colors.PRIMARY }]} onPress={() => setType(ty)}>
              <Text style={[s.typeChipTxt, type === ty && { color: '#fff' }]}>{tr[ty]}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Field label={tr.title} value={title} onChange={setTitle} ph={tr.titlePh} isRTL={isRTL} />
        <Field label={tr.area} value={area} onChange={setArea} ph={tr.areaPh} isRTL={isRTL} />
        <Field label={tr.price} value={price} onChange={setPrice} ph="800000" keyboard="numeric" isRTL={isRTL} />
        <Field label={tr.rooms} value={rooms} onChange={setRooms} ph="3" keyboard="numeric" isRTL={isRTL} />
        <Text style={s.lbl}>{tr.desc}</Text>
        <TextInput multiline value={desc} onChangeText={setDesc} placeholder={tr.descPh} placeholderTextColor="#9AA5AB" style={[s.input, { height: 100, textAlignVertical: 'top', textAlign: isRTL ? 'right' : 'left' }]} />
        <Field label={tr.phone} value={phone} onChange={setPhone} ph="+971..." keyboard="phone-pad" isRTL={isRTL} />

        <Text style={s.lbl}>{tr.photos}</Text>
        <TouchableOpacity onPress={pickPhotos} style={s.uploadBtn}><Text style={s.uploadTxt}>{tr.pick}</Text></TouchableOpacity>
        {photos.length > 0 && (
          <ScrollView horizontal style={{ marginTop: 8 }} contentContainerStyle={{ gap: 6 }}>
            {photos.map((uri, i) => <Image key={i} source={{ uri }} style={{ width: 70, height: 70, borderRadius: 6 }} />)}
          </ScrollView>
        )}

        <Text style={s.lbl}>{tr.video}</Text>
        <TouchableOpacity onPress={pickVideo} style={[s.uploadBtn, { backgroundColor: '#2A9D8F' }]}><Text style={s.uploadTxt}>{video ? '✓ ' + tr.pickVid : tr.pickVid}</Text></TouchableOpacity>

        <TouchableOpacity onPress={submit} disabled={submitting} style={[s.submitBtn, submitting && { opacity: 0.6 }]}>
          <Text style={s.submitTxt}>{submitting ? tr.sending : tr.submit}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Field({ label, value, onChange, ph, keyboard, isRTL }: any) {
  const s = makeStyles(isRTL);
  return (
    <View style={{ marginBottom: 4 }}>
      <Text style={s.lbl}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} placeholder={ph} placeholderTextColor="#9AA5AB" keyboardType={keyboard || 'default'} style={[s.input, { textAlign: isRTL ? 'right' : 'left' }]} />
    </View>
  );
}

const makeStyles = (isRTL: boolean) => StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F5F7' },
  brandBar: { flexDirection: isRTL ? 'row-reverse' : 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#EAE0CE' },
  brandTxt: { fontSize: 18, fontWeight: '800' },
  brandClose: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#F2F5F6', alignItems: 'center', justifyContent: 'center' },
  lbl: { fontSize: 13, fontWeight: '700', color: '#2C5F6E', marginTop: 12, marginBottom: 5, textAlign: isRTL ? 'right' : 'left' },
  input: { backgroundColor: '#fff', borderRadius: 0, paddingHorizontal: 14, paddingVertical: 13, fontSize: 15.5, color: Colors.TEXT, borderWidth: 1, borderColor: '#E6ECEE' },
  typeRow: { flexDirection: isRTL ? 'row-reverse' : 'row', gap: 8, marginBottom: 4 },
  typeChip: { flex: 1, paddingVertical: 12, borderRadius: 0, borderWidth: 1.5, borderColor: '#D8E0E3', alignItems: 'center', backgroundColor: '#fff' },
  typeChipTxt: { fontSize: 14, fontWeight: '800', color: '#2C5F6E' },
  uploadBtn: { backgroundColor: Colors.PRIMARY, paddingVertical: 13, borderRadius: 0, alignItems: 'center' },
  uploadTxt: { color: '#fff', fontWeight: '800', fontSize: 14 },
  submitBtn: { backgroundColor: '#E76F51', paddingVertical: 16, borderRadius: 0, alignItems: 'center', marginTop: 24, shadowColor: '#E76F51', shadowOpacity: 0.3, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  submitTxt: { color: '#fff', fontWeight: '900', fontSize: 16 },
  pvLabel: { fontSize: 11.5, fontWeight: '800', color: Colors.MUTED, marginBottom: 8, letterSpacing: 0.5, textAlign: isRTL ? 'right' : 'left' },
  pvCard: { backgroundColor: '#fff', borderRadius: 0, overflow: 'hidden', marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 9, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
  pvImg: { width: '100%', height: 170 },
  pvImgEmpty: { backgroundColor: '#E7ECEE', alignItems: 'center', justifyContent: 'center' },
  pvImgEmptyTxt: { color: '#9AA5AB', fontSize: 13, fontWeight: '700' },
  pvBadge: { position: 'absolute', top: 10, backgroundColor: '#0F2547', paddingHorizontal: 10, paddingVertical: 4 },
  pvBadgeTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
  pvBody: { padding: 14 },
  pvTitle: { fontWeight: '800', color: Colors.TEXT, fontSize: 18, letterSpacing: 0.2, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  pvArea: { color: Colors.MUTED, fontSize: 13, marginTop: 5, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  pvPrice: { color: Colors.ACCENT, fontWeight: '900', fontSize: 21, marginTop: 8, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
  pvDesc: { color: '#5A6B72', fontSize: 12.5, marginTop: 8, lineHeight: 18, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
});
