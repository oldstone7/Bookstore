import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { useRouter } from 'expo-router';
import { cartService } from '../../services/cartService';
import { orderService } from '../../services/orderService';

const CartScreen = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await cartService.getCartItems();
      console.log("Received cart items:", response);
      
      // Process items to ensure correct ID structure
      const processedItems = response.map(item => ({
        ...item,
        id: item.cart_item_id, // Use the cart_item_id from backend
        book_id: item.book_id, // Store book_id separately
      }));
      
      console.log("Processed cart items:", processedItems);
      setCartItems(processedItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      Alert.alert('Error', 'Failed to load cart items. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCartItems();
  };

  const handleError = (error, action) => {
    const errorMessage = typeof error === 'string' ? error : error.message || 'An unexpected error occurred';
    Alert.alert('Error', errorMessage);
    // Refresh cart if item not found
    if (errorMessage.includes('not found')) {
      fetchCartItems();
    }
  };

  const updateQuantity = async (cartItemId, newQuantity) => {
    if (!cartItemId) {
      handleError(new Error('Invalid cart item'), 'updating quantity');
      return;
    }

    if (newQuantity < 1) {
      removeFromCart(cartItemId);
      return;
    }

    try {
      setUpdating(cartItemId);
      console.log('Updating cart item:', { cartItemId, newQuantity });
      
      // Make the API call first
      const updatedItem = await cartService.updateCartItem(cartItemId, newQuantity);
      console.log('Server response:', updatedItem);
      
      // Update local state only if we get a successful response
      if (updatedItem) {
        setCartItems(prevItems =>
          prevItems.map(item =>
            item.id === cartItemId 
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
      }
      
      // Fetch the latest data from server
      await fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
      handleError(error, 'updating quantity');
      // Refresh cart to ensure consistency
      await fetchCartItems();
    } finally {
      setUpdating(null);
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!cartItemId) {
      handleError(new Error('Invalid cart item'), 'removing item');
      return;
    }

    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from your cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setUpdating(cartItemId);
              
              // Make the API call first
              await cartService.removeFromCart(cartItemId);
              
              // If successful, update local state
              setCartItems(prevItems => 
                prevItems.filter(item => item.id !== cartItemId)
              );
              
              // Fetch latest data from server
              await fetchCartItems();
            } catch (error) {
              handleError(error, 'removing item');
              // Refresh cart to ensure consistency
              await fetchCartItems();
            } finally {
              setUpdating(null);
            }
          }
        }
      ]
    );
  };

  const calculateTotal = () => {
    return cartItems.reduce((total, item) => {
      return total + (parseFloat(item.price) * item.quantity);
    }, 0);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Add some items to checkout.');
      return;
    }

    Alert.alert(
      'Checkout',
      `Total: $${calculateTotal().toFixed(2)}\n\nProceed with checkout?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Checkout',
          onPress: async () => {
            try {
              setCheckingOut(true);
              
              // Create order from cart (backend handles the logic)
              await orderService.createOrder();
              
              Alert.alert(
                'Order Placed!',
                'Your order has been placed successfully. You can track it in your orders.',
                [
                  { text: 'OK', onPress: () => router.replace('/(buyer)/storefront') }
                ]
              );
            } catch (error) {
              console.error('Error during checkout:', error);
              Alert.alert('Error', 'Failed to place order. Please try again.');
            } finally {
              setCheckingOut(false);
            }
          }
        }
      ]
    );
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image 
        source={{ uri: item.image_url || 'https://via.placeholder.com/100x150?text=No+Image' }} 
        style={styles.bookImage}
        resizeMode="cover"
      />
      
      <View style={styles.itemDetails}>
        <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.bookPrice}>${parseFloat(item.price).toFixed(2)}</Text>
        <Text style={styles.sellerText}>Sold by: {item.seller_name || 'Unknown'}</Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity - 1)}
            disabled={updating === item.id}
          >
            <Ionicons name="remove" size={16} color={theme.colors.text} />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity 
            style={styles.quantityButton}
            onPress={() => updateQuantity(item.id, item.quantity + 1)}
            disabled={updating === item.id}
          >
            <Ionicons name="add" size={16} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.itemActions}>
        <Text style={styles.itemTotal}>
          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
        </Text>
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => removeFromCart(item.id)}
          disabled={updating === item.id}
        >
          <Ionicons name="trash-outline" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading cart...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <TouchableOpacity 
          style={styles.clearButton}
          onPress={() => {
            Alert.alert(
              'Clear Cart',
              'Are you sure you want to clear all items from your cart?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Clear',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await cartService.clearCart();
                      await fetchCartItems();
                    } catch (error) {
                      Alert.alert('Error', 'Failed to clear cart. Please try again.');
                    }
                  }
                }
              ]
            );
          }}
        >
          <Ionicons name="trash-outline" size={24} color={theme.colors.error} />
        </TouchableOpacity>
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color={theme.colors.textHint} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add some books to get started</Text>
          <TouchableOpacity 
            style={styles.shopButton}
            onPress={() => router.replace('/(buyer)/storefront')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Cart Items */}
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.cartList}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[theme.colors.primary]}
                tintColor={theme.colors.primary}
              />
            }
          />

          {/* Checkout Section */}
          <View style={styles.checkoutContainer}>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Total ({cartItems.length} items):</Text>
              <Text style={styles.totalAmount}>${calculateTotal().toFixed(2)}</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.checkoutButton, checkingOut && styles.checkoutButtonDisabled]}
              onPress={handleCheckout}
              disabled={checkingOut}
            >
              {checkingOut ? (
                <ActivityIndicator size="small" color={theme.colors.white} />
              ) : (
                <>
                  <Ionicons name="card" size={20} color={theme.colors.white} />
                  <Text style={styles.checkoutButtonText}>Checkout</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
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
  headerTitle: {
    ...theme.typography.h6,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  clearButton: {
    padding: theme.spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    ...theme.typography.h5,
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  shopButton: {
    ...theme.button.primary,
    paddingHorizontal: theme.spacing.xl,
  },
  shopButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
  },
  cartList: {
    padding: theme.spacing.md,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.borderRadiusMd,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  bookImage: {
    width: 80,
    height: 120,
    borderRadius: theme.spacing.borderRadiusSm,
  },
  itemDetails: {
    flex: 1,
    marginLeft: theme.spacing.md,
    justifyContent: 'space-between',
  },
  bookTitle: {
    ...theme.typography.subtitle2,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  bookPrice: {
    ...theme.typography.body1,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  sellerText: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.lightGray,
    borderRadius: theme.spacing.borderRadiusSm,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    padding: theme.spacing.xs,
    minWidth: 32,
    alignItems: 'center',
  },
  quantityText: {
    ...theme.typography.body2,
    color: theme.colors.text,
    paddingHorizontal: theme.spacing.sm,
    minWidth: 32,
    textAlign: 'center',
  },
  itemActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  itemTotal: {
    ...theme.typography.subtitle2,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
  },
  removeButton: {
    padding: theme.spacing.sm,
  },
  checkoutContainer: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    ...theme.shadows.medium,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  totalLabel: {
    ...theme.typography.subtitle1,
    color: theme.colors.text,
  },
  totalAmount: {
    ...theme.typography.h5,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  checkoutButton: {
    ...theme.button.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
  checkoutButtonDisabled: {
    opacity: 0.7,
  },
  checkoutButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
    marginLeft: theme.spacing.sm,
  },
});

export default CartScreen;
