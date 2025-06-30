import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { DnDClass } from '@/types/dndClass';
import { ClassCard } from '@/components/ClassCard';
import { ClassDetailModal } from '@/components/ClassDetailModal';
import { Shield, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';

export default function ClassesScreen() {
  const [classes, setClasses] = useState<DnDClass[]>([]);
  const [selectedClass, setSelectedClass] = useState<DnDClass | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const classesData = require('@/data/classes.json');
      setClasses(classesData);
    } catch (error) {
      console.error('Erro ao carregar classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Shield size={48} color="#D4AF37" />
        <Text style={styles.loadingText}>Carregando classes...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={goBack}>
          <ArrowLeft size={24} color="#FFFFFF" />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <Shield size={28} color="#D4AF37" />
          <Text style={styles.title}>Classes</Text>
        </View>
        <Text style={styles.subtitle}>
          Dungeons & Dragons 5ª Edição
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.classesGrid}>
          {classes.map((dndClass) => (
            <ClassCard
              key={dndClass.id}
              dndClass={dndClass}
              onPress={() => setSelectedClass(dndClass)}
            />
          ))}
        </View>
      </ScrollView>

      <ClassDetailModal
        dndClass={selectedClass}
        visible={!!selectedClass}
        onClose={() => setSelectedClass(null)}
      />
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
  },
  backButton: {
    position: 'absolute',
    left: 20,
    top: 20,
    zIndex: 1,
    padding: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    marginLeft: 40,
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
    marginLeft: 40,
  },
  content: {
    flex: 1,
  },
  classesGrid: {
    padding: 16,
    gap: 12,
  },
});