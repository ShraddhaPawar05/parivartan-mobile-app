import React, { useEffect, useMemo } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

type ConfettiProps = {
  active: boolean;
  count?: number;
  duration?: number;
  onComplete?: () => void;
};

const COLORS = ['#f97316', '#10b981', '#60a5fa', '#f87171', '#facc15', '#a78bfa'];

const Confetti: React.FC<ConfettiProps> = ({ active, count = 12, duration = 1000, onComplete }) => {
  const particles = useMemo(() => Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 160 - 80,
    color: COLORS[i % COLORS.length],
    size: Math.floor(Math.random() * 8) + 6,
    rotate: Math.random() * 360,
    x: new Animated.Value(0),
    y: new Animated.Value(0),
    opacity: new Animated.Value(1),
  })), [count]);

  useEffect(() => {
    if (!active) return;
    const anims = particles.map(p => {
      const toY = 200 + Math.random() * 200;
      const toX = p.left + (Math.random() * 120 - 60);
      return Animated.parallel([
        Animated.timing(p.y, { toValue: toY, duration, useNativeDriver: true }),
        Animated.timing(p.x, { toValue: toX, duration, useNativeDriver: true }),
        Animated.timing(p.opacity, { toValue: 0, duration: duration - 150, useNativeDriver: true }),
      ]);
    });
    Animated.stagger(20, anims).start(() => {
      // reset particles (optional)
      particles.forEach(p => { p.x.setValue(0); p.y.setValue(0); p.opacity.setValue(1); });
      if (onComplete) onComplete();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  if (!active) return null;

  return (
    <View pointerEvents="none" style={styles.container}>
      {particles.map(p => (
        <Animated.View
          key={p.id}
          style={[
            styles.particle,
            {
              backgroundColor: p.color,
              width: p.size,
              height: p.size * 1.6,
              borderRadius: 2,
              transform: [{ translateY: p.y }, { translateX: p.x }, { rotate: `${p.rotate}deg` }],
              opacity: p.opacity,
            },
          ]}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', left: 0, right: 0, top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  particle: { position: 'absolute' },
});

export default Confetti;
