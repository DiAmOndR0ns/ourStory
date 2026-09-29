import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowLeft, 
  MapPin, 
  Music, 
  Calendar, 
  ChevronRight, 
  ChevronLeft, 
  Grid, 
  List, 
  Plus, 
  Sparkles, 
  Heart, 
  ImageIcon,
  Trash2
} from "lucide-react";
import SwipeableGallery from "../components/SwipeableGallery";
import AddMemoryModal from "../components/AddMemoryModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { ChapterItem, MemoryItem } from "../types";
import { DEFAULT_CHAPTERS } from "../data/defaultStoryData";
import { getMemoriesForChapter, deleteMemory } from "../lib/memoriesService";

export default function Chapter() {
  const { chapterId } = useParams<{ chapterId: string }>();
  const [chapter, setChapter] = useState<ChapterItem | null>(null);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"timeline" | "scrapbook">("timeline");
  
  // Add Memory Modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  // Delete Memory Modal state
  const [memoryToDelete, setMemoryToDelete] = useState<MemoryItem | null>(null);
  const [isDeletingMemory, setIsDeletingMemory] = useState(false);

  const fetchChapterData = useCallback(async () => {
    if (!chapterId) return;
    setLoading(true);

    try {
      // 1. Fetch Chapter
      let chapterData: ChapterItem | null = null;
      try {
        const docRef = doc(db, "chapters", chapterId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          chapterData = { id: docSnap.id, ...docSnap.data() } as ChapterItem;
        }
      } catch {
        // Fallback to default
      }

      if (!chapterData) {
        chapterData = DEFAULT_CHAPTERS.find(
          (c) => c.id === chapterId || c.id === `chapter-${chapterId}` || String(c.order) === chapterId
        ) || DEFAULT_CHAPTERS[0];
      }
      setChapter(chapterData);

      // 2. Fetch Memories for this Chapter using unified memoriesService
      const chapterMemories = await getMemoriesForChapter(chapterData.id);
      setMemories(chapterMemories);
    } catch (error) {
      console.error("Error fetching chapter details:", error);
    } finally {
      setLoading(false);
    }
  }, [chapterId]);

  useEffect(() => {
    fetchChapterData();

    // Listen for memory updates across the app
    const handleUpdate = () => {
      fetchChapterData();
    };

    window.addEventListener("love_story_memories_updated", handleUpdate);
    return () => {
      window.removeEventListener("love_story_memories_updated", handleUpdate);
    };
  }, [fetchChapterData]);

  // Next and previous chapter helpers
  const { prevChapter, nextChapter } = useMemo(() => {
    if (!chapter) return { prevChapter: null, nextChapter: null };
    const currentIndex = DEFAULT_CHAPTERS.findIndex(c => c.id === chapter.id || c.order === chapter.order);
    return {
      prevChapter: currentIndex > 0 ? DEFAULT_CHAPTERS[currentIndex - 1] : null,
      nextChapter: currentIndex < DEFAULT_CHAPTERS.length - 1 ? DEFAULT_CHAPTERS[currentIndex + 1] : null,
    };
  }, [chapter]);

  // Total photos across all memories in chapter
  const totalPhotosInChapter = useMemo(() => {
    return memories.reduce((acc, m) => acc + (m.media?.length || 0), 0);
  }, [memories]);

  const handleDeleteMemory = async () => {
    if (!memoryToDelete) return;
    setIsDeletingMemory(true);
    try {
      await deleteMemory(memoryToDelete.id);
      setMemories((prev) => prev.filter((m) => m.id !== memoryToDelete.id));
      setMemoryToDelete(null);
    } catch (err) {
      console.error("Failed to delete memory:", err);
    } finally {
      setIsDeletingMemory(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F8FC] flex flex-col items-center justify-center p-6 text-sky-800">
        <Heart className="w-8 h-8 text-sky-400 fill-sky-200 animate-pulse mb-3" />
        <p className="font-serif italic text-base">Unfolding chapter memories...</p>
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-[#F3F8FC] flex flex-col items-center justify-center p-6 text-slate-700">
        <p className="font-serif text-2xl mb-4">Chapter not found</p>
        <Link to="/story" className="text-xs font-semibold tracking-widest uppercase text-sky-700 underline">
          Back to Timeline
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F8FC] text-slate-900 pb-32">
      {/* Sticky Header */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-sky-100 px-4 md:px-8 py-3.5 flex items-center justify-between">
        <Link 
          to="/story" 
          className="flex items-center text-xs font-semibold tracking-widest uppercase text-sky-800 hover:text-blue-950 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span className="hidden sm:inline">All Chapters</span>
          <span className="sm:hidden">Back</span>
        </Link>

        {/* View mode toggle */}
        <div className="flex items-center gap-1 bg-sky-100/70 p-1 rounded-full text-xs font-medium">
          <button
            onClick={() => setViewMode("timeline")}
            className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
              viewMode === "timeline" 
                ? "bg-white text-slate-900 shadow-xs" 
                : "text-sky-800 hover:text-blue-950"
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Timeline</span>
          </button>
          <button
            onClick={() => setViewMode("scrapbook")}
            className={`flex items-center gap-1 px-3 py-1 rounded-full transition-all ${
              viewMode === "scrapbook" 
                ? "bg-white text-slate-900 shadow-xs" 
                : "text-sky-800 hover:text-blue-950"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Scrapbook</span>
          </button>
        </div>

        {/* Add Memory Button */}
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-sans tracking-wide uppercase font-medium transition-all shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Memory</span>
        </button>
      </header>

      {/* Main Chapter Header */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-[11px] font-semibold tracking-widest uppercase mb-4">
            <Sparkles className="w-3 h-3 text-sky-500" />
            Chapter {chapter.order}
          </div>
          
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl tracking-tight mb-3 text-slate-900">
            {chapter.title}
          </h1>

          <div className="flex items-center justify-center gap-4 text-xs font-sans tracking-widest uppercase text-sky-800/60 mb-6">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {chapter.date}
            </span>
            <span>•</span>
            <span>{memories.length} Events</span>
            <span>•</span>
            <span>{totalPhotosInChapter} Photos</span>
          </div>

          <p className="font-serif text-stone-600 leading-relaxed text-base sm:text-lg max-w-xl mx-auto italic px-2">
            "{chapter.description}"
          </p>
        </motion.div>

        {/* Swipeable Tip Callout */}
        {totalPhotosInChapter > 0 && (
          <div className="mb-10 px-4 py-3 rounded-2xl bg-amber-50/60 border border-amber-100/80 flex items-center justify-between text-xs text-amber-900/80 max-w-xl mx-auto">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
              <span>
                <strong>Interactive Scrapbook:</strong> Swipe left or right on any photo card to browse multiple memories per event.
              </span>
            </div>
          </div>
        )}

        {/* VIEW MODE: TIMELINE */}
        {viewMode === "timeline" ? (
          <div className="relative space-y-16 sm:space-y-20 before:absolute before:inset-0 before:left-4 sm:before:left-1/2 before:-translate-x-1/2 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-rose-200/50 before:via-stone-200 before:to-stone-100">
            {memories.map((event, index) => {
              const hasMultiplePhotos = event.media && event.media.length > 1;

              return (
                <motion.article
                  key={event.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: index * 0.1, duration: 0.7 }}
                  className="relative flex flex-col items-center"
                >
                  {/* Center Node Marker */}
                  <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 top-0 z-20 flex items-center justify-center w-8 h-8 rounded-full border-4 border-[#F3F8FC] bg-sky-600 text-white shadow-md">
                    <Heart className="w-3.5 h-3.5 fill-white" />
                  </div>

                  {/* Main Event Card */}
                  <div className="w-full pl-10 sm:pl-0 sm:max-w-2xl bg-white/95 backdrop-blur-xs rounded-3xl p-5 sm:p-8 shadow-[0_8px_35px_rgb(0,0,0,0.03)] border border-sky-100 hover:border-sky-300 transition-all duration-300">
                    {/* Event Meta Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-100">
                        <Calendar className="w-3 h-3 text-sky-500" />
                        {event.date}
                      </span>

                      {event.location && (
                        <span className="flex items-center gap-1 text-xs text-sky-800/60 tracking-wide">
                          <MapPin className="w-3.5 h-3.5 text-sky-500" />
                          {event.location}
                        </span>
                      )}
                    </div>

                    {/* Event Title */}
                    <h2 className="font-serif text-2xl sm:text-3xl text-slate-900 mb-3 tracking-tight">
                      {event.title}
                    </h2>

                    {/* Optional Soundtrack Tag */}
                    {event.song && (
                      <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-900 text-xs font-sans">
                        <Music className="w-3.5 h-3.5 text-sky-500 animate-spin-slow" />
                        <span>Soundtrack: <strong className="text-slate-900">{event.song.title}</strong> — {event.song.artist}</span>
                      </div>
                    )}

                    {/* Event Narrative Description */}
                    <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-6 whitespace-pre-wrap">
                      {event.description}
                    </p>

                    {/* The Core Swipeable Photo Gallery Component */}
                    {event.media && event.media.length > 0 ? (
                      <div className="mt-2">
                        <SwipeableGallery
                          media={event.media}
                          eventTitle={event.title}
                          eventLocation={event.location}
                          polaroidStyle={true}
                        />
                      </div>
                    ) : (
                      <div className="p-8 rounded-2xl border border-dashed border-stone-200 bg-stone-50/60 text-center text-stone-400 text-xs tracking-widest uppercase">
                        <ImageIcon className="w-6 h-6 mx-auto mb-2 text-stone-300" />
                        No photo memories attached yet
                      </div>
                    )}

                    {/* Bottom Actions */}
                    <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between text-xs text-stone-400">
                      <span className="font-sans">
                        {event.media?.length || 0} {event.media?.length === 1 ? "memory photo" : "memory photos"}
                      </span>

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setMemoryToDelete(event)}
                          className="inline-flex items-center gap-1 text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-rose-50"
                          title="Delete memory"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="text-[11px] font-sans">Delete</span>
                        </button>

                        <Link
                          to={`/memory/${event.id}`}
                          className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-stone-800 hover:text-sky-700 transition-colors"
                        >
                          Memory Details
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </div>
        ) : (
          /* VIEW MODE: SCRAPBOOK WALL */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {memories.map((event, idx) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.08 }}
                className="flex flex-col"
              >
                <div className="mb-2 px-1 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-sans tracking-widest uppercase text-stone-400">
                      {event.date}
                    </span>
                    <h3 className="font-serif text-xl text-stone-900 font-medium">
                      {event.title}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMemoryToDelete(event)}
                    className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <SwipeableGallery
                  media={event.media}
                  eventTitle={event.title}
                  eventLocation={event.location}
                  polaroidStyle={true}
                />
              </motion.div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {memories.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-stone-200/80 p-8">
            <Sparkles className="w-8 h-8 text-rose-300 mx-auto mb-4" />
            <h3 className="font-serif text-2xl text-stone-800 mb-2">No memories in this chapter yet</h3>
            <p className="text-sm text-stone-500 mb-6 max-w-sm mx-auto">
              Start chronicling this chapter by adding your first memory and photos.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-6 py-3 bg-stone-900 text-white rounded-full text-xs font-semibold tracking-wider uppercase hover:bg-stone-800"
            >
              Create First Memory
            </button>
          </div>
        )}

        {/* Chapter Navigation Footer */}
        <div className="mt-20 pt-10 border-t border-stone-200/70 flex flex-col sm:flex-row items-center justify-between gap-6">
          {prevChapter ? (
            <Link
              to={`/story/${prevChapter.id}`}
              className="group flex items-center gap-3 text-stone-500 hover:text-stone-900 transition-colors w-full sm:w-auto"
            >
              <div className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center group-hover:border-stone-400 group-hover:-translate-x-1 transition-all">
                <ChevronLeft className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-[10px] font-sans tracking-widest uppercase text-stone-400">Previous Chapter</span>
                <span className="font-serif text-base text-stone-800 group-hover:text-rose-800">{prevChapter.title}</span>
              </div>
            </Link>
          ) : <div />}

          {nextChapter ? (
            <Link
              to={`/story/${nextChapter.id}`}
              className="group flex items-center justify-end gap-3 text-stone-500 hover:text-stone-900 transition-colors w-full sm:w-auto text-right"
            >
              <div>
                <span className="block text-[10px] font-sans tracking-widest uppercase text-stone-400">Next Chapter</span>
                <span className="font-serif text-base text-stone-800 group-hover:text-rose-800">{nextChapter.title}</span>
              </div>
              <div className="w-10 h-10 rounded-full border border-stone-200 flex items-center justify-center group-hover:border-stone-400 group-hover:translate-x-1 transition-all">
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          ) : (
            <Link
              to="/story"
              className="px-6 py-3 rounded-full bg-stone-900 text-white text-xs font-semibold tracking-widest uppercase"
            >
              Back to All Chapters
            </Link>
          )}
        </div>
      </main>

      {/* Add Memory Modal Dialog */}
      <AddMemoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaved={(newMem) => {
          setMemories(prev => [newMem, ...prev.filter(m => m.id !== newMem.id)]);
        }}
        initialDate={chapter.date}
        initialChapterId={chapter.id}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(memoryToDelete)}
        onClose={() => setMemoryToDelete(null)}
        onConfirm={handleDeleteMemory}
        title="Delete Memory?"
        itemTitle={memoryToDelete?.title}
        isDeleting={isDeletingMemory}
      />

      {/* Floating Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-sky-100/80 px-4 py-3 sm:py-3.5 z-40 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-around text-[11px] sm:text-xs tracking-wider uppercase font-semibold text-sky-800/70">
          <Link to="/story" className="text-sky-700 font-bold border-b-2 border-sky-600 pb-0.5 px-2 py-0.5">Timeline</Link>
          <Link to="/letters" className="hover:text-sky-950 transition-colors px-2 py-0.5">Letters</Link>
          <Link to="/little-things" className="hover:text-sky-950 transition-colors px-2 py-0.5">Little Things</Link>
          <Link to="/admin" className="hover:text-sky-950 transition-colors text-slate-500 px-2 py-0.5">Admin</Link>
        </div>
      </nav>
    </div>
  );
}
