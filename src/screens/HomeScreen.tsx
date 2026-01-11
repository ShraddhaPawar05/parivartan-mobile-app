import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import Card from '../components/ui/Card';
import { getWasteIcon } from '../constants/wasteIcons';
import { useRequests } from '../context';

  const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { points } = useRequests();

  const [displayPoints, setDisplayPoints] = React.useState<number>(points);
  const animPoints = React.useRef(new Animated.Value(points)).current;
  React.useEffect(() => {
    Animated.timing(animPoints, { toValue: points, duration: 700, useNativeDriver: false }).start();
    const id = animPoints.addListener(({ value }: { value: number }) => setDisplayPoints(Math.round(value)));
    return () => animPoints.removeListener(id);
  }, [points]);

  const recent = [
    { id: '1', category: 'Plastic', title: 'Plastic Waste Pickup', subtitle: 'Today, 10:30 AM', points: '+50 pts', status: 'Completed' },
    { id: '2', category: 'E-waste', title: 'E-Waste Drop-off', subtitle: 'Yesterday', points: '', status: 'Pending' },
  ];

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>P</Text>
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.greetingCol}>
              <Text style={styles.greetingSmall}>Good Morning,</Text>
              <Text style={styles.greetingName}>Priya!</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.bell} activeOpacity={0.8}>
            <Feather name="bell" size={20} color="#111827" />
            <View style={styles.bellDot} />
          </TouchableOpacity>
        </View>

        {/* Points Card (gradient) */}
        <LinearGradient
          colors={["#22c55e", "#10b981"]}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.pointsCard}
        >
          <MaterialCommunityIcons name="leaf" size={160} color="rgba(255,255,255,0.06)" style={{position:'absolute', right:-20, top:-30}} />
          <View style={styles.pointsHeader}>
            <MaterialCommunityIcons name="leaf" size={16} color="rgba(255,255,255,0.95)" />
            <Text style={styles.pointsTitle}>GREEN POINTS BALANCE</Text>
          </View>

          <Animated.Text style={styles.pointsAmount}>{displayPoints.toLocaleString()}</Animated.Text>

          <Text style={styles.impactLabel}>Your monthly impact</Text>
          <Text style={styles.impactText}>You've saved 12kg of CO2!</Text>

          <TouchableOpacity style={styles.viewDetails} activeOpacity={0.9}>
            <Text style={styles.viewDetailsText}>View Details  →</Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Quick Actions */}
        <View style={[styles.sectionHeaderRow, {marginTop:12}]}> 
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={[styles.quickRow, {marginTop:16}] }>
          <TouchableOpacity style={styles.quickCard} activeOpacity={0.9} onPress={() => (navigation as any).navigate('RecyclerPartners')}>
            <View style={styles.quickIconBg}><MaterialCommunityIcons name="account-group" size={18} color="#10b981" /></View>
            <Text style={styles.quickText}>Recycler
Partners</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickCard} activeOpacity={0.9} onPress={() => (navigation as any).navigate('MyImpact')}>
            <View style={styles.quickIconBg}><MaterialCommunityIcons name="chart-line" size={20} color="#10b981" /></View>
            <Text style={styles.quickText}>My
