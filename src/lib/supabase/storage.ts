import "server-only";

import { createClient } from "@supabase/supabase-js";
import { getSupabaseStorageConfig } from "./config";

export function createSupabaseStorageAdminClient() {
  const config = getSupabaseStorageConfig();
  if (!config) {
    throw new Error("Supabase Storage requires the project URL, anon key, and service role key.");
  }

  return createClient(config.url, config.serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }).storage.from(config.bucket);
}

export function isSupabaseStorageConfigured() {
  return Boolean(getSupabaseStorageConfig());
}
