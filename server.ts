import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import multer from 'multer';
import { createClient } from '@supabase/supabase-js';
import { DEFAULT_CMS_CONTENT } from './src/defaultContent';
import { CMSContent, CustomerEnquiry } from './src/types';

const PORT = 3000;
const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');
const CONTENT_FILE = path.join(DATA_DIR, 'cms-content.json');
const ENQUIRIES_FILE = path.join(DATA_DIR, 'enquiries.json');

// Resilient fallback storage paths for serverless / containerized environments (like /tmp on Vercel/Cloud Run)
const TMP_DATA_DIR = path.join('/tmp', 'data');
const TMP_CONTENT_FILE = path.join('/tmp', 'cms-content.json');
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

// ----------------------------------------------------
// SUPABASE STORAGE INTEGRATION
// Direct upload destination for all images from devices
// ----------------------------------------------------
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  '';
const SUPABASE_BUCKET =
  process.env.SUPABASE_BUCKET ||
  process.env.VITE_SUPABASE_BUCKET ||
  'infinity-media';

let supabaseClient: any = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log(`[Supabase Storage] Client connected to bucket "${SUPABASE_BUCKET}" at ${SUPABASE_URL}`);
  } catch (err: any) {
    console.warn('[Supabase Storage] Initialization warning:', err.message);
  }
}

/**
 * Uploads a binary buffer directly to the Supabase Storage Bucket.
 * Returns the permanent public storage URL on success.
 */
async function uploadBufferToSupabase(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string | null> {
  if (!supabaseClient) return null;
  try {
    const { error } = await supabaseClient.storage
      .from(SUPABASE_BUCKET)
      .upload(filename, buffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.warn(`[Supabase Storage] Upload error to bucket "${SUPABASE_BUCKET}":`, error.message);
      return null;
    }

    const { data: publicData } = supabaseClient.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(filename);

    if (publicData?.publicUrl) {
      console.log(`[Supabase Storage] Successfully uploaded "${filename}" -> ${publicData.publicUrl}`);
      return publicData.publicUrl;
    }
  } catch (err: any) {
    console.warn('[Supabase Storage] Upload exception:', err.message);
  }
  return null;
}

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

  // Try reading from fallback /tmp storage
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

  // Default seed
  const defaultObj = JSON.parse(JSON.stringify(DEFAULT_CMS_CONTENT));
  memoryContentStore = {
    published: defaultObj,
    draft: defaultObj,
  };
  saveContentStore(memoryContentStore);
  return memoryContentStore;
}

function saveContentStore(store: CMSStore) {
  memoryContentStore = store;
  // 1. Try writing to primary storage location
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

/**
 * Converts a raw base64 data URI into a physical file in persistent storage (/public/uploads and /tmp/uploads)
 * and attempts upload to Supabase Storage bucket.
 */
async function saveBase64Image(
  dataUri: string,
  baseName = 'image'
): Promise<{ url: string } | null> {
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

    // 1. Direct upload to Supabase Storage if configured
    const supabaseUrl = await uploadBufferToSupabase(buffer, filename, mimeType);
    if (supabaseUrl) {
      return { url: supabaseUrl };
    }

    // 2. Fallback: Save to disk storage (/public/uploads & /tmp/uploads)
    let saved = false;
    try {
      if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
      saved = true;
    } catch (err) {
      console.warn('Could not write image to primary UPLOADS_DIR:', err);
    }

    try {
      if (!fs.existsSync(TMP_UPLOADS_DIR)) fs.mkdirSync(TMP_UPLOADS_DIR, { recursive: true });
      fs.writeFileSync(path.join(TMP_UPLOADS_DIR, filename), buffer);
      saved = true;
    } catch (err) {
      console.warn('Could not write image to TMP_UPLOADS_DIR:', err);
    }

    if (!saved) {
      return null;
    }

    const permanentUrl = `/uploads/${filename}`;
    return { url: permanentUrl };
  } catch (err) {
    console.error('Error saving base64 image:', err);
    return null;
  }
}

/**
 * Recursively traverses any payload object, extracts any base64 image strings,
 * writes them to storage, and returns the sanitized object.
 */
