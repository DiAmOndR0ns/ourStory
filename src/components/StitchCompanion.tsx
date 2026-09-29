import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Sparkles, X, Palette, Volume2, VolumeX, ShieldCheck } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export type BlueTheme = "stitch-ocean" | "periwinkle-sky" | "midnight-sapphire";

interface StitchCompanionProps {
  currentTheme?: BlueTheme;
  onThemeChange?: (theme: BlueTheme) => void;
}

const STITCH_QUOTES = [
  {
    quote: "Ohana means family. Family means nobody gets left behind or forgotten.",
    author: "Experiment 626",
    tag: "Ohana Forever"
  },
  {
    quote: "Meega nala kweesta! (Translation: I love you more than all the stars in the cosmos!)",
    author: "Stitch",
    tag: "Alien Love Code"
  },
  {
    quote: "Blue is not just a color—it's the ocean we walked by, the sky on Day 1, and every quiet moment with you.",
    author: "For You",
    tag: "All Shades of Blue"
  },
  {
    quote: "This is my family. I found it, all on my own. It's little, and broken, but still good. Yeah, still good.",
    author: "Lilo & Stitch",
    tag: "Our Safe Haven"
  },
  {
    quote: "Experiment 626 diagnostic: 100% maximum cuteness detected whenever you smile.",
    author: "Stitch",
    tag: "Love Diagnostic"
  },
  {
    quote: "Two years of building our very own universe together. You are my favorite human.",
    author: "Nov 2, 2024 → Forever",
    tag: "Anniversary Vow"
  }
];

