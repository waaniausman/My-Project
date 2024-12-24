import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Animated } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import LoginScreen from './LoginScreen';
import RegistrationScreen from './RegistrationScreen';
import { supabase } from '../lib/supabase';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [isLoginVisible, setIsLoginVisible] = useState(false);
  const [isRegisterVisible, setIsRegisterVisible] = useState(false);
  const translateX = React.useRef(new Animated.Value(-300)).current;

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -300,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const handleLoginPress = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      alert('Already logged in as: ' + session.user.phone);
    } else {
      setIsLoginVisible(true);
    }
    onClose();
  };

  const handleRegisterPress = () => {
    setIsRegisterVisible(true);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.overlayBackground} />
        </TouchableOpacity>
      )}
      
      <Animated.View
        style={[
          styles.container,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <SafeAreaView style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.headerText}>Hi, Guest</Text>
          </View>

          <TouchableOpacity style={styles.menuItem} onPress={handleLoginPress}>
            <MaterialCommunityIcons 
              name="login" 
              size={24} 
              color="#333"
              style={styles.menuIcon} 
            />
            <Text style={styles.menuText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleRegisterPress}>
            <MaterialCommunityIcons 
              name="account-plus" 
              size={24} 
              color="#333"
              style={styles.menuIcon} 
            />
            <Text style={styles.menuText}>Register</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons 
              name="headphones" 
              size={24} 
              color="#333"
              style={styles.menuIcon} 
            />
            <Text style={styles.menuText}>Support</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </Animated.View>

      <LoginScreen 
        isVisible={isLoginVisible}
        onClose={() => setIsLoginVisible(false)}
      />
      <RegistrationScreen 
        isVisible={isRegisterVisible}
        onClose={() => setIsRegisterVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 10,
  },
  overlayBackground: {
    flex: 1,
  },
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 300,
    backgroundColor: '#fff',
    zIndex: 20,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  menuIcon: {
    marginRight: 15,
  },
  menuText: {
    fontSize: 18,
  },
});

export default Sidebar;

