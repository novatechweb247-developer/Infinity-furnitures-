import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ProductItem } from '../types';
import { useCMS } from '../context/CMSContext';
import { X, MessageSquare, Phone, Mail, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { LUXURY_EASE } from './PopOut';

interface ProductDetailModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onEnquire?: (product: ProductItem) => void;
}

export function ProductDetailModal({ product, onClose, onEnquire }: ProductDetailModalProps) {
  const { activeContent } = useCMS();
  const contact = activeContent.contact || activeContent.brand || {};

  if (!product) return null;

  const title = product.name || product.title || 'Bespoke Piece';
  const displayPrice = product.formattedPrice || product.price || 'Price on request';
  const materials = product.materials || product.material;
  const rawImages =
    product.images && product.images.length > 0
      ? product.images
      : [product.primaryImage || product.image || ''];
  const images = Array.from(
    new Set([product.primaryImage || product.image, ...rawImages].filter(Boolean) as string[])
  );
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const whatsappMessage = encodeURIComponent(
    `Hello Infinity Furnitures and Interior World Nigeria Limited, I am interested in your bespoke piece: "${title}" (${displayPrice}). Please provide more details on ordering and customization.`
  );
  const whatsappUrl = `https://wa.me/${contact.whatsapp || '2348068795174'}?text=${whatsappMessage}`;

  const handlePrev = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: LUXURY_EASE }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md will-change-transform-opacity"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: 10 }}
          transition={{ duration: 0.45, ease: LUXURY_EASE }}
          className="bg-[#181818] border border-white/10 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl text-[#e5e2db] flex flex-col md:flex-row overflow-hidden relative will-change-transform-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 border border-white/20 flex items-center justify-center text-white/80 hover:text-white transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-105 active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Product Images Gallery */}
          <div className="md:w-1/2 bg-[#121212] p-4 sm:p-6 flex flex-col justify-between relative">
            <div className="relative aspect-4/3 sm:aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-white/10">
              <img
                src={images[activeImageIndex]}
                alt={title}
                className="w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)]"
              />

              {/* Carousel Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center border border-white/20 transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails Row */}
            {images.length > 1 && (
              <div className="flex items-center gap-2.5 mt-4 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#c5a059] ring-2 ring-[#c5a059]/40 scale-105'
                        : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Specifications & Enquiry */}
          <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a059] font-medium block mb-1">
                  {product.category}
                </span>
                <h2 className="text-2xl sm:text-3xl font-serif text-[#e5e2db]">{title}</h2>
                <div className="mt-2 text-xl font-serif text-[#c5a059]">{displayPrice}</div>
              </div>

              <p className="text-[#b0aca3] text-xs sm:text-sm leading-relaxed font-light">
                {product.description}
              </p>

              {/* Spec Attributes */}
              <div className="space-y-2.5 pt-2 border-t border-white/10 text-xs">
                {product.dimensions && (
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-[#b0aca3]">Dimensions</span>
                    <span className="text-[#e5e2db] font-medium">{product.dimensions}</span>
                  </div>
                )}
                {materials && (
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-[#b0aca3]">Materials</span>
                    <span className="text-[#e5e2db] font-medium">{materials}</span>
                  </div>
                )}
                {product.leadTime && (
                  <div className="flex justify-between py-1 border-b border-white/5">
                    <span className="text-[#b0aca3]">Production Lead Time</span>
                    <span className="text-[#e5e2db] font-medium">{product.leadTime}</span>
                  </div>
                )}
                <div className="flex justify-between py-1">
                  <span className="text-[#b0aca3]">Availability</span>
                  <span className="text-emerald-400 font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Custom Crafted Upon Order</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Action CTAs */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#25D366] hover:bg-[#1faa53] text-white py-3.5 px-6 rounded-full text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 shadow-lg transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-102 active:scale-95"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Inquire via WhatsApp</span>
              </a>
              <div className="flex items-center gap-3">
                <a
                  href={`tel:${contact.phone1}`}
                  className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-[#e5e2db] py-3 rounded-full text-xs uppercase tracking-[0.15em] font-medium flex items-center justify-center gap-2 transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] text-center hover:scale-102 active:scale-95"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call Showroom</span>
                </a>
                {onEnquire && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onEnquire(product);
                    }}
                    className="flex-1 bg-[#c5a059] hover:bg-[#b08e4c] text-[#121212] py-3 rounded-full text-xs uppercase tracking-[0.15em] font-medium flex items-center justify-center gap-2 transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer hover:scale-102 active:scale-95"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Request Quote</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
