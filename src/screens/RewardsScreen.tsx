import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState, useEffect, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, Pressable, ActivityIndicator } from 'react-native';
import Confetti from '../components/Confetti';
import ScreenWrapper from '../components/ScreenWrapper';
import { useAuth } from '../context/AuthContext';
import { RewardTransaction, subscribeToVouchers, subscribeToRewardHistory, Voucher } from '../services/rewardsService';
import { doc, onSnapshot, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const VOUCHER_ICONS: Record<string, string> = {
  transport: 'bus',
  clothing: 'tshirt-crew',
  food: 'food',
  shopping: 'shopping',
  gift: 'gift',
};

const getVoucherIcon = (category: string): string =>
  VOUCHER_ICONS[category?.toLowerCase()] ?? 'ticket-percent';

const RewardsScreen: React.FC = () => {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [rewardHistory, setRewardHistory] = useState<RewardTransaction[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);
  // Bottom sheet state
  const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const sheetAnim = useRef(new Animated.Value(400)).current;

  // Points animation
  const [displayPoints, setDisplayPoints] = useState(0);
  const animPoints = useRef(new Animated.Value(0)).current;
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribeToVouchers(setVouchers);
    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) setPoints(snap.data().ecoPoints ?? 0);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    Animated.timing(animPoints, { toValue: points, duration: 700, useNativeDriver: false }).start();
    const id = animPoints.addListener(({ value }) => setDisplayPoints(Math.round(value)));
    return () => animPoints.removeListener(id);
  }, [points]);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribeToRewardHistory(user.uid, setRewardHistory);
    return () => unsubscribe();
  }, [user?.uid]);

  const openSheet = (voucher: Voucher) => {
    setSelectedVoucher(voucher);
    sheetAnim.setValue(400);
    Animated.spring(sheetAnim, { toValue: 0, useNativeDriver: true, bounciness: 4 }).start();
  };

  const closeSheet = () => {
    Animated.timing(sheetAnim, { toValue: 400, duration: 220, useNativeDriver: true }).start(() =>
      setSelectedVoucher(null)
    );
  };

  const handleRedeem = async () => {
    if (!selectedVoucher || !user?.uid) return;
    setRedeeming(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ecoPoints: increment(-selectedVoucher.pointsRequired),
      });
      await addDoc(collection(db, 'rewardTransactions'), {
        userId: user.uid,
        voucherId: selectedVoucher.id,
        voucherTitle: selectedVoucher.title,
        pointsSpent: selectedVoucher.pointsRequired,
        type: 'redeemed',
        createdAt: serverTimestamp(),
      });
      closeSheet();
      setConfetti(true);
      setTimeout(() => setConfetti(false), 3000);
    } catch {
      // silent
    } finally {
      setRedeeming(false);
    }
  };

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#10b981" />
        </View>
      </ScreenWrapper>
    );
  }

  const sortedVouchers = [...vouchers].sort((a, b) => a.pointsRequired - b.pointsRequired);
  const nextVoucher = sortedVouchers.find(v => v.pointsRequired > points)
    ?? sortedVouchers[sortedVouchers.length - 1]
    ?? null;
  const remaining = nextVoucher ? Math.max(0, nextVoucher.pointsRequired - points) : 0;
  const progress = nextVoucher ? Math.min(1, points / nextVoucher.pointsRequired) : 1;

  return (
    <ScreenWrapper>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>My Rewards</Text>

        {/* Hero Card */}
        <LinearGradient colors={['#16a34a', '#10b981']} style={styles.heroCard} start={[0, 0]} end={[1, 1]}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>🎉 You're close to your next reward!</Text>
              <Animated.Text style={styles.heroPoints}>{displayPoints.toLocaleString()} EcoPoints</Animated.Text>
            </View>
            <View style={styles.heroBadge}>
              <MaterialCommunityIcons name="leaf" size={22} color="#16a34a" />
            </View>
          </View>

          {nextVoucher && (
            <View style={styles.heroProgress}>
              <View style={styles.heroProgressRow}>
                <Text style={styles.heroProgressLabel}>Unlock next reward at {nextVoucher.pointsRequired} pts</Text>
                <Text style={styles.heroProgressRemaining}>{remaining} pts to go</Text>
              </View>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
              </View>
            </View>
          )}
        </LinearGradient>

        {/* Vouchers */}
        <Text style={styles.sectionTitle}>Available Vouchers</Text>
        <View style={{ marginTop: 10 }}>
          {vouchers.length === 0 ? (
            <View style={styles.emptyCard}>
              <MaterialCommunityIcons name="gift-outline" size={48} color="#d1d5db" />
              <Text style={styles.emptyText}>No vouchers available</Text>
              <Text style={styles.emptySubText}>Check back soon for exciting vouchers!</Text>
            </View>
          ) : (
            sortedVouchers.map(item => {
              const isAvailable = points >= item.pointsRequired;
              const p = Math.min(1, points / item.pointsRequired);
              return (
                <View key={item.id} style={[styles.voucherCard, !isAvailable && styles.voucherCardLocked]}>
                  <View style={[styles.voucherIconWrap, { backgroundColor: isAvailable ? '#ecfdf5' : '#f3f4f6' }]}>
                    <MaterialCommunityIcons
                      name={getVoucherIcon(item.category) as any}
                      size={22}
                      color={isAvailable ? '#065f46' : '#9ca3af'}
                    />
                  </View>

                  <View style={styles.voucherInfo}>
                    <Text style={styles.voucherTitle} numberOfLines={1}>{item.title}</Text>
                    {!!item.description && (
                      <Text style={styles.voucherDesc} numberOfLines={2}>{item.description}</Text>
                    )}
                    <Text style={styles.voucherPts}>{points} / {item.pointsRequired} EcoPoints</Text>
                    <View style={styles.voucherProgressTrack}>
                      <View style={[styles.voucherProgressFill, { width: `${p * 100}%`, backgroundColor: isAvailable ? '#10b981' : '#d1d5db' }]} />
                    </View>
                  </View>

                  <View style={styles.voucherAction}>
                    {isAvailable ? (
                      <>
                        <Text style={styles.availableLabel}>Available</Text>
                        <TouchableOpacity style={styles.redeemBtn} onPress={() => openSheet(item)} activeOpacity={0.85}>
                          <Text style={styles.redeemBtnText}>Redeem</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <Text style={styles.lockedLabel}>Locked</Text>
                        <View style={styles.lockIconWrap}>
                          <MaterialCommunityIcons name="lock" size={16} color="#9ca3af" />
                        </View>
                      </>
                    )}
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Redemption History */}
        <View style={styles.historySectionHeader}>
          <Text style={styles.sectionTitle}>Redemption History</Text>
          {rewardHistory.length > 0 && (
            <View style={styles.historyCountBadge}>
              <Text style={styles.historyCountText}>{rewardHistory.length}</Text>
            </View>
          )}
        </View>
        <View style={{ marginTop: 10 }}>
          {rewardHistory.length === 0 ? (
            <View style={styles.historyEmpty}>
              <View style={styles.historyEmptyIconWrap}>
                <MaterialCommunityIcons name="receipt" size={28} color="#10b981" />
              </View>
              <Text style={styles.historyEmptyText}>No redemptions yet</Text>
              <Text style={styles.historyEmptySubText}>Redeemed vouchers will appear here</Text>
            </View>
          ) : (
            rewardHistory.slice(0, 5).map((r, index) => (
              <View key={r.id} style={styles.historyCard}>
                <LinearGradient colors={['#ecfdf5', '#d1fae5']} style={styles.historyIconWrap} start={[0,0]} end={[1,1]}>
                  <MaterialCommunityIcons name="ticket-percent" size={22} color="#059669" />
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyTitle} numberOfLines={1}>{r.voucherTitle}</Text>
                  <View style={styles.historyMeta}>
                    <MaterialCommunityIcons name="clock-outline" size={11} color="#9ca3af" />
                    <Text style={styles.historyDate}>
                      {new Date(r.createdAt?.toDate?.() || r.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </Text>
                  </View>
                </View>
                <View style={styles.historyRight}>
                  <Text style={styles.historyPts}>-{r.pointsSpent} pts</Text>
                  <View style={styles.redeemedBadge}>
                    <MaterialCommunityIcons name="check-circle" size={10} color="#059669" />
                    <Text style={styles.redeemedBadgeText}>Redeemed</Text>
                  </View>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      <Confetti active={confetti} />

      {/* Bottom Sheet */}
      <Modal visible={!!selectedVoucher} transparent animationType="none" onRequestClose={closeSheet}>
        <Pressable style={styles.sheetOverlay} onPress={closeSheet}>
          <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetAnim }] }]}>
            <Pressable>
              <View style={styles.sheetHandle} />

              {selectedVoucher && (
                <>
                  <View style={styles.sheetIconWrap}>
                    <MaterialCommunityIcons
                      name={getVoucherIcon(selectedVoucher.category) as any}
                      size={32}
                      color="#065f46"
                    />
                  </View>

                  <Text style={styles.sheetTitle}>{selectedVoucher.title}</Text>
                  {!!selectedVoucher.description && (
                    <Text style={styles.sheetDesc}>{selectedVoucher.description}</Text>
                  )}

                  <View style={styles.sheetInfoRow}>
                    <View style={styles.sheetInfoBox}>
                      <Text style={styles.sheetInfoLabel}>Cost</Text>
                      <Text style={styles.sheetInfoValue}>{selectedVoucher.pointsRequired} pts</Text>
                    </View>
                    <View style={[styles.sheetInfoBox, { backgroundColor: '#ecfdf5' }]}>
                      <Text style={styles.sheetInfoLabel}>You have</Text>
                      <Text style={[styles.sheetInfoValue, { color: '#10b981' }]}>{points} pts</Text>
                    </View>
                  </View>

                  <View style={styles.sheetActions}>
                    <TouchableOpacity style={styles.sheetCancelBtn} onPress={closeSheet} disabled={redeeming}>
                      <Text style={styles.sheetCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.sheetConfirmBtn} onPress={handleRedeem} disabled={redeeming} activeOpacity={0.85}>
                      {redeeming
                        ? <ActivityIndicator color="#fff" size="small" />
                        : <Text style={styles.sheetConfirmText}>Confirm Redeem</Text>
                      }
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </Pressable>
          </Animated.View>
        </Pressable>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  pageTitle: { fontSize: 22, fontWeight: '900', color: '#111827', marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginTop: 24 },

  // Hero
  heroCard: { borderRadius: 20, padding: 20 },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  heroLabel: { color: 'rgba(255,255,255,0.92)', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  heroPoints: { color: '#fff', fontSize: 30, fontWeight: '900' },
  heroBadge: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  heroProgress: { marginTop: 16 },
  heroProgressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  heroProgressLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, fontWeight: '600' },
  heroProgressRemaining: { color: '#fff', fontSize: 12, fontWeight: '800' },
  progressTrack: { height: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#fff', borderRadius: 8 },

  // Voucher cards
  voucherCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  voucherCardLocked: { opacity: 0.65 },
  voucherIconWrap: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  voucherInfo: { flex: 1, marginRight: 10 },
  voucherTitle: { fontSize: 14, fontWeight: '800', color: '#111827' },
  voucherDesc: { fontSize: 12, color: '#6b7280', marginTop: 2, lineHeight: 16 },
  voucherPts: { fontSize: 11, color: '#9ca3af', marginTop: 6, fontWeight: '600' },
  voucherProgressTrack: { height: 5, backgroundColor: '#f3f4f6', borderRadius: 4, overflow: 'hidden', marginTop: 5 },
  voucherProgressFill: { height: '100%', borderRadius: 4 },
  voucherAction: { alignItems: 'center', minWidth: 80 },
  availableLabel: { fontSize: 11, color: '#10b981', fontWeight: '700', marginBottom: 6 },
  lockedLabel: { fontSize: 11, color: '#9ca3af', fontWeight: '700', marginBottom: 6 },
  redeemBtn: { backgroundColor: '#10b981', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  redeemBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },
  lockIconWrap: { width: 34, height: 34, borderRadius: 17, borderWidth: 1.5, borderColor: '#e5e7eb', alignItems: 'center', justifyContent: 'center' },

  // Empty
  emptyCard: { backgroundColor: '#fff', padding: 28, borderRadius: 16, alignItems: 'center' },
  emptyText: { color: '#6b7280', fontSize: 16, fontWeight: '700', marginTop: 12 },
  emptySubText: { color: '#9ca3af', fontSize: 13, marginTop: 4, textAlign: 'center' },

  // History
  historySectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 24 },
  historyCountBadge: { backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  historyCountText: { fontSize: 12, fontWeight: '800', color: '#10b981' },

  historyCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 2 },
  historyIconWrap: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  historyTitle: { fontSize: 14, fontWeight: '800', color: '#111827', marginBottom: 5 },
  historyMeta: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  historyDate: { fontSize: 11, color: '#9ca3af', fontWeight: '500' },
  historyRight: { alignItems: 'flex-end', gap: 6 },
  historyPts: { fontSize: 15, fontWeight: '900', color: '#ef4444' },
  redeemedBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: '#ecfdf5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  redeemedBadgeText: { fontSize: 10, fontWeight: '700', color: '#059669' },

  historyEmpty: { backgroundColor: '#fff', borderRadius: 16, padding: 28, alignItems: 'center' },
  historyEmptyIconWrap: { width: 56, height: 56, borderRadius: 16, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  historyEmptyText: { fontSize: 14, fontWeight: '800', color: '#374151' },
  historyEmptySubText: { fontSize: 12, color: '#9ca3af', marginTop: 4, textAlign: 'center' },

  // Bottom sheet
  sheetOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, paddingBottom: 40 },
  sheetHandle: { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetIconWrap: { width: 64, height: 64, borderRadius: 20, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 14 },
  sheetTitle: { fontSize: 20, fontWeight: '900', color: '#111827', textAlign: 'center' },
  sheetDesc: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginTop: 6, lineHeight: 20 },
  sheetInfoRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  sheetInfoBox: { flex: 1, backgroundColor: '#f9fafb', borderRadius: 14, padding: 14, alignItems: 'center' },
  sheetInfoLabel: { fontSize: 12, color: '#9ca3af', fontWeight: '600', marginBottom: 4 },
  sheetInfoValue: { fontSize: 18, fontWeight: '900', color: '#111827' },
  sheetActions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  sheetCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, borderColor: '#e5e7eb', alignItems: 'center' },
  sheetCancelText: { fontWeight: '700', color: '#6b7280', fontSize: 15 },
  sheetConfirmBtn: { flex: 1, paddingVertical: 14, borderRadius: 14, backgroundColor: '#10b981', alignItems: 'center', shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  sheetConfirmText: { fontWeight: '800', color: '#fff', fontSize: 15 },
});

export default RewardsScreen;
