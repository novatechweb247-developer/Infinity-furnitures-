import { get, set } from 'idb-keyval';
import { CMSContent } from '../types';

export const LOCAL_STORAGE_KEY_PUBLISHED = 'infinity_cms_published';
export const LOCAL_STORAGE_KEY_DRAFT = 'infinity_cms_draft';
export const LOCAL_STORAGE_KEY_ENQUIRIES = 'infinity_enquiries';
export const LOCAL_STORAGE_KEY_ENQUIRY_LOGS = 'infinity_enquiry_events';

/**
 * Checks whether a given string is a raw data URI or base64 payload.
 */
export function isBase64DataUri(val: any): boolean {
  if (typeof val !== 'string') return false;
  return val.startsWith('data:image/') || val.startsWith('data:application/') || (val.length > 500 && val.includes(';base64,'));
}

/**
 * Uploads a base64 Data URI directly to the server / Supabase storage bucket so it becomes a permanent storage URL.
 */
export async function uploadBase64ToServer(dataUri: string, name = 'uploaded_asset', category = 'Uploads'): Promise<string | null> {
  try {
    const res = await fetch('/api/upload-base64', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dataUri, name, category }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.url) return data.url;
    }
  } catch (e) {
    console.warn('Could not upload base64 to server/storage bucket:', e);
  }
  return null;
}

/**
 * Recursively converts any embedded base64 images in a CMSContent object into permanent storage URLs.
 */
export async function sanitizeAndConvertBase64Images(content: CMSContent): Promise<CMSContent> {
  const clone: CMSContent = JSON.parse(JSON.stringify(content));

  async function processNode(node: any): Promise<any> {
    if (!node) return node;

    if (typeof node === 'string') {
      if (isBase64DataUri(node)) {
        const uploadedUrl = await uploadBase64ToServer(node, 'cms_asset');
        if (uploadedUrl) {
          return uploadedUrl;
        }
        return node;
      }
      return node;
    }

    if (Array.isArray(node)) {
      const results = [];
      for (const item of node) {
        results.push(await processNode(item));
      }
      return results;
    }

    if (typeof node === 'object') {
      const result: any = {};
      for (const key of Object.keys(node)) {
        result[key] = await processNode(node[key]);
      }
      return result;
    }

    return node;
  }

  return await processNode(clone);
}

/**
 * Strips raw binary buffers if present, while preserving all image URLs.
 */
export function stripBase64Sync<T>(obj: T): T {
  if (!obj) return obj;
  if (typeof obj === 'string') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return (obj as any[]).map((item) => stripBase64Sync(item)) as unknown as T;
  }
  if (typeof obj === 'object') {
    const result: any = {};
    for (const key of Object.keys(obj as any)) {
      if (key === 'rawFile' || key === 'buffer' || key === '_previewBlob') continue;
      result[key] = stripBase64Sync((obj as any)[key]);
    }
    return result;
  }
  return obj;
}

/**
 * Optimizes CMS Content payload to ensure required default fields exist without overwriting user images.
 */
export function optimizeCMSPayload(content: CMSContent): CMSContent {
  if (!content) return content;
  return {
    ...content,
    heroSlides: (content.heroSlides || []).map((s) => ({
      ...s,
      image: s.image || '',
    })),
    products: (content.products || []).map((p) => {
      const primary = p.primaryImage || p.image || (p.images && p.images[0]) || '';
      const images = (p.images && p.images.length > 0) ? p.images : (primary ? [primary] : []);
      return {
        ...p,
        images,
        image: primary,
        primaryImage: primary,
      };
    }),
    categories: (content.categories || []).map((c) => ({
      ...c,
      image: c.image || '',
    })),
    collections: (content.collections || []).map((col) => ({
      ...col,
      image: col.image || '',
    })),
    services: (content.services || (content as any).interiorServices || []).map((srv: any) => ({
      ...srv,
      image: srv.image || '',
    })),
    gallery: (content.gallery || []).map((g) => ({
      ...g,
      image: g.image || '',
    })),
  };
}

/**
 * Safely writes a key-value string to localStorage with automatic QuotaExceeded error recovery.
 */
