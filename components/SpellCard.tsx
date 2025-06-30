import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Spell, SchoolColors } from '@/types/spell';
import { Sparkles, ChevronRight } from 'lucide-react-native';

interface SpellCardProps {
  spell: Spell;
  onPress?: () => void;
}

export function SpellCard({ spell, onPress }: SpellCardProps) {
  const schoolColor = SchoolColors[spell.school as keyof typeof SchoolColors];

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.content, { borderLeftColor: schoolColor }]}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={[styles.levelIndicator, { backgroundColor: schoolColor }]}>
              <Text style={styles.levelText}>{spell.level}º</Text>
            </View>
            <View style={styles.nameContainer}>
              <Text style={styles.spellName}>{spell.name}</Text>
              <Text style={styles.schoolText}>{spell.school}</Text>
            </View>
          </View>
          <ChevronRight size={18} color="#999" />
        </View>

        <View style={styles.divider} />

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Tempo:</Text>
              <Text style={styles.infoValue}>{spell.castingTime}</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Alcance:</Text>
              <Text style={styles.infoValue}>{spell.range}</Text>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <Text style={styles.classesLabel}>Classes:</Text>
          <Text style={styles.classes} numberOfLines={2}>
            {spell.classes.join(', ')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 6,
    marginHorizontal: 12,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 5,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  levelIndicator: {
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginRight: 12,
    minWidth: 36,
    alignItems: 'center',
  },
  levelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  nameContainer: {
    flex: 1,
  },
  spellName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 2,
    lineHeight: 22,
  },
  schoolText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginVertical: 12,
  },
  infoSection: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  infoItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
    marginRight: 6,
    minWidth: 70,
  },
  infoValue: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  footer: {
    flexDirection: 'column',
    gap: 4,
  },
  classesLabel: {
    fontSize: 12,
    color: '#888',
    fontWeight: '600',
  },
  classes: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
    lineHeight: 16,
  },
});