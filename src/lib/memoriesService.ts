import { collection, addDoc, getDocs, doc, getDoc, query, orderBy, deleteDoc, where } from "firebase/firestore";
import { db } from "./firebase";
import { DEFAULT_MEMORIES, DEFAULT_CHAPTERS } from "../data/defaultStoryData";
import { MemoryItem, MediaItem } from "../types";

const LOCAL_STORAGE_KEY = "love_story_user_memories";
const DELETED_MEMORIES_KEY = "love_story_deleted_memories";
const MEMORIES_EVENT = "love_story_memories_updated";

/**
 * Months metadata mapping
 */
export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const MONTH_SHORT_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export interface MonthTimelineBucket {
  key: string; // e.g. "2024-01"
  year: number;
  month: number; // 1-12
  monthName: string;
  label: string; // "January 2024"
  season: "Winter" | "Spring" | "Summer" | "Autumn";
  chapterId: string;
  chapterOrder: number;
  chapterTitle: string;
  isSpecialMilestone?: boolean;
  milestoneTitle?: string;
  memories: MemoryItem[];
  hasMemory: boolean;
}

/**
 * Parses any date string into year, month, and formatted labels
 */
export function parseMemoryDate(dateStr: string): {
  year: number;
  month: number; // 1-12
  monthKey: string; // "YYYY-MM"
  monthName: string;
  label: string;
  timestamp: number;
} {
  if (!dateStr) {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth() + 1;
    return {
      year: y,
      month: m,
      monthKey: `${y}-${String(m).padStart(2, "0")}`,
      monthName: MONTH_NAMES[m - 1],
      label: `${MONTH_NAMES[m - 1]} ${y}`,
      timestamp: now.getTime()
    };
  }

  // 1. Try standard Date.parse
  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) {
    const y = parsed.getFullYear();
    const m = parsed.getMonth() + 1;
    return {
      year: y,
      month: m,
      monthKey: `${y}-${String(m).padStart(2, "0")}`,
      monthName: MONTH_NAMES[m - 1],
      label: `${MONTH_NAMES[m - 1]} ${y}`,
      timestamp: parsed.getTime()
    };
  }

  // 2. Check for "MonthName Year" or "MonthShort Day, Year"
  for (let i = 0; i < 12; i++) {
    const longName = MONTH_NAMES[i].toLowerCase();
    const shortName = MONTH_SHORT_NAMES[i].toLowerCase();
    const lower = dateStr.toLowerCase();

    if (lower.includes(longName) || lower.includes(shortName)) {
      const yearMatch = dateStr.match(/\b(202[3-9])\b/);
      const year = yearMatch ? parseInt(yearMatch[1], 10) : 2024;
      const m = i + 1;
      return {
        year,
        month: m,
        monthKey: `${year}-${String(m).padStart(2, "0")}`,
        monthName: MONTH_NAMES[i],
        label: `${MONTH_NAMES[i]} ${year}`,
        timestamp: new Date(year, i, 15).getTime()
      };
    }
  }

  // 3. Fallback: match YYYY-MM
  const yyyyMm = dateStr.match(/\b(202[3-9])-(\d{1,2})\b/);
  if (yyyyMm) {
    const y = parseInt(yyyyMm[1], 10);
    const m = Math.min(12, Math.max(1, parseInt(yyyyMm[2], 10)));
    return {
      year: y,
      month: m,
      monthKey: `${y}-${String(m).padStart(2, "0")}`,
      monthName: MONTH_NAMES[m - 1],
      label: `${MONTH_NAMES[m - 1]} ${y}`,
      timestamp: new Date(y, m - 1, 1).getTime()
    };
  }

  // Default fallback to Nov 2024
  return {
    year: 2024,
    month: 11,
    monthKey: "2024-11",
    monthName: "November",
    label: "November 2024",
    timestamp: new Date(2024, 10, 2).getTime()
  };
}

/**
 * Determines which Chapter a date naturally maps to
 */
