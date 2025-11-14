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

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id: targetId } = await context.params;   // 🔥 FIXED unwrap

  const { user, supabase } = await getUser(req);

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.id === targetId)
    return NextResponse.json({ error: "Can't follow yourself" }, { status: 400 });

  const { error } = await supabase
    .from("follows")
    .insert({ follower: user.id, following: targetId });

  if (error && error.code !== "23505")
    return NextResponse.json({ error: error.message }, { status: 400 });

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

