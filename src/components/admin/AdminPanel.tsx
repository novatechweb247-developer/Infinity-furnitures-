import React, { useState, useEffect } from 'react';
import { useCMS } from '../../context/CMSContext';
import { AdminErrorBoundary } from './AdminErrorBoundary';
import { AdminDashboard } from './AdminDashboard';
import { AdminHeroSlider } from './AdminHeroSlider';
import { AdminProducts } from './AdminProducts';
import { AdminCategories } from './AdminCategories';
import { AdminCollections } from './AdminCollections';
import { AdminInteriors } from './AdminInteriors';
import { AdminGallery } from './AdminGallery';
import { AdminHomepage } from './AdminHomepage';
import { AdminAbout } from './AdminAbout';
import { AdminTestimonials } from './AdminTestimonials';
import { AdminBrandContact } from './AdminBrandContact';
import { AdminMediaLibrary } from './AdminMediaLibrary';
import { AdminEnquiries } from './AdminEnquiries';
import {
  LayoutDashboard,
  Sliders,
  Package,
  Layers,
  Sparkles,
  Compass,
  Image,
  FileText,
  MessageSquareQuote,
  Settings,
  Inbox,
  ArrowLeft,
  UploadCloud,
  RotateCcw,
  Save,
  Menu,
  X,
  CheckCircle,
  Loader2,
  AlertCircle,
} from 'lucide-react';

interface AdminPanelProps {
  onExitAdmin: () => void;
  onPreviewSite: () => void;
}

