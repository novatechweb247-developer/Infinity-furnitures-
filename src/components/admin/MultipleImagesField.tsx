import React, { useState, useRef } from 'react';
import { useCMS } from '../../context/CMSContext';
import { MediaLibraryModal } from './MediaLibraryModal';
import { Upload, FolderOpen, Trash2, Star, ChevronLeft, ChevronRight, Plus } from 'lucide-react';

interface MultipleImagesFieldProps {
  label: string;
  images: string[];
  primaryImage: string;
  onChange: (images: string[], primaryImage: string) => void;
  category?: string;
}

export function MultipleImagesField({
  label,
  images,
  primaryImage,
  onChange,
  category = 'Products',
}: MultipleImagesFieldProps) {
  const { uploadFile } = useCMS();
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBatchUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      setIsUploading(true);
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const result = await uploadFile(files[i], category);
        if (result && result.url) newUrls.push(result.url);
      }
      if (newUrls.length > 0) {
        const cleanOld = images.filter((img) => Boolean(img) && !newUrls.includes(img));
        const updated = [...newUrls, ...cleanOld];
        const newPrimary = newUrls[0];
        onChange(updated, newPrimary);
      }
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSelectFromLibrary = (url: string) => {
    if (!url) return;
    const cleanOld = images.filter((img) => img !== url);
    const updated = [url, ...cleanOld];
    onChange(updated, url);
  };

  const handleRemove = (index: number) => {
    const removedUrl = images[index];
    const updated = images.filter((_, i) => i !== index);
    let newPrimary = primaryImage;
    if (removedUrl === primaryImage || !updated.includes(primaryImage)) {
      newPrimary = updated[0] || '';
    }
    onChange(updated, newPrimary);
  };

  const handleSetPrimary = (url: string) => {
    if (!url) return;
    const cleanOld = images.filter((img) => img !== url);
    const updated = [url, ...cleanOld];
    onChange(updated, url);
  };

  const handleMove = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    onChange(updated, primaryImage);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <label className="block text-xs uppercase tracking-[0.15em] font-semibold text-neutral-700">
            {label}
          </label>
          <span className="text-[11px] text-neutral-500">
            Click Star to set primary cover photo. Reorder with arrows.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleBatchUpload}
            multiple
            accept="image/*"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="inline-flex items-center gap-1.5 bg-[#b89753] hover:bg-[#a38442] text-white px-3.5 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-[0.1em] shadow-xs transition-all cursor-pointer disabled:opacity-50"
          >
            <Upload className="w-3 h-3" />
            <span>{isUploading ? 'Uploading...' : 'Upload Files'}</span>
          </button>
          <button
            type="button"
            onClick={() => setIsMediaModalOpen(true)}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 px-3.5 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-[0.1em] shadow-xs transition-all cursor-pointer"
          >
            <FolderOpen className="w-3 h-3 text-[#b89753]" />
            <span>From Library</span>
          </button>
        </div>
      </div>

      {images.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-neutral-300 rounded-2xl p-10 text-center bg-[#faf9f6] hover:border-[#b89753] hover:bg-[#b89753]/5 transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-full bg-neutral-200/60 group-hover:bg-[#b89753]/20 group-hover:text-[#b89753] text-neutral-400 mx-auto flex items-center justify-center transition-all mb-3">
            <Upload className="w-6 h-6" />
          </div>
          <p className="text-xs text-neutral-700 font-semibold uppercase tracking-wider">No images selected yet</p>
          <p className="text-[11px] text-neutral-500 mt-1">
            Drag and drop multi-angle photographs here or click to browse files
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.map((img, idx) => {
            const isPrimary = img === primaryImage;
            return (
              <div
                key={idx}
                className={`relative rounded-2xl overflow-hidden bg-neutral-100 border-2 group transition-all ${
                  isPrimary
                    ? 'border-[#b89753] ring-2 ring-[#b89753]/30 shadow-md'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img src={img} alt={`Product ${idx + 1}`} className="w-full h-full object-cover" />
                  {isPrimary && (
                    <div className="absolute top-2 left-2 bg-[#b89753] text-white text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full shadow-xs">
                      Primary
                    </div>
                  )}

                  {/* Explicit Top Right Delete Button (Always Visible & Prominent on Hover) */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(idx);
                    }}
                    title="Remove / Delete Image"
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition-all cursor-pointer hover:scale-110 z-10"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Hover Action Overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                    <div className="flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(img)}
                        title={isPrimary ? 'Current Primary' : 'Set as Primary Cover'}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                          isPrimary
                            ? 'bg-[#b89753] text-white'
                            : 'bg-white/90 text-neutral-700 hover:bg-[#b89753] hover:text-white'
                        }`}
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                      </button>
                      <div className="w-7 h-7" />
                    </div>

                    {/* Reorder Arrows */}
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 'left')}
                        disabled={idx === 0}
                        title="Move left"
                        className="w-6 h-6 rounded-full bg-white/90 text-neutral-800 flex items-center justify-center disabled:opacity-30 cursor-pointer hover:bg-white"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(idx, 'right')}
                        disabled={idx === images.length - 1}
                        title="Move right"
                        className="w-6 h-6 rounded-full bg-white/90 text-neutral-800 flex items-center justify-center disabled:opacity-30 cursor-pointer hover:bg-white"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Quick Add Square */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square border-2 border-dashed border-neutral-300 rounded-2xl flex flex-col items-center justify-center text-neutral-400 hover:text-[#b89753] hover:border-[#b89753] bg-[#faf9f6] transition-colors cursor-pointer"
          >
            <Plus className="w-6 h-6" />
            <span className="text-[10px] uppercase tracking-wider font-semibold mt-1">Add Image</span>
          </button>
        </div>
      )}

      <MediaLibraryModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelect={handleSelectFromLibrary}
        title="Select Product Image from Library"
      />
    </div>
  );
}
