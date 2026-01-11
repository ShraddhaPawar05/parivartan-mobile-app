import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import MyImpactScreen from '../screens/MyImpactScreen';
import RecyclerPartnersScreen from '../screens/RecyclerPartnersScreen';

export type HomeStackParamList = {
  HomeMain: undefined;
  RecyclerPartners: undefined;
  RecyclerPartnerDetail: { id: string; name?: string } | undefined;
  MyImpact: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="RecyclerPartners" component={RecyclerPartnersScreen} />
      <Stack.Screen name="RecyclerPartnerDetail" component={require('../screens/RecyclerPartnerDetailScreen').default} />
      <Stack.Screen name="MyImpact" component={MyImpactScreen} />
    </Stack.Navigator>
  );
};

export default HomeStack;