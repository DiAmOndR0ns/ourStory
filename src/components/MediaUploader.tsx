import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../lib/firebase";
import { 
  Upload, 
  Video, 
  Image as ImageIcon, 
  X, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Link as LinkIcon,
  Film
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export interface UploadedMediaResult {
  type: "image" | "video";
  url: string;
  caption: string;
  film_type?: string;
  name?: string;
  sizeBytes?: number;
}

interface MediaUploaderProps {
  onMediaReady: (media: UploadedMediaResult) => void;
  defaultCaption?: string;
  defaultFilmType?: string;
  className?: string;
}

export default function MediaUploader({
  onMediaReady,
  defaultCaption = "",
  defaultFilmType = "Polaroid",
  className = ""
}: MediaUploaderProps) {
  const [activeMode, setActiveMode] = useState<"file" | "url">("file");
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Staged / Preview State
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");
  const [fileName, setFileName] = useState<string>("");
  const [fileSizeStr, setFileSizeStr] = useState<string>("");
  const [caption, setCaption] = useState(defaultCaption);
  const [filmType, setFilmType] = useState(defaultFilmType);

  // Direct URL Input State
  const [manualUrl, setManualUrl] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const processFile = async (file: File) => {
    setErrorMsg(null);

    const isVideo = file.type.startsWith("video/");
    const isImage = file.type.startsWith("image/");

    if (!isVideo && !isImage) {
      setErrorMsg("Please upload a supported image or video file (MP4, MOV, WebM, JPEG, PNG, etc).");
      return;
    }

    // Limit size if needed: 50MB for videos, 20MB for images
    const maxSize = isVideo ? 50 * 1024 * 1024 : 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg(`File size exceeds limit (${isVideo ? "50MB for video" : "20MB for image"}).`);
      return;
    }

    const detectedType = isVideo ? "video" : "image";
    setMediaType(detectedType);
    setFileName(file.name);
    setFileSizeStr(formatFileSize(file.size));

    // Create local object URL for instant preview and fallback
    const localBlobUrl = URL.createObjectURL(file);
    setPreviewUrl(localBlobUrl);

    // Initiate Firebase Storage upload
    setUploading(true);
    setProgress(0);

    const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9_.-]/g, "_");
    const storagePath = `memories/${detectedType}s/${uniqueId}_${sanitizedName}`;
    const storageReference = ref(storage, storagePath);

    try {
      const uploadTask = uploadBytesResumable(storageReference, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          setProgress(pct);
        },
        (error) => {
          console.warn("Firebase Storage upload fallback (using local object stream):", error);
          // Graceful fallback to local blob URL if cloud bucket is restricted
          setUploading(false);
          setProgress(100);
          notifyParent(localBlobUrl, detectedType, file.name, file.size);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            setUploading(false);
            setProgress(100);
            notifyParent(downloadUrl, detectedType, file.name, file.size);
          } catch {
            setUploading(false);
            notifyParent(localBlobUrl, detectedType, file.name, file.size);
          }
        }
      );
    } catch (err) {
      console.warn("Error initiating upload, using direct blob URL:", err);
      setUploading(false);
      setProgress(100);
      notifyParent(localBlobUrl, detectedType, file.name, file.size);
    }
  };

  const notifyParent = (url: string, type: "image" | "video", name?: string, sizeBytes?: number) => {
    onMediaReady({
      type,
      url,
      caption,
      film_type: filmType,
      name,
      sizeBytes
    });
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleManualUrlSubmit = () => {
    if (!manualUrl.trim()) return;
    const url = manualUrl.trim();
    // Guess type from extension
    const isVid = /\.(mp4|webm|mov|ogg|m4v)($|\?)/i.test(url);
    const type = isVid ? "video" : "image";
    setMediaType(type);
    setPreviewUrl(url);
    setFileName(url.split("/").pop()?.split("?")[0] || "external_media");
    setFileSizeStr("External URL");
    notifyParent(url, type);
  };

  const handleReset = () => {
    setPreviewUrl(null);
    setProgress(0);
    setUploading(false);
    setErrorMsg(null);
    setManualUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`w-full flex flex-col gap-3 ${className}`}>
      {/* Upload mode tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-stone-100 p-0.5 rounded-lg text-xs">
          <button
            type="button"
            onClick={() => setActiveMode("file")}
            className={`px-3 py-1 rounded-md transition-all font-medium ${
              activeMode === "file" 
                ? "bg-white text-stone-900 shadow-xs" 
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Upload File
          </button>
          <button
            type="button"
            onClick={() => setActiveMode("url")}
            className={`px-3 py-1 rounded-md transition-all font-medium ${
              activeMode === "url" 
                ? "bg-white text-stone-900 shadow-xs" 
                : "text-stone-500 hover:text-stone-800"
            }`}
          >
            Enter Media URL
          </button>
        </div>

        <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
          <Film className="w-3 h-3 text-rose-400" />
          <span>Supports Video & Photo</span>
        </div>
      </div>

      {/* Main Upload Drop Area or URL Bar */}
      {activeMode === "file" ? (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/mp4,video/quicktime,video/webm"
            onChange={handleFileChange}
            className="hidden"
            id="media-file-input"
          />

          {!previewUrl ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                isDragging
                  ? "border-rose-400 bg-rose-50/50 scale-[0.99]"
                  : "border-stone-200 hover:border-stone-400 bg-stone-50/60 hover:bg-stone-50"
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-white shadow-xs border border-stone-100 flex items-center justify-center mb-3">
                <Upload className="w-5 h-5 text-stone-600" />
              </div>

              <div className="text-sm font-medium text-stone-800 mb-1">
                Drop your memory photo or video here
              </div>
              <p className="text-xs text-stone-400 max-w-xs mb-3">
                Drag & drop or tap to browse from your device. Supports MP4, WebM, MOV, JPG, PNG, WebP.
              </p>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 text-[10px] font-semibold tracking-wider uppercase">
                  <Video className="w-3 h-3" /> Video Capable
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 text-[10px] font-semibold tracking-wider uppercase">
                  <ImageIcon className="w-3 h-3" /> High-Res Photo
                </span>
              </div>
            </div>
          ) : (
            /* Upload Preview Card */
            <div className="relative rounded-2xl border border-stone-200 bg-stone-50 p-4 flex flex-col gap-3">
              {/* Reset/Remove button */}
              <button
                type="button"
                onClick={handleReset}
                className="absolute top-3 right-3 z-20 p-1.5 rounded-full bg-black/60 hover:bg-black/80 text-white transition-colors"
                title="Remove media"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Media Player / Image Display */}
              <div className="relative w-full aspect-[16/10] bg-black rounded-xl overflow-hidden flex items-center justify-center">
                {mediaType === "video" ? (
                  <video
                    src={previewUrl}
                    controls
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                )}

                {/* Badge */}
                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-mono tracking-wider uppercase flex items-center gap-1">
                  {mediaType === "video" ? <Video className="w-3 h-3 text-rose-400" /> : <ImageIcon className="w-3 h-3 text-rose-400" />}
                  <span>{mediaType.toUpperCase()}</span>
                </div>
              </div>

              {/* Upload Progress or Success */}
              {uploading ? (
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs text-stone-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                      Uploading to cloud storage...
                    </span>
                    <span className="font-mono text-[11px]">{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-rose-500 transition-all duration-300 rounded-full"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs text-stone-600 pt-1">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-medium">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Ready ({fileName} • {fileSizeStr})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-[11px] font-semibold text-rose-600 hover:underline uppercase tracking-wider"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Manual URL mode */
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-3 text-stone-400" />
              <input
                type="url"
                value={manualUrl}
                onChange={(e) => setManualUrl(e.target.value)}
                placeholder="https://example.com/video.mp4 or photo.jpg"
                className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400/40 bg-white"
              />
            </div>
            <button
              type="button"
              onClick={handleManualUrlSubmit}
              disabled={!manualUrl.trim()}
              className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold tracking-wider uppercase hover:bg-stone-800 disabled:opacity-50"
            >
              Load
            </button>
          </div>

          {previewUrl && (
            <div className="relative w-full aspect-[16/10] bg-black rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={handleReset}
                className="absolute top-2 right-2 z-20 p-1.5 rounded-full bg-black/60 text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {mediaType === "video" ? (
                <video src={previewUrl} controls className="w-full h-full object-contain" />
              ) : (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
              )}
            </div>
          )}
        </div>
      )}

      {/* Optional Caption & Film tag */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div>
          <label className="block text-[11px] font-medium text-stone-500 uppercase tracking-wider mb-1">
            Caption / Memory Note
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => {
              setCaption(e.target.value);
              if (previewUrl) {
                onMediaReady({
                  type: mediaType,
                  url: previewUrl,
                  caption: e.target.value,
                  film_type: filmType,
                  name: fileName,
                });
              }
            }}
            placeholder="e.g., Laughing so hard in the rain"
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400/40 bg-white"
          />
        </div>

        <div>
          <label className="block text-[11px] font-medium text-stone-500 uppercase tracking-wider mb-1">
            Film Filter / Badge
          </label>
          <select
            value={filmType}
            onChange={(e) => {
              setFilmType(e.target.value);
              if (previewUrl) {
                onMediaReady({
                  type: mediaType,
                  url: previewUrl,
                  caption,
                  film_type: e.target.value,
                  name: fileName,
                });
              }
            }}
            className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-rose-400/40 bg-white"
          >
            <option value="Polaroid 600">Polaroid 600</option>
            <option value="35mm Film">35mm Film</option>
            <option value="Super 8 Video">Super 8 Video</option>
            <option value="Portra 400">Portra 400</option>
            <option value="Night Snapshot">Night Snapshot</option>
            <option value="Warm Grain">Warm Grain</option>
          </select>
        </div>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 px-3 py-2 rounded-xl border border-rose-100">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
