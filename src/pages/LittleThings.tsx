import { useEffect, useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { collection, query, orderBy, getDocs, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { motion, AnimatePresence } from "motion/react";
import { Heart, Sparkles, Plus, X, ArrowLeft } from "lucide-react";

interface LittleThing {
  id: string;
  text: string;
  category?: string;
  order: number;
}

const DEFAULT_LITTLE_THINGS: LittleThing[] = [
  {
    id: "def-1",
    text: "The way your entire face lights up whenever you spot a Stitch plushie or clip—you become the happiest kid in the room.",
    category: "Stitch & Ohana",
    order: 1
  },
  {
    id: "def-2",
    text: "Your deep obsession with every shade of blue—from morning sky periwinkle to midnight ocean navy, and how every shade looks made for you.",
    category: "Shades of Blue",
    order: 2
  },
  {
    id: "def-3",
    text: "How you quote 'Ohana means family. Family means nobody gets left behind or forgotten' whenever we comfort each other.",
    category: "Stitch & Ohana",
    order: 3
  },
  {
    id: "def-4",
    text: "The oversized royal blue hoodie you steal from me that practically swallows your hands, and how cute you look in it.",
    category: "Shades of Blue",
    order: 4
  },
  {
    id: "def-5",
    text: "Your playful, mischievous side that genuinely matches Experiment 626—stealing sips of my drink and grinning like you conquered the galaxy.",
    category: "Stitch & Ohana",
    order: 5
  },
  {
    id: "def-6",
    text: "How you stop to admire the ocean every time we visit the coast, taking photos of the blue waves like you're greeting an old friend.",
    category: "Shades of Blue",
    order: 6
  },
  {
    id: "def-7",
    text: "The little sleepy sigh you let out right before falling asleep with your head resting safely against my chest.",
    category: "Sweet Memories",
    order: 7
  },
  {
    id: "def-8",
    text: "How you always save the last bite of dessert for me, even when it's your absolute favorite sweet.",
    category: "Little Habits",
    order: 8
  },
  {
    id: "def-9",
    text: "The way you hold my hand in the passenger seat, tapping out the rhythm of our favorite road trip songs with your thumb.",
    category: "Sweet Memories",
    order: 9
  }
];

export default function LittleThings() {
  const [things, setThings] = useState<LittleThing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  // Add note modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newText, setNewText] = useState("");
  const [newCategory, setNewCategory] = useState("Stitch & Ohana");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchThings() {
      try {
        const q = query(collection(db, "little_things"), orderBy("order", "asc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LittleThing));
        if (data.length > 0) {
          setThings(data);
        } else {
          setThings(DEFAULT_LITTLE_THINGS);
        }
      } catch (error) {
        console.warn("Using default little things:", error);
        setThings(DEFAULT_LITTLE_THINGS);
      } finally {
        setLoading(false);
      }
    }
    fetchThings();
  }, []);

  const handleAddThing = async (e: FormEvent) => {
    e.preventDefault();
    if (!newText.trim()) return;

    setIsSubmitting(true);
    const newThing: LittleThing = {
      id: `custom-${Date.now()}`,
      text: newText.trim(),
      category: newCategory,
      order: things.length + 1
    };

    try {
      const docRef = await addDoc(collection(db, "little_things"), {
        text: newThing.text,
        category: newThing.category,
        order: newThing.order,
        created_at: new Date().toISOString()
      });
      newThing.id = docRef.id;
    } catch (err) {
      console.warn("Saved locally for session:", err);
    }

    setThings(prev => [newThing, ...prev]);
    setNewText("");
    setIsModalOpen(false);
    setIsSubmitting(false);
  };

  const categories = ["All", "Stitch & Ohana", "Shades of Blue", "Little Habits", "Sweet Memories"];

  const filteredThings = selectedCategory === "All" 
    ? things 
    : things.filter(t => t.category === selectedCategory);

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
          <span>Little Things I Love</span>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1 shadow-xs transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Note</span>
        </button>
      </header>

      <main className="max-w-4xl mx-auto px-6 pt-12 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600">
              <Heart className="w-6 h-6 fill-sky-500 text-sky-500" />
            </div>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl mb-2 text-slate-900">Little Things</h1>
          <p className="text-xs sm:text-sm tracking-widest uppercase text-sky-800/60 font-mono">
            Every tiny quirk, your love for Stitch, and all shades of blue
          </p>
        </motion.div>

        {/* Category Pills Filter */}
        <div className="flex items-center justify-center flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all ${
                selectedCategory === cat
                  ? "bg-sky-700 text-white shadow-xs"
                  : "bg-white text-sky-900/70 border border-sky-100 hover:bg-sky-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Little Things Grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
          {loading ? (
            <div className="animate-pulse space-y-6">
              <div className="h-40 bg-sky-100/50 rounded-3xl w-full"></div>
              <div className="h-64 bg-sky-100/50 rounded-3xl w-full"></div>
            </div>
          ) : filteredThings.map((thing, index) => {
            const isStitch = thing.category === "Stitch & Ohana";
            const isBlue = thing.category === "Shades of Blue";

            return (
              <motion.div
                key={thing.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.04 }}
                className={`break-inside-avoid p-6 sm:p-7 rounded-3xl transition-all duration-300 relative border ${
                  isStitch
                    ? "bg-gradient-to-br from-white via-sky-50/70 to-blue-50/60 border-sky-200 shadow-xs hover:shadow-md"
                    : isBlue
                    ? "bg-gradient-to-br from-white via-indigo-50/40 to-sky-50/40 border-blue-100 shadow-xs hover:shadow-md"
                    : "bg-white border-sky-100/80 shadow-xs hover:shadow-md"
                }`}
              >
                <div className="text-sky-300 font-serif text-3xl mb-1 select-none leading-none">“</div>
                <p className="font-serif text-base sm:text-lg leading-relaxed text-slate-800 italic relative z-10">
                  {thing.text}
                </p>

                <div className="mt-5 pt-3 border-t border-sky-100/60 flex items-center justify-between">
                  <span className={`text-[10px] font-mono tracking-wider uppercase px-2.5 py-0.5 rounded-full font-semibold ${
                    isStitch 
                      ? "bg-sky-100 text-sky-800" 
                      : isBlue
                      ? "bg-indigo-100 text-indigo-800"
                      : "bg-slate-100 text-slate-600"
                  }`}>
                    {thing.category || "Little Thing"}
                  </span>
                  <Heart className="w-3.5 h-3.5 text-sky-400 fill-sky-200" />
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Add Little Thing Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-sky-100"
            >
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-sky-100">
                <h3 className="font-serif text-xl text-slate-900">Add a Little Thing</h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAddThing} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-sky-900 mb-1">
                    What little thing do you love?
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="e.g., How you smile into my shoulder when watching Stitch..."
                    className="w-full p-3 text-xs rounded-xl border border-sky-200 focus:outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold tracking-wider uppercase text-sky-900 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2.5 text-xs rounded-xl border border-sky-200 bg-white"
                  >
                    <option value="Stitch & Ohana">Stitch & Ohana</option>
                    <option value="Shades of Blue">Shades of Blue</option>
                    <option value="Little Habits">Little Habits</option>
                    <option value="Sweet Memories">Sweet Memories</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-sky-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 text-xs uppercase font-semibold text-slate-500 hover:text-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !newText.trim()}
                    className="px-5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-full text-xs font-semibold uppercase tracking-wider disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Save Note"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Floating Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-sky-100/80 px-4 py-3 sm:py-3.5 z-40 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-around text-[11px] sm:text-xs tracking-wider uppercase font-semibold text-sky-800/70">
          <Link to="/story" className="hover:text-sky-950 transition-colors px-2 py-0.5">Timeline</Link>
          <Link to="/letters" className="hover:text-sky-950 transition-colors px-2 py-0.5">Letters</Link>
          <Link to="/little-things" className="text-sky-700 font-bold border-b-2 border-sky-600 pb-0.5 px-2 py-0.5">Little Things</Link>
          <Link to="/admin" className="hover:text-sky-950 transition-colors text-slate-500 px-2 py-0.5">Admin</Link>
        </div>
      </nav>
    </div>
  );
}
