import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import React, { useState, useCallback, useEffect } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import Confetti from '../components/Confetti';
import ScreenWrapper from '../components/ScreenWrapper';
import Card from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import { getUserEcoPoints, getUserRewardHistory, RewardTransaction, subscribeToVouchers, Voucher } from '../services/rewardsService';
import { doc, onSnapshot, updateDoc, increment, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const RewardsScreen: React.FC = () => {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);
  const [rewardHistory, setRewardHistory] = useState<RewardTransaction[]>([]);
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeToVouchers((updatedVouchers) => {
      setVouchers(updatedVouchers);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  useEffect(() => {
    if (!user?.uid) return;

    console.log('🔵 RewardsScreen: Subscribing to user document:', user.uid);
    const userDocRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        console.log('✅ RewardsScreen: User data updated, ecoPoints:', data.ecoPoints);
        setPoints(data.ecoPoints ?? 0);
      } else {
        console.log('⚠️ RewardsScreen: User document does not exist');
      }
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const loadRewardsData = useCallback(async () => {
    if (!user?.uid) return;
    
    try {
      setLoading(true);
      const history = await getUserRewardHistory(user.uid);
      setRewardHistory(history);
    } catch (error) {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useFocusEffect(
    useCallback(() => {
      loadRewardsData();
    }, [loadRewardsData])
  );

  const [displayPoints, setDisplayPoints] = React.useState<number>(points);
  const animPoints = React.useRef(new Animated.Value(points)).current;
  const [confetti, setConfetti] = React.useState(false);

  React.useEffect(() => {
    Animated.timing(animPoints, { toValue: points, duration: 700, useNativeDriver: false }).start();
    const id = animPoints.addListener(({ value }: { value: number }) => setDisplayPoints(Math.round(value)));
    return () => animPoints.removeListener(id);
  }, [points]);

  if (loading) {
    return (
      <ScreenWrapper>
        <View style={{padding: 20, alignItems: 'center', justifyContent: 'center', flex: 1}}>
          <Text>Loading rewards...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  // pick next target reward
  const sortedVouchers = [...vouchers].sort((a, b) => a.pointsRequired - b.pointsRequired);
  const next = sortedVouchers.find(v => v.pointsRequired > points) ?? sortedVouchers[sortedVouchers.length - 1] ?? { title: 'Next Voucher', pointsRequired: 1000 };
  const overallProgress = Math.min(1, points / next.pointsRequired);

  const onRedeem = async (item: { id: string; title: string; pointsRequired: number }) => {
    if (points < item.pointsRequired) {
      Alert.alert('Insufficient Points', `You need ${item.pointsRequired - points} more EcoPoints to redeem this voucher.`);
      return;
    }

    Alert.alert(
      'Confirm Redemption',
      `Redeem "${item.title}" for ${item.pointsRequired} EcoPoints?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Redeem',
          onPress: async () => {
            try {
              console.log('🔵 Redeeming voucher:', item.title);
              console.log('🔵 User ID:', user?.uid);
              console.log('🔵 Points required:', item.pointsRequired);
              console.log('🔵 Current points:', points);

              await updateDoc(doc(db, 'users', user!.uid), {
                ecoPoints: increment(-item.pointsRequired)
              });
              console.log('✅ EcoPoints decremented by', item.pointsRequired);

              await addDoc(collection(db, 'rewardTransactions'), {
                userId: user!.uid,
                voucherId: item.id,
                voucherTitle: item.title,
                points: item.pointsRequired,
                type: 'redeemed',
                createdAt: serverTimestamp()
              });
              console.log('✅ Redemption transaction recorded');

              setConfetti(true);
              setTimeout(() => setConfetti(false), 3000);
              Alert.alert('Success!', `You've redeemed "${item.title}"!`);
              loadRewardsData();
            } catch (error) {
              console.error('❌ Error redeeming voucher:', error);
              Alert.alert('Error', 'Failed to redeem voucher. Please try again.');
            }
          }
        }
      ]
    );
  };

  const voucherState = (item: { id: string; title: string; pointsRequired: number }) => {
    if (points >= item.pointsRequired) return 'available';
    return 'locked';
  };

  const formatCTA = (item: { id: string; title: string; pointsRequired: number }) => {
    const state = voucherState(item);
    if (state === 'available') return 'Redeem';
    return 'Earn more';
  };

  const onCTA = (item: { id: string; title: string; pointsRequired: number }) => {
    const state = voucherState(item);
    if (state === 'available') return onRedeem(item);
    if (state === 'locked') return Alert.alert('Locked', `You need ${item.pointsRequired - points} more EcoPoints to redeem this.`);
  };

  return (
    <ScreenWrapper>
    <ScrollView contentContainerStyle={{padding: 20, paddingBottom: 140}} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>My Rewards</Text>
        <Card style={styles.pointsCard}>
          <LinearGradient colors={["#22c55e", "#10b981"]} style={{borderRadius: 12, padding: 18, overflow: 'hidden'}} start={[0,0]} end={[1,1]}>
            <Text style={styles.pointsLabel}>Total EcoPoints</Text>
            <Animated.Text style={styles.pointsAmount}>{displayPoints.toLocaleString()}</Animated.Text>
            {vouchers.length > 0 && (
              <View style={{marginTop:12}}>
                <Text style={{color:'rgba(255,255,255,0.9)'}}>Progress to "{next.title}"</Text>
                <View style={{height:8, backgroundColor:'rgba(255,255,255,0.12)', borderRadius:8, overflow:'hidden', marginTop:8}}>
                  <View style={{width: `${overallProgress * 100}%`, height:'100%', backgroundColor:'#fff'}} />
                </View>
              </View>
            )}
          </LinearGradient>
        </Card>

        <Text style={{fontWeight:'800', marginTop: 18}}>Available Vouchers</Text>

        <View style={{marginTop:12}}>
          {vouchers.length === 0 ? (
            <View style={{backgroundColor:'#fff', padding:20, borderRadius:12, alignItems:'center'}}>
              <MaterialCommunityIcons name="gift-outline" size={48} color="#d1d5db" />
              <Text style={{color: '#6b7280', textAlign: 'center', marginTop: 12, fontSize: 16}}>No vouchers available</Text>
              <Text style={{color: '#9ca3af', textAlign: 'center', marginTop: 4, fontSize: 14}}>Check back soon for exciting vouchers!</Text>
            </View>
          ) : (
            vouchers.map(item => {
            const state = voucherState(item);
            const p = Math.min(1, points / item.pointsRequired);
            const stateLabel = state === 'available' ? 'Available' : 'Locked';
            return (
              <View key={item.id} style={[styles.rewardCard, state === 'locked' ? styles.rewardCardLocked : null]}>
                <View style={{flex:1, marginRight:16}}>
                  <View style={{flexDirection:'row', alignItems:'center'}}>
                    <View style={{width:46,height:46,borderRadius:10,backgroundColor:'#ecfdf5',alignItems:'center',justifyContent:'center',marginRight:12}}>
                      <MaterialCommunityIcons name="ticket-percent" size={20} color="#065f46" />
                    </View>
                    <View style={{flex:1}}>
                      <Text style={styles.rewardTitle} numberOfLines={2}>{item.title}</Text>

                      <Text style={styles.rewardPoints}>{points} / {item.pointsRequired} EcoPoints</Text>

                      <View style={styles.rewardProgressWrap}>
                        <View style={{height:8, backgroundColor:'rgba(0,0,0,0.06)', borderRadius:8, overflow:'hidden'}}>
                          <View style={{width: `${p * 100}%`, height:'100%', backgroundColor:'#10b981'}} />
                        </View>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={styles.rewardActionArea}>
                  <Text style={styles.rewardStatusLabel}>{stateLabel}</Text>

                  {state === 'locked' ? (
                    <View style={styles.lockWrap}>
                      <MaterialCommunityIcons name="lock" size={18} color="#6b7280" />
                    </View>
                  ) : (
                    <TouchableOpacity onPress={() => onCTA(item)} style={[styles.redeem, {marginTop:8}] }>
                      <Text style={styles.redeemText}>{formatCTA(item)}</Text>
                    </TouchableOpacity>
                  )}

                </View>
              </View>
            );
          })
          )}
        </View>

        {rewardHistory && rewardHistory.length > 0 && (
          <View style={{marginTop: 18}}>
            <Text style={{fontWeight:'800'}}>Reward History</Text>
            {rewardHistory.slice(0,5).map(r => (
              <View key={r.id} style={{backgroundColor:'#fff', padding:12, borderRadius:10, marginTop:12}}>
                <Text style={{fontWeight:'800'}}>+{r.points} EcoPoints Earned</Text>
                <Text style={{color:'#6b7280', marginTop:6}}>Earned on {new Date(r.createdAt?.toDate?.() || r.createdAt).toLocaleDateString()}</Text>
              </View>
            ))}
          </View>
        )}

        <Confetti active={confetti} />

        <View style={{height: 48}} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  pointsCard: { borderRadius: 14, padding: 18 },
  pointsLabel: { color: 'rgba(255,255,255,0.95)', fontSize: 12, fontWeight: '800' },
  pointsAmount: { color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 8 },
  pageTitle: { fontSize:20, fontWeight:'800', marginBottom:12 },
  rewardCard: { backgroundColor:'#fff', padding: 16, borderRadius: 12, marginBottom: 12, flexDirection:'row', justifyContent:'space-between', alignItems:'center', minHeight:88 },
  rewardCardLocked: { backgroundColor:'#f3f4f6', opacity:0.6 },
  rewardTitle: { fontWeight:'800', fontSize:15, color:'#111827', flexShrink:1 },
  rewardPoints: { color:'#6b7280', marginTop:6 },
  rewardProgressWrap: { marginTop:10 },
  rewardStatusLabel: { fontSize:12, color:'#6b7280', fontWeight:'700', marginBottom:6 },
  rewardActionArea: { width:110, alignItems:'center', justifyContent:'center' },
  lockWrap: { marginTop:8, padding:8, borderRadius:20, borderWidth:1, borderColor:'#e5e7eb' },
  redeem: { backgroundColor:'#10b981', paddingHorizontal:14, paddingVertical:10, borderRadius:10, minWidth:96, alignItems:'center' },
  redeemRedeemed: { backgroundColor:'#6b7280', paddingHorizontal:14, paddingVertical:10, borderRadius:10, minWidth:96, alignItems:'center' },
  redeemText: { color:'#fff', fontWeight:'800' }
});

export default RewardsScreen;
