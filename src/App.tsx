import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CMSProvider, useCMS } from './context/CMSContext';
import { ThemeProvider } from './context/ThemeContext';
import { Preloader } from './components/Preloader';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Introduction } from './components/Introduction';
import { BrandStatement } from './components/BrandStatement';
import { CollectionSection } from './components/CollectionSection';
import { InteriorDesignSection } from './components/InteriorDesignSection';
import { WhyInfinitySection } from './components/WhyInfinitySection';
import { GallerySection } from './components/GallerySection';
import { TestimonialsSection } from './components/TestimonialsSection';
import { CtaBanner } from './components/CtaBanner';
import { Footer } from './components/Footer';
import { CatalogueView } from './components/CatalogueView';
import { AboutView } from './components/AboutView';
import { ContactPage } from './pages/ContactPage';
import { ProductDetailModal } from './components/ProductDetailModal';
import { RouteProgressBar } from './components/RouteProgressBar';
import { AdminPanel } from './components/admin/AdminPanel';
import { SocialLinksGroup } from './components/SocialIcons';
import { ProductItem } from './types';
import { MessageSquare, Eye } from 'lucide-react';

function getInitialRoute(): string {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.toLowerCase();
  const pathname = window.location.pathname.toLowerCase();

  // Explicit Hash Route: #admin
  if (hash === '#admin' || hash === '#/admin' || hash === '#admin/') {
    return 'admin';
  }
  // Public subpages
  if (hash === '#contact' || hash === '#/contact' || pathname === '/contact') {
    return 'contact';
  }
  if (hash === '#collection' || hash === '#/collection' || pathname === '/collection') {
    return 'collection';
  }
  if (hash === '#interiors' || hash === '#/interiors' || pathname === '/interiors') {
    return 'interiors';
  }
  if (hash === '#gallery' || hash === '#/gallery' || pathname === '/gallery') {
    return 'gallery';
  }
  if (hash === '#about' || hash === '#/about' || pathname === '/about') {
    return 'about';
  }
  return 'home';
}

