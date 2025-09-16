import React, { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';
import { theme } from '../theme/theme';

const AuthGuard = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        // User is not authenticated, redirect to login
        router.replace('/(auth)/login');
      } else if (user) {
        // User is authenticated, redirect based on role
        if (user.role === 'seller') {
          router.replace('/(seller)/dashboard');
        } else {
          router.replace('/(buyer)/storefront');
        }
      }
    }
  }, [isAuthenticated, loading, user]);

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: theme.colors.background 
      }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return children;
};

export default AuthGuard;
