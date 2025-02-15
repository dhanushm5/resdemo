/*
  # Add full_text column to papers table

  1. Changes
    - Add `full_text` column to store the complete text of research papers
    - This enables Q&A and bias detection features
    - Column is TEXT type to store large documents
    - NOT NULL constraint ensures we always have the paper content
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'papers' AND column_name = 'full_text'
  ) THEN
    ALTER TABLE papers ADD COLUMN full_text text NOT NULL;
  END IF;
END $$;