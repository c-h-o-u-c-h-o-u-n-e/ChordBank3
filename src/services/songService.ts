import { supabase } from '../config/supabase';
import { Partition, ChordEntry } from '../types/database.types';

export const fetchArtists = async () => {
  const { data, error } = await supabase
    .from('artists')
    .select('*')
    .order('name');
  
  if (error) throw new Error(error.message);
  return data;
};

export const fetchArtistSongs = async (artistId: number) => {
  const { data, error } = await supabase
    .from('partitions')
    .select('*, artists(name)')
    .eq('artist_id', artistId)
    .order('title');
  
  if (error) throw new Error(error.message);
  
  return data.map((partition) => ({
    ...partition,
    artist_name: partition.artists?.name
  }));
};

export const fetchAllArtistsSongs = async () => {
  const { data, error } = await supabase
    .from('partitions')
    .select('*, artists(name)')
    .order('title');
  
  if (error) throw new Error(error.message);
  
  return data.map((partition) => ({
    ...partition,
    artist_name: partition.artists?.name
  }));
};

export const fetchSongDetails = async (songId: number) => {
  if (!songId) {
    throw new Error('Song ID is required');
  }

  // Fetch the partition details
  const { data: partition, error: partitionError } = await supabase
    .from('partitions')
    .select('*, artists(name)')
    .eq('id', songId)
    .single();
    
  if (partitionError) throw new Error(partitionError.message);
  
  // Fetch the chords for this partition
  const { data: chords, error: chordsError } = await supabase
    .from('partition_chords')
    .select('*')
    .eq('partition_id', songId)
    .order('position');
    
  if (chordsError) throw new Error(chordsError.message);
  
  // Combine the data
  const songDetails = {
    title: partition.title,
    artist: partition.artists?.name,
    views: partition.views,
    recentViews: partition.recent_views,
    isFavorite: false,
    tuning: partition.tuning,
    key: partition.key_signature,
    capo: partition.capo,
    tempo: partition.tempo,
    timeSignature: partition.time_signature,
    rhythm: partition.rhythm,
    lyrics: partition.lyrics,
    album: partition.album,
    year: partition.year,
    difficulty: partition.difficulty,
    youtubeLink: partition.youtube_link,
    chords: chords.map((chord) => ({
      chord: chord.chord,
      fingering: chord.fingering
    }))
  };
  
  // Check if song is favorited using maybeSingle() instead of single()
  const { data: favorite } = await supabase
    .from('favorites')
    .select('partition_id')
    .eq('partition_id', songId)
    .maybeSingle();
    
  songDetails.isFavorite = !!favorite;
  
  // Enregistrer la vue avec la nouvelle fonction
  const { error: viewError } = await supabase
    .rpc('record_view', { p_partition_id: songId });
    
  if (viewError) console.error("Erreur lors de l'enregistrement de la vue:", viewError);
  
  return songDetails;
};

export const toggleFavorite = async (songId: number) => {
  if (!songId) {
    throw new Error('Song ID is required');
  }

  const { data: favorite } = await supabase
    .from('favorites')
    .select('partition_id')
    .eq('partition_id', songId)
    .maybeSingle();
    
  if (favorite) {
    await supabase
      .from('favorites')
      .delete()
      .eq('partition_id', songId);
    return false;
  } else {
    await supabase
      .from('favorites')
      .insert({ partition_id: songId });
    return true;
  }
};

export const addSongSheet = async (
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
) => {
  const chordNames = chords.map(c => c.chord);
  const fingerings = chords.map(c => c.fingering);
  
  const { data, error } = await supabase
    .rpc('add_partition', {
      p_artist: artist,
      p_title: title,
      p_tuning: tuning,
      p_key: key,
      p_capo: capo,
      p_tempo: tempo,
      p_time_signature: timeSignature,
      p_rhythm: rhythm,
      p_lyrics: lyrics,
      p_chords: chordNames,
      p_fingerings: fingerings,
      p_album: album,
      p_year: year,
      p_difficulty: difficulty,
      p_youtube_link: youtubeLink
    });
    
  if (error) throw new Error(error.message);
  return data;
};

