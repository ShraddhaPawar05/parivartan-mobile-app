import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BackButton } from '../components';
import ProgressBar from '../components/ProgressBar';
import ScreenWrapper from '../components/ScreenWrapper';
import { useUploadFlow } from '../context/UploadFlowContext';

const WasteIdentifiedScreen: React.FC = () => {
  const navigation: any = useNavigation();

  const { category } = useUploadFlow();
  const [showConfidence, setShowConfidence] = useState(false);

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

              <View style={styles.card}>
          <View style={styles.badgeRow}>
            <View style={styles.badge}><Text style={styles.badgeText}>High confidence</Text></View>
            <TouchableOpacity style={{marginLeft:8}} onPress={() => setShowConfidence(s => !s)}>
              <Ionicons name="information-circle-outline" size={18} color="#6b7280" />
            </TouchableOpacity>
          </View>
          <Text style={styles.cardTitle}>{category ? `${category} Waste` : 'Plastic Waste'}</Text>
          <Text style={styles.cardSub}>{category ? `This item belongs to the ${category} waste category.` : 'This item belongs to the Plastic waste category.'}</Text>
          {showConfidence ? <Text style={styles.confExplanation}>Confidence represents how likely the identified category matches the item. High confidence means the model is over ~85% certain.</Text> : null}
        </View>

        <TouchableOpacity style={styles.next} onPress={() => navigation.navigate('EnterQuantity')}>
          <Text style={styles.nextText}>Next: Enter Quantity  →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{marginTop:12}} onPress={() => navigation.navigate('Identify')}>
          <Text style={{color:'#6b7280', textAlign:'center'}}>Change category</Text>
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
  next: { backgroundColor: '#10b981', borderRadius: 999, marginTop: 28, paddingVertical: 16, alignItems: 'center' },
  nextText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});

export default WasteIdentifiedScreen;
