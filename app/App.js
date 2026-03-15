// App.js
// Root entry point — sets up navigation, notifications, and query client.

import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import MapScreen            from './src/screens/MapScreen';
import IncidentDetailScreen from './src/screens/IncidentDetailScreen';
import { registerForPushNotifications } from './src/notifications/pushHandler';

const Stack       = createStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  useEffect(() => {
    registerForPushNotifications().catch(console.warn);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <NavigationContainer>
          <StatusBar style="light" />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Map"    component={MapScreen} />
            <Stack.Screen name="Detail" component={IncidentDetailScreen} />
          </Stack.Navigator>
        </NavigationContainer>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
