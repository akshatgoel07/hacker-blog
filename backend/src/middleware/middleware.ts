import { verify } from "hono/jwt";

export const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header("authorization") || "";
  try {
    const user = await verify(authHeader, c.env.JWT_SECRET);
    if (user && typeof user.id === "string") {
      c.set("userId", user.id);
      await next();
    } else {
      c.status(403);
      return c.json({ message: "You are not logged in or token is invalid" });
    }
  } catch (e) {
    c.status(403);
    return c.json({ message: "Authentication failed" });
  }
};
