import React from 'react';
import { motion } from 'framer-motion';
import FormRow from './FormRow';
import FormInput from './FormInput';
import FormDropdown from './FormDropdown';
import { tunings, tonalities, capoOptions, measureOptions, difficultyOptions } from './constants';

interface TechnicalDetailsProps {
  artist: string;
  setArtist: (value: string) => void;
  title: string;
  setTitle: (value: string) => void;
  album: string;
  setAlbum: (value: string) => void;
  year: string;
  setYear: (value: string) => void;
  capo: string;
  setCapo: (value: string) => void;
  tempo: string;
  setTempo: (value: string) => void;
  tuning: string;
  setTuning: (value: string) => void;
  keySignature: string;
  setKeySignature: (value: string) => void;
  timeSignature: string;
  setTimeSignature: (value: string) => void;
  rhythm: string;
  setRhythm: (value: string) => void;
  difficulty: string;
  setDifficulty: (value: string) => void;
  youtubeLink?: string;
  setYoutubeLink?: (value: string) => void;
  artists: string[];
}

const TechnicalDetails: React.FC<TechnicalDetailsProps> = ({
  artist, setArtist,
  title, setTitle,
  album, setAlbum,
  year, setYear,
  capo, setCapo,
  tempo, setTempo,
  tuning, setTuning,
  keySignature, setKeySignature,
  timeSignature, setTimeSignature,
  rhythm, setRhythm,
  difficulty, setDifficulty,
  youtubeLink = '', setYoutubeLink = () => {},
  artists,
}) => {
  return (
    <>
      <div className="flex items-center gap-4 text-text-dark mb-4">
        <div className="h-[2px] w-8 bg-current opacity-50" />
        <h3 className="text-2xl font-['JustFine'] whitespace-nowrap tracking-wide">Fiche technique</h3>
        <div className="h-[2px] flex-1 bg-current opacity-50" />
      </div>

      {/* Première ligne : Artiste, Titre, Album, Année */}
      <FormRow>
        <FormInput
          value={artist}
          onChange={setArtist}
          placeholder="Artiste"
          suggestions={artists.filter(a => 
            artist && 
            a.toLowerCase().startsWith(artist.toLowerCase())
          ).sort((a, b) => 
            a.toLowerCase().indexOf(artist.toLowerCase()) - 
            b.toLowerCase().indexOf(artist.toLowerCase())
          )}
          showSuggestions={artist.length > 0}
          onSuggestionClick={setArtist}
        />
        <FormInput
          value={title}
          onChange={setTitle}
          placeholder="Titre"
        />
        <FormInput
          value={album}
          onChange={setAlbum}
          placeholder="Album"
        />
        <FormInput
          value={year}
          onChange={setYear}
          placeholder="Année"
          type="number"
        />
      </FormRow>

      {/* Deuxième ligne : Accordage, Tonalité, Capo, Tempo */}
      <FormRow>
      <FormDropdown
        value={tuning}
        onChange={setTuning}
        placeholder="Accordage"
        options={tunings}
      />
      <FormDropdown
        value={keySignature}
        onChange={setKeySignature}
        placeholder="Tonalité"
        options={tonalities}
      />
      <FormDropdown
        value={capo}
        onChange={setCapo}
        placeholder="Capo"
        options={capoOptions}
      />
      <FormInput
        value={tempo}
        onChange={setTempo}
        placeholder="Tempo"
      />
      </FormRow>
      
      {/* Troisième ligne : Mesure, Rythmique de gratte, Difficulté, Lien YouTube */}
      <FormRow>
        <FormDropdown
          value={timeSignature}
          onChange={setTimeSignature}
          placeholder="Mesure"
          options={measureOptions}
        />
        <FormInput
          value={rhythm}
          onChange={setRhythm}
          placeholder="Rythmique de gratte"
          className="text-2xl font-['JetBrains Mono']"
          readOnly
          onKeyDown={e => {
            const map: Record<string,string> = { 
              U: '↑ ', u: '↑ ', 
              D: '↓ ', d: '↓ ', 
              '.': '. ', '|': '| ' 
            };
            if (e.key === 'Backspace') {
              if (rhythm.length >= 2) {
                setRhythm(rhythm.slice(0, -2));
              }
              e.preventDefault();
            } else if (map[e.key]) {
              setRhythm(rhythm + map[e.key]);
              e.preventDefault();
            }
          }}
        />
        <FormDropdown
          value={difficulty}
          onChange={setDifficulty}
          placeholder="Difficulté"
          options={difficultyOptions}
        />
        <FormInput
          value={youtubeLink}
          onChange={setYoutubeLink}
          placeholder="Lien YouTube"
          type="url"
        />
      </FormRow>
    </>
  );
};

export default TechnicalDetails;