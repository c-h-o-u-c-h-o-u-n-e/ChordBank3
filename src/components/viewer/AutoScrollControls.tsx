import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faPlus, faMinus, faRotateLeft } from '@fortawesome/free-solid-svg-icons';

interface AutoScrollControlsProps {
  isScrolling: boolean;
  speedMultiplier: number;
  onToggleScroll: () => void;
  onSpeedChange: (change: number) => void;
  onReset: () => void;
}

const AutoScrollControls: React.FC<AutoScrollControlsProps> = ({
  isScrolling,
  speedMultiplier,
  onToggleScroll,
  onSpeedChange,
  onReset,
}) => {
  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-2 bg-[#EFEAD3] p-2 rounded-lg shadow-lg">
      <button
        onClick={() => onSpeedChange(-0.25)}
        className="w-8 h-8 flex items-center justify-center text-text-dark hover:text-[#CD2928] transition-colors"
        disabled={speedMultiplier <= 0.25}
      >
        <FontAwesomeIcon icon={faMinus} />
      </button>
      
      <div className="w-12 text-center font-['JetBrains Mono'] text-sm">
        {speedMultiplier.toFixed(2)}x
      </div>
      
      <button
        onClick={() => onSpeedChange(0.25)}
        className="w-8 h-8 flex items-center justify-center text-text-dark hover:text-[#CD2928] transition-colors"
      >
        <FontAwesomeIcon icon={faPlus} />
      </button>
      
      <div className="w-px h-6 bg-text-dark opacity-20 mx-2" />
      
      <button
        onClick={onReset}
        className="w-8 h-8 flex items-center justify-center text-text-dark hover:text-[#CD2928] transition-colors"
        title="Reset scroll position"
      >
        <FontAwesomeIcon icon={faRotateLeft} />
      </button>
      
      <button
        onClick={onToggleScroll}
        className="w-8 h-8 flex items-center justify-center text-text-dark hover:text-[#CD2928] transition-colors"
        title={isScrolling ? "Pause" : "Play"}
      >
        <FontAwesomeIcon icon={isScrolling ? faPause : faPlay} />
      </button>
    </div>
  );
};

export default AutoScrollControls;