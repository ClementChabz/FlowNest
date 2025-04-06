import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { SafeAreaView } from 'react-native-safe-area-context';
import axios from 'axios';

export default function HomeScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useAppTheme();

  const isDark = theme === 'dark';
  const backgroundColor = isDark ? '#000' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const todayKey = `mood-${dayjs().format('YYYY-MM-DD')}`;
  const circlePosition = useRef(new Animated.Value(isDark ? 1 : 0)).current;
  const [isLoggedIn, setIsLoggedIn] = useState(false);  
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const emojis = ['😄', '😊', '😐', '😔', '😢'];
  const [moodSet, setMoodSet] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  console.log('NewConsole');


  useEffect(() => {
    const checkToken = async () => {
      const token = await AsyncStorage.getItem('token');
  
      if (token) {
        try {
          const res = await axios.get('https://flownest.onrender.com/api/me', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
  
          setUserEmail(res.data.email);
          setIsLoggedIn(true);
        } catch (err) {
          console.error('❌ Erreur récupération utilisateur :', err);
          setIsLoggedIn(false);
        }
      } else {
        setIsLoggedIn(false);
      }
    };
  
    checkToken();
  }, []);
  
  

  useEffect(() => {
    Animated.timing(circlePosition, {
      toValue: isDark ? 1 : 0,
      duration: 300,
      easing: Easing.out(Easing.circle),
      useNativeDriver: false,
    }).start();
  }, [isDark]);

  const translateX = circlePosition.interpolate({
    inputRange: [0, 1],
    outputRange: [4, 48],
  });


  useEffect(() => {
    const checkMood = async () => {
      const date = dayjs().format("YYYY-MM-DD");
      console.log("Checkmood date", date);
      const token = await AsyncStorage.getItem('token');
  
      try {
        const res = await fetch("https://flownest.onrender.com/api/moods", {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!res.ok) {
          console.error("❌ Erreur de requête:", res.status);
          setMoodSet(false);
          return;
        }
  
        const data = await res.json();
        console.log("✅ Données reçues:", data);
  
        const filtered = data.filter(item => item.date === date);
        console.log("🎯 Filtré:", filtered);
  
        if (filtered.length > 0) {
          const mood = filtered[0].mood;
          setMoodSet(true);
          setSelected(mood);
          console.log("✅ Humeur récupérée avec succès:", mood);
        } else {
          console.log("😕 Aucune humeur trouvée pour cette date.");
          setMoodSet(false);
        }
  
      } catch (err) {
        console.error('❌ Erreur dans checkMood:', err.message || err);
        setMoodSet(false);
      }
    };
  
    checkMood();
  }, []);
  



  const handleSelectMood = async (emoji: string) => {
    const date = dayjs().format('YYYY-MM-DD');
    const token = await AsyncStorage.getItem('token'); // ✅ récupère le token
    try {
      const res = await fetch('https://flownest.onrender.com/api/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // ✅ ajoute ici
        },
        body: JSON.stringify({
          date,
          mood: emoji,
          note: '',
        }),
      });
  
      const responseText = await res.text(); // (optionnel) debug
      console.log('📦 Réponse brute dans handleselectionmood:', responseText);
  
      if (res.ok) {
        await AsyncStorage.setItem(`mood-${date}`, emoji);
        setSelected(emoji);
        setMoodSet(true);
        console.log('✅ Humeur enregistrée avec succès !');
      }

      else{
        console.error("la requete a été envoyée mais pas recue");
      }
  
 
    } catch (err: any) {
      console.error('❌ Erreur réseau en envoyant l\'humeur dans handleSelectMood:', err.message || err);
    }
    };
  

  return (
    
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
  {/* 🌗 Thème */}
  <Pressable
    onPress={toggleTheme}
    style={[styles.switchContainer, { backgroundColor: isDark ? '#333' : '#e4e4e7' }]}
  >
    <Animated.View style={[styles.circle, { transform: [{ translateX }] }]} />
    <Text style={[styles.switchText, { color: textColor }]}>
      {isDark ? '🌚' : '☀️'}
    </Text>
  </Pressable>

  {isLoggedIn && (
    <Text style={[styles.hi_msg, { color: textColor }]}>
      Bonjour {userEmail} 👋
    </Text>
  )}

  {!moodSet && (
    <View style={styles.moodContainer}>
      <Text style={[styles.subtitle, { color: textColor }]}>Ton humeur aujourd’hui ?</Text>
      <View style={styles.emojiRow}>
        {emojis.map((emoji) => (
          <Pressable key={emoji} onPress={() => handleSelectMood(emoji)}>
            <Text style={styles.emoji}>{emoji}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  )}

  {!isLoggedIn && (
    <Text style={[styles.title, { color: textColor }]}>Bienvenue sur Flownest 🌿</Text>
  )}

  <View style={styles.buttonContainer}>
    <Pressable onPress={() => router.push('/lecture')} style={[styles.actionButton, isDark && styles.actionButtonDark]}>
      <Text style={styles.actionButtonText}>📚 Lecture</Text>
    </Pressable>
    <Pressable onPress={() => router.push('/work')} style={[styles.actionButton, isDark && styles.actionButtonDark]}>
      <Text style={styles.actionButtonText}>💼 Travail</Text>
    </Pressable>
    {!isLoggedIn && (
      <>
        <Pressable onPress={() => router.push('/auth/login')} style={styles.authButton}>
          <Text style={styles.authButtonText}>🔐 Se connecter</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/auth/signup')} style={styles.authButton}>
          <Text style={styles.authButtonText}>🆕 Créer un compte</Text>
        </Pressable>
      </>
    )}
  </View>

  {isLoggedIn && (
    <Pressable
      onPress={async () => {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('email');
        setIsLoggedIn(false);
        setUserEmail(null);
        router.replace('/');
      }}
      style={[styles.authButton, { backgroundColor: '#f87171' }]}
    >
      <Text style={[styles.authButtonText, { color: '#fff' }]}>🚪 Se déconnecter</Text>
    </Pressable>
  )}
</SafeAreaView>

  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    padding: 24,
    justifyContent: 'center',
    gap:20,
  },
  switchContainer: {
    position: "absolute",
    top: 60,
    right: 30,
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    height: 36,
    borderRadius: 18,
    padding: 4,
    marginBottom: 24,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fff',
    position: 'absolute',
    top: 4,
  },
  switchText: {
    marginLeft: 48,
    fontSize: 16,
    fontWeight: '600',
  },
  hi_msg:{
    marginTop:30,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 12 
  },

  moodContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  emojiRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  emoji: {
    fontSize: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 32,
    textAlign: 'center',
  },
  buttonContainer: {
    gap: 12,
  },
  actionButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 6,
  },
  actionButtonDark: {
    backgroundColor: '#2563eb',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  authButton: {
    backgroundColor: '#e5e7eb',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  authButtonText: {
    color: '#111',
    fontSize: 16,
    fontWeight: '500',
  },
});
