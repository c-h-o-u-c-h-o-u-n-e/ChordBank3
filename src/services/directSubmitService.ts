import { supabase } from '../config/supabase';
import { ChordEntry, SubmitError } from '../types/database.types';

const validateChord = (chord: string): boolean => {
  return /^[A-G][#b]?(m|maj|min|dim|aug|sus[24]|add\d|7|9|13)?(?:\/[A-G][#b]?)?$/.test(chord);
};

const validateFingering = (fingering: string): boolean => {
  return /^[X0-9]{6}$/.test(fingering);
};

const validateYouTubeUrl = (url?: string): boolean => {
  if (!url) return true;
  return /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[a-zA-Z0-9_-]{11}$/.test(url);
};

// Fonction pour sauvegarder directement une partition sans utiliser la RPC
export const directAddSongSheet = async (
  artist: string,
  title: string,
  tuning: string,
  keySignature: string,
  capo: string,
  tempo: string,
  timeSignature: string,
  rhythm: string,
  lyrics: string,
  chords: ChordEntry[],
  album?: string,
  year?: number,
  difficulty?: string,
  youtubeLink?: string
): Promise<{ id: number } | SubmitError> => {
  // Validation des données d'entrée
  if (!artist?.trim() || !title?.trim()) {
    return { error: 'VALIDATION_ERROR', message: 'Artiste et titre requis' };
  }

  if (year && (year < 1900 || year > new Date().getFullYear() + 1)) {
    return { error: 'VALIDATION_ERROR', message: 'Année invalide' };
  }

  if (difficulty && !['Débutant', 'Intermédiaire', 'Expert'].includes(difficulty)) {
    return { error: 'VALIDATION_ERROR', message: 'Niveau de difficulté invalide' };
  }

  if (!validateYouTubeUrl(youtubeLink)) {
    return { error: 'VALIDATION_ERROR', message: 'Format URL YouTube invalide' };
  }

  try {
    // 1. Insérer ou récupérer l'artiste
    let artistId: number;
    const { data: existingArtists, error: artistSearchError } = await supabase
      .from('artists')
      .select('id')
      .eq('name', artist)
      .limit(1);
      
    if (artistSearchError) {
      console.error("Erreur lors de la recherche de l'artiste:", artistSearchError);
      return { 
        error: 'DATABASE_ERROR',
        message: "Erreur lors de la recherche de l'artiste",
        details: artistSearchError.message
      };
    }

    if (existingArtists && existingArtists.length > 0) {
      artistId = existingArtists[0].id;
      console.log("Existing artist found with ID:", artistId);
    } else {
      const { data: newArtist, error: artistInsertError } = await supabase
        .from('artists')
        .insert({ name: artist })
        .select('id')
        .single();
        
      if (artistInsertError || !newArtist) {
        console.error("Erreur lors de la création de l'artiste:", artistInsertError);
        return { 
          error: 'DATABASE_ERROR',
          message: "Erreur lors de la création de l'artiste",
          details: artistInsertError?.message || 'Unknown error'
        };
      }
      
      artistId = newArtist.id;
      console.log("New artist created with ID:", artistId);
    }
    
    // Validation stricte de l'ID d'artiste
    if (!artistId || typeof artistId !== 'number' || artistId <= 0) {
      console.error("ID d'artiste invalide:", artistId);
      return { 
        error: 'VALIDATION_ERROR',
        message: "ID d'artiste invalide"
      };
    }
    
    // 2. Insérer la partition
    const partitionData = {
      artist_id: artistId,
      title: title,
      tuning: tuning,
      key_signature: keySignature,
      capo: capo,
      tempo: tempo,
      time_signature: timeSignature,
      rhythm: rhythm,
      lyrics: lyrics,
      views: 0,
      recent_views: 0,
      album: album,
      year: year,
      difficulty: difficulty,
      youtube_link: youtubeLink
    };

    const { data: newPartition, error: partitionError } = await supabase
      .from('partitions')
      .insert(partitionData)
      .select('id')
      .single();

    if (partitionError || !newPartition) {
      console.error("Erreur lors de la création de la partition:", partitionError);
      return { 
        error: 'DATABASE_ERROR',
        message: 'Erreur lors de la création de la partition',
        details: partitionError?.message || 'Unknown error'
      };
    }

    // Validation stricte de l'ID de partition
    if (!newPartition.id || typeof newPartition.id !== 'number' || newPartition.id <= 0) {
      console.error("ID de partition invalide après insertion:", newPartition);
      return {
        error: 'DATABASE_ERROR',
        message: 'ID de partition invalide après création',
        details: `Partition créée mais ID invalide: ${JSON.stringify(newPartition)}`
      };
    }

    const partitionId = newPartition.id;
    console.log("Partition ID before chord insertion:", partitionId);
    
    // 3. Insérer les accords seulement si nous avons des accords valides à insérer
    if (!chords || !Array.isArray(chords) || chords.length === 0) {
      console.log("Pas d'accords à insérer");
      return { id: partitionId };
    }

    // Préparer les données d'accords avec validation
    const chordsToInsert = chords
      .map((chord, index) => {
        if (!chord || typeof chord !== 'object') {
          console.warn("Accord invalide à la position", index);
          return null;
        }

        const trimmedChord = chord.chord?.trim();
        const trimmedFingering = chord.fingering?.trim();
        
        if (!trimmedChord || !trimmedFingering) {
          console.warn("Données d'accord manquantes à la position", index);
          return null;
        }
        
        if (!validateChord(trimmedChord)) {
          console.warn("Format d'accord invalide à la position", index);
          return null;
        }
        
        if (!validateFingering(trimmedFingering)) {
          console.warn("Format de doigté invalide à la position", index);
          return null;
        }
        
        return {
          partition_id: partitionId,
          chord: trimmedChord,
          fingering: trimmedFingering,
          position: index
        };
      })
      .filter((chord): chord is NonNullable<typeof chord> => chord !== null);

    if (chordsToInsert.length > 0) {
      // Insérer les accords en une seule opération
      const { error: chordsError } = await supabase
        .from('partition_chords')
        .insert(chordsToInsert);
        
      if (chordsError) {
        console.error("Erreur lors de l'insertion des accords:", chordsError);
        // On continue malgré l'erreur d'insertion des accords
        // La partition a été créée avec succès
      }
    }
    
    return { id: partitionId };
  } catch (error) {
    console.error("Erreur générale lors de la sauvegarde directe:", error);
    return {
      error: 'UNKNOWN_ERROR',
      message: 'Erreur inattendue lors de la sauvegarde',
      details: error instanceof Error ? error.message : String(error)
    };
  }
};