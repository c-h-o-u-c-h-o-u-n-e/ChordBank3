/*
  # Initial Schema Creation for Guitar Song Sheet App

  1. New Tables
    - `artists`
      - `id` (serial, primary key)
      - `name` (text, unique)
    - `partitions`
      - `id` (serial, primary key)
      - `artist_id` (references artists.id)
      - `title` (text)
      - `tuning` (text)
      - `key_signature` (text)
      - `capo` (text)
      - `tempo` (text)
      - `time_signature` (text)
      - `rhythm` (text)
      - `created_at` (timestamptz)
    - `partition_chords`
      - `partition_id` (references partitions.id)
      - `position` (smallint)
      - `chord` (text)
      - `fingering` (text)
  
  2. Functions
    - `add_partition` - Function to add a complete guitar song sheet with chords
*/

-- 1. Table des artistes
CREATE TABLE IF NOT EXISTS artists (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

-- 2. Table des partitions (fiches)
CREATE TABLE IF NOT EXISTS partitions (
  id SERIAL PRIMARY KEY,
  artist_id INT NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  tuning TEXT NOT NULL,
  key_signature TEXT NOT NULL,
  capo TEXT NOT NULL,
  tempo TEXT NOT NULL,
  time_signature TEXT NOT NULL,
  rhythm TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Table des accords par partition
CREATE TABLE IF NOT EXISTS partition_chords (
  partition_id INT NOT NULL REFERENCES partitions(id) ON DELETE CASCADE,
  position SMALLINT NOT NULL,         -- ordre de l'accord dans la feuille
  chord TEXT NOT NULL,
  fingering TEXT NOT NULL,
  PRIMARY KEY(partition_id, position)
);

-- 4. Fonction pour insérer une partition complète
CREATE OR REPLACE FUNCTION public.add_partition(
  p_artist TEXT,
  p_title TEXT,
  p_tuning TEXT,
  p_key TEXT,
  p_capo TEXT,
  p_tempo TEXT,
  p_time_signature TEXT,
  p_rhythm TEXT,
  p_chords TEXT[],        -- liste des noms d'accords
  p_fingerings TEXT[]     -- liste des doigtages parallèles
)
RETURNS INT
LANGUAGE PLPGSQL
AS $$
DECLARE
  v_artist_id  INT;
  v_partition_id INT;
BEGIN
  -- 4.1 Upsert artiste
  INSERT INTO artists(name)
    VALUES (p_artist)
    ON CONFLICT (name) DO NOTHING;
  SELECT id INTO v_artist_id
    FROM artists
   WHERE name = p_artist;

  -- 4.2 Création de la partition
  INSERT INTO partitions(
    artist_id, title, tuning, key_signature, capo,
    tempo, time_signature, rhythm
  ) VALUES (
    v_artist_id, p_title, p_tuning, p_key, p_capo,
    p_tempo, p_time_signature, p_rhythm
  )
  RETURNING id INTO v_partition_id;

  -- 4.3 Insertion des accords un à un
  FOR i IN 1..array_length(p_chords,1) LOOP
    INSERT INTO partition_chords(partition_id, position, chord, fingering)
    VALUES (v_partition_id, i, p_chords[i], p_fingerings[i]);
  END LOOP;

  RETURN v_partition_id;
END;
$$;

-- 5. Données initiales pour tester
INSERT INTO artists (name) VALUES 
  ('Louis-Jean Cormier'),
  ('Bon Iver'),
  ('The Weeknd'),
  ('Billie Eilish'),
  ('Ed Sheeran'),
  ('Adele'),
  ('Coldplay'),
  ('Kendrick Lamar'),
  ('Taylor Swift'),
  ('Drake')
ON CONFLICT (name) DO NOTHING;

-- Ajouter quelques partitions d'exemple
DO $$
DECLARE
  v_artist_id INT;
BEGIN
  -- Louis-Jean Cormier - TÊTE PREMIÈRE
  SELECT id INTO v_artist_id FROM artists WHERE name = 'Louis-Jean Cormier';
  
  PERFORM add_partition(
    'Louis-Jean Cormier',
    'TÊTE PREMIÈRE',
    'E | A | D | G | B | E',
    'Am',
    '2e',
    '124 BPM',
    '4 / 4',
    '↓ . . . ↓ . ↓ ↑ ↓ . ↓ . ↓ . ↓ ↑',
    ARRAY['Am','F','C','G'],
    ARRAY['X02210','133211','X32010','320003']
  );
  
  -- Bon Iver - Holocene
  SELECT id INTO v_artist_id FROM artists WHERE name = 'Bon Iver';
  
  PERFORM add_partition(
    'Bon Iver',
    'Holocene',
    'E | A | D | G | B | E',
    'C',
    'Aucun',
    '73 BPM',
    '4 / 4',
    '↓ ↓ ↑ ↑ ↓ ↑',
    ARRAY['C','G','Am','F'],
    ARRAY['X32010','320003','X02210','133211']
  );
  
  -- Coldplay - Yellow
  SELECT id INTO v_artist_id FROM artists WHERE name = 'Coldplay';
  
  PERFORM add_partition(
    'Coldplay',
    'Yellow',
    'E | A | D | G | B | E',
    'G',
    'Aucun',
    '85 BPM',
    '4 / 4',
    '↓ ↓ ↑ ↑ ↓ ↑',
    ARRAY['G','D','C','Em'],
    ARRAY['320003','XX0232','X32010','022000']
  );
END
$$;