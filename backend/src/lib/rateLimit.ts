type KVNamespace = {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string, opts?: { expirationTtl?: number }) => Promise<void>;
};

interface RateLimitOpts {
  kv: KVNamespace | undefined;
  key: string;
  limit: number;
  windowSeconds: number;
}

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  resetAt: number;
}

const memoryStore = new Map<string, { count: number; resetAt: number }>();

export const rateLimit = async ({
  kv,
  key,
  limit,
  windowSeconds,
}: RateLimitOpts): Promise<RateLimitResult> => {
  const now = Math.floor(Date.now() / 1000);
  const resetAt = now + windowSeconds;

  if (kv) {
    const raw = await kv.get(key);
    let entry: { count: number; resetAt: number } = raw
      ? JSON.parse(raw)
      : { count: 0, resetAt };

    if (entry.resetAt <= now) {
      entry = { count: 0, resetAt };
    }
    entry.count += 1;
    await kv.put(key, JSON.stringify(entry), {
      expirationTtl: Math.max(60, entry.resetAt - now + 1),
    });
    return {
      ok: entry.count <= limit,
      remaining: Math.max(0, limit - entry.count),
      resetAt: entry.resetAt,
    };
  }

  // Fallback: per-isolate Map. Imperfect (multiple isolates each get
  // their own bucket) but better than nothing in dev or when KV isn't bound.
  let entry = memoryStore.get(key);
  if (!entry || entry.resetAt <= now) {
    entry = { count: 0, resetAt };
  }
  entry.count += 1;
  memoryStore.set(key, entry);
  return {
    ok: entry.count <= limit,
    remaining: Math.max(0, limit - entry.count),
    resetAt: entry.resetAt,
  };
};

export const clientIp = (c: any): string => {
  const cf = c.req.header("cf-connecting-ip");
  if (cf) return cf;
  const fwd = c.req.header("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return "unknown";
};
