import { useState, useEffect } from "react";
import { auth, googleProvider, db } from "../lib/firebase";
import { signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, limit } from "firebase/firestore";
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
  RotateCcw
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"upload" | "media" | "memories" | "chapters">("upload");

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

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        loadMediaRecords();
        loadAllMemoriesList();
      }
    });

    const handleUpdate = () => {
      loadAllMemoriesList();
    };
    window.addEventListener("love_story_memories_updated", handleUpdate);

    return () => {
      unsubscribe();
      window.removeEventListener("love_story_memories_updated", handleUpdate);
    };
  }, []);

  const loadMediaRecords = async () => {
    setLoadingMedia(true);
    try {
      const q = query(collection(db, "media"), limit(50));
      const snap = await getDocs(q);
      const items: AdminMediaRecord[] = snap.docs.map(d => ({
        id: d.id,
        ...(d.data() as Omit<AdminMediaRecord, "id">)
      }));
      setMediaList(items);
    } catch (err) {
      console.warn("Could not fetch remote media, using session items:", err);
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

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
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
        id: `saved-${Date.now()}`,
        type: stagedMedia.type,
        storage_path: stagedMedia.url,
        caption: stagedMedia.caption,
        created_at: new Date().toISOString()
      };
      setMediaList(prev => [localRecord, ...prev]);
      setSaveStatus("Successfully saved memory & media to story!");
      setMemoryTitle("");
      setStagedMedia(null);
    } catch (err) {
      console.warn("Error saving memory:", err);
      setSaveStatus("Saved locally for your current session.");
      setMemoryTitle("");
      setStagedMedia(null);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteMedia = async (id: string) => {
    try {
      await deleteDoc(doc(db, "media", id));
      setMediaList(prev => prev.filter(m => m.id !== id));
    } catch (err) {
      console.warn("Delete skipped on remote:", err);
      setMediaList(prev => prev.filter(m => m.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center">
        <p className="font-serif text-stone-500 italic">Checking authentication...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl shadow-sm border border-stone-100">
          <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-5 text-rose-500">
            <Film className="w-7 h-7" />
          </div>
          <h1 className="font-serif text-3xl mb-2 text-stone-900">Admin & Media Hub</h1>
          <p className="text-stone-500 text-xs mb-8">
            Sign in to upload videos, high-resolution photos, and manage story chapters for the 2-year anniversary chronicle.
          </p>
          <button 
            onClick={handleLogin}
            className="w-full px-8 py-3.5 bg-stone-900 text-white rounded-full text-xs tracking-widest uppercase font-semibold hover:bg-stone-800 transition-colors shadow-sm"
          >
            Sign In with Google
          </button>
          <div className="mt-6">
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
          <Link to="/" className="p-2 rounded-full hover:bg-stone-100 text-stone-500">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="font-serif text-xl font-medium text-stone-900">Our Story • Studio Hub</h1>
            <p className="text-[10px] text-stone-400 uppercase tracking-wider font-mono">Anniversary Chronicle Manager</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-stone-500 font-mono hidden md:inline-block">{user.email}</span>
          <button 
            onClick={handleLogout}
            className="text-xs font-semibold tracking-widest uppercase text-stone-500 hover:text-rose-600 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-6 pt-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-4 mb-8">
          <button
            onClick={() => setActiveTab("upload")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all ${
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all ${
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all ${
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
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wider uppercase transition-all ${
              activeTab === "chapters"
                ? "bg-stone-900 text-white shadow-xs"
                : "text-stone-500 hover:text-stone-900 hover:bg-stone-100"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Chapters ({DEFAULT_CHAPTERS.length})
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
                Directly upload video clips (.mp4, .mov, .webm) or high-res photos to Firebase Storage.
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
                  className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-full text-xs font-semibold tracking-widest uppercase transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
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
                    <span><strong>Interactive Lightbox:</strong> Videos can be expanded to full-screen view directly from the story gallery.</span>
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
                  className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold tracking-wider uppercase rounded-xl transition-colors"
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
                className="text-xs font-semibold uppercase tracking-wider text-stone-500 hover:text-stone-900"
              >
                Refresh
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
                  className="px-6 py-2.5 bg-stone-900 text-white rounded-full text-xs uppercase tracking-wider font-semibold"
                >
                  Upload First Media
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {mediaList.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden flex flex-col">
                    <div className="relative aspect-video bg-black flex items-center justify-center">
                      {item.type === "video" ? (
                        <video
                          src={item.storage_path}
                          controls
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <img
                          src={item.storage_path}
                          alt={item.caption || "Media preview"}
                          className="w-full h-full object-cover"
                        />
                      )}
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] uppercase font-mono">
                        {item.type}
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <p className="text-xs text-stone-700 line-clamp-2 font-medium mb-3">
                        {item.caption || "Untitled memory media"}
                      </p>

                      <div className="flex items-center justify-between pt-3 border-t border-stone-100 text-xs text-stone-400">
                        <button
                          onClick={() => handleCopyUrl(item.storage_path, item.id)}
                          className="flex items-center gap-1 hover:text-stone-800"
                        >
                          {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="text-[11px] font-sans">{copiedId === item.id ? "Copied!" : "Copy URL"}</span>
                        </button>

                        <button
                          onClick={() => handleDeleteMedia(item.id)}
                          className="text-stone-400 hover:text-rose-600 transition-colors p-1"
                          title="Delete media"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-serif text-2xl text-stone-900">Manage Memories</h2>
                <p className="text-xs text-stone-500">
                  Review and remove memories from your 2-year story timeline and chapter scrapbooks.
                </p>
              </div>

              <div className="flex items-center gap-3">
                {deletedCount > 0 && (
                  <button
                    onClick={handleResetDeleted}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold uppercase tracking-wider transition-colors"
                    title="Restore previously removed memories"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore ({deletedCount}) Deleted</span>
                  </button>
                )}

                <button
                  onClick={loadAllMemoriesList}
                  className="text-xs font-semibold uppercase tracking-wider text-stone-500 hover:text-stone-900"
                >
                  Refresh
                </button>
              </div>
            </div>

            {loadingMemories ? (
              <div className="text-center py-12 text-stone-400 text-xs font-serif italic">
                Loading memory records...
              </div>
            ) : allMemoriesList.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-3xl border border-stone-200/70 p-8">
                <BookHeart className="w-10 h-10 text-stone-300 mx-auto mb-3" />
                <h3 className="font-serif text-xl text-stone-700 mb-1">No active memories found</h3>
                <p className="text-xs text-stone-400 mb-6">All memories may have been removed or none were added yet.</p>
                {deletedCount > 0 && (
                  <button
                    onClick={handleResetDeleted}
                    className="px-6 py-2.5 bg-stone-900 text-white rounded-full text-xs uppercase tracking-wider font-semibold"
                  >
                    Restore All Deleted Memories
                  </button>
                )}
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
                            {mem.media?.length || 0} photos
                          </span>

                          <Link
                            to={`/memory/${mem.id}`}
                            className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1"
                          >
                            <span>View</span>
                            <ExternalLink className="w-3 h-3 text-stone-400" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setMemoryToDelete(mem)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/60 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center gap-1"
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
                      className="text-xs font-semibold uppercase tracking-wider text-stone-800 hover:text-rose-600 flex items-center gap-1"
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
