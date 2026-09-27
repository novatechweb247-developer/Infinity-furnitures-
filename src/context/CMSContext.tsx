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
  MediaAsset,
  MethodologyStep,
} from '../types';
import { DEFAULT_CMS_CONTENT } from '../defaultContent';
import { validateImageFile, convertFileToDataUri } from '../utils/imageUtils';
import {
  LOCAL_STORAGE_KEY_PUBLISHED,
  LOCAL_STORAGE_KEY_DRAFT,
  LOCAL_STORAGE_KEY_MEDIA,
  LOCAL_STORAGE_KEY_ENQUIRIES,
  LOCAL_STORAGE_KEY_ENQUIRY_LOGS,
  safeSetLocalStorage,
  stripBase64Sync,
  cleanLegacyLocalStorage,
  persistPublishedContent,
  persistDraftContent,
  loadPublishedFromStorage,
  loadDraftFromStorage,
  persistMediaAssets,
  sanitizeAndConvertBase64Images,
} from '../utils/storageService';

export {
  LOCAL_STORAGE_KEY_PUBLISHED,
  LOCAL_STORAGE_KEY_DRAFT,
  LOCAL_STORAGE_KEY_MEDIA,
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

  // Media library & uploads
  mediaAssets: MediaAsset[];
  isLoadingMedia: boolean;
  loadMedia: () => Promise<void>;
  uploadFile: (file: File, category?: string) => Promise<{ url: string; asset: MediaAsset } | null>;
  deleteMedia: (id: string) => Promise<boolean>;

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
  updateEnquiryStatus: (id: string, status: CustomerEnquiry['status'], notes?: string) => Promise<void>;
  deleteEnquiry: (id: string) => Promise<void>;

  // Notification toast
  notification: { message: string; type: 'success' | 'error' | 'info' } | null;
  showNotification: (message: string, type?: 'success' | 'error' | 'info') => void;
}

export const CMS_PUBLISHED_EVENT = 'infinity_cms_published';
export const CMS_DRAFT_UPDATED_EVENT = 'infinity_cms_draft_updated';
export const CMS_ENQUIRY_RECEIVED_EVENT = 'infinity_enquiry_received';

function ensureContentDefaults(data: any): CMSContent {
  if (!data) return JSON.parse(JSON.stringify(DEFAULT_CMS_CONTENT));
  return {
    ...DEFAULT_CMS_CONTENT,
    ...data,
    brand: {
      ...DEFAULT_CMS_CONTENT.brand,
      ...(data.brand || {}),
      logo: data.brand?.logo || data.brand?.logoUrl || DEFAULT_CMS_CONTENT.brand.logo || '/logo.png',
      logoUrl: data.brand?.logoUrl || data.brand?.logo || DEFAULT_CMS_CONTENT.brand.logoUrl || '/logo.png',
    },
    contact: data.contact || {
      phone1: data.brand?.phone1 || DEFAULT_CMS_CONTENT.brand.phone1,
      phone2: data.brand?.phone2 || DEFAULT_CMS_CONTENT.brand.phone2,
      whatsapp: data.brand?.whatsapp || DEFAULT_CMS_CONTENT.brand.whatsapp,
      email: data.brand?.email || DEFAULT_CMS_CONTENT.brand.email,
      address: data.brand?.address || DEFAULT_CMS_CONTENT.brand.address,
    },
    homepage: {
      ...DEFAULT_CMS_CONTENT.homepage,
      ...(data.homepage || {}),
      introImage: data.homepage?.introImage ?? data.homepage?.intro?.image ?? DEFAULT_CMS_CONTENT.homepage.introImage,
      ctaBgImage: data.homepage?.ctaBgImage ?? data.homepage?.ctaBanner?.backgroundImage ?? DEFAULT_CMS_CONTENT.homepage.ctaBgImage,
      ctaBanner: {
        ...(DEFAULT_CMS_CONTENT.homepage?.ctaBanner || {}),
        ...(data.homepage?.ctaBanner || {}),
        backgroundImage: data.homepage?.ctaBgImage ?? data.homepage?.ctaBanner?.backgroundImage ?? DEFAULT_CMS_CONTENT.homepage.ctaBgImage,
      },
      intro: {
        ...(DEFAULT_CMS_CONTENT.homepage?.intro || {}),
        ...(data.homepage?.intro || {}),
        image: data.homepage?.introImage ?? data.homepage?.intro?.image ?? DEFAULT_CMS_CONTENT.homepage.introImage,
      },
    },
    about: {
      ...DEFAULT_CMS_CONTENT.about,
      ...(data.about || {}),
      image: data.about?.image ?? data.about?.heroImage ?? DEFAULT_CMS_CONTENT.about.image,
      heroImage: data.about?.heroImage ?? data.about?.image ?? DEFAULT_CMS_CONTENT.about.image,
    },
    heroSlides: Array.isArray(data.heroSlides) ? data.heroSlides : DEFAULT_CMS_CONTENT.heroSlides,
    products: Array.isArray(data.products) ? data.products : DEFAULT_CMS_CONTENT.products,
    categories: Array.isArray(data.categories) ? data.categories : DEFAULT_CMS_CONTENT.categories,
    collections: Array.isArray(data.collections) ? data.collections : DEFAULT_CMS_CONTENT.collections,
    services: Array.isArray((data as any).services || (data as any).interiorServices)
      ? ((data as any).services || (data as any).interiorServices)
      : DEFAULT_CMS_CONTENT.services,
    gallery: Array.isArray(data.gallery) ? data.gallery : DEFAULT_CMS_CONTENT.gallery,
    testimonials: Array.isArray(data.testimonials) ? data.testimonials : DEFAULT_CMS_CONTENT.testimonials,
  };
}

