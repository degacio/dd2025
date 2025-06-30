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
  TextInput,
  FlatList,
} from 'react-native';
import { Spell, SchoolColors } from '@/types/spell';
import { DnDClass } from '@/types/dndClass';
import { 
  X, 
  Plus, 
  Check, 
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react-native';

interface SpellSelectionModalProps {
  visible: boolean;
  onClose: () => void;
  characterClass: DnDClass;
  characterName: string;
  onAddSpells: (spells: Spell[]) => void;
}

interface SpellListItem {
  type: 'header' | 'spell';
  level?: number;
  spell?: Spell;
  id: string;
}

// Helper functions
const getLevelName = (level: number): string => {
  return level === 0 ? 'Truque' : `${level}º Círculo`;
};

const getLevelHeaderName = (level: number): string => {
  return level === 0 ? 'Truques' : `Magias de Nível ${level}`;
};

const getLevelColor = (level: number): string => {
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

export function SpellSelectionModal({ 
  visible, 
  onClose, 
  characterClass, 
  characterName, 
  onAddSpells 
}: SpellSelectionModalProps) {
  const [selectedSpells, setSelectedSpells] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState('');
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);
  const [expandedLevels, setExpandedLevels] = useState<Set<number>>(new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));

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

  // Get all unique schools from spells
  const availableSchools = useMemo(() => {
    const schoolSet = new Set<string>();
    classSpells.forEach(spell => {
      if (spell.school && spell.school.trim()) {
        schoolSet.add(spell.school.trim());
      }
    });
    return Array.from(schoolSet).sort();
  }, [classSpells]);

  const filteredAndSortedSpells = useMemo(() => {
    // First filter spells
    const filtered = classSpells.filter((spell) => {
      // Check search text
      const matchesSearch = !searchText || 
        spell.name.toLowerCase().includes(searchText.toLowerCase());
      
      // Check school filter
      let matchesSchool = true;
      if (selectedSchool) {
        matchesSchool = spell.school && spell.school.trim().toLowerCase() === selectedSchool.toLowerCase();
      }
      
      return matchesSearch && matchesSchool;
    });

    // Then sort by level first, then alphabetically by name
    return filtered.sort((a, b) => {
      // First sort by level (0-9)
      if (a.level !== b.level) {
        return a.level - b.level;
      }
      // Then sort alphabetically by name
      return a.name.localeCompare(b.name);
    });
  }, [classSpells, searchText, selectedSchool]);

  // Create list items with headers and respect expanded state
  const listItems = useMemo(() => {
    const items: SpellListItem[] = [];
    let currentLevel = -1;

    filteredAndSortedSpells.forEach((spell, index) => {
      // Add header when level changes
      if (spell.level !== currentLevel) {
        currentLevel = spell.level;
        items.push({
          type: 'header',
          level: currentLevel,
          id: `header-${currentLevel}`,
        });
      }

      // Add spell item only if the level is expanded
      if (expandedLevels.has(spell.level)) {
        items.push({
          type: 'spell',
          spell,
          id: spell.id,
        });
      }
    });

    return items;
  }, [filteredAndSortedSpells, expandedLevels]);

  const toggleLevelExpansion = (level: number) => {
    setExpandedLevels(prev => {
      const newSet = new Set(prev);
      if (newSet.has(level)) {
        newSet.delete(level);
      } else {
        newSet.add(level);
      }
      return newSet;
    });
  };

  const toggleSpellSelection = (spellId: string) => {
    const newSelected = new Set(selectedSpells);
    if (newSelected.has(spellId)) {
      newSelected.delete(spellId);
    } else {
      newSelected.add(spellId);
    }
    setSelectedSpells(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedSpells.size === filteredAndSortedSpells.length) {
      setSelectedSpells(new Set());
    } else {
      setSelectedSpells(new Set(filteredAndSortedSpells.map(spell => spell.id)));
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

    const spellsToAdd = filteredAndSortedSpells.filter(spell => selectedSpells.has(spell.id));
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
    setSearchText('');
    setSelectedSchool(null);
    setExpandedLevels(new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]));
    onClose();
  };

  const totalSpells = filteredAndSortedSpells.length;

  const renderItem = ({ item }: { item: SpellListItem }) => {
    if (item.type === 'header') {
      const levelColor = getLevelColor(item.level!);
      const isExpanded = expandedLevels.has(item.level!);
      const spellsInLevel = filteredAndSortedSpells.filter(s => s.level === item.level).length;
      
      return (
        <TouchableOpacity
          style={[styles.levelHeader, { backgroundColor: levelColor }]}
          onPress={() => toggleLevelExpansion(item.level!)}
          activeOpacity={0.8}
        >
          <View style={styles.levelHeaderContent}>
            <View style={styles.levelHeaderLeft}>
              {isExpanded ? (
                <ChevronDown size={16} color="#FFFFFF" />
              ) : (
                <ChevronRight size={16} color="#FFFFFF" />
              )}
              <Sparkles size={16} color="#FFFFFF" style={styles.levelHeaderIcon} />
              <Text style={styles.levelHeaderText}>
                {getLevelHeaderName(item.level!)}
              </Text>
            </View>
            <View style={styles.levelHeaderBadge}>
              <Text style={styles.levelHeaderBadgeText}>
                {spellsInLevel}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    }

    const spell = item.spell!;
    const isSelected = selectedSpells.has(spell.id);
    
    return (
      <TouchableOpacity
        style={[styles.spellItem, isSelected && styles.spellItemSelected]}
        onPress={() => toggleSpellSelection(spell.id)}
        activeOpacity={0.8}
      >
        <View style={styles.spellCheckbox}>
          <View style={[
            styles.checkbox,
            isSelected && styles.checkboxSelected
          ]}>
            {isSelected && (
              <Check size={16} color="#FFFFFF" />
            )}
          </View>
        </View>
        
        <View style={styles.spellContent}>
          <View style={styles.spellHeader}>
            <View style={[styles.levelBadge, { backgroundColor: getLevelColor(spell.level) }]}>
              <Text style={styles.levelText}>
                {spell.level === 0 ? 'T' : spell.level.toString()}
              </Text>
            </View>
            
            <View style={styles.spellInfo}>
              <View style={styles.spellTitleRow}>
                <Text style={styles.spellName}>{spell.name}</Text>
                <View style={[styles.schoolBadge, { backgroundColor: SchoolColors[spell.school as keyof typeof SchoolColors] }]}>
                  <Text style={styles.schoolText}>{spell.school}</Text>
                </View>
              </View>
              
              <View style={styles.spellMetaRow}>
                <Text style={styles.levelName}>{getLevelName(spell.level)}</Text>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.spellDetails}>{spell.castingTime}</Text>
                <Text style={styles.separator}>•</Text>
                <Text style={styles.spellDetails}>{spell.range}</Text>
              </View>
              
              <Text style={styles.classesText} numberOfLines={1}>
                {spell.classes.join(', ')}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // Debug information
  console.log('🎨 Rendering SpellSelectionModal with:', {
    visible,
    characterClass: characterClass?.name || 'undefined',
    characterName,
    totalSpells: classSpells.length,
    filteredSpells: totalSpells,
    selectedSpellsCount: selectedSpells.size
  });

  return (
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

        {/* Search and Filter Section */}
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Search size={18} color="#666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar magias..."
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>

          <View style={styles.filtersRow}>
            <TouchableOpacity
              style={styles.schoolFilterButton}
              onPress={() => {
                // Toggle school filter
                if (selectedSchool) {
                  setSelectedSchool(null);
                } else {
                  // For simplicity, we'll just clear the filter
                  // In a full implementation, you'd show a school picker
                  setSelectedSchool(null);
                }
              }}
              activeOpacity={0.8}
            >
              <Filter size={14} color="#666" />
              <Text style={styles.schoolFilterText}>
                {selectedSchool || 'Todas as Escolas'}
              </Text>
            </TouchableOpacity>

            <View style={styles.totalCountContainer}>
              <BookOpen size={14} color="#D4AF37" />
              <Text style={styles.totalCount}>{totalSpells}</Text>
            </View>
          </View>
        </View>

        {/* Selection Controls */}
        <View style={styles.selectionControls}>
          <View style={styles.selectionHeader}>
            <Text style={styles.selectionTitle}>
              {selectedSpells.size} de {totalSpells} selecionadas
            </Text>
          </View>
          
          {totalSpells > 0 && (
            <View style={styles.selectionButtons}>
              <TouchableOpacity
                style={styles.selectAllButton}
                onPress={handleSelectAll}
                activeOpacity={0.8}
              >
                <Text style={styles.selectAllButtonText}>
                  {selectedSpells.size === totalSpells ? 'Desmarcar Todas' : 'Selecionar Todas'}
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

        {/* Spells List */}
        {totalSpells > 0 ? (
          <FlatList
            data={listItems}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
          />
        ) : (
          <View style={styles.noSpellsContainer}>
            <Sparkles size={48} color="#D4AF37" />
            <Text style={styles.noSpellsTitle}>Nenhuma Magia Disponível</Text>
            <Text style={styles.noSpellsText}>
              Não foram encontradas magias para a classe {characterClass?.name || 'não definida'}.
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
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
  searchContainer: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
  },
  filtersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  schoolFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    flex: 1,
    gap: 6,
  },
  schoolFilterText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  totalCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  totalCount: {
    fontSize: 12,
    color: '#B8941F',
    fontWeight: '600',
  },
  selectionControls: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E8E8E8',
  },
  selectionHeader: {
    marginBottom: 12,
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
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
  listContent: {
    paddingBottom: 16,
  },
  levelHeader: {
    marginHorizontal: 8,
    marginTop: 8,
    marginBottom: 4,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  levelHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  levelHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  levelHeaderIcon: {
    marginLeft: 8,
  },
  levelHeaderText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
    flex: 1,
  },
  levelHeaderBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 24,
    alignItems: 'center',
  },
  levelHeaderBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  spellItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginHorizontal: 8,
    marginVertical: 2,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    borderLeftWidth: 3,
    borderLeftColor: '#D4AF37',
    flexDirection: 'row',
    alignItems: 'center',
  },
  spellItemSelected: {
    backgroundColor: '#F0F8FF',
    borderLeftColor: '#27AE60',
    elevation: 2,
  },
  spellCheckbox: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E8E8E8',
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#27AE60',
    borderColor: '#27AE60',
  },
  spellContent: {
    flex: 1,
  },
  spellHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  levelBadge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    minWidth: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  spellInfo: {
    flex: 1,
  },
  spellTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  spellName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 8,
  },
  schoolBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  schoolText: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  spellMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  levelName: {
    fontSize: 11,
    color: '#666',
    fontWeight: '600',
  },
  separator: {
    fontSize: 10,
    color: '#999',
  },
  spellDetails: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  classesText: {
    fontSize: 11,
    color: '#888',
    fontWeight: '500',
    fontStyle: 'italic',
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
});