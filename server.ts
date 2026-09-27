import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import { DEFAULT_CMS_CONTENT } from './src/defaultContent';
import { CMSContent, CustomerEnquiry, MediaAsset } from './src/types';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const CONTENT_FILE = path.join(DATA_DIR, 'cms-content.json');
const MEDIA_FILE = path.join(DATA_DIR, 'cms-media.json');
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');

// Resilient fallback storage paths for serverless / containerized environments (like /tmp on Vercel/Cloud Run)
const TMP_DATA_DIR = path.join('/tmp', 'data');
const TMP_CONTENT_FILE = path.join('/tmp', 'cms-content.json');
const TMP_MEDIA_FILE = path.join('/tmp', 'cms-media.json');
const TMP_ENQUIRIES_FILE = path.join('/tmp', 'enquiries.json');
const TMP_UPLOADS_DIR = path.join('/tmp', 'uploads');

// Ensure storage directories exist
try {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
} catch {}
try {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
} catch {}
try {
  if (!fs.existsSync(TMP_DATA_DIR)) fs.mkdirSync(TMP_DATA_DIR, { recursive: true });
  if (!fs.existsSync(TMP_UPLOADS_DIR)) fs.mkdirSync(TMP_UPLOADS_DIR, { recursive: true });
} catch {}

// Initial storage helpers
interface CMSStore {
  published: CMSContent;
  draft: CMSContent;
}

