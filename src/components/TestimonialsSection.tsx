import { useCMS } from '../context/CMSContext';
import { Star, MessageSquareQuote } from 'lucide-react';
import { PopOut } from './PopOut';
import { Card3D, Card3DLayer } from './Card3D';

export function TestimonialsSection() {
  const { activeContent } = useCMS();
  const testimonials = activeContent.testimonials;

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="py-24 md:py-32 bg-[#121212] border-b border-white/5 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        <PopOut className="text-center max-w-3xl mx-auto mb-16" direction="pop-up">
          <span className="text-xs uppercase tracking-[0.3em] text-[#c5a059] block mb-3 font-medium">
            Client Perspectives
          </span>
          <h2 className="text-3xl sm:text-5xl font-serif font-light text-[#e5e2db] mb-4">
            Trusted by architects & discerning homeowners.
          </h2>
        </PopOut>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <PopOut
              key={t.id}
              direction={idx % 2 === 0 ? 'pop-up' : 'late-pop'}
              delay={idx * 0.1}
              className="h-full"
            >
              <Card3D
                depth={6}
                scaleOnHover={1.03}
                elevateZ={22}
                className="h-full rounded-3xl"
              >
                <div className="bg-[#181818] p-8 rounded-3xl border border-white/10 flex flex-col justify-between shadow-xl relative group hover:border-[#c5a059]/40 transition-colors h-full">
                  <div className="space-y-4">
                    <Card3DLayer depth={35}>
                      <div className="flex items-center gap-1 text-[#c5a059]">
                        {[...Array(t.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-current" />
                        ))}
                      </div>
                    </Card3DLayer>

                    <Card3DLayer depth={20}>
                      <p className="text-[#b0aca3] text-sm leading-relaxed font-light italic">
                        "{t.quote}"
                      </p>
                    </Card3DLayer>
                  </div>

                  <Card3DLayer depth={30}>
                    <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between">
                      <div>
                        <h4 className="font-serif text-[#e5e2db] text-sm">{t.clientName}</h4>
                        <p className="text-xs text-[#c5a059]">{t.clientRole}</p>
                      </div>
                      <MessageSquareQuote className="w-6 h-6 text-white/20 group-hover:text-[#c5a059]/50 transition-colors" />
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
