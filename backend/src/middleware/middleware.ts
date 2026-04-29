import { verify } from "hono/jwt";

export const authMiddleware = async (c: any, next: any) => {
  const header = c.req.header("authorization") || c.req.header("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;
  if (!token) {
    c.status(401);
    return c.json({ message: "Authentication required" });
  }
  try {
    const user = await verify(token, c.env.JWT_SECRET, "HS256");
    if (user && typeof (user as any).id === "string") {
      c.set("userId", (user as any).id);
      await next();
    } else {
      c.status(401);
      return c.json({ message: "Invalid token" });
    }
  } catch (e) {
    c.status(401);
    return c.json({ message: "Invalid or expired token" });
  }
};
