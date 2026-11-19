/**
 * Cache + stale + fallback response helpers for resilient API routes.
 */

export function createRespondHelpers(cache, staleCache) {
  function remember(key, data, ttl) {
    cache.set(key, data, ttl);
    staleCache.set(`stale:${key}`, data);
    return data;
  }

  function getStale(key) {
    return staleCache.get(`stale:${key}`) ?? cache.get(key) ?? null;
  }

  /**
   * On failure: prefer stale cache, then static fallback, else 503.
   */
  function fail(res, key, err, fallbackFn) {
    const stale = getStale(key);
    if (stale != null) {
      res.setHeader('X-SphereX-Data', 'stale');
      return res.json(stale);
    }
    if (typeof fallbackFn === 'function') {
      const fb = fallbackFn();
      if (fb != null) {
        res.setHeader('X-SphereX-Data', 'fallback');
        return res.json(fb);
      }
    }
    return res.status(503).json({
      error: err?.message || 'Servis geçici olarak kullanılamıyor',
      fallback: true,
    });
  }

  return { remember, getStale, fail };
}
