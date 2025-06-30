import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Character } from '@/types/database';
import { 
  Eye, 
  Search, 
  User, 
  Heart, 
  Zap, 
  Shield,
  Clock,
  RefreshCw
} from 'lucide-react-native';

export default function DMViewTab() {
  const [token, setToken] = useState('');
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchCharacterByToken = async () => {
    if (!token.trim()) {
      Alert.alert('Erro', 'Por favor, insira um token válido.');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/share/${token.trim()}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          Alert.alert('Token Inválido', 'Token não encontrado ou expirado.');
        } else {
          Alert.alert('Erro', 'Não foi possível buscar o personagem.');
        }
        setCharacter(null);
        return;
      }

      const characterData = await response.json();
      setCharacter(characterData);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching character:', error);
      Alert.alert('Erro', 'Erro de conexão. Tente novamente.');
      setCharacter(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshCharacter = async () => {
    if (character && token) {
      await fetchCharacterByToken();
    }
  };

  const clearData = () => {
    setToken('');
    setCharacter(null);
    setLastUpdated(null);
  };

  const hpPercentage = character ? (character.hp_current / character.hp_max) * 100 : 0;
  const getHpColor = (percentage: number) => {
    if (percentage > 75) return '#27AE60';
    if (percentage > 50) return '#F39C12';
    if (percentage > 25) return '#E67E22';
    return '#E74C3C';
  };

  const formatLastUpdated = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Eye size={28} color="#D4AF37" />
          <Text style={styles.title}>Visão do Mestre</Text>
        </View>
        <Text style={styles.subtitle}>
          Acesse personagens via token
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Token Input Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Token de Acesso</Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.tokenInput}
              placeholder="Cole o token do personagem aqui..."
              value={token}
              onChangeText={setToken}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.button, styles.searchButton, loading && styles.buttonDisabled]}
              onPress={fetchCharacterByToken}
              disabled={loading}
            >
              <Search size={16} color="#FFFFFF" />
              <Text style={styles.buttonText}>
                {loading ? 'Buscando...' : 'Buscar Personagem'}
              </Text>
            </TouchableOpacity>

            {character && (
              <TouchableOpacity
                style={[styles.button, styles.refreshButton]}
                onPress={refreshCharacter}
              >
                <RefreshCw size={16} color="#FFFFFF" />
              </TouchableOpacity>
            )}

            {(token || character) && (
              <TouchableOpacity
                style={[styles.button, styles.clearButton]}
                onPress={clearData}
              >
                <Text style={styles.buttonText}>Limpar</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Character Display Section */}
        {character && (
          <>
            {/* Character Header */}
            <View style={styles.section}>
              <View style={styles.characterHeader}>
                <User size={32} color="#D4AF37" />
                <View style={styles.characterInfo}>
                  <Text style={styles.characterName}>{character.name}</Text>
                  <Text style={styles.characterClass}>
                    {character.class_name} • Nível {character.level}
                  </Text>
                </View>
                
                {lastUpdated && (
                  <View style={styles.lastUpdated}>
                    <Clock size={14} color="#666" />
                    <Text style={styles.lastUpdatedText}>
                      {formatLastUpdated(lastUpdated)}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Health Section */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Heart size={20} color={getHpColor(hpPercentage)} />
                <Text style={[styles.sectionTitle, { color: getHpColor(hpPercentage) }]}>
                  Pontos de Vida
                </Text>
              </View>

              <View style={styles.hpContainer}>
                <View style={styles.hpDisplay}>
                  <Text style={[styles.hpCurrent, { color: getHpColor(hpPercentage) }]}>
                    {character.hp_current}
                  </Text>
                  <Text style={styles.hpSeparator}>/</Text>
                  <Text style={styles.hpMax}>{character.hp_max}</Text>
                </View>

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

                <Text style={styles.hpPercentage}>
                  {Math.round(hpPercentage)}% de vida restante
                </Text>
              </View>
            </View>

            {/* Spell Slots Section */}
            {Object.keys(character.spell_slots).length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Zap size={20} color="#8E44AD" />
                  <Text style={styles.sectionTitle}>Espaços de Magia</Text>
                </View>

                <View style={styles.spellSlotsGrid}>
                  {Object.entries(character.spell_slots).map(([level, slots]) => (
                    <View key={level} style={styles.spellSlotCard}>
                      <Text style={styles.spellSlotLevel}>Nível {level}</Text>
                      <Text style={styles.spellSlotValue}>
                        {Array.isArray(slots) ? slots.join(' / ') : slots}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Spells Section */}
            {character.spells_known && character.spells_known.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Shield size={20} color="#3498DB" />
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

            {/* Character Data Section */}
            {character.character_data && Object.keys(character.character_data).length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <User size={20} color="#95A5A6" />
                  <Text style={styles.sectionTitle}>Dados Adicionais</Text>
                </View>

                <View style={styles.characterDataContainer}>
                  <Text style={styles.characterDataText}>
                    {JSON.stringify(character.character_data, null, 2)}
                  </Text>
                </View>
              </View>
            )}
          </>
        )}

        {/* Instructions */}
        {!character && (
          <View style={styles.section}>
            <Text style={styles.instructionsTitle}>Como usar:</Text>
            <View style={styles.instructionsList}>
              <Text style={styles.instructionItem}>
                1. Peça ao jogador para gerar um token de compartilhamento
              </Text>
              <Text style={styles.instructionItem}>
                2. Cole o token no campo acima
              </Text>
              <Text style={styles.instructionItem}>
                3. Clique em "Buscar Personagem" para visualizar os dados
              </Text>
              <Text style={styles.instructionItem}>
                4. Use o botão de atualizar para obter dados mais recentes
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
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
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    margin: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  tokenInput: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#F8F9FA',
    minHeight: 80,
    fontFamily: 'monospace',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 6,
  },
  searchButton: {
    backgroundColor: '#3498DB',
    flex: 1,
  },
  refreshButton: {
    backgroundColor: '#27AE60',
    paddingHorizontal: 12,
  },
  clearButton: {
    backgroundColor: '#95A5A6',
  },
  buttonDisabled: {
    backgroundColor: '#BDC3C7',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  characterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  characterInfo: {
    flex: 1,
  },
  characterName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  characterClass: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  lastUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#666',
  },
  hpContainer: {
    alignItems: 'center',
    gap: 12,
  },
  hpDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  hpCurrent: {
    fontSize: 48,
    fontWeight: '700',
  },
  hpSeparator: {
    fontSize: 32,
    color: '#666',
    fontWeight: '300',
  },
  hpMax: {
    fontSize: 32,
    color: '#666',
    fontWeight: '500',
  },
  hpBar: {
    width: '100%',
    maxWidth: 300,
  },
  hpBarBackground: {
    height: 12,
    backgroundColor: '#E8E8E8',
    borderRadius: 6,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 6,
  },
  hpPercentage: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
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
    minWidth: 80,
    alignItems: 'center',
  },
  spellSlotLevel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  spellSlotValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  spellsList: {
    gap: 8,
  },
  spellItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
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
  characterDataContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  characterDataText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#666',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  instructionsList: {
    gap: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
});