import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight, faChevronDown, faGuitar, faCircle, faSearch } from '@fortawesome/free-solid-svg-icons';
import { useSongStore } from '../stores/songStore';
import { fetchSongDetails } from '../services/songService';

const Sidebar: React.FC = () => {
  const { 
    artists, 
    songs, 
    openArtistIndex, 
    selectedSong,
    setOpenArtistIndex, 
    setSelectedSong,
    setCurrentSongDetails,
    setIsLoading,
    setError,
  } = useSongStore();
  
  // Group songs by artist
  const [groupedSongs, setGroupedSongs] = useState<{ artist: string; artist_id: number; songs: string[]; songIds: number[] }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollTop = target.scrollTop;
    setScrollPosition(scrollTop);
  };
  
  useEffect(() => {
    if (artists.length > 0 && songs.length > 0) {
      const songsByArtist = artists.map(artist => {
        const artistSongs = songs.filter(song => song.artist_id === artist.id);
        return {
          artist: artist.name,
          artist_id: artist.id,
          songs: artistSongs.map(song => song.title),
          songIds: artistSongs.map(song => song.id)
        };
      }).filter(group => group.songs.length > 0);
      
      setGroupedSongs(songsByArtist);
    }
  }, [artists, songs]);

  const filteredGroupedSongs = groupedSongs.map(group => ({
    ...group,
    songs: group.songs.filter(song => 
      song.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.artist.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    songIds: group.songIds.filter((_, index) => 
      group.songs[index].toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.artist.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(group => group.songs.length > 0);

  const handleSongSelect = async (artistIndex: number, songIndex: number) => {
    // Get the current state
    const { isEditing, setIsEditing } = useSongStore.getState();
    
    // If in edit mode, exit edit mode
    if (isEditing) {
      setIsEditing(false);
    }
    
    // Set the selected song
    setSelectedSong([artistIndex, songIndex]);
    
    try {
      setIsLoading(true);
      const songId = groupedSongs[artistIndex].songIds[songIndex];
      const songDetails = await fetchSongDetails(songId);
      setCurrentSongDetails(songDetails);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred fetching song details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="w-full md:w-1/4 lg:w-1/5 bg-bg-light flex flex-col h-screen"
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-4 flex-shrink-0 space-y-4">
        <div className="flex justify-center items-center py-8">
          <a 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              try {
                // Force navigation to root
                window.history.pushState({}, '', '/');
                window.dispatchEvent(new Event('popstate'));

                // Reset all prioritized selections and states
                setSelectedSong(null);
                useSongStore.getState().setCurrentSongDetails(null);
                useSongStore.getState().setIsEditing(false);
                useSongStore.getState().setOpenArtistIndex(null);
              } catch (error) {
                console.error("Navigation error:", error);
              }
            }}
            className="cursor-pointer"
          >
            <img 
              src="https://laxlygdxuifvzbjvsvjd.supabase.co/storage/v1/object/public/images//cb.png" 
              alt="Logo" 
              className="h-40 transition-transform duration-300 hover:scale-105"
            />
          </a>
        </div>
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher..."
            className="w-full bg-transparent pl-10 pr-4 py-2 text-[var(--text-dark)] text-opacity-100 placeholder-text-muted focus:outline-none mx-0 border-b-2 border-[var(--text-dark)] text-lg"
          />
          <FontAwesomeIcon
            icon={faSearch}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-dark)] opacity-100"
          />
        </div>
      </div>
        
      <div 
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto overflow-x-hidden relative custom-scrollbar"
        style={{ 
          maskImage: 'linear-gradient(to bottom, transparent, black 12px, black calc(100% - 12px), transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 12px, black calc(100% - 12px), transparent)'
        }}
        onScroll={handleScroll}
      >
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            display: none;
          }
        `}</style>
        <div className="space-y-1 pt-2 pb-6">
          {filteredGroupedSongs.map((group, idx) => {
            const isOpen = openArtistIndex === idx;
            const isDimmed = openArtistIndex !== null && openArtistIndex !== idx;
            const artistOpacity = isDimmed ? 'opacity-[30%] hover:opacity-[70%]' : 'opacity-[90%]';
            
            return (
              <div key={group.artist} className={`${artistOpacity} transition-opacity`}>
                <button
                  onClick={() => setOpenArtistIndex(isOpen ? null : idx)}
                  className="flex items-center w-full text-left px-4 py-2 rounded-xl"
                >
                  <FontAwesomeIcon
                    icon={isOpen ? faChevronDown : faChevronRight}
                    className="text-xs w-4 pl-2 text-text-dark"
                  />
                  <span className="ml-4 font-['JustFine'] text-2xl text-[#CD2928]">
                    {group.artist}
                  </span>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-1 space-y-1"
                    >
                      {group.songs.map((song, j) => {
                        const isThisSelected = selectedSong?.[0] === idx && selectedSong?.[1] === j;
                        const textClass = isThisSelected
                          ? 'text-text-dark opacity-100' 
                          : selectedSong && selectedSong[0] === idx
                            ? 'text-text-dark opacity-40 group-hover:opacity-70'
                            : 'text-text-dark opacity-100';
                        const circleColor = isThisSelected
                          ? 'text-[#CD2928]'
                          : 'text-[#CD2928] opacity-0 group-hover:opacity-70';
                          
                        return (
                          <motion.li
                            key={song}
                            className="relative group cursor-pointer"
                            onClick={() => handleSongSelect(idx, j)}
                          >
                            <FontAwesomeIcon
                              icon={faCircle}
                              className={`absolute left-[24px] top-1/2 -translate-y-1/2 text-[8px] transition-opacity ${circleColor}`}
                            />
                            <span className={`block pl-[48px] py-1 ${textClass} rounded font-['JustFine'] text-xl`}>
                              {song}
                            </span>
                          </motion.li>
                        );
                      })}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar;