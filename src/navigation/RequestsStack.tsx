import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import RequestDetailsScreen from '../screens/RequestDetailsScreen';
import RequestsScreen from '../screens/RequestsScreen';
import RequestSuccessScreen from '../screens/RequestSuccessScreen';

export type RequestsStackParamList = {
  RequestsList: undefined;
  RequestDetails: { id: string };
  RequestSuccess: { requestId: string };
};

const Stack = createNativeStackNavigator<RequestsStackParamList>();

const RequestsStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RequestsList" component={RequestsScreen} />
      <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
      <Stack.Screen name="RequestSuccess" component={RequestSuccessScreen} />
    </Stack.Navigator>
  );
};

export default RequestsStack;