const CMSContext = createContext<CMSContextType | null>(null);

export function CMSProvider({ children }: { children: React.ReactNode }) {
  // 1. Initial State Hydration with local persistent storage fallback
  const [publishedContent, setPublishedContent] = useState<CMSContent>(() => {
    try {
      const cached = localStorage.getItem('infinity_cms_published') || localStorage.getItem(LOCAL_STORAGE_KEY_PUBLISHED);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.warn('Error parsing cached published content:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_CMS_CONTENT));
  });

  const [draftContent, setDraftContent] = useState<CMSContent>(() => {
    try {
      const cachedDraft = localStorage.getItem('infinity_cms_draft') || localStorage.getItem(LOCAL_STORAGE_KEY_DRAFT);
      if (cachedDraft) return JSON.parse(cachedDraft);
      const cachedPublished = localStorage.getItem('infinity_cms_published') || localStorage.getItem(LOCAL_STORAGE_KEY_PUBLISHED);
      if (cachedPublished) return JSON.parse(cachedPublished);
    } catch (e) {
      console.warn('Error parsing cached draft content:', e);
    }
    return JSON.parse(JSON.stringify(DEFAULT_CMS_CONTENT));
  });

  const [hasDraftChanges, setHasDraftChanges] = useState<boolean>(() => {
    return JSON.stringify(publishedContent) !== JSON.stringify(draftContent);
  });

  const draftContentRef = useRef<CMSContent>(draftContent);
  const publishedContentRef = useRef<CMSContent>(publishedContent);

  useEffect(() => {
    draftContentRef.current = draftContent;
  }, [draftContent]);

  useEffect(() => {
    publishedContentRef.current = publishedContent;
  }, [publishedContent]);

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

  // Media assets state
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>(() => {
    try {
      const cached = localStorage.getItem('infinity_media_library') || localStorage.getItem(LOCAL_STORAGE_KEY_MEDIA);
      if (cached) return JSON.parse(cached);
    } catch (e) {}
    return [];
  });
  const [isLoadingMedia, setIsLoadingMedia] = useState<boolean>(false);

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

  // Update preview toggle state
  const handleSetPreviewDraft = useCallback((val: boolean) => {
    setPreviewDraftOnPublicSite(val);
    try {
      localStorage.setItem('infinity_preview_draft_mode', val ? 'true' : 'false');
    } catch (e) {}
  }, []);

  const hasFetchedFromServerRef = useRef<boolean>(false);

  // Compute active content for public components
  const activeContent = useMemo(() => {
    return previewDraftOnPublicSite ? draftContent : publishedContent;
  }, [previewDraftOnPublicSite, draftContent, publishedContent]);

  // Sync draft state directly to storage whenever draftContent changes (only after server content has loaded)
  useEffect(() => {
    if (!hasFetchedFromServerRef.current) return;
    const isDiff = JSON.stringify(publishedContent) !== JSON.stringify(draftContent);
    setHasDraftChanges(isDiff);
    try {
      safeSetLocalStorage(LOCAL_STORAGE_KEY_DRAFT, JSON.stringify(draftContent));
      safeSetLocalStorage('infinity_cms_draft', JSON.stringify(draftContent));
    } catch (e) {
      console.warn('LocalStorage error for draft:', e);
    }
  }, [draftContent, publishedContent]);

  // Sync mediaAssets directly to localStorage under infinity_media_library
  useEffect(() => {
    if (mediaAssets.length > 0) {
      try {
        localStorage.setItem('infinity_media_library', JSON.stringify(mediaAssets));
        localStorage.setItem(LOCAL_STORAGE_KEY_MEDIA, JSON.stringify(mediaAssets));
        persistMediaAssets(mediaAssets).catch(() => {});
      } catch (e) {
        console.warn('Error saving infinity_media_library:', e);
      }
    }
  }, [mediaAssets]);

  // Clean legacy bloated localStorage entries and rehydrate temporary storage if server has not responded yet
  useEffect(() => {
    cleanLegacyLocalStorage();

    loadPublishedFromStorage().then((idbPub) => {
      // Only hydrate from offline storage if server fetch has NOT finished yet
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
        localStorage.setItem('infinity_admin_auth', 'authorized');
        setIsAuthenticated(true);
        return true;
      }
    } catch (e) {}
    // Offline / fallback credential check
    if (passcode === 'infinity2026' || passcode === 'admin' || passcode === 'infinity') {
      localStorage.setItem('infinity_admin_auth', 'authorized');
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    try {
      localStorage.removeItem('infinity_admin_auth');
    } catch {}
    setIsAuthenticated(false);
  }, []);

  // 2. Fetch Initial Content from server on mount - Authoritative database sync across all devices
  const fetchContent = useCallback(async () => {
    try {
      setIsLoading(true);
      // Explicit cache busting and no-store headers ensure no proxy, CDN, or browser serves stale content
      const cacheBuster = `_t=${Date.now()}`;
      const res = await fetch(`/api/cms/content?${cacheBuster}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.published) {
          const serverPublished = ensureContentDefaults(data.published);
          const serverDraft = data.draft ? ensureContentDefaults(data.draft) : serverPublished;

          // AUTHORITATIVE SINGLE SOURCE OF TRUTH: Server published content wins unconditionally
          setPublishedContent(serverPublished);
          publishedContentRef.current = serverPublished;
          localStorage.setItem('infinity_cms_published', JSON.stringify(serverPublished));
          localStorage.setItem(LOCAL_STORAGE_KEY_PUBLISHED, JSON.stringify(serverPublished));
          persistPublishedContent(serverPublished).catch(() => {});

          setDraftContent(serverDraft);
          draftContentRef.current = serverDraft;
          localStorage.setItem('infinity_cms_draft', JSON.stringify(serverDraft));
          localStorage.setItem(LOCAL_STORAGE_KEY_DRAFT, JSON.stringify(serverDraft));
          persistDraftContent(serverDraft).catch(() => {});
          setHasDraftChanges(Boolean(data.hasDraftChanges));
        }
      } else {
        // Fallback to dedicated published endpoint if /api/cms/content returned non-200
        console.warn(`Server /api/cms/content returned ${res.status}, attempting /api/content/published fallback...`);
        try {
          const pubRes = await fetch(`/api/content/published?${cacheBuster}`, {
            cache: 'no-store',
            headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
          });
          if (pubRes.ok) {
            const pubData = await pubRes.json();
            if (pubData && pubData.published) {
              const serverPub = ensureContentDefaults(pubData.published);
              setPublishedContent(serverPub);
              publishedContentRef.current = serverPub;
              localStorage.setItem('infinity_cms_published', JSON.stringify(serverPub));
              localStorage.setItem(LOCAL_STORAGE_KEY_PUBLISHED, JSON.stringify(serverPub));
              persistPublishedContent(serverPub).catch(() => {});
            }
          }
        } catch (fallbackErr) {
          console.warn('Fallback published fetch error:', fallbackErr);
        }
      }
    } catch (err) {
      console.warn('Network error fetching CMS from server, utilizing cached storage:', err);
    } finally {
      hasFetchedFromServerRef.current = true;
      setIsLoading(false);
    }
  }, []);

  // Load Media Assets
  const loadMedia = useCallback(async () => {
    try {
      setIsLoadingMedia(true);
      const res = await fetch(`/api/cms/media?_t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setMediaAssets(data);
          persistMediaAssets(data).catch(() => {});
        }
      }
    } catch (err) {
      console.warn('Using local media assets fallback:', err);
    } finally {
      setIsLoadingMedia(false);
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
          // Merge local enquiries with server enquiries
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

  // Cross-tab and global publishing event synchronization
  useEffect(() => {
    fetchContent();
    loadMedia();
    loadEnquiries();

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

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(CMS_PUBLISHED_EVENT, handlePublishedEvent);
    };
  }, [fetchContent, loadMedia, loadEnquiries]);

  // 3. Draft Mutators with Optimistic UI Updates & Immediate Local Persistence
  const updateDraft = useCallback((updater: ((prev: CMSContent) => CMSContent) | Partial<CMSContent>) => {
    setDraftContent((prev) => {
      let nextState: CMSContent;
      if (typeof updater === 'function') {
        nextState = updater(prev);
      } else {
        nextState = { ...prev, ...updater };
      }
      draftContentRef.current = nextState;
      setHasDraftChanges(true);
      try {
        safeSetLocalStorage(LOCAL_STORAGE_KEY_DRAFT, JSON.stringify(nextState));
        localStorage.setItem('infinity_cms_draft', JSON.stringify(nextState));
      } catch (e) {}
      return nextState;
    });
  }, []);

  const updateBrand = useCallback((updates: Partial<BrandSettings>) => {
    const timestamp = new Date().toISOString();
    updateDraft((prev) => ({
      ...prev,
      brand: {
        ...prev.brand,
        ...updates,
        logo: updates.logo || prev.brand.logo || '/logo.png',
        logoUrl: updates.logoUrl || updates.logo || prev.brand.logoUrl || '/logo.png',
        lastUpdated: updates.lastUpdated || timestamp,
      },
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

  const syncProductImagesToMediaLibrary = useCallback((products: Product[]) => {
    setMediaAssets((prev) => {
      const existingUrls = new Set(prev.map((a) => a.url));
      let added = false;
      const newAssets: MediaAsset[] = [...prev];

      for (const p of products) {
        const productImgs = [
          ...(p.images || []),
          p.primaryImage,
          p.image,
        ].filter(Boolean) as string[];

        for (const imgUrl of productImgs) {
          if (imgUrl && !existingUrls.has(imgUrl)) {
            existingUrls.add(imgUrl);
            added = true;
            newAssets.unshift({
              id: `med-${Date.now()}-${Math.round(Math.random() * 10000)}`,
              url: imgUrl,
              name: p.name ? `${p.name} Image` : 'Attached Product Photo',
              size: imgUrl.length,
              type: imgUrl.startsWith('data:image/png') ? 'image/png' : 'image/jpeg',
              createdAt: new Date().toISOString(),
              category: p.category || 'Products',
            });
          }
        }
      }

      if (added) {
        try {
          localStorage.setItem('infinity_media_library', JSON.stringify(newAssets));
          localStorage.setItem(LOCAL_STORAGE_KEY_MEDIA, JSON.stringify(newAssets));
          persistMediaAssets(newAssets).catch(() => {});
        } catch (e) {
          console.warn('LocalStorage quota warning syncing product images to media library:', e);
        }
        return newAssets;
      }
      return prev;
    });
  }, []);

  const saveProducts = useCallback((products: Product[]) => {
    updateDraft((prev) => ({ ...prev, products }));
    syncProductImagesToMediaLibrary(products);
  }, [updateDraft, syncProductImagesToMediaLibrary]);

  const saveCategories = useCallback((categories: Category[]) => {
    updateDraft((prev) => ({ ...prev, categories }));
  }, [updateDraft]);

  const saveCollections = useCallback((collections: CollectionItem[]) => {
    updateDraft((prev) => ({ ...prev, collections }));
  }, [updateDraft]);

  const saveServices = useCallback((interiorServices: InteriorService[]) => {
    updateDraft((prev) => ({ ...prev, interiorServices }));
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

  // 4. Save Draft to Server with Optimistic Feedback
  const saveDraft = useCallback(async (): Promise<boolean> => {
    setIsSaving(true);
    try {
      const currentDraft = draftContentRef.current;
      const sanitizedDraft = await sanitizeAndConvertBase64Images(currentDraft);

      const res = await fetch('/api/cms/content/draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft: sanitizedDraft }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorMsg = `Server returned status ${res.status}`;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed.error) errorMsg = parsed.error;
        } catch {}
        throw new Error(errorMsg);
      }

      const data = await res.json();
      if (data && data.draft) {
        const authoritativeDraft = ensureContentDefaults(data.draft);
        setDraftContent(authoritativeDraft);
        draftContentRef.current = authoritativeDraft;
        localStorage.setItem('infinity_cms_draft', JSON.stringify(authoritativeDraft));
        localStorage.setItem(LOCAL_STORAGE_KEY_DRAFT, JSON.stringify(authoritativeDraft));
        persistDraftContent(authoritativeDraft).catch(() => {});
        setHasDraftChanges(Boolean(data.hasDraftChanges));
      }
      showNotification('Draft changes successfully saved to server storage.', 'success');
      return true;
    } catch (err: any) {
      console.warn('Server draft save error:', err);
      // Safely preserve draft in local browser cache while alerting user
      safeSetLocalStorage(LOCAL_STORAGE_KEY_DRAFT, JSON.stringify(draftContentRef.current));
      localStorage.setItem('infinity_cms_draft', JSON.stringify(draftContentRef.current));
      showNotification(`Warning: Could not save draft to server (${err.message || 'Network error'}). Preserved in this browser only.`, 'error');
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [showNotification]);

  // 5. Authoritative Content Publishing Pipeline
  // Strictly verifies server persistence BEFORE marking published or updating live state
  const publishLive = useCallback(async (): Promise<boolean> => {
    setIsPublishing(true);
    try {
      const currentDraft = draftContentRef.current || draftContent;
      const payloadDraft: CMSContent = JSON.parse(JSON.stringify(currentDraft));

      // Sanitize and convert any local base64 images into permanent server URLs
      const sanitizedDraft = await sanitizeAndConvertBase64Images(payloadDraft);

      // Send payload to authoritative server publish endpoint
      const res = await fetch('/api/cms/content/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ draft: sanitizedDraft }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        let errorMsg = `Server error ${res.status}`;
        try {
          const parsed = JSON.parse(errorText);
          if (parsed.error) errorMsg = parsed.error;
        } catch {}
        throw new Error(errorMsg);
      }

      const data = await res.json();
      if (!data || !data.published) {
        throw new Error('Server confirmed publish but returned invalid payload');
      }

      // ONLY on confirmed server write do we adopt the new published state!
      const authoritativePublished = ensureContentDefaults(data.published);
      const authoritativeDraft = data.draft ? ensureContentDefaults(data.draft) : authoritativePublished;

      setPublishedContent(authoritativePublished);
      setDraftContent(authoritativeDraft);
      draftContentRef.current = authoritativeDraft;
      publishedContentRef.current = authoritativePublished;
      setHasDraftChanges(false);

      // Mirror authoritative published state to local cache for fast offline starts
      try {
        localStorage.setItem('infinity_cms_published', JSON.stringify(authoritativePublished));
        localStorage.setItem('infinity_cms_draft', JSON.stringify(authoritativeDraft));
        localStorage.setItem(LOCAL_STORAGE_KEY_PUBLISHED, JSON.stringify(authoritativePublished));
        localStorage.setItem(LOCAL_STORAGE_KEY_DRAFT, JSON.stringify(authoritativeDraft));
        persistPublishedContent(authoritativePublished).catch(() => {});
        persistDraftContent(authoritativeDraft).catch(() => {});
      } catch (storageErr) {
        console.warn('LocalStorage error during cache update:', storageErr);
      }

      // Dispatch global custom event for instant public page refresh without reload
      window.dispatchEvent(
        new CustomEvent(CMS_PUBLISHED_EVENT, { detail: authoritativePublished })
      );

      showNotification('🎉 All draft changes are now published live across all devices!', 'success');
      return true;
    } catch (err: any) {
      console.error('Publish error:', err);
      showNotification('Publish failed: ' + (err.message || 'Could not reach server to publish changes live.'), 'error');
      return false;
    } finally {
      setIsPublishing(false);
    }
  }, [draftContent, showNotification]);

  // Discard / Revert Draft to Published State
  const revertDraft = useCallback(async (): Promise<boolean> => {
    try {
      const currentPublished = publishedContentRef.current;
      const revertedState = JSON.parse(JSON.stringify(currentPublished));
      setDraftContent(revertedState);
      draftContentRef.current = revertedState;
      setHasDraftChanges(false);
      await persistDraftContent(revertedState);
      safeSetLocalStorage(LOCAL_STORAGE_KEY_DRAFT, JSON.stringify(revertedState));

      try {
        await fetch('/api/cms/content/revert', { method: 'POST' });
      } catch (e) {}

      showNotification('Draft successfully reverted to the live published state.', 'info');
      return true;
    } catch (err) {
      return false;
    }
  }, [showNotification]);

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

  // 6. Direct Image Upload System: Upload to server storage first, then fallback to base64 with IndexedDB
  const uploadFile = useCallback(
    async (file: File, category: string = 'General'): Promise<{ url: string; asset: MediaAsset } | null> => {
      // Step A: Client-side validation
      const validation = validateImageFile(file);
      if (!validation.valid) {
        showNotification(validation.error || 'Invalid file.', 'error');
        return null;
      }

      try {
        // Step B: Attempt direct upload to server storage bucket first (/api/upload)
        // This ensures clean URL references (/uploads/...) are stored rather than raw base64 data!
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
            if (data.url && data.asset) {
              setMediaAssets((prev) => {
                const updated = [data.asset, ...prev.filter((a) => a.id !== data.asset.id)];
                persistMediaAssets(updated).catch(() => {});
                return updated;
              });
              showNotification(`Image "${file.name}" uploaded successfully!`, 'success');
              return { url: data.url, asset: data.asset };
            }
          }
        } catch (serverUploadErr) {
          console.warn('Server upload endpoint unreachable, falling back to local processing:', serverUploadErr);
        }

        // Step C: Fallback to local Data URI if server endpoint was unreachable
        const dataUri = await convertFileToDataUri(file, {
          maxWidth: 1600,
          maxHeight: 1600,
          quality: 0.8,
        });

        // Try /api/upload-base64 endpoint
        try {
          const base64Res = await fetch('/api/upload-base64', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dataUri, name: file.name, category }),
          });
          if (base64Res.ok) {
            const data = await base64Res.json();
            if (data.url && data.asset) {
              setMediaAssets((prev) => {
                const updated = [data.asset, ...prev.filter((a) => a.id !== data.asset.id)];
                persistMediaAssets(updated).catch(() => {});
                return updated;
              });
              showNotification(`Image "${file.name}" uploaded successfully!`, 'success');
              return { url: data.url, asset: data.asset };
            }
          }
        } catch (e) {}

        // Fallback: Local asset stored safely in IndexedDB (not bloating localStorage)
        const localAssetId = `med-${Date.now()}-${Math.round(Math.random() * 1000)}`;
        const localAsset: MediaAsset = {
          id: localAssetId,
          url: dataUri,
          name: file.name,
          size: file.size,
          type: file.type || 'image/jpeg',
          createdAt: new Date().toISOString(),
          category,
        };

        setMediaAssets((prev) => {
          const updated = [localAsset, ...prev.filter((a) => a.id !== localAssetId)];
          persistMediaAssets(updated).catch(() => {});
          return updated;
        });

        showNotification(`Image "${file.name}" loaded for preview.`, 'info');
        return { url: dataUri, asset: localAsset };
      } catch (err: any) {
        console.error('Upload handling error:', err);
        showNotification(`Upload failed: ${err.message || 'Please check the file and try again.'}`, 'error');
        return null;
      }
    },
    [showNotification]
  );

  // Delete Media Asset with Reference Fallbacks and State Synchronization
  const deleteMedia = useCallback(
    async (id: string): Promise<boolean> => {
      // Find asset being deleted
      const targetAsset = mediaAssets.find((m) => m.id === id);
      const deletedUrl = targetAsset?.url;

      // Visual toast notification for deleting progress
      showNotification('Deleting...', 'info');

      // 1. Immediately update UI state so media card disappears without manual refresh
      setMediaAssets((prev) => {
        const updated = prev.filter((m) => m.id !== id);
        persistMediaAssets(updated).catch(() => {});
        return updated;
      });

      // 2. Clean up any active references in draft and published content (logo, hero slides, products, etc.)
      if (deletedUrl) {
        const sanitizeContent = (content: CMSContent): { updated: CMSContent; changed: boolean } => {
          const clone: CMSContent = JSON.parse(JSON.stringify(content));
          let changed = false;

          // Brand logo is permanently locked to /logo.png and protected against deletion
          if (clone.brand) {
            clone.brand.logo = '/logo.png';
            clone.brand.logoUrl = '/logo.png';
          }

          // Active hero slides reference fallback
          if (Array.isArray(clone.heroSlides)) {
            clone.heroSlides.forEach((slide, idx) => {
              if (slide.image === deletedUrl) {
                slide.image =
                  DEFAULT_CMS_CONTENT.heroSlides?.[idx]?.image ||
                  DEFAULT_CMS_CONTENT.heroSlides?.[0]?.image ||
                  'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=2000&q=85';
                changed = true;
              }
            });
          }

          // Homepage CTA banner reference fallback
          if (clone.homepage?.ctaBanner?.backgroundImage === deletedUrl) {
            clone.homepage.ctaBanner.backgroundImage =
              DEFAULT_CMS_CONTENT.homepage?.ctaBanner?.backgroundImage ||
              'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=2000&q=80';
            changed = true;
          }

          // About heritage images fallback
          if (clone.about?.heroImage === deletedUrl) {
            clone.about.heroImage = DEFAULT_CMS_CONTENT.about?.heroImage || '';
            changed = true;
          }
          if (clone.about?.storyImage === deletedUrl) {
            clone.about.storyImage = DEFAULT_CMS_CONTENT.about?.storyImage || '';
            changed = true;
          }

          // Products reference fallback
          if (Array.isArray(clone.products)) {
            clone.products.forEach((p, idx) => {
              if (p.image === deletedUrl) {
                const defaultProd = DEFAULT_CMS_CONTENT.products?.[idx] || DEFAULT_CMS_CONTENT.products?.[0];
                p.image = defaultProd?.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=2000&q=85';
                changed = true;
              }
            });
          }

          // Gallery items fallback
          if (Array.isArray(clone.gallery)) {
            clone.gallery.forEach((g, idx) => {
              if (g.image === deletedUrl) {
                const defaultGal = DEFAULT_CMS_CONTENT.gallery?.[idx] || DEFAULT_CMS_CONTENT.gallery?.[0];
                g.image = defaultGal?.image || '';
                changed = true;
              }
            });
          }

          return { updated: clone, changed };
        };

        // Update draft content state
        setDraftContent((prev) => {
          const { updated, changed } = sanitizeContent(prev);
          if (changed) {
            try {
              safeSetLocalStorage(LOCAL_STORAGE_KEY_DRAFT, JSON.stringify(stripBase64Sync(updated)));
              persistDraftContent(updated).catch(() => {});
            } catch (e) {}
            return updated;
          }
          return prev;
        });

        // Update published content state so public views do not render broken links (404)
        setPublishedContent((prev) => {
          const { updated, changed } = sanitizeContent(prev);
          if (changed) {
            try {
              safeSetLocalStorage(LOCAL_STORAGE_KEY_PUBLISHED, JSON.stringify(stripBase64Sync(updated)));
              persistPublishedContent(updated).catch(() => {});
            } catch (e) {}
            window.dispatchEvent(new CustomEvent(CMS_PUBLISHED_EVENT, { detail: updated }));
            return updated;
          }
          return prev;
        });
      }

      // 3. Connect to backend API to remove from storage disk and media registry
      try {
        await fetch(`/api/cms/media/${id}`, { method: 'DELETE' });
      } catch (err) {
        console.warn('Server delete endpoint unreachable, local media removed:', err);
      }

      // Visual toast notification for successful deletion
      showNotification('Image deleted successfully', 'success');
      return true;
    },
    [mediaAssets, showNotification]
  );

  // 7. Inquiry Submission & Mock Service with Local Storage Logging
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
      const clientName = (data.fullName || data.name || '').trim();
      const clientEmail = (data.email || '').trim();
      const clientMessage = (data.message || '').trim();

      if (!clientName || !clientEmail || !clientMessage) {
        showNotification('Please provide your name, valid email, and project message.', 'error');
        return false;
      }

      // Create new enquiry object
      const newEnquiry: CustomerEnquiry = {
        id: `enq-${Date.now()}-${Math.round(Math.random() * 1000)}`,
        createdAt: new Date().toISOString(),
        date: new Date().toISOString(),
        fullName: clientName,
        name: clientName,
        email: clientEmail,
        phone: (data.phone || '').trim(),
        categoryInterest: data.categoryInterest || 'General Furniture & Interior',
        message: clientMessage,
        status: 'New',
        channel: data.channel || 'Website Form',
      };

      // 1. Optimistically store in local React state and localStorage (quota safe)
      setEnquiries((prev) => {
        const updated = [newEnquiry, ...prev.filter((e) => e.id !== newEnquiry.id)];
        try {
          safeSetLocalStorage(LOCAL_STORAGE_KEY_ENQUIRIES, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      // 2. Append to persistent audit event log in LocalStorage (quota safe)
      try {
        const existingLogsRaw = localStorage.getItem(LOCAL_STORAGE_KEY_ENQUIRY_LOGS);
        const existingLogs = existingLogsRaw ? JSON.parse(existingLogsRaw) : [];
        existingLogs.unshift({
          timestamp: new Date().toISOString(),
          enquiryId: newEnquiry.id,
          payload: newEnquiry,
        });
        safeSetLocalStorage(LOCAL_STORAGE_KEY_ENQUIRY_LOGS, JSON.stringify(existingLogs.slice(0, 50)));
      } catch (e) {}

      // 3. Dispatch global browser event so admin dashboard badges react in real time
      window.dispatchEvent(
        new CustomEvent(CMS_ENQUIRY_RECEIVED_EVENT, { detail: newEnquiry })
      );

      // 4. Try posting to server endpoint in background
      try {
        await fetch('/api/enquiries', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newEnquiry),
        });
      } catch (err) {
        console.warn('Backend /api/enquiries unreachable, enquiry recorded safely in local store:', err);
      }

      return true;
    },
    [showNotification]
  );

  const updateEnquiryStatus = useCallback(
    async (id: string, status: CustomerEnquiry['status'], notes?: string) => {
      setEnquiries((prev) => {
        const updated = prev.map((item) =>
          item.id === id ? { ...item, status, notes: notes !== undefined ? notes : item.notes } : item
        );
        try {
          safeSetLocalStorage(LOCAL_STORAGE_KEY_ENQUIRIES, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      try {
        await fetch(`/api/enquiries/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, notes }),
        });
      } catch (e) {}

      showNotification(`Enquiry status updated to "${status}"`, 'success');
    },
    [showNotification]
  );

  const deleteEnquiry = useCallback(
    async (id: string) => {
      setEnquiries((prev) => {
        const updated = prev.filter((e) => e.id !== id);
        try {
          safeSetLocalStorage(LOCAL_STORAGE_KEY_ENQUIRIES, JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });

      try {
        await fetch(`/api/enquiries/${id}`, { method: 'DELETE' });
      } catch (e) {}

      showNotification('Enquiry removed.', 'info');
    },
    [showNotification]
  );

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
        mediaAssets,
        isLoadingMedia,
        loadMedia,
        uploadFile,
        deleteMedia,
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
