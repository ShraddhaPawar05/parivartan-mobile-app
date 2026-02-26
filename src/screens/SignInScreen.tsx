import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { auth } from '../firebase/firebase';
import { createUserProfileIfNotExists } from '../services/userService';

const SignInScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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
        />

        <TextInput 
          value={password} 
          onChangeText={setPassword} 
          placeholder="Password" 
          placeholderTextColor="#6B7280"
          style={styles.input} 
          secureTextEntry 
        />

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
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, paddingTop: 36, flexGrow: 1, justifyContent: 'center' },
  logoWrap: { alignItems: 'center', marginBottom: 12 },
  logoCircle: { width: 72, height: 72, borderRadius: 18, backgroundColor: '#f3fef6', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', marginTop: 6, textAlign: 'center' },
  subtitle: { color: '#6b7280', marginTop: 6, textAlign: 'center' },
  input: { 
    width: '100%', 
    backgroundColor: '#fff', 
    color: '#111827',
    padding: 14, 
    borderRadius: 12, 
    marginTop: 16, 
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000', 
    shadowOpacity: 0.03, 
    shadowRadius: 6, 
    elevation: 1 
  },
  primary: { width: '100%', backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 999, alignItems: 'center', marginTop: 18 },
  primaryText: { color: '#fff', fontWeight: '800' },
  bottomRow: { flexDirection: 'row', marginTop: 18, justifyContent: 'center' },
  bottomText: { color: '#6b7280' },
  bottomAction: { color: '#10b981', fontWeight: '800' },
});

export default SignInScreen;
