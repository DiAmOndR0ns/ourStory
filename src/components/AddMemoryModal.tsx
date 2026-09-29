import { useState, useEffect, type FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Calendar, 
  MapPin, 
  Music, 
  Heart, 
  Sparkles, 
  BookOpen, 
  Check, 
  Film,
  Camera,
  Layers
} from "lucide-react";
import MediaUploader, { UploadedMediaResult } from "./MediaUploader";
import { saveNewMemory, inferChapterIdFromDate, MONTH_NAMES } from "../lib/memoriesService";
import { DEFAULT_CHAPTERS } from "../data/defaultStoryData";
import { MemoryItem, MediaItem } from "../types";

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (memory: MemoryItem) => void;
  initialDate?: string;
  initialChapterId?: string;
}

export default function AddMemoryModal({
  isOpen,
  onClose,
  onSaved,
  initialDate,
  initialChapterId
}: AddMemoryModalProps) {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [chapterId, setChapterId] = useState("chapter-1");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  
  // Soundtrack info
  const [songTitle, setSongTitle] = useState("");
  const [songArtist, setSongArtist] = useState("");
  
  // Media info
  const [stagedMedia, setStagedMedia] = useState<UploadedMediaResult | null>(null);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaCaption, setMediaCaption] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [filmType, setFilmType] = useState("Polaroid");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Quick Year and Month helpers
  const [selectedYear, setSelectedYear] = useState<number>(2024);
  const [selectedMonth, setSelectedMonth] = useState<number>(11);

  useEffect(() => {
    if (isOpen) {
      setSuccessMessage(null);
      if (initialDate) {
        setDate(initialDate);
        const yMatch = initialDate.match(/\b(202[3-9])\b/);
        if (yMatch) setSelectedYear(parseInt(yMatch[1], 10));
      } else {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        setDate(`${yyyy}-${mm}-${dd}`);
        setSelectedYear(yyyy);
        setSelectedMonth(today.getMonth() + 1);
      }

      if (initialChapterId) {
        setChapterId(initialChapterId);
      } else if (initialDate) {
        const { chapterId: inferred } = inferChapterIdFromDate(initialDate);
        setChapterId(inferred);
      }
    }
  }, [isOpen, initialDate, initialChapterId]);

  // Sync date when Year and Month quick buttons are selected
  const handleYearMonthQuickSelect = (year: number, month: number) => {
    setSelectedYear(year);
    setSelectedMonth(month);
    const formatted = `${MONTH_NAMES[month - 1]} 15, ${year}`;
    setDate(formatted);
    const { chapterId: inferred } = inferChapterIdFromDate(formatted);
    setChapterId(inferred);
  };

  const handleMediaReady = (media: UploadedMediaResult) => {
    setStagedMedia(media);
    setMediaUrl(media.url);
    setMediaType(media.type);
    if (media.caption) setMediaCaption(media.caption);
    if (media.film_type) setFilmType(media.film_type);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const mediaList: MediaItem[] = [];

      if (stagedMedia && stagedMedia.url) {
        mediaList.push({
          id: `med-${Date.now()}`,
          type: stagedMedia.type,
          storage_path: stagedMedia.url,
          caption: stagedMedia.caption || mediaCaption || title,
          date: date || `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`,
          film_type: stagedMedia.film_type || filmType,
          order: 1
        });
      } else if (mediaUrl.trim()) {
        const isVid = mediaType === "video" || /\.(mp4|webm|mov|ogg)($|\?)/i.test(mediaUrl);
        mediaList.push({
          id: `med-${Date.now()}`,
          type: isVid ? "video" : "image",
          storage_path: mediaUrl.trim(),
          caption: mediaCaption.trim() || title,
          date: date || `${MONTH_NAMES[selectedMonth - 1]} ${selectedYear}`,
          film_type: isVid ? "Super 8 Video" : filmType,
          order: 1
        });
      }

      const songInfo = songTitle.trim() ? {
        title: songTitle.trim(),
        artist: songArtist.trim() || "Soundtrack"
      } : undefined;

      const newMemory = await saveNewMemory({
        chapter_id: chapterId,
        title: title.trim(),
        description: description.trim(),
        date: date || `${MONTH_NAMES[selectedMonth - 1]} 15, ${selectedYear}`,
        location: location.trim() || undefined,
        song: songInfo,
        media: mediaList
      });

      setSuccessMessage("Memory saved! Stitch is keeping this moment safe in your Ohana chronicle.");
      
      setTimeout(() => {
        if (onSaved) onSaved(newMemory);
        onClose();
        // Reset form
        setTitle("");
        setDescription("");
        setLocation("");
        setMediaUrl("");
        setStagedMedia(null);
        setSongTitle("");
        setSongArtist("");
        setIsSubmitting(false);
      }, 900);

    } catch (err) {
      console.error("Failed to save memory:", err);
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-sky-100 overflow-hidden my-8 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 border-b border-sky-100 bg-gradient-to-r from-sky-50/70 via-blue-50/40 to-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-600 text-white flex items-center justify-center shadow-xs">
                <Heart className="w-5 h-5 fill-white" />
              </div>
              <div>
                <h2 className="font-serif text-xl sm:text-2xl text-slate-900 font-medium">
                  Add a Memory with Her
                </h2>
                <p className="text-sky-800/70 text-xs">
                  Chronicle every month since 2024 into your two-year story timeline.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:text-slate-800 hover:bg-sky-50 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-800">
            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-sky-50 border border-sky-200 text-sky-900 text-xs flex items-center gap-2.5 font-medium"
              >
                <Sparkles className="w-4 h-4 text-sky-600 shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}

            {/* Quick Month & Year Picker Bar */}
            <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100">
              <label className="block text-xs font-semibold uppercase tracking-wider text-sky-900 mb-2">
                Quick Month & Year Selection
              </label>

              <div className="flex items-center gap-2 mb-3">
                <span className="text-[11px] font-sans text-sky-800/70 uppercase">Year:</span>
                {[2024, 2025, 2026].map(y => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => handleYearMonthQuickSelect(y, selectedMonth)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedYear === y
                        ? "bg-sky-600 text-white shadow-xs"
                        : "bg-white text-sky-800 border border-sky-200 hover:bg-sky-100"
                    }`}
                  >
                    {y}
                  </button>
                ))}
              </div>

              {/* Month pills */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5">
                {MONTH_NAMES.map((name, idx) => {
                  const mNum = idx + 1;
                  // Don't show Dec 2026 since anniversary is Nov 2026
                  if (selectedYear === 2026 && mNum > 11) return null;

                  const isSelected = selectedMonth === mNum;
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => handleYearMonthQuickSelect(selectedYear, mNum)}
                      className={`py-1 px-1.5 rounded-lg text-[11px] font-sans text-center transition-all ${
                        isSelected
                          ? "bg-slate-900 text-white font-semibold shadow-xs"
                          : "bg-white text-slate-700 border border-sky-100 hover:bg-sky-100/70"
                      }`}
                    >
                      {name.substring(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title & Specific Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Memory Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Rainy day ramen & warm tea"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-sky-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Date / Display Date
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-sky-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={date}
                    onChange={(e) => {
                      setDate(e.target.value);
                      const { chapterId: inferred } = inferChapterIdFromDate(e.target.value);
                      setChapterId(inferred);
                    }}
                    placeholder="e.g. November 14, 2024"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-sky-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Chapter & Location */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Story Chapter
                </label>
                <div className="relative">
                  <BookOpen className="w-4 h-4 text-sky-500 absolute left-3 top-3 pointer-events-none" />
                  <select
                    value={chapterId}
                    onChange={(e) => setChapterId(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-sky-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  >
                    {DEFAULT_CHAPTERS.map(c => (
                      <option key={c.id} value={c.id}>
                        Chapter {c.order}: {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                  Location (Optional)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-sky-500 absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Pacific Heights viewpoint"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-sky-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                The Story & What Made It Special
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe this moment with her, the feelings, the little details, or inside jokes..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-sky-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              />
            </div>

            {/* Photo / Video Upload Area */}
            <div className="border-t border-sky-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-sky-600" />
                  Photo or Video with Her
                </label>
                <span className="text-[11px] text-sky-700 font-sans">
                  Upload file or paste link
                </span>
              </div>

              <MediaUploader
                onMediaReady={handleMediaReady}
                defaultCaption={title}
                defaultFilmType={filmType}
              />
            </div>

            {/* Soundtrack Song (Optional) */}
            <div className="border-t border-sky-100 pt-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1.5">
                <Music className="w-4 h-4 text-sky-600" />
                Soundtrack (Optional Song Playing)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  value={songTitle}
                  onChange={(e) => setSongTitle(e.target.value)}
                  placeholder="Song Title (e.g. Texas Sun)"
                  className="w-full px-3.5 py-2 rounded-xl border border-sky-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <input
                  type="text"
                  value={songArtist}
                  onChange={(e) => setSongArtist(e.target.value)}
                  placeholder="Artist (e.g. Leon Bridges)"
                  className="w-full px-3.5 py-2 rounded-xl border border-sky-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            {/* Footer Actions */}
            <div className="pt-4 border-t border-sky-100 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-slate-500 hover:text-slate-800"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !title.trim()}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold uppercase tracking-wider transition-all disabled:opacity-50 shadow-md"
              >
                {isSubmitting ? (
                  <span>Saving Memory...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4 text-sky-400" />
                    <span>Save to Timeline</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