Impact</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Eco-Tips */}
        <Text style={[styles.sectionTitle, {marginTop:18}]}>Daily Eco-Tips</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop:16, marginBottom:12}}>
          <Card style={[styles.tipCard, {marginTop:8}] }>
            <MaterialCommunityIcons name="leaf" size={36} color="#10b981" style={{position:'absolute', right:12, top:12}} />
            {/* subtle right-side illustration */}
            <MaterialCommunityIcons name="leaf" size={56} color="rgba(16,185,129,0.06)" style={{position:'absolute', right:12, bottom:12}} />
            <View style={styles.tipBadge}><Text style={styles.tipBadgeText}>DID YOU KNOW?</Text></View>
            <Text style={styles.tipText}>Recycling one aluminum can saves enough energy to run a TV for 3 hours.</Text>
          </Card>

          <Card style={[styles.tipCard, {marginLeft: 12, marginTop:8, backgroundColor: '#1f2937'}]}>
            <MaterialCommunityIcons name="lightbulb-on-outline" size={36} color="#fff" style={{position:'absolute', right:12, top:12}} />
            {/* subtle right-side illustration */}
            <MaterialCommunityIcons name="leaf" size={56} color="rgba(255,255,255,0.04)" style={{position:'absolute', right:12, bottom:12}} />
            <View style={[styles.tipBadge, {backgroundColor: '#111827'}]}><Text style={[styles.tipBadgeText, {color: '#fff'}]}>TIP OF THE DAY</Text></View>
            <Text style={[styles.tipText, {color: '#fff'}]}>Switch to reusable bags to reduce plastic waste.</Text>
          </Card>
        </ScrollView>

        {/* Recent Activity */}
        <View style={styles.recentHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <Text style={styles.viewAll}>View All</Text>
        </View>

        {recent.map(item => {
          const icon = getWasteIcon(item.category);
          return (
            <View key={item.id} style={styles.activityItem}>
              <View style={styles.activityLeft}>
                <View style={styles.activityIcon}><MaterialCommunityIcons name={icon as any} size={18} color="#10b981" /></View>
                <View style={{marginLeft: 12}}>
                  <Text style={styles.activityTitle}>{item.title}</Text>
                  <Text style={styles.activityDate}>{item.subtitle}</Text>
                </View>
              </View>

              <View style={{alignItems: 'flex-end'}}>
                {item.points ? <Text style={styles.activityPoints}>{item.points}</Text> : null}
                <View style={[styles.statusBadge, item.status === 'Completed' ? {backgroundColor: '#ecfdf5'} : {backgroundColor: '#fff7ed'}]}>
                  <Text style={[styles.statusText, item.status === 'Completed' ? {color: '#10b981'} : {color: '#f97316'}]}>{item.status}</Text>
                </View>
              </View>
            </View>
          );
        })}

        <View style={{height: 120}} />
      </ScrollView>


    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7f7f7' },
  container: {
    paddingHorizontal: 16,
    paddingTop: 22,
    paddingBottom: 48,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  avatarRow: { flexDirection: 'row', alignItems: 'center' },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  avatarInitial: { fontSize: 16, fontWeight: '700', color: '#111827' },
  onlineDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#10b981', position: 'absolute', right: -2, bottom: -2, borderWidth: 2, borderColor: '#fff' },
  greetingCol: { marginLeft: 12 },
  greetingSmall: { fontSize: 12, color: '#6b7280' },
  greetingName: { fontSize: 18, fontWeight: '800', color: '#111827' },
  bell: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  bellDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', position: 'absolute', right: 6, top: 8 },

  pointsCard: {
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 20,
    marginBottom: 28, // increased spacing to separate from Daily Eco-Tips
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  pointsHeader: { flexDirection: 'row', alignItems: 'center' },
  pointsTitle: { color: 'rgba(255,255,255,0.95)', fontSize: 12, fontWeight: '800', marginLeft: 10, letterSpacing: 0.6 },
  pointsAmount: { color: '#fff', fontSize: 56, fontWeight: '900', marginTop: 6 },
  impactLabel: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 8 },
  impactText: { color: 'rgba(255,255,255,0.95)', fontWeight: '800', marginTop: 6 },
  viewDetails: { backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 22, borderRadius: 999, alignSelf: 'center', marginTop: 16, width: '70%', alignItems: 'center' },
  viewDetailsText: { color: '#065f46', fontWeight: '800', textAlign: 'center' },

  sectionHeaderRow: { marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },

  quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  quickCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, width: '48%', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  quickIconBg: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  quickText: { marginTop: 10, fontSize: 14, fontWeight: '700', color: '#111827' },

  fullPill: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginTop: 12, marginBottom: 18, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  pillIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#fff7ed', alignItems: 'center', justifyContent: 'center' },
  pillTitle: { fontWeight: '700', color: '#111827' },
  pillSubtitle: { fontSize: 12, color: '#6b7280' },

  tipCard: { width: 320, height: 160, borderRadius: 14, padding: 16, justifyContent: 'flex-end' },
  tipBadge: { backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 8 },
  tipBadgeText: { fontSize: 11, color: '#10b981', fontWeight: '800' },
  tipText: { color: '#111827', fontSize: 18, fontWeight: '800' },

  recentHeaderRow: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  viewAll: { color: '#10b981', fontWeight: '700' },

  activityItem: { backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  activityLeft: { flexDirection: 'row', alignItems: 'center' },
  activityIcon: { width: 44, height: 44, borderRadius: 10, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center' },
  activityTitle: { fontWeight: '700', color: '#111827' },
  activityDate: { color: '#6b7280', marginTop: 4 },
  activityPoints: { color: '#10b981', fontWeight: '700' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 6, borderRadius: 8, marginTop: 6 },
  statusText: { fontWeight: '700' },


});

export default HomeScreen;
