/*
  # Improve database functions and add validation
  
  1. Changes
    - Add validation for chord formats
    - Add batch processing for chord insertions
    - Add proper error handling
    - Add function to validate YouTube URLs
  
  2. Notes
    - All functions use proper error handling
    - Includes input validation
    - Improves performance with batch operations
*/

-- Function to validate YouTube URL format
CREATE OR REPLACE FUNCTION is_valid_youtube_url(url TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN url IS NULL OR url ~ '^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}$';
END;
$$ LANGUAGE plpgsql;

-- Function to validate chord format
CREATE OR REPLACE FUNCTION is_valid_chord(chord TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN chord ~ '^[A-G][#b]?(m|maj|min|dim|aug|sus[24]|add\d|7|9|13)?$';
END;
$$ LANGUAGE plpgsql;

-- Function to validate fingering format
CREATE OR REPLACE FUNCTION is_valid_fingering(fingering TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN fingering ~ '^[X0-9]{6}$';
END;
$$ LANGUAGE plpgsql;

-- Improved add_partition function with validation and error handling
CREATE OR REPLACE FUNCTION add_partition(
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
  i int;
BEGIN
  -- Input validation
  IF p_artist IS NULL OR p_title IS NULL THEN
    RAISE EXCEPTION 'Artist and title are required';
  END IF;
  
  IF p_year IS NOT NULL AND (p_year < 1900 OR p_year > EXTRACT(YEAR FROM NOW()) + 1) THEN
    RAISE EXCEPTION 'Invalid year: %', p_year;
  END IF;
  
  IF p_difficulty IS NOT NULL AND p_difficulty NOT IN ('Débutant', 'Intermédiaire', 'Expert') THEN
    RAISE EXCEPTION 'Invalid difficulty level: %', p_difficulty;
  END IF;
  
  IF p_youtube_link IS NOT NULL AND NOT is_valid_youtube_url(p_youtube_link) THEN
    RAISE EXCEPTION 'Invalid YouTube URL format';
  END IF;
  
  -- Validate chords array
  IF array_length(p_chords, 1) != array_length(p_fingerings, 1) THEN
    RAISE EXCEPTION 'Chords and fingerings arrays must have the same length';
  END IF;
  
  FOR i IN 1..array_length(p_chords, 1) LOOP
    IF NOT is_valid_chord(p_chords[i]) THEN
      RAISE EXCEPTION 'Invalid chord format at position %: %', i, p_chords[i];
    END IF;
    IF NOT is_valid_fingering(p_fingerings[i]) THEN
      RAISE EXCEPTION 'Invalid fingering format at position %: %', i, p_fingerings[i];
    END IF;
  END LOOP;

  -- Transaction for atomic operations
  BEGIN
    -- Upsert artist
    INSERT INTO artists(name)
      VALUES (p_artist)
      ON CONFLICT (name) DO NOTHING;
    
    SELECT id INTO v_artist_id
      FROM artists
     WHERE name = p_artist;

    -- Create partition
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

    -- Batch insert chords
    INSERT INTO partition_chords(partition_id, position, chord, fingering)
    SELECT v_partition_id, g.position, p_chords[g.position], p_fingerings[g.position]
    FROM generate_series(1, array_length(p_chords, 1)) AS g(position);

    RETURN v_partition_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE EXCEPTION 'Error adding partition: %', SQLERRM;
  END;
END;
$$;