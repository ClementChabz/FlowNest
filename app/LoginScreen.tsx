import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await fetch('https://ton-backend.onrender.com/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        await AsyncStorage.setItem('token', data.token);
        Alert.alert('Connecté ✅');
        navigation.replace('/tabs'); // redirige vers l’app
      } else {
        Alert.alert('Erreur', data.error || 'Échec');
      }
    } catch (err) {
      Alert.alert('Erreur réseau');
    }
  };

  return (
    <View style={styles.container}>
      <Text>Email</Text>
      <TextInput value={email} onChangeText={setEmail} style={styles.input} />
      <Text>Mot de passe</Text>
      <TextInput value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />
      <Button title="Se connecter" onPress={handleLogin} />
      <Text onPress={() => navigation.navigate('Signup')}>Pas de compte ? S’inscrire</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  input: { borderWidth: 1, marginBottom: 12, padding: 8 },
});
