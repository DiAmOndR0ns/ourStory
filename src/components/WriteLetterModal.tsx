import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  Sparkles, 
  Heart, 
  Calendar, 
  PenLine, 
  Eye, 
  Lock, 
  Unlock, 
  Trash2, 
  Check, 
  Lightbulb,
  Feather
} from "lucide-react";
import { LetterItem } from "../types";
import { saveLetter, deleteLetter } from "../lib/lettersService";

interface WriteLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  letterToEdit?: LetterItem | null;
  onSaved?: (letter: LetterItem) => void;
  onDeleted?: (id: string) => void;
}

const PRESET_TAGS = [
  "From the Heart",
  "Shades of Blue",
  "Stitch & Ohana",
  "The First Spark",
  "Anniversary Vow",
  "Two-Year Anniversary",
  "Midnight Thoughts",
  "Just Because"
];

const WRITING_PROMPTS = [
  "How you felt the first moment you saw her profile picture and swiped right.",
  "Your favorite quiet Sunday morning or late-night drive together.",
  "Something little she does that always makes your heart melt.",
  "The promises you want to make for your future adventures together."
];

export default function WriteLetterModal({
  isOpen,
  onClose,
  letterToEdit,
  onSaved,
  onDeleted
}: WriteLetterModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [themeTag, setThemeTag] = useState("From the Heart");
  const [customTag, setCustomTag] = useState("");
  const [unlockType, setUnlockType] = useState<"immediate" | "date">("immediate");
  const [customDate, setCustomDate] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [showPrompts, setShowPrompts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize or reset when modal opens or letterToEdit changes
  useEffect(() => {
    if (letterToEdit) {
      setTitle(letterToEdit.title || "");
      setContent(letterToEdit.content || "");
      const existingTag = letterToEdit.theme_tag || "From the Heart";
      if (PRESET_TAGS.includes(existingTag)) {
        setThemeTag(existingTag);
        setCustomTag("");
      } else {
        setThemeTag("Custom");
        setCustomTag(existingTag);
      }

      // Check unlock date
      const d = new Date(letterToEdit.unlock_date);
      const isPastOrToday = isNaN(d.getTime()) || d <= new Date();
      if (isPastOrToday && letterToEdit.unlock_date.toLowerCase().includes("immediate")) {
        setUnlockType("immediate");
        setCustomDate(new Date().toISOString().split("T")[0]);
      } else {
        // Formulate ISO date if valid
        if (!isNaN(d.getTime())) {
          setCustomDate(d.toISOString().split("T")[0]);
          setUnlockType("date");
        } else {
          setUnlockType("date");
          setCustomDate(letterToEdit.unlock_date);
        }
      }
    } else {
      // Default new letter
      setTitle("");
      setContent("");
      setThemeTag("From the Heart");
      setCustomTag("");
      setUnlockType("immediate");
      setCustomDate(new Date().toISOString().split("T")[0]);
      setPreviewMode(false);
      setShowPrompts(false);
      setError(null);
    }
  }, [letterToEdit, isOpen]);

  if (!isOpen) return null;

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const charCount = content.length;

  const effectiveTag = themeTag === "Custom" ? (customTag.trim() || "From the Heart") : themeTag;

  function formatFormattedUnlockDate(): string {
    if (unlockType === "immediate") {
      const now = new Date();
      return now.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }
    if (!customDate) {
      return "November 3, 2026";
    }
    const parsed = new Date(customDate);
    if (!isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
    }
    return customDate;
  }

  async function handleSave() {
    if (!title.trim()) {
      setError("Please give your letter a title.");
      return;
    }
    if (!content.trim()) {
      setError("Please write your letter words.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const unlockDateStr = formatFormattedUnlockDate();

      const saved = await saveLetter({
        id: letterToEdit?.id,
        title: title.trim(),
        content: content.trim(),
        unlock_date: unlockDateStr,
        theme_tag: effectiveTag,
        chapter_id: letterToEdit?.chapter_id || "chapter-1"
      });

      onSaved?.(saved);
      onClose();
    } catch (err: any) {
      console.error("Error saving letter:", err);
      setError(err?.message || "Failed to save your letter. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!letterToEdit?.id) return;
    const confirmDelete = window.confirm("Are you sure you want to delete this letter?");
    if (!confirmDelete) return;

    try {
      setSaving(true);
      await deleteLetter(letterToEdit.id);
      onDeleted?.(letterToEdit.id);
      onClose();
    } catch (err: any) {
      console.error("Error deleting letter:", err);
      setError(err?.message || "Failed to delete letter.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white rounded-3xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl border border-sky-100 overflow-hidden"
      >
        {/* Top Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-sky-100 bg-gradient-to-r from-sky-50 via-white to-blue-50/40">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center shadow-sm">
                <Feather className="w-5 h-5 text-sky-600" />
              </div>
              <div>
                <h3 className="font-serif text-xl sm:text-2xl text-slate-900 font-medium">
                  {letterToEdit ? "Edit Your Letter" : "Write a Sealed Letter"}
                </h3>
                <p className="text-xs text-sky-800/60 tracking-wider uppercase font-mono">
                  In your own words • Our love story
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Preview Toggle */}
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide flex items-center gap-1.5 transition-all ${
                  previewMode
                    ? "bg-sky-600 text-white shadow-sm"
                    : "bg-white border border-sky-200 text-sky-700 hover:bg-sky-50"
                }`}
              >
                {previewMode ? (
                  <>
                    <PenLine className="w-3.5 h-3.5" />
                    <span>Edit Mode</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {previewMode ? (
            /* Letter Paper Preview */
            <div className="bg-[#FAF9F5] border border-amber-100/80 rounded-2xl p-6 sm:p-10 shadow-inner space-y-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500" />
              
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 uppercase tracking-widest text-[10px] font-semibold">
                  {effectiveTag}
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-sky-600" />
                  {unlockType === "immediate" ? "Unlocks: Immediately" : `Unlocks: ${formatFormattedUnlockDate()}`}
                </span>
              </div>

              <h2 className="font-serif text-2xl sm:text-3xl text-slate-900 text-center pt-2">
                {title || "Untitled Letter"}
              </h2>

              <div className="font-serif text-base sm:text-lg text-slate-700 leading-relaxed sm:leading-loose whitespace-pre-wrap max-w-xl mx-auto px-2">
                {content || <span className="italic text-slate-400">Your letter words will appear here...</span>}
              </div>

              <div className="pt-6 border-t border-amber-200/40 text-center text-xs font-mono tracking-widest uppercase text-sky-700/80">
                Sealed with all my heart • Ohana forever
              </div>
            </div>
          ) : (
            /* Editing Form */
            <div className="space-y-4">
              {/* Title Input */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Letter Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. To The Girl Who Painted My World in Every Shade of Blue"
                  className="w-full px-4 py-3 rounded-2xl border border-sky-200 bg-sky-50/20 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 text-sm font-medium transition"
                  maxLength={150}
                />
              </div>

              {/* Theme Tag Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">
                  Occasion / Theme Tag
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {PRESET_TAGS.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setThemeTag(tag)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                        themeTag === tag
                          ? "bg-sky-600 text-white shadow-xs"
                          : "bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-800"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setThemeTag("Custom")}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-all ${
                      themeTag === "Custom"
                        ? "bg-sky-600 text-white shadow-xs"
                        : "bg-slate-100 hover:bg-sky-50 text-slate-600 hover:text-sky-800"
                    }`}
                  >
                    + Custom Tag
                  </button>
                </div>

                {themeTag === "Custom" && (
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Enter custom theme tag (e.g. Our Road Trips)"
                    className="w-full px-4 py-2 text-xs rounded-xl border border-sky-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 mt-1"
                    maxLength={40}
                  />
                )}
              </div>

              {/* Unlock Date Setting */}
              <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-3">
                <label className="block text-xs font-semibold uppercase tracking-wider text-sky-900">
                  When Can She Open This Letter?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUnlockType("immediate")}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                      unlockType === "immediate"
                        ? "bg-white border-sky-400 shadow-xs ring-1 ring-sky-300"
                        : "bg-white/60 border-sky-200/70 hover:bg-white text-slate-600"
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                      <Unlock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800">Unlock Immediately</div>
                      <div className="text-[11px] text-slate-500">Readable right now anytime</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUnlockType("date")}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start gap-2.5 ${
                      unlockType === "date"
                        ? "bg-white border-sky-400 shadow-xs ring-1 ring-sky-300"
                        : "bg-white/60 border-sky-200/70 hover:bg-white text-slate-600"
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800">Seal for a Date</div>
                      <div className="text-[11px] text-slate-500">Unlocks on an anniversary</div>
                    </div>
                  </button>
                </div>

                {unlockType === "date" && (
                  <div className="pt-2 flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="px-3 py-2 text-xs rounded-xl border border-sky-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
                    />
                    <div className="flex gap-1.5 flex-wrap">
                      <button
                        type="button"
                        onClick={() => setCustomDate("2024-11-03")}
                        className="text-[10px] px-2 py-1 rounded-lg bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 font-medium"
                      >
                        Nov 3, 2024
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomDate("2025-11-03")}
                        className="text-[10px] px-2 py-1 rounded-lg bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 font-medium"
                      >
                        Nov 3, 2025 (Year 1)
                      </button>
                      <button
                        type="button"
                        onClick={() => setCustomDate("2026-11-03")}
                        className="text-[10px] px-2 py-1 rounded-lg bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 font-medium"
                      >
                        Nov 3, 2026 (Year 2)
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Prompts Accordion Helper */}
              <div className="rounded-2xl border border-sky-100 bg-sky-50/40 p-3">
                <button
                  type="button"
                  onClick={() => setShowPrompts(!showPrompts)}
                  className="w-full flex items-center justify-between text-xs font-semibold text-sky-800 tracking-wide"
                >
                  <span className="flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-sky-500" />
                    Need some inspiration for what to write?
                  </span>
                  <span className="text-[11px] font-mono text-sky-600 underline">
                    {showPrompts ? "Hide ideas" : "Show ideas"}
                  </span>
                </button>

                {showPrompts && (
                  <div className="mt-3 space-y-1.5 pt-2 border-t border-sky-100 text-xs text-slate-600">
                    {WRITING_PROMPTS.map((prompt, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <Heart className="w-3 h-3 text-sky-400 mt-0.5 shrink-0" />
                        <span>{prompt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Letter Content Textarea */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                    Letter Words <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] font-mono text-slate-400">
                    {wordCount} words • {charCount} chars
                  </span>
                </div>

                <div className="relative rounded-2xl border border-sky-200 bg-[#FCFDFE] focus-within:ring-2 focus-within:ring-sky-500/30 focus-within:border-sky-500 transition overflow-hidden">
                  <textarea
                    rows={10}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="My dearest,&#10;&#10;Write whatever is in your heart. Tell her about the little things you cherish, how she makes you feel safe, your favorite jokes, or why she is your favorite human..."
                    className="w-full p-4 font-serif text-base text-slate-800 leading-relaxed bg-transparent focus:outline-none resize-y placeholder:text-slate-400 placeholder:font-sans placeholder:text-xs"
                    maxLength={15000}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-sky-100 flex items-center justify-between">
          <div>
            {letterToEdit?.id && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-rose-50 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Letter</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/60 transition"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2.5 rounded-xl text-xs font-semibold tracking-wide bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800 text-white shadow-md shadow-sky-500/20 flex items-center gap-2 transition disabled:opacity-50"
            >
              {saving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{letterToEdit ? "Save Changes" : "Seal & Save Letter"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
