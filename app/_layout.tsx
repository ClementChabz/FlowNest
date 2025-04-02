import { ThemeProvider, useAppTheme } from '../theme/ThemeContext';
import { Slot, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) return null;

  return (
    <ThemeProvider>
      <ThemedLayout />
    </ThemeProvider>
  );
}

function ThemedLayout() {
  const { theme } = useAppTheme();
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        router.replace('./auth/login.tsx');
      }
      setCheckingAuth(false);
      SplashScreen.hideAsync();
    };
    checkAuth();
  }, []);

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <>
      <Slot />
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
