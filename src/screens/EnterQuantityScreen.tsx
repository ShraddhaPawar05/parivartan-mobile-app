import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { BackButton } from '../components';
import ProgressBar from '../components/ProgressBar';
import ScreenWrapper from '../components/ScreenWrapper';
import { useUploadFlow } from '../context/UploadFlowContext';
import * as ImagePicker from 'expo-image-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getWasteIcon, getWasteColor } from '../constants/wasteIcons';

const EnterQuantityScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const [quantity, setQuantity] = useState(1);

  const { setQuantity: setFlowQuantity, category, imageUrl, setImageUrl } = useUploadFlow();

  console.log('📦 EnterQuantity - Waste type from context:', category);
  console.log('📸 EnterQuantity - Image URL from context:', imageUrl);

  // If no category, go back to identify screen
  React.useEffect(() => {
    if (!category) {
      console.log('⚠️ No waste type selected, redirecting to Identify');
      navigation.navigate('IdentifyStart');
    }
  }, [category, navigation]);

  const handleTakePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUrl(result.assets[0].uri);
        console.log('📸 Photo captured:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      alert('Failed to take photo');
    }
  };

  if (!category) {
    return (
      <ScreenWrapper>
        <View style={styles.container}>
          <Text style={{textAlign: 'center', color: '#6b7280'}}>Loading...</Text>
        </View>
      </ScreenWrapper>
    );
  }

  const wasteTypeDisplay = `${category.charAt(0).toUpperCase() + category.slice(1)} Waste`;
  const wasteColors = getWasteColor(category);

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton onPress={() => navigation.goBack()} style={styles.back} />

        <Text style={styles.title}>Enter Quantity</Text>
        <ProgressBar current={3} total={5} />

        <View style={styles.itemCard}>
          <View style={styles.itemLeft}>
            <TouchableOpacity onPress={handleTakePhoto} style={styles.thumb}>
              {imageUrl ? (
                <Image source={{ uri: imageUrl }} style={styles.thumbImage} />
              ) : (
                <MaterialCommunityIcons name={getWasteIcon(category) as any} size={28} color={wasteColors.icon} />
              )}
            </TouchableOpacity>
            <View style={{marginLeft: 12, flex: 1}}>
              <Text style={styles.itemTitle}>{wasteTypeDisplay}</Text>
              <Text style={styles.itemSub}>{imageUrl ? 'TAP IMAGE TO RETAKE' : 'TAP TO ADD PHOTO'}</Text>
            </View>
          </View>
        </View>

        <View style={{alignItems:'center', marginTop: 24}}>
          <Text style={{fontWeight:'800', fontSize:18, color: '#111827'}}>Number of items</Text>
          <Text style={{color:'#6b7280', marginTop:8, fontSize: 14, textAlign: 'center'}}>Approximate count is fine. No need to be exact.</Text>
        </View>

        <View style={styles.counterRow}>
          <TouchableOpacity style={styles.circle} onPress={() => setQuantity(Math.max(1, quantity - 1))}><Text style={{fontSize:24,color:'#10b981'}}>-</Text></TouchableOpacity>
          <Text style={styles.qty}>{quantity}</Text>
          <TouchableOpacity style={[styles.circle, {backgroundColor:'#10b981'}]} onPress={() => setQuantity(quantity + 1)}><Text style={{fontSize:24,color:'#fff'}}>+</Text></TouchableOpacity>
        </View>

        <Text style={styles.note}>💡 Don't worry about exact numbers</Text>

        <TouchableOpacity style={styles.next} onPress={() => { setFlowQuantity(quantity, 'items'); navigation.navigate('PickupAddress'); }}>
          <Text style={styles.nextText}>Continue</Text>
        </TouchableOpacity>
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7f7f7' },
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  back: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  title: { textAlign: 'center', fontSize: 20, fontWeight: '800', marginBottom: 20, color: '#111827' },
  itemCard: { backgroundColor:'#fff', borderRadius:14, padding:16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  itemLeft: { flexDirection:'row', alignItems:'center' },
  thumb: { 
    width:72, 
    height:72, 
    borderRadius:14, 
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#f3f4f6'
  },
  thumbImage: {
    width: '100%',
    height: '100%',
    borderRadius: 14
  },
  itemTitle: { fontWeight:'800', fontSize: 16, color: '#111827' },
  itemSub: { color:'#10b981', fontWeight:'700', marginTop:6, fontSize: 11 },
  edit: { marginLeft:'auto' },
  toggles: { flexDirection:'row', backgroundColor:'#fff', padding:6, borderRadius:999, marginTop:30, alignSelf:'center' },
  unit: { paddingHorizontal:18, paddingVertical:8, borderRadius:999, marginHorizontal:4 },
  unitActive: { backgroundColor:'#10b981' },
  counterRow: { flexDirection:'row', alignItems:'center', justifyContent:'center', marginTop:40 },
  circle: { width:80, height:80, borderRadius:40, backgroundColor:'#fff', alignItems:'center', justifyContent:'center', shadowColor:'#000', shadowOpacity:0.06, shadowRadius:10, elevation:4 },
  qty: { fontSize:64, fontWeight:'900', marginHorizontal:40, color: '#111827' },
  note: { textAlign:'center', color:'#6b7280', marginTop:24, fontSize: 14 },
  next: { backgroundColor:'#10b981', borderRadius:14, paddingVertical:16, alignItems:'center', marginTop:40, shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  nextText: { color:'#fff', fontWeight:'800', fontSize: 16 },
});

export default EnterQuantityScreen;
