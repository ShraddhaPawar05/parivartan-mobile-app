import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { subscribeToUserSchedules, ScheduledPickup } from '../services/scheduledPickupService';
import { getWasteIcon } from '../constants/wasteIcons';

const ScheduledPickupsScreen: React.FC = () => {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState<ScheduledPickup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToUserSchedules(
      user.uid,
      (data) => {
        setSchedules(data);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching schedules:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user?.uid]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'completed': return '#10b981';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading schedules...</Text>
      </View>
    );
  }

  const upcoming = schedules.filter(s => s.status === 'scheduled');
  const past = schedules.filter(s => s.status !== 'scheduled');

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scheduled Pickups</Text>
        <Text style={styles.subtitle}>Your upcoming waste collection schedule</Text>
      </View>

      {upcoming.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming ({upcoming.length})</Text>
          {upcoming.map((schedule) => (
            <View key={schedule.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconWrap}>
                  <MaterialCommunityIcons 
                    name={getWasteIcon(schedule.wasteType) as any} 
                    size={24} 
                    color="#065f46" 
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.wasteType}>{schedule.wasteType} Waste</Text>
                  <Text style={styles.date}>
                    📅 {new Date(schedule.date?.toDate?.() || schedule.date).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(schedule.status) }]}>
                  <Text style={styles.statusText}>{schedule.status}</Text>
                </View>
              </View>

              <View style={styles.details}>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Quantity:</Text>
                  <Text style={styles.value}>{schedule.quantity} kg</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.label}>Location:</Text>
                  <Text style={styles.value}>
                    {schedule.location.house}, {schedule.location.street}, {schedule.location.city}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {past.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Past Pickups ({past.length})</Text>
          {past.map((schedule) => (
            <View key={schedule.id} style={[styles.card, styles.pastCard]}>
              <View style={styles.cardHeader}>
                <View style={styles.iconWrap}>
                  <MaterialCommunityIcons 
                    name={getWasteIcon(schedule.wasteType) as any} 
                    size={24} 
                    color="#065f46" 
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.wasteType}>{schedule.wasteType} Waste</Text>
                  <Text style={styles.date}>
                    {new Date(schedule.date?.toDate?.() || schedule.date).toLocaleDateString()}
                  </Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(schedule.status) }]}>
                  <Text style={styles.statusText}>{schedule.status}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      )}

      {schedules.length === 0 && (
        <View style={styles.empty}>
          <MaterialCommunityIcons name="calendar-blank" size={64} color="#d1d5db" />
          <Text style={styles.emptyText}>No scheduled pickups</Text>
          <Text style={styles.emptySubtext}>Your partner will schedule pickups for your requests</Text>
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
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12, 
    shadowColor: '#000', 
    shadowOpacity: 0.05, 
    shadowRadius: 8, 
    elevation: 2 
  },
  pastCard: { opacity: 0.7 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconWrap: { 
    width: 48, 
    height: 48, 
    borderRadius: 12, 
    backgroundColor: '#ecfdf5', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  wasteType: { fontSize: 16, fontWeight: '800', color: '#111827' },
  date: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '700', textTransform: 'capitalize' },
  details: { marginTop: 8 },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, color: '#6b7280', fontWeight: '600' },
  value: { fontSize: 14, color: '#111827', fontWeight: '500', flex: 1, textAlign: 'right' },
  empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#9ca3af', marginTop: 16 },
  emptySubtext: { fontSize: 14, color: '#d1d5db', marginTop: 8, textAlign: 'center' },
});

export default ScheduledPickupsScreen;
