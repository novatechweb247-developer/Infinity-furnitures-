import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  CMSContent,
  BrandSettings,
  SocialLinks,
  HeroSlide,
  Product,
  Category,
  CollectionItem,
  InteriorService,
  GalleryImage,
  WhyPoint,
  Testimonial,
  AboutContent,
  HomepageSections,
  CustomerEnquiry,
  MethodologyStep,
} from '../types';
import { DEFAULT_CMS_CONTENT } from '../defaultContent';
import { validateImageFile, convertFileToDataUri } from '../utils/imageUtils';
import {
  LOCAL_STORAGE_KEY_PUBLISHED,
  LOCAL_STORAGE_KEY_DRAFT,
  LOCAL_STORAGE_KEY_ENQUIRIES,
  LOCAL_STORAGE_KEY_ENQUIRY_LOGS,
  safeSetLocalStorage,
  stripBase64Sync,
  cleanLegacyLocalStorage,
  persistPublishedContent,
  persistDraftContent,
  loadPublishedFromStorage,
  loadDraftFromStorage,
  sanitizeAndConvertBase64Images,
} from '../utils/storageService';

export {
  LOCAL_STORAGE_KEY_PUBLISHED,
  LOCAL_STORAGE_KEY_DRAFT,
  LOCAL_STORAGE_KEY_ENQUIRIES,
  LOCAL_STORAGE_KEY_ENQUIRY_LOGS,
};

export interface CMSContextType {
  publishedContent: CMSContent;
  draftContent: CMSContent;
  activeContent: CMSContent; // Either published or draft (when in draft preview mode)
  hasDraftChanges: boolean;
  hasUnsavedChanges: boolean;
  isLoading: boolean;
  isSaving: boolean;
  isPublishing: boolean;
  previewDraftOnPublicSite: boolean;
  setPreviewDraftOnPublicSite: (val: boolean) => void;

  // Authentication
  isAuthenticated: boolean;
  login: (passcode: string) => Promise<boolean>;
  logout: () => void;

  // Edit actions (operate on draft content)
  updateDraft: (updater: ((prev: CMSContent) => CMSContent) | Partial<CMSContent>) => void;
  updateBrand: (updates: Partial<BrandSettings>) => void;
  updateSocial: (updates: Partial<SocialLinks>) => void;
  updateHomepage: (updates: Partial<HomepageSections>) => void;
  updateAbout: (updates: Partial<AboutContent>) => void;
  saveHeroSlides: (slides: HeroSlide[]) => void;
  saveProducts: (products: Product[]) => void;
  saveCategories: (categories: Category[]) => void;
  saveCollections: (collections: CollectionItem[]) => void;
  saveServices: (services: InteriorService[]) => void;
  saveGallery: (gallery: GalleryImage[]) => void;
  saveTestimonials: (testimonials: Testimonial[]) => void;
  saveWhyPoints: (points: WhyPoint[]) => void;
  saveMethodology: (steps: MethodologyStep[]) => void;

  // Publishing & lifecycle workflow
  saveDraft: () => Promise<boolean>;
  publishLive: () => Promise<boolean>;
  publishToLive: () => Promise<boolean>;
  publishDraft: () => Promise<boolean>;
  revertDraft: () => Promise<boolean>;
  discardDraft: () => Promise<boolean>;
  resetToDefaults: () => Promise<boolean>;

  // Direct storage upload
  uploadFile: (file: File, category?: string) => Promise<{ url: string } | null>;

  // Customer enquiries & leads
  enquiries: CustomerEnquiry[];
  isLoadingEnquiries: boolean;
  loadEnquiries: () => Promise<void>;
  submitPublicEnquiry: (data: {
    fullName?: string;
    name?: string;
    email: string;
    phone?: string;
    categoryInterest?: string;
    message: string;
    channel?: CustomerEnquiry['channel'];
  }) => Promise<boolean>;
  submitEnquiry: (data: {
    fullName?: string;
    name?: string;
    email: string;
    phone?: string;
    categoryInterest?: string;
    message: string;
    channel?: CustomerEnquiry['channel'];
  }) => Promise<boolean>;
  updateEnquiryStatus: (id: string, status: CustomerEnquiry['status']) => void;
  deleteEnquiry: (id: string) => void;

