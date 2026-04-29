import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { authMiddleware } from "../middleware/middleware";
import { createPostSchema, updatePostSchema } from "../lib/schemas";
import { validateJson } from "../lib/validate";

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
    const post = await prisma.post.create({
      data: {
        title: body.title,
        content: body.content,
        authorId: userId,
        published: body.published ?? true,
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
    const post = await prisma.post.update({
      where: { id: body.id, authorId: userId },
      data: {
        ...(body.title !== undefined && { title: body.title }),
        ...(body.content !== undefined && { content: body.content }),
        ...(body.published !== undefined && { published: body.published }),
      },
    });

    return c.json({ id: post.id, published: post.published });
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

bookRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const cursor = c.req.query("cursor");
  const rawLimit = Number(c.req.query("limit") ?? "20");
  const limit = Number.isFinite(rawLimit)
    ? Math.min(50, Math.max(1, Math.floor(rawLimit)))
    : 20;

  const rows = await prisma.post.findMany({
    where: { published: true },
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    select: {
      content: true,
      title: true,
      id: true,
      createdAt: true,
      author: { select: { id: true, name: true } },
    },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
  });

  const hasMore = rows.length > limit;
  const posts = hasMore ? rows.slice(0, limit) : rows;
  const nextCursor = hasMore ? posts[posts.length - 1].id : null;

  setReadCache(c);
  return c.json({ posts, nextCursor, post: posts });
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
