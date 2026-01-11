import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import CameraScreen from '../screens/CameraScreen';
import ConfirmRequestScreen from '../screens/ConfirmRequestScreen';
import EnterQuantityScreen from '../screens/EnterQuantityScreen';
import IdentifyScreen from '../screens/IdentifyScreen';
import NearbyHelpersScreen from '../screens/NearbyHelpersScreen';
import PickupAddressScreen from '../screens/PickupAddressScreen';
import WasteIdentifiedScreen from '../screens/WasteIdentifiedScreen';

export type UploadStackParamList = {
  Identify: undefined;
  WasteIdentified: undefined;
  EnterQuantity: undefined;
  PickupAddress: undefined;
  NearbyHelpers: undefined;
  ConfirmRequest: undefined;
  RequestSuccess: undefined;
};

const Stack = createNativeStackNavigator<UploadStackParamList>();

import { UploadFlowProvider } from '../context/UploadFlowContext';

const UploadStack: React.FC = () => {
  return (
    <UploadFlowProvider>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Identify" component={IdentifyScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="WasteIdentified" component={WasteIdentifiedScreen} />
        <Stack.Screen name="EnterQuantity" component={EnterQuantityScreen} />
        <Stack.Screen name="PickupAddress" component={PickupAddressScreen} />
        <Stack.Screen name="NearbyHelpers" component={NearbyHelpersScreen} />
        <Stack.Screen name="ConfirmRequest" component={ConfirmRequestScreen} />
      </Stack.Navigator>
    </UploadFlowProvider>
  );
};

export default UploadStack;
