import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Heart, Sparkles, Compass } from "lucide-react";
import { differenceInDays, differenceInHours, differenceInMinutes, differenceInSeconds } from "date-fns";
import { useBlueTheme } from "../lib/themeContext";

const ANNIVERSARY_DATE = new Date("2026-11-02T00:00:00");
const START_DATE = new Date("2024-11-02T00:00:00");

export default function Landing() {
  const [now, setNow] = useState(new Date());
  const { theme } = useBlueTheme();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const daysSince = differenceInDays(now, START_DATE);
  
  // Time until anniversary
  const isAnniversary = now >= ANNIVERSARY_DATE;
  const daysUntil = differenceInDays(ANNIVERSARY_DATE, now);
  const hoursUntil = differenceInHours(ANNIVERSARY_DATE, now) % 24;
  const minutesUntil = differenceInMinutes(ANNIVERSARY_DATE, now) % 60;
  const secondsUntil = differenceInSeconds(ANNIVERSARY_DATE, now) % 60;

  return (
    <div className="min-h-screen bg-[#F3F8FC] text-slate-900 flex flex-col items-center justify-center p-6 py-12 pb-32 relative overflow-x-hidden selection:bg-sky-200">
      {/* Delicate background ambient lights in shades of blue */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-sky-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-100/30 rounded-full blur-3xl pointer-events-none" />

      {/* Floating subtle tropical Stitch stars / sparkles */}
      <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px] opacity-15 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="text-center z-10 max-w-lg w-full relative my-auto"
      >
        {/* Stitch & Ohana Heart Header */}
        <div className="mb-6 flex flex-col items-center justify-center gap-2">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
            className="w-12 h-12 rounded-full bg-white shadow-sm border border-sky-100 flex items-center justify-center text-sky-500"
          >
            <Heart className="w-6 h-6 fill-sky-400 text-sky-500 animate-pulse" strokeWidth={1.5} />
          </motion.div>
          <span className="text-[11px] font-mono uppercase tracking-widest text-sky-700 bg-sky-100/70 px-3 py-1 rounded-full border border-sky-200/60 font-semibold flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-sky-500" />
            Ohana • Two Years Together
          </span>
        </div>
        
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl tracking-tight text-slate-900 mb-3">
          Our Story
        </h1>
        <p className="text-xs sm:text-sm tracking-widest uppercase text-sky-900/60 mb-8 font-sans font-medium">
          Under every shade of blue since November 2, 2024
        </p>

        {/* Ohana Quote Motto */}
        <div className="mb-10 px-4 py-3 rounded-2xl bg-white/70 backdrop-blur-xs border border-sky-100/80 shadow-xs max-w-sm mx-auto">
          <p className="font-serif italic text-xs sm:text-sm text-slate-700">
            "Ohana means family. Family means nobody gets left behind or forgotten."
          </p>
          <p className="text-[10px] font-mono tracking-wider uppercase text-sky-600 mt-1">
            — For the girl who loves Stitch & blue skies
          </p>
        </div>

        {isAnniversary ? (
          <div className="mb-12">
            <h2 className="font-serif text-3xl italic text-blue-950 mb-2">Happy Two Years, My Love.</h2>
            <p className="text-xs uppercase tracking-widest text-sky-600">November 2, 2026 • 730 Days of Us</p>
          </div>
        ) : (
          <div className="mb-12">
            <p className="text-xs font-semibold tracking-widest text-sky-800/70 uppercase mb-4 font-mono">
              Countdown to Two Years • November 2, 2026
            </p>
            <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-md mx-auto">
              <div className="bg-white/80 backdrop-blur-xs border border-sky-100 p-3 sm:p-4 rounded-2xl shadow-xs">
                <span className="font-serif text-2xl sm:text-3xl text-slate-900 block">{Math.max(0, daysUntil)}</span>
                <span className="text-[10px] font-sans tracking-widest uppercase text-sky-600 font-semibold">Days</span>
              </div>
              <div className="bg-white/80 backdrop-blur-xs border border-sky-100 p-3 sm:p-4 rounded-2xl shadow-xs">
                <span className="font-serif text-2xl sm:text-3xl text-slate-900 block">{Math.max(0, hoursUntil)}</span>
                <span className="text-[10px] font-sans tracking-widest uppercase text-sky-600 font-semibold">Hours</span>
              </div>
              <div className="bg-white/80 backdrop-blur-xs border border-sky-100 p-3 sm:p-4 rounded-2xl shadow-xs">
                <span className="font-serif text-2xl sm:text-3xl text-slate-900 block">{Math.max(0, minutesUntil)}</span>
                <span className="text-[10px] font-sans tracking-widest uppercase text-sky-600 font-semibold">Mins</span>
              </div>
              <div className="bg-white/80 backdrop-blur-xs border border-sky-100 p-3 sm:p-4 rounded-2xl shadow-xs">
                <span className="font-serif text-2xl sm:text-3xl text-slate-900 block">{Math.max(0, secondsUntil)}</span>
                <span className="text-[10px] font-sans tracking-widest uppercase text-sky-600 font-semibold">Secs</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-sm sm:max-w-none mx-auto">
          <Link to="/story" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-sky-600 via-blue-700 to-indigo-800 text-white rounded-full text-xs tracking-widest uppercase font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Enter the Story</span>
              <span>&rarr;</span>
            </motion.button>
          </Link>

          <Link to="/little-things" className="w-full sm:w-auto">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="w-full sm:w-auto px-6 py-3.5 bg-white/90 text-sky-900 border border-sky-200/80 rounded-full text-xs tracking-widest uppercase font-semibold hover:bg-white transition-all shadow-xs flex items-center justify-center"
            >
              Little Things
            </motion.button>
          </Link>
        </div>

        {/* Days Together Counter - integrated in flow, never overlaps */}
        <div className="mt-10 sm:mt-12 text-xs tracking-widest text-sky-800/60 uppercase font-mono flex items-center justify-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
          <span>{daysSince} days together in our universe</span>
        </div>
      </motion.div>
    </div>
  );
}
