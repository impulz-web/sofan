"use server";

import { isDatabaseConfigured } from "@/lib/db";
import {
  deleteEvent as removeEvent,
  deleteFinanceTransaction as removeFinanceTransaction,
  deleteNewsArticle as removeNewsArticle,
  listFinanceTransactions,
  loadAdminSnapshot,
  saveEvent as storeEvent,
  saveFinanceTransaction as storeFinanceTransaction,
  saveNewsArticle as storeNewsArticle,
  setEventPublished as updateEventPublished,
  setNewsPublished as updateNewsPublished,
} from "@/lib/admin-repository";
import type {
  ActionResult,
  AdminSnapshot,
  CharityProjectInput,
  DailyDevotionInput,
  EventInput,
  FinanceFilter,
  FinanceInput,
  FinanceTransaction,
  NewsInput,
  MinistryMediaInput,
  MinistryMediaKind,
  PrayerStatus,
  TestimonyModerationStatus,
} from "@/lib/admin-types";
import {
  deleteCharityProject as removeCharityProject,
  deleteDailyDevotion as removeDailyDevotion,
  deleteMinistryMediaItem as removeMinistryMediaItem,
  getNewPrayerRequestCount,
  listAdminCharityProjects,
  listAdminDevotions,
  listAdminMinistryMedia,
  getPrayerRequest,
  getPrayerRequests,
  getPrayerAudioRecord,
  saveCharityProject as storeCharityProject,
  saveDailyDevotion as storeDailyDevotion,
  saveMinistryMediaItem as storeMinistryMediaItem,
  setCharityProjectPublished as updateCharityProjectPublished,
  setDailyDevotionPublished as updateDailyDevotionPublished,
  setMinistryMediaPublished as updateMinistryMediaPublished,
  updatePrayerRequestStatus,
} from "@/lib/admin-repository";
import { createPrayerAudioToken } from "@/lib/prayer-audio-token";
import { requireAdminSession, requireTestimonyPublishPermission } from "@/lib/admin-auth";
import { createAdminUser } from "@/lib/supabase/admin-users";
import {
  listTestimonies,
  moderateTestimony,
  setTestimonyPublished as updateTestimonyPublished,
} from "@/lib/admin-repository";

const databaseUnavailableMessage =
  "Supabase is not connected. Configure the Supabase keys and apply the SQL files described in README.md.";

export async function createAdminUserAction(emailInput: string, passwordInput: string): Promise<ActionResult> {
  await requireAdminSession();
  const email = typeof emailInput === "string" ? emailInput.trim().toLowerCase() : "";
  const password = typeof passwordInput === "string" ? passwordInput : "";
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, message: "Enter a valid email address." };
  }
  if (password.length < 8 || password.length > 1024) {
    return { success: false, message: "Use an initial password between 8 and 1024 characters." };
  }
  try {
    const user = await createAdminUser(email, password);
    return { success: true, message: `Admin account created for ${user.email}. Share the initial password securely.` };
  } catch (error) {
    console.error("Could not create a SOFAN admin account.", error);
    return {
      success: false,
      message: error instanceof Error && error.message
        ? `Could not create the account: ${error.message}`
        : "Could not create the account. Check Supabase Auth configuration and try again.",
    };
  }
}

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

const testimonyStatuses: TestimonyModerationStatus[] = ["pending", "approved", "rejected"];

export async function getTestimoniesAction() {
  await requireAdminSession();
  if (!isDatabaseConfigured()) {
    return { success: false as const, message: databaseUnavailableMessage, rows: [] };
  }
  try {
    return { success: true as const, rows: await listTestimonies() };
  } catch {
    return { success: false as const, message: "Could not load testimonies.", rows: [] };
  }
}

export async function moderateTestimonyAction(
  id: string,
  status: TestimonyModerationStatus,
): Promise<ActionResult> {
  await requireAdminSession();
  if (!uuidPattern.test(id)) return { success: false, message: "Invalid testimony." };
  if (!testimonyStatuses.includes(status)) return { success: false, message: "Select a valid review status." };
  if (!isDatabaseConfigured()) return { success: false, message: databaseUnavailableMessage };
  try {
    const updated = await moderateTestimony(id, status);
    return updated ? { success: true } : { success: false, message: "Testimony not found." };
  } catch {
    return { success: false, message: "Could not update the testimony." };
  }
}

export async function setTestimonyPublishedAction(id: string, published: boolean): Promise<ActionResult> {
  await requireTestimonyPublishPermission();
  if (!uuidPattern.test(id)) return { success: false, message: "Invalid testimony." };
  if (typeof published !== "boolean") return { success: false, message: "Select a valid publication state." };
  if (!isDatabaseConfigured()) return { success: false, message: databaseUnavailableMessage };
  try {
    const updated = await updateTestimonyPublished(id, published);
    if (updated) return { success: true };
    return {
      success: false,
      message: "Only approved testimonies with publication consent can be published or unpublished.",
    };
  } catch {
    return { success: false, message: "Could not update testimony publication." };
  }
}

