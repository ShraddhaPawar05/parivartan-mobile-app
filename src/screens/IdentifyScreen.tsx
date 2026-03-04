import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal } from 'react-native';
import { BackButton } from '../components';
import ProgressBar from '../components/ProgressBar';
import ScreenWrapper from '../components/ScreenWrapper';
import { getWasteIcon } from '../constants/wasteIcons';
import { useUploadFlow } from '../context/UploadFlowContext';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';

const categories = ['Plastic', 'Paper', 'Metal', 'Clothes', 'E-waste', 'Organic'];

const IdentifyScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const route: any = useRoute();
  const { setCategory, setImageUrl } = useUploadFlow();
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  const handleManualSelection = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setShowPhotoModal(true);
  };

  const handleTakePhoto = async () => {
    setShowPhotoModal(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        alert('Camera permission is required');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCategory(selectedCategory.toLowerCase());
        setImageUrl(result.assets[0].uri);
        console.log('📸 Manual photo captured:', result.assets[0].uri);
        navigation.navigate('WasteIdentified', { manualCategory: selectedCategory });
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      alert('Failed to take photo');
    }
  };

  const handleChooseGallery = async () => {
    setShowPhotoModal(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Gallery permission is required');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setCategory(selectedCategory.toLowerCase());
        setImageUrl(result.assets[0].uri);
        console.log('🖼️ Image selected from gallery:', result.assets[0].uri);
        navigation.navigate('WasteIdentified', { manualCategory: selectedCategory });
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      alert('Failed to select image');
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      if (route.params && route.params._fresh) {
        navigation.reset({ index: 0, routes: [{ name: 'IdentifyStart' }] });
      }
    }, [route.params])
  );

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} style={styles.backButton} />
          <Text style={styles.title}>Identify Waste</Text>
          <View style={styles.headerRight} />
        </View>

        <ProgressBar current={1} total={5} />

        <LinearGradient colors={['#ecfdf5', '#d1fae5']} start={[0,0]} end={[1,1]} style={styles.scanCard}>
          <TouchableOpacity 
            style={styles.scanButton} 
            activeOpacity={0.8} 
            onPress={() => navigation.getParent()?.getParent()?.navigate('Camera')}
          >
            <View style={styles.scanCircle}>
              <MaterialCommunityIcons name="qrcode-scan" size={40} color="#10b981" />
            </View>
            <View style={styles.scanPulse} />
          </TouchableOpacity>
          <Text style={styles.scanTitle}>Scan to Identify</Text>
          <Text style={styles.scanSubtitle}>Point your camera at the waste item</Text>
          <View style={styles.scanBadge}>
            <MaterialCommunityIcons name="lightning-bolt" size={14} color="#f59e0b" />
            <Text style={styles.scanBadgeText}>AI Powered</Text>
          </View>
        </LinearGradient>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.manualSection}>
          <Text style={styles.sectionTitle}>Select Category Manually</Text>
          <Text style={styles.sectionSubtitle}>Choose if you already know the waste type</Text>
        </View>

        <View style={styles.grid}>
          {categories.map((c) => {
            const iconMap = {
              Plastic: 'bottle-soda',
              Paper: 'newspaper-variant',
              Metal: 'cog',
              Clothes: 'tshirt-crew',
              'E-waste': 'cellphone',
              Organic: 'food-apple'
            };
            const icon = iconMap[c as keyof typeof iconMap] || 'recycle';
            const colors = {
              Plastic: { bg: '#f0f9ff', icon: '#0ea5e9' },
              Paper: { bg: '#fef9f3', icon: '#f97316' },
              Metal: { bg: '#f5f3ff', icon: '#8b5cf6' },
              Clothes: { bg: '#fdf4ff', icon: '#d946ef' },
              'E-waste': { bg: '#fef3f2', icon: '#ef4444' },
              Organic: { bg: '#f0fdf4', icon: '#10b981' }
            }[c] || { bg: '#f9fafb', icon: '#6b7280' };

            return (
              <TouchableOpacity 
                key={c} 
                style={[styles.categoryCard, { backgroundColor: colors.bg }]} 
                onPress={() => handleManualSelection(c)}
                activeOpacity={0.7}
              >
                <View style={[styles.categoryIcon, { backgroundColor: 'rgba(255,255,255,0.8)' }]}>
                  <MaterialCommunityIcons name={icon as any} size={28} color={colors.icon} />
                </View>
                <Text style={styles.categoryText}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{height: 80}} />
      </ScrollView>

      <Modal
        visible={showPhotoModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPhotoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>Add Photo</Text>
            <Text style={styles.modalSubtitle}>Please add a photo of the {selectedCategory.toLowerCase()} waste</Text>
            
            <TouchableOpacity style={styles.modalButton} onPress={handleTakePhoto}>
              <View style={styles.modalButtonIcon}>
                <MaterialCommunityIcons name="camera" size={24} color="#10b981" />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.modalButtonText}>Take Photo</Text>
                <Text style={styles.modalButtonSubtext}>Use your camera</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.modalButton} onPress={handleChooseGallery}>
              <View style={styles.modalButtonIcon}>
                <MaterialCommunityIcons name="image" size={24} color="#3b82f6" />
              </View>
              <View style={{flex: 1}}>
                <Text style={styles.modalButtonText}>Choose from Gallery</Text>
                <Text style={styles.modalButtonSubtext}>Select existing photo</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={20} color="#9ca3af" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.modalCancelButton} 
              onPress={() => setShowPhotoModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 40 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  headerRight: { width: 36 },

  scanCard: { borderRadius: 20, padding: 32, alignItems: 'center', marginTop: 12, marginBottom: 24 },
  scanButton: { position: 'relative', marginBottom: 20 },
  scanCircle: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 20, elevation: 8 },
  scanPulse: { position: 'absolute', width: 120, height: 120, borderRadius: 60, backgroundColor: '#10b981', opacity: 0.1, top: 0, left: 0 },
  scanTitle: { fontSize: 20, fontWeight: '800', color: '#065f46', marginBottom: 6 },
  scanSubtitle: { fontSize: 14, color: '#059669', marginBottom: 12 },
  scanBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 4 },
  scanBadgeText: { fontSize: 12, fontWeight: '700', color: '#f59e0b' },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 24 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#e5e7eb' },
  dividerText: { marginHorizontal: 16, fontSize: 13, fontWeight: '700', color: '#9ca3af' },

  manualSection: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 6 },
  sectionSubtitle: { fontSize: 14, color: '#6b7280' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  categoryCard: { width: '48%', borderRadius: 14, padding: 14, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2, alignItems: 'center' },
  categoryIcon: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  categoryText: { fontSize: 14, fontWeight: '800', color: '#111827', textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalHandle: { width: 40, height: 4, backgroundColor: '#e5e7eb', borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8 },
  modalSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 24 },
  modalButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9fafb', padding: 16, borderRadius: 14, marginBottom: 12, borderWidth: 1, borderColor: '#e5e7eb' },
  modalButtonIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  modalButtonText: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 2 },
  modalButtonSubtext: { fontSize: 13, color: '#6b7280' },
  modalCancelButton: { padding: 16, alignItems: 'center', marginTop: 8 },
  modalCancelText: { fontSize: 16, fontWeight: '700', color: '#6b7280' },
});

export default IdentifyScreen;
