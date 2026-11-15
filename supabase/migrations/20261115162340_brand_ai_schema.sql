/*
# Brand AI - Schema Setup

Creates the core tables for the Brand AI governance platform.

## New Tables
- `brand_guidelines` — stores brand voice/tone/visual guidelines per user
- `content_analyses` — stores content analysis results (text analyzed + AI scores + suggestions)
- `ai_suggestions` — stores AI-generated suggestions for brand compliance improvements

## Security
- All tables have RLS enabled
- All tables are owner-scoped (user_id defaults to auth.uid())
- Grants limited to `authenticated` role only
- 4 separate policies per table (SELECT, INSERT, UPDATE, DELETE)
*/

-- ============================================================
-- brand_guidelines
-- ============================================================
CREATE TABLE IF NOT EXISTS brand_guidelines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  tone text[] DEFAULT '{}',
  voice_description text DEFAULT '',
  color_palette jsonb DEFAULT '[]'::jsonb,
  typography jsonb DEFAULT '{}'::jsonb,
  do_list text[] DEFAULT '{}',
  dont_list text[] DEFAULT '{}',
  keywords text[] DEFAULT '{}',
  forbidden_words text[] DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE brand_guidelines ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON brand_guidelines TO authenticated;

DROP POLICY IF EXISTS "select_own_guidelines" ON brand_guidelines;
CREATE POLICY "select_own_guidelines" ON brand_guidelines FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_guidelines" ON brand_guidelines;
CREATE POLICY "insert_own_guidelines" ON brand_guidelines FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_guidelines" ON brand_guidelines;
CREATE POLICY "update_own_guidelines" ON brand_guidelines FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_guidelines" ON brand_guidelines;
CREATE POLICY "delete_own_guidelines" ON brand_guidelines FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- content_analyses
-- ============================================================
CREATE TABLE IF NOT EXISTS content_analyses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  guideline_id uuid REFERENCES brand_guidelines(id) ON DELETE SET NULL,
  title text DEFAULT 'Untitled Analysis',
  content_text text NOT NULL,
  overall_score integer DEFAULT 0,
  tone_score integer DEFAULT 0,
  consistency_score integer DEFAULT 0,
  clarity_score integer DEFAULT 0,
  compliance_score integer DEFAULT 0,
  word_count integer DEFAULT 0,
  issues jsonb DEFAULT '[]'::jsonb,
  suggestions jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'completed',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE content_analyses ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON content_analyses TO authenticated;

DROP POLICY IF EXISTS "select_own_analyses" ON content_analyses;
CREATE POLICY "select_own_analyses" ON content_analyses FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_analyses" ON content_analyses;
CREATE POLICY "insert_own_analyses" ON content_analyses FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_analyses" ON content_analyses;
CREATE POLICY "update_own_analyses" ON content_analyses FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_analyses" ON content_analyses;
CREATE POLICY "delete_own_analyses" ON content_analyses FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- ai_suggestions
-- ============================================================
CREATE TABLE IF NOT EXISTS ai_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_id uuid REFERENCES content_analyses(id) ON DELETE CASCADE,
  category text NOT NULL,
  suggestion_text text NOT NULL,
  severity text DEFAULT 'medium',
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE ai_suggestions ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON ai_suggestions TO authenticated;

DROP POLICY IF EXISTS "select_own_suggestions" ON ai_suggestions;
CREATE POLICY "select_own_suggestions" ON ai_suggestions FOR SELECT
TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_suggestions" ON ai_suggestions;
CREATE POLICY "insert_own_suggestions" ON ai_suggestions FOR INSERT
TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_suggestions" ON ai_suggestions;
CREATE POLICY "update_own_suggestions" ON ai_suggestions FOR UPDATE
TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_suggestions" ON ai_suggestions;
CREATE POLICY "delete_own_suggestions" ON ai_suggestions FOR DELETE
TO authenticated USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_brand_guidelines_user_id ON brand_guidelines(user_id);
CREATE INDEX IF NOT EXISTS idx_content_analyses_user_id ON content_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_content_analyses_created_at ON content_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_user_id ON ai_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_suggestions_analysis_id ON ai_suggestions(analysis_id);
