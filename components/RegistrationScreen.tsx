import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { supabase } from '../lib/supabase';

const { height } = Dimensions.get('window');
const MODAL_HEIGHT = height * 0.8;

interface RegistrationScreenProps {
  isVisible: boolean;
  onClose: () => void;
}

const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ isVisible, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    gender: 'Male',
    dateOfBirth: new Date(),
  });
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(MODAL_HEIGHT)).current;

  useEffect(() => {
    if (isVisible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: MODAL_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isVisible]);

  const handleOverlayPress = () => {
    onClose();
  };

  const handleRegister = async () => {
    if (!formData.fullName || !formData.email || !formData.password) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            gender: formData.gender,
            date_of_birth: formData.dateOfBirth.toISOString(),
          }
        }
      });

      if (error) throw error;

      if (data.user) {
        Alert.alert('Success', 'Registration successful. Please check your email for verification.');
        onClose();
      } else {
        throw new Error('User data is null');
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', error.message || 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setFormData(prev => ({ ...prev, dateOfBirth: selectedDate }));
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <TouchableWithoutFeedback onPress={handleOverlayPress}>
          <View style={styles.overlay} />
        </TouchableWithoutFeedback>

        <Animated.View
          style={[
            styles.content,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.handle} />

            <View style={styles.logoContainer}>
              <Image
                source={{ uri: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202024-11-18%20at%205.50.18%20PM-LMIR59z8hGB2CEGqKDeoVd8GuRnGgm.jpeg' }}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.title}>Register</Text>
            <Text style={styles.subtitle}>
              Enter your details to create an account
            </Text>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                value={formData.fullName}
                onChangeText={(text) => setFormData(prev => ({ ...prev, fullName: text }))}
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                value={formData.email}
                onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={formData.password}
                onChangeText={(text) => setFormData(prev => ({ ...prev, password: text }))}
                secureTextEntry
                editable={!loading}
              />
            </View>

            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={formData.gender}
                style={styles.picker}
                onValueChange={(itemValue) => setFormData(prev => ({ ...prev, gender: itemValue }))}
                enabled={!loading}
              >
                <Picker.Item label="Male" value="Male" />
                <Picker.Item label="Female" value="Female" />
                <Picker.Item label="Other" value="Other" />
              </Picker>
            </View>

            <TouchableOpacity 
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
              disabled={loading}
            >
              <Text style={styles.dateButtonText}>
                {formData.dateOfBirth.toDateString()}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={formData.dateOfBirth}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

            <TouchableOpacity 
              style={[styles.registerButton, loading && styles.registerButtonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? 'Registering...' : 'Register'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  content: {
    backgroundColor: 'white',
    height: MODAL_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 20,
  },
  logoContainer: {
    marginVertical: 20,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  pickerContainer: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    height: 50,
  },
  dateButton: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  dateButtonText: {
    fontSize: 16,
    color: '#333',
  },
  registerButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#E91E63',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  registerButtonDisabled: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegistrationScreen;

