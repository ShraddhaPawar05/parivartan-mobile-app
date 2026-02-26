import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import React, { useState, useRef, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import ScreenWrapper from "../components/ScreenWrapper";
import Card from "../components/ui/Card";
import StatusDot from "../components/StatusDot";
import { getWasteIcon } from "../constants/wasteIcons";
import { useAuth } from "../context/AuthContext";
import { subscribeToUserRequests, WasteRequest } from "../services/requestService";
import { sendStatusUpdateNotification } from "../services/pushNotificationService";
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { STATUS_FLOW } from '../constants/statusFlow';
import { normalizeStatus } from '../utils/statusNormalizer';

const RequestsScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const { user } = useAuth();
  const [requests, setRequests] = useState<WasteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const previousStatusRef = useRef<Map<string, string>>(new Map());
  const [partnerNames, setPartnerNames] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    const unsubscribe = subscribeToUserRequests(
      user.uid,
      async (updatedRequests) => {
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
        
        const newPartnerNames = new Map<string, string>();
        for (const request of updatedRequests) {
          const partnerId = (request as any).partnerId;
          if (partnerId && !partnerNames.has(partnerId)) {
            try {
              const partnerDoc = await getDoc(doc(db, 'partners', partnerId));
              if (partnerDoc.exists()) {
                newPartnerNames.set(partnerId, partnerDoc.data().name || 'Recycler Partner');
              }
            } catch (error) {
              // Silent fail
            }
          }
        }
        
        if (newPartnerNames.size > 0) {
          setPartnerNames(prev => new Map([...prev, ...newPartnerNames]));
        }
        
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsubscribe();
  }, [user?.uid]);

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={{ padding: 20, alignItems: "center", justifyContent: "center", flex: 1 }}>
          <Text>Loading requests...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  if (requests.length === 0) {
    return (
      <ScreenWrapper>
        <View style={{ padding: 20 }}>
          <MaterialCommunityIcons name="recycle" size={88} color="#10b981" style={{alignSelf:'center'}} />
          <Text style={[styles.title, { marginTop: 12, textAlign:'center' }]}>
            No requests yet
          </Text>
          <Text style={[styles.sub, { textAlign: "center", marginTop: 6 }]}>
            Start by identifying waste or exploring recycler partners.
          </Text>

          <TouchableOpacity
            style={[styles.cta, { marginTop: 20, width: "84%", alignSelf:'center' }]}
            onPress={() => navigation.navigate("Identify")}
          >
            <Text style={styles.ctaText}>Identify Waste</Text>
          </TouchableOpacity>

          <View style={{ height: 120 }} />
        </View>
      </ScreenWrapper>
    );
  }

  const active = requests.filter((r) => r.status !== 'Completed');
  const completed = requests.filter((r) => r.status === 'Completed');
  const totalKg = completed.reduce((s, r) => s + ((r as any).quantity || 0), 0);

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontWeight: "800", fontSize: 18, marginBottom: 12 }}>
          All Requests ({requests.length})
        </Text>

        {active.length > 0 && (
          <View>
            <Text style={{ fontWeight: "700", fontSize: 16, marginBottom: 8, color: '#6b7280' }}>
              Active ({active.length})
            </Text>
            {active.map((item) => {
              const wasteType = (item as any).type || (item as any).wasteType || 'Unknown';
              const partnerId = (item as any).partnerId;
              const partnerDisplayName = partnerId ? (partnerNames.get(partnerId) || 'Recycler Partner') : 'Pending Assignment';
              const currentIndex = STATUS_FLOW.indexOf(item.status);
              const validIndex = currentIndex >= 0 ? currentIndex : 0;

              return (
                <Card key={item.id} style={{ marginBottom: 12 }}>
                  <TouchableOpacity onPress={() => navigation.navigate("RequestDetails", { id: item.id })}>
                    <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
                      <View style={styles.iconWrap}>
                        <MaterialCommunityIcons name={getWasteIcon(wasteType) as any} size={24} color="#065f46" />
                      </View>
                      <View style={{ flex: 1, marginLeft: 14 }}>
                        <Text style={styles.wasteTitle}>{wasteType} Waste</Text>
                        <Text style={styles.partnerName}>{partnerDisplayName}</Text>

                        <View style={styles.statusRow}>
                          <Text style={[styles.statusText, { color: "#6b7280" }]}>{item.status}</Text>
                          <Text style={styles.date}>
                            {new Date(item.createdAt?.toDate?.() || item.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                        
                        {item.status === 'In Progress' && (item as any).scheduledAt && (
                          <View style={styles.scheduledInfo}>
                            <MaterialCommunityIcons name="clock-outline" size={14} color="#3b82f6" />
                            <Text style={styles.scheduledText}>
                              {(() => {
                                const date = (item as any).scheduledAt?.toDate?.() || new Date((item as any).scheduledAt);
                                return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
                              })()}
                            </Text>
                          </View>
                        )}

                        <View style={styles.trackerRowSmall}>
                          {[0, 1, 2, 3].map((dotIndex) => (
                            <StatusDot key={dotIndex} isActive={dotIndex <= validIndex} />
                          ))}
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Card>
              );
            })}
          </View>
        )}

        {completed.length > 0 && (
          <View style={{ marginTop: active.length > 0 ? 18 : 0 }}>
            <Text style={{ fontWeight: "700", fontSize: 16, marginBottom: 8, color: '#6b7280' }}>
              Completed ({completed.length})
            </Text>
            {completed.map((c) => {
              const completedWasteType = (c as any).type || (c as any).wasteType || 'Unknown';
              const completedPartnerId = (c as any).partnerId;
              const completedPartnerName = completedPartnerId ? (partnerNames.get(completedPartnerId) || 'Recycler Partner') : 'Recycler Partner';
              return (
                <TouchableOpacity key={c.id} onPress={() => navigation.navigate("RequestDetails", { id: c.id })}>
                  <Card style={{ marginBottom: 12 }}>
                    <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                      <View>
                        <Text style={{ fontWeight: "800" }}>{completedWasteType} — {completedPartnerName}</Text>
                        <Text style={{ color: "#6b7280", marginTop: 6 }}>
                          {new Date(c.createdAt?.toDate?.() || c.createdAt).toLocaleDateString()}
                        </Text>
                      </View>
                      <Text style={{ color: "#10b981", fontWeight: "800" }}>✓</Text>
                    </View>
                  </Card>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {totalKg > 0 && (
          <View style={{ marginTop: 18 }}>
            <Text style={{ fontWeight: "800" }}>Impact</Text>
            <Card style={{ marginTop: 12 }}>
              <Text style={{ fontWeight: "800" }}>You've recycled {totalKg.toFixed(1)} kg of waste 🌱</Text>
              <Text style={{ color: "#6b7280", marginTop: 6 }}>Your actions help reduce landfill waste</Text>
            </Card>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  title: { fontSize: 22, fontWeight: "800", marginBottom: 6 },
  sub: { color: "#6b7280", marginTop: 4 },
  cta: { marginTop: 20, backgroundColor: "#10b981", paddingVertical: 14, paddingHorizontal: 24, borderRadius: 999 },
  ctaText: { color: "#fff", fontWeight: "800" },
  partnerName: { color: "#6b7280", marginTop: 8, fontWeight: "600" },
  statusRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  statusText: { fontWeight: "700" },
  trackerRowSmall: { flexDirection: "row", marginTop: 10, alignItems: "center" },
  wasteTitle: { fontWeight: "900", fontSize: 16, color: "#111827" },
  date: { color: "#6b7280", fontSize: 13 },
  iconWrap: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center" },
  scheduledInfo: { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 4 },
  scheduledText: { fontSize: 12, color: '#3b82f6', fontWeight: '600' },
});

export default RequestsScreen;