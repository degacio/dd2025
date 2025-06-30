import React, { useState, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { DnDClass, ClassColors } from '@/types/dndClass';
import { Spell } from '@/types/spell';
import { SpellCard } from './SpellCard';
import { SpellDetailModal } from './SpellDetailModal';
import { 
  X, 
  Shield, 
  Heart, 
  Sword, 
  Zap, 
  BookOpen, 
  Users, 
  Star,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Scroll
} from 'lucide-react-native';

interface ClassDetailModalProps {
  dndClass: DnDClass | null;
  visible: boolean;
  onClose: () => void;
}

export function ClassDetailModal({ dndClass, visible, onClose }: ClassDetailModalProps) {
  const [selectedSpell, setSelectedSpell] = useState<Spell | null>(null);
  const [expandedSubclasses, setExpandedSubclasses] = useState<Set<string>>(new Set());
  
  const classSpells = useMemo(() => {
    if (!dndClass) return [];
    
    try {
      const spellsData = require('@/data/spells.json');
      return spellsData.filter((spell: Spell) => 
        spell.classes.includes(dndClass.name) || 
        (spell.subclasses && spell.subclasses.some(subclass => 
          dndClass.subclasses.some(classSubclass => 
            typeof classSubclass === 'string' 
              ? classSubclass === subclass
              : classSubclass.name === subclass
          )
        ))
      );
    } catch (error) {
      console.error('Erro ao carregar magias da classe:', error);
      return [];
    }
  }, [dndClass]);

  const toggleSubclass = (subclassName: string) => {
    const newExpanded = new Set(expandedSubclasses);
    if (newExpanded.has(subclassName)) {
      newExpanded.delete(subclassName);
    } else {
      newExpanded.add(subclassName);
    }
    setExpandedSubclasses(newExpanded);
  };

  // Reset states when modal closes
  const handleClose = () => {
    setSelectedSpell(null);
    setExpandedSubclasses(new Set());
    onClose();
  };

  // Função para calcular o bônus de proficiência baseado no nível
  const getProficiencyBonus = (level: number): number => {
    return Math.ceil(level / 4) + 1;
  };

  if (!dndClass) return null;

  const classColor = ClassColors[dndClass.name as keyof typeof ClassColors] || '#666';
  const hasSpells = classSpells.length > 0;

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.container}>
          <View style={[styles.header, { backgroundColor: classColor }]}>
            <View style={styles.headerContent}>
              <View style={styles.titleSection}>
                <Text style={styles.className}>{dndClass.name}</Text>
                <Text style={styles.classDescription}>{dndClass.description}</Text>
              </View>
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Informações Básicas */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Shield size={20} color={classColor} />
                <Text style={[styles.sectionTitle, { color: classColor }]}>
                  Informações Básicas
                </Text>
              </View>
              
              <View style={styles.basicInfoGrid}>
                <View style={styles.infoItem}>
                  <Heart size={16} color={classColor} />
                  <Text style={styles.infoLabel}>Dado de Vida</Text>
                  <Text style={styles.infoValue}>{dndClass.hitDie}</Text>
                </View>
                
                <View style={styles.infoItem}>
                  <Star size={16} color={classColor} />
                  <Text style={styles.infoLabel}>Habilidade Principal</Text>
                  <Text style={styles.infoValue}>{dndClass.primaryAbility.join(', ')}</Text>
                </View>
              </View>

              <View style={styles.proficiencySection}>
                <Text style={styles.proficiencyTitle}>Proficiências em Testes de Resistência:</Text>
                <Text style={styles.proficiencyText}>{dndClass.savingThrowProficiencies.join(', ')}</Text>
              </View>
            </View>

            {/* Proficiências */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Sword size={20} color={classColor} />
                <Text style={[styles.sectionTitle, { color: classColor }]}>
                  Proficiências
                </Text>
              </View>

              <View style={styles.proficiencyGroup}>
                <Text style={styles.proficiencyGroupTitle}>Armaduras:</Text>
                <Text style={styles.proficiencyGroupText}>
                  {dndClass.armorProficiencies.length > 0 ? dndClass.armorProficiencies.join(', ') : 'Nenhuma'}
                </Text>
              </View>

              <View style={styles.proficiencyGroup}>
                <Text style={styles.proficiencyGroupTitle}>Armas:</Text>
                <Text style={styles.proficiencyGroupText}>
                  {dndClass.weaponProficiencies.join(', ')}
                </Text>
              </View>

              <View style={styles.proficiencyGroup}>
                <Text style={styles.proficiencyGroupTitle}>Perícias:</Text>
                <Text style={styles.proficiencyGroupText}>
                  {dndClass.skillProficiencies.join(', ')}
                </Text>
              </View>

              {dndClass.toolProficiencies.length > 0 && (
                <View style={styles.proficiencyGroup}>
                  <Text style={styles.proficiencyGroupTitle}>Ferramentas:</Text>
                  <Text style={styles.proficiencyGroupText}>
                    {dndClass.toolProficiencies.join(', ')}
                  </Text>
                </View>
              )}
            </View>

            {/* Habilidades de Classe */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <BookOpen size={20} color={classColor} />
                <Text style={[styles.sectionTitle, { color: classColor }]}>
                  Habilidades de Classe
                </Text>
              </View>

              {dndClass.classFeatures.map((feature, index) => (
                <View key={index} style={styles.featureItem}>
                  <View style={styles.featureHeader}>
                    <Text style={styles.featureLevel}>Nível {feature.level}</Text>
                    <Text style={[styles.proficiencyBonus, { backgroundColor: classColor }]}>
                      +{getProficiencyBonus(feature.level)}
                    </Text>
                    <Text style={styles.featureName}>{feature.name}</Text>
                  </View>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              ))}
            </View>

            {/* Informações de Conjuração */}
            {dndClass.spellcasting && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Zap size={20} color={classColor} />
                  <Text style={[styles.sectionTitle, { color: classColor }]}>
                    Conjuração
                  </Text>
                </View>

                <View style={styles.spellcastingInfo}>
                  <Text style={styles.spellcastingLabel}>
                    Habilidade de Conjuração: <Text style={styles.spellcastingValue}>{dndClass.spellcasting.ability}</Text>
                  </Text>
                  
                  {dndClass.spellcasting.ritualCasting && (
                    <Text style={styles.spellcastingLabel}>
                      Conjuração Ritual: <Text style={styles.spellcastingValue}>Sim</Text>
                    </Text>
                  )}
                  
                  {dndClass.spellcasting.spellcastingFocus && (
                    <Text style={styles.spellcastingLabel}>
                      Foco de Conjuração: <Text style={styles.spellcastingValue}>{dndClass.spellcasting.spellcastingFocus}</Text>
                    </Text>
                  )}
                </View>

                {/* Tabela de Progressão de Magias */}
                <View style={styles.spellProgressionSection}>
                  <View style={styles.sectionHeader}>
                    <Scroll size={18} color={classColor} />
                    <Text style={[styles.subsectionTitle, { color: classColor }]}>
                      Tabela de Progressão de Magias
                    </Text>
                  </View>

                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tableContainer}>
                    <View style={styles.table}>
                      {/* Cabeçalho da Tabela */}
                      <View style={styles.tableHeader}>
                        <View style={[styles.tableCell, styles.headerCell, styles.levelColumn]}>
                          <Text style={styles.headerText}>Nível</Text>
                        </View>
                        
                        {dndClass.spellcasting.cantripsKnown && (
                          <View style={[styles.tableCell, styles.headerCell, styles.cantripsColumn]}>
                            <Text style={styles.headerText}>Truques</Text>
                          </View>
                        )}
                        
                        {dndClass.spellcasting.spellsKnown && (
                          <View style={[styles.tableCell, styles.headerCell, styles.spellsKnownColumn]}>
                            <Text style={styles.headerText}>Magias{'\n'}Conhecidas</Text>
                          </View>
                        )}

                        {/* Colunas para cada nível de magia */}
                        {Object.keys(dndClass.spellcasting.spellSlots).map((spellLevel) => (
                          <View key={spellLevel} style={[styles.tableCell, styles.headerCell, styles.spellSlotColumn]}>
                            <Text style={styles.headerText}>{spellLevel}º</Text>
                          </View>
                        ))}
                      </View>

                      {/* Linhas da Tabela */}
                      {Array.from({ length: 20 }, (_, index) => {
                        const level = index + 1;
                        return (
                          <View key={level} style={[styles.tableRow, level % 2 === 0 && styles.evenRow]}>
                            <View style={[styles.tableCell, styles.levelColumn]}>
                              <Text style={styles.cellText}>{level}</Text>
                            </View>
                            
                            {dndClass.spellcasting.cantripsKnown && (
                              <View style={[styles.tableCell, styles.cantripsColumn]}>
                                <Text style={styles.cellText}>
                                  {dndClass.spellcasting.cantripsKnown[index] || '—'}
                                </Text>
                              </View>
                            )}
                            
                            {dndClass.spellcasting.spellsKnown && (
                              <View style={[styles.tableCell, styles.spellsKnownColumn]}>
                                <Text style={styles.cellText}>
                                  {dndClass.spellcasting.spellsKnown[index] || '—'}
                                </Text>
                              </View>
                            )}

                            {Object.entries(dndClass.spellcasting.spellSlots).map(([spellLevel, slots]) => (
                              <View key={spellLevel} style={[styles.tableCell, styles.spellSlotColumn]}>
                                <Text style={[styles.cellText, slots[index] > 0 && styles.activeSlot]}>
                                  {slots[index] || '—'}
                                </Text>
                              </View>
                            ))}
                          </View>
                        );
                      })}
                    </View>
                  </ScrollView>

                  {/* Legenda */}
                  <View style={styles.legendContainer}>
                    <Text style={styles.legendTitle}>Legenda:</Text>
                    <Text style={styles.legendText}>
                      • <Text style={styles.legendBold}>Truques</Text>: Magias de nível 0 que podem ser conjuradas à vontade
                    </Text>
                    {dndClass.spellcasting.spellsKnown && (
                      <Text style={styles.legendText}>
                        • <Text style={styles.legendBold}>Magias Conhecidas</Text>: Total de magias que a classe pode conhecer
                      </Text>
                    )}
                    <Text style={styles.legendText}>
                      • <Text style={styles.legendBold}>1º-9º</Text>: Espaços de magia disponíveis por nível de magia
                    </Text>
                  </View>
                </View>
              </View>
            )}

            {/* Subclasses */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Users size={20} color={classColor} />
                <Text style={[styles.sectionTitle, { color: classColor }]}>
                  Subclasses
                </Text>
              </View>
              
              <View style={styles.subclassesContainer}>
                {dndClass.subclasses.map((subclass, index) => {
                  const subclassName = typeof subclass === 'string' ? subclass : subclass.name;
                  const isExpanded = expandedSubclasses.has(subclassName);
                  const isObject = typeof subclass === 'object';

                  return (
                    <View key={index} style={styles.subclassItem}>
                      <TouchableOpacity
                        style={[styles.subclassHeader, { borderColor: classColor }]}
                        onPress={() => toggleSubclass(subclassName)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.subclassHeaderContent}>
                          {isExpanded ? (
                            <ChevronDown size={20} color={classColor} />
                          ) : (
                            <ChevronRight size={20} color={classColor} />
                          )}
                          <Text style={[styles.subclassName, { color: classColor }]}>
                            {subclassName}
                          </Text>
                        </View>
                      </TouchableOpacity>

                      {isExpanded && isObject && (
                        <View style={styles.subclassContent}>
                          <Text style={styles.subclassDescription}>
                            {subclass.description}
                          </Text>

                          {subclass.features && subclass.features.length > 0 && (
                            <View style={styles.subclassFeaturesContainer}>
                              <Text style={styles.subclassFeaturesTitle}>
                                Características da Subclasse:
                              </Text>
                              
                              {subclass.features.map((feature, featureIndex) => (
                                <View key={featureIndex} style={styles.subclassFeatureItem}>
                                  <View style={styles.subclassFeatureHeader}>
                                    <Text style={styles.subclassFeatureLevel}>
                                      Nível {feature.level}
                                    </Text>
                                    <Text style={[styles.proficiencyBonus, { backgroundColor: '#999' }]}>
                                      +{getProficiencyBonus(feature.level)}
                                    </Text>
                                    <Text style={styles.subclassFeatureName}>
                                      {feature.name}
                                    </Text>
                                  </View>
                                  <Text style={styles.subclassFeatureDescription}>
                                    {feature.description}
                                  </Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Magias da Classe */}
            {hasSpells && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Sparkles size={20} color={classColor} />
                  <Text style={[styles.sectionTitle, { color: classColor }]}>
                    Magias da Classe ({classSpells.length})
                  </Text>
                </View>
                
                <View style={styles.spellsContainer}>
                  {classSpells.map((spell) => (
                    <SpellCard
                      key={spell.id}
                      spell={spell}
                      onPress={() => setSelectedSpell(spell)}
                    />
                  ))}
                </View>
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
  className: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  classDescription: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 22,
  },
  closeButton: {
    padding: 4,
  },
  content: {
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
    marginLeft: 8,
    flex: 1,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  basicInfoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  infoItem: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  proficiencySection: {
    marginTop: 8,
  },
  proficiencyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  proficiencyText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  proficiencyGroup: {
    marginBottom: 12,
  },
  proficiencyGroupTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  proficiencyGroupText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  featureItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureLevel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: '#666',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 8,
  },
  proficiencyBonus: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 12,
  },
  featureName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  spellcastingInfo: {
    gap: 8,
    marginBottom: 16,
  },
  spellcastingLabel: {
    fontSize: 14,
    color: '#666',
  },
  spellcastingValue: {
    fontWeight: '600',
    color: '#333',
  },
  spellProgressionSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  tableContainer: {
    marginVertical: 16,
  },
  table: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
  },
  tableRow: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
  },
  evenRow: {
    backgroundColor: '#FAFAFA',
  },
  tableCell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCell: {
    backgroundColor: '#F0F0F0',
  },
  levelColumn: {
    width: 60,
  },
  cantripsColumn: {
    width: 70,
  },
  spellsKnownColumn: {
    width: 80,
  },
  spellSlotColumn: {
    width: 50,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
  },
  cellText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  activeSlot: {
    color: '#333',
    fontWeight: '600',
  },
  legendContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginBottom: 4,
  },
  legendBold: {
    fontWeight: '600',
    color: '#333',
  },
  subclassesContainer: {
    gap: 12,
  },
  subclassItem: {
    marginBottom: 8,
  },
  subclassHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
  },
  subclassHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  subclassName: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  subclassContent: {
    marginTop: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
  },
  subclassDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  subclassFeaturesContainer: {
    marginTop: 8,
  },
  subclassFeaturesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  subclassFeatureItem: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  subclassFeatureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  subclassFeatureLevel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: '#999',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 8,
  },
  subclassFeatureName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  subclassFeatureDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  spellsContainer: {
    marginTop: -6,
  },
});