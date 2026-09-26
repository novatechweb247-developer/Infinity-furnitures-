import { SocialPlatformKey, formatSocialUrl, SOCIAL_PLATFORMS } from '../utils/socialUtils';
import { useCMS } from '../context/CMSContext';

export interface SocialIconSvgProps {
  className?: string;
}

export function InstagramIcon({ className = 'w-4 h-4' }: SocialIconSvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  );
}

export function TikTokIcon({ className = 'w-4 h-4' }: SocialIconSvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68a6.34 6.34 0 0 0 10.86 4.47 6.27 6.27 0 0 0 1.93-4.52V8.71a8.21 8.21 0 0 0 4.8 1.54V6.79a4.85 4.85 0 0 1-1-.1z" />
    </svg>
  );
}

export function FacebookIcon({ className = 'w-4 h-4' }: SocialIconSvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

export function TwitterXIcon({ className = 'w-4 h-4' }: SocialIconSvgProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function PlatformIcon({
  platform,
  className = 'w-4 h-4',
}: {
  platform: SocialPlatformKey;
  className?: string;
}) {
  switch (platform) {
    case 'instagram':
      return <InstagramIcon className={className} />;
    case 'tiktok':
      return <TikTokIcon className={className} />;
    case 'facebook':
      return <FacebookIcon className={className} />;
    case 'twitter':
      return <TwitterXIcon className={className} />;
    default:
      return null;
  }
}

export interface SocialLinksGroupProps {
  links?: Record<string, string | undefined>;
  variant?: 'header' | 'footer' | 'floating' | 'contact' | 'mobile-drawer' | 'card';
  showLabels?: boolean;
  className?: string;
  iconSize?: string;
}

export function SocialLinksGroup({
  links: overrideLinks,
  variant = 'footer',
  showLabels = false,
  className = '',
  iconSize,
}: SocialLinksGroupProps) {
  const { activeContent } = useCMS();
  
  // Combine sources: override -> activeContent.social -> fallback activeContent.brand
  const source = overrideLinks || activeContent.social || {};
  const brandFallback = activeContent.brand || {};

  // Resolve active platforms that have a non-empty URL or handle
  const activePlatforms = SOCIAL_PLATFORMS.map((platform) => {
    const rawVal =
      source[platform.key] ||
      (platform.key === 'instagram' ? brandFallback.instagram : undefined);
    const formatted = formatSocialUrl(platform.key, rawVal);
    return {
      ...platform,
      url: formatted,
      hasLink: !!formatted,
    };
  }).filter((p) => p.hasLink);

  if (activePlatforms.length === 0) {
    return null;
  }

  // Variant-specific styling rules with smooth 0.4s luxury timing
  switch (variant) {
    case 'header':
      return (
        <div
          className={`flex items-center gap-2 flex-wrap ${className}`}
          role="group"
          aria-label="Social media channels"
        >
          {activePlatforms.map((p) => (
            <a
              key={p.key}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={p.ariaLabel}
              title={p.name}
              className="w-8 h-8 rounded-full bg-white/[0.04] hover:bg-[#c5a059] border border-white/10 hover:border-[#c5a059] text-[#e5e2db] hover:text-[#121212] flex items-center justify-center transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-110 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-[#c5a059] will-change-transform-opacity"
            >
              <PlatformIcon
                platform={p.key}
                className={iconSize || 'w-3.5 h-3.5 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:rotate-6'}
              />
            </a>
          ))}
        </div>
      );

    case 'footer':
      return (
        <div
          className={`flex items-center gap-3 flex-wrap ${className}`}
          role="group"
          aria-label="Follow our social channels"
        >
          {activePlatforms.map((p) => (
            <a
              key={p.key}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={p.ariaLabel}
              title={p.name}
              className="w-9 h-9 rounded-full bg-white/5 hover:bg-[#c5a059] border border-white/10 hover:border-[#c5a059] text-neutral-300 hover:text-[#121212] flex items-center justify-center transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-110 active:scale-95 group shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c5a059] will-change-transform-opacity"
            >
              <PlatformIcon
                platform={p.key}
                className={iconSize || 'w-4 h-4 transition-transform duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:rotate-6'}
              />
            </a>
          ))}
        </div>
      );

    case 'floating':
      return (
        <div
          className={`flex flex-col items-center gap-2.5 bg-[#161616]/90 backdrop-blur-xl p-2 rounded-full border border-[#c5a059]/30 shadow-2xl ${className}`}
          role="group"
          aria-label="Quick social channels"
        >
          {activePlatforms.map((p) => (
            <a
              key={p.key}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={p.ariaLabel}
              title={p.name}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-[#c5a059] text-[#e5e2db] hover:text-[#121212] flex items-center justify-center transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] hover:scale-115 active:scale-95 group focus:outline-none will-change-transform-opacity"
            >
              <PlatformIcon
                platform={p.key}
                className={iconSize || 'w-3.5 h-3.5'}
              />
            </a>
          ))}
        </div>
      );

    case 'contact':
      return (
        <div
          className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`}
          role="group"
          aria-label="Direct social networks"
        >
          {activePlatforms.map((p) => (
            <a
              key={p.key}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={p.ariaLabel}
              className="p-3.5 rounded-2xl bg-white/[0.03] hover:bg-[#c5a059]/10 border border-white/10 hover:border-[#c5a059]/40 text-[#e5e2db] hover:text-[#c5a059] flex items-center gap-3 transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] group cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#c5a059] will-change-transform-opacity"
            >
              <div className="w-8 h-8 rounded-xl bg-white/5 group-hover:bg-[#c5a059] text-[#c5a059] group-hover:text-[#121212] flex items-center justify-center shrink-0 transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)]">
                <PlatformIcon platform={p.key} className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="block text-xs font-serif font-medium text-white group-hover:text-[#c5a059] truncate transition-colors duration-400">
                  {p.name}
                </span>
                <span className="block text-[10px] text-white/40 group-hover:text-white/70 uppercase tracking-wider font-sans transition-colors duration-400">
                  Connect &rarr;
                </span>
              </div>
            </a>
          ))}
        </div>
      );

    case 'mobile-drawer':
      return (
        <div
          className={`flex items-center justify-center gap-3 flex-wrap ${className}`}
          role="group"
          aria-label="Social media channels"
        >
          {activePlatforms.map((p) => (
            <a
              key={p.key}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={p.ariaLabel}
              title={p.name}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-[#c5a059] border border-white/10 hover:border-[#c5a059] text-[#e5e2db] hover:text-[#121212] flex items-center justify-center transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] active:scale-95 will-change-transform-opacity"
            >
              <PlatformIcon platform={p.key} className="w-4 h-4" />
            </a>
          ))}
        </div>
      );

    default:
      return (
        <div className={`flex items-center gap-2.5 flex-wrap ${className}`}>
          {activePlatforms.map((p) => (
            <a
              key={p.key}
              href={p.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={p.ariaLabel}
              title={p.name}
              className="p-2 rounded-full bg-white/5 hover:bg-[#c5a059] text-white hover:text-black transition-all duration-400 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform-opacity"
            >
              <PlatformIcon platform={p.key} className="w-4 h-4" />
              {showLabels && <span className="ml-2 text-xs">{p.name}</span>}
            </a>
          ))}
        </div>
      );
  }
}
