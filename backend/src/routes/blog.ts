import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";
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

bookRouter.use("/*", async (c, next) => {
  const header = c.req.header("Authorization");
  if (!header) {
    c.status(401);
    return c.json({ error: "unauthorized" });
  }
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;
  try {
    const payload = await verify(token, c.env.JWT_SECRET, "HS256");
    if (!payload || typeof (payload as any).id !== "string") {
      c.status(401);
      return c.json({ error: "unauthorized" });
    }
    c.set("userId", (payload as any).id);
    await next();
  } catch (e) {
    c.status(401);
    return c.json({ error: "unauthorized" });
  }
});

bookRouter.post("/", validateJson(createPostSchema), async (c) => {
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
    },
  });
  return c.json({
    id: post.id,
  });
});

bookRouter.put("/", validateJson(updatePostSchema), async (c) => {
  const userId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const body = c.req.valid("json");
  const post = await prisma.post.update({
    where: {
      id: body.id,
      authorId: userId,
    },
    data: {
      title: body.title,
      content: body.content,
    },
  });

  return c.json({
    id: post.id,
  });
});
bookRouter.get("/bulk", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  const post = await prisma.post.findMany({
    select: {
      content: true,
      title: true,
      id: true,
      createdAt: true,
      author: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return c.json({
    post,
  });
});

bookRouter.get("/related/:id", async (c) => {
  const id = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const posts = await prisma.post.findMany({
      where: {
        NOT: { id },
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 3,
    });
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
      where: {
        id: id,
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            name: true,
          },
        },
      },
    });

    return c.json({
      post,
    });
  } catch (e) {
    c.status(411);
    return c.json({
      message: "Error while fetching blog post",
    });
  }
});

bookRouter.get("/get-blogs-for-user/:userId", async (c) => {
  const userId = c.req.param("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const posts = await prisma.post.findMany({
      where: {
        authorId: userId,
      },
      select: {
        id: true,
        title: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return c.json({
      posts,
    });
  } catch (e) {
    c.status(411);
    return c.json({
      message: "Error while fetching blog posts for user",
    });
  }
});
