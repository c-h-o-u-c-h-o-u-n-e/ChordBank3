/*
  # Add RPC Functions
  
  1. Changes
    - Drop existing get_artists_with_songs function if it exists
    - Recreate get_artists_with_songs function with correct return type
  
  2. Notes
    - Function returns artists who have at least one song
    - Returns id, name, and song count for each artist
    - Results are ordered by artist name
*/

-- Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_artists_with_songs();

-- Recreate the function with the correct return type
CREATE OR REPLACE FUNCTION get_artists_with_songs()
RETURNS TABLE (
  id INTEGER,
  name TEXT,
  song_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id, 
    a.name,
    COUNT(p.id)::INTEGER AS song_count
  FROM 
    artists a
  JOIN 
    partitions p ON a.id = p.artist_id
  GROUP BY 
    a.id, a.name
  HAVING 
    COUNT(p.id) > 0
  ORDER BY 
    a.name;
END;
$$ LANGUAGE plpgsql;