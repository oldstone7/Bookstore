import api from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const authService = {
  // Register new user
  register: async (userData) => {
    try {
      const response = await api.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error.response?.data || error.message;
    }
  },

  // Login user
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get logged-in user details
  getMe: async () => {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update user profile
  updateProfile: async (userData) => {
    try {
      const response = await api.put('/auth/profile', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Change password
  changePassword: async (passwordData) => {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      return response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw error.response.data.message;
      } else if (typeof error.response?.data === 'string') {
        throw error.response.data;
      } else {
        throw 'Failed to change password. Please try again.';
      }
    }
  },

  // Logout user
  logout: async () => {
    try {
      await api.post('/auth/logout'); // Optional: if backend supports
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    }
  }
};

export { authService };
