import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

// Type pour navigation (facultatif si en JS)
type Props = NativeStackScreenProps<any>;

export default function SignUpScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    try {
      const res = await axios.post('https://flownest.onrender.com/api/auth/signup', {
        email,
        password,
      });

      if (res.status === 201) {
        Alert.alert('✅ Compte créé', 'Tu peux maintenant te connecter');
        navigation.navigate('login'); // redirige vers l’écran login
      }
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.error || 'Inscription échouée');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={styles.input}
      />

      <TextInput
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button title="S’inscrire" onPress={handleSignup} />

      <TouchableOpacity onPress={() => navigation.navigate('login')}>
        <Text style={styles.link}>Déjà un compte ? Connecte-toi</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
  },
  link: {
    marginTop: 16,
    color: '#3b82f6',
    textAlign: 'center',
    fontWeight: '500',
  },
});
