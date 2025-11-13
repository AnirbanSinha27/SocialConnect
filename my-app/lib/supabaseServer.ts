import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export function supabaseServer() {
  const cookieStore = cookies();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, 
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}
