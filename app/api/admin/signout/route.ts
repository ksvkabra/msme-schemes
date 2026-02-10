import { getAdminSessionCookieName } from "@/lib/admin";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST() {
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const origin = `${protocol}://${host}`;
  const res = NextResponse.redirect(new URL("/admin/login", origin));
  res.cookies.set(getAdminSessionCookieName(), "", { path: "/", maxAge: 0 });
  return res;
}
