/*
  # Add lyrics field to partitions table
  
  1. Changes
    - Add `lyrics` column to `partitions` table to store song lyrics and tabs
    - Update `add_partition` function to include lyrics parameter
  
  2. Notes
    - Uses text type to store formatted lyrics/tabs
    - Defaults to empty string if no lyrics provided
*/

-- Add lyrics column to partitions table
ALTER TABLE partitions 
ADD COLUMN IF NOT EXISTS lyrics text NOT NULL DEFAULT '';

-- Update the add_partition function to include lyrics
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
  p_fingerings text[]
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

  -- Create partition with lyrics
  INSERT INTO partitions(
    artist_id, title, tuning, key_signature, capo,
    tempo, time_signature, rhythm, lyrics
  ) VALUES (
    v_artist_id, p_title, p_tuning, p_key, p_capo,
    p_tempo, p_time_signature, p_rhythm, p_lyrics
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