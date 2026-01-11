import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const SignUpScreen: React.FC = () => {
  const { signUp } = useAuth();
  const navigation: any = useNavigation();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const onCreate = async () => {
    if (!name || !phone) return alert('Enter name and phone');
    await signUp(name, phone);
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}><MaterialCommunityIcons name="leaf" size={36} color="#10b981" /></View>
        </View>

        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Start your recycling journey</Text>

        <TextInput value={name} onChangeText={setName} placeholder="Full name" style={styles.input} />
        <TextInput value={phone} onChangeText={setPhone} placeholder="Phone number" style={styles.input} keyboardType="phone-pad" />
        <TextInput value={email} onChangeText={setEmail} placeholder="Email (optional)" style={styles.input} keyboardType="email-address" />

        <Text style={styles.terms}>By continuing, you agree to our terms</Text>

        <TouchableOpacity style={styles.primary} onPress={onCreate}>
          <Text style={styles.primaryText}>Create Account</Text>
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
  logoCircle: { width: 72, height: 72, borderRadius: 18, backgroundColor: '#f3fef6', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '800', marginTop: 6, textAlign: 'center' },
  subtitle: { color: '#6b7280', marginTop: 6, textAlign: 'center' },
  input: { width: '100%', backgroundColor: '#fff', padding: 14, borderRadius: 12, marginTop: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  primary: { width: '100%', backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 999, alignItems: 'center', marginTop: 18 },
  primaryText: { color: '#fff', fontWeight: '800' },
  terms: { color: '#6b7280', marginTop: 8, fontSize: 12 },
  bottomRow: { flexDirection: 'row', marginTop: 18, justifyContent: 'center' },
  bottomText: { color: '#6b7280' },
  bottomAction: { color: '#10b981', fontWeight: '800' },
});

export default SignUpScreen;
