import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, FlatList, Modal,
  StyleSheet, Text, TouchableOpacity, View
} from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { collection, query, where, onSnapshot, writeBatch, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';

type Notification = {
  id: string;
  type: string;
  title?: string;
  message: string;
  createdAt: any;
  read: boolean;
  status?: string;
  requestId?: string;
  wasteRequestId?: string;
  metadata?: {
    wasteRequestId?: string;
    partnerId?: string;
    pickupDate?: string;
    pickupTime?: string;
    requiresResponse?: boolean;
  };
};

function getNotificationIcon(message: string, type: string) {
  const m = message.toLowerCase();
  if (m.includes('accepted')) return { name: 'check-circle', color: '#10b981', bg: '#ecfdf5' };
  if (m.includes('scheduled') || m.includes('pickup has been scheduled')) return { name: 'clock-outline', color: '#3b82f6', bg: '#eff6ff' };
  if (m.includes('completed')) return { name: 'check-all', color: '#8b5cf6', bg: '#f5f3ff' };
  if (m.includes('available') || type === 'availability_confirmation') return { name: 'calendar-clock', color: '#f59e0b', bg: '#fef3c7' };
  return { name: 'bell', color: '#6b7280', bg: '#f3f4f6' };
}

const NotificationsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [responding, setResponding] = useState<string | null>(null); // notificationId being responded to

  const handleAvailabilityResponse = async (item: Notification, response: 'confirmed' | 'declined') => {
    setResponding(item.id);
    try {
      const wasteRequestId = item.metadata?.wasteRequestId || item.wasteRequestId;
      await updateDoc(doc(db, 'notifications', item.id), {
        status: response,
        respondedAt: serverTimestamp(),
      });
      if (wasteRequestId) {
        await updateDoc(doc(db, 'wasteRequests', wasteRequestId), {
          confirmationStatus: response === 'confirmed' ? 'confirmed' : 'not_available',
        });
      }
    } catch { }
    finally { setResponding(null); }
  };

  useEffect(() => {
    if (!user?.uid) { setLoading(false); return; }
    const q = query(collection(db, 'notifications'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, snapshot => {
      const list: Notification[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Notification));
      list.sort((a, b) => {
        const aT = a.createdAt?.toDate?.() || new Date(a.createdAt);
        const bT = b.createdAt?.toDate?.() || new Date(b.createdAt);
        return bT.getTime() - aT.getTime();
      });
      setNotifications(list);
      setLoading(false);
      const unread = snapshot.docs.filter(d => d.data().read === false);
      if (unread.length > 0) {
        const batch = writeBatch(db);
        unread.forEach(d => batch.update(d.ref, { read: true }));
        batch.commit().catch(() => {});
      }
    }, () => setLoading(false));
    return () => unsubscribe();
  }, [user?.uid]);

  const handleCardPress = (item: Notification) => {
    if (selectMode) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.has(item.id) ? next.delete(item.id) : next.add(item.id);
        if (next.size === 0) setSelectMode(false);
        return next;
      });
    } else {
      const reqId = item.requestId || item.wasteRequestId;
      if (reqId) (navigation as any).navigate('RequestDetails', { requestId: reqId });
      else (navigation as any).navigate('Requests');
    }
  };

  const handleCardLongPress = (id: string) => {
    if (!selectMode) {
      setSelectMode(true);
      setSelectedIds(new Set([id]));
    }
  };

  const allSelected = selectedIds.size === notifications.length;
  const selectAll = () => setSelectedIds(new Set(notifications.map(n => n.id)));
  const deselectAll = () => setSelectedIds(new Set());

  const exitSelectMode = () => { setSelectMode(false); setSelectedIds(new Set()); };

  const handleDelete = async () => {
    setDeleting(true);
    const batch = writeBatch(db);
    // If in select mode delete selected, else delete all (Clear All)
    const toDelete = selectMode && selectedIds.size > 0
      ? selectedIds
      : new Set(notifications.map(n => n.id));
    toDelete.forEach(id => batch.delete(doc(db, 'notifications', id)));
    await batch.commit();
    exitSelectMode();
    setShowConfirm(false);
    setDeleting(false);
  };

  const confirmMessage = selectMode && selectedIds.size > 0 && selectedIds.size < notifications.length
    ? `This will permanently delete ${selectedIds.size} selected notification${selectedIds.size > 1 ? 's' : ''}.`
    : 'This will permanently delete all your notifications.';

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => selectMode ? exitSelectMode() : navigation.goBack()}
          style={styles.backButton}
        >
          <Feather name={selectMode ? 'x' : 'arrow-left'} size={22} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {selectMode ? `${selectedIds.size} selected` : 'Notifications'}
        </Text>

        <View style={styles.headerActions}>
          {selectMode ? (
            <>
              <TouchableOpacity onPress={allSelected ? deselectAll : selectAll} style={styles.headerTextBtn}>
                <Text style={styles.headerTextBtnLabel}>{allSelected ? 'Deselect All' : 'Select All'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteIconBtn} onPress={() => setShowConfirm(true)}>
                <MaterialCommunityIcons name="trash-can-outline" size={22} color="#ef4444" />
              </TouchableOpacity>
            </>
          ) : notifications.length > 0 ? (
            <TouchableOpacity style={styles.clearBtn} onPress={() => setShowConfirm(true)}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#10b981" />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications.filter(n => n.type !== 'availability_confirmation')}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <>
              {notifications.filter(n => n.type === 'availability_confirmation').map(item => {
                const responded = item.status === 'confirmed' || item.status === 'declined';
                const isResponding = responding === item.id;
                return (
                  <View key={item.id} style={styles.availCard}>

                    {/* Header */}
                    <LinearGradient colors={['#10b981', '#059669']} style={styles.availHeader} start={[0,0]} end={[1,0]}>
                      <View style={styles.availHeaderLeft}>
                        <View style={styles.availIconWrap}>
                          <MaterialCommunityIcons name="calendar-clock" size={22} color="#059669" />
                        </View>
                        <View>
                          <Text style={styles.availHeaderTitle}>{item.title || 'Pickup Confirmation'}</Text>
                          <Text style={styles.availHeaderSub}>
                            {responded ? 'You have responded' : 'Your response is needed'}
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>

                    {/* Body */}
                    <View style={styles.availBody}>
                      <Text style={styles.availMessage}>{item.message}</Text>

                      {/* Date / Time boxes */}
                      {(item.metadata?.pickupDate || item.metadata?.pickupTime) && (
                        <View style={styles.availInfoRow}>
                          {item.metadata?.pickupDate && (
                            <View style={styles.availInfoBox}>
                              <MaterialCommunityIcons name="calendar" size={18} color="#10b981" />
                              <Text style={styles.availInfoLabel}>DATE</Text>
                              <Text style={styles.availInfoValue}>{item.metadata.pickupDate}</Text>
                            </View>
                          )}
                          {item.metadata?.pickupTime && (
                            <View style={styles.availInfoBox}>
                              <MaterialCommunityIcons name="clock-outline" size={18} color="#10b981" />
                              <Text style={styles.availInfoLabel}>TIME</Text>
                              <Text style={styles.availInfoValue}>{item.metadata.pickupTime}</Text>
                            </View>
                          )}
                        </View>
                      )}

                      {/* Buttons or responded state */}
                      {responded ? (
                        <View style={[
                          styles.respondedBox,
                          item.status === 'confirmed' ? styles.respondedBoxGreen : styles.respondedBoxRed
                        ]}>
                          <MaterialCommunityIcons
                            name={item.status === 'confirmed' ? 'check-circle' : 'close-circle'}
                            size={24}
                            color={item.status === 'confirmed' ? '#10b981' : '#ef4444'}
                          />
                          <Text style={[styles.respondedBoxText, { color: item.status === 'confirmed' ? '#065f46' : '#991b1b' }]}>
                            {item.status === 'confirmed' ? 'You confirmed availability' : 'You marked as not available'}
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.availActions}>
                          <TouchableOpacity
                            style={styles.availYesBtn}
                            onPress={() => handleAvailabilityResponse(item, 'confirmed')}
                            disabled={!!isResponding}
                            activeOpacity={0.85}
                          >
                            {isResponding
                              ? <ActivityIndicator size="small" color="#fff" />
                              : <>
                                  <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
                                  <Text style={styles.availYesText}>Yes, I'm Available</Text>
                                </>
                            }
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.availNoBtn}
                            onPress={() => handleAvailabilityResponse(item, 'declined')}
                            disabled={!!isResponding}
                            activeOpacity={0.85}
                          >
                            <MaterialCommunityIcons name="close-circle" size={20} color="#6b7280" />
                            <Text style={styles.availNoText}>Not Available</Text>
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </>
          }
          ListEmptyComponent={
            notifications.filter(n => n.type !== 'availability_confirmation').length === 0 &&
            notifications.filter(n => n.type === 'availability_confirmation').length === 0 ? (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Feather name="bell-off" size={48} color="#d1d5db" />
                </View>
                <Text style={styles.emptyText}>No notifications yet</Text>
                <Text style={styles.emptySubtext}>We'll notify you when something happens</Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => {
            const iconData = getNotificationIcon(item.message, item.type);
            const timestamp = item.createdAt?.toDate?.()
              ? item.createdAt.toDate().toLocaleString()
              : 'Just now';
            const isSelected = selectedIds.has(item.id);
            return (
              <TouchableOpacity
                style={[styles.notificationCard, isSelected && styles.notificationCardSelected]}
                onPress={() => handleCardPress(item)}
                onLongPress={() => handleCardLongPress(item.id)}
                activeOpacity={0.75}
              >
                {selectMode && (
                  <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                    {isSelected && <MaterialCommunityIcons name="check" size={13} color="#fff" />}
                  </View>
                )}
                <View style={[styles.iconCircle, { backgroundColor: iconData.bg }]}>
                  <MaterialCommunityIcons name={iconData.name as any} size={22} color={iconData.color} />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>
                    {item.title || item.type.replace(/_/g, ' ').toUpperCase()}
                  </Text>
                  <Text style={styles.notificationMessage}>{item.message}</Text>
                  <Text style={styles.notificationTime}>{timestamp}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      {/* Confirmation Modal */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIconWrap}>
              <MaterialCommunityIcons name="trash-can-outline" size={32} color="#ef4444" />
            </View>
            <Text style={styles.modalTitle}>Delete Notifications</Text>
            <Text style={styles.modalMessage}>{confirmMessage} This cannot be undone.</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setShowConfirm(false)} disabled={deleting}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalDeleteBtn} onPress={handleDelete} disabled={deleting}>
                {deleting
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.modalDeleteText}>Delete</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 16 },
  backButton: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTextBtn: { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#f3f4f6', borderRadius: 10 },
  headerTextBtnLabel: { color: '#374151', fontWeight: '700', fontSize: 13 },
  deleteIconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' },
  clearBtn: { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#f3f4f6', borderRadius: 10 },
  clearText: { color: '#6b7280', fontWeight: '700', fontSize: 13 },

  list: { padding: 16 },
  emptyList: { flex: 1 },

  notificationCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2, borderWidth: 1.5, borderColor: 'transparent' },
  notificationCardSelected: { borderColor: '#ef4444', backgroundColor: '#fff8f8' },

  // Availability confirmation card
  availCard: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 16, overflow: 'hidden', shadowColor: '#10b981', shadowOpacity: 0.12, shadowRadius: 12, elevation: 4 },
  availHeader: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  availHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  availIconWrap: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  availHeaderTitle: { fontSize: 15, fontWeight: '900', color: '#fff' },
  availHeaderSub: { fontSize: 11, color: 'rgba(255,255,255,0.85)', fontWeight: '600', marginTop: 2 },
  availBody: { padding: 16 },
  availMessage: { fontSize: 14, color: '#374151', lineHeight: 20, marginBottom: 14 },
  availInfoRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  availInfoBox: { flex: 1, backgroundColor: '#ecfdf5', borderRadius: 12, padding: 12, alignItems: 'center', gap: 3 },
  availInfoLabel: { fontSize: 10, color: '#065f46', fontWeight: '700', letterSpacing: 0.5 },
  availInfoValue: { fontSize: 13, fontWeight: '900', color: '#064e3b' },
  availActions: { flexDirection: 'row', gap: 10 },
  availYesBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#10b981', paddingVertical: 13, borderRadius: 12, shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 6, elevation: 3 },
  availYesText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  availNoBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#f3f4f6', paddingVertical: 13, borderRadius: 12 },
  availNoText: { color: '#6b7280', fontWeight: '800', fontSize: 13 },
  respondedBox: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: 12 },
  respondedBoxGreen: { backgroundColor: '#ecfdf5' },
  respondedBoxRed: { backgroundColor: '#f3f4f6' },
  respondedBoxText: { fontSize: 14, fontWeight: '700', flex: 1 },

  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center', marginRight: 10, backgroundColor: '#fff' },
  checkboxSelected: { backgroundColor: '#ef4444', borderColor: '#ef4444' },

  iconCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 12, fontWeight: '800', color: '#111827', marginBottom: 3, letterSpacing: 0.3 },
  notificationMessage: { fontSize: 13, color: '#374151', marginBottom: 5, lineHeight: 18 },
  notificationTime: { fontSize: 11, color: '#9ca3af' },

  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  emptyIconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#6b7280', textAlign: 'center' },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 12, color: '#6b7280' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  modalBox: { backgroundColor: '#fff', borderRadius: 24, padding: 28, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  modalIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 8, textAlign: 'center' },
  modalMessage: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
  modalCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', alignItems: 'center' },
  modalCancelText: { fontWeight: '700', color: '#6b7280', fontSize: 15 },
  modalDeleteBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#ef4444', alignItems: 'center', shadowColor: '#ef4444', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  modalDeleteText: { fontWeight: '800', color: '#fff', fontSize: 15 },
});

export default NotificationsScreen;
