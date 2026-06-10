import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';

const TAB_HEIGHT = 70;

const FloatingAIButton: React.FC = () => {
  const navigation = useNavigation();
  const scale = useRef(new Animated.Value(1)).current;
  const pulse = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.12, duration: 1000, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1, duration: 1000, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.85, duration: 100, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start(() => (navigation as any).navigate('PariAI'));
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale }] }]}>
      {/* Pulse ring */}
      <Animated.View style={[styles.pulseRing, { transform: [{ scale: pulse }] }]} />
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9} style={styles.touch}>
        <LinearGradient
          colors={['#34d399', '#10b981', '#059669']}
          start={[0, 0]}
          end={[1, 1]}
          style={styles.gradient}
        >
          <MaterialCommunityIcons name="leaf" size={24} color="#fff" />
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: TAB_HEIGHT + 14,
    right: 16,
    zIndex: 999,
    elevation: 12,
    width: 54,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(16, 185, 129, 0.2)',
  },
  touch: {
    width: 54,
    height: 54,
    borderRadius: 27,
    overflow: 'hidden',
    shadowColor: '#10b981',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  gradient: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FloatingAIButton;
