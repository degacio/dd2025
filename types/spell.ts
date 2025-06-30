export interface Spell {
  id: string;
  name: string;
  school: School;
  level: number;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  classes: string[];
  subclasses?: string[];
  source: string;
}

export enum School {
  ABJURATION = 'Abjuração',
  DIVINATION = 'Adivinhação', 
  ENCHANTMENT = 'Encantamento',
  EVOCATION = 'Evocação',
  ILLUSION = 'Ilusão',
  CONJURATION = 'Invocação',
  NECROMANCY = 'Necromancia',
  TRANSMUTATION = 'Transmutação'
}

export const SchoolColors = {
  [School.ABJURATION]: '#4A90E2',
  [School.DIVINATION]: '#9B59B6',
  [School.ENCHANTMENT]: '#E74C3C',
  [School.EVOCATION]: '#F39C12',
  [School.ILLUSION]: '#8E44AD',
  [School.CONJURATION]: '#27AE60',
  [School.NECROMANCY]: '#2C3E50',
  [School.TRANSMUTATION]: '#16A085'
};