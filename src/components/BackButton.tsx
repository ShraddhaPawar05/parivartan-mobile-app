import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { TouchableOpacity, ViewStyle } from 'react-native';

const BackButton: React.FC<{ onPress: () => void; style?: ViewStyle }> = ({ onPress, style }) => {
  return (
    <TouchableOpacity onPress={onPress} style={[{ width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', marginBottom: 12 }, style]}>
      <Ionicons name="chevron-back" size={20} color="#111827" />
    </TouchableOpacity>
  );
};

export default BackButton;
