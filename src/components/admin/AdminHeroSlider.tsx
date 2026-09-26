import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { HeroSlide } from '../../types';
import { ImageField } from './ImageField';
import { Plus, Trash2, ChevronUp, ChevronDown, Eye, Sliders } from 'lucide-react';

export function AdminHeroSlider() {
  const { draftContent, saveHeroSlides } = useCMS();
  const slides = draftContent.heroSlides;
  const [editingId, setEditingId] = useState<string | null>(slides[0]?.id || null);

  const handleUpdateSlide = (id: string, updates: Partial<HeroSlide>) => {
    const updated = slides.map((s) => (s.id === id ? { ...s, ...updates } : s));
    saveHeroSlides(updated);
  };

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: `hero-${Date.now()}`,
      title: 'New Headline Statement',
      subtitle: 'Luxury Collection',
      tagline: 'Custom hand-crafted furniture built for timeless architecture.',
      description: 'Handcrafted solid joinery and refined contemporary aesthetics.',
      image: '',
      active: true,
      order: slides.length + 1,
    };
    saveHeroSlides([...slides, newSlide]);
    setEditingId(newSlide.id);
  };

  const handleDeleteSlide = (id: string) => {
    if (slides.length <= 1) {
      alert('You must have at least one hero slide.');
      return;
    }
    const updated = slides.filter((s) => s.id !== id);
    saveHeroSlides(updated);
    if (editingId === id) {
      setEditingId(updated[0]?.id || null);
    }
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= slides.length) return;
    const updated = [...slides];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    // update order property
    updated.forEach((s, idx) => (s.order = idx + 1));
    saveHeroSlides(updated);
  };

  const activeEditingSlide = slides.find((s) => s.id === editingId) || slides[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#b89753] block">
            Visual Experience
          </span>
          <h2 className="text-2xl font-serif text-[#1a1a1a]">Hero Background Slides</h2>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Configure the full-screen carousel slides shown at the top of the homepage.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAddSlide}
          className="inline-flex items-center gap-2 bg-[#b89753] hover:bg-[#a38442] text-white px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-medium shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Slide</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Slide List Sidebar */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs uppercase tracking-wider text-neutral-400 font-semibold block px-1">
            Slides ({slides.length})
          </span>
          {slides.map((slide, index) => {
            const isSelected = slide.id === editingId;
            return (
              <div
                key={slide.id}
                onClick={() => setEditingId(slide.id)}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between gap-3 bg-white ${
                  isSelected
                    ? 'border-[#b89753] ring-4 ring-[#b89753]/15 shadow-sm'
                    : 'border-neutral-200 hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200 flex items-center justify-center">
                    {slide.image ? (
                      <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[8px] uppercase font-semibold text-neutral-400">No Image</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-semibold text-[#1a1a1a] truncate">{slide.title}</h4>
                    <p className="text-[11px] text-neutral-400 truncate">{slide.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-neutral-400 hover:text-black disabled:opacity-20 cursor-pointer"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === slides.length - 1}
                    className="p-1 text-neutral-400 hover:text-black disabled:opacity-20 cursor-pointer"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSlide(slide.id)}
                    className="p-1 text-neutral-400 hover:text-red-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Slide Edit Form */}
        {activeEditingSlide && (
          <div className="lg:col-span-8 bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
              <h3 className="text-lg font-serif text-[#1a1a1a]">Editing Slide: {activeEditingSlide.title}</h3>
              <label className="flex items-center gap-2 cursor-pointer text-xs uppercase tracking-wider text-neutral-600 font-medium">
                <input
                  type="checkbox"
                  checked={activeEditingSlide.active !== false}
                  onChange={(e) => handleUpdateSlide(activeEditingSlide.id, { active: e.target.checked })}
                  className="rounded text-[#b89753] focus:ring-[#b89753]"
                />
                <span>Active on live site</span>
              </label>
            </div>

            <ImageField
              label="Background Image (Ultra HD)"
              value={activeEditingSlide.image}
              onChange={(url) => handleUpdateSlide(activeEditingSlide.id, { image: url })}
              helperText="High-resolution architecture or furniture photography (minimum 1920x1080)."
              category="Hero Slides"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
                  Pre-Heading / Tag
                </label>
                <input
                  type="text"
                  value={activeEditingSlide.subtitle || ''}
                  onChange={(e) => handleUpdateSlide(activeEditingSlide.id, { subtitle: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
                  placeholder="e.g. Master Bedroom"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={activeEditingSlide.tagline || ''}
                  onChange={(e) => handleUpdateSlide(activeEditingSlide.id, { tagline: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
                  placeholder="e.g. Custom Wardrobe & Joinery"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
                Main Title
              </label>
              <input
                type="text"
                value={activeEditingSlide.title}
                onChange={(e) => handleUpdateSlide(activeEditingSlide.id, { title: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm font-serif text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
                placeholder="e.g. Infinity Furnitures and Interior World Nigeria Limited"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
                Description / Paragraph
              </label>
              <textarea
                rows={3}
                value={activeEditingSlide.description || ''}
                onChange={(e) => handleUpdateSlide(activeEditingSlide.id, { description: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753] resize-none"
                placeholder="Brief narrative text shown over the slide."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
