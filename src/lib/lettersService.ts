import { db } from "./firebase";
import { collection, doc, getDocs, setDoc, deleteDoc } from "firebase/firestore";
import { supabase, isSupabaseConfigured } from "./supabase";
import { LetterItem } from "../types";

export const LETTERS_UPDATED_EVENT = "love_story_letters_updated";
const LOCAL_STORAGE_LETTERS_KEY = "love_story_user_letters";
const DELETED_LETTERS_KEY = "love_story_deleted_letters";

export const DEFAULT_LETTERS: LetterItem[] = [
  {
    id: "let-1",
    title: "To The Girl Who Painted My World in Every Shade of Blue",
    unlock_date: "November 3, 2024",
    theme_tag: "Shades of Blue",
    content: `My dearest,

It all quietly started when I came across your profile picture on Facebook Dating that October and swiped right without hesitation. 

Before I met you, blue was just a color on a palette. Now, it's the shade of the sky on that crisp November afternoon when we first talked for four straight hours. It's the color of the oversized sweater you burrow into on lazy Sundays. It's the reflection of the Pacific waves on our drives down the coastline.

You brought an entire ocean of warmth, laughter, and calm into my life. Every shade of blue—from the quiet indigo of midnight conversations to the bright cerulean of your smile—reminds me of why I fell in love with you.

Thank you for making our little corner of the world so deeply beautiful.`
  },
  {
    id: "let-2",
    title: "Our Ohana Promise • Experiment 626",
    unlock_date: "November 3, 2025",
    theme_tag: "Stitch & Ohana",
    content: `My favorite human,

You taught me the truest meaning of Stitch's words: "Ohana means family. Family means nobody gets left behind or forgotten."

Whenever things get loud, or life gets overwhelming, looking at you feels like coming home. You have that same fierce, loyal, unconditional heart that Stitch searched the whole galaxy for. We are our own little team, our own cozy safe haven. 

Through every high and every quiet low, I promise to always stand by your side. Nobody gets left behind. Not now, not in two years, not ever.`
  },
  {
    id: "let-3",
    title: "The Two-Year Anniversary Letter",
    unlock_date: "November 3, 2026",
    theme_tag: "Anniversary Time Capsule",
    content: `Happy Two Years, my love.

730 days of holding your hand. 730 days of waking up knowing that out of eight billion people on this planet, I get to love you. 

Look back at all the chapters we've written together—the first coffee, the road trips, the inside jokes, the Stitch plushies on our bed, the late-night talks under starry skies. 

This is only the prologue. Here is to a lifetime of adventures, and loving you in every shade of blue.`
  }
];

