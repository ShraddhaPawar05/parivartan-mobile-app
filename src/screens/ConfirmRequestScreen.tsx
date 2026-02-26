import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import { BackButton } from '../components';
import ProgressBar from '../components/ProgressBar';
import ScreenWrapper from '../components/ScreenWrapper';
import { getWasteIcon } from '../constants/wasteIcons';
import { calculatePointsForRequest, useRequests } from '../context';
import { useUploadFlow } from '../context/UploadFlowContext';
import { useAuth } from '../context/AuthContext';
import { createRequest } from '../services/requestService';

const ConfirmRequestScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const { selectedPartner, category, quantity, unit, pickupType, pickupAddress, imageUrl, confidence, setCategory, setQuantity, setPickupAddress, setImageUrl, setConfidence } = useUploadFlow();
  const { addRequest } = useRequests();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [requestId, setRequestId] = useState('');

  const handleConfirm = async () => {
    if (!user?.uid) {
      alert('Please sign in to submit request');
      return;
    }

    if (!category) {
      alert('Waste type is required');
      return;
    }

    if (!selectedPartner) {
      alert('Please select a recycler partner');
      return;
    }

    if (!pickupAddress) {
      alert('Please set pickup address');
      return;
    }

    setSubmitting(true);
    try {
      console.log('📦 Submitting request with category:', category);
      console.log('🤝 Selected partner:', selectedPartner.id, selectedPartner.name);
      console.log('📍 Pickup address:', pickupAddress);
      console.log('📸 Image URL:', imageUrl);
      console.log('🎯 Confidence:', confidence);
      console.log('👤 User:', user.uid, user.displayName || user.email);
      
      const createdRequestId = await createRequest(
        user.uid,
        category,
        quantity ?? 1,
        pickupAddress,
        selectedPartner.id,
        imageUrl,
        confidence,
        user.displayName || user.email || 'Anonymous'
      );

      console.log('✅ Request created in Firestore with ID:', createdRequestId);
      console.log('📋 Request details:', {
        userId: user.uid,
        type: category,
        quantity: quantity ?? 1,
        status: 'Assigned',
        partnerId: selectedPartner.id
      });
      
      setRequestId(createdRequestId);
      setShowSuccessModal(true);

      // Reset flow state
      setCategory(undefined);
      setQuantity(1, 'items');
      setPickupAddress(null);
      setImageUrl(null);
      setConfidence(null);
    } catch (error) {
      console.error('❌ Error creating request:', error);
      alert(`Failed to submit request: ${error}`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    navigation.getParent()?.navigate('Requests');
  };

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
          <View style={styles.row}><Text style={styles.left}>Waste Type</Text><View style={{flexDirection:'row', alignItems:'center'}}><MaterialCommunityIcons name={getWasteIcon(category || 'trash') as any} size={18} color="#10b981" /><Text style={{marginLeft:8}}>{category ? `${category.charAt(0).toUpperCase() + category.slice(1)}` : 'Not set'}</Text></View></View>
          <View style={styles.row}><Text style={styles.left}>Quantity</Text><Text>{quantity ?? 1} items</Text></View>
          <View style={styles.row}><Text style={styles.left}>Pickup Address</Text><View style={{alignItems:'flex-end'}}><Text style={{textAlign:'right'}}>{pickupAddress ? `${pickupAddress.house}, ${pickupAddress.street}` : 'No address'}</Text><Text style={{color:'#6b7280', marginTop:6}}>{pickupAddress ? `${pickupAddress.city} - ${pickupAddress.pincode}` : ''}</Text></View></View>
        </View>

        <View style={styles.rewardNote}><Text style={styles.rewardTitle}>Estimated EcoPoints (Pending)</Text>
          <Text style={{marginTop:6}}>Estimated: <Text style={{color:'#10b981', fontWeight:'800'}}>{category ? calculatePointsForRequest({ category: category, quantity: quantity ?? 1, unit: 'items' }) : 0} EcoPoints</Text></Text>
          <Text style={{marginTop:8}}>EcoPoints will be credited only after pickup is completed and verified.</Text>
        </View>

        <TouchableOpacity 
          style={[styles.confirm, submitting && { opacity: 0.5 }]} 
          onPress={handleConfirm}
          disabled={submitting}
        >
          <Text style={styles.confirmText}>
            {submitting ? 'Submitting...' : 'Confirm Request  →'}
          </Text>
        </TouchableOpacity>

      </View>

      <Modal
        visible={showSuccessModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseSuccess}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.successIcon}>
              <MaterialCommunityIcons name="check-circle" size={64} color="#10b981" />
            </View>
            <Text style={styles.successTitle}>Request Submitted!</Text>
            <Text style={styles.successMessage}>
              Your waste collection request has been successfully submitted to {selectedPartner?.name}.
            </Text>
            <View style={styles.successDetails}>
              <Text style={styles.successLabel}>Request ID</Text>
              <Text style={styles.successValue}>{requestId.slice(0, 8)}...</Text>
            </View>
            <TouchableOpacity style={styles.successButton} onPress={handleCloseSuccess}>
              <Text style={styles.successButtonText}>View My Requests</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 20, padding: 32, width: '100%', maxWidth: 400, alignItems: 'center' },
  successIcon: { marginBottom: 20 },
  successTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 12, textAlign: 'center' },
  successMessage: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  successDetails: { backgroundColor: '#f9fafb', padding: 16, borderRadius: 12, width: '100%', marginBottom: 24 },
  successLabel: { fontSize: 12, color: '#6b7280', fontWeight: '600', marginBottom: 4 },
  successValue: { fontSize: 16, color: '#111827', fontWeight: '700' },
  successButton: { backgroundColor: '#10b981', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 999, width: '100%' },
  successButtonText: { color: '#fff', fontWeight: '800', fontSize: 16, textAlign: 'center' },
});

export default ConfirmRequestScreen;
