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
import { red } from 'react-native-reanimated/lib/typescript/Colors';


export default function HomeScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useAppTheme();
  console.log("Je suis dans l'écran X")
  const isDark = theme === 'dark';
  const backgroundColor = isDark ? '#000' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const todayKey = `mood-${dayjs().format('YYYY-MM-DD')}`;
  const circlePosition = useRef(new Animated.Value(isDark ? 1 : 0)).current;
  const [isLoggedIn, setIsLoggedIn] = useState(false);  
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAppReady, setIsAppReady] = useState(false);
  const emojis = [
    '🤩', // euphoriquement bien
    '🙂', // content
    '😐', // neutre
    '😕', // un peu mal
    '😣', // stressé
    '😢', // très triste
    '😡', // en colère
    '🥱', // fatigué
  ];
  
  const [moodSet, setMoodSet] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);  //emoji de l'humeur du jour pour l'utilisateur porteur du JWT
  
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
    const initApp = async () => {
      try {
        const token = await AsyncStorage.getItem('token');
  
        if (token) {
          try {
            const res = await axios.get('https://flownest.onrender.com/api/me', {
              headers: { Authorization: `Bearer ${token}` },
            });
            setUserEmail(res.data.email);
            setIsLoggedIn(true);
          } catch (err) {
            console.error('❌ Erreur récupération utilisateur :', err);
            setIsLoggedIn(false);
          }
  
          // Check mood
          const date = dayjs().format("YYYY-MM-DD");
          const res = await fetch("https://flownest.onrender.com/api/moods", {
            method: 'GET',
            headers: { Authorization: `Bearer ${token}` },
          });
  
          if (res.ok) {
            const data: { date: string; mood: string }[] = await res.json();
            const filtered = data.filter(item => item.date === date);
  
            if (filtered.length > 0) {
              setMoodSet(true);
              setSelected(filtered[0].mood);
            } else {
              setMoodSet(false);
            }
          } else {
            setMoodSet(false);
          }
        } else {
          setIsLoggedIn(false);
        }
      } catch (e) {
        console.error('Erreur initApp:', e);
      } finally {
        setIsAppReady(true); // ✅ Affiche enfin l’UI
      }
    };
  
    initApp();
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
  
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      ).start();
    }, []);
    

    if (!isAppReady) {
      return (
        <SafeAreaView style={[styles.container, { backgroundColor, justifyContent: 'center', alignItems: 'center' }]}>
          <Animated.Text style={{ fontSize: 32, transform: [{ scale: scaleAnim }] }}>
            🐢 
          </Animated.Text>
          <Animated.Text style={{color: textColor, fontSize: 32, transform: [{ scale: scaleAnim }] }}>
            Chargement de ton profil de jeune tortue
          </Animated.Text>
        </SafeAreaView>
      );
    }
    
    
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

  {!moodSet && isLoggedIn &&(
    <View style={styles.moodContainer}>
      <Text style={[styles.subtitle, { color: textColor }]}>Quelle est ton humeur aujourd’hui ?</Text>
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

  {!isLoggedIn &&(
      <View style={styles.moodContainer}>
        <Text style={[styles.herotag]}>Connecte-toi pour transformer tes journées en progrès.</Text>
      </View>
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
    padding: 20,
    width: '105%',
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)', // couche translucide
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2, // pour Android
    alignItems: 'center',
    marginBottom: 24,
    alignSelf: 'center',
  },
  
  emojiRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 8,
  },
  emoji: {
    fontSize: 25,
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
  herotag:{
    color: '#10b981',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  }
});
