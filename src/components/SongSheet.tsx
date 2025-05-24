import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMusic, faPen } from '@fortawesome/free-solid-svg-icons';
import SongForm from './SongForm';
import SongViewer from './SongViewer';
import HomePage from './HomePage';
import { useSongStore } from '../stores/songStore';

const SongSheet: React.FC = () => {
  const { currentSongDetails, selectedSong, isEditing, setIsEditing } = useSongStore();

  // Force render correct view when editing state changes or URL changes
  useEffect(() => {
    console.log("SongSheet rendering, isEditing:", isEditing, "selectedSong:", selectedSong);
    
    // Fonction pour gérer les changements d'URL
    const handleLocationChange = () => {
      // Si on est sur /add, on veut afficher le formulaire d'ajout
      if (window.location.pathname === '/add' && !isEditing) {
        console.log("URL is /add, showing form");
        // On force un rendu
        setIsEditing(false);
      }
    };
    
    // Écouter les changements d'URL
    window.addEventListener('popstate', handleLocationChange);
    
    // Vérifier l'URL actuelle
    handleLocationChange();
    
    // Nettoyage
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [isEditing, selectedSong, setIsEditing]);

  return (
    <motion.div
      className="flex-1 overflow-y-auto p-6 bg-bg-light"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <style>
        {`
        ::-webkit-scrollbar {
          display: none;
        }
        * {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}
      </style>
      {selectedSong && !isEditing ? (
        <SongViewer key="song-viewer" />
      ) : isEditing || (!selectedSong && window.location.pathname === '/add') ? (
        <div key="song-form" className="w-full h-full">
          <div className="mb-6">
            <div className="flex items-center justify-center mb-2">
              <FontAwesomeIcon 
                icon={isEditing ? faPen : faMusic} 
                className="text-text-dark mr-4 text-3xl" 
              />
              <h2 className="text-3xl font-['JustFine'] text-text-dark text-center">
                {isEditing ? 'Modification de la partition' : 'Création d\'une nouvelle partition'}
              </h2>
            </div>
            {/* Le bouton d'annulation sera ajouté à côté du bouton de sauvegarde */}
          </div>
          <SongForm isEditing={isEditing} />
        </div>
      ) : (
        <HomePage key="home-page" />
      )}
    </motion.div>
  );
};

export default SongSheet;