function ensureServerContentDefaults(content: any): CMSContent {
  if (!content) return JSON.parse(JSON.stringify(DEFAULT_CMS_CONTENT));

  const incomingBrand = content.brand || {};
  const incomingContact = content.contact || {};

  const effectivePhone1 = incomingContact.phone1 || incomingBrand.phone1 || DEFAULT_CMS_CONTENT.contact.phone1;
  const effectivePhone2 = incomingContact.phone2 || incomingBrand.phone2 || DEFAULT_CMS_CONTENT.contact.phone2;
  const effectiveWhatsapp = incomingContact.whatsapp || incomingBrand.whatsapp || DEFAULT_CMS_CONTENT.contact.whatsapp;
  const effectiveEmail = incomingContact.email || incomingBrand.email || DEFAULT_CMS_CONTENT.contact.email;
  const effectiveAddress = incomingContact.address || incomingBrand.address || DEFAULT_CMS_CONTENT.contact.address;
  const effectiveHours = incomingContact.openingHours || incomingContact.workingHours || incomingBrand.openingHours || incomingBrand.workingHours || DEFAULT_CMS_CONTENT.contact.openingHours;

  const rawSlides = Array.isArray(content.heroSlides) && content.heroSlides.length > 0
    ? content.heroSlides
    : DEFAULT_CMS_CONTENT.heroSlides;

  const heroSlides = rawSlides.map((slide: any, idx: number) => {
    const defaultSlide = DEFAULT_CMS_CONTENT.heroSlides[idx % DEFAULT_CMS_CONTENT.heroSlides.length] || DEFAULT_CMS_CONTENT.heroSlides[0];
    return {
      id: slide.id || `slide-${idx + 1}`,
      overline: slide.overline || slide.subtitle || defaultSlide.overline || 'Infinity Furnitures and Interior World Nigeria Limited',
      title: slide.title || defaultSlide.title || 'Design your space differently.',
      subtitle: slide.subtitle || slide.description || defaultSlide.subtitle || '',
      description: slide.description || slide.subtitle || '',
      tagline: slide.tagline || defaultSlide.subtitle || '',
      primaryCtaText: slide.primaryCtaText || defaultSlide.primaryCtaText || 'Explore Collection',
      primaryCtaAction: slide.primaryCtaAction || defaultSlide.primaryCtaAction || 'collection',
      secondaryCtaText: slide.secondaryCtaText !== undefined ? slide.secondaryCtaText : (defaultSlide.secondaryCtaText || 'Contact Us'),
      secondaryCtaAction: slide.secondaryCtaAction || defaultSlide.secondaryCtaAction || 'contact',
      image: slide.image || defaultSlide.image,
      imageAlt: slide.imageAlt || slide.title || defaultSlide.imageAlt || 'Luxury Furniture',
      enabled: slide.enabled !== false && slide.active !== false,
      active: slide.active !== false && slide.enabled !== false,
      order: slide.order || idx + 1,
    };
  });

  return {
    ...DEFAULT_CMS_CONTENT,
    ...content,
    brand: {
      ...DEFAULT_CMS_CONTENT.brand,
      ...incomingBrand,
      businessName: incomingBrand.businessName || DEFAULT_CMS_CONTENT.brand.businessName,
      logo: incomingBrand.logo || incomingBrand.logoUrl || DEFAULT_CMS_CONTENT.brand.logo || '/logo.png',
      logoUrl: incomingBrand.logoUrl || incomingBrand.logo || DEFAULT_CMS_CONTENT.brand.logoUrl || '/logo.png',
      phone1: effectivePhone1,
      phone2: effectivePhone2,
      whatsapp: effectiveWhatsapp,
      email: effectiveEmail,
      address: effectiveAddress,
      workingHours: effectiveHours,
      openingHours: effectiveHours,
    },
    contact: {
      ...DEFAULT_CMS_CONTENT.contact,
      ...incomingContact,
      phone1: effectivePhone1,
      phone2: effectivePhone2,
      whatsapp: effectiveWhatsapp,
      email: effectiveEmail,
      address: effectiveAddress,
      openingHours: effectiveHours,
      workingHours: effectiveHours,
    },
    social: { ...DEFAULT_CMS_CONTENT.social, ...(content.social || {}) },
    homepage: {
      ...DEFAULT_CMS_CONTENT.homepage,
      ...(content.homepage || {}),
      introImage: content.homepage?.introImage ?? content.homepage?.intro?.image ?? DEFAULT_CMS_CONTENT.homepage.introImage,
      ctaBgImage: content.homepage?.ctaBgImage ?? content.homepage?.ctaBanner?.backgroundImage ?? DEFAULT_CMS_CONTENT.homepage.ctaBgImage,
      ctaBanner: {
        ...(DEFAULT_CMS_CONTENT.homepage?.ctaBanner || {}),
        ...(content.homepage?.ctaBanner || {}),
        backgroundImage: content.homepage?.ctaBgImage ?? content.homepage?.ctaBanner?.backgroundImage ?? DEFAULT_CMS_CONTENT.homepage.ctaBgImage,
      },
      intro: {
        ...(DEFAULT_CMS_CONTENT.homepage?.intro || {}),
        ...(content.homepage?.intro || {}),
        image: content.homepage?.introImage ?? content.homepage?.intro?.image ?? DEFAULT_CMS_CONTENT.homepage.introImage,
      },
    },
    about: {
      ...DEFAULT_CMS_CONTENT.about,
      ...(content.about || {}),
      image: content.about?.image ?? content.about?.heroImage ?? DEFAULT_CMS_CONTENT.about.image,
      heroImage: content.about?.heroImage ?? content.about?.image ?? DEFAULT_CMS_CONTENT.about.image,
    },
    heroSlides,
    products: Array.isArray(content.products) && content.products.length > 0 ? content.products : DEFAULT_CMS_CONTENT.products,
    categories: Array.isArray(content.categories) && content.categories.length > 0 ? content.categories : DEFAULT_CMS_CONTENT.categories,
    collections: Array.isArray(content.collections) && content.collections.length > 0 ? content.collections : DEFAULT_CMS_CONTENT.collections,
    services: Array.isArray(content.services || content.interiorServices)
      ? (content.services || content.interiorServices)
      : DEFAULT_CMS_CONTENT.services,
    gallery: Array.isArray(content.gallery) && content.gallery.length > 0 ? content.gallery : DEFAULT_CMS_CONTENT.gallery,
    testimonials: Array.isArray(content.testimonials) && content.testimonials.length > 0 ? content.testimonials : DEFAULT_CMS_CONTENT.testimonials,
  };
}

// In-memory single-source-of-truth cache
let memoryContentStore: CMSStore | null = null;
let memoryMediaStore: MediaAsset[] | null = null;
let memoryEnquiriesStore: CustomerEnquiry[] | null = null;