export const fetchRandomArtist = async () => {
  try {
    // D'abord essayer avec la fonction RPC
    console.log("Tentative de récupération des artistes avec RPC");
    const { data: artists, error } = await supabase
      .rpc('get_artists_with_songs');

    if (error) {
      console.warn("Erreur RPC, utilisation de la méthode alternative:", error);
      
      // Méthode alternative si la fonction RPC n'est pas disponible
      const { data: artistsAlt, error: errorAlt } = await supabase
        .from('artists')
        .select('id, name')
        .order('name');
        
      if (errorAlt) throw new Error(errorAlt.message);
      
      // Filtrer les artistes pour ne garder que ceux avec des partitions
      const artistsWithSongs = [];
      
      for (const artist of artistsAlt) {
        const { count, error: countError } = await supabase
          .from('partitions')
          .select('id', { count: 'exact', head: true })
          .eq('artist_id', artist.id);
          
        if (!countError && count && count > 0) {
          artistsWithSongs.push({
            ...artist,
            song_count: count
          });
        }
      }
      
      if (artistsWithSongs.length === 0) return null;
      
      // Sélectionner un artiste aléatoire
      const randomIndex = Math.floor(Math.random() * artistsWithSongs.length);
      return artistsWithSongs[randomIndex];
    }
    
    if (!artists || artists.length === 0) return null;
    
    // Sélectionner un artiste aléatoire
    const randomIndex = Math.floor(Math.random() * artists.length);
    return artists[randomIndex];
  } catch (e) {
    console.error("Erreur lors de la récupération d'un artiste aléatoire:", e);
    
    // Dernière tentative : récupérer n'importe quel artiste
    try {
      const { data: anyArtist, error: anyError } = await supabase
        .from('artists')
        .select('*')
        .limit(1)
        .single();
        
      if (anyError) throw anyError;
      
      return {
        id: anyArtist.id,
        name: anyArtist.name,
        song_count: 1
      };
    } catch (fallbackError) {
      console.error("Échec complet de la récupération d'artiste:", fallbackError);
      return null;
    }
  }
};

// Récupérer les partitions d'un artiste spécifique
export const fetchArtistPartitions = async (artistId: number) => {
  const { data, error } = await supabase
    .from('partitions')
    .select('id, title, views, recent_views, created_at')
    .eq('artist_id', artistId)
    .order('title');
    
  if (error) throw new Error(error.message);
  
  return data;
};

// Récupérer les partitions récemment ajoutées
export const fetchRecentPartitions = async (limit = 10) => {
  try {
    // Essayer d'abord d'utiliser la vue simplifiée
    const { data, error } = await supabase
      .from('recent_partitions')
      .select('*')
      .limit(limit);
    
    if (!error && data) {
      return data;
    }
    
    // Fallback à la requête standard
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('partitions')
      .select('*, artists(name)')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (fallbackError) throw new Error(fallbackError.message);
    
    return fallbackData.map(partition => ({
      ...partition,
      artist_name: partition.artists?.name
    }));
  } catch (e) {
    console.error("Erreur lors de la récupération des partitions récentes:", e);
    
    // Récupérer simplement les partitions sans tri spécifique
    const { data: anyData, error: anyError } = await supabase
      .from('partitions')
      .select('*, artists(name)')
      .limit(limit);
      
    if (anyError) throw new Error(anyError.message);
    
    return anyData.map(partition => ({
      ...partition,
      artist_name: partition.artists?.name
    }));
  }
};

// Récupérer les partitions les plus populaires
export const fetchPopularPartitions = async (limit = 10) => {
  try {
    // Essayer d'abord d'utiliser la vue simplifiée
    const { data, error } = await supabase
      .from('popular_partitions')
      .select('*')
      .limit(limit);
    
    if (!error && data) {
      return data;
    }
    
    // Fallback à la requête standard
    const { data: fallbackData, error: fallbackError } = await supabase
      .from('partitions')
      .select('*, artists(name)')
      .order('views', { ascending: false })
      .limit(limit);
      
    if (fallbackError) throw new Error(fallbackError.message);
    
    return fallbackData.map(partition => ({
      ...partition,
      artist_name: partition.artists?.name,
      recent_views: partition.recent_views || 0
    }));
  } catch (e) {
    console.error("Erreur lors de la récupération des partitions populaires:", e);
    
    // Récupérer simplement les partitions sans tri spécifique
    const { data: anyData, error: anyError } = await supabase
      .from('partitions')
      .select('*, artists(name)')
      .limit(limit);
      
    if (anyError) throw new Error(anyError.message);
    
    return anyData.map(partition => ({
      ...partition,
      artist_name: partition.artists?.name,
      recent_views: partition.recent_views || 0
    }));
  }
};

export const updateSongSheet = async (
  songId: number,
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
) => {
  // First, ensure we have the correct artist ID
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
      throw new Error("Erreur lors de la création de l'artiste");
    }
    
    artistId = newArtist.id;
  } else {
    artistId = existingArtist.id;
  }

  // Then update the partition with the correct artist_id
  const { error: updateError } = await supabase
    .from('partitions')
    .update({
      artist_id: artistId,
      title,
      tuning,
      key_signature: key,
      capo,
      tempo,
      time_signature: timeSignature,
      rhythm,
      lyrics,
      album,
      year,
      difficulty,
      youtube_link: youtubeLink
    })
    .eq('id', songId);

  if (updateError) throw new Error(updateError.message);

  // First delete all existing chords for this partition before re-inserting
  const { error: deleteError } = await supabase
    .from('partition_chords')
    .delete()
    .eq('partition_id', songId);

  if (deleteError) {
    console.error('Erreur lors de la suppression des accords existants:', deleteError.message);
    throw new Error(deleteError.message);
  }

  // Prepare the new chords data
  const chordsToInsert = chords.map((chord, index) => ({
    partition_id: songId,
    chord: chord.chord,
    fingering: chord.fingering,
    position: index
  }));

  const { error: insertError } = await supabase
    .from('partition_chords')
    .insert(chordsToInsert);

  if (insertError) throw new Error(insertError.message);
  
  return { success: true };
};