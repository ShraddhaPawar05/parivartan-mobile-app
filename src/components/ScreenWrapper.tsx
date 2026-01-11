import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ScreenWrapper: React.FC<{ children: React.ReactNode; style?: any }> = ({ children, style }) => {
  const insets = useSafeAreaInsets();
  return (
    <View style={[{ paddingTop: insets.top + 8, flex: 1, backgroundColor: '#f7f7f7' }, style]}>
      {children}
    </View>
  );
};

export default ScreenWrapper;