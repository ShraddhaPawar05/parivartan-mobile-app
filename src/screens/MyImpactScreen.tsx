import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Animated } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import Card from '../components/ui/Card';
import { useRequests } from '../context';
import { useAuth } from '../context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const MyImpactScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const { requests } = useRequests();
  const { user } = useAuth();
  const [ecoPoints, setEcoPoints] = React.useState<number>(0);
  const [totalRequests, setTotalRequests] = React.useState<number>(0);
  const [completedRequests, setCompletedRequests] = React.useState<number>(0);
  const [totalWasteRecycled, setTotalWasteRecycled] = React.useState<number>(0);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 8, useNativeDriver: true })
    ]).start();
  }, []);

  React.useEffect(() => {
    if (!user?.uid) return;
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setEcoPoints(data.ecoPoints ?? 0);
        setTotalRequests(data.totalRequests ?? 0);
        setCompletedRequests(data.completedRequests ?? 0);
        setTotalWasteRecycled(data.totalWasteRecycled ?? 0);
      }
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const totalKg = totalWasteRecycled;
  const totalPickups = completedRequests;
  
  // Logical environmental calculations
  const co2Saved = Math.round(totalKg * 2.5 * 10) / 10; // 2.5kg CO2 per kg waste
  const treesEquivalent = Math.floor(co2Saved / 21); // 1 tree absorbs ~21kg CO2/year
  const waterSaved = Math.round(totalKg * 50); // 50L water per kg waste
  const energySaved = Math.round(totalKg * 1.8); // 1.8 kWh per kg
  const landfillSaved = totalKg; // Direct kg saved from landfill

  const breakdown = ['plastic', 'cloth', 'e-waste', 'metal']
    .map(cat => ({
      name: cat === 'e-waste' ? 'E-waste' : cat.charAt(0).toUpperCase() + cat.slice(1),
      qty: requests.filter(r => r.status === 'Completed' && r.type?.toLowerCase() === cat).reduce((s, r) => s + (r.quantity || 0), 0),
    }))
    .filter(b => b.qty > 0);

  // Milestones based on EcoPoints
  const milestones = [100, 250, 500, 1000, 2500, 5000, 10000];
  const nextMilestone = milestones.find(m => m > ecoPoints) || milestones[milestones.length - 1];
  const prevMilestone = milestones.filter(m => m <= ecoPoints).pop() || 0;
  const progressToNextMilestone = ((ecoPoints - prevMilestone) / (nextMilestone - prevMilestone)) * 100;

  // Dynamic motivational quotes based on impact
  const getQuote = () => {
    if (totalKg === 0) return { text: "Start your journey to a greener tomorrow", emoji: "🌱" };
    if (totalKg < 5) return { text: "Small steps lead to big changes", emoji: "🌿" };
    if (totalKg < 20) return { text: "You're building momentum for the planet", emoji: "🌍" };
    if (totalKg < 50) return { text: "Your impact is growing stronger every day", emoji: "💚" };
    if (totalKg < 100) return { text: "You're a sustainability champion", emoji: "🏆" };
    return { text: "Incredible! You're transforming the future", emoji: "⭐" };
  };

  const quote = getQuote();

  // Achievement badges
  const badges = [
    { unlocked: totalPickups >= 1, icon: 'leaf', label: 'First Step', color: '#10b981' },
    { unlocked: totalKg >= 10, icon: 'tree', label: '10kg Hero', color: '#059669' },
    { unlocked: totalPickups >= 5, icon: 'recycle', label: 'Eco Warrior', color: '#0d9488' },
    { unlocked: totalKg >= 50, icon: 'earth', label: 'Planet Saver', color: '#0891b2' },
  ].filter(b => b.unlocked);

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>My Impact</Text>
          <View style={{width:36}} />
        </View>

        <Animated.View style={{opacity: fadeAnim, transform: [{scale: scaleAnim}]}}>
          {/* Motivational Quote */}
          <Card style={styles.quoteCard}>
            <Text style={styles.quoteEmoji}>{quote.emoji}</Text>
            <Text style={styles.quoteText}>{quote.text}</Text>
          </Card>

          {/* Hero Stats */}
          <View style={styles.heroSection}>
            <View style={styles.mainStatCard}>
              <View style={styles.liveIndicatorTop}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
              <MaterialCommunityIcons name="delete-variant" size={36} color="#10b981" />
              <Text style={styles.mainStatValue}>{totalKg.toFixed(1)}</Text>
              <Text style={styles.mainStatLabel}>kg Recycled</Text>
              <Text style={styles.mainStatSub}>{totalPickups} pickups</Text>
            </View>
            
            <View style={styles.mainStatCard}>
              <MaterialCommunityIcons name="star-circle" size={36} color="#f59e0b" />
              <Text style={styles.mainStatValue}>{ecoPoints.toLocaleString()}</Text>
              <Text style={styles.mainStatLabel}>EcoPoints</Text>
              <Text style={styles.mainStatSub}>Keep earning!</Text>
            </View>
          </View>

          {/* Achievement Badges */}
          {badges.length > 0 && (
            <View style={styles.badgesSection}>
              <Text style={styles.sectionTitle}>🏅 Achievements</Text>
              <View style={styles.badgesRow}>
                {badges.map((badge, i) => (
                  <View key={i} style={[styles.badge, {backgroundColor: badge.color}]}>
                    <MaterialCommunityIcons name={badge.icon as any} size={20} color="#fff" />
                    <Text style={styles.badgeLabel}>{badge.label}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Environmental Impact */}
          {totalKg > 0 && (
            <>
              <Text style={[styles.sectionTitle, {marginTop: 24}]}>🌍 Environmental Impact</Text>
              <View style={styles.impactGrid}>
                <Card style={styles.impactCard}>
                  <MaterialCommunityIcons name="cloud-outline" size={32} color="#3b82f6" />
                  <Text style={styles.impactValue}>{co2Saved}</Text>
                  <Text style={styles.impactUnit}>kg CO₂</Text>
                  <Text style={styles.impactLabel}>Emissions Prevented</Text>
                </Card>
                <Card style={styles.impactCard}>
                  <MaterialCommunityIcons name="pine-tree" size={32} color="#10b981" />
                  <Text style={styles.impactValue}>{treesEquivalent}</Text>
                  <Text style={styles.impactUnit}>trees</Text>
                  <Text style={styles.impactLabel}>Annual Equivalent</Text>
                </Card>
                <Card style={styles.impactCard}>
                  <MaterialCommunityIcons name="water" size={32} color="#06b6d4" />
                  <Text style={styles.impactValue}>{waterSaved}</Text>
                  <Text style={styles.impactUnit}>liters</Text>
                  <Text style={styles.impactLabel}>Water Conserved</Text>
                </Card>
                <Card style={styles.impactCard}>
                  <MaterialCommunityIcons name="lightning-bolt" size={32} color="#f59e0b" />
                  <Text style={styles.impactValue}>{energySaved}</Text>
                  <Text style={styles.impactUnit}>kWh</Text>
                  <Text style={styles.impactLabel}>Energy Saved</Text>
                </Card>
              </View>

              {/* Fun Fact */}
              <Card style={styles.funFactCard}>
                <MaterialCommunityIcons name="lightbulb-on" size={24} color="#f59e0b" />
                <View style={{flex: 1, marginLeft: 12}}>
                  <Text style={styles.funFactTitle}>Did you know?</Text>
                  <Text style={styles.funFactText}>
                    {treesEquivalent > 0 
                      ? `You've saved the equivalent of ${treesEquivalent} tree${treesEquivalent > 1 ? 's' : ''} working for a year!`
                      : `Every kg you recycle prevents 2.5kg of CO₂ emissions!`}
                  </Text>
                </View>
              </Card>
            </>
          )}

          {/* Progress */}
          {totalKg >= 0 && (
            <Card style={styles.progressCard}>
              <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <View style={{flex: 1}}>
                  <Text style={styles.progressTitle}>🎯 Next Milestone</Text>
                  <Text style={styles.progressSubtitle}>
                    {ecoPoints === 0 ? 'Start recycling to unlock' : `${(nextMilestone - ecoPoints).toLocaleString()} points to reach ${nextMilestone.toLocaleString()} points`}
                  </Text>
                </View>
                <View style={styles.milestoneCircle}>
                  <Text style={styles.milestoneText}>{nextMilestone >= 1000 ? `${(nextMilestone/1000).toFixed(0)}k` : nextMilestone}</Text>
                  <Text style={styles.milestoneUnit}>pts</Text>
                </View>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, {width: `${progressToNextMilestone}%`}]} />
              </View>
            </Card>
          )}

          {/* Breakdown */}
          {breakdown.length > 0 && (
            <View style={{marginTop: 24}}>
              <Text style={styles.sectionTitle}>📊 Waste Breakdown</Text>
              <View style={{marginTop: 12}}>
                {breakdown.map(b => {
                  const config = {
                    Plastic: { bg: '#dbeafe', color: '#1e40af', icon: 'bottle-soda', fact: 'Takes 450 years to decompose' },
                    Cloth: { bg: '#fef3c7', color: '#92400e', icon: 'tshirt-crew', fact: 'Saves textile waste' },
                    Metal: { bg: '#e0e7ff', color: '#3730a3', icon: 'gold', fact: '95% energy saved vs new' },
                    'E-waste': { bg: '#fce7f3', color: '#831843', icon: 'cpu-64-bit', fact: 'Recovers precious metals' }
                  }[b.name] || { bg: '#f3f4f6', color: '#374151', icon: 'recycle', fact: 'Great job!' };
                  const percentage = ((b.qty / totalKg) * 100).toFixed(0);
                  return (
                    <Card key={b.name} style={[styles.breakdownCard, {backgroundColor: config.bg}]}>
                      <View style={{flexDirection:'row', alignItems:'center'}}>
                        <View style={[styles.breakdownIcon, {backgroundColor: config.color}]}>
                          <MaterialCommunityIcons name={config.icon as any} size={22} color="#fff" />
                        </View>
                        <View style={{flex:1, marginLeft:14}}>
                          <Text style={[styles.breakdownName, {color: config.color}]}>{b.name}</Text>
                          <Text style={[styles.breakdownFact, {color: config.color}]}>{config.fact}</Text>
                          <View style={styles.breakdownBar}>
                            <View style={[styles.breakdownBarFill, {width: `${percentage}%`, backgroundColor: config.color}]} />
                          </View>
                        </View>
                        <View style={{alignItems:'flex-end', marginLeft: 12}}>
                          <Text style={[styles.breakdownQty, {color: config.color}]}>{b.qty.toFixed(1)}</Text>
                          <Text style={[styles.breakdownUnit, {color: config.color}]}>kg</Text>
                          <Text style={[styles.breakdownPercent, {color: config.color}]}>{percentage}%</Text>
                        </View>
                      </View>
                    </Card>
                  );
                })}
              </View>
            </View>
          )}

          {totalKg === 0 && (
            <Card style={styles.emptyCard}>
              <MaterialCommunityIcons name="sprout" size={48} color="#10b981" />
              <Text style={styles.emptyTitle}>Start Your Green Journey</Text>
              <Text style={styles.emptyText}>Schedule your first pickup and watch your impact grow!</Text>
            </Card>
          )}
        </Animated.View>

        <View style={{height: 100}} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },

  quoteCard: { padding: 18, borderRadius: 16, backgroundColor: '#ecfdf5', marginBottom: 16, alignItems: 'center' },
  quoteEmoji: { fontSize: 32, marginBottom: 8 },
  quoteText: { fontSize: 15, fontWeight: '700', color: '#065f46', textAlign: 'center' },

  heroSection: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  mainStatCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 20, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3 },
  liveIndicatorTop: { position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#10b981', marginRight: 4 },
  liveText: { fontSize: 9, fontWeight: '800', color: '#10b981' },
  mainStatValue: { fontSize: 36, fontWeight: '900', color: '#111827', marginTop: 8 },
  mainStatLabel: { fontSize: 13, color: '#6b7280', marginTop: 4, fontWeight: '600' },
  mainStatSub: { fontSize: 11, color: '#9ca3af', marginTop: 2 },

  badgesSection: { marginBottom: 16 },
  badgesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  badge: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 6 },
  badgeLabel: { fontSize: 11, fontWeight: '700', color: '#fff' },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 4 },

  impactGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 12, marginBottom: 16 },
  impactCard: { width: '48.5%', padding: 16, borderRadius: 14, alignItems: 'center', backgroundColor: '#fff' },
  impactValue: { fontSize: 24, fontWeight: '900', color: '#111827', marginTop: 8 },
  impactUnit: { fontSize: 11, color: '#6b7280', fontWeight: '600', marginTop: 2 },
  impactLabel: { fontSize: 11, color: '#9ca3af', marginTop: 4, textAlign: 'center' },

  funFactCard: { padding: 16, borderRadius: 14, backgroundColor: '#fffbeb', flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  funFactTitle: { fontSize: 13, fontWeight: '800', color: '#92400e', marginBottom: 4 },
  funFactText: { fontSize: 12, color: '#78350f', lineHeight: 18 },

  progressCard: { padding: 18, borderRadius: 16, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 16 },
  progressTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  progressSubtitle: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  milestoneCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#10b981' },
  milestoneText: { fontSize: 20, fontWeight: '900', color: '#10b981' },
  milestoneUnit: { fontSize: 10, color: '#059669', fontWeight: '600' },
  progressBarBg: { height: 10, backgroundColor: '#f1f5f9', borderRadius: 10, overflow: 'hidden', marginTop: 16 },
  progressBarFill: { height: '100%', backgroundColor: '#10b981', borderRadius: 10 },

  breakdownCard: { padding: 16, borderRadius: 14, marginBottom: 10 },
  breakdownIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  breakdownName: { fontSize: 15, fontWeight: '800' },
  breakdownFact: { fontSize: 10, marginTop: 2, opacity: 0.8 },
  breakdownBar: { height: 6, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 3, marginTop: 8, overflow: 'hidden' },
  breakdownBarFill: { height: '100%', borderRadius: 3 },
  breakdownQty: { fontSize: 20, fontWeight: '900' },
  breakdownUnit: { fontSize: 10, fontWeight: '600', marginTop: -2 },
  breakdownPercent: { fontSize: 10, fontWeight: '600', marginTop: 2 },

  emptyCard: { padding: 32, borderRadius: 16, backgroundColor: '#fff', alignItems: 'center', marginTop: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginTop: 16 },
  emptyText: { fontSize: 14, color: '#6b7280', marginTop: 8, textAlign: 'center' }
});

export default MyImpactScreen;
