import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

async function getUser(req: Request) {
  const auth = req.headers.get("authorization");
  const token = auth?.replace("Bearer ", "").trim();

  const supabaseForAuth = supabaseServer(); // no auth yet

  if (!token) return { user: null, supabase: supabaseForAuth };

  const { data, error } = await supabaseForAuth.auth.getUser(token);

  if (error || !data?.user)
    return { user: null, supabase: supabaseForAuth };

  return {
    user: data.user,
    supabase: supabaseServer(token), // 🔥 attach token for RLS
  };
}

/* -------------------------------------------
   POST /api/posts → Create a Post (Keep Same)
-------------------------------------------- */
export async function POST(req: Request) {
  const { user, supabase } = await getUser(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { content, image_url, category } = body;

  if (!content || content.length > 280) {
    return NextResponse.json(
      { error: "Content must be <= 280 chars" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      content,
      image_url,
      author: user.id,
      category: category || "general",
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ post: data });
}

/* -------------------------------------------
   GET /api/posts?page=1&limit=10  (Pagination)
-------------------------------------------- */
export async function GET(req: Request) {
  const supabase = supabaseServer(); // service role → bypass RLS

  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") || "1");
  const limit = Number(url.searchParams.get("limit") || "10");

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error } = await supabase
    .from("posts")
    .select(`
      *,
      profiles:author (
        username,
        avatar_url
      )
    `)
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    posts: data,
    page,
    limit,
  });
}
