import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const supabase = supabaseServer();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return NextResponse.json({ user: profile });
}


export async function PUT(req: Request) {
    const body = await req.json();
    const supabase = supabaseServer();
  
    const { data: { user } } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
    const { data, error } = await supabase
      .from("profiles")
      .update(body)
      .eq("id", user.id)
      .select()
      .single();
  
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  
    return NextResponse.json({ user: data });
  }