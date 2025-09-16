import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Image, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  Alert 
} from 'react-native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../theme/theme';
import { useRouter } from 'expo-router';
import { bookService } from '../../services/bookService';

const AddBookScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const bookValidationSchema = Yup.object().shape({
    title: Yup.string()
      .min(2, 'Title must be at least 2 characters')
      .required('Title is required'),
    description: Yup.string()
      .min(10, 'Description must be at least 10 characters')
      .required('Description is required'),
    price: Yup.number()
      .min(0.01, 'Price must be greater than 0')
      .required('Price is required'),
    stock: Yup.number()
      .min(0, 'Stock cannot be negative')
      .integer('Stock must be a whole number')
      .required('Stock is required'),
    image_url: Yup.string()
      .url('Please enter a valid URL')
      .required('Image URL is required'),
  });

  const handleAddBook = async (values) => {
    try {
      setIsLoading(true);
      await bookService.createBook(values);
      Alert.alert(
        'Success',
        'Book added successfully!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error adding book:', error);
      Alert.alert('Error', error.message || 'Failed to add book. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Book</Text>
          <View style={styles.placeholder} />
        </View>

        <Formik
          initialValues={{ 
            title: '', 
            description: '', 
            price: '', 
            stock: '', 
            image_url: '' 
          }}
          validationSchema={bookValidationSchema}
          onSubmit={handleAddBook}
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Book Title *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter book title"
                  placeholderTextColor={theme.colors.textHint}
                  onChangeText={handleChange('title')}
                  onBlur={handleBlur('title')}
                  value={values.title}
                />
                {errors.title && touched.title && (
                  <Text style={styles.errorText}>{errors.title}</Text>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Enter book description"
                  placeholderTextColor={theme.colors.textHint}
                  onChangeText={handleChange('description')}
                  onBlur={handleBlur('description')}
                  value={values.description}
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                {errors.description && touched.description && (
                  <Text style={styles.errorText}>{errors.description}</Text>
                )}
              </View>

              <View style={styles.rowContainer}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.label}>Price ($) *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0.00"
                    placeholderTextColor={theme.colors.textHint}
                    onChangeText={handleChange('price')}
                    onBlur={handleBlur('price')}
                    value={values.price}
                    keyboardType="decimal-pad"
                  />
                  {errors.price && touched.price && (
                    <Text style={styles.errorText}>{errors.price}</Text>
                  )}
                </View>

                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.label}>Stock *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="0"
                    placeholderTextColor={theme.colors.textHint}
                    onChangeText={handleChange('stock')}
                    onBlur={handleBlur('stock')}
                    value={values.stock}
                    keyboardType="numeric"
                  />
                  {errors.stock && touched.stock && (
                    <Text style={styles.errorText}>{errors.stock}</Text>
                  )}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Image URL *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="https://example.com/book-image.jpg"
                  placeholderTextColor={theme.colors.textHint}
                  onChangeText={handleChange('image_url')}
                  onBlur={handleBlur('image_url')}
                  value={values.image_url}
                  keyboardType="url"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {errors.image_url && touched.image_url && (
                  <Text style={styles.errorText}>{errors.image_url}</Text>
                )}
              </View>

              {/* Image Preview */}
              {values.image_url && (
                <View style={styles.imagePreviewContainer}>
                  <Text style={styles.label}>Image Preview</Text>
                  <Image 
                    source={{ uri: values.image_url }} 
                    style={styles.imagePreview}
                    resizeMode="cover"
                  />
                </View>
              )}

              <TouchableOpacity 
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Adding Book...' : 'Add Book'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
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
  formContainer: {
    padding: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    ...theme.typography.subtitle2,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  input: {
    ...theme.input,
    width: '100%',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  imagePreviewContainer: {
    marginBottom: theme.spacing.lg,
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: theme.spacing.borderRadiusMd,
    marginTop: theme.spacing.sm,
  },
  button: {
    ...theme.button.primary,
    width: '100%',
    marginTop: theme.spacing.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    ...theme.typography.button,
    color: theme.colors.white,
    textAlign: 'center',
  },
});

export default AddBookScreen;
