import { PopOut } from './PopOut';
import { useCMS } from '../context/CMSContext';
import { SocialLinksGroup } from './SocialIcons';

interface FooterProps {
  onNavigate: (page: string) => void;
}

export function Footer({ onNavigate }: FooterProps) {
  const { activeContent } = useCMS();
  const brand = activeContent.brand || {};
  const logoSrc = brand.logoUrl || brand.logo || '/logo.png';

  return (
    <footer className="bg-[#121212] text-neutral-300 py-16 border-t border-white/10 relative z-10">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <PopOut direction="pop-up">
          {/* Top Official Brand Logo Emblem Header */}
          <div className="flex flex-col items-center justify-center text-center mb-12 pb-10 border-b border-white/10">
            <button
              onClick={() => {
                onNavigate('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="group focus:outline-none cursor-pointer flex flex-col items-center"
              aria-label="Infinity Furnitures & Interior World Nigeria Ltd - Return to top"
            >
              <div className="relative flex items-center justify-center mb-4">
                <img
                  src={logoSrc}
                  alt="Infinity Furnitures & Interior World Nigeria Ltd Official Emblem"
                  className="h-24 sm:h-28 md:h-32 w-auto object-contain drop-shadow-[0_10px_30px_rgba(197,160,89,0.3)] transform-gpu transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-serif tracking-[0.14em] sm:tracking-[0.18em] text-[#f5f2eb] uppercase font-medium text-center">
                Infinity Furnitures & Interior World Nigeria Ltd
              </h3>
              <p className="text-[10px] sm:text-xs uppercase tracking-[0.28em] text-[#c5a059] font-medium mt-1.5">
                Bespoke Hardwood Joinery & Architectural Interiors &bull; Lagos &bull; Abuja
              </p>
            </button>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-10">
            {/* Business Legal Branding */}
            <div className="flex items-center gap-3.5 text-center lg:text-left">
              <img
                src={logoSrc}
                alt="Infinity Furnitures & Interior World Nigeria Ltd"
                className="h-10 w-auto object-contain shrink-0 drop-shadow-[0_2px_8px_rgba(197,160,89,0.25)]"
              />
              <div className="flex flex-col text-left">
                <span className="text-sm sm:text-base md:text-lg font-serif tracking-[0.12em] sm:tracking-[0.16em] text-white font-medium">
                  Infinity Furnitures & Interior World Nigeria Ltd
                </span>
                <span className="text-[9px] uppercase tracking-[0.22em] text-[#c5a059] font-sans">
                  Luxury Furnishings & Bespoke Joinery
                </span>
              </div>
            </div>

            {/* Public Page Navigation Links */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-xs uppercase tracking-[0.2em]">
              <button
                onClick={() => {
                  onNavigate('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#b89753] transition-colors cursor-pointer"
              >
                Home
              </button>
              <button
                onClick={() => {
                  onNavigate('collection');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#b89753] transition-colors cursor-pointer"
              >
                Collection
              </button>
              <button
                onClick={() => {
                  onNavigate('interiors');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#b89753] transition-colors cursor-pointer"
              >
                Interiors
              </button>
              <button
                onClick={() => {
                  onNavigate('gallery');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#b89753] transition-colors cursor-pointer"
              >
                Gallery
              </button>
              <button
                onClick={() => {
                  onNavigate('about');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#b89753] transition-colors cursor-pointer"
              >
                About
              </button>
              <button
                onClick={() => {
                  onNavigate('contact');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-[#b89753] transition-colors cursor-pointer"
              >
                Contact
              </button>
            </div>
          </div>

          {/* Social Channels Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-neutral-800/80">
            <div className="text-xs text-neutral-400 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#c5a059]" />
              <span className="uppercase tracking-[0.2em] font-medium text-neutral-300">
                Connect With Our Workshop:
              </span>
            </div>
            <SocialLinksGroup variant="footer" />
          </div>

          {/* Copyright & Tagline */}
          <div className="border-t border-neutral-800/80 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-center md:text-left">
            <p className="text-neutral-500 tracking-wider">
              &copy; {new Date().getFullYear()} {brand.businessName || 'Infinity Furnitures & Interior World Nigeria Ltd'}. All rights reserved.
            </p>
            <p className="text-[#c5a059]/80 tracking-wider font-serif">
              {brand.tagline || 'Crafted for Timeless Elegance'}
            </p>
          </div>
        </PopOut>
      </div>
    </footer>
  );
}
