// app/(buyer)/_layout.js
import { Stack } from 'expo-router';

export default function BuyerLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="storefront" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="cart" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="product/[id]" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="profile" 
        options={{ 
          title: 'Profile',
          headerShown: true,
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#000',
        }} 
      />
    </Stack>
  );
}