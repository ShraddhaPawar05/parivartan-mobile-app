import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { collection, query, where, onSnapshot, orderBy, writeBatch, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { useAuth } from '../context/AuthContext';

type Notification = {
  id: string;
  type: string;
  message: string;
  createdAt: any;
  status: string;
  requestId?: string;
  wasteRequestId?: string;
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

      // Mark all unread notifications as read
      const unreadDocs = snapshot.docs.filter(doc => doc.data().read === false);
      if (unreadDocs.length > 0) {
        const batch = writeBatch(db);
        unreadDocs.forEach(docSnap => {
          batch.update(docSnap.ref, { read: true });
        });
        batch.commit().catch(err => console.error('Error marking notifications as read:', err));
      }
    }, (error) => {
      console.error('Error fetching notifications:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const getNotificationIcon = (message: string, type: string, status?: string) => {
    const lowerMessage = message.toLowerCase();
    
    // Check message content for keywords
    if (lowerMessage.includes('accepted')) {
      return { name: 'check-circle', color: '#10b981', bg: '#ecfdf5' };
    }
    if (lowerMessage.includes('scheduled') || lowerMessage.includes('pickup has been scheduled')) {
      return { name: 'clock-outline', color: '#3b82f6', bg: '#eff6ff' };
    }
    if (lowerMessage.includes('completed')) {
      return { name: 'check-all', color: '#8b5cf6', bg: '#f5f3ff' };
    }
    if (lowerMessage.includes('available') || type === 'availability_confirmation') {
      return { name: 'calendar-clock', color: '#f59e0b', bg: '#fef3c7' };
    }
    
    return { name: 'bell', color: '#6b7280', bg: '#f3f4f6' };
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const timestamp = item.createdAt?.toDate?.() ? item.createdAt.toDate().toLocaleString() : 'Just now';
    
    // Debug log
    console.log('Notification:', { type: item.type, status: item.status, message: item.message });
    
    const iconData = getNotificationIcon(item.message, item.type, item.status);
    
    const handleNotificationPress = () => {
      const reqId = item.requestId || item.wasteRequestId;
      if (reqId) {
        (navigation as any).navigate('RequestDetails', { requestId: reqId });
      } else {
        // If no requestId, navigate to Requests tab
        (navigation as any).navigate('Requests');
      }
    };
    
    return (
      <TouchableOpacity style={styles.notificationCard} onPress={handleNotificationPress} activeOpacity={0.7}>
        <View style={[styles.iconCircle, {backgroundColor: iconData.bg}]}>
          <MaterialCommunityIcons name={iconData.name as any} size={22} color={iconData.color} />
        </View>
        <View style={styles.notificationContent}>
          <Text style={styles.notificationTitle}>{item.type.replace('_', ' ').toUpperCase()}</Text>
          <Text style={styles.notificationMessage}>{item.message}</Text>
          <Text style={styles.notificationTime}>{timestamp}</Text>
        </View>
      </TouchableOpacity>
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
    paddingTop: 20,
    paddingBottom: 16,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  placeholder: {
    width: 36,
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
    width: 44,
    height: 44,
    borderRadius: 22,
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