function WebsiteApp() {
  const {
    activeContent,
    previewDraftOnPublicSite,
    setPreviewDraftOnPublicSite,
    publishDraft,
  } = useCMS();
  const [currentPage, setCurrentPage] = useState<string>(getInitialRoute);
  const [routeTransitionKey, setRouteTransitionKey] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  // Hash route & path navigation handler with access control guards
  const evaluateCurrentRoute = useCallback(() => {
    const pathname = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();

    // 1. Hash Route: Access Admin Center when URL explicitly contains #admin
    if (hash === '#admin' || hash === '#/admin' || hash === '#admin/') {
      if (pathname !== '/' && pathname !== '') {
        window.history.replaceState(null, '', '/#admin');
      }
      setCurrentPage('admin');
      return;
    }

    // 2. Access Control Guard: Redirect /admin or any non-hash admin paths safely back to /
    if (
      pathname === '/admin' ||
      pathname === '/admin/' ||
      pathname.startsWith('/admin/') ||
      pathname === '/admin-secret-access'
    ) {
      window.history.replaceState(null, '', '/');
      setCurrentPage('home');
      return;
    }

    // 3. Other public section hash and path routes
    if (hash === '#contact' || hash === '#/contact' || pathname === '/contact') {
      setCurrentPage('contact');
    } else if (hash === '#collection' || hash === '#/collection' || pathname === '/collection') {
      setCurrentPage('collection');
    } else if (hash === '#interiors' || hash === '#/interiors' || pathname === '/interiors') {
      setCurrentPage('interiors');
    } else if (hash === '#gallery' || hash === '#/gallery' || pathname === '/gallery') {
      setCurrentPage('gallery');
    } else if (hash === '#about' || hash === '#/about' || pathname === '/about') {
      setCurrentPage('about');
    } else {
      setCurrentPage('home');
    }
  }, []);

  useEffect(() => {
    evaluateCurrentRoute();

    const handlePopState = () => {
      evaluateCurrentRoute();
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
    };
  }, [evaluateCurrentRoute]);

  const handleNavigate = (page: string, categoryFilter?: string) => {
    if (categoryFilter) {
      setActiveCategoryFilter(categoryFilter);
    }
    setRouteTransitionKey((prev) => prev + 1);
    if (page === 'admin') {
      window.location.hash = '#admin';
      setCurrentPage('admin');
    } else {
      if (window.location.hash.toLowerCase().includes('admin')) {
        window.history.pushState(null, '', window.location.pathname || '/');
      }
      setCurrentPage(page);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const contact = activeContent.contact || {};
  const whatsappUrl = `https://wa.me/${contact.whatsapp || '2348068795174'}?text=${encodeURIComponent(
    'Hello Infinity Furnitures and Interior World Nigeria Limited, I would like to enquire about your bespoke handcrafted furniture.'
  )}`;

  // If currently in secret admin dashboard mode
  if (currentPage === 'admin') {
    return (
      <AdminPanel
        onExitAdmin={() => {
          window.history.pushState(null, '', '/');
          setCurrentPage('home');
        }}
        onPreviewSite={() => {
          setPreviewDraftOnPublicSite(true);
          window.history.pushState(null, '', '/');
          setCurrentPage('home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#121212] text-[#e5e2db] flex flex-col font-sans selection:bg-[#c5a059] selection:text-[#121212] relative">
      {/* Global Top-of-Screen Route Progress Bar */}
      <RouteProgressBar currentPage={currentPage} triggerKey={routeTransitionKey} />

      {/* Intro Preloader animation */}
      <Preloader />

      {/* Floating Draft Preview Alert Banner */}
      {previewDraftOnPublicSite && (
        <div className="sticky top-0 z-50 bg-[#b89753] text-[#121212] px-6 py-2.5 flex items-center justify-between text-xs font-medium shadow-xl border-b border-black/20">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            <span>
              <strong>Draft Preview Active:</strong> You are viewing draft changes before publishing.
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={async () => {
                await publishDraft();
                setPreviewDraftOnPublicSite(false);
              }}
              className="bg-[#121212] hover:bg-black text-white px-4 py-1.5 rounded-full text-[11px] uppercase tracking-wider font-semibold cursor-pointer transition-colors"
            >
              Publish Live Now
            </button>
            <button
              onClick={() => handleNavigate('admin')}
              className="underline hover:text-white cursor-pointer font-medium"
            >
              Return to Admin
            </button>
            <button
              onClick={() => setPreviewDraftOnPublicSite(false)}
              className="text-black/60 hover:text-black font-bold ml-2 cursor-pointer"
            >
              Exit Preview ✕
            </button>
          </div>
        </div>
      )}

      {/* Global Navigation Header (Public Only) */}
      <Navbar
        currentPage={currentPage}
        onNavigate={handleNavigate}
      />

      {/* Dynamic Main Body Content with Smooth Page Transitions */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPage}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.65, ease: [0.25, 1, 0.5, 1] }}
          >
            {currentPage === 'home' && (
              <>
                <Hero
                  onExplore={() => handleNavigate('collection')}
                  onNavigate={handleNavigate}
                />
                <Introduction />
                <BrandStatement />
                <CollectionSection
                  onSelectCollection={(id) => handleNavigate('collection', id)}
                />
                <InteriorDesignSection />
                <WhyInfinitySection />
                <GallerySection />
                <TestimonialsSection />
                {/* Clean CTA banner directing directly to Contact page */}
                <CtaBanner
                  onContactClick={() => handleNavigate('contact')}
                />
              </>
            )}

            {currentPage === 'collection' && (
              <CatalogueView
                initialCategory={activeCategoryFilter}
                onSelectProduct={(p) => setSelectedProduct(p)}
              />
            )}

            {currentPage === 'interiors' && (
              <div className="pt-20">
                <InteriorDesignSection />
                <WhyInfinitySection />
                <CtaBanner
                  onContactClick={() => handleNavigate('contact')}
                />
              </div>
            )}

            {currentPage === 'gallery' && (
              <div className="pt-20">
                <GallerySection />
                <CtaBanner
                  onContactClick={() => handleNavigate('contact')}
                />
              </div>
            )}

            {currentPage === 'about' && <AboutView />}

            {/* Exclusive Dedicated Inquiry and Contact Page */}
            {currentPage === 'contact' && <ContactPage />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />

      {/* Product Detail & Spec Lightbox Modal (Redirects quote requests to Contact page) */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onEnquire={() => {
          setSelectedProduct(null);
          handleNavigate('contact');
        }}
      />

      {/* Desktop Floating Social Bar */}
      <div className="hidden lg:block fixed left-6 top-1/2 -translate-y-1/2 z-40">
        <SocialLinksGroup variant="floating" />
      </div>

      {/* Floating WhatsApp Consultation Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        title="Chat with Master Artisan on WhatsApp"
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] hover:bg-[#1faa53] text-white p-4 rounded-full shadow-2xl transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-105 active:scale-95 flex items-center justify-center group will-change-transform-opacity"
      >
        <MessageSquare className="w-6 h-6 fill-current" />
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] whitespace-nowrap text-xs font-bold uppercase tracking-wider pl-0 group-hover:pl-2">
          Chat With Us
        </span>
      </a>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <CMSProvider>
        <WebsiteApp />
      </CMSProvider>
    </ThemeProvider>
  );
}
