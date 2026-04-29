import { zValidator } from "@hono/zod-validator";
import type { ZodSchema } from "zod";

export const validateJson = <T extends ZodSchema>(schema: T) =>
  zValidator("json", schema, (result, c) => {
    if (!result.success) {
      const first = result.error.issues[0];
      const message = first ? first.message : "Invalid request body";
      c.status(400);
      return c.json({ message });
    }
  });
