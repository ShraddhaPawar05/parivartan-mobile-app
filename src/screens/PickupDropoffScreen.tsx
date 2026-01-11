import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BackButton } from '../components';
import ProgressBar from '../components/ProgressBar';
import ScreenWrapper from '../components/ScreenWrapper';

const PickupDropoffScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const [choice, setChoice] = useState<'pickup'|'dropoff'>('pickup');

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton onPress={() => navigation.goBack()} style={styles.back} />

        <Text style={styles.title}>Pickup or Drop-off</Text>
        <ProgressBar current={4} total={5} />
        <Text style={styles.sub}>Choose how you'd like to hand over your waste</Text>

        <View style={{height:18}} />

        <TouchableOpacity style={[styles.option, choice === 'pickup' ? styles.optionActive : null]} onPress={() => setChoice('pickup')}>
          <Text style={styles.optionTitle}>Doorstep Pickup</Text>
          <Text style={styles.optionSub}>We collect from your address</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.option, choice === 'dropoff' ? styles.optionActive : null]} onPress={() => setChoice('dropoff')}>
          <Text style={styles.optionTitle}>Drop-off</Text>
          <Text style={styles.optionSub}>You drop off at a nearby point</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.next} onPress={() => navigation.navigate('NearbyHelpers')}>
          <Text style={styles.nextText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7f7f7' },
  container: { padding: 20 },
  back: { width: 36, height:36, borderRadius:18, alignItems:'center', justifyContent:'center', backgroundColor:'#fff', marginBottom:12 },
  title: { textAlign: 'center', fontSize: 20, fontWeight: '800', marginBottom: 6 },
  sub: { textAlign: 'center', color: '#6b7280', marginBottom: 14 },
  option: { backgroundColor:'#fff', padding: 14, borderRadius: 12, marginBottom: 12 },
  optionActive: { borderWidth: 1, borderColor: '#10b981' },
  optionTitle: { fontWeight: '800' },
  optionSub: { color: '#6b7280', marginTop: 6 },
  next: { backgroundColor:'#10b981', borderRadius:999, paddingVertical:16, alignItems:'center', marginTop:24 },
  nextText: { color:'#fff', fontWeight:'800' },
});

export default PickupDropoffScreen;