export function inferChapterIdFromDate(dateStr: string): { chapterId: string; chapterOrder: number } {
  const { year, month } = parseMemoryDate(dateStr);

  if (year < 2024 || (year === 2024 && month <= 11)) {
    return { chapterId: "chapter-1", chapterOrder: 1 };
  }
  if (year === 2024 && month === 12) {
    return { chapterId: "chapter-1", chapterOrder: 1 };
  }
  if (year === 2025 && month <= 4) {
    return { chapterId: "chapter-2", chapterOrder: 2 };
  }
  if (year === 2025 && month >= 5 && month <= 8) {
    return { chapterId: "chapter-3", chapterOrder: 3 };
  }
  if (year === 2025 && (month === 9 || month === 10)) {
    return { chapterId: "chapter-4", chapterOrder: 4 };
  }
  if ((year === 2025 && month >= 11) || (year === 2026 && month <= 10)) {
    return { chapterId: "chapter-5", chapterOrder: 5 };
  }
  return { chapterId: "chapter-6", chapterOrder: 6 };
}

/**
 * Gets memories cached in local storage
 */
export function getLocalUserMemories(): MemoryItem[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.warn("Could not read local user memories:", e);
    return [];
  }
}

/**
 * Saves user memories array to local storage
 */
function saveLocalUserMemories(memories: MemoryItem[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(memories));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }
}

/**
 * Gets the set of deleted memory IDs
 */
export function getDeletedMemoryIds(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_MEMORIES_KEY);
    if (!raw) return new Set<string>();
    const parsed = JSON.parse(raw);
    return new Set<string>(Array.isArray(parsed) ? parsed : []);
  } catch (e) {
    console.warn("Could not read deleted memories:", e);
    return new Set<string>();
  }
}

/**
 * Saves deleted memory IDs to local storage
 */
function saveDeletedMemoryIds(ids: Set<string>): void {
  try {
    localStorage.setItem(DELETED_MEMORIES_KEY, JSON.stringify(Array.from(ids)));
  } catch (e) {
    console.warn("Could not save deleted memories:", e);
  }
}

/**
 * Checks if a memory ID was marked deleted
 */
export function isMemoryDeleted(id: string): boolean {
  return getDeletedMemoryIds().has(id);
}

/**
 * Fetches all memories across:
 * 1. Remote Firestore
 * 2. Local User Storage Cache
 * 3. Default Curated Memories
 */
export async function getAllMemories(): Promise<MemoryItem[]> {
  const remoteMemories: MemoryItem[] = [];

  // 1. Fetch from Firestore if accessible
  try {
    const memQuery = query(collection(db, "memories"), orderBy("date", "asc"));
    const memSnap = await getDocs(memQuery);
    if (!memSnap.empty) {
      for (const d of memSnap.docs) {
        const data = d.data();
        let mediaItems: MediaItem[] = data.media || [];

        // Check if media collection has items for this memory
        try {
          const mediaQ = collection(db, "media");
          const mediaSnap = await getDocs(mediaQ);
          const relatedMedia = mediaSnap.docs
            .map(m => ({ id: m.id, ...m.data() } as MediaItem))
            .filter(m => m.memory_id === d.id);
          if (relatedMedia.length > 0) {
            mediaItems = relatedMedia.sort((a, b) => (a.order || 0) - (b.order || 0));
          }
        } catch {
          // Ignore media query error, fall back to embedded media
        }

        remoteMemories.push({
          id: d.id,
          chapter_id: data.chapter_id || "chapter-1",
          title: data.title || "Cherished Memory",
          description: data.description || "",
          date: data.date || "November 2024",
          location: data.location || "",
          song: data.song,
          media: mediaItems
        });
      }
    }
  } catch (err) {
    console.warn("Remote Firestore memories fetch skipped or failed (using cached/default):", err);
  }

  // 2. Fetch local storage memories
  const localMemories = getLocalUserMemories();

  // 3. Collect default curated memories
  const defaultList: MemoryItem[] = [];
  Object.values(DEFAULT_MEMORIES).forEach(list => {
    defaultList.push(...list);
  });

  // 4. Merge without duplicates (Priority: Local User Created > Remote Firestore > Defaults)
  const memoryMap = new Map<string, MemoryItem>();

  defaultList.forEach(m => memoryMap.set(m.id, m));
  remoteMemories.forEach(m => memoryMap.set(m.id, m));
  localMemories.forEach(m => memoryMap.set(m.id, m));

  const all = Array.from(memoryMap.values());

  // Filter out deleted memories
  const deletedIds = getDeletedMemoryIds();
  const activeMemories = all.filter(m => !deletedIds.has(m.id));

  // Sort chronologically
  activeMemories.sort((a, b) => {
    const timeA = parseMemoryDate(a.date).timestamp;
    const timeB = parseMemoryDate(b.date).timestamp;
    return timeA - timeB;
  });

  return activeMemories;
}

