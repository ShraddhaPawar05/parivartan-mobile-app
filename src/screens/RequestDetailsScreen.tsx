  import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { BackButton, StarRating } from '../components';
import ScreenWrapper from '../components/ScreenWrapper';
import { getWasteIcon } from '../constants/wasteIcons';
import { calculatePointsForRequest, useRequests } from '../context/RequestsContext';

const RequestDetailsScreen: React.FC = ({ route }: any) => {
  const navigation: any = useNavigation();
  const { id, item } = route.params || {};
  const { getRequestById } = useRequests();
  // Prefer passed item (from demo list) else fall back to stored request
  const req = item ?? getRequestById(id);

  if (!req) return (
    <ScreenWrapper>
      <Text style={{padding:20}}>Request not found.</Text>
    </ScreenWrapper>
  );

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} style={styles.back} />
          <Text style={styles.headerTitle}>Request Details</Text>
          <View style={{width:36}} />
        </View>

        {/* Summary Card */}
        <View style={styles.card}>
          <View style={styles.row}><Text style={styles.left}>Waste Type</Text><View style={{flexDirection:'row', alignItems:'center'}}><MaterialCommunityIcons name={getWasteIcon(req.category) as any} size={18} color="#10b981" /><Text style={{marginLeft:8}}>{req.category} Waste</Text></View></View>
          <View style={styles.row}><Text style={styles.left}>Recycler</Text><Text>{req.selectedPartner?.name ?? '—'}</Text></View>
          <View style={styles.row}><Text style={styles.left}>Quantity</Text><Text>{req.quantity} {req.unit === 'items' ? 'items' : req.unit}</Text></View>
          <View style={styles.row}><Text style={styles.left}>Pickup Address</Text><Text>{req.pickupAddress ? `${req.pickupAddress.house}, ${req.pickupAddress.street}, ${req.pickupAddress.city}` : '—'}</Text></View>
          <View style={styles.row}><Text style={styles.left}>Submitted</Text><Text>{new Date(req.createdAt).toLocaleDateString()}</Text></View>
        </View>

        {/* Status Timeline (vertical) */}
        <Text style={styles.section}>Status Timeline</Text>
        <View style={{marginTop:8}}>
          {['Submitted','Accepted','In Progress','Completed'].map((s, i) => {
            const currentIdx = ['Submitted','Accepted','In Progress','Completed'].indexOf(req.status);
            const done = i < currentIdx;
            const active = i === currentIdx;
            return (
              <View key={s} style={styles.timelineItem}>
                <View style={styles.timelineLeft}>
                  <View style={[styles.timelineIcon, done ? {backgroundColor:'#10b981'} : active ? {borderWidth:2,borderColor:'#10b981', backgroundColor:'#fff'} : {backgroundColor:'#f1f5f9'}]} />
                  {i < 3 && <View style={[styles.timelineLine, done ? {backgroundColor:'#10b981'} : null]} />}
                </View>
                <View style={{flex:1}}>
                  <Text style={[styles.timelineStatus, active ? {color:'#10b981'} : null]}>{s === 'In Progress' ? 'On the way' : s}</Text>
                  <Text style={styles.timelineAt}>{(() => { const e = req.timeline.find((t: any) => t.status === s); return e ? new Date(e.at).toLocaleString() : ''; })()}</Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Rewards Info */}
        <Text style={[styles.section, {marginTop:12}]}>Rewards</Text>
        <View style={{backgroundColor:'#fff', borderRadius:8, padding:12}}>
          {req.status === 'Completed' ? (
            <Text style={{fontWeight:'800', color:'#065f46'}}>+{calculatePointsForRequest(req)} EcoPoints earned</Text>
          ) : (
            <Text>You will earn <Text style={{color:'#10b981', fontWeight:'800'}}>{calculatePointsForRequest(req)} EcoPoints</Text> when this request is completed.</Text>
          )}
        </View>

        {/* Feedback (completed only) */}
        {req.status === 'Completed' && (
          <View>
            <Text style={[styles.section, {marginTop:16}]}>Help us improve — rate your experience</Text>
            <View style={{marginTop:8, backgroundColor:'#fff', padding:12, borderRadius:8}}>
              <StarRating />
              <TextInput placeholder="Write a short review (optional)" style={styles.feedbackInput} multiline numberOfLines={3} />
            </View>
          </View>
        )}

        <View style={{height: 80}} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7f7f7' },
  container: { padding: 20 },
  back: { width: 36, height:36, borderRadius:18, alignItems:'center', justifyContent:'center', backgroundColor:'#fff' },
  headerRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:12 },
  headerTitle: { fontSize:18, fontWeight:'800' },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  card: { backgroundColor:'#fff', borderRadius:12, padding:12 },
  row: { flexDirection:'row', justifyContent:'space-between', paddingVertical:10 },
  left: { color:'#6b7280' },
  section: { fontWeight:'800', marginTop:16, marginBottom:8 },
  timelineItem: { flexDirection:'row', paddingVertical:12, alignItems:'flex-start' },
  timelineLeft: { width:36, alignItems:'center' },
  timelineIcon: { width:14, height:14, borderRadius:7, marginTop:6 },
  timelineLine: { width:2, flex:1, backgroundColor:'#e6eef3', marginTop:6, height: '100%' },
  timelineStatus: { fontWeight:'800' },
  timelineAt: { color:'#6b7280', marginTop:6 },
  feedbackInput: { marginTop:10, borderWidth:1, borderColor:'#e5e7eb', borderRadius:8, padding:8, textAlignVertical:'top' },
  devBtn: { backgroundColor: '#10b981', paddingVertical:12, paddingHorizontal:18, borderRadius:10, alignItems:'center', justifyContent:'center', flex: 1 },
});

export default RequestDetailsScreen;