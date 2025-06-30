import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Shield } from 'lucide-react-native';

interface AuthGuardProps {
  children: React.ReactNode;
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 AuthGuard mounted, checking auth status...');
    checkAuthStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔐 Auth state changed:', event, session?.user?.email || 'No user');
        console.log('📊 Session details:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          email: session?.user?.email
        });
        
        const authenticated = !!session;
        setIsAuthenticated(authenticated);
        setLoading(false);

        if (event === 'SIGNED_OUT') {
          console.log('🚪 User signed out, redirecting to auth...');
          setIsAuthenticated(false);
          // Use setTimeout to avoid navigation during render
          setTimeout(() => {
            router.replace('/auth');
          }, 100);
        } else if (event === 'SIGNED_IN' && session) {
          console.log('🚪 User signed in, setting authenticated state...');
          setIsAuthenticated(true);
        }
      }
    );

    return () => {
      console.log('🔐 AuthGuard unmounting, cleaning up subscription...');
      subscription.unsubscribe();
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      console.log('🔍 Checking initial auth status...');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('❌ Error checking auth status:', error);
        setIsAuthenticated(false);
      } else {
        const authenticated = !!session;
        console.log('🔍 Auth status check result:', {
          authenticated,
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email
        });
        setIsAuthenticated(authenticated);
      }
    } catch (error) {
      console.error('💥 Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth status
  if (loading) {
    console.log('⏳ AuthGuard showing loading state...');
    return (
      <View style={styles.loadingContainer}>
        <Shield size={48} color="#D4AF37" />
        <ActivityIndicator size="large" color="#D4AF37" style={styles.spinner} />
        <Text style={styles.loadingText}>Verificando autenticação...</Text>
      </View>
    );
  }

  // If not authenticated, redirect to auth screen
  if (!isAuthenticated) {
    console.log('🚫 User not authenticated, redirecting to auth screen...');
    
    // Use setTimeout to avoid navigation during render
    setTimeout(() => {
      router.replace('/auth');
    }, 100);
    
    return (
      <View style={styles.loadingContainer}>
        <Shield size={48} color="#D4AF37" />
        <Text style={styles.loadingText}>Redirecionando...</Text>
      </View>
    );
  }

  // User is authenticated, render children
  console.log('✅ User authenticated, rendering protected content...');
  return <>{children}</>;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    gap: 16,
  },
  spinner: {
    marginVertical: 8,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});