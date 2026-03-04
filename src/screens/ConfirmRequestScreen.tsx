import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Modal, ScrollView } from 'react-native';
import { BackButton } from '../components';
import ProgressBar from '../components/ProgressBar';
import ScreenWrapper from '../components/ScreenWrapper';
import { getWasteIcon, getWasteColor } from '../constants/wasteIcons';
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

  const wasteColors = getWasteColor(category);

  return (
    <ScreenWrapper>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <BackButton onPress={() => navigation.goBack()} style={styles.back} />

        <Text style={styles.title}>Confirm Request</Text>
        <ProgressBar current={5} total={5} />

        <Text style={styles.sectionTitle}>Selected Helper</Text>
        <View style={styles.helperCard}>
          <View style={{flexDirection: 'row', alignItems: 'center'}}>
            <View style={{width: 48, height: 48, borderRadius: 24, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', marginRight: 12}}>
              <MaterialCommunityIcons name="account-check" size={24} color="#10b981" />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.helperName}>{selectedPartner?.name ?? 'No partner selected'}</Text>
              <Text style={styles.helperSub}>{selectedPartner ? 'Selected helper for pickup' : 'Please select a helper'}</Text>
            </View>
            <MaterialCommunityIcons name="check-circle" size={24} color="#10b981" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Request Details</Text>
        <View style={styles.detailsCard}>
          <View style={styles.detailItem}>
            <View style={styles.detailIconCircle}>
              <MaterialCommunityIcons name={getWasteIcon(category || 'trash') as any} size={20} color={wasteColors.icon} />
            </View>
            <View style={{flex: 1, marginLeft: 12}}>
              <Text style={styles.detailLabel}>Waste Type</Text>
              <Text style={styles.detailValue}>{category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Waste` : 'Not set'}</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailIconCircle}>
              <MaterialCommunityIcons name="counter" size={20} color="#3b82f6" />
            </View>
            <View style={{flex: 1, marginLeft: 12}}>
              <Text style={styles.detailLabel}>Quantity</Text>
              <Text style={styles.detailValue}>{quantity ?? 1} items</Text>
            </View>
          </View>

          <View style={styles.detailItem}>
            <View style={styles.detailIconCircle}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#ef4444" />
            </View>
            <View style={{flex: 1, marginLeft: 12}}>
              <Text style={styles.detailLabel}>Pickup Address</Text>
              <Text style={styles.detailValue}>{pickupAddress ? `${pickupAddress.house}, ${pickupAddress.street}` : 'No address'}</Text>
              <Text style={styles.detailSubValue}>{pickupAddress ? `${pickupAddress.city} - ${pickupAddress.pincode}` : ''}</Text>
            </View>
          </View>
        </View>

        <View style={styles.rewardNote}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
            <View style={{width: 40, height: 40, borderRadius: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 12}}>
              <MaterialCommunityIcons name="star-circle" size={24} color="#10b981" />
            </View>
            <Text style={styles.rewardTitle}>Estimated EcoPoints</Text>
          </View>
          <View style={{backgroundColor: '#fff', borderRadius: 12, padding: 16}}>
            <Text style={{fontSize: 32, fontWeight: '900', color: '#10b981', textAlign: 'center'}}>{category ? calculatePointsForRequest({ category: category, quantity: quantity ?? 1, unit: 'items' }) : 0}</Text>
            <Text style={{textAlign: 'center', color: '#6b7280', marginTop: 4, fontSize: 13}}>Points (Pending Verification)</Text>
          </View>
          <Text style={{marginTop: 12, color: '#065f46', fontSize: 13, lineHeight: 18}}>💡 EcoPoints will be credited after pickup is completed and verified by the helper.</Text>
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

        <View style={{height: 100}} />
      </ScrollView>

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
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  back: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  title: { textAlign: 'center', fontSize: 20, fontWeight: '800', marginBottom: 20, color: '#111827' },
  sectionTitle: { color:'#111827', fontWeight:'800', marginTop:20, marginBottom: 8, fontSize: 16 },
  helperCard: { backgroundColor:'#fff', borderRadius:14, padding:20, marginTop:8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  helperName: { fontWeight:'800', fontSize: 17, color: '#111827' },
  helperSub: { color:'#6b7280', marginTop:4, fontSize: 13 },
  detailsCard: { backgroundColor:'#fff', borderRadius:14, padding:20, marginTop:8, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  detailItem: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  detailIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f9fafb', alignItems: 'center', justifyContent: 'center' },
  detailLabel: { fontSize: 12, color: '#6b7280', fontWeight: '600', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  detailValue: { fontSize: 16, color: '#111827', fontWeight: '700' },
  detailSubValue: { fontSize: 13, color: '#6b7280', marginTop: 4 },
  rewardNote: { backgroundColor:'#ecfdf5', borderRadius:14, padding:20, marginTop:20, borderWidth: 2, borderColor: '#d1fae5' },
  rewardTitle: { fontWeight:'800', fontSize: 16, color: '#065f46', flex: 1 },
  confirm: { backgroundColor:'#10b981', paddingVertical:16, borderRadius:14, marginTop:24, alignItems:'center', shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  confirmText: { color:'#fff', fontWeight:'800', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 32, width: '100%', maxWidth: 400, alignItems: 'center' },
  successIcon: { marginBottom: 24 },
  successTitle: { fontSize: 24, fontWeight: '900', color: '#111827', marginBottom: 12, textAlign: 'center' },
  successMessage: { fontSize: 15, color: '#6b7280', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  successDetails: { backgroundColor: '#f9fafb', padding: 16, borderRadius: 14, width: '100%', marginBottom: 24 },
  successLabel: { fontSize: 12, color: '#6b7280', fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  successValue: { fontSize: 18, color: '#111827', fontWeight: '800' },
  successButton: { backgroundColor: '#10b981', paddingVertical: 16, paddingHorizontal: 32, borderRadius: 14, width: '100%', shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  successButtonText: { color: '#fff', fontWeight: '800', fontSize: 16, textAlign: 'center' },
});

export default ConfirmRequestScreen;
