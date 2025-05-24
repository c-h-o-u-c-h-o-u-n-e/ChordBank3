import { create } from 'zustand';
import { SongDetails, Partition, Artist } from '../types/database.types';

interface SongState {
  artists: Artist[];
  songs: Partition[];
  openArtistIndex: number | null;
  selectedSong: [number, number] | null;
  currentSongDetails: SongDetails | null;
  isLoading: boolean;
  error: string | null;
  isEditing: boolean;

  // Actions
  setArtists: (artists: Artist[]) => void;
  setSongs: (songs: Partition[]) => void;
  setOpenArtistIndex: (index: number | null) => void;
  setSelectedSong: (selection: [number, number] | null) => void;
  setCurrentSongDetails: (details: SongDetails | null) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  setIsEditing: (isEditing: boolean) => void;
}

export const useSongStore = create<SongState>((set) => ({
  artists: [],
  songs: [],
  openArtistIndex: null,
  selectedSong: null,
  currentSongDetails: null,
  isLoading: false,
  error: null,
  isEditing: false,

  setArtists: (artists) => set({ artists }),
  setSongs: (songs) => set({ songs }),
  setOpenArtistIndex: (index) => set({ openArtistIndex: index }),
  setSelectedSong: (selection) => set({ selectedSong: selection }),
  setCurrentSongDetails: (details) => set({ currentSongDetails: details }),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  setIsEditing: (isEditing) => set({ isEditing }),
}));