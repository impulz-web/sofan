export type FinanceType = "tithe" | "offering" | "donation";
export type FinanceFilter = "all" | FinanceType;
export type AdminTab = "dashboard" | "finance" | "news" | "events" | "prayer-requests" | "testimonies" | "ministry" | "admin-users";
export type DatabaseStatus = "connected" | "not-configured" | "unavailable";
export type PrayerStatus =
  | "new_request"
  | "contacted"
  | "prayer_in_progress"
  | "follow_up_needed"
  | "answered"
  | "closed";
export type TestimonyModerationStatus = "pending" | "approved" | "rejected";

export interface Testimony {
  id: string;
  displayName: string | null;
  email: string | null;
  phone: string | null;
  content: string;
  isAnonymous: boolean;
  publicationConsent: boolean;
  moderationStatus: TestimonyModerationStatus;
  published: boolean;
  createdAt: string;
}

export interface TestimonySubmission {
  displayName: string | null;
  email?: string | null;
  phone?: string | null;
  content: string;
  isAnonymous: boolean;
  publicationConsent: boolean;
}

export interface DailyDevotion {
  id: string;
  title: string;
  scripture: string;
  message: string;
  prayer: string;
  devotionDate: string;
  imageUrl: string | null;
  videoUrl: string | null;
  published: boolean;
  createdAt: string;
}

export interface DailyDevotionInput {
  id?: string;
  title: string;
  scripture: string;
  message: string;
  prayer: string;
  devotionDate: string;
  imageUrl: string;
  videoUrl: string;
  published: boolean;
}

export type MinistryMediaKind = "sermon" | "prayer_video" | "ministry_video";

export interface MinistryMediaItem {
  id: string;
  kind: MinistryMediaKind;
  category: string | null;
  title: string;
  description: string;
  speaker: string | null;
  mediaDate: string | null;
  scripture: string | null;
  videoUrl: string;
  thumbnailUrl: string | null;
  published: boolean;
  createdAt: string;
}

export interface PublishedMinistryMediaFilters {
  kind?: MinistryMediaKind;
  category?: string;
}

export interface MinistryMediaInput {
  id?: string;
  kind: MinistryMediaKind;
  category: string;
  title: string;
  description: string;
  speaker: string;
  mediaDate: string;
  scripture: string;
  videoUrl: string;
  thumbnailUrl: string;
  published: boolean;
}

export interface CharityProject {
  id: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  supportContact: string | null;
  supportCta: string | null;
  published: boolean;
  createdAt: string;
}

export interface CharityProjectInput {
  id?: string;
  title: string;
  category: string;
  description: string;
  imageUrl: string;
  supportContact: string;
  supportCta: string;
  published: boolean;
}

export interface FinanceTransaction {
  id: string;
  type: FinanceType;
  amount: string;
  currency: string;
  paymentMethod: string;
  reference: string | null;
  donorName: string | null;
  phone: string | null;
  notes: string | null;
  transactionDate: string;
  createdAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  imageUrl: string | null;
  published: boolean;
  createdAt: string;
}

export interface AdminEvent {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  imageUrl: string | null;
  published: boolean;
  createdAt: string;
}

export interface FinanceSummary {
  totalReceived: string;
  tithes: string;
  offerings: string;
  donations: string;
}

export interface AdminSnapshot {
  databaseStatus: DatabaseStatus;
  summary: FinanceSummary;
  newPrayerRequestCount: string | null;
  transactions: FinanceTransaction[];
  news: NewsArticle[];
  events: AdminEvent[];
  recentNews: NewsArticle[];
  upcomingEvents: AdminEvent[];
}

export interface PrayerRequest {
  id: string;
  name: string | null;
  phone: string | null;
  contactEmail: string | null;
  requestText: string | null;
  isAnonymous: boolean;
  isPrivate: boolean;
  hasAudio: boolean;
  audioDuration: number | null;
  audioMimeType: string | null;
  audioSize: string | null;
  status: PrayerStatus;
  createdAt: string;
}

export interface CreatePrayerRequestInput {
  name: string | null;
  phone: string | null;
  contactEmail?: string | null;
  requestText: string | null;
  audioPath: string | null;
  audioDuration: number | null;
  audioMimeType: string | null;
  audioSize: number | null;
  isAnonymous: boolean;
  isPrivate?: boolean;
}

export interface FinanceInput {
  id?: string;
  type: FinanceType;
  amount: string;
  currency: string;
  paymentMethod: string;
  reference: string;
  donorName: string;
  phone: string;
  notes: string;
  transactionDate: string;
}

export interface NewsInput {
  id?: string;
  title: string;
  content: string;
  imageUrl: string;
  published: boolean;
}

export interface EventInput {
  id?: string;
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime: string;
  location: string;
  imageUrl: string;
  published: boolean;
}

export type ActionResult =
  | { success: true; message?: string }
  | { success: false; message: string };
