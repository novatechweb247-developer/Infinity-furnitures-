import React from 'react';
import { useCMS } from '../../context/CMSContext';
import { ImageField } from './ImageField';

export function AdminHomepage() {
  const { draftContent, updateHomepage } = useCMS();
  const hp = draftContent.homepage;

  const brandStatementHeadline =
    typeof hp.brandStatement === 'string'
      ? hp.brandStatement
      : hp.brandStatement?.headline || '';

  return (
    <div className="space-y-8">
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#b89753] block">
          Editorial Design
        </span>
        <h2 className="text-2xl font-serif text-[#1a1a1a]">Homepage Sections</h2>
        <p className="text-xs text-neutral-500 font-light mt-1">
          Customize the introduction narrative, quote banners, and calls-to-action on the homepage.
        </p>
      </div>

      {/* Intro Section */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-lg font-serif text-[#1a1a1a] pb-3 border-b border-neutral-100">
          Section 1: Introduction & Brand Manifesto
        </h3>

        <ImageField
          label="Featured Craft Image"
          value={hp.introImage || ''}
          onChange={(url) => updateHomepage({ introImage: url })}
          category="Homepage"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
              Eyebrow Subtitle
            </label>
            <input
              type="text"
              value={hp.introOverline || ''}
              onChange={(e) => updateHomepage({ introOverline: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
              Main Headline
            </label>
            <input
              type="text"
              value={hp.introHeading || ''}
              onChange={(e) => updateHomepage({ introHeading: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
            Narrative Paragraph 1
          </label>
          <textarea
            rows={3}
            value={hp.introText1 || ''}
            onChange={(e) => updateHomepage({ introText1: e.target.value })}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753] resize-none"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
            Highlighted Quote (Italic block)
          </label>
          <textarea
            rows={2}
            value={hp.introQuote || ''}
            onChange={(e) => updateHomepage({ introQuote: e.target.value })}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753] resize-none"
          />
        </div>
      </div>

      {/* Brand Statement Banner */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-lg font-serif text-[#1a1a1a] pb-3 border-b border-neutral-100">
          Section 2: Brand Statement Banner
        </h3>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
            Centerpiece Quote Headline
          </label>
          <input
            type="text"
            value={brandStatementHeadline}
            onChange={(e) => updateHomepage({ brandStatement: e.target.value })}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm font-serif text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
            Sub-label text
          </label>
          <input
            type="text"
            value={hp.brandSubline || ''}
            onChange={(e) => updateHomepage({ brandSubline: e.target.value })}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
          />
        </div>
      </div>

      {/* CTA Banner */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-lg font-serif text-[#1a1a1a] pb-3 border-b border-neutral-100">
          Section 3: Bottom Call-To-Action Banner
        </h3>

        <ImageField
          label="Background Wallpaper Image"
          value={hp.ctaBgImage || ''}
          onChange={(url) => updateHomepage({ ctaBgImage: url })}
          category="Homepage"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
              Eyebrow Subtitle
            </label>
            <input
              type="text"
              value={hp.ctaOverline || ''}
              onChange={(e) => updateHomepage({ ctaOverline: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
              Action Button Text
            </label>
            <input
              type="text"
              value={hp.ctaButtonText || ''}
              onChange={(e) => updateHomepage({ ctaButtonText: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
            Main Heading
          </label>
          <input
            type="text"
            value={hp.ctaHeading || ''}
            onChange={(e) => updateHomepage({ ctaHeading: e.target.value })}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm font-serif text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
          />
        </div>
      </div>
    </div>
  );
}
