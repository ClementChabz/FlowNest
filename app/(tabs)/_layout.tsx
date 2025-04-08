import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useAppTheme } from '../../theme/ThemeContext';

export default function TabLayout() {
  const { theme, themeKey } = useAppTheme(); // 👈 important
  const colorScheme = theme ?? 'light';
  console.log("Je suis dans l'écran layoutab")
  return (
    <Tabs
      key={themeKey} // 👈 FORCE le re-render quand le thème change
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? '#000' : '#fff',
          ...Platform.select({
            ios: { position: 'absolute' },
            default: {},
          }),
        },
        
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
        }}
      />
    </Tabs>
    
  );
}
