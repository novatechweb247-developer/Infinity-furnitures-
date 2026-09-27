import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Sparkles, Compass } from 'lucide-react';
import { HeroSlide } from '../types';
import { useCMS } from '../context/CMSContext';
import { Card3D, Card3DLayer } from './Card3D';
import { LUXURY_EASE } from './PopOut';

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'slide-1',
    overline: 'Infinity Furnitures and Interior World Nigeria Limited',
    title: 'Design your space differently.',
    subtitle: 'Exceptional furniture and interior solutions crafted to bring comfort, character and timeless elegance into every space.',
    primaryCtaText: 'Explore Collection',
    primaryCtaAction: 'collection',
    secondaryCtaText: 'Contact Us',
    secondaryCtaAction: 'contact',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=85',
    imageAlt: 'Luxury Living Space and Bespoke Furniture',
  },
  {
    id: 'slide-2',
    overline: 'Artisanal Woodworking & Seating',
    title: 'Craftsmanship that makes a statement.',
    subtitle: 'Handcrafted seating, tailored joinery, and sculptural pieces built to elevate refined contemporary living.',
    primaryCtaText: 'View Collection',
    primaryCtaAction: 'collection',
    secondaryCtaText: 'Contact Us',
    secondaryCtaAction: 'contact',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=85',
    imageAlt: 'Bespoke Handcrafted Furniture',
  },
  {
    id: 'slide-3',
    overline: 'Architectural Interiors',
    title: "We don't just furnish spaces. We transform them.",
    subtitle: 'From spatial planning to turnkey execution, our interior design solutions harmonize architectural rigor with emotional resonance.',
    primaryCtaText: 'Explore Interiors',
    primaryCtaAction: 'interiors',
    secondaryCtaText: 'Book Consultation',
    secondaryCtaAction: 'contact',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85',
    imageAlt: 'Comprehensive Architectural Interior Design',
  },
  {
    id: 'slide-4',
    overline: 'Bespoke Joinery & Wardrobes',
    title: 'Built with uncompromising standards.',
    subtitle: 'Floor-to-ceiling architectural wardrobes tailored to maximize storage with unmatched elegance and generational durability.',
    primaryCtaText: 'Discover Wardrobes',
    primaryCtaAction: 'collection',
    secondaryCtaText: 'Get in Touch',
    secondaryCtaAction: 'contact',
    image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=2000&q=85',
    imageAlt: 'Custom Architectural Wardrobes and Joinery',
  },
];

interface HeroProps {
  onNavigate?: (page: string) => void;
  onExplore?: () => void;
  onContact?: () => void;
}

