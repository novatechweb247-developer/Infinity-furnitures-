import React, { useState, useRef } from 'react';
import { useCMS } from '../../context/CMSContext';
import { MediaAsset } from '../../types';
import { Upload, X, Check, Trash2, Search, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, asset?: MediaAsset) => void;
  currentUrl?: string;
  title?: string;
}

export function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
  currentUrl,
  title = 'Select Image',
}: MediaLibraryModalProps) {
  const { mediaAssets, uploadFile, deleteMedia, isLoadingMedia } = useCMS();
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const filteredAssets = mediaAssets.filter(
    (asset) =>
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.category && asset.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsUploading(true);
      setUploadProgress(`Uploading ${file.name}...`);
      const result = await uploadFile(file);
      if (result) {
        setSelectedAsset(result.asset);
        // Automatically select the newly uploaded asset
        onSelect(result.url, result.asset);
        onClose();
      }
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmSelect = () => {
    if (selectedAsset) {
      onSelect(selectedAsset.url, selectedAsset);
      onClose();
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteMedia(id);
    setDeleteConfirmId(null);
    if (selectedAsset?.id === id) {
      setSelectedAsset(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/75 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full h-[90vh] sm:h-[85vh] max-h-[850px] flex flex-col shadow-2xl border border-neutral-200 overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-neutral-100 flex items-center justify-between bg-[#faf9f6] shrink-0">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#b89753] font-bold block">
              Internal Storage Bucket
            </span>
            <h2 className="text-xl sm:text-2xl font-serif text-[#1a1a1a]">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-500 hover:text-black hover:bg-neutral-100 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Toolbar: Search & Direct Upload */}
        <div className="p-3.5 sm:p-5 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 bg-white shrink-0">
          <div className="relative flex-1 min-w-[200px] sm:min-w-[260px]">
            <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="media-modal-search"
              placeholder="Search media by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-full pl-11 pr-4 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
            />
          </div>
          <div className="flex items-center gap-2.5">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml,image/avif"
              className="hidden"
              id="modal-upload-input"
            />
            <button
              type="button"
              id="modal-upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="inline-flex items-center gap-2 bg-[#b89753] hover:bg-[#a38442] text-white px-4 sm:px-5 py-2 rounded-full text-xs uppercase tracking-[0.12em] font-medium shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Uploading...' : 'Upload New'}</span>
            </button>
          </div>
        </div>

        {/* Upload Progress Banner */}
        {uploadProgress && (
          <div className="bg-[#b89753]/10 border-b border-[#b89753]/30 px-6 py-2.5 flex items-center gap-3 text-xs text-[#b89753] font-medium animate-pulse shrink-0">
            <Upload className="w-4 h-4 animate-bounce" />
            <span>{uploadProgress} Saving permanently to storage...</span>
          </div>
        )}

        {/* Assets Grid & Scrollable Pane */}
        {/* Mobile viewport uses 2 columns (repeat(2, 1fr)) so images aren't squished into tight 3 columns */}
        <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 md:p-6 bg-neutral-50 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4 auto-rows-max items-start">
          {filteredAssets.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 sm:py-20 text-center">
              <div className="w-16 h-16 rounded-full bg-neutral-200/60 flex items-center justify-center text-neutral-400 mb-4">
                <ImageIcon className="w-8 h-8" />
              </div>
              <h3 className="font-serif text-lg text-[#1a1a1a] mb-1">No media found</h3>
              <p className="text-xs text-neutral-500 max-w-sm mb-6">
                Upload images directly from your computer or phone to store them permanently in the media library.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 bg-[#1a1a1a] text-white px-6 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] cursor-pointer hover:bg-[#b89753] transition-all"
              >
                <Upload className="w-4 h-4" />
                <span>Upload First Image</span>
              </button>
            </div>
          ) : (
            filteredAssets.map((asset) => {
              const isSelected = selectedAsset?.id === asset.id || currentUrl === asset.url;
              return (
                <div
                  key={asset.id}
                  id={`media-picker-item-${asset.id}`}
                  onClick={() => setSelectedAsset(asset)}
                  onDoubleClick={() => {
                    setSelectedAsset(asset);
                    onSelect(asset.url, asset);
                    onClose();
                  }}
                  className={`group relative rounded-2xl overflow-hidden border-2 bg-white cursor-pointer transition-all flex flex-col shadow-xs hover:shadow-md ${
                    isSelected
                      ? 'border-[#b89753] ring-4 ring-[#b89753]/25 shadow-lg'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {/* Top Section: Full Image Thumbnail with standard vertical 1:1 aspect ratio */}
                  <div className="relative w-full aspect-square min-h-[120px] overflow-hidden bg-neutral-100 shrink-0">
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover block transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />

                    {/* Active Selection Checkmark Outline Badge */}
                    {isSelected && (
                      <div className="absolute top-2 right-2 z-20 w-7 h-7 rounded-full bg-[#b89753] text-white flex items-center justify-center shadow-md">
                        <Check className="w-4 h-4 stroke-[2.5]" />
                      </div>
                    )}

                    {/* Delete Protection Confirmation Button */}
                    <div className="absolute top-2 left-2 z-20">
                      {deleteConfirmId === asset.id ? (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="bg-red-600 text-white text-[10px] px-2 py-1 rounded-xl shadow-lg flex items-center gap-1.5 animate-scale-in"
                        >
                          <span className="font-semibold">Delete?</span>
                          <button
                            type="button"
                            onClick={(e) => handleDelete(asset.id, e)}
                            className="bg-white text-red-600 px-2 py-0.5 rounded-full font-bold hover:bg-neutral-100 cursor-pointer shadow-xs"
                          >
                            Yes
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirmId(null);
                            }}
                            className="text-white hover:underline px-1 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(asset.id);
                          }}
                          title="Delete image permanently"
                          aria-label={`Delete image ${asset.name}`}
                          className="w-7 h-7 rounded-full bg-white/95 text-red-600 hover:bg-red-600 hover:text-white border border-neutral-200 hover:border-red-600 shadow-sm flex items-center justify-center transition-all cursor-pointer opacity-85 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Bottom Section: Separated File Name, Uploads Label, and File Size Container */}
                  <div className="p-3 bg-white flex-1 flex flex-col justify-between border-t border-neutral-100 gap-2">
                    <div className="min-w-0">
                      <p
                        className="text-xs font-semibold text-[#1a1a1a] truncate leading-tight"
                        title={asset.name}
                      >
                        {asset.name}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-1.5 text-[10px] text-neutral-400">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-neutral-100 text-neutral-600 font-medium text-[9px] uppercase tracking-wider truncate max-w-[85px]">
                        {asset.category || 'Uploads'}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] text-neutral-400">
                        {(asset.size / 1024).toFixed(0)} KB
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-5 border-t border-neutral-200 bg-white flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-neutral-500 truncate max-w-md hidden sm:block">
            {selectedAsset ? (
              <span>
                Selected: <strong className="text-[#1a1a1a]">{selectedAsset.name}</strong>{' '}
                <span className="text-neutral-400">({(selectedAsset.size / 1024).toFixed(0)} KB)</span>
              </span>
            ) : (
              <span>Select an image or upload directly from your device.</span>
            )}
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-neutral-300 text-neutral-700 hover:bg-neutral-100 text-xs uppercase tracking-[0.15em] font-medium cursor-pointer transition-all"
            >
              Cancel
            </button>
            <button
              type="button"
              id="confirm-select-image-btn"
              onClick={handleConfirmSelect}
              disabled={!selectedAsset}
              className="inline-flex items-center gap-2 bg-[#1a1a1a] hover:bg-[#b89753] disabled:opacity-40 disabled:cursor-not-allowed text-white px-6 sm:px-8 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-medium shadow-md transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Use This Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
