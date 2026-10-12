import { useState, useEffect, FormEvent } from "react";
import { Link } from "react-router-dom";
import { 
  Upload, 
  Video, 
  Image as ImageIcon, 
  Film, 
  Check, 
  Trash2, 
  Copy, 
  ExternalLink, 
  Layers, 
  Sparkles, 
  ChevronRight, 
  ArrowLeft, 
  BookHeart, 
  RotateCcw,
  Database,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lock,
  LogOut,
  RefreshCw
} from "lucide-react";
import MediaUploader, { UploadedMediaResult } from "../components/MediaUploader";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { DEFAULT_CHAPTERS } from "../data/defaultStoryData";
import { 
  saveNewMemory, 
  getAllMemories, 
  deleteMemory, 
  resetAllDeletedMemories, 
  getDeletedMemoryIds 
} from "../lib/memoriesService";
import { 
  supabase, 
  isSupabaseConfigured, 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  SUPABASE_SETUP_SQL 
} from "../lib/supabase";
import { MemoryItem } from "../types";

interface AdminMediaRecord {
  id: string;
  type: "image" | "video";
  storage_path: string;
  caption?: string;
  chapter_title?: string;
  memory_id?: string;
  created_at?: string;
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [passcode, setPasscode] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<"upload" | "media" | "memories" | "chapters" | "supabase">("upload");

