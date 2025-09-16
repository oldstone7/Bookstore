import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, Image, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { useRouter } from 'expo-router';
import { bookService } from '../../services/bookService';
import { useAuth } from '../../contexts/AuthContext';


const StorefrontScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  const navigateToProfile = () => {
    router.push('/(buyer)/profile');
  };

  const navigateToCart = () => {
    router.push('/(buyer)/cart');
  };

  // Categories for filtering
  const categories = [
    { id: 'all', name: 'All' },
    { id: 'fiction', name: 'Fiction' },
    { id: 'non-fiction', name: 'Non-Fiction' },
    { id: 'fantasy', name: 'Fantasy' },
    { id: 'mystery', name: 'Mystery' },
  ];

  // Fetch books from API
  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getBooks();
      const booksWithImages = response.map(book => ({
        ...book,
        image_url: book.image_url || book.coverImage // Ensure we check both possible image URL fields
      }));
      setBooks(booksWithImages);
      setFilteredBooks(booksWithImages);
      // Reset any image load errors when fetching new data
      setImageLoadErrors({});
    } catch (error) {
      console.error('Error fetching books:', error);
      Alert.alert('Error', 'Failed to load books. Please try again.');
      // Fallback to mock data for development
      setBooks(mockBooks);
      setFilteredBooks(mockBooks);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchBooks();
  }, []);

  // Filter books based on search query and category
  useEffect(() => {
    let result = [...books];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        book => 
          book.title.toLowerCase().includes(query) ||
          book.author.toLowerCase().includes(query) ||
          book.seller.toLowerCase().includes(query)
      );
    }
    
    // Apply category filter
    if (selectedCategory !== 'all') {
      // In a real app, books would have categories
      // For now, we'll just return all books
      // result = result.filter(book => book.category === selectedCategory);
    }
    
    setFilteredBooks(result);
  }, [searchQuery, selectedCategory, books]);

  // Handle pull-to-refresh
  const onRefresh = () => {
    setRefreshing(true);
    fetchBooks();
  };

  // Format price safely
  const formatPrice = (price) => {
    if (typeof price === 'string') {
      price = parseFloat(price);
    }
    return typeof price === 'number' && !isNaN(price) ? price.toFixed(2) : '0.00';
  };

  const [imageLoadErrors, setImageLoadErrors] = useState({});

  // Render book item
  const renderBookItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.bookCard}
      onPress={() => router.push({
        pathname: "/(buyer)/product/[id]",
        params: { id: item.id }
      })}
    >
      <View style={styles.imageContainer}>
        <Image 
          source={{ 
            uri: imageLoadErrors[item.id] 
              ? 'https://via.placeholder.com/150x200?text=No+Image'
              : item.image_url || item.coverImage || 'https://via.placeholder.com/150x200?text=No+Image'
          }}
          style={styles.bookImage} 
          resizeMode="cover"
          onError={() => setImageLoadErrors(prev => ({ ...prev, [item.id]: true }))}
          loadingIndicatorSource={{ uri: 'https://via.placeholder.com/150x200?text=Loading...' }}
        />
        {loading && !imageLoadErrors[item.id] && (
          <ActivityIndicator 
            style={styles.imageLoader} 
            color={theme.colors.primary}
          />
        )}
      </View>
      <View style={styles.bookInfo}>
        <Text style={styles.bookTitle} numberOfLines={1}>{item.title}</Text>
        <Text style={styles.bookAuthor} numberOfLines={1}>{item.author}</Text>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color={theme.colors.warning} />
          <Text style={styles.ratingText}>{item.rating || 'N/A'}</Text>
        </View>
        <Text style={styles.bookSeller} numberOfLines={1}>Sold by: {item.seller}</Text>
        <Text style={styles.bookPrice}>${formatPrice(item.price)}</Text>
      </View>
    </TouchableOpacity>
  );

  // Render category chip
  const renderCategoryChip = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item.id && styles.selectedCategoryChip
      ]}
      onPress={() => setSelectedCategory(item.id)}
    >
      <Text 
        style={[
          styles.categoryText,
          selectedCategory === item.id && styles.selectedCategoryText
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Cart and Profile Icons */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Bookstore</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={navigateToCart} style={styles.iconButton}>
            <Ionicons name="cart-outline" size={28} color={theme.colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={navigateToProfile} style={styles.iconButton}>
            <Ionicons name="person-circle-outline" size={32} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.colors.textHint} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for books, authors, or sellers"
          placeholderTextColor={theme.colors.textHint}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={theme.colors.textHint} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Categories */}
      <View style={styles.categoriesContainer}>
        <FlatList
          data={categories}
          renderItem={renderCategoryChip}
          keyExtractor={item => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryList}
        />
      </View>

      {/* Book Grid */}
      {filteredBooks.length > 0 ? (
        <FlatList
          data={filteredBooks}
          renderItem={renderBookItem}
          keyExtractor={item => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.bookList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          ListFooterComponent={<View style={styles.footerSpace} />}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-off" size={60} color={theme.colors.textHint} />
          <Text style={styles.emptyText}>No books found</Text>
          <Text style={styles.emptySubtext}>Try adjusting your search or filter</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.white,
    ...theme.shadows.small,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.borderRadiusMd,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    ...theme.shadows.small,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: 48,
    color: theme.colors.text,
  },
  clearButton: {
    padding: theme.spacing.xs,
  },
  categoriesContainer: {
    marginBottom: theme.spacing.md,
  },
  categoryList: {
    paddingHorizontal: theme.spacing.lg,
  },
  categoryChip: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: 16,
    backgroundColor: theme.colors.lightGray,
    marginRight: theme.spacing.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCategoryChip: {
    backgroundColor: theme.colors.primaryLight,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    ...theme.typography.body2,
    color: theme.colors.text,
  },
  selectedCategoryText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  bookList: {
    paddingHorizontal: theme.spacing.sm,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.sm,
  },
  bookCard: {
    width: '48%',
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.borderRadiusMd,
    marginBottom: theme.spacing.md,
    ...theme.shadows.small,
    overflow: 'hidden',
  },
  bookImage: {
    width: '100%',
    height: 180,
    borderTopLeftRadius: theme.spacing.borderRadiusMd,
    borderTopRightRadius: theme.spacing.borderRadiusMd,
  },
  bookInfo: {
    padding: theme.spacing.md,
  },
  bookTitle: {
    ...theme.typography.subtitle2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    fontWeight: 'bold',
  },
  bookAuthor: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  ratingText: {
    ...theme.typography.caption,
    color: theme.colors.text,
    marginLeft: theme.spacing.xs,
  },
  bookSeller: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    fontSize: 12,
    marginBottom: theme.spacing.xs,
  },
  bookPrice: {
    ...theme.typography.subtitle2,
    color: theme.colors.primary,
    fontWeight: 'bold',
    marginTop: 'auto',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    ...theme.typography.h6,
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  emptySubtext: {
    ...theme.typography.body2,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.xs,
    textAlign: 'center',
  },
  footerSpace: {
    height: theme.spacing.xl,
  },
});

export default StorefrontScreen;
