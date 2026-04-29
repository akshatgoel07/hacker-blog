import { describe, it, expect } from "vitest";
import { hashPassword, isHashed, verifyPassword } from "./password";

describe("password.ts", () => {
  describe("hashPassword", () => {
    it("returns a value with the pbkdf2$ prefix and four parts", async () => {
      const h = await hashPassword("hunter2");
      expect(h.startsWith("pbkdf2$100000$")).toBe(true);
      expect(h.split("$")).toHaveLength(4);
    });

    it("produces a unique salt per call (same password ≠ same hash)", async () => {
      const a = await hashPassword("same");
      const b = await hashPassword("same");
      expect(a).not.toBe(b);
    });
  });

  describe("isHashed", () => {
    it("returns true for a hashed value", async () => {
      const h = await hashPassword("x");
      expect(isHashed(h)).toBe(true);
    });

    it("returns false for plain strings (legacy plaintext rows)", () => {
      expect(isHashed("plain")).toBe(false);
      expect(isHashed("akshatgoel")).toBe(false);
      expect(isHashed("")).toBe(false);
    });
  });

  describe("verifyPassword", () => {
    it("matches a hashed password against the right input", async () => {
      const h = await hashPassword("hunter2");
      expect(await verifyPassword("hunter2", h)).toBe(true);
    });

    it("rejects a hashed password against the wrong input", async () => {
      const h = await hashPassword("hunter2");
      expect(await verifyPassword("wrong", h)).toBe(false);
    });

    it("matches a legacy plaintext stored value (back-compat)", async () => {
      expect(await verifyPassword("akshatgoel", "akshatgoel")).toBe(true);
    });

    it("rejects a legacy plaintext mismatch", async () => {
      expect(await verifyPassword("nope", "akshatgoel")).toBe(false);
    });

    it("returns false for malformed hash strings", async () => {
      expect(await verifyPassword("x", "pbkdf2$bad")).toBe(false);
      expect(await verifyPassword("x", "pbkdf2$1$2")).toBe(false);
    });

    it("returns false when the iteration count is below the safety floor", async () => {
      // hand-crafted "valid"-looking hash with iter=10 (< 1000 floor)
      const h = await hashPassword("hunter2");
      const tampered = h.replace(/^pbkdf2\$\d+/, "pbkdf2$10");
      expect(await verifyPassword("hunter2", tampered)).toBe(false);
    });
  });
});