/**
 * Gets memories for a specific chapter ID
 */
export async function getMemoriesForChapter(chapterId: string): Promise<MemoryItem[]> {
  const all = await getAllMemories();
  return all.filter(m => m.chapter_id === chapterId);
}

/**
 * Gets a single memory by ID
 */
export async function getMemoryById(id: string): Promise<MemoryItem | null> {
  if (isMemoryDeleted(id)) return null;

  // Check local first
  const local = getLocalUserMemories().find(m => m.id === id);
  if (local) return local;

  // Check default
  for (const list of Object.values(DEFAULT_MEMORIES)) {
    const match = list.find(m => m.id === id);
    if (match) return match;
  }

  // Check Firestore
  try {
    const docRef = doc(db, "memories", id);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      const data = snap.data();
      return {
        id: snap.id,
        chapter_id: data.chapter_id || "chapter-1",
        title: data.title || "Memory",
        description: data.description || "",
        date: data.date || "",
        location: data.location || "",
        song: data.song,
        media: data.media || []
      };
    }
  } catch {
    // Ignore
  }

  return null;
}

/**
 * Saves a new memory permanently
 */
export async function saveNewMemory(
  newMemoryData: Omit<MemoryItem, "id"> & { id?: string }
): Promise<MemoryItem> {
  const generatedId = newMemoryData.id || `user-mem-${Date.now()}`;
  const memoryToSave: MemoryItem = {
    ...newMemoryData,
    id: generatedId,
    media: newMemoryData.media || []
  };

  // Un-delete if this ID was previously marked deleted
  const deletedIds = getDeletedMemoryIds();
  if (deletedIds.has(memoryToSave.id)) {
    deletedIds.delete(memoryToSave.id);
    saveDeletedMemoryIds(deletedIds);
  }

  // 1. Immediately save to LocalStorage so it is never lost
  const localList = getLocalUserMemories();
  const existingIndex = localList.findIndex(m => m.id === memoryToSave.id);
  if (existingIndex >= 0) {
    localList[existingIndex] = memoryToSave;
  } else {
    localList.unshift(memoryToSave);
  }
  saveLocalUserMemories(localList);

  // 2. Write to Firestore in background / async
  try {
    const docRef = await addDoc(collection(db, "memories"), {
      chapter_id: memoryToSave.chapter_id,
      title: memoryToSave.title,
      description: memoryToSave.description,
      date: memoryToSave.date,
      location: memoryToSave.location || "",
      created_at: new Date().toISOString()
    });

    // If media items exist, save them
    if (memoryToSave.media && memoryToSave.media.length > 0) {
      for (const item of memoryToSave.media) {
        await addDoc(collection(db, "media"), {
          memory_id: docRef.id,
          type: item.type,
          storage_path: item.storage_path,
          caption: item.caption || "",
          order: item.order || 1,
          film_type: item.film_type || "Polaroid"
        });
      }
    }
  } catch (err) {
    console.warn("Remote Firestore write skipped or failed (local cache preserved):", err);
  }

  // 3. Dispatch event to notify all components
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(MEMORIES_EVENT, { detail: memoryToSave }));
  }

  return memoryToSave;
}

/**
 * Deletes a memory permanently across local cache, Firestore, and memory views
 */
