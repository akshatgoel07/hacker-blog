export const slugify = (raw: string): { slug: string; name: string } => {
  const trimmed = raw.trim();
  const slug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return { slug, name: trimmed };
};

export const upsertTagsByName = async (
  prisma: any,
  rawTags: string[] | undefined,
) => {
  if (!rawTags || rawTags.length === 0) return [];
  const seen = new Set<string>();
  const tags = [];
  for (const raw of rawTags) {
    const { slug, name } = slugify(raw);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    const tag = await prisma.tag.upsert({
      where: { slug },
      create: { slug, name },
      update: {},
      select: { id: true },
    });
    tags.push(tag);
  }
  return tags;
};
