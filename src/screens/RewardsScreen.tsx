import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Confetti from '../components/Confetti';
import ScreenWrapper from '../components/ScreenWrapper';
import Card from '../components/ui/Card';
import { useRequests } from '../context';

const rewards = [
  { id: 'rw1', title: 'Reusable Bag', cost: 500, icon: 'bag-personal' },
  { id: 'rw2', title: 'Discount Voucher', cost: 300, icon: 'ticket-percent' },
  { id: 'rw3', title: 'Plant a Tree', cost: 1000, icon: 'tree' },
];

const RewardsScreen: React.FC = () => {
  const { points, redeemed, redeemReward, requests } = useRequests();

  const [displayPoints, setDisplayPoints] = React.useState<number>(points);
  const animPoints = React.useRef(new Animated.Value(points)).current;
  const [confetti, setConfetti] = React.useState(false);

  React.useEffect(() => {
    Animated.timing(animPoints, { toValue: points, duration: 700, useNativeDriver: false }).start();
    const id = animPoints.addListener(({ value }: { value: number }) => setDisplayPoints(Math.round(value)));
    return () => animPoints.removeListener(id);
  }, [points]);

  // pick next target reward
  const next = rewards.find(r => r.cost > points) ?? rewards[rewards.length - 1];
  const overallProgress = Math.min(1, points / next.cost);

  const partnerVouchers = requests.filter(r => r.pickupType === 'pickup' && r.status === 'Completed' && r.selectedPartner).map(r => ({ id: `pv-${r.id}`, title: `${r.selectedPartner!.name} Voucher`, partner: r.selectedPartner!.name, requestId: r.id }));

  const onRedeem = (item: { id: string; title: string; cost: number }) => {
    const ok = redeemReward(item.title, item.cost);
    if (!ok) {
      // show simple feedback
      alert('Not enough EcoPoints to redeem this reward.');
      return;
    }
    // trigger confetti on success
    setConfetti(true);
    setTimeout(() => setConfetti(false), 1400);
  };

  const rewardState = (item: { id: string; title: string; cost: number }) => {
    const isRedeemed = redeemed.some(r => r.title === item.title);
    if (isRedeemed) return 'redeemed';
    if (points >= item.cost) return 'available';
    return 'locked';
  };

  const formatCTA = (item: { id: string; title: string; cost: number }) => {
    const state = rewardState(item);
    if (state === 'redeemed') return 'View Voucher';
    if (state === 'available') return 'Redeem';
    return 'Earn more';
  };

  const onCTA = (item: { id: string; title: string; cost: number }) => {
    const state = rewardState(item);
    if (state === 'available') return onRedeem(item);
    if (state === 'locked') return alert(`You need ${item.cost - points} more EcoPoints to redeem this.`);
    // redeemed - show a message for now
    alert(`${item.title} already redeemed — open voucher to view details.`);
  };

  return (
    <ScreenWrapper>
    <ScrollView contentContainerStyle={{padding: 20, paddingBottom: 140}} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>My Rewards</Text>
        <Card style={styles.pointsCard}>
          <LinearGradient colors={["#22c55e", "#10b981"]} style={{borderRadius: 12, padding: 18, overflow: 'hidden'}} start={[0,0]} end={[1,1]}>
            <Text style={styles.pointsLabel}>Total EcoPoints</Text>
            <Animated.Text style={styles.pointsAmount}>{displayPoints.toLocaleString()}</Animated.Text>
            <View style={{marginTop:12}}>
              <Text style={{color:'rgba(255,255,255,0.9)'}}>Progress to "{next.title}"</Text>
              <View style={{height:8, backgroundColor:'rgba(255,255,255,0.12)', borderRadius:8, overflow:'hidden', marginTop:8}}>
                <View style={{width: `${overallProgress * 100}%`, height:'100%', backgroundColor:'#fff'}} />
              </View>
            </View>
          </LinearGradient>
        </Card>

        <Text style={{fontWeight:'800', marginTop: 18}}>Available Rewards</Text>

        <View style={{marginTop:12}}>
          {rewards.map(item => {
            const state = rewardState(item);
            const p = Math.min(1, points / item.cost);
            const stateLabel = state === 'redeemed' ? 'Redeemed' : (state === 'available' ? 'Available' : 'Locked');
            return (
              <View key={item.id} style={[styles.rewardCard, state === 'locked' ? styles.rewardCardLocked : null]}>
                <View style={{flex:1, marginRight:16}}>
                  <View style={{flexDirection:'row', alignItems:'center'}}>
                    <View style={{width:46,height:46,borderRadius:10,backgroundColor:'#ecfdf5',alignItems:'center',justifyContent:'center',marginRight:12}}>
                      <MaterialCommunityIcons name={item.icon as any} size={20} color="#065f46" />
                    </View>
                    <View style={{flex:1}}>
                      <Text style={styles.rewardTitle} numberOfLines={2}>{item.title}</Text>

                      <Text style={styles.rewardPoints}>{points} / {item.cost} EcoPoints</Text>

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
                    <TouchableOpacity onPress={() => onCTA(item)} style={[state === 'redeemed' ? styles.redeemRedeemed : styles.redeem, {marginTop:8}] }>
                      <Text style={styles.redeemText}>{formatCTA(item)}</Text>
                    </TouchableOpacity>
                  )}

                </View>
              </View>
            );
          })}
        </View>

        {partnerVouchers && partnerVouchers.length > 0 && (
          <View style={{marginTop: 18}}>
            <Text style={{fontWeight:'800'}}>Partner Vouchers</Text>
            {partnerVouchers.map(pv => (
              <View key={pv.id} style={{backgroundColor:'#fff', padding:12, borderRadius:10, marginTop:12, flexDirection:'row', justifyContent:'space-between', alignItems:'center'}}>
                <View>
                  <Text style={{fontWeight:'800'}}>{pv.title}</Text>
                  <Text style={{color:'#6b7280', marginTop:6}}>Provided by {pv.partner} after pickup</Text>
                </View>
                <TouchableOpacity style={[styles.redeem, {backgroundColor:'#047857'}]} onPress={() => alert('Open partner voucher')}><Text style={{color:'#fff', fontWeight:'800'}}>View voucher</Text></TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {redeemed && redeemed.length > 0 && (
          <View style={{marginTop: 18}}>
            <Text style={{fontWeight:'800'}}>Redeemed</Text>
            {redeemed.slice(0,5).map(r => (
              <View key={r.id} style={{backgroundColor:'#fff', padding:12, borderRadius:10, marginTop:12}}>
                <Text style={{fontWeight:'800'}}>{r.title}</Text>
                <Text style={{color:'#6b7280', marginTop:6}}>Redeemed on {new Date(r.redeemedAt).toLocaleString()}</Text>
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
