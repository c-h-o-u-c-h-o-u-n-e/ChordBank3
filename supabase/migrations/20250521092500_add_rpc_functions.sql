-- Fonction pour récupérer uniquement les artistes avec au moins une partition
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
