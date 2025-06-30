import { Tabs } from 'expo-router';
import { BookOpen, Eye, Settings, Scroll } from 'lucide-react-native';
import { AuthGuard } from '@/components/AuthGuard';

export default function TabLayout() {
  return (
    <AuthGuard>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#D4AF37',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            backgroundColor: '#1A1A1A',
            borderTopColor: '#2C2C2E',
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Lista de Magias',
            tabBarIcon: ({ size, color }) => (
              <BookOpen size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="grimoire"
          options={{
            title: 'Grimório',
            tabBarIcon: ({ size, color }) => (
              <Scroll size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="dm-view"
          options={{
            title: 'Visão DM',
            tabBarIcon: ({ size, color }) => (
              <Eye size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Configurações',
            tabBarIcon: ({ size, color }) => (
              <Settings size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </AuthGuard>
  );
}