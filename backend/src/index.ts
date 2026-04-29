import { Hono } from "hono";
import { cors } from "hono/cors";
import { bookRouter } from "./routes/blog";
import { userRouter } from "./routes/user";

type Bindings = {
  DATABASE_URL: string;
  JWT_SECRET: string;
  ALLOWED_ORIGINS?: string;
};

const DEFAULT_ALLOWED_ORIGINS = ["http://localhost:5173"];

const parseOrigins = (raw?: string): string[] =>
  raw
    ? raw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : DEFAULT_ALLOWED_ORIGINS;

const app = new Hono<{ Bindings: Bindings }>();

app.use("/api/*", async (c, next) => {
  const allowed = parseOrigins(c.env.ALLOWED_ORIGINS);
  return cors({
    origin: (origin) => (allowed.includes(origin) ? origin : null),
    allowHeaders: ["Authorization", "Content-Type"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: false,
    maxAge: 600,
  })(c, next);
});

app.route("/api/v1/blog", bookRouter);
app.route("/api/v1/user", userRouter);

export default app;
