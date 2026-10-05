"use server";

import { isDatabaseConfigured, queryDatabase } from "@/lib/db";
import { listFinanceTransactions, loadAdminSnapshot } from "@/lib/admin-repository";
import type {
  ActionResult,
  AdminSnapshot,
  EventInput,
  FinanceFilter,
  FinanceInput,
  FinanceTransaction,
  NewsInput,
  PrayerStatus,
} from "@/lib/admin-types";
import {
  getPendingPrayerRequestCount,
  getPrayerRequest,
  getPrayerRequests,
  getPrayerAudioRecord,
  updatePrayerRequestStatus,
} from "@/lib/admin-repository";
import { createPrayerAudioToken } from "@/lib/prayer-audio-token";

const databaseUnavailableMessage =
  "Database not connected. Set DATABASE_URL and run db/schema.sql and db/seed.sql.";

function normalize(value: string, maxLength = 4000) {
  return value.trim().slice(0, maxLength);
}

function validId(id: string | undefined) {
  return Boolean(id && /^\d+$/.test(id));
}

function validDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().slice(0, 10) === value;
}

function validTime(value: string) {
  return value === "" || /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

async function performMutation(operation: () => Promise<void>): Promise<ActionResult> {
  if (!isDatabaseConfigured()) {
    return { success: false, message: databaseUnavailableMessage };
  }

  try {
    await operation();
    return { success: true };
  } catch {
    return {
      success: false,
      message: "Database operation failed. Check the connection and schema, then try again.",
    };
  }
}

export async function refreshAdminSnapshot(): Promise<AdminSnapshot> {
  return loadAdminSnapshot();
}

export async function filterFinanceTransactions(filters: {
  type: FinanceFilter;
  from: string;
  to: string;
}): Promise<{ success: true; rows: FinanceTransaction[] } | { success: false; message: string }> {
  if (!isDatabaseConfigured()) {
    return { success: false, message: databaseUnavailableMessage };
  }
  if (!["all", "tithe", "offering", "donation"].includes(filters.type)) {
    return { success: false, message: "Select a valid transaction type." };
  }
  if ((filters.from && !validDate(filters.from)) || (filters.to && !validDate(filters.to))) {
    return { success: false, message: "Enter valid date filters." };
  }
  if (filters.from && filters.to && filters.from > filters.to) {
    return { success: false, message: "The start date must be before the end date." };
  }

  try {
    const rows = await listFinanceTransactions(filters);
    return { success: true, rows };
  } catch {
    return { success: false, message: "Could not load transactions. Check the database connection." };
  }
}

export async function saveFinanceTransaction(input: FinanceInput): Promise<ActionResult> {
  const type = input.type;
  const amount = Number(input.amount);
  const currency = normalize(input.currency, 3).toUpperCase();
  const paymentMethod = normalize(input.paymentMethod, 80);
  const transactionDate = normalize(input.transactionDate, 10);

  if (!["tithe", "offering", "donation"].includes(type)) {
    return { success: false, message: "Select a valid transaction type." };
  }
  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, message: "Enter an amount greater than zero." };
  }
  if (currency !== "KES") {
    return { success: false, message: "KES is the only enabled currency for this admin demo." };
  }
  if (!paymentMethod) {
    return { success: false, message: "Enter a payment method." };
  }
  if (!validDate(transactionDate)) {
    return { success: false, message: "Enter a valid transaction date." };
  }
  if (input.id && !validId(input.id)) {
    return { success: false, message: "Invalid transaction ID." };
  }

  return performMutation(async () => {
    const values = [
      type,
      amount,
      currency,
      paymentMethod,
      normalize(input.reference, 120) || null,
      normalize(input.donorName, 160) || null,
      normalize(input.phone, 80) || null,
      normalize(input.notes) || null,
      transactionDate,
    ];

    if (input.id) {
      await queryDatabase(
        `UPDATE finance_transactions
         SET type = $1, amount = $2, currency = $3, payment_method = $4,
             reference = $5, donor_name = $6, phone = $7, notes = $8, transaction_date = $9
         WHERE id = $10`,
        [...values, input.id],
      );
      return;
    }

    await queryDatabase(
      `INSERT INTO finance_transactions
        (type, amount, currency, payment_method, reference, donor_name, phone, notes, transaction_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      values,
    );
  });
}

export async function deleteFinanceTransaction(id: string): Promise<ActionResult> {
  if (!validId(id)) return { success: false, message: "Invalid transaction ID." };
  return performMutation(async () => {
    const result = await queryDatabase("DELETE FROM finance_transactions WHERE id = $1", [id]);
    if (result.rowCount === 0) throw new Error("Transaction not found.");
  });
}

export async function saveNewsArticle(input: NewsInput): Promise<ActionResult> {
  const title = normalize(input.title, 200);
  const content = normalize(input.content, 20_000);
  if (!title || !content) {
    return { success: false, message: "Title and content are required." };
  }
  if (input.id && !validId(input.id)) return { success: false, message: "Invalid news ID." };

  return performMutation(async () => {
    const values = [title, content, normalize(input.imageUrl, 1000) || null, Boolean(input.published)];
    if (input.id) {
      await queryDatabase(
        `UPDATE news SET title = $1, content = $2, image_url = $3, published = $4 WHERE id = $5`,
        [...values, input.id],
      );
      return;
    }
    await queryDatabase(
      "INSERT INTO news (title, content, image_url, published) VALUES ($1, $2, $3, $4)",
      values,
    );
  });
}

export async function setNewsPublished(id: string, published: boolean): Promise<ActionResult> {
  if (!validId(id)) return { success: false, message: "Invalid news ID." };
  return performMutation(async () => {
    const result = await queryDatabase("UPDATE news SET published = $1 WHERE id = $2", [published, id]);
    if (result.rowCount === 0) throw new Error("News article not found.");
  });
}

export async function deleteNewsArticle(id: string): Promise<ActionResult> {
  if (!validId(id)) return { success: false, message: "Invalid news ID." };
  return performMutation(async () => {
    const result = await queryDatabase("DELETE FROM news WHERE id = $1", [id]);
    if (result.rowCount === 0) throw new Error("News article not found.");
  });
}

export async function saveEvent(input: EventInput): Promise<ActionResult> {
  const title = normalize(input.title, 200);
  const description = normalize(input.description, 20_000);
  const eventDate = normalize(input.eventDate, 10);
  const startTime = normalize(input.startTime, 5);
  const endTime = normalize(input.endTime, 5);
  if (!title || !description || !validDate(eventDate)) {
    return { success: false, message: "Title, description, and a valid event date are required." };
  }
  if (!validTime(startTime) || !validTime(endTime)) {
    return { success: false, message: "Enter a valid event time." };
  }
  if (startTime && endTime && endTime < startTime) {
    return { success: false, message: "End time must be later than start time." };
  }
  if (input.id && !validId(input.id)) return { success: false, message: "Invalid event ID." };

  return performMutation(async () => {
    const values = [
      title,
      description,
      eventDate,
      startTime || null,
      endTime || null,
      normalize(input.location, 300) || null,
      normalize(input.imageUrl, 1000) || null,
      Boolean(input.published),
    ];
    if (input.id) {
      await queryDatabase(
        `UPDATE events
         SET title = $1, description = $2, event_date = $3, start_time = $4,
             end_time = $5, location = $6, image_url = $7, published = $8
         WHERE id = $9`,
        [...values, input.id],
      );
      return;
    }
    await queryDatabase(
      `INSERT INTO events
        (title, description, event_date, start_time, end_time, location, image_url, published)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      values,
    );
  });
}

