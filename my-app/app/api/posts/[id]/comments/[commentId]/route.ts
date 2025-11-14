import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string; commentId: string }> }
) {
  const { id: postId, commentId } = await context.params;

  const supabase = supabaseServer();

  // Read token
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.replace("Bearer ", "").trim();

  // Identify user
  const { data: authData } = await supabase.auth.getUser(token);
  if (!authData?.user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = authData.user.id;

  // Check ownership first (only comment owner can delete)
  const { data: commentRow } = await supabase
    .from("comments")
    .select("user_id")
    .eq("id", commentId)
    .single();

  if (!commentRow)
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });

  if (commentRow.user_id !== userId)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Delete the comment
  const { error } = await supabase
    .from("comments")
    .delete()
    .eq("id", commentId);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  // Decrement comment count
  await supabase
    .from("posts")
    .update({ comment_count: supabase.rpc("decrement", { x: 1 }) })
    .eq("id", postId);

  return NextResponse.json({ message: "Comment deleted" });
}
