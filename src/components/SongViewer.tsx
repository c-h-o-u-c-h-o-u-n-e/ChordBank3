import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useSongStore } from '../stores/songStore';
import { toggleFavorite } from '../services/songService';
import Header from './viewer/Header';
import TechnicalDetails from './viewer/TechnicalDetails';
import ChordGrid from './viewer/ChordGrid';
import Lyrics from './viewer/Lyrics';
import AutoScrollControls from './viewer/AutoScrollControls';

const SongViewer: React.FC = () => {
  const { currentSongDetails, setCurrentSongDetails, setIsEditing, selectedSong } = useSongStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const intervalRef = useRef<number | null>(null);

  // Calculate base speed: 1px per interval for a song at 60bpm
  const getScrollSpeed = useCallback(() => {
    if (!currentSongDetails?.tempo) return 1;
    
    // Extract the BPM from the tempo string
    let bpm = 60;
    try {
      const tempoStr = currentSongDetails.tempo.toString(); 
      const match = tempoStr.match(/\d+/);
      if (match) {
        bpm = parseInt(match[0], 10);
        if (isNaN(bpm)) bpm = 60;
      }
    } catch (e) {
      console.error("Error parsing tempo:", e);
      bpm = 60;
    }
    
    // Simple calculation: faster tempo = faster scrolling
    return Math.max(1, bpm / 60) * speedMultiplier;
  }, [currentSongDetails?.tempo, speedMultiplier]);

  // Scroll manager effect
  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (isScrolling && containerRef.current) {
      const speed = getScrollSpeed();
      
      // Use plain old setInterval - simpler and more reliable
      intervalRef.current = window.setInterval(() => {
        if (containerRef.current) {
          // Scroll by the calculated amount
          containerRef.current.scrollBy({ top: speed, behavior: 'auto' });
          
          // Check if we've reached the bottom
          const container = containerRef.current;
          if (container.scrollTop + container.clientHeight >= container.scrollHeight - 10) {
            setIsScrolling(false);
          }
        }
      }, 30); // Standard interval, medium smoothness
    }
    
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [isScrolling, getScrollSpeed]);
  
  const handleSpeedChange = (change: number) => {
    setSpeedMultiplier(prev => Math.max(0.25, Math.min(5, prev + change)));
  };

  const handleReset = () => {
    // Stop scrolling
    setIsScrolling(false);
    
    // Clear interval
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Scroll back to top - with smooth behavior
    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleToggleScroll = () => {
    setIsScrolling(prev => !prev);
  };

  const handleFavoriteClick = useCallback(async () => {
    if (!currentSongDetails || typeof currentSongDetails.id !== 'number') {
      console.warn('No song selected or invalid song ID');
      return;
    }
    
    try {
      const isFavorite = await toggleFavorite(currentSongDetails.id);
      setCurrentSongDetails({ ...currentSongDetails, isFavorite });
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [currentSongDetails, setCurrentSongDetails]);

  const handleEditClick = useCallback(() => {
    if (!currentSongDetails || !selectedSong) {
      console.warn('No song selected');
      return;
    }
    
    // Set editing mode
    setIsEditing(true);
    
    // Log for debugging
    console.log("Entering edit mode for song:", selectedSong[1]);
  }, [currentSongDetails, selectedSong, setIsEditing]);

  if (!currentSongDetails) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-text-muted">Sélectionnez une chanson pour voir les détails</p>
      </div>
    );
  }

  return (
    <motion.div
      ref={containerRef}
      className="bg-bg-light text-text-dark min-h-screen font-[NewPoppins] overflow-y-auto custom-scrollbar"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        pre { padding-left: 68px; position: relative; }
      `}</style>

      <div className="sticky top-0 z-10 bg-bg-light shadow-md">
        <Header 
          songDetails={currentSongDetails} 
          onFavoriteClick={handleFavoriteClick}
          onEditClick={handleEditClick}
        />
      </div>

      <div className="p-6 mb-2">
        <div className="flex flex-col lg:flex-row gap-6">
          <TechnicalDetails
            tuning={currentSongDetails.tuning}
            key={currentSongDetails.key}
            capo={currentSongDetails.capo}
            tempo={currentSongDetails.tempo}
            timeSignature={currentSongDetails.timeSignature}
            rhythm={currentSongDetails.rhythm}
          />
          <ChordGrid chords={currentSongDetails.chords} />
        </div>
      </div>

      <Lyrics lyrics={currentSongDetails.lyrics} />
      
      <AutoScrollControls
        isScrolling={isScrolling}
        speedMultiplier={speedMultiplier}
        onToggleScroll={handleToggleScroll}
        onSpeedChange={handleSpeedChange}
        onReset={handleReset}
      />
    </motion.div>
  );
};

export default SongViewer;