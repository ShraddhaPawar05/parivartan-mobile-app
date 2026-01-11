import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';

const SAMPLE_PARTNERS = [
  { id: 'p1', name: 'GreenCycle Foundation', desc: 'Recycles plastic & cloth waste. Makes bags and mats.', wastes: ['Plastic', 'Cloth'], rating: 4.6 },
  { id: 'p2', name: 'RePlast India', desc: 'Collects plastic and paper; creates secondary products.', wastes: ['Plastic','Paper'], rating: 4.4 },
  { id: 'p3', name: 'EcoDrop', desc: 'Specialises in E-Waste collection and safe disposal.', wastes: ['E-Waste'], rating: 4.7 },
  { id: 'p4', name: 'RePaper Co.', desc: 'Paper recycling and compostable goods.', wastes: ['Paper'], rating: 4.3 },
];

const RecyclerPartnersScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const [query, setQuery] = React.useState('');
  const [favorites, setFavorites] = React.useState<Record<string, boolean>>({});

  const filtered = SAMPLE_PARTNERS.filter(p => p.name.toLowerCase().includes(query.toLowerCase()) || p.wastes.join(' ').toLowerCase().includes(query.toLowerCase()));

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><MaterialCommunityIcons name="chevron-left" size={24} color="#111827" /></TouchableOpacity>
          <Text style={styles.title}>Recycler Partners</Text>
          <View style={{width:36}} />
        </View>

        <TextInput placeholder="Search recycler or waste type" value={query} onChangeText={setQuery} style={styles.search} />

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
                <Text style={{color:'#6b7280', marginTop:6}}>{item.desc}</Text>
                <View style={{flexDirection:'row', marginTop:10, alignItems:'center'}}>
                  {item.wastes.map(w => (
                    <View key={w} style={styles.chip}><Text style={{fontSize:12, color:'#065f46', fontWeight:'700'}}>{w}</Text></View>
                  ))}
                  <View style={{flex:1}} />
                  <View style={{flexDirection:'row', alignItems:'center'}}>
                    <MaterialCommunityIcons name="star" size={14} color="#f59e0b" />
                    <Text style={{marginLeft:6, fontWeight:'700'}}>{item.rating}</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />

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
  search: { backgroundColor: '#fff', padding: 12, borderRadius: 10, marginTop: 8, borderWidth: 1, borderColor: '#f1f5f9' },
  partnerCard: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 12, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 6, elevation: 2 },
  chip: { backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 6, borderRadius: 999, marginRight: 8 }
});

export default RecyclerPartnersScreen;