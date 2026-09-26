import React from 'react';
import { useCMS } from '../../context/CMSContext';
import { Category } from '../../types';
import { ImageField } from './ImageField';
import { Plus, Trash2, Layers } from 'lucide-react';

export function AdminCategories() {
  const { draftContent, saveCategories } = useCMS();
  const categories = draftContent.categories;

  const handleUpdate = (id: string, updates: Partial<Category>) => {
    const updated = categories.map((c) => (c.id === id ? { ...c, ...updates } : c));
    saveCategories(updated);
  };

  const handleAdd = () => {
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: 'New Category',
      slug: `category-${Date.now()}`,
      description: 'Handcrafted bespoke collections',
      image: '',
    };
    saveCategories([...categories, newCat]);
  };

  const handleDelete = (id: string) => {
    if (categories.length <= 1) {
      alert('At least one category is required.');
      return;
    }
    const updated = categories.filter((c) => c.id !== id);
    saveCategories(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#b89753] block">
            Taxonomy
          </span>
          <h2 className="text-2xl font-serif text-[#1a1a1a]">Furniture Categories</h2>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Organize products into living, dining, executive office, and bedroom spaces.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-2 bg-[#b89753] hover:bg-[#a38442] text-white px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-medium shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((c) => (
          <div
            key={c.id}
            className="bg-white border border-neutral-200 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <div className="flex items-center gap-2 text-[#b89753]">
                  <Layers className="w-4 h-4" />
                  <span className="text-xs font-mono uppercase text-neutral-400">{c.slug || c.id}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  className="text-neutral-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <ImageField
                label="Category Cover Imagery"
                value={c.image || ''}
                onChange={(url) => handleUpdate(c.id, { image: url })}
                category="Categories"
              />

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                  Category Name
                </label>
                <input
                  type="text"
                  value={c.name}
                  onChange={(e) => handleUpdate(c.id, { name: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                  URL Identifier / Slug
                </label>
                <input
                  type="text"
                  value={c.slug || ''}
                  onChange={(e) => handleUpdate(c.id, { slug: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
                  placeholder="e.g. living-room"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                  Short Narrative
                </label>
                <textarea
                  rows={2}
                  value={c.description || ''}
                  onChange={(e) => handleUpdate(c.id, { description: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753] resize-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
