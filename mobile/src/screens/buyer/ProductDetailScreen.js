import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  ScrollView,
  Dimensions 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { bookService } from '../../services/bookService';
import { cartService } from '../../services/cartService';

const { width } = Dimensions.get('window');

const ProductDetailScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const response = await bookService.getBookById(id);
      setBook(response);
    } catch (error) {
      console.error('Error fetching book details:', error);
      Alert.alert('Error', 'Failed to load book details. Please try again.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!book) return;

    try {
      setAddingToCart(true);
      await cartService.addToCart(book.id, quantity);
      Alert.alert(
        'Success', 
        `${book.title} has been added to your cart!`,
        [
          { text: 'Continue Shopping', style: 'cancel' },
          { text: 'View Cart', onPress: () => router.push('/(buyer)/cart') }
        ]
      );
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (book?.stock || 1)) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading book details...</Text>
      </View>
    );
  }

  if (!book) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="book-outline" size={60} color={theme.colors.textHint} />
        <Text style={styles.errorText}>Book not found</Text>
        <TouchableOpacity style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.cartButton} onPress={() => router.push('/(buyer)/cart')}>
          <Ionicons name="cart-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Book Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: book.image_url || 'https://via.placeholder.com/300x400?text=No+Image' }} 
          style={styles.bookImage}
          resizeMode="cover"
        />
      </View>

      {/* Book Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.title}>{book.title}</Text>
        
        <View style={styles.sellerContainer}>
          <Ionicons name="storefront-outline" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.sellerText}>Sold by: {book.seller_name || 'Unknown Seller'}</Text>
        </View>

        <View style={styles.priceContainer}>
          <Text style={styles.price}>${parseFloat(book.price).toFixed(2)}</Text>
          <View style={styles.stockContainer}>
            <Ionicons 
              name={book.stock > 0 ? "checkmark-circle" : "close-circle"} 
              size={16} 
              color={book.stock > 0 ? theme.colors.success : theme.colors.error} 
            />
            <Text style={[
              styles.stockText,
              { color: book.stock > 0 ? theme.colors.success : theme.colors.error }
            ]}>
              {book.stock > 0 ? `${book.stock} in stock` : 'Out of stock'}
            </Text>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionContainer}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.description}>{book.description}</Text>
        </View>

        {/* Quantity Selector */}
        {book.stock > 0 && (
          <View style={styles.quantityContainer}>
            <Text style={styles.quantityLabel}>Quantity:</Text>
            <View style={styles.quantitySelector}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <Ionicons name="remove" size={20} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => handleQuantityChange(1)}
                disabled={quantity >= book.stock}
              >
                <Ionicons name="add" size={20} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Add to Cart Button */}
        <TouchableOpacity 
          style={[
            styles.addToCartButton,
            (book.stock === 0 || addingToCart) && styles.addToCartButtonDisabled
          ]}
          onPress={handleAddToCart}
          disabled={book.stock === 0 || addingToCart}
        >
          {addingToCart ? (
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <>
              <Ionicons name="cart" size={20} color={theme.colors.white} />
              <Text style={styles.addToCartText}>
                {book.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.xl,
  },
  errorText: {
    ...theme.typography.h6,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.small,
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  cartButton: {
    padding: theme.spacing.sm,
  },
  imageContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.white,
  },
  bookImage: {
    width: width * 0.6,
    height: width * 0.8,
    borderRadius: theme.spacing.borderRadiusMd,
    ...theme.shadows.medium,
  },
  detailsContainer: {
    backgroundColor: theme.colors.white,
    marginTop: theme.spacing.md,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  title: {
    ...theme.typography.h5,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  sellerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sellerText: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  price: {
    ...theme.typography.h4,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  stockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockText: {
    ...theme.typography.caption,
    marginLeft: theme.spacing.xs,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginBottom: theme.spacing.lg,
  },
  descriptionTitle: {
    ...theme.typography.subtitle1,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  description: {
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
    lineHeight: 24,
  },
  quantityContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  quantityLabel: {
    ...theme.typography.subtitle2,
    color: theme.colors.text,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.lightGray,
    borderRadius: theme.spacing.borderRadiusMd,
  },
  quantityButton: {
    padding: theme.spacing.sm,
    minWidth: 40,
    alignItems: 'center',
  },
  quantityText: {
    ...theme.typography.subtitle1,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.md,
    minWidth: 40,
    textAlign: 'center',
  },
  addToCartButton: {
    ...theme.button.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
  addToCartButtonDisabled: {
    backgroundColor: theme.colors.gray,
    opacity: 0.6,
  },
  addToCartText: {
    ...theme.typography.button,
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
  },
  button: {
    ...theme.button.primary,
    paddingHorizontal: theme.spacing.xl,
  },
  buttonText: {
    ...theme.typography.button,
    color: theme.colors.white,
  },
});

export default ProductDetailScreen;