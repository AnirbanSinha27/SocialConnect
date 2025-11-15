import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id: postId } = await context.params;

  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  const supabaseAuth = supabaseServer();

  if (!token)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: userData } = await supabaseAuth.auth.getUser(token);
  if (!userData?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = userData.user;
  const supabaseAdmin = supabaseServer(); // service role

  const { content } = await req.json();
  if (!content)
    return NextResponse.json({ error: "Content required" }, { status: 400 });

  // Get post author
  const { data: post } = await supabaseAdmin
    .from("posts")
    .select("author, comment_count")
    .eq("id", postId)
    .single();

  if (!post)
    return NextResponse.json({ error: "Post not found" }, { status: 404 });

  const postAuthor = post.author;

  // Insert comment
  await supabaseAdmin
    .from("comments")
    .insert({ post_id: postId, user_id: user.id, content });

  // Update count
  await supabaseAdmin
    .from("posts")
    .update({ comment_count: (post.comment_count || 0) + 1 })
    .eq("id", postId);

  // 🔔 Insert notification (skip if commenting own post)
  if (user.id !== postAuthor) {
    await supabaseAdmin.from("notifications").insert({
      user_id: postAuthor,
      actor_id: user.id,
      type: "comment",
      post_id: postId
    });
  }

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
  