import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, MapPin, Calendar, Music, Trash2 } from "lucide-react";
import SwipeableGallery from "../components/SwipeableGallery";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import { MemoryItem } from "../types";
import { getMemoryById, deleteMemory } from "../lib/memoriesService";

export default function Memory() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [memory, setMemory] = useState<MemoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!id) return;
      setLoading(true);

      try {
        const found = await getMemoryById(id);
        setMemory(found);
      } catch (error) {
        console.error("Error fetching memory:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const handleDelete = async () => {
    if (!memory) return;
    setIsDeleting(true);
    try {
      await deleteMemory(memory.id);
      setIsDeleteModalOpen(false);
      // Navigate back to the chapter or story timeline
      navigate(`/story/${memory.chapter_id}`);
    } catch (err) {
      console.error("Failed to delete memory:", err);
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F8FC] flex items-center justify-center text-sky-800">
        <p className="font-serif italic">Loading memory...</p>
      </div>
    );
  }

  if (!memory) {
    return (
      <div className="min-h-screen bg-[#F3F8FC] flex flex-col items-center justify-center p-6 text-slate-700">
        <p className="font-serif text-2xl mb-4">Memory not found</p>
        <Link to="/story" className="text-xs font-semibold tracking-widest uppercase text-sky-700 underline">
          Back to Timeline
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F8FC] text-slate-900 pb-24">
      <header className="p-4 md:p-6 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-40 border-b border-sky-100">
        <Link 
          to={`/story/${memory.chapter_id}`} 
          className="text-sky-800 hover:text-blue-950 transition-colors flex items-center text-xs tracking-widest uppercase font-semibold"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Chapter
        </Link>

        {/* Delete Memory Button */}
        <button
          onClick={() => setIsDeleteModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/60 hover:border-rose-200 transition-all"
          title="Delete this memory"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Delete Memory</span>
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 text-center"
        >
          <div className="flex items-center justify-center gap-3 text-xs tracking-widest uppercase text-sky-800/60 mb-3 font-mono">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-sky-500" />
              {memory.date}
            </span>
            {memory.location && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-500" />
                  {memory.location}
                </span>
              </>
            )}
          </div>

          <h1 className="font-serif text-3xl sm:text-4xl text-slate-900 mb-4">{memory.title}</h1>

          {memory.song && (
            <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-sky-900 text-xs font-sans">
              <Music className="w-3.5 h-3.5 text-sky-500" />
              <span>Soundtrack: <strong className="text-slate-900">{memory.song.title}</strong> — {memory.song.artist}</span>
            </div>
          )}
        </motion.div>

        {/* Swipeable Photo Gallery Component */}
        <div className="mb-10">
          <SwipeableGallery
            media={memory.media}
            eventTitle={memory.title}
            eventLocation={memory.location}
            polaroidStyle={true}
          />
        </div>

        {/* Narrative Description Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-[0_4px_25px_rgb(0,0,0,0.03)] border border-sky-100 mb-10">
          <h2 className="font-serif text-lg text-slate-900 mb-4">The Story</h2>
          <div className="font-serif text-slate-700 leading-loose text-base sm:text-lg whitespace-pre-wrap">
            {memory.description}
          </div>
        </div>

        {/* Bottom Options & Delete Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-sky-100/80 mb-12">
          <Link
            to={`/story/${memory.chapter_id}`}
            className="text-xs font-semibold tracking-wider uppercase text-sky-700 hover:text-blue-900 flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Chapter</span>
          </Link>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="text-xs font-medium text-slate-400 hover:text-rose-600 transition-colors flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-rose-50/50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete this memory</span>
          </button>
        </div>
      </main>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Memory?"
        itemTitle={memory.title}
        isDeleting={isDeleting}
      />
    </div>
  );
}
