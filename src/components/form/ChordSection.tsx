import React from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import { ChordEntry } from '../../types/database.types';

interface ChordSectionProps {
  chords: ChordEntry[];
  onChordChange: (index: number, key: keyof ChordEntry, value: string) => void;
  onAddChord: () => void;
  onRemoveChord: (index: number) => void;
}

const ChordSection: React.FC<ChordSectionProps> = ({
  chords,
  onChordChange,
  onAddChord,
  onRemoveChord,
}) => {
  return (
    <div className="md:col-span-1">
      <div className="flex items-center gap-4 text-text-dark mb-4">
        <div className="h-[2px] w-8 bg-current opacity-50" />
        <h3 className="text-2xl font-['JustFine'] whitespace-nowrap tracking-wide">Accords utilisés</h3>
        <div className="h-[2px] flex-1 bg-current opacity-50" />
      </div>
      <div className="space-y-2 h-[400px] overflow-y-auto pr-2">
        {chords.map((entry, idx) => (
          <motion.div 
            key={idx} 
            className="flex gap-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.05 }}
          >
            <div className="w-[35%]">
              <input
                value={entry.chord}
                onChange={e => onChordChange(idx, 'chord', e.target.value)}
                placeholder="Accord"
                className="p-2 bg-[#EFEAD3] rounded w-full focus:outline-none text-text-dark placeholder-text-muted font-['NewPoppins']"
              />
            </div>
            <div className="w-[50%]">
              <input
                value={entry.fingering}
                onChange={e => onChordChange(idx, 'fingering', e.target.value)}
                placeholder="Position (ex: X02210)"
                className="p-2 bg-[#EFEAD3] rounded w-full focus:outline-none text-text-dark placeholder-text-muted font-['NewPoppins']"
                maxLength={6}
              />
            </div>
            {idx === chords.length - 1 ? (
              <motion.button 
                onClick={onAddChord} 
                className="w-[15%] flex items-center justify-center bg-[#CD2928] hover:bg-[#A02020] text-[#F8F4E3] rounded transition-colors min-w-[32px]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faPlus} className="text-[#F8F4E3]" />
              </motion.button>
            ) : (
              <motion.button 
                onClick={() => onRemoveChord(idx)} 
                className="w-[15%] flex items-center justify-center bg-[#CD2928] hover:bg-[#A02020] text-[#F8F4E3] rounded transition-colors min-w-[32px]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FontAwesomeIcon icon={faTimes} className="text-[#F8F4E3]" />
              </motion.button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ChordSection;