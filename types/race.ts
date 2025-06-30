export interface Race {
  id: string;
  name: string;
  description: string;
  size: string;
  speed: number;
  abilityScoreIncrease: {
    [ability: string]: number;
  };
  traits: RacialTrait[];
  languages: string[];
  proficiencies?: string[];
  subraces?: Subrace[];
}

export interface RacialTrait {
  name: string;
  description: string;
}

export interface Subrace {
  name: string;
  description: string;
  abilityScoreIncrease: {
    [ability: string]: number;
  };
  traits: RacialTrait[];
}

export const RaceColors = {
  'Humano': '#8B4513',
  'Elfo': '#228B22',
  'Anão': '#B22222',
  'Halfling': '#DAA520',
  'Draconato': '#DC143C',
  'Gnomo': '#9370DB',
  'Meio-elfo': '#32CD32',
  'Meio-orc': '#8B0000',
  'Tiefling': '#800080',
};