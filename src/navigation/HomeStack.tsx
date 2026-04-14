import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import MyImpactScreen from '../screens/MyImpactScreen';
import RecyclerPartnersScreen from '../screens/RecyclerPartnersScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import LocationSetupScreen from '../screens/LocationSetupScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import CommunityScreen from '../screens/CommunityScreen';
import MyPostsScreen from '../screens/MyPostsScreen';
import ExploreMoreScreen from '../screens/ExploreMoreScreen';

export type HomeStackParamList = {
  HomeMain: undefined;
  RecyclerPartners: undefined;
  RecyclerPartnerDetail: { id: string; name?: string } | undefined;
  MyImpact: undefined;
  Community: undefined;
  MyPosts: undefined;
  Notifications: undefined;
  LocationSetup: undefined;
  EditProfile: undefined;
  ExploreMore: undefined;
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="RecyclerPartners" component={RecyclerPartnersScreen} />
      <Stack.Screen name="RecyclerPartnerDetail" component={require('../screens/RecyclerPartnerDetailScreen').default} />
      <Stack.Screen name="MyImpact" component={MyImpactScreen} />
      <Stack.Screen name="Community" component={CommunityScreen} />
      <Stack.Screen name="MyPosts" component={MyPostsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="LocationSetup" component={LocationSetupScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ExploreMore" component={ExploreMoreScreen} />
    </Stack.Navigator>
  );
};

export default HomeStack;