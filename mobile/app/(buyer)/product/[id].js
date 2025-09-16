import { View, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import ProductDetailScreen from '../../../src/screens/buyer/ProductDetailScreen';

export default function ProductDetail() {
  // No need to extract ID here, ProductDetailScreen will handle it
  return <ProductDetailScreen />;
}
