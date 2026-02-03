import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const headersList = await headers();
  const host = headersList.get("host") ?? "localhost:3000";
  const protocol = headersList.get("x-forwarded-proto") ?? "http";
  const origin = `${protocol}://${host}`;
  return NextResponse.redirect(new URL("/", origin));
}
