import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  const token = req.headers.get("authorization")?.replace("Bearer ", "").trim();
  const supabaseAuth = supabaseServer();

  if (!token) return NextResponse.json({ liked: false });

  const { data: authData, error: authError } = await supabaseAuth.auth.getUser(token);
  if (authError || !authData?.user) return NextResponse.json({ liked: false });

  const supabase = supabaseServer(token);

  const { data, error, count } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("user_id", authData.user.id)
    .eq("post_id", id);

  if (error) {
    console.error("Error checking like status:", error);
    return NextResponse.json({ liked: false });
  }

  return NextResponse.json({ liked: (count ?? 0) > 0 });
}
