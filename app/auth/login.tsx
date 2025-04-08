import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { router } from 'expo-router';

// 👇 Typage des props de navigation
type Props = NativeStackScreenProps<any>;

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  console.log("Je suis dans l'écran X")
  const isValidEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const handleLogin = async () => {


    if (!isValidEmail(email)) {
      Alert.alert('Oops', 'l\'email n\'est pas valide');
      return;
    }
    else {
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
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={styles.passwordInput}
        />
        
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <Text style={styles.toggle}>{showPassword ? '🙈' : '👁️'}</Text>
        </TouchableOpacity>
        
      </View>
      <Button title="Se connecter" onPress={handleLogin} />

      <TouchableOpacity onPress={() => router.replace('/auth/signup')}>
        <Text style={styles.link}>Pas encore de compte ? S'inscrire</Text>
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
  },
  toggle: {
    fontSize: 18,
    paddingHorizontal: 8,
  },
});
