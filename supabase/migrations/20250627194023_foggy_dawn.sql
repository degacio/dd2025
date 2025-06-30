/*
  # Fix Characters Table RLS Policy for Insert Operations

  1. Security Changes
    - Drop the existing "Users can manage own characters" policy
    - Create separate policies for different operations to be more explicit
    - Add specific INSERT policy for authenticated users
    - Add SELECT policy for users to read their own characters
    - Add UPDATE policy for users to modify their own characters
    - Add DELETE policy for users to delete their own characters
    - Keep the existing token-based read access policy for sharing

  2. Policy Details
    - INSERT: Allow authenticated users to create characters where user_id matches their auth.uid()
    - SELECT: Allow users to read their own characters
    - UPDATE: Allow users to modify their own characters
    - DELETE: Allow users to delete their own characters
    - Token-based access: Keep existing policy for shared character access
*/

-- Drop the existing broad policy
DROP POLICY IF EXISTS "Users can manage own characters" ON characters;

-- Create specific INSERT policy for authenticated users
CREATE POLICY "Users can create own characters"
  ON characters
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create specific SELECT policy for authenticated users
CREATE POLICY "Users can read own characters"
  ON characters
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Create specific UPDATE policy for authenticated users
CREATE POLICY "Users can update own characters"
  ON characters
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create specific DELETE policy for authenticated users
CREATE POLICY "Users can delete own characters"
  ON characters
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);