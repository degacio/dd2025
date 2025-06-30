import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Shield, LogIn, UserPlus, Sparkles } from 'lucide-react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function AuthWelcomeScreen() {
  const navigateToLogin = () => {
    console.log('🔄 Navigating to login screen...');
    router.push('/auth/login');
  };

  const navigateToRegister = () => {
    console.log('🔄 Navigating to register screen...');
    router.push('/auth/register');
  };

  // Enhanced responsive breakpoints
  const isTablet = screenWidth >= 768;
  const isLargePhone = screenWidth >= 414 && screenWidth < 768; // iPhone Pro Max, Galaxy S24+
  const isMediumPhone = screenWidth >= 375 && screenWidth < 414; // iPhone 14, iPhone 16
  const isSmallPhone = screenWidth < 375; // Smaller devices
  const isShortScreen = screenHeight < 700; // Devices with limited height
  const isVeryShortScreen = screenHeight < 650; // Very compact devices

  console.log('🎨 Rendering AuthWelcomeScreen with dimensions:', {
    screenWidth,
    screenHeight,
    deviceType: isTablet ? 'tablet' : isLargePhone ? 'large-phone' : isMediumPhone ? 'medium-phone' : 'small-phone',
    isShortScreen,
    isVeryShortScreen
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          isShortScreen && styles.scrollContentCompact,
          isVeryShortScreen && styles.scrollContentVeryCompact
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Hero Section */}
        <View style={[
          styles.heroSection,
          isShortScreen && styles.heroSectionCompact,
          isVeryShortScreen && styles.heroSectionVeryCompact
        ]}>
          <View style={[
            styles.logoContainer,
            isSmallPhone && styles.logoContainerSmall,
            isShortScreen && styles.logoContainerCompact
          ]}>
            <Shield size={isSmallPhone ? 48 : isShortScreen ? 56 : 64} color="#D4AF37" />
            <Sparkles 
              size={isSmallPhone ? 24 : isShortScreen ? 28 : 32} 
              color="#D4AF37" 
              style={[
                styles.sparkle,
                isSmallPhone && styles.sparkleSmall,
                isShortScreen && styles.sparkleCompact
              ]} 
            />
          </View>
          
          <Text style={[
            styles.title,
            isSmallPhone && styles.titleSmall,
            isShortScreen && styles.titleCompact
          ]}>
            D&D Companion
          </Text>
          
          <Text style={[
            styles.subtitle,
            isSmallPhone && styles.subtitleSmall,
            isShortScreen && styles.subtitleCompact
          ]}>
            Gerencie seus personagens, magias e aventuras de Dungeons & Dragons
          </Text>
          
          <Image
            source={{ uri: 'https://images.pexels.com/photos/4164418/pexels-photo-4164418.jpeg?auto=compress&cs=tinysrgb&w=800' }}
            style={[
              styles.heroImage,
              isSmallPhone && styles.heroImageSmall,
              isShortScreen && styles.heroImageCompact,
              isVeryShortScreen && styles.heroImageVeryCompact
            ]}
            resizeMode="cover"
          />
        </View>

        {/* Features */}
        <View style={[
          styles.featuresSection,
          isShortScreen && styles.featuresSectionCompact,
          isVeryShortScreen && styles.featuresSectionVeryCompact
        ]}>
          <View style={[
            styles.featureItem,
            isSmallPhone && styles.featureItemSmall,
            isShortScreen && styles.featureItemCompact
          ]}>
            <Shield size={isSmallPhone ? 20 : 24} color="#D4AF37" />
            <Text style={[
              styles.featureText,
              isSmallPhone && styles.featureTextSmall
            ]}>
              Crie e gerencie personagens
            </Text>
          </View>
          
          <View style={[
            styles.featureItem,
            isSmallPhone && styles.featureItemSmall,
            isShortScreen && styles.featureItemCompact
          ]}>
            <Sparkles size={isSmallPhone ? 20 : 24} color="#8E44AD" />
            <Text style={[
              styles.featureText,
              isSmallPhone && styles.featureTextSmall
            ]}>
              Acesse milhares de magias
            </Text>
          </View>
          
          <View style={[
            styles.featureItem,
            isSmallPhone && styles.featureItemSmall,
            isShortScreen && styles.featureItemCompact
          ]}>
            <UserPlus size={isSmallPhone ? 20 : 24} color="#27AE60" />
            <Text style={[
              styles.featureText,
              isSmallPhone && styles.featureTextSmall
            ]}>
              Compartilhe com seu DM
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={[
          styles.actionsSection,
          isShortScreen && styles.actionsSectionCompact,
          isVeryShortScreen && styles.actionsSectionVeryCompact
        ]}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              isSmallPhone && styles.primaryButtonSmall,
              isShortScreen && styles.primaryButtonCompact
            ]}
            onPress={navigateToLogin}
            activeOpacity={0.8}
          >
            <LogIn size={isSmallPhone ? 16 : 20} color="#FFFFFF" />
            <Text style={[
              styles.primaryButtonText,
              isSmallPhone && styles.primaryButtonTextSmall
            ]}>
              Entrar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              isSmallPhone && styles.secondaryButtonSmall,
              isShortScreen && styles.secondaryButtonCompact
            ]}
            onPress={navigateToRegister}
            activeOpacity={0.8}
          >
            <UserPlus size={isSmallPhone ? 16 : 20} color="#D4AF37" />
            <Text style={[
              styles.secondaryButtonText,
              isSmallPhone && styles.secondaryButtonTextSmall
            ]}>
              Criar Conta
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={[
          styles.footer,
          isShortScreen && styles.footerCompact,
          isVeryShortScreen && styles.footerVeryCompact
        ]}>
          <Text style={[
            styles.footerText,
            isSmallPhone && styles.footerTextSmall
          ]}>
            Seus dados são seguros e sincronizados na nuvem
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  scrollContentCompact: {
    paddingBottom: 30,
  },
  scrollContentVeryCompact: {
    paddingBottom: 20,
  },
  heroSection: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 32,
    marginBottom: 40,
  },
  heroSectionCompact: {
    paddingHorizontal: 20,
    paddingTop: 24,
    marginBottom: 30,
  },
  heroSectionVeryCompact: {
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 20,
  },
  logoContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  logoContainerSmall: {
    marginBottom: 20,
  },
  logoContainerCompact: {
    marginBottom: 16,
  },
  sparkle: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  sparkleSmall: {
    top: -6,
    right: -6,
  },
  sparkleCompact: {
    top: -6,
    right: -6,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
    textAlign: 'center',
  },
  titleSmall: {
    fontSize: 28,
    marginBottom: 10,
  },
  titleCompact: {
    fontSize: 28,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  subtitleSmall: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  subtitleCompact: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 12,
  },
  heroImage: {
    width: '100%',
    height: 200,
    borderRadius: 16,
    marginBottom: 32,
  },
  heroImageSmall: {
    height: 160,
    borderRadius: 12,
    marginBottom: 24,
  },
  heroImageCompact: {
    height: 140,
    borderRadius: 12,
    marginBottom: 20,
  },
  heroImageVeryCompact: {
    height: 120,
    borderRadius: 10,
    marginBottom: 16,
  },
  featuresSection: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  featuresSectionCompact: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  featuresSectionVeryCompact: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  featureItemSmall: {
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
  },
  featureItemCompact: {
    padding: 12,
    marginBottom: 8,
  },
  featureText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginLeft: 16,
  },
  featureTextSmall: {
    fontSize: 14,
    marginLeft: 12,
  },
  actionsSection: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 32,
  },
  actionsSectionCompact: {
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  actionsSectionVeryCompact: {
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  primaryButton: {
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
  primaryButtonSmall: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
    minHeight: 48,
  },
  primaryButtonCompact: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
    minHeight: 44,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  primaryButtonTextSmall: {
    fontSize: 16,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 12,
    borderWidth: 2,
    borderColor: '#D4AF37',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: 56,
  },
  secondaryButtonSmall: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
    minHeight: 48,
  },
  secondaryButtonCompact: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
    minHeight: 44,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#D4AF37',
  },
  secondaryButtonTextSmall: {
    fontSize: 16,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  footerCompact: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  footerVeryCompact: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  footerTextSmall: {
    fontSize: 12,
  },
});