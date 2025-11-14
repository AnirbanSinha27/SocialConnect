import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

async function getUser(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  const supabaseAuth = supabaseServer();

  if (!token) return { user: null, supabase: supabaseAuth };

  const { data } = await supabaseAuth.auth.getUser(token);
  if (!data?.user) return { user: null, supabase: supabaseAuth };

  return {
    user: data.user,
    supabase: supabaseServer(token),
  };
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id: postId } = await context.params;
  const { user, supabase } = await getUser(req);

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Check existing post
  const { data: post } = await supabase
    .from("posts")
    .select("like_count")
    .eq("id", postId)
    .single();

  // Insert like
  const { error } = await supabase
    .from("likes")
    .insert({ user_id: user.id, post_id: postId });

  if (error && error.code !== "23505")
    return NextResponse.json({ error: error.message }, { status: 400 });

  // Increment count
  await supabase
    .from("posts")
    .update({ like_count: (post?.like_count || 0) + 1 })
    .eq("id", postId);

  return NextResponse.json({ liked: true });
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id: postId } = await context.params;
  const { user, supabase } = await getUser(req);

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get post
  const { data: post } = await supabase
    .from("posts")
    .select("like_count")
    .eq("id", postId)
    .single();

  // Delete like
  await supabase
    .from("likes")
    .delete()
    .eq("user_id", user.id)
    .eq("post_id", postId);

  // Decrement count safely
  await supabase
    .from("posts")
    .update({ like_count: Math.max((post?.like_count || 0) - 1, 0) })
    .eq("id", postId);

  return NextResponse.json({ liked: false });
}
