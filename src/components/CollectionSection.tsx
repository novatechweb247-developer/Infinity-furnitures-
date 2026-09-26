import { useState, useMemo } from 'react';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { PopOut } from './PopOut';
import { Card3D, Card3DLayer } from './Card3D';
import { motion, AnimatePresence } from 'motion/react';
import { LUXURY_EASE } from './PopOut';
import { useCMS } from '../context/CMSContext';

interface CollectionItem {
  id: string;
  number: string;
  title: string;
  description: string;
  image: string;
  features: string[];
}

const COLLECTIONS: CollectionItem[] = [
  {
    id: 'sofas-chairs',
    number: '01',
    title: 'Sofas & Lounge Chairs',
    description: 'Bespoke sectional seating, Chesterfield silhouettes, and sculptural accent armchairs crafted with high-density core foam and imported bouclés, velvets, and top-grain Italian leathers.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    features: ['Solid Hardwood Frames', 'Italian Leather & Velvet', 'High-Density Foam'],
  },
  {
    id: 'dining',
    number: '02',
    title: 'Dining Tables & Chairs',
    description: 'Monumental dining tables in solid cured teak, walnut, and tempered stone paired with ergonomically sculpted dining chairs designed for opulent dinner parties.',
    image: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
    features: ['Solid Teak & Cured Oak', '8-12 Seater Layouts', 'Stain-Resistant Finishes'],
  },
  {
    id: 'beds',
    number: '03',
    title: 'Beds & Headboards',
    description: 'Sanctuary bedroom suites featuring architectural floating frames, integrated LED nightstands, and deep tufted acoustic headboards crafted to bespoke dimensional specifications.',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
    features: ['Acoustic Headboards', 'Integrated Storage', 'Custom King & Super King'],
  },
  {
    id: 'wardrobes',
    number: '04',
    title: 'Wardrobes & Joinery',
    description: 'Floor-to-ceiling walk-in wardrobes, fluted display vitrines, and custom cabinetry equipped with soft-close German Blum hardware and motion-sensor perimeter lighting.',
    image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
    features: ['Blum Soft-Close Systems', 'Fluted Glass Accents', 'Integrated Sensor Lighting'],
  },
  {
    id: 'executive',
    number: '05',
    title: 'Executive Desks & Consoles',
    description: 'Commanding office desks, credenzas, and entryway console tables combining rich bookmatched veneers, brushed brass inlays, and integrated wire management channels.',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1200&q=80',
    features: ['Bookmatched Veneers', 'Brushed Brass Inlays', 'Concealed Wire Ducts'],
  },
];

interface CollectionSectionProps {
  onSelectCollection: (category: string) => void;
}

