import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, onSnapshot, updateDoc, doc, serverTimestamp, getDoc, getDocs, increment, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getWasteIcon } from '../constants/wasteIcons';
import { STATUS_FLOW } from '../constants/statusFlow';
import { debugFirestoreData } from '../utils/debugFirestore';
import { sendLocalPushNotification } from '../services/pushNotificationService';

interface Request {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  type: string;
  quantity: number;
  unit?: string;
  status: string;
  location: any;
  imageUrl?: string;
  createdAt: any;
  partnerId: string;
}

const PartnerDashboardScreen: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'wasteRequests'),
      where('partnerId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const reqs: Request[] = [];
      const userCache = new Map<string, { name: string; email: string; phone: string }>();
      
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const userId = data.userId;
        
        if (userId && !userCache.has(userId)) {
          try {
            const userDoc = await getDoc(doc(db, 'users', userId));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              userCache.set(userId, {
                name: userData.fullName || 'Unknown User',
                email: userData.email || 'No email',
                phone: userData.phone || 'No phone'
              });
            } else {
              userCache.set(userId, { name: 'User Not Found', email: '', phone: 'N/A' });
            }
          } catch (error) {
            userCache.set(userId, { name: 'Error Loading', email: '', phone: 'N/A' });
          }
        }
        
        const userDetails = userCache.get(userId) || { name: 'No User ID', email: '', phone: 'N/A' };
        
        reqs.push({ 
          id: docSnap.id, 
          ...data,
          userName: userDetails.name,
          userEmail: userDetails.email,
          userPhone: userDetails.phone
        } as Request);
      }
      
      reqs.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return bTime.getTime() - aTime.getTime();
      });
      
      setRequests(reqs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const updateStatus = async (requestId: string, newStatus: string) => {
    if (newStatus === 'Completed') {
      Alert.alert('Error', 'Use Complete button with points to finish request');
      return;
    }

    try {
      // Get request data
      const requestDoc = await getDoc(doc(db, 'wasteRequests', requestId));
      const requestData = requestDoc.data();
      const userId = requestData?.userId;
      const wasteType = requestData?.type;

      // Update status
      await updateDoc(doc(db, 'wasteRequests', requestId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });

      // Create notification
      let message = '';
      if (newStatus === 'Accepted') {
        message = `Your ${wasteType} waste request has been accepted by the recycler.`;
      } else if (newStatus === 'In Progress') {
        message = `Pickup has been scheduled for your ${wasteType} waste.`;
      }

      if (userId && message) {
        await addDoc(collection(db, 'notifications'), {
          userId,
          type: 'status_update',
          message,
          read: false,
          requestId,
          wasteRequestId: requestId,
          createdAt: serverTimestamp()
        });

        // Send local notification
        await sendLocalPushNotification(
          newStatus === 'Accepted' ? '✅ Request Accepted' : '🚚 Pickup Scheduled',
          message
        );
      }

      Alert.alert('Success', `Status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const completeRequest = async (requestId: string, currentStatus: string) => {
    if (currentStatus !== 'In Progress') {
      Alert.alert('Invalid Action', 'Request must be "In Progress" to complete');
      return;
    }

    try {
      console.log('🔵 Completing request:', requestId);

      // 1️⃣ Fetch wasteRequest document
      const requestDoc = await getDoc(doc(db, 'wasteRequests', requestId));
      if (!requestDoc.exists()) {
        Alert.alert('Error', 'Request not found');
        return;
      }

      // 2️⃣ Extract data
      const requestData = requestDoc.data();
      const wasteType = requestData.type;
      const quantity = requestData.quantity || 0;
      const userId = requestData.userId;

      console.log('📦 Waste Type:', wasteType);
      console.log('📦 Quantity:', quantity, 'kg');
      console.log('📦 User ID:', userId);

      // 3️⃣ Query rewardRules collection
      const rulesQuery = query(
        collection(db, 'rewardRules'),
        where('wasteType', '==', wasteType),
        where('isActive', '==', true)
      );
      const rulesSnapshot = await getDocs(rulesQuery);

      if (rulesSnapshot.empty) {
        console.log('⚠️ No reward rule found for:', wasteType);
        Alert.alert('Error', `No reward rule found for ${wasteType}`);
        return;
      }

      // 4️⃣ Calculate ecoPointsAwarded
      const rule = rulesSnapshot.docs[0].data();
      const pointsPerKg = rule.pointsPerKg || 0;
      const ecoPointsAwarded = Math.round(quantity * pointsPerKg);

      console.log('✅ Matched Rule:', rule.wasteType, '=', pointsPerKg, 'points/kg');
      console.log('✅ Calculation:', quantity, '×', pointsPerKg, '=', ecoPointsAwarded, 'points');

      // 5️⃣ Update wasteRequests document
      await updateDoc(doc(db, 'wasteRequests', requestId), {
        status: 'Completed',
        ecoPointsAwarded: ecoPointsAwarded,
        updatedAt: serverTimestamp()
      });
      console.log('✅ wasteRequests updated: status=Completed, ecoPointsAwarded=', ecoPointsAwarded);

      // 6️⃣ Update user stats
      await updateDoc(doc(db, 'users', userId), {
        ecoPoints: increment(ecoPointsAwarded),
        completedRequests: increment(1),
        totalWasteRecycled: increment(quantity)
      });
      console.log('✅ User stats updated: +', ecoPointsAwarded, 'points, +', quantity, 'kg');

      // 7️⃣ Create notification
      await addDoc(collection(db, 'notifications'), {
        userId,
        type: 'request_completed',
        message: `Your ${wasteType} waste request has been completed! You earned ${ecoPointsAwarded} EcoPoints.`,
        read: false,
        requestId,
        wasteRequestId: requestId,
        createdAt: serverTimestamp()
      });

      // 8️⃣ Send local notification
      await sendLocalPushNotification(
        '🎉 Pickup Completed',
        `Your ${wasteType} waste has been collected. +${ecoPointsAwarded} EcoPoints!`
      );

      Alert.alert('Success', `Request completed! ${ecoPointsAwarded} EcoPoints awarded.`);
    } catch (error) {
      console.error('❌ Error completing request:', error);
      Alert.alert('Error', 'Failed to complete request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Assigned': return '#f97316';
      case 'Accepted': return '#3b82f6';
      case 'In Progress': return '#8b5cf6';
      case 'Completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getNextAction = (status: string) => {
    switch (status) {
      case 'Assigned': return 'Accept';
      case 'Accepted': return 'Start Pickup';
      case 'In Progress': return 'Complete';
      default: return null;
    }
  };

  const getNextStatus = (status: string) => {
    const currentIndex = STATUS_FLOW.indexOf(status);
    return currentIndex >= 0 && currentIndex < STATUS_FLOW.length - 1 ? STATUS_FLOW[currentIndex + 1] : null;
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading requests...</Text>
      </View>
    );
  }

  const activeRequests = requests.filter(r => r.status !== 'Completed');
  const completedRequests = requests.filter(r => r.status === 'Completed');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Partner Dashboard</Text>
        <Text style={styles.subtitle}>Manage your waste collection requests</Text>
        <TouchableOpacity 
          style={{ marginTop: 12, backgroundColor: '#3b82f6', padding: 10, borderRadius: 8 }}
          onPress={() => debugFirestoreData()}
        >
          <Text style={{ color: '#fff', fontWeight: '700', textAlign: 'center' }}>🔍 Debug Firestore</Text>
        </TouchableOpacity>
      </View>

      {activeRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Active Requests ({activeRequests.length})</Text>
          {activeRequests.map((req) => (
            <View key={req.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconWrap}>
                  <MaterialCommunityIcons name={getWasteIcon(req.type) as any} size={24} color="#065f46" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.wasteType}>{req.type} Waste</Text>
                  <Text style={styles.userName}>{req.userName}</Text>
                  <Text style={styles.userEmail}>{req.userEmail}</Text>
                  <Text style={styles.phone}>📞 {req.userPhone}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(req.status) }]}>
                  <Text style={styles.statusText}>{req.status}</Text>
                </View>
              </View>

              <View style={styles.details}>
                {req.imageUrl ? (
                  <View style={styles.imageContainer}>
                    <Image 
                      source={{ uri: req.imageUrl }} 
                      style={styles.wasteImage} 
                      resizeMode="cover"
                      onError={(e) => console.log('❌ Image load error:', e.nativeEvent.error)}
                      onLoad={() => console.log('✅ Image loaded:', req.imageUrl)}
                    />
                  </View>
                ) : (
                  <View style={[styles.imageContainer, { backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' }]}>
                    <MaterialCommunityIcons name="image-off" size={48} color="#d1d5db" />
                    <Text style={{ color: '#9ca3af', marginTop: 8 }}>No image</Text>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Quantity:</Text>
                  <Text style={styles.value}>{req.quantity} {req.unit || 'kg'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Address:</Text>
                  <Text style={styles.value}>
                    {req.location ? `${req.location.house}, ${req.location.street}, ${req.location.city}` : 'N/A'}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Date:</Text>
                  <Text style={styles.value}>
                    {new Date(req.createdAt?.toDate?.() || req.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>

              {req.status === 'In Progress' && (
                <View style={styles.pointsInfo}>
                  <Text style={styles.label}>EcoPoints will be calculated automatically</Text>
                </View>
              )}

              <View style={styles.actions}>
                {getNextAction(req.status) && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => {
                      if (req.status === 'In Progress') {
                        completeRequest(req.id, req.status);
                      } else {
                        const nextStatus = getNextStatus(req.status);
                        updateStatus(req.id, nextStatus!);
                      }
                    }}
                  >
                    <Text style={styles.actionButtonText}>{getNextAction(req.status)}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      )}

      {completedRequests.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Completed ({completedRequests.length})</Text>
          {completedRequests.map((req) => (
            <View key={req.id} style={[styles.card, styles.completedCard]}>
              <View style={styles.cardHeader}>
                <View style={styles.iconWrap}>
                  <MaterialCommunityIcons name={getWasteIcon(req.type) as any} size={24} color="#065f46" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.wasteType}>{req.type} Waste</Text>
                  <Text style={styles.userName}>{req.userName}</Text>
                </View>
                <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />
              </View>
              <View style={styles.details}>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Quantity:</Text>
                  <Text style={styles.value}>{req.quantity} {req.unit || 'kg'}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Points Awarded:</Text>
                  <Text style={[styles.value, { color: '#10b981', fontWeight: '800' }]}>
                    {(req as any).ecoPointsAwarded || req.quantity * 5}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {requests.length === 0 && (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="inbox" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>No requests yet</Text>
        </View>
      )}

      <View style={{ height: 100 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7f7f7' },
  header: { padding: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  section: { padding: 20 },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginBottom: 12, color: '#111827' },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  completedCard: { opacity: 0.8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconWrap: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center' },
  wasteType: { fontSize: 16, fontWeight: '800', color: '#111827' },
  userName: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  userEmail: { fontSize: 12, color: '#9ca3af', marginTop: 2 },
  phone: { fontSize: 13, color: '#10b981', marginTop: 2, fontWeight: '600' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  details: { marginBottom: 12 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, color: '#6b7280', fontWeight: '600' },
  value: { fontSize: 14, color: '#111827', fontWeight: '500', flex: 1, textAlign: 'right' },
  imageContainer: { marginBottom: 12, borderRadius: 8, overflow: 'hidden' },
  wasteImage: { width: '100%', height: 200, backgroundColor: '#f3f4f6' },
  pointsInfo: { marginBottom: 12, padding: 12, backgroundColor: '#f0fdf4', borderRadius: 8 },
  actions: { flexDirection: 'row', gap: 8 },
  actionButton: { flex: 1, backgroundColor: '#10b981', paddingVertical: 12, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 60 },
  emptyText: { fontSize: 16, color: '#9ca3af', marginTop: 12 },
});

export default PartnerDashboardScreen;
