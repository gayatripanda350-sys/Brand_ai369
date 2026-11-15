import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type BrandGuideline = {
  id: string;
  user_id: string;
  name: string;
  tone: string[];
  voice_description: string;
  color_palette: { name: string; hex: string }[];
  typography: { heading: string; body: string };
  do_list: string[];
  dont_list: string[];
  keywords: string[];
  forbidden_words: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type ContentAnalysis = {
  id: string;
  user_id: string;
  guideline_id: string | null;
  title: string;
  content_text: string;
  overall_score: number;
  tone_score: number;
  consistency_score: number;
  clarity_score: number;
  compliance_score: number;
  word_count: number;
  issues: {
    type: string;
    severity: 'high' | 'medium' | 'low';
    message: string;
    excerpt?: string;
    suggestion?: string;
  }[];
  suggestions: {
    category: string;
    text: string;
    severity: 'high' | 'medium' | 'low';
  }[];
  status: string;
  created_at: string;
};

export type AISuggestion = {
  id: string;
  user_id: string;
  analysis_id: string | null;
  category: string;
  suggestion_text: string;
  severity: 'high' | 'medium' | 'low';
  status: 'pending' | 'applied' | 'dismissed';
  created_at: string;
};
