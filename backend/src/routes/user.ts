import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign } from "hono/jwt";
import { authMiddleware } from "../middleware/middleware";
import { hashPassword, isHashed, verifyPassword } from "../lib/password";
import {
  signinSchema,
  signupSchema,
  updateProfileSchema,
} from "../lib/schemas";
import { validateJson } from "../lib/validate";
import { clientIp, rateLimit } from "../lib/rateLimit";

const TOKEN_TTL_SECONDS = 60 * 60 * 24;
const AUTH_RATE_LIMIT = 10;
const AUTH_RATE_WINDOW = 60;

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
    RATE_LIMITER?: any;
  };
  Variables: {
    userId: string;
  };
}>();

const enforceAuthRateLimit = async (c: any, scope: string) => {
  const ip = clientIp(c);
  const result = await rateLimit({
    kv: c.env?.RATE_LIMITER,
    key: `auth:${scope}:${ip}`,
    limit: AUTH_RATE_LIMIT,
    windowSeconds: AUTH_RATE_WINDOW,
  });
  c.header("X-RateLimit-Limit", String(AUTH_RATE_LIMIT));
  c.header("X-RateLimit-Remaining", String(result.remaining));
  c.header("X-RateLimit-Reset", String(result.resetAt));
  if (!result.ok) {
    const retryAfter = Math.max(1, result.resetAt - Math.floor(Date.now() / 1000));
    c.header("Retry-After", String(retryAfter));
    c.status(429);
    return c.json({
      message: `Too many attempts. Try again in ${retryAfter}s.`,
    });
  }
  return null;
};

const issueToken = async (userId: string, secret: string) => {
  const now = Math.floor(Date.now() / 1000);
  return sign({ id: userId, iat: now, exp: now + TOKEN_TTL_SECONDS }, secret);
};

userRouter.post("/signup", validateJson(signupSchema), async (c) => {
  const limited = await enforceAuthRateLimit(c, "signup");
  if (limited) return limited;
  const body = c.req.valid("json");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const passwordHash = await hashPassword(body.password);
    const user = await prisma.user.create({
      data: {
        name: body.username,
        password: passwordHash,
        email: body.email,
      },
    });
    const token = await issueToken(user.id, c.env.JWT_SECRET);
    return c.json(token);
  } catch (e) {
    c.status(409);
    return c.json({
      message: "Error creating user. Email might already be registered.",
    });
  }
});

userRouter.post("/signin", validateJson(signinSchema), async (c) => {
  const limited = await enforceAuthRateLimit(c, "signin");
  if (limited) return limited;
  const body = c.req.valid("json");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      c.status(401);
      return c.json({ message: "Invalid credentials" });
    }

    const ok = await verifyPassword(body.password, user.password);
    if (!ok) {
      c.status(401);
      return c.json({ message: "Invalid credentials" });
    }

    if (!isHashed(user.password)) {
      const upgraded = await hashPassword(body.password);
      await prisma.user.update({
        where: { id: user.id },
        data: { password: upgraded },
      });
    }

    const jwt = await issueToken(user.id, c.env.JWT_SECRET);
    return c.json(jwt);
  } catch (e) {
    c.status(500);
    return c.json({ message: "Internal server error" });
  }
});

userRouter.get("/public/:id", async (c) => {
  const id = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true },
    });
    if (!user) {
      c.status(404);
      return c.json({ message: "User not found" });
    }
    c.header("Cache-Control", "public, max-age=300, s-maxage=300");
    return c.json(user);
  } catch (e) {
    c.status(500);
    return c.json({ message: "Error fetching user" });
  }
});

userRouter.get("/me", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true },
    });

    if (!user) {
      c.status(404);
      return c.json({ message: "User not found" });
    }

    return c.json(user);
  } catch (e) {
    c.status(500);
    return c.json({ message: "Error fetching profile" });
  }
});

userRouter.put(
  "/me",
  authMiddleware,
  validateJson(updateProfileSchema),
  async (c) => {
    const userId = c.get("userId");
    const body = c.req.valid("json");

    const prisma = new PrismaClient({
      datasourceUrl: c.env?.DATABASE_URL,
    }).$extends(withAccelerate());

    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { name: body.name },
        select: { id: true, email: true, name: true },
      });

      return c.json(updatedUser);
    } catch (e) {
      c.status(500);
      return c.json({ message: "Error updating profile" });
    }
  },
);
