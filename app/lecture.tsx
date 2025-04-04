import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LectureScreen() {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  const backgroundColor = isDark ? '#000' : '#fff';
  const textColor = isDark ? '#fff' : '#000';

  const [sessions, setSessions] = useState<any[]>([]);

  const fetchSessions = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('https://flownest.onrender.com/api/reading-sessions', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setSessions(data.slice(0, 5)); // ⏪ les 5 plus récentes
    } catch (err) {
      console.error('❌ Erreur récupération des sessions :', err);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleStartSession = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) return;

    try {
      await fetch('https://flownest.onrender.com/api/reading-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ startedAt: new Date().toISOString(), duration: 0 }),
      });

      fetchSessions(); // 🔄 recharge après ajout
    } catch (err) {
      console.error('❌ Erreur démarrage session :', err);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>
        📚 Lecture 📚
      </Text>

      <Pressable onPress={handleStartSession} style={styles.button}>
        <Text style={styles.buttonText}>📖 Commencer une session</Text>
      </Pressable>

      <Text style={[styles.historyTitle, { color: textColor }]}>📜 Dernières sessions :</Text>

      <FlatList
        data={sessions}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <Text style={{ color: textColor }}>
            • {new Date(item.startedAt).toLocaleString()} – {item.duration} min
          </Text>
        )}
      />
    </View>
     </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 20,
  },
  text: {
    fontSize: 18,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginTop: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  historyTitle: {
    marginTop: 32,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
