// app/api/users/me/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

/**
 * Extract user from request token
 */
async function getUser(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();

  const supabaseForAuth = supabaseServer(); // no token for getUser()

  if (!token) {
    return { user: null, token: null, supabase: supabaseForAuth };
  }

  const { data, error } = await supabaseForAuth.auth.getUser(token);

  if (error || !data?.user) {
    return { user: null, token: null, supabase: supabaseForAuth };
  }

  return {
    user: data.user,
    token,
    supabase: supabaseServer(token), // 🔥 attach JWT here!
  };
}


/**
 * GET: return current user's profile
 */
export async function GET(req: Request) {
  const { user, token, supabase } = await getUser(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({ user: profile });
}


/**
 * PUT: update profile
 */
export async function PUT(req: Request) {
  const { user, token, supabase } = await getUser(req);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json();

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id)
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ user: data });
}
