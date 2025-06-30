/*
  # Create characters table for D&D character management

  1. New Tables
    - `characters`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `name` (text, character name)
      - `class_name` (text, D&D class)
      - `level` (integer, character level)
      - `hp_current` (integer, current hit points)
      - `hp_max` (integer, maximum hit points)
      - `spell_slots` (jsonb, spell slots by level)
      - `spells_known` (jsonb, known/prepared spells)
      - `character_data` (jsonb, complete character sheet data)
      - `share_token` (uuid, unique sharing token)
      - `token_expires_at` (timestamptz, token expiration)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `characters` table
    - Add policies for authenticated users to manage their own characters
    - Add policy for token-based read access

  3. Indexes
    - Unique index on share_token for fast lookups
    - Index on user_id for user queries
*/

CREATE TABLE IF NOT EXISTS characters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  class_name text NOT NULL,
  level integer NOT NULL DEFAULT 1 CHECK (level >= 1 AND level <= 20),
  hp_current integer NOT NULL DEFAULT 1,
  hp_max integer NOT NULL DEFAULT 1,
  spell_slots jsonb DEFAULT '{}',
  spells_known jsonb DEFAULT '[]',
  character_data jsonb DEFAULT '{}',
  share_token uuid UNIQUE DEFAULT gen_random_uuid(),
  token_expires_at timestamptz DEFAULT (now() + interval '30 days'),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;

-- Policy for users to manage their own characters
CREATE POLICY "Users can manage own characters"
  ON characters
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for token-based read access (for DMs)
CREATE POLICY "Token-based read access"
  ON characters
  FOR SELECT
  TO anon, authenticated
  USING (
    share_token IS NOT NULL 
    AND token_expires_at > now()
  );

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_characters_user_id ON characters(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_characters_share_token ON characters(share_token) WHERE share_token IS NOT NULL;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_characters_updated_at
  BEFORE UPDATE ON characters
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();