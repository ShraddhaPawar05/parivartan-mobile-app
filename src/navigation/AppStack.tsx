import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import CameraScreen from '../screens/CameraScreen';
import RootNavigator from './RootNavigator';

export type AppStackParamList = {
  Main: undefined;
  Camera: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppStack: React.FC = () => {
  return (
    <Stack.Navigator initialRouteName="Main" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={RootNavigator} />
      <Stack.Screen
        name="Camera"
        component={CameraScreen}
        options={{ presentation: 'fullScreenModal' }}
      />
    </Stack.Navigator>
  );
};

export default AppStack;
