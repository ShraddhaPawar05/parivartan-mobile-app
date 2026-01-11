import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import Card from '../components/ui/Card';
import { getWasteIcon } from '../constants/wasteIcons';
import { useRequests } from '../context/RequestsContext';

// Static sample data for Requests (user-only view)
const SAMPLE_REQUESTS = [
  {
    id: 's1',
    category: 'Plastic',
    quantity: 2,
    unit: 'kg',
    pickupType: 'pickup',
    selectedPartner: { id: 'p1', name: 'GreenCycle Foundation' },
    status: 'Submitted',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    timeline: [{ status: 'Submitted', at: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() }],
  },
  {
    id: 's2',
    category: 'Cloth',
    quantity: 1,
    unit: 'kg',
    pickupType: 'dropoff',
    selectedPartner: { id: 'p2', name: 'RePlast India' },
    status: 'Accepted',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    timeline: [
      { status: 'Submitted', at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
      { status: 'Accepted', at: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString() },
    ],
  },
  {
    id: 's3',
    category: 'E-waste',
    quantity: 1,
    unit: 'items',
    pickupType: 'pickup',
    selectedPartner: { id: 'p3', name: 'EcoDrop' },
    status: 'In Progress',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    timeline: [
      { status: 'Submitted', at: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() },
      { status: 'Accepted', at: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString() },
      { status: 'In Progress', at: new Date(Date.now() - 1000 * 60 * 60 * 46).toISOString() },
    ],
  },
  {
    id: 's4',
    category: 'Paper',
    quantity: 3,
    unit: 'kg',
    pickupType: 'dropoff',
    selectedPartner: { id: 'p4', name: 'RePaper Co.' },
    status: 'Completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    timeline: [
      { status: 'Submitted', at: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString() },
      { status: 'Accepted', at: new Date(Date.now() - 1000 * 60 * 60 * 95).toISOString() },
      { status: 'In Progress', at: new Date(Date.now() - 1000 * 60 * 60 * 94).toISOString() },
      { status: 'Completed', at: new Date(Date.now() - 1000 * 60 * 60 * 93).toISOString() },
    ],
  },
  {
    id: 's5',
    category: 'Metal',
    quantity: 4,
    unit: 'items',
    pickupType: 'pickup',
    selectedPartner: { id: 'p5', name: 'MetalWorks' },
    status: 'Rejected',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    timeline: [
      { status: 'Submitted', at: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString() },
      { status: 'Rejected', at: new Date(Date.now() - 1000 * 60 * 60 * 9).toISOString() },
    ],
  },
];

const RequestsScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const { requests } = useRequests();

  // Find the current active request (not Completed/Rejected)
  const active = (requests || []).filter(r => r.status !== 'Completed' && r.status !== 'Rejected')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const activeItem = active[0];

  // EMPTY STATE: No active request
  if (!activeItem) {
    return (
      <ScreenWrapper>
        <View style={{padding: 20, alignItems: 'center'}}>
          <MaterialCommunityIcons name="recycle" size={88} color="#10b981" />
          <Text style={[styles.title, {marginTop:12}]}>No active requests right now</Text>
          <Text style={[styles.sub, {textAlign: 'center', marginTop:6}]}>Start by identifying waste or exploring recycler partners.</Text>

          <TouchableOpacity style={[styles.cta, {marginTop: 20, width: '84%'}]} onPress={() => navigation.navigate('Identify')}>
            <Text style={styles.ctaText}>Identify Waste</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.secondaryOutline, {marginTop:12, width: '84%'}]} onPress={() => (navigation as any).navigate('RecyclerPartners')}>
            <Text style={styles.secondaryOutlineText}>Explore Recycler Partners</Text>
          </TouchableOpacity>

          <View style={{height: 120}} />
        </View>
      </ScreenWrapper>
    );
  }

  // ACTIVE STATE: show summary card + recent completed & impact
  const item = activeItem;
  const statusOrder = ['Submitted','Accepted','In Progress','Completed'];
  const currentStatusIndex = statusOrder.indexOf(item.status);

  const completed = (requests || []).filter(r => r.status === 'Completed')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const recentCompleted = completed.slice(0, 5);
  const totalKg = completed.reduce((s, r) => s + (r.unit === 'kg' ? r.quantity : r.quantity * 0.5), 0);

  return (
    <ScreenWrapper>
      <View style={{padding: 20}}>
        {/* Active request summary */}
        <Text style={{fontWeight:'800', fontSize:18, marginBottom:12}}>Active Request</Text>
        <Card style={[styles.card, styles.cardActive]}>
          <View style={{flexDirection:'row', alignItems:'flex-start'}}>
            <View style={styles.iconWrap}><MaterialCommunityIcons name={getWasteIcon(item.category) as any} size={24} color="#065f46" /></View>
            <View style={{flex:1, marginLeft:14}}>
              <Text style={styles.wasteTitle}>{item.category} Waste</Text>
              <Text style={styles.partnerName}>{item.selectedPartner?.name ?? 'No recycler chosen'}</Text>

              <View style={styles.statusRow}>
                <Text style={[styles.statusText, item.status === 'In Progress' ? {color:'#f97316'} : item.status === 'Completed' ? {color:'#10b981'} : {color:'#6b7280'}]}>{item.status === 'In Progress' ? 'On the way' : item.status}</Text>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              </View>

              {/* subtle small progress indicator */}
              <View style={styles.trackerRowSmall}>
                {[0,1,2,3].map(i => (
                  <View key={i} style={[styles.trackerDotSmall, i <= currentStatusIndex ? {backgroundColor: '#10b981'} : {backgroundColor:'#e6e6e6'}]} />
                ))}
              </View>

              {/* soft text CTA placed below details */}
              <TouchableOpacity onPress={() => navigation.navigate('RequestDetails', { id: item.id })} style={styles.softCTAWrap}>
                <Text style={styles.softCTA}>View request →</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card> 

        {/* Recent requests (minimal) */}
        {recentCompleted.length > 0 && (
          <View style={{marginTop:18}}>
            <Text style={{fontWeight:'800'}}>Recent Requests</Text>
            {recentCompleted.map(c => (
              <TouchableOpacity key={c.id} activeOpacity={0.9} onPress={() => navigation.navigate('RequestDetails', { id: c.id })}>
                <Card style={{marginTop:12}}>
                  <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                    <View>
                      <Text style={{fontWeight:'800'}}>{c.category} — {c.selectedPartner?.name}</Text>
                      <Text style={{color:'#6b7280', marginTop:6}}>{new Date(c.createdAt).toLocaleDateString()}</Text>
                    </View>
                    <Text style={{color:'#10b981', fontWeight:'800'}}>Completed</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Impact */}
        <View style={{marginTop:18}}>
          <Text style={{fontWeight:'800'}}>Impact from requests</Text>
          <Card style={{marginTop:12}}>
            <Text style={{fontWeight:'800'}}>You’ve recycled {totalKg.toFixed(1)} kg of waste so far 🌱</Text>
            <Text style={{color:'#6b7280', marginTop:6}}>Your actions help reduce landfill waste</Text>
          </Card>
        </View>

        <View style={{height:120}} />
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7f7f7' },
  container: { padding: 20, alignItems: 'center', justifyContent: 'center', flex: 1 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 6 },
  sub: { color: '#6b7280', marginTop: 4 },
  cta: { marginTop: 20, backgroundColor: '#10b981', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 999 },
  ctaText: { color: '#fff', fontWeight: '800' },
  smallBtn: { marginTop: 8, backgroundColor:'#10b981', paddingHorizontal:10, paddingVertical:6, borderRadius:8 },

  card: { backgroundColor: '#fff', borderRadius: 14, padding: 20, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  cardActive: { /* subtle primary weight, prefer white space over bold borders */ padding: 20, minHeight: 128 },
  partnerName: { color:'#6b7280', marginTop:8, fontWeight:'600' },
  statusRow: { flexDirection:'row', justifyContent:'space-between', alignItems:'center', marginTop:10 },
  statusText: { fontWeight:'700' },
  trackerRowSmall: { flexDirection:'row', marginTop:10, alignItems:'center' },
  trackerDotSmall: { width:8, height:8, borderRadius:4, marginRight:8 },
  softCTAWrap: { alignSelf:'flex-end', marginTop:10 },
  softCTA: { color:'#4b5563', fontWeight:'500', fontSize:14 },
  cardCompleted: { backgroundColor: '#f9fffb' },
  cardCancelled: { backgroundColor: '#fff7f7', opacity: 0.95 },
  wasteTitle: { fontWeight: '900', fontSize: 16, color: '#111827' },
  date: { color: '#6b7280', marginTop: 6 },
  partner: { color: '#111827', fontWeight: '700' },
  verified: { backgroundColor:'#10b981', paddingHorizontal:8, paddingVertical:4, borderRadius:8, marginLeft:8 },
  status: { fontWeight: '800', color: '#10b981' },
  creditPill: { backgroundColor:'#ecfdf5', paddingHorizontal:8, paddingVertical:6, borderRadius:8, marginTop:6 },

  segmentWrap: { flexDirection:'row', backgroundColor:'#fff', borderRadius:12, padding:4, position:'relative', marginBottom:12 },
  segmentBtn: { flex:1, alignItems:'center', paddingVertical:10 },
  segmentIndicator: { position:'absolute', left:4, top:4, bottom:4, backgroundColor:'#10b981', borderRadius:10, elevation:2, shadowColor:'#000', shadowOpacity:0.06, shadowRadius:8 },
  segmentText: { fontWeight:'800', color:'#111827' },
  segmentTextActive: { color:'#fff' },
  segmentCount: { color:'#e6f4ea', marginTop:4, color:'#ffffffaa' },

  emptyWrap: { paddingTop: 40, alignItems:'center' },

  trackerRow: { marginTop: 10, flexDirection:'row', alignItems:'center' },
  trackerDot: { width:12, height:12, borderRadius:6, backgroundColor:'#e6e6e6', borderWidth:0 },
  trackerBar: { width:36, height:6, backgroundColor:'#e6e6e6', marginHorizontal:8, borderRadius:4 },

  iconWrap: { width:48, height:48, borderRadius:12, backgroundColor:'#ecfdf5', alignItems:'center', justifyContent:'center' },

  primaryBtn: { backgroundColor:'#10b981', paddingHorizontal:16, paddingVertical:10, borderRadius:10 },
  cancelBtn: { borderWidth:1, borderColor:'#ef4444', paddingHorizontal:14, paddingVertical:8, borderRadius:10 },
  secondaryBtn: { paddingHorizontal:12, paddingVertical:10, borderRadius:10, backgroundColor:'#fff', borderWidth:1, borderColor:'#e6e6e6' },

});

export default RequestsScreen;