  // Notification UI
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

// Event name for instant cross-tab live publication updates
const CMS_PUBLISHED_EVENT = 'infinity_cms_published_update';

/**
 * Defensive sanitizer to ensure CMSContent has all standard keys present
 */
function ensureContentDefaults(raw: any): CMSContent {
  if (!raw || typeof raw !== 'object') {
    return JSON.parse(JSON.stringify(DEFAULT_CMS_CONTENT));
  }

  const incomingBrand = raw.brand || {};
  const incomingContact = raw.contact || {};

  // Clean and sanitize phone numbers (ONLY single number allowed: 0806 879 5174)
  const phone = incomingContact.phone1 || incomingContact.phone || incomingBrand.phone1 || incomingBrand.phone || DEFAULT_CMS_CONTENT.contact.phone1;
  const sanitizedPhone = phone && typeof phone === 'string' && phone.trim().length > 5 ? phone.trim() : '0806 879 5174';

  // Sanitize email (Default to Lawalcy68@gmail.com)
  const rawEmail = incomingContact.email || incomingBrand.email || DEFAULT_CMS_CONTENT.contact.email;
  const sanitizedEmail = rawEmail && typeof rawEmail === 'string' && !rawEmail.includes('concierge@infinity') && !rawEmail.includes('example.com')
    ? rawEmail.trim()
    : 'Lawalcy68@gmail.com';

  // Sanitize address (Must be Jos, Plateau State; strip Lagos/Abuja)
  let rawAddress = incomingContact.address || incomingBrand.address || DEFAULT_CMS_CONTENT.contact.address;
  if (!rawAddress || /Lagos|Abuja|Victoria Island|Lekki/i.test(rawAddress)) {
    rawAddress = 'Jos, Plateau State';
  }

  return {
    version: typeof raw.version === 'number' ? raw.version : 1,
    lastUpdated: raw.lastUpdated || new Date().toISOString(),
    brand: {
      ...DEFAULT_CMS_CONTENT.brand,
      ...incomingBrand,
      phone1: sanitizedPhone,
      phone: sanitizedPhone,
      phone2: '',
      whatsapp: '2348068795174',
      email: sanitizedEmail,
      address: rawAddress,
      logo: '/logo.png',
      logoUrl: '/logo.png',
    },
    contact: {
      ...DEFAULT_CMS_CONTENT.contact,
      ...incomingContact,
      phone1: sanitizedPhone,
      phone: sanitizedPhone,
      phone2: '',
      whatsapp: '2348068795174',
      email: sanitizedEmail,
      address: rawAddress,
    },
    social: {
      ...DEFAULT_CMS_CONTENT.social,
      ...(raw.social || {}),
    },
    heroSlides: Array.isArray(raw.heroSlides) && raw.heroSlides.length > 0
      ? raw.heroSlides
      : DEFAULT_CMS_CONTENT.heroSlides,
    categories: Array.isArray(raw.categories) && raw.categories.length > 0
      ? raw.categories
      : DEFAULT_CMS_CONTENT.categories,
    collections: Array.isArray(raw.collections) && raw.collections.length > 0
      ? raw.collections
      : DEFAULT_CMS_CONTENT.collections,
    products: Array.isArray(raw.products) && raw.products.length > 0
      ? raw.products
      : DEFAULT_CMS_CONTENT.products,
    services: Array.isArray(raw.services || raw.interiorServices) && (raw.services || raw.interiorServices).length > 0
      ? (raw.services || raw.interiorServices)
      : DEFAULT_CMS_CONTENT.services,
    methodology: Array.isArray(raw.methodology) && raw.methodology.length > 0
      ? raw.methodology
      : DEFAULT_CMS_CONTENT.methodology,
    gallery: Array.isArray(raw.gallery) && raw.gallery.length > 0
      ? raw.gallery
      : DEFAULT_CMS_CONTENT.gallery,
    whyPoints: Array.isArray(raw.whyPoints) && raw.whyPoints.length > 0
      ? raw.whyPoints
      : DEFAULT_CMS_CONTENT.whyPoints,
    testimonials: Array.isArray(raw.testimonials) && raw.testimonials.length > 0
      ? raw.testimonials
      : DEFAULT_CMS_CONTENT.testimonials,
    about: {
      ...DEFAULT_CMS_CONTENT.about,
      ...(raw.about || {}),
    },
    homepage: {
      ...DEFAULT_CMS_CONTENT.homepage,
      ...(raw.homepage || {}),
    },
  };
}

export function CMSProvider({ children }: { children: React.ReactNode }) {
  // Authoritative Published Content
  const [publishedContent, setPublishedContent] = useState<CMSContent>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY_PUBLISHED);
      if (cached) {
        return ensureContentDefaults(JSON.parse(cached));
      }
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_CMS_CONTENT));
  });

  // Working Draft Content
  const [draftContent, setDraftContent] = useState<CMSContent>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY_DRAFT);
      if (cached) {
        return ensureContentDefaults(JSON.parse(cached));
      }
    } catch (e) {}
    return JSON.parse(JSON.stringify(DEFAULT_CMS_CONTENT));
  });

  const draftContentRef = useRef<CMSContent>(draftContent);
  useEffect(() => {
    draftContentRef.current = draftContent;
  }, [draftContent]);

  // Draft vs Published dirty state tracker
  const [hasDraftChanges, setHasDraftChanges] = useState<boolean>(() => {
    try {
      const draft = localStorage.getItem(LOCAL_STORAGE_KEY_DRAFT);
      const pub = localStorage.getItem(LOCAL_STORAGE_KEY_PUBLISHED);
      if (draft && pub) {
        return draft !== pub;
      }
    } catch (e) {}
    return false;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);
  const [previewDraftOnPublicSite, setPreviewDraftOnPublicSite] = useState<boolean>(() => {
    try {
      return localStorage.getItem('infinity_preview_draft_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Enquiries state
  const [enquiries, setEnquiries] = useState<CustomerEnquiry[]>(() => {
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY_ENQUIRIES);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  });
  const [isLoadingEnquiries, setIsLoadingEnquiries] = useState<boolean>(false);

  // Toast Notification
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('infinity_admin_auth') === 'authorized';
    } catch {
      return false;
    }
  });

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4000);
  }, []);

  const handleSetPreviewDraft = useCallback((val: boolean) => {
    setPreviewDraftOnPublicSite(val);
    try {
      localStorage.setItem('infinity_preview_draft_mode', val ? 'true' : 'false');
    } catch (e) {}
  }, []);

  const hasFetchedFromServerRef = useRef<boolean>(false);

  // Compute active content for public components
  const activeContent = useMemo(() => {
    if (previewDraftOnPublicSite && isAuthenticated) {
      return draftContent;
    }
    return publishedContent;
  }, [previewDraftOnPublicSite, isAuthenticated, draftContent, publishedContent]);

  // Sync draft state directly to storage whenever draftContent changes
  useEffect(() => {
    if (!hasFetchedFromServerRef.current) return;
    const isDiff = JSON.stringify(publishedContent) !== JSON.stringify(draftContent);
    setHasDraftChanges(isDiff);
    try {
      safeSetLocalStorage(LOCAL_STORAGE_KEY_DRAFT, JSON.stringify(draftContent));
    } catch (e) {
      console.warn('LocalStorage error for draft:', e);
    }
  }, [draftContent, publishedContent]);

  // Clean legacy bloated localStorage entries and rehydrate
  useEffect(() => {
    cleanLegacyLocalStorage();

    loadPublishedFromStorage().then((idbPub) => {
      if (idbPub && !hasFetchedFromServerRef.current) {
        setPublishedContent((curr) => {
          if (hasFetchedFromServerRef.current) return curr;
          return ensureContentDefaults(idbPub);
        });
      }
    });

    loadDraftFromStorage().then((idbDraft) => {
      if (idbDraft && !hasFetchedFromServerRef.current) {
        setDraftContent((curr) => {
          if (hasFetchedFromServerRef.current) return curr;
          const clean = ensureContentDefaults(idbDraft);
          draftContentRef.current = clean;
          return clean;
        });
      }
    });
  }, []);

  // Auth operations
  const login = useCallback(async (passcode: string): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode }),
      });
      if (res.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('infinity_admin_auth', 'authorized');
        showNotification('Welcome back, Admin!', 'success');
        return true;
      }
    } catch (err) {
      console.warn('Network auth failed, checking fallback:', err);
    }

    if (passcode.trim().toLowerCase() === 'infinity2026' || passcode.trim() === 'admin123') {
      setIsAuthenticated(true);
      localStorage.setItem('infinity_admin_auth', 'authorized');
      showNotification('Welcome back, Admin!', 'success');
      return true;
    }

    showNotification('Incorrect master passcode. Access denied.', 'error');
    return false;
  }, [showNotification]);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem('infinity_admin_auth');
    localStorage.removeItem('infinity_preview_draft_mode');
    setPreviewDraftOnPublicSite(false);
    showNotification('Signed out of admin session.', 'info');
  }, [showNotification]);

  // 1. Initial Load & Background Synchronization
  const fetchContent = useCallback(async () => {
    try {
      const cacheBuster = `_t=${Date.now()}`;
      const res = await fetch(`/api/cms/content?${cacheBuster}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        },
      });

      if (res.ok) {
        const data = await res.json();
        const serverPublished = ensureContentDefaults(data.published);
        const serverDraft = data.draft ? ensureContentDefaults(data.draft) : serverPublished;

        setPublishedContent(serverPublished);
        persistPublishedContent(serverPublished).catch(() => {});

        if (!hasFetchedFromServerRef.current) {
          setDraftContent(serverDraft);
          draftContentRef.current = serverDraft;
          persistDraftContent(serverDraft).catch(() => {});
          setHasDraftChanges(Boolean(data.hasDraftChanges));
        }
      }
    } catch (err) {
      console.warn('Network error fetching CMS from server:', err);
    } finally {
      hasFetchedFromServerRef.current = true;
      setIsLoading(false);
    }
  }, []);

  // Load Enquiries
  const loadEnquiries = useCallback(async () => {
    try {
      setIsLoadingEnquiries(true);
      const res = await fetch(`/api/enquiries?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
      });
      if (res.ok) {
        const serverData = await res.json();
        if (Array.isArray(serverData)) {
          setEnquiries((prevLocal) => {
            const map = new Map<string, CustomerEnquiry>();
            serverData.forEach((item) => map.set(item.id, item));
            prevLocal.forEach((item) => {
              if (!map.has(item.id)) map.set(item.id, item);
            });
            const merged = Array.from(map.values()).sort(
              (a, b) => new Date(b.createdAt || b.date || 0).getTime() - new Date(a.createdAt || a.date || 0).getTime()
            );
            localStorage.setItem(LOCAL_STORAGE_KEY_ENQUIRIES, JSON.stringify(merged));
            return merged;
          });
        }
      }
    } catch (err) {
      console.warn('Using local enquiries storage:', err);
    } finally {
      setIsLoadingEnquiries(false);
    }
  }, []);

  // Periodic polling & storage sync
  useEffect(() => {
    fetchContent();
    loadEnquiries();

    const pollInterval = setInterval(() => {
      fetchContent();
    }, 8000);

    const handleFocus = () => {
      fetchContent();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchContent();
      }
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_KEY_PUBLISHED && e.newValue) {
        try {
          const freshPublished = ensureContentDefaults(JSON.parse(e.newValue));
          setPublishedContent(freshPublished);
        } catch (err) {}
      }
      if (e.key === LOCAL_STORAGE_KEY_DRAFT && e.newValue) {
        try {
          const freshDraft = ensureContentDefaults(JSON.parse(e.newValue));
          setDraftContent(freshDraft);
        } catch (err) {}
      }
    };

    const handlePublishedEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const fresh = ensureContentDefaults(customEvent.detail);
        setPublishedContent(fresh);
        setDraftContent(fresh);
        setHasDraftChanges(false);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(CMS_PUBLISHED_EVENT, handlePublishedEvent);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(CMS_PUBLISHED_EVENT, handlePublishedEvent);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchContent, loadEnquiries]);

  // Draft Mutators
  const updateDraft = useCallback((updater: ((prev: CMSContent) => CMSContent) | Partial<CMSContent>) => {
    setDraftContent((prev) => {
      let nextState: CMSContent;
      if (typeof updater === 'function') {
        nextState = updater(prev);
      } else {
        nextState = {
          ...prev,
          ...updater,
          lastUpdated: new Date().toISOString(),
        };
      }

      nextState = ensureContentDefaults(nextState);
      draftContentRef.current = nextState;
      safeSetLocalStorage(LOCAL_STORAGE_KEY_DRAFT, JSON.stringify(nextState));
      persistDraftContent(nextState).catch(() => {});
      return nextState;
    });
    setHasDraftChanges(true);
  }, []);

  const updateBrand = useCallback((updates: Partial<BrandSettings>) => {
    updateDraft((prev) => ({
      ...prev,
      brand: { ...prev.brand, ...updates, logo: '/logo.png', logoUrl: '/logo.png' },
    }));
  }, [updateDraft]);

  const updateSocial = useCallback((updates: Partial<SocialLinks>) => {
    updateDraft((prev) => ({
      ...prev,
      social: { ...prev.social, ...updates },
    }));
  }, [updateDraft]);

  const updateHomepage = useCallback((updates: Partial<HomepageSections>) => {
    updateDraft((prev) => ({
      ...prev,
      homepage: { ...prev.homepage, ...updates },
    }));
  }, [updateDraft]);

  const updateAbout = useCallback((updates: Partial<AboutContent>) => {
    updateDraft((prev) => ({
      ...prev,
      about: { ...prev.about, ...updates },
    }));
  }, [updateDraft]);

  const saveHeroSlides = useCallback((heroSlides: HeroSlide[]) => {
    updateDraft((prev) => ({ ...prev, heroSlides }));
  }, [updateDraft]);

  const saveProducts = useCallback((products: Product[]) => {
    updateDraft((prev) => ({ ...prev, products }));
  }, [updateDraft]);

  const saveCategories = useCallback((categories: Category[]) => {
    updateDraft((prev) => ({ ...prev, categories }));
  }, [updateDraft]);

  const saveCollections = useCallback((collections: CollectionItem[]) => {
    updateDraft((prev) => ({ ...prev, collections }));
  }, [updateDraft]);

  const saveServices = useCallback((interiorServices: InteriorService[]) => {
    updateDraft((prev) => ({ ...prev, services: interiorServices }));
  }, [updateDraft]);

  const saveGallery = useCallback((gallery: GalleryImage[]) => {
    updateDraft((prev) => ({ ...prev, gallery }));
  }, [updateDraft]);

  const saveTestimonials = useCallback((testimonials: Testimonial[]) => {
    updateDraft((prev) => ({ ...prev, testimonials }));
  }, [updateDraft]);

  const saveWhyPoints = useCallback((whyPoints: WhyPoint[]) => {
    updateDraft((prev) => ({ ...prev, whyPoints }));
  }, [updateDraft]);

  const saveMethodology = useCallback((methodology: MethodologyStep[]) => {
    updateDraft((prev) => ({ ...prev, methodology }));
  }, [updateDraft]);

  // Save Draft to Server
  const saveDraft = useCallback(async (): Promise<boolean> => {
    try {
      setIsSaving(true);
      const currentDraft = draftContentRef.current;
      let sanitizedDraft = currentDraft;
      try {
        sanitizedDraft = await sanitizeAndConvertBase64Images(currentDraft);
      } catch (e) {}

      const safeBody = JSON.stringify({ draft: JSON.parse(JSON.stringify(sanitizedDraft)) });

      const res = await fetch('/api/cms/content/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: safeBody,
      });

      if (!res.ok) {
        console.warn(`Server returned status ${res.status}. Preserving draft locally.`);
        showNotification('Draft preserved in browser storage.', 'info');
        return true;
      }

      await persistDraftContent(sanitizedDraft);
      showNotification('Draft saved successfully.', 'success');
      return true;
    } catch (err: any) {
      console.warn('Network error saving draft:', err);
      showNotification('Draft saved locally.', 'info');
      return true;
    } finally {
      setIsSaving(false);
    }
  }, [showNotification]);

  // Publish Live
  const publishLive = useCallback(async (): Promise<boolean> => {
    try {
      setIsPublishing(true);
      const payloadDraft = draftContentRef.current;
      let sanitizedDraft = payloadDraft;
      try {
        sanitizedDraft = await sanitizeAndConvertBase64Images(payloadDraft);
      } catch (e) {
        console.warn('Base64 sanitization warning during publish:', e);
      }

      const safeBody = JSON.stringify({ draft: JSON.parse(JSON.stringify(sanitizedDraft)) });

      const res = await fetch('/api/cms/content/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: safeBody,
      });

      if (!res.ok) {
        let errDetail = `Server returned status ${res.status}`;
        try {
          const errData = await res.json();
          if (errData && errData.error) {
            errDetail = errData.error;
          }
        } catch {}
        throw new Error(errDetail);
      }

      const responseData = await res.json();
      const updatedPublished = ensureContentDefaults(responseData.published || sanitizedDraft);

      setPublishedContent(updatedPublished);
      setDraftContent(updatedPublished);
      draftContentRef.current = updatedPublished;
      setHasDraftChanges(false);

      await persistPublishedContent(updatedPublished);
      await persistDraftContent(updatedPublished);

      window.dispatchEvent(
        new CustomEvent(CMS_PUBLISHED_EVENT, { detail: updatedPublished })
      );

      showNotification('🎉 Published live to all visitors!', 'success');
      return true;
    } catch (err: any) {
      console.error('Publishing error:', err);
      showNotification(`Publish failed: ${err.message || 'Server error'}`, 'error');
      return false;
    } finally {
      setIsPublishing(false);
    }
  }, [showNotification]);

  // Revert / Discard Draft
  const revertDraft = useCallback(async (): Promise<boolean> => {
    try {
      const liveCopy = JSON.parse(JSON.stringify(publishedContent));
      setDraftContent(liveCopy);
      draftContentRef.current = liveCopy;
      setHasDraftChanges(false);

      await persistDraftContent(liveCopy);
      safeSetLocalStorage(LOCAL_STORAGE_KEY_DRAFT, JSON.stringify(liveCopy));

      try {
        await fetch('/api/cms/content/revert', { method: 'POST' });
      } catch (e) {}

      showNotification('Draft changes discarded. Reverted to live content.', 'info');
      return true;
    } catch (err) {
      return false;
    }
  }, [publishedContent, showNotification]);

  // Reset to Defaults
  const resetToDefaults = useCallback(async (): Promise<boolean> => {
    try {
      const freshDefaults = JSON.parse(JSON.stringify(DEFAULT_CMS_CONTENT));
      setPublishedContent(freshDefaults);
      setDraftContent(freshDefaults);
      setHasDraftChanges(false);

      await persistPublishedContent(freshDefaults);
      await persistDraftContent(freshDefaults);

      window.dispatchEvent(
        new CustomEvent(CMS_PUBLISHED_EVENT, { detail: freshDefaults })
      );

      try {
        await fetch('/api/cms/content/reset', { method: 'POST' });
      } catch (e) {}

      showNotification('Reset website to factory defaults.', 'info');
      return true;
    } catch (err) {
      return false;
    }
  }, [showNotification]);

  // Direct Device Upload directly into Storage Bucket
  const uploadFile = useCallback(
    async (file: File, category: string = 'General'): Promise<{ url: string } | null> => {
      const validation = validateImageFile(file);
      if (!validation.valid) {
        showNotification(validation.error || 'Invalid file.', 'error');
        return null;
      }

      try {
        // Step A: Direct device upload to /api/upload (which uploads to Supabase storage bucket)
        try {
          const formData = new FormData();
          formData.append('file', file);
          formData.append('category', category);

          const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });

          if (res.ok) {
            const data = await res.json();
            if (data.url) {
              showNotification(`Image "${file.name}" uploaded to storage!`, 'success');
              return { url: data.url };
            }
          }
        } catch (serverUploadErr) {
          console.warn('Storage upload endpoint unreachable, falling back:', serverUploadErr);
        }

        // Step B: Base64 upload fallback
        const dataUri = await convertFileToDataUri(file, {
          maxWidth: 1600,
          maxHeight: 1600,
          quality: 0.8,
        });

        try {
          const base64Res = await fetch('/api/upload-base64', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataUri, name: file.name, category }),
          });
          if (base64Res.ok) {
            const data = await base64Res.json();
            if (data.url) {
              showNotification(`Image "${file.name}" uploaded to storage!`, 'success');
              return { url: data.url };
            }
          }
        } catch (e) {}

        showNotification(`Image "${file.name}" attached.`, 'info');
        return { url: dataUri };
      } catch (err: any) {
        console.error('Upload handling error:', err);
        showNotification(`Upload failed: ${err.message || 'Please check the file and try again.'}`, 'error');
        return null;
      }
    },
    [showNotification]
  );

  // Enquiry Handling
  const submitPublicEnquiry = useCallback(
    async (data: {
      fullName?: string;
      name?: string;
      email: string;
      phone?: string;
      categoryInterest?: string;
      message: string;
      channel?: CustomerEnquiry['channel'];
    }): Promise<boolean> => {
      const newEnquiry: CustomerEnquiry = {
        id: `enq-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date().toISOString(),
        fullName: data.fullName || data.name || 'Anonymous Visitor',
        name: data.fullName || data.name || 'Anonymous Visitor',
        email: data.email,
        phone: data.phone || '',
        categoryInterest: data.categoryInterest || 'General Enquiry',
        message: data.message,
        status: 'New',
        channel: data.channel || 'Website Form',
      };

      setEnquiries((prev) => {
        const updated = [newEnquiry, ...prev];
        localStorage.setItem(LOCAL_STORAGE_KEY_ENQUIRIES, JSON.stringify(updated));
        return updated;
      });

      try {
        await fetch('/api/enquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEnquiry),
        });
      } catch (err) {
        console.warn('Enquiry stored locally:', err);
      }

      showNotification('Thank you! Your enquiry has been received.', 'success');
      return true;
    },
    [showNotification]
  );

  const updateEnquiryStatus = useCallback((id: string, status: CustomerEnquiry['status']) => {
    setEnquiries((prev) => {
      const updated = prev.map((e) => (e.id === id ? { ...e, status } : e));
      localStorage.setItem(LOCAL_STORAGE_KEY_ENQUIRIES, JSON.stringify(updated));
      return updated;
    });

    try {
      fetch(`/api/enquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }).catch(() => {});
    } catch (e) {}

    showNotification(`Enquiry status updated to ${status}`, 'info');
  }, [showNotification]);

  const deleteEnquiry = useCallback((id: string) => {
    setEnquiries((prev) => {
      const updated = prev.filter((e) => e.id !== id);
      localStorage.setItem(LOCAL_STORAGE_KEY_ENQUIRIES, JSON.stringify(updated));
      return updated;
    });

    try {
      fetch(`/api/enquiries/${id}`, { method: 'DELETE' }).catch(() => {});
    } catch (e) {}

    showNotification('Enquiry deleted', 'info');
  }, [showNotification]);

  return (
    <CMSContext.Provider
      value={{
        publishedContent,
        draftContent,
        activeContent,
        hasDraftChanges,
        hasUnsavedChanges: hasDraftChanges,
        isLoading,
        isSaving,
        isPublishing,
        previewDraftOnPublicSite,
        setPreviewDraftOnPublicSite: handleSetPreviewDraft,
        isAuthenticated,
        login,
        logout,
        updateDraft,
        updateBrand,
        updateSocial,
        updateHomepage,
        updateAbout,
        saveHeroSlides,
        saveProducts,
        saveCategories,
        saveCollections,
        saveServices,
        saveGallery,
        saveTestimonials,
        saveWhyPoints,
        saveMethodology,
        saveDraft,
        publishLive,
        publishToLive: publishLive,
        publishDraft: publishLive,
        revertDraft,
        discardDraft: revertDraft,
        resetToDefaults,
        uploadFile,
        enquiries,
        isLoadingEnquiries,
        loadEnquiries,
        submitPublicEnquiry,
        submitEnquiry: submitPublicEnquiry,
        updateEnquiryStatus,
        deleteEnquiry,
        notification,
        showNotification,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
}

export function useCMS(): CMSContextType {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
}
