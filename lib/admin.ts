/**
 * Admin access: single fixed account via env ADMIN_EMAIL.
 * Used in middleware and API routes to protect /admin.
 */
const ADMIN_EMAIL = process.env.ADMIN_EMAIL?.trim().toLowerCase();

export function isAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  if (!ADMIN_EMAIL) return false;
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}

export function requireAdmin(): boolean {
  return !!ADMIN_EMAIL;
}
