import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAppTheme } from '../../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import dayjs from 'dayjs';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const { theme, toggleTheme } = useAppTheme();

  const isDark = theme === 'dark';
  const backgroundColor = isDark ? '#000' : '#fff';
  const textColor = isDark ? '#fff' : '#000';
  const [fakeDateOffset, setFakeDateOffset] = useState(0);
  const todayKey = `mood-${dayjs().add(fakeDateOffset, 'day').format('YYYY-MM-DD')}`;

  const circlePosition = useRef(new Animated.Value(isDark ? 1 : 0)).current;

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

  const emojis = ['😄', '😊', '😐', '😔', '😢'];
  const [moodSet, setMoodSet] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const checkMood = async () => {
      const saved = await AsyncStorage.getItem(todayKey);
      if (saved) {
        setSelected(saved);
        setMoodSet(true);
      } else {
        setSelected(null);
        setMoodSet(false);
      }
    };
    checkMood();
  }, [fakeDateOffset, todayKey]);

  const handleSelectMood = async (emoji: string) => {
    const date = dayjs().add(fakeDateOffset, 'day').format('YYYY-MM-DD');

    try {
      const res = await fetch('https://flownest.onrender.com/api/mood', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date,
          mood: emoji,
          note: '',
        }),
      });

      if (!res.ok) throw new Error('Erreur lors de l\'envoi');

      await AsyncStorage.setItem(todayKey, emoji);
      setSelected(emoji);
      setMoodSet(true);
    } catch (err: any) {
      console.error('❌ Erreur en envoyant l\'humeur :', err.message || err);
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

      {/* 🧠 Mood Tracker */}
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

      {/* Simulateur de date */}
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <Text style={{ color: textColor, fontSize: 14, opacity: 0.7 }}>
          Date simulée : {dayjs().add(fakeDateOffset, 'day').format('DD MMM YYYY')}
        </Text>

        <Pressable onPress={() => {
          setFakeDateOffset(prev => prev + 1);
        }}>
          <Text style={{ color: textColor, fontSize: 16, textDecorationLine: 'underline', marginTop: 8 }}>
            ➕ Simuler un jour de plus
          </Text>
        </Pressable>

        {fakeDateOffset !== 0 && (
          <Pressable onPress={() => setFakeDateOffset(0)}>
            <Text style={{ color: textColor, fontSize: 16, textDecorationLine: 'underline', marginTop: 4 }}>
              🔁 Revenir à aujourd’hui
            </Text>
          </Pressable>
        )}
      </View>

      {/* Titre */}
      <Text style={[styles.title, { color: textColor }]}>Bienvenue sur Flownest 🌿</Text>

      {/* Boutons principaux */}
      <View style={styles.buttonContainer}>
        <Pressable onPress={() => router.push('/lecture')} style={[styles.actionButton, isDark && styles.actionButtonDark]}>
          <Text style={styles.actionButtonText}>📚 Lecture</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/work')} style={[styles.actionButton, isDark && styles.actionButtonDark]}>
          <Text style={styles.actionButtonText}>💼 Travail</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/auth/login')} style={styles.authButton}>
          <Text style={styles.authButtonText}>🔐 Se connecter</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/auth/signup')} style={styles.authButton}>
          <Text style={styles.authButtonText}>🆕 Créer un compte</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  switchContainer: {
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
