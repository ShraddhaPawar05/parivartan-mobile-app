import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import ScreenWrapper from '../components/ScreenWrapper';
import { useAuth } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';

const SignInScreen: React.FC = () => {
  const { signIn } = useAuth();
  const navigation: any = useNavigation();
  const [identifier, setIdentifier] = useState('');

  const onContinue = async () => {
    if (!identifier) return alert('Enter phone or email');
    await signIn(identifier);
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.logoWrap}>
          <View style={styles.logoCircle}><MaterialCommunityIcons name="leaf" size={36} color="#10b981" /></View>
        </View>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Continue your recycling journey</Text>

        <TextInput value={identifier} onChangeText={setIdentifier} placeholder="Phone or email" style={styles.input} keyboardType="default" />

        <TouchableOpacity style={styles.primary} onPress={onContinue}>
          <Text style={styles.primaryText}>Continue</Text>
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
  input: { width: '100%', backgroundColor: '#fff', padding: 14, borderRadius: 12, marginTop: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1 },
  primary: { width: '100%', backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 999, alignItems: 'center', marginTop: 18 },
  primaryText: { color: '#fff', fontWeight: '800' },
  bottomRow: { flexDirection: 'row', marginTop: 18, justifyContent: 'center' },
  bottomText: { color: '#6b7280' },
  bottomAction: { color: '#10b981', fontWeight: '800' },
});

export default SignInScreen;
