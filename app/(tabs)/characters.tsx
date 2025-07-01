import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, Alert, Platform } from 'react-native';
import { Character } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { CharacterCard } from '@/components/CharacterCard';
import { CharacterDetailModal } from '@/components/CharacterDetailModal';
import { SpellSelectionModal } from '@/components/SpellSelectionModal';
import { router, useFocusEffect } from 'expo-router';
import classesData from '@/data/classes.json';
import { Shield, User, Plus, RefreshCw, Users, UserPlus, BookOpen } from 'lucide-react-native';

export default function CharactersTab() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [spellSelectionCharacter, setSpellSelectionCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);

  useFocusEffect(
    useCallback(() => {
      if (user) loadCharacters();
    }, [user])
  );

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) loadCharacters();
    else setLoading(false);
  };

  const loadCharacters = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return setLoading(false);

      const response = await fetch('/api/characters', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        console.error('❌ Falha ao carregar personagens');
        return;
      }

      const charactersData = await response.json();
      setCharacters(charactersData);

      if (selectedCharacter) {
        const updated = charactersData.find(char => char.id === selectedCharacter.id);
        setSelectedCharacter(updated || null);
      }
    } catch (error) {
      console.error('💥 Erro ao carregar personagens:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDeleteCharacter = async (characterId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !user) {
        const msg = 'Você precisa estar autenticado para excluir personagens.';
        Platform.OS === 'web' ? alert(`Erro: ${msg}`) : Alert.alert('Erro', msg);
        return;
      }

      const { error } = await supabase
        .from('characters')
        .delete()
        .eq('id', characterId)
        .eq('user_id', user.id);

      if (error) {
        console.error('❌ Erro ao deletar personagem:', error.message);
        const msg = 'Não foi possível excluir o personagem.';
        Platform.OS === 'web' ? alert(`Erro: ${msg}`) : Alert.alert('Erro', msg);
        return;
      }

      setCharacters(prev => prev.filter(c => c.id !== characterId));
      if (selectedCharacter?.id === characterId) setSelectedCharacter(null);
      if (spellSelectionCharacter?.id === characterId) setSpellSelectionCharacter(null);

      const msg = 'Personagem excluído com sucesso!';
      Platform.OS === 'web' ? alert(`Sucesso: ${msg}`) : Alert.alert('Sucesso', msg);

      await loadCharacters();
    } catch (error) {
      console.error('💥 Erro inesperado ao excluir personagem:', error);
      const msg = 'Erro inesperado ao excluir personagem.';
      Platform.OS === 'web' ? alert(`Erro: ${msg}`) : Alert.alert('Erro', msg);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCharacters();
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
        <Text style={styles.subtitle}>Gerencie seus heróis e grimórios</Text>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleRefresh} style={styles.headerButton}>
            <RefreshCw size={20} color="#D4AF37" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Plus size={20} color="#D4AF37" />
          </TouchableOpacity>
        </View>
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
                  {isSpellcaster && (
                    <TouchableOpacity style={styles.addSpellsButton}>
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
            <Text style={styles.emptyText}>Use o botão \"Criar Novo Personagem\" para começar sua aventura!</Text>
          </View>
        )}
      </ScrollView>

      <CharacterDetailModal
        character={selectedCharacter}
        visible={!!selectedCharacter}
        onClose={() => setSelectedCharacter(null)}
        onDelete={handleDeleteCharacter}
      />

      <SpellSelectionModal
        visible={!!spellSelectionCharacter}
        onClose={() => setSpellSelectionCharacter(null)}
        characterClass={spellSelectionCharacter ? classesData.find(cls => cls.name === spellSelectionCharacter.class_name)! : {} as any}
        characterName={spellSelectionCharacter?.name || ''}
        onAddSpells={() => {}}
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