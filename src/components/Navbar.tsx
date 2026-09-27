import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, ArrowRight, Shield, ChevronDown, Sparkles, Layers, Compass, Armchair, Utensils, Bed, DoorClosed, Briefcase, Sun, Moon } from 'lucide-react';
import { useCMS } from '../context/CMSContext';
import { useTheme } from '../context/ThemeContext';
import { SocialLinksGroup } from './SocialIcons';

interface NavbarProps {
  currentPage: string;
  onNavigate: (page: string, categoryFilter?: string) => void;
}

export function Navbar({ currentPage, onNavigate }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopDropdown, setDesktopDropdown] = useState<'collection' | 'interiors' | null>(null);
  const [mobileAccordions, setMobileAccordions] = useState<{ [key: string]: boolean }>({
    collection: true,
    interiors: false,
  });
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { activeContent, publishedContent, previewDraftOnPublicSite } = useCMS();
  const { theme, isDark, toggleTheme } = useTheme();
  const brand = activeContent.brand || {};
  const contact = activeContent.contact || {};

  // Official brand logo asset with dynamic CMS override
  const logoSrc = brand.logoUrl || brand.logo || '/logo.png';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock background scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleMouseEnterDropdown = (menu: 'collection' | 'interiors') => {
    if (dropdownTimeoutRef.current) clearTimeout(dropdownTimeoutRef.current);
    setDesktopDropdown(menu);
  };

  const handleMouseLeaveDropdown = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setDesktopDropdown(null);
    }, 220);
  };

  const toggleMobileAccordion = (key: string) => {
    setMobileAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const collectionSubItems = [
    {
      id: 'sofas',
      name: 'Sofas & Living',
      description: 'Sculptural seating and artisanal modular sectionals',
      icon: Armchair,
      categoryKey: 'sofas',
    },
    {
      id: 'dining',
      name: 'Dining Suites',
      description: 'Solid timber dining tables and bespoke leather chairs',
      icon: Utensils,
      categoryKey: 'dining',
    },
    {
      id: 'bedroom',
      name: 'Master Bedroom',
      description: 'Bespoke upholstered beds, credenzas and nightstands',
      icon: Bed,
      categoryKey: 'bedroom',
    },
    {
      id: 'wardrobes',
      name: 'Bespoke Wardrobes',
      description: 'Floor-to-ceiling walk-in closets with integrated lighting',
      icon: DoorClosed,
      categoryKey: 'wardrobes',
    },
    {
      id: 'office',
      name: 'Executive & Office',
      description: 'Commanding executive desks and boardroom suites',
      icon: Briefcase,
      categoryKey: 'office',
    },
  ];

  const interiorSubItems = [
    {
      id: 'bespoke-residential',
      name: 'Residential Sanctuaries',
      description: 'Turnkey architectural interior fit-outs for luxury residences',
      icon: Sparkles,
    },
    {
      id: 'corporate-fitouts',
      name: 'Corporate Headquarters',
      description: 'Executive boardrooms, private offices and prestigious venues',
      icon: Layers,
    },
    {
      id: 'custom-joinery',
      name: 'Architectural Joinery',
      description: 'Wall paneling, acoustic timber slats and tailored cabinetry',
      icon: Compass,
    },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-[#121212]/95 backdrop-blur-md py-3.5 border-b border-white/10 shadow-2xl'
            : 'bg-[#121212]/80 backdrop-blur-sm py-5 border-b border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 flex items-center justify-between gap-3 sm:gap-4">
          {/* Logo with 3D hover lift */}
          <button
            onClick={() => {
              onNavigate('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            aria-label="Infinity Furnitures & Interior World Nigeria Ltd Home"
            className="flex items-center gap-3 sm:gap-4 group text-left focus:outline-none cursor-pointer transform-gpu transition-transform duration-300 hover:scale-[1.02] shrink-0"
          >
            <div className="relative flex items-center justify-center shrink-0">
              <img
                src={logoSrc}
                alt="Infinity Furnitures & Interior World Nigeria Ltd"
                className="h-12 sm:h-14 md:h-16 w-auto object-contain shrink-0 transform-gpu transition-all duration-300 group-hover:scale-105 drop-shadow-[0_4px_16px_rgba(197,160,89,0.3)]"
                loading="eager"
                decoding="sync"
              />
            </div>
            <div className="inline-flex flex-col min-w-0 overflow-hidden">
              <span className="text-sm sm:text-base md:text-lg font-serif tracking-[0.06em] sm:tracking-[0.12em] text-[#f5f2eb] font-semibold sm:font-medium leading-tight truncate">
                <span className="inline sm:hidden">Infinity Furnitures</span>
                <span className="hidden sm:inline">Infinity Furnitures & Interior World</span>
              </span>
              <span className="text-[8.5px] sm:text-[9.5px] md:text-[10px] uppercase tracking-[0.16em] sm:tracking-[0.22em] text-[#c5a059] font-medium leading-tight truncate mt-0.5">
                Nigeria Ltd. &bull; Interiors
              </span>
            </div>
          </button>

          {/* Desktop Navigation with Interactive Submenus */}
          <nav className="hidden md:flex items-center gap-7">
            {/* Home Link */}
            <button
              onClick={() => {
                onNavigate('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`text-xs uppercase tracking-[0.2em] transition-colors py-2 relative font-medium cursor-pointer ${
                currentPage === 'home' ? 'text-[#c5a059]' : 'text-[#b0aca3] hover:text-[#e5e2db]'
              }`}
            >
              Home
              {currentPage === 'home' && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#c5a059]"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
            </button>

            {/* Collection Link with Elevated Mega-Submenu */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnterDropdown('collection')}
              onMouseLeave={handleMouseLeaveDropdown}
            >
              <button
                onClick={() => {
                  onNavigate('collection');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] transition-colors py-2 relative font-medium cursor-pointer ${
                  currentPage === 'collection' ? 'text-[#c5a059]' : 'text-[#b0aca3] hover:text-[#e5e2db]'
                }`}
              >
                <span>Collection</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${
                    desktopDropdown === 'collection' ? 'rotate-180 text-[#c5a059]' : 'text-white/40'
                  }`}
                />
                {currentPage === 'collection' && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#c5a059]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              {/* Desktop Collection Mega-Submenu */}
              <AnimatePresence>
                {desktopDropdown === 'collection' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.99, transition: { duration: 0.25, ease: [0.25, 1, 0.5, 1] } }}
                    transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[540px] bg-[#161616]/95 backdrop-blur-2xl border border-[#c5a059]/30 rounded-3xl p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] z-50 transform-gpu"
                  >
                    <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#c5a059] animate-pulse" />
                        <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a059] font-bold">
                          Curated Collections
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setDesktopDropdown(null);
                          onNavigate('collection');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-[10px] uppercase tracking-[0.15em] text-[#b0aca3] hover:text-[#c5a059] flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <span>View All Catalogue</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {collectionSubItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <motion.button
                            key={item.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.04 }}
                            onClick={() => {
                              setDesktopDropdown(null);
                              onNavigate('collection', item.categoryKey);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-left p-3.5 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-[#c5a059]/40 transition-all duration-300 group cursor-pointer flex items-start gap-3"
                          >
                            <div className="w-9 h-9 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/20 flex items-center justify-center text-[#c5a059] group-hover:scale-110 group-hover:bg-[#c5a059] group-hover:text-[#121212] transition-all shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="space-y-0.5">
                              <h4 className="text-xs font-serif text-[#e5e2db] group-hover:text-[#c5a059] transition-colors font-medium">
                                {item.name}
                              </h4>
                              <p className="text-[10px] text-[#b0aca3] leading-relaxed line-clamp-1 font-light">
                                {item.description}
                              </p>
                            </div>
                          </motion.button>
                        );
                      })}

                      {/* Bespoke commission card */}
                      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#c5a059]/15 to-transparent border border-[#c5a059]/30 flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] uppercase tracking-widest text-[#c5a059] font-bold block mb-1">
                            Bespoke Orders
                          </span>
                          <p className="text-[11px] text-[#e5e2db] font-serif leading-tight">
                            Custom timber choices, tailored fabrics & exact dimensional specs.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            setDesktopDropdown(null);
                            onNavigate('contact');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="mt-3 text-[10px] uppercase tracking-wider text-[#c5a059] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <span>Request Custom Piece</span>
                          <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Interiors Link with Elevated Submenu */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnterDropdown('interiors')}
              onMouseLeave={handleMouseLeaveDropdown}
            >
              <button
                onClick={() => {
                  onNavigate('interiors');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] transition-colors py-2 relative font-medium cursor-pointer ${
                  currentPage === 'interiors' ? 'text-[#c5a059]' : 'text-[#b0aca3] hover:text-[#e5e2db]'
                }`}
              >
                <span>Interiors</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-300 ${
                    desktopDropdown === 'interiors' ? 'rotate-180 text-[#c5a059]' : 'text-white/40'
                  }`}
                />
                {currentPage === 'interiors' && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#c5a059]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>

              {/* Desktop Interiors Submenu */}
              <AnimatePresence>
                {desktopDropdown === 'interiors' && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.99, transition: { duration: 0.25, ease: [0.25, 1, 0.5, 1] } }}
                    transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[420px] bg-[#161616]/95 backdrop-blur-2xl border border-[#c5a059]/30 rounded-3xl p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] z-50 transform-gpu"
                  >
                    <div className="flex items-center justify-between pb-3.5 border-b border-white/10 mb-3.5">
                      <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a059] font-bold">
                        Architectural Services
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {interiorSubItems.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                          <motion.button
                            key={item.id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => {
                              setDesktopDropdown(null);
                              onNavigate('interiors');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="w-full text-left p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-[#c5a059]/40 transition-all duration-300 group cursor-pointer flex items-center gap-3.5"
                          >
                            <div className="w-8 h-8 rounded-xl bg-[#c5a059]/10 border border-[#c5a059]/20 flex items-center justify-center text-[#c5a059] group-hover:scale-110 group-hover:bg-[#c5a059] group-hover:text-[#121212] transition-all shrink-0">
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="space-y-0.5">
                              <h4 className="text-xs font-serif text-[#e5e2db] group-hover:text-[#c5a059] transition-colors font-medium">
                                {item.name}
                              </h4>
                              <p className="text-[10px] text-[#b0aca3] font-light">
                                {item.description}
                              </p>
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>

                    <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between">
                      <span className="text-[11px] text-white/50">Need tailored space planning?</span>
                      <button
                        onClick={() => {
                          setDesktopDropdown(null);
                          onNavigate('contact');
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="text-xs uppercase tracking-wider text-[#c5a059] font-semibold hover:underline cursor-pointer"
                      >
                        Book Consultation &rarr;
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Standard Nav Items */}
            {['gallery', 'about', 'contact'].map((pageId) => {
              const isActive = currentPage === pageId;
              const label = pageId.charAt(0).toUpperCase() + pageId.slice(1);
              return (
                <button
                  key={pageId}
                  onClick={() => {
                    onNavigate(pageId);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className={`text-xs uppercase tracking-[0.2em] transition-colors py-2 relative font-medium cursor-pointer ${
                    isActive ? 'text-[#c5a059]' : 'text-[#b0aca3] hover:text-[#e5e2db]'
                  }`}
                >
                  {label}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#c5a059]"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Header Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
            {/* Desktop Quick Social Links */}
            <div className="hidden xl:flex items-center border-r border-white/10 pr-3 mr-1">
              <SocialLinksGroup variant="header" />
            </div>

            {/* User-facing Theme Toggle (Light / Dark High-Contrast) */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light high-contrast theme' : 'Switch to dark theme'}
              title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/20 hover:border-[#c5a059] bg-white/5 hover:bg-[#c5a059]/15 text-[#e5e2db] hover:text-[#c5a059] transition-all duration-300 shadow-xs cursor-pointer flex items-center justify-center group shrink-0 focus:outline-none"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                  <motion.div
                    key="theme-sun"
                    initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                  >
                    <Sun className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#c5a059] group-hover:rotate-45 transition-transform duration-300" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="theme-moon"
                    initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
                    animate={{ rotate: 0, scale: 1, opacity: 1 }}
                    exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.25, 1, 0.5, 1] }}
                  >
                    <Moon className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#9e7426] group-hover:-rotate-12 transition-transform duration-300" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <a
              href={`tel:${(contact.phone1 || contact.phone || '0806 879 5174').replace(/[^0-9+]/g, '')}`}
              className="hidden sm:inline-flex items-center gap-2 border border-white/20 hover:border-[#c5a059] hover:text-[#c5a059] hover:bg-[#c5a059]/10 text-xs uppercase tracking-[0.2em] px-5 py-2.5 rounded-full text-[#e5e2db] transition-all duration-300 shadow-xs"
            >
              <Phone className="w-3.5 h-3.5 text-[#c5a059]" />
              <span>Call Us</span>
            </a>

            {/* Precision Custom Interactive SVG Hamburger Menu */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden relative w-10 h-10 sm:w-11 sm:h-11 rounded-full border border-white/20 hover:border-[#c5a059] bg-white/5 hover:bg-[#c5a059]/10 flex items-center justify-center focus:outline-none transition-all duration-300 shadow-md cursor-pointer group shrink-0"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" className="overflow-visible">
                {/* Top line -> rotates 45deg and moves down to center */}
                <motion.line
                  x1="3"
                  y1="6"
                  x2="21"
                  y2="6"
                  stroke="#e5e2db"
                  strokeWidth="2"
                  strokeLinecap="round"
                  animate={
                    mobileMenuOpen
                      ? { rotate: 45, x1: 5, y1: 5, x2: 19, y2: 19 }
                      : { rotate: 0, x1: 3, y1: 6, x2: 21, y2: 6 }
                  }
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="group-hover:stroke-[#c5a059] transition-colors"
                />
                {/* Middle line -> fades out and scales away */}
                <motion.line
                  x1="3"
                  y1="12"
                  x2="21"
                  y2="12"
                  stroke="#e5e2db"
                  strokeWidth="2"
                  strokeLinecap="round"
                  animate={
                    mobileMenuOpen
                      ? { opacity: 0, scaleX: 0 }
                      : { opacity: 1, scaleX: 1 }
                  }
                  transition={{ duration: 0.2 }}
                  className="group-hover:stroke-[#c5a059] transition-colors"
                />
                {/* Bottom line -> rotates -45deg and moves up to center */}
                <motion.line
                  x1="3"
                  y1="18"
                  x2="21"
                  y2="18"
                  stroke="#e5e2db"
                  strokeWidth="2"
                  strokeLinecap="round"
                  animate={
                    mobileMenuOpen
                      ? { rotate: -45, x1: 5, y1: 19, x2: 19, y2: 5 }
                      : { rotate: 0, x1: 3, y1: 18, x2: 21, y2: 18 }
                  }
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="group-hover:stroke-[#c5a059] transition-colors"
                />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer with Smooth Staggered Accordions & Glassmorphism */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: 'circle(0% at 90% 40px)' }}
            animate={{ opacity: 1, clipPath: 'circle(150% at 90% 40px)' }}
            exit={{ opacity: 0, clipPath: 'circle(0% at 90% 40px)' }}
            transition={{ duration: 0.65, ease: [0.25, 1, 0.5, 1] }}
            className="fixed inset-0 z-40 bg-[#121212]/98 backdrop-blur-2xl text-[#e5e2db] flex flex-col justify-between pt-24 pb-8 px-6 md:hidden overflow-y-auto will-change-transform-opacity"
          >
            {/* Header branding in drawer */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
              <div className="flex items-center gap-2.5">
                <img
                  src={logoSrc}
                  alt="Infinity Furnitures & Interior World Nigeria Ltd"
                  className="h-9 w-auto object-contain shrink-0 drop-shadow-[0_2px_10px_rgba(197,160,89,0.25)]"
                  loading="eager"
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs uppercase tracking-[0.15em] text-[#f5f2eb] font-semibold leading-tight">
                    Infinity Furnitures
                  </span>
                  <span className="text-[8px] uppercase tracking-[0.18em] text-[#c5a059] leading-tight">
                    Nigeria Ltd.
                  </span>
                </div>
              </div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a059]/80 font-medium">
                Directory
              </span>
            </div>

            {/* Navigation List & Accordion Submenus */}
            <div className="flex flex-col gap-2 py-6 overflow-y-auto flex-1">
              {/* Home */}
              <motion.button
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.08 }}
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`text-left text-2xl font-serif py-3 px-2 flex items-center justify-between border-b border-white/5 cursor-pointer ${
                  currentPage === 'home' ? 'text-[#c5a059]' : 'text-[#e5e2db]'
                }`}
              >
                <span>Home</span>
                <ArrowRight className="w-4 h-4 opacity-40" />
              </motion.button>

              {/* Collection Accordion */}
              <div className="border-b border-white/5 py-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.14 }}
                  className="flex items-center justify-between py-2.5 px-2"
                >
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('collection');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`text-2xl font-serif text-left cursor-pointer ${
                      currentPage === 'collection' ? 'text-[#c5a059]' : 'text-[#e5e2db]'
                    }`}
                  >
                    Collection
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleMobileAccordion('collection')}
                    className="p-2 text-[#c5a059] rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Toggle collection sub-items"
                  >
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 ${
                        mobileAccordions.collection ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </motion.div>

                <AnimatePresence>
                  {mobileAccordions.collection && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden pl-4 pr-1 pb-3 space-y-2"
                    >
                      {collectionSubItems.map((sub, sIdx) => {
                        const Icon = sub.icon;
                        return (
                          <motion.button
                            key={sub.id}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: sIdx * 0.05 + 0.05 }}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              onNavigate('collection', sub.categoryKey);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="w-full text-left p-3 rounded-2xl bg-white/[0.03] active:bg-white/[0.08] border border-white/5 flex items-center justify-between group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-lg bg-[#c5a059]/10 text-[#c5a059] flex items-center justify-center">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-sm font-serif text-[#e5e2db] group-hover:text-[#c5a059]">
                                {sub.name}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#c5a059] uppercase tracking-wider font-sans">
                              Explore &rarr;
                            </span>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Interiors Accordion */}
              <div className="border-b border-white/5 py-1">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="flex items-center justify-between py-2.5 px-2"
                >
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate('interiors');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`text-2xl font-serif text-left cursor-pointer ${
                      currentPage === 'interiors' ? 'text-[#c5a059]' : 'text-[#e5e2db]'
                    }`}
                  >
                    Interiors
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleMobileAccordion('interiors')}
                    className="p-2 text-[#c5a059] rounded-full hover:bg-white/10 transition-colors cursor-pointer"
                    aria-label="Toggle interiors sub-items"
                  >
                    <ChevronDown
                      className={`w-5 h-5 transition-transform duration-300 ${
                        mobileAccordions.interiors ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                </motion.div>

                <AnimatePresence>
                  {mobileAccordions.interiors && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      className="overflow-hidden pl-4 pr-1 pb-3 space-y-2"
                    >
                      {interiorSubItems.map((sub, sIdx) => {
                        const Icon = sub.icon;
                        return (
                          <motion.button
                            key={sub.id}
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: sIdx * 0.05 + 0.05 }}
                            onClick={() => {
                              setMobileMenuOpen(false);
                              onNavigate('interiors');
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="w-full text-left p-3 rounded-2xl bg-white/[0.03] active:bg-white/[0.08] border border-white/5 flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-7 h-7 rounded-lg bg-[#c5a059]/10 text-[#c5a059] flex items-center justify-center">
                                <Icon className="w-3.5 h-3.5" />
                              </div>
                              <span className="text-sm font-serif text-[#e5e2db]">
                                {sub.name}
                              </span>
                            </div>
                            <span className="text-[10px] text-[#c5a059] uppercase tracking-wider font-sans">
                              Details &rarr;
                            </span>
                          </motion.button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Gallery, About, Contact */}
              {['gallery', 'about', 'contact'].map((pId, idx) => {
                const label = pId.charAt(0).toUpperCase() + pId.slice(1);
                return (
                  <motion.button
                    key={pId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + idx * 0.06 }}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onNavigate(pId);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className={`text-left text-2xl font-serif py-3 px-2 flex items-center justify-between border-b border-white/5 cursor-pointer ${
                      currentPage === pId ? 'text-[#c5a059]' : 'text-[#e5e2db]'
                    }`}
                  >
                    <span>{label}</span>
                    <ArrowRight className="w-4 h-4 opacity-40" />
                  </motion.button>
                );
              })}
            </div>

            {/* Mobile Theme Toggle Row */}
            <div className="py-3 px-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between mb-2 shrink-0">
              <span className="text-xs uppercase tracking-wider text-[#b0aca3] font-medium flex items-center gap-2">
                {isDark ? <Moon className="w-4 h-4 text-[#c5a059]" /> : <Sun className="w-4 h-4 text-[#9e7426]" />}
                <span>Theme: <strong className="text-white capitalize">{theme} Mode</strong></span>
              </span>
              <button
                type="button"
                onClick={toggleTheme}
                className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#c5a059] text-[#121212] flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform cursor-pointer"
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5" /> Light
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5" /> Dark
                  </>
                )}
              </button>
            </div>

            {/* Mobile Social Channels Bar */}
            <div className="py-4 border-t border-white/10 flex flex-col items-center gap-2 shrink-0">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a059] font-medium">
                Follow Our Workshop
              </span>
              <SocialLinksGroup variant="mobile-drawer" />
            </div>

            {/* Quick Action Bottom Buttons */}
            <div className="pt-2 border-t border-white/10 flex flex-col gap-3 shrink-0">
              <a
                href={`tel:${(contact.phone1 || contact.phone || '0806 879 5174').replace(/[^0-9+]/g, '')}`}
                className="flex items-center justify-center gap-2 bg-[#c5a059] text-[#121212] uppercase tracking-[0.2em] text-xs py-3.5 px-6 rounded-full font-semibold shadow-lg active:scale-95 transition-transform"
              >
                <Phone className="w-4 h-4" />
                <span>Call Showroom</span>
              </a>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="border border-white/20 text-[#e5e2db] uppercase tracking-[0.2em] text-xs py-3.5 px-6 rounded-full hover:border-[#c5a059] active:scale-95 transition-all cursor-pointer"
              >
                Send Bespoke Enquiry
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
