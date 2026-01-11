import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

const Card: React.FC<{ style?: StyleProp<ViewStyle>; children?: React.ReactNode }> = ({ style, children }) => {
  return <View style={[styles.card, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
});

export default Card;
