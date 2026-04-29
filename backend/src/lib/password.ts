const ITERATIONS = 100_000;
const KEY_LEN_BITS = 256;
const SALT_BYTES = 16;
const SCHEME = "pbkdf2";

const enc = new TextEncoder();

const toBase64 = (bytes: ArrayBuffer | Uint8Array): string => {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let bin = "";
  for (let i = 0; i < view.length; i++) bin += String.fromCharCode(view[i]);
  return btoa(bin);
};

const fromBase64 = (b64: string): Uint8Array => {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
};

const constantTimeEqual = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
};

const deriveBits = async (
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> => {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    key,
    KEY_LEN_BITS,
  );
  return new Uint8Array(bits);
};

export const hashPassword = async (password: string): Promise<string> => {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_BYTES));
  const hash = await deriveBits(password, salt, ITERATIONS);
  return `${SCHEME}$${ITERATIONS}$${toBase64(salt)}$${toBase64(hash)}`;
};

export const isHashed = (stored: string): boolean =>
  stored.startsWith(`${SCHEME}$`);

export const verifyPassword = async (
  password: string,
  stored: string,
): Promise<boolean> => {
  if (!isHashed(stored)) {
    return password === stored;
  }
  const parts = stored.split("$");
  if (parts.length !== 4) return false;
  const [, iterStr, saltB64, hashB64] = parts;
  const iterations = Number(iterStr);
  if (!Number.isFinite(iterations) || iterations < 1000) return false;
  const salt = fromBase64(saltB64);
  const expected = fromBase64(hashB64);
  const actual = await deriveBits(password, salt, iterations);
  return constantTimeEqual(actual, expected);
};
