import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { BackButton } from '../components';
import ScreenWrapper from '../components/ScreenWrapper';
import { useUploadFlow } from '../context/UploadFlowContext';
import { subscribeToPartnersByWasteType, Partner } from '../services/partnerService';

const NearbyHelpersScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const { setSelectedPartner, category } = useUploadFlow();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!category) {
      console.log('⚠️ No waste type selected');
      setLoading(false);
      return;
    }

    console.log('🔍 Subscribing to partners for:', category);

    const unsubscribe = subscribeToPartnersByWasteType(
      category,
      (updatedPartners) => {
        setPartners(updatedPartners);
        setLoading(false);
      },
      (error) => {
        console.error('Partner fetch error:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [category]);

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <BackButton onPress={() => navigation.goBack()} style={styles.back} />

        <Text style={styles.title}>Nearby Helpers</Text>
        <Text style={styles.sub}>Based on your location and waste details</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>Finding partners...</Text>
          </View>
        ) : partners.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No partners available</Text>
            <Text style={styles.emptySubtext}>No verified partners found for {category} waste in your area.</Text>
          </View>
        ) : (
          partners.map(p => (
            <View key={p.id} style={styles.card}>
              <View style={[styles.cardTop, {alignItems:'flex-start'}]}>
                <View style={{flex:1}}>
                  <Text style={styles.partnerName}>{p.name}</Text>
                  <Text style={styles.partnerDesc}>{p.organization}</Text>
                  <Text style={styles.partnerAddress}>{p.address}</Text>
                </View>

                <View style={{alignItems:'flex-end'}}>
                  <View style={styles.verified}><Text style={styles.verifiedText}>VERIFIED</Text></View>
                  <TouchableOpacity style={styles.selectSmall} onPress={() => { setSelectedPartner({ id: p.id, name: p.name }); navigation.navigate('ConfirmRequest'); }}>
                    <Text style={styles.selectTextSmall}>Select</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.metaRow}>
                <Text style={styles.meta}>{p.phone}</Text>
              </View>
            </View>
          ))
        )}

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
  partnerAddress: { color:'#9ca3af', marginTop:4, fontSize:12 },
  metaRow: { marginTop:12 },
  meta: { color:'#6b7280' },
  select: { marginTop:12, backgroundColor:'#10b981', paddingVertical:12, borderRadius:10, alignItems:'center' },
  selectText: { color:'#fff', fontWeight:'800' },

  verified: { backgroundColor:'#10b981', paddingHorizontal:8, paddingVertical:4, borderRadius:8 },
  verifiedText: { color:'#fff', fontSize:11, fontWeight:'700' },
  selectSmall: { marginTop:8, backgroundColor:'#10b981', paddingHorizontal:12, paddingVertical:8, borderRadius:8 },
  selectTextSmall: { color:'#fff', fontWeight:'800' },
  
  loadingContainer: { alignItems: 'center', marginTop: 40 },
  loadingText: { marginTop: 12, color: '#6b7280', fontWeight: '600' },
  emptyContainer: { alignItems: 'center', marginTop: 40, paddingHorizontal: 20 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#111827' },
  emptySubtext: { marginTop: 8, color: '#6b7280', textAlign: 'center' },
});

export default NearbyHelpersScreen;
