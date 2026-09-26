import React, { useState, useRef } from 'react';
import { useCMS } from '../../context/CMSContext';
import { MediaAsset } from '../../types';
import {
  Upload,
  Trash2,
  Search,
  Image as ImageIcon,
  Copy,
  Check,
  AlertTriangle,
  X,
  Loader2,
  FileImage,
  ExternalLink,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export function AdminMediaLibrary() {
  const { mediaAssets, uploadFile, deleteMedia } = useCMS();
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Asset targeted for permanent deletion in the confirmation modal
  const [assetToDelete, setAssetToDelete] = useState<MediaAsset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredAssets = mediaAssets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.category && asset.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    try {
      setIsUploading(true);
      for (let i = 0; i < files.length; i++) {
        setUploadMessage(`Uploading ${files[i].name} (${i + 1}/${files.length})...`);
        await uploadFile(files[i], 'Uploads');
      }
    } finally {
      setIsUploading(false);
      setUploadMessage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await handleFiles(e.target.files);
  };

  // Drag & drop handlers for media upload dropzone
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await handleFiles(e.dataTransfer.files);
    }
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Triggered when user confirms deletion in the modal
  const handleConfirmDelete = async () => {
    if (!assetToDelete) return;
    try {
      setIsDeleting(true);
      await deleteMedia(assetToDelete.id);
      setAssetToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#b89753] block">
            Storage Engine
          </span>
          <h2 className="text-2xl font-serif text-[#1a1a1a]">Central Media Bucket</h2>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Store and manage high-resolution assets uploaded from devices. Stored permanently on the server with instant cache-busting.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleBatchUpload}
            multiple
            accept="image/*"
            className="hidden"
            id="admin-media-file-input"
          />
          <button
            type="button"
            id="admin-upload-photos-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-2 bg-[#b89753] hover:bg-[#a38442] text-white px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-medium shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Upload className="w-4 h-4" />
            )}
            <span>{isUploading ? 'Uploading Files...' : 'Upload Photos'}</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Dropzone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-3xl p-6 sm:p-8 text-center transition-all cursor-pointer group ${
          isDraggingOver
            ? 'border-[#b89753] bg-[#b89753]/10 scale-[1.01]'
            : 'border-neutral-300 bg-white hover:border-[#b89753]/60 hover:bg-neutral-50/70'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-3">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
              isDraggingOver
                ? 'bg-[#b89753] text-white'
                : 'bg-neutral-100 text-neutral-500 group-hover:text-[#b89753] group-hover:bg-[#b89753]/10'
            }`}
          >
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium text-[#1a1a1a]">
              {isDraggingOver
                ? 'Drop image files here to upload directly'
                : 'Drag & drop photos here, or click to browse'}
            </p>
            <p className="text-xs text-neutral-400 mt-1">
              Supports JPEG, PNG, WEBP, AVIF, and SVG up to 50MB
            </p>
          </div>
          {uploadMessage && (
            <div className="mt-2 inline-flex items-center gap-2 bg-[#b89753]/15 text-[#8c6d2c] px-4 py-1.5 rounded-full text-xs font-medium animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{uploadMessage}</span>
            </div>
          )}
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="media-search-input"
            placeholder="Filter media by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-neutral-200 rounded-full pl-10 pr-4 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
          />
        </div>
        <div className="text-xs text-neutral-500 flex items-center gap-2">
          <span>
            Showing <strong className="text-neutral-800">{filteredAssets.length}</strong> of{' '}
            <strong className="text-neutral-800">{mediaAssets.length}</strong> images
          </span>
        </div>
      </div>

      {/* Media Assets Grid */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white rounded-3xl border border-neutral-200 p-12 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
            <ImageIcon className="w-8 h-8" />
          </div>
          <h3 className="text-base font-serif text-[#1a1a1a] mb-1">No media assets found</h3>
          <p className="text-xs text-neutral-500 max-w-sm mb-4">
            {searchQuery
              ? `No images matched the query "${searchQuery}". Try a different search term.`
              : 'The media library is currently empty. Upload images from your device to start.'}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs font-medium text-[#b89753] hover:underline"
            >
              Clear search filter
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              id={`media-card-${asset.id}`}
              className="group bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col relative"
            >
              {/* Thumbnail Stage */}
              <div className="aspect-square relative overflow-hidden bg-neutral-100">
                <img
                  src={asset.url}
                  alt={asset.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* VISIBLE DELETE BUTTON ON THUMBNAIL (Directly accessible on mobile and desktop) */}
                <button
                  type="button"
                  id={`delete-btn-${asset.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setAssetToDelete(asset);
                  }}
                  title="Delete image permanently"
                  aria-label={`Delete image ${asset.name}`}
                  className="absolute top-2 right-2 z-10 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/95 text-red-600 hover:bg-red-600 hover:text-white shadow-md flex items-center justify-center transition-all cursor-pointer border border-neutral-200 hover:border-red-600 active:scale-90"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>

                {/* Hover Action Overlay */}
                <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(asset.url, asset.id)}
                    title="Copy direct image URL"
                    className="w-8 h-8 rounded-full bg-white text-neutral-800 hover:bg-[#b89753] hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                  >
                    {copiedId === asset.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                  <a
                    href={asset.url}
                    target="_blank"
                    rel="noreferrer"
                    title="View full resolution"
                    className="w-8 h-8 rounded-full bg-white text-neutral-800 hover:bg-[#b89753] hover:text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button
                    type="button"
                    onClick={() => setAssetToDelete(asset)}
                    title="Delete permanently from storage"
                    className="w-8 h-8 rounded-full bg-red-600 text-white hover:bg-red-700 flex items-center justify-center transition-colors cursor-pointer shadow-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Meta & Details */}
              <div className="p-3 bg-white flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-medium text-[#1a1a1a] truncate" title={asset.name}>
                    {asset.name}
                  </p>
                  <div className="flex items-center justify-between text-[10px] text-neutral-400 mt-1">
                    <span className="truncate max-w-[80px]">{asset.category || 'Asset'}</span>
                    <span>{(asset.size / 1024).toFixed(0)} KB</span>
                  </div>
                </div>

                {/* Explicit Bottom Remove Action */}
                <div className="pt-2 mt-2 border-t border-neutral-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(asset.url, asset.id)}
                    className="text-[10px] text-neutral-500 hover:text-[#b89753] font-medium flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === asset.id ? (
                      <span className="text-emerald-600 font-semibold">Copied!</span>
                    ) : (
                      <span>Copy Link</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setAssetToDelete(asset)}
                    className="text-[10px] text-red-600 hover:text-red-700 font-medium flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CONFIRMATION MODAL FOR ACCIDENTAL DELETION PREVENTION */}
      <AnimatePresence>
        {assetToDelete && (
          <div
            id="delete-confirmation-modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 overflow-hidden"
            >
              {/* Modal Top Icon & Close */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <button
                  type="button"
                  onClick={() => !isDeleting && setAssetToDelete(null)}
                  disabled={isDeleting}
                  className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-500 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Headings */}
              <h3 className="text-lg font-serif text-[#1a1a1a]">Delete Image from Storage</h3>
              <p className="text-xs text-neutral-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete this image from your media library?
              </p>

              {/* Selected Image Preview Card */}
              <div className="my-4 p-3 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-center gap-3">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-neutral-200 shrink-0 border border-neutral-200">
                  <img
                    src={assetToDelete.url}
                    alt={assetToDelete.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-[#1a1a1a] truncate">
                    {assetToDelete.name}
                  </p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">
                    {assetToDelete.category || 'General'} • {(assetToDelete.size / 1024).toFixed(0)} KB
                  </p>
                  <p className="text-[10px] text-neutral-400 truncate mt-0.5">
                    {assetToDelete.url}
                  </p>
                </div>
              </div>

              {/* Safeguard & Fallback Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 mb-6 text-[11px] text-amber-800 flex items-start gap-2.5">
                <FileImage className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Safety Fallback:</strong> If this image is currently active as a hero slide, brand logo, or product photo, references will automatically reset to safe defaults so public pages won't render broken 404 links.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  id="cancel-delete-btn"
                  onClick={() => setAssetToDelete(null)}
                  disabled={isDeleting}
                  className="px-5 py-2.5 rounded-full border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs uppercase tracking-wider font-semibold cursor-pointer transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  id="confirm-permanent-delete-btn"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-semibold shadow-md cursor-pointer transition-all disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Permanently</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

