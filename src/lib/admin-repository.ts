import "server-only";

import { createSupabaseDatabaseClient } from "@/lib/supabase/database";
import type {
  AdminEvent,
  AdminSnapshot,
  CharityProject,
  CharityProjectInput,
  CreatePrayerRequestInput,
  DailyDevotion,
  DailyDevotionInput,
  FinanceFilter,
  FinanceSummary,
  FinanceTransaction,
  MinistryMediaInput,
  MinistryMediaItem,
  PublishedMinistryMediaFilters,
  NewsArticle,
  PrayerRequest,
  PrayerStatus,
  Testimony,
  TestimonyModerationStatus,
  TestimonySubmission,
} from "@/lib/admin-types";

const emptySummary: FinanceSummary = {
  totalReceived: "0.00",
  tithes: "0.00",
  offerings: "0.00",
  donations: "0.00",
};

function emptySnapshot(databaseStatus: AdminSnapshot["databaseStatus"]): AdminSnapshot {
  return {
    databaseStatus,
    summary: emptySummary,
    newPrayerRequestCount: null,
    transactions: [],
    news: [],
    events: [],
    recentNews: [],
    upcomingEvents: [],
  };
}

function fail(error: { message: string }) {
  throw new Error(error.message);
}

function mapFinance(row: Record<string, unknown>): FinanceTransaction {
  return {
    id: String(row.id),
    type: row.type as FinanceTransaction["type"],
    amount: String(row.amount),
    currency: String(row.currency).trim(),
    paymentMethod: String(row.paymentMethod),
    reference: row.reference as string | null,
    donorName: row.donorName as string | null,
    phone: row.phone as string | null,
    notes: row.notes as string | null,
    transactionDate: String(row.transactionDate).slice(0, 10),
    createdAt: String(row.createdAt),
  };
}

function mapNews(row: Record<string, unknown>): NewsArticle {
  return {
    id: String(row.id),
    title: String(row.title),
    content: String(row.content),
    imageUrl: row.imageUrl as string | null,
    published: Boolean(row.published),
    createdAt: String(row.createdAt),
  };
}

function mapEvent(row: Record<string, unknown>): AdminEvent {
  return {
    id: String(row.id),
    title: String(row.title),
    description: String(row.description),
    eventDate: String(row.eventDate).slice(0, 10),
    startTime: row.startTime ? String(row.startTime).slice(0, 5) : null,
    endTime: row.endTime ? String(row.endTime).slice(0, 5) : null,
    location: row.location as string | null,
    imageUrl: row.imageUrl as string | null,
    published: Boolean(row.published),
    createdAt: String(row.createdAt),
  };
}

function mapPrayerRequest(row: Record<string, unknown>): PrayerRequest {
  return {
    id: String(row.id),
    name: row.isAnonymous ? null : row.name as string | null,
    phone: row.phone as string | null,
    contactEmail: row.contactEmail as string | null,
    requestText: row.requestText as string | null,
    isAnonymous: Boolean(row.isAnonymous),
    isPrivate: Boolean(row.isPrivate),
    hasAudio: Boolean(row.audioPath),
    audioDuration: row.audioDuration === null ? null : Number(row.audioDuration),
    audioMimeType: row.audioMimeType as string | null,
    audioSize: row.audioSize === null ? null : String(row.audioSize),
    status: row.status as PrayerStatus,
    createdAt: String(row.createdAt),
  };
}

function mapTestimony(row: Record<string, unknown>): Testimony {
  return {
    id: String(row.id),
    displayName: row.isAnonymous ? null : row.displayName as string | null,
    email: row.email as string | null,
    phone: row.phone as string | null,
    content: String(row.content),
    isAnonymous: Boolean(row.isAnonymous),
    publicationConsent: Boolean(row.publicationConsent),
    moderationStatus: row.moderationStatus as Testimony["moderationStatus"],
    published: Boolean(row.published),
    createdAt: String(row.createdAt),
  };
}

function mapDevotion(row: Record<string, unknown>): DailyDevotion {
  return {
    id: String(row.id),
    title: String(row.title),
    scripture: String(row.scripture),
    message: String(row.message),
    prayer: String(row.prayer),
    devotionDate: String(row.devotionDate).slice(0, 10),
    imageUrl: row.imageUrl as string | null,
    videoUrl: row.videoUrl as string | null,
    published: Boolean(row.published),
    createdAt: String(row.createdAt),
  };
}

