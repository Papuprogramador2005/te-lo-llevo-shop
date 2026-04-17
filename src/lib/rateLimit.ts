// Simple client-side rate limiter (per-tab) to mitigate abuse/spam.
// NOTE: Real DDoS protection MUST be done at infrastructure level (Cloudflare, etc.).
// This is a basic safeguard against accidental floods and casual abuse.

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

export function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key) ?? { timestamps: [] };
  bucket.timestamps = bucket.timestamps.filter((t) => now - t < windowMs);
  if (bucket.timestamps.length >= maxRequests) {
    buckets.set(key, bucket);
    return false;
  }
  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return true;
}

export function rateLimitMessage(seconds: number) {
  return `Demasiadas solicitudes. Espera ${seconds}s e inténtalo de nuevo.`;
}
