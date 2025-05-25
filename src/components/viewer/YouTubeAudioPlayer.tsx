import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faPause, faVolumeHigh, faVolumeXmark } from '@fortawesome/free-solid-svg-icons';

// Interface pour les props du composant
interface YouTubeAudioPlayerProps {
  youtubeLink?: string;
}

// Fonction pour extraire l'ID YouTube d'une URL
const extractYouTubeId = (url?: string): string | null => {
  if (!url) return null;
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  return (match && match[2].length === 11) ? match[2] : null;
};

const YouTubeAudioPlayer: React.FC<YouTubeAudioPlayerProps> = ({ youtubeLink }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const youtubeId = extractYouTubeId(youtubeLink);
  
  // Initialisation de l'API YouTube
  useEffect(() => {
    if (!youtubeId || isInitialized) return;

    // Fonction pour initialiser le lecteur YouTube
    const initYouTubePlayer = () => {
      try {
        if (!playerRef.current) return;
        
        // Créer un nouveau lecteur YouTube
        const newPlayer = new window.YT.Player(playerRef.current, {
          videoId: youtubeId,
          height: '0',  // Hauteur 0 pour cacher le lecteur
          width: '0',   // Largeur 0 pour cacher le lecteur
          playerVars: {
            autoplay: 0,          // Ne pas lire automatiquement
            controls: 0,          // Masquer les contrôles
            disablekb: 1,         // Désactiver les contrôles clavier
            fs: 0,                // Désactiver le mode plein écran
            modestbranding: 1,    // Masquer le logo YouTube
            rel: 0,               // Ne pas afficher les vidéos liées
            showinfo: 0,          // Masquer les infos du titre
            iv_load_policy: 3     // Masquer les annotations
          },
          events: {
            onReady: () => {
              console.log('YouTube player ready');
              setPlayer(newPlayer);
              setIsInitialized(true);
              // Définir le volume initial
              newPlayer.setVolume(50);
            },
            onError: (e) => {
              console.error('YouTube player error:', e);
              setError("Erreur lors du chargement de l'audio");
            }
          }
        });
      } catch (e) {
        console.error('Error initializing YouTube player:', e);
        setError("Erreur lors de l'initialisation du lecteur");
      }
    };

    const loadYouTubeAPI = () => {
      return new Promise<void>((resolve) => {
        if (window.YT && window.YT.Player) {
          resolve();
          return;
        }

        const tag = document.createElement('script');
        tag.src = 'https://www.youtube.com/iframe_api';
        
        window.onYouTubeIframeAPIReady = () => {
          resolve();
        };
        
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      });
    };

    const initializePlayer = async () => {
      try {
        await loadYouTubeAPI();
        initYouTubePlayer();
      } catch (e) {
        console.error('Failed to initialize YouTube player:', e);
        setError('Failed to initialize player');
      }
    };

    // Start initialization
    initializePlayer();
    
    return () => {
      if (player) {
        player.stopVideo();
        player.destroy();
      }
    };
  }, [youtubeId, isInitialized]);

  // Mise à jour de l'état de lecture
  useEffect(() => {
    if (!player) return;
    
    if (isPlaying) {
      try {
        player.playVideo();
      } catch (error) {
        console.error('Error playing video:', error);
        setError('Error playing audio');
        setIsPlaying(false);
      }
    } else {
      try {
        player.pauseVideo();
      } catch (error) {
        console.error('Error pausing video:', error);
      }
    }
  }, [isPlaying, player]);

  // Mise à jour de l'état de sourdine
  useEffect(() => {
    if (!player) return;
    
    if (isMuted) {
      try {
        player.mute();
      } catch (error) {
        console.error('Error muting:', error);
      }
    } else {
      try {
        player.unMute();
      } catch (error) {
        console.error('Error unmuting:', error);
      }
    }
  }, [isMuted, player]);

  // Gestion du bouton de lecture/pause
  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  // Gestion du bouton de sourdine
  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  // Si pas de lien YouTube, ne rien afficher
  if (!youtubeId) return null;

  return (
    <div className="flex items-center space-x-4 mt-2">
      {/* Containeur invisible pour le lecteur YouTube */}
      <div ref={playerRef} style={{ display: 'none' }}></div>
      
      {/* Contrôles du lecteur */}
      <div className="flex items-center space-x-4">
        <button 
          onClick={togglePlay}
          className="bg-[#CD2928] text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-[#A02020] transition-colors focus:outline-none"
          aria-label={isPlaying ? 'Pause' : 'Play'}
          disabled={!!error}
        >
          <FontAwesomeIcon icon={isPlaying ? faPause : faPlay} />
        </button>
        
        <button 
          onClick={toggleMute}
          className="text-text-dark rounded-full w-10 h-10 flex items-center justify-center hover:text-text-muted transition-colors focus:outline-none"
          aria-label={isMuted ? 'Unmute' : 'Mute'}
          disabled={!!error}
        >
          <FontAwesomeIcon icon={isMuted ? faVolumeXmark : faVolumeHigh} />
        </button>

        <div className="text-text-dark text-sm">
          {error ? (
            <span className="text-[#CD2928]">{error}</span>
          ) : isPlaying ? (
            "Lecture en cours..."
          ) : (
            "Lecteur audio"
          )}
        </div>
      </div>
    </div>
  );
};

// Déclaration de type pour l'API YouTube
declare global {
  interface Window {
    YT: {
      Player: new (
        element: HTMLElement | string,
        options: {
          videoId: string;
          height?: string | number;
          width?: string | number;
          playerVars?: {
            autoplay?: 0 | 1;
            controls?: 0 | 1;
            disablekb?: 0 | 1;
            fs?: 0 | 1;
            modestbranding?: 0 | 1;
            rel?: 0 | 1;
            showinfo?: 0 | 1;
            iv_load_policy?: 1 | 3;
          };
          events?: {
            onReady?: () => void;
            onStateChange?: (event: any) => void;
            onError?: (event: any) => void;
          };
        }
      ) => YT.Player;
    };
    onYouTubeIframeAPIReady: () => void;
  }

  namespace YT {
    interface Player {
      playVideo: () => void;
      pauseVideo: () => void;
      stopVideo: () => void;
      mute: () => void;
      unMute: () => void;
      setVolume: (volume: number) => void;
      getVolume: () => number;
      destroy: () => void;
      getCurrentTime: () => number;
      seekTo: (seconds: number, allowSeekAhead: boolean) => void;
    }
  }
}

export default YouTubeAudioPlayer;