import React, { useEffect } from 'react';
import { LogBox } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { preventAutoHideAsync, allowAutoHideAsync } from 'expo-splash-screen';
import * as SplashScreen from 'expo-splash-screen';
import AppNavigator from './src/navigation/AppNavigator';

// Prevent the splash screen from auto-hiding
preventAutoHideAsync().catch(() => {
  /* reloading the app might trigger some race conditions, ignore them */
});

// Ignore specific warnings that we can't fix
LogBox.ignoreLogs([
  'Uncaught (in promise, id: 0) Error: Unable to activate keep awake',
  'Failed to get fcm registration token',
  // Add any other warnings you want to ignore
]);

export default function App() {
  useEffect(() => {
    // Hide the splash screen after the app is ready
    SplashScreen.hideAsync().catch(() => {
      // Ignore errors here
    });

    return () => {
      // Cleanup when the app is unmounted
      allowAutoHideAsync().catch(() => {
        // Ignore cleanup errors
      });
    };
  }, []);

  return (
    <PaperProvider>
      <AppNavigator />
    </PaperProvider>
  );
}
