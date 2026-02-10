import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

/**
 * Admin access: any logged-in user who knows ADMIN_PASSWORD can access /admin.
 * Session is stored in a signed cookie after password verification.
 */

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "";
const COOKIE_NAME = "admin_session";
const COOKIE_MAX_AGE_SEC = 60 * 60 * 24; // 24 hours

function getSigningSecret(): string {
  const secret = process.env.SUPABASE_SECRET_KEY ?? process.env.ADMIN_PASSWORD ?? "";
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", getSigningSecret()).update(payload).digest("base64url");
}

export function verifyAdminPassword(password: string): boolean {
  if (!ADMIN_PASSWORD) return false;
  const a = Buffer.from(ADMIN_PASSWORD, "utf8");
  const b = Buffer.from(password, "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function createAdminSessionCookie(): { name: string; value: string; options: { httpOnly: true; secure: boolean; sameSite: "lax"; path: string; maxAge: number } } {
  const expiry = Math.floor(Date.now() / 1000) + COOKIE_MAX_AGE_SEC;
  const payload = `${expiry}`;
  const value = `${payload}.${sign(payload)}`;
  return {
    name: COOKIE_NAME,
    value,
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: COOKIE_MAX_AGE_SEC,
    },
  };
}

export function verifyAdminSessionCookie(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  const parts = cookieValue.split(".");
  if (parts.length !== 2) return false;
  const [payload, sig] = parts;
  const expectedSig = sign(payload);
  const a = Buffer.from(sig, "base64url");
  const b = Buffer.from(expectedSig, "base64url");
  if (a.length !== b.length) return false;
  if (!timingSafeEqual(a, b)) return false;
  const expiry = parseInt(payload, 10);
  if (Number.isNaN(expiry) || expiry < Math.floor(Date.now() / 1000)) return false;
  return true;
}

/** Use in Server Components / server code: reads cookie from next/headers. */
export async function hasAdminSession(): Promise<boolean> {
  const store = await cookies();
  const value = store.get(COOKIE_NAME)?.value;
  return verifyAdminSessionCookie(value);
}

/** Use in Route Handlers: pass the request or cookie header. */
export function hasAdminSessionFromRequest(request: Request): boolean {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const match = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const value = match?.[1]?.trim();
  return verifyAdminSessionCookie(value);
}

export function getAdminSessionCookieName(): string {
  return COOKIE_NAME;
}

export function requireAdmin(): boolean {
  return !!ADMIN_PASSWORD;
}
