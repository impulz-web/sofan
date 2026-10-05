import { isSupabaseDatabaseConfigured } from "@/lib/supabase/database";

export function isDatabaseConfigured() {
  return isSupabaseDatabaseConfigured();
}
