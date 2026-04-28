import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useCallback, useEffect } from 'react';
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
import { useAuth } from '../context/AuthContext';
import { getActiveRequest, getUserRequests, WasteRequest, subscribeToUserRequests } from '../services/requestService';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 22) return 'Good Evening';
  return 'Good Night';
};

const HomeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { points, requests } = useRequests();
  const { user } = useAuth();
  const [activeRequest, setActiveRequest] = useState<WasteRequest | null>(null);
  const [recentRequests, setRecentRequests] = useState<WasteRequest[]>([]);
  const [fullName, setFullName] = useState<string>('');
  const [ecoPoints, setEcoPoints] = useState<number>(0);
  const [unreadCount, setUnreadCount] = useState<number>(0);;

  // Subscribe to user data from Firestore
  React.useEffect(() => {
    if (!user?.uid) return;

    console.log('🔵 HomeScreen: Subscribing to user document:', user.uid);
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('✅ HomeScreen: User data updated, ecoPoints:', data.ecoPoints);
        setFullName(data.fullName || '');
        setEcoPoints(data.ecoPoints ?? 0);
      } else {
        console.log('⚠️ HomeScreen: User document does not exist');
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Subscribe to unread notifications
  React.useEffect(() => {
    if (!user?.uid) return;

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', user.uid),
      where('read', '==', false)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setUnreadCount(snapshot.size);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const loadRequestData = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      const active = await getActiveRequest(user.uid);
      setActiveRequest(active);
      
      const allRequests = await getUserRequests(user.uid);
      const recent = allRequests.slice(0, 2); // Show 2 most recent
      setRecentRequests(recent);
    } catch (error) {
      // Silent fail
    }
  }, [user?.uid]);

  // Set up real-time subscription
  React.useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToUserRequests(
      user.uid,
      (updatedRequests) => {
        // Find active request (not Completed or cancelled)
        const active = updatedRequests.find(req => req.status !== 'Completed' && req.status !== 'cancelled');
        setActiveRequest(active || null);
        
        // Get recent requests
        const recent = updatedRequests.slice(0, 2);
        setRecentRequests(recent);
      },
      (error) => {
        // Silent fail
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const [displayPoints, setDisplayPoints] = React.useState<number>(ecoPoints);
  const animPoints = React.useRef(new Animated.Value(ecoPoints)).current;
  React.useEffect(() => {
    Animated.timing(animPoints, { toValue: ecoPoints, duration: 700, useNativeDriver: false }).start();
    const id = animPoints.addListener(({ value }: { value: number }) => setDisplayPoints(Math.round(value)));
    return () => animPoints.removeListener(id);
  }, [ecoPoints]);

  const greeting = getGreeting();
  const firstName = fullName.split(' ')[0] || 'User';

  const recent = recentRequests.map(req => ({
    id: req.id,
    category: req.type || req.wasteType || 'General',
    title: `${req.type || req.wasteType || 'Waste'} Waste ${req.status === 'pending' ? 'Pickup' : 'Request'}`,
    subtitle: new Date(req.createdAt?.toDate?.() || req.createdAt).toLocaleDateString(),
    points: req.status === 'completed' ? '+50 pts' : '',
    status: req.status === 'pending' ? 'Pending' : req.status.charAt(0).toUpperCase() + req.status.slice(1)
  }));

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.avatarRow}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarInitial}>{firstName.charAt(0).toUpperCase()}</Text>
              <View style={styles.onlineDot} />
            </View>
            <View style={styles.greetingCol}>
              <Text style={styles.greetingSmall}>{greeting},</Text>
              <Text style={styles.greetingName}>{firstName}!</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.bell} activeOpacity={0.8} onPress={() => (navigation as any).navigate('Notifications')}>
            <Feather name="bell" size={20} color="#111827" />
            {unreadCount > 0 && <View style={styles.bellDot} />}
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

          <TouchableOpacity style={styles.viewDetails} activeOpacity={0.9} onPress={() => (navigation as any).navigate('ExploreMore')}>
            <Text style={styles.viewDetailsText}>Explore More  →</Text>
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

          <TouchableOpacity style={styles.quickCard} activeOpacity={0.9} onPress={() => (navigation as any).navigate('Community')}>
            <View style={styles.quickIconBg}><MaterialCommunityIcons name="account-group-outline" size={20} color="#10b981" /></View>
            <Text style={styles.quickText}>Community</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Eco-Tips */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionTitle, {marginTop:18}]}>Daily Eco-Tips</Text>
          <Text style={styles.dailyBadge}>Updates Daily</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{marginTop:16, marginBottom:12}}>
          <LinearGradient colors={['#10b981', '#059669']} start={[0,0]} end={[1,1]} style={[styles.tipCard, {marginTop:8}]}>
            <MaterialCommunityIcons name="recycle" size={80} color="rgba(255,255,255,0.1)" style={{position:'absolute', right:-10, top:-10}} />
            <View style={styles.tipBadge}><Text style={styles.tipBadgeText}>💡 DID YOU KNOW?</Text></View>
            <Text style={[styles.tipText, {color: '#fff'}]}>Recycling 1 ton of paper saves 17 trees and 7,000 gallons of water!</Text>
            <View style={styles.tipFooter}>
              <Text style={styles.tipFooterText}>Impact: High</Text>
            </View>
          </LinearGradient>

          <LinearGradient colors={['#3b82f6', '#2563eb']} start={[0,0]} end={[1,1]} style={[styles.tipCard, {marginLeft: 12, marginTop:8}]}>
            <MaterialCommunityIcons name="water" size={80} color="rgba(255,255,255,0.1)" style={{position:'absolute', right:-10, top:-10}} />
            <View style={[styles.tipBadge, {backgroundColor: 'rgba(255,255,255,0.25)'}]}><Text style={[styles.tipBadgeText, {color: '#fff'}]}>🌊 WATER FACT</Text></View>
            <Text style={[styles.tipText, {color: '#fff'}]}>Recycling plastic saves 50L of water per kg. Every drop counts!</Text>
          </LinearGradient>

          <LinearGradient colors={['#f59e0b', '#d97706']} start={[0,0]} end={[1,1]} style={[styles.tipCard, {marginLeft: 12, marginTop:8}]}>
            <MaterialCommunityIcons name="lightning-bolt" size={80} color="rgba(255,255,255,0.1)" style={{position:'absolute', right:-10, top:-10}} />
            <View style={[styles.tipBadge, {backgroundColor: 'rgba(255,255,255,0.25)'}]}><Text style={[styles.tipBadgeText, {color: '#fff'}]}>⚡ ENERGY TIP</Text></View>
            <Text style={[styles.tipText, {color: '#fff'}]}>Recycling aluminum uses 95% less energy than making new cans from raw materials.</Text>
            <View style={styles.tipFooter}>
              <Text style={styles.tipFooterText}>Save Energy!</Text>
            </View>
          </LinearGradient>

          <LinearGradient colors={['#8b5cf6', '#7c3aed']} start={[0,0]} end={[1,1]} style={[styles.tipCard, {marginLeft: 12, marginTop:8}]}>
            <MaterialCommunityIcons name="earth" size={80} color="rgba(255,255,255,0.1)" style={{position:'absolute', right:-10, top:-10}} />
            <View style={[styles.tipBadge, {backgroundColor: 'rgba(255,255,255,0.25)'}]}><Text style={[styles.tipBadgeText, {color: '#fff'}]}>🌍 PLANET FACT</Text></View>
            <Text style={[styles.tipText, {color: '#fff'}]}>E-waste contains precious metals like gold and silver. Recycling recovers them!</Text>
          </LinearGradient>
        </ScrollView>

        {/* Recent Activity */}
        <View style={styles.recentHeaderRow}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => (navigation as any).navigate('Requests')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {recent.length > 0 ? recent.map(item => {
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
        }) : (
          <View style={styles.activityItem}>
            <Text style={{color: '#6b7280', textAlign: 'center', width: '100%'}}>No recent activity</Text>
          </View>
        )}

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
    marginBottom: 28,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  pointsHeader: { flexDirection: 'row', alignItems: 'center' },
  pointsTitle: { color: 'rgba(255,255,255,0.95)', fontSize: 12, fontWeight: '800', marginLeft: 10, letterSpacing: 0.6 },
  pointsAmount: { color: '#fff', fontSize: 56, fontWeight: '900', marginTop: 6 },
  viewDetails: { backgroundColor: '#fff', paddingVertical: 12, paddingHorizontal: 22, borderRadius: 999, alignSelf: 'center', marginTop: 16, width: '70%', alignItems: 'center' },
  viewDetailsText: { color: '#065f46', fontWeight: '800', textAlign: 'center' },

  sectionHeaderRow: { marginTop: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  dailyBadge: { fontSize: 11, fontWeight: '700', color: '#10b981', backgroundColor: '#ecfdf5', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, marginTop: 18 },

  quickRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  quickCard: { backgroundColor: '#fff', borderRadius: 14, padding: 14, width: '48%', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  quickIconBg: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  quickText: { marginTop: 10, fontSize: 14, fontWeight: '700', color: '#111827' },

  fullPill: { backgroundColor: '#fff', borderRadius: 14, padding: 14, marginTop: 12, marginBottom: 18, alignItems: 'center', justifyContent: 'space-between', flexDirection: 'row', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  pillIcon: { width: 36, height: 36, borderRadius: 8, backgroundColor: '#fff7ed', alignItems: 'center', justifyContent: 'center' },
  pillTitle: { fontWeight: '700', color: '#111827' },
  pillSubtitle: { fontSize: 12, color: '#6b7280' },

  tipCard: { width: 320, height: 180, borderRadius: 16, padding: 18, justifyContent: 'space-between', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  tipBadge: { backgroundColor: 'rgba(255,255,255,0.9)', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, alignSelf: 'flex-start' },
  tipBadgeText: { fontSize: 10, color: '#10b981', fontWeight: '800', letterSpacing: 0.5 },
  tipText: { color: '#fff', fontSize: 16, fontWeight: '800', lineHeight: 24, marginTop: 8 },
  tipFooter: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, alignSelf: 'flex-start', marginTop: 8 },
  tipFooterText: { color: '#fff', fontSize: 11, fontWeight: '700' },

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
