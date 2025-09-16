import api from '../config/api';

export const cartService = {
  // Get user's cart items
  getCartItems: async () => {
    try {
      const response = await api.get('/cart');
      // Ensure we're working with the correct cart item IDs
      const items = (response.data.items || []).map(item => ({
        ...item,
        cart_id: item.id, // Store the cart item ID separately
        id: item.id, // Keep the id field for backward compatibility
      }));
      console.log('Processed cart items in service:', items);
      return items;
    } catch (error) {
      console.error('Error in getCartItems:', error);
      throw error.response?.data || error.message;
    }
  },

  // Add item to cart
  addToCart: async (bookId, quantity = 1) => {
    try {
      const response = await api.post('/cart', { book_id: bookId, quantity });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update cart item quantity
  updateCartItem: async (cartItemId, quantity) => {
    try {
      if (!cartItemId) {
        throw new Error('Cart item ID is required');
      }
      const response = await api.put(`/cart/${cartItemId}`, { quantity });
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Cart item not found. Please refresh your cart.');
      }
      throw error.response?.data?.message || error.message;
    }
  },

  // Remove item from cart
  removeFromCart: async (cartItemId) => {
    try {
      if (!cartItemId) {
        throw new Error('Cart item ID is required');
      }
      const response = await api.delete(`/cart/${cartItemId}`);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        throw new Error('Cart item not found. Please refresh your cart.');
      }
      throw error.response?.data?.message || error.message;
    }
  },

  // Clear entire cart
  clearCart: async () => {
    try {
      const response = await api.delete('/cart');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};
