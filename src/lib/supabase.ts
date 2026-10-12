import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Safe access to Vite environment variables
const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};

// Allow setting Supabase credentials via environment variables OR saved in localStorage
export const getSupabaseConfig = () => {
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('supabase_custom_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('supabase_custom_key') : null;

  const url = env.VITE_SUPABASE_URL || localUrl || '';
  const anonKey = env.VITE_SUPABASE_ANON_KEY || localKey || '';

  return { url: url.trim(), anonKey: anonKey.trim() };
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  if (typeof window !== 'undefined') {
    if (url.trim()) localStorage.setItem('supabase_custom_url', url.trim());
    else localStorage.removeItem('supabase_custom_url');

    if (anonKey.trim()) localStorage.setItem('supabase_custom_key', anonKey.trim());
    else localStorage.removeItem('supabase_custom_key');
    
    // Dispatch event so UI updates immediately
    window.dispatchEvent(new Event('supabase_config_updated'));
  }
};

const initialConfig = getSupabaseConfig();

// Fallback dummy values if not yet configured, to avoid crash on createClient
const fallbackUrl = 'https://placeholder-project.supabase.co';
const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.placeholder';

export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.includes('supabase.co') && !url.includes('placeholder-project'));
};

export const supabase: SupabaseClient = createClient(
  initialConfig.url || fallbackUrl,
  initialConfig.anonKey || fallbackKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

/**
 * SQL Setup script that user can run in Supabase SQL Editor with 1-click
 */
export const SUPABASE_SETUP_SQL = `-- 1. Chapters Table
CREATE TABLE IF NOT EXISTS public.chapters (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT,
  "order" INTEGER NOT NULL DEFAULT 1,
  cover_image TEXT,
  highlight_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Memories Table
CREATE TABLE IF NOT EXISTS public.memories (
  id TEXT PRIMARY KEY,
  chapter_id TEXT NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  date TEXT NOT NULL,
  location TEXT DEFAULT '',
  cover_media_id TEXT,
  song JSONB,
  media JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Media Items Table (Individual Photos / Videos)
CREATE TABLE IF NOT EXISTS public.media (
  id TEXT PRIMARY KEY,
  memory_id TEXT REFERENCES public.memories(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('image', 'video')),
  storage_path TEXT NOT NULL,
  caption TEXT DEFAULT '',
  "order" INTEGER DEFAULT 1,
  film_type TEXT DEFAULT 'Polaroid',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Letters Table
CREATE TABLE IF NOT EXISTS public.letters (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  unlock_date TEXT NOT NULL,
  theme_tag TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Little Things Table
CREATE TABLE IF NOT EXISTS public.little_things (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  "order" INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Enable Public Read Access and Allow Admin Writes
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.letters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.little_things ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read chapters" ON public.chapters FOR SELECT USING (true);
CREATE POLICY "Public write chapters" ON public.chapters FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read memories" ON public.memories FOR SELECT USING (true);
CREATE POLICY "Public write memories" ON public.memories FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read media" ON public.media FOR SELECT USING (true);
CREATE POLICY "Public write media" ON public.media FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read letters" ON public.letters FOR SELECT USING (true);
CREATE POLICY "Public write letters" ON public.letters FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public read little_things" ON public.little_things FOR SELECT USING (true);
CREATE POLICY "Public write little_things" ON public.little_things FOR ALL USING (true) WITH CHECK (true);

-- 7. Create Public Storage Bucket for Memories
INSERT INTO storage.buckets (id, name, public)
VALUES ('memories', 'memories', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage bucket access policies
CREATE POLICY "Public read access for memories bucket"
ON storage.objects FOR SELECT
USING (bucket_id = 'memories');

CREATE POLICY "Public insert access for memories bucket"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'memories');

CREATE POLICY "Public delete access for memories bucket"
ON storage.objects FOR DELETE
USING (bucket_id = 'memories');
`;
