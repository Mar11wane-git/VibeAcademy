import axios from 'axios';

// Auto-detect production vs local environment:
// On Vercel or any non-localhost host, always target the live Railway API
const defaultBaseURL = (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
  ? 'https://vibeacademy-production.up.railway.app/api'
  : 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultBaseURL,
  timeout: 25000,
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
});

/* ─── Ultra-Fast Stale-While-Revalidate (SWR) & In-Flight Deduplication Engine ─── */
const memoryCache = new Map();
const inFlightRequests = new Map();
const CACHE_TTL_MS = 20000; // 20 seconds fresh window
const STORAGE_PREFIX = 'mr1_api_swr_v5:';

// Auto-clean legacy corrupted caches on boot
if (typeof window !== 'undefined') {
  try {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith('vibe_api_swr_') || k.startsWith('vibe_contact_') || k.startsWith('vibe_tickets')) {
        localStorage.removeItem(k);
      }
    });
  } catch { /* ignore */ }
}

function normalizeCacheKey(url, config = {}) {
  const cleanUrl = String(url || '').replace(/^\/+/, '/');
  const params = config?.params ? JSON.stringify(config.params) : '';
  const token = (localStorage.getItem('token') || 'guest').slice(0, 16);
  return `${token}:${cleanUrl}${params}`;
}

export function getCachedData(url, fallback = null) {
  try {
    const key = normalizeCacheKey(url);
    const mem = memoryCache.get(key);
    if (mem && mem.data !== undefined) {
      if (url.includes('courses') && !Array.isArray(mem.data)) return fallback;
      return mem.data;
    }

    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.data !== undefined) {
        if (url.includes('courses') && !Array.isArray(parsed.data)) {
          localStorage.removeItem(STORAGE_PREFIX + key);
          return fallback;
        }
        memoryCache.set(key, { data: parsed.data, timestamp: parsed.timestamp || 0 });
        return parsed.data;
      }
    }
  } catch { /* ignore storage errors */ }
  return fallback;
}

function setCachedData(key, data) {
  if (!data || data.exception || (data.message && !data.id && !Array.isArray(data))) return;
  const entry = { data, timestamp: Date.now() };
  memoryCache.set(key, entry);
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(entry));
  } catch { /* ignore quota errors */ }
}

export function invalidateApiCache() {
  memoryCache.clear();
  try {
    Object.keys(localStorage).forEach(k => {
      if (k.startsWith(STORAGE_PREFIX) || k.startsWith('vibe_api_swr_')) {
        localStorage.removeItem(k);
      }
    });
  } catch { /* ignore */ }
}

// Automatically attach Sanctum token from localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Invalidate cache automatically on any write operation (POST, PUT, DELETE, PATCH)
  const method = (config.method || 'get').toLowerCase();
  if (method !== 'get') {
    invalidateApiCache();
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      invalidateApiCache();
      window.location.href = '/login';
    }
    if (error.response && error.response.status === 503) {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      if (!user.is_admin) {
        const serverMessage = error.response.data?.message || 'Le système est en maintenance.';
        alert(serverMessage);
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

// Wrap api.get with SWR caching + in-flight request deduplication
const rawGet = api.get.bind(api);

api.get = function swrGet(url, config = {}) {
  const key = normalizeCacheKey(url, config);
  const bypassCache = Boolean(config?.forceRefresh);
  const now = Date.now();

  const fetchAndCache = () => {
    if (inFlightRequests.has(key)) {
      return inFlightRequests.get(key);
    }
    const reqPromise = rawGet(url, config)
      .then((res) => {
        setCachedData(key, res.data);
        return res;
      })
      .finally(() => {
        inFlightRequests.delete(key);
      });

    inFlightRequests.set(key, reqPromise);
    return reqPromise;
  };

  if (!bypassCache) {
    // 1. Check in-memory cache first
    let cached = memoryCache.get(key);
    if (!cached) {
      // 2. Check persistent localStorage cache
      const persisted = getCachedData(url, undefined);
      if (persisted !== undefined) {
        cached = memoryCache.get(key);
      }
    }

    if (cached && cached.data !== undefined) {
      const isStale = now - (cached.timestamp || 0) > CACHE_TTL_MS;
      if (isStale) {
        // Revalidate silently in the background without blocking UI!
        fetchAndCache().catch(() => {});
      }
      return Promise.resolve({
        data: cached.data,
        status: 200,
        statusText: 'OK (Cached)',
        headers: {},
        config,
        fromCache: true,
      });
    }
  }

  return fetchAndCache();
};

// Warm up core endpoints in the background shortly after app boot
if (typeof window !== 'undefined') {
  setTimeout(() => {
    api.get('/courses').catch(() => {});
    if (localStorage.getItem('token')) {
      api.get('/my-courses').catch(() => {});
    }
  }, 50);
}

export default api;
