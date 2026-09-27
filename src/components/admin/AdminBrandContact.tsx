import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { PlatformIcon } from '../SocialIcons';
import { SOCIAL_PLATFORMS, formatSocialUrl, SocialPlatformKey } from '../../utils/socialUtils';
import { ExternalLink, Check, Sparkles, UploadCloud, Save, CheckCircle2, Shield, Lock } from 'lucide-react';

export function AdminBrandContact() {
  const { draftContent, updateBrand, updateSocial, updateDraft, publishDraft, isPublishing, showNotification } = useCMS();
  const brand = draftContent.brand;
  const [isPublishingLocal, setIsPublishingLocal] = useState(false);
  const [justPublished, setJustPublished] = useState(false);

  const contact = draftContent.contact || {
    phone1: brand.phone1,
    phone2: brand.phone2,
    whatsapp: brand.whatsapp,
    email: brand.email,
    address: brand.address,
  };

  const social = draftContent.social || {
    instagram: brand.instagram || '',
    tiktok: '',
    facebook: '',
    twitter: '',
  };

  const handleUpdateBrand = (updates: any) => {
    updateBrand(updates);
  };

  const handlePublishLiveNow = async () => {
    setIsPublishingLocal(true);
    const success = await publishDraft();
    setIsPublishingLocal(false);
    if (success) {
      setJustPublished(true);
      showNotification('✅ Brand identity published live to website!', 'success');
      setTimeout(() => setJustPublished(false), 4000);
    }
  };

  const handleUpdateContact = (updates: any) => {
    const newContact = { ...contact, ...updates, phone2: '' };
    const newBrand = {
      ...brand,
      phone1: updates.phone1 ?? updates.phone ?? brand.phone1,
      phone: updates.phone1 ?? updates.phone ?? brand.phone1,
      phone2: '',
      whatsapp: updates.whatsapp ?? brand.whatsapp,
      email: updates.email ?? brand.email,
      address: updates.address ?? brand.address,
      workingHours: updates.openingHours ?? brand.workingHours,
      openingHours: updates.openingHours ?? brand.openingHours,
    };
    updateDraft({
      brand: newBrand,
      contact: newContact,
    });
  };

  const handleUpdateSocialField = (key: SocialPlatformKey, rawValue: string) => {
    updateSocial({ [key]: rawValue });
    if (key === 'instagram') {
      updateBrand({ instagram: rawValue });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-[#b89753] block">
            Settings
          </span>
          <h2 className="text-2xl font-serif text-[#1a1a1a]">Brand Identity & Showroom Contact</h2>
          <p className="text-xs text-neutral-500 font-light mt-1">
            Configure business name, logo, phone lines, showroom address, email, and social media handles.
          </p>
        </div>

        <button
          type="button"
          onClick={handlePublishLiveNow}
          disabled={isPublishing || isPublishingLocal}
          className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-medium transition-all shadow-sm cursor-pointer shrink-0 ${
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
              <span>Publish Brand Changes Live</span>
            </>
          )}
        </button>
      </div>

      {/* Brand Identity */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <h3 className="text-lg font-serif text-[#1a1a1a]">
            Brand Identity & Permanent Logo
          </h3>
          <span className="text-[11px] text-[#b89753] bg-[#b89753]/10 border border-[#b89753]/30 px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
            <Lock className="w-3 h-3" /> Official Emblem Locked
          </span>
        </div>

        {/* Permanent Official Logo Emblem Lockout */}
        <div className="p-5 rounded-2xl bg-[#121212] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-[#c5a059] font-medium flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" /> Permanent Official Brand Emblem
            </span>
            <span className="text-[10px] text-white/50 bg-white/10 px-2.5 py-0.5 rounded-full font-mono">
              Locked Asset: /logo.png
            </span>
          </div>
          <div className="flex flex-col sm:flex-row items-center gap-5 py-2">
            <div className="h-20 w-20 rounded-2xl bg-[#121212] border border-[#c5a059]/40 flex items-center justify-center p-1.5 shrink-0 shadow-lg">
              <img
                src="/logo.png"
                alt="Infinity Furnitures Permanent Logo"
                className="max-h-full max-w-full w-auto object-contain"
              />
            </div>
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="text-sm font-serif text-[#f5f2eb]">
                Infinity Furnitures & Interior World Emblem
              </h4>
              <p className="text-xs text-neutral-400 font-light leading-relaxed">
                This emblem is hardcoded as the unchangeable brand identity across the Preloader, sticky Navbar, and Footer. Input fields and upload controls are removed to ensure permanent visual consistency.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
              Business Name
            </label>
            <input
              type="text"
              value={brand.businessName}
              onChange={(e) => handleUpdateBrand({ businessName: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
              Tagline
            </label>
            <input
              type="text"
              value={brand.tagline}
              onChange={(e) => handleUpdateBrand({ tagline: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
            />
          </div>
        </div>
      </div>

      {/* Official Social Media Channels (Instagram, TikTok, Facebook, Twitter/X) */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-neutral-100">
          <div>
            <h3 className="text-lg font-serif text-[#1a1a1a]">
              Official Social Media Channels
            </h3>
            <p className="text-xs text-neutral-500 font-light mt-0.5">
              Enter full URLs or handles (e.g. <code className="bg-neutral-100 px-1 py-0.5 rounded text-[11px]">@infinityfurnitures</code>). Only platforms with a link will appear publicly on headers, footers, and floating bars.
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-[#b89753] font-medium bg-[#b89753]/10 px-3 py-1 rounded-full w-fit">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Platform Active</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SOCIAL_PLATFORMS.map((platform) => {
            const rawValue = (social as any)[platform.key] || (platform.key === 'instagram' ? brand.instagram : '') || '';
            const formattedUrl = formatSocialUrl(platform.key, rawValue);
            const isSet = !!formattedUrl;

            return (
              <div
                key={platform.key}
                className={`p-4 rounded-2xl border transition-all ${
                  isSet
                    ? 'border-[#b89753]/30 bg-neutral-50/70'
                    : 'border-neutral-200 bg-white hover:border-neutral-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-[#1a1a1a] text-white flex items-center justify-center shrink-0">
                      <PlatformIcon platform={platform.key} className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-[#1a1a1a] block">
                        {platform.name}
                      </span>
                      <span className="text-[10px] text-neutral-500">
                        {isSet ? (
                          <span className="text-emerald-700 font-medium inline-flex items-center gap-1">
                            <Check className="w-3 h-3 inline" /> Active link configured
                          </span>
                        ) : (
                          'Not visible publicly (empty)'
                        )}
                      </span>
                    </div>
                  </div>

                  {isSet && (
                    <a
                      href={formattedUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-[#b89753] hover:underline font-medium"
                      title="Test live link in new tab"
                    >
                      <span>Test</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>

                <div className="space-y-1.5">
                  <input
                    type="text"
                    value={rawValue}
                    onChange={(e) => handleUpdateSocialField(platform.key, e.target.value)}
                    placeholder={platform.placeholder}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-3.5 py-2 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
                  />
                  {isSet && (
                    <p className="text-[10px] text-neutral-500 font-mono truncate px-1">
                      Resolves to: <span className="text-[#1a1a1a] font-medium">{formattedUrl}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Direct Contact Channels */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <h3 className="text-lg font-serif text-[#1a1a1a] pb-3 border-b border-neutral-100">
          Direct Contact & Showroom
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
              Direct Telephone / Mobile
            </label>
            <input
              type="text"
              value={contact.phone1 || contact.phone || '0806 879 5174'}
              onChange={(e) => handleUpdateContact({ phone1: e.target.value, phone: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
              WhatsApp Number (with country code, no +)
            </label>
            <input
              type="text"
              value={contact.whatsapp}
              onChange={(e) => handleUpdateContact({ whatsapp: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
              placeholder="e.g. 2348068795174"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
              Official Email
            </label>
            <input
              type="email"
              value={contact.email}
              onChange={(e) => handleUpdateContact({ email: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
              Opening Hours
            </label>
            <input
              type="text"
              value={brand.openingHours || brand.workingHours || ''}
              onChange={(e) => handleUpdateContact({ openingHours: e.target.value })}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
              placeholder="e.g. Mon - Sat: 9:00 AM - 6:00 PM"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider font-semibold text-neutral-700 mb-2">
            Showroom / Factory Address
          </label>
          <input
            type="text"
            value={contact.address}
            onChange={(e) => handleUpdateContact({ address: e.target.value })}
            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-xs text-[#1a1a1a] focus:outline-none focus:border-[#b89753]"
          />
        </div>
      </div>
    </div>
  );
}
