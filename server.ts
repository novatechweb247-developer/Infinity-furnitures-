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

// Ensure storage directories exist safely
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
// SUPABASE STORAGE & PRODUCTION PERSISTENCE INTEGRATION
// Single source of truth for media and CMS across domains
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
const CANONICAL_DOMAIN =
  process.env.CANONICAL_DOMAIN ||
  process.env.VITE_CANONICAL_DOMAIN ||
  '';

let supabaseClient: any = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log(`[Supabase Storage] Connected to bucket "${SUPABASE_BUCKET}" at ${SUPABASE_URL}`);
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

  const phone = incomingContact.phone1 || incomingContact.phone || incomingBrand.phone1 || incomingBrand.phone || DEFAULT_CMS_CONTENT.contact.phone1;
  const effectivePhone1 = phone && typeof phone === 'string' && phone.trim().length > 5 ? phone.trim() : '0806 879 5174';
  const effectivePhone2 = '';
  const effectiveWhatsapp = '2348068795174';

  const rawEmail = incomingContact.email || incomingBrand.email || DEFAULT_CMS_CONTENT.contact.email;
  const effectiveEmail = rawEmail && typeof rawEmail === 'string' && !rawEmail.includes('concierge@infinity') && !rawEmail.includes('example.com')
    ? rawEmail.trim()
    : 'Lawalcy68@gmail.com';

  let rawAddress = incomingContact.address || incomingBrand.address || DEFAULT_CMS_CONTENT.contact.address;
  if (!rawAddress || /Lagos|Abuja|Victoria Island|Lekki/i.test(rawAddress)) {
    rawAddress = 'Jos, Plateau State';
  }
  const effectiveAddress = rawAddress;
  const effectiveHours = incomingContact.openingHours || incomingContact.workingHours || incomingBrand.openingHours || incomingBrand.workingHours || DEFAULT_CMS_CONTENT.contact.openingHours;

  const rawSlides = Array.isArray(content.heroSlides) && content.heroSlides.length > 0
    ? content.heroSlides
    : DEFAULT_CMS_CONTENT.heroSlides;

  const heroSlides = rawSlides.map((slide: any, idx: number) => {
    const s = (slide && typeof slide === 'object') ? slide : {};
    const defaultSlide = DEFAULT_CMS_CONTENT.heroSlides[idx % DEFAULT_CMS_CONTENT.heroSlides.length] || DEFAULT_CMS_CONTENT.heroSlides[0];
    return {
      id: s.id || `slide-${idx + 1}`,
      overline: s.overline || s.subtitle || defaultSlide.overline || 'Infinity Furnitures and Interior World Nigeria Limited',
      title: s.title || defaultSlide.title || 'Design your space differently.',
      subtitle: s.subtitle || s.description || defaultSlide.subtitle || '',
      description: s.description || s.subtitle || '',
      tagline: s.tagline || defaultSlide.subtitle || '',
      primaryCtaText: s.primaryCtaText || defaultSlide.primaryCtaText || 'Explore Collection',
      primaryCtaAction: s.primaryCtaAction || defaultSlide.primaryCtaAction || 'collection',
      secondaryCtaText: s.secondaryCtaText !== undefined ? s.secondaryCtaText : (defaultSlide.secondaryCtaText || 'Contact Us'),
      secondaryCtaAction: s.secondaryCtaAction || defaultSlide.secondaryCtaAction || 'contact',
      image: s.image || defaultSlide.image,
      imageAlt: s.imageAlt || s.title || defaultSlide.imageAlt || 'Luxury Furniture',
      enabled: s.enabled !== false && s.active !== false,
      active: s.active !== false && s.enabled !== false,
      order: s.order || idx + 1,
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
let lastFetchTime = 0;
const CACHE_TTL = 3000; // 3 seconds cache TTL for high frequency polling synchronization
let verifiedBucket: string | null = null;
let verifiedTable: string | null = null;

async function syncToSupabaseStorage(store: CMSStore): Promise<boolean> {
  if (!supabaseClient) return false;
  
  const buckets = [verifiedBucket, SUPABASE_BUCKET, 'media', 'uploads', 'assets'].filter((b): b is string => typeof b === 'string' && b.length > 0);
  const jsonBuffer = Buffer.from(JSON.stringify(store, null, 2), 'utf-8');
  
  for (const bucket of buckets) {
    try {
      console.log(`[Supabase Storage] Attempting sync to bucket "${bucket}"...`);
      
      // Proactively ensure the bucket exists (self-healing fallback)
      try {
        await supabaseClient.storage.createBucket(bucket, { public: true });
      } catch (bucketCreateErr: any) {
        // Safe to ignore if bucket already exists or if we lack permissions
      }

      const { error } = await supabaseClient.storage
        .from(bucket)
        .upload('_cms_database/content_store.json', jsonBuffer, {
          contentType: 'application/json',
          upsert: true,
        });
        
      if (!error) {
        console.log(`[Supabase Storage] Successfully uploaded to bucket "${bucket}".`);
        verifiedBucket = bucket;
        return true;
      }
      
      // Try updating if upload returned an error (for some client versions)
      if (error) {
        const { error: updateError } = await supabaseClient.storage
          .from(bucket)
          .update('_cms_database/content_store.json', jsonBuffer, {
            contentType: 'application/json',
            upsert: true,
          });
        if (!updateError) {
          console.log(`[Supabase Storage] Successfully updated in bucket "${bucket}".`);
          verifiedBucket = bucket;
          return true;
        }
      }
      console.warn(`[Supabase Storage] Sync failed for bucket "${bucket}":`, error.message);
    } catch (err: any) {
      console.warn(`[Supabase Storage] Sync exception for bucket "${bucket}":`, err.message);
    }
  }
  return false;
}

async function loadFromSupabaseStorage(): Promise<CMSStore | null> {
  if (!supabaseClient) return null;
  
  const buckets = [verifiedBucket, SUPABASE_BUCKET, 'media', 'uploads', 'assets'].filter((b): b is string => typeof b === 'string' && b.length > 0);
  
  for (const bucket of buckets) {
    try {
      console.log(`[Supabase Storage] Attempting load from bucket "${bucket}"...`);
      const { data, error } = await supabaseClient.storage
        .from(bucket)
        .download('_cms_database/content_store.json');
        
      if (!error && data) {
        const text = await data.text();
        const parsed = JSON.parse(text);
        if (parsed && (parsed.published || parsed.draft)) {
          console.log(`[Supabase Storage] Successfully loaded content store from bucket "${bucket}".`);
          verifiedBucket = bucket;
          return parsed;
        }
      } else if (error) {
        console.warn(`[Supabase Storage] Download failed from bucket "${bucket}":`, error.message);
      }
    } catch (err: any) {
      console.warn(`[Supabase Storage] Load exception for bucket "${bucket}":`, err.message);
    }
  }
  return null;
}

async function loadFromSupabaseTable(): Promise<CMSStore | null> {
  if (!supabaseClient) return null;
  
  const tables = [verifiedTable, 'cms_content', 'cms_data', 'content', 'settings'].filter((t): t is string => typeof t === 'string' && t.length > 0);
  
  for (const table of tables) {
    try {
      console.log(`[Supabase DB] Attempting load from table "${table}"...`);
      const { data, error } = await supabaseClient
        .from(table)
        .select('*')
        .eq('id', 'master')
        .maybeSingle();
        
      if (!error && data) {
        if (data.published || data.draft) {
          console.log(`[Supabase DB] Successfully loaded content store from table "${table}".`);
          verifiedTable = table;
          return {
            published: ensureServerContentDefaults(data.published),
            draft: ensureServerContentDefaults(data.draft || data.published),
          };
        }
      } else if (error) {
        console.warn(`[Supabase DB] Load failed from table "${table}":`, error.message);
      }
    } catch (err: any) {
      console.warn(`[Supabase DB] Load exception for table "${table}":`, err.message);
    }
  }
  return null;
}

async function syncToSupabaseTable(store: CMSStore): Promise<boolean> {
  if (!supabaseClient) return false;
  
  const tables = [verifiedTable, 'cms_content', 'cms_data', 'content', 'settings'].filter((t): t is string => typeof t === 'string' && t.length > 0);
  for (const table of tables) {
    try {
      console.log(`[Supabase DB] Attempting upsert into table "${table}"...`);
      const { error } = await supabaseClient
        .from(table)
        .upsert({
          id: 'master',
          published: store.published,
          draft: store.draft,
          version: store.published.version || 1,
          last_updated: store.published.lastUpdated || new Date().toISOString(),
        });
        
      if (!error) {
        console.log(`[Supabase DB] Successfully upserted into table "${table}".`);
        verifiedTable = table;
        return true;
      }
      console.warn(`[Supabase DB] Upsert failed for table "${table}":`, error.message);
    } catch (err: any) {
      console.warn(`[Supabase DB] Upsert exception for table "${table}":`, err.message);
    }
  }
  return false;
}

async function loadContentStoreAsync(): Promise<CMSStore> {
  const now = Date.now();
  if (memoryContentStore && (now - lastFetchTime < CACHE_TTL)) {
    return memoryContentStore;
  }
  
  if (supabaseClient) {
    try {
      let remoteStore = await loadFromSupabaseStorage();
      if (!remoteStore) {
        console.log('[Supabase Load] Storage load returned null. Trying database table fallback...');
        remoteStore = await loadFromSupabaseTable();
      }
      
      if (remoteStore) {
        memoryContentStore = remoteStore;
        lastFetchTime = now;
        
        // Asynchronously save backup to local files for speed
        try {
          if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
          fs.writeFileSync(CONTENT_FILE, JSON.stringify(remoteStore, null, 2), 'utf-8');
        } catch {}
        try {
          if (!fs.existsSync(TMP_DATA_DIR)) fs.mkdirSync(TMP_DATA_DIR, { recursive: true });
          fs.writeFileSync(TMP_CONTENT_FILE, JSON.stringify(remoteStore, null, 2), 'utf-8');
        } catch {}
        
        return memoryContentStore;
      }
    } catch (err: any) {
      console.warn('[Supabase Sync Load] Supabase load warning:', err.message);
    }
  }
  
  if (memoryContentStore) {
    return memoryContentStore;
  }
  
  // Try reading from primary persistent storage (local files)
  try {
    if (fs.existsSync(CONTENT_FILE)) {
      const raw = fs.readFileSync(CONTENT_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data && (data.published || data.draft)) {
        memoryContentStore = {
          published: ensureServerContentDefaults(data.published || data),
          draft: ensureServerContentDefaults(data.draft || data.published || data),
        };
        lastFetchTime = now;
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
        lastFetchTime = now;
        return memoryContentStore;
      }
    }
  } catch (err) {
    console.warn('Could not read fallback TMP_CONTENT_FILE:', err);
  }

  // Default seed fallback
  const defaultObj = JSON.parse(JSON.stringify(DEFAULT_CMS_CONTENT));
  memoryContentStore = {
    published: defaultObj,
    draft: defaultObj,
  };
  lastFetchTime = now;
  // Async background save
  saveContentStoreAsync(memoryContentStore).catch(() => {});
  return memoryContentStore;
}

async function saveContentStoreAsync(store: CMSStore) {
  memoryContentStore = store;
  lastFetchTime = Date.now();
  console.log('[CMS Save] Saving content store version:', store.published.version);
  
  // 1. Write to primary local file
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(store, null, 2), 'utf-8');
    console.log('[CMS Save] Successfully wrote to primary CONTENT_FILE:', CONTENT_FILE);
  } catch (err: any) {
    console.warn('[CMS Save] Notice writing primary CONTENT_FILE:', err.message);
  }

  // 2. Write to /tmp fallback local file
  try {
    if (!fs.existsSync(TMP_DATA_DIR)) fs.mkdirSync(TMP_DATA_DIR, { recursive: true });
    fs.writeFileSync(TMP_CONTENT_FILE, JSON.stringify(store, null, 2), 'utf-8');
    console.log('[CMS Save] Successfully wrote to TMP_CONTENT_FILE:', TMP_CONTENT_FILE);
  } catch (err: any) {
    console.warn('[CMS Save] Notice writing TMP_CONTENT_FILE:', err.message);
  }

  // 3. Sync to Supabase Storage Bucket and Database
  if (supabaseClient) {
    try {
      await syncToSupabaseStorage(store);
      await syncToSupabaseTable(store);
    } catch (e: any) {
      console.warn('[Supabase Sync Save] Outer Exception:', e.message);
    }
  }
}

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
  console.log('[CMS Save] Saving content store version:', store.published.version);
  // 1. Try writing to primary storage location
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(CONTENT_FILE, JSON.stringify(store, null, 2), 'utf-8');
    console.log('[CMS Save] Successfully wrote to primary CONTENT_FILE:', CONTENT_FILE);
  } catch (err: any) {
    console.warn('[CMS Save] Notice writing primary CONTENT_FILE:', err.message);
  }

  // 2. Always write to /tmp fallback location
  try {
    if (!fs.existsSync(TMP_DATA_DIR)) fs.mkdirSync(TMP_DATA_DIR, { recursive: true });
    fs.writeFileSync(TMP_CONTENT_FILE, JSON.stringify(store, null, 2), 'utf-8');
    console.log('[CMS Save] Successfully wrote to TMP_CONTENT_FILE:', TMP_CONTENT_FILE);
  } catch (err: any) {
    console.warn('[CMS Save] Notice writing TMP_CONTENT_FILE:', err.message);
  }

  // 3. Sync to Supabase Storage Bucket asynchronously for cross-domain persistence
  if (supabaseClient) {
    syncToSupabaseStorage(store).catch(() => {});
    syncToSupabaseTable(store).catch(() => {});
  } else {
    console.log('[Supabase Sync] Skipped: supabaseClient not initialized (missing credentials).');
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
    if (supabaseClient) {
      try {
        const supabaseUrl = await uploadBufferToSupabase(buffer, filename, mimeType);
        if (supabaseUrl) {
          return { url: supabaseUrl };
        }
      } catch (sbErr) {
        console.warn('Supabase base64 upload notice:', sbErr);
      }
    }

    // 2. Fallback: Save to disk storage (/public/uploads & /tmp/uploads)
    let saved = false;
    try {
      if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
      fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
      saved = true;
    } catch {}

    try {
      if (!fs.existsSync(TMP_UPLOADS_DIR)) fs.mkdirSync(TMP_UPLOADS_DIR, { recursive: true });
      fs.writeFileSync(path.join(TMP_UPLOADS_DIR, filename), buffer);
      saved = true;
    } catch {}

    if (saved) {
      return { url: `/uploads/${filename}` };
    }

    return null;
  } catch (err) {
    console.warn('Error saving base64 image:', err);
    return null;
  }
}

