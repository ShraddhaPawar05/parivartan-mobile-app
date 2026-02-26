// Add this to your navigation to test
// Test what status values are actually in Firebase

import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';
import * as Notifications from 'expo-notifications';

export default function TestScreen() {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user?.uid) return;
    const q = query(collection(db, 'wasteRequests'), where('userId', '==', user.uid));
    const snap = await getDocs(q);
    const first = snap.docs[0];
    if (first) {
      const d = { id: first.id, ...first.data() };
      setData(d);
      console.log('FIREBASE DATA:', JSON.stringify(d, null, 2));
    }
  };

  const testNotif = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚚 Test Notification',
        body: 'Testing scheduled pickup notification',
        sound: true,
      },
      trigger: null,
    });
    Alert.alert('Sent!');
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Test Screen</Text>
      {data && (
        <>
          <Text>Status: {data.status}</Text>
          <Text>Type: {data.type}</Text>
          <Text>ScheduledAt: {data.scheduledAt ? 'EXISTS' : 'NULL'}</Text>
        </>
      )}
      <Button title="Test Notification" onPress={testNotif} />
      <Button title="Reload Data" onPress={loadData} />
    </View>
  );
}
