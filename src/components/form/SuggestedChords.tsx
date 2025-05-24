import React from 'react';
import { ChordEntry } from '../../types/database.types';

interface SuggestedChordsProps {
  keySignature: string; // Selected tonality
  chordsInUse: ChordEntry[];
  onAddChord: (entry: ChordEntry) => void;
}

const groupedChordsByRoot: { [root: string]: string[] } = {
  'C': ['C', 'Cm', 'C7', 'Csus2', 'Csus4', 'Cmaj7', 'Cm7', 'Cdim', 'Cdim7', 'Caug', 'Cadd9'],
  'C#': ['C#', 'C#m', 'C#7', 'C#sus2', 'C#sus4', 'C#maj7', 'C#m7', 'C#dim', 'C#dim7', 'C#aug', 'C#add9'],
  'D': ['D', 'Dm', 'D7', 'Dsus2', 'Dsus4', 'Dmaj7', 'Dm7', 'Ddim', 'Ddim7', 'Daug', 'Dadd9'],
  'D#': ['D#', 'D#m', 'D#7', 'D#sus2', 'D#sus4', 'D#maj7', 'D#m7', 'D#dim', 'D#dim7', 'D#aug', 'D#add9'],
  'E': ['E', 'Em', 'E7', 'Esus2', 'Esus4', 'Emaj7', 'Em7', 'Edim', 'Edim7', 'Eaug', 'Eadd9'],
  'F': ['F', 'Fm', 'F7', 'Fsus2', 'Fsus4', 'Fmaj7', 'Fm7', 'Fdim', 'Fdim7', 'Faug', 'Fadd9'],
  'F#': ['F#', 'F#m', 'F#7', 'F#sus2', 'F#sus4', 'F#maj7', 'F#m7', 'F#dim', 'F#dim7', 'F#aug', 'F#add9'],
  'G': ['G', 'Gm', 'G7', 'Gsus2', 'Gsus4', 'Gmaj7', 'Gm7', 'Gdim', 'Gdim7', 'Gaug', 'Gadd9'],
  'G#': ['G#', 'G#m', 'G#7', 'G#sus2', 'G#sus4', 'G#maj7', 'G#m7', 'G#dim', 'G#dim7', 'G#aug', 'G#add9'],
  'A': ['A', 'Am', 'A7', 'Asus2', 'Asus4', 'Amaj7', 'Am7', 'Adim', 'Adim7', 'Aaug', 'Aadd9'],
  'A#': ['A#', 'A#m', 'A#7', 'A#sus2', 'A#sus4', 'A#maj7', 'A#m7', 'A#dim', 'A#dim7', 'A#aug', 'A#add9'],
  'B': ['B', 'Bm', 'B7', 'Bsus2', 'Bsus4', 'Bmaj7', 'Bm7', 'Bdim', 'Bdim7', 'Baug', 'Badd9'],
};

