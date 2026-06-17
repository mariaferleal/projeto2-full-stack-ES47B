const cache = new Map()
const defaultTtl = Number(process.env.CACHE_TTL_MS || 60_000)

export function getCachedValue(key) {
  const entry = cache.get(key)

  if (!entry) {
    return null
  }

  if (entry.expiresAt < Date.now()) {
    cache.delete(key)
    return null
  }

  return entry.value
}

export function setCachedValue(key, value, ttl = defaultTtl) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttl,
  })
}

export function clearCache() {
  cache.clear()
}
