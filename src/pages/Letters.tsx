import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lock, 
  MailOpen, 
  ArrowLeft, 
  Sparkles, 
  Heart, 
  Plus, 
  Edit3, 
  RotateCcw, 
  Feather,
  CheckCircle,
  Eye,
  KeyRound
} from "lucide-react";
import { LetterItem } from "../types";
import { 
  getAllLetters, 
  getLettersSync, 
  resetLettersToDefault, 
  LETTERS_UPDATED_EVENT 
} from "../lib/lettersService";
import WriteLetterModal from "../components/WriteLetterModal";

export default function Letters() {
  const [letters, setLetters] = useState<LetterItem[]>(getLettersSync());
  const [loading, setLoading] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<LetterItem | null>(null);

  // Modal State
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [letterBeingEdited, setLetterBeingEdited] = useState<LetterItem | null>(null);

  // Notification Banner
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const fetched = await getAllLetters();
        setLetters(fetched);
      } catch (err) {
        console.warn("Failed to load all letters:", err);
      } finally {
        setLoading(false);
      }
    }
    load();

    const handleUpdated = () => {
      const refreshed = getLettersSync();
      setLetters(refreshed);
      // Update selected letter if it was currently viewed
      setSelectedLetter((prev) => {
        if (!prev) return null;
        return refreshed.find((l) => l.id === prev.id) || null;
      });
    };

    window.addEventListener(LETTERS_UPDATED_EVENT, handleUpdated);
    return () => {
      window.removeEventListener(LETTERS_UPDATED_EVENT, handleUpdated);
    };
  }, []);

  const today = new Date();

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }

  function handleOpenWriteModal(letterToEdit?: LetterItem) {
    setLetterBeingEdited(letterToEdit || null);
    setIsWriteModalOpen(true);
  }

  function handleLetterSaved(saved: LetterItem) {
    showToast(`Letter "${saved.title}" saved successfully!`);
  }

  function handleLetterDeleted() {
    showToast("Letter deleted.");
    if (selectedLetter && selectedLetter.id === letterBeingEdited?.id) {
      setSelectedLetter(null);
    }
  }

  async function handleResetDefaults() {
    const confirmReset = window.confirm("Reset all letters back to original default letters?");
    if (!confirmReset) return;
    await resetLettersToDefault();
    showToast("Letters reset to original default.");
    setSelectedLetter(null);
  }

  return (
    <div className="min-h-screen bg-[#F3F8FC] text-slate-900 pb-32">
      {/* Top Header */}
      <header className="p-4 sm:p-6 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-sky-100">
        <Link 
          to="/story" 
          className="text-sky-800 hover:text-blue-950 transition-colors flex items-center text-xs tracking-widest uppercase font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Timeline
        </Link>

        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-widest uppercase text-sky-900">
          <Sparkles className="w-3.5 h-3.5 text-sky-500" />
          <span>Anniversary Letters</span>
        </div>

        <Link
          to="/little-things"
          className="text-xs text-sky-600 hover:text-sky-900 font-semibold uppercase tracking-wider"
        >
          Little Things &rarr;
        </Link>
      </header>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-full shadow-xl flex items-center gap-2 border border-slate-700 font-medium"
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-3xl mx-auto px-6 pt-10 pb-16">
        {/* Banner Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600 shadow-xs">
              <MailOpen className="w-6 h-6 text-sky-600" />
            </div>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl mb-2 text-slate-900">Sealed Letters</h1>
          <p className="text-xs sm:text-sm tracking-widest uppercase text-sky-800/60 font-mono mb-6">
            Words saved for the right moment • Our Ohana chronicle
          </p>

          {/* Action Row: Write Letter + Reset */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              onClick={() => handleOpenWriteModal()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 text-white font-semibold text-xs tracking-wide shadow-md shadow-sky-500/20 hover:shadow-lg hover:shadow-sky-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Feather className="w-4 h-4" />
              <span>Write a Letter (In Your Own Words)</span>
            </button>

            <button
              onClick={handleResetDefaults}
              title="Reset to default letters"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full border border-sky-200/80 bg-white text-sky-700 hover:bg-sky-50 text-[11px] font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5 text-sky-500" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </motion.div>

        {selectedLetter ? (
          /* Opened Letter Reading Experience */
          <motion.div 
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-sky-100 relative overflow-hidden"
          >
            {/* Top decorative blue ribbon bar */}
            <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-600" />

            <div className="flex items-center justify-between mb-8 pb-4 border-b border-sky-50">
              <button 
                onClick={() => setSelectedLetter(null)}
                className="text-xs tracking-widest uppercase font-semibold text-sky-700 hover:text-sky-950 transition-colors flex items-center gap-1"
              >
                &larr; Back to Letters
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenWriteModal(selectedLetter)}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200/60 flex items-center gap-1.5 transition"
                >
                  <Edit3 className="w-3.5 h-3.5 text-sky-600" />
                  <span>Edit in My Own Words</span>
                </button>

                <span className="text-[10px] font-mono tracking-wider uppercase bg-sky-100 text-sky-800 px-3 py-1 rounded-full font-semibold">
                  {selectedLetter.theme_tag || "Ohana"}
                </span>
              </div>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl mb-8 text-center text-slate-900 leading-snug">
              {selectedLetter.title}
            </h2>

            <div className="font-serif text-base sm:text-lg leading-loose text-slate-700 whitespace-pre-wrap max-w-2xl mx-auto px-2 sm:px-6">
              {selectedLetter.content}
            </div>

            <div className="mt-14 pt-6 border-t border-sky-50 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono uppercase tracking-widest text-sky-600">
              <div>
                Unlocked for you • {selectedLetter.unlock_date}
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleOpenWriteModal(selectedLetter)}
                  className="text-sky-700 hover:text-sky-900 font-sans font-semibold normal-case text-xs underline"
                >
                  Edit this letter
                </button>
                <button
                  onClick={() => setSelectedLetter(null)}
                  className="text-slate-400 hover:text-slate-600 font-sans normal-case text-xs"
                >
                  Close Letter
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          /* Cards Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading && letters.length === 0 ? (
              <div className="animate-pulse col-span-full space-y-4">
                <div className="h-32 bg-sky-100/50 rounded-2xl w-full"></div>
                <div className="h-32 bg-sky-100/50 rounded-2xl w-full"></div>
              </div>
            ) : letters.map((letter, index) => {
              const unlockDate = new Date(letter.unlock_date);
              const isLocked = !isNaN(unlockDate.getTime()) && today < unlockDate;

              return (
                <motion.div
                  key={letter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className={`relative overflow-hidden rounded-3xl p-7 border transition-all duration-300 flex flex-col justify-between ${
                    isLocked 
                      ? 'bg-slate-50/80 border-slate-200/80' 
                      : 'bg-white border-sky-100 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/10 group'
                  }`}
                >
                  <div>
                    {/* Top Row */}
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-3 rounded-2xl ${
                        isLocked ? "bg-slate-100 text-slate-400" : "bg-sky-50 text-sky-600 group-hover:bg-sky-100 transition-colors"
                      }`}>
                        {isLocked ? <Lock className="w-5 h-5" /> : <MailOpen className="w-5 h-5" />}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full font-semibold ${
                          isLocked ? "bg-slate-100 text-slate-400" : "bg-sky-100 text-sky-800"
                        }`}>
                          {isLocked ? `Unlocks ${letter.unlock_date}` : 'Open to Read'}
                        </span>

                        {/* Edit Button directly on card */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenWriteModal(letter);
                          }}
                          title="Edit this letter in your own words"
                          className="p-1.5 rounded-full text-slate-400 hover:text-sky-700 hover:bg-sky-100 transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <h3 
                      onClick={() => {
                        if (!isLocked) setSelectedLetter(letter);
                      }}
                      className={`font-serif text-lg sm:text-xl mb-2 cursor-pointer ${
                        isLocked 
                          ? 'text-slate-500 hover:text-slate-700' 
                          : 'text-slate-900 group-hover:text-sky-900'
                      }`}
                    >
                      {letter.title}
                    </h3>

                    {letter.theme_tag && (
                      <div className="mt-2 flex items-center gap-1 text-[11px] text-sky-600/80 font-sans">
                        <Heart className="w-3 h-3 text-sky-400 fill-sky-200" />
                        <span>{letter.theme_tag}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                    {isLocked ? (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[11px] text-slate-400 italic">
                          Sealed until {letter.unlock_date}
                        </span>
                        <button
                          onClick={() => handleOpenWriteModal(letter)}
                          className="text-[11px] text-sky-600 hover:underline font-medium"
                        >
                          Edit words &rarr;
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between w-full">
                        <button
                          onClick={() => setSelectedLetter(letter)}
                          className="text-xs font-semibold text-sky-700 group-hover:text-sky-900 hover:underline flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Read Letter &rarr;</span>
                        </button>
                        <button
                          onClick={() => handleOpenWriteModal(letter)}
                          className="text-xs text-slate-400 hover:text-sky-700 font-medium"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

      {/* Write / Edit Letter Modal */}
      <WriteLetterModal
        isOpen={isWriteModalOpen}
        onClose={() => setIsWriteModalOpen(false)}
        letterToEdit={letterBeingEdited}
        onSaved={handleLetterSaved}
        onDeleted={handleLetterDeleted}
      />

      {/* Floating Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-sky-100/80 px-4 py-3 sm:py-3.5 z-40 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-around text-[11px] sm:text-xs tracking-wider uppercase font-semibold text-sky-800/70">
          <Link to="/story" className="hover:text-sky-950 transition-colors px-2 py-0.5">Timeline</Link>
          <Link to="/letters" className="text-sky-700 font-bold border-b-2 border-sky-600 pb-0.5 px-2 py-0.5">Letters</Link>
          <Link to="/little-things" className="hover:text-sky-950 transition-colors px-2 py-0.5">Little Things</Link>
          <Link to="/admin" className="hover:text-sky-950 transition-colors text-slate-500 px-2 py-0.5">Admin</Link>
        </div>
      </nav>
    </div>
  );
}
