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
  const [fontsLoaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

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
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('🛂 Token détecté :', token);

        if (!token) {
          // Redirige vers signup uniquement si l’utilisateur n’est pas connecté
          router.replace('/auth/signup');
        }
      } catch (e) {
        console.error('❌ Erreur auth check :', e);
      } finally {
        setCheckingAuth(false);
        await SplashScreen.hideAsync();
      }
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
