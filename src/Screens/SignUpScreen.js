import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { auth, firestore } from '../../firebaseConfig'; 
import { createUserWithEmailAndPassword } from 'firebase/auth'; 
import { doc, setDoc } from 'firebase/firestore';

const SignUpScreen = ({ navigation, onSignUpSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    if (!name || !email || !password) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return false;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Password must be at least 6 characters long.');
      return false;
    }

    return true;
  };
  const handleSignUp = async () => {
    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(firestore, 'users', userCredential.user.uid), {
        name,
        email,
        createdAt: new Date(),
      });

      ("User signed up and data saved to Firestore!");
      onSignUpSuccess(navigation);
    } catch (error) {
      console.error("Sign up error: ", error);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Sign Up Failed', 'This email address is already in use. Please use a different email.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Sign Up Failed', 'The email address is not valid. Please enter a valid email address.');
      } else if (error.code === 'auth/weak-password') {
        Alert.alert('Sign Up Failed', 'The password is too weak. Please use a stronger password.');
      } else {
        Alert.alert('Sign Up Failed', error.message || 'An unknown error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>
      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TouchableOpacity
        style={[styles.button, isLoading ? styles.loadingButton : null]}
        onPress={handleSignUp}
        disabled={isLoading}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Signing Up...' : 'Sign Up'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.switchText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  button: {
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: '40%',
    alignSelf: 'center',
    marginBottom: 20,
    backgroundColor: '#007bff',
  },
  loadingButton: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: '100%',
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
  },
  switchText: {
    marginTop: 10,
    color: '#007BFF',
  },
});

export default SignUpScreen;
