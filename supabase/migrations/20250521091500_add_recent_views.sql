-- Ajouter une colonne pour suivre les vues des 3 derniers mois
ALTER TABLE partitions ADD COLUMN recent_views INTEGER NOT NULL DEFAULT 0;

-- Ajouter une table pour suivre l'historique des vues
CREATE TABLE IF NOT EXISTS view_history (
  id SERIAL PRIMARY KEY,
  partition_id INTEGER NOT NULL REFERENCES partitions(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  
  CONSTRAINT unique_view_per_day_per_partition
    UNIQUE(partition_id, (DATE(viewed_at)))
);

-- Fonction pour mettre à jour les vues récentes
CREATE OR REPLACE FUNCTION update_recent_views() RETURNS VOID AS $$
BEGIN
  -- Mettre à jour le compteur de vues récentes pour tous les partitions
  UPDATE partitions p
  SET recent_views = (
    SELECT COUNT(*)
    FROM view_history vh
    WHERE vh.partition_id = p.id
    AND vh.viewed_at > NOW() - INTERVAL '3 months'
  );
END;
$$ LANGUAGE plpgsql;

-- Fonction pour enregistrer une vue et mettre à jour les compteurs
CREATE OR REPLACE FUNCTION record_view(p_partition_id INTEGER) RETURNS VOID AS $$
DECLARE
  today_date DATE := CURRENT_DATE;
BEGIN
  -- Incrémenter le compteur de vues total
  UPDATE partitions 
  SET views = views + 1
  WHERE id = p_partition_id;
  
  -- Essayer d'insérer une entrée dans l'historique des vues pour aujourd'hui
  BEGIN
    INSERT INTO view_history (partition_id, viewed_at)
    VALUES (p_partition_id, NOW());
  EXCEPTION WHEN unique_violation THEN
    -- Si la partition a déjà été vue aujourd'hui, ne rien faire
    NULL;
  END;
  
  -- Mettre à jour le compteur de vues récentes pour cette partition
  UPDATE partitions
  SET recent_views = (
    SELECT COUNT(*)
    FROM view_history vh
    WHERE vh.partition_id = p_partition_id
    AND vh.viewed_at > NOW() - INTERVAL '3 months'
  )
  WHERE id = p_partition_id;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour supprimer automatiquement les entrées de plus de 3 mois
CREATE OR REPLACE FUNCTION cleanup_old_views() RETURNS TRIGGER AS $$
BEGIN
  -- Supprimer les entrées de plus de 3 mois
  DELETE FROM view_history
  WHERE viewed_at < NOW() - INTERVAL '3 months';
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_cleanup_old_views
  AFTER INSERT ON view_history
  EXECUTE FUNCTION cleanup_old_views();

-- Tâche CRON pour mettre à jour les vues récentes quotidiennement
-- Cette section est conditionnelle, car l'extension cron peut ne pas être disponible
DO $$
BEGIN
  -- Vérifier si l'extension cron est disponible
  IF EXISTS (
    SELECT FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    -- Si disponible, programmer la tâche
    PERFORM cron.schedule(
      'daily-recent-views-update',
      '0 3 * * *',  -- À 3h du matin tous les jours
      'SELECT update_recent_views()'
    );
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Ignorer les erreurs si l'extension n'est pas disponible
  RAISE NOTICE 'Extension pg_cron non disponible, la tâche planifiée n''a pas été créée';
END $$;

-- Mettre à jour les vues récentes initiales
SELECT update_recent_views();
