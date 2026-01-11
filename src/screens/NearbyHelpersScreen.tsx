import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BackButton } from '../components';
import ScreenWrapper from '../components/ScreenWrapper';
import { useUploadFlow } from '../context/UploadFlowContext';

const partners = [
  { id: '1', name: 'GreenCycle Foundation', desc: 'Recycles household plastic and packaging waste responsibly.', distance: '1.2 km', limit: 'Up to 5 kg', rating: '4.8' },
  { id: '2', name: 'RePlast India', desc: 'Industrial plastic processing unit. Accepts bulk mixed plastic waste.', distance: '3.5 km', limit: 'Up to 50 kg', rating: '4.5' },
  { id: '3', name: 'EcoLocal Hub', desc: 'Community driven collection point for small scale recycling.', distance: '0.8 km', limit: 'Any amount', rating: '4.2' },
];

const NearbyHelpersScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const { setSelectedPartner } = useUploadFlow();

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <BackButton onPress={() => navigation.goBack()} style={styles.back} />

        <Text style={styles.title}>Nearby Helpers</Text>
        <Text style={styles.sub}>Based on your location and waste details</Text>

        {partners.map(p => (
          <View key={p.id} style={styles.card}>
            <View style={[styles.cardTop, {alignItems:'flex-start'}]}>
              <View style={{flex:1}}>
                <Text style={styles.partnerName}>{p.name}</Text>
                <Text style={styles.partnerDesc}>{p.desc}</Text>
              </View>

              <View style={{alignItems:'flex-end'}}>
                <View style={styles.verified}><Text style={styles.verifiedText}>VERIFIED</Text></View>
                <TouchableOpacity style={styles.selectSmall} onPress={() => { setSelectedPartner({ id: p.id, name: p.name }); navigation.navigate('ConfirmRequest'); }}>
                  <Text style={styles.selectTextSmall}>Select</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.meta}>{p.distance}  |  {p.limit}  |  ⭐ {p.rating}</Text>
            </View>
          </View>
        ))}

        <View style={{height: 120}} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7f7f7' },
  container: { padding: 20 },
  back: { width: 36, height:36, borderRadius:18, alignItems:'center', justifyContent:'center', backgroundColor:'#fff', marginBottom:12 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 6 },
  sub: { color: '#6b7280', marginBottom: 12 },
  card: { backgroundColor:'#fff', borderRadius:12, padding:16, marginBottom:12 },
  cardTop: { flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  badge: { backgroundColor:'#ecfdf5', paddingHorizontal:8, paddingVertical:6, borderRadius:8 },
  badgeText: { color:'#10b981', fontWeight:'800', fontSize:12 },
  partnerName: { fontWeight:'800', fontSize:16 },
  partnerDesc: { color:'#6b7280', marginTop:6 },
  metaRow: { marginTop:12 },
  meta: { color:'#6b7280' },
  select: { marginTop:12, backgroundColor:'#10b981', paddingVertical:12, borderRadius:10, alignItems:'center' },
  selectText: { color:'#fff', fontWeight:'800' },

  /* new */
  verified: { backgroundColor:'#10b981', paddingHorizontal:8, paddingVertical:4, borderRadius:8 },
  verifiedText: { color:'#fff', fontSize:11, fontWeight:'700' },
  selectSmall: { marginTop:8, backgroundColor:'#10b981', paddingHorizontal:12, paddingVertical:8, borderRadius:8 },
  selectTextSmall: { color:'#fff', fontWeight:'800' },
});

export default NearbyHelpersScreen;
