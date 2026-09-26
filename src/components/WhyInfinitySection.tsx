import { WHY_POINTS } from '../data';
import { PopOut } from './PopOut';
import { Card3D, Card3DLayer } from './Card3D';
import { useCMS } from '../context/CMSContext';

export function WhyInfinitySection() {
  const { activeContent } = useCMS();
  const points = (activeContent.whyPoints && activeContent.whyPoints.length > 0)
    ? activeContent.whyPoints
    : WHY_POINTS;

  return (
    <section className="py-24 md:py-32 bg-[#161616] border-b border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <PopOut className="mb-16" direction="pop-up">
          <span className="text-xs uppercase tracking-[0.3em] text-[#c5a059] block mb-3 font-medium">
            Why Infinity
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-light text-[#e5e2db]">
            Built with uncompromising standards.
          </h2>
        </PopOut>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {points.map((point, index) => (
            <PopOut
              key={point.number || index}
              direction={index % 2 === 0 ? 'pop-up' : 'late-pop'}
              delay={index * 0.08}
              className="h-full"
            >
              <Card3D
                depth={6}
                scaleOnHover={1.03}
                elevateZ={20}
                className="h-full rounded-2xl"
              >
                <div className="bg-[#121212] p-8 border border-white/10 flex flex-col justify-between hover:border-[#c5a059]/50 transition-colors group rounded-2xl shadow-xl h-full">
                  <div>
                    <Card3DLayer depth={35}>
                      <span className="text-2xl font-serif text-[#c5a059] block mb-6 group-hover:scale-110 transform transition-transform origin-left">
                        {point.number}
                      </span>
                    </Card3DLayer>

                    <Card3DLayer depth={25}>
                      <h3 className="text-xl font-serif text-[#e5e2db] mb-4 group-hover:text-[#c5a059] transition-colors">
                        {point.title}
                      </h3>
                      <p className="text-[#b0aca3] text-sm font-light leading-relaxed">
                        {point.description}
                      </p>
                    </Card3DLayer>
                  </div>

                  <Card3DLayer depth={30}>
                    <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-white/40">Infinity Standard</span>
                      <div className="w-2 h-2 rounded-full bg-[#c5a059] shadow-[0_0_8px_rgba(197,160,89,0.5)]" />
                    </div>
                  </Card3DLayer>
                </div>
              </Card3D>
            </PopOut>
          ))}
        </div>
      </div>
    </section>
  );
}
