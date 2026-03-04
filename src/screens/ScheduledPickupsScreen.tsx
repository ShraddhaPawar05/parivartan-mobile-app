import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { subscribeToUserSchedules, ScheduledPickup } from '../services/scheduledPickupService';
import { getWasteIcon } from '../constants/wasteIcons';
import ScreenWrapper from '../components/ScreenWrapper';
import { useNavigation } from '@react-navigation/native';

const ScheduledPickupsScreen: React.FC = () => {
  const navigation = useNavigation();
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

  const upcoming = schedules.filter(s => s.status === 'scheduled');
  const past = schedules.filter(s => s.status !== 'scheduled');

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Scheduled Pickups</Text>
          <View style={{width:36}} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <MaterialCommunityIcons name="loading" size={32} color="#10b981" />
            <Text style={styles.loadingText}>Loading schedules...</Text>
          </View>
        ) : schedules.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons name="calendar-blank" size={48} color="#d1d5db" />
            </View>
            <Text style={styles.emptyText}>No scheduled pickups</Text>
            <Text style={styles.emptySubtext}>Your partner will schedule pickups for your requests</Text>
          </View>
        ) : (
          <>
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
                          color="#10b981" 
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
                          color="#10b981" 
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
          </>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backBtn: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  
  loadingContainer: { alignItems: 'center', marginTop: 60 },
  loadingText: { marginTop: 12, color: '#6b7280', fontSize: 14 },
  
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12, color: '#111827' },
  
  card: { 
    backgroundColor: '#fff', 
    borderRadius: 14, 
    padding: 16, 
    marginBottom: 12, 
    shadowColor: '#000', 
    shadowOpacity: 0.04, 
    shadowRadius: 8, 
    elevation: 2 
  },
  pastCard: { opacity: 0.6 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconWrap: { 
    width: 48, 
    height: 48, 
    borderRadius: 14, 
    backgroundColor: '#ecfdf5', 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  wasteType: { fontSize: 15, fontWeight: '800', color: '#111827' },
  date: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '700', textTransform: 'capitalize' },
  details: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 13, color: '#6b7280', fontWeight: '600' },
  value: { fontSize: 13, color: '#111827', fontWeight: '600', flex: 1, textAlign: 'right' },
  
  empty: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptySubtext: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
});

export default ScheduledPickupsScreen;
