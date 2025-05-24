-- Ce script SQL combine toutes les migrations nécessaires pour les nouvelles fonctionnalités
-- Version sans colonnes générées pour éviter les problèmes d'immuabilité
-- Mise à jour: Ajout du champ youtube_link pour les partitions
--
-- INSTRUCTIONS D'EXÉCUTION :
-- 1. Connectez-vous au tableau de bord Supabase (https://supabase.com/dashboard)
-- 2. Sélectionnez votre projet (laxlygdxuifvzbjvsvjd)
-- 3. Dans le menu latéral, cliquez sur "SQL Editor" ou "Éditeur SQL"
-- 4. Cliquez sur "New query" ou "Nouvelle requête"
-- 5. Copiez-collez tout ce fichier
-- 6. Cliquez sur "Run" ou "Exécuter"
--
-- NOTE : Si certaines commandes échouent, ce n'est pas grave. Cela peut arriver si
-- certains objets existent déjà. L'important est que les structures principales
-- (colonne recent_views, vues SQL et fonction record_view) soient créées.

-- Ajouter les colonnes nécessaires si elles n'existent pas déjà
DO $$
BEGIN
    -- Vérifier si la colonne recent_views existe déjà dans la table partitions
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'partitions' 
        AND column_name = 'recent_views'
    ) THEN
        -- Si elle n'existe pas, l'ajouter
        ALTER TABLE partitions ADD COLUMN recent_views INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    -- Vérifier si la colonne youtube_link existe déjà dans la table partitions
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'partitions' 
        AND column_name = 'youtube_link'
    ) THEN
        -- Si elle n'existe pas, l'ajouter
        ALTER TABLE partitions ADD COLUMN youtube_link TEXT;
    END IF;
END $$;

-- Fonction simplifiée pour enregistrer une vue
CREATE OR REPLACE FUNCTION record_view(p_partition_id INTEGER) RETURNS VOID AS $$
BEGIN
    -- Mettre à jour le compteur de vues total
    UPDATE partitions 
    SET views = views + 1,
        recent_views = recent_views + 1
    WHERE id = p_partition_id;
END;
$$ LANGUAGE plpgsql;

-- Créer un index sur les vues pour améliorer les performances des requêtes de tri
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_partitions_views'
  ) THEN
    CREATE INDEX idx_partitions_views ON partitions(views DESC);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_partitions_recent_views'
  ) THEN
    CREATE INDEX idx_partitions_recent_views ON partitions(recent_views DESC);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'idx_partitions_created_at'
  ) THEN
    CREATE INDEX idx_partitions_created_at ON partitions(created_at DESC);
  END IF;
END $$;

-- Supprimer les vues si elles existent déjà pour éviter les erreurs
DROP VIEW IF EXISTS recent_partitions;
DROP VIEW IF EXISTS popular_partitions;

-- Créer une vue pour faciliter le chargement des partitions récentes
CREATE VIEW recent_partitions AS
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

-- Créer une vue pour faciliter le chargement des partitions populaires
CREATE VIEW popular_partitions AS
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

-- Supprimer la fonction si elle existe déjà
DROP FUNCTION IF EXISTS get_artists_with_songs();

-- Fonction pour récupérer les artistes avec des chansons
CREATE FUNCTION get_artists_with_songs()
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
        COUNT(p.id) > 0;
END;
$$ LANGUAGE plpgsql;

-- Initialiser les compteurs de vues récentes
UPDATE partitions SET recent_views = GREATEST(views / 2, 1) WHERE recent_views = 0;

-- Fonctions de débogage pour diagnostiquer les problèmes
-- Fonction pour vérifier si une fonction existe
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
