import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, LogIn, Eye, EyeOff, Mail, Lock, Shield } from 'lucide-react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    console.log('🔄 Starting login process for:', email.trim());
    
    if (!email.trim() || !password.trim()) {
      console.log('❌ Empty fields detected');
      if (Platform.OS === 'web') {
        alert('Erro: Por favor, preencha todos os campos.');
      } else {
        Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      }
      return;
    }

    setLoading(true);
    console.log('🔄 Setting loading state to true');
    
    try {
      console.log('📤 Attempting Supabase login...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      console.log('📥 Login response received');
      console.log('📊 Login data:', data ? 'Data received' : 'No data');
      console.log('📊 Login error:', error ? error.message : 'No error');

      if (error) {
        console.error('❌ Login error:', error);
        
        let errorMessage = 'Erro de login desconhecido.';
        
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos. Verifique suas credenciais e tente novamente.';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Muitas tentativas de login. Aguarde alguns minutos e tente novamente.';
        } else {
          errorMessage = error.message;
        }
        
        console.log('🚨 Showing error message:', errorMessage);
        
        if (Platform.OS === 'web') {
          alert(`Erro de Login: ${errorMessage}`);
        } else {
          Alert.alert('Erro de Login', errorMessage);
        }
        return;
      }

      if (data.user && data.session) {
        console.log('✅ Login successful for:', data.user.email);
        console.log('📊 Session data:', {
          userId: data.user.id,
          email: data.user.email,
          accessToken: data.session.access_token ? 'Present' : 'Missing'
        });
        
        // Clear form
        setEmail('');
        setPassword('');
        
        // Show success message and redirect
        const successMessage = `Bem-vindo(a) de volta, ${data.user.email}!`;
        console.log('🎉 Showing success message:', successMessage);
        
        if (Platform.OS === 'web') {
          // For web, show alert and navigate immediately
          alert(`Login Realizado com Sucesso! ${successMessage}`);
          console.log('🔄 Navigating to main app (web)...');
          router.replace('/(tabs)');
        } else {
          // For mobile, use Alert with callback
          Alert.alert(
            'Login Realizado com Sucesso!',
            successMessage,
            [
              {
                text: 'Continuar',
                onPress: () => {
                  console.log('🔄 Navigating to main app (mobile)...');
                  router.replace('/(tabs)');
                },
              },
            ]
          );
        }
      } else {
        console.error('❌ Login failed: No user or session returned');
        console.log('📊 Data details:', {
          hasUser: !!data.user,
          hasSession: !!data.session,
          userData: data.user,
          sessionData: data.session
        });
        
        if (Platform.OS === 'web') {
          alert('Erro: Falha no login. Tente novamente.');
        } else {
          Alert.alert('Erro', 'Falha no login. Tente novamente.');
        }
      }
    } catch (error) {
      console.error('💥 Login error:', error);
      console.error('💥 Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      
      let errorMessage = 'Erro inesperado durante o login.';
      
      if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Tempo limite excedido. Tente novamente.';
      }
      
      if (Platform.OS === 'web') {
        alert(`Erro: ${errorMessage}`);
      } else {
        Alert.alert('Erro', errorMessage);
      }
    } finally {
      console.log('🔄 Setting loading state to false');
      setLoading(false);
    }
  };

  const goBack = () => {
    console.log('🔙 Going back to auth welcome screen');
    router.back();
  };

  const navigateToRegister = () => {
    console.log('🔄 Navigating to register screen');
    router.push('/auth/register');
  };

  const handleForgotPassword = () => {
    if (!email.trim()) {
      const message = 'Por favor, digite seu email no campo acima e tente novamente.';
      if (Platform.OS === 'web') {
        alert(`Email necessário: ${message}`);
      } else {
        Alert.alert('Email necessário', message);
      }
      return;
    }

    const confirmMessage = `Enviar email de redefinição de senha para ${email.trim()}?`;
    
    const sendResetEmail = async () => {
      try {
        console.log('📧 Sending password reset email to:', email.trim());
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
        if (error) {
          console.error('❌ Password reset error:', error);
          if (Platform.OS === 'web') {
            alert(`Erro: ${error.message}`);
          } else {
            Alert.alert('Erro', error.message);
          }
        } else {
          console.log('✅ Password reset email sent successfully');
          const successMessage = 'Verifique sua caixa de entrada para redefinir sua senha.';
          if (Platform.OS === 'web') {
            alert(`Email Enviado: ${successMessage}`);
          } else {
            Alert.alert('Email Enviado', successMessage);
          }
        }
      } catch (error) {
        console.error('💥 Password reset error:', error);
        if (Platform.OS === 'web') {
          alert('Erro: Não foi possível enviar o email de redefinição.');
        } else {
          Alert.alert('Erro', 'Não foi possível enviar o email de redefinição.');
        }
      }
    };

    if (Platform.OS === 'web') {
      if (confirm(`Redefinir Senha: ${confirmMessage}`)) {
        sendResetEmail();
      }
    } else {
      Alert.alert(
        'Redefinir Senha',
        confirmMessage,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Enviar',
            onPress: sendResetEmail,
          },
        ]
      );
    }
  };

  // Enhanced responsive breakpoints for mobile devices
  const isTablet = screenWidth >= 768;
  const isLargePhone = screenWidth >= 414 && screenWidth < 768; // iPhone Pro Max, Galaxy S24+
  const isMediumPhone = screenWidth >= 375 && screenWidth < 414; // iPhone 14, Galaxy S24
  const isSmallPhone = screenWidth < 375; // Smaller devices
  const isShortScreen = screenHeight < 700; // Devices with limited height

  console.log('🎨 Rendering LoginScreen with state:', {
    email: email ? 'Has email' : 'No email',
    password: password ? 'Has password' : 'No password',
    loading,
    showPassword,
    screenWidth,
    screenHeight,
    deviceType: isTablet ? 'tablet' : isLargePhone ? 'large-phone' : isMediumPhone ? 'medium-phone' : 'small-phone',
    isShortScreen
  });

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView 
          style={styles.scrollContainer} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            styles.scrollContent,
            isShortScreen && styles.scrollContentCompact
          ]}
          bounces={false}
        >
          {/* Header */}
          <View style={[
            styles.header,
            isSmallPhone && styles.headerSmall,
            isShortScreen && styles.headerShort
          ]}>
            <TouchableOpacity 
              style={[styles.backButton, loading && styles.disabledButton]} 
              onPress={goBack}
              disabled={loading}
            >
              <ArrowLeft size={isSmallPhone ? 20 : 24} color={loading ? "#95A5A6" : "#333"} />
            </TouchableOpacity>
            
            <View style={styles.headerContent}>
              <View style={[
                styles.iconContainer,
                isSmallPhone && styles.iconContainerSmall,
                isShortScreen && styles.iconContainerShort
              ]}>
                <Shield size={isSmallPhone ? 24 : isShortScreen ? 28 : 32} color="#D4AF37" />
              </View>
              <Text style={[
                styles.title,
                isSmallPhone && styles.titleSmall,
                isShortScreen && styles.titleShort
              ]}>
                Entrar
              </Text>
              <Text style={[
                styles.subtitle,
                isSmallPhone && styles.subtitleSmall,
                isShortScreen && styles.subtitleShort
              ]}>
                Acesse sua conta para gerenciar seus personagens
              </Text>
            </View>
          </View>

          {/* Form */}
          <View style={[
            styles.form,
            isSmallPhone && styles.formSmall,
            isShortScreen && styles.formShort
          ]}>
            <View style={[
              styles.inputContainer,
              isShortScreen && styles.inputContainerShort
            ]}>
              <View style={[styles.inputWrapper, loading && styles.inputWrapperDisabled]}>
                <Mail size={isSmallPhone ? 16 : 20} color={loading ? "#BDC3C7" : "#666"} style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.textInput,
                    isSmallPhone && styles.textInputSmall
                  ]}
                  placeholder="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  placeholderTextColor={loading ? "#BDC3C7" : "#999"}
                />
              </View>
            </View>

            <View style={[
              styles.inputContainer,
              isShortScreen && styles.inputContainerShort
            ]}>
              <View style={[styles.inputWrapper, loading && styles.inputWrapperDisabled]}>
                <Lock size={isSmallPhone ? 16 : 20} color={loading ? "#BDC3C7" : "#666"} style={styles.inputIcon} />
                <TextInput
                  style={[
                    styles.textInput,
                    styles.passwordInput,
                    isSmallPhone && styles.textInputSmall
                  ]}
                  placeholder="Senha"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!loading}
                  placeholderTextColor={loading ? "#BDC3C7" : "#999"}
                />
                <TouchableOpacity
                  style={[styles.eyeButton, loading && styles.disabledButton]}
                  onPress={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff size={isSmallPhone ? 16 : 20} color={loading ? "#BDC3C7" : "#666"} />
                  ) : (
                    <Eye size={isSmallPhone ? 16 : 20} color={loading ? "#BDC3C7" : "#666"} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.forgotPasswordButton,
                loading && styles.disabledButton,
                isShortScreen && styles.forgotPasswordButtonShort
              ]}
              onPress={handleForgotPassword}
              disabled={loading}
            >
              <Text style={[
                styles.forgotPasswordText, 
                loading && styles.forgotPasswordTextDisabled,
                isSmallPhone && styles.forgotPasswordTextSmall
              ]}>
                Esqueceu sua senha?
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.loginButton, 
                loading && styles.loginButtonDisabled,
                isSmallPhone && styles.loginButtonSmall,
                isShortScreen && styles.loginButtonShort
              ]}
              onPress={() => {
                console.log('🎯 Login button pressed!');
                console.log('📊 Button state - loading:', loading);
                if (!loading) {
                  console.log('✅ Button not disabled, calling handleLogin...');
                  handleLogin();
                } else {
                  console.log('⚠️ Button is disabled, ignoring press');
                }
              }}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <Text style={[
                  styles.loginButtonText,
                  isSmallPhone && styles.loginButtonTextSmall
                ]}>
                  Entrando...
                </Text>
              ) : (
                <>
                  <LogIn size={isSmallPhone ? 16 : 20} color="#FFFFFF" />
                  <Text style={[
                    styles.loginButtonText,
                    isSmallPhone && styles.loginButtonTextSmall
                  ]}>
                    Entrar
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Footer */}
          <View style={[
            styles.footer,
            isSmallPhone && styles.footerSmall,
            isShortScreen && styles.footerShort
          ]}>
            <Text style={[
              styles.footerText,
              isSmallPhone && styles.footerTextSmall
            ]}>
              Não tem uma conta?
            </Text>
            <TouchableOpacity 
              onPress={navigateToRegister} 
              disabled={loading}
              style={[
                styles.footerLinkButton,
                loading && styles.disabledButton
              ]}
            >
              <Text style={[
                styles.footerLink, 
                loading && styles.footerLinkDisabled,
                isSmallPhone && styles.footerLinkSmall
              ]}>
                Criar conta
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  scrollContentCompact: {
    paddingBottom: 20,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
  },
  headerSmall: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerShort: {
    paddingTop: 12,
    paddingBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 20,
    borderRadius: 8,
    minWidth: 44,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  headerContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF9E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconContainerSmall: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 12,
  },
  iconContainerShort: {
    width: 64,
    height: 64,
    borderRadius: 32,
    marginBottom: 12,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  titleSmall: {
    fontSize: 26,
    marginBottom: 6,
  },
  titleShort: {
    fontSize: 28,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  subtitleSmall: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 8,
  },
  subtitleShort: {
    fontSize: 14,
    lineHeight: 20,
    paddingHorizontal: 12,
  },
  form: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  formSmall: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  formShort: {
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputContainerShort: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    paddingHorizontal: 16,
    paddingVertical: 4,
    minHeight: 56,
  },
  inputWrapperDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E0E0E0',
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    paddingVertical: 16,
  },
  textInputSmall: {
    fontSize: 14,
    paddingVertical: 14,
  },
  passwordInput: {
    paddingRight: 12,
  },
  eyeButton: {
    padding: 8,
    borderRadius: 6,
    minWidth: 36,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  forgotPasswordButton: {
    alignSelf: 'flex-end',
    marginBottom: 24,
    padding: 8,
    borderRadius: 6,
    minHeight: 36,
    justifyContent: 'center',
  },
  forgotPasswordButtonShort: {
    marginBottom: 16,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '500',
  },
  forgotPasswordTextSmall: {
    fontSize: 12,
  },
  forgotPasswordTextDisabled: {
    color: '#BDC3C7',
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    minHeight: 56,
  },
  loginButtonSmall: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
    minHeight: 48,
  },
  loginButtonShort: {
    paddingVertical: 12,
    minHeight: 44,
  },
  loginButtonDisabled: {
    backgroundColor: '#BDC3C7',
    elevation: 0,
    shadowOpacity: 0,
  },
  loginButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loginButtonTextSmall: {
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
    gap: 8,
    flexWrap: 'wrap',
  },
  footerSmall: {
    paddingHorizontal: 16,
    paddingBottom: 24,
    gap: 4,
  },
  footerShort: {
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#666',
  },
  footerTextSmall: {
    fontSize: 14,
  },
  footerLinkButton: {
    padding: 4,
    borderRadius: 4,
    minHeight: 32,
    justifyContent: 'center',
  },
  footerLink: {
    fontSize: 16,
    color: '#D4AF37',
    fontWeight: '600',
  },
  footerLinkSmall: {
    fontSize: 14,
  },
  footerLinkDisabled: {
    color: '#BDC3C7',
  },
});