export function AdminPanel({ onExitAdmin, onPreviewSite }: AdminPanelProps) {
  const {
    hasDraftChanges,
    isSaving,
    isPublishing,
    saveDraft,
    publishDraft,
    discardDraft,
    enquiries,
    notification,
  } = useCMS();

  // Persistent activeTab state across route transitions and previews
  const [activeTab, setActiveTabState] = useState<string>(() => {
    try {
      return localStorage.getItem('infinity_admin_active_tab') || 'dashboard';
    } catch {
      return 'dashboard';
    }
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [localToastMessage, setLocalToastMessage] = useState<string | null>(null);

  const setActiveTab = (tab: string) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('infinity_admin_active_tab', tab);
    } catch (e) {}
  };

  const newEnquiriesCount = enquiries.filter((e) => e.status === 'New').length;

  const showToast = (msg: string) => {
    setLocalToastMessage(msg);
    setTimeout(() => setLocalToastMessage(null), 3500);
  };

  const handleSave = async () => {
    const ok = await saveDraft();
    if (ok) {
      showToast('Draft successfully saved.');
    }
  };

  const handlePublish = async () => {
    const ok = await publishDraft();
    if (ok) {
      showToast('🎉 All draft changes are now published live!');
    }
  };

  const handleDiscard = async () => {
    await discardDraft();
    showToast('Draft changes discarded.');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'hero', label: 'Hero Slides', icon: Sliders },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Layers },
    { id: 'collections', label: 'Collections', icon: Sparkles },
    { id: 'interiors', label: 'Interior Services', icon: Compass },
    { id: 'gallery', label: 'Gallery', icon: Image },
    { id: 'homepage', label: 'Homepage Sections', icon: Sparkles },
    { id: 'about', label: 'About & Heritage', icon: FileText },
    { id: 'testimonials', label: 'Testimonials', icon: MessageSquareQuote },
    { id: 'brand', label: 'Brand & Contact', icon: Settings },
    { id: 'media', label: 'Media Library', icon: Image },
    { id: 'enquiries', label: 'Customer Leads', icon: Inbox, badge: newEnquiriesCount || undefined },
  ];

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard onNavigate={(tab) => setActiveTab(tab)} onPreviewSite={onPreviewSite} />;
      case 'hero':
        return <AdminHeroSlider />;
      case 'products':
        return <AdminProducts />;
      case 'categories':
        return <AdminCategories />;
      case 'collections':
        return <AdminCollections />;
      case 'interiors':
        return <AdminInteriors />;
      case 'gallery':
        return <AdminGallery />;
      case 'homepage':
        return <AdminHomepage />;
      case 'about':
        return <AdminAbout />;
      case 'testimonials':
        return <AdminTestimonials />;
      case 'brand':
        return <AdminBrandContact />;
      case 'media':
        return <AdminMediaLibrary />;
      case 'enquiries':
        return <AdminEnquiries />;
      default:
        return <AdminDashboard onNavigate={(tab) => setActiveTab(tab)} onPreviewSite={onPreviewSite} />;
    }
  };

  const activeNotification = localToastMessage || notification?.message;
  const isDeletingOrLoading =
    notification?.type === 'info' ||
    Boolean(activeNotification && activeNotification.toLowerCase().includes('deleting'));
  const isError = notification?.type === 'error';

  return (
    <div className="min-h-screen bg-[#f7f6f2] text-[#1a1a1a] flex flex-col font-sans">
      {/* Toast Notification */}
      {activeNotification && (
        <div className="fixed top-20 right-6 z-50 bg-[#1a1a1a] text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-[#b89753]/40 flex items-center gap-3 animate-fade-in text-xs font-medium">
          {isDeletingOrLoading ? (
            <Loader2 className="w-4 h-4 text-[#b89753] animate-spin shrink-0" />
          ) : isError ? (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-[#b89753] shrink-0" />
          )}
          <span>{activeNotification}</span>
        </div>
      )}

      {/* Admin Top Appbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200 px-6 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-neutral-600 hover:text-black hover:bg-neutral-100 rounded-xl"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-[#121212] flex items-center justify-center p-0.5 border border-[#b89753]/30 shrink-0">
              <img
                src={draftContent.brand?.logoUrl || draftContent.brand?.logo || '/logo.png'}
                alt="Infinity Logo"
                className="max-h-full max-w-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-sm font-serif font-semibold tracking-wider text-[#1a1a1a] uppercase">
                Infinity CMS
              </h1>
              <span className="text-[10px] text-neutral-400 block -mt-0.5">Showroom & Workshop Administrator</span>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-2.5">
          {hasDraftChanges && (
            <button
              type="button"
              onClick={handleDiscard}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-medium cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
              <span>Discard Draft</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-neutral-300 hover:bg-neutral-50 text-[#1a1a1a] text-xs font-medium shadow-xs cursor-pointer transition-colors disabled:opacity-50"
          >
            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin text-[#b89753]" /> : <Save className="w-3.5 h-3.5 text-[#b89753]" />}
            <span>{isSaving ? 'Saving...' : 'Save Draft'}</span>
          </button>

          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="inline-flex items-center gap-2 bg-[#b89753] hover:bg-[#a38442] text-white px-5 py-2 rounded-full text-xs uppercase tracking-[0.12em] font-medium shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isPublishing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
            <span>{isPublishing ? 'Publishing...' : 'Publish Live'}</span>
          </button>

          <div className="h-5 w-[1px] bg-neutral-200 mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={onExitAdmin}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Back to Website</span>
          </button>
        </div>
      </header>

      {/* Main Layout Container */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 gap-8">
        {/* Desktop Sidebar Navigation */}
        <aside className="w-64 shrink-0 hidden lg:block">
          <div className="bg-white border border-neutral-200 rounded-3xl p-3 shadow-xs sticky top-24 space-y-1">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-neutral-400 px-3 py-2 block">
              Navigation
            </span>
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#1a1a1a] text-white shadow-xs'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#b89753]' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="bg-[#b89753] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          >
            <div
              className="bg-white w-72 h-full p-4 overflow-y-auto space-y-1 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-2">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[#121212] flex items-center justify-center p-0.5 border border-[#b89753]/30 shrink-0">
                    <img
                      src={draftContent.brand?.logoUrl || draftContent.brand?.logo || '/logo.png'}
                      alt="Infinity Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <span className="text-xs font-serif font-bold uppercase text-[#b89753]">
                    Admin Menu
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-neutral-400 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-[#1a1a1a] text-white'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-black'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#b89753]' : 'text-neutral-400'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className="bg-[#b89753] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Dynamic Content Pane wrapped in Error Boundary */}
        <main className="flex-1 min-w-0 pb-16">
          <AdminErrorBoundary key={activeTab} fallbackTitle={`Issue loading ${activeTab} module`}>
            {renderActiveContent()}
          </AdminErrorBoundary>
        </main>
      </div>
    </div>
  );
}
