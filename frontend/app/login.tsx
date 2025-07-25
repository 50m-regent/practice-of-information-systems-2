import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Dimensions, KeyboardAvoidingView, Platform, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Mail, ArrowRight, RefreshCw, Check, X } from 'lucide-react-native';
import { sendOtpToEmail, verifyOtpAndGetToken } from '../api/auth';
import { saveToken } from '@/utils/tokenStorage';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');

  // Countdown timer for resend
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // 调用API发送OTP
      await sendOtpToEmail(email);
      setStep('otp');
      setCountdown(60);
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Failed to send verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      // 调用API验证OTP并获取token
      const data = await verifyOtpAndGetToken(otp);
      // 保存token到本地（可用AsyncStorage/localStorage等）
      await saveToken(data.access_token);
      // 跳转到主页面
      router.replace('/(tabs)');
    } catch (error: any) {
      setError(error?.response?.data?.detail || 'Invalid verification code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (countdown > 0) return;
    setIsResending(true);
    setError('');
    try {
      await sendOtpToEmail(email);
      setCountdown(60);
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setOtp('');
    setError('');
  };

  const renderEmailScreen = () => (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.brandContainer}>
              <View style={styles.brandIcon}>
                <Text style={styles.brandText}>H</Text>
              </View>
              <Text style={styles.brandName}>HealthTracker</Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.stepContainer}>
              <View style={styles.iconContainer}>
                <View style={styles.iconBackground}>
                  <Mail size={32} color="#3B82F6" />
                </View>
              </View>

              <Text style={styles.title}>Welcome!</Text>
              <Text style={styles.subtitle}>
                Enter your email address to receive a verification code
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={[styles.textInput, error && styles.textInputError]}
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setError('');
                  }}
                  placeholder="Enter your email"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!isLoading}
                />
                {error && <Text style={styles.errorText}>{error}</Text>}
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                onPress={handleEmailSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <RefreshCw size={20} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>Sending Code...</Text>
                  </View>
                ) : (
                  <View style={styles.buttonContent}>
                    <Text style={styles.primaryButtonText}>Send Verification Code</Text>
                    <ArrowRight size={20} color="#FFFFFF" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>


        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );

  const renderOtpModal = () => (
    <Modal
      visible={step === 'otp'}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
    >
      {/* Backdrop overlay */}
      <View style={styles.modalBackdrop}>
        <TouchableOpacity 
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={handleBackToEmail}
        />
        
        {/* Minimal modal content */}
        <View style={styles.modalContainer}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContent}
          >
            {/* Close button */}
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={handleBackToEmail}
            >
              <X size={20} color="#6B7280" />
            </TouchableOpacity>

            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enter Verification Code</Text>
              <Text style={styles.modalSubtitle}>
                Verification code sent. Please check your email.
              </Text>
            </View>

            <View style={styles.modalForm}>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.textInput, styles.otpInput, error && styles.textInputError]}
                  value={otp}
                  onChangeText={(text) => {
                    // Only allow numbers and limit to 6 digits
                    const numericText = text.replace(/[^0-9]/g, '').slice(0, 6);
                    setOtp(numericText);
                    setError('');
                  }}
                  placeholder="Enter 6-digit OTP"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="numeric"
                  maxLength={6}
                  editable={!isLoading}
                  autoFocus
                />
                {error && <Text style={styles.errorText}>{error}</Text>}
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, isLoading && styles.primaryButtonDisabled]}
                onPress={handleOtpSubmit}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <Check size={20} color="#FFFFFF" />
                    <Text style={styles.primaryButtonText}>Verifying...</Text>
                  </View>
                ) : (
                  <Text style={styles.primaryButtonText}>Verify & Continue</Text>
                )}
              </TouchableOpacity>

              <View style={styles.resendContainer}>
                <TouchableOpacity
                  style={[styles.secondaryButton, (countdown > 0 || isResending) && styles.secondaryButtonDisabled]}
                  onPress={handleResendCode}
                  disabled={countdown > 0 || isResending}
                >
                  {isResending ? (
                    <RefreshCw size={16} color="#6B7280" />
                  ) : (
                    <Text style={[styles.secondaryButtonText, countdown > 0 && styles.secondaryButtonTextDisabled]}>
                      {countdown > 0 ? `Resend Code (${countdown}s)` : 'Resend Code'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </View>
    </Modal>
  );

  return (
    <>
      {renderEmailScreen()}
      {renderOtpModal()}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB'
  },
  keyboardContainer: {
    flex: 1
  },
  content: {
    flex: 1,
    paddingHorizontal: 24
  },
  header: {
    paddingTop: 40,
    paddingBottom: 60,
    alignItems: 'center'
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  brandText: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#FFFFFF'
  },
  brandName: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827'
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  stepContainer: {
    width: '100%'
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32
  },
  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center'
  },
  title: {
    fontSize: 32,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32
  },
  inputContainer: {
    marginBottom: 32
  },
  inputLabel: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#111827',
    marginBottom: 8
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#111827'
  },
  textInputError: {
    borderColor: '#EF4444'
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    letterSpacing: 8
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#EF4444',
    marginTop: 8
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginBottom: 16
  },
  primaryButtonDisabled: {
    backgroundColor: '#9CA3AF'
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  primaryButtonText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FFFFFF',
    marginHorizontal: 8,
    textAlign: 'center'
  },
  footer: {
    paddingBottom: 32,
    alignItems: 'center'
  },
  footerText: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18
  },
  // Modal styles - simplified and minimal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24
  },
  backdropTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 16
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingBottom: 24
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 12,
    marginTop: 8
  },
  modalHeader: {
    alignItems: 'center',
    paddingBottom: 24
  },
  modalTitle: {
    fontSize: 24,
    fontFamily: 'Inter-Bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8
  },
  modalSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20
  },
  modalForm: {
    width: '100%'
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 8
  },
  secondaryButton: {
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  secondaryButtonDisabled: {
    opacity: 0.5
  },
  secondaryButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#3B82F6'
  },
  secondaryButtonTextDisabled: {
    color: '#9CA3AF'
  }
});