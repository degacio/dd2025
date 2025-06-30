import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Character } from '@/types/database';
import { Spell } from '@/types/spell';
import { DnDClass } from '@/types/dndClass';
import { supabase } from '@/lib/supabase';
import { 
  Scroll, 
  User, 
  RefreshCw, 
  Sparkles, 
  Zap, 
  X,
  ChevronRight,
  Star,
  Circle,
  Minus,
  Plus
} from 'lucide-react-native';
import classesData from '@/data/classes.json';

interface SpellSlotInfo {
  current: number;
  max: number;
  level: number;
}

interface CharacterSpells {
  character: Character;
  spells: Spell[];
  spellsByLevel: Record<number, Spell[]>;
  spellSlots: SpellSlotInfo[];
  characterClass: DnDClass | null;
}

export default function GrimoireTab() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState<CharacterSpells | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [allSpells, setAllSpells] = useState<Spell[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load spells data
      const spellsData = require('@/data/spells.json');
      setAllSpells(spellsData);

      // Load characters
      await loadCharacters();
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadCharacters = async () => {
    try {
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
        // Filter only spellcasting characters
        const spellcasters = charactersData.filter((char: Character) => {
          const characterClass = classesData.find(cls => cls.name === char.class_name);
          return characterClass?.spellcasting;
        });
        setCharacters(spellcasters);
      }
    } catch (error) {
      console.error('Error loading characters:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const getSpellByName = (spellName: string): Spell | null => {
    return allSpells.find(spell => spell.name === spellName) || null;
  };

  const prepareCharacterSpells = (character: Character): CharacterSpells => {
    const characterClass = classesData.find(cls => cls.name === character.class_name) || null;
    
    // Get character's known spells
    const knownSpellNames = character.spells_known || [];
    const spells: Spell[] = [];
    
    knownSpellNames.forEach((spellData: any) => {
      const spellName = typeof spellData === 'string' ? spellData : spellData.name;
      const spell = getSpellByName(spellName);
      if (spell) {
        spells.push(spell);
      }
    });

    // Group spells by level
    const spellsByLevel: Record<number, Spell[]> = {};
    spells.forEach(spell => {
      if (!spellsByLevel[spell.level]) {
        spellsByLevel[spell.level] = [];
      }
      spellsByLevel[spell.level].push(spell);
    });

    // Sort spells within each level
    Object.keys(spellsByLevel).forEach(level => {
      spellsByLevel[parseInt(level)].sort((a, b) => a.name.localeCompare(b.name));
    });

    // Get spell slots information
    const spellSlots: SpellSlotInfo[] = [];
    if (character.spell_slots && typeof character.spell_slots === 'object') {
      Object.entries(character.spell_slots).forEach(([level, slots]) => {
        if (Array.isArray(slots) && slots.length >= 2) {
          spellSlots.push({
            level: parseInt(level),
            current: slots[0],
            max: slots[1]
          });
        }
      });
    }

    // Sort spell slots by level
    spellSlots.sort((a, b) => a.level - b.level);

    return {
      character,
      spells,
      spellsByLevel,
      spellSlots,
      characterClass
    };
  };

  const handleCharacterPress = (character: Character) => {
    const characterSpells = prepareCharacterSpells(character);
    setSelectedCharacter(characterSpells);
  };

  const updateSpellSlot = async (level: number, type: 'current' | 'max', delta: number) => {
    if (!selectedCharacter) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        Alert.alert('Erro', 'Você precisa estar autenticado.');
        return;
      }

      const currentSlots = { ...selectedCharacter.character.spell_slots };
      const levelKey = level.toString();
      
      if (currentSlots[levelKey] && Array.isArray(currentSlots[levelKey])) {
        const slots = [...currentSlots[levelKey]];
        
        if (type === 'current') {
          slots[0] = Math.max(0, Math.min(slots[1], slots[0] + delta));
        } else {
          slots[1] = Math.max(0, slots[1] + delta);
          slots[0] = Math.min(slots[0], slots[1]); // Adjust current if it exceeds new max
        }
        
        currentSlots[levelKey] = slots;

        // Update character
        const response = await fetch(`/api/characters/${selectedCharacter.character.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            spell_slots: currentSlots,
          }),
        });

        if (response.ok) {
          const updatedCharacter = await response.json();
          
          // Update local state
          setCharacters(prev => prev.map(char => 
            char.id === selectedCharacter.character.id ? updatedCharacter : char
          ));
          
          // Update selected character
          const updatedCharacterSpells = prepareCharacterSpells(updatedCharacter);
          setSelectedCharacter(updatedCharacterSpells);
        } else {
          Alert.alert('Erro', 'Não foi possível atualizar os espaços de magia.');
        }
      }
    } catch (error) {
      console.error('Error updating spell slot:', error);
      Alert.alert('Erro', 'Erro ao atualizar espaços de magia.');
    }
  };

  const getSpellLevelName = (level: number): string => {
    if (level === 0) return 'Truques';
    return `${level}º Círculo`;
  };

  const getSpellLevelColor = (level: number): string => {
    const colors = [
      '#8E44AD', // Truques - Roxo
      '#3498DB', // 1º - Azul
      '#27AE60', // 2º - Verde
      '#F39C12', // 3º - Laranja
      '#E74C3C', // 4º - Vermelho
      '#9B59B6', // 5º - Roxo claro
      '#1ABC9C', // 6º - Turquesa
      '#34495E', // 7º - Azul escuro
      '#E67E22', // 8º - Laranja escuro
      '#8B4513', // 9º - Marrom
    ];
    return colors[level] || '#666';
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Scroll size={48} color="#D4AF37" />
        <Text style={styles.loadingText}>Carregando grimórios...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Scroll size={28} color="#D4AF37" />
          <Text style={styles.title}>Grimório</Text>
        </View>
        <Text style={styles.subtitle}>
          Magias dos seus personagens
        </Text>
        
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw size={20} color="#D4AF37" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {characters.length > 0 ? (
          <View style={styles.charactersContainer}>
            {characters.map((character) => {
              const characterClass = classesData.find(cls => cls.name === character.class_name);
              const spellCount = character.spells_known ? character.spells_known.length : 0;
              const totalSlots = Object.values(character.spell_slots || {}).reduce((total: number, slots: any) => {
                return total + (Array.isArray(slots) ? slots[1] : 0);
              }, 0);
              
              return (
                <TouchableOpacity
                  key={character.id}
                  style={styles.characterCard}
                  onPress={() => handleCharacterPress(character)}
                  activeOpacity={0.8}
                >
                  <View style={styles.characterHeader}>
                    <View style={styles.characterInfo}>
                      <User size={24} color="#D4AF37" />
                      <View style={styles.characterDetails}>
                        <Text style={styles.characterName}>{character.name}</Text>
                        <Text style={styles.characterClass}>
                          {character.class_name} • Nível {character.level}
                        </Text>
                      </View>
                    </View>
                    <ChevronRight size={20} color="#666" />
                  </View>

                  <View style={styles.characterStats}>
                    <View style={styles.statItem}>
                      <Sparkles size={16} color="#8E44AD" />
                      <Text style={styles.statLabel}>Magias</Text>
                      <Text style={styles.statValue}>{spellCount}</Text>
                    </View>
                    
                    {totalSlots > 0 && (
                      <View style={styles.statItem}>
                        <Zap size={16} color="#E74C3C" />
                        <Text style={styles.statLabel}>Espaços</Text>
                        <Text style={styles.statValue}>{totalSlots}</Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Scroll size={64} color="#D4AF37" />
            <Text style={styles.emptyTitle}>Nenhum Conjurador</Text>
            <Text style={styles.emptyText}>
              Você não possui personagens conjuradores. Apenas classes que podem lançar magias aparecem no grimório.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Character Spells Modal */}
      <Modal
        visible={!!selectedCharacter}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedCharacter(null)}
      >
        {selectedCharacter && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleSection}>
                <Text style={styles.modalTitle}>{selectedCharacter.character.name}</Text>
                <Text style={styles.modalSubtitle}>
                  {selectedCharacter.character.class_name} • Nível {selectedCharacter.character.level}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setSelectedCharacter(null)}
              >
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              {/* Spell Slots Section */}
              {selectedCharacter.spellSlots.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Zap size={20} color="#E74C3C" />
                    <Text style={styles.sectionTitle}>Espaços de Magia</Text>
                  </View>

                  <View style={styles.spellSlotsGrid}>
                    {selectedCharacter.spellSlots.map((slotInfo) => (
                      <View key={slotInfo.level} style={styles.spellSlotCard}>
                        <Text style={styles.spellSlotLevel}>
                          {getSpellLevelName(slotInfo.level)}
                        </Text>
                        
                        <View style={styles.spellSlotControls}>
                          <View style={styles.spellSlotRow}>
                            <Text style={styles.spellSlotLabel}>Atual:</Text>
                            <View style={styles.slotAdjustControls}>
                              <TouchableOpacity
                                style={styles.slotButton}
                                onPress={() => updateSpellSlot(slotInfo.level, 'current', -1)}
                              >
                                <Minus size={12} color="#666" />
                              </TouchableOpacity>
                              <Text style={styles.slotValue}>{slotInfo.current}</Text>
                              <TouchableOpacity
                                style={styles.slotButton}
                                onPress={() => updateSpellSlot(slotInfo.level, 'current', 1)}
                              >
                                <Plus size={12} color="#666" />
                              </TouchableOpacity>
                            </View>
                          </View>
                          
                          <View style={styles.spellSlotRow}>
                            <Text style={styles.spellSlotLabel}>Máximo:</Text>
                            <View style={styles.slotAdjustControls}>
                              <TouchableOpacity
                                style={styles.slotButton}
                                onPress={() => updateSpellSlot(slotInfo.level, 'max', -1)}
                              >
                                <Minus size={12} color="#666" />
                              </TouchableOpacity>
                              <Text style={styles.slotValue}>{slotInfo.max}</Text>
                              <TouchableOpacity
                                style={styles.slotButton}
                                onPress={() => updateSpellSlot(slotInfo.level, 'max', 1)}
                              >
                                <Plus size={12} color="#666" />
                              </TouchableOpacity>
                            </View>
                          </View>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Spells by Level */}
              {Object.keys(selectedCharacter.spellsByLevel).length > 0 ? (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <Sparkles size={20} color="#8E44AD" />
                    <Text style={styles.sectionTitle}>
                      Magias Conhecidas ({selectedCharacter.spells.length})
                    </Text>
                  </View>

                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => {
                    const spellsAtLevel = selectedCharacter.spellsByLevel[level] || [];
                    if (spellsAtLevel.length === 0) return null;

                    const levelColor = getSpellLevelColor(level);

                    return (
                      <View key={level} style={styles.spellLevelSection}>
                        <View style={[styles.spellLevelHeader, { backgroundColor: levelColor }]}>
                          <Text style={styles.spellLevelTitle}>
                            {getSpellLevelName(level)}
                          </Text>
                          <View style={styles.spellCountBadge}>
                            <Text style={styles.spellCountText}>{spellsAtLevel.length}</Text>
                          </View>
                        </View>

                        <View style={styles.spellsList}>
                          {spellsAtLevel.map((spell, index) => (
                            <View key={spell.id} style={styles.spellItem}>
                              <View style={styles.spellInfo}>
                                <Text style={styles.spellName}>{spell.name}</Text>
                                <Text style={styles.spellSchool}>{spell.school}</Text>
                              </View>
                              <View style={styles.spellMeta}>
                                <Text style={styles.spellCastingTime}>{spell.castingTime}</Text>
                                <Text style={styles.spellRange}>{spell.range}</Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    );
                  })}
                </View>
              ) : (
                <View style={styles.noSpellsContainer}>
                  <Sparkles size={48} color="#D4AF37" />
                  <Text style={styles.noSpellsTitle}>Nenhuma Magia</Text>
                  <Text style={styles.noSpellsText}>
                    Este personagem ainda não possui magias em seu grimório.
                  </Text>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    position: 'absolute',
    bottom: 8,
    left: 52,
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(212, 175, 55, 0.1)',
  },
  content: {
    flex: 1,
  },
  charactersContainer: {
    padding: 16,
  },
  characterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#8E44AD',
  },
  characterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  characterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  characterDetails: {
    marginLeft: 12,
    flex: 1,
  },
  characterName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
  },
  characterClass: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  characterStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
    marginRight: 8,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
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
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  modalHeader: {
    backgroundColor: '#1A1A1A',
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitleSection: {
    flex: 1,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  closeButton: {
    padding: 4,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  spellSlotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  spellSlotCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    minWidth: 140,
    flex: 1,
  },
  spellSlotLevel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  spellSlotControls: {
    gap: 8,
  },
  spellSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spellSlotLabel: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  slotAdjustControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slotButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  slotValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    minWidth: 20,
    textAlign: 'center',
  },
  spellLevelSection: {
    marginBottom: 20,
  },
  spellLevelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  spellLevelTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  spellCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  spellCountText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  spellsList: {
    gap: 8,
  },
  spellItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
  },
  spellInfo: {
    marginBottom: 4,
  },
  spellName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  spellSchool: {
    fontSize: 12,
    color: '#8E44AD',
    fontWeight: '500',
  },
  spellMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  spellCastingTime: {
    fontSize: 12,
    color: '#666',
  },
  spellRange: {
    fontSize: 12,
    color: '#666',
  },
  noSpellsContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 40,
  },
  noSpellsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  noSpellsText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
});