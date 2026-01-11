import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ProgressBar: React.FC<{ current: number; total: number }> = ({ current, total }) => {
  const pct = Math.max(0, Math.min(1, current / total)) * 100;
  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Text style={styles.text}>Step {current} of {total}</Text>
        <View style={styles.bar}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: { marginTop: 8, paddingHorizontal: 20 },
  row: { },
  text: { color: '#6b7280', fontSize: 13, marginBottom: 8 },
  bar: { height: 6, backgroundColor: '#e6f4ea', borderRadius: 6, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: '#10b981' },
});

export default ProgressBar;