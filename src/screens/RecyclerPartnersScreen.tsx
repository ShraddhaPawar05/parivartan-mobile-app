import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';

type Partner = {
  id: string;
  name: string;
  organization: string;
  supportedWasteTypes: string[];
  verificationStatus: string;
  subscriptionStatus: string;
};

const RecyclerPartnersScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [favorites, setFavorites] = React.useState<Record<string, boolean>>({});
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);

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

  const filtered = partners.filter(p => 
    p.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.supportedWasteTypes || []).join(' ').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScreenWrapper>
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
            style={{marginTop:12}}
            renderItem={({item}) => (
              <TouchableOpacity activeOpacity={0.9} style={styles.partnerCard} onPress={() => (navigation as any).navigate('RecyclerPartnerDetail', { id: item.id, name: item.name })}>
                <View style={{flex:1}}>
                  <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                    <Text style={{fontWeight:'800'}}>{item.name}</Text>
                    <TouchableOpacity onPress={() => setFavorites(f => ({...f, [item.id]: !f[item.id]}))}>
                      <MaterialCommunityIcons name={favorites[item.id] ? 'heart' : 'heart-outline'} size={20} color={favorites[item.id] ? '#ef4444' : '#6b7280'} />
                    </TouchableOpacity>
                  </View>
                  <Text style={{color:'#6b7280', marginTop:6}}>{item.organization}</Text>
                  <View style={{flexDirection:'row', marginTop:10, alignItems:'center'}}>
                    {(item.supportedWasteTypes || []).map(w => (
                      <View key={w} style={styles.chip}><Text style={{fontSize:12, color:'#065f46', fontWeight:'700'}}>{w}</Text></View>
                    ))}
                  </View>
                </View>
              </TouchableOpacity>
            )}
          />
        )}

        <View style={{height: 80}} />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  title: { fontSize: 20, fontWeight: '800' },
  search: { 
    backgroundColor: '#fff', 
    color: '#111827',
    padding: 12, 
    borderRadius: 10, 
    marginTop: 8, 
    borderWidth: 1, 
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2
  },
  partnerCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 12, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 6, elevation: 2 },
  chip: { backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 999, marginRight: 8 },
  loadingContainer: { alignItems: 'center', marginTop: 40 },
  loadingText: { marginTop: 12, color: '#6b7280' },
  emptyContainer: { alignItems: 'center', marginTop: 40 },
  emptyText: { color: '#6b7280', fontSize: 16 },
});

export default RecyclerPartnersScreen;