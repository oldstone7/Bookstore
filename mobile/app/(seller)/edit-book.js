import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../src/theme/theme';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { bookService } from '../../src/services/bookService';

const EditBookScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    image_url: ''
  });

  useEffect(() => {
    if (id) {
      fetchBookDetails();
    }
  }, [id]);

  const fetchBookDetails = async () => {
    try {
      setLoading(true);
      const book = await bookService.getBookById(id);
      setFormData({
        title: book.title,
        description: book.description,
        price: book.price.toString(),
        stock: book.stock.toString(),
        image_url: book.image_url || ''
      });
    } catch (error) {
      console.error('Error fetching book details:', error);
      Alert.alert('Error', 'Failed to load book details. Please try again.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setUpdating(true);
      
      // Validate form data
      if (!formData.title || !formData.price || !formData.stock) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }

      // Validate price and stock
      const price = parseFloat(formData.price);
      const stock = parseInt(formData.stock);

      if (isNaN(price) || price <= 0) {
        Alert.alert('Error', 'Please enter a valid price');
        return;
      }

      if (isNaN(stock) || stock < 0) {
        Alert.alert('Error', 'Please enter a valid stock quantity');
        return;
      }

      // Prepare book data
      const bookData = {
        ...formData,
        price,
        stock
      };

      console.log('Updating book with data:', bookData);
      const updatedBook = await bookService.updateBook(id, bookData);
      console.log('Update response:', updatedBook);

      Alert.alert('Success', 'Book updated successfully', [
        { 
          text: 'OK', 
          onPress: () => {
            // Navigate back with a parameter to indicate update
            router.navigate({
              pathname: '/(seller)/books',
              params: { updated: 'true', timestamp: Date.now() }
            });
          }
        }
      ]);
    } catch (error) {
      console.error('Error updating book:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update book';
      Alert.alert(
        'Error updating book',
        errorMessage,
        [
          { 
            text: 'Try Again',
            onPress: () => handleUpdate()
          },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
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
        <Text style={styles.headerTitle}>Edit Book</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Form */}
      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.input}
            value={formData.title}
            onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
            placeholder="Book title"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Book description"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Price *</Text>
          <TextInput
            style={styles.input}
            value={formData.price}
            onChangeText={(text) => setFormData(prev => ({ ...prev, price: text }))}
            placeholder="0.00"
            keyboardType="decimal-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Stock *</Text>
          <TextInput
            style={styles.input}
            value={formData.stock}
            onChangeText={(text) => setFormData(prev => ({ ...prev, stock: text }))}
            placeholder="0"
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Image URL</Text>
          <TextInput
            style={styles.input}
            value={formData.image_url}
            onChangeText={(text) => setFormData(prev => ({ ...prev, image_url: text }))}
            placeholder="https://example.com/book-image.jpg"
          />
        </View>

        <TouchableOpacity 
          style={[styles.updateButton, updating && styles.updateButtonDisabled]}
          onPress={handleUpdate}
          disabled={updating}
        >
          {updating ? (
            <ActivityIndicator size="small" color={theme.colors.white} />
          ) : (
            <Text style={styles.updateButtonText}>Update Book</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.white,
    ...theme.shadows.small,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    ...theme.typography.h6,
    color: theme.colors.text,
  },
  placeholder: {
    width: 32,
  },
  form: {
    padding: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    ...theme.typography.subtitle2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.spacing.borderRadiusMd,
    padding: theme.spacing.md,
    ...theme.shadows.small,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  updateButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.spacing.borderRadiusMd,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
  },
  updateButtonDisabled: {
    opacity: 0.7,
  },
  updateButtonText: {
    ...theme.typography.button,
    color: theme.colors.white,
  },
});

export default EditBookScreen;