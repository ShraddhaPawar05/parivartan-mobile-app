import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, ActivityIndicator } from 'react-native';
import { BackButton, StarRating } from '../components';
import ScreenWrapper from '../components/ScreenWrapper';
import { getWasteIcon } from '../constants/wasteIcons';
import { calculatePointsForRequest } from '../context/RequestsContext';
import { sendStatusChangeNotification } from '../services/notificationService';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { STATUS_FLOW } from '../constants/statusFlow';
import { normalizeStatus } from '../utils/statusNormalizer';

const RequestDetailsScreen: React.FC = ({ route }: any) => {
  const navigation: any = useNavigation();
  const { id } = route.params || {};
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const previousStatusRef = useRef<string | null>(null);
  const [partnerName, setPartnerName] = useState<string>('—');

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    const requestRef = doc(db, 'wasteRequests', id);
    const unsubscribe = onSnapshot(
      requestRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          data.status = normalizeStatus(data.status);
          
          const previousStatus = previousStatusRef.current;
          const currentStatus = data.status;
          
          console.log('🔵 Request status:', currentStatus);
          console.log('🔵 STATUS_FLOW:', STATUS_FLOW);
          console.log('🔵 Status index:', STATUS_FLOW.indexOf(currentStatus));
          
          if (previousStatus && previousStatus !== currentStatus) {
            const wasteType = data.type || data.wasteType;
            const earnedPoints = data.ecoPointsAwarded;
            const scheduledInfo = data.scheduledDate && data.scheduledTime ? `${data.scheduledDate} ${data.scheduledTime}` : null;
            sendStatusChangeNotification(currentStatus, wasteType, scheduledInfo, earnedPoints);
          }
          
          previousStatusRef.current = currentStatus;
          setRequest(data);
          
          if (data.partnerId) {
            try {
              const partnerDoc = await getDoc(doc(db, 'partners', data.partnerId));
              if (partnerDoc.exists()) {
                setPartnerName(partnerDoc.data().name || '—');
              }
            } catch (error) {
              // Silent fail
            }
          }
        } else {
          setRequest(null);
        }
        setLoading(false);
      },
      (error) => {
        console.error('❌ Error subscribing to request:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <BackButton onPress={() => navigation.goBack()} style={styles.back} />
            <Text style={styles.headerTitle}>Request Details</Text>
            <View style={{width:36}} />
          </View>
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={{ marginTop: 16, color: '#6b7280' }}>Loading request...</Text>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  if (!request) return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} style={styles.back} />
          <Text style={styles.headerTitle}>Request Details</Text>
          <View style={{width:36}} />
        </View>
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '700' }}>Request not found</Text>
          <Text style={{ marginTop: 8, color: '#6b7280', textAlign: 'center' }}>The request you're looking for doesn't exist or has been removed.</Text>
        </View>
      </View>
    </ScreenWrapper>
  );

  const req = request;
  
  const submittedDate = req.createdAt?.toDate?.() ? req.createdAt.toDate() : new Date(req.createdAt);
  const quantity = Number(req.quantity || req.itemCount || 0);
  const wasteCategory = req.type || req.wasteType || req.category || 'Unknown';
  const unit = req.unit || 'kg';
  const pickupAddress = req.location || req.pickupAddress;

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
          <View style={styles.row}><Text style={styles.left}>Waste Type</Text><View style={{flexDirection:'row', alignItems:'center'}}><MaterialCommunityIcons name={getWasteIcon(wasteCategory) as any} size={18} color="#10b981" /><Text style={{marginLeft:8}}>{wasteCategory} Waste</Text></View></View>
          <View style={styles.row}><Text style={styles.left}>Recycler</Text><Text>{partnerName}</Text></View>
          <View style={styles.row}><Text style={styles.left}>Quantity</Text><Text>{quantity} {unit}</Text></View>
          <View style={styles.row}>
            <Text style={styles.left}>Pickup Address</Text>
            <Text style={{textAlign:'right', flex:1, marginLeft:12}}>
              {pickupAddress ? `${pickupAddress.house}, ${pickupAddress.street}, ${pickupAddress.city} - ${pickupAddress.pincode}` : '—'}
            </Text>
          </View>
          <View style={styles.row}><Text style={styles.left}>Submitted</Text><Text>{submittedDate.toLocaleDateString()}</Text></View>
        </View>

        <Text style={styles.section}>Status Timeline</Text>
        <View style={{marginTop:8}}>
          {(() => {
            const currentIndex = STATUS_FLOW.indexOf(req.status);
            const validIndex = currentIndex >= 0 ? currentIndex : 0;
            
            return STATUS_FLOW.map((stepLabel, stepIndex) => {
              const isCompleted = stepIndex < validIndex;
              const isActive = stepIndex === validIndex;
              const isUpcoming = stepIndex > validIndex;
              
              const dotColor = (isCompleted || isActive) ? '#10b981' : '#d1d5db';
              const lineColor = (stepIndex < validIndex) ? '#10b981' : '#e5e7eb';
              const textColor = (isCompleted || isActive) ? '#10b981' : '#6b7280';
              const textWeight = (isCompleted || isActive) ? '700' : '400';
              
              let timestampText = null;
              if (stepLabel === 'Assigned' && req.createdAt) {
                timestampText = new Date(req.createdAt?.toDate?.() || req.createdAt).toLocaleDateString();
              } else if (stepLabel === 'Accepted' && validIndex >= 1 && req.updatedAt) {
                timestampText = new Date(req.updatedAt?.toDate?.() || req.updatedAt).toLocaleDateString();
              } else if (stepLabel === 'In Progress' && req.scheduledDate && req.scheduledTime) {
                timestampText = `${req.scheduledDate}, ${req.scheduledTime}`;
              } else if (stepLabel === 'Completed' && req.status === 'Completed' && req.updatedAt) {
                timestampText = new Date(req.updatedAt?.toDate?.() || req.updatedAt).toLocaleDateString();
              }
              
              return (
                <View key={stepLabel} style={styles.timelineItem}>
                  <View style={styles.timelineLeft}>
                    <View style={[
                      styles.timelineIcon, 
                      { 
                        backgroundColor: dotColor,
                        borderWidth: isActive ? 4 : 0,
                        borderColor: isActive ? '#d1fae5' : 'transparent',
                        transform: isActive ? [{ scale: 1.2 }] : [{ scale: 1 }]
                      }
                    ]} />
                    {stepIndex < 3 && <View style={[styles.timelineLine, { backgroundColor: lineColor }]} />}
                  </View>
                  <View style={{flex:1}}>
                    <Text style={[styles.timelineStatus, { color: textColor, fontWeight: textWeight as any }]}>
                      {stepLabel === 'In Progress' ? 'On the way' : stepLabel}
                    </Text>
                    {timestampText ? (
                      <Text style={styles.timelineAt}>{timestampText}</Text>
                    ) : isUpcoming ? (
                      <Text style={[styles.timelineAt, { fontStyle: 'italic' }]}>Pending</Text>
                    ) : null}
                  </View>
                </View>
              );
            });
          })()}
        </View>

        {/* Rewards Info */}
        <Text style={[styles.section, {marginTop:12}]}>Rewards</Text>
        <View style={{backgroundColor:'#fff', borderRadius:8, padding:12}}>
          {req.status === 'Completed' ? (
            <Text style={{fontWeight:'800', color:'#065f46'}}>+{(req as any).ecoPointsAwarded || calculatePointsForRequest({ category: wasteCategory, quantity, unit })} EcoPoints earned</Text>
          ) : (
            <Text>You will earn EcoPoints when this request is completed by the recycler.</Text>
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
  container: { paddingHorizontal: 20, paddingTop: 20 },
  back: { width: 36, height:36, borderRadius:18, alignItems:'center', justifyContent:'center', backgroundColor:'#fff', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  headerRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', marginBottom:16 },
  headerTitle: { fontSize:20, fontWeight:'800', color: '#111827' },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  card: { backgroundColor:'#fff', borderRadius:14, padding:16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  row: { flexDirection:'row', justifyContent:'space-between', paddingVertical:10 },
  left: { color:'#6b7280' },
  section: { fontWeight:'800', marginTop:16, marginBottom:8 },
  timelineItem: { flexDirection:'row', paddingVertical:12, alignItems:'flex-start' },
  timelineLeft: { width:36, alignItems:'center' },
  timelineIcon: { width:18, height:18, borderRadius:9, marginTop:4 },
  timelineLine: { width:3, flex:1, backgroundColor:'#E5E7EB', marginTop:6, height: '100%' },
  timelineStatus: { fontWeight:'800', fontSize:15, color:'#111827' },
  timelineAt: { color:'#6b7280', marginTop:6, fontSize:13 },
  feedbackInput: { marginTop:10, borderWidth:1, borderColor:'#e5e7eb', borderRadius:8, padding:8, textAlignVertical:'top' },
  devBtn: { backgroundColor: '#10b981', paddingVertical:12, paddingHorizontal:18, borderRadius:10, alignItems:'center', justifyContent:'center', flex: 1 },
});

export default RequestDetailsScreen;