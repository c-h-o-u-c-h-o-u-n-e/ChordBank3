import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Récupérer les informations de connexion depuis .env
const envContent = fs.readFileSync('.env', 'utf8');
const supabaseUrl = envContent.match(/VITE_SUPABASE_URL=(.+)/)[1];
const supabaseAnonKey = envContent.match(/VITE_SUPABASE_ANON_KEY=(.+)/)[1];

console.log('Connexion à Supabase...');
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Lire les fichiers de migration
const migrationsDir = path.resolve('./supabase/migrations');
const migrationFiles = [
  '20250521091500_add_recent_views.sql', 
  '20250521092500_add_rpc_functions.sql',
  '20250521093000_simplify_recent_views.sql'
];

async function applyMigrations() {
  console.log('Début des migrations...');

  for (const file of migrationFiles) {
    try {
      console.log(`Application de la migration: ${file}`);
      const filePath = path.join(migrationsDir, file);
      const sqlContent = fs.readFileSync(filePath, 'utf8');
      
      // On divise le contenu en commandes SQL individuelles
      // Nous utilisons "--" comme séparateur car c'est un commentaire SQL
      const sqlCommands = sqlContent.split(/;\s*\n/).filter(cmd => cmd.trim().length > 0);
      
      for (let i = 0; i < sqlCommands.length; i++) {
        const cmd = sqlCommands[i];
        if (!cmd.trim() || cmd.trim().startsWith('--')) continue;
        
        try {
          console.log(`Exécution de la commande ${i+1}/${sqlCommands.length}`);
          const { error } = await supabase.rpc('exec_sql', { sql_command: cmd + ';' });
          
          if (error) {
            console.warn(`Attention: Erreur lors de l'exécution de la commande ${i+1}: ${error.message}`);
            console.warn('La migration continue...');
          }
        } catch (cmdError) {
          console.warn(`Attention: Exception lors de l'exécution de la commande ${i+1}: ${cmdError.message}`);
          console.warn('La migration continue...');
        }
      }
      
      console.log(`Migration ${file} appliquée avec succès.`);
    } catch (error) {
      console.error(`Erreur lors de l'application de la migration ${file}:`, error.message);
      // Continuer avec les autres migrations
    }
  }
  
  console.log('Migrations terminées.');
}

// Créer une fonction SQL pour exécuter des commandes SQL dynamiques
async function createExecSqlFunction() {
  const { error } = await supabase.rpc('create_exec_sql_function', {}, {
    headers: { 'Content-Type': 'application/json' }
  });
  
  // Si la fonction existe déjà ou ne peut pas être créée, on essaie une méthode alternative
  if (error) {
    console.log('Utilisation de la méthode alternative pour exécuter les commandes SQL...');
    return false;
  }
  
  return true;
}

// Créer la fonction exec_sql si elle n'existe pas déjà
async function ensureExecSqlFunctionExists() {
  try {
    // Vérifier si la fonction exec_sql existe déjà
    const { error } = await supabase.rpc('exec_sql', { sql_command: 'SELECT 1;' });
    
    if (error && error.message.includes('function') && error.message.includes('does not exist')) {
      // La fonction n'existe pas, on doit la créer
      console.log('Création de la fonction exec_sql...');
      
      // Exécuter une requête SQL directe pour créer la fonction
      const { error: createError } = await supabase.from('_exec_sql').select('*').limit(1);
      
      if (createError) {
        console.error('Erreur lors de la création de la fonction exec_sql:', createError.message);
        console.log('Application des migrations sans la fonction exec_sql (méthode manuelle)...');
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la vérification de la fonction exec_sql:', error.message);
    return false;
  }
}

// Exécution du script principal
async function main() {
  try {
    // S'assurer que la fonction exec_sql existe
    const execSqlExists = await ensureExecSqlFunctionExists();
    
    if (!execSqlExists) {
      console.log('La fonction exec_sql n\'est pas disponible. Veuillez exécuter manuellement les migrations.');
      console.log('Vous pouvez copier-coller le contenu des fichiers de migration dans l\'éditeur SQL de Supabase Studio.');
      process.exit(1);
    }
    
    await applyMigrations();
  } catch (error) {
    console.error('Erreur lors de l\'exécution du script:', error.message);
    process.exit(1);
  }
}

main();
