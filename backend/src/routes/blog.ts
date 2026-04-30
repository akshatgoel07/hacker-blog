import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { authMiddleware } from "../middleware/middleware";
import {
  createCommentSchema,
  createPostSchema,
  updatePostSchema,
} from "../lib/schemas";
import { validateJson } from "../lib/validate";
import { upsertTagsByName } from "../lib/tags";

export const bookRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

const READ_CACHE_HEADERS = {
  "Cache-Control": "public, max-age=60, s-maxage=60",
  Vary: "Accept-Encoding",
};

const setReadCache = (c: any) => {
  for (const [k, v] of Object.entries(READ_CACHE_HEADERS)) c.header(k, v);
};

bookRouter.post(
  "/",
  authMiddleware,
  validateJson(createPostSchema),
  async (c) => {
    const userId = c.get("userId");
    const prisma = new PrismaClient({
      datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = c.req.valid("json");
    let tagConnect: { connect: { id: string }[] } | undefined;
    try {
      const tags = await upsertTagsByName(prisma, body.tags);
      if (tags.length > 0) {
        tagConnect = { connect: tags.map((t) => ({ id: t.id })) };
      }
    } catch (e) {
      // Tag table may not exist yet (migration unapplied); save the post
      // without tags rather than failing the whole publish flow.
    }
    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: userId,
        published: body.published ?? true,
        ...(tagConnect && { tags: tagConnect }),
      },
    });
    return c.json({ id: post.id, published: post.published });
  },
);

bookRouter.put(
  "/",
  authMiddleware,
  validateJson(updatePostSchema),
  async (c) => {
    const userId = c.get("userId");
    const prisma = new PrismaClient({
      datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const body = c.req.valid("json");
    let tagOps: any = {};
    if (body.tags !== undefined) {
      try {
        const tags = await upsertTagsByName(prisma, body.tags);
        tagOps = { tags: { set: tags.map((t) => ({ id: t.id })) } };
      } catch (e) {
        // Tag table may not exist yet (migration unapplied); skip tag set.
      }
    }
    const post = await prisma.post.update({
      where: { id: body.id, authorId: userId },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.published !== undefined && { published: body.published }),
        ...tagOps,
      },
    });

    return c.json({ id: post.id, published: post.published });
  },
);

bookRouter.get("/tags", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());
  const tags = await prisma.tag.findMany({
    select: {
      id: true,
      slug: true,
      name: true,
      _count: { select: { posts: { where: { published: true } } } },
    },
    orderBy: { slug: "asc" },
  });
  c.header("Cache-Control", "public, max-age=300, s-maxage=300");
  return c.json({
    tags: tags
      .filter((t) => t._count.posts > 0)
      .map((t) => ({ id: t.id, slug: t.slug, name: t.name, count: t._count.posts })),
  });
});

bookRouter.get("/:postId/comments", async (c) => {
  const postId = c.req.param("postId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const post = await prisma.post.findFirst({
    where: { id: postId, published: true },
    select: { id: true },
  });
  if (!post) {
    c.status(404);
    return c.json({ message: "Post not found" });
  }

  const comments = await prisma.comment.findMany({
    where: { postId },
    select: {
      id: true,
      content: true,
      createdAt: true,
      author: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  c.header("Cache-Control", "public, max-age=15, s-maxage=15");
  return c.json({ comments });
});

bookRouter.post(
  "/:postId/comments",
  authMiddleware,
  validateJson(createCommentSchema),
  async (c) => {
    const userId = c.get("userId");
    const postId = c.req.param("postId");
    const body = c.req.valid("json");
    const prisma = new PrismaClient({
      datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const post = await prisma.post.findFirst({
      where: { id: postId, published: true },
      select: { id: true },
    });
    if (!post) {
      c.status(404);
      return c.json({ message: "Post not found" });
    }

    const comment = await prisma.comment.create({
      data: { postId, authorId: userId, content: body.content },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: { select: { id: true, name: true } },
      },
    });
    return c.json({ comment });
  },
);

bookRouter.delete(
  "/:postId/comments/:commentId",
  authMiddleware,
  async (c) => {
    const userId = c.get("userId");
    const postId = c.req.param("postId");
    const commentId = c.req.param("commentId");
    const prisma = new PrismaClient({
      datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { authorId: true, postId: true, post: { select: { authorId: true } } },
    });
    if (!comment || comment.postId !== postId) {
      c.status(404);
      return c.json({ message: "Comment not found" });
    }

    const isCommentAuthor = comment.authorId === userId;
    const isPostAuthor = comment.post.authorId === userId;
    if (!isCommentAuthor && !isPostAuthor) {
      c.status(403);
      return c.json({ message: "Not allowed" });
    }

    await prisma.comment.delete({ where: { id: commentId } });
    return c.json({ id: commentId, deleted: true });
  },
);

bookRouter.delete("/:id", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const result = await prisma.post.deleteMany({
      where: { id, authorId: userId },
    });
    if (result.count === 0) {
      c.status(404);
      return c.json({ message: "Post not found or not owned by you" });
    }
    return c.json({ id, deleted: true });
  } catch (e) {
    c.status(500);
    return c.json({ message: "Error deleting post" });
  }
});

bookRouter.get("/bookmarks", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const rows = await prisma.bookmark.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: {
      createdAt: true,
      post: {
        select: {
          id: true,
          title: true,
          content: true,
          createdAt: true,
          published: true,
          author: { select: { id: true, name: true } },
        },
      },
    },
  });

  c.header("Cache-Control", "no-store");
  return c.json({
    posts: rows
      .filter((r) => r.post && r.post.published)
      .map((r) => ({
        ...r.post,
        bookmarkedAt: r.createdAt,
      })),
  });
});