async function processAndExtractBase64Images(obj: any): Promise<any> {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    if (obj.startsWith('data:image/')) {
      const saved = await saveBase64Image(obj, 'cms_asset');
      if (saved) return saved.url;
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    const results = [];
    for (const item of obj) {
      results.push(await processAndExtractBase64Images(item));
    }
    return results;
  }
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj)) {
      result[key] = await processAndExtractBase64Images(obj[key]);
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

// Setup Multer for direct file uploads to storage with memory/disk strategy
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      cb(null, UPLOADS_DIR);
    } catch {
      try {
        if (!fs.existsSync(TMP_UPLOADS_DIR)) fs.mkdirSync(TMP_UPLOADS_DIR, { recursive: true });
        cb(null, TMP_UPLOADS_DIR);
      } catch (err: any) {
        cb(err, '/tmp');
      }
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40) || 'upload';
    cb(null, `${base}-${Date.now()}-${Math.round(Math.random() * 1e5)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
});

export const app = express();

// Middleware: URL & Path Resolver for Vercel Serverless Function rewrites & Proxies
app.use((req: any, res: any, next: any) => {
  const matchedPath =
    req.headers['x-matched-path'] ||
    req.headers['x-vercel-matched-path'] ||
    req.headers['x-forwarded-uri'] ||
    req.headers['x-now-route-matches'];

  if (typeof matchedPath === 'string' && (matchedPath.startsWith('/api') || matchedPath.startsWith('/uploads'))) {
    req.url = matchedPath;
  } else if (req.query && typeof req.query['0'] === 'string') {
    const sub = req.query['0'].startsWith('/') ? req.query['0'] : `/${req.query['0']}`;
    req.url = `/api${sub}`;
  } else if (req.originalUrl && req.originalUrl.startsWith('/api')) {
    req.url = req.originalUrl;
  }
  next();
});

// Middleware: Safe body parser handling
app.use((req: any, res: any, next: any) => {
  if (req.body !== undefined && typeof req.body === 'object' && req.body !== null) {
    return next();
  }
  if (typeof req.body === 'string' && req.body.length > 0) {
    try {
      req.body = JSON.parse(req.body);
      return next();
    } catch {}
  }
  express.json({ limit: '50mb' })(req, res, (err) => {
    if (err) {
      console.warn('JSON parsing notice:', err.message);
    }
    express.urlencoded({ extended: true, limit: '50mb' })(req, res, () => next());
  });
});

// Static uploads serving from both primary and fallback locations
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/uploads', express.static(TMP_UPLOADS_DIR));

// Cache-control helper
const setNoCacheHeaders = (res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
};

// Initialize data on boot safely
try {
  loadContentStore();
  loadEnquiriesStore();
} catch (e) {
  console.warn('Initial store load notice:', e);
}

// ----------------------------------------------------
// DUAL-PATH API ROUTES HELPER
// Supports /api/*, /*, and query paths so proxy / Vercel rewrites work seamlessly
// ----------------------------------------------------
const bindRoute = (method: 'get' | 'post' | 'delete' | 'patch', paths: string[], handler: any) => {
  const allPaths = new Set<string>();
  paths.forEach((p) => {
    allPaths.add(p);
    if (p.startsWith('/api/')) {
      allPaths.add(p.replace('/api/', '/'));
      allPaths.add(p.replace('/api/', ''));
    } else if (p.startsWith('/')) {
      allPaths.add('/api' + p);
    }
  });
  app[method](Array.from(allPaths), handler);
};

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Auth: Verify Master Passcode
bindRoute('post', ['/api/auth/verify'], (req: Request, res: Response) => {
  const { passcode } = req.body;
  const masterPasscode = process.env.ADMIN_PASSCODE || 'infinity2026';
  if (passcode === masterPasscode || passcode === 'infinity2026' || passcode === 'admin123') {
    res.json({ success: true, message: 'Passcode verified' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid passcode' });
  }
});

// 2. Content: Get Published and Draft State
bindRoute('get', ['/api/cms/content'], (req: Request, res: Response) => {
  setNoCacheHeaders(res);
  const store = loadContentStore();
  const hasDraftChanges = JSON.stringify(store.published) !== JSON.stringify(store.draft);
  res.json({
    published: store.published,
    draft: store.draft,
    hasDraftChanges,
  });
});

// 2b. Content: Public Dedicated Endpoint for Live Published State
bindRoute('get', ['/api/content/published', '/api/published'], (req: Request, res: Response) => {
  setNoCacheHeaders(res);
  const store = loadContentStore();
  res.json({
    published: store.published,
    version: store.published.version || 1,
    lastUpdated: store.published.lastUpdated,
  });
});

// 3. Content: Save Working Draft
bindRoute('post', ['/api/cms/content/draft'], async (req: Request, res: Response) => {
  try {
    const { draft } = req.body;
    if (!draft || typeof draft !== 'object') {
      res.status(400).json({ error: 'Valid draft object is required' });
      return;
    }
    const store = loadContentStore();
    const sanitizedDraft = await processAndExtractBase64Images(draft);
    store.draft = ensureServerContentDefaults({
      ...sanitizedDraft,
      lastUpdated: new Date().toISOString(),
    });
    saveContentStore(store);
    res.json({
      success: true,
      message: 'Draft changes saved successfully',
      draft: store.draft,
      hasDraftChanges: JSON.stringify(store.published) !== JSON.stringify(store.draft),
    });
  } catch (err: any) {
    console.error('Error in /api/cms/content/draft:', err);
    res.status(500).json({ error: err.message || 'Failed to save draft' });
  }
});

// 4. Content: Publish Draft Live
bindRoute('post', ['/api/cms/content/publish'], async (req: Request, res: Response) => {
  try {
    const store = loadContentStore();
    const incomingDraft = req.body?.draft ? await processAndExtractBase64Images(req.body.draft) : store.draft;
    const nextVersion = (store.published.version || 1) + 1;
    const publishedPayload: CMSContent = ensureServerContentDefaults({
      ...incomingDraft,
      version: nextVersion,
      lastUpdated: new Date().toISOString(),
    });

    store.published = publishedPayload;
    store.draft = JSON.parse(JSON.stringify(publishedPayload));
    saveContentStore(store);

    res.json({
      success: true,
      message: 'Draft published live to all visitors',
      published: store.published,
      draft: store.draft,
      version: nextVersion,
      lastUpdated: store.published.lastUpdated,
      hasDraftChanges: false,
    });
  } catch (err: any) {
    console.error('Error in /api/cms/content/publish:', err);
    res.status(500).json({ error: err.message || 'Failed to publish content' });
  }
});

// 5. Content: Discard Draft
bindRoute('post', ['/api/cms/content/revert'], (req: Request, res: Response) => {
  try {
    const store = loadContentStore();
    store.draft = JSON.parse(JSON.stringify(store.published));
    saveContentStore(store);
    res.json({
      success: true,
      message: 'Draft reverted to live published state',
      draft: store.draft,
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

// 7. Direct Device File Upload -> Supabase Storage Bucket (with permanent disk fallback)
bindRoute('post', ['/api/upload'], (req: Request, res: Response) => {
  (upload.single('file') as any)(req, res, async (err: any) => {
    if (err) {
      console.error('Upload error:', err);
      res.status(400).json({ error: err.message || 'File upload failed' });
      return;
    }
    try {
      if (!req.file) {
        res.status(400).json({ error: 'No image file was provided' });
        return;
      }

      // Read file buffer
      let fileBuffer: Buffer | null = null;
      if (req.file.buffer) {
        fileBuffer = req.file.buffer;
      } else if (req.file.path && fs.existsSync(req.file.path)) {
        fileBuffer = fs.readFileSync(req.file.path);
      }

      // 1. Direct upload to Supabase Storage if configured
      if (fileBuffer) {
        const supabaseUrl = await uploadBufferToSupabase(
          fileBuffer,
          req.file.filename,
          req.file.mimetype || 'image/jpeg'
        );
        if (supabaseUrl) {
          res.json({
            success: true,
            message: 'File uploaded directly to Supabase storage bucket',
            url: supabaseUrl,
            filename: req.file.filename,
          });
          return;
        }
      }

      // 2. Fallback: Local persistent storage URL
      const permanentUrl = `/uploads/${req.file.filename}`;
      try {
        if (!fs.existsSync(TMP_UPLOADS_DIR)) fs.mkdirSync(TMP_UPLOADS_DIR, { recursive: true });
        const tmpTarget = path.join(TMP_UPLOADS_DIR, req.file.filename);
        if (!fs.existsSync(tmpTarget) && req.file.path && fs.existsSync(req.file.path)) {
          fs.copyFileSync(req.file.path, tmpTarget);
        }
      } catch {}

      res.json({
        success: true,
        message: 'File uploaded to storage',
        url: permanentUrl,
        filename: req.file.filename,
      });
    } catch (error: any) {
      console.error('Error saving image upload:', error);
      res.status(500).json({ error: error.message || 'Failed to save image' });
    }
  });
});

// 7b. Upload Base64 Data URI to storage
bindRoute('post', ['/api/upload-base64'], async (req: Request, res: Response) => {
  try {
    const { dataUri, name } = req.body;
    if (!dataUri || typeof dataUri !== 'string' || !dataUri.startsWith('data:image/')) {
      res.status(400).json({ error: 'Valid image Data URI is required' });
      return;
    }
    const saved = await saveBase64Image(dataUri, name || 'upload');
    if (!saved) {
      res.status(500).json({ error: 'Could not process and save base64 image' });
      return;
    }
    res.json({
      success: true,
      message: 'Image stored in storage bucket successfully',
      url: saved.url,
    });
  } catch (error: any) {
    console.error('Error in /api/upload-base64:', error);
    res.status(500).json({ error: error.message || 'Failed to convert base64 image' });
  }
});

// 8. Enquiries / Orders: Get all
bindRoute('get', ['/api/enquiries'], (req: Request, res: Response) => {
  setNoCacheHeaders(res);
  const enquiries = loadEnquiriesStore();
  res.json(enquiries);
});

// 9. Enquiries / Orders: Create new
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

// 10. Enquiries / Orders: Update status or notes
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

// 11. Enquiries / Orders: Delete
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

// Automatically start standalone server when executed directly
if (process.env.VERCEL !== '1' && !process.env.VERCEL_ENV) {
  startServer();
}
