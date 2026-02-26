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

      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const phoneValid = phone.trim().length === 10 && /^\d{10}$/.test(phone.trim());

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Profile</Text>
          <View style={styles.placeholder} />
        </View>

        {fetching ? (
          <Text style={styles.loadingText}>Loading...</Text>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter your full name"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              placeholderTextColor="#9CA3AF"
              style={styles.input}
              keyboardType="phone-pad"
              maxLength={10}
            />

            {phone.length > 0 && (
              <Text style={{ color: phoneValid ? '#10b981' : '#ef4444', marginTop: 8 }}>
                {phoneValid ? 'Valid phone number' : 'Enter a valid 10-digit phone number'}
              </Text>
            )}

            <TouchableOpacity
              style={[styles.saveButton, loading && { opacity: 0.5 }]}
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? 'Saving...' : 'Save Changes'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  loadingText: {
    textAlign: 'center',
    color: '#6b7280',
    marginTop: 40,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: '#fafafc',
    color: '#111827',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#10b981',
    paddingVertical: 14,
    borderRadius: 999,
    alignItems: 'center',
    marginTop: 24,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '800',
    fontSize: 16,
  },
});

export default EditProfileScreen;
