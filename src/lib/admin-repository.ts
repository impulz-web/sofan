import { isDatabaseConfigured, queryDatabase } from "@/lib/db";
import type {
  AdminEvent,
  AdminSnapshot,
  FinanceFilter,
  FinanceSummary,
  FinanceTransaction,
  NewsArticle,
  PrayerRequest,
  PrayerStatus,
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
    pendingPrayerCount: null,
    transactions: [],
    news: [],
    events: [],
    recentNews: [],
    upcomingEvents: [],
  };
}

const financeColumns = `
  id::text AS id,
  type,
  amount::text AS amount,
  currency,
  payment_method AS "paymentMethod",
  reference,
  donor_name AS "donorName",
  phone,
  notes,
  TO_CHAR(transaction_date, 'YYYY-MM-DD') AS "transactionDate",
  TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "createdAt"
`;

const newsColumns = `
  id::text AS id,
  title,
  content,
  image_url AS "imageUrl",
  published,
  TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "createdAt"
`;

const eventColumns = `
  id::text AS id,
  title,
  description,
  TO_CHAR(event_date, 'YYYY-MM-DD') AS "eventDate",
  CASE WHEN start_time IS NULL THEN NULL ELSE TO_CHAR(start_time, 'HH24:MI') END AS "startTime",
  CASE WHEN end_time IS NULL THEN NULL ELSE TO_CHAR(end_time, 'HH24:MI') END AS "endTime",
  location,
  image_url AS "imageUrl",
  published,
  TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "createdAt"
`;

export async function loadAdminSnapshot(): Promise<AdminSnapshot> {
  if (!isDatabaseConfigured()) {
    return emptySnapshot("not-configured");
  }

  try {
    const [summaryResult, transactionsResult, newsResult, eventsResult, recentNewsResult, upcomingResult] =
      await Promise.all([
        queryDatabase<FinanceSummary>(`
          SELECT
            COALESCE(SUM(amount) FILTER (WHERE currency = 'KES'), 0)::text AS "totalReceived",
            COALESCE(SUM(amount) FILTER (WHERE type = 'tithe' AND currency = 'KES'), 0)::text AS tithes,
            COALESCE(SUM(amount) FILTER (WHERE type = 'offering' AND currency = 'KES'), 0)::text AS offerings,
            COALESCE(SUM(amount) FILTER (WHERE type = 'donation' AND currency = 'KES'), 0)::text AS donations
          FROM finance_transactions
        `),
        queryDatabase<FinanceTransaction>(`
          SELECT ${financeColumns}
          FROM finance_transactions
          ORDER BY transaction_date DESC, created_at DESC
          LIMIT 100
        `),
        queryDatabase<NewsArticle>(`
          SELECT ${newsColumns}
          FROM news
          ORDER BY created_at DESC
          LIMIT 200
        `),
        queryDatabase<AdminEvent>(`
          SELECT ${eventColumns}
          FROM events
          ORDER BY event_date ASC, start_time ASC NULLS LAST, created_at DESC
          LIMIT 200
        `),
        queryDatabase<NewsArticle>(`
          SELECT ${newsColumns}
          FROM news
          WHERE published = TRUE
          ORDER BY created_at DESC
          LIMIT 4
        `),
        queryDatabase<AdminEvent>(`
          SELECT ${eventColumns}
          FROM events
          WHERE published = TRUE AND event_date >= CURRENT_DATE
          ORDER BY event_date ASC, start_time ASC NULLS LAST
          LIMIT 4
        `),
      ]);

    let pendingPrayerCount: string | null = null;
    try {
      const prayerCountResult = await queryDatabase<{ pendingPrayerCount: string }>(`
        SELECT COUNT(*) FILTER (WHERE status = 'pending')::text AS "pendingPrayerCount"
        FROM prayer_requests
      `);
      pendingPrayerCount = prayerCountResult.rows[0]?.pendingPrayerCount ?? null;
    } catch {
      pendingPrayerCount = null;
    }

    return {
      databaseStatus: "connected",
      summary: summaryResult.rows[0] ?? emptySummary,
      pendingPrayerCount,
      transactions: transactionsResult.rows,
      news: newsResult.rows,
      events: eventsResult.rows,
      recentNews: recentNewsResult.rows,
      upcomingEvents: upcomingResult.rows,
    };
  } catch {
    return emptySnapshot("unavailable");
  }
}

