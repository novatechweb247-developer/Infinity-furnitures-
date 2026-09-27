import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { HeroSlide } from '../../types';
import { ImageField } from './ImageField';
import { Plus, Trash2, ChevronUp, ChevronDown, UploadCloud, CheckCircle2, Sliders } from 'lucide-react';

export function AdminHeroSlider() {
  const { draftContent, saveHeroSlides, publishDraft, isPublishing, showNotification } = useCMS();
  const slides = draftContent.heroSlides;
  const [editingId, setEditingId] = useState<string | null>(slides[0]?.id || null);
  const [isPublishingLocal, setIsPublishingLocal] = useState(false);
  const [justPublished, setJustPublished] = useState(false);

  const handleUpdateSlide = (id: string, updates: Partial<HeroSlide>) => {
    const updated = slides.map((s) => (s.id === id ? { ...s, ...updates } : s));
    saveHeroSlides(updated);
  };

  const handlePublishLiveNow = async () => {
    setIsPublishingLocal(true);
    const success = await publishDraft();
    setIsPublishingLocal(false);
    if (success) {
      setJustPublished(true);
      showNotification('✅ Hero slides published live across all devices!', 'success');
      setTimeout(() => setJustPublished(false), 4000);
    }
  };

  const handleAddSlide = () => {
    const newSlide: HeroSlide = {
      id: `hero-${Date.now()}`,
      overline: 'Infinity Furnitures & Interior World',
      title: 'Bespoke Luxury Living',
      subtitle: 'Exceptional furniture and interior solutions crafted with timeless elegance.',
      description: 'Exceptional furniture and interior solutions crafted with timeless elegance.',
      tagline: 'Custom hand-crafted furniture built for timeless architecture.',
      primaryCtaText: 'Explore Collection',
      primaryCtaAction: 'collection',
      secondaryCtaText: 'Contact Us',
      secondaryCtaAction: 'contact',
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=85',
      enabled: true,
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
            Configure full-screen carousel slides. Click "Publish Changes Live" to update the live public site on all devices.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAddSlide}
            className="inline-flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-[#1a1a1a] px-4 py-2.5 rounded-full text-xs uppercase tracking-[0.12em] font-medium shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Slide</span>
          </button>

          <button
            type="button"
            onClick={handlePublishLiveNow}
            disabled={isPublishing || isPublishingLocal}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.12em] font-medium transition-all shadow-md cursor-pointer ${
              justPublished
                ? 'bg-emerald-600 text-white'
                : 'bg-[#b89753] hover:bg-[#a68645] text-white active:scale-95'
            } disabled:opacity-50`}
          >
            {justPublished ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Published Live!</span>
              </>
            ) : isPublishing || isPublishingLocal ? (
              <>
                <UploadCloud className="w-4 h-4 animate-bounce" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                <span>Publish Changes Live</span>
              </>
            )}
          </button>
        </div>
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
                    <p className="text-[11px] text-neutral-400 truncate">{slide.overline || slide.subtitle}</p>
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
                  checked={activeEditingSlide.enabled !== false && activeEditingSlide.active !== false}
                  onChange={(e) => handleUpdateSlide(activeEditingSlide.id, { enabled: e.target.checked, active: e.target.checked })}
                  className="rounded text-[#b89753] focus:ring-[#b89753]"
                />
                <span>Active on live site</span>
              </label>
            </div>

            <ImageField
              label="Background Image (Ultra HD)"
              value={activeEditingSlide.image}
              onChange={(url) => handleUpdateSlide(activeEditingSlide.id, { image: url })}
              helperText="High-resolution architecture or furniture photography (stored permanently in media storage bucket)."
              category="Hero Slides"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
                  Pre-Heading / Tag (Overline)
                </label>
                <input
                  type="text"
                  value={activeEditingSlide.overline || activeEditingSlide.tagline || ''}
                  onChange={(e) => handleUpdateSlide(activeEditingSlide.id, { overline: e.target.value, tagline: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
                  placeholder="e.g. Master Bedroom"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
                  Main Headline
                </label>
                <input
                  type="text"
                  value={activeEditingSlide.title}
                  onChange={(e) => handleUpdateSlide(activeEditingSlide.id, { title: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm font-serif text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
                  placeholder="e.g. Design your space differently."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
                Narrative Description / Subtitle
              </label>
              <textarea
                rows={3}
                value={activeEditingSlide.subtitle || activeEditingSlide.description || ''}
                onChange={(e) => handleUpdateSlide(activeEditingSlide.id, { subtitle: e.target.value, description: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753] resize-none"
                placeholder="Narrative statement displayed prominently below the main title."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
                  Primary Button Text
                </label>
                <input
                  type="text"
                  value={activeEditingSlide.primaryCtaText || ''}
                  onChange={(e) => handleUpdateSlide(activeEditingSlide.id, { primaryCtaText: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
                  placeholder="e.g. Explore Collection"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
                  Secondary Button Text
                </label>
                <input
                  type="text"
                  value={activeEditingSlide.secondaryCtaText || ''}
                  onChange={(e) => handleUpdateSlide(activeEditingSlide.id, { secondaryCtaText: e.target.value })}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
                  placeholder="e.g. Contact Us"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-end">
              <button
                type="button"
                onClick={handlePublishLiveNow}
                disabled={isPublishing || isPublishingLocal}
                className="inline-flex items-center gap-2 bg-[#b89753] hover:bg-[#a68645] text-white px-6 py-3 rounded-xl text-xs uppercase tracking-[0.12em] font-medium shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <UploadCloud className="w-4 h-4" />
                <span>{isPublishing || isPublishingLocal ? 'Publishing...' : 'Publish Hero Slides Live'}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
