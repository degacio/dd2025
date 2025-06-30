import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Character } from '@/types/database';
import { DnDClass } from '@/types/dndClass';
import { Spell } from '@/types/spell';
import { supabase } from '@/lib/supabase';
import { 
  ArrowLeft, 
  Save, 
  User, 
  Heart, 
  Plus, 
  Minus,
  Zap,
  Shield,
  BookOpen,
  Trash2,
  RefreshCw
} from 'lucide-react-native';
import classesData from '@/data/classes.json';

interface CharacterStats {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

interface Skill {
  name: string;
  ability: string;
  proficient: boolean;
  expertise: boolean;
}

interface KnownSpell {
  name: string;
  level: number;
}

const SKILLS = [
  { name: 'Acrobacia', ability: 'dexterity' },
  { name: 'Adestrar Animais', ability: 'wisdom' },
  { name: 'Arcanismo', ability: 'intelligence' },
  { name: 'Atletismo', ability: 'strength' },
  { name: 'Atuação', ability: 'charisma' },
  { name: 'Enganação', ability: 'charisma' },
  { name: 'Furtividade', ability: 'dexterity' },
  { name: 'História', ability: 'intelligence' },
  { name: 'Intimidação', ability: 'charisma' },
  { name: 'Intuição', ability: 'wisdom' },
  { name: 'Investigação', ability: 'intelligence' },
  { name: 'Medicina', ability: 'wisdom' },
  { name: 'Natureza', ability: 'intelligence' },
  { name: 'Percepção', ability: 'wisdom' },
  { name: 'Persuasão', ability: 'charisma' },
  { name: 'Prestidigitação', ability: 'dexterity' },
  { name: 'Religião', ability: 'intelligence' },
  { name: 'Sobrevivência', ability: 'wisdom' },
];

export default function EditCharacterScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [character, setCharacter] = useState<Character | null>(null);
  const [characterClass, setCharacterClass] = useState<DnDClass | null>(null);
  const [availableSpells, setAvailableSpells] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Character data states
  const [name, setName] = useState('');
  const [level, setLevel] = useState(1);
  const [hpCurrent, setHpCurrent] = useState(1);
  const [hpMax, setHpMax] = useState(1);
  const [stats, setStats] = useState<CharacterStats>({
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
  });
  const [skills, setSkills] = useState<Skill[]>([]);
  const [spellSlots, setSpellSlots] = useState<Record<string, [number, number]>>({});
  const [knownSpells, setKnownSpells] = useState<KnownSpell[]>([]);

  useEffect(() => {
    if (id) {
      loadCharacter();
    }
  }, [id]);

  useEffect(() => {
    if (characterClass) {
      loadAvailableSpells();
    }
  }, [characterClass]);

