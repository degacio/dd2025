import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Character } from '@/types/database';
import { User, Heart, Zap, Share2, CreditCard as Edit } from 'lucide-react-native';
import { router } from 'expo-router';

interface CharacterCardProps {
  character: Character;
  onPress?: () => void;
  onShare?: () => void;
}

export function CharacterCard({ character, onPress, onShare }: CharacterCardProps) {
  const hpPercentage = (character.hp_current / character.hp_max) * 100;
  
  const getHpColor = (percentage: number) => {
    if (percentage > 75) return '#27AE60';
    if (percentage > 50) return '#F39C12';
    if (percentage > 25) return '#E67E22';
    return '#E74C3C';
  };

  const handleEdit = () => {
    router.push(`/characters/edit/${character.id}`);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.header}>
        <View style={styles.characterInfo}>
          <User size={24} color="#D4AF37" />
          <View style={styles.nameContainer}>
            <Text style={styles.characterName}>{character.name}</Text>
            <Text style={styles.characterClass}>
              {character.class_name} • Nível {character.level}
            </Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={handleEdit}
            activeOpacity={0.7}
          >
            <Edit size={18} color="#666" />
          </TouchableOpacity>
          
          {onShare && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={onShare}
              activeOpacity={0.7}
            >
              <Share2 size={18} color="#666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Heart size={18} color={getHpColor(hpPercentage)} />
          <Text style={styles.statLabel}>Vida</Text>
          <Text style={[styles.statValue, { color: getHpColor(hpPercentage) }]}>
            {character.hp_current}/{character.hp_max}
          </Text>
        </View>

        {Object.keys(character.spell_slots).length > 0 && (
          <View style={styles.statItem}>
            <Zap size={18} color="#8E44AD" />
            <Text style={styles.statLabel}>Magias</Text>
            <Text style={styles.statValue}>
              {Object.values(character.spell_slots).reduce((total: number, slots: any) => 
                total + (Array.isArray(slots) ? slots[0] : 0), 0
              )}/
              {Object.values(character.spell_slots).reduce((total: number, slots: any) => 
                total + (Array.isArray(slots) ? slots[1] : 0), 0
              )}
            </Text>
          </View>
        )}
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

      {character.share_token && (
        <View style={styles.sharedIndicator}>
          <Share2 size={12} color="#27AE60" />
          <Text style={styles.sharedText}>Compartilhado com DM</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 6,
    marginHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  characterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  nameContainer: {
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
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  hpBar: {
    marginBottom: 8,
  },
  hpBarBackground: {
    height: 6,
    backgroundColor: '#E8E8E8',
    borderRadius: 3,
    overflow: 'hidden',
  },
  hpBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  sharedIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#E8F5E8',
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  sharedText: {
    fontSize: 11,
    color: '#27AE60',
    fontWeight: '600',
    marginLeft: 4,
  },
});