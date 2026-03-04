import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import ScreenWrapper from '../components/ScreenWrapper';
import { useAuth } from '../context/AuthContext';

const EditProfileScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user?.uid) return;
      
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setFullName(data.fullName || '');
          setPhone(data.phone || '');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setFetching(false);
      }
    };

    fetchUserData();
  }, [user?.uid]);

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your name');
      return;
    }

    if (!phone.trim() || phone.trim().length !== 10 || !/^\d{10}$/.test(phone.trim())) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user!.uid), {
        fullName: fullName.trim(),
        phone: phone.trim()
      });

      Alert.alert('Success', 'Profile updated successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const phoneValid = phone.trim().length === 10 && /^\d{10}$/.test(phone.trim());
  const firstName = fullName.split(' ')[0] || 'User';

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>

        {fetching ? (
          <View style={styles.loadingContainer}>
            <MaterialCommunityIcons name="loading" size={32} color="#10b981" />
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : (
          <>
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
              </View>
              <Text style={styles.avatarLabel}>Profile Picture</Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="account" size={20} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    value={fullName}
                    onChangeText={setFullName}
                    placeholder="Enter your full name"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    autoCapitalize="words"
                  />
                  {fullName.trim().length > 0 && (
                    <MaterialCommunityIcons name="check-circle" size={20} color="#10b981" />
                  )}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputWrapper}>
                  <MaterialCommunityIcons name="phone" size={20} color="#6b7280" style={styles.inputIcon} />
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="Enter 10-digit phone number"
                    placeholderTextColor="#9CA3AF"
                    style={styles.input}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                  {phone.length > 0 && (
                    <MaterialCommunityIcons 
                      name={phoneValid ? "check-circle" : "alert-circle"} 
                      size={20} 
                      color={phoneValid ? "#10b981" : "#ef4444"} 
                    />
                  )}
                </View>
                {phone.length > 0 && (
                  <View style={styles.validationRow}>
                    <MaterialCommunityIcons 
                      name={phoneValid ? "check" : "close"} 
                      size={14} 
                      color={phoneValid ? "#10b981" : "#ef4444"} 
                    />
                    <Text style={[styles.validationText, { color: phoneValid ? '#10b981' : '#ef4444' }]}>
                      {phoneValid ? 'Valid phone number' : 'Must be 10 digits'}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={[styles.inputWrapper, {backgroundColor: '#f9fafb'}]}>
                  <MaterialCommunityIcons name="email" size={20} color="#9ca3af" style={styles.inputIcon} />
                  <Text style={styles.disabledText}>{user?.email}</Text>
                </View>
                <Text style={styles.helperText}>Email cannot be changed</Text>
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, (loading || !fullName.trim() || !phoneValid) && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={loading || !fullName.trim() || !phoneValid}
            >
              {loading ? (
                <MaterialCommunityIcons name="loading" size={20} color="#fff" />
              ) : (
                <MaterialCommunityIcons name="check" size={20} color="#fff" />
              )}
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <MaterialCommunityIcons name="information" size={20} color="#3b82f6" />
              <Text style={styles.infoText}>
                Your profile information is used to personalize your experience and for pickup coordination.
              </Text>
            </View>
          </>
        )}

        <View style={{height: 60}} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  backButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  placeholder: { width: 36 },

  loadingContainer: { alignItems: 'center', marginTop: 60 },
  loadingText: { color: '#6b7280', marginTop: 12, fontSize: 14 },

  avatarSection: { alignItems: 'center', marginBottom: 32 },
  avatarCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', borderWidth: 4, borderColor: '#10b981', shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  avatarText: { fontSize: 40, fontWeight: '900', color: '#10b981' },
  avatarLabel: { fontSize: 13, color: '#6b7280', marginTop: 12, fontWeight: '600' },

  form: { gap: 20 },
  inputGroup: {},
  label: { fontSize: 14, fontWeight: '700', color: '#374151', marginBottom: 8 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 4, borderWidth: 1.5, borderColor: '#e5e7eb', shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 4, elevation: 1 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: '#111827', fontSize: 15, paddingVertical: 12, fontWeight: '500' },
  disabledText: { flex: 1, color: '#9ca3af', fontSize: 15, paddingVertical: 12 },
  validationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  validationText: { fontSize: 12, fontWeight: '600' },
  helperText: { fontSize: 12, color: '#9ca3af', marginTop: 6 },

  saveButton: { backgroundColor: '#10b981', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 14, marginTop: 32, gap: 8, shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  saveButtonDisabled: { backgroundColor: '#d1d5db', shadowOpacity: 0 },
  saveButtonText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  infoCard: { flexDirection: 'row', backgroundColor: '#eff6ff', padding: 14, borderRadius: 12, marginTop: 20, gap: 10, borderWidth: 1, borderColor: '#dbeafe' },
  infoText: { flex: 1, fontSize: 12, color: '#1e40af', lineHeight: 18 }
});

export default EditProfileScreen;
