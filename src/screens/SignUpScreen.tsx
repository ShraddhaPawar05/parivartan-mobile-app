import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenWrapper from '../components/ScreenWrapper';
import { useAuth } from '../context/AuthContext';
import { auth } from '../firebase/firebase';
import { createUserProfile } from '../services/userService';

const SignUpScreen: React.FC = () => {
  const { signUp } = useAuth();
  const navigation: any = useNavigation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const basicEmailValid = email.includes('@');
  const phoneValid = phone.trim().length === 10 && /^\d{10}$/.test(phone.trim());
  const canCreate = name.trim() && phoneValid && email.trim() && password && confirmPassword && passwordsMatch && basicEmailValid;

  const onCreate = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    
    if (!phone.trim() || phone.trim().length !== 10 || !/^\d{10}$/.test(phone.trim())) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      // Clear onboarding flag before signup
      await AsyncStorage.removeItem('@parivartan:onboardingComplete');
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Create Firestore user profile
      await createUserProfile(userCredential.user.uid, name, email, phone);
      console.log('Sign up successful - user will be redirected to location setup');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}><MaterialCommunityIcons name="leaf" size={36} color="#10b981" /></View>
        </View>

        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Start your recycling journey — we’ll use your details to coordinate pickups</Text>

        <TextInput 
          value={name} 
          onChangeText={setName} 
          placeholder="Full name" 
          placeholderTextColor="#6B7280"
          style={styles.input} 
          autoCapitalize="words" 
        />

        <TextInput 
          value={email} 
          onChangeText={setEmail} 
          placeholder="Email address" 
          placeholderTextColor="#6B7280"
          style={styles.input} 
          keyboardType="email-address" 
          autoCapitalize="none" 
        />

        <TextInput 
          value={phone} 
          onChangeText={setPhone} 
          placeholder="Enter phone number" 
          placeholderTextColor="#6B7280"
          style={styles.input} 
          keyboardType="phone-pad"
          maxLength={10}
        />

        {phone.length > 0 && (
          <Text style={{ color: phoneValid ? '#10b981' : '#ef4444', marginTop: 8 }}>
            {phoneValid ? 'Valid phone number' : 'Enter a valid 10-digit phone number'}
          </Text>
        )}

        <TextInput 
          value={password} 
          onChangeText={setPassword} 
          placeholder="Password" 
          placeholderTextColor="#6B7280"
          style={styles.input} 
          secureTextEntry 
        />
        <TextInput 
          value={confirmPassword} 
          onChangeText={setConfirmPassword} 
          placeholder="Confirm password" 
          placeholderTextColor="#6B7280"
          style={styles.input} 
          secureTextEntry 
        />

        {confirmPassword.length > 0 && (
          <Text style={{ color: passwordsMatch ? '#10b981' : '#ef4444', marginTop: 8 }}>
            {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
          </Text>
        )}

        {!basicEmailValid && email.length > 0 && (
          <Text style={{ color: '#ef4444', marginTop: 8 }}>Enter a valid email address</Text>
        )}

        <Text style={styles.terms}>By continuing, you agree to our terms</Text>

        <TouchableOpacity style={[styles.primary, (!canCreate || loading) ? { opacity: 0.5 } : null]} onPress={onCreate} disabled={!canCreate || loading}>
          <Text style={styles.primaryText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
        </TouchableOpacity>

        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignIn' as never)}>
            <Text style={styles.bottomAction}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 36, flexGrow: 1, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 12 },
  logoCircle: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 12, textAlign: 'center', color: '#111827' },
  subtitle: { color: '#6b7280', marginTop: 8, textAlign: 'center', fontSize: 14, lineHeight: 20 },
  input: { 
    width: '100%', 
    backgroundColor: '#fff', 
    color: '#111827',
    padding: 14, 
    fontSize: 15,
    borderRadius: 12, 
    marginTop: 12, 
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000', 
    shadowOpacity: 0.03, 
    shadowRadius: 6, 
    elevation: 1 
  },
  primary: { width: '100%', backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 24, shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  terms: { color: '#6b7280', marginTop: 8, fontSize: 12 },
  bottomRow: { flexDirection: 'row', marginTop: 18, justifyContent: 'center' },
  bottomText: { color: '#6b7280' },
  bottomAction: { color: '#10b981', fontWeight: '800' },
});

export default SignUpScreen;
