import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '../constants/colors';

const RE_API = 'https://wellcomedubaicom-production.up.railway.app';

export default function SubmitProject() {
  const [title, setTitle] = useState('');
  const [developer, setDeveloper] = useState('');
  const [type, setType] = useState('residential');
  const [area, setArea] = useState('');
  const [price, setPrice] = useState('');
  const [yieldPct, setYieldPct] = useState('');
  const [units, setUnits] = useState('');
  const [delivery, setDelivery] = useState('');
  const [desc, setDesc] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [highlight, setHighlight] = useState<'emphasized' | 'negative'>('emphasized');
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const pickPhotos = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true, quality: 0.7, selectionLimit: 8 });
    if (!res.canceled) setPhotos(res.assets.map(a => a.uri));
  };

  const submit = async () => {
    if (!title || !developer || !area || !price || !phone || !email) {
      Alert.alert('שדות חסרים', 'מלא את כל שדות החובה');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('type', 'project');
      fd.append('size', 'large');
      fd.append('title', title);
      fd.append('developer', developer);
      fd.append('area', area);
      fd.append('price', price);
      fd.append('phone', phone);
      fd.append('email', email);
      fd.append('projectType', type);
      fd.append('units', units);
      fd.append('delivery', delivery);
      fd.append('yieldPct', yieldPct);
      fd.append('desc', desc);
      fd.append('highlight', highlight);
      photos.forEach((uri, i) => {
        fd.append('photos', { uri, name: `photo_${i}.jpg`, type: 'image/jpeg' } as any);
      });
      const r = await fetch(`${RE_API}/api/listings`, { method: 'POST', body: fd as any });
      if (!r.ok) throw new Error('upload failed');
      Alert.alert('✓ נשלח לאישור', 'הפרויקט יופיע באתר לאחר אישור מנהל', [{ text: 'אישור', onPress: () => router.back() }]);
    } catch (e) {
      Alert.alert('שגיאה', 'בעיה בשליחה — נסה שוב');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.back}>
          <Text style={{ fontSize: 22, color: Colors.GOLD }}>←</Text>
        </TouchableOpacity>
        <Text style={s.title}>🏗️ העלה פרויקט נדל"ן</Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 14, paddingBottom: 40 }}>
        <Section title="פרטי הפרויקט">
          <Field label="* שם הפרויקט" value={title} onChange={setTitle} placeholder="Marina Heights" />
          <Field label="* יזם / חברה" value={developer} onChange={setDeveloper} placeholder="Emaar" />
          <View style={s.typeRow}>
            {[
              { id: 'residential', label: 'מגורים' },
              { id: 'commercial', label: 'משרדים' },
              { id: 'mixed', label: 'מעורב' },
              { id: 'hotel', label: 'מלונאות' },
            ].map(t => (
              <TouchableOpacity key={t.id} style={[s.typeChip, type === t.id && { backgroundColor: Colors.PRIMARY }]} onPress={() => setType(t.id)}>
                <Text style={[s.typeChipTxt, type === t.id && { color: '#fff' }]}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Field label="* אזור" value={area} onChange={setArea} placeholder="Marina, Downtown, JVC..." />
        </Section>

        <Section title="מסחר ופיננסים">
          <Field label="* מחיר התחלה (AED)" value={price} onChange={setPrice} placeholder="800000" keyboard="numeric" />
          <Field label="תשואה צפויה %" value={yieldPct} onChange={setYieldPct} placeholder="9" keyboard="numeric" />
          <Field label="מס׳ יחידות" value={units} onChange={setUnits} placeholder="240" keyboard="numeric" />
          <Field label="מסירה" value={delivery} onChange={setDelivery} placeholder="Q4 2027" />
        </Section>

        <Section title="תיאור">
          <TextInput multiline numberOfLines={4} value={desc} onChangeText={setDesc} placeholder="תיאור מלא של הפרויקט..." style={[s.input, { height: 100, textAlignVertical: 'top' }]} />
        </Section>

        <Section title="תמונות">
          <TouchableOpacity onPress={pickPhotos} style={s.uploadBtn}>
            <Text style={s.uploadTxt}>📷 בחר תמונות (עד 8)</Text>
          </TouchableOpacity>
          {photos.length > 0 && (
            <ScrollView horizontal style={{ marginTop: 8 }} contentContainerStyle={{ gap: 6 }}>
              {photos.map((uri, i) => (
                <Image key={i} source={{ uri }} style={{ width: 70, height: 70, borderRadius: 6 }} />
              ))}
            </ScrollView>
          )}
        </Section>

        <Section title="סגנון הצגה">
          <View style={s.typeRow}>
            <TouchableOpacity style={[s.hlChip, highlight === 'emphasized' && { backgroundColor: Colors.WARM, borderColor: Colors.WARM }]} onPress={() => setHighlight('emphasized')}>
              <Text style={[s.hlChipTxt, highlight === 'emphasized' && { color: '#fff' }]}>⭐ מודגש</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.hlChip, highlight === 'negative' && { backgroundColor: '#0A1F3D', borderColor: '#1E3A8A' }]} onPress={() => setHighlight('negative')}>
              <Text style={[s.hlChipTxt, highlight === 'negative' && { color: '#fff' }]}>🎴 נגטיב</Text>
            </TouchableOpacity>
          </View>
        </Section>

        <Section title="יצירת קשר">
          <Field label="* WhatsApp / טלפון" value={phone} onChange={setPhone} placeholder="+971..." keyboard="phone-pad" />
          <Field label="* אימייל" value={email} onChange={setEmail} placeholder="email@example.com" keyboard="email-address" />
        </Section>

        <TouchableOpacity onPress={submit} disabled={submitting} style={[s.submitBtn, submitting && { opacity: 0.5 }]}>
          <Text style={s.submitTxt}>{submitting ? '⏳ שולח...' : '📤 שלח לאישור'}</Text>
        </TouchableOpacity>
        <Text style={s.disclaimer}>* שדות חובה. הפרויקט יופיע באתר לאחר אישור מנהל.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: any) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Field({ label, value, onChange, placeholder, keyboard }: any) {
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#9CA3AF" keyboardType={keyboard || 'default'} style={s.input} />
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.BG },
  header: { flexDirection: 'row-reverse', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#0E2A38', gap: 10 },
  back: { padding: 4 },
  title: { color: Colors.GOLD, fontSize: 17, fontWeight: '900', writingDirection: 'rtl' },
  section: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#E8DEC8' },
  sectionTitle: { fontWeight: '800', color: '#1A4A5E', fontSize: 14, marginBottom: 10, paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#F0E6D2', writingDirection: 'rtl', textAlign: 'right' },
  label: { color: Colors.MUTED, fontSize: 12, fontWeight: '700', marginBottom: 4, writingDirection: 'rtl', textAlign: 'right' },
  input: { backgroundColor: '#FDFAF2', borderWidth: 1, borderColor: '#E8DEC8', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: Colors.TEXT, writingDirection: 'rtl', textAlign: 'right' },
  typeRow: { flexDirection: 'row-reverse', flexWrap: 'wrap', gap: 6, marginTop: 4 },
  typeChip: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: '#F5EDD8', borderWidth: 1, borderColor: '#E8DEC8' },
  typeChipTxt: { color: Colors.TEXT, fontSize: 12, fontWeight: '700' },
  uploadBtn: { backgroundColor: Colors.PRIMARY, paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
  uploadTxt: { color: '#fff', fontWeight: '800', fontSize: 13 },
  hlChip: { flex: 1, paddingVertical: 14, borderRadius: 10, alignItems: 'center', borderWidth: 2 },
  hlChipTxt: { fontWeight: '700', fontSize: 14, color: Colors.TEXT },
  submitBtn: { backgroundColor: '#0E2A38', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  submitTxt: { color: Colors.GOLD, fontWeight: '900', fontSize: 16 },
  disclaimer: { color: Colors.MUTED, fontSize: 11, textAlign: 'center', marginTop: 10 },
});
