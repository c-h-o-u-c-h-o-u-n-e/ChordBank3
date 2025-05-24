/*
  # Fonctions de débogage
  
  1. Changes
    - Add function to check if another function exists
    - Add function to list table columns
  
  2. Notes
    - These functions are for debugging purposes only
    - They should be removed in production
*/

-- Fonction pour vérifier si une autre fonction existe
CREATE OR REPLACE FUNCTION test_function_exists(function_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM pg_proc
    WHERE proname = function_name
  );
END;
$$;

-- Fonction pour lister les colonnes d'une table
CREATE OR REPLACE FUNCTION get_table_columns(table_name TEXT)
RETURNS TABLE (column_name TEXT, data_type TEXT, is_nullable BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::TEXT,
    c.data_type::TEXT,
    (c.is_nullable = 'YES')::BOOLEAN
  FROM 
    information_schema.columns c
  WHERE 
    c.table_name = get_table_columns.table_name
  ORDER BY 
    c.ordinal_position;
END;
$$;

-- Fonction simplifiée pour tester l'ajout de partition
CREATE OR REPLACE FUNCTION test_add_partition(
  p_artist TEXT,
  p_title TEXT
)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_artist_id INT;
  v_partition_id INT;
  v_error TEXT;
BEGIN
  BEGIN
    -- Upsert artist
    INSERT INTO artists(name)
      VALUES (p_artist)
      ON CONFLICT (name) DO NOTHING;
    
    SELECT id INTO v_artist_id
      FROM artists
     WHERE name = p_artist;
  
    -- Create a simple partition
    INSERT INTO partitions(
      artist_id, title, tuning, key_signature, capo,
      tempo, time_signature, rhythm, lyrics, views
    ) VALUES (
      v_artist_id, p_title, 'Standard', 'C', 'No Capo',
      '120 BPM', '4/4', '↓ ↑ ↓ ↑', 'Test lyrics', 0
    )
    RETURNING id INTO v_partition_id;
    
    -- Return success message
    RETURN 'Successfully added test partition with ID: ' || v_partition_id;
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_error = PG_EXCEPTION_DETAIL;
    RETURN 'Error: ' || SQLERRM || ' - Details: ' || v_error;
  END;
END;
$$;

-- Fonction pour récupérer les paramètres attendus par add_partition
CREATE OR REPLACE FUNCTION get_add_partition_parameters()
RETURNS TABLE (
  parameter_name TEXT,
  parameter_type TEXT,
  parameter_default TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.proargnames[i]::TEXT AS parameter_name,
    pg_catalog.format_type(p.proallargtypes[i], NULL)::TEXT AS parameter_type,
    COALESCE(d.param_default, '')::TEXT AS parameter_default
  FROM 
    pg_proc p
  LEFT JOIN (
    SELECT 
      oid,
      unnest(array_positions(proargmodes, 'i'::char)) as pos,
      unnest((regexp_matches(pg_get_function_arguments(oid), 
                           'DEFAULT ([^,\)]+)', 
                           'g'))[1]) as param_default
    FROM pg_proc
    WHERE proname = 'add_partition'
  ) d ON p.oid = d.oid AND array_position(proallargtypes, proallargtypes[i]) = d.pos - 1
  CROSS JOIN generate_series(0, array_length(proallargtypes, 1) - 1) AS i
  WHERE p.proname = 'add_partition'
  ORDER BY i;
END;
$$;
