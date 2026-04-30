import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { hashPassword } from "./password";
import { FEED_SOURCES, type FeedSource } from "./sources";
import { parseFeed, type FeedItem } from "./feedParser";

const SYSTEM_PASSWORD_PLACEHOLDER = "system-account-no-signin";

interface IngestResult {
  source: string;
  fetched: number;
  inserted: number;
  skipped: number;
  errored: number;
}

const ensureSourceUser = async (prisma: any, src: FeedSource) => {
  const email = `rss+${src.slug}@hackerblog.local`;
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return existing;
  // Hash a long random placeholder so the row can never be signed in to via
  // the regular /signin path -- stored hash isn't recoverable.
  const password = await hashPassword(
    SYSTEM_PASSWORD_PLACEHOLDER + crypto.randomUUID(),
  );
  return prisma.user.create({
    data: { email, name: src.name, password },
  });
};

const sanitiseTitle = (raw: string): string => {
  const t = raw.replace(/\s+/g, " ").trim();
  return t.length > 200 ? t.slice(0, 200) : t;
};

const buildContent = (item: FeedItem, src: FeedSource): string => {
  if (item.content && item.content.length > 0) {
    return `_Originally published at [${src.name}](${item.link})._\n\n${item.content}`;
  }
  return `_From [${src.name}](${item.link}). Read the full essay at the source._\n\n[${item.link}](${item.link})`;
};

const upsertSourceTag = async (prisma: any, src: FeedSource) => {
  const slug = `via-${src.slug}`;
  return prisma.tag.upsert({
    where: { slug },
    create: { slug, name: `via ${src.name}` },
    update: {},
    select: { id: true },
  });
};

const ingestSource = async (
  prisma: any,
  src: FeedSource,
  fetchImpl: (url: string) => Promise<Response>,
): Promise<IngestResult> => {
  const result: IngestResult = {
    source: src.slug,
    fetched: 0,
    inserted: 0,
    skipped: 0,
    errored: 0,
  };

  let xml: string;
  try {
    const res = await fetchImpl(src.url);
    if (!res.ok) {
      result.errored++;
      return result;
    }
    xml = await res.text();
  } catch (e) {
    result.errored++;
    return result;
  }

  const items = parseFeed(xml).filter((i) => i.title && i.link);
  result.fetched = items.length;
  if (items.length === 0) return result;

  const user = await ensureSourceUser(prisma, src);
  const tag = await upsertSourceTag(prisma, src);

  // Cap per-source per-run to avoid pathological feeds inserting hundreds
  // of rows on first ingest. Subsequent runs catch up.
  const limit = 25;
  // For feeds with no publish-date (e.g. PG's scraper), spread createdAt
  // backwards from a fixed sentinel so all-at-once inserts don't bury
  // current user-written posts on the front page.
  const NO_DATE_SENTINEL = new Date("2024-01-01T00:00:00Z").getTime();
  let noDateIndex = 0;
  for (const item of items.slice(0, limit)) {
    const title = sanitiseTitle(item.title);
    if (!title) {
      result.skipped++;
      continue;
    }
    // v1 dedup: skip if a post with the same title already exists for this
    // source's user. Once the externalUrl migration is applied, swap to
    // upsert by externalUrl which is more robust to title edits.
    const existing = await prisma.post.findFirst({
      where: { authorId: user.id, title },
      select: { id: true },
    });
    if (existing) {
      result.skipped++;
      continue;
    }
    let createdAt: Date;
    if (item.publishedAt) {
      createdAt = item.publishedAt;
    } else {
      // 1 hour apart, walking backwards from the sentinel
      createdAt = new Date(NO_DATE_SENTINEL - noDateIndex * 60 * 60 * 1000);
      noDateIndex++;
    }
    try {
      await prisma.post.create({
        data: {
          title,
          content: buildContent(item, src),
          authorId: user.id,
          published: true,
          tags: { connect: [{ id: tag.id }] },
          createdAt,
        },
      });
      result.inserted++;
    } catch {
      result.errored++;
    }
  }
  return result;
};

export interface IngestEnv {
  DATABASE_URL: string;
}

export const ingestAllFeeds = async (
  env: IngestEnv,
  fetchImpl: (url: string) => Promise<Response> = fetch as any,
): Promise<IngestResult[]> => {
  const prisma = new PrismaClient({
    datasourceUrl: env.DATABASE_URL,
  }).$extends(withAccelerate());
  const results: IngestResult[] = [];
  for (const src of FEED_SOURCES) {
    results.push(await ingestSource(prisma, src, fetchImpl));
  }
  return results;
};
