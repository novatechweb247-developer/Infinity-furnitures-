import { useCMS } from '../context/CMSContext';
import { PopOut } from './PopOut';
import { Card3D, Card3DLayer } from './Card3D';
import { Sparkles, Compass } from 'lucide-react';

export function AboutView() {
  const { activeContent } = useCMS();
  const about = activeContent.about || {};

  return (
    <div className="pt-28 pb-32 bg-[#121212] text-[#e5e2db] min-h-screen relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Hero Header */}
        <PopOut direction="pop-up" className="max-w-3xl mb-16">
          <span className="text-xs uppercase tracking-[0.3em] text-[#c5a059] block mb-3 font-medium">
            {about.subtitle || 'Our Heritage'}
          </span>
          <h1 className="text-4xl sm:text-6xl font-serif font-light text-[#e5e2db] mb-6">
            {about.title || 'Where Master Craft Meets Contemporary Architecture.'}
          </h1>
          <p className="text-[#b0aca3] text-base font-light leading-relaxed">
            {about.story}
          </p>
        </PopOut>

        {/* Big Workshop Banner Photo with 3D Pop-Out */}
        <PopOut direction="pop-out" className="relative mb-20 rounded-3xl overflow-hidden shadow-2xl">
          <Card3D depth={4} scaleOnHover={1.01} elevateZ={15} className="rounded-3xl">
            <div className="relative rounded-3xl overflow-hidden border border-white/10">
              <img
                src={about.heroImage || about.image || 'https://images.unsplash.com/photo-1581858726788-75bc0f6a952d?auto=format&fit=crop&w=1800&q=80'}
                alt="Artisan joinery workshop"
                className="w-full h-[400px] sm:h-[550px] object-cover filter brightness-[0.85]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#121212] via-transparent to-transparent" />
              <Card3DLayer depth={30}>
                <div className="absolute bottom-8 left-8 right-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a059] font-bold block mb-1">
                      Atelier Standards
                    </span>
                    <p className="text-lg font-serif text-white">Hand-shaped solid timber joinery</p>
                  </div>
                  <span className="text-xs text-white/60 tracking-wider">Jos, Plateau State, Nigeria</span>
                </div>
              </Card3DLayer>
            </div>
          </Card3D>
        </PopOut>

        {/* Mission & Vision Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-20">
          <PopOut direction="pop-up" delay={0.1}>
            <Card3D depth={6} scaleOnHover={1.03} elevateZ={20} className="rounded-3xl h-full">
              <div className="bg-[#181818] p-8 sm:p-10 rounded-3xl border border-white/10 space-y-4 shadow-xl h-full">
                <Card3DLayer depth={35}>
                  <div className="w-12 h-12 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059]">
                    <Sparkles className="w-6 h-6" />
                  </div>
                </Card3DLayer>
                <Card3DLayer depth={25}>
                  <h3 className="text-2xl font-serif text-[#e5e2db]">Our Mission</h3>
                  <p className="text-[#b0aca3] text-sm leading-relaxed font-light mt-2">
                    {about.mission}
                  </p>
                </Card3DLayer>
              </div>
            </Card3D>
          </PopOut>

          <PopOut direction="late-pop" delay={0.2}>
            <Card3D depth={6} scaleOnHover={1.03} elevateZ={20} className="rounded-3xl h-full">
              <div className="bg-[#181818] p-8 sm:p-10 rounded-3xl border border-white/10 space-y-4 shadow-xl h-full">
                <Card3DLayer depth={35}>
                  <div className="w-12 h-12 rounded-2xl bg-[#c5a059]/10 border border-[#c5a059]/30 flex items-center justify-center text-[#c5a059]">
                    <Compass className="w-6 h-6" />
                  </div>
                </Card3DLayer>
                <Card3DLayer depth={25}>
                  <h3 className="text-2xl font-serif text-[#e5e2db]">Our Vision</h3>
                  <p className="text-[#b0aca3] text-sm leading-relaxed font-light mt-2">
                    {about.vision}
                  </p>
                </Card3DLayer>
              </div>
            </Card3D>
          </PopOut>
        </div>

        {/* Core Values with Staggered Late Pop-Out */}
        <div className="border-t border-white/10 pt-16">
          <PopOut direction="pop-up" className="max-w-3xl mb-12">
            <span className="text-xs uppercase tracking-[0.3em] text-[#c5a059] block mb-2 font-medium">
              The Infinity Standard
            </span>
            <h2 className="text-3xl font-serif font-light text-[#e5e2db]">
              Guiding Principles of Our Workshop
            </h2>
          </PopOut>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Selected Timbers',
                desc: 'Only premium sustainably sourced hardwoods and moisture-tested timber cores are selected.',
              },
              {
                title: 'Precision Joinery',
                desc: 'Mortise, tenon, and dovetail joinery hand-trued by master craftsmen for generational endurance.',
              },
              {
                title: 'Bespoke Customization',
                desc: 'Each piece is individually tailored to your room dimensions, lighting conditions, and architecture.',
              },
              {
                title: 'End-To-End Installation',
                desc: 'White-glove delivery, laser-leveled fitting, and meticulous surface finishing on site.',
              },
            ].map((pillar, i) => (
              <PopOut
                key={i}
                direction={i % 2 === 0 ? 'pop-up' : 'late-pop'}
                delay={i * 0.08}
                className="h-full"
              >
                <Card3D depth={6} scaleOnHover={1.03} elevateZ={18} className="rounded-2xl h-full">
                  <div className="bg-[#161616] p-6 rounded-2xl border border-white/10 space-y-3 h-full hover:border-[#c5a059]/40 transition-colors">
                    <span className="text-xs font-serif text-[#c5a059]">0{i + 1}</span>
                    <h4 className="text-lg font-serif text-[#e5e2db]">{pillar.title}</h4>
                    <p className="text-[#b0aca3] text-xs font-light leading-relaxed">{pillar.desc}</p>
                  </div>
                </Card3D>
              </PopOut>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
