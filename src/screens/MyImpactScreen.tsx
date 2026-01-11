import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import Card from '../components/ui/Card';
import { useRequests } from '../context';

const MyImpactScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const { points, requests } = useRequests();

  // compute totals from completed requests
  const totalKg = requests.filter(r => r.status === 'Completed').reduce((sum, r) => sum + (r.unit === 'kg' ? r.quantity : r.quantity * 0.5), 0);
  const co2Saved = Math.round(totalKg * 0.7 * 10) / 10; // placeholder conversion

  // breakdown per category
  const breakdown = ['Plastic', 'Cloth', 'E-waste'].map(cat => ({
    name: cat,
    qty: requests.filter(r => r.status === 'Completed' && r.category === cat).reduce((s, r) => s + (r.unit === 'kg' ? r.quantity : r.quantity * 0.5), 0),
  }));

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}><MaterialCommunityIcons name="chevron-left" size={24} color="#111827" /></TouchableOpacity>
          <Text style={styles.title}>My Impact</Text>
          <View style={{width:36}} />
        </View>

        {/* Hero message */}
        <Card style={styles.heroCard}>
          <Text style={styles.heroTitle}>You’re making a real impact 🌱</Text>
          <Text style={styles.heroSubtitle}>Every small action counts toward a greener planet.</Text>
        </Card>

        {/* Main impact card */}
        <Card style={styles.bigCard}>
          <Text style={{color:'#6b7280', fontWeight:'800'}}>EcoPoints</Text>
          <Text style={styles.points}>{points.toLocaleString()}</Text>

          <View style={{flexDirection:'row', marginTop:12, justifyContent:'space-between'}}>
            <View>
              <Text style={{color:'#6b7280'}}>Total waste recycled</Text>
              <Text style={{fontWeight:'800', marginTop:6}}>{totalKg.toFixed(1)} kg</Text>
            </View>
            <View style={{alignItems:'flex-end'}}>
              <Text style={{color:'#6b7280'}}>CO₂ saved</Text>
              <Text style={{fontWeight:'800', marginTop:6}}>{co2Saved} kg</Text>
            </View>
          </View>

          <View style={{marginTop:12}}>
            <Text style={{color:'#6b7280'}}>Equivalent to <Text style={{fontWeight:'800'}}>planting 2 trees</Text></Text>
            <Text style={{color:'#6b7280', marginTop:6}}>Saved energy for <Text style={{fontWeight:'800'}}>3 households</Text></Text>
          </View>
        </Card>

        {/* Progress / Motivation */}
        <Card style={styles.progressCard}>
          <Text style={{fontWeight:'800'}}>Next Milestone</Text>
          <Text style={{color:'#6b7280', marginTop:8}}>Recycle 1 more kg to reach your next reward level</Text>
          <View style={styles.progressBarBg}>
            <View style={[styles.progressBarFill, {width: '55%'}]} />
          </View>
        </Card>

        <Text style={{fontWeight:'800', marginTop:18}}>Impact Breakdown</Text>
        <View style={{marginTop:12}}>
          {breakdown.map(b => {
            const bg = b.name === 'Plastic' ? '#f0fdf4' : b.name === 'Cloth' ? '#fffbeb' : '#eef2ff';
            const helper = b.name === 'Plastic' ? 'Keep going!' : b.name === 'Cloth' ? 'Great start!' : 'Nice work!';
            const icon = b.name === 'Plastic' ? 'bottle-soda' : b.name === 'Cloth' ? 'tshirt-crew' : 'cpu-64-bit';
            return (
              <Card key={b.name} style={[styles.smallCard, {backgroundColor: bg}]}>
                <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                  <View style={{flexDirection:'row', alignItems:'center'}}>
                    <View style={[styles.iconWrap, {backgroundColor: 'rgba(16,185,129,0.08)'}]}>
                      <MaterialCommunityIcons name={icon as any} size={18} color="#10b981" />
                    </View>
                    <View style={{marginLeft:12}}>
                      <Text style={{fontWeight:'800'}}>{b.name}</Text>
                      <Text style={{color:'#6b7280', fontSize:12, marginTop:4}}>{helper}</Text>
                    </View>
                  </View>
                  <Text style={{fontWeight:'800'}}>{b.qty.toFixed(1)} kg</Text>
                </View>
              </Card>
            );
          })}
        </View>

        <View style={{height: 120}} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  title: { fontSize: 20, fontWeight: '800' },

  heroCard: { padding: 14, borderRadius: 12, backgroundColor: '#ecfdf5', marginBottom: 12 },
  heroTitle: { fontSize: 16, fontWeight: '900', color: '#065f46' },
  heroSubtitle: { color: '#065f46', marginTop: 6 },

  bigCard: { padding: 18, borderRadius: 12, backgroundColor: '#fff' },
  points: { fontSize: 32, fontWeight: '900', marginTop: 6, color: '#065f46' },

  progressCard: { padding: 14, borderRadius: 12, backgroundColor: '#fff', marginTop: 14 },
  progressBarBg: { height: 8, backgroundColor: '#f1f5f9', borderRadius: 8, overflow: 'hidden', marginTop: 10 },
  progressBarFill: { height: '100%', backgroundColor: '#10b981' },

  smallCard: { padding: 12, borderRadius: 10, marginTop: 12 },
  iconWrap: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center' }
});

export default MyImpactScreen;