function mapMedia(row: Record<string, unknown>): MinistryMediaItem {
  return {
    id: String(row.id),
    kind: row.kind as MinistryMediaItem["kind"],
    category: row.category as string | null,
    title: String(row.title),
    description: String(row.description),
    speaker: row.speaker as string | null,
    mediaDate: row.mediaDate ? String(row.mediaDate).slice(0, 10) : null,
    scripture: row.scripture as string | null,
    videoUrl: String(row.videoUrl),
    thumbnailUrl: row.thumbnailUrl as string | null,
    published: Boolean(row.published),
    createdAt: String(row.createdAt),
  };
}

function mapProject(row: Record<string, unknown>): CharityProject {
  return {
    id: String(row.id),
    title: String(row.title),
    category: String(row.category),
    description: String(row.description),
    imageUrl: String(row.imageUrl),
    supportContact: row.supportContact as string | null,
    supportCta: row.supportCta as string | null,
    published: Boolean(row.published),
    createdAt: String(row.createdAt),
  };
}

export async function loadAdminSnapshot(): Promise<AdminSnapshot> {
  try {
    const client = createSupabaseDatabaseClient();
    const [finance, news, events, recentNews, upcomingEvents, prayerCount, summary] = await Promise.all([
      client.from("finance_transactions")
        .select("id,type,amount,currency,paymentMethod:payment_method,reference,donorName:donor_name,phone,notes,transactionDate:transaction_date,createdAt:created_at")
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(100),
      client.from("news")
        .select("id,title,content,imageUrl:image_url,published,createdAt:created_at")
        .order("created_at", { ascending: false })
        .limit(200),
      client.from("events")
        .select("id,title,description,eventDate:event_date,startTime:start_time,endTime:end_time,location,imageUrl:image_url,published,createdAt:created_at")
        .order("event_date", { ascending: true })
        .order("start_time", { ascending: true })
        .order("created_at", { ascending: false })
        .limit(200),
      client.from("news")
        .select("id,title,content,imageUrl:image_url,published,createdAt:created_at")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(4),
      client.from("events")
        .select("id,title,description,eventDate:event_date,startTime:start_time,endTime:end_time,location,imageUrl:image_url,published,createdAt:created_at")
        .eq("published", true)
        .gte("event_date", new Date().toISOString().slice(0, 10))
        .order("event_date", { ascending: true })
        .order("start_time", { ascending: true })
        .limit(4),
      client.from("prayer_requests").select("id", { count: "exact", head: true }).eq("status", "new_request"),
      client.rpc("get_finance_summary"),
    ]);

    for (const result of [finance, news, events, recentNews, upcomingEvents, prayerCount, summary]) {
      if (result.error) fail(result.error);
    }

    const rows = (finance.data ?? []).map((row) => row as unknown as Record<string, unknown>);
    const rpcSummary = summary.data?.[0];
    if (!rpcSummary) throw new Error("Supabase returned no finance summary.");

    return {
      databaseStatus: "connected",
      summary: {
        totalReceived: String(rpcSummary.total_received),
        tithes: String(rpcSummary.tithes),
        offerings: String(rpcSummary.offerings),
        donations: String(rpcSummary.donations),
      },
      newPrayerRequestCount: String(prayerCount.count ?? 0),
      transactions: rows.map(mapFinance),
      news: (news.data ?? []).map((row) => mapNews(row as unknown as Record<string, unknown>)),
      events: (events.data ?? []).map((row) => mapEvent(row as unknown as Record<string, unknown>)),
      recentNews: (recentNews.data ?? []).map((row) => mapNews(row as unknown as Record<string, unknown>)),
      upcomingEvents: (upcomingEvents.data ?? []).map((row) => mapEvent(row as unknown as Record<string, unknown>)),
    };
  } catch (error) {
    console.error("Could not load the Supabase admin snapshot.", error);
    return emptySnapshot("unavailable");
  }
}

export async function listFinanceTransactions(filters: { type: FinanceFilter; from: string; to: string }) {
  const client = createSupabaseDatabaseClient();
  let query = client.from("finance_transactions")
    .select("id,type,amount,currency,paymentMethod:payment_method,reference,donorName:donor_name,phone,notes,transactionDate:transaction_date,createdAt:created_at")
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(500);
  if (filters.type !== "all") query = query.eq("type", filters.type);
  if (filters.from) query = query.gte("transaction_date", filters.from);
  if (filters.to) query = query.lte("transaction_date", filters.to);
  const { data, error } = await query;
  if (error) fail(error);
  return (data ?? []).map((row) => mapFinance(row as unknown as Record<string, unknown>));
}

