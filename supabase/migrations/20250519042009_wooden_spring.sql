/*
  # Add songs for additional artists
  
  1. New Content
    - Add 3 songs each for 10 more artists
    - Include appropriate chords for each song
    - Add realistic song metadata (tuning, tempo, etc.)
  
  2. Artists Added
    - Coldplay
    - David Bowie
    - Ed Sheeran
    - Fleetwood Mac
    - Green Day
    - Harry Styles
    - Imagine Dragons
    - Jack Johnson
    - Kings of Leon
    - Lady Gaga
*/

DO $$
DECLARE
  artist_id integer;
  partition_id integer;
BEGIN
  -- Coldplay
  SELECT id INTO artist_id FROM artists WHERE name = 'Coldplay';
  
  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Yellow', 'E | A | D | G | B | E', 'G', '4e', '86 BPM', '4 / 4', '↓ ↓ ↑ ↓ ↑', 'Look at the stars, look how they shine for you...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'G', '320003'),
    (partition_id, 1, 'D', 'XX0232'),
    (partition_id, 2, 'C', 'X32010');

  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Fix You', 'E | A | D | G | B | E', 'C', 'Aucun', '138 BPM', '4 / 4', '↓ . ↓ ↑', 'When you try your best but you don''t succeed...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'C', 'X32010'),
    (partition_id, 1, 'Em', '022000'),
    (partition_id, 2, 'Am', 'X02210');

  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'The Scientist', 'E | A | D | G | B | E', 'D', 'Aucun', '146 BPM', '4 / 4', '↓ ↓ ↑ ↓', 'Come up to meet you, tell you I''m sorry...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'D', 'XX0232'),
    (partition_id, 1, 'Bm', 'X24432'),
    (partition_id, 2, 'G', '320003');

  -- David Bowie
  SELECT id INTO artist_id FROM artists WHERE name = 'David Bowie';
  
  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Space Oddity', 'E | A | D | G | B | E', 'C', 'Aucun', '136 BPM', '4 / 4', '↓ . ↓ ↑', 'Ground control to Major Tom...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'C', 'X32010'),
    (partition_id, 1, 'Em', '022000'),
    (partition_id, 2, 'F', '133211');

  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Heroes', 'E | A | D | G | B | E', 'D', 'Aucun', '148 BPM', '4 / 4', '↓ ↓ ↑ ↓', 'I, I will be king...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'D', 'XX0232'),
    (partition_id, 1, 'G', '320003'),
    (partition_id, 2, 'Em', '022000');

  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Starman', 'E | A | D | G | B | E', 'Bb', 'Aucun', '126 BPM', '4 / 4', '↓ . ↓ ↑', 'Didn''t know what time it was...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'Bb', 'X13331'),
    (partition_id, 1, 'F', '133211'),
    (partition_id, 2, 'Gm', '355333');

  -- Ed Sheeran
  SELECT id INTO artist_id FROM artists WHERE name = 'Ed Sheeran';
  
  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Perfect', 'E | A | D | G | B | E', 'Ab', '1er', '95 BPM', '4 / 4', '↓ ↓ ↑ ↓ ↑', 'I found a love for me...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'G', '320003'),
    (partition_id, 1, 'Em', '022000'),
    (partition_id, 2, 'C', 'X32010');

  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Shape of You', 'E | A | D | G | B | E', 'Em', 'Aucun', '96 BPM', '4 / 4', '↓ . ↑ ↓ ↑', 'The club isn''t the best place to find a lover...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'Em', '022000'),
    (partition_id, 1, 'C', 'X32010'),
    (partition_id, 2, 'G', '320003');

  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Thinking Out Loud', 'E | A | D | G | B | E', 'D', 'Aucun', '79 BPM', '4 / 4', '↓ ↓ ↑ ↓', 'When your legs don''t work like they used to before...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'D', 'XX0232'),
    (partition_id, 1, 'Em', '022000'),
    (partition_id, 2, 'G', '320003');

  -- Fleetwood Mac
  SELECT id INTO artist_id FROM artists WHERE name = 'Fleetwood Mac';
  
  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Dreams', 'E | A | D | G | B | E', 'F', 'Aucun', '120 BPM', '4 / 4', '↓ . ↓ ↑', 'Now here you go again...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'F', '133211'),
    (partition_id, 1, 'G', '320003'),
    (partition_id, 2, 'Am', 'X02210');

  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Landslide', 'E | A | D | G | B | E', 'Eb', '3e', '78 BPM', '3 / 4', '↓ ↓ ↑', 'I took my love, I took it down...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'C', 'X32010'),
    (partition_id, 1, 'G', '320003'),
    (partition_id, 2, 'Am', 'X02210');

  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Go Your Own Way', 'E | A | D | G | B | E', 'F', 'Aucun', '155 BPM', '4 / 4', '↓ ↓ ↑ ↓', 'Loving you isn''t the right thing to do...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'F', '133211'),
    (partition_id, 1, 'Bb', 'X13331'),
    (partition_id, 2, 'C', 'X32010');

  -- Green Day
  SELECT id INTO artist_id FROM artists WHERE name = 'Green Day';
  
  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Boulevard of Broken Dreams', 'E | A | D | G | B | E', 'Em', 'Aucun', '168 BPM', '4 / 4', '↓ ↓ ↑ ↓', 'I walk a lonely road...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'Em', '022000'),
    (partition_id, 1, 'G', '320003'),
    (partition_id, 2, 'D', 'XX0232');

  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Wake Me Up When September Ends', 'E | A | D | G | B | E', 'G', 'Aucun', '105 BPM', '4 / 4', '↓ . ↓ ↑', 'Summer has come and passed...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'G', '320003'),
    (partition_id, 1, 'D', 'XX0232'),
    (partition_id, 2, 'Em', '022000');

  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, '21 Guns', 'E | A | D | G | B | E', 'C', 'Aucun', '168 BPM', '4 / 4', '↓ ↓ ↑ ↓', 'Do you know what''s worth fighting for...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'C', 'X32010'),
    (partition_id, 1, 'F', '133211'),
    (partition_id, 2, 'Am', 'X02210');

  -- Harry Styles
  SELECT id INTO artist_id FROM artists WHERE name = 'Harry Styles';
  
  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Watermelon Sugar', 'E | A | D | G | B | E', 'C', 'Aucun', '96 BPM', '4 / 4', '↓ . ↓ ↑', 'Tastes like strawberries...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'C', 'X32010'),
    (partition_id, 1, 'F', '133211'),
    (partition_id, 2, 'Am', 'X02210');

  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Sign of the Times', 'E | A | D | G | B | E', 'F', 'Aucun', '120 BPM', '4 / 4', '↓ ↓ ↑ ↓', 'Just stop your crying it''s a sign of the times...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'F', '133211'),
    (partition_id, 1, 'Am', 'X02210'),
    (partition_id, 2, 'C', 'X32010');

  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'As It Was', 'E | A | D | G | B | E', 'Am', 'Aucun', '174 BPM', '4 / 4', '↓ . ↓ ↑', 'Holdin'' me back, gravity''s holdin'' me back...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'Am', 'X02210'),
    (partition_id, 1, 'C', 'X32010'),
    (partition_id, 2, 'F', '133211');

  -- Imagine Dragons
  SELECT id INTO artist_id FROM artists WHERE name = 'Imagine Dragons';
  
  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Radioactive', 'E | A | D | G | B | E', 'Am', 'Aucun', '136 BPM', '4 / 4', '↓ ↓ ↑ ↓', 'I''m waking up to ash and dust...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'Am', 'X02210'),
    (partition_id, 1, 'C', 'X32010'),
    (partition_id, 2, 'G', '320003');

  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Demons', 'E | A | D | G | B | E', 'D', 'Aucun', '90 BPM', '4 / 4', '↓ . ↓ ↑', 'When the days are cold...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'D', 'XX0232'),
    (partition_id, 1, 'A', 'X02220'),
    (partition_id, 2, 'Bm', 'X24432');

  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Believer', 'E | A | D | G | B | E', 'Dm', 'Aucun', '125 BPM', '4 / 4', '↓ ↓ ↑ ↓', 'First things first I''ma say all the words inside my head...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'Dm', 'XX0231'),
    (partition_id, 1, 'F', '133211'),
    (partition_id, 2, 'C', 'X32010');

  -- Jack Johnson
  SELECT id INTO artist_id FROM artists WHERE name = 'Jack Johnson';
  
  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Better Together', 'E | A | D | G | B | E', 'G', '5e', '76 BPM', '4 / 4', '↓ . ↓ ↑', 'There''s no combination of words...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'G', '320003'),
    (partition_id, 1, 'C', 'X32010'),
    (partition_id, 2, 'Am', 'X02210');

  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Banana Pancakes', 'E | A | D | G | B | E', 'G', '5e', '84 BPM', '4 / 4', '↓ ↓ ↑ ↓', 'Can''t you see that it''s just raining...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'G', '320003'),
    (partition_id, 1, 'Em', '022000'),
    (partition_id, 2, 'C', 'X32010');

  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Upside Down', 'E | A | D | G | B | E', 'C', '4e', '92 BPM', '4 / 4', '↓ . ↓ ↑', 'Who''s to say what''s impossible...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'C', 'X32010'),
    (partition_id, 1, 'G', '320003'),
    (partition_id, 2, 'Am', 'X02210');

  -- Kings of Leon
  SELECT id INTO artist_id FROM artists WHERE name = 'Kings of Leon';
  
  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Sex on Fire', 'E | A | D | G | B | E', 'Am', 'Aucun', '153 BPM', '4 / 4', '↓ ↓ ↑ ↓', 'Lay where you''re laying...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'Am', 'X02210'),
    (partition_id, 1, 'F', '133211'),
    (partition_id, 2, 'C', 'X32010');

  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Use Somebody', 'E | A | D | G | B | E', 'C', 'Aucun', '134 BPM', '4 / 4', '↓ . ↓ ↑', 'I''ve been roaming around...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'C', 'X32010'),
    (partition_id, 1, 'Am', 'X02210'),
    (partition_id, 2, 'F', '133211');

  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Closer', 'E | A | D | G | B | E', 'G', 'Aucun', '127 BPM', '4 / 4', '↓ ↓ ↑ ↓', 'Stranded in this spooky town...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'G', '320003'),
    (partition_id, 1, 'Em', '022000'),
    (partition_id, 2, 'C', 'X32010');

  -- Lady Gaga
  SELECT id INTO artist_id FROM artists WHERE name = 'Lady Gaga';
  
  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Shallow', 'E | A | D | G | B | E', 'Em', 'Aucun', '96 BPM', '4 / 4', '↓ . ↓ ↑', 'Tell me somethin'' girl...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'Em', '022000'),
    (partition_id, 1, 'D', 'XX0232'),
    (partition_id, 2, 'G', '320003');

  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Million Reasons', 'E | A | D | G | B | E', 'C', 'Aucun', '129 BPM', '4 / 4', '↓ ↓ ↑ ↓', 'You''re giving me a million reasons to let you go...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'C', 'X32010'),
    (partition_id, 1, 'G', '320003'),
    (partition_id, 2, 'Am', 'X02210');

  INSERT INTO partitions (artist_id, title, tuning, key_signature, capo, tempo, time_signature, rhythm, lyrics)
  VALUES (artist_id, 'Always Remember Us This Way', 'E | A | D | G | B | E', 'G', 'Aucun', '120 BPM', '4 / 4', '↓ . ↓ ↑', 'That Arizona sky burning in your eyes...')
  RETURNING id INTO partition_id;
  
  INSERT INTO partition_chords (partition_id, position, chord, fingering)
  VALUES 
    (partition_id, 0, 'G', '320003'),
    (partition_id, 1, 'D', 'XX0232'),
    (partition_id, 2, 'Em', '022000');

END $$;