import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const supabase = supabaseServer();

  // First authenticate with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const user = data.user;

  // Now check role in profiles table
  const adminClient = supabaseServer(); // service-role
  const { data: profile } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // If user role is deactivated → block login
  if (profile?.role === "deactivated") {
    return NextResponse.json(
      { error: "Account deactivated. Contact admin." },
      { status: 403 }
    );
  }

  return NextResponse.json({
    user: data.user,
    session: data.session,
  });
}
