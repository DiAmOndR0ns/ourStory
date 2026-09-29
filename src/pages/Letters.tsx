import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, query, getDocs } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion } from "motion/react";
import { Lock, MailOpen, ArrowLeft, Sparkles, Heart } from "lucide-react";

interface Letter {
  id: string;
  title: string;
  content: string;
  unlock_date: string;
  theme_tag?: string;
}

const DEFAULT_LETTERS: Letter[] = [
  {
    id: "let-1",
    title: "To The Girl Who Painted My World in Every Shade of Blue",
    unlock_date: "November 2, 2024",
    theme_tag: "Shades of Blue",
    content: `My dearest,

Before I met you, blue was just a color on a palette. Now, it's the shade of the sky on that crisp November afternoon when we first talked for four straight hours. It's the color of the oversized sweater you burrow into on lazy Sundays. It's the reflection of the Pacific waves on our drives down the coastline.

You brought an entire ocean of warmth, laughter, and calm into my life. Every shade of blue—from the quiet indigo of midnight conversations to the bright cerulean of your smile—reminds me of why I fell in love with you.

Thank you for making our little corner of the world so deeply beautiful.`
  },
  {
    id: "let-2",
    title: "Our Ohana Promise • Experiment 626",
    unlock_date: "November 2, 2025",
    theme_tag: "Stitch & Ohana",
    content: `My favorite human,

You taught me the truest meaning of Stitch's words: "Ohana means family. Family means nobody gets left behind or forgotten."

Whenever things get loud, or life gets overwhelming, looking at you feels like coming home. You have that same fierce, loyal, unconditional heart that Stitch searched the whole galaxy for. We are our own little team, our own cozy safe haven. 

Through every high and every quiet low, I promise to always stand by your side. Nobody gets left behind. Not now, not in two years, not ever.`
  },
  {
    id: "let-3",
    title: "The Two-Year Anniversary Letter",
    unlock_date: "November 2, 2026",
    theme_tag: "Anniversary Time Capsule",
    content: `Happy Two Years, my love.

730 days of holding your hand. 730 days of waking up knowing that out of eight billion people on this planet, I get to love you. 

Look back at all the chapters we've written together—the first coffee, the road trips, the inside jokes, the Stitch plushies on our bed, the late-night talks under starry skies. 

This is only the prologue. Here is to a lifetime of adventures, and loving you in every shade of blue.`
  }
];

export default function Letters() {
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<Letter | null>(null);

  useEffect(() => {
    async function fetchLetters() {
      try {
        const q = query(collection(db, "letters"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Letter));
        if (data.length > 0) {
          setLetters(data);
        } else {
          setLetters(DEFAULT_LETTERS);
        }
      } catch (error) {
        console.warn("Using default letters:", error);
        setLetters(DEFAULT_LETTERS);
      } finally {
        setLoading(false);
      }
    }
    
    fetchLetters();
  }, []);

  const today = new Date();

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

      <main className="max-w-3xl mx-auto px-6 pt-12 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600">
              <MailOpen className="w-6 h-6 text-sky-600" />
            </div>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl mb-2 text-slate-900">Sealed Letters</h1>
          <p className="text-xs sm:text-sm tracking-widest uppercase text-sky-800/60 font-mono">
            Words saved for the right moment • Our Ohana chronicle
          </p>
        </motion.div>

        {selectedLetter ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
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

              <span className="text-[10px] font-mono tracking-wider uppercase bg-sky-100 text-sky-800 px-3 py-1 rounded-full font-semibold">
                {selectedLetter.theme_tag || "Ohana"}
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl mb-8 text-center text-slate-900">
              {selectedLetter.title}
            </h2>

            <div className="font-serif text-base sm:text-lg leading-loose text-slate-700 whitespace-pre-wrap max-w-2xl mx-auto px-2 sm:px-6">
              {selectedLetter.content}
            </div>

            <div className="mt-14 pt-6 border-t border-sky-50 text-center text-xs font-mono uppercase tracking-widest text-sky-600">
              Unlocked for you • {selectedLetter.unlock_date}
            </div>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              <div className="animate-pulse col-span-full space-y-4">
                <div className="h-32 bg-sky-100/50 rounded-2xl w-full"></div>
                <div className="h-32 bg-sky-100/50 rounded-2xl w-full"></div>
              </div>
            ) : letters.map((letter, index) => {
              const unlockDate = new Date(letter.unlock_date);
              const isLocked = today < unlockDate;

              return (
                <motion.div
                  key={letter.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => {
                    if (!isLocked) setSelectedLetter(letter);
                  }}
                  className={`relative overflow-hidden rounded-3xl p-7 border transition-all duration-300 ${
                    isLocked 
                      ? 'bg-slate-50/70 border-slate-200/80 opacity-70 cursor-not-allowed' 
                      : 'bg-white border-sky-100 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/10 cursor-pointer group'
                  }`}
                >
                  <div className="flex justify-between items-start mb-5">
                    <div className={`p-3 rounded-2xl ${
                      isLocked ? "bg-slate-100 text-slate-400" : "bg-sky-50 text-sky-600 group-hover:bg-sky-100 transition-colors"
                    }`}>
                      {isLocked ? <Lock className="w-5 h-5" /> : <MailOpen className="w-5 h-5" />}
                    </div>

                    <span className={`text-[10px] font-mono tracking-wider uppercase px-2.5 py-1 rounded-full font-semibold ${
                      isLocked ? "bg-slate-100 text-slate-400" : "bg-sky-100 text-sky-800"
                    }`}>
                      {isLocked ? `Unlocks ${letter.unlock_date}` : 'Open to Read'}
                    </span>
                  </div>

                  <h3 className={`font-serif text-lg sm:text-xl mb-2 ${isLocked ? 'text-slate-400' : 'text-slate-900 group-hover:text-sky-900'}`}>
                    {letter.title}
                  </h3>

                  {letter.theme_tag && (
                    <div className="mt-3 flex items-center gap-1 text-[11px] text-sky-600/80 font-sans">
                      <Heart className="w-3 h-3 text-sky-400 fill-sky-200" />
                      <span>{letter.theme_tag}</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </main>

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
