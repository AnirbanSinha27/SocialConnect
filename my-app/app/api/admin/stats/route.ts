import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/adminUtil";

export async function GET(req: Request) {
  const admin = await requireAdmin(req);
  if ("error" in admin) return admin.error;

  const supabase = admin.supabase;

  const [users, posts, comments, likes] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("posts").select("*", { count: "exact", head: true }),
    supabase.from("comments").select("*", { count: "exact", head: true }),
    supabase.from("likes").select("*", { count: "exact", head: true }),
  ]);

  return NextResponse.json({
    total_users: users.count ?? 0,
    total_posts: posts.count ?? 0,
    total_comments: comments.count ?? 0,
    total_likes: likes.count ?? 0,
  });
}
