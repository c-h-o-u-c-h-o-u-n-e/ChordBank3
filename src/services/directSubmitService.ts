import { supabase } from '../config/supabase';
import { ChordEntry } from '../types/database.types';

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
): Promise<number | null> => {
  // Validation des données d'entrée
  if (!artist?.trim() || !title?.trim()) {
    console.error("Artiste et titre requis");
    return null;
  }

  try {
    // 1. Insérer ou récupérer l'artiste
    let artistId: number;
    const { data: existingArtist, error: artistSearchError } = await supabase
      .from('artists')
      .select('id')
      .eq('name', artist)
      .limit(1)
      .single();
      
    if (artistSearchError || !existingArtist) {
      const { data: newArtist, error: artistInsertError } = await supabase
        .from('artists')
        .insert({ name: artist })
        .select('id')
        .single();
        
      if (artistInsertError || !newArtist) {
        console.error("Erreur lors de la création de l'artiste:", artistInsertError);
        return null;
      }
      
      artistId = newArtist.id;
    } else {
      artistId = existingArtist.id;
    }
    
    // Validation stricte de l'ID d'artiste
    if (!artistId || typeof artistId !== 'number' || artistId <= 0) {
      console.error("ID d'artiste invalide:", artistId);
      return null;
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
      return null;
    }

    const partitionId = newPartition.id;
    
    // Validation stricte de l'ID de partition
    if (!partitionId || typeof partitionId !== 'number' || partitionId <= 0) {
      console.error("ID de partition invalide après insertion:", partitionId);
      return null;
    }
    
    // 3. Insérer les accords seulement si nous avons des accords valides à insérer
    if (chords && Array.isArray(chords) && chords.length > 0) {
      // Préparer les données d'accords avec validation
      const chordsToInsert = chords
        .map((chord, index) => {
          if (!chord?.chord?.trim() || !chord?.fingering?.trim()) {
            console.error("Données d'accord invalides à la position", index);
            return null;
          }
          return {
            partition_id: partitionId,
            chord: chord.chord.trim(),
            fingering: chord.fingering.trim(),
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
          // On continue malgré l'erreur d'accords, mais on log l'erreur
        }
      } else {
        console.log("Pas d'accords valides à insérer");
      }
    }
    
    return partitionId;
  } catch (error) {
    console.error("Erreur générale lors de la sauvegarde directe:", error);
    return null;
  }
};