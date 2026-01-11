import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import ProfileScreen from '../screens/ProfileScreen';
import RewardsScreen from '../screens/RewardsScreen';
import HomeStack from './HomeStack';
import RequestsStack from './RequestsStack';
import UploadStack from './UploadStack';

import BottomTabBar from '../components/BottomTabBar';

export type RootTabParamList = {
  Home: undefined;
  Requests: undefined;
  Identify: undefined;
  Rewards: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<RootTabParamList>();

const RootNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={props => <BottomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={HomeStack} />
      <Tab.Screen name="Requests" component={RequestsStack} />
      {/* Center action: Identify (Upload stack) */}
      <Tab.Screen name="Identify" component={UploadStack} options={{ headerShown: false }} />
      <Tab.Screen name="Rewards" component={RewardsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default RootNavigator;
