import React from 'react';
import {
  View,
  Pressable,
  StyleSheet,
  Platform,
} from 'react-native';
import { usePathname, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/theme/ThemeContext';

type AppRoutes = '/' | '/explore';

type TabItem = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  path: AppRoutes;
};

export default function BottomTabsContainer() {
  const pathname = usePathname();
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  const tabs: TabItem[] = [
    { name: 'index', icon: 'home-outline', path: '/' },
    { name: 'explore', icon: 'stats-chart-outline', path: '/explore' }, // 🧠 analytics icon
  ];

  return (
    <View style={[styles.container, isDark && styles.dark]}>
      {tabs.map((tab) => {
        const isActive = pathname === tab.path;

        return (
          <Pressable
            key={tab.name}
            onPress={() => router.push(tab.path)}
            style={styles.tab}
          >
            <Ionicons
              name={tab.icon}
              size={22}
              color={isActive ? '#3b82f6' : '#888'}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8, // 👈 plus fin
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderColor: '#ddd',
    ...Platform.select({
      ios: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        borderRadius: 16,
        margin: 12,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { height: 2, width: 0 },
      },
      android: {
        elevation: 8,
      },
    }),
  },
  dark: {
    backgroundColor: '#111',
    borderColor: '#333',
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
  },
});
