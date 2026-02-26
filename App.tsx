import { NavigationContainer } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { RequestsProvider } from './src/context/RequestsContext';
import { ThemeProvider } from './src/context/ThemeContext';
import AuthStack from './src/navigation/AuthStack';
import AppStack from './src/navigation/AppStack';
import LocationSetupScreen from './src/screens/LocationSetupScreen';
import { View, ActivityIndicator } from 'react-native';
import { loadModel } from './src/services/aiService';
import { requestPushNotificationPermissions, setupNotificationListeners, registerPushToken } from './src/services/pushNotificationService';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './src/firebase/firebase';
import { Buffer } from 'buffer';
global.Buffer = Buffer;


function AppRoot() {
  const { isLoggedIn, loading, user } = useAuth();
  const [onboardingComplete, setOnboardingComplete] = useState<boolean | null>(null);
  const [onboardingKey, setOnboardingKey] = useState(0);
  
  useEffect(() => {
    loadModel();
    requestPushNotificationPermissions().catch(() => {
      console.log('Push notification permissions not granted');
    });
    
    // Setup notification listeners
    const cleanup = setupNotificationListeners();
    return cleanup;
  }, []);
  
  // Register push token when user logs in
  useEffect(() => {
    if (isLoggedIn && user?.uid) {
      registerPushToken(user.uid).catch(err => {
        // Silently fail - push notifications are optional
        console.log('Push token registration skipped');
      });
    }
  }, [isLoggedIn, user?.uid]);
  useEffect(() => {
    const checkOnboardingComplete = async () => {
      try {
        // Check AsyncStorage first
        const completed = await AsyncStorage.getItem('@parivartan:onboardingComplete');
        const locationData = await AsyncStorage.getItem('@parivartan:location');
        console.log('AsyncStorage - onboarding:', completed, 'location:', !!locationData);
        
        // If both exist in AsyncStorage, onboarding is complete
        if (completed === 'true' && locationData) {
          setOnboardingComplete(true);
          return;
        }
        
        // Otherwise check Firestore
        if (user?.uid) {
          const userRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const hasLocation = userData?.location && userData.location.house && userData.location.city;
            console.log('Firestore - has location:', hasLocation);
            
            if (hasLocation) {
              // Sync to AsyncStorage
              await AsyncStorage.setItem('@parivartan:onboardingComplete', 'true');
              await AsyncStorage.setItem('@parivartan:location', JSON.stringify(userData.location));
              setOnboardingComplete(true);
              return;
            }
          }
        }
        
        setOnboardingComplete(false);
      } catch (e) {
        console.error('Error checking onboarding:', e);
        setOnboardingComplete(false);
      }
    };
    
    if (isLoggedIn) {
      console.log('User logged in, checking onboarding status');
      checkOnboardingComplete();
    } else {
      console.log('User not logged in, resetting onboarding');
      setOnboardingComplete(null);
    }
  }, [isLoggedIn, onboardingKey, user?.uid]);

  // Show loading while checking states
  if (loading || (isLoggedIn && onboardingComplete === null)) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  // Not logged in - show auth screens
  if (!isLoggedIn) {
    console.log('Showing AuthStack, isLoggedIn:', isLoggedIn);
    return <AuthStack />;
  }

  // Logged in but onboarding not complete - show location setup
  if (onboardingComplete !== true) {
    console.log('Showing LocationSetupScreen, onboardingComplete:', onboardingComplete);
    return <LocationSetupScreen onLocationSaved={() => {
      console.log('LocationSetupScreen callback triggered');
      setOnboardingKey(k => k + 1);
    }} />;
  }

  // Logged in and onboarding complete - show main app
  console.log('Showing AppStack, onboardingComplete:', onboardingComplete);
  return <AppStack />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <AuthProvider>
          <ThemeProvider>
            <RequestsProvider>
              <AppRoot />
            </RequestsProvider>
          </ThemeProvider>
        </AuthProvider>
      </NavigationContainer>
    </SafeAreaProvider>
  );
  
}