export function Hero({ onNavigate, onExplore, onContact }: HeroProps) {
  const { activeContent } = useCMS();
  const slides = (activeContent?.heroSlides && activeContent.heroSlides.length > 0)
    ? activeContent.heroSlides
    : HERO_SLIDES;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const totalSlides = slides.length;
  // 5.0 seconds per slide auto-play interval (4-6s range)
  const autoSlideDelay = 5000;

  // Reset currentSlide if index is out of bounds due to dynamic CMS edits
  useEffect(() => {
    if (currentSlide >= totalSlides && totalSlides > 0) {
      setCurrentSlide(0);
    }
  }, [totalSlides, currentSlide]);

  // Handle CTA button clicks
  const handleAction = useCallback(
    (action: string) => {
      if (onNavigate) {
        onNavigate(action);
      } else if (action === 'collection' && onExplore) {
        onExplore();
      } else if (action === 'contact' && onContact) {
        onContact();
      }
    },
    [onNavigate, onExplore, onContact]
  );

  // Infinite loop slide advances
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (totalSlides > 0 ? (prev + 1) % totalSlides : 0));
  }, [totalSlides]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (totalSlides > 0 ? (prev - 1 + totalSlides) % totalSlides : 0));
  }, [totalSlides]);

  // Switch to specific slide and reset timer
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  // Preload all slide images to prevent flickering or layout shift
  useEffect(() => {
    slides.forEach((slide) => {
      if (slide.image) {
        const img = new Image();
        img.src = slide.image;
      }
    });
  }, [slides]);

  // Automatic slide timer with automatic reset upon slide change or manual interaction
  useEffect(() => {
    if (isPaused || totalSlides <= 1) return;
    const timer = setInterval(() => {
      nextSlide();
    }, autoSlideDelay);
    return () => clearInterval(timer);
  }, [currentSlide, isPaused, nextSlide, autoSlideDelay, totalSlides]);

  // Keyboard navigation support (ArrowLeft / ArrowRight)
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      prevSlide();
    } else if (e.key === 'ArrowRight') {
      nextSlide();
    }
  };

  // Mobile swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
    touchStartX.current = null;
  };

  const activeSlide = slides[currentSlide] || slides[0];

  if (!activeSlide) return null;

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label="Infinity Furnitures and Interior World Nigeria Limited Featured Collections and Services"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      id="hero-section"
      className="relative min-h-[640px] sm:min-h-screen flex items-center justify-center pt-24 pb-20 overflow-hidden bg-neutral-900 focus:outline-none select-none"
    >
      {/* Background Image Slides with Smooth 1.1s Cross-Fade and Full Clarity */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {slides.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              style={{
                transitionDuration: '1100ms',
                transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
              }}
              className={`absolute inset-0 transition-opacity ease-in-out will-change-transform-opacity ${
                isActive ? 'opacity-100 z-1 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
              aria-hidden={!isActive}
            >
              <img
                src={slide.image || HERO_SLIDES[index % HERO_SLIDES.length]?.image}
                alt={slide.imageAlt || slide.title || 'Luxury Furniture'}
                style={{
                  transitionDuration: '10000ms',
                  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                }}
                className={`w-full h-full object-cover object-center transform transition-transform will-change-transform-opacity filter brightness-[0.98] contrast-[1.04] ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              {/* Subtle localized dark gradient for crystal clear text legibility while keeping image fully visible */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-transparent md:from-black/65 md:via-black/20 md:to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />
            </div>
          );
        })}
      </div>

      {/* Main Slide Content Area */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 w-full pt-8 sm:pt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.95, ease: [0.4, 0, 0.2, 1] }}
            className="lg:col-span-8 max-w-3xl will-change-transform-opacity"
          >
            {/* Overline tag with subtle initial reveal */}
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.75, ease: [0.4, 0, 0.2, 1] }}
              className="inline-block text-xs uppercase tracking-[0.3em] text-[#c5a059] mb-4 font-semibold drop-shadow-sm"
            >
              {activeSlide.overline || activeSlide.tagline || 'Infinity Furnitures and Interior World Nigeria Limited'}
            </motion.span>

            {/* Slide Title with gentle depth scale */}
            <motion.h1
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.18, duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
              className="text-4xl sm:text-6xl md:text-7xl font-serif font-light tracking-tight text-[#f5f2eb] leading-[1.12] mb-6 drop-shadow-[0_2px_14px_rgba(0,0,0,0.65)]"
            >
              {activeSlide.title}
            </motion.h1>

            {/* Slide Description - steady fluid reveal */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
              className="text-base sm:text-lg text-[#dedbd3] font-light max-w-xl leading-relaxed mb-8 sm:mb-10 drop-shadow-[0_1px_6px_rgba(0,0,0,0.65)]"
            >
              {activeSlide.subtitle || activeSlide.description}
            </motion.p>

            {/* Call to Actions - smooth fluid entrance */}
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.42, duration: 0.85, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4"
            >
              <button
                type="button"
                onClick={() => handleAction(activeSlide.primaryCtaAction || 'collection')}
                className="inline-flex items-center justify-center bg-[#c5a059] text-[#121212] hover:bg-[#d4af37] hover:scale-[1.03] active:scale-95 transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] px-8 py-4 rounded-full text-xs uppercase tracking-[0.25em] font-semibold shadow-[0_10px_30px_rgba(197,160,89,0.3)] hover:shadow-[0_15px_35px_rgba(197,160,89,0.45)] group cursor-pointer"
              >
                <span>{activeSlide.primaryCtaText}</span>
              </button>
              {activeSlide.secondaryCtaText && (
                <button
                  type="button"
                  onClick={() => handleAction(activeSlide.secondaryCtaAction || 'contact')}
                  className="inline-flex items-center justify-center border border-white/30 text-[#f5f2eb] hover:border-[#c5a059] hover:text-[#c5a059] hover:scale-[1.03] active:scale-95 bg-black/40 hover:bg-black/60 backdrop-blur-md transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] px-8 py-4 rounded-full text-xs uppercase tracking-[0.25em] font-medium cursor-pointer shadow-lg hover:shadow-xl"
                >
                  {activeSlide.secondaryCtaText}
                </button>
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Signature Interactive 3D Pop-Out Card (Desktop) */}
        <div className="hidden lg:block lg:col-span-4">
          <Card3D
            depth={8}
            scaleOnHover={1.03}
            elevateZ={22}
            className="w-full max-w-sm ml-auto"
          >
            <div className="bg-[#181818]/90 backdrop-blur-xl border border-white/15 p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-[#e5e2db] flex flex-col justify-between">
              <Card3DLayer depth={30}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#c5a059]" />
                    <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a059] font-bold">
                      Atelier Signature
                    </span>
                  </div>
                  <span className="text-xs font-serif text-white/50">0{currentSlide + 1}</span>
                </div>
              </Card3DLayer>

              <Card3DLayer depth={18}>
                <div className="aspect-16/10 rounded-2xl overflow-hidden bg-neutral-900 border border-white/10 mb-4 shadow-inner">
                  <img
                    src={activeSlide.image || HERO_SLIDES[currentSlide % HERO_SLIDES.length]?.image}
                    alt={activeSlide.title}
                    className="w-full h-full object-cover filter brightness-[0.95] contrast-[1.05]"
                  />
                </div>
              </Card3DLayer>

              <Card3DLayer depth={36}>
                <div className="space-y-1">
                  <h4 className="font-serif text-sm text-[#e5e2db] line-clamp-1">
                    {activeSlide.title}
                  </h4>
                  <p className="text-[11px] text-[#b0aca3] font-light flex items-center gap-1.5">
                    <Compass className="w-3 h-3 text-[#c5a059]" />
                    <span>Architectural joinery & custom sizing</span>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[10px] text-white/40">
                  <span className="uppercase tracking-widest">Handmade in Jos, Plateau State</span>
                  <span className="text-[#c5a059] font-serif font-medium">Bespoke</span>
                </div>
              </Card3DLayer>
            </div>
          </Card3D>
        </div>
      </div>

      {/* Desktop Prev / Next Controls with 0.4s Smooth Transition */}
      <div className="absolute inset-y-0 left-4 right-4 z-15 pointer-events-none hidden lg:flex items-center justify-between">
        <button
          type="button"
          onClick={prevSlide}
          aria-label="Previous slide"
          className="pointer-events-auto w-12 h-12 rounded-full bg-black/40 hover:bg-black/75 text-white hover:text-[#c5a059] border border-white/20 shadow-2xl flex items-center justify-center backdrop-blur-md transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a059]"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next slide"
          className="pointer-events-auto w-12 h-12 rounded-full bg-black/40 hover:bg-black/75 text-white hover:text-[#c5a059] border border-white/20 shadow-2xl flex items-center justify-center backdrop-blur-md transition-all duration-400 ease-[cubic-bezier(0.4,0,0.2,1)] hover:scale-105 active:scale-95 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a059]"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Soft Indicator Navigation & Slide Counter */}
      <div className="absolute bottom-6 sm:bottom-10 left-0 right-0 z-20 flex flex-col items-center gap-3">
        <div
          role="tablist"
          aria-label="Hero carousel navigation dots"
          className="flex items-center gap-2 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 shadow-2xl"
        >
          {slides.map((slide, index) => {
            const isActive = index === currentSlide;
            return (
              <button
                key={slide.id}
                role="tab"
                id={`hero-slide-dot-${index}`}
                aria-selected={isActive}
                aria-label={`Go to slide ${index + 1}: ${slide.title}`}
                onClick={() => goToSlide(index)}
                className="min-w-[36px] min-h-[36px] flex items-center justify-center p-1 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#c5a059]"
              >
                <span
                  style={{
                    transitionDuration: '700ms',
                    transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                  }}
                  className={`block rounded-full transition-all will-change-transform-opacity ${
                    isActive
                      ? 'w-8 h-2 bg-[#c5a059] shadow-md scale-100 opacity-100'
                      : 'w-2 h-2 bg-white/40 hover:bg-white/80 hover:scale-125 opacity-70'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Slide Counter */}
        <div className="text-[11px] font-mono tracking-widest text-white/70 select-none drop-shadow-sm">
          <span className="font-semibold text-[#c5a059]">0{currentSlide + 1}</span>
          <span className="mx-1 text-white/40">/</span>
          <span>0{totalSlides}</span>
        </div>
      </div>
    </section>
  );
}
