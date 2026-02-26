import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';

type Notification = {
  id: string;
  type: string;
  message: string;
  createdAt: any;
  status: string;
};

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      return;
    }

    const notificationsRef = collection(db, 'notifications');
    const q = query(
      notificationsRef,
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notifList: Notification[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notification));
      
      // Sort by createdAt in JavaScript instead of Firestore
      notifList.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const bTime = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return bTime.getTime() - aTime.getTime();
      });
      
      setNotifications(notifList);
      setLoading(false);
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const renderNotification = ({ item }: { item: Notification }) => {
    const timestamp = item.createdAt?.toDate?.() ? item.createdAt.toDate().toLocaleString() : 'Just now';
    
    return (
      <View style={styles.notificationCard}>
        <View style={styles.iconCircle}>
          <Feather name="check-circle" size={20} color="#10b981" />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.type.replace('_', ' ').toUpperCase()}</Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>{timestamp}</Text>
        </View>
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconCircle}>
        <Feather name="bell-off" size={48} color="#d1d5db" />
      </View>
      <Text style={styles.emptyText}>No notifications yet</Text>
      <Text style={styles.emptySubtext}>We'll notify you when something happens</Text>
    </View>
  );

  return (
    <ScreenWrapper>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderNotification}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={notifications.length === 0 ? styles.emptyList : styles.list}
        />
      )}
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  placeholder: {
    width: 40,
  },
  list: {
    padding: 16,
  },
  emptyList: {
    flex: 1,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 6,
  },
  notificationTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
  },
});

export default NotificationsScreen;
