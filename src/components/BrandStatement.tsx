import { useCMS } from '../context/CMSContext';
import { PopOut } from './PopOut';

export function BrandStatement() {
  const { activeContent } = useCMS();
  const statement = activeContent.homepage?.brandStatement;

  const headline =
    typeof statement === 'string'
      ? statement
      : statement?.headline || 'Where craftsmanship meets contemporary design.';

  const subtext =
    typeof statement === 'object' && statement?.subtext
      ? statement.subtext
      : activeContent.homepage?.brandSubline || activeContent.brand?.businessName || 'Infinity Furnitures and Interior World Nigeria Limited';

  return (
    <section className="py-28 bg-[#161616] text-center border-b border-white/5 relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#c5a059_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <PopOut direction="pop-out">
          <span className="text-4xl font-serif text-[#c5a059] block mb-6 tracking-widest hover:scale-110 transition-transform duration-300">
            ∞
          </span>
        </PopOut>

        <PopOut direction="pop-up" delay={0.1}>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-light text-[#e5e2db] leading-tight mb-8">
            {headline}
          </h2>
        </PopOut>

        <PopOut direction="pop-out" delay={0.25}>
          <div className="w-12 h-[1px] bg-[#c5a059] mx-auto mb-8" />
        </PopOut>

        <PopOut direction="late-pop" delay={0.2}>
          <p className="text-xs uppercase tracking-[0.3em] text-[#b0aca3]">
            {subtext}
          </p>
        </PopOut>
      </div>
    </section>
  );
}
