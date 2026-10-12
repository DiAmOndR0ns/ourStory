import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Safe access to Vite environment variables
const env = (typeof import.meta !== 'undefined' && (import.meta as any).env) || {};

export const fallbackUrl = 'https://ezbomqqxcfnfyynmnnll.supabase.co';
export const fallbackKey = 'sb_publishable_Rk3rkxRyjAAfxZQryNUgyA_PhGdfi6V';

/**
 * Validates and sanitizes a Supabase project URL.
 * Rejects any placeholder or dummy domain URLs so queries never fail with ERR_NAME_NOT_RESOLVED.
 */
export const sanitizeSupabaseUrl = (val?: string | null): string => {
  if (!val) return '';
  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.includes('placeholder') ||
    lower.includes('your-project') ||
    lower.includes('xyzabcdefg') ||
    lower.includes('example.com') ||
    !lower.startsWith('http') ||
    !lower.includes('supabase.co')
  ) {
    return '';
  }
  return trimmed;
};

/**
 * Validates and sanitizes a Supabase publishable or anon key.
 */
export const sanitizeSupabaseKey = (val?: string | null): string => {
  if (!val) return '';
  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();
  if (
    lower.includes('placeholder') ||
    lower.includes('your-') ||
    lower.includes('...') ||
    lower.includes('example') ||
    trimmed.length < 20
  ) {
    return '';
  }
  return trimmed;
};

// Immediately clean up any stale or placeholder URLs stored in browser localStorage
if (typeof window !== 'undefined') {
  try {
    const rawUrl = localStorage.getItem('supabase_custom_url');
    if (rawUrl && !sanitizeSupabaseUrl(rawUrl)) {
      localStorage.removeItem('supabase_custom_url');
    }
    const rawKey = localStorage.getItem('supabase_custom_key');
    if (rawKey && !sanitizeSupabaseKey(rawKey)) {
      localStorage.removeItem('supabase_custom_key');
    }
    // Sweep all localStorage keys and remove any items containing placeholder domains
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key) {
        const itemVal = localStorage.getItem(key);
        if (typeof itemVal === 'string' && (
          itemVal.includes('placeholder') ||
          itemVal.includes('your-project') ||
          itemVal.includes('xyzabcdefg')
        )) {
          // If it was custom URL or key with placeholder, wipe it out
          if (key.includes('supabase_custom')) {
            localStorage.removeItem(key);
          }
        }
      }
    }
  } catch (e) {
    console.warn('LocalStorage cleanup warning:', e);
  }
}

// Allow setting Supabase credentials via environment variables OR saved in localStorage OR verified project fallback
export const getSupabaseConfig = () => {
  const localUrl = typeof window !== 'undefined' ? localStorage.getItem('supabase_custom_url') : null;
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('supabase_custom_key') : null;

  const validLocalUrl = sanitizeSupabaseUrl(localUrl);
  const validLocalKey = sanitizeSupabaseKey(localKey);

  const envUrl = sanitizeSupabaseUrl(env.VITE_SUPABASE_URL || env.SUPABASE_URL);
  const envKey = sanitizeSupabaseKey(env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY);

  const url = validLocalUrl || envUrl || fallbackUrl;
  const anonKey = validLocalKey || envKey || fallbackKey;

  return { url, anonKey };
};

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  if (typeof window !== 'undefined') {
    const cleanUrl = sanitizeSupabaseUrl(url);
    const cleanKey = sanitizeSupabaseKey(anonKey);

    if (cleanUrl) localStorage.setItem('supabase_custom_url', cleanUrl);
    else localStorage.removeItem('supabase_custom_url');

    if (cleanKey) localStorage.setItem('supabase_custom_key', cleanKey);
    else localStorage.removeItem('supabase_custom_key');
    
    // Invalidate client so next call creates a fresh client
    activeClient = null;
    lastUsedUrl = '';
    lastUsedKey = '';

    // Dispatch event so UI updates immediately
    window.dispatchEvent(new Event('supabase_config_updated'));
  }
};

export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getSupabaseConfig();
  const lowerUrl = (url || '').toLowerCase();
  return Boolean(
    url && 
    anonKey && 
    lowerUrl.includes('supabase.co') && 
    !lowerUrl.includes('placeholder') &&
    !lowerUrl.includes('your-project') &&
    !lowerUrl.includes('xyzabcdefg')
  );
};

let activeClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

export const getSupabaseClient = (): SupabaseClient => {
  const { url, anonKey } = getSupabaseConfig();

  if (!activeClient || lastUsedUrl !== url || lastUsedKey !== anonKey) {
    lastUsedUrl = url;
    lastUsedKey = anonKey;
    activeClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      }
    });
  }
  return activeClient;
};

// Export Proxy so any code importing `supabase` directly always delegates to current activeClient
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = (client as any)[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});

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

-- 8. Seed Default Story Chapters
INSERT INTO public.chapters (id, title, description, date, "order")
VALUES 
  ('chapter-1', 'Chapter 1: The Spark & The Start', 'Where two worlds collided into our Ohana adventure', 'Nov 2024', 1),
  ('chapter-2', 'Chapter 2: Winter Warmth & New Habits', 'First holidays, cozy dinners, and becoming each other''s safe haven', 'Dec 2024 - Apr 2025', 2),
  ('chapter-3', 'Chapter 3: Summer Escapes & Golden Hours', 'Sunny roadtrips, late night laughs, and unhurried days', 'May 2025 - Aug 2025', 3),
  ('chapter-4', 'Chapter 4: Little Routines & Big Promises', 'The magic in grocery runs, cooked breakfasts, and quiet moments', 'Sep 2025 - Oct 2025', 4),
  ('chapter-5', 'Chapter 5: Two Years Strong & Growing', 'Celebrating 730 days of unconditional love and our monthsary on Nov 3', 'Nov 2025 - Oct 2026', 5),
  ('chapter-6', 'Chapter 6: Forever and Beyond', 'All the chapters yet to be written, with you always', 'Nov 2026 & Beyond', 6)
ON CONFLICT (id) DO NOTHING;
`;
