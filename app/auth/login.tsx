import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { router } from 'expo-router';

// 👇 Typage des props de navigation
type Props = NativeStackScreenProps<any>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      const res = await axios.post('https://flownest.onrender.com/api/auth/login', {
        email,
        password,
      });

      const username= res.data.email
      const token = res.data.token;
      await AsyncStorage.setItem('token', token);
      Alert.alert('Connexion réussie ✅');
      router.replace('/'); 
    } catch (error: any) {
      Alert.alert('Erreur', error.response?.data?.error || 'Authentification échouée');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connexion</Text>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Mot de passe"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />
      <Button title="Se connecter" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 24, 
    justifyContent: 'center' 
  },

  title: { 
    fontSize: 24, 
    marginBottom: 16 
  },

  input: { borderWidth: 1, 
    marginBottom: 12, 
    padding: 10, 
    borderRadius: 6 
  },
});