export async function refreshAdminSnapshot(): Promise<AdminSnapshot> {
  await requireAdminSession();
  return loadAdminSnapshot();
}

export async function filterFinanceTransactions(filters: {
  type: FinanceFilter;
  from: string;
  to: string;
}): Promise<{ success: true; rows: FinanceTransaction[] } | { success: false; message: string }> {
  await requireAdminSession();
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
  await requireAdminSession();
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
    const updated = await storeFinanceTransaction({
      type,
      amount,
      currency,
      payment_method: paymentMethod,
      reference: normalize(input.reference, 120) || null,
      donor_name: normalize(input.donorName, 160) || null,
      phone: normalize(input.phone, 80) || null,
      notes: normalize(input.notes) || null,
      transaction_date: transactionDate,
    }, input.id);
    if (input.id && !updated) throw new Error("Transaction not found.");
  });
}

export async function deleteFinanceTransaction(id: string): Promise<ActionResult> {
  await requireAdminSession();
  if (!validId(id)) return { success: false, message: "Invalid transaction ID." };
  return performMutation(async () => {
    if (!(await removeFinanceTransaction(id))) throw new Error("Transaction not found.");
  });
}

export async function saveNewsArticle(input: NewsInput): Promise<ActionResult> {
  await requireAdminSession();
  const title = normalize(input.title, 200);
  const content = normalize(input.content, 20_000);
  if (!title || !content) {
    return { success: false, message: "Title and content are required." };
  }
  if (input.id && !validId(input.id)) return { success: false, message: "Invalid news ID." };

  return performMutation(async () => {
    const updated = await storeNewsArticle({
      title,
      content,
      image_url: normalize(input.imageUrl, 1000) || null,
      published: Boolean(input.published),
    }, input.id);
    if (input.id && !updated) throw new Error("News article not found.");
  });
}

export async function setNewsPublished(id: string, published: boolean): Promise<ActionResult> {
  await requireAdminSession();
  if (!validId(id)) return { success: false, message: "Invalid news ID." };
  return performMutation(async () => {
    if (!(await updateNewsPublished(id, published))) throw new Error("News article not found.");
  });
}

export async function deleteNewsArticle(id: string): Promise<ActionResult> {
  await requireAdminSession();
  if (!validId(id)) return { success: false, message: "Invalid news ID." };
  return performMutation(async () => {
    if (!(await removeNewsArticle(id))) throw new Error("News article not found.");
  });
}

export async function saveEvent(input: EventInput): Promise<ActionResult> {
  await requireAdminSession();
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
    const updated = await storeEvent({
      title,
      description,
      event_date: eventDate,
      start_time: startTime || null,
      end_time: endTime || null,
      location: normalize(input.location, 300) || null,
      image_url: normalize(input.imageUrl, 1000) || null,
      published: Boolean(input.published),
    }, input.id);
    if (input.id && !updated) throw new Error("Event not found.");
  });
}

export async function setEventPublished(id: string, published: boolean): Promise<ActionResult> {
  await requireAdminSession();
  if (!validId(id)) return { success: false, message: "Invalid event ID." };
  return performMutation(async () => {
    if (!(await updateEventPublished(id, published))) throw new Error("Event not found.");
  });
}

export async function deleteEvent(id: string): Promise<ActionResult> {
  await requireAdminSession();
  if (!validId(id)) return { success: false, message: "Invalid event ID." };
  return performMutation(async () => {
    if (!(await removeEvent(id))) throw new Error("Event not found.");
  });
}

const prayerStatuses: PrayerStatus[] = [
  "new_request",
  "contacted",
  "prayer_in_progress",
  "follow_up_needed",
  "answered",
  "closed",
];
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function getPrayerRequestsAction(status: PrayerStatus | "all") {
  await requireAdminSession();
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
  await requireAdminSession();
  if (!uuidPattern.test(id) || !isDatabaseConfigured()) return null;
  try {
    return await getPrayerRequest(id);
  } catch {
    return null;
  }
}

export async function getNewPrayerRequestCountAction() {
  await requireAdminSession();
  if (!isDatabaseConfigured()) return null;
  try {
    return await getNewPrayerRequestCount();
  } catch {
    return null;
  }
}

