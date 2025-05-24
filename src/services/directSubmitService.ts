import { supabase } from '../config/supabase';
import { ChordEntry } from '../types/database.types';

// Fonction pour sauvegarder directement une partition sans utiliser la RPC
export const directAddSongSheet = async (
  artist: string,
  title: string,
  tuning: string,
  key: string,
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
  try {
    console.log("Début de l'enregistrement direct de la partition...");
    
    // 1. Insérer ou récupérer l'artiste
    let artistId: number;
    const { data: existingArtist, error: artistSearchError } = await supabase
      .from('artists')
      .select('id')
      .eq('name', artist)
      .limit(1)
      .single();
      
    if (artistSearchError || !existingArtist) {
      console.log("Artiste non trouvé, création d'un nouvel artiste...");
      
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
    
    console.log("Artiste ID:", artistId);
    
    // 2. Insérer la partition
    const { data: newPartition, error: partitionError } = await supabase
      .from('partitions')
      .insert({
        artist_id: artistId,
        title: title,
        tuning: tuning,
        key_signature: key,
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
      })
      .select('id')
      .single();
      
    if (partitionError || !newPartition) {
      console.error("Erreur lors de la création de la partition:", partitionError);
      return null;
    }
    
    const partitionId = newPartition.id;
    if (!partitionId || partitionId <= 0) {
      console.error("ID de partition invalide:", partitionId);
      return null;
    }
    
    console.log("Partition créée avec ID:", partitionId);
    
    // 3. Insérer les accords seulement si nous avons un ID de partition valide
    if (chords.length > 0 && partitionId > 0) {
      const chordsToInsert = chords.map((chord, index) => ({
        partition_id: partitionId,
        chord: chord.chord,
        fingering: chord.fingering,
        position: index
      }));
      
      const { error: chordsError } = await supabase
        .from('partition_chords')
        .insert(chordsToInsert);
        
      if (chordsError) {
        console.error("Erreur lors de l'insertion des accords:", chordsError);
        // On continue malgré l'erreur d'accords, mais on log l'erreur
      } else {
        console.log("Accords insérés avec succès");
      }
    }
    
    console.log("Partition sauvegardée avec succès");
    return partitionId;
  } catch (error) {
    console.error("Erreur générale lors de la sauvegarde directe:", error);
    return null;
  }
};