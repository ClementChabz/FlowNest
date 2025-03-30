import { ThemeProvider, useAppTheme } from '../theme/ThemeContext';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';

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

// Séparer le layout dans une sous-fonction pour utiliser le hook après ThemeProvider
function ThemedLayout() {
  const { theme } = useAppTheme();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <>
      <Slot />
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}
