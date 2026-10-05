import "server-only";

import { createSupabaseDatabaseClient } from "@/lib/supabase/database";
import { isDatabaseConfigured } from "@/lib/db";

export interface PublicTestimony {
  id: string;
  displayName: string | null;
  content: string;
  isAnonymous: boolean;
  createdAt: string;
}

export async function loadPublicTestimonies(): Promise<
  | { status: "ready"; rows: PublicTestimony[] }
  | { status: "not-configured" | "unavailable"; rows: [] }
> {
  if (!isDatabaseConfigured()) return { status: "not-configured", rows: [] };

  try {
    const { data, error } = await createSupabaseDatabaseClient().from("testimonies")
      .select("id,displayName:display_name,content,isAnonymous:is_anonymous,createdAt:created_at")
      .eq("moderation_status", "approved")
      .eq("publication_consent", true)
      .eq("published", true)
      .order("created_at", { ascending: false }).limit(100);
    if (error) throw error;
    return {
      status: "ready",
      rows: (data ?? []).map((row) => ({
        id: String(row.id),
        displayName: row.isAnonymous ? null : row.displayName,
        content: row.content,
        isAnonymous: row.isAnonymous,
        createdAt: String(row.createdAt),
      })),
    };
  } catch {
    return { status: "unavailable", rows: [] };
  }
}
