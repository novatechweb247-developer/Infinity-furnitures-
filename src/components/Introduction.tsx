import { useCMS } from '../context/CMSContext';
import { PopOut } from './PopOut';
import { Card3D, Card3DLayer } from './Card3D';
import { Sparkles } from 'lucide-react';

export function Introduction() {
  const { activeContent } = useCMS();
  const hp = activeContent.homepage || {};
  const intro = hp.intro;

  const subtitle = hp.introOverline || intro?.subtitle || 'Introduction';
  const title = hp.introHeading || intro?.title || 'Furniture that makes a statement';
  const paragraph1 =
    hp.introText1 ||
    intro?.paragraph1 ||
    'Every piece we build begins with material and proportion — solid timber, considered joinery, finishes chosen to age gracefully.';
  const quote =
    hp.introQuote ||
    intro?.quote ||
    'Craftsmanship is not a detail here. It is the whole approach: measured, patient and finished by hand.';
  const image =
    hp.introImage ||
    intro?.image ||
    'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1000&q=80';

  return (
    <section className="py-24 md:py-32 bg-[#121212] border-b border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Text content with late pop-up reveal */}
          <div className="lg:col-span-6 space-y-8">
            <PopOut direction="pop-up">
              <span className="text-xs uppercase tracking-[0.3em] text-[#c5a059] block mb-3 font-medium">
                {subtitle}
              </span>
              <h2 className="text-3xl sm:text-5xl font-serif font-light text-[#e5e2db] leading-tight">
                {title}
              </h2>
            </PopOut>

            <PopOut direction="late-pop" delay={0.15}>
              <div className="space-y-6 text-[#b0aca3] text-sm sm:text-base font-light leading-relaxed">
                <p>{paragraph1}</p>
                <div className="border-l-2 border-[#c5a059] pl-6 italic text-[#e5e2db]/90 font-serif text-lg py-1">
                  "{quote}"
                </div>
              </div>
            </PopOut>

            <PopOut direction="pop-out" delay={0.25} className="pt-2">
              <div className="w-16 h-[1.5px] bg-[#c5a059]" />
            </PopOut>
          </div>

          {/* Right Image with 3D Pop-Out */}
          <div className="lg:col-span-6">
            <PopOut direction="pop-out" delay={0.2}>
              <Card3D depth={8} scaleOnHover={1.03} elevateZ={24} className="rounded-3xl">
                <div className="relative bg-[#1a1a1a] p-3.5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                  {/* Floating Atelier Badge */}
                  <Card3DLayer depth={35}>
                    <div className="absolute top-6 left-6 z-20 bg-[#121212]/90 backdrop-blur-md px-4 py-2 border border-white/15 rounded-full shadow-lg flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#c5a059]" />
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a059] font-medium">
                        Artisan Joinery
                      </span>
                    </div>
                  </Card3DLayer>

                  <Card3DLayer depth={15}>
                    <img
                      src={image}
                      alt={title}
                      className="w-full h-[450px] md:h-[550px] object-cover object-center rounded-2xl filter brightness-[0.93] contrast-[1.04]"
                      loading="lazy"
                    />
                  </Card3DLayer>

                  <Card3DLayer depth={40}>
                    <div className="absolute bottom-6 right-6 bg-[#121212]/90 backdrop-blur-md px-4 py-2 border border-white/15 rounded-full shadow-lg text-[10px] uppercase tracking-widest text-white/70">
                      Solid Timber &bull; Jos, Plateau State
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
