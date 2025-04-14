import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { useAppTheme } from '../theme/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '../context/authContext'; 



export default function LectureScreen() {
    const { theme } = useAppTheme();
    const isDark = theme === 'dark';
    const { isLoggedIn } = useAuth();

    const backgroundColor = isDark ? '#000' : '#fff';
    const textColor = isDark ? '#fff' : '#000';

    const [sessions, setSessions] = useState<any[]>([]);

    const [modalVisible, setModalVisible] = useState(false);
    const [durationInput, setDurationInput] = useState('');
    const [sportInput, setSportInput] = useState('');
    const [authorInput, setAuthorInput] = useState('');


    const fetchSessions = async () => {
        const token = await AsyncStorage.getItem('token');
        if (!token) return;
        
        try {
            const res = await fetch('https://flownest.onrender.com/api/sport-sessions', {
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
            console.log('✅ Réponse JSON :', data);
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
        if (!token && isLoggedIn) {
        console.warn("⚠️ Vous êtes connecté mais aucun token trouvé, annulation de la requête, veuillez vous déconnecter puis vous reconnecter.");
        Alert.alert("⚠️ Vous êtes connecté mais aucun token trouvé, annulation de la requête, veuillez vous déconnecter puis vous reconnecter.");
        return;
        }
    
        if (!sportInput) {
            Alert.alert("Sport manquant", "Veuillez choisir un sport.");
            return;
        }

        const isPompes = sportInput.toLowerCase() === "pompes";

        const duration = parseInt(durationInput);
        const series = parseInt(serieCount);
        const reps = parseInt(repsPerSerie);

        if (isPompes) {
            if (isNaN(series) || isNaN(reps) || series <= 0 || reps <= 0) {
                Alert.alert("Valeurs invalides", "Merci d'entrer un nombre de séries et de pompes valide.");
                return;
            }
        } else {
            if (isNaN(duration) || duration <= 0) {
            Alert.alert("Durée invalide", "Merci d'entrer une durée en minutes.");
            return;
            }
        }
    
        const sessionPayload = {
            startedAt: new Date().toISOString(),
            sport: sportInput,
            intensity,
            type: isPompes ? "pompes" : "duration",
            ...(isPompes
                ? {
                series,
                repsPerSerie: reps,
                sameReps,
                }
            : {
                duration,
                }),
        };
        
        console.log("📤 Envoi de la session de sport :", sessionPayload);
    
        try {
        const res = await fetch('https://flownest.onrender.com/api/sport-session', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(sessionPayload),
        });
        
    
        const responseText = await res.text();
        console.log('📦 Réponse brute de la requête sport :', responseText);
    
        if (res.ok) {
            console.log("✅ Session de sport enregistrée !");
            setModalVisible(false);
            setDurationInput('');
            setSportInput('');
            setSerieCount('');
            setRepsPerSerie('');
            setIntensity(0);
            setSameReps(true);
            fetchSessions();
            } else {
            console.error("❌ Statut erreur :", res.status);
            }
        } catch (err: any) {
            console.error('❌ Erreur réseau lors de l’envoi :', err.message || err);
        }
    };
    
    const SPORTS = [
        { name: "Football", icon: "⚽" },
        { name: "Basketball", icon: "🏀" },
        { name: "Handball", icon: "🤾" },
        { name: "Volley", icon: "🏐" },
        { name: "Rugby", icon: "🏉" },
        { name: "Tennis", icon: "🎾" },
        { name: "Badminton", icon: "🏸" },
        { name: "Ping-pong", icon: "🏓" },
        { name: "Baseball", icon: "⚾" },
        { name: "Softball", icon: "🥎" },
        { name: "Golf", icon: "⛳" },
        { name: "Hockey sur gazon", icon: "🏑" },
        { name: "Hockey sur glace", icon: "🏒" },
    
        // Sports de combat
        { name: "Boxe", icon: "🥊" },
        { name: "Kickboxing", icon: "🥋" },
        { name: "MMA", icon: "🤼" },
        { name: "Judo", icon: "🥋" },
        { name: "Karaté", icon: "🥋" },
        { name: "Taekwondo", icon: "🥋" },
        { name: "Lutte", icon: "🤼‍♂️" },
        { name: "Aïkido", icon: "🥋" },
    
        // Endurance & fitness
        { name: "Course à pied", icon: "🏃" },
        { name: "Tapis de course", icon: "🏃‍♀️" },
        { name: "Marche", icon: "🚶" },
        { name: "Cyclisme", icon: "🚴" },
        { name: "Vélo d'appartement", icon: "🚴‍♂️" },
        { name: "Musculation", icon: "🏋️" },
        { name: "Crossfit", icon: "💪" },
        { name: "Cardio", icon: "❤️" },
        { name: "Fitness", icon: "🤸‍♀️" },
        { name: "HIIT", icon: "🔥" },
        { name: "Stretching", icon: "🧘" },
        { name: "Pompes", icon: "🤸‍♂️" },
        { name: "Abdos", icon: "💪" },
        { name: "Squats", icon: "🦵" },
        { name: "Fentes", icon: "🦵" },
    
        // Sports de glisse & d'eau
        { name: "Natation", icon: "🏊" },
        { name: "Surf", icon: "🏄" },
        { name: "Kitesurf", icon: "🪁" },
        { name: "Plongée", icon: "🤿" },
        { name: "Canoë-kayak", icon: "🛶" },
        { name: "Aviron", icon: "🚣" },
        { name: "Ski", icon: "🎿" },
        { name: "Snowboard", icon: "🏂" },
        { name: "Patinage artistique", icon: "⛸️" },
    
        // Gym & corps
        { name: "Yoga", icon: "🧘" },
        { name: "Pilates", icon: "🤸" },
        { name: "Danse", icon: "💃" },
        { name: "Zumba", icon: "🕺" },
        { name: "Barre au sol", icon: "🧘‍♀️" },
    
        // Sports extrêmes / autres
        { name: "Escalade", icon: "🧗" },
        { name: "Parkour", icon: "🤸" },
        { name: "Équitation", icon: "🏇" },
        { name: "Skateboard", icon: "🛹" },
        { name: "Roller", icon: "🛼" },
        { name: "Tir à l’arc", icon: "🏹" },
        { name: "Escrime", icon: "🤺" },
        { name: "Triathlon", icon: "🏊‍♂️🚴‍♂️🏃‍♂️" },
        { name: "Randonnée", icon: "🥾" },
        { name: "Chasse", icon: "🔫" },
    ];
    
    
    const [filteredSports, setFilteredSports] = useState(SPORTS);
    const [showSportList, setShowSportList] = useState(false);
    const [intensity, setIntensity] = useState(0);


    const handleSportInput = (text: string) => {
        setSportInput(text);
        if (text.length > 0) {
        const filtered = SPORTS.filter(s =>
            s.name.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredSports(filtered);
        setShowSportList(true);
        } else {
        setShowSportList(false);
        }
    };
    
    const handleSportSelect = (sport: string) => {
        setSportInput(sport);
        setShowSportList(false);
    };
    
//pour les pompes
    const [serieCount, setSerieCount] = useState('');
    const [repsPerSerie, setRepsPerSerie] = useState('');
    const [sameReps, setSameReps] = useState(true);  

return (
<SafeAreaView style={[styles.container, { backgroundColor }]}>
<View style={[styles.container, { backgroundColor }]}>
    <Text style={[styles.text, { color: textColor }]}>
    🏋️ Sport 🏋️
    </Text>

    <Pressable onPress={() => setModalVisible(true)} style={styles.button}>
    <Text style={styles.buttonText}>🔥 Commencer une séance !
    </Text>
    </Pressable>


    <Text style={[styles.historyTitle, { color: textColor }]}>🏋️ Dernières sessions :</Text>

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
            <Text style={[styles.text, { color: textColor }]}>Nouvelle session 🏋️</Text>

            <TextInput
            placeholder="Quel sport ?"
            value={sportInput}
            onChangeText={handleSportInput}
            style={[styles.input, { color: textColor, borderColor: textColor }]}
            placeholderTextColor={isDark ? "#999" : "#aaa"}
            onFocus={() => setShowSportList(true)}
            />

            {showSportList && (
            <FlatList
                data={filteredSports}
                keyExtractor={(item) => item.name}
                style={styles.dropdownGrid}
                numColumns={2}
                keyboardShouldPersistTaps="handled"
                renderItem={({ item }) => (
                <Pressable
                    onPress={() => handleSportSelect(item.name)}
                    style={styles.sportCard}
                >
                    <Text style={styles.sportIcon}>{item.icon}</Text>
                    <Text style={[styles.sportLabel, { color: textColor }]}>{item.name}</Text>
                </Pressable>
                )}
            />
            )}

            {sportInput.toLowerCase() === "pompes" ? (
            <>
                <TextInput
                placeholder="Nombre de séries"
                keyboardType="numeric"
                value={serieCount}
                onChangeText={setSerieCount}
                style={[styles.input, { color: textColor, borderColor: textColor }]}
                placeholderTextColor={isDark ? "#999" : "#aaa"}
                />

                <TextInput
                placeholder="Pompes par série"
                keyboardType="numeric"
                value={repsPerSerie}
                onChangeText={setRepsPerSerie}
                style={[styles.input, { color: textColor, borderColor: textColor }]}
                placeholderTextColor={isDark ? "#999" : "#aaa"}
                />

                <Pressable
                onPress={() => setSameReps(!sameReps)}
                style={[
                    styles.toggleButton,
                    { backgroundColor: sameReps ? "#10b981" : "#9ca3af" },
                ]}
                >
                <Text style={{ color: "#fff", fontWeight: "600" }}>
                    {sameReps ? "🔁 Même nb de pompes / série" : "🔓 Pompes différentes"}
                </Text>
                </Pressable>
            </>
            ) : (
            <TextInput
                placeholder="Durée (minutes)"
                keyboardType="numeric"
                value={durationInput}
                onChangeText={setDurationInput}
                style={[styles.input, { color: textColor, borderColor: textColor }]}
                placeholderTextColor={isDark ? "#999" : "#aaa"}
            />
            )}


            <Text style={[styles.intensityLabel, { color: textColor }]}>Intensité :</Text>
            <View style={styles.intensityScale}>
            {[1, 2, 3, 4, 5].map((level) => (
                <Pressable key={level} onPress={() => setIntensity(level)}>
                <Text style={styles.intensityDot}>
                    {level <= intensity ? "🔥" : "⚪"}
                </Text>
                </Pressable>
            ))}
            </View>


            <Pressable onPress={handleStartSession} style={styles.button}>
            <Text style={styles.buttonText}>✅ Démarrer</Text>
            </Pressable>
            {!isLoggedIn && (
                <Text style={styles.errorText}>
                Connectez-vous pour accéder à cette fonctionnalité.
                </Text>
            )}



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
  errorText: {
    color: 'red',
    marginBottom: 8,
    textAlign: 'center',
    fontSize: 14,
  },
  dropdown: {
    maxHeight: 150,
    width: 250,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginTop: 8,
  },
  dropdownItem: {
    padding: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  
  dropdownGrid: {
    maxHeight: 200,
    marginTop: 8,
    width: 250,
    alignSelf: 'center',
  },
  
  sportCard: {
    flex: 1,
    margin: 6,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  
  sportIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  
  sportLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  

  intensityContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  intensityLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    marginTop: 12,
  },
  intensityScale: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  intensityDot: {
    fontSize: 24,
  },

  toggleButton: {
    marginTop: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  
});
