import React from 'react';
import { motion } from 'framer-motion';

interface TabSectionProps {
  lyrics: string;
  setLyrics: (value: string) => void;
}

const TabSection: React.FC<TabSectionProps> = ({ lyrics, setLyrics }) => {
  return (
    <div className="md:col-span-3">
      <div className="flex items-center gap-4 text-text-dark mb-4">
        <div className="h-[2px] w-8 bg-current opacity-50" />
        <h3 className="text-2xl font-['JustFine'] whitespace-nowrap tracking-wide">Partition</h3>
        <div className="h-[2px] flex-1 bg-current opacity-50" />
      </div>
      <textarea
        value={lyrics}
        onChange={e => setLyrics(e.target.value)}
        placeholder="Partition"
        className="w-full h-[400px] p-4 bg-[#EFEAD3] rounded font-mono text-sm focus:outline-none text-text-dark placeholder-text-muted"
      />
    </div>
  );
};

export default TabSection;