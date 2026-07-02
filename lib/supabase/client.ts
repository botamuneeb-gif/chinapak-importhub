import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

type BrowserSupabaseClient = SupabaseClient<Database>;

declare global {
  var __chinapakSupabaseBrowserClient: BrowserSupabaseClient | undefined;
}

function getBrowserSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return { supabaseAnonKey, supabaseUrl };
}

export function createBrowserSupabaseClient() {
  if (globalThis.__chinapakSupabaseBrowserClient) {
    return globalThis.__chinapakSupabaseBrowserClient;
  }

  const { supabaseAnonKey, supabaseUrl } = getBrowserSupabaseEnv();

  globalThis.__chinapakSupabaseBrowserClient = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    },
  );

  return globalThis.__chinapakSupabaseBrowserClient;
}