export async function updatePrayerRequestStatusAction(id: string, status: PrayerStatus): Promise<ActionResult> {
  await requireAdminSession();
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
  await requireAdminSession();
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

const ministryMediaKinds: MinistryMediaKind[] = ["sermon", "prayer_video", "ministry_video"];

function boundedText(value: unknown, maxLength: number) {
  return typeof value === "string" ? normalize(value, maxLength) : "";
}

function validContentUrl(value: string, allowLocalPath = false) {
  if (allowLocalPath && value.startsWith("/") && !value.startsWith("//")) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

function validMinistryId(id: unknown) {
  return typeof id === "string" && uuidPattern.test(id);
}

export async function getMinistryContentAction() {
  await requireAdminSession();
  if (!isDatabaseConfigured()) {
    return { success: false as const, message: databaseUnavailableMessage, devotions: [], media: [], projects: [] };
  }
  try {
    const [devotions, media, projects] = await Promise.all([
      listAdminDevotions(),
      listAdminMinistryMedia(),
      listAdminCharityProjects(),
    ]);
    return { success: true as const, devotions, media, projects };
  } catch {
    return { success: false as const, message: "Could not load ministry content.", devotions: [], media: [], projects: [] };
  }
}

export async function saveDailyDevotionAction(input: DailyDevotionInput): Promise<ActionResult> {
  await requireAdminSession();
  if (!input || typeof input !== "object") return { success: false, message: "Enter valid devotion details." };
  const title = boundedText(input.title, 200);
  const scripture = boundedText(input.scripture, 500);
  const message = boundedText(input.message, 20_000);
  const prayer = boundedText(input.prayer, 10_000);
  const devotionDate = boundedText(input.devotionDate, 10);
  const imageUrl = boundedText(input.imageUrl, 2000);
  const videoUrl = boundedText(input.videoUrl, 2000);
  if (!title || !scripture || !message || !prayer || !validDate(devotionDate)) {
    return { success: false, message: "Title, scripture, message, prayer, and a valid date are required." };
  }
  if ((imageUrl && !validContentUrl(imageUrl, true)) || (videoUrl && !validContentUrl(videoUrl))) {
    return { success: false, message: "Enter a valid image or video URL." };
  }
  if (input.id && !validMinistryId(input.id)) return { success: false, message: "Invalid devotion ID." };
  if (typeof input.published !== "boolean") return { success: false, message: "Select a valid publication state." };
  if (!isDatabaseConfigured()) return { success: false, message: databaseUnavailableMessage };
  try {
    const changed = await storeDailyDevotion({
      ...(input.id ? { id: input.id } : {}),
      title,
      scripture,
      message,
      prayer,
      devotionDate,
      imageUrl,
      videoUrl,
      published: input.published,
    });
    if (!changed) return { success: false, message: "Devotion not found." };
    return { success: true };
  } catch {
    return { success: false, message: "Could not save the devotion." };
  }
}

export async function setDailyDevotionPublishedAction(id: string, published: boolean): Promise<ActionResult> {
  await requireAdminSession();
  if (!validMinistryId(id)) return { success: false, message: "Invalid devotion ID." };
  if (typeof published !== "boolean") return { success: false, message: "Select a valid publication state." };
  if (!isDatabaseConfigured()) return { success: false, message: databaseUnavailableMessage };
  try {
    const changed = await updateDailyDevotionPublished(id, published);
    return changed ? { success: true } : { success: false, message: "Devotion not found." };
  } catch {
    return { success: false, message: "Could not update devotion publication." };
  }
}

export async function deleteDailyDevotionAction(id: string): Promise<ActionResult> {
  await requireAdminSession();
  if (!validMinistryId(id)) return { success: false, message: "Invalid devotion ID." };
  if (!isDatabaseConfigured()) return { success: false, message: databaseUnavailableMessage };
  try {
    const changed = await removeDailyDevotion(id);
    return changed ? { success: true } : { success: false, message: "Devotion not found." };
  } catch {
    return { success: false, message: "Could not delete the devotion." };
  }
}

export async function saveMinistryMediaItemAction(input: MinistryMediaInput): Promise<ActionResult> {
  await requireAdminSession();
  if (!input || typeof input !== "object") return { success: false, message: "Enter valid media details." };
  const kind = input.kind;
  const category = boundedText(input.category, 120);
  const title = boundedText(input.title, 200);
  const description = boundedText(input.description, 20_000);
  const speaker = boundedText(input.speaker, 200);
  const mediaDate = boundedText(input.mediaDate, 10);
  const scripture = boundedText(input.scripture, 500);
  const videoUrl = boundedText(input.videoUrl, 2000);
  const thumbnailUrl = boundedText(input.thumbnailUrl, 2000);
  if (!ministryMediaKinds.includes(kind)) return { success: false, message: "Select a valid media kind." };
  if (!title || !description || !videoUrl) return { success: false, message: "Title, description, and video URL are required." };
  if (mediaDate && !validDate(mediaDate)) return { success: false, message: "Enter a valid media date." };
  if (!validContentUrl(videoUrl) || (thumbnailUrl && !validContentUrl(thumbnailUrl, true))) {
    return { success: false, message: "Enter a valid video or thumbnail URL." };
  }
  if (input.id && !validMinistryId(input.id)) return { success: false, message: "Invalid media item ID." };
  if (typeof input.published !== "boolean") return { success: false, message: "Select a valid publication state." };
  if (!isDatabaseConfigured()) return { success: false, message: databaseUnavailableMessage };
  try {
    const changed = await storeMinistryMediaItem({
      ...(input.id ? { id: input.id } : {}),
      kind,
      category,
      title,
      description,
      speaker,
      mediaDate,
      scripture,
      videoUrl,
      thumbnailUrl,
      published: input.published,
    });
    if (!changed) return { success: false, message: "Media item not found." };
    return { success: true };
  } catch {
    return { success: false, message: "Could not save the media item." };
  }
}

export async function setMinistryMediaPublishedAction(id: string, published: boolean): Promise<ActionResult> {
  await requireAdminSession();
  if (!validMinistryId(id)) return { success: false, message: "Invalid media item ID." };
  if (typeof published !== "boolean") return { success: false, message: "Select a valid publication state." };
  if (!isDatabaseConfigured()) return { success: false, message: databaseUnavailableMessage };
  try {
    const changed = await updateMinistryMediaPublished(id, published);
    return changed ? { success: true } : { success: false, message: "Media item not found." };
  } catch {
    return { success: false, message: "Could not update media publication." };
  }
}

export async function deleteMinistryMediaItemAction(id: string): Promise<ActionResult> {
  await requireAdminSession();
  if (!validMinistryId(id)) return { success: false, message: "Invalid media item ID." };
  if (!isDatabaseConfigured()) return { success: false, message: databaseUnavailableMessage };
  try {
    const changed = await removeMinistryMediaItem(id);
    return changed ? { success: true } : { success: false, message: "Media item not found." };
  } catch {
    return { success: false, message: "Could not delete the media item." };
  }
}

export async function saveCharityProjectAction(input: CharityProjectInput): Promise<ActionResult> {
  await requireAdminSession();
  if (!input || typeof input !== "object") return { success: false, message: "Enter valid project details." };
  const title = boundedText(input.title, 200);
  const category = boundedText(input.category, 120);
  const description = boundedText(input.description, 20_000);
  const imageUrl = boundedText(input.imageUrl, 2000);
  const supportContact = boundedText(input.supportContact, 500);
  const supportCta = boundedText(input.supportCta, 300);
  if (!title || !category || !description || !imageUrl) {
    return { success: false, message: "Title, category, description, and image URL are required." };
  }
  if (!validContentUrl(imageUrl, true)) return { success: false, message: "Enter a valid image URL." };
  if (input.id && !validMinistryId(input.id)) return { success: false, message: "Invalid charity project ID." };
  if (typeof input.published !== "boolean") return { success: false, message: "Select a valid publication state." };
  if (!isDatabaseConfigured()) return { success: false, message: databaseUnavailableMessage };
  try {
    const changed = await storeCharityProject({
      ...(input.id ? { id: input.id } : {}),
      title,
      category,
      description,
      imageUrl,
      supportContact,
      supportCta,
      published: input.published,
    });
    if (!changed) return { success: false, message: "Charity project not found." };
    return { success: true };
  } catch {
    return { success: false, message: "Could not save the charity project." };
  }
}

export async function setCharityProjectPublishedAction(id: string, published: boolean): Promise<ActionResult> {
  await requireAdminSession();
  if (!validMinistryId(id)) return { success: false, message: "Invalid charity project ID." };
  if (typeof published !== "boolean") return { success: false, message: "Select a valid publication state." };
  if (!isDatabaseConfigured()) return { success: false, message: databaseUnavailableMessage };
  try {
    const changed = await updateCharityProjectPublished(id, published);
    return changed ? { success: true } : { success: false, message: "Charity project not found." };
  } catch {
    return { success: false, message: "Could not update charity project publication." };
  }
}

export async function deleteCharityProjectAction(id: string): Promise<ActionResult> {
  await requireAdminSession();
  if (!validMinistryId(id)) return { success: false, message: "Invalid charity project ID." };
  if (!isDatabaseConfigured()) return { success: false, message: databaseUnavailableMessage };
  try {
    const changed = await removeCharityProject(id);
    return changed ? { success: true } : { success: false, message: "Charity project not found." };
  } catch {
    return { success: false, message: "Could not delete the charity project." };
  }
}
