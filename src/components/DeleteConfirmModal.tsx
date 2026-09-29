import { motion, AnimatePresence } from "motion/react";
import { Trash2, AlertTriangle, X } from "lucide-react";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  itemTitle?: string;
  isDeleting?: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Memory?",
  itemTitle,
  isDeleting = false
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isDeleting) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 12 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-sky-100 relative overflow-hidden"
        >
          {/* Top Decorative Stitch Blue Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-400 via-rose-400 to-indigo-500" />

          {/* Close Button */}
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-40"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4 mb-5 pt-1">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="pr-6">
              <span className="text-[10px] font-sans font-bold tracking-widest uppercase text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full inline-block mb-1.5">
                Remove from Story
              </span>
              <h3 className="font-serif text-2xl text-slate-900 leading-tight">
                {title}
              </h3>
            </div>
          </div>

          {itemTitle && (
            <div className="mb-4 p-3.5 rounded-2xl bg-sky-50/60 border border-sky-100 text-slate-800">
              <p className="text-xs text-sky-900/60 uppercase font-mono tracking-wider mb-1">
                Selected Memory
              </p>
              <p className="font-serif font-semibold text-base text-slate-900 line-clamp-2">
                "{itemTitle}"
              </p>
            </div>
          )}

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
            Are you sure you want to delete this memory? It will be removed from your timeline, chapter scrapbook, and photo gallery.
          </p>

          {/* Stitch Gentle Note */}
          <div className="mb-6 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-2.5 text-slate-600 text-xs">
            <div className="text-lg shrink-0">🌺</div>
            <p className="italic font-serif leading-snug">
              "Family means nobody gets forgotten." You can always add a new memory whenever you wish.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-5 py-2.5 rounded-full text-xs font-semibold tracking-wider uppercase text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              Keep Memory
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold tracking-widest uppercase transition-all shadow-md shadow-rose-500/20 disabled:opacity-50 flex items-center gap-2"
            >
              {isDeleting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Memory</span>
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
