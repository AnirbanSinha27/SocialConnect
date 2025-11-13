import { createClient } from "@supabase/supabase-js";

export function getSupabaseClient() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,  // ✅ allow session
        autoRefreshToken: true,
      },
    }
  );

  // Load token into Supabase client
  if (typeof window !== "undefined") {
    const access_token = localStorage.getItem("access_token");
    const refresh_token = localStorage.getItem("refresh_token");

    if (access_token && refresh_token) {
      supabase.auth.setSession({
        access_token,
        refresh_token,
      });
    }
  }

  return supabase;
}
