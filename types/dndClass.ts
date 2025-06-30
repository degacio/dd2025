export interface DnDClass {
  id: string;
  name: string;
  description: string;
  hitDie: string;
  primaryAbility: string[];
  savingThrowProficiencies: string[];
  skillProficiencies: string[];
  armorProficiencies: string[];
  weaponProficiencies: string[];
  toolProficiencies: string[];
  startingEquipment: string[];
  classFeatures: ClassFeature[];
  spellcasting?: SpellcastingInfo;
  subclasses: Subclass[];
}

export interface ClassFeature {
  level: number;
  proficiencyBonus?: number;
  name: string;
  description: string;
}

export interface Subclass {
  name: string;
  description: string;
  features: SubclassFeature[];
}

export interface SubclassFeature {
  level: number;
  name: string;
  description: string;
}

export interface SpellcastingInfo {
  ability: string;
  spellsKnown?: number[];
  spellSlots: SpellSlots;
  cantripsKnown?: number[];
  ritualCasting?: boolean;
  spellcastingFocus?: string;
}

export interface SpellSlots {
  [level: number]: number[];
}

export const ClassColors = {
  'Bárbaro': '#8B4513',
  'Bardo': '#FF69B4',
  'Bruxo': '#800080',
  'Clérigo': '#FFD700',
  'Druida': '#228B22',
  'Feiticeiro': '#DC143C',
  'Guerreiro': '#B22222',
  'Ladino': '#2F4F4F',
  'Mago': '#4169E1',
  'Monge': '#FF8C00',
  'Paladino': '#F0E68C',
  'Patrulheiro': '#556B2F',
};