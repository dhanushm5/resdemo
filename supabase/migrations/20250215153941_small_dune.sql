/*
  # Add Annotations Support

  1. New Tables
    - `annotations`
      - `id` (uuid, primary key)
      - `paper_id` (uuid, foreign key to papers)
      - `content` (text)
      - `ai_suggestions` (text)
      - `created_at` (timestamp)
      - `position` (text) - stores the selection position in the paper
  
  2. Security
    - Enable RLS on `annotations` table
    - Add policies for public access to support the current implementation
*/

CREATE TABLE IF NOT EXISTS annotations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  paper_id uuid REFERENCES papers(id) ON DELETE CASCADE,
  content text NOT NULL,
  ai_suggestions text,
  position text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
  ON annotations
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access"
  ON annotations
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access"
  ON annotations
  FOR UPDATE
  TO public
  USING (true);

CREATE POLICY "Allow public delete access"
  ON annotations
  FOR DELETE
  TO public
  USING (true);