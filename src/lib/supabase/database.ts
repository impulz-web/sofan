import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseDatabaseConfig } from "./config";

export function isSupabaseDatabaseConfigured() {
  return Boolean(getSupabaseDatabaseConfig());
}

export function createSupabaseDatabaseClient() {
  const config = getSupabaseDatabaseConfig();
  if (!config) throw new Error("Supabase database access is not configured.");

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
