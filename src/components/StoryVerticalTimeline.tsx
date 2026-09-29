import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Heart, 
  Calendar, 
  Sparkles, 
  ChevronRight, 
  Clock, 
  Compass, 
  Image as ImageIcon,
  CheckCircle2,
  Flag,
  Plus,
  Music,
  MapPin,
  Play,
  Grid,
  ListFilter,
  Check,
  Trash2
} from "lucide-react";
import { ChapterItem, MemoryItem } from "../types";
import { buildMonthlyJourney, MonthTimelineBucket, MONTH_NAMES, deleteMemory } from "../lib/memoriesService";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface StoryVerticalTimelineProps {
  chapters: ChapterItem[];
  memories: MemoryItem[];
  onOpenAddModal?: (datePreset?: string, chapterId?: string) => void;
}

interface TimelineMilestone {
  dayNumber: number;
  label: string;
  dateStr: string;
  season: string;
  description: string;
  monthKey: string; // matches YYYY-MM
  positionChapterOrder: number;
  isStitchSpecial?: boolean;
}

const MILESTONES: TimelineMilestone[] = [
  {
    dayNumber: 1,
    label: "Day 1 • The First Spark",
    dateStr: "Nov 2, 2024",
    season: "Autumn 2024",
    monthKey: "2024-11",
    description: "The coffee that turned into hours of endless talking. Under a crisp autumn blue sky, where our universe began.",
    positionChapterOrder: 1
  },
  {
    dayNumber: 100,
    label: "Day 100 • Finding Our Rhythm",
    dateStr: "Feb 10, 2025",
    season: "Winter 2025",
    monthKey: "2025-02",
    description: "Wrapped in heavy wool sweaters, inside jokes only we get, and realizing this is home.",
    positionChapterOrder: 2
  },
  {
    dayNumber: 260,
    label: "Day 260 • Stitch & Our Ohana Vow",
    dateStr: "July 20, 2025",
    season: "Summer 2025",
    monthKey: "2025-07",
    description: "Watching Lilo & Stitch under blue fleece blankets. The moment we promised: 'Nobody gets left behind or forgotten.'",
    positionChapterOrder: 3,
    isStitchSpecial: true
  },
  {
    dayNumber: 365,
    label: "Day 365 • One Full Year",
    dateStr: "Nov 2, 2025",
    season: "Autumn 2025",
    monthKey: "2025-11",
    description: "365 days of unconditional warmth, sealed letters, and our first official anniversary milestone.",
    positionChapterOrder: 5
  },
  {
    dayNumber: 500,
    label: "Day 500 • Half a Thousand Days",
    dateStr: "March 17, 2026",
    season: "Spring 2026",
    monthKey: "2026-03",
    description: "Over five hundred sunrises waking up knowing you are in my corner, through every shade of life.",
    positionChapterOrder: 5
  },
  {
    dayNumber: 730,
    label: "Day 730 • Two Years of Us",
    dateStr: "Nov 2, 2026",
    season: "Autumn 2026",
    monthKey: "2026-11",
    description: "730 days of shared laughter, growth, and the greatest love of our lives.",
    positionChapterOrder: 6
  }
];

export default function StoryVerticalTimeline({ 
  chapters, 
  memories,
  onOpenAddModal 
}: StoryVerticalTimelineProps) {
  const [timelineMode, setTimelineMode] = useState<"monthly" | "chapters" | "scrapbook">("monthly");
  const [selectedYearFilter, setSelectedYearFilter] = useState<"all" | "2024" | "2025" | "2026">("all");
  const [activeMonthFilter, setActiveMonthFilter] = useState<string | null>(null);
  const [memoryToDelete, setMemoryToDelete] = useState<MemoryItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteMemory = async () => {
    if (!memoryToDelete) return;
    setIsDeleting(true);
    try {
      await deleteMemory(memoryToDelete.id);
      setMemoryToDelete(null);
    } catch (err) {
      console.error("Error deleting memory from timeline:", err);
    } finally {
      setIsDeleting(false);
    }
  };

  // Build the monthly timeline structure
  const monthlyBuckets = useMemo(() => {
    return buildMonthlyJourney(memories, 2024, 2026);
  }, [memories]);

  // Statistics for monthly progress (user goal: 1 memory per month since 2024)
  const monthlyStats = useMemo(() => {
    const totalMonths = monthlyBuckets.length;
    const monthsWithMemories = monthlyBuckets.filter(b => b.hasMemory).length;
    const percentage = totalMonths > 0 ? Math.round((monthsWithMemories / totalMonths) * 100) : 0;
    const totalMemoryCount = memories.length;

    return {
      totalMonths,
      monthsWithMemories,
      percentage,
      totalMemoryCount,
      missingMonthsCount: totalMonths - monthsWithMemories
    };
  }, [monthlyBuckets, memories]);

  // Filtered monthly buckets based on user year selection
  const filteredMonthlyBuckets = useMemo(() => {
    return monthlyBuckets.filter(b => {
      if (selectedYearFilter !== "all" && String(b.year) !== selectedYearFilter) {
        return false;
      }
      if (activeMonthFilter && b.key !== activeMonthFilter) {
        return false;
      }
      return true;
    });
  }, [monthlyBuckets, selectedYearFilter, activeMonthFilter]);

  // Filtered chapters
  const filteredChapters = useMemo(() => {
    if (selectedYearFilter === "2024") {
      return chapters.filter(c => c.order <= 2);
    }
    if (selectedYearFilter === "2025") {
      return chapters.filter(c => c.order >= 2 && c.order <= 5);
    }
    if (selectedYearFilter === "2026") {
      return chapters.filter(c => c.order >= 5);
    }
    return chapters;
  }, [chapters, selectedYearFilter]);

  // Time metrics
  const timeMetrics = useMemo(() => {
    const startDate = new Date("2024-11-02T00:00:00");
    const totalDays = 730;
    const today = new Date();
    const elapsedMs = today.getTime() - startDate.getTime();
    const elapsedDays = Math.max(0, Math.min(totalDays, Math.floor(elapsedMs / (1000 * 60 * 60 * 24))));
    const progressPercent = Math.min(100, Math.round((elapsedDays / totalDays) * 100));

    return {
      totalDays,
      elapsedDays,
      progressPercent
    };
  }, []);

  return (
    <div className="w-full relative">
      {/* 1. TOP HERO CARD: Monthly Goal & Passage of Time in Shades of Blue */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-8 p-6 sm:p-8 rounded-3xl bg-white border border-sky-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] relative overflow-hidden"
      >
        <div className="absolute -top-10 -right-10 w-52 h-52 bg-sky-100/50 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-[11px] font-semibold tracking-widest uppercase mb-3">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              Monthly Chronicle • 2024 to 2026
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-slate-900 mb-1.5 font-medium">
              Every Month Along Our Journey
            </h2>
            <p className="text-sky-800/70 text-sm font-sans max-w-xl">
              Chronicling at least one memory per month with her since 2024. Every upload immediately marks the month complete and weaves into this live vertical timeline.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 shrink-0">
            <div className="text-center p-3 sm:p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100">
              <span className="block font-serif text-2xl sm:text-3xl text-sky-950 font-semibold">
                {monthlyStats.monthsWithMemories}
                <span className="text-sm font-sans font-normal text-sky-600">/{monthlyStats.totalMonths}</span>
              </span>
              <span className="text-[10px] font-sans tracking-widest uppercase text-sky-700">Months Documented</span>
            </div>
            <div className="text-center p-3 sm:p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100">
              <span className="block font-serif text-2xl sm:text-3xl text-blue-700 font-semibold">
                {monthlyStats.totalMemoryCount}
              </span>
              <span className="text-[10px] font-sans tracking-widest uppercase text-sky-700">Moments with Her</span>
            </div>
            <div className="text-center p-3 sm:p-3.5 rounded-2xl bg-sky-50/70 border border-sky-100">
              <span className="block font-serif text-2xl sm:text-3xl text-indigo-700 font-semibold">
                {monthlyStats.percentage}%
              </span>
              <span className="text-[10px] font-sans tracking-widest uppercase text-sky-700">Monthly Goal</span>
            </div>
          </div>
        </div>

        {/* Monthly Progress Bar */}
        <div className="mt-6 pt-5 border-t border-sky-100">
          <div className="flex items-center justify-between text-xs font-sans mb-2">
            <span className="text-slate-700 font-medium flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-sky-600" />
              {monthlyStats.monthsWithMemories} of {monthlyStats.totalMonths} months chronicled
            </span>
            <span className="font-semibold text-blue-700 font-mono">
              {monthlyStats.percentage}% of all months since 2024
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-sky-100 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${monthlyStats.percentage}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-sky-400 via-blue-600 to-indigo-700 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* 2. MONTH TRACKER & QUICK MONTH NAVIGATION RIBBON */}
      <div className="mb-10 p-5 rounded-3xl bg-white border border-sky-100 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-sky-950">
            <Calendar className="w-4 h-4 text-sky-500" />
            <span>Month-by-Month Chronicle Tracker</span>
            {activeMonthFilter && (
              <button
                onClick={() => setActiveMonthFilter(null)}
                className="text-[10px] lowercase text-sky-600 underline font-normal ml-2"
              >
                (show all months)
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Direct Add Memory Button */}
            {onOpenAddModal && (
              <button
                onClick={() => onOpenAddModal()}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-sans tracking-wide uppercase font-medium transition-all shadow-xs"
              >
                <Plus className="w-3.5 h-3.5 text-sky-300" />
                <span>+ Add Memory with Her</span>
              </button>
            )}
          </div>
        </div>

        {/* Month Pills Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-12 gap-2">
          {monthlyBuckets.map((bucket) => {
            const hasMem = bucket.hasMemory;
            const isFilterActive = activeMonthFilter === bucket.key;

            return (
              <button
                key={bucket.key}
                onClick={() => {
                  setActiveMonthFilter(isFilterActive ? null : bucket.key);
                }}
                className={`p-2 rounded-xl text-center flex flex-col items-center justify-center transition-all relative ${
                  isFilterActive
                    ? "bg-slate-900 text-white shadow-md ring-2 ring-sky-400"
                    : hasMem
                    ? "bg-sky-50 hover:bg-sky-100/80 border border-sky-200 text-sky-950"
                    : "bg-white hover:bg-slate-50 border border-dashed border-sky-200 text-slate-600 opacity-80 hover:opacity-100"
                }`}
                title={
                  hasMem
                    ? `${bucket.label}: ${bucket.memories.length} memory recorded`
                    : `${bucket.label}: No memory recorded yet`
                }
              >
                <span className="text-[10px] font-sans uppercase tracking-wider font-semibold">
                  {bucket.monthName.substring(0, 3)}
                </span>
                <span className="text-[9px] font-mono opacity-80">
                  {bucket.year}
                </span>

                {hasMem ? (
                  <div className="mt-1 flex items-center gap-0.5 text-[9px] font-semibold text-sky-700 bg-white/90 px-1.5 py-0.2 rounded-full shadow-2xs">
                    <Check className="w-2.5 h-2.5 text-sky-600" />
                    <span>{bucket.memories.length}</span>
                  </div>
                ) : (
                  <span className="mt-1 text-[8px] text-sky-600 font-sans">
                    + add
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. VIEW MODE & YEAR FILTER BUTTONS */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-10">
        {/* View Style Switcher */}
        <div className="flex items-center gap-1 bg-sky-100/70 p-1 rounded-full text-xs font-medium">
          <button
            onClick={() => setTimelineMode("monthly")}
            className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
              timelineMode === "monthly"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-sky-800 hover:text-blue-950"
            }`}
          >
            <ListFilter className="w-3.5 h-3.5 text-sky-600" />
            <span>Monthly Stream ({monthlyBuckets.length} Mos)</span>
          </button>

          <button
            onClick={() => setTimelineMode("chapters")}
            className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
              timelineMode === "chapters"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-sky-800 hover:text-blue-950"
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-sky-600" />
            <span>6 Story Chapters</span>
          </button>

          <button
            onClick={() => setTimelineMode("scrapbook")}
            className={`px-3.5 py-1.5 rounded-full flex items-center gap-1.5 transition-all ${
              timelineMode === "scrapbook"
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-sky-800 hover:text-blue-950"
            }`}
          >
            <Grid className="w-3.5 h-3.5 text-sky-600" />
            <span>All Moments ({memories.length})</span>
          </button>
        </div>

        {/* Year Filter Pills */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-sky-800/60 uppercase tracking-wider font-semibold mr-1">Year:</span>
          {(["all", "2024", "2025", "2026"] as const).map(y => (
            <button
              key={y}
              onClick={() => {
                setSelectedYearFilter(y);
                setActiveMonthFilter(null);
              }}
              className={`px-3 py-1 rounded-full text-xs font-sans tracking-wide transition-all ${
                selectedYearFilter === y
                  ? "bg-slate-900 text-white font-medium shadow-xs"
                  : "bg-white text-sky-800 border border-sky-150 hover:bg-sky-50"
              }`}
            >
              {y === "all" ? "All (2024-2026)" : y}
            </button>
          ))}
        </div>
      </div>

      {/* 4. MAIN TIMELINE CONTENT RENDERING */}

      {/* MODE A: MONTHLY STREAM (Default - Directly reflects memories for every month since 2024) */}
      {timelineMode === "monthly" && (
        <div className="relative before:absolute before:inset-0 before:left-6 sm:before:left-1/2 before:-translate-x-1/2 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-sky-300 before:via-blue-400 before:to-indigo-600">
          
          {/* Start Anchor */}
          <div className="relative flex items-center justify-start sm:justify-center mb-12 pl-1.5 sm:pl-0">
            <div className="z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 text-white text-[11px] font-sans tracking-widest uppercase shadow-md">
              <Sparkles className="w-3 h-3 text-sky-300" />
              <span>January 2024 • Beginning of Our Time</span>
            </div>
          </div>

          <div className="space-y-12 sm:space-y-16">
            {filteredMonthlyBuckets.map((bucket, index) => {
              const hasMemories = bucket.memories.length > 0;
              const isEven = index % 2 === 1;
              const milestone = MILESTONES.find(m => m.monthKey === bucket.key);

              return (
                <div key={bucket.key} className="relative">
                  {/* Milestone Marker if special month */}
                  {milestone && (
                    <div className="relative mb-6 pl-14 sm:pl-0 flex items-center sm:justify-center">
                      <div className={`z-20 border backdrop-blur-xs rounded-2xl px-4 py-2.5 max-w-sm text-left sm:text-center shadow-xs ${
                        milestone.isStitchSpecial
                          ? "bg-gradient-to-r from-sky-50 via-blue-50 to-indigo-50 border-sky-200"
                          : "bg-sky-50/90 border-sky-100"
                      }`}>
                        <div className="flex items-center sm:justify-center gap-2 text-sky-950 text-[11px] font-semibold tracking-wider uppercase mb-1">
                          <Heart className="w-3.5 h-3.5 text-sky-600 fill-sky-300" />
                          <span>{milestone.label}</span>
                        </div>
                        <p className="font-serif italic text-xs text-slate-700 leading-relaxed">
                          "{milestone.description}"
                        </p>
                      </div>
                    </div>
                  )}

                  <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-60px" }}
                    transition={{ duration: 0.6 }}
                    className={`relative flex flex-col sm:flex-row items-start sm:items-center ${
                      isEven ? "sm:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Node Marker */}
                    <div className={`absolute left-6 sm:left-1/2 -translate-x-1/2 top-4 sm:top-1/2 sm:-translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#F3F8FC] shadow-md transition-transform ${
                      hasMemories
                        ? "bg-sky-600 text-white"
                        : "bg-white text-slate-400 border-dashed"
                    }`}>
                      {hasMemories ? (
                        <Heart className="w-4 h-4 fill-white" />
                      ) : (
                        <Calendar className="w-4 h-4 text-sky-400" />
                      )}
                    </div>

                    {/* Month Container Card */}
                    <div className={`w-full pl-14 sm:pl-0 sm:w-[calc(50%-2.5rem)] ${
                      isEven ? "sm:pr-0" : "sm:pl-0"
                    }`}>
                      <div className={`rounded-3xl p-5 sm:p-6 transition-all duration-300 ${
                        hasMemories
                          ? "bg-white border border-sky-100 shadow-[0_8px_30px_rgb(0,0,0,0.03)] hover:border-sky-300"
                          : "bg-white/70 border border-dashed border-sky-200"
                      }`}>
                        {/* Month Header Banner */}
                        <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-sky-50">
                          <div>
                            <span className="text-[10px] font-semibold tracking-widest uppercase text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-100">
                              {bucket.label}
                            </span>
                            <span className="text-xs text-sky-800/60 font-sans ml-2">
                              {bucket.season}
                            </span>
                          </div>

                          <Link
                            to={`/story/${bucket.chapterId}`}
                            className="text-[11px] text-sky-700 hover:text-blue-900 font-medium"
                          >
                            Chapter {bucket.chapterOrder}
                          </Link>
                        </div>

                        {/* If Month HAS Memories */}
                        {hasMemories ? (
                          <div className="space-y-4">
                            {bucket.memories.map((mem) => {
                              const firstMedia = mem.media && mem.media[0];
                              const isVideo = firstMedia?.type === "video";

                              return (
                                <Link
                                  key={mem.id}
                                  to={`/memory/${mem.id}`}
                                  className="group block p-3 rounded-2xl bg-sky-50/40 hover:bg-sky-50 border border-sky-100/80 hover:border-sky-200 transition-all"
                                >
                                  {firstMedia && (
                                    <div className="relative w-full h-36 rounded-xl overflow-hidden mb-3 bg-sky-100/50">
                                      {isVideo ? (
                                        <div className="relative w-full h-full bg-slate-900 flex items-center justify-center">
                                          <video
                                            src={firstMedia.storage_path}
                                            className="w-full h-full object-cover opacity-80"
                                            muted
                                            preload="metadata"
                                          />
                                          <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-10 h-10 rounded-full bg-white/90 text-sky-900 flex items-center justify-center shadow-lg">
                                              <Play className="w-4 h-4 fill-sky-900 ml-0.5" />
                                            </div>
                                          </div>
                                        </div>
                                      ) : (
                                        <img
                                          src={firstMedia.storage_path}
                                          alt={mem.title}
                                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                      )}
                                      <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-xs text-white text-[10px] px-2 py-0.5 rounded-full font-mono">
                                        {mem.date}
                                      </div>
                                    </div>
                                  )}

                                  <div className="flex items-center justify-between text-xs text-sky-800/70 mb-1">
                                    <h4 className="font-serif text-base sm:text-lg text-slate-900 font-medium group-hover:text-blue-900 transition-colors line-clamp-1 pr-2">
                                      {mem.title}
                                    </h4>
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setMemoryToDelete(mem);
                                      }}
                                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                                      title="Delete memory"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>

                                  {mem.location && (
                                    <div className="flex items-center gap-1 text-[11px] text-sky-700/80 mb-1.5 font-sans">
                                      <MapPin className="w-3 h-3 text-sky-500" />
                                      <span>{mem.location}</span>
                                    </div>
                                  )}

                                  {mem.description && (
                                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-sans mb-2">
                                      {mem.description}
                                    </p>
                                  )}

                                  {mem.song && (
                                    <div className="inline-flex items-center gap-1.5 text-[10px] text-sky-800 font-sans bg-white px-2 py-0.5 rounded-md border border-sky-100">
                                      <Music className="w-3 h-3 text-sky-500" />
                                      <span>{mem.song.title} — {mem.song.artist}</span>
                                    </div>
                                  )}
                                </Link>
                              );
                            })}

                            {/* Option to add another memory to this month */}
                            {onOpenAddModal && (
                              <button
                                onClick={() => onOpenAddModal(`${bucket.monthName} 15, ${bucket.year}`, bucket.chapterId)}
                                className="w-full py-2 text-center text-xs font-sans text-sky-700 hover:text-blue-950 font-medium flex items-center justify-center gap-1 hover:bg-sky-50 rounded-xl transition-colors"
                              >
                                <Plus className="w-3 h-3 text-sky-600" />
                                <span>+ Add another memory for {bucket.monthName}</span>
                              </button>
                            )}
                          </div>
                        ) : (
                          /* If Month has NO memories yet: Friendly Invitation */
                          <div className="text-center py-4 px-2">
                            <p className="text-xs font-sans text-slate-500 mb-3">
                              No memories logged for <strong className="text-slate-700">{bucket.label}</strong> yet.
                            </p>
                            {onOpenAddModal && (
                              <button
                                onClick={() => onOpenAddModal(`${bucket.monthName} 15, ${bucket.year}`, bucket.chapterId)}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 text-xs font-sans font-medium transition-all shadow-2xs"
                              >
                                <Plus className="w-3.5 h-3.5 text-sky-600" />
                                <span>Add memory for {bucket.monthName} {bucket.year}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Destination Milestone: Nov 2, 2026 */}
          <div className="relative flex items-center justify-start sm:justify-center mt-16 pl-1.5 sm:pl-0">
            <div className="z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 text-white text-xs font-sans tracking-widest uppercase shadow-lg">
              <Heart className="w-3.5 h-3.5 fill-white animate-pulse" />
              <span>Nov 2, 2026 • Two Years Complete</span>
            </div>
          </div>
        </div>
      )}

      {/* MODE B: CHAPTERS & MILESTONES VIEW */}
      {timelineMode === "chapters" && (
        <div className="relative before:absolute before:inset-0 before:left-6 sm:before:left-1/2 before:-translate-x-1/2 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-sky-300 before:via-blue-400 before:to-indigo-600">
          
          <div className="space-y-16">
            {filteredChapters.map((chapter, index) => {
              const isEven = index % 2 === 1;
              const chapterMems = memories.filter(m => m.chapter_id === chapter.id);

              return (
                <div key={chapter.id} className="relative">
                  <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className={`relative flex flex-col sm:flex-row items-start sm:items-center ${
                      isEven ? "sm:flex-row-reverse" : ""
                    }`}
                  >
                    {/* Node Badge */}
                    <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 top-4 sm:top-1/2 sm:-translate-y-1/2 z-20 flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#F3F8FC] bg-white text-sky-600 shadow-md">
                      <span className="font-serif font-bold text-xs text-slate-800">
                        {chapter.order}
                      </span>
                    </div>

                    {/* Chapter Card */}
                    <div className={`w-full pl-14 sm:pl-0 sm:w-[calc(50%-2.5rem)] ${
                      isEven ? "sm:pr-0" : "sm:pl-0"
                    }`}>
                      <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-sky-100 hover:border-sky-300 transition-all">
                        {chapter.cover_image && (
                          <div className="relative w-full h-40 rounded-2xl overflow-hidden mb-4 bg-sky-50">
                            <img
                              src={chapter.cover_image}
                              alt={chapter.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute bottom-2.5 left-3 text-white text-[11px] font-sans tracking-widest uppercase flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {chapter.date}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-semibold tracking-widest uppercase text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full">
                            Chapter {chapter.order}
                          </span>
                          <span className="text-xs text-sky-800/60 font-sans">
                            {chapterMems.length} {chapterMems.length === 1 ? "memory" : "memories"}
                          </span>
                        </div>

                        <h3 className="font-serif text-xl sm:text-2xl text-slate-900 mb-2">
                          {chapter.title}
                        </h3>

                        <p className="text-slate-600 text-sm leading-relaxed mb-4">
                          {chapter.description}
                        </p>

                        {/* Thumbnail Strip of Chapter Memories */}
                        {chapterMems.length > 0 && (
                          <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
                            {chapterMems.slice(0, 4).map((m) => {
                              const pic = m.media && m.media[0];
                              return (
                                <Link
                                  key={m.id}
                                  to={`/memory/${m.id}`}
                                  className="w-14 h-14 rounded-xl overflow-hidden shrink-0 border border-sky-200 bg-sky-50 group"
                                  title={m.title}
                                >
                                  {pic ? (
                                    <img
                                      src={pic.storage_path}
                                      alt={m.title}
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-sky-600 text-[10px]">
                                      Story
                                    </div>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        )}

                        <div className="pt-3 border-t border-sky-50 flex items-center justify-between text-xs font-semibold tracking-wider uppercase text-slate-900">
                          <Link
                            to={`/story/${chapter.id}`}
                            className="inline-flex items-center text-sky-700 hover:text-blue-950"
                          >
                            <span>Open Chapter Details</span>
                            <ChevronRight className="w-3.5 h-3.5 ml-1" />
                          </Link>

                          {onOpenAddModal && (
                            <button
                              onClick={() => onOpenAddModal(chapter.date, chapter.id)}
                              className="inline-flex items-center gap-1 text-sky-800 hover:text-blue-900 lowercase font-normal"
                            >
                              <Plus className="w-3 h-3 text-sky-600" />
                              <span>add to this chapter</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MODE C: ALL MOMENTS SCRAPBOOK GRID */}
      {timelineMode === "scrapbook" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {memories.map((mem) => {
            const firstPic = mem.media && mem.media[0];
            const isVideo = firstPic?.type === "video";

            return (
              <Link
                key={mem.id}
                to={`/memory/${mem.id}`}
                className="group block bg-white rounded-3xl p-4 shadow-[0_8px_30px_rgb(0,0,0,0.03)] border border-sky-100 hover:border-sky-300 transition-all"
              >
                <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-3 bg-sky-50">
                  {firstPic ? (
                    isVideo ? (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                        <video
                          src={firstPic.storage_path}
                          className="w-full h-full object-cover opacity-80"
                        />
                        <Play className="w-8 h-8 text-white absolute" />
                      </div>
                    ) : (
                      <img
                        src={firstPic.storage_path}
                        alt={mem.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-sky-600">
                      <Heart className="w-8 h-8 mb-2 fill-sky-200 text-sky-400" />
                      <span className="text-xs font-serif italic">A Special Moment</span>
                    </div>
                  )}

                  <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[10px] px-2.5 py-0.5 rounded-full font-mono">
                    {mem.date}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-serif text-lg text-slate-900 group-hover:text-blue-950 font-medium line-clamp-1">
                    {mem.title}
                  </h4>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMemoryToDelete(mem);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors shrink-0"
                    title="Delete memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {mem.location && (
                  <div className="flex items-center gap-1 text-xs text-sky-800/70 font-sans mb-1.5">
                    <MapPin className="w-3 h-3 text-sky-500" />
                    <span>{mem.location}</span>
                  </div>
                )}

                <p className="text-slate-600 text-xs line-clamp-2 leading-relaxed font-sans">
                  {mem.description}
                </p>
              </Link>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(memoryToDelete)}
        onClose={() => setMemoryToDelete(null)}
        onConfirm={handleDeleteMemory}
        title="Delete Memory?"
        itemTitle={memoryToDelete?.title}
        isDeleting={isDeleting}
      />
    </div>
  );
}