  const loadCharacter = async () => {
    try {
      console.log('🔄 Loading character with ID:', id);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('❌ No session found');
        Alert.alert('Erro', 'Você precisa estar autenticado.');
        router.back();
        return;
      }

      console.log('📤 Making API request to load character...');
      const response = await fetch(`/api/characters/${id}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      console.log('📥 API Response status:', response.status);

      if (response.ok) {
        const characterData = await response.json();
        console.log('✅ Character loaded successfully:', characterData.name);
        
        setCharacter(characterData);
        
        // Set form data
        setName(characterData.name);
        setLevel(characterData.level);
        setHpCurrent(characterData.hp_current);
        setHpMax(characterData.hp_max);
        setSpellSlots(characterData.spell_slots || {});
        
        // Process spells_known to ensure consistent structure
        const processedSpells: KnownSpell[] = [];
        if (characterData.spells_known && Array.isArray(characterData.spells_known)) {
          characterData.spells_known.forEach((spell: any) => {
            if (typeof spell === 'string') {
              // If it's just a string, we need to find the spell level
              const spellData = require('@/data/spells.json').find((s: Spell) => s.name === spell);
              processedSpells.push({
                name: spell,
                level: spellData?.level || 0
              });
            } else if (spell && typeof spell === 'object' && spell.name) {
              // If it's an object with name, ensure it has level
              processedSpells.push({
                name: spell.name,
                level: spell.level || 0
              });
            }
          });
        }
        setKnownSpells(processedSpells);

        // Set stats from character_data
        if (characterData.character_data?.stats) {
          setStats(characterData.character_data.stats);
        }

        // Initialize skills
        const characterSkills = SKILLS.map(skill => ({
          ...skill,
          proficient: characterData.character_data?.skills?.[skill.name]?.proficient || false,
          expertise: characterData.character_data?.skills?.[skill.name]?.expertise || false,
        }));
        setSkills(characterSkills);

        // Find character class
        const foundClass = classesData.find(cls => cls.name === characterData.class_name);
        setCharacterClass(foundClass || null);
      } else {
        const errorText = await response.text();
        console.error('❌ Failed to load character:', errorText);
        Alert.alert('Erro', 'Não foi possível carregar o personagem.');
        router.back();
      }
    } catch (error) {
      console.error('💥 Error loading character:', error);
      Alert.alert('Erro', 'Erro ao carregar personagem.');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableSpells = async () => {
    try {
      const spellsData = require('@/data/spells.json');
      const classSpells = spellsData.filter((spell: Spell) => 
        spell.classes.includes(characterClass!.name)
      );
      setAvailableSpells(classSpells);
    } catch (error) {
      console.error('Error loading spells:', error);
      setAvailableSpells([]);
    }
  };

  const getModifier = (score: number) => {
    return Math.floor((score - 10) / 2);
  };

  const getModifierString = (score: number) => {
    const modifier = getModifier(score);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  };

  const adjustStat = (stat: keyof CharacterStats, delta: number) => {
    setStats(prev => ({
      ...prev,
      [stat]: Math.max(1, Math.min(30, prev[stat] + delta)),
    }));
  };

  const adjustSpellSlot = (level: string, type: 'current' | 'max', delta: number) => {
    setSpellSlots(prev => {
      const current = prev[level] || [0, 0];
      const newSlots: [number, number] = [...current];
      
      if (type === 'current') {
        newSlots[0] = Math.max(0, Math.min(newSlots[1], newSlots[0] + delta));
      } else {
        newSlots[1] = Math.max(0, newSlots[1] + delta);
        // Adjust current if it exceeds new max
        newSlots[0] = Math.min(newSlots[0], newSlots[1]);
      }
      
      return {
        ...prev,
        [level]: newSlots,
      };
    });
  };

  const toggleSkillProficiency = (skillName: string) => {
    setSkills(prev => prev.map(skill => 
      skill.name === skillName 
        ? { ...skill, proficient: !skill.proficient, expertise: false }
        : skill
    ));
  };

  const toggleSkillExpertise = (skillName: string) => {
    setSkills(prev => prev.map(skill => 
      skill.name === skillName 
        ? { ...skill, expertise: !skill.expertise, proficient: true }
        : skill
    ));
  };

  const addSpell = (spellName: string) => {
    if (!knownSpells.some(spell => spell.name === spellName)) {
      const spellData = availableSpells.find(spell => spell.name === spellName);
      if (spellData) {
        setKnownSpells(prev => [...prev, { name: spellName, level: spellData.level }]);
      }
    }
  };

  const removeSpell = (spellName: string) => {
    setKnownSpells(prev => prev.filter(spell => spell.name !== spellName));
  };

  const validateData = () => {
    if (!name.trim()) {
      Alert.alert('Erro de Validação', 'O nome do personagem é obrigatório.');
      return false;
    }

    if (level < 1 || level > 20) {
      Alert.alert('Erro de Validação', 'O nível deve estar entre 1 e 20.');
      return false;
    }

    if (hpCurrent < 0 || hpMax < 1) {
      Alert.alert('Erro de Validação', 'Os pontos de vida devem ser válidos.');
      return false;
    }

    if (hpCurrent > hpMax) {
      Alert.alert('Erro de Validação', 'HP atual não pode ser maior que HP máximo.');
      return false;
    }

    return true;
  };

  const saveCharacter = async () => {
    if (!character) {
      Alert.alert('Erro', 'Dados do personagem não encontrados.');
      return;
    }

    if (!validateData()) {
      return;
    }

    setSaving(true);
    console.log('💾 Starting character save process...');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('❌ No session found during save');
        Alert.alert('Erro', 'Você precisa estar autenticado.');
        return;
      }

      // Prepare skills data
      const skillsData = skills.reduce((acc, skill) => {
        acc[skill.name] = {
          proficient: skill.proficient,
          expertise: skill.expertise,
        };
        return acc;
      }, {} as Record<string, { proficient: boolean; expertise: boolean }>);

      // Clean spell slots (remove empty entries)
      const cleanSpellSlots = Object.entries(spellSlots).reduce((acc, [level, slots]) => {
        if (slots[1] > 0) { // Only include if max slots > 0
          acc[level] = slots;
        }
        return acc;
      }, {} as Record<string, [number, number]>);

      const updateData = {
        name: name.trim(),
        level,
        hp_current: hpCurrent,
        hp_max: hpMax,
        spell_slots: cleanSpellSlots,
        spells_known: knownSpells, // Send the full objects with name and level
        character_data: {
          ...character.character_data,
          stats,
          skills: skillsData,
        },
      };

      console.log('📤 Sending update request...');
      console.log('📊 Update data summary:', {
        name: updateData.name,
        level: updateData.level,
        hp: `${updateData.hp_current}/${updateData.hp_max}`,
        spellSlotsCount: Object.keys(updateData.spell_slots).length,
        spellsCount: updateData.spells_known.length,
        skillsCount: Object.keys(updateData.character_data.skills).length,
      });

      const response = await fetch(`/api/characters/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      console.log('📥 Save response status:', response.status);

      if (response.ok) {
        const updatedCharacter = await response.json();
        console.log('✅ Character saved successfully:', updatedCharacter.name);
        
        Alert.alert(
          'Sucesso', 
          'Personagem atualizado com sucesso!', 
          [
            {
              text: 'OK',
              onPress: () => {
                console.log('🔙 Navigating back after successful save');
                router.back();
              },
            },
          ]
        );
      } else {
        const errorText = await response.text();
        console.error('❌ Save failed:', errorText);
        
        let errorMessage = 'Não foi possível salvar as alterações.';
        
        // Try to parse error for better user feedback
        try {
          const errorData = JSON.parse(errorText);
          if (errorData.error) {
            errorMessage = `Erro: ${errorData.error}`;
          }
        } catch (e) {
          // Use default message if can't parse error
        }
        
        Alert.alert('Erro de Salvamento', errorMessage);
      }
    } catch (error) {
      console.error('💥 Error saving character:', error);
      
      let errorMessage = 'Erro inesperado ao salvar personagem.';
      
      if (error instanceof Error) {
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else if (error.message.includes('timeout')) {
          errorMessage = 'Tempo limite excedido. Tente novamente.';
        }
      }
      
      Alert.alert('Erro', errorMessage);
    } finally {
      setSaving(false);
      console.log('🔄 Save process completed');
    }
  };

