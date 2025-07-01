import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Character } from '@/types/database';
import { Spell } from '@/types/spell';
import { DnDClass } from '@/types/dndClass';
import { CharacterCard } from '@/components/CharacterCard';
import { CharacterDetailModal } from '@/components/CharacterDetailModal';
import { SpellSelectionModal } from '@/components/SpellSelectionModal';
import { supabase } from '@/lib/supabase';
import { 
  Shield, 
  User, 
  Plus, 
  RefreshCw, 
  Users, 
  UserPlus, 
  BookOpen 
} from 'lucide-react-native';
import { router, useFocusEffect } from 'expo-router';
import classesData from '@/data/classes.json';

export default function CharactersTab() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [spellSelectionCharacter, setSpellSelectionCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Auto-refresh when tab comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 Characters tab focused, refreshing data...');
      if (user) {
        loadCharacters();
      }
    }, [user])
  );

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    
    if (user) {
      loadCharacters();
    } else {
      setLoading(false);
    }
  };

  const loadCharacters = async () => {
    try {
      console.log('📚 Loading characters...');
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setLoading(false);
        return;
      }

      const response = await fetch('/api/characters', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const charactersData = await response.json();
        console.log('✅ Characters loaded:', charactersData.length);
        setCharacters(charactersData);
        
        // Update selected character if it exists in the new data
        if (selectedCharacter) {
          const updatedSelectedCharacter = charactersData.find(
            (char: Character) => char.id === selectedCharacter.id
          );
          if (updatedSelectedCharacter) {
            setSelectedCharacter(updatedSelectedCharacter);
          } else {
            // Character was deleted, close modal
            setSelectedCharacter(null);
          }
        }
      } else {
        console.error('❌ Failed to load characters');
      }
    } catch (error) {
      console.error('💥 Error loading characters:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered');
    setRefreshing(true);
    await loadCharacters();
  };

  const handleDeleteCharacter = async (characterId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const message = 'Você precisa estar autenticado para excluir personagens.';
        if (Platform.OS === 'web') {
          alert(`Erro: ${message}`);
        } else {
          Alert.alert('Erro', message);
        }
        return;
      }

      console.log('🗑️ Deleting character with ID:', characterId);

      const { error } = await supabase
  .from('characters')
  .delete()
  .eq('id', characterId)
  .eq('user_id', user.id); // opcional, depende da RLS

