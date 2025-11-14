import { supabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";

export async function requireAdmin(req: Request) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();

  if (!token) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  const supabaseAuth = supabaseServer();
  const { data } = await supabaseAuth.auth.getUser(token);

  if (!data?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  // CHECK ROLE
  if (data.user.user_metadata.role !== "admin") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  return {
    user: data.user,
    supabase: supabaseServer(), // service role
  };
}