export async function listFinanceTransactions(filters: {
  type: FinanceFilter;
  from: string;
  to: string;
}) {
  const conditions: string[] = [];
  const values: string[] = [];

  if (filters.type !== "all") {
    values.push(filters.type);
    conditions.push(`type = $${values.length}`);
  }
  if (filters.from) {
    values.push(filters.from);
    conditions.push(`transaction_date >= $${values.length}::date`);
  }
  if (filters.to) {
    values.push(filters.to);
    conditions.push(`transaction_date <= $${values.length}::date`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await queryDatabase<FinanceTransaction>(`
    SELECT ${financeColumns}
    FROM finance_transactions
    ${whereClause}
    ORDER BY transaction_date DESC, created_at DESC
    LIMIT 500
  `, values);

  return result.rows;
}

const prayerRequestColumns = `
  id::text AS id,
  CASE WHEN is_anonymous THEN NULL ELSE name END AS name,
  CASE WHEN is_anonymous THEN NULL ELSE phone END AS phone,
  request_text AS "requestText",
  is_anonymous AS "isAnonymous",
  audio_path IS NOT NULL AS "hasAudio",
  audio_duration AS "audioDuration",
  audio_mime_type AS "audioMimeType",
  audio_size::text AS "audioSize",
  status,
  TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"') AS "createdAt"
`;

export async function getPrayerRequests(status: PrayerStatus | "all") {
  const statuses: PrayerStatus[] = ["pending", "prayed_for", "archived"];
  if (status !== "all" && !statuses.includes(status)) {
    throw new Error("Invalid prayer request status.");
  }
  const filter = status === "all" ? "" : "WHERE status = $1";
  const result = await queryDatabase<PrayerRequest>(`
    SELECT ${prayerRequestColumns}
    FROM prayer_requests
    ${filter}
    ORDER BY created_at DESC
    LIMIT 500
  `, status === "all" ? [] : [status]);
  return result.rows;
}

export async function getPrayerRequest(id: string) {
  const result = await queryDatabase<PrayerRequest>(`
    SELECT ${prayerRequestColumns}
    FROM prayer_requests
    WHERE id = $1
    LIMIT 1
  `, [id]);
  return result.rows[0] ?? null;
}

export async function getPrayerAudioRecord(id: string) {
  const result = await queryDatabase<{ audioPath: string | null; audioMimeType: string | null }>(
    "SELECT audio_path AS \"audioPath\", audio_mime_type AS \"audioMimeType\" FROM prayer_requests WHERE id = $1 LIMIT 1",
    [id],
  );
  return result.rows[0] ?? null;
}

export async function getPendingPrayerRequestCount() {
  const result = await queryDatabase<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM prayer_requests WHERE status = 'pending'",
  );
  return result.rows[0]?.count ?? "0";
}

export async function createPrayerRequest(input: {
  name: string | null;
  phone: string | null;
  requestText: string | null;
  audioPath: string | null;
  audioDuration: number | null;
  audioMimeType: string | null;
  audioSize: number | null;
  isAnonymous: boolean;
}) {
  const result = await queryDatabase<{ id: string }>(`
    INSERT INTO prayer_requests
      (name, phone, request_text, audio_path, audio_duration, audio_mime_type, audio_size, is_anonymous)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING id::text AS id
  `, [
    input.name,
    input.phone,
    input.requestText,
    input.audioPath,
    input.audioDuration,
    input.audioMimeType,
    input.audioSize,
    input.isAnonymous,
  ]);
  return result.rows[0]?.id;
}

export async function updatePrayerRequestStatus(id: string, status: PrayerStatus) {
  const result = await queryDatabase(
    "UPDATE prayer_requests SET status = $1 WHERE id = $2",
    [status, id],
  );
  return result.rowCount ?? 0;
}