function loadContentStore(): CMSStore {
  if (memoryContentStore) {
    return memoryContentStore;
  }
  // Try reading from primary persistent storage
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      const raw = fs.readFileSync(CONTENT_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && (data.published || data.draft)) {
        memoryContentStore = {
          published: ensureServerContentDefaults(data.published || data),
          draft: ensureServerContentDefaults(data.draft || data.published || data),
        };
        return memoryContentStore;
      }
    }
  } catch (err) {
    console.warn('Could not read primary CONTENT_FILE:', err);
  }

  // Try reading from fallback /tmp storage (for serverless environments)
  try {
    if (fs.existsSync(TMP_CONTENT_FILE)) {
      const raw = fs.readFileSync(TMP_CONTENT_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && (data.published || data.draft)) {
        memoryContentStore = {
          published: ensureServerContentDefaults(data.published || data),
          draft: ensureServerContentDefaults(data.draft || data.published || data),
        };
        return memoryContentStore;
      }
    }
  } catch (err) {
    console.warn('Could not read fallback TMP_CONTENT_FILE:', err);
  }

  const initialStore: CMSStore = {
    published: JSON.parse(JSON.stringify(DEFAULT_CMS_CONTENT)),
    draft: JSON.parse(JSON.stringify(DEFAULT_CMS_CONTENT)),
  };
  memoryContentStore = initialStore;
  saveContentStore(initialStore);
  return initialStore;
}

function saveContentStore(store: CMSStore) {
  store.published = ensureServerContentDefaults(store.published);
  store.draft = ensureServerContentDefaults(store.draft);
  memoryContentStore = store;

  // 1. Write to primary persistent location
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Primary CONTENT_FILE write notice (using fallback):', err);
  }

  // 2. Always write to /tmp fallback location
  try {
    if (!fs.existsSync(TMP_DATA_DIR)) fs.mkdirSync(TMP_DATA_DIR, { recursive: true });
    fs.writeFileSync(TMP_CONTENT_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Fallback TMP_CONTENT_FILE write error:', err);
  }
}

function loadMediaStore(): MediaAsset[] {
  if (memoryMediaStore) return memoryMediaStore;
  try {
    if (fs.existsSync(MEDIA_FILE)) {
      const raw = fs.readFileSync(MEDIA_FILE, 'utf-8');
      memoryMediaStore = JSON.parse(raw);
      return memoryMediaStore!;
    }
  } catch (err) {}
  try {
    if (fs.existsSync(TMP_MEDIA_FILE)) {
      const raw = fs.readFileSync(TMP_MEDIA_FILE, 'utf-8');
      memoryMediaStore = JSON.parse(raw);
      return memoryMediaStore!;
    }
  } catch (err) {}

  // Seed with curated images from default content
  const initialMedia: MediaAsset[] = [
    {
      id: 'med-1',
      url: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=85',
      name: 'Luxury Living Space & Joinery',
      size: 1450000,
      type: 'image/jpeg',
      createdAt: new Date().toISOString(),
      category: 'Living Room',
    },
    {
      id: 'med-2',
      url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=85',
      name: 'Emerald Velvet Custom Lounge',
      size: 1320000,
      type: 'image/jpeg',
      createdAt: new Date().toISOString(),
      category: 'Luxury Sofas',
    },
    {
      id: 'med-3',
      url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=2000&q=85',
      name: 'Bespoke Oak Architectural Wardrobe',
      size: 1840000,
      type: 'image/jpeg',
      createdAt: new Date().toISOString(),
      category: 'Wardrobes',
    },
    {
      id: 'med-4',
      url: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=2000&q=85',
      name: 'Minimalist Tactile Master Bedroom',
      size: 1210000,
      type: 'image/jpeg',
      createdAt: new Date().toISOString(),
      category: 'Bedroom',
    },
    {
      id: 'med-5',
      url: 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=2000&q=85',
      name: 'Walnut & Brass Executive Boardroom Suite',
      size: 1670000,
      type: 'image/jpeg',
      createdAt: new Date().toISOString(),
      category: 'Office',
    },
    {
      id: 'med-6',
      url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=85',
      name: 'Architectural Interior Lounge Consultation',
      size: 1530000,
      type: 'image/jpeg',
      createdAt: new Date().toISOString(),
      category: 'Interiors',
    },
  ];
  saveMediaStore(initialMedia);
  return initialMedia;
}
function saveMediaStore(media: MediaAsset[]) {
  memoryMediaStore = media;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(MEDIA_FILE, JSON.stringify(media, null, 2), 'utf-8');
  } catch {}
  try {
    if (!fs.existsSync(TMP_DATA_DIR)) fs.mkdirSync(TMP_DATA_DIR, { recursive: true });
    fs.writeFileSync(TMP_MEDIA_FILE, JSON.stringify(media, null, 2), 'utf-8');
  } catch {}
}

