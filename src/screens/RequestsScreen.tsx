import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useRef, useEffect } from "react";
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import Card from "../components/ui/Card";
import { getWasteIcon, getWasteColor } from "../constants/wasteIcons";
import { useAuth } from "../context/AuthContext";
import { subscribeToUserRequests, WasteRequest } from "../services/requestService";
import { sendStatusUpdateNotification } from "../services/pushNotificationService";
import { doc, getDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { STATUS_FLOW } from '../constants/statusFlow';
import { normalizeStatus } from '../utils/statusNormalizer';
import { LinearGradient } from 'expo-linear-gradient';

const RequestsScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const { user } = useAuth();
  const [requests, setRequests] = useState<WasteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const previousStatusRef = useRef<Map<string, string>>(new Map());
  const [partnerNames, setPartnerNames] = useState<Map<string, string>>(new Map());
  const partnerCacheRef = useRef<Map<string, string>>(new Map());

  // Select mode — only for completed
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    const unsubscribe = subscribeToUserRequests(
      user.uid,
      (updatedRequests) => {
        updatedRequests.forEach((request) => {
          (request as any).status = normalizeStatus((request as any).status);
          const previousStatus = previousStatusRef.current.get(request.id);
          const currentStatus = request.status;
          if (previousStatus && previousStatus !== currentStatus) {
            const wasteType = (request as any).type || (request as any).wasteType;
            const scheduledAt = (request as any).scheduledAt;
            sendStatusUpdateNotification(currentStatus, wasteType, scheduledAt);
          }
          previousStatusRef.current.set(request.id, currentStatus);
        });
        setRequests(updatedRequests);
        setLoading(false);

        // Fetch partner names in background — only for uncached IDs
        const uncachedIds = [...new Set(
          updatedRequests
            .map(r => (r as any).partnerId)
            .filter((id): id is string => !!id && !partnerCacheRef.current.has(id))
        )];
        if (uncachedIds.length === 0) return;
        Promise.all(
          uncachedIds.map(id =>
            getDoc(doc(db, 'partners', id))
              .then(snap => snap.exists() ? [id, snap.data().name || 'Recycler Partner'] as const : null)
              .catch(() => null)
          )
        ).then(results => {
          const updates = new Map<string, string>();
          results.forEach(r => r && updates.set(r[0], r[1]));
          if (updates.size > 0) {
            updates.forEach((name, id) => partnerCacheRef.current.set(id, name));
            setPartnerNames(prev => new Map([...prev, ...updates]));
          }
        });
      },
      () => setLoading(false)
    );
    return () => unsubscribe();
  }, [user?.uid]);

  const active = requests.filter(r => r.status !== 'Completed' && r.status !== 'Cancelled');
  const completed = requests.filter(r => r.status === 'Completed' || r.status === 'Cancelled');
  const totalItems = completed.reduce((s, r) => s + ((r as any).quantity || 0), 0);

  // Multi-select handlers (completed only)
  const handleCompletedPress = (id: string) => {
    if (selectMode) {
      setSelectedIds(prev => {
        const next = new Set(prev);
        next.has(id) ? next.delete(id) : next.add(id);
        if (next.size === 0) setSelectMode(false);
        return next;
      });
    } else {
      navigation.navigate("RequestDetails", { id });
    }
  };

  const handleCompletedLongPress = (id: string) => {
    if (!selectMode) {
      setSelectMode(true);
      setSelectedIds(new Set([id]));
    }
  };

  const exitSelectMode = () => { setSelectMode(false); setSelectedIds(new Set()); };
  const allSelected = selectedIds.size === completed.length;
  const selectAll = () => setSelectedIds(new Set(completed.map(c => c.id)));
  const deselectAll = () => setSelectedIds(new Set());

  const handleDelete = async () => {
    setDeleting(true);
    const batch = writeBatch(db);
    const toDelete = selectedIds.size > 0 ? selectedIds : new Set(completed.map(c => c.id));
    toDelete.forEach(id => batch.delete(doc(db, 'wasteRequests', id)));
    await batch.commit();
    exitSelectMode();
    setShowConfirm(false);
    setDeleting(false);
  };

  const confirmMessage = selectedIds.size > 0 && selectedIds.size < completed.length
    ? `This will permanently delete ${selectedIds.size} selected request${selectedIds.size > 1 ? 's' : ''}.`
    : 'This will permanently delete all completed requests.';

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.container}>
          <Text style={styles.title}>My Requests</Text>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>Loading requests...</Text>
          </View>
        </View>
      </ScreenWrapper>
    );
  }

  if (requests.length === 0) {
    return (
      <ScreenWrapper>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>My Requests</Text>
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons name="recycle" size={64} color="#10b981" />
            </View>
            <Text style={styles.emptyTitle}>No requests yet</Text>
            <Text style={styles.emptySubtitle}>Start by identifying waste or exploring recycler partners</Text>
            <TouchableOpacity style={styles.ctaButton} onPress={() => navigation.navigate("Identify")}>
              <MaterialCommunityIcons name="camera" size={20} color="#fff" />
              <Text style={styles.ctaText}>Identify Waste</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper>
      {/* Header */}
      <View style={styles.pageHeader}>
        <View>
          {selectMode ? (
            <Text style={styles.title}>{selectedIds.size} selected</Text>
          ) : (
            <>
              <Text style={styles.title}>My Requests</Text>
              <Text style={styles.subtitle}>{requests.length} total requests</Text>
            </>
          )}
        </View>
        <View style={styles.headerActions}>
          {selectMode ? (
            <>
              <TouchableOpacity onPress={allSelected ? deselectAll : selectAll} style={styles.headerTextBtn}>
                <Text style={styles.headerTextBtnLabel}>{allSelected ? 'Deselect All' : 'Select All'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.deleteIconBtn} onPress={() => setShowConfirm(true)}>
                <MaterialCommunityIcons name="trash-can-outline" size={22} color="#ef4444" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelSelectBtn} onPress={exitSelectMode}>
                <MaterialCommunityIcons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </>
          ) : (
            totalItems > 0 && (
              <View style={styles.impactBadge}>
                <MaterialCommunityIcons name="leaf" size={16} color="#10b981" />
                <Text style={styles.impactText}>{totalItems} items</Text>
              </View>
            )
          )}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Active Requests — tap navigates normally */}
        {active.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Active</Text>
              <View style={styles.countBadge}><Text style={styles.countText}>{active.length}</Text></View>
            </View>
            {active.map((item) => {
              const wasteType = (item as any).type || (item as any).wasteType || 'Unknown';
              const partnerId = (item as any).partnerId;
              const partnerDisplayName = partnerId ? (partnerNames.get(partnerId) || 'Recycler Partner') : 'Pending Assignment';
              const currentIndex = STATUS_FLOW.indexOf(item.status);
              const validIndex = currentIndex >= 0 ? currentIndex : 0;
              const quantity = (item as any).quantity || 0;
              const wasteColors = getWasteColor(wasteType);

              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => navigation.navigate("RequestDetails", { id: item.id })}
                  activeOpacity={0.75}
                >
                  <Card style={styles.requestCard}>
                    <View style={styles.cardHeader}>
                      <View style={[styles.iconWrap, { backgroundColor: wasteColors.bg }]}>
                        <MaterialCommunityIcons name={getWasteIcon(wasteType) as any} size={24} color={wasteColors.icon} />
                      </View>
                      <View style={styles.cardContent}>
                        <Text style={styles.wasteTitle}>{wasteType} Waste</Text>
                        <Text style={styles.partnerName}>{partnerDisplayName}</Text>
                      </View>
                      <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
                    </View>
                    <View style={styles.cardDetails}>
                      <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="package-variant" size={16} color="#6b7280" />
                        <Text style={styles.detailText}>{quantity} items</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="calendar" size={16} color="#6b7280" />
                        <Text style={styles.detailText}>
                          {new Date(item.createdAt?.toDate?.() || item.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                    </View>
                    {item.status === 'In Progress' && (item as any).scheduledAt && (
                      <View style={styles.scheduledBanner}>
                        <MaterialCommunityIcons name="clock-outline" size={14} color="#3b82f6" />
                        <Text style={styles.scheduledText}>
                          Scheduled: {(() => {
                            const date = (item as any).scheduledAt?.toDate?.() || new Date((item as any).scheduledAt);
                            return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
                          })()}
                        </Text>
                      </View>
                    )}
                    <View style={styles.statusSection}>
                      <View style={styles.statusBadge}>
                        <View style={[styles.statusDot, { backgroundColor: '#10b981' }]} />
                        <Text style={styles.statusText}>{item.status}</Text>
                      </View>
                      <View style={styles.progressBar}>
                        {[0, 1, 2, 3].map((dotIndex) => (
                          <View key={dotIndex} style={[styles.progressDot, dotIndex <= validIndex && styles.progressDotActive]} />
                        ))}
                      </View>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Completed Requests — tap enters select mode */}
        {completed.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Completed</Text>
              <View style={[styles.countBadge, { backgroundColor: '#ecfdf5' }]}>
                <Text style={[styles.countText, { color: '#10b981' }]}>{completed.length}</Text>
              </View>
              {!selectMode && (
                <Text style={styles.selectHint}>Long press to delete</Text>
              )}
            </View>
            {completed.map((c) => {
              const completedWasteType = (c as any).type || (c as any).wasteType || 'Unknown';
              const completedPartnerId = (c as any).partnerId;
              const completedPartnerName = completedPartnerId ? (partnerNames.get(completedPartnerId) || 'Recycler Partner') : 'Recycler Partner';
              const quantity = (c as any).quantity || 0;
              const points = (c as any).ecoPointsAwarded || 0;
              const wasteColors = getWasteColor(completedWasteType);
              const isSelected = selectedIds.has(c.id);

              return (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => handleCompletedPress(c.id)}
                  onLongPress={() => handleCompletedLongPress(c.id)}
                  activeOpacity={0.75}
                >
                  <Card style={[styles.requestCard, styles.completedCard, isSelected && styles.cardSelected]}>
                    <View style={styles.cardHeader}>
                      <View style={[styles.iconWrap, { backgroundColor: wasteColors.bg }]}>
                        <MaterialCommunityIcons name={getWasteIcon(completedWasteType) as any} size={24} color={wasteColors.icon} />
                      </View>
                      <View style={styles.cardContent}>
                        <Text style={styles.wasteTitle}>{completedWasteType} Waste</Text>
                        <Text style={styles.partnerName}>{completedPartnerName}</Text>
                      </View>
                      {selectMode ? (
                        <View style={[styles.checkbox, isSelected && styles.checkboxSelected]}>
                          {isSelected && <MaterialCommunityIcons name="check" size={13} color="#fff" />}
                        </View>
                      ) : (
                        <View style={styles.completedBadge}>
                          <MaterialCommunityIcons name="check-circle" size={20} color="#10b981" />
                        </View>
                      )}
                    </View>
                    <View style={styles.completedFooter}>
                      <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="package-variant" size={14} color="#6b7280" />
                        <Text style={styles.detailTextSmall}>{quantity} items</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <MaterialCommunityIcons name="calendar" size={14} color="#6b7280" />
                        <Text style={styles.detailTextSmall}>
                          {new Date(c.createdAt?.toDate?.() || c.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      {points > 0 && (
                        <View style={styles.pointsBadge}>
                          <MaterialCommunityIcons name="star" size={12} color="#f59e0b" />
                          <Text style={styles.pointsText}>+{points}</Text>
                        </View>
                      )}
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {totalItems > 0 && !selectMode && (
          <LinearGradient colors={['#ecfdf5', '#d1fae5']} start={[0, 0]} end={[1, 1]} style={styles.impactCard}>
            <MaterialCommunityIcons name="leaf" size={40} color="#10b981" />
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={styles.impactTitle}>Your Impact</Text>
              <Text style={styles.impactValue}>{totalItems} items recycled</Text>
              <Text style={styles.impactSubtext}>Keep up the great work! 🌱</Text>
            </View>
          </LinearGradient>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Confirmation Modal */}
      <Modal visible={showConfirm} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIconWrap}>
              <MaterialCommunityIcons name="trash-can-outline" size={32} color="#ef4444" />
            </View>
            <Text style={styles.modalTitle}>Delete Requests</Text>
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
  container: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 40 },
  pageHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 20, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: '900', color: '#111827' },
  subtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTextBtn: { paddingHorizontal: 12, paddingVertical: 7, backgroundColor: '#f3f4f6', borderRadius: 10 },
  headerTextBtnLabel: { color: '#374151', fontWeight: '700', fontSize: 13 },
  deleteIconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' },
  cancelSelectBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  impactBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ecfdf5', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, gap: 4 },
  impactText: { fontSize: 14, fontWeight: '800', color: '#10b981' },

  loadingContainer: { alignItems: 'center', marginTop: 60 },
  loadingText: { marginTop: 12, color: '#6b7280', fontSize: 14 },

  emptyContainer: { alignItems: 'center', marginTop: 80, paddingHorizontal: 32 },
  emptyIcon: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: '#6b7280', textAlign: 'center', marginBottom: 24, lineHeight: 22 },
  ctaButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#10b981', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, gap: 8, shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 16 },

  section: { marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },
  countBadge: { backgroundColor: '#f3f4f6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  countText: { fontSize: 12, fontWeight: '800', color: '#6b7280' },
  selectHint: { fontSize: 11, color: '#9ca3af', marginLeft: 'auto', fontWeight: '600' },

  requestCard: { marginBottom: 12, padding: 16, borderRadius: 16, backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 3, borderWidth: 1.5, borderColor: 'transparent', overflow: 'hidden' },
  completedCard: { opacity: 0.88 },
  cardSelected: { borderColor: '#ef4444', backgroundColor: '#fff8f8', opacity: 1 },

  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  cardContent: { flex: 1, marginLeft: 12 },
  wasteTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },
  partnerName: { fontSize: 13, color: '#6b7280', marginTop: 4, fontWeight: '600' },

  cardDetails: { flexDirection: 'row', gap: 16, marginBottom: 12 },
  detailItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  detailText: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
  detailTextSmall: { fontSize: 12, color: '#6b7280', fontWeight: '600' },

  scheduledBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#eff6ff', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, marginBottom: 12, gap: 6 },
  scheduledText: { fontSize: 12, color: '#3b82f6', fontWeight: '700' },

  statusSection: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '700', color: '#111827' },
  progressBar: { flexDirection: 'row', gap: 4 },
  progressDot: { width: 24, height: 4, borderRadius: 2, backgroundColor: '#e5e7eb' },
  progressDotActive: { backgroundColor: '#10b981' },

  completedBadge: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center' },
  completedFooter: { flexDirection: 'row', gap: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  pointsBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fffbeb', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4, marginLeft: 'auto' },
  pointsText: { fontSize: 12, fontWeight: '800', color: '#f59e0b' },

  checkbox: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  checkboxSelected: { backgroundColor: '#ef4444', borderColor: '#ef4444' },

  impactCard: { padding: 20, borderRadius: 16, flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  impactTitle: { fontSize: 14, fontWeight: '700', color: '#065f46', marginBottom: 4 },
  impactValue: { fontSize: 24, fontWeight: '900', color: '#10b981', marginBottom: 4 },
  impactSubtext: { fontSize: 13, color: '#059669' },

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

export default RequestsScreen;
