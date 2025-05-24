import { supabase } from './config/supabase';

// Cette fonction va tester l'ajout d'une partition simplifiée
export const debugAddPartition = async () => {
  console.log("Démarrage du test de sauvegarde de partition...");
  
  try {
    // 0. Afficher les informations complètes de connexion Supabase
    console.log("URL Supabase:", supabase.supabaseUrl);
    
    // Masquer la partie sensible de la clé API mais montrer le début pour vérifier
    const apiKey = supabase.supabaseKey;
    const maskedKey = apiKey.substring(0, 10) + "..." + apiKey.substring(apiKey.length - 5);
    console.log("Clé d'API (partiellement masquée):", maskedKey);
    
    // 1. Test de la connexion à Supabase avec une requête simple
    console.log("1. Test de connexion à Supabase...");
    const { data: connectionTest, error: connectionError } = await supabase
      .from('artists')
      .select('*')
      .limit(1);
      
    if (connectionError) {
      console.error("Erreur de connexion à Supabase:", connectionError);
      return;
    }
    console.log("Connexion à Supabase OK:", connectionTest);
    
    // 1.5 Vérifier les colonnes de la table partition
    console.log("1.5. Vérification des colonnes de la table partitions...");
    await checkTableColumns('partitions');
    
    // 2. Test de la fonction RPC
    console.log("2. Test de la fonction RPC add_partition...");
    
    // Vérifier si la fonction RPC existe
    const { data: functions, error: functionsError } = await supabase
      .rpc('test_function_exists', { function_name: 'add_partition' });
    
    if (functionsError) {
      console.error("Erreur lors de la vérification de la fonction RPC:", functionsError);
      console.log("La fonction test_function_exists n'existe peut-être pas. Essayons directement add_partition.");
    } else {
      console.log("Résultat de la vérification:", functions);
    }
    
    // 2.1 Vérifier les paramètres attendus par add_partition
    console.log("2.1. Vérification des paramètres de add_partition...");
    const { data: parameters, error: parametersError } = await supabase
      .rpc('get_add_partition_parameters');
      
    if (parametersError) {
      console.error("Erreur lors de la récupération des paramètres:", parametersError);
    } else {
      console.log("Paramètres de add_partition:", parameters);
    }
    
    // 2.2 Essayer d'appeler la fonction RPC avec des données minimales
    const testData = {
      p_artist: "Artiste de test",
      p_title: "Titre de test",
      p_tuning: "Standard",
      p_key: "C",
      p_capo: "No Capo",
      p_tempo: "120 BPM",
      p_time_signature: "4/4",
      p_rhythm: "↓ ↑ ↓ ↑",
      p_lyrics: "Paroles de test",
      p_chords: ["C", "G"],
      p_fingerings: ["X32010", "320003"],
      p_youtube_link: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" // Ajout du lien YouTube
    };
    
    console.log("Appel de add_partition avec:", testData);
    
    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('add_partition', testData);
    
    if (rpcError) {
      console.error("Erreur lors de l'appel à add_partition:", rpcError);
      
      // 3. Test d'insertion directe dans les tables
      console.log("3. Essai d'insertion directe...");
      
      // Insérer l'artiste
      const { data: artistData, error: artistError } = await supabase
        .from('artists')
        .upsert({ name: testData.p_artist }, { onConflict: 'name' })
        .select();
      
      if (artistError) {
        console.error("Erreur lors de l'insertion de l'artiste:", artistError);
        return;
      }
      
      const artistId = artistData[0]?.id;
      console.log("Artiste inséré avec ID:", artistId);
      
      // Insérer la partition
      const { data: partitionData, error: partitionError } = await supabase
        .from('partitions')
        .insert({
          artist_id: artistId,
          title: testData.p_title,
          tuning: testData.p_tuning,
          key_signature: testData.p_key,
          capo: testData.p_capo,
          tempo: testData.p_tempo,
          time_signature: testData.p_time_signature,
          rhythm: testData.p_rhythm,
          lyrics: testData.p_lyrics
        })
        .select();
      
      if (partitionError) {
        console.error("Erreur lors de l'insertion de la partition:", partitionError);
        return;
      }
      
      console.log("Partition insérée avec succès:", partitionData);
    } else {
      console.log("Fonction RPC exécutée avec succès:", rpcResult);
    }
    
  } catch (error) {
    console.error("Erreur générale lors du test:", error);
  }
};

// Fonction pour vérifier les colonnes d'une table
export const checkTableColumns = async (tableName: string) => {
  console.log(`Vérification des colonnes de la table '${tableName}'...`);
  
  try {
    const { data, error } = await supabase
      .rpc('get_table_columns', { table_name: tableName });
      
    if (error) {
      console.error(`Erreur lors de la vérification des colonnes de '${tableName}':`, error);
      return;
    }
    
    console.log(`Colonnes de la table '${tableName}':`, data);
  } catch (error) {
    console.error(`Erreur générale lors de la vérification de la table '${tableName}':`, error);
  }
};
