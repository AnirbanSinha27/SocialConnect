import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request, { params }: any) {
  const targetId = params.id;
  const supabase = supabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (user.id === targetId)
    return NextResponse.json({ error: "Can't follow yourself" }, { status: 400 });

  const { error } = await supabase
    .from("follows")
    .insert({ follower: user.id, following: targetId });

  if (error && error.code !== "23505") {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: "Followed" });
}

export async function DELETE(req: Request, { params }: any) {
  const targetId = params.id;
  const supabase = supabaseServer();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await supabase
    .from("follows")
    .delete()
    .eq("follower", user.id)
    .eq("following", targetId);

  return NextResponse.json({ message: "Unfollowed" });
}
