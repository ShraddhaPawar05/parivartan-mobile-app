import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { BackButton } from '../components';
import ProgressBar from '../components/ProgressBar';
import ScreenWrapper from '../components/ScreenWrapper';
import { useUploadFlow } from '../context/UploadFlowContext';
import { useAuth } from '../context/AuthContext';
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
    // basic validation
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
      <View style={styles.container}>
        <BackButton onPress={() => navigation.goBack()} style={styles.back} />

        <Text style={styles.title}>Pickup Address</Text>
        <ProgressBar current={4} total={5} />

        {!editing && pickupAddress ? (
          <View style={styles.card}>
            <Text style={{fontWeight:'800'}}>{pickupAddress.house}, {pickupAddress.street}</Text>
            <Text style={{color:'#6b7280', marginTop:6}}>{pickupAddress.city} - {pickupAddress.pincode}</Text>
            {pickupAddress.landmark ? <Text style={{color:'#6b7280', marginTop:6}}>Landmark: {pickupAddress.landmark}</Text> : null}
            <TouchableOpacity style={{marginTop:12}} onPress={() => setEditing(true)}>
              <Text style={{color:'#10b981', fontWeight:'800'}}>Edit address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.form}>
            <Text style={styles.label}>House / Flat</Text>
            <TextInput value={house} onChangeText={setHouse} style={styles.input} placeholder="House / Flat" />

            <Text style={styles.label}>Street / Area</Text>
            <TextInput value={street} onChangeText={setStreet} style={styles.input} placeholder="Street / Area" />

            <Text style={styles.label}>City</Text>
            <TextInput value={city} onChangeText={setCity} style={styles.input} placeholder="City" />

            <Text style={styles.label}>Pincode</Text>
            <TextInput value={pincode} onChangeText={setPincode} style={styles.input} placeholder="Pincode" keyboardType="numeric" />

            <Text style={styles.label}>Landmark (optional)</Text>
            <TextInput value={landmark} onChangeText={setLandmark} style={styles.input} placeholder="Landmark" />

            <TouchableOpacity style={styles.continue} onPress={onContinue}><Text style={{color:'#fff',fontWeight:'800'}}>Continue</Text></TouchableOpacity>
          </View>
        )}

      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { padding:20 },
  back: { width: 36, height:36, borderRadius:18, alignItems:'center', justifyContent:'center', backgroundColor:'#fff', marginBottom:12 },
  title: { textAlign: 'center', fontSize: 20, fontWeight: '800', marginBottom: 18 },
  card: { backgroundColor:'#fff', padding:12, borderRadius:12 },
  form: { backgroundColor:'#fff', padding:12, borderRadius:12 },
  label: { fontWeight:'700', marginTop:12 },
  input: { backgroundColor:'#f8fafc', padding:10, borderRadius:8, marginTop:6 },
  continue: { backgroundColor:'#10b981', paddingVertical:14, borderRadius:999, marginTop:20, alignItems:'center' },
});

export default PickupAddressScreen;
