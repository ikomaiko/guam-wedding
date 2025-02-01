/*
  # Guest Q&A Schema

  1. New Tables
    - `questions`
      - `id` (uuid, primary key)
      - `key` (text, unique)
      - `label` (text)
      - `order` (integer)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `answers`
      - `id` (uuid, primary key)
      - `guest_id` (uuid, references guests)
      - `question_id` (uuid, references questions)
      - `content` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for read/write access
*/

-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  label text NOT NULL,
  order_num integer NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  guest_id uuid REFERENCES guests(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  content text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(guest_id, question_id)
);

-- Enable RLS
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- Create policies for questions
CREATE POLICY "Questions are viewable by all authenticated users"
  ON questions
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policies for answers
CREATE POLICY "Answers are viewable by all authenticated users"
  ON answers
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own answers"
  ON answers
  FOR UPDATE
  USING (auth.uid() = guest_id);

CREATE POLICY "Users can insert their own answers"
  ON answers
  FOR INSERT
  WITH CHECK (auth.uid() = guest_id);

-- Create indexes
CREATE INDEX idx_questions_order ON questions(order_num);
CREATE INDEX idx_answers_guest_id ON answers(guest_id);
CREATE INDEX idx_answers_question_id ON answers(question_id);

-- Insert default questions
INSERT INTO questions (key, label, order_num) VALUES
  ('location', 'どこに住んでる？', 1),
  ('favorite_food', '好きな食べ物は？', 2),
  ('favorite_drink', '好きな飲み物は？', 3),
  ('holiday_activity', '休みの日は何してる？', 4),
  ('favorite_celebrity', '好きな芸能人は？', 5),
  ('impression', '新郎（新婦）の印象は？', 6),
  ('dream', '叶えたいことは？', 7),
  ('memory', '一番の思い出は？', 8),
  ('guam_plan', 'グアムでしたいことは？', 9);