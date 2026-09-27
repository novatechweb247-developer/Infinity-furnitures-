import React, { useState, useRef } from 'react';
import { useCMS } from '../../context/CMSContext';
import { validateImageFile } from '../../utils/imageUtils';
import { Upload, Trash2, Image as ImageIcon, Loader2, AlertCircle, Link2 } from 'lucide-react';

interface ImageFieldProps {
  label: string;
  value: string;
  onChange: (url: string) => void;
  helperText?: string;
  category?: string;
}

export function ImageField({ label, value, onChange, helperText, category = 'General' }: ImageFieldProps) {
  const { uploadFile } = useCMS();
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [customUrl, setCustomUrl] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setErrorMessage(null);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid file format or size.');
      return;
    }

    try {
      setIsUploading(true);
      const result = await uploadFile(file, category);
      if (result && result.url) {
        onChange(result.url);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload image directly to storage.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDirectUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    await processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrl.trim()) {
      onChange(customUrl.trim());
      setCustomUrl('');
      setShowUrlInput(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs uppercase tracking-[0.15em] font-semibold text-neutral-700">
          {label}
        </label>
        {value && (
          <span className="text-[10px] text-emerald-600 font-medium">✓ Image Attached</span>
        )}
      </div>

      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 border rounded-2xl transition-all ${
          isDragging
            ? 'border-[#b89753] bg-[#b89753]/10 ring-2 ring-[#b89753]/30'
            : 'border-neutral-200 bg-[#faf9f6]'
        }`}
      >
        {/* Thumbnail Preview */}
        <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border-2 border-dashed border-neutral-300 shadow-xs flex items-center justify-center group">
          {isUploading ? (
            <div className="flex flex-col items-center justify-center text-[#b89753] p-2 text-center">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-[9px] uppercase tracking-wider font-semibold mt-1">Uploading</span>
            </div>
          ) : value ? (
            <>
              <img src={value} alt={label} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange('');
                }}
                title="Remove Image"
                className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center shadow-md transition-all cursor-pointer hover:scale-110"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="text-neutral-400 flex flex-col items-center justify-center p-2 text-center cursor-pointer hover:text-[#b89753] transition-colors w-full h-full"
            >
              <ImageIcon className="w-7 h-7 stroke-[1.5] mb-1 opacity-70" />
              <span className="text-[9px] uppercase font-semibold tracking-wider">No Image</span>
              <span className="text-[8px] text-neutral-400">Click to upload</span>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex-1 space-y-2.5 w-full">
          <div className="flex flex-wrap items-center gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleDirectUpload}
              accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-1.5 bg-[#b89753] hover:bg-[#a38442] text-white px-4 py-2 rounded-full text-xs font-medium uppercase tracking-[0.1em] shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              <span>{isUploading ? 'Uploading...' : 'Direct Upload'}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="inline-flex items-center gap-1.5 bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 px-4 py-2 rounded-full text-xs font-medium uppercase tracking-[0.1em] shadow-xs transition-all cursor-pointer"
            >
              <Link2 className="w-3.5 h-3.5 text-[#b89753]" />
              <span>Link URL</span>
            </button>

            {value && (
              <button
                type="button"
                onClick={() => onChange('')}
                disabled={isUploading}
                className="inline-flex items-center gap-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3.5 py-2 rounded-full text-xs font-medium transition-all cursor-pointer"
                title="Remove image"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Image</span>
              </button>
            )}
          </div>

          {showUrlInput && (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://images.unsplash.com/... or storage URL"
                className="flex-1 bg-white border border-neutral-300 rounded-xl px-3 py-1.5 text-xs text-neutral-800 focus:outline-none focus:border-[#b89753]"
              />
              <button
                type="button"
                onClick={handleApplyCustomUrl}
                className="bg-[#1a1a1a] text-white px-3 py-1.5 rounded-xl text-xs font-medium hover:bg-neutral-800 cursor-pointer"
              >
                Apply
              </button>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="text-[11px] text-neutral-500 truncate max-w-md">
            {value ? (
              <span className="font-mono text-[10px] text-neutral-600 truncate block" title={value}>
                {value}
              </span>
            ) : (
              <span>{helperText || 'Drag and drop or upload directly from your device (JPG, PNG, WebP, max 15MB).'}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
