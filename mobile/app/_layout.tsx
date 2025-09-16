import { Stack } from 'expo-router';
import { View } from 'react-native';
import { theme } from '../src/theme/theme';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../src/contexts/AuthContext';
import AuthGuard from '../src/components/AuthGuard';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AuthGuard>
          <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
            <Stack>
              <Stack.Screen 
                name="(auth)" 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="(buyer)" 
                options={{ headerShown: false }} 
              />
              <Stack.Screen 
                name="(seller)" 
                options={{ headerShown: false }} 
              />
            </Stack>
          </View>
        </AuthGuard>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
