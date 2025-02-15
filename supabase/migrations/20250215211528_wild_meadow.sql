/*
  # Add rooms for collaboration

  1. New Tables
    - `rooms`
      - `id` (uuid, primary key)
      - `name` (text)
      - `created_at` (timestamp)
      - `created_by` (text)

  2. Changes to existing tables
    - Add `room_id` to `papers` table
    - Add `color` to `annotations` table

  3. Security
    - Enable RLS on `rooms` table
    - Add policies for public access
*/

-- Create rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  created_by text NOT NULL
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Add policies for rooms
CREATE POLICY "Allow public read access"
  ON rooms
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access"
  ON rooms
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Add room_id to papers
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'papers' AND column_name = 'room_id'
  ) THEN
    ALTER TABLE papers ADD COLUMN room_id uuid REFERENCES rooms(id) ON DELETE CASCADE;
    CREATE INDEX idx_papers_room_id ON papers(room_id);
  END IF;
END $$;

-- Add color to annotations
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'annotations' AND column_name = 'color'
  ) THEN
    ALTER TABLE annotations ADD COLUMN color text NOT NULL DEFAULT '#3B82F6';
    CREATE INDEX idx_annotations_color ON annotations(color);
  END IF;
END $$;