import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faBug } from '@fortawesome/free-solid-svg-icons';
import { debugAddPartition } from '../debug-songform';
import { useSongStore } from '../stores/songStore';
import { ChordEntry } from '../types/database.types';
import { fetchArtists, fetchAllArtistsSongs, updateSongSheet, fetchSongDetails } from '../services/songService';
import { directAddSongSheet } from '../services/directSubmitService';
import TechnicalDetails from './form/TechnicalDetails';
import TabSection from './form/TabSection';
import ChordSection from './form/ChordSection';
import SuggestedChords from './form/SuggestedChords';
import { tunings, tonalities, capoOptions, measureOptions } from './form/constants';

interface SongFormProps {
  isEditing?: boolean;
}

const SongForm: React.FC<SongFormProps> = ({ isEditing = false }) => {
  const { artists, setIsLoading, setError, currentSongDetails, selectedSong, setIsEditing, setCurrentSongDetails } = useSongStore();
  
  const [newArtist, setNewArtist] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [newAlbum, setNewAlbum] = useState("");
  const [newYear, setNewYear] = useState("");
  const [newTuning, setNewTuning] = useState("");
  const [newKeySignature, setNewKeySignature] = useState("");
  const [newCapo, setNewCapo] = useState("");
  const [newTempo, setNewTempo] = useState("");
  const [newTimeSignature, setNewTimeSignature] = useState("");
  const [newRhythm, setNewRhythm] = useState("");
  const [newDifficulty, setNewDifficulty] = useState("");
  const [newYoutubeLink, setNewYoutubeLink] = useState("");
  const [newLyrics, setNewLyrics] = useState("");
  const [chordEntries, setChordEntries] = useState<ChordEntry[]>([{ chord: "", fingering: "" }]);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Load current song details into form when in edit mode
  useEffect(() => {
    if (isEditing && currentSongDetails) {
      setNewArtist(currentSongDetails.artist || "");
      setNewTitle(currentSongDetails.title || "");
      setNewAlbum(currentSongDetails.album || "");
      setNewYear(currentSongDetails.year?.toString() || "");
      setNewTuning(currentSongDetails.tuning || "");
      setNewKeySignature(currentSongDetails.key || "");
      setNewCapo(currentSongDetails.capo || "");
      setNewTempo(currentSongDetails.tempo || "");
      setNewTimeSignature(currentSongDetails.timeSignature || "");
      setNewRhythm(currentSongDetails.rhythm || "");
      setNewDifficulty(currentSongDetails.difficulty || "");
      setNewYoutubeLink(currentSongDetails.youtubeLink || "");
      setNewLyrics(currentSongDetails.lyrics || "");
      
      if (currentSongDetails.chords && currentSongDetails.chords.length > 0) {
        setChordEntries(currentSongDetails.chords);
      } else {
        setChordEntries([{ chord: "", fingering: "" }]);
      }
    }
  }, [isEditing, currentSongDetails]);

  const handleChordChange = (i: number, key: keyof ChordEntry, value: string) => {
    setChordEntries(prev => prev.map((e, idx) => idx === i ? { ...e, [key]: value } : e));
  };
  
  const addChordEntry = () => setChordEntries(prev => [...prev, { chord: '', fingering: '' }]);
  
  const removeChordEntry = (i: number) => setChordEntries(prev => prev.filter((_, idx) => idx !== i));

  const handleSubmit = async () => {
    const songId = selectedSong?.[1];
    if (!newArtist || !newTitle) {
      setError("L'artiste et le titre sont requis");
      return;
    }
    
    try {
      setIsLoading(true);
      const filteredChords = chordEntries.filter(entry => entry.chord.trim() !== '');
      
      if (isEditing && typeof songId === 'number') {
        console.log("Updating song with ID:", songId);
        
        // Update existing song
        await updateSongSheet(
          songId,
          newArtist,
          newTitle,
          newTuning || tunings[0],
          newKeySignature || tonalities[0],
          newCapo || capoOptions[0],
          newTempo ? (newTempo.toLowerCase().includes('bpm') ? newTempo : `${newTempo} BPM`) : "120 BPM",
          newTimeSignature || measureOptions[0],
          newRhythm || "↓ . ↓ ↑ ↓ . ↓ ↑",
          newLyrics,
          filteredChords.length > 0 ? filteredChords : [{ chord: 'C', fingering: 'X32010' }],
          newAlbum || undefined,
          newYear ? parseInt(newYear) : undefined,
          newDifficulty || undefined,
          newYoutubeLink || undefined
        );
        
        // After updating in the database, fetch the updated song details
        if (typeof songId === 'number') {
          // First exit edit mode to ensure we return to view
          setIsEditing(false);
          
          // Then fetch updated details and update store
          const updatedSongDetails = await fetchSongDetails(songId);
          setCurrentSongDetails(updatedSongDetails);
          
          // Also refresh the full songs list
          const songsData = await fetchAllArtistsSongs();
          useSongStore.getState().setSongs(songsData);
          
          // Show success message
          setSubmitSuccess(true);
          
          // Clear success message after a delay
          setTimeout(() => {
            setSubmitSuccess(false);
            console.log("Update completed, viewing updated song:", songId);
          }, 1500);
        }
      } else {
        // Add new song - using direct method to bypass RPC issues
        console.log("Tentative de sauvegarde directe...");
        const partitionId = await directAddSongSheet(
          newArtist,
          newTitle,
          newTuning || tunings[0],
          newKeySignature || tonalities[0],
          newCapo || capoOptions[0],
          newTempo ? (newTempo.toLowerCase().includes('bpm') ? newTempo : `${newTempo} BPM`) : "120 BPM",
          newTimeSignature || measureOptions[0],
          newRhythm || "↓ . ↓ ↑ ↓ . ↓ ↑",
          newLyrics,
          filteredChords.length > 0 ? filteredChords : [{ chord: 'C', fingering: 'X32010' }],
          newAlbum || undefined,
          newYear ? parseInt(newYear) : undefined,
          newDifficulty || undefined,
          newYoutubeLink || undefined
        );
        
        if (partitionId) {
          // Refresh artists and songs
          const artistsData = await fetchArtists();
          const songsData = await fetchAllArtistsSongs();
          
          useSongStore.getState().setArtists(artistsData);
          useSongStore.getState().setSongs(songsData);
          
          // Set the selection to newly added partition
          const artistIndex = artistsData.findIndex(a => a.id === songsData.find((s) => s.id === partitionId)?.artist_id);
          if (artistIndex !== -1) {
            const artistSongs = songsData.filter(s => s.artist_id === artistsData[artistIndex].id);
            const songIndex = artistSongs.findIndex(s => s.id === partitionId);
            if (songIndex !== -1) {
              useSongStore.getState().setSelectedSong([artistIndex, songIndex]);
            }
          }
        }
        
        // Reset form
        setNewArtist('');
        setNewTitle('');
        setNewTuning('');
        setNewKeySignature('');
        setNewCapo('');
        setNewTempo('');
        setNewTimeSignature('');
        setNewRhythm('');
        setNewLyrics('');
        setChordEntries([{ chord: '', fingering: '' }]);
        
        setSubmitSuccess(true);
        setTimeout(() => setSubmitSuccess(false), 3000);
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred adding the song sheet');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      className="bg-transparent rounded-lg p-6"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {submitSuccess && (
        <motion.div 
          className="bg-accent text-bg-light p-3 rounded-md mb-4 text-center"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
        >
          {isEditing ? 'Partition mise à jour avec succès!' : 'Partition ajoutée avec succès!'}
        </motion.div>
      )}

      <TechnicalDetails
        artist={newArtist}
        setArtist={setNewArtist}
        title={newTitle}
        setTitle={setNewTitle}
        album={newAlbum}
        setAlbum={setNewAlbum}
        year={newYear}
        setYear={setNewYear}
        capo={newCapo}
        setCapo={setNewCapo}
        tempo={newTempo}
        setTempo={setNewTempo}
        tuning={newTuning}
        setTuning={setNewTuning}
        keySignature={newKeySignature}
        setKeySignature={setNewKeySignature}
        timeSignature={newTimeSignature}
        setTimeSignature={setNewTimeSignature}
        rhythm={newRhythm}
        setRhythm={setNewRhythm}
        difficulty={newDifficulty}
        setDifficulty={setNewDifficulty}
        youtubeLink={newYoutubeLink}
        setYoutubeLink={setNewYoutubeLink}
        artists={[...new Set(artists.map(a => a.name))]}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6 pt-8">
        <div className="md:col-span-2">
          <TabSection lyrics={newLyrics} setLyrics={setNewLyrics} />
        </div>
        
        <div className="md:col-span-1">
          <ChordSection
            chords={chordEntries}
            onChordChange={handleChordChange}
            onAddChord={addChordEntry}
            onRemoveChord={removeChordEntry}
          />
        </div>

        <div className="md:col-span-1">
          <SuggestedChords 
            keySignature={newKeySignature || "C"}
            chordsInUse={chordEntries}
            onAddChord={(chordEntry: ChordEntry) => {
              setChordEntries(prev => [...prev, chordEntry]);
            }}
          />
        </div>
      </div>
      
      <div className="flex items-center justify-start gap-6">
        <motion.button
          onClick={handleSubmit}
          className="px-4 py-2 text-[#CD2928] font-semibold flex items-center justify-center gap-2 w-full md:w-auto group"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <FontAwesomeIcon icon={faSave} className="text-[#CD2928]" />
          <span className="font-['JustFine'] text-xl font-thin border-b-2 border-transparent group-hover:border-[#CD2928] transition-colors">
            {isEditing ? 'Mettre à jour' : 'Sauvegarder'}
          </span>
        </motion.button>
        
        {/* Bouton de débogage - à supprimer en production */}
        <button 
          onClick={(e) => {
            e.preventDefault();
            console.log("Test de l'ajout de partition");
            debugAddPartition();
          }}
          className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded"
        >
          <FontAwesomeIcon icon={faBug} className="mr-1" />
          Debug
        </button>
        
        {isEditing && (
          <motion.button
            onClick={() => setIsEditing(false)}
            className="px-4 py-2 text-text-dark font-semibold flex items-center justify-center gap-2 w-full md:w-auto group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="font-['JustFine'] text-xl font-thin border-b-2 border-transparent group-hover:border-text-dark transition-colors">
              Annuler
            </span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
};

export default SongForm;
