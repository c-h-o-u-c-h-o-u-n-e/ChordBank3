import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

// Récupération des variables d'environnement
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Vérification des variables d'environnement
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Log pour le débogage (à supprimer en production)
console.log('Initializing Supabase client with URL:', supabaseUrl);
console.log('API key starts with:', supabaseAnonKey.substring(0, 5) + '...');

// Création du client Supabase
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);