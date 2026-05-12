import { Tabs } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.ACCENT,
        tabBarInactiveTintColor: Colors.MUTED,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#E5E7EB', height: 60 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
      }}
    >
      <Tabs.Screen name="contact"   options={{ title: 'וואסאפ', tabBarIcon: () => <FontAwesome5 name="whatsapp" size={22} color="#25D366" /> }} />
      <Tabs.Screen name="info"      options={{ title: 'מידע',   tabBarIcon: ({ color }) => <FontAwesome5 name="info-circle"   size={22} color={color} /> }} />
      <Tabs.Screen name="map"       options={{ title: 'מפה',    tabBarIcon: ({ color }) => <FontAwesome5 name="map-marked-alt" size={22} color={color} /> }} />
      <Tabs.Screen name="index"     options={{ title: 'בית',    tabBarIcon: ({ color }) => <FontAwesome5 name="home"          size={22} color={color} /> }} />
      <Tabs.Screen name="favorites" options={{ href: null }} />
    </Tabs>
  );
}
