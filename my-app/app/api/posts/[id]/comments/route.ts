import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id: postId } = await context.params;

  const supabase = supabaseServer();
  const { content } = await req.json();

  if (!content || content.trim().length === 0)
    return NextResponse.json({ error: "Content required" }, { status: 400 });

  // manually identify user
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "").trim();

  const { data } = await supabase.auth.getUser(token);
  if (!data?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = data.user.id;

  const { error } = await supabase
    .from("comments")
    .insert({ post_id: postId, user_id: userId, content });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // increment comment count
  await supabase
    .from("posts")
    .update({ comment_count: supabase.rpc("increment", { x: 1 }) })
    .eq("id", postId);

  return NextResponse.json({ message: "Comment added" });
}


export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    const { id: postId } = await context.params;
  
    const supabase = supabaseServer();
  
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq("post_id", postId)
      .order("created_at", { ascending: true });
  
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  
    return NextResponse.json({ comments: data });
  }
  