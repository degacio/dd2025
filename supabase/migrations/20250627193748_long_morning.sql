/*
  # Fix RLS policy for characters table

  1. Changes
    - Drop the existing policy that uses incorrect `uid()` function
    - Create new policy using correct `auth.uid()` function
    - Ensure authenticated users can manage their own characters

  2. Security
    - Maintains RLS protection
    - Users can only access characters where user_id matches their auth.uid()
    - Applies to all operations (SELECT, INSERT, UPDATE, DELETE)
*/

-- Drop the existing policy with incorrect function
DROP POLICY IF EXISTS "Users can manage own characters" ON characters;

-- Create new policy with correct auth.uid() function
CREATE POLICY "Users can manage own characters"
  ON characters
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);