import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { useRequests } from '../context';
import { useAuth } from '../context/AuthContext';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';

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

  // Subscribe to user data from Firestore
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

  // Fetch real request data from Firestore
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

  const cardBg = '#fff';
  const mutedText = '#6b7280';

  const { signOut } = useAuth();

  const [location, setLocation] = React.useState<any>(null);

  const firstName = fullName.split(' ')[0] || 'User';

  React.useEffect(() => {
    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
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
        // eslint-disable-next-line @typescript-eslint/no-var-requires
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
    <ScrollView contentContainerStyle={{padding:20, paddingBottom: 140}} showsVerticalScrollIndicator={false}>
      {/* User Info */}
      <Text style={[styles.sectionHeader, {marginTop:0}]}>User Info</Text>

      <View style={[styles.profileRow, {marginTop:6}]}>
        <View style={styles.avatar}><Text style={{fontWeight:'800', fontSize:18}}>{firstName.charAt(0).toUpperCase()}</Text></View>
        <View style={{marginLeft:12}}>
          <Text style={{fontWeight:'800', fontSize:18}}>{fullName || 'User'}</Text>
          <Text style={{color:mutedText, marginTop:6}}>{email}</Text>
          <Text style={{fontWeight:'800', marginTop:8, color:'#10b981'}}>{ecoPoints.toLocaleString()} EcoPoints</Text>
        </View>
      </View>

      <View style={{height: 16}} />
      <View style={styles.divider} />

      {/* Insights */}
      <Text style={styles.sectionHeader}>Insights</Text>
      <View style={{flexDirection:'row', justifyContent:'space-between'}}>
        <View style={[styles.card, {flex:1, marginRight:8, backgroundColor: cardBg}]}>
          <Text style={{color:mutedText}}>Requests</Text>
          <Text style={{fontWeight:'800', marginTop:6}}>{totalRequests}</Text>
        </View>
        <View style={[styles.card, {flex:1, marginLeft:8, backgroundColor: cardBg}]}>
          <Text style={{color:mutedText}}>Completed</Text>
          <Text style={{fontWeight:'800', marginTop:6}}>{completedRequests}</Text>
        </View>
      </View>

      {totalKg > 0 && (
        <>
          <View style={{height:12}} />
          <View style={[styles.card, {backgroundColor: cardBg}]}>
            <Text style={{color:mutedText}}>Total Collected</Text>
            <Text style={{fontWeight:'800', marginTop:6}}>{totalKg.toFixed(1)} kg</Text>
          </View>
        </>
      )}

      <View style={{height:12}} />
      <View style={styles.divider} />

      {/* Account */}
      <Text style={styles.sectionHeader}>Account</Text>
      <TouchableOpacity style={styles.action} onPress={() => (navigation as any).navigate('Home', { screen: 'EditProfile' })}>
        <Text style={{fontWeight:'800'}}>Edit Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.action, {marginTop:12}]} onPress={() => navigation.navigate('Rewards' as never)}><Text style={{fontWeight:'800'}}>Rewards</Text></TouchableOpacity>

      <View style={{height:12}} />

      <View style={[styles.card, {paddingVertical:10, paddingHorizontal:12}]}> 
        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
          <View>
            <Text style={{fontWeight:'800'}}>Theme</Text>
            <Text style={{color:mutedText, marginTop:4}}>Switch between Light and Dark</Text>
          </View>
          <View style={{alignItems:'center'}}>
            <Text style={{marginBottom:6}}>{isDark ? 'Dark' : 'Light'}</Text>
            <Switch value={isDark} onValueChange={(v) => setIsDark(v)} />
          </View>
        </View>
      </View>

      <View style={{height:12}} />

      <View style={[styles.card, {padding:12, marginTop:12}]}> 
        <View style={{flexDirection:'row', alignItems:'center', justifyContent:'space-between'}}>
          <View style={{flex:1, marginRight:12}}>
            <Text style={{fontWeight:'800'}}>Pickup location</Text>
            <Text style={{color:mutedText, marginTop:6}}>
              {location ? `${location.house}, ${location.street}, ${location.city} - ${location.pincode}` : 'Not set'}
            </Text>
          </View>
          <TouchableOpacity onPress={() => (navigation as any).navigate('Home', { screen: 'LocationSetup' })}>
            <Text style={{color:'#10b981', fontWeight:'800'}}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{height:12}} />

      {/* Recently Redeemed */}
      {redeemed && redeemed.length > 0 && (
        <View style={{marginTop:6}}>
          <Text style={styles.sectionHeader}>Recently Redeemed</Text>
          {redeemed.map(r => (
            <View key={r.id} style={[styles.card, {padding:12, borderRadius:10, marginTop:12, backgroundColor: cardBg}]}>
              <Text style={{fontWeight:'800'}}>{r.title}</Text>
              <Text style={{color:mutedText, marginTop:6}}>Redeemed on {new Date(r.redeemedAt).toLocaleString()}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={{height:20}} />
      <View style={styles.divider} />

      {/* Logout - MUST be last */}
      <TouchableOpacity onPress={async () => { await signOut(); }} style={styles.logoutWrap}>
        <Text style={styles.logoutText}>Log out</Text>
      </TouchableOpacity>

    </ScrollView>
  </ScreenWrapper>
);
};

const styles = StyleSheet.create({
  sectionHeader: { fontSize:16, fontWeight:'800', marginBottom:12, marginTop:18 },
  profileRow: { flexDirection:'row', alignItems:'center' },
  topRow: { flexDirection:'row', alignItems:'center' },
  avatar: { width:64, height:64, borderRadius:32, backgroundColor:'#fff', alignItems:'center', justifyContent:'center', shadowColor:'#000', shadowOpacity:0.04, shadowRadius:6, elevation:2 },
  card: { backgroundColor:'#fff', padding:12, borderRadius:12 },
  divider: { height:1, backgroundColor:'rgba(0,0,0,0.06)', marginVertical:14, borderRadius:1 },
  action: { backgroundColor:'#fff', padding:14, borderRadius:12 },
  logoutWrap: { marginTop:24, marginBottom:48, backgroundColor:'#fff', padding:14, borderRadius:10, alignItems:'center' },
  logoutText: { color:'#ef4444', fontWeight:'700' }
});

export default ProfileScreen;
