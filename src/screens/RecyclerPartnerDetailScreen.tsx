import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import Card from '../components/ui/Card';

const RecyclerPartnerDetailScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const route: any = useRoute();
  const { id, name } = route.params || {};

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><MaterialCommunityIcons name="chevron-left" size={24} color="#111827" /></TouchableOpacity>
          <Text style={styles.title}>{name ?? 'Recycler Partner'}</Text>
          <View style={{width:36}} />
        </View>

        <Card style={styles.card}>
          <Text style={{fontWeight:'800'}}>{name ?? 'Partner details'}</Text>
          <Text style={{color:'#6b7280', marginTop:8}}>Details coming soon — this is a placeholder screen.</Text>
        </Card>

        <View style={{height: 120}} />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  title: { fontSize: 20, fontWeight: '800' },
  card: { padding: 12 }
});

export default RecyclerPartnerDetailScreen;