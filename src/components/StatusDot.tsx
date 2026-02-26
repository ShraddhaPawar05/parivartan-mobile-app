import React from 'react';
import { View, StyleSheet } from 'react-native';

interface StatusDotProps {
  isActive: boolean;
}

const StatusDot: React.FC<StatusDotProps> = ({ isActive }) => {
  return (
    <View style={[styles.dot, isActive ? styles.dotActive : styles.dotInactive]} />
  );
};

const styles = StyleSheet.create({
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  dotActive: {
    backgroundColor: '#10b981',
  },
  dotInactive: {
    backgroundColor: '#d1d5db',
  },
});

export default StatusDot;
