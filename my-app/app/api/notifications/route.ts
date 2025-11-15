import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request) {
  // Extract token
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();

  const supabaseAuth = supabaseServer();

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Validate user
  const { data: userData, error } = await supabaseAuth.auth.getUser(token);

  if (error || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = userData.user;

  // Use admin client for RLS bypass
  const supabaseAdmin = supabaseServer();

  // Fetch notifications for logged-in user
  const { data: notifications, error: notifErr } = await supabaseAdmin
    .from("notifications")
    .select(
      `
        *,
        actor:actor_id (
          username,
          avatar_url
        )
      `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (notifErr) {
    return NextResponse.json({ error: notifErr.message }, { status: 400 });
  }

  return NextResponse.json({ notifications });
}
