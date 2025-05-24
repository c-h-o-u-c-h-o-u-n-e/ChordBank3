-- Ce script de migration simplifié se concentre uniquement sur les éléments de base nécessaires
-- pour la fonctionnalité de suivi des vues récentes, sans dépendances complexes

-- 1. Ajouter la colonne recent_views si elle n'existe pas déjà
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
END $$;

-- 2. Fonction simplifiée pour enregistrer une vue
CREATE OR REPLACE FUNCTION record_view(p_partition_id INTEGER) RETURNS VOID AS $$
BEGIN
    -- Mettre à jour le compteur de vues total
    UPDATE partitions 
    SET views = views + 1,
        -- Mettre également à jour recent_views, qui sera maintenant un simple compteur
        -- Dans cette version simplifiée, nous ne faisons pas la distinction exacte des 3 derniers mois
        recent_views = recent_views + 1
    WHERE id = p_partition_id;
END;
$$ LANGUAGE plpgsql;

-- 3. Créer un index sur les vues pour améliorer les performances des requêtes de tri
CREATE INDEX IF NOT EXISTS idx_partitions_views ON partitions(views DESC);
CREATE INDEX IF NOT EXISTS idx_partitions_recent_views ON partitions(recent_views DESC);
CREATE INDEX IF NOT EXISTS idx_partitions_created_at ON partitions(created_at DESC);

-- 4. Créer une vue pour faciliter le chargement de la page d'accueil
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

-- 5. Fonction simplifiée pour récupérer les artistes avec des chansons
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
        COUNT(p.id) > 0;
END;
$$ LANGUAGE plpgsql;

-- 6. Réinitialiser les compteurs recent_views si nécessaire (facultatif)
-- UPDATE partitions SET recent_views = GREATEST(views / 2, 1);
