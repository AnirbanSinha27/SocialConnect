import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

/**
 * Extract user from Authorization header
 */
async function getUser(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();

  const supabaseForAuth = supabaseServer(); // no token yet

  if (!token) return { user: null, supabase: supabaseForAuth };

  const { data, error } = await supabaseForAuth.auth.getUser(token);

  if (error || !data?.user) return { user: null, supabase: supabaseForAuth };

  return {
    user: data.user,
    supabase: supabaseServer(token), // attach token for RLS
  };
}

/**
 * POST: Create new post
 */
export async function POST(req: Request) {
  console.log("HEADERS:", Object.fromEntries(req.headers));

  const { user, supabase } = await getUser(req);

  if (!user) {
    console.log("USER IS NULL");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }


  const body = await req.json();

  const { data, error } = await supabase
    .from("posts")
    .insert({
      content: body.content,
      image_url: body.image_url || null,
      category: body.category || "general",
      author: user.id, // IMPORTANT
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ post: data });
}
