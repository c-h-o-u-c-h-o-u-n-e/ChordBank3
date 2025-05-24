/*
  # Add album, year, difficulty fields
  
  1. Changes
    - Add `album` column to `partitions` table (VARCHAR)
    - Add `year` column to `partitions` table (INTEGER)
    - Add `difficulty` column to `partitions` table (VARCHAR)
    - Update `add_partition` function to include new parameters
  
  2. Notes
    - All new fields are NULLABLE
    - Difficulty is a string that can be "Débutant", "Intermédiaire", "Expert"
*/

-- Add new columns to partitions table
ALTER TABLE partitions 
ADD COLUMN album VARCHAR(255) NULL,
ADD COLUMN year INTEGER NULL,
ADD COLUMN difficulty VARCHAR(20) NULL;

-- Update add_partition function to include new parameters
CREATE OR REPLACE FUNCTION public.add_partition(
  p_artist text,
  p_title text,
  p_tuning text,
  p_key text,
  p_capo text,
  p_tempo text,
  p_time_signature text,
  p_rhythm text,
  p_lyrics text,
  p_chords text[],
  p_fingerings text[],
  p_album text DEFAULT NULL,
  p_year int DEFAULT NULL,
  p_difficulty text DEFAULT NULL
)
RETURNS int
LANGUAGE plpgsql
AS $$
DECLARE
  v_artist_id int;
  v_partition_id int;
BEGIN
  -- Upsert artist
  INSERT INTO artists(name)
    VALUES (p_artist)
    ON CONFLICT (name) DO NOTHING;
  
  SELECT id INTO v_artist_id
    FROM artists
   WHERE name = p_artist;

  -- Create partition with views initialized to 0 and additional fields
  INSERT INTO partitions(
    artist_id, title, tuning, key_signature, capo,
    tempo, time_signature, rhythm, lyrics, views,
    album, year, difficulty
  ) VALUES (
    v_artist_id, p_title, p_tuning, p_key, p_capo,
    p_tempo, p_time_signature, p_rhythm, p_lyrics, 0,
    p_album, p_year, p_difficulty
  )
  RETURNING id INTO v_partition_id;

  -- Insert chords
  FOR i IN 1..array_length(p_chords,1) LOOP
    INSERT INTO partition_chords(partition_id, position, chord, fingering)
    VALUES (v_partition_id, i, p_chords[i], p_fingerings[i]);
  END LOOP;

  RETURN v_partition_id;
END;
$$;
