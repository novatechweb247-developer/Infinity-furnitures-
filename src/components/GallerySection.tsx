import { useState } from 'react';
import { GALLERY_IMAGES } from '../data';
import { useCMS } from '../context/CMSContext';
import { GalleryImage } from '../types';
import { Maximize2, X } from 'lucide-react';
import { PopOut } from './PopOut';
import { Card3D, Card3DLayer } from './Card3D';
import { motion, AnimatePresence } from 'motion/react';

export function GallerySection() {
  const { activeContent } = useCMS();
  const galleryItems = activeContent?.gallery && activeContent.gallery.length > 0
    ? activeContent.gallery
    : GALLERY_IMAGES;

  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  return (
    <section id="gallery" className="py-24 md:py-32 bg-[#121212] border-b border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <PopOut className="mb-16" direction="pop-up">
          <span className="text-xs uppercase tracking-[0.3em] text-[#c5a059] block mb-3 font-medium">
            Atelier Gallery
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-light text-[#e5e2db]">
            Selected Architectural Commissions
          </h2>
        </PopOut>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {galleryItems.map((item, index) => (
            <PopOut
              key={item.id}
              direction={index % 2 === 0 ? 'pop-up' : 'late-pop'}
              delay={index * 0.08}
              className={index === 0 ? 'md:col-span-2' : ''}
            >
              <Card3D
                depth={6}
                scaleOnHover={1.02}
                elevateZ={20}
                className="rounded-3xl h-full"
                onClick={() => setSelectedImage(item)}
              >
                <div className="group relative bg-[#1a1a1a] p-3.5 border border-white/10 cursor-pointer overflow-hidden rounded-3xl shadow-xl transition-colors duration-500 hover:border-[#c5a059]/40 h-full flex flex-col justify-between">
                  <Card3DLayer depth={15}>
                    <div className="relative overflow-hidden rounded-2xl">
                      <img
                        src={item.image || GALLERY_IMAGES[index % GALLERY_IMAGES.length]?.image || ''}
                        alt={item.title}
                        className={`w-full object-cover object-center rounded-2xl filter brightness-[0.93] contrast-[1.04] group-hover:scale-104 transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                          index === 0 ? 'h-[380px] md:h-[500px]' : 'h-[360px]'
                        }`}
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] flex items-center justify-center rounded-2xl">
                        <div className="w-12 h-12 rounded-full bg-[#121212]/90 backdrop-blur-md border border-white/20 flex items-center justify-center text-[#e5e2db] shadow-xl group-hover:scale-110 group-hover:border-[#c5a059] transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)]">
                          <Maximize2 className="w-5 h-5 text-[#c5a059]" />
                        </div>
                      </div>
                    </div>
                  </Card3DLayer>

                  <Card3DLayer depth={35}>
                    <div className="pt-4 pb-2 px-2 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a059] block mb-1 font-medium">
                          {item.category}
                        </span>
                        <h3 className="text-lg font-serif text-[#e5e2db] group-hover:text-[#c5a059] transition-colors">
                          {item.title}
                        </h3>
                      </div>
                      <span className="text-xs text-white/40 tracking-widest font-serif">0{index + 1}</span>
                    </div>
                  </Card3DLayer>
                </div>
              </Card3D>
            </PopOut>
          ))}
        </div>
      </div>

      {/* Lightbox Modal with AnimatePresence */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 md:p-8"
            onClick={() => setSelectedImage(null)}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center text-white/70 hover:text-white z-50 bg-white/10 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-6 h-6" />
            </button>
            <motion.div
              initial={{ scale: 0.96, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.98, y: 10 }}
              transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
              className="relative max-w-5xl w-full bg-[#1a1a1a] p-4 border border-white/20 shadow-2xl rounded-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.image}
                alt={selectedImage.title}
                className="w-full max-h-[75vh] object-contain rounded-2xl"
              />
              <div className="mt-4 flex items-center justify-between px-3">
                <div>
                  <span className="text-xs uppercase tracking-[0.2em] text-[#c5a059]">
                    {selectedImage.category}
                  </span>
                  <h3 className="text-xl font-serif text-[#e5e2db]">{selectedImage.title}</h3>
                </div>
                <button
                  onClick={() => setSelectedImage(null)}
                  className="text-xs uppercase tracking-[0.2em] border border-white/20 px-6 py-2.5 rounded-full text-[#e5e2db] hover:border-[#c5a059] transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
