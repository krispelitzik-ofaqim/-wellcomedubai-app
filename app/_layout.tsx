import { Stack } from 'expo-router';
import { I18nManager, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { I18nProvider } from '../constants/i18n';
import UpdatePrompt from '../components/UpdatePrompt';
import ViewTracker from '../components/ViewTracker';

// Force an LTR base and do RTL manually per-element (via isRTL from i18n) — matches web,
// which already aligns correctly. Native forceRTL double-flipped manual layouts → reversed UI.
if (Platform.OS !== 'web') {
  I18nManager.allowRTL(false);
  if (I18nManager.isRTL) I18nManager.forceRTL(false);
}

export default function RootLayout() {
  return (
    <I18nProvider>
      <SafeAreaProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="learn/[id]" options={{ presentation: 'transparentModal', animation: 'fade', animationDuration: 200 }} />
        </Stack>
        <UpdatePrompt />
        <ViewTracker />
      </SafeAreaProvider>
    </I18nProvider>
  );
}