  const goBack = () => {
    if (saving) {
      Alert.alert(
        'Salvamento em Andamento',
        'O personagem está sendo salvo. Aguarde a conclusão.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <User size={48} color="#D4AF37" />
        <Text style={styles.loadingText}>Carregando personagem...</Text>
      </SafeAreaView>
    );
  }

  if (!character) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Personagem não encontrado</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={[styles.backButton, saving && styles.disabledButton]} 
          onPress={goBack}
          disabled={saving}
        >
          <ArrowLeft size={24} color={saving ? "#95A5A6" : "#FFFFFF"} />
        </TouchableOpacity>
        
        <View style={styles.titleContainer}>
          <User size={28} color="#D4AF37" />
          <Text style={styles.title}>Editar Personagem</Text>
        </View>
        
        <TouchableOpacity 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={saveCharacter}
          disabled={saving}
        >
          {saving ? (
            <RefreshCw size={20} color="#FFFFFF" />
          ) : (
            <Save size={20} color="#FFFFFF" />
          )}
        </TouchableOpacity>
      </View>

      {saving && (
        <View style={styles.savingIndicator}>
          <Text style={styles.savingText}>Salvando alterações...</Text>
        </View>
      )}

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Basic Info Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Básicas</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Nome do Personagem</Text>
            <TextInput
              style={[styles.textInput, saving && styles.disabledInput]}
              value={name}
              onChangeText={setName}
              placeholder="Nome do personagem"
              editable={!saving}
            />
          </View>

          <View style={styles.rowContainer}>
            <View style={styles.halfWidth}>
              <Text style={styles.inputLabel}>Nível</Text>
              <View style={styles.numberInputContainer}>
                <TouchableOpacity
                  style={[styles.numberButton, saving && styles.disabledButton]}
                  onPress={() => setLevel(Math.max(1, level - 1))}
                  disabled={saving}
                >
                  <Minus size={16} color={saving ? "#BDC3C7" : "#666"} />
                </TouchableOpacity>
                <Text style={styles.numberValue}>{level}</Text>
                <TouchableOpacity
                  style={[styles.numberButton, saving && styles.disabledButton]}
                  onPress={() => setLevel(Math.min(20, level + 1))}
                  disabled={saving}
                >
                  <Plus size={16} color={saving ? "#BDC3C7" : "#666"} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.inputLabel}>Classe</Text>
              <Text style={styles.readOnlyValue}>{character.class_name}</Text>
            </View>
          </View>
        </View>

