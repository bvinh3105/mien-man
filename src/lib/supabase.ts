import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

let _supabase: SupabaseClient<Database> | null = null;
let _configured = false;

/**
 * Trả về true nếu Supabase env vars đã được cấu hình.
 * An toàn gọi ở mọi nơi — không throw.
 */
export function isSupabaseConfigured(): boolean {
  if (_configured) return true;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  _configured = !!(url && key && url !== "your-project-url-here");
  return _configured;
}

/**
 * Trả về Supabase client. Throw nếu chưa config.
 * Dùng isSupabaseConfigured() trước nếu cần an toàn.
 */
export function getSupabase(): SupabaseClient<Database> {
  if (_supabase) return _supabase;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key || url === "your-project-url-here") {
    throw new Error(
      "Supabase chưa được cấu hình. Vui lòng cập nhật NEXT_PUBLIC_SUPABASE_URL và NEXT_PUBLIC_SUPABASE_ANON_KEY trong .env.local"
    );
  }

  _supabase = createClient<Database>(url, key);
  return _supabase;
}

/**
 * Trả về Supabase client hoặc null nếu chưa config.
 * An toàn dùng trong useEffect / handlers — không crash app.
 */
export function getSupabaseSafe(): SupabaseClient<Database> | null {
  if (_supabase) return _supabase;
  if (!isSupabaseConfigured()) return null;
  try {
    return getSupabase();
  } catch {
    return null;
  }
}

// Lazy getter — safe to import at module level, only crashes when actually called
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_target, prop) {
    return (getSupabase() as unknown as Record<string | symbol, unknown>)[prop];
  },
});