export async function saveFinanceTransaction(values: Record<string, unknown>, id?: string) {
  const client = createSupabaseDatabaseClient();
  const result = id
    ? await client.from("finance_transactions").update(values).eq("id", id).select("id")
    : await client.from("finance_transactions").insert(values).select("id");
  if (result.error) fail(result.error);
  return result.data?.length ?? 0;
}

export async function deleteFinanceTransaction(id: string) {
  const { data, error } = await createSupabaseDatabaseClient()
    .from("finance_transactions").delete().eq("id", id).select("id");
  if (error) fail(error);
  return data?.length ?? 0;
}

export async function saveNewsArticle(values: Record<string, unknown>, id?: string) {
  const client = createSupabaseDatabaseClient();
  const result = id
    ? await client.from("news").update(values).eq("id", id).select("id")
    : await client.from("news").insert(values).select("id");
  if (result.error) fail(result.error);
  return result.data?.length ?? 0;
}

export async function setNewsPublished(id: string, published: boolean) {
  const { data, error } = await createSupabaseDatabaseClient()
    .from("news").update({ published }).eq("id", id).select("id");
  if (error) fail(error);
  return data?.length ?? 0;
}

export async function deleteNewsArticle(id: string) {
  const { data, error } = await createSupabaseDatabaseClient()
    .from("news").delete().eq("id", id).select("id");
  if (error) fail(error);
  return data?.length ?? 0;
}

export async function saveEvent(values: Record<string, unknown>, id?: string) {
  const client = createSupabaseDatabaseClient();
  const result = id
    ? await client.from("events").update(values).eq("id", id).select("id")
    : await client.from("events").insert(values).select("id");
  if (result.error) fail(result.error);
  return result.data?.length ?? 0;
}

export async function setEventPublished(id: string, published: boolean) {
  const { data, error } = await createSupabaseDatabaseClient()
    .from("events").update({ published }).eq("id", id).select("id");
  if (error) fail(error);
  return data?.length ?? 0;
}

export async function deleteEvent(id: string) {
  const { data, error } = await createSupabaseDatabaseClient()
    .from("events").delete().eq("id", id).select("id");
  if (error) fail(error);
  return data?.length ?? 0;
}

const prayerColumns = "id,name,phone,contactEmail:contact_email,requestText:request_text,isAnonymous:is_anonymous,isPrivate:is_private,audioPath:audio_path,audioDuration:audio_duration,audioMimeType:audio_mime_type,audioSize:audio_size,status,createdAt:created_at";

export async function getPrayerRequests(status: PrayerStatus | "all") {
  const client = createSupabaseDatabaseClient();
  let query = client.from("prayer_requests").select(prayerColumns)
    .order("created_at", { ascending: false }).limit(500);
  if (status !== "all") query = query.eq("status", status);
  const { data, error } = await query;
  if (error) fail(error);
  return (data ?? []).map((row) => mapPrayerRequest(row as unknown as Record<string, unknown>));
}

export async function getPrayerRequest(id: string) {
  const { data, error } = await createSupabaseDatabaseClient()
    .from("prayer_requests").select(prayerColumns).eq("id", id).maybeSingle();
  if (error) fail(error);
  return data ? mapPrayerRequest(data as unknown as Record<string, unknown>) : null;
}

export async function getPrayerAudioRecord(id: string) {
  const { data, error } = await createSupabaseDatabaseClient()
    .from("prayer_requests").select("audioPath:audio_path,audioMimeType:audio_mime_type").eq("id", id).maybeSingle();
  if (error) fail(error);
  return data as { audioPath: string | null; audioMimeType: string | null } | null;
}

export async function getNewPrayerRequestCount() {
  const { count, error } = await createSupabaseDatabaseClient()
    .from("prayer_requests").select("id", { count: "exact", head: true }).eq("status", "new_request");
  if (error) fail(error);
  return String(count ?? 0);
}

export async function createPrayerRequest(input: CreatePrayerRequestInput) {
  const { data, error } = await createSupabaseDatabaseClient().from("prayer_requests")
    .insert({
      name: input.name,
      phone: input.phone,
      contact_email: input.contactEmail ?? null,
      request_text: input.requestText,
      audio_path: input.audioPath,
      audio_duration: input.audioDuration,
      audio_mime_type: input.audioMimeType,
      audio_size: input.audioSize,
      is_anonymous: input.isAnonymous,
      is_private: input.isPrivate ?? true,
      status: "new_request",
    })
    .select("id").single();
  if (error) fail(error);
  if (!data) throw new Error("Supabase did not return the saved prayer request.");
  return data.id as string;
}

