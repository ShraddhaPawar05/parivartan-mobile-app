import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BackButton } from '../components';
import ProgressBar from '../components/ProgressBar';
import ScreenWrapper from '../components/ScreenWrapper';
import { getWasteIcon } from '../constants/wasteIcons';
import { useUploadFlow } from '../context/UploadFlowContext';

const categories = ['Plastic', 'Paper', 'Metal', 'Clothes', 'E-waste', 'Organic'];

const IdentifyScreen: React.FC = () => {
  const navigation: any = useNavigation();
  const route: any = useRoute();

  // use flow context
  const { setCategory, setCategory: _dummy } = useUploadFlow();

  useFocusEffect(
    React.useCallback(() => {
      // If a fresh param is passed, reset this Upload stack to its initial Identify screen state
      if (route.params && route.params._fresh) {
        navigation.reset({ index: 0, routes: [{ name: 'Identify' }] });
      }
    }, [route.params])
  );

  return (
    <ScreenWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} style={styles.backButton} />
          <Text style={styles.title}>Identify Waste</Text>
          <View style={styles.headerRight} />
        </View>

        <ProgressBar current={1} total={5} />

        <View style={styles.scanWrap}>
          <TouchableOpacity style={styles.scanCircle} activeOpacity={0.9} onPress={() => navigation.navigate('Camera')}>
            <View style={styles.scanInner}><MaterialCommunityIcons name="qrcode-scan" size={32} color="#10b981" /></View>
          </TouchableOpacity>
          <Text style={styles.scanText}>Scan the waste to identify its category</Text>
          <Text style={styles.scanSub}>Point your camera at the item</Text>
        </View>

        <Text style={styles.sectionTitle}>Manual Category Selection</Text>
        <Text style={styles.sectionSub}>Or select the category if you already know</Text>

        <View style={styles.grid}>
          {categories.map((c) => {
            const icon = getWasteIcon(c);
            return (
              <TouchableOpacity key={c} style={styles.card} onPress={() => { setCategory(c); navigation.navigate('WasteIdentified'); }}>
                <View style={styles.cardIcon}><MaterialCommunityIcons name={icon as any} size={20} color="#10b981" /></View>
                <Text style={styles.cardText}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={{height: 80}} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f7f7f7' },
  container: { padding: 20 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  title: { fontSize: 20, fontWeight: '800', color: '#111827', flex: 1, textAlign: 'center' },
  scanWrap: { alignItems: 'center', marginTop: 12 },
  scanCircle: { width: 150, height: 150, borderRadius: 75, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 10, elevation: 4 },
  scanInner: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: '#10b981', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  scanText: { fontSize: 16, fontWeight: '700', color: '#111827', marginTop: 16 },
  progressRow: { marginTop: 8 },
  progressText: { color: '#6b7280', fontSize: 13, marginBottom: 8 },
  progressBar: { height: 6, backgroundColor: '#e6f4ea', borderRadius: 6, overflow: 'hidden' },
  progressFill: { width: '20%', height: '100%', backgroundColor: '#10b981' },
  scanSub: { marginTop: 8, color: '#6b7280' },
  sectionTitle: { fontSize: 18, fontWeight: '800', marginTop: 22, color: '#111827' },
  sectionSub: { color: '#6b7280', marginTop: 6, marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },  headerRight: { width: 36 },  card: { width: '48%', backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 2 },
  cardIcon: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center' },
  cardText: { marginTop: 12, fontWeight: '700', color: '#111827' },
});

export default IdentifyScreen;