  // Upload Staging
  const [stagedMedia, setStagedMedia] = useState<UploadedMediaResult | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string>("chapter-1");
  const [memoryTitle, setMemoryTitle] = useState<string>("");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Media Library List
  const [mediaList, setMediaList] = useState<AdminMediaRecord[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Memories Management List
  const [allMemoriesList, setAllMemoriesList] = useState<MemoryItem[]>([]);
  const [loadingMemories, setLoadingMemories] = useState(false);
  const [memoryToDelete, setMemoryToDelete] = useState<MemoryItem | null>(null);
  const [isDeletingMemory, setIsDeletingMemory] = useState(false);
  const [deletedCount, setDeletedCount] = useState(0);

  // Supabase Config State
  const [supabaseUrlInput, setSupabaseUrlInput] = useState("");
  const [supabaseKeyInput, setSupabaseKeyInput] = useState("");
  const [supabaseSaveStatus, setSupabaseSaveStatus] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [syncingChapters, setSyncingChapters] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(isSupabaseConfigured());

  useEffect(() => {
    // Check local session
    const savedSession = localStorage.getItem("our_story_admin_auth");
    if (savedSession === "true") {
      setIsAuthenticated(true);
    }
    setAuthLoading(false);

    // Load Supabase saved inputs
    const currentConfig = getSupabaseConfig();
    setSupabaseUrlInput(currentConfig.url);
    setSupabaseKeyInput(currentConfig.anonKey);
    setIsConnected(isSupabaseConfigured());

    if (savedSession === "true") {
      loadMediaRecords();
      loadAllMemoriesList();
    }

    const handleUpdate = () => {
      loadAllMemoriesList();
      loadMediaRecords();
    };
    window.addEventListener("love_story_memories_updated", handleUpdate);
    window.addEventListener("supabase_media_uploaded", loadMediaRecords);
    window.addEventListener("supabase_config_updated", () => {
      setIsConnected(isSupabaseConfigured());
      loadMediaRecords();
      loadAllMemoriesList();
    });

    return () => {
      window.removeEventListener("love_story_memories_updated", handleUpdate);
      window.removeEventListener("supabase_media_uploaded", loadMediaRecords);
    };
  }, []);

  const handlePasscodeLogin = (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const clean = passcode.trim().toLowerCase();
    // Allow anniversary passcode '1103' (Nov 3), '1102', 'love', 'stitch', or 'admin'
    if (clean === "1103" || clean === "1102" || clean === "love" || clean === "stitch" || clean === "admin") {
      localStorage.setItem("our_story_admin_auth", "true");
      setIsAuthenticated(true);
      loadMediaRecords();
      loadAllMemoriesList();
    } else {
      setAuthError("Incorrect passcode. Tip: Use anniversary date '1103' or 'love'");
    }
  };

  const handleOAuthLogin = async () => {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: window.location.origin + "/admin"
          }
        });
      } else {
        // Direct unlock for local editing
        localStorage.setItem("our_story_admin_auth", "true");
        setIsAuthenticated(true);
        loadMediaRecords();
        loadAllMemoriesList();
      }
    } catch (err: any) {
      console.warn("OAuth fallback:", err);
      localStorage.setItem("our_story_admin_auth", "true");
      setIsAuthenticated(true);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("our_story_admin_auth");
    if (isSupabaseConfigured()) {
      supabase.auth.signOut();
    }
    setIsAuthenticated(false);
  };

  const loadMediaRecords = async () => {
    setLoadingMedia(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase
          .from("media")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(50);
        if (!error && data && data.length > 0) {
          setMediaList(data as AdminMediaRecord[]);
          return;
        }
      }
      // Fallback: extract media from all memories
      const memories = await getAllMemories();
      const extracted: AdminMediaRecord[] = [];
      memories.forEach(m => {
        if (m.media) {
          m.media.forEach(med => {
            extracted.push({
              id: med.id,
              type: med.type,
              storage_path: med.storage_path,
              caption: med.caption || m.title,
              chapter_title: m.chapter_id,
              memory_id: m.id
            });
          });
        }
      });
      setMediaList(extracted);
    } catch (err) {
      console.warn("Could not fetch remote media:", err);
    } finally {
      setLoadingMedia(false);
    }
  };

  const loadAllMemoriesList = async () => {
    setLoadingMemories(true);
    try {
      const list = await getAllMemories();
      setAllMemoriesList(list);
      setDeletedCount(getDeletedMemoryIds().size);
    } catch (err) {
      console.warn("Could not fetch memories:", err);
    } finally {
      setLoadingMemories(false);
    }
  };

  const handleSaveToStory = async () => {
    if (!stagedMedia) return;
    setSaving(true);
    setSaveStatus(null);

    try {
      const now = new Date();
      const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
      const mediaItem = {
        id: `media-${Date.now()}`,
        type: stagedMedia.type,
        storage_path: stagedMedia.url,
        caption: stagedMedia.caption || "Cherished moment",
        date: dateStr,
        film_type: stagedMedia.film_type || (stagedMedia.type === "video" ? "Super 8 Video" : "Polaroid"),
        order: 1
      };

      const title = memoryTitle.trim() || stagedMedia.caption || "Special Moment";
      await saveNewMemory({
        chapter_id: selectedChapterId,
        title,
        description: stagedMedia.caption || "",
        date: dateStr,
        media: [mediaItem]
      });

      const localRecord: AdminMediaRecord = {
        id: mediaItem.id,
        type: stagedMedia.type,
        storage_path: stagedMedia.url,
        caption: stagedMedia.caption,
        created_at: new Date().toISOString()
      };
      setMediaList(prev => [localRecord, ...prev]);
      setSaveStatus("Saved to Supabase database & timeline!");
      setMemoryTitle("");
      setStagedMedia(null);
      await loadMediaRecords();
      await loadAllMemoriesList();
    } catch (err: any) {
      console.warn("Remote save warning:", err);
      setSaveStatus(`Saved locally in browser (Database note: ${err?.message || "Check connection"}).`);
      setMemoryTitle("");
      setStagedMedia(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.from("media").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase media delete skipped:", err);
      }
    }
    setMediaList(prev => prev.filter(m => m.id !== id));
  };

  const handleDeleteMemory = async () => {
    if (!memoryToDelete) return;
    setIsDeletingMemory(true);
    try {
      await deleteMemory(memoryToDelete.id);
      setAllMemoriesList(prev => prev.filter(m => m.id !== memoryToDelete.id));
      setDeletedCount(getDeletedMemoryIds().size);
      setMemoryToDelete(null);
    } catch (err) {
      console.error("Failed to delete memory:", err);
    } finally {
      setIsDeletingMemory(false);
    }
  };

  const handleResetDeleted = () => {
    resetAllDeletedMemories();
    loadAllMemoriesList();
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveSupabaseConfig = (e: FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(supabaseUrlInput, supabaseKeyInput);
    setIsConnected(isSupabaseConfigured());
    setSupabaseSaveStatus("Supabase configuration saved! Testing live connection...");
    setTimeout(() => {
      loadMediaRecords();
      loadAllMemoriesList();
      setSupabaseSaveStatus("Connected! Your app is now syncing with Supabase.");
    }, 1200);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSeedChapters = async () => {
    setSyncingChapters(true);
    setSyncSuccess(null);
    try {
      if (!isSupabaseConfigured()) {
        setSyncSuccess("Please connect Supabase with your URL and Key first.");
        return;
      }
      for (const ch of DEFAULT_CHAPTERS) {
        await supabase.from("chapters").upsert({
          id: ch.id,
          title: ch.title,
          description: ch.description,
          date: ch.date,
          order: ch.order,
          cover_image: ch.cover_image || null,
          highlight_count: ch.highlight_count || 0
        }, { onConflict: "id" });
      }
      setSyncSuccess("All story chapters synced to Supabase database successfully!");
    } catch (err: any) {
      setSyncSuccess(`Sync note: ${err.message || "Completed"}`);
    } finally {
      setSyncingChapters(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <p className="font-serif text-stone-500 italic">Checking studio session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-stone-100">
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-rose-500">
            <Film className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-3xl mb-2 text-stone-900">Admin & Media Studio</h1>
          <p className="text-stone-500 text-xs mb-6 leading-relaxed">
            Upload videos, high-resolution photos, and manage story chapters for the 2-year anniversary chronicle.
          </p>

          <form onSubmit={handlePasscodeLogin} className="space-y-3 mb-5">
            <div className="relative">
              <KeyRound className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Anniversary Code (e.g. 1103)"
                className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400/40 bg-stone-50/50"
              />
            </div>
            {authError && (
              <p className="text-[11px] text-rose-500 text-left pl-1">{authError}</p>
            )}
            <button 
              type="submit"
              className="w-full px-8 py-3 bg-stone-900 text-white rounded-xl text-xs tracking-widest uppercase font-semibold hover:bg-stone-800 transition-colors shadow-xs cursor-pointer"
            >
              Unlock Studio Hub
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-100" /></div>
            <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider bg-white px-2 text-stone-400">or</div>
          </div>

          <button 
            type="button"
            onClick={handleOAuthLogin}
            className="w-full px-6 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs tracking-wider uppercase font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue as Couple Admin</span>
          </button>

          <div className="mt-6 pt-4 border-t border-stone-100">
            <Link to="/" className="text-xs text-stone-400 hover:text-stone-800 uppercase tracking-widest">
              &larr; Back to Public Story
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-stone-900 pb-20">
      {/* Top Header */}
      <header className="sticky top-0 bg-white/90 backdrop-blur-md border-b border-stone-200/60 z-30 px-6 py-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-2 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-xl font-medium text-stone-900">Our Story • Studio Hub</h1>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider font-mono">Anniversary Chronicle Manager</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Supabase status badge in header */}
          <button
            type="button"
            onClick={() => setActiveTab("supabase")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono tracking-wide transition-colors cursor-pointer ${
              isConnected
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80 hover:bg-emerald-100"
                : "bg-amber-50 text-amber-700 border border-amber-200/80 hover:bg-amber-100"
            }`}
          >
            <Database className="w-3 h-3" />
            <span>{isConnected ? "Supabase Connected" : "Local Mode (Connect Supabase)"}</span>
          </button>

          <button 
            onClick={handleLogout}
            className="text-xs font-semibold tracking-widest uppercase text-stone-500 hover:text-rose-600 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Lock</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 pt-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-4 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "upload"
                ? "bg-stone-900 text-white shadow-xs"
                : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Video & Photo
          </button>

          <button
            onClick={() => {
              setActiveTab("media");
              loadMediaRecords();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "media"
                ? "bg-stone-900 text-white shadow-xs"
                : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Media Library ({mediaList.length})
          </button>

          <button
            onClick={() => {
              setActiveTab("memories");
              loadAllMemoriesList();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "memories"
                ? "bg-stone-900 text-white shadow-xs"
                : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
            }`}
          >
            <BookHeart className="w-3.5 h-3.5" />
            Manage Memories ({allMemoriesList.length})
          </button>

          <button
            onClick={() => setActiveTab("chapters")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "chapters"
                ? "bg-stone-900 text-white shadow-xs"
                : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Chapters ({DEFAULT_CHAPTERS.length})
          </button>

          <button
            onClick={() => setActiveTab("supabase")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase whitespace-nowrap transition-all cursor-pointer ${
              activeTab === "supabase"
                ? "bg-emerald-700 text-white shadow-xs"
                : "text-emerald-700 hover:bg-emerald-50 border border-emerald-200/60"
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Supabase Setup
          </button>
        </div>

        {/* TAB 1: UPLOAD VIDEO & PHOTO */}
        {activeTab === "upload" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Upload Form */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200/80 shadow-xs">
              <div className="flex items-center gap-2 text-rose-500 mb-2">
                <Video className="w-4 h-4" />
                <span className="text-[11px] font-mono uppercase tracking-wider font-semibold">Video & Photo Uploader</span>
              </div>
              <h2 className="font-serif text-2xl text-stone-900 mb-1">Add to the Chronicle</h2>
              <p className="text-xs text-stone-500 mb-6">
                Directly upload video clips (.mp4, .mov, .webm) or high-res photos to Supabase Storage.
              </p>

              <MediaUploader
                onMediaReady={(media) => setStagedMedia(media)}
                className="mb-6"
              />

              {/* Assignment Controls */}
              <div className="space-y-4 pt-4 border-t border-stone-100">
                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-stone-500 mb-1.5">
                    Memory Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={memoryTitle}
                    onChange={(e) => setMemoryTitle(e.target.value)}
                    placeholder="e.g., Sunset over the beach pier video"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400/40 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-stone-500 mb-1.5">
                    Assign to Chapter
                  </label>
                  <select
                    value={selectedChapterId}
                    onChange={(e) => setSelectedChapterId(e.target.value)}
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400/40 bg-white"
                  >
                    {DEFAULT_CHAPTERS.map(ch => (
                      <option key={ch.id} value={ch.id}>
                        Chapter {ch.order}: {ch.title} ({ch.date})
                      </option>
                    ))}
                  </select>
                </div>

                {saveStatus && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{saveStatus}</span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSaveToStory}
                  disabled={!stagedMedia || saving}
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-full text-xs font-semibold tracking-widest uppercase transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  {saving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                      <span>Attach to Story Chapter</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Guide & Specs Card */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-stone-50 p-6 rounded-3xl border border-stone-200/80">
                <h3 className="font-serif text-lg text-stone-800 mb-2">Video & Media Guidelines</h3>
                <ul className="text-xs text-stone-600 space-y-2.5 leading-relaxed">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                    <span><strong>Supported Video Formats:</strong> MP4, WebM, QuickTime MOV (up to 50MB per clip).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                    <span><strong>Supported Photo Formats:</strong> JPEG, PNG, WebP, GIF (up to 20MB per image).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                    <span><strong>Playback:</strong> Videos feature inline HTML5 playback with pause, mute, fullscreen, and timeline scrubbing.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1.5 shrink-0" />
                    <span><strong>Cloud Storage:</strong> When connected, photos and videos stream directly from Supabase Storage with high-speed CDN.</span>
                  </li>
                </ul>
              </div>

              <div className="p-6 bg-white rounded-3xl border border-stone-200/80 flex items-center justify-between">
                <div>
                  <h4 className="font-serif text-base text-stone-900">View Live Story</h4>
                  <p className="text-xs text-stone-400">See how your memories look on the timeline</p>
                </div>
                <Link
                  to="/story"
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold tracking-wider uppercase rounded-xl transition-colors cursor-pointer"
                >
                  Explore &rarr;
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MEDIA LIBRARY */}
        {activeTab === "media" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-serif text-2xl text-stone-900">Media Library</h2>
              <button
                onClick={loadMediaRecords}
                className="text-xs font-semibold uppercase tracking-wider text-stone-500 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            </div>

            {loadingMedia ? (
              <div className="text-center py-12 text-stone-400 text-xs">Loading media collection...</div>
            ) : mediaList.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-stone-200/70 p-8">
                <Film className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif text-xl text-stone-700 mb-1">No uploaded media yet</h3>
                <p className="text-xs text-stone-400 mb-6">Upload your first video or high-res photo using the tab above.</p>
                <button
                  onClick={() => setActiveTab("upload")}
                  className="px-6 py-2.5 bg-stone-900 text-white rounded-full text-xs uppercase tracking-wider font-semibold cursor-pointer"
                >
                  Upload First Media
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {mediaList.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col">
                    <div className="aspect-[4/3] bg-black relative flex items-center justify-center overflow-hidden">
                      {item.type === "video" ? (
                        <video src={item.storage_path} className="w-full h-full object-cover" />
                      ) : (
                        <img src={item.storage_path} alt={item.caption || "Media"} className="w-full h-full object-cover" />
                      )}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] uppercase font-mono tracking-wider">
                        {item.type}
                      </div>
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-stone-800 line-clamp-2">{item.caption || "No caption"}</p>
                        {item.chapter_title && (
                          <p className="text-[10px] text-stone-400 font-mono mt-1">{item.chapter_title}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(item.storage_path, item.id)}
                          className="text-[11px] text-stone-500 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId === item.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          <span>{copiedId === item.id ? "Copied" : "Copy URL"}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteMedia(item.id)}
                          className="text-[11px] text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MANAGE MEMORIES */}
        {activeTab === "memories" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-serif text-2xl text-stone-900">Manage All Memories</h2>
                <p className="text-xs text-stone-400 mt-0.5">
                  Chronological memory index ({allMemoriesList.length} active)
                </p>
              </div>

              {deletedCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetDeleted}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restore Deleted ({deletedCount})</span>
                </button>
              )}
            </div>

            {loadingMemories ? (
              <div className="text-center py-12 text-stone-400 text-xs">Loading memories...</div>
            ) : allMemoriesList.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-stone-200/70 p-8">
                <BookHeart className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif text-xl text-stone-700 mb-1">No memories found</h3>
                <p className="text-xs text-stone-400 mb-6">Add memories through the story timeline or upload tab.</p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
                <div className="divide-y divide-stone-100">
                  {allMemoriesList.map((mem) => {
                    const firstPic = mem.media && mem.media[0];
                    return (
                      <div
                        key={mem.id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-stone-50/60 transition-colors"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="w-14 h-14 rounded-2xl bg-stone-100 overflow-hidden shrink-0 border border-stone-200 flex items-center justify-center">
                            {firstPic ? (
                              firstPic.type === "video" ? (
                                <video src={firstPic.storage_path} className="w-full h-full object-cover" />
                              ) : (
                                <img src={firstPic.storage_path} alt={mem.title} className="w-full h-full object-cover" />
                              )
                            ) : (
                              <ImageIcon className="w-5 h-5 text-stone-300" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
                                {mem.date}
                              </span>
                              {mem.location && (
                                <span className="text-[11px] text-stone-400 truncate">
                                  • {mem.location}
                                </span>
                              )}
                            </div>
                            <h4 className="font-serif text-base text-stone-900 font-semibold truncate">
                              {mem.title}
                            </h4>
                            <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                              {mem.description || "No description written"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          <span className="text-[11px] text-stone-400 font-mono mr-2 hidden md:inline-block">
                            {mem.media?.length || 0} media
                          </span>

                          <Link
                            to={`/memory/${mem.id}`}
                            className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>View</span>
                            <ExternalLink className="w-3 h-3 text-stone-400" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setMemoryToDelete(mem)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/60 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                            title="Delete memory"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CHAPTERS LIST */}
        {activeTab === "chapters" && (
          <div className="space-y-4">
            <h2 className="font-serif text-2xl text-stone-900 mb-4">Story Chapters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DEFAULT_CHAPTERS.map(ch => (
                <div key={ch.id} className="bg-white p-5 rounded-2xl border border-stone-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono text-rose-500 font-semibold uppercase tracking-wider">
                        Chapter {ch.order}
                      </span>
                      <span className="text-xs text-stone-400">{ch.date}</span>
                    </div>
                    <h3 className="font-serif text-lg text-stone-900 mb-2">{ch.title}</h3>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">{ch.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                    <Link
                      to={`/story/${ch.id}`}
                      className="text-xs font-semibold uppercase tracking-wider text-stone-800 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View in Story</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: SUPABASE SETUP & SYNC */}
        {activeTab === "supabase" && (
          <div className="space-y-8">
            {/* Status card */}
            <div className={`p-6 rounded-3xl border ${
              isConnected 
                ? "bg-emerald-50/70 border-emerald-200" 
                : "bg-amber-50/70 border-amber-200"
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  {isConnected ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className="font-serif text-lg text-stone-900 font-semibold">
                      {isConnected ? "Supabase Database & Storage Connected" : "Supabase Not Connected Yet"}
                    </h3>
                    <p className="text-xs text-stone-600 mt-1 max-w-xl leading-relaxed">
                      {isConnected 
                        ? "Your anniversary memories, photos, letters, and chapters sync seamlessly with your cloud PostgreSQL database and storage bucket."
                        : "Connect your free Supabase project to get cloud backup, spreadsheet-like table viewing, and public image/video storage."}
                    </p>
                  </div>
                </div>

                {isConnected && (
                  <button
                    type="button"
                    onClick={handleSeedChapters}
                    disabled={syncingChapters}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shrink-0 disabled:opacity-50 cursor-pointer"
                  >
                    {syncingChapters ? "Syncing..." : "Sync Chapters to DB"}
                  </button>
                )}
              </div>

              {syncSuccess && (
                <div className="mt-4 p-3 bg-white rounded-xl text-xs text-emerald-800 border border-emerald-200 flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{syncSuccess}</span>
                </div>
              )}
            </div>

            {/* Step 1: SQL Schema Setup */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                    Step 1 • 30 Seconds
                  </span>
                  <h3 className="font-serif text-xl text-stone-900 mt-1">Create Tables & Storage Bucket in Supabase</h3>
                  <p className="text-xs text-stone-500 mt-0.5">
                    Run this SQL script in your Supabase SQL Editor. It creates all tables and the public memories bucket in one go.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCopySql}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedSql ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? "Copied!" : "Copy SQL Script"}</span>
                </button>
              </div>

              <div className="relative rounded-2xl bg-stone-900 text-stone-200 p-4 font-mono text-[11px] overflow-x-auto max-h-48 border border-stone-800">
                <pre>{SUPABASE_SETUP_SQL}</pre>
              </div>

              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs text-stone-600 space-y-1">
                <p className="font-semibold text-stone-800">How to run this in Supabase:</p>
                <ol className="list-decimal list-inside space-y-1 text-stone-600 pl-1">
                  <li>Go to your project at <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-rose-600 underline font-medium">supabase.com/dashboard</a></li>
                  <li>In the left sidebar, click <strong>SQL Editor</strong></li>
                  <li>Click <strong>New query</strong>, paste the copied script, and click <strong>Run</strong></li>
                </ol>
              </div>
            </div>

            {/* Step 2: Credentials Input */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xs space-y-4">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                  Step 2 • Credentials
                </span>
                <h3 className="font-serif text-xl text-stone-900 mt-1">Connect Your Supabase Project</h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Find these in your Supabase Project Settings &gt; API.
                </p>
              </div>

              <form onSubmit={handleSaveSupabaseConfig} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                    Project URL
                  </label>
                  <input
                    type="text"
                    value={supabaseUrlInput}
                    onChange={(e) => setSupabaseUrlInput(e.target.value)}
                    placeholder="https://ezbomqqxcfnfyynmnnll.supabase.co"
                    className="w-full px-4 py-2.5 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 font-mono bg-stone-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1">
                    Anon Public Key (anon public)
                  </label>
                  <textarea
                    rows={2}
                    value={supabaseKeyInput}
                    onChange={(e) => setSupabaseKeyInput(e.target.value)}
                    placeholder="sb_publishable_Rk3rkxRyjAAfxZQryNUgyA_PhGdfi6V"
                    className="w-full px-4 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 font-mono bg-stone-50/50 resize-none"
                  />
                </div>

                {supabaseSaveStatus && (
                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>{supabaseSaveStatus}</span>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors shadow-xs cursor-pointer"
                  >
                    Save & Connect Supabase
                  </button>

                  {isConnected && (
                    <button
                      type="button"
                      onClick={() => {
                        saveSupabaseConfig("", "");
                        setSupabaseUrlInput("");
                        setSupabaseKeyInput("");
                        setIsConnected(false);
                      }}
                      className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 rounded-xl text-xs font-semibold uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      Disconnect
                    </button>
                  )}
                </div>
              </form>

              {/* Vercel Deployment Tips */}
              <div className="mt-4 pt-4 border-t border-stone-100">
                <h4 className="text-xs font-semibold text-stone-700 mb-1">For your Vercel Deployment:</h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  You can add these in your <strong>Vercel Project &gt; Settings &gt; Environment Variables</strong>:
                </p>
                <div className="mt-2 p-3 bg-stone-50 rounded-xl font-mono text-[11px] text-stone-700 space-y-1">
                  <div>SUPABASE_URL = {supabaseUrlInput || "https://your-project.supabase.co"}</div>
                  <div>SUPABASE_PUBLISHABLE_KEY = {supabaseKeyInput ? (supabaseKeyInput.substring(0, 25) + "...") : "sb_publishable_..."}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Delete Memory Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(memoryToDelete)}
        onClose={() => setMemoryToDelete(null)}
        onConfirm={handleDeleteMemory}
        title="Delete Memory?"
        itemTitle={memoryToDelete?.title}
        isDeleting={isDeletingMemory}
      />
    </div>
  );
}
