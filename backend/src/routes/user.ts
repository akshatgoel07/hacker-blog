import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { decode, sign, verify } from "hono/jwt";
import { signupInput, signinInput } from "@100xdevs/medium-common";
import { authMiddleware } from "../middleware/middleware";

export const userRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: string;
  };
}>();

// Define Authentication Middleware

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

// Apply middleware specifically to routes that need it
userRouter.get("/me", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      c.status(404);
      return c.json({ message: "User not found" });
    }

    return c.json(user);
  } catch (e) {
    console.error("Error fetching user profile:", e);
    c.status(500);
    return c.json({ message: "Error fetching profile" });
  }
});

// Apply middleware specifically to routes that need it
userRouter.put("/me", authMiddleware, async (c) => {
  const userId = c.get("userId");
  const body = await c.req.json();

  // Validate input
  if (
    !body.name ||
    typeof body.name !== "string" ||
    body.name.trim().length === 0
  ) {
    c.status(400);
    return c.json({ message: "Name is required and cannot be empty" });
  }

  const prisma = new PrismaClient({
    datasourceUrl: c.env?.DATABASE_URL,
  }).$extends(withAccelerate());

  try {
    const updatedUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: body.name.trim(), // Update the name
      },
      select: {
        // Return updated profile info (excluding password)
        id: true,
        email: true,
        name: true,
      },
    });

    return c.json(updatedUser);
  } catch (e) {
    console.error("Error updating user profile:", e);
    c.status(500);
    return c.json({ message: "Error updating profile" });
  }
});
