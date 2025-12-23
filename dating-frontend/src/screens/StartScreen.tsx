// src/screens/StartScreen.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';

export default function StartScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0f0f1e" />
      
      <View style={styles.background}>
        {/* Logo và tiêu đề */}
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>♥</Text>
          </View>
          <Text style={styles.title}>HeartLink</Text>
          <Text style={styles.subtitle}>Find Your Perfect Match</Text>
        </View>

        {/* Nội dung chính */}
        <View style={styles.contentContainer}>
          <View style={styles.featureContainer}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>❤️</Text>
              <Text style={styles.featureText}>Smart Matching</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔒</Text>
              <Text style={styles.featureText}>Safe & Secure</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>👥</Text>
              <Text style={styles.featureText}>Real Connections</Text>
            </View>
          </View>
        </View>

        {/* Các nút hành động */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.signInButton}
            onPress={() => navigation.navigate("Login")}
            activeOpacity={0.8}
          >
            <View style={styles.signInButtonGradient}>
              <Text style={styles.signInButtonText}>Sign In</Text>
              <Text style={styles.buttonIcon}>→</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.signUpButton}
            onPress={() => navigation.navigate("Signup")}
            activeOpacity={0.8}
          >
            <Text style={styles.signUpButtonText}>Create Account</Text>
            <Text style={[styles.buttonIcon, styles.signUpIcon]}>+</Text>
          </TouchableOpacity>

          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText}>Terms</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e',
  },
  background: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 40,
    backgroundColor: '#0f0f1e',
  },
  headerContainer: {
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },
  logoContainer: {
    backgroundColor: 'rgba(255, 64, 129, 0.1)',
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: 'rgba(255, 64, 129, 0.3)',
    shadowColor: '#FF4081',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: 50,
    color: '#FF4081',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 10,
    textAlign: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  featureContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 25,
    padding: 25,
    width: '100%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 15,
  },
  featureIcon: {
    fontSize: 28,
    marginRight: 15,
    width: 40,
    textAlign: 'center',
  },
  featureText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '500',
    flex: 1,
  },
  buttonContainer: {
    paddingHorizontal: 30,
    paddingBottom: 30,
  },
  signInButton: {
    borderRadius: 30,
    overflow: 'hidden',
    marginBottom: 15,
    shadowColor: '#FF4081',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  signInButtonGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#FF4081',
  },
  signInButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 10,
    letterSpacing: 0.5,
  },
  signUpButton: {
    backgroundColor: 'white',
    borderRadius: 30,
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 64, 129, 0.1)',
  },
  signUpButtonText: {
    color: '#FF4081',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 10,
    letterSpacing: 0.5,
  },
  buttonIcon: {
    fontSize: 22,
    color: 'white',
    fontWeight: 'bold',
  },
  signUpIcon: {
    color: '#FF4081',
  },
  termsText: {
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  linkText: {
    color: '#FF7B9D',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});