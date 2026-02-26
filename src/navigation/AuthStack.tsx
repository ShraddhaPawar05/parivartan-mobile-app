import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import LocationSetupScreen from '../screens/LocationSetupScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';

export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  LocationSetup: { name?: string; phone?: string; email?: string } | undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

interface AuthStackProps {
  // No props needed
}

const AuthStack: React.FC<AuthStackProps> = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
};

export default AuthStack;
