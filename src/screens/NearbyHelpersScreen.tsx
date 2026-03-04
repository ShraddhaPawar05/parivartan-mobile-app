import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
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
      <ScrollView style={{flex: 1}} showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
        <BackButton onPress={() => navigation.goBack()} style={styles.back} />

        <Text style={styles.title}>Nearby Recyclers</Text>
        <Text style={styles.sub}>Select a verified recycler for pickup</Text>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>Finding recyclers...</Text>
          </View>
        ) : partners.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No recyclers available</Text>
            <Text style={styles.emptySubtext}>No verified recyclers found for {category} waste in your area.</Text>
          </View>
        ) : (
          partners.map(p => (
            <View key={p.id} style={styles.card}>
              <View style={{flexDirection: 'row', alignItems: 'flex-start'}}>
                <View style={{width: 48, height: 48, borderRadius: 24, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', marginRight: 12}}>
                  <MaterialCommunityIcons name="recycle" size={24} color="#10b981" />
                </View>
                <View style={{flex:1}}>
                  <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 6}}>
                    <Text style={styles.partnerName}>{p.name}</Text>
                    <View style={styles.verified}><Text style={styles.verifiedText}>VERIFIED</Text></View>
                  </View>
                  <Text style={styles.partnerDesc}>{p.organization}</Text>
                  <Text style={styles.partnerAddress}>📍 {p.address}</Text>
                  <Text style={styles.partnerPhone}>📞 {p.phone}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.selectButton} onPress={() => { setSelectedPartner({ id: p.id, name: p.name }); navigation.navigate('ConfirmRequest'); }}>
                <Text style={styles.selectText}>Select Recycler</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          ))
        )}

        </View>
        <View style={{height: 40}} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  back: { width: 36, height:36, borderRadius:18, alignItems:'center', justifyContent:'center', backgroundColor:'#fff', marginBottom:16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 6, color: '#111827' },
  sub: { color: '#6b7280', marginBottom: 20, fontSize: 14 },
  card: { backgroundColor:'#fff', borderRadius:14, padding:20, marginBottom:16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  partnerName: { fontWeight:'800', fontSize:17, color: '#111827', flex: 1 },
  partnerDesc: { color:'#6b7280', marginTop:6, fontSize: 14 },
  partnerAddress: { color:'#6b7280', marginTop:6, fontSize: 13 },
  partnerPhone: { color:'#10b981', marginTop:6, fontSize: 13, fontWeight: '600' },
  verified: { backgroundColor:'#10b981', paddingHorizontal:8, paddingVertical:4, borderRadius:8, marginLeft: 8 },
  verifiedText: { color:'#fff', fontSize:10, fontWeight:'700' },
  selectButton: { marginTop:16, backgroundColor:'#10b981', paddingVertical:14, borderRadius:12, alignItems:'center', flexDirection: 'row', justifyContent: 'center', gap: 8, shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  selectText: { color:'#fff', fontWeight:'800', fontSize: 16 },
  loadingContainer: { alignItems: 'center', marginTop: 60 },
  loadingText: { marginTop: 16, color: '#6b7280', fontWeight: '600', fontSize: 15 },
  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyText: { fontSize: 18, fontWeight: '800', color: '#111827' },
  emptySubtext: { marginTop: 8, color: '#6b7280', textAlign: 'center', fontSize: 14, lineHeight: 20 },
});

export default NearbyHelpersScreen;
