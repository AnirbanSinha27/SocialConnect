import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function requireAdmin(req: Request) {
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "").trim();

  if (!token) {
    return { ok: false, error: "No token" };
  }

  // Authenticate using service role
  const supabase = supabaseServer();
  const { data: auth } = await supabase.auth.getUser(token);

  if (!auth?.user) {
    return { ok: false, error: "Unauthorized" };
  }

  // Fetch profile (contains role)
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", auth.user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { ok: false, error: "Forbidden" };
  }

  return { ok: true, userId: auth.user.id };
}
