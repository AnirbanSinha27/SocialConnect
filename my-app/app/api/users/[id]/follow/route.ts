import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

async function getUser(req: Request) {
  const auth = req.headers.get("authorization");
  const token = auth?.replace("Bearer ", "").trim();

  const supabaseForAuth = supabaseServer();

  if (!token) return { user: null, supabase: supabaseForAuth };

  const { data, error } = await supabaseForAuth.auth.getUser(token);

  if (error || !data?.user)
    return { user: null, supabase: supabaseForAuth };

  return {
    user: data.user,
    supabase: supabaseServer(token),
  };
}

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: targetId } = await context.params; // unwrap param

  const { user, supabase } = await getUser(req);

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.id === targetId)
    return NextResponse.json(
      { error: "Can't follow yourself" },
      { status: 400 }
    );

  // Try inserting follow
  const { error } = await supabase
    .from("follows")
    .insert({ follower: user.id, following: targetId });

  // If follow already exists ignore, else return error
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // 🔔 create notification only if:
  // - follow succeeded or already existed
  // - followed user is not the same user (already checked)
  if (targetId !== user.id) {
    const supabaseAdmin = supabaseServer(); // service role to bypass RLS
    await supabaseAdmin.from("notifications").insert({
      user_id: targetId, // the user being followed
      actor_id: user.id, // who followed
      type: "follow",
      post_id: null
    });
  }

  return NextResponse.json({ message: "Followed" });
}


export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id: targetId } = await context.params;

  const { user, supabase } = await getUser(req);

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await supabase
    .from("follows")
    .delete()
    .eq("follower", user.id)
    .eq("following", targetId);

  return NextResponse.json({ message: "Unfollowed" });
}

