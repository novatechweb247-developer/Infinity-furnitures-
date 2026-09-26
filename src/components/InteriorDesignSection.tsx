import { useState } from 'react';
import { INTERIOR_SERVICES } from '../data';
import { useCMS } from '../context/CMSContext';
import { InteriorService } from '../types';
import { Check, Sparkles, Compass } from 'lucide-react';
import { PopOut } from './PopOut';
import { Card3D, Card3DLayer } from './Card3D';
import { motion, AnimatePresence } from 'motion/react';

export function InteriorDesignSection() {
  const { activeContent } = useCMS();
  const servicesList: InteriorService[] = (activeContent.services && activeContent.services.length > 0)
    ? activeContent.services
    : (activeContent.interiorServices && activeContent.interiorServices.length > 0
        ? activeContent.interiorServices
        : INTERIOR_SERVICES);

  const [activeServiceId, setActiveServiceId] = useState<string>(servicesList[0]?.id || 'bespoke-residential');
  const activeService: InteriorService = servicesList.find((s: InteriorService) => s.id === activeServiceId) || servicesList[0];

  return (
    <section id="interiors" className="py-24 md:py-32 bg-[#121212] border-b border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <PopOut className="max-w-3xl mb-16" direction="pop-up">
          <span className="text-xs uppercase tracking-[0.3em] text-[#c5a059] block mb-3 font-medium">
            Interior Architecture & Design
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-light text-[#e5e2db] mb-6">
            We don't just furnish spaces. We transform them.
          </h2>
          <p className="text-[#b0aca3] text-sm sm:text-base font-light leading-relaxed">
            From preliminary spatial sketches to final turnkey installation, our bespoke interior solutions harmonize architectural precision with refined emotional atmosphere.
          </p>
        </PopOut>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Services accordion / list with staggered late pop-up */}
          <div className="lg:col-span-6 flex flex-col divide-y divide-white/10 border-t border-b border-white/10">
            {servicesList.map((service: InteriorService, sIdx: number) => {
              const isActive = service.id === activeServiceId;
              return (
                <PopOut
                  key={service.id}
                  direction={sIdx % 2 === 0 ? 'pop-up' : 'late-pop'}
                  delay={sIdx * 0.08}
                >
                  <div
                    onClick={() => setActiveServiceId(service.id)}
                    className={`py-6 cursor-pointer transition-all duration-300 group ${
                      isActive ? 'pl-4 bg-white/[0.03]' : 'hover:pl-2'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3
                        className={`text-xl sm:text-2xl font-serif transition-colors ${
                          isActive ? 'text-[#c5a059]' : 'text-[#e5e2db]/70 group-hover:text-[#e5e2db]'
                        }`}
                      >
                        {service.title}
                      </h3>
                      <div
                        className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                          isActive
                            ? 'border-[#c5a059] bg-[#c5a059] text-[#121212]'
                            : 'border-white/20 text-transparent'
                        }`}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    </div>

                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: 10 }}
                          animate={{ opacity: 1, height: 'auto', y: 0 }}
                          exit={{ opacity: 0, height: 0, y: -6 }}
                          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                          className="mt-3 pr-4 overflow-hidden"
                        >
                          <p className="text-[#b0aca3] text-sm leading-relaxed">{service.description}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </PopOut>
              );
            })}
          </div>

          {/* Service Image Preview with 3D Pop-Out Tilt */}
          <div className="lg:col-span-6">
            <PopOut direction="pop-out" delay={0.2}>
              <Card3D depth={8} scaleOnHover={1.03} elevateZ={26} className="rounded-3xl">
                <div className="relative bg-[#1a1a1a] p-3 border border-white/10 shadow-2xl overflow-hidden group rounded-3xl">
                  {/* Floating Atelier Badge */}
                  <Card3DLayer depth={40}>
                    <div className="absolute top-6 left-6 z-20 bg-[#121212]/90 backdrop-blur-md px-4 py-2 border border-white/15 rounded-full shadow-lg flex items-center gap-2">
                      <Compass className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span className="text-xs uppercase tracking-[0.2em] text-[#c5a059] font-medium">
                        Full-Scale Execution
                      </span>
                    </div>
                  </Card3DLayer>

                  {/* Surface Image */}
                  <Card3DLayer depth={15}>
                    <div className="rounded-2xl overflow-hidden aspect-4/3 sm:aspect-auto sm:h-[480px]">
                      <AnimatePresence mode="wait">
                        <motion.img
                          key={activeService.id}
                          src={activeService.image || INTERIOR_SERVICES.find((s) => s.id === activeService.id)?.image || INTERIOR_SERVICES[0]?.image || ''}
                          alt={activeService.title}
                          initial={{ opacity: 0, scale: 1.06 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                          className="w-full h-full object-cover object-center rounded-2xl filter brightness-[0.92] contrast-[1.05]"
                        />
                      </AnimatePresence>
                    </div>
                  </Card3DLayer>

                  {/* Floating Bottom Card Layer */}
                  <Card3DLayer depth={45}>
                    <div className="absolute bottom-6 left-6 right-6 bg-[#121212]/95 backdrop-blur-xl p-6 border border-white/15 rounded-2xl shadow-2xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a059] font-semibold">
                          Service Showcase
                        </span>
                      </div>
                      <h4 className="text-xl font-serif text-[#e5e2db]">{activeService.title}</h4>
                      <p className="text-xs text-[#b0aca3] mt-2 line-clamp-2 leading-relaxed">
                        {activeService.description}
                      </p>
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
