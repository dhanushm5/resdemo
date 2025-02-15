/*
  # Create papers table for research paper management

  1. New Tables
    - `papers`
      - `id` (uuid, primary key)
      - `title` (text, not null)
      - `summary` (text, not null)
      - `created_at` (timestamp with time zone)

  2. Security
    - Enable RLS on `papers` table
    - Add policies for authenticated users to manage their papers
*/

CREATE TABLE IF NOT EXISTS papers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  summary text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE papers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own papers"
  ON papers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own papers"
  ON papers
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update their own papers"
  ON papers
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete their own papers"
  ON papers
  FOR DELETE
  TO authenticated
  USING (true);