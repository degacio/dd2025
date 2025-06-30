export interface Database {
  public: {
    Tables: {
      characters: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          class_name: string;
          level: number;
          hp_current: number;
          hp_max: number;
          spell_slots: Record<string, any>;
          spells_known: any[];
          character_data: Record<string, any>;
          share_token: string | null;
          token_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          class_name: string;
          level?: number;
          hp_current?: number;
          hp_max?: number;
          spell_slots?: Record<string, any>;
          spells_known?: any[];
          character_data?: Record<string, any>;
          share_token?: string;
          token_expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          class_name?: string;
          level?: number;
          hp_current?: number;
          hp_max?: number;
          spell_slots?: Record<string, any>;
          spells_known?: any[];
          character_data?: Record<string, any>;
          share_token?: string;
          token_expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

export type Character = Database['public']['Tables']['characters']['Row'];
export type CharacterInsert = Database['public']['Tables']['characters']['Insert'];
export type CharacterUpdate = Database['public']['Tables']['characters']['Update'];