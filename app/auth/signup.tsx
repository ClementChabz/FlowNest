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
import { useRouter } from 'expo-router';

export default function SignUpScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [signupError, setSignupError] = useState('');
  const [isPasswordWrong, setIsPasswordWrong] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  console.log("Je suis dans l'écran X")
  const isValidEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const isValidPassword = (password: string) => {
    const hasUppercase = /[A-Z]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    const hasMinLength = password.length >= 6;
  
    return hasUppercase && hasSpecialChar && hasMinLength;
  };
  

  const handleSignup = async () => {
    setEmailError('');
    setPasswordError('');
    setSignupError('');
  
    if (!isValidEmail(email)) {
      setEmailError('L’adresse email est invalide.');
      return;
    }
  
    if (!isValidPassword(password)) {
      setPasswordError(
        'Le mot de passe doit contenir au moins 6 caractères, une majuscule et un caractère spécial.'
      );
      return;
    }
  
    try {
      const res = await axios.post('https://flownest.onrender.com/api/auth/signup', {
        email,
        password,
      });
  
      if (res.status === 201) {
        router.replace('/auth/login');
      }
    } catch (error: any) {
      setSignupError(error.response?.data?.error || 'Une erreur est survenue.');
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
        {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

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


      
      
      {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

      {signupError ? <Text style={styles.errorText}>{signupError}</Text> : null}

      <Button title="S’inscrire" onPress={handleSignup} />

      <TouchableOpacity onPress={() => router.replace('/auth/login')}>
        <Text style={styles.link}>Déjà un compte ? Se connecter</Text>
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
  errorText: {
    color: 'red',
    marginBottom: 8,
    fontSize: 14,
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
