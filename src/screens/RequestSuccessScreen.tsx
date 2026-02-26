import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';

const RequestSuccessScreen: React.FC = ({ route }: any) => {
  const navigation: any = useNavigation();
  const { requestId } = route.params || {}; 

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Request Submitted</Text>
        <Text style={styles.subtitle}>Your request has been submitted. Points will be added after completion.</Text>

        <View style={styles.points}><Text style={{fontSize:18,fontWeight:'800',color:'#10b981'}}>EcoPoints Pending</Text></View>

        <TouchableOpacity style={styles.track} onPress={() => navigation.navigate('Requests', { screen: 'RequestDetails', params: { id: requestId } })}>
          <Text style={styles.trackText}>View Request</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.home} onPress={() => {
          // trigger Identify stack reset (by passing fresh param) then navigate home
          navigation.getParent()?.navigate('Identify', { screen: 'IdentifyStart', params: { _fresh: Date.now() } });
          navigation.getParent()?.navigate('Home');
        }}>
          <Text style={styles.homeText}>Back to Home</Text>
        </TouchableOpacity>

      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7f7f7' },
  container: { padding: 20, alignItems:'center', justifyContent:'center', flex:1 },
  title: { fontSize: 22, fontWeight: '800' },
  subtitle: { color:'#6b7280', marginTop:8, textAlign:'center' },
  points: { marginTop:16, backgroundColor:'#ecfdf5', padding:14, borderRadius:12 },
  track: { backgroundColor:'#10b981', paddingVertical:12, paddingHorizontal:28, borderRadius:999, marginTop:20 },
  trackText: { color:'#fff', fontWeight:'800' },
  home: { marginTop:12 },
  homeText: { color:'#6b7280' },
});

export default RequestSuccessScreen;
