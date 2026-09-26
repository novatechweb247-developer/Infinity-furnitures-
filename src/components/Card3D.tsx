import React, { useRef, useState, useCallback, ReactNode, CSSProperties } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface Card3DProps {
  children: ReactNode;
  className?: string;
  depth?: number; // max tilt degrees (default: 6)
  glare?: boolean;
  scaleOnHover?: number;
  elevateZ?: number;
  onClick?: () => void;
  style?: CSSProperties;
  id?: string;
}

export function Card3D({
  children,
  className = '',
  depth = 6,
  glare = true,
  scaleOnHover = 1.02,
  elevateZ = 16,
  onClick,
  style,
  id,
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Raw mouse coordinates relative to card center (-0.5 to 0.5)
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Luxurious, smooth fluid springs without harsh stops
  const springConfig = { damping: 28, stiffness: 140, mass: 0.8 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [depth, -depth]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-depth, depth]), springConfig);
  const scale = useSpring(isHovered ? scaleOnHover : 1, springConfig);

  // Dynamic shadow shift based on tilt
  const shadowX = useSpring(useTransform(x, [-0.5, 0.5], [14, -14]), springConfig);
  const shadowY = useSpring(useTransform(y, [-0.5, 0.5], [14, -14]), springConfig);

  // Glare position and dynamic gradient
  const glareX = useSpring(useTransform(x, [-0.5, 0.5], [0, 100]), springConfig);
  const glareY = useSpring(useTransform(y, [-0.5, 0.5], [0, 100]), springConfig);
  const glareBackground = useTransform(
    [glareX, glareY],
    ([gx, gy]) =>
      `radial-gradient(circle 280px at ${gx}% ${gy}%, rgba(255,255,255,0.12) 0%, rgba(197,160,89,0.06) 40%, transparent 80%)`
  );

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Normalize coordinates from -0.5 (left/top) to 0.5 (right/bottom)
    const normX = mouseX / rect.width - 0.5;
    const normY = mouseY / rect.height - 0.5;

    x.set(normX);
    y.set(normY);
  }, [x, y]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    x.set(0);
    y.set(0);
  };

  return (
    <div
      id={id}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        perspective: '1200px',
        ...style,
      }}
      className={`relative transform-gpu will-change-transform-opacity ${className}`}
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          scale,
          transformStyle: 'preserve-3d',
        }}
        className="relative w-full h-full rounded-[inherit] transition-[box-shadow] duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
      >
        {/* Dynamic 3D depth shadow projection */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
            style={{
              x: shadowX,
              y: shadowY,
              filter: 'blur(24px)',
            }}
            className="absolute inset-0 bg-[#c5a059]/15 rounded-[inherit] pointer-events-none -z-10"
          />
        )}

        {/* Content surface */}
        <div
          style={{
            transform: isHovered ? `translateZ(${elevateZ}px)` : 'translateZ(0px)',
            transition: 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)',
            transformStyle: 'preserve-3d',
          }}
          className="w-full h-full rounded-[inherit]"
        >
          {children}
        </div>

        {/* Tactile Glare / Specular highlight layer */}
        {glare && isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
            style={{
              background: glareBackground,
            }}
            className="absolute inset-0 rounded-[inherit] pointer-events-none mix-blend-overlay z-20"
          />
        )}
      </motion.div>
    </div>
  );
}

/**
 * Child helper component to pop out inner elements along the Z-axis
 */
export function Card3DLayer({
  children,
  depth = 24,
  className = '',
}: {
  children: ReactNode;
  depth?: number;
  className?: string;
}) {
  return (
    <div
      style={{
        transform: `translateZ(${depth}px)`,
        transformStyle: 'preserve-3d',
        transition: 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)',
      }}
      className={`transform-gpu ${className}`}
    >
      {children}
    </div>
  );
}
