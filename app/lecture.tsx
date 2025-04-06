import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LectureScreen() {
  const { theme } = useAppTheme();
  const isDark = theme === 'dark';

  const backgroundColor = isDark ? '#000' : '#fff';
  const textColor = isDark ? '#fff' : '#000';

  const [sessions, setSessions] = useState<any[]>([]);

  const [modalVisible, setModalVisible] = useState(false);
const [durationInput, setDurationInput] = useState('');
const [bookInput, setBookInput] = useState('');
const [authorInput, setAuthorInput] = useState('');


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
  
      const contentType = res.headers.get('content-type');
  
      if (!res.ok || !contentType?.includes('application/json')) {
        const errorText = await res.text();
        console.error('❌ Erreur API / Réponse non JSON :', errorText);
        return;
      }
  
      const data = await res.json();
      setSessions(data.slice(0, 5));
    } catch (err) {
      console.error('❌ Erreur récupération des sessions :', err);
    }
  };
  

  useEffect(() => {
    fetchSessions();
  }, []);
  const handleStartSession = async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      console.warn("⚠️ Aucun token trouvé, annulation de la requête.");
      return;
    }
  
    const duration = parseInt(durationInput);
    if (isNaN(duration) || duration <= 0) {
      Alert.alert("Durée invalide", "Merci d'entrer une durée en minutes.");
      return;
    }
  
    const sessionPayload = {
      startedAt: new Date().toISOString(),
      duration,
      book: bookInput || undefined,
      author: authorInput || undefined,
    };
  
    console.log("📤 Envoi de la session :", sessionPayload);
  
    try {
      const res = await fetch('https://flownest.onrender.com/api/reading-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(sessionPayload),
      });
  
      const responseText = await res.text();
      console.log('📦 Réponse brute de la requête lecture :', responseText);
  
      if (res.ok) {
        console.log("✅ Session de lecture enregistrée avec succès !");
        setModalVisible(false);
        setDurationInput('');
        setBookInput('');
        setAuthorInput('');
        fetchSessions();
      } else {
        console.error("❌ La requête a échoué avec le statut :", res.status);
      }
  
    } catch (err: any) {
      console.error('❌ Erreur réseau en envoyant la session de lecture :', err.message || err);
    }
  };
  
  

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
    <View style={[styles.container, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>
        📚 Lecture 📚
      </Text>

      <Pressable onPress={() => setModalVisible(true)} style={styles.button}>
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
      <Modal visible={modalVisible} animationType="slide" transparent>
  <View style={styles.modalOverlay}>
    <View style={[styles.modalContainer, { backgroundColor }]}>
      <Text style={[styles.text, { color: textColor }]}>Nouvelle session 📖</Text>

      <TextInput
        placeholder="Durée (minutes)"
        keyboardType="numeric"
        value={durationInput}
        onChangeText={setDurationInput}
        style={[styles.input, { color: textColor, borderColor: textColor }]}
        placeholderTextColor={isDark ? "#999" : "#aaa"}
      />

      <TextInput
        placeholder="Titre du livre (optionnel)"
        value={bookInput}
        onChangeText={setBookInput}
        style={[styles.input, { color: textColor, borderColor: textColor }]}
        placeholderTextColor={isDark ? "#999" : "#aaa"}
      />

      <TextInput
        placeholder="Auteur (optionnel)"
        value={authorInput}
        onChangeText={setAuthorInput}
        style={[styles.input, { color: textColor, borderColor: textColor }]}
        placeholderTextColor={isDark ? "#999" : "#aaa"}
      />

      <Pressable onPress={handleStartSession} style={styles.button}>
        <Text style={styles.buttonText}>✅ Démarrer</Text>
      </Pressable>

      <Pressable onPress={() => setModalVisible(false)} style={[styles.button, { backgroundColor: '#aaa' }]}>
        <Text style={styles.buttonText}>❌ Annuler</Text>
      </Pressable>
    </View>
  </View>
</Modal>

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
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginTop: 12,
    width: 250,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(8, 2, 2, 0.5)',
  },
  modalContainer: {
    padding: 20,
    borderRadius: 12,
    width: '85%',
    alignItems: 'center',
  },
  
});
