import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { GalleryImage } from '../../types';
import { ImageField } from './ImageField';
import { Plus, Trash2 } from 'lucide-react';

export function AdminGallery() {
  const { draftContent, saveGallery } = useCMS();
  const gallery = draftContent.gallery || [];

  const handleUpdate = (id: string, updates: Partial<GalleryImage>) => {
    const updated = gallery.map((g) => (g.id === id ? { ...g, ...updates } : g));
    saveGallery(updated);
  };

  const handleAdd = () => {
    const newImg: GalleryImage = {
      id: `gal-${Date.now()}`,
      title: 'Architectural Installation',
      category: 'Residential',
      image: '',
    };
    saveGallery([newImg, ...gallery]);
  };

  const handleDelete = (id: string) => {
    const updated = gallery.filter((g) => g.id !== id);
    saveGallery(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#b89753] block">
            Portfolio
          </span>
          <h2 className="text-2xl font-serif text-[#1a1a1a]">Gallery Showcase</h2>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Display completed installations, architectural joinery, and showroom photography.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-2 bg-[#b89753] hover:bg-[#a38442] text-white px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-medium shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Photo</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {gallery.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-neutral-200 rounded-3xl p-5 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider font-semibold text-[#b89753]">
                {item.category}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(item.id)}
                className="text-neutral-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <ImageField
              label="Gallery Image"
              value={item.image}
              onChange={(url) => handleUpdate(item.id, { image: url })}
              category="Gallery"
            />

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                Title / Caption
              </label>
              <input
                type="text"
                value={item.title}
                onChange={(e) => handleUpdate(item.id, { title: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                Category
              </label>
              <input
                type="text"
                value={item.category}
                onChange={(e) => handleUpdate(item.id, { category: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
                placeholder="e.g. Residential, Hospitality, Kitchen"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