export default function StitchCompanion({ currentTheme = "stitch-ocean", onThemeChange }: StitchCompanionProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [isWiggling, setIsWiggling] = useState(false);
  const [hearts, setHearts] = useState<{ id: number; x: number; y: number }[]>([]);

  // Check if page has a fixed bottom navigation bar
  const hasBottomNav = ["/story", "/letters", "/little-things"].some(path => location.pathname.startsWith(path));

  // Trigger occasional playful ear wiggle
  useEffect(() => {
    const interval = setInterval(() => {
      setIsWiggling(true);
      setTimeout(() => setIsWiggling(false), 1200);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleStitchClick = () => {
    // Generate floating heart
    const newHeart = {
      id: Date.now(),
      x: (Math.random() - 0.5) * 60,
      y: -20
    };
    setHearts(prev => [...prev, newHeart]);
    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== newHeart.id));
    }, 1500);

    setIsOpen(true);
  };

  const nextQuote = () => {
    setQuoteIndex((prev) => (prev + 1) % STITCH_QUOTES.length);
  };

  return (
    <div 
      className={`fixed right-4 sm:right-6 z-50 flex flex-col items-end pointer-events-auto select-none transition-all duration-300 ${
        hasBottomNav ? "bottom-20 sm:bottom-22" : "bottom-6 sm:bottom-8"
      }`}
    >
      {/* Floating Hearts when clicked */}
      <AnimatePresence>
        {hearts.map(heart => (
          <motion.div
            key={heart.id}
            initial={{ opacity: 1, scale: 0.8, y: 0, x: heart.x }}
            animate={{ opacity: 0, scale: 1.4, y: -80, x: heart.x * 1.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute bottom-20 right-6 pointer-events-none text-sky-400"
          >
            <Heart className="w-6 h-6 fill-sky-400 text-sky-300 drop-shadow-md" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Popover Bubble */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            className="mb-3 w-80 sm:w-88 bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-sky-100 text-stone-800"
          >
            <div className="flex items-center justify-between pb-3 border-b border-sky-50">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
                <span className="text-[11px] font-mono uppercase tracking-wider text-sky-700 font-semibold">
                  {STITCH_QUOTES[quoteIndex].tag}
                </span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                aria-label="Close Stitch note"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4">
              <p className="font-serif text-sm sm:text-base leading-relaxed text-stone-800 italic">
                "{STITCH_QUOTES[quoteIndex].quote}"
              </p>
              <div className="mt-3 flex items-center justify-between text-xs text-sky-600 font-sans">
                <span className="font-medium">— {STITCH_QUOTES[quoteIndex].author}</span>
                <button
                  onClick={nextQuote}
                  className="text-[11px] font-semibold tracking-wider uppercase text-sky-700 hover:text-blue-900 transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  Next Note
                </button>
              </div>
            </div>

            {/* Shades of Blue Theme Switcher */}
            {onThemeChange && (
              <div className="pt-3 border-t border-sky-50 flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 flex items-center gap-1">
                  <Palette className="w-3 h-3 text-sky-500" />
                  Blue Mood
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onThemeChange("stitch-ocean")}
                    title="Stitch Ocean (Classic Cerulean & Deep Navy)"
                    className={`w-5 h-5 rounded-full bg-gradient-to-br from-sky-400 to-blue-700 transition-all ${
                      currentTheme === "stitch-ocean" ? "ring-2 ring-sky-500 scale-110" : "opacity-60 hover:opacity-100"
                    }`}
                  />
                  <button
                    onClick={() => onThemeChange("periwinkle-sky")}
                    title="Periwinkle Sky (Soft Indigo & Lavender Blue)"
                    className={`w-5 h-5 rounded-full bg-gradient-to-br from-indigo-300 to-blue-500 transition-all ${
                      currentTheme === "periwinkle-sky" ? "ring-2 ring-indigo-400 scale-110" : "opacity-60 hover:opacity-100"
                    }`}
                  />
                  <button
                    onClick={() => onThemeChange("midnight-sapphire")}
                    title="Midnight Sapphire (Deep Celestial Blue)"
                    className={`w-5 h-5 rounded-full bg-gradient-to-br from-blue-900 to-slate-950 transition-all ${
                      currentTheme === "midnight-sapphire" ? "ring-2 ring-blue-700 scale-110" : "opacity-60 hover:opacity-100"
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Admin Hub Shortcut */}
            <div className="pt-2.5 mt-2 border-t border-sky-50/80 flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Story Studio</span>
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="text-[11px] font-medium tracking-wider uppercase text-sky-700 hover:text-blue-900 transition-colors flex items-center gap-1.5 hover:underline"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-sky-600" />
                <span>Admin Hub</span>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Stitch Button Avatar */}
      <motion.button
        onClick={handleStitchClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="group relative flex items-center justify-center focus:outline-none"
        title="Say Aloha to Stitch! (Click for cute notes & blue themes)"
        aria-label="Stitch companion"
      >
        {/* Glow halo */}
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 opacity-40 blur-md group-hover:opacity-75 transition-opacity duration-300" />

        {/* Stitch Circular Badge Canvas */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-b from-[#38bdf8] via-[#0284c7] to-[#1e3a8a] p-0.5 shadow-xl border-2 border-white/80 overflow-hidden flex items-center justify-center">
          {/* Detailed Vector Stitch */}
          <motion.svg
            viewBox="0 0 100 100"
            className="w-full h-full"
            animate={isWiggling ? { rotate: [0, -6, 6, -3, 3, 0] } : {}}
            transition={{ duration: 0.8 }}
          >
            <defs>
              <linearGradient id="stitchSkin" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#38BDF8" />
                <stop offset="60%" stopColor="#0284C7" />
                <stop offset="100%" stopColor="#1E3A8A" />
              </linearGradient>
              <linearGradient id="stitchEarInner" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#F472B6" />
                <stop offset="100%" stopColor="#93C5FD" />
              </linearGradient>
              <linearGradient id="bellyPatch" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#BAE6FD" />
                <stop offset="100%" stopColor="#7DD3FC" />
              </linearGradient>
            </defs>

            {/* Left Big Ear */}
            <motion.path
              d="M 32 38 C 15 22 2 12 4 3 C 6 -2 18 10 38 24 Z"
              fill="url(#stitchSkin)"
              animate={isWiggling ? { rotate: [-4, 8, -4] } : {}}
              style={{ originX: "38px", originY: "24px" }}
            />
            {/* Left Ear Inner */}
            <path
              d="M 30 34 C 18 22 8 15 10 7 C 12 3 20 12 34 24 Z"
              fill="url(#stitchEarInner)"
              opacity="0.85"
            />
            {/* Ear notch left */}
            <path d="M 12 18 L 18 20 L 14 14 Z" fill="#0284C7" />

            {/* Right Big Ear */}
            <motion.path
              d="M 68 38 C 85 22 98 12 96 3 C 94 -2 82 10 62 24 Z"
              fill="url(#stitchSkin)"
              animate={isWiggling ? { rotate: [4, -8, 4] } : {}}
              style={{ originX: "62px", originY: "24px" }}
            />
            {/* Right Ear Inner */}
            <path
              d="M 70 34 C 82 22 92 15 90 7 C 88 3 80 12 66 24 Z"
              fill="url(#stitchEarInner)"
              opacity="0.85"
            />
            {/* Ear notch right */}
            <path d="M 88 18 L 82 20 L 86 14 Z" fill="#0284C7" />

            {/* Stitch Head */}
            <ellipse cx="50" cy="52" rx="30" ry="26" fill="url(#stitchSkin)" />

            {/* Stitch Forehead Tuft */}
            <path d="M 48 26 Q 50 18 52 26 Q 54 22 55 28 Z" fill="#0369A1" />

            {/* Eye Patches (Lighter blue surrounds) */}
            <ellipse cx="36" cy="48" rx="10" ry="12" fill="#7DD3FC" opacity="0.35" transform="rotate(-10 36 48)" />
            <ellipse cx="64" cy="48" rx="10" ry="12" fill="#7DD3FC" opacity="0.35" transform="rotate(10 64 48)" />

            {/* Left Eye */}
            <ellipse cx="37" cy="48" rx="7" ry="9" fill="#0F172A" />
            <circle cx="35" cy="45" r="2.8" fill="#FFFFFF" />
            <circle cx="39" cy="51" r="1.2" fill="#BAE6FD" />

            {/* Right Eye */}
            <ellipse cx="63" cy="48" rx="7" ry="9" fill="#0F172A" />
            <circle cx="61" cy="45" r="2.8" fill="#FFFFFF" />
            <circle cx="65" cy="51" r="1.2" fill="#BAE6FD" />

            {/* Stitch Big Cute Nose */}
            <ellipse cx="50" cy="57" rx="8" ry="5.5" fill="#1E3A8A" />
            <ellipse cx="48" cy="56" rx="2" ry="1" fill="#60A5FA" opacity="0.7" />
            {/* Nostrils */}
            <circle cx="47" cy="58" r="1" fill="#0F172A" />
            <circle cx="53" cy="58" r="1" fill="#0F172A" />

            {/* Stitch Grin */}
            <path d="M 38 64 Q 50 73 62 64" stroke="#0F172A" strokeWidth="2.2" fill="none" strokeLinecap="round" />
            {/* Little smile dimples */}
            <path d="M 37 62 Q 35 64 36 66" stroke="#0F172A" strokeWidth="1.5" fill="none" />
            <path d="M 63 62 Q 65 64 64 66" stroke="#0F172A" strokeWidth="1.5" fill="none" />

            {/* Cute Hibiscus / Tropical Plumeria on side of head */}
            <g transform="translate(68, 28) scale(0.6)">
              <circle cx="0" cy="-8" r="6" fill="#38BDF8" opacity="0.9" />
              <circle cx="7" cy="-2" r="6" fill="#60A5FA" opacity="0.9" />
              <circle cx="5" cy="7" r="6" fill="#93C5FD" opacity="0.9" />
              <circle cx="-5" cy="7" r="6" fill="#60A5FA" opacity="0.9" />
              <circle cx="-7" cy="-2" r="6" fill="#38BDF8" opacity="0.9" />
              <circle cx="0" cy="0" r="3.5" fill="#FEF08A" />
            </g>

            {/* Paws resting on bottom rim */}
            <ellipse cx="36" cy="75" rx="7" ry="5" fill="#0284C7" />
            <ellipse cx="64" cy="75" rx="7" ry="5" fill="#0284C7" />
            {/* Claws */}
            <circle cx="32" cy="72" r="1" fill="#0F172A" />
            <circle cx="36" cy="71" r="1" fill="#0F172A" />
            <circle cx="40" cy="72" r="1" fill="#0F172A" />
            <circle cx="60" cy="72" r="1" fill="#0F172A" />
            <circle cx="64" cy="71" r="1" fill="#0F172A" />
            <circle cx="68" cy="72" r="1" fill="#0F172A" />
          </motion.svg>
        </div>

        {/* Little "Ohana" floating badge */}
        <div className="absolute -top-2 -left-2 bg-white text-sky-700 text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shadow-md border border-sky-200 flex items-center gap-1">
          <Heart className="w-2.5 h-2.5 fill-sky-500 text-sky-500" />
          <span>Ohana</span>
        </div>
      </motion.button>
    </div>
  );
}
