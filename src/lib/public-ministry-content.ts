import "server-only";

import {
  listPublishedCharityProjects,
  listPublishedDevotions,
  listPublishedMinistryMedia,
} from "@/lib/admin-repository";
import { isDatabaseConfigured } from "@/lib/db";
import type {
  CharityProject,
  DailyDevotion,
  MinistryMediaItem,
  PublishedMinistryMediaFilters,
} from "@/lib/admin-types";

type PublicLoadResult<Row> =
  | { status: "ready"; rows: Row[] }
  | { status: "not-configured" | "unavailable"; rows: [] };

async function loadPublished<Row>(query: () => Promise<Row[]>): Promise<PublicLoadResult<Row>> {
  if (!isDatabaseConfigured()) return { status: "not-configured", rows: [] };
  try {
    return { status: "ready", rows: await query() };
  } catch {
    return { status: "unavailable", rows: [] };
  }
}

export function loadPublishedDevotions(): Promise<PublicLoadResult<DailyDevotion>> {
  return loadPublished(listPublishedDevotions);
}

export function loadPublishedMedia(
  filters?: PublishedMinistryMediaFilters,
): Promise<PublicLoadResult<MinistryMediaItem>> {
  return loadPublished(() => listPublishedMinistryMedia(filters));
}

export function loadPublishedCharityProjects(): Promise<PublicLoadResult<CharityProject>> {
  return loadPublished(listPublishedCharityProjects);
}
