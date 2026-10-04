import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "../types/database"

/**
 * Validates Supabase environment variables and initializes the typed client singleton.
 *
 * Requirements:
 * - VITE_SUPABASE_URL: The HTTPS endpoint of your Supabase project.
 * - VITE_SUPABASE_PUBLISHABLE_KEY: The public/anon publishable key.
 */

const envUrl = (
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL
)?.trim()
const envKey = (
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY
)?.trim()


/**
 * Check whether Supabase has been configured with real credentials
 * (not missing and not the default placeholder text).
 */
export function isSupabaseConfigured(): boolean {
  if (!envUrl || !envKey) return false
  if (
    envUrl.includes("your-project-ref") ||
    envKey.includes("your-anon-publishable-key")
  ) {
    return false
  }
  return true
}

// Validation logging for developer feedback
if (!isSupabaseConfigured()) {
  if (import.meta.env.DEV) {
    console.info(
      "[Supabase] Credentials not yet configured or using placeholder values in .env.local. " +
        "Mock data services will continue to power the UI until real credentials are provided.",
    )
  }
}

// Fallback values prevent module initialization crashes during production builds
const supabaseUrl = envUrl && !envUrl.includes("your-project-ref")
  ? envUrl
  : "https://placeholder-project.supabase.co"

const supabaseAnonKey = envKey && !envKey.includes("your-anon-publishable-key")
  ? envKey
  : "placeholder-anon-key"

/**
 * Reusable typed Supabase client singleton instance.
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)

export default supabase
