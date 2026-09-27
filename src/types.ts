export interface BrandSettings {
  businessName: string;
  tagline: string;
  description: string;
  logoUrl?: string;
  logo?: string;
  lastUpdated?: string;
  phone1: string;
  phone?: string;
  phone2?: string;
  whatsapp: string;
  email: string;
  address: string;
  workingHours?: string;
  openingHours?: string;
  copyrightText?: string;
  footerTagline?: string;
  instagram?: string;
}

export interface ContactSettings {
  phone1: string;
  phone?: string;
  phone2?: string;
  whatsapp: string;
  email: string;
  address: string;
  openingHours?: string;
  workingHours?: string;
}

export interface SocialLinks {
  instagram?: string;
  facebook?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
  pinterest?: string;
  linkedin?: string;
}

export interface HeroSlide {
  id: string;
  overline?: string;
  title: string;
  subtitle: string;
  primaryCtaText?: string;
  primaryCtaAction?: string;
  secondaryCtaText?: string;
  secondaryCtaAction?: string;
  image: string;
  imageAlt?: string;
  enabled?: boolean;
  active?: boolean;
  order?: number;
  tagline?: string;
  description?: string;
}

export interface Product {
  id: string;
  name?: string;
  title?: string;
  category: string;
  price: number | string;
  formattedPrice?: string;
  description: string;
  images?: string[];
  image?: string;
  primaryImage?: string;
  available?: boolean;
  inStock?: boolean;
  featured?: boolean;
  features?: string[];
  order?: number;
  material?: string;
  materials?: string;
  dimensions?: string;
  leadTime?: string;
}

export type ProductItem = Product;

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  order?: number;
  slug?: string;
}

export type ProductCategory = Category;

export interface CollectionItem {
  id: string;
  number: string;
  title: string;
  description: string;
  image: string;
  features: string[];
}

export interface InteriorService {
  id: string;
  title: string;
  description: string;
  image: string;
  order?: number;
}

export interface MethodologyStep {
  step: string;
  title: string;
  desc: string;
}

export interface GalleryImage {
  id: string;
  title: string;
  category: string;
  image: string;
  caption?: string;
  order?: number;
}

export interface WhyPoint {
  number: string;
  title: string;
  description: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  roleOrLocation?: string;
  clientRole?: string;
  text?: string;
  quote?: string;
  rating: number;
  avatar?: string;
  enabled?: boolean;
  order?: number;
}

export type TestimonialItem = Testimonial;

export interface AboutContent {
  overline?: string;
  heroOverline?: string;
  heading?: string;
  heroHeading?: string;
  subheading?: string;
  heroSubheading?: string;
  storyTitle?: string;
  storyHeading?: string;
  storyParagraph1?: string;
  storyParagraph2?: string;
  image?: string;
  storyImage?: string;
  stat1Value?: string;
  stat1Label?: string;
  stat2Value?: string;
  stat2Label?: string;
  pillarsHeading?: string;
  pillarsSubheading?: string;
  title?: string;
  subtitle?: string;
  story?: string;
  mission?: string;
  vision?: string;
  heroImage?: string;
}

export interface HomepageSections {
  introOverline?: string;
  introHeading?: string;
  introText1?: string;
  introQuote?: string;
  introImage?: string;
  brandStatement?: string | { headline?: string; subtext?: string };
  brandSubline?: string;
  ctaOverline?: string;
  ctaHeading?: string;
  ctaButtonText?: string;
  ctaBgImage?: string;
  intro?: {
    subtitle?: string;
    title?: string;
    paragraph1?: string;
    quote?: string;
    image?: string;
  };
  ctaBanner?: {
    subtitle?: string;
    title?: string;
    buttonText?: string;
    backgroundImage?: string;
  };
}

export interface CustomerEnquiry {
  id: string;
  createdAt?: string;
  date?: string;
  fullName?: string;
  name?: string;
  email: string;
  phone?: string;
  categoryInterest?: string;
  productTitle?: string;
  message: string;
  status: 'New' | 'Contacted' | 'Confirmed' | 'Resolved' | 'Completed' | 'Archived';
  notes?: string;
  channel?: 'Website Form' | 'WhatsApp Direct' | 'Quote Request';
}

export interface CMSContent {
  version: number;
  lastUpdated: string;
  brand: BrandSettings;
  contact: ContactSettings;
  social: SocialLinks;
  heroSlides: HeroSlide[];
  categories: Category[];
  collections: CollectionItem[];
  products: Product[];
  services: InteriorService[];
  interiorServices?: InteriorService[];
  methodology: MethodologyStep[];
  gallery: GalleryImage[];
  whyPoints: WhyPoint[];
  testimonials: Testimonial[];
  about: AboutContent;
  homepage: HomepageSections;
}
