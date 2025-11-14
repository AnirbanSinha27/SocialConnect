import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";


// Extract user (for POST)
async function getUser(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();

  const supabaseForAuth = supabaseServer();

  if (!token) return { user: null, supabase: supabaseForAuth };

  const { data, error } = await supabaseForAuth.auth.getUser(token);

  if (error || !data?.user) return { user: null, supabase: supabaseForAuth };

  return {
    user: data.user,
    supabase: supabaseServer(token), 
  };
}

// POST — create post
export async function POST(req: Request) {
  const { user, supabase } = await getUser(req);

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();

  const { data, error } = await supabase
    .from("posts")
    .insert({
      content: body.content,
      image_url: body.image_url || null,
      category: body.category || "general",
      author: user.id,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ post: data });
}

// GET — fetch single post
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const supabase = supabaseServer();

  const { data, error } = await supabase
    .from("posts")
    .select("*, profiles(username, avatar_url)")
    .eq("id", id)
    .maybeSingle();

  if (!data) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  return NextResponse.json({ post: data });
}

export async function PUT(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { user } = await getUser(req); // FIXED

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = supabaseServer();
  const { content, image_url, category } = await req.json();

  // Ensure user owns the post
  const { data: existing } = await supabase
    .from("posts")
    .select("author")
    .eq("id", id)
    .single();

  if (!existing || existing.author !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Update post
  const { error } = await supabase
    .from("posts")
    .update({
      content,
      image_url,
      category,
      updated_at: new Date(),
    })
    .eq("id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ message: "Post updated" });
}


/* ------------------------------------
   DELETE POST (DELETE /api/posts/:id)
------------------------------------ */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const { user } = await getUser(req); // FIXED

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = supabaseServer();

  // Ownership check
  const { data: existing } = await supabase
    .from("posts")
    .select("author")
    .eq("id", id)
    .single();

  if (!existing || existing.author !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { error } = await supabase
    .from("posts")
    .delete()
    .eq("id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ message: "Post deleted" });
}

