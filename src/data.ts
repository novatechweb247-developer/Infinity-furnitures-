import { CollectionItem, InteriorService, GalleryImage, WhyPoint } from './types';

export const COLLECTIONS: CollectionItem[] = [
  {
    id: 'luxury-sofas',
    number: '01',
    title: 'Luxury Sofas',
    description: 'Handcrafted seating designed for absolute comfort and sculptural presence in refined living spaces.',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80',
    features: ['High-resiliency organic cushioning', 'Custom Italian upholstery', 'Solid hardwood internal frames']
  },
  {
    id: 'bedroom-furniture',
    number: '02',
    title: 'Bedroom Furniture',
    description: 'Serene sanctuaries engineered with pristine joinery and calming tactile finishes.',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
    features: ['Bespoke bed frames', 'Integrated bedside architectural lighting', 'Soft-close dovetail drawers']
  },
  {
    id: 'wardrobes',
    number: '03',
    title: 'Wardrobes',
    description: 'Floor-to-ceiling architectural wardrobes tailored to maximize storage with unmatched elegance.',
    image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80',
    features: ['Fluted oak & glass doors', 'Integrated sensor lighting', 'Customized compartmentalized accessories']
  },
  {
    id: 'office-furniture',
    number: '04',
    title: 'Office Furniture',
    description: 'Executive executive desks, conference tables and ergonomic seating that inspire productivity and distinction.',
    image: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
    features: ['Concealed cable management', 'Acoustic privacy integration', 'Hand-finished walnut and brass']
  },
  {
    id: 'custom-furniture',
    number: '05',
    title: 'Custom Furniture',
    description: 'One-of-a-kind bespoke creations envisioned by you and brought to life by master artisans.',
    image: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80',
    features: ['Architectural consultation', 'Prototype 3D renderings', 'Choice of rare exotic veneers']
  }
];

export const INTERIOR_SERVICES: InteriorService[] = [
  {
    id: 'interior-design',
    title: 'Interior Design',
    description: 'Comprehensive spatial storytelling harmonizing light, texture, and architectural proportion.',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'space-planning',
    title: 'Space Planning',
    description: 'Optimizing flow, function, and visual rhythm for residential and commercial environments.',
    image: 'https://images.unsplash.com/photo-1618221381711-42ca8ab6e908?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'custom-furniture',
    title: 'Custom Furniture',
    description: 'Tailor-made pieces built exclusively to fit the exact dimensions and character of your rooms.',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'residential-interiors',
    title: 'Residential Interiors',
    description: 'Turning houses into timeless homes that reflect your personal journey and aspirations.',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'commercial-interiors',
    title: 'Commercial Interiors',
    description: 'Creating inspiring corporate offices, luxury retail spaces, and hospitality venues that captivate.',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
  }
];

export const GALLERY_IMAGES: GalleryImage[] = [
  {
    id: 'gal-1',
    title: 'Modern Minimalist Living',
    category: 'Residential',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'gal-2',
    title: 'Bespoke Oak Wardrobe Suite',
    category: 'Wardrobes',
    image: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'gal-3',
    title: 'Boucle Sectional Lounge',
    category: 'Living Room',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'gal-4',
    title: 'Executive Boardroom',
    category: 'Commercial',
    image: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'gal-5',
    title: 'Serene Master Bedroom',
    category: 'Bedroom',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80'
  }
];

export const WHY_POINTS: WhyPoint[] = [
  {
    number: '01',
    title: 'Quality Craftsmanship',
    description: 'Built by hand, checked by eye, finished to last generations with uncompromising structural integrity.'
  },
  {
    number: '02',
    title: 'Bespoke Design',
    description: 'Furniture drawn around your space, not forced around a catalogue or standard dimensions.'
  },
  {
    number: '03',
    title: 'Premium Materials',
    description: 'Selected timber, fabrics and architectural hardware with honest character and authentic tactile warmth.'
  },
  {
    number: '04',
    title: 'Interior Expertise',
    description: 'Complete schemes from initial spatial planning to final expert white-glove installation.'
  }
];
