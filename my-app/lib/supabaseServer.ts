import { createClient } from "@supabase/supabase-js";

export function supabaseServer(token?: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // ✅ use service role key
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      global: {
        headers: token
          ? { Authorization: `Bearer ${token}` }
          : {},
      },
    }
  );

  return supabase;
}
