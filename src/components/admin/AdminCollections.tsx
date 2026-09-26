import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { CollectionItem } from '../../types';
import { ImageField } from './ImageField';
import { Plus, Trash2 } from 'lucide-react';

export function AdminCollections() {
  const { draftContent, updateDraft } = useCMS();
  const collections = draftContent.collections;

  const handleUpdate = (id: string, updates: Partial<CollectionItem>) => {
    const updated = collections.map((c) => (c.id === id ? { ...c, ...updates } : c));
    updateDraft({ collections: updated });
  };

  const handleAdd = () => {
    const newNum = String(collections.length + 1).padStart(2, '0');
    const newCol: CollectionItem = {
      id: `col-${Date.now()}`,
      number: newNum,
      title: 'New Collection',
      description: 'Exclusive joinery and bespoke custom craft.',
      image: '',
      features: ['Handcrafted', 'Solid Hardwood', 'Custom Finish'],
    };
    updateDraft({ collections: [...collections, newCol] });
  };

  const handleDelete = (id: string) => {
    if (collections.length <= 1) {
      alert('At least one collection is required.');
      return;
    }
    const updated = collections.filter((c) => c.id !== id);
    updateDraft({ collections: updated });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#b89753] block">
            Showcase
          </span>
          <h2 className="text-2xl font-serif text-[#1a1a1a]">Collection Highlight Cards</h2>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Featured collection sections displayed on the homepage with interactive highlights.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-2 bg-[#b89753] hover:bg-[#a38442] text-white px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-medium shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Collection</span>
        </button>
      </div>

      <div className="space-y-6">
        {collections.map((col, idx) => (
          <div
            key={col.id}
            className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
          >
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <div className="flex items-center gap-3">
                <span className="font-serif text-[#b89753] font-bold text-lg">{col.number}</span>
                <h3 className="font-serif text-xl text-[#1a1a1a]">{col.title}</h3>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(col.id)}
                className="text-neutral-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <ImageField
              label="Collection Feature Imagery"
              value={col.image}
              onChange={(url) => handleUpdate(col.id, { image: url })}
              category="Collections"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
                  Number
                </label>
                <input
                  type="text"
                  value={col.number}
                  onChange={(e) => handleUpdate(col.id, { number: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
                  Collection Title
                </label>
                <input
                  type="text"
                  value={col.title}
                  onChange={(e) => handleUpdate(col.id, { title: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
                Narrative Description
              </label>
              <textarea
                rows={3}
                value={col.description}
                onChange={(e) => handleUpdate(col.id, { description: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
                Key Features (comma-separated)
              </label>
              <input
                type="text"
                value={col.features.join(', ')}
                onChange={(e) =>
                  handleUpdate(col.id, {
                    features: e.target.value.split(',').map((f) => f.trim()).filter(Boolean),
                  })
                }
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
                placeholder="e.g. Soft-close drawers, Integrated LED, Natural grain matching"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
