import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenWrapper from '../components/ScreenWrapper';
import { auth } from '../firebase/firebase';
import { createUserProfile } from '../services/userService';

const SignUpScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordsMatch = password.length > 0 && password === confirmPassword;
  const basicEmailValid = email.includes('@');
  const phoneValid = phone.trim().length === 10 && /^\d{10}$/.test(phone.trim());
  const canCreate = name.trim() && phoneValid && email.trim() && password && confirmPassword && passwordsMatch && basicEmailValid;

  const onCreate = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    if (!phoneValid) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await AsyncStorage.removeItem('@parivartan:onboardingComplete');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await createUserProfile(userCredential.user.uid, name, email, phone);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoWrap}>
            <View style={styles.logoCircle}>
              <MaterialCommunityIcons name="leaf" size={36} color="#10b981" />
            </View>
          </View>

          <Text style={styles.title}>Create your account</Text>
          <Text style={styles.subtitle}>Start your recycling journey</Text>

          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Full name"
            placeholderTextColor="#6B7280"
            style={styles.input}
            autoCapitalize="words"
            returnKeyType="next"
          />

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email address"
            placeholderTextColor="#6B7280"
            style={styles.input}
            keyboardType="email-address"
            autoCapitalize="none"
            returnKeyType="next"
          />

          <TextInput
            value={phone}
            onChangeText={setPhone}
            placeholder="Phone number (10 digits)"
            placeholderTextColor="#6B7280"
            style={styles.input}
            keyboardType="phone-pad"
            maxLength={10}
            returnKeyType="next"
          />

          {phone.length > 0 && (
            <Text style={{ color: phoneValid ? '#10b981' : '#ef4444', marginTop: 6 }}>
              {phoneValid ? 'Valid phone number' : 'Enter a valid 10-digit phone number'}
            </Text>
          )}

          <View style={styles.passwordWrap}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#6B7280"
              style={styles.passwordInput}
              secureTextEntry={!showPassword}
              returnKeyType="next"
            />
            <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeBtn}>
              <MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.passwordWrap}>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Confirm password"
              placeholderTextColor="#6B7280"
              style={styles.passwordInput}
              secureTextEntry={!showConfirm}
              returnKeyType="done"
              onSubmitEditing={onCreate}
            />
            <TouchableOpacity onPress={() => setShowConfirm(p => !p)} style={styles.eyeBtn}>
              <MaterialCommunityIcons name={showConfirm ? 'eye-off' : 'eye'} size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {confirmPassword.length > 0 && (
            <Text style={{ color: passwordsMatch ? '#10b981' : '#ef4444', marginTop: 6 }}>
              {passwordsMatch ? 'Passwords match' : 'Passwords do not match'}
            </Text>
          )}

          {!basicEmailValid && email.length > 0 && (
            <Text style={{ color: '#ef4444', marginTop: 6 }}>Enter a valid email address</Text>
          )}

          <Text style={styles.terms}>By continuing, you agree to our terms</Text>

          <TouchableOpacity
            style={[styles.primary, (!canCreate || loading) && { opacity: 0.5 }]}
            onPress={onCreate}
            disabled={!canCreate || loading}
          >
            <Text style={styles.primaryText}>{loading ? 'Creating Account...' : 'Create Account'}</Text>
          </TouchableOpacity>

          <View style={styles.bottomRow}>
            <Text style={styles.bottomText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
              <Text style={styles.bottomAction}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 36, flexGrow: 1, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 12 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 20, backgroundColor: '#ecfdf5',
    alignItems: 'center', justifyContent: 'center', elevation: 2,
  },
  title: { fontSize: 24, fontWeight: '800', marginTop: 12, textAlign: 'center', color: '#111827' },
  subtitle: { color: '#6b7280', marginTop: 8, textAlign: 'center', fontSize: 14, lineHeight: 20 },
  input: {
    backgroundColor: '#fff', color: '#111827', padding: 14, fontSize: 15,
    borderRadius: 12, marginTop: 12, borderWidth: 1.5, borderColor: '#E5E7EB', elevation: 1,
  },
  passwordWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 12, marginTop: 12, borderWidth: 1.5, borderColor: '#E5E7EB', elevation: 1,
  },
  passwordInput: { flex: 1, padding: 14, fontSize: 15, color: '#111827' },
  eyeBtn: { paddingHorizontal: 14 },
  primary: {
    backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 14,
    alignItems: 'center', marginTop: 24, elevation: 4,
  },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  terms: { color: '#6b7280', marginTop: 8, fontSize: 12 },
  bottomRow: { flexDirection: 'row', marginTop: 18, justifyContent: 'center', marginBottom: 20 },
  bottomText: { color: '#6b7280' },
  bottomAction: { color: '#10b981', fontWeight: '800' },
});

export default SignUpScreen;
