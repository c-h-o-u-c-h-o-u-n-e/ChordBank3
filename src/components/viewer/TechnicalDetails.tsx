import React from 'react';

interface TechnicalDetailsProps {
  tuning: string;
  key: string;
  capo: string;
  tempo: string;
  timeSignature: string;
  rhythm: string;
}

const TechnicalDetails: React.FC<TechnicalDetailsProps> = ({
  tuning,
  key,
  capo,
  tempo,
  timeSignature,
  rhythm,
}) => {
  return (
    <div
      className="rounded-xl overflow-hidden text-sm w-full lg:w-1/2 grid grid-rows-6"
      style={{ height: '252px' }}
    >
      {[
        ['Accordage', tuning],
        ['Tonalité', key],
        ['Capo', capo],
        ['Tempo', tempo ? `${tempo} BPM` : ''],
        ['Mesure', timeSignature],
        ['Grattage', rhythm],
      ].map(([label, value], idx) => {
        const bgColor = idx % 2 === 0 ? 'bg-[#EFEAD3]' : 'bg-[#E5E0C0]';
        return (
          <div key={label} className={`flex items-center min-h-[42px] px-0 ${bgColor}`}>
            <div className="w-[115px] text-right pr-4 text-text-muted text-xs font-normal tracking-wide">
              {label}
            </div>
            <div
              className="flex-1 text-left text-text-dark font-light"
              style={idx === 5 ? { fontFamily: '"JetBrains Mono", monospace' } : {}}
            >
              {value}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TechnicalDetails;