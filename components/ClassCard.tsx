import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { DnDClass, ClassColors } from '@/types/dndClass';
import { Shield, Heart, Zap, Sword } from 'lucide-react-native';

interface ClassCardProps {
  dndClass: DnDClass;
  onPress?: () => void;
}

export function ClassCard({ dndClass, onPress }: ClassCardProps) {
  const classColor = ClassColors[dndClass.name as keyof typeof ClassColors] || '#666';

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.header, { backgroundColor: classColor }]}>
        <View style={styles.titleRow}>
          <Shield size={24} color="#FFFFFF" />
          <Text style={styles.className}>{dndClass.name}</Text>
          <View style={styles.hitDieBadge}>
            <Heart size={16} color="#FFFFFF" />
            <Text style={styles.hitDieText}>{dndClass.hitDie}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.description} numberOfLines={3}>
          {dndClass.description}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Sword size={16} color={classColor} />
            <Text style={styles.statLabel}>Habilidade Principal</Text>
            <Text style={styles.statValue}>{dndClass.primaryAbility.join(', ')}</Text>
          </View>

          {dndClass.spellcasting && (
            <View style={styles.statItem}>
              <Zap size={16} color={classColor} />
              <Text style={styles.statLabel}>Conjurador</Text>
              <Text style={styles.statValue}>{dndClass.spellcasting.ability}</Text>
            </View>
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.subclassesLabel}>
            Subclasses: {dndClass.subclasses.length}
          </Text>
          {dndClass.spellcasting && (
            <View style={styles.spellcasterBadge}>
              <Zap size={12} color="#FFFFFF" />
              <Text style={styles.spellcasterText}>Conjurador</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginVertical: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  className: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    marginLeft: 12,
  },
  hitDieBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  hitDieText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  content: {
    padding: 16,
  },
  description: {
    fontSize: 14,
    color: '#444',
    lineHeight: 20,
    marginBottom: 16,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginLeft: 8,
    marginRight: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    paddingTop: 12,
  },
  subclassesLabel: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  spellcasterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8E44AD',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  spellcasterText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
});