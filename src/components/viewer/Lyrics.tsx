import React from 'react';
import { motion } from 'framer-motion';

interface Section {
  type: 'text' | 'section' | 'instrumental';
  sectionKey?: string;
  line?: string;
  lines?: string[];
}

const sectionMap: Record<string, string> = {
  'Intro': 'Intro',
  'Verse': 'Couplet',
  'Pre-Chorus': 'Pré-Refrain',
  'Chorus': 'Refrain',
  'Post-Chorus': 'Post-Refrain',
  'Bridge': 'Bridge',
  'Interlude': 'Interlude',
  'Instrumental': 'Instrumental',
  'Outro': 'Outro'
};

interface LyricsProps {
  lyrics: string;
}

const Lyrics: React.FC<LyricsProps> = ({ lyrics }) => {
  const rawLines = lyrics.split('\n');
  const segments: Section[] = [];
  
  let i = 0;
  while (i < rawLines.length) {
    const trimmed = rawLines[i].trim();
    const match = trimmed.match(/^\[(.*?)\]$/);
    if (match) {
      const sectionKey = match[1];
      let j = i + 1;
      const keyLower = sectionKey.toLowerCase();
      const isInstrumental = (
        keyLower.includes('instrumental') ||
        keyLower === 'intro' ||
        keyLower === 'outro'
      );
      if (isInstrumental) {
        const gridLines: string[] = [];
        while (j < rawLines.length && !rawLines[j].trim().match(/^\[.*\]$/)) {
          const line = rawLines[j].trim();
          if (line) gridLines.push(line);
          j++;
        }
        segments.push({ type: 'instrumental', sectionKey, lines: gridLines });
      } else {
        while (j < rawLines.length && !rawLines[j].trim().match(/^\[.*\]$/)) {
          j++;
        }
        segments.push({ type: 'section', sectionKey, lines: rawLines.slice(i + 1, j) });
      }
      i = j;
    } else {
      segments.push({ type: 'text', line: rawLines[i] });
      i++;
    }
  }

  return (
    <motion.div
      className="bg-transparent p-6 rounded-xl space-y-4"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.6 }}
    >
      {segments.map((seg, idx) => (
        <React.Fragment key={idx}>
          {seg.type === 'text' && (
            <div className="font-['JustFine'] whitespace-pre-wrap">{seg.line}</div>
          )}

          {seg.type === 'section' && (() => {
            const [type, num] = seg.sectionKey!.split(' ');
            const labelBase = sectionMap[type] || type;
            const sectionLabel = num ? `${labelBase} ${num}` : labelBase;
            return (
              <div className="flex items-center">
                <div
                  className="w-[80px] flex justify-end font-['JustFine'] text-2xl text-[#CD2928] tracking-wide relative"
                  style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    top: '-21px',
                    marginRight: '-32px',
                    opacity: 0.6
                  }}
                >
                  {sectionLabel}
                </div>
                <div className="flex-1 whitespace-pre-wrap" style={{ fontFamily: '"JetBrains Mono", monospace' }}>
                  {seg.lines!.join('\n')}
                </div>
              </div>
            );
          })()}

          {seg.type === 'instrumental' && (() => {
            const [type, num] = seg.sectionKey!.split(' ');
            const labelBase = sectionMap[type] || type;
            const sectionLabel = num ? `${labelBase} ${num}` : labelBase;

            const rows = seg.lines!.map(line =>
              line.split('|').map(c => c.trim()).filter(c => c)
            );
            const numCols = Math.max(...rows.map(r => r.length));

            return (
              <div className="flex items-center">
                <div
                  className="w-[80px] flex justify-end font-['JustFine'] text-2xl text-[#CD2928] tracking-wide relative pb-12"
                  style={{
                    writingMode: 'vertical-rl',
                    transform: 'rotate(180deg)',
                    top: '-21px',
                    marginRight: '-32px',
                    opacity: 0.6,
                  }}
                >
                  {sectionLabel}
                </div>
                <div className="flex-1">
                  <div
                    className="grid gap-2"
                    style={{
                      gridTemplateColumns: `repeat(${numCols}, max-content)`,
                      fontFamily: '"JetBrains Mono", monospace'
                    }}
                  >
                    {rows.flatMap((row, ridx) =>
                      row
                        .concat(Array(numCols - row.length).fill(''))
                        .map((chord, cidx) => (
                          <div
                            key={`${ridx}-${cidx}`}
                            className={`px-2.5 py-2 flex items-center justify-center whitespace-nowrap rounded-md ${
                              ridx % 2 === 0 ? 'bg-[#EFEAD3]' : 'bg-[#E5E0C0]'
                            }`}
                          >
                            {chord}
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </React.Fragment>
      ))}
    </motion.div>
  );
};

export default Lyrics;
