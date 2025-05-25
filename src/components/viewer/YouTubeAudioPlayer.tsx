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
  const [duration, setDuration] = useState(0);
  const [player, setPlayer] = useState<YT.Player | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<number | null>(null);

  const youtubeId = extractYouTubeId(youtubeLink);
  
  // Initialisation de l'API YouTube
  useEffect(() => {
    // Si pas de lien ou déjà initialisé, ne rien faire
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
              setDuration(newPlayer.getDuration());
              // Définir le volume initial
              newPlayer.setVolume(70);
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

    // Charger l'API YouTube si elle n'est pas déjà chargée
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      
      // Définir la fonction de callback
      window.onYouTubeIframeAPIReady = () => {
        initYouTubePlayer();
        setIsInitialized(true);
      };
      
      // Ajouter le script au document
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
    } else {
      // Si l'API est déjà chargée, initialiser directement le lecteur
      initYouTubePlayer();
      setIsInitialized(true);
    }
    
    // Nettoyage lors du démontage du composant
    return () => {
      if (player) {
        player.stopVideo();
        player.destroy();
      }
      // Nettoyage de la fonction globale
      if (window.onYouTubeIframeAPIReady === window.onYouTubeIframeAPIReady) {
        window.onYouTubeIframeAPIReady = () => {};
      }
    };
  }, [youtubeId, isInitialized, player]);

  // Mise à jour de l'état de lecture
  useEffect(() => {
    if (!player) return;
    
    if (isPlaying) {
      player.playVideo();
    } else {
      player.pauseVideo();
    }
  }, [isPlaying, player]);

  // Mise à jour de l'état de sourdine
  useEffect(() => {
    if (!player) return;
    
    if (isMuted) {
      player.mute();
    } else {
      player.unMute();
    }
  }, [isMuted, player]);

  // Mise à jour de la progression
  useEffect(() => {
    if (!player) return;
    
    if (isPlaying) {
      progressInterval.current = window.setInterval(() => {
        const currentTime = player.getCurrentTime();
        const duration = player.getDuration();
        setProgress((currentTime / duration) * 100);
      }, 1000);
    } else if (progressInterval.current) {
      window.clearInterval(progressInterval.current);
    }
    
    return () => {
      if (progressInterval.current) {
        window.clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying, player]);

  // Gestion du bouton de lecture/pause
  const togglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  // Gestion du clic sur la barre de progression
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!player || !duration) return;
    
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    const newTime = (duration * percentage) / 100;
    
    player.seekTo(newTime, true);
    setProgress(percentage);
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
        
        {/* Barre de progression */}
        <div 
          className="relative flex-1 h-2 bg-[#E5E0C0] rounded-full cursor-pointer overflow-hidden"
          onClick={handleProgressClick}
        >
          <div 
            className="absolute inset-y-0 left-0 bg-[#CD2928] rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Durée */}
        <div className="text-text-dark text-sm font-mono min-w-[40px]">
          {Math.floor((duration * (progress / 100)) / 60)}:{String(Math.floor((duration * (progress / 100)) % 60)).padStart(2, '0')}
        </div>
        
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
