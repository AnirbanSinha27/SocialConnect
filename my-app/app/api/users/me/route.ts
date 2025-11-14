// app/api/users/me/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

async function getUser(req: Request) {
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.replace("Bearer ", "").trim();

  const supabaseForAuth = supabaseServer();

  if (!token) return { user: null, supabase: supabaseForAuth, token: null };

  const { data, error } = await supabaseForAuth.auth.getUser(token);

  if (error || !data?.user)
    return { user: null, supabase: supabaseForAuth, token: null };

  return {
    user: data.user,
    token,
    supabase: supabaseServer(token),
  };
}

export async function GET(req: Request) {
  const { user, supabase } = await getUser(req);

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return NextResponse.json({ user: profile });
}

export async function PUT(req: Request) {
  const { user, supabase } = await getUser(req);

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = await req.json();

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", user.id)
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ user: data });
}
