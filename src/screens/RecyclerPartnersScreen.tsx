import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Modal, ScrollView } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

type Partner = {
  id: string;
  name: string;
  organization: string;
  supportedWasteTypes: string[];
  verificationStatus: string;
  subscriptionStatus: string;
  address?: string;
  phone?: string;
  email?: string;
};

const RecyclerPartnersScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [favorites, setFavorites] = React.useState<Record<string, boolean>>({});
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);

  const wasteTypes = ['All', 'Plastic', 'Paper', 'Metal', 'Clothes', 'Cardboard', 'Glass'];

  useEffect(() => {
    console.log('Selected filter:', selectedFilter);
    console.log('Partners:', partners.map(p => ({ name: p.name, types: p.supportedWasteTypes })));
  }, [selectedFilter, partners]);

  useEffect(() => {
    const partnersRef = collection(db, 'partners');
    const q = query(
      partnersRef,
      where('verificationStatus', '==', 'approved'),
      where('subscriptionStatus', '==', 'active')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const partnersList: Partner[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Partner));
      setPartners(partnersList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching partners:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filtered = partners.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (p.supportedWasteTypes || []).join(' ').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'All' || 
      (p.supportedWasteTypes || []).some(type => type.toLowerCase() === selectedFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  const handlePartnerPress = async (partner: Partner) => {
    try {
      const partnerDoc = await getDoc(doc(db, 'partners', partner.id));
      if (partnerDoc.exists()) {
        setSelectedPartner({ id: partner.id, ...partnerDoc.data() } as Partner);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching partner details:', error);
    }
  };

  return (
    <ScreenWrapper>
      <View style={{flex: 1}}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><MaterialCommunityIcons name="chevron-left" size={24} color="#111827" /></TouchableOpacity>
          <Text style={styles.title}>Recycler Partners</Text>
          <View style={{width:36}} />
        </View>

        <TextInput 
          placeholder="Search recycler or waste type" 
          placeholderTextColor="#6B7280"
          value={searchQuery} 
          onChangeText={setSearchQuery} 
          style={styles.search} 
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop: 16}}>
          {wasteTypes.map(type => (
            <TouchableOpacity 
              key={type} 
              style={[styles.filterChip, selectedFilter === type && styles.filterChipActive]} 
              onPress={() => setSelectedFilter(type)}
            >
              <Text style={[styles.filterChipText, selectedFilter === type && styles.filterChipTextActive]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>Loading partners...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No partners found</Text>
          </View>
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={i => i.id}
            style={{flex: 1, marginTop:12}}
            contentContainerStyle={{paddingHorizontal: 16, paddingBottom: 80}}
            renderItem={({item}) => (
              <TouchableOpacity activeOpacity={0.9} style={styles.partnerCard} onPress={() => handlePartnerPress(item)}>
                <View style={{flex:1}}>
                  <View style={{flexDirection:'row', alignItems: 'center', marginBottom: 8}}>
                    <View style={{width: 40, height: 40, borderRadius: 20, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', marginRight: 12}}>
                      <MaterialCommunityIcons name="recycle" size={20} color="#10b981" />
                    </View>
                    <View style={{flex: 1}}>
                      <Text style={{fontWeight:'800', fontSize: 16, color: '#111827'}}>{item.name}</Text>
                      <Text style={{color:'#6b7280', marginTop:2, fontSize: 13}}>{item.organization}</Text>
                    </View>
                    <TouchableOpacity onPress={() => setFavorites(f => ({...f, [item.id]: !f[item.id]}))}>
                      <MaterialCommunityIcons name={favorites[item.id] ? 'heart' : 'heart-outline'} size={22} color={favorites[item.id] ? '#ef4444' : '#9ca3af'} />
                    </TouchableOpacity>
                  </View>
                  <View style={{flexDirection:'row', marginTop:8, flexWrap: 'wrap', gap: 6}}>
                    {(item.supportedWasteTypes || []).slice(0, 3).map(w => (
                      <View key={w} style={styles.chip}><Text style={{fontSize:11, color:'#065f46', fontWeight:'700'}}>{w}</Text></View>
                    ))}
                    {(item.supportedWasteTypes || []).length > 3 && (
                      <View style={styles.chip}><Text style={{fontSize:11, color:'#065f46', fontWeight:'700'}}>+{(item.supportedWasteTypes || []).length - 3}</Text></View>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}
      </View>

      <Modal visible={showDetailModal} transparent animationType="slide" onRequestClose={() => setShowDetailModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
                <Text style={styles.modalTitle}>Partner Details</Text>
                <TouchableOpacity onPress={() => setShowDetailModal(false)} style={{width: 32, height: 32, borderRadius: 16, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center'}}>
                  <MaterialCommunityIcons name="close" size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>

              {selectedPartner && (
                <>
                  <View style={{alignItems: 'center', marginBottom: 24}}>
                    <View style={{width: 80, height: 80, borderRadius: 40, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', marginBottom: 12}}>
                      <MaterialCommunityIcons name="recycle" size={40} color="#10b981" />
                    </View>
                    <Text style={{fontSize: 20, fontWeight: '900', color: '#111827', textAlign: 'center'}}>{selectedPartner.name}</Text>
                    <Text style={{fontSize: 14, color: '#6b7280', marginTop: 4}}>{selectedPartner.organization}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="map-marker" size={20} color="#ef4444" />
                      <View style={{flex: 1, marginLeft: 12}}>
                        <Text style={styles.detailLabel}>Address</Text>
                        <Text style={styles.detailValue}>{selectedPartner.address || 'Not available'}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="phone" size={20} color="#10b981" />
                      <View style={{flex: 1, marginLeft: 12}}>
                        <Text style={styles.detailLabel}>Phone</Text>
                        <Text style={styles.detailValue}>{selectedPartner.phone || 'Not available'}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="email" size={20} color="#3b82f6" />
                      <View style={{flex: 1, marginLeft: 12}}>
                        <Text style={styles.detailLabel}>Email</Text>
                        <Text style={styles.detailValue}>{selectedPartner.email || 'Not available'}</Text>
                      </View>
                    </View>

                    <View style={styles.detailRow}>
                      <MaterialCommunityIcons name="recycle-variant" size={20} color="#8b5cf6" />
                      <View style={{flex: 1, marginLeft: 12}}>
                        <Text style={styles.detailLabel}>Supported Waste Types</Text>
                        <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8}}>
                          {(selectedPartner.supportedWasteTypes || []).map(w => (
                            <View key={w} style={styles.chip}><Text style={{fontSize:11, color:'#065f46', fontWeight:'700'}}>{w}</Text></View>
                          ))}
                        </View>
                      </View>
                    </View>
                  </View>

                  <TouchableOpacity style={styles.closeButton} onPress={() => setShowDetailModal(false)}>
                    <Text style={styles.closeButtonText}>Close</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  search: { 
    backgroundColor: '#fff', 
    color: '#111827',
    padding: 14, 
    borderRadius: 12, 
    marginTop: 12, 
    fontSize: 15,
    borderWidth: 1.5, 
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2
  },
  filterChip: { backgroundColor: '#f3f4f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 8 },
  filterChipActive: { backgroundColor: '#10b981' },
  filterChipText: { fontSize: 13, fontWeight: '700', color: '#6b7280' },
  filterChipTextActive: { color: '#fff' },
  partnerCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginTop: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  chip: { backgroundColor: '#ecfdf5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  loadingContainer: { alignItems: 'center', marginTop: 40 },
  loadingText: { marginTop: 12, color: '#6b7280' },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#6b7280', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: '80%' },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#111827' },
  detailSection: { backgroundColor: '#f9fafb', borderRadius: 14, padding: 16 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  detailLabel: { fontSize: 12, color: '#6b7280', fontWeight: '600', marginBottom: 4 },
  detailValue: { fontSize: 14, color: '#111827', fontWeight: '500' },
  closeButton: { backgroundColor: '#10b981', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 20, shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  closeButtonText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});

export default RecyclerPartnersScreen;
