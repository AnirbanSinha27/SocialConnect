import { createClient } from "@supabase/supabase-js";

export function supabaseServer(token?: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  if (token) {
    supabase.auth.setSession({
      access_token: token,
      refresh_token: token, // not used, but required by type
    });
  }

  return supabase;
}
