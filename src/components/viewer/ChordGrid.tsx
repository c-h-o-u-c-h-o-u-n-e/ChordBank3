import React from 'react';
import { ChordEntry } from '../../types/database.types';

interface ChordGridProps {
  chords: ChordEntry[];
}

const ChordGrid: React.FC<ChordGridProps> = ({ chords }) => {
  return (
    <div
      className="overflow-x-auto w-full lg:w-1/2 rounded-xl bg-[#EFEAD3] chord-table-container"
      style={{
        maxWidth: chords.length <= 10
          ? undefined
          : `${chords.length * 60}px`,
      }}
    >
      <table className="text-center text-sm border-collapse w-full" style={{ height: '252px', tableLayout: 'fixed' }}>
        <thead>
          <tr className="bg-[#E5E0C0]">
            {chords.map(chord => (
              <th
                key={chord.chord}
                className="w-[60px] min-w-[60px] max-w-[60px] px-0 py-2 text-text-dark font-bold font-['JetBrains Mono']"
              >
                {chord.chord}
              </th>
            ))}
            {chords.length <= 10 && (
              <th className="w-full px-0 py-2" />
            )}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: 6 }).map((_, rowIdx) => (
            <tr key={rowIdx}>
              {chords.map(chord => (
                <td
                  key={`${chord.chord}-${rowIdx}`}
                  className="w-[60px] min-w-[60px] max-w-[60px] px-0 py-2 text-text-dark font-normal font-['JetBrains Mono']"
                >
                  {chord.fingering[rowIdx] === 'X' ? <span className="opacity-40">X</span> : chord.fingering[rowIdx] || ''}
                </td>
              ))}
              {chords.length <= 10 && <td className="w-full px-0 py-2" />}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChordGrid;