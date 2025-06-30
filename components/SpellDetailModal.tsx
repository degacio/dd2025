import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { Spell, SchoolColors } from '@/types/spell';
import { X, Clock, Target, Zap, Timer, BookOpen, Users } from 'lucide-react-native';

interface SpellDetailModalProps {
  spell: Spell | null;
  visible: boolean;
  onClose: () => void;
}

// Component to render HTML-formatted text
function FormattedText({ text, style }: { text: string; style?: any }) {
  // Parse HTML tags and convert to React Native components
  const parseHtmlText = (htmlText: string) => {
    const parts = [];
    let currentIndex = 0;
    let keyCounter = 0;

    // Split by <br> tags first to handle line breaks
    const lines = htmlText.split(/<br\s*\/?>/gi);
    
    lines.forEach((line, lineIndex) => {
      if (lineIndex > 0) {
        parts.push(<Text key={`br-${keyCounter++}`}>{'\n'}</Text>);
      }

      // Process each line for bold and italic formatting
      const processLine = (text: string) => {
        const segments = [];
        let remaining = text;
        let segmentKey = 0;

        while (remaining.length > 0) {
          // Look for bold text (**text** or <b>text</b> or <strong>text</strong>)
          const boldMatch = remaining.match(/(\*\*(.+?)\*\*|<b>(.+?)<\/b>|<strong>(.+?)<\/strong>)/i);
          
          if (boldMatch) {
            const beforeBold = remaining.substring(0, boldMatch.index);
            const boldText = boldMatch[2] || boldMatch[3] || boldMatch[4];
            
            // Add text before bold
            if (beforeBold) {
              segments.push(
                <Text key={`text-${segmentKey++}`}>
                  {processItalic(beforeBold)}
                </Text>
              );
            }
            
            // Add bold text
            segments.push(
              <Text key={`bold-${segmentKey++}`} style={styles.boldText}>
                {processItalic(boldText)}
              </Text>
            );
            
            remaining = remaining.substring(boldMatch.index + boldMatch[0].length);
          } else {
            // No more bold text, process remaining for italic
            segments.push(
              <Text key={`text-${segmentKey++}`}>
                {processItalic(remaining)}
              </Text>
            );
            break;
          }
        }
        
        return segments;
      };

      // Process italic text (*text* or <i>text</i> or <em>text</em>)
      const processItalic = (text: string) => {
        const segments = [];
        let remaining = text;
        let segmentKey = 0;

        while (remaining.length > 0) {
          const italicMatch = remaining.match(/(\*(.+?)\*|<i>(.+?)<\/i>|<em>(.+?)<\/em>)/i);
          
          if (italicMatch) {
            const beforeItalic = remaining.substring(0, italicMatch.index);
            const italicText = italicMatch[2] || italicMatch[3] || italicMatch[4];
            
            // Add text before italic
            if (beforeItalic) {
              segments.push(beforeItalic);
            }
            
            // Add italic text
            segments.push(
              <Text key={`italic-${segmentKey++}`} style={styles.italicText}>
                {italicText}
              </Text>
            );
            
            remaining = remaining.substring(italicMatch.index + italicMatch[0].length);
          } else {
            // No more italic text
            segments.push(remaining);
            break;
          }
        }
        
        return segments;
      };

      const lineSegments = processLine(line);
      parts.push(...lineSegments);
    });

    return parts;
  };

  const formattedContent = parseHtmlText(text);

  return (
    <Text style={style}>
      {formattedContent}
    </Text>
  );
}

export function SpellDetailModal({ spell, visible, onClose }: SpellDetailModalProps) {
  if (!spell) return null;

  const schoolColor = SchoolColors[spell.school as keyof typeof SchoolColors];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={[styles.header, { backgroundColor: schoolColor }]}>
          <View style={styles.headerContent}>
            <View style={styles.titleSection}>
              <Text style={styles.spellName}>{spell.name}</Text>
              <Text style={styles.schoolLevel}>
                {spell.school} • Nível {spell.level}
              </Text>
            </View>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Clock size={20} color={schoolColor} />
                <Text style={styles.statLabel}>Tempo de Conjuração</Text>
                <Text style={styles.statValue}>{spell.castingTime}</Text>
              </View>
              <View style={styles.statItem}>
                <Target size={20} color={schoolColor} />
                <Text style={styles.statLabel}>Alcance</Text>
                <Text style={styles.statValue}>{spell.range}</Text>
              </View>
            </View>

            <View style={styles.statRow}>
              <View style={styles.statItem}>
                <Zap size={20} color={schoolColor} />
                <Text style={styles.statLabel}>Componentes</Text>
                <Text style={styles.statValue}>{spell.components}</Text>
              </View>
              <View style={styles.statItem}>
                <Timer size={20} color={schoolColor} />
                <Text style={styles.statLabel}>Duração</Text>
                <Text style={styles.statValue}>{spell.duration}</Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <BookOpen size={20} color={schoolColor} />
              <Text style={[styles.sectionTitle, { color: schoolColor }]}>
                Descrição
              </Text>
            </View>
            <FormattedText text={spell.description} style={styles.description} />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Users size={20} color={schoolColor} />
              <Text style={[styles.sectionTitle, { color: schoolColor }]}>
                Classes
              </Text>
            </View>
            <View style={styles.classesContainer}>
              {spell.classes.map((className, index) => (
                <View key={index} style={[styles.classBadge, { borderColor: schoolColor }]}>
                  <Text style={[styles.classText, { color: schoolColor }]}>
                    {className}
                  </Text>
                </View>
              ))}
            </View>
            {spell.subclasses && spell.subclasses.length > 0 && (
              <>
                <Text style={styles.subclassLabel}>Subclasses:</Text>
                <View style={styles.classesContainer}>
                  {spell.subclasses.map((subclass, index) => (
                    <View key={index} style={styles.subclassBadge}>
                      <Text style={styles.subclassText}>{subclass}</Text>
                    </View>
                  ))}
                </View>
              </>
            )}
          </View>

          <View style={styles.sourceSection}>
            <Text style={styles.sourceLabel}>Fonte:</Text>
            <Text style={styles.sourceText}>{spell.source}</Text>
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
  spellName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  schoolLevel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
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
  statRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    fontWeight: '600',
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
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  description: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
  },
  boldText: {
    fontWeight: '700',
    color: '#1A1A1A',
  },
  italicText: {
    fontStyle: 'italic',
    color: '#444',
  },
  classesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  classBadge: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  classText: {
    fontSize: 14,
    fontWeight: '500',
  },
  subclassLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    marginBottom: 8,
  },
  subclassBadge: {
    backgroundColor: '#F0F0F0',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  subclassText: {
    fontSize: 12,
    color: '#666',
  },
  sourceSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 32,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  sourceLabel: {
    fontSize: 14,
    color: '#666',
    marginRight: 8,
  },
  sourceText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});