if (error) {
  console.error('❌ Erro ao deletar personagem:', error.message);
  Alert.alert('Erro', 'Não foi possível excluir o personagem.');
  return;
}

      if (response.ok) {
        console.log('✅ Character deleted successfully');
        
        // Immediately update local state
        setCharacters(prev => {
          const updated = prev.filter(char => char.id !== characterId);
          console.log('📊 Characters after deletion:', updated.length);
          return updated;
        });
        
        // Close modal if the deleted character was selected
        if (selectedCharacter?.id === characterId) {
          setSelectedCharacter(null);
        }
        
        // Close spell selection if the deleted character was selected
        if (spellSelectionCharacter?.id === characterId) {
          setSpellSelectionCharacter(null);
        }
        
        const message = 'Personagem excluído com sucesso!';
        if (Platform.OS === 'web') {
          alert(`Sucesso: ${message}`);
        } else {
          Alert.alert('Sucesso', message);
        }
        
        // Refresh data to ensure consistency
        await loadCharacters();
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to delete character:', errorText);
        
        const message = 'Não foi possível excluir o personagem. Tente novamente.';
        if (Platform.OS === 'web') {
          alert(`Erro: ${message}`);
        } else {
          Alert.alert('Erro', message);
        }
      }
    } catch (error) {
      console.error('💥 Error deleting character:', error);
      
      const message = 'Erro inesperado ao excluir personagem.';
      if (Platform.OS === 'web') {
        alert(`Erro: ${message}`);
      } else {
        Alert.alert('Erro', message);
      }
    }
  };

  const handleGenerateToken = async (characterId: string): Promise<{ share_token: string; expires_at: string }> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/characters/${characterId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to generate token');
      }

      const result = await response.json();
      
      // Update the character in our local state
      setCharacters(prev => prev.map(char => 
        char.id === characterId 
          ? { ...char, share_token: result.share_token, token_expires_at: result.expires_at }
          : char
      ));

      // Update selected character if it's the same one
      if (selectedCharacter?.id === characterId) {
        setSelectedCharacter(prev => prev ? {
          ...prev,
          share_token: result.share_token,
          token_expires_at: result.expires_at
        } : null);
      }

      return result;
    } catch (error) {
      console.error('Error generating token:', error);
      throw error;
    }
  };

  const handleRevokeToken = async (characterId: string): Promise<void> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }

      const response = await fetch(`/api/characters/${characterId}/share`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to revoke token');
      }

      // Update the character in our local state
      setCharacters(prev => prev.map(char => 
        char.id === characterId 
          ? { ...char, share_token: null, token_expires_at: null }
          : char
      ));

      // Update selected character if it's the same one
      if (selectedCharacter?.id === characterId) {
        setSelectedCharacter(prev => prev ? {
          ...prev,
          share_token: null,
          token_expires_at: null
        } : null);
      }
    } catch (error) {
      console.error('Error revoking token:', error);
      throw error;
    }
  };

  const handleAddSpellsToGrimoire = async (spells: Spell[]) => {
    if (!spellSelectionCharacter) {
      const message = 'Nenhum personagem selecionado.';
      if (Platform.OS === 'web') {
        alert(`Erro: ${message}`);
      } else {
        Alert.alert('Erro', message);
      }
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        const message = 'Você precisa estar autenticado.';
        if (Platform.OS === 'web') {
          alert(`Erro: ${message}`);
        } else {
          Alert.alert('Erro', message);
        }
        return;
      }

      // Get current spells known
      const currentSpells = spellSelectionCharacter.spells_known || [];
      
      // Convert current spells to consistent format
      const currentSpellNames = currentSpells.map((spell: any) => 
        typeof spell === 'string' ? spell : spell.name
      );

      // Filter out spells that are already known
      const newSpells = spells.filter(spell => 
        !currentSpellNames.includes(spell.name)
      );

      if (newSpells.length === 0) {
        const message = 'Todas as magias selecionadas já estão no grimório do personagem.';
        if (Platform.OS === 'web') {
          alert(`Aviso: ${message}`);
        } else {
          Alert.alert('Aviso', message);
        }
        return;
      }

      // Convert new spells to the format expected by the database
      const spellsToAdd = newSpells.map(spell => ({
        name: spell.name,
        level: spell.level
      }));

      // Combine current spells with new spells
      const updatedSpells = [...currentSpells, ...spellsToAdd];

      // Update character
      const response = await fetch(`/api/characters/${spellSelectionCharacter.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          spells_known: updatedSpells,
        }),
      });

      if (response.ok) {
        const updatedCharacter = await response.json();
        console.log('✅ Spells added successfully to character:', updatedCharacter.name);
        
        // Update local state immediately
        setCharacters(prev => prev.map(char => 
          char.id === spellSelectionCharacter.id ? updatedCharacter : char
        ));
        
        // Update selected character if it's the same one
        if (selectedCharacter?.id === spellSelectionCharacter.id) {
          setSelectedCharacter(updatedCharacter);
        }
        
        // Update spell selection character
        setSpellSelectionCharacter(updatedCharacter);
        
        const message = `${newSpells.length} magia(s) adicionada(s) ao grimório de ${spellSelectionCharacter.name}!`;
        if (Platform.OS === 'web') {
          alert(`Sucesso: ${message}`);
        } else {
          Alert.alert('Sucesso', message);
        }
        
        // Refresh data to ensure consistency
        await loadCharacters();
      } else {
        const errorText = await response.text();
        console.error('Error updating character:', errorText);
        
        const message = 'Não foi possível adicionar as magias ao grimório.';
        if (Platform.OS === 'web') {
          alert(`Erro: ${message}`);
        } else {
          Alert.alert('Erro', message);
        }
      }
    } catch (error) {
      console.error('Error adding spells to grimoire:', error);
      
      const message = 'Erro ao adicionar magias ao grimório.';
      if (Platform.OS === 'web') {
        alert(`Erro: ${message}`);
      } else {
        Alert.alert('Erro', message);
      }
    }
  };

  const openSpellSelection = (character: Character) => {
    console.log('📚 Opening spell selection for character:', character.name);
    setSpellSelectionCharacter(character);
  };

  const createSampleCharacter = async () => {
    console.log('🎯 createSampleCharacter called');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('📋 Session check:', session ? 'Session exists' : 'No session');
      
      if (!session) {
        console.log('❌ No session found');
        const message = 'Você precisa estar autenticado para criar personagens.';
        if (Platform.OS === 'web') {
          alert(`Erro: ${message}`);
        } else {
          Alert.alert('Erro', message);
        }
        return;
      }

      console.log('🏗️ Creating sample character...');
      const sampleCharacter = {
        name: 'Gandalf o Cinzento',
        class_name: 'Mago',
        level: 10,
        hp_current: 68,
        hp_max: 78,
        spell_slots: {
          1: [4, 4],
          2: [3, 3],
          3: [3, 3],
          4: [3, 3],
          5: [2, 2]
        },
        spells_known: [
          { name: 'Bola de Fogo', level: 3 },
          { name: 'Mísseis Mágicos', level: 1 },
          { name: 'Escudo', level: 1 },
          { name: 'Raio', level: 3 },
          { name: 'Voo', level: 3 }
        ],
        character_data: {
          race: 'Humano',
          background: 'Sábio',
          alignment: 'Neutro e Bom',
          stats: {
            strength: 10,
            dexterity: 13,
            constitution: 16,
            intelligence: 20,
            wisdom: 15,
            charisma: 16
          }
        }
      };

      console.log('📤 Making API request to /api/characters');
      const response = await fetch('/api/characters', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sampleCharacter),
      });

      console.log('📥 API Response status:', response.status);
      console.log('📥 API Response ok:', response.ok);

      if (response.ok) {
        const newCharacter = await response.json();
        console.log('✅ Character created successfully:', newCharacter.name);
        
        // Immediately add to local state
        setCharacters(prev => {
          const updated = [newCharacter, ...prev];
          console.log('📊 Characters after creation:', updated.length);
          return updated;
        });
        
        const message = 'Personagem de exemplo criado!';
        if (Platform.OS === 'web') {
          alert(`Sucesso: ${message}`);
        } else {
          Alert.alert('Sucesso', message);
        }
        
        // Refresh data to ensure consistency
        await loadCharacters();
      } else {
        const errorText = await response.text();
        console.log('❌ API Error response:', errorText);
        
        const message = 'Não foi possível criar o personagem.';
        if (Platform.OS === 'web') {
          alert(`Erro: ${message}`);
        } else {
          Alert.alert('Erro', message);
        }
      }
    } catch (error) {
      console.error('💥 Error creating character:', error);
      
      const message = 'Erro ao criar personagem.';
      if (Platform.OS === 'web') {
        alert(`Erro: ${message}`);
      } else {
        Alert.alert('Erro', message);
      }
    }
  };

  const navigateToClasses = () => {
    console.log('🎓 Navigating to classes...');
    try {
      router.push('/characters/classes');
    } catch (error) {
      console.error('💥 Error navigating to classes:', error);
      
      const message = 'Não foi possível navegar para a página de classes.';
      if (Platform.OS === 'web') {
        alert(`Erro: ${message}`);
      } else {
        Alert.alert('Erro', message);
      }
    }
  };

  const navigateToCreateCharacter = () => {
    console.log('🆕 navigateToCreateCharacter function called');
    console.log('🆕 Current router state:', router);
    
    try {
      console.log('🆕 Attempting to navigate to /characters/create');
      router.push('/characters/create');
      console.log('✅ Navigation command executed');
    } catch (error) {
      console.error('💥 Error navigating to create character:', error);
      
      const message = 'Não foi possível navegar para a criação de personagem.';
      if (Platform.OS === 'web') {
        alert(`Erro: ${message}`);
      } else {
        Alert.alert('Erro', message);
      }
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Shield size={48} color="#D4AF37" />
        <Text style={styles.loadingText}>Carregando personagens...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Shield size={28} color="#D4AF37" />
          <Text style={styles.title}>Personagens</Text>
        </View>
        <Text style={styles.subtitle}>
          Gerencie seus heróis e grimórios
        </Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.headerButton, refreshing && styles.headerButtonDisabled]}
            onPress={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw 
              size={20} 
              color={refreshing ? "#95A5A6" : "#D4AF37"} 
              style={refreshing ? styles.spinning : undefined}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => {
              console.log('➕ Sample character button pressed');
              createSampleCharacter();
            }}
          >
            <Plus size={20} color="#D4AF37" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={navigateToClasses}
          activeOpacity={0.7}
        >
          <Users size={24} color="#D4AF37" />
          <Text style={styles.navButtonText}>Ver Classes D&D</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, styles.createNavButton]}
          onPress={() => {
            console.log('🎯 Create character button pressed!');
            console.log('🎯 Button onPress triggered');
            navigateToCreateCharacter();
          }}
          activeOpacity={0.7}
        >
          <UserPlus size={24} color="#FFFFFF" />
          <Text style={[styles.navButtonText, styles.createNavButtonText]}>Criar Novo Personagem</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {characters.length > 0 ? (
          <View style={styles.charactersContainer}>
            {characters.map((character) => {
              const characterClass = classesData.find(cls => cls.name === character.class_name);
              const isSpellcaster = characterClass?.spellcasting;
              
              return (
                <View key={character.id} style={styles.characterCardWrapper}>
                  <CharacterCard
                    character={character}
                    onPress={() => setSelectedCharacter(character)}
                    onShare={() => setSelectedCharacter(character)}
                    onDelete={handleDeleteCharacter}
                  />
                  
                  {/* Botão para adicionar magias ao grimório */}
                  {isSpellcaster && (
                    <TouchableOpacity
                      style={styles.addSpellsButton}
                      onPress={() => {
                        console.log('📚 Add spells button pressed for character:', character.name);
                        openSpellSelection(character);
                      }}
                      activeOpacity={0.8}
                    >
                      <BookOpen size={16} color="#8E44AD" />
                      <Text style={styles.addSpellsButtonText}>Adicionar Magias ao Grimório</Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <User size={64} color="#D4AF37" />
            <Text style={styles.emptyTitle}>Nenhum Personagem</Text>
            <Text style={styles.emptyText}>
              Você ainda não possui personagens criados. Use o botão "Criar Novo Personagem" para começar sua aventura!
            </Text>
            
            <TouchableOpacity 
              style={styles.createButton}
              onPress={() => {
                console.log('🎯 Empty state create button pressed!');
                navigateToCreateCharacter();
              }}
              activeOpacity={0.7}
            >
              <UserPlus size={20} color="#FFFFFF" />
              <Text style={styles.createButtonText}>Criar Meu Primeiro Personagem</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <CharacterDetailModal
        character={selectedCharacter}
        visible={!!selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
        onGenerateToken={handleGenerateToken}
        onRevokeToken={handleRevokeToken}
        onDelete={handleDeleteCharacter}
      />

      <SpellSelectionModal
        visible={!!spellSelectionCharacter}
        onClose={() => setSpellSelectionCharacter(null)}
        characterClass={spellSelectionCharacter ? classesData.find(cls => cls.name === spellSelectionCharacter.class_name)! : {} as any}
        characterName={spellSelectionCharacter?.name || ''}
        onAddSpells={handleAddSpellsToGrimoire}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#D4AF37',
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
  subtitle: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    position: 'absolute',
    right: 20,
    top: 20,
    gap: 8,
  },
  headerButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  headerButtonDisabled: {
    backgroundColor: 'rgba(149, 165, 166, 0.1)',
  },
  spinning: {
    // Add rotation animation if needed
  },
  navigationContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    gap: 12,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 2,
    borderColor: '#D4AF37',
    gap: 12,
  },
  createNavButton: {
    backgroundColor: '#27AE60',
    borderColor: '#27AE60',
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  createNavButtonText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  charactersContainer: {
    paddingVertical: 8,
  },
  characterCardWrapper: {
    marginBottom: 8,
  },
  addSpellsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3E8FF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 16,
    marginTop: -8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E0B3FF',
    gap: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  addSpellsButtonText: {
    color: '#8E44AD',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginTop: 20,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27AE60',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});