export async function deleteMemory(memoryId: string): Promise<boolean> {
  if (!memoryId) return false;

  // 1. Mark as deleted in deleted memory IDs set
  const deletedIds = getDeletedMemoryIds();
  deletedIds.add(memoryId);
  saveDeletedMemoryIds(deletedIds);

  // 2. Remove from local user memories
  const localList = getLocalUserMemories().filter(m => m.id !== memoryId);
  saveLocalUserMemories(localList);

  // 3. Delete from Firestore if exists
  try {
    await deleteDoc(doc(db, "memories", memoryId));
    
    // Also clean up any associated media documents
    try {
      const mediaQ = query(collection(db, "media"), where("memory_id", "==", memoryId));
      const mediaSnap = await getDocs(mediaQ);
      for (const d of mediaSnap.docs) {
        await deleteDoc(d.ref);
      }
    } catch (mediaErr) {
      console.warn("Could not clean up remote media for memory:", mediaErr);
    }
  } catch (err) {
    console.warn("Firestore memory deletion skipped or non-existent:", err);
  }

  // 4. Notify all components to re-render
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(MEMORIES_EVENT, { detail: { action: "delete", id: memoryId } }));
  }

  return true;
}

/**
 * Restores a deleted memory
 */
export async function restoreMemory(memoryId: string): Promise<boolean> {
  const deletedIds = getDeletedMemoryIds();
  if (deletedIds.has(memoryId)) {
    deletedIds.delete(memoryId);
    saveDeletedMemoryIds(deletedIds);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent(MEMORIES_EVENT, { detail: { action: "restore", id: memoryId } }));
    }
    return true;
  }
  return false;
}

/**
 * Resets all deleted memories back to active
 */
export function resetAllDeletedMemories(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(DELETED_MEMORIES_KEY);
    window.dispatchEvent(new CustomEvent(MEMORIES_EVENT, { detail: { action: "reset_deleted" } }));
  }
}

/**
 * Builds the month-by-month timeline from 2024 to November 2026
 * Each month has its memories attached!
 */
export function buildMonthlyJourney(
  memories: MemoryItem[],
  startYear = 2024,
  endYear = 2026
): MonthTimelineBucket[] {
  const buckets: MonthTimelineBucket[] = [];

  for (let year = startYear; year <= endYear; year++) {
    // 2026 stops after November (the 2-year anniversary milestone!)
    const maxMonth = year === 2026 ? 11 : 12;
    // 2024 starts from January (user requested: "upload at least one memory per month since 2024")
    const minMonth = 1;

    for (let month = minMonth; month <= maxMonth; month++) {
      const monthKey = `${year}-${String(month).padStart(2, "0")}`;
      const monthName = MONTH_NAMES[month - 1];
      const label = `${monthName} ${year}`;

      // Calculate Season
      let season: "Winter" | "Spring" | "Summer" | "Autumn" = "Winter";
      if (month >= 3 && month <= 5) season = "Spring";
      else if (month >= 6 && month <= 8) season = "Summer";
      else if (month >= 9 && month <= 11) season = "Autumn";

      // Chapter mapping
      const { chapterId, chapterOrder } = inferChapterIdFromDate(`${monthName} 15, ${year}`);
      const matchedChapter = DEFAULT_CHAPTERS.find(c => c.id === chapterId || c.order === chapterOrder);
      const chapterTitle = matchedChapter ? matchedChapter.title : `Chapter ${chapterOrder}`;

      // Check for milestones
      let isSpecialMilestone = false;
      let milestoneTitle: string | undefined;

      if (year === 2024 && month === 11) {
        isSpecialMilestone = true;
        milestoneTitle = "Day 1 • Our First Conversation & Beginning";
      } else if (year === 2025 && month === 11) {
        isSpecialMilestone = true;
        milestoneTitle = "365 Days • 1 Year Anniversary Celebration";
      } else if (year === 2026 && month === 11) {
        isSpecialMilestone = true;
        milestoneTitle = "730 Days • Two Complete Years of Us!";
      } else if (year === 2025 && month === 2) {
        milestoneTitle = "Day 100 Milestone";
      }

      // Find all memories that belong to this year and month
      const monthMemories = memories.filter(m => {
        const parsed = parseMemoryDate(m.date);
        return parsed.year === year && parsed.month === month;
      });

      buckets.push({
        key: monthKey,
        year,
        month,
        monthName,
        label,
        season,
        chapterId,
        chapterOrder,
        chapterTitle,
        isSpecialMilestone,
        milestoneTitle,
        memories: monthMemories,
        hasMemory: monthMemories.length > 0
      });
    }
  }

  return buckets;
}
