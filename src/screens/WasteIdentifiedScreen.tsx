import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native';
import { BackButton } from '../components';
import ProgressBar from '../components/ProgressBar';
import ScreenWrapper from '../components/ScreenWrapper';
import { useUploadFlow } from '../context/UploadFlowContext';
import { predictImage } from '../services/aiService';

const WasteIdentifiedScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const route: any = useRoute();
  const { setCategory, setImageUrl, setConfidence } = useUploadFlow();
  const [showConfidence, setShowConfidence] = useState(false);
  const [predictedCategory, setPredictedCategory] = useState<string | null>(null);
  const [predictionConfidence, setPredictionConfidence] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isManualSelection, setIsManualSelection] = useState(false);

  useEffect(() => {
    const runPrediction = async () => {
      const imageUri = route.params?.imageUri;
      const manualCategory = route.params?.manualCategory;
      
      // Handle manual category selection
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

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <BackButton onPress={() => navigation.goBack()} style={styles.back} />

        <Text style={styles.title}>Waste Identified</Text>
        <ProgressBar current={2} total={5} />

        <View style={styles.avatarWrap}>
          <View style={styles.avatarCircle}><MaterialCommunityIcons name="recycle" size={44} color="#10b981" /></View>
        </View>

        <Text style={styles.subtitle}>Based on your scan, we identified the waste type</Text>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#10b981" />
            <Text style={styles.loadingText}>Analyzing image...</Text>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.badgeRow}>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{isManualSelection ? 'Manual Selection' : 'High confidence'}</Text>
                </View>
                {!isManualSelection && (
                  <TouchableOpacity style={{marginLeft:8}} onPress={() => setShowConfidence(s => !s)}>
                    <Ionicons name="information-circle-outline" size={18} color="#6b7280" />
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.cardTitle}>{predictedCategory ? `${predictedCategory.charAt(0).toUpperCase() + predictedCategory.slice(1)} Waste` : 'Unknown Waste'}</Text>
              <Text style={styles.cardSub}>{predictedCategory ? `This item belongs to the ${predictedCategory} waste category.` : 'Unable to identify waste category.'}</Text>
              {showConfidence && !isManualSelection ? <Text style={styles.confExplanation}>Confidence represents how likely the identified category matches the item. High confidence means the model is over ~85% certain.</Text> : null}
            </View>

            <TouchableOpacity style={styles.next} onPress={() => navigation.navigate('EnterQuantity')} disabled={!predictedCategory}>
              <Text style={styles.nextText}>Next: Enter Quantity  →</Text>
            </TouchableOpacity>

            <TouchableOpacity style={{marginTop:12}} onPress={() => navigation.navigate('IdentifyStart')}>
              <Text style={{color:'#6b7280', textAlign:'center'}}>Change category</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7f7f7' },
  container: { padding: 20 },
  back: { width: 36, height:36, borderRadius:18, alignItems:'center', justifyContent:'center', backgroundColor:'#fff', marginBottom:12 },
  title: { textAlign: 'center', fontSize: 20, fontWeight: '800', marginBottom: 18 },
  avatarWrap: { alignItems: 'center', marginVertical: 12 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  subtitle: { textAlign: 'center', color: '#6b7280', marginTop: 12 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 18, marginTop: 24, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  badgeRow: { flexDirection:'row', alignItems:'center', justifyContent:'center', marginBottom: 12 },
  badge: { alignSelf: 'center', backgroundColor: '#ecfdf5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { color: '#065f46', fontWeight: '700' },
  confExplanation: { marginTop: 10, color:'#6b7280', textAlign:'center' },
  cardTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  cardSub: { color: '#6b7280', textAlign: 'center' },
  loadingContainer: { alignItems: 'center', marginTop: 40 },
  loadingText: { marginTop: 12, color: '#6b7280', fontWeight: '600' },
  next: { backgroundColor: '#10b981', borderRadius: 999, marginTop: 28, paddingVertical: 16, alignItems: 'center' },
  nextText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});

export default WasteIdentifiedScreen;
