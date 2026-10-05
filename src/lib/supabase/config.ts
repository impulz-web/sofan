export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return url && anonKey ? { url, anonKey } : null;
}

export function isSupabaseAdminAuthConfigured() {
  return Boolean(getSupabasePublicConfig());
}

export function getSupabaseDatabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !serviceRoleKey) return null;
  return { url, serviceRoleKey };
}

export function getSupabaseStorageConfig() {
  const config = getSupabaseDatabaseConfig();
  if (!config) return null;
  return {
    ...config,
    bucket: process.env.SUPABASE_PRAYER_AUDIO_BUCKET?.trim() || "prayer-request-audio",
  };
}
