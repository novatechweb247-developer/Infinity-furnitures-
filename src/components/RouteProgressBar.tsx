import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';

interface RouteProgressBarProps {
  currentPage: string;
  triggerKey?: number | string;
}

export function RouteProgressBar({ currentPage, triggerKey }: RouteProgressBarProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);
  const previousPageRef = useRef<string>(currentPage);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);
  const isMountedRef = useRef(false);

  const clearAllTimeouts = useCallback(() => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  }, []);

  const runAnimation = useCallback(() => {
    clearAllTimeouts();
    setIsVisible(true);
    setProgress(15);

    // Step 1: Rapid jump to initiate perceived responsiveness
    const t1 = setTimeout(() => {
      setProgress(40);
    }, 60);

    // Step 2: Smooth acceleration through mid-load
    const t2 = setTimeout(() => {
      setProgress(72);
    }, 180);

    // Step 3: High threshold before complete transition
    const t3 = setTimeout(() => {
      setProgress(90);
    }, 320);

    // Step 4: Rapid completion to 100%
    const t4 = setTimeout(() => {
      setProgress(100);
    }, 500);

    // Step 5: Soft fade-out
    const t5 = setTimeout(() => {
      setIsVisible(false);
    }, 780);

    // Step 6: Reset progress bar ready for next route transition
    const t6 = setTimeout(() => {
      setProgress(0);
    }, 1050);

    timeoutsRef.current = [t1, t2, t3, t4, t5, t6];
  }, [clearAllTimeouts]);

  // Trigger on route changes
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      previousPageRef.current = currentPage;
      return;
    }

    if (previousPageRef.current !== currentPage) {
      previousPageRef.current = currentPage;
      runAnimation();
    }
  }, [currentPage, runAnimation]);

  // Optional trigger for navigation actions
  useEffect(() => {
    if (triggerKey !== undefined && triggerKey !== null && isMountedRef.current) {
      runAnimation();
    }
  }, [triggerKey, runAnimation]);

  useEffect(() => {
    return () => {
      clearAllTimeouts();
    };
  }, [clearAllTimeouts]);

  if (!isVisible && progress === 0) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[100] h-[3px] sm:h-[3.5px] pointer-events-none overflow-hidden select-none"
    >
      <motion.div
        className="h-full relative bg-gradient-to-r from-[#8a6d2b] via-[#c5a059] to-[#f3dfa2]"
        style={{
          boxShadow: '0 0 12px rgba(197, 160, 89, 0.85), 0 0 4px rgba(212, 175, 55, 1)',
        }}
        initial={{ width: '0%', opacity: 1 }}
        animate={{
          width: `${progress}%`,
          opacity: isVisible ? 1 : 0,
        }}
        transition={{
          width: {
            duration: progress === 100 ? 0.22 : 0.26,
            ease: [0.25, 1, 0.5, 1],
          },
          opacity: {
            duration: 0.26,
            ease: 'easeInOut',
          },
        }}
      >
        {/* Leading incandescent light glow flare on the head of the progress bar */}
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-r from-transparent via-white/40 to-white/90 blur-[0.5px]" />
        <div className="absolute right-0 -top-[2px] -bottom-[2px] w-5 bg-[#fff8e7] rounded-full shadow-[0_0_12px_3px_rgba(243,223,162,0.95)] opacity-95" />
      </motion.div>
    </div>
  );
}
