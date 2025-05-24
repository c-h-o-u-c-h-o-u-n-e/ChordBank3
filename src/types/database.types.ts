export interface Database {
  public: {
    Tables: {
      artists: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id?: number;
          name: string;
        };
        Update: {
          id?: number;
          name?: string;
        };
      };
      partitions: {
        Row: {
          id: number;
          artist_id: number;
          title: string;
          tuning: string;
          key_signature: string;
          capo: string;
          tempo: string;
          time_signature: string;
          rhythm: string;
          lyrics: string;
          views: number;
          recent_views: number;
          created_at: string;
          album?: string;
          year?: number;
          difficulty?: string;
          youtube_link?: string;
        };
        Insert: {
          id?: number;
          artist_id: number;
          title: string;
          tuning: string;
          key_signature: string;
          capo: string;
          tempo: string;
          time_signature: string;
          rhythm: string;
          lyrics: string;
          views?: number;
          recent_views?: number;
          created_at?: string;
          album?: string;
          year?: number;
          difficulty?: string;
          youtube_link?: string;
        };
        Update: {
          id?: number;
          artist_id?: number;
          title?: string;
          tuning?: string;
          key_signature?: string;
          capo?: string;
          tempo?: string;
          time_signature?: string;
          rhythm?: string;
          lyrics?: string;
          views?: number;
          recent_views?: number;
          created_at?: string;
          album?: string;
          year?: number;
          difficulty?: string;
          youtube_link?: string;
        };
      };
      favorites: {
        Row: {
          partition_id: number;
          created_at: string;
        };
        Insert: {
          partition_id: number;
          created_at?: string;
        };
        Update: {
          partition_id?: number;
          created_at?: string;
        };
      };
      partition_chords: {
        Row: {
          partition_id: number;
          position: number;
          chord: string;
          fingering: string;
        };
        Insert: {
          partition_id: number;
          position: number;
          chord: string;
          fingering: string;
        };
        Update: {
          partition_id?: number;
          position?: number;
          chord?: string;
          fingering?: string;
        };
      };
    };
    Functions: {
      add_partition: {
        Args: {
          p_artist: string;
          p_title: string;
          p_tuning: string;
          p_key: string;
          p_capo: string;
          p_tempo: string;
          p_time_signature: string;
          p_rhythm: string;
          p_chords: string[];
          p_fingerings: string[];
        };
        Returns: number;
      };
    };
  };
}

export type Artist = Database['public']['Tables']['artists']['Row'];
export type Partition = Database['public']['Tables']['partitions']['Row'] & {
  artist_name?: string;
  chords?: Array<{
    position: number;
    chord: string;
    fingering: string;
  }>;
};

export type ChordEntry = {
  chord: string;
  fingering: string;
};

export type SongDetails = {
  title: string;
  artist: string;
  tuning: string;
  key: string;
  capo: string;
  tempo: string;
  timeSignature: string;
  rhythm: string;
  lyrics: string;
  chords: ChordEntry[];
  views: number;
  recentViews?: number;
  isFavorite: boolean;
  album?: string;
  year?: number;
  difficulty?: string;
  youtubeLink?: string;
};

export type ErrorType = 
  | 'VALIDATION_ERROR'
  | 'DATABASE_ERROR'
  | 'UNKNOWN_ERROR';

export interface SubmitError {
  error: ErrorType;
  message: string;
  details?: string;
}

export interface ValidationError {
  field: string;
  message: string;
}

export class DatabaseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: string
  ) {
    super(message);
    this.name = 'DatabaseError';
  }
}