export function CollectionSection({ onSelectCollection }: CollectionSectionProps) {
  const { activeContent } = useCMS();
  const collectionsList = useMemo(() => {
    if (activeContent?.collections && activeContent.collections.length > 0) {
      return activeContent.collections;
    }
    return COLLECTIONS;
  }, [activeContent?.collections]);

  const [activeId, setActiveId] = useState<string>('sofas-chairs');

  const activeItem = useMemo(() => {
    const found = collectionsList.find((c) => c.id === activeId);
    return found || collectionsList[0] || COLLECTIONS[0];
  }, [collectionsList, activeId]);

  return (
    <section id="collection-section" className="py-24 md:py-32 bg-[#121212] text-white overflow-hidden relative">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header with Staggered Fluid Pop-Ups */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <PopOut direction="pop-up">
              <span className="text-xs uppercase tracking-[0.3em] text-[#c5a059] font-semibold block mb-3">
                Curated Portfolio
              </span>
            </PopOut>
            <PopOut direction="pop-up" delay={0.08}>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif text-[#e5e2db] font-light">
                Our Bespoke Collections
              </h2>
            </PopOut>
          </div>
          <PopOut direction="late-pop" delay={0.12}>
            <p className="text-neutral-400 font-light max-w-md text-sm md:text-base leading-relaxed">
              Every creation is individually engineered and handcrafted inside our dedicated Nigerian workshop using generational timber joinery and luxury finishes.
            </p>
          </PopOut>
        </div>

        {/* Interactive Master Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left: Category Accordion Selector */}
          <div className="lg:col-span-6 space-y-4">
            {collectionsList.map((item, index) => {
              const isActive = item.id === (activeItem?.id || activeId);
              return (
                <PopOut key={item.id} direction="pop-up" delay={index * 0.08}>
                  <div
                    onClick={() => setActiveId(item.id)}
                    className={`p-6 rounded-2xl border transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer group select-none ${
                      isActive
                        ? 'bg-white/[0.07] border-[#c5a059] shadow-[0_10px_30px_rgba(0,0,0,0.5)]'
                        : 'bg-white/[0.02] border-white/10 hover:border-white/25 hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline gap-6">
                        <span className={`text-sm font-serif transition-colors duration-400 ${isActive ? 'text-[#c5a059]' : 'text-white/40'}`}>
                          {item.number}
                        </span>
                        <h3
                          className={`text-2xl sm:text-3xl font-serif transition-colors duration-400 ${
                            isActive ? 'text-[#e5e2db]' : 'text-white/60 group-hover:text-[#e5e2db]'
                          }`}
                        >
                          {item.title}
                        </h3>
                      </div>
                      <div
                        className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] ${
                          isActive
                            ? 'border-[#c5a059] bg-[#c5a059] text-[#121212] scale-105'
                            : 'border-white/20 text-white/60 group-hover:border-white group-hover:text-white'
                        }`}
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                    </div>

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: 8 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -6 }}
                          transition={{ duration: 0.55, ease: LUXURY_EASE }}
                          className="mt-4 pl-10 pr-4 overflow-hidden"
                        >
                          <p className="text-[#b0aca3] text-sm leading-relaxed mb-4">{item.description}</p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectCollection(item.id);
                            }}
                            className="text-xs uppercase tracking-[0.2em] text-[#c5a059] hover:text-white border border-[#c5a059]/40 hover:bg-[#c5a059] px-5 py-2.5 rounded-full inline-flex items-center gap-2 font-medium transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] cursor-pointer shadow-md hover:shadow-lg active:scale-95"
                          >
                            <span>Explore Pieces</span>
                            <span aria-hidden="true">&rarr;</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </PopOut>
              );
            })}
          </div>

          {/* Right: Active Collection Preview Image in 3D Card */}
          <div className="lg:col-span-6 sticky top-28">
            <PopOut direction="pop-out" delay={0.15}>
              <Card3D depth={8} scaleOnHover={1.02} elevateZ={20} className="rounded-3xl">
                <div className="relative group overflow-hidden bg-[#1a1a1a] p-3 border border-white/10 shadow-2xl rounded-3xl">
                  {/* Floating Top Badge */}
                  <Card3DLayer depth={30}>
                    <div className="absolute top-6 left-6 z-20 bg-[#121212]/90 backdrop-blur-md px-4 py-2 border border-white/15 rounded-full shadow-lg flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span className="text-xs uppercase tracking-[0.2em] text-[#c5a059] font-medium">
                        {activeItem.number} / {activeItem.title}
                      </span>
                    </div>
                  </Card3DLayer>

                  {/* Image Surface with Depth */}
                  <Card3DLayer depth={15}>
                    <div className="relative rounded-2xl overflow-hidden aspect-4/3 sm:aspect-auto sm:h-[480px]">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={activeItem.id}
                          src={activeItem.image}
                          alt={activeItem.title}
                          initial={{ opacity: 0, scale: 1.04 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.7, ease: LUXURY_EASE }}
                          className="w-full h-full object-cover object-center rounded-2xl filter brightness-[0.93] contrast-[1.04]"
                        />
                      </AnimatePresence>
                    </div>
                  </Card3DLayer>

                  {/* Bottom Highlight Pills with 3D Elevation */}
                  <Card3DLayer depth={36}>
                    <div className="absolute inset-x-3 bottom-3 bg-gradient-to-t from-[#121212] via-[#121212]/75 to-transparent p-6 pt-16 rounded-b-2xl">
                      <p className="text-xs text-[#b0aca3] mb-3 uppercase tracking-wider font-medium">
                        Key Atelier Specifications:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(activeItem.features) &&
                          activeItem.features.map((feat, idx) => (
                            <span
                              key={idx}
                              className="text-xs bg-white/10 backdrop-blur-md text-[#e5e2db] px-3.5 py-1.5 border border-white/15 rounded-full font-medium shadow-xs"
                            >
                              {feat}
                            </span>
                          ))}
                      </div>
                    </div>
                  </Card3DLayer>
                </div>
              </Card3D>
            </PopOut>
          </div>
        </div>
      </div>
    </section>
  );
}
