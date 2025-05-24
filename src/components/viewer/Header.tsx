import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as faHeartSolid } from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import { faEdit, faMusic } from '@fortawesome/free-solid-svg-icons';
import YouTubeAudioPlayer from './YouTubeAudioPlayer';
import { SongDetails } from '../../types/database.types';

interface HeaderProps {
  songDetails: SongDetails;
  onFavoriteClick: () => void;
  onEditClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ songDetails, onFavoriteClick, onEditClick }) => {
  return (
    <div className="p-6">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-[80px] text-right text-lg opacity-60 font-['NewPoppins'] tracking-wide pr-2">Titre</div>
          <h1 className="text-5xl tracking-wide flex-1 font-['JustFine']">
            {songDetails.title}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-[80px] text-right text-lg opacity-60 font-['NewPoppins'] tracking-wide pr-2">Artiste</div>
          <p className="text-5xl tracking-wide flex-1 font-['JustFine']">
            {songDetails.artist}
          </p>
        </div>
        <div className="flex items-center gap-3 mt-6 pb-8">
          <div className="w-[80px] text-right text-lg opacity-60 font-['NewPoppins'] tracking-wide pr-2">Album</div>
          <div className="flex items-center gap-8">
            <span className="text-2xl font-['JustFine']">{songDetails.album || '—'}</span>
            <div className="flex items-center gap-3">
              <span className="text-lg opacity-60 font-['NewPoppins'] tracking-wide">Année</span>
              <span className="text-2xl font-['JustFine']">{songDetails.year || '—'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg opacity-60 font-['NewPoppins'] tracking-wide">Difficulté</span>
              <span className="text-2xl font-['JustFine']">{songDetails.level || '—'}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-lg opacity-60 font-['NewPoppins'] tracking-wide">Lectures</span>
              <span className="text-2xl font-['JustFine']">{songDetails.views.toLocaleString()}</span>
            </div>
            <button
              className="text-[#CD2928] hover:text-[#A02020] transition-colors"
              onClick={onFavoriteClick}
            >
              <FontAwesomeIcon
                icon={songDetails.isFavorite ? faHeartSolid : faHeartRegular}
                className="text-2xl"
              />
            </button>
          </div>
        </div>
        <div className="flex flex-col mt-4">
          <div className="flex items-center">
            <div className="w-[80px]"></div>
            <button
              onClick={onEditClick}
              className="flex items-center gap-2 px-4 py-2 text-accent hover:text-accent-dark transition-colors"
            >
              <FontAwesomeIcon icon={faEdit} />
              <span className="font-['NewPoppins']">Éditer la partition</span>
            </button>
          </div>
          
          {songDetails.youtubeLink && (
            <div className="flex items-center mt-2">
              <div className="w-[80px] text-right text-lg opacity-60 font-['NewPoppins'] tracking-wide pr-2">
                <FontAwesomeIcon icon={faMusic} className="text-sm" />
              </div>
              <YouTubeAudioPlayer youtubeLink={songDetails.youtubeLink} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;