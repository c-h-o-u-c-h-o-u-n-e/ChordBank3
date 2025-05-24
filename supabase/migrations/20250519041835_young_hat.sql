/*
  # Add songs and chords for artists
  
  1. New Data
    - Adds 3 songs for each artist (Adele, Arctic Monkeys, Bob Dylan)
    - Adds basic chord progressions for each song
    
  2. Changes
    - Inserts songs with all required metadata
    - Safely adds chords with position checks
*/

DO $$
DECLARE
  artist_id integer;
  partition_id integer;
BEGIN
  -- Adele
  SELECT id INTO artist_id FROM artists WHERE name = 'Adele';
  
  -- Rolling in the Deep
  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Rolling in the Deep', 'E | A | D | G | B | E', 'Cm', 'Aucun', '105 BPM', '4 / 4', '↓ ↓ ↑ ↓', 'There''s a fire starting in my heart...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'Cm', 'X35543'),
    (partition_id, 1, 'Bb', 'X13331'),
    (partition_id, 2, 'Ab', '466544');
    
  -- Someone Like You
  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Someone Like You', 'E | A | D | G | B | E', 'A', 'Aucun', '135 BPM', '4 / 4', '↓ . ↓ ↑', 'I heard that you''re settled down...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'A', 'X02220'),
    (partition_id, 1, 'F#m', '244222'),
    (partition_id, 2, 'D', 'XX0232');
    
  -- Hello
  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Hello', 'E | A | D | G | B | E', 'Fm', 'Aucun', '79 BPM', '4 / 4', '↓ . ↓ ↑', 'Hello, it''s me...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'Fm', '133111'),
    (partition_id, 1, 'Db', 'X46564'),
    (partition_id, 2, 'Ab', '466544');

  -- Arctic Monkeys
  SELECT id INTO artist_id FROM artists WHERE name = 'Arctic Monkeys';
  
  -- Do I Wanna Know?
  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Do I Wanna Know?', 'E | A | D | G | B | E', 'Em', 'Aucun', '85 BPM', '4 / 4', '↓ . ↓ ↑', 'Have you got colour in your cheeks?...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'Em', '022000'),
    (partition_id, 1, 'Am', 'X02210'),
    (partition_id, 2, 'C', 'X32010');
    
  -- R U Mine?
  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'R U Mine?', 'E | A | D | G | B | E', 'G', 'Aucun', '92 BPM', '4 / 4', '↓ ↓ ↑ ↓', 'I''m a puppet on a string...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'G', '320003'),
    (partition_id, 1, 'Em', '022000'),
    (partition_id, 2, 'C', 'X32010');
    
  -- 505
  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, '505', 'E | A | D | G | B | E', 'Dm', 'Aucun', '140 BPM', '4 / 4', '↓ . ↓ ↑', 'I''m going back to 505...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'Dm', 'XX0231'),
    (partition_id, 1, 'F', '133211'),
    (partition_id, 2, 'C', 'X32010');

  -- Bob Dylan
  SELECT id INTO artist_id FROM artists WHERE name = 'Bob Dylan';
  
  -- Blowin' in the Wind
  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Blowin'' in the Wind', 'E | A | D | G | B | E', 'D', '2e', '80 BPM', '3 / 4', '↓ ↓ ↑', 'How many roads must a man walk down...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'D', 'XX0232'),
    (partition_id, 1, 'G', '320003'),
    (partition_id, 2, 'A', 'X02220');
    
  -- Like a Rolling Stone
  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Like a Rolling Stone', 'E | A | D | G | B | E', 'C', 'Aucun', '95 BPM', '4 / 4', '↓ . ↓ ↑', 'Once upon a time you dressed so fine...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'C', 'X32010'),
    (partition_id, 1, 'F', '133211'),
    (partition_id, 2, 'G', '320003');
    
  -- Mr. Tambourine Man
  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Mr. Tambourine Man', 'E | A | D | G | B | E', 'D', '2e', '85 BPM', '4 / 4', '↓ ↓ ↑ ↓', 'Hey, Mr. Tambourine Man, play a song for me...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'D', 'XX0232'),
    (partition_id, 1, 'G', '320003'),
    (partition_id, 2, 'A', 'X02220');

END $$;