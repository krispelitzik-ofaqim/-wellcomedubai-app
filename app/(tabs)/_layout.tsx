import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useI18n } from '../../constants/i18n';

export default function TabsLayout() {
  const { t } = useI18n();
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.ACCENT,
        tabBarInactiveTintColor: Colors.MUTED,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#E5E7EB', height: 60 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tabs.Screen name="contact"   options={{ title: t('tab.whatsapp'), tabBarIcon: () => <FontAwesome5 name="whatsapp" size={22} color="#25D366" /> }} />
      <Tabs.Screen name="info"      options={{ title: t('tab.info'),     tabBarIcon: ({ color }) => <FontAwesome5 name="info-circle"   size={22} color={color} /> }} />
      <Tabs.Screen name="map"       options={{ title: t('tab.map'),      tabBarIcon: ({ color }) => <FontAwesome5 name="map-marked-alt" size={22} color={color} /> }} />
      <Tabs.Screen name="search"    options={{ title: t('tab.search'),   tabBarIcon: ({ color }) => <FontAwesome5 name="search"        size={20} color={color} /> }} />
      <Tabs.Screen name="index"     options={{ title: t('tab.home'),     tabBarIcon: ({ color }) => <FontAwesome5 name="home"          size={22} color={color} /> }} />
      <Tabs.Screen name="favorites" options={{ href: null }} />
    </Tabs>
  );
}
