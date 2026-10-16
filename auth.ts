import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "klerek_session";
const MAX_AGE = 60 * 60 * 8;

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 32) throw new Error("SESSION_SECRET harus diatur dan minimal 32 karakter.");
  return value;
}
function signature(payload: string) {
  return createHmac("sha256", secret()).update(payload).digest("hex");
}
export function makeSession() {
  const payload = Buffer.from(JSON.stringify({ exp: Date.now() + MAX_AGE * 1000 })).toString("base64url");
  return `${payload}.${signature(payload)}`;
}
export function verifySession(token: string | undefined) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;
  const [payload, supplied] = parts;
  let expected: string;
  try { expected = signature(payload); } catch { return false; }
  const a = Buffer.from(supplied);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return typeof parsed.exp === "number" && parsed.exp > Date.now();
  } catch { return false; }
}
export async function isLoggedIn() {
  const jar = await cookies();
  return verifySession(jar.get(COOKIE_NAME)?.value);
}
export const sessionCookieName = COOKIE_NAME;
export const sessionMaxAge = MAX_AGE;