export async function setEventPublished(id: string, published: boolean): Promise<ActionResult> {
  if (!validId(id)) return { success: false, message: "Invalid event ID." };
  return performMutation(async () => {
    const result = await queryDatabase("UPDATE events SET published = $1 WHERE id = $2", [published, id]);
    if (result.rowCount === 0) throw new Error("Event not found.");
  });
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  if (!validId(id)) return { success: false, message: "Invalid event ID." };
  return performMutation(async () => {
    const result = await queryDatabase("DELETE FROM events WHERE id = $1", [id]);
    if (result.rowCount === 0) throw new Error("Event not found.");
  });
}

const prayerStatuses: PrayerStatus[] = ["pending", "prayed_for", "archived"];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getPrayerRequestsAction(status: PrayerStatus | "all") {
  if (!isDatabaseConfigured()) {
    return { success: false as const, message: databaseUnavailableMessage, rows: [] };
  }
  if (status !== "all" && !prayerStatuses.includes(status)) {
    return { success: false as const, message: "Select a valid prayer request status.", rows: [] };
  }
  try {
    const rows = await getPrayerRequests(status);
    return { success: true as const, rows };
  } catch {
    return { success: false as const, message: "Could not load prayer requests.", rows: [] };
  }
}

export async function getPrayerRequestAction(id: string) {
  if (!uuidPattern.test(id) || !isDatabaseConfigured()) return null;
  try {
    return await getPrayerRequest(id);
  } catch {
    return null;
  }
}

export async function getPendingPrayerRequestCountAction() {
  if (!isDatabaseConfigured()) return null;
  try {
    return await getPendingPrayerRequestCount();
  } catch {
    return null;
  }
}

export async function updatePrayerRequestStatusAction(id: string, status: PrayerStatus): Promise<ActionResult> {
  if (!uuidPattern.test(id)) return { success: false, message: "Invalid prayer request." };
  if (!prayerStatuses.includes(status)) return { success: false, message: "Select a valid status." };
  if (!isDatabaseConfigured()) return { success: false, message: databaseUnavailableMessage };
  try {
    const updated = await updatePrayerRequestStatus(id, status);
    return updated ? { success: true } : { success: false, message: "Prayer request not found." };
  } catch {
    return { success: false, message: "Could not update the prayer request." };
  }
}

export async function getSecureAudioUrl(id: string) {
  if (!uuidPattern.test(id) || !isDatabaseConfigured()) {
    return { success: false as const, message: "Audio is unavailable." };
  }
  try {
    const record = await getPrayerAudioRecord(id);
    if (!record?.audioPath || !record.audioMimeType) {
      return { success: false as const, message: "No recording is attached to this request." };
    }
    const token = createPrayerAudioToken(id);
    return { success: true as const, url: `/api/private-prayer-audio?token=${encodeURIComponent(token)}` };
  } catch {
    return { success: false as const, message: "Recording playback is unavailable." };
  }
}