        {/* Health Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Heart size={20} color="#E74C3C" />
            <Text style={styles.sectionTitle}>Pontos de Vida</Text>
          </View>

          <View style={styles.rowContainer}>
            <View style={styles.halfWidth}>
              <Text style={styles.inputLabel}>HP Atual</Text>
              <View style={styles.numberInputContainer}>
                <TouchableOpacity
                  style={[styles.numberButton, saving && styles.disabledButton]}
                  onPress={() => setHpCurrent(Math.max(0, hpCurrent - 1))}
                  disabled={saving}
                >
                  <Minus size={16} color={saving ? "#BDC3C7" : "#666"} />
                </TouchableOpacity>
                <Text style={styles.numberValue}>{hpCurrent}</Text>
                <TouchableOpacity
                  style={[styles.numberButton, saving && styles.disabledButton]}
                  onPress={() => setHpCurrent(Math.min(hpMax, hpCurrent + 1))}
                  disabled={saving}
                >
                  <Plus size={16} color={saving ? "#BDC3C7" : "#666"} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.inputLabel}>HP Máximo</Text>
              <View style={styles.numberInputContainer}>
                <TouchableOpacity
                  style={[styles.numberButton, saving && styles.disabledButton]}
                  onPress={() => setHpMax(Math.max(1, hpMax - 1))}
                  disabled={saving}
                >
                  <Minus size={16} color={saving ? "#BDC3C7" : "#666"} />
                </TouchableOpacity>
                <Text style={styles.numberValue}>{hpMax}</Text>
                <TouchableOpacity
                  style={[styles.numberButton, saving && styles.disabledButton]}
                  onPress={() => setHpMax(hpMax + 1)}
                  disabled={saving}
                >
                  <Plus size={16} color={saving ? "#BDC3C7" : "#666"} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color="#3498DB" />
            <Text style={styles.sectionTitle}>Atributos</Text>
          </View>

          <View style={styles.statsGrid}>
            {Object.entries(stats).map(([stat, value]) => (
              <View key={stat} style={styles.statCard}>
                <Text style={styles.statName}>
                  {stat === 'strength' ? 'FOR' :
                   stat === 'dexterity' ? 'DES' :
                   stat === 'constitution' ? 'CON' :
                   stat === 'intelligence' ? 'INT' :
                   stat === 'wisdom' ? 'SAB' : 'CAR'}
                </Text>
                
                <View style={styles.statControls}>
                  <TouchableOpacity
                    style={[styles.statButton, saving && styles.disabledButton]}
                    onPress={() => adjustStat(stat as keyof CharacterStats, -1)}
                    disabled={saving}
                  >
                    <Minus size={12} color={saving ? "#BDC3C7" : "#666"} />
                  </TouchableOpacity>
                  
                  <View style={styles.statValueContainer}>
                    <Text style={styles.statValue}>{value}</Text>
                    <Text style={styles.statModifier}>
                      {getModifierString(value)}
                    </Text>
                  </View>
                  
                  <TouchableOpacity
                    style={[styles.statButton, saving && styles.disabledButton]}
                    onPress={() => adjustStat(stat as keyof CharacterStats, 1)}
                    disabled={saving}
                  >
                    <Plus size={12} color={saving ? "#BDC3C7" : "#666"} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Skills Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <BookOpen size={20} color="#9B59B6" />
            <Text style={styles.sectionTitle}>Perícias</Text>
          </View>

          <View style={styles.skillsList}>
            {skills.map((skill) => (
              <View key={skill.name} style={styles.skillItem}>
                <View style={styles.skillInfo}>
                  <Text style={styles.skillName}>{skill.name}</Text>
                  <Text style={styles.skillAbility}>
                    ({skill.ability === 'strength' ? 'FOR' :
                      skill.ability === 'dexterity' ? 'DES' :
                      skill.ability === 'constitution' ? 'CON' :
                      skill.ability === 'intelligence' ? 'INT' :
                      skill.ability === 'wisdom' ? 'SAB' : 'CAR'})
                  </Text>
                </View>
                
                <View style={styles.skillControls}>
                  <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Prof.</Text>
                    <Switch
                      value={skill.proficient}
                      onValueChange={() => toggleSkillProficiency(skill.name)}
                      trackColor={{ false: '#E8E8E8', true: '#D4AF37' }}
                      thumbColor={skill.proficient ? '#FFFFFF' : '#FFFFFF'}
                      disabled={saving}
                    />
                  </View>
                  
                  <View style={styles.switchContainer}>
                    <Text style={styles.switchLabel}>Exp.</Text>
                    <Switch
                      value={skill.expertise}
                      onValueChange={() => toggleSkillExpertise(skill.name)}
                      trackColor={{ false: '#E8E8E8', true: '#8E44AD' }}
                      thumbColor={skill.expertise ? '#FFFFFF' : '#FFFFFF'}
                      disabled={!skill.proficient || saving}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Spell Slots Section */}
        {characterClass?.spellcasting && Object.keys(spellSlots).length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Zap size={20} color="#8E44AD" />
              <Text style={styles.sectionTitle}>Espaços de Magia</Text>
            </View>

            <View style={styles.spellSlotsGrid}>
              {Object.entries(spellSlots).map(([level, slots]) => (
                <View key={level} style={styles.spellSlotCard}>
                  <Text style={styles.spellSlotLevel}>Nível {level}</Text>
                  
                  <View style={styles.spellSlotControls}>
                    <View style={styles.spellSlotRow}>
                      <Text style={styles.spellSlotLabel}>Atual:</Text>
                      <View style={styles.numberInputContainer}>
                        <TouchableOpacity
                          style={[styles.numberButton, saving && styles.disabledButton]}
                          onPress={() => adjustSpellSlot(level, 'current', -1)}
                          disabled={saving}
                        >
                          <Minus size={12} color={saving ? "#BDC3C7" : "#666"} />
                        </TouchableOpacity>
                        <Text style={styles.numberValue}>{slots[0]}</Text>
                        <TouchableOpacity
                          style={[styles.numberButton, saving && styles.disabledButton]}
                          onPress={() => adjustSpellSlot(level, 'current', 1)}
                          disabled={saving}
                        >
                          <Plus size={12} color={saving ? "#BDC3C7" : "#666"} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    <View style={styles.spellSlotRow}>
                      <Text style={styles.spellSlotLabel}>Máximo:</Text>
                      <View style={styles.numberInputContainer}>
                        <TouchableOpacity
                          style={[styles.numberButton, saving && styles.disabledButton]}
                          onPress={() => adjustSpellSlot(level, 'max', -1)}
                          disabled={saving}
                        >
                          <Minus size={12} color={saving ? "#BDC3C7" : "#666"} />
                        </TouchableOpacity>
                        <Text style={styles.numberValue}>{slots[1]}</Text>
                        <TouchableOpacity
                          style={[styles.numberButton, saving && styles.disabledButton]}
                          onPress={() => adjustSpellSlot(level, 'max', 1)}
                          disabled={saving}
                        >
                          <Plus size={12} color={saving ? "#BDC3C7" : "#666"} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Known Spells Section */}
        {characterClass?.spellcasting && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <BookOpen size={20} color="#3498DB" />
              <Text style={styles.sectionTitle}>Magias Conhecidas</Text>
            </View>

            <View style={styles.knownSpellsList}>
              {knownSpells.map((spell, index) => (
                <View key={index} style={styles.knownSpellItem}>
                  <Text style={styles.knownSpellName}>{spell.name}</Text>
                  <TouchableOpacity
                    style={[styles.removeSpellButton, saving && styles.disabledButton]}
                    onPress={() => removeSpell(spell.name)}
                    disabled={saving}
                  >
                    <Trash2 size={16} color={saving ? "#BDC3C7" : "#E74C3C"} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {availableSpells.length > 0 && (
              <View style={styles.addSpellsSection}>
                <Text style={styles.addSpellsTitle}>Adicionar Magias:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.availableSpellsList}>
                    {availableSpells
                      .filter(spell => !knownSpells.some(knownSpell => knownSpell.name === spell.name))
                      .slice(0, 10)
                      .map((spell) => (
                        <TouchableOpacity
                          key={spell.id}
                          style={[styles.availableSpellItem, saving && styles.disabledButton]}
                          onPress={() => addSpell(spell.name)}
                          disabled={saving}
                        >
                          <Text style={styles.availableSpellName}>{spell.name}</Text>
                          <Text style={styles.availableSpellLevel}>Nv. {spell.level}</Text>
                        </TouchableOpacity>
                      ))}
                  </View>
                </ScrollView>
              </View>
            )}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  saveButton: {
    backgroundColor: '#27AE60',
    borderRadius: 8,
    padding: 12,
  },
  saveButtonDisabled: {
    backgroundColor: '#95A5A6',
  },
  savingIndicator: {
    backgroundColor: '#FFF3CD',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#FFEAA7',
  },
  savingText: {
    textAlign: 'center',
    color: '#856404',
    fontSize: 14,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.5,
  },
  disabledInput: {
    backgroundColor: '#F5F5F5',
    color: '#999',
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
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  halfWidth: {
    flex: 1,
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
  },
  numberButton: {
    padding: 12,
    backgroundColor: '#F8F9FA',
  },
  numberValue: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    paddingVertical: 12,
  },
  readOnlyValue: {
    fontSize: 16,
    color: '#666',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    width: '30%',
    alignItems: 'center',
  },
  statName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  statControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E8E8E8',
  },
  statValueContainer: {
    alignItems: 'center',
    minWidth: 40,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
  },
  statModifier: {
    fontSize: 10,
    color: '#666',
  },
  skillsList: {
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
  skillInfo: {
    flex: 1,
  },
  skillName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  skillAbility: {
    fontSize: 12,
    color: '#666',
  },
  skillControls: {
    flexDirection: 'row',
    gap: 16,
  },
  switchContainer: {
    alignItems: 'center',
    gap: 4,
  },
  switchLabel: {
    fontSize: 10,
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
    minWidth: 120,
  },
  spellSlotLevel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  spellSlotControls: {
    gap: 8,
  },
  spellSlotRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  spellSlotLabel: {
    fontSize: 12,
    color: '#666',
    flex: 1,
  },
  knownSpellsList: {
    gap: 8,
    marginBottom: 16,
  },
  knownSpellItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
  },
  knownSpellName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  removeSpellButton: {
    padding: 4,
  },
  addSpellsSection: {
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
    paddingTop: 16,
  },
  addSpellsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  availableSpellsList: {
    flexDirection: 'row',
    gap: 8,
  },
  availableSpellItem: {
    backgroundColor: '#E8F5E8',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#27AE60',
    minWidth: 100,
    alignItems: 'center',
  },
  availableSpellName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#27AE60',
    textAlign: 'center',
  },
  availableSpellLevel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
});