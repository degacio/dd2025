import { Spell, School } from '@/types/spell';

// Map Portuguese school names to English enum values
const schoolMapping: Record<string, keyof typeof School> = {
  'Abjuração': 'ABJURATION',
  'Adivinhação': 'DIVINATION',
  'Encantamento': 'ENCHANTMENT',
  'Evocação': 'EVOCATION',
  'Ilusão': 'ILLUSION',
  'Invocação': 'CONJURATION',
  'Necromancia': 'NECROMANCY',
  'Transmutação': 'TRANSMUTATION'
};

export function adaptSpellsFromLivroDoJogador(jsonData: any): Spell[] {
  if (!jsonData || !jsonData.dados || !Array.isArray(jsonData.dados)) {
    console.error('Invalid JSON data format');
    return [];
  }

  try {
    return jsonData.dados.map((spell: any, index: number) => {
      // Map the Portuguese school name to the English enum value
      const schoolKey = schoolMapping[spell.escola] || 'ABJURATION';
      
      // Convert classes string to array
      const classes = spell.classes ? spell.classes.split(', ') : [];
      
      // Convert subclasses string to array if it exists
      const subclasses = spell.subclasses && spell.subclasses !== "" 
        ? spell.subclasses.split(', ') 
        : [];

      return {
        id: spell.id.toString(),
        name: spell.nome,
        school: School[schoolKey],
        level: spell.nivel,
        castingTime: spell.tempo,
        range: spell.alcance,
        components: spell.componentes,
        duration: spell.duracao,
        description: spell.descricao,
        classes: classes,
        subclasses: subclasses,
        source: spell.fonte
      };
    });
  } catch (error) {
    console.error('Error adapting spells:', error);
    return [];
  }
}