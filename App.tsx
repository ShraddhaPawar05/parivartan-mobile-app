import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { RequestsProvider } from './src/context/RequestsContext';
import { ThemeProvider } from './src/context/ThemeContext';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AuthStack from './src/navigation/AuthStack';

function AppRoot() {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <RootNavigator /> : <AuthStack />;
}

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <ThemeProvider>
          <RequestsProvider>
            <AppRoot />
          </RequestsProvider>
        </ThemeProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
