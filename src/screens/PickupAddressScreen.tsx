import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, ScrollView } from 'react-native';
import { BackButton } from '../components';
import ProgressBar from '../components/ProgressBar';
import ScreenWrapper from '../components/ScreenWrapper';
import { useUploadFlow } from '../context/UploadFlowContext';
import { useAuth } from '../context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const PickupAddressScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const { pickupAddress, setPickupAddress } = useUploadFlow();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(!pickupAddress);
  const [house, setHouse] = useState(pickupAddress?.house ?? '');
  const [street, setStreet] = useState(pickupAddress?.street ?? '');
  const [city, setCity] = useState(pickupAddress?.city ?? '');
  const [pincode, setPincode] = useState(pickupAddress?.pincode ?? '');
  const [landmark, setLandmark] = useState(pickupAddress?.landmark ?? '');

  // Auto-load user's default location from Firestore
  useEffect(() => {
    const loadDefaultLocation = async () => {
      if (pickupAddress || !user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userData = userDoc.data();
        const userLocation = userData?.location;

        if (userLocation) {
          setPickupAddress(userLocation);
          setHouse(userLocation.house);
          setStreet(userLocation.street);
          setCity(userLocation.city);
          setPincode(userLocation.pincode);
          setLandmark(userLocation.landmark || '');
          setEditing(false);
        }
      } catch (error) {
        console.error('Error loading default location:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDefaultLocation();
  }, [user?.uid, pickupAddress, setPickupAddress]);

  const onContinue = () => {
    if (!house || !street || !city || !pincode) {
      alert('Please enter House / Flat, Street, City and Pincode');
      return;
    }
    setPickupAddress({ house, street, city, pincode, landmark });
    navigation.navigate('NearbyHelpers');
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.container}>
          <Text style={{textAlign: 'center', marginTop: 20}}>Loading address...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
        <BackButton onPress={() => navigation.goBack()} style={styles.back} />

        <Text style={styles.title}>Pickup Address</Text>
        <ProgressBar current={4} total={5} />

        {!editing && pickupAddress ? (
          <View style={styles.card}>
            <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 16}}>
              <View style={{width: 40, height: 40, borderRadius: 20, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', marginRight: 12}}>
                <MaterialCommunityIcons name="map-marker-check" size={20} color="#10b981" />
              </View>
              <Text style={{fontWeight:'800', fontSize: 16, color: '#111827', flex: 1}}>Saved Address</Text>
            </View>
            <Text style={{fontWeight:'700', fontSize: 15, color: '#111827'}}>{pickupAddress.house}, {pickupAddress.street}</Text>
            <Text style={{color:'#6b7280', marginTop:6, fontSize: 14}}>{pickupAddress.city} - {pickupAddress.pincode}</Text>
            {pickupAddress.landmark ? <Text style={{color:'#6b7280', marginTop:6, fontSize: 13}}>📍 {pickupAddress.landmark}</Text> : null}
            <View style={{flexDirection: 'row', gap: 12, marginTop: 16}}>
              <TouchableOpacity style={{flex: 1, paddingVertical: 12, backgroundColor: '#f9fafb', borderRadius: 10, alignItems: 'center', borderWidth: 1.5, borderColor: '#e5e7eb'}} onPress={() => setEditing(true)}>
                <Text style={{color:'#6b7280', fontWeight:'800', fontSize: 15}}>Edit Address</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{flex: 1, paddingVertical: 12, backgroundColor: '#10b981', borderRadius: 10, alignItems: 'center', shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 12, elevation: 4}} onPress={() => navigation.navigate('NearbyHelpers')}>
                <Text style={{color:'#fff', fontWeight:'800', fontSize: 15}}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>House / Flat</Text>
            <TextInput value={house} onChangeText={setHouse} style={styles.input} placeholder="e.g. House No. 123" placeholderTextColor="#9ca3af" />

            <Text style={styles.label}>Street / Area</Text>
            <TextInput value={street} onChangeText={setStreet} style={styles.input} placeholder="e.g. MG Road" placeholderTextColor="#9ca3af" />

            <Text style={styles.label}>City</Text>
            <TextInput value={city} onChangeText={setCity} style={styles.input} placeholder="e.g. Mumbai" placeholderTextColor="#9ca3af" />

            <Text style={styles.label}>Pincode</Text>
            <TextInput value={pincode} onChangeText={setPincode} style={styles.input} placeholder="e.g. 400001" placeholderTextColor="#9ca3af" keyboardType="numeric" />

            <Text style={styles.label}>Landmark (optional)</Text>
            <TextInput value={landmark} onChangeText={setLandmark} style={styles.input} placeholder="e.g. Near City Mall" placeholderTextColor="#9ca3af" />

            <TouchableOpacity style={styles.continue} onPress={onContinue}>
              <Text style={{color:'#fff',fontWeight:'800', fontSize: 16}}>Continue</Text>
            </TouchableOpacity>
          </View>
        )}

        </View>
        <View style={{height: 40}} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  back: { width: 36, height:36, borderRadius:18, alignItems:'center', justifyContent:'center', backgroundColor:'#fff', marginBottom:16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  title: { textAlign: 'center', fontSize: 20, fontWeight: '800', marginBottom: 20, color: '#111827' },
  card: { backgroundColor:'#fff', padding:20, borderRadius:14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  form: { backgroundColor:'#fff', padding:20, borderRadius:14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  label: { fontWeight:'700', marginTop:16, fontSize: 14, color: '#111827' },
  input: { backgroundColor:'#f9fafb', padding:14, borderRadius:10, marginTop:8, borderWidth: 1.5, borderColor: '#e5e7eb', fontSize: 15 },
  continue: { backgroundColor:'#10b981', paddingVertical:16, borderRadius:14, marginTop:24, alignItems:'center', shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
});

export default PickupAddressScreen;
