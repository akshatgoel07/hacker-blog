import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";
import { signupInput, signinInput } from "@100xdevs/medium-common";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

userRouter.post("/signup", async (c) => {
  const body = await c.req.json();

  // Input validation
  if (!body.email || !body.password || !body.username) {
    c.status(400);
    return c.json({
      message: "All fields are required: email, password, and username",
    });
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    c.status(400);
    return c.json({
      message: "Invalid email format",
    });
  }

  // Password strength check
  if (body.password.length < 6) {
    c.status(400);
    return c.json({
      message: "Password must be at least 6 characters long",
    });
  }

  // Username validation
  if (body.username.length < 3) {
    c.status(400);
    return c.json({
      message: "Username must be at least 3 characters long",
    });
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.create({
      data: {
        name: body.username,
        password: body.password,
        email: body.email,
      },
    });
    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json(token);
  } catch (e) {
    console.log(e);
    c.status(411);
    return c.json({
      message: "Error creating user. Email might already be registered.",
    });
  }
});

userRouter.post("/signin", async (c) => {
  const body = await c.req.json();

  // Input validation
  if (!body.email || !body.password) {
    c.status(400);
    return c.json({
      message: "Email and password are required",
    });
  }

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    c.status(400);
    return c.json({
      message: "Invalid email format",
    });
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (!user) {
      c.status(401);
      return c.json({ message: "Invalid credentials" });
    }

    // Add password verification
    if (user.password !== body.password) {
      c.status(401);
      return c.json({ message: "Invalid credentials" });
    }

    const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json(jwt);
  } catch (e) {
    c.status(500);
    return c.json({ message: "Internal server error" });
  }
});
