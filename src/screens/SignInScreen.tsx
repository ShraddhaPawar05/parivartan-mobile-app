import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { auth } from '../firebase/firebase';
import { createUserProfileIfNotExists } from '../services/userService';

const SignInScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const canContinue = email.trim() && password.trim();

  const onContinue = async () => {
    if (!canContinue) {
      Alert.alert('Error', 'Enter both email and password');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Create user profile if it doesn't exist
      await createUserProfileIfNotExists(userCredential.user.uid, email);
      console.log('Sign in successful');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenWrapper>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}><MaterialCommunityIcons name="leaf" size={36} color="#10b981" /></View>
        </View>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Continue your recycling journey</Text>

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

        <View style={styles.passwordWrap}>
          <TextInput 
            value={password} 
            onChangeText={setPassword} 
            placeholder="Password" 
            placeholderTextColor="#6B7280"
            style={styles.passwordInput} 
            secureTextEntry={!showPassword}
            returnKeyType="done"
            onSubmitEditing={onContinue}
          />
          <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={styles.eyeBtn}>
            <MaterialCommunityIcons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#6b7280" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => alert('Forgot password flow coming soon')}>
          <Text style={{ color: '#6b7280', marginTop: 8, alignSelf: 'flex-end' }}>Forgot password?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.primary, (!canContinue || loading) ? { opacity: 0.5 } : null]} onPress={onContinue} disabled={!canContinue || loading}>
          <Text style={styles.primaryText}>{loading ? 'Signing in...' : 'Continue'}</Text>
        </TouchableOpacity>

        <View style={styles.bottomRow}>
          <Text style={styles.bottomText}>New here? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('SignUp' as never)}>
            <Text style={styles.bottomAction}>Create an account</Text>
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
  logoCircle: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  title: { fontSize: 24, fontWeight: '800', marginTop: 12, textAlign: 'center', color: '#111827' },
  subtitle: { color: '#6b7280', marginTop: 8, textAlign: 'center', fontSize: 14 },
  input: { 
    width: '100%', 
    backgroundColor: '#fff', 
    color: '#111827',
    padding: 14, 
    fontSize: 15,
    borderRadius: 12, 
    marginTop: 16, 
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000', 
    shadowOpacity: 0.03, 
    shadowRadius: 6, 
    elevation: 1 
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  passwordInput: { flex: 1, padding: 14, fontSize: 15, color: '#111827' },
  eyeBtn: { paddingHorizontal: 14 },
  primary: { width: '100%', backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 14, alignItems: 'center', marginTop: 24, shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  bottomRow: { flexDirection: 'row', marginTop: 18, justifyContent: 'center' },
  bottomText: { color: '#6b7280' },
  bottomAction: { color: '#10b981', fontWeight: '800' },
});

export default SignInScreen;
