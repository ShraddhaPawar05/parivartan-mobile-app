import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { useRequests } from '../context';
import { useAuth } from '../context/AuthContext';

const ProfileScreen: React.FC = () => {
  const { points, requests, redeemed } = useRequests();
  const navigation = useNavigation();
  // Theme toggle is UI-only placeholder. Do NOT change app colors here.
  const [isDark, setIsDark] = React.useState(false);

  const totalRequests = requests.length;
  const completed = requests.filter(r => r.status === 'Completed').length;
  const collectedKg = requests.filter(r => r.status === 'Completed' && r.unit === 'kg').reduce((s, r) => s + (r.quantity ?? 0), 0);

  // Keep static light-mode colors — the toggle is a UI placeholder only
  const cardBg = '#fff';
  const mutedText = '#6b7280';

  const { signOut } = useAuth();

  return (
  <ScreenWrapper>
    <ScrollView contentContainerStyle={{padding:20, paddingBottom: 140}} showsVerticalScrollIndicator={false}>
      {/* User Info */}
      <Text style={[styles.sectionHeader, {marginTop:0}]}>User Info</Text>

      <View style={[styles.profileRow, {marginTop:6}]}>
        <View style={styles.avatar}><Text style={{fontWeight:'800', fontSize:18}}>P</Text></View>
        <View style={{marginLeft:12}}>
          <Text style={{fontWeight:'800', fontSize:18}}>Priya Sharma</Text>
          <Text style={{color:mutedText, marginTop:6}}>priya@example.com</Text>
          <Text style={{fontWeight:'800', marginTop:8, color:'#10b981'}}>{points.toLocaleString()} EcoPoints</Text>
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
          <Text style={{fontWeight:'800', marginTop:6}}>{completed}</Text>
        </View>
      </View>

      <View style={{height:12}} />
      <View style={[styles.card, {backgroundColor: cardBg}]}>
        <Text style={{color:mutedText}}>Total Collected</Text>
        <Text style={{fontWeight:'800', marginTop:6}}>{collectedKg} kg</Text>
      </View>

      <View style={{height:12}} />
      <View style={styles.divider} />

      {/* Account */}
      <Text style={styles.sectionHeader}>Account</Text>
      <TouchableOpacity style={styles.action} onPress={() => alert('Edit profile')}><Text style={{fontWeight:'800'}}>Edit Profile</Text></TouchableOpacity>

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