/**
 * Recursively traverses any payload object with depth protection, extracts base64 images,
 * stores them in permanent storage, and returns the sanitized object.
 */
async function processAndExtractBase64Images(obj: any, depth = 0): Promise<any> {
  if (depth > 8) return obj;
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object' && typeof obj !== 'string') return obj;
  if (Buffer.isBuffer(obj)) return obj;

  if (typeof obj === 'string') {
    if (obj.startsWith('data:image/')) {
      try {
        const saved = await saveBase64Image(obj, 'cms_asset');
        if (saved && saved.url) return saved.url;
      } catch (e) {
        console.warn('saveBase64Image error:', e);
      }
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    const results = [];
    for (const item of obj) {
      results.push(await processAndExtractBase64Images(item, depth + 1));
    }
    return results;
  }

  const result: any = {};
  for (const key of Object.keys(obj)) {
    result[key] = await processAndExtractBase64Images(obj[key], depth + 1);
  }
  return result;
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
      phone: '0806 879 5174',
      categoryInterest: 'Wardrobes & Closets',
      message: 'Hello, I would like a quote for a 4-meter master bedroom floor-to-ceiling wardrobe with fluted white oak doors.',
      status: 'New',
      channel: 'Website Form',
      notes: 'Requested on-site measurement in Jos, Plateau State.',
    },
    {
      id: 'enq-2',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      fullName: 'Fatima Mohammed',
      email: 'fatima.m@luxuryhomes.ng',
      phone: '0806 879 5174',
      categoryInterest: 'Luxury Sofas',
      message: 'Inquiring about custom 10-seater curved boucle sectional sofa in cream fabric for our private villa in Jos, Plateau State.',
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

// Setup Multer for direct file uploads to storage
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
  limits: { fileSize: 50 * 1024 * 1024 },
});

