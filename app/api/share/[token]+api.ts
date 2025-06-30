import { supabase } from '@/lib/supabase';

export async function GET(request: Request, { token }: { token: string }) {
  try {
    // Use anonymous access to fetch character by token
    const { data: character, error } = await supabase
      .from('characters')
      .select('*')
      .eq('share_token', token)
      .gt('token_expires_at', new Date().toISOString())
      .single();

    if (error || !character) {
      console.error('Error fetching character by token:', error);
      return new Response('Character not found or token expired', { status: 404 });
    }

    // Return character data without sensitive information
    const publicCharacterData = {
      id: character.id,
      name: character.name,
      class_name: character.class_name,
      level: character.level,
      hp_current: character.hp_current,
      hp_max: character.hp_max,
      spell_slots: character.spell_slots,
      spells_known: character.spells_known,
      character_data: character.character_data,
      created_at: character.created_at,
      updated_at: character.updated_at,
    };

    return Response.json(publicCharacterData);
  } catch (error) {
    console.error('API Error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}