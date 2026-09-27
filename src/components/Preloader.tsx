import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useCMS } from '../context/CMSContext';

interface PreloaderProps {
  onLoaded?: () => void;
  minDuration?: number; // milliseconds (default: 1900)
}

export function Preloader({ onLoaded, minDuration = 1900 }: PreloaderProps) {
  const { activeContent } = useCMS();
  const logoSrc = activeContent.brand?.logoUrl || activeContent.brand?.logo || '/logo.png';
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Smooth progress increment
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        const step = Math.random() * 18 + 12;
        return Math.min(prev + step, 100);
      });
    }, 180);

    const timer = setTimeout(() => {
      setLoading(false);
      onLoaded?.();
    }, minDuration);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [minDuration, onLoaded]);

  return (
    <AnimatePresence mode="wait">
      {loading && (
        <motion.div
          key="infinity-preloader"
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.04,
            filter: 'blur(8px)',
            transition: { duration: 0.85, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[100] bg-[#101010] flex flex-col items-center justify-center text-[#e5e2db] overflow-hidden select-none pointer-events-auto"
        >
          {/* Ambient luminous glow behind monogram */}
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{
              opacity: [0.15, 0.45, 0.25],
              scale: [0.8, 1.2, 1],
            }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className="absolute w-96 h-96 rounded-full bg-[radial-gradient(circle,#c5a059_0%,rgba(197,160,89,0)_70%)] blur-3xl pointer-events-none"
          />

          {/* Luxury Monogram & Brand Presentation */}
          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md">
            {/* Prominent Permanent Official Logo Emblem */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 mb-6 flex items-center justify-center"
            >
              <img
                src={logoSrc}
                alt="Infinity Furnitures and Interior World Official Emblem"
                className="w-full h-full object-contain drop-shadow-[0_10px_35px_rgba(197,160,89,0.4)]"
                loading="eager"
                decoding="sync"
              />

              {/* Shimmer pulse badge in the center */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 0.8, 0], scale: [0.7, 1.3, 1.7] }}
                transition={{ delay: 0.9, duration: 1.4, repeat: Infinity, repeatDelay: 1.8 }}
                className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-[radial-gradient(circle,#f3e3ba_0%,rgba(197,160,89,0)_75%)] blur-md pointer-events-none"
              />
            </motion.div>

            {/* Staggered Typography Reveal */}
            <div className="space-y-2 overflow-hidden mb-8 max-w-xs sm:max-w-md px-2">
              <motion.h1
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="text-lg sm:text-2xl font-serif tracking-[0.25em] sm:tracking-[0.35em] text-[#e5e2db] font-light uppercase text-center"
              >
                Infinity Furnitures
              </motion.h1>

              <motion.div
                initial={{ y: 16, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.55, duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-[11px] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] text-[#c5a059] font-medium text-center"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="w-4 sm:w-6 h-[1px] bg-[#c5a059]/40" />
                  <span>& Interior World</span>
                  <span className="w-4 sm:w-6 h-[1px] bg-[#c5a059]/40 sm:hidden" />
                </div>
                <span className="text-[10px] sm:text-xs tracking-[0.25em] text-[#e5e2db]/80 font-sans sm:border-l sm:border-[#c5a059]/40 sm:pl-3">
                  Nigeria Limited
                </span>
                <span className="hidden sm:inline-block w-6 h-[1px] bg-[#c5a059]/40" />
              </motion.div>
            </div>

            {/* Artisanal Progress Bar */}
            <div className="w-56 space-y-2.5">
              <div className="relative h-[2px] bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: progress / 100 }}
                  transition={{ ease: 'easeOut', duration: 0.3 }}
                  style={{ originX: 0 }}
                  className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-[#967434] via-[#c5a059] to-[#f3e3ba]"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] tracking-[0.2em] uppercase text-white/40 font-mono">
                <span>Atelier Prep</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          </div>

          {/* Subtle bottom tagline */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="absolute bottom-10 text-[10px] tracking-[0.25em] uppercase text-white/30 text-center font-light"
          >
            Handcrafted Architectural Living &bull; Jos, Plateau State
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
