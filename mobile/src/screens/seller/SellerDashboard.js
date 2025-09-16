import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert,
  ScrollView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import { bookService } from '../../services/bookService';
import { orderService } from '../../services/orderService';

const SellerDashboard = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalBooks: 0,
    totalOrders: 0,
    pendingOrders: 0,
    unviewedOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [lastViewedOrderTime, setLastViewedOrderTime] = useState(null);

  // Load last viewed time from state
  useEffect(() => {
    const loadLastViewedTime = async () => {
      try {
        // You can use AsyncStorage here if you want to persist across app restarts
        setLastViewedOrderTime(Date.now());
      } catch (error) {
        console.error('Error loading last viewed time:', error);
      }
    };
    loadLastViewedTime();
  }, []);

  // Update dashboard when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Dashboard focused - updating data');
      fetchDashboardData();
    }, [])
  );

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch books and orders in parallel
      const [booksResponse, ordersResponse] = await Promise.all([
        bookService.getMyBooks(),
        orderService.getSellerOrders()
      ]);

      const pendingOrders = ordersResponse.filter(order => order.status === 'pending');
      
      // Calculate unviewed orders (orders created after last view time)
      const unviewedOrders = lastViewedOrderTime 
        ? ordersResponse.filter(order => new Date(order.created_at) > new Date(lastViewedOrderTime))
        : pendingOrders;

      setStats({
        totalBooks: booksResponse.length,
        totalOrders: ordersResponse.length,
        pendingOrders: pendingOrders.length,
        unviewedOrders: unviewedOrders.length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const StatCard = ({ title, value, icon, color, onPress }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress}>
      <View style={[styles.statIcon, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color={theme.colors.white} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </TouchableOpacity>
  );

  const MenuItem = ({ title, icon, onPress, badge }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIcon}>
          <Ionicons name={icon} size={24} color={theme.colors.primary} />
        </View>
        <Text style={styles.menuTitle}>{title}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color={theme.colors.textHint} />
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => router.push('/(seller)/profile')}
          >
            <Ionicons name="person-circle-outline" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <StatCard
          title="Total Books"
          value={stats.totalBooks}
          icon="book-outline"
          color={theme.colors.primary}
          onPress={() => router.push('/(seller)/books')}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon="receipt-outline"
          color={theme.colors.success}
          onPress={() => router.push('/(seller)/orders')}
        />
        <StatCard
          title="Pending Orders"
          value={stats.pendingOrders}
          icon="time-outline"
          color={theme.colors.warning}
          onPress={() => router.push('/(seller)/orders')}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.menuContainer}>
          <MenuItem
            title="Add New Book"
            icon="add-circle-outline"
            onPress={() => router.push('/(seller)/add-book')}
          />
          <MenuItem
            title="Manage Books"
            icon="library-outline"
            onPress={() => router.push('/(seller)/books')}
          />
          <MenuItem
            title="View Orders"
            icon="list-outline"
            onPress={() => {
              // Update last viewed time before navigating
              setLastViewedOrderTime(Date.now());
              router.push('/(seller)/orders');
            }}
            badge={stats.unviewedOrders > 0 ? stats.unviewedOrders : null}
          />
          {/* <MenuItem
            title="Sales Analytics"
            icon="analytics-outline"
            onPress={() => router.push('/(seller)/analytics')}
          /> */}
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.activityContainer}>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="book" size={16} color={theme.colors.primary} />
            </View>
            <Text style={styles.activityText}>
              {stats.totalBooks} books in your catalog
            </Text>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="receipt" size={16} color={theme.colors.success} />
            </View>
            <Text style={styles.activityText}>
              {stats.totalOrders} total orders received
            </Text>
          </View>
          {stats.pendingOrders > 0 && (
            <View style={styles.activityItem}>
              <View style={styles.activityIcon}>
                <Ionicons name="alert-circle" size={16} color={theme.colors.warning} />
              </View>
              <Text style={styles.activityText}>
                {stats.pendingOrders} orders need attention
              </Text>
            </View>
          )}
        </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    ...theme.shadows.small,
  },
  welcomeText: {
    ...theme.typography.body1,
    color: theme.colors.textSecondary,
  },
  userName: {
    ...theme.typography.h5,
    color: theme.colors.text,
    fontWeight: 'bold',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.borderRadiusMd,
    padding: theme.spacing.md,
    alignItems: 'center',
    ...theme.shadows.small,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    ...theme.typography.h4,
    color: theme.colors.text,
    fontWeight: 'bold',
    marginBottom: theme.spacing.xs,
  },
  statTitle: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h6,
    color: theme.colors.text,
    fontWeight: 'bold',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  menuContainer: {
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.spacing.borderRadiusMd,
    ...theme.shadows.small,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.lightGray,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  menuTitle: {
    ...theme.typography.body1,
    color: theme.colors.text,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  badge: {
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  badgeText: {
    ...theme.typography.caption,
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  activityContainer: {
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.lg,
    borderRadius: theme.spacing.borderRadiusMd,
    padding: theme.spacing.lg,
    ...theme.shadows.small,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.lightGray,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  activityText: {
    ...theme.typography.body2,
    color: theme.colors.text,
    flex: 1,
  },
});

export default SellerDashboard;