export function safeSetLocalStorage(key: string, rawString: string): boolean {
  try {
    localStorage.setItem(key, rawString);
    return true;
  } catch (err: any) {
    const isQuotaError =
      err &&
      (err.name === 'QuotaExceededError' ||
        err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
        err.code === 22 ||
        err.code === 1014 ||
        err.number === -2147024882 ||
        err.message?.toLowerCase().includes('quota'));

    if (isQuotaError) {
      console.warn(`[safeSetLocalStorage] QuotaExceededError encountered on "${key}". Pruning non-essential storage...`);
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY_ENQUIRY_LOGS);
        localStorage.setItem(key, rawString);
        return true;
      } catch (retryErr) {
        console.warn(`[safeSetLocalStorage] Storage still full after pruning. IndexedDB holds authoritative master.`, retryErr);
        return false;
      }
    } else {
      console.warn(`[safeSetLocalStorage] Error setting "${key}":`, err);
      return false;
    }
  }
}

/**
 * Migrates legacy storage keys to current keys.
 */
export function cleanLegacyLocalStorage(): void {
  try {
    const legacyKeysMap: [string, string][] = [
      ['infinity_cms_published_v2', LOCAL_STORAGE_KEY_PUBLISHED],
      ['infinity_cms_draft_v2', LOCAL_STORAGE_KEY_DRAFT],
      ['infinity_enquiries_v2', LOCAL_STORAGE_KEY_ENQUIRIES],
    ];

    for (const [oldKey, newKey] of legacyKeysMap) {
      const val = localStorage.getItem(oldKey);
      if (val && !localStorage.getItem(newKey)) {
        localStorage.setItem(newKey, val);
      }
    }
  } catch (e) {
    console.warn('[cleanLegacyLocalStorage] Error during storage migration:', e);
  }
}

/**
 * Persists published content into IndexedDB (primary high-capacity driver)
 * and safely mirrors lightweight sanitized text metadata into localStorage.
 */
export async function persistPublishedContent(content: CMSContent): Promise<CMSContent> {
  const urlSanitized = await sanitizeAndConvertBase64Images(content);
  const optimized = optimizeCMSPayload(urlSanitized);

  try {
    await set(LOCAL_STORAGE_KEY_PUBLISHED, optimized);
  } catch (idbErr) {
    console.warn('[persistPublishedContent] IndexedDB write notice:', idbErr);
  }

  const jsonString = JSON.stringify(optimized);
  safeSetLocalStorage(LOCAL_STORAGE_KEY_PUBLISHED, jsonString);

  return optimized;
}

/**
 * Persists draft content into IndexedDB (primary high-capacity driver)
 * and mirrors lightweight sanitized metadata into localStorage.
 */
export async function persistDraftContent(content: CMSContent): Promise<CMSContent> {
  const urlSanitized = await sanitizeAndConvertBase64Images(content);
  const optimized = optimizeCMSPayload(urlSanitized);

  try {
    await set(LOCAL_STORAGE_KEY_DRAFT, optimized);
  } catch (idbErr) {
    console.warn('[persistDraftContent] IndexedDB write notice:', idbErr);
  }

  safeSetLocalStorage(LOCAL_STORAGE_KEY_DRAFT, JSON.stringify(optimized));

  return optimized;
}

/**
 * Asynchronously loads the authoritative published content, preferring IndexedDB
 * if available, with fallback to localStorage.
 */
export async function loadPublishedFromStorage(): Promise<CMSContent | null> {
  try {
    const idbData = await get<CMSContent>(LOCAL_STORAGE_KEY_PUBLISHED);
    if (idbData && typeof idbData === 'object') {
      return idbData;
    }
  } catch (e) {
    console.warn('[loadPublishedFromStorage] IndexedDB read error:', e);
  }

  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY_PUBLISHED);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn('[loadPublishedFromStorage] localStorage read error:', e);
  }

  return null;
}

/**
 * Asynchronously loads draft content from IndexedDB with fallback to localStorage.
 */
export async function loadDraftFromStorage(): Promise<CMSContent | null> {
  try {
    const idbData = await get<CMSContent>(LOCAL_STORAGE_KEY_DRAFT);
    if (idbData && typeof idbData === 'object') {
      return idbData;
    }
  } catch (e) {
    console.warn('[loadDraftFromStorage] IndexedDB read error:', e);
  }

  try {
    const cached = localStorage.getItem(LOCAL_STORAGE_KEY_DRAFT);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (e) {
    console.warn('[loadDraftFromStorage] localStorage read error:', e);
  }

  return null;
}
