import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, username, first_name, last_name } = body;

  const supabase = supabaseServer();

  // 1. Create auth user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // 2. Update profile
  await supabase.from("profiles").update({
    username,
    first_name,
    last_name,
  }).eq("id", data.user?.id);

  return NextResponse.json({
    message: "User registered successfully",
  });
}
