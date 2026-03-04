import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ScreenWrapper from '../components/ScreenWrapper';
import { useAuth } from '../context/AuthContext';
import { updateUserLocation } from '../services/userService';

interface LocationSetupScreenProps {
  onLocationSaved?: () => void;
}

const LocationSetupScreen: React.FC<LocationSetupScreenProps> = ({ onLocationSaved }) => {
  const { user } = useAuth();
  const [house, setHouse] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [landmark, setLandmark] = useState('');
  const [saving, setSaving] = useState(false);

  const canSave = Boolean(house.trim() && street.trim() && city.trim() && pincode.trim());

  const onSave = async () => {
    if (!canSave) return alert('Please fill required fields');
    setSaving(true);
    const payload = { house: house.trim(), street: street.trim(), city: city.trim(), pincode: pincode.trim(), landmark: landmark.trim() };

    try {
      console.log('Saving location data...');
      // Save to AsyncStorage
      await AsyncStorage.setItem('@parivartan:location', JSON.stringify(payload));
      console.log('Location saved to AsyncStorage');
      
      // Update Firestore user profile if user is authenticated
      if (user?.uid) {
        try {
          await updateUserLocation(user.uid, payload);
          console.log('Location updated in Firestore');
        } catch (firestoreError) {
          console.error('Firestore update failed, but continuing:', firestoreError);
          // Don't break the flow if Firestore fails
        }
      }
      
      // Mark onboarding as complete
      await AsyncStorage.setItem('@parivartan:onboardingComplete', 'true');
      console.log('Onboarding marked as complete');
      
      setSaving(false);
      console.log('Calling onLocationSaved callback');
      onLocationSaved?.();
    } catch (e) {
      console.error('Error saving location:', e);
      setSaving(false);
      alert('Failed to save location');
    }
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={{ alignItems: 'center', marginBottom: 12 }}>
          <View style={styles.logoCircle}><MaterialCommunityIcons name="map-marker-radius" size={36} color="#10b981" /></View>
        </View>

        <Text style={styles.title}>Set your pickup location</Text>
        <Text style={styles.subtitle}>This helps us find nearby recycling partners</Text>

        <View style={styles.card}>
          <Text style={styles.label}>House / Flat</Text>
          <TextInput 
            value={house} 
            onChangeText={setHouse} 
            placeholder="e.g. 12B, Sunrise Apartments" 
            placeholderTextColor="#9CA3AF"
            style={styles.input} 
          />

          <Text style={styles.label}>Street / Area</Text>
          <TextInput 
            value={street} 
            onChangeText={setStreet} 
            placeholder="e.g. MG Road" 
            placeholderTextColor="#9CA3AF"
            style={styles.input} 
          />

          <Text style={styles.twoInline}>
            <Text style={styles.label}>City</Text>
            <Text style={{ width: 12 }} />
            <Text style={styles.label}>Pincode</Text>
          </Text>
          <View style={styles.row}>
            <TextInput 
              value={city} 
              onChangeText={setCity} 
              placeholder="City" 
              placeholderTextColor="#9CA3AF"
              style={[styles.input, { flex: 1, marginRight: 8 }]} 
            />
            <TextInput 
              value={pincode} 
              onChangeText={setPincode} 
              placeholder="Pincode" 
              placeholderTextColor="#9CA3AF"
              style={[styles.input, { width: 120 }]} 
              keyboardType="number-pad" 
            />
          </View>

          <Text style={styles.label}>Landmark (optional)</Text>
          <TextInput 
            value={landmark} 
            onChangeText={setLandmark} 
            placeholder="Near the temple / park" 
            placeholderTextColor="#9CA3AF"
            style={styles.input} 
          />

          <TouchableOpacity style={[styles.primary, !canSave ? { opacity: 0.5 } : null]} onPress={onSave} disabled={!canSave || saving}>
            <Text style={styles.primaryText}>{saving ? 'Saving...' : 'Save & Continue'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 20 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 8, textAlign: 'center', color: '#111827' },
  subtitle: { color: '#6b7280', marginBottom: 24, textAlign: 'center', fontSize: 14 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  label: { color: '#374151', marginTop: 12, marginBottom: 8, fontWeight: '700', fontSize: 14 },
  input: { 
    backgroundColor: '#fff', 
    color: '#111827',
    padding: 14, 
    borderRadius: 12,
    fontSize: 15,
    borderWidth: 1.5,
    borderColor: '#E5E7EB'
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  primary: { marginTop: 24, backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 14, alignItems: 'center', shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  twoInline: { flexDirection: 'row', justifyContent: 'space-between' },
  logoCircle: { width: 80, height: 80, borderRadius: 20, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
});

export default LocationSetupScreen;
