import React from 'react';
import { useCMS } from '../../context/CMSContext';
import { ImageField } from './ImageField';

export function AdminAbout() {
  const { draftContent, updateAbout } = useCMS();
  const about = draftContent.about;

  return (
    <div className="space-y-6">
      <div>
        <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#b89753] block">
          Storytelling
        </span>
        <h2 className="text-2xl font-serif text-[#1a1a1a]">About & Brand Heritage</h2>
        <p className="text-xs text-neutral-500 font-light mt-1">
          Craft the story of your artisans, joinery heritage, materials, and vision.
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <ImageField
          label="Hero / Workshop Photography"
          value={about.image || about.heroImage || ''}
          onChange={(url) => updateAbout({ image: url, heroImage: url })}
          category="About"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
              Page Title / Headline
            </label>
            <input
              type="text"
              value={about.heading || about.title || ''}
              onChange={(e) => updateAbout({ heading: e.target.value, title: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
              Subtitle
            </label>
            <input
              type="text"
              value={about.subheading || about.subtitle || ''}
              onChange={(e) => updateAbout({ subheading: e.target.value, subtitle: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
            Brand Story (Paragraph 1)
          </label>
          <textarea
            rows={4}
            value={about.storyParagraph1 || about.story || ''}
            onChange={(e) => updateAbout({ storyParagraph1: e.target.value, story: e.target.value })}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753] resize-none leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
            Brand Story (Paragraph 2)
          </label>
          <textarea
            rows={4}
            value={about.storyParagraph2 || ''}
            onChange={(e) => updateAbout({ storyParagraph2: e.target.value })}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753] resize-none leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
            Mission Statement
          </label>
          <textarea
            rows={3}
            value={about.mission || ''}
            onChange={(e) => updateAbout({ mission: e.target.value })}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753] resize-none"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
            Vision Statement
          </label>
          <textarea
            rows={3}
            value={about.vision || ''}
            onChange={(e) => updateAbout({ vision: e.target.value })}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl p-4 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753] resize-none"
          />
        </div>
      </div>
    </div>
  );
}
