import React, { useState } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Text, Button, TextInput, Avatar, Divider } from 'react-native-paper';
import { useAuth } from '../../src/contexts/AuthContext';
import { authService } from '../../src/services/authService';
import { router } from 'expo-router';

export default function SellerProfileScreen() {
  const { user, logout, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [userData, setUserData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleUpdateProfile = async () => {
    try {
      await authService.updateProfile(userData);
      updateUser(userData);
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', error.toString());
    }
  };

  const handleChangePassword = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    try {
      await authService.changePassword(passwords);
      setIsChangingPassword(false);
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      Alert.alert('Success', 'Password changed successfully');
    } catch (error) {
      Alert.alert('Error', error.toString());
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Text 
          size={80} 
          label={user?.name?.charAt(0)?.toUpperCase() || 'S'} 
        />
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Text style={styles.role}>Seller Account</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profile Information</Text>
        {isEditing ? (
          <>
            <TextInput
              mode="outlined"
              label="Name"
              value={userData.name}
              onChangeText={(text) => setUserData({ ...userData, name: text })}
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Email"
              value={userData.email}
              onChangeText={(text) => setUserData({ ...userData, email: text })}
              style={styles.input}
            />
            <View style={styles.buttonRow}>
              <Button mode="contained" onPress={handleUpdateProfile} style={styles.button}>
                Save Changes
              </Button>
              <Button mode="outlined" onPress={() => setIsEditing(false)} style={styles.button}>
                Cancel
              </Button>
            </View>
          </>
        ) : (
          <Button mode="contained" onPress={() => setIsEditing(true)} style={styles.button}>
            Edit Profile
          </Button>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Change Password</Text>
        {isChangingPassword ? (
          <>
            <TextInput
              mode="outlined"
              label="Current Password"
              value={passwords.currentPassword}
              onChangeText={(text) => setPasswords({ ...passwords, currentPassword: text })}
              secureTextEntry
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="New Password"
              value={passwords.newPassword}
              onChangeText={(text) => setPasswords({ ...passwords, newPassword: text })}
              secureTextEntry
              style={styles.input}
            />
            <TextInput
              mode="outlined"
              label="Confirm New Password"
              value={passwords.confirmPassword}
              onChangeText={(text) => setPasswords({ ...passwords, confirmPassword: text })}
              secureTextEntry
              style={styles.input}
            />
            <View style={styles.buttonRow}>
              <Button mode="contained" onPress={handleChangePassword} style={styles.button}>
                Change Password
              </Button>
              <Button mode="outlined" onPress={() => setIsChangingPassword(false)} style={styles.button}>
                Cancel
              </Button>
            </View>
          </>
        ) : (
          <Button mode="contained" onPress={() => setIsChangingPassword(true)} style={styles.button}>
            Change Password
          </Button>
        )}
      </View>

      <Divider style={styles.divider} />

      <View style={styles.logoutSection}>
        <Button 
          mode="contained" 
          onPress={handleLogout}
          buttonColor="#ff4444"
          style={styles.logoutButton}
        >
          Logout
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  role: {
    fontSize: 14,
    color: '#2196F3',
    marginTop: 5,
    fontWeight: '500',
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  input: {
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  divider: {
    height: 1,
    marginVertical: 20,
  },
  logoutSection: {
    padding: 20,
    paddingTop: 0,
  },
  logoutButton: {
    marginTop: 10,
  },
});
