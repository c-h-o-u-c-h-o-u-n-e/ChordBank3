/*
  # Add initial artists list

  1. Changes
    - Insert 30 popular artists into the artists table
    
  2. Notes
    - Artists are added in alphabetical order
    - Names are unique due to the existing constraint
*/

INSERT INTO artists (name) VALUES
  ('Adele'),
  ('Arctic Monkeys'),
  ('Bob Dylan'),
  ('Coldplay'),
  ('David Bowie'),
  ('Ed Sheeran'),
  ('Fleetwood Mac'),
  ('Green Day'),
  ('Harry Styles'),
  ('Imagine Dragons'),
  ('Jack Johnson'),
  ('Kings of Leon'),
  ('Lady Gaga'),
  ('Metallica'),
  ('Nirvana'),
  ('Oasis'),
  ('Pearl Jam'),
  ('Queen'),
  ('Red Hot Chili Peppers'),
  ('System of a Down'),
  ('The Beatles'),
  ('The Cranberries'),
  ('The Doors'),
  ('The Eagles'),
  ('The Killers'),
  ('The Police'),
  ('The Rolling Stones'),
  ('The Strokes'),
  ('U2'),
  ('Van Halen')
ON CONFLICT (name) DO NOTHING;