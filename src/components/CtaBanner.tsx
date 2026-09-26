import { useCMS } from '../context/CMSContext';
import { PopOut } from './PopOut';

interface CtaBannerProps {
  onContactClick: () => void;
}

export function CtaBanner({ onContactClick }: CtaBannerProps) {
  const { activeContent } = useCMS();
  const hp = activeContent.homepage || {};
  const banner = hp.ctaBanner;

  const bgImage =
    hp.ctaBgImage ||
    banner?.backgroundImage ||
    'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80';
  const subtitle = hp.ctaOverline || banner?.subtitle || 'Begin Your Journey';
  const title = hp.ctaHeading || banner?.title || "Let's create your perfect space.";
  const buttonText = hp.ctaButtonText || banner?.buttonText || 'Start A Conversation';

  return (
    <section id="cta-banner-section" className="relative py-28 md:py-36 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          src={bgImage}
          alt="Luxury interior background"
          className="w-full h-full object-cover object-center filter brightness-[0.3]"
        />
        <div className="absolute inset-0 bg-[#121212]/75 backdrop-blur-[2px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <PopOut direction="pop-up">
          <span className="text-xs uppercase tracking-[0.3em] text-[#c5a059] block mb-4 font-medium">
            {subtitle}
          </span>
        </PopOut>

        <PopOut direction="pop-up" delay={0.12}>
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif font-light text-[#e5e2db] mb-8 leading-tight">
            {title}
          </h2>
        </PopOut>

        <PopOut direction="late-pop" delay={0.22}>
          <button
            onClick={onContactClick}
            className="inline-flex items-center justify-center bg-[#e5e2db] text-[#121212] hover:bg-[#c5a059] hover:text-[#121212] hover:scale-105 active:scale-95 transition-all duration-300 px-10 py-5 text-xs uppercase tracking-[0.25em] font-semibold shadow-2xl rounded-full cursor-pointer"
          >
            {buttonText}
          </button>
        </PopOut>
      </div>
    </section>
  );
}
