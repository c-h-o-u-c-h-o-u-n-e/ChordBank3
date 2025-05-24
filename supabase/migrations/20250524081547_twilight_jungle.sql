/*
  # Optimized Schema for Guitar Song Sheet App
  
  1. Changes
    - Combine all necessary tables and functions
    - Simplify recent views tracking
    - Add proper indexes and constraints
    
  2. Notes
    - All tables use RLS
    - Proper foreign key constraints
    - Optimized for performance
*/

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS artists (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS partitions (
  id SERIAL PRIMARY KEY,
  artist_id INTEGER NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  tuning TEXT NOT NULL,
  key_signature TEXT NOT NULL,
  capo TEXT NOT NULL,
  tempo TEXT NOT NULL,
  time_signature TEXT NOT NULL,
  rhythm TEXT NOT NULL,
  lyrics TEXT NOT NULL DEFAULT '',
  views INTEGER NOT NULL DEFAULT 0,
  recent_views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  album VARCHAR(255),
  year INTEGER,
  difficulty VARCHAR(20),
  youtube_link TEXT,
  
  CONSTRAINT valid_year CHECK (year IS NULL OR (year >= 1900 AND year <= EXTRACT(YEAR FROM NOW()) + 1)),
  CONSTRAINT valid_difficulty CHECK (difficulty IS NULL OR difficulty IN ('Débutant', 'Intermédiaire', 'Expert'))
);

CREATE TABLE IF NOT EXISTS partition_chords (
  partition_id INTEGER NOT NULL REFERENCES partitions(id) ON DELETE CASCADE,
  position SMALLINT NOT NULL CHECK (position >= 0),
  chord TEXT NOT NULL,
  fingering TEXT NOT NULL,
  PRIMARY KEY(partition_id, position)
);

CREATE TABLE IF NOT EXISTS favorites (
  partition_id INTEGER PRIMARY KEY REFERENCES partitions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_partitions_views ON partitions(views DESC);
CREATE INDEX IF NOT EXISTS idx_partitions_recent_views ON partitions(recent_views DESC);
CREATE INDEX IF NOT EXISTS idx_partitions_created_at ON partitions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_partitions_artist_title ON partitions(artist_id, title);

-- Create views for common queries
CREATE OR REPLACE VIEW recent_partitions AS
SELECT 
  p.id, 
  p.title,
  p.artist_id,
  a.name AS artist_name,
  p.views,
  p.recent_views,
  p.created_at
FROM 
  partitions p
JOIN 
  artists a ON p.artist_id = a.id
ORDER BY 
  p.created_at DESC
LIMIT 10;

CREATE OR REPLACE VIEW popular_partitions AS
SELECT 
  p.id, 
  p.title,
  p.artist_id,
  a.name AS artist_name,
  p.views,
  p.recent_views,
  p.created_at
FROM 
  partitions p
JOIN 
  artists a ON p.artist_id = a.id
ORDER BY 
  p.views DESC, p.recent_views DESC
LIMIT 10;

-- Function to record views
CREATE OR REPLACE FUNCTION record_view(p_partition_id INTEGER) 
RETURNS VOID AS $$
BEGIN
  UPDATE partitions 
  SET views = views + 1,
      recent_views = recent_views + 1
  WHERE id = p_partition_id;
END;
$$ LANGUAGE plpgsql;