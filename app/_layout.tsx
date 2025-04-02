// app/_layout.tsx

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
    let isMounted = true;
  
    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('🧾 Token détecté :', token);
  
        // On redirige uniquement s'il n'y a pas de token
        if (!token && isMounted) {
          router.replace('/auth/login'); // ou signup
        }
        if (token === null) {
          console.log('🔍 Token est exactement null');
        } else if (token === '') {
          console.log('🔍 Token est une chaîne vide');
        } else {
          console.log('✅ Token semble valide :', token);
        }
        
      } catch (e) {
        console.error('❌ Erreur auth check :', e);
      } finally {
        if (isMounted) {
          setCheckingAuth(false);
          SplashScreen.hideAsync();
        }
      }
    };
  
    checkAuth();
  
    return () => {
      isMounted = false;
    };
  }, []);
  
  return (
    <>
      <Slot />
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
