import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BackButton } from '../components';
import ProgressBar from '../components/ProgressBar';
import ScreenWrapper from '../components/ScreenWrapper';
import { useUploadFlow } from '../context/UploadFlowContext';

const EnterQuantityScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const [quantity, setQuantity] = useState(1);

  const { setQuantity: setFlowQuantity } = useUploadFlow();

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton onPress={() => navigation.goBack()} style={styles.back} />

        <Text style={styles.title}>Enter Quantity</Text>
        <ProgressBar current={3} total={5} />

        <View style={styles.itemCard}>
          <View style={styles.itemLeft}>
            <View style={styles.thumb} />
            <View style={{marginLeft: 12}}>
              <Text style={styles.itemTitle}>Plastic Waste</Text>
              <Text style={styles.itemSub}>HIGH CONFIDENCE</Text>
            </View>
            <TouchableOpacity style={styles.edit}><Text>✎</Text></TouchableOpacity>
          </View>
        </View>

        <View style={{alignItems:'center'}}>
          <Text style={{fontWeight:'800', fontSize:16}}>Number of items</Text>
          <Text style={{color:'#6b7280', marginTop:6}}>Approximate count is fine. No need to be exact.</Text>
        </View>

        <View style={styles.counterRow}>
          <TouchableOpacity style={styles.circle} onPress={() => setQuantity(Math.max(1, quantity - 1))}><Text style={{fontSize:24,color:'#10b981'}}>-</Text></TouchableOpacity>
          <Text style={styles.qty}>{quantity}</Text>
          <TouchableOpacity style={[styles.circle, {backgroundColor:'#10b981'}]} onPress={() => setQuantity(quantity + 1)}><Text style={{fontSize:24,color:'#fff'}}>+</Text></TouchableOpacity>
        </View>

        <Text style={styles.note}>Approximate count is fine. No need to be exact.</Text>

        <TouchableOpacity style={styles.next} onPress={() => { setFlowQuantity(quantity, 'items'); navigation.navigate('PickupAddress'); }}>
          <Text style={styles.nextText}>Continue</Text>
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
  itemCard: { backgroundColor:'#fff', borderRadius:12, padding:12 },
  itemLeft: { flexDirection:'row', alignItems:'center' },
  thumb: { width:44, height:44, borderRadius:22, backgroundColor:'#f3f4f6' },
  itemTitle: { fontWeight:'700' },
  itemSub: { color:'#10b981', fontWeight:'700', marginTop:6 },
  edit: { marginLeft:'auto' },
  toggles: { flexDirection:'row', backgroundColor:'#fff', padding:6, borderRadius:999, marginTop:30, alignSelf:'center' },
  unit: { paddingHorizontal:18, paddingVertical:8, borderRadius:999, marginHorizontal:4 },
  unitActive: { backgroundColor:'#10b981' },
  counterRow: { flexDirection:'row', alignItems:'center', justifyContent:'center', marginTop:30 },
  circle: { width:72, height:72, borderRadius:36, backgroundColor:'#fff', alignItems:'center', justifyContent:'center', shadowColor:'#000', shadowOpacity:0.04, shadowRadius:8, elevation:3 },
  qty: { fontSize:56, fontWeight:'800', marginHorizontal:30 },
  note: { textAlign:'center', color:'#6b7280', marginTop:20 },
  next: { backgroundColor:'#10b981', borderRadius:999, paddingVertical:16, alignItems:'center', marginTop:30 },
  nextText: { color:'#fff', fontWeight:'800' },
});

export default EnterQuantityScreen;
