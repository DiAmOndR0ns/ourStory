export interface MediaItem {
  id: string;
  memory_id?: string;
  type: 'image' | 'video';
  storage_path: string;
  caption?: string;
  order: number;
  date?: string;
  film_type?: string;
}

export interface SongInfo {
  title: string;
  artist: string;
  url?: string;
}

export interface MemoryItem {
  id: string;
  chapter_id: string;
  title: string;
  description: string;
  date: string;
  location?: string;
  cover_media_id?: string;
  song?: SongInfo;
  media: MediaItem[];
}

export interface ChapterItem {
  id: string;
  title: string;
  description: string;
  date: string;
  order: number;
  cover_image?: string;
  highlight_count?: number;
}
