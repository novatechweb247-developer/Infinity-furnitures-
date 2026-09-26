import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { InteriorService } from '../../types';
import { ImageField } from './ImageField';
import { Plus, Trash2 } from 'lucide-react';

export function AdminInteriors() {
  const { draftContent, saveServices } = useCMS();
  const services = draftContent.services;

  const handleUpdate = (id: string, updates: Partial<InteriorService>) => {
    const updated = services.map((s) => (s.id === id ? { ...s, ...updates } : s));
    saveServices(updated);
  };

  const handleAdd = () => {
    const newService: InteriorService = {
      id: `service-${Date.now()}`,
      title: 'New Architectural Service',
      description: 'Comprehensive design, bespoke spatial layouts, and premium fabrication.',
      image: '',
    };
    saveServices([...services, newService]);
  };

  const handleDelete = (id: string) => {
    if (services.length <= 1) {
      alert('At least one interior service is required.');
      return;
    }
    const updated = services.filter((c) => c.id !== id);
    saveServices(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#b89753] block">
            Spatial Design
          </span>
          <h2 className="text-2xl font-serif text-[#1a1a1a]">Interior Design Services</h2>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Display your bespoke architectural interior services and showroom capabilities.
          </p>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          className="inline-flex items-center gap-2 bg-[#b89753] hover:bg-[#a38442] text-white px-5 py-2.5 rounded-full text-xs uppercase tracking-[0.15em] font-medium shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {services.map((srv) => (
          <div
            key={srv.id}
            className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="font-serif text-lg text-[#1a1a1a]">{srv.title}</h3>
              <button
                type="button"
                onClick={() => handleDelete(srv.id)}
                className="text-neutral-400 hover:text-red-600 transition-colors p-1 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <ImageField
              label="Service Showcase Photography"
              value={srv.image}
              onChange={(url) => handleUpdate(srv.id, { image: url })}
              category="Interior Services"
            />

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
                Service Title
              </label>
              <input
                type="text"
                value={srv.title}
                onChange={(e) => handleUpdate(srv.id, { title: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
                Scope & Description
              </label>
              <textarea
                rows={3}
                value={srv.description}
                onChange={(e) => handleUpdate(srv.id, { description: e.target.value })}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753] resize-none"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
