import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, ChevronLeft, ChevronRight, MapPin, Calendar, Camera, Video } from "lucide-react";
import { MediaItem } from "../types";

interface PhotoLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  media: MediaItem[];
  currentIndex: number;
  onNavigate: (index: number) => void;
  eventTitle?: string;
  eventLocation?: string;
}

export default function PhotoLightbox({
  isOpen,
  onClose,
  media,
  currentIndex,
  onNavigate,
  eventTitle,
  eventLocation,
}: PhotoLightboxProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && currentIndex > 0) onNavigate(currentIndex - 1);
      if (e.key === "ArrowRight" && currentIndex < media.length - 1) onNavigate(currentIndex + 1);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, currentIndex, media.length, onClose, onNavigate]);

  if (!isOpen || media.length === 0) return null;

  const currentItem = media[currentIndex] || media[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-4 md:p-8 select-none"
        onClick={onClose}
      >
        {/* Top bar */}
        <div 
          className="flex items-center justify-between text-white/80 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col">
            <h4 className="font-serif text-lg text-white font-medium">
              {eventTitle || "Memory Photo"}
            </h4>
            <div className="flex items-center gap-3 text-xs text-white/60 tracking-wider">
              {currentItem.date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {currentItem.date}
                </span>
              )}
              {eventLocation && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {eventLocation}
                </span>
              )}
              {currentItem.film_type && (
                <span className="flex items-center gap-1 text-rose-300">
                  {currentItem.type === "video" ? (
                    <Video className="w-3 h-3" />
                  ) : (
                    <Camera className="w-3 h-3" />
                  )}
                  {currentItem.film_type}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-xs font-mono tracking-widest text-white/70 bg-white/10 px-3 py-1.5 rounded-full">
              {currentIndex + 1} / {media.length}
            </span>
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Close lightbox"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Center image or video with swipe/drag */}
        <div 
          className="relative flex-1 flex items-center justify-center my-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {media.length > 1 && currentIndex > 0 && (
            <button
              onClick={() => onNavigate(currentIndex - 1)}
              className="absolute left-2 md:left-6 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all backdrop-blur-sm shadow-lg hover:scale-110 active:scale-95"
              aria-label="Previous photo"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            drag={currentItem.type === "video" ? false : "x"}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.4}
            onDragEnd={(_, info) => {
              if (info.offset.x > 50 && currentIndex > 0) {
                onNavigate(currentIndex - 1);
              } else if (info.offset.x < -50 && currentIndex < media.length - 1) {
                onNavigate(currentIndex + 1);
              }
            }}
            className="max-h-[75vh] max-w-full flex items-center justify-center p-2"
          >
            {currentItem.type === "video" ? (
              <video
                src={currentItem.storage_path}
                controls
                autoPlay
                playsInline
                className="max-h-[72vh] max-w-full rounded-lg shadow-2xl bg-black"
              />
            ) : (
              <img
                src={currentItem.storage_path}
                alt={currentItem.caption || "Memory photo"}
                className="max-h-[72vh] max-w-full object-contain rounded-lg shadow-2xl pointer-events-none cursor-grab active:cursor-grabbing"
              />
            )}
          </motion.div>

          {media.length > 1 && currentIndex < media.length - 1 && (
            <button
              onClick={() => onNavigate(currentIndex + 1)}
              className="absolute right-2 md:right-6 z-20 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all backdrop-blur-sm shadow-lg hover:scale-110 active:scale-95"
              aria-label="Next photo"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Bottom caption & thumbnail strip */}
        <div 
          className="flex flex-col items-center gap-3 z-10 max-w-2xl mx-auto w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {currentItem.caption && (
            <p className="font-serif italic text-white/90 text-sm md:text-base text-center px-4 max-w-xl">
              "{currentItem.caption}"
            </p>
          )}

          {media.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto py-1 px-2 max-w-full no-scrollbar">
              {media.map((item, idx) => (
                <button
                  key={item.id || idx}
                  onClick={() => onNavigate(idx)}
                  className={`relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden shrink-0 transition-all border-2 ${
                    idx === currentIndex
                      ? "border-rose-400 scale-105 shadow-md ring-2 ring-rose-400/40"
                      : "border-transparent opacity-50 hover:opacity-100"
                  }`}
                >
                  <img
                    src={item.storage_path}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
