import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { Testimonial } from '../../types';
import { Plus, Trash2, Star } from 'lucide-react';

export function AdminTestimonials() {
  const { draftContent, saveTestimonials } = useCMS();
  const testimonials = draftContent.testimonials;

  const handleUpdate = (id: string, updates: Partial<Testimonial>) => {
    const updated = testimonials.map((t) => (t.id === id ? { ...t, ...updates } : t));
    saveTestimonials(updated);
  };

  const handleAdd = () => {
    const newTestimonial: Testimonial = {
      id: `test-${Date.now()}`,
      clientName: 'New Client',
      roleOrLocation: 'Jos, Plateau State',
      clientRole: 'Jos, Plateau State',
      text: 'The joinery and finish completely elevated our living room space.',
      quote: 'The joinery and finish completely elevated our living room space.',
      rating: 5,
      enabled: true,
      order: testimonials.length + 1,
    };
    saveTestimonials([...testimonials, newTestimonial]);
  };

  const handleDelete = (id: string) => {
    const updated = testimonials.filter((t) => t.id !== id);
    saveTestimonials(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#b89753] block">
            Social Proof
          </span>
          <h2 className="text-2xl font-serif text-[#1a1a1a]">Client Testimonials</h2>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Display genuine reviews from interior architects, residential clients, and commercial developers.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-2 bg-[#b89753] hover:bg-[#a38442] text-white px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-medium shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Testimonial</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {testimonials.map((t) => {
          const clientLoc = t.roleOrLocation || t.clientRole || '';
          const quoteText = t.text || t.quote || '';
          return (
            <div
              key={t.id}
              className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(t.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(t.id)}
                  className="text-neutral-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    value={t.clientName}
                    onChange={(e) => handleUpdate(t.id, { clientName: e.target.value })}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                    Role / Location
                  </label>
                  <input
                    type="text"
                    value={clientLoc}
                    onChange={(e) =>
                      handleUpdate(t.id, {
                        roleOrLocation: e.target.value,
                        clientRole: e.target.value,
                      })
                    }
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
                    placeholder="e.g. Architect, Jos, Plateau State"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-1">
                  Client Quote
                </label>
                <textarea
                  rows={3}
                  value={quoteText}
                  onChange={(e) =>
                    handleUpdate(t.id, {
                      text: e.target.value,
                      quote: e.target.value,
                    })
                  }
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-3 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753] resize-none leading-relaxed"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
