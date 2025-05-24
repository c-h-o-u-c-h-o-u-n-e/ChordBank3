/*
  # Add YouTube link functionality
  
  1. Changes
    - Add `youtube_link` column to `partitions` table (TEXT)
    - Update `add_partition` function to include the new parameter
  
  2. Notes
    - The field is NULLABLE
    - It stores the full YouTube URL
    - Update the RPC function to handle this new parameter
*/

-- Add youtube_link column to partitions table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'partitions'
    AND column_name = 'youtube_link'
  ) THEN
    ALTER TABLE partitions ADD COLUMN youtube_link TEXT NULL;
  END IF;
END $$;

-- Update add_partition function to include youtube_link parameter
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
  p_difficulty text DEFAULT NULL,
  p_youtube_link text DEFAULT NULL
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

  -- Create partition with all fields including youtube_link
  INSERT INTO partitions(
    artist_id, title, tuning, key_signature, capo,
    tempo, time_signature, rhythm, lyrics, views,
    album, year, difficulty, youtube_link
  ) VALUES (
    v_artist_id, p_title, p_tuning, p_key, p_capo,
    p_tempo, p_time_signature, p_rhythm, p_lyrics, 0,
    p_album, p_year, p_difficulty, p_youtube_link
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
