import crypto from 'crypto';

const ttlMs = Number(process.env.CACHE_TTL_MS || 300000);
const store = new Map();

export function makeCacheKey(url = '', text = '') {
  return crypto.createHash('sha256').update(`${url}::${text}`).digest('hex');
}

export function getCached(key) {
  const value = store.get(key);
  if (!value) {
    return null;
  }

  if (Date.now() - value.createdAt > ttlMs) {
    store.delete(key);
    return null;
  }

  return value.data;
}

export function setCached(key, data) {
  store.set(key, { data, createdAt: Date.now() });
}
