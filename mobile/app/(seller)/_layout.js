// app/(seller)/_layout.js
import { Stack } from 'expo-router';

export default function SellerLayout() {
  return (
    <Stack>
      <Stack.Screen 
        name="dashboard" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="books" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="add-book" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="edit-book" 
        options={{ headerShown: false }} 
      />
      <Stack.Screen 
        name="orders" 
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
