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
  const { currentSongDetails, setCurrentSongDetails, setSelectedSong } = useSongStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const scrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate scroll speed based on tempo
  const getScrollSpeed = useCallback(() => {
    if (!currentSongDetails?.tempo) return 1;
    const bpm = parseInt(currentSongDetails.tempo.match(/\d+/)?.[0] || '120');
    if (isNaN(bpm)) return 1;
    return (bpm / 60 / 1000) * speedMultiplier * 30; // px per ms
  }, [currentSongDetails?.tempo, speedMultiplier]);

  // Auto-scroll effect
  useEffect(() => {
    if (isScrolling) {
      scrollIntervalRef.current = setInterval(() => {
        const container = containerRef.current;
        if (container) {
          const speed = getScrollSpeed();
          const delta = speed * 16; // approx 60fps
          container.scrollTop += delta;
          // Stop at bottom
          if (container.scrollTop + container.clientHeight >= container.scrollHeight) {
            setIsScrolling(false);
          }
        }
      }, 16);
    } else if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current);
      scrollIntervalRef.current = null;
    }
    return () => {
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };
  }, [isScrolling, getScrollSpeed]);

  // Handlers
  const handleSpeedChange = (change: number) => {
    setSpeedMultiplier(prev => Math.max(0.25, prev + change));
  };

  const handleReset = () => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
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
      const updated = await toggleFavorite(currentSongDetails.id);
      setCurrentSongDetails(updated);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  }, [currentSongDetails, setCurrentSongDetails]);

  if (!currentSongDetails) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-full"
    >
      <Header
        title={currentSongDetails.title}
        artist={currentSongDetails.artist}
        isFavorite={currentSongDetails.isFavorite}
        onFavoriteClick={handleFavoriteClick}
      />

      <TechnicalDetails
        tempo={currentSongDetails.tempo}
        timeSignature={currentSongDetails.timeSignature}
        capo={currentSongDetails.capo}
        key={currentSongDetails.tempo}
      />

      <div ref={containerRef} className="flex-1 overflow-y-auto">
        <ChordGrid chords={currentSongDetails.chords} />
        <Lyrics lyrics={currentSongDetails.lyrics} />
      </div>

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
