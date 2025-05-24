import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import SongSheet from './SongSheet';
import { useSongStore } from '../stores/songStore';
import { fetchArtists, fetchAllArtistsSongs } from '../services/songService';

const Layout: React.FC = () => {
  const { 
    setArtists, 
    setSongs, 
    setIsLoading, 
    setError,
    artists,
    songs,
    isLoading
  } = useSongStore();

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        // Fetch artists
        const artistsData = await fetchArtists();
        setArtists(artistsData);
        
        // Fetch all songs
        const songsData = await fetchAllArtistsSongs();
        setSongs(songsData);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  return (
    <motion.div 
      className="flex flex-col md:flex-row min-h-screen max-h-screen overflow-hidden max-w-[1680px] mx-auto bg-bg-light"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {isLoading && (
        <div className="fixed inset-0 bg-bg-light bg-opacity-80 flex items-center justify-center z-50">
          <div className="text-accent text-xl">Chargement...</div>
        </div>
      )}
      
      <Sidebar />
      <SongSheet />
    </motion.div>
  );
};

export default Layout;