bookRouter.post("/:id/bookmark", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const post = await prisma.post.findFirst({
    where: { id, published: true },
    select: { id: true },
  });
  if (!post) {
    c.status(404);
    return c.json({ message: "Post not found" });
  }

  try {
    await prisma.bookmark.upsert({
      where: { userId_postId: { userId, postId: id } },
      create: { userId, postId: id },
      update: {},
    });
    return c.json({ id, bookmarked: true });
  } catch (e) {
    c.status(500);
    return c.json({ message: "Could not save bookmark" });
  }
});

bookRouter.delete("/:id/bookmark", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  await prisma.bookmark.deleteMany({
    where: { userId, postId: id },
  });
  return c.json({ id, bookmarked: false });
});

bookRouter.get("/edit/:id", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const id = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const post = await prisma.post.findFirst({
    where: { id, authorId: userId },
    select: {
      id: true,
      title: true,
      content: true,
      published: true,
      createdAt: true,
      updatedAt: true,
      // tags re-enabled here once the add_tags migration is applied
    },
  });

  if (!post) {
    c.status(404);
    return c.json({ message: "Post not found or not owned by you" });
  }

  c.header("Cache-Control", "no-store");
  return c.json({ post });
});

bookRouter.get("/drafts", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const posts = await prisma.post.findMany({
    where: { authorId: userId, published: false },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
  });

  c.header("Cache-Control", "no-store");
  return c.json({ posts });
});

