import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider, useAppTheme } from '../theme/ThemeContext';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from '../context/authContext';
import { Slot, usePathname, router } from 'expo-router';
import BottomTabsContainer from '@/components/BottomTabsContainer'; // 👈 ton composant TabBar

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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <ThemeProvider>
          <ThemedLayout />
        </ThemeProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

function ThemedLayout() {
  const { theme } = useAppTheme();
  const { setIsLoggedIn } = useAuth();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const pathname = usePathname(); // 👈 permet de savoir sur quelle page on est

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        console.log('🧾 Token détecté :', token);

        if (token && isMounted) {
          setIsLoggedIn(true);
        } else if (isMounted) {
          setIsLoggedIn(false);
          setTimeout(() => {
            router.replace('/auth/login');
          }, 0);
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

  if (checkingAuth) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const shouldHideTabs = pathname.startsWith('/auth');

  return (
    <>
      <Slot />
      {!shouldHideTabs && <BottomTabsContainer />} 
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}