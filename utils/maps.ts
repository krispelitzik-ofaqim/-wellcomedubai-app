import { ActionSheetIOS, Alert, Linking, Platform } from 'react-native';

type Mode = 'navigate' | 'show';

function buildAppleMapsUrl(lat: number, lng: number, label: string, mode: Mode): string {
  const name = encodeURIComponent(label || '');
  if (mode === 'navigate') {
    return `http://maps.apple.com/?daddr=${lat},${lng}&dirflg=d`;
  }
  return `http://maps.apple.com/?ll=${lat},${lng}&q=${name || `${lat},${lng}`}`;
}

function buildGoogleMapsUrl(lat: number, lng: number, label: string, mode: Mode): string {
  const name = encodeURIComponent(label || '');
  if (mode === 'navigate') {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}${name ? `&destination_place_id=${name}` : ''}&travelmode=driving&hl=he`;
  }
  return `https://www.google.com/maps?q=${lat},${lng}${name ? `(${name})` : ''}&hl=he`;
}

export function openMapsChoice(lat: number, lng: number, label = '', mode: Mode = 'show') {
  const apple = buildAppleMapsUrl(lat, lng, label, mode);
  const google = buildGoogleMapsUrl(lat, lng, label, mode);

  if (Platform.OS === 'ios') {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        title: mode === 'navigate' ? 'נווט עם:' : 'פתח מפה ב:',
        options: ['Apple Maps', 'Google Maps', 'ביטול'],
        cancelButtonIndex: 2,
      },
      (idx) => {
        if (idx === 0) Linking.openURL(apple);
        else if (idx === 1) Linking.openURL(google);
      },
    );
    return;
  }

  if (Platform.OS === 'android') {
    Alert.alert(mode === 'navigate' ? 'נווט עם:' : 'פתח מפה ב:', undefined, [
      { text: 'Google Maps', onPress: () => Linking.openURL(google) },
      { text: 'Apple Maps', onPress: () => Linking.openURL(apple) },
      { text: 'ביטול', style: 'cancel' },
    ]);
    return;
  }

  Linking.openURL(google);
}
