import React, { useState, useCallback } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { GoogleSignin, statusCodes, GoogleSigninError } from '@react-native-google-signin/google-signin';

// --- CONFIGURATION ---
// IMPORTANT: Replace this with your actual Web Client ID from Google Cloud Console
// This ID is essential for the native Google Sign-In flow on both platforms.
GoogleSignin.configure({
  webClientId: '122197808815-hbnkec1t6hi9og08blonscociahij130.apps.googleusercontent.com',
});

// Placeholder for the company logo. Use a local require statement for a real asset.
const logoPlaceholder = { uri: 'https://placehold.co/120x120/4f46e5/ffffff?text=LOGO' };

// --- CUSTOM HOOK for Google Sign-In ---
const useGoogleSignIn = (onSuccess: () => void) => {
  const [loading, setLoading] = useState(false);

  const signIn = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Check if device supports Google Play Services (Android only, but safe to call)
      await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      
      // 2. Attempt sign-in
      const userInfo = await GoogleSignin.signIn();
      
      // 3. Success: In a real app, send userInfo.idToken to your backend for verification
      console.log('Google Sign-In Success:', userInfo.user.email); 
      Alert.alert('Success', `Signed in as: ${userInfo.user.email}`);
      onSuccess(); // Trigger the navigation change

    } catch (error) {
      const gError = error as GoogleSigninError;
      if (gError.code === statusCodes.SIGN_IN_CANCELLED) {
        console.log('User cancelled the login flow.');
      } else if (gError.code === statusCodes.IN_PROGRESS) {
        console.log('Sign in is already in progress.');
      } else if (gError.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        Alert.alert('Error', 'Google Play Services not available or outdated.');
      } else {
        console.error('Google Sign-In Error:', error);
        // Provide a more generic but helpful message for other errors
        Alert.alert('Sign-In Error', 'An error occurred. Please check your connection and configuration.');
      }
    } finally {
      setLoading(false);
    }
  }, [onSuccess]);

  return { isSigningIn: loading, signIn };
}

// --- COMPONENT PROPS ---
interface LoginScreenProps {
  onLoginSuccess: () => void;
}

// --- REACT NATIVE COMPONENT ---
export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { isSigningIn: isGoogleSigningIn, signIn: signInWithGoogle } = useGoogleSignIn(onLoginSuccess);
  const [isStandardSigningIn, setStandardSigningIn] = useState(false);
  
  const handleLogin = () => {
    setStandardSigningIn(true);
    console.log('Standard Login Attempt:', { email, password });

    // Simulate a successful API call
    setTimeout(() => {
      setStandardSigningIn(false);
      console.log('Standard Login successful!');
      onLoginSuccess(); // Trigger the navigation change
    }, 2000);
  };

  const handleSignUp = () => {
    console.log('Navigating to Sign Up Screen...');
    // In a real app: navigation.navigate('SignUp');
    // Note: If using Expo/React Navigation, this is where you'd use navigation.navigate()
  };

  const isLoading = isStandardSigningIn || isGoogleSigningIn;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* KeyboardAvoidingView adjusts the layout when the keyboard appears, ensuring inputs are visible */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} // 'height' can be buggy on Android, let ScrollView handle it
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.container}>
          
          {/* Logo/Header Area */}
          <Image source={logoPlaceholder} style={styles.logo} />
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to your account</Text>

          {/* Email/Username Input */}
          <View style={styles.inputContainer}>
            <Icon name="mail-outline" size={24} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Email address"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={setEmail}
              value={email}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Icon name="lock-closed-outline" size={24} style={styles.icon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              autoCapitalize="none"
              onChangeText={setPassword}
              value={password}
            />
          </View>

          {/* Standard Login Button */}
          <TouchableOpacity 
            style={[styles.button, styles.primaryButton]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isStandardSigningIn ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.buttonText}>Sign In</Text>
            )}
          </TouchableOpacity>
          
          {/* Separator */}
          <View style={styles.separatorContainer}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OR</Text>
            <View style={styles.separatorLine} />
          </View>

          {/* Google Login Button */}
          <TouchableOpacity 
            style={[styles.button, styles.googleButton]}
            onPress={signInWithGoogle}
            disabled={isLoading}
          >
            {isGoogleSigningIn ? (
              <ActivityIndicator size="small" color="#4f46e5" />
            ) : (
              <><Icon name="logo-google" size={24} color="#4285F4" style={styles.googleIcon} /><Text style={styles.googleButtonText}>Continue with Google</Text></>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signUpContainer}>
            <Text style={styles.signUpText}>
              Don't have an account? 
            </Text>
            <TouchableOpacity onPress={handleSignUp}>
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flexGrow: 1, // Use flexGrow to allow the container to expand
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingVertical: 40,
    backgroundColor: '#fff',
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    backgroundColor: '#e0e7ff', 
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 55,
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  icon: {
    marginRight: 10,
    color: '#6b7280',
  },
  input: {
    flex: 1,
    height: '100%',
    color: '#1f2937',
    fontSize: 16,
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    // Native shadow for a modern look
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 20,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#d1d5db',
  },
  separatorText: {
    width: 30,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 14,
    fontWeight: '500',
  },
  googleButton: {
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    flexDirection: 'row',
  },
  googleIcon: {
    marginRight: 10,
  },
  googleButtonText: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    marginTop: 20,
  },
  signUpText: {
    color: '#6b7280',
    fontSize: 16,
  },
  signUpLink: {
    color: '#4f46e5',
    fontWeight: '700',
    marginLeft: 5,
  },
});