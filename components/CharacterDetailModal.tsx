import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import { Character } from '@/types/database';
import { X, User, Heart, Zap, Share2, Copy, Shield, Sword, Clock, Eye, EyeOff, CreditCard as Edit, BookOpen } from 'lucide-react-native';
import { router } from 'expo-router';

interface CharacterDetailModalProps {
  character: Character | null;
  visible: boolean;
  onClose: () => void;
  onGenerateToken?: (characterId: string) => Promise<{ share_token: string; expires_at: string }>;
  onRevokeToken?: (characterId: string) => Promise<void>;
}

export function CharacterDetailModal({ 
  character, 
  visible, 
  onClose, 
  onGenerateToken,
  onRevokeToken 
}: CharacterDetailModalProps) {
  const [showToken, setShowToken] = useState(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState(false);

  if (!character) return null;

  const handleEdit = () => {
    onClose();
    router.push(`/characters/edit/${character.id}`);
  };

  const handleGenerateToken = async () => {
    if (!onGenerateToken) return;
    
    setIsGeneratingToken(true);
    try {
      const result = await onGenerateToken(character.id);
      Alert.alert(
        'Token Gerado',
        'Token de compartilhamento gerado com sucesso! Você pode compartilhá-lo com seu DM.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o token de compartilhamento.');
    } finally {
      setIsGeneratingToken(false);
    }
  };

  const handleRevokeToken = async () => {
    if (!onRevokeToken) return;

    Alert.alert(
      'Revogar Token',
      'Tem certeza que deseja revogar o token de compartilhamento? O DM não conseguirá mais acessar este personagem.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Revogar',
          style: 'destructive',
          onPress: async () => {
            try {
              await onRevokeToken(character.id);
              Alert.alert('Token Revogado', 'O token de compartilhamento foi revogado.');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível revogar o token.');
            }
          }
        }
      ]
    );
  };

  const copyTokenToClipboard = () => {
    if (character.share_token) {
      Clipboard.setString(character.share_token);
      Alert.alert('Copiado', 'Token copiado para a área de transferência!');
    }
  };

  const shareToken = async () => {
    if (character.share_token) {
      try {
        await Share.share({
          message: `Token de acesso para o personagem ${character.name}: ${character.share_token}`,
          title: 'Token de Personagem D&D',
        });
      } catch (error) {
        console.error('Error sharing token:', error);
      }
    }
  };

  const formatExpirationDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const hpPercentage = (character.hp_current / character.hp_max) * 100;
  const getHpColor = (percentage: number) => {
    if (percentage > 75) return '#27AE60';
    if (percentage > 50) return '#F39C12';
    if (percentage > 25) return '#E67E22';
    return '#E74C3C';
  };

  // Get skills from character data
  const skills = character.character_data?.skills || {};
  const proficientSkills = Object.entries(skills).filter(([_, skill]: [string, any]) => skill.proficient);
  const expertiseSkills = Object.entries(skills).filter(([_, skill]: [string, any]) => skill.expertise);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.titleSection}>
              <Text style={styles.characterName}>{character.name}</Text>
              <Text style={styles.characterClass}>
                {character.class_name} • Nível {character.level}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                <Edit size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <X size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Stats Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Shield size={20} color="#D4AF37" />
              <Text style={styles.sectionTitle}>Status do Personagem</Text>
            </View>

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Heart size={24} color={getHpColor(hpPercentage)} />
                <Text style={styles.statLabel}>Pontos de Vida</Text>
                <Text style={[styles.statValue, { color: getHpColor(hpPercentage) }]}>
                  {character.hp_current} / {character.hp_max}
                </Text>
                <View style={styles.hpBar}>
                  <View style={styles.hpBarBackground}>
                    <View 
                      style={[
                        styles.hpBarFill, 
                        { 
                          width: `${hpPercentage}%`,
                          backgroundColor: getHpColor(hpPercentage)
                        }
                      ]} 
                    />
                  </View>
                </View>
              </View>

              {Object.keys(character.spell_slots).length > 0 && (
                <View style={styles.statCard}>
                  <Zap size={24} color="#8E44AD" />
                  <Text style={styles.statLabel}>Espaços de Magia</Text>
                  <View style={styles.spellSlotsContainer}>
                    {Object.entries(character.spell_slots).map(([level, slots]) => (
                      <View key={level} style={styles.spellSlotRow}>
                        <Text style={styles.spellSlotLevel}>Nível {level}:</Text>
                        <Text style={styles.spellSlotCount}>
                          {Array.isArray(slots) ? slots.join('/') : slots}
                        </Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Attributes Section */}
          {character.character_data?.stats && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Sword size={20} color="#3498DB" />
                <Text style={styles.sectionTitle}>Atributos</Text>
              </View>
              
              <View style={styles.attributesGrid}>
                {Object.entries(character.character_data.stats).map(([stat, value]) => (
                  <View key={stat} style={styles.attributeCard}>
                    <Text style={styles.attributeName}>
                      {stat === 'strength' ? 'FOR' :
                       stat === 'dexterity' ? 'DES' :
                       stat === 'constitution' ? 'CON' :
                       stat === 'intelligence' ? 'INT' :
                       stat === 'wisdom' ? 'SAB' : 'CAR'}
                    </Text>
                    <Text style={styles.attributeValue}>{value}</Text>
                    <Text style={styles.attributeModifier}>
                      {Math.floor((value - 10) / 2) >= 0 ? '+' : ''}{Math.floor((value - 10) / 2)}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Skills Section */}
          {proficientSkills.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <BookOpen size={20} color="#9B59B6" />
                <Text style={styles.sectionTitle}>Perícias</Text>
              </View>
              
              <View style={styles.skillsContainer}>
                {proficientSkills.map(([skillName, skill]: [string, any]) => (
                  <View key={skillName} style={styles.skillItem}>
                    <Text style={styles.skillName}>{skillName}</Text>
                    <View style={styles.skillBadges}>
                      <View style={styles.proficientBadge}>
                        <Text style={styles.badgeText}>Proficiente</Text>
                      </View>
                      {skill.expertise && (
                        <View style={styles.expertiseBadge}>
                          <Text style={styles.badgeText}>Especialista</Text>
                        </View>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Spells Section */}
          {character.spells_known && character.spells_known.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Sword size={20} color="#8E44AD" />
                <Text style={styles.sectionTitle}>
                  Magias Conhecidas ({character.spells_known.length})
                </Text>
              </View>
              
              <View style={styles.spellsList}>
                {character.spells_known.map((spell: any, index: number) => (
                  <View key={index} style={styles.spellItem}>
                    <Text style={styles.spellName}>
                      {typeof spell === 'string' ? spell : spell.name}
                    </Text>
                    {typeof spell === 'object' && spell.level && (
                      <View style={styles.spellLevelBadge}>
                        <Text style={styles.spellLevelText}>Nv. {spell.level}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Sharing Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Share2 size={20} color="#27AE60" />
              <Text style={styles.sectionTitle}>Compartilhamento com DM</Text>
            </View>

            {character.share_token ? (
              <View style={styles.tokenContainer}>
                <View style={styles.tokenInfo}>
                  <Text style={styles.tokenLabel}>Token Ativo:</Text>
                  <View style={styles.tokenRow}>
                    <Text style={styles.tokenValue}>
                      {showToken ? character.share_token : '••••••••-••••-••••-••••-••••••••••••'}
                    </Text>
                    <TouchableOpacity 
                      style={styles.tokenToggle}
                      onPress={() => setShowToken(!showToken)}
                    >
                      {showToken ? <EyeOff size={16} color="#666" /> : <Eye size={16} color="#666" />}
                    </TouchableOpacity>
                  </View>
                  
                  {character.token_expires_at && (
                    <View style={styles.expirationInfo}>
                      <Clock size={14} color="#666" />
                      <Text style={styles.expirationText}>
                        Expira em: {formatExpirationDate(character.token_expires_at)}
                      </Text>
                    </View>
                  )}
                </View>

                <View style={styles.tokenActions}>
                  <TouchableOpacity style={styles.actionButton} onPress={copyTokenToClipboard}>
                    <Copy size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Copiar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.actionButton} onPress={shareToken}>
                    <Share2 size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Compartilhar</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.revokeButton]} 
                    onPress={handleRevokeToken}
                  >
                    <X size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Revogar</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.noTokenContainer}>
                <Text style={styles.noTokenText}>
                  Nenhum token de compartilhamento ativo. Gere um token para permitir que seu DM acesse este personagem.
                </Text>
                
                <TouchableOpacity 
                  style={[styles.generateButton, isGeneratingToken && styles.generateButtonDisabled]}
                  onPress={handleGenerateToken}
                  disabled={isGeneratingToken}
                >
                  <Share2 size={16} color="#FFFFFF" />
                  <Text style={styles.generateButtonText}>
                    {isGeneratingToken ? 'Gerando...' : 'Gerar Token'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
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
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleSection: {
    flex: 1,
  },
  characterName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  characterClass: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
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
    color: '#333',
    marginLeft: 8,
  },
  statsGrid: {
    gap: 16,
  },
  statCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 12,
  },
  hpBar: {
    width: '100%',
  },
  hpBarBackground: {
    height: 8,
    backgroundColor: '#E8E8E8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  spellSlotsContainer: {
    width: '100%',
    marginTop: 8,
  },
  spellSlotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  spellSlotLevel: {
    fontSize: 14,
    color: '#666',
  },
  spellSlotCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  attributesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  attributeCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    width: '30%',
    alignItems: 'center',
  },
  attributeName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  attributeValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  attributeModifier: {
    fontSize: 12,
    color: '#666',
  },
  skillsContainer: {
    gap: 8,
  },
  skillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  skillBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  proficientBadge: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  expertiseBadge: {
    backgroundColor: '#8E44AD',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badgeText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  spellsList: {
    gap: 8,
  },
  spellItem: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spellName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  spellLevelBadge: {
    backgroundColor: '#8E44AD',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  spellLevelText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  tokenContainer: {
    gap: 16,
  },
  tokenInfo: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  tokenLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  tokenRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tokenValue: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  tokenToggle: {
    padding: 8,
  },
  expirationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  expirationText: {
    fontSize: 12,
    color: '#666',
  },
  tokenActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3498DB',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
  },
  revokeButton: {
    backgroundColor: '#E74C3C',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  noTokenContainer: {
    alignItems: 'center',
    padding: 20,
  },
  noTokenText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27AE60',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 8,
  },
  generateButtonDisabled: {
    backgroundColor: '#95A5A6',
  },
  generateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});