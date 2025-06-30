import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { Spell, SchoolColors } from '@/types/spell';
import { DnDClass } from '@/types/dndClass';
import { SpellCard } from './SpellCard';
import { SpellDetailModal } from './SpellDetailModal';
import { 
  X, 
  Plus, 
  Check, 
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronRight
} from 'lucide-react-native';

interface SpellSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  characterClass: DnDClass;
  characterName: string;
  onAddSpells: (spells: Spell[]) => void;
}

export function SpellSelectionModal({ 
  visible, 
  onClose, 
  characterClass, 
  characterName, 
  onAddSpells 
}: SpellSelectionModalProps) {
  const [selectedSpells, setSelectedSpells] = useState<Set<string>>(new Set());
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [expandedSchools, setExpandedSchools] = useState<Set<string>>(new Set());

  const classSpells = useMemo(() => {
    // Add null/undefined checks for characterClass and its name property
    if (!characterClass || !characterClass.name) {
      console.log('⚠️ characterClass or characterClass.name is undefined');
      return [];
    }

    console.log('🔍 Loading spells for class:', characterClass.name);
    
    try {
      // First try to load custom spells if available
      let spellsData: Spell[] = [];
      
      if (Platform.OS === 'web') {
        const storedSpells = localStorage.getItem('customSpells');
        if (storedSpells) {
          console.log('📚 Found custom spells in localStorage');
          spellsData = JSON.parse(storedSpells);
        }
      }
      
      // If no custom spells, load the default ones
      if (spellsData.length === 0) {
        console.log('📚 Loading default spells from data/spells.json');
        const defaultSpells = require('@/data/spells.json');
        
        // Check if we have the Livro do Jogador data
        try {
          const livroDoJogadorData = require('@/data/magias-livro-do-jogador.json');
          console.log('📖 Found Livro do Jogador data, adapting spells...');
          
          const { adaptSpellsFromLivroDoJogador } = require('@/utils/spellAdapter');
          const adaptedSpells = adaptSpellsFromLivroDoJogador(livroDoJogadorData);
          
          if (adaptedSpells && adaptedSpells.length > 0) {
            console.log('✅ Successfully adapted spells from Livro do Jogador:', adaptedSpells.length);
            spellsData = adaptedSpells;
          } else {
            console.log('⚠️ No adapted spells, using default spells');
            spellsData = defaultSpells;
          }
        } catch (error) {
          console.log('⚠️ Livro do Jogador data not available, using default spells');
          spellsData = defaultSpells;
        }
      }
      
      console.log('📊 Total spells loaded:', spellsData.length);
      console.log('🎯 Filtering spells for class:', characterClass.name);
      
      // Filter spells for this class
      const filteredSpells = spellsData.filter((spell: Spell) => {
        // Check if spell is available to this class
        const isClassSpell = spell.classes && Array.isArray(spell.classes) && 
          spell.classes.some(className => 
            className && className.trim().toLowerCase() === characterClass.name.toLowerCase()
          );
        
        // Check if spell is available to any subclass of this class
        const isSubclassSpell = spell.subclasses && Array.isArray(spell.subclasses) && 
          characterClass.subclasses && Array.isArray(characterClass.subclasses) &&
          spell.subclasses.some(subclass => 
            characterClass.subclasses.some(classSubclass => 
              typeof classSubclass === 'string' 
                ? classSubclass.toLowerCase() === subclass.toLowerCase()
                : classSubclass && classSubclass.name && classSubclass.name.toLowerCase() === subclass.toLowerCase()
            )
          );
        
        return isClassSpell || isSubclassSpell;
      });
      
      console.log('✅ Filtered spells for', characterClass.name + ':', filteredSpells.length);
      console.log('📋 Sample spells:', filteredSpells.slice(0, 5).map(s => s.name));
      
      return filteredSpells;
    } catch (error) {
      console.error('💥 Error loading spells for class:', error);
      return [];
    }
  }, [characterClass]);

  const spellsBySchool = useMemo(() => {
    console.log('🏫 Grouping spells by school...');
    const groups: Record<string, Spell[]> = {};
    
    classSpells.forEach((spell) => {
      if (!groups[spell.school]) {
        groups[spell.school] = [];
      }
      groups[spell.school].push(spell);
    });

    // Sort spells within each school
    Object.keys(groups).forEach(school => {
      groups[school].sort((a, b) => {
        if (a.level !== b.level) return a.level - b.level;
        return a.name.localeCompare(b.name);
      });
    });

    console.log('🏫 Schools with spells:', Object.keys(groups));
    console.log('📊 Spells per school:', Object.entries(groups).map(([school, spells]) => `${school}: ${spells.length}`));

    return groups;
  }, [classSpells]);

  const toggleSpellSelection = (spellId: string) => {
    const newSelected = new Set(selectedSpells);
    if (newSelected.has(spellId)) {
      newSelected.delete(spellId);
    } else {
      newSelected.add(spellId);
    }
    setSelectedSpells(newSelected);
  };

  const toggleSchool = (school: string) => {
    const newExpanded = new Set(expandedSchools);
    if (newExpanded.has(school)) {
      newExpanded.delete(school);
    } else {
      newExpanded.add(school);
    }
    setExpandedSchools(newExpanded);
  };

  const handleSelectAll = () => {
    if (selectedSpells.size === classSpells.length) {
      setSelectedSpells(new Set());
    } else {
      setSelectedSpells(new Set(classSpells.map(spell => spell.id)));
    }
  };

  const handleAddSelectedSpells = () => {
    if (selectedSpells.size === 0) {
      const message = 'Selecione pelo menos uma magia para adicionar ao grimório.';
      if (Platform.OS === 'web') {
        alert(`Aviso: ${message}`);
      } else {
        Alert.alert('Aviso', message);
      }
      return;
    }

    const spellsToAdd = classSpells.filter(spell => selectedSpells.has(spell.id));
    const confirmMessage = `Adicionar ${spellsToAdd.length} magia(s) ao grimório de ${characterName}?`;
    
    const performAdd = () => {
      onAddSpells(spellsToAdd);
      handleClose();
    };

    if (Platform.OS === 'web') {
      if (confirm(`Confirmar: ${confirmMessage}`)) {
        performAdd();
      }
    } else {
      Alert.alert(
        'Confirmar',
        confirmMessage,
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Adicionar', onPress: performAdd }
        ]
      );
    }
  };

  const handleClose = () => {
    setSelectedSpells(new Set());
    setSelectedSpell(null);
    setExpandedSchools(new Set());
    onClose();
  };

  // Debug information
  console.log('🎨 Rendering SpellSelectionModal with:', {
    visible,
    characterClass: characterClass?.name || 'undefined',
    characterName,
    totalSpells: classSpells.length,
    schoolsCount: Object.keys(spellsBySchool).length,
    selectedSpellsCount: selectedSpells.size
  });

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.titleSection}>
                <Text style={styles.title}>Adicionar Magias</Text>
                <Text style={styles.subtitle}>
                  {characterName} • {characterClass?.name || 'Classe não definida'}
                </Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Selection Controls */}
          <View style={styles.selectionControls}>
            <View style={styles.selectionHeader}>
              <BookOpen size={20} color="#8E44AD" />
              <Text style={styles.selectionTitle}>
                Magias Disponíveis: {classSpells.length} ({selectedSpells.size} selecionadas)
              </Text>
            </View>
            
            {classSpells.length > 0 && (
              <View style={styles.selectionButtons}>
                <TouchableOpacity
                  style={styles.selectAllButton}
                  onPress={handleSelectAll}
                  activeOpacity={0.8}
                >
                  <Text style={styles.selectAllButtonText}>
                    {selectedSpells.size === classSpells.length ? 'Desmarcar Todas' : 'Selecionar Todas'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.confirmButton,
                    selectedSpells.size === 0 && styles.confirmButtonDisabled
                  ]}
                  onPress={handleAddSelectedSpells}
                  activeOpacity={0.8}
                  disabled={selectedSpells.size === 0}
                >
                  <Check size={16} color="#FFFFFF" />
                  <Text style={styles.confirmButtonText}>
                    Adicionar ({selectedSpells.size})
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Spells by School */}
            {Object.keys(spellsBySchool).length > 0 ? (
              <View style={styles.spellsContainer}>
                {Object.entries(spellsBySchool)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([school, spells]) => {
                    const schoolColor = SchoolColors[school as keyof typeof SchoolColors] || '#666';
                    const isExpanded = expandedSchools.has(school);
                    
                    return (
                      <View key={school} style={styles.schoolContainer}>
                        <TouchableOpacity
                          style={[styles.schoolHeader, { backgroundColor: schoolColor }]}
                          onPress={() => toggleSchool(school)}
                          activeOpacity={0.8}
                        >
                          <View style={styles.schoolHeaderContent}>
                            <View style={styles.schoolTitleContainer}>
                              {isExpanded ? (
                                <ChevronDown size={20} color="#FFFFFF" />
                              ) : (
                                <ChevronRight size={20} color="#FFFFFF" />
                              )}
                              <Text style={styles.schoolTitle}>
                                {school}
                              </Text>
                            </View>
                            <View style={styles.countBadge}>
                              <Text style={styles.countText}>{spells.length}</Text>
                            </View>
                          </View>
                        </TouchableOpacity>

                        {isExpanded && (
                          <View style={styles.schoolSpellsContainer}>
                            {spells.map((spell) => (
                              <View key={spell.id} style={styles.spellCardContainer}>
                                <TouchableOpacity
                                  style={[
                                    styles.spellCheckbox,
                                    selectedSpells.has(spell.id) && styles.spellCheckboxSelected
                                  ]}
                                  onPress={() => toggleSpellSelection(spell.id)}
                                  activeOpacity={0.8}
                                >
                                  {selectedSpells.has(spell.id) && (
                                    <Check size={16} color="#FFFFFF" />
                                  )}
                                </TouchableOpacity>
                                
                                <View style={styles.spellCardWrapper}>
                                  <SpellCard
                                    spell={spell}
                                    onPress={() => setSelectedSpell(spell)}
                                  />
                                </View>
                              </View>
                            ))}
                          </View>
                        )}
                      </View>
                    );
                  })}
              </View>
            ) : (
              <View style={styles.noSpellsContainer}>
                <Sparkles size={48} color="#D4AF37" />
                <Text style={styles.noSpellsTitle}>Nenhuma Magia Disponível</Text>
                <Text style={styles.noSpellsText}>
                  Não foram encontradas magias para a classe {characterClass?.name || 'não definida'}.
                </Text>
                <Text style={styles.debugText}>
                  Debug: Verifique se o arquivo de magias está carregado corretamente.
                </Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <SpellDetailModal
        spell={selectedSpell}
        visible={!!selectedSpell}
        onClose={() => setSelectedSpell(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#8E44AD',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  closeButton: {
    padding: 4,
  },
  selectionControls: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  selectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  selectionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  selectAllButton: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  selectAllButtonText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#27AE60',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
  },
  confirmButtonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  spellsContainer: {
    padding: 16,
  },
  schoolContainer: {
    marginBottom: 16,
  },
  schoolHeader: {
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  schoolHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  schoolTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  schoolTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  countText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  schoolSpellsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
    padding: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  spellCardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  spellCheckbox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  spellCheckboxSelected: {
    backgroundColor: '#27AE60',
    borderColor: '#27AE60',
  },
  spellCardWrapper: {
    flex: 1,
  },
  noSpellsContainer: {
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
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
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});