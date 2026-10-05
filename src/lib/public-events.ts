import "server-only";

import { createSupabaseDatabaseClient } from "@/lib/supabase/database";
import { isDatabaseConfigured } from "@/lib/db";

export interface PublicEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
}

export async function loadPublicEvents(): Promise<
  | { status: "ready"; rows: PublicEvent[] }
  | { status: "not-configured" | "unavailable"; rows: [] }
> {
  if (!isDatabaseConfigured()) return { status: "not-configured", rows: [] };

  try {
    const { data, error } = await createSupabaseDatabaseClient()
      .from("events")
      .select("id,title,description,eventDate:event_date,startTime:start_time,endTime:end_time")
      .eq("published", true)
      .gte("event_date", new Date().toISOString().slice(0, 10))
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true, nullsFirst: false })
      .limit(6);
    if (error) throw error;
    return {
      status: "ready",
      rows: (data ?? []).map((row) => ({
        ...row,
        id: String(row.id),
        eventDate: String(row.eventDate).slice(0, 10),
        startTime: row.startTime ? String(row.startTime).slice(0, 5) : null,
        endTime: row.endTime ? String(row.endTime).slice(0, 5) : null,
      })),
    };
  } catch {
    return { status: "unavailable", rows: [] };
  }
}
