import React from 'react';
import { useCMS } from '../../context/CMSContext';
import {
  Package,
  Layers,
  Sparkles,
  Image,
  Inbox,
  Sliders,
  Compass,
  FileText,
  MessageSquareQuote,
  Settings,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface AdminDashboardProps {
  onSelectTab?: (tabId: string) => void;
  onNavigate?: (tabId: string) => void;
  onPreviewSite?: () => void;
}

export function AdminDashboard({ onSelectTab, onNavigate, onPreviewSite }: AdminDashboardProps) {
  const handleSelect = onNavigate || onSelectTab || (() => {});
  const { publishedContent, draftContent, hasDraftChanges, mediaAssets, enquiries } = useCMS();

  const activeDraft = draftContent;
  const newEnquiriesCount = enquiries.filter((e) => e.status === 'New').length;
  const featuredProductsCount = activeDraft.products.filter((p) => p.featured).length;

  const quickLinks = [
    { id: 'hero', title: 'Hero Slider', count: `${activeDraft.heroSlides.length} slides`, icon: Sliders, color: 'text-amber-500' },
    { id: 'products', title: 'Products Catalogue', count: `${activeDraft.products.length} items (${featuredProductsCount} featured)`, icon: Package, color: 'text-emerald-500' },
    { id: 'categories', title: 'Product Categories', count: `${activeDraft.categories.length} categories`, icon: Layers, color: 'text-blue-500' },
    { id: 'collections', title: 'Collection Cards', count: `${activeDraft.collections.length} categories`, icon: Sparkles, color: 'text-purple-500' },
    { id: 'interiors', title: 'Interior Services', count: `${activeDraft.services.length} services`, icon: Compass, color: 'text-indigo-500' },
    { id: 'gallery', title: 'Gallery & Portfolio', count: `${activeDraft.gallery.length} photos`, icon: Image, color: 'text-rose-500' },
    { id: 'enquiries', title: 'Customer Enquiries', count: `${newEnquiriesCount} new orders`, icon: Inbox, color: 'text-[#b89753]' },
    { id: 'media', title: 'Central Media Library', count: `${mediaAssets.length} storage files`, icon: Image, color: 'text-cyan-500' },
    { id: 'about', title: 'About & Brand Story', count: 'Heritage & Pillars', icon: FileText, color: 'text-teal-500' },
    { id: 'homepage', title: 'Homepage Sections', count: 'Intro, Banner & CTA', icon: Sparkles, color: 'text-orange-500' },
    { id: 'testimonials', title: 'Client Reviews', count: `${activeDraft.testimonials.length} reviews`, icon: MessageSquareQuote, color: 'text-yellow-500' },
    { id: 'brand', title: 'Brand & Contact Info', count: 'Phone, WhatsApp, Social', icon: Settings, color: 'text-neutral-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Store Status Banner */}
      <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-neutral-500">
              Live Website Operational
            </span>
            <span className="text-neutral-300">|</span>
            <span className="text-xs text-neutral-500">
              Version v{publishedContent.version || 1}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-[#1a1a1a]">
            {activeDraft.brand.businessName || 'Infinity Furnitures and Interior World Nigeria Limited'} Master Control
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 font-light max-w-2xl leading-relaxed">
            Manage every public-facing component of your luxury furniture store. Upload high-resolution imagery directly from your phone or laptop, edit pricing, update showroom details, and publish updates live in real-time.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={onPreviewSite}
            className="inline-flex items-center gap-2 bg-white hover:bg-neutral-100 text-[#1a1a1a] border border-neutral-300 px-5 py-3 rounded-full text-xs uppercase tracking-[0.15em] font-medium shadow-xs transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4 text-[#b89753]" />
            <span>View Public Site</span>
          </button>
        </div>
      </div>

      {/* Draft vs Published Alert */}
      {hasDraftChanges && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500/20 text-amber-700 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-wider font-semibold text-amber-900">
                You have unpublished draft edits
              </h4>
              <p className="text-xs text-amber-800 font-light">
                Changes have been saved to your working draft. Click "Publish Live" in the top bar whenever you are ready for visitors to see them.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-neutral-500">
              Products Catalogue
            </span>
            <Package className="w-4 h-4 text-[#b89753]" />
          </div>
          <div className="text-3xl font-serif text-[#1a1a1a] mb-1">
            {activeDraft.products.length}
          </div>
          <span className="text-[11px] text-neutral-500">
            {featuredProductsCount} marked as featured on homepage
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-neutral-500">
              New Enquiries
            </span>
            <Inbox className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-serif text-[#1a1a1a] mb-1">
            {newEnquiriesCount}
          </div>
          <span className="text-[11px] text-neutral-500">
            {enquiries.length} total customer leads recorded
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-neutral-500">
              Storage Bucket
            </span>
            <Image className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-3xl font-serif text-[#1a1a1a] mb-1">
            {mediaAssets.length}
          </div>
          <span className="text-[11px] text-neutral-500">
            Permanent high-res media files
          </span>
        </div>

        <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-neutral-400 mb-3">
            <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-neutral-500">
              Last Published
            </span>
            <Clock className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-sm font-medium text-[#1a1a1a] mb-1 truncate">
            {new Date(publishedContent.lastUpdated).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          <span className="text-[11px] text-neutral-500">
            Synced with server database
          </span>
        </div>
      </div>

      {/* Quick Launch Management Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-serif text-[#1a1a1a]">Website Management Sections</h2>
          <span className="text-xs text-neutral-400">Select any section to edit</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const IconComponent = link.icon;
            return (
              <div
                key={link.id}
                onClick={() => handleSelect(link.id)}
                className="group bg-white border border-neutral-200 hover:border-[#b89753] p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-neutral-50 group-hover:bg-[#b89753]/10 border border-neutral-200 group-hover:border-[#b89753]/30 flex items-center justify-center transition-colors">
                    <IconComponent className={`w-5 h-5 ${link.color}`} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#1a1a1a] group-hover:text-[#b89753] transition-colors">
                      {link.title}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">{link.count}</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-neutral-100 group-hover:bg-[#b89753] group-hover:text-white flex items-center justify-center text-neutral-400 transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
