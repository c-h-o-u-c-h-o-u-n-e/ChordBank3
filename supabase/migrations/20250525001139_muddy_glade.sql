/*
  # Fix RPC Functions Migration
  
  1. Changes
    - Drop existing get_artists_with_songs function
    - Recreate get_artists_with_songs function with correct return type
*/

-- Drop the existing function first to avoid return type conflicts
DROP FUNCTION IF EXISTS get_artists_with_songs();

-- Recreate the function with the correct return type
CREATE OR REPLACE FUNCTION get_artists_with_songs()
RETURNS TABLE (
    id INTEGER,
    name TEXT,
    song_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id, 
        a.name,
        COUNT(p.id) AS song_count
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