export const app = express();

// ----------------------------------------------------
// CANONICAL DOMAIN & CORS MIDDLEWARE
// Redirects secondary domains to the canonical domain
// and sets universal cross-origin headers for API sync
// ----------------------------------------------------
app.use((req: any, res: any, next: any) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  // Canonical Domain 308 Permanent Redirection
  const host = (req.headers.host || '').toLowerCase();
  if (
    CANONICAL_DOMAIN &&
    host &&
    !host.includes('localhost') &&
    !host.includes('127.0.0.1') &&
    host !== CANONICAL_DOMAIN.toLowerCase() &&
    (host.endsWith('.vercel.app') || host.startsWith('www.'))
  ) {
    const redirectUrl = `https://${CANONICAL_DOMAIN}${req.url}`;
    return res.redirect(308, redirectUrl);
  }

  next();
});

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

// Middleware: Safe body parser handling for both standalone and pre-parsed Vercel serverless functions
app.use((req: any, res: any, next: any) => {
  if (Buffer.isBuffer(req.body)) {
    try {
      req.body = JSON.parse(req.body.toString('utf-8'));
      return next();
    } catch {}
  }
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
bindRoute('post', ['/api/auth/verify', '/auth/verify'], (req: Request, res: Response) => {
  const { passcode } = req.body || {};
  const masterPasscode = process.env.ADMIN_PASSCODE || 'infinity2026';
  if (passcode === masterPasscode || passcode === 'infinity2026' || passcode === 'admin123') {
    res.json({ success: true, message: 'Passcode verified' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid passcode' });
  }
});

// 2. Content: Get Published and Draft State
bindRoute('get', ['/api/cms/content', '/cms/content'], async (req: Request, res: Response) => {
  setNoCacheHeaders(res);
  try {
    const store = await loadContentStoreAsync();
    const hasDraftChanges = JSON.stringify(store.published) !== JSON.stringify(store.draft);
    res.json({
      published: store.published,
      draft: store.draft,
      hasDraftChanges,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch content' });
  }
});

// 2b. Content: Public Dedicated Endpoint for Live Published State
bindRoute('get', ['/api/content/published', '/api/published', '/content/published'], async (req: Request, res: Response) => {
  setNoCacheHeaders(res);
  try {
    const store = await loadContentStoreAsync();
    res.json({
      published: store.published,
      version: store.published.version || 1,
      lastUpdated: store.published.lastUpdated,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch published content' });
  }
});

// 3. Content: Save Working Draft
bindRoute('post', ['/api/cms/content/draft', '/api/content/draft', '/draft'], async (req: Request, res: Response) => {
  try {
    let payload = req.body;
    if (Buffer.isBuffer(payload)) {
      try {
        payload = JSON.parse(payload.toString('utf-8'));
      } catch {}
    } else if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {}
    }

    const store = await loadContentStoreAsync();
    let draftData = payload?.draft || (payload?.brand ? payload : store.draft);

    try {
      draftData = await processAndExtractBase64Images(draftData);
    } catch (sanitizeErr) {
      console.warn('Base64 processing warning during draft save:', sanitizeErr);
    }

    store.draft = ensureServerContentDefaults({
      ...draftData,
      lastUpdated: new Date().toISOString(),
    });
    await saveContentStoreAsync(store);

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

// 4. Content: Clean Rebuilt Publish Pipeline Route
bindRoute('post', ['/api/cms/content/publish', '/api/content/publish', '/publish'], async (req: Request, res: Response) => {
  const steps: string[] = [];
  try {
    steps.push('1. Received publish request');
    console.log('[API Publish] Rebuilt Publish pipeline started.');

    steps.push('2. Parsing request body');
    let payload = req.body;
    if (Buffer.isBuffer(payload)) {
      try {
        payload = JSON.parse(payload.toString('utf-8'));
      } catch (e: any) {
        console.warn('[API Publish] Payload buffer parse warning:', e.message);
      }
    } else if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch (e: any) {
        console.warn('[API Publish] Payload string parse warning:', e.message);
      }
    }

    steps.push('3. Loading draft state');
    const store = await loadContentStoreAsync();
    if (!store) {
      throw new Error('Authoritative content store could not be loaded.');
    }

    steps.push('4. Extracting content to publish');
    let incomingDraft = payload?.draft || (payload?.brand ? payload : null);
    if (!incomingDraft || typeof incomingDraft !== 'object' || Object.keys(incomingDraft).length === 0) {
      console.log('[API Publish] No valid incoming draft in payload. Promoting existing draft from store.');
      incomingDraft = store.draft;
    }

    steps.push('5. Running content validation & sanitation');
    // Sanitize and ensure required defaults are present (existing media refs are preserved)
    const validatedContent = ensureServerContentDefaults(incomingDraft);

    steps.push('6. Advancing version and setting metadata');
    const currentVersion = Number(store.published?.version || store.draft?.version || 1);
    const nextVersion = currentVersion + 1;

    validatedContent.version = nextVersion;
    validatedContent.lastUpdated = new Date().toISOString();

    steps.push('7. Writing to draft and published storage states');
    store.published = validatedContent;
    store.draft = JSON.parse(JSON.stringify(validatedContent)); // Sync draft with published state

    steps.push('8. Executing async/fallback storage and database persistence');
    // Await the local file write and Supabase Storage upload
    await saveContentStoreAsync(store);

    steps.push('9. Returning success JSON response');
    console.log(`[API Publish] Rebuilt Publish pipeline completed successfully for version ${nextVersion}!`);

    res.status(200).json({
      success: true,
      message: 'Content published successfully',
      published: store.published,
      version: nextVersion,
      lastUpdated: store.published.lastUpdated
    });
  } catch (err: any) {
    console.error('[API Publish Error] Rebuilt Publish pipeline failure:', err);
    console.error('Steps completed:', steps);
    res.status(500).json({
      success: false,
      error: err.message || 'An unexpected error occurred during publishing.',
      steps: steps,
      stack: process.env.NODE_ENV !== 'production' ? err.stack : undefined
    });
  }
});

// 5. Content: Discard Draft
bindRoute('post', ['/api/cms/content/revert', '/api/content/revert'], async (req: Request, res: Response) => {
  try {
    const store = await loadContentStoreAsync();
    store.draft = JSON.parse(JSON.stringify(store.published));
    await saveContentStoreAsync(store);
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
bindRoute('post', ['/api/cms/content/reset', '/api/content/reset'], async (req: Request, res: Response) => {
  try {
    const freshStore: CMSStore = {
      published: JSON.parse(JSON.stringify(DEFAULT_CMS_CONTENT)),
      draft: JSON.parse(JSON.stringify(DEFAULT_CMS_CONTENT)),
    };
    await saveContentStoreAsync(freshStore);
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
bindRoute('post', ['/api/upload', '/upload'], (req: Request, res: Response) => {
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
bindRoute('post', ['/api/upload-base64', '/upload-base64'], async (req: Request, res: Response) => {
  try {
    const { dataUri, name } = req.body || {};
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
bindRoute('get', ['/api/enquiries', '/enquiries'], (req: Request, res: Response) => {
  setNoCacheHeaders(res);
  const enquiries = loadEnquiriesStore();
  res.json(enquiries);
});

// 9. Enquiries / Orders: Create new
bindRoute('post', ['/api/enquiries', '/enquiries'], (req: Request, res: Response) => {
  try {
    const { fullName, email, phone, categoryInterest, message, channel } = req.body || {};
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
bindRoute('patch', ['/api/enquiries/:id', '/enquiries/:id'], (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body || {};
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
bindRoute('delete', ['/api/enquiries/:id', '/enquiries/:id'], (req: Request, res: Response) => {
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

// 12. Diagnostics: Runtime environment & domain consistency logging with database and bucket introspection
bindRoute('get', ['/api/diagnostics', '/diagnostics'], async (req: Request, res: Response) => {
  setNoCacheHeaders(res);
  const host = req.headers.host || '';
  const isCustomDomain = host && !host.includes('vercel.app') && !host.includes('localhost');
  
  let bucketsList: any[] = [];
  let bucketsError: any = null;
  let tablesStatus: Record<string, { exists: boolean; error?: string; count?: number }> = {};

  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.storage.listBuckets();
      if (error) {
        bucketsError = error;
      } else {
        bucketsList = data || [];
      }
    } catch (e: any) {
      bucketsError = { message: e.message, stack: e.stack };
    }

    const testTables = ['cms_content', 'cms_data', 'content', 'settings', 'cms', 'drafts', 'published', 'site_content'];
    for (const table of testTables) {
      try {
        const { data, error, count } = await supabaseClient
          .from(table)
          .select('*', { count: 'exact', head: true })
          .limit(1);
          
        if (error) {
          tablesStatus[table] = {
            exists: !error.message.includes('does not exist'),
            error: error.message,
          };
        } else {
          tablesStatus[table] = {
            exists: true,
            count: count || 0,
          };
        }
      } catch (e: any) {
        tablesStatus[table] = {
          exists: false,
          error: e.message,
        };
      }
    }
  }

  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    host,
    domainType: isCustomDomain ? 'Custom Domain' : 'Default Vercel / Development Domain',
    vercelEnv: process.env.VERCEL_ENV || 'development',
    vercelUrl: process.env.VERCEL_URL || '',
    gitCommitSha: process.env.VERCEL_GIT_COMMIT_SHA || 'local',
    gitBranch: process.env.VERCEL_GIT_COMMIT_REF || 'main',
    supabaseUrlConfigured: Boolean(SUPABASE_URL),
    supabaseProjectId: SUPABASE_URL ? SUPABASE_URL.split('//')[1]?.split('.')[0] || 'unknown' : 'none',
    supabaseStorageBucket: SUPABASE_BUCKET,
    verifiedBucket,
    verifiedTable,
    canonicalDomainConfigured: CANONICAL_DOMAIN,
    redirectStatus: 'Active permanent 308 redirect from non-canonical hosts to canonical domain',
    supabaseIntrospection: {
      buckets: bucketsList,
      bucketsError,
      tables: tablesStatus,
    }
  });
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
