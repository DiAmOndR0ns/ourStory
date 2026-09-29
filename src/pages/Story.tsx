import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { 
  ArrowLeft, 
  Sparkles, 
  Grid, 
  GitCommitVertical, 
  Heart, 
  Plus,
  Calendar
} from "lucide-react";
import { DEFAULT_CHAPTERS } from "../data/defaultStoryData";
import { ChapterItem, MemoryItem } from "../types";
import StoryVerticalTimeline from "../components/StoryVerticalTimeline";
import AddMemoryModal from "../components/AddMemoryModal";
import { getAllMemories } from "../lib/memoriesService";

export default function Story() {
  const [chapters, setChapters] = useState<ChapterItem[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewStyle, setViewStyle] = useState<"timeline" | "grid">("timeline");

  // Add Memory Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalPrefillDate, setModalPrefillDate] = useState<string | undefined>(undefined);
  const [modalPrefillChapterId, setModalPrefillChapterId] = useState<string | undefined>(undefined);

  const loadData = useCallback(async () => {
    try {
      // 1. Fetch chapters
      let chapterList = DEFAULT_CHAPTERS;
      try {
        const q = query(collection(db, "chapters"), orderBy("order", "asc"));
        const snapshot = await getDocs(q);
        const remoteChapters = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChapterItem));
        if (remoteChapters.length > 0) {
          chapterList = remoteChapters.map((d, i) => ({
            ...DEFAULT_CHAPTERS[i],
            ...d
          }));
        }
      } catch (err) {
        console.warn("Using default chapters:", err);
      }
      setChapters(chapterList);

      // 2. Fetch all memories (Firestore + LocalStorage + Curated)
      const allMemories = await getAllMemories();
      setMemories(allMemories);
    } catch (error) {
      console.error("Error loading story data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();

    // Listen for memory updates from anywhere in the app
    const handleUpdate = () => {
      loadData();
    };

    window.addEventListener("love_story_memories_updated", handleUpdate);
    return () => {
      window.removeEventListener("love_story_memories_updated", handleUpdate);
    };
  }, [loadData]);

  const handleOpenAddModal = (datePreset?: string, chapterId?: string) => {
    setModalPrefillDate(datePreset);
    setModalPrefillChapterId(chapterId);
    setIsAddModalOpen(true);
  };

  const handleMemorySaved = (newMemory: MemoryItem) => {
    setMemories(prev => {
      const filtered = prev.filter(m => m.id !== newMemory.id);
      return [newMemory, ...filtered];
    });
  };

  return (
    <div className="min-h-screen bg-[#F3F8FC] text-slate-900 pb-32">
      {/* Top Header */}
      <header className="p-4 sm:p-6 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-sky-100">
        <Link 
          to="/" 
          className="text-sky-800 hover:text-blue-950 transition-colors flex items-center text-xs tracking-widest uppercase font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Home
        </Link>

        <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-sky-950">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>Timeline & Monthly Journey</span>
        </div>

        {/* View Switcher & Add Memory CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAddModal()}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold uppercase tracking-wider shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5 text-sky-300" />
            <span>+ Add Memory</span>
          </button>

          <div className="flex items-center gap-1 bg-sky-100/70 p-1 rounded-full text-xs font-medium">
            <button
              onClick={() => setViewStyle("timeline")}
              className={`p-1.5 px-3 rounded-full flex items-center gap-1.5 transition-all ${
                viewStyle === "timeline"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-sky-800 hover:text-blue-950"
              }`}
              title="Vertical Journey Timeline"
            >
              <GitCommitVertical className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Timeline</span>
            </button>
            <button
              onClick={() => setViewStyle("grid")}
              className={`p-1.5 px-3 rounded-full flex items-center gap-1.5 transition-all ${
                viewStyle === "grid"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-sky-800 hover:text-blue-950"
              }`}
              title="Card Grid"
            >
              <Grid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Chapters</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        {/* Page Hero Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-sky-700 bg-sky-100/70 px-3 py-1 rounded-full mb-3">
            <Heart className="w-3 h-3 text-sky-500 fill-sky-300" />
            Two Years Under Skies of Blue • 2024 to 2026
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl text-slate-900 mb-3 tracking-tight">
            Every Step Along the Way
          </h1>
          <p className="font-serif italic text-slate-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-4">
            "Chronological memories, quiet moments, and our Ohana milestones written across two unforgettable years."
          </p>

          {/* Mobile Quick Add Button */}
          <div className="sm:hidden flex justify-center mt-2">
            <button
              onClick={() => handleOpenAddModal()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-900 text-white text-xs font-semibold uppercase tracking-wider shadow-sm"
            >
              <Plus className="w-4 h-4 text-sky-300" />
              <span>+ Add Memory with Her</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="animate-pulse space-y-8 max-w-2xl mx-auto py-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-44 bg-sky-100/50 rounded-3xl" />
            ))}
          </div>
        ) : chapters.length === 0 ? (
          <div className="text-center text-slate-500 py-16 bg-white rounded-3xl border border-sky-100 p-8 max-w-lg mx-auto">
            <Sparkles className="w-8 h-8 text-sky-400 mx-auto mb-3" />
            <h3 className="font-serif text-xl text-slate-800 mb-2">The story is just beginning</h3>
            <p className="text-xs text-slate-500">No chapters written yet.</p>
          </div>
        ) : viewStyle === "timeline" ? (
          /* Vertical Timeline Component with Monthly Reflection */
          <StoryVerticalTimeline 
            chapters={chapters} 
            memories={memories}
            onOpenAddModal={handleOpenAddModal}
          />
        ) : (
          /* Grid View of Chapters */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {chapters.map((chapter) => {
              const chapterMems = memories.filter(m => m.chapter_id === chapter.id);
              return (
                <Link key={chapter.id} to={`/story/${chapter.id}`} className="group block">
                  <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-sky-100 hover:border-sky-300 transition-all duration-300">
                    {chapter.cover_image && (
                      <div className="w-full h-44 rounded-2xl overflow-hidden mb-4 bg-sky-50">
                        <img
                          src={chapter.cover_image}
                          alt={chapter.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs text-sky-700/70 mb-2">
                      <span className="font-semibold text-sky-700 uppercase tracking-widest text-[10px] bg-sky-50 px-2 py-0.5 rounded-full">
                        Chapter {chapter.order}
                      </span>
                      <span>{chapter.date} • {chapterMems.length} memories</span>
                    </div>
                    <h3 className="font-serif text-xl text-slate-900 group-hover:text-blue-900 mb-2">
                      {chapter.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-3">
                      {chapter.description}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      {/* Add Memory Modal */}
      <AddMemoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSaved={handleMemorySaved}
        initialDate={modalPrefillDate}
        initialChapterId={modalPrefillChapterId}
      />

      {/* Persistent Bottom Navigation */}
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