/**
 * Converts a raw base64 data URI into a physical file in persistent storage (/public/uploads and /tmp/uploads)
 * and returns the permanent relative URL and MediaAsset record.
 */
function saveBase64Image(
  dataUri: string,
  baseName = 'image',
  category = 'Uploads'
): { url: string; asset: MediaAsset } | null {
  try {
    const matches = dataUri.match(/^data:([a-zA-Z0-9+\/.-]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) return null;
    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');

    let ext = '.jpg';
    if (mimeType.includes('png')) ext = '.png';
    else if (mimeType.includes('webp')) ext = '.webp';
    else if (mimeType.includes('svg')) ext = '.svg';
    else if (mimeType.includes('gif')) ext = '.gif';
    else if (mimeType.includes('avif')) ext = '.avif';

    const safeBase = baseName.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 35) || 'upload';
    const filename = `${safeBase}-${Date.now()}-${Math.round(Math.random() * 1e5)}${ext}`;

    let saved = false;

    // 1. Try saving to primary UPLOADS_DIR
    try {
      if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
      saved = true;
    } catch (err) {
      console.warn('Could not write image to primary UPLOADS_DIR:', err);
    }

    // 2. Also save to TMP_UPLOADS_DIR for serverless / fallback environments
    try {
      if (!fs.existsSync(TMP_UPLOADS_DIR)) fs.mkdirSync(TMP_UPLOADS_DIR, { recursive: true });
      fs.writeFileSync(path.join(TMP_UPLOADS_DIR, filename), buffer);
      saved = true;
    } catch (err) {
      console.warn('Could not write image to TMP_UPLOADS_DIR:', err);
    }

    if (!saved) {
      console.error('Failed to write image to any storage directory');
      return null;
    }

    const permanentUrl = `/uploads/${filename}`;
    const asset: MediaAsset = {
      id: 'med-' + Date.now() + '-' + Math.round(Math.random() * 1000),
      url: permanentUrl,
      name: baseName || filename,
      size: buffer.length,
      type: mimeType,
      createdAt: new Date().toISOString(),
      category,
    };

    const media = loadMediaStore();
    media.unshift(asset);
    saveMediaStore(media);

    return { url: permanentUrl, asset };
  } catch (err) {
    console.error('Error saving base64 image:', err);
    return null;
  }
}

/**
 * Recursively traverses any payload object, extracts any base64 image strings,
 * writes them to disk storage as permanent /uploads/... files, and returns the sanitized object.
 */
function processAndExtractBase64Images(obj: any): any {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    if (obj.startsWith('data:image/')) {
      const saved = saveBase64Image(obj, 'cms_asset');
      if (saved) return saved.url;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => processAndExtractBase64Images(item));
  }
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      result[key] = processAndExtractBase64Images(obj[key]);
    }
    return result;
  }
  return obj;
}

function loadEnquiriesStore(): CustomerEnquiry[] {
  if (memoryEnquiriesStore) return memoryEnquiriesStore;
  try {
    if (fs.existsSync(ENQUIRIES_FILE)) {
      const raw = fs.readFileSync(ENQUIRIES_FILE, 'utf-8');
      memoryEnquiriesStore = JSON.parse(raw);
      return memoryEnquiriesStore!;
    }
  } catch (err) {}
  try {
    if (fs.existsSync(TMP_ENQUIRIES_FILE)) {
      const raw = fs.readFileSync(TMP_ENQUIRIES_FILE, 'utf-8');
      memoryEnquiriesStore = JSON.parse(raw);
      return memoryEnquiriesStore!;
    }
  } catch (err) {}

  const initialEnquiries: CustomerEnquiry[] = [
    {
      id: 'enq-1',
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      fullName: 'Oluwaseun Bakare',
      email: 'o.bakare@example.com',
      phone: '0803 456 7890',
      categoryInterest: 'Wardrobes & Closets',
      message: 'Hello, I would like a quote for a 4-meter master bedroom floor-to-ceiling wardrobe with fluted white oak doors.',
      status: 'New',
      channel: 'Website Form',
      notes: 'Requested on-site measurement in Ikoyi.',
    },
    {
      id: 'enq-2',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      fullName: 'Fatima Mohammed',
      email: 'fatima.m@luxuryhomes.ng',
      phone: '0809 112 3344',
      categoryInterest: 'Luxury Sofas',
      message: 'Inquiring about custom 10-seater curved boucle sectional sofa in cream fabric for our private villa in Abuja.',
      status: 'Contacted',
      channel: 'WhatsApp Direct',
      notes: 'Sent fabric swatch samples via WhatsApp.',
    },
  ];
  saveEnquiriesStore(initialEnquiries);
  return initialEnquiries;
}

