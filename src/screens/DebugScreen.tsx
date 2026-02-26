import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { collection, query, where, getDocs, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { sendStatusChangeNotification } from '../services/notificationService';

const DebugScreen: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    loadRequests();
  }, [user]);

  const loadRequests = async () => {
    if (!user?.uid) return;
    
    const q = query(collection(db, 'wasteRequests'), where('userId', '==', user.uid));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setRequests(data);
  };

  const testNotification = async (status: string, wasteType: string, scheduledAt?: any) => {
    await sendStatusChangeNotification(status, wasteType, scheduledAt);
    Alert.alert('Notification Sent', `Status: ${status}`);
  };

  const updateToInProgress = async (requestId: string) => {
    await updateDoc(doc(db, 'wasteRequests', requestId), {
      status: 'In Progress',
      scheduledAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    Alert.alert('Updated', 'Status changed to In Progress with scheduledAt');
    loadRequests();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Debug Screen</Text>
      
      <Text style={styles.section}>Your Requests:</Text>
      {requests.map(req => (
        <View key={req.id} style={styles.card}>
          <Text style={styles.bold}>ID: {req.id}</Text>
          <Text>Status: {req.status}</Text>
          <Text>Type: {req.type}</Text>
          <Text>ScheduledAt: {req.scheduledAt ? new Date(req.scheduledAt.toDate()).toLocaleString() : 'NULL'}</Text>
          
          <TouchableOpacity 
            style={styles.btn} 
            onPress={() => updateToInProgress(req.id)}
          >
            <Text style={styles.btnText}>Set to In Progress + scheduledAt</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.btn, { backgroundColor: '#3b82f6' }]} 
            onPress={() => testNotification('In Progress', req.type, req.scheduledAt)}
          >
            <Text style={styles.btnText}>Test Notification</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f7f7f7' },
  title: { fontSize: 24, fontWeight: '800', marginBottom: 20 },
  section: { fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 10 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12 },
  bold: { fontWeight: '700', marginBottom: 8 },
  btn: { backgroundColor: '#10b981', padding: 12, borderRadius: 8, marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', textAlign: 'center' },
});

export default DebugScreen;
