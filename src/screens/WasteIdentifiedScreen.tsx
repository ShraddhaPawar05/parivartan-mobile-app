import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { BackButton } from '../components';
import ProgressBar from '../components/ProgressBar';
import ScreenWrapper from '../components/ScreenWrapper';
import { useUploadFlow } from '../context/UploadFlowContext';
import { predictImage } from '../services/aiService';
import { LinearGradient } from 'expo-linear-gradient';
import { getWasteIcon, getWasteColor } from '../constants/wasteIcons';

const WasteIdentifiedScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const route: any = useRoute();
  const { setCategory, setImageUrl, setConfidence, resetFlow } = useUploadFlow();
  const [showConfidence, setShowConfidence] = useState(false);
  const [predictedCategory, setPredictedCategory] = useState<string | null>(null);
  const [predictionConfidence, setPredictionConfidence] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isManualSelection, setIsManualSelection] = useState(false);

  useEffect(() => {
    const runPrediction = async () => {
      const imageUri = route.params?.imageUri;
      const manualCategory = route.params?.manualCategory;
      
      if (manualCategory) {
        console.log('📦 Manual category selected:', manualCategory);
        setPredictedCategory(manualCategory.toLowerCase());
        setPredictionConfidence(100);
        setCategory(manualCategory.toLowerCase());
        setConfidence(100);
        setIsManualSelection(true);
        setIsLoading(false);
        return;
      }
      
      if (!imageUri) {
        console.log('❌ No imageUri provided');
        setIsLoading(false);
        return;
      }

      console.log('🔍 Running prediction on:', imageUri);
      const result = await predictImage(imageUri);
      console.log('✅ Prediction result:', result);
      
      if (result) {
        setPredictedCategory(result.wasteType);
        setPredictionConfidence(result.confidence);
        setCategory(result.wasteType);
        setImageUrl(imageUri);
        setConfidence(result.confidence);
        setIsManualSelection(false);
        console.log('📦 Category set in context:', result.wasteType);
        console.log('🎯 Confidence:', result.confidence.toFixed(2) + '%');
      }
      setIsLoading(false);
    };

    runPrediction();
  }, [route.params?.imageUri, route.params?.manualCategory]);

  const getCategoryIcon = (category: string) => {
    return getWasteIcon(category);
  };

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <BackButton onPress={() => {
            resetFlow();
            navigation.navigate('IdentifyStart');
          }} style={styles.back} />
          <Text style={styles.title}>Waste Identified</Text>
          <View style={{width: 36}} />
        </View>

        <ProgressBar current={2} total={5} />

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingCircle}>
              <MaterialCommunityIcons name="loading" size={40} color="#10b981" />
            </View>
            <Text style={styles.loadingTitle}>Analyzing...</Text>
            <Text style={styles.loadingText}>Our AI is identifying the waste type</Text>
          </View>
        ) : (
          <>
            <LinearGradient 
              colors={['#ecfdf5', '#d1fae5']} 
              start={[0,0]} 
              end={[1,1]} 
              style={styles.resultCard}
            >
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons 
                  name={getCategoryIcon(predictedCategory || 'recycle') as any} 
                  size={48} 
                  color="#10b981" 
                />
              </View>

              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <MaterialCommunityIcons 
                    name={isManualSelection ? "hand-pointing-up" : "check-circle"} 
                    size={14} 
                    color="#065f46" 
                  />
                  <Text style={styles.badgeText}>
                    {isManualSelection ? 'Manual Selection' : 'High Confidence'}
                  </Text>
                </View>
                {!isManualSelection && predictionConfidence && (
                  <TouchableOpacity 
                    style={styles.infoButton} 
                    onPress={() => setShowConfidence(s => !s)}
                  >
                    <MaterialCommunityIcons name="information" size={16} color="#059669" />
                  </TouchableOpacity>
                )}
              </View>

              <Text style={styles.categoryTitle}>
                {predictedCategory 
                  ? `${predictedCategory.charAt(0).toUpperCase() + predictedCategory.slice(1)} Waste` 
                  : 'Unknown Waste'}
              </Text>
              
              <Text style={styles.categoryDescription}>
                {predictedCategory 
                  ? `This item belongs to the ${predictedCategory} waste category` 
                  : 'Unable to identify waste category'}
              </Text>

              {showConfidence && !isManualSelection && predictionConfidence && (
                <View style={styles.confidenceCard}>
                  <View style={styles.confidenceHeader}>
                    <MaterialCommunityIcons name="chart-arc" size={20} color="#059669" />
                    <Text style={styles.confidenceTitle}>Confidence Score</Text>
                  </View>
                  <View style={styles.confidenceBar}>
                    <View style={[styles.confidenceFill, { width: `${predictionConfidence}%` }]} />
                  </View>
                  <Text style={styles.confidenceText}>{predictionConfidence.toFixed(1)}%</Text>
                  <Text style={styles.confidenceExplanation}>
                    High confidence means our AI is over 85% certain about this classification
                  </Text>
                </View>
              )}
            </LinearGradient>

            <View style={styles.actionSection}>
              <TouchableOpacity 
                style={styles.nextButton} 
                onPress={() => navigation.navigate('EnterQuantity')} 
                disabled={!predictedCategory}
              >
                <Text style={styles.nextButtonText}>Continue</Text>
                <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.changeButton} 
                onPress={() => navigation.navigate('IdentifyStart')}
              >
                <MaterialCommunityIcons name="refresh" size={18} color="#6b7280" />
                <Text style={styles.changeButtonText}>Change Category</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  back: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 80 },
  loadingCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  loadingTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 8 },
  loadingText: { fontSize: 14, color: '#6b7280' },

  resultCard: { borderRadius: 20, padding: 32, alignItems: 'center', marginTop: 24 },
  iconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginBottom: 20, shadowColor: '#10b981', shadowOpacity: 0.2, shadowRadius: 16, elevation: 6 },
  
  badgeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, gap: 8 },
  badge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  badgeText: { fontSize: 12, color: '#065f46', fontWeight: '700' },
  infoButton: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },

  categoryTitle: { fontSize: 24, fontWeight: '900', color: '#065f46', marginBottom: 8, textAlign: 'center' },
  categoryDescription: { fontSize: 14, color: '#059669', textAlign: 'center', lineHeight: 20 },

  confidenceCard: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginTop: 20, width: '100%' },
  confidenceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  confidenceTitle: { fontSize: 14, fontWeight: '700', color: '#059669' },
  confidenceBar: { height: 8, backgroundColor: '#f0fdf4', borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  confidenceFill: { height: '100%', backgroundColor: '#10b981', borderRadius: 4 },
  confidenceText: { fontSize: 20, fontWeight: '800', color: '#10b981', marginBottom: 8 },
  confidenceExplanation: { fontSize: 12, color: '#6b7280', lineHeight: 18 },

  actionSection: { marginTop: 32 },
  nextButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#10b981', paddingVertical: 16, borderRadius: 14, gap: 8, shadowColor: '#10b981', shadowOpacity: 0.3, shadowRadius: 12, elevation: 4 },
  nextButtonText: { fontSize: 16, fontWeight: '800', color: '#fff' },
  changeButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, marginTop: 12, gap: 6 },
  changeButtonText: { fontSize: 15, fontWeight: '600', color: '#6b7280' },
});

export default WasteIdentifiedScreen;