export async function updatePrayerRequestStatus(id: string, status: PrayerStatus) {
  const { data, error } = await createSupabaseDatabaseClient()
    .from("prayer_requests").update({ status }).eq("id", id).select("id");
  if (error) fail(error);
  return data?.length ?? 0;
}

export async function listTestimonies() {
  const { data, error } = await createSupabaseDatabaseClient().from("testimonies")
    .select("id,displayName:display_name,email:contact_email,phone:contact_phone,content,isAnonymous:is_anonymous,publicationConsent:publication_consent,moderationStatus:moderation_status,published,createdAt:created_at")
    .order("created_at", { ascending: false }).limit(500);
  if (error) fail(error);
  const statusOrder = { pending: 0, approved: 1, rejected: 2 };
  return (data ?? [])
    .map((row) => mapTestimony(row as unknown as Record<string, unknown>))
    .sort((a, b) => statusOrder[a.moderationStatus] - statusOrder[b.moderationStatus]);
}

export async function moderateTestimony(id: string, status: TestimonyModerationStatus) {
  const values = {
    moderation_status: status,
    ...(status === "approved" ? {} : { published: false }),
    reviewed_at: status === "pending" ? null : new Date().toISOString(),
  };
  const { data, error } = await createSupabaseDatabaseClient()
    .from("testimonies").update(values).eq("id", id).select("id");
  if (error) fail(error);
  return data?.length ?? 0;
}

export async function setTestimonyPublished(id: string, published: boolean) {
  const { data, error } = await createSupabaseDatabaseClient()
    .from("testimonies")
    .update({ published })
    .eq("id", id)
    .eq("moderation_status", "approved")
    .eq("publication_consent", true)
    .select("id");
  if (error) fail(error);
  return data?.length ?? 0;
}

export async function insertTestimonySubmission(input: TestimonySubmission) {
  const { data, error } = await createSupabaseDatabaseClient().from("testimonies")
    .insert({
      display_name: input.displayName,
      contact_email: input.email ?? null,
      contact_phone: input.phone ?? null,
      content: input.content,
      is_anonymous: input.isAnonymous,
      publication_consent: input.publicationConsent,
    })
    .select("id").single();
  if (error) fail(error);
  if (!data) throw new Error("Supabase did not return the saved testimony.");
  return data.id as string;
}

export async function listAdminDevotions() {
  const { data, error } = await createSupabaseDatabaseClient().from("daily_devotions")
    .select("id,title,scripture,message,prayer,devotionDate:devotion_date,imageUrl:image_url,videoUrl:video_url,published,createdAt:created_at")
    .order("devotion_date", { ascending: false }).order("created_at", { ascending: false }).limit(500);
  if (error) fail(error);
  return (data ?? []).map((row) => mapDevotion(row as unknown as Record<string, unknown>));
}

export async function saveDailyDevotion(input: DailyDevotionInput) {
  const values = {
    title: input.title,
    scripture: input.scripture,
    message: input.message,
    prayer: input.prayer,
    devotion_date: input.devotionDate,
    image_url: input.imageUrl || null,
    video_url: input.videoUrl || null,
    published: input.published,
  };
  const client = createSupabaseDatabaseClient();
  const result = input.id
    ? await client.from("daily_devotions").update(values).eq("id", input.id).select("id")
    : await client.from("daily_devotions").insert(values).select("id");
  if (result.error) fail(result.error);
  return result.data?.length ?? 0;
}

export async function setDailyDevotionPublished(id: string, published: boolean) {
  const { data, error } = await createSupabaseDatabaseClient()
    .from("daily_devotions").update({ published }).eq("id", id).select("id");
  if (error) fail(error);
  return data?.length ?? 0;
}

export async function deleteDailyDevotion(id: string) {
  const { data, error } = await createSupabaseDatabaseClient()
    .from("daily_devotions").delete().eq("id", id).select("id");
  if (error) fail(error);
  return data?.length ?? 0;
}

export async function listPublishedDevotions() {
  const { data, error } = await createSupabaseDatabaseClient().from("daily_devotions")
    .select("id,title,scripture,message,prayer,devotionDate:devotion_date,imageUrl:image_url,videoUrl:video_url,published,createdAt:created_at")
    .eq("published", true).lte("devotion_date", new Date().toISOString().slice(0, 10))
    .order("devotion_date", { ascending: false }).order("created_at", { ascending: false }).limit(100);
  if (error) fail(error);
  return (data ?? []).map((row) => mapDevotion(row as unknown as Record<string, unknown>));
}