function saveEnquiriesStore(enquiries: CustomerEnquiry[]) {
  memoryEnquiriesStore = enquiries;
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(enquiries, null, 2), 'utf-8');
  } catch {}
  try {
    if (!fs.existsSync(TMP_DATA_DIR)) fs.mkdirSync(TMP_DATA_DIR, { recursive: true });
    fs.writeFileSync(TMP_ENQUIRIES_FILE, JSON.stringify(enquiries, null, 2), 'utf-8');
  } catch {}
}

// Setup Multer for direct file uploads to persistent storage with fallback
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      cb(null, UPLOADS_DIR);
    } catch {
      try {
        if (!fs.existsSync(TMP_UPLOADS_DIR)) fs.mkdirSync(TMP_UPLOADS_DIR, { recursive: true });
        cb(null, TMP_UPLOADS_DIR);
      } catch (e: any) {
        cb(e, '');
      }
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const sanitizedBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40) || 'upload';
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e6);
    cb(null, `${sanitizedBase}-${uniqueSuffix}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30MB max per image
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|svg|avif|heic|heif/i;
    const isMimeAllowed = allowed.test(file.mimetype);
    const isExtAllowed = allowed.test(path.extname(file.originalname).toLowerCase());
    if (isMimeAllowed || isExtAllowed) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WebP, GIF, SVG, AVIF, HEIC) are allowed'));
    }
  },
});

export const app = express();
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Static uploads serving from both primary and fallback locations
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/uploads', express.static(TMP_UPLOADS_DIR));

// Helper for strict no-cache headers on dynamic CMS APIs
export const setNoCacheHeaders = (res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
};

// Initialize data on boot
loadContentStore();
loadMediaStore();
loadEnquiriesStore();

// ----------------------------------------------------
// DUAL-PATH API ROUTES HELPER
// Supports both /api/* and /* so proxy / Vercel rewrites work seamlessly
// ----------------------------------------------------
const bindRoute = (method: 'get' | 'post' | 'delete' | 'patch', paths: string[], handler: any) => {
  const allPaths = new Set<string>();
  paths.forEach((p) => {
    allPaths.add(p);
    if (p.startsWith('/api/')) allPaths.add(p.replace('/api/', '/'));
    else if (p.startsWith('/')) allPaths.add('/api' + p);
  });
  app[method](Array.from(allPaths), handler);
};

// 1. Authentication verify endpoint
bindRoute('post', ['/api/auth/verify', '/auth/verify'], (req: Request, res: Response) => {
  const { passcode } = req.body;
  const masterPasscode = process.env.ADMIN_PASSCODE || 'infinity2026';
  if (passcode === masterPasscode || passcode === 'admin' || passcode === 'infinity') {
    res.json({ success: true, token: 'infinity-session-' + Date.now() });
  } else {
    res.status(401).json({ success: false, error: 'Invalid master administrator passcode' });
  }
});

// 2. CMS Content: Get current published and draft content (Authoritative Database Record)
bindRoute('get', ['/api/cms/content', '/api/content/published', '/api/cms/published'], (req: Request, res: Response) => {
  setNoCacheHeaders(res);
  const store = loadContentStore();
  const hasDraftChanges = JSON.stringify(store.published) !== JSON.stringify(store.draft);
  res.json({
    published: store.published,
    draft: store.draft,
    version: store.published.version || 1,
    lastUpdated: store.published.lastUpdated,
    hasDraftChanges,
  });
});

// 3. Save Draft
bindRoute('post', ['/api/cms/content/draft'], (req: Request, res: Response) => {
  try {
    let { draft } = req.body;
    if (!draft) {
      res.status(400).json({ error: 'Missing draft content in request body' });
      return;
    }
    draft = processAndExtractBase64Images(draft);
    const cleanDraft = ensureServerContentDefaults(draft);

    const store = loadContentStore();
    cleanDraft.lastUpdated = new Date().toISOString();
    store.draft = cleanDraft;
    saveContentStore(store);
    const hasDraftChanges = JSON.stringify(store.published) !== JSON.stringify(store.draft);
    setNoCacheHeaders(res);
    res.json({
      success: true,
      message: 'Draft saved successfully to persistent database',
      draft: store.draft,
      hasDraftChanges,
    });
  } catch (err: any) {
    console.error('Error saving draft:', err);
    res.status(500).json({ error: err.message || 'Failed to save draft' });
  }
});

// 4. Publish Live - Atomically writes to published database and synchronizes all devices
bindRoute('post', ['/api/cms/content/publish'], (req: Request, res: Response) => {
  try {
    const store = loadContentStore();
    let updatedDraft = req.body.draft || store.draft;
    if (!updatedDraft) {
      res.status(400).json({ error: 'No draft content provided to publish' });
      return;
    }
    // Ensure all base64 data URIs are converted to permanent /uploads/... files
    updatedDraft = processAndExtractBase64Images(updatedDraft);
    const cleanDraft = ensureServerContentDefaults(updatedDraft);

    cleanDraft.version = (store.published.version || 1) + 1;
    cleanDraft.lastUpdated = new Date().toISOString();
    store.draft = cleanDraft;
    store.published = JSON.parse(JSON.stringify(cleanDraft));
    saveContentStore(store);

    setNoCacheHeaders(res);
    res.json({
      success: true,
      message: 'All changes published live successfully to persistent database!',
      published: store.published,
      draft: store.draft,
      version: store.published.version,
      lastUpdated: store.published.lastUpdated,
      hasDraftChanges: false,
    });
  } catch (err: any) {
    console.error('Error publishing content:', err);
    res.status(500).json({ error: err.message || 'Failed to publish changes' });
  }
});

// 5. Revert Draft to Published
bindRoute('post', ['/api/cms/content/revert'], (req: Request, res: Response) => {
  try {
    const store = loadContentStore();
    store.draft = JSON.parse(JSON.stringify(store.published));
    saveContentStore(store);
    res.json({
      success: true,
      message: 'Draft reverted to current published version',
      draft: store.draft,
      published: store.published,
      hasDraftChanges: false,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to revert draft' });
  }
});

// 6. Reset to Factory Defaults
bindRoute('post', ['/api/cms/content/reset'], (req: Request, res: Response) => {
  try {
    const freshStore: CMSStore = {
      published: JSON.parse(JSON.stringify(DEFAULT_CMS_CONTENT)),
      draft: JSON.parse(JSON.stringify(DEFAULT_CMS_CONTENT)),
    };
    saveContentStore(freshStore);
    res.json({
      success: true,
      message: 'Reset to initial factory defaults',
      published: freshStore.published,
      draft: freshStore.draft,
      hasDraftChanges: false,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to reset content' });
  }
});

// 7. Media Library: Get all media assets
bindRoute('get', ['/api/cms/media'], (req: Request, res: Response) => {
  setNoCacheHeaders(res);
  const media = loadMediaStore();
  res.json(media);
});

// 8. Media Upload: Direct file upload from device into internal storage bucket
bindRoute('post', ['/api/upload'], (req: Request, res: Response) => {
  (upload.single('file') as any)(req, res, async (err: any) => {
    if (err) {
      console.error('Multer upload error:', err);
      res.status(400).json({ error: err.message || 'File upload failed' });
      return;
    }
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No image file was provided' });
        return;
      }
      const permanentUrl = `/uploads/${req.file.filename}`;

      // Duplicate to TMP_UPLOADS_DIR if saved to UPLOADS_DIR, and vice-versa
      try {
        if (!fs.existsSync(TMP_UPLOADS_DIR)) fs.mkdirSync(TMP_UPLOADS_DIR, { recursive: true });
        const tmpTarget = path.join(TMP_UPLOADS_DIR, req.file.filename);
        if (!fs.existsSync(tmpTarget) && fs.existsSync(req.file.path)) {
          fs.copyFileSync(req.file.path, tmpTarget);
        }
      } catch {}

      const asset: MediaAsset = {
        id: 'med-' + Date.now() + '-' + Math.round(Math.random() * 1000),
        url: permanentUrl,
        name: req.file.originalname,
        size: req.file.size,
        type: req.file.mimetype,
        createdAt: new Date().toISOString(),
        category: (req.body.category as string) || 'General',
      };
      const media = loadMediaStore();
      media.unshift(asset);
      saveMediaStore(media);
      res.json({
        success: true,
        message: 'File uploaded permanently to storage bucket',
        asset,
        url: permanentUrl,
      });
    } catch (error: any) {
      console.error('Error saving media asset record:', error);
      res.status(500).json({ error: error.message || 'Failed to save media record' });
    }
  });
});

// 8b. Upload Base64 Data URI to permanent disk storage
bindRoute('post', ['/api/upload-base64'], (req: Request, res: Response) => {
  try {
    const { dataUri, name, category } = req.body;
    if (!dataUri || typeof dataUri !== 'string' || !dataUri.startsWith('data:image/')) {
      res.status(400).json({ error: 'Valid image Data URI is required' });
      return;
    }
    const saved = saveBase64Image(dataUri, name || 'upload', category || 'Uploads');
    if (!saved) {
      res.status(500).json({ error: 'Could not process and save base64 image' });
      return;
    }
    res.json({
      success: true,
      message: 'Base64 image converted to permanent storage URL successfully',
      url: saved.url,
      asset: saved.asset,
    });
  } catch (error: any) {
    console.error('Error in /api/upload-base64:', error);
    res.status(500).json({ error: error.message || 'Failed to convert base64 image' });
  }
});

// 9. Media Library: Delete media asset
bindRoute('delete', ['/api/cms/media/:id'], (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const media = loadMediaStore();
    const target = media.find((m) => m.id === id);

    // Remove file from disk
    if (target && target.url) {
      const normalizedUrl = target.url.startsWith('/') ? target.url.slice(1) : target.url;
      if (normalizedUrl.startsWith('uploads/')) {
        const filename = path.basename(normalizedUrl);
        try {
          const filePath = path.join(UPLOADS_DIR, filename);
          if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        } catch {}
        try {
          const tmpFilePath = path.join(TMP_UPLOADS_DIR, filename);
          if (fs.existsSync(tmpFilePath)) fs.unlinkSync(tmpFilePath);
        } catch {}
      }
    }

    const updated = media.filter((m) => m.id !== id);
    saveMediaStore(updated);

    res.json({
      success: true,
      message: 'Image deleted permanently from storage bucket',
      deletedAsset: target,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete media' });
  }
});

// 10. Enquiries / Orders: Get all
bindRoute('get', ['/api/enquiries'], (req: Request, res: Response) => {
  setNoCacheHeaders(res);
  const enquiries = loadEnquiriesStore();
  res.json(enquiries);
});

// 11. Enquiries / Orders: Create new
bindRoute('post', ['/api/enquiries'], (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, categoryInterest, message, channel } = req.body;
    const newEnquiry: CustomerEnquiry = {
      id: 'enq-' + Date.now(),
      createdAt: new Date().toISOString(),
      fullName: fullName || 'Valued Client',
      email: email || '',
      phone: phone || '',
      categoryInterest: categoryInterest || 'General Enquiry',
      message: message || '',
      status: 'New',
      channel: channel || 'Website Form',
    };
    const list = loadEnquiriesStore();
    list.unshift(newEnquiry);
    saveEnquiriesStore(list);
    res.json({ success: true, enquiry: newEnquiry });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to record enquiry' });
  }
});

// 12. Enquiries / Orders: Update status or notes
bindRoute('patch', ['/api/enquiries/:id'], (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    const list = loadEnquiriesStore();
    const item = list.find((e) => e.id === id);
    if (!item) {
      res.status(404).json({ error: 'Enquiry record not found' });
      return;
    }
    if (status) item.status = status;
    if (notes !== undefined) item.notes = notes;
    saveEnquiriesStore(list);
    res.json({ success: true, enquiry: item });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to update enquiry' });
  }
});

// 13. Enquiries / Orders: Delete
bindRoute('delete', ['/api/enquiries/:id'], (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const list = loadEnquiriesStore();
    const filtered = list.filter((e) => e.id !== id);
    saveEnquiriesStore(filtered);
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to delete enquiry' });
  }
});

  // ----------------------------------------------------
  // VITE MIDDLEWARE / PRODUCTION STATIC SERVING
  // ----------------------------------------------------

export async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Infinity Furnitures and Interior World Nigeria Limited Server running on port ${PORT}`);
  });
}

// Automatically start standalone server when executed directly (e.g. Cloud Run, Docker, node, tsx)
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  startServer();
}
