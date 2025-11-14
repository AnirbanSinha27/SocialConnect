import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

async function getUser(req: Request) {
  const token = req.headers
    .get("authorization")
    ?.replace("Bearer ", "")
    .trim();

  const supabaseAuth = supabaseServer();

  if (!token) {
    console.log("❌ No token found");
    return { user: null, supabase: supabaseAuth };
  }

  const { data, error } = await supabaseAuth.auth.getUser(token);
  
  if (error) {
    console.log("❌ Auth error:", error);
  }
  
  if (!data?.user) {
    console.log("❌ No user found from token");
    return { user: null, supabase: supabaseAuth };
  }

  console.log("✅ User authenticated:", data.user.id);
  return {
    user: data.user,
    supabase: supabaseServer(token),
  };
}

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id: postId } = await context.params;
  console.log("🔍 Checking like status for post:", postId);

  const token = req.headers
    .get("authorization")
    ?.replace("Bearer ", "")
    .trim();

  const supabaseAuth = supabaseServer();

  if (!token) {
    console.log("❌ User not authenticated, returning liked: false");
    return NextResponse.json({ liked: false }, { status: 200 });
  }

  const { data: userData, error: authError } = await supabaseAuth.auth.getUser(token);
  
  if (authError || !userData?.user) {
    console.log("❌ User not authenticated, returning liked: false");
    return NextResponse.json({ liked: false }, { status: 200 });
  }

  const user = userData.user;
  console.log("✅ User authenticated:", user.id);

  // Use service role WITHOUT token to bypass RLS
  const supabaseAdmin = supabaseServer();
  
  console.log("🔍 Querying likes table for user_id:", user.id, "post_id:", postId);

  const { data, error } = await supabaseAdmin
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  if (error) {
    console.log("❌ Error querying likes:", error);
  }

  console.log("📊 Like data found:", data);
  console.log("✅ Returning liked:", !!data);

  return NextResponse.json({ liked: !!data });
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id: postId } = await context.params;
  
  const token = req.headers
    .get("authorization")
    ?.replace("Bearer ", "")
    .trim();

  const supabaseAuth = supabaseServer();

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: userData, error: authError } = await supabaseAuth.auth.getUser(token);
  
  if (authError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = userData.user;
  const supabaseAdmin = supabaseServer(); // Use service role to bypass RLS

  console.log("👍 Creating like for user:", user.id, "post:", postId);

  // Check if like already exists
  const { data: existingLike } = await supabaseAdmin
    .from("likes")
    .select("id")
    .eq("user_id", user.id)
    .eq("post_id", postId)
    .maybeSingle();

  if (existingLike) {
    console.log("⚠️ Like already exists");
    return NextResponse.json({ liked: true });
  }

  // Check existing post
  const { data: post, error: postError } = await supabaseAdmin
    .from("posts")
    .select("like_count")
    .eq("id", postId)
    .maybeSingle();

  console.log("📝 Current post data:", post);
  console.log("📝 Post fetch error:", postError);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Insert like
  const { error: insertError } = await supabaseAdmin
    .from("likes")
    .insert({ user_id: user.id, post_id: postId });

  console.log("➕ Insert like error:", insertError);

  if (insertError) {
    if (insertError.code === "23505") {
      return NextResponse.json({ liked: true });
    }
    return NextResponse.json({ error: insertError.message }, { status: 400 });
  }

  // Increment count
  const newCount = (post.like_count || 0) + 1;
  console.log("🔢 Updating like_count from", post.like_count, "to", newCount);

  const { data: updatedPost, error: updateError } = await supabaseAdmin
    .from("posts")
    .update({ like_count: newCount })
    .eq("id", postId)
    .select();

  console.log("✅ Update result:", updatedPost);
  console.log("❌ Update error:", updateError);

  if (updateError) {
    console.error("Failed to update like_count:", updateError);
    // Rollback
    await supabaseAdmin
      .from("likes")
      .delete()
      .eq("user_id", user.id)
      .eq("post_id", postId);
    return NextResponse.json({ error: "Failed to update like count" }, { status: 500 });
  }

  return NextResponse.json({ liked: true });
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id: postId } = await context.params;
  
  const token = req.headers
    .get("authorization")
    ?.replace("Bearer ", "")
    .trim();

  const supabaseAuth = supabaseServer();

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: userData, error: authError } = await supabaseAuth.auth.getUser(token);
  
  if (authError || !userData?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = userData.user;
  const supabaseAdmin = supabaseServer(); // Use service role to bypass RLS

  console.log("👎 Deleting like for user:", user.id, "post:", postId);

  // Get post
  const { data: post, error: postError } = await supabaseAdmin
    .from("posts")
    .select("like_count")
    .eq("id", postId)
    .maybeSingle();

  console.log("📝 Current post data:", post);
  console.log("📝 Post fetch error:", postError);

  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  // Delete like
  const { error: deleteError } = await supabaseAdmin
    .from("likes")
    .delete()
    .eq("user_id", user.id)
    .eq("post_id", postId);

  console.log("➖ Delete like error:", deleteError);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 400 });
  }

  // Decrement count safely
  const newCount = Math.max((post.like_count || 0) - 1, 0);
  console.log("🔢 Updating like_count from", post.like_count, "to", newCount);

  const { data: updatedPost, error: updateError } = await supabaseAdmin
    .from("posts")
    .update({ like_count: newCount })
    .eq("id", postId)
    .select();

  console.log("✅ Update result:", updatedPost);
  console.log("❌ Update error:", updateError);

  if (updateError) {
    console.error("Failed to update like_count:", updateError);
    return NextResponse.json({ error: "Failed to update like count" }, { status: 500 });
  }

  return NextResponse.json({ liked: false });
}