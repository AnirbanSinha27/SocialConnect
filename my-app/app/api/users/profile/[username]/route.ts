import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request, context: { params: Promise<{ username: string }> }) {
  const { username } = await context.params;

  const supabase = supabaseServer();

  // Get user profile by username
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .maybeSingle();

  if (!profile) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // followers count
  const { count: followers } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("following", profile.id);

  // following count
  const { count: following } = await supabase
    .from("follows")
    .select("*", { count: "exact", head: true })
    .eq("follower", profile.id);

  return NextResponse.json({
    profile,
    stats: {
      followers,
      following,
    }
  });
}
