import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BackButton } from '../components';
import ScreenWrapper from '../components/ScreenWrapper';

const CameraScreen: React.FC = () => {
  const navigation: any = useNavigation();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton onPress={() => navigation.goBack()} style={styles.back} />

        <Text style={styles.title}>Camera</Text>
        <Text style={styles.sub}>This is a placeholder camera screen. We'll add camera & scanning later.</Text>

        <TouchableOpacity style={styles.scan} onPress={() => { setCategory('Plastic'); navigation.replace('WasteIdentified'); }}>
          <Text style={styles.scanText}>Simulate Scan & Identify</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7f7f7' },
  container: { padding: 20 },
  back: { width: 36, height:36, borderRadius:18, alignItems:'center', justifyContent:'center', backgroundColor:'#fff', marginBottom:12 },
  title: { textAlign: 'center', fontSize: 20, fontWeight: '800', marginBottom: 8 },
  sub: { color:'#6b7280', textAlign:'center', marginBottom: 24 },
  scan: { backgroundColor:'#10b981', paddingVertical:14, borderRadius:999, alignItems:'center' },
  scanText: { color:'#fff', fontWeight:'800' },
});

export default CameraScreen;
