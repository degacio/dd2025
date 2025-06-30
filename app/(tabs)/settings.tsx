import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Alert,
  Platform,
  Modal,
  Dimensions
} from 'react-native';
import { 
  Settings, 
  Upload, 
  FileText, 
  Download, 
  Trash2, 
  Info,
  BookOpen,
  Users,
  LogOut,
  User
} from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import { adaptSpellsFromLivroDoJogador } from '@/utils/spellAdapter';
import { supabase } from '@/lib/supabase';
import { router } from 'expo-router';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function SettingsTab() {
  const [spellsFileLoaded, setSpellsFileLoaded] = useState(false);
  const [classesFileLoaded, setClassesFileLoaded] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    console.log('🔄 SettingsTab mounted, getting user info...');
    getUserInfo();
  }, []);

  const getUserInfo = async () => {
    try {
      console.log('🔍 Getting user info from Supabase...');
      const { data: { user } } = await supabase.auth.getUser();
      console.log('👤 User data received:', user ? `${user.email} (${user.id})` : 'No user');
      if (user) {
        setUserEmail(user.email);
        console.log('✅ User email set to state:', user.email);
      } else {
        console.log('❌ No user found');
      }
    } catch (error) {
      console.error('💥 Error getting user info:', error);
    }
  };

  const handleLogout = async () => {
    console.log('🎯 handleLogout function called');
    console.log('📊 Current state - isLoggingOut:', isLoggingOut, 'userEmail:', userEmail);
    
    try {
      console.log('🔔 Showing logout confirmation...');
      
      if (Platform.OS === 'web') {
        // Use custom modal for web
        console.log('🌐 Using custom modal for web platform');
        setShowLogoutModal(true);
      } else {
        // Use native Alert for mobile
        console.log('📱 Using native Alert for mobile platform');
        Alert.alert(
          'Sair da Conta',
          'Tem certeza que deseja sair? Você precisará fazer login novamente para acessar seus personagens.',
          [
            { 
              text: 'Cancelar', 
              style: 'cancel',
              onPress: () => {
                console.log('❌ User cancelled logout');
              }
            },
            {
              text: 'Sair',
              style: 'destructive',
              onPress: () => {
                console.log('✅ User confirmed logout, calling performLogout...');
                performLogout();
              }
            }
          ]
        );
      }
      
      console.log('📱 Logout confirmation shown successfully');
    } catch (error) {
      console.error('💥 Error showing logout confirmation:', error);
    }
  };

  const confirmLogout = () => {
    console.log('✅ User confirmed logout from modal, calling performLogout...');
    setShowLogoutModal(false);
    performLogout();
  };

  const cancelLogout = () => {
    console.log('❌ User cancelled logout from modal');
    setShowLogoutModal(false);
  };

  const performLogout = async () => {
    console.log('🚀 performLogout function started');
    
    if (isLoggingOut) {
      console.log('⚠️ Already logging out, preventing duplicate call');
      return;
    }
    
    setIsLoggingOut(true);
    console.log('🔄 Set isLoggingOut to true');
    
    try {
      console.log('🧹 Starting logout process...');
      
      // Clear any local storage data if on web
      if (Platform.OS === 'web') {
        try {
          console.log('🌐 Platform is web, clearing localStorage...');
          const itemsCleared = [];
          
          // Log what's in localStorage before clearing
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key) {
              itemsCleared.push(key);
            }
          }
          console.log('📦 Items in localStorage before clear:', itemsCleared);
          
          localStorage.clear();
          console.log('✅ localStorage cleared successfully');
        } catch (error) {
          console.warn('⚠️ Could not clear localStorage:', error);
        }
      } else {
        console.log('📱 Platform is not web, skipping localStorage clear');
      }

      // Sign out from Supabase
      console.log('🔐 Signing out from Supabase...');
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Supabase logout error:', error);
        console.error('❌ Error details:', {
          message: error.message,
          status: error.status,
          statusCode: error.statusCode
        });
        
        if (Platform.OS === 'web') {
          alert(`Erro: Não foi possível sair da conta: ${error.message}`);
        } else {
          Alert.alert('Erro', `Não foi possível sair da conta: ${error.message}`);
        }
        return;
      }

      console.log('✅ Supabase logout successful');
      
      // Clear user state immediately
      console.log('🧹 Clearing user state...');
      setUserEmail(null);
      console.log('✅ User email cleared from state');
      
      // Force navigation to auth screen
      console.log('🔄 Redirecting to auth screen...');
      
      try {
        // Use router.replace to prevent going back to authenticated area
        console.log('🧭 Calling router.replace("/auth")...');
        router.replace('/auth');
        console.log('✅ Router.replace called successfully');
        
        // Show success message after navigation
        setTimeout(() => {
          console.log('🎉 Showing success message...');
          if (Platform.OS === 'web') {
            alert('Logout Realizado: Você foi desconectado com sucesso.');
          } else {
            Alert.alert(
              'Logout Realizado',
              'Você foi desconectado com sucesso.'
            );
          }
        }, 100);
        
      } catch (routerError) {
        console.error('💥 Router error:', routerError);
        if (Platform.OS === 'web') {
          alert('Erro: Erro ao redirecionar. Recarregue a página.');
        } else {
          Alert.alert('Erro', 'Erro ao redirecionar. Recarregue a página.');
        }
      }
      
    } catch (error) {
      console.error('💥 Logout error:', error);
      console.error('💥 Error stack:', error.stack);
      
      if (Platform.OS === 'web') {
        alert(`Erro: Erro inesperado ao sair da conta: ${error.message}`);
      } else {
        Alert.alert('Erro', `Erro inesperado ao sair da conta: ${error.message}`);
      }
    } finally {
      console.log('🔄 Setting isLoggingOut to false');
      setIsLoggingOut(false);
    }
  };

  const pickSpellsFile = async () => {
    try {
      if (Platform.OS === 'web') {
        // For web, we can try to use the built-in file picker
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        
        input.onchange = async (e) => {
          // @ts-ignore
          const file = e.target.files[0];
          if (!file) return;
          
          try {
            const text = await file.text();
            const jsonData = JSON.parse(text);
            
            // Use the adapter to convert the data
            const adaptedSpells = adaptSpellsFromLivroDoJogador(jsonData);
            
            if (adaptedSpells.length > 0) {
              // Store the adapted spells in localStorage for web
              localStorage.setItem('customSpells', JSON.stringify(adaptedSpells));
              setSpellsFileLoaded(true);
              alert(`Sucesso: Arquivo de magias carregado com sucesso! ${adaptedSpells.length} magias importadas.`);
            } else {
              alert('Erro: Não foi possível processar o arquivo de magias.');
            }
          } catch (error) {
            console.error('Error processing JSON file:', error);
            alert('Erro: O arquivo não está em um formato JSON válido.');
          }
        };
        
        input.click();
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        try {
          // For native platforms, we need to read the file
          const response = await fetch(asset.uri);
          const text = await response.text();
          const jsonData = JSON.parse(text);
          
          // Use the adapter to convert the data
          const adaptedSpells = adaptSpellsFromLivroDoJogador(jsonData);
          
          if (adaptedSpells.length > 0) {
            // Here you would store the spells in AsyncStorage for native platforms
            // AsyncStorage.setItem('customSpells', JSON.stringify(adaptedSpells));
            setSpellsFileLoaded(true);
            Alert.alert('Sucesso', `Arquivo de magias carregado com sucesso! ${adaptedSpells.length} magias importadas.`);
          } else {
            Alert.alert('Erro', 'Não foi possível processar o arquivo de magias.');
          }
        } catch (error) {
          console.error('Error processing JSON file:', error);
          Alert.alert('Erro', 'O arquivo não está em um formato JSON válido.');
        }
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o arquivo de magias.');
    }
  };

  const pickClassesFile = async () => {
    try {
      if (Platform.OS === 'web') {
        alert('Funcionalidade Web: No navegador, você pode editar diretamente os arquivos JSON na pasta /data do projeto.');
        return;
      }

      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Aqui você implementaria a lógica para processar o arquivo JSON
        setClassesFileLoaded(true);
        Alert.alert('Sucesso', 'Arquivo de classes carregado com sucesso!');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar o arquivo de classes.');
    }
  };

  const exportData = () => {
    if (Platform.OS === 'web') {
      alert('Exportar Dados: Esta funcionalidade permitirá exportar seus dados personalizados.');
    } else {
      Alert.alert(
        'Exportar Dados',
        'Esta funcionalidade permitirá exportar seus dados personalizados.',
        [{ text: 'OK' }]
      );
    }
  };

  const clearData = () => {
    const performClear = () => {
      // Clear localStorage on web or AsyncStorage on native
      if (Platform.OS === 'web') {
        localStorage.removeItem('customSpells');
      } else {
        // AsyncStorage.removeItem('customSpells');
      }
      setSpellsFileLoaded(false);
      setClassesFileLoaded(false);
      
      if (Platform.OS === 'web') {
        alert('Dados Limpos: Todos os dados personalizados foram removidos.');
      } else {
        Alert.alert('Dados Limpos', 'Todos os dados personalizados foram removidos.');
      }
    };

    if (Platform.OS === 'web') {
      if (confirm('Limpar Dados: Tem certeza que deseja limpar todos os dados personalizados? Esta ação não pode ser desfeita.')) {
        performClear();
      }
    } else {
      Alert.alert(
        'Limpar Dados',
        'Tem certeza que deseja limpar todos os dados personalizados? Esta ação não pode ser desfeita.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Limpar', 
            style: 'destructive',
            onPress: performClear
          }
        ]
      );
    }
  };

  const showInfo = () => {
    if (Platform.OS === 'web') {
      alert('Sobre os Arquivos JSON: Os arquivos JSON devem seguir a estrutura específica do aplicativo:\n\n• Magias: Devem conter campos como name, school, level, description, etc.\n• Classes: Devem conter informações como hitDie, primaryAbility, classFeatures, etc.\n\nO aplicativo suporta a importação do formato "Livro do Jogador" e fará a conversão automaticamente para o formato interno.');
    } else {
      Alert.alert(
        'Sobre os Arquivos JSON',
        'Os arquivos JSON devem seguir a estrutura específica do aplicativo:\n\n' +
        '• Magias: Devem conter campos como name, school, level, description, etc.\n' +
        '• Classes: Devem conter informações como hitDie, primaryAbility, classFeatures, etc.\n\n' +
        'O aplicativo suporta a importação do formato "Livro do Jogador" e fará a conversão automaticamente para o formato interno.'
      );
    }
  };

  // Determine if we're on a small screen
  const isSmallScreen = dimensions.width < 768;
  const isVerySmallScreen = dimensions.width < 480;

  console.log('🎨 Rendering SettingsTab with state:', {
    userEmail,
    isLoggingOut,
    spellsFileLoaded,
    classesFileLoaded,
    showLogoutModal,
    screenDimensions: dimensions,
    isSmallScreen,
    isVerySmallScreen
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, isVerySmallScreen && styles.headerCompact]}>
        <View style={styles.titleContainer}>
          <Settings size={isVerySmallScreen ? 24 : 28} color="#D4AF37" />
          <Text style={[styles.title, isVerySmallScreen && styles.titleSmall]}>Configurações</Text>
        </View>
        <Text style={[styles.subtitle, isVerySmallScreen && styles.subtitleSmall]}>
          Gerencie seus dados personalizados
        </Text>
      </View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 } // Extra padding to ensure all content is accessible
        ]}
      >
        {/* Seção de Conta */}
        <View style={[styles.section, isSmallScreen && styles.sectionCompact]}>
          <Text style={[styles.sectionTitle, isVerySmallScreen && styles.sectionTitleSmall]}>Conta</Text>
          
          <View style={styles.accountCard}>
            <View style={[styles.accountHeader, isVerySmallScreen && styles.accountHeaderCompact]}>
              <User size={isVerySmallScreen ? 20 : 24} color="#27AE60" />
              <View style={styles.accountInfo}>
                <Text style={[styles.accountLabel, isVerySmallScreen && styles.accountLabelSmall]}>Usuário logado</Text>
                <Text style={[styles.accountEmail, isVerySmallScreen && styles.accountEmailSmall]} numberOfLines={1}>
                  {userEmail || 'Carregando...'}
                </Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.logoutButton, 
                isLoggingOut && styles.logoutButtonDisabled,
                isVerySmallScreen && styles.logoutButtonCompact
              ]} 
              onPress={() => {
                console.log('🎯 Logout button pressed!');
                console.log('📊 Button state - disabled:', isLoggingOut);
                if (!isLoggingOut) {
                  console.log('✅ Button not disabled, calling handleLogout...');
                  handleLogout();
                } else {
                  console.log('⚠️ Button is disabled, ignoring press');
                }
              }}
              disabled={isLoggingOut}
              activeOpacity={0.7}
            >
              <LogOut size={isVerySmallScreen ? 14 : 16} color={isLoggingOut ? "#BDC3C7" : "#E74C3C"} />
              <Text style={[
                styles.logoutButtonText, 
                isLoggingOut && styles.logoutButtonTextDisabled,
                isVerySmallScreen && styles.logoutButtonTextSmall
              ]}>
                {isLoggingOut ? 'Saindo...' : 'Sair da Conta'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Seção de Arquivos */}
        <View style={[styles.section, isSmallScreen && styles.sectionCompact]}>
          <Text style={[styles.sectionTitle, isVerySmallScreen && styles.sectionTitleSmall]}>Gerenciar Arquivos</Text>
          
          {/* Magias */}
          <View style={styles.fileCard}>
            <View style={[styles.fileHeader, isVerySmallScreen && styles.fileHeaderCompact]}>
              <BookOpen size={isVerySmallScreen ? 20 : 24} color="#8E44AD" />
              <View style={styles.fileInfo}>
                <Text style={[styles.fileName, isVerySmallScreen && styles.fileNameSmall]}>Arquivo de Magias</Text>
                <Text style={[styles.fileStatus, isVerySmallScreen && styles.fileStatusSmall]}>
                  {spellsFileLoaded ? 'Arquivo personalizado carregado' : 'Usando arquivo padrão'}
                </Text>
              </View>
            </View>
            
            <View style={styles.fileActions}>
              <TouchableOpacity 
                style={[styles.actionButton, isVerySmallScreen && styles.actionButtonCompact]} 
                onPress={pickSpellsFile}
              >
                <Upload size={isVerySmallScreen ? 14 : 16} color="#FFFFFF" />
                <Text style={[styles.actionButtonText, isVerySmallScreen && styles.actionButtonTextSmall]}>
                  Carregar
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Classes */}
          <View style={styles.fileCard}>
            <View style={[styles.fileHeader, isVerySmallScreen && styles.fileHeaderCompact]}>
              <Users size={isVerySmallScreen ? 20 : 24} color="#E74C3C" />
              <View style={styles.fileInfo}>
                <Text style={[styles.fileName, isVerySmallScreen && styles.fileNameSmall]}>Arquivo de Classes</Text>
                <Text style={[styles.fileStatus, isVerySmallScreen && styles.fileStatusSmall]}>
                  {classesFileLoaded ? 'Arquivo personalizado carregado' : 'Usando arquivo padrão'}
                </Text>
              </View>
            </View>
            
            <View style={styles.fileActions}>
              <TouchableOpacity 
                style={[styles.actionButton, isVerySmallScreen && styles.actionButtonCompact]} 
                onPress={pickClassesFile}
              >
                <Upload size={isVerySmallScreen ? 14 : 16} color="#FFFFFF" />
                <Text style={[styles.actionButtonText, isVerySmallScreen && styles.actionButtonTextSmall]}>
                  Carregar
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Seção de Ações */}
        <View style={[styles.section, isSmallScreen && styles.sectionCompact]}>
          <Text style={[styles.sectionTitle, isVerySmallScreen && styles.sectionTitleSmall]}>Ações</Text>
          
          <TouchableOpacity 
            style={[styles.menuItem, isVerySmallScreen && styles.menuItemCompact]} 
            onPress={exportData}
          >
            <Download size={isVerySmallScreen ? 18 : 20} color="#27AE60" />
            <Text style={[styles.menuItemText, isVerySmallScreen && styles.menuItemTextSmall]}>
              Exportar Dados
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, isVerySmallScreen && styles.menuItemCompact]} 
            onPress={clearData}
          >
            <Trash2 size={isVerySmallScreen ? 18 : 20} color="#E74C3C" />
            <Text style={[styles.menuItemText, isVerySmallScreen && styles.menuItemTextSmall]}>
              Limpar Dados Personalizados
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, isVerySmallScreen && styles.menuItemCompact]} 
            onPress={showInfo}
          >
            <Info size={isVerySmallScreen ? 18 : 20} color="#3498DB" />
            <Text style={[styles.menuItemText, isVerySmallScreen && styles.menuItemTextSmall]}>
              Sobre Arquivos JSON
            </Text>
          </TouchableOpacity>
        </View>

        {/* Seção de Informações */}
        <View style={[styles.section, isSmallScreen && styles.sectionCompact]}>
          <Text style={[styles.sectionTitle, isVerySmallScreen && styles.sectionTitleSmall]}>Informações</Text>
          
          <View style={[styles.infoCard, isVerySmallScreen && styles.infoCardCompact]}>
            <FileText size={isVerySmallScreen ? 18 : 20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, isVerySmallScreen && styles.infoTitleSmall]}>
                Formato dos Arquivos
              </Text>
              <Text style={[styles.infoDescription, isVerySmallScreen && styles.infoDescriptionSmall]}>
                Os arquivos devem estar no formato JSON e seguir a estrutura específica do aplicativo.
              </Text>
            </View>
          </View>

          <View style={[styles.infoCard, isVerySmallScreen && styles.infoCardCompact]}>
            <Upload size={isVerySmallScreen ? 18 : 20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={[styles.infoTitle, isVerySmallScreen && styles.infoTitleSmall]}>
                Como Usar
              </Text>
              <Text style={[styles.infoDescription, isVerySmallScreen && styles.infoDescriptionSmall]}>
                Toque em "Carregar" para selecionar um arquivo JSON do seu dispositivo. O arquivo será validado antes de ser aplicado.
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Custom Logout Modal for Web */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={cancelLogout}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContainer,
            isSmallScreen && styles.modalContainerSmall,
            isVerySmallScreen && styles.modalContainerVerySmall
          ]}>
            <View style={styles.modalHeader}>
              <LogOut size={isVerySmallScreen ? 20 : 24} color="#E74C3C" />
              <Text style={[styles.modalTitle, isVerySmallScreen && styles.modalTitleSmall]}>
                Sair da Conta
              </Text>
            </View>
            
            <Text style={[styles.modalMessage, isVerySmallScreen && styles.modalMessageSmall]}>
              Tem certeza que deseja sair? Você precisará fazer login novamente para acessar seus personagens.
            </Text>
            
            <View style={[styles.modalButtons, isVerySmallScreen && styles.modalButtonsCompact]}>
              <TouchableOpacity 
                style={[
                  styles.modalButton, 
                  styles.cancelButton,
                  isVerySmallScreen && styles.modalButtonCompact
                ]} 
                onPress={cancelLogout}
                activeOpacity={0.8}
              >
                <Text style={[styles.cancelButtonText, isVerySmallScreen && styles.cancelButtonTextSmall]}>
                  Cancelar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[
                  styles.modalButton, 
                  styles.confirmButton,
                  isVerySmallScreen && styles.modalButtonCompact
                ]} 
                onPress={confirmLogout}
                activeOpacity={0.8}
              >
                <Text style={[styles.confirmButtonText, isVerySmallScreen && styles.confirmButtonTextSmall]}>
                  Sair
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#D4AF37',
  },
  headerCompact: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  titleSmall: {
    fontSize: 20,
    marginLeft: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '500',
  },
  subtitleSmall: {
    fontSize: 12,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  section: {
    margin: 16,
    marginBottom: 24,
  },
  sectionCompact: {
    margin: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  sectionTitleSmall: {
    fontSize: 16,
    marginBottom: 12,
  },
  accountCard: {
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
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  accountHeaderCompact: {
    marginBottom: 12,
  },
  accountInfo: {
    flex: 1,
    marginLeft: 12,
  },
  accountLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  accountLabelSmall: {
    fontSize: 12,
  },
  accountEmail: {
    fontSize: 14,
    color: '#666',
  },
  accountEmailSmall: {
    fontSize: 12,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 8,
    minHeight: 44, // Ensure minimum touch target
  },
  logoutButtonCompact: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  logoutButtonDisabled: {
    backgroundColor: '#F5F5F5',
    borderColor: '#E8E8E8',
  },
  logoutButtonText: {
    color: '#E74C3C',
    fontSize: 14,
    fontWeight: '600',
  },
  logoutButtonTextSmall: {
    fontSize: 12,
  },
  logoutButtonTextDisabled: {
    color: '#BDC3C7',
  },
  fileCard: {
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
  fileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  fileHeaderCompact: {
    marginBottom: 10,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  fileNameSmall: {
    fontSize: 14,
  },
  fileStatus: {
    fontSize: 12,
    color: '#666',
  },
  fileStatusSmall: {
    fontSize: 11,
  },
  fileActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3498DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 36,
  },
  actionButtonCompact: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    minHeight: 32,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  actionButtonTextSmall: {
    fontSize: 12,
    marginLeft: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    minHeight: 56,
  },
  menuItemCompact: {
    padding: 12,
    marginBottom: 6,
    minHeight: 48,
  },
  menuItemText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 12,
    fontWeight: '500',
    flexShrink: 1,
  },
  menuItemTextSmall: {
    fontSize: 14,
    marginLeft: 10,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  infoCardCompact: {
    padding: 12,
    marginBottom: 6,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoTitleSmall: {
    fontSize: 12,
    marginBottom: 3,
  },
  infoDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  infoDescriptionSmall: {
    fontSize: 11,
    lineHeight: 14,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
  },
  modalContainerSmall: {
    padding: 20,
    maxWidth: 350,
  },
  modalContainerVerySmall: {
    padding: 16,
    maxWidth: 300,
    margin: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  modalTitleSmall: {
    fontSize: 18,
  },
  modalMessage: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalMessageSmall: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonsCompact: {
    gap: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 44,
  },
  modalButtonCompact: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 40,
  },
  cancelButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  confirmButton: {
    backgroundColor: '#E74C3C',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  cancelButtonTextSmall: {
    fontSize: 14,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confirmButtonTextSmall: {
    fontSize: 14,
  },
});