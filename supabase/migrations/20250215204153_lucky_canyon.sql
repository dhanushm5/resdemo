/*
  # Add user identity to annotations

  1. Changes
    - Add `user_identity` column to annotations table
    - Add index for faster querying by user identity

  2. Security
    - Maintain existing RLS policies
*/

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'annotations' AND column_name = 'user_identity'
  ) THEN
    ALTER TABLE annotations ADD COLUMN user_identity text NOT NULL DEFAULT 'A';
    CREATE INDEX idx_annotations_user_identity ON annotations(user_identity);
  END IF;
END $$;