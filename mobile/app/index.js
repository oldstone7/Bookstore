// app/index.js - Root index route
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';

export default function Index() {
  const { isAuthenticated, loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.replace('/(auth)/login');
      } else if (user) {
        if (user.role === 'seller') {
          router.replace('/(seller)/dashboard');
        } else {
          router.replace('/(buyer)/storefront');
        }
      }
    }
  }, [isAuthenticated, loading, user]);

  // This component doesn't render anything as it just handles routing
  return null;
}