const chordPositions: { [key: string]: string } = {
  'A': 'x02220',
  'B': 'x24442',
  'C': 'x32010',
  'D': 'xx0232',
  'E': '022100',
  'F': '133211',
  'G': '320003',
  'Ab': '466544',
  'Bb': 'x13331',
  'C#': 'x46664',
  'D#': 'x68886',
  'F#': '244322',
  'G#': '466544',

  'Am': 'x02210',
  'Bm': 'x24432',
  'Cm': 'x35543',
  'Dm': 'xx0231',
  'Em': '022000',
  'Fm': '133111',
  'Gm': '355333',
  'Abm': '466444',
  'Bbm': 'x13321',
  'C#m': 'x46654',
  'D#m': 'x68876',
  'F#m': '244222',
  'G#m': '466444',

  'Amaj7': 'x02120',
  'Bmaj7': 'x24342',
  'Cmaj7': 'x32000',
  'Dmaj7': 'xx0222',
  'Emaj7': '021100',
  'Fmaj7': '1x3210',
  'Gmaj7': '320002',
  'Abmaj7': '4x554x',
  'Bbmaj7': 'x13231',
  'C#maj7': 'x46564',
  'D#maj7': 'x68786',
  'F#maj7': '2x4322',
  'G#maj7': '4x554x',

  'Am7': 'x02010',
  'Bm7': 'x20202',
  'Cm7': 'x35343',
  'Dm7': 'xx0211',
  'Em7': '020000',
  'Fm7': '131141',
  'Gm7': '353333',
  'Abm7': '464444',
  'Bbm7': 'x13121',
  'C#m7': 'x46454',
  'D#m7': 'x68676',
  'F#m7': '242222',
  'G#m7': '464444',

  'A7': 'x02020',
  'B7': 'x21202',
  'C7': 'x32310',
  'D7': 'xx0212',
  'E7': '020100',
  'F7': '131211',
  'G7': '320001',
  'Ab7': '464544',
  'Bb7': 'x13131',
  'C#7': 'x46464',
  'D#7': 'x68686',
  'F#7': '242322',
  'G#7': '464544',

  'Asus2': 'x02200',
  'Bsus2': 'x24422',
  'Csus2': 'x30010',
  'Dsus2': 'xx0230',
  'Esus2': '024400',
  'Fsus2': '133011',
  'Gsus2': '300033',
  'Absus2': '466644',
  'Bbsus2': 'x13311',
  'C#sus2': 'x46644',
  'D#sus2': 'x68866',
  'F#sus2': '244422',
  'G#sus2': '466644',

  'Asus4': 'x02230',
  'Bsus4': 'x24452',
  'Csus4': 'x33010',
  'Dsus4': 'xx0233',
  'Esus4': '022200',
  'Fsus4': '133311',
  'Gsus4': '330013',
  'Absus4': '466644',
  'Bbsus4': 'x13341',
  'C#sus4': 'x46674',
  'D#sus4': 'x68896',
  'F#sus4': '244422',
  'G#sus4': '466644'
};

// Simplified list of all other chords
const allOtherChords: string[] = [
  'C#', 'D#', 'F#', 'G#', 'A#',
  'Cm', 'C#m', 'Dm', 'D#m', 'Fm', 'F#m', 'Gm', 'G#m', 'Am', 'A#m', 'Bm'
];

const SuggestedChords: React.FC<SuggestedChordsProps> = ({ keySignature, chordsInUse, onAddChord }) => {
  const suggestedRoots = Object.keys(groupedChordsByRoot);

  const isChordInUse = (chord: string) => chordsInUse.some(entry => entry.chord === chord);

  const handleAddChord = (chord: string) => {
    const position = chordPositions[chord] || '';
    onAddChord({ chord, fingering: position });
  };

  return (
    <div className="bg-bg-muted p-4 rounded-lg">
      <h3 className="text-xl font-['JustFine'] mb-4">Accords suggérés</h3>

      {/* Root chords with variants*/}
      {suggestedRoots.map(rootChord => (
        <div key={rootChord} className="mb-4">
          <h4 className="font-semibold text-accent mb-2">{rootChord}</h4>
          <div className="flex flex-wrap gap-2">
            {groupedChordsByRoot[rootChord].map(chord => (
              <button
                key={chord}
                onClick={() => handleAddChord(chord)}
                disabled={isChordInUse(chord)}
                className={`px-3 py-1 rounded text-accent border border-accent hover:bg-accent hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed`}
              >
                {chord}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Others chords with collapsible button*/}
      <details>
        <summary className="cursor-pointer font-semibold mb-2">Autres accords</summary>
        <div className="flex flex-wrap gap-2">
          {allOtherChords.map(chord => (
            <button
              key={chord}
              onClick={() => handleAddChord(chord)}
              disabled={isChordInUse(chord)}
              className={`px-3 py-1 rounded text-text-dark border border-text-dark hover:bg-text-dark hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              {chord}
            </button>
          ))}
        </div>
      </details>
    </div>
  );
};

export default SuggestedChords;
