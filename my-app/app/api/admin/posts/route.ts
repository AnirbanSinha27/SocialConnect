import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminUtil";

export async function GET(req: Request) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  const { data, error } = await admin.supabase
    .from("posts")
    .select("*, profiles(username, avatar_url)")
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ posts: data });
}
