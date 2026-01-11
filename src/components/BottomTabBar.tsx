import { Feather, Ionicons } from '@expo/vector-icons';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const TAB_HEIGHT = 70;
const CENTER_SIZE = 64;

export default function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const pulse = React.useRef(new Animated.Value(1)).current;
  React.useEffect(() => {
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.06, duration: 900, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
    ])).start();
  }, []);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <View style={styles.bg} />

      <View style={styles.row}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const color = focused ? '#10b981' : '#9ca3af';
          const centerIndex = Math.floor(state.routes.length / 2);

          // Center slot should be the Identify action
          if (index === centerIndex) {
            return (
              <View key={route.key} style={styles.centerSlot}>
                <Animated.View style={[styles.centerButton, { transform: [{ scale: pulse }], backgroundColor: '#10b981' }]}>
                  <TouchableOpacity
                    onPress={() => {
                      // brief press feedback scale
                      Animated.sequence([
                        Animated.timing(pulse, { toValue: 0.92, duration: 120, useNativeDriver: true }),
                        Animated.spring(pulse, { toValue: 1.06, friction: 6, useNativeDriver: true }),
                      ]).start(() => navigation.navigate(route.name, { screen: 'Identify', params: { _fresh: Date.now() } }));
                    }}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="qr-code" size={28} color="#fff" />
                  </TouchableOpacity>
                </Animated.View>
                <Text style={[styles.label, { color, opacity: focused ? 1 : 0 }]}>{route.name}</Text>
              </View>
            );
          }

          let icon = null;
          if (route.name === 'Home') icon = <Ionicons name="home" size={22} color={color} />;
          if (route.name === 'Requests') icon = <Feather name="file-text" size={22} color={color} />;
          if (route.name === 'Rewards') icon = <Feather name="gift" size={22} color={color} />;
          if (route.name === 'Profile') icon = <Feather name="user" size={22} color={color} />;

          return (
            <TouchableOpacity
              key={route.key}
              onPress={() => navigation.navigate(route.name)}
              style={styles.tab}
              activeOpacity={0.8}
            >
              {icon}
              <Text style={[styles.label, { color, opacity: focused ? 1 : 0 }]}>{route.name}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 0, right: 0, bottom: 0, height: TAB_HEIGHT + (Platform.OS === 'ios' ? 20 : 0), paddingBottom: Platform.OS === 'ios' ? 12 : 6 },
  bg: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: TAB_HEIGHT,
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, height: TAB_HEIGHT },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label: { fontSize: 10, marginTop: 4, fontWeight: '700' },
  centerSlot: { width: CENTER_SIZE + 24, alignItems: 'center', marginTop: -20 },
  centerButton: { width: CENTER_SIZE, height: CENTER_SIZE, borderRadius: CENTER_SIZE / 2, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 8, elevation: 8 },
});