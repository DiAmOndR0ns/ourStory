import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Maximize2, Camera, Calendar, Sparkles, Video, Play } from "lucide-react";
import { MediaItem } from "../types";
import PhotoLightbox from "./PhotoLightbox";

interface SwipeableGalleryProps {
  media: MediaItem[];
  eventTitle?: string;
  eventLocation?: string;
  className?: string;
  polaroidStyle?: boolean;
}

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 280 : -280,
    opacity: 0,
    scale: 0.95,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      x: { type: "spring", stiffness: 350, damping: 30 },
      opacity: { duration: 0.25 },
      scale: { duration: 0.25 }
    }
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 280 : -280,
    opacity: 0,
    scale: 0.95,
    transition: {
      x: { type: "spring", stiffness: 350, damping: 30 },
      opacity: { duration: 0.2 }
    }
  })
};

export default function SwipeableGallery({
  media,
  eventTitle,
  eventLocation,
  className = "",
  polaroidStyle = true
}: SwipeableGalleryProps) {
  const [[page, direction], setPage] = useState<[number, number]>([0, 0]);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const total = media.length;
  // Wrap index safely
  const activeIndex = total > 0 ? ((page % total) + total) % total : 0;

  const paginate = useCallback((newDirection: number) => {
    if (total <= 1) return;
    setPage(([prevPage]) => [prevPage + newDirection, newDirection]);
  }, [total]);

  const jumpTo = useCallback((index: number) => {
    if (index === activeIndex || total <= 1) return;
    const diff = index - activeIndex;
    setPage(([prevPage]) => [prevPage + diff, diff > 0 ? 1 : -1]);
  }, [activeIndex, total]);

  if (total === 0) {
    return (
      <div className={`p-6 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 flex flex-col items-center justify-center text-gray-400 text-xs tracking-widest uppercase ${className}`}>
        <Camera className="w-5 h-5 mb-2 text-gray-300" />
        No photos attached to this event
      </div>
    );
  }

  const currentMedia = media[activeIndex];

  return (
    <div className={`relative flex flex-col items-center select-none ${className}`}>
      {/* Polaroid Container */}
      <div 
        className={`w-full relative transition-all duration-300 ${
          polaroidStyle 
            ? "bg-white p-3 pb-5 md:p-4 md:pb-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-stone-200/70 hover:shadow-[0_12px_40px_rgb(0,0,0,0.09)]" 
            : "bg-neutral-900 rounded-2xl overflow-hidden shadow-md"
        }`}
      >
        {/* Subtle washi tape decorative aesthetic */}
        {polaroidStyle && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-amber-100/70 border border-amber-200/50 backdrop-blur-xs rounded-sm shadow-xs -rotate-1 z-20 pointer-events-none" />
        )}

        {/* Top bar with count pill and expand */}
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-1.5 text-[11px] font-sans tracking-wider uppercase text-stone-500">
            {currentMedia?.type === "video" ? (
              <Video className="w-3.5 h-3.5 text-rose-500" />
            ) : (
              <Sparkles className="w-3 h-3 text-rose-400" />
            )}
            <span className="font-semibold text-stone-700">
              {currentMedia?.type === "video" 
                ? (total > 1 ? `Video ${activeIndex + 1} of ${total}` : "Video Memory") 
                : (total > 1 ? `Memory ${activeIndex + 1} of ${total}` : "Memory")}
            </span>
            {currentMedia?.film_type && (
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 text-[10px] tracking-normal font-normal">
                {currentMedia.film_type}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setLightboxOpen(true)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors"
              title="Expand photo/video"
              aria-label="View fullscreen media"
            >
              <Maximize2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Main Swipe Stage */}
        <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] overflow-hidden rounded-xl bg-stone-100 cursor-grab active:cursor-grabbing">
          <AnimatePresence initial={false} custom={direction}>
            <motion.div
              key={page}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.4}
              onDragEnd={(_, { offset, velocity }) => {
                const swipeThreshold = 45;
                if (offset.x > swipeThreshold || velocity.x > 300) {
                  paginate(-1);
                } else if (offset.x < -swipeThreshold || velocity.x < -300) {
                  paginate(1);
                }
              }}
              onClick={() => setLightboxOpen(true)}
              className="absolute inset-0 w-full h-full"
            >
              {currentMedia.type === "video" ? (
                <video
                  src={currentMedia.storage_path}
                  controls
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={currentMedia.storage_path}
                  alt={currentMedia.caption || "Event memory"}
                  className="w-full h-full object-cover pointer-events-none transition-transform duration-500 hover:scale-105"
                  loading="lazy"
                />
              )}

              {/* Subtle film grain overlay / vignette */}
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-60" />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows for multi-photo sets */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  paginate(-1);
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-700 shadow-md backdrop-blur-xs flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                aria-label="Previous memory photo"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  paginate(1);
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/80 hover:bg-white text-stone-700 shadow-md backdrop-blur-xs flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                aria-label="Next memory photo"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Swipe Hint pill on mobile */}
          {total > 1 && (
            <div className="absolute bottom-2.5 right-2.5 z-10 pointer-events-none px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-xs text-white/90 text-[10px] tracking-wide font-sans">
              Swipe ↔
            </div>
          )}
        </div>

        {/* Polaroid Handwritten Caption area */}
        <div className="mt-3.5 px-1">
          <div className="flex items-start justify-between gap-2">
            <p className="font-serif italic text-stone-700 text-sm md:text-base leading-snug">
              {currentMedia?.caption || "A moment frozen in time."}
            </p>
            {currentMedia?.date && (
              <span className="shrink-0 flex items-center gap-1 text-[10px] font-sans tracking-widest uppercase text-stone-400 pt-0.5">
                <Calendar className="w-2.5 h-2.5" />
                {currentMedia.date}
              </span>
            )}
          </div>
        </div>

        {/* Dots & Thumbnails for multi-memory events */}
        {total > 1 && (
          <div className="mt-3 pt-3 border-t border-stone-100 flex flex-col gap-2">
            {/* Dot indicators */}
            <div className="flex items-center justify-center gap-1.5 py-0.5">
              {media.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    jumpTo(idx);
                  }}
                  className={`transition-all duration-300 rounded-full ${
                    idx === activeIndex
                      ? "w-5 h-1.5 bg-rose-400"
                      : "w-1.5 h-1.5 bg-stone-300 hover:bg-stone-400"
                  }`}
                  aria-label={`Jump to photo ${idx + 1}`}
                />
              ))}
            </div>

            {/* Thumbnail mini strip if 3+ photos */}
            {total >= 3 && (
              <div className="flex items-center justify-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
                {media.map((item, idx) => (
                  <button
                    key={item.id || idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      jumpTo(idx);
                    }}
                    className={`relative w-9 h-9 rounded-md overflow-hidden shrink-0 border transition-all ${
                      idx === activeIndex
                        ? "border-rose-400 ring-2 ring-rose-400/30 scale-105"
                        : "border-stone-200 opacity-60 hover:opacity-100"
                    }`}
                  >
                    {item.type === "video" ? (
                      <div className="w-full h-full bg-stone-900 flex items-center justify-center text-white">
                        <Play className="w-3.5 h-3.5 fill-white" />
                      </div>
                    ) : (
                      <img
                        src={item.storage_path}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lightbox Component */}
      <PhotoLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        media={media}
        currentIndex={activeIndex}
        onNavigate={jumpTo}
        eventTitle={eventTitle}
        eventLocation={eventLocation}
      />
    </div>
  );
}
