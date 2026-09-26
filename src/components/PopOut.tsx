import { ReactNode, CSSProperties } from 'react';
import { motion, Variants } from 'motion/react';

export type PopDirection =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'scale'
  | 'pop-up'
  | 'pop-out'
  | 'pop-combo'
  | 'late-pop'
  | 'pop-3d'
  | 'pop-left'
  | 'pop-right';

export interface PopOutProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: PopDirection;
  once?: boolean;
  amount?: number | 'some' | 'all';
  hoverPop?: boolean;
  style?: CSSProperties;
  onClick?: () => void;
  id?: string;
  staggerChildren?: number;
}

// Global luxury easing curve: smooth, steady, deceleration without abrupt stops
export const LUXURY_EASE: [number, number, number, number] = [0.25, 1, 0.5, 1];

export function PopOut({
  children,
  className = '',
  delay = 0,
  direction = 'pop-combo',
  once = false,
  amount = 0.15,
  hoverPop = false,
  style,
  onClick,
  id,
}: PopOutProps) {
  const getInitial = () => {
    switch (direction) {
      case 'pop-up':
      case 'up':
        // Smooth slide-up with subtle low offset (20px)
        return { opacity: 0, y: 22, scale: 0.98 };
      case 'pop-out':
      case 'scale':
        // Soft outward presence with gentle scale and low offset
        return { opacity: 0, scale: 0.95, y: 12 };
      case 'pop-combo':
        // Synchronized low elevation and soft scale
        return { opacity: 0, y: 24, scale: 0.96, rotateX: 3 };
      case 'late-pop':
        // Smooth late reveal
        return { opacity: 0, y: 26, scale: 0.97 };
      case 'pop-3d':
        // Gentle 3D perspective elevation
        return { opacity: 0, y: 22, scale: 0.96, rotateX: 4 };
      case 'pop-left':
      case 'left':
        return { opacity: 0, x: -24, y: 8, scale: 0.98 };
      case 'pop-right':
      case 'right':
        return { opacity: 0, x: 24, y: 8, scale: 0.98 };
      case 'down':
        return { opacity: 0, y: -20, scale: 0.98 };
      default:
        return { opacity: 0, y: 22, scale: 0.97 };
    }
  };

  const calculatedDelay = direction === 'late-pop' ? delay + 0.15 : delay;

  return (
    <motion.div
      id={id}
      style={{
        transformStyle: 'preserve-3d',
        transformPerspective: 1200,
        ...style,
      }}
      onClick={onClick}
      initial={getInitial()}
      whileInView={{
        opacity: 1,
        y: 0,
        x: 0,
        scale: 1,
        rotateX: 0,
        z: 0,
      }}
      viewport={{
        once,
        amount,
        margin: '-30px 0px -30px 0px',
      }}
      transition={{
        duration: direction === 'late-pop' ? 0.95 : 0.85,
        delay: calculatedDelay,
        ease: LUXURY_EASE,
      }}
      whileHover={
        hoverPop
          ? {
              scale: 1.02,
              y: -4,
              rotateX: -1,
              transition: { duration: 0.4, ease: LUXURY_EASE },
            }
          : undefined
      }
      className={`transform-gpu will-change-transform-opacity ${className}`}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggerContainer component for rendering groups of child items
 * with automatic staggered pop-up reveals
 */
export function StaggerPopContainer({
  children,
  className = '',
  staggerDelay = 0.15,
  once = false,
  amount = 0.15,
  id,
}: {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
  amount?: number | 'some' | 'all';
  id?: string;
}) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.08,
      },
    },
  };

  return (
    <motion.div
      id={id}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once, amount }}
      className={`transform-gpu will-change-transform-opacity ${className}`}
    >
      {children}
    </motion.div>
  );
}

/**
 * Individual staggered child item with smooth, steady reveal
 */
export function StaggerPopItem({
  children,
  className = '',
  direction = 'pop-combo',
  id,
}: {
  children: ReactNode;
  className?: string;
  direction?: 'pop-up' | 'pop-out' | 'pop-combo' | 'late-pop';
  id?: string;
}) {
  const itemVariants: Variants = {
    hidden:
      direction === 'pop-out'
        ? { opacity: 0, scale: 0.95, y: 10 }
        : direction === 'late-pop'
        ? { opacity: 0, y: 24, scale: 0.97 }
        : { opacity: 0, y: 20, scale: 0.98 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.85,
        ease: LUXURY_EASE,
      },
    },
  };

  return (
    <motion.div
      id={id}
      variants={itemVariants}
      className={`transform-gpu will-change-transform-opacity ${className}`}
    >
      {children}
    </motion.div>
  );
}
