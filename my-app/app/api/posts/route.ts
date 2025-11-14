import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

async function getUser(req: Request) {
  const auth = req.headers.get("authorization");
  const token = auth?.replace("Bearer ", "").trim();

  const supabaseForAuth = supabaseServer(); // no token yet

  if (!token) return { user: null, supabase: supabaseForAuth };

  const { data, error } = await supabaseForAuth.auth.getUser(token);

  if (error || !data?.user)
    return { user: null, supabase: supabaseForAuth };

  return {
    user: data.user,
    supabase: supabaseServer(token), // attach token
  };
}

/* -------------------------------------------
   POST /api/posts  (unchanged)
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
   GET /api/posts?page=1&limit=10  
   SHOW ONLY POSTS FROM FOLLOWED USERS
-------------------------------------------- */
export async function GET(req: Request) {
  const supabase = supabaseServer(); // service role

  const url = new URL(req.url);
  const page = Number(url.searchParams.get("page") || "1");
  const limit = Number(url.searchParams.get("limit") || "10");

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Try to read token (if provided)
  const auth = req.headers.get("authorization") ?? "";
  const token = auth.replace("Bearer ", "").trim();

  // Get user if token exists (auth.getUser works with anon/client or service role)
  const { data: authData } = await supabase.auth.getUser(token);
  const userId = authData?.user?.id ?? null;

  // If we have a user, try to fetch their following list
  let followingIds: string[] = [];
  if (userId) {
    const { data: followingRows, error: followErr } = await supabase
      .from("follows")
      .select("following")
      .eq("follower", userId);

    if (followErr) {
      console.error("Error fetching following list:", followErr);
      // fall back to global feed instead of failing
      followingIds = [];
    } else {
      followingIds = followingRows?.map((r) => r.following) ?? [];
    }
  }

  // Helper to fetch posts (global or filtered)
  const fetchPosts = async (filterIds?: string[]) => {
    let query = supabase
      .from("posts")
      .select(
        `
        *,
        profiles:author (
          username,
          avatar_url
        )
      `
      )
      .order("created_at", { ascending: false })
      .range(from, to);

    if (filterIds && filterIds.length > 0) {
      query = query.in("author", filterIds);
    }

    const { data: postData, error: postError } = await query;
    if (postError) {
      console.error("Error fetching posts:", postError);
      throw postError;
    }
    return postData;
  };

  try {
    // If user is present and follows someone -> personalized feed
    if (userId && followingIds.length > 0) {
      const postData = await fetchPosts(followingIds);
      return NextResponse.json({ posts: postData, page, limit });
    }

    // Otherwise -> global feed fallback
    const postData = await fetchPosts();
    return NextResponse.json({ posts: postData, page, limit });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed" }, { status: 500 });
  }
}
