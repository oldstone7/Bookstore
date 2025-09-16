import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { useRouter } from 'expo-router';
import { orderService } from '../../services/orderService';

const OrdersScreen = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderService.getSellerOrders();
      setOrders(response);
    } catch (error) {
      console.error('Error fetching orders:', error);
      Alert.alert('Error', 'Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdating(orderId);
      await orderService.updateOrderStatus(orderId, newStatus);
      await fetchOrders(); // Refresh the list
      Alert.alert('Success', `Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      Alert.alert('Error', 'Failed to update order status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const handleStatusUpdate = (order) => {
    let statusOptions = [];
    
    switch (order.status) {
      case 'pending':
        statusOptions = ['shipped', 'cancelled'];
        break;
      case 'shipped':
        statusOptions = ['delivered', 'cancelled'];
        break;
      case 'delivered':
      case 'cancelled':
        Alert.alert('Info', 'This order cannot be updated further.');
        return;
    }

    if (statusOptions.length === 0) {
      Alert.alert('Info', 'No status updates available.');
      return;
    }

    Alert.alert(
      'Update Order Status',
      `Current status: ${order.status}\n\nSelect new status:`,
      statusOptions.map(status => ({
        text: status.charAt(0).toUpperCase() + status.slice(1),
        onPress: () => updateOrderStatus(order.id, status)
      })).concat([{ text: 'Cancel', style: 'cancel' }])
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return theme.colors.warning;
      case 'shipped': return theme.colors.info;
      case 'delivered': return theme.colors.success;
      case 'cancelled': return theme.colors.error;
      default: return theme.colors.textSecondary;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return 'time-outline';
      case 'shipped': return 'car-outline';
      case 'delivered': return 'checkmark-circle-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const renderOrderItem = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>Order #{item.id.slice(-8)}</Text>
          <Text style={styles.orderDate}>
            {new Date(item.created_at).toLocaleDateString()}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Ionicons 
            name={getStatusIcon(item.status)} 
            size={16} 
            color={theme.colors.white} 
          />
          <Text style={styles.statusText}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>

      <View style={styles.orderDetails}>
        {item.items && item.items.map((orderItem, index) => (
          <View key={orderItem.id || index}>
            <Text style={styles.bookTitle}>{orderItem.title || 'Book Title Unavailable'}</Text>
            <Text style={styles.quantityInfo}>Quantity: {orderItem.quantity || 0}</Text>
          </View>
        ))}
        <Text style={styles.customerInfo}>
          Customer: {item.buyer_name || 'Unknown'}
        </Text>
        <Text style={styles.priceInfo}>
          Total: ${parseFloat(item.total_price || 0).toFixed(2)}
        </Text>
      </View>

      {item.status !== 'delivered' && item.status !== 'cancelled' && (
        <TouchableOpacity 
          style={[styles.updateButton, updating === item.id && styles.updateButtonDisabled]}
          onPress={() => handleStatusUpdate(item)}
          disabled={updating === item.id}
        >
          {updating === item.id ? (
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <>
              <Ionicons name="arrow-up" size={16} color={theme.colors.white} />
              <Text style={styles.updateButtonText}>Update Status</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading orders...</Text>
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
        <Text style={styles.headerTitle}>Orders</Text>
        <View style={styles.placeholder} />
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={80} color={theme.colors.textHint} />
          <Text style={styles.emptyTitle}>No orders yet</Text>
          <Text style={styles.emptySubtitle}>
            Orders from customers will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.ordersList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
        />
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
  placeholder: {
    width: 40,
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
  },
  ordersList: {
    padding: theme.spacing.md,
  },
  orderCard: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.borderRadiusMd,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    ...theme.typography.subtitle2,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  orderDate: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.spacing.borderRadiusSm,
  },
  statusText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    marginLeft: theme.spacing.xs,
    fontWeight: 'bold',
  },
  orderDetails: {
    marginBottom: theme.spacing.md,
  },
  bookTitle: {
    ...theme.typography.subtitle2,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  customerInfo: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  quantityInfo: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  priceInfo: {
    ...theme.typography.subtitle2,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  updateButton: {
    ...theme.button.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  updateButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
    marginLeft: theme.spacing.xs,
    fontSize: 14,
  },
});

export default OrdersScreen;
