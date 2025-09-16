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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { bookService } from '../../services/bookService';

const BookManagementScreen = () => {
  const router = useRouter();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Add useLocalSearchParams to get route parameters
  const { updated } = useLocalSearchParams();

  // Update useEffect to refetch when 'updated' parameter changes
  useEffect(() => {
    fetchBooks();
  }, [updated]); // This will trigger a refresh when returning from edit screen

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const response = await bookService.getMyBooks();
      setBooks(response);
    } catch (error) {
      console.error('Error fetching books:', error);
      Alert.alert('Error', 'Failed to load books. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchBooks();
  };

  const handleDeleteBook = (bookId, bookTitle) => {
    Alert.alert(
      'Delete Book',
      `Are you sure you want to delete "${bookTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('Attempting to delete book:', bookId);
              const result = await bookService.deleteBook(bookId);
              console.log('Delete response:', result);
              
              // Refresh the books list
              await fetchBooks();
              Alert.alert('Success', 'Book deleted successfully');
            } catch (error) {
              console.error('Error deleting book:', error);
              
              // Get the error message or use a default one
              const errorMessage = 
                error.response?.data?.message || 
                error.message || 
                'Failed to delete book. If the book has orders, it will be hidden from buyers instead of being deleted.';
              
              if (error.response?.status === 500) {
                // Show a more user-friendly message for server errors
                Alert.alert(
                  'Book Hidden',
                  'The book has existing orders and cannot be completely deleted. It has been hidden from buyers instead.',
                  [
                    { text: 'OK', onPress: () => fetchBooks() }
                  ]
                );
              } else {
                // For other types of errors
                Alert.alert(
                  'Error',
                  errorMessage,
                  [
                    { 
                      text: 'Try Again',
                      onPress: () => handleDeleteBook(bookId, bookTitle)
                    },
                    { text: 'Cancel', style: 'cancel' }
                  ]
                );
              }
            }
          }
        }
      ]
    );
  };

  const renderBookItem = ({ item }) => (
    <View style={styles.bookCard}>
      <Image 
        source={{ uri: item.image_url || 'https://via.placeholder.com/100x150?text=No+Image' }} 
        style={styles.bookImage}
        resizeMode="cover"
      />
      
      <View style={styles.bookDetails}>
        <Text style={styles.bookTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.bookPrice}>${parseFloat(item.price).toFixed(2)}</Text>
        <Text style={styles.bookStock}>Stock: {item.stock}</Text>
        <Text style={styles.bookDescription} numberOfLines={2}>
          {item.description}
        </Text>
      </View>
      
      <View style={styles.bookActions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push({
            pathname: '/(seller)/edit-book',
            params: { id: item.id }
          })}
        >
          <Ionicons name="pencil" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => handleDeleteBook(item.id, item.title)}
        >
          <Ionicons name="trash" size={20} color={theme.colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading books...</Text>
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
        <Text style={styles.headerTitle}>My Books</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={() => router.push('/(seller)/add-book')}
        >
          <Ionicons name="add" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      {books.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="library-outline" size={80} color={theme.colors.textHint} />
          <Text style={styles.emptyTitle}>No books yet</Text>
          <Text style={styles.emptySubtitle}>Add your first book to get started</Text>
          <TouchableOpacity 
            style={styles.addFirstBookButton}
            onPress={() => router.push('/(seller)/add-book')}
          >
            <Text style={styles.addFirstBookButtonText}>Add Your First Book</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={books}
          renderItem={renderBookItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.bookList}
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
  addButton: {
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
  addFirstBookButton: {
    ...theme.button.primary,
    paddingHorizontal: theme.spacing.xl,
  },
  addFirstBookButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
  },
  bookList: {
    padding: theme.spacing.md,
  },
  bookCard: {
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
  bookDetails: {
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
  bookStock: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  bookDescription: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    lineHeight: 16,
  },
  bookActions: {
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
  },
  actionButton: {
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
});

export default BookManagementScreen;