bookRouter.get("/search", async (c) => {
  const q = (c.req.query("q") ?? "").trim();
  if (q.length < 2) {
    c.status(400);
    return c.json({ message: "Query must be at least 2 characters" });
  }
  if (q.length > 100) {
    c.status(400);
    return c.json({ message: "Query too long" });
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const posts = await prisma.post.findMany({
    where: {
      published: true,
      OR: [
        { title: { contains: q, mode: "insensitive" } },
        { content: { contains: q, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      title: true,
      content: true,
      createdAt: true,
      author: { select: { id: true, name: true } },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 20,
  });

  c.header("Cache-Control", "public, max-age=30, s-maxage=30");
  return c.json({ posts, query: q });
});

bookRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const cursor = c.req.query("cursor");
  const rawLimit = Number(c.req.query("limit") ?? "20");
  const limit = Number.isFinite(rawLimit)
    ? Math.min(50, Math.max(1, Math.floor(rawLimit)))
    : 20;

  const tagSlug = c.req.query("tag");
  const rows = await prisma.post.findMany({
    where: {
      published: true,
      // tag filter re-enabled once add_tags migration is applied
    },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      content: true,
      title: true,
      id: true,
      createdAt: true,
      author: { select: { id: true, name: true } },
      // tags re-enabled here once the add_tags migration is applied
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });
  // Suppress unused-var warning while tag filter is gated on migration
  void tagSlug;

  const hasMore = rows.length > limit;
  const posts = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? posts[posts.length - 1].id : null;

  setReadCache(c);
  return c.json({ posts, nextCursor, post: posts });
});

bookRouter.get("/og/:id", async (c) => {
  const id = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const post = await prisma.post.findFirst({
    where: { id, published: true },
    select: {
      title: true,
      createdAt: true,
      author: { select: { name: true } },
    },
  });

  if (!post) {
    c.status(404);
    return c.text("not found");
  }

  const escape = (s: string) =>
    s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const wrap = (text: string, perLine: number, maxLines: number): string[] => {
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let current = "";
    for (const w of words) {
      if ((current + " " + w).trim().length <= perLine) {
        current = (current ? current + " " : "") + w;
      } else {
        if (current) lines.push(current);
        current = w;
        if (lines.length === maxLines - 1) break;
      }
    }
    if (current && lines.length < maxLines) lines.push(current);
    if (lines.length === maxLines) {
      const last = lines[maxLines - 1];
      lines[maxLines - 1] = last.length > perLine - 1 ? last.slice(0, perLine - 1) + "…" : last + "…";
    }
    return lines;
  };

  const titleLines = wrap(post.title || "Untitled", 28, 4);
  const author = post.author?.name || "The Hacker Blog";
  const date = post.createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <pattern id="paper" patternUnits="userSpaceOnUse" width="3" height="3">
      <rect width="3" height="3" fill="#f4ecd8"/>
      <circle cx="1" cy="1" r="0.4" fill="#3c2814" opacity="0.04"/>
    </pattern>
  </defs>
  <rect width="1200" height="630" fill="url(#paper)"/>
  <rect x="60" y="60" width="1080" height="510" fill="none" stroke="#1a1410" stroke-width="2"/>
  <line x1="60" y1="80" x2="1140" y2="80" stroke="#1a1410" stroke-width="1"/>
  <line x1="60" y1="84" x2="1140" y2="84" stroke="#1a1410" stroke-width="3"/>
  <text x="600" y="140" font-family="Georgia, serif" font-size="22" fill="#7a5c3e" text-anchor="middle" letter-spacing="6">THE HACKER BLOG</text>
  <line x1="120" y1="170" x2="1080" y2="170" stroke="#1a1410" stroke-width="1"/>
  ${titleLines
    .map(
      (line, i) =>
        `<text x="600" y="${260 + i * 78}" font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="68" fill="#1a1410" text-anchor="middle">${escape(line)}</text>`,
    )
    .join("\n  ")}
  <line x1="380" y1="${260 + titleLines.length * 78 + 30}" x2="820" y2="${260 + titleLines.length * 78 + 30}" stroke="#1a1410" stroke-width="1"/>
  <text x="600" y="${260 + titleLines.length * 78 + 75}" font-family="Georgia, serif" font-size="26" fill="#3b302a" text-anchor="middle" font-style="italic">By ${escape(author)} · ${escape(date)}</text>
</svg>`;

  c.header("Content-Type", "image/svg+xml");
  c.header("Cache-Control", "public, max-age=3600, s-maxage=3600");
  return c.body(svg);
});

bookRouter.get("/related/:id", async (c) => {
  const id = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const posts = await prisma.post.findMany({
      where: { NOT: { id }, published: true },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: { select: { id: true, name: true } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 3,
    });
    setReadCache(c);
    return c.json({ posts });
  } catch (e) {
    c.status(500);
    return c.json({ message: "Error while fetching related posts" });
  }
});

bookRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const post = await prisma.post.findFirst({
      where: { id: id, published: true },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: { select: { id: true, name: true } },
      },
    });

    if (!post) {
      c.status(404);
      return c.json({ message: "Post not found" });
    }

    setReadCache(c);
    return c.json({ post });
  } catch (e) {
    c.status(500);
    return c.json({ message: "Error while fetching blog post" });
  }
});

bookRouter.get("/get-blogs-for-user/:userId", async (c) => {
  const userId = c.req.param("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const posts = await prisma.post.findMany({
      where: { authorId: userId, published: true },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: { select: { id: true, name: true } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });

    setReadCache(c);
    return c.json({ posts });
  } catch (e) {
    c.status(500);
    return c.json({ message: "Error while fetching blog posts for user" });
  }
});