function getDeletedLetterIds(): string[] {
  try {
    const raw = localStorage.getItem(DELETED_LETTERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setDeletedLetterIds(ids: string[]) {
  try {
    localStorage.setItem(DELETED_LETTERS_KEY, JSON.stringify(ids));
  } catch (err) {
    console.error("Failed to save deleted letter ids", err);
  }
}

/**
 * Returns currently cached letters immediately for fast, flicker-free rendering
 */
export function getLettersSync(): LetterItem[] {
  try {
    const deleted = getDeletedLetterIds();
    const raw = localStorage.getItem(LOCAL_STORAGE_LETTERS_KEY);
    
    if (raw) {
      const parsed: LetterItem[] = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.filter(l => !deleted.includes(l.id));
      }
    }

    // Merge defaults excluding any marked deleted
    return DEFAULT_LETTERS.filter(l => !deleted.includes(l.id));
  } catch (err) {
    console.warn("Error reading letters from localStorage:", err);
    return DEFAULT_LETTERS;
  }
}

/**
 * Fetches all letters from Firestore/Supabase and caches into localStorage
 */
export async function getAllLetters(): Promise<LetterItem[]> {
  const deleted = getDeletedLetterIds();
  const localLetters = getLettersSync();
  const lettersMap = new Map<string, LetterItem>();

  // 1. Seed with local / defaults
  localLetters.forEach(l => {
    if (!deleted.includes(l.id)) {
      lettersMap.set(l.id, l);
    }
  });

  // 2. Query Firestore if available
  try {
    const colRef = collection(db, "letters");
    const snapshot = await getDocs(colRef);
    if (!snapshot.empty) {
      snapshot.forEach(docSnap => {
        const data = docSnap.data() as LetterItem;
        const letterId = docSnap.id;
        if (!deleted.includes(letterId)) {
          lettersMap.set(letterId, {
            ...data,
            id: letterId
          });
        }
      });
    }
  } catch (err) {
    console.info("Firestore letters lookup note:", err);
  }

  // 3. Query Supabase if configured
  try {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.from("letters").select("*");
      if (!error && Array.isArray(data) && data.length > 0) {
        data.forEach((item: any) => {
          if (!deleted.includes(item.id)) {
            lettersMap.set(item.id, {
              id: item.id,
              title: item.title,
              content: item.content,
              unlock_date: item.unlock_date,
              theme_tag: item.theme_tag,
              chapter_id: item.chapter_id,
              created_at: item.created_at
            });
          }
        });
      }
    }
  } catch (err) {
    console.info("Supabase letters lookup note:", err);
  }

  const combined = Array.from(lettersMap.values());
  // Save combined back to localStorage for offline / fast access
  try {
    localStorage.setItem(LOCAL_STORAGE_LETTERS_KEY, JSON.stringify(combined));
  } catch (err) {
    console.warn("Failed caching letters to localStorage:", err);
  }

  return combined;
}

/**
 * Saves or updates a letter written by the user in their own words
 */
export async function saveLetter(
  letterData: Partial<LetterItem> & { title: string; content: string; unlock_date: string }
): Promise<LetterItem> {
  const id = letterData.id?.trim() || `letter-${Date.now()}`;
  const nowStr = new Date().toISOString();

  const completeLetter: LetterItem = {
    id,
    title: letterData.title.trim(),
    content: letterData.content.trim(),
    unlock_date: letterData.unlock_date.trim(),
    theme_tag: letterData.theme_tag?.trim() || "From the Heart",
    chapter_id: letterData.chapter_id || "chapter-1",
    created_at: letterData.created_at || nowStr,
    is_custom: true
  };

  // 1. Remove from deleted IDs if previously marked
  const deleted = getDeletedLetterIds().filter(dId => dId !== id);
  setDeletedLetterIds(deleted);

  // 2. Update localStorage immediately
  const existing = getLettersSync();
  const index = existing.findIndex(l => l.id === id);
  let updatedList: LetterItem[];
  if (index >= 0) {
    updatedList = [...existing];
    updatedList[index] = completeLetter;
  } else {
    updatedList = [completeLetter, ...existing];
  }
  localStorage.setItem(LOCAL_STORAGE_LETTERS_KEY, JSON.stringify(updatedList));

  // 3. Dispatch update event immediately so UI responds in real time
  window.dispatchEvent(new CustomEvent(LETTERS_UPDATED_EVENT, { detail: completeLetter }));

  // 4. Save to Firestore in background
  try {
    const docRef = doc(db, "letters", id);
    await setDoc(docRef, {
      title: completeLetter.title,
      content: completeLetter.content,
      unlock_date: completeLetter.unlock_date,
      theme_tag: completeLetter.theme_tag,
      chapter_id: completeLetter.chapter_id,
      created_at: completeLetter.created_at,
      is_custom: true
    }, { merge: true });
  } catch (err) {
    console.warn("Firestore save letter note:", err);
  }

  // 5. Save to Supabase if configured
  try {
    if (isSupabaseConfigured()) {
      await supabase.from("letters").upsert({
        id: completeLetter.id,
        title: completeLetter.title,
        content: completeLetter.content,
        unlock_date: completeLetter.unlock_date,
        theme_tag: completeLetter.theme_tag,
        chapter_id: completeLetter.chapter_id
      });
    }
  } catch (err) {
    console.warn("Supabase save letter note:", err);
  }

  return completeLetter;
}

/**
 * Deletes a letter
 */
export async function deleteLetter(id: string): Promise<void> {
  // 1. Mark as deleted in storage
  const deleted = getDeletedLetterIds();
  if (!deleted.includes(id)) {
    deleted.push(id);
    setDeletedLetterIds(deleted);
  }

  // 2. Remove from local storage array
  const existing = getLettersSync().filter(l => l.id !== id);
  localStorage.setItem(LOCAL_STORAGE_LETTERS_KEY, JSON.stringify(existing));

  // 3. Dispatch update event
  window.dispatchEvent(new CustomEvent(LETTERS_UPDATED_EVENT, { detail: { id, deleted: true } }));

  // 4. Delete from Firestore
  try {
    const docRef = doc(db, "letters", id);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn("Firestore delete letter note:", err);
  }

  // 5. Delete from Supabase
  try {
    if (isSupabaseConfigured()) {
      await supabase.from("letters").delete().eq("id", id);
    }
  } catch (err) {
    console.warn("Supabase delete letter note:", err);
  }
}

/**
 * Resets all letters to original defaults
 */
export async function resetLettersToDefault(): Promise<void> {
  localStorage.removeItem(LOCAL_STORAGE_LETTERS_KEY);
  localStorage.removeItem(DELETED_LETTERS_KEY);
  window.dispatchEvent(new CustomEvent(LETTERS_UPDATED_EVENT));
}
