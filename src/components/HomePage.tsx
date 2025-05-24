import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic, faGuitar, faExternalLinkAlt, faPlus, faClock, faFire, faCalendarAlt, faUser } from '@fortawesome/free-solid-svg-icons';
import { useSongStore } from '../stores/songStore';
import { fetchRandomArtist, fetchArtistPartitions, fetchRecentPartitions, fetchPopularPartitions } from '../services/songService';
import { supabase } from '../config/supabase';

const HomePage: React.FC = () => {
  const { artists, songs, setSelectedSong } = useSongStore();
  const [featuredArtist, setFeaturedArtist] = useState<any>(null);
  const [artistPartitions, setArtistPartitions] = useState<any[]>([]);
  const [recentSongs, setRecentSongs] = useState<any[]>([]);
  const [popularSongs, setPopularSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState({
    artist: true,
    recent: true,
    popular: true
  });
  const [error, setError] = useState({
    artist: false,
    recent: false,
    popular: false
  });

  useEffect(() => {
    // Chargement de l'artiste du jour
    const loadFeaturedArtist = async () => {
      try {
        // Version simplifiée qui utilise simplement un artiste aléatoire parmi ceux disponibles
        if (artists.length > 0) {
          const artistsWithSongs = artists.filter(artist => 
            songs.some(song => song.artist_id === artist.id)
          );
          
          if (artistsWithSongs.length > 0) {
            const randomIndex = Math.floor(Math.random() * artistsWithSongs.length);
            const randomArtist = artistsWithSongs[randomIndex];
            
            setFeaturedArtist(randomArtist);
            
            // Récupérer les partitions de cet artiste
            const artistSongs = songs.filter(song => song.artist_id === randomArtist.id);
            setArtistPartitions(artistSongs.slice(0, 5));
          }
        }
      } catch (e) {
        console.error("Erreur de chargement de l'artiste du jour:", e);
        setError(prev => ({ ...prev, artist: true }));
      } finally {
        setLoading(prev => ({ ...prev, artist: false }));
      }
    };

    // Chargement des partitions récentes - version simplifiée et robuste
    const loadRecentPartitions = async () => {
      try {
        setLoading(prev => ({ ...prev, recent: true }));
        console.log("Chargement des partitions récentes");
        
        // Essayons d'abord avec la vue SQL
        try {
          const { data, error } = await supabase
            .from('recent_partitions')
            .select('*');
          
          if (!error && data && data.length > 0) {
            console.log("Données récentes récupérées depuis la vue SQL:", data.length);
            setRecentSongs(data);
            return;
          }
        } catch (viewError) {
          console.warn("Erreur avec la vue SQL, utilisation de la méthode alternative:", viewError);
        }
        
        // Essayons avec le service
        try {
          const recentData = await fetchRecentPartitions(10);
          if (recentData && recentData.length > 0) {
            console.log("Données récentes récupérées depuis le service:", recentData.length);
            setRecentSongs(recentData);
            return;
          }
        } catch (serviceError) {
          console.warn("Erreur avec le service, utilisation du tri en mémoire:", serviceError);
        }
        
        // En dernier recours, trier les chansons en mémoire
        console.log("Tri des chansons par date en mémoire");
        const recent = [...songs].sort((a, b) => {
          const dateA = new Date(a.created_at || 0);
          const dateB = new Date(b.created_at || 0);
          return dateB.getTime() - dateA.getTime();
        }).slice(0, 10);
        
        setRecentSongs(recent);
      } catch (e) {
        console.error("Erreur complète de chargement des partitions récentes:", e);
        setError(prev => ({ ...prev, recent: true }));
      } finally {
        setLoading(prev => ({ ...prev, recent: false }));
      }
    };

    // Chargement des partitions populaires - version simplifiée et robuste
    const loadPopularPartitions = async () => {
      try {
        setLoading(prev => ({ ...prev, popular: true }));
        console.log("Chargement des partitions populaires");
        
        // Essayons d'abord avec la vue SQL
        try {
          const { data, error } = await supabase
            .from('popular_partitions')
            .select('*');
          
          if (!error && data && data.length > 0) {
            console.log("Données populaires récupérées depuis la vue SQL:", data.length);
            setPopularSongs(data);
            return;
          }
        } catch (viewError) {
          console.warn("Erreur avec la vue SQL, utilisation de la méthode alternative:", viewError);
        }
        
        // Essayons avec le service
        try {
          const popularData = await fetchPopularPartitions(10);
          if (popularData && popularData.length > 0) {
            console.log("Données populaires récupérées depuis le service:", popularData.length);
            setPopularSongs(popularData);
            return;
          }
        } catch (serviceError) {
          console.warn("Erreur avec le service, utilisation du tri en mémoire:", serviceError);
        }
        
        // En dernier recours, trier les chansons en mémoire
        console.log("Tri des chansons par vues en mémoire");
        const popular = [...songs].sort((a, b) => b.views - a.views).slice(0, 10);
        
        setPopularSongs(popular);
      } catch (e) {
        console.error("Erreur complète de chargement des partitions populaires:", e);
        setError(prev => ({ ...prev, popular: true }));
      } finally {
        setLoading(prev => ({ ...prev, popular: false }));
      }
    };

    loadFeaturedArtist();
    loadRecentPartitions();
    loadPopularPartitions();
  }, [songs]);

  // Fonction pour formater la date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "Date inconnue";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch (e) {
      return "Date invalide";
    }
  };

  // Trouver l'artiste et l'index de la chanson pour la sélection
  const handleSongSelect = (songId: number, artistId: number) => {
    try {
      const artistIndex = artists.findIndex(a => a.id === artistId);
      if (artistIndex !== -1) {
        const artistSongs = songs.filter(s => s.artist_id === artistId);
        const songIndex = artistSongs.findIndex(s => s.id === songId);
        
        if (songIndex !== -1) {
          setSelectedSong([artistIndex, songIndex]);
        }
      }
    } catch (error) {
      console.error("Error selecting song:", error);
    }
  };

  return (
    <motion.div
      className="w-full max-w-5xl mx-auto p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-['JustFine'] text-[#CD2928] mb-4">Bienvenue sur Chordo</h1>
        <p className="text-xl text-text-dark mb-6">
          Votre bibliothèque de partitions pour guitare
        </p>
        
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            try {
              window.history.pushState({}, '', '/add');
              window.dispatchEvent(new Event('popstate'));
            } catch (error) {
              console.error("Navigation error:", error);
            }
          }}
          className="inline-flex items-center gap-2 text-accent hover:text-accent-dark transition-colors px-6 py-3 border-2 border-accent hover:border-accent-dark rounded-full"
        >
          <FontAwesomeIcon icon={faPlus} />
          <span className="font-['JustFine'] text-xl">Créer une partition</span>
        </a>
      </div>

      {/* Artiste du jour */}
      <section className="mb-16">
        <div className="flex items-center gap-4 text-text-dark mb-6">
          <div className="h-[2px] w-8 bg-current opacity-50" />
          <h2 className="text-3xl font-['JustFine'] whitespace-nowrap tracking-wide">Artiste du jour</h2>
          <div className="h-[2px] flex-1 bg-current opacity-50" />
        </div>

        {loading.artist ? (
          <div className="bg-bg-muted rounded-lg p-6 h-64 flex items-center justify-center">
            <p className="text-text-muted text-xl">Chargement...</p>
          </div>
        ) : error.artist ? (
          <div className="bg-bg-muted rounded-lg p-6 h-64 flex items-center justify-center">
            <p className="text-text-muted text-xl">Impossible de charger l'artiste du jour</p>
          </div>
        ) : featuredArtist ? (
          <div className="bg-bg-muted rounded-lg overflow-hidden shadow-md">
            <div className="md:flex">
              <div className="md:w-1/3 h-64 relative flex items-center justify-center bg-[#F3F0E0]">
                {/* Icône générique d'artiste */}
                <FontAwesomeIcon 
                  icon={faUser} 
                  className="text-[#D5C7AA] text-9xl"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-3xl font-['JustFine'] text-[#CD2928] bg-[#F3F0E0] bg-opacity-80 p-2 rounded">
                    {featuredArtist.name}
                  </h3>
                </div>
              </div>
              <div className="md:w-2/3 p-6">
                <div className="mb-4">
                  <span className="inline-flex items-center bg-[#F8F4E3] text-text-dark px-2 py-1 rounded text-sm">
                    <FontAwesomeIcon icon={faMusic} className="mr-1" />
                    {artistPartitions.length} {artistPartitions.length === 1 ? 'partition' : 'partitions'} disponible{artistPartitions.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                {/* Partitions de l'artiste */}
                {artistPartitions && artistPartitions.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold mb-2">Partitions disponibles:</h4>
                    <ul className="space-y-1">
                      {artistPartitions.map((partition) => (
                        <li key={partition.id} className="text-accent hover:text-accent-dark cursor-pointer">
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleSongSelect(partition.id, featuredArtist.id);
                            }}
                          >
                            {partition.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-bg-muted rounded-lg p-6 h-64 flex items-center justify-center">
            <p className="text-text-muted text-xl">Aucun artiste disponible</p>
          </div>
        )}
      </section>

      {/* Sections Récentes et Populaires côte à côte */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        {/* Partitions récentes */}
        <section>
          <div className="flex items-center gap-4 text-text-dark mb-6">
            <div className="h-[2px] w-4 bg-current opacity-50" />
            <h2 className="text-2xl font-['JustFine'] whitespace-nowrap tracking-wide flex items-center gap-2">
              <FontAwesomeIcon icon={faCalendarAlt} className="text-[#CD2928]" />
              Partitions récentes
            </h2>
            <div className="h-[2px] flex-1 bg-current opacity-50" />
          </div>

          {loading ? (
            <div className="bg-bg-muted rounded-lg p-6 h-20 flex items-center justify-center">
              <p className="text-text-muted">Chargement...</p>
            </div>
          ) : recentSongs.length > 0 ? (
            <div className="bg-bg-muted rounded-lg overflow-hidden">
              <ul className="divide-y divide-[#E5E0C0]">
                {recentSongs.map((song) => (
                  <li 
                    key={song.id}
                    className="hover:bg-[#F3F0E0] cursor-pointer p-3"
                    onClick={() => handleSongSelect(song.id, song.artist_id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-['JustFine'] text-accent">{song.title}</h3>
                        <p className="text-text-dark text-sm">
                          {artists.find(a => a.id === song.artist_id)?.name || "Artiste inconnu"}
                        </p>
                      </div>
                      <div className="text-xs text-text-muted">
                        {formatDate(song.created_at)}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-bg-muted rounded-lg p-6 h-20 flex items-center justify-center">
              <p className="text-text-muted">Aucune partition récente</p>
            </div>
          )}
        </section>

        {/* Partitions populaires */}
        <section>
          <div className="flex items-center gap-4 text-text-dark mb-6">
            <div className="h-[2px] w-4 bg-current opacity-50" />
            <h2 className="text-2xl font-['JustFine'] whitespace-nowrap tracking-wide flex items-center gap-2">
              <FontAwesomeIcon icon={faFire} className="text-[#CD2928]" />
              Partitions populaires
            </h2>
            <div className="h-[2px] flex-1 bg-current opacity-50" />
          </div>

          {loading ? (
            <div className="bg-bg-muted rounded-lg p-6 h-20 flex items-center justify-center">
              <p className="text-text-muted">Chargement...</p>
            </div>
          ) : popularSongs.length > 0 ? (
            <div className="bg-bg-muted rounded-lg overflow-hidden">
              <ul className="divide-y divide-[#E5E0C0]">
                {popularSongs.map((song) => (
                  <li 
                    key={song.id}
                    className="hover:bg-[#F3F0E0] cursor-pointer p-3"
                    onClick={() => handleSongSelect(song.id, song.artist_id)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-['JustFine'] text-accent">{song.title}</h3>
                        <p className="text-text-dark text-sm">
                          {artists.find(a => a.id === song.artist_id)?.name || "Artiste inconnu"}
                        </p>
                      </div>
                      <div className="text-xs text-text-muted">
                        {song.views || 0} vue(s)
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-bg-muted rounded-lg p-6 h-20 flex items-center justify-center">
              <p className="text-text-muted">Aucune partition populaire</p>
            </div>
          )}
        </section>
      </div>

      {/* Section du pied de page */}
      <footer className="text-center text-text-muted">
        <p>© {new Date().getFullYear()} Chordo - Toutes les partitions et les données sont fournies à des fins éducatives.</p>
      </footer>
    </motion.div>
  );
};

export default HomePage;
