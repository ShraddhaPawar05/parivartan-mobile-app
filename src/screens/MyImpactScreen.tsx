import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ScreenWrapper from '../components/ScreenWrapper';
import { useAuth } from '../context/AuthContext';
import { doc, onSnapshot, collection, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';

interface RecentActivity {
  id: string;
  type: string;
  status: string;
  ecoPointsAwarded?: number;
  createdAt: any;
  updatedAt?: any;
}

const MILESTONES = [100, 250, 500, 1000, 2500, 5000, 10000];

const timeAgo = (date: Date): string => {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return date.toLocaleDateString();
};

const MyImpactScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const { user } = useAuth();
  const [ecoPoints, setEcoPoints] = useState(0);
  const [allRequests, setAllRequests] = useState<RecentActivity[]>([]);

  // Derive from full list — single source of truth
  const completedRequests = allRequests.filter(r => r.status === 'Completed').length;
  const recentActivity = allRequests.slice(0, 3);

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), snap => {
      if (snap.exists()) {
        const d = snap.data();
        setEcoPoints(d.ecoPoints ?? 0);
      }
    });
    return () => unsub();
  }, [user?.uid]);

  // Fetch ALL user requests, sort in JS, take top 3 — no composite index needed
  useEffect(() => {
    if (!user?.uid) return;
    const q = query(
      collection(db, 'wasteRequests'),
      where('userId', '==', user.uid)
    );
    const unsub = onSnapshot(q, snap => {
      const sorted = snap.docs
        .map(d => ({ id: d.id, ...d.data() } as RecentActivity))
        .sort((a, b) => {
          const aT = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const bT = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return bT.getTime() - aT.getTime();
        });
      setAllRequests(sorted); // store ALL, not just 3
    });
    return () => unsub();
  }, [user?.uid]);

  const hasPoints = ecoPoints > 0;
  const hasActivity = recentActivity.length > 0;
  // Progress = ecoPoints / nextMilestone (always from 0, not from prevMilestone)
  const nextMilestone = MILESTONES.find(m => m > ecoPoints) ?? MILESTONES[MILESTONES.length - 1];
  const progress = Math.min(ecoPoints / nextMilestone, 1);
  const ptsToUnlock = Math.max(nextMilestone - ecoPoints, 0);
  const progressPct = Math.round(progress * 100);

  const getActivityLabel = (item: RecentActivity): { icon: string; color: string; text: string } => {
    if (item.status === 'Completed') return {
      icon: 'check-circle',
      color: '#10b981',
      text: `Pickup completed${item.ecoPointsAwarded ? ` · +${item.ecoPointsAwarded} pts` : ''}`,
    };
    if (item.status === 'In Progress') return { icon: 'truck-delivery', color: '#3b82f6', text: 'Pickup in progress' };
    if (item.status === 'Accepted') return { icon: 'check', color: '#8b5cf6', text: 'Request accepted' };
    return { icon: 'clock-outline', color: '#f59e0b', text: 'Request submitted' };
  };

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>My Impact</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Hero */}
        <LinearGradient colors={['#10b981', '#059669']} start={[0, 0]} end={[1, 1]} style={styles.heroCard}>
          <MaterialCommunityIcons name="leaf" size={80} color="rgba(255,255,255,0.08)" style={styles.heroBg} />
          {hasPoints ? (
            <>
              <Text style={styles.heroEmoji}>♻️</Text>
              <Text style={styles.heroTitle}>You've earned {ecoPoints.toLocaleString()} EcoPoints</Text>
              <Text style={styles.heroSub}>Keep going and increase your impact 🚀</Text>
            </>
          ) : (
            <>
              <Text style={styles.heroEmoji}>🌱</Text>
              <Text style={styles.heroTitle}>Start your first recycling action</Text>
              <Text style={styles.heroSub}>Schedule a pickup to begin your impact journey</Text>
            </>
          )}
        </LinearGradient>

        {/* 2 Metric Cards */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: '#ecfdf5' }]}>
              <MaterialCommunityIcons name="recycle" size={22} color="#10b981" />
            </View>
            <Text style={styles.metricValue}>{completedRequests > 0 ? `${completedRequests}` : '0'}</Text>
            <Text style={styles.metricLabel}>
              {completedRequests > 0 ? `pickup${completedRequests > 1 ? 's' : ''} completed` : 'No activity yet'}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <View style={[styles.metricIconWrap, { backgroundColor: '#fffbeb' }]}>
              <MaterialCommunityIcons name="star-circle" size={22} color="#f59e0b" />
            </View>
            <Text style={styles.metricValue}>{ecoPoints.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>
              {ecoPoints > 0 ? 'pts earned' : 'No points yet'}
            </Text>
            {ecoPoints > 0 && <Text style={styles.metricHelper}>Earned from recycling</Text>}
          </View>
        </View>

        {/* Milestone */}
        <View style={styles.milestoneCard}>
          <View style={styles.milestoneTop}>
            <View>
              <Text style={styles.milestoneTitle}>🎯 Next Reward: {nextMilestone.toLocaleString()} pts</Text>
              <Text style={styles.milestoneSub}>
                {ecoPoints > 0
                  ? `${ecoPoints.toLocaleString()} / ${nextMilestone.toLocaleString()} pts completed`
                  : `0 / ${nextMilestone.toLocaleString()} pts completed`}
              </Text>
            </View>
            <View style={styles.milestoneCircle}>
              <Text style={styles.milestoneCircleVal}>{progressPct}%</Text>
            </View>
          </View>

          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progressPct}%` as any }]} />
          </View>

          <Text style={styles.milestoneUnlock}>
            {ptsToUnlock > 0
              ? `${ptsToUnlock.toLocaleString()} pts to unlock`
              : '🎉 Milestone reached!'}
          </Text>
        </View>

        {/* Recent Activity */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>🕒 Recent Activity</Text>
        </View>

        {recentActivity.length === 0 ? (
          <View style={styles.emptyActivity}>
            <MaterialCommunityIcons name="history" size={36} color="#d1d5db" />
            <Text style={styles.emptyActivityText}>No activity yet</Text>
            <Text style={styles.emptyActivitySub}>Your pickups will appear here</Text>
          </View>
        ) : (
          recentActivity.map(item => {
            const label = getActivityLabel(item);
            const date = item.updatedAt?.toDate?.() || item.createdAt?.toDate?.() || new Date();
            return (
              <View key={item.id} style={styles.activityItem}>
                <View style={[styles.activityIconWrap, { backgroundColor: label.color + '18' }]}>
                  <MaterialCommunityIcons name={label.icon as any} size={20} color={label.color} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityText}>{label.text}</Text>
                  <Text style={styles.activityType}>{item.type} Waste · {timeAgo(date)}</Text>
                </View>
              </View>
            );
          })
        )}

        <View style={{ height: 160 }} />
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.ctaWrap}>
        <TouchableOpacity
          style={styles.ctaBtn}
          onPress={() => navigation.navigate('Identify')}
          activeOpacity={0.88}
        >
          <MaterialCommunityIcons name="recycle" size={20} color="#fff" />
          <Text style={styles.ctaText}>Schedule Pickup ♻️</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  title: { fontSize: 22, fontWeight: '800', color: '#111827' },

  heroCard: { borderRadius: 20, padding: 24, marginBottom: 20, overflow: 'hidden' },
  heroBg: { position: 'absolute', right: -10, bottom: -10 },
  heroEmoji: { fontSize: 36, marginBottom: 8 },
  heroTitle: { fontSize: 20, fontWeight: '900', color: '#fff', lineHeight: 26 },
  heroSub: { fontSize: 13, color: 'rgba(255,255,255,0.85)', marginTop: 6, lineHeight: 18 },

  metricsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  metricCard: { flex: 1, backgroundColor: '#fff', borderRadius: 16, padding: 18, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  metricIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  metricValue: { fontSize: 28, fontWeight: '900', color: '#111827' },
  metricLabel: { fontSize: 12, color: '#6b7280', fontWeight: '600', marginTop: 2 },
  metricHelper: { fontSize: 11, color: '#9ca3af', marginTop: 4 },

  milestoneCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  milestoneTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  milestoneTitle: { fontSize: 15, fontWeight: '800', color: '#111827', marginBottom: 4 },
  milestoneSub: { fontSize: 12, color: '#6b7280', fontWeight: '600' },
  milestoneCircle: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#ecfdf5', borderWidth: 2.5, borderColor: '#10b981', alignItems: 'center', justifyContent: 'center' },
  milestoneCircleVal: { fontSize: 13, fontWeight: '900', color: '#10b981' },
  progressBg: { height: 10, backgroundColor: '#f1f5f9', borderRadius: 10, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#10b981', borderRadius: 10 },
  milestoneUnlock: { fontSize: 12, color: '#6b7280', marginTop: 8, fontWeight: '600' },

  sectionHeader: { marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827' },

  emptyActivity: { alignItems: 'center', paddingVertical: 32, backgroundColor: '#fff', borderRadius: 16 },
  emptyActivityText: { fontSize: 15, fontWeight: '700', color: '#9ca3af', marginTop: 10 },
  emptyActivitySub: { fontSize: 12, color: '#d1d5db', marginTop: 4 },

  activityItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 6, elevation: 1 },
  activityIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  activityContent: { flex: 1 },
  activityText: { fontSize: 14, fontWeight: '700', color: '#111827' },
  activityType: { fontSize: 12, color: '#9ca3af', marginTop: 3 },

  ctaWrap: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16, paddingBottom: 90, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  ctaBtn: { backgroundColor: '#10b981', borderRadius: 16, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  ctaText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});

export default MyImpactScreen;