export async function listAdminMinistryMedia() {
  const { data, error } = await createSupabaseDatabaseClient().from("ministry_media_items")
    .select("id,kind,category,title,description,speaker,mediaDate:media_date,scripture,videoUrl:video_url,thumbnailUrl:thumbnail_url,published,createdAt:created_at")
    .order("media_date", { ascending: false, nullsFirst: false }).order("created_at", { ascending: false }).limit(500);
  if (error) fail(error);
  return (data ?? []).map((row) => mapMedia(row as unknown as Record<string, unknown>));
}

export async function saveMinistryMediaItem(input: MinistryMediaInput) {
  const values = {
    kind: input.kind,
    category: input.category || null,
    title: input.title,
    description: input.description,
    speaker: input.speaker || null,
    media_date: input.mediaDate || null,
    scripture: input.scripture || null,
    video_url: input.videoUrl,
    thumbnail_url: input.thumbnailUrl || null,
    published: input.published,
  };
  const client = createSupabaseDatabaseClient();
  const result = input.id
    ? await client.from("ministry_media_items").update(values).eq("id", input.id).select("id")
    : await client.from("ministry_media_items").insert(values).select("id");
  if (result.error) fail(result.error);
  return result.data?.length ?? 0;
}

export async function setMinistryMediaPublished(id: string, published: boolean) {
  const { data, error } = await createSupabaseDatabaseClient()
    .from("ministry_media_items").update({ published }).eq("id", id).select("id");
  if (error) fail(error);
  return data?.length ?? 0;
}

export async function deleteMinistryMediaItem(id: string) {
  const { data, error } = await createSupabaseDatabaseClient()
    .from("ministry_media_items").delete().eq("id", id).select("id");
  if (error) fail(error);
  return data?.length ?? 0;
}

export async function listPublishedMinistryMedia(filters: PublishedMinistryMediaFilters = {}) {
  let query = createSupabaseDatabaseClient().from("ministry_media_items")
    .select("id,kind,category,title,description,speaker,mediaDate:media_date,scripture,videoUrl:video_url,thumbnailUrl:thumbnail_url,published,createdAt:created_at")
    .eq("published", true)
    .order("media_date", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false }).limit(500);
  if (filters.kind) query = query.eq("kind", filters.kind);
  if (filters.category?.trim()) query = query.ilike("category", filters.category.trim());
  const { data, error } = await query;
  if (error) fail(error);
  return (data ?? []).map((row) => mapMedia(row as unknown as Record<string, unknown>));
}

export async function listAdminCharityProjects() {
  const { data, error } = await createSupabaseDatabaseClient().from("charity_projects")
    .select("id,title,category,description,imageUrl:image_url,supportContact:support_contact,supportCta:support_cta,published,createdAt:created_at")
    .order("created_at", { ascending: false }).limit(500);
  if (error) fail(error);
  return (data ?? []).map((row) => mapProject(row as unknown as Record<string, unknown>));
}

export async function saveCharityProject(input: CharityProjectInput) {
  const values = {
    title: input.title,
    category: input.category,
    description: input.description,
    image_url: input.imageUrl,
    support_contact: input.supportContact || null,
    support_cta: input.supportCta || null,
    published: input.published,
  };
  const client = createSupabaseDatabaseClient();
  const result = input.id
    ? await client.from("charity_projects").update(values).eq("id", input.id).select("id")
    : await client.from("charity_projects").insert(values).select("id");
  if (result.error) fail(result.error);
  return result.data?.length ?? 0;
}

export async function setCharityProjectPublished(id: string, published: boolean) {
  const { data, error } = await createSupabaseDatabaseClient()
    .from("charity_projects").update({ published }).eq("id", id).select("id");
  if (error) fail(error);
  return data?.length ?? 0;
}

export async function deleteCharityProject(id: string) {
  const { data, error } = await createSupabaseDatabaseClient()
    .from("charity_projects").delete().eq("id", id).select("id");
  if (error) fail(error);
  return data?.length ?? 0;
}

export async function listPublishedCharityProjects() {
  const { data, error } = await createSupabaseDatabaseClient().from("charity_projects")
    .select("id,title,category,description,imageUrl:image_url,supportContact:support_contact,supportCta:support_cta,published,createdAt:created_at")
    .eq("published", true).order("created_at", { ascending: false }).limit(100);
  if (error) fail(error);
  return (data ?? []).map((row) => mapProject(row as unknown as Record<string, unknown>));
}
