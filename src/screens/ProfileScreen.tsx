import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { useRequests } from '../context';
import { useAuth } from '../context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const ProfileScreen: React.FC = () => {
  const { redeemed } = useRequests();
  const navigation = useNavigation();
  const { user } = useAuth();
  const [isDark, setIsDark] = React.useState(false);
  const [fullName, setFullName] = React.useState<string>('');
  const [email, setEmail] = React.useState<string>('');
  const [ecoPoints, setEcoPoints] = React.useState<number>(0);
  const [totalRequests, setTotalRequests] = React.useState<number>(0);
  const [completedRequests, setCompletedRequests] = React.useState<number>(0);
  const [totalKg, setTotalKg] = React.useState<number>(0);

  React.useEffect(() => {
    if (!user?.uid) return;

    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFullName(data.fullName || '');
        setEmail(data.email || user.email || '');
        setEcoPoints(data.ecoPoints ?? 0);
      } else {
        setEmail(user.email || '');
      }
    }, (error) => {
      console.error('Error fetching user data:', error);
    });

    return () => unsubscribe();
  }, [user?.uid, user?.email]);

  React.useEffect(() => {
    if (!user?.uid) return;

    const fetchRequests = async () => {
      try {
        const { getUserRequests } = require('../services/requestService');
        const requests = await getUserRequests(user.uid);
        setTotalRequests(requests.length);
        const completed = requests.filter((r: any) => r.status === 'Completed');
        setCompletedRequests(completed.length);
        const kg = completed.reduce((sum: number, r: any) => {
          const qty = r.quantity || 0;
          return sum + qty;
        }, 0);
        setTotalKg(kg);
      } catch (error) {
        console.error('Error fetching requests:', error);
      }
    };

    fetchRequests();
  }, [user?.uid]);

  const { signOut } = useAuth();

  const [location, setLocation] = React.useState<any>(null);

  const firstName = fullName.split(' ')[0] || 'User';

  React.useEffect(() => {
    (async () => {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const raw = await AsyncStorage.getItem('@parivartan:location');
        if (raw) {
          const data = JSON.parse(raw);
          setLocation(data);
        }
      } catch (e) {
        // ignore
      }
    })();
  }, []);

  React.useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      try {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        const raw = await AsyncStorage.getItem('@parivartan:location');
        if (raw) {
          const data = JSON.parse(raw);
          setLocation(data);
        }
      } catch (e) {
        // ignore
      }
    });
    return unsubscribe;
  }, [navigation]);

  return (
  <ScreenWrapper>
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* User Card */}
      <LinearGradient colors={['#10b981', '#059669']} start={[0,0]} end={[1,1]} style={styles.userCard}>
        <MaterialCommunityIcons name="leaf" size={120} color="rgba(255,255,255,0.08)" style={{position:'absolute', right:-20, top:-20}} />
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
        </View>
        <Text style={styles.userName}>{fullName || 'User'}</Text>
        <Text style={styles.userEmail}>{email}</Text>
        <View style={styles.pointsBadge}>
          <MaterialCommunityIcons name="star-circle" size={16} color="#f59e0b" />
          <Text style={styles.pointsText}>{ecoPoints.toLocaleString()} EcoPoints</Text>
        </View>
      </LinearGradient>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="recycle" size={28} color="#10b981" />
          <Text style={styles.statValue}>{totalRequests}</Text>
          <Text style={styles.statLabel}>Total Requests</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="check-circle" size={28} color="#3b82f6" />
          <Text style={styles.statValue}>{completedRequests}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="weight-kilogram" size={28} color="#f59e0b" />
          <Text style={styles.statValue}>{totalKg.toFixed(1)}</Text>
          <Text style={styles.statLabel}>kg Recycled</Text>
        </View>
      </View>

      {/* Account Section */}
      <Text style={styles.sectionTitle}>Account Settings</Text>
      
      <TouchableOpacity style={styles.menuItem} onPress={() => (navigation as any).navigate('Home', { screen: 'EditProfile' })}>
        <View style={styles.menuLeft}>
          <View style={[styles.menuIcon, {backgroundColor: '#dbeafe'}]}>
            <MaterialCommunityIcons name="account-edit" size={20} color="#1e40af" />
          </View>
          <Text style={styles.menuText}>Edit Profile</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate('Rewards' as never)}>
        <View style={styles.menuLeft}>
          <View style={[styles.menuIcon, {backgroundColor: '#fef3c7'}]}>
            <MaterialCommunityIcons name="gift" size={20} color="#92400e" />
          </View>
          <Text style={styles.menuText}>Rewards</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuItem} onPress={() => (navigation as any).navigate('Home', { screen: 'MyImpact' })}>
        <View style={styles.menuLeft}>
          <View style={[styles.menuIcon, {backgroundColor: '#ecfdf5'}]}>
            <MaterialCommunityIcons name="chart-line" size={20} color="#059669" />
          </View>
          <Text style={styles.menuText}>My Impact</Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
      </TouchableOpacity>

      {/* Location Card */}
      <View style={styles.locationCard}>
        <View style={styles.locationHeader}>
          <MaterialCommunityIcons name="map-marker" size={20} color="#10b981" />
          <Text style={styles.locationTitle}>Pickup Location</Text>
        </View>
        <Text style={styles.locationText}>
          {location ? `${location.house}, ${location.street}, ${location.city} - ${location.pincode}` : 'Not set'}
        </Text>
        <TouchableOpacity style={styles.editLocationBtn} onPress={() => (navigation as any).navigate('Home', { screen: 'LocationSetup' })}>
          <Text style={styles.editLocationText}>Edit Location</Text>
        </TouchableOpacity>
      </View>

      {/* Preferences */}
      <Text style={styles.sectionTitle}>Preferences</Text>
      
      <View style={styles.themeCard}>
        <View style={styles.themeLeft}>
          <View style={[styles.menuIcon, {backgroundColor: '#f3f4f6'}]}>
            <MaterialCommunityIcons name={isDark ? "moon-waning-crescent" : "white-balance-sunny"} size={20} color="#374151" />
          </View>
          <View>
            <Text style={styles.menuText}>Theme</Text>
            <Text style={styles.themeSubtext}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
          </View>
        </View>
        <Switch value={isDark} onValueChange={setIsDark} trackColor={{true: '#10b981', false: '#d1d5db'}} />
      </View>

      {/* Recently Redeemed */}
      {redeemed && redeemed.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Recently Redeemed</Text>
          {redeemed.map(r => (
            <View key={r.id} style={styles.redeemCard}>
              <MaterialCommunityIcons name="gift" size={24} color="#10b981" />
              <View style={{flex: 1, marginLeft: 12}}>
                <Text style={styles.redeemTitle}>{r.title}</Text>
                <Text style={styles.redeemDate}>{new Date(r.redeemedAt).toLocaleDateString()}</Text>
              </View>
            </View>
          ))}
        </>
      )}

      {/* Logout */}
      <TouchableOpacity onPress={async () => { await signOut(); }} style={styles.logoutBtn}>
        <MaterialCommunityIcons name="logout" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <View style={{height: 100}} />
    </ScrollView>
  </ScreenWrapper>
);
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  header: { marginBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#111827' },

  userCard: { borderRadius: 20, padding: 24, alignItems: 'center', marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#10b981' },
  userName: { fontSize: 22, fontWeight: '800', color: '#fff', marginTop: 8 },
  userEmail: { fontSize: 14, color: 'rgba(255,255,255,0.8)', marginTop: 4 },
  pointsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginTop: 16, gap: 6 },
  pointsText: { fontSize: 14, fontWeight: '800', color: '#111827' },

  statsGrid: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 16, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  statValue: { fontSize: 20, fontWeight: '900', color: '#111827', marginTop: 8 },
  statLabel: { fontSize: 11, color: '#6b7280', marginTop: 4, textAlign: 'center' },

  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 12, marginTop: 8 },

  menuItem: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  menuLeft: { flexDirection: 'row', alignItems: 'center' },
  menuIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  menuText: { fontSize: 15, fontWeight: '700', color: '#111827' },

  locationCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  locationHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  locationTitle: { fontSize: 15, fontWeight: '800', color: '#111827', marginLeft: 8 },
  locationText: { fontSize: 13, color: '#6b7280', lineHeight: 20, marginBottom: 12 },
  editLocationBtn: { backgroundColor: '#ecfdf5', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10, alignSelf: 'flex-start' },
  editLocationText: { fontSize: 13, fontWeight: '700', color: '#10b981' },

  themeCard: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  themeLeft: { flexDirection: 'row', alignItems: 'center' },
  themeSubtext: { fontSize: 12, color: '#6b7280', marginTop: 2 },

  redeemCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  redeemTitle: { fontSize: 14, fontWeight: '700', color: '#111827' },
  redeemDate: { fontSize: 12, color: '#6b7280', marginTop: 4 },

  logoutBtn: { backgroundColor: '#fff', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, borderWidth: 1, borderColor: '#fee2e2', gap: 8 },
  logoutText: { fontSize: 15, fontWeight: '800', color: '#ef4444' }
});

export default ProfileScreen;
