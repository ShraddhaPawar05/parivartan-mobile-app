import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ScreenWrapper from '../components/ScreenWrapper';
import { BackButton } from '../components';

const QUOTES = [
  'Small actions create big impact ♻️',
  'Your waste can become someone\'s resource 🌱',
  'Together, we build a cleaner future 🌍',
];

const STATS = [
  { icon: 'earth', value: '60M+', label: 'Tons of waste\ngenerated yearly', color: '#10b981', bg: '#ecfdf5' },
  { icon: 'recycle', value: '60%', label: 'Waste that can\nbe recycled', color: '#3b82f6', bg: '#eff6ff' },
  { icon: 'city', value: '↑', label: 'Urban waste\nrising rapidly', color: '#f59e0b', bg: '#fffbeb' },
];

const MISSION = [
  { icon: 'check-circle', text: 'Make recycling easy and accessible' },
  { icon: 'check-circle', text: 'Encourage responsible waste habits' },
  { icon: 'check-circle', text: 'Build a cleaner and greener India' },
];

const STEPS = [
  { icon: 'camera-outline', step: '01', title: 'Identify Waste', desc: 'Use AI to scan and identify your waste type instantly' },
  { icon: 'calendar-check', step: '02', title: 'Schedule Pickup', desc: 'Choose a convenient time for recycler to collect' },
  { icon: 'truck-delivery-outline', step: '03', title: 'Recycler Collects', desc: 'Verified recycler arrives and picks up your waste' },
  { icon: 'star-circle-outline', step: '04', title: 'Earn EcoPoints', desc: 'Get rewarded with EcoPoints for every pickup' },
];

const WHY = [
  { icon: 'robot-outline', title: 'AI Waste Identification', desc: 'Smart camera identifies waste type in seconds', color: '#8b5cf6', bg: '#f5f3ff' },
  { icon: 'star-outline', title: 'EcoPoints Rewards', desc: 'Earn points and redeem exciting vouchers', color: '#f59e0b', bg: '#fffbeb' },
  { icon: 'account-group-outline', title: 'Community Driven', desc: 'Join thousands making a real difference', color: '#3b82f6', bg: '#eff6ff' },
  { icon: 'leaf', title: 'Real Impact', desc: 'Track your environmental contribution live', color: '#10b981', bg: '#ecfdf5' },
];

const GALLERY = [
  { icon: 'trash-can-outline', label: 'Waste Collection', color: '#ef4444', bg: '#fef2f2' },
  { icon: 'recycle', label: 'Recycling Process', color: '#10b981', bg: '#ecfdf5' },
  { icon: 'tree', label: 'Clean Environment', color: '#16a34a', bg: '#f0fdf4' },
  { icon: 'city-variant-outline', label: 'Cleaner Cities', color: '#3b82f6', bg: '#eff6ff' },
];

const ExploreMoreScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const quoteFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const interval = setInterval(() => {
      Animated.timing(quoteFade, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
        setQuoteIndex(i => (i + 1) % QUOTES.length);
        Animated.timing(quoteFade, { toValue: 1, duration: 400, useNativeDriver: true }).start();
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <ScreenWrapper>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} style={styles.back} />
          <Text style={styles.headerTitle}>About Parivartan</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Hero */}
        <LinearGradient colors={['#14532d', '#16a34a', '#22c55e']} style={styles.hero} start={[0, 0]} end={[1, 1]}>
          <MaterialCommunityIcons name="leaf" size={120} color="rgba(255,255,255,0.07)" style={styles.heroBgIcon} />
          <View style={styles.heroBadge}>
            <MaterialCommunityIcons name="recycle" size={14} color="#10b981" />
            <Text style={styles.heroBadgeText}>Our Mission</Text>
          </View>
          <Text style={styles.heroTitle}>Our Journey Towards a Cleaner India 🌱</Text>
          <Text style={styles.heroSubtitle}>Turning waste into impact, one step at a time</Text>
        </LinearGradient>

        {/* Our Story */}
        <View style={styles.section}>
          <View style={styles.sectionLabelRow}>
            <View style={styles.sectionDot} />
            <Text style={styles.sectionLabel}>OUR STORY</Text>
          </View>
          <Text style={styles.sectionTitle}>Why We Built Parivartan</Text>
          <View style={styles.storyCard}>
            <Text style={styles.storyText}>
              We observed a major waste management problem in our own city, where large amounts of waste are generated daily but not properly recycled or segregated.
            </Text>
            <View style={styles.storyDivider} />
            <Text style={styles.storyText}>
              Through further research across different cities like Jaipur and others, we discovered that this is not just a local issue but a nationwide concern.
            </Text>
            <View style={styles.storyDivider} />
            <Text style={styles.storyText}>
              In India, more than <Text style={styles.storyHighlight}>60 million tons of waste</Text> is generated every year, and nearly <Text style={styles.storyHighlight}>60% of it can actually be recycled</Text>. However, due to lack of awareness, accessibility, and proper systems, most of this recyclable waste goes unused.
            </Text>
            <View style={styles.storyDivider} />
            <Text style={styles.storyText}>
              This inspired us to build <Text style={styles.storyHighlight}>Parivartan</Text> — a platform that connects people with recyclers and encourages responsible waste management. Our goal is to make recycling simple, rewarding, and impactful for everyone.
            </Text>
          </View>
        </View>

        {/* Impact Stats */}
        <View style={styles.section}>
          <View style={styles.sectionLabelRow}>
            <View style={[styles.sectionDot, { backgroundColor: '#3b82f6' }]} />
            <Text style={styles.sectionLabel}>IMPACT</Text>
          </View>
          <Text style={styles.sectionTitle}>The Scale of the Problem</Text>
          <View style={styles.statsRow}>
            {STATS.map((s, i) => (
              <View key={i} style={[styles.statCard, { backgroundColor: s.bg }]}>
                <View style={[styles.statIconWrap, { backgroundColor: s.color + '20' }]}>
                  <MaterialCommunityIcons name={s.icon as any} size={22} color={s.color} />
                </View>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Mission */}
        <View style={styles.section}>
          <View style={styles.sectionLabelRow}>
            <View style={[styles.sectionDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.sectionLabel}>MISSION</Text>
          </View>
          <Text style={styles.sectionTitle}>Our Goals</Text>
          <View style={styles.missionCard}>
            {MISSION.map((m, i) => (
              <View key={i} style={[styles.missionRow, i < MISSION.length - 1 && styles.missionRowBorder]}>
                <View style={styles.missionCheck}>
                  <MaterialCommunityIcons name="check" size={14} color="#fff" />
                </View>
                <Text style={styles.missionText}>{m.text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.section}>
          <View style={styles.sectionLabelRow}>
            <View style={[styles.sectionDot, { backgroundColor: '#8b5cf6' }]} />
            <Text style={styles.sectionLabel}>PROCESS</Text>
          </View>
          <Text style={styles.sectionTitle}>How It Works</Text>
          <View style={{ marginTop: 12 }}>
            {STEPS.map((s, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepLeft}>
                  <LinearGradient colors={['#16a34a', '#10b981']} style={styles.stepIconWrap} start={[0, 0]} end={[1, 1]}>
                    <MaterialCommunityIcons name={s.icon as any} size={20} color="#fff" />
                  </LinearGradient>
                  {i < STEPS.length - 1 && <View style={styles.stepLine} />}
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepNum}>{s.step}</Text>
                  <Text style={styles.stepTitle}>{s.title}</Text>
                  <Text style={styles.stepDesc}>{s.desc}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Why Parivartan */}
        <View style={styles.section}>
          <View style={styles.sectionLabelRow}>
            <View style={[styles.sectionDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.sectionLabel}>WHY US</Text>
          </View>
          <Text style={styles.sectionTitle}>Why Parivartan?</Text>
          <View style={styles.whyGrid}>
            {WHY.map((w, i) => (
              <View key={i} style={[styles.whyCard, { backgroundColor: w.bg }]}>
                <View style={[styles.whyIconWrap, { backgroundColor: w.color + '20' }]}>
                  <MaterialCommunityIcons name={w.icon as any} size={22} color={w.color} />
                </View>
                <Text style={styles.whyTitle}>{w.title}</Text>
                <Text style={styles.whyDesc}>{w.desc}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Gallery */}
        <View style={styles.section}>
          <View style={styles.sectionLabelRow}>
            <View style={[styles.sectionDot, { backgroundColor: '#3b82f6' }]} />
            <Text style={styles.sectionLabel}>JOURNEY</Text>
          </View>
          <Text style={styles.sectionTitle}>From Waste to Clean</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 12 }}>
            {GALLERY.map((g, i) => (
              <View key={i} style={[styles.galleryCard, { backgroundColor: g.bg, marginLeft: i === 0 ? 0 : 12 }]}>
                <MaterialCommunityIcons name={g.icon as any} size={48} color={g.color} />
                <Text style={[styles.galleryLabel, { color: g.color }]}>{g.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Quotes */}
        <LinearGradient colors={['#064e3b', '#065f46']} style={styles.quoteCard} start={[0, 0]} end={[1, 1]}>
          <MaterialCommunityIcons name="format-quote-open" size={32} color="rgba(255,255,255,0.2)" />
          <Animated.Text style={[styles.quoteText, { opacity: quoteFade }]}>
            {QUOTES[quoteIndex]}
          </Animated.Text>
          <View style={styles.quoteDots}>
            {QUOTES.map((_, i) => (
              <View key={i} style={[styles.quoteDot, i === quoteIndex && styles.quoteDotActive]} />
            ))}
          </View>
        </LinearGradient>

        {/* Guide */}
        <View style={styles.section}>
          <View style={styles.sectionLabelRow}>
            <View style={[styles.sectionDot, { backgroundColor: '#6b7280' }]} />
            <Text style={styles.sectionLabel}>GUIDE</Text>
          </View>
          <Text style={styles.sectionTitle}>How to Use the App</Text>
          <View style={styles.guideCard}>
            {[
              { icon: 'account-plus-outline', text: 'Sign up and set your pickup location' },
              { icon: 'camera-outline', text: 'Identify waste using the AI camera' },
              { icon: 'handshake-outline', text: 'Choose a recycler partner near you' },
              { icon: 'gift-outline', text: 'Complete pickups and earn EcoPoints' },
            ].map((g, i) => (
              <View key={i} style={[styles.guideRow, i < 3 && styles.guideRowBorder]}>
                <View style={styles.guideIconWrap}>
                  <MaterialCommunityIcons name={g.icon as any} size={18} color="#10b981" />
                </View>
                <Text style={styles.guideText}>{g.text}</Text>
              </View>
            ))}
            <View style={styles.guideFuture}>
              <MaterialCommunityIcons name="translate" size={14} color="#6b7280" />
              <Text style={styles.guideFutureText}>Multi-language support coming soon</Text>
            </View>
          </View>
        </View>

        {/* CTA */}
        <TouchableOpacity activeOpacity={0.9} onPress={() => navigation.navigate('Identify')} style={styles.ctaWrap}>
          <LinearGradient colors={['#16a34a', '#10b981']} style={styles.ctaBtn} start={[0, 0]} end={[1, 0]}>
            <MaterialCommunityIcons name="recycle" size={22} color="#fff" />
            <Text style={styles.ctaText}>Start Recycling Today ♻️</Text>
          </LinearGradient>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  back: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 4, elevation: 1 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#111827' },

  // Hero
  hero: { borderRadius: 24, padding: 24, marginBottom: 8, overflow: 'hidden' },
  heroBgIcon: { position: 'absolute', right: -20, top: -20 },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 14 },
  heroBadgeText: { fontSize: 12, fontWeight: '700', color: '#fff' },
  heroTitle: { fontSize: 22, fontWeight: '900', color: '#fff', lineHeight: 30, marginBottom: 10 },
  heroSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.8)', fontWeight: '500', lineHeight: 20 },

  // Section
  section: { marginTop: 28 },
  sectionLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  sectionDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#10b981' },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: '#9ca3af', letterSpacing: 1.2 },
  sectionTitle: { fontSize: 20, fontWeight: '900', color: '#111827', marginBottom: 14 },

  // Story
  storyCard: { backgroundColor: '#fff', borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  storyText: { fontSize: 14, color: '#374151', lineHeight: 22 },
  storyDivider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 14 },
  storyHighlight: { fontWeight: '800', color: '#16a34a' },

  // Stats
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: { flex: 1, borderRadius: 16, padding: 14, alignItems: 'center' },
  statIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  statValue: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  statLabel: { fontSize: 11, color: '#6b7280', textAlign: 'center', lineHeight: 15, fontWeight: '600' },

  // Mission
  missionCard: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  missionRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  missionRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  missionCheck: { width: 26, height: 26, borderRadius: 13, backgroundColor: '#10b981', alignItems: 'center', justifyContent: 'center' },
  missionText: { fontSize: 14, fontWeight: '700', color: '#111827', flex: 1 },

  // Steps
  stepRow: { flexDirection: 'row', gap: 16, marginBottom: 4 },
  stepLeft: { alignItems: 'center', width: 48 },
  stepIconWrap: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  stepLine: { width: 2, flex: 1, backgroundColor: '#d1fae5', marginTop: 6, marginBottom: 6, minHeight: 24 },
  stepContent: { flex: 1, paddingBottom: 20 },
  stepNum: { fontSize: 11, fontWeight: '800', color: '#10b981', letterSpacing: 1, marginBottom: 2 },
  stepTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 4 },
  stepDesc: { fontSize: 13, color: '#6b7280', lineHeight: 18 },

  // Why
  whyGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  whyCard: { width: '47%', borderRadius: 16, padding: 16 },
  whyIconWrap: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  whyTitle: { fontSize: 13, fontWeight: '800', color: '#111827', marginBottom: 4 },
  whyDesc: { fontSize: 12, color: '#6b7280', lineHeight: 16 },

  // Gallery
  galleryCard: { width: 130, height: 130, borderRadius: 20, alignItems: 'center', justifyContent: 'center', gap: 10 },
  galleryLabel: { fontSize: 12, fontWeight: '700', textAlign: 'center' },

  // Quote
  quoteCard: { borderRadius: 24, padding: 24, marginTop: 28, alignItems: 'center' },
  quoteText: { fontSize: 16, fontWeight: '700', color: '#fff', textAlign: 'center', lineHeight: 24, marginVertical: 12 },
  quoteDots: { flexDirection: 'row', gap: 6, marginTop: 8 },
  quoteDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.3)' },
  quoteDotActive: { backgroundColor: '#fff', width: 18 },

  // Guide
  guideCard: { backgroundColor: '#fff', borderRadius: 20, overflow: 'hidden', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  guideRow: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  guideRowBorder: { borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  guideIconWrap: { width: 36, height: 36, borderRadius: 10, backgroundColor: '#ecfdf5', alignItems: 'center', justifyContent: 'center' },
  guideText: { fontSize: 14, color: '#374151', fontWeight: '600', flex: 1 },
  guideFuture: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 14, backgroundColor: '#f9fafb' },
  guideFutureText: { fontSize: 12, color: '#9ca3af', fontWeight: '500' },

  // CTA
  ctaWrap: { marginTop: 28 },
  ctaBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 18, borderRadius: 18, shadowColor: '#10b981', shadowOpacity: 0.35, shadowRadius: 12, elevation: 6 },
  ctaText: { fontSize: 17, fontWeight: '900', color: '#fff' },
});

export default ExploreMoreScreen;
