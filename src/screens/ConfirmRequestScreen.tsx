import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BackButton } from '../components';
import ProgressBar from '../components/ProgressBar';
import ScreenWrapper from '../components/ScreenWrapper';
import { getWasteIcon } from '../constants/wasteIcons';
import { calculatePointsForRequest, useRequests } from '../context';
import { useUploadFlow } from '../context/UploadFlowContext';

const ConfirmRequestScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const { selectedPartner, category, quantity, unit, pickupType, pickupAddress, setCategory, setQuantity, setPickupAddress } = useUploadFlow();
  const { addRequest } = useRequests();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton onPress={() => navigation.goBack()} style={styles.back} />

        <Text style={styles.title}>Confirm Request</Text>
        <ProgressBar current={5} total={5} />

        <Text style={styles.sectionTitle}>Selected Helper</Text>
        <View style={styles.helperCard}>
          <Text style={styles.helperName}>{selectedPartner?.name ?? 'No partner selected'}</Text>
          <Text style={styles.helperSub}>{selectedPartner ? 'Selected helper for pickup' : 'Please select a helper'}</Text>
        </View>

        <Text style={styles.sectionTitle}>Request Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.row}><Text style={styles.left}>Waste Type</Text><View style={{flexDirection:'row', alignItems:'center'}}><MaterialCommunityIcons name={getWasteIcon(category ?? 'Plastic') as any} size={18} color="#10b981" /><Text style={{marginLeft:8}}>{category ?? 'Plastic'}</Text></View></View>
          <View style={styles.row}><Text style={styles.left}>Quantity</Text><Text>{quantity ?? 1} items</Text></View>
          <View style={styles.row}><Text style={styles.left}>Pickup Address</Text><View style={{alignItems:'flex-end'}}><Text style={{textAlign:'right'}}>{pickupAddress ? `${pickupAddress.house}, ${pickupAddress.street}` : 'No address'}</Text><Text style={{color:'#6b7280', marginTop:6}}>{pickupAddress ? `${pickupAddress.city} - ${pickupAddress.pincode}` : ''}</Text></View></View>
        </View>

        <View style={styles.rewardNote}><Text style={styles.rewardTitle}>Estimated EcoPoints (Pending)</Text>
          <Text style={{marginTop:6}}>Estimated: <Text style={{color:'#10b981', fontWeight:'800'}}>{calculatePointsForRequest({ category: category ?? 'Plastic', quantity: quantity ?? 1, unit: 'items' })} EcoPoints</Text></Text>
          <Text style={{marginTop:8}}>EcoPoints will be credited only after pickup is completed and verified.</Text>
        </View>

        <TouchableOpacity style={styles.confirm} onPress={() => {
          const id = addRequest({
            category: category ?? 'Plastic',
            quantity: quantity ?? 1,
            unit: 'items',
            pickupType: 'pickup',
            selectedPartner: selectedPartner ?? null,
            pickupAddress: pickupAddress ?? undefined,
          } as any);
          // reset flow state
          setCategory(undefined);
          setQuantity(1, 'items');
          // clear address from flow
          setPickupAddress(null);

          // reset Upload stack to initial route so history is cleared
          navigation.reset({ index: 0, routes: [{ name: 'Identify' }] });

          // show success outside of the Identify flow (Requests stack)
          navigation.getParent()?.navigate('Requests', { screen: 'RequestSuccess', params: { requestId: id } });
        }}>
          <Text style={styles.confirmText}>Confirm Request  →</Text>
        </TouchableOpacity>

      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7f7f7' },
  container: { padding: 20 },
  back: { width: 36, height:36, borderRadius:18, alignItems:'center', justifyContent:'center', backgroundColor:'#fff', marginBottom:12 },
  title: { textAlign: 'center', fontSize: 20, fontWeight: '800', marginBottom: 18 },
  sectionTitle: { color:'#6b7280', fontWeight:'700', marginTop:12 },
  helperCard: { backgroundColor:'#fff', borderRadius:12, padding:12, marginTop:8 },
  helperName: { fontWeight:'800' },
  helperSub: { color:'#6b7280', marginTop:6 },
  detailsCard: { backgroundColor:'#fff', borderRadius:12, padding:12, marginTop:8 },
  row: { flexDirection:'row', justifyContent:'space-between', paddingVertical:12, borderBottomWidth:1, borderBottomColor:'#f1f5f9' },
  left: { color:'#6b7280' },
  rewardNote: { backgroundColor:'#ecfdf5', borderRadius:12, padding:12, marginTop:12 },
  rewardTitle: { fontWeight:'800' },
  confirm: { backgroundColor:'#10b981', paddingVertical:14, borderRadius:999, marginTop:20, alignItems:'center' },
  confirmText: { color:'#fff', fontWeight:'800' },
});

export default ConfirmRequestScreen;
