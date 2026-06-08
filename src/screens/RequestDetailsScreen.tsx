import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState, useRef } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View, ActivityIndicator, TouchableOpacity, Modal } from 'react-native';
import { BackButton, StarRating } from '../components';
import ScreenWrapper from '../components/ScreenWrapper';
import { getWasteIcon } from '../constants/wasteIcons';
import { calculatePointsForRequest } from '../context/RequestsContext';
import { sendStatusChangeNotification } from '../services/notificationService';
import { doc, getDoc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { STATUS_FLOW } from '../constants/statusFlow';
import { normalizeStatus } from '../utils/statusNormalizer';
import { useLanguage } from '../context/LanguageContext';

const RequestDetailsScreen: React.FC = ({ route }: any) => {
  const navigation: any = useNavigation();
  const { t } = useLanguage();
  const { id } = route.params || {};
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const previousStatusRef = useRef<string | null>(null);
  const [partnerName, setPartnerName] = useState<string>('—');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const handleCancel = async () => {
    setCancelling(true);
    try {
      await updateDoc(doc(db, 'wasteRequests', id), {
        status: 'Cancelled',
        updatedAt: serverTimestamp(),
      });
      setShowCancelModal(false);
      navigation.goBack();
    } catch (e) {
      // silent
    } finally {
      setCancelling(false);
    }
  };

  useEffect(() => {
    if (!id) { setLoading(false); return; }

    const requestRef = doc(db, 'wasteRequests', id);
    const unsubscribe = onSnapshot(requestRef, async (docSnap) => {
      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() };
        data.status = normalizeStatus(data.status);

        const previousStatus = previousStatusRef.current;
        const currentStatus = data.status;

        if (previousStatus && previousStatus !== currentStatus) {
          const wasteType = data.type || data.wasteType;
          const earnedPoints = data.ecoPointsAwarded;
          const scheduledInfo = data.scheduledDate && data.scheduledTime
            ? `${data.scheduledDate} ${data.scheduledTime}` : null;
          sendStatusChangeNotification(currentStatus, wasteType, scheduledInfo, earnedPoints);
        }

        previousStatusRef.current = currentStatus;
        setRequest(data);

        if (data.partnerId) {
          try {
            const partnerDoc = await getDoc(doc(db, 'partners', data.partnerId));
            if (partnerDoc.exists()) setPartnerName(partnerDoc.data().name || '—');
          } catch (_) {}
        }
      } else {
        setRequest(null);
      }
      setLoading(false);
    }, () => setLoading(false));

    return () => unsubscribe();
  }, [id]);

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={styles.container}>
          <View style={styles.headerRow}>
            <BackButton onPress={() => navigation.goBack()} style={styles.back} />
            <Text style={styles.headerTitle}>{t('requestDetails.title')}</Text>
            <View style={{ width: 36 }} />
          </View>
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={{ marginTop: 16, color: '#6b7280' }}>{t('requestDetails.loading')}</Text>
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
          <Text style={styles.headerTitle}>{t('requestDetails.title')}</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={{ alignItems: 'center', marginTop: 40 }}>
          <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#ef4444" />
          <Text style={{ marginTop: 16, fontSize: 18, fontWeight: '700' }}>{t('requestDetails.notFound')}</Text>
          <Text style={{ marginTop: 8, color: '#6b7280', textAlign: 'center' }}>{t('requestDetails.notFoundMessage')}</Text>
        </View>
      </View>
    </ScreenWrapper>
  );

  const req = request;
  const submittedDate = req.createdAt?.toDate?.() ? req.createdAt.toDate() : new Date(req.createdAt);
  const quantity = Number(req.quantity || req.itemCount || 0);
  const wasteCategory = req.type || req.wasteType || req.category || 'Unknown';
  const unit = req.unit || 'items';
  const pickupAddress = req.location || req.pickupAddress;
  const translatedCategory = t(`wasteCategory.${wasteCategory}`) || wasteCategory;

  return (
    <ScreenWrapper>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} style={styles.back} />
          <Text style={styles.headerTitle}>{t('requestDetails.title')}</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Summary Card */}
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.left}>{t('requestDetails.wasteType')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name={getWasteIcon(wasteCategory) as any} size={18} color="#10b981" />
              <Text style={{ marginLeft: 8 }}>{translatedCategory} {t('requests.waste')}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <Text style={styles.left}>{t('requestDetails.recycler')}</Text>
            <Text>{partnerName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.left}>{t('requestDetails.quantity')}</Text>
            <Text>{quantity} {unit}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.left}>{t('requestDetails.pickupAddress')}</Text>
            <Text style={{ textAlign: 'right', flex: 1, marginLeft: 12 }}>
              {pickupAddress
                ? `${pickupAddress.house}, ${pickupAddress.street}, ${pickupAddress.city} - ${pickupAddress.pincode}`
                : '—'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.left}>{t('requestDetails.submitted')}</Text>
            <Text>{submittedDate.toLocaleDateString()}</Text>
          </View>
        </View>

        <Text style={styles.section}>{t('requestDetails.statusTimeline')}</Text>
        <View style={{ marginTop: 8 }}>
          {(() => {
            const currentIndex = STATUS_FLOW.indexOf(req.status);
            const validIndex = currentIndex >= 0 ? currentIndex : 0;

            return STATUS_FLOW.map((stepLabel, stepIndex) => {
              const isCompleted = stepIndex < validIndex;
              const isActive = stepIndex === validIndex;
              const isUpcoming = stepIndex > validIndex;

              const dotColor = (isCompleted || isActive) ? '#10b981' : '#d1d5db';
              const lineColor = stepIndex < validIndex ? '#10b981' : '#e5e7eb';
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
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.timelineStatus, { color: textColor, fontWeight: textWeight as any }]}>
                      {t(`status.${stepLabel}`)}
                    </Text>
                    {timestampText ? (
                      <Text style={styles.timelineAt}>{timestampText}</Text>
                    ) : isUpcoming ? (
                      <Text style={[styles.timelineAt, { fontStyle: 'italic' }]}>{t('requestDetails.statusPending')}</Text>
                    ) : null}
                  </View>
                </View>
              );
            });
          })()}
        </View>

        {/* Cancel — Assigned only */}
        {req.status === 'Assigned' && (
          <View style={styles.inlineCancelWrap}>
            <Text style={styles.inlineCancelQuestion}>{t('requestDetails.cancelQuestion')}</Text>
            <TouchableOpacity style={styles.inlineCancelBtn} onPress={() => setShowCancelModal(true)} activeOpacity={0.85}>
              <MaterialCommunityIcons name="close-circle-outline" size={16} color="#ef4444" />
              <Text style={styles.inlineCancelBtnText}>{t('requestDetails.cancelRequest')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Rewards Info */}
        <Text style={[styles.section, { marginTop: 12 }]}>{t('requestDetails.rewards')}</Text>
        <View style={{ backgroundColor: '#fff', borderRadius: 8, padding: 12 }}>
          {req.status === 'Completed' ? (
            <Text style={{ fontWeight: '800', color: '#065f46' }}>
              {t('requestDetails.ecoPointsEarned', { points: (req as any).ecoPointsAwarded || calculatePointsForRequest({ category: wasteCategory, quantity, unit }) })}
            </Text>
          ) : (
            <Text>{t('requestDetails.ecoPointsInfo')}</Text>
          )}
        </View>

        {/* Notes */}
        {req.status === 'Accepted' && (
          <View style={styles.noteCard}>
            <MaterialCommunityIcons name="information-outline" size={18} color="#f59e0b" />
            <Text style={styles.noteText}>{t('requestDetails.noteAccepted')}</Text>
          </View>
        )}
        {req.status === 'In Progress' && (
          <View style={[styles.noteCard, { backgroundColor: '#fef2f2', borderLeftColor: '#ef4444' }]}>
            <MaterialCommunityIcons name="truck-fast" size={18} color="#ef4444" />
            <Text style={[styles.noteText, { color: '#991b1b' }]}>{t('requestDetails.noteInProgress')}</Text>
          </View>
        )}

        {/* Feedback */}
        {req.status === 'Completed' && (
          <View>
            <Text style={[styles.section, { marginTop: 16 }]}>{t('requestDetails.feedbackTitle')}</Text>
            <View style={{ marginTop: 8, backgroundColor: '#fff', padding: 12, borderRadius: 8 }}>
              <StarRating />
              <TextInput
                placeholder={t('requestDetails.feedbackPlaceholder')}
                style={styles.feedbackInput}
                multiline
                numberOfLines={3}
              />
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      <Modal visible={showCancelModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalIconWrap}>
              <MaterialCommunityIcons name="alert-circle-outline" size={32} color="#ef4444" />
            </View>
            <Text style={styles.modalTitle}>{t('requestDetails.cancelModalTitle')}</Text>
            <Text style={styles.modalMessage}>{t('requestDetails.cancelModalMessage')}</Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalNoBtn} onPress={() => setShowCancelModal(false)} disabled={cancelling}>
                <Text style={styles.modalNoText}>{t('common.no')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalYesBtn} onPress={handleCancel} disabled={cancelling}>
                {cancelling
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.modalYesText}>{t('requestDetails.yesCancel')}</Text>
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
  safe: { flex: 1, backgroundColor: '#f7f7f7' },
  scroll: { flex: 1 },
  container: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  back: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: '#111827' },
  title: { fontSize: 20, fontWeight: '800', marginBottom: 12 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10 },
  left: { color: '#6b7280' },
  section: { fontWeight: '800', marginTop: 16, marginBottom: 8 },
  timelineItem: { flexDirection: 'row', paddingVertical: 12, alignItems: 'flex-start' },
  timelineLeft: { width: 36, alignItems: 'center' },
  timelineIcon: { width: 18, height: 18, borderRadius: 9, marginTop: 4 },
  timelineLine: { width: 3, flex: 1, backgroundColor: '#E5E7EB', marginTop: 6, height: '100%' },
  timelineStatus: { fontWeight: '800', fontSize: 15, color: '#111827' },
  timelineAt: { color: '#6b7280', marginTop: 6, fontSize: 13 },
  feedbackInput: { marginTop: 10, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, padding: 8, textAlignVertical: 'top' },
  inlineCancelWrap: { marginTop: 16, backgroundColor: '#fff', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderLeftWidth: 3, borderLeftColor: '#ef4444' },
  inlineCancelQuestion: { fontSize: 13, color: '#374151', fontWeight: '600', flex: 1 },
  inlineCancelBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderColor: '#ef4444', borderRadius: 10, paddingVertical: 6, paddingHorizontal: 10, marginLeft: 10 },
  inlineCancelBtnText: { color: '#ef4444', fontWeight: '700', fontSize: 13 },
  noteCard: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, backgroundColor: '#fffbeb', borderRadius: 12, padding: 14, marginTop: 16, borderLeftWidth: 3, borderLeftColor: '#f59e0b' },
  noteText: { flex: 1, fontSize: 13, color: '#92400e', fontWeight: '600', lineHeight: 18 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 },
  modalBox: { backgroundColor: '#fff', borderRadius: 24, padding: 28, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 20, elevation: 10 },
  modalIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 8, textAlign: 'center' },
  modalMessage: { fontSize: 14, color: '#6b7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  modalActions: { flexDirection: 'row', gap: 12, width: '100%' },
  modalNoBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', alignItems: 'center' },
  modalNoText: { fontWeight: '700', color: '#6b7280', fontSize: 15 },
  modalYesBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#ef4444', alignItems: 'center', shadowColor: '#ef4444', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  modalYesText: { fontWeight: '800', color: '#fff', fontSize: 15 },
});

export default RequestDetailsScreen;
