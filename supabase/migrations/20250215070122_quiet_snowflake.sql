/*
  # Update RLS policies for public access

  1. Changes
    - Enable public access to papers table
    - Allow anonymous users to perform CRUD operations
  
  2. Security
    - Temporarily allow public access for development
    - Note: In production, this should be restricted to authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Users can read their own papers" ON papers;
DROP POLICY IF EXISTS "Users can insert their own papers" ON papers;
DROP POLICY IF EXISTS "Users can update their own papers" ON papers;
DROP POLICY IF EXISTS "Users can delete their own papers" ON papers;

-- Create new policies for public access
CREATE POLICY "Allow public read access"
  ON papers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access"
  ON papers
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON papers
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete access"
  ON papers
  FOR DELETE
  TO